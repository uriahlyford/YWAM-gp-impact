# GonPreah (GP) Impact App

A mobile-first, bilingual (Khmer-first) web app for YWAM GonPreah (កូនព្រះ), Cambodia.
It tracks ministry KPIs, OKRs, a staff health survey, and per-staff daily logging
across the Poipet and Siem Reap campuses.

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
- `index.html` — leadership dashboard (KPIs, OKRs, health survey). Contains an embedded
  259×108 header logo (base64) and a 266-entry reviewed Khmer dictionary (`BUILTIN_KM`).
  Has weekly ▲/▼ trend badges, a spinning-logo "Impact Loading" state, click-through
  drill-down on dashboard totals, and the ✦ Teams / 📖 buttons (plain page nav now, not
  postMessage). Calls the backend via the `apiCall(fn, args)` helper.
- `teams.html` — per-staff space: username + 4-digit PIN, profile + photo, daily logging,
  streaks, mentor view + mentor-request approval.
- `help.html` — bilingual clickable KPI guide (job focus + KPI explanations per ministry).
- `manifest.json`, `icon-180.png`, `icon-512.png` — PWA assets. **The icons are
  placeholders** (cobalt circle + "GP" wordmark) — swap in real ones when available.

### netlify/functions/api.js
Handlers: getData, saveEntries, saveObjective, deleteObjective, saveSurvey, teamRoster,
staffRegister, staffLogin, updateProfile, changePin, uploadPhoto, saveDaily, getMyLogs,
getMyMentees, getMenteeLogs, getMyMentorRequests, respondToMentorRequest,
getMyWeekly, saveGoals, saveMyHabits, getMyMinistry, saveMyMinistry, saveMyKpiDay,
weeklyHealthFromLogs. No `translateBatch` equivalent (was `LanguageApp.translate`, not
available outside Apps Script) — Khmer strings machine-translation fallback is gone;
all Khmer must come from `BUILTIN_KM` or be added by hand.

**Enter each number once — everything weekly is derived.** Two rules matter here:
- **Weekly health** is computed from that week's daily logs by `syncWeekSurvey_`,
  called automatically at the end of `saveDaily`. There is no weekly survey form
  any more; it asked the same eleven questions as the daily check-in. Thresholds
  (`WEEK_EXERCISE_DAYS` 3, `WEEK_QUIETTIME_DAYS` 4) match what the old form asked in
  words; yes/no fields are "did this happen at all this week", 1-10 scales average
  the days logged. Rows land in the same `survey` blob the anonymous device survey
  uses, so the base health score needs no extra plumbing.
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
  both reads of `SENSITIVE` metrics and all OKR writes (`saveObjective`/`deleteObjective`).
  If the env var is ever missing, leader access is off for everyone until it's restored.
- **One-time migration handler removed.** The Google-Sheet-to-Blobs migration used a
  secret-gated `adminSeed` handler in `api.js`; it's been deleted now that the migration
  is done. Never commit real staff/survey data (PIN hashes, photos, health-survey
  answers) to this repo — if a future migration needs it again, write a throwaway
  handler, use it once, and delete it.

## Conventions / must-preserve
- **Khmer-first.** Khmer is never smaller/lighter than English. All KPI/ministry/department
  NAMES come from the reviewed `BUILTIN_KM` dictionary in `Index.html`.
- **Khmer prose needs human review** (native speakers Sreilea / Leakha) before going wide;
  machine translation is fallback only. New Khmer strings should be flagged for review.
- **Never reconstruct `public/index.html` from memory** — it holds the embedded logo and the
  266-entry Khmer dictionary. Edit it in place (targeted find/replace); don't regenerate those blobs.
- Uploaded files from macOS TextEdit may arrive as RTF — convert to plain text first.
- Brand: Paper #FAF6F0, Ink #17150F, Cobalt #1F44FF, Marigold #FFB323. Fonts: Koulen +
  Kantumruy Pro (Khmer), Archivo + Hanken Grotesk (Latin). Motif: ✦ spark.

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

## On the horizon (not yet built)
- **The Bible Recap readings.** `public/bible-plan.js` ships with `days: []` on purpose.
  The plan is the Blue Letter Bible chronological one; paste the 365 readings in order
  and the card starts showing "day N — next: John 4". Until then the Bible habit is a
  plain daily tick. Don't fill this from memory — real people follow it daily.
- **Retiring the anonymous device survey.** Staff weekly health is now derived from
  daily logs (done), so the device-based survey on the dashboard is the only remaining
  path into `survey`. It can go once everyone has a profile.
- **Real PWA icons.** `icon-180.png` / `icon-512.png` are still generated placeholders.
- **Web push for the daily nudge.** iOS 16.4+ supports it for installed PWAs; one
  reminder at a chosen time is the difference between a daily tool and a forgotten one.
