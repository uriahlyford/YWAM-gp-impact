/* Ministry leaders, personal numbers, and renaming a custom metric.

   Three things this redesign added to the server, against the real api.js:

   · A "leads" list on the staff record — which ministries someone leads,
     assigned only by an admin (adminUpdateStaff). Changing WHAT a ministry
     tracks (hide/add/rename a metric, move it weekly → monthly/quarterly)
     is now that leader's right, or an admin's, or the campus leadership
     department's. Logging numbers stays open to the whole ministry.
   · Personal numbers — a person's own four weekly figures, keyed by staff
     id, never pooled anywhere.
   · Renaming a custom metric moves its numbers with it: the weekly entries,
     the daily rows behind them, and any key result pointing at it. The name
     is the join key, so a rename that only changed the list would orphan
     the ministry's own history. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('ministry-leader');
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

const ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Campus Leadership',
  ministry: 'Campus Director', role: '', active: true, isAdmin: true };
const LEAD = { id: 'st_lead', name: 'Sreilea', username: 'sreilea', campus: 'poipet', dept: 'Community Service',
  ministry: 'Cafe', role: '', active: true };
const MEMBER = { id: 'st_member', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Community Service',
  ministry: 'Cafe', role: '', active: true };
const OTHER_CAMPUS = { id: 'st_sr', name: 'Bopha', username: 'bopha', campus: 'siemreap', dept: 'Community Service',
  ministry: 'Cafe', role: '', active: true, leads: ['Community Service|Cafe'] };
mem.staff = [ADMIN, LEAD, MEMBER, OTHER_CAMPUS].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const cafe = ['poipet', 'Community Service', 'Cafe'];

console.log('=== who may change what Cafe tracks ===');
let r = await call('saveMetricOverrides', ['sreilea', '1234', ...cafe, [], ['Latte Art Score (1-10)']]);
ok('before anyone is made leader, a Cafe member cannot change the list', r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));

r = await call('adminUpdateStaff', ['dara', '1234', 'st_lead', { leads: ['Community Service|Cafe'] }]);
ok('a non-admin cannot hand out the leader role', r.body.ok === false, JSON.stringify(r.body));

r = await call('adminUpdateStaff', ['uriah', '1234', 'st_lead', { leads: ['Community Service|Cafe', 'Community Service|Cafe', 'garbage', ''] }]);
ok('an admin can make someone a ministry leader', r.body.ok === true && JSON.stringify(r.body.staff.leads) === JSON.stringify(['Community Service|Cafe']),
  JSON.stringify(r.body.staff && r.body.staff.leads));

r = await call('getMyBoot', ['dara', '1234']);
const sreileaInRoster = (r.body.roster || []).find(p => p.id === 'st_lead');
ok('the roster everyone gets carries who leads what', !!sreileaInRoster && sreileaInRoster.leads[0] === 'Community Service|Cafe', JSON.stringify(sreileaInRoster && sreileaInRoster.leads));

r = await call('saveMetricOverrides', ['sreilea', '1234', ...cafe, ['Days Open'], ['Latte Art Score (1-10)'], { 'Cups Sold': 'month' }]);
ok('the leader can hide, add AND move a count to monthly in one save', r.body.ok === true &&
  r.body.metricOverrides[0].hidden.includes('Days Open') && r.body.metricOverrides[0].custom.includes('Latte Art Score (1-10)') &&
  r.body.metricOverrides[0].cadence['Cups Sold'] === 'month', JSON.stringify(r.body.metricOverrides));

r = await call('saveMetricOverrides', ['dara', '1234', ...cafe, [], []]);
ok('an ordinary member still cannot', r.body.ok === false && r.body.err === 'not_authorized');

r = await call('saveMetricOverrides', ['bopha', '1234', ...cafe, [], []]);
ok('leading the SAME ministry on the other campus does not count', r.body.ok === false && r.body.err === 'not_authorized');

r = await call('saveMyMinistry', ['dara', '1234', 20, [{ metric: 'Cups Sold', value: 40 }]]);
ok('logging the numbers is still open to every member', r.body.ok === true, JSON.stringify(r.body.ok));

console.log('\n=== renaming a custom metric moves its history ===');
mem.entries = [
  { campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', metric: 'Latte Art Score (1-10)', week: 20, year: new Date().getUTCFullYear(), value: 7 },
  { campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: 20, year: new Date().getUTCFullYear(), value: 40 },
  { campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Latte Art Score (1-10)', week: 20, year: new Date().getUTCFullYear(), value: 3 },
];
mem.kpiDaily = [{ campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', metric: 'Latte Art Score (1-10)', date: '2026-05-12', week: 20, value: 7 }];
// the okrs blob is one row per key result, as saveObjective writes it
mem.okrs = [{ id: 'o1', campus: 'poipet', quarter: 2, dept: 'Community Service', objective: 'Better coffee',
  kr: 'Latte art', metricKey: 'Community Service|Cafe|Latte Art Score (1-10)', target: 9, manualPct: 0 }];

r = await call('renameCustomMetric', ['dara', '1234', ...cafe, 'Latte Art Score (1-10)', 'Latte Art (1-10)']);
ok('a member cannot rename', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('renameCustomMetric', ['sreilea', '1234', ...cafe, 'Cups Sold', 'Cups']);
ok('a baseline metric cannot be renamed — it belongs to the shared taxonomy', r.body.ok === false && r.body.err === 'not_custom', JSON.stringify(r.body));
r = await call('renameCustomMetric', ['sreilea', '1234', ...cafe, 'Latte Art Score (1-10)', 'Base Finances ($)']);
ok('a sensitive name is refused', r.body.ok === false && r.body.err === 'reserved');

r = await call('renameCustomMetric', ['sreilea', '1234', ...cafe, 'Latte Art Score (1-10)', 'Latte Art (1-10)']);
ok('the leader can rename their own custom metric', r.body.ok === true && r.body.metricOverrides[0].custom.includes('Latte Art (1-10)') &&
  !r.body.metricOverrides[0].custom.includes('Latte Art Score (1-10)'), JSON.stringify(r.body));
const poipetRow = mem.entries.find(e => e.campus === 'poipet' && e.metric === 'Latte Art (1-10)');
const oldPoipet = mem.entries.find(e => e.campus === 'poipet' && e.metric === 'Latte Art Score (1-10)');
ok('the weekly number moved to the new name', !!poipetRow && poipetRow.value === 7 && !oldPoipet);
ok('Siem Reap’s same-named metric was left alone', mem.entries.some(e => e.campus === 'siemreap' && e.metric === 'Latte Art Score (1-10)'));
ok('the day-by-day row moved too', mem.kpiDaily[0].metric === 'Latte Art (1-10)');
ok('the key result now points at the new name', mem.okrs[0].metricKey === 'Community Service|Cafe|Latte Art (1-10)', mem.okrs[0].metricKey);
ok('the untouched metric is untouched', mem.entries.some(e => e.metric === 'Cups Sold' && e.value === 40));

console.log('\n=== personal numbers ===');
r = await call('saveMyPersonalWeek', ['dara', '1234', 20, [{ metric: 'People I Encouraged', value: 4 }, { metric: 'Teachings Prepped', value: 1 }]]);
ok('a member saves their own week', r.body.ok === true && r.body.entries['People I Encouraged']['20'] === 4, JSON.stringify(r.body));
r = await call('saveMyPersonalWeek', ['sreilea', '1234', 20, [{ metric: 'People I Encouraged', value: 9 }]]);
ok('someone else saving the same metric and week does not touch it', r.body.ok === true && r.body.entries['People I Encouraged']['20'] === 9);
r = await call('getMyPersonal', ['dara', '1234']);
ok('each person reads back only their own', r.body.entries['People I Encouraged']['20'] === 4 && r.body.entries['Teachings Prepped']['20'] === 1, JSON.stringify(r.body));
r = await call('saveMyPersonalWeek', ['dara', '1234', 20, [{ metric: 'Teachings Prepped', value: null }]]);
ok('clearing a box removes the row', !('Teachings Prepped' in r.body.entries), JSON.stringify(r.body.entries));
r = await call('saveMyPersonalWeek', ['dara', '1234', 99, [{ metric: 'People I Encouraged', value: 1 }]]);
ok('a week outside 1–52 is refused', r.body.ok === false && r.body.err === 'bad_week');
r = await call('getMyBoot', ['dara', '1234']);
ok('the boot payload carries the personal numbers (no extra call on open)', r.body.personal && r.body.personal.entries['People I Encouraged']['20'] === 4);
r = await call('getData', ['leadercode']);
ok('personal numbers never reach the dashboard payload', !JSON.stringify(r.body).includes('People I Encouraged'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
