/* Scrolling on a touch screen, over the controls that sit in the way of it.

   Reported as "the app doesn't scroll on Android". It did scroll — just not from
   anywhere your thumb was likely to land. Two rules said so:

     .sliderWrap input[type=range]  touch-action: none    (every 1-10 question)
     .quickBar                      touch-action: pan-x   (top of My Database)

   `none` forbids panning outright and `pan-x` permits only the horizontal axis,
   so a gesture starting on either could not scroll the page at all. Both are
   full width, and the Health tab stacks several sliders down its length, so most
   of what you see is somewhere a swipe does nothing.

   The other half is what happens once the swipe IS allowed through: the browser
   moves a range input's value on touch DOWN, before it knows the gesture was a
   scroll. Scrolling past a health question answered it, and scrolling past
   Weekly Goals answered AND SAVED it. gpSlideGuard() puts both back.

   This has to drive the real input pipeline — CDP Input.dispatchTouchEvent —
   because touch-action is a browser gesture decision that synthetic TouchEvents
   dispatched from JS never consult. On an Android device profile, which is where
   it was seen. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const P = 'poipet';

/* The week the pages compute for themselves, the same way they do it. */
const WK = (() => {
  const y = new Date().getFullYear(), j = new Date(y, 0, 1);
  const m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((new Date() - m) / (7 * 86400000)) + 1));
})();

const ROSTER = [{ id: 'a', name: 'Sokha Chan', username: 'sokha', campus: P, dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, photo: '', mentorId: '', staffType: 'campus', country: 'Cambodia' }];
const E = { [P]: {
  'Community Service|Outreach Teams|Salvations': { [WK]: 12 },
  'Community Service|Outreach Teams|Teams Hosted': { [WK]: 2 },
  'Community Service|Outreach Teams|People Served': { [WK]: 300 },
} };
/* No check-in for this week, so the Health tab opens its form rather than a
   summary — the sliders only exist while the form is open. */
const DATA = { leader: false, year: new Date().getFullYear(), entries: E, okrs: [], survey: [], roster: ROSTER };
const GOALS = [{ user: 'sokha', week: WK, items: [
  { text: 'Visit three villages', pct: 40 },
  { text: 'Debrief every team', pct: 20 },
] }];
const BOOT = {
  ok: true, staff: ROSTER[0], profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: ROSTER, logs: [], habits: null, mentees: [], mentorRequests: [], goals: GOALS, checkins: [],
  trips: { ok: true, trips: [], years: {} }, tripRequests: [], oneOnOnes: [], smartGoals: [],
  ministry: { ok: true, campus: P, dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, daily: {}, pins: [] },
  base: { leader: false, entries: E, okrs: [], survey: [] },
};

