/* Archiving a group at once (hrArchiveMany), against the real api.js: admin or
   HR only; never yourself; each person archived with the date, the reason and
   who, active off, in one write of the staff list; someone already archived is
   left exactly as they were; an empty or oversized list is refused; an archived
   person can no longer log in and comes back one at a time with hrUnarchive. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('archive-many');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={}; const writes=[];
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ writes.push(k); mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem; export const __writes=writes;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem, writes = blobs.__writes;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
const st = (id, o) => withPin(Object.assign({ id: id, name: id, username: id, campus: 'siemreap', dept: 'Leadership Development', ministry: 'DTS', active: true }, o || {}));
mem.staff = [
  st('uriah', { isAdmin: true, dept: 'Campus Leadership', ministry: 'Campus Director' }),
  st('hrperson', { hr: true }),
  st('plain'),
  st('s1'), st('s2'), st('s3'),
  st('old', { active: false, archived: { at: '2025-01-01', reason: 'earlier', by: 'uriah' } }),
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
const rec = (id) => mem.staff.find((x) => x.id === id);

let r = await call('hrArchiveMany', ['plain', '1234', ['s1'], {}]);
ok('someone who is not admin or HR cannot', r.body.ok === false && r.body.err === 'not_authorized' && rec('s1').active);
r = await call('hrArchiveMany', ['uriah', '1234', ['s1', 'uriah'], {}]);
ok('nobody archives themselves — the whole call is refused', r.body.ok === false && r.body.err === 'self_archive' && rec('s1').active);
r = await call('hrArchiveMany', ['uriah', '1234', [], {}]);
ok('an empty list is refused', r.body.ok === false && r.body.err === 'none');
r = await call('hrArchiveMany', ['uriah', '1234', Array.from({ length: 201 }, (_, i) => 'x' + i), {}]);
ok('more than 200 at once is refused', r.body.ok === false && r.body.err === 'too_many');

writes.length = 0;
r = await call('hrArchiveMany', ['uriah', '1234', ['s1', 's2', 'old', 'nobody'], { at: '2026-09-30', reason: 'DTS finished' }]);
ok('an admin archives several', r.body.ok === true && r.body.archived === 2, JSON.stringify(r.body));
ok('… each with the date, the reason and who, and no longer active',
  ['s1', 's2'].every((id) => !rec(id).active && rec(id).archived.at === '2026-09-30' && rec(id).archived.reason === 'DTS finished' && rec(id).archived.by === 'uriah'));
ok('… in one write of the staff list', writes.filter((k) => k === 'staff').length === 1, writes.join());
ok('someone already archived is left exactly as they were', rec('old').archived.at === '2025-01-01' && rec('old').archived.reason === 'earlier');
ok('someone not ticked is untouched', rec('s3').active && !rec('s3').archived);
r = await call('hrArchiveMany', ['hrperson', '1234', ['s3'], {}]);
ok('HR can too, and the date defaults to today', r.body.ok && rec('s3').archived && /^\d{4}-\d{2}-\d{2}$/.test(rec('s3').archived.at));
r = await call('staffLogin', ['s1', '1234']);
ok('an archived person can no longer log in', !(r.body && r.body.ok));
r = await call('hrUnarchive', ['uriah', '1234', 's1']);
ok('… and comes back one at a time', r.body.ok && rec('s1').active && !rec('s1').archived && !rec('s2').active);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
