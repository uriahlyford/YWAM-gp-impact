# Tests

```sh
node tests/run-all.mjs          # everything
node tests/run-all.mjs server   # just the fast ones, no browser needed
node tests/run-all.mjs browser  # just the Chromium ones
```

**CI runs this on every pull request and on every push to `main`**
(`.github/workflows/tests.yml`) as two required checks, `server tests` and
`browser tests`. That matters here because a merge to `main` deploys straight to
the base's live app — there is no staging step between it and every staff member's
phone. Run the suite locally anyway; CI is the backstop, not the plan.

One trap the workflow guards against: `run-all.mjs` deliberately *skips* the
browser half when Playwright is missing and still exits 0, so in CI that would be
a green tick over an untested app. The browser job asserts Playwright imported
before it trusts the result, and pins `GP_CHROMIUM` to the binary it installed so
a runner image shipping its own Chromium cannot quietly change what we test
against.

Two kinds of test, and the split matters:

**Server tests** import the real `netlify/functions/api.js` and give it a fake
`@netlify/blobs` built in a temp directory, so they exercise the actual handlers
with no network, no Netlify account and nothing to install. They run in seconds.
If you only touched the API, `run-all.mjs server` is the whole check.

**Browser tests** drive the real pages in Chromium with every API call
intercepted, so the fixtures are explicit and no page ever talks to production.
They need `playwright` — without it `run-all.mjs` skips them and says so rather
than failing. Chromium is found automatically at the usual locations; set
`GP_CHROMIUM` to point somewhere else.

