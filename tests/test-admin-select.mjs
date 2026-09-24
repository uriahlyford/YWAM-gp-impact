/* Admin → Accounts: tapping a staff row opens that person's own page.

   The Admin page is a home menu (one card per tool), Accounts is a campus
   chip row + search + a list of tappable rows, and a row opens one PERSON's
   page with every control for their account. Back returns to the list with
   the search still in the box and the list still narrowed — the old
   accordion list lost the search on every tap, which read as "when I select
   a staff it bugs". */
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
const ME = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true, staffType: 'campus' };
const staff = [ME];
// ten ministry staff, three YAP, one whose kind of staff was never set
for (let i = 0; i < 14; i++) staff.push({ ...base, id: 'st_' + i, name: 'Person ' + i, username: 'p' + i, dept: 'Community Service', ministry: 'Cafe', role: '', staffType: i < 10 ? 'ministry' : i < 13 ? 'yap' : '' });

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
await page.click('[data-adminsub="accounts"]');
await page.waitForTimeout(400);
await page.click('[data-admincampustab="siemreap"]');
await page.waitForTimeout(500);

const visible = () => page.evaluate(() => [].filter.call(document.querySelectorAll('[data-adminrow]'), r => r.style.display !== 'none').map(r => r.querySelector('[data-adminperson]').getAttribute('data-adminperson')));
ok('every Siem Reap account is listed', (await visible()).length === 15, (await visible()).length);
const groups = () => page.evaluate(() => [].map.call(document.querySelectorAll('[data-admingroup]'), g => g.getAttribute('data-admingroup') + ':' + g.querySelector('.mentorLabel').textContent.trim() + ':' + g.querySelectorAll('[data-adminrow]').length + ':' + (g.style.display === 'none' ? 'hidden' : 'shown')));
ok('the list is split into Siem Reap ministries, then YAP and Campus staff, then whoever is not sorted yet', JSON.stringify(await groups()) === JSON.stringify(['ministry:Siem Reap ministries · 10:10:shown', 'campus:YAP and Campus staff · 4:4:shown', 'unset:Kind of staff not set yet · 1:1:shown']), JSON.stringify(await groups()));
await page.fill('#adminSearch', 'uriah');
await page.waitForTimeout(200);
ok('a search hides the groups with no match', JSON.stringify((await groups()).map(g => g.split(':').pop())) === JSON.stringify(['hidden', 'shown', 'hidden']), JSON.stringify(await groups()));
await page.fill('#adminSearch', '');
await page.waitForTimeout(200);
await page.fill('#adminSearch', 'person 1');
await page.waitForTimeout(200);
const narrowed = await visible();
ok('typing narrows the list without a rebuild', narrowed.length === 5 && narrowed.includes('st_1') && narrowed.includes('st_12'), narrowed.join(','));

await page.click('[data-adminperson="st_12"]');
await page.waitForTimeout(500);
const person = await page.evaluate(() => ({
  back: (document.querySelector('#adminBack') || {}).getAttribute ? document.querySelector('#adminBack').getAttribute('data-adminback') : null,
  name: (document.querySelector('.adminPersonHead .pname') || {}).textContent || '',
  body: !!document.querySelector('[data-adminedit="st_12"]'), others: document.querySelectorAll('[data-adminedit]').length,
  list: !!document.querySelector('#adminSearch'),
}));
ok('tapping a row opens that person’s own page — theirs, nobody else’s', /Person 12/.test(person.name) && person.body && person.others === 1, JSON.stringify(person));
ok('the list is gone from that page; Back leads to Accounts', !person.list && person.back === 'accounts');
await page.click('#adminBack');
await page.waitForTimeout(500);
const back = await page.evaluate(() => ({ search: document.querySelector('#adminSearch').value }));
ok('Back returns to Accounts with the search still in the box', back.search === 'person 1', JSON.stringify(back.search));
ok('and the list still narrowed to it', (await visible()).length === 5, (await visible()).length);
await page.click('[data-adminperson="st_10"]');
await page.waitForTimeout(400);
ok('a different row opens a different person', await page.evaluate(() => /Person 10/.test(document.querySelector('.adminPersonHead .pname').textContent)));
await page.click('#adminBack');
await page.waitForTimeout(400);
await page.fill('#adminSearch', '');
await page.waitForTimeout(200);
ok('clearing the search shows everyone again', (await visible()).length === 15);
await page.click('[data-admincampustab="poipet"]');
await page.waitForTimeout(400);
await page.click('[data-admincampustab="siemreap"]');
await page.waitForTimeout(400);
ok('switching campus tabs keeps working', (await visible()).length === 15);
await page.click('#adminBack');
await page.waitForTimeout(400);
const home = await page.evaluate(() => ({ cards: [].map.call(document.querySelectorAll('[data-adminsub]'), b => b.getAttribute('data-adminsub')), badge: (document.querySelector('[data-adminsub="accounts"] .adminBadge') || {}).textContent }));
ok('Back from Accounts is the Admin home — one card per tool', JSON.stringify(home.cards) === JSON.stringify(['accounts', 'approvals', 'mentors', 'leave', 'portal', 'kpis', 'broadcast', 'merge']), home.cards.join(','));
ok('the Accounts card counts the active accounts', home.badge === '15', home.badge);
ok('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
