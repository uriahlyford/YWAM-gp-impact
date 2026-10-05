/* Outreach Teams in the browser — the one ministry without a weekly form.

   Drives the real page as Outreach Teams staff: My Ministry opens on the
   teams page (no week strip, no metric form), the dashboard adds up the
   teams that finished in the picked month / quarter / year, "Add a team" is
   one form that posts a whole record, Edit opens the same form filled in,
   and a Cafe member browsing to Outreach Teams sees the page read-only. The
   ministry dashboard's period toggle and the folded personal card are
   checked on a Cafe page too. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock, weekOf, quarterOf } from './clock.mjs';
/* Two clocks. The trips are one year's story — teams that came January to May,
   one next January — so those pages run on a fixed day after them (12 Aug).
   The Cafe block is about "this quarter" versus "this year", which must hold on
   any day, so it runs on the real now, or GP_TEST_NOW to check an edge. */
const SCENARIO_NOW = testNow('2026-08-12');
const NOW = testNow();
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
await new Promise(r => server.listen(4494, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const Y = SCENARIO_NOW.getFullYear();
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [] };
const SOK = { ...base, id: 'st_sok', name: 'Sok Chan', username: 'sok', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Teams coordinator' };
const DARA = { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe', role: 'Barista' };
const OVERSEER = { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service', role: 'Overseer' };
const trip = (o) => ({ id: o.id, campus: 'siemreap', name: o.name, org: o.org || '', country: o.country || '', from: o.from, to: o.to, size: o.size ?? null,
  males: null, females: null, couples: null, families: null, staff: o.staff || '', focus: '', status: o.status || 'active', notes: '', metrics: o.metrics || {}, reached: o.reached || { male: null, female: null } });
// two teams left in Feb of this year, one in May, one is still here, one was cancelled
const TRIPS = [
  trip({ id: 't1', name: 'Alpha DTS', org: 'YWAM Kona', country: 'United States', from: Y + '-01-20', to: Y + '-02-10', size: 8, staff: 'Sok', metrics: { 'People Served': 100, 'Salvations': 2 }, reached: { male: 40, female: 60 } }),
  trip({ id: 't2', name: 'Bravo Church', org: 'Four Square', country: 'United States', from: Y + '-02-01', to: Y + '-02-20', size: 12, metrics: { 'People Served': 50, 'Healings': 1 } }),
  trip({ id: 't3', name: 'Charlie DTS', from: Y + '-04-20', to: Y + '-05-10', size: 6, metrics: { 'People Served': 30 } }),
  trip({ id: 't4', name: 'Delta DTS', from: Y + '-02-05', to: Y + '-02-25', size: 5, status: 'cancelled' }),
  // applied on the portal and not arrived yet: pending — one still coming, one whose dates have passed
  { ...trip({ id: 't6', name: 'Foxtrot Team', from: Y + '-08-20', to: Y + '-09-02', size: 15 }), candidateId: 'cd_six', pending: true, portalStage: 'docs' },
  { ...trip({ id: 't7', name: 'Golf Team', from: Y + '-07-01', to: Y + '-07-10', size: 4, metrics: { 'People Served': 999 } }), candidateId: 'cd_seven', pending: true, portalStage: 'call2' },
  // last year: one before today's date, one after — so last year's "to date" is one team
  trip({ id: 't8', name: 'Hotel Team', from: (Y - 1) + '-03-01', to: (Y - 1) + '-03-15', size: 10 }),
  trip({ id: 't9', name: 'India Team', from: (Y - 1) + '-09-20', to: (Y - 1) + '-10-01', size: 7 }),
  { ...trip({ id: 't5', name: 'Echo Team', from: (Y + 1) + '-01-05', to: (Y + 1) + '-01-25', size: 9 }), candidateId: 'cd_echo' },   // applied on the portal
];
const WK = weekOf(NOW);
/* Two weeks inside the page's current quarter (this week and a neighbour in the
   same 13-week block) and one in another quarter of the same year, so "the
   quarter" and "the year" differ on any day — first week of a quarter, last
   week, or Q1 (where week 1 is inside the quarter). */
const WK_IN = WK > 1 && quarterOf(WK - 1) === quarterOf(WK) ? WK - 1 : WK + 1;
const WK_OUT = quarterOf(WK) === 0 ? 40 : 1;
const CAFE = { ok: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', entries: { 'Cups Sold': { [WK_OUT]: 1000, [WK_IN]: 270, [WK]: 286 } }, daily: {}, prev: {}, pins: [] };

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  await pinClock(ctx, opts.now || SCENARIO_NOW);
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  let trips = TRIPS.map(t => ({ ...t }));
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    const teamsOut = () => ({ ok: true, campus: 'siemreap', trips: trips.slice().sort((a, b) => a.from < b.from ? 1 : -1), canEdit: who === SOK });
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [SOK, DARA, OVERSEER], logs: [], habits: null, mentees: [], mentorRequests: [],
      goals: [], checkins: [], ministry: who === DARA ? CAFE : null, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [],
      base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] },
      teamTrips: (who === SOK && !opts.noBoot) ? teamsOut() : null };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'getTeamTrips') out = teamsOut();
    else if (b.fn === 'saveTeamTrip') { const d = b.args[2]; const rec = { ...d, id: d.id || 'tt_new' }; const i = trips.findIndex(x => x.id === rec.id); if (i > -1) trips[i] = rec; else trips.push(rec); out = teamsOut(); }
    else if (b.fn === 'deleteTeamTrip') { trips = trips.filter(x => x.id !== b.args[2]); out = teamsOut(); }
    else if (b.fn === 'getMinistryFor') out = { ok: true, campus: 'siemreap', dept: b.args[2], ministry: b.args[3], entries: {}, daily: {}, prev: {}, pins: [] };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4494/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.click('#goMinistryFromMe');
  await page.waitForTimeout(600);
  if (opts.pickTeams) { await page.click('[data-mmpick="Community Service|Outreach Teams"]'); await page.waitForTimeout(400); }
  // Outreach Teams is entered on its own Teams Database page, one tap off My Ministry
  if (!opts.stayOnMinistry && await page.$('#goTeamsDb')) { await page.click('#goTeamsDb'); await page.waitForTimeout(600); }
  return { ctx, page, errors, sent };
}
const tileOf = (page, name) => page.evaluate(n => { const el = [].find.call(document.querySelectorAll('.mmTile'), x => x.querySelector('.mmTileName').textContent.trim() === n); return el ? el.querySelector('.mmTileNum').textContent.trim() : null; }, name);
const state = (page) => page.evaluate(() => ({
  teamsPage: !!document.querySelector('#teamsPage'), strip: !!document.querySelector('.wkStrip'), form: !!document.querySelector('#kpiInputBtn'),
  heading: [].map.call(document.querySelectorAll('h3'), h => h.textContent.trim()),
  cards: [].map.call(document.querySelectorAll('[data-teamcard]'), c => c.querySelector('.rowName b').textContent.trim()),
  add: !!document.querySelector('#teamAddBtn'), edits: document.querySelectorAll('[data-teamedit]').length,
  personalOpen: document.querySelectorAll('[data-personal]').length, personalFold: !!document.querySelector('[data-acc="personal"]'),
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
}));

