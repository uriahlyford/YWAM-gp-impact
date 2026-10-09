/* portal.html in the browser — milestone 1. The front door and its deep
   link (?apply=dts opens sign-up on DTS), the sign-up form's own checks, the
   applicant's dashboard: status pill, the timeline with the current step
   highlighted, contact details they can edit; the language toggle; a real
   desktop layout (two columns) versus a phone (one); and the staff side:
   the gate, the list, stage / owner / notes through the CRM handlers, the
   one-tap chat link. The API is mocked; every person is made up. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4492, r));
const URL = 'http://localhost:4492/portal.html';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const STEPS = (current) => {
  const ids = ['account', 'form', 'received', 'contact', 'docs', 'interview', 'accepted', 'practical', 'arrived'];
  const ci = ids.indexOf(current);
  return ids.map((id, i) => ({ id, state: i < ci ? 'done' : i === ci ? 'current' : 'todo', items: id === 'docs' ? [{ id: 'documents', done: false }, { id: 'reference', done: false }] : undefined }));
};
/* a team's own steps, as teamSteps_ in api.js returns them */
const TEAM_STEPS = (current) => {
  const defs = [['account', 'you'], ['form', 'you', 'auto'], ['call1', 'us', 'tick'], ['passports', 'you', 'auto', 'docs'], ['photo', 'you', 'auto', 'docs'], ['flights', 'you', 'auto', 'docs'],
    ['invitation', 'us', 'auto', 'visa'], ['evisa', 'you', 'auto', 'visa'], ['call2', 'us', 'tick'], ['practical', 'you'], ['arrived', 'us', 'tick']];
  const ci = defs.findIndex(d => d[0] === current);
  return defs.map(([id, who, kind, group], i) => ({ id, who, group, tick: kind === 'tick' || undefined, auto: kind === 'auto' || undefined, done: i < ci, state: i < ci ? 'done' : i === ci ? 'current' : 'todo' }));
};
const FORM = { key: 'dts', title: { en: 'DTS application', km: 'ពាក្យសុំ DTS' }, sections: [
  { id: 'about', title: { en: 'About you', km: 'អំពីអ្នក' }, help: { en: '', km: '' }, questions: [
    { id: 'dob', type: 'date', label: { en: 'Date of birth', km: 'ថ្ងៃខែឆ្នាំកំណើត' }, help: { en: '', km: '' }, required: true, audience: 'all', options: [] },
    { id: 'gender', type: 'choice', label: { en: 'Gender', km: 'ភេទ' }, help: { en: '', km: '' }, required: true, audience: 'all', options: [{ en: 'Male', km: 'ប្រុស' }, { en: 'Female', km: 'ស្រី' }] },
    { id: 'leaderContact', type: 'short', label: { en: 'Leader’s phone', km: 'ទូរស័ព្ទអ្នកដឹកនាំ' }, help: { en: 'We will ask for a reference.', km: '' }, required: true, audience: 'international', options: [] },
    { id: 'english', type: 'choice', label: { en: 'How is your English?', km: 'អង់គ្លេស?' }, help: { en: '', km: '' }, required: true, audience: 'khmer', options: [{ en: 'Basic', km: '' }, { en: 'Good', km: '' }] } ] },
  { id: 'faith', title: { en: 'Your faith', km: 'ជំនឿ' }, help: { en: '', km: '' }, questions: [
    { id: 'testimony', type: 'long', label: { en: 'Tell us how you came to know Jesus.', km: 'ប្រាប់យើង' }, help: { en: '', km: '' }, required: true, audience: 'all', options: [] },
    { id: 'gifts', type: 'multi', label: { en: 'Gifts', km: '' }, help: { en: '', km: '' }, required: false, audience: 'all', options: [{ en: 'Teaching', km: '' }, { en: 'Music', km: '' }] } ] } ] };
const REF_FORM = { key: 'reference', title: { en: 'Leader reference form', km: '' }, sections: [
  { id: 'basic', title: { en: 'Basic information', km: '' }, help: { en: 'Your comments will be considered seriously.', km: '' }, questions: [
    { id: 'leaderName', type: 'short', label: { en: 'Your full name', km: '' }, help: { en: '', km: '' }, required: true, options: [], audience: 'all' },
    { id: 'leaderEmail', type: 'email', label: { en: 'Your email', km: '' }, help: { en: '', km: '' }, required: true, options: [], audience: 'all' } ] },
  { id: 'suitability', title: { en: 'Suitability for missions', km: '' }, help: { en: '', km: '' }, questions: [
    { id: 'recommend', type: 'choice', label: { en: 'Would you:', km: '' }, help: { en: '', km: '' }, required: true, options: [{ en: 'Highly recommend', km: '' }, { en: 'Not recommend this applicant', km: '' }], audience: 'all' },
    { id: 'additional', type: 'long', label: { en: 'Anything else?', km: '' }, help: { en: '', km: '' }, required: false, options: [], audience: 'all' } ] } ] };
const TEAM_FORM = { key: 'team', title: { en: 'Short-term team application', km: '' }, sections: [
  { id: 'team', title: { en: 'Your team', km: '' }, help: { en: '', km: '' }, questions: [
    { id: 'teamName', type: 'short', label: { en: 'Team name', km: '' }, help: { en: '', km: '' }, required: true, options: [], audience: 'all' },
    { id: 'coLeaders', type: 'people', label: { en: 'Co-leaders', km: '' }, help: { en: 'Add as many as you have.', km: '' }, required: false, options: [], audience: 'all', addLabel: { en: 'Add a co-leader', km: '' } } ] },
  { id: 'trip', title: { en: 'Your trip', km: '' }, help: { en: 'Estimates are fine.', km: '' }, questions: [
    { id: 'itinerary', type: 'stays', label: { en: 'When will your team be with us, and anywhere else in Cambodia?', km: '' }, help: { en: 'The location your team arrives at first is responsible for handling your visa.', km: '' }, required: true, options: [], audience: 'all' },
    { id: 'flightsBooked', type: 'yesno', label: { en: 'Have you booked your flights yet?', km: '' }, help: { en: 'If yes, attach your itinerary here.', km: '' }, required: true, options: [{ en: 'Yes', km: '' }, { en: 'No', km: '' }], audience: 'all', attach: 'flights' } ] },
  { id: 'hospitality', title: { en: 'Hospitality', km: '' }, help: { en: '', km: '' }, questions: [
    { id: 'males', type: 'number', label: { en: 'How many males?', km: '' }, help: { en: '', km: '' }, required: true, options: [], audience: 'all' } ] } ] };
const TEAM_DOCS = [{ id: 'passports', required: true }, { id: 'photo', required: true }, { id: 'flights', required: true }, { id: 'invitation', required: false, from: 'us' }, { id: 'evisa', required: false }];
let TEAM_APP = null, NEW_TEAM_APP = null;
// this week's published schedules, as portalBoot hands them to a team that has arrived (made-up names)
const TEAM_SCHED = { week: '2026-10-04',
  kitchen: { kind: 'kitchen', week: '2026-10-04', layout: 'grid', title: 'Cooking schedule', km: '', notes: '', days: ['mon', 'tue'], rows: [{ id: 'bf', label: 'Breakfast 7:30', km: '', time: '', off: [], span: false }], cells: { 'bf|mon': ['Member One'] }, published: true },
  chores: null };
let GOOGLE_ON = '';
let TEAM_PHOTOS = {};   // the mocked team photo store, by person key
let STRENGTHS = {};     // the mocked personality results, by person key
const MEET_STAFF0 = [{ id: 'st_dara', name: 'Dara Pen', role: 'Host', ministry: 'Hospitality', dept: 'Campus Leadership', hasPhoto: true, edited: false }, { id: 'st_yan', name: 'Yan Yap', role: 'YAP', ministry: 'Cafe', dept: 'Community Service', hasPhoto: false, edited: false }];
const MEET_STAFF = MEET_STAFF0.map(x => ({ ...x }));
const STRENGTH_PEOPLE = () => [{ key: 'leader', name: 'Lee Leader', role: 'leader' }].concat(((TEAM_APP && TEAM_APP.members) || []).map((m, i) => ({ key: m.id || ('m00000' + i), name: m.name, role: 'member', sex: m.sex })));
let RESOURCES = [{ id: 'r_leaders', kind: 'guide', title: 'Outreach Leader’s Guide', note: 'Getting here and more.', value: 'outreach' }, { id: 'r_police', kind: 'phone', title: 'Police', note: 'Emergency — Cambodia', value: '117' },
  { id: 'r_maps', kind: 'link', title: 'Our favourite places in Siem Reap', note: 'Cafes we like.', value: '' }, { id: 'r_teams', kind: 'link', title: 'Guide for Short-Term Teams', note: '', value: 'https://example.org/teams.pdf' },
  { id: 'r_grab', kind: 'app', title: 'Grab', note: 'Tuk-tuks — like Uber, but way cheaper.', value: 'https://www.grab.com/kh/download/' }];   // the mocked portalAuthConfig: Google's client id, or off
