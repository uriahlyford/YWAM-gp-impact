/* The app's edges and its loading states.

   Three faults that all showed up as "the app feels off" rather than as errors:
   the dashboard painted before redirecting a staff member to their own page; the
   staff boot coin was a hollow ring until logo.js arrived; and both pages claimed
   the notch and the home-indicator strip without padding for them, so the chrome
   moved every time iOS re-reported the insets. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.GP_ROOT || PUBLIC;

const ROSTER = [{ id: 'a', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true, photo: '' }];
const ENTRIES = { poipet: { 'Community Service|Outreach Teams|Salvations': { '33': 64 } } };
const SURVEY = [{ campus: 'poipet', week: 33, device: 'tok', lonely: 3, clarity: 8, growth: 7, langHours: 2, minHours: 5 }];
const DATA = { leader: false, entries: ENTRIES, okrs: [], survey: SURVEY, roster: ROSTER };
const BOOT = {
  ok: true, staff: ROSTER[0], profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: ROSTER, logs: [], habits: null, mentees: [], mentorRequests: [],
  goals: [], checkins: [], trips: { ok: true, trips: [], years: {} }, tripRequests: [],
  ministry: { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, daily: {}, pins: [] },
  base: { leader: false, entries: ENTRIES, okrs: [], survey: SURVEY },
};

const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png' };
let delayLogo = 0;
const srv = http.createServer(async function (req, res) {
  const rel = req.url.split('?')[0];
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  if (rel.indexOf('logo.js') > -1 && delayLogo) await new Promise(function (x) { setTimeout(x, delayLogo); });
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
await new Promise(function (r) { srv.listen(0, r); });
const BASE = 'http://127.0.0.1:' + srv.address().port;
const browser = await chromium.launch({ executablePath: CHROMIUM });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
function api(p) {
  return p.route('**/api', function (r) {
    const fn = (r.request().postDataJSON() || {}).fn;
    const body = fn === 'getMyBoot' ? BOOT : fn === 'staffLogin' ? { ok: true, staff: BOOT.staff, profile: BOOT.profile } : DATA;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}
const signedIn = function () {
  try { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })); } catch (e) { }
};

