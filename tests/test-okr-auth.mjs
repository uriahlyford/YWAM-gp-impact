/* The OKR write boundary, tested against the real api.js.

   Staff may write their own campus + department and nothing else. This is the
   part that would actually matter if it were wrong, so it is tested against the
   shipped handler rather than reasoned about: a fake Netlify Blobs store is
   injected, and the dispatcher is called exactly as the frontend calls it. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('okrauth');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });

/* an in-memory stand-in for @netlify/blobs */
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem = {};
export function getStore(){
  return {
    get: async (k) => (k in mem ? JSON.parse(JSON.stringify(mem[k])) : null),
    setJSON: async (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); },
  };
}
export const __mem = mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');

process.env.GP_LEADER_CODE = 'leadercode';

const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;

/* How api.js hashes a PIN. Reimplemented rather than imported (it isn't
   exported), with an assertion that the source still does it this way — so if
   the hashing ever changes, this test says so instead of silently passing on
   staff who can no longer log in. */
const EXPECTED_HASH = "crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex')";
const apiSrc = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
if (!apiSrc.includes(EXPECTED_HASH)) {
  throw new Error('hashPin_ no longer matches this test — update EXPECTED_HASH and mkHash together');
}
const mkHash = (pin, salt) =>
  crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const SOKHA = { id: 'st_sokha', name: 'Sokha', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', role: '', active: true, photo: '' };
const CHANNA = { id: 'st_channa', name: 'Channa', username: 'channa', campus: 'siemreap',
  dept: 'Leadership Development', ministry: 'GPDTS', role: '', active: true, photo: '' };
const MEALEA = { id: 'st_mealea', name: 'Mealea', username: 'mealea', campus: 'poipet',
  dept: 'Youth Education', ministry: 'YDC', role: '', active: true, photo: '' };

function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [SOKHA, CHANNA, MEALEA].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
  mem.okrs = [];
  mem.entries = [];
  mem.survey = [];
}

/* call the dispatcher the way the frontend does */
async function call(fn, args) {
  const res = await api.default({
    method: 'POST',
    json: async () => ({ fn, args }),
    headers: new Map(),
  }, {});
  const txt = await res.text();
  return JSON.parse(txt);
}

function okrIds() { return [...new Set((mem.okrs || []).map(r => r.id))]; }
function okrRow(id) { return (mem.okrs || []).filter(r => r.id === id)[0]; }

const fails = [];
const check = (name, cond, detail) => {
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (cond ? '' : '  ← ' + detail));
  if (!cond) fails.push(name);
};

const objFor = (id, campus, dept) => ({
  id, campus, dept, quarter: 3, objective: 'Obj ' + id,
  krs: [{ text: 'kr', metricKey: '', target: 0, manual: 10 }],
});

seed();

// 1. a staff member creates one for their own department
await call('saveObjective', [objFor('o1', 'poipet', 'Community Service'), '', 'sokha', '1234']);
check('staff creates their own department’s objective', okrIds().includes('o1'), okrIds().join(','));

// 2. the payload cannot claim another department — server pins it to the staff record
await call('saveObjective', [objFor('o2', 'poipet', 'Youth Education'), '', 'sokha', '1234']);
const o2 = okrRow('o2');
check('payload department is ignored, staff record wins',
  o2 && o2.dept === 'Community Service', o2 ? o2.dept : 'missing');

// 3. nor another campus
await call('saveObjective', [objFor('o3', 'siemreap', 'Community Service'), '', 'sokha', '1234']);
const o3 = okrRow('o3');
check('payload campus is ignored too', o3 && o3.campus === 'poipet', o3 ? o3.campus : 'missing');

// 4. a staff member cannot overwrite another department's objective
seed();
mem.okrs = [{ id: 'ye1', campus: 'poipet', dept: 'Youth Education', quarter: 3,
  objective: 'Theirs', kr: 'kr', metricKey: '', target: 0, manualPct: 0 }];
await call('saveObjective', [{ ...objFor('ye1', 'poipet', 'Youth Education'), objective: 'HIJACKED' }, '', 'sokha', '1234']);
check('cannot overwrite another department’s objective',
  okrRow('ye1') && okrRow('ye1').objective === 'Theirs', okrRow('ye1') && okrRow('ye1').objective);

// 5. …nor delete it
await call('deleteObjective', ['ye1', '', 'sokha', '1234']);
check('cannot delete another department’s objective', !!okrRow('ye1'), 'it was deleted');

// 6. …but can delete their own
mem.okrs.push({ id: 'cs1', campus: 'poipet', dept: 'Community Service', quarter: 3,
  objective: 'Mine', kr: 'kr', metricKey: '', target: 0, manualPct: 0 });
await call('deleteObjective', ['cs1', '', 'sokha', '1234']);
check('can delete their own department’s objective', !okrRow('cs1'), 'still there');

// 7. the same department at the OTHER campus is not theirs
seed();
mem.okrs = [{ id: 'sr1', campus: 'siemreap', dept: 'Community Service', quarter: 3,
  objective: 'Siem Reap’s', kr: 'kr', metricKey: '', target: 0, manualPct: 0 }];
await call('deleteObjective', ['sr1', '', 'sokha', '1234']);
check('same department, other campus, still refused', !!okrRow('sr1'), 'it was deleted');

// 8. a wrong PIN writes nothing
seed();
await call('saveObjective', [objFor('bad', 'poipet', 'Community Service'), '', 'sokha', '9999']);
check('wrong PIN writes nothing', !okrIds().length, okrIds().join(','));

// 9. no credentials at all writes nothing
await call('saveObjective', [objFor('anon', 'poipet', 'Community Service'), '', '', '']);
check('no credentials writes nothing', !okrIds().length, okrIds().join(','));

// 10. the leader code still writes any department, as the dashboard needs
seed();
await call('saveObjective', [objFor('lead', 'siemreap', 'Youth Education'), 'leadercode']);
const lead = okrRow('lead');
check('leader code writes any campus + department',
  lead && lead.campus === 'siemreap' && lead.dept === 'Youth Education',
  lead ? lead.campus + '|' + lead.dept : 'missing');

// 11. a wrong leader code writes nothing
seed();
await call('saveObjective', [objFor('nope', 'poipet', 'Community Service'), 'wrongcode']);
check('wrong leader code writes nothing', !okrIds().length, okrIds().join(','));

// 12. editing preserves the hand-tracked percentage the frontend sends back
seed();
await call('saveObjective', [{ id: 'm1', campus: 'poipet', dept: 'Community Service', quarter: 3,
  objective: 'Manual', krs: [{ text: 'by hand', metricKey: '', target: 0, manual: 45 }] }, '', 'sokha', '1234']);
check('manual percentage is stored', okrRow('m1') && okrRow('m1').manualPct === 45,
  okrRow('m1') && okrRow('m1').manualPct);

// 13. staff at another campus/department writes their own fine (no cross-talk)
seed();
await call('saveObjective', [objFor('ch1', 'poipet', 'Community Service'), '', 'channa', '1234']);
const ch1 = okrRow('ch1');
check('another staff member is pinned to their own campus + dept',
  ch1 && ch1.campus === 'siemreap' && ch1.dept === 'Leadership Development',
  ch1 ? ch1.campus + '|' + ch1.dept : 'missing');

console.log(fails.length ? '\n' + fails.length + ' FAILED:\n - ' + fails.join('\n - ')
                         : '\nall 13 authorization checks passed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fails.length ? 1 : 0);
