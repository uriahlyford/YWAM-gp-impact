/* Typing a number into a box that already has one.

   Uriah: "the numbers entering where they start at 0 you have to delete the
   zero and it's annoying."

   Two separate faults behind that. Some boxes were pre-filled with 0 as a
   DEFAULT — nothing had been entered, the code just wrote 0 — so the first job
   on every visit was deleting a number nobody typed. And every box that
   legitimately holds a figure (today's hours, a headcount carried from last
   week, a saved 0) put the caret beside it on tap, so "5" became "05" or "50".

   So: a default is an empty box with a 0 placeholder, and focusing any number
   box selects what is in it, which makes the first keystroke replace rather
   than append. A deliberate second tap still edits in place — that is asserted
   here too, because "select everything, always" would make correcting one digit
   of a four-digit bank balance impossible. */
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

const ME = { id: 'st1', name: 'Sreilea Chan', username: 'sreilea', campus: 'siemreap',
  dept: 'Community Service', ministry: 'Cafe', role: 'Cafe manager', photo: '', mentorId: '',
  staffType: 'ministry', country: 'Cambodia' };
/* Deliberately: a saved ZERO (Days Open), a saved figure (Cups Sold), and a
   level whose only figure is last week's — the three shapes a box arrives in. */
const MIN = { ok: true, campus: ME.campus, dept: ME.dept, ministry: ME.ministry,
  entries: { 'Cups Sold': { [WK]: 286 }, 'Days Open': { [WK]: 0 },
    'Total in Bank Account ($)': { [WK - 1]: 1450 } },
  daily: { 'Cups Sold': { [TODAY]: 55 }, 'Days Open': { [TODAY]: 0 } },
  prev: {}, pins: [] };
const OKRS = [{ id: 'o1', campus: 'siemreap', quarter: Q, dept: 'Community Service',
  objective: 'The cafe pays for itself',
  krs: [{ text: 'Tracked by hand', metricKey: '', target: 0, manual: 0 }] }];
