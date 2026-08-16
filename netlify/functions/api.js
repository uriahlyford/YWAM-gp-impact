/*  GonPreah Impact — Netlify Function backend
    Replaces the Google Apps Script backend (Code.gs). Same behavior, same
    data shapes the frontend already expects — just Netlify Blobs instead of
    a Google Sheet, and no google.script.run RPC marshalling.

    Storage: one JSON blob per "sheet" (array of row objects), in the
    "gp-data" store. Concurrency: plain read-modify-write, no locking —
    an accepted trade-off at this team's scale (see CLAUDE.md).

    Leadership tier: metrics in SENSITIVE are stripped unless the caller's code
    matches process.env.GP_LEADER_CODE. Fails closed — if that env var is ever
    unset, nobody gets leader access (no hardcoded fallback; this repo is public,
    so a literal in source would be a permanently known password).

    OKR writes have two doors: the leader code writes anything, and a signed-in
    staff member (username + PIN) writes their OWN campus and department only.
    See okrWriter_ for how that boundary is held.
*/

import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const SENSITIVE = ['Base Finances ($)', 'Base Cash Reserve ($)'];

/* ---- lightweight input validation (reject junk, not a full taxonomy check —
   the campus/dept/ministry/metric option lists live in the frontend and
   would be costly to keep in sync here; this just stops garbage/oversized
   values from corrupting the dataset). ---- */
function str_(v, maxLen) {
  const s = String(v == null ? '' : v).trim();
  return (s && s.length <= maxLen) ? s : null;
}
function finiteNum_(v, min, max) {
  const n = Number(v);
  return (isFinite(n) && n >= min && n <= max) ? n : null;
}

/* ==================== the year a week belongs to ====================
   Every dated row used to carry a week number and nothing else, so week 33 of 2027
   would land on top of week 33 of 2026: the new year's first write would overwrite
   last year's figure for sum metrics and silently replace it for `latest` ones.
   The store was a single year's worth of data by construction, and nobody had
   noticed only because the app had not lived through a New Year yet.

   Rows now carry `year`. Reads filter to one year — the current one unless asked
   otherwise — which is what keeps rollup.js and both pages working on plain week
   numbers exactly as before: the year is resolved at this boundary and never
   leaves it.

   LEGACY: rows written before this have no `year`, and it cannot be *recovered*,
   only inferred — so yearOf_ takes the best evidence available, in order: an
   explicit year, the row's own date (kpiDaily and dailyLogs carry one), the
   timestamp of its last edit, and finally GP_LEGACY_YEAR. Set that env var to the
   year the existing data was collected in. This is an assignment, not a recovery:
   a row edited in January that describes the previous December will be attributed
   to the wrong year, which is rare and was unknowable either way. */
const YEAR_MIN = 2020, YEAR_MAX = 2100;

function currentYear_() { return new Date().getUTCFullYear(); }

function legacyYear_() {
  const n = finiteNum_(process.env.GP_LEGACY_YEAR, YEAR_MIN, YEAR_MAX);
  return n == null ? currentYear_() : n;
}

/* The year a request is asking about. Absent or junk means "this year", so every
   existing caller keeps working without passing anything. */
function askedYear_(v) {
  const n = finiteNum_(v, YEAR_MIN, YEAR_MAX);
  return n == null ? currentYear_() : Math.round(n);
}

function yearFromDate_(d) {
  const n = finiteNum_(String(d || '').slice(0, 4), YEAR_MIN, YEAR_MAX);
  return n == null ? null : Math.round(n);
}

function yearOf_(row) {
  if (!row) return legacyYear_();
  const explicit = finiteNum_(row.year, YEAR_MIN, YEAR_MAX);
  if (explicit != null) return Math.round(explicit);
  return yearFromDate_(row.date) || yearFromDate_(row.updated) || legacyYear_();
}

/* The filter every year-scoped read goes through, so "which year is this row in"
   is answered in exactly one place. */
function inYear_(year) {
  return function (row) { return yearOf_(row) === year; };
}

function store() { return getStore('gp-data'); }
/* Every blob in this store is either a JSON array of rows or, for loginThrottle,
   a plain object. If one ever comes back as something else — a half-finished
   write, a hand-edit in the Netlify UI, a future schema change — the old code
   handed it straight to .forEach/.findIndex and the whole app answered 500,
   which is the "Error when loading app" screen for every user at once. Check the
   shape against the fallback the caller asked for instead: a bad blob then reads
   as empty, which shows an empty page rather than taking the app down, and the
   next successful write repairs it. */
async function readJSON(key, fallback) {
  const v = await store().get(key, { type: 'json' });
  if (v == null) return fallback;
  const wantArray = Array.isArray(fallback);
  const isArray = Array.isArray(v);
  if (wantArray !== isArray) return fallback;
  if (!wantArray && typeof v !== 'object') return fallback;
  return v;
}
async function writeJSON(key, value) {
  await store().setJSON(key, value);
  return value;
}

function isLeader_(code) {
  const real = process.env.GP_LEADER_CODE;
  if (!real) return false;
  return String(code || '') === real;
}

/* ---- password hashing (Node crypto instead of Utilities.computeDigest) ---- */
function hashPin_(pin, salt) {
  return crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
}
function pinSalt_() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
function normUser_(u) { return String(u || '').trim().toLowerCase(); }

/* ---- login throttle (replaces CacheService's auto-expiring cache) ---- */
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_WINDOW_MS = 30 * 60 * 1000;

async function isLoginLocked_(username) {
  const throttle = await readJSON('loginThrottle', {});
  const rec = throttle[normUser_(username)];
  return !!(rec && rec.lockedUntil && Date.now() < rec.lockedUntil);
}
async function recordFailedLogin_(username) {
  const key = normUser_(username);
  const throttle = await readJSON('loginThrottle', {});
  let rec = throttle[key] || { attempts: 0, firstAt: Date.now() };
  if (Date.now() - (rec.firstAt || 0) > LOGIN_ATTEMPT_WINDOW_MS) rec = { attempts: 0, firstAt: Date.now() };
  rec.attempts = (rec.attempts || 0) + 1;
  if (rec.attempts >= LOGIN_MAX_ATTEMPTS) rec.lockedUntil = Date.now() + LOGIN_LOCK_MS;
  throttle[key] = rec;
  await writeJSON('loginThrottle', throttle);
}
async function clearLoginThrottle_(username) {
  const key = normUser_(username);
  const throttle = await readJSON('loginThrottle', {});
  // Nothing to clear is the normal case, and a no-op write is not free: every
  // authenticated call used to read AND write this blob, so a page open wrote it
  // once per request — several of them racing on a read-modify-write with no
  // locking. Only write when a lock actually needs lifting.
  if (!(key in throttle)) return;
  delete throttle[key];
  await writeJSON('loginThrottle', throttle);
}

/* ==================== STAFF / TEAMS ==================== */
async function getStaff_() { return readJSON('staff', []); }
async function saveStaff_(rows) { return writeJSON('staff', rows); }

function findStaff_(rows, username) {
  const u = normUser_(username);
  return rows.find(function (s) { return s.username === u; }) || null;
}

async function verifyStaff_(username, pin) {
  if (await isLoginLocked_(username)) return null;
  const rows = await getStaff_();
  const s = findStaff_(rows, username);
  if (!s || hashPin_(pin, s.pinSalt) !== s.pinHash) {
    await recordFailedLogin_(username);
    return null;
  }
  await clearLoginThrottle_(username);
  return s;
}

/* Deliberately narrow: this is what every staff member can see about every
   other one. surveyToken must never appear here — it's what keeps weekly
   check-ins anonymous in the base survey. */
function publicStaff_(s) {
  return {
    id: s.id, name: s.name, username: s.username, campus: s.campus, dept: s.dept,
    ministry: s.ministry || '', role: s.role, photo: s.photo || '', mentorId: s.mentorId || ''
  };
}

async function teamRoster() {
  const rows = await getStaff_();
  return rows.filter(function (s) { return s.active; }).map(publicStaff_);
}

async function staffRegister(payload) {
  const u = normUser_(payload.username);
  if (!/^[a-z0-9._-]{2,20}$/.test(u)) return { ok: false, err: 'bad_username' };
  if (!/^\d{4}$/.test(String(payload.pin))) return { ok: false, err: 'bad_pin' };
  const rows = await getStaff_();
  if (findStaff_(rows, u)) return { ok: false, err: 'taken' };
  const salt = pinSalt_();
  const id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();
  const rec = {
    id: id, username: u, name: payload.name || u, pinHash: hashPin_(payload.pin, salt), pinSalt: salt,
    campus: payload.campus || '', dept: payload.dept || '', ministry: payload.ministry || '',
    role: payload.role || '', photo: '',
    mentorId: payload.mentorId || '', mentorStatus: payload.mentorId ? 'pending' : '',
    phone: payload.phone || '', joined: payload.joined || '', debt: false, active: true,
    created: now, updated: now
  };
  rows.push(rec);
  await saveStaff_(rows);
  return {
    ok: true, staff: publicStaff_(rec),
    profile: { phone: rec.phone, joined: rec.joined, debt: false, mentorStatus: rec.mentorStatus }
  };
}

