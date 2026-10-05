/*  GonPreah Impact — Netlify Function backend
    Replaces the Google Apps Script backend (Code.gs). Same behavior, same
    data shapes the frontend already expects — just Netlify Blobs instead of
    a Google Sheet, and no google.script.run RPC marshalling.

    Storage: one JSON blob per "sheet" (array of row objects), in the
    "gp-data" store. Concurrency: plain read-modify-write, no locking —
    an accepted trade-off at this team's scale (see CLAUDE.md). Within one
    request, though, reads do see that request's own writes — readJSON says
    why that is not optional.

    Leadership tier: metrics in SENSITIVE are stripped unless the caller's code
    matches process.env.GP_LEADER_CODE. Fails closed — if that env var is ever
    unset, nobody gets leader access (no hardcoded fallback; this repo is public,
    so a literal in source would be a permanently known password).

    OKR writes have two doors: the leader code writes anything, and a signed-in
    staff member (username + PIN) writes their OWN campus and department only.
    See okrWriter_ for how that boundary is held.
*/

import { getStore } from '@netlify/blobs';
import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';
import TEAM_SEED from './team-seed.js';
import PORTAL_FORMS_DEFAULT from './portal-forms-default.js';

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

/* Strong consistency, on purpose. Netlify Blobs default to eventual reads:
   a get() right after a setJSON() may still answer with the old value for a
   while. mutateStaff_ writes and then reads back to check the write took,
   so under eventual reads a perfectly good save could compare unequal ten
   times over and come back as 'busy' — "Could not save", though it had
   saved. Every read here goes through this one store, so the whole app
   reads its own writes. */
function store() { return getStore({ name: 'gp-data', consistency: 'strong' }); }
/* Every blob in this store is either a JSON array of rows or, for loginThrottle,
   a plain object. If one ever comes back as something else — a half-finished
   write, a hand-edit in the Netlify UI, a future schema change — the old code
   handed it straight to .forEach/.findIndex and the whole app answered 500,
   which is the "Error when loading app" screen for every user at once. Check the
   shape against the fallback the caller asked for instead: a bad blob then reads
   as empty, which shows an empty page rather than taking the app down, and the
   next successful write repairs it. */
/*  Read your own writes, for the length of one request.

    Blobs has no compare-and-swap, and a read issued straight after a write can
    still be served the older version. That matters because nearly every write
    handler answers by calling the matching read function — saveMyKpiDay ends
    with getMyMinistry, saveTrip with getMyTrips — so the answer could describe
    the data as it was BEFORE the write it just made. The client believes the
    answer and paints the old value back: a habit tile unticking itself, a week
    total that stays where it was, a leave request that does not appear. It
    looked like "the save didn't work", and it was really "the reply was stale".

    So: what a request writes, that same request reads back. This is scoped with
    AsyncLocalStorage rather than a module-level Map on purpose — module scope
    would be shared by any two invocations that ever overlap on one warm
    instance, and one request reading another's writes would be a far worse bug
    than the one being fixed here. The scope exists only inside the handler, so
    anything running outside it reads the store directly, as before.

    Cloning on the way in and out keeps a handler's own mutations (rows[i] = rec,
    rows.push, .sort in place) from reaching through the cache into what a later
    read in the same request sees. */
const requestScope = new AsyncLocalStorage();
const copy_ = function (v) { return v == null ? v : JSON.parse(JSON.stringify(v)); };

/* The shape check, applied to a cached value as well as a stored one — a
   handler that wrote junk must not get junk handed back by a different route
   than the store would have used. */
function shaped_(v, fallback) {
  if (v == null) return fallback;
  const wantArray = Array.isArray(fallback);
  if (wantArray !== Array.isArray(v)) return fallback;
  if (!wantArray && typeof v !== 'object') return fallback;
  return v;
}

async function readJSON(key, fallback) {
  const mine = requestScope.getStore();
  if (mine && mine.has(key)) return shaped_(copy_(mine.get(key)), fallback);
  return shaped_(await store().get(key, { type: 'json' }), fallback);
}
async function writeJSON(key, value) {
  await store().setJSON(key, value);
  const mine = requestScope.getStore();
  if (mine) mine.set(key, copy_(value));
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

/* ==================== the leadership department's names ====================
   The department has been called 'Base Director', then 'Base Leadership', and
   is 'Campus Leadership' now; its own ministry row — the campus director's
   figures — was 'Campus Leadership' and is 'Campus Director', so the two no
   longer share a name. Stored rows keep whatever name was current when they
   were written, and nothing rewrites the store in bulk: every read of a store
   that carries a department normalises the names on the way out, so the rest
   of this file and the client (which only ever sees normalised names) have a
   single name to compare against, and each ordinary write then persists the
   current name. Incoming payloads are normalised too, for a client still
   running the old taxonomy. */
const LEADERSHIP_DEPT = 'Campus Leadership';
const OLD_LEADERSHIP_DEPTS = ['Base Director', 'Base Leadership'];
function normDept_(d) { return OLD_LEADERSHIP_DEPTS.indexOf(d) > -1 ? LEADERSHIP_DEPT : d; }
function normMinistry_(dept, m) {
  return (normDept_(dept) === LEADERSHIP_DEPT && m === 'Campus Leadership') ? 'Campus Director' : m;
}
function normKey_(key, parts) {
  const p = String(key || '').split('|');
  if (p.length !== parts) return key;
  p[1] = normMinistry_(p[0], p[1]); p[0] = normDept_(p[0]);
  return p.join('|');
}
function normRow_(r) {
  if (!r || typeof r !== 'object') return r;
  if (r.dept !== undefined) { const d = normDept_(r.dept); r.ministry = normMinistry_(r.dept, r.ministry); r.dept = d; }
  // an OKR row is one key result: its metricKey is dept|ministry|metric
  if (typeof r.metricKey === 'string' && r.metricKey) r.metricKey = normKey_(r.metricKey, 3);
  if (Array.isArray(r.leads)) r.leads = r.leads.map(function (k) { return normKey_(k, 2); });
  if (Array.isArray(r.ministries)) r.ministries = r.ministries.map(function (k) { return normKey_(k, 2); });
  return r;
}
function normRows_(rows) { return Array.isArray(rows) ? rows.map(normRow_) : rows; }

/* ==================== STAFF / TEAMS ==================== */
/* Every staff record must carry its own id — everything else is keyed on it:
   the admin's account rows, reset PIN, edit profile, mentor links, daily
   logs, goals. Accounts from before the Netlify backend (and one or two
   made by hand) have none, and a few may share one. With no id they all
   fall together: the admin's list opens the wrong row (an empty key is the
   same empty key), every one of them reads as "(you)", and adminResetPin
   can't find the person at all. So a missing id is minted here on the way
   in, a duplicate is re-minted for the LATER row (the first keeps it, along
   with whatever history points at it), and the repaired list is written
   straight back so the id is the same on the next request. */
function newStaffId_() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function ensureStaffIds_(rows) {
  if (!Array.isArray(rows)) return { rows: rows, changed: false };
  const seen = {};
  let changed = false;
  rows.forEach(function (r) {
    if (!r || typeof r !== 'object') return;
    let id = (typeof r.id === 'string' || typeof r.id === 'number') ? String(r.id) : '';
    if (!id || seen[id]) { id = newStaffId_(); while (seen[id]) id = newStaffId_(); r.id = id; changed = true; }
    else if (r.id !== id) { r.id = id; changed = true; }
    seen[id] = 1;
  });
  return { rows: rows, changed: changed };
}
async function getStaff_() {
  const fixed = ensureStaffIds_(normRows_(await readJSON('staff', [])));
  if (fixed.changed) await writeJSON('staff', fixed.rows);
  return fixed.rows;
}
async function saveStaff_(rows) { return writeJSON('staff', rows); }

function findStaff_(rows, username) {
  const u = normUser_(username);
  return rows.find(function (s) { return s.username === u; }) || null;
}

async function verifyStaff_(username, pin, allowApplicant) {
  if (await isLoginLocked_(username)) return null;
  const rows = await getStaff_();
  const s = findStaff_(rows, username);
  if (!s || hashPin_(pin, s.pinSalt) !== s.pinHash) {
    await recordFailedLogin_(username);
    return null;
  }
  await clearLoginThrottle_(username);
  // `active` used to only hide someone from the roster — nothing actually
  // stopped an inactive account from authenticating, so "deactivating"
  // somebody was cosmetic. Gating the one shared verify function closes that
  // for every handler at once, and doubles as the admin-approval gate: a
  // pending Campus Leadership sign-up is created with active:false and simply
  // has no session until an admin flips it, the same switch as deactivating
  // someone later.
  if (s.active === false) return null;
  // An applicant (the portal) holds a real PIN but is not staff: every staff
  // handler is closed to them unless it asks for them by name — see the
  // YWAM GP Portal block. Failing here closes them all at once.
  if (isApplicant_(s) && !allowApplicant) return null;
  return s;
}

/* What kind of staff someone is. The three ids are duplicated from taxonomy.js
   (STAFF_TYPES) because the server must validate what it stores and cannot
   import a plain browser script — change one, change both. Anything else becomes
   '' rather than being rejected: an unknown value means "not said yet", which
   the base figures count and show as exactly that. */
const STAFF_TYPE_IDS = ['campus', 'yap', 'ministry'];
/* Trimmed and lowercased so "Sreilea@Gmail.com" and "sreilea@gmail.com" are
   the same address for the duplicate-account check below — email, not name,
   is what that check is keyed on now, since two people can share a name but
   never the same inbox. Returns null for something that isn't shaped like an
   email at all, so the caller can tell "missing" from "wrong". */
function cleanEmail_(v) {
  const s = String(v == null ? '' : v).trim().toLowerCase();
  if (!s) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}
function cleanStaffType_(v) {
  const s = String(v == null ? '' : v).trim().toLowerCase();
  return STAFF_TYPE_IDS.indexOf(s) > -1 ? s : '';
}

/* Home country, normalised on the way in.

   "How many countries are we?" is only answerable if one country is one string,
   so this folds the ways people write the same place — khmer / cambodian / KH
   all become Cambodia — and title-cases the rest so "new zealand" and
   "New Zealand" cannot count as two. Unrecognised countries are kept, not
   rejected: a nationality missing from the picker is a gap in the list, not bad
   data, and refusing it would leave the person with no country at all. */
const COUNTRY_ALIASES = {
  'khmer': 'Cambodia', 'cambodian': 'Cambodia', 'kh': 'Cambodia', 'kampuchea': 'Cambodia',
  'usa': 'United States', 'us': 'United States', 'u.s.': 'United States', 'u.s.a.': 'United States',
  'america': 'United States', 'american': 'United States', 'united states of america': 'United States',
  'uk': 'United Kingdom', 'u.k.': 'United Kingdom', 'england': 'United Kingdom',
  'scotland': 'United Kingdom', 'wales': 'United Kingdom', 'britain': 'United Kingdom',
  'great britain': 'United Kingdom', 'british': 'United Kingdom',
  'korea': 'South Korea', 'republic of korea': 'South Korea', 'korean': 'South Korea',
  'nz': 'New Zealand', 'aussie': 'Australia', 'australian': 'Australia',
  'filipino': 'Philippines', 'the philippines': 'Philippines',
  'holland': 'Netherlands', 'dutch': 'Netherlands',
  'png': 'Papua New Guinea', 'hk': 'Hong Kong', 'viet nam': 'Vietnam', 'vietnamese': 'Vietnam',
  'burma': 'Myanmar', 'thai': 'Thailand', 'japanese': 'Japan', 'chinese': 'China',
  'german': 'Germany', 'french': 'France', 'canadian': 'Canada', 'brazilian': 'Brazil'
};
function cleanCountry_(v) {
  const raw = String(v == null ? '' : v).trim().replace(/\s+/g, ' ');
  if (!raw || raw.length > 40) return '';
  const alias = COUNTRY_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  return raw.replace(/\S+/g, function (w) {
    // Joining words stay lowercase ("Trinidad and Tobago"); everything else is capitalised.
    if (/^(and|of|the|de|da)$/i.test(w)) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
}

/* ==================== personality types ====================
   A person's four-letter type, from GP's own questionnaire in personality.js
   (or picked directly by someone who already knows theirs). Stored on the staff
   record as:

     personality: { type, scores, source, takenAt, share, season }
     sex:         'male' | 'female' | ''     — a profile field; it picks the avatar

   Who sees what, and why the lines fall where they do:
     · the unauthenticated teamRoster sees NONE of it. That endpoint is public
       to the internet, and nothing new should be readable there;
     · signed-in staff see a shared type and its avatar (type + sex) on the
       directory, and the type's bars on someone's profile — only while that
       person has sharing switched on, which is the default the brief asked for;
     · season is the person's own business: it says how they are doing ("a
       stretched season"), which is not a directory fact. It never leaves their
       own boot/profile.

   The lists below mirror personality.js. tests/test-personality.mjs checks the
   two agree, the same way test-jobfocus keeps jobfocus.js and help.html in step. */
const PTYPE_CODES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const PSEASON_IDS = ['ordinary', 'school', 'outreach', 'transition', 'holidays', 'stretched'];
const PAXES = [['E', 'E', 'I'], ['S', 'S', 'N'], ['T', 'T', 'F'], ['J', 'J', 'P']];

function cleanSex_(v) { return v === 'male' || v === 'female' ? v : ''; }

/* Percentages toward each pair's first letter, whole numbers 0-100 — and they
   must agree with the type they came with. A client sending INFJ with E:80 is
   either broken or lying, and either way the bars would contradict the letters. */
function cleanPScores_(scores, type) {
  if (!scores || typeof scores !== 'object') return null;
  const out = {};
  for (let i = 0; i < PAXES.length; i++) {
    const ax = PAXES[i];
    const v = finiteNum_(scores[ax[0]], 0, 100);
    if (v == null) return null;
    out[ax[0]] = Math.round(v);
    const letter = out[ax[0]] > 50 ? ax[1] : ax[2];
    if (type.charAt(i) !== letter) return null;
  }
  return out;
}

/* ==================== CliftonStrengths (recorded, not assessed) ====================
   Someone's Top 5 (up to 10) themes AS GALLUP GAVE THEM, plus a line in their own
   words for each. This app never gives the assessment and never carries Gallup's
   descriptions — see public/strengths.js for why that line is drawn where it is.

     strengths: { top: ['Learner', 'Achiever', …], notes: { Learner: '…' }, share, updated }

   Same visibility as a personality type: nothing on the public roster, teammates
   see it while it is shared (the default), and the notes travel with the themes
   because they are what the person chose to say about them. The list mirrors
   strengths.js; tests/test-strengths.mjs fails if they drift. */
const STHEME_LIST = ['Achiever', 'Arranger', 'Belief', 'Consistency', 'Deliberative', 'Discipline', 'Focus',
  'Responsibility', 'Restorative', 'Activator', 'Command', 'Communication', 'Competition', 'Maximizer',
  'Self-Assurance', 'Significance', 'Woo', 'Adaptability', 'Connectedness', 'Developer', 'Empathy', 'Harmony',
  'Includer', 'Individualization', 'Positivity', 'Relator', 'Analytical', 'Context', 'Futuristic', 'Ideation',
  'Input', 'Intellection', 'Learner', 'Strategic'];
const SMAX = 10, SNOTE_MAX = 300;

function sharedStrengths_(s) {
  const st = s && s.strengths;
  if (!st || !Array.isArray(st.top) || !st.top.length || st.share === false) return null;
  return { top: st.top.slice(), notes: Object.assign({}, st.notes || {}) };
}
function ownStrengths_(s) {
  const st = s && s.strengths;
  if (!st || !Array.isArray(st.top) || !st.top.length) return null;
  return { top: st.top.slice(), notes: Object.assign({}, st.notes || {}), share: st.share !== false, updated: st.updated || '' };
}

async function saveMyStrengths(username, pin, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const p = payload || {};
  let top = null, notes = null;
  if (p.top !== undefined) {
    if (!Array.isArray(p.top) || !p.top.length || p.top.length > SMAX) return { ok: false, err: 'bad_count' };
    const seen = {};
    for (let i = 0; i < p.top.length; i++) {
      const th = p.top[i];
      if (STHEME_LIST.indexOf(th) === -1) return { ok: false, err: 'bad_theme' };
      if (seen[th]) return { ok: false, err: 'duplicate' };
      seen[th] = 1;
    }
    top = p.top.slice();
  }
  if (p.notes !== undefined) {
    if (!p.notes || typeof p.notes !== 'object') return { ok: false, err: 'bad_notes' };
    notes = {};
    Object.keys(p.notes).forEach(function (k) {
      if (STHEME_LIST.indexOf(k) === -1) return;
      const v = str_(p.notes[k], SNOTE_MAX);
      if (v) notes[k] = v;
    });
  }
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === s.id; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const rec = rows[idx];
    if (p.clear) {
      delete rec.strengths;
    } else {
      const cur = Object.assign({ notes: {} }, rec.strengths || {});
      if (top) cur.top = top;
      if (notes) cur.notes = notes;
      if (p.share !== undefined) cur.share = !!p.share;
      /* a note only means something beside a theme that is in the list */
      const keep = {};
      (cur.top || []).forEach(function (th) { if (cur.notes && cur.notes[th]) keep[th] = cur.notes[th]; });
      cur.notes = keep;
      cur.updated = new Date().toISOString();
      if (cur.top && cur.top.length) rec.strengths = cur;
    }
    rec.updated = new Date().toISOString();
    rows[idx] = rec;
    return { ok: true, staff: rosterStaff_(rec), strengths: ownStrengths_(rec) };
  });
}

/* ==================== GP Strengths (the free one, GP's own) ====================
   Thirty-four strengths in four groups, found by 102 "which is more like
   you?" pairs — all GP's own words, see public/gpstrengths.js. The person sends only their answers;
   the Top 5 is worked out HERE, so what teammates see always follows from the
   choices that made it.

     gstrengths: { answers: { p0: -2..2, … }, scores: { finisher: n, … },
                   top: ['listener', …5], takenAt, share }

   Answers stay with the owner (so they can look back at them). Teammates see
   the Top 5 while it is shared (the default) — never the answers or scores.
   The ids and the left/right strength of each pair mirror gpstrengths.js;
   tests/test-gpstrengths.mjs fails if they drift. */
const GS_IDS = ['hardworker', 'coordinator', 'valuesdriven', 'fairminded', 'careful', 'orderly', 'goalsetter', 'dependable', 'solver', 'starter', 'takecharge', 'voice', 'pacesetter', 'improver', 'confident', 'differencemaker', 'friendmaker', 'flexible', 'weaver', 'mentor', 'comforter', 'peacemaker', 'welcomer', 'noticer', 'optimist', 'loyalfriend', 'factfinder', 'historian', 'visionary', 'inventor', 'collector', 'deepthinker', 'curious', 'pathfinder'];
const GS_PAIRS = [
  ['mentor', 'friendmaker'], ['comforter', 'historian'], ['visionary', 'flexible'], ['curious', 'valuesdriven'],
  ['pathfinder', 'voice'], ['friendmaker', 'historian'], ['coordinator', 'starter'], ['improver', 'curious'],
  ['goalsetter', 'noticer'], ['collector', 'pacesetter'], ['takecharge', 'fairminded'], ['improver', 'peacemaker'],
  ['inventor', 'pacesetter'], ['fairminded', 'factfinder'], ['weaver', 'hardworker'], ['dependable', 'takecharge'],
  ['loyalfriend', 'improver'], ['differencemaker', 'fairminded'], ['flexible', 'coordinator'], ['inventor', 'optimist'],
  ['loyalfriend', 'voice'], ['dependable', 'comforter'], ['noticer', 'visionary'], ['goalsetter', 'pathfinder'],
  ['weaver', 'factfinder'], ['coordinator', 'comforter'], ['welcomer', 'orderly'], ['deepthinker', 'peacemaker'],
  ['confident', 'goalsetter'], ['comforter', 'takecharge'], ['welcomer', 'improver'], ['curious', 'weaver'],
  ['deepthinker', 'noticer'], ['visionary', 'confident'], ['fairminded', 'mentor'], ['starter', 'collector'],
  ['pathfinder', 'mentor'], ['friendmaker', 'careful'], ['voice', 'welcomer'], ['starter', 'goalsetter'],
  ['hardworker', 'flexible'], ['noticer', 'confident'], ['comforter', 'careful'], ['orderly', 'pacesetter'],
  ['collector', 'mentor'], ['hardworker', 'curious'], ['solver', 'inventor'], ['takecharge', 'deepthinker'],
  ['mentor', 'dependable'], ['noticer', 'collector'], ['welcomer', 'starter'], ['takecharge', 'noticer'],
  ['differencemaker', 'weaver'], ['orderly', 'pathfinder'], ['weaver', 'dependable'], ['goalsetter', 'inventor'],
  ['orderly', 'optimist'], ['flexible', 'friendmaker'], ['careful', 'confident'], ['historian', 'valuesdriven'],
  ['optimist', 'differencemaker'], ['confident', 'solver'], ['peacemaker', 'historian'], ['friendmaker', 'hardworker'],
  ['improver', 'deepthinker'], ['factfinder', 'differencemaker'], ['pacesetter', 'valuesdriven'], ['fairminded', 'peacemaker'],
  ['careful', 'pathfinder'], ['visionary', 'orderly'], ['solver', 'friendmaker'], ['confident', 'inventor'],
  ['historian', 'dependable'], ['loyalfriend', 'solver'], ['pacesetter', 'comforter'], ['differencemaker', 'coordinator'],
  ['valuesdriven', 'improver'], ['pacesetter', 'visionary'], ['optimist', 'goalsetter'], ['peacemaker', 'takecharge'],
  ['collector', 'flexible'], ['careful', 'loyalfriend'], ['flexible', 'differencemaker'], ['solver', 'factfinder'],
  ['optimist', 'voice'], ['mentor', 'curious'], ['starter', 'weaver'], ['factfinder', 'coordinator'],
  ['voice', 'hardworker'], ['valuesdriven', 'welcomer'], ['hardworker', 'collector'], ['curious', 'fairminded'],
  ['deepthinker', 'starter'], ['valuesdriven', 'loyalfriend'], ['factfinder', 'optimist'], ['coordinator', 'deepthinker'],
  ['voice', 'orderly'], ['pathfinder', 'loyalfriend'], ['inventor', 'welcomer'], ['historian', 'careful'],
  ['peacemaker', 'solver'], ['dependable', 'visionary']
];

/* the same sum and tie-break as gpGSScore in gpstrengths.js */
function gpStrengthsScore_(answers) {
  if (!answers || typeof answers !== 'object') return null;
  const score = {}, strong = {}, clean = {};
  GS_IDS.forEach(function (id) { score[id] = 0; strong[id] = 0; });
  for (let i = 0; i < GS_PAIRS.length; i++) {
    const raw = answers['p' + i];
    const v = Number(raw);
    if (raw === null || raw === undefined || raw === '' || [-2, -1, 0, 1, 2].indexOf(v) === -1) return null;
    clean['p' + i] = v;
    const a = GS_PAIRS[i][0], b = GS_PAIRS[i][1];
    score[a] -= v; score[b] += v;
    if (v === -2) strong[a]++;
    if (v === 2) strong[b]++;
  }
  const ranked = GS_IDS.slice().sort(function (x, y) {
    return (score[y] - score[x]) || (strong[y] - strong[x]) || (GS_IDS.indexOf(x) - GS_IDS.indexOf(y));
  });
  return { answers: clean, scores: score, top: ranked.slice(0, 5) };
}
function sharedGStrengths_(s) {
  const g = s && s.gstrengths;
  if (!g || !Array.isArray(g.top) || !g.top.length || g.share === false) return null;
  return g.top.slice();
}
function ownGStrengths_(s) {
  const g = s && s.gstrengths;
  if (!g || !Array.isArray(g.top) || !g.top.length) return null;
  return { top: g.top.slice(), scores: Object.assign({}, g.scores || {}), answers: Object.assign({}, g.answers || {}),
    takenAt: g.takenAt || '', share: g.share !== false };
}

async function saveMyGStrengths(username, pin, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const p = payload || {};
  let result = null;
  if (p.answers !== undefined) {
    result = gpStrengthsScore_(p.answers);
    if (!result) return { ok: false, err: 'incomplete' };
  }
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === s.id; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const rec = rows[idx];
    if (p.clear) {
      delete rec.gstrengths;
    } else {
      if (!result && !rec.gstrengths) return { abort: true, ok: false, err: 'no_result' };
      const cur = Object.assign({}, rec.gstrengths || {});
      if (result) {
        cur.answers = result.answers; cur.scores = result.scores; cur.top = result.top;
        cur.takenAt = new Date().toISOString();
      }
      if (p.share !== undefined) cur.share = !!p.share;
      rec.gstrengths = cur;
    }
    rec.updated = new Date().toISOString();
    rows[idx] = rec;
    return { ok: true, staff: rosterStaff_(rec), gstrengths: ownGStrengths_(rec) };
  });
}

/* What a teammate may see: the type and its avatar, or nothing. */
function sharedAvatar_(s) {
  const p = s && s.personality;
  if (!p || !p.type || p.share === false) return null;
  return { type: p.type, sex: cleanSex_(s.sex) };
}
/* publicStaff_ plus the shared avatar — for signed-in readers only. */
function rosterStaff_(s) {
  const out = publicStaff_(s);
  const av = sharedAvatar_(s);
  if (av) out.avatar = av;
  /* the directory and the team map only need the names/ids, in order */
  const st = sharedStrengths_(s);
  if (st) out.strengths = st.top;
  const gs = sharedGStrengths_(s);
  if (gs) out.gstrengths = gs;
  return out;
}
/* The owner's own copy: everything, including season. */
function ownPersonality_(s) {
  const p = s && s.personality;
  if (!p || !p.type) return null;
  return { type: p.type, scores: p.scores || null, source: p.source || 'test',
    takenAt: p.takenAt || '', share: p.share !== false, season: p.season || 'ordinary' };
}

/* Deliberately narrow: this is what every staff member can see about every
   other one. surveyToken must never appear here — it's what keeps weekly
   check-ins anonymous in the base survey.

   staffType and country are here because the base counts people by them — how
   many campus / YAP / ministry staff, how many Khmer, how many international,
   how many countries. They are directory facts of the same kind as department
   and role; nothing about anyone's health, money or days away travels with them. */
function publicStaff_(s) {
  return {
    id: s.id, name: s.name, username: s.username, campus: s.campus, dept: s.dept,
    ministry: s.ministry || '', role: s.role, photo: s.photo || '', mentorId: s.mentorId || '',
    staffType: cleanStaffType_(s.staffType), country: s.country || '',
    leads: leadsOf_(s), ministries: ministriesOf_(s)
  };
}

/* ==================== ministry leaders ====================
   Who may change WHAT a ministry tracks (hide/add/rename a metric, move it
   between weekly / monthly / quarterly) — as opposed to logging its numbers,
   which any of its own staff can do. Three kinds of people: an admin, anyone
   in the campus leadership department, and a ministry's own leader(s). A
   leader is assigned by an admin from the Admin screen and stored on the
   staff record as "Dept|Ministry" keys, so one person can lead more than
   one ministry — a real situation on a staff this size. */
function leadsOf_(s) { return Array.isArray(s && s.leads) ? s.leads : []; }
function isLeaderOf_(s, dept, ministry) { return leadsOf_(s).indexOf(dept + '|' + ministry) > -1; }
function isLeadership_(s) { return deptOf_(s) === 'Campus Leadership'; }
const MAX_LEADS = 20;
function cleanLeads_(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach(function (k) {
    const key = str_(k, 160);
    if (!key || key.indexOf('|') === -1 || out.indexOf(key) > -1) return;
    out.push(key);
  });
  return out.slice(0, MAX_LEADS);
}

/* The other ministries someone serves in. Staff here are usually part of more
   than one: the profile's department + ministry is their MAIN one (home page,
   the one My Ministry opens on), and these are the rest, as "Dept|Ministry"
   keys. They set them on their own profile (or an admin does), and they enter
   numbers for every one of them — see canLogFor_. */
const MAX_MINISTRIES = 10;
function ministriesOf_(s) { return Array.isArray(s && s.ministries) ? s.ministries : []; }
function cleanMinistries_(list, rec) {
  const main = rec.dept + '|' + (rec.ministry || '');
  const out = [];
  (Array.isArray(list) ? list : []).forEach(function (k) {
    const raw = str_(k, 160);
    if (!raw || raw.split('|').length !== 2) return;
    const key = normKey_(raw, 2);
    if (key === main || out.indexOf(key) > -1) return;
    out.push(key);
  });
  return out.slice(0, MAX_MINISTRIES);
}
function memberOf_(s, dept, ministry) {
  return (s.dept === dept && s.ministry === ministry) || ministriesOf_(s).indexOf(dept + '|' + ministry) > -1;
}

/* Public to the internet when called with no PIN, so it answers with
   publicStaff_ and nothing more. Signed in, it adds each person's shared
   personality avatar — see sharedAvatar_. */
async function teamRoster(username, pin) {
  const rows = await getStaff_();
  const me = username ? await verifyStaff_(username, pin) : null;
  return rows.filter(function (s) { return s.active && !isApplicant_(s); }).map(me ? rosterStaff_ : publicStaff_);
}

/* Admin access only ever goes to Campus Leadership, so that is the one
   department a sign-up cannot grant itself instantly — the account is
   created inactive and an admin has to switch it on, same as approving a
   pending request anywhere else in this app. Every other department keeps
   today's instant sign-up; this is deliberately narrow rather than gating
   every new account. */
function needsApproval_(dept) { return normDept_(String(dept || '')) === LEADERSHIP_DEPT; }

async function staffRegister(payload) {
  const u = normUser_(payload.username);
  if (!/^[a-z0-9._-]{2,20}$/.test(u)) return { ok: false, err: 'bad_username' };
  if (!/^\d{4}$/.test(String(payload.pin))) return { ok: false, err: 'bad_pin' };
  const rows = await getStaff_();
  if (findStaff_(rows, u)) return { ok: false, err: 'taken' };
  // One profile per email, going forward — a name can repeat (two staff can
  // share one), an inbox can't. Existing accounts made before this may still
  // carry no email at all; those are nudged to add one, not locked out.
  const email = cleanEmail_(payload.email);
  if (email === null) return { ok: false, err: 'bad_email' };
  if (!email) return { ok: false, err: 'email_required' };
  if (rows.some(function (r) { return r.email && r.email === email; })) return { ok: false, err: 'email_taken' };
  const salt = pinSalt_();
  const id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();
  const pending = needsApproval_(payload.dept);
  const rec = {
    id: id, username: u, name: payload.name || u, email: email, pinHash: hashPin_(payload.pin, salt), pinSalt: salt,
    campus: payload.campus || '', dept: normDept_(payload.dept || ''), ministry: normMinistry_(payload.dept || '', payload.ministry || ''),
    role: payload.role || '', photo: '',
    // Asked for at sign-up, changed from Profile & settings later.
    staffType: cleanStaffType_(payload.staffType), country: cleanCountry_(payload.country),
    mentorId: payload.mentorId || '', mentorStatus: payload.mentorId ? 'pending' : '',
    phone: payload.phone || '', joined: payload.joined || '', debt: false, active: !pending,
    isAdmin: false, created: now, updated: now
  };
  rows.push(rec);
  await saveStaff_(rows);
  // No staff/profile in a pending response: this account has no session yet,
  // and returning one would let the client log it straight in anyway.
  if (pending) return { ok: true, pending: true };
  return {
    ok: true, staff: publicStaff_(rec),
    profile: { phone: rec.phone, joined: rec.joined, debt: false, mentorStatus: rec.mentorStatus, dashboardColor: '', dashboardBg: '', email: rec.email }
  };
}

async function staffLogin(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (s) {
    return {
      ok: true, staff: Object.assign(publicStaff_(s), { isAdmin: !!s.isAdmin }),
      profile: {
        phone: s.phone, joined: s.joined, debt: s.debt, mentorStatus: s.mentorStatus || '',
        dashboardColor: s.dashboardColor || '', dashboardBg: s.dashboardBg || '', email: s.email || ''
      }
    };
  }
  /* verifyStaff_ already fails closed on an inactive account, same as a wrong
     PIN — right for every other handler, but a login screen owes the person
     a different message for "waiting on approval" than for "wrong PIN", so
     that one distinction is re-checked here. This never grants access on its
     own: it only decides which failure message applies. */
  if (!(await isLoginLocked_(username))) {
    const rows = await getStaff_();
    const raw = findStaff_(rows, username);
    if (raw && raw.active === false && hashPin_(pin, raw.pinSalt) === raw.pinHash) {
      return { ok: false, err: 'pending' };
    }
    // A portal applicant signing in on the staff app: right PIN, wrong door.
    if (raw && isApplicant_(raw) && hashPin_(pin, raw.pinSalt) === raw.pinHash) {
      return { ok: false, err: 'applicant' };
    }
  }
  return { ok: false };
}

/* ==================== admin ====================
   Deliberately narrow: account management (approve/deactivate/reset a PIN/
   fix a wrong campus or department) for whoever holds isAdmin. It does not
   touch the existing leader code, which keeps gating the sensitive dashboard
   metrics exactly as it does today and nothing else — Uriah asked for the
   two kept apart, since the dashboard is due for its own separate rework
   later and admin access shouldn't be tangled up with whatever that becomes.

   So bootstrapping isAdmin spends a second secret, GP_ADMIN_CODE, not the
   leader code — same fail-closed shape as isLeader_ (isAdminCode_ below),
   just a different door. */
function isAdminCode_(code) {
  const real = process.env.GP_ADMIN_CODE;
  if (!real) return false;
  return String(code || '') === real;
}

function adminStaffOut_(s) {
  return {
    id: s.id, name: s.name, username: s.username, campus: s.campus, dept: s.dept,
    ministry: s.ministry || '', role: s.role, active: s.active !== false, isAdmin: !!s.isAdmin, hr: !!s.hr,
    kind: s.kind || 'staff', portalStaff: !!s.portalStaff, portalAdmin: !!s.portalAdmin,
    staffType: s.staffType || '', country: s.country || '', email: s.email || '',
    mentorId: s.mentorId || '', mentorStatus: s.mentorStatus || '',
    leads: leadsOf_(s), ministries: ministriesOf_(s),
    archived: archivedOf_(s),
    created: s.created || ''
  };
}

async function adminGate_(username, pin) {
  const s = await verifyStaff_(username, pin);
  return (s && s.isAdmin) ? s : null;
}

/* Every one of these used to read the whole staff list once, change one
   record, and write the whole list back. Admin fires several of them in
   quick succession — reset a PIN, then rename the same person, approve the
   next one down the list — and each is its own request against a store
   with no compare-and-swap. Two in flight at once can each read before the
   other's write lands; whichever writes last silently overwrites the other
   with its own now-stale copy of everyone else. That is what "I reset the
   PIN and it didn't take" and "I changed her username and it reverted"
   both were — not a broken button, a real write a moment later undone by
   an older snapshot landing after it.

   mutate(rows) makes the one change against the freshest copy this can get;
   returning { abort: true, ...whatever } from it skips the write entirely —
   for a not-found or a validation error, there's nothing to retry.

   There is no compare-and-swap to ask the store for, so this checks after
   the fact instead of before: write, then read back, and if the store still
   holds exactly what was just written, nothing else landed in the middle
   and this write stands. If the readback differs — someone else's write
   raced past this one, either overwriting it or getting overwritten by it —
   re-read the real current data, reapply the same change on top of THAT,
   and try again, rather than declaring victory on stale grounds. A few
   rounds of this converge even when two requests are genuinely
   simultaneous: whichever call is left holding a mismatch keeps folding its
   own change onto whatever the other one most recently landed.

   Goes straight to the store, not getStaff_/saveStaff_, on purpose — a retry
   within this same request must see the real current data, including what
   an earlier attempt in this very loop just wrote and lost the race on, not
   the per-request cache that write left behind. The cache is only updated
   once, at the end, on the attempt that actually sticks.

   The random backoff before a retry matters more than it looks: two calls
   that started at the same moment and take the same shape of time to read,
   mutate and write will keep landing in lockstep and clobbering each other
   attempt after attempt otherwise — a real livelock, not a hypothetical one,
   caught by this file's own test firing two identical-shaped admin edits at
   once. A few milliseconds of jitter is enough to break that symmetry. */
