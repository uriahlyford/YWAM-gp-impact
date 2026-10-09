/* The Library on the page, on the real backend: in the menu; the books load
   only when it opens; the home is swipeable rows (Start here, each shelf, See all)
   of tiles with drawn covers — one series look, nothing fetched, neighbours never
   the same pattern; a book page has every part; the reader goes one key idea per
   screen (Next, swipe, Close keeps your place, Continue reading, Done marks it
   read); Khmer at 320px; a failed load offers Try again. */
import vm from 'node:vm';
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('library-ui');
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
const errors = [], imageFetches = [];
async function open(user, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  if (opts.at) await page.clock.setFixedTime(opts.at);
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  page.on('request', r => { if (r.resourceType() === 'image' && !r.url().startsWith(BASE) && !r.url().startsWith('data:')) imageFetches.push(r.url()); });
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
const AH = BOOKS.find(b => b.id === 'atomic-habits'), AHN = AH.insights.length;
const openLib = async page => { await page.click('#menuBtn'); await page.waitForTimeout(250); await page.click('[data-menu-item="library"]'); await page.waitForTimeout(900); };
{
  const { ctx, page } = await open('sreilea');
  const loadedAtStart = await page.evaluate(() => typeof GP_LIBRARY !== 'undefined');
  ok('the books are not loaded until the Library is opened', !loadedAtStart);
  await page.click('#menuBtn'); await page.waitForTimeout(250);
  ok('Library is in the menu', !!(await page.$('[data-menu-item="library"]')));
  await page.click('[data-menu-item="library"]'); await page.waitForTimeout(900);
  const rows = await page.$$eval('.libSecHead', hs => hs.map(h => h.innerText.replace(/\s+/g, ' ')));
  const SHOWN = C.L.shelves.filter(x => x.id === 'gp').concat(C.L.shelves.filter(x => x.id !== 'gp'));
  ok('the home is rows: Start here, the GP guides, then one per shelf, each with See all', rows.length === 1 + SHOWN.length && /Start here/.test(rows[0]) && /Made at GP/.test(rows[1]) && rows.slice(1).every((r, i) => r.includes(SHOWN[i].name) && /See all/.test(r)), rows.join(' | '));
  const ids = new Set(await page.$$eval('.libTile', ts => ts.map(t => t.getAttribute('data-libbook'))));
  ok('every book is on its shelf’s row', ids.size === BOOKS.length && BOOKS.every(b => ids.has(b.id)), ids.size + ' of ' + BOOKS.length);
  const shelfRows = await page.$$eval('.libRow', rs => rs.slice(1).map(r => [...r.querySelectorAll('.libTile')].map(t => ({
    id: t.getAttribute('data-libbook'), title: t.querySelector('.libCoverTitle').innerText, svg: t.querySelector('.libCoverArt svg').innerHTML,
    ratio: (b => b.height / b.width)(t.querySelector('.libCover').getBoundingClientRect()), meta: t.querySelector('.libTileMeta').innerText }))));
  const flat = shelfRows.flat();
  ok('every book has a drawn cover with its title on it', flat.length === BOOKS.length && flat.every(c => c.title.toLowerCase() === BOOKS.find(b => b.id === c.id).title.toLowerCase() && c.svg.length > 50));
  ok('… all the same shape', flat.every(c => Math.abs(c.ratio - 1.5) < 0.02));
  ok('… and no two side by side on a shelf share a pattern', shelfRows.every(r => r.every((c, i) => i === 0 || c.svg !== r[i - 1].svg)));
  ok('under each: minutes and how many key ideas', flat.every(c => /5 min · 💡 \d/.test(c.meta)), flat[0].meta);
  ok('no cover is fetched from anywhere — they show at once, offline too', imageFetches.length === 0 && !(await page.$('.libCover img')), imageFetches.slice(0, 3).join(' '));
  const clipped = await page.$$eval('.libCoverTitle', ts => ts.filter(t => { const lh = parseFloat(getComputedStyle(t).fontSize) * 1.02;   // a line clamped away, not Koulen's tall caps
      return t.scrollWidth > t.clientWidth + 1 || t.scrollHeight - t.clientHeight > lh * 0.5; }).map(t => t.innerText.replace(/\n/g, ' ') + ':' + (t.scrollHeight - t.clientHeight)));
  ok('every title fits whole on its cover', clipped.length === 0, clipped.join(' | '));
  ok('the rows swipe sideways inside themselves; the page does not', await page.evaluate(() => { const r = document.querySelector('.libRow'); return r.scrollWidth > r.clientWidth && document.documentElement.scrollWidth <= window.innerWidth + 1; }));
  await page.screenshot({ path: OUT + '/library.png' });
  await page.click('.libSeeAll[data-libshelf="start"]'); await page.waitForTimeout(250);
  const startIds = await page.$$eval('.libGrid .libTile', els => els.map(e => e.getAttribute('data-libbook')));
  ok('See all on Start here: the ten picks, in order, with a line on why', startIds.join() === START.join() && !!(await page.$('.libStartNote')), startIds.length + ' books');
  await page.click('[data-libshelf="habits"]'); await page.waitForTimeout(250);
  ok('a shelf shows only its books', (await page.$$('.libGrid .libTile')).length === BOOKS.filter(b => b.shelf === 'habits').length);
  await page.screenshot({ path: OUT + '/shelf.png' });
  await page.click('[data-libbook="atomic-habits"]'); await page.waitForTimeout(400);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('a book page: cover, title, author, minutes, key ideas, the vibe line', !!(await page.$('.libHead .libCover')) && /Atomic Habits/.test(txt) && /James Clear/.test(txt) && /5-minute read/.test(txt) && new RegExp(AHN + ' key ideas').test(txt) && txt.includes(AH.vibe.slice(0, 24)));
  ok('… Start reading, what it’s about, what’s inside and for us at GP',
    /Start reading/.test(await page.$eval('#libStart', e => e.innerText)) && /What’s it about\?/.test(txt) && (await page.$$('.libInsideItem')).length === AHN && /For us at GP/i.test(txt));
  await page.screenshot({ path: OUT + '/book.png' });
  await page.click('#libStart'); await page.waitForTimeout(300);
  let r = await page.$eval('#libReader', e => e.innerText);
  ok('the reader opens on the intro, with a bar of every step', /Intro/i.test(r) && (await page.$$('.libSegs span')).length === AHN + 2 && (await page.$$('.libSegs span.on')).length === 1 && !(await page.$('#libPrev')));
  await page.click('#libNext'); await page.waitForTimeout(200);
  r = await page.$eval('#libReader', e => e.innerText);
  ok('Next: key idea 1 of all, one idea on the screen', new RegExp('Key idea 1 of ' + AHN, 'i').test(r) && !!(await page.$('.libReaderEmoji')) && (await page.$$('.libSegs span.on')).length === 2);
  await page.screenshot({ path: OUT + '/reader.png' });
  await page.evaluate(() => {   // a swipe to the left
    const el = document.getElementById('libReader');
    const tt = (x) => [new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 })];
    el.dispatchEvent(new TouchEvent('touchstart', { touches: tt(320), changedTouches: tt(320), bubbles: true }));
    el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: tt(120), bubbles: true }));
  });
  await page.waitForTimeout(200);
  ok('a swipe to the left goes on to key idea 2', new RegExp('Key idea 2 of ' + AHN, 'i').test(await page.$eval('#libReader', e => e.innerText)));
  await page.click('#libClose'); await page.waitForTimeout(250);
  ok('closing keeps your place: Continue — key idea 2', /Continue — key idea 2/.test(await page.$eval('#libStart', e => e.innerText)));
  await page.click('#libBack'); await page.waitForTimeout(250);
  await page.click('[data-libshelf="all"]'); await page.waitForTimeout(250);
  ok('… and the home has a Continue reading row with it, and a progress bar on its tile', /Continue reading/.test(await page.$eval('.libSecHead', e => e.innerText)) && !!(await page.$('.libRow [data-libbook="atomic-habits"] .libTileBar')));
  await page.click('.libRow [data-libbook="atomic-habits"]'); await page.waitForTimeout(300);
  await page.click('#libStart'); await page.waitForTimeout(250);
  ok('Continue opens where you were', new RegExp('Key idea 2 of ' + AHN, 'i').test(await page.$eval('#libReader', e => e.innerText)));
  for (let i = 0; i < AHN - 1; i++) { await page.click('#libNext'); await page.waitForTimeout(120); }
  r = await page.$eval('#libReader', e => e.innerText);
  ok('the last screen is the final summary: in one line, try this week, for us at GP', /Final summary/i.test(r) && /In one line/i.test(r) && /Try this week/i.test(r) && /For us at GP/i.test(r) && !!(await page.$('#libFinish')));
  ok('nothing in the reader scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await page.screenshot({ path: OUT + '/summary.png' });
  await page.click('#libFinish'); await page.waitForTimeout(250);
  ok('Done marks it read, on this phone only, and clears the place', /Read again/.test(await page.$eval('#libStart', e => e.innerText)) &&
    await page.evaluate(() => !!JSON.parse(localStorage.getItem('gp-lib-read'))['atomic-habits'] && !JSON.parse(localStorage.getItem('gp-lib-progress') || '{}')['atomic-habits']));
  const next = await page.$eval('.btnRow [data-libbook]', e => e.getAttribute('data-libbook'));
  await page.click('.btnRow [data-libbook="' + next + '"]'); await page.waitForTimeout(300);
  ok('Next book goes on to the next one', await page.evaluate(n => S.libBook === n, next) && next !== 'atomic-habits', next);
  await page.click('#libMarkRead'); await page.waitForTimeout(200);
  await page.click('#libBack'); await page.waitForTimeout(250);
  await page.click('.libRow [data-libbook="working-well-with-cambodians"]'); await page.waitForTimeout(300);
  ok('a GP guide says it is an original, not a published book', /Original GP guide/.test(await page.$eval('#main', e => e.innerText)) && /not a published book/.test(await page.$eval('#main .pFine', e => e.innerText)));
  await page.click('#libBack'); await page.waitForTimeout(250);
  await page.click('.libRow [data-libbook="' + next + '"]'); await page.waitForTimeout(300);
  ok('Mark as read works without reading through', await page.evaluate(n => !!JSON.parse(localStorage.getItem('gp-lib-read'))[n], next));
  await page.click('#libBack'); await page.waitForTimeout(300);
  ok('back home the read books have a tick, and the count says so', !!(await page.$('[data-libbook="atomic-habits"] .libReadTag')) && /\b2\s*\/\s*\d+\s*read/.test(await page.$eval('.libProgress', e => e.innerText)) && !/Continue reading/.test(await page.$eval('#main', e => e.innerText)));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  ok('reading in English never loads the Khmer', await page.evaluate(() => typeof GP_LIBRARY_KM === 'undefined'));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })); localStorage.setItem('gp-lang', 'km'); });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await openLib(page);
  ok('in Khmer the Library’s own words are Khmer', /បណ្ណាល័យ/.test(await page.$eval('#main h2', e => e.innerText)));
  ok('… and the home fits a 320px phone', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await page.click('[data-libbook]'); await page.waitForTimeout(600);
  ok('… and a book page fits a 320px phone', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  const kmAbout = await page.$eval('.libSec p', e => e.innerText);
  ok('in Khmer the summary itself is Khmer, and ខ្មែរ is on', /[\u1780-\u17FF]{5}/.test(kmAbout) && !!(await page.$('[data-liblang="km"].on')), kmAbout.slice(0, 40));
  await page.click('[data-liblang="en"]'); await page.waitForTimeout(250);
  const enAbout = await page.$eval('.libSec p', e => e.innerText);
  ok('… English switches it to the English, and that is remembered', !/[\u1780-\u17FF]/.test(enAbout) && await page.evaluate(() => localStorage.getItem('gp-lib-lang') === 'en'), enAbout.slice(0, 40));
  await page.click('[data-liblang="km"]'); await page.waitForTimeout(250);
  await page.click('#libStart'); await page.waitForTimeout(250); await page.click('#libNext'); await page.waitForTimeout(200);
  ok('… and the reader too, in Khmer — the key idea itself Khmer', await page.evaluate(() => document.documentElement.scrollWidth <= 321) && /គំនិតសំខាន់ទី 1/.test(await page.$eval('#libReader', e => e.innerText)) &&
    /[\u1780-\u17FF]{5}/.test(await page.$eval('.libReaderBody p', e => e.innerText)));
  await page.screenshot({ path: OUT + '/reader-km.png' });
  await ctx.close();
}
{
  const { ctx, page } = await open('sreilea');
  await page.route('**/library.js', r => r.abort());
  await openLib(page);
  ok('if the books cannot load, it says so and offers Try again', !!(await page.$('#libRetry')));
  await page.unroute('**/library.js');
  await page.click('#libRetry'); await page.waitForTimeout(900);
  ok('… and Try again loads them', new Set(await page.$$eval('.libTile', ts => ts.map(t => t.getAttribute('data-libbook')))).size === BOOKS.length);
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
