/* The launch: splash, then your profile. Never the dashboard.

   The previous attempt at this moved the redirect into <head> and passed its test,
   but the flash was still there on a real phone — because the test server answers
   in about a millisecond and Netlify over mobile does not. start_url is
   index.html, so every launch fetches the dashboard and then navigates to the
   staff page, and for the length of that second fetch the dashboard document is
   what the browser is showing. So this file serves every request SLOWLY on
   purpose. Anything that only passes on a fast local server proves nothing here. */
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
let netDelay = 0;      // every static file
let logoDelay = 0;     // logo.js on top of that
const srv = http.createServer(async function (req, res) {
  const rel = req.url.split('?')[0];
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  let d = netDelay;
  if (rel.indexOf('logo.js') > -1) d += logoDelay;
  if (d) await new Promise(function (x) { setTimeout(x, d); });
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
function api(p, delay) {
  return p.route('**/api', async function (r) {
    if (delay) await new Promise(function (x) { setTimeout(x, delay); });
    const fn = (r.request().postDataJSON() || {}).fn;
    const body = fn === 'getMyBoot' ? BOOT : fn === 'staffLogin' ? { ok: true, staff: BOOT.staff, profile: BOOT.profile } : DATA;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}
const signedIn = function () {
  try { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })); } catch (e) { }
};

/* Sample what a person can actually SEE, every frame, for the whole launch: is
   the splash covering the viewport, and is any dashboard chrome visible under it?
   "Visible" means not hidden behind the splash — that is the only definition that
   matches what the user reported. */
const WATCH = function () {
  window.__frames = [];
  const tick = function () {
    const sp = document.getElementById('splash');
    const covering = !!sp && sp.className.indexOf('gone') === -1 &&
      sp.getBoundingClientRect().width >= window.innerWidth - 1 &&
      sp.getBoundingClientRect().height >= window.innerHeight - 1;
    // Dashboard-only chrome: the campus chips and the three-tab bar.
    const chrome = document.querySelector('#campusRow, #nav');
    const chromeShowing = !!chrome && chrome.getBoundingClientRect().height > 0 && !covering;
    window.__frames.push({ t: Math.round(performance.now()), path: location.pathname, covering: covering, chrome: chromeShowing });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/* ---------- 1. a slow launch: splash all the way, then the profile ---------- */
{
  netDelay = 220;   // a realistic mobile round trip per file
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await api(p, 300);
  await p.addInitScript(WATCH);
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await p.waitForURL(/teams\.html/, { timeout: 25000 }).catch(function () { });
  await p.waitForSelector('nav.bottom button', { timeout: 25000 }).catch(function () { });
  await p.waitForTimeout(900);

  const frames = await p.evaluate('window.__frames || []');
  const onIndex = frames.filter(function (f) { return f.path.indexOf('index.html') > -1; });
  const exposed = frames.filter(function (f) { return f.chrome; });
  ok('a signed-in staff member ends up on their profile', /teams\.html/.test(p.url()), p.url().replace(BASE, ''));
  /* HONEST LIMIT: on Chromium these two are weak. It never paints a stable frame
     of the document it is navigating away from — evaluate() there throws "execution
     context destroyed" — so `onIndex` comes back empty and both assertions pass
     even with no splash in the page at all. They stay as cheap regression guards,
     but the thing that actually makes the flash impossible is asserted further
     down, with scripts disabled: the splash covers the viewport by construction,
     on any engine, whatever the timing. WebKit on iOS does paint that intermediate
     document, which is why the flash was visible on a phone and never here. */
  ok('no uncovered frame is spent on the dashboard document (weak on Chromium)',
    onIndex.every(function (f) { return f.covering; }),
    onIndex.length + ' frames sampled, ' + onIndex.filter(function (f) { return f.covering; }).length + ' covered');
  ok('no dashboard chrome seen at any sampled frame (weak on Chromium)',
    exposed.length === 0,
    exposed.length ? 'exposed at ' + exposed.slice(0, 4).map(function (f) { return f.t + 'ms' + f.path; }).join(', ') : 'never');
  const splashGone = await p.evaluate("!document.getElementById('splash')");
  ok('and the splash is gone once the profile is up', splashGone);
  const tabs = await p.$$eval('nav.bottom button', function (b) { return b.map(function (x) { return x.textContent.trim(); }).join(' | '); });
  ok('the profile really rendered', tabs.indexOf('Base') > -1, tabs);
  await ctx.close();
  netDelay = 0;
}

/* ---------- 2. no invocation spent on the page we are leaving ---------- */
{
  netDelay = 150;
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  const calls = [];
  await p.route('**/api', function (r) {
    const fn = (r.request().postDataJSON() || {}).fn;
    calls.push(fn);
    const body = fn === 'getMyBoot' ? BOOT : DATA;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await p.waitForSelector('nav.bottom button', { timeout: 25000 }).catch(function () { });
  await p.waitForTimeout(700);
  /* Netlify bills invocations. The dashboard we pass through must not call getData
     for a screen nobody sees — that would be one wasted bill per staff member per
     app open, every day. */
  ok('the dashboard we pass through spends no invocation',
    calls.indexOf('getData') === -1, calls.join(', ') || 'none');
  ok('and the profile is fetched exactly once',
    calls.filter(function (c) { return c === 'getMyBoot'; }).length === 1, calls.join(', '));
  await ctx.close();
  netDelay = 0;
}

/* ---------- 3. the splash itself ---------- */
{
  logoDelay = 900;
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function () { /* never answers: hold the splash open */ });
  await p.addInitScript(signedIn);
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  // before logo.js lands there must still be something moving
  const haveSplash = await p.waitForSelector('#splash', { timeout: 15000 })
    .then(function () { return true; }).catch(function () { return false; });
  ok('the staff page has a splash at all', haveSplash);
  if (!haveSplash) { await ctx.close(); logoDelay = 0; }
  else {
  await p.waitForTimeout(200);
  const early = await p.evaluate(`(function(){
    var s=document.getElementById('splash');
    var c=s.querySelector('.spCoin');
    var i=s.querySelector('img');
    var ring=getComputedStyle(c,'::before');
    return { bg:getComputedStyle(s).backgroundColor,
             ringAnim:ring.animationName, ringDur:ring.animationDuration,
             imgSrc:!!i.getAttribute('src'),
             imgOpacity:getComputedStyle(i).opacity,
             word:(s.querySelector('.spWord')||{}).textContent||'' };
  })()`);
  ok('splash background is the manifest background_color',
    early.bg === 'rgb(23, 21, 15)', early.bg);
  ok('something spins before logo.js arrives', /spSpin/.test(early.ringAnim), early.ringAnim + ' ' + early.ringDur);
  ok('and the empty mark is invisible, not a blank gap',
    early.imgSrc === false && early.imgOpacity === '0', 'src=' + early.imgSrc + ' opacity=' + early.imgOpacity);
  ok('the splash names itself', early.word.indexOf('Impact Loading') === 0, JSON.stringify(early.word));

  // once logo.js is in, the real mark spins in the middle
  await p.waitForFunction("(function(){var i=document.querySelector('#splash img');return i&&i.getAttribute('src');})()", null, { timeout: 15000 });
  await p.waitForTimeout(350);
  const late = await p.evaluate(`(function(){
    var i=document.querySelector('#splash img');
    var cs=getComputedStyle(i);
    return { png:(i.getAttribute('src')||'').slice(0,14), w:cs.width,
             anim:cs.animationName+' '+cs.animationDuration, opacity:cs.opacity };
  })()`);
  ok('the real GP mark lands in the splash', late.png === 'data:image/png', late.png);
  ok('it spins', /spSpin/.test(late.anim), late.anim);
  ok('and it fades in rather than popping', late.opacity === '1', late.opacity);
  await ctx.close();
  logoDelay = 0;
  }
}

/* ---------- 3b. the guarantee: nothing behind the splash can be seen ----------
   Scripts off, so nothing ever dismisses it and no timing is involved. This is the
   assertion that actually stands behind "the dashboard never flashes": the splash
   is the first element in the body, fixed, opaque and above everything, so on any
   engine — including the WebKit one that paints the document it is leaving — there
   is nothing to see underneath. */
for (const page of ['index.html', 'teams.html']) {
  const ctx = await browser.newContext(Object.assign({}, devices['iPhone 13'], { javaScriptEnabled: false }));
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.goto(BASE + '/' + page, { waitUntil: 'load' });
  const st = await p.evaluate(`(function(){
    var s=document.getElementById('splash');
    if(!s) return { there:false };
    var cs=getComputedStyle(s), b=s.getBoundingClientRect();
    var hdr=document.querySelector('header');
    var hb=hdr?hdr.getBoundingClientRect():null;
    // Is the header's midpoint covered by the splash? topmost element there wins.
    var mid=hb?document.elementFromPoint(Math.round(hb.left+hb.width/2), Math.round(hb.top+hb.height/2)):null;
    var inSplash=!!(mid && (mid===s || s.contains(mid)));
    return { there:true, pos:cs.position, z:cs.zIndex, bg:cs.backgroundColor, opacity:cs.opacity,
             coversW:b.width>=window.innerWidth-1, coversH:b.height>=window.innerHeight-1,
             headerCovered:inSplash,
             /* Before the header in document order — the splash's own <style> is
                what actually comes first in the body, which is as it should be. */
             beforeHeader: !!(hdr && (s.compareDocumentPosition(hdr) & Node.DOCUMENT_POSITION_FOLLOWING)) };
  })()`);
  ok(page + ': splash is present with scripts off', st.there === true);
  if (st.there) {
    ok(page + ': it is fixed and above everything', st.pos === 'fixed' && Number(st.z) >= 9999, st.pos + ' z=' + st.z);
    ok(page + ': it is fully opaque', st.opacity === '1' && st.bg === 'rgb(23, 21, 15)', st.bg + ' @' + st.opacity);
    ok(page + ': it covers the whole viewport', st.coversW && st.coversH, 'w=' + st.coversW + ' h=' + st.coversH);
    ok(page + ': the header underneath is not reachable on screen', st.headerCovered === true);
    ok(page + ': it sits ahead of the header in the markup', st.beforeHeader === true);
  }
  await ctx.close();
}

/* ---------- 4. the splash always lets go ---------- */
{
  // Nothing ever answers and no render happens: the safety timeout must still
  // reveal the page, or a hiccup traps a working app behind a splash forever.
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function () { });
  await p.addInitScript(function () {
    try { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })); } catch (e) { }
    // stop render() from being the thing that lifts it
    window.addEventListener('DOMContentLoaded', function () { window.render = function () { }; });
  });
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  await p.waitForTimeout(9200);
  const gone = await p.evaluate("(function(){var s=document.getElementById('splash');return !s || s.className.indexOf('gone')>-1;})()");
  ok('a splash nothing dismisses lifts itself within ~8s', gone);
  await ctx.close();
}

