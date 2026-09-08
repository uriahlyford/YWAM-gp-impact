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
    // matches the real adminUpdateStaff: { ok, staff: <the updated record> }
    out = { ok: true, staff: STAFF.find(s => s.id === b.args[2]) };
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

// before opening anything — Mealea's row is still collapsed here, so this is
// exactly what its one-line summary shows in the ordinary "All accounts" list
ok('username shows in the collapsed row summary',
  await page.evaluate((id) => document.querySelector('[data-acc="' + id + '"] .accSummary').textContent.includes('@mealea'), MATE.id));

// open Mealea's row, then her edit form
await page.evaluate((id) => { S.adminAcc[id] = true; render(); }, MATE.id);
await page.waitForTimeout(400);
await page.click('[data-adminedit="' + MATE.id + '"]');
await page.waitForTimeout(400);

ok('name field prefilled from the real record', await page.$eval('#adm_name', el => el.value) === MATE.name);
ok('username field prefilled from the real record', await page.$eval('#adm_username', el => el.value) === MATE.username);
ok('campus field prefilled', await page.$eval('#adm_campus', el => el.value) === MATE.campus);
ok('role field prefilled', await page.$eval('#adm_role', el => el.value) === MATE.role);

// type a new name and username — should NOT re-render (no draft loss, no lag
// from a full rebuild)
await page.fill('#adm_name', 'Mealea Sok-Chan');
await page.fill('#adm_username', 'mealeasok');
await page.selectOption('#adm_campus', 'siemreap');
await page.waitForTimeout(300);
ok('campus change did not get reverted by anything else', await page.$eval('#adm_campus', el => el.value) === 'siemreap');

// cause an UNRELATED re-render — expand a different staff member's row —
// while Mealea's edit form is still open with unsaved changes in it
await page.evaluate((id) => { S.adminAcc[id] = true; render(); }, OTHER.id);
await page.waitForTimeout(400);

ok('typed name survives an unrelated re-render elsewhere on the page',
  await page.$eval('#adm_name', el => el.value) === 'Mealea Sok-Chan');
ok('typed username survives an unrelated re-render elsewhere on the page',
  await page.$eval('#adm_username', el => el.value) === 'mealeasok');
ok('changed campus survives an unrelated re-render elsewhere on the page',
  await page.$eval('#adm_campus', el => el.value) === 'siemreap');
ok('edit form is still open (state wasn\'t clobbered either)',
  await page.evaluate(() => !!document.getElementById('adm_name')));

// save, and check what actually went over the wire
await page.click('[data-adminsave="' + MATE.id + '"]');
await page.waitForTimeout(900);
ok('save sent the typed name, not the stale one', lastAdminUpdatePayload && lastAdminUpdatePayload.name === 'Mealea Sok-Chan', lastAdminUpdatePayload && lastAdminUpdatePayload.name);
ok('save sent the changed username', lastAdminUpdatePayload && lastAdminUpdatePayload.username === 'mealeasok', lastAdminUpdatePayload && lastAdminUpdatePayload.username);
ok('save sent the changed campus', lastAdminUpdatePayload && lastAdminUpdatePayload.campus === 'siemreap', lastAdminUpdatePayload && lastAdminUpdatePayload.campus);
ok('edit form closed after a successful save', await page.evaluate(() => !document.getElementById('adm_name')));

// campus tabs — Mealea just moved to Siem Reap, so she should have followed
// her account there and Poipet's tab should now show just Uriah and Dara
console.log('\n=== ADMIN: CAMPUS TABS ===');
ok('Poipet tab active by default, shows the 2 who stayed',
  await page.$$eval('[data-adminrow]', els => els.filter(e => getComputedStyle(e).display !== 'none').length) === 2);
// only the row headers' own names — a row's expanded body can legitimately
// mention someone else entirely (the mentor picker lists every active
// staffer regardless of campus), so checking the whole row's text would
// also match names that only appear inside another person's dropdown.
const rowsText = () => page.$$eval('[data-adminrow] .accTitle', els => els.map(e => e.textContent).join(' | '));
await page.click('[data-admincampustab="siemreap"]');
await page.waitForTimeout(400);
ok('Siem Reap tab shows the one who moved there',
  await page.$eval('[data-admincampustab="siemreap"]', el => el.textContent.includes('1')));
ok('Mealea (with her saved name) shows up under Siem Reap now', (await rowsText()).includes('Mealea Sok-Chan'));
ok('Uriah is not shown under Siem Reap (he stayed in Poipet)', !(await rowsText()).includes('Uriah Lyford'));
await page.click('[data-admincampustab="poipet"]');
await page.waitForTimeout(400);
ok('switching back to Poipet shows Uriah again', (await rowsText()).includes('Uriah Lyford'));

// the search box — added because finding one person in a long "All accounts"
// list was the other half of "confusing" (now scoped to whichever campus
// tab is open, same as everything else on the page)
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
ok('clearing the search shows everyone in this tab again', visibleCleared === 2, visibleCleared + ' visible');

// the "had to do it twice before it registers" bug: adminRefresh_() used to
// blank S.adminStaff and re-fetch, so whatever the re-fetch's response
// looked like (fresh from the server, on its own schedule) is what decided
// what showed up — reopening the same edit right after saving could still
// show the OLD value if that re-fetch hadn't caught up yet. The fix shows
// what the server just confirmed it stored immediately, and reconciles with
// a real re-fetch quietly in the background instead of gating the display
// on it. OTHER starts as ministry/Cambodia; change both and confirm a
// single save is enough — no click Save, still wrong, click Save again.
console.log('\n=== ADMIN: NO DOUBLE-SAVE NEEDED FOR TYPE/COUNTRY ===');
await page.evaluate((id) => { S.adminAcc[id] = true; render(); }, OTHER.id);
await page.waitForTimeout(400);
await page.click('[data-adminedit="' + OTHER.id + '"]');
await page.waitForTimeout(400);
await page.selectOption('#adm_type', 'campus');
await page.selectOption('#adm_country', { label: 'United States' });
await page.click('[data-adminsave="' + OTHER.id + '"]');
await page.waitForTimeout(900);
ok('save sent the new staff type', lastAdminUpdatePayload && lastAdminUpdatePayload.staffType === 'campus',
  lastAdminUpdatePayload && lastAdminUpdatePayload.staffType);
ok('save sent the new country', lastAdminUpdatePayload && lastAdminUpdatePayload.country === 'United States',
  lastAdminUpdatePayload && lastAdminUpdatePayload.country);
// reopen — on a single save, this must already show the new values, not the old ones
await page.click('[data-adminedit="' + OTHER.id + '"]');
await page.waitForTimeout(400);
ok('staff type shows the new value after exactly one save', await page.$eval('#adm_type', el => el.value) === 'campus');
ok('country shows the new value after exactly one save', await page.$eval('#adm_country', el => el.value) === 'United States');

console.log('\nERRORS: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail || errors.length ? 1 : 0);
