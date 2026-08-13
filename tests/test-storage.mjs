/* Two load-path failures that had nothing to do with the data:
   1. a Khmer reader's language choice was thrown away by the first data load;
   2. a browser with storage blocked throws on getItem, which used to happen
      while `state` was still being built — a blank page, not a degraded one. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.GP_ROOT || PUBLIC;
const DATA = {
  leader: false,
  entries: {
    poipet: {
      'Community Service|Outreach Teams|Salvations': { '33': 6 },
      'Community Service|Outreach Teams|Teams Hosted': { '33': 2 },
    },
  },
  okrs: [],
  survey: [{ campus: 'poipet', week: 33, device: 'tok', lonely: 3, clarity: 8, growth: 7, langHours: 2, minHours: 5 }],
  roster: [
    { id: 'a', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true },
    { id: 'b', name: 'Dara Pen', username: 'dara', campus: 'siemreap', dept: 'Youth Education', ministry: 'YDC', role: '', active: true },
  ],
};

const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.css': 'text/css' };
const srv = http.createServer(function (req, res) {
  const f = path.join(ROOT, req.url.split('?')[0]);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
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

async function open(opts) {
  opts = opts || {};
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', function (e) { errs.push(String(e.message)); });
  // Never let the real font CDN hold the load up.
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function (r) {
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DATA) });
  });
  await p.route('**/.netlify/functions/**', function (r) {
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DATA) });
  });
  if (opts.killStorage) {
    // What a browser with storage blocked actually does: throw, not return null.
    await p.addInitScript(function () {
      const boom = function () { throw new Error('The operation is insecure.'); };
      try {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get: function () { return { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, length: 0 }; },
        });
      } catch (e) { /* nothing else to try */ }
    });
  } else if (opts.seed) {
    await p.addInitScript(new Function(opts.seed));
  }
  if (!opts.killStorage && !opts.noPass) {
    // Past the front door: signed in, and not bounced to the staff page.
    await p.addInitScript(function () {
      try {
        localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
        localStorage.setItem('gp-staff-card', JSON.stringify({ name: 'Sokha Chan', photo: '', ministry: 'Outreach Teams', campus: 'poipet' }));
        sessionStorage.setItem('gp-skip-teams', '1');
      } catch (e) { }
    });
  }
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  return { ctx, p, errs };
}

function isKhmer(s) { return /[ក-៿]/.test(String(s || '')); }