const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png' };
const srv = http.createServer(function (req, res) {
  const f = path.join(ROOT, req.url.split('?')[0]);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;
const browser = await chromium.launch({ executablePath: CHROMIUM });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* A Pixel, not an iPhone: this is the platform it was reported on, and the one
   whose Chrome applies touch-action to the letter. */
const ANDROID = {
  viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
};

const calls = [];
const ctx = await browser.newContext(ANDROID);
const page = await ctx.newPage();
await page.route('**fonts.g**', r => r.abort());
await page.route('**/api', async function (r) {
  const fn = (r.request().postDataJSON() || {}).fn;
  calls.push(fn);
  const body = fn === 'getMyBoot' ? BOOT
    : fn === 'saveGoals' ? { ok: true, goals: GOALS }
    : DATA;
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
});
await page.addInitScript(function () {
  try {
    localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
    sessionStorage.setItem('gp-skip-teams', '1');
  } catch (e) { }
});
await page.goto(BASE + '/teams.html', { waitUntil: 'commit' });
await page.waitForSelector('nav.bottom button', { timeout: 20000 });
await page.waitForTimeout(900);

const cdp = await ctx.newCDPSession(page);

/* One finger down, a run of moves, then up — through the browser's own input
   pipeline, so touch-action decides what the gesture is allowed to do. */
async function swipe(sel, dx, dy) {
  await page.$eval(sel, el => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(250);
  const box = await page.locator(sel).first().boundingBox();
  if (!box) return null;
  const x0 = Math.round(box.x + box.width / 2), y0 = Math.round(box.y + box.height / 2);
  const before = await page.evaluate(() => Math.round(window.scrollY));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ x: Math.round(x0 + dx * i / 12), y: Math.round(y0 + dy * i / 12) }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(450);
  const after = await page.evaluate(() => Math.round(window.scrollY));
  return { moved: after - before, before, after };
}

/* ---------- 1. the Health tab's 1-10 sliders ---------- */
console.log('\n=== HEALTH SLIDERS ===');
await page.click('nav.bottom [data-tab="health"]');
await page.waitForTimeout(700);
await page.evaluate(w => { S.healthWeek = w; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, WK);
await page.waitForTimeout(700);

const nSliders = await page.$$eval('#weekForm [data-wslide]', e => e.length);
ok('the weekly form is open with its sliders', nSliders > 0, nSliders + ' sliders');

const FIRST = '#weekForm [data-wslide="lonely"]';
const slideState = () => page.evaluate(() => {
  const sl = document.querySelector('#weekForm [data-wslide]');
  const block = sl.closest('.qBlock');
  return { id: sl.getAttribute('data-wslide'), value: sl.value,
    readout: block.querySelector('.qReadout').textContent,
    draft: JSON.stringify(S.weekDraft || {}) };
});

const s0 = await slideState();
const up = await swipe(FIRST, 0, -220);
const s1 = await slideState();
ok('an upward swipe starting on a slider scrolls the page', up && up.moved > 40, 'moved ' + (up && up.moved) + 'px');
ok('…and does not answer the question it swiped past', s1.value === s0.value && s1.readout === s0.readout,
  s0.value + ' -> ' + s1.value + ', readout ' + s1.readout);
ok('…and leaves the draft with no answer recorded for it',
  !JSON.parse(s1.draft).hasOwnProperty(s0.id), 'draft ' + s1.draft);

/* The same slider must still be a slider. */
const drag = await swipe(FIRST, 140, 0);
const s2 = await slideState();
ok('a sideways drag still moves the slider', Number(s2.value) > Number(s0.value), s0.value + ' -> ' + s2.value);
ok('…and does not scroll the page while doing it', drag && drag.moved === 0, 'moved ' + (drag && drag.moved) + 'px');
ok('…and that answer IS recorded', JSON.parse(s2.draft)[s0.id] === Number(s2.value), 'draft ' + s2.draft);

/* ---------- 2. the quick-jump strip on My Database ---------- */
console.log('\n=== QUICK-JUMP STRIP ===');
await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(900);
const hasBar = await page.evaluate(() => !!document.querySelector('.quickBar'));
ok('My Database has its quick-jump strip', hasBar);

const barUp = await swipe('.quickBar', 0, -220);
ok('an upward swipe starting on the strip scrolls the page', barUp && barUp.moved > 40, 'moved ' + (barUp && barUp.moved) + 'px');

await page.evaluate(() => { document.querySelector('.quickBar').scrollLeft = 0; });
const barSide = await swipe('.quickBar', -220, 0);
const barLeft = await page.evaluate(() => Math.round(document.querySelector('.quickBar').scrollLeft));
ok('a sideways swipe still scrolls the chips', barLeft > 20, 'scrollLeft ' + barLeft);
ok('…without dragging the page with it', barSide && barSide.moved === 0, 'moved ' + (barSide && barSide.moved) + 'px');

/* ---------- 3. the Weekly Goals slider, which reached the server ---------- */
console.log('\n=== WEEKLY GOALS SLIDER ===');
const hasGoal = await page.evaluate(() => !!document.querySelector('.gSlide'));
ok('a written goal is on the page with its slider', hasGoal);

const goalVal = () => page.evaluate(() => document.querySelector('.gSlide').value);
const g0 = await goalVal();
calls.length = 0;
const goalUp = await swipe('.gSlide', 0, -220);
const g1 = await goalVal();
ok('an upward swipe starting on a goal slider scrolls the page', goalUp && goalUp.moved > 40, 'moved ' + (goalUp && goalUp.moved) + 'px');
ok('…and does not move the goal', g1 === g0, g0 + '% -> ' + g1 + '%');
ok('…and saves nothing', calls.indexOf('saveGoals') === -1, 'calls: ' + (calls.join(',') || 'none'));

/* And a real drag still saves. */
calls.length = 0;
const goalDrag = await swipe('.gSlide', 120, 0);
await page.waitForTimeout(900);
ok('a sideways drag on the goal slider still saves', calls.indexOf('saveGoals') !== -1, 'calls: ' + (calls.join(',') || 'none'));
ok('…without scrolling the page', goalDrag && goalDrag.moved === 0, 'moved ' + (goalDrag && goalDrag.moved) + 'px');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
srv.close();
process.exit(fail ? 1 : 0);
