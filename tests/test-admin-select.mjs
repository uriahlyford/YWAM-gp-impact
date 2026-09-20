/* Admin → All accounts: tapping a staff row.

   The row opens by rebuilding the Admin page, and that rebuild used to
   come back with the search box empty and every account showing again —
   the person you had just searched for dropped back into the full list,
   which read as "when I select a staff it bugs". The search now survives
   the rebuild, the filter is re-applied, and the opened row is on screen. */
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
await new Promise(r => server.listen(4495, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], active: true };
const ME = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true };
const staff = [ME];
for (let i = 0; i < 14; i++) staff.push({ ...base, id: 'st_' + i, name: 'Person ' + i, username: 'p' + i, dept: 'Community Service', ministry: 'Cafe', role: '' });

const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 700 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: staff, logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: {}, okrs: [], survey: [], metricOverrides: [] } };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'adminListStaff') out = { ok: true, staff };
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await page.goto('http://localhost:4495/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(600);
await page.evaluate(() => { S.view = 'admin'; render(); });
await page.waitForTimeout(700);
await page.click('[data-admincampustab="siemreap"]');
await page.waitForTimeout(500);

const visible = () => page.evaluate(() => [].filter.call(document.querySelectorAll('[data-adminrow]'), r => r.style.display !== 'none').map(r => r.querySelector('[data-acc]').getAttribute('data-acc')));
ok('every Siem Reap account is listed', (await visible()).length === 15, (await visible()).length);
await page.fill('#adminSearch', 'person 1');
await page.waitForTimeout(200);
const narrowed = await visible();
ok('typing narrows the list without a rebuild', narrowed.length === 5 && narrowed.includes('st_1') && narrowed.includes('st_12'), narrowed.join(','));

await page.click('[data-acc="st_12"][data-accbucket="adminAcc"]');
await page.waitForTimeout(600);
const after = await page.evaluate(() => ({
  search: document.querySelector('#adminSearch').value,
  open: [].map.call(document.querySelectorAll('.accRow.open [data-acc]'), b => b.getAttribute('data-acc')),
  body: !!document.querySelector('[data-adminedit="st_12"]'),
  onScreen: (function () { const r = document.querySelector('[data-acc="st_12"]').getBoundingClientRect(); return r.top >= 0 && r.top < window.innerHeight; })(),
}));
ok('tapping a row opens it, and only it', after.open.length === 1 && after.open[0] === 'st_12' && after.body, after.open.join(','));
ok('the search survives the rebuild', after.search === 'person 1', JSON.stringify(after.search));
ok('and the list stays narrowed to the search', (await visible()).length === 5, (await visible()).length);
ok('the opened row is on screen', after.onScreen);

await page.click('[data-acc="st_10"][data-accbucket="adminAcc"]');
await page.waitForTimeout(600);
const second = await page.evaluate(() => [].map.call(document.querySelectorAll('.accRow.open [data-acc]'), b => b.getAttribute('data-acc')));
ok('tapping another row closes the first — one open at a time', second.length === 1 && second[0] === 'st_10', second.join(','));
await page.click('[data-acc="st_10"][data-accbucket="adminAcc"]');
await page.waitForTimeout(500);
ok('tapping the open row again closes it', (await page.evaluate(() => document.querySelectorAll('.accRow.open').length)) === 0);
await page.fill('#adminSearch', '');
await page.waitForTimeout(200);
ok('clearing the search shows everyone again', (await visible()).length === 15);
await page.click('[data-admincampustab="poipet"]');
await page.waitForTimeout(400);
await page.click('[data-admincampustab="siemreap"]');
await page.waitForTimeout(400);
ok('switching campus tabs keeps working', (await visible()).length === 15);
ok('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
