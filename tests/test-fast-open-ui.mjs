/* Opening the app fast: with a copy of the last boot on the phone the page draws
   from it at once — before a slow server answers — marked Updating…; a call made
   meanwhile is held and goes out after the fresh boot, never against the copy;
   the fresh data then replaces it; a PIN the server refuses still ends at the
   login, with the copy deleted and nothing held sent. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('fast-open');
const OUT = tmpDir('fast-open-out');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) {
  if (f.endsWith('.js')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
}
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const mk = o => Object.assign({ active: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Staff', staffType: 'campus', country: 'Cambodia', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
mem.staff = [ mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }) ];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
let BOOT_DELAY = 0; const arrivals = [];
const srv = http.createServer(async (req, res) => {
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let b = ''; for await (const c of req) b += c;
    const q = JSON.parse(b || '{}');
    if (q.fn === 'getMyBoot' && BOOT_DELAY) await new Promise(r => setTimeout(r, BOOT_DELAY));
    arrivals.push({ fn: q.fn, at: Date.now() });
    const r = await api.default({ method: 'POST', json: async () => q, headers: new Map() }, {});
    const t = await r.text(); res.writeHead(r.status || 200, { 'Content-Type': 'application/json' }); res.end(t); return;
  }
  let u = req.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(PUBLIC, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
await page.route('**fonts.g**', r => r.abort());
await page.addInitScript(() => { if (!localStorage.getItem('gp-staff')) localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })); });

/* 1. the first open on this phone: nothing kept, the page waits for the server as before */
await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
await page.waitForSelector('nav.bottom button', { timeout: 15000 });
ok('the first open keeps a copy for next time', await page.evaluate(() => !!localStorage.getItem('gp-boot-cache')));
ok('… and shows no Updating bar', !(await page.$('#staleBar')));

/* 2. the next open, with the server slow to answer */
mem.staff[0].name = 'Sreilea Chan-Sok';                 // changed since the copy was kept
BOOT_DELAY = 2500;
const t0 = Date.now();
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('nav.bottom button', { timeout: 15000 });
const drawnIn = Date.now() - t0;
const stale = await page.$('#staleBar');
const mainNow = await page.$eval('#main', e => e.innerText);
ok('the page draws from the kept copy at once, without waiting for the server', drawnIn < 2000 && !!stale && /Sreilea Chan/.test(mainNow), drawnIn + 'ms');
ok('… marked Updating…', /Updating…/.test(await page.$eval('#staleBar', e => e.innerText).catch(() => '')));
await page.screenshot({ path: OUT + '/fast-stale.png' });

/* 3. a call made while the copy is showing waits for the fresh boot */
arrivals.length = 0;
await page.evaluate(() => run('getMyTrips', [S.auth.user, S.auth.pin], function (d) { window.__tripsAt = Date.now(); }));
await page.waitForTimeout(400);
ok('a call made meanwhile is held, not sent against the copy', !arrivals.some(a => a.fn === 'getMyTrips'));
await page.waitForFunction(() => !document.getElementById('staleBar'), null, { timeout: 8000 });
await page.waitForTimeout(500);
const iBoot = arrivals.findIndex(a => a.fn === 'getMyBoot'), iTrips = arrivals.findIndex(a => a.fn === 'getMyTrips');
ok('… and goes out once the fresh boot is in, and answers', iTrips > -1 && (iBoot === -1 || iTrips > iBoot) && await page.evaluate(() => !!window.__tripsAt), arrivals.map(a => a.fn).join(','));
ok('the fresh data replaces the copy and the bar goes', /Sreilea Chan-Sok/.test(await page.evaluate(() => S.me.name)) && !(await page.$('#staleBar')));

/* 4. a PIN the server now refuses: the copy shows a moment, then the login, and nothing held goes out */
mem.staff[0].pinHash = 'changed';
BOOT_DELAY = 1200;
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('nav.bottom button', { timeout: 15000 });
arrivals.length = 0;
await page.evaluate(() => run('getMyTrips', [S.auth.user, S.auth.pin], function () {}));
await page.waitForTimeout(2500);
ok('a refused PIN ends at the login, with the copy deleted', await page.evaluate(() => !S.me && !localStorage.getItem('gp-boot-cache') && !localStorage.getItem('gp-staff')));
ok('… and the held call was dropped, not sent', !arrivals.some(a => a.fn === 'getMyTrips'), arrivals.map(a => a.fn).join(','));

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