async function mutateStaff_(mutate) {
  const s = store();
  for (let attempt = 0; attempt < 10; attempt++) {
    if (attempt > 0) await new Promise(function (r) { setTimeout(r, Math.random() * 40); });
    const rows = ensureStaffIds_(normRows_(shaped_(await s.get('staff', { type: 'json' }), []))).rows;
    const result = mutate(rows);
    if (result && result.abort) { const out = Object.assign({}, result); delete out.abort; return out; }
    await s.setJSON('staff', rows);
    const after = shaped_(await s.get('staff', { type: 'json' }), []);
    if (JSON.stringify(after) === JSON.stringify(rows)) {
      const mine = requestScope.getStore();
      if (mine) mine.set('staff', copy_(rows));
      return result;
    }
  }
  return { ok: false, err: 'busy' };
}

async function grantAdmin(adminCode, targetUsername, makeAdmin) {
  if (!isAdminCode_(adminCode)) return { ok: false, err: 'bad_code' };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.username === normUser_(targetUsername); });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    // Admin only ever goes to Campus Leadership — encoded here too, not just in
    // the sign-up gate, so a mistaken promotion can't hand it to someone else.
    if (makeAdmin && !needsApproval_(rows[idx].dept)) return { abort: true, ok: false, err: 'not_leadership' };
    rows[idx].isAdmin = !!makeAdmin;
    return { ok: true, staff: adminStaffOut_(rows[idx]) };
  });
}

async function adminListStaff(username, pin) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  const rows = await getStaff_();
  // Applicants are portal accounts, not staff — they have their own screen.
  return { ok: true, staff: rows.filter(function (r) { return !isApplicant_(r); }).map(adminStaffOut_) };
}

/* One switch for both halves of account management: flipping a pending
   Campus Leadership sign-up on is the same operation as deactivating someone
   later, since verifyStaff_ treats active:false as "no session" either way. */
async function adminSetActive(username, pin, staffId, active) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === staffId; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    rows[idx].active = !!active;
    rows[idx].updated = new Date().toISOString();
    return { ok: true, staff: adminStaffOut_(rows[idx]) };
  });
}

/* Setting someone's mentor directly, not asking the mentor to accept —
   updateProfile's own mentor field always lands on 'pending' for that
   reason, and stays the only path for a staff member picking their own
   mentor. This is the manual override: an admin can assign (or clear) a
   pairing outright, and can mark it approved immediately so the mentor
   doesn't have to separately accept it in Team. */
async function adminSetMentor(username, pin, staffId, mentorId, approved) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === staffId; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const newMentorId = mentorId || '';
    if (newMentorId === staffId) return { abort: true, ok: false, err: 'self_mentor' };
    if (newMentorId && rows.findIndex(function (r) { return r.id === newMentorId; }) === -1) {
      return { abort: true, ok: false, err: 'mentor_not_found' };
    }
    rows[idx].mentorId = newMentorId;
    rows[idx].mentorStatus = newMentorId ? (approved ? 'approved' : 'pending') : '';
    rows[idx].updated = new Date().toISOString();
    return { ok: true, staff: adminStaffOut_(rows[idx]) };
  });
}

async function adminResetPin(username, pin, staffId, newPin) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  if (!/^\d{4}$/.test(String(newPin))) return { ok: false, err: 'bad_pin' };
  let resetUsername = '';
  const out = await mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === staffId; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const salt = pinSalt_();
    rows[idx].pinHash = hashPin_(newPin, salt);
    rows[idx].pinSalt = salt;
    rows[idx].updated = new Date().toISOString();
    resetUsername = rows[idx].username;
    return { ok: true };
  });
  // A reset PIN is exactly the kind of thing someone asks for after getting
  // locked out, so lift any lockout on the account it now belongs to.
  if (out.ok) await clearLoginThrottle_(resetUsername);
  return out;
}

/* Fixing a wrong campus/department/ministry for someone else — the same
   fields updateProfile lets a person set for themselves, just keyed by
   staffId instead of the caller's own id. PIN and isAdmin are deliberately
   not here: those go through adminResetPin and grantAdmin so each stays a
   single, obvious place to look for who changed it and why. */
async function adminUpdateStaff(username, pin, staffId, payload) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === staffId; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const rec = rows[idx];
    if (payload.name !== undefined) rec.name = payload.name;
    if (payload.campus !== undefined) rec.campus = payload.campus;
    if (payload.dept !== undefined) rec.dept = normDept_(payload.dept);
    if (payload.ministry !== undefined) rec.ministry = normMinistry_(rec.dept, payload.ministry);
    if (payload.role !== undefined) rec.role = payload.role;
    if (payload.staffType !== undefined) rec.staffType = cleanStaffType_(payload.staffType);
    if (payload.country !== undefined) rec.country = cleanCountry_(payload.country);
    if (payload.username !== undefined) {
      // Same shape sign-up already enforces (staffRegister above) — a username
      // is also how someone logs in, so it can't collide with anyone else's.
      // Whoever it belongs to will need the new one (and their same PIN) next
      // time they sign in — same as adminResetPin already means a new PIN.
      const u = normUser_(payload.username);
      if (!/^[a-z0-9._-]{2,20}$/.test(u)) return { abort: true, ok: false, err: 'bad_username' };
      if (rows.some(function (r) { return r.id !== staffId && r.username === u; })) {
        return { abort: true, ok: false, err: 'username_taken' };
      }
      rec.username = u;
    }
    if (payload.email !== undefined) {
      const email = cleanEmail_(payload.email);
      if (email === null) return { abort: true, ok: false, err: 'bad_email' };
      if (email && rows.some(function (r) { return r.id !== staffId && r.email && r.email === email; })) {
        return { abort: true, ok: false, err: 'email_taken' };
      }
      rec.email = email;
    }
    if (payload.ministries !== undefined) rec.ministries = cleanMinistries_(payload.ministries, rec);
    else if (rec.ministries) rec.ministries = cleanMinistries_(rec.ministries, rec);
    // Which ministries this person leads — admin-assigned only; see leadsOf_.
    if (payload.leads !== undefined) rec.leads = cleanLeads_(payload.leads);
    // HR access — the Human Resources page (staff contracts, archiving). Admin-assigned.
    if (payload.hr !== undefined) rec.hr = !!payload.hr;
    // Portal access — who works applications. Admin-assigned; never to an applicant account.
    if (payload.portalStaff !== undefined || payload.portalAdmin !== undefined) {
      if (isApplicant_(rec)) return { abort: true, ok: false, err: 'is_applicant' };
      if (payload.portalStaff !== undefined) rec.portalStaff = !!payload.portalStaff;
      if (payload.portalAdmin !== undefined) rec.portalAdmin = !!payload.portalAdmin;
    }
    rec.updated = new Date().toISOString();
    rows[idx] = rec;
    return { ok: true, staff: adminStaffOut_(rec) };
  });
}

/* For the real mess this exists to clean up — a duplicate sign-up, a test
   account — not for the normal way someone leaves: that's adminSetActive
   (deactivate), which keeps their history intact. This is permanent, so an
   admin can't delete their own account (that would be one admin locking
   everyone out, or locking themselves out, by mistake), and anyone who had
   this person set as their mentor has that cleared rather than left
   pointing at a ghost id. Their logged numbers stay — a week someone
   answered doesn't stop being real base history just because the account
   that wrote it is gone; only the account itself goes. */
async function adminDeleteStaff(username, pin, staffId) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  if (admin.id === staffId) return { ok: false, err: 'self_delete' };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === staffId; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    rows.splice(idx, 1);
    rows.forEach(function (r) {
      if (r.mentorId === staffId) { r.mentorId = ''; r.mentorStatus = ''; r.updated = new Date().toISOString(); }
    });
    return { ok: true };
  });
}

/* For the one real duplicate this exists to fix — someone who accidentally
   made a second profile, then logged real history under both. Everything
   keyed by staffId (daily logs, weekly goals, leave requests, SMART goals)
   moves onto the kept account; the weekly health check-in moves the same
   way but by surveyToken, since that's what keeps it anonymous in the base
   average. Where BOTH accounts already have a row for the same period (the
   same day, the same week) the kept account's own row wins and the
   duplicate's is left behind rather than overwriting real data — merging
   should never make today's numbers less true than before it ran. The
   duplicate account is deleted at the end, exactly like adminDeleteStaff. */
async function adminMergeStaff(username, pin, keepId, mergeId) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  keepId = str_(keepId, 60); mergeId = str_(mergeId, 60);
  if (!keepId || !mergeId || keepId === mergeId) return { ok: false, err: 'bad_ids' };
  const rows = await getStaff_();
  const keepIdx = rows.findIndex(function (r) { return r.id === keepId; });
  const mergeIdx = rows.findIndex(function (r) { return r.id === mergeId; });
  if (keepIdx === -1 || mergeIdx === -1) return { ok: false, err: 'not_found' };
  const keep = rows[keepIdx];

  // Reassign ownership; where the kept account already has its own row for
  // the same period, leave the duplicate's row under the old id rather than
  // clobbering the kept one. keyFn returns the collision key for a row.
  async function reassignById_(storeKey, keyFn) {
    const all = await readJSON(storeKey, []);
    const keptKeys = new Set(all.filter(function (r) { return r.staffId === keepId; }).map(keyFn));
    all.forEach(function (r) {
      if (r.staffId !== mergeId) return;
      const k = keyFn(r);
      if (keptKeys.has(k)) return;
      r.staffId = keepId;
      keptKeys.add(k);
    });
    await writeJSON(storeKey, all);
  }
  await reassignById_('dailyLogs', function (r) { return r.date; });
  await reassignById_('goals', function (r) { return r.week + '|' + yearOf_(r); });
  // Leave requests and SMART goals have no per-period uniqueness — every row
  // already coexists with every other by its own id, so there is nothing to
  // leave behind.
  await reassignById_('trips', function (r) { return r.id; });
  await reassignById_('smartGoals', function (r) { return r.id; });

  // The weekly health check-in is anonymous by device token, not staffId —
  // move the duplicate's rows onto the KEPT account's own token instead.
  // surveyTokenFor_ can mint a fresh token onto `keep` right here, so this
  // save has to happen before survey rows move, or a token generated only
  // in memory would vanish along with this request.
  const mergeToken = rows[mergeIdx].surveyToken;
  if (mergeToken) {
    const keepToken = surveyTokenFor_(keep);
    await saveStaff_(rows);
    const surveyRows = await getSurvey_();
    const keptWeeks = new Set(surveyRows.filter(function (r) { return r.device === keepToken; })
      .map(function (r) { return r.week + '|' + yearOf_(r); }));
    surveyRows.forEach(function (r) {
      if (r.device !== mergeToken) return;
      const k = r.week + '|' + yearOf_(r);
      if (keptWeeks.has(k)) return;
      r.device = keepToken;
      keptWeeks.add(k);
    });
    await writeJSON('survey', surveyRows);
  }

  // 1-on-1s have no per-period uniqueness either — a pair can already have
  // several, so both directions just move straight over.
  const oneOnOnes = await getOneOnOnes_();
  oneOnOnes.forEach(function (r) {
    if (r.fromId === mergeId) r.fromId = keepId;
    if (r.toId === mergeId) r.toId = keepId;
  });
  await writeJSON('oneOnOnes', oneOnOnes);

  const afterRows = await getStaff_();
  const finalIdx = afterRows.findIndex(function (r) { return r.id === mergeId; });
  if (finalIdx > -1) afterRows.splice(finalIdx, 1);
  afterRows.forEach(function (r) {
    if (r.mentorId === mergeId) { r.mentorId = ''; r.mentorStatus = ''; r.updated = new Date().toISOString(); }
  });
  await saveStaff_(afterRows);
  return { ok: true };
}

async function updateProfile(username, pin, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  const rec = rows[idx];
  if (payload.name !== undefined) rec.name = payload.name;
  if (payload.campus !== undefined) rec.campus = payload.campus;
  if (payload.dept !== undefined) rec.dept = normDept_(payload.dept);
  if (payload.ministry !== undefined) rec.ministry = normMinistry_(rec.dept, payload.ministry);
  if (payload.role !== undefined) rec.role = payload.role;
  if (payload.staffType !== undefined) rec.staffType = cleanStaffType_(payload.staffType);
  if (payload.country !== undefined) rec.country = cleanCountry_(payload.country);
  if (payload.sex !== undefined) rec.sex = cleanSex_(payload.sex);
  if (payload.ministries !== undefined) rec.ministries = cleanMinistries_(payload.ministries, rec);
  else if (rec.ministries) rec.ministries = cleanMinistries_(rec.ministries, rec);   // a new main one drops out of the rest
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
  if (payload.email !== undefined) {
    const email = cleanEmail_(payload.email);
    if (email === null) return { ok: false, err: 'bad_email' };
    if (email && rows.some(function (r) { return r.id !== s.id && r.email && r.email === email; })) {
      return { ok: false, err: 'email_taken' };
    }
    rec.email = email;
  }
  // A free color wheel rather than a fixed palette — any hex works, so the
  // only guard is the shape, not membership in some list.
  if (payload.dashboardColor !== undefined) {
    rec.dashboardColor = /^#[0-9a-fA-F]{6}$/.test(payload.dashboardColor) ? payload.dashboardColor : '';
  }
  rec.updated = new Date().toISOString();
  rows[idx] = rec;
  await saveStaff_(rows);
  return {
    ok: true, staff: publicStaff_(rec),
    profile: {
      phone: rec.phone, joined: rec.joined, debt: rec.debt, mentorStatus: rec.mentorStatus || '',
      dashboardColor: rec.dashboardColor || '', dashboardBg: rec.dashboardBg || '', email: rec.email || '',
      sex: cleanSex_(rec.sex), personality: ownPersonality_(rec), strengths: ownStrengths_(rec),
      gstrengths: ownGStrengths_(rec)
    }
  };
}

/* Save (or clear) someone's personality type. Every field is optional, so the
   same door serves the whole flow: finishing the questionnaire (type + scores),
   picking a type you already know (type, source 'self'), switching sharing off,
   choosing a season, and setting the avatar's sex from the test's first screen.
   { clear: true } removes the type entirely — retaking starts from nothing. */
async function saveMyPersonality(username, pin, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const p = payload || {};
  if (p.type !== undefined && PTYPE_CODES.indexOf(p.type) === -1) return { ok: false, err: 'bad_type' };
  if (p.season !== undefined && PSEASON_IDS.indexOf(p.season) === -1) return { ok: false, err: 'bad_season' };
  const source = p.source === 'self' ? 'self' : 'test';
  let scores = null;
  if (p.type !== undefined && source === 'test') {
    scores = cleanPScores_(p.scores, p.type);
    if (!scores) return { ok: false, err: 'bad_scores' };
  }
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === s.id; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const rec = rows[idx];
    if (p.sex !== undefined) rec.sex = cleanSex_(p.sex);
    if (p.clear) {
      delete rec.personality;
    } else {
      const cur = Object.assign({}, rec.personality || {});
      if (p.type !== undefined) {
        cur.type = p.type;
        cur.scores = scores;
        cur.source = source;
        cur.takenAt = new Date().toISOString();
      }
      if (p.share !== undefined) cur.share = !!p.share;
      if (p.season !== undefined) cur.season = p.season;
      /* A share or season setting with no type yet has nothing to attach to. */
      if (cur.type) rec.personality = cur;
    }
    rec.updated = new Date().toISOString();
    rows[idx] = rec;
    return { ok: true, staff: rosterStaff_(rec), sex: cleanSex_(rec.sex), personality: ownPersonality_(rec) };
  });
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

async function uploadDashboardBg(username, pin, base64, mime) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (mime && PHOTO_MIME_ALLOWLIST.indexOf(mime) === -1) return { ok: false, err: 'bad_type' };
  const dataUri = 'data:' + (mime || 'image/jpeg') + ';base64,' + base64;
  if (dataUri.length > 400000) return { ok: false, err: 'too_large' };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  rows[idx].dashboardBg = dataUri;
  await saveStaff_(rows);
  return { ok: true, dashboardBg: dataUri };
}

async function clearDashboardBg(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getStaff_();
  const idx = rows.findIndex(function (r) { return r.id === s.id; });
  rows[idx].dashboardBg = '';
  await saveStaff_(rows);
  return { ok: true };
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
  /*  Answer from the rows we just wrote — never from a fresh read of the store.

      This used to end with `getMyLogs(username, pin)`, which re-reads
      `dailyLogs`. Blobs has no compare-and-swap and a read issued immediately
      after a write can still be served the older version, so that re-read could
      answer with the day as it was BEFORE this tap. The client believes the
      answer and paints the tile off again — which is exactly the "I tap a habit
      and it unticks itself" report. Worse than the flicker: the next tap is then
      computed from that stale map, so taps invert and get lost.

      The authoritative state is already in hand, so there is nothing to go and
      ask for. Two blob reads and a second PIN check saved as well. */
  return {
    ok: true, logs: logsFor_(rows, s.id), profile: { debt: s.debt },
    habits: habitsOf_(s), bibleDay: s.bibleDay || 0, week: week
  };
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
          source: r.source || 'daily',
          familyCall: r.familyCall, lonelyMonth: r.lonelyMonth,
          ministryUpdate: r.ministryUpdate, twoOneOnOnes: r.twoOneOnOnes
        };
      })
      .sort(function (a, b) { return b.week - a.week; });
  }
  /* A mentor relationship is opt-in and per-person consent to see everything
     in this database, not just the pooled figures the base gets — so once
     approved, nothing here is filtered back out: full daily logs (every
     habit, not just ones marked "shared" — that per-habit toggle no longer
     exists), the ministry numbers they log, their annual SMART goals, and
     their leave history. */
  const menteeTrips = (await getTrips_()).filter(function (r) { return r.staffId === m.id; })
    .sort(function (a, b) { return a.from < b.from ? 1 : -1; });
  const menteeSmart = (await getSmartGoals_()).filter(function (r) { return r.staffId === m.id; });
  return {
    ok: true, mentee: publicStaff_(m),
    logs: logsFor_(dailyRows, m.id),
    habits: cfg,
    goals: goalsFor_(await getGoals_(), m.id),
    checkins: checkins,
    profile: { debt: m.debt },
    ministry: await ministryDataFor_(m),
    trips: { trips: menteeTrips.map(tripOut_), totals: awayTotals_(menteeTrips), ptoCap: PTO_ANNUAL_CAP, holidays: holidayList_() },
    smartGoals: menteeSmart.map(smartGoalOut_)
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
async function getEntries_() { return normRows_(await readJSON('entries', [])); }
async function getOkrs_() { return normRows_(await readJSON('okrs', [])); }
async function getSurvey_() { return readJSON('survey', []); }
async function getMetricOverrides_() { return normRows_(await readJSON('metricOverrides', [])); }

async function getData(code, year) {
  const leader = isLeader_(code);
  const yr = askedYear_(year);
  const entryRows = (await withTeamRows_(await getEntries_())).filter(inYear_(yr));
  const entries = {};
  entryRows.forEach(function (r) {
    const dept = normDept_(r.dept); // rows are normalised on read; belt and braces
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
    byId[o.id].krs.push({ text: o.kr, metricKey: o.metricKey || '', target: Number(o.target) || 0, manual: Number(o.manualPct) || 0,
      group: o.group || '', kind: o.kind === 'count' ? 'count' : '', current: Number(o.current) || 0 });
  });

  const nn = function (v) { const n = Number(v); return (v === '' || v == null || isNaN(n)) ? null : n; };
  const surveyRows = (await getSurvey_()).filter(inYear_(yr));
  const survey = surveyRows.map(function (s) {
    return {
      campus: s.campus, week: Number(s.week), device: s.device,
      lonely: Number(s.lonely), clarity: Number(s.clarity), porn: Number(s.porn), oneOnOne: Number(s.oneOnOne),
      exercise: Number(s.exercise), quietTime: Number(s.quietTime), debt: Number(s.debt),
      langHours: Number(s.langHours) || 0, minHours: Number(s.minHours) || 0,
      sharedFaith: nn(s.sharedFaith), sabbath: nn(s.sabbath), growth: nn(s.growth),
      familyCall: nn(s.familyCall), lonelyMonth: nn(s.lonelyMonth),
      ministryUpdate: nn(s.ministryUpdate), twoOneOnOnes: nn(s.twoOneOnOnes)
    };
  });

  /* The roster rides along: the dashboard needs it for the staff headcount and was
     fetching it as a second request, and teamRoster is already unauthenticated, so
     this exposes nothing new — it just costs one invocation instead of two. */
  const roster = (await getStaff_()).filter(function (s) { return s.active && !isApplicant_(s); }).map(publicStaff_);

  /* `year` goes back so a page can tell which year it is looking at without
     recomputing it — the two pages disagree slightly about week numbering, and
     they must not also disagree about the year. */
  // Every ministry that has ever hidden a baseline metric or added a custom
  // one — both pages merge this into getDepartments() before they render a
  // single tile, so a custom metric shows up on the dashboard the same week
  // it's added, no separate sync step.
  const metricOverrides = await getMetricOverrides_();
  return { leader: leader, year: yr, entries: entries, okrs: okrs, survey: survey, roster: roster, metricOverrides: metricOverrides };
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
      if (writer) rows[idx].by = writer.id;
    } else {
      rows.push(Object.assign({ campus: campus, dept: dept, ministry: ministry, metric: metric,
        week: week, year: yr, value: value, updated: now }, writer ? { by: writer.id } : {}));
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

   'Base Director' is the old name for what is now the Campus Leadership
   department; profiles created before the rename still carry it. */
function deptOf_(s) { return normDept_(s.dept); }

/* An app admin (isAdmin) writes every campus's and department's objectives,
   the same reach as the leader code; everyone else stays pinned to their own. */
async function okrWriter_(code, username, pin) {
  if (isLeader_(code)) return { leader: true };
  const s = await verifyStaff_(username, pin);
  if (!s) return null;
  if (s.isAdmin && s.active !== false) return { leader: true, admin: true };
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
  // The new rows go back where the old ones were, so saving a key result's
  // progress does not move its objective to the bottom of the page.
  let at = rows.findIndex(function (r) { return String(r.id) === id; });
  rows = rows.filter(function (r) { return String(r.id) !== id; });
  if (at < 0 || at > rows.length) at = rows.length;
  const fresh = [];
  const now = new Date().toISOString();
  (Array.isArray(obj.krs) ? obj.krs.slice(0, 10) : []).forEach(function (kr) {
    const text = str_(kr && kr.text, 300);
    if (!text) return;
    fresh.push({
      campus: campus, quarter: quarter, dept: dept, id: id, objective: objective,
      kr: text, metricKey: str_(kr.metricKey, 200) || '',
      target: finiteNum_(kr.target, 0, 1e9) || 0, manualPct: finiteNum_(kr.manual, 0, 100) || 0,
      // A heading the key result sits under (Money, Time…), and a count toward
      // the target ("Recruit 20 students": 3 so far) for one tracked by number.
      group: str_(kr.group, 80) || '', kind: kr.kind === 'count' ? 'count' : '',
      current: finiteNum_(kr.current, 0, 1e9) || 0, updated: now
    });
  });
  rows.splice.apply(rows, [at, 0].concat(fresh));
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
    langHours: sumOf('langHours'),
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
const WEEK_HOURS = ['langHours'];
// The month-end add-on (see WEEK_MONTHLY_QS in teams.html) — unlike WEEK_FLAGS,
// only written when the client actually sent one, so a week that never asked
// stays truly absent rather than recording a "No" nobody answered. That's
// what lets compositeOf() count these on the weeks they were asked and skip
// them the rest of the time, the same way it already treats growth/sabbath.
const WEEK_MONTHLY_FLAGS = ['familyCall', 'lonelyMonth', 'ministryUpdate', 'twoOneOnOnes'];

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
  WEEK_MONTHLY_FLAGS.forEach(function (k) { if (p[k] !== undefined) rec[k] = p[k] ? 1 : 0; });
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
          source: r.source || 'daily',
          familyCall: r.familyCall, lonelyMonth: r.lonelyMonth,
          ministryUpdate: r.ministryUpdate, twoOneOnOnes: r.twoOneOnOnes
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
/*  A level's last known figure, wherever it was recorded.

    `entries` is scoped to this year, which is right for totals and wrong for the
    headcounts that barely move: a ministry whose "Students Enrolled" was last
    touched in week 50 of last year had nothing to carry forward, so the box came
    up empty and somebody had to remember 280 and retype it. A headcount does not
    reset because the calendar did.

    So this looks across every year and returns, per metric, the most recent
    figure recorded strictly BEFORE the current week — with the year it came
    from, so the screen can say "carried from week 50, 2025" rather than
    implying it was last week.  */
function prevLevels_(rows, campus, dept, ministry, yr, wk) {
  const prev = {};
  rows.forEach(function (r) {
    if (r.campus !== campus || r.dept !== dept || r.ministry !== ministry) return;
    if (SENSITIVE.indexOf(r.metric) > -1) return;
    const y = yearOf_(r), w = Number(r.week);
    if (!isFinite(w)) return;
    if (y > yr || (y === yr && w >= wk)) return;          // not earlier than now
    const val = Number(r.value);
    if (!isFinite(val)) return;
    const best = prev[r.metric];
    if (!best || y > best.year || (y === best.year && w > best.week)) {
      prev[r.metric] = { year: y, week: w, value: val };
    }
  });
  return prev;
}

async function ministryDataFor2_(campus, dept, ministry) {
  const out = {}, daily = {};
  const yr = currentYear_();
  let prev = {};
  if (ministry) {
    let rows = await getEntries_();
    if (dept === TEAM_DEPT && ministry === TEAM_MIN) rows = await withTeamRows_(rows);
    prev = prevLevels_(rows, campus, dept, ministry, yr, isoWeek_(new Date().toISOString().slice(0, 10)));
    rows.forEach(function (r) {
      if (r.campus !== campus || r.dept !== dept || r.ministry !== ministry) return;
      if (SENSITIVE.indexOf(r.metric) > -1) return;
      if (yearOf_(r) !== yr) return;
      if (!out[r.metric]) out[r.metric] = {};
      out[r.metric][String(r.week)] = Number(r.value);
    });
    // Per-day values so the UI can show what's already logged for today and
    // for the rest of this week.
    (await getKpiDaily_()).forEach(function (r) {
      if (r.campus !== campus || r.dept !== dept || r.ministry !== ministry) return;
      if (yearOf_(r) !== yr) return;
      if (!daily[r.metric]) daily[r.metric] = {};
      daily[r.metric][r.date] = Number(r.value);
    });
  }
  return { ok: true, campus: campus, dept: dept, ministry: ministry || '',
    entries: out, daily: daily, prev: prev, pins: [] };
}

/* ==================== numbers people ====================
   Each ministry has a main person and a backup who are responsible for its
   weekly numbers, which are due by Friday of that week. Anyone on the
   ministry can still enter them (canLogFor_ is unchanged) — this says whose
   job it is, so it is somebody's. With nobody set, the ministry's leaders are
   responsible by default.

     numbersPeople: { 'campus|dept|ministry': { main: staffId, backup: staffId|'', by, at } }

   Set by the ministry's leader, its department's Campus Leadership overseer,
   or an admin (canSetNumbers_). Outreach Teams is left out: its numbers come
   from the Teams Database and work as they are.

   The reminders themselves are drawn by the page (notifItems_ in teams.html)
   from numbersStatus_, which the boot carries: whether each ministry I am
   responsible for has numbers in this week and last, and — for a department
   overseer — the same for every ministry in the department, with names. */
function numbersKey_(campus, dept, ministry) { return campus + '|' + dept + '|' + ministry; }
function isTeamsMinistry_(dept, ministry) { return dept === TEAM_DEPT && ministry === TEAM_MIN; }
/* Outreach Teams (the Teams Database) and Campus Leadership's own rows (OKRs and
   the Monday board, no weekly numbers) have no numbers people. */
function numbersExempt_(dept, ministry) { return isTeamsMinistry_(dept, ministry) || dept === 'Campus Leadership'; }
async function getNumbersPeople_() {
  const v = await readJSON('numbersPeople', {});
  return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
}
function canSetNumbers_(s, dept, ministry) {
  if (numbersExempt_(dept, ministry)) return false;
  return !!(s && (s.isAdmin || isLeaderOf_(s, dept, ministry) || (deptOf_(s) === 'Campus Leadership' && s.ministry === dept)));
}
function personOut_(rows, id) {
  const r = id ? rows.find(function (x) { return x.id === id && x.active; }) : null;
  return r ? { id: r.id, name: r.name } : null;
}
function numbersPeopleFor_(np, rows, campus, dept, ministry) {
  const rec = np[numbersKey_(campus, dept, ministry)] || {};
  const main = personOut_(rows, rec.main), backup = personOut_(rows, rec.backup);
  const leaders = rows.filter(function (r) {
    return r.active && r.campus === campus && !isApplicant_(r) && isLeaderOf_(r, dept, ministry);
  }).map(function (r) { return { id: r.id, name: r.name }; });
  return { main: main, backup: backup, leaders: leaders, defaulted: !main };
}
/* The day in Cambodia — the base's week turns over at its own midnight, not the server's. */
function baseToday_() { return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10); }

async function setNumbersPeople(username, pin, dept, ministry, payload) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  dept = str_(dept, 80); ministry = str_(ministry, 80);
  if (!dept || !ministry) return { ok: false, err: 'bad_ministry' };
  if (!canSetNumbers_(s, dept, ministry)) return { ok: false, err: 'not_authorized' };
  const p = payload || {};
  const rows = await getStaff_();
  const pick = function (id) {
    if (id === null || id === undefined || id === '') return '';
    const r = rows.find(function (x) { return x.id === String(id) && x.active && x.campus === s.campus && !isApplicant_(x); });
    return r ? r.id : null;
  };
  const main = pick(p.main), backup = pick(p.backup);
  if (main === null || backup === null) return { ok: false, err: 'bad_person' };
  if (main && backup && main === backup) return { ok: false, err: 'same_person' };
  if (!main && backup) return { ok: false, err: 'backup_needs_main' };
  const np = await getNumbersPeople_();
  const key = numbersKey_(s.campus, dept, ministry);
  if (!main) delete np[key];
  else np[key] = { main: main, backup: backup || '', by: s.id, at: new Date().toISOString() };
  await writeJSON('numbersPeople', np);
  const out = numbersPeopleFor_(np, rows, s.campus, dept, ministry);
  out.canSet = true;
  return { ok: true, numbers: out };
}

/* The numbers people for one ministry, plus who last entered each week's
   numbers — attached to what My Ministry loads (getMyMinistry / getMinistryFor). */
async function withNumbers_(d, s) {
  if (!d || !d.ok || !d.ministry || numbersExempt_(d.dept, d.ministry)) return d;
  const [np, rows, entries] = await Promise.all([getNumbersPeople_(), getStaff_(), getEntries_()]);
  const n = numbersPeopleFor_(np, rows, d.campus, d.dept, d.ministry);
  n.canSet = canSetNumbers_(s, d.dept, d.ministry);
  const yr = currentYear_(), last = {};
  entries.forEach(function (r) {
    if (r.campus !== d.campus || r.dept !== d.dept || r.ministry !== d.ministry || yearOf_(r) !== yr || !r.by) return;
    const w = String(r.week);
    if (!last[w] || (r.updated || '') > last[w].at) last[w] = { id: r.by, at: r.updated || '' };
  });
  n.lastBy = {};
  Object.keys(last).forEach(function (w) {
    const p = personOut_(rows, last[w].id);
    n.lastBy[w] = { name: p ? p.name : '', at: last[w].at };
  });
  d.numbers = n;
  return d;
}

/* For the boot: which ministries I am responsible for (main, backup, or a
   leader with nobody set) and whether each has numbers in this week and last;
   and for a department's overseer, every ministry in the department with its
   people. "In" means any number for the week — the same rule as the page's
   ministryWeekLogged_ (a day's figures roll up into the week's entry). */
async function numbersStatus_(s, rows) {
  const np = await getNumbersPeople_();
  const entries = await getEntries_();
  const wk = isoWeek_(baseToday_());
  const weeks = [wk]; if (wk > 1) weeks.push(wk - 1);
  const yr = currentYear_();
  const logged = {};
  weeks.forEach(function (w) { logged[w] = {}; });
  entries.forEach(function (r) {
    if (r.campus !== s.campus || yearOf_(r) !== yr || !logged[Number(r.week)]) return;
    logged[Number(r.week)][r.dept + '|' + r.ministry] = true;
  });
  const loggedFor = function (dept, ministry) {
    const o = {}; weeks.forEach(function (w) { o[w] = !!logged[w][dept + '|' + ministry]; }); return o;
  };
  const duty = [], seen = {};
  Object.keys(np).forEach(function (k) {
    const parts = k.split('|');
    if (parts[0] !== s.campus || numbersExempt_(parts[1], parts[2])) return;
    const role = np[k].main === s.id ? 'main' : (np[k].backup === s.id ? 'backup' : '');
    if (!role) return;
    seen[parts[1] + '|' + parts[2]] = 1;
    duty.push({ dept: parts[1], ministry: parts[2], role: role, logged: loggedFor(parts[1], parts[2]) });
  });
  leadsOf_(s).forEach(function (k) {
    const parts = k.split('|');
    if (numbersExempt_(parts[0], parts[1]) || seen[k] || np[numbersKey_(s.campus, parts[0], parts[1])]) return;
    duty.push({ dept: parts[0], ministry: parts[1], role: 'leader', logged: loggedFor(parts[0], parts[1]) });
  });
  let dept = null;
  if (deptOf_(s) === 'Campus Leadership' && s.ministry && s.ministry !== 'Campus Director') {
    const people = {};
    Object.keys(np).forEach(function (k) {
      const parts = k.split('|');
      if (parts[0] === s.campus && parts[1] === s.ministry) people[parts[2]] = numbersPeopleFor_(np, rows, s.campus, s.ministry, parts[2]);
    });
    const leaders = {};
    rows.forEach(function (r) {
      if (!r.active || r.campus !== s.campus || isApplicant_(r)) return;
      leadsOf_(r).forEach(function (k) {
        const parts = k.split('|');
        if (parts[0] === s.ministry) (leaders[parts[1]] = leaders[parts[1]] || []).push({ id: r.id, name: r.name });
      });
    });
    const lg = {};
    weeks.forEach(function (w) {
      lg[w] = Object.keys(logged[w]).filter(function (k) { return k.split('|')[0] === s.ministry; })
        .map(function (k) { return k.split('|')[1]; });
    });
    dept = { dept: s.ministry, people: people, leaders: leaders, logged: lg };
  }
  return { week: wk, duty: duty, dept: dept };
}

/* ==================== department pulse ====================
   What a department's leader sees about the department, with nothing typed:
   whether its ministries had their numbers in on time (numbers people), its
   headcount and who is away this week, its health check-ins, its 1-on-1s
   this month, and its staff debt (entered monthly by the Finance office —
   saveStaffDebt). The Campus Director sees it for every department.

   HEALTH STAYS ANONYMOUS. Check-ins carry a token, never a name (see "Who
   sees what" in CLAUDE.md). This joins the department's staff to their
   tokens on the server and sends back only two numbers — how many answered
   and the average health score — never a row, a name or an answer, and no
   score at all when fewer than PULSE_MIN_N answered, so nobody can be
   singled out. The health score is compositeOf in taxonomy.js; compositeOf_
   mirrors it and tests/test-dept-pulse.mjs checks they agree. */
const PULSE_MIN_N = 3;
const PULSE_DEPTS = ['Community Service', 'Youth Education', 'Leadership Development', 'Skills Training'];
function compositeOf_(r) {
  const parts = [10 - (Number(r.lonely) || 0), Number(r.clarity) || 0,
    r.porn ? 0 : 10, r.oneOnOne ? 10 : 0, r.exercise ? 10 : 0, r.quietTime ? 10 : 0, r.debt ? 0 : 10];
  ['growth'].forEach(function (k) { if (r[k] !== null && r[k] !== undefined) parts.push(Number(r[k]) || 0); });
  ['sharedFaith', 'sabbath', 'familyCall', 'ministryUpdate', 'twoOneOnOnes'].forEach(function (k) {
    if (r[k] !== null && r[k] !== undefined) parts.push(r[k] ? 10 : 0);
  });
  if (r.lonelyMonth !== null && r.lonelyMonth !== undefined) parts.push(r.lonelyMonth ? 0 : 10);
  return parts.reduce(function (a, b) { return a + b; }, 0) / parts.length;
}
function canSeePulse_(s, dept) {
  if (PULSE_DEPTS.indexOf(dept) === -1) return false;
  if (s.isAdmin) return true;
  if (deptOf_(s) !== 'Campus Leadership') return false;
  return s.ministry === dept || s.ministry === 'Campus Director';
}
function canEnterStaffDebt_(s) {
  return !!(s && (s.isAdmin || memberOf_(s, 'Skills Training', 'Finances') || isLeaderOf_(s, 'Skills Training', 'Finances')));
}
function overlaps_(from, to, a, b) { return from <= b && to >= a; }

async function getDeptPulse(username, pin, dept) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  dept = str_(dept, 80);
  if (!canSeePulse_(s, dept)) return { ok: false, err: 'not_authorized' };
  const [rows, np, entries, survey, trips, ones] = await Promise.all([
    getStaff_(), getNumbersPeople_(), getEntries_(), getSurvey_(), getTrips_(), getOneOnOnes_()]);
  const campus = s.campus, yr = currentYear_();
  const today = baseToday_(), wk = isoWeek_(today);
  const staff = rows.filter(function (r) { return r.active && r.campus === campus && !isApplicant_(r) && deptOf_(r) === dept; });
  const ids = {}; staff.forEach(function (r) { ids[r.id] = r; });

  /* away this week: approved (or simply noted) leave overlapping Mon–Sun — names and dates, no reasons */
  const mon = new Date(today + 'T00:00:00Z'); mon.setUTCDate(mon.getUTCDate() - ((mon.getUTCDay() + 6) % 7));
  const sun = new Date(mon); sun.setUTCDate(sun.getUTCDate() + 6);
  const a = mon.toISOString().slice(0, 10), b = sun.toISOString().slice(0, 10);
  const away = trips.filter(function (t) {
    return ids[t.staffId] && (t.status === 'approved' || t.status === 'noted') && isDate_(t.from) && isDate_(t.to) && overlaps_(t.from, t.to, a, b);
  }).map(function (t) { return { name: ids[t.staffId].name, from: t.from, to: t.to }; });

  /* health, by week, as two numbers only */
  const tokens = {}; staff.forEach(function (r) { if (r.surveyToken) tokens[r.surveyToken] = 1; });
  const healthFor = function (w) {
    const got = survey.filter(function (r) { return tokens[r.device] && Number(r.week) === w && yearOf_(r) === yr; });
    const out = { week: w, answered: got.length, total: staff.length };
    if (got.length >= PULSE_MIN_N) out.score = Math.round(got.reduce(function (x, r) { return x + compositeOf_(r); }, 0) / got.length * 10) / 10;
    return out;
  };
  const health = [healthFor(wk)]; if (wk > 1) health.push(healthFor(wk - 1));

  /* 1-on-1s this month that someone in the department was part of */
  const month = today.slice(0, 7);
  const oneOnOnes = ones.filter(function (o) {
    return o.status === 'accepted' && (ids[o.fromId] || ids[o.toId]) && String(o.decidedAt || o.created || '').slice(0, 7) === month;
  }).length;

  /* numbers in on time, this week and last */
  const weeks = [wk]; if (wk > 1) weeks.push(wk - 1);
  const logged = {}; weeks.forEach(function (w) { logged[w] = {}; });
  entries.forEach(function (r) {
    if (r.campus !== campus || r.dept !== dept || yearOf_(r) !== yr || !logged[Number(r.week)]) return;
    logged[Number(r.week)][r.ministry] = true;
  });
  const lg = {}; weeks.forEach(function (w) { lg[w] = Object.keys(logged[w]); });
  const people = {};
  Object.keys(np).forEach(function (k) {
    const parts = k.split('|');
    if (parts[0] === campus && parts[1] === dept) people[parts[2]] = numbersPeopleFor_(np, rows, campus, dept, parts[2]);
  });
  const leaders = {};
  rows.forEach(function (r) {
    if (!r.active || r.campus !== campus || isApplicant_(r)) return;
    leadsOf_(r).forEach(function (k) { const parts = k.split('|'); if (parts[0] === dept) (leaders[parts[1]] = leaders[parts[1]] || []).push({ id: r.id, name: r.name }); });
  });

  return { ok: true, dept: dept, week: wk, staff: staff.length, away: away, health: health, minN: PULSE_MIN_N,
    oneOnOnes: oneOnOnes, staffDebt: staffDebtFor_(entries, rows, campus, dept),
    numbers: { dept: dept, people: people, leaders: leaders, logged: lg } };
}