/* ---------- 1. no flash of the dashboard on the way to the staff page ---------- */
{
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await api(p);
  const painted = [];
  await p.exposeFunction('__mark', function (w) { painted.push(w); });
  /* Poll every frame for a laid-out header and report which page it was on. If the
     redirect happens in <head> the dashboard never gets far enough to have one. */
  await p.addInitScript(function () {
    const tick = function () {
      const h = document.querySelector('header');
      if (h && h.getBoundingClientRect().height > 0) { window.__mark(location.pathname); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await p.waitForURL(/teams\.html/, { timeout: 15000 }).catch(function () { });
  await p.waitForTimeout(700);
  ok('a signed-in staff member lands on the staff page', /teams\.html/.test(p.url()), p.url().replace(BASE, ''));
  ok('and the dashboard never paints on the way there',
    !painted.some(function (u) { return u.indexOf('index.html') > -1; }),
    'painted: ' + (painted.join(', ') || 'nothing'));
  await ctx.close();
}

/* ---------- 2. the boot coin is never a hollow ring ---------- */
/* logo.js is what carries the mark, so hold it back and watch what shows. The coin
   must either not be there yet or be there WITH the logo in it — never an empty
   ring, which is what it used to be for as long as logo.js took to arrive. */
for (const d of [0, 900]) {
  delayLogo = d;
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function () { /* never answers: hold the boot screen open */ });
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  const look = function () {
    return p.evaluate(`(function(){
      var c=document.querySelector('.loadCoin');
      if(!c || c.getBoundingClientRect().height===0) return { coin:false };
      var i=c.querySelector('img');
      return { coin:true, src: !!(i && i.getAttribute('src') && i.getBoundingClientRect().width>0) };
    })()`);
  };
  // while logo.js is still in flight
  await p.waitForTimeout(d ? Math.round(d * 0.4) : 40);
  let st = await look();
  ok('staff boot coin with logo.js ' + (d ? d + 'ms behind' : 'instant') + ': never hollow mid-load',
    !st.coin || st.src, 'coin=' + st.coin + ' logo=' + (st.src === undefined ? '-' : st.src));
  // and once it has arrived it is there, with the mark in it
  await p.waitForSelector('.loadCoin img', { timeout: 15000 });
  st = await look();
  ok('staff boot coin with logo.js ' + (d ? d + 'ms behind' : 'instant') + ': present with the mark once loaded',
    st.coin === true && st.src === true, 'coin=' + st.coin + ' logo=' + st.src);
  await ctx.close();
}
delayLogo = 0;

/* And once it has settled the coin is the real mark, spinning. */
{
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function () { /* never answers: hold the boot screen open */ });
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  await p.waitForSelector('.loadCoin img', { timeout: 15000 });
  await p.waitForTimeout(200);
  /* Computed width, not getBoundingClientRect: the mark is mid-rotation, so its
     bounding box is the rotated one and reads wider than the element is. */
  const c = await p.evaluate(`(function(){
    var i=document.querySelector('.loadCoin img');
    var cs=getComputedStyle(i);
    return { w: cs.width,
             png: (i.getAttribute('src')||'').slice(0,14),
             anim: cs.animationName+' '+cs.animationDuration,
             coin: Math.round(document.querySelector('.loadCoin').getBoundingClientRect().width),
             text: (document.querySelector('.loadText')||{}).textContent||'' };
  })()`);
  ok('the coin holds the real PNG', c.png === 'data:image/png', c.png);
  ok('the mark is the same 66px as the dashboard coin', c.w === '66px', c.w);
  ok('inside the same 92px coin', c.coin === 92, c.coin + 'px');
  ok('and it spins', /spin/.test(c.anim), c.anim);
  ok('with the Impact Loading wording', c.text.indexOf('Impact Loading') === 0, JSON.stringify(c.text));
  await ctx.close();
}

/* ---------- 3. the edges ---------- */
/* env() cannot be driven from Playwright, so assert the rules are there and that
   they resolve — a typo'd env() silently computes to 0 and the bug comes back. */
{
  const files = ['index.html', 'teams.html', 'help.html'];
  for (const f of files) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const cover = /viewport-fit=cover/.test(src);
    const insets = (src.match(/env\(safe-area-inset/g) || []).length;
    ok(f + ': claims the full screen, so it pads for the insets',
      !cover || insets >= 3, 'cover=' + cover + ' env() uses=' + insets);
    ok(f + ': horizontal rubber-banding locked on html, not just body',
      /html\s*\{[^}]*overflow-x\s*:\s*hidden/.test(src) ||
      /html\s*\{[^}]*overflow-x:hidden/.test(src), '');
  }
}

/* The insets are 0 in a desktop Chromium, so every padded box must still compute
   to its plain value — this catches a malformed calc() or a bad env() fallback. */
{
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await api(p);
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  await p.waitForSelector('nav.bottom button', { timeout: 15000 });
  const box = await p.evaluate(`(function(){
    var h=getComputedStyle(document.querySelector('header'));
    var b=getComputedStyle(document.body);
    var n=getComputedStyle(document.querySelector('nav.bottom'));
    return { headTop:h.paddingTop, bodyBottom:b.paddingBottom, navBottom:n.paddingBottom,
             de:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth };
  })()`);
  ok('header top padding still resolves', box.headTop === '16px', box.headTop);
  ok('body bottom padding still resolves', box.bodyBottom === '76px', box.bodyBottom);
  ok('nav bottom padding resolves to zero with no inset', box.navBottom === '0px', box.navBottom);
  ok('and nothing scrolls sideways', box.de === box.cw, box.de + ' vs ' + box.cw);
  await ctx.close();
}
{
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await api(p);
  await p.addInitScript(function () {
    try {
      localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
      sessionStorage.setItem('gp-skip-teams', '1');
    } catch (e) { }
  });
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await p.waitForSelector('.hero', { timeout: 15000 });
  const box = await p.evaluate(`(function(){
    var h=getComputedStyle(document.querySelector('header'));
    var b=getComputedStyle(document.body);
    return { headTop:h.paddingTop, bodyBottom:b.paddingBottom,
             de:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth };
  })()`);
  /* 14px, not 18px: below 480px the phone rule takes over. That rule carries the
     inset too — which is the whole point, since it wins on every phone. */
  ok('dashboard header top padding still resolves', box.headTop === '14px', box.headTop);
  ok('dashboard body bottom padding still resolves', box.bodyBottom === '44px', box.bodyBottom);
  ok('dashboard does not scroll sideways', box.de === box.cw, box.de + ' vs ' + box.cw);
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