let CANDS0 = null;  // a fresh copy of the sample records, for blocks that run after others changed them
const FORMS = { dts: { ...FORM, isDefault: true }, dbs: { ...FORM, key: 'dbs' }, bcs: { ...FORM, key: 'bcs' }, sms: { ...FORM, key: 'sms' }, staff: { ...FORM, key: 'staff' }, volunteer: { ...FORM, key: 'volunteer' }, team: TEAM_FORM, reference: REF_FORM };
let ANNA = { id: 'cd_anna', name: 'Anna Example', type: 'student', school: 'dts', stage: 'new', status: 'draft', submittedAt: null, updated: '2026-09-20T10:00:00Z', archived: null, steps: STEPS('form'), campus: 'siemreap', audience: 'international', needsVisa: true, refNeeded: true, formKey: 'dts', visa: {}, answers: {}, draftAt: null };
const ME_APP = { id: 'st_anna', name: 'Anna Example', username: 'anna.b', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', type: 'student', school: 'dts' };
const STAFF = [{ id: 'st_dara', name: 'Dara Pen', username: 'dara', campus: 'siemreap', isAdmin: false, portalAdmin: false, portalStaff: true, role: 'portal-staff' }, { id: 'st_sina', name: 'Sina Sok', username: 'sina', campus: 'siemreap', isAdmin: false, portalAdmin: true, portalStaff: false, role: 'portal-admin' }];
let ACCESS_STAFF = [{ id: 'st_sina', name: 'Sina Sok', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', portalStaff: false, portalAdmin: true, isAdmin: false, leadsTeams: false },
  { id: 'st_dara', name: 'Dara Pen', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', portalStaff: true, portalAdmin: false, isAdmin: false, leadsTeams: false },
  { id: 'st_rithy', name: 'Rithy Team', campus: 'siemreap', dept: 'Community Service', ministry: 'Outreach Teams', portalStaff: false, portalAdmin: false, isAdmin: false, leadsTeams: true },
  { id: 'st_uriah', name: 'Uriah Admin', campus: 'siemreap', dept: 'Campus Leadership', ministry: '', portalStaff: false, portalAdmin: false, isAdmin: true, leadsTeams: false },
  { id: 'st_plain', name: 'Plain Staff', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', portalStaff: false, portalAdmin: false, isAdmin: false, leadsTeams: false }];
let ACCOUNTS = [
  { id: 'st_anna', username: 'anna.b', name: 'Anna Example', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', campus: 'siemreap', type: 'student', school: 'dts', candidateId: 'cd_anna', stage: 'new', status: 'draft', created: '2026-09-20T10:00:00Z' },
  { id: 'st_team', username: 'team.au', name: 'Grace Team', email: 'team@example.org', phone: '+61 400 000 000', messenger: 'telegram', country: 'Australia', campus: 'siemreap', type: 'team', school: '', candidateId: 'cd_team', stage: 'accepted', status: 'accepted', created: '2026-09-01T10:00:00Z' }
];
let CANDS = [
  { id: 'cd_anna', campus: 'siemreap', name: 'Anna Example', type: 'student', school: 'dts', stage: 'applied', status: 'pending', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', source: 'portal', assignedTo: '', nextStep: '', nextDate: '', staffId: 'st_anna', hasAccount: true, refNeeded: true, reference: { status: 'none' }, updated: '2026-09-20T10:00:00Z', log: [{ at: '2026-09-19T09:00:00Z', by: 'st_anna', kind: 'stage', text: 'new' }], archived: null, audience: 'international', needsVisa: true, refNeeded: true, formKey: 'dts', portal: { createdAt: '2026-09-19', submittedAt: '2026-09-20T10:00:00Z', form: { answers: { dob: '1999-05-05', gender: 'Female', leaderContact: '+46 1', testimony: 'Long story', gifts: ['Music'] } } } },
  { id: 'cd_tom', campus: 'siemreap', name: 'Tom Volunteer', type: 'volunteer', school: '', stage: 'contacted', status: 'in_review', email: 'tom@example.org', phone: '+1 555 000 1111', messenger: 'telegram', country: 'United States', source: 'portal', assignedTo: 'st_dara', nextStep: 'Video call', nextDate: '2026-09-30', staffId: 'st_tom', hasAccount: true, refNeeded: true, reference: { status: 'received', receivedAt: '2026-09-22T10:00:00Z', leaderName: 'Pastor Example', leaderEmail: 'pastor@example.org', answers: { leaderName: 'Pastor Example', leaderEmail: 'pastor@example.org', recommend: 'Highly recommend' } }, updated: '2026-09-21T10:00:00Z', log: [], archived: null, audience: 'international', needsVisa: true, refNeeded: true, formKey: 'volunteer' },
  { id: 'cd_pp', campus: 'poipet', name: 'Poipet Person', type: 'student', school: 'dbs', stage: 'new', status: 'draft', email: '', phone: '+855 11 222 333', messenger: 'telegram', country: 'Cambodia', source: 'portal', assignedTo: '', staffId: 'st_pp', hasAccount: true, updated: '2026-09-18T10:00:00Z', log: [], archived: null },
  { id: 'cd_team', campus: 'siemreap', name: 'Pat Leader', type: 'team', steps: TEAM_STEPS('call1'), school: '', stage: 'new', status: 'draft', email: 'team@example.org', phone: '+61 400 000 000', messenger: 'whatsapp', country: 'Australia', source: 'portal', assignedTo: '', staffId: 'st_team', hasAccount: true, updated: '2026-09-17T10:00:00Z', log: [], archived: null,
    formKey: 'team', docKinds: TEAM_DOCS,
    portal: { submittedAt: '2026-09-17T10:00:00Z', form: { answers: { teamName: 'Grace Church Team', location: 'Sydney, Australia', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-10', to: '2027-01-20', base: true }, { place: 'Phnom Penh', from: '2027-01-20', to: '2027-01-23' }], males: '6', females: '8', couples: '2', flightsBooked: 'No' } }, docs: [{ id: 'pd_1', kind: 'passports', name: 'passports.pdf', mime: 'application/pdf', size: 1200, added: '2026-09-18T10:00:00Z', by: 'st_team' }] } },
  { id: 'cd_old', campus: 'siemreap', name: 'Closed Case', type: 'staff', school: '', stage: 'new', status: 'closed', email: '', phone: '', messenger: '', country: '', source: 'hr', assignedTo: '', staffId: '', hasAccount: false, updated: '2026-08-01T10:00:00Z', log: [], archived: { at: '2026-08-02', reason: 'Withdrew' } }
];
CANDS0 = JSON.parse(JSON.stringify(CANDS));
const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [], sent = [];
async function open(viewport, query, seed) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION|ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
  await ctx.route('**accounts.google.com/**', r => r.abort());
  await ctx.route('**/s2/favicons**', r => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64') }));
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b); let out = { ok: false };
    const [u, pin] = b.args || [];
    if (b.fn === 'portalMeetTeam') {
      out = { ok: true, campus: 'siemreap', canEdit: u === 'sina', staff: MEET_STAFF };
    } else if (b.fn === 'portalSaveStaffCard') {
      const p = b.args[3] || {}, card = MEET_STAFF.find(x => x.id === b.args[2]);
      if (u !== 'sina') out = { ok: false, err: 'not_authorized' };
      else if (!card) out = { ok: false, err: 'not_found' };
      else if (p.reset) { Object.assign(card, MEET_STAFF0.find(x => x.id === card.id)); out = { ok: true, staff: { ...card }, photo: card.hasPhoto ? 'data:image/jpeg;base64,AAAA' : '' }; }
      else { if (p.name !== undefined) card.name = p.name; if (p.role !== undefined) card.role = p.role; if (p.photo !== undefined) card.hasPhoto = !!p.photo; card.edited = true; out = { ok: true, staff: { ...card }, photo: card.hasPhoto ? 'data:image/jpeg;base64,' + (p.photo || 'AAAA') : '' }; }
    } else if (b.fn === 'portalStaffPhoto') {
      out = { ok: true, id: b.args[2], photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==' };
    } else if (b.fn === 'portalStrengths') {
      out = { ok: true, people: STRENGTH_PEOPLE(), results: STRENGTHS };
    } else if (b.fn === 'portalSaveStrength') {
      STRENGTHS[b.args[2]] = { type: b.args[3].type, scores: b.args[3].scores || null, source: b.args[3].source, at: '2026-10-07T01:00:00Z' };
      out = { ok: true, people: STRENGTH_PEOPLE(), results: STRENGTHS };
    } else if (b.fn === 'portalResources') {
      out = { ok: true, isDefault: true, items: RESOURCES };
    } else if (b.fn === 'portalSaveResources') {
      RESOURCES = b.args[2].map((r, i) => ({ ...r, id: r.id || ('r_new' + i) })); out = { ok: true, isDefault: false, items: RESOURCES };
    } else if (b.fn === 'portalTeamPhotos') {
      const ppl = [{ key: 'leader', name: 'Lee Leader', role: 'leader' }].concat(((TEAM_APP && TEAM_APP.members) || []).map((m, i) => ({ key: m.id || ('m00000' + i), name: m.name, role: 'member', sex: m.sex })));
      out = { ok: true, people: ppl, photos: TEAM_PHOTOS, tally: { count: Object.keys(TEAM_PHOTOS).length, total: ppl.length } };
    } else if (b.fn === 'portalSaveTeamPhoto') {
      TEAM_PHOTOS[b.args[2]] = { data: b.args[3], at: '2026-10-07T01:00:00Z', fromDoc: b.args[5] || '' };
      const ppl = [{ key: 'leader', name: 'Lee Leader', role: 'leader' }].concat(((TEAM_APP && TEAM_APP.members) || []).map((m, i) => ({ key: m.id || ('m00000' + i), name: m.name, role: 'member', sex: m.sex })));
      out = { ok: true, people: ppl, photos: TEAM_PHOTOS, tally: { count: Object.keys(TEAM_PHOTOS).length, total: ppl.length }, application: { ...TEAM_APP, photos: { count: Object.keys(TEAM_PHOTOS).length, total: ppl.length } } };
    } else if (b.fn === 'portalAuthConfig') {
      out = { ok: true, google: GOOGLE_ON };
    } else if (b.fn === 'portalRegister') {
      const p = b.args[0];
      out = p.email === 'taken@example.org' ? { ok: false, err: 'email_taken' } : { ok: true, role: 'applicant', user: p.email, token: p.googleToken ? 'a'.repeat(48) : '', me: { ...ME_APP, name: p.name, username: p.email, phone: p.phone, messenger: p.messenger, type: p.type, school: p.school }, application: { ...ANNA, type: p.type, school: p.school, answers: p.teamName ? { teamName: p.teamName } : {} }, form: p.type === 'team' ? TEAM_FORM : undefined };   // a team reply carries its form, as the server does now
    } else if (b.fn === 'portalBoot') {
      if (u === 'anna.b' && pin === '2468') out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA, form: FORM };
      else if (u === 'anna@example.org' && pin === 'secret123') out = { ok: true, role: 'applicant', me: { ...ME_APP, username: 'anna@example.org', authKind: 'password' }, application: ANNA, form: FORM };
      else if (u === 'srey.k' && pin === '2468') out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'Srey Khmer', username: 'srey.k', country: 'Cambodia' }, application: { ...ANNA, name: 'Srey Khmer', stage: 'accepted', status: 'accepted', audience: 'khmer', needsVisa: false, refNeeded: false, steps: STEPS('practical').map(s => s.id === 'docs' ? { ...s, items: [{ id: 'documents', done: true }] } : s), submittedAt: '2026-09-01T00:00:00Z' }, form: FORM };
      else if (u === 'team.au' && pin === '2468') { TEAM_APP = TEAM_APP || { ...ANNA, type: 'team', school: '', stage: 'docs', status: 'docs', refNeeded: false, formKey: 'team', steps: TEAM_STEPS('invitation'), trip: { id: 'ta_cd_team', from: '2026-09-01', to: '2026-09-20', metrics: { 'People Served': 30 }, reached: { male: 5, female: null } }, submittedAt: '2026-09-01T00:00:00Z', visa: { flightsConfirmed: true, invitationSent: false }, docKinds: TEAM_DOCS, docs: [] }; out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'Grace Team', username: 'team.au', country: 'Australia', type: 'team', school: '' }, application: TEAM_APP, form: TEAM_FORM, metricOverrides: [], schedules: TEAM_APP.stage === 'arrived' ? TEAM_SCHED : undefined }; }
      else if (u === 'team.new' && pin === '2468') { NEW_TEAM_APP = NEW_TEAM_APP || { ...ANNA, type: 'team', school: '', stage: 'new', status: 'draft', submittedAt: null, refNeeded: false, formKey: 'team', answers: {}, docKinds: TEAM_DOCS, docs: [] }; out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'New Team', username: 'team.new', country: 'Australia', type: 'team', school: '' }, application: NEW_TEAM_APP, form: TEAM_FORM }; }
      else if (u === 'dara' && pin === '1234') out = { ok: true, role: 'portal-staff', me: STAFF[0], applicants: CANDS, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], teamStages: ['new', 'applied', 'call1', 'docs', 'call2', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'], forms: FORMS };
      else if (u === 'rithy' && pin === '1234') out = { ok: true, role: 'portal-staff', me: { id: 'st_teams', name: 'Rithy Team', username: 'rithy', campus: 'siemreap', role: 'portal-staff' }, applicants: CANDS.filter(c => c.type === 'team'), scope: ['team'], staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], teamStages: ['new', 'applied', 'call1', 'docs', 'call2', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'] };
      else if (u === 'sina' && pin === '1234') out = { ok: true, role: 'portal-admin', me: STAFF[1], applicants: CANDS, scope: null, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], teamStages: ['new', 'applied', 'call1', 'docs', 'call2', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'], forms: FORMS };
      else if (u === 'bopha' && pin === '1234') out = { ok: false, err: 'not_authorized' };
      else out = { ok: false, err: 'auth' };
    } else if (b.fn === 'portalUpdateContact') {
      const p = b.args[2]; Object.assign(ME_APP, { phone: p.phone, messenger: p.messenger, country: p.country || ME_APP.country });
      out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA };
    } else if (b.fn === 'hrSaveCandidate') {
      const c = b.args[2]; CANDS = CANDS.map(x => x.id === c.id ? { ...x, ...c, log: x.log.concat(x.stage !== c.stage ? [{ at: new Date().toISOString(), by: u === 'dara' ? 'st_dara' : 'x', kind: 'stage', text: c.stage }] : []) } : x);
      out = { ok: true, candidate: CANDS.find(x => x.id === c.id) };
    } else if (b.fn === 'portalSaveDraft') {
      ANNA = { ...ANNA, answers: b.args[2], draftAt: new Date().toISOString() }; out = { ok: true, savedAt: ANNA.draftAt, answers: b.args[2] };
    } else if (b.fn === 'portalSubmit') {
      const ans = b.args[2]; const miss = ['dob', 'gender', 'leaderContact', 'testimony'].filter(k => !ans[k]);
      if (miss.length) out = { ok: false, err: 'missing', missing: miss };
      else { ANNA = { ...ANNA, answers: ans, stage: 'applied', status: 'pending', submittedAt: new Date().toISOString(), steps: STEPS('contact') }; out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA, form: FORM }; }
    } else if (b.fn === 'portalUpdateAnswers') {
      ANNA = { ...ANNA, answers: b.args[2], answersUpdatedAt: new Date().toISOString() }; out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA, form: FORM };
    } else if (b.fn === 'portalReferenceLink') {
      out = b.args[2] === 'cd_tom' ? { ok: false, err: 'received' } : { ok: true, token: 'abc123abc123abc123abc123abc123', expiresAt: '2026-10-08T10:00:00Z', reference: { status: 'pending', sentAt: new Date().toISOString(), expiresAt: '2026-10-08T10:00:00Z' } };
    } else if (b.fn === 'portalReferenceForm') {
      const tk = b.args[0];
      out = tk === 'goodtoken' ? { ok: true, applicantName: 'Anna Example', applyingFor: 'DTS', expiresAt: '2026-10-08T10:00:00Z', form: REF_FORM } : tk === 'usedtoken' ? { ok: false, err: 'used' } : { ok: false, err: 'invalid' };
    } else if (b.fn === 'portalReferenceSubmit') {
      const ans = b.args[1]; const miss = ['leaderName', 'leaderEmail', 'recommend'].filter(k => !ans[k]);
      out = b.args[0] !== 'goodtoken' ? { ok: false, err: 'invalid' } : miss.length ? { ok: false, err: 'missing', missing: miss } : { ok: true, applicantName: 'Anna Example' };
    } else if (b.fn === 'portalUploadDoc') {
      const [, , kind, name, mime, b64, cid] = b.args;
      const doc = { id: 'pd_' + (sent.length), kind, name, mime, size: Math.floor(b64.length * 3 / 4), added: new Date().toISOString(), by: cid ? 'st_dara' : 'st_team' };
      if (cid) { const c = CANDS.find(x => x.id === cid); c.portal.docs = (c.portal.docs || []).concat([doc]); out = { ok: true, doc, docs: c.portal.docs }; }
      else if (b.args[0] === 'team.new') { NEW_TEAM_APP = { ...NEW_TEAM_APP, docs: (NEW_TEAM_APP.docs || []).concat([doc]) }; out = { ok: true, doc, docs: NEW_TEAM_APP.docs, application: NEW_TEAM_APP }; }
      else { TEAM_APP = { ...TEAM_APP, docs: (TEAM_APP.docs || []).concat([doc]) }; out = { ok: true, doc, docs: TEAM_APP.docs, application: TEAM_APP }; }
    } else if (b.fn === 'portalGetDoc') {
      const img = CANDS.flatMap(c => (c.portal && c.portal.docs) || []).find(d => d.id === b.args[2] && /^image\//.test(d.mime));
      out = img ? { ok: true, id: img.id, name: img.name, mime: 'image/png', dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==' }
        : { ok: true, id: b.args[2], name: 'passports.pdf', mime: 'application/pdf', dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK' };
    } else if (b.fn === 'portalDeleteDoc') {
      TEAM_APP = { ...TEAM_APP, docs: (TEAM_APP.docs || []).filter(d => d.id !== b.args[2]) }; out = { ok: true, docs: TEAM_APP.docs, application: TEAM_APP };
    } else if (b.fn === 'portalViewAs') {
      const o = b.args[2] || {};
      if (o.candidateId) { const c = CANDS.find(x => x.id === o.candidateId); out = c ? { ok: true, preview: 'record', role: 'applicant', me: { ...ME_APP, name: c.name, type: c.type, school: c.school }, application: { ...ANNA, id: c.id, name: c.name, type: c.type, school: c.school, stage: c.stage, status: c.status, submittedAt: c.stage === 'new' ? null : '2026-09-20T10:00:00Z', answers: (c.portal && c.portal.form && c.portal.form.answers) || {}, refNeeded: c.type !== 'team', formKey: c.type === 'student' ? c.school : c.type }, form: FORMS[c.type === 'student' ? c.school : c.type], strengths: c.type === 'team' ? { people: STRENGTH_PEOPLE(), results: STRENGTHS } : { people: [{ key: 'me', name: c.name, role: 'me' }], results: {} } } : { ok: false, err: 'not_found' }; }
      else out = { ok: true, preview: 'sample', role: 'applicant', me: { ...ME_APP, name: o.type === 'team' ? 'Sample Team' : 'Sample Applicant', type: o.type, school: o.school, country: o.audience === 'khmer' ? 'Cambodia' : 'Australia' }, application: { ...ANNA, id: 'preview', type: o.type, school: o.school, stage: o.stage, status: o.stage === 'new' ? 'draft' : o.stage === 'applied' ? 'pending' : o.stage, submittedAt: o.stage === 'new' ? null : '2026-09-20T10:00:00Z', audience: o.audience === 'khmer' ? 'khmer' : 'international', needsVisa: o.audience !== 'khmer', refNeeded: !(o.type === 'team' || (o.type === 'student' && o.audience === 'khmer')), formKey: o.type === 'student' ? o.school : o.type, docKinds: o.type === 'team' ? TEAM_DOCS : [], docs: [], members: o.type === 'team' && o.stage !== 'new' ? [{ id: 'msample01', name: 'Sam Sample', sex: 'm' }, { id: 'msample02', name: 'Mia Sample', sex: 'f' }] : [], steps: STEPS(o.stage === 'new' ? 'form' : 'contact') }, form: FORMS[o.type === 'student' ? o.school : o.type], strengths: { people: o.type === 'team' ? [{ key: 'leader', name: 'Sample Team', role: 'leader' }, { key: 'msample01', name: 'Sam Sample', role: 'member', sex: 'm' }, { key: 'msample02', name: 'Mia Sample', role: 'member', sex: 'f' }] : [{ key: 'me', name: 'Sample Applicant', role: 'me' }], results: {} } };
    } else if (b.fn === 'portalAccessList') {
      out = u === 'sina' ? { ok: true, canGrantAdmin: true, staff: ACCESS_STAFF } : { ok: false, err: 'not_authorized' };
    } else if (b.fn === 'portalSetAccess') {
      const row = ACCESS_STAFF.find(x => x.id === b.args[2]); if (row) Object.assign(row, b.args[3]); out = row ? { ok: true } : { ok: false, err: 'not_found' };
    } else if (b.fn === 'portalListAccounts') {
      out = u === 'sina' ? { ok: true, accounts: ACCOUNTS } : { ok: false, err: 'not_authorized' };
    } else if (b.fn === 'portalCreateApplicant') {
      const p = b.args[2];
      if (p.username === 'taken') out = { ok: false, err: 'taken' };
      else { const acc = { id: 'st_' + p.username, username: p.username, name: p.name, email: p.email, phone: p.phone, messenger: p.messenger, country: p.country, campus: p.campus, type: p.type, school: p.school, candidateId: 'cd_' + p.username, stage: 'new', status: 'draft', created: new Date().toISOString() }; ACCOUNTS.unshift(acc); out = { ok: true, account: acc }; }
    } else if (b.fn === 'portalUpdateAccount') {
      const p = b.args[3]; ACCOUNTS = ACCOUNTS.map(a => a.id === b.args[2] ? { ...a, name: p.name, username: p.username, email: p.email, phone: p.phone, messenger: p.messenger, country: p.country } : a);
      out = { ok: true, account: ACCOUNTS.find(a => a.id === b.args[2]) };
    } else if (b.fn === 'portalTeamStep') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, stage: b.args[3] === 'call1' ? 'docs' : x.stage, steps: TEAM_STEPS(b.args[3] === 'call1' ? 'passports' : 'call1') } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalStaffSyncTeam') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, teamTrip: { id: 'ta_' + x.id, from: '2027-01-10', to: '2027-01-20', metrics: {}, reached: {} } } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalStaffSaveTeamNumbers') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, teamTrip: { id: 'ta_' + x.id, metrics: b.args[3], reached: b.args[4] } } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalSaveTeamMembers') {
      TEAM_APP = { ...TEAM_APP, members: b.args[2].map((m, i) => ({ ...m, id: m.id || ('m00000' + i) })) };
      out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'Grace Team', username: 'team.au', country: 'Australia', type: 'team', school: '' }, application: TEAM_APP, form: TEAM_FORM, metricOverrides: [], schedules: TEAM_APP.stage === 'arrived' ? TEAM_SCHED : undefined };
    } else if (b.fn === 'portalSaveTeamNumbers') {
      TEAM_APP = { ...TEAM_APP, trip: { ...TEAM_APP.trip, metrics: b.args[2], reached: b.args[3] } };
      out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'Grace Team', username: 'team.au', country: 'Australia', type: 'team', school: '' }, application: TEAM_APP, form: TEAM_FORM, metricOverrides: [], schedules: TEAM_APP.stage === 'arrived' ? TEAM_SCHED : undefined };
    } else if (b.fn === 'portalSetVisaFlags') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, portal: { ...(x.portal || {}), visa: { ...((x.portal || {}).visa || {}), ...b.args[3] } } } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalStaffSaveAnswers') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, portal: { ...(x.portal || {}), form: { answers: b.args[3] }, submittedAt: '2026-09-20T10:00:00Z' } } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalSaveForm') {
      FORMS[b.args[2]] = { ...b.args[3], key: b.args[2], updated: new Date().toISOString() }; delete FORMS[b.args[2]].isDefault; out = { ok: true, form: FORMS[b.args[2]], forms: FORMS };
    } else if (b.fn === 'portalDeleteApplicant') {
      CANDS = CANDS.filter(x => x.id !== b.args[2]);
      out = { ok: true, role: 'portal-admin', me: STAFF[1], applicants: CANDS, scope: null, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], teamStages: ['new', 'applied', 'call1', 'docs', 'call2', 'practical', 'arrived'], types: [], schools: [], deleted: b.args[2], accountRemoved: true };
    } else if (b.fn === 'hrCandidateNote') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, log: x.log.concat([{ at: new Date().toISOString(), by: 'st_dara', kind: 'note', text: b.args[3] }]) } : x);
      out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    }
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  if (seed) await page.addInitScript(seed);
  await page.goto(URL + (query || ''), { waitUntil: 'load' });
  await page.waitForSelector('#main h1, #main h2', { timeout: 15000 });
  await page.waitForTimeout(300);
  return { ctx, page };
}

