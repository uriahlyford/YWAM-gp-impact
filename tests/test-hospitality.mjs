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

console.log('=== the rooms it starts from ===');
{ const r0 = await call('getHospitality', ['hana', '1234']);
  const n = (b) => r0.rooms.filter(x => x.buildingId === r0.buildings.find(y => y.name === b).id);
  ok('Siem Reap starts with the base’s rooms from its sheet: the Old Base and Peace House', r0.buildings.map(b => b.name).join() === 'Old Base,Peace House' && n('Old Base').length === 16 && n('Peace House').length === 7, r0.rooms.length);
  const room = (x) => r0.rooms.find(y => y.name === x);
  ok('with their beds and who each room is for', room('104').beds.map(b => b.label).join('') === 'ABCDEFGH' && room('104').style === 'female' && room('203').style === 'male' && room('201').style === 'family' && room('402').style === 'couple' && room('Unit 7').beds.length === 3);
  ok('but nobody in them — names never live in the code', r0.bookings.length === 0);
  ok('nothing is written until the book is first saved', !mem['hosp:siemreap']);
  ok('Poipet starts empty', (await call('getHospitality', ['pph', '1234'])).rooms.length === 0); }
mem['hosp:siemreap'] = { buildings: [], rooms: [], bookings: [] };   // the rest starts from an empty book
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

console.log('=== the bed board: move, swap, place, take off ===');
mem['hosp:siemreap'] = {
  buildings: [{ id: 'b1', name: 'House' }],
  rooms: [{ id: 'r1', buildingId: 'b1', name: '1', style: 'mixed', notes: '', beds: [{ id: 'x1', label: 'A' }, { id: 'x2', label: 'B' }, { id: 'x3', label: 'C' }, { id: 'x4', label: 'D', out: true }] }],
  bookings: [
    { id: 'kA', category: 'guest', name: 'Ann', from: day(1), to: day(5), count: 1, males: 0, females: 1, bedIds: ['x1'], tripId: '' },
    { id: 'kB', category: 'guest', name: 'Ben', from: day(2), to: day(6), count: 1, males: 1, females: 0, bedIds: ['x2'], tripId: '' },
    { id: 'kC', category: 'guest', name: 'Cat', from: day(5), to: day(9), count: 1, males: 0, females: 1, bedIds: ['x1'], tripId: '' },
    { id: 'kD', category: 'team', name: 'Dee Team', from: day(1), to: day(3), count: 2, males: 1, females: 1, bedIds: [], tripId: '' },
    { id: 'kE', category: 'guest', name: 'Eve', from: day(7), to: day(9), count: 1, males: 0, females: 1, bedIds: ['x3'], tripId: '' },
  ],
};
const bedsOf = (r, id) => r.bookings.find(k => k.id === id).bedIds.join();
r = await call('hospMoveBed', ['kim', '1234', 'kA', 'x1', 'x3']);
ok('another ministry can’t move anyone', r.ok === false && r.err === 'not_authorized');
r = await call('hospMoveBed', [...H, 'kA', 'x1', 'x3']);
ok('a move to a free bed', r.ok && bedsOf(r, 'kA') === 'x3', JSON.stringify(r).slice(0, 120));
r = await call('hospMoveBed', [...H, 'kA', 'x3', 'x2']);
ok('a move onto someone sharing nights swaps the two', r.ok && bedsOf(r, 'kA') === 'x2' && bedsOf(r, 'kB') === 'x3');
r = await call('hospMoveBed', [...H, 'kB', 'x3', 'x1']);
ok('a swap that would put the other one in a third person’s bed is refused', r.ok === false && r.err === 'bed_taken' && r.with === 'Eve', JSON.stringify(r).slice(0, 120));
ok('… and nothing moved', bedsOf(await call('getHospitality', H), 'kB') === 'x3' && bedsOf(await call('getHospitality', H), 'kC') === 'x1');
r = await call('hospMoveBed', [...H, 'kA', 'x2', 'x4']);
ok('a bed out of use takes nobody', r.ok === false && r.err === 'bed_out');
r = await call('hospMoveBed', [...H, 'kA', 'x9', 'x1']);
ok('they have to be in the bed they move from', r.ok === false && r.err === 'not_in_bed');
r = await call('hospMoveBed', [...H, 'kD', '', 'x1']);
ok('someone not in a bed yet can be placed', r.ok && bedsOf(r, 'kD') === 'x1', JSON.stringify(r).slice(0, 120));
r = await call('hospMoveBed', [...H, 'kD', '', 'x2']);
ok('placing onto a taken bed is refused (no bed to swap back)', r.ok === false && r.err === 'bed_taken' && r.with === 'Ann');
r = await call('hospMoveBed', [...H, 'kA', 'x2', '']);
ok('taking someone off their bed', r.ok && bedsOf(r, 'kA') === '');
r = await call('hospMoveBed', [...H, 'kD', '', 'x2']);
ok('… frees it for the next', r.ok && bedsOf(r, 'kD') === 'x1,x2');
r = await call('hospMoveBed', [...H, 'kD', '', 'x3']);
ok('a booking with all its beds can’t take another', r.ok === false && r.err === 'all_placed');
r = await call('hospMoveBed', [...H, 'kA', '', '']);
ok('a move to nowhere from nowhere is refused', r.ok === false && r.err === 'bad_move');
r = await call('hospMoveBed', [...H, 'nope', '', 'x1']);
ok('an unknown booking is refused', r.ok === false && r.err === 'not_found');

