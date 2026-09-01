/* Admin control: a Base Leadership sign-up needs approval before it can log
   in at all (every other department stays instant), and once someone holds
   isAdmin they can approve/deactivate, reset a PIN, or fix a wrong
   campus/dept/ministry for someone else. The existing leader code stays the
   one thing that can grant isAdmin in the first place. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('admin');
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
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = {
  id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Base Leadership',
  ministry: 'Campus Leadership', role: 'Director', active: true, isAdmin: true,
};
const LEADER_NOT_ADMIN = {
  id: 'st_leader2', name: 'Sina', username: 'sina', campus: 'poipet', dept: 'Base Leadership',
  ministry: 'Community Service Oversight', role: 'Oversight', active: true, isAdmin: false,
};
const STAFF = {
  id: 'st_staff', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, isAdmin: false,
};

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
function seed(extra) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ADMIN, LEADER_NOT_ADMIN, STAFF].concat(extra || []).map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
}

/* ---------- 1. sign-up approval is scoped to Base Leadership only ---------- */
seed();
let r = await call('staffRegister', [{ username: 'newstaff', pin: '5555', name: 'New Staff', dept: 'Community Service', campus: 'poipet' }]);
ok('a non-Base-Leadership sign-up is instant, as before',
  r.body && r.body.ok === true && r.body.staff && !r.body.pending, JSON.stringify(r.body));
r = await call('staffLogin', ['newstaff', '5555']);
ok('and can log in right away', r.body && r.body.ok === true, JSON.stringify(r.body));

seed();
r = await call('staffRegister', [{ username: 'newleader', pin: '5555', name: 'New Leader', dept: 'Base Leadership', campus: 'poipet' }]);
ok('a Base Leadership sign-up comes back pending, no session',
  r.body && r.body.ok === true && r.body.pending === true && !r.body.staff, JSON.stringify(r.body));
const created = (mem.staff || []).find(function (s) { return s.username === 'newleader'; });
ok('and the record itself is inactive', !!created && created.active === false);

r = await call('staffLogin', ['newleader', '5555']);
ok('the right PIN on a pending account reports "pending", not a generic failure',
  r.body && r.body.ok === false && r.body.err === 'pending', JSON.stringify(r.body));
r = await call('staffLogin', ['newleader', '0000']);
ok('a wrong PIN on the same account never leaks "pending"',
  r.body && r.body.ok === false && r.body.err !== 'pending', JSON.stringify(r.body));
r = await call('getMyBoot', ['newleader', '5555']);
ok('and every other handler treats a pending account as no session at all (getMyBoot)',
  r.body && r.body.ok === false && r.body.err === 'auth', JSON.stringify(r.body));

/* ---------- 2. deactivating someone actually blocks login now ---------- */
seed();
r = await call('staffLogin', ['dara', '1234']);
ok('an active account logs in normally', r.body && r.body.ok === true, JSON.stringify(r.body));
mem.staff = mem.staff.map(function (s) { return s.username === 'dara' ? { ...s, active: false } : s; });
r = await call('staffLogin', ['dara', '1234']);
ok('the same right PIN on a now-inactive account is refused',
  r.body && r.body.ok === false, JSON.stringify(r.body));

/* ---------- 3. only the leader code can grant admin, and only to Base Leadership ---------- */
seed();
r = await call('grantAdmin', ['wrongcode', 'dara', true]);
ok('the wrong code cannot grant admin', r.body && r.body.ok === false && r.body.err === 'not_leader');

r = await call('grantAdmin', ['leadercode', 'dara', true]);
ok('the right code still refuses a non-Base-Leadership target',
  r.body && r.body.ok === false && r.body.err === 'not_leadership', JSON.stringify(r.body));
ok('and nothing was written', !(mem.staff || []).find(function (s) { return s.username === 'dara'; }).isAdmin);

r = await call('grantAdmin', ['leadercode', 'sina', true]);
ok('the right code promotes a Base Leadership account',
  r.body && r.body.ok === true && r.body.staff.isAdmin === true, JSON.stringify(r.body));
r = await call('staffLogin', ['sina', '1234']);
ok('and their own login now reflects it', r.body && r.body.ok === true && r.body.staff.isAdmin === true, JSON.stringify(r.body));

r = await call('grantAdmin', ['leadercode', 'sina', false]);
ok('the code can revoke it again', r.body && r.body.ok === true && r.body.staff.isAdmin === false);

