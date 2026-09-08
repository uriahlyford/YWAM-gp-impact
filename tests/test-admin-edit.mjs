/* Admin > All accounts > "Fix campus / department / role": reported as
   "it lags and doesn't save what I put in." The edit fields used to read
   straight from the staff record on every render, so anything else on this
   long page re-rendering — expanding a different account's row, approving
   someone, anything — silently reset whatever was typed back to the
   original values. Nothing crashed, so it read as the app randomly
   forgetting input, which is worse than an outright error.

   The fix backs the fields with S.adminEditDraft, updated on input/change
   without calling render() (same reason S.broadcastDraft doesn't), so a
   render triggered elsewhere reconstructs the same in-progress edit instead
   of the stored original. This walks exactly that scenario: type a new
   name, cause an unrelated re-render, and check the name is still there. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

const ME = { id: 'st1', name: 'Uriah Lyford', username: 'uriah', campus: 'poipet', dept: 'Base Leadership',
  ministry: 'Campus Leadership', role: 'Director', photo: '', mentorId: '', staffType: 'campus',
  country: 'United States', isAdmin: true, active: true };
const MATE = { id: 'st2', name: 'Mealea Sok', username: 'mealea', campus: 'poipet', dept: 'Youth Education',
  ministry: 'YDC', role: 'YDC teacher', photo: '', mentorId: '', staffType: 'ministry', country: 'Cambodia',
  isAdmin: false, active: true };
const OTHER = { id: 'st3', name: 'Dara Pen', username: 'dara', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', photo: '', mentorId: '', staffType: 'ministry',
  country: 'Cambodia', isAdmin: false, active: true };
let STAFF = [ME, MATE, OTHER];
let lastAdminUpdatePayload = null;

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4402, r));

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
page.on('pageerror', x => errors.push('PAGEERROR ' + x));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await page.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}');
  let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: STAFF,
    logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false },
    tripRequests: [], ministry: null, base: { entries: {}, okrs: [], survey: [] } };
  else if (b.fn === 'adminListStaff') out = { ok: true, staff: STAFF };
  else if (b.fn === 'adminUpdateStaff') {
    lastAdminUpdatePayload = b.args[3];
    STAFF = STAFF.map(s => s.id === b.args[2] ? { ...s, ...b.args[3] } : s);
    out = { ok: true };
  }
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await page.goto('http://localhost:4402/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(1000);

await page.evaluate(() => { S.view = 'admin'; render(); });
await page.waitForTimeout(800);
console.log('=== ADMIN: EDIT STAFF ===');
ok('admin page loaded (isAdmin gate passed)', await page.evaluate(() => !!document.querySelector('h2')));

// open Mealea's row, then her edit form
await page.evaluate((id) => { S.adminAcc[id] = true; render(); }, MATE.id);
await page.waitForTimeout(400);
await page.click('[data-adminedit="' + MATE.id + '"]');
await page.waitForTimeout(400);

ok('name field prefilled from the real record', await page.$eval('#adm_name', el => el.value) === MATE.name);
ok('campus field prefilled', await page.$eval('#adm_campus', el => el.value) === MATE.campus);
ok('role field prefilled', await page.$eval('#adm_role', el => el.value) === MATE.role);

// type a new name — should NOT re-render (no draft loss, no lag from a full rebuild)
await page.fill('#adm_name', 'Mealea Sok-Chan');
await page.selectOption('#adm_campus', 'siemreap');
await page.waitForTimeout(300);
ok('campus change did not get reverted by anything else', await page.$eval('#adm_campus', el => el.value) === 'siemreap');

// cause an UNRELATED re-render — expand a different staff member's row —
// while Mealea's edit form is still open with unsaved changes in it
await page.evaluate((id) => { S.adminAcc[id] = true; render(); }, OTHER.id);
await page.waitForTimeout(400);

ok('typed name survives an unrelated re-render elsewhere on the page',
  await page.$eval('#adm_name', el => el.value) === 'Mealea Sok-Chan');
ok('changed campus survives an unrelated re-render elsewhere on the page',
  await page.$eval('#adm_campus', el => el.value) === 'siemreap');
ok('edit form is still open (state wasn\'t clobbered either)',
  await page.evaluate(() => !!document.getElementById('adm_name')));

// save, and check what actually went over the wire
await page.click('[data-adminsave="' + MATE.id + '"]');
await page.waitForTimeout(900);
ok('save sent the typed name, not the stale one', lastAdminUpdatePayload && lastAdminUpdatePayload.name === 'Mealea Sok-Chan', lastAdminUpdatePayload && lastAdminUpdatePayload.name);
ok('save sent the changed campus', lastAdminUpdatePayload && lastAdminUpdatePayload.campus === 'siemreap', lastAdminUpdatePayload && lastAdminUpdatePayload.campus);
ok('edit form closed after a successful save', await page.evaluate(() => !document.getElementById('adm_name')));

// the search box — added because finding one person in a long "All accounts"
// list, grouped only by campus, was the other half of "confusing"
console.log('\n=== ADMIN: SEARCH ===');
await page.fill('#adminSearch', 'dara');
await page.waitForTimeout(300);
const visibleAfterSearch = await page.$$eval('[data-adminrow]', els => els.filter(e => getComputedStyle(e).display !== 'none').length);
ok('searching narrows the list', visibleAfterSearch === 1, visibleAfterSearch + ' visible');
ok('no "no matches" message while something matches',
  await page.$eval('#adminSearchEmpty', el => getComputedStyle(el).display) === 'none');
await page.fill('#adminSearch', 'zzznobody');
await page.waitForTimeout(300);
const visibleNoMatch = await page.$$eval('[data-adminrow]', els => els.filter(e => getComputedStyle(e).display !== 'none').length);
ok('a search matching nobody hides every row', visibleNoMatch === 0, visibleNoMatch + ' visible');
ok('"no matches" message shows',
  await page.$eval('#adminSearchEmpty', el => getComputedStyle(el).display) !== 'none');
await page.fill('#adminSearch', '');
await page.waitForTimeout(300);
const visibleCleared = await page.$$eval('[data-adminrow]', els => els.filter(e => getComputedStyle(e).display !== 'none').length);
ok('clearing the search shows everyone again', visibleCleared === STAFF.length, visibleCleared + ' visible');

console.log('\nERRORS: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail || errors.length ? 1 : 0);
