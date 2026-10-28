// Writes the ticket (GitHub issue) texts for the problems in #4471 from the kb data, using the kb's own cause logic.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const KB = fileURLToPath(new URL('./src/lib/data/', import.meta.url));
const REPO = process.argv[2] || 'krznow/support-kb';
const PAGE = `https://github.com/${REPO}/blob/main/src/routes/kb/incidents/4471/what-it-shows/+page.svx`;
const reports = JSON.parse(fs.readFileSync(KB + 'reports-4471.json', 'utf8'));
const notes = JSON.parse(fs.readFileSync(KB + 'desk-notes.json', 'utf8'));
const tenants = new Map(fs.readdirSync(KB + 'tenants').map(f => { const t = JSON.parse(fs.readFileSync(KB + 'tenants/' + f, 'utf8')); return [t.handle, t]; }));
const DATE_HINT = { 'booking-v2': 'DD/MM/YYYY', 'booking-v3': 'MM/DD/YYYY' };
const dayFirst = loc => { const o = new Intl.DateTimeFormat(loc, { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(Date.UTC(2026, 0, 2, 12))).map(p => p.type); return o.indexOf('day') < o.indexOf('month'); };
const causeOf = (r, t) => { if (!t || !dayFirst(t.locale)) return null; return r.channel === 'form' && DATE_HINT[t.form].startsWith('MM') ? 'hint' : 'parser'; };
const uniq = [...new Map(reports.map(r => [r.id, r])).values()];
const merged = uniq.filter(r => r.mergedInto === 4471);
const groups = {};
for (const r of merged) (groups[causeOf(r, tenants.get(r.tenant)) ?? 'unplaced'] ||= []).push(r);
const count = (arr, f) => Object.entries(arr.reduce((m, r) => (m[f(r)] = (m[f(r)] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]);
const list = pairs => pairs.map(([k, n]) => `${k} ×${n}`).join(' · ');
const range = rs => { const d = rs.map(r => r.receivedAt.slice(0, 10)).sort(); return `${d[0]} → ${d.at(-1)}`; };
const tenantRows = rs => count(rs, r => r.tenant).map(([h, n]) => { const t = tenants.get(h); return `| ${h} | ${t.name} | ${t.locale} | ${t.form} | ${n} |`; }).join('\n');
const sample = (rs, n = 3) => rs.slice(0, n).map(r => `- ${r.id} (${r.tenant}, ${r.channel}, ${r.receivedAt.slice(0, 10)}): "${r.body}"`).join('\n');

const P = groups.parser, H = groups.hint;
const oneDay = P.filter(r => notes.oneDayMove.includes(r.id));
const common = `
---
Source: \`src/lib/data/reports-4471.json\` in this repo (the desk's export of 2026-10-04), de-duplicated by report id (${reports.length} rows, ${uniq.length} reports), grouped with the kb's own \`causeOf\` in \`src/lib/kb/causes.ts\`. The intake tag (\`meta.intakeTag\`) guesses from the reporter's browser locale and is not the cause.
kb page: ${PAGE}`;

fs.mkdirSync('tickets', { recursive: true });
fs.writeFileSync('tickets/parser.title.txt', `Shared date parser reads day-first dates month-first (sched-prod) — ${P.length} reports in #4471`);
fs.writeFileSync('tickets/parser.md', `**Covers ${P.length} of the ${merged.length} reports merged into #4471.** Cause \`parser\`.

## What goes wrong
The shared date parser in \`sched-prod\` reads every date month first. All our tenants write the day first (every tenant locale on file is day-first), so a booking on 7 April goes out as 4 July: day and month swap whenever the day is 1–12. Reports come through every channel (${list(count(P, r => r.channel))}).

## Reports
- ${P.length} reports · ${new Set(P.map(r => r.tenant)).size} tenants · received ${range(P)}
- intake tagged them as: ${list(count(P, r => r.meta.intakeTag))} (the tag follows the browser locale, not the tenant)
- channels: ${list(count(P, r => r.channel))}

| tenant | name | locale | form | reports |
|---|---|---|---|---|
${tenantRows(P)}

## Examples
${sample(P)}

## Footnote: ${oneDay.length} reports read as a one-day move
The desk read ${oneDay.length} of these reports (${oneDay.map(r => r.id).join(', ')}, listed in \`src/lib/data/desk-notes.json\`) as a one-day shift, not a month flip (one of them: "${oneDay[3].body}"). Per the kb's convention they are counted here, where they are filed by tenant, and footnoted. Engineering should check them against the fix: a one-day move points at time zones, not the parser.

## Why it was hidden
#4471 was merged on subject line alone (decision 0001), so one ticket, "known", one fix queued. This is the ticket that fix belongs to.
${common}`);

fs.writeFileSync('tickets/hint.title.txt', `booking-v3 form prints MM/DD/YYYY under the date field for day-first tenants — ${H.length} reports in #4471`);
fs.writeFileSync('tickets/hint.md', `**Covers ${H.length} of the ${merged.length} reports merged into #4471.** Cause \`hint\`. A different bug from the parser one, with no ticket of its own until now.

## What goes wrong
The \`booking-v3\` form prints the hint \`MM/DD/YYYY\` under its date field. The tenant's people type what the hint tells them, month first, and the form then reads the value the tenant's way, day first. The date flips whenever the day is 1–12. Only booking-v3 tenants in day-first locales are hit, and only through the form (channel ${list(count(H, r => r.channel))}). Fixing the parser does not fix this; the form's hint (or the form's reading of it) must change.

## Reports
- ${H.length} reports · ${new Set(H.map(r => r.tenant)).size} tenants · received ${range(H)}
- intake tagged them as: ${list(count(H, r => r.meta.intakeTag))} (the tag follows the browser locale, not the tenant)

| tenant | name | locale | form | reports |
|---|---|---|---|---|
${tenantRows(H)}

## Examples
${sample(H)}

## Why it was hidden
Same subject lines as the parser reports, so decision 0001 merged them into #4471. The kb's \`CauseTable\` marks this group "not this ticket — no ticket of its own".
${common}`);
console.log('parser', P.length, 'hint', H.length, 'unplaced', (groups.unplaced || []).length, 'oneDay', oneDay.length);