/* ---------- the front door and the deep link, on a phone ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '');
  ok('the front door is black with white type, the portal’s name and a logo on top', await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor, ink = getComputedStyle(document.body).color;
    const title = document.querySelector('header .brandTitle'), logo = document.querySelector('#brandLogo');
    return bg === 'rgb(0, 0, 0)' && ink === 'rgb(255, 255, 255)' && title && /YWAM GP Portal/.test(title.textContent) && logo && logo.getBoundingClientRect().height >= 60 && document.body.classList.contains('gate');
  }));
  ok('it opens on one thing to do — sign in — with a way to start an application', !!(await page.$('#loginBtn')) && !!(await page.$('#toChoose')) && !(await page.$('[data-apply]')));
  ok('the sign-in card is centred and narrow, not a stretched phone screen', await page.$eval('.center', e => { const r = e.getBoundingClientRect(); return r.width <= 440 && Math.abs((r.left + r.width / 2) - window.innerWidth / 2) < 4; }));
  ok('nothing on the gate wears the GP app’s cobalt or paper', await page.evaluate(() => ![...document.querySelectorAll('#main *, header *')].some(el => { const s = getComputedStyle(el); return /rgb\(31, 68, 255\)|rgb\(250, 246, 240\)/.test(s.backgroundColor + s.color + s.borderColor); })));
  await page.click('#toChoose');
  await page.waitForTimeout(150);
  ok('while only Siem Reap is open there is no campus picker — Poipet is hidden for now', (await page.$$eval('[data-campus]', b => b.length)) === 0 && !/Where/.test(await page.$eval('#main', e => e.textContent)));
  ok('Siem Reap shows the seven choices — the four schools, staff, volunteer and team', (await page.$$eval('[data-apply]', b => b.map(x => x.getAttribute('data-apply')).join(','))) === 'dts,dbs,bcs,sms,staff,volunteer,team');
  ok('the secondary schools say they need a completed DTS, DTS does not', (await page.$$eval('[data-apply]', b => b.filter(x => /Requires a completed DTS/.test(x.textContent)).map(x => x.getAttribute('data-apply')).join(','))) === 'dbs,bcs,sms');
  ok('the schools carry their full names', /Biblical Counseling School/.test(await page.$eval('[data-apply="bcs"]', e => e.textContent)) && /Social Media School/.test(await page.$eval('[data-apply="sms"]', e => e.textContent)));
  await page.click('[data-apply="dbs"]');
  await page.waitForTimeout(150);
  ok('picking DBS opens sign-up with DBS set and no campus picker, all four schools on offer', (await page.$$eval('[data-campus]', b => b.length)) === 0 && await page.$eval('[data-pick="dbs"]', b => b.classList.contains('on')) && !!(await page.$('[data-pick="bcs"]')));
  ok('no horizontal scroll on a phone', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await page.click('[data-pick="volunteer"]');
  await page.waitForTimeout(150);
  ok('the sign-up form is where you landed, and the pick can still change there', /Create your account/.test(await page.$eval('#main', e => e.textContent)) && (await page.$eval('[data-pick="volunteer"]', b => b.classList.contains('on'))));
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '?apply=dts&lang=en');
  ok('?apply=dts lands straight on sign-up with DTS picked', await page.$eval('[data-pick="dts"]', b => b.classList.contains('on')));
  ok('the messenger question is a required choice, WhatsApp or Telegram', (await page.$$eval('[data-msgr]', b => b.map(x => x.textContent).join(','))) === 'WhatsApp,Telegram');
  await page.click('#regBtn');
  ok('an empty form is stopped with a message, no request sent', /full name/i.test(await page.$eval('#msg', e => e.textContent)) && !sent.some(b => b.fn === 'portalRegister'));
  await page.fill('#r_name', 'Anna Example'); await page.fill('#r_email', 'anna@example.org'); await page.fill('#r_phone', '+46 70 000 0000');
  await page.click('[data-msgr="whatsapp"]');
  await page.waitForTimeout(100);
  await page.fill('[data-countryq="r_country"]', 'swed'); await page.waitForTimeout(100);
  ok('typing in the country box finds the country and picks it', (await page.$eval('#r_country', e => e.value)) === 'Sweden' && (await page.$$eval('#r_country option', os => os.filter(o => !o.hidden && o.value).length)) === 1);
  ok('no username or PIN to invent — a password, and the email is the sign-in', !(await page.$('#r_user')) && !(await page.$('#r_pin')) && !!(await page.$('#r_pw')) && /sign in with your email and this password/.test(await page.$eval('#main', e => e.textContent)));
  await page.fill('#r_pw', 'secret1'); await page.fill('#r_pw2', 'secret1');
  await page.click('#regBtn');
  ok('a short password is stopped', /at least 8/.test(await page.$eval('#msg', e => e.textContent)) && !sent.some(b => b.fn === 'portalRegister'));
  await page.fill('#r_pw', 'secret123'); await page.fill('#r_pw2', 'secret124');
  await page.click('#regBtn');
  ok('mismatched passwords are stopped', /match/.test(await page.$eval('#msg', e => e.textContent)) && !sent.some(b => b.fn === 'portalRegister'));
  await page.fill('#r_pw2', 'secret123');
  await page.click('#regBtn');
  // straight into the application — the sign-up mock answers without a form, as the server did before, so the page fetches it
  await page.waitForSelector('#formSubmit, #formNext', { timeout: 10000 });
  const reg = sent.find(b => b.fn === 'portalRegister');
  ok('sign-up sends the email and password, no username or PIN', reg && reg.args[0].email === 'anna@example.org' && reg.args[0].password === 'secret123' && !reg.args[0].username && !reg.args[0].pin && !reg.args[0].googleToken, JSON.stringify(reg && reg.args[0]));
  ok('… and the page signs in as the email from then on', await page.evaluate(() => JSON.parse(localStorage.getItem('gp-portal')).user === 'anna@example.org'));
  ok('sign-up sends what the server needs — campus, type, school, phone, messenger', reg && reg.args[0].campus === 'siemreap' && reg.args[0].type === 'student' && reg.args[0].school === 'dts' && reg.args[0].messenger === 'whatsapp' && reg.args[0].phone === '+46 70 000 0000' && reg.args[0].teamName === undefined);
  ok('and opens the application straight away (fetching the form when the sign-up reply had none)', /Section 1 of/.test(await page.$eval('#main', e => e.textContent)) && !/Something went wrong/.test(await page.$eval('#main', e => e.textContent)) && sent.some(b => b.fn === 'portalBoot'));
  await page.click('#formClose');
  await page.waitForSelector('#statusPill');
  ok('closing it lands on the dashboard: draft, applying for DTS', /Not submitted yet/.test(await page.$eval('#statusPill', e => e.textContent)) && /DTS/.test(await page.$eval('#main', e => e.textContent)));
  ok('the session is remembered under the portal’s own key, not the staff app’s', await page.evaluate(() => !!localStorage.getItem('gp-portal') && !localStorage.getItem('gp-staff')));
  const steps = await page.$$eval('#timeline .step', s => s.map(x => x.getAttribute('data-step') + ':' + (x.classList.contains('done') ? 'done' : x.classList.contains('current') ? 'current' : 'todo')));
  ok('the timeline has nine steps, account done and "fill out" current', steps.length === 9 && steps[0] === 'account:done' && steps[1] === 'form:current' && steps.slice(2).every(s => /todo$/.test(s)), steps.join(' '));
  ok('documents & reference show as pending sub-items', (await page.$$eval('#timeline .subItems li', li => li.length)) === 2);
  ok('the form card invites them to fill out the application', !!(await page.$('#openForm')) && /Fill out my application/.test(await page.$eval('#openForm', e => e.textContent)));
  ok('and the top of the dashboard says the next step is sending it in', /Next: send in your application/.test(await page.$eval('#applyNext', e => e.textContent)) && !!(await page.$('#openFormTop')));
  ok('an applicant has no staff bar and no link into the GP app', !(await page.$('#staffNav')) && !(await page.$('#toGpApp')));
  await page.click('#openFormTop');
  await page.waitForSelector('#formSubmit, #formNext', { timeout: 5000 });
  ok('the top button opens the application too', /Section 1 of/.test(await page.$eval('#main', e => e.textContent)));
  await page.click('#formClose');
  await page.waitForSelector('#statusPill');
  ok('contact details are on the page', /\+46 70 000 0000/.test(await page.$eval('#main', e => e.textContent)) && /WhatsApp/.test(await page.$eval('#main', e => e.textContent)));
  ok('one column on a phone', await page.$eval('.two', e => getComputedStyle(e).gridTemplateColumns.split(' ').length === 1));
  // edit contact
  await page.click('#editContact');
  await page.fill('#c_phone', '+855 12 345 678');
  await page.click('[data-cmsgr="telegram"]');
  await page.waitForTimeout(100);
  await page.click('#saveContact');
  await page.waitForTimeout(400);
  const upd = sent.find(b => b.fn === 'portalUpdateContact');
  ok('editing contact details calls the applicant’s own handler with the new phone and app', upd && upd.args[2].phone === '+855 12 345 678' && upd.args[2].messenger === 'telegram');
  ok('and the page shows them', /\+855 12 345 678/.test(await page.$eval('#main', e => e.textContent)) && /Telegram/.test(await page.$eval('#main', e => e.textContent)));
  // Khmer
  await page.click('#langBtn');
  await page.waitForTimeout(200);
  const km = await page.$eval('#main', e => e.textContent);
  ok('the language toggle turns the dashboard Khmer', /[ក-៿]/.test(km) && !/Not submitted yet/.test(km), km.slice(0, 60));
  ok('signed in, the header is a slim bar and the page is still black', !(await page.evaluate(() => document.body.classList.contains('gate'))) && await page.$eval('header', h => h.getBoundingClientRect().height < 80) && await page.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'));
  ok('the timeline step names are Khmer too', await page.$$eval('#timeline .stepName', s => s.every(x => /[ក-៿]/.test(x.textContent))));
  await page.click('#langBtn');
  await ctx.close();
}

/* ---------- a moved stage shows on the dashboard; desktop is two columns ---------- */
{
  ANNA = { ...ANNA, stage: 'contacted', status: 'in_review', submittedAt: '2026-09-20T10:00:00Z', steps: STEPS('docs') };
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'anna.b', pin: '2468' })));
  await page.waitForSelector('#statusPill');
  ok('a remembered session opens straight on the dashboard', /In review/.test(await page.$eval('#statusPill', e => e.textContent)));
  ok('after staff moved the stage, "documents & reference" is the current step', (await page.$eval('#timeline .step.current', e => e.getAttribute('data-step'))) === 'docs');
  ok('the form card now reads submitted', /Submitted/.test(await page.$eval('#main', e => e.textContent)));
  const cols = await page.$eval('.two', e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  const [l, r] = await page.$$eval('.two > div', d => d.map(x => x.getBoundingClientRect().left));
  ok('on a desktop the dashboard is two columns side by side', cols === 2 && r > l + 300, cols + ' cols, left ' + Math.round(l) + ' / ' + Math.round(r));
  ok('and stays inside 1100px, centred', await page.$eval('main', m => m.getBoundingClientRect().width <= 1100 && m.getBoundingClientRect().left > 50));
  await ctx.close();
}

/* ---------- the application form, applicant side ---------- */
{
  ANNA = { ...ANNA, stage: 'new', status: 'draft', submittedAt: null, steps: STEPS('form'), answers: {} };
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'anna.b', pin: '2468' })));
  await page.waitForSelector('#openForm');
  ok('the dashboard offers "Fill out my application" — no more "opens soon"', /Fill out my application/.test(await page.$eval('#openForm', e => e.textContent)) && !/Opens soon/.test(await page.$eval('#main', e => e.textContent)));
  ok('an international applicant is told the visa guide comes with acceptance, and has a Leader reference card of its own', /visa for Cambodia/.test(await page.$eval('#main', e => e.textContent)) && /Leader reference/.test(await page.$eval('#refCard h3', e => e.textContent)) && !!(await page.$('#refCard #refNew')));
  await page.click('#refNew');
  await page.waitForSelector('#refLinkBox');
  const rl = sent.find(b => b.fn === 'portalReferenceLink');
  ok('Get my reference link asks the server and shows the link with one-tap WhatsApp / Telegram / email sharing', rl && rl.args.length === 2 && /portal\.html\?ref=abc123abc123abc123abc123abc123$/.test(await page.$eval('#refLinkBox', i => i.value)) && (await page.$$eval('.refBox a.chatBtn', a => a.map(x => x.getAttribute('href')))).some(h => /wa\.me\/\?text=.*ref%3Dabc123/.test(h)) && !!(await page.$('#refCopy')));
  ok('and says how long it is valid, and that it is not shown again', /Valid until/.test(await page.$eval('.refBox', e => e.textContent)) && /not shown again/.test(await page.$eval('.refBox', e => e.textContent)));
  await page.click('#openForm');
  await page.waitForSelector('#formNext');
  ok('the form opens on section 1 of 2 with a progress bar', /Section 1 of 2/.test(await page.$eval('.formProgress', e => e.textContent)) && /About you/.test(await page.$eval('#main h2', e => e.textContent)));
  const qs = await page.$$eval('.qBlock', b => b.map(x => x.getAttribute('data-qid')).join(','));
  ok('it asks the international questions and not the Khmer-only one', qs === 'dob,gender,leaderContact', qs);
  ok('required questions are marked *', (await page.$$eval('.qBlock .req', r => r.length)) === 3);
  await page.click('#formNext');
  await page.waitForTimeout(200);
  ok('Next is blocked while required answers are missing, and they are marked', (await page.$$eval('.qBlock.missing', b => b.length)) === 3 && /marked \*/.test(await page.$eval('#msg', e => e.textContent)) && /Section 1 of 2/.test(await page.$eval('.formProgress', e => e.textContent)));
  await page.fill('#a_dob', '1999-05-05');
  await page.click('input[name="a_gender"][value="Female"]');
  await page.fill('#a_leaderContact', '+46 70 111 2222');
  await page.waitForTimeout(1100);
  const draft = sent.filter(b => b.fn === 'portalSaveDraft').pop();
  ok('answers save as a draft as you type', draft && draft.args[2].dob === '1999-05-05' && draft.args[2].gender === 'Female');
  await page.click('#formNext');
  await page.waitForSelector('#formSubmit');
  ok('section 2 has the paragraph and the checkboxes, and a Submit button', /Section 2 of 2/.test(await page.$eval('.formProgress', e => e.textContent)) && !!(await page.$('textarea[data-ans="testimony"]')) && (await page.$$eval('input[data-multi]', c => c.length)) === 2);
  await page.click('#formBack');
  await page.waitForSelector('#formNext');
  ok('Back keeps the answers', (await page.$eval('#a_dob', e => e.value)) === '1999-05-05' && await page.$eval('input[name="a_gender"][value="Female"]', e => e.checked));
  await page.click('#formNext');
  await page.waitForSelector('#formSubmit');
  await page.fill('textarea[data-ans="testimony"]', 'I met Jesus at a youth camp.');
  await page.click('input[data-multi][value="Music"]');
  await page.click('#formSubmit');
  await page.waitForSelector('#statusPill');
  const sub = sent.find(b => b.fn === 'portalSubmit');
  ok('Submit sends every answer to portalSubmit', sub && sub.args[2].testimony === 'I met Jesus at a youth camp.' && JSON.stringify(sub.args[2].gifts) === '["Music"]' && sub.args[2].leaderContact === '+46 70 111 2222');
  ok('and the dashboard now reads Application pending with the form submitted', /Application pending/.test(await page.$eval('#statusPill', e => e.textContent)) && /Submitted/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('#openForm')));
  await page.waitForSelector('#refCopy', { timeout: 5000 });
  ok('straight after submitting, the reference link is made and the dashboard says: next, send it to your leader', !!(await page.$('#refNext')) && /Send the link to my leader/.test(await page.$eval('#refNext', e => e.textContent)) &&
    sent.some(b => b.fn === 'portalReferenceLink') && !!(await page.$('#refCard #refCopy')) && (await page.$$eval('#refCard .chatBtn', a => a.length)) === 3);
  ok('the timeline’s Leader reference item has the button too', !!(await page.$('#timeline [data-refgo]')));
  await page.click('#refGo'); await page.waitForTimeout(200);
  ok('tapping it closes the banner and keeps the link on the card', !(await page.$('#refNext')) && !!(await page.$('#refCopy')));
  await page.click('#viewAnswers');
  await page.waitForTimeout(150);
  ok('View my answers shows them read-only', /I met Jesus at a youth camp/.test(await page.$eval('#main', e => e.textContent)) && /Music/.test(await page.$eval('#main', e => e.textContent)));
  ok('and offers Edit my answers', !!(await page.$('#editAnswersMine')));
  await page.click('#editAnswersMine');
  await page.waitForSelector('#formSubmit');
  ok('the form reopens in update mode: Save changes on the first section, Cancel, nothing autosaving', /Save changes/.test(await page.$eval('#formSubmit', e => e.textContent)) && /Cancel/.test(await page.$eval('#formClose', e => e.textContent)) && /kept when you press Save changes/.test(await page.$eval('#main', e => e.textContent)) && !!(await page.$('#formNext')));
  ok('prefilled with the submitted answers', (await page.$eval('[data-ans="dob"]', i => i.value)) === '1999-05-05');
  const before = sent.length;
  await page.fill('[data-ans="dob"]', '1999-06-06');
  await page.waitForTimeout(1200);
  ok('typing does not save a draft', !sent.slice(before).some(b => b.fn === 'portalSaveDraft'));
  await page.click('#formSubmit');
  await page.waitForTimeout(400);
  const upd = sent.find(b => b.fn === 'portalUpdateAnswers');
  ok('Save changes sends the whole answer set to portalUpdateAnswers and returns to the dashboard', upd && upd.args[2].dob === '1999-06-06' && upd.args[2].testimony === 'I met Jesus at a youth camp.' && /Application pending/.test(await page.$eval('#statusPill', e => e.textContent)) && /updated/.test(await page.$eval('#main', e => e.textContent)));
  await ctx.close();
}

