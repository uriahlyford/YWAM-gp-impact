/* Tapping habits, on a real connection rather than an instant one.

   Two reports from the base: taps "don't respond", and sometimes they "get
   stuck". Both come from the same place — a page-wide S.busy lock held for the
   whole round trip, with no timeout on the request:

     · slow save  → every tap during those seconds is dropped SILENTLY. No
       toggle, no message, nothing. On a Cambodian mobile connection that is
       most taps.
     · hung save  → the lock is never released, so the page is dead until
       somebody thinks to reload it.

   A habit tile is an idempotent local toggle. It should never wait for the
   network, and no single request should be able to strand the whole screen. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer(function (req, res) {
  const f = path.join(PUBLIC, req.url.split('?')[0]);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

const ME = { id: 'st1', name: 'Sokha Chan', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', photo: '',
  mentorId: '', staffType: 'ministry', country: 'Cambodia' };
const HABITS = [{ id: 'bible', mentorVisible: true }, { id: 'quietTime', mentorVisible: true },
  { id: 'workout', mentorVisible: true }];
const BOOT = {
  ok: true, staff: ME, profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: [ME], logs: [], habits: HABITS, mentees: [], mentorRequests: [],
  goals: [], checkins: [], trips: { ok: true, trips: [], years: {} }, tripRequests: [],
  ministry: { ok: true, campus: ME.campus, dept: ME.dept, ministry: ME.ministry, entries: {}, daily: {}, pins: [] },
  base: { leader: false, entries: {}, okrs: [], survey: [], roster: [ME] },
};

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const browser = await chromium.launch({ executablePath: CHROMIUM });

/* saveDelay: how long saveDaily takes. null = never answers at all. */
async function open(saveDelay) {
  const ctx = await browser.newContext(devices['iPhone 13']);
  const page = await ctx.newPage();
  const saves = [];
  await page.route('**fonts.g**', r => r.abort());
  await page.route('**/api', async function (r) {
    const b = r.request().postDataJSON() || {};
    if (b.fn === 'saveDaily') {
      saves.push(b.args[3]);
      if (saveDelay === null) return;                       // hangs, like a dropped connection
      await new Promise(res => setTimeout(res, saveDelay));
      const map = b.args[3].habits || {};
      const log = Object.assign({ date: b.args[2], week: 34, langHours: 0, minHours: 0,
        clarity: null, growth: null, lonely: null, porn: false, habits: map }, map);
      r.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ ok: true, logs: [log], habits: HABITS }) });
      return;
    }
    r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify(b.fn === 'getMyBoot' ? BOOT : (b.fn === 'getData' ? BOOT.base : { ok: true })) });
  });
  await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button:nth-child(2)');            // My Database
  await page.waitForSelector('[data-habit]', { timeout: 10000 });
  await page.waitForTimeout(300);
  return { ctx, page, saves };
}
const lit = (page, id) => page.$eval('[data-habit="' + id + '"]', b => b.classList.contains('on'));

/* ---------- 1. three quick taps on a slow connection ---------- */
{
  const { ctx, page, saves } = await open(2500);
  await page.click('[data-habit="bible"]');
  await page.waitForTimeout(120);
  await page.click('[data-habit="quietTime"]');
  await page.waitForTimeout(120);
  await page.click('[data-habit="workout"]');
  await page.waitForTimeout(250);

  const on = { bible: await lit(page, 'bible'), quietTime: await lit(page, 'quietTime'), workout: await lit(page, 'workout') };
  ok('every tap lights its tile at once, without waiting for the server',
    on.bible && on.quietTime && on.workout, JSON.stringify(on));

  await page.waitForTimeout(4000);                              // let the saves settle
  const last = saves[saves.length - 1] || { habits: {} };
  ok('all three reach the server', !!(last.habits.bible && last.habits.quietTime && last.habits.workout),
    JSON.stringify(last.habits));
  /* Netlify bills per invocation, so a burst of taps must not be a burst of
     requests — one in flight, one more with whatever accumulated. */
  ok('the burst is coalesced, not one request per tap', saves.length <= 2, saves.length + ' saveDaily calls');
  await ctx.close();
}

/* ---------- 2. a save that never comes back ---------- */
{
  const { ctx, page, saves } = await open(null);
  await page.click('[data-habit="bible"]');
  await page.waitForTimeout(400);
  ok('the first tap still lights up while the request hangs', await lit(page, 'bible'));

  await page.click('[data-habit="workout"]');
  await page.waitForTimeout(400);
  ok('a tap during a hung request is NOT swallowed', await lit(page, 'workout'),
    'workout lit: ' + (await lit(page, 'workout')));

  /* And the rest of the page has to stay alive — S.busy is shared with every
     other button, so a hung habit save used to kill the whole screen. */
  await page.click('nav.bottom button:nth-child(1)');
  await page.waitForTimeout(400);
  const movedAway = await page.evaluate(() => !document.querySelector('[data-habit]'));
  ok('the rest of the app still works while it hangs', movedAway);
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