async function staffLogin(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  return { ok: true, staff: publicStaff_(s), profile: { phone: s.phone, joined: s.joined, debt: s.debt, mentorStatus: s.mentorStatus || '' } };
}

async function updateProfile(username, pin, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  const rec = rows[idx];
  if (payload.name !== undefined) rec.name = payload.name;
  if (payload.campus !== undefined) rec.campus = payload.campus;
  if (payload.dept !== undefined) rec.dept = payload.dept;
  if (payload.ministry !== undefined) rec.ministry = payload.ministry;
  if (payload.role !== undefined) rec.role = payload.role;
  if (payload.mentorId !== undefined) {
    const newMentorId = payload.mentorId || '';
    // Picking a new/different mentor always resets to pending — the mentor
    // must accept before they get access to this person's private data.
    if (newMentorId !== rec.mentorId) rec.mentorStatus = newMentorId ? 'pending' : '';
    rec.mentorId = newMentorId;
  }
  if (payload.phone !== undefined) rec.phone = payload.phone;
  if (payload.joined !== undefined) rec.joined = payload.joined;
  if (payload.debt !== undefined) rec.debt = !!payload.debt;
  rec.updated = new Date().toISOString();
  rows[idx] = rec;
  await saveStaff_(rows);
  return { ok: true, staff: publicStaff_(rec), profile: { phone: rec.phone, joined: rec.joined, debt: rec.debt, mentorStatus: rec.mentorStatus || '' } };
}

async function changePin(username, pin, newPin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!/^\d{4}$/.test(String(newPin))) return { ok: false, err: 'bad_pin' };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  const salt = pinSalt_();
  rows[idx].pinHash = hashPin_(newPin, salt);
  rows[idx].pinSalt = salt;
  await saveStaff_(rows);
  return { ok: true };
}

const PHOTO_MIME_ALLOWLIST = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function uploadPhoto(username, pin, base64, mime) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (mime && PHOTO_MIME_ALLOWLIST.indexOf(mime) === -1) return { ok: false, err: 'bad_type' };
  const dataUri = 'data:' + (mime || 'image/jpeg') + ';base64,' + base64;
  if (dataUri.length > 200000) return { ok: false, err: 'too_large' };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  rows[idx].photo = dataUri;
  await saveStaff_(rows);
  return { ok: true, photo: dataUri };
}

/* ==================== personal habits ====================
   Each person picks the handful they're actually working on. A fixed list of
   ten becomes guilt and then abandonment, so the set is per-staff and each
   habit carries its own mentorVisible flag — you choose what your mentor
   sees, which is what makes people log honestly. */
const HABIT_LIBRARY = [
  { id: 'bible',       label: 'Bible reading' },
  { id: 'quietTime',   label: 'Quiet time / prayer' },
  { id: 'workout',     label: 'Workout' },
  { id: 'ateWell',     label: 'Ate well' },
  { id: 'sleptWell',   label: 'Slept well' },
  { id: 'language',    label: 'Language study' },
  { id: 'gratitude',   label: 'Wrote down something I’m grateful for' },
  { id: 'oneOnOne',    label: 'One-on-one' },
  { id: 'sharedFaith', label: 'Shared my faith' },
  { id: 'sabbath',     label: 'Sabbath / rest' }
];
const HABIT_IDS = HABIT_LIBRARY.map(function (h) { return h.id; });
const DEFAULT_HABITS = [
  { id: 'bible',     mentorVisible: true },
  { id: 'quietTime', mentorVisible: true },
  { id: 'workout',   mentorVisible: true }
];
const MAX_HABITS = 6;

function cleanHabitConfig_(list) {
  const seen = {};
  return (Array.isArray(list) ? list : []).filter(function (h) {
    if (!h || HABIT_IDS.indexOf(h.id) === -1 || seen[h.id]) return false;
    seen[h.id] = 1; return true;
  }).slice(0, MAX_HABITS).map(function (h) {
    return { id: h.id, mentorVisible: !!h.mentorVisible };
  });
}
function habitsOf_(s) {
  const cfg = cleanHabitConfig_(s.habits);
  return cfg.length ? cfg : DEFAULT_HABITS.slice();
}
/* Only the ids this person actually tracks get stored, so turning a habit off
   doesn't quietly keep recording it. */
function cleanHabitMap_(map, cfg) {
  const out = {};
  cfg.forEach(function (h) { if (map && map[h.id] !== undefined) out[h.id] = !!map[h.id]; });
  return out;
}

/* Which KPIs a person logs day to day. Some ministries carry 29 metrics —
   GP Media does — and a 29-row form daily gets filled in never. Pinning a
   handful keeps the daily card short; the rest stay available behind "show
   all" for the occasional ones. Empty list = show everything, which is the
   right default before anyone has chosen. */
const MAX_KPI_PINS = 8;

async function saveMyKpiPins(username, pin, pins) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  if (idx === -1) return { ok: false };
  const seen = {};
  rows[idx].kpiPins = (Array.isArray(pins) ? pins : [])
    .map(function (m) { return str_(m, 80); })
    .filter(function (m) {
      if (!m || seen[m] || SENSITIVE.indexOf(m) > -1) return false;
      seen[m] = 1; return true;
    })
    .slice(0, MAX_KPI_PINS);
  rows[idx].updated = new Date().toISOString();
  await saveStaff_(rows);
  return getMyMinistry(username, pin);
}

async function saveMyHabits(username, pin, habits, bibleDay) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  if (idx === -1) return { ok: false };
  if (habits !== undefined) rows[idx].habits = cleanHabitConfig_(habits);
  const day = finiteNum_(bibleDay, 0, 365);
  if (day !== null) rows[idx].bibleDay = day;
  rows[idx].updated = new Date().toISOString();
  await saveStaff_(rows);
  return { ok: true, habits: habitsOf_(rows[idx]), bibleDay: rows[idx].bibleDay || 0 };
}

/* ---- daily log ---- */
function isoWeek_(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const y = d.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1));
}

async function getDaily_() { return readJSON('dailyLogs', []); }

async function saveDaily(username, pin, dateStr, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getDaily_();
  const idx = rows.findIndex(function (r) { return r.staffId === s.id && r.date === dateStr; });
  const b = function (v) { return !!v; };
  const n = function (v) { const x = Number(v); return isNaN(x) ? null : x; };
  const rec = {
    staffId: s.id, date: dateStr, week: isoWeek_(dateStr),
    langHours: n(payload.langHours) || 0, minHours: n(payload.minHours) || 0,
    workout: b(payload.workout), bible: b(payload.bible), quietTime: b(payload.quietTime),
    oneOnOne: b(payload.oneOnOne), sharedFaith: b(payload.sharedFaith), sabbath: b(payload.sabbath),
    clarity: n(payload.clarity), growth: n(payload.growth), lonely: n(payload.lonely), porn: b(payload.porn),
    habits: cleanHabitMap_(payload.habits, habitsOf_(s)),
    updated: new Date().toISOString()
  };
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('dailyLogs', rows);
  // The week's health row follows from the days — no second form to fill in.
  const week = await syncWeekSurvey_(s, rec.week, rows);
  const out = await getMyLogs(username, pin);
  out.week = week;
  return out;
}

/* habitConfig: pass the person's habit config for the MENTOR view and results
   are narrowed to what they chose to share. Omit it for someone's own data and
   everything comes back.

   Several habits also have a legacy fixed column (bible, workout, quietTime…)
   from before habits were configurable, and those are written in step with the
   habit map — so the same column has to be masked too, or "keep this one
   private" would leak straight through the old field. Habits absent from the
   config aren't masked: loneliness and porn are governed by the mentor
   relationship itself, not per-habit consent. */
const LEGACY_HABIT_COLS = ['workout', 'bible', 'quietTime', 'oneOnOne', 'sharedFaith', 'sabbath'];

