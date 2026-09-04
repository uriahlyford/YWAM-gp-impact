/* Not every ministry tracks the same things: a ministry's own staff (or an
   admin, or the Base Leadership overseer of its department) can hide a
   baseline metric or add one of their own. saveMetricOverrides is the one
   server function behind that — getDepartments() in taxonomy.js merges the
   result in client-side, so this only has to prove the write is guarded
   right and the data comes back out through getData(). */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('ministry-metrics');
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
  dept: 'Base Leadership', ministry: 'Campus Leadership', role: '', active: true, isAdmin: true };
const CAFE = { id: 'st_cafe', name: 'Sreilea', username: 'sreilea', campus: 'poipet',
  dept: 'Community Service', ministry: 'Cafe', role: '', active: true, isAdmin: false };
const OUTREACH = { id: 'st_outreach', name: 'Dara', username: 'dara', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', role: '', active: true, isAdmin: false };
const CS_OVERSEER = { id: 'st_overseer', name: 'Sina', username: 'sina', campus: 'poipet',
  dept: 'Base Leadership', ministry: 'Community Service', role: '', active: true, isAdmin: false };

function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ADMIN, CAFE, OUTREACH, CS_OVERSEER].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
}
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return JSON.parse(await res.text());
}
const fails = [];
const check = (n, c, d) => { console.log((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : '  ← ' + d)); if (!c) fails.push(n); };

seed();

/* 1. wrong PIN writes nothing */
let r = await call('saveMetricOverrides', ['sreilea', '9999', 'poipet', 'Community Service', 'Cafe', [], ['Latte Art Score (1-10)']]);
check('wrong PIN is refused', r.ok === false);
check('and nothing was stored', !(mem.metricOverrides || []).length);

/* 2. a ministry's own staff can edit their own ministry */
r = await call('saveMetricOverrides', ['sreilea', '1234', 'poipet', 'Community Service', 'Cafe',
  ['Days Open'], ['Latte Art Score (1-10)']]);
check('own-ministry staff can save', r.ok === true, JSON.stringify(r));
check('hidden metric stored', r.metricOverrides[0].hidden.includes('Days Open'));
check('custom metric stored', r.metricOverrides[0].custom.includes('Latte Art Score (1-10)'));

/* 3. a different ministry in the same department cannot touch Cafe's list */
r = await call('saveMetricOverrides', ['dara', '1234', 'poipet', 'Community Service', 'Cafe', [], ['Snooping (%)']]);
check('a teammate in a different ministry is refused', r.ok === false && r.err === 'not_authorized', JSON.stringify(r));

/* 4. the Base Leadership overseer of the department can */
r = await call('saveMetricOverrides', ['sina', '1234', 'poipet', 'Community Service', 'Cafe',
  ['Days Open'], ['Latte Art Score (1-10)', 'Oat Milk Stock (%)']]);
check('the department overseer can also edit it', r.ok === true, JSON.stringify(r));
check('their edit is what stuck', r.metricOverrides[0].custom.includes('Oat Milk Stock (%)'));

/* 5. an admin can edit ANY ministry, including one outside their own department */
r = await call('saveMetricOverrides', ['uriah', '1234', 'poipet', 'Youth Education', 'YDC', [], ['Tuition Collected ($)']]);
check('an admin can edit an unrelated ministry', r.ok === true, JSON.stringify(r));

/* 6. a Sensitive name is quietly refused as a custom metric, not stored —
   alongside a normal one in the same save, so this also confirms one bad
   name doesn't sink the whole request. */
r = await call('saveMetricOverrides', ['uriah', '1234', 'poipet', 'Community Service', 'Cafe',
  [], ['Latte Art Score (1-10)', 'Base Finances ($)']]);
const cafeAfterSensitive = r.metricOverrides.find(x => x.ministry === 'Cafe');
check('a Sensitive name never becomes a custom metric',
  r.ok === true && !cafeAfterSensitive.custom.includes('Base Finances ($)'), JSON.stringify(cafeAfterSensitive));
check('a normal name in the same save still goes through',
  cafeAfterSensitive.custom.includes('Latte Art Score (1-10)'), JSON.stringify(cafeAfterSensitive));

/* 7. a bad target is refused outright */
r = await call('saveMetricOverrides', ['uriah', '1234', '', 'Community Service', 'Cafe', [], []]);
check('a missing campus is refused', r.ok === false && r.err === 'bad_target');

/* 8. too many custom metrics at once is refused */
const many = Array.from({ length: 30 }, (_, i) => 'Metric ' + i);
r = await call('saveMetricOverrides', ['sreilea', '1234', 'poipet', 'Community Service', 'Cafe', [], many]);
check('an oversized custom list is refused', r.ok === false && r.err === 'too_many');

/* 9. getData carries the overrides so both pages can merge them into
   getDepartments() before they render a single tile */
r = await call('getData', ['']);
check('getData ships metricOverrides', Array.isArray(r.metricOverrides) && r.metricOverrides.length > 0,
  JSON.stringify(r.metricOverrides));
const cafeRec = r.metricOverrides.find(x => x.campus === 'poipet' && x.dept === 'Community Service' && x.ministry === 'Cafe');
check('Cafe’s own record is in it', !!cafeRec && cafeRec.custom.includes('Latte Art Score (1-10)'), JSON.stringify(cafeRec));

/* 10. re-saving replaces the record rather than appending a second one */
r = await call('saveMetricOverrides', ['sreilea', '1234', 'poipet', 'Community Service', 'Cafe', [], ['Latte Art Score (1-10)']]);
const cafeRecs = r.metricOverrides.filter(x => x.campus === 'poipet' && x.dept === 'Community Service' && x.ministry === 'Cafe');
check('one record per (campus,dept,ministry), not a growing list', cafeRecs.length === 1, cafeRecs.length);
check('hidden clears when the caller sends none', cafeRecs[0].hidden.length === 0, JSON.stringify(cafeRecs[0]));

console.log(fails.length ? '\n' + fails.length + ' FAILED:\n - ' + fails.join('\n - ')
                         : '\nall ministry-metric checks passed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fails.length ? 1 : 0);
