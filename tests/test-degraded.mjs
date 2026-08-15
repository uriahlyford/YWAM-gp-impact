/* Prove the failure mode is now benign: serve the real site but make chosen
   scripts 404, and check whether the app still works or shows the error screen.

   Before the fix, a missing logo.js painted "This didn't load properly" over
   the whole app. It must now cost only the logo. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

let BLOCK = new Set();
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  if (BLOCK.has(p.replace(/^\//, ''))) { res.writeHead(404); res.end('not found'); return; }
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4399, r));

const DATA = { leader: false, entries: { poipet: { 'Base Leadership|Campus Leadership|Total Staff': { 1: 12 } } }, okrs: [], survey: [] };
const browser = await chromium.launch({ executablePath: CHROMIUM });

async function run(label, page_, blocked, seed) {
  BLOCK = new Set(blocked);
  const page = await browser.newPage({ viewport: { width: 390, height: 850 } });
  await page.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}');
    let out = DATA;
    if (b.fn === 'getMyBoot') out = { ok: true,
      staff: { id: 'x', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '' },
      profile: {}, roster: [], logs: [], habits: null, mentees: [], mentorRequests: [],
      goals: [], checkins: [],
      trips: { ok: true, trips: [], totals: {}, reasons: { work: ['a'], personal: ['b'] }, hasMentor: false },
      tripRequests: [], ministry: null, base: DATA };
    else     if (b.fn === 'teamRoster') out = [];
    else if (b.fn === 'staffLogin') out = { ok: true, staff: { id: 'x', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '' }, profile: {} };
    else if (b.fn === 'getMyTrips') out = { ok: true, trips: [], totals: {}, reasons: { work: ['Ministry trip'], personal: ['Family'] }, hasMentor: false };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  if (seed) await page.addInitScript(seed);
  await page.goto('http://localhost:4399/' + page_, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const dead = await page.evaluate(() => document.body.innerText.includes("didn’t load properly") || document.body.innerText.includes("didn't load properly"));
  const usable = await page.evaluate(() =>
    !!document.querySelector('.hero, .welcome, nav.bottom button, #li_user, .loadText'));
  const logoBroken = await page.evaluate(() => {
    const i = document.getElementById('brandLogo');
    return i ? !(i.naturalWidth > 0) : 'no-logo-el';
  });
  console.log(`${label}\n   blocked: ${blocked.join(', ') || '(nothing)'}` +
    `\n   error screen: ${dead ? 'YES  <-- app dead' : 'no'}` +
    `\n   app usable:   ${usable}` +
    `\n   logo missing: ${logoBroken}`);
  const progTab = await page.evaluate(() => !!document.querySelector('[data-view="programs"]'));
  await page.close();
  return { dead, usable, progTab };
}

console.log('=== dashboard ===');
const a = await run('healthy', 'index.html', []);
const b = await run('logo.js missing', 'index.html', ['logo.js']);
const c = await run('km.js missing', 'index.html', ['km.js']);
const d = await run('taxonomy.js missing (must still be fatal)', 'index.html', ['taxonomy.js']);
const d2 = await run('rollup.js missing (must still be fatal)', 'index.html', ['rollup.js']);
/* programs.js is data-optional: without it the Programs tab is simply not offered,
   and the KPI screens are untouched. */
const d3 = await run('programs.js missing', 'index.html', ['programs.js'],
  () => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));

console.log('\n=== staff page ===');
const seed = () => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
const e = await run('healthy', 'teams.html', [], seed);
const f = await run('logo.js missing', 'teams.html', ['logo.js'], seed);
const g = await run('taxonomy.js missing (must still be fatal)', 'teams.html', ['taxonomy.js'], seed);
const g2 = await run('rollup.js missing (must still be fatal)', 'teams.html', ['rollup.js'], seed);
const g3 = await run('jobfocus.js missing', 'teams.html', ['jobfocus.js'], seed);

const fails = [];
if (a.dead || !a.usable) fails.push('healthy dashboard broken');
if (b.dead || !b.usable) fails.push('missing logo.js still kills the dashboard');
if (c.dead || !c.usable) fails.push('missing km.js still kills the dashboard');
if (!d.dead) fails.push('missing taxonomy.js no longer reports an error');
if (!d2.dead) fails.push('missing rollup.js silently degrades the dashboard maths');
if (d3.dead || !d3.usable) fails.push('missing programs.js kills the dashboard instead of hiding one tab');
if (d3.progTab) fails.push('the Programs tab is offered with no programs.js behind it');
if (e.dead || !e.usable) fails.push('healthy staff page broken');
if (f.dead || !f.usable) fails.push('missing logo.js still kills the staff page');
if (!g.dead) fails.push('missing taxonomy.js no longer reports an error on staff page');
if (!g2.dead) fails.push('missing rollup.js silently degrades the staff page');
if (g3.dead || !g3.usable) fails.push('missing jobfocus.js still kills the staff page');

console.log('\n' + (fails.length ? 'FAILURES:\n - ' + fails.join('\n - ') : 'All degradation checks passed.'));
await browser.close();
server.close();
process.exit(fails.length ? 1 : 0);
