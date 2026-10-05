/* Khmer review: who may review, what a review must be, and the one road from
   PENDING_KM to REVIEWED_KM.

   Against the real api.js: only an admin or someone an admin made a Khmer
   reviewer may read or save reviews; the flag is admin-set and reaches the boot;
   a fix must be Khmer and keep every {placeholder} the English has; one review
   per line, the latest winning; Undo removes it. Then scripts/km-apply-reviews.mjs
   on a copy of the real km.js: a dry run changes nothing, --write moves exactly
   the reviewed lines with the reviewer's words, leaves every other line byte for
   byte, refuses a fix that dropped a placeholder, and reports lines no longer
   pending. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const TMP = tmpDir('km-review');
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
for (const f of fs.readdirSync(REPO + '/netlify/functions')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_sl', name: 'Sreilea', username: 'sreilea', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'st_dara', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
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
const KEY = '{n} of {total} lines reviewed';

console.log('=== who may review ===');
let r = await call('getKmReviews', ['sreilea', '1234']);
ok('someone who is not a reviewer cannot read reviews', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('saveKmReview', ['sreilea', '1234', KEY, 'ok', 'បានពិនិត្យ {n} ក្នុងចំណោម {total} បន្ទាត់']);
ok('… nor save one', r.body.ok === false && r.body.err === 'not_authorized' && !mem.kmReviews);
r = await call('adminUpdateStaff', ['dara', '1234', 'st_sl', { kmReviewer: true }]);
ok('only an admin can make someone a reviewer', r.body.ok === false);
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_sl', { kmReviewer: true }]);
ok('an admin can', r.body.ok === true && r.body.staff.kmReviewer === true);
r = await call('getMyBoot', ['sreilea', '1234']);
ok('the boot tells the page she is a reviewer', r.body.ok && r.body.staff.kmReviewer === true);
r = await call('getMyBoot', ['dara', '1234']);
ok('… and nobody else', r.body.ok && r.body.staff.kmReviewer === false);
r = await call('teamRoster', ['siemreap', '']);
ok('the public roster says nothing about it', !JSON.stringify(r.body).includes('kmReviewer'));

console.log('\n=== what a review must be ===');
r = await call('saveKmReview', ['sreilea', '1234', KEY, 'fixed', 'reviewed {n} of {total}']);
ok('a fix must be in Khmer', r.body.ok === false && r.body.err === 'not_khmer');
r = await call('saveKmReview', ['sreilea', '1234', KEY, 'fixed', 'បានពិនិត្យ {n} បន្ទាត់']);
ok('a fix that drops a {placeholder} is refused, and says which', r.body.ok === false && r.body.err === 'placeholders' && r.body.want.join() === '{n},{total}');
r = await call('saveKmReview', ['sreilea', '1234', KEY, 'maybe', 'x']);
ok('only Correct, Fixed or Undo', r.body.ok === false && r.body.err === 'bad_verdict');
r = await call('saveKmReview', ['sreilea', '1234', '', 'ok', 'ខ្មែរ']);
ok('a line is needed', r.body.ok === false && r.body.err === 'bad_key');
r = await call('saveKmReview', ['sreilea', '1234', KEY, 'ok', 'បានពិនិត្យ {n} ក្នុងចំណោម {total} បន្ទាត់']);
ok('a Correct is saved, with who and when', r.body.ok && r.body.reviews.length === 1 && r.body.reviews[0].byName === 'Sreilea' && !!r.body.reviews[0].at);
ok('… and the reviewer’s id stays on the server', !JSON.stringify(r.body).includes('st_sl'));
r = await call('saveKmReview', ['uriah', '1234', KEY, 'fixed', 'បានពិនិត្យរួច {n} / {total}']);
ok('one review per line: the latest wins', r.body.ok && r.body.reviews.length === 1 && r.body.reviews[0].verdict === 'fixed' && r.body.reviews[0].byName === 'Uriah');
r = await call('saveKmReview', ['sreilea', '1234', 'Undo', 'ok', 'មិនធ្វើវិញ']);
r = await call('saveKmReview', ['sreilea', '1234', 'Undo', 'undo']);
ok('Undo removes it', r.body.ok && r.body.reviews.length === 1);
r = await call('saveKmReview', ['sreilea', '1234', 'Skip', 'ok', 'រំលង']);
ok('a reviewer reads every review', (await call('getKmReviews', ['sreilea', '1234'])).body.reviews.length === 2);

console.log('\n=== scripts/km-apply-reviews.mjs ===');
const kmCopy = TMP + '/km.js';
fs.copyFileSync(REPO + '/public/km.js', kmCopy);
const before = fs.readFileSync(kmCopy, 'utf8');
const lineOf = (txt, name) => txt.split('\n').find((l) => l.startsWith('var ' + name + ' = '));
const objOf = (txt, name) => { const l = lineOf(txt, name); return JSON.parse(l.slice(l.indexOf('{')).trimEnd().replace(/;$/, '')); };
const P0 = objOf(before, 'PENDING_KM'), R0 = objOf(before, 'REVIEWED_KM');
const pendingKeys = Object.keys(P0).filter((k) => !(k in R0));
const kOk = pendingKeys.find((k) => !/\{/.test(k)), kPh = pendingKeys.find((k) => /\{[a-z]+\}/.test(k) && k !== kOk);
const download = { format: 'gp-km-reviews', at: '', reviews: [
  { key: kOk, km: P0[kOk], verdict: 'ok', byName: 'Sreilea' },
  { key: kPh, km: 'ខ្មែរ', verdict: 'fixed', byName: 'Sreilea' },          // dropped its placeholder
  { key: 'A line the app no longer has', km: 'ខ្មែរ', verdict: 'ok' },
] };
const fixKey = pendingKeys.find((k) => k !== kOk && k !== kPh && !/\{/.test(k));
download.reviews.push({ key: fixKey, km: 'ការកែរបស់អ្នកពិនិត្យ', verdict: 'fixed', byName: 'Leakha' });
fs.writeFileSync(TMP + '/reviews.json', JSON.stringify(download));
const runScript = (extra) => spawnSync(process.execPath, [REPO + '/scripts/km-apply-reviews.mjs', TMP + '/reviews.json', '--km=' + kmCopy].concat(extra || []), { encoding: 'utf8' });
let out = runScript();
ok('a dry run says what it would move and changes nothing', out.status === 0 && /Would move 2/.test(out.stdout) && fs.readFileSync(kmCopy, 'utf8') === before, out.stdout.split('\n')[0]);
out = runScript(['--write']);
const after = fs.readFileSync(kmCopy, 'utf8');
const P1 = objOf(after, 'PENDING_KM'), R1 = objOf(after, 'REVIEWED_KM');
ok('--write moves the two good reviews out of PENDING_KM', !(kOk in P1) && !(fixKey in P1) && Object.keys(P1).length === Object.keys(P0).length - 2);
ok('… into REVIEWED_KM, a Correct as it was and a fix in the reviewer’s words', R1[kOk] === P0[kOk] && R1[fixKey] === 'ការកែរបស់អ្នកពិនិត្យ');
ok('a fix that dropped a placeholder is refused and stays pending', kPh in P1 && !(kPh in R1) && /1 refused/.test(out.stdout));
ok('a line no longer pending is reported and left alone', /1 not in PENDING_KM/.test(out.stdout) && !('A line the app no longer has' in R1));
const strip = (txt) => txt.split('\n').filter((l) => !/^var (PENDING|REVIEWED)_KM = /.test(l)).join('\n');
ok('every other line of km.js is byte for byte the same', strip(after) === strip(before));
ok('… and every other string in both lists too', Object.keys(P1).every((k) => P1[k] === P0[k]) && Object.keys(R0).every((k) => R1[k] === R0[k]));
const bad = spawnSync(process.execPath, [REPO + '/scripts/km-apply-reviews.mjs', REPO + '/package.json', '--km=' + kmCopy], { encoding: 'utf8' });
ok('a file that is not a review download is refused', bad.status === 1 && /Not a Khmer review download/.test(bad.stderr));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