console.log('=== importing a house from a spreadsheet ===');
mem['hosp:siemreap'] = { buildings: [], rooms: [], bookings: [] };
const ROWS = [
  { building: 'Old House', room: '102', style: 'male', bed: 'A', name: 'Student One', category: 'student' },
  { building: 'Old House', room: '102', style: 'male', bed: 'B', name: 'Staff Two', category: 'staff' },
  { building: 'Old House', room: '102', style: 'male', bed: 'C', name: '', category: '' },
  { building: 'Old House', room: '304', style: 'female', bed: 'D', name: 'Same Name', category: 'student' },
  { building: 'Old House', room: '304', style: 'female', bed: 'E', name: 'Same Name', category: 'student' },
  { building: 'Old House', room: '201', style: 'family', bed: 'A', name: 'Example Family', category: 'staff' },
  { building: 'Old House', room: '201', style: 'family', bed: 'B', name: 'Example Family', category: 'staff' },
  { building: 'Old House', room: '201', style: 'family', bed: 'C', name: 'Example Family', category: 'staff' },
  { building: 'Old House', room: '402', style: 'couple', bed: 'A', name: '', category: '' },
  { building: 'Old House', room: '402', style: 'couple', bed: 'B', name: '', category: '' },
  { building: 'Garden House', room: 'Unit 1', style: 'weird', bed: '', name: '', category: '' },
];
ok('only Hospitality (or an admin) may import', (await call('hospImport', ['kim', '1234', ROWS])).ok === false && mem['hosp:siemreap'].rooms.length === 0);
r = await call('hospImport', [...H, ROWS]);
ok('buildings, rooms and beds are made', r.ok && r.imported.buildings === 2 && r.imported.rooms === 5 && r.imported.beds === 10, JSON.stringify(r.imported));
const room = (n) => r.rooms.find(x => x.name === n);
ok('rooms keep their type; an unknown type is mixed; a room with no beds listed is still made', room('201').style === 'family' && room('Unit 1').style === 'mixed' && room('Unit 1').beds.length === 0 && room('102').beds.map(b => b.label).join() === 'A,B,C');
ok('everyone named is in their bed from today, staying (no leaving date)', r.imported.people === 5 && r.bookings.every(k => k.permanent && k.to === '' && k.from), JSON.stringify(r.bookings.map(k => k.name)));
const bk = (n) => r.bookings.filter(k => k.name === n);
ok('staff and students keep their kind', bk('Staff Two')[0].category === 'staff' && bk('Student One')[0].category === 'student');
ok('a family room’s rows with one name are one booking over its beds', bk('Example Family').length === 1 && bk('Example Family')[0].bedIds.length === 3 && bk('Example Family')[0].count === 3 && bk('Example Family')[0].family === true);
ok('in a dorm two people with one name stay two people', bk('Same Name').length === 2 && bk('Same Name').every(k => k.bedIds.length === 1));
r = await call('hospImport', [...H, ROWS]);
ok('importing again adds nothing twice, and says whose beds were already taken', r.ok && r.imported.rooms === 0 && r.imported.beds === 0 && r.imported.people === 0 && r.imported.skipped.length === 5 && r.bookings.length === 5, JSON.stringify(r.imported));
ok('an empty import is refused', (await call('hospImport', [...H, []])).err === 'empty');
r = await call('hospSave', [...H, 'booking', { category: 'student', name: 'Long Stay', from: day(1), permanent: true }]);
ok('a student or volunteer can stay without a leaving date too; a guest can’t', r.ok && r.saved.permanent === true && (await call('hospSave', [...H, 'booking', { category: 'guest', name: 'X', from: day(1), permanent: true }])).err === 'bad_record');

