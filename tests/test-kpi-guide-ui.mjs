/* The KPI quick wins, on the page: an ⓘ beside each metric that opens the KPI
   guide's line on what to count (hidden until tapped, never disturbing a number
   half typed, in Khmer when the app is), and a 1–10 score that is caught before
   it is saved when it is out of range. Outreach Teams is left as it is. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  let u = req.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(PUBLIC, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

const YEAR = new Date().getFullYear();
const WK = (() => { const j = new Date(YEAR, 0, 1), m = new Date(YEAR, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((new Date() - m) / (7 * 86400000)) + 1)); })();
const TODAY = new Date().toLocaleDateString('en-CA');
const Q = Math.min(4, Math.floor(new Date().getMonth() / 3) + 1);


function boot(dept, ministry, entries) {
  const ME = { id: 'st1', name: 'Sreilea Chan', username: 'sreilea', campus: 'siemreap',
    dept, ministry, role: 'Staff', photo: '', mentorId: '', staffType: 'ministry', country: 'Cambodia' };
  const MIN = { ok: true, campus: ME.campus, dept, ministry, entries, daily: {}, prev: {}, pins: [] };
  const DASH = { leader: false, entries: { siemreap: {}, poipet: {} }, okrs: [], survey: [], roster: [ME] };
  return { MIN, DASH, BOOT: { ok: true, staff: ME, profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
    roster: [ME], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, reasons: { work: ['Trip'], personal: ['Family'] }, hasMentor: false },
    tripRequests: [], ministry: MIN, base: DASH, smartGoals: [], oneOnOnes: [], broadcasts: [] } };
}

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
let saves = [];
async function open(data, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  await page.route('**/api', r => {
    const b = r.request().postDataJSON() || {};
    let out = { ok: false };
    if (b.fn === 'getMyBoot') out = data.BOOT;
    else if (b.fn === 'getData') out = data.DASH;
    else if (b.fn === 'getMyMinistry') out = data.MIN;
    else if (b.fn === 'saveMyMinistry') { saves.push(b.args[3]); out = data.MIN; }
    else if (b.fn === 'getMySmartGoals') out = { ok: true, smartGoals: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(km => {
    localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' }));
    sessionStorage.setItem('gp-skip-teams', '1');
    if (km) localStorage.setItem('gp-lang', 'km');
  }, !!opts.km);
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(400);
  await page.click('nav.bottom [data-tab="ministry"]'); await page.waitForTimeout(400);
  // the boxes open by themselves for a week with nothing in; tap only if they are still shut (any language)
  if (await page.$('#kpiInputBtn') && !(await page.$('[data-kpiweek], [data-kpi]'))) { await page.click('#kpiInputBtn'); await page.waitForTimeout(400); }
  return { ctx, page };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
const glossOf = (page, metric) => page.evaluate(m => {
  const input = document.querySelector('[data-kpiweek="' + m + '"], [data-kpi="' + m + '"]');
  const row = input && input.closest('.row');
  const line = row && row.querySelector('.kpiGlossLine');
  return line ? { shown: !line.hidden, text: line.textContent } : null;
}, metric);
const infoBtn = (page, metric) => page.evaluateHandle(m => {
  const input = document.querySelector('[data-kpiweek="' + m + '"], [data-kpi="' + m + '"]');
  return input && input.closest('.row').querySelector('[data-kpiinfo]');
}, metric);

/* ---------- 1. what to count, beside the box ---------- */
const CUL = boot('Skills Training', 'Culinary', { 'Food Taste (1-10)': { [WK - 1]: 8 } });
{
  const { ctx, page } = await open(CUL);
  ok('every Culinary box has an ⓘ', (await page.$$('[data-kpiinfo]')).length >= 10, String((await page.$$('[data-kpiinfo]')).length));
  let g = await glossOf(page, 'Food Taste (1-10)');
  ok('the description starts hidden, so the list stays short', g && !g.shown);
  await page.fill('[data-kpi="People Cooked For"]', '42');
  await (await infoBtn(page, 'Food Taste (1-10)')).click(); await page.waitForTimeout(150);
  g = await glossOf(page, 'Food Taste (1-10)');
  ok('tapping ⓘ shows what to count', g && g.shown && g.text === 'How the food tasted, 1–10.', g && g.text);
  ok('without losing a number half typed', (await page.inputValue('[data-kpi="People Cooked For"]')) === '42');
  await (await infoBtn(page, 'Food Taste (1-10)')).click(); await page.waitForTimeout(150);
  ok('tapping again hides it', !(await glossOf(page, 'Food Taste (1-10)')).shown);

  /* ---------- 2. a score has edges ---------- */
  saves = [];
  await page.fill('[data-kpiweek="Food Taste (1-10)"]', '70');
  await page.click('#saveKpiWeekBtn'); await page.waitForTimeout(300);
  const msg = await page.$eval('#msg', e => e.textContent);
  ok('a 70 for a 1–10 score is caught before saving', saves.length === 0 && /Food Taste \(1-10\) goes from 1 to 10/.test(msg), msg);
  await page.fill('[data-kpiweek="Food Taste (1-10)"]', '7');
  await page.click('#saveKpiWeekBtn'); await page.waitForTimeout(400);
  ok('a 7 saves as before', saves.length === 1 && saves[0].some(u => u.metric === 'Food Taste (1-10)' && u.value === 7));
  await ctx.close();
}

/* ---------- 3. in Khmer ---------- */
{
  const { ctx, page } = await open(CUL, { km: true });
  await (await infoBtn(page, 'Food Taste (1-10)')).click(); await page.waitForTimeout(150);
  const g = await glossOf(page, 'Food Taste (1-10)');
  ok('the description is in Khmer when the app is', g && /[ក-៿]/.test(g.text), g && g.text);
  await ctx.close();
}

/* ---------- 4. Outreach Teams is left as it is ---------- */
{
  const { ctx, page } = await open(boot('Community Service', 'Outreach Teams', {}));
  ok('Outreach Teams shows no ⓘ', (await page.$$('[data-kpiinfo]')).length === 0);
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