console.log('=== Outreach Teams staff open on the teams page ===');
{
  const { ctx, page, errors, sent } = await open(SOK, { stayOnMinistry: true });
  let s = await state(page);
  ok('My Ministry for Outreach Teams shows no week strip or metric form — a door to the Teams Database instead', !s.strip && !s.form && !s.teamsPage && await page.$('#goTeamsDb') !== null, JSON.stringify([s.strip, s.form, s.teamsPage]));
  ok('the banner still says which ministry this is', await page.evaluate(() => /Outreach Teams/.test(document.querySelector('#mmBanner').textContent)));
  await page.click('#goTeamsDb');
  await page.waitForTimeout(600);
  s = await state(page);
  ok('the Teams Database page shows the teams', s.teamsPage && await page.evaluate(() => /Teams Database/.test(document.querySelector('h2').textContent)));
  ok('the teams came with boot — no second request', !sent.some(x => x.fn === 'getTeamTrips'));
  ok('the personal numbers are off the page', !s.personalFold && s.personalOpen === 0);
  ok('a team card is short: its dates (and how many days) and how many people', await page.evaluate(() => { const c = document.querySelector('[data-teamcard="t5"]'); if (!c) return false; const tx = c.textContent; return /Jan 5, 2027 → Jan 25, 2027 · 21 days/.test(tx) && /9 people/.test(tx) && !/Hosted by|🎯|No numbers/.test(tx); }));
  const seg = await page.$$eval('[data-teamperiod]', b => b.map(x => x.textContent.trim() + (x.classList.contains('on') ? '*' : '')));
  ok('it opens on Year to date, with the year month by month — Full year, Quarter and Month beside it', seg.join(' | ') === 'Year to date* | Full year | Quarter | Month' && !!(await page.$('#teamYear')), seg.join(' | '));
  ok('the switch is the full width of the page', await page.$eval('.periodSeg', e => e.getBoundingClientRect().width > 340));
  await page.click('[data-teamperiod="year"]');
  await page.waitForTimeout(400);
  s = await state(page);
  ok('Year: the three teams that finished this year are counted', await tileOf(page, 'Teams Hosted') === '3', await tileOf(page, 'Teams Hosted'));
  ok('team members add up across them', await tileOf(page, 'Team Members') === '26', await tileOf(page, 'Team Members'));
  ok('so does each metric', await tileOf(page, 'People Served') === '180' && await tileOf(page, 'Salvations') === '2', await tileOf(page, 'People Served'));
  ok('the men / women split shows', await tileOf(page, 'Men / Women Reached') === '40 / 60', await tileOf(page, 'Men / Women Reached'));
  ok('the cancelled team is not among them, the one still coming is listed separately', !s.cards.slice(0, 3).includes('Delta DTS') && s.heading.some(h => /Here now or coming/.test(h)) && s.cards.includes('Echo Team'), JSON.stringify(s.cards));
  ok('every card offers Edit to its own staff', s.edits === s.cards.length && s.add, s.edits + '/' + s.cards.length);
  ok('nothing scrolls sideways', !s.overflow);

  await page.click('[data-teamperiod="month"]');
  await page.waitForTimeout(300);
  await page.selectOption('#teamMonthSel', '2');
  await page.waitForTimeout(400);
  ok('Month → February: the two that left in February', await tileOf(page, 'Teams Hosted') === '2' && await tileOf(page, 'People Served') === '150', await tileOf(page, 'People Served'));
  await page.click('[data-teamperiod="quarter"]');
  await page.waitForTimeout(300);
  await page.click('[data-teamq="2"]');
  await page.waitForTimeout(400);
  ok('Quarter → Q2: the one that left in May', await tileOf(page, 'Teams Hosted') === '1' && await tileOf(page, 'People Served') === '30');
  await page.click('[data-teamperiod="ytd"]'); await page.waitForTimeout(400);
  ok('YTD: this year up to today — three teams, 26 people', await tileOf(page, 'Teams Hosted') === '3' && await tileOf(page, 'Team Members') === '26' && /2026 to Aug 12 at a glance/.test(await page.evaluate(() => document.querySelector('h3').textContent)));
  const bars = await page.$$eval('.teamYearBar', b => b.map(x => x.querySelector('.teamYearN').textContent + (x.classList.contains('future') ? 'f' : '')));
  ok('the year month by month: two teams in Feb, one in May; months still to come are faded', bars.length === 12 && bars[1] === '2' && bars[4] === '1' && bars[0] === '' && bars[8] === 'f' && bars[7] === '', bars.join(','));
  ok('… with the people under each month', await page.$eval('[data-teamym="2"] .teamYearP', e => e.textContent) === '20');
  const qs = await page.$$eval('.teamYearQ', q => q.map(x => [].map.call(x.children, c => c.textContent).join(' ').replace(/\s+/g, ' ').trim()));
  ok('the four quarters', qs.length === 4 && /^Q1 2 teams 20 people/.test(qs[0]) && /^Q2 1 teams 6 people/.test(qs[1]) && /^Q3 0 teams/.test(qs[2]), qs.join(' | '));
  ok('compared with last year over the same stretch (its October team not counted)', /vs 2025 over the same stretch: 1 teams \(▲ 2\), 10 people \(▲ 16\)/.test(await page.$eval('#teamYearVs', e => e.textContent)), await page.$eval('#teamYearVs', e => e.textContent));
  ok('nothing scrolls sideways with the bars', !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)));
  await page.selectOption('#teamYearSel', String(Y - 1)); await page.waitForTimeout(400);
  ok('YTD for last year: only what had finished by this date', await tileOf(page, 'Teams Hosted') === '1');
  await page.click('[data-teamperiod="year"]'); await page.waitForTimeout(400);
  ok('Year for last year: the whole year', await tileOf(page, 'Teams Hosted') === '2' && !!(await page.$('#teamYear')) && (await page.$$eval('.teamYearBar.future', b => b.length)) === 0);
  await page.selectOption('#teamYearSel', String(Y)); await page.waitForTimeout(400);
  await page.click('[data-teamym="2"]'); await page.waitForTimeout(400);
  ok('tapping a month opens that month', await page.$eval('[data-teamperiod="month"]', b => b.classList.contains('on')) && await page.$eval('#teamMonthSel', s => s.value) === '2' && await tileOf(page, 'Teams Hosted') === '2' && !(await page.$('#teamYear')));
  await page.click('[data-teamperiod="year"]'); await page.waitForTimeout(300);
  await page.click('[data-teamyq="2"]'); await page.waitForTimeout(400);
  ok('tapping a quarter opens that quarter', await page.$eval('[data-teamq="2"]', b => b.classList.contains('on')) && await tileOf(page, 'Teams Hosted') === '1');
  const emptyFirst = await page.evaluate(() => [].map.call(document.querySelectorAll('.mmTile'), x => x.classList.contains('empty')));
  ok('tiles with numbers come before empty ones', emptyFirst.indexOf(true) === -1 || emptyFirst.lastIndexOf(false) < emptyFirst.indexOf(true), emptyFirst.join(','));

  // add a team
  await page.click('#teamAddBtn');
  await page.waitForTimeout(400);
  ok('Add a team opens one form', await page.$('#teamFormCard') !== null && await page.$('#teamAddBtn') === null);
  ok('the form has no Volunteers Mobilized box — it is the team’s own head count', !(await page.$('[data-tfm="Volunteers Mobilized"]')) && !!(await page.$('[data-tfm="People Served"]')));
  await page.click('#teamSaveBtn');
  await page.waitForTimeout(300);
  ok('saving with no name is stopped on the page', !sent.some(x => x.fn === 'saveTeamTrip'));
  await page.fill('[data-tf="name"]', ' Foxtrot DTS ');
  await page.fill('[data-tf="org"]', 'YWAM Perth');
  await page.fill('[data-tf="from"]', Y + '-05-20');
  await page.fill('[data-tf="to"]', Y + '-06-14');
  await page.fill('[data-tf="size"]', '10');
  await page.fill('[data-tf="males"]', '4');
  await page.fill('[data-tf="females"]', '6');
  await page.fill('[data-tf="couples"]', '1');
  await page.fill('[data-tfm="People Served"]', '75');
  await page.fill('[data-tfm="Salvations"]', '3');
  await page.fill('[data-tfr="male"]', '30');
  await page.fill('[data-tfr="female"]', '45');
  await page.click('#teamSaveBtn');
  await page.waitForTimeout(600);
  const sv = sent.find(x => x.fn === 'saveTeamTrip');
  const d = sv && sv.args[2];
  ok('Save posts one whole record', !!d && d.name === 'Foxtrot DTS' && d.campus === 'siemreap' && d.from === Y + '-05-20' && d.to === Y + '-06-14', d && JSON.stringify([d.name, d.from, d.to]));
  ok('with the team’s make-up as numbers', d && d.size === 10 && d.males === 4 && d.females === 6 && d.couples === 1 && d.families === null, d && JSON.stringify([d.size, d.males, d.females, d.couples, d.families]));
  ok('only the metrics that were filled in', d && JSON.stringify(d.metrics) === JSON.stringify({ 'People Served': 75, 'Salvations': 3 }), d && JSON.stringify(d.metrics));
  ok('and the men / women reached', d && d.reached.male === 30 && d.reached.female === 45);
  s = await state(page);
  ok('the form closes and the new team is on the page', !(await page.$('#teamFormCard')) && s.cards.includes('Foxtrot DTS'), JSON.stringify(s.cards));
  ok('Q2 now counts it', await tileOf(page, 'Teams Hosted') === '2' && await tileOf(page, 'People Served') === '105', await tileOf(page, 'People Served'));

  // edit one
  await page.click('[data-teamedit="t3"]');
  await page.waitForTimeout(400);
  const filled = await page.evaluate(() => ({ name: document.querySelector('[data-tf="name"]').value, served: document.querySelector('[data-tfm="People Served"]').value, del: !!document.querySelector('#teamDeleteBtn') }));
  ok('Edit opens the same form filled in, with Delete', filled.name === 'Charlie DTS' && filled.served === '30' && filled.del, JSON.stringify(filled));
  await page.fill('[data-tfm="People Served"]', '35');
  await page.click('#teamSaveBtn');
  await page.waitForTimeout(600);
  const ed = sent.filter(x => x.fn === 'saveTeamTrip')[1];
  ok('saving an edit posts the same id with the change', ed && ed.args[2].id === 't3' && ed.args[2].metrics['People Served'] === 35, ed && JSON.stringify(ed.args[2].metrics));
  page.once('dialog', dlg => dlg.accept());
  await page.click('[data-teamedit="t3"]');
  await page.waitForTimeout(300);
  await page.click('#teamDeleteBtn');
  await page.waitForTimeout(600);
  ok('Delete asks, then posts the id', sent.some(x => x.fn === 'deleteTeamTrip' && x.args[2] === 't3'));
  s = await state(page);
  ok('and the team is gone from the page', !s.cards.includes('Charlie DTS'));
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('\n=== a Cafe member: period toggle, folded personal card, teams read-only ===');
{
  const { ctx, page, errors, sent } = await open(DARA, { now: NOW });
  let s = await state(page);
  ok('the Cafe page keeps its week strip and form button', s.strip && s.form && !s.teamsPage);
  ok('the dashboard opens on the quarter', await page.evaluate(() => document.querySelector('[data-mmperiod].on').getAttribute('data-mmperiod')) === 'quarter');
  const q = await tileOf(page, 'Cups Sold');
  await page.click('[data-mmperiod="year"]');
  await page.waitForTimeout(300);
  const yr = await tileOf(page, 'Cups Sold');
  ok('Year adds the other quarter’s week in; the quarter did not', Number(yr.replace(/,/g, '')) === 1556 && Number(q.replace(/,/g, '')) === 556, q + ' → ' + yr);
  ok('and the heading says so', await page.evaluate(() => document.querySelector('h3').textContent.includes(String(new Date().getFullYear()))));
  await page.click('[data-mmperiod="month"]');
  await page.waitForTimeout(300);
  ok('Month reads “this month”', await page.evaluate(() => /this month/.test(document.querySelector('.mmTileSub').textContent)));
  ok('the personal numbers are off the page for now', !s.personalFold && s.personalOpen === 0);
  ok('a single-ministry member gets no picker — just the banner', await page.evaluate(() => !document.querySelector('[data-mmpick]') && !document.querySelector('#mmBrowseMinSel') && !!document.querySelector('#mmBanner')));

  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('\n=== the department’s overseer: the teams page among the ministries they oversee, as the server allows ===');
{
  // the server answers canEdit — here it says no, so the page must be read-only whatever the role
  const { ctx, page, errors, sent } = await open(OVERSEER, { stayOnMinistry: true });
  await page.waitForTimeout(800);
  ok('the overseer’s My Ministry opens on Campus Leadership (its OKRs and meeting board)', !!(await page.$('#leadOkrs')));
  await page.click('[data-mmpick="Community Service|Cafe"]'); await page.waitForTimeout(800);
  let s = await state(page);
  const chips = await page.evaluate(() => [].map.call(document.querySelectorAll('[data-mmpick]'), b => b.getAttribute('data-mmpick')));
  ok('the overseer picks among the department’s ministries', chips.includes('Community Service|Cafe') && chips.includes('Community Service|Outreach Teams'), chips.join(' , '));
  ok('a weekly ministry of theirs shows its week strip', s.strip && s.form && !s.teamsPage && await page.evaluate(() => document.querySelector('[data-mmpick].on').getAttribute('data-mmpick') !== 'Community Service|Outreach Teams'));
  ok('their own leadership figures are not the default, they sit last in the picker', chips[chips.length - 1] === 'Campus Leadership|Community Service');
  ok('no “Individual — your own numbers” paragraph any more', !(await page.evaluate(() => document.body.innerText.includes('Individual'))));
  await page.click('[data-mmpick="Community Service|Outreach Teams"]');
  await page.waitForTimeout(400);
  await page.click('#goTeamsDb');
  await page.waitForTimeout(700);
  s = await state(page);
  ok('picking Outreach Teams leads to the Teams Database, loaded on demand', sent.some(x => x.fn === 'getTeamTrips' && x.args[2] === 'siemreap') && s.teamsPage);
  ok('canEdit false from the server means no Add and no Edit', !s.add && s.edits === 0, JSON.stringify([s.add, s.edits]));
  await page.click('#teamsDbBack');
  await page.waitForTimeout(400);
  ok('Back returns to My Ministry on Outreach Teams', await page.$('#goTeamsDb') !== null);
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('\n=== pending teams and the calendar ===');
{
  const { ctx, page, errors } = await open(SOK, { stayOnMinistry: true });
  await page.click('#goTeamsDb');
  await page.waitForTimeout(600);
  ok('a team that applied on the portal and has no confirmed flights shows as pending', /⏳ Pending/.test(await page.$eval('[data-teamcard="t6"]', e => e.textContent)) && /15 people/.test(await page.$eval('[data-teamcard="t6"]', e => e.textContent)));
  ok('no Open application button without portal access', !(await page.$('[data-openapp]')));
  await page.evaluate(() => { S.me.portal = true; render(); });
  await page.waitForTimeout(200);
  ok('with portal access, Open application goes straight to that team in the staff portal', (await page.$eval('[data-teamcard="t6"] [data-openapp]', a => a.getAttribute('href') + '|' + a.target)) === 'portal.html?open=cd_six|_blank' && !(await page.$('[data-teamcard="t1"] [data-openapp]')));
  ok('a pending team whose dates have passed is still listed as coming, not counted', await page.evaluate(() => { const h = document.getElementById('teamsComing'); return !!h && /pending/.test(h.textContent) && !!document.querySelector('[data-teamcard="t7"]'); }) && !/999/.test(await page.$eval('.mmGrid', e => e.textContent)));
  await page.click('[data-teamperiod="year"]');
  await page.waitForTimeout(300);
  ok('and its numbers stay off the dashboard until it arrives', !/999/.test(await page.$eval('.mmGrid', e => e.textContent)));
  await page.click('[data-teamview="cal"]');
  await page.waitForTimeout(300);
  ok('the calendar opens on this month', /Aug/.test(await page.$eval('.calTitle', e => e.textContent)) && /2026/.test(await page.$eval('.calTitle', e => e.textContent)));
  const bars = await page.$$eval('.calBar', b => b.map(x => x.getAttribute('data-calteam') + ':' + x.className.replace('calBar ', '')));
  ok('a pending team is a bar across its days, split where the week ends', bars.filter(b => b.startsWith('t6:pend')).length === 3 && bars.some(b => b === 't6:pend more') && bars.some(b => b === 't6:pend cont'), bars.join(', '));
  ok('today is marked', !!(await page.$('.calDay.today')));
  ok('the month’s teams are listed under it, with dates, people and pending', /Teams in Aug 2026/.test(await page.$eval('#main', e => e.textContent)) && /15 people/.test(await page.$eval('.calRow[data-calteam="t6"]', e => e.textContent)) && /Pending/.test(await page.$eval('.calRow[data-calteam="t6"]', e => e.textContent)));
  await page.screenshot({ path: '/tmp/claude-0/-home-user-YWAM-GP-App/049e081b-2b7b-5a4f-8de8-03dd6a8372e6/scratchpad/cal-aug.png', fullPage: true }).catch(() => {});
  await page.click('.calBar[data-calteam="t6"]');
  await page.waitForTimeout(300);
  ok('tapping a bar opens that team’s card', !!(await page.$('#main [data-teamcard="t6"]')));
  await page.click('#calPrev');
  await page.waitForTimeout(300);
  ok('‹ goes back a month', /Jul/.test(await page.$eval('.calTitle', e => e.textContent)) && (await page.$$eval('.calBar', b => b.map(x => x.getAttribute('data-calteam')))).includes('t7'));
  await page.click('#calToday');
  await page.waitForTimeout(300);
  ok('Today comes back', /Aug/.test(await page.$eval('.calTitle', e => e.textContent)));
  ok('the calendar fits a phone', !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)));
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
