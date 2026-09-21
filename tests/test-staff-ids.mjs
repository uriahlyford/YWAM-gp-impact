/* Every staff record carries its own id, or gets one.

   Accounts from before the Netlify backend have none, and a couple may share
   one. Everything is keyed on the id — the admin's account rows, reset PIN,
   edit profile, mentor links — so with an empty id they all fall together:
   the admin's list opens the wrong row, every such account reads as "(you)",
   and adminResetPin cannot find the person. api.js mints a missing id on
   read, re-mints a duplicate for the later row, and writes the repaired list
   back so the id holds on the next request. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('staff-ids');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={}; let writes=0;
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ writes++; mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem; export const __writes=()=>writes;
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
const withPin = (s) => ({ ...s, pinSalt: s.username, pinHash: mkHash('1234', s.username) });

// the admin has an id; three legacy accounts have none; two share one
mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ name: 'Spicy', username: 'spicy', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: '', name: 'Bopha', username: 'bopha', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'dup1', name: 'Sok', username: 'sok', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'dup1', name: 'Sina', username: 'sina', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
];

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

console.log('=== the first read repairs the list ===');
const w0 = blobs.__writes();
let r = await call('adminListStaff', ['uriah', '1234']);
const list = r.body.staff;
ok('the admin list comes back', r.body.ok === true && list.length === 6);
ok('every account has an id', list.every(s => typeof s.id === 'string' && s.id.length > 0), list.map(s => s.name + ':' + (s.id || '∅')).join(' '));
ok('and no two share one', new Set(list.map(s => s.id)).size === 6);
ok('the admin keeps their own id', list.find(s => s.username === 'uriah').id === 'st_admin');
ok('the FIRST of two duplicates keeps the id, the later one is re-minted', list.find(s => s.username === 'sok').id === 'dup1' && list.find(s => s.username === 'sina').id !== 'dup1');
ok('the repaired list was written back once', blobs.__writes() === w0 + 1, blobs.__writes() - w0);
const spicyId = list.find(s => s.username === 'spicy').id;
r = await call('adminListStaff', ['uriah', '1234']);
ok('the ids hold on the next read — nothing is re-minted', r.body.staff.find(s => s.username === 'spicy').id === spicyId && r.body.staff.find(s => s.username === 'sina').id === list.find(s => s.username === 'sina').id);
ok('and nothing is written again', blobs.__writes() === w0 + 1, blobs.__writes() - w0);

console.log('\n=== the repaired accounts work like any other ===');
r = await call('adminResetPin', ['uriah', '1234', spicyId, '5678']);
ok('an admin can reset a formerly id-less account’s PIN by its new id', r.body.ok === true, JSON.stringify(r.body));
r = await call('getMyBoot', ['spicy', '5678']);
ok('and she signs in with it, carrying her id', r.body.ok === true && r.body.staff.id === spicyId, JSON.stringify(r.body.staff && r.body.staff.id));
r = await call('getMyBoot', ['dara', '1234']);
ok('another formerly id-less account has its own, different id', r.body.ok === true && r.body.staff.id && r.body.staff.id !== spicyId);
r = await call('adminUpdateStaff', ['uriah', '1234', r.body.staff.id, { name: 'Dara Pen' }]);
ok('and can be edited by it', r.body.ok === true && r.body.staff.name === 'Dara Pen', JSON.stringify(r.body));
r = await call('getMyBoot', ['uriah', '1234']);
ok('the roster everyone gets carries the ids too', r.body.roster.every(p => p.id) && new Set(r.body.roster.map(p => p.id)).size === r.body.roster.length);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
