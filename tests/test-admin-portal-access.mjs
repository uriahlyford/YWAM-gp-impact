/* Admin → Portal access in the browser: the card on the Admin home, one
   campus at a time, a row per staff member with two ticks — portal staff and
   portal admin — each saving through adminUpdateStaff; app admins are shown
   as always having both; applicant accounts never appear (the server leaves
   them out of adminListStaff). The same two ticks sit on the person page's
   edit form. Everyone here is made up. */
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
await new Promise(r => server.listen(4493, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', mentorStatus: '', isAdmin: false, leads: [], active: true, archived: null, hr: false, portalStaff: false, portalAdmin: false, kind: 'staff' };
const ME = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true };
let staff = [ME,
  { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe', portalStaff: true },
  { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service' },
  { ...base, id: 'st_bopha', name: 'Bopha Kim', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe' }];
const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
const errors = [], sent = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); sent.push(b); let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: staff, logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true },
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: {}, okrs: [], survey: [], metricOverrides: [] } };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'adminListStaff') out = { ok: true, staff };
  else if (b.fn === 'adminUpdateStaff') { const p = b.args[3]; staff = staff.map(s => s.id === b.args[2] ? { ...s, ...p } : s); out = { ok: true, staff: staff.find(s => s.id === b.args[2]) }; }
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await page.goto('http://localhost:4493/teams.html', { waitUntil: 'load' });
await page.waitForSelector('nav.bottom [data-tab="week"]', { timeout: 15000 });
await page.waitForTimeout(800);
await page.evaluate(() => { S.view = 'admin'; S.adminSub = 'home'; render(); });
await page.waitForSelector('[data-adminsub="portal"]', { timeout: 10000 });
ok('the Admin home has a Portal access card', /Portal access/.test(await page.$eval('[data-adminsub="portal"]', e => e.textContent)));
await page.click('[data-adminsub="portal"]');
await page.waitForSelector('[data-portalstaff]', { timeout: 10000 });
ok('it opens on the admin’s own campus with its people', (await page.$$eval('[data-adminportalcampus]', c => c.find(x => x.classList.contains('on')).getAttribute('data-adminportalcampus'))) === 'siemreap' && (await page.$$eval('.portalRow', r => r.length)) === 3);
ok('with a link to open the portal', await page.$eval('#main a[href="portal.html"]', a => !!a));
ok('the admin is shown as having both, untickable', await page.$eval('[data-portalstaff="st_admin"]', c => c.checked && c.disabled) && await page.$eval('[data-portaladmin="st_admin"]', c => c.checked && c.disabled));
ok('existing portal staff are ticked, others not', await page.$eval('[data-portalstaff="st_dara"]', c => c.checked) && await page.$eval('[data-portalstaff="st_sina"]', c => !c.checked));
ok('people with access sort to the top', (await page.$$eval('.portalRow .rowName', n => n.map(x => x.textContent.trim().split(' ')[0]).join(','))) === 'Uriah,Dara,Sina');
await page.check('[data-portalstaff="st_sina"]');
await page.waitForTimeout(400);
const grant = sent.filter(b => b.fn === 'adminUpdateStaff').pop();
ok('ticking Portal staff saves that one flag through adminUpdateStaff', grant && grant.args[2] === 'st_sina' && JSON.stringify(grant.args[3]) === '{"portalStaff":true}');
ok('and the row stays ticked after the re-render', await page.$eval('[data-portalstaff="st_sina"]', c => c.checked));
await page.check('[data-portaladmin="st_sina"]');
await page.waitForTimeout(400);
const adm = sent.filter(b => b.fn === 'adminUpdateStaff').pop();
ok('ticking Portal admin saves portalAdmin', adm && adm.args[2] === 'st_sina' && JSON.stringify(adm.args[3]) === '{"portalAdmin":true}');
await page.uncheck('[data-portalstaff="st_dara"]');
await page.waitForTimeout(400);
const revoke = sent.filter(b => b.fn === 'adminUpdateStaff').pop();
ok('unticking revokes', revoke && revoke.args[2] === 'st_dara' && JSON.stringify(revoke.args[3]) === '{"portalStaff":false}');
ok('the count chip follows', /Siem Reap · 1/.test(await page.$eval('[data-adminportalcampus="siemreap"]', e => e.textContent)));
await page.click('[data-adminportalcampus="poipet"]');
await page.waitForTimeout(200);
ok('Poipet shows its own people', (await page.$$eval('.portalRow .rowName', n => n.map(x => x.textContent.trim()).join(','))) === 'Bopha Kim');
// person page carries the same ticks in its edit form
await page.click('.portalWho[data-adminperson="st_bopha"]');
await page.waitForTimeout(300);
await page.evaluate(() => { S.adminEditId = 'st_bopha'; render(); });
await page.waitForSelector('#adm_portalstaff');
ok('the person page’s edit form has both ticks too', !!(await page.$('#adm_portalstaff')) && !!(await page.$('#adm_portaladmin')));
await page.check('#adm_portalstaff');
await page.click('[data-adminsave="st_bopha"]');
await page.waitForTimeout(400);
const saved = sent.filter(b => b.fn === 'adminUpdateStaff').pop();
ok('saving the form sends portalStaff along with the rest', saved && saved.args[2] === 'st_bopha' && saved.args[3].portalStaff === true && saved.args[3].portalAdmin === false);
ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