/* ---------- Khmer student, team: the visa guide and what we need ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'srey.k', pin: '2468' })));
  await page.waitForSelector('#statusPill');
  const txt = await page.$eval('#main', e => e.textContent);
  ok('the Outreach Leader’s Guide is for teams only', !(await page.$('#guideCard')));
  ok('a Khmer student sees no visa card and no leader reference', !/e-visa|visa for Cambodia/.test(txt) && !/Leader reference/.test(txt) && (await page.$$eval('#timeline .subItems li', li => li.length)) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'team.au', pin: '2468' })));
  await page.waitForSelector('#statusPill');
  const txt = await page.$eval('#main', e => e.textContent);
  ok('with passports, photo and flights in, the team gets the e-visa guide, step by step', /Your e-visa, step by step/.test(txt) && /Visa E/.test(txt) && /e-Arrival/.test(txt) && /white sticker/.test(txt));
  ok('a team’s visa card leaves the letter and flights to its own steps', !/Flights confirmed/.test(txt) && !/Letter of invitation sent to you/.test(txt));
  const tl = await page.$$eval('#timeline .step', li => li.map(x => x.getAttribute('data-step') + ':' + x.className.replace('step ', '')));
  ok('the team follows its own steps, on the letter of invitation now', tl.join(',') === 'account:done,form:done,call1:done,passports:done,photo:done,flights:done,invitation:current,evisa:todo,call2:todo,practical:todo,arrived:todo', tl.join(','));
  const cur = await page.$eval('#timeline .step.current', e => e.textContent);
  ok('the step says what it is and who does it', /Letter of invitation & supporting documents/.test(cur) && /Us/.test(cur) && /once your passports, your team’s names and photos, and flights are in/.test(cur), cur);
  ok('the documents and the visa part are headed as groups', (await page.$$eval('#timeline .stepGroup', g => g.map(x => x.textContent).join(','))) === 'Awaiting documents,Visa');
  ok('a team leader has the Outreach Leader’s Guide on their page', /Outreach Leader’s Guide/.test(await page.$eval('#guideCard', e => e.textContent)));
  await page.click('#openGuide'); await page.waitForTimeout(300);
  const guide = await page.$eval('#outreachGuide', e => e.textContent);
  ok('it opens over the page: the whole guide — arrival, travel, budget, tips', await page.$eval('#guideOverlay', e => getComputedStyle(e).position === 'fixed') && /Pre-Arrival & Arrival in Cambodia/.test(guide) && /Travel → Siem Reap/.test(guide) && /Budget/.test(guide) && /Additional Tips/.test(guide) && /Debriefing Time/.test(guide), [await page.$eval('#guideOverlay', e => getComputedStyle(e).position), /Pre-Arrival & Arrival in Cambodia/.test(guide), /Travel → Siem Reap/.test(guide), /Additional Tips/.test(guide), /Debriefing Time/.test(guide)].join());
  ok('the e-visa steps are not in it — they are in the portal — and it says so', !/evisa\.gov\.kh/.test(guide) && !/Click apply now/.test(guide) && /are in your portal, under Visa/.test(guide));
  ok('the tuktuk prices: $14 and $17', /Villages 30–40 min away: \$14\/tuktuk/.test(guide) && /Villages 50–60 min away: \$17\/tuktuk/.test(guide) && !/\$12\/tuktuk|\$15\/tuktuk/.test(guide));
  ok('the accommodation table is there', (await page.$$('#outreachGuide .ogTable tbody tr')).length === 3);
  ok('it can be printed or saved as a PDF', !!(await page.$('#guidePrint')));
  ok('the guide fits a phone', !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)));
  await page.click('#guideClose'); await page.waitForTimeout(200);
  ok('Back closes it', !(await page.$('#guideOverlay')) && !!(await page.$('#guideCard')));
  ok('before they have arrived, the team sees no numbers card', !(await page.$('#teamNumbers')));
  TEAM_APP.stage = 'arrived';
  await page.reload(); await page.waitForSelector('#statusPill');
  ok('the numbers live on their own Metrics tab now, not on the Application tab', !(await page.$('#teamNumbers')));
  await page.click('[data-aview="metrics"]'); await page.waitForSelector('#teamNumbers');
  ok('once arrived, the team’s numbers card shows, with what is saved', /Your team’s numbers/.test(await page.$eval('#teamNumbers', e => e.textContent)) && (await page.$eval('[data-tnum="People Served"]', i => i.value)) === '30' && !(await page.$('[data-tnum="Teams Hosted"]')));
  await page.fill('[data-tnum="Salvations"]', '3');
  await page.fill('[data-treach="female"]', '7');
  await page.click('#saveTeamNums');
  await page.waitForTimeout(400);
  const tn = sent.filter(b => b.fn === 'portalSaveTeamNumbers').pop();
  await page.click('[data-aview="status"]'); await page.waitForSelector('#statusPill');
  ok('saving sends the numbers into the Teams Database', tn && tn.args[2]['People Served'] === 30 && tn.args[2]['Salvations'] === 3 && tn.args[3].female === 7 && tn.args[3].male === 5, JSON.stringify(tn && tn.args.slice(2)));
  ok('once arrived, this week’s schedules show, with the chores not out yet', /This week at the base/.test(await page.$eval('#teamSchedules', e => e.textContent)) && await page.$eval('[data-pschedshow="chores"]', b => b.disabled));
  await page.click('[data-pschedshow="kitchen"]'); await page.waitForTimeout(200);
  ok('tapping the cooking schedule draws it, with a share button', /Member One/.test(await page.$eval('#teamSchedules .dutyGrid', e => e.textContent)) && !!(await page.$('#pschedShare')));
  ok('the schedule scrolls inside its card on a phone', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  TEAM_APP.stage = 'docs';
  await page.reload(); await page.waitForSelector('#statusPill');
  ok('before arrival there are no schedules', !(await page.$('#teamSchedules')));
  ok('the team is asked to list its members', /Add your team members/.test(await page.$eval('#editMembers', e => e.textContent)));
  await page.click('#editMembers'); await page.waitForTimeout(150);
  await page.fill('[data-mname="0"]', 'Member One'); await page.click('[data-msex="0|f"]'); await page.waitForTimeout(100);
  await page.click('#addMember'); await page.waitForTimeout(100);
  await page.fill('[data-mname="1"]', 'Member Two'); await page.click('[data-msex="1|m"]');
  await page.click('#addMember'); await page.waitForTimeout(100);   // left empty: not sent
  await page.click('#saveMembers'); await page.waitForTimeout(400);
  const mem = sent.filter(b => b.fn === 'portalSaveTeamMembers').pop();
  ok('the member list is saved: names with man / woman, empty rows left out', mem && JSON.stringify(mem.args[2].map(m => ({ name: m.name, sex: m.sex }))) === JSON.stringify([{ name: 'Member One', sex: 'f' }, { name: 'Member Two', sex: 'm' }]), JSON.stringify(mem && mem.args[2]));
  await page.waitForSelector('#teamMembers .rosterRow', { timeout: 5000 });
  const roster = await page.$$eval('#teamMembers .rosterRow', rs => rs.map(r => r.querySelector('.rosterName b').textContent + (r.querySelector('.avatar.ph') ? ':none' : ':photo')));
  ok('and reads back as a roster — the leader first, then the members, each with a place for a photo', roster.join('|') === 'Lee Leader:none|Member One:none|Member Two:none' && /0 of 3 have a photo/.test(await page.$eval('#teamMembers', e => e.textContent)), roster.join('|'));
  ok('the hint says these names go on the cooking and chores schedules and the photos are the team photo', /cooking and morning chores schedules/.test(await page.$eval('#teamMembers', e => e.textContent)) && /photos are your team photo/.test(await page.$eval('#teamMembers', e => e.textContent)));
  /* take a photo: a tiny PNG stands in for the camera; the page shrinks it to a square JPEG and sends it for that person */
  const PNG1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64');
  await page.click('#teamMembers [data-tphoto="leader"]');
  await page.setInputFiles('#tphotoInput', { name: 'lee.png', mimeType: 'image/png', buffer: PNG1 });
  await page.waitForTimeout(700);
  const ph = sent.filter(b => b.fn === 'portalSaveTeamPhoto').pop();
  ok('tapping Photo and picking a picture sends a small JPEG for that person', ph && ph.args[2] === 'leader' && typeof ph.args[3] === 'string' && ph.args[3].length > 100 && ph.args[3].length < 160 * 1024 && /^\/9j\//.test(ph.args[3]), ph && ph.args[3].slice(0, 12));
  ok('… and the face shows on the roster, with Retake and 1 of 3', !!(await page.$('#teamMembers [data-rosterkey="leader"] img.avatar')) && /Retake/.test(await page.$eval('#teamMembers [data-rosterkey="leader"]', e => e.textContent)) && /1 of 3 have a photo/.test(await page.$eval('#teamMembers', e => e.textContent)));
  ok('the steps still ahead that are theirs are marked You', /You/.test(await page.$eval('#timeline [data-step="evisa"]', e => e.textContent)));
  ok('the letter of invitation is listed as coming from us, with no upload for them', /Coming from us/.test(await page.$eval('[data-dockind="invitation"]', e => e.textContent)) && !(await page.$('[data-docup="invitation"]')) && !!(await page.$('[data-docup="evisa"]')));
  ok('the team is told passports are needed as soon as possible', /as soon as possible/.test(await page.$eval('[data-dockind="passports"]', e => e.textContent)));
  ok('the team’s names and photos are not a document to the team any more — no row, no upload; they live under Your team members', !(await page.$('[data-docup="photo"]')) && !(await page.$('[data-dockind="photo"]')) && !!(await page.$('#teamMembers .rosterRow')));
  ok('… and the roster card says it once: names for the schedules, photos as the team photo, no second hint', /cooking and morning chores schedules/.test(await page.$eval('#teamMembers', e => e.textContent)) && (await page.$eval('#teamMembers', e => e.textContent)).split('team photo').length === 2);
  ok('the documents card lists what a team sends: passport copies, a team photo and flights needed; with those in, the e-visas — the letter comes from us', /Passport copies/.test(txt) && /team photo/i.test(txt) && /Flight itineraries/.test(txt) && (await page.$$eval('[data-docup]', i => i.map(x => x.getAttribute('data-docup')).join(','))) === 'passports,flights,evisa' && /Needed/.test(await page.$eval('[data-dockind="flights"]', e => e.textContent)) && /Needed/.test(await page.$eval('[data-dockind="passports"]', e => e.textContent)));
  ok('and says flights are needed to start the visa process, and can come once booked', /start your visa process/.test(txt) && /Upload them once you have them/.test(txt));
  await page.setInputFiles('[data-docup="passports"]', [{ name: 'passports.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 fake') }, { name: 'more.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 two') }]);
  await page.waitForFunction(() => document.querySelectorAll('[data-dockind="passports"] .docList li').length === 2, null, { timeout: 5000 });
  const ups = sent.filter(b => b.fn === 'portalUploadDoc');
  ok('choosing two files uploads both, one call each, as passports, and lists them', ups.length === 2 && ups.every(u => u.args[2] === 'passports' && u.args[4] === 'application/pdf' && u.args.length === 6) && ups[0].args[3] === 'passports.pdf' && Buffer.from(ups[0].args[5], 'base64').toString() === '%PDF-1.4 fake' && /2 files/.test(await page.$eval('[data-dockind="passports"]', e => e.textContent)));
  await page.click('[data-dockind="passports"] [data-docopen]');
  await page.waitForTimeout(300);
  ok('Open fetches that file', sent.some(b => b.fn === 'portalGetDoc'));
  page.once('dialog', d => d.accept());
  await page.click('[data-dockind="passports"] [data-docdel]');
  await page.waitForFunction(() => document.querySelectorAll('[data-dockind="passports"] .docList li').length === 1, null, { timeout: 5000 });
  ok('Remove asks, then takes it off the list', sent.some(b => b.fn === 'portalDeleteDoc'));
  ok('a team is told dates and head counts can be estimates, with Edit my answers', /can be estimates/.test(txt) && !!(await page.$('#editAnswersMine')));
  ok('a team has no leader reference step', !/Leader reference/.test(txt));
  await ctx.close();
}

