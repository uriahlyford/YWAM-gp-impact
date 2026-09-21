/* Admin → Mentors: who is walking with whom.

   One card per mentor with their people (and whether each has accepted
   yet), then everyone with no mentor; tapping a name opens their account
   page, whose header names their mentor. The Admin home card counts who has
   nobody yet. */
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
await new Promise(r => server.listen(4487, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', mentorStatus: '', isAdmin: false, leads: [], active: true, archived: null };
const ME = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true };
const staff = [ME,
  { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service' },
  { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe', mentorId: 'st_sina', mentorStatus: 'approved' },
  { ...base, id: 'st_spicy', name: 'Sreilea Chan', username: 'spicy', dept: 'Community Service', ministry: 'Cafe', mentorId: 'st_sina', mentorStatus: 'pending' },
  { ...base, id: 'st_tinh', name: 'Tinh Vong', username: 'tinh', dept: 'Youth Education', ministry: 'GP Media', mentorId: 'st_admin', mentorStatus: 'approved' },
  { ...base, id: 'st_bopha', name: 'Bopha Kim', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe' },
  { ...base, id: 'st_gone', name: 'Gone Person', username: 'gone', dept: 'Community Service', ministry: 'Cafe', active: false, archived: { at: '2026-07-01', reason: 'left', by: 'st_admin' } },
];
const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: staff.filter(s => s.active), logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: {}, okrs: [], survey: [], metricOverrides: [] } };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'adminListStaff') out = { ok: true, staff };
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await page.goto('http://localhost:4487/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(500);
await page.evaluate(() => { S.view = 'admin'; render(); });
await page.waitForTimeout(700);
const home = await page.evaluate(() => ({ card: !!document.querySelector('[data-adminsub="mentors"]'), badge: (document.querySelector('[data-adminsub="mentors"] .adminBadge') || {}).textContent }));
ok('the Admin home has a Mentors card counting who has nobody yet (active people only)', home.card && home.badge === '3', JSON.stringify(home));
await page.click('[data-adminsub="mentors"]');
await page.waitForTimeout(400);
const s = await page.evaluate(() => ({
  h2: document.querySelector('h2').textContent.trim(),
  tiles: [].map.call(document.querySelectorAll('.mmTile'), t => t.querySelector('.mmTileName').textContent.trim() + '=' + t.querySelector('.mmTileNum').textContent.trim()),
  mentors: [].map.call(document.querySelectorAll('.adminMentor'), m => ({ name: m.querySelector('.adminMentorHead .rowName').textContent.trim(), n: m.querySelector('.adminBadge').textContent.trim(),
    kids: [].map.call(m.querySelectorAll('[data-adminperson]'), b => b.querySelector('.rowName').textContent.trim() + (b.querySelector('.hrChip') ? ' (' + b.querySelector('.hrChip').textContent.trim() + ')' : '')).slice(1) })),
  none: document.body.innerText.includes('No mentor yet'),
}));
ok('the page is titled Mentors', /Mentors/.test(s.h2), s.h2);
ok('tiles: mentors, with a mentor, waiting to accept, no mentor yet', JSON.stringify(s.tiles) === JSON.stringify(['Mentors=2', 'With a mentor=3 / 6', 'Waiting to accept=1', 'No mentor yet=3']), s.tiles.join(' | '));
ok('one card per mentor, alphabetical, with their people — a pending one marked Waiting', JSON.stringify(s.mentors) === JSON.stringify([{ name: 'Sina Sok', n: '2', kids: ['Dara Pen', 'Sreilea Chan (Waiting)'] }, { name: 'Uriah Lyford', n: '1', kids: ['Tinh Vong'] }]), JSON.stringify(s.mentors));
ok('everyone with no mentor is listed below, the archived person not among them', s.none && await page.evaluate(() => { const t = document.body.innerText; return /Bopha Kim/.test(t) && !/Gone Person/.test(t); }));
await page.click('.adminMentor [data-adminperson="st_spicy"]');
await page.waitForTimeout(400);
const person = await page.evaluate(() => ({ name: document.querySelector('.adminPersonHead .pname').textContent.trim(), chips: [].map.call(document.querySelectorAll('.teamStats .teamStat'), c => c.textContent.trim()) }));
ok('tapping a name opens their account page, whose header names their mentor and that it is waiting', person.name === 'Sreilea Chan' && person.chips.some(c => /Mentor: Sina Sok · waiting/.test(c)), JSON.stringify(person));
await page.click('#adminBack');
await page.waitForTimeout(300);
ok('Back from a person returns to Accounts (where the mentor is set)', await page.evaluate(() => S.adminSub === 'accounts'));
ok('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