/* ---- staff debt, entered monthly by the Finance office ----
   Stored the way it always was — the level metric "Staff Debt ($)" on each
   department's Campus Leadership row — so everything that reads it still
   does; only who types it has changed. */
function staffDebtFor_(entries, rows, campus, dept) {
  let best = null;
  entries.forEach(function (r) {
    if (r.campus !== campus || r.dept !== 'Campus Leadership' || r.ministry !== dept || r.metric !== 'Staff Debt ($)') return;
    if (!best || (r.updated || '') > (best.updated || '')) best = r;
  });
  if (!best) return null;
  const p = personOut_(rows, best.by);
  return { value: Number(best.value), at: best.updated || '', by: p ? p.name : '' };
}
async function getStaffDebt(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canEnterStaffDebt_(s)) return { ok: false, err: 'not_authorized' };
  const [entries, rows] = await Promise.all([getEntries_(), getStaff_()]);
  const out = {};
  PULSE_DEPTS.forEach(function (d) { out[d] = staffDebtFor_(entries, rows, s.campus, d); });
  return { ok: true, debt: out };
}
async function saveStaffDebt(username, pin, values) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canEnterStaffDebt_(s)) return { ok: false, err: 'not_authorized' };
  const v = values || {};
  const wk = isoWeek_(baseToday_());
  for (const d of PULSE_DEPTS) {
    if (v[d] === undefined || v[d] === null || v[d] === '') continue;
    const n = finiteNum_(v[d], 0, 1e9);
    if (n === null) return { ok: false, err: 'bad_amount' };
    await saveMinistryInternal_(s.campus, 'Campus Leadership', d, wk, [{ metric: 'Staff Debt ($)', value: n }], s.id);
  }
  return getStaffDebt(username, pin);
}

async function ministryDataFor_(s) {
  const d = await ministryDataFor2_(s.campus, s.dept, s.ministry);
  d.pins = Array.isArray(s.kpiPins) ? s.kpiPins : [];
  return d;
}

async function getMyMinistry(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  return withNumbers_(await ministryDataFor_(s), s);
}

/* Who sees and enters a ministry's numbers on My Ministry: the people IN it.
   That is your main ministry, the other ministries on your profile
   (ministriesOf_), a ministry you lead, and — for a department's own
   "Campus Leadership" overseer (dept:'Campus Leadership', ministry: e.g.
   'Community Service') — every ministry under that department. An admin
   may open (and enter) any ministry on their own campus: everyone else's
   picker shows only the ministries they are part of, an admin's has every
   one, in a Department / Ministry dropdown. */
function canLogFor_(s, campus, dept, ministry) {
  if (campus !== s.campus) return false;
  if (s.isAdmin) return true;
  if (memberOf_(s, dept, ministry)) return true;
  if (isLeaderOf_(s, dept, ministry)) return true;
  return s.dept === 'Campus Leadership' && s.ministry === dept;
}

async function getMinistryFor(username, pin, dept, ministry) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canLogFor_(s, s.campus, dept, ministry)) return { ok: false, err: 'not_authorized' };
  return withNumbers_(await ministryDataFor2_(s.campus, dept, ministry), s);
}

async function saveMinistryInternal_(campus, dept, ministry, week, updates, by) {
  const wk = finiteNum_(week, 1, 52);
  if (wk == null) return { ok: false, err: 'bad_week' };
  const rows = await getEntries_();
  const now = new Date().toISOString();
  const yr = currentYear_();
  (Array.isArray(updates) ? updates : []).forEach(function (u) {
    const metric = str_(u && u.metric, 80);
    if (!metric || SENSITIVE.indexOf(metric) > -1) return;
    const idx = rows.findIndex(function (r) {
      return r.campus === campus && r.dept === dept && r.ministry === ministry &&
        r.metric === metric && String(r.week) === String(wk) && yearOf_(r) === yr;
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) rows.splice(idx, 1);
      return;
    }
    const value = finiteNum_(u.value, -1e9, 1e9);
    if (value == null) return;
    /* who typed it, for "last entered by" on My Ministry */
    if (idx > -1) { rows[idx].value = value; rows[idx].updated = now; if (by) rows[idx].by = by; }
    else rows.push(Object.assign({ campus: campus, dept: dept, ministry: ministry, metric: metric, week: wk, year: yr, value: value, updated: now }, by ? { by: by } : {}));
  });
  await writeJSON('entries', rows);
  return { ok: true };
}

async function saveMyMinistry(username, pin, week, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!s.ministry) return { ok: false, err: 'no_ministry' };
  await saveMinistryInternal_(s.campus, s.dept, s.ministry, week, updates, s.id);
  return getMyMinistry(username, pin);
}

async function saveMinistryFor(username, pin, dept, ministry, week, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canLogFor_(s, s.campus, dept, ministry)) return { ok: false, err: 'not_authorized' };
  await saveMinistryInternal_(s.campus, dept, ministry, week, updates, s.id);
  return getMinistryFor(username, pin, dept, ministry);
}

/* ==================== ministry metric overrides ====================
   Not every ministry tracks the same things — Cafe cares about cups sold,
   Outreach Teams doesn't. getDepartments() in taxonomy.js still holds the
   starting list per ministry; this is the per-(campus,dept,ministry) diff
   from it: baseline metrics a ministry has turned off, and metrics it added
   of its own. Both pages merge this into getDepartments() before rendering,
   so nothing downstream (the dashboard, My Ministry, the OKR metric picker)
   needs to know overrides exist at all.

   A custom name is expected to carry its own aggregation the same way every
   built-in metric already does — end it "(1-10)" for an average or "(%)"
   for a percentage, plain otherwise for a running total — so modeOf() picks
   it up with no new code. Only Base Finances/Cash Reserve are off limits:
   those two names are how getData() decides what a non-leader may never
   see, and a custom metric reusing one would be silently swallowed by that
   same filter, not a way around it — but the confusion isn't worth having,
   so it's refused outright. */
const MAX_CUSTOM_METRICS = 25;
const MAX_HIDDEN_METRICS = 60;

/* Logging a number and changing what gets logged are two different rights.
   Everyone on a ministry logs its numbers (canLogFor_); only an admin, the
   campus leadership department, or that ministry's own assigned leader
   changes its metric list or cadence. A ministry's ordinary staff used to be
   able to hide and add metrics too — Uriah asked for that to sit with the
   leader position instead, so the list someone logs against can't quietly
   change under the whole team. */
function canEditMetrics_(s, campus, dept, ministry) {
  if (s.isAdmin) return true;
  if (campus !== s.campus) return false;
  return isLeadership_(s) || isLeaderOf_(s, dept, ministry);
}

const CADENCE_VALUES = ['month', 'quarter'];

async function saveMetricOverrides(username, pin, campus, dept, ministry, hidden, custom, cadence) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  campus = str_(campus, 40); dept = str_(dept, 80); ministry = str_(ministry, 80);
  if (!campus || !dept || !ministry) return { ok: false, err: 'bad_target' };
  if (!canEditMetrics_(s, campus, dept, ministry)) return { ok: false, err: 'not_authorized' };

  const cleanHidden = (Array.isArray(hidden) ? hidden : [])
    .map(function (m) { return str_(m, 80); }).filter(Boolean).slice(0, MAX_HIDDEN_METRICS);
  const cleanCustom = [];
  (Array.isArray(custom) ? custom : []).forEach(function (m) {
    const name = str_(m, 80);
    if (!name || SENSITIVE.indexOf(name) > -1) return;
    if (cleanCustom.indexOf(name) === -1) cleanCustom.push(name);
  });
  if (cleanCustom.length > MAX_CUSTOM_METRICS) return { ok: false, err: 'too_many' };

  const rows = await getMetricOverrides_();
  const idx = rows.findIndex(function (r) { return r.campus === campus && r.dept === dept && r.ministry === ministry; });
  const existing = idx > -1 ? rows[idx] : null;

  // Cadence (weekly → monthly/quarterly) takes the same right as hiding or
  // adding a metric (canEditMetrics_ above) — untouched (cadence omitted)
  // just keeps whatever is already stored.
  let cleanCadence = (existing && existing.cadence) || {};
  if (cadence !== undefined && cadence !== null) {
    const nextCadence = {};
    Object.keys(cadence).forEach(function (m) {
      const name = str_(m, 80);
      const val = cadence[m];
      if (name && CADENCE_VALUES.indexOf(val) > -1) nextCadence[name] = val;
    });
    cleanCadence = nextCadence;
  }

  const rec = { campus: campus, dept: dept, ministry: ministry, hidden: cleanHidden, custom: cleanCustom, cadence: cleanCadence, updated: new Date().toISOString() };
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('metricOverrides', rows);
  return { ok: true, metricOverrides: rows };
}

/* Renaming a metric the ministry added itself. The name is the join key for
   every number ever logged under it (see the note at the top of taxonomy.js),
   so a rename that only touched the list would orphan the ministry's own
   history — the numbers, the day-by-day rows behind them, and any key result
   pointing at the metric all move with the name. Baseline metrics can't be
   renamed here: they belong to the shared taxonomy, not to one ministry. */
async function renameCustomMetric(username, pin, campus, dept, ministry, oldName, newName) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  campus = str_(campus, 40); dept = str_(dept, 80); ministry = str_(ministry, 80);
  oldName = str_(oldName, 80); newName = str_(newName, 80);
  if (!campus || !dept || !ministry || !oldName || !newName) return { ok: false, err: 'bad_target' };
  if (!canEditMetrics_(s, campus, dept, ministry)) return { ok: false, err: 'not_authorized' };
  if (SENSITIVE.indexOf(newName) > -1) return { ok: false, err: 'reserved' };

  const rows = await getMetricOverrides_();
  const idx = rows.findIndex(function (r) { return r.campus === campus && r.dept === dept && r.ministry === ministry; });
  const rec = idx > -1 ? rows[idx] : null;
  if (!rec || (rec.custom || []).indexOf(oldName) === -1) return { ok: false, err: 'not_custom' };
  if (newName === oldName) return { ok: true, metricOverrides: rows, moved: 0 };
  if ((rec.custom || []).indexOf(newName) > -1) return { ok: false, err: 'exists' };

  const now = new Date().toISOString();
  rec.custom = rec.custom.map(function (m) { return m === oldName ? newName : m; });
  if (rec.cadence && rec.cadence[oldName]) { rec.cadence[newName] = rec.cadence[oldName]; delete rec.cadence[oldName]; }
  rec.updated = now;
  await writeJSON('metricOverrides', rows);

  const same = function (r) { return r.campus === campus && r.dept === dept && r.ministry === ministry && r.metric === oldName; };
  let moved = 0;
  const entries = await getEntries_();
  entries.forEach(function (r) { if (same(r)) { r.metric = newName; r.updated = now; moved++; } });
  if (moved) await writeJSON('entries', entries);
  let movedDays = 0;
  const daily = await getKpiDaily_();
  daily.forEach(function (r) { if (same(r)) { r.metric = newName; movedDays++; } });
  if (movedDays) await writeJSON('kpiDaily', daily);
  // The okrs blob is one row per key result (see saveObjective), so the
  // metric key sits on the row itself.
  const oldKey = dept + '|' + ministry + '|' + oldName, newKey = dept + '|' + ministry + '|' + newName;
  let movedKrs = 0;
  const okrs = await getOkrs_();
  okrs.forEach(function (o) {
    if (o.campus === campus && o.metricKey === oldKey) { o.metricKey = newKey; movedKrs++; }
  });
  if (movedKrs) await writeJSON('okrs', okrs);
  return { ok: true, metricOverrides: rows, moved: moved };
}

/* ==================== personal metrics ====================
   A staff member's own week — how many people they shared their faith with,
   encouraged, met one-on-one, how many teachings they prepped — separate from
   the ministry's numbers, which belong to the team. Keyed by the person, so
   these never reach the dashboard or anyone else's page. Four fixed metrics
   for now (the client owns the list); the store doesn't care which names it
   is handed, so the list can grow without a migration. */
async function getPersonalRows_() { return readJSON('personalKpi', []); }
function personalOut_(rows, staffId) {
  const yr = currentYear_();
  const out = {};
  rows.forEach(function (r) {
    if (r.staffId !== staffId || yearOf_(r) !== yr) return;
    if (!out[r.metric]) out[r.metric] = {};
    out[r.metric][String(r.week)] = Number(r.value);
  });
  return { ok: true, entries: out };
}
async function getMyPersonal(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  return personalOut_(await getPersonalRows_(), s.id);
}
async function saveMyPersonalWeek(username, pin, week, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const wk = finiteNum_(week, 1, 52);
  if (wk == null) return { ok: false, err: 'bad_week' };
  const rows = await getPersonalRows_();
  const now = new Date().toISOString();
  const yr = currentYear_();
  (Array.isArray(updates) ? updates : []).forEach(function (u) {
    const metric = str_(u && u.metric, 80);
    if (!metric) return;
    const idx = rows.findIndex(function (r) {
      return r.staffId === s.id && r.metric === metric && Number(r.week) === wk && yearOf_(r) === yr;
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) rows.splice(idx, 1);
      return;
    }
    const value = finiteNum_(u.value, -1e9, 1e9);
    if (value == null) return;
    if (idx > -1) { rows[idx].value = value; rows[idx].updated = now; }
    else rows.push({ staffId: s.id, metric: metric, week: wk, year: yr, value: value, updated: now });
  });
  await writeJSON('personalKpi', rows);
  return personalOut_(rows, s.id);
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

async function getKpiDaily_() { return normRows_(await readJSON('kpiDaily', [])); }

function rollUpKpi_(dayRows, mode) {
  const vals = dayRows.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  if (!vals.length) return null;
  if (mode === 'latest') return Number(vals[vals.length - 1].value);
  const nums = vals.map(function (r) { return Number(r.value) || 0; });
  if (mode === 'avg') return Math.round((nums.reduce(function (a, b) { return a + b; }, 0) / nums.length) * 10) / 10;
  return nums.reduce(function (a, b) { return a + b; }, 0);
}

async function saveKpiDayInternal_(campus, dept, ministry, dateStr, updates, staffId) {
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
      return r.campus === campus && r.dept === dept && r.ministry === ministry &&
        r.metric === metric && r.date === date;
    });
    if (u.value === null || u.value === '' || u.value === undefined) {
      if (idx > -1) daily.splice(idx, 1);
      return;
    }
    const value = finiteNum_(u.value, -1e9, 1e9);
    if (value == null) return;
    const rec = {
      campus: campus, dept: dept, ministry: ministry, metric: metric,
      date: date, week: wk, year: yearFromDate_(date) || currentYear_(),
      value: value, staffId: staffId, updated: new Date().toISOString()
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
      return r.campus === campus && r.dept === dept && r.ministry === ministry &&
        r.metric === metric && Number(r.week) === wk && yearOf_(r) === dayYear;
    });
    const total = rollUpKpi_(days, touched[metric]);
    const ei = entries.findIndex(function (r) {
      return r.campus === campus && r.dept === dept && r.ministry === ministry &&
        r.metric === metric && String(r.week) === String(wk) && yearOf_(r) === dayYear;
    });
    if (total === null) { if (ei > -1) entries.splice(ei, 1); return; }
    if (ei > -1) { entries[ei].value = total; entries[ei].updated = now; if (staffId) entries[ei].by = staffId; }
    else entries.push(Object.assign({ campus: campus, dept: dept, ministry: ministry, metric: metric, week: wk, year: dayYear, value: total, updated: now }, staffId ? { by: staffId } : {}));
  });
  await writeJSON('entries', entries);
  return { ok: true };
}

async function saveMyKpiDay(username, pin, dateStr, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!s.ministry) return { ok: false, err: 'no_ministry' };
  await saveKpiDayInternal_(s.campus, s.dept, s.ministry, dateStr, updates, s.id);
  return getMyMinistry(username, pin);
}

async function saveKpiDayFor(username, pin, dept, ministry, dateStr, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canLogFor_(s, s.campus, dept, ministry)) return { ok: false, err: 'not_authorized' };
  await saveKpiDayInternal_(s.campus, dept, ministry, dateStr, updates, s.id);
  return getMinistryFor(username, pin, dept, ministry);
}

/* ==================== leave request ====================
   Staff request days off base and what for, and it doubles as the check-in
   with their mentor: if they have an approved mentor the request lands as
   'pending' for that mentor to acknowledge; if they don't, it's simply
   'noted' so nobody is blocked from recording their own days by not having a
   mentor.

   Three types, matching UofN Cambodia's own leave categories: Personal Time
   Off is capped at 30 work days a year (checked client-side as a heads-up,
   not enforced here — a mentor can still approve an over-cap request), while
   Working Outside Siem Reap and Special Condition are tracked but uncapped.

   Legacy rows written before this shipped only have `kind` ('work'/
   'personal') — leaveTypeOf_ maps those onto the new types so old data still
   reads sensibly instead of vanishing.

   Work days are Monday–Friday only, matching how the allowance is actually
   spent; `days` (whole calendar days, inclusive) is kept alongside for any
   older row that only has that. */
const LEAVE_TYPES = ['outside', 'special', 'personal'];
const PTO_ANNUAL_CAP = 30;
const MAX_TRIP_DAYS = 365;

/* ---- national holidays: the base is closed, so they are not work days ----
   Leave over a national holiday doesn't spend anyone's 30 days (nor count as
   working outside or special condition). Two come round on their own every
   year, the working week (Mon–Fri) each falls in: Khmer New Year (14 April)
   and Christmas (25 December). Pchum Ben follows the moon, so its dates are
   a list — HOLIDAY_DATED below until an admin edits it (Admin → Leave), then
   the 'holidays' blob. Work days are always counted from a request's dates
   with these taken out, never from the number stored when it was made, so
   changing a holiday puts every year on file right. */
const HOLIDAY_DATED = [
  { id: 'pb2024', name: 'Pchum Ben', from: '2024-10-01', to: '2024-10-03' },
  { id: 'pb2025', name: 'Pchum Ben', from: '2025-09-22', to: '2025-09-23' },
  { id: 'pb2026', name: 'Pchum Ben', from: '2026-10-12', to: '2026-10-14' }
];
const HOLIDAY_RULES = [{ id: 'kny', name: 'Khmer New Year', md: '04-14' }, { id: 'xmas', name: 'Christmas week', md: '12-25' }];
const HOLIDAY_MAX = 60;
let holidayCache_ = null;   // { dated, set } — refreshed by getTrips_ on every request that reads leave
function holidayWeek_(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));   // that week's Monday
  const mon = d.toISOString().slice(0, 10);
  d.setUTCDate(d.getUTCDate() + 4);
  return { from: mon, to: d.toISOString().slice(0, 10) };
}
function holidaysFor_(year, dated) {
  const out = HOLIDAY_RULES.map(function (r) { return Object.assign({ id: r.id + year, name: r.name, rule: true }, holidayWeek_(year + '-' + r.md)); });
  (dated || HOLIDAY_DATED).forEach(function (h) { if (String(h.from).slice(0, 4) === String(year) || String(h.to).slice(0, 4) === String(year)) out.push(Object.assign({}, h)); });
  return out.sort(function (a, b) { return a.from < b.from ? -1 : 1; });
}
function holidaySetFrom_(dated) {
  const set = {};
  const add = function (h) { for (let d = h.from; d <= h.to; d = addDays_(d, 1)) set[d] = h.name || 'Holiday'; };
  for (let y = 2020; y <= new Date().getUTCFullYear() + 3; y++) HOLIDAY_RULES.forEach(function (r) { add(Object.assign({ name: r.name }, holidayWeek_(y + '-' + r.md))); });
  (dated || HOLIDAY_DATED).forEach(add);
  return set;
}
function holidaySet_() { if (!holidayCache_) holidayCache_ = { dated: HOLIDAY_DATED, set: holidaySetFrom_(HOLIDAY_DATED) }; return holidayCache_.set; }
async function refreshHolidays_() {
  const dated = await readJSON('holidays', HOLIDAY_DATED);   // none saved yet: the defaults
  holidayCache_ = { dated: dated, set: holidaySetFrom_(dated) };
  return holidayCache_;
}
/* The holidays the leave page shows and counts with: last year to next. */
function holidayList_() {
  const y = new Date().getUTCFullYear(), dated = (holidayCache_ || { dated: HOLIDAY_DATED }).dated;
  return [y - 1, y, y + 1].reduce(function (acc, yr) { return acc.concat(holidaysFor_(yr, dated)); }, []);
}
function cleanHolidays_(list) {
  const out = [], used = {};
  (Array.isArray(list) ? list : []).slice(0, HOLIDAY_MAX).forEach(function (h) {
    h = h && typeof h === 'object' ? h : {};
    let from = isoDate_(h.from), to = isoDate_(h.to);
    const name = str_(h.name, 60);
    if (!from || !name) return;
    if (!to) to = from;
    if (to < from) { const x = from; from = to; to = x; }
    if (tripDays_(from, to) > 31) return;
    let id = String(h.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 30) || ('h' + Math.random().toString(36).slice(2, 8));
    while (used[id]) id += 'x';
    used[id] = 1;
    out.push({ id: id, name: name, from: from, to: to });
  });
  return out.sort(function (a, b) { return a.from < b.from ? -1 : 1; });
}
async function adminSaveHolidays(username, pin, list) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  await writeJSON('holidays', cleanHolidays_(list));
  await refreshHolidays_();
  return adminListTrips(username, pin);
}

async function getTrips_() { await refreshHolidays_(); return readJSON('trips', []); }

function isDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function tripDays_(from, to) {
  const a = new Date(from + 'T00:00:00Z'), b = new Date(to + 'T00:00:00Z');
  return Math.round((b - a) / 86400000) + 1;
}
function workDays_(from, to) {
  const a = new Date(from + 'T00:00:00Z'), b = new Date(to + 'T00:00:00Z'), hol = holidaySet_();
  let n = 0;
  for (let d = new Date(a); d <= b; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6 && !hol[d.toISOString().slice(0, 10)]) n++;
  }
  return n;
}
/* Work days for a request on file: from its dates, holidays out — the stored
   count only for a row too old to have dates. */
function tripWorkDays_(r) { return isDate_(r.from) && isDate_(r.to) ? workDays_(r.from, r.to) : (Number(r.workDays) || 0); }
function leaveTypeOf_(r) {
  if (LEAVE_TYPES.indexOf(r.type) > -1) return r.type;
  return r.kind === 'personal' ? 'personal' : 'outside';
}

/* Totals per calendar year, in work days, split by type. Declined requests
   never count; a request is attributed to the year it starts in so a New
   Year crossing lands in one place rather than being split. */
function awayTotals_(trips) {
  const out = {};
  trips.forEach(function (r) {
    if (r.status === 'declined') return;
    const year = String(r.from).slice(0, 4);
    if (!out[year]) out[year] = { outside: 0, special: 0, personal: 0, trips: 0 };
    out[year][leaveTypeOf_(r)] += tripWorkDays_(r);
    out[year].trips += 1;
  });
  return out;
}

function tripOut_(r) {
  return {
    id: r.id, from: r.from, to: r.to, days: r.days,
    type: leaveTypeOf_(r), workDays: tripWorkDays_(r),
    reason: r.reason || '', coverage: r.coverage || '',
    status: r.status, decidedAt: r.decidedAt || '', created: r.created || ''
  };
}

async function getMyTrips(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const mine = (await getTrips_()).filter(function (r) { return r.staffId === s.id; })
    .sort(function (a, b) { return a.from < b.from ? 1 : -1; });
  return {
    ok: true, trips: mine.map(tripOut_), totals: awayTotals_(mine), ptoCap: PTO_ANNUAL_CAP, holidays: holidayList_(),
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
  const type = LEAVE_TYPES.indexOf(t.type) > -1 ? t.type : 'personal';

  const rows = await getTrips_();
  const now = new Date().toISOString();
  const mentored = !!(s.mentorId && s.mentorStatus === 'approved');
  const rec = {
    id: 'tr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    staffId: s.id, campus: s.campus,
    from: t.from, to: t.to, days: days, type: type, workDays: workDays_(t.from, t.to),
    reason: str_(t.reason, 500) || '', coverage: str_(t.coverage, 500) || '',
    mentorId: mentored ? s.mentorId : '',
    status: mentored ? 'pending' : 'noted',
    decidedBy: '', decidedAt: '',
    created: now, updated: now
  };
  rows.push(rec);
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

/* Admin side: everyone's leave, both campuses, every year on file — each
   request with who asked, their campus and department and who their mentor
   is, plus each person's year-by-year totals. An admin may also decide a
   request that is still waiting (pending on a mentor, or 'noted' because
   the person has no mentor to ask) — the same fields a mentor's decision
   sets, so the person's own page reads it the same way. */
async function adminListTrips(username, pin) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  const staff = await getStaff_();
  const byId = {}; staff.forEach(function (x) { byId[x.id] = x; });
  const trips = (await getTrips_()).slice().sort(function (a, b) { return a.from < b.from ? 1 : -1; });
  const totals = {};
  staff.forEach(function (x) { totals[x.id] = awayTotals_(trips.filter(function (r) { return r.staffId === x.id; })); });
  return {
    ok: true, ptoCap: PTO_ANNUAL_CAP, holidays: holidayList_(), holidaysDated: (holidayCache_ || {}).dated || HOLIDAY_DATED,
    trips: trips.map(function (r) {
      const who = byId[r.staffId], mentor = r.mentorId ? byId[r.mentorId] : null;
      return Object.assign(tripOut_(r), {
        staffId: r.staffId, name: who ? who.name : '—', campus: who ? who.campus : (r.campus || ''), dept: who ? who.dept : '', ministry: who ? (who.ministry || '') : '',
        active: who ? (who.active !== false && !who.archived) : false,
        mentorName: mentor ? mentor.name : '', decidedBy: r.decidedBy ? ((byId[r.decidedBy] || {}).name || '') : ''
      });
    }),
    totals: totals
  };
}
async function adminDecideTrip(username, pin, tripId, approve) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  const rows = await getTrips_();
  const idx = rows.findIndex(function (r) { return r.id === tripId; });
  if (idx === -1) return { ok: false, err: 'not_found' };
  if (rows[idx].status !== 'pending' && rows[idx].status !== 'noted') return { ok: false, err: 'already_decided' };
  rows[idx].status = approve ? 'approved' : 'declined';
  rows[idx].decidedBy = admin.id;
  rows[idx].decidedAt = new Date().toISOString();
  rows[idx].updated = rows[idx].decidedAt;
  await writeJSON('trips', rows);
  return adminListTrips(username, pin);
}

/* ==================== 1-on-1 requests ====================
   Either side of an approved mentor/mentee relationship can ask the other
   for a 1-on-1 — a mentor asking a mentee, or a mentee asking their mentor.
   Nothing here is tied to a calendar; it's just a request-and-respond flow
   living next to the relationship itself. */
async function getOneOnOnes_() { return readJSON('oneOnOnes', []); }

async function getMyOneOnOnes(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const staff = await getStaff_();
  const list = (await getOneOnOnes_())
    .filter(function (r) { return r.fromId === s.id || r.toId === s.id; })
    .map(function (r) {
      const mine = r.fromId === s.id;
      const otherId = mine ? r.toId : r.fromId;
      const who = staff.find(function (x) { return x.id === otherId; });
      return {
        id: r.id, otherId: otherId, otherName: who ? who.name : '—', mine: mine,
        status: r.status, note: r.note || '', created: r.created, decidedAt: r.decidedAt || ''
      };
    })
    .sort(function (a, b) { return (b.created || '') < (a.created || '') ? -1 : 1; });
  return { ok: true, oneOnOnes: list };
}

async function requestOneOnOne(username, pin, otherId, note) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const staff = await getStaff_();
  const other = staff.find(function (x) { return x.id === otherId; });
  if (!other) return { ok: false, err: 'not_found' };
  const isMentee = other.mentorId === s.id && other.mentorStatus === 'approved';
  const isMentor = s.mentorId === other.id && s.mentorStatus === 'approved';
  if (!isMentee && !isMentor) return { ok: false, err: 'not_mentor_pair' };
  const rows = await getOneOnOnes_();
  const now = new Date().toISOString();
  rows.push({
    id: 'oo' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    fromId: s.id, toId: otherId, note: str_(note, 300) || '', status: 'pending',
    created: now, updated: now, decidedAt: ''
  });
  await writeJSON('oneOnOnes', rows);
  return getMyOneOnOnes(username, pin);
}

async function respondToOneOnOne(username, pin, requestId, approve) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getOneOnOnes_();
  const idx = rows.findIndex(function (r) { return r.id === requestId && r.toId === s.id && r.status === 'pending'; });
  if (idx === -1) return { ok: false, err: 'not_found' };
  rows[idx].status = approve ? 'accepted' : 'declined';
  rows[idx].decidedAt = new Date().toISOString();
  rows[idx].updated = rows[idx].decidedAt;
  await writeJSON('oneOnOnes', rows);
  return getMyOneOnOnes(username, pin);
}

/* ==================== admin broadcasts ====================
   A one-way announcement from an admin to every account — nothing to
   accept or decline, it just shows up in everyone's notification bell
   (folded into the same list as leave requests and 1-on-1s) until they
   clear it. Kept newest-first and capped so the store can't grow forever
   off of one very chatty admin. */
const MAX_BROADCASTS = 50;
async function getBroadcasts_() { return readJSON('broadcasts', []); }

async function getMyBroadcasts(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const rows = await getBroadcasts_();
  return { ok: true, broadcasts: rows };
}

async function sendBroadcast(username, pin, text) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  const clean = str_(text, 500);
  if (!clean) return { ok: false, err: 'empty' };
  const rows = await getBroadcasts_();
  rows.unshift({
    id: 'bc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: clean, from: admin.name, created: new Date().toISOString()
  });
  await writeJSON('broadcasts', rows.slice(0, MAX_BROADCASTS));
  return getMyBroadcasts(username, pin);
}

