/* Drive the four entry states end to end: welcome gate, guest (locked tabs),
   signed-in (unlocked + own campus), and the Teams page's new logo/loader. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const OUT = tmpDir('out') + '/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

const P = 'poipet', S = 'siemreap';
const e = { [P]: {}, [S]: {} };
const put = (c, d, m, k, w) => { e[c][d + '|' + m + '|' + k] = w; };
put(P, 'Leadership Development', 'DTS', 'Students Enrolled', { 1: 20, 2: 22 });
put(P, 'Leadership Development', 'DTS', 'Students Graduated', { 3: 21 });
put(P, 'Community Service', 'GP Education', 'Schools', { 1: 2 });
put(P, 'Community Service', 'GP Education', 'Students Enrolled', { 1: 80, 2: 85 });
put(P, 'Youth Education', 'YDC', 'Youth Enrolled', { 1: 40, 2: 44 });
put(P, 'Community Service', 'Outreach Teams', 'Teams Hosted', { 1: 1, 2: 2 });
put(P, 'Community Service', 'Outreach Teams', 'Volunteers Mobilized', { 1: 8, 2: 15 });
put(P, 'Community Service', 'Outreach Teams', 'Community Service Hours', { 1: 6, 2: 10 });
put(P, 'Community Service', 'Outreach Teams', 'Salvations', { 1: 3, 2: 5 });
put(P, 'Community Service', 'Outreach Teams', 'People Served', { 1: 120, 2: 200 });
put(P, 'Leadership Development', 'Church Partnerships', 'Partner Churches Supported', { 1: 4, 3: 5 });
put(P, 'Leadership Development', 'Church Partnerships', 'Churches Being Led', { 1: 2, 3: 3 });
put(P, 'Base Leadership', 'Campus Leadership', 'Total Staff', { 1: 12 });
put(S, 'Base Leadership', 'Campus Leadership', 'Total Staff', { 1: 9 });
put(S, 'Youth Education', 'YDC', 'Youth Enrolled', { 1: 60 });

const ME = { id: 'st1', name: 'Sokha Chan', username: 'sokha', campus: S, dept: 'Community Service', ministry: 'Outreach Teams', photo: '' };
const DATA = {
  leader: false, entries: e, okrs: [],
  survey: [{ campus: P, week: 2, device: 'x', lonely: 3, clarity: 8, growth: 7, porn: false, oneOnOne: true, exercise: true, quietTime: true, debt: false, sharedFaith: true, sabbath: true }]
};

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
// Port 0: let the OS pick, so this never collides with another suite running.
await new Promise(r => server.listen(0, r));
const BASE = 'http://127.0.0.1:' + server.address().port;

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
async function newPage() {
  const page = await browser.newPage({ viewport: { width: 430, height: 1000 }, deviceScaleFactor: 2 });
  page.on('pageerror', err => errors.push('PAGEERROR ' + err));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION_RESET|ERR_FAILED|fonts\.googleapis/.test(m.text())) errors.push('console: ' + m.text()); });
  // Every other browser test in this suite blocks the real Google Fonts request
  // rather than let it hit the network — this one didn't, so whatever error
  // code that request happens to fail with in a given environment (a reset here,
  // a cert error there) could slip past the console filter above.
  await page.route('**fonts.g**', route => route.abort());
  await page.route('**/.netlify/functions/api', route => {
    const body = JSON.parse(route.request().postData() || '{}');
    let out = DATA;
    if (body.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: [ME],
      logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
      trips: { ok: true, trips: [], totals: {}, reasons: { work: ['a'], personal: ['b'] }, hasMentor: false },
      tripRequests: [], ministry: null, base: DATA };
    else     if (body.fn === 'teamRoster') out = [ME];
    else if (body.fn === 'staffLogin') out = { ok: true, staff: ME, profile: {} };
    else if (/^getMy/.test(body.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  return page;
}

/* ---- 1. welcome gate: no session, no guest choice ---- */
let page = await newPage();
await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
await page.waitForSelector('.welcome', { timeout: 8000 });
console.log('1. WELCOME GATE');
console.log('   buttons: ' + (await page.$$eval('.welcome button', b => b.map(x => x.textContent.trim()))).join(' | '));
console.log('   logo painted: ' + await page.$eval('.wLogo', i => i.src.startsWith('data:image/png') && i.naturalWidth > 0));
console.log('   nav hidden: ' + await page.$eval('#nav', n => n.innerHTML === ''));
console.log('   dashboard leaked behind gate: ' + await page.evaluate(() => !!document.querySelector('.hero')));
await page.screenshot({ path: OUT + 'gate.png', fullPage: true });

/* ---- 2. view as guest: dashboard visible, write tabs locked ---- */
await page.click('#wGuest');
await page.waitForSelector('.hero', { timeout: 8000 });
await page.waitForTimeout(900);
console.log('\n2. GUEST');
console.log('   tabs: ' + (await page.$$eval('#nav button', b => b.map(x => x.textContent.trim()))).join(' | '));
console.log('   hero label: ' + await page.$eval('.heroLabel', x => x.textContent));
console.log('   hero number: ' + await page.$eval('.heroNum', x => x.textContent));
console.log('   hero sub: ' + await page.$eval('.heroSub', x => x.textContent.trim().replace(/\s+/g, ' ')));
await page.screenshot({ path: OUT + 'guest-dash.png', fullPage: true });
await page.click('[data-view="log"]');
await page.waitForTimeout(500);
console.log('   log view gated: ' + await page.evaluate(() => !!document.querySelector('.gate')));
console.log('   log form present: ' + await page.evaluate(() => !!document.querySelector('#deptSel')));
console.log('   gate heading: ' + await page.$eval('.gate h3', x => x.textContent));
await page.screenshot({ path: OUT + 'guest-gate.png', fullPage: true });
console.log('   no Health tab on the dashboard: ' + await page.evaluate(() =>
  !document.querySelector('[data-view="health"]')));
await page.click('[data-view="okr"]');
await page.waitForTimeout(500);
console.log('   OKRs still readable for guests: ' + await page.evaluate(() => !document.querySelector('.gate')));
await page.close();

/* ---- 3. signed in: tabs unlocked, campus defaults to mine (Siem Reap) ---- */
page = await newPage();
await page.addInitScript(() => {
  localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
  localStorage.setItem('gp-staff-card', JSON.stringify({ name: 'Sokha Chan', photo: '', ministry: 'Outreach Teams', campus: 'siemreap' }));
  sessionStorage.setItem('gp-skip-teams', '1');   // stay on the dashboard
});
await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
await page.waitForSelector('.hero', { timeout: 8000 });
await page.waitForTimeout(800);
console.log('\n3. SIGNED IN');
console.log('   tabs: ' + (await page.$$eval('#nav button', b => b.map(x => x.textContent.trim()))).join(' | '));
console.log('   padlocks: ' + await page.evaluate(() => document.querySelectorAll('.navLock').length));
console.log('   campus selected: ' + await page.$eval('#campusRow .cbtn.on', b => b.textContent.trim()));
await page.click('[data-view="log"]');
await page.waitForTimeout(600);
console.log('   log form reachable: ' + await page.evaluate(() => !!document.querySelector('#deptSel')));
console.log('   log form campus: ' + await page.$eval('#campusRow .cbtn.on', b => b.textContent.trim()));
await page.close();

/* ---- 4. teams page: real logo, spinning boot coin ---- */
page = await newPage();
let bootSeen = false;
// drop newPage()'s handler first, so this slower one is unambiguously the one used
await page.unroute('**/.netlify/functions/api');
await page.route('**/.netlify/functions/api', async route => {
  const body = JSON.parse(route.request().postData() || '{}');
  // the boot call is what a remembered session makes, so hold THAT to see the loader
  if (body.fn === 'getMyBoot' || body.fn === 'staffLogin') await new Promise(r => setTimeout(r, 1500));
  let out = DATA;
  if (body.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: [ME],
    logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, reasons: { work: ['a'], personal: ['b'] }, hasMentor: false },
    tripRequests: [], ministry: null, base: DATA };
  else if (body.fn === 'teamRoster') out = [ME];
  else if (body.fn === 'staffLogin') out = { ok: true, staff: ME, profile: {} };
  else if (/^getMy/.test(body.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => {
  localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
});
await page.goto(BASE + '/teams.html', { waitUntil: 'commit' });
await page.waitForSelector('.loadingBox', { timeout: 5000 }).then(() => { bootSeen = true; }).catch(() => {});
console.log('\n4. TEAMS PAGE');
console.log('   "Impact Loading" coin shown while waiting: ' + bootSeen);
if (bootSeen) {
  // The coin is written by JS once logo.js is in, so it carries no id of its own.
  console.log('   boot logo is the real PNG: ' + await page.$eval('.loadCoin img', i => i.src.startsWith('data:image/png') && i.naturalWidth > 0));
  console.log('   loader text: ' + await page.$eval('.loadText', x => x.textContent.trim()));
  await page.screenshot({ path: OUT + 'teams-loading.png' });
}
console.log('   header logo is the real PNG: ' + await page.$eval('#brandLogo', i => i.src.startsWith('data:image/png') && i.naturalWidth > 0));
console.log('   ptr coin logo set: ' + await page.$eval('#ptrLogo', i => i.src.startsWith('data:image/png')));
await page.waitForSelector('nav.bottom button', { timeout: 12000 });
await page.waitForTimeout(700);
console.log('   signed-in home rendered, tabs: ' + (await page.$$eval('nav.bottom button', b => b.map(x => x.textContent.trim()))).join(' | '));
await page.screenshot({ path: OUT + 'teams-home.png', fullPage: true });

/* ---- 5. teams?reg=1 opens the create form ---- */
const p5 = await newPage();
await p5.goto(BASE + '/teams.html?reg=1', { waitUntil: 'networkidle' });
await p5.waitForTimeout(700);
console.log('\n5. ?reg=1 opens create form: ' + await p5.evaluate(() => !!document.querySelector('#r_user')));
console.log('   heading: ' + await p5.$eval('h2', x => x.textContent.trim()));
await p5.screenshot({ path: OUT + 'teams-reg.png', fullPage: true });

console.log('\nERRORS: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
await browser.close();
server.close();
process.exit(errors.length ? 1 : 0);
