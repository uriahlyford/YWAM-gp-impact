# GonPreah (GP) Impact App

A mobile-first, bilingual (Khmer-first) web app for YWAM GonPreah (កូនព្រះ), Cambodia.
It tracks ministry KPIs, OKRs, a staff health survey, and per-staff daily logging
across the Poipet and Siem Reap campuses.

## Architecture (two deploy targets)
1. **Apps Script web app** (`appsscript/`) — the actual app. Google Apps Script
   (`Code.gs`) serving three HTML pages, backed by one Google Sheet ("GP Impact Data").
2. **Netlify shell** (`shell/`) — a tiny static site that wraps the Apps Script
   `/exec` URL in a full-screen iframe so it installs as a home-screen PWA. Deployed
   via GitHub → Netlify.

## Files
### appsscript/ (paste each into the Apps Script editor; deploy with New version)
- `Code.gs` — backend. Routing in `doGet` serves `Index` (default), `Teams` (`?p=teams`),
  or `Help` (`?p=help`). Functions: getData, saveEntries, saveObjective, deleteObjective,
  saveSurvey, translateBatch, teamRoster, staff register/login, updateProfile, changePin,
  uploadPhoto, saveDaily, getMyLogs, getMyMentees, getMenteeLogs, getAppUrl.
- `Index.html` — leadership dashboard (KPIs, OKRs, health survey). Contains an embedded
  259×108 header logo (base64) and a 266-entry reviewed Khmer dictionary (`BUILTIN_KM`).
  Has weekly ▲/▼ trend badges, a spinning-logo "Impact Loading" state, and the ✦ Teams / 📖 buttons.
- `Teams.html` — per-staff space: username + 4-digit PIN, profile + photo, daily logging,
  streaks, mentor view.
- `Help.html` — bilingual clickable KPI guide (job focus + KPI explanations per ministry).

### shell/ (Netlify site; GitHub → Netlify auto-deploy)
- `index.html` — splash screen (GonPreah seal + motto "ចាប់ផ្តើមជាមួយខ្លួនឯង / It starts
  with you") → loads the app; message router keeps Teams/Help inside the PWA; viewport locked.
- `manifest.json`, `icon-180.png`, `icon-512.png` — PWA assets.

## Deploy rules — do not break
- **Apps Script:** always Deploy → Manage deployments → ✏️ → **New version** on the
  EXISTING deployment. NEVER create a new deployment — it mints a new `/exec` URL and
  breaks the shell. Keep `setXFrameOptionsMode(ALLOWALL)` so the shell can embed the app.
- **Shell → Apps Script link:** the only connection is the `EXEC = "…/exec"` line at the
  top of `shell/index.html`. It must point at the deployment the shell is meant to load.
- **Netlify:** the shell repo publishes the `shell/` folder root; push to redeploy.

## Conventions / must-preserve
- **Khmer-first.** Khmer is never smaller/lighter than English. All KPI/ministry/department
  NAMES come from the reviewed `BUILTIN_KM` dictionary in `Index.html`.
- **Khmer prose needs human review** (native speakers Sreilea / Leakha) before going wide;
  machine translation is fallback only. New Khmer strings should be flagged for review.
- **Never reconstruct `Index.html` from memory** — it holds the embedded logo and the 266-entry
  Khmer dictionary. Edit it in place (targeted find/replace); don't regenerate those blobs.
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
- Wiring the health score to the daily logs (`weeklyHealthFromLogs` hook exists) so the
  score comes from individual entries, then optionally retiring the anonymous survey.