const SMART = [{ id: 'sg1', year: YEAR, category: 'Faith', title: 'Read the Bible through', meta: '', pct: 0 }];
const DASH = { leader: true, entries: { siemreap: {}, poipet: {} }, okrs: OKRS, survey: [], roster: [ME] };
const BOOT = { ok: true, staff: ME, profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: [ME], logs: [{ date: TODAY, week: WK, langHours: 0, minHours: 0, workout: false,
    bible: true, quietTime: true, oneOnOne: false, sharedFaith: false, sabbath: false,
    clarity: 8, growth: 7, lonely: 2, porn: false, habits: { bible: true, quietTime: true } }],
  habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
  trips: { ok: true, trips: [], totals: {}, reasons: { work: ['Trip'], personal: ['Family'] }, hasMentor: false },
  tripRequests: [], ministry: MIN, base: DASH, smartGoals: SMART, oneOnOnes: [], broadcasts: [] };

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
async function open(url) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  await page.route('**/api', r => {
    const b = r.request().postDataJSON() || {};
    let out = { ok: false };
    if (b.fn === 'getMyBoot') out = BOOT;
    else if (b.fn === 'getData') out = DASH;
    else if (b.fn === 'getMyMinistry') out = MIN;
    else if (b.fn === 'getMySmartGoals') out = { ok: true, smartGoals: SMART };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(() => {
    localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' }));
    /* A signed-in session sends index.html straight to teams.html; this is the
       same flag the app itself sets when a leader chooses the dashboard. */
    sessionStorage.setItem('gp-skip-teams', '1');
  });
  await page.goto(BASE + url, { waitUntil: 'load' });
  return { ctx, page };
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const { ctx, page } = await open('/teams.html');
await page.waitForSelector('nav.bottom button', { timeout: 15000 });
await page.click('nav.bottom button[data-tab="week"]');
await page.waitForTimeout(400);

/* ---------- 1. typing replaces, whatever the box arrived holding ---------- */
{
  await page.click('#goMinistryFromMe');
  await page.waitForTimeout(400);
  for (const acc of ['kpiDay', 'kpiWeek']) {
    const el = await page.$('[data-acc="' + acc + '"]');
    if (el) { await el.click(); await page.waitForTimeout(250); }
  }
  const cases = [
    ['[data-kpi="Days Open"]', 'a saved zero', '0'],
    ['[data-kpi="Cups Sold"]', 'a saved figure', '55'],
    ['[data-kpiweek="Total in Bank Account ($)"]', 'a carried level', '1450']
  ];
  for (const [sel, label, was] of cases) {
    const el = await page.$(sel);
    if (!el) { ok('typing over ' + label, false, 'input ' + sel + ' not on the page'); continue; }
    ok(label + ' starts as expected', (await el.inputValue()) === was, 'value ' + (await el.inputValue()));
    await el.click();
    await page.waitForTimeout(120);
    await page.keyboard.type('7');
    ok('typing over ' + label + ' replaces it', (await el.inputValue()) === '7',
      'got "' + (await el.inputValue()) + '"');
  }
}

/* ---------- 2. a second tap still edits in place ---------- */
/* Without this, correcting one digit of 1450 would mean retyping all four. */
{
  const el = await page.$('[data-kpiweek="Total in Bank Account ($)"]');
  await page.evaluate(() => { S.kpiWeekDraft = {}; render(); });
  await page.waitForTimeout(250);
  const box = await page.$('[data-kpiweek="Total in Bank Account ($)"]');
  await box.click();                       // first tap: selects
  await page.waitForTimeout(120);
  await box.click();                       // second tap: caret, no selection
  await page.waitForTimeout(120);
  await page.keyboard.press('End');
  await page.keyboard.type('9');
  const v = await box.inputValue();
  ok('a second tap lets you edit in place rather than retype', v === '14509', 'got "' + v + '"');
}

/* ---------- 3. nothing is pre-filled with a 0 nobody typed ---------- */
{
  await page.click('nav.bottom button[data-tab="week"]');
  await page.waitForTimeout(300);
  const sg = await page.$('[data-smartedit], #smartAddBtn, [data-sgedit]');
  if (sg) { await sg.click(); await page.waitForTimeout(350); }
  const pct = await page.$('#sg_pct');
  ok('an annual goal\'s progress box is empty, not 0',
    !!pct && (await pct.inputValue()) === '' && (await pct.getAttribute('placeholder')) === '0',
    pct ? 'value "' + (await pct.inputValue()) + '" placeholder "' + (await pct.getAttribute('placeholder')) + '"' : 'no #sg_pct');
}

/* ---------- 4. and the dashboard shares the behaviour ---------- */
/* It lives in rollup.js so the two pages cannot drift; a hand-typed OKR
   percentage is the box the dashboard has. */
{
  await ctx.close();
  const two = await open('/index.html');
  await two.page.waitForTimeout(1200);
  const has = await two.page.evaluate(() => typeof gpSelectNumberOnFocus === 'function' && !!window.__gpNumSel);
  ok('the dashboard installs the same behaviour', has);
  /* The hand-tracked percentage lives on the OKR view. */
  /* The dashboard opens on Poipet; this objective is Siem Reap's. */
  await two.page.waitForSelector('[data-campus="siemreap"]', { timeout: 10000 });
  await two.page.click('[data-campus="siemreap"]');
  await two.page.waitForTimeout(300);
  await two.page.click('[data-view="okr"]');
  await two.page.waitForTimeout(600);
  const man = await two.page.$('.manualIn');
  if (man) {
    ok('a hand-tracked OKR percentage is empty, not 0', (await man.inputValue()) === '',
      'value "' + (await man.inputValue()) + '"');
    await man.click();
    await two.page.waitForTimeout(120);
    await two.page.keyboard.type('40');
    ok('and typing into it works', (await man.inputValue()) === '40', 'got "' + (await man.inputValue()) + '"');
  } else {
    ok('a hand-tracked OKR percentage is on the dashboard', false, 'no .manualIn found');
  }
  await two.ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