/* ---------- 4. the admin-only handlers refuse anyone without isAdmin ---------- */
seed();
for (const fn of ['adminListStaff']) {
  r = await call(fn, ['dara', '1234']);
  ok('non-admin staff is refused: ' + fn, r.body && r.body.ok === false, JSON.stringify(r.body));
  r = await call(fn, ['sina', '1234']); // Base Leadership, but not isAdmin
  ok('Base Leadership without isAdmin is refused: ' + fn, r.body && r.body.ok === false, JSON.stringify(r.body));
}
r = await call('adminSetActive', ['dara', '1234', 'st_staff', false]);
ok('non-admin cannot deactivate anyone', r.body && r.body.ok === false, JSON.stringify(r.body));
r = await call('adminResetPin', ['dara', '1234', 'st_staff', '9999']);
ok('non-admin cannot reset a PIN', r.body && r.body.ok === false, JSON.stringify(r.body));
r = await call('adminUpdateStaff', ['dara', '1234', 'st_staff', { campus: 'siemreap' }]);
ok('non-admin cannot edit someone else’s record', r.body && r.body.ok === false, JSON.stringify(r.body));

/* ---------- 5. what an admin can actually do ---------- */
const PENDING = { id: 'st_pending', name: 'Pending Person', username: 'pending1', campus: 'poipet',
  dept: 'Base Leadership', ministry: '', role: '', active: false, isAdmin: false };
seed([PENDING]);
r = await call('adminListStaff', ['uriah', '1234']);
ok('adminListStaff sees inactive accounts too, unlike the public roster',
  r.body && r.body.ok === true && r.body.staff.some(function (s) { return s.id === 'st_pending' && s.active === false; }),
  JSON.stringify(r.body && r.body.staff));
ok('and never leaks a PIN hash/salt', r.body && !JSON.stringify(r.body).match(/pinHash|pinSalt/));

r = await call('adminSetActive', ['uriah', '1234', 'st_pending', true]);
ok('an admin can approve a pending sign-up', r.body && r.body.ok === true && r.body.staff.active === true, JSON.stringify(r.body));
r = await call('staffLogin', ['pending1', '1234']);
ok('and the approved account can now log in', r.body && r.body.ok === true, JSON.stringify(r.body));

seed();
r = await call('adminSetActive', ['uriah', '1234', 'st_staff', false]);
ok('an admin can deactivate an active account', r.body && r.body.ok === true && r.body.staff.active === false, JSON.stringify(r.body));
r = await call('staffLogin', ['dara', '1234']);
ok('and login is refused right away', r.body && r.body.ok === false, JSON.stringify(r.body));

seed();
r = await call('adminSetActive', ['uriah', '1234', 'does-not-exist', true]);
ok('setting an unknown id is refused, not silently ignored', r.body && r.body.ok === false && r.body.err === 'not_found');

seed();
r = await call('adminResetPin', ['uriah', '1234', 'st_staff', 'abcd']);
ok('a non-4-digit PIN is rejected', r.body && r.body.ok === false && r.body.err === 'bad_pin');
r = await call('adminResetPin', ['uriah', '1234', 'st_staff', '9999']);
ok('a valid reset succeeds', r.body && r.body.ok === true, JSON.stringify(r.body));
r = await call('staffLogin', ['dara', '1234']);
ok('the old PIN no longer works', r.body && r.body.ok === false);
r = await call('staffLogin', ['dara', '9999']);
ok('the new PIN does', r.body && r.body.ok === true, JSON.stringify(r.body));

seed();
// Lock the account out, then confirm a reset clears the lockout too.
for (let i = 0; i < 5; i++) await call('staffLogin', ['dara', '0000']);
r = await call('staffLogin', ['dara', '1234']);
ok('five bad attempts lock the account even with the right PIN', r.body && r.body.ok === false, JSON.stringify(r.body));
await call('adminResetPin', ['uriah', '1234', 'st_staff', '9999']);
r = await call('staffLogin', ['dara', '9999']);
ok('resetting the PIN also lifts the lockout', r.body && r.body.ok === true, JSON.stringify(r.body));

seed();
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_staff', { campus: 'siemreap', dept: 'Youth Education', ministry: 'YDC' }]);
ok('an admin can fix a wrong campus/dept/ministry',
  r.body && r.body.ok === true && r.body.staff.campus === 'siemreap' && r.body.staff.dept === 'Youth Education',
  JSON.stringify(r.body));
r = await call('staffLogin', ['dara', '1234']);
ok('the PIN is untouched by that edit', r.body && r.body.ok === true, JSON.stringify(r.body));
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_staff', { isAdmin: true, active: false }]);
ok('adminUpdateStaff cannot be used to grant admin or deactivate — those stay in their own handlers',
  r.body && r.body.ok === true && r.body.staff.isAdmin === false && r.body.staff.active === true, JSON.stringify(r.body));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