function logsFor_(rows, staffId, habitConfig) {
  let shared = null, hidden = [];
  if (habitConfig) {
    shared = habitConfig.filter(function (h) { return h.mentorVisible; }).map(function (h) { return h.id; });
    hidden = habitConfig.filter(function (h) { return !h.mentorVisible; }).map(function (h) { return h.id; });
  }
  return rows.filter(function (r) { return r.staffId === staffId; })
    .slice()
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; })
    .map(function (r) {
      let habits = r.habits || {};
      if (shared) {
        const filtered = {};
        Object.keys(habits).forEach(function (k) { if (shared.indexOf(k) > -1) filtered[k] = habits[k]; });
        habits = filtered;
      }
      const out = {
        date: r.date, week: r.week, langHours: r.langHours || 0, minHours: r.minHours || 0,
        workout: !!r.workout, bible: !!r.bible, quietTime: !!r.quietTime, oneOnOne: !!r.oneOnOne,
        sharedFaith: !!r.sharedFaith, sabbath: !!r.sabbath,
        clarity: r.clarity == null ? null : r.clarity, growth: r.growth == null ? null : r.growth,
        lonely: r.lonely == null ? null : r.lonely, porn: !!r.porn,
        habits: habits
      };
      hidden.forEach(function (id) {
        if (LEGACY_HABIT_COLS.indexOf(id) > -1) delete out[id];
      });
      return out;
    });
}

async function getMyLogs(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getDaily_();
  return {
    ok: true, logs: logsFor_(rows, s.id), profile: { debt: s.debt },
    habits: habitsOf_(s), bibleDay: s.bibleDay || 0
  };
}

/* ---- mentor requests: picking a mentor doesn't grant access by itself —
   the mentor must accept it here first. ---- */
async function getMyMentees(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const mine = rows.filter(function (x) { return x.active && x.mentorId === s.id && x.mentorStatus === 'approved'; }).map(publicStaff_);
  return { ok: true, mentees: mine };
}
async function getMenteeLogs(username, pin, menteeId) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const m = rows.find(function (x) { return x.id === menteeId; });
  if (!m || m.mentorId !== s.id || m.mentorStatus !== 'approved') return { ok: false, err: 'not_your_mentee' };
  const dailyRows = await getDaily_();
  // Only the habits this person chose to share, and they're told which those are.
  const cfg = habitsOf_(m);
  /* Their weekly check-ins, by name, to their ONE approved mentor. Survey rows
     are keyed by token, so this join — token back to person — happens nowhere
     else; the base average never sees it. */
  let checkins = [];
  if (m.surveyToken) {
    checkins = (await getSurvey_())
      .filter(function (r) { return r.device === m.surveyToken && yearOf_(r) === currentYear_(); })
      .map(function (r) {
        return {
          week: Number(r.week), lonely: r.lonely, clarity: r.clarity, porn: r.porn,
          oneOnOne: r.oneOnOne, exercise: r.exercise, quietTime: r.quietTime, debt: r.debt,
          langHours: r.langHours, minHours: r.minHours, sharedFaith: r.sharedFaith,
          sabbath: r.sabbath, growth: r.growth, days: r.days || 0,
          source: r.source || 'daily'
        };
      })
      .sort(function (a, b) { return b.week - a.week; });
  }
  return {
    ok: true, mentee: publicStaff_(m),
    logs: logsFor_(dailyRows, m.id, cfg),
    sharedHabits: cfg.filter(function (h) { return h.mentorVisible; }),
    goals: goalsFor_(await getGoals_(), m.id),
    checkins: checkins,
    profile: { debt: m.debt }
  };
}
async function getMyMentorRequests(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const pending = rows.filter(function (x) { return x.active && x.mentorId === s.id && x.mentorStatus === 'pending'; }).map(publicStaff_);
  return { ok: true, requests: pending };
}
async function respondToMentorRequest(username, pin, menteeId, approve) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (x) { return x.id === menteeId; });
  if (idx === -1 || rows[idx].mentorId !== s.id) return { ok: false, err: 'not_found' };
  if (approve) rows[idx].mentorStatus = 'approved';
  else { rows[idx].mentorId = ''; rows[idx].mentorStatus = ''; }
  await saveStaff_(rows);
  return getMyMentorRequests(username, pin);
}

/* ==================== DASHBOARD: entries / OKRs / survey ==================== */
async function getEntries_() { return readJSON('entries', []); }
async function getOkrs_() { return readJSON('okrs', []); }
async function getSurvey_() { return readJSON('survey', []); }

async function getData(code, year) {
  const leader = isLeader_(code);
  const yr = askedYear_(year);
  const entryRows = (await getEntries_()).filter(inYear_(yr));
  const entries = {};
  entryRows.forEach(function (r) {
    const dept = r.dept === 'Base Director' ? 'Base Leadership' : r.dept; // rename migration
    if (!leader && SENSITIVE.indexOf(r.metric) > -1) return;
    const val = Number(r.value);
    if (!r.campus || isNaN(val)) return;
    const key = dept + '|' + r.ministry + '|' + r.metric;
    if (!entries[r.campus]) entries[r.campus] = {};
    if (!entries[r.campus][key]) entries[r.campus][key] = {};
    entries[r.campus][key][String(r.week)] = val;
  });

  const okrRows = await getOkrs_();
  const okrs = [], byId = {};
  okrRows.forEach(function (o) {
    if (!o.id) return;
    if (!byId[o.id]) {
      byId[o.id] = { id: o.id, campus: o.campus, quarter: Number(o.quarter), dept: o.dept, objective: o.objective, krs: [] };
      okrs.push(byId[o.id]);
    }
    byId[o.id].krs.push({ text: o.kr, metricKey: o.metricKey || '', target: Number(o.target) || 0, manual: Number(o.manualPct) || 0 });
  });

  const nn = function (v) { const n = Number(v); return (v === '' || v == null || isNaN(n)) ? null : n; };
  const surveyRows = (await getSurvey_()).filter(inYear_(yr));
  const survey = surveyRows.map(function (s) {
    return {
      campus: s.campus, week: Number(s.week), device: s.device,
      lonely: Number(s.lonely), clarity: Number(s.clarity), porn: Number(s.porn), oneOnOne: Number(s.oneOnOne),
      exercise: Number(s.exercise), quietTime: Number(s.quietTime), debt: Number(s.debt),
      langHours: Number(s.langHours) || 0, minHours: Number(s.minHours) || 0,
      sharedFaith: nn(s.sharedFaith), sabbath: nn(s.sabbath), growth: nn(s.growth)
    };
  });

  /* The roster rides along: the dashboard needs it for the staff headcount and was
     fetching it as a second request, and teamRoster is already unauthenticated, so
     this exposes nothing new — it just costs one invocation instead of two. */
  const roster = (await getStaff_()).filter(function (s) { return s.active; }).map(publicStaff_);

  /* `year` goes back so a page can tell which year it is looking at without
     recomputing it — the two pages disagree slightly about week numbering, and
     they must not also disagree about the year. */
  return { leader: leader, year: yr, entries: entries, okrs: okrs, survey: survey, roster: roster };
}

/* Writing ministry numbers now requires saying who you are.

   It used to accept any POST at all: the front door gated the log form in the UI
   and the endpoint itself checked nothing, so anyone who found the URL could
   rewrite any campus's figures. Two ways in now, and one of them has to hold:
     - the leadership code, which may write any campus, as before; or
     - a username + PIN, which may write ONLY that person's own campus.
   The campus lock is the one Uriah asked for — "they should only log numbers for
   the campus they're logged in as" — and it costs nobody access, because the UI
   has required an account to reach this form since the front door was added.
   A staff member with no campus on their record is refused rather than guessed at. */
async function saveEntries(campus, updates, code, username, pin) {
  const leader = isLeader_(code);
  let writer = null;
  if (!leader) {
    writer = await verifyStaff_(username, pin);
    if (!writer) return { ok: false, err: 'auth' };
    if (!writer.campus) return { ok: false, err: 'no_campus' };
  }
  const rows = await getEntries_();
  const now = new Date().toISOString();
  const yr = currentYear_();
  campus = str_(campus, 40);
  if (!campus) return getData(code);
  // Staff write their own campus whatever the request says it is.
  if (writer && campus !== writer.campus) return { ok: false, err: 'wrong_campus' };
  (updates || []).forEach(function (u) {
    const dept = str_(u.dept, 80), ministry = str_(u.ministry, 80), metric = str_(u.metric, 80);
    const week = finiteNum_(u.week, 1, 52);
    if (!dept || !ministry || !metric || week == null) return;
    // Reads are already filtered by leader status in getData(); mirror that
    // here so a non-leader can't blindly overwrite a value they can't see.
    if (!leader && SENSITIVE.indexOf(metric) > -1) return;
    const idx = rows.findIndex(function (r) {
      return r.campus === campus && r.dept === dept && r.ministry === ministry &&
        r.metric === metric && String(r.week) === String(week) && yearOf_(r) === yr;
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) rows.splice(idx, 1);
      return;
    }
    const value = finiteNum_(u.value, -1e9, 1e9);
    if (value == null) return;
    if (idx > -1) {
      rows[idx].value = value; rows[idx].updated = now; rows[idx].year = yr;
    } else {
      rows.push({ campus: campus, dept: dept, ministry: ministry, metric: metric,
        week: week, year: yr, value: value, updated: now });
    }
  });
  await writeJSON('entries', rows);
  return getData(code);
}

