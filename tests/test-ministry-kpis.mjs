/* Every KPI the dashboard asks of a ministry, on that ministry's own page.

   My week carries the whole log form now, split by how each number behaves:

     · counts (sum)            — typed per DAY, rolled into the week by the server
     · levels + scores (latest/avg) — typed once for the WEEK, carried forward

   The split is the part that has to hold. A headcount written as a daily row is
   wrong twice: you do not add up students, and the daily roll-up owns any metric
   it touches, so the two writers would fight over the same weekly cell. This
   drives the real pages and captures what they send. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer(function (req, res) {
  const f = path.join(ROOT, req.url.split('?')[0]);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

/* Sreilea runs the Cafe: Days Open / Cups Sold / Customers Served / Gospel
   Conversations / Salvations are counts, and the money ones are levels — so this
   ministry exercises both cards and the $ format at once. */
const ME = { id: 'st1', name: 'Sreilea Chan', username: 'sreilea', campus: 'siemreap',
  dept: 'Community Service', ministry: 'Cafe', role: 'Cafe manager', photo: '', mentorId: '',
  staffType: 'ministry', country: 'Cambodia' };

const WK = (function () {           // the page's own week maths, mirrored
  const d = new Date(), y = d.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1));
})();
const LASTWK = WK - 1;

/* Deliberately: the money levels were last recorded LAST week and never this
   week, which is exactly the case carry-forward exists for. */
const MINISTRY = {
  ok: true, campus: ME.campus, dept: ME.dept, ministry: ME.ministry,
  entries: {
    'Cups Sold': { [WK]: 286, [LASTWK]: 270 },
    'Days Open': { [WK]: 5 },
    'Total in Bank Account ($)': { [LASTWK]: 1450 },
    // up on last week; expenses are DOWN, which has to read as good news
    'Weekly Profit ($)': { [WK]: 140, [LASTWK]: 120 },
    'Weekly Expenses ($)': { [WK]: 280, [LASTWK]: 300 },
    'Gospel Conversations': { [WK]: 10 },          // first week ever: nothing to compare
  },
  daily: { 'Cups Sold': { [todayStr()]: 55 } },
  pins: ['Cups Sold', 'Days Open', 'Customers Served', 'Gospel Conversations'],
};
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

const BOOT = {
  ok: true, staff: ME, profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: [ME], logs: [], habits: null, mentees: [], mentorRequests: [],
  goals: [], checkins: [], trips: { ok: true, trips: [], years: {} }, tripRequests: [],
  ministry: MINISTRY,
  base: { leader: false, entries: {}, okrs: [], survey: [], roster: [ME] },
};

const sent = [];
const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext(devices['iPhone 13']);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
/* The font stylesheet is deliberately aborted above, so its failure is this
   test's own doing, not the page's. */
page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_FAILED/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
await page.route('**fonts.g**', r => r.abort());
await page.route('**/api', function (r) {
  const b = r.request().postDataJSON() || {};
  sent.push(b);
  let out = { ok: false, err: 'unstubbed:' + b.fn };
  if (b.fn === 'getMyBoot') out = BOOT;
  else if (b.fn === 'getData') out = BOOT.base;
  else if (b.fn === 'saveMyKpiDay' || b.fn === 'saveMyMinistry') out = MINISTRY;
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })));
await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
await page.waitForSelector('nav.bottom button', { timeout: 15000 });
await page.click('nav.bottom button:nth-child(2)');          // My week
// the KPI cards live inside collapsed-by-default accordion rows now
await page.click('[data-acc="kpiDay"]');
await page.click('[data-acc="kpiWeek"]');
await page.waitForSelector('#kpiDayCard', { timeout: 10000 });
await page.waitForTimeout(400);

