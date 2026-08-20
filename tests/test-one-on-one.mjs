/* 1-on-1 requests: either side of an approved mentor/mentee pair can ask the
   other for a 1-on-1. The only rules that matter are that the pair must
   actually be an approved mentor/mentee relationship, and that only the
   recipient of a request — not the requester — can accept or decline it. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('one-on-one');
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

const MENTOR = {
  id: 'st_mentor', name: 'Andrew', username: 'andrew', campus: 'siemreap', dept: 'Base Leadership',
  ministry: 'Campus Leadership', role: 'Oversight', active: true,
};
const MENTEE = {
  id: 'st_mentee', name: 'Sokha', username: 'sokha', campus: 'siemreap', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true,
  mentorId: 'st_mentor', mentorStatus: 'approved',
};
const STRANGER = {
  id: 'st_stranger', name: 'Mealea', username: 'mealea', campus: 'siemreap', dept: 'Youth Education',
  ministry: 'YDC', role: 'Teacher', active: true,
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
function seed(rows) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [MENTOR, MENTEE, STRANGER].map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
  mem.oneOnOnes = rows || [];
}

/* ---------- 1. either side of an approved pair can request ---------- */
seed();
let r = await call('requestOneOnOne', ['andrew', '1234', 'st_mentee', '']);
ok('mentor can request a 1-on-1 with their mentee',
  r.body && r.body.ok === true && r.body.oneOnOnes.length === 1 && r.body.oneOnOnes[0].status === 'pending',
  JSON.stringify(r.body));

seed();
r = await call('requestOneOnOne', ['sokha', '1234', 'st_mentor', '']);
ok('mentee can request a 1-on-1 with their mentor',
  r.body && r.body.ok === true && r.body.oneOnOnes.length === 1, JSON.stringify(r.body));

/* ---------- 2. a non mentor/mentee pair is refused ---------- */
seed();
r = await call('requestOneOnOne', ['andrew', '1234', 'st_stranger', '']);
ok('a request between people with no mentor relationship is refused',
  r.body && r.body.ok === false && r.body.err === 'not_mentor_pair', JSON.stringify(r.body));
ok('and nothing was written', (mem.oneOnOnes || []).length === 0);

/* ---------- 3. only the recipient can respond, and only once ---------- */
seed([{ id: 'oo1', fromId: 'st_mentor', toId: 'st_mentee', note: '', status: 'pending', created: '2026-01-01T00:00:00.000Z', updated: '2026-01-01T00:00:00.000Z', decidedAt: '' }]);
r = await call('respondToOneOnOne', ['andrew', '1234', 'oo1', true]);
ok('the requester cannot respond to their own request', r.body && r.body.ok === false, JSON.stringify(r.body));

r = await call('respondToOneOnOne', ['sokha', '1234', 'oo1', true]);
ok('the recipient can accept', r.body && r.body.ok === true && r.body.oneOnOnes[0].status === 'accepted', JSON.stringify(r.body));

r = await call('respondToOneOnOne', ['sokha', '1234', 'oo1', false]);
ok('an already-decided request cannot be responded to again',
  r.body && r.body.ok === false, JSON.stringify(r.body));
ok('and the accepted status stuck', (mem.oneOnOnes || [])[0].status === 'accepted');

/* ---------- 4. each side sees the same request with the right "mine" flag ---------- */
seed([{ id: 'oo2', fromId: 'st_mentor', toId: 'st_mentee', note: 'coffee?', status: 'pending', created: '2026-01-02T00:00:00.000Z', updated: '2026-01-02T00:00:00.000Z', decidedAt: '' }]);
r = await call('getMyOneOnOnes', ['andrew', '1234']);
ok('the requester sees mine:true', r.body && r.body.oneOnOnes[0].mine === true && r.body.oneOnOnes[0].otherName === 'Sokha',
  JSON.stringify(r.body));
r = await call('getMyOneOnOnes', ['sokha', '1234']);
ok('the recipient sees mine:false', r.body && r.body.oneOnOnes[0].mine === false && r.body.oneOnOnes[0].otherName === 'Andrew',
  JSON.stringify(r.body));

/* ---------- 5. a wrong PIN writes nothing ---------- */
seed();
r = await call('requestOneOnOne', ['andrew', '9999', 'st_mentee', '']);
ok('a wrong PIN is refused', r.body && r.body.ok === false && (mem.oneOnOnes || []).length === 0);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