/* ---------- who may write an objective ----------
   Two callers, two rules. Leadership (the leader code, from the dashboard) may
   write any objective. A signed-in staff member (username + PIN, from their own
   Me page) may write objectives for THEIR OWN campus and department and nothing
   else — a staff member editing their team's objectives is the point of the
   feature, editing another team's is not.

   Two things make that a real boundary rather than a hopeful one:
     - the campus and department are taken from the STAFF RECORD, never from the
       payload, so a crafted request cannot claim someone else's department;
     - an existing objective is only writable if it already belongs to that
       campus and department, so an id cannot be used to hijack another team's.

   'Base Director' is the old name for what is now the Base Leadership
   department; profiles created before the rename still carry it. */
function deptOf_(s) { return s.dept === 'Base Director' ? 'Base Leadership' : s.dept; }

async function okrWriter_(code, username, pin) {
  if (isLeader_(code)) return { leader: true };
  const s = await verifyStaff_(username, pin);
  if (!s) return null;
  return { leader: false, campus: s.campus, dept: deptOf_(s) };
}

async function saveObjective(obj, code, username, pin) {
  const who = await okrWriter_(code, username, pin);
  if (!who) return getData(code);

  const id = str_(obj && obj.id, 100);
  const objective = str_(obj && obj.objective, 300);
  const quarter = finiteNum_(obj && obj.quarter, 1, 4);
  // Staff are pinned to their own campus and department; leaders say which.
  const campus = who.leader ? str_(obj && obj.campus, 40) : who.campus;
  const dept = who.leader ? str_(obj && obj.dept, 80) : who.dept;
  if (!id || !campus || !dept || !objective || quarter == null) return getData(code);

  let rows = await getOkrs_();
  if (!who.leader) {
    // Editing an existing objective is only allowed if it is already theirs.
    const existing = rows.filter(function (r) { return String(r.id) === id; });
    const foreign = existing.some(function (r) {
      return r.campus !== who.campus || deptOf_(r) !== who.dept;
    });
    if (foreign) return getData(code);
  }
  rows = rows.filter(function (r) { return String(r.id) !== id; });
  const now = new Date().toISOString();
  (Array.isArray(obj.krs) ? obj.krs.slice(0, 10) : []).forEach(function (kr) {
    const text = str_(kr && kr.text, 300);
    if (!text) return;
    rows.push({
      campus: campus, quarter: quarter, dept: dept, id: id, objective: objective,
      kr: text, metricKey: str_(kr.metricKey, 200) || '',
      target: finiteNum_(kr.target, 0, 1e9) || 0, manualPct: finiteNum_(kr.manual, 0, 100) || 0, updated: now
    });
  });
  await writeJSON('okrs', rows);
  return getData(code);
}

async function deleteObjective(id, code, username, pin) {
  const who = await okrWriter_(code, username, pin);
  if (!who) return getData(code);
  let rows = await getOkrs_();
  if (!who.leader) {
    const existing = rows.filter(function (r) { return String(r.id) === String(id); });
    if (!existing.length) return getData(code);
    const foreign = existing.some(function (r) {
      return r.campus !== who.campus || deptOf_(r) !== who.dept;
    });
    if (foreign) return getData(code);
  }
  rows = rows.filter(function (r) { return String(r.id) !== String(id); });
  await writeJSON('okrs', rows);
  return getData(code);
}

/* ==================== weekly goals ====================
   Three goals a week, written at the start and checked off at the end. Keyed
   by ISO week number to match how entries/survey already store weeks (no
   year component — same convention, same caveat at a year boundary). */
const MAX_GOALS = 3;

async function getGoals_() { return readJSON('goals', []); }

/* A goal's progress is a percentage, not a tick. Ministry work rarely lands on
   "done" or "not done" — you discipled two of the three students you meant to, the
   curriculum is most of the way written — and a checkbox forced people to round
   an honest 60% to one of those two lies. Three goals used to mean the week could
   only ever read 0, 33, 67 or 100%.
   Rows written before this store `done` instead, so read through goalItemPct_:
   an old ticked goal is 100 and an unticked one is 0, which is exactly what they
   meant. `done` is still returned, derived, because a few read paths show a tick. */
function goalItemPct_(i) {
  if (!i) return 0;
  const n = finiteNum_(i.pct, 0, 100);
  if (n != null) return Math.round(n);
  return i.done ? 100 : 0;
}

function goalsFor_(rows, staffId, year) {
  const yr = askedYear_(year);
  return rows.filter(function (r) { return r.staffId === staffId && yearOf_(r) === yr; })
    .slice()
    .sort(function (a, b) { return Number(b.week) - Number(a.week); })
    .map(function (r) {
      const items = (r.items || []).map(function (i) {
        const pct = goalItemPct_(i);
        return { text: i.text || '', pct: pct, done: pct >= 100, metricKey: i.metricKey || '' };
      });
      return { week: Number(r.week), items: items, pct: goalPct_(items), updated: r.updated };
    });
}

/* The week is the average of what you actually moved, not a count of finished
   ones — three goals at 60% is a 60% week, which is the honest reading.
   null (not 0%) when nothing was written, so "no goals set" and "set them and
   moved none of them" stay distinguishable in the mentor view. */
function goalPct_(items) {
  const written = (items || []).filter(function (i) { return i && i.text; });
  if (!written.length) return null;
  const total = written.reduce(function (a, i) { return a + goalItemPct_(i); }, 0);
  return Math.round(total / written.length);
}

async function saveGoals(username, pin, week, items) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const wk = finiteNum_(week, 1, 52);
  if (wk == null) return { ok: false, err: 'bad_week' };
  const clean = (Array.isArray(items) ? items.slice(0, MAX_GOALS) : []).map(function (i) {
    return {
      text: str_(i && i.text, 200) || '',
      /* pct is the stored truth; `done` goes with it so a client reading the blob
         directly, or an older cached page, still sees something sensible. */
      pct: goalItemPct_(i), done: goalItemPct_(i) >= 100,
      // Optional "dept|ministry|metric" — links a goal to the KPI it moves, so
      // personal follow-through and ministry output read as one thing.
      metricKey: str_(i && i.metricKey, 200) || ''
    };
  });
  const rows = await getGoals_();
  const yr = currentYear_();
  const idx = rows.findIndex(function (r) {
    return r.staffId === s.id && Number(r.week) === wk && yearOf_(r) === yr;
  });
  const rec = { staffId: s.id, week: wk, year: yr, items: clean, updated: new Date().toISOString() };
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('goals', rows);
  return { ok: true, goals: goalsFor_(rows, s.id) };
}

/* ==================== weekly health, derived from the daily log ====================
   There is no separate weekly survey form any more: it asked the same eleven
   questions as the daily check-in, just summarised, so people were entering
   the same information twice. The week's row is now computed from that week's
   daily logs every time a day is saved.

   It writes into the same 'survey' blob the anonymous device survey uses, so
   the base health score picks it up with no extra plumbing. Rows are keyed by
   a random per-staff token held on the staff record and never exposed through
   publicStaff_ — one person is one row per week, but nobody reading the survey
   can tie a row back to a name.

   Thresholds match what the old form asked in words ("exercised 3+ days",
   "regular quiet time"); the yes/no ones are "did this happen at all this
   week", and the 1-10 scales average the days actually logged. */
/* Thresholds are RATES over the days actually logged, not absolute day counts.
   Counting absolute days conflated "didn't do it" with "didn't log it": someone
   logging two days a week could never reach 3 workout days, so they scored zero
   on exercise even having worked out both days — and that depressed score fed
   the base health total, making the base look unhealthy when it was only
   under-logged. Rates ask "how much of your logged week looked like this",
   which is answerable however often you log.
   (3/7 and 4/7 are the old "3+ days" and "regular" bars expressed as rates.) */
const WEEK_EXERCISE_RATE = 3 / 7;
const WEEK_QUIETTIME_RATE = 4 / 7;

