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

   Three layers, because only the first two are portable. The touch-action values
   themselves are read off the computed style, which is exactly what regressed and
   is the same answer in every build. The guard is driven by the event sequence a
   real touch produces — touchstart, the value moving, then a vertical move — which
   dispatched TouchEvents reproduce faithfully. Only the last layer asks the
   browser's own gesture recognizer to scroll, through CDP, and that turned out to
   be build-dependent: Chromium 141 scrolls from a dispatched touch sequence and
   151 does not. So it first tries the same swipe over inert page, and if that
   cannot scroll either, it says so and skips rather than failing — a browser that
   will not scroll from synthetic touch is not evidence about the app. All of it on
   an Android device profile, which is where this was seen. */
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


/* ---------- 1. the rules themselves ---------- */
/* A horizontal control may claim the horizontal axis and no more; a horizontal
   scroller has to name both. `none` is never right on either. */
console.log('\n=== TOUCH-ACTION ===');
await page.click('nav.bottom [data-tab="health"]');
await page.waitForTimeout(700);
await page.evaluate(w => { S.healthWeek = w; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, WK);
await page.waitForTimeout(700);

const nSliders = await page.$$eval('#weekForm [data-wslide]', e => e.length);
ok('the weekly form is open with its sliders', nSliders > 0, nSliders + ' sliders');

const ta = sel => page.evaluate(s => {
  const el = document.querySelector(s);
  return el ? getComputedStyle(el).touchAction : '(no element)';
}, sel);

const taSlide = await ta('#weekForm [data-wslide]');
ok('a health slider lets the page scroll vertically', /pan-y|^auto$|manipulation/.test(taSlide) && taSlide !== 'none', taSlide);

await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(900);
const taBar = await ta('.quickBar');
ok('the chip strip claims both axes, not just its own',
  /pan-x/.test(taBar) && /pan-y/.test(taBar) || taBar === 'auto', taBar);
const taGoal = await ta('.gSlide');
ok('the goal slider lets the page scroll vertically', /pan-y|^auto$|manipulation/.test(taGoal) && taGoal !== 'none', taGoal);

/* ---------- 2. the guard, on the event sequence a real touch produces ---------- */
/* Measured from a real gesture: touchstart, then the browser moves the value and
   fires input, THEN the moves arrive. That ordering is the whole problem — by the
   time anything can tell a scroll from a drag, the value has already moved. */
console.log('\n=== SCROLLING PAST A SLIDER ANSWERS NOTHING ===');
/* Invoked as an IIFE and deliberately NOT wrapped in a catch: the first version
   of this swallowed a syntax error in the string, and three assertions below went
   green because nothing had happened at all. */
const SWIPE_OVER = `(sel, dx, dy) => {
  const el = document.querySelector(sel);
  const box = el.getBoundingClientRect();
  const x = box.left + box.width / 2, y = box.top + box.height / 2;
  function fire(type, cx, cy){
    const t = [new Touch({ identifier: 1, target: el, clientX: cx, clientY: cy,
      pageX: cx, pageY: cy, screenX: cx, screenY: cy })];
    el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
      touches: type === 'touchend' ? [] : t, targetTouches: type === 'touchend' ? [] : t,
      changedTouches: t }));
  }
  fire('touchstart', x, y);
  /* what the browser does on touch-down, before it knows what the gesture is:
     the value jumps to wherever the finger landed. */
  const span = Number(el.max) - Number(el.min);
  const bump = Math.max(Number(el.step) || 1, Math.round(span / 10));
  el.value = String(Math.min(Number(el.max), Number(el.value) + bump));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  for (let i = 1; i <= 6; i++) fire('touchmove', x + dx * i / 6, y + dy * i / 6);
  fire('touchend', x + dx, y + dy);
  /* the browser fires change on release whichever the gesture turned out to be —
     including after a scroll, which is exactly what used to reach saveGoals. */
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return el.value;
}`;

await page.click('nav.bottom [data-tab="health"]');
await page.waitForTimeout(700);
await page.evaluate(w => { S.healthWeek = w; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, WK);
await page.waitForTimeout(700);

const FIRST = '#weekForm [data-wslide="lonely"]';
const slideState = () => page.evaluate(() => {
  const sl = document.querySelector('#weekForm [data-wslide="lonely"]');
  const block = sl.closest('.qBlock');
  return { value: sl.value, readout: block.querySelector('.qReadout').textContent,
    draft: JSON.stringify(S.weekDraft || {}) };
});

const h0 = await slideState();
await page.evaluate('(' + SWIPE_OVER + ')(' + JSON.stringify(FIRST) + ', 0, -160)');
await page.waitForTimeout(300);
const h1 = await slideState();
ok('a vertical swipe puts the value back', h1.value === h0.value, h0.value + ' -> ' + h1.value);
ok('…and the readout with it', h1.readout === h0.readout, h1.readout);
ok('…and records no answer at all', !JSON.parse(h1.draft).hasOwnProperty('lonely'), 'draft ' + h1.draft);

/* The same gesture sideways is a real drag and must be kept. */
await page.evaluate('(' + SWIPE_OVER + ')(' + JSON.stringify(FIRST) + ', 140, 0)');
await page.waitForTimeout(300);
const h2 = await slideState();
ok('a sideways drag is kept', Number(h2.value) > Number(h0.value), h0.value + ' -> ' + h2.value);
ok('…and IS recorded as the answer', JSON.parse(h2.draft).lonely === Number(h2.value), 'draft ' + h2.draft);

console.log('\n=== SCROLLING PAST WEEKLY GOALS SAVES NOTHING ===');
await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(900);
const goalVal = () => page.evaluate(() => document.querySelector('.gSlide').value);
const g0 = await goalVal();
calls.length = 0;
await page.evaluate('(' + SWIPE_OVER + ")('.gSlide', 0, -160)");
await page.waitForTimeout(700);
ok('a vertical swipe puts the percentage back', (await goalVal()) === g0, g0 + '% -> ' + (await goalVal()) + '%');
ok('…and saves nothing', calls.indexOf('saveGoals') === -1, 'calls: ' + (calls.join(',') || 'none'));

calls.length = 0;
await page.evaluate('(' + SWIPE_OVER + ")('.gSlide', 140, 0)");
await page.waitForTimeout(900);
ok('a sideways drag still saves', calls.indexOf('saveGoals') !== -1, 'calls: ' + (calls.join(',') || 'none'));

/* ---------- 3. the real gesture, if this browser will do one ---------- */
console.log('\n=== THE PAGE ITSELF, THROUGH THE GESTURE RECOGNIZER ===');
const cdp = await ctx.newCDPSession(page);

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
  return { moved: after - before };
}

/* The control: the same swipe over ordinary page. If this cannot scroll, the
   browser is not driving gestures from dispatched touch and nothing below would
   be about the app. Chromium 141 does; 151 does not. */
const control = await swipe('#main h3', 0, -220);
if (!control || control.moved <= 40) {
  console.log('skip  this build does not scroll from a dispatched touch sequence' +
    ' (control swipe over plain page moved ' + (control ? control.moved : 'null') + 'px)' +
    ' — the rules above are asserted from computed style instead');
} else {
  const barUp = await swipe('.quickBar', 0, -220);
  ok('an upward swipe starting on the chip strip scrolls the page', barUp && barUp.moved > 40, 'moved ' + (barUp && barUp.moved) + 'px');

  await page.evaluate(() => { document.querySelector('.quickBar').scrollLeft = 0; });
  const barSide = await swipe('.quickBar', -220, 0);
  const barLeft = await page.evaluate(() => Math.round(document.querySelector('.quickBar').scrollLeft));
  ok('a sideways swipe still scrolls the chips', barLeft > 20, 'scrollLeft ' + barLeft);
  ok('…without dragging the page with it', barSide && barSide.moved === 0, 'moved ' + (barSide && barSide.moved) + 'px');

  const goalUp = await swipe('.gSlide', 0, -220);
  ok('an upward swipe starting on a goal slider scrolls the page', goalUp && goalUp.moved > 40, 'moved ' + (goalUp && goalUp.moved) + 'px');

  await page.click('nav.bottom [data-tab="health"]');
  await page.waitForTimeout(700);
  await page.evaluate(w => { S.healthWeek = w; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, WK);
  await page.waitForTimeout(700);
  const slideUp = await swipe(FIRST, 0, -220);
  ok('an upward swipe starting on a health slider scrolls the page', slideUp && slideUp.moved > 40, 'moved ' + (slideUp && slideUp.moved) + 'px');
  const after = await slideState();
  ok('…and that real gesture answered nothing either', !JSON.parse(after.draft).hasOwnProperty('lonely'), 'draft ' + after.draft);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
srv.close();
process.exit(fail ? 1 : 0);