/* ---------- Outreach Teams: teams only ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'rithy', pin: '1234' })));
  await page.waitForSelector('.trow');
  ok('with every applicant at Siem Reap and Poipet hidden, there is no campus chip row', (await page.$$eval('[data-campusfilter]', b => b.length)) === 0);
  await page.waitForSelector('.trow');
  ok('someone on Outreach Teams sees only team applications', (await page.$$eval('.trow', r => r.length)) === 1 && /Grace Church Team/.test(await page.$eval('.tbl', e => e.textContent)) && !/Anna Example|Tom Volunteer/.test(await page.$eval('#main', e => e.textContent)));
  ok('and only the Teams tab — no All, no schools', (await page.$$eval('.whatTab', b => b.map(x => x.getAttribute('data-whatfilter')).join(','))) === 'team' && await page.$eval('[data-whatfilter="team"]', b => b.classList.contains('on')));
  await ctx.close();
}

/* ---------- the staff side ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '');
  ok('sign-in opens on email and password, no Google button while Google is off, and a way to the username-and-PIN door', !!(await page.$('#l_email')) && !!(await page.$('#l_pw')) && !(await page.$('#gsiBtn')) && !(await page.$('#l_user')) && /Staff, or a username and PIN/.test(await page.$eval('#toPinLogin', e => e.textContent)));
  await page.fill('#l_email', 'anna@example.org'); await page.fill('#l_pw', 'wrong'); await page.click('#loginBtn');
  await page.waitForTimeout(400);
  ok('a wrong password stays on sign-in with a message', /Wrong email or password/.test(await page.$eval('#msg', e => e.textContent)) && !!(await page.$('#loginBtn')));
  await page.fill('#l_pw', 'secret123'); await page.keyboard.press('Enter');
  await page.waitForSelector('#statusPill');
  ok('an applicant signs in with her email and password and lands on her dashboard, which says how she signs in', /Email and password/.test(await page.$eval('#main', e => e.textContent)) && !!(await page.$('#changePw')));
  await page.click('#outBtn'); await page.waitForTimeout(150);
  await page.click('#toPinLogin'); await page.waitForTimeout(100);
  ok('the username-and-PIN door is for staff and older accounts', !!(await page.$('#l_user')) && /YWAM staff sign in with their My GP username and PIN/.test(await page.$eval('#main', e => e.textContent)));
  await page.fill('#l_user', 'bopha'); await page.fill('#l_pin', '1234'); await page.click('#pinLoginBtn');
  await page.waitForTimeout(400);
  ok('a staff member without portal access is told so and sees no applicants', /No portal access/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('.trow')));
  await page.click('#outBtn2');
  await page.waitForTimeout(150);
  if (!(await page.$('#l_user'))) { await page.click('#toPinLogin'); await page.waitForTimeout(100); }
  await page.fill('#l_user', 'anna.b'); await page.fill('#l_pin', '0000'); await page.click('#pinLoginBtn');
  await page.waitForTimeout(400);
  ok('a wrong PIN stays on sign-in with a message', /Wrong username or PIN/.test(await page.$eval('#msg', e => e.textContent)) && !!(await page.$('#pinLoginBtn')));
  await page.fill('#l_pin', '1234'); await page.fill('#l_user', 'dara'); await page.click('#pinLoginBtn');
  await page.waitForSelector('.trow');
  ok('portal staff land on Applications with every open applicant of their campus', /Applications/.test(await page.$eval('#main h1', e => e.textContent)) && (await page.$$eval('.trow', r => r.length)) === 3 && !/Poipet Person/.test(await page.$eval('.tbl', e => e.textContent)));
  ok('a tab row toggles through All, DTS, DBS, BCS, SMS, Staff, Volunteer, Teams — with counts', (await page.$$eval('.whatTab', b => b.map(x => x.getAttribute('data-whatfilter')).join(','))) === ',dts,dbs,bcs,sms,staff,volunteer,team' && /Teams\s*1/.test(await page.$eval('[data-whatfilter="team"]', e => e.textContent)) && /DTS\s*1/.test(await page.$eval('[data-whatfilter="dts"]', e => e.textContent)));
  await page.click('[data-whatfilter="dts"]');
  await page.waitForTimeout(150);
  ok('DTS shows only the DTS applicants', (await page.$$eval('.trow', r => r.length)) === 1 && /Anna Example/.test(await page.$eval('.tbl', e => e.textContent)));
  await page.click('[data-whatfilter="team"]');
  await page.waitForTimeout(150);
  ok('Teams shows only the teams', (await page.$$eval('.trow', r => r.length)) === 1 && /Grace Church Team/.test(await page.$eval('.tbl', e => e.textContent)));
  await page.click('[data-whatfilter=""]');
  await page.waitForTimeout(150);
  await page.click('[data-campusfilter=""]');
  await page.waitForTimeout(150);
  ok('All campuses adds Poipet’s applicant, marked with its campus', (await page.$$eval('.trow', r => r.length)) === 4 && /Poipet Person/.test(await page.$eval('.tbl', e => e.textContent)));
  await page.click('[data-campusfilter="siemreap"]');
  await page.waitForTimeout(150);
  ok('the list opens on the staff member’s own campus, with an All-campuses chip', (await page.$eval('[data-campusfilter].on', c => c.getAttribute('data-campusfilter'))) === 'siemreap' && !!(await page.$('[data-campusfilter=""]')));
  ok('closed applications are behind the Archived filter', !/Closed Case/.test(await page.$eval('.tbl', e => e.textContent)));
  ok('a Khmer / International split sits under the tabs', (await page.$$eval('[data-audfilter]', b => b.map(x => x.getAttribute('data-audfilter')).join(','))) === ',khmer,international');
  await page.click('[data-audfilter="khmer"]');
  await page.waitForTimeout(150);
  ok('Khmer shows nobody here — every fixture is international', (await page.$$eval('.trow', r => r.length)) === 0);
  await page.click('[data-audfilter=""]');
  await page.waitForTimeout(150);
  await page.click('[data-filter="archived"]');
  await page.waitForTimeout(150);
  ok('and appear there', /Closed Case/.test(await page.$eval('.tbl', e => e.textContent)) && (await page.$$eval('.trow', r => r.length)) === 1);
  await page.click('[data-filter=""]');
  await page.waitForTimeout(150);
  await page.fill('#q', 'tom');
  await page.waitForTimeout(150);
  ok('search narrows the list without losing the box', (await page.$$eval('.trow', r => r.length)) === 1 && await page.evaluate(() => document.activeElement && document.activeElement.id === 'q'));
  await page.fill('#q', '');
  await page.waitForTimeout(150);
  await page.click('[data-open="cd_tom"]');
  await page.waitForSelector('#panel');
  const panel = await page.$eval('#panel', e => e.textContent);
  ok('opening a row shows the record: contact, stage, owner, next step, notes', /Tom Volunteer/.test(panel) && /\+1 555 000 1111/.test(panel) && (await page.$eval('#p_stage', s => s.value)) === 'contacted' && (await page.$eval('#p_owner', s => s.value)) === 'st_dara' && (await page.$eval('#p_next', i => i.value)) === 'Video call');
  const chat = await page.$eval('#panel [data-chat]', a => a.getAttribute('href'));
  ok('the one-tap chat link opens Telegram on the applicant’s number', chat === 'https://t.me/+15550001111', chat);
  ok('and a WhatsApp applicant gets a wa.me link', await page.$eval('[data-open="cd_anna"] [data-chat], .tbl', () => true) && (await page.evaluate(() => chatHref_('whatsapp', '+46 70 000 0000'))) === 'https://wa.me/46700000000');
  ok('the stage picker offers the new "getting ready" stage', (await page.$$eval('#p_stage option', o => o.map(x => x.value))).includes('practical'));
  await page.selectOption('#p_stage', 'interview');
  await page.selectOption('#p_owner', 'st_sina');
  await page.click('#saveCand');
  await page.waitForTimeout(400);
  const save = sent.filter(b => b.fn === 'hrSaveCandidate').pop();
  ok('Save goes through the CRM’s own handler with the whole record and the new stage and owner', save && save.args[2].id === 'cd_tom' && save.args[2].stage === 'interview' && save.args[2].assignedTo === 'st_sina' && save.args[2].phone === '+1 555 000 1111');
  await page.waitForSelector('#panel');
  await page.fill('#p_note', 'Spoke today, very keen');
  await page.click('#addNote');
  await page.waitForTimeout(300);
  const note = sent.filter(b => b.fn === 'hrCandidateNote').pop();
  ok('a note goes through hrCandidateNote and shows in the log', note && note.args[3] === 'Spoke today, very keen' && /Spoke today, very keen/.test(await page.$eval('#panel .log', e => e.textContent)));
  ok('no PIN or hash anywhere on the page', !/2468|1234|pinHash/.test(await page.$eval('#main', e => e.textContent)));
  ok('portal staff are offered no delete', !(await page.$('#deleteCand')));
  await page.click('#navMenu'); await page.waitForSelector('#staffMenu');
  ok('portal staff open the ☰ menu and get Staff access only — no Forms, no Admin access group', !(await page.$('#toForms')) && !!(await page.$('#toPreview')) && /Staff access/.test(await page.$eval('#staffMenu', e => e.textContent)) && !/Admin access/.test(await page.$eval('#staffMenu', e => e.textContent)));
  ok('but do get the GP app home link', !!(await page.$('#toGpApp')));
  ok('nor an Accounts button', !(await page.$('#toAccounts')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  await page.click('[data-open="cd_anna"]');
  await page.waitForSelector('#panel');
  const pan = await page.$eval('#panel', e => e.textContent);
  ok('the record panel shows the submitted answers under their questions', /Answers/.test(pan) && /Date of birth/.test(pan) && /1999-05-05/.test(pan) && /Long story/.test(pan) && /Music/.test(pan));
  ok('and the visa ticks for an international applicant', (await page.$$eval('[data-visaflag]', c => c.map(x => x.getAttribute('data-visaflag')).join(','))) === 'flightsConfirmed,invitationSent');
  ok('and a Leader reference block with "No link made yet" and a button to make one', /Leader reference/.test(pan) && /No link made yet/.test(pan) && !!(await page.$('#refLinkStaff')));
  await page.click('#refLinkStaff');
  await page.waitForSelector('#refLinkBox');
  const srl = sent.filter(b => b.fn === 'portalReferenceLink').pop();
  ok('staff make a link from the record, for that record', srl && srl.args[2] === 'cd_anna' && /ref=abc123/.test(await page.$eval('#refLinkBox', i => i.value)));
  await page.click('#closePanel');
  await page.waitForTimeout(150);
  await page.click('[data-open="cd_tom"]');
  await page.waitForSelector('#panel');
  ok('a received reference shows who sent it, with Read it', /Received from Pastor Example/.test(await page.$eval('#panel', e => e.textContent)) && !!(await page.$('#showRef')) && !(await page.$('#refLinkStaff')));
  await page.click('#showRef');
  await page.waitForTimeout(150);
  ok('Read it shows the leader’s answers under the reference form’s questions', /Would you:/.test(await page.$eval('#panel', e => e.textContent)) && /Highly recommend/.test(await page.$eval('#panel', e => e.textContent)));
  await page.click('#closePanel');
  await page.waitForTimeout(150);
  await page.click('[data-open="cd_anna"]');
  await page.waitForSelector('#panel');
  await page.check('[data-visaflag="flightsConfirmed"]');
  await page.waitForTimeout(300);
  const vf = sent.filter(b => b.fn === 'portalSetVisaFlags').pop();
  ok('ticking flights confirmed goes through portalSetVisaFlags', vf && vf.args[2] === 'cd_anna' && vf.args[3].flightsConfirmed === true);
  await page.click('#editAnswers');
  await page.waitForSelector('#saveAnswers');
  await page.fill('#s_leaderContact', '+46 70 999 0000');
  await page.click('#saveAnswers');
  await page.waitForTimeout(300);
  const sa = sent.filter(b => b.fn === 'portalStaffSaveAnswers').pop();
  ok('staff correct an answer through portalStaffSaveAnswers', sa && sa.args[2] === 'cd_anna' && sa.args[3].leaderContact === '+46 70 999 0000' && sa.args[3].testimony === 'Long story');
  await ctx.close();
}

/* ---------- the forms editor, portal admins ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('.trow');
  await page.click('#navMenu'); await page.waitForSelector('#staffMenu');
  ok('a portal admin finds Forms under Admin access in the ☰ menu, apart from Staff access', !!(await page.$('#toForms')) && /Staff access/.test(await page.$eval('#staffMenu', e => e.textContent)) && /Admin access/.test(await page.$eval('#staffMenu', e => e.textContent)) && (await page.$$eval('#staffMenu .menuGroup', g => g.map(x => [...x.querySelectorAll('button')].map(b => b.id).join(',')).join('|'))) === 'toPreview,toLink|toForms,toAccounts,toTeam,toResources,toAccess');
  if(!(await page.$('#toForms'))){ await page.click('#navMenu'); await page.waitForSelector('#toForms'); }
  await page.click('#toForms');
  await page.waitForSelector('#formSave');
  ok('the editor opens on DTS with a tab per form and the shipped-default note', await page.$eval('[data-formkey="dts"]', b => b.classList.contains('on')) && (await page.$$eval('[data-formkey]', b => b.length)) === 8 && /shipped default/.test(await page.$eval('#main', e => e.textContent)));
  ok('each question is a card with English and Khmer, a type, an audience and Required', (await page.$$eval('.qcard', c => c.length)) === 6 && (await page.$eval('[data-fe="sections.0.questions.0.label.en"]', i => i.value)) === 'Date of birth' && (await page.$eval('[data-fe="sections.0.questions.0.label.km"]', i => i.value)) === 'ថ្ងៃខែឆ្នាំកំណើត' && (await page.$eval('[data-fe="sections.0.questions.2.audience"]', s => s.value)) === 'international');
  ok('multiple-choice options are one per line, English | Khmer', /Male \| ប្រុស/.test(await page.$eval('[data-fe="sections.0.questions.1.options"]', t => t.value)));
  ok('a school form has an Everyone / Khmer students / International students switch', (await page.$$eval('[data-feaud]', b => b.map(x => x.getAttribute('data-feaud')).join(','))) === 'all,khmer,international');
  await page.click('[data-feaud="khmer"]');
  await page.waitForTimeout(150);
  ok('Khmer students shows the shared questions plus the Khmer-only one, not the international one', (await page.$$eval('.qcard', c => c.length)) === 5 && !!(await page.$('[data-fe="sections.0.questions.3.label.en"]')) && !(await page.$('[data-fe="sections.0.questions.2.label.en"]')));
  ok('the Khmer-only question is tagged', /Khmer students only/.test(await page.$eval('.qcard.aud-khmer .audTag', e => e.textContent)));
  await page.click('[data-qadd="1"]');
  await page.waitForTimeout(150);
  ok('a question added while on Khmer students is Khmer only', (await page.$eval('[data-fe="sections.1.questions.2.audience"]', s => s.value)) === 'khmer');
  await page.click('[data-qdel="1|2"]');
  await page.waitForTimeout(150);
  await page.click('[data-feaud="international"]');
  await page.waitForTimeout(150);
  ok('International students shows the international-only one instead', !!(await page.$('[data-fe="sections.0.questions.2.label.en"]')) && !(await page.$('[data-fe="sections.0.questions.3.label.en"]')));
  await page.click('[data-feaud="all"]');
  await page.waitForTimeout(150);
  await page.fill('[data-fe="sections.0.questions.0.label.en"]', 'Your date of birth');
  await page.click('[data-qadd="1"]');
  await page.waitForTimeout(200);
  ok('Add question adds a card to that section', (await page.$$eval('[data-sec="1"] .qcard', c => c.length)) === 3);
  await page.fill('[data-fe="sections.1.questions.2.label.en"]', 'Anything else you want to tell us?');
  await page.selectOption('[data-fe="sections.1.questions.2.type"]', 'long');
  await page.waitForTimeout(150);
  await page.click('[data-qdel="0|3"]');
  await page.waitForTimeout(150);
  ok('Delete question removes it', (await page.$$eval('[data-sec="0"] .qcard', c => c.length)) === 3);
  await page.click('#formSave');
  await page.waitForTimeout(400);
  const fs_ = sent.filter(b => b.fn === 'portalSaveForm').pop();
  ok('Save sends the whole form to portalSaveForm — relabel, the new paragraph question, the deleted one gone', fs_ && fs_.args[2] === 'dts' && fs_.args[3].sections[0].questions[0].label.en === 'Your date of birth' && fs_.args[3].sections[1].questions[2].label.en === 'Anything else you want to tell us?' && fs_.args[3].sections[1].questions[2].type === 'long' && !fs_.args[3].sections[0].questions.some(q => q.id === 'english'));
  ok('and the note now says when it was saved', /Last saved/.test(await page.$eval('#main', e => e.textContent)));
  await ctx.close();
}

/* ---------- a portal admin can delete an account ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('.trow');
  await page.click('[data-open="cd_team"]');
  await page.waitForSelector('#panel');
  ok('a portal admin sees "Delete this account and application"', /Delete this account and application/.test(await page.$eval('#deleteCand', e => e.textContent)));
  page.once('dialog', d => d.accept('wrong name'));
  await page.click('#deleteCand');
  await page.waitForTimeout(300);
  ok('typing the wrong name deletes nothing', !sent.some(b => b.fn === 'portalDeleteApplicant') && /did not match/.test(await page.$eval('#msg', e => e.textContent)));
  page.once('dialog', d => d.accept('Grace Church Team'));
  await page.click('#deleteCand');
  await page.waitForTimeout(400);
  const del = sent.find(b => b.fn === 'portalDeleteApplicant');
  ok('typing the name deletes through portalDeleteApplicant', del && del.args[2] === 'cd_team');
  ok('and the row is gone from the list', !/Grace Church Team/.test(await page.$eval('.tbl', e => e.textContent)) && !(await page.$('#panel')));
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('.trow');
  ok('on a desktop the list has column headings', await page.$eval('.thead', e => getComputedStyle(e).display !== 'none'));
  await page.click('[data-open="cd_anna"]');
  await page.waitForSelector('#panel');
  const [listL, panelL] = await page.evaluate(() => [document.querySelector('.tbl').getBoundingClientRect().left, document.querySelector('#panel').getBoundingClientRect().left]);
  ok('and the record opens beside the list, not under it', panelL > listL + 400, Math.round(listL) + ' / ' + Math.round(panelL));
  await ctx.close();
}

/* ---------- the leader's reference page, no account ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '?ref=goodtoken');
  await page.waitForSelector('#refSubmit');
  const txt = await page.$eval('#main', e => e.textContent);
  ok('?ref= opens the reference form for the applicant, no sign-in, with the intro and the questions', /Leader reference/.test(txt) && /For Anna Example, applying for DTS/.test(txt) && /considered seriously/.test(txt) && /Your full name/.test(txt) && /Would you:/.test(txt) && !(await page.$('#loginBtn')));
  ok('the leader is told the applicant does not see it', /the applicant does not/.test(txt));
  ok('the reference page is a gate screen (logo and title on top)', await page.$eval('body', b => b.classList.contains('gate')));
  await page.click('#refSubmit');
  await page.waitForTimeout(200);
  ok('Submit with required answers missing marks them and sends nothing', (await page.$$eval('.qBlock.missing', q => q.length)) === 3 && !sent.some(b => b.fn === 'portalReferenceSubmit'));
  await page.fill('#r_leaderName', 'Pastor Example');
  await page.fill('#r_leaderEmail', 'pastor@example.org');
  await page.click('[data-ans="recommend"][value="Highly recommend"]');
  await page.click('#refSubmit');
  await page.waitForTimeout(400);
  const rs = sent.find(b => b.fn === 'portalReferenceSubmit');
  ok('a complete reference goes to portalReferenceSubmit with the token, then a thank-you', rs && rs.args[0] === 'goodtoken' && rs.args[1].recommend === 'Highly recommend' && rs.args[1].leaderName === 'Pastor Example' && /Thank you/.test(await page.$eval('#main', e => e.textContent)) && /reached our applications team/.test(await page.$eval('#main', e => e.textContent)));
  await page.goto(URL + '?ref=usedtoken', { waitUntil: 'load' });
  await page.waitForSelector('#main h2');
  await page.waitForTimeout(300);
  ok('a used link says the reference is already in', /already been submitted/.test(await page.$eval('#main', e => e.textContent)));
  await page.goto(URL + '?ref=nonsense', { waitUntil: 'load' });
  await page.waitForSelector('#main h2');
  await page.waitForTimeout(300);
  ok('an unknown link says so and offers the way back', /not valid/.test(await page.$eval('#main', e => e.textContent)) && !!(await page.$('#toLanding')));
  await ctx.close();
}

/* ---------- Google sign-in is offered when the server has a client id ---------- */
{
  GOOGLE_ON = 'test-client.apps.googleusercontent.com';
  const { ctx, page } = await open({ width: 390, height: 844 }, '');
  await page.waitForSelector('#gsiBtn', { timeout: 5000 });
  ok('with Google on, the sign-in has our own black Continue with Google button above “or” and the email form', /Continue with Google/.test(await page.$eval('#googleBtn', e => e.textContent)) && (await page.$$('#gsiBtn iframe')).length === 0 && /\bor\b/.test(await page.$eval('.orRow', e => e.textContent)) && !!(await page.$('#l_email')));
  await page.click('#googleBtn'); await page.waitForTimeout(600);
  ok('when Google’s script cannot load, tapping it says so and leaves the email way in', /could not load/.test(await page.$eval('#msg', e => e.textContent)) && !!(await page.$('#loginBtn')) && !(await page.$eval('#googleBtn', b => b.disabled)));
  await page.click('#toChoose'); await page.waitForTimeout(100); await page.click('[data-apply="dts"]'); await page.waitForTimeout(150);
  ok('sign-up has Continue with Google at the very top, then the details, then a password', !!(await page.$('#r_pw')) && !!(await page.$('#gsiBtn')) && /or fill in your details below/.test(await page.$eval('.orRow', e => e.textContent)) && await page.evaluate(() => document.querySelector('#gsiBtn').getBoundingClientRect().top < document.querySelector('#r_name').getBoundingClientRect().top));
  /* straight from Google with no account: sign-up opens with the email filled in and no password to make */
  await page.evaluate(() => { P.gtoken = 'g.token'; P.reg.email = 'gus@example.org'; P.reg.name = 'Gus Google'; render(); });
  await page.waitForTimeout(100);
  ok('coming from Google, the email is filled in and read-only, the name filled in, and there is no password box', (await page.$eval('#r_email', e => e.value + (e.readOnly ? '*' : ''))) === 'gus@example.org*' && (await page.$eval('#r_name', e => e.value)) === 'Gus Google' && !(await page.$('#r_pw')) && /Signing up with Google/.test(await page.$eval('#main', e => e.textContent)));
  await page.fill('#r_phone', '+1 555 0100'); await page.click('[data-msgr="whatsapp"]'); await page.waitForTimeout(100); await page.selectOption('#r_country', 'United States');
  await page.click('#regBtn');
  await page.waitForSelector('#formSubmit, #formNext, #statusPill', { timeout: 10000 });
  const greg = sent.filter(b => b.fn === 'portalRegister').pop();
  ok('sign-up sends the Google token instead of a password, and the page keeps the device token as its sign-in', greg && greg.args[0].googleToken === 'g.token' && !greg.args[0].password &&
    await page.evaluate(() => { const a = JSON.parse(localStorage.getItem('gp-portal')); return a.user === 'gus@example.org' && a.pin === 'a'.repeat(48); }));
  GOOGLE_ON = '';
  await ctx.close();
}