/* …but a rate off one or two days is noise, and one enthusiastic Monday
   shouldn't speak for a whole week in the base total. Below this many logged
   days the week is treated as not yet reportable: no survey row is written, and
   any existing row for that week is removed. Tune freely — it's the one knob
   that decides how much logging counts as "a week". */
const MIN_WEEK_DAYS = 3;

function surveyTokenFor_(rec) {
  if (!rec.surveyToken) rec.surveyToken = 'st' + crypto.randomBytes(9).toString('hex');
  return rec.surveyToken;
}

function weekSurveyFrom_(logs, s, token, wk) {
  const days = logs.filter(function (r) { return Number(r.week) === wk; });
  const anyOf = function (k) { return days.some(function (r) { return !!r[k]; }) ? 1 : 0; };
  const countOf = function (k) { return days.filter(function (r) { return !!r[k]; }).length; };
  const meanOf = function (k) {
    const vals = days.map(function (r) { return r[k]; }).filter(function (v) { return v != null && !isNaN(Number(v)); });
    if (!vals.length) return 0;
    return Math.round(vals.reduce(function (a, b) { return a + Number(b); }, 0) / vals.length);
  };
  const sumOf = function (k) {
    return days.reduce(function (a, r) { return a + (Number(r[k]) || 0); }, 0);
  };
  return {
    campus: s.campus, week: wk, year: currentYear_(), device: token,
    lonely: meanOf('lonely'), clarity: meanOf('clarity'), growth: meanOf('growth'),
    porn: anyOf('porn'), oneOnOne: anyOf('oneOnOne'), sharedFaith: anyOf('sharedFaith'),
    sabbath: anyOf('sabbath'),
    exercise: days.length && countOf('workout') / days.length >= WEEK_EXERCISE_RATE ? 1 : 0,
    quietTime: days.length && countOf('quietTime') / days.length >= WEEK_QUIETTIME_RATE ? 1 : 0,
    debt: s.debt ? 1 : 0,
    langHours: sumOf('langHours'), minHours: sumOf('minHours'),
    days: days.length,
    updated: new Date().toISOString()
  };
}

/* Recompute and store the week's survey row. Returns it so the UI can show
   what the base will see without asking for any of it again. */
async function syncWeekSurvey_(s, wk, dailyRows) {
  const staffRows = await getStaff_();
  const si = staffRows.findIndex(function (r) { return r.id === s.id; });
  if (si === -1) return null;
  const token = surveyTokenFor_(staffRows[si]);
  await saveStaff_(staffRows);

  const mine = dailyRows.filter(function (r) { return r.staffId === s.id; });
  const rec = weekSurveyFrom_(mine, staffRows[si], token, wk);
  const rows = await getSurvey_();
  const idx = rows.findIndex(function (r) {
    return r.campus === s.campus && Number(r.week) === wk && r.device === token &&
      yearOf_(r) === rec.year;
  });

  // Too few days to speak for a week: publish nothing, and withdraw anything
  // published earlier for this week so a thin week can't sit in the base total.
  if (rec.days < MIN_WEEK_DAYS) {
    if (idx > -1) {
      rows.splice(idx, 1);
      await writeJSON('survey', rows);
    }
    return { pending: true, week: wk, days: rec.days, need: MIN_WEEK_DAYS };
  }

  /* A week answered by hand wins over one derived from days. Filling in the
     weekly form is a deliberate statement about the week; the daily roll-up is
     an inference from however many days got logged. So the sync leaves a
     hand-entered row alone rather than quietly overwriting it. */
  if (idx > -1 && rows[idx].source === 'weekly') return rows[idx];

  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('survey', rows);
  return rec;
}

/* ---------- the weekly check-in, filled in by hand ----------
   Daily logging turned out not to be sustainable, so this is the primary way a
   week gets answered. It writes to the SAME survey row the daily roll-up would
   have written — one row per person per week, keyed by their survey token — so
   the two paths can never double-count somebody.

   The token is what makes the base average anonymous and the mentor view
   possible at the same time: survey rows carry a token, never a name, so
   anything pooled across the base is nameless by construction; and only the
   person's own record maps their token back to them, which is how their ONE
   approved mentor — and nobody else — can be shown their answers. */
const WEEK_SCALES = ['lonely', 'clarity', 'growth'];
const WEEK_FLAGS = ['porn', 'oneOnOne', 'exercise', 'quietTime', 'debt', 'sharedFaith', 'sabbath'];
const WEEK_HOURS = ['langHours', 'minHours'];

async function saveMyWeek(username, pin, week, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  /* 1-52, the same bound as saveEntries and the week pickers. This used to allow
     53, which no client can offer and no screen can read back, so such a row
     would sit in the base average invisible to the person who wrote it. */
  const wk = finiteNum_(week, 1, 52);
  if (wk == null) return { ok: false, err: 'bad_week' };
  const p = payload || {};

  const staffRows = await getStaff_();
  const si = staffRows.findIndex(function (r) { return r.id === s.id; });
  if (si === -1) return { ok: false };
  const token = surveyTokenFor_(staffRows[si]);
  await saveStaff_(staffRows);

  const rec = { campus: s.campus, week: wk, year: currentYear_(), device: token, source: 'weekly',
    days: 7, updated: new Date().toISOString() };
  WEEK_SCALES.forEach(function (k) { rec[k] = finiteNum_(p[k], 1, 10); });
  WEEK_FLAGS.forEach(function (k) { rec[k] = p[k] ? 1 : 0; });
  WEEK_HOURS.forEach(function (k) { rec[k] = finiteNum_(p[k], 0, 168) || 0; });
  // Every 1-10 question has to be answered, or the composite is built on gaps.
  if (WEEK_SCALES.some(function (k) { return rec[k] == null; })) return { ok: false, err: 'incomplete' };

  // Staff debt is part of the profile, not just this week's answer.
  staffRows[si].debt = !!p.debt;
  await saveStaff_(staffRows);

  const rows = await getSurvey_();
  const idx = rows.findIndex(function (r) {
    return r.campus === s.campus && Number(r.week) === wk && r.device === token &&
      yearOf_(r) === rec.year;
  });
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('survey', rows);
  return getMyWeekly(username, pin);
}

async function deleteMyWeek(username, pin, week) {
  const s = await verifyStaff_(username, pin);
  if (!s || !s.surveyToken) return { ok: false };
  const wk = finiteNum_(week, 1, 52);
  if (wk == null) return { ok: false, err: 'bad_week' };
  let rows = await getSurvey_();
  const yr = currentYear_();
  rows = rows.filter(function (r) {
    return !(r.device === s.surveyToken && Number(r.week) === wk && yearOf_(r) === yr);
  });
  await writeJSON('survey', rows);
  return getMyWeekly(username, pin);
}

/* One call for everything the staff home page needs beyond the daily logs. */
async function getMyWeekly(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const goals = goalsFor_(await getGoals_(), s.id);
  // Read-only now — these are derived from the daily logs, not filled in.
  let checkins = [];
  if (s.surveyToken) {
    checkins = (await getSurvey_())
      .filter(function (r) { return r.device === s.surveyToken && yearOf_(r) === currentYear_(); })
      .map(function (r) {
        return {
          week: Number(r.week), lonely: r.lonely, clarity: r.clarity, porn: r.porn,
          oneOnOne: r.oneOnOne, exercise: r.exercise, quietTime: r.quietTime, debt: r.debt,
          langHours: r.langHours, minHours: r.minHours, sharedFaith: r.sharedFaith,
          sabbath: r.sabbath, growth: r.growth, days: r.days || 0,
          source: r.source || 'daily'
        };
      })
      .sort(function (a, b) { return b.week - a.week; });
  }
  return { ok: true, goals: goals, checkins: checkins };
}

/* ==================== a staff member's own ministry KPIs ====================
   Scoped harder than the leader path on purpose: a staff member can only read
   and write their OWN campus + department + ministry, and never a SENSITIVE
   metric, regardless of what the client sends. */
async function getMyMinistry(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const out = {}, daily = {};
  const yr = currentYear_();
  if (s.ministry) {
    (await getEntries_()).forEach(function (r) {
      if (r.campus !== s.campus || r.dept !== s.dept || r.ministry !== s.ministry) return;
      if (SENSITIVE.indexOf(r.metric) > -1) return;
      if (yearOf_(r) !== yr) return;
      if (!out[r.metric]) out[r.metric] = {};
      out[r.metric][String(r.week)] = Number(r.value);
    });
    // Per-day values so the UI can show what's already logged for today and
    // for the rest of this week.
    (await getKpiDaily_()).forEach(function (r) {
      if (r.campus !== s.campus || r.dept !== s.dept || r.ministry !== s.ministry) return;
      if (yearOf_(r) !== yr) return;
      if (!daily[r.metric]) daily[r.metric] = {};
      daily[r.metric][r.date] = Number(r.value);
    });
  }
  return {
    ok: true, campus: s.campus, dept: s.dept, ministry: s.ministry || '',
    entries: out, daily: daily, pins: Array.isArray(s.kpiPins) ? s.kpiPins : []
  };
}

