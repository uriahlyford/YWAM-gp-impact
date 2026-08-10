/*  GonPreah Impact — Netlify Function backend
    Replaces the Google Apps Script backend (Code.gs). Same behavior, same
    data shapes the frontend already expects — just Netlify Blobs instead of
    a Google Sheet, and no google.script.run RPC marshalling.

    Storage: one JSON blob per "sheet" (array of row objects), in the
    "gp-data" store. Concurrency: plain read-modify-write, no locking —
    an accepted trade-off at this team's scale (see CLAUDE.md).

    Leadership tier: metrics in SENSITIVE are stripped unless the caller's
    code matches process.env.GP_LEADER_CODE (falls back to 'GP2026' if unset
    — set the real one as a Netlify env var).
*/

const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const SENSITIVE = ['Base Finances ($)', 'Base Cash Reserve ($)'];

function store() { return getStore('gp-data'); }
async function readJSON(key, fallback) {
  const v = await store().get(key, { type: 'json' });
  return v == null ? fallback : v;
}
async function writeJSON(key, value) {
  await store().setJSON(key, value);
  return value;
}

function isLeader_(code) {
  const real = process.env.GP_LEADER_CODE || 'GP2026';
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
  const throttle = await readJSON('loginThrottle', {});
  delete throttle[normUser_(username)];
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

function publicStaff_(s) {
  return {
    id: s.id, name: s.name, username: s.username, campus: s.campus, dept: s.dept,
    role: s.role, photo: s.photo || '', mentorId: s.mentorId || ''
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
    campus: payload.campus || '', dept: payload.dept || '', role: payload.role || '', photo: '',
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

async function uploadPhoto(username, pin, base64, mime) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const dataUri = 'data:' + (mime || 'image/jpeg') + ';base64,' + base64;
  if (dataUri.length > 200000) return { ok: false, err: 'too_large' };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  rows[idx].photo = dataUri;
  await saveStaff_(rows);
  return { ok: true, photo: dataUri };
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
    updated: new Date().toISOString()
  };
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('dailyLogs', rows);
  return getMyLogs(username, pin);
}

function logsFor_(rows, staffId) {
  return rows.filter(function (r) { return r.staffId === staffId; })
    .slice()
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; })
    .map(function (r) {
      return {
        date: r.date, week: r.week, langHours: r.langHours || 0, minHours: r.minHours || 0,
        workout: !!r.workout, bible: !!r.bible, quietTime: !!r.quietTime, oneOnOne: !!r.oneOnOne,
        sharedFaith: !!r.sharedFaith, sabbath: !!r.sabbath,
        clarity: r.clarity == null ? null : r.clarity, growth: r.growth == null ? null : r.growth,
        lonely: r.lonely == null ? null : r.lonely, porn: !!r.porn
      };
    });
}