/* ---------- 5. a guest still gets the dashboard ---------- */
{
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await api(p, 0);
  await p.addInitScript(function () { try { sessionStorage.setItem('gp-guest', '1'); } catch (e) { } });
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  // Tolerant: report a missing dashboard as a failure rather than crashing the run.
  await p.waitForSelector('.hero', { timeout: 15000 }).catch(function () { });
  await p.waitForTimeout(500);
  const st = await p.evaluate(`(function(){
    var s=document.getElementById('splash');
    return { splash: !s || s.className.indexOf('gone')>-1,
             hero: !!document.querySelector('.hero'),
             url: location.pathname };
  })()`);
  ok('a guest is not redirected to the staff page', st.url.indexOf('index.html') > -1, st.url);
  ok('the splash lifts for them too', st.splash);
  ok('and the dashboard is there behind it', st.hero);
  await ctx.close();
}

/* ---------- 6. the two copies of the block have not drifted ---------- */
{
  const grab = function (f) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const m = src.match(/<!-- ==================== SPLASH ====================[\s\S]*?<!-- ================== END SPLASH ================== -->/);
    return m ? m[0] : null;
  };
  const a = grab('index.html'), b = grab('teams.html');
  ok('both pages carry the splash block', !!a && !!b);
  ok('and the two copies are byte-identical', a === b,
    a === b ? '' : 'index ' + (a || '').length + ' chars vs teams ' + (b || '').length);
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