async function saveMyMinistry(username, pin, week, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!s.ministry) return { ok: false, err: 'no_ministry' };
  const wk = finiteNum_(week, 1, 52);
  if (wk == null) return { ok: false, err: 'bad_week' };
  const rows = await getEntries_();
  const now = new Date().toISOString();
  const yr = currentYear_();
  (Array.isArray(updates) ? updates : []).forEach(function (u) {
    const metric = str_(u && u.metric, 80);
    if (!metric || SENSITIVE.indexOf(metric) > -1) return;
    const idx = rows.findIndex(function (r) {
      return r.campus === s.campus && r.dept === s.dept && r.ministry === s.ministry &&
        r.metric === metric && String(r.week) === String(wk) && yearOf_(r) === yr;
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) rows.splice(idx, 1);
      return;
    }
    const value = finiteNum_(u.value, -1e9, 1e9);
    if (value == null) return;
    if (idx > -1) { rows[idx].value = value; rows[idx].updated = now; }
    else rows.push({ campus: s.campus, dept: s.dept, ministry: s.ministry, metric: metric, week: wk, year: yr, value: value, updated: now });
  });
  await writeJSON('entries', rows);
  return getMyMinistry(username, pin);
}

/* ==================== ministry KPIs, logged day by day ====================
   Staff asked to stop entering a weekly figure on top of daily work. So the
   day is what gets typed, and the week's number in `entries` — the one the
   dashboard reads — is recomputed from those days. One place to enter, and
   the weekly total follows.

   Daily rows live in their own blob so a correction to Tuesday just changes
   Tuesday. The weekly figure is always derived, never typed twice.

   Aggregation has to match how the dashboard reads each metric, and that rule
   (sum / latest / avg) lives in the frontend taxonomy, so the client sends it
   and the server validates it's one of the three. Worst case a wrong mode
   misaggregates that ministry's own metric — it can't reach anything else. */
const KPI_MODES = ['sum', 'latest', 'avg'];

async function getKpiDaily_() { return readJSON('kpiDaily', []); }

function rollUpKpi_(dayRows, mode) {
  const vals = dayRows.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  if (!vals.length) return null;
  if (mode === 'latest') return Number(vals[vals.length - 1].value);
  const nums = vals.map(function (r) { return Number(r.value) || 0; });
  if (mode === 'avg') return Math.round((nums.reduce(function (a, b) { return a + b; }, 0) / nums.length) * 10) / 10;
  return nums.reduce(function (a, b) { return a + b; }, 0);
}

async function saveMyKpiDay(username, pin, dateStr, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!s.ministry) return { ok: false, err: 'no_ministry' };
  const date = str_(dateStr, 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, err: 'bad_date' };
  const wk = isoWeek_(date);

  const daily = await getKpiDaily_();
  const touched = {};
  (Array.isArray(updates) ? updates : []).forEach(function (u) {
    const metric = str_(u && u.metric, 80);
    if (!metric || SENSITIVE.indexOf(metric) > -1) return;
    const mode = KPI_MODES.indexOf(u && u.mode) > -1 ? u.mode : 'sum';
    touched[metric] = mode;
    const idx = daily.findIndex(function (r) {
      return r.campus === s.campus && r.dept === s.dept && r.ministry === s.ministry &&
        r.metric === metric && r.date === date;
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) daily.splice(idx, 1);
      return;
    }
    const value = finiteNum_(u.value, -1e9, 1e9);
    if (value == null) return;
    const rec = {
      campus: s.campus, dept: s.dept, ministry: s.ministry, metric: metric,
      date: date, week: wk, year: yearFromDate_(date) || currentYear_(),
      value: value, staffId: s.id, updated: new Date().toISOString()
    };
    if (idx > -1) daily[idx] = rec; else daily.push(rec);
  });
  await writeJSON('kpiDaily', daily);

  // Push the derived weekly totals into the shared entries the dashboard reads.
  const entries = await getEntries_();
  const now = new Date().toISOString();
  /* The days themselves are dated, so the week they roll into belongs to the year
     those days are in — not to whatever year it happens to be when this runs. */
  const dayYear = yearFromDate_(date) || currentYear_();
  Object.keys(touched).forEach(function (metric) {
    const days = daily.filter(function (r) {
      return r.campus === s.campus && r.dept === s.dept && r.ministry === s.ministry &&
        r.metric === metric && Number(r.week) === wk && yearOf_(r) === dayYear;
    });
    const total = rollUpKpi_(days, touched[metric]);
    const ei = entries.findIndex(function (r) {
      return r.campus === s.campus && r.dept === s.dept && r.ministry === s.ministry &&
        r.metric === metric && String(r.week) === String(wk) && yearOf_(r) === dayYear;
    });
    if (total === null) { if (ei > -1) entries.splice(ei, 1); return; }
    if (ei > -1) { entries[ei].value = total; entries[ei].updated = now; }
    else entries.push({ campus: s.campus, dept: s.dept, ministry: s.ministry, metric: metric, week: wk, year: dayYear, value: total, updated: now });
  });
  await writeJSON('entries', entries);
  return getMyMinistry(username, pin);
}

/* ==================== away from campus ====================
   Staff record the days they're off base and what for, and it doubles as the
   check-in with their mentor: if they have an approved mentor the trip lands as
   'pending' for that mentor to acknowledge; if they don't, it's simply 'noted'
   so nobody is blocked from recording their own days by not having a mentor.

   Two kinds only — work and personal — because that's what the annual total
   needs to separate. The reason is finer detail for context, not a third
   category, so adding reasons later never breaks the totals.

   Days are whole and inclusive: leaving Friday and back Sunday is 3 days. No
   half-days; the annual figure is for planning, not payroll. */
const AWAY_KINDS = ['work', 'personal'];
const AWAY_REASONS = {
  work:     ['Outreach', 'Conference or training', 'Ministry travel', 'Base business', 'Other work'],
  personal: ['Fundraising / home ministry', 'Visiting family', 'Medical', 'Holiday / rest', 'Other personal']
};
const MAX_TRIP_DAYS = 365;

async function getTrips_() { return readJSON('trips', []); }

function isDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function tripDays_(from, to) {
  const a = new Date(from + 'T00:00:00Z'), b = new Date(to + 'T00:00:00Z');
  return Math.round((b - a) / 86400000) + 1;
}

/* Totals per calendar year, split by kind. Declined trips never count; a trip
   is attributed to the year it starts in so a New Year crossing lands in one
   place rather than being split. */
function awayTotals_(trips) {
  const out = {};
  trips.forEach(function (r) {
    if (r.status === 'declined') return;
    const year = String(r.from).slice(0, 4);
    if (!out[year]) out[year] = { work: 0, personal: 0, trips: 0 };
    if (AWAY_KINDS.indexOf(r.kind) === -1) return;
    out[year][r.kind] += Number(r.days) || 0;
    out[year].trips += 1;
  });
  return out;
}

function tripOut_(r) {
  return {
    id: r.id, from: r.from, to: r.to, days: r.days, kind: r.kind,
    reason: r.reason || '', where: r.where || '', note: r.note || '',
    status: r.status, decidedAt: r.decidedAt || ''
  };
}

async function getMyTrips(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const mine = (await getTrips_()).filter(function (r) { return r.staffId === s.id; })
    .sort(function (a, b) { return a.from < b.from ? 1 : -1; });
  return {
    ok: true, trips: mine.map(tripOut_), totals: awayTotals_(mine),
    reasons: AWAY_REASONS,
    hasMentor: !!(s.mentorId && s.mentorStatus === 'approved')
  };
}