async function getMyLogs(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getDaily_();
  return { ok: true, logs: logsFor_(rows, s.id), profile: { debt: s.debt } };
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
  return { ok: true, mentee: publicStaff_(m), logs: logsFor_(dailyRows, m.id), profile: { debt: m.debt } };
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

async function getData(code) {
  const leader = isLeader_(code);
  const entryRows = await getEntries_();
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
  const surveyRows = await getSurvey_();
  const survey = surveyRows.map(function (s) {
    return {
      campus: s.campus, week: Number(s.week), device: s.device,
      lonely: Number(s.lonely), clarity: Number(s.clarity), porn: Number(s.porn), oneOnOne: Number(s.oneOnOne),
      exercise: Number(s.exercise), quietTime: Number(s.quietTime), debt: Number(s.debt),
      langHours: Number(s.langHours) || 0, minHours: Number(s.minHours) || 0,
      sharedFaith: nn(s.sharedFaith), sabbath: nn(s.sabbath), growth: nn(s.growth)
    };
  });

  return { leader: leader, entries: entries, okrs: okrs, survey: survey };
}

async function saveEntries(campus, updates, code) {
  const leader = isLeader_(code);
  const rows = await getEntries_();
  const now = new Date().toISOString();
  (updates || []).forEach(function (u) {
    // Reads are already filtered by leader status in getData(); mirror that
    // here so a non-leader can't blindly overwrite a value they can't see.
    if (!leader && SENSITIVE.indexOf(u.metric) > -1) return;
    const idx = rows.findIndex(function (r) {
      return r.campus === campus && r.dept === u.dept && r.ministry === u.ministry && r.metric === u.metric && String(r.week) === String(u.week);
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) rows.splice(idx, 1);
    } else if (idx > -1) {
      rows[idx].value = Number(u.value); rows[idx].updated = now;
    } else {
      rows.push({ campus: campus, dept: u.dept, ministry: u.ministry, metric: u.metric, week: u.week, value: Number(u.value), updated: now });
    }
  });
  await writeJSON('entries', rows);
  return getData(code);
}

async function saveObjective(obj, code) {
  let rows = await getOkrs_();
  rows = rows.filter(function (r) { return String(r.id) !== String(obj.id); });
  const now = new Date().toISOString();
  (obj.krs || []).forEach(function (kr) {
    if (!kr.text) return;
    rows.push({
      campus: obj.campus, quarter: obj.quarter, dept: obj.dept, id: obj.id, objective: obj.objective,
      kr: kr.text, metricKey: kr.metricKey || '', target: kr.target || 0, manualPct: kr.manual || 0, updated: now
    });
  });
  await writeJSON('okrs', rows);
  return getData(code);
}

async function deleteObjective(id, code) {
  let rows = await getOkrs_();
  rows = rows.filter(function (r) { return String(r.id) !== String(id); });
  await writeJSON('okrs', rows);
  return getData(code);
}

async function saveSurvey(payload, code) {
  const rows = await getSurvey_();
  const idx = rows.findIndex(function (r) {
    return r.campus === payload.campus && Number(r.week) === Number(payload.week) && r.device === payload.device;
  });
  const rec = {
    campus: payload.campus, week: Number(payload.week), device: payload.device,
    lonely: Number(payload.lonely), clarity: Number(payload.clarity),
    porn: payload.porn ? 1 : 0, oneOnOne: payload.oneOnOne ? 1 : 0, exercise: payload.exercise ? 1 : 0,
    quietTime: payload.quietTime ? 1 : 0, debt: payload.debt ? 1 : 0,
    langHours: Number(payload.langHours) || 0, minHours: Number(payload.minHours) || 0,
    sharedFaith: payload.sharedFaith ? 1 : 0, sabbath: payload.sabbath ? 1 : 0, growth: Number(payload.growth) || 0,
    updated: new Date().toISOString()
  };
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('survey', rows);
  return getData(code);
}

/* ---- bridge for later: weekly health composite derived from daily logs ---- */
async function weeklyHealthFromLogs(campusId, week) {
  const staff = (await getStaff_()).filter(function (s) { return s.active && s.campus === campusId; });
  const ids = {}; staff.forEach(function (s) { ids[s.id] = 1; });
  const rows = (await getDaily_()).filter(function (r) { return Number(r.week) === Number(week) && ids[r.staffId]; });
  const n = new Set(rows.map(function (r) { return r.staffId; })).size;
  return { n: n, week: week, campus: campusId };
}

/* ---- one-time data migration from the old Google Sheet ----
   Gated on GP_SEED_SECRET (a Netlify env var, not in source control).
   Call once with { entries, okrs, survey, staff, dailyLogs }, then remove
   the env var so the endpoint stops accepting writes. */
async function adminSeed(secret, bundle) {
  const real = process.env.GP_SEED_SECRET;
  if (!real) throw new Error('seeding disabled');
  if (String(secret || '') !== real) throw new Error('unauthorized');
  const keys = ['entries', 'okrs', 'survey', 'staff', 'dailyLogs'];
  const written = {};
  for (const k of keys) {
    if (Array.isArray(bundle && bundle[k])) {
      await writeJSON(k, bundle[k]);
      written[k] = bundle[k].length;
    }
  }
  return { ok: true, written: written };
}

/* ==================== dispatcher ==================== */
const HANDLERS = {
  adminSeed: function (a) { return adminSeed(a[0], a[1]); },
  getData: function (a) { return getData(a[0]); },
  saveEntries: function (a) { return saveEntries(a[0], a[1], a[2]); },
  saveObjective: function (a) { return saveObjective(a[0], a[1]); },
  deleteObjective: function (a) { return deleteObjective(a[0], a[1]); },
  saveSurvey: function (a) { return saveSurvey(a[0], a[1]); },
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
  respondToMentorRequest: function (a) { return respondToMentorRequest(a[0], a[1], a[2], a[3]); },
  weeklyHealthFromLogs: function (a) { return weeklyHealthFromLogs(a[0], a[1]); }
};

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Bad JSON' }) };
  }
  const fn = HANDLERS[body.fn];
  if (!fn) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Unknown function: ' + body.fn }) };
  }
  try {
    const result = await fn(body.args || []);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: String((err && err.message) || err) }) };
  }
};
