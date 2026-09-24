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
  withPin({ id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true, email: 'u@x.org' }),
  withPin({ id: 'st_padmin', name: 'Sina Sok', username: 'sina', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, portalAdmin: true, email: 's@x.org' }),
  withPin({ id: 'st_pstaff', name: 'Dara Pen', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, portalStaff: true, email: 'd@x.org' }),
  withPin({ id: 'st_plain', name: 'Bopha Kim', username: 'bopha', campus: 'siemreap', dept: 'Youth Education', ministry: 'YDC', active: true, email: 'b@x.org' }),
  withPin({ id: 'st_hr', name: 'Mealea Sok', username: 'mealea', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', active: true, hr: true, email: 'm@x.org' }),
  withPin({ id: 'st_teams', name: 'Rithy Team', username: 'rithy', campus: 'siemreap', dept: 'Community Service', ministry: 'Outreach Teams', active: true, portalStaff: true, email: 'r@x.org' }),
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
const APP = { username: 'anna.b', pin: '2468', name: 'Anna Example', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', type: 'student', school: 'dts', country: 'Sweden', campus: 'siemreap' };

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
r = await call('portalRegister', [{ ...APP, campus: 'phnompenh' }]);
ok('a campus is required — Poipet or Siem Reap', r.body.ok === false && r.body.err === 'campus_required');
r = await call('portalRegister', [{ ...APP, campus: 'poipet', school: 'bcs' }]);
ok('a school not run at that campus is refused (no BCS in Poipet)', r.body.ok === false && r.body.err === 'school_not_at_campus');
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
ok('the dashboard says which campus', r.body.application.campus === 'siemreap' && r.body.me.campus === 'siemreap');
const cand = mem.candidates.find(c => c.staffId === anna.id);
ok('the candidate record exists in the CRM, source portal, stage new, pointing back at the account', cand && cand.source === 'portal' && cand.stage === 'new' && cand.type === 'student' && cand.school === 'dts' && cand.messenger === 'whatsapp' && cand.id === anna.applicant.candidateId);
ok('no PIN or hash leaks in the sign-up answer', !JSON.stringify(r.body).includes(anna.pinHash) && !JSON.stringify(r.body).includes('2468'));
r = await call('portalRegister', [{ ...APP, username: 'tom.v', email: 'tom@example.org', type: 'volunteer', school: '', messenger: 'telegram', campus: 'poipet' }]);
ok('a volunteer signs up with no school, at Poipet', r.body.ok === true && r.body.application.type === 'volunteer' && r.body.application.school === '' && r.body.application.campus === 'poipet');
ok('and the account and candidate carry that campus', mem.staff.find(s => s.username === 'tom.v').campus === 'poipet' && mem.candidates.find(c => c.name === 'Anna Example').campus === 'siemreap' && mem.candidates.find(c => c.staffId === mem.staff.find(s => s.username === 'tom.v').id).campus === 'poipet');
r = await call('portalRegister', [{ ...APP, username: 'dbs.pp', email: 'dbs@example.org', school: 'dbs', campus: 'poipet' }]);
ok('Poipet runs DBS, so a DBS student may pick it', r.body.ok === true && r.body.application.school === 'dbs' && r.body.application.campus === 'poipet');
mem.staff = mem.staff.filter(s => s.username !== 'dbs.pp'); mem.candidates = mem.candidates.filter(c => c.name !== 'Anna Example' || c.school !== 'dbs');
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
ok('the roster leaves applicants out', r.body.every(p => p.username !== 'anna.b' && p.username !== 'tom.v') && r.body.length === 6);
r = await call('getMyBoot', ['uriah', '1234']);
ok('boot’s roster and base roster leave them out too', r.body.roster.every(p => p.username !== 'anna.b') && r.body.roster.length === 6);
r = await call('getMyBoot', ['dara', '1234']);
ok('boot tells the staff app who has portal access, for the menu item', r.body.staff.portalStaff === true && r.body.staff.portalAdmin === false);
r = await call('adminListStaff', ['uriah', '1234']);
ok('Admin’s account list is staff only', r.body.staff.every(p => p.username !== 'anna.b') && r.body.staff.length === 6);
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
ok('and the list of portal staff to assign as owner', r.body.staff.map(x => x.username).sort().join(',') === 'dara,rithy,sina,uriah');
ok('an ordinary portal staff member’s scope is everything', r.body.scope === null);
ok('and which campus runs which school', JSON.stringify(r.body.campuses) === JSON.stringify({ poipet: ['dts', 'dbs'], siemreap: ['dts', 'dbs', 'bcs', 'sms'] }));
ok('no PIN material in the staff view either', !JSON.stringify(r.body).includes('pinHash') && !JSON.stringify(r.body).includes(anna.pinHash));
r = await call('portalBoot', ['sina', '1234']);
ok('a portal admin is "portal-admin"', r.body.ok === true && r.body.role === 'portal-admin');
r = await call('portalBoot', ['uriah', '1234']);
ok('an app admin is a portal admin without any flag', r.body.ok === true && r.body.role === 'portal-admin');

console.log('\n=== Outreach Teams sees teams only ===');
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Grace Church Team', type: 'team', stage: 'new', campus: 'siemreap' }]);
const teamCand = r.body.candidate;
ok('a team application exists (added by a portal admin)', r.body.ok === true && teamCand.type === 'team');
r = await call('portalBoot', ['rithy', '1234']);
ok('someone on Outreach Teams opens the portal on team applications only', r.body.ok === true && r.body.applicants.length === 1 && r.body.applicants[0].type === 'team' && JSON.stringify(r.body.scope) === '["team"]');
ok('and none of the students or volunteers reach them', !JSON.stringify(r.body).includes('anna@example.org') && !JSON.stringify(r.body).includes('tom@example.org'));
r = await call('hrSaveCandidate', ['rithy', '1234', { ...cand, stage: 'contacted' }]);
ok('they cannot move a student’s stage', r.body.ok === false && r.body.err === 'not_authorized' && mem.candidates.find(c => c.id === cand.id).stage === 'new');
r = await call('hrCandidateNote', ['rithy', '1234', cand.id, 'peeking']);
ok('nor note on one', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrArchiveCandidate', ['rithy', '1234', cand.id, { reason: 'x' }]);
ok('nor close one', r.body.ok === false && r.body.err === 'not_authorized' && !mem.candidates.find(c => c.id === cand.id).archived);
r = await call('hrSaveCandidate', ['rithy', '1234', { name: 'Sneaky Student', type: 'student', school: 'dts', stage: 'new', campus: 'siemreap' }]);
ok('nor add an application of a kind they cannot see', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrSaveCandidate', ['rithy', '1234', { ...teamCand, stage: 'contacted', nextStep: 'Send the hosting info' }]);
ok('but they work team applications freely', r.body.ok === true && r.body.candidate.stage === 'contacted');
r = await call('hrCandidateNote', ['rithy', '1234', teamCand.id, 'Team of 12, coming in March']);
ok('notes on a team too', r.body.ok === true);
r = await call('portalBoot', ['dara', '1234']);
ok('everyone else with access still sees teams alongside the rest', r.body.applicants.some(a => a.type === 'team') && r.body.applicants.some(a => a.type === 'student'));
r = await call('hrCandidates', ['mealea', '1234']);
ok('HR keeps its full reach', r.body.ok === true && r.body.candidates.some(c => c.type === 'team') && r.body.candidates.some(c => c.type === 'student'));
mem.candidates = mem.candidates.filter(c => c.id !== teamCand.id);

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

console.log('\n=== the forms ===');
r = await call('portalBoot', ['dara', '1234']);
ok('the staff side gets every form, shipped defaults to start', r.body.forms && Object.keys(r.body.forms).sort().join(',') === 'bcs,dbs,dts,sms,staff,team,volunteer' && r.body.forms.dts.isDefault === true && r.body.forms.team.sections.some(s => s.id === 'hospitality'));
r = await call('portalRegister', [{ ...APP, username: 'fanny.f', email: 'fanny@example.org', country: 'Finland' }]);
const fanny = mem.staff.find(s => s.username === 'fanny.f'), fannyCand = mem.candidates.find(c => c.staffId === fanny.id);
r = await call('portalBoot', ['fanny.f', '2468']);
ok('an applicant gets only their own form, with its questions in Khmer and English', r.body.form && r.body.form.key === 'dts' && r.body.form.sections[0].questions[0].label.en && r.body.form.sections[0].questions[0].label.km);
ok('Fanny (Finland) is international: needs a reference and the visa guide', r.body.application.audience === 'international' && r.body.application.refNeeded === true && r.body.application.needsVisa === true && r.body.application.steps.find(s => s.id === 'docs').items.length === 2);
const dtsForm = r.body.form;
r = await call('portalSaveForm', ['dara', '1234', 'dts', dtsForm]);
ok('portal staff cannot edit a form', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalSaveForm', ['sina', '1234', 'mba', dtsForm]);
ok('an unknown form key is refused', r.body.ok === false && r.body.err === 'bad_key');
r = await call('portalSaveForm', ['sina', '1234', 'dts', { sections: 'nope' }]);
ok('a malformed form is refused', r.body.ok === false && r.body.err === 'bad_form');
const edited = JSON.parse(JSON.stringify(dtsForm));
edited.sections[0].questions[0].label.en = 'Your date of birth';
edited.sections.push({ id: 'extra', title: { en: 'One more thing', km: 'មួយទៀត' }, help: { en: '', km: '' }, questions: [{ id: 'shoe', type: 'choice', label: { en: 'Shoe size', km: 'ទំហំស្បែកជើង' }, required: true, audience: 'international', options: [{ en: 'Small', km: 'តូច' }, { en: 'Large', km: 'ធំ' }] }, { type: 'bogus', label: { en: 'Odd type becomes short', km: '' }, audience: 'martian' }, { id: 'nolabel', type: 'short', label: { en: '', km: '' } }] });
r = await call('portalSaveForm', ['sina', '1234', 'dts', edited]);
ok('a portal admin edits a form — relabel, add a section and questions', r.body.ok === true && r.body.form.sections[0].questions[0].label.en === 'Your date of birth' && r.body.form.sections.some(s => s.id === 'extra'));
const extra = r.body.form.sections.find(s => s.id === 'extra');
ok('the server cleans what it stores: unknown type → short, unknown audience → all, a question with no label is dropped', extra.questions.length === 2 && extra.questions[1].type === 'short' && extra.questions[1].audience === 'all' && extra.questions[0].options.length === 2);
ok('the stored form is no longer the default', r.body.forms.dts.isDefault === undefined && r.body.forms.dbs.isDefault === true);
r = await call('portalBoot', ['fanny.f', '2468']);
ok('the applicant sees the edited form at once', r.body.form.sections[0].questions[0].label.en === 'Your date of birth' && r.body.form.sections.some(s => s.id === 'extra'));

console.log('\n=== filling it in ===');
r = await call('portalSaveDraft', ['dara', '1234', { dob: '1999-01-01' }]);
ok('staff cannot save an applicant draft', r.body.ok === false);
r = await call('portalSaveDraft', ['fanny.f', '2468', { dob: '1999-01-01', gender: 'Female', nothing: 'x', testimony: 'A'.repeat(5000) }]);
ok('the applicant saves a draft — unknown ids dropped, long answers cut', r.body.ok === true && r.body.answers.dob === '1999-01-01' && r.body.answers.nothing === undefined && r.body.answers.testimony.length === 4000);
r = await call('portalBoot', ['fanny.f', '2468']);
ok('the draft comes back on boot, status still draft', r.body.application.answers.dob === '1999-01-01' && r.body.application.status === 'draft' && r.body.application.draftAt);
r = await call('portalSubmit', ['fanny.f', '2468']);
ok('submit with required answers missing is refused and says which', r.body.ok === false && r.body.err === 'missing' && r.body.missing.includes('testimony') === false && r.body.missing.includes('church') && r.body.missing.includes('shoe') && r.body.missing.includes('leaderContact'));
ok('a Khmer-only question is not demanded of an international applicant', !r.body.missing.includes('english') && r.body.missing.includes('leaderContact'));
const full = {};
dtsForm.sections.forEach(s => s.questions.forEach(qq => { if (qq.audience !== 'khmer') full[qq.id] = qq.type === 'multi' ? ['x'] : (qq.options && qq.options.length ? qq.options[0].en : (qq.type === 'date' ? '2000-01-01' : 'answer')); }));
full.shoe = 'Small';
r = await call('portalSubmit', ['fanny.f', '2468', full]);
ok('a complete submission goes through and moves the record to applied', r.body.ok === true && r.body.application.status === 'pending' && r.body.application.stage === 'applied' && r.body.application.submittedAt && r.body.application.steps.find(s => s.state === 'current').id === 'contact');
ok('the answers are on the record and the stage move is logged', mem.candidates.find(c => c.id === fannyCand.id).portal.form.answers.shoe === 'Small' && mem.candidates.find(c => c.id === fannyCand.id).log.some(l => l.kind === 'stage' && l.text === 'applied'));
r = await call('portalSaveDraft', ['fanny.f', '2468', { dob: '1980-01-01' }]);
ok('after submitting, the applicant cannot change answers', r.body.ok === false && r.body.err === 'submitted');
r = await call('portalSubmit', ['fanny.f', '2468', full]);
ok('nor submit twice', r.body.ok === false && r.body.err === 'submitted');
r = await call('portalBoot', ['dara', '1234']);
ok('staff see the answers on the record', r.body.applicants.find(a => a.id === fannyCand.id).portal.form.answers.church === 'answer');
r = await call('portalStaffSaveAnswers', ['dara', '1234', fannyCand.id, Object.assign({}, full, { church: 'Corrected Church' })]);
ok('staff correct an answer, and it is logged', r.body.ok === true && r.body.candidate.portal.form.answers.church === 'Corrected Church' && r.body.candidate.log.some(l => /Edited the application answers/.test(l.text)));
r = await call('portalStaffSaveAnswers', ['rithy', '1234', fannyCand.id, full]);
ok('but not outside their scope', r.body.ok === false && r.body.err === 'not_authorized');

console.log('\n=== Khmer students, teams, visas ===');
r = await call('portalRegister', [{ ...APP, username: 'srey.k', email: 'srey@example.org', country: 'Cambodia', campus: 'siemreap', school: 'dts' }]);
ok('a Khmer student needs no leader reference — the docs step has only documents', r.body.ok === true && r.body.application.audience === 'khmer' && r.body.application.refNeeded === false && r.body.application.needsVisa === false && r.body.application.steps.find(s => s.id === 'docs').items.map(i => i.id).join(',') === 'documents');
r = await call('portalBoot', ['srey.k', '2468']);
const srey = mem.staff.find(s => s.username === 'srey.k');
r = await call('portalSubmit', ['srey.k', '2468', {}]);
ok('a Khmer student is asked the Khmer-only question and not the international one', r.body.missing.includes('english') && !r.body.missing.includes('leaderContact'));
r = await call('portalRegister', [{ ...APP, username: 'team.au', email: 'team@example.org', type: 'team', school: '', country: 'Australia', campus: 'siemreap' }]);
ok('a team needs no leader reference but does need the visa guide', r.body.ok === true && r.body.application.refNeeded === false && r.body.application.needsVisa === true && r.body.application.formKey === 'team');
const teamAcct = mem.staff.find(s => s.username === 'team.au'), teamRec = mem.candidates.find(c => c.staffId === teamAcct.id);
r = await call('portalSetVisaFlags', ['dara', '1234', teamRec.id, { flightsConfirmed: true }]);
ok('staff tick "flights confirmed" on a team', r.body.ok === true && r.body.candidate.portal.visa.flightsConfirmed === true && !r.body.candidate.portal.visa.invitationSent);
r = await call('portalSetVisaFlags', ['rithy', '1234', teamRec.id, { invitationSent: true }]);
ok('Outreach Teams staff tick "letter of invitation sent" on a team', r.body.ok === true && r.body.candidate.portal.visa.invitationSent === true);
r = await call('portalSetVisaFlags', ['rithy', '1234', cand.id, { invitationSent: true }]);
ok('but not on a student', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalBoot', ['team.au', '2468']);
ok('the team sees both flags on their dashboard', r.body.application.visa.flightsConfirmed === true && r.body.application.visa.invitationSent === true);
r = await call('portalRegister', [{ ...APP, username: 'nocountry', email: 'nc@example.org', country: '' }]);
ok('country is required at sign-up — it decides Khmer or international', r.body.ok === false && r.body.err === 'country_required');
r = await call('portalResetForm', ['dara', '1234', 'dts']);
ok('portal staff cannot reset a form', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalResetForm', ['sina', '1234', 'dts']);
ok('a portal admin resets a form to the shipped default', r.body.ok === true && r.body.forms.dts.isDefault === true && !r.body.forms.dts.sections.some(s => s.id === 'extra'));
mem.staff = mem.staff.filter(s => s.username !== 'srey.k' && s.username !== 'team.au' && s.username !== 'fanny.f'); mem.candidates = mem.candidates.filter(c => c.staffId !== srey.id && c.staffId !== teamAcct.id && c.id !== fannyCand.id);

console.log('\n=== deleting an applicant ===');
r = await call('portalRegister', [{ ...APP, username: 'dup.e', email: 'dup@example.org' }]);
const dup = mem.staff.find(s => s.username === 'dup.e'), dupCand = mem.candidates.find(c => c.staffId === dup.id);
r = await call('portalDeleteApplicant', ['dara', '1234', dupCand.id]);
ok('portal staff cannot delete an applicant', r.body.ok === false && r.body.err === 'not_authorized' && mem.staff.some(s => s.id === dup.id));
r = await call('portalDeleteApplicant', ['anna.b', '2468', dupCand.id]);
ok('nor can an applicant', r.body.ok === false && mem.staff.some(s => s.id === dup.id));
r = await call('portalDeleteApplicant', ['sina', '1234', 'nope']);
ok('an unknown record is not found', r.body.ok === false && r.body.err === 'not_found');
r = await call('portalDeleteApplicant', ['sina', '1234', dupCand.id]);
ok('a portal admin deletes the application and the account behind it', r.body.ok === true && r.body.deleted === dupCand.id && r.body.accountRemoved === true && !mem.candidates.some(c => c.id === dupCand.id) && !mem.staff.some(s => s.id === dup.id));
ok('and gets the refreshed list back', r.body.role === 'portal-admin' && Array.isArray(r.body.applicants) && !r.body.applicants.some(x => x.id === dupCand.id));
r = await call('portalBoot', ['dup.e', '2468']);
ok('the deleted applicant can no longer sign in', r.body.ok === false && r.body.err === 'auth');
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Arrived Person', type: 'staff', stage: 'arrived', staffId: 'st_plain', campus: 'siemreap' }]);
const arrivedCand = r.body.candidate;
r = await call('portalDeleteApplicant', ['uriah', '1234', arrivedCand.id]);
ok('a record pointing at a real staff account loses only the record — the staff account stays', r.body.ok === true && r.body.accountRemoved === false && mem.staff.some(s => s.id === 'st_plain') && !mem.candidates.some(c => c.id === arrivedCand.id));

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
