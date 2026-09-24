/* HR → Candidates: potential staff, volunteers and students, from first
   contact to arrival. Against the real api.js: the HR gate; a candidate is
   a name plus a type and a stage; a stage change is logged; notes append to
   the log; next-step dates within a week count as follow-ups due (boot's
   hrFollowUps); archiving hides without deleting, unarchiving reverses it. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('hr-candidates');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
  delete: async (k)=>{ delete mem[k]; },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js'); // and the portal's shipped forms // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_hr', name: 'Sina Sok', username: 'sina', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Community Service', active: true, hr: true }),
  withPin({ id: 'st_dara', name: 'Dara Pen', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
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
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

console.log('=== the gate ===');
let r = await call('hrCandidates', ['dara', '1234']);
ok('an ordinary member cannot read the pipeline', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrSaveCandidate', ['dara', '1234', { name: 'Anna', type: 'volunteer' }]);
ok('nor add to it', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrCandidates', ['sina', '1234']);
ok('HR reads it — empty to start', r.body.ok === true && r.body.candidates.length === 0);

console.log('\n=== adding and moving people ===');
r = await call('hrSaveCandidate', ['sina', '1234', { name: '  ', type: 'staff' }]);
ok('a candidate needs a name', r.body.ok === false && r.body.err === 'bad_candidate');
r = await call('hrSaveCandidate', ['sina', '1234', { name: ' Anna Berg ', type: 'volunteer', email: 'anna@x.org', phone: '+46 70', country: 'Sweden', source: 'DTS friend', nextStep: 'Video call', nextDate: day(3), expected: '2027-01', notes: 'Keen on Cafe' }]);
ok('HR adds a candidate: trimmed, typed, at the first stage, with a next step', r.body.ok === true && r.body.candidate.name === 'Anna Berg' && r.body.candidate.type === 'volunteer' && r.body.candidate.stage === 'new' && r.body.candidate.nextDate === day(3) && r.body.candidate.campus === 'siemreap', JSON.stringify(r.body.candidate && [r.body.candidate.name, r.body.candidate.stage, r.body.candidate.campus]));
const anna = r.body.candidate;
ok('it records who created it and when, and starts with an empty log', anna.createdBy === 'st_hr' && /^\d{4}-/.test(anna.created) && anna.log.length === 0 && anna.archived === null);
r = await call('hrSaveCandidate', ['uriah', '1234', { name: 'Ben Ito', type: 'galaxy', stage: 'nowhere' }]);
ok('an unknown type or stage falls back (staff, new)', r.body.ok === true && r.body.candidate.type === 'staff' && r.body.candidate.stage === 'new');
const ben = r.body.candidate;
r = await call('hrSaveCandidate', ['sina', '1234', { id: 'cd_missing', name: 'Ghost' }]);
ok('editing an id that is not there is refused', r.body.ok === false && r.body.err === 'not_found');
r = await call('hrSaveCandidate', ['sina', '1234', { ...anna, stage: 'contacted', nextStep: 'Send application', nextDate: day(10) }]);
ok('moving to a new stage keeps the id and logs the move', r.body.ok === true && r.body.candidate.id === anna.id && r.body.candidate.stage === 'contacted' && r.body.candidate.log.length === 1 && r.body.candidate.log[0].kind === 'stage' && r.body.candidate.log[0].text === 'contacted' && r.body.candidate.log[0].by === 'st_hr', JSON.stringify(r.body.candidate.log));
ok('the creator is kept across edits', r.body.candidate.createdBy === 'st_hr' && r.body.candidate.created === anna.created);
r = await call('hrSaveCandidate', ['sina', '1234', { ...r.body.candidate, notes: 'Keen on Cafe, speaks Khmer a little' }]);
ok('an edit without a stage change adds nothing to the log', r.body.ok === true && r.body.candidate.log.length === 1);
r = await call('hrCandidateNote', ['sina', '1234', anna.id, '   ']);
ok('an empty note is refused', r.body.ok === false && r.body.err === 'empty');
r = await call('hrCandidateNote', ['uriah', '1234', anna.id, 'Called — very warm, sending the form']);
ok('a note appends to the log with who and when', r.body.ok === true && r.body.candidate.log.length === 2 && r.body.candidate.log[1].kind === 'note' && r.body.candidate.log[1].by === 'st_admin', JSON.stringify(r.body.candidate.log[1]));

console.log('\n=== follow-ups due on boot ===');
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Chan Dara', type: 'student', school: 'DBS', nextStep: 'Interview', nextDate: day(-2) }]);
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Far Off', type: 'staff', nextStep: 'Check in', nextDate: day(40) }]);
r = await call('getMyBoot', ['sina', '1234']);
ok('HR’s boot counts follow-ups due within a week (overdue included), not the far-off one', r.body.hrFollowUps === 1, r.body.hrFollowUps);
r = await call('getMyBoot', ['dara', '1234']);
ok('nobody else gets the count', r.body.hrFollowUps === null);

console.log('\n=== archiving ===');
r = await call('hrArchiveCandidate', ['dara', '1234', ben.id, { reason: 'Declined' }]);
ok('an ordinary member cannot archive', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrArchiveCandidate', ['sina', '1234', ben.id, { reason: 'Declined — went elsewhere' }]);
ok('HR archives a candidate with a reason', r.body.ok === true && r.body.candidate.archived && r.body.candidate.archived.reason === 'Declined — went elsewhere' && r.body.candidate.archived.by === 'st_hr');
r = await call('hrCandidates', ['sina', '1234']);
ok('the record stays in the list, marked archived — nothing is deleted', r.body.candidates.length === 4 && r.body.candidates.find(c => c.id === ben.id).archived);
r = await call('hrArchiveCandidate', ['sina', '1234', ben.id, null]);
ok('unarchiving reverses it', r.body.ok === true && r.body.candidate.archived === null);
r = await call('hrArchiveCandidate', ['sina', '1234', 'cd_missing', { reason: 'x' }]);
ok('an unknown id is refused', r.body.ok === false && r.body.err === 'not_found');
r = await call('getData', ['leadercode']);
ok('candidates never reach the dashboard payload', !JSON.stringify(r.body).includes('Anna Berg'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
