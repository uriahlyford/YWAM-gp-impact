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
const FORMS = { dts: { ...FORM, isDefault: true }, dbs: { ...FORM, key: 'dbs' }, bcs: { ...FORM, key: 'bcs' }, sms: { ...FORM, key: 'sms' }, staff: { ...FORM, key: 'staff' }, volunteer: { ...FORM, key: 'volunteer' }, team: { ...FORM, key: 'team' }, reference: REF_FORM };
let ANNA = { id: 'cd_anna', name: 'Anna Example', type: 'student', school: 'dts', stage: 'new', status: 'draft', submittedAt: null, updated: '2026-09-20T10:00:00Z', archived: null, steps: STEPS('form'), campus: 'siemreap', audience: 'international', needsVisa: true, refNeeded: true, formKey: 'dts', visa: {}, answers: {}, draftAt: null };
const ME_APP = { id: 'st_anna', name: 'Anna Example', username: 'anna.b', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', type: 'student', school: 'dts' };
const STAFF = [{ id: 'st_dara', name: 'Dara Pen', username: 'dara', campus: 'siemreap', isAdmin: false, portalAdmin: false, portalStaff: true, role: 'portal-staff' }, { id: 'st_sina', name: 'Sina Sok', username: 'sina', campus: 'siemreap', isAdmin: false, portalAdmin: true, portalStaff: false, role: 'portal-admin' }];
let ACCOUNTS = [
  { id: 'st_anna', username: 'anna.b', name: 'Anna Example', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', campus: 'siemreap', type: 'student', school: 'dts', candidateId: 'cd_anna', stage: 'new', status: 'draft', created: '2026-09-20T10:00:00Z' },
  { id: 'st_team', username: 'team.au', name: 'Grace Team', email: 'team@example.org', phone: '+61 400 000 000', messenger: 'telegram', country: 'Australia', campus: 'siemreap', type: 'team', school: '', candidateId: 'cd_team', stage: 'accepted', status: 'accepted', created: '2026-09-01T10:00:00Z' }
];
let CANDS = [
  { id: 'cd_anna', campus: 'siemreap', name: 'Anna Example', type: 'student', school: 'dts', stage: 'applied', status: 'pending', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', source: 'portal', assignedTo: '', nextStep: '', nextDate: '', staffId: 'st_anna', hasAccount: true, refNeeded: true, reference: { status: 'none' }, updated: '2026-09-20T10:00:00Z', log: [{ at: '2026-09-19T09:00:00Z', by: 'st_anna', kind: 'stage', text: 'new' }], archived: null, audience: 'international', needsVisa: true, refNeeded: true, formKey: 'dts', portal: { createdAt: '2026-09-19', submittedAt: '2026-09-20T10:00:00Z', form: { answers: { dob: '1999-05-05', gender: 'Female', leaderContact: '+46 1', testimony: 'Long story', gifts: ['Music'] } } } },
  { id: 'cd_tom', campus: 'siemreap', name: 'Tom Volunteer', type: 'volunteer', school: '', stage: 'contacted', status: 'in_review', email: 'tom@example.org', phone: '+1 555 000 1111', messenger: 'telegram', country: 'United States', source: 'portal', assignedTo: 'st_dara', nextStep: 'Video call', nextDate: '2026-09-30', staffId: 'st_tom', hasAccount: true, refNeeded: true, reference: { status: 'received', receivedAt: '2026-09-22T10:00:00Z', leaderName: 'Pastor Example', leaderEmail: 'pastor@example.org', answers: { leaderName: 'Pastor Example', leaderEmail: 'pastor@example.org', recommend: 'Highly recommend' } }, updated: '2026-09-21T10:00:00Z', log: [], archived: null, audience: 'international', needsVisa: true, refNeeded: true, formKey: 'volunteer' },
  { id: 'cd_pp', campus: 'poipet', name: 'Poipet Person', type: 'student', school: 'dbs', stage: 'new', status: 'draft', email: '', phone: '+855 11 222 333', messenger: 'telegram', country: 'Cambodia', source: 'portal', assignedTo: '', staffId: 'st_pp', hasAccount: true, updated: '2026-09-18T10:00:00Z', log: [], archived: null },
  { id: 'cd_team', campus: 'siemreap', name: 'Grace Church Team', type: 'team', school: '', stage: 'new', status: 'draft', email: 'team@example.org', phone: '+61 400 000 000', messenger: 'whatsapp', country: 'Australia', source: 'portal', assignedTo: '', staffId: 'st_team', hasAccount: true, updated: '2026-09-17T10:00:00Z', log: [], archived: null },
  { id: 'cd_old', campus: 'siemreap', name: 'Closed Case', type: 'staff', school: '', stage: 'new', status: 'closed', email: '', phone: '', messenger: '', country: '', source: 'hr', assignedTo: '', staffId: '', hasAccount: false, updated: '2026-08-01T10:00:00Z', log: [], archived: { at: '2026-08-02', reason: 'Withdrew' } }
];
const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [], sent = [];
async function open(viewport, query, seed) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b); let out = { ok: false };
    const [u, pin] = b.args || [];
    if (b.fn === 'portalRegister') {
      const p = b.args[0];
      out = p.username === 'taken' ? { ok: false, err: 'taken' } : { ok: true, role: 'applicant', me: { ...ME_APP, name: p.name, username: p.username, phone: p.phone, messenger: p.messenger, type: p.type, school: p.school }, application: { ...ANNA, type: p.type, school: p.school } };
    } else if (b.fn === 'portalBoot') {
      if (u === 'anna.b' && pin === '2468') out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA, form: FORM };
      else if (u === 'srey.k' && pin === '2468') out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'Srey Khmer', username: 'srey.k', country: 'Cambodia' }, application: { ...ANNA, name: 'Srey Khmer', stage: 'accepted', status: 'accepted', audience: 'khmer', needsVisa: false, refNeeded: false, steps: STEPS('practical').map(s => s.id === 'docs' ? { ...s, items: [{ id: 'documents', done: true }] } : s), submittedAt: '2026-09-01T00:00:00Z' }, form: FORM };
      else if (u === 'team.au' && pin === '2468') out = { ok: true, role: 'applicant', me: { ...ME_APP, name: 'Grace Team', username: 'team.au', country: 'Australia', type: 'team', school: '' }, application: { ...ANNA, type: 'team', school: '', stage: 'accepted', status: 'accepted', refNeeded: false, formKey: 'team', steps: STEPS('practical').map(s => s.id === 'docs' ? { ...s, items: [{ id: 'documents', done: false }] } : s), submittedAt: '2026-09-01T00:00:00Z', visa: { flightsConfirmed: true, invitationSent: false } }, form: { ...FORM, key: 'team' } };
      else if (u === 'dara' && pin === '1234') out = { ok: true, role: 'portal-staff', me: STAFF[0], applicants: CANDS, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'], forms: FORMS };
      else if (u === 'rithy' && pin === '1234') out = { ok: true, role: 'portal-staff', me: { id: 'st_teams', name: 'Rithy Team', username: 'rithy', campus: 'siemreap', role: 'portal-staff' }, applicants: CANDS.filter(c => c.type === 'team'), scope: ['team'], staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'] };
      else if (u === 'sina' && pin === '1234') out = { ok: true, role: 'portal-admin', me: STAFF[1], applicants: CANDS, scope: null, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'], forms: FORMS };
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
    } else if (b.fn === 'portalListAccounts') {
      out = u === 'sina' ? { ok: true, accounts: ACCOUNTS } : { ok: false, err: 'not_authorized' };
    } else if (b.fn === 'portalCreateApplicant') {
      const p = b.args[2];
      if (p.username === 'taken') out = { ok: false, err: 'taken' };
      else { const acc = { id: 'st_' + p.username, username: p.username, name: p.name, email: p.email, phone: p.phone, messenger: p.messenger, country: p.country, campus: p.campus, type: p.type, school: p.school, candidateId: 'cd_' + p.username, stage: 'new', status: 'draft', created: new Date().toISOString() }; ACCOUNTS.unshift(acc); out = { ok: true, account: acc }; }
    } else if (b.fn === 'portalUpdateAccount') {
      const p = b.args[3]; ACCOUNTS = ACCOUNTS.map(a => a.id === b.args[2] ? { ...a, name: p.name, username: p.username, email: p.email, phone: p.phone, messenger: p.messenger, country: p.country } : a);
      out = { ok: true, account: ACCOUNTS.find(a => a.id === b.args[2]) };
    } else if (b.fn === 'portalSetVisaFlags') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, portal: { ...(x.portal || {}), visa: { ...((x.portal || {}).visa || {}), ...b.args[3] } } } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalStaffSaveAnswers') {
      CANDS = CANDS.map(x => x.id === b.args[2] ? { ...x, portal: { ...(x.portal || {}), form: { answers: b.args[3] }, submittedAt: '2026-09-20T10:00:00Z' } } : x); out = { ok: true, candidate: CANDS.find(x => x.id === b.args[2]) };
    } else if (b.fn === 'portalSaveForm') {
      FORMS[b.args[2]] = { ...b.args[3], key: b.args[2], updated: new Date().toISOString() }; delete FORMS[b.args[2]].isDefault; out = { ok: true, form: FORMS[b.args[2]], forms: FORMS };
    } else if (b.fn === 'portalDeleteApplicant') {
      CANDS = CANDS.filter(x => x.id !== b.args[2]);
      out = { ok: true, role: 'portal-admin', me: STAFF[1], applicants: CANDS, scope: null, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], types: [], schools: [], deleted: b.args[2], accountRemoved: true };
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
  ok('Start an application asks where first, opening on Siem Reap', (await page.$$eval('[data-campus]', b => b.map(x => x.getAttribute('data-campus') + (x.classList.contains('on') ? '*' : '')).join(','))) === 'siemreap*,poipet');
  ok('Siem Reap shows the seven choices — the four schools, staff, volunteer and team', (await page.$$eval('[data-apply]', b => b.map(x => x.getAttribute('data-apply')).join(','))) === 'dts,dbs,bcs,sms,staff,volunteer,team');
  ok('the secondary schools say they need a completed DTS, DTS does not', (await page.$$eval('[data-apply]', b => b.filter(x => /Requires a completed DTS/.test(x.textContent)).map(x => x.getAttribute('data-apply')).join(','))) === 'dbs,bcs,sms');
  ok('the schools carry their full names', /Biblical Counseling School/.test(await page.$eval('[data-apply="bcs"]', e => e.textContent)) && /Social Media School/.test(await page.$eval('[data-apply="sms"]', e => e.textContent)));
  await page.click('[data-campus="poipet"]');
  await page.waitForTimeout(150);
  ok('Poipet runs DTS and DBS only, plus staff, volunteer and team', (await page.$$eval('[data-apply]', b => b.map(x => x.getAttribute('data-apply')).join(','))) === 'dts,dbs,staff,volunteer,team');
  await page.click('[data-apply="dbs"]');
  await page.waitForTimeout(150);
  ok('picking DBS at Poipet opens sign-up with Poipet and DBS set', await page.$eval('[data-campus="poipet"]', b => b.classList.contains('on')) && await page.$eval('[data-pick="dbs"]', b => b.classList.contains('on')) && !(await page.$('[data-pick="bcs"]')));
  await page.click('[data-campus="siemreap"]');
  await page.waitForTimeout(150);
  ok('switching campus on sign-up keeps a school both run', await page.$eval('[data-pick="dbs"]', b => b.classList.contains('on')) && !!(await page.$('[data-pick="bcs"]')));
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
  await page.selectOption('#r_country', 'Sweden');
  await page.fill('#r_user', 'anna.b'); await page.fill('#r_pin', '2468'); await page.fill('#r_pin2', '2400');
  await page.click('#regBtn');
  ok('mismatched PINs are stopped', /match/.test(await page.$eval('#msg', e => e.textContent)) && !sent.some(b => b.fn === 'portalRegister'));
  await page.fill('#r_pin2', '2468');
  await page.click('#regBtn');
  await page.waitForSelector('#statusPill', { timeout: 10000 });
  const reg = sent.find(b => b.fn === 'portalRegister');
  ok('sign-up sends what the server needs — campus, type, school, phone, messenger', reg && reg.args[0].campus === 'siemreap' && reg.args[0].type === 'student' && reg.args[0].school === 'dts' && reg.args[0].messenger === 'whatsapp' && reg.args[0].phone === '+46 70 000 0000' && reg.args[0].username === 'anna.b');
  ok('and lands on the dashboard: draft, applying for DTS', /Not submitted yet/.test(await page.$eval('#statusPill', e => e.textContent)) && /DTS/.test(await page.$eval('#main', e => e.textContent)));
  ok('the session is remembered under the portal’s own key, not the staff app’s', await page.evaluate(() => !!localStorage.getItem('gp-portal') && !localStorage.getItem('gp-staff')));
  const steps = await page.$$eval('#timeline .step', s => s.map(x => x.getAttribute('data-step') + ':' + (x.classList.contains('done') ? 'done' : x.classList.contains('current') ? 'current' : 'todo')));
  ok('the timeline has nine steps, account done and "fill out" current', steps.length === 9 && steps[0] === 'account:done' && steps[1] === 'form:current' && steps.slice(2).every(s => /todo$/.test(s)), steps.join(' '));
  ok('documents & reference show as pending sub-items', (await page.$$eval('#timeline .subItems li', li => li.length)) === 2);
  ok('the form card invites them to fill out the application', !!(await page.$('#openForm')) && /Fill out my application/.test(await page.$eval('#openForm', e => e.textContent)));
  // the sign-up mock answers without a form, as the server did before — the page must fetch it, not die
  await page.click('#openForm');
  await page.waitForSelector('#formSubmit, #formNext', { timeout: 5000 });
  ok('Fill out my application straight after sign-up opens the form (fetching it when the sign-up reply had none)', /Section 1 of/.test(await page.$eval('#main', e => e.textContent)) && !/Something went wrong/.test(await page.$eval('#main', e => e.textContent)) && sent.some(b => b.fn === 'portalBoot'));
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
  ok('an international applicant is told the visa guide comes with acceptance, and about the leader reference', /visa for Cambodia/.test(await page.$eval('#main', e => e.textContent)) && /Leader reference/.test(await page.$eval('#main', e => e.textContent)) && !!(await page.$('#refNew')));
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
  ok('a Khmer student sees no visa card and no leader reference', !/e-visa|visa for Cambodia/.test(txt) && !/Leader reference/.test(txt) && (await page.$$eval('#timeline .subItems li', li => li.length)) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'team.au', pin: '2468' })));
  await page.waitForSelector('#statusPill');
  const txt = await page.$eval('#main', e => e.textContent);
  ok('an accepted team gets the e-visa guide, step by step', /Your e-visa, step by step/.test(txt) && /Visa E/.test(txt) && /e-Arrival/.test(txt) && /white sticker/.test(txt));
  ok('with the two ticks staff set — flights confirmed done, letter pending', /✓ Flights confirmed/.test(txt) && /○ Letter of invitation sent to you/.test(txt));
  ok('and the list of what we need from a team', /team photo/i.test(txt) && /passport photo/i.test(txt) && /flight or ticket/i.test(txt));
  ok('a team is told dates and head counts can be estimates, with Edit my answers', /can be estimates/.test(txt) && !!(await page.$('#editAnswersMine')));
  ok('a team has no leader reference step', !/Leader reference/.test(txt));
  await ctx.close();
}

