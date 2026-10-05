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
| `test-strengths.mjs` | CliftonStrengths as recorded: real theme names only, in order, up to ten, notes only beside themes in the list; nothing on the public roster, teammates only while shared, notes on the profile but not the directory; the server's 34 matching the page's — and strengths.js carrying names only, never descriptions or questions |
| `test-strengths-ui.mjs` | Adding a Gallup Top 5 in order with a note, the ten-theme limit, a teammate's Gallup themes under their GP Strengths with the matching GP strength beside each, both results compared on my GP results page, the Gallup credit, three Team-tab buttons fitting 320px, theme names staying English in Khmer |
| `test-kpi-guide.mjs` | kpiguide.js matches the KPI guide in help.html and every logged metric has a line; page and server agree that a score is 1–10 and a percentage 0–100 and counts/money have no edges; the server refuses out-of-range scores and percentages on the weekly and daily paths (saying which) while saving the good numbers beside them and never overwriting a good one; a day's count can still be negative; Outreach Teams untouched |
| `test-kpi-guide-ui.mjs` | The ⓘ beside each KPI: hidden until tapped, shows the guide's line, never loses a half-typed number, Khmer in Khmer; a 70 in a 1–10 box is caught before saving and a 7 saves; no ⓘ on Outreach Teams |
| `test-gpstrengths.mjs` | GP Strengths: 34 strengths in groups of 9/8/9/8 with all their words, no name shared with — or a variant of — a CliftonStrengths theme, or a personality type; each Gallup theme mapped to one GP strength in the matching group and order; 102 fair pairs (six each, three each side, cross-group, every other group met, no repeats, none back to back, each statement once); the server's copy matching; scoring and tie-break; the server computing the Top 5 itself; nothing public, only the Top 5 to teammates while shared |
| `test-bottom-bar.mjs` | The bottom bar on a phone: hidden while the keyboard is really up — a field that brings one up has focus (number, text, text area, dropdown — not tick boxes or buttons) and the visible area has shrunk — no flash moving between fields, back when the keyboard closes even with the field still focused, or if a re-render took the field away, and after turning the phone; computers unaffected; body clips sideways overflow with `clip` |
| `test-gpstrengths-ui.mjs` | Taking the free test a page at a time, leaving and carrying on, the stored Top 5 matching the answers, results (top 10 by group and all 34 for the owner, five for a teammate), sharing, the team map adding up GP Top 5s on this campus, a pair fitting 320px, the not-Gallup note, Khmer |
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
