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
    leads: leadsOf_(s)
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

async function teamRoster() {
  const rows = await getStaff_();
  return rows.filter(function (s) { return s.active && !isApplicant_(s); }).map(publicStaff_);
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
    leads: leadsOf_(s),
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
      dashboardColor: rec.dashboardColor || '', dashboardBg: rec.dashboardBg || '', email: rec.email || ''
    }
  };
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
    trips: { trips: menteeTrips.map(tripOut_), totals: awayTotals_(menteeTrips), ptoCap: PTO_ANNUAL_CAP },
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

   'Base Director' is the old name for what is now the Campus Leadership
   department; profiles created before the rename still carry it. */
function deptOf_(s) { return normDept_(s.dept); }

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

async function ministryDataFor_(s) {
  const d = await ministryDataFor2_(s.campus, s.dept, s.ministry);
  d.pins = Array.isArray(s.kpiPins) ? s.kpiPins : [];
  return d;
}

async function getMyMinistry(username, pin) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  return ministryDataFor_(s);
}

/* A department's own "Campus Leadership" ministry oversees every ministry
   under that real department — the same relationship getDepartments()
   encodes on the client (dept:'Campus Leadership', ministry: e.g. 'Community
   Service'). That overseer can log on behalf of any ministry in their own
   department; nobody else gets to log outside their own ministry — except
   an admin, who can jump to and log any ministry on their own campus (the
   "YWAM {campus} Ministries" picker on My Ministry). */
function canLogFor_(s, campus, dept, ministry) {
  if (campus !== s.campus) return false;
  if (s.isAdmin) return true;
  if (dept === s.dept && ministry === s.ministry) return true;
  return s.dept === 'Campus Leadership' && s.ministry === dept;
}

async function getMinistryFor(username, pin, dept, ministry) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canLogFor_(s, s.campus, dept, ministry)) return { ok: false, err: 'not_authorized' };
  return ministryDataFor2_(s.campus, dept, ministry);
}

async function saveMinistryInternal_(campus, dept, ministry, week, updates) {
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
    if (idx > -1) { rows[idx].value = value; rows[idx].updated = now; }
    else rows.push({ campus: campus, dept: dept, ministry: ministry, metric: metric, week: wk, year: yr, value: value, updated: now });
  });
  await writeJSON('entries', rows);
  return { ok: true };
}

async function saveMyMinistry(username, pin, week, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!s.ministry) return { ok: false, err: 'no_ministry' };
  await saveMinistryInternal_(s.campus, s.dept, s.ministry, week, updates);
  return getMyMinistry(username, pin);
}

async function saveMinistryFor(username, pin, dept, ministry, week, updates) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  if (!canLogFor_(s, s.campus, dept, ministry)) return { ok: false, err: 'not_authorized' };
  await saveMinistryInternal_(s.campus, dept, ministry, week, updates);
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
    if (ei > -1) { entries[ei].value = total; entries[ei].updated = now; }
    else entries.push({ campus: campus, dept: dept, ministry: ministry, metric: metric, week: wk, year: dayYear, value: total, updated: now });
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

async function getTrips_() { return readJSON('trips', []); }

function isDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function tripDays_(from, to) {
  const a = new Date(from + 'T00:00:00Z'), b = new Date(to + 'T00:00:00Z');
  return Math.round((b - a) / 86400000) + 1;
}
function workDays_(from, to) {
  const a = new Date(from + 'T00:00:00Z'), b = new Date(to + 'T00:00:00Z');
  let n = 0;
  for (let d = new Date(a); d <= b; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
}
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
    const wd = r.workDays != null ? r.workDays : workDays_(r.from, r.to);
    out[year][leaveTypeOf_(r)] += wd;
    out[year].trips += 1;
  });
  return out;
}

