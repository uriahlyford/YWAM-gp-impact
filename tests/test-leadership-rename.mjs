/* The leadership department was renamed — 'Base Leadership' → 'Campus
   Leadership' — and its own ministry row, the campus director's figures,
   from 'Campus Leadership' to 'Campus Director', so the two no longer share
   a name. Real accounts and real numbers were written under the old names,
   and nothing rewrites the store in bulk: every read normalises the names on
   the way out (normRows_ in api.js), and incoming payloads are normalised
   too, for a client still running the old taxonomy.

   This seeds the store with OLD names everywhere a department can appear —
   staff, entries, daily rows, OKRs (dept and key-result metric keys), metric
   overrides — and checks that every read answers with the new ones, and
   that every right keyed on the department (admin approval, overseeing a
   department's ministries, campus leadership editing a metric list) still
   works for those accounts. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('leadership-rename');
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
const YR = new Date().getUTCFullYear();

// Everything under the OLD names, as the live store has it.
const DIRECTOR = { id: 'st_dir', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Base Leadership',
  ministry: 'Campus Leadership', role: 'Director', active: true, isAdmin: true };
const OVERSEER = { id: 'st_ov', name: 'Sina', username: 'sina', campus: 'poipet', dept: 'Base Leadership',
  ministry: 'Community Service', role: '', active: true };
const OLDEST = { id: 'st_old', name: 'Naomi', username: 'naomi', campus: 'poipet', dept: 'Base Director',
  ministry: 'Campus Leadership', role: '', active: true };
const CAFE = { id: 'st_cafe', name: 'Sreilea', username: 'sreilea', campus: 'poipet', dept: 'Community Service',
  ministry: 'Cafe', role: '', active: true };
mem.staff = [DIRECTOR, OVERSEER, OLDEST, CAFE].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
mem.entries = [
  { campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', metric: 'One-on-Ones Held', week: 10, year: YR, value: 4 },
  { campus: 'poipet', dept: 'Base Leadership', ministry: 'Community Service', metric: 'Total Staff', week: 10, year: YR, value: 12 },
  { campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: 10, year: YR, value: 80 },
];
mem.kpiDaily = [{ campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', metric: 'One-on-Ones Held', date: YR + '-03-04', week: 10, value: 4 }];
// the okrs blob is one row per key result, as saveObjective writes it
mem.okrs = [{ id: 'o1', campus: 'poipet', quarter: 1, dept: 'Base Leadership', objective: 'Healthy base',
  kr: 'More one-on-ones', metricKey: 'Base Leadership|Campus Leadership|One-on-Ones Held', target: 20, manualPct: 0 }];
mem.metricOverrides = [{ campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', hidden: [], custom: ['Board Meetings'], cadence: {} }];

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

console.log('=== every read answers with the new names ===');
let r = await call('getMyBoot', ['uriah', '1234']);
ok('a director stored under the old names signs in as Campus Leadership / Campus Director',
  r.body.staff.dept === 'Campus Leadership' && r.body.staff.ministry === 'Campus Director', r.body.staff.dept + ' / ' + r.body.staff.ministry);
const naomi = r.body.roster.find(p => p.id === 'st_old');
ok('the oldest name of all, Base Director, lands on Campus Leadership too', naomi && naomi.dept === 'Campus Leadership' && naomi.ministry === 'Campus Director', JSON.stringify(naomi && [naomi.dept, naomi.ministry]));
const sina = r.body.roster.find(p => p.id === 'st_ov');
ok('an overseer keeps their department-named ministry (only the director row was renamed)', sina && sina.dept === 'Campus Leadership' && sina.ministry === 'Community Service', JSON.stringify(sina && [sina.dept, sina.ministry]));
ok('the director’s own numbers come back under the new ministry name', r.body.ministry && r.body.ministry.dept === 'Campus Leadership' && r.body.ministry.ministry === 'Campus Director' &&
  r.body.ministry.entries['One-on-Ones Held'] && r.body.ministry.entries['One-on-Ones Held']['10'] === 4, JSON.stringify(r.body.ministry && r.body.ministry.entries));

r = await call('getData', ['leadercode']);
const keys = Object.keys(r.body.entries.poipet || {});
ok('the dashboard payload keys leadership figures under the new names', keys.includes('Campus Leadership|Campus Director|One-on-Ones Held') && keys.includes('Campus Leadership|Community Service|Total Staff'), keys.join(' , '));
ok('and no old name leaks through', !keys.some(k => /Base Leadership|Base Director/.test(k)) && !keys.some(k => k.startsWith('Campus Leadership|Campus Leadership|')));
ok('an OKR written for Base Leadership belongs to Campus Leadership now', r.body.okrs[0].dept === 'Campus Leadership');
ok('and its key result points at the renamed metric key', r.body.okrs[0].krs[0].metricKey === 'Campus Leadership|Campus Director|One-on-Ones Held', r.body.okrs[0].krs[0].metricKey);
ok('metric overrides follow too', r.body.metricOverrides[0].dept === 'Campus Leadership' && r.body.metricOverrides[0].ministry === 'Campus Director');

console.log('\n=== rights keyed on the department still hold for old-name accounts ===');
r = await call('saveMinistryFor', ['sina', '1234', 'Community Service', 'Cafe', 11, [{ metric: 'Cups Sold', value: 5 }]]);
ok('the overseer can still log for a ministry in their department', r.body.ok === true, JSON.stringify(r.body.ok));
r = await call('saveMetricOverrides', ['sina', '1234', 'poipet', 'Community Service', 'Cafe', ['Days Open'], []]);
ok('campus leadership can still change a metric list', r.body.ok === true, JSON.stringify(r.body));
r = await call('saveMyMinistry', ['uriah', '1234', 11, [{ metric: 'One-on-Ones Held', value: 6 }]]);
ok('the director logs their own week and it lands under the new names',
  r.body.ok === true && mem.entries.some(e => e.dept === 'Campus Leadership' && e.ministry === 'Campus Director' && e.week === 11 && e.value === 6),
  JSON.stringify(mem.entries.filter(e => e.week === 11)));
ok('the row written earlier under the old name was matched, not duplicated',
  mem.entries.filter(e => e.metric === 'One-on-Ones Held' && e.week === 10).length === 1);

console.log('\n=== an old client can still sign up and be approved ===');
r = await call('staffRegister', [{ name: 'New Leader', username: 'newlead', pin: '2222', email: 'newlead@example.com', campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', role: '' }]);
ok('a sign-up sent with the old department name is still gated for approval', r.body.ok === true && r.body.pending === true, JSON.stringify(r.body));
const stored = mem.staff.find(s => s.username === 'newlead');
ok('and is stored under the new names', stored && stored.dept === 'Campus Leadership' && stored.ministry === 'Campus Director', JSON.stringify(stored && [stored.dept, stored.ministry]));
r = await call('grantAdmin', ['admincode', 'naomi', true]);
ok('admin can still be granted to a Base Director-era account', r.body.ok === true, JSON.stringify(r.body));
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_cafe', { dept: 'Base Leadership', ministry: 'Campus Leadership' }]);
ok('an admin edit sent with the old names is stored under the new ones', r.body.ok === true && r.body.staff.dept === 'Campus Leadership' && r.body.staff.ministry === 'Campus Director', JSON.stringify(r.body.staff && [r.body.staff.dept, r.body.staff.ministry]));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