/* ==================== annual goals (SMART) ====================
   A personal, year-and-category list — not tied to any ministry KPI or to
   the base's own figures, so it lives entirely under the staff member who
   wrote it. Six fixed categories, matching the redesign: adding a seventh
   is a code change, not a per-goal choice, so the category chips can never
   drift out of sync with what a saved goal actually holds. */
const SMART_CATEGORIES = ['Faith', 'Health', 'Finance', 'Language', 'Skills', 'Fun'];
const MAX_SMART_GOALS_PER_YEAR = 30;

async function getSmartGoals_() { return readJSON('smartGoals', []); }

function smartGoalOut_(r) {
  return { id: r.id, year: r.year, category: r.category, title: r.title, meta: r.meta || '', pct: r.pct };
}

async function getMySmartGoals(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const mine = (await getSmartGoals_()).filter(function (r) { return r.staffId === s.id; });
  return { ok: true, smartGoals: mine.map(smartGoalOut_) };
}

async function saveSmartGoal(username, pin, goal) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  const g = goal || {};
  const year = finiteNum_(g.year, 2020, 2100);
  if (year == null) return { ok: false, err: 'bad_year' };
  if (SMART_CATEGORIES.indexOf(g.category) === -1) return { ok: false, err: 'bad_category' };
  const title = str_(g.title, 200);
  if (!title) return { ok: false, err: 'bad_title' };
  const pct = Math.max(0, Math.min(100, Math.round(Number(g.pct)) || 0));

  const rows = await getSmartGoals_();
  const now = new Date().toISOString();
  const existingIdx = g.id ? rows.findIndex(function (r) { return r.id === g.id && r.staffId === s.id; }) : -1;
  if (existingIdx === -1) {
    const mineThisYear = rows.filter(function (r) { return r.staffId === s.id && Number(r.year) === year; });
    if (mineThisYear.length >= MAX_SMART_GOALS_PER_YEAR) return { ok: false, err: 'too_many' };
  }
  const rec = {
    id: existingIdx > -1 ? rows[existingIdx].id : ('sg' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    staffId: s.id, year: year, category: g.category, title: title, meta: str_(g.meta, 200) || '', pct: pct,
    created: existingIdx > -1 ? rows[existingIdx].created : now, updated: now
  };
  if (existingIdx > -1) rows[existingIdx] = rec; else rows.push(rec);
  await writeJSON('smartGoals', rows);
  return getMySmartGoals(username, pin);
}

async function deleteSmartGoal(username, pin, goalId) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  let rows = await getSmartGoals_();
  rows = rows.filter(function (r) { return !(r.id === goalId && r.staffId === s.id); });
  await writeJSON('smartGoals', rows);
  return getMySmartGoals(username, pin);
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
  const p = rows.find(function (r) { return r.id === staffId && r.active && !isApplicant_(r); });
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

  /* Their type and its bars, while they share it. Season is theirs alone. */
  const shared = sharedAvatar_(p);
  return {
    ok: true,
    staff: rosterStaff_(p),
    personality: shared ? { type: p.personality.type, scores: p.personality.scores || null,
      source: p.personality.source || 'test' } : null,
    strengths: sharedStrengths_(p),
    gstrengths: sharedGStrengths_(p),
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
  const [staffRows, logs, mentees, requests, weekly, trips, tripReqs, ministry, base, smart, oneOnOnes, broadcasts, personal, teamTrips, candRows] =
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
      part(function () { return getData(''); }),
      part(function () { return getMySmartGoals(username, pin); }),
      part(function () { return getMyOneOnOnes(username, pin); }),
      part(function () { return getMyBroadcasts(username, pin); }),
      part(function () { return getMyPersonal(username, pin); }),
      // Outreach Teams staff open on their teams page — bring the teams along
      part(function () { return (s.dept === TEAM_DEPT && s.ministry === TEAM_MIN) ? getTeamTrips(username, pin, s.campus) : null; }),
      part(function () { return canHR_(s) ? getCandidates_() : null; })
    ]);

  return {
    ok: true,
    staff: Object.assign(publicStaff_(s), { isAdmin: !!s.isAdmin, hr: !!s.hr, portalStaff: !!s.portalStaff, portalAdmin: !!s.portalAdmin, portal: canPortal_(s), hospitality: canHosp_(s) }),
    profile: {
      phone: s.phone, joined: s.joined, debt: s.debt, mentorStatus: s.mentorStatus || '',
      dashboardColor: s.dashboardColor || '', dashboardBg: s.dashboardBg || '', email: s.email || '',
      sex: cleanSex_(s.sex), personality: ownPersonality_(s), strengths: ownStrengths_(s),
      gstrengths: ownGStrengths_(s)
    },
    roster: (staffRows || []).filter(function (r) { return r.active && !isApplicant_(r); }).map(rosterStaff_),
    logs: (logs && logs.logs) || [],
    habits: (logs && logs.habits) || null,
    mentees: (mentees && mentees.mentees) || [],
    mentorRequests: (requests && requests.requests) || [],
    goals: (weekly && weekly.goals) || [],
    checkins: (weekly && weekly.checkins) || [],
    trips: trips || null,
    tripRequests: (tripReqs && tripReqs.requests) || [],
    ministry: ministry || null,
    smartGoals: (smart && smart.smartGoals) || [],
    oneOnOnes: (oneOnOnes && oneOnOnes.oneOnOnes) || [],
    broadcasts: (broadcasts && broadcasts.broadcasts) || [],
    personal: personal || null,
    teamTrips: teamTrips || null,
    // for the HR menu item's badge: contracts run out or running out within 90 days
    hrDue: canHR_(s) ? hrDueCount_(staffRows) : null,
    // whose numbers are due, and (for a department overseer) which ministries are in
    numbers: await part(function () { return numbersStatus_(s, staffRows || []); }),
    hrFollowUps: canHR_(s) ? candFollowUpsCount_(candRows || []) : null,
    // the roster is already top-level above; no need to ship it twice in one response
    base: base ? Object.assign({}, base, { roster: undefined }) : null
  };
}

/* ==================== org structure snapshots ====================
   The Team tab's Structure view is live from profiles. Each quarter an
   admin saves a snapshot of it — who was in which department and ministry,
   who led what — so the base can look back quarter by quarter as people
   move. A snapshot is built HERE from the staff list, never taken from the
   client, and it carries names, so it still renders after someone leaves.
   One row per campus / year / quarter in the 'structure' blob; saving the
   same quarter again replaces it. Reading a quarter nobody saved answers
   with the latest earlier snapshot, marked 'copied', or nothing. */
const STRUCT_MAX = 400;
function currentQuarter_() { return Math.floor(new Date().getUTCMonth() / 3) + 1; }
async function getStructures_() { return readJSON('structure', []); }
function structOrder_(d) { return Number(d.year) * 10 + Number(d.quarter); }
function structFind_(rows, campus, year, quarter) {
  const exact = rows.find(function (r) { return r.campus === campus && Number(r.year) === year && Number(r.quarter) === quarter; });
  if (exact) return { doc: exact, source: 'saved' };
  const earlier = rows.filter(function (r) { return r.campus === campus && structOrder_(r) < year * 10 + quarter; })
    .sort(function (a, b) { return structOrder_(b) - structOrder_(a); })[0];
  if (earlier) return { doc: earlier, source: 'copied' };
  return { doc: null, source: 'none' };
}
/* Staff who are students for a quarter (a school: DTS, DBS, BCS, SMS) —
   e.g. staff doing the BCS in Q4. Kept per campus / year / quarter in
   'structurePlans', separate from anyone's profile, so it is true for that
   quarter only. The chart moves them out of their ministry into a Students
   box, and a saved snapshot carries it. */
const STRUCT_SCHOOLS = ['dts', 'dbs', 'bcs', 'sms'];
async function getPlans_() { return readJSON('structurePlans', []); }
/* A plan also holds the quarter's arrangement: where each person sits on the
   chart (`place: {staffId: {dept, ministry}}`), separate from their profile —
   the chart is the base's structure, the profile is what the person says.
   A quarter with no plan of its own starts from the latest earlier
   arrangement (students never carry over; they are per quarter). */
function planFor_(plans, campus, y, q) {
  const p = plans.find(function (r) { return r.campus === campus && Number(r.year) === y && Number(r.quarter) === q; });
  if (p) return { students: p.students || {}, place: p.place || {}, inherited: false };
  const earlier = plans.filter(function (r) { return r.campus === campus && r.place && Object.keys(r.place).length && (Number(r.year) * 10 + Number(r.quarter)) < y * 10 + q; })
    .sort(function (a, b) { return (Number(b.year) * 10 + Number(b.quarter)) - (Number(a.year) * 10 + Number(a.quarter)); })[0];
  return { students: {}, place: (earlier && earlier.place) || {}, inherited: !!earlier, from: earlier ? { year: Number(earlier.year), quarter: Number(earlier.quarter) } : null };
}
function cleanPlace_(place, here) {
  const out = {};
  Object.keys(place && typeof place === 'object' ? place : {}).forEach(function (id) {
    const v = place[id];
    if (!here[id] || !v || typeof v !== 'object') return;
    const dept = str_(v.dept, 80), ministry = str_(v.ministry, 80);
    if (dept) out[id] = { dept: normDept_(dept), ministry: ministry || '' };
  });
  return out;
}
/* Applicant accounts (the portal) are never on the staff chart — including
   in snapshots saved before that rule. */
function structPeopleOnly_(doc, rows) {
  if (!doc || !Array.isArray(doc.people)) return doc;
  const applicants = {}; (rows || []).forEach(function (r) { if (isApplicant_(r)) applicants[r.id] = 1; });
  return Object.assign({}, doc, { people: doc.people.filter(function (p) { return p && !applicants[p.id]; }) });
}
async function getStructure(username, pin, campus, year, quarter) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  campus = str_(campus, 40) || s.campus;
  const y = finiteNum_(year, 2020, 2100) || currentYear_();
  const q = finiteNum_(quarter, 1, 4) || currentQuarter_();
  const found = structFind_(await getStructures_(), campus, y, q);
  return { ok: true, campus: campus, year: y, quarter: q, doc: structPeopleOnly_(found.doc, await getStaff_()), source: found.source, plan: planFor_(await getPlans_(), campus, y, q) };
}
async function saveStructurePlan(username, pin, campus, year, quarter, students, place) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  campus = str_(campus, 40) || admin.campus;
  const y = finiteNum_(year, 2020, 2100), q = finiteNum_(quarter, 1, 4);
  if (y == null || q == null) return { ok: false, err: 'bad_quarter' };
  const staff = await getStaff_();
  const here = {}; staff.forEach(function (r) { if (r.active && !r.archived && !isApplicant_(r) && r.campus === campus) here[r.id] = 1; });
  const clean = {};
  Object.keys(students && typeof students === 'object' ? students : {}).forEach(function (id) {
    const school = String(students[id] || '').toLowerCase();
    if (here[id] && STRUCT_SCHOOLS.indexOf(school) > -1) clean[id] = school;
  });
  const plans = await getPlans_();
  const idx = plans.findIndex(function (r) { return r.campus === campus && Number(r.year) === y && Number(r.quarter) === q; });
  const before = planFor_(plans, campus, y, q);
  // leaving one out keeps what the quarter had (an inherited arrangement becomes its own)
  const placeClean = place === undefined || place === null ? before.place : cleanPlace_(place, here);
  const studentsClean = students === undefined || students === null ? before.students : clean;
  const rec = { campus: campus, year: y, quarter: q, students: studentsClean, place: placeClean, savedAt: new Date().toISOString(), savedBy: admin.id };
  if (idx > -1) plans[idx] = rec; else plans.push(rec);
  await writeJSON('structurePlans', plans);
  // a snapshot already saved for that quarter follows
  const rows = await getStructures_();
  const snap = rows.find(function (r) { return r.campus === campus && Number(r.year) === y && Number(r.quarter) === q; });
  if (snap) {
    const byId = {}; staff.forEach(function (r) { byId[r.id] = r; });
    snap.people = snap.people.map(function (p) {
      const o = Object.assign({}, p), r = byId[p.id];
      if (studentsClean[p.id]) o.student = studentsClean[p.id]; else delete o.student;
      if (placeClean[p.id]) { o.dept = placeClean[p.id].dept; o.ministry = placeClean[p.id].ministry; }
      else if (r) { o.dept = r.dept; o.ministry = r.ministry || ''; }
      return o;
    });
    await writeJSON('structure', rows);
  }
  return { ok: true, campus: campus, year: y, quarter: q, plan: { students: studentsClean, place: placeClean, inherited: false }, doc: snap ? structPeopleOnly_(snap, staff) : null };
}
async function saveStructure(username, pin, campus, year, quarter) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  campus = str_(campus, 40) || admin.campus;
  const y = finiteNum_(year, 2020, 2100), q = finiteNum_(quarter, 1, 4);
  if (y == null || q == null) return { ok: false, err: 'bad_quarter' };
  const plan = planFor_(await getPlans_(), campus, y, q);
  const people = (await getStaff_()).filter(function (r) { return r.active && !r.archived && !isApplicant_(r) && r.campus === campus; })
    .map(function (r) { const pl = plan.place[r.id]; const o = { id: r.id, name: r.name, dept: pl ? pl.dept : r.dept, ministry: pl ? pl.ministry : (r.ministry || ''), role: r.role || '', leads: leadsOf_(r), photo: '' }; if (plan.students[r.id]) o.student = plan.students[r.id]; return o; })
    .slice(0, STRUCT_MAX);
  const rec = { campus: campus, year: y, quarter: q, people: people, savedAt: new Date().toISOString(), savedBy: admin.id };
  const rows = await getStructures_();
  const idx = rows.findIndex(function (r) { return r.campus === campus && Number(r.year) === y && Number(r.quarter) === q; });
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('structure', rows);
  return { ok: true, campus: campus, year: y, quarter: q, doc: rec, source: 'saved' };
}

/* ==================== outreach teams ====================
   Outreach Teams is the one ministry that doesn't log week by week: a team
   comes for a stretch of weeks and its numbers are gathered once, when it
   leaves. So instead of weekly entries it keeps one record per team — who
   came, when, how many, and every Outreach Teams metric as a total for the
   visit — in the 'teamTrips' blob, laid over TEAM_SEED (the records imported
   from the old Lovable hub). Editing a seeded team writes a full row under
   its id; deleting one writes a tombstone; the seed file itself is never
   rewritten.

   Everything else in the app still reads Outreach Teams as weekly rows, so
   the trips are turned into them on the way out (teamEntryRows_): a team
   counts in the week it LEAVES — 'Teams Hosted' +1 and each metric's total
   — and a derived row replaces any hand-logged row for the same campus,
   metric, year and week (withTeamRows_), so nothing is counted twice. The
   Base dashboard, the GP roll-up and the ministry's own payload all get
   these without knowing where they came from. */
const TEAM_DEPT = 'Community Service', TEAM_MIN = 'Outreach Teams';
const TEAM_COUNTS = ['size', 'males', 'females', 'couples', 'families'];
async function getTeamTripsRaw_() { return readJSON('teamTrips', []); }
async function getTeamTrips_() {
  const byId = {};
  TEAM_SEED.forEach(function (t) { byId[t.id] = t; });
  (await getTeamTripsRaw_()).forEach(function (t) { if (t && t.id) byId[t.id] = t; });
  return Object.keys(byId).map(function (k) { return byId[k]; }).filter(function (t) { return !t.deleted; });
}
function isoDate_(v) { const s = str_(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; }
function cleanTrip_(t, campus) {
  const name = str_(t.name, 120);
  let from = isoDate_(t.from), to = isoDate_(t.to);
  if (!name) return null;
  /* A team that applied on the portal goes in at any stage, dates or not
     (candidateId); one added by hand still needs both, the right way round. */
  if (!t.candidateId && (!from || !to || to < from)) return null;
  if (from && to && to < from) { const x = from; from = to; to = x; }
  const rec = {
    id: str_(t.id, 60) || ('tt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
    campus: campus, name: name, org: str_(t.org, 120), country: cleanCountry_(t.country) || str_(t.country, 60), from: from, to: to,
    staff: str_(t.staff, 120), focus: str_(t.focus, 200), status: t.status === 'cancelled' ? 'cancelled' : 'active',
    notes: str_(t.notes, 1000), metrics: {}, reached: { male: null, female: null }
  };
  TEAM_COUNTS.forEach(function (k) { const n = finiteNum_(t[k], 0, 100000); rec[k] = n == null ? null : Math.round(n); });
  const m = (t.metrics && typeof t.metrics === 'object') ? t.metrics : {};
  Object.keys(m).forEach(function (k) {
    const key = str_(k, 80);
    if (!key || key === 'Teams Hosted' || SENSITIVE.indexOf(key) > -1) return;
    const n = finiteNum_(m[k], -1e9, 1e9);
    if (n != null) rec.metrics[key] = n;
  });
  const r = (t.reached && typeof t.reached === 'object') ? t.reached : {};
  rec.reached = { male: finiteNum_(r.male, 0, 1e9), female: finiteNum_(r.female, 0, 1e9) };
  return rec;
}
/* Volunteers Mobilized for a team is the team itself — everyone who came —
   so it is no longer typed in: for a team that leaves on or after
   TEAM_AUTO_FROM the figure is its head count (size), whatever was entered.
   Earlier teams keep the number logged for them, and one with none logged
   counts its head count too. */
const TEAM_AUTO_FROM = '2026-10-01';
const TEAM_AUTO_METRIC = 'Volunteers Mobilized';
function tripMetrics_(t) {
  const m = Object.assign({}, (t && t.metrics) || {});
  if (t && t.to && t.to >= TEAM_AUTO_FROM) {
    if (t.size != null && t.size !== '' && !isNaN(Number(t.size))) m[TEAM_AUTO_METRIC] = Number(t.size);
    else delete m[TEAM_AUTO_METRIC];
  } else if (t && (m[TEAM_AUTO_METRIC] == null || m[TEAM_AUTO_METRIC] === '') && t.size != null && t.size !== '' && !isNaN(Number(t.size))) m[TEAM_AUTO_METRIC] = Number(t.size);
  return m;
}
function teamEntryRows_(trips) {
  const acc = {};
  trips.forEach(function (t) {
    if (!t || t.status === 'cancelled' || !isoDate_(t.to)) return;
    const yr = Number(t.to.slice(0, 4)), wk = isoWeek_(t.to);
    const add = function (metric, v) {
      const k = t.campus + '|' + yr + '|' + wk + '|' + metric;
      if (!acc[k]) acc[k] = { campus: t.campus, dept: TEAM_DEPT, ministry: TEAM_MIN, metric: metric, week: wk, year: yr, value: 0, derived: true };
      acc[k].value += Number(v) || 0;
    };
    add('Teams Hosted', 1);
    const tm = tripMetrics_(t);
    Object.keys(tm).forEach(function (m) { add(m, tm[m]); });
  });
  return Object.keys(acc).map(function (k) { return acc[k]; });
}
/* ==================== a team application → the Teams Database ====================
   Every team application — at any stage, submitted or not, dates or not —
   IS a team in the Teams Database (the
   'teamTrips' blob, linked by candidateId), so Outreach Teams sees it the
   day it comes in. Its name, where it is from, its Siem Reap dates and head
   counts follow the application (syncTeamTrip_ on submit, on every answer
   change, and on close / reopen); its numbers — the Outreach Teams metrics —
   the team enters on the portal (portalSaveTeamNumbers) and staff can edit
   in the Teams Database as ever. Deleting it there keeps it deleted. */
function teamAnswers_(c) { return (c && c.portal && ((c.portal.form && c.portal.form.answers) || c.portal.draft)) || {}; }
function tripFromApp_(c, prev) {
  const a = teamAnswers_(c);
  const it = Array.isArray(a.itinerary) ? a.itinerary : [];
  let base = it.filter(function (r) { return r && r.base; })[0] || it[0] || {};
  if (!isoDate_(base.from) || !isoDate_(base.to)) {
    // an application from before the trip question: take its earliest and latest dates
    const dates = Object.keys(a).map(function (k) { return isoDate_(a[k]); }).filter(Boolean).sort();
    if (dates.length >= 2) base = { from: dates[0], to: dates[dates.length - 1] };
  }
  const cut = function (v, n) { return v == null ? '' : String(v).trim().slice(0, n); };
  // the application's answer when it has one, else what is already there (staff may have filled it in)
  const pick = function (v, was) { return v === undefined || v === null || v === '' ? (was === undefined ? null : was) : v; };
  const merged = Object.assign({ metrics: {}, reached: {} }, prev || {}, {
    id: prev ? prev.id : 'ta_' + c.id, candidateId: c.id,
    name: cut(a.teamName, 120) || c.name, org: cut(a.teamName, 120) || (prev && prev.org) || '',
    country: cut(a.location, 60) || (prev && prev.country) || c.country || '',
    from: isoDate_(base.from) || (prev && prev.from) || '', to: isoDate_(base.to) || (prev && prev.to) || '',
    size: pick(a.size, prev && prev.size), males: pick(a.males, prev && prev.males), females: pick(a.females, prev && prev.females),
    couples: pick(a.couples, prev && prev.couples),
    focus: cut(a.focus, 200) || (prev && prev.focus) || '',
    status: c.archived ? 'cancelled' : (prev && prev.status) || 'active'
  });
  const rec = cleanTrip_(merged, c.campus || PORTAL_DEFAULT_CAMPUS);
  if (!rec) return null;
  rec.candidateId = c.id;
  return rec;
}
/* A team goes in the day its application exists — even one staff added in
   the CRM, or a draft with no dates yet (it waits off the calendar until it
   has them). Nothing is written when nothing changed, which keeps the draft
   autosave from rewriting the blob on every keystroke. */
async function syncTeamTrip_(c, by, status) {
  if (!c || c.type !== 'team') return null;
  const rows = await getTeamTripsRaw_();
  const idx = rows.findIndex(function (r) { return r && r.candidateId === c.id; });
  if (idx > -1 && rows[idx].deleted) return null;
  const prev = idx > -1 ? rows[idx] : null;
  const rec = tripFromApp_(c, prev);
  if (!rec) return null;   // no Siem Reap dates yet
  if (status) rec.status = status;
  const same = function (a, b) { const k = function (x) { const o = Object.assign({}, x); delete o.updated; delete o.updatedBy; return JSON.stringify(o); }; return k(a) === k(b); };
  if (prev && same(prev, rec)) return prev;
  rec.updated = new Date().toISOString(); rec.updatedBy = by;
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('teamTrips', rows);
  return rec;
}
async function linkedTrip_(c) {
  if (!c || c.type !== 'team') return null;
  return (await getTeamTripsRaw_()).find(function (r) { return r && r.candidateId === c.id && !r.deleted; }) || null;
}
function teamTripOut_(t) { return t ? { id: t.id, from: t.from, to: t.to, metrics: t.metrics || {}, reached: t.reached || {} } : null; }
/* Writes a team's numbers onto its linked team (made first if it is missing). */
async function saveTeamNumbers_(c, metrics, reached, by) {
  let trip = await linkedTrip_(c);
  if (!trip) trip = await syncTeamTrip_(c, by);
  if (!trip) return null;
  const rec = cleanTrip_(Object.assign({}, trip, { metrics: metrics && typeof metrics === 'object' ? metrics : {}, reached: reached && typeof reached === 'object' ? reached : {} }), trip.campus);
  if (!rec) return null;
  rec.candidateId = c.id; rec.updated = new Date().toISOString(); rec.updatedBy = by;
  const rows = await getTeamTripsRaw_();
  const idx = rows.findIndex(function (r) { return r && r.id === rec.id; });
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('teamTrips', rows);
  return rec;
}
/* The team's own numbers, from the portal: the same metrics the Teams
   Database form asks for, and men / women reached — once staff have ticked
   Arrived (the card is hidden before that, so it doesn't confuse them). */
async function portalSaveTeamNumbers(username, pin, metrics, reached) {
  const a = await applicantCand_(username, pin); if (a.out) return a.out;
  if (a.cand.type !== 'team') return { ok: false, err: 'not_team' };
  if (a.cand.stage !== 'arrived') return { ok: false, err: 'not_arrived' };
  if (!(await saveTeamNumbers_(a.cand, metrics, reached, a.s.id))) return { ok: false, err: 'no_trip' };
  return portalBoot(username, pin);
}
/* Staff put a team into the Teams Database from its record — the same sync,
   answered with why when it can't (no Siem Reap dates yet, or deleted there). */
async function portalStaffSyncTeam(username, pin, candidateId) {
  const a = await portalStaffCand_(username, pin, candidateId); if (a.out) return a.out;
  if (a.cand.type !== 'team') return { ok: false, err: 'not_team' };
  const linked = (await getTeamTripsRaw_()).find(function (r) { return r && r.candidateId === a.cand.id; });
  if (linked && linked.deleted) return { ok: false, err: 'deleted' };
  const rec = await syncTeamTrip_(a.cand, a.s.id);
  if (!rec) return { ok: false, err: 'no_dates' };
  const staffRows = await getStaff_(); const byId = {}; staffRows.forEach(function (r) { byId[r.id] = r; });
  const out = portalCandOut_(a.cand, byId); out.teamTrip = teamTripOut_(rec);
  return { ok: true, candidate: out };
}
/* The same numbers from the staff side of the portal, for a team in scope. */
async function portalStaffSaveTeamNumbers(username, pin, candidateId, metrics, reached) {
  const a = await portalStaffCand_(username, pin, candidateId); if (a.out) return a.out;
  if (a.cand.type !== 'team') return { ok: false, err: 'not_team' };
  const rec = await saveTeamNumbers_(a.cand, metrics, reached, a.s.id);
  if (!rec) return { ok: false, err: 'no_trip' };
  const staffRows = await getStaff_(); const byId = {}; staffRows.forEach(function (r) { byId[r.id] = r; });
  const out = portalCandOut_(a.cand, byId); out.teamTrip = teamTripOut_(rec);
  return { ok: true, candidate: out };
}
/* A team that applied on the portal is PENDING until its flights are
   confirmed — the itinerary uploaded, "flights confirmed" ticked, or the
   team past the documents stage. It shows in the Teams Database (and its
   calendar) from the day it applies, but its numbers only count on the
   dashboards once it is no longer pending. */
function teamFlightsIn_(c) {
  return hasDoc_(c, 'flights') || !!((c.portal && c.portal.visa) || {}).flightsConfirmed || portalStageIdx_(c.stage, 'team') >= portalStageIdx_('call2', 'team');
}
async function pendingTeamIds_() {
  const out = {};
  (await getCandidates_()).forEach(function (c) { if (c && c.type === 'team' && !c.archived && !teamFlightsIn_(c)) out[c.id] = c.stage; });
  return out;
}
async function withTeamRows_(rows) {
  const pend = await pendingTeamIds_();
  const derived = teamEntryRows_((await getTeamTrips_()).filter(function (t) { return !(t.candidateId && pend[t.candidateId]); }));
  if (!derived.length) return rows;
  const keyOf = function (r) { return r.campus + '|' + yearOf_(r) + '|' + Number(r.week) + '|' + r.metric; };
  const dk = {};
  derived.forEach(function (r) { dk[keyOf(r)] = 1; });
  return rows.filter(function (r) { return !(r.dept === TEAM_DEPT && r.ministry === TEAM_MIN && dk[keyOf(r)]); }).concat(derived);
}
/* Team applications from before the Teams Database link existed — or whose
   sync was missed — get their team the next time the Teams Database is read.
   Every open application with Siem Reap dates (submitted or still a draft)
   and no linked row at all: a team
   deleted there keeps its tombstone (with its candidateId), so it is not
   brought back. */
async function backfillTeamTrips_() {
  const cands = (await getCandidates_()).filter(function (c) { return c && c.type === 'team' && !c.archived; });
  if (!cands.length) return 0;
  const rows = await getTeamTripsRaw_();
  const have = {};
  rows.forEach(function (r) { if (r && r.candidateId) have[r.candidateId] = 1; });
  const now = new Date().toISOString();
  let added = 0;
  cands.forEach(function (c) {
    if (have[c.id]) return;
    const rec = tripFromApp_(c, null);
    if (!rec) return;   // no dates to put it on yet
    rec.updated = now; rec.updatedBy = 'portal';
    rows.push(rec); added++;
  });
  if (added) await writeJSON('teamTrips', rows);
  return added;
}
async function getTeamTrips(username, pin, campus) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  campus = str_(campus, 40) || s.campus;
  await backfillTeamTrips_();
  const pend = await pendingTeamIds_();
  const trips = (await getTeamTrips_()).filter(function (t) { return t.campus === campus; })
    .map(function (t) { return t.candidateId && pend[t.candidateId] ? Object.assign({}, t, { pending: true, portalStage: pend[t.candidateId] }) : t; })
    .sort(function (a, b) { return a.from < b.from ? 1 : a.from > b.from ? -1 : 0; });
  return { ok: true, campus: campus, trips: trips, canEdit: canLogFor_(s, campus, TEAM_DEPT, TEAM_MIN) };
}
async function saveTeamTrip(username, pin, trip) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!trip || typeof trip !== 'object') return { ok: false, err: 'bad_trip' };
  const campus = str_(trip.campus, 40) || s.campus;
  if (!canLogFor_(s, campus, TEAM_DEPT, TEAM_MIN)) return { ok: false, err: 'not_authorized' };
  const rec = cleanTrip_(trip, campus);
  if (!rec) return { ok: false, err: 'bad_trip' };
  rec.updated = new Date().toISOString(); rec.updatedBy = s.id;
  const rows = await getTeamTripsRaw_();
  const idx = rows.findIndex(function (r) { return r && r.id === rec.id; });
  if (idx > -1 && rows[idx].candidateId) rec.candidateId = rows[idx].candidateId;   // still the portal application's team
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('teamTrips', rows);
  return getTeamTrips(username, pin, campus);
}
async function deleteTeamTrip(username, pin, id) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  id = str_(id, 60);
  const cur = (await getTeamTrips_()).find(function (t) { return t.id === id; });
  if (!cur) return { ok: false, err: 'not_found' };
  if (!canLogFor_(s, cur.campus, TEAM_DEPT, TEAM_MIN)) return { ok: false, err: 'not_authorized' };
  const rows = await getTeamTripsRaw_();
  const idx = rows.findIndex(function (r) { return r && r.id === id; });
  const tomb = { id: id, campus: cur.campus, deleted: true, updated: new Date().toISOString(), updatedBy: s.id };
  if (cur.candidateId) tomb.candidateId = cur.candidateId;   // so the application does not bring it back
  if (idx > -1) rows[idx] = tomb; else rows.push(tomb);
  await writeJSON('teamTrips', rows);
  return getTeamTrips(username, pin, cur.campus);
}

/* ==================== SR Hospitality ====================
   The hospitality team's booking book: the base's buildings, rooms and beds,
   and who sleeps in them when — guests, speakers, teams, students,
   volunteers, staff. One blob per campus ('hosp:<campus>') holds all of it:
     buildings [{id, name}]
     rooms     [{id, buildingId, name, style, notes, beds:[{id, label, out}]}]
     bookings  [{id, category, name, from, to, males, females, count, family,
                 bedIds, notes, tripId, permanent}]
   A booking holds `count` beds from `from` (first night) to `to` (the
   morning they leave — that night is free again); a staff booking can be
   permanent (no `to`). It may name its beds (bedIds) or just hold the
   number until they are picked; a named bed can't be in two bookings on the
   same night, and a bed marked `out` (maintenance) takes nobody.

   Teams are not typed in twice: every team in the Teams Database with dates
   is a REQUEST here (getHospitality's `requests`) — the team, its dates and
   head counts, pending or not — until a booking is made for it (tripId).

   Who may open it: the Hospitality ministry (Skills Training) — its members,
   its leaders, the Skills Training overseer — and admins. Nobody else sees a
   name in it. */
const HOSP_DEPT = 'Skills Training', HOSP_MIN = 'Hospitality';
const HOSP_CATS = ['guest', 'speaker', 'team', 'student', 'volunteer', 'staff'];
const HOSP_STYLES = ['male', 'female', 'mixed', 'couple', 'family', 'guest', 'staff'];
const HOSP_MAX = { buildings: 50, rooms: 500, beds: 60, bookings: 5000 };
function canHosp_(s) {
  if (!s || isApplicant_(s) || s.active === false) return false;
  if (s.isAdmin) return true;
  return memberOf_(s, HOSP_DEPT, HOSP_MIN) || isLeaderOf_(s, HOSP_DEPT, HOSP_MIN) ||
    (deptOf_(s) === 'Campus Leadership' && s.ministry === HOSP_DEPT);
}
function hospKey_(campus) { return 'hosp:' + campus; }
/* The rooms and beds SR Hospitality starts from, taken from the base's own
   rooms sheet — layout only, no names (this repo is public; who sleeps where
   comes in through the app, by uploading the sheet or by hand). It is what a
   campus reads until its book is first saved; from then on the saved book is
   all there is. */
