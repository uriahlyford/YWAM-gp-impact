/* The load path against a store that is empty, half-written or holding junk.
   These are the shapes that produce "Error when loading app" in production:
   a brand-new base with no blobs at all, a blob that came back as the wrong
   type, and rows missing the fields the code reads. Nothing here should throw
   a 500 — an empty page is fine, a crash is not. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const TMP = tmpDir('firstrun');
fs.rmSync(TMP, { recursive: true, force: true });
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

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
function wipe() { for (const k of Object.keys(mem)) delete mem[k]; }

/* ---------- 1. a brand-new base: nothing in the store at all ---------- */
wipe();
let r = await call('getData', ['']);
ok('empty store: getData returns 200', r.status === 200, 'status ' + r.status);
/* entries is an object keyed by campus; survey, okrs and roster are arrays. */
ok('empty store: getData has the shape the page expects',
  r.body && r.body.entries && !Array.isArray(r.body.entries) &&
  Array.isArray(r.body.survey) && Array.isArray(r.body.okrs) && Array.isArray(r.body.roster),
  r.body ? Object.keys(r.body).join(',') : 'no body');

r = await call('teamRoster', []);
ok('empty store: teamRoster returns a list', r.status === 200 && Array.isArray(r.body));

r = await call('getMyBoot', ['nobody', '1234']);
ok('empty store: getMyBoot on an unknown user is auth, not a crash',
  r.status === 200 && r.body && r.body.ok === false && r.body.err === 'auth',
  JSON.stringify(r.body));

/* ---------- 2. blobs holding the wrong type ---------- */
wipe();
mem.entries = { not: 'an array' };
mem.survey = 'a string';
mem.staff = null;
r = await call('getData', ['']);
ok('junk blobs: getData still returns 200', r.status === 200, 'status ' + r.status);
ok('junk blobs: a bad blob reads as empty, not as a crash',
  r.body && r.body.entries && Object.keys(r.body.entries).length === 0 &&
  Array.isArray(r.body.survey) && r.body.survey.length === 0 &&
  Array.isArray(r.body.roster) && r.body.roster.length === 0,
  r.body ? JSON.stringify(r.body).slice(0, 120) : 'no body');
r = await call('teamRoster', []);
ok('junk blobs: teamRoster still returns a list',
  r.status === 200 && Array.isArray(r.body), 'status ' + r.status);

/* ---------- 3. rows missing the fields the roll-up reads ---------- */
wipe();
mem.entries = [
  {},                                                     // nothing at all
  { campus: 'poipet' },                                   // no metric, no value
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations' }, // no week/value
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 'abc' },
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 4 },
];
mem.survey = [{}, { campus: 'poipet' }, { campus: 'poipet', week: 33, device: 'tok', lonely: 'x' }];
mem.staff = [{}, { id: 'x' }, { id: 'y', name: 'Y', username: 'y', active: true }];
r = await call('getData', ['']);
ok('ragged rows: getData returns 200', r.status === 200, 'status ' + r.status);
ok('ragged rows: the one good row still reaches the dashboard',
  r.body && r.body.entries.poipet &&
  r.body.entries.poipet['Community Service|Outreach Teams|Salvations'] &&
  r.body.entries.poipet['Community Service|Outreach Teams|Salvations']['33'] === 4,
  JSON.stringify(r.body && r.body.entries));
r = await call('teamRoster', []);
ok('ragged rows: teamRoster returns 200', r.status === 200 && Array.isArray(r.body),
  r.status + ' ' + (Array.isArray(r.body) ? r.body.length + ' rows' : typeof r.body));

/* ---------- 4. a real staff member, but every other blob empty ---------- */
wipe();
const ME = {
  id: 'st_me', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_me',
};
mem.staff = [{ ...ME, pinSalt: ME.id, pinHash: mkHash('1234', ME.id) }];
r = await call('getMyBoot', ['sokha', '1234']);
ok('half-empty store: getMyBoot succeeds', r.status === 200 && r.body && r.body.ok === true,
  JSON.stringify(r.body && r.body.err || ''));
const b = r.body || {};
ok('half-empty store: every section the page reads is present',
  Array.isArray(b.roster) && Array.isArray(b.logs) && Array.isArray(b.mentees) &&
  Array.isArray(b.goals) && Array.isArray(b.checkins) &&
  Array.isArray(b.mentorRequests) && Array.isArray(b.tripRequests) &&
  b.trips && b.trips.ok && b.ministry && b.ministry.ok &&
  b.base && b.base.entries && Array.isArray(b.base.survey),
  Object.keys(b).join(','));
ok('half-empty store: getMyBoot does not ship the roster twice',
  b.base && !b.base.roster, b.base ? Object.keys(b.base).join(',') : 'no base');

/* ---------- 5. a bad PIN is auth; a broken section is not a logout ---------- */
r = await call('getMyBoot', ['sokha', '9999']);
ok('wrong PIN: err is auth so the page clears the session',
  r.body && r.body.ok === false && r.body.err === 'auth', JSON.stringify(r.body));

/* ---------- 6. week boundaries ---------- */
wipe();
mem.staff = [{ ...ME, pinSalt: ME.id, pinHash: mkHash('1234', ME.id) }];
/* The whole app runs on weeks 1-52 — both clients clamp to 52 and the pickers
   only offer that far — so a write outside the range is a bug wherever it lands. */
for (const wk of [0, 1, 52, 53, 'abc', null]) {
  r = await call('saveMyWeek', ['sokha', '1234', wk, { lonely: 3, clarity: 8, growth: 7 }]);
  const good = wk === 1 || wk === 52;
  ok('saveMyWeek week=' + JSON.stringify(wk) + ' ' + (good ? 'accepted' : 'refused'),
    r.status === 200 && !!(r.body && r.body.ok) === good, JSON.stringify(r.body && r.body.err || r.body && r.body.ok));
}
ok('only the two valid weeks were stored',
  (mem.survey || []).length === 2, ((mem.survey || []).map(function (s) { return s.week; })).join(','));

/* ---------- 7. a malformed request body ---------- */
for (const bad of [null, 42, 'a string', [], {}, { fn: 'nope', args: [] }, { fn: 'getData' },
  { fn: 'getData', args: 'not-an-array' }, { fn: null }]) {
  const res = await api.default({ method: 'POST', json: async () => bad, headers: new Map() }, {});
  ok('malformed body ' + JSON.stringify(bad) + ' → no 500',
    res.status !== 500, 'status ' + res.status);
}
/* HANDLERS is an object literal, so a lookup walks Object.prototype: fn:"constructor"
   resolved to Object and got called, answering 200. Only own handlers may dispatch. */
for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf']) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn: name, args: [] }), headers: new Map() }, {});
  ok('fn:"' + name + '" is rejected, not dispatched', res.status === 400, 'status ' + res.status);
}
const res = await api.default({ method: 'POST', json: async () => { throw new Error('bad json'); }, headers: new Map() }, {});
ok('unparseable JSON → no 500', res.status !== 500, 'status ' + res.status);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
