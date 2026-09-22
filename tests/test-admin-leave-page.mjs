/* Admin → Leave in the browser: everyone's leave, one campus at a time —
   what is waiting (with Approve / Decline), who is away or booked, days
   used this year against the cap, and the year's earlier requests folded
   away. Names open the person's account page. */
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
await new Promise(r => server.listen(4486, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const Y = new Date().getFullYear();
const base = { campus: 'siemreap', photo: '', mentorId: '', mentorStatus: '', isAdmin: false, leads: [], active: true, archived: null };
const ME = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true };
const staff = [ME,
  { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe' },
  { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service' },
  { ...base, id: 'st_bopha', name: 'Bopha Kim', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe' }];
const trip = (o) => ({ id: o.id, staffId: o.staffId, name: staff.find(s => s.id === o.staffId).name, campus: staff.find(s => s.id === o.staffId).campus, dept: staff.find(s => s.id === o.staffId).dept, ministry: 'Cafe', active: true,
  from: o.from, to: o.to, days: 5, workDays: o.wd || 5, type: o.type || 'personal', reason: o.reason || '', coverage: o.coverage || '', status: o.status, mentorName: o.mentorName || '', decidedBy: o.decidedBy || '', decidedAt: '', created: '' });
let trips = [
  trip({ id: 't_wait', staffId: 'st_dara', from: day(20), to: day(24), status: 'pending', mentorName: 'Sina Sok', reason: 'Family visit', coverage: 'Sreilea' }),
  trip({ id: 't_noted', staffId: 'st_sina', from: day(30), to: day(34), status: 'noted', type: 'outside', reason: 'Team in Battambang' }),
  trip({ id: 't_away', staffId: 'st_dara', from: day(-1), to: day(2), status: 'approved', decidedBy: 'Sina Sok' }),
  trip({ id: 't_past', staffId: 'st_sina', from: Y + '-01-05', to: Y + '-01-09', status: 'approved', wd: 5 }),
  trip({ id: 't_decl', staffId: 'st_dara', from: Y + '-02-02', to: Y + '-02-06', status: 'declined' }),
  trip({ id: 't_pp', staffId: 'st_bopha', from: day(10), to: day(14), status: 'noted', type: 'special' }),
];
const totals = { st_dara: { [Y]: { personal: 9, outside: 0, special: 0, trips: 2 } }, st_sina: { [Y]: { personal: 5, outside: 5, special: 0, trips: 2 } }, st_bopha: { [Y]: { personal: 0, outside: 0, special: 5, trips: 1 } } };
const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
const errors = [], sent = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); sent.push(b); let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: staff, logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: {}, okrs: [], survey: [], metricOverrides: [] } };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'adminListStaff') out = { ok: true, staff };
  else if (b.fn === 'adminListTrips') out = { ok: true, ptoCap: 30, trips, totals };
  else if (b.fn === 'adminDecideTrip') { trips = trips.map(t => t.id === b.args[2] ? { ...t, status: b.args[3] ? 'approved' : 'declined', decidedBy: 'Uriah Lyford' } : t); out = { ok: true, ptoCap: 30, trips, totals }; }
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await page.goto('http://localhost:4486/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(500);
await page.evaluate(() => { S.view = 'admin'; render(); });
await page.waitForTimeout(600);
ok('the Admin home has a Leave card', await page.$('[data-adminsub="leave"]') !== null);
await page.click('[data-adminsub="leave"]');
await page.waitForTimeout(700);
ok('opening it loads everyone’s leave once', sent.filter(x => x.fn === 'adminListTrips').length === 1);
const s = await page.evaluate(() => ({
  chips: [].map.call(document.querySelectorAll('[data-adminleavecampus]'), b => b.textContent.trim() + (b.classList.contains('on') ? '*' : '')),
  tiles: [].map.call(document.querySelectorAll('.mmTile'), t => t.querySelector('.mmTileName').textContent.trim() + '=' + t.querySelector('.mmTileNum').textContent.trim()),
  waiting: [].map.call(document.querySelectorAll('[data-adminleaveok]'), b => b.getAttribute('data-adminleaveok')),
  rows: [].map.call(document.querySelectorAll('[data-adminleave]'), r => r.getAttribute('data-adminleave') + '=' + r.querySelector('.hrChip').textContent.trim()),
  text: document.body.innerText, year: (document.querySelector('#adminLeaveYear') || {}).value,
}));
ok('one campus at a time, opening on the admin’s own, with this year’s counts', JSON.stringify(s.chips) === JSON.stringify(['Poipet · 1', 'Siem Reap · 5*']) && s.year === String(Y), s.chips.join(' | '));
ok('tiles: waiting, away right now, coming up, requests this year', JSON.stringify(s.tiles) === JSON.stringify(['Waiting for a yes=2', 'Away right now=1', 'Coming up=0', 'Requests in ' + Y + '=5']), s.tiles.join(' | '));
ok('the waiting ones carry Approve / Decline — the one pending on a mentor says so, the one with no mentor is noted', JSON.stringify(s.waiting) === JSON.stringify(['t_wait', 't_noted']) && /Waiting on Sina Sok/.test(s.text) && s.rows.includes('t_noted=Noted — no mentor'), s.rows.join(' | '));
ok('a request shows its dates, work days, type, reason and cover', /5 work days/.test(s.text) && /Personal Time Off/.test(s.text) && /Family visit/.test(s.text) && /Cover: Sreilea/.test(s.text));
ok('who is away now is listed, approved, with who decided', s.rows.includes('t_away=Approved') && /Decided by Sina Sok/.test(s.text));
ok('the other campus’s request is not on this campus', !s.rows.some(r => /t_pp/.test(r)));
ok('days used this year, per person, against the cap', /Days used in/.test(s.text) && /Personal 9\/30/.test(s.text) && /Outside 5/.test(s.text));
ok('earlier requests are folded away with their count', /Earlier in/.test(s.text) && !s.rows.some(r => /t_past|t_decl/.test(r)));
await page.click('[data-acc="leavePast"]');
await page.waitForTimeout(300);
ok('unfolding shows them, with their status', await page.evaluate(() => [].map.call(document.querySelectorAll('[data-adminleave]'), r => r.getAttribute('data-adminleave') + '=' + r.querySelector('.hrChip').textContent.trim()).filter(x => /t_past|t_decl/.test(x)).sort().join(',') === 't_decl=Declined,t_past=Approved'));
await page.click('[data-adminleaveok="t_wait"]');
await page.waitForTimeout(600);
const dec = sent.find(x => x.fn === 'adminDecideTrip');
ok('Approve posts the decision', dec && dec.args[2] === 't_wait' && dec.args[3] === true);
ok('and the request moves to Coming up, approved', await page.evaluate(() => { const r = document.querySelector('[data-adminleave="t_wait"]'); return r && r.querySelector('.hrChip').textContent.trim() === 'Approved' && !document.querySelector('[data-adminleaveok="t_wait"]'); }));
await page.click('[data-adminleavecampus="poipet"]');
await page.waitForTimeout(400);
ok('the Poipet chip shows Poipet’s requests', await page.evaluate(() => !!document.querySelector('[data-adminleave="t_pp"]') && !document.querySelector('[data-adminleave="t_noted"]')));
await page.click('[data-adminleave="t_pp"] [data-adminperson]');
await page.waitForTimeout(400);
ok('tapping a name opens their account page', await page.evaluate(() => S.adminSub === 'person' && /Bopha Kim/.test(document.querySelector('.adminPersonHead .pname').textContent)));
ok('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
