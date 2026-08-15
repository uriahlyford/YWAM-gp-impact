# GonPreah (GP) Impact App

A mobile-first, bilingual (Khmer-first) web app for YWAM GonPreah (កូនព្រះ), Cambodia.
It tracks ministry KPIs, OKRs, a weekly staff health check-in, and per-staff daily
logging across the Poipet and Siem Reap campuses.

## Architecture (single deploy target)
Everything lives in this repo and deploys as one Netlify site — push to `main`,
Netlify builds and goes live. No Google Apps Script, no Google Sheet, no separate
shell/app split. (Previously the app ran as an Apps Script web app wrapped in a
Netlify iframe "shell" — that setup is retired; see git history if you need it.)

- **`public/`** — the static frontend, served directly by Netlify (`netlify.toml`:
  `publish = "public"`).
- **`netlify/functions/api.js`** — the backend, a single Netlify Function replacing
  `Code.gs`. One POST endpoint (`/.netlify/functions/api`) dispatched by a `{fn, args}`
  body through the `HANDLERS` map, same function names/signatures the frontend already
  expects. No RPC marshalling quirks (unlike `google.script.run`, this is a plain `fetch`).
- **Storage: Netlify Blobs** (`@netlify/blobs`, store `"gp-data"`), one JSON array per
  former "sheet": `entries`, `okrs`, `survey`, `staff`, `dailyLogs`, plus a `loginThrottle`
  map. Read-modify-write, no locking — an accepted trade-off at this team's scale.

## Files
### public/
- `index.html` — leadership dashboard (KPIs, OKRs), and the app's front door. Four tabs:
  Dashboard, Log Numbers, OKRs, Programs — **Health moved to the staff page** (see below). Has weekly ▲/▼ trend badges, a spinning-logo "Impact Loading" state,
  click-through drill-down on dashboard totals, and the ✦ Teams / 📖 buttons (plain
  page nav now, not postMessage). Calls the backend via the `apiCall(fn, args)` helper.
- `teams.html` — per-staff space ("My GP"), five tabs: **Base · My week · Team · Me · Health**.
  Username + 4-digit PIN, profile + photo, daily logging, streaks, mentor view +
  mentor-request approval, days away from campus. `?reg=1` opens the create-profile form
  directly (the front door links straight to it).
  **Base leads on purpose** — signing in shows who you are and then how the base is doing,
  not a to-do list. The personal cards live on My week. Base fetches `getData` with an
  empty leader code, so the two money metrics leadership can see never reach it.
  Base now carries **the whole dashboard**, section for section: your profile card on top,
  then the hero, salvations by department, both school groups, outreach, churches, the
  gospel totals, media, base health and the department explorer. A test asserts Base and
  the dashboard render the same section list, so the two can't quietly drift apart.
  **OKRs belong to a person, not to a tab.** `okrSectionHtml(who, mine)` renders one
  person's objectives, framed as a job description: that ministry's focus (from
  `jobfocus.js`) on a black card, then the objectives for **their department** — the only
  handle the OKR data gives on "whose objective is this", and the right one. It appears
  twice: on **Me** (your own) and on a **teammate's page** when you tap them in Team
  (theirs). Neither shows the rest of the base's objectives — these pages are about one
  person's work. Key results tied to a KPI show the quarter's real figure against the
  target, so it is visible the number came from what the ministry logged — nothing to type.
  🎯 means "objectives" throughout, which is why weekly goals use 🗒️.
  **Your own are editable, a teammate's are not.** On Me you can add, edit and delete
  your department's objectives, and type the percentage for a key result that has no KPI
  behind it (the only kind with a box — the rest are answered by what the ministry logs).
  A teammate's page has no controls at all.
- `logo.js` — the two brand marks as base64 data URIs, shared by both pages:
  `GP_LOGO_WIDE` (259×108 header wordmark) and `GP_LOGO` (the square mark that spins in
  the loading coin and pull-to-refresh). **Never regenerate these blobs** — they are the
  real assets. Both marks are white, drawn for the black header, so on the paper
  background they need a dark coin behind them or they vanish.
- `km.js` — the Khmer dictionary, shared by all three pages. **Two objects, and the
  split is load-bearing:** `REVIEWED_KM` (266 entries, checked by native speakers) and
  `PENDING_KM` (~302, translated by Claude at Uriah's explicit request and **not yet
  reviewed**). `BUILTIN_KM` merges them with reviewed last, so a checked string always
  beats a pending one. Never collapse them into one object — that would permanently
  lose track of what a human has actually read. As each string is checked, move it up
  into `REVIEWED_KM`; that is the whole workflow.
- `jobfocus.js` — `JOB_FOCUS` / `jobFocus(dept, ministry)`: what each of the 28 ministries
  is for, in one paragraph — the "job description" the OKRs tab is built around. Extracted
  verbatim from `help.html`, which still carries the same paragraphs inline so it needs no
  script to render. **Two copies, so they can drift** — a test compares them and also
  asserts every ministry in the taxonomy has a focus written for it. Edit one, edit both.
  Lookups take the department because Base Leadership's "ministries" are named after the
  departments they oversee.
