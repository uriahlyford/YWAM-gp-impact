/* Reported as "can't scroll or swipe at all" on real Android Chrome (Safari
   on Mac was unaffected — no touch events fire there at all, which is what
   pointed at a touch-specific bug in the first place).

   First fix: gpPullToRefresh used to decide "is this a pull?" from the very
   first touchmove sample alone, calling e.preventDefault() the instant it
   saw any downward movement — but a real finger touching glass always has a
   little settling jitter before a gesture reads as one clear direction, so a
   normal scroll-down swipe (finger moving UP the screen) could still report
   a sub-pixel DOWNWARD wobble on its very first sample and get its scroll
   cancelled for the whole gesture. That got a "wait for real movement before
   deciding" fix — necessary, but on its own it didn't clear the report.

   Second, complete fix: the touchmove listener was {passive:false} so it
   COULD call preventDefault(). Merely registering a non-passive listener on
   `document` can make a real browser hold up scrolling for that event while
   it waits to find out whether preventDefault is coming, on a busy main
   thread, independent of whether the handler ends up calling it — which a
   quick synthetic test can't reproduce, but a real device under real load
   can. Body already has overscroll-behavior:none, which is what actually
   keeps the browser from bouncing or running its own native pull-to-refresh
   at the top of the page; the coin here was only ever layered visual
   feedback on top of that, never the thing doing the suppressing. So the
   listener is {passive:true} now and never calls preventDefault at all —
   this asserts that invariant directly, plus that the coin's own visual
   pull-arm feedback still works for a genuine sustained pull and stays off
   for jitter/sideways gestures, so the feature isn't lost chasing the fix. */
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

/* Fires a touchstart then a run of touchmoves at the given Y (or [x,y])
   coordinates, in order. */
async function drive(p, points) {
  return p.evaluate((points) => {
    function touch(x, y) { return [new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y, pageX: x, pageY: y, screenX: x, screenY: y })]; }
    function fire(type, x, y) {
      const t = touch(x, y);
      const ev = new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : t, targetTouches: type === 'touchend' ? [] : t, changedTouches: t });
      document.body.dispatchEvent(ev);
    }
    window.scrollTo(0, 0);
    const first = Array.isArray(points[0]) ? points[0] : [180, points[0]];
    fire('touchstart', first[0], first[1]);
    points.slice(1).forEach((pt) => {
      const [x, y] = Array.isArray(pt) ? pt : [180, pt];
      fire('touchmove', x, y);
    });
    const last = points[points.length - 1];
    const lp = Array.isArray(last) ? last : [180, last];
    fire('touchend', lp[0], lp[1]);
  }, points);
}

/* ---- case 1: a scroll-down swipe with a tiny initial downward jitter ---- */
{
  const { ctx, p } = await open();
  // Finger starts at 100, wobbles down 3px (below the 8px decide margin), then
  // moves clearly and sustainedly UP — a completely ordinary "scroll down the
  // page" gesture with the exact jitter a real touchscreen produces.
  await drive(p, [100, 103, 90, 70, 50, 30, 10]);
  const dragging = await p.evaluate(() => document.getElementById('ptr').classList.contains('dragging'));
  ok('the pull indicator never engaged on a scroll-with-jitter gesture', !dragging);
  await ctx.close();
}

/* ---- case 2: a real, sustained pull down still arms the visual feedback,
   but — the actual discriminating check — never prevents default doing it.
   Under the old {passive:false}+preventDefault code, this exact gesture
   (clearly downward, well past the decide margin) is the one case that DID
   get its default prevented; if that ever regresses, this is what catches
   it. ---- */
{
  const { ctx, p } = await open();
  const prevented = await p.evaluate(() => {
    function touch(y) { return [new Touch({ identifier: 1, target: document.body, clientX: 180, clientY: y, pageX: 180, pageY: y, screenX: 180, screenY: y })]; }
    function fire(type, y) {
      const t = touch(y);
      const ev = new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : t, targetTouches: type === 'touchend' ? [] : t, changedTouches: t });
      document.body.dispatchEvent(ev);
      return ev.defaultPrevented;
    }
    window.scrollTo(0, 0);
    fire('touchstart', 60);
    return [70, 90, 120, 160, 210].map((y) => fire('touchmove', y));
  });
  ok('a genuine sustained pull down never prevents default either — the listener can no longer block scroll at all',
    prevented.every((v) => v === false), JSON.stringify(prevented));
  const state = await p.evaluate(() => {
    const ptr = document.getElementById('ptr');
    return { dragging: ptr.classList.contains('dragging'), opacity: ptr.style.opacity, transform: ptr.style.transform };
  });
  ok('and it still arms the coin as visual feedback (feature not lost)',
    state.dragging && state.transform !== '', JSON.stringify(state));
  await ctx.close();
}

/* ---- case 3: a sideways swipe never engages the pull indicator ---- */
{
  const { ctx, p } = await open();
  await drive(p, [[180, 100], [190, 102], [220, 104], [260, 106], [300, 108]]);
  const dragging = await p.evaluate(() => document.getElementById('ptr').classList.contains('dragging'));
  ok('a mostly-sideways swipe never engages the pull indicator', !dragging);
  await ctx.close();
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