console.log('=== who of a team sleeps where ===');
mem['hosp:siemreap'] = { buildings: [{ id: 'b1', name: 'House' }],
  rooms: [{ id: 'r1', buildingId: 'b1', name: '1', style: 'mixed', notes: '', beds: [{ id: 'y1', label: 'A' }, { id: 'y2', label: 'B' }, { id: 'y3', label: 'C' }] }],
  bookings: [{ id: 'kP', category: 'guest', name: 'Pia', from: day(1), to: day(4), count: 1, males: 0, females: 1, bedIds: ['y3'], tripId: '' }] };
r = await call('hospSave', [...H, 'booking', { category: 'team', name: 'Example Team', from: day(1), to: day(4), count: 2, bedIds: ['y1'], bedNames: { y1: '  Max Member ', y9: 'Nobody', y3: 'Not theirs' } }]);
const kT = r.saved;
ok('a booking keeps who is in each of its beds — names for beds it doesn’t hold are dropped', r.ok && JSON.stringify(kT.bedNames) === JSON.stringify({ y1: 'Max Member' }), JSON.stringify(kT.bedNames));
r = await call('hospMoveBed', [...H, kT.id, 'y1', 'y2']);
ok('moving a person to another bed takes their name with them', r.ok && r.bookings.find(k => k.id === kT.id).bedNames.y2 === 'Max Member' && !r.bookings.find(k => k.id === kT.id).bedNames.y1, JSON.stringify(r.bookings.find(k => k.id === kT.id)));
r = await call('hospSave', [...H, 'booking', { ...r.bookings.find(k => k.id === kT.id), bedIds: ['y1', 'y2'], bedNames: { y1: 'Fay Member', y2: 'Max Member' } }]);
r = await call('hospMoveBed', [...H, kT.id, 'y2', 'y3']);
const tb = r.bookings.find(k => k.id === kT.id), pb = r.bookings.find(k => k.id === 'kP');
ok('a swap with someone else swaps the beds and keeps each name with its person', r.ok && tb.bedNames.y3 === 'Max Member' && tb.bedIds.includes('y3') && pb.bedIds.join() === 'y2', JSON.stringify([tb, pb]));
r = await call('hospMoveBed', [...H, kT.id, 'y3', '']);
ok('taking someone off a bed takes their name off it', r.ok && !r.bookings.find(k => k.id === kT.id).bedNames.y3 && r.bookings.find(k => k.id === kT.id).bedNames.y1 === 'Fay Member');
// a team's people, from its portal, come with its request
mem.teamTrips = [{ id: 'tt_names', campus: 'siemreap', name: 'Names Team', from: day(3), to: day(9), size: 4, status: 'active', candidateId: 'cdN', metrics: {}, reached: {} }];
mem.candidates = [{ id: 'cdN', type: 'team', name: 'Lee Leader', campus: 'siemreap', stage: 'arrived', portal: { form: { answers: { teamName: 'Names Team', leaderName: 'Lee Leader', coLeaders: [{ name: 'Co Leader', sex: 'f' }] } }, members: [{ name: 'Max Member', sex: 'm' }, { name: 'Lee Leader', sex: 'm' }, { name: 'Fay Member', sex: 'f' }], docs: [] } }];
r = await call('getHospitality', H);
const nq = r.requests.find(q => q.tripId === 'tt_names');
ok('a team’s request carries everyone on its portal list — leader, co-leaders, members — once each', nq && nq.people.map(p => p.name + ':' + p.sex).join() === 'Lee Leader:,Co Leader:f,Max Member:m,Fay Member:f', JSON.stringify(nq && nq.people));
ok('… and nobody outside Hospitality gets them', (await call('getHospitality', ['tom', '1234'])).requests === undefined);

