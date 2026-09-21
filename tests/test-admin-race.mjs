/* Two admin actions on the same person, in flight at the same time.

   "I reset the PIN and it didn't take" and "I changed her username and it
   reverted" both trace to the same shape of bug: adminResetPin and
   adminUpdateStaff each used to read the whole staff list, change one
   record, and write the whole list back — with no way to tell the store
   "only if nothing else changed since my read." Two of those calls
   overlapping, the ordinary result of an admin clicking Reset PIN and then
   Save on the same row a moment later, or two admins working at once, can
   each read before the other's write lands. Whichever writes last silently
   discards what the other just saved. It looked like "the save didn't
   work"; it was really "a newer write undid it".

   This store is deliberately hostile in the opposite way from
   test-read-your-writes.mjs's lagged one: every operation takes real time,
   so two requests fired together via Promise.all truly overlap rather than
   one completing before the other starts a single step. mutateStaff_ has no
   compare-and-swap to lean on either — real Netlify Blobs doesn't offer
   one — so it has to detect the collision after the fact and retry. This is
   what catches that retry loop being quietly simplified back into a plain
   read-modify-write. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DELAY = 15;
const TMP = tmpDir('admin-race');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function getStore(){ return {
  get: async (k) => { await sleep(${DELAY}); return (k in mem) ? JSON.parse(JSON.stringify(mem[k])) : null; },
  setJSON: async (k, v) => { await sleep(${DELAY}); mem[k] = JSON.parse(JSON.stringify(v)); },
};}
export const __mem = mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js'); // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = {
  id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Campus Leadership',
  ministry: 'Campus Director', role: 'Director', active: true, isAdmin: true,
};
const SPICY = {
  id: 'st_spicy', name: 'Spicy', username: 'spicy', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, isAdmin: false,
};
mem.staff = [ADMIN, SPICY].map((s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

// Fired together, not one after another — this is the shape of the bug
// report: reset her PIN, then (before that request's write has necessarily
// landed) rename her, same person, same moment.
const [pinRes, userRes] = await Promise.all([
  call('adminResetPin', ['uriah', '1234', 'st_spicy', '9999']),
  call('adminUpdateStaff', ['uriah', '1234', 'st_spicy', { username: 'spicy2' }]),
]);

ok('the PIN reset call reported success', pinRes.body && pinRes.body.ok === true, JSON.stringify(pinRes.body));
ok('the username change call reported success', userRes.body && userRes.body.ok === true, JSON.stringify(userRes.body));

const loginOld = await call('staffLogin', ['spicy', '9999']);
ok('her old username no longer works (it was renamed)', !(loginOld.body && loginOld.body.ok));

const loginNewUserOldPin = await call('staffLogin', ['spicy2', '1234']);
ok('the new username with the OLD pin does not work (the pin reset also stuck)', !(loginNewUserOldPin.body && loginNewUserOldPin.body.ok));

const loginBoth = await call('staffLogin', ['spicy2', '9999']);
ok('both changes survived together: new username AND new pin log her in', loginBoth.body && loginBoth.body.ok === true, JSON.stringify(loginBoth.body));

// A second pair, this time both requests changing adminUpdateStaff fields on
// the same record from two different "admin tabs" at once — role vs dept —
// so this isn't just proving the PIN/username pair works by coincidence.
mem.staff = [ADMIN, SPICY].map((s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
const [roleRes, deptRes] = await Promise.all([
  call('adminUpdateStaff', ['uriah', '1234', 'st_spicy', { role: 'Team Lead' }]),
  call('adminUpdateStaff', ['uriah', '1234', 'st_spicy', { dept: 'Campus Leadership' }]),
]);
ok('the role update reported success', roleRes.body && roleRes.body.ok === true, JSON.stringify(roleRes.body));
ok('the department update reported success', deptRes.body && deptRes.body.ok === true, JSON.stringify(deptRes.body));
const final = mem.staff.find((s) => s.id === 'st_spicy');
ok('the role change survived the concurrent department change', final.role === 'Team Lead', final.role);
ok('the department change survived the concurrent role change', final.dept === 'Campus Leadership', final.dept);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
