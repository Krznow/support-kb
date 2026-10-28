**Covers 379 of the 412 reports merged into #4471.** Cause `parser`.

## What goes wrong
The shared date parser in `sched-prod` reads every date month first. All our tenants write the day first (every tenant locale on file is day-first), so a booking on 7 April goes out as 4 July: day and month swap whenever the day is 1–12. Reports come through every channel (app ×204 · email ×150 · form ×25).

## Reports
- 379 reports · 11 tenants · received 2026-04-01 → 2026-10-04
- intake tagged them as: parser ×356 · hint ×23 (the tag follows the browser locale, not the tenant)
- channels: app ×204 · email ×150 · form ×25

| tenant | name | locale | form | reports |
|---|---|---|---|---|
| harbour.dental | Harbour Dental | en-GB | booking-v2 | 52 |
| kettle.books | Kettle Books | nl-NL | booking-v2 | 47 |
| nine.lanterns | Nine Lanterns | pl-PL | booking-v2 | 44 |
| morrow.tax | Morrow Tax | fr-FR | booking-v2 | 40 |
| long.table | Long Table | it-IT | booking-v2 | 39 |
| ridge.clinic | Ridge Clinic | da-DK | booking-v2 | 36 |
| stone.and.sons | Stone and Sons | en-IE | booking-v2 | 30 |
| lantern.row | Lantern Row | cs-CZ | booking-v2 | 28 |
| alder.physio | Alder Physio | de-DE | booking-v3 | 23 |
| pale.harbour | Pale Harbour | pt-PT | booking-v3 | 21 |
| copper.studio | Copper Studio | es-ES | booking-v3 | 19 |

## Examples
- R-41200 (harbour.dental, app, 2026-04-01): "Our 7 April reminder went out on 4 July. Is this a joke. It is not April Fools where we are."
- R-41201 (harbour.dental, app, 2026-04-01): "Sorry. 4 July went out on 7 April. I have been up since five."
- R-41202 (kettle.books, email, 2026-04-02): "Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee."

## Footnote: 5 reports read as a one-day move
The desk read 5 of these reports (R-41202, R-41209, R-41236, R-41344, R-41620, listed in `src/lib/data/desk-notes.json`) as a one-day shift, not a month flip (one of them: "Client in Lisbon got Tuesday. Client in Toronto got Monday. Same meeting. We held it twice."). Per the kb's convention they are counted here, where they are filed by tenant, and footnoted. Engineering should check them against the fix: a one-day move points at time zones, not the parser.

## Why it was hidden
#4471 was merged on subject line alone (decision 0001), so one ticket, "known", one fix queued. This is the ticket that fix belongs to.

---
Source: `src/lib/data/reports-4471.json` in this repo (the desk's export of 2026-10-04), de-duplicated by report id (427 rows, 412 reports), grouped with the kb's own `causeOf` in `src/lib/kb/causes.ts`. The intake tag (`meta.intakeTag`) guesses from the reporter's browser locale and is not the cause.
kb page: https://github.com/krznow/support-kb/blob/main/src/routes/kb/incidents/4471/what-it-shows/+page.svx