- `taxonomy.js` — campuses, departments, ministries, metric lists, `modeOf()`, `compositeOf()`
  and the ministry emoji, shared by both pages.
- `programs.js` — the four project agreements with the Ministry of Education, Youth and
  Sport (SVI, YDC, YLT, YAP) and the shape of the records each one reports on:
  `GP_PROGRAMS`, `GP_RECORD_FIELDS`, `gpProgramSummary()`, `gpProgramGoal()`. The forms,
  the validation and (eventually) the report generator all read this, so **a field added
  here appears in the form and is accepted by the server** — but only if it is added to
  `RECORD_FIELDS`/`NUMERIC_FIELDS` in `api.js` too. `test-programs.mjs` compares the two
  lists; the function bundle cannot import the frontend's globals, which is why there are
  two copies at all. Loaded `data-optional`: if it fails to arrive the Programs tab is
  simply not offered.
- `rollup.js` — **the roll-up engine: the maths behind every dashboard figure.**
  `gpRollup({entries, survey, roster, week})` returns the read-only questions
  (`headlineFor`, `ministryRollup`, `healthScore`, `totalStaff`, `trendFor`, `drillRows`,
  `objProgress`, …) plus the pure globals `aggregate`, `lastBefore`, `fmt`, `qOf`,
  `addKnown`, `trendBadge`.
  It also owns **the drill-down sheet** — the only part of the file that touches the DOM.
  `gpDrillAttrs(metric, ids, dept, ministry, quarter)` on an element makes that figure
  tappable; `gpBindDrill(R)` after a render wires them all; the sheet lists every ministry
  that fed the total with its week-by-week values. Both pages use it, so a number means
  the same thing and opens the same way wherever it appears. It mounts itself (`#ddRoot` is
  created if absent), needs only `t()` and `CAMPUSES` from the page, and each page supplies
  its own `.dd*` CSS. Figures with no single source — a school count derived from several
  metrics, a health score built from check-ins — are deliberately left un-tappable rather
  than opening an empty sheet.
  index.html keeps thin one-line wrappers over it (`R().headlineFor(...)`) so its call
  sites read unchanged; teams.html builds its own instance for the Base tab. **Change a
  roll-up rule here and it changes for both pages — that is the point.** `week` is passed
  in because the two pages compute "this week" differently (index counts from the Monday
  of week 1, teams mirrors the API's ISO week); the engine only uses it to bound trends.
- `help.html` — bilingual clickable KPI guide (job focus + KPI explanations per ministry).
- `manifest.json`, `icon-180.png`, `icon-512.png` — PWA assets. **The icons are
  placeholders** (cobalt circle + "GP" wordmark) — swap in real ones when available.

### netlify/functions/api.js
Handlers: getMyBoot, getData, saveEntries, saveObjective, deleteObjective, teamRoster,
staffRegister, staffLogin, updateProfile, changePin, uploadPhoto, saveDaily, getMyLogs,
getMyMentees, getMenteeLogs, getMyMentorRequests, respondToMentorRequest,
getMyWeekly, saveMyWeek, deleteMyWeek, saveGoals, saveMyHabits, getMyMinistry,
saveMyMinistry, saveMyKpiDay, staffProfile, getMyTrips, requestTrip, respondToTrip,
getTripRequests, getPrograms, saveProgramRecord, deleteProgramRecord. No `translateBatch` equivalent (was `LanguageApp.translate`, not
available outside Apps Script) — Khmer strings machine-translation fallback is gone;
all Khmer must come from `BUILTIN_KM` or be added by hand.

**Netlify bills invocations, so a page open is one call.** `getMyBoot(username, pin)`
returns everything the staff page needs and `getData` carries the roster for the
dashboard. Both pages open on exactly one invocation — `audit-load.mjs` asserts that,
and it is the number to watch when adding a feature: a new `run()` on boot is a new
bill on every open, for every staff member, every day. Prefer widening `getMyBoot`.
`getMyBoot` deliberately does *not* fail as a unit — each section is caught on its own,
so a bad trips read cannot cost someone their base figures — and it returns
`{ok:false, err:'auth'}` for a bad PIN specifically, because only that should log
somebody out. A plain `!ok` used to, which meant a server hiccup signed people out.

**Every dated row carries a `year`, and reads are scoped to one.** Rows used to hold a
week number and nothing else, so week 33 of 2027 would have landed on top of week 33 of
2026 — summed metrics doubling, `latest` metrics silently replaced, last year gone. The
year is resolved at the API boundary and never leaves it: `getData(code, year)` filters
to one year and returns which one it used, so **`rollup.js` and both pages still work on
plain week numbers** exactly as before. Only `api.js` knows years exist.
`yearOf_(row)` is the single place that question is answered, and it takes the best
evidence available in order: an explicit `year`, the row's own `date` (kpiDaily and
dailyLogs carry one), its `updated` stamp, then `GP_LEGACY_YEAR`.
**Set `GP_LEGACY_YEAR` in the Netlify environment to the year the existing data was
collected in.** Rows written before this change have no year, and it cannot be recovered
— only inferred — so this is an *assignment*, not a recovery. Left unset it defaults to
the current year, which silently drags all the old data forward every January.

