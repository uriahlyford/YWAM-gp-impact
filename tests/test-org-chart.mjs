/* Team → Structure: the campus as levels, departments and ministries only.

   Drives the real page. Campus Leadership on top (directors crowned, then
   the department overseers), a connector, then one box per department with
   its overseer and its ministries — each ministry naming its leader with a
   crown and its people. The current quarter is live from profiles; an
   admin saves a snapshot of it, and other quarters show the snapshot that
   was saved (or the latest earlier one). Tapping a person opens them. */
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
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [] };
const URIAH = { ...base, id: 'st_uriah', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'GP Campus Director', isAdmin: true };
const NAOMI = { ...base, id: 'st_naomi', name: 'Naomi Lyford', username: 'naomi', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'GP Co-Director' };
const SINA = { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service', role: 'Overseer' };
const SREILEA = { ...base, id: 'st_sreilea', name: 'Sreilea Chan', username: 'sreilea', dept: 'Community Service', ministry: 'Cafe', role: 'Cafe manager', leads: ['Community Service|Cafe'] };
const DARA = { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe', role: 'Barista' };
const LOST = { ...base, id: 'st_lost', name: 'Lost Soul', username: 'lost', dept: 'Old Dept', ministry: 'Gone', role: '' };
const BOPHA = { ...base, id: 'st_bopha', name: 'Bopha Kim', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', role: 'Barista' };
const ROSTER = [URIAH, NAOMI, SINA, SREILEA, DARA, LOST, BOPHA];

const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
const errors = [], sent = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); sent.push(b.fn);
  let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: DARA, profile: {}, roster: ROSTER, logs: [], habits: null, mentees: [], mentorRequests: [],
    goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [],
    base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] } };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'staffProfile') out = { ok: true, staff: ROSTER.find(p => p.id === b.args[2]) || ROSTER[0], goals: [], activity: {}, awayWork: {}, isMe: false };
  else if (b.fn === 'getStructure') {
    const [, , campus, year, quarter] = b.args;
    // Q1 of this year was saved when Dara was still in the Cafe and a since-departed Kiri led it; Q2 was never saved
    if (quarter === 1) out = { ok: true, campus, year, quarter, source: 'saved', doc: { campus, year, quarter: 1, savedAt: year + '-03-30T00:00:00Z', savedBy: 'st_uriah', people: [
      { id: 'st_uriah', name: 'Uriah Lyford', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', leads: [] },
      { id: 'st_kiri', name: 'Kiri Left', dept: 'Community Service', ministry: 'Cafe', role: '', leads: ['Community Service|Cafe'] },
      { id: 'st_dara', name: 'Dara Pen', dept: 'Community Service', ministry: 'Cafe', role: '', leads: [] } ] } };
    else if (quarter === 2) out = { ok: true, campus, year, quarter, source: 'copied', doc: { campus, year, quarter: 1, savedAt: year + '-03-30T00:00:00Z', people: [{ id: 'st_uriah', name: 'Uriah Lyford', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', leads: [] }] } };
    else out = { ok: true, campus, year, quarter, source: 'none', doc: null };
  }
  else if (b.fn === 'saveStructure') out = { ok: true, campus: b.args[2], year: b.args[3], quarter: b.args[4], source: 'saved', doc: { campus: b.args[2], year: b.args[3], quarter: b.args[4], savedAt: new Date().toISOString(), people: [] } };
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), DARA.username);
await page.goto('http://localhost:4493/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(500);
await page.click('nav.bottom [data-tab="team"]');
await page.waitForTimeout(500);
await page.click('[data-teammode="org"]');
await page.waitForTimeout(600);

const box = (sel) => page.evaluate(s => {
  const el = document.querySelector(s); if (!el) return null;
  const people = (root) => [].map.call(root.querySelectorAll(':scope > .orgPeople .orgPerson span:last-child'), e => e.textContent.trim());
  return { title: el.querySelector('.orgBoxTitle').textContent.trim(), people: people(el),
    mins: [].map.call(el.querySelectorAll('.orgMin'), m => ({ name: m.querySelector('.orgMinHead span').textContent.trim(), n: m.querySelector('.orgMinN').textContent.trim(), bare: m.classList.contains('bare'), people: people(m) })) };
}, sel);
const s = await page.evaluate(() => ({
  labels: [].map.call(document.querySelectorAll('.orgLevelLabel'), l => l.textContent.trim()),
  connector: !!document.querySelector('.orgConnector'), grid: document.querySelectorAll('.orgGrid .orgBox.dept').length,
  edit: !!document.querySelector('#structEditBtn'), chips: document.querySelectorAll('[data-structq]').length, year: !!document.querySelector('#structYearSel'), save: !!document.querySelector('#structSaveBtn'),
  live: /Live from everyone/.test(document.body.innerText), lit: (document.querySelector('[data-structq].on') || {}).textContent,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  bopha: document.body.innerText.includes('Bopha'),
}));
ok('the chart reads top-down: Campus Leadership, a connector, then the departments', s.labels[0] === 'Campus Leadership' && s.connector && /^Departments · \d+$/.test(s.labels[1]), s.labels.join(' | '));
ok('one box per department on the campus', s.grid > 3, s.grid);
ok('nothing to hand-edit — no Edit button — but a year picker and quarter chips, lit on this quarter', !s.edit && s.chips === 4 && s.year && s.lit === 'Q' + (Math.floor(new Date().getMonth() / 3) + 1), s.lit);
ok('this quarter is live from profiles; a member gets no Save button', s.live && !s.save);
ok('the only fetch is for this quarter’s own saved-on note, once', sent.filter(f => f === 'getStructure').length === 1);
const lead = await box('[data-orgbox="leadership"]');
ok('the top box names the directors, crowned, then the department overseers', lead && lead.people.slice(0, 2).every(p => /^👑 (Uriah|Naomi)/.test(p)) && lead.people.includes('Sina Sok'), JSON.stringify(lead && lead.people));
const cs = await box('[data-orgbox="Community Service"]');
ok('a department box: its overseer crowned, and how many staff', cs && cs.people[0] === '👑 Sina Sok' && /2 staff/.test(cs.title), JSON.stringify(cs && [cs.title, cs.people]));
const cafe = cs && cs.mins.find(m => /Cafe/.test(m.name));
ok('its ministries inside, each with its leader crowned and its people', cafe && cafe.n === '2' && cafe.people[0] === '👑 Sreilea Chan' && cafe.people[1] === 'Dara Pen', JSON.stringify(cafe));
ok('an empty ministry is still on the chart, quiet, with a dash', cs.mins.some(m => m.bare && m.n === '—'));
ok('the other campus’s staff are not on this campus’s chart', !s.bopha);
const loose = await page.evaluate(() => { const el = document.querySelector('.orgBox.loose'); return el ? el.innerText : ''; });
ok('someone whose profile points nowhere on the chart is listed as not placed, not lost', /Lost Soul/.test(loose));
ok('nothing scrolls sideways', !s.overflow);
await page.click('[data-orgmin="Community Service|Cafe"] .orgPerson');
await page.waitForTimeout(500);
ok('tapping a person opens their page', await page.$('#personBack') !== null && sent.includes('staffProfile'));
await page.click('#personBack');
await page.waitForTimeout(400);
ok('and Back returns to the chart', await page.$('.orgChart') !== null);

console.log('\n=== looking back a quarter ===');
await page.click('[data-structq="1"]');
await page.waitForTimeout(600);
const q1 = await page.evaluate(() => ({ note: [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '), body: document.body.innerText }));
ok('picking Q1 fetches its snapshot', sent.filter(f => f === 'getStructure').length === 2);
ok('and draws the chart from it: the person who has since left is there, crowned as Cafe leader', /Q1 \d{4} structure saved on/.test(q1.note) && /👑 Kiri Left/.test(q1.body), q1.note);
ok('while today’s leader, who was not there then, is not', !/Sreilea/.test(q1.body));
await page.click('[data-structq="2"]');
await page.waitForTimeout(600);
const q2 = await page.evaluate(() => [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '));
ok('a quarter nobody saved shows the latest earlier snapshot and says so', /Nothing saved for Q2 \d{4} — showing the Q1 \d{4} structure/.test(q2), q2);
await page.click('[data-structq="1"]');
await page.waitForTimeout(300);
ok('a quarter already fetched is not fetched again', sent.filter(f => f === 'getStructure').length === 3);
ok('no page errors', errors.length === 0, errors.join(' | '));

console.log('\n=== the admin saves this quarter ===');
await page.evaluate(() => { S.me = Object.assign({}, S.me, { isAdmin: true }); S.structQ = null; S.structYear = null; render(); });
await page.waitForTimeout(400);
ok('an admin sees Save Q_ 20__ structure', await page.evaluate(() => /Save Q\d \d{4} structure/.test((document.querySelector('#structSaveBtn') || {}).textContent || '')));
await page.click('#structSaveBtn');
await page.waitForTimeout(600);
ok('Save posts the campus, year and quarter — the server builds the snapshot itself', sent.includes('saveStructure') && await page.evaluate(() => /structure saved on/.test(document.body.innerText) && /Update Q\d \d{4} structure/.test(document.querySelector('#structSaveBtn').textContent)));
ok('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