function hospSeedRooms_(buildingId, list) {
  return list.map(function (r) {
    return { id: 'hr_' + buildingId.replace(/^hb_/, '') + '_' + r[0].replace(/\s+/g, '').toLowerCase(), buildingId: buildingId, name: r[0], style: r[1], notes: r[3] || '',
      beds: 'ABCDEFGH'.slice(0, r[2]).split('').map(function (l) { return { id: 'bd_' + buildingId.replace(/^hb_/, '') + '_' + r[0].replace(/\s+/g, '').toLowerCase() + '_' + l, label: l, out: false }; }) };
  });
}
const HOSP_SEED = {
  siemreap: {
    buildings: [{ id: 'hb_old', name: 'Old Base' }, { id: 'hb_peace', name: 'Peace House' }],
    rooms: hospSeedRooms_('hb_old', [
      ['101', 'family', 2, 'First floor · Family room'],
      ['102', 'male', 6, 'First floor · Students'],
      ['103', 'male', 6, 'First floor · Students'],
      ['104', 'female', 8, 'First floor · Students'],
      ['201', 'family', 4, 'Family room'],
      ['202', 'family', 2, 'Family room'],
      ['203', 'male', 6, 'Second floor · Staff'],
      ['204', 'male', 6, 'Second floor · Staff'],
      ['205', 'female', 6, 'Second floor'],
      ['301', 'family', 4, 'Family room'],
      ['302', 'couple', 2, 'Couple room'],
      ['303', 'female', 6, 'Third floor'],
      ['304', 'female', 8, 'Third floor'],
      ['305', 'male', 8, 'Third floor'],
      ['401', 'guest', 1, 'Training speaker / teacher'],
      ['402', 'couple', 2, 'Couple room']
    ]).concat(hospSeedRooms_('hb_peace', [
      ['Unit 1', 'family', 2, 'Floor 0'],
      ['Unit 2', 'family', 3, 'Floor 1'],
      ['Unit 3', 'family', 3, 'Floor 1'],
      ['Unit 4', 'family', 2, 'Floor 2'],
      ['Unit 5', 'family', 2, 'Floor 2'],
      ['Unit 6', 'family', 3, 'Floor 3'],
      ['Unit 7', 'family', 3, 'Floor 3']
    ])),
    bookings: []
  }
};
async function getHosp_(campus) {
  const stored = await readJSON(hospKey_(campus), null);
  const d = stored && typeof stored === 'object' ? stored : (HOSP_SEED[campus] ? JSON.parse(JSON.stringify(HOSP_SEED[campus])) : {});
  return {
    buildings: Array.isArray(d.buildings) ? d.buildings : [],
    rooms: Array.isArray(d.rooms) ? d.rooms : [],
    bookings: Array.isArray(d.bookings) ? d.bookings : []
  };
}
function hospId_(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function hospCount_(v) { const n = finiteNum_(v, 0, 10000); return n == null ? 0 : Math.round(n); }
/* Two stays share a night when one starts before the other ends; a
   permanent one never ends. */
function hospOverlap_(a, b) {
  const aEnd = a.permanent ? '9999-12-31' : a.to, bEnd = b.permanent ? '9999-12-31' : b.to;
  return a.from < bEnd && b.from < aEnd;
}
function cleanHospBuilding_(b) {
  const name = str_(b && b.name, 80);
  if (!name) return null;
  return { id: str_(b.id, 60) || hospId_('hb'), name: name };
}
function cleanHospRoom_(r, d) {
  const name = str_(r && r.name, 60);
  const buildingId = str_(r && r.buildingId, 60);
  if (!name || !buildingId || !d.buildings.some(function (b) { return b.id === buildingId; })) return null;
  const seen = {};
  const beds = (Array.isArray(r.beds) ? r.beds : []).slice(0, HOSP_MAX.beds).map(function (b) {
    const label = str_(b && b.label, 20);
    if (!label) return null;
    let id = str_(b.id, 60) || hospId_('bd');
    if (seen[id]) id = hospId_('bd');
    seen[id] = 1;
    return { id: id, label: label, out: !!b.out };
  }).filter(Boolean);
  return {
    id: str_(r.id, 60) || hospId_('hr'), buildingId: buildingId, name: name,
    style: HOSP_STYLES.indexOf(r.style) > -1 ? r.style : 'mixed', notes: str_(r.notes, 300) || '', beds: beds
  };
}
function cleanHospBooking_(k) {
  const name = str_(k && k.name, 120);
  const category = HOSP_CATS.indexOf(k && k.category) > -1 ? k.category : null;
  const from = isoDate_(k && k.from);
  // staying until someone changes it: staff, and students and volunteers who live here
  const permanent = !!(k && k.permanent) && ['staff', 'student', 'volunteer'].indexOf(category) > -1;
  const to = permanent ? '' : isoDate_(k && k.to);
  if (!name || !category || !from || (!permanent && (!to || to <= from))) return null;
  const males = hospCount_(k.males), females = hospCount_(k.females);
  const bedIds = [];
  (Array.isArray(k.bedIds) ? k.bedIds : []).forEach(function (b) { const id = str_(b, 60); if (id && bedIds.indexOf(id) === -1) bedIds.push(id); });
  const count = Math.max(hospCount_(k.count), males + females, bedIds.length, 1);
  return {
    id: str_(k.id, 60) || hospId_('hk'), category: category, name: name, from: from, to: to, permanent: permanent,
    males: males, females: females, count: count, family: !!k.family, bedIds: bedIds.slice(0, count),
    notes: str_(k.notes, 1000) || '', tripId: str_(k.tripId, 60) || ''
  };
}
/* Every team in the Teams Database with dates that hasn't left yet is a bed
   request until a booking points at it. */
async function hospRequests_(campus, bookings) {
  const today = new Date().toISOString().slice(0, 10);
  const pend = await pendingTeamIds_();
  const booked = {};
  bookings.forEach(function (k) { if (k.tripId) booked[k.tripId] = k.id; });
  return (await getTeamTrips_()).filter(function (t) {
    return t.campus === campus && t.status !== 'cancelled' && t.from && t.to && t.to >= today;
  }).map(function (t) {
    return {
      tripId: t.id, name: t.name, country: t.country || '', from: t.from, to: t.to,
      size: t.size == null ? null : t.size, males: t.males == null ? null : t.males, females: t.females == null ? null : t.females,
      couples: t.couples == null ? null : t.couples,
      pending: !!(t.candidateId && pend[t.candidateId]), portalStage: (t.candidateId && pend[t.candidateId]) || '',
      candidateId: t.candidateId || '', bookingId: booked[t.id] || ''
    };
  }).sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
}
async function hospAuth_(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { out: { ok: false } };
  if (!canHosp_(s)) return { out: { ok: false, err: 'not_authorized' } };
  return { s: s };
}
async function getHospitality(username, pin) {
  const a = await hospAuth_(username, pin); if (a.out) return a.out;
  const campus = a.s.campus;
  await backfillTeamTrips_();
  const d = await getHosp_(campus);
  return { ok: true, campus: campus, buildings: d.buildings, rooms: d.rooms, bookings: d.bookings, requests: await hospRequests_(campus, d.bookings) };
}
/* One save for all three kinds — a building, a room (with its beds), a
   booking — so the page has one call to make and one answer to read. */
async function hospSave(username, pin, kind, rec) {
  const a = await hospAuth_(username, pin); if (a.out) return a.out;
  if (!rec || typeof rec !== 'object') return { ok: false, err: 'bad_record' };
  const campus = a.s.campus;
  const d = await getHosp_(campus);
  const list = kind === 'building' ? d.buildings : kind === 'room' ? d.rooms : kind === 'booking' ? d.bookings : null;
  if (!list) return { ok: false, err: 'bad_kind' };
  const clean = kind === 'building' ? cleanHospBuilding_(rec) : kind === 'room' ? cleanHospRoom_(rec, d) : cleanHospBooking_(rec);
  if (!clean) return { ok: false, err: 'bad_record' };
  const idx = list.findIndex(function (x) { return x.id === clean.id; });
  if (idx === -1 && list.length >= HOSP_MAX[kind + 's']) return { ok: false, err: 'too_many' };
  if (kind === 'booking') {
    const beds = {};
    d.rooms.forEach(function (r) { r.beds.forEach(function (b) { beds[b.id] = b; }); });
    if (clean.bedIds.some(function (id) { return !beds[id]; })) return { ok: false, err: 'no_such_bed' };
    if (clean.bedIds.some(function (id) { return beds[id].out; })) return { ok: false, err: 'bed_out' };
    const clash = d.bookings.find(function (o) {
      return o.id !== clean.id && hospOverlap_(o, clean) && (o.bedIds || []).some(function (id) { return clean.bedIds.indexOf(id) > -1; });
    });
    if (clash) return { ok: false, err: 'bed_taken', with: clash.name };
    if (clean.tripId && d.bookings.some(function (o) { return o.id !== clean.id && o.tripId === clean.tripId; })) return { ok: false, err: 'already_booked' };
  }
  clean.updated = new Date().toISOString(); clean.updatedBy = a.s.id;
  if (idx > -1) list[idx] = clean; else list.push(clean);
  if (kind === 'room') {
    // a bed taken out of the room comes out of every booking that held it
    const ids = {};
    d.rooms.forEach(function (r) { r.beds.forEach(function (b) { ids[b.id] = 1; }); });
    d.bookings.forEach(function (k) { k.bedIds = (k.bedIds || []).filter(function (id) { return ids[id]; }); });
  }
  await writeJSON(hospKey_(campus), d);
  const out = await getHospitality(username, pin);
  out.saved = clean;
  return out;
}
/* The bed board's one move, done in one write so a swap can't half-happen:
   booking `bookingId` gives up `fromBed` (or '' — a person not in a bed yet)
   and takes `toBed` (or '' — just take them off the bed). If someone else
   holds `toBed` on a night they share, the two swap beds — as long as that
   leaves nobody in a bed a third booking already has. A move is for the
   whole stay, not one night. */
async function hospMoveBed(username, pin, bookingId, fromBed, toBed) {
  const a = await hospAuth_(username, pin); if (a.out) return a.out;
  bookingId = str_(bookingId, 60); fromBed = str_(fromBed, 60) || ''; toBed = str_(toBed, 60) || '';
  const campus = a.s.campus;
  const d = await getHosp_(campus);
  const A = d.bookings.find(function (k) { return k.id === bookingId; });
  if (!A) return { ok: false, err: 'not_found' };
  A.bedIds = A.bedIds || [];
  if (fromBed && A.bedIds.indexOf(fromBed) === -1) return { ok: false, err: 'not_in_bed' };
  if (!fromBed && !toBed) return { ok: false, err: 'bad_move' };
  const beds = {};
  d.rooms.forEach(function (r) { r.beds.forEach(function (b) { beds[b.id] = b; }); });
  const now = new Date().toISOString();
  if (toBed) {
    if (!beds[toBed]) return { ok: false, err: 'no_such_bed' };
    if (beds[toBed].out) return { ok: false, err: 'bed_out' };
    if (toBed === fromBed || A.bedIds.indexOf(toBed) > -1) return { ok: false, err: 'same_bed' };
    if (!fromBed && A.bedIds.length >= A.count) return { ok: false, err: 'all_placed' };
    const holders = d.bookings.filter(function (o) { return o.id !== A.id && hospOverlap_(o, A) && (o.bedIds || []).indexOf(toBed) > -1; });
    if (holders.length > 1 || (holders.length && !fromBed)) return { ok: false, err: 'bed_taken', with: holders[0].name };
    if (holders.length) {
      const B = holders[0];
      // B moves into A's old bed: nobody else (but A) may hold it on B's nights
      const third = d.bookings.find(function (o) { return o.id !== A.id && o.id !== B.id && hospOverlap_(o, B) && (o.bedIds || []).indexOf(fromBed) > -1; });
      if (third) return { ok: false, err: 'bed_taken', with: third.name };
      if (B.bedIds.indexOf(fromBed) > -1) return { ok: false, err: 'same_bed' };
      B.bedIds = B.bedIds.map(function (id) { return id === toBed ? fromBed : id; });
      B.updated = now; B.updatedBy = a.s.id;
    }
  }
  A.bedIds = fromBed ? A.bedIds.map(function (id) { return id === fromBed ? toBed : id; }).filter(Boolean) : A.bedIds.concat([toBed]);
  A.updated = now; A.updatedBy = a.s.id;
  await writeJSON(hospKey_(campus), d);
  return getHospitality(username, pin);
}
/* Bringing a whole house in at once — the rooms, beds and who sleeps where —
   from a spreadsheet, so moving off the old sheet is one upload, not an
   afternoon of tapping. The page reads the CSV and sends its rows:
     { building, room, style, bed, name, category }
   Buildings, rooms and beds are made when they are not there yet (matched by
   name, so importing twice adds nothing twice) and a name puts that person
   in that bed from today, staying until someone changes it (permanent —
   residents have no leaving date). In a family or couple room the rows with
   one name are one booking over all its beds; anywhere else each row is its
   own person (two people can share a first name). A bed someone already has
   is left alone and reported. Hospitality ministry and admins only, like the
   rest of SR Hospitality. */
const HOSP_IMPORT_MAX = 2000;
const HOSP_STAY_CATS = ['staff', 'student', 'volunteer'];
async function hospImport(username, pin, rows) {
  const a = await hospAuth_(username, pin); if (a.out) return a.out;
  if (!Array.isArray(rows) || !rows.length) return { ok: false, err: 'empty' };
  if (rows.length > HOSP_IMPORT_MAX) return { ok: false, err: 'too_many' };
  const campus = a.s.campus, d = await getHosp_(campus);
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const key = function (v) { return String(v || '').trim().toLowerCase().replace(/\s+/g, ' '); };
  const out = { buildings: 0, rooms: 0, beds: 0, people: 0, skipped: [] };
  const groups = {}, order = [];
  rows.forEach(function (r) {
    r = r && typeof r === 'object' ? r : {};
    const bName = str_(r.building, 80), rName = str_(r.room, 60), label = str_(r.bed, 20);
    if (!bName || !rName) return;
    let b = d.buildings.find(function (x) { return key(x.name) === key(bName); });
    if (!b) {
      if (d.buildings.length >= HOSP_MAX.buildings) return;
      b = { id: hospId_('hb'), name: bName, updated: now, updatedBy: a.s.id }; d.buildings.push(b); out.buildings++;
    }
    let room = d.rooms.find(function (x) { return x.buildingId === b.id && key(x.name) === key(rName); });
    if (!room) {
      if (d.rooms.length >= HOSP_MAX.rooms) return;
      room = { id: hospId_('hr'), buildingId: b.id, name: rName, style: HOSP_STYLES.indexOf(key(r.style)) > -1 ? key(r.style) : 'mixed', notes: str_(r.notes, 300) || '', beds: [], updated: now, updatedBy: a.s.id };
      d.rooms.push(room); out.rooms++;
    }
    if (!label) return;
    let bed = room.beds.find(function (x) { return key(x.label) === key(label); });
    if (!bed) {
      if (room.beds.length >= HOSP_MAX.beds) return;
      bed = { id: hospId_('bd'), label: label, out: false }; room.beds.push(bed); out.beds++;
    }
    const name = str_(r.name, 120);
    if (!name) return;
    const cat = HOSP_STAY_CATS.indexOf(key(r.category)) > -1 ? key(r.category) : 'staff';
    const together = room.style === 'family' || room.style === 'couple';
    const g = together ? room.id + '|' + key(name) : room.id + '|' + bed.id;
    if (!groups[g]) { groups[g] = { name: name, category: cat, family: together, bedIds: [], room: room }; order.push(g); }
    if (groups[g].bedIds.indexOf(bed.id) === -1) groups[g].bedIds.push(bed.id);
  });
  order.forEach(function (g) {
    const p = groups[g];
    const holder = d.bookings.find(function (k) { return hospOverlap_(k, { from: today, to: '', permanent: true }) && (k.bedIds || []).some(function (id) { return p.bedIds.indexOf(id) > -1; }); });
    if (holder) { out.skipped.push({ name: p.name, room: p.room.name, with: holder.name }); return; }
    if (d.bookings.length >= HOSP_MAX.bookings) { out.skipped.push({ name: p.name, room: p.room.name, with: '' }); return; }
    d.bookings.push({ id: hospId_('hk'), category: p.category, name: p.name, from: today, to: '', permanent: true,
      males: 0, females: 0, count: p.bedIds.length, family: p.family && p.bedIds.length > 1, bedIds: p.bedIds, notes: '', tripId: '', updated: now, updatedBy: a.s.id });
    out.people++;
  });
  await writeJSON(hospKey_(campus), d);
  const res = await getHospitality(username, pin);
  res.imported = out;
  return res;
}
async function hospDelete(username, pin, kind, id) {
  const a = await hospAuth_(username, pin); if (a.out) return a.out;
  id = str_(id, 60);
  const campus = a.s.campus;
  const d = await getHosp_(campus);
  const list = kind === 'building' ? d.buildings : kind === 'room' ? d.rooms : kind === 'booking' ? d.bookings : null;
  if (!list) return { ok: false, err: 'bad_kind' };
  const idx = list.findIndex(function (x) { return x.id === id; });
  if (idx === -1) return { ok: false, err: 'not_found' };
  if (kind === 'building' && d.rooms.some(function (r) { return r.buildingId === id; })) return { ok: false, err: 'not_empty' };
  if (kind === 'room') {
    const gone = {};
    list[idx].beds.forEach(function (b) { gone[b.id] = 1; });
    const today = new Date().toISOString().slice(0, 10);
    if (d.bookings.some(function (k) { return (k.permanent || k.to > today) && (k.bedIds || []).some(function (b) { return gone[b]; }); })) return { ok: false, err: 'in_use' };
    d.bookings.forEach(function (k) { k.bedIds = (k.bedIds || []).filter(function (b) { return !gone[b]; }); });
  }
  list.splice(idx, 1);
  await writeJSON(hospKey_(campus), d);
  return getHospitality(username, pin);
}

/* ==================== weekly schedules ====================
   Two schedules the base sends out every Sunday for the week ahead: the
   Culinary team's cooking schedule (meals and dishes, day by day — a GRID of
   rows × days) and Hospitality's morning chores (places, what to do there and
   who — a LIST in sections). The ministry that owns one makes it each week on
   its My Ministry page (canLogFor_, so its members, leaders, overseer and
   admins); once published, everyone on the campus sees it on My Home, and a
   team that has arrived sees it in the portal.

   One blob per campus, 'duty:<campus>' = { kitchen: { weeks: { 'YYYY-MM-DD'
   (the Sunday it starts): sched }, extras: [names typed in by hand] },
   chores: {…} }. A week holds its own copy of the rows, so changing next
   week's rows never rewrites an old one; a week not made yet starts as a
   copy of the latest one before it, names and all (most duties carry over),
   else from the template below — rows only, no names: this repo is public.

   Names are plain strings, picked from the people here that week
   (dutyPeople_): campus staff first, other staff, every member of a team
   whose dates cover the week (from its portal application), guests booked in
   SR Hospitality, and names typed in before. */
const DUTY_KINDS = {
  kitchen: { dept: 'Skills Training', ministry: 'Culinary', layout: 'grid' },
  chores: { dept: 'Skills Training', ministry: 'Hospitality', layout: 'list' }
};
const DUTY_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DUTY_MAX = { rows: 40, sections: 8, listRows: 60, names: 24, name: 40, weeks: 60, extras: 300 };
const DUTY_TEMPLATES = {
  kitchen: {
    title: 'Cooking schedule', km: 'កាលវិភាគធ្វើម្ហូបប្រចាំសប្តាហ៍', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
    rows: [
      { id: 'bf', label: 'Breakfast 7:30', km: 'អាហារ-ព្រឹក', time: 'Cooking 6:00', off: ['sun'] },
      { id: 'md', label: 'Morning chore – Dishes', km: 'លាងចាន-ព្រឹក', time: '', off: ['sun'] },
      { id: 'lu', label: 'Lunch 12:30', km: 'អាហារ-ត្រង់', time: 'Cooking 11:00', off: ['sun'] },
      { id: 'pr', label: 'Pray – Announcements', km: 'អធិស្ឋាន-សេចក្ដីប្រកាស', time: '', off: ['sun'], span: true },
      { id: 'ld', label: 'Lunch dishes · Sweep-mop', km: 'លាងចាន-ថ្ងៃត្រង់', time: '', off: ['sun'] },
      { id: 'di', label: 'Dinner 6:30', km: 'អាហារ-ល្ងាច', time: 'Cooking 5:00' },
      { id: 'dd', label: 'Dinner dishes · Sweep-mop', km: 'លាងចាន-ល្ងាច', time: '' }
    ]
  },
  chores: {
    title: 'Morning chores (8–8:30 AM)', km: 'ការងារពេលព្រឹក (ម៉ោង ៨-៨:៣០)',
    sections: [
      { id: 'base', title: 'Base', km: 'មូលដ្ឋាន', rows: [
        { id: 'c01', place: 'Trash bags (weekend)', duty: 'Change all the trash bags around the base and sweep around the building. Saturday and Sunday.' },
        { id: 'c02', place: 'Plants (weekend)', duty: 'Water the plants around the base. Saturday and Sunday.' },
        { id: 'c03', place: 'Morning dishes', duty: 'Put away dishes, wash dishes, clean the sink, wipe all surfaces.' },
        { id: 'c04', place: 'Stairs 1–4', duty: 'Sweep and mop stairs 1–4.' },
        { id: 'c05', place: 'Office room', duty: 'Sweep and mop inside and outside the room.' },
        { id: 'c06', place: 'Media room', duty: 'Sweep and mop inside and outside the room.' },
        { id: 'c07', place: 'Bathroom on the rooftop', duty: 'Clean the toilet, sink, floor, wall and mirror, and change the trash bags.' },
        { id: 'c08', place: 'Bathroom in the coffee shop and near the kitchen', duty: 'Clean the toilet, sink, floor, wall and mirror, and change the trash bags.' },
        { id: 'c09', place: 'Classroom 2 · Worship room', duty: 'Sweep and mop. Set out tables and chairs.' },
        { id: 'c10', place: 'Rooftop', duty: 'Sweep and mop the rooftop.' },
        { id: 'c11', place: 'Kitchen towels', duty: 'Change all the kitchen towels, put out the mopping liquid and clean the buckets.' },
        { id: 'c12', place: 'Open the doors 102, 103, 104, 203, 204, 205, 303, 304, 305', duty: 'Open the doors to every room for 15 minutes.' },
        { id: 'c13', place: 'Bean bags · green stage', duty: 'Wipe all the bean bags and vacuum the green stage.' },
        { id: 'c14', place: 'Stair railings', duty: 'Wipe the stair railings in hallways 1, 2, 3 and the Media room.' },
        { id: 'c15', place: 'Hallway 3', duty: 'Sweep and mop.' },
        { id: 'c16', place: 'Hallway 2', duty: 'Sweep and mop.' },
        { id: 'c17', place: 'Hallway 1', duty: 'Sweep and mop.' },
        { id: 'c18', place: 'Courtyard and parking area', duty: 'Sweep and clean the road in front of the base, the eating area and the coffee shop.' },
        { id: 'c19', place: 'Trash bags', duty: 'Change all the trash bags around the base and sweep around the building.' },
        { id: 'c20', place: 'Glass doors, inside and outside', duty: 'Mon: classroom 2 · Tue: classroom 3, rooftop · Wed: meeting room, Media and office · Thu: classroom 2 · Fri: classroom 3, rooftop' },
        { id: 'c21', place: 'Air conditioners', duty: 'Mon: rooms 203, 204, 401 · Tue: rooms 205, 303, Media · Wed: 304, 305, office · Thu: coffee shop, worship room, classroom 1 · Fri: rooms 101–104 and the DTS classroom' },
        { id: 'c22', place: 'Plants', duty: 'Water the plants around the base.' },
        { id: 'c23', place: 'Tables outside', duty: 'Clean all tables and chairs, and put them in order.' },
        { id: 'c24', place: 'Classroom 3 (rooftop) · tables', duty: 'Wipe all tables and chairs, and change the trash bags.' },
        { id: 'c25', place: 'Classroom 3 (rooftop) · rooms', duty: 'Sweep and mop inside and outside the classroom and around rooms 401 and 402.' },
        { id: 'c26', place: 'Classroom 1 (downstairs)', duty: 'Sweep and mop the stairs and vacuum. Mon, Wed, Fri: clean the glass door · Tue, Thu: clean the sofa and table.' },
        { id: 'c27', place: 'Coffee shop', duty: 'Sweep and mop. Clean all the tables in the coffee shop.' },
        { id: 'c28', place: 'Coffee shop glass door', duty: 'Clean the glass door inside and outside.' }
      ] },
      { id: 'house', title: 'Family house', km: 'អាគារគ្រួសារ', rows: [
        { id: 'h1', place: 'Courtyard and parking area', duty: 'Sweep under the house, change the trash bags and take the trash out. Sweep and clean the road in front.' },
        { id: 'h2', place: 'Stairs 1–4', duty: 'Sweep and mop the stairs.' },
        { id: 'h3', place: 'Plants', duty: 'Water the plants around the house.' },
        { id: 'h4', place: 'Stair railings', duty: 'Wipe the stair railings in hallways 1, 2, 3.' },
        { id: 'h5', place: 'Bathroom downstairs', duty: 'Clean the toilet, sink, floor, wall and mirror, and change the trash.' }
      ] }
    ]
  }
};
function dutyKey_(campus) { return 'duty:' + campus; }
function isSunday_(w) { return !!isoDate_(w) && new Date(w + 'T00:00:00Z').getUTCDay() === 0; }
function addDays_(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
/* The Sunday the current week started on, in Cambodia (UTC+7). */
function dutyThisWeek_() {
  const d = new Date(Date.now() + 7 * 3600000); d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}
async function getDutyDoc_(campus) {
  const d = await readJSON(dutyKey_(campus), {});
  Object.keys(DUTY_KINDS).forEach(function (k) {
    if (!d[k] || typeof d[k] !== 'object') d[k] = {};
    if (!d[k].weeks || typeof d[k].weeks !== 'object') d[k].weeks = {};
    if (!Array.isArray(d[k].extras)) d[k].extras = [];
  });
  return d;
}
function dutyNames_(v) {
  const out = [];
  (Array.isArray(v) ? v : []).forEach(function (n) {
    const s = String(n == null ? '' : n).replace(/\s+/g, ' ').trim().slice(0, DUTY_MAX.name);
    if (s && out.indexOf(s) === -1 && out.length < DUTY_MAX.names) out.push(s);
  });
  return out;
}
function dutyText_(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }
function dutyId_(v, used, p) {
  let id = String(v == null ? '' : v).replace(/[^a-z0-9_-]/gi, '').slice(0, 20);
  if (!id || used[id]) { let i = 1; do { id = p + (i++); } while (used[id]); }
  used[id] = 1;
  return id;
}
/* A week as the page sent it, kept to the shape of its kind. */
function cleanSched_(raw, kind) {
  const k = DUTY_KINDS[kind];
  raw = raw && typeof raw === 'object' ? raw : {};
  const out = { layout: k.layout, title: dutyText_(raw.title, 120) || DUTY_TEMPLATES[kind].title, km: dutyText_(raw.km, 120), notes: dutyText_(raw.notes, 1000) };
  if (k.layout === 'grid') {
    let days = (Array.isArray(raw.days) ? raw.days : []).filter(function (d, i, a) { return DUTY_DAYS.indexOf(d) > -1 && a.indexOf(d) === i; });
    if (!days.length) days = DUTY_TEMPLATES.kitchen.days.slice();
    days.sort(function (a, b) { return DUTY_DAYS.indexOf(a) - DUTY_DAYS.indexOf(b); });
    out.days = days;
    const used = {};
    out.rows = (Array.isArray(raw.rows) ? raw.rows : []).slice(0, DUTY_MAX.rows).map(function (r) {
      r = r && typeof r === 'object' ? r : {};
      const label = dutyText_(r.label, 80);
      if (!label) return null;
      return { id: dutyId_(r.id, used, 'r'), label: label, km: dutyText_(r.km, 80), time: dutyText_(r.time, 60), span: !!r.span,
        off: (Array.isArray(r.off) ? r.off : []).filter(function (d) { return days.indexOf(d) > -1; }) };
    }).filter(Boolean);
    const cells = {}, src = raw.cells && typeof raw.cells === 'object' ? raw.cells : {};
    out.rows.forEach(function (r) {
      (r.span ? ['all'] : days).forEach(function (d) {
        if (d !== 'all' && r.off.indexOf(d) > -1) return;
        const names = dutyNames_(src[r.id + '|' + d]);
        if (names.length) cells[r.id + '|' + d] = names;
      });
    });
    out.cells = cells;
  } else {
    const usedS = {}, usedR = {};
    out.sections = (Array.isArray(raw.sections) ? raw.sections : []).slice(0, DUTY_MAX.sections).map(function (s) {
      s = s && typeof s === 'object' ? s : {};
      return { id: dutyId_(s.id, usedS, 's'), title: dutyText_(s.title, 80), km: dutyText_(s.km, 80),
        rows: (Array.isArray(s.rows) ? s.rows : []).slice(0, DUTY_MAX.listRows).map(function (r) {
          r = r && typeof r === 'object' ? r : {};
          const place = dutyText_(r.place, 120);
          if (!place) return null;
          return { id: dutyId_(r.id, usedR, 'c'), place: place, km: dutyText_(r.km, 120), duty: dutyText_(r.duty, 400), people: dutyNames_(r.people) };
        }).filter(Boolean) };
    });
  }
  return out;
}
function dutyAllNames_(sch) {
  const out = [];
  const add = function (l) { (l || []).forEach(function (n) { if (out.indexOf(n) === -1) out.push(n); }); };
  if (sch.layout === 'grid') Object.keys(sch.cells || {}).forEach(function (k) { add(sch.cells[k]); });
  else (sch.sections || []).forEach(function (s) { s.rows.forEach(function (r) { add(r.people); }); });
  return out;
}
/* A first name is what the sheet uses; two campus staff with the same one get an initial. */
function dutyShortNames_(people) {
  const first = function (n) { return String(n || '').trim().split(/\s+/)[0] || ''; };
  const count = {};
  people.forEach(function (p) { const f = first(p.name).toLowerCase(); count[f] = (count[f] || 0) + 1; });
  return people.map(function (p) {
    const parts = String(p.name || '').trim().split(/\s+/), f = parts[0] || '';
    return count[f.toLowerCase()] > 1 && parts.length > 1 ? f + ' ' + parts[parts.length - 1][0] + '.' : f;
  });
}
/* The days of the week starting `week` (Sun … Sat) each staff member is
   away on leave — any request not declined, whatever its type: on a break or
   off campus, they can't cook or clean here. */
const DUTY_DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dutyAway_(trips, week) {
  const days = []; for (let i = 0; i < 7; i++) days.push(addDays_(week, i));
  const out = {};
  trips.forEach(function (r) {
    if (!r || r.status === 'declined' || !isDate_(r.from) || !isDate_(r.to)) return;
    days.forEach(function (d, i) { if (r.from <= d && d <= r.to) { out[r.staffId] = out[r.staffId] || {}; out[r.staffId][i] = 1; } });
  });
  return out;
}
/* Who can be put on the week starting `week`: grouped, each group a label
   and names; `away` notes the days someone on leave for part of the week is
   gone. Staff away the whole working week (Mon–Fri) are left out. */
async function dutyPeople_(campus, week, extras) {
  const weekEnd = addDays_(week, 7), groups = [], away = {};
  const gone = dutyAway_(await getTrips_(), week);
  const staff = (await getStaff_()).filter(function (s) { return s && s.active !== false && !isApplicant_(s) && s.campus === campus && !s.archived; })
    .sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  const shorts = dutyShortNames_(staff);
  const campusNames = [], otherNames = [];
  staff.forEach(function (s, i) {
    if (!shorts[i]) return;
    const g = gone[s.id];
    if (g && [1, 2, 3, 4, 5].every(function (d) { return g[d]; })) return;   // away all week
    if (g) away[shorts[i]] = Object.keys(g).sort().map(function (d) { return DUTY_DAY_SHORT[d]; }).join(', ');
    (cleanStaffType_(s.staffType) === 'campus' ? campusNames : otherNames).push(shorts[i]);
  });
  if (campusNames.length) groups.push({ id: 'campus', label: 'Campus staff', names: campusNames });
  if (otherNames.length) groups.push({ id: 'staff', label: 'Other staff', names: otherNames });
  // teams whose dates cover any of the week, with everyone their leader listed on the portal
  const cands = await getCandidates_(), byCand = {};
  cands.forEach(function (c) { if (c && c.id) byCand[c.id] = c; });
  (await getTeamTrips_()).filter(function (t) { return t.campus === campus && t.status !== 'cancelled' && t.from && t.to && t.from < weekEnd && t.to >= week; })
    .forEach(function (t) {
      const c = t.candidateId && byCand[t.candidateId];
      if (!c) return;
      const a = teamAnswers_(c), names = [];
      const add = function (n) { n = dutyText_(n, DUTY_MAX.name); if (n && names.indexOf(n) === -1) names.push(n); };
      add(a.leaderName || c.name);
      (Array.isArray(a.coLeaders) ? a.coLeaders : []).forEach(function (p) { add(p && p.name); });
      ((c.portal && c.portal.members) || []).forEach(function (p) { add(p && p.name); });
      if (names.length) groups.push({ id: 'team_' + t.id, label: t.name, names: names });
    });
  // guests, speakers, volunteers… booked into SR Hospitality that week (teams come in above)
  const guests = [];
  (await getHosp_(campus)).bookings.forEach(function (k) {
    if (k.category === 'team' || !(k.from < weekEnd && (k.permanent || k.to > week))) return;
    const n = dutyText_(k.name, DUTY_MAX.name);
    if (n && guests.indexOf(n) === -1) guests.push(n);
  });
  if (guests.length) groups.push({ id: 'guests', label: 'Staying with us', names: guests });
  const seen = {};
  groups.forEach(function (g) { g.names.forEach(function (n) { seen[n] = 1; }); });
  const more = (extras || []).filter(function (n) { return !seen[n]; });
  if (more.length) groups.push({ id: 'extras', label: 'Added before', names: more });
  if (Object.keys(away).length) groups.away = away;
  return groups;
}
function dutyTemplate_(kind) {
  const t = JSON.parse(JSON.stringify(DUTY_TEMPLATES[kind]));
  t.layout = DUTY_KINDS[kind].layout;
  if (t.layout === 'grid') t.cells = {}; else t.sections.forEach(function (s) { s.rows.forEach(function (r) { r.people = []; }); });
  return cleanSched_(t, kind);
}
function dutyOut_(rec, week, kind) { return rec ? Object.assign({}, rec, { kind: kind, week: week }) : null; }
async function dutyAuth_(username, pin, kind, week) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { out: { ok: false } };
  if (!DUTY_KINDS[kind]) return { out: { ok: false, err: 'bad_kind' } };
  if (!isSunday_(week)) return { out: { ok: false, err: 'bad_week' } };
  const k = DUTY_KINDS[kind];
  return { s: s, campus: s.campus, canEdit: canLogFor_(s, s.campus, k.dept, k.ministry) };
}
/* One kind for one week. The ministry that makes it gets its draft (or a new
   week started from the last one) and the names to pick from; anyone else
   only a published week. */
async function getDuty(username, pin, kind, week) {
  const a = await dutyAuth_(username, pin, kind, week); if (a.out) return a.out;
  const d = await getDutyDoc_(a.campus), box = d[kind];
  const rec = box.weeks[week] || null;
  if (!a.canEdit) return { ok: true, kind: kind, week: week, canEdit: false, sched: rec && rec.published ? dutyOut_(rec, week, kind) : null };
  let sched = rec, isNew = false, from = '';
  if (!sched) {
    isNew = true;
    const before = Object.keys(box.weeks).filter(function (w) { return w < week; }).sort().pop();
    if (before) { sched = cleanSched_(box.weeks[before], kind); from = before; } else sched = dutyTemplate_(kind);
    sched.published = false;
  }
  const people = await dutyPeople_(a.campus, week, box.extras);
  return { ok: true, kind: kind, week: week, canEdit: true, isNew: isNew, from: from, sched: dutyOut_(sched, week, kind),
    people: people, away: people.away || {} };
}
/* action: 'save' keeps it as it is (a draft stays a draft, a published week
   stays published), 'publish' shows it to everyone, 'unpublish' takes it down. */
async function saveDuty(username, pin, kind, week, sched, action) {
  const a = await dutyAuth_(username, pin, kind, week); if (a.out) return a.out;
  if (!a.canEdit) return { ok: false, err: 'not_authorized' };
  const d = await getDutyDoc_(a.campus), box = d[kind], prev = box.weeks[week];
  const rec = cleanSched_(sched, kind);
  const now = new Date().toISOString();
  rec.published = action === 'publish' ? true : action === 'unpublish' ? false : !!(prev && prev.published);
  rec.publishedAt = rec.published ? ((prev && prev.published && prev.publishedAt) || now) : null;
  rec.updated = now; rec.updatedBy = a.s.id;
  box.weeks[week] = rec;
  Object.keys(box.weeks).sort().reverse().slice(DUTY_MAX.weeks).forEach(function (w) { delete box.weeks[w]; });
  // names typed in by hand are offered again next time
  const known = {};
  (await dutyPeople_(a.campus, week, [])).forEach(function (g) { g.names.forEach(function (n) { known[n] = 1; }); });
  dutyAllNames_(rec).forEach(function (n) { if (!known[n] && box.extras.indexOf(n) === -1) box.extras.unshift(n); });
  box.extras = box.extras.slice(0, DUTY_MAX.extras);
  await writeJSON(dutyKey_(a.campus), d);
  return getDuty(username, pin, kind, week);
}
/* This week's published schedules (and next week's, once it is out), for My Home. */
async function dutyPublished_(campus, week) {
  const d = await getDutyDoc_(campus), out = {};
  Object.keys(DUTY_KINDS).forEach(function (k) { const r = d[k].weeks[week]; out[k] = r && r.published ? dutyOut_(r, week, k) : null; });
  return out;
}
async function getMySchedules(username, pin, week) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  week = isSunday_(week) ? week : dutyThisWeek_();
  const next = addDays_(week, 7);
  const canEdit = {};
  Object.keys(DUTY_KINDS).forEach(function (k) { canEdit[k] = canLogFor_(s, s.campus, DUTY_KINDS[k].dept, DUTY_KINDS[k].ministry); });
  return { ok: true, week: week, now: await dutyPublished_(s.campus, week), next: await dutyPublished_(s.campus, next), nextWeek: next, canEdit: canEdit };
}
/* A team's own list of who is coming — names (and men / women), as many as
   it has — so the kitchen and hospitality can put them on the schedules
   while they are here. The leader keeps it up to date from the portal. */