/* ---------- Outreach Teams: teams only ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'rithy', pin: '1234' })));
  await page.waitForSelector('.trow');
  ok('someone on Outreach Teams sees only team applications', (await page.$$eval('.trow', r => r.length)) === 1 && /Grace Church Team/.test(await page.$eval('.tbl', e => e.textContent)) && !/Anna Example|Tom Volunteer/.test(await page.$eval('#main', e => e.textContent)));
  ok('and only the Teams tab — no All, no schools', (await page.$$eval('.whatTab', b => b.map(x => x.getAttribute('data-whatfilter')).join(','))) === 'team' && await page.$eval('[data-whatfilter="team"]', b => b.classList.contains('on')));
  await ctx.close();
}

/* ---------- the staff side ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '');
  await page.fill('#l_user', 'bopha'); await page.fill('#l_pin', '1234'); await page.click('#loginBtn');
  await page.waitForTimeout(400);
  ok('a staff member without portal access is told so and sees no applicants', /No portal access/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('.trow')));
  await page.click('#outBtn2');
  await page.waitForTimeout(150);
  await page.fill('#l_user', 'anna.b'); await page.fill('#l_pin', '0000'); await page.click('#loginBtn');
  await page.waitForTimeout(400);
  ok('a wrong PIN stays on sign-in with a message', /Wrong username or PIN/.test(await page.$eval('#msg', e => e.textContent)) && !!(await page.$('#loginBtn')));
  await page.fill('#l_pin', '1234'); await page.fill('#l_user', 'dara'); await page.click('#loginBtn');
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
  ok('portal staff are offered no Forms button', !(await page.$('#toForms')));
  ok('nor an Accounts button', !(await page.$('#toAccounts')));
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
  ok('a portal admin has a Forms button in the bar', !!(await page.$('#toForms')));
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

/* ---------- Accounts, portal admins ---------- */
{
  const { ctx, page } = await open({ width: 1280, height: 900 }, '', () => localStorage.setItem('gp-portal', JSON.stringify({ user: 'sina', pin: '1234' })));
  await page.waitForSelector('.trow');
  ok('a portal admin has an Accounts button in the bar', !!(await page.$('#toAccounts')));
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
  await page.click('#toAccounts');
  await page.waitForSelector('[data-acc]');
  await page.click('#accAdd');
  await page.waitForSelector('#accPanel');
  ok('Add shows campus and what-for pickers plus the account fields', (await page.$$eval('[data-acccampus]', b => b.length)) === 2 && (await page.$$eval('[data-accpick]', b => b.length)) === 7 && /4-digit PIN/.test(await page.$eval('#accPanel', e => e.textContent)));
  await page.click('[data-acccampus="poipet"]');
  await page.waitForTimeout(150);
  ok('Poipet offers only its two schools plus staff, volunteer, team', (await page.$$eval('[data-accpick]', b => b.map(x => x.getAttribute('data-accpick')).join(','))) === 'dts,dbs,staff,volunteer,team');
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
  ok('Create sends the same payload as sign-up, on the admin’s behalf', ca && ca.args[2].username === 'made.x' && ca.args[2].pin === '2468' && ca.args[2].type === 'student' && ca.args[2].school === 'dbs' && ca.args[2].campus === 'poipet' && ca.args[2].country === 'Norway');
  ok('the new account tops the list and stays open for edits', (await page.$$eval('[data-acc]', r => r.length)) === 3 && (await page.$eval('#acc_name', i => i.value)) === 'Made Person' && !(await page.$('[data-accpick]')));
  await ctx.close();
}

ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
