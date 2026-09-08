/* A habit tap must survive a store that is a moment behind its own writes.

   Reported twice: "the clicks don't respond and sometimes they get stuck", then
   "when I click on one of my habits it immediately unclicks". The first fix was
   about the network (no page-wide lock, a timeout, taps queued rather than
   dropped). This is the other half, and it is not about the network at all.

   Netlify Blobs has no compare-and-swap, and a read issued straight after a
   write can still be served the older version. saveDaily used to finish by
   RE-READING dailyLogs to build its answer, so that answer could describe the
   day as it was before the tap. The client believed it and painted the tile off
   again. Worse than a flicker: the next tap was then computed from the stale
   map, so taps inverted and were lost — four taps ending up as two, one of them
   backwards.

   Both halves of the fix are asserted here:
     · the server answers from the rows it just wrote (never a re-read), and
     · the client keeps the person's own tap when an answer disagrees with it.

   The store below is deliberately hostile: every read is LAG ms behind the
   writes. Nothing else in the suite exercises that, and a strongly-consistent
   store hides this class of bug completely. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LAG = Number(process.env.GP_STORE_LAG || 250);
const TMP = tmpDir('habit-stale');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
/* A store whose reads lag its writes by ${LAG}ms — 'live' is what has been
   written, 'seen' is what a read is allowed to see yet. */
const live = {}, seen = {};
export function getStore(){ return {
  get: async (k)=> (k in seen) ? JSON.parse(JSON.stringify(seen[k])) : null,
  setJSON: async (k,v)=>{
    live[k] = JSON.parse(JSON.stringify(v));
    setTimeout(function(){ seen[k] = JSON.parse(JSON.stringify(live[k])); }, ${LAG});
  },
};}
export const __live = live;
export function __settle(){ for (const k of Object.keys(live)) seen[k] = JSON.parse(JSON.stringify(live[k])); }
export function __seed(k,v){ live[k]=v; seen[k]=JSON.parse(JSON.stringify(v)); }
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');

const mkHash = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const HABITS = [
  { id: 'bible', mentorVisible: true }, { id: 'quietTime', mentorVisible: true },
  { id: 'workout', mentorVisible: true },
  /* one with no legacy column of its own, and marked private, so the map is the
     only place its answer can live */
  { id: 'ateWell', mentorVisible: false }
];
const ME = { id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@example.com',
  campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', role: 'Cafe manager',
  active: true, surveyToken: 'tok1', staffType: 'ministry', country: 'Cambodia', habits: HABITS };
blobs.__seed('staff', [{ ...ME, pinSalt: ME.id, pinHash: mkHash('1234', ME.id) }]);

const IDS = HABITS.map(h => h.id);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
let fail500 = 0, answers = [];
const srv = http.createServer(async (req, res) => {
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let body = ''; for await (const c of req) body += c;
    if (fail500 > 0) { fail500--; res.writeHead(500, { 'Content-Type': 'application/json' }); res.end('{"ok":false}'); return; }
    const parsed = JSON.parse(body || '{}');
    const r = await api.default({ method: 'POST', json: async () => parsed, headers: new Map() }, {});
    const text = await r.text();
    if (parsed.fn === 'saveDaily') answers.push({ sent: parsed.args[3] && parsed.args[3].habits, got: JSON.parse(text) });
    res.writeHead(r.status || 200, { 'Content-Type': 'application/json' }); res.end(text); return;
  }
  let u = req.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(PUBLIC, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
/* Section 5 makes the server answer 500 on purpose, so that one is this test's
   own doing rather than the page's. */
page.on('console', m => {
  if (m.type() !== 'error') return;
  if (/net::|ERR_|status of 500/.test(m.text())) return;
  errors.push('CONSOLE ' + m.text());
});
await page.route('**fonts.g**', r => r.abort());
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })));
await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
await page.waitForSelector('nav.bottom button', { timeout: 15000 });
await page.click('nav.bottom button[data-tab="week"]');
await page.waitForSelector('[data-habit]', { timeout: 10000 });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
const lit = id => page.evaluate(i => {
  const b = document.querySelector('[data-habit="' + i + '"]');
  return b ? /\bon\b/.test(b.className) : null;
}, id);
const settle = ms => page.waitForTimeout(ms || LAG * 4 + 700);

/* ---------- 1. one tap at a time ---------- */
{
  const stuck = [];
  for (const id of IDS) {
    await page.tap('[data-habit="' + id + '"]');
    await settle();
    if (await lit(id) !== true) stuck.push(id);
  }
  ok('a tap still reads as done after the save answers',
    stuck.length === 0, stuck.length ? 'snapped back: ' + stuck.join(', ') : 'all ' + IDS.length + ' held');
}

/* ---------- 2. the server answered with what it wrote ---------- */
/* The regression this guards: ending saveDaily with a re-read of the store. */
{
  const bad = answers.filter(a => {
    const day = ((a.got && a.got.logs) || [])[0];
    if (!day || !a.sent) return true;
    return Object.keys(a.sent).some(k => !!(day.habits || {})[k] !== !!a.sent[k]);
  });
  ok('every answer describes the day as it was just written',
    bad.length === 0, bad.length ? bad.length + ' of ' + answers.length + ' answers were older than the write' : answers.length + ' answers');
}

/* ---------- 3. and the store really holds all four ---------- */
{
  blobs.__settle();
  const stored = ((blobs.__live.dailyLogs || [])[0] || {}).habits || {};
  const missing = IDS.filter(id => stored[id] !== true);
  ok('all four taps reached the store, none inverted or lost',
    missing.length === 0, JSON.stringify(stored));
}

/* ---------- 4. a burst, the way a morning is actually ticked off ---------- */
{
  for (const id of IDS) { await page.tap('[data-habit="' + id + '"]'); await page.waitForTimeout(60); }
  await settle(LAG * 5 + 1200);
  const on = [];
  for (const id of IDS) if (await lit(id) !== false) on.push(id);
  ok('four fast taps all register as off again', on.length === 0,
    on.length ? 'still lit: ' + on.join(', ') : 'all off');
  blobs.__settle();
  const stored = ((blobs.__live.dailyLogs || [])[0] || {}).habits || {};
  ok('and the store agrees with the screen',
    IDS.every(id => stored[id] === false), JSON.stringify(stored));
}

/* ---------- 5. a real failure must still be honest ---------- */
/* The fix must not turn "not saved" into a tile that looks saved. */
{
  fail500 = 1;
  await page.tap('[data-habit="bible"]');
  await settle(1500);
  ok('a save the server refused puts the tile back', await lit('bible') === false,
    'lit: ' + String(await lit('bible')));
  const msg = await page.evaluate(() => document.body.innerText);
  ok('and says so rather than failing quietly', /not saved|connection/i.test(msg));
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