/* ---------- a team signs up: its sending church first ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '?apply=team&lang=en');
  ok('team sign-up asks for the sending church, base or organization, and the leader’s own name', /Sending church, base or organization/.test(await page.$eval('#main', e => e.textContent)) && !!(await page.$('#r_team')) && /team leader/.test(await page.$eval('#main', e => e.textContent)));
  await page.fill('#r_name', 'Pat Leader'); await page.fill('#r_email', 'pat@example.org'); await page.fill('#r_phone', '+61 400 000 001');
  await page.click('[data-msgr="telegram"]'); await page.waitForTimeout(100);
  await page.selectOption('#r_country', 'Australia');
  await page.fill('#r_pw', 'secret123'); await page.fill('#r_pw2', 'secret123');
  const regsBefore = sent.filter(b => b.fn === 'portalRegister').length;
  await page.click('#regBtn');
  ok('a team without its church named is stopped', /sending church/i.test(await page.$eval('#msg', e => e.textContent)) && sent.filter(b => b.fn === 'portalRegister').length === regsBefore, await page.$eval('#msg', e => e.textContent));
  await page.fill('#r_team', 'Example Church');
  await page.click('#regBtn');
  await page.waitForSelector('#formSubmit, #formNext', { timeout: 10000 });
  const reg = sent.filter(b => b.fn === 'portalRegister').pop();
  ok('sign-up sends the team name, and opens the application straight away with it filled in', reg && reg.args[0].teamName === 'Example Church' && reg.args[0].name === 'Pat Leader' && /Section 1 of/.test(await page.$eval('#main', e => e.textContent)) && await page.$eval('#a_teamName', i => i.value) === 'Example Church', JSON.stringify(reg && reg.args[0]));
  await ctx.close();
}

/* ---------- the portal as a tool: four tabs for an applicant ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'team.au', pin: '2468' })));
  await page.waitForSelector('#applicantNav');
  const tabs = await page.$$eval('#applicantNav [data-aview]', bs => bs.map(b => b.getAttribute('data-aview') + (b.classList.contains('on') ? '*' : '')));
  ok('a team has five tabs on top: Application (open), Our team, Strengths, Metrics, Resources — icons over short labels, none squashed', tabs.join() === 'status*,team,strengths,metrics,resources' && await page.$$eval('#applicantNav .aLabel', ls => ls.every(l => l.scrollWidth <= l.clientWidth + 1)), tabs.join());
  await page.click('[data-aview="metrics"]'); await page.waitForTimeout(200);
  ok('Team metrics has its own tab; before arrival it says the numbers open on arrival', /Team metrics/.test(await page.$eval('#main h2', e => e.textContent)) && /open on arrival/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('#teamNumbers')));
  /* 👥 */
  await page.click('[data-aview="team"]'); await page.waitForSelector('.meetGrid', { timeout: 5000 });
  ok('Meet our team: "YWAM Siem Reap Campus Staff" (YWAM once), one list, each with name and role', /^YWAM Siem Reap Campus Staff$/.test((await page.$eval('#main h2', e => e.textContent)).trim()) && (await page.$$eval('.meetCard .meetName', ns => ns.map(n => n.textContent))).join() === 'Dara Pen,Yan Yap' && /Host · Hospitality/.test(await page.$eval('.meetCard', e => e.textContent)));
  await page.waitForFunction(() => !!document.querySelector('.meetCard img'), null, { timeout: 5000 });
  ok('… the photos arrive one by one from the GP app; someone without one shows their initials', !!(await page.$('.meetCard img')) && /YY/.test(await page.$eval('.meetCard:nth-child(2) .meetPhoto', e => e.textContent)));
  /* 🧭 */
  await page.click('[data-aview="strengths"]'); await page.waitForSelector('[data-ptake]', { timeout: 5000 });
  ok('Team strengths lists the team the leader added — leader and members — each with Take the test or I know my type', (await page.$$('[data-ptake]')).length === 3 && (await page.$$('[data-ppickfor]')).length === 3 && /Team strengths/.test(await page.$eval('#main h2', e => e.textContent)) && !(await page.$('#strengthsAddTeam')));
  await page.click('[data-ptake="leader"]'); await page.waitForSelector('[data-pans]');
  ok('the questionnaire opens for that person: forty statements, eight a page, a seven-dot scale, Next off until the page is answered', /Lee Leader — the questionnaire/.test(await page.$eval('#main', e => e.textContent)) && (await page.$$('.pStmt')).length === 8 && (await page.$$('.pStmt:first-child .pDot')).length === 7 && await page.$eval('#pNext', b => b.disabled));
  for (let pg = 0; pg < 5; pg++) {
    const ids = await page.$$eval('.pStmt', ss => ss.map(x => x.id.replace('pq_', '')));
    for (const id of ids) await page.click('[data-pans="' + id + '|' + (Number(id.slice(1)) % 2 ? 3 : -2) + '"]');
    if (pg < 4) { await page.click('#pNext'); await page.waitForTimeout(100); }
  }
  await page.click('#pFinish'); await page.waitForTimeout(500);
  const sv = sent.filter(b => b.fn === 'portalSaveStrength').pop();
  ok('finishing scores it and saves the type with its four scores for the leader', sv && sv.args[2] === 'leader' && /^[EI][SN][TF][JP]$/.test(sv.args[3].type) && sv.args[3].source === 'test' && Object.keys(sv.args[3].scores).sort().join() === 'E,J,S,T', JSON.stringify(sv && sv.args[3]));
  ok('… and the result opens: the type, its group, strengths and watch-outs', !!(await page.$('.pResult')) && /Strengths/.test(await page.$eval('.pResult', e => e.textContent)) && /Watch out for/.test(await page.$eval('.pResult', e => e.textContent)));
  await page.click('#pviewClose'); await page.waitForTimeout(100);
  await page.click('[data-ppickfor="' + (await page.$eval('[data-ppickfor]', b => b.getAttribute('data-ppickfor'))) + '"]'); await page.waitForTimeout(100);
  ok('I know my type offers the sixteen', (await page.$$('[data-ppick]')).length === 16);
  await page.click('[data-ppick="ISTJ"]'); await page.waitForTimeout(400);
  ok('picking one saves it as "picked" and the team view appears: the four groups and the balance', sent.filter(b => b.fn === 'portalSaveStrength').pop().args[3].source === 'picked' && /How your team is put together \(2 of 3\)/.test(await page.$eval('#main', e => e.textContent)) && (await page.$$('.pGroup')).length === 4 && /The balance/i.test(await page.$eval('#main', e => e.textContent)) && /Still to take it:/.test(await page.$eval('#main', e => e.textContent)));
  /* 📚 */
  await page.click('[data-aview="resources"]'); await page.waitForSelector('.resRow', { timeout: 5000 });
  const res = await page.$eval('#main', e => e.textContent);
  ok('Resources: the guide with Open, the emergency numbers to tap and call, the places list marked coming soon until it has an address, the teams booklet as a link', /Outreach Leader’s Guide/.test(res) && !!(await page.$('#openGuide')) && (await page.$eval('a.resRow[href="tel:117"]', e => e.textContent)).indexOf('Police') > -1 && /Coming soon/.test(res) && !!(await page.$('a.resRow[href="https://example.org/teams.pdf"][target="_blank"]')));
  ok('apps to download have their own card: the logo (the app site’s icon), the note, Get it opening the app’s page', /Apps to get before you come/.test(res) && !!(await page.$('a.resApp[href="https://www.grab.com/kh/download/"][target="_blank"]')) && /favicons\?domain=www\.grab\.com/.test(await page.$eval('a.resApp img', i => i.getAttribute('src'))) && /way cheaper/.test(await page.$eval('a.resApp', e => e.textContent)) && /Get it/.test(await page.$eval('a.resApp .resGet', e => e.textContent)));
  await page.click('#openGuide'); await page.waitForTimeout(300);
  ok('the guide opens from Resources', !!(await page.$('#guideOverlay')));
  await page.click('#guideClose'); await page.waitForTimeout(100);
  await page.click('[data-aview="status"]'); await page.waitForSelector('#statusPill');
  ok('Application brings the dashboard back', !!(await page.$('#timeline')));
  ok('no sideways scroll', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}

/* ---------- the portal admin fixes the Our team cards ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('#navMenu');
  if(!(await page.$('#toTeam'))){ await page.click('#navMenu'); await page.waitForSelector('#navMenu'); }
  await page.click('#toTeam'); await page.waitForSelector('[data-meetedit]', { timeout: 5000 });
  ok('a portal admin has an Our team tab: the same cards applicants see, each with Edit', (await page.$$('.meetCard')).length === 2 && (await page.$$('[data-meetedit]')).length === 2 && /never changes the GP app/.test(await page.$eval('#main', e => e.textContent)));
  await page.click('[data-meetedit="st_yan"]'); await page.waitForSelector('#meet_name');
  ok('Edit opens the card: name and role to type, a photo to add, the ministry pointed to the GP app', await page.$eval('#meet_name', i => i.value) === 'Yan Yap' && await page.$eval('#meet_role', i => i.value) === 'YAP' && /Add a photo/.test(await page.$eval('#meetPhotoBtn', e => e.textContent)) && !(await page.$('#meetPhotoDel')) && /Ministry: Cafe/.test(await page.$eval('.meetCard.editing', e => e.textContent)) && !(await page.$('#meetReset')));
  await page.fill('#meet_name', 'Yan Yap Sok'); await page.fill('#meet_role', 'YAP · Barista');
  await page.click('#meetSave'); await page.waitForTimeout(400);
  const sc = sent.filter(b => b.fn === 'portalSaveStaffCard').pop();
  ok('Save sends the name and role for that card, and the card shows them', sc && sc.args[2] === 'st_yan' && sc.args[3].name === 'Yan Yap Sok' && sc.args[3].role === 'YAP · Barista' && sc.args[3].photo === undefined && /Yan Yap Sok/.test(await page.$eval('[data-meetcard="st_yan"] .meetName', e => e.textContent)) && !(await page.$('#meet_name')));
  await page.click('[data-meetedit="st_yan"]'); await page.waitForSelector('#meetPhotoInput', { state: 'attached' });
  await page.setInputFiles('#meetPhotoInput', { name: 'yan.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64') });
  await page.waitForFunction(() => !!document.querySelector('[data-meetcard="st_yan"] img'), null, { timeout: 5000 });
  const sp = sent.filter(b => b.fn === 'portalSaveStaffCard').pop();
  ok('a photo goes up on its own, shrunk to a square jpeg, and shows on the card with Remove', sp && sp.args[3].photo && /^[A-Za-z0-9+/=]+$/.test(sp.args[3].photo) && sp.args[3].name === undefined && !!(await page.$('#meetPhotoDel')) && /Change the photo/.test(await page.$eval('#meetPhotoBtn', e => e.textContent)));
  ok('an edited card says so, with a way back to the GP app’s details', /Changed here in the portal/.test(await page.$eval('.meetCard.editing', e => e.textContent)) && !!(await page.$('#meetReset')));
  page.once('dialog', d => d.accept());
  await page.click('#meetReset'); await page.waitForTimeout(400);
  const rs0 = sent.filter(b => b.fn === 'portalSaveStaffCard').pop();
  ok('Back to the GP app’s details sends reset, and the card reads Yan Yap again', rs0 && rs0.args[3].reset === true && /Yan Yap/.test(await page.$eval('[data-meetcard="st_yan"] .meetName', e => e.textContent)) && !/Sok/.test(await page.$eval('[data-meetcard="st_yan"] .meetName', e => e.textContent)));
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('.trow');
  await page.click('#navMenu'); await page.waitForSelector('#staffMenu');
  ok('portal staff who are not admins have no Our team in the menu', !(await page.$('#toTeam')) && !!(await page.$('#toPreview')) && !(await page.$('#toAccess')));
  await ctx.close();
}

/* ---------- Who has access (portal admins) ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('#navMenu'); await page.click('#navMenu'); await page.waitForSelector('#toAccess');
  await page.click('#toAccess'); await page.waitForSelector('[data-accstaff]', { timeout: 5000 });
  ok('Who has access lists every staff member with a Staff access and an Admin access switch, and says who has it anyway', (await page.$$('[data-accessrow]')).length === 5 && await page.$eval('[data-accstaff="st_dara"]', b => b.checked) && await page.$eval('[data-accadmin="st_sina"]', b => b.checked) && !(await page.$eval('[data-accadmin="st_plain"]', b => b.checked)) && /GP app admin/.test(await page.$eval('[data-accessrow="st_uriah"]', e => e.textContent)) && /Leads Outreach Teams/.test(await page.$eval('[data-accessrow="st_rithy"]', e => e.textContent)));
  await page.click('[data-accstaff="st_plain"]'); await page.waitForTimeout(300);
  const sa = sent.filter(b => b.fn === 'portalSetAccess').pop();
  ok('ticking Staff access sends it for that person', sa && sa.args[2] === 'st_plain' && JSON.stringify(sa.args[3]) === '{"portalStaff":true}' && await page.$eval('[data-accstaff="st_plain"]', b => b.checked));
  await page.click('[data-accadmin="st_plain"]'); await page.waitForTimeout(300);
  const ad = sent.filter(b => b.fn === 'portalSetAccess').pop();
  ok('… and Admin access the same (a GP app admin here)', ad && ad.args[2] === 'st_plain' && JSON.stringify(ad.args[3]) === '{"portalAdmin":true}');
  await page.fill('#accessQ', 'rithy'); await page.waitForTimeout(200);
  ok('search narrows the list', (await page.$$('[data-accessrow]')).length === 1);
  await ctx.close();
}
/* ---------- the Teams tab in the order they come ---------- */
{
  CANDS = JSON.parse(JSON.stringify(CANDS0));
  const base = CANDS.find(c => c.id === 'cd_team');
  const mk = (id, name, from, to, updated) => { const c = JSON.parse(JSON.stringify(base)); c.id = id; c.updated = updated; c.portal.form.answers = { ...c.portal.form.answers, teamName: name, itinerary: from ? [{ place: 'YWAM Siem Reap', from, to, base: true }] : [] }; return c; };
  CANDS.push(mk('cd_tsoon', 'Soon Team', '2026-11-01', '2026-11-10', '2026-09-01T10:00:00Z'), mk('cd_tnow', 'Here Now Team', '2026-10-01', '2026-10-20', '2026-09-02T10:00:00Z'), mk('cd_tgone', 'Gone Team', '2026-08-01', '2026-08-10', '2026-09-30T10:00:00Z'), mk('cd_tnodate', 'No Dates Team', '', '', '2026-09-29T10:00:00Z'));
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('.trow');
  await page.click('[data-whatfilter="team"]'); await page.waitForTimeout(200);
  const order = await page.$$eval('.trow .who', ws => ws.map(w => w.textContent).join('|'));
  ok('Teams come in the order they arrive: here now, then soonest first, then no dates yet, then already gone — not by last change', order === 'Here Now Team|Soon Team|Grace Church Team|No Dates Team|Gone Team', order);
  ok('each dated team says when it comes', /from 1 Nov 2026/.test(await page.$eval('.trow[data-open="cd_tsoon"]', e => e.textContent)));
  await page.click('[data-whatfilter=""]'); await page.waitForTimeout(200);
  ok('the All tab keeps the latest change first', (await page.$eval('.trow .who', w => w.textContent)) === 'Gone Team');
  await ctx.close();
}

/* ---------- the Teams archive: by year and quarter ---------- */
{
  CANDS = JSON.parse(JSON.stringify(CANDS0));
  const base = CANDS.find(c => c.id === 'cd_team');
  const gone = (id, name, left, manual) => { const c = JSON.parse(JSON.stringify(base)); c.id = id; c.stage = 'arrived'; c.status = manual ? 'closed' : 'completed'; c.portal.form.answers = { ...c.portal.form.answers, teamName: name }; c.archived = manual ? { at: left, reason: 'Trip off', by: 'st_dara' } : { at: left, reason: 'auto', by: 'auto', left }; return c; };
  CANDS.push(gone('cd_a1', 'Summer Team', '2026-08-20'), gone('cd_a2', 'Spring Team', '2026-04-03'), gone('cd_a3', 'August Team', '2026-07-02'), gone('cd_a4', 'Last Year Team', '2025-11-05'), gone('cd_a5', 'Called Off Team', '2026-05-01', true));
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('.trow');
  await page.click('[data-whatfilter="team"]'); await page.waitForTimeout(150);
  ok('on the Teams tab the chip reads Archive', /Archive/.test(await page.$eval('[data-filter="archived"]', b => b.textContent)) && !/\bArchived\b/.test(await page.$eval('[data-filter="archived"]', b => b.textContent)));
  ok('archived teams are not in the open list', !(await page.$('.trow[data-open="cd_a1"]')));
  await page.click('[data-filter="archived"]'); await page.waitForTimeout(200);
  const folders = await page.$$eval('.archYear', ds => ds.map(d => d.getAttribute('data-archyear') + (d.open ? '*' : '') + ':' + [...d.querySelectorAll('.archQ')].map(q => q.getAttribute('data-archq') + '=' + [...q.parentElement.querySelectorAll('.trow')].length).join(',')));
  const qs = await page.$$eval('.archQ', qs => qs.map(q => q.getAttribute('data-archq')));
  ok('the archive is a folder per year, newest first and open, with the quarters inside, newest first', JSON.stringify(folders.map(f => f.split(':')[0])) === '["2026*","2025"]' && JSON.stringify(qs) === '["2026-Q3","2026-Q2","2025-Q4"]', JSON.stringify(folders) + ' ' + JSON.stringify(qs));
  const q3 = await page.$eval('[data-archq="2026-Q3"]', q => { const out = []; let n = q.nextElementSibling; while (n && n.classList.contains('trow')) { out.push(n.querySelector('.who').textContent); n = n.nextElementSibling; } return out.join('|'); });
  ok('each quarter lists its teams, latest to leave first, and says when they left', q3 === 'Summer Team|August Team' && /Q3 · Jul–Sep · 2/.test(await page.$eval('[data-archq="2026-Q3"]', e => e.textContent)) && /Left 20 Aug 2026/.test(await page.$eval('.trow[data-open="cd_a1"]', e => e.textContent)), q3);
  ok('a team closed by hand sits in the quarter it was closed, with no "Left"', /Called Off Team/.test(await page.$eval('[data-archyear="2026"]', e => e.textContent)) && !/Left/.test(await page.$eval('.trow[data-open="cd_a5"]', e => e.textContent)));
  await page.click('.trow[data-open="cd_a1"]'); await page.waitForSelector('#panel');
  ok('the archived record says when the team left and that everything is kept, documents included', /Archived — the team left on 20 Aug 2026/.test(await page.$eval('#archBanner', e => e.textContent)) && /passports, flights, e-visas/.test(await page.$eval('#archBanner', e => e.textContent)) && /passports\.pdf/.test(await page.$eval('[data-dockind="passports"]', e => e.textContent)));
  await ctx.close();
}

