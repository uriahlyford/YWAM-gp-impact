/* Email is required at sign-up now, and is the one thing a duplicate
   account is checked against — not name, since two people can share a
   name but never an inbox. adminMergeStaff is the cleanup tool for the
   duplicate that already exists: everything keyed by staffId (daily logs,
   weekly goals, leave requests, SMART goals, 1-on-1s) moves onto the kept
   account, and the weekly health check-in moves the same way but by its
   survey token, since that's what keeps it anonymous. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('staff-email');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet',
  dept: 'Base Leadership', ministry: 'Campus Leadership', role: '', active: true, isAdmin: true, email: 'uriah@example.com' };

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return JSON.parse(await res.text());
}
const fails = [];
const check = (n, c, d) => { console.log((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : '  ← ' + d)); if (!c) fails.push(n); };
function seed(extra) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ADMIN].concat(extra || []).map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
}

/* ---------- registration requires a real, unique email ---------- */
seed();
let r = await call('staffRegister', [{ username: 'noemail', pin: '1111', name: 'No Email', campus: 'poipet', dept: 'Community Service' }]);
check('missing email is refused', r.ok === false && r.err === 'email_required', JSON.stringify(r));

r = await call('staffRegister', [{ username: 'bademail', pin: '1111', name: 'Bad Email', email: 'not-an-email', campus: 'poipet', dept: 'Community Service' }]);
check('a malformed email is refused', r.ok === false && r.err === 'bad_email', JSON.stringify(r));

r = await call('staffRegister', [{ username: 'sokha', pin: '1111', name: 'Sokha', email: 'Sokha@Example.com', campus: 'poipet', dept: 'Community Service' }]);
check('a valid email registers fine', r.ok === true, JSON.stringify(r));
check('the email is stored normalised (trimmed, lowercased)', (mem.staff.find(s => s.username === 'sokha') || {}).email === 'sokha@example.com',
  JSON.stringify(mem.staff.find(s => s.username === 'sokha')));

r = await call('staffRegister', [{ username: 'sokha2', pin: '2222', name: 'Sokha Duplicate', email: '  sokha@example.com  ', campus: 'poipet', dept: 'Community Service' }]);
check('the same email (different case/whitespace) is refused', r.ok === false && r.err === 'email_taken', JSON.stringify(r));
check('and no second account was created', mem.staff.filter(s => s.username.indexOf('sokha') === 0).length === 1);

