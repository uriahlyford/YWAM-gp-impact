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
let ANNA = { id: 'cd_anna', name: 'Anna Example', type: 'student', school: 'dts', stage: 'new', status: 'draft', submittedAt: null, updated: '2026-09-20T10:00:00Z', archived: null, steps: STEPS('form') };
const ME_APP = { id: 'st_anna', name: 'Anna Example', username: 'anna.b', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', type: 'student', school: 'dts' };
const STAFF = [{ id: 'st_dara', name: 'Dara Pen', username: 'dara', campus: 'siemreap', isAdmin: false, portalAdmin: false, portalStaff: true, role: 'portal-staff' }, { id: 'st_sina', name: 'Sina Sok', username: 'sina', campus: 'siemreap', isAdmin: false, portalAdmin: true, portalStaff: false, role: 'portal-admin' }];
let CANDS = [
  { id: 'cd_anna', campus: 'siemreap', name: 'Anna Example', type: 'student', school: 'dts', stage: 'applied', status: 'pending', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', country: 'Sweden', source: 'portal', assignedTo: '', nextStep: '', nextDate: '', staffId: 'st_anna', hasAccount: true, updated: '2026-09-20T10:00:00Z', log: [{ at: '2026-09-19T09:00:00Z', by: 'st_anna', kind: 'stage', text: 'new' }], archived: null, portal: { createdAt: '2026-09-19' } },
  { id: 'cd_tom', campus: 'siemreap', name: 'Tom Volunteer', type: 'volunteer', school: '', stage: 'contacted', status: 'in_review', email: 'tom@example.org', phone: '+1 555 000 1111', messenger: 'telegram', country: 'United States', source: 'portal', assignedTo: 'st_dara', nextStep: 'Video call', nextDate: '2026-09-30', staffId: 'st_tom', hasAccount: true, updated: '2026-09-21T10:00:00Z', log: [], archived: null },
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
      if (u === 'anna.b' && pin === '2468') out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA };
      else if (u === 'dara' && pin === '1234') out = { ok: true, role: 'portal-staff', me: STAFF[0], applicants: CANDS, staff: STAFF, stages: ['new', 'contacted', 'applied', 'interview', 'accepted', 'practical', 'arrived'], types: ['student', 'staff', 'volunteer', 'team'], schools: ['dts', 'dbs', 'bcs', 'sms'] };
      else if (u === 'bopha' && pin === '1234') out = { ok: false, err: 'not_authorized' };
      else out = { ok: false, err: 'auth' };
    } else if (b.fn === 'portalUpdateContact') {
      const p = b.args[2]; Object.assign(ME_APP, { phone: p.phone, messenger: p.messenger, country: p.country || ME_APP.country });
      out = { ok: true, role: 'applicant', me: ME_APP, application: ANNA };
    } else if (b.fn === 'hrSaveCandidate') {
      const c = b.args[2]; CANDS = CANDS.map(x => x.id === c.id ? { ...x, ...c, log: x.log.concat(x.stage !== c.stage ? [{ at: new Date().toISOString(), by: u === 'dara' ? 'st_dara' : 'x', kind: 'stage', text: c.stage }] : []) } : x);
      out = { ok: true, candidate: CANDS.find(x => x.id === c.id) };
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
  ok('the front door names the portal and offers what to apply for', /YWAM GP Portal/.test(await page.$eval('#main', e => e.textContent)) && (await page.$$eval('[data-apply]', b => b.length)) === 7);
  ok('the seven choices are the four schools, staff, volunteer and team', (await page.$$eval('[data-apply]', b => b.map(x => x.getAttribute('data-apply')).join(','))) === 'dts,dbs,bcs,sms,staff,volunteer,team');
  ok('no horizontal scroll on a phone', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await page.click('[data-apply="volunteer"]');
  await page.waitForTimeout(150);
  ok('tapping a choice opens sign-up with it picked', /Create your account/.test(await page.$eval('#main', e => e.textContent)) && (await page.$eval('[data-pick="volunteer"]', b => b.classList.contains('on'))));
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
  ok('sign-up sends what the server needs — type, school, phone, messenger', reg && reg.args[0].type === 'student' && reg.args[0].school === 'dts' && reg.args[0].messenger === 'whatsapp' && reg.args[0].phone === '+46 70 000 0000' && reg.args[0].username === 'anna.b');
  ok('and lands on the dashboard: draft, applying for DTS', /Not submitted yet/.test(await page.$eval('#statusPill', e => e.textContent)) && /DTS/.test(await page.$eval('#main', e => e.textContent)));
  ok('the session is remembered under the portal’s own key, not the staff app’s', await page.evaluate(() => !!localStorage.getItem('gp-portal') && !localStorage.getItem('gp-staff')));
  const steps = await page.$$eval('#timeline .step', s => s.map(x => x.getAttribute('data-step') + ':' + (x.classList.contains('done') ? 'done' : x.classList.contains('current') ? 'current' : 'todo')));
  ok('the timeline has nine steps, account done and "fill out" current', steps.length === 9 && steps[0] === 'account:done' && steps[1] === 'form:current' && steps.slice(2).every(s => /todo$/.test(s)), steps.join(' '));
  ok('documents & reference show as pending sub-items', (await page.$$eval('#timeline .subItems li', li => li.length)) === 2);
  ok('the form card says it opens soon, with nothing to press', /opens here soon/i.test(await page.$eval('#main', e => e.textContent)) && await page.$eval('#main .btn[disabled]', b => !!b));
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

/* ---------- the staff side ---------- */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, '');
  await page.click('#toLogin');
  await page.fill('#l_user', 'bopha'); await page.fill('#l_pin', '1234'); await page.click('#loginBtn');
  await page.waitForTimeout(400);
  ok('a staff member without portal access is told so and sees no applicants', /No portal access/.test(await page.$eval('#main', e => e.textContent)) && !(await page.$('.trow')));
  await page.click('#outBtn2');
  await page.waitForTimeout(150);
  await page.click('#toLogin');
  await page.fill('#l_user', 'anna.b'); await page.fill('#l_pin', '0000'); await page.click('#loginBtn');
  await page.waitForTimeout(400);
  ok('a wrong PIN stays on sign-in with a message', /Wrong username or PIN/.test(await page.$eval('#msg', e => e.textContent)) && !!(await page.$('#loginBtn')));
  await page.fill('#l_pin', '1234'); await page.fill('#l_user', 'dara'); await page.click('#loginBtn');
  await page.waitForSelector('.trow');
  ok('portal staff land on Applications with every open applicant', /Applications/.test(await page.$eval('#main h1', e => e.textContent)) && (await page.$$eval('.trow', r => r.length)) === 2);
  ok('closed applications are behind the Archived filter', !/Closed Case/.test(await page.$eval('.tbl', e => e.textContent)));
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

ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
