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
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js'); // and the portal's shipped forms // api.js imports it
fs.copyFileSync(REPO + '/netlify/functions/legal-docs-default.js', TMP + '/legal-docs-default.js');  // the legal forms teams sign
fs.copyFileSync(REPO + '/netlify/functions/legal-pdf.js', TMP + '/legal-pdf.js');  // and the signed-PDF builder

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
const URIAH = { id: 'st_uriah', name: 'Uriah', username: 'uriah', campus: 'siemreap',
  dept: 'Campus Leadership', ministry: 'Campus Director', role: '', active: true, photo: '', isAdmin: true };

function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [SOKHA, CHANNA, MEALEA, URIAH].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
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

// 14. an app admin reaches every campus and department
seed();
await call('saveObjective', [objFor('ad1', 'poipet', 'Youth Education'), '', 'uriah', '1234']);
const ad1 = okrRow('ad1');
check('an admin creates an objective for another campus and department', ad1 && ad1.campus === 'poipet' && ad1.dept === 'Youth Education', ad1 ? ad1.campus + '|' + ad1.dept : 'missing');
await call('saveObjective', [objFor('s1', 'poipet', 'Community Service'), '', 'sokha', '1234']);
await call('saveObjective', [{ ...objFor('s1', 'poipet', 'Community Service'), objective: 'Edited by the admin' }, '', 'uriah', '1234']);
check('an admin edits another department’s objective', okrRow('s1') && okrRow('s1').objective === 'Edited by the admin' && okrRow('s1').dept === 'Community Service', okrRow('s1') && okrRow('s1').objective);
await call('saveObjective', [{ ...objFor('s1', 'poipet', 'Community Service'), krs: [{ text: 'kr', metricKey: '', target: 0, manual: 75 }] }, '', 'uriah', '1234']);
check('and moves its hand-tracked percentage', okrRow('s1') && Number(okrRow('s1').manualPct) === 75, okrRow('s1') && okrRow('s1').manualPct);
await call('deleteObjective', ['s1', '', 'uriah', '1234']);
check('and deletes it', !okrIds().includes('s1'), okrIds().join(','));
await call('saveObjective', [objFor('m9', 'poipet', 'Youth Education'), '', 'mealea', '1234']);
await call('saveObjective', [{ ...objFor('m9', 'poipet', 'Youth Education'), objective: 'Hijack' }, '', 'sokha', '1234']);
check('a non-admin still cannot touch another department’s', okrRow('m9') && okrRow('m9').objective === 'Obj m9', okrRow('m9') && okrRow('m9').objective);
mem.staff = mem.staff.map(s => s.id === 'st_uriah' ? { ...s, active: false } : s);
await call('saveObjective', [objFor('ad2', 'poipet', 'Youth Education'), '', 'uriah', '1234']);
check('a deactivated admin has no reach', !okrIds().includes('ad2') || (okrRow('ad2') && okrRow('ad2').campus === 'siemreap'), okrIds().join(','));

// more than three key results: all of them are kept, up to the server cap of ten
const manyKrs = (n) => Array.from({ length: n }, (_, i) => ({ text: "kr " + (i + 1), metricKey: "", target: 0, manual: 0 }));
await call("saveObjective", [{ ...objFor("many7", "poipet", "Community Service"), krs: manyKrs(7) }, "", "sokha", "1234"]);
const rows7 = (mem.okrs || []).filter(r => r.id === "many7");
check("an objective keeps all seven of its key results", rows7.length === 7 && rows7[6].kr === "kr 7", rows7.length);
await call("saveObjective", [{ ...objFor("many12", "poipet", "Community Service"), krs: manyKrs(12) }, "", "sokha", "1234"]);
const rows12 = (mem.okrs || []).filter(r => r.id === "many12");
check("but no more than ten are stored", rows12.length === 10 && rows12[9].kr === "kr 10", rows12.length);

// headings and counts come back as saved, and re-saving keeps the objective in its place
await call("saveObjective", [{ ...objFor("ord1", "poipet", "Community Service"), krs: [
  { text: "budget", group: "Money", metricKey: "", target: 0, manual: 40 },
  { text: "recruit", group: "", kind: "count", current: 3, metricKey: "", target: 20, manual: 0 }] }, "", "sokha", "1234"]);
await call("saveObjective", [objFor("ord2", "poipet", "Community Service"), "", "sokha", "1234"]);
const beforeOrder = okrIds().filter(i => /^ord/.test(i)).join(",");
const back = await call("saveObjective", [{ ...objFor("ord1", "poipet", "Community Service"), krs: [
  { text: "budget", group: "Money", metricKey: "", target: 0, manual: 60 },
  { text: "recruit", group: "", kind: "count", current: 5, metricKey: "", target: 20, manual: 0 }] }, "", "sokha", "1234"]);
check("re-saving an objective keeps its place", okrIds().filter(i => /^ord/.test(i)).join(",") === beforeOrder && beforeOrder === "ord1,ord2", okrIds().join(","));
const ord1 = (back.okrs || []).find(o => o.id === "ord1");
check("headings, counts and the count so far come back", ord1 && ord1.krs[0].group === "Money" && ord1.krs[0].manual === 60 &&
  ord1.krs[1].kind === "count" && ord1.krs[1].current === 5 && ord1.krs[1].target === 20, JSON.stringify(ord1 && ord1.krs));
await call("saveObjective", [{ ...objFor("ord3", "poipet", "Community Service"), krs: [{ text: "x", kind: "sneaky", group: "g".repeat(200), current: -4 }] }, "", "sokha", "1234"]);
const ord3 = okrRow("ord3");
check("an unknown kind, an over-long heading and a negative count are dropped", ord3 && ord3.kind === "" && ord3.group === "" && ord3.current === 0, JSON.stringify(ord3));

console.log(fails.length ? '\n' + fails.length + ' FAILED:\n - ' + fails.join('\n - ')
                         : '\nall 24 authorization checks passed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fails.length ? 1 : 0);