const MEMBERS_MAX = 120;
function cleanMembers_(v) {
  const out = [];
  (Array.isArray(v) ? v : []).slice(0, MEMBERS_MAX).forEach(function (p) {
    p = p && typeof p === 'object' ? p : { name: p };
    const name = dutyText_(p.name, 80).replace(/\s+/g, ' ');
    if (!name) return;
    out.push({ name: name, sex: p.sex === 'm' || p.sex === 'f' ? p.sex : '' });
  });
  return out;
}
async function portalSaveTeamMembers(username, pin, members) {
  const a = await applicantCand_(username, pin); if (a.out) return a.out;
  if (a.cand.type !== 'team') return { ok: false, err: 'not_team' };
  a.cand.portal = a.cand.portal || {};
  a.cand.portal.members = cleanMembers_(members);
  a.cand.updated = new Date().toISOString(); a.cand.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  return portalBoot(username, pin);
}

/* ==================== the leadership meeting board ====================
   Campus Leadership meets every Monday. Its board ('leadBoard:<campus>') is
   all theirs to shape:
     cols      the columns, in order — {id, title, done}; one of them counts
               as finished (moving a card there stamps doneAt). Starts as
               Agenda / In progress / Done.
     areas     the focus areas projects belong to — for Siem Reap this
               quarter and toward 2027: Siem Reap finances, Siem Reap
               ministries, Construction.
     standing  the agenda items every Monday has — Department and ministry
               updates, Events coming up.
     cards     agenda items and projects: title, type, column, focus area,
               owner, due date, notes, and optionally the Leadership OKR
               (objective id) it moves forward. Each can hold a short list of
               tasks — {id, text, done, owner, due, meeting} — changed one at a
               time (saveLeadTask / deleteLeadTask) so two people ticking
               tasks off in the same meeting don't undo each other.
     notes     the meeting notes, one per Monday — {date, text, updated,
               updatedBy}. A line in them can become a card or a task; those
               carry the meeting's date (meeting) so they trace back to it.
   Campus Leadership on the campus and admins read and change it; nobody
   else sees it. */
const LEAD_TYPES = ['agenda', 'project'];
const LEAD_MAX = { cards: 600, cols: 8, areas: 12, standing: 12, tasks: 40, notes: 260, noteText: 8000 };
const LEAD_DEFAULT = {
  cols: [{ id: 'agenda', title: 'Agenda', done: false }, { id: 'doing', title: 'In progress', done: false }, { id: 'done', title: 'Done', done: true }],
  areas: [{ id: 'finances', title: 'Siem Reap finances' }, { id: 'ministries', title: 'Siem Reap ministries' }, { id: 'construction', title: 'Construction' }],
  standing: [{ id: 'updates', title: 'Department and ministry updates' }, { id: 'events', title: 'Events coming up' }]
};
function canLead_(s) { return !!(s && !isApplicant_(s) && s.active !== false && (s.isAdmin || deptOf_(s) === 'Campus Leadership')); }
function leadKey_(campus) { return 'leadBoard:' + campus; }
async function leadAuth_(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { out: { ok: false } };
  if (!canLead_(s)) return { out: { ok: false, err: 'not_authorized' } };
  return { s: s, campus: s.campus };
}
async function getLeadDoc_(campus) {
  const d = await readJSON(leadKey_(campus), {});
  return {
    cols: Array.isArray(d.cols) && d.cols.length ? d.cols : JSON.parse(JSON.stringify(LEAD_DEFAULT.cols)),
    areas: Array.isArray(d.areas) ? d.areas : JSON.parse(JSON.stringify(LEAD_DEFAULT.areas)),
    standing: Array.isArray(d.standing) ? d.standing : JSON.parse(JSON.stringify(LEAD_DEFAULT.standing)),
    cards: Array.isArray(d.cards) ? d.cards : [],
    notes: Array.isArray(d.notes) ? d.notes : []
  };
}
function leadOut_(campus, d, extra) { return Object.assign({ ok: true, campus: campus, cols: d.cols, areas: d.areas, standing: d.standing, cards: d.cards, notes: d.notes }, extra || {}); }
async function getLeadBoard(username, pin) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  return leadOut_(a.campus, await getLeadDoc_(a.campus));
}
function cleanLeadTask_(t, prev) {
  const text = dutyText_(t && t.text, 200);
  if (!text) return null;
  return Object.assign({}, prev || {}, {
    id: (prev && prev.id) || ('lt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    text: text, done: !!t.done, owner: str_(t.owner, 60) || '', due: isoDate_(t.due) || '',
    meeting: isoDate_(t.meeting) || (prev && prev.meeting) || ''
  });
}
function cleanLeadCard_(c, prev, d) {
  const title = str_(c && c.title, 160);
  if (!title) return null;
  const colIds = d.cols.map(function (x) { return x.id; }), areaIds = d.areas.map(function (x) { return x.id; });
  return Object.assign({}, prev || {}, {
    id: (prev && prev.id) || str_(c.id, 60) || ('lc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
    title: title, notes: dutyText_(c.notes, 2000),
    type: LEAD_TYPES.indexOf(c.type) > -1 ? c.type : 'agenda',
    col: colIds.indexOf(c.col) > -1 ? c.col : colIds[0],
    area: areaIds.indexOf(c.area) > -1 ? c.area : '',
    owner: str_(c.owner, 60) || '', due: isoDate_(c.due) || '',
    okrId: str_(c.okrId, 60) || '', meeting: isoDate_(c.meeting) || '',
    fromNotes: !!(c.fromNotes || (prev && prev.fromNotes))
  });
}
/* Add or change a card (including moving it to another column). */
async function saveLeadCard(username, pin, card) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  const d = await getLeadDoc_(a.campus), cards = d.cards;
  const idx = cards.findIndex(function (c) { return c.id === str_(card && card.id, 60); });
  const rec = cleanLeadCard_(card, idx > -1 ? cards[idx] : null, d);
  if (!rec) return { ok: false, err: 'bad_card' };
  if (idx === -1 && cards.length >= LEAD_MAX.cards) return { ok: false, err: 'too_many' };
  const now = new Date().toISOString();
  const doneCol = function (id) { return d.cols.some(function (x) { return x.id === id && x.done; }); };
  if (idx === -1) {
    rec.created = now; rec.createdBy = a.s.id;
    rec.tasks = (Array.isArray(card.tasks) ? card.tasks : []).slice(0, LEAD_MAX.tasks).map(function (t) { return cleanLeadTask_(t, null); }).filter(Boolean);
  }
  if (doneCol(rec.col) && !(idx > -1 && doneCol(cards[idx].col))) rec.doneAt = now;
  if (!doneCol(rec.col)) delete rec.doneAt;
  rec.updated = now; rec.updatedBy = a.s.id;
  if (idx > -1) cards[idx] = rec; else cards.push(rec);
  await writeJSON(leadKey_(a.campus), d);
  return leadOut_(a.campus, d, { saved: rec });
}
async function deleteLeadCard(username, pin, id) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  const d = await getLeadDoc_(a.campus);
  const idx = d.cards.findIndex(function (c) { return c.id === str_(id, 60); });
  if (idx === -1) return { ok: false, err: 'not_found' };
  d.cards.splice(idx, 1);
  await writeJSON(leadKey_(a.campus), d);
  return leadOut_(a.campus, d);
}
/* One task on a card: add it (no id), change it (tick it off, rename it,
   give it an owner or a due date), or take it away. */
async function saveLeadTask(username, pin, cardId, task) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  const d = await getLeadDoc_(a.campus);
  const card = d.cards.find(function (c) { return c.id === str_(cardId, 60); });
  if (!card) return { ok: false, err: 'not_found' };
  const tasks = Array.isArray(card.tasks) ? card.tasks : [];
  const idx = tasks.findIndex(function (t) { return t.id === str_(task && task.id, 60); });
  if (task && task.id && idx === -1) return { ok: false, err: 'not_found' };
  const rec = cleanLeadTask_(task, idx > -1 ? tasks[idx] : null);
  if (!rec) return { ok: false, err: 'bad_task' };
  if (idx === -1 && tasks.length >= LEAD_MAX.tasks) return { ok: false, err: 'too_many' };
  const now = new Date().toISOString();
  if (rec.done && !(idx > -1 && tasks[idx].done)) { rec.doneAt = now; rec.doneBy = a.s.id; }
  if (!rec.done) { delete rec.doneAt; delete rec.doneBy; }
  if (idx === -1) { rec.created = now; rec.createdBy = a.s.id; tasks.push(rec); } else tasks[idx] = rec;
  card.tasks = tasks; card.updated = now; card.updatedBy = a.s.id;
  await writeJSON(leadKey_(a.campus), d);
  return leadOut_(a.campus, d, { saved: rec, card: card.id });
}
async function deleteLeadTask(username, pin, cardId, taskId) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  const d = await getLeadDoc_(a.campus);
  const card = d.cards.find(function (c) { return c.id === str_(cardId, 60); });
  const idx = card && Array.isArray(card.tasks) ? card.tasks.findIndex(function (t) { return t.id === str_(taskId, 60); }) : -1;
  if (idx === -1) return { ok: false, err: 'not_found' };
  card.tasks.splice(idx, 1);
  await writeJSON(leadKey_(a.campus), d);
  return leadOut_(a.campus, d);
}
/* A Monday's notes. Empty notes take the day away. If someone else saved
   that day's notes since this person opened them (since = the updated stamp
   they had), nothing is overwritten: they get err 'changed' with the
   latest, to put the two together. */
async function saveLeadNote(username, pin, note) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  note = note && typeof note === 'object' ? note : {};
  const date = isoDate_(note.date);
  if (!date) return { ok: false, err: 'bad_date' };
  const d = await getLeadDoc_(a.campus);
  const idx = d.notes.findIndex(function (n) { return n.date === date; });
  const prev = idx > -1 ? d.notes[idx] : null;
  const since = String(note.since == null ? '' : note.since);
  if (prev && prev.updated !== since && prev.updatedBy !== a.s.id) return leadOut_(a.campus, d, { ok: false, err: 'changed', latest: prev });
  const text = String(note.text == null ? '' : note.text).replace(/\r\n?/g, '\n').replace(/\s+$/, '').slice(0, LEAD_MAX.noteText);
  if (!text.trim()) { if (idx > -1) d.notes.splice(idx, 1); }
  else {
    const rec = { date: date, text: text, updated: new Date().toISOString(), updatedBy: a.s.id };
    if (idx > -1) d.notes[idx] = rec; else d.notes.push(rec);
    d.notes.sort(function (x, y) { return x.date < y.date ? -1 : x.date > y.date ? 1 : 0; });
    if (d.notes.length > LEAD_MAX.notes) d.notes.splice(0, d.notes.length - LEAD_MAX.notes);
  }
  await writeJSON(leadKey_(a.campus), d);
  return leadOut_(a.campus, d, { saved: d.notes.find(function (n) { return n.date === date; }) || null });
}
/* The board's own shape: its columns (one counts as done), focus areas and
   standing agenda items. A card in a column that goes moves to the first
   one; a card in a focus area that goes keeps its place with no area. */
function leadList_(list, max, prefix) {
  const out = [], used = {};
  (Array.isArray(list) ? list : []).slice(0, max).forEach(function (x) {
    x = x && typeof x === 'object' ? x : {};
    const title = str_(x.title, 80);
    if (!title) return;
    let id = String(x.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 30);
    if (!id || used[id]) { let i = 1; do { id = prefix + (i++) + Math.random().toString(36).slice(2, 5); } while (used[id]); }
    used[id] = 1;
    out.push({ id: id, title: title, done: !!x.done });
  });
  return out;
}
async function saveLeadSettings(username, pin, settings) {
  const a = await leadAuth_(username, pin); if (a.out) return a.out;
  settings = settings && typeof settings === 'object' ? settings : {};
  const d = await getLeadDoc_(a.campus);
  const cols = leadList_(settings.cols, LEAD_MAX.cols, 'c');
  if (!cols.length) return { ok: false, err: 'no_columns' };
  const doneIdx = cols.findIndex(function (c) { return c.done; });
  cols.forEach(function (c, i) { c.done = doneIdx === -1 ? i === cols.length - 1 : i === doneIdx; });   // exactly one finished column
  const areas = leadList_(settings.areas, LEAD_MAX.areas, 'a').map(function (x) { return { id: x.id, title: x.title }; });
  const standing = leadList_(settings.standing, LEAD_MAX.standing, 's').map(function (x) { return { id: x.id, title: x.title }; });
  const colIds = cols.map(function (c) { return c.id; }), areaIds = areas.map(function (x) { return x.id; });
  const doneId = cols.filter(function (c) { return c.done; })[0].id, now = new Date().toISOString();
  d.cards.forEach(function (c) {
    if (colIds.indexOf(c.col) === -1) c.col = colIds[0];
    if (c.area && areaIds.indexOf(c.area) === -1) c.area = '';
    if (c.col === doneId && !c.doneAt) c.doneAt = now;
    if (c.col !== doneId) delete c.doneAt;
  });
  d.cols = cols; d.areas = areas; d.standing = standing;
  await writeJSON(leadKey_(a.campus), d);
  return leadOut_(a.campus, d);
}

/* ==================== human resources ====================
   The HR page: each staff member's contract(s), the papers attached to
   them, how long they have served, when the current contract runs out, and
   archiving someone who leaves. Everything lives on the staff record —
   `contracts` (one row per signing, renewals included), `archived`, `hr`
   (who may open the page) — except the attached files, which are their
   own blobs (hrfile:<id>) so the staff list never carries megabytes of PDF.

   Who may use it: an admin, or anyone an admin has given `hr`. Nobody else
   can read a contract, an attachment, or the archive reason.

   Archiving IS deactivating: `active:false` is what every read already
   uses to drop someone from the roster, the staff count, the mentor
   pickers and sign-in, so "it will update the number of staff and
   everything connected" costs nothing more than the flag. `archived`
   holds when and why, and tells the admin's Approvals page this is not a
   sign-up waiting for a yes. */
const HR_FILE_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const HR_FILE_MAX_B64 = 5.6 * 1024 * 1024;   // ~4 MB of file, once base64'd
const HR_MAX_CONTRACTS = 30, HR_MAX_FILES = 10;
/* The campus a contract was signed with — someone who signed with Poipet
   and later moved to Siem Reap keeps that Poipet contract as it was. Same
   ids as CAMPUSES in taxonomy.js. A contract from before this has none,
   which reads as the person's own campus. */
const HR_CAMPUSES = ['poipet', 'siemreap'];
function canHR_(s) { return !!(s && (s.isAdmin || s.hr)); }
function hrId_(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function archivedOf_(s) {
  const a = s && s.archived;
  if (!a || typeof a !== 'object') return null;
  return { at: isoDate_(a.at) || '', reason: str_(a.reason, 300), by: str_(a.by, 60) };
}
function isoMonth_(v) { const m = str_(v, 7); return /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : ''; }
function cleanFileMeta_(f) {
  if (!f || typeof f !== 'object') return null;
  const id = str_(f.id, 60); if (!id) return null;
  return { id: id, name: str_(f.name, 160) || 'file', mime: str_(f.mime, 80), size: finiteNum_(f.size, 0, 1e9) || 0, added: str_(f.added, 40) };
}
function cleanContract_(c, keepFiles) {
  if (!c || typeof c !== 'object') return null;
  const signed = isoMonth_(c.signed), years = finiteNum_(c.years, 0.25, 30);
  if (!signed || years == null) return null;
  return { id: str_(c.id, 60) || hrId_('ct'), signed: signed, years: Math.round(years * 4) / 4, notes: str_(c.notes, 500),
    campus: HR_CAMPUSES.indexOf(c.campus) > -1 ? c.campus : '',
    files: (Array.isArray(keepFiles) ? keepFiles : []).map(cleanFileMeta_).filter(Boolean).slice(0, HR_MAX_FILES),
    added: str_(c.added, 40), addedBy: str_(c.addedBy, 60) };
}
function contractsOf_(s) {
  return (Array.isArray(s && s.contracts) ? s.contracts : []).map(function (c) { return cleanContract_(c, c && c.files); })
    .filter(Boolean).sort(function (a, b) { return a.signed < b.signed ? -1 : a.signed > b.signed ? 1 : 0; });
}
/* How many active people's current contract has run out or runs out within
   90 days — the number on the HR menu item. A contract ends on the first
   day of the month `years` after the month it was signed. */
const HR_DUE_DAYS = 90;
function hrContractEnd_(c) {
  const y = Number(c.signed.slice(0, 4)), m = Number(c.signed.slice(5, 7)) - 1;
  return new Date(y, m + Math.round(Number(c.years) * 12), 1);
}
function hrDueCount_(rows) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let n = 0;
  (rows || []).forEach(function (r) {
    if (!r || r.active === false || r.archived) return;
    const list = contractsOf_(r); if (!list.length) return;
    const days = Math.round((hrContractEnd_(list[list.length - 1]) - today) / 86400000);
    if (days <= HR_DUE_DAYS) n++;
  });
  return n;
}
function hrStaffOut_(s) {
  const out = adminStaffOut_(s);
  out.joined = s.joined || ''; out.photo = s.photo || ''; out.contracts = contractsOf_(s);
  out.ywamSince = ywamSinceOf_(s);
  out.starts = startsOf_(s);
  out.baseSince = out.starts[s.campus] || '';
  return out;
}
/* When they started on each of our campuses — { poipet:'2020-01',
   siemreap:'2024-01' }, a month each, either may be missing. Someone who
   served in Poipet and moved to Siem Reap has both; their time in YWAM GP
   runs from the earlier. (baseSince, from before, is their own campus's.) */
function startsOf_(s) {
  const out = {}, st = s && s.starts && typeof s.starts === 'object' ? s.starts : {};
  HR_CAMPUSES.forEach(function (c) { const m = isoMonth_(st[c]); if (m) out[c] = m; });
  if (s && !out[s.campus] && isoMonth_(s.baseSince) && HR_CAMPUSES.indexOf(s.campus) > -1) out[s.campus] = isoMonth_(s.baseSince);
  return out;
}
/* A contract covers this base only; many staff served YWAM elsewhere first.
   `ywamSince` is the year they joined YWAM anywhere — a fact about the
   person, not the contract — so "Serving in Siem Reap since 2021" and "In
   YWAM since 2003" can both be true. `baseSince` (YYYY-MM) is when they
   started at this base. Both are set on their own (hrSaveStart) and no
   contract changes them; with no baseSince the page counts from the
   earliest contract or the year they joined, whichever is first. */
function ywamSinceOf_(s) {
  const y = Number(s && s.ywamSince);
  return (Number.isInteger(y) && y >= 1960 && y <= new Date().getFullYear()) ? y : null;
}
async function hrList(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canHR_(s)) return { ok: false, err: 'not_authorized' };
  const rows = await getStaff_();
  return { ok: true, staff: rows.filter(function (r) { return !isApplicant_(r); }).map(hrStaffOut_) };
}
async function hrMutate_(username, pin, staffId, fn) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canHR_(s)) return { ok: false, err: 'not_authorized' };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === staffId; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const res = fn(rows[idx], s, rows);
    if (res && res.abort) return res;
    rows[idx].updated = new Date().toISOString();
    return Object.assign({ ok: true, staff: hrStaffOut_(rows[idx]) }, res || {});
  });
}
async function hrSaveContract(username, pin, staffId, contract) {
  return hrMutate_(username, pin, staffId, function (rec, me) {
    const list = contractsOf_(rec);
    const existing = contract && list.filter(function (c) { return c.id === str_(contract.id, 60); })[0];
    const clean = cleanContract_(contract, existing ? existing.files : []);
    if (!clean) return { abort: true, ok: false, err: 'bad_contract' };
    if (!existing) { clean.added = new Date().toISOString(); clean.addedBy = me.id; if (list.length >= HR_MAX_CONTRACTS) return { abort: true, ok: false, err: 'too_many' }; }
    else { clean.added = existing.added; clean.addedBy = existing.addedBy; }
    rec.contracts = list.filter(function (c) { return c.id !== clean.id; }).concat([clean]);
    if (contract && contract.ywamSince !== undefined) {
      if (contract.ywamSince === '' || contract.ywamSince === null) rec.ywamSince = null;
      else { const y = ywamSinceOf_({ ywamSince: contract.ywamSince }); if (!y) return { abort: true, ok: false, err: 'bad_ywam_since' }; rec.ywamSince = y; }
    }
  });
}
/* The start dates, apart from any contract: ywamSince (a year), and the
   month they started on each campus — starts: { poipet, siemreap }, only
   the ones being changed; '' clears one. baseSince is the same as their
   own campus's start. */
async function hrSaveStart(username, pin, staffId, dates) {
  dates = dates && typeof dates === 'object' ? dates : {};
  return hrMutate_(username, pin, staffId, function (rec) {
    let ywam = rec.ywamSince == null ? null : rec.ywamSince;
    const starts = startsOf_(rec), now = new Date(), nowM = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);
    if (dates.ywamSince !== undefined) {
      if (dates.ywamSince === '' || dates.ywamSince === null) ywam = null;
      else { ywam = ywamSinceOf_({ ywamSince: dates.ywamSince }); if (!ywam) return { abort: true, ok: false, err: 'bad_ywam_since' }; }
    }
    const change = Object.assign({}, dates.starts && typeof dates.starts === 'object' ? dates.starts : {});
    if (dates.baseSince !== undefined) change[rec.campus] = dates.baseSince;
    for (const c of Object.keys(change)) {
      if (HR_CAMPUSES.indexOf(c) === -1) return { abort: true, ok: false, err: 'bad_campus' };
      const v = change[c];
      if (v === '' || v === null) { delete starts[c]; continue; }
      const m = isoMonth_(v);
      if (!m || m > nowM || Number(m.slice(0, 4)) < 1960) return { abort: true, ok: false, err: 'bad_base_since' };
      starts[c] = m;
    }
    if (ywam && Object.keys(starts).some(function (c) { return Number(starts[c].slice(0, 4)) < ywam; })) return { abort: true, ok: false, err: 'base_before_ywam' };
    rec.ywamSince = ywam; rec.starts = starts; rec.baseSince = starts[rec.campus] || '';
  });
}
async function hrDeleteContract(username, pin, staffId, contractId) {
  const st = store();
  let gone = [];
  const out = await hrMutate_(username, pin, staffId, function (rec) {
    const list = contractsOf_(rec), hit = list.filter(function (c) { return c.id === contractId; })[0];
    if (!hit) return { abort: true, ok: false, err: 'not_found' };
    gone = hit.files.map(function (f) { return f.id; });
    rec.contracts = list.filter(function (c) { return c.id !== contractId; });
  });
  if (out.ok) for (let i = 0; i < gone.length; i++) { try { await hrDropFile_(st, gone[i]); } catch (e) { /* the record is already clean */ } }
  return out;
}
async function hrDropFile_(st, fileId) {
  if (typeof st.delete === 'function') await st.delete('hrfile:' + fileId);
  else await st.setJSON('hrfile:' + fileId, null);
}
async function hrUploadFile(username, pin, staffId, contractId, name, mime, base64) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canHR_(s)) return { ok: false, err: 'not_authorized' };
  mime = str_(mime, 80);
  if (HR_FILE_MIME.indexOf(mime) === -1) return { ok: false, err: 'bad_type' };
  if (typeof base64 !== 'string' || !base64) return { ok: false, err: 'bad_file' };
  if (base64.length > HR_FILE_MAX_B64) return { ok: false, err: 'too_large' };
  const meta = { id: hrId_('hf'), name: str_(name, 160) || 'file', mime: mime, size: Math.floor(base64.length * 3 / 4), added: new Date().toISOString() };
  // the record first: if this person or contract isn't there, no blob is written
  const out = await hrMutate_(username, pin, staffId, function (rec) {
    const list = contractsOf_(rec), hit = list.filter(function (c) { return c.id === contractId; })[0];
    if (!hit) return { abort: true, ok: false, err: 'not_found' };
    if (hit.files.length >= HR_MAX_FILES) return { abort: true, ok: false, err: 'too_many' };
    hit.files = hit.files.concat([meta]);
    rec.contracts = list;
  });
  if (!out.ok) return out;
  await writeJSON('hrfile:' + meta.id, { id: meta.id, staffId: staffId, contractId: contractId, name: meta.name, mime: mime, data: base64, added: meta.added, by: s.id });
  out.file = meta;
  return out;
}
async function hrGetFile(username, pin, fileId) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canHR_(s)) return { ok: false, err: 'not_authorized' };
  const f = await readJSON('hrfile:' + str_(fileId, 60), null);
  if (!f || !f.data) return { ok: false, err: 'not_found' };
  return { ok: true, id: f.id, name: f.name, mime: f.mime, dataUrl: 'data:' + f.mime + ';base64,' + f.data };
}
async function hrDeleteFile(username, pin, staffId, contractId, fileId) {
  const out = await hrMutate_(username, pin, staffId, function (rec) {
    const list = contractsOf_(rec), hit = list.filter(function (c) { return c.id === contractId; })[0];
    if (!hit || !hit.files.some(function (f) { return f.id === fileId; })) return { abort: true, ok: false, err: 'not_found' };
    hit.files = hit.files.filter(function (f) { return f.id !== fileId; });
    rec.contracts = list;
  });
  if (out.ok) { try { await hrDropFile_(store(), fileId); } catch (e) { /* the record is already clean */ } }
  return out;
}
async function hrArchive(username, pin, staffId, info) {
  return hrMutate_(username, pin, staffId, function (rec, me) {
    if (rec.id === me.id) return { abort: true, ok: false, err: 'self_archive' };
    const at = isoDate_(info && info.at) || new Date().toISOString().slice(0, 10);
    rec.archived = { at: at, reason: str_(info && info.reason, 300), by: me.id };
    rec.active = false;
  });
}
async function hrUnarchive(username, pin, staffId) {
  return hrMutate_(username, pin, staffId, function (rec) {
    if (!rec.archived) return { abort: true, ok: false, err: 'not_archived' };
    rec.archived = null;
    rec.active = true;
  });
}

/* ==================== candidates — potential staff & volunteers ====================
   The CRM side of HR: people who might join — staff, volunteers, students —
   from first contact to arrival. One record per person in the 'candidates'
   blob, with a stage (new → contacted → applied → interview → accepted →
   arrived), a next step with a date (the follow-up reminders hang on it),
   a running log of notes and stage moves, and an archive box (declined,
   withdrew, no answer). Once someone arrives and has an account, the
   record can point at it (staffId). Same gate as the rest of HR. */
const CAND_TYPES = ['staff', 'volunteer', 'student', 'team'];
const CAND_STAGES = ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'];
/* A short-term team moves through its own stages — there is no interview,
   only calls: a 1st call to get to know each other and go over logistics,
   then the documents and the visa, then a 2nd call for cultural orientation
   with the whole team. Team records from before this map across on read. */
const TEAM_STAGES = ['new', 'applied', 'call1', 'docs', 'call2', 'practical', 'arrived'];
const TEAM_STAGE_FROM = { contacted: 'call1', interview: 'call1', accepted: 'docs' };
function stagesFor_(type) { return type === 'team' ? TEAM_STAGES : CAND_STAGES; }
function teamStage_(stage) { return TEAM_STAGE_FROM[stage] || stage; }
const CAND_FOLLOWUP_DAYS = 7, CAND_MAX = 2000, CAND_LOG_MAX = 300;
async function getCandidates_() {
  return (await readJSON('candidates', [])).map(function (c) {
    if (c && c.type === 'team' && TEAM_STAGE_FROM[c.stage]) c.stage = TEAM_STAGE_FROM[c.stage];
    return c;
  });
}
function cleanCandidate_(c, prev, me) {
  if (!c || typeof c !== 'object') return null;
  const name = str_(c.name, 120);
  if (!name) return null;
  const type = CAND_TYPES.indexOf(c.type) > -1 ? c.type : (prev ? prev.type : 'staff');
  const wanted = type === 'team' ? teamStage_(c.stage) : c.stage;
  const stage = stagesFor_(type).indexOf(wanted) > -1 ? wanted : (prev ? (type === 'team' ? teamStage_(prev.stage) : prev.stage) : 'new');
  const now = new Date().toISOString();
  return {
    id: prev ? prev.id : hrId_('cd'), campus: str_(c.campus, 40) || (prev ? prev.campus : me.campus),
    name: name, type: type, stage: stage, subtype: str_(c.subtype, 60), school: str_(c.school, 80),
    email: str_(c.email, 120), phone: str_(c.phone, 60), country: str_(c.country, 60), source: str_(c.source, 120),
    assignedTo: str_(c.assignedTo, 60), nextStep: str_(c.nextStep, 200), nextDate: isoDate_(c.nextDate), expected: isoMonth_(c.expected),
    notes: str_(c.notes, 1000), staffId: str_(c.staffId, 60) || (prev ? (prev.staffId || '') : ''),
    // The portal's own fields ride along untouched by a CRM edit: the
    // messenger the applicant chose, and the application itself (answers,
    // documents, references), which only the portal handlers write.
    messenger: PORTAL_MESSENGERS.indexOf(c.messenger) > -1 ? c.messenger : (prev ? (prev.messenger || '') : ''),
    portal: prev ? (prev.portal || null) : null,
    log: prev ? (Array.isArray(prev.log) ? prev.log : []) : [], archived: prev ? (prev.archived || null) : null,
    created: prev ? prev.created : now, createdBy: prev ? prev.createdBy : me.id, updated: now, updatedBy: me.id
  };
}
function candFollowUpsCount_(rows) {
  const limit = new Date(); limit.setHours(0, 0, 0, 0); limit.setDate(limit.getDate() + CAND_FOLLOWUP_DAYS);
  const cut = limit.toISOString().slice(0, 10);
  return (rows || []).filter(function (c) { return c && !c.archived && c.nextDate && c.nextDate <= cut; }).length;
}
async function hrGate_(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { s: null, out: { ok: false } };
  // HR and the portal's staff work the same records.
  if (!canHR_(s) && !canPortal_(s)) return { s: null, out: { ok: false, err: 'not_authorized' } };
  return { s: s, out: null };
}
async function hrCandidates(username, pin) {
  const g = await hrGate_(username, pin); if (g.out) return g.out;
  return { ok: true, candidates: await getCandidates_() };
}
async function hrSaveCandidate(username, pin, cand) {
  const g = await hrGate_(username, pin); if (g.out) return g.out;
  const rows = await getCandidates_();
  const id = str_(cand && cand.id, 60);
  const idx = id ? rows.findIndex(function (r) { return r && r.id === id; }) : -1;
  if (id && idx === -1) return { ok: false, err: 'not_found' };
  const prev = idx > -1 ? rows[idx] : null;
  if (prev && !canHR_(g.s) && !portalMaySee_(g.s, prev)) return { ok: false, err: 'not_authorized' };
  const rec = cleanCandidate_(cand, prev, g.s);
  if (!rec) return { ok: false, err: 'bad_candidate' };
  if (!canHR_(g.s) && !portalMaySee_(g.s, rec)) return { ok: false, err: 'not_authorized' };
  if (!prev && rows.length >= CAND_MAX) return { ok: false, err: 'too_many' };
  if (prev && prev.stage !== rec.stage) rec.log = rec.log.concat([{ at: rec.updated, by: g.s.id, kind: 'stage', text: rec.stage }]).slice(-CAND_LOG_MAX);
  if (idx > -1) rows[idx] = rec; else rows.push(rec);
  await writeJSON('candidates', rows);
  if (rec.type === 'team') await syncTeamTrip_(rec, g.s.id);   // every team application is a team in the Teams Database
  return { ok: true, candidate: rec };
}
async function hrCandidateNote(username, pin, id, text) {
  const g = await hrGate_(username, pin); if (g.out) return g.out;
  text = str_(text, 1000);
  if (!text) return { ok: false, err: 'empty' };
  const rows = await getCandidates_();
  const idx = rows.findIndex(function (r) { return r && r.id === str_(id, 60); });
  if (idx === -1) return { ok: false, err: 'not_found' };
  if (!canHR_(g.s) && !portalMaySee_(g.s, rows[idx])) return { ok: false, err: 'not_authorized' };
  const now = new Date().toISOString();
  rows[idx].log = (Array.isArray(rows[idx].log) ? rows[idx].log : []).concat([{ at: now, by: g.s.id, kind: 'note', text: text }]).slice(-CAND_LOG_MAX);
  rows[idx].updated = now; rows[idx].updatedBy = g.s.id;
  await writeJSON('candidates', rows);
  return { ok: true, candidate: rows[idx] };
}
async function hrArchiveCandidate(username, pin, id, info) {
  const g = await hrGate_(username, pin); if (g.out) return g.out;
  const rows = await getCandidates_();
  const idx = rows.findIndex(function (r) { return r && r.id === str_(id, 60); });
  if (idx === -1) return { ok: false, err: 'not_found' };
  if (!canHR_(g.s) && !portalMaySee_(g.s, rows[idx])) return { ok: false, err: 'not_authorized' };
  const now = new Date().toISOString();
  if (info === null) rows[idx].archived = null;
  else rows[idx].archived = { at: now.slice(0, 10), reason: str_(info && info.reason, 300), by: g.s.id };
  rows[idx].updated = now; rows[idx].updatedBy = g.s.id;
  await writeJSON('candidates', rows);
  await syncTeamTrip_(rows[idx], g.s.id, info === null ? 'active' : 'cancelled');   // a closed team application is a cancelled team
  return { ok: true, candidate: rows[idx] };
}

/* ==================== YWAM GP Portal ====================
   The application portal (public/portal.html): students, potential staff,
   volunteers and short-term teams apply from their phones and follow their
   application; the applications department works the same records as a
   CRM. See docs/portal-plan.md for the whole shape and the milestones.

   Accounts are ordinary staff rows with kind:'applicant' — same username +
   PIN, same throttle, same mutateStaff_ — and every ordinary handler is
   CLOSED to them: verifyStaff_ answers null for an applicant unless the
   handler opts in (the third argument), so an applicant cannot log a day,
   read a roster, or reach HR by holding a valid PIN. They are also left out
   of every roster and count. The record carries applicant:{type, school,
   candidateId}; the application itself is the candidate record in the
   'candidates' blob (the existing HR CRM), pointing back with staffId and
   source:'portal'.

   Who may work the portal is a flag an admin sets by hand — portalStaff
   (see every applicant, move stages, notes, owner) and portalAdmin (that,
   plus grant / revoke portalStaff). An app admin has both and is the only
   one who can make a portal admin. Nobody gets it by being staff. */
/* Where you apply to. Each campus runs its own schools: Poipet DTS and DBS,
   Siem Reap all four. DBS, BCS and SMS are secondary schools — a completed
   DTS is the prerequisite — which the forms ask about; here it only decides
   what can be picked where. A third campus is one more row. */
