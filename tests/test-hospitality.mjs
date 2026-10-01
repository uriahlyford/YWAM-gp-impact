/* SR Hospitality — rooms, beds and bookings, against the real api.js.

   Who may open it (the Hospitality ministry under Skills Training — members,
   other-ministry members, leaders, the Skills Training overseer — and
   admins; nobody else, no applicant); the boot flag that shows the menu
   item; buildings → rooms → beds; a booking is cleaned (category, dates the
   right way round, a permanent stay only for staff, count at least the
   people and the named beds); a named bed can't be in two bookings on the
   same night, but can the night after; a bed out for maintenance takes
   nobody; a building with rooms can't go, nor a room someone still sleeps
   in; every upcoming team in the Teams Database is a request until a booking
   points at it, and a team's request says when it is still pending. All
   fixtures are made up. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('hospitality');
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
fs.writeFileSync(TMP + '/team-seed.js', 'export default [];');   // no imported teams: only the ones below
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js');
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const st = (o) => ({ role: '', active: true, campus: 'siemreap', ...o });
const PEOPLE = [
  st({ id: 'st_h', name: 'Hana', username: 'hana', dept: 'Skills Training', ministry: 'Hospitality' }),
  st({ id: 'st_m2', name: 'Mali', username: 'mali', dept: 'Community Service', ministry: 'Cafe', ministries: ['Skills Training|Hospitality'] }),
  st({ id: 'st_ld', name: 'Lida', username: 'lida', dept: 'Community Service', ministry: 'Cafe', leads: ['Skills Training|Hospitality'] }),
  st({ id: 'st_ov', name: 'Ovi', username: 'ovi', dept: 'Campus Leadership', ministry: 'Skills Training' }),
  st({ id: 'st_ad', name: 'Adam', username: 'adam', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true }),
  st({ id: 'st_c', name: 'Cafe Kim', username: 'kim', dept: 'Community Service', ministry: 'Cafe' }),
  st({ id: 'st_t', name: 'Teams Tom', username: 'tom', dept: 'Community Service', ministry: 'Outreach Teams' }),
  st({ id: 'st_off', name: 'Gone', username: 'gone', dept: 'Skills Training', ministry: 'Hospitality', active: false }),
  st({ id: 'st_app', name: 'Applicant', username: 'appl', dept: '', ministry: '', applicant: true, kind: 'applicant' }),
  st({ id: 'st_pp', name: 'Poipet Hosp', username: 'pph', campus: 'poipet', dept: 'Skills Training', ministry: 'Hospitality' }),
];
mem.staff = PEOPLE.map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return await res.json().catch(() => null);
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const H = ['hana', '1234'];

console.log('=== who may open it ===');
for (const u of ['hana', 'mali', 'lida', 'ovi', 'adam']) {
  const r = await call('getHospitality', [u, '1234']);
  ok(u + ' opens SR Hospitality', r && r.ok === true && Array.isArray(r.rooms), JSON.stringify(r).slice(0, 80));
  const b = await call('getMyBoot', [u, '1234']);
  ok(u + "'s boot says hospitality", b && b.staff && b.staff.hospitality === true);
}
for (const u of ['kim', 'tom']) {
  const r = await call('getHospitality', [u, '1234']);
  ok(u + ' (another ministry) is turned away', r && r.ok === false && r.err === 'not_authorized', JSON.stringify(r));
  const b = await call('getMyBoot', [u, '1234']);
  ok(u + "'s boot says no hospitality", b && b.staff && b.staff.hospitality === false);
  const w = await call('hospSave', [u, '1234', 'building', { name: 'Sneaky' }]);
  ok(u + ' cannot save a building', w && w.ok === false);
}
for (const u of ['gone', 'appl']) {
  const r = await call('getHospitality', [u, '1234']);
  ok(u + ' (inactive / applicant) gets nothing', r && r.ok === false && !r.rooms);
}
ok('a wrong PIN gets nothing', (await call('getHospitality', ['hana', '9999'])).ok === false);

console.log('=== buildings, rooms, beds ===');
let r = await call('hospSave', [...H, 'building', { name: 'Main House' }]);
ok('a building is saved', r.ok && r.buildings.length === 1 && r.buildings[0].name === 'Main House');
const B = r.buildings[0].id;
ok('a building needs a name', (await call('hospSave', [...H, 'building', { name: '  ' }])).err === 'bad_record');
ok('a room needs a building that exists', (await call('hospSave', [...H, 'room', { name: '101', buildingId: 'nope', beds: [] }])).err === 'bad_record');
r = await call('hospSave', [...H, 'room', { name: '101', buildingId: B, style: 'male', beds: [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: '' }] }]);
ok('a room is saved with its beds (a blank bed dropped)', r.ok && r.rooms.length === 1 && r.rooms[0].beds.length === 3 && r.rooms[0].style === 'male', JSON.stringify(r.rooms));
const R1 = r.rooms[0];
r = await call('hospSave', [...H, 'room', { name: '102', buildingId: B, style: 'weird', beds: [{ label: 'A' }, { label: 'B', out: true }] }]);
const R2 = r.rooms.find(x => x.name === '102');
ok('an unknown room style becomes mixed', R2.style === 'mixed');
ok('a bed can be out for maintenance', R2.beds[1].out === true);
r = await call('hospSave', [...H, 'room', { ...R1, name: '101 Men' }]);
ok('editing a room keeps its bed ids', r.rooms.find(x => x.id === R1.id).name === '101 Men' && r.rooms.find(x => x.id === R1.id).beds[0].id === R1.beds[0].id);
ok('Poipet sees its own (empty) book, not Siem Reap’s', (await call('getHospitality', ['pph', '1234'])).rooms.length === 0);
ok('the blob is per campus', !!mem['hosp:siemreap'] && !mem['hosp:poipet']);

console.log('=== bookings ===');
const bed = (i) => R1.beds[i].id;
r = await call('hospSave', [...H, 'booking', { category: 'speaker', name: 'Pastor Example', from: day(3), to: day(6), males: 1, bedIds: [bed(0)] }]);
ok('a booking is saved', r.ok && r.bookings.length === 1 && r.saved.count === 1 && r.saved.bedIds[0] === bed(0), JSON.stringify(r.saved));
ok('a booking needs a known category', (await call('hospSave', [...H, 'booking', { category: 'alien', name: 'X', from: day(1), to: day(2) }])).err === 'bad_record');
ok('a booking needs to leave after it arrives', (await call('hospSave', [...H, 'booking', { category: 'guest', name: 'X', from: day(5), to: day(5) }])).err === 'bad_record');
ok('a booking without a leave date is refused (not staff)', (await call('hospSave', [...H, 'booking', { category: 'guest', name: 'X', from: day(5), permanent: true }])).err === 'bad_record');
r = await call('hospSave', [...H, 'booking', { category: 'staff', name: 'Long-term Staff', from: day(-30), permanent: true, females: 1 }]);
ok('a staff booking can be permanent', r.ok && r.saved.permanent === true && r.saved.to === '');
r = await call('hospSave', [...H, 'booking', { category: 'guest', name: 'Family Example', from: day(1), to: day(4), males: 2, females: 2, count: 1, family: true }]);
ok('count is at least the people', r.ok && r.saved.count === 4 && r.saved.family === true && r.saved.bedIds.length === 0);
r = await call('hospSave', [...H, 'booking', { category: 'guest', name: 'Clash', from: day(5), to: day(8), bedIds: [bed(0)] }]);
ok('a named bed can’t be in two bookings on the same night', r.ok === false && r.err === 'bed_taken' && r.with === 'Pastor Example', JSON.stringify(r));
r = await call('hospSave', [...H, 'booking', { category: 'guest', name: 'Next Guest', from: day(6), to: day(8), bedIds: [bed(0)] }]);
ok('the bed is free again the morning they leave', r.ok === true);
ok('a bed out for maintenance takes nobody', (await call('hospSave', [...H, 'booking', { category: 'guest', name: 'X', from: day(20), to: day(21), bedIds: [R2.beds[1].id] }])).err === 'bed_out');
ok('a bed that doesn’t exist is refused', (await call('hospSave', [...H, 'booking', { category: 'guest', name: 'X', from: day(20), to: day(21), bedIds: ['bd_nope'] }])).err === 'no_such_bed');
r = await call('hospSave', [...H, 'booking', { category: 'staff', name: 'Clash Staff', from: day(4), permanent: true, bedIds: [bed(0)] }]);
ok('a permanent stay clashes with a stay later on its bed', r.ok === false && r.err === 'bed_taken');
const pastor = (await call('getHospitality', H)).bookings.find(b => b.name === 'Pastor Example');
r = await call('hospSave', [...H, 'booking', { ...pastor, to: day(7) }]);
ok('editing a booking into its own nights is fine; into the next guest’s is not', r.ok === false && r.err === 'bed_taken' && r.with === 'Next Guest');
r = await call('hospSave', [...H, 'booking', { ...pastor, notes: 'Vegetarian' }]);
ok('editing a booking keeps its bed', r.ok && r.bookings.filter(b => b.name === 'Pastor Example').length === 1 && r.saved.notes === 'Vegetarian');
ok('kim cannot delete a booking', (await call('hospDelete', ['kim', '1234', 'booking', pastor.id])).ok === false);

console.log('=== deleting ===');
ok('a building with rooms can’t be deleted', (await call('hospDelete', [...H, 'building', B])).err === 'not_empty');
ok('a room someone still sleeps in can’t be deleted', (await call('hospDelete', [...H, 'room', R1.id])).err === 'in_use');
r = await call('hospDelete', [...H, 'room', R2.id]);
ok('an empty room can be deleted', r.ok && r.rooms.length === 1);
r = await call('hospSave', [...H, 'room', { ...r.rooms[0], beds: r.rooms[0].beds.filter(b => b.id !== bed(0)) }]);
ok('a bed taken out of a room comes out of every booking that held it', r.ok && r.bookings.every(b => b.bedIds.indexOf(bed(0)) === -1));
r = await call('hospDelete', [...H, 'booking', pastor.id]);
ok('a booking can be deleted', r.ok && !r.bookings.some(b => b.id === pastor.id));

console.log('=== teams from the Teams Database are requests ===');
mem.teamTrips = [
  { id: 'tt_soon', campus: 'siemreap', name: 'Example Church', country: 'Nowhere', from: day(10), to: day(20), size: 12, males: 5, females: 7, status: 'active', metrics: {} },
  { id: 'ta_cd1', candidateId: 'cd1', campus: 'siemreap', name: 'Example Base', from: day(30), to: day(40), size: 8, males: 4, females: 4, status: 'active', metrics: {} },
  { id: 'tt_past', campus: 'siemreap', name: 'Gone Team', from: day(-20), to: day(-10), size: 5, status: 'active', metrics: {} },
  { id: 'tt_off', campus: 'siemreap', name: 'Cancelled Team', from: day(10), to: day(20), size: 5, status: 'cancelled', metrics: {} },
  { id: 'tt_pp', campus: 'poipet', name: 'Poipet Team', from: day(10), to: day(20), size: 5, status: 'active', metrics: {} },
];
mem.candidates = [{ id: 'cd1', type: 'team', name: 'Example Base', campus: 'siemreap', stage: 'docs', portal: { form: { answers: { teamName: 'Example Base' } }, docs: [] } }];
r = await call('getHospitality', H);
ok('upcoming teams on this campus are requests, soonest first', r.ok && r.requests.map(q => q.tripId).join() === 'tt_soon,ta_cd1', JSON.stringify(r.requests.map(q => q.tripId)));
const soon = r.requests[0], portalTeam = r.requests[1];
ok('a request carries its dates and head counts', soon.from === day(10) && soon.to === day(20) && soon.size === 12 && soon.males === 5 && soon.females === 7);
ok('a portal team still waiting for flights is pending', portalTeam.pending === true && portalTeam.portalStage === 'docs' && soon.pending === false);
r = await call('hospSave', [...H, 'booking', { category: 'team', name: soon.name, from: soon.from, to: soon.to, males: 5, females: 7, tripId: soon.tripId }]);
ok('booking a team links it to its request', r.ok && r.requests.find(q => q.tripId === 'tt_soon').bookingId === r.saved.id);
ok('a team is booked once', (await call('hospSave', [...H, 'booking', { category: 'team', name: 'Again', from: soon.from, to: soon.to, tripId: soon.tripId }])).err === 'already_booked');
ok('a team request reaches nobody outside Hospitality', (await call('getHospitality', ['tom', '1234'])).requests === undefined);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