**Writing ministry numbers needs a name.** `saveEntries` took any POST at all: the front
door gated the form in the UI and the endpoint checked nothing, so anyone with the URL
could rewrite any campus's figures. It now needs either the leadership code (any campus,
as before) or a username + PIN (**that person's own campus only** — the campus lock
Uriah asked for). Nobody lost access: reaching that form has required an account since
the front door was added. A staff record with no campus is refused rather than guessed at.

**A bad blob must not take the app down.** `readJSON(key, fallback)` checks the value's
shape against the fallback (array for the row stores, object for `loginThrottle`) and
returns the fallback when it does not match. Every read handler used to pass whatever
was there straight to `.forEach`/`.findIndex`, so one malformed blob answered 500 for
every user at once. `saveMyMinistry` currently has no caller — it is a safe,
self-scoped write left in place, not a live path.

**`saveMyWeek`/`deleteMyWeek` bound weeks to 1-52**, matching `saveEntries` and both
week pickers. They allowed 53, which no screen can offer or read back, so such a row
would sit in the base average invisible to the person who wrote it. Weeks carry no
year anywhere in the store — see "Known limits" below.

**Enter each number once.** Two rules matter here:
- **Weekly health has two ways in, and one row.** The eleven questions are a form on
  the Health tab (`saveMyWeek`) — the primary path, because daily logging proved
  unsustainable. `syncWeekSurvey_` still derives a week from daily logs at the end of
  `saveDaily` for anyone who logs them (thresholds `WEEK_EXERCISE_RATE` /
  `WEEK_QUIETTIME_RATE`; yes/no fields are "did this happen at all this week", 1-10
  scales average the days logged). **Both write the same row**, keyed by the person's
  `surveyToken` — one per person per week, so they cannot double-count — and **a week
  answered by hand wins**: the sync leaves `source:'weekly'` alone. See "Health lives
  on the staff page" for who is allowed to read it.
- **Ministry KPIs** are typed per day into the `kpiDaily` blob; `saveMyKpiDay` then
  recomputes that week's figure into `entries` (the array the dashboard reads) using
  the metric's own sum/latest/avg rule. Correcting Tuesday only changes Tuesday.
  The aggregation rule lives in the frontend taxonomy, so the client sends it and the
  server validates it's one of the three — a wrong mode can only misaggregate that
  ministry's own metric.
  **Consequence to know:** for a ministry+week that has daily rows, those days are
  the source of truth. A leader editing the same weekly cell on the dashboard will
  be overwritten the next time someone logs a day for it.

## Deploy rules — do not break
- **Netlify:** push to `main` → auto-deploy (GitHub integration on the `transcendent-crostata-c9b7f4`
  site). `netlify.toml` sets `publish = "public"` and `functions = "netlify/functions"`.
  Nothing else to run by hand.
- **Leadership gate:** `isLeader_` in `api.js` checks the caller's code against
  `process.env.GP_LEADER_CODE` and fails closed — no hardcoded fallback, since this
  repo is public and a literal in source would be a permanently known password. Gates
  reads of `SENSITIVE` metrics. If the env var is ever missing, leader access is off for
  everyone until it's restored.
- **OKR writes have two doors** (`okrWriter_`): the leader code writes any objective, and
  a signed-in staff member (username + PIN) writes **their own campus and department
  only**. Two things make that a real boundary rather than a hopeful one — the campus and
  department are taken from the **staff record**, never from the payload, so a crafted
  request cannot claim another department; and an existing objective is only writable if it
  already belongs to that campus and department, so an id cannot be used to hijack another
  team's. 13 checks in the test suite cover it against the real handler.
  **Consequence to know:** this is department-level, so any staff member in a department
  can edit or delete that department's objectives — there is no per-person ownership,
  because the OKR record has no owner field. Narrowing it (to department leaders only, or
  per-ministry objectives) means adding a field to the record and to the dashboard's form.
- **One-time migration handler removed.** The Google-Sheet-to-Blobs migration used a
  secret-gated `adminSeed` handler in `api.js`; it's been deleted now that the migration
  is done. Never commit real staff/survey data (PIN hashes, photos, health-survey
  answers) to this repo — if a future migration needs it again, write a throwaway
  handler, use it once, and delete it.

## Conventions / must-preserve
- **Khmer-first.** Khmer is never smaller/lighter than English. All KPI/ministry/department
  NAMES come from the reviewed `BUILTIN_KM` dictionary in `public/km.js`.
- **Khmer prose needs human review** (native speakers Sreilea / Leakha). The rule used
  to be "never machine-translate into km.js"; Uriah asked for the backlog to be
  translated anyway, having been told what that trades away, so the rule is now
  narrower and stricter about where things go: **never put an unreviewed string into
  `REVIEWED_KM`.** New strings go into `PENDING_KM`, and move up only once a native
  speaker has read them. `docs/khmer-needed.md` is the review checklist, with notes on
  how each string is used — several are labels with very little room, and a few are
  promises the app makes about privacy, which are worth checking first.