const PORTAL_CAMPUSES = { poipet: ['dts', 'dbs'], siemreap: ['dts', 'dbs', 'bcs', 'sms'] };
const PORTAL_DEFAULT_CAMPUS = 'siemreap';
const PORTAL_TYPES = ['student', 'staff', 'volunteer', 'team'];
const PORTAL_SCHOOLS = ['dts', 'dbs', 'bcs', 'sms'];
const PORTAL_SECONDARY = ['dbs', 'bcs', 'sms'];
const PORTAL_MESSENGERS = ['whatsapp', 'telegram'];
/* The applicant's own view of the CRM stages, in the order the journey runs
   (the CRM's own list keeps 'contacted' before 'applied' because a lead is
   usually contacted before they apply — on the portal it is the other way
   round, and a stage move by staff can land anywhere on this line). */
const PORTAL_STAGE_ORDER = ['new', 'applied', 'contacted', 'interview', 'accepted', 'practical', 'arrived'];
function isApplicant_(s) { return !!(s && s.kind === 'applicant'); }
/* The leader of Outreach Teams hosts the short-term teams, so they work team
   applications on the portal without anyone ticking Portal access for them:
   the admin who makes someone that ministry's leader has already said so. */
function leadsTeams_(s) { return isLeaderOf_(s, TEAM_DEPT, TEAM_MIN); }
function canPortal_(s) { return !!(s && !isApplicant_(s) && s.active !== false && (s.isAdmin || s.portalAdmin || s.portalStaff || leadsTeams_(s))); }
function isPortalAdmin_(s) { return !!(s && !isApplicant_(s) && s.active !== false && (s.isAdmin || s.portalAdmin)); }
/* Which kinds of application a portal staff member works. Outreach Teams
   hosts the short-term teams, so someone on that ministry sees team
   applications and nothing else; everyone else with access sees them all.
   null means "all". Admins and portal admins always see all. */
function portalTypes_(s) {
  if (!s || isPortalAdmin_(s)) return null;
  if (deptOf_(s) === TEAM_DEPT && s.ministry === TEAM_MIN) return ['team'];
  // in only as the Outreach Teams leader: team applications, same as its staff
  if (!s.portalStaff && leadsTeams_(s)) return ['team'];
  return null;
}
function portalMaySee_(s, c) { const ty = portalTypes_(s); return !ty || !c || ty.indexOf(c.type) > -1; }
function portalRole_(s) {
  if (isApplicant_(s)) return 'applicant';
  if (isPortalAdmin_(s)) return 'portal-admin';
  if (canPortal_(s)) return 'portal-staff';
  return null;
}
function cleanPhone_(v) {
  const s = String(str_(v, 40) || '').replace(/[^\d+ ()-]/g, '').trim();
  return /\d{6,}/.test(s.replace(/\D/g, '')) ? s : '';
}
function portalStaffOut_(s) {
  return { id: s.id, name: s.name, username: s.username, campus: s.campus, isAdmin: !!s.isAdmin, portalAdmin: !!s.portalAdmin, portalStaff: !!s.portalStaff, role: portalRole_(s) };
}
/* Khmer or international decides two things: whether a leader reference is
   asked for (Khmer students: no; teams: no — a church, not a person; everyone
   else: yes) and whether the visa guide applies (everyone not from Cambodia:
   international students, staff, volunteers, teams). Country comes from
   sign-up, which is why it is required there. */
function audienceOf_(c) { return cleanCountry_(c && c.country) === 'Cambodia' ? 'khmer' : 'international'; }
function needsVisa_(c) { return audienceOf_(c) === 'international'; }
function refNeeded_(c) { return !(c && (c.type === 'team' || (c.type === 'student' && audienceOf_(c) === 'khmer'))); }
function formKeyOf_(c) { return c.type === 'student' ? (PORTAL_SCHOOLS.indexOf(c.school) > -1 ? c.school : 'dts') : (PORTAL_FORMS_DEFAULT[c.type] ? c.type : 'staff'); }
function portalStageIdx_(stage, type) { const i = (type === 'team' ? TEAM_STAGES : PORTAL_STAGE_ORDER).indexOf(stage); return i === -1 ? 0 : i; }
/* What the applicant is told, derived on the server from the record so the
   dashboard and the staff view can never disagree about where someone is. */
function portalStatus_(c) {
  if (c.archived) return 'closed';
  const submitted = !!(c.portal && c.portal.submittedAt);
  if (c.type === 'team') return c.stage === 'new' ? (submitted ? 'pending' : 'draft') : c.stage === 'applied' ? 'pending' : c.stage;   // call1 | docs | call2 | practical | arrived
  if (c.stage === 'new') return submitted ? 'pending' : 'draft';
  if (c.stage === 'applied') return 'pending';
  if (c.stage === 'contacted') return 'in_review';
  return c.stage;   // interview | accepted | practical | arrived
}
/* ==================== a team's journey ====================
   A short-term team runs differently from a student: no reference and no
   interview. Its stages (TEAM_STAGES) are New → Applied → 1st call →
   Awaiting documents → 2nd call (cultural orientation) → Getting ready →
   Arrived, and inside Awaiting documents the order matters:
     1. the team uploads passport copies for everyone, a team photo with
        names, and the flight itineraries (the visa process can't start
        without flights);
     2. then the visa part opens — we send the letter of invitation and its
        supporting documents (uploaded by staff, from: 'us');
     3. the team applies, and uploads the approved e-visas.
   A team that needs no visa (from Cambodia) skips 2 and 3.
   Each step ticks itself when the portal can see it happen (a document
   uploaded, a stage reached), and by a STAFF TICK when it happens outside
   the portal (the two calls, arrival). The stage follows the steps
   forward on its own (teamAutoStage_): the 1st call done → Awaiting
   documents; everything in → 2nd call; the 2nd call done → Getting ready. */
const TEAM_TICKS = ['call1', 'call2', 'arrived'];
function teamFlags_(c) { return (c && c.portal && c.portal.team) || {}; }
function hasDoc_(c, kind) { return docsOf_(c).some(function (d) { return d && d.kind === kind; }); }
function teamDocsIn_(c) { return hasDoc_(c, 'passports') && hasDoc_(c, 'photo') && (hasDoc_(c, 'flights') || !!((c.portal && c.portal.visa) || {}).flightsConfirmed); }
function teamVisaDone_(c) { return !needsVisa_(c) || hasDoc_(c, 'evisa'); }
function teamSteps_(c) {
  const idx = portalStageIdx_(c.stage, 'team');
  const at = function (stage) { return idx >= portalStageIdx_(stage, 'team'); };
  const f = teamFlags_(c), visa = (c.portal && c.portal.visa) || {}, intl = needsVisa_(c);
  const submitted = !!(c.portal && c.portal.submittedAt) || at('applied');
  const past = at('call2');   // the documents are behind them
  const steps = [
    { id: 'account', done: true, who: 'you' },
    { id: 'form', done: submitted, who: 'you', auto: true },
    { id: 'call1', done: !!f.call1 || at('docs'), who: 'us', tick: true },
    { id: 'passports', done: past || hasDoc_(c, 'passports'), who: 'you', auto: true, group: 'docs' },
    { id: 'photo', done: past || hasDoc_(c, 'photo'), who: 'you', auto: true, group: 'docs' },
    { id: 'flights', done: past || hasDoc_(c, 'flights') || !!visa.flightsConfirmed, who: 'you', auto: true, group: 'docs' },
    intl && { id: 'invitation', done: past || hasDoc_(c, 'invitation') || !!visa.invitationSent, who: 'us', auto: true, group: 'visa' },
    intl && { id: 'evisa', done: past || hasDoc_(c, 'evisa'), who: 'you', auto: true, group: 'visa' },
    { id: 'call2', done: !!f.call2 || at('practical'), who: 'us', tick: true },
    { id: 'practical', done: at('arrived'), who: 'you' },
    { id: 'arrived', done: at('arrived'), who: 'us', tick: true }
  ].filter(Boolean);
  let current = -1;
  steps.forEach(function (st, i) { if (current === -1 && !st.done) current = i; });
  if (current === -1) current = steps.length - 1;
  steps.forEach(function (st, i) { st.state = st.done ? 'done' : (i === current ? 'current' : 'todo'); });
  if (c.archived) steps.forEach(function (st) { if (st.state === 'current') st.state = 'todo'; });
  return steps;
}
/* Moves a team's stage forward to where its steps say it is — never back.
   Returns true when it moved, and logs the move as `by`. */
function teamAutoStage_(c, by) {
  if (!c || c.type !== 'team' || c.archived) return false;
  const f = teamFlags_(c);
  const idx = function (st) { return portalStageIdx_(st, 'team'); };
  let target = c.stage;
  const forward = function (st) { if (idx(st) > idx(target)) target = st; };
  if (c.portal && c.portal.submittedAt) forward('applied');
  if (f.call1) forward('docs');
  if (idx(target) >= idx('docs') && teamDocsIn_(c) && teamVisaDone_(c)) forward('call2');
  if (f.call2) forward('practical');
  if (target === c.stage) return false;
  const now = new Date().toISOString();
  c.stage = target;
  c.log = (Array.isArray(c.log) ? c.log : []).concat([{ at: now, by: by, kind: 'stage', text: target }]).slice(-CAND_LOG_MAX);
  return true;
}
function portalSteps_(c) {
  if (c && c.type === 'team') return teamSteps_(c);
  const idx = portalStageIdx_(c.stage);
  const submitted = !!(c.portal && c.portal.submittedAt) || idx >= portalStageIdx_('applied');
  const docsDone = !!(c.portal && c.portal.docsDone);
  const refNeeded = refNeeded_(c);
  const refDone = !refNeeded || !!(c.portal && c.portal.referenceDone);
  const at = function (stage) { return idx >= portalStageIdx_(stage); };
  /* The application and the leader reference go in first, side by side —
     both are the applicant's to do — and only once BOTH are in is it
     "received" and do we get in touch. A Khmer applicant has no reference. */
  const refIn = refDone || at('contacted');
  const steps = [
    { id: 'account', done: true },
    { id: 'form', done: submitted }
  ].concat(refNeeded ? [{ id: 'reference', done: refIn }] : []).concat([
    { id: 'received', done: submitted && refIn },
    { id: 'contact', done: at('contacted') },
    { id: 'docs', done: at('interview') || docsDone || docsRequiredIn_(c) },
    { id: 'interview', done: at('accepted') },
    { id: 'accepted', done: at('practical') },
    { id: 'practical', done: at('arrived') },
    { id: 'arrived', done: at('arrived') }
  ]);
  let current = -1;
  steps.forEach(function (st, i) { if (current === -1 && !st.done) current = i; });
  if (current === -1) current = steps.length - 1;
  steps.forEach(function (st, i) { st.state = st.done ? 'done' : (i === current ? 'current' : 'todo'); });
  if (c.archived) steps.forEach(function (st) { if (st.state === 'current') st.state = 'todo'; });
  return steps;
}
function portalAppOut_(c) {
  return {
    id: c.id, campus: c.campus || '', type: c.type, school: c.school || '', stage: c.stage, status: portalStatus_(c),
    submittedAt: (c.portal && c.portal.submittedAt) || null, updated: c.updated || '',
    archived: c.archived ? { at: c.archived.at } : null,
    audience: audienceOf_(c), needsVisa: needsVisa_(c), refNeeded: refNeeded_(c), formKey: formKeyOf_(c),
    visa: (c.portal && c.portal.visa) || {},
    answers: (c.portal && c.portal.form && c.portal.form.answers) || (c.portal && c.portal.draft) || {},
    draftAt: (c.portal && c.portal.draftAt) || null,
    answersUpdatedAt: (c.portal && c.portal.form && c.portal.form.updatedAt) || null,
    docKinds: docKindsFor_(c), docs: docsOf_(c).map(docMeta_),
    members: c.type === 'team' ? ((c.portal && c.portal.members) || []) : undefined,
    reference: (function (r) { delete r.answers; delete r.leaderEmail; return r; })(refState_(c)), // the applicant never reads the reference
    steps: portalSteps_(c)
  };
}
/* The staff side's row — the CRM record plus the applicant's contact and
   messenger, so one tap opens the chat. */
function portalCandOut_(c, byId) {
  const acct = c.staffId ? byId[c.staffId] : null;
  return Object.assign({}, c, {
    messenger: c.messenger || (acct && acct.messenger) || '',
    phone: c.phone || (acct && acct.phone) || '',
    email: c.email || (acct && acct.email) || '',
    status: portalStatus_(c),
    audience: audienceOf_(c), needsVisa: needsVisa_(c), refNeeded: refNeeded_(c), formKey: formKeyOf_(c),
    reference: refState_(c),
    docKinds: docKindsFor_(c),
    steps: portalSteps_(c),
    hasAccount: !!acct
  });
}
async function candidateFor_(rows, s) {
  const cid = s.applicant && s.applicant.candidateId;
  return rows.find(function (r) { return r && (r.id === cid || r.staffId === s.id); }) || null;
}

/* Validate and create an applicant account + its candidate record. `by` is
   who made it: the applicant themself (sign-up) or a portal admin (Accounts →
   Add). Answers {ok:false, err} or {ok:true, rec, cand}. */
async function createApplicant_(payload, by) {
  payload = payload && typeof payload === 'object' ? payload : {};
  const u = normUser_(payload.username);
  if (!/^[a-z0-9._-]{2,20}$/.test(u)) return { ok: false, err: 'bad_username' };
  if (!/^\d{4}$/.test(String(payload.pin))) return { ok: false, err: 'bad_pin' };
  const name = str_(payload.name, 120);
  if (!name) return { ok: false, err: 'name_required' };
  const email = cleanEmail_(payload.email);
  if (email === null) return { ok: false, err: 'bad_email' };
  if (!email) return { ok: false, err: 'email_required' };
  const phone = cleanPhone_(payload.phone);
  if (!phone) return { ok: false, err: 'phone_required' };
  const messenger = PORTAL_MESSENGERS.indexOf(payload.messenger) > -1 ? payload.messenger : '';
  if (!messenger) return { ok: false, err: 'messenger_required' };
  const type = PORTAL_TYPES.indexOf(payload.type) > -1 ? payload.type : '';
  if (!type) return { ok: false, err: 'type_required' };
  const campus = Object.prototype.hasOwnProperty.call(PORTAL_CAMPUSES, payload.campus) ? payload.campus : '';
  if (!campus) return { ok: false, err: 'campus_required' };
  const school = type === 'student' ? (PORTAL_SCHOOLS.indexOf(payload.school) > -1 ? payload.school : '') : '';
  if (type === 'student' && !school) return { ok: false, err: 'school_required' };
  if (school && PORTAL_CAMPUSES[campus].indexOf(school) === -1) return { ok: false, err: 'school_not_at_campus' };
  const country = cleanCountry_(payload.country);
  if (!country) return { ok: false, err: 'country_required' };
  /* A team names its sending church, base or organization at sign-up, so the
     staff side shows the team — not the person — from the first day, and
     the form opens with it filled in (it is the form's first question). */
  const teamName = type === 'team' ? (str_(payload.teamName, 120) || '') : '';
  const rows = await getStaff_();
  if (findStaff_(rows, u)) return { ok: false, err: 'taken' };
  if (rows.some(function (r) { return r.email && r.email === email; })) return { ok: false, err: 'email_taken' };
  const cands = await getCandidates_();
  if (cands.length >= CAND_MAX) return { ok: false, err: 'too_many' };
  const salt = pinSalt_(), now = new Date().toISOString();
  const id = newStaffId_(), candId = hrId_('cd');
  const rec = {
    id: id, username: u, name: name, email: email, pinHash: hashPin_(payload.pin, salt), pinSalt: salt,
    kind: 'applicant', campus: campus, dept: '', ministry: '', role: '', photo: '',
    phone: phone, messenger: messenger, country: country,
    applicant: { type: type, school: school, candidateId: candId },
    active: true, isAdmin: false, created: now, updated: now
  };
  const cand = {
    id: candId, campus: campus, name: name, type: type, stage: 'new',
    subtype: school ? school.toUpperCase() : '', school: school,
    email: email, phone: phone, messenger: messenger, country: country, source: 'portal',
    assignedTo: '', nextStep: '', nextDate: '', expected: '', notes: '', staffId: id,
    portal: { createdAt: now, submittedAt: null, form: null, docs: [], references: [], draft: teamName ? { teamName: teamName } : null, draftAt: teamName ? now : null },
    log: [{ at: now, by: by || id, kind: 'stage', text: 'new' }], archived: null,
    created: now, createdBy: by || id, updated: now, updatedBy: by || id
  };
  // The account first — a candidate row without an account is a loose end
  // staff can see and clean up; an account without its candidate would be a
  // person who signed up and sees nothing.
  const made = await mutateStaff_(function (all) {
    if (findStaff_(all, u)) return { abort: true, ok: false, err: 'taken' };
    if (all.some(function (r) { return r.email && r.email === email; })) return { abort: true, ok: false, err: 'email_taken' };
    all.push(rec);
    return { ok: true };
  });
  if (!made || !made.ok) return made || { ok: false };
  const fresh = await getCandidates_();
  fresh.push(cand);
  await writeJSON('candidates', fresh);
  return { ok: true, rec: rec, cand: cand };
}
async function portalRegister(payload) {
  const made = await createApplicant_(payload, null);
  if (!made.ok) return made;
  // the same shape portalBoot gives, form included — the dashboard opens the form straight away
  return { ok: true, role: 'applicant', me: portalMeOut_(made.rec), application: portalAppOut_(made.cand), form: (await getForms_())[formKeyOf_(made.cand)] };
}

/* ==================== accounts (staff side, portal admins) ====================
   Every applicant account, to see, fix, add or remove. Applicant accounts are
   not in Admin → Accounts (they are not staff), so this is their one place.
   Editing keeps the candidate record in step (name, contact); a new PIN is
   set here when someone is locked out; delete is portalDeleteApplicant. */
function portalAccountOut_(s, cand) {
  return { id: s.id, username: s.username, name: s.name, email: s.email || '', phone: s.phone || '', messenger: s.messenger || '', country: s.country || '',
    campus: s.campus || '', type: s.applicant ? s.applicant.type : '', school: s.applicant ? s.applicant.school : '',
    candidateId: (s.applicant && s.applicant.candidateId) || (cand && cand.id) || '', stage: cand ? cand.stage : '', status: cand ? portalStatus_(cand) : 'none',
    created: s.created || '', updated: s.updated || '' };
}
async function portalListAccounts(username, pin) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  const rows = await getStaff_(), cands = await getCandidates_();
  const byStaff = {}; cands.forEach(function (c) { if (c && c.staffId) byStaff[c.staffId] = c; });
  return { ok: true, accounts: rows.filter(isApplicant_).map(function (s) { return portalAccountOut_(s, byStaff[s.id] || null); }) };
}
async function portalCreateApplicant(username, pin, payload) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  const made = await createApplicant_(payload, me.id);
  if (!made.ok) return made;
  return { ok: true, account: portalAccountOut_(made.rec, made.cand) };
}
async function portalUpdateAccount(username, pin, staffId, payload) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  payload = payload && typeof payload === 'object' ? payload : {};
  let changed = null;
  const out = await mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === str_(staffId, 60); });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const rec = rows[idx];
    if (!isApplicant_(rec)) return { abort: true, ok: false, err: 'not_applicant' };
    if (payload.name !== undefined) { const nm = str_(payload.name, 120); if (!nm) return { abort: true, ok: false, err: 'name_required' }; rec.name = nm; }
    if (payload.username !== undefined) {
      const u = normUser_(payload.username);
      if (!/^[a-z0-9._-]{2,20}$/.test(u)) return { abort: true, ok: false, err: 'bad_username' };
      if (rows.some(function (r) { return r.id !== rec.id && r.username === u; })) return { abort: true, ok: false, err: 'taken' };
      rec.username = u;
    }
    if (payload.email !== undefined) {
      const email = cleanEmail_(payload.email);
      if (email === null || !email) return { abort: true, ok: false, err: 'bad_email' };
      if (rows.some(function (r) { return r.id !== rec.id && r.email && r.email === email; })) return { abort: true, ok: false, err: 'email_taken' };
      rec.email = email;
    }
    if (payload.phone !== undefined) { const ph = cleanPhone_(payload.phone); if (!ph) return { abort: true, ok: false, err: 'phone_required' }; rec.phone = ph; }
    if (payload.messenger !== undefined) { if (PORTAL_MESSENGERS.indexOf(payload.messenger) === -1) return { abort: true, ok: false, err: 'messenger_required' }; rec.messenger = payload.messenger; }
    if (payload.country !== undefined) { const co = cleanCountry_(payload.country); if (!co) return { abort: true, ok: false, err: 'country_required' }; rec.country = co; }
    if (payload.newPin !== undefined && payload.newPin !== '') {
      if (!/^\d{4}$/.test(String(payload.newPin))) return { abort: true, ok: false, err: 'bad_pin' };
      rec.pinSalt = pinSalt_(); rec.pinHash = hashPin_(payload.newPin, rec.pinSalt);
    }
    rec.updated = new Date().toISOString();
    rows[idx] = rec; changed = rec;
    return { ok: true };
  });
  if (!out || !out.ok) return out || { ok: false };
  // the CRM record carries the same contact facts — keep them in step
  const cands = await getCandidates_();
  const cand = await candidateFor_(cands, changed);
  if (cand) {
    cand.name = changed.name; cand.email = changed.email || ''; cand.phone = changed.phone || ''; cand.messenger = changed.messenger || ''; cand.country = changed.country || '';
    cand.updated = new Date().toISOString(); cand.updatedBy = me.id;
    await writeJSON('candidates', cands);
  }
  await clearLoginThrottle_(changed.username);
  return { ok: true, account: portalAccountOut_(changed, cand) };
}
function portalMeOut_(s) {
  return { id: s.id, name: s.name, username: s.username, email: s.email || '', phone: s.phone || '', messenger: s.messenger || '', country: s.country || '',
    campus: s.campus || '', type: s.applicant ? s.applicant.type : '', school: s.applicant ? s.applicant.school : '' };
}
/* One call per page open, same as getMyBoot: who you are, and either your own
   application or — for portal staff — everyone's. A bad PIN is 'auth' so the
   page knows to sign out; a staff member without portal access is told so
   and shown nothing. */
async function portalBoot(username, pin) {
  const s = await verifyStaff_(username, pin, true);
  if (!s) return { ok: false, err: 'auth' };
  const cands = await getCandidates_();
  if (isApplicant_(s)) {
    const cand = await candidateFor_(cands, s);
    if (!cand) return { ok: false, err: 'no_application' };
    const out = { ok: true, role: 'applicant', me: portalMeOut_(s), application: portalAppOut_(cand), form: (await getForms_())[formKeyOf_(cand)] };
    if (cand.type === 'team') {
      const trip = (await linkedTrip_(cand)) || (!cand.archived ? await syncTeamTrip_(cand, s.id) : null);
      out.application.trip = teamTripOut_(trip);
      out.metricOverrides = (await getMetricOverrides_()).filter(function (o) { return o.dept === TEAM_DEPT && o.ministry === TEAM_MIN; });
      // the base's weekly schedules, once the team is here (not before — it would only confuse)
      if (cand.stage === 'arrived' && !cand.archived) { const wk = dutyThisWeek_(); out.schedules = Object.assign({ week: wk }, await dutyPublished_(cand.campus || PORTAL_DEFAULT_CAMPUS, wk)); }
    }
    return out;
  }
  if (!canPortal_(s)) return { ok: false, err: 'not_authorized' };
  const rows = await getStaff_();
  const byId = {}; rows.forEach(function (r) { byId[r.id] = r; });
  const tripOf = {};
  (await getTeamTripsRaw_()).forEach(function (t) { if (t && t.candidateId && !t.deleted) tripOf[t.candidateId] = t; });
  return {
    ok: true, role: portalRole_(s), me: portalStaffOut_(s),
    applicants: cands.filter(function (c) { return portalMaySee_(s, c); }).map(function (c) {
      const o = portalCandOut_(c, byId);
      if (c.type === 'team') o.teamTrip = teamTripOut_(tripOf[c.id]);
      return o;
    }),
    metricOverrides: (await getMetricOverrides_()).filter(function (o) { return o.dept === TEAM_DEPT && o.ministry === TEAM_MIN; }),
    scope: portalTypes_(s),
    staff: rows.filter(function (r) { return canPortal_(r); }).map(portalStaffOut_),
    stages: CAND_STAGES, teamStages: TEAM_STAGES, types: PORTAL_TYPES, schools: PORTAL_SCHOOLS, campuses: PORTAL_CAMPUSES,
    forms: await getForms_()
  };
}
/* Grant or revoke portal access. A portal admin may hand out portalStaff;
   only an app admin may make (or unmake) a portal admin. Never to an
   applicant, and never to nobody. */
async function portalSetAccess(username, pin, staffId, flags) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  flags = flags && typeof flags === 'object' ? flags : {};
  if (flags.portalAdmin !== undefined && !me.isAdmin) return { ok: false, err: 'not_authorized' };
  return mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === str_(staffId, 60); });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    const rec = rows[idx];
    if (isApplicant_(rec)) return { abort: true, ok: false, err: 'is_applicant' };
    if (flags.portalStaff !== undefined) rec.portalStaff = !!flags.portalStaff;
    if (flags.portalAdmin !== undefined) rec.portalAdmin = !!flags.portalAdmin;
    rec.updated = new Date().toISOString();
    rows[idx] = rec;
    return { ok: true, staff: adminStaffOut_(rec) };
  });
}
/* The staff side's writes go through the CRM's own handlers (hrSaveCandidate,
   hrCandidateNote, hrArchiveCandidate — hrGate_ admits portal staff). This
   one is the applicant's: their contact details, which they own. */
/* ==================== the application forms ====================
   One form per kind of application (portal-forms-default.js is the shipped
   set). A portal admin edits a form on the staff side — Google Forms style:
   sections, questions, a type, required, options, and which audience sees
   it — and the saved copy in the 'portalForms' blob replaces the default
   for that key; reset drops it. Answers are keyed by question id, so a
   relabelled question keeps its answers and a deleted one simply stops
   being asked. The applicant fills the form on their side: every change
   saves a draft, submit checks the required questions for THEIR audience
   and moves the record to 'applied'. */
const FORM_TYPES = ['short', 'long', 'choice', 'multi', 'yesno', 'date', 'number', 'email', 'phone', 'stays', 'people'];
const PEOPLE_MAX = 20;
/* A list of people (a team's co-leaders): rows need a name; email and phone
   are kept if given. */
function cleanPeople_(v) {
  if (!Array.isArray(v)) return null;
  const out = [];
  v.slice(0, PEOPLE_MAX).forEach(function (r) {
    if (!r || typeof r !== 'object') return;
    const name = String(r.name == null ? '' : r.name).trim().slice(0, 120);
    if (!name) return;
    out.push({ name: name, email: String(r.email == null ? '' : r.email).trim().slice(0, 160), phone: String(r.phone == null ? '' : r.phone).trim().slice(0, 40) });
  });
  return out.length ? out : null;
}
const STAYS_MAX = 8;
/* A trip: our base first, then any other places in Cambodia, each with its
   dates. Rows without both dates are dropped, except the base, which stays
   so a half-filled draft keeps its place; reversed dates are swapped. */
function cleanStays_(v) {
  if (!Array.isArray(v)) return null;
  const out = [];
  v.slice(0, STAYS_MAX).forEach(function (row, i) {
    if (!row || typeof row !== 'object') return;
    let from = isoDate_(row.from), to = isoDate_(row.to);
    if (from && to && to < from) { const x = from; from = to; to = x; }
    const place = String(row.place == null ? '' : row.place).trim().slice(0, 80);
    if (i === 0) { out.push({ place: place, from: from, to: to, base: true }); return; }
    if (!place && !from && !to) return;
    out.push({ place: place, from: from, to: to });
  });
  return out.length ? out : null;
}
function staysDone_(v) { return Array.isArray(v) && v[0] && !!v[0].from && !!v[0].to && v.slice(1).every(function (r) { return r.place && r.from && r.to; }); }
const FORM_AUDIENCES = ['all', 'khmer', 'international'];
const FORM_MAX_SECTIONS = 20, FORM_MAX_QUESTIONS = 120, FORM_MAX_OPTIONS = 30, ANSWER_MAX = 4000;
function langText_(v) {
  const o = (v && typeof v === 'object') ? v : { en: v };
  return { en: String(str_(o.en, 600) || ''), km: String(str_(o.km, 600) || '') };
}
function cleanForm_(f, key) {
  if (!f || typeof f !== 'object' || !Array.isArray(f.sections)) return null;
  const seen = {}; let nq = 0;
  const sections = f.sections.slice(0, FORM_MAX_SECTIONS).map(function (sec, si) {
    if (!sec || typeof sec !== 'object') return null;
    const sid = /^[a-z0-9_-]{1,40}$/i.test(String(sec.id || '')) ? String(sec.id) : 'sec' + (si + 1);
    const questions = (Array.isArray(sec.questions) ? sec.questions : []).map(function (qq, qi) {
      if (!qq || typeof qq !== 'object') return null;
      let id = /^[a-z0-9_-]{1,40}$/i.test(String(qq.id || '')) ? String(qq.id) : 'q' + Date.now().toString(36) + si + qi;
      while (seen[id]) id += '_';
      seen[id] = 1; nq++;
      const type = FORM_TYPES.indexOf(qq.type) > -1 ? qq.type : 'short';
      const label = langText_(qq.label);
      if (!label.en && !label.km) return null;
      const withOptions = type === 'choice' || type === 'multi' || type === 'yesno';
      return {
        id: id, type: type, label: label, help: langText_(qq.help), required: !!qq.required,
        addLabel: type === 'people' && qq.addLabel ? langText_(qq.addLabel) : undefined,
        audience: FORM_AUDIENCES.indexOf(qq.audience) > -1 ? qq.audience : 'all',
        attach: (type === 'yesno' || type === 'choice') && /^[a-z]{2,20}$/.test(String(qq.attach || '')) ? String(qq.attach) : undefined,
        options: withOptions ? (Array.isArray(qq.options) ? qq.options : []).map(langText_).filter(function (o) { return o.en || o.km; }).slice(0, FORM_MAX_OPTIONS) : []
      };
    }).filter(Boolean);
    return { id: sid, title: langText_(sec.title), help: langText_(sec.help), questions: questions };
  }).filter(Boolean);
  if (nq > FORM_MAX_QUESTIONS) return null;
  return { key: key, title: langText_(f.title), sections: sections };
}
async function getForms_() {
  const stored = await readJSON('portalForms', {});
  const out = {};
  Object.keys(PORTAL_FORMS_DEFAULT).forEach(function (k) {
    out[k] = (stored && stored[k] && Array.isArray(stored[k].sections)) ? stored[k] : Object.assign({}, PORTAL_FORMS_DEFAULT[k], { isDefault: true });
  });
  return out;
}
function askedQuestions_(form, audience) {
  const out = [];
  ((form && form.sections) || []).forEach(function (sec) { (sec.questions || []).forEach(function (qq) { if (qq.audience === 'all' || qq.audience === audience) out.push(qq); }); });
  return out;
}
function cleanAnswers_(answers, form, audience) {
  const out = {};
  if (!answers || typeof answers !== 'object') return out;
  askedQuestions_(form, audience).forEach(function (qq) {
    const v = answers[qq.id];
    if (v === undefined || v === null) return;
    if (qq.type === 'stays') { const st = cleanStays_(v); if (st) out[qq.id] = st; return; }
    if (qq.type === 'people') { const pl = cleanPeople_(v); if (pl) out[qq.id] = pl; return; }
    if (qq.type === 'multi') { if (Array.isArray(v)) { const arr = v.map(function (x) { return String(str_(x, 300) || ''); }).filter(Boolean).slice(0, FORM_MAX_OPTIONS); if (arr.length) out[qq.id] = arr; } }
    else { const str = String(v).trim().slice(0, ANSWER_MAX); if (str) out[qq.id] = str; }
  });
  return out;
}
function missingRequired_(answers, form, audience) {
  return askedQuestions_(form, audience).filter(function (qq) {
    if (!qq.required) return false;
    if (qq.type === 'stays') return !staysDone_(answers[qq.id]);
    if (qq.type === 'people') return !(Array.isArray(answers[qq.id]) && answers[qq.id].length);
    return answers[qq.id] === undefined || (Array.isArray(answers[qq.id]) && !answers[qq.id].length);
  }).map(function (qq) { return qq.id; });
}
async function portalSaveForm(username, pin, key, form) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  if (!PORTAL_FORMS_DEFAULT[key]) return { ok: false, err: 'bad_key' };
  const rec = cleanForm_(form, key);
  if (!rec) return { ok: false, err: 'bad_form' };
  const stored = await readJSON('portalForms', {});
  stored[key] = Object.assign(rec, { updated: new Date().toISOString(), updatedBy: me.id });
  await writeJSON('portalForms', stored);
  return { ok: true, form: stored[key], forms: await getForms_() };
}
async function portalResetForm(username, pin, key) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  if (!PORTAL_FORMS_DEFAULT[key]) return { ok: false, err: 'bad_key' };
  const stored = await readJSON('portalForms', {});
  delete stored[key];
  await writeJSON('portalForms', stored);
  return { ok: true, forms: await getForms_() };
}
async function applicantCand_(username, pin) {
  const s = await verifyStaff_(username, pin, true);
  if (!s || !isApplicant_(s)) return { out: { ok: false, err: 'auth' } };
  const rows = await getCandidates_();
  const cand = await candidateFor_(rows, s);
  if (!cand) return { out: { ok: false, err: 'no_application' } };
  if (cand.archived) return { out: { ok: false, err: 'closed' } };
  return { s: s, rows: rows, cand: cand };
}
/* Every change saves — the form is long and phones lose pages. */
async function portalSaveDraft(username, pin, answers) {
  const a = await applicantCand_(username, pin); if (a.out) return a.out;
  const cand = a.cand;
  cand.portal = cand.portal || {};
  if (cand.portal.submittedAt) return { ok: false, err: 'submitted' };
  const form = (await getForms_())[formKeyOf_(cand)];
  cand.portal.draft = cleanAnswers_(answers, form, audienceOf_(cand));
  cand.portal.draftAt = new Date().toISOString();
  await writeJSON('candidates', a.rows);
  if (cand.type === 'team') await syncTeamTrip_(cand, a.s.id);
  return { ok: true, savedAt: cand.portal.draftAt, answers: cand.portal.draft };
}
async function portalSubmit(username, pin, answers) {
  const a = await applicantCand_(username, pin); if (a.out) return a.out;
  const cand = a.cand;
  cand.portal = cand.portal || {};
  if (cand.portal.submittedAt) return { ok: false, err: 'submitted' };
  const form = (await getForms_())[formKeyOf_(cand)], audience = audienceOf_(cand);
  const merged = cleanAnswers_(answers !== undefined && answers !== null ? answers : (cand.portal.draft || {}), form, audience);
  const missing = missingRequired_(merged, form, audience);
  if (missing.length) return { ok: false, err: 'missing', missing: missing };
  const now = new Date().toISOString();
  cand.portal.form = { answers: merged, submittedAt: now, audience: audience, formKey: formKeyOf_(cand) };
  cand.portal.submittedAt = now; cand.portal.draft = null; cand.portal.draftAt = null;
  if (cand.stage === 'new') {
    cand.stage = 'applied';
    cand.log = (Array.isArray(cand.log) ? cand.log : []).concat([{ at: now, by: a.s.id, kind: 'stage', text: 'applied' }]).slice(-CAND_LOG_MAX);
  }
  cand.updated = now; cand.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  await syncTeamTrip_(cand, a.s.id);   // a team shows up in the Teams Database the day it applies
  return portalBoot(username, pin);
}
/* After submitting, the applicant may still correct their answers — teams in
   particular apply with estimated dates and head counts and firm them up
   later. The whole answer set is replaced (required still checked), the
   record logs that the applicant changed it, and the stage is left alone. */