async function saveTrip(username, pin, trip) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const t = trip || {};
  if (!isDate_(t.from) || !isDate_(t.to)) return { ok: false, err: 'bad_dates' };
  if (t.to < t.from) return { ok: false, err: 'end_before_start' };
  const days = tripDays_(t.from, t.to);
  if (days < 1 || days > MAX_TRIP_DAYS) return { ok: false, err: 'bad_span' };
  const kind = AWAY_KINDS.indexOf(t.kind) > -1 ? t.kind : 'work';
  const reason = (AWAY_REASONS[kind].indexOf(t.reason) > -1) ? t.reason : AWAY_REASONS[kind][0];

  const rows = await getTrips_();
  const now = new Date().toISOString();
  const mentored = !!(s.mentorId && s.mentorStatus === 'approved');
  // Editing an existing trip re-opens it for the mentor rather than keeping a
  // stale approval for dates that have since changed.
  const existingIdx = t.id ? rows.findIndex(function (r) { return r.id === t.id && r.staffId === s.id; }) : -1;
  const rec = {
    id: existingIdx > -1 ? rows[existingIdx].id : ('tr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    staffId: s.id, campus: s.campus,
    from: t.from, to: t.to, days: days, kind: kind, reason: reason,
    where: str_(t.where, 120) || '', note: str_(t.note, 300) || '',
    mentorId: mentored ? s.mentorId : '',
    status: mentored ? 'pending' : 'noted',
    decidedBy: '', decidedAt: '',
    created: existingIdx > -1 ? rows[existingIdx].created : now, updated: now
  };
  if (existingIdx > -1) rows[existingIdx] = rec; else rows.push(rec);
  await writeJSON('trips', rows);
  return getMyTrips(username, pin);
}

async function deleteTrip(username, pin, tripId) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  let rows = await getTrips_();
  rows = rows.filter(function (r) { return !(r.id === tripId && r.staffId === s.id); });
  await writeJSON('trips', rows);
  return getMyTrips(username, pin);
}

/* Mentor side: the trips waiting on you, and each mentee's year to date. */
async function getTripRequests(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const staff = await getStaff_();
  const trips = await getTrips_();
  const pending = trips.filter(function (r) { return r.mentorId === s.id && r.status === 'pending'; })
    .sort(function (a, b) { return a.from < b.from ? -1 : 1; })
    .map(function (r) {
      const who = staff.find(function (x) { return x.id === r.staffId; });
      return Object.assign(tripOut_(r), { staffId: r.staffId, name: who ? who.name : '—' });
    });
  return { ok: true, requests: pending };
}

async function respondToTrip(username, pin, tripId, approve) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getTrips_();
  const idx = rows.findIndex(function (r) { return r.id === tripId && r.mentorId === s.id; });
  if (idx === -1) return { ok: false, err: 'not_found' };
  rows[idx].status = approve ? 'approved' : 'declined';
  rows[idx].decidedBy = s.id;
  rows[idx].decidedAt = new Date().toISOString();
  rows[idx].updated = rows[idx].decidedAt;
  await writeJSON('trips', rows);
  return getTripRequests(username, pin);
}

/* ==================== a teammate's public profile ====================
   What one staff member may see about another: who they are, what ministry
   they're in, and their weekly goals — work commitments the team is meant to
   know about and cheer on.

   Everything the app treats as private stays out of here, and it's an allowlist
   rather than a blocklist so a field added to the staff record later can't leak
   by default: no loneliness, no porn, no staff debt, no clarity/growth scores,
   no health score, and no habit data — habits are governed by the per-habit
   mentor consent flag and sharing them team-wide would go behind that.

   Requires the caller's own PIN: the roster is browsable, but goals are only
   for people who are actually on the team, never anonymous visitors. */
const PUBLIC_GOAL_WEEKS = 4;

async function staffProfile(username, pin, staffId) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  const rows = await getStaff_();
  const p = rows.find(function (r) { return r.id === staffId && r.active; });
  if (!p) return { ok: false, err: 'not_found' };

  const goals = goalsFor_(await getGoals_(), p.id).slice(0, PUBLIC_GOAL_WEEKS);
  // Aggregate participation only — how consistently someone shows up is fair
  // encouragement; what they logged on any given day is not.
  const mine = (await getDaily_()).filter(function (r) { return r.staffId === p.id; });
  const weeks = {};
  mine.forEach(function (r) { weeks[String(r.week)] = 1; });
  const dates = mine.map(function (r) { return r.date; }).sort();

  /* Days away, work only. Whether someone travels a lot for ministry is team
     information — it explains why they're not around. Personal days (family,
     medical, fundraising) are nobody else's business, so only the count of
     WORK days crosses this line, and never the reasons or dates. */
  const myTrips = (await getTrips_()).filter(function (r) {
    return r.staffId === p.id && r.status !== 'declined' && r.kind === 'work';
  });
  const awayWork = {};
  Object.keys(awayTotals_(myTrips)).forEach(function (y) {
    awayWork[y] = awayTotals_(myTrips)[y].work;
  });

  return {
    ok: true,
    staff: publicStaff_(p),
    goals: goals,
    activity: {
      weeksTracked: Object.keys(weeks).length,
      daysLogged: mine.length,
      lastLogged: dates.length ? dates[dates.length - 1] : ''
    },
    awayWork: awayWork,
    isMe: p.id === me.id
  };
}

/* ---------- one call for a page open ----------
   Opening the staff page used to fire ten separate function invocations —
   staffLogin, teamRoster, getMyLogs, getMyMentees, getMyMentorRequests,
   getMyWeekly, getMyTrips, getTripRequests, getMyMinistry and getData — eight of
   which verified the same PIN against the same staff blob, and each of which
   re-rendered the page when it landed.

   This is the same data in one invocation, with the PIN checked once. The
   individual handlers all stay, because everything after boot (saving a day,
   answering a week, approving a request) still uses them and should keep
   returning just the slice it changed.

   It deliberately does NOT fail as a unit: each section is caught on its own, so
   a problem reading trips cannot stop the page from having the base's figures. */
async function getMyBoot(username, pin) {
  const s = await verifyStaff_(username, pin);
  // `err:'auth'` on purpose: the page must be able to tell "your PIN is wrong"
  // from "the request failed", because only the first should log somebody out.
  if (!s) return { ok: false, err: 'auth' };

  const part = async function (fn) {
    try { return await fn(); } catch (e) { return null; }
  };
  const [staffRows, logs, mentees, requests, weekly, trips, tripReqs, ministry, base] =
    await Promise.all([
      part(function () { return getStaff_(); }),
      part(function () { return getMyLogs(username, pin); }),
      part(function () { return getMyMentees(username, pin); }),
      part(function () { return getMyMentorRequests(username, pin); }),
      part(function () { return getMyWeekly(username, pin); }),
      part(function () { return getMyTrips(username, pin); }),
      part(function () { return getTripRequests(username, pin); }),
      part(function () { return getMyMinistry(username, pin); }),
      // No leader code: the two money metrics leadership can see never reach here.
      part(function () { return getData(''); })
    ]);

  return {
    ok: true,
    staff: publicStaff_(s),
    profile: { phone: s.phone, joined: s.joined, debt: s.debt, mentorStatus: s.mentorStatus || '' },
    roster: (staffRows || []).filter(function (r) { return r.active; }).map(publicStaff_),
    logs: (logs && logs.logs) || [],
    habits: (logs && logs.habits) || null,
    mentees: (mentees && mentees.mentees) || [],
    mentorRequests: (requests && requests.requests) || [],
    goals: (weekly && weekly.goals) || [],
    checkins: (weekly && weekly.checkins) || [],
    trips: trips || null,
    tripRequests: (tripReqs && tripReqs.requests) || [],
    ministry: ministry || null,
    // the roster is already top-level above; no need to ship it twice in one response
    base: base ? Object.assign({}, base, { roster: undefined }) : null
  };
}

/* ==================== programme records (the Ministry report) ====================
   Four project agreements with the Ministry of Education, Youth and Sport — SVI,
   YDC, YLT, YAP. What that report needs is not what the weekly KPIs hold: a
   visiting team's country and dates, a class's male/female split, a cohort's
   Khmer/international breakdown. Those are facts about a thing that happened once,
   so they are records rather than weekly figures, and none of this touches what
   anyone logs each week.

   THE DIRECTION OF TRUTH RUNS ONE WAY. The weekly numbers are what happened; the
   report is written from them. So what is stored here is only what the weekly
   numbers cannot hold — the splits, the names, the dates — plus each ministry's
   own annual estimate. The headline counts in the report are read from the KPI
   entries at render time and are never copied into this blob, because a copy is a
   second answer to a question that already has one.

   One list, discriminated by `kind`, because five blobs would eventually disagree
   about which year a row belongs to. Rows are year-scoped like everything else.

   Any signed-in staff may read and write: ministry leaders enter their own
   programme's teams and classes, which is the only way the data ever gets in.
   A row is stamped with its writer's campus, and only its writer's campus. */
const PROGRAM_IDS = ['SVI', 'YDC', 'YLT', 'YAP'];
const RECORD_KINDS = ['team', 'class', 'cohort', 'group', 'issue', 'estimate'];

