# Tests

```sh
node tests/run-all.mjs          # everything
node tests/run-all.mjs server   # just the fast ones, no browser needed
```

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
| `test-rollups.mjs` | The dashboard maths — headcounts summed instead of levelled, OKR progress wrong |
| `test-jobfocus.mjs` | `jobfocus.js` and `help.html` drift apart |
| `test-khmer.mjs` | A string the code shows has no translation, the reviewed and pending dictionaries get merged, or Khmer overflows a label |
| `test-theme.mjs` | Dark mode, the three-state theme switch, and a WCAG AA contrast audit of every screen in both themes |
| `test-splash.mjs` | The launch splash: covers the dashboard hand-off, holds the real mark, always lets go, and stays identical in both pages |
| `test-frontdoor.mjs` | The front door: gate, guest with locked tabs, signed in, hand-off to the staff page |
| `test-chrome.mjs` | The dashboard flashes before the staff page, the boot coin goes hollow, or the chrome stops being padded for the notch and home indicator |
| `test-storage.mjs` | Khmer does not survive a reload, or blocked storage blanks the page / breaks login |
| `test-degraded.mjs` | A missing optional script kills a page instead of degrading |
| `test-base.mjs` | The Base tab or the weekly health form |
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