function tripOut_(r) {
  return {
    id: r.id, from: r.from, to: r.to, days: r.days,
    type: leaveTypeOf_(r), workDays: r.workDays != null ? r.workDays : workDays_(r.from, r.to),
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
    ok: true, trips: mine.map(tripOut_), totals: awayTotals_(mine), ptoCap: PTO_ANNUAL_CAP,
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
    ok: true, ptoCap: PTO_ANNUAL_CAP,
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
    staff: Object.assign(publicStaff_(s), { isAdmin: !!s.isAdmin, hr: !!s.hr, portalStaff: !!s.portalStaff, portalAdmin: !!s.portalAdmin }),
    profile: {
      phone: s.phone, joined: s.joined, debt: s.debt, mentorStatus: s.mentorStatus || '',
      dashboardColor: s.dashboardColor || '', dashboardBg: s.dashboardBg || '', email: s.email || ''
    },
    roster: (staffRows || []).filter(function (r) { return r.active && !isApplicant_(r); }).map(publicStaff_),
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
async function getStructure(username, pin, campus, year, quarter) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  campus = str_(campus, 40) || s.campus;
  const y = finiteNum_(year, 2020, 2100) || currentYear_();
  const q = finiteNum_(quarter, 1, 4) || currentQuarter_();
  const found = structFind_(await getStructures_(), campus, y, q);
  return { ok: true, campus: campus, year: y, quarter: q, doc: found.doc, source: found.source };
}
async function saveStructure(username, pin, campus, year, quarter) {
  const admin = await adminGate_(username, pin);
  if (!admin) return { ok: false };
  campus = str_(campus, 40) || admin.campus;
  const y = finiteNum_(year, 2020, 2100), q = finiteNum_(quarter, 1, 4);
  if (y == null || q == null) return { ok: false, err: 'bad_quarter' };
  const people = (await getStaff_()).filter(function (r) { return r.active && !r.archived && r.campus === campus; })
    .map(function (r) { return { id: r.id, name: r.name, dept: r.dept, ministry: r.ministry || '', role: r.role || '', leads: leadsOf_(r), photo: '' }; })
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
  const from = isoDate_(t.from), to = isoDate_(t.to);
  if (!name || !from || !to || to < from) return null;
  const rec = {
    id: str_(t.id, 60) || ('tt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
    campus: campus, name: name, org: str_(t.org, 120), country: str_(t.country, 60), from: from, to: to,
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
    Object.keys(t.metrics || {}).forEach(function (m) { add(m, t.metrics[m]); });
  });
  return Object.keys(acc).map(function (k) { return acc[k]; });
}
async function withTeamRows_(rows) {
  const derived = teamEntryRows_(await getTeamTrips_());
  if (!derived.length) return rows;
  const keyOf = function (r) { return r.campus + '|' + yearOf_(r) + '|' + Number(r.week) + '|' + r.metric; };
  const dk = {};
  derived.forEach(function (r) { dk[keyOf(r)] = 1; });
  return rows.filter(function (r) { return !(r.dept === TEAM_DEPT && r.ministry === TEAM_MIN && dk[keyOf(r)]); }).concat(derived);
}
async function getTeamTrips(username, pin, campus) {
  const s = await verifyStaff_(username, pin);
  if (!s) return { ok: false };
  campus = str_(campus, 40) || s.campus;
  const trips = (await getTeamTrips_()).filter(function (t) { return t.campus === campus; })
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
  if (idx > -1) rows[idx] = tomb; else rows.push(tomb);
  await writeJSON('teamTrips', rows);
  return getTeamTrips(username, pin, cur.campus);
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
  return out;
}
/* A contract covers this base only; many staff served YWAM elsewhere first.
   `ywamSince` is the year they joined YWAM anywhere — a fact about the
   person, not the contract — so "Serving in Siem Reap since 2021" and "In
   YWAM since 2003" can both be true. Set from the contract form. */
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
const CAND_FOLLOWUP_DAYS = 7, CAND_MAX = 2000, CAND_LOG_MAX = 300;
async function getCandidates_() { return readJSON('candidates', []); }
function cleanCandidate_(c, prev, me) {
  if (!c || typeof c !== 'object') return null;
  const name = str_(c.name, 120);
  if (!name) return null;
  const type = CAND_TYPES.indexOf(c.type) > -1 ? c.type : (prev ? prev.type : 'staff');
  const stage = CAND_STAGES.indexOf(c.stage) > -1 ? c.stage : (prev ? prev.stage : 'new');
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
function canPortal_(s) { return !!(s && !isApplicant_(s) && s.active !== false && (s.isAdmin || s.portalAdmin || s.portalStaff)); }
function isPortalAdmin_(s) { return !!(s && !isApplicant_(s) && s.active !== false && (s.isAdmin || s.portalAdmin)); }
/* Which kinds of application a portal staff member works. Outreach Teams
   hosts the short-term teams, so someone on that ministry sees team
   applications and nothing else; everyone else with access sees them all.
   null means "all". Admins and portal admins always see all. */
function portalTypes_(s) {
  if (!s || isPortalAdmin_(s)) return null;
  if (deptOf_(s) === TEAM_DEPT && s.ministry === TEAM_MIN) return ['team'];
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
function portalStageIdx_(stage) { const i = PORTAL_STAGE_ORDER.indexOf(stage); return i === -1 ? 0 : i; }
/* What the applicant is told, derived on the server from the record so the
   dashboard and the staff view can never disagree about where someone is. */
function portalStatus_(c) {
  if (c.archived) return 'closed';
  const submitted = !!(c.portal && c.portal.submittedAt);
  if (c.stage === 'new') return submitted ? 'pending' : 'draft';
  if (c.stage === 'applied') return 'pending';
  if (c.stage === 'contacted') return 'in_review';
  return c.stage;   // interview | accepted | practical | arrived
}
function portalSteps_(c) {
  const idx = portalStageIdx_(c.stage);
  const submitted = !!(c.portal && c.portal.submittedAt) || idx >= portalStageIdx_('applied');
  const docsDone = !!(c.portal && c.portal.docsDone);
  const refNeeded = refNeeded_(c);
  const refDone = !refNeeded || !!(c.portal && c.portal.referenceDone);
  const at = function (stage) { return idx >= portalStageIdx_(stage); };
  const docItems = [{ id: 'documents', done: docsDone || at('interview') }];
  if (refNeeded) docItems.push({ id: 'reference', done: refDone || at('interview') });
  const steps = [
    { id: 'account', done: true },
    { id: 'form', done: submitted },
    { id: 'received', done: submitted },
    { id: 'contact', done: at('contacted') },
    { id: 'docs', done: at('interview') || (docsDone && refDone), items: docItems },
    { id: 'interview', done: at('accepted') },
    { id: 'accepted', done: at('practical') },
    { id: 'practical', done: at('arrived') },
    { id: 'arrived', done: at('arrived') }
  ];
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
    portal: { createdAt: now, submittedAt: null, form: null, docs: [], references: [] },
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
    return { ok: true, role: 'applicant', me: portalMeOut_(s), application: portalAppOut_(cand), form: (await getForms_())[formKeyOf_(cand)] };
  }
  if (!canPortal_(s)) return { ok: false, err: 'not_authorized' };
  const rows = await getStaff_();
  const byId = {}; rows.forEach(function (r) { byId[r.id] = r; });
  return {
    ok: true, role: portalRole_(s), me: portalStaffOut_(s),
    applicants: cands.filter(function (c) { return portalMaySee_(s, c); }).map(function (c) { return portalCandOut_(c, byId); }),
    scope: portalTypes_(s),
    staff: rows.filter(function (r) { return canPortal_(r); }).map(portalStaffOut_),
    stages: CAND_STAGES, types: PORTAL_TYPES, schools: PORTAL_SCHOOLS, campuses: PORTAL_CAMPUSES,
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
const FORM_TYPES = ['short', 'long', 'choice', 'multi', 'yesno', 'date', 'number', 'email', 'phone'];
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
        audience: FORM_AUDIENCES.indexOf(qq.audience) > -1 ? qq.audience : 'all',
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
    if (qq.type === 'multi') { if (Array.isArray(v)) { const arr = v.map(function (x) { return String(str_(x, 300) || ''); }).filter(Boolean).slice(0, FORM_MAX_OPTIONS); if (arr.length) out[qq.id] = arr; } }
    else { const str = String(v).trim().slice(0, ANSWER_MAX); if (str) out[qq.id] = str; }
  });
  return out;
}
function missingRequired_(answers, form, audience) {
  return askedQuestions_(form, audience).filter(function (qq) { return qq.required && (answers[qq.id] === undefined || (Array.isArray(answers[qq.id]) && !answers[qq.id].length)); }).map(function (qq) { return qq.id; });
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
  return portalBoot(username, pin);
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
  for (const d of docs) { if (d && d.id) { try { await store().delete('hrfile:' + d.id); } catch (e) { /* already gone */ } } }
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
  teamRoster: function () { return teamRoster(); },
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
  hrDeleteContract: function (a) { return hrDeleteContract(a[0], a[1], a[2], a[3]); },
  hrUploadFile: function (a) { return hrUploadFile(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); },
  hrGetFile: function (a) { return hrGetFile(a[0], a[1], a[2]); },
  hrDeleteFile: function (a) { return hrDeleteFile(a[0], a[1], a[2], a[3], a[4]); },
  hrArchive: function (a) { return hrArchive(a[0], a[1], a[2], a[3]); },
  hrUnarchive: function (a) { return hrUnarchive(a[0], a[1], a[2]); },
  getStructure: function (a) { return getStructure(a[0], a[1], a[2], a[3], a[4]); },
  adminListTrips: function (a) { return adminListTrips(a[0], a[1]); },
  adminDecideTrip: function (a) { return adminDecideTrip(a[0], a[1], a[2], a[3]); },
  saveStructure: function (a) { return saveStructure(a[0], a[1], a[2], a[3], a[4]); },
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
  portalReferenceForm: function (a) { return portalReferenceForm(a[0]); },
  portalReferenceSubmit: function (a) { return portalReferenceSubmit(a[0], a[1]); },
  portalSetVisaFlags: function (a) { return portalSetVisaFlags(a[0], a[1], a[2], a[3]); },
  portalStaffSaveAnswers: function (a) { return portalStaffSaveAnswers(a[0], a[1], a[2], a[3]); },
  portalListAccounts: function (a) { return portalListAccounts(a[0], a[1]); },
  portalCreateApplicant: function (a) { return portalCreateApplicant(a[0], a[1], a[2]); },
  portalUpdateAccount: function (a) { return portalUpdateAccount(a[0], a[1], a[2], a[3]); }
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
