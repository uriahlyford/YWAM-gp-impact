/* National holidays on the leave pages, in the browser.

   The leave page lists this year's holidays under the 30-day allowance and
   counts a new request without them ("Christmas week not counted — the base
   is closed"); Admin → Leave has the holidays, and an admin can change the
   dated ones (Pchum Ben) and save — everyone is recounted on the server.
   Every name is made up. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const NOW = testNow('2026-10-06');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4491, r));
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const HOLIDAYS = [
  { id: 'kny2026', name: 'Khmer New Year', from: '2026-04-13', to: '2026-04-17', rule: true },
  { id: 'pb2026', name: 'Pchum Ben', from: '2026-10-12', to: '2026-10-14' },
  { id: 'xmas2026', name: 'Christmas week', from: '2026-12-21', to: '2026-12-25', rule: true },
];
const ADMIN = { id: 'st_ad', name: 'Adam Admin', username: 'adam', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', photo: '', mentorId: '', isAdmin: true, leads: [], ministries: [] };
const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
await pinClock(ctx, NOW);
const page = await ctx.newPage();
const errors = [], sent = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
const trips = { ok: true, trips: [], totals: { 2026: { personal: 4, outside: 0, special: 0, trips: 1 } }, ptoCap: 30, holidays: HOLIDAYS, hasMentor: false };
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
  let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ADMIN, profile: {}, roster: [ADMIN], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
    ministry: null, personal: { ok: true, entries: {} }, trips, tripRequests: [], base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] } };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'getMyTrips') out = trips;
  else if (b.fn === 'adminListTrips' || b.fn === 'adminSaveHolidays') out = { ok: true, ptoCap: 30, trips: [], totals: {}, holidays: HOLIDAYS,
    holidaysDated: b.fn === 'adminSaveHolidays' ? b.args[2] : [{ id: 'pb2026', name: 'Pchum Ben', from: '2026-10-12', to: '2026-10-14' }] };
  else if (b.fn === 'getMySchedules') out = { ok: true, week: b.args[2], now: { kitchen: null, chores: null }, next: { kitchen: null, chores: null }, canEdit: {} };
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'adam', pin: '1234' })));
await page.goto('http://localhost:4491/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(500);

await page.evaluate(() => { S.view = 'leave'; render(); });
await page.waitForTimeout(300);
const note = await page.$eval('#holidayNote', e => e.textContent);
ok('the leave page lists this year’s holidays under the allowance', /Khmer New Year/.test(note) && /Pchum Ben/.test(note) && /Christmas week/.test(note) && /Oct 12 – Oct 14/.test(note), note);
await page.fill('#lv_from', '2026-12-14'); await page.dispatchEvent('#lv_from', 'change'); await page.waitForTimeout(150);
await page.fill('#lv_to', '2026-12-25'); await page.dispatchEvent('#lv_to', 'change'); await page.waitForTimeout(200);
ok('a request into Christmas week counts only the open days', (await page.$eval('.workDaysLine b', e => e.textContent)) === '5');
ok('and says why', /Christmas week not counted/.test(await page.$eval('#leaveHolidayHint', e => e.textContent)));
await page.fill('#lv_to', '2026-12-18'); await page.dispatchEvent('#lv_to', 'change'); await page.waitForTimeout(200);
ok('a request clear of the holidays counts every weekday, no note', (await page.$eval('.workDaysLine b', e => e.textContent)) === '5' && !(await page.$('#leaveHolidayHint')));

await page.evaluate(() => { S.view = 'admin'; S.adminSub = 'leave'; render(); });
await page.waitForTimeout(500);
await page.click('[data-acc="holidays"]'); await page.waitForTimeout(200);
ok('Admin → Leave has the holidays, with the dated one editable', /Christmas week/.test(await page.$eval('#adminHolidays', e => e.textContent)) && await page.$eval('[data-hol="0"][data-hf="from"]', i => i.value) === '2026-10-12');
await page.fill('[data-hol="0"][data-hf="from"]', '2026-10-13'); await page.dispatchEvent('[data-hol="0"][data-hf="from"]', 'change');
await page.fill('[data-hol="0"][data-hf="to"]', '2026-10-15'); await page.dispatchEvent('[data-hol="0"][data-hf="to"]', 'change');
await page.click('#holAdd'); await page.waitForTimeout(150);
await page.fill('[data-hol="1"][data-hf="from"]', '2027-10-01'); await page.dispatchEvent('[data-hol="1"][data-hf="from"]', 'change');
await page.fill('[data-hol="1"][data-hf="to"]', '2027-10-03'); await page.dispatchEvent('[data-hol="1"][data-hf="to"]', 'change');
await page.click('#holSave'); await page.waitForTimeout(400);
const sv = sent.filter(b => b.fn === 'adminSaveHolidays').pop();
ok('Save sends the dated holidays, the moved one and next year’s', sv && JSON.stringify(sv.args[2].map(h => [h.name, h.from, h.to])) === JSON.stringify([['Pchum Ben', '2026-10-13', '2026-10-15'], ['Pchum Ben', '2027-10-01', '2027-10-03']]), JSON.stringify(sv && sv.args[2]));
ok('and everyone’s own leave is fetched again', sent.filter(b => b.fn === 'getMyTrips').length >= 1);
ok('no sideways scroll', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
ok('no errors', errors.length === 0, errors.join(' | '));
await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
