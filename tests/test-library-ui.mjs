/* The Library on the page, on the real backend: in the menu; the books load
   only when it opens; every book on the shelf with its cover (a stand-in image
   for Open Library) or a drawn one; shelves filter; a book page has every part;
   Mark as read sticks on this phone and shows on the shelf; Next book; with the
   cover service blocked nothing looks broken; Khmer at 320px; a failed load
   offers Try again. */
import vm from 'node:vm';
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('library-ui');
/* a 40×60 PNG standing in for an Open Library cover (the sandbox cannot reach it) */
const COVER_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACgAAAA8CAIAAACb22+3AAAAOElEQVR4nO3NQQkAAAgEsAtmCGMbyxgiDPZfpvpExGKxWCwWi8VisVgsFovFYrFYLBaLxWLxp3gBm4B0NUMK7qAAAAAASUVORK5CYII=', 'base64');
const OUT = tmpDir('library-ui-out');
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
const srv = http.createServer(async (req, res) => {
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let b = ''; for await (const c of req) b += c;
    const r = await api.default({ method: 'POST', json: async () => JSON.parse(b || '{}'), headers: new Map() }, {});
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
async function open(user, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  if (opts.at) await page.clock.setFixedTime(opts.at);
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  if (opts.covers === 'ok') await page.route('https://covers.openlibrary.org/**', r => r.fulfill({ status: 200, contentType: 'image/png', body: COVER_PNG }));
  else await page.route('https://covers.openlibrary.org/**', r => r.abort());
  await page.addInitScript(a => {
    localStorage.setItem('gp-staff', JSON.stringify({ user: a.u, pin: '1234' }));
    if (a.km) localStorage.setItem('gp-lang', 'km');
  }, { u: user, km: !!opts.km });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]');
  await page.waitForTimeout(400);
  return { ctx, page };
}




const C = {}; vm.createContext(C); vm.runInContext(fs.readFileSync(PUBLIC + '/library.js', 'utf8') + ';this.L=GP_LIBRARY;', C);
const BOOKS = C.L.books;
const START = C.L.startHere || [];
const openLib = async page => { await page.click('#menuBtn'); await page.waitForTimeout(250); await page.click('[data-menu-item="library"]'); await page.waitForTimeout(900); };
{
  const { ctx, page } = await open('sreilea', { covers: 'ok' });
  const loadedAtStart = await page.evaluate(() => typeof GP_LIBRARY !== 'undefined');
  ok('the books are not loaded until the Library is opened', !loadedAtStart);
  await page.click('#menuBtn'); await page.waitForTimeout(250);
  ok('Library is in the menu', !!(await page.$('[data-menu-item="library"]')));
  await page.click('[data-menu-item="library"]'); await page.waitForTimeout(900);
  const cards = await page.$$('[data-libbook]');
  ok('every book is on the shelf', cards.length === BOOKS.length, cards.length + ' of ' + BOOKS.length);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(500);
  const imgs = await page.$$eval('.libCover .libCoverImg', is => is.filter(i => i.complete && i.naturalWidth > 0).length);
  ok('books with an ISBN show their cover', imgs === BOOKS.filter(b => b.isbn).length, imgs + ' covers');
  ok('… and the ones without still have a drawn cover', (await page.$$('.libCoverDrawn')).length === BOOKS.length);
  await page.screenshot({ path: OUT + '/library.png', fullPage: true });
  await page.click('[data-libshelf="start"]'); await page.waitForTimeout(250);
  const startIds = await page.$$eval('[data-libbook]', els => els.map(e => e.getAttribute('data-libbook')));
  ok('“Start here” shows the ten picks, in order, with a line on why', startIds.join() === START.join() && !!(await page.$('.libStartNote')), startIds.length + ' books');
  await page.click('[data-libshelf="habits"]'); await page.waitForTimeout(250);
  ok('a shelf shows only its books', (await page.$$('[data-libbook]')).length === BOOKS.filter(b => b.shelf === 'habits').length);
  await page.click('[data-libbook="atomic-habits"]'); await page.waitForTimeout(400);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('a book page: title, author, minutes, the vibe line', /Atomic Habits/.test(txt) && /James Clear/.test(txt) && /5-minute read/.test(txt) && /Tiny changes, wild results/.test(txt));
  ok('… the big idea, numbered insights, try this week, for us at GP and the one line',
    /The big idea/i.test(txt) && (await page.$$('.libInsight')).length === 6 && /Try this week/i.test(txt) && /For us at GP/i.test(txt) && /In one line/i.test(txt));
  await page.screenshot({ path: OUT + '/book.png', fullPage: true });
  await page.click('#libMarkRead'); await page.waitForTimeout(250);
  ok('Mark as read ticks it, on this phone only', /✓ Read/.test(await page.$eval('#libMarkRead', e => e.innerText)) && await page.evaluate(() => !!JSON.parse(localStorage.getItem('gp-lib-read'))['atomic-habits']));
  const next = await page.$eval('[data-libbook]', e => e.getAttribute('data-libbook'));
  await page.click('[data-libbook="' + next + '"]'); await page.waitForTimeout(300);
  ok('Next book goes on to the next one', await page.evaluate(n => S.libBook === n, next) && next !== 'atomic-habits', next);
  await page.click('#libBack'); await page.waitForTimeout(300);
  await page.click('[data-libshelf="all"]'); await page.waitForTimeout(250);
  ok('back on the shelf the read book has a tick, and the count says so', !!(await page.$('[data-libbook="atomic-habits"] .libReadTag')) && /\b1\s*\/\s*\d+\s*read/.test(await page.$eval('.libProgress', e => e.innerText)));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const { ctx, page } = await open('sreilea', { covers: 'blocked' });
  await openLib(page);
  await page.waitForTimeout(600);
  /* covers below the fold load lazily, so only the ones on screen have been tried */
  const onScreenImgs = await page.$$eval('.libCoverImg', is => is.filter(i => { const r = i.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; }).length);
  ok('with no cover service, the drawn covers show and no broken image is left on screen', onScreenImgs === 0 && (await page.$$('.libCoverDrawn')).length === BOOKS.length, onScreenImgs + ' left');
  await page.screenshot({ path: OUT + '/library-drawn.png', fullPage: false });
  await page.click('[data-libbook="extreme-ownership"]'); await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/book-drawn.png', fullPage: true });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route('**fonts.g**', r => r.abort());
  await page.route('https://covers.openlibrary.org/**', r => r.abort());
  await page.addInitScript(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })); localStorage.setItem('gp-lang', 'km'); });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await openLib(page);
  ok('in Khmer the Library’s own words are Khmer', /បណ្ណាល័យ/.test(await page.$eval('#main h2', e => e.innerText)));
  await page.click('[data-libbook]'); await page.waitForTimeout(300);
  ok('… and a book page fits a 320px phone', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await ctx.close();
}
{
  const { ctx, page } = await open('sreilea');
  await page.route('**/library.js', r => r.abort());
  await openLib(page);
  ok('if the books cannot load, it says so and offers Try again', !!(await page.$('#libRetry')));
  await page.unroute('**/library.js');
  await page.click('#libRetry'); await page.waitForTimeout(900);
  ok('… and Try again loads them', (await page.$$('[data-libbook]')).length === BOOKS.length);
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