async function portalUpdateAnswers(username, pin, answers) {
  const a = await applicantCand_(username, pin); if (a.out) return a.out;
  const cand = a.cand;
  cand.portal = cand.portal || {};
  if (!cand.portal.submittedAt || !cand.portal.form) return { ok: false, err: 'not_submitted' };
  if (cand.archived) return { ok: false, err: 'closed' };
  const form = (await getForms_())[formKeyOf_(cand)], audience = audienceOf_(cand);
  const merged = cleanAnswers_(answers && typeof answers === 'object' ? answers : {}, form, audience);
  const missing = missingRequired_(merged, form, audience);
  if (missing.length) return { ok: false, err: 'missing', missing: missing };
  const now = new Date().toISOString();
  cand.portal.form.answers = merged; cand.portal.form.updatedAt = now;
  cand.log = (Array.isArray(cand.log) ? cand.log : []).concat([{ at: now, by: a.s.id, kind: 'note', text: 'Updated their application answers' }]).slice(-CAND_LOG_MAX);
  cand.updated = now; cand.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  await syncTeamTrip_(cand, a.s.id);
  return portalBoot(username, pin);
}
/* ==================== applicant documents ====================
   What an applicant sends us once they have applied, kind by kind. Teams
   for now (the base gives the list for the others later): passport copies
   and a team photo with names are needed; flight itineraries come when the
   flights are booked, and are what we arrange airport transport from.
   Each file is its own blob ('pdoc:<id>'); the record keeps only the list.
   Readable by the applicant themself and by portal staff who may see that
   record — nobody else. */
/* A team sends passport copies for everyone, a team photo with names and the
   flight itineraries first; then comes the visa part — the letter of
   invitation and its supporting documents, `from: 'us'` (staff upload them,
   the team opens them, only staff can remove them), and the team's e-visas. */
const PORTAL_DOC_KINDS = {
  team: [{ id: 'passports', required: true }, { id: 'photo', required: true }, { id: 'flights', required: true },
    { id: 'invitation', required: false, from: 'us' }, { id: 'evisa', required: false }]
};
const PORTAL_DOCS_MAX = 40;
function docKindsFor_(c) { return PORTAL_DOC_KINDS[c && c.type] || []; }
function docsOf_(c) { return (c && c.portal && Array.isArray(c.portal.docs)) ? c.portal.docs : []; }
function docsRequiredIn_(c) {
  const kinds = docKindsFor_(c).filter(function (k) { return k.required; });
  if (!kinds.length) return false;
  const have = docsOf_(c);
  return kinds.every(function (k) { return have.some(function (d) { return d && d.kind === k.id; }); });
}
function docMeta_(d) { return { id: d.id, kind: d.kind, name: d.name, mime: d.mime, size: d.size, added: d.added, by: d.by }; }
/* whose record, and may this person touch its documents */
async function docCand_(username, pin, candidateId) {
  if (candidateId) return portalStaffCand_(username, pin, candidateId);
  const a = await applicantCand_(username, pin); if (a.out) return a;
  return Object.assign(a, { own: true });
}
async function portalUploadDoc(username, pin, kind, name, mime, base64, candidateId) {
  const a = await docCand_(username, pin, candidateId); if (a.out) return a.out;
  const cand = a.cand;
  const kindDef = docKindsFor_(cand).filter(function (k) { return k.id === kind; })[0];
  if (!kindDef) return { ok: false, err: 'bad_kind' };
  if (a.own && kindDef.from === 'us') return { ok: false, err: 'from_us' };
  // documents come after applying — except one the form itself asks to attach (a team's flight itinerary)
  if (a.own && !(cand.portal && cand.portal.submittedAt)) {
    const form = (await getForms_())[formKeyOf_(cand)];
    const inForm = askedQuestions_(form, audienceOf_(cand)).some(function (qq) { return qq.attach === kind; });
    if (!inForm) return { ok: false, err: 'not_submitted' };
  }
  mime = str_(mime, 80);
  if (HR_FILE_MIME.indexOf(mime) === -1) return { ok: false, err: 'bad_type' };
  if (typeof base64 !== 'string' || !base64) return { ok: false, err: 'bad_file' };
  if (base64.length > HR_FILE_MAX_B64) return { ok: false, err: 'too_large' };
  cand.portal = cand.portal || {};
  const list = docsOf_(cand);
  if (list.length >= PORTAL_DOCS_MAX) return { ok: false, err: 'too_many' };
  const meta = { id: 'pd' + pinSalt_(), kind: kind, name: str_(name, 160) || 'file', mime: mime, size: Math.floor(base64.length * 3 / 4), added: new Date().toISOString(), by: a.s.id };
  await writeJSON('pdoc:' + meta.id, { id: meta.id, candidateId: cand.id, kind: kind, name: meta.name, mime: mime, data: base64, added: meta.added, by: a.s.id });
  cand.portal.docs = list.concat([meta]);
  cand.updated = meta.added; cand.updatedBy = a.s.id;
  teamAutoStage_(cand, a.s.id);   // the last document in moves a team on to its 2nd call
  await writeJSON('candidates', a.rows);
  return { ok: true, doc: docMeta_(meta), docs: cand.portal.docs.map(docMeta_), application: portalAppOut_(cand) };
}
async function findDoc_(username, pin, docId) {
  docId = str_(docId, 60);
  const s = await verifyStaff_(username, pin, true);
  if (!s) return { out: { ok: false } };
  const rows = await getCandidates_();
  const cand = rows.find(function (c) { return docsOf_(c).some(function (d) { return d && d.id === docId; }); });
  if (!cand) return { out: { ok: false, err: 'not_found' } };
  if (isApplicant_(s)) {
    const mine = await candidateFor_(rows, s);
    if (!mine || mine.id !== cand.id) return { out: { ok: false, err: 'not_found' } };
  } else if (!(canPortal_(s) || canHR_(s)) || (!canHR_(s) && !portalMaySee_(s, cand))) return { out: { ok: false, err: 'not_authorized' } };
  return { s: s, rows: rows, cand: cand, docId: docId };
}
async function portalGetDoc(username, pin, docId) {
  const f = await findDoc_(username, pin, docId); if (f.out) return f.out;
  const blob = await readJSON('pdoc:' + f.docId, null);
  if (!blob || !blob.data) return { ok: false, err: 'not_found' };
  return { ok: true, id: blob.id, name: blob.name, mime: blob.mime, dataUrl: 'data:' + blob.mime + ';base64,' + blob.data };
}
async function portalDeleteDoc(username, pin, docId) {
  const f = await findDoc_(username, pin, docId); if (f.out) return f.out;
  if (isApplicant_(f.s)) {
    const doc = docsOf_(f.cand).filter(function (d) { return d.id === f.docId; })[0];
    const def = doc && docKindsFor_(f.cand).filter(function (k) { return k.id === doc.kind; })[0];
    if (def && def.from === 'us') return { ok: false, err: 'from_us' };
  }
  f.cand.portal.docs = docsOf_(f.cand).filter(function (d) { return d.id !== f.docId; });
  f.cand.updated = new Date().toISOString(); f.cand.updatedBy = f.s.id;
  await writeJSON('candidates', f.rows);
  try { await store().delete('pdoc:' + f.docId); } catch (e) { /* the record is already clean */ }
  return { ok: true, docs: f.cand.portal.docs.map(docMeta_), application: portalAppOut_(f.cand) };
}
/* ==================== view as applicant (staff side) ====================
   What a given applicant sees — their dashboard and form, built by the very
   same functions their own portalBoot uses — so staff can check what an edit
   looks like from the other side. Either one real record (scope applies) or
   a sample applicant of a chosen kind, audience and stage. Read-only: the
   reply is just data; nothing is written. */
const PREVIEW_STAGES = CAND_STAGES;
async function portalViewAs(username, pin, opts) {
  opts = opts && typeof opts === 'object' ? opts : {};
  const forms = await getForms_();
  if (opts.candidateId) {
    const a = await portalStaffCand_(username, pin, opts.candidateId); if (a.out) return a.out;
    const cand = a.cand;
    const rows = await getStaff_();
    const acct = cand.staffId ? rows.find(function (r) { return r.id === cand.staffId && isApplicant_(r); }) : null;
    const me = acct ? portalMeOut_(acct) : { id: '', name: cand.name, username: '', email: cand.email || '', phone: cand.phone || '', messenger: cand.messenger || '', country: cand.country || '', campus: cand.campus || '', type: cand.type, school: cand.school || '' };
    return { ok: true, preview: 'record', role: 'applicant', me: me, application: portalAppOut_(cand), form: forms[formKeyOf_(cand)] };
  }
  const g = await hrGate_(username, pin); if (g.out) return g.out;
  const type = PORTAL_TYPES.indexOf(opts.type) > -1 ? opts.type : 'student';
  const school = type === 'student' ? (PORTAL_SCHOOLS.indexOf(opts.school) > -1 ? opts.school : 'dts') : '';
  const stage = (type === 'team' ? TEAM_STAGES : PREVIEW_STAGES).indexOf(opts.stage) > -1 ? opts.stage : 'new';
  const khmer = opts.audience === 'khmer';
  const campus = PORTAL_CAMPUSES[opts.campus] ? opts.campus : 'siemreap';
  if (school && PORTAL_CAMPUSES[campus].indexOf(school) === -1) return { ok: false, err: 'school_not_at_campus' };
  const idx = portalStageIdx_(stage, type), now = new Date().toISOString();
  const tIdx = function (st) { return portalStageIdx_(st, 'team'); };
  const cand = { id: 'preview', campus: campus, name: type === 'team' ? 'Sample Team' : 'Sample Applicant', type: type, school: school, stage: stage,
    country: khmer ? 'Cambodia' : 'Australia', email: 'sample@example.org', phone: khmer ? '+855 12 345 678' : '+61 400 000 000', messenger: 'whatsapp', source: 'portal',
    portal: { createdAt: now, submittedAt: idx >= portalStageIdx_('applied', type) ? now : null, form: idx >= portalStageIdx_('applied', type) ? { answers: {}, submittedAt: now } : null, draft: null,
      visa: type === 'team' ? { flightsConfirmed: idx >= tIdx('call2'), invitationSent: idx >= tIdx('call2') }
        : { flightsConfirmed: idx >= portalStageIdx_('practical'), invitationSent: idx >= portalStageIdx_('practical') },
      team: { call1: idx >= tIdx('docs') ? now : null, call2: idx >= tIdx('practical') ? now : null },
      referenceDone: idx >= portalStageIdx_('interview'), references: idx >= portalStageIdx_('interview') ? [{ id: 'ref_sample', usedAt: now, leaderName: 'Sample Leader', createdAt: now }] : [] },
    log: [], archived: null, created: now, updated: now };
  const me = { id: 'preview', name: cand.name, username: 'sample', email: cand.email, phone: cand.phone, messenger: 'whatsapp', country: cand.country, campus: campus, type: type, school: school };
  return { ok: true, preview: 'sample', role: 'applicant', me: me, application: portalAppOut_(cand), form: forms[formKeyOf_(cand)] };
}
/* ==================== the leader reference ====================
   International applicants (and every staff / volunteer applicant) send one
   reference from a pastor or leader. The applicant — or staff, from the
   record — makes a link; the leader opens portal.html?ref=<token> with no
   account and fills in the reference form (forms.reference, editable like
   the others). The token is random, kept only as a sha256 hash on the record,
   single-use, and expires after REF_TTL_DAYS; making a new link revokes the
   pending one. The two public handlers answer with the applicant's name and
   the form — nothing else about them. */
const REF_TTL_DAYS = 14;
function refHash_(token) { return hashPin_(String(token), 'reference'); }
function refs_(c) { return (c && c.portal && Array.isArray(c.portal.references)) ? c.portal.references : []; }
function refValid_(ref, now) {
  if (!ref || ref.usedAt) return 'used';
  if (ref.revokedAt || !ref.expiresAt || new Date(ref.expiresAt).getTime() < (now || Date.now())) return 'expired';
  return 'ok';
}
/* What the applicant and the staff see about the reference: nothing about the
   token itself. */
function refState_(c) {
  const list = refs_(c);
  const got = list.filter(function (r) { return r && r.usedAt; }).sort(function (a, b) { return String(b.usedAt).localeCompare(String(a.usedAt)); })[0];
  if (got) return { status: 'received', receivedAt: got.usedAt, leaderName: got.leaderName || '', leaderEmail: got.leaderEmail || '', answers: got.answers || {}, sentAt: got.createdAt || null };
  const open = list.filter(function (r) { return r && refValid_(r) === 'ok'; }).sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); })[0];
  if (open) return { status: 'pending', sentAt: open.createdAt, expiresAt: open.expiresAt };
  const last = list.filter(function (r) { return r && !r.usedAt; }).sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); })[0];
  if (last) return { status: 'expired', sentAt: last.createdAt, expiresAt: last.expiresAt };
  return { status: 'none' };
}
async function portalReferenceLink(username, pin, candidateId) {
  let a;
  if (candidateId) { a = await portalStaffCand_(username, pin, candidateId); if (a.out) return a.out; }
  else { a = await applicantCand_(username, pin); if (a.out) return a.out; }
  const cand = a.cand;
  if (!refNeeded_(cand)) return { ok: false, err: 'not_needed' };
  if (cand.archived) return { ok: false, err: 'closed' };
  cand.portal = cand.portal || {};
  const list = refs_(cand);
  if (list.some(function (r) { return r && r.usedAt; })) return { ok: false, err: 'received' };
  const now = new Date();
  list.forEach(function (r) { if (r && !r.usedAt && !r.revokedAt) r.revokedAt = now.toISOString(); });
  const token = pinSalt_() + pinSalt_() + pinSalt_();
  const ref = { id: 'ref_' + pinSalt_(), hash: refHash_(token), createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + REF_TTL_DAYS * 86400000).toISOString(), by: a.s.id };
  list.push(ref);
  cand.portal.references = list.slice(-10);
  cand.updated = now.toISOString(); cand.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  return { ok: true, token: token, expiresAt: ref.expiresAt, reference: refState_(cand) };
}
async function findRef_(token) {
  token = String(token || '');
  if (!/^[a-f0-9]{24,128}$/.test(token)) return null;
  const h = refHash_(token);
  const rows = await getCandidates_();
  for (const c of rows) {
    const ref = refs_(c).find(function (r) { return r && r.hash === h; });
    if (ref) return { rows: rows, cand: c, ref: ref };
  }
  return null;
}
function refApplyingFor_(c) { return c.type === 'student' ? String(c.school || '').toUpperCase() : c.type; }
async function portalReferenceForm(token) {
  const f = await findRef_(token);
  if (!f) return { ok: false, err: 'invalid' };
  const v = refValid_(f.ref);
  if (v !== 'ok') return { ok: false, err: v };
  return { ok: true, applicantName: f.cand.name, applyingFor: refApplyingFor_(f.cand), expiresAt: f.ref.expiresAt, form: (await getForms_()).reference };
}
async function portalReferenceSubmit(token, answers) {
  const f = await findRef_(token);
  if (!f) return { ok: false, err: 'invalid' };
  const v = refValid_(f.ref);
  if (v !== 'ok') return { ok: false, err: v };
  const form = (await getForms_()).reference;
  const clean = cleanAnswers_(answers && typeof answers === 'object' ? answers : {}, form, 'all');
  const missing = missingRequired_(clean, form, 'all');
  if (missing.length) return { ok: false, err: 'missing', missing: missing };
  const now = new Date().toISOString();
  f.ref.usedAt = now; f.ref.answers = clean;
  f.ref.leaderName = str_(clean.leaderName, 120) || ''; f.ref.leaderEmail = cleanEmail_(clean.leaderEmail) || '';
  f.cand.portal.referenceDone = true;
  f.cand.log = (Array.isArray(f.cand.log) ? f.cand.log : []).concat([{ at: now, by: 'reference', kind: 'note', text: 'Leader reference received' + (f.ref.leaderName ? ' from ' + f.ref.leaderName : '') }]).slice(-CAND_LOG_MAX);
  f.cand.updated = now; f.cand.updatedBy = 'reference';
  await writeJSON('candidates', f.rows);
  return { ok: true, applicantName: f.cand.name };
}
/* Staff-side writes on one record beyond the CRM's own: the visa flags the
   applicant watches for (flights confirmed, letter of invitation sent) and
   corrections to submitted answers. Same gate and scope as the CRM writes. */
async function portalStaffCand_(username, pin, candidateId) {
  const g = await hrGate_(username, pin); if (g.out) return g;
  const rows = await getCandidates_();
  const idx = rows.findIndex(function (r) { return r && r.id === str_(candidateId, 60); });
  if (idx === -1) return { out: { ok: false, err: 'not_found' } };
  if (!canHR_(g.s) && !portalMaySee_(g.s, rows[idx])) return { out: { ok: false, err: 'not_authorized' } };
  return { s: g.s, rows: rows, cand: rows[idx] };
}
async function portalSetVisaFlags(username, pin, candidateId, flags) {
  const a = await portalStaffCand_(username, pin, candidateId); if (a.out) return a.out;
  flags = flags && typeof flags === 'object' ? flags : {};
  a.cand.portal = a.cand.portal || {};
  const visa = Object.assign({}, a.cand.portal.visa || {});
  if (flags.flightsConfirmed !== undefined) visa.flightsConfirmed = !!flags.flightsConfirmed;
  if (flags.invitationSent !== undefined) visa.invitationSent = !!flags.invitationSent;
  a.cand.portal.visa = visa;
  a.cand.updated = new Date().toISOString(); a.cand.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  const staffRows = await getStaff_(); const byId = {}; staffRows.forEach(function (r) { byId[r.id] = r; });
  return { ok: true, candidate: portalCandOut_(a.cand, byId) };
}
/* A staff tick on a team's journey (teamSteps_): the 1st call, the 2nd call
   (cultural orientation) and arrival. The calls are dated flags on the
   record and move the stage forward through teamAutoStage_; Arrived is the
   stage itself, and unticking it steps back to Getting ready. Every change
   is logged. */
async function portalTeamStep(username, pin, candidateId, step, done) {
  const a = await portalStaffCand_(username, pin, candidateId); if (a.out) return a.out;
  const c = a.cand;
  if (c.type !== 'team') return { ok: false, err: 'not_team' };
  if (TEAM_TICKS.indexOf(step) === -1) return { ok: false, err: 'bad_step' };
  done = !!done;
  const now = new Date().toISOString();
  c.portal = c.portal || {};
  const label = { call1: '1st call', call2: '2nd call — cultural orientation', arrived: 'Arrived' }[step];
  c.log = (Array.isArray(c.log) ? c.log : []).concat([{ at: now, by: a.s.id, kind: 'note', text: (done ? '✓ ' : '✗ ') + label }]).slice(-CAND_LOG_MAX);
  if (step === 'arrived') {
    const before = c.stage;
    if (done) c.stage = 'arrived'; else if (c.stage === 'arrived') c.stage = 'practical';
    if (c.stage !== before) c.log = c.log.concat([{ at: now, by: a.s.id, kind: 'stage', text: c.stage }]).slice(-CAND_LOG_MAX);
  } else {
    const flags = Object.assign({}, teamFlags_(c));
    flags[step] = done ? now : null;
    c.portal.team = flags;
    teamAutoStage_(c, a.s.id);
  }
  c.updated = now; c.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  const staffRows = await getStaff_(); const byId = {}; staffRows.forEach(function (r) { byId[r.id] = r; });
  return { ok: true, candidate: portalCandOut_(c, byId) };
}
async function portalStaffSaveAnswers(username, pin, candidateId, answers) {
  const a = await portalStaffCand_(username, pin, candidateId); if (a.out) return a.out;
  const cand = a.cand;
  cand.portal = cand.portal || {};
  const form = (await getForms_())[formKeyOf_(cand)];
  const clean = cleanAnswers_(answers, form, audienceOf_(cand));
  const now = new Date().toISOString();
  if (cand.portal.submittedAt) { cand.portal.form = Object.assign({}, cand.portal.form || {}, { answers: clean, editedAt: now, editedBy: a.s.id }); }
  else { cand.portal.draft = clean; cand.portal.draftAt = now; }
  cand.log = (Array.isArray(cand.log) ? cand.log : []).concat([{ at: now, by: a.s.id, kind: 'note', text: 'Edited the application answers' }]).slice(-CAND_LOG_MAX);
  cand.updated = now; cand.updatedBy = a.s.id;
  await writeJSON('candidates', a.rows);
  await syncTeamTrip_(cand, a.s.id);
  const staffRows = await getStaff_(); const byId = {}; staffRows.forEach(function (r) { byId[r.id] = r; });
  return { ok: true, candidate: portalCandOut_(cand, byId) };
}

/* Delete an application and the applicant account behind it — a duplicate
   sign-up, a test account, someone who asked to be forgotten. Portal admins
   (and app admins) only; permanent. Applicant accounts are not in Admin →
   Accounts, so this is the one place they can be removed. A candidate whose
   staffId points at a real staff account (someone who arrived and got an
   account) loses only the CRM record — a staff account is never deleted here. */
async function portalDeleteApplicant(username, pin, candidateId) {
  const me = await verifyStaff_(username, pin);
  if (!me) return { ok: false };
  if (!isPortalAdmin_(me)) return { ok: false, err: 'not_authorized' };
  const rows = await getCandidates_();
  const idx = rows.findIndex(function (r) { return r && r.id === str_(candidateId, 60); });
  if (idx === -1) return { ok: false, err: 'not_found' };
  const cand = rows[idx];
  const docs = (cand.portal && Array.isArray(cand.portal.docs)) ? cand.portal.docs : [];
  for (const d of docs) { if (d && d.id) { try { await store().delete('pdoc:' + d.id); } catch (e) { /* already gone */ } try { await store().delete('hrfile:' + d.id); } catch (e) { /* already gone */ } } }
  rows.splice(idx, 1);
  await writeJSON('candidates', rows);
  let accountRemoved = false;
  if (cand.staffId) {
    const out = await mutateStaff_(function (all) {
      const i = all.findIndex(function (r) { return r.id === cand.staffId; });
      if (i === -1 || !isApplicant_(all[i])) return { abort: true, ok: true, removed: false };
      all.splice(i, 1);
      return { ok: true, removed: true };
    });
    accountRemoved = !!(out && out.removed);
  }
  const boot = await portalBoot(username, pin);
  return Object.assign({}, boot, { deleted: cand.id, accountRemoved: accountRemoved });
}
async function portalUpdateContact(username, pin, payload) {
  const s = await verifyStaff_(username, pin, true);
  if (!s || !isApplicant_(s)) return { ok: false, err: 'auth' };
  payload = payload && typeof payload === 'object' ? payload : {};
  const phone = cleanPhone_(payload.phone);
  if (!phone) return { ok: false, err: 'phone_required' };
  const messenger = PORTAL_MESSENGERS.indexOf(payload.messenger) > -1 ? payload.messenger : '';
  if (!messenger) return { ok: false, err: 'messenger_required' };
  const country = payload.country !== undefined ? cleanCountry_(payload.country) : s.country;
  const out = await mutateStaff_(function (rows) {
    const idx = rows.findIndex(function (r) { return r.id === s.id; });
    if (idx === -1) return { abort: true, ok: false, err: 'not_found' };
    rows[idx].phone = phone; rows[idx].messenger = messenger; rows[idx].country = country;
    rows[idx].updated = new Date().toISOString();
    return { ok: true };
  });
  if (!out || !out.ok) return out || { ok: false };
  const cands = await getCandidates_();
  const cand = await candidateFor_(cands, s);
  if (cand) {
    cand.phone = phone; cand.messenger = messenger; cand.country = country; cand.updated = new Date().toISOString(); cand.updatedBy = s.id;
    await writeJSON('candidates', cands);
  }
  return portalBoot(username, pin);
}

/* ==================== dispatcher ==================== */
const HANDLERS = {
  getMyBoot: function (a) { return getMyBoot(a[0], a[1]); },
  getData: function (a) { return getData(a[0], a[1]); },
  saveEntries: function (a) { return saveEntries(a[0], a[1], a[2], a[3], a[4]); },
  saveObjective: function (a) { return saveObjective(a[0], a[1], a[2], a[3]); },
  deleteObjective: function (a) { return deleteObjective(a[0], a[1], a[2], a[3]); },
  teamRoster: function (a) { return teamRoster(a[0], a[1]); },
  saveMyPersonality: function (a) { return saveMyPersonality(a[0], a[1], a[2]); },
  saveMyStrengths: function (a) { return saveMyStrengths(a[0], a[1], a[2]); },
  saveMyGStrengths: function (a) { return saveMyGStrengths(a[0], a[1], a[2]); },
  staffRegister: function (a) { return staffRegister(a[0]); },
  staffLogin: function (a) { return staffLogin(a[0], a[1]); },
  grantAdmin: function (a) { return grantAdmin(a[0], a[1], a[2]); },
  adminListStaff: function (a) { return adminListStaff(a[0], a[1]); },
  adminSetActive: function (a) { return adminSetActive(a[0], a[1], a[2], a[3]); },
  adminSetMentor: function (a) { return adminSetMentor(a[0], a[1], a[2], a[3], a[4]); },
  adminResetPin: function (a) { return adminResetPin(a[0], a[1], a[2], a[3]); },
  adminDeleteStaff: function (a) { return adminDeleteStaff(a[0], a[1], a[2]); },
  adminMergeStaff: function (a) { return adminMergeStaff(a[0], a[1], a[2], a[3]); },
  adminUpdateStaff: function (a) { return adminUpdateStaff(a[0], a[1], a[2], a[3]); },
  updateProfile: function (a) { return updateProfile(a[0], a[1], a[2]); },
  changePin: function (a) { return changePin(a[0], a[1], a[2]); },
  uploadPhoto: function (a) { return uploadPhoto(a[0], a[1], a[2], a[3]); },
  uploadDashboardBg: function (a) { return uploadDashboardBg(a[0], a[1], a[2], a[3]); },
  clearDashboardBg: function (a) { return clearDashboardBg(a[0], a[1]); },
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
  setNumbersPeople: function (a) { return setNumbersPeople(a[0], a[1], a[2], a[3], a[4]); },
  getDeptPulse: function (a) { return getDeptPulse(a[0], a[1], a[2]); },
  getStaffDebt: function (a) { return getStaffDebt(a[0], a[1]); },
  saveStaffDebt: function (a) { return saveStaffDebt(a[0], a[1], a[2]); },
  saveMyKpiDay: function (a) { return saveMyKpiDay(a[0], a[1], a[2], a[3]); },
  getMinistryFor: function (a) { return getMinistryFor(a[0], a[1], a[2], a[3]); },
  saveMinistryFor: function (a) { return saveMinistryFor(a[0], a[1], a[2], a[3], a[4], a[5]); },
  saveKpiDayFor: function (a) { return saveKpiDayFor(a[0], a[1], a[2], a[3], a[4], a[5]); },
  saveMyKpiPins: function (a) { return saveMyKpiPins(a[0], a[1], a[2]); },
  staffProfile: function (a) { return staffProfile(a[0], a[1], a[2]); },
  getMyTrips: function (a) { return getMyTrips(a[0], a[1]); },
  saveTrip: function (a) { return saveTrip(a[0], a[1], a[2]); },
  deleteTrip: function (a) { return deleteTrip(a[0], a[1], a[2]); },
  getTripRequests: function (a) { return getTripRequests(a[0], a[1]); },
  respondToTrip: function (a) { return respondToTrip(a[0], a[1], a[2], a[3]); },
  respondToMentorRequest: function (a) { return respondToMentorRequest(a[0], a[1], a[2], a[3]); },
  saveMyWeek: function (a) { return saveMyWeek(a[0], a[1], a[2], a[3]); },
  deleteMyWeek: function (a) { return deleteMyWeek(a[0], a[1], a[2]); },
  getMySmartGoals: function (a) { return getMySmartGoals(a[0], a[1]); },
  saveSmartGoal: function (a) { return saveSmartGoal(a[0], a[1], a[2]); },
  deleteSmartGoal: function (a) { return deleteSmartGoal(a[0], a[1], a[2]); },
  getMyOneOnOnes: function (a) { return getMyOneOnOnes(a[0], a[1]); },
  requestOneOnOne: function (a) { return requestOneOnOne(a[0], a[1], a[2], a[3]); },
  respondToOneOnOne: function (a) { return respondToOneOnOne(a[0], a[1], a[2], a[3]); },
  saveMetricOverrides: function (a) { return saveMetricOverrides(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); },
  renameCustomMetric: function (a) { return renameCustomMetric(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); },
  getMyPersonal: function (a) { return getMyPersonal(a[0], a[1]); },
  saveMyPersonalWeek: function (a) { return saveMyPersonalWeek(a[0], a[1], a[2], a[3]); },
  getTeamTrips: function (a) { return getTeamTrips(a[0], a[1], a[2]); },
  saveTeamTrip: function (a) { return saveTeamTrip(a[0], a[1], a[2]); },
  deleteTeamTrip: function (a) { return deleteTeamTrip(a[0], a[1], a[2]); },
  hrList: function (a) { return hrList(a[0], a[1]); },
  hrSaveContract: function (a) { return hrSaveContract(a[0], a[1], a[2], a[3]); },
  hrSaveStart: function (a) { return hrSaveStart(a[0], a[1], a[2], a[3]); },
  hrDeleteContract: function (a) { return hrDeleteContract(a[0], a[1], a[2], a[3]); },
  hrUploadFile: function (a) { return hrUploadFile(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); },
  hrGetFile: function (a) { return hrGetFile(a[0], a[1], a[2]); },
  hrDeleteFile: function (a) { return hrDeleteFile(a[0], a[1], a[2], a[3], a[4]); },
  hrArchive: function (a) { return hrArchive(a[0], a[1], a[2], a[3]); },
  hrUnarchive: function (a) { return hrUnarchive(a[0], a[1], a[2]); },
  getStructure: function (a) { return getStructure(a[0], a[1], a[2], a[3], a[4]); },
  adminListTrips: function (a) { return adminListTrips(a[0], a[1]); },
  adminDecideTrip: function (a) { return adminDecideTrip(a[0], a[1], a[2], a[3]); },
  adminSaveHolidays: function (a) { return adminSaveHolidays(a[0], a[1], a[2]); },
  saveStructure: function (a) { return saveStructure(a[0], a[1], a[2], a[3], a[4]); },
  saveStructurePlan: function (a) { return saveStructurePlan(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); },
  hrCandidates: function (a) { return hrCandidates(a[0], a[1]); },
  hrSaveCandidate: function (a) { return hrSaveCandidate(a[0], a[1], a[2]); },
  hrCandidateNote: function (a) { return hrCandidateNote(a[0], a[1], a[2], a[3]); },
  hrArchiveCandidate: function (a) { return hrArchiveCandidate(a[0], a[1], a[2], a[3]); },
  getMyBroadcasts: function (a) { return getMyBroadcasts(a[0], a[1]); },
  sendBroadcast: function (a) { return sendBroadcast(a[0], a[1], a[2]); },
  portalRegister: function (a) { return portalRegister(a[0]); },
  portalBoot: function (a) { return portalBoot(a[0], a[1]); },
  portalSetAccess: function (a) { return portalSetAccess(a[0], a[1], a[2], a[3]); },
  portalUpdateContact: function (a) { return portalUpdateContact(a[0], a[1], a[2]); },
  portalDeleteApplicant: function (a) { return portalDeleteApplicant(a[0], a[1], a[2]); },
  portalSaveForm: function (a) { return portalSaveForm(a[0], a[1], a[2], a[3]); },
  portalResetForm: function (a) { return portalResetForm(a[0], a[1], a[2]); },
  portalSaveDraft: function (a) { return portalSaveDraft(a[0], a[1], a[2]); },
  portalSubmit: function (a) { return portalSubmit(a[0], a[1], a[2]); },
  portalUpdateAnswers: function (a) { return portalUpdateAnswers(a[0], a[1], a[2]); },
  portalReferenceLink: function (a) { return portalReferenceLink(a[0], a[1], a[2]); },
  portalViewAs: function (a) { return portalViewAs(a[0], a[1], a[2]); },
  portalUploadDoc: function (a) { return portalUploadDoc(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); },
  portalGetDoc: function (a) { return portalGetDoc(a[0], a[1], a[2]); },
  portalDeleteDoc: function (a) { return portalDeleteDoc(a[0], a[1], a[2]); },
  portalReferenceForm: function (a) { return portalReferenceForm(a[0]); },
  portalReferenceSubmit: function (a) { return portalReferenceSubmit(a[0], a[1]); },
  portalSetVisaFlags: function (a) { return portalSetVisaFlags(a[0], a[1], a[2], a[3]); },
  portalTeamStep: function (a) { return portalTeamStep(a[0], a[1], a[2], a[3], a[4]); },
  portalSaveTeamNumbers: function (a) { return portalSaveTeamNumbers(a[0], a[1], a[2], a[3]); },
  portalStaffSyncTeam: function (a) { return portalStaffSyncTeam(a[0], a[1], a[2]); },
  portalStaffSaveTeamNumbers: function (a) { return portalStaffSaveTeamNumbers(a[0], a[1], a[2], a[3], a[4]); },
  portalStaffSaveAnswers: function (a) { return portalStaffSaveAnswers(a[0], a[1], a[2], a[3]); },
  portalListAccounts: function (a) { return portalListAccounts(a[0], a[1]); },
  portalCreateApplicant: function (a) { return portalCreateApplicant(a[0], a[1], a[2]); },
  portalUpdateAccount: function (a) { return portalUpdateAccount(a[0], a[1], a[2], a[3]); },
  getHospitality: function (a) { return getHospitality(a[0], a[1]); },
  hospSave: function (a) { return hospSave(a[0], a[1], a[2], a[3]); },
  hospDelete: function (a) { return hospDelete(a[0], a[1], a[2], a[3]); },
  hospMoveBed: function (a) { return hospMoveBed(a[0], a[1], a[2], a[3], a[4]); },
  hospImport: function (a) { return hospImport(a[0], a[1], a[2]); },
  getLeadBoard: function (a) { return getLeadBoard(a[0], a[1]); },
  saveLeadCard: function (a) { return saveLeadCard(a[0], a[1], a[2]); },
  deleteLeadCard: function (a) { return deleteLeadCard(a[0], a[1], a[2]); },
  saveLeadSettings: function (a) { return saveLeadSettings(a[0], a[1], a[2]); },
  saveLeadTask: function (a) { return saveLeadTask(a[0], a[1], a[2], a[3]); },
  deleteLeadTask: function (a) { return deleteLeadTask(a[0], a[1], a[2], a[3]); },
  saveLeadNote: function (a) { return saveLeadNote(a[0], a[1], a[2]); },
  getDuty: function (a) { return getDuty(a[0], a[1], a[2], a[3]); },
  saveDuty: function (a) { return saveDuty(a[0], a[1], a[2], a[3], a[4], a[5]); },
  getMySchedules: function (a) { return getMySchedules(a[0], a[1], a[2]); },
  portalSaveTeamMembers: function (a) { return portalSaveTeamMembers(a[0], a[1], a[2]); }
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
    /* One scope per request, so this request's writes are visible to this
       request's reads and to nobody else's. See readJSON. */
    const result = await requestScope.run(new Map(), function () {
      return fn(Array.isArray(body.args) ? body.args : []);
    });
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String((err && err.message) || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