const modeOf_ = (pairs, metric) => (pairs.find(x => x.slice(0, metric.length + 1) === metric + ':') || '').split(':').pop();

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* ---------- 1. every metric the ministry has is reachable ---------- */
{
  await page.click('#kpiShowAll').catch(() => {});
  await page.waitForTimeout(300);
  const shown = await page.evaluate(() => ({
    day: [].map.call(document.querySelectorAll('[data-kpi]'), i => i.getAttribute('data-kpi')),
    week: [].map.call(document.querySelectorAll('[data-kpiweek]'), i => i.getAttribute('data-kpiweek')),
  }));
  const all = await page.evaluate(() => metricsFor('siemreap', 'Community Service', 'Cafe'));
  const together = shown.day.concat(shown.week).sort();
  ok('the ministry’s whole metric list is on the page',
    JSON.stringify(together) === JSON.stringify(all.slice().sort()),
    together.length + ' of ' + all.length);
  /* Which card each one lands in is the decision under test. */
  ok('counts are in the daily card', shown.day.indexOf('Cups Sold') > -1 && shown.day.indexOf('Days Open') > -1);
  /* Which side a metric falls on is modeOf()'s call, not a guess about the name:
     a bank balance is a level, while a weekly profit accumulates over the year and
     is a count — exactly as the dashboard reads them. */
  const modes = await page.evaluate(ms => ms.map(m => m + ':' + modeOf(m)), all);
  ok('levels are in the weekly card, counts are not',
    shown.week.every(m => modeOf_(modes, m) !== 'sum') && shown.day.every(m => modeOf_(modes, m) === 'sum'),
    'week: ' + shown.week.join(', '));
  ok('the bank balance is a level', shown.week.indexOf('Total in Bank Account ($)') > -1, shown.week.join(', '));
  ok('weekly profit is a count, like the dashboard reads it', shown.day.indexOf('Weekly Profit ($)') > -1);
  ok('no metric appears in both', shown.day.every(m => shown.week.indexOf(m) === -1));
}

/* ---------- 2. the numbers that carry over, carry over ---------- */
{
  const carried = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-kpiweek]').forEach(function (i) {
      out[i.getAttribute('data-kpiweek')] = { value: i.value, carried: i.hasAttribute('data-carried') };
    });
    return out;
  });
  ok('last week’s bank balance is filled in already',
    carried['Total in Bank Account ($)'].value === '1450', JSON.stringify(carried['Total in Bank Account ($)']));
  ok('and is marked as carried rather than typed',
    carried['Total in Bank Account ($)'].carried === true);
  const sub = await page.evaluate(() =>
    [].find.call(document.querySelectorAll('#kpiWeekCard .row'),
      r => /Total in Bank/.test(r.textContent)).querySelector('.rowSub').textContent.trim());
  ok('the row says where the figure came from', /carried from week\s*' + LASTWK + '/.test(sub) || /carried from week/.test(sub), sub);
  ok('money keeps its format', /\$1,450/.test(sub), sub);
}

/* ---------- 3. a count says what the week becomes ---------- */
{
  const before = await page.evaluate(() =>
    [].find.call(document.querySelectorAll('#kpiDayCard .row'), r => /Cups Sold/.test(r.textContent))
      .querySelector('.rowSub').textContent.trim());
  ok('a count shows the week total so far', /286/.test(before), before);
  await page.fill('#kpiDayCard input[data-kpi="Cups Sold"]', '60');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() =>
    [].find.call(document.querySelectorAll('#kpiDayCard .row'), r => /Cups Sold/.test(r.textContent))
      .querySelector('.newTot').textContent.trim());
  /* 286 already includes today's saved 55, so replacing today with 60 makes 291 —
     not 346. Counting today twice is the bug this assertion exists for. */
  ok('typing today updates the week without double-counting today', after === '→ 291', JSON.stringify(after));
}

/* ---------- 3b. last week, next to this week ---------- */
{
  const rows = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('#kpiDayCard .row, #kpiWeekCard .row').forEach(function (r) {
      const name = r.querySelector('.rowName');
      const sub = r.querySelector('.rowSub');
      if (name && sub) out[name.textContent.trim()] = { text: sub.textContent.trim(), html: sub.innerHTML };
    });
    return out;
  });
  const profit = rows['Weekly Profit ($)'] || { text: '(missing)', html: '' };
  ok('a count shows last week beside this week', / last week \$120/.test(profit.text), profit.text);
  ok('and which way it went, in percent', /▲ 17%/.test(profit.text), profit.text);
  ok('a rise in profit reads as good news', /class="trend up"/.test(profit.html));

  /* The one that would be wrong if the badge just followed the arrow: spending
     less is better, so a fall has to be green. */
  const exp = rows['Weekly Expenses ($)'] || { text: '(missing)', html: '' };
  ok('expenses falling is shown as good news', /class="trend up"/.test(exp.html) && /▼ 7%/.test(exp.text), exp.text);

  /* A first week has no baseline. Inventing zero would print "▲ 100%" and mean
     nothing. */
  const first = rows['Gospel Conversations'] || { text: '(missing)', html: '' };
  ok('a first week says nothing about a rise', !/last week/.test(first.text) && !/trend/.test(first.html), first.text);

  ok('cups sold compares too', / last week 270/.test((rows['Cups Sold'] || {}).text || ''), (rows['Cups Sold'] || {}).text);
}

