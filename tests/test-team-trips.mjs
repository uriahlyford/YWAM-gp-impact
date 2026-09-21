/* Outreach Teams — one record per team, not a weekly form.

   Against the real api.js: the seeded teams (imported from the old Lovable
   hub) read back for Siem Reap; who may add, edit and delete a team is who
   may log for the ministry; a saved record is cleaned; a team turns into
   weekly rows in the week it LEAVES — 'Teams Hosted' plus each metric — for
   the Base dashboard (getData) and the ministry's own payload, replacing
   any hand-logged row for the same week; a cancelled team counts nowhere;
   deleting a seeded team hides it without touching the seed. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('team-trips');
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
fs.copyFileSync(REPO + '/netlify/functions/hr-seed.js', TMP + '/hr-seed.js');
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const seed = (await import(TMP + '/team-seed.js')).default;
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const YR = new Date().getUTCFullYear();

const TEAMS = { id: 'st_teams', name: 'Sok', username: 'sok', campus: 'siemreap', dept: 'Community Service', ministry: 'Outreach Teams', role: '', active: true };
const CAFE = { id: 'st_cafe', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', role: '', active: true };
const OVERSEER = { id: 'st_ov', name: 'Sina', username: 'sina', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Community Service', role: '', active: true };
const POIPET = { id: 'st_pp', name: 'Bopha', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', active: true };
const ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', active: true, isAdmin: true };
mem.staff = [TEAMS, CAFE, OVERSEER, POIPET, ADMIN].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
// the week a date falls in, the way api.js counts them
function wkOf(iso) { const d = new Date(iso + 'T00:00:00'); const j = new Date(d.getFullYear(), 0, 1); const m = new Date(d.getFullYear(), 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); }

console.log('=== the imported teams ===');
let r = await call('getTeamTrips', ['sok', '1234', 'siemreap']);
ok('Outreach Teams staff read the campus’s teams', r.body.ok === true && r.body.trips.length === seed.length, r.body.trips && r.body.trips.length + ' of ' + seed.length);
ok('newest first', r.body.trips[0].from >= r.body.trips[1].from, r.body.trips[0].from + ' ≥ ' + r.body.trips[1].from);
ok('and may edit them', r.body.canEdit === true);
const kona = r.body.trips.find(t => t.id === 'lv_5c43edf9');
ok('a team keeps its record — who, when, how many, its numbers', kona && kona.name === 'YWAM Ships Kona' && kona.from === '2024-10-20' && kona.to === '2024-11-30' && kona.size === 9 &&
  kona.metrics['People Served'] === 2435 && kona.metrics['Community Service Hours'] === 210 && kona.reached.male === 953, JSON.stringify(kona && kona.metrics));
r = await call('getTeamTrips', ['dara', '1234', 'siemreap']);
ok('a Cafe member can read them too, but not edit', r.body.ok === true && r.body.canEdit === false);
r = await call('getTeamTrips', ['sina', '1234', 'siemreap']);
ok('the department’s overseer may edit', r.body.canEdit === true);
r = await call('getTeamTrips', ['bopha', '1234', 'poipet']);
ok('Poipet has no teams of its own — the import was Siem Reap’s', r.body.ok === true && r.body.trips.length === 0);
r = await call('getTeamTrips', ['nobody', '0000', 'siemreap']);
ok('a bad login gets nothing', r.body.ok === false);

console.log('\n=== adding a team ===');
const TRIP = { name: '  Endeavour DTS 2 ', org: 'YWAM Kona', country: 'United States', from: YR + '-03-02', to: YR + '-03-20', size: 12, males: 5, females: 7, couples: 1, families: 0,
  staff: 'Sok', focus: 'Evangelism', status: 'active', notes: 'Great team',
  metrics: { 'People Served': 300, 'Salvations': 4, 'Teams Hosted': 99, 'Base Finances ($)': 5, 'Kids Classes Run': 'abc' }, reached: { male: 120, female: 180 } };
r = await call('saveTeamTrip', ['dara', '1234', TRIP]);
ok('a member of another ministry cannot add a team', r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));
r = await call('saveTeamTrip', ['bopha', '1234', { ...TRIP, campus: 'siemreap' }]);
ok('nor can Outreach Teams staff from the other campus', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('saveTeamTrip', ['sok', '1234', { ...TRIP, to: YR + '-02-01' }]);
ok('a team that leaves before it arrives is refused', r.body.ok === false && r.body.err === 'bad_trip');
r = await call('saveTeamTrip', ['sok', '1234', { ...TRIP, name: '' }]);
ok('as is one with no name', r.body.ok === false && r.body.err === 'bad_trip');
r = await call('saveTeamTrip', ['sok', '1234', TRIP]);
ok('its own staff add one', r.body.ok === true && r.body.trips.length === seed.length + 1, JSON.stringify(r.body.ok));
const added = r.body.trips.find(t => t.name === 'Endeavour DTS 2');
ok('the record is cleaned: name trimmed, campus set from the caller, an id minted', added && added.campus === 'siemreap' && /^tt_/.test(added.id) && added.size === 12 && added.males === 5, JSON.stringify(added && [added.campus, added.id, added.size]));
ok('Teams Hosted is not a metric a team carries (it is the count), a sensitive metric is dropped, junk is dropped', added && !('Teams Hosted' in added.metrics) && !('Base Finances ($)' in added.metrics) && !('Kids Classes Run' in added.metrics) && added.metrics['People Served'] === 300, JSON.stringify(added && added.metrics));
ok('the men/women split is kept', added && added.reached.male === 120 && added.reached.female === 180);
ok('the store holds only the new row — the seed is never copied in', mem.teamTrips.length === 1);
const newId = added.id;

console.log('\n=== teams become weekly rows for the dashboards ===');
r = await call('getData', ['leadercode', YR]);
const sr = r.body.entries.siemreap || {};
const wk = wkOf(YR + '-03-20');
ok('the Base payload counts the team in the week it left', sr['Community Service|Outreach Teams|Teams Hosted'] && sr['Community Service|Outreach Teams|Teams Hosted'][wk] === 1, JSON.stringify(sr['Community Service|Outreach Teams|Teams Hosted']));
ok('with its metrics as that week’s figures', sr['Community Service|Outreach Teams|People Served'][wk] === 300 && sr['Community Service|Outreach Teams|Salvations'][wk] === 4);
r = await call('getData', ['leadercode', 2024]);
const sr24 = r.body.entries.siemreap || {};
ok('the imported 2024 teams show in 2024', sr24['Community Service|Outreach Teams|Teams Hosted'] && Object.keys(sr24['Community Service|Outreach Teams|Teams Hosted']).length > 0 &&
  sr24['Community Service|Outreach Teams|People Served'][wkOf('2024-11-30')] === 2435, JSON.stringify(sr24['Community Service|Outreach Teams|Teams Hosted']));
ok('a team that left in January counts in the new year, not the year it arrived', (() => { const t = seed.find(s => s.id === 'lv_cf50a2eb'); return t.from.startsWith('2024') && t.to.startsWith('2025'); })() &&
  !(sr24['Community Service|Outreach Teams|Teams Hosted'][wkOf('2025-01-13')]));

// a hand-logged row for the same week is replaced, not added to
mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Teams Hosted', week: wk, year: YR, value: 7 },
  { campus: 'siemreap', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Baptisms', week: wk, year: YR, value: 2 },
  { campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: wk, year: YR, value: 50 }];
r = await call('getData', ['leadercode', YR]);
const sr2 = r.body.entries.siemreap;
ok('a hand-logged Teams Hosted for that week is replaced by the team count, not summed', sr2['Community Service|Outreach Teams|Teams Hosted'][wk] === 1, sr2['Community Service|Outreach Teams|Teams Hosted'][wk]);
ok('a hand-logged metric no team carries is left alone', sr2['Community Service|Outreach Teams|Baptisms'][wk] === 2);
ok('other ministries are untouched', sr2['Community Service|Cafe|Cups Sold'][wk] === 50);
r = await call('getMyMinistry', ['sok', '1234']);
ok('the ministry’s own payload reads the same rows', r.body.entries['Teams Hosted'][String(wk)] === 1 && r.body.entries['People Served'][String(wk)] === 300, JSON.stringify(r.body.entries['Teams Hosted']));
r = await call('getMyBoot', ['sok', '1234']);
ok('boot brings Outreach Teams staff their teams', r.body.teamTrips && r.body.teamTrips.ok && r.body.teamTrips.trips.length === seed.length + 1);
r = await call('getMyBoot', ['dara', '1234']);
ok('and nobody else’s (they load on demand)', r.body.teamTrips === null);

console.log('\n=== editing, cancelling, deleting ===');
r = await call('saveTeamTrip', ['sina', '1234', { ...TRIP, id: newId, metrics: { 'People Served': 350 }, status: 'cancelled' }]);
ok('the overseer edits it — same id, no second row', r.body.ok === true && r.body.trips.length === seed.length + 1 && mem.teamTrips.length === 1);
r = await call('getData', ['leadercode', YR]);
ok('a cancelled team counts nowhere', !(r.body.entries.siemreap['Community Service|Outreach Teams|People Served'] || {})[wk] && r.body.entries.siemreap['Community Service|Outreach Teams|Teams Hosted'][wk] === 7, JSON.stringify(r.body.entries.siemreap['Community Service|Outreach Teams|Teams Hosted']));
r = await call('saveTeamTrip', ['uriah', '1234', { ...TRIP, id: 'lv_5c43edf9', campus: 'siemreap', name: 'YWAM Ships Kona', from: '2024-10-20', to: '2024-11-30', metrics: { 'People Served': 100 }, status: 'active' }]);
ok('an admin edits a seeded team — the edit is stored under the seed’s id', r.body.ok === true && mem.teamTrips.some(x => x.id === 'lv_5c43edf9'));
r = await call('getTeamTrips', ['sok', '1234', 'siemreap']);
ok('and the edited version is what reads back, still one team', r.body.trips.filter(t => t.id === 'lv_5c43edf9').length === 1 && r.body.trips.find(t => t.id === 'lv_5c43edf9').metrics['People Served'] === 100);
r = await call('deleteTeamTrip', ['dara', '1234', 'lv_675a9e39']);
ok('a Cafe member cannot delete', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('deleteTeamTrip', ['sok', '1234', 'lv_675a9e39']);
ok('its staff delete a seeded team', r.body.ok === true && !r.body.trips.some(t => t.id === 'lv_675a9e39'), r.body.trips && r.body.trips.length);
ok('by tombstone — the seed file is data, never rewritten', mem.teamTrips.some(x => x.id === 'lv_675a9e39' && x.deleted === true) && seed.some(s => s.id === 'lv_675a9e39'));
r = await call('deleteTeamTrip', ['sok', '1234', 'lv_675a9e39']);
ok('deleting it again says it is gone', r.body.ok === false && r.body.err === 'not_found');
r = await call('deleteTeamTrip', ['sok', '1234', newId]);
ok('and its own new team can be deleted', r.body.ok === true && r.body.trips.length === seed.length - 1);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
