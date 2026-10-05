/* Campus Leadership on My Ministry, in the browser — phone and desktop.

   No weekly numbers: the section opens on its OKRs as the dashboard
   (progress, objectives, key results, how many meeting cards each has done),
   and the Monday meeting board — standing agenda items, columns, focus
   areas, cards with an owner, due date and the OKR they serve, moved with
   arrows (or dragged on a computer), added and edited, and the board itself
   edited: columns renamed and added, focus areas, standing items. Every name
   is made up. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const NOW = testNow('2026-10-07');   // week 41: Q4
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4490, r));
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], ministries: [], staffType: 'campus', role: '' };
const DEE = { ...base, id: 'st_d', name: 'Dee Director', username: 'dee', dept: 'Campus Leadership', ministry: 'Campus Director' };
const OLI = { ...base, id: 'st_o', name: 'Oli Overseer', username: 'oli', dept: 'Campus Leadership', ministry: 'Community Service' };
const OKRS = [
  { id: 'o1', campus: 'siemreap', quarter: 4, dept: 'Campus Leadership', objective: 'Healthy finances', krs: [{ text: 'Budget approved', metricKey: '', target: 0, manual: 50, group: '', kind: '', current: 0 }, { text: 'Donors met', metricKey: '', target: 10, manual: 0, group: '', kind: 'count', current: 5 }] },
  { id: 'o2', campus: 'siemreap', quarter: 4, dept: 'Campus Leadership', objective: 'Construction started', krs: [{ text: 'Permit', metricKey: '', target: 0, manual: 0, group: '', kind: '', current: 0 }] },
  { id: 'o3', campus: 'siemreap', quarter: 4, dept: 'Community Service', objective: 'Not leadership', krs: [] },
];
const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who, viewport) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 390, height: 900 } });
  await pinClock(ctx, NOW);
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  const board = { cols: [{ id: 'agenda', title: 'Agenda', done: false }, { id: 'doing', title: 'In progress', done: false }, { id: 'done', title: 'Done', done: true }],
    areas: [{ id: 'finances', title: 'Siem Reap finances' }, { id: 'ministries', title: 'Siem Reap ministries' }, { id: 'construction', title: 'Construction' }],
    standing: [{ id: 'updates', title: 'Department and ministry updates' }, { id: 'events', title: 'Events coming up' }],
    cards: [
      { id: 'c1', title: 'Budget draft', type: 'project', col: 'doing', area: 'finances', owner: 'st_o', due: '2026-10-01', okrId: 'o1', notes: '' },
      { id: 'c2', title: 'Donor list', type: 'project', col: 'done', area: 'finances', owner: 'st_d', due: '', okrId: 'o1', notes: '', doneAt: '2026-10-05T01:00:00Z' },
      { id: 'c3', title: 'Christmas outreach', type: 'agenda', col: 'agenda', area: 'ministries', owner: '', due: '', okrId: '', notes: '' },
    ] };
  let n = 0;
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    const bo = () => ({ ok: true, campus: 'siemreap', ...JSON.parse(JSON.stringify(board)) });
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [DEE, OLI], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
      ministry: { ok: true, campus: 'siemreap', dept: who.dept, ministry: who.ministry, entries: {}, daily: {}, prev: {}, pins: [] }, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {} }, tripRequests: [], base: { leader: false, entries: { siemreap: {} }, okrs: OKRS, survey: [], metricOverrides: [] } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: OKRS, survey: [] };
    else if (b.fn === 'getLeadBoard') out = bo();
    else if (b.fn === 'saveLeadCard') { const c = { ...b.args[2] }; if (!c.id) c.id = 'new' + (++n); const i = board.cards.findIndex(x => x.id === c.id); if (i > -1) board.cards[i] = c; else board.cards.push(c); out = { ...bo(), saved: c }; }
    else if (b.fn === 'deleteLeadCard') { board.cards = board.cards.filter(x => x.id !== b.args[2]); out = bo(); }
    else if (b.fn === 'saveLeadSettings') { const st = b.args[2]; board.cols = st.cols.map((c, i) => ({ ...c, id: c.id || 'col' + i })); board.areas = st.areas.map((a, i) => ({ ...a, id: a.id || 'ar' + i })); board.standing = st.standing.filter(x => x.title).map((a, i) => ({ ...a, id: a.id || 'st' + i })); out = bo(); }
    else if (b.fn === 'getMinistryFor') out = { ok: true, entries: {}, daily: {}, prev: {}, pins: [] };
    else if (b.fn === 'getMySchedules') out = { ok: true, now: {}, next: {}, canEdit: {} };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4490/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.click('#dashToMinistry'); await page.waitForTimeout(700);
  return { ctx, page, errors, sent, board };
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

console.log('=== the OKRs are the dashboard ===');
const { ctx, page, errors, sent, board } = await open(DEE);
ok('My Ministry opens on Campus Leadership', /Campus Leadership/.test(await page.$eval('#mmBanner', e => e.textContent)) && !!(await page.$('#leadOkrs')));
ok('no weekly numbers: no week strip, no number boxes', !(await page.$('#mmWeekCard')) && !(await page.$('#kpiInputBtn')) && !(await page.$('.wkStrip')));
const tiles = await page.$$eval('.leadTiles .mmTileNum', t => t.map(x => x.textContent));
ok('the tiles: quarter progress, objectives, key results on pace, open cards', tiles[0] === '25%' && tiles[1] === '2' && tiles[3] === '2', tiles.join());
ok('only Campus Leadership’s objectives, with their progress', (await page.$$('[data-leadobj]')).length === 2 && /50%/.test(await page.$eval('[data-leadobj="o1"]', e => e.textContent)));
ok('an objective says how many of its meeting cards are done', /1 of 2 meeting cards done/.test(await page.$eval('[data-leadobj="o1"]', e => e.textContent)));
await page.click('#leadGoOkr'); await page.waitForTimeout(300);
ok('“Update progress” goes to the OKRs tab', await page.$eval('[data-mmtab="okr"]', b => b.classList.contains('on')));
await page.click('[data-mmtab="ministry"]'); await page.waitForTimeout(300);

console.log('=== the Monday meeting board ===');
await page.click('[data-leadtab="board"]'); await page.waitForTimeout(300);
ok('the standing agenda items for every Monday', /Department and ministry updates/.test(await page.$eval('#leadStanding', e => e.textContent)) && /Events coming up/.test(await page.$eval('#leadStanding', e => e.textContent)));
ok('the next meeting is Monday Oct 12', /Next meeting: Monday Oct 12/.test(await page.$eval('.leadHead', e => e.textContent)));
const cols = await page.$$eval('[data-leadcol]', c => c.map(x => x.getAttribute('data-leadcol') + ':' + x.querySelectorAll('[data-leadcard]').length));
ok('three columns with their cards', cols.join() === 'agenda:1,doing:1,done:1', cols.join());
ok('a card shows its focus area, owner, late due date and its OKR’s progress', await page.$eval('[data-leadcard="c1"]', e => /Siem Reap finances/.test(e.textContent) && /Oli Overseer/.test(e.textContent) && !!e.querySelector('.leadDue.late') && /Healthy finances · 50%/.test(e.textContent)));
await page.click('[data-leadfilter="area:construction"]'); await page.waitForTimeout(150);
ok('filtering by focus area', (await page.$$('[data-leadcard]')).length === 0);
await page.click('#leadNew'); await page.waitForTimeout(200);
ok('adding from a focus area starts a project in it', await page.$eval('[data-lf="area"]', s => s.value) === 'construction' && await page.$eval('[data-lftype].on', b => b.getAttribute('data-lftype')) === 'project');
await page.fill('[data-lf="title"]', 'Roof quote');
await page.selectOption('[data-lf="owner"]', 'st_d');
await page.selectOption('[data-lf="okrId"]', 'o2');
await page.click('#leadSave'); await page.waitForTimeout(300);
let sv = sent.filter(b => b.fn === 'saveLeadCard').pop();
ok('the card is saved with its focus area, owner and OKR', sv && sv.args[2].title === 'Roof quote' && sv.args[2].area === 'construction' && sv.args[2].owner === 'st_d' && sv.args[2].okrId === 'o2' && sv.args[2].col === 'agenda', JSON.stringify(sv && sv.args[2]));
await page.click('[data-leadfilter="all"]'); await page.waitForTimeout(150);
await page.click('[data-leadmove="c3|doing"]'); await page.waitForTimeout(300);
sv = sent.filter(b => b.fn === 'saveLeadCard').pop();
ok('the arrow moves a card to the next column', sv.args[2].id === 'c3' && sv.args[2].col === 'doing');
await page.click('[data-leadedit="c3"]'); await page.waitForTimeout(200);
await page.fill('[data-lf="notes"]', 'Ask the churches'); await page.click('#leadSave'); await page.waitForTimeout(300);
ok('tapping a card edits it', sent.filter(b => b.fn === 'saveLeadCard').pop().args[2].notes === 'Ask the churches');
ok('no sideways page scroll on a phone (the columns scroll in their own row)', !(await overflow(page)));

console.log('=== editing the board ===');
await page.click('#leadEditBoard'); await page.waitForTimeout(200);
await page.fill('[data-lset="cols|0"]', 'This Monday');
await page.click('[data-lsetadd="cols"]'); await page.waitForTimeout(150);
await page.fill('[data-lset="cols|3"]', 'Parked');
await page.click('[data-lsetadd="areas"]'); await page.waitForTimeout(150);
await page.fill('[data-lset="areas|3"]', '2027 planning');
await page.click('[data-lsetadd="standing"]'); await page.waitForTimeout(150);
await page.fill('[data-lset="standing|2"]', 'Prayer');
await page.click('#leadSetSave'); await page.waitForTimeout(300);
const st = sent.filter(b => b.fn === 'saveLeadSettings').pop();
ok('renamed and added columns, a new focus area and a standing item are saved', st && st.args[2].cols.map(c => c.title).join() === 'This Monday,In progress,Done,Parked' && st.args[2].cols[2].done && st.args[2].areas.some(a => a.title === '2027 planning') && st.args[2].standing.some(a => a.title === 'Prayer'), JSON.stringify(st && st.args[2].cols));
ok('the board shows them', (await page.$$('[data-leadcol]')).length === 4 && /This Monday/.test(await page.$eval('[data-leadcol="agenda"]', e => e.textContent)) && /Prayer/.test(await page.$eval('#leadStanding', e => e.textContent)));
ok('no errors (phone)', errors.length === 0, errors.join(' | '));
await ctx.close();

console.log('=== desktop ===');
{
  const { ctx, page, errors } = await open(OLI, { width: 1280, height: 900 });
  ok('an overseer also opens on Campus Leadership', !!(await page.$('#leadOkrs')));
  await page.click('[data-leadtab="board"]'); await page.waitForTimeout(300);
  ok('desktop: wide, the columns side by side', await page.$eval('main', m => m.classList.contains('wide')) && await page.$eval('.leadCols', g => getComputedStyle(g).gridTemplateColumns.split(' ').length === 3) && !(await overflow(page)));
  await page.dragAndDrop('[data-leadcard="c3"]', '[data-leadcol="done"]'); await page.waitForTimeout(300);
  ok('desktop: a card can be dragged to another column', /Christmas outreach/.test(await page.$eval('[data-leadcol="done"]', e => e.textContent)));
  ok('no errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
