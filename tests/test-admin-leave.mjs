/* Admin → Leave: everyone's leave requests, and deciding the waiting ones.

   Against the real api.js: only an admin reads the full list; each request
   names who asked, their campus, department and mentor; every person's
   year totals come along; an admin may approve or decline a request that
   is still waiting — pending on a mentor, or noted because there is no
   mentor — but not one already decided. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('admin-leave');
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
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js'); // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
const Y = new Date().getUTCFullYear();
mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_sina', name: 'Sina', username: 'sina', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Community Service', active: true }),
  withPin({ id: 'st_dara', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, mentorId: 'st_sina', mentorStatus: 'approved' }),
  withPin({ id: 'st_bopha', name: 'Bopha', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', active: true }),
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

// Dara (mentored) asks → pending; Bopha (no mentor) asks → noted
let r = await call('saveTrip', ['dara', '1234', { from: Y + '-11-02', to: Y + '-11-06', type: 'personal', reason: 'Family visit' }]);
ok('a mentored person’s request is pending on their mentor', r.body.ok === true && r.body.trips[0].status === 'pending');
r = await call('saveTrip', ['bopha', '1234', { from: Y + '-10-05', to: Y + '-10-09', type: 'outside', reason: 'Team in Battambang' }]);
ok('a request from someone with no mentor is noted', r.body.ok === true && r.body.trips[0].status === 'noted');
r = await call('saveTrip', ['sina', '1234', { from: (Y - 1) + '-12-20', to: (Y - 1) + '-12-24', type: 'personal' }]);

console.log('\n=== the admin list ===');
r = await call('adminListTrips', ['dara', '1234']);
ok('an ordinary member cannot read everyone’s leave', r.body.ok === false);
r = await call('adminListTrips', ['uriah', '1234']);
ok('the admin reads every request, both campuses, every year, newest first', r.body.ok === true && r.body.trips.length === 3 && r.body.trips[0].from === Y + '-11-02', JSON.stringify(r.body.trips && r.body.trips.map(t => t.from)));
const daraTrip = r.body.trips.find(t => t.staffId === 'st_dara');
ok('each names who asked, their campus, department and mentor, and the reason', daraTrip.name === 'Dara' && daraTrip.campus === 'siemreap' && daraTrip.dept === 'Community Service' && daraTrip.mentorName === 'Sina' && daraTrip.reason === 'Family visit' && daraTrip.workDays === 5, JSON.stringify(daraTrip));
ok('the other campus’s request is there with its campus', r.body.trips.find(t => t.staffId === 'st_bopha').campus === 'poipet');
ok('every person’s year totals come along, in work days by type', r.body.totals.st_dara[Y].personal === 5 && r.body.totals.st_bopha[Y].outside === 5 && r.body.totals.st_sina[Y - 1].personal > 0 && r.body.ptoCap === 30, JSON.stringify(r.body.totals.st_dara));

console.log('\n=== the admin decides ===');
const pendingId = daraTrip.id, notedId = r.body.trips.find(t => t.staffId === 'st_bopha').id;
r = await call('adminDecideTrip', ['dara', '1234', pendingId, true]);
ok('an ordinary member cannot decide', r.body.ok === false);
r = await call('adminDecideTrip', ['uriah', '1234', pendingId, true]);
ok('the admin approves a request that was waiting on a mentor', r.body.ok === true && r.body.trips.find(t => t.id === pendingId).status === 'approved' && r.body.trips.find(t => t.id === pendingId).decidedBy === 'Uriah');
r = await call('getMyTrips', ['dara', '1234']);
ok('and the person sees it approved', r.body.trips[0].status === 'approved');
r = await call('adminDecideTrip', ['uriah', '1234', notedId, false]);
ok('the admin declines a noted request (no mentor to ask)', r.body.ok === true && r.body.trips.find(t => t.id === notedId).status === 'declined');
ok('a declined request no longer counts toward the year', r.body.totals.st_bopha[Y] === undefined || r.body.totals.st_bopha[Y].outside === 0);
r = await call('adminDecideTrip', ['uriah', '1234', pendingId, false]);
ok('a request already decided is left alone', r.body.ok === false && r.body.err === 'already_decided');
r = await call('adminDecideTrip', ['uriah', '1234', 'tr_missing', true]);
ok('an unknown id is refused', r.body.ok === false && r.body.err === 'not_found');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
