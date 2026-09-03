/* A trackpad two-finger swipe never travels in a perfectly straight line, so
   a "scroll the page" gesture over My Database's quick-jump strip always
   carries a little sideways drift. touch-action (see test-touch-scroll.mjs)
   only ever covered a touchscreen — a trackpad sends wheel events, not touch
   events, and a wheel event with any horizontal component gets claimed
   entirely by a horizontally-scrollable element, deltaY included, unless
   something hands the vertical part back to the page. This drives real
   `wheel` events (Playwright's page.mouse.wheel, not a touch simulation) to
   catch exactly that. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = PUBLIC;
const OUT = tmpDir('out') + '/';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
await new Promise(res => srv.listen(4407, res));

const DARA = { id: 'st_dara', name: 'Dara Pich', username: 'dara', campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', role: 'Base director', photo: '', mentorId: '' };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 1200, height: 800 } }); // a laptop, not a phone — no touch capability
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = {
    ok: true, staff: DARA, profile: {}, roster: [DARA], logs: [], habits: null,
    mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [], ministry: null,
    base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [] }
  };
  else if (q.fn === 'teamRoster') o = [DARA];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: DARA, profile: {} };
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'dara', pin: '1234' })));
await p.goto('http://localhost:4407/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(500);
await p.click('nav.bottom [data-tab="week"]');
await p.waitForTimeout(600);

const qb = await p.$('.quickBar');
ok('the quick-jump strip is on the page', !!qb);
if (qb) {
  const box = await qb.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

  /* A mostly-vertical swipe with a little drift, the shape a real trackpad
     gesture actually has — a clean page.mouse.wheel(0, N) never reproduced
     the bug, because a pure vertical delta was never what broke it. */
  let scrollBefore = await p.evaluate(() => window.scrollY);
  for (let i = 0; i < 15; i++) await p.mouse.wheel(3, 30);
  await p.waitForTimeout(200);
  let scrollAfter = await p.evaluate(() => window.scrollY);
  ok('a mostly-vertical swipe over the strip still scrolls the page', scrollAfter > scrollBefore,
    scrollBefore + ' -> ' + scrollAfter);

  /* And the strip itself must still work for an actual sideways swipe —
     the fix must not just disable the strip's own scrolling to get the
     above to pass. */
  await p.evaluate(() => window.scrollTo(0, 0));
  const chipBefore = await p.evaluate(el => el.scrollLeft, qb);
  for (let i = 0; i < 15; i++) await p.mouse.wheel(30, 3);
  await p.waitForTimeout(200);
  const chipAfter = await p.evaluate(el => el.scrollLeft, qb);
  ok('a mostly-horizontal swipe still scrolls the strip', chipAfter > chipBefore,
    chipBefore + ' -> ' + chipAfter);
}

/* The same rebind has to survive a re-render, since #main's whole subtree
   (quickBar included) is rebuilt from scratch on every render() call. */
await p.click('nav.bottom [data-tab="base"]');
await p.waitForTimeout(300);
await p.click('nav.bottom [data-tab="week"]');
await p.waitForTimeout(300);
const qb2 = await p.$('.quickBar');
if (qb2) {
  const box2 = await qb2.boundingBox();
  await p.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
  const before = await p.evaluate(() => window.scrollY);
  for (let i = 0; i < 15; i++) await p.mouse.wheel(3, 30);
  await p.waitForTimeout(200);
  const after = await p.evaluate(() => window.scrollY);
  ok('the fix still applies after leaving and returning to the tab', after > before, before + ' -> ' + after);
}

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