/* Mirrors public/programs.js. Kept as a plain allow-list rather than imported,
   because the function bundle does not share the frontend's globals — the test
   asserts the two agree, so a field added there is accepted here. */
const RECORD_FIELDS = {
  team:   ['name', 'country', 'from', 'to', 'male', 'female', 'servedMale', 'servedFemale', 'activities'],
  class:  ['location', 'classes', 'male', 'female', 'activities'],
  cohort: ['name', 'male', 'female', 'intl', 'khmer', 'staffMale', 'staffFemale',
           'staffIntl', 'staffKhmer', 'outreach', 'activities'],
  group:  ['location', 'male', 'female', 'sponsors', 'activities'],
  issue:  ['challenge', 'solution'],
  estimate: ['dept', 'ministry', 'target', 'unit']
};
const NUMERIC_FIELDS = ['male', 'female', 'servedMale', 'servedFemale', 'classes',
  'intl', 'khmer', 'staffMale', 'staffFemale', 'staffIntl', 'staffKhmer', 'target'];

async function getPrograms_() { return readJSON('programs', []); }

/* Which quarter a programme record belongs to. Records are stamped with a quarter
   because it is the finest grain anybody reports on — a six-month report is
   generated by adding two quarters together, while splitting a six-month row back
   into halves cannot be done at all: nothing in it says when the class ran.

   The `semester` fallback is for rows written while this was being built, before
   the switch. Semester 1 lands in Q1 and semester 2 in Q3, which is the earliest
   quarter each could have been, so nothing is reported earlier than it happened. */
function quarterOf_(row) {
  const q = finiteNum_(row && row.quarter, 1, 4);
  if (q != null) return Math.round(q);
  const s = finiteNum_(row && row.semester, 1, 2);
  return s == null ? 1 : (Math.round(s) === 2 ? 3 : 1);
}

function publicRecord_(r) {
  const out = {
    id: r.id, kind: r.kind, program: r.program || '', campus: r.campus || '',
    year: yearOf_(r), quarter: quarterOf_(r),
    updated: r.updated || '', by: r.by || ''
  };
  (RECORD_FIELDS[r.kind] || []).forEach(function (k) {
    if (r[k] !== undefined) out[k] = r[k];
  });
  return out;
}

async function getPrograms(username, pin, year) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false, err: 'auth' };
  const yr = askedYear_(year);
  const rows = (await getPrograms_()).filter(inYear_(yr)).map(publicRecord_);
  return { ok: true, year: yr, records: rows };
}

async function saveProgramRecord(username, pin, rec) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false, err: 'auth' };
  if (!s.campus) return { ok: false, err: 'no_campus' };
  rec = rec || {};

  const kind = str_(rec.kind, 12);
  if (RECORD_KINDS.indexOf(kind) === -1) return { ok: false, err: 'bad_kind' };
  /* `issue` is the base's own challenges for the quarter, not a programme's. */
  const program = str_(rec.program, 8) || '';
  if (kind !== 'issue' && PROGRAM_IDS.indexOf(program) === -1) return { ok: false, err: 'bad_program' };

  const clean = {
    id: str_(rec.id, 40) || ('pr_' + crypto.randomUUID().slice(0, 12)),
    kind: kind, program: kind === 'issue' ? '' : program,
    campus: s.campus,                      // the writer's own, whatever was sent
    year: askedYear_(rec.year),
    quarter: quarterOf_(rec),
    updated: new Date().toISOString(), by: s.id
  };
  RECORD_FIELDS[kind].forEach(function (k) {
    if (NUMERIC_FIELDS.indexOf(k) > -1) {
      const n = finiteNum_(rec[k], 0, 1e7);
      clean[k] = n == null ? 0 : Math.round(n);
    } else {
      clean[k] = str_(rec[k], 4000) || '';
    }
  });

  const rows = await getPrograms_();
  const idx = rows.findIndex(function (r) { return r.id === clean.id; });
  /* Editing somebody else's row is fine — a report is a shared document — but it
     cannot be moved to another campus by editing it. */
  if (idx > -1) { clean.campus = rows[idx].campus || s.campus; rows[idx] = clean; }
  else rows.push(clean);
  await writeJSON('programs', rows);
  return getPrograms(username, pin, clean.year);
}

async function deleteProgramRecord(username, pin, id) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false, err: 'auth' };
  const rid = str_(id, 40);
  if (!rid) return { ok: false, err: 'bad_id' };
  let rows = await getPrograms_();
  const before = rows.length;
  rows = rows.filter(function (r) { return r.id !== rid; });
  if (rows.length === before) return { ok: false, err: 'not_found' };
  await writeJSON('programs', rows);
  return getPrograms(username, pin);
}

/* ==================== dispatcher ==================== */
const HANDLERS = {
  getMyBoot: function (a) { return getMyBoot(a[0], a[1]); },
  getPrograms: function (a) { return getPrograms(a[0], a[1], a[2]); },
  saveProgramRecord: function (a) { return saveProgramRecord(a[0], a[1], a[2]); },
  deleteProgramRecord: function (a) { return deleteProgramRecord(a[0], a[1], a[2]); },
  getData: function (a) { return getData(a[0], a[1]); },
  saveEntries: function (a) { return saveEntries(a[0], a[1], a[2], a[3], a[4]); },
  saveObjective: function (a) { return saveObjective(a[0], a[1], a[2], a[3]); },
  deleteObjective: function (a) { return deleteObjective(a[0], a[1], a[2], a[3]); },
  teamRoster: function () { return teamRoster(); },
  staffRegister: function (a) { return staffRegister(a[0]); },
  staffLogin: function (a) { return staffLogin(a[0], a[1]); },
  updateProfile: function (a) { return updateProfile(a[0], a[1], a[2]); },
  changePin: function (a) { return changePin(a[0], a[1], a[2]); },
  uploadPhoto: function (a) { return uploadPhoto(a[0], a[1], a[2], a[3]); },
  saveDaily: function (a) { return saveDaily(a[0], a[1], a[2], a[3]); },
  getMyLogs: function (a) { return getMyLogs(a[0], a[1]); },
  getMyMentees: function (a) { return getMyMentees(a[0], a[1]); },
  getMenteeLogs: function (a) { return getMenteeLogs(a[0], a[1], a[2]); },
  getMyMentorRequests: function (a) { return getMyMentorRequests(a[0], a[1]); },
  getMyWeekly: function (a) { return getMyWeekly(a[0], a[1]); },
  saveMyHabits: function (a) { return saveMyHabits(a[0], a[1], a[2], a[3]); },
  saveGoals: function (a) { return saveGoals(a[0], a[1], a[2], a[3]); },
  getMyMinistry: function (a) { return getMyMinistry(a[0], a[1]); },
  saveMyMinistry: function (a) { return saveMyMinistry(a[0], a[1], a[2], a[3]); },
  saveMyKpiDay: function (a) { return saveMyKpiDay(a[0], a[1], a[2], a[3]); },
  saveMyKpiPins: function (a) { return saveMyKpiPins(a[0], a[1], a[2]); },
  staffProfile: function (a) { return staffProfile(a[0], a[1], a[2]); },
  getMyTrips: function (a) { return getMyTrips(a[0], a[1]); },
  saveTrip: function (a) { return saveTrip(a[0], a[1], a[2]); },
  deleteTrip: function (a) { return deleteTrip(a[0], a[1], a[2]); },
  getTripRequests: function (a) { return getTripRequests(a[0], a[1]); },
  respondToTrip: function (a) { return respondToTrip(a[0], a[1], a[2], a[3]); },
  respondToMentorRequest: function (a) { return respondToMentorRequest(a[0], a[1], a[2], a[3]); },
  saveMyWeek: function (a) { return saveMyWeek(a[0], a[1], a[2], a[3]); },
  deleteMyWeek: function (a) { return deleteMyWeek(a[0], a[1], a[2]); }
};

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  let body;
  try { body = await req.json(); } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Bad JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  /* `body` can be valid JSON and still not be an object — a bare `null` parses
     fine, and reading .fn off it threw, which came back as a 500. A malformed
     request is the caller's problem, so answer 400.
     hasOwnProperty, not a plain lookup: HANDLERS is an object literal, so
     fn:"constructor" used to resolve to Object and get called. */
  const named = body && typeof body === 'object' &&
    Object.prototype.hasOwnProperty.call(HANDLERS, body.fn) ? HANDLERS[body.fn] : null;
  const fn = typeof named === 'function' ? named : null;
  if (!fn) {
    return new Response(JSON.stringify({ ok: false, error: 'Unknown function: ' + (body && body.fn) }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const result = await fn(Array.isArray(body.args) ? body.args : []);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String((err && err.message) || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
