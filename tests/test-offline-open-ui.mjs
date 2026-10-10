/* Opening the app with no connection (public/sw.js and the boot copy): the
   worker installs and the page keeps its last boot; online, a new version of
   the page always wins over the kept copy; offline, the app opens on My Home
   with a line saying it is a copy and from when; ministry numbers typed offline
   queue, show at once, and a second save to the same week merges rather than
   replaces; back online they reach the server and the page boots itself again;
   another person's copy is never shown; logging out deletes it. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('offline-open');
const OUT = tmpDir('offline-open-out');
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
mem.staff = [
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com', dept: 'Skills Training', ministry: 'Culinary' }),
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com' })
];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
let VERSION = 'v1', DOWN = false;
const srv = http.createServer(async (req, res) => {
  if (DOWN) { req.socket.destroy(); return; }
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let b = ''; for await (const c of req) b += c;
    const r = await api.default({ method: 'POST', json: async () => JSON.parse(b || '{}'), headers: new Map() }, {});
    const t = await r.text(); res.writeHead(r.status || 200, { 'Content-Type': 'application/json' }); res.end(t); return;
  }
  let u = req.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(PUBLIC, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  let body = fs.readFileSync(f);
  if (u === '/teams.html') body = Buffer.from(String(body).replace('</body>', '<div id="srvVersion" hidden>' + VERSION + '</div></body>'));
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); res.end(body);
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
await page.addInitScript(() => {
  localStorage.setItem('gp-sw-test', '1');   // let the worker register under a test browser
  if (!localStorage.getItem('gp-staff') && !sessionStorage.getItem('loggedOut')) localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' }));
});
const home = async () => { await page.waitForSelector('nav.bottom button', { timeout: 15000 }); await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(400); };
const mainText = () => page.$eval('#main', e => e.innerText);

/* ---------- 1. online: the worker installs, the page keeps its copy ---------- */
await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
await home();
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForFunction(() => !!navigator.serviceWorker.controller || true);
await page.reload({ waitUntil: 'load' }); await home();
ok('the worker controls the page', await page.evaluate(() => !!navigator.serviceWorker.controller));
ok('the page kept this boot on the phone', await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('gp-boot-cache') || 'null'); return !!(c && c.user === 'sreilea' && c.d && c.d.ok); }));
ok('no offline line while online', !(await page.$('#offlineBanner')));

/* ---------- 2. network first: a new version reaches the phone at once ---------- */
VERSION = 'v2';
await page.reload({ waitUntil: 'load' }); await home();
ok('online, the page is always the newest one, not the kept copy', (await page.$eval('#srvVersion', e => e.textContent)) === 'v2');

/* ---------- 3. no connection: the app still opens ---------- */
DOWN = true; await ctx.setOffline(true);
await page.reload({ waitUntil: 'load' }); await home();
ok('with no connection the app opens on My Home, not the login', /Sreilea/.test(await mainText()) && !(await page.$('#loginUser, #pinInput')));
ok('… the last version it loaded', (await page.$eval('#srvVersion', e => e.textContent)) === 'v2');
const ban = await page.$eval('#offlineBanner', e => e.innerText).catch(() => '');
ok('a line says it is a copy, from when, and that saves will send later', /No connection — this is your page as it was on .*will send when you’re back online/.test(ban), ban);

/* ---------- 4. numbers typed offline ---------- */
await page.click('nav.bottom [data-tab="ministry"]'); await page.waitForTimeout(800);
ok('the offline line is on My Ministry too', !!(await page.$('#offlineBanner')));
await page.screenshot({ path: OUT + '/offline-ministry.png' });
if (!(await page.$('[data-kpiweek]'))) { await page.click('#kpiInputBtn').catch(() => {}); await page.waitForTimeout(300); }
const boxes = await page.$$eval('[data-kpiweek]', els => els.map(e => e.getAttribute('data-kpiweek')));
ok('the week’s boxes are there', boxes.length >= 2, boxes.slice(0, 3).join(', '));
await page.fill('[data-kpiweek="' + boxes[0] + '"]', '7');
await page.click('#saveKpiWeekBtn'); await page.waitForTimeout(500);
ok('saving says it is kept on the phone', /Saved on your phone/.test(await page.$eval('#msg', e => e.textContent)));
let q = await page.evaluate(() => JSON.parse(localStorage.getItem('gp-offline-queue') || '[]'));
ok('one queued save for the ministry’s week', q.length === 1 && q[0].fn === 'saveMyMinistry' && /^min:Skills Training\|Culinary\|/.test(q[0].key), q.map(x => x.key).join());
ok('the number shows on the page straight away', (await page.$eval('[data-kpiweek="' + boxes[0] + '"]', e => e.value).catch(() => '')) === '7' || /\b7\b/.test(await mainText()));
if (!(await page.$('[data-kpiweek]'))) { await page.click('#kpiInputBtn').catch(() => {}); await page.waitForTimeout(300); }
await page.fill('[data-kpiweek="' + boxes[1] + '"]', '3');
await page.click('#saveKpiWeekBtn'); await page.waitForTimeout(500);
q = await page.evaluate(() => JSON.parse(localStorage.getItem('gp-offline-queue') || '[]'));
const ups = q[0] && q[0].args[3].filter(u => u.value !== null);
await page.screenshot({ path: OUT + '/offline-saved.png' });
ok('a second save to the same week merges — both numbers wait, not just the last', q.length === 1 && ups.some(u => u.metric === boxes[0] && u.value === 7) && ups.some(u => u.metric === boxes[1] && u.value === 3), JSON.stringify(ups));

/* ---------- 5. back online ---------- */
DOWN = false; await ctx.setOffline(false);
await page.evaluate(() => window.dispatchEvent(new Event('online')));
await page.waitForTimeout(2500);
const saved = (mem.entries || []).filter(e => e.ministry === 'Culinary');
ok('back online, both numbers reach the server', saved.some(e => e.metric === boxes[0] && e.value === 7) && saved.some(e => e.metric === boxes[1] && e.value === 3), JSON.stringify(saved.map(e => e.metric + '=' + e.value)));
ok('the queue is empty', (await page.evaluate(() => JSON.parse(localStorage.getItem('gp-offline-queue') || '[]'))).length === 0);
ok('the page booted again by itself and the offline line is gone', !(await page.$('#offlineBanner')));

/* ---------- 6. someone else on the same phone, and logging out ---------- */
await page.evaluate(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'mealea', pin: '1234' })); });
DOWN = true; await ctx.setOffline(true);
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('offline, another person’s copy is never shown', !/Sreilea/.test(await page.$eval('body', e => e.innerText)) && !(await page.$('#offlineBanner')));
DOWN = false; await ctx.setOffline(false);
await page.reload({ waitUntil: 'load' }); await home();
await page.evaluate(() => { sessionStorage.setItem('loggedOut', '1'); logout(); });
ok('logging out deletes the copy', await page.evaluate(() => localStorage.getItem('gp-boot-cache') === null));

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