console.log('=== staff beds ===');
mem['hosp:siemreap'] = { buildings: [{ id: 'b1', name: 'House' }],
  rooms: [{ id: 'r1', buildingId: 'b1', name: '1', style: 'mixed', notes: '', beds: [{ id: 's1', label: 'A' }, { id: 's2', label: 'B' }, { id: 's3', label: 'C' }, { id: 's4', label: 'D', out: true }] }],
  bookings: [{ id: 'kS', category: 'student', name: 'DTS Oct', from: day(-10), to: day(60), count: 1, bedIds: ['s3'], tripId: '' },
             { id: 'kOld', category: 'staff', name: 'Old Staff', from: day(-200), to: '', permanent: true, count: 1, bedIds: ['s2'], tripId: '' }] };
const sb = (r) => Object.fromEntries(r.bookings.filter(k => k.category === 'staff' && k.permanent).map(k => [k.bedIds[0], k.name]));
r = await call('hospStaffBeds', ['kim', '1234', { s1: 'Kim' }]);
ok('only Hospitality can set staff beds', r.ok === false && r.err === 'not_authorized');
r = await call('hospStaffBeds', [...H, { s1: '  Dara Pen ', s2: 'Old Staff' }]);
ok('a name on a bed makes a permanent staff booking from today; one already there stays as it was', r.ok && JSON.stringify(sb(r)) === JSON.stringify({ s2: 'Old Staff', s1: 'Dara Pen' }) && r.bookings.find(k => k.id === 'kOld').from === day(-200) && r.bookings.find(k => k.name === 'Dara Pen').from === day(0), JSON.stringify(sb(r)));
r = await call('hospStaffBeds', [...H, { s1: 'Old Staff', s2: 'Dara Pen' }]);
ok('swapping two staff moves their bookings — Old Staff keeps the date they came', r.ok && JSON.stringify(sb(r)) === JSON.stringify({ s1: 'Old Staff', s2: 'Dara Pen' }) && r.bookings.find(k => k.id === 'kOld').bedIds[0] === 's1' && r.bookings.find(k => k.id === 'kOld').from === day(-200) && r.bookings.filter(k => k.category === 'staff').length === 2, JSON.stringify(r.bookings.filter(k => k.category === 'staff')));
r = await call('hospStaffBeds', [...H, { s1: '', s2: 'Dara Pen' }]);
const gone = r.bookings.find(k => k.id === 'kOld');
ok('emptying a bed ends that staff booking today — the history stays', r.ok && !gone.permanent && gone.to === day(0) && JSON.stringify(sb(r)) === JSON.stringify({ s2: 'Dara Pen' }));
r = await call('hospStaffBeds', [...H, { s2: '' }]);
ok('a staff bed set today and emptied today just goes', r.ok && !r.bookings.some(k => k.name === 'Dara Pen'));
r = await call('hospStaffBeds', [...H, { s3: 'Somebody' }]);
ok('a bed someone else holds (the school) can’t be given to staff', r.ok === false && r.err === 'bed_taken' && r.with === 'DTS Oct');
ok('… nor a bed out of use', (await call('hospStaffBeds', [...H, { s4: 'Somebody' }])).err === 'bed_out');
ok('… nor a bed that isn’t there', (await call('hospStaffBeds', [...H, { zz: 'Somebody' }])).err === 'no_such_bed');
r = await call('hospStaffBeds', [...H, { s1: 'Kara' }]);
const kara = r.bookings.find(k => k.name === 'Kara');
ok('a staff bed is taken in the booking book: a booking for that bed is refused', (await call('hospSave', [...H, 'booking', { category: 'guest', name: 'G', from: day(30), to: day(32), count: 1, bedIds: ['s1'] }])).err === 'bed_taken' && kara.permanent);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