- **A translation nobody can see is not a translation.** `t()` falls back to the English
  key, so a `t('...')` whose string is missing from the dictionary renders English and
  nothing complains. Worse, a *literal* that was never wrapped in `t()` at all can never
  be translated. `test-khmer.mjs` walks the source for both cases and fails on either —
  it is what found ~50 strings the hand-written backlog had missed, and it catches
  `t(cond ? 'a' : 'b')`, which a naive scan does not.
- **Never regenerate the base64 blobs in `logo.js`** — they are the real brand assets, not
  placeholder art. Edit in place; don't "tidy" or re-encode them.
- Uploaded files from macOS TextEdit may arrive as RTF — convert to plain text first.
- Brand: Paper #FAF6F0, Ink #17150F, Cobalt #1F44FF, Marigold #FFB323. Fonts: Koulen +
  Kantumruy Pro (Khmer), Archivo + Hanken Grotesk (Latin). Motif: ✦ spark.

## The front door (index.html)
Anyone not signed in, who hasn't chosen to browse as a guest, gets a welcome screen
first: **Create my profile** → `teams.html?reg=1`, **I already have a profile** →
`teams.html`, or **View as guest** (sets `sessionStorage['gp-guest']`, lasts the
browser session). It renders before the data arrives, so the dashboard never flashes
behind it.

Guests get every reading screen. The two writing views — **Log Numbers** and
**Health** — show a "this part needs an account" panel instead of the form, and carry
a 🔒 in the tab bar. Locked tabs stay visible on purpose: a guest should see what an
account would get them.

**This is a UI gate, not a server one.** `saveEntries` in `api.js` still accepts an
unauthenticated POST. It stops the accident — a number logged by nobody, against
nobody's campus — not a determined person. Closing it properly means passing staff
credentials into `saveEntries` and checking them server-side.

**Campus is a default, not yet a lock.** `saveStaffCard` records your campus and the
dashboard opens on it (`myCampus()`), so a Siem Reap staff member doesn't land on
Poipet's log form. Still switchable — reading across campuses is normal. The hard
lock ("you may only log your own campus") waits until everyone has an account;
until then it would shut real people out.

