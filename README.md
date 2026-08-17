# GP Impact — YWAM GonPreah (កូនព្រះ), Cambodia

A mobile-first, Khmer-first web app for the YWAM GonPreah bases in **Siem Reap and
Poipet**. It tracks ministry KPIs, quarterly OKRs, a weekly staff health check-in,
per-staff daily logging, and days away from campus.

**Live:** https://transcendent-crostata-c9b7f4.netlify.app

> **This is the repo the live site deploys from.** Two other repos have similar
> names and are *not* this app — `uriahlyford/YWAM-GP-App` and
> `uriahlyford/Ywam-Base-Tracker`. If you were sent here to work on the Siem
> Reap / Poipet app, you are in the right place: `YWAM-gp-impact`, branch `main`.

## Read these first

| File | What it tells you |
|---|---|
| **`CLAUDE.md`** | The architecture, the data rules, the privacy model, and the "do not break" list. Start here — it exists so decisions already made do not get re-litigated. |
| **`tests/README.md`** | What each test protects, and how to run them. |

## Pushing to `main` deploys to production

Netlify builds `main` on every push and publishes it to the live URL above. There
is **no staging step** between a merge and every staff member's phone.

- A push to any **other** branch produces no deploy at all, so a branch is a safe
  place to work.
- CI runs the suite on every pull request and every push to `main`, as two checks:
  `server tests` (seconds, nothing to install) and `browser tests` (Playwright).
- Run it yourself before opening a PR. CI is the backstop, not the plan.

```sh
node tests/run-all.mjs          # everything (24 files)
node tests/run-all.mjs server   # the fast half — no browser needed
```

Browser tests need Playwright and a Chromium:

```sh
npm install --no-save playwright
npx playwright install chromium
```

## Running it locally

The frontend is plain static files — no build step, no framework, no bundler.

```sh
npx http-server public -p 8899 -c-1
```

That gives you the real pages, but the backend is a Netlify Function, so anything
that reads or writes data needs either `netlify dev` or a stubbed API. Every
browser test intercepts the API with explicit fixtures — copy one of those (see
`tests/test-base.mjs`) rather than pointing a local page at production.

## Layout

```
public/            the whole frontend, served directly by Netlify
  index.html       leadership dashboard, and the app's front door
  teams.html       "My GP" — a staff member's own page (Base · My week · Team · Me)
  help.html        bilingual KPI guide
  rollup.js        THE ROLL-UP ENGINE — the maths behind every figure, shared by
                   both pages. Change a rule here and it changes for both.
  taxonomy.js      campuses, departments, ministries, metrics, staff types, countries
  km.js            Khmer dictionary — REVIEWED_KM and PENDING_KM, kept apart
  jobfocus.js      what each of the 28 ministries is for
  logo.js          the brand marks as base64 — never regenerate these
netlify/functions/
  api.js           the entire backend: one function, Netlify Blobs for storage
tests/             24 files; see tests/README.md
docs/
  khmer-needed.md  the Khmer review checklist for the native speakers
```

## Two things you cannot do from here

- **Environment variables.** `GP_LEADER_CODE` lives only in Netlify, deliberately —
  this repo is public, so a leader code in source would be a permanently known
  password. `isLeader_()` fails closed if it is unset. Adding a feature that needs
  a new variable needs whoever owns the Netlify site.
- **Reach the real data.** Production data is in Netlify Blobs. A local clone can
  run every page and every test; it cannot read or write the base's actual numbers.

## This repo is public

No secrets, no PIN hashes, no photos, no health answers — all of that lives in
Blobs, never in git. Keep it that way: staff health answers and the leadership code
are the two things this app promises to protect.
