/* The leadership meeting board — against the real api.js.

   Campus Leadership's Monday meetings: agenda items and projects as cards in
   Agenda / In progress / Done, each with an owner, a due date, notes and
   optionally the Leadership OKR it serves. Only Campus Leadership on the
   campus and admins read or change it; a card is cleaned; moving it to Done
   stamps when, moving it back clears that; campuses are kept apart. Every
   name here is made up. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('lead-board');
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
fs.writeFileSync(TMP + '/team-seed.js', 'export default [];');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js');
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const st = (o) => ({ role: '', active: true, campus: 'siemreap', ...o });
mem.staff = [
  st({ id: 'st_d', name: 'Dee Director', username: 'dee', dept: 'Campus Leadership', ministry: 'Campus Director' }),
  st({ id: 'st_o', name: 'Oli Overseer', username: 'oli', dept: 'Campus Leadership', ministry: 'Community Service' }),
  st({ id: 'st_c', name: 'Cafe Cam', username: 'cam', dept: 'Community Service', ministry: 'Cafe' }),
  st({ id: 'st_a', name: 'Ada Admin', username: 'ada', dept: 'Community Service', ministry: 'Cafe', isAdmin: true }),
  st({ id: 'st_p', name: 'Pat Poipet', username: 'pat', campus: 'poipet', dept: 'Campus Leadership', ministry: 'Campus Director' }),
].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return await res.json().catch(() => null);
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

let r = await call('getLeadBoard', ['dee', '1234']);
ok('Campus Leadership opens the board (empty to start)', r.ok && r.cards.length === 0);
ok('an overseer is Campus Leadership too', (await call('getLeadBoard', ['oli', '1234'])).ok === true);
ok('an admin may', (await call('getLeadBoard', ['ada', '1234'])).ok === true);
ok('anyone else may not', (await call('getLeadBoard', ['cam', '1234'])).err === 'not_authorized' && (await call('saveLeadCard', ['cam', '1234', { title: 'x' }])).ok === false);
r = await call('saveLeadCard', ['dee', '1234', { title: '  Staff retreat plan ', type: 'project', col: 'doing', owner: 'st_o', due: '2026-11-01', okrId: 'o123', notes: 'Venue and dates', meeting: '2026-10-12' }]);
const c1 = r.saved;
ok('a card is saved with everything it carries', r.ok && c1.title === 'Staff retreat plan' && c1.type === 'project' && c1.col === 'doing' && c1.owner === 'st_o' && c1.due === '2026-11-01' && c1.okrId === 'o123' && c1.meeting === '2026-10-12' && c1.createdBy === 'st_d', JSON.stringify(c1));
r = await call('saveLeadCard', ['oli', '1234', { title: 'Budget review', type: 'weird', col: 'nowhere', due: 'soon' }]);
ok('a card is cleaned: unknown type → agenda item, unknown column → Agenda, a bad date dropped', r.saved.type === 'agenda' && r.saved.col === 'agenda' && r.saved.due === '');
ok('a card needs a title', (await call('saveLeadCard', ['dee', '1234', { title: '  ' }])).err === 'bad_card');
r = await call('saveLeadCard', ['dee', '1234', { ...c1, col: 'done' }]);
ok('moving a card to Done stamps when, and keeps who made it', r.saved.col === 'done' && !!r.saved.doneAt && r.saved.createdBy === 'st_d' && r.saved.updatedBy === 'st_d' && r.cards.length === 2);
const doneAt = r.saved.doneAt;
r = await call('saveLeadCard', ['dee', '1234', { ...r.saved, notes: 'Booked' }]);
ok('editing a done card keeps when it was done', r.saved.doneAt === doneAt && r.saved.notes === 'Booked');
r = await call('saveLeadCard', ['dee', '1234', { ...r.saved, col: 'doing' }]);
ok('moving it back out of Done clears that', r.saved.col === 'doing' && !r.saved.doneAt);
ok('Poipet has its own board', (await call('getLeadBoard', ['pat', '1234'])).cards.length === 0);
r = await call('deleteLeadCard', ['dee', '1234', c1.id]);
ok('a card can be deleted', r.ok && r.cards.length === 1 && !r.cards.some(c => c.id === c1.id));
ok('… not by someone outside Campus Leadership', (await call('deleteLeadCard', ['cam', '1234', r.cards[0].id])).ok === false);

console.log('=== the board is theirs to shape ===');
r = await call('getLeadBoard', ['dee', '1234']);
ok('it starts with Agenda / In progress / Done, Done being the finished one', r.cols.map(c => c.title).join() === 'Agenda,In progress,Done' && r.cols[2].done && !r.cols[0].done);
ok('… the focus areas for this quarter and 2027', r.areas.map(a => a.title).join() === 'Siem Reap finances,Siem Reap ministries,Construction');
ok('… and what every Monday’s agenda has', r.standing.map(a => a.title).join() === 'Department and ministry updates,Events coming up');
r = await call('saveLeadCard', ['dee', '1234', { title: 'Roof quote', type: 'project', area: 'construction', col: 'doing' }]);
const roof = r.saved;
ok('a project belongs to a focus area', roof.area === 'construction');
ok('an unknown focus area is left empty', (await call('saveLeadCard', ['dee', '1234', { title: 'X', area: 'nope' }])).saved.area === '');
r = await call('saveLeadSettings', ['dee', '1234', {
  cols: [{ id: 'agenda', title: 'This Monday' }, { id: 'waiting', title: 'Waiting on someone' }, { id: 'done', title: 'Finished', done: true }],
  areas: [{ id: 'finances', title: 'Siem Reap finances' }, { id: 'ministries', title: 'Siem Reap ministries' }, { title: '2027 planning' }],
  standing: [{ id: 'updates', title: 'Department and ministry updates' }, { id: 'events', title: 'Events coming up' }, { title: 'Prayer' }, { title: '' }]
}]);
ok('columns can be renamed, added and taken away', r.ok && r.cols.map(c => c.title).join() === 'This Monday,Waiting on someone,Finished' && r.cols[2].done);
ok('a card in a column that went moves to the first one', r.cards.find(c => c.id === roof.id).col === 'agenda', r.cards.find(c => c.id === roof.id).col);
ok('focus areas can change; a card in one that went keeps its place with no area', r.areas.map(a => a.title).join() === 'Siem Reap finances,Siem Reap ministries,2027 planning' && r.cards.find(c => c.id === roof.id).area === '' && r.areas[2].id);
ok('standing agenda items can be added (a blank one is dropped)', r.standing.map(a => a.title).join() === 'Department and ministry updates,Events coming up,Prayer');
r = await call('saveLeadSettings', ['dee', '1234', { cols: [{ id: 'a', title: 'One' }, { id: 'b', title: 'Two' }], areas: [], standing: [] }]);
ok('with no finished column picked, the last one is', r.cols[1].done && !r.cols[0].done);
ok('a board needs a column', (await call('saveLeadSettings', ['dee', '1234', { cols: [] }])).err === 'no_columns');
ok('only Campus Leadership may change the board', (await call('saveLeadSettings', ['cam', '1234', { cols: [{ title: 'x' }] }])).ok === false);
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