/* ---------- updateProfile: set/change email, same uniqueness rule ---------- */
seed([
  { id: 'st_a', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', active: true, isAdmin: false, email: 'dara@example.com' },
  { id: 'st_b', name: 'Nosy', username: 'nosy', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', active: true, isAdmin: false, email: '' }
]);
r = await call('updateProfile', ['nosy', '1234', { email: 'dara@example.com' }]);
check('cannot take a teammate’s email', r.ok === false && r.err === 'email_taken', JSON.stringify(r));
r = await call('updateProfile', ['nosy', '1234', { email: 'Nosy@Example.com' }]);
check('adding your own email works from a blank start', r.ok === true && r.profile.email === 'nosy@example.com', JSON.stringify(r));

/* ---------- adminMergeStaff: the real cleanup tool ---------- */
seed([
  { id: 'st_real', name: 'Kimla', username: 'kimla', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe',
    active: true, isAdmin: false, email: 'kimla@example.com', mentorId: '', mentorStatus: '' },
  { id: 'st_dup', name: 'Kimla (2)', username: 'kimla2', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe',
    active: true, isAdmin: false, email: '', mentorId: '', mentorStatus: '' },
  { id: 'st_mentee', name: 'Sina', username: 'sina', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams',
    active: true, isAdmin: false, email: 'sina@example.com', mentorId: 'st_dup', mentorStatus: 'approved' }
]);
mem.dailyLogs = [
  { staffId: 'st_real', date: '2026-07-20', week: 30, clarity: 8, growth: 7, lonely: 2, porn: false, habits: {} },
  { staffId: 'st_dup', date: '2026-07-21', week: 30, clarity: 6, growth: 6, lonely: 3, porn: false, habits: {} },
  // same day on both — the kept account's own row must survive untouched.
  { staffId: 'st_real', date: '2026-07-22', week: 30, clarity: 9, growth: 9, lonely: 1, porn: false, habits: {} },
  { staffId: 'st_dup', date: '2026-07-22', week: 30, clarity: 1, growth: 1, lonely: 9, porn: true, habits: {} }
];
mem.goals = [
  { staffId: 'st_dup', week: 31, year: 2026, items: [{ text: 'Duplicate’s own goal', pct: 50 }], updated: '' }
];
mem.trips = [{ id: 'tr1', staffId: 'st_dup', campus: 'poipet', from: '2026-08-01', to: '2026-08-03', type: 'personal', status: 'pending' }];
mem.smartGoals = [{ id: 'sg1', staffId: 'st_dup', year: 2026, category: 'Faith', title: 'Read the whole Bible', meta: '', pct: 20 }];
mem.oneOnOnes = [{ id: 'oo1', fromId: 'st_dup', toId: 'st_mentee', status: 'accepted', note: '', created: '', updated: '', decidedAt: '' }];
mem.survey = [
  { device: 'tok_real', campus: 'poipet', week: 30, year: 2026, lonely: 2, clarity: 8, growth: 7, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0 },
  { device: 'tok_dup', campus: 'poipet', week: 32, year: 2026, lonely: 4, clarity: 6, growth: 6, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0 }
];
mem.staff = mem.staff.map(s => s.id === 'st_real' ? { ...s, surveyToken: 'tok_real' } : s.id === 'st_dup' ? { ...s, surveyToken: 'tok_dup' } : s);

r = await call('adminMergeStaff', ['dara', '1234', 'st_real', 'st_dup']);
check('a non-admin cannot merge accounts', r.ok === false, JSON.stringify(r));

r = await call('adminMergeStaff', ['uriah', '1234', 'st_real', 'st_real']);
check('merging an account into itself is refused', r.ok === false && r.err === 'bad_ids');

r = await call('adminMergeStaff', ['uriah', '1234', 'st_real', 'st_dup']);
check('an admin can merge two accounts', r.ok === true, JSON.stringify(r));

check('the duplicate account is gone', !mem.staff.some(s => s.id === 'st_dup'));
check('the kept account is still there', mem.staff.some(s => s.id === 'st_real'));

const daily2026_07_21 = mem.dailyLogs.find(d => d.date === '2026-07-21');
check('a day only the duplicate logged moves onto the kept account', daily2026_07_21 && daily2026_07_21.staffId === 'st_real', JSON.stringify(daily2026_07_21));
const daily2026_07_22 = mem.dailyLogs.filter(d => d.date === '2026-07-22');
check('a day BOTH logged keeps the kept account’s own row untouched',
  daily2026_07_22.some(d => d.staffId === 'st_real' && d.clarity === 9), JSON.stringify(daily2026_07_22));
check('and the duplicate’s conflicting row for that same day is left behind, not merged over it',
  daily2026_07_22.some(d => d.staffId === 'st_dup'), JSON.stringify(daily2026_07_22));

check('the duplicate’s weekly goal moves over (no conflict — kept account had none for week 31)',
  mem.goals.some(g => g.staffId === 'st_real' && g.week === 31), JSON.stringify(mem.goals));
check('the duplicate’s leave request moves over', mem.trips.some(t => t.id === 'tr1' && t.staffId === 'st_real'), JSON.stringify(mem.trips));
check('the duplicate’s SMART goal moves over', mem.smartGoals.some(g => g.id === 'sg1' && g.staffId === 'st_real'), JSON.stringify(mem.smartGoals));
check('the duplicate’s 1-on-1 moves over, both directions checked', mem.oneOnOnes.some(o => o.id === 'oo1' && o.fromId === 'st_real'), JSON.stringify(mem.oneOnOnes));

const survey30 = mem.survey.find(s => s.week === 30);
check('week 30’s check-in (only the kept account had one) is untouched', survey30 && survey30.device === 'tok_real', JSON.stringify(survey30));
const survey32 = mem.survey.find(s => s.week === 32);
check('the duplicate’s week 32 check-in moves onto the kept account’s own token',
  survey32 && survey32.device === 'tok_real', JSON.stringify(survey32));

const menteeAfter = mem.staff.find(s => s.id === 'st_mentee');
check('a mentee pointing at the deleted duplicate as mentor is cleared, not left dangling',
  menteeAfter && menteeAfter.mentorId === '' && menteeAfter.mentorStatus === '', JSON.stringify(menteeAfter));

r = await call('staffLogin', ['kimla2', '1234']);
check('the deleted duplicate can no longer log in', r.ok === false);

console.log(fails.length ? '\n' + fails.length + ' FAILED:\n - ' + fails.join('\n - ')
                         : '\nall staff-email/merge checks passed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fails.length ? 1 : 0);