/* ---------- 1. Khmer survives a reload ---------- */
{
  const { ctx, p, errs } = await open({ seed: "try{localStorage.setItem('gp-lang','km');}catch(e){}" });
  await p.waitForSelector('.hero', { timeout: 15000 });
  await p.waitForTimeout(600);
  const lang = await p.evaluate('state.lang');
  const btn = (await p.textContent('#langBtn').catch(function () { return ''; })) || '';
  const heroLabel = (await p.textContent('.heroLabel').catch(function () { return ''; })) || '';
  /* #main only, not the whole body: the toggle button is itself Khmer text, so a
     body-wide check passes even when every translated label has fallen back. */
  const main = (await p.textContent('#main')) || '';
  ok('gp-lang=km is still km after the data load', lang === 'km', 'state.lang=' + lang);
  ok('the toggle button and the page agree', btn.trim() === 'EN', 'button=' + JSON.stringify(btn.trim()));
  ok('the dashboard body renders Khmer script', isKhmer(main),
    'hero label=' + JSON.stringify(heroLabel.trim()));
  ok('no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---------- 2. English stays English ---------- */
{
  const { ctx, p, errs } = await open({ seed: "try{}catch(e){}" });
  await p.waitForSelector('.hero', { timeout: 15000 });
  await p.waitForTimeout(400);
  ok('no saved choice means English', (await p.evaluate('state.lang')) === 'en');
  ok('English page has no errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---------- 3. toggling to Khmer then reloading keeps Khmer ---------- */
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', function (e) { errs.push(String(e.message)); });
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function (r) { r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DATA) }); });
  await p.route('**/.netlify/functions/**', function (r) { r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DATA) }); });
  await p.addInitScript(function () {
    try {
      localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
      sessionStorage.setItem('gp-skip-teams', '1');
    } catch (e) { }
  });
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await p.waitForSelector('#langBtn', { timeout: 15000 });
  await p.click('#langBtn');
  await p.waitForTimeout(300);
  ok('toggle switches to Khmer', (await p.evaluate('state.lang')) === 'km');
  await p.reload({ waitUntil: 'commit' });
  await p.waitForSelector('.hero', { timeout: 15000 });
  await p.waitForTimeout(600);
  ok('and Khmer is still there after a reload', (await p.evaluate('state.lang')) === 'km',
    'state.lang=' + (await p.evaluate('state.lang')));
  ok('Khmer script on the dashboard after the reload', isKhmer(await p.textContent('#main')));
  ok('no errors across the toggle and reload', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---------- 4. storage blocked entirely ---------- */
{
  const { ctx, p, errs } = await open({ killStorage: true });
  /* With no storage there is no saved session, so the front door is the right
     screen to land on — what matters is that it renders at all, and that guest
     entry from there still works. sessionStorage is untouched, which is what
     the guest marker uses. */
  let gate = false;
  try { await p.waitForSelector('#wGuest', { timeout: 15000 }); gate = true; } catch (e) { }
  ok('storage blocked: the front door still renders', gate);
  let usable = false;
  if (gate) {
    await p.click('#wGuest');
    try { await p.waitForSelector('.hero', { timeout: 15000 }); usable = true; } catch (e) { }
  }
  await p.waitForTimeout(400);
  const errBar = await p.evaluate(
    "(function(){var e=document.getElementById('errorBar');return e&&!e.classList.contains('hidden')?e.textContent:'';})()");
  const hero = (await p.textContent('.hero').catch(function () { return ''; })) || '';
  ok('storage blocked: guest entry reaches the dashboard', usable,
    'hero=' + hero.replace(/\s+/g, ' ').trim().slice(0, 60));
  ok('storage blocked: no error bar', !errBar, errBar);
  ok('storage blocked: no page errors', errs.length === 0, errs.join(' | '));
  // The language toggle must not throw either, even though it cannot save.
  if (usable) {
    await p.click('#langBtn').catch(function () { });
    await p.waitForTimeout(250);
    ok('storage blocked: the language toggle still works',
      (await p.evaluate('state.lang')) === 'km' && errs.length === 0, errs.join(' | '));
  }
  await ctx.close();
}

/* ---------- 5. a corrupt staff session does not block the page ---------- */
{
  const { ctx, p, errs } = await open({ seed: "try{localStorage.setItem('gp-staff','{oops');localStorage.setItem('gp-staff-card','not json');}catch(e){}" });
  let usable = false;
  try { await p.waitForSelector('.hero', { timeout: 15000 }); usable = true; } catch (e) { }
  await p.waitForTimeout(400);
  ok('corrupt saved session: page still renders', usable);
  ok('corrupt saved session: no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---------- 6. the staff page: log in and out with storage blocked ----------
   afterLogin() wrote the session before it did anything else, so a throw there
   meant the login button silently did nothing. logout() had the same shape. */
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', function (e) { errs.push(String(e.message)); });
  await p.route('**fonts.g**', function (r) { r.abort(); });
  const BOOT = {
    ok: true,
    staff: { id: 'a', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true, photo: '' },
    profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
    roster: DATA.roster, logs: [], habits: null, mentees: [], mentorRequests: [],
    goals: [], checkins: [], trips: { ok: true, trips: [], years: {} }, tripRequests: [],
    ministry: { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, daily: {}, pins: [] },
    base: { leader: false, entries: DATA.entries, okrs: [], survey: DATA.survey },
  };
  await p.route('**/api', function (r) {
    const post = r.request().postDataJSON() || {};
    const fn = post.fn;
    if (fn === 'staffLogin') {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, staff: BOOT.staff, profile: BOOT.profile }) });
    }
    if (fn === 'getMyBoot') {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(BOOT) });
    }
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await p.addInitScript(function () {
    const boom = function () { throw new Error('The operation is insecure.'); };
    try {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: function () { return { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, length: 0 }; },
      });
    } catch (e) { }
  });
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  let sawLogin = false;
  try { await p.waitForSelector('#li_user', { timeout: 15000 }); sawLogin = true; } catch (e) { }
  ok('staff page, storage blocked: login form renders', sawLogin);
  let loggedIn = false;
  if (sawLogin) {
    await p.fill('#li_user', 'sokha');
    await p.fill('#li_pin', '1234');
    await p.click('#loginBtn');
    try { await p.waitForSelector('nav.bottom button', { timeout: 15000 }); loggedIn = true; } catch (e) { }
  }
  ok('staff page, storage blocked: login actually gets you in', loggedIn);
  ok('staff page, storage blocked: no page errors', errs.length === 0, errs.join(' | '));
  /* A throw in afterLogin() lands in run()'s .catch, which shows a toast and
     re-renders with S.me already set — so tabs on screen do not prove the login
     worked. What proves it is that no connection toast fired and the base data
     the boot call carries is actually on the page. */
  const toast = await p.evaluate(
    "(function(){var e=document.querySelector('.toast,.msg,#msg');return e?e.textContent.trim():'';})()");
  ok('staff page, storage blocked: no spurious connection error',
    toast.toLowerCase().indexOf('connection') === -1, 'toast=' + JSON.stringify(toast));
  const loaded = await p.evaluate("!!(S && S.base && S.base.entries && Object.keys(S.base.entries).length)");
  ok('staff page, storage blocked: the boot data actually arrived', loaded);
  if (loggedIn) {
    const tabs = (await p.$$eval('nav.bottom button', function (b) { return b.map(function (x) { return x.textContent.trim(); }).join(' | '); }));
    ok('staff page, storage blocked: all five tabs are there',
      ['Base', 'My week', 'Team', 'Me', 'Health'].every(function (x) { return tabs.indexOf(x) > -1; }),
      tabs);
  }
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