/* ---------- 4. each card writes through its own door ---------- */
{
  sent.length = 0;
  await page.click('#saveKpiBtn');
  await page.waitForTimeout(600);
  const day = sent.find(s => s.fn === 'saveMyKpiDay');
  ok('the daily card saves the day', !!day, day && JSON.stringify(day.args[2]));
  ok('and sends only counts, every one as sum mode',
    !!day && day.args[3].length > 0 && day.args[3].every(u => u.mode === 'sum'),
    day && day.args[3].map(u => u.metric + ':' + u.mode).join(', '));
  const dayModes = await page.evaluate(ms => ms.map(m => m + ':' + modeOf(m)),
    day ? day.args[3].map(u => u.metric) : []);
  ok('no level is ever written as a day',
    dayModes.every(x => x.split(':').pop() === 'sum'), dayModes.join(', '));

  sent.length = 0;
  await page.waitForSelector('#saveKpiWeekBtn');
  await page.click('#saveKpiWeekBtn');
  await page.waitForTimeout(600);
  const wkCall = sent.find(s => s.fn === 'saveMyMinistry');
  ok('the weekly card saves the week', !!wkCall && wkCall.args[2] === WK, wkCall && 'week ' + wkCall.args[2]);
  const names = wkCall ? wkCall.args[3].map(u => u.metric) : [];
  ok('it sends the levels', names.indexOf('Total in Bank Account ($)') > -1, names.join(', '));
  ok('it sends no counts', names.every(m => ['Cups Sold', 'Days Open', 'Customers Served'].indexOf(m) === -1));
  /* A carried figure has to be written, or "unchanged" would read as "no data"
     for that week and the carry-forward would never become real. */
  const bank = wkCall && wkCall.args[3].find(u => u.metric === 'Total in Bank Account ($)');
  ok('a carried figure is written for this week too', !!bank && bank.value === 1450, bank && String(bank.value));
}

/* ---------- 5. typing survives a re-render ---------- */
{
  await page.fill('#kpiWeekCard input[data-kpiweek="Total in Bank Account ($)"]', '1500');
  await page.evaluate(() => render());
  await page.waitForTimeout(300);
  const kept = await page.$eval('#kpiWeekCard input[data-kpiweek="Total in Bank Account ($)"]', i => i.value);
  ok('a number typed into the week is not lost by a re-render', kept === '1500', kept);
  const delta = await page.evaluate(() =>
    [].find.call(document.querySelectorAll('#kpiWeekCard .row'), r => /Total in Bank/.test(r.textContent))
      .querySelector('.rowSub').textContent.trim());
  /* 1500 typed against last week's 1450 — the row should say what changed, in the
     metric's own format, without waiting for a save. */
  ok('and the change against last week is shown', /▲ \$50/.test(delta), delta);
}

/* ---------- 6. a 1-10 score is bounded, not free ---------- */
{
  await ctx.close();
  const c2 = await browser.newContext(devices['iPhone 13']);
  const p2 = await c2.newPage();
  const ME2 = { ...ME, dept: 'Skills Training', ministry: 'Culinary' };
  await p2.route('**fonts.g**', r => r.abort());
  await p2.route('**/api', function (r) {
    const b = r.request().postDataJSON() || {};
    let out = { ok: false };
    if (b.fn === 'getMyBoot') out = { ...BOOT, staff: ME2, roster: [ME2],
      ministry: { ok: true, campus: ME2.campus, dept: ME2.dept, ministry: ME2.ministry, entries: {}, daily: {}, pins: [] } };
    else if (b.fn === 'getData') out = BOOT.base;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await p2.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })));
  await p2.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await p2.waitForSelector('nav.bottom button');
  await p2.click('nav.bottom button:nth-child(2)');
  await p2.click('[data-acc="kpiWeek"]');
  await p2.waitForSelector('#kpiWeekCard', { timeout: 10000 });
  const score = await p2.$eval('input[data-kpiweek="Food Taste (1-10)"]', i =>
    ({ min: i.min, max: i.max }));
  ok('a 1-10 score cannot be typed as 50', score.min === '1' && score.max === '10', JSON.stringify(score));
  await c2.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
