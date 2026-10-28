**Covers 33 of the 412 reports merged into #4471.** Cause `hint`. A different bug from the parser one, with no ticket of its own until now.

## What goes wrong
The `booking-v3` form prints the hint `MM/DD/YYYY` under its date field. The tenant's people type what the hint tells them, month first, and the form then reads the value the tenant's way, day first. The date flips whenever the day is 1–12. Only booking-v3 tenants in day-first locales are hit, and only through the form (channel form ×33). Fixing the parser does not fix this; the form's hint (or the form's reading of it) must change.

## Reports
- 33 reports · 3 tenants · received 2026-04-17 → 2026-09-22
- intake tagged them as: hint ×18 · parser ×15 (the tag follows the browser locale, not the tenant)

| tenant | name | locale | form | reports |
|---|---|---|---|---|
| alder.physio | Alder Physio | de-DE | booking-v3 | 12 |
| copper.studio | Copper Studio | es-ES | booking-v3 | 11 |
| pale.harbour | Pale Harbour | pt-PT | booking-v3 | 10 |

## Examples
- R-41230 (copper.studio, form, 2026-04-17): "My client came on 1 June instead of 6 January. We sorted it out."
- R-41241 (alder.physio, form, 2026-04-21): "We had two people show up on 8 June. They were booked for 6 August."
- R-41251 (pale.harbour, form, 2026-04-25): "Wednesday 7 January showed as Wednesday 1 July. I moved it myself."

## Why it was hidden
Same subject lines as the parser reports, so decision 0001 merged them into #4471. The kb's `CauseTable` marks this group "not this ticket — no ticket of its own".

---
Source: `src/lib/data/reports-4471.json` in this repo (the desk's export of 2026-10-04), de-duplicated by report id (427 rows, 412 reports), grouped with the kb's own `causeOf` in `src/lib/kb/causes.ts`. The intake tag (`meta.intakeTag`) guesses from the reporter's browser locale and is not the cause.
kb page: https://github.com/Krznow/support-kb/blob/main/src/routes/kb/incidents/4471/what-it-shows/+page.svx