| File | What breaks if it fails |
|---|---|
| `test-library.mjs` | The Library's books (public/library.js): four shelves, unique ids, every field a page draws, 5–7 insights and 3 things to try, a five-minute length, valid ISBN-13 check digits, no long quotations |
| `test-library-ui.mjs` | Menu → Library: the books load only when opened; every book on the shelf with its cover (a stand-in for Open Library) or a drawn one; shelves filter; a book page with every part; Mark as read sticks and shows on the shelf; Next book; covers blocked leaves nothing broken; Khmer at 320px; a failed load offers Try again |
| `test-firstrun.mjs` | A brand-new base, a junk blob or a malformed request takes the whole app down with a 500 |
| `test-boot.mjs` | A page open costs more than one function invocation — Netlify bills these |
| `test-week-auth.mjs` | Health answers stop being anonymous in base averages, or reach someone other than your one mentor |
| `test-okr-auth.mjs` | Someone can write objectives outside their own campus and department |
| `test-year.mjs` | A new year overwrites last year's figures, legacy rows lose their history, or anyone can POST numbers for any campus |
| `test-goals.mjs` | Goal percentages, and whether goals ticked before the change still read as 100% |
| `test-rollups.mjs` | The dashboard maths — headcounts summed instead of levelled, OKR progress wrong, or a key result whose target has already been passed stops saying so |
| `test-jobfocus.mjs` | `jobfocus.js` and `help.html` drift apart |
| `test-stafftype.mjs` | The staff breakdown: kind of staff and home country stored, carried on the roster, counted the same on both pages — and country spellings folding to one name |
| `test-habit-config.mjs` | A habit-picker change the server refused stays on the grid, so a later tap is cleaned away against the config the server actually holds and its answer takes the tile out from under your finger — the "it selects another one" report |
| `test-read-your-writes.mjs` | A save answers with a stale read instead of what it just wrote. The store's reads lag its writes here, because Blobs has no compare-and-swap — so a handler that ends by calling its matching read function can describe the data as it was BEFORE the write, and the client paints the old value back. Covers thirteen write paths, and that a request's scope does not outlive it |
| `test-personality.mjs` | A personality type leaks somewhere it should not. The public no-PIN roster must carry none of it; a teammate sees a type only while its owner shares it; a season ("a stretched season") never leaves its owner's own view; and the server refuses a type and bars that contradict each other. Also that personality.js and api.js agree on the type and season lists, and that agreeing with every statement does not produce a type |
| `test-weekly-health-only.mjs` | Saving days (habits or the old hours/mood fields) writes no survey row however many are logged; an old rolled-up row is left as it was; the weekly check-in still scores a week and replaces it |
| `test-home-layout-ui.mjs` | My Home reorganised: the sections in order with no Health or My Ministry below the large summary card (which has both, and its photo option); no quick-jump strip; Updates three with See all; Weekly Goals with a Last week / This week switch that switches, no arrows, no Share my week; Annual goals folded and opening; no "You're mentoring" for a non-mentor; the tiles and where they go; 320px Khmer |
| `test-team-personality-ui.mjs` | Team → Personalities: how many have shared a type; the four groups; each pair's lean or "evenly mixed"; who has which type; sharing off means not counted or named; no season; fine print; a ministry, a department, the other campus; the four view buttons fit; Khmer at 320px |
| `test-weekly-health-home-ui.mjs` | My Home's health: this week's weekly score when answered (same figure up top), last week's with a button to answer until then, nothing for a week only rolled up from days; no "This week" totals, days-logged count or daily check-in; the Habit Tracker stays and a tap scores nothing |
| `test-archive-many.mjs` | Archiving a group (hrArchiveMany): admin or HR only; never yourself (the whole call refused); empty or over 200 refused; date, reason and who on each, active off, in one write of the staff list; already-archived left exactly as they were; archived can't log in; unarchive one at a time |
| `test-groups-ui.mjs` | Admin → Arrivals & departures: the invite link carries campus / department / ministry; opening it shows the sign-up form with them chosen and says so; signing up makes the person's own account there; a bogus link is the plain form; archiving several by search and Select all shown, with a confirm step, the reason kept and the rest untouched |
| `test-loose-ends.mjs` | Admin → Loose ends, server: only an admin reads it; markSeen records the day only, once a day, and the boot still writes nothing; the last week with numbers per ministry this year (blank values and other years ignored), numbers people, last-seen dates, this quarter's objectives with their latest edit and whether numbers feed them; nothing private |
| `test-loose-ends-ui.mjs` | Admin → Loose ends on the page: the admin's campus and a count; nobody set / someone no longer active; no numbers for three weeks; not seen in 30 days (not yesterday's, inactive or another campus's); no department or ministry; no mentor; untouched objectives (not number-fed or fresh ones); long lists fold at five; taps through to a person and a ministry; the other campus; before 30 days of counting; opening the app marks the day |
| `test-backup.mjs` | The nightly backup: every key copied byte for byte, dated by Phnom Penh's day; unchanged content stored once; thirty nights kept and only the objects they use; a by-hand snapshot leaves "Last backup" alone; a failed night keeps the last good run and says why; restoring is a dry run until told, snapshots first, touches only what differs, refuses keys the night lacked; the boot gives an admin the run's time and counts only, nobody else anything |
| `test-fast-open-ui.mjs` | With a slow server: the kept copy draws at once marked Updating…; a call made meanwhile is held and goes out after the fresh boot; the fresh data replaces the copy; a refused PIN ends at the login with the copy deleted and the held call never sent |
| `test-offline-open-ui.mjs` | With the worker on and the connection really cut: the page and its last boot kept; online, a new version always wins over the copy; offline, My Home opens with the "No connection" line on every screen; ministry numbers queue, show at once, and a second save to the same week merges; back online they reach the server and the page boots again by itself; another person's copy never shown; logging out deletes it |
| `test-backup-real.mjs` | The same backup and restore against the real @netlify/blobs and its local server — the fake once hid that a slashed list prefix answers nothing there (browser half, for the install; no browser) |
| `test-backup-ui.mjs` | Admin home's "Last backup" line; the bell warning an admin, and nobody else, when a night is missed or failed; "Open Admin" from the bell; before the first run; Khmer |
| `test-dept-pulse.mjs` | The department pulse: only the department's leader, the Campus Director and admins see it; headcount and who is away (approved leave, no reasons); health as two numbers only — no score under three, the dashboard's own maths (`compositeOf_` vs taxonomy), nothing of a check-in leaving the server; 1-on-1s this month; numbers in; staff debt entered only by Finance, stored as `Staff Debt ($)` and shown with who entered it; the Campus Director's quarterly scores |
| `test-dept-pulse-ui.mjs` | A department leader's page leading with six figures and nothing to type above the ministries' list; Finance entering staff debt and the leader seeing it; the Campus Director's four departments and quarterly check-in (a 70 caught, a 7 saved for the quarter); ordinary staff seeing none of it |
| `test-numbers-people.mjs` | Numbers people: only the ministry's leader, its department's overseer or an admin may set them; same-campus people, two different people, a backup only with a main, clearing falls back to the leaders; none for Outreach Teams or Campus Leadership rows; My Ministry's data carries the people, whether the viewer may change them, and who last entered each week (weekly and daily saves); the boot's reminder data for the main person, the backup, a leader by default, and a department overseer's done / not done list |
| `test-numbers-people-ui.mjs` | With the clock fixed to the week's Tuesday/Friday/Saturday: the numbers card first on My Ministry with whose job, when due and how far along, boxes open for an empty week; Friday's "due today" in the bell and on My Home, gone once entered; Saturday's "overdue", and last week's until it is in; the leader choosing the main person and backup; the department leader's list in the bell and on their page |
| `test-kpi-guide.mjs` | kpiguide.js matches the KPI guide in help.html and every logged metric has a line; page and server agree that a score is 1–10 and a percentage 0–100 and counts/money have no edges; the server refuses out-of-range scores and percentages on the weekly and daily paths (saying which) while saving the good numbers beside them and never overwriting a good one; a day's count can still be negative; Outreach Teams untouched |
| `test-kpi-guide-ui.mjs` | The ⓘ beside each KPI: hidden until tapped, shows the guide's line, never loses a half-typed number, Khmer in Khmer; a 70 in a 1–10 box is caught before saving and a 7 saves; no ⓘ on Outreach Teams |
| `test-gpstrengths.mjs` | GP Strengths: 34 strengths in groups of 9/8/9/8 with all their words, no name shared with — or a variant of — a CliftonStrengths theme, or a personality type; 102 fair pairs (six each, three each side, cross-group, every other group met, no repeats, none back to back, each statement once); the server's copy matching; scoring and tie-break; the server computing the Top 5 itself; nothing public, only the Top 5 to teammates while shared |
| `test-bottom-bar.mjs` | The bottom bar on a phone: hidden while the keyboard is really up — a field that brings one up has focus (number, text, text area, dropdown — not tick boxes or buttons) and the visible area has shrunk — no flash moving between fields, back when the keyboard closes even with the field still focused, or if a re-render took the field away, and after turning the phone; computers unaffected; body clips sideways overflow with `clip` |
| `test-gpstrengths-ui.mjs` | Taking the free test a page at a time, leaving and carrying on, the stored Top 5 matching the answers, results (top 10 by group and all 34 for the owner, five for a teammate), sharing, the team map adding up GP Top 5s on this campus, a pair fitting 320px, no mention of CliftonStrengths or Gallup anywhere on screen, Khmer |
| `test-personality-ui.mjs` | The personality screens, on the real backend: a half-done test surviving a reload, Next shut until a page is answered, seven circles fitting 320px, a picked type showing no bars it never measured, a teammate's page without their season, the directory using a character only for people who share and never over a photo — and the questions reaching the screen in Khmer |
| `test-habit-stale.mjs` | A habit tap gets undone by the app itself. The store's reads lag its writes on purpose here, because Blobs has no compare-and-swap and a read straight after a write can serve the older version — so a handler that answers by re-reading describes the day as it was BEFORE the tap, and the tile unticks itself. Asserts both halves: the server answers from the rows it just wrote, and the client keeps the person's own tap when an answer disagrees. Also that a save the server really refused still puts the tile back and says so |
| `test-number-entry.mjs` | A number box comes up holding a 0 nobody typed, or tapping one puts the caret beside the figure so "5" becomes "05". Focus selects the contents, so the first keystroke replaces — checked against a saved zero, a saved figure and a carried level, on both pages. Also that a *second* tap still edits in place, because always-select-everything would make correcting one digit of a bank balance impossible |
| `test-touch-scroll.mjs` | A touch-action rule turns a control into a dead band the page will not scroll from — or a swipe past a slider answers a health question and saves a goal percentage nobody set. Reads the rules off computed style and drives the guard from the event sequence a real touch produces, because whether a *dispatched* touch scrolls at all turned out to depend on the Chromium build |
| `test-pull-drill.mjs` | The pull coin stops turning as you drag, the two pages stop offering the same breakdowns, or a tappable number stops looking tappable |
| `test-khmer.mjs` | A string the code shows has no translation, the reviewed and pending dictionaries get merged, or Khmer overflows a label |
| `test-theme.mjs` | Dark mode, the three-state theme switch, and a WCAG AA contrast audit of every screen in both themes |
| `test-splash.mjs` | The launch splash: covers the dashboard hand-off, holds the real mark, always lets go, and stays identical in both pages |
| `test-frontdoor.mjs` | The front door: gate, guest with locked tabs, signed in, hand-off to the staff page |
| `test-chrome.mjs` | The dashboard flashes before the staff page, the boot coin goes hollow, or the chrome stops being padded for the notch and home indicator |
| `test-storage.mjs` | Khmer does not survive a reload, or blocked storage blanks the page / breaks login |
| `test-degraded.mjs` | A missing optional script kills a page instead of degrading |
| `test-base.mjs` | The Base tab or the weekly health form — and whether a key-result target set below what the ministry already logs is called out both in the editor and on the card. Its drift checks report through `process.exitCode`, so the final `process.exit` must not overwrite them |
| `test-ministry-kpis.mjs` | My week's ministry cards: every KPI present, counts saved per day and levels per week, headcounts carried forward, and a level never written as a daily row |
| `test-mentor-health.mjs` | A mentor can no longer see their mentee by name |
| `audit-load.mjs` | Invocations per page open, and duplicate PIN verification |
| `audit-paint.mjs` | First paint regresses — usually a render-blocking stylesheet |
| `audit-allviews.mjs` | A console error on any screen of either page |
| `check-nav.mjs` | The bottom tabs wrap or overflow at 320px |

## Adding one

Import paths from `env.mjs` — never hardcode a directory. `tmpDir(name)` gives a
clean scratch directory; `tmpDir('out')` is the one place for screenshots and is
not wiped between tests. Add the file to the `SERVER` or `BROWSER` list in
`run-all.mjs` with a one-line comment saying what it protects.

A test that passes both before and after a fix is not testing the fix. Run it
against a deliberately broken copy of the page or handler and watch it fail
first — several of the assertions here were rewritten after doing exactly that
revealed they were passing for the wrong reason.
