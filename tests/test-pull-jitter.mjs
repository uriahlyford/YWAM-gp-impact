/* Reported as "can't scroll or swipe at all" on real Android Chrome (Safari
   was unaffected — no touch events there at all, which is what pointed at
   this). A real finger touching glass always has a little settling jitter
   before a gesture reads as one clear direction — a normal scroll-down swipe
   (finger moving UP the screen) can still report a sub-pixel DOWNWARD wobble
   on its very first touchmove sample. gpPullToRefresh used to decide "is this
   a pull?" from that very first sample alone, and called e.preventDefault()
   the instant dy>0 — cancelling native scrolling for the rest of that whole
   gesture, even once the finger's real, opposite direction took over a
   moment later. A browser doesn't hand scrolling back mid-gesture once told
   the page is handling the touch itself.

   The fix (in gpPullToRefresh, rollup.js) waits for movement past a small
   threshold before deciding anything, the same margin gpSlideGuard already
   uses for the identical reason. This drives the exact jitter-then-scroll
   sequence and asserts nothing got prevented — plus the reverse case (a
   real, sustained pull) still arms the refresh, so the feature isn't lost
   chasing the fix. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';

const ROOT = PUBLIC;
const ROSTER = [{ id: 'a', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true, photo: '' }];
const DATA = { leader: false, entries: { poipet: {} }, okrs: [], survey: [], roster: ROSTER };
const BOOT = {
  ok: true, staff: ROSTER[0], profile: {}, roster: ROSTER, logs: [], habits: null, mentees: [], mentorRequests: [],
  goals: [], checkins: [], trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [],
  ministry: { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, daily: {}, pins: [] },
  base: DATA,
};

const TYPES = { '.html': 'text/html', '.js': 'application/javascript' };
const srv = http.createServer((req, res) => {
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

async function open() {
  const ctx = await browser.newContext(devices['Pixel 5']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', r => r.abort());
  await p.route('**/.netlify/functions/api', r => {
    const fn = (r.request().postDataJSON() || {}).fn;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fn === 'getMyBoot' ? BOOT : { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] }) });
  });
  await p.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
  await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  await p.waitForSelector('nav.bottom button', { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(700);
  return { ctx, p };
}

/* Fires a touchstart then a run of touchmoves at the given Y coordinates (in
   order), returning whether each touchmove call was defaultPrevented. */
async function drive(p, ys) {
  return p.evaluate((ys) => {
    function touch(y) { return [new Touch({ identifier: 1, target: document.body, clientX: 180, clientY: y, pageX: 180, pageY: y, screenX: 180, screenY: y })]; }
    function fire(type, y) {
      const t = touch(y);
      const ev = new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : t, targetTouches: type === 'touchend' ? [] : t, changedTouches: t });
      document.body.dispatchEvent(ev);
      return ev.defaultPrevented;
    }
    window.scrollTo(0, 0);
    fire('touchstart', ys[0]);
    const prevented = ys.slice(1).map(y => fire('touchmove', y));
    fire('touchend', ys[ys.length - 1]);
    return prevented;
  }, ys);
}

/* ---- case 1: a scroll-down swipe with a tiny initial downward jitter ---- */
{
  const { ctx, p } = await open();
  // Finger starts at 100, wobbles down 3px (below the 8px decide margin), then
  // moves clearly and sustainedly UP — a completely ordinary "scroll down the
  // page" gesture with the exact jitter a real touchscreen produces.
  const prevented = await drive(p, [100, 103, 90, 70, 50, 30, 10]);
  ok('none of the touchmove events were prevented (native scroll stays intact)',
    prevented.every(v => v === false), JSON.stringify(prevented));
  const dragging = await p.evaluate(() => document.getElementById('ptr').classList.contains('dragging'));
  ok('the pull indicator never engaged', !dragging);
  await ctx.close();
}

/* ---- case 2: a real, sustained pull down still works ---- */
{
  const { ctx, p } = await open();
  const prevented = await drive(p, [60, 70, 90, 120, 160, 210]);
  ok('a genuine sustained pull down is still taken over (feature not lost)',
    prevented.slice(1).some(v => v === true), JSON.stringify(prevented));
  await ctx.close();
}

/* ---- case 3: a sideways swipe is released too ---- */
{
  const { ctx, p } = await open();
  const prevented = await p.evaluate(() => {
    function touch(x, y) { return [new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y, pageX: x, pageY: y, screenX: x, screenY: y })]; }
    function fire(type, x, y) {
      const t = touch(x, y);
      const ev = new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : t, targetTouches: type === 'touchend' ? [] : t, changedTouches: t });
      document.body.dispatchEvent(ev);
      return ev.defaultPrevented;
    }
    window.scrollTo(0, 0);
    fire('touchstart', 180, 100);
    const out = [[190, 102], [220, 104], [260, 106], [300, 108]].map(([x, y]) => fire('touchmove', x, y));
    fire('touchend', 300, 108);
    return out;
  });
  ok('a mostly-sideways swipe is released, not treated as a pull', prevented.every(v => v === false), JSON.stringify(prevented));
  await ctx.close();
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