/* ---------- the portal admin edits Resources ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('#navMenu');
  if(!(await page.$('#toResources'))){ await page.click('#navMenu'); await page.waitForSelector('#navMenu'); }
  await page.click('#toResources'); await page.waitForSelector('[data-resf]', { timeout: 5000 });
  ok('a portal admin has a Resources tab with the list to edit', (await page.$$('.resEdit')).length === 5 && (await page.$$eval('[data-resf="0|kind"] option', os => os.map(o => o.value).join())) === 'guide,link,phone,note,app' && /shipped defaults/.test(await page.$eval('#main', e => e.textContent)));
  await page.fill('[data-resf="2|value"]', 'maps.app.goo.gl/list1');
  await page.click('#resAdd'); await page.waitForTimeout(100);
  const n = (await page.$$('.resEdit')).length - 1;
  await page.selectOption('[data-resf="' + n + '|kind"]', 'phone'); await page.waitForTimeout(100);
  await page.fill('[data-resf="' + n + '|title"]', 'Tourist police'); await page.fill('[data-resf="' + n + '|value"]', '+855 12 345 678');
  await page.click('#resSave'); await page.waitForTimeout(400);
  const rs = sent.filter(b => b.fn === 'portalSaveResources').pop();
  ok('Save sends the list — the maps link filled in, a tourist police number added', rs && rs.args[2][2].value === 'maps.app.goo.gl/list1' && rs.args[2][5].kind === 'phone' && rs.args[2][5].title === 'Tourist police' && !/shipped defaults/.test(await page.$eval('#main', e => e.textContent)), JSON.stringify(rs && rs.args[2]));
  await ctx.close();
}

/* ---------- a team's trip: dates like booking a flight ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'team.new', pin: '2468' })));
  await page.waitForSelector('#openForm');
  ok('before submitting, the documents card says what comes after', /Once your application is in, you upload these here/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('[data-docup]')));
  await page.click('#openForm');
  await page.waitForSelector('#formNext');
  await page.fill('#a_teamName', 'New Team');
  ok('co-leaders start empty, with Add a co-leader', /None added/.test(await page.$eval('[data-people]', e => e.textContent)) && /Add a co-leader/.test(await page.$eval('[data-personadd]', e => e.textContent)));
  for (const [i, who] of ['Sam Co', 'Jo Co', 'Lee Co'].entries()) {
    await page.click('[data-personadd]');
    await page.waitForSelector('[data-person="a_coLeaders|' + i + '|name"]');
    await page.fill('[data-person="a_coLeaders|' + i + '|name"]', who);
  }
  await page.fill('[data-person="a_coLeaders|0|email"]', 'sam@example.org');
  ok('Add a co-leader adds as many as needed, each with name, email and phone', (await page.$$eval('.personRow', r => r.length)) === 3 && (await page.$eval('#a_teamName', i => i.value)) === 'New Team');
  await page.click('[data-persondel="a_coLeaders|1"]');
  await page.waitForTimeout(150);
  ok('✕ removes one and keeps the others', JSON.stringify(await page.$$eval('[data-person$="|name"]', i => i.map(x => x.value))) === JSON.stringify(['Sam Co', 'Lee Co']));
  await page.waitForTimeout(1000);
  const cd = sent.filter(b => b.fn === 'portalSaveDraft').pop();
  ok('the co-leaders save with the draft', cd && JSON.stringify(cd.args[2].coLeaders) === JSON.stringify([{ name: 'Sam Co', email: 'sam@example.org', phone: '' }, { name: 'Lee Co', email: '', phone: '' }]) && cd.args[2].teamName === 'New Team', cd && JSON.stringify(cd.args[2].coLeaders));
  await page.click('#formNext');
  await page.waitForSelector('.stays');
  ok('the trip question starts with Siem Reap and two empty date slots, plus Add another location', /YWAM Siem Reap/.test(await page.$eval('.stays', e => e.textContent)) && (await page.$$eval('[data-stayopen]', b => b.length)) === 1 && /Add date/.test(await page.$eval('[data-stayopen]', e => e.textContent)) && !!(await page.$('[data-stayadd]')));
  await page.click('#formNext');
  await page.waitForTimeout(200);
  ok('Next is stopped until Siem Reap has its dates', !!(await page.$('.qBlock.missing')) && !!(await page.$('.stays')));
  await page.click('[data-stayopen]');
  await page.waitForSelector('.cal');
  ok('tapping the dates opens a calendar asking for the arrival day, one month on a phone', /Tap the day you arrive/.test(await page.$eval('.cal', e => e.textContent)) && await page.$eval('.calMonth2', e => getComputedStyle(e).display === 'none'));
  await page.evaluate(() => { P.cal.month = '2027-01'; render(); });
  await page.click('[data-calday="2027-01-10"]');
  await page.waitForTimeout(100);
  ok('after the arrival it asks for the departure', /Now tap the day you leave/.test(await page.$eval('.cal', e => e.textContent)) && await page.$eval('[data-calday="2027-01-10"]', b => b.classList.contains('from')));
  await page.click('[data-calday="2027-01-20"]');
  await page.waitForTimeout(100);
  ok('the second tap closes it and shows the range and the days', !(await page.$('.cal')) && /10 Jan 2027/.test(await page.$eval('[data-stayopen]', e => e.textContent)) && /20 Jan 2027/.test(await page.$eval('[data-stayopen]', e => e.textContent)) && /11 days/.test(await page.$eval('[data-stayopen]', e => e.textContent)));
  ok('Siem Reap only: the total in Cambodia is those 11 days, and no visa line is needed', /11 days in Cambodia in total/.test(await page.$eval('.staySum', e => e.textContent)) && !/visa/.test(await page.$eval('.staySum', e => e.textContent)));
  await page.click('[data-stayadd]');
  await page.waitForSelector('[data-stayplace]');
  ok('Add another location adds a place with its own dates, focused', (await page.$$eval('[data-stayopen]', b => b.length)) === 2 && await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-stayplace')));
  await page.fill('[data-stayplace]', 'Phnom Penh');
  await page.click('[data-stayopen$="|1"]');
  await page.waitForSelector('.cal');
  ok('its calendar opens on the month Siem Reap ends', /January 2027/.test(await page.$eval('.cal', e => e.textContent)));
  await page.click('[data-calday="2027-01-20"]');
  await page.click('[data-calday="2027-01-23"]');
  await page.waitForTimeout(100);
  ok('the total in Cambodia spans both places, and says who handles the visa', /14 days in Cambodia in total/.test(await page.$eval('.staySum', e => e.textContent)) && /10 Jan 2027 – 23 Jan 2027/.test(await page.$eval('.staySum', e => e.textContent)) && /our base first, so we handle your visa/.test(await page.$eval('.staySum', e => e.textContent)));
  await page.waitForTimeout(1000);
  const dr = sent.filter(b => b.fn === 'portalSaveDraft').pop();
  ok('the trip saves as a draft like any answer: places and dates', dr && JSON.stringify(dr.args[2].itinerary.map(r => [r.place, r.from, r.to])) === JSON.stringify([['YWAM Siem Reap', '2027-01-10', '2027-01-20'], ['Phnom Penh', '2027-01-20', '2027-01-23']]) && dr.args[2].teamName === 'New Team');
  await page.click('[data-staydel$="|1"]');
  await page.waitForTimeout(100);
  ok('✕ removes an added place', (await page.$$eval('[data-stayopen]', b => b.length)) === 1 && /11 days in Cambodia in total/.test(await page.$eval('.staySum', e => e.textContent)));
  ok('no sideways scroll with the picker', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok('the form asks whether flights are booked, with no attach box until someone says Yes', /Have you booked your flights yet/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('.qAttach')));
  await page.click('[data-ans="flightsBooked"][value="Yes"]');
  await page.waitForSelector('.qAttach');
  ok('Yes opens an attach box for the itinerary, right under the question', !!(await page.$('.qAttach [data-docup="flights"]')) && /Flight itineraries/.test(await page.$eval('.qAttach', e => e.textContent)) && !/Not booked yet/.test(await page.$eval('.qAttach', e => e.textContent)));
  await page.setInputFiles('.qAttach [data-docup="flights"]', [{ name: 'itinerary.png', mimeType: 'image/png', buffer: Buffer.from('fake png bytes') }]);
  await page.waitForFunction(() => /itinerary\.png/.test((document.querySelector('.qAttach') || {}).textContent || ''), null, { timeout: 5000 });
  const fu = sent.filter(b => b.fn === 'portalUploadDoc').pop();
  ok('attaching sends it as the flights document, and it shows in the box, the Yes still ticked', fu && fu.args[0] === 'team.new' && fu.args[2] === 'flights' && fu.args[4] === 'image/png' && fu.args.length === 6 && await page.$eval('[data-ans="flightsBooked"][value="Yes"]', r => r.checked));
  await page.click('[data-ans="flightsBooked"][value="No"]');
  await page.waitForTimeout(200);
  ok('No hides the box again', !(await page.$('.qAttach')));
  await page.click('#formClose2');
  await page.waitForSelector('#statusPill');
  ok('back on the dashboard, the documents list shows the itinerary already attached', /Flight itineraries · 1 file/.test(await page.$eval('#main', e => e.textContent)));
  await ctx.close();
}
{
  CANDS = JSON.parse(JSON.stringify(CANDS0));
  /* two files that came in the old way, under the names-and-photos document: a PDF and one person's picture */
  CANDS.find(c => c.id === 'cd_team').portal.docs.push({ id: 'pd_tpdf', kind: 'photo', name: 'team.pdf', mime: 'application/pdf', size: 900, added: '2026-09-19T10:00:00Z', by: 'st_team' }, { id: 'pd_img', kind: 'photo', name: 'Member Two.png', mime: 'image/png', size: 70, added: '2026-09-19T10:00:00Z', by: 'st_team' });
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('.trow');
  await page.click('[data-whatfilter="team"]');
  await page.waitForTimeout(150);
  ok('the team row says how long they are in Cambodia', /14 days in Cambodia/.test(await page.$eval('.trow[data-open="cd_team"]', e => e.textContent)));
  ok('a team is listed by its sending church, not the leader’s name', /Grace Church Team/.test(await page.$eval('.trow[data-open="cd_team"] .who', e => e.textContent)) && !/Pat Leader/.test(await page.$eval('.trow[data-open="cd_team"] .who', e => e.textContent)));
  ok('and the row says what is next for them', /→ 1st call — getting to know each other/.test(await page.$eval('.trow[data-open="cd_team"]', e => e.textContent)));
  await page.click('[data-open="cd_team"]');
  await page.waitForSelector('#panel');
  const pan = await page.$eval('#panel', e => e.textContent);
  ok('the record shows the trip: total in Cambodia, each place with dates and days, who handles the visa', /14 days · 10 Jan 2027 – 23 Jan 2027/.test(await page.$eval('#tripTotal', e => e.textContent)) && (await page.$$eval('.tripStay', r => r.map(x => x.textContent.replace(/\s+/g, ' ').trim()))).join(' | ') === '📍 YWAM Siem Reap10 Jan 2027 – 20 Jan 2027 · 11 days | 📍 Phnom Penh20 Jan 2027 – 23 Jan 2027 · 4 days' && /Arrives first at/.test(pan) && /we handle the visa/.test(pan));
  const hosp = await page.$eval('#hospText', e => e.value);
  ok('and a ready-to-paste note for hospitality: name and where from, Siem Reap dates with days and nights, males, females, couples/families', hosp.split('\n').length === 5 && hosp.split('\n')[0] === 'Grace Church Team — Sydney, Australia' && /^Siem Reap: \w{3},? 10 Jan 2027 – \w{3},? 20 Jan 2027 \(11 days, 10 nights\)$/.test(hosp.split('\n')[1]) && hosp.split('\n').slice(2).join('|') === 'Males: 6|Females: 8|Couples / families: 2', JSON.stringify(hosp));
  ok('with a Copy button', !!(await page.$('#copyHosp')));
  ok('the trip block says whether flights are booked', /Flights booked\s*Not yet/.test(await page.$eval('#tripFlights', e => e.textContent)));
  ok('the record is headed by the sending church, with the leader named under it', /Grace Church Team/.test(await page.$eval('#panel h2', e => e.textContent)) && /Leader: Pat Leader/.test(pan));
  ok('the record lists the team’s documents, with what is still needed — the names-and-photos row has no Upload, since those are made on the roster', /passports\.pdf/.test(await page.$eval('[data-dockind="passports"]', e => e.textContent)) && /Needed/.test(await page.$eval('[data-dockind="flights"]', e => e.textContent)) && !(await page.$('[data-docup="photo"]')));
  ok('the stage picker has the team stages', (await page.$$eval('#p_stage option', o => o.map(x => x.value).join(','))) === 'new,applied,call1,docs,call2,practical,arrived');
  ok('and the Teams tab counts by them', /1st call/.test(await page.$eval('.tiles', e => e.textContent)) && /Awaiting documents/.test(await page.$eval('.tiles', e => e.textContent)) && !/Interview/.test(await page.$eval('.tiles', e => e.textContent)));
  ok('staff upload the letter of invitation themselves', /You send this/.test(await page.$eval('[data-dockind="invitation"]', e => e.textContent)) && !!(await page.$('[data-docup="invitation"]')));
  ok('the record shows the team’s steps with what is next', /Next: 1st call — getting to know each other · on us/.test(await page.$eval('#teamNext', e => e.textContent)));
  ok('staff tick the steps done outside the portal; the ones the portal sees tick themselves', (await page.$$eval('[data-teamstep]', c => c.map(x => x.getAttribute('data-teamstep')).join(','))) === 'call1,call2,arrived' && /ticks when they upload it/.test(await page.$eval('.flowList', e => e.textContent)));
  ok('no separate visa ticks for a team', !(await page.$('[data-visaflag]')));
  ok('a team not in the Teams Database yet says so, and offers to add it', /Not in the Teams Database yet/.test(await page.$eval('#teamDbState', e => e.textContent)) && !!(await page.$('#syncTeamBtn')));
  await page.click('#syncTeamBtn');
  await page.waitForSelector('[data-snum]');
  ok('Add to the Teams Database puts it in and says so', sent.some(b => b.fn === 'portalStaffSyncTeam' && b.args[2] === 'cd_team') && /In the Teams Database/.test(await page.$eval('#teamDbState', e => e.textContent)));
  ok('the record has the team’s numbers to fill in, like the Teams Database', !!(await page.$('[data-snum="People Served"]')) && !(await page.$('[data-snum="Teams Hosted"]')) && !(await page.$('[data-snum="Volunteers Mobilized"]')) && !!(await page.$('#saveStaffNums')));
  await page.fill('[data-snum="People Served"]', '42');
  await page.fill('[data-sreach="male"]', '8');
  await page.click('#saveStaffNums');
  await page.waitForTimeout(400);
  const sn = sent.filter(b => b.fn === 'portalStaffSaveTeamNumbers').pop();
  ok('staff save them for that team', sn && sn.args[2] === 'cd_team' && sn.args[3]['People Served'] === 42 && sn.args[4].male === 8, JSON.stringify(sn && sn.args.slice(2)));
  ok('and they stay in the boxes', (await page.$eval('[data-snum="People Served"]', i => i.value)) === '42');
  await page.check('[data-teamstep="call1"]');
  await page.waitForTimeout(400);
  const ts = sent.filter(b => b.fn === 'portalTeamStep').pop();
  ok('ticking the 1st call goes through portalTeamStep', ts && ts.args[2] === 'cd_team' && ts.args[3] === 'call1' && ts.args[4] === true, JSON.stringify(ts && ts.args.slice(2)));
  ok('and the record moves on to the documents', /Next: Passport copies for the whole team · waiting on the team/.test(await page.$eval('#teamNext', e => e.textContent)));
  ok('the names-and-photos document has no upload on the record either: it lists files that came the old way and points to the roster', !(await page.$('[data-docup="photo"]')) && /team\.pdf/.test(await page.$eval('[data-dockind="photo"]', e => e.textContent)) && /Member Two\.png/.test(await page.$eval('[data-dockind="photo"]', e => e.textContent)) && /put each one on a person under Team members/.test(await page.$eval('[data-dockind="photo"]', e => e.textContent)) && !!(await page.$('[data-docup="passports"]')));
  await page.waitForSelector('#panelMembers .rosterRow', { timeout: 5000 });
  ok('the record shows the team’s faces — leader and members, each with a Photo button staff can use too — and a Team photo sheet button', (await page.$$('#panelMembers .rosterRow')).length >= 2 && !!(await page.$('#panelMembers [data-tphoto][data-tphotocand="cd_team"]')) && !!(await page.$('#teamSheetBtn')));
  await page.waitForSelector('#upPhotos [data-upuse]', { timeout: 5000 });
  ok('only the picture is offered for the roster, not the PDF', (await page.$$('#upPhotos [data-upuse]')).length === 1);
  const twoKey = await page.$eval('#panelMembers .rosterRow:nth-child(3)', e => e.getAttribute('data-rosterkey'));
  ok('a photo uploaded as a file is offered for the roster, with a guess at who it is from the file name', /Photos the team uploaded as files/.test(await page.$eval('#upPhotos', e => e.textContent)) && /Member Two\.png/.test(await page.$eval('#upPhotos', e => e.textContent)) && (await page.$eval('#upPhotos [data-upfor]', s => s.value)) === twoKey && (await page.$$eval('#upPhotos [data-upfor] option', os => os.length)) === 4, twoKey);
  await page.click('#upPhotos [data-upuse]');
  await page.waitForFunction(k => !!document.querySelector('#panelMembers [data-rosterkey="' + k + '"] img.avatar'), twoKey, { timeout: 5000 });
  const gd = sent.filter(b => b.fn === 'portalGetDoc').pop(), sp = sent.filter(b => b.fn === 'portalSaveTeamPhoto').pop();
  ok('Use fetches the file, shrinks it and saves it as that person’s photo on this record — the face shows on the roster', (gd && sp && sp.args[2] === twoKey && sp.args[4] === 'cd_team' && /^[A-Za-z0-9+/=]+$/.test(sp.args[3])), JSON.stringify(sp && sp.args.slice(2, 3).concat(sp.args.slice(4))));
  ok('… it sends which upload it came from, and that upload is no longer offered', (typeof sp.args[5] === 'string' && sp.args[5].length > 0 && !(await page.$('#upPhotos'))));
  ok('… the names-and-photos document row is still there while someone has no photo', !!(await page.$('[data-dockind="photo"]')));
  for (const k of await page.$$eval('#panelMembers .rosterRow', rs => rs.filter(r => !r.querySelector('img.avatar')).map(r => r.getAttribute('data-rosterkey')))) {
    await page.click('#panelMembers [data-tphoto="' + k + '"]');
    await page.setInputFiles('#tphotoInput', { name: k + '.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64') });
    await page.waitForFunction(kk => !!document.querySelector('#panelMembers [data-rosterkey="' + kk + '"] img.avatar'), k, { timeout: 5000 });
  }
  await page.waitForFunction(() => /Everyone has a photo/.test((document.querySelector('#panelMembers') || {}).textContent || ''), null, { timeout: 5000 });
  ok('once everyone has a photo, the names-and-photos document row and the uploads are hidden — the roster is the one place', !(await page.$('[data-dockind="photo"]')) && !(await page.$('#upPhotos')) && !!(await page.$('[data-dockind="passports"]')));
  await page.click('#teamSheetBtn'); await page.waitForTimeout(600);
  ok('the sheet is drawn and offered as a picture without a page error', !!(await page.$('#teamSheetBtn')) && errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---------- opened from the Teams Database: one record ---------- */
{
  CANDS = JSON.parse(JSON.stringify(CANDS0));
  const { ctx, page } = await open({ width: 1280, height: 900 }, '?open=cd_team', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('#panel');
  ok('portal.html?open=<id> opens that team’s application on the staff side', /Grace Church Team/.test(await page.$eval('#panel h2', e => e.textContent)) && await page.$eval('[data-whatfilter="team"]', b => b.classList.contains('on')));
  ok('and tidies the address so a reload does not reopen it', await page.evaluate(() => !/open=/.test(location.search)));
  await ctx.close();
}

/* ---------- staff tools bar on a phone ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('.trow');
  const bar = await page.evaluate(() => ({
    header: [...document.querySelectorAll('#hbtns button')].map(b => b.id),
    nav: [...document.querySelectorAll('#staffNav button')].map(b => b.id),
    inView: [...document.querySelectorAll('#staffNav button, #hbtns button')].every(b => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 0.5; }),
    noScroll: document.documentElement.scrollWidth <= innerWidth + 1
  }));
  ok('on a phone the header keeps only language and Sign out', JSON.stringify(bar.header) === JSON.stringify(['langBtn', 'outBtn']), JSON.stringify(bar.header));
  ok('the bar is just Applications and a ☰ menu — the rest sits in the menu', JSON.stringify(bar.nav) === JSON.stringify(['navCrm', 'navMenu']) && !(await page.$('#staffMenu')), JSON.stringify(bar.nav));
  ok('and the bar starts with a small ‹ back to the GP app home (named for screen readers)', await page.$eval('#staffNav > :first-child', a => a.id === 'toGpApp' && a.tagName === 'A' && a.getAttribute('href') === 'teams.html' && /GP app home/.test(a.textContent) && a.getBoundingClientRect().width <= 44 && /‹/.test(a.textContent)));
  await page.click('#navMenu'); await page.waitForSelector('#staffMenu'); await page.waitForTimeout(350);
  ok('☰ opens the menu as a panel on the side, over the page, with a backdrop', await page.$eval('#staffMenu', m => { const r = m.getBoundingClientRect(), cs = getComputedStyle(m); return cs.position === 'fixed' && Math.abs(r.right - innerWidth) < 1 && r.top === 0 && r.width < innerWidth; }) && !!(await page.$('#menuScrim')) && await page.evaluate(() => document.body.classList.contains('menuOn')), JSON.stringify(await page.$eval('#staffMenu', m => { const r = m.getBoundingClientRect(); return { pos: getComputedStyle(m).position, r: [r.left, r.top, r.right, r.width], w: innerWidth }; })));
  await page.click('#menuScrim', { position: { x: 10, y: 400 } }); await page.waitForTimeout(150);
  ok('tapping outside closes it', !(await page.$('#staffMenu')) && !(await page.evaluate(() => document.body.classList.contains('menuOn'))));
  await page.click('#navMenu'); await page.waitForSelector('#staffMenu'); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  ok('… and so does Esc', !(await page.$('#staffMenu')));
  await page.click('#navMenu'); await page.waitForSelector('#menuClose'); await page.click('#menuClose'); await page.waitForTimeout(150);
  ok('… and ✕', !(await page.$('#staffMenu')));
  ok('every button is fully on screen, nothing scrolls sideways', bar.inView && bar.noScroll && await page.$eval('#toGpApp', a => { const r = a.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 0.5; }));
  if(!(await page.$('#toPreview'))){ await page.click('#navMenu'); await page.waitForSelector('#toPreview'); }
  await page.click('#toPreview');
  await page.waitForSelector('#pvFrame');
  ok('the ☰ button marks where you are (and closes the menu), with Applications to go back', await page.$eval('#navMenu', b => b.classList.contains('on') && /View as applicant/.test(b.textContent)) && !(await page.$('#staffMenu')) && !!(await page.$('#navCrm')));
  await page.click('#navCrm');
  await page.waitForSelector('.trow');
  ok('Applications in the bar returns to the list', await page.$eval('#navCrm', b => b.classList.contains('on')));
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  if(!(await page.$('#toLink'))){ await page.click('#navMenu'); await page.waitForSelector('#toLink'); }
  await page.click('#toLink');
  await page.waitForSelector('#applyLinkCard');
  ok('Link for applicants opens the portal link, ready to copy', /\/portal\.html$/.test(await page.$eval('#applyLinkBox', i => i.value)) && !!(await page.$('#copyApplyLink')), await page.$eval('#applyLinkBox', i => i.value));
  ok('with a chip for each kind of application', (await page.$$eval('[data-linkkind]', c => c.map(x => x.getAttribute('data-linkkind')).join(','))) === ',dts,dbs,bcs,sms,staff,volunteer,team', await page.$$eval('[data-linkkind]', c => c.map(x => x.getAttribute('data-linkkind')).join(',')));
  await page.click('[data-linkkind="team"]');
  await page.waitForTimeout(200);
  ok('picking Teams gives the link straight to the team application', /\/portal\.html\?apply=team$/.test(await page.$eval('#applyLinkBox', i => i.value)));
  const copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  ok('and copies it', copied === '' || /\?apply=team$/.test(copied), copied);
  ok('the link panel fits a phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.click('#closeLink');
  ok('✕ closes it', !(await page.$('#applyLinkCard')));
  await ctx.close();
}

/* ---------- View as applicant, staff side ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'dara', pin: '1234' })));
  await page.waitForSelector('.trow');
  ok('portal staff have View as applicant in the ☰ menu', !!(await page.$('#navMenu')));
  if(!(await page.$('#toPreview'))){ await page.click('#navMenu'); await page.waitForSelector('#toPreview'); }
  await page.click('#toPreview');
  await page.waitForSelector('#pvFrame');
  const first = sent.filter(b => b.fn === 'portalViewAs').pop();
  ok('it opens on a sample DTS international student at "new" and asks the server for that', first && first.args[2].type === 'student' && first.args[2].school === 'dts' && first.args[2].audience === 'international' && first.args[2].stage === 'new' && (await page.$$eval('[data-pvkey]', b => b.length)) === 7 && (await page.$$eval('[data-pvstage]', b => b.length)) === 7);
  ok('the frame shows their dashboard, read-only: sample name, status pill, the timeline, inert', /Sample Applicant/.test(await page.$eval('#pvFrame', e => e.textContent)) && !!(await page.$('#pvFrame #statusPill')) && !!(await page.$('#pvFrame #timeline')) && (await page.$eval('#pvFrame', e => e.hasAttribute('inert'))) && /Seeing what Sample Applicant sees/.test(await page.$eval('.pvBar', e => e.textContent)));
  await page.click('[data-pvaud="khmer"]');
  await page.waitForTimeout(300);
  await page.click('[data-pvstage="accepted"]');
  await page.waitForTimeout(300);
  const k = sent.filter(b => b.fn === 'portalViewAs').pop();
  ok('a student has no guide tab', !(await page.$('[data-pvscreen="guide"]')));
  ok('Khmer + Accepted re-asks with those and the frame follows (accepted pill, no visa guide)', k.args[2].audience === 'khmer' && k.args[2].stage === 'accepted' && /Accepted/.test(await page.$eval('#pvFrame #statusPill', e => e.textContent)) && !/e-visa/.test(await page.$eval('#pvFrame', e => e.textContent)));
  await page.click('[data-pvkey="team"]');
  await page.waitForTimeout(300);
  ok('Team hides the Khmer / International switch and shows the team dashboard', !(await page.$('[data-pvaud]')) && /Sample Team/.test(await page.$eval('#pvFrame', e => e.textContent)) && /team photo/i.test(await page.$eval('#pvFrame', e => e.textContent)));
  /* their tabs, outside the read-only frame, so every tab can be checked without a team account */
  ok('the applicant’s tabs sit above the frame — five for a team, Application open — and work from the staff side', (await page.$$eval('#applicantNav [data-pvaview]', bs => bs.map(b => b.getAttribute('data-pvaview') + (b.classList.contains('on') ? '*' : '')).join())) === 'status*,team,strengths,metrics,resources' && !(await page.$('#pvFrame #applicantNav')));
  await page.click('[data-pvaview="team"]'); await page.waitForSelector('#pvFrame .meetGrid', { timeout: 5000 });
  ok('Our team shows the campus staff cards in the frame', /YWAM Siem Reap Campus Staff/.test(await page.$eval('#pvFrame h2', e => e.textContent)) && /Dara Pen/.test(await page.$eval('#pvFrame .meetGrid', e => e.textContent)));
  await page.click('[data-pvaview="strengths"]'); await page.waitForTimeout(200);
  ok('Strengths shows the sample team’s people, none taken yet', /Team strengths/.test(await page.$eval('#pvFrame h2', e => e.textContent)) && (await page.$$('#pvFrame [data-ptake]')).length === 3 && /Sam Sample/.test(await page.$eval('#pvFrame', e => e.textContent)));
  await page.click('[data-pvaview="metrics"]'); await page.waitForTimeout(200);
  ok('Metrics shows what a team at this stage sees', /Team metrics/.test(await page.$eval('#pvFrame h2', e => e.textContent)));
  await page.click('[data-pvaview="resources"]'); await page.waitForSelector('#pvFrame .resRow', { timeout: 5000 });
  ok('Resources shows the list applicants get', /Outreach Leader’s Guide/.test(await page.$eval('#pvFrame', e => e.textContent)));
  await page.click('[data-pvaview="status"]'); await page.waitForTimeout(200);
  ok('… and back to their application', /Sample Team/.test(await page.$eval('#pvFrame', e => e.textContent)) && !!(await page.$('#pvFrame #timeline')));
  ok('for a team there is a Their guide tab', !!(await page.$('[data-pvscreen="guide"]')));
  await page.click('[data-pvscreen="guide"]'); await page.waitForTimeout(250);
  const pg = await page.$eval('#pvGuide', e => e.textContent);
  ok('Their guide shows the whole Outreach Leader’s Guide, readable (not behind the read-only frame), with print', /Outreach Leader’s Guide to Cambodia/.test(pg) && /\$14\/tuktuk/.test(pg) && /Debriefing Time/.test(pg) && !(await page.$('#pvFrame')) && !!(await page.$('#pvGuide #guidePrint')));
  await page.click('[data-pvscreen="me"]'); await page.waitForTimeout(200);
  ok('… and back to their dashboard', !!(await page.$('#pvFrame')) && !(await page.$('#pvGuide')));
  await page.click('[data-pvscreen="form"]');
  await page.waitForTimeout(200);
  ok('Their form shows the team form section by section, with section chips to move through it', /Section 1 of/.test(await page.$eval('#pvFrame', e => e.textContent)) && (await page.$$eval('[data-pvsec]', b => b.length)) > 1 && !!(await page.$('#pvFrame [data-ans]')));
  await page.click('[data-pvsec="1"]');
  await page.waitForTimeout(200);
  ok('a section chip moves the frame to that section', /Section 2 of/.test(await page.$eval('#pvFrame', e => e.textContent)));
  await page.click('[data-pvmode="record"]');
  await page.waitForTimeout(200);
  ok('One of our applicants lists them with a search, and asks to pick one', (await page.$$eval('[data-pvcand]', b => b.length)) >= 3 && /Pick an applicant above/.test(await page.$eval('#main', e => e.textContent)));
  await page.fill('#pvQ', 'tom');
  await page.waitForTimeout(200);
  ok('search narrows the list', (await page.$$eval('[data-pvcand]', b => b.length)) === 1);
  await page.click('[data-pvcand="cd_tom"]');
  await page.waitForSelector('#pvFrame');
  const rec = sent.filter(b => b.fn === 'portalViewAs').pop();
  ok('picking one asks for that record and shows their dashboard', rec.args[2].candidateId === 'cd_tom' && /Tom Volunteer/.test(await page.$eval('#pvFrame', e => e.textContent)) && /Seeing what Tom Volunteer sees/.test(await page.$eval('.pvBar', e => e.textContent)));
  ok('a volunteer has four tabs — no Metrics', (await page.$$eval('#applicantNav [data-pvaview]', bs => bs.map(b => b.getAttribute('data-pvaview')).join())) === 'status,team,strengths,resources');
  await page.click('#toCrm');
  await page.waitForSelector('.trow');
  await page.click('[data-open="cd_anna"]');
  await page.waitForSelector('#panel');
  ok('the record panel has View as this applicant', !!(await page.$('#viewAsCand')));
  await page.click('#viewAsCand');
  await page.waitForSelector('#pvFrame');
  ok('which opens the preview on that applicant', /Anna Example/.test(await page.$eval('#pvFrame', e => e.textContent)) && (await page.$eval('[data-pvmode="record"]', b => b.classList.contains('on'))));
  await ctx.close();
}

/* ---------- Accounts, portal admins ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('.trow');
  ok('a portal admin has Accounts in the ☰ menu', !!(await page.$('#navMenu')));
  if(!(await page.$('#toAccounts'))){ await page.click('#navMenu'); await page.waitForSelector('#toAccounts'); }
  await page.click('#toAccounts');
  await page.waitForSelector('[data-acc]');
  ok('Accounts lists every applicant account with who, what and where the application is', (await page.$$eval('[data-acc]', r => r.length)) === 2 && /@anna\.b/.test(await page.$eval('[data-acc="st_anna"]', e => e.textContent)) && /DTS/.test(await page.$eval('[data-acc="st_anna"]', e => e.textContent)) && /Accepted/.test(await page.$eval('[data-acc="st_team"]', e => e.textContent)));
  await page.fill('#accQ', 'grace');
  await page.waitForTimeout(200);
  ok('search narrows the list', (await page.$$eval('[data-acc]', r => r.length)) === 1);
  await page.fill('#accQ', '');
  await page.waitForTimeout(200);
  await page.click('[data-acc="st_anna"]');
  await page.waitForSelector('#accPanel');
  ok('opening one shows an edit panel prefilled, a link to the application, a new-PIN field and Delete', (await page.$eval('#acc_name', i => i.value)) === 'Anna Example' && (await page.$eval('#acc_user', i => i.value)) === 'anna.b' && (await page.$eval('#acc_country', i => i.value)) === 'Sweden' && !!(await page.$('#accOpenApp')) && !!(await page.$('#acc_pin')) && !!(await page.$('#accDelete')));
  await page.fill('#acc_name', 'Anna Exemplar');
  await page.fill('#acc_pin', '12');
  await page.click('#accSave');
  await page.waitForTimeout(200);
  ok('a short PIN is refused before sending', !sent.some(b => b.fn === 'portalUpdateAccount'));
  await page.fill('#acc_pin', '4321');
  await page.click('[data-accmsgr="telegram"]');
  await page.waitForTimeout(150);
  await page.click('#accSave');
  await page.waitForTimeout(400);
  const ua = sent.find(b => b.fn === 'portalUpdateAccount');
  ok('Save sends the edited fields and the new PIN to portalUpdateAccount', ua && ua.args[2] === 'st_anna' && ua.args[3].name === 'Anna Exemplar' && ua.args[3].messenger === 'telegram' && ua.args[3].newPin === '4321');
  ok('and the list shows the new name', /Anna Exemplar/.test(await page.$eval('[data-acc="st_anna"]', e => e.textContent)));
  await page.click('#accOpenApp');
  await page.waitForSelector('#panel');
  ok('Open the application jumps to that record on the Applications side', /Anna/.test(await page.$eval('#panel h2', e => e.textContent)));
  if(!(await page.$('#toAccounts'))){ await page.click('#navMenu'); await page.waitForSelector('#toAccounts'); }
  await page.click('#toAccounts');
  await page.waitForSelector('[data-acc]');
  await page.click('#accAdd');
  await page.waitForSelector('#accPanel');
  ok('Add shows the what-for picker and the account fields, no campus picker while only Siem Reap is open', (await page.$$eval('[data-acccampus]', b => b.length)) === 0 && (await page.$$eval('[data-accpick]', b => b.map(x => x.getAttribute('data-accpick')).join(','))) === 'dts,dbs,bcs,sms,staff,volunteer,team' && /4-digit PIN/.test(await page.$eval('#accPanel', e => e.textContent)));
  await page.click('[data-accpick="dbs"]');
  await page.waitForTimeout(150);
  await page.fill('#acc_name', 'Made Person');
  await page.fill('#acc_user', 'Made.X');
  await page.fill('#acc_email', 'made@example.org');
  await page.fill('#acc_phone', '+47 123 456');
  await page.selectOption('#acc_country', 'Norway');
  await page.fill('#acc_pin', '2468');
  await page.click('#accSave');
  await page.waitForTimeout(400);
  const ca = sent.find(b => b.fn === 'portalCreateApplicant');
  ok('Create sends the same payload as sign-up, on the admin’s behalf', ca && ca.args[2].username === 'made.x' && ca.args[2].pin === '2468' && ca.args[2].type === 'student' && ca.args[2].school === 'dbs' && ca.args[2].campus === 'siemreap' && ca.args[2].country === 'Norway');
  ok('the new account tops the list and stays open for edits', (await page.$$eval('[data-acc]', r => r.length)) === 3 && (await page.$eval('#acc_name', i => i.value)) === 'Made Person' && !(await page.$('[data-accpick]')));
  await ctx.close();
}

ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