## Health lives on the staff page
The weekly health section sits on My GP's **Health** tab. Reading order: **my
check-in** for the chosen week, **against last week** question by question, **my
weeks** (every week I've answered, newest first), then **the base average** my week
feeds — score for the week and YTD, check-in rate, and the per-question averages
and shares.

**Weekly entry is the primary path.** Daily logging proved unsustainable, so the
eleven questions are a form again — `saveMyWeek` in `api.js`, filled in on the
Health tab. It writes to the **same survey row the daily roll-up would have
written**, keyed by the person's `surveyToken`: one row per person per week, so the
two paths cannot double-count anybody. Daily logging still works for anyone who
does it, and `syncWeekSurvey_` still derives a week from days — but **a week
answered by hand wins**: the sync leaves a row with `source:'weekly'` alone,
because a deliberate answer beats an inference from however many days got logged.
Each week's tag says which way it was answered.

**Who sees what — the token is the whole mechanism.** Survey rows carry a token and
never a name, so anything pooled base-wide is anonymous *by construction*, not by
policy. Only the person's own staff record maps that token back to them, and
`getMenteeLogs` is the one place that join happens — so their **ONE approved
mentor** sees their answers with their name on them, and nobody else does.
Leadership reads the base total; it never reads an individual's answers. A
teammate's page (`staffProfile`) carries no health answers at all. 15 checks cover
this against the real handler, including that a non-mentor and a *pending* mentor
request are both refused, and that `getData` survey rows are nameless.

**Consequence to know:** the dashboard has no per-question health breakdown and no
all-campuses view of it — a staff member's Health tab shows their own campus. The
base health *score* is still on the dashboard hero and on Base. The anonymous
device survey is gone for good: it was keyed by a random device id rather than a
person, so it could neither be attributed to a mentor nor prevented from
double-counting someone who also logged days. `saveSurvey` has been removed: it
wrote to the health blob with no authentication at all and nothing called it.

## What the dashboard leads with
The dashboard answers the questions leadership actually asks, in this order — each
section is a roll-up over existing weekly entries, nothing new is stored:

1. **The hero** — Total Staff is the headline number, with check-in rate and health
   score under it. Salvations YTD sits in the same black card as the sub-figure,
   quarters and all. Staff leads because it is the number every other figure on the
   page is produced by; salvations were the headline before and stayed in the card
   rather than being demoted to a tile.
2. **Leadership Development schools** — schools running, students enrolled, graduated
   YTD, potential staff, plus Q1–Q4 enrolment chips. Rolls up
   `LD_SCHOOL_MINISTRIES` (GPDTS/DTS, DBS, SMS, BCS, SOMD).
3. **Community schools** — `CS_SCHOOL_MINISTRIES` (GP Education, Ponlork, LTN,
   Sry Noi) counting `Students Enrolled` + `YE_SCHOOL_MINISTRIES` (YDC) counting
   `Youth Enrolled`. **Poipet runs two** (GP Education = GP Kids, YDC); **Siem Reap
   five**. A ministry reporting its own `Schools` number contributes that instead of 1,
   so a multi-site ministry counts honestly; otherwise any ministry with data at all
   counts as the one school it is — nobody should have to log "1" every week for YDC.
4. **Outreach teams** — `Teams Hosted`, volunteers, volunteer hours, people served,
   and outreach-scoped salvations / baptisms / church connections, plus Q1–Q4 chips.
5. **Local church partnerships** — `Partner Churches Supported` + `Churches Being Led`
   as one "Local Churches Partnered" figure, then congregation attendance, people
   connected to a local church, and `Spoke at Churches` from Base Leadership.
6. **Across every ministry** — base-wide baptisms, gospel hearings, healings.

The group constants live in `taxonomy.js` so the log form and the dashboard cannot
drift apart. Adding a school means adding its ministry to one of those three arrays.
`ministryRollup` respects each metric's own `modeOf` rule, which is what keeps
enrolment from being summed week after week.

Two aggregation corrections came with this: `Partner Churches Supported` and
`Combined Congregation Attendance` moved into `LATEST_SET`. Both are levels, not
weekly events — summing them counted the same church (and the same congregation)
again every week it was re-entered.

`Teams Hosted` is a **new** metric on Community Service → Outreach Teams. It sums,
so it answers "how many teams did we host this year" directly rather than being
inferred from volunteer counts.

## Key behaviors
- **Health score** (`compositeOf` in Index.html): averages per-item scores; loneliness is
  INVERTED (`10 - lonely`) so lower loneliness raises the score. Porn/debt count as 0 when present.
- **Weekly trends:** ▲/▼ % vs the previous week; green = good, red = bad. "Lower is better"
  metrics (staff debt, expenses, loneliness, porn, students struggling) invert the color.
- **Photos** are stored inline (data URI) in the Staff sheet — no Google Drive (that avoids
  the scope/auth error and keeps them small, ~300px).
- **Sensitive Teams data** (loneliness, porn, debt) is returned by name only to the person and
  their ONE chosen mentor (server-enforced in getMenteeLogs); leadership sees aggregates only.
- The dashboard intentionally omits "New Churches Planted" and "Base Plants in Planning"
  (still loggable in their ministries, just not shown on the dashboard summary).
- **A weekly goal's progress is a percentage, not a tick.** Ministry work is rarely
  finished-or-not — you discipled two of the three students you meant to — and a
  checkbox made people round an honest 60% to one of two lies. With three goals, a
  week could also only ever read 0, 33, 67 or 100%. Each goal now stores `pct`
  (0-100, step 5 in the UI) and the week is the **average** of what moved. `done` is
  still returned, derived as `pct >= 100`.
  **Rows written before this store `done` and no `pct`** — always read them through
  `goalItemPct_` (server) / `goalItemPct` (client), which maps a ticked goal to 100
  and an unticked one to 0. Reading `.pct` directly would silently zero every goal
  the team has already completed; `test-goals.mjs` covers exactly that.
  Progress and colour are shared: `pctColor` grades amber → blue → green as the
  number climbs, `pctWord` says the same thing in words for anyone who cannot pick
  those colours apart, and `ringVars`/`ringHtml` drive both the ring and the slider
  track from one string. Dragging repaints locally and saves once on release —
  never re-render mid-drag, or the thumb jumps out from under a finger.
- **The app is locked to the edges of the phone.** All three pages ask for
  `viewport-fit=cover` and a `black-translucent` status bar, which hands them the
  notch and the home-indicator strip as well as the screen. Every page therefore
  pads by `env(safe-area-inset-*)`: header top, body bottom/left/right, the staff
  tab bar, and the pull-to-refresh coin. Without it the header sat under the notch
  and the chrome shifted every time iOS re-reported the insets — on rotation, on
  keyboard open/close, when the URL bar collapsed — which reads as the app
  wiggling. **Watch for media queries**: `index.html` re-declares `header` padding
  under `max-width:480px`, so the inset has to be in that rule too or the fix does
  nothing on the one class of device that has insets. `overflow-x:hidden` is on
  `html` as well as `body`, because on iOS `body` alone still lets the document
  rubber-band sideways. `test-chrome.mjs` asserts all of it.
- **Colours come from tokens; there is no raw palette hex left.** The theme block
  (`/* ==================== THEME TOKENS ====================`) is duplicated verbatim
  in **all three** pages and `test-theme.mjs` asserts the copies are byte-identical —
  **edit one, edit all**. It is read in `<head>` before the stylesheet, and the saved
  choice is applied there too, or the app flashes the wrong colours on every open.
  Three states: no `data-theme` attribute follows the system, `light`/`dark` is the
  reader's choice and wins both ways. That is why the media query is guarded with
  `:not([data-theme="light"])`. The control lives in **Profile & settings** on the
  staff page (Appearance: Auto / Light / Dark, stored in `gp-theme`).
  **Four pairs of tokens must never be collapsed**, because each value was doing two
  jobs in the old palette and a blind find-and-replace inverts them:
  `--ink` (body text) vs `--headerBg` (header, hero, coin — dark in BOTH themes);
  `--surface` (cards) vs `--onDark` (text on that dark header);
  `--faint` (tertiary text on paper) vs `--onDarkFaint` (tertiary text on the hero);
  and anything sitting on `--accent`/`--amber` needs `--accentInk`/`--amberInk`, not
  the page's text colour. Three of those four were found by the contrast audit, not
  by eye — the hero rings, the campus chip and the KPI guide's amber buttons all had
  light text on a light fill in one theme or the other.
  **`test-theme.mjs` walks every text node on every screen in both themes** and fails
  anything under WCAG AA, working out each element's real background by climbing until
  it finds an opaque one. It also caught three contrast failures that predated dark
  mode, so `--faint`, `--amberDeep` and `--warm` are darker than they used to be.
  Run it after any colour change; do not chase contrast by looking at screenshots.
- **Pull-to-refresh is `gpPullToRefresh(onRefresh, opts)` in `rollup.js`, once.** Both
  pages had their own copy and the copies drifted twice — first the staff coin had no
  mark in it, then it did not *turn* as you pulled, which is what made the gesture feel
  broken there. The rotation during the drag (`rotate(px * 3)deg`) is the part that
  makes the coin feel attached to your finger; on release the inline transform is
  **cleared** so the CSS spin animation can take over, which the dashboard's own copy
  had never done. `onRefresh` must return a promise or the coin never stops.
- **A figure opens a breakdown only if the breakdown would ADD UP to it.** That is the
  whole rule. Students, discipleship and partner churches are sums of rows, so they
  open and the sheet totals the tile exactly. "Schools" is a count of ministries
  reporting, and Total Volunteer Hours is Σ(hours × volunteers) — a sheet under either
  would show rows totalling something other than the headline, which is worse than not
  opening. `test-pull-drill.mjs` opens a group sheet and asserts its rows sum to the
  tile, so this cannot rot.
  Figures summed across a **set** of ministries or **two** metrics use
  `gpDrillGroupAttrs(metricOrMetrics, ids, ministries, label, quarter)` — community
  students spans two departments *and* two metrics (Students Enrolled + Youth Enrolled),
  which is why those tiles used to be closed for want of a filter rather than by choice.
- **Tappable figures must look tappable.** `.drillable` was `cursor:pointer` and nothing
  else, which is invisible on a phone — so which numbers opened was guesswork, and the
  ones deliberately closed looked identical to broken ones. Tappable numbers now carry a
  dotted accent underline and tiles a ▸ marker. A test asserts both, on both pages.
- **Shared UI atoms live at the bottom of `rollup.js`.** `gpRingHtml`/`gpRingVars`/
  `gpPctColor`/`gpPctWord` (the progress rings, `sm`/`lg` sizes, colour walking warm →
  amber → cobalt → green with a word saying the same thing), `gpTap` (haptics —
  Android buzzes, iOS Safari ignores `vibrate()`, so it can only ever be a bonus and
  must never carry meaning), `gpAnimateCounts` (the count-up, which was already
  written for the dashboard and only lived there), and `gpShareCard` (a week as a
  canvas PNG through the OS share sheet). teams.html keeps thin wrappers
  (`ringHtml` → `gpRingHtml`) so its call sites read unchanged.
  The rings' CSS is in the shared theme block, not per page, so a ring looks the same
  wherever it appears — including the override that makes its digits `--onDark` inside
  the black hero.
  `gpShareCard` checks `navigator.canShare({files})` rather than assuming: file
  sharing is missing on older browsers, and a `download` attribute does nothing on
  iOS, so the fallback opens the PNG to be long-pressed and the return value says
  which happened (`shared` / `cancelled` / `opened` / `blocked` / `unsupported`).
- **The launch splash is one block, duplicated verbatim in both pages.** Look for
  `<!-- ==================== SPLASH ====================` at the top of the body in
  `index.html` and `teams.html`; `test-splash.mjs` asserts the two copies are
  byte-identical, so **edit one, edit both**. It is inlined rather than pulled from
  a file because it must paint on the first frame, and an external stylesheet is
  another round trip — which is the very thing it exists to hide.
  Why it exists: `start_url` used to be `index.html`, so **every launch loaded the
  dashboard and then navigated to the staff page** — a second real network fetch. It now
  points at `teams.html`, so an installed app opens straight on the staff page and that
  hand-off does not happen at all. The splash still matters, because opening the
  dashboard *link* (or a leader tapping "Dashboard") can still cross between the two. No amount of script timing fixes that; the splash is in the
  markup from the first byte, `position:fixed`, opaque, `z-index:9999`, ahead of the
  header, so there is nothing to see underneath at any point on any engine. Its
  background is the manifest's `background_color`, so the iOS launch screen hands
  over with no flash of white or paper.
  The ring is a masked `conic-gradient` spinning from CSS alone, because `logo.js`
  is **77KB and must never block the head**; the real mark fades in via
  `gpSplashLogo(GP_LOGO)` the moment it lands. `gpSplashDone()` takes it down and is
  called from `render()` on both pages and from both error boundaries — and it also
  lifts itself after 8s, so a path that forgets to call it cannot trap a working app
  behind a splash.
  `window.gpLeaving` is set when the dashboard redirects: it makes `render()` return
  early (so the dashboard is never drawn or unveiled) and skips `fetchData()`, which
  would otherwise spend a Netlify invocation on a screen nobody sees, once per staff
  member per app open.
  **Testing note:** Chromium never paints the document it is navigating away from —
  `evaluate()` there throws "execution context destroyed" — so frame-timing
  assertions about the flash pass even with no splash present. WebKit on iOS *does*
  paint it, which is why the flash was visible on a phone and never in the harness.
  The assertions that actually hold the fix run with **scripts disabled** and check
  the splash covers the viewport and the header underneath is unreachable. Do not
  "simplify" those into timing checks.
- **The staff redirect lives in `<head>`.** A signed-in staff member opening
  `index.html` is sent to `teams.html`, and that check must run above every byte of
  body markup — it touches no DOM for exactly that reason. It used to sit in a
  script below the header, after the blocking `<script src>` tags, so the browser
  had already painted the dashboard chrome: staff saw the dashboard flash for
  ~200ms on every app open.
- **Every "we are loading" state is the spinning GP mark.** Boot screen, pull-to-refresh
  coin, and the header refresh button all use `@keyframes spin` on the real logo. The
  refresh button used to swap in a "…", which read as nothing happening and stayed
  there forever when a request failed, since only a successful render put the ↻ back.
  If you add a busy state, spin the mark and restore it in both branches.
  The staff boot coin is **built by JS** once `logo.js` is in, not written as body
  markup. As markup it was an `<img>` with no `src` until that script ran, so on a
  slow connection you watched an empty ring spin with a hole in it. An empty
  `<main>` for a few ms looks like nothing; a hollow coin looks broken. The
  dashboard already did it this way (it builds its loading box in `render()`), and
  the two now match — do not move either back into static markup.

## Programs — the Ministry of Education report

Four project agreements with the Ministry of Education, Youth and Sport, reported on
twice a year: **SVI** (Student Volunteer Internship — visiting outreach teams), **YDC**
(Youth Development Center — kids, youth, sports, preschool), **YLT** (Youth Leadership
Training — DTS, DBS and the other schools) and **YAP** (Youth Assistance Project — dorm
residents, new staff in their first 2–4 years, young leaders being supported).

**Why this is not a KPI.** The weekly KPIs answer "how is this ministry doing this week"
— one number, every week, per metric. The Ministry report asks something else: which
country a team came from, the dates it was here, how many of a class were girls. A team
of 12 from YWAM Maui that visited in February is *one fact*, not a weekly figure, and
forcing it through the KPI system would mean retyping it every week and still losing the
country and the dates. So programme records sit **beside** the KPIs and nothing about
what anyone logs each week changed.

**One blob, discriminated by `kind`.** `programs` holds every row: `team` (SVI), `class`
(YDC), `cohort` (YLT), `group` (YAP), `issue` (the base's challenges and solutions) and
`goal` (the year's target for one programme). Five blobs would eventually disagree about
which year a row belongs to. Rows are year-scoped through `inYear_` like everything else,
and carry a `semester` (1 or 2) because the report is written twice a year.

- **Any signed-in staff may read and write.** Ministry leaders enter their own
  programme's teams and classes — that is the only way the data ever gets in. Editing
  somebody else's row is fine (a report is a shared document), but a row **cannot be
  moved to another campus by editing it**: the campus is stamped from the writer's own
  staff record on create and preserved on update, the same rule `saveEntries` has.
- **The year goal is stored, not hardcoded.** It is renegotiated — the 2026 agreement is
  not the 2027 one, and last year's report must still show last year's target. Note the
  numbers Uriah quoted (SVI 250, YDC 500, YLT 35, YAP 25) differ from the 2026 targets in
  the Ministry PDF (50 / 400 / 35 / 25); they are typed in per year rather than shipped
  in code, so whichever is right can just be entered.
- **`gpProgramSummary(id, rows)` is the one definition** of "how many volunteers came
  this year". The facts strip on the data-entry screen reads it so a mistyped figure is
  visible while the person who typed it is still looking at the form, and the report
  generator will read the same function. Do not write a second one.
- **Records load when the tab is opened, not at boot.** A page open is one function
  invocation (see `audit-load.mjs`); most opens never reach this screen. `state.progRecords`
  is `null` until then.
- **The challenges section carries Uriah's instruction on screen**, deliberately: *don't
  write about lack of staff, because every organisation needs more staff and it tells the
  reader nothing.* Write the real ones — lower volunteer numbers, conflict, fewer
  teachers, students who stop coming.

## Known limits (real, not yet fixed)
- **No locking on read-modify-write.** Every write reads a whole blob, edits it and writes
  it back. Two people saving the same sheet in the same second means one loses. Rare at
  this team size, real nonetheless.
- **The last days of a 53-week year still clamp onto week 52.** Both pages compute the
  week from the Monday of week 1 of the current calendar year and clamp to 52, so the
  days belonging to the *next* year's week 1 land on week 52 instead. The year field
  keeps those days in the right year now, so this is a mis-numbered week rather than
  lost history — much smaller than it was, still not right.
- **~219 Khmer strings are translated but unreviewed** (`PENDING_KM` in `km.js`). They
  are on screen now rather than sitting in English, which was Uriah's call, but nobody
  who speaks Khmer has read them yet. `docs/khmer-needed.md` is the checklist.
- **The job-focus paragraphs are still English.** `public/jobfocus.js` and the KPI
  glossary in `help.html` carry 28 ministries' worth of prose — that is content rather
  than interface, it is long, and it reads as teaching material, so it wants a person
  writing it rather than a translation of the English.

## Things that made the app fail to load (don't reintroduce)
Each of these looked harmless and took the whole page down. `test-degraded.mjs`,
`test-storage.mjs` and `test-firstrun.mjs` exist to keep them fixed.
- **A render-blocking font.** A pending stylesheet blocks script execution, so an
  `@import` of Google Fonts held JS for 8s on a slow connection. All three pages now load
  fonts with `media="print" onload="this.media='all'"`. `audit-paint.mjs` asserts first
  paint stays under ~200ms even with the CDN hanging for 12s.
- **A third `<script src>`.** The error boundary treats a failed script as fatal, so
  extracting `logo.js` broke production. Optional scripts carry `data-optional` and the
  boundary skips them — and anything they define must be reached through a guard
  (`logoImg()`), because a bare `GP_LOGO` in a string is a ReferenceError.
- **Reading `localStorage` unguarded.** With storage blocked, `getItem` and `setItem`
  *throw* rather than returning null. `state` was being built from a bare `getItem`, so
  the page rendered nothing at all; `afterLogin()` wrote the session before anything else,
  so logging in silently did nothing but show "Connection problem". Both pages now go
  through `lsGet`/`lsSet`/`lsDel` — losing a saved preference is fine, losing the page is not.
- **A dead cache key deciding the language.** Khmer used to be fetched into `gp-km-v2`;
  nothing writes that key any more, but the read was still there with an English fallback,
  so every data load quietly reset a Khmer reader to English while the toggle still read
  ខ្មែរ. The dictionary ships with the page now — there is nothing to wait for.
- **A malformed request body.** `HANDLERS[body.fn]` threw on a bare `null` body (500) and
  resolved `fn:"constructor"` to `Object` and called it. Dispatch now needs an own
  property that is actually a function, and anything else is a 400.

## Deliberately NOT built
- **No Bible reading plan.** The team works through The Bible Recap together in a
  dedicated Bible app, so tracking day-by-day readings here would only duplicate it.
  Bible reading is simply one of the habit tiles with its own streak. A `bible-plan.js`
  with position tracking existed briefly and was removed — don't rebuild it.

## On the horizon (not yet built)
- **The quarterly report button.** Data capture is built; generating the document is not.
  The intent is a button that produces a Google Doc shaped like the Ministry activity
  report already filed — the four programmes, their activities, the challenges and
  solutions — from `gpProgramSummary()` and the records for the period. Budget figures
  are explicitly deferred: Uriah expects them to be hard and wants them "in time", not
  now. Whatever generates it must read `programs.js`, not restate the field list.
- **One page instead of two.** `index.html` and `teams.html` are converging: they now
  share `logo.js`, `km.js` and `taxonomy.js`, the same loading coin, the same header
  mark, and the front door hands off between them. The end state is a single page where
  the dashboard and your own space are two views, not two files. Whenever you touch
  chrome on one page, do the same on the other — the visible gap between them is the
  thing being closed.
- **The campus lock.** Logging is currently *defaulted* to your own campus, not locked
  to it (see The front door). Turning the default into a rule is blocked on staff who
  have no account yet: today it would lock them out entirely. Revisit once the roster
  is close to complete.
- **Server-side auth on `saveEntries`.** The account gate is UI-only. Pass the staff
  username + PIN through `saveEntries` and check them in `api.js`, so an unattributed
  number can't reach the blob at all. This is also what makes the campus lock real
  rather than cosmetic.
- **Real PWA icons.** `icon-180.png` / `icon-512.png` are still generated placeholders.
  `logo.js` now holds the real marks, so these can be generated from `GP_LOGO`.
- **Web push for the daily nudge.** iOS 16.4+ supports it for installed PWAs; one
  reminder at a chosen time is the difference between a daily tool and a forgotten one.
