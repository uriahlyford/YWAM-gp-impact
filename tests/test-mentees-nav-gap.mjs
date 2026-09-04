/* Reported bug: opening My Mentees (short content — a couple of dircards,
   nothing else) made the fixed bottom nav "hop up" with a strip of page
   background showing beneath it. That's mobile Chrome's dynamic toolbar
   resizing the viewport differently depending on whether the page is tall
   enough to need scrolling — a well-known class of bug with a
   `position:fixed; bottom:0` element on a short page. A headless browser
   doesn't reproduce the toolbar animation itself, but it can verify the
   actual fix: body is never allowed to render shorter than one full screen
   (`min-height:100dvh`, with a `100vh` fallback), so the toolbar's decision
   stays the same on every page, long or short. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';

const ROOT = PUBLIC;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, res) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise(res => srv.listen(4421, res));

const ME = { id: 'st1', name: 'Andrew', username: 'andrew', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '', mentorId: '' };
// One mentee, no requests — deliberately the shortest My Mentees can be.
const MENTEE = { id: 'st2', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Youth Education', ministry: 'YDC', role: '', photo: '' };
const BOOT = {
  ok: true, staff: ME, profile: { email: 'x@example.com' }, roster: [ME, MENTEE], logs: [], habits: null,
  mentees: [MENTEE], mentorRequests: [], goals: [], checkins: [], ministry: null,
  trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [],
  base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [], roster: [] }
};

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const b = await chromium.launch({ executablePath: CHROMIUM });
// A tall phone viewport, same idea as the real report — plenty of room below
// a two-line mentee list for the old bug to show a gap in.
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = BOOT;
  else if (q.fn === 'teamRoster') o = [ME];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: ME, profile: {} };
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [MENTEE], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript((u) => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), ME.username);
await p.goto('http://localhost:4421/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.click('nav.bottom [data-tab="team"]');
await p.waitForTimeout(500);
await p.click('#goMentor');
await p.waitForTimeout(500);

const mentees = await p.evaluate(() => document.querySelectorAll('[data-mentee]').length);
ok('landed on My Mentees with the short one-person list', mentees === 1, mentees);

const layout = await p.evaluate(() => ({
  innerHeight: window.innerHeight,
  bodyScrollHeight: document.body.scrollHeight,
  bodyMinHeight: getComputedStyle(document.body).minHeight,
  navBottom: document.querySelector('nav.bottom').getBoundingClientRect().bottom,
}));
ok('the page is never shorter than the screen, even on this short a list',
  layout.bodyScrollHeight >= layout.innerHeight, JSON.stringify(layout));
ok('body has a min-height set (the actual fix) rather than relying on content',
  parseFloat(layout.bodyMinHeight) > 0, layout.bodyMinHeight);
ok('the fixed nav still sits flush with the bottom of the viewport — no gap',
  Math.abs(layout.navBottom - layout.innerHeight) < 1, JSON.stringify(layout));

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
