/* YWAM GP Portal, server side, against the real api.js — milestone 1.
   An applicant is an account with kind:'applicant' whose application is a
   candidate record in the CRM. What this holds: sign-up validation; an
   applicant is closed out of every staff handler and every roster; they
   see only their own application; portal access is a flag only an admin
   (or, for portalStaff, a portal admin) can set, never to an applicant;
   a stage move by staff shows up on the applicant's timeline; the CRM's
   own edits keep the portal's fields. All fixtures are fake people. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('portal');
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
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js'); // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true, email: 'u@x.org' }),
  withPin({ id: 'st_padmin', name: 'Sina Sok', username: 'sina', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, portalAdmin: true, email: 's@x.org' }),
  withPin({ id: 'st_pstaff', name: 'Dara Pen', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, portalStaff: true, email: 'd@x.org' }),
  withPin({ id: 'st_plain', name: 'Bopha Kim', username: 'bopha', campus: 'siemreap', dept: 'Youth Education', ministry: 'YDC', active: true, email: 'b@x.org' }),
  withPin({ id: 'st_hr', name: 'Mealea Sok', username: 'mealea', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', active: true, hr: true, email: 'm@x.org' }),
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
const APP = { username: 'anna.b', pin: '2468', name: 'Anna Example', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', type: 'student', school: 'dts', country: 'Sweden' };

console.log('=== signing up ===');
let r = await call('portalRegister', [{ ...APP, username: 'A B' }]);
ok('username must be the same shape as a staff username', r.body.ok === false && r.body.err === 'bad_username');
r = await call('portalRegister', [{ ...APP, pin: '12' }]);
ok('PIN is four digits', r.body.ok === false && r.body.err === 'bad_pin');
r = await call('portalRegister', [{ ...APP, name: '  ' }]);
ok('a name is required', r.body.ok === false && r.body.err === 'name_required');
r = await call('portalRegister', [{ ...APP, email: 'nope' }]);
ok('a real email is required', r.body.ok === false && r.body.err === 'bad_email');
r = await call('portalRegister', [{ ...APP, phone: '12' }]);
ok('a phone number is required — staff reach out on it', r.body.ok === false && r.body.err === 'phone_required');
r = await call('portalRegister', [{ ...APP, messenger: 'signal' }]);
ok('WhatsApp or Telegram is required', r.body.ok === false && r.body.err === 'messenger_required');
r = await call('portalRegister', [{ ...APP, type: 'intern' }]);
ok('what you apply for must be a student, staff, volunteer or team', r.body.ok === false && r.body.err === 'type_required');
r = await call('portalRegister', [{ ...APP, school: 'mba' }]);
ok('a student names one of the four schools', r.body.ok === false && r.body.err === 'school_required');
r = await call('portalRegister', [{ ...APP, username: 'uriah' }]);
ok('a username someone already has is refused', r.body.ok === false && r.body.err === 'taken');
r = await call('portalRegister', [{ ...APP, email: 'u@x.org' }]);
ok('so is an email someone already has', r.body.ok === false && r.body.err === 'email_taken');
r = await call('portalRegister', [APP]);
ok('a good sign-up answers with the applicant’s own dashboard', r.body.ok === true && r.body.role === 'applicant' && r.body.me.username === 'anna.b' && r.body.application.type === 'student' && r.body.application.school === 'dts');
ok('the application starts as a draft on the "fill out" step', r.body.application.status === 'draft' && r.body.application.steps.find(s => s.state === 'current').id === 'form');
ok('the account step is already done', r.body.application.steps[0].id === 'account' && r.body.application.steps[0].state === 'done');
const anna = mem.staff.find(s => s.username === 'anna.b');
ok('the account is kind:applicant, on Siem Reap, linked to its candidate', anna && anna.kind === 'applicant' && anna.campus === 'siemreap' && anna.applicant.candidateId && anna.applicant.type === 'student');
const cand = mem.candidates.find(c => c.staffId === anna.id);
ok('the candidate record exists in the CRM, source portal, stage new, pointing back at the account', cand && cand.source === 'portal' && cand.stage === 'new' && cand.type === 'student' && cand.school === 'dts' && cand.messenger === 'whatsapp' && cand.id === anna.applicant.candidateId);
ok('no PIN or hash leaks in the sign-up answer', !JSON.stringify(r.body).includes(anna.pinHash) && !JSON.stringify(r.body).includes('2468'));
r = await call('portalRegister', [{ ...APP, username: 'tom.v', email: 'tom@example.org', type: 'volunteer', school: '', messenger: 'telegram' }]);
ok('a volunteer signs up with no school', r.body.ok === true && r.body.application.type === 'volunteer' && r.body.application.school === '');
const tom = mem.staff.find(s => s.username === 'tom.v');

console.log('\n=== an applicant is not staff ===');
r = await call('getMyBoot', ['anna.b', '2468']);
ok('the staff app’s boot refuses an applicant', r.body.ok === false, JSON.stringify(r.body).slice(0, 60));
r = await call('staffLogin', ['anna.b', '2468']);
ok('the staff login says "applicant" so the page can point at the portal', r.body.ok === false && r.body.err === 'applicant');
r = await call('saveDaily', ['anna.b', '2468', '2026-09-01', { habits: {} }]);
ok('an applicant cannot log a day', r.body.ok === false);
r = await call('saveGoals', ['anna.b', '2468', 30, [{ text: 'x', pct: 0 }]]);
ok('nor write goals', r.body.ok === false);
r = await call('hrCandidates', ['anna.b', '2468']);
ok('nor read the CRM', r.body.ok === false);
r = await call('hrSaveCandidate', ['anna.b', '2468', { id: cand.id, name: 'Anna', type: 'student', stage: 'accepted' }]);
ok('nor move their own stage', r.body.ok === false && mem.candidates.find(c => c.id === cand.id).stage === 'new');
r = await call('adminListStaff', ['anna.b', '2468']);
ok('nor reach admin', r.body.ok === false);
r = await call('staffProfile', ['uriah', '1234', anna.id]);
ok('a staff member cannot open an applicant as a teammate', r.body.ok === false);
r = await call('teamRoster', []);
ok('the roster leaves applicants out', r.body.every(p => p.username !== 'anna.b' && p.username !== 'tom.v') && r.body.length === 5);
r = await call('getMyBoot', ['uriah', '1234']);
ok('boot’s roster and base roster leave them out too', r.body.roster.every(p => p.username !== 'anna.b') && r.body.roster.length === 5);
r = await call('adminListStaff', ['uriah', '1234']);
ok('Admin’s account list is staff only', r.body.staff.every(p => p.username !== 'anna.b') && r.body.staff.length === 5);
r = await call('hrList', ['mealea', '1234']);
ok('and so is HR’s', r.body.ok === true && r.body.staff.every(p => p.username !== 'anna.b'));

console.log('\n=== who may open the portal ===');
r = await call('portalBoot', ['anna.b', '9999']);
ok('a wrong PIN is "auth"', r.body.ok === false && r.body.err === 'auth');
r = await call('portalBoot', ['anna.b', '2468']);
ok('an applicant sees their own application, nothing else', r.body.ok === true && r.body.role === 'applicant' && r.body.application.id === cand.id && !r.body.applicants);
ok('and none of the other applicant’s details', !JSON.stringify(r.body).includes('tom@example.org') && !JSON.stringify(r.body).includes('Tom'));
r = await call('portalBoot', ['bopha', '1234']);
ok('an ordinary staff member is told they have no access and shown nothing', r.body.ok === false && r.body.err === 'not_authorized' && !r.body.applicants);
r = await call('portalBoot', ['mealea', '1234']);
ok('HR access alone is not portal access', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalBoot', ['dara', '1234']);
ok('portal staff sees every applicant', r.body.ok === true && r.body.role === 'portal-staff' && r.body.applicants.length === 2);
ok('with each one’s contact and messenger for the one-tap chat', r.body.applicants.every(a => a.phone && a.messenger && a.hasAccount));
ok('and the list of portal staff to assign as owner', r.body.staff.map(x => x.username).sort().join(',') === 'dara,sina,uriah');
ok('no PIN material in the staff view either', !JSON.stringify(r.body).includes('pinHash') && !JSON.stringify(r.body).includes(anna.pinHash));
r = await call('portalBoot', ['sina', '1234']);
ok('a portal admin is "portal-admin"', r.body.ok === true && r.body.role === 'portal-admin');
r = await call('portalBoot', ['uriah', '1234']);
ok('an app admin is a portal admin without any flag', r.body.ok === true && r.body.role === 'portal-admin');

console.log('\n=== granting access ===');
r = await call('portalSetAccess', ['bopha', '1234', 'st_plain', { portalStaff: true }]);
ok('an ordinary member cannot grant themselves access', r.body.ok === false && r.body.err === 'not_authorized' && !mem.staff.find(s => s.id === 'st_plain').portalStaff);
r = await call('portalSetAccess', ['dara', '1234', 'st_plain', { portalStaff: true }]);
ok('portal staff cannot grant access', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalSetAccess', ['sina', '1234', 'st_plain', { portalStaff: true }]);
ok('a portal admin grants portal-staff', r.body.ok === true && r.body.staff.portalStaff === true && mem.staff.find(s => s.id === 'st_plain').portalStaff === true);
r = await call('portalBoot', ['bopha', '1234']);
ok('and the person can open the portal at once', r.body.ok === true && r.body.role === 'portal-staff');
r = await call('portalSetAccess', ['sina', '1234', 'st_plain', { portalAdmin: true }]);
ok('a portal admin cannot make a portal admin', r.body.ok === false && r.body.err === 'not_authorized' && !mem.staff.find(s => s.id === 'st_plain').portalAdmin);
r = await call('portalSetAccess', ['uriah', '1234', 'st_plain', { portalAdmin: true }]);
ok('an app admin can', r.body.ok === true && r.body.staff.portalAdmin === true);
r = await call('portalSetAccess', ['uriah', '1234', anna.id, { portalStaff: true }]);
ok('never to an applicant account', r.body.ok === false && r.body.err === 'is_applicant' && !mem.staff.find(s => s.id === anna.id).portalStaff);
r = await call('portalSetAccess', ['sina', '1234', 'st_plain', { portalStaff: false }]);
ok('revoking works the same way', r.body.ok === true && r.body.staff.portalStaff === false);
r = await call('portalSetAccess', ['uriah', '1234', 'st_plain', { portalAdmin: false }]);
r = await call('portalBoot', ['bopha', '1234']);
ok('and closes the door again', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_plain', { portalStaff: true }]);
ok('Admin’s edit form sets the flag too', r.body.ok === true && r.body.staff.portalStaff === true && r.body.staff.kind === 'staff');
r = await call('adminUpdateStaff', ['uriah', '1234', anna.id, { portalStaff: true }]);
ok('but not on an applicant', r.body.ok === false && r.body.err === 'is_applicant');
r = await call('portalSetAccess', ['uriah', '1234', 'nobody', { portalStaff: true }]);
ok('an unknown id is not found', r.body.ok === false && r.body.err === 'not_found');

console.log('\n=== the CRM and the timeline ===');
r = await call('hrSaveCandidate', ['dara', '1234', { ...cand, stage: 'applied' }]);
ok('portal staff moves a stage through the CRM handler', r.body.ok === true && r.body.candidate.stage === 'applied');
ok('the portal fields survive a CRM edit', r.body.candidate.messenger === 'whatsapp' && r.body.candidate.staffId === anna.id && r.body.candidate.portal && r.body.candidate.portal.createdAt);
r = await call('portalBoot', ['anna.b', '2468']);
ok('the applicant now sees "pending" with "we get in touch" as the current step', r.body.application.status === 'pending' && r.body.application.steps.find(s => s.state === 'current').id === 'contact');
ok('received and form are done', r.body.application.steps.filter(s => s.state === 'done').map(s => s.id).join(',') === 'account,form,received');
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'contacted', assignedTo: 'st_pstaff', nextStep: 'Call on WhatsApp' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('contacted → in review, documents & reference current', r.body.application.status === 'in_review' && r.body.application.steps.find(s => s.state === 'current').id === 'docs');
ok('the applicant is not shown the staff’s internal next step or owner', !JSON.stringify(r.body).includes('Call on WhatsApp') && !JSON.stringify(r.body).includes('st_pstaff'));
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'interview' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('interview: documents step reads done, interview current', r.body.application.status === 'interview' && r.body.application.steps.find(s => s.id === 'docs').state === 'done' && r.body.application.steps.find(s => s.state === 'current').id === 'interview');
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'practical' }]);
ok('the new practical stage is accepted by the CRM', r.body.ok === true && r.body.candidate.stage === 'practical');
r = await call('portalBoot', ['anna.b', '2468']);
ok('accepted is done and getting ready is current', r.body.application.steps.find(s => s.id === 'accepted').state === 'done' && r.body.application.steps.find(s => s.state === 'current').id === 'practical');
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'arrived' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('arrived: every step done', r.body.application.status === 'arrived' && r.body.application.steps.every(s => s.state === 'done'));
r = await call('hrCandidateNote', ['dara', '1234', cand.id, 'Spoke on WhatsApp, very keen']);
ok('portal staff adds a note', r.body.ok === true && r.body.candidate.log.some(l => l.kind === 'note'));
r = await call('hrSaveCandidate', ['dara', '1234', { name: 'Walk-in Lead', type: 'team', stage: 'new' }]);
ok('a team is a candidate type now', r.body.ok === true && r.body.candidate.type === 'team');
r = await call('hrArchiveCandidate', ['dara', '1234', cand.id, { reason: 'Test close' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('an archived application reads closed to the applicant', r.body.application.status === 'closed' && r.body.application.archived);
r = await call('hrArchiveCandidate', ['dara', '1234', cand.id, null]);

console.log('\n=== the applicant’s own contact details ===');
r = await call('portalUpdateContact', ['anna.b', '2468', { phone: '+855 12 345 678', messenger: 'telegram' }]);
ok('an applicant changes their phone and messenger', r.body.ok === true && r.body.me.phone === '+855 12 345 678' && r.body.me.messenger === 'telegram');
ok('and the CRM record follows', mem.candidates.find(c => c.id === cand.id).messenger === 'telegram');
r = await call('portalUpdateContact', ['anna.b', '2468', { phone: '', messenger: 'telegram' }]);
ok('but cannot blank the phone', r.body.ok === false && r.body.err === 'phone_required');
r = await call('portalUpdateContact', ['dara', '1234', { phone: '+1 555', messenger: 'whatsapp' }]);
ok('staff cannot use the applicant’s handler', r.body.ok === false);
r = await call('portalBoot', ['tom.v', '2468']);
ok('the second applicant still sees only their own', r.body.ok === true && r.body.application.type === 'volunteer' && !JSON.stringify(r.body).includes('anna'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
