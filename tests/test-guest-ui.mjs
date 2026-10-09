/* Looking around without an account (teams.html guest mode) — on the page, on the real backend: in the menu; the books load
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

const TMP = tmpDir('guest-ui');
const OUT = tmpDir('guest-ui-out');
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
  mk({ id: 'st1', name: 'Dara Sok', username: 'dara', email: 'd@e.com', libRead: { 'atomic-habits': '2026-10-01', 'grit': '2026-10-02' } }),
  mk({ id: 'st2', name: 'Emma Hill', username: 'emma', email: 'e@e.com' }),
  mk({ id: 'st3', name: 'Uriah Lyford', username: 'uriah', email: 'u@e.com', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true })
];
const PDF64 = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF').toString('base64');
mem.reqDocs = [
  { id: 'rd_cpp', title: 'Child Protection Policy', fileId: 'rf_cpp', fileName: 'cpp.pdf', mime: 'application/pdf', size: 900, version: 1, updated: '2026-10-01T00:00:00Z', order: 0 },
  { id: 'rd_man', title: 'Staff Manual', url: 'https://drive.example.org/manual', version: 1, updated: '2026-10-01T00:00:00Z', order: 1 }
];
mem['reqfile:rf_cpp'] = { id: 'rf_cpp', docId: 'rd_cpp', name: 'cpp.pdf', mime: 'application/pdf', data: PDF64 };
const CALLS = [];
mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: 40, year: 2026, value: 12 }];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer(async (req, res) => {
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let b = ''; for await (const c of req) b += c;
    try { const j = JSON.parse(b || '{}'); CALLS.push({ fn: j.fn, args: j.args || [] }); } catch (e) {}
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
async function open(opts) {
  opts = opts || {};
  const ctx = await browser.newContext(opts.small ? { viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' } : { ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  if (opts.km) await page.addInitScript(() => localStorage.setItem('gp-lang', 'km'));
  await page.goto(BASE + '/teams.html' + (opts.qs || ''), { waitUntil: 'load' });
  await page.waitForTimeout(900);
  return { ctx, page };
}
const credCalls = () => CALLS.filter(c => c.args.some(a => a === '1234' || a === 'dara'));

{
  const { ctx, page } = await open();
  ok('the log-in screen offers "Look around without an account"', !!(await page.$('#lookAround')) && /Look around without an account/.test(await page.$eval('#lookAround', e => e.innerText)));
  await page.click('#lookAround'); await page.waitForTimeout(900);
  ok('it opens the app as a guest: the tour, the Library and the Base cards', await page.evaluate(() => S.guest === true) && !!(await page.$('.guestHero')) && !!(await page.$('#guestLibrary')) && !!(await page.$('#guestBase')));
  ok('every tool is listed with what it does, and a lock', (await page.$$('.guestTool')).length >= 8 && (await page.$$('.guestTool .guestLock')).length === (await page.$$('.guestTool')).length);
  ok('the bottom bar has four tabs, the first "Look around"; no bell', (await page.$$('nav.bottom button')).length === 4 && /Look around/.test(await page.$eval('nav.bottom button', e => e.innerText)) && !(await page.$('#bellBtn')));
  await page.screenshot({ path: OUT + '/guest-home.png', fullPage: true });

  await page.click('#guestLibrary'); await page.waitForTimeout(1000);
  ok('the Library opens, all of it', await page.evaluate(() => S.view === 'library' && typeof GP_LIBRARY !== 'undefined') && (await page.$$('.libTile')).length > 40);
  await page.click('.libRow [data-libbook="atomic-habits"]'); await page.waitForTimeout(400);
  await page.click('#libStart'); await page.waitForTimeout(300); await page.click('#libNext'); await page.waitForTimeout(300);
  ok('a guest can read a whole book in the reader', /Key idea 1 of/i.test(await page.$eval('#libReader', e => e.innerText)));
  await page.click('#libClose'); await page.waitForTimeout(300);
  await page.click('#libMarkRead'); await page.waitForTimeout(500);
  ok('… and mark it read — kept on this phone only', await page.evaluate(() => !!JSON.parse(localStorage.getItem('gp-lib-read'))['atomic-habits']) && !CALLS.some(c => c.fn === 'libSaveReads'));

  await page.click('nav.bottom button[data-tab="base"]'); await page.waitForTimeout(900);
  ok('Base shows the public figures', await page.evaluate(() => S.view === 'base' && !!S.base) && !!(await page.$('.hero')));
  ok('… counting the staff, with no names or photos on the phone', /\b3\b/.test(await page.$eval('.hero', e => e.innerText)) && await page.evaluate(() => S.roster.length === 3 && S.roster.every(p => !p.name && !p.photo)));
  await page.click('[data-guestcampus="poipet"]'); await page.waitForTimeout(300);
  ok('… and a guest can switch to Poipet', /POIPET/i.test(await page.$eval('.hero', e => e.innerText)));
  await page.click('[data-guestcampus="siemreap"]'); await page.waitForTimeout(300);
  const heads = await page.$$('[data-acc]');
  for (const hd of heads) { await hd.click().catch(() => {}); await page.waitForTimeout(250); }
  ok('… and every Base section opens without an error', errors.length === 0, heads.length + ' sections');
  await page.screenshot({ path: OUT + '/guest-base.png' });
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(300);
  ok('Team is locked, with the reason and a way in', /names, photos and goals/.test(await page.$eval('#main', e => e.innerText)) && (await page.$$('[data-guestgo]')).length === 2);
  await page.click('nav.bottom button[data-tab="health"]'); await page.waitForTimeout(300);
  ok('Health is locked too — check-ins are private', /only you and your mentor/.test(await page.$eval('#main', e => e.innerText)));
  await page.screenshot({ path: OUT + '/guest-lock.png' });
  await page.click('#menuBtn'); await page.waitForTimeout(250);
  ok('the menu: Library, Create my profile, Log in — nothing else', (await page.$$eval('[data-menu-item]', bs => bs.map(b => b.getAttribute('data-menu-item')))).join() === 'library,guestreg,guestlogin');
  await page.click('[data-menu-item="library"]'); await page.waitForTimeout(500);
  ok('… and the Library is in it', await page.evaluate(() => S.view === 'library'));
  ok('a guest never sends a username or PIN, and never boots — only the public calls', CALLS.every(c => ['getData', 'teamRoster'].indexOf(c.fn) > -1) && credCalls().length === 0 && !CALLS.some(c => c.fn === 'getMyBoot'), [...new Set(CALLS.map(c => c.fn))].join(','));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
  ok('opening the app again stays a guest', await page.evaluate(() => S.guest === true) && !!(await page.$('.guestHero')));
  await page.click('.guestHero [data-guestgo="login"]'); await page.waitForTimeout(400);
  ok('"Log in" goes to the log-in screen and ends the guest visit', !!(await page.$('#li_user')) && await page.evaluate(() => !S.guest && !localStorage.getItem('gp-app-guest')));
  CALLS.length = 0;
  await page.fill('#li_user', 'dara'); await page.fill('#li_pin', '1234'); await page.click('#loginBtn'); await page.waitForTimeout(2000);
  ok('logging in works as before', await page.evaluate(() => !!S.me && !S.guest && S.me.id === 'st1'));
  ok('… and the books read as a guest go up to the account', !!(mem.staff.find(s => s.id === 'st1').libRead || {})['atomic-habits']);
  await ctx.close();
}
{
  const { ctx, page } = await open({ qs: '?guest=1' });
  ok('teams.html?guest=1 opens straight into looking around', await page.evaluate(() => S.guest === true));
  await page.click('.guestHero [data-guestgo="reg"]'); await page.waitForTimeout(500);
  ok('"Create my profile" opens the sign-up form', await page.evaluate(() => S.regMode === true && !S.guest) && /Create my profile/.test(await page.$eval('#main', e => e.innerText)));
  await ctx.close();
}
{
  const { ctx, page } = await open({ small: true, km: true });
  await page.click('#lookAround'); await page.waitForTimeout(900);
  ok('in Khmer at 320px the tour is Khmer and fits', /[ក-៿]{4}/.test(await page.$eval('.guestHero h2', e => e.innerText)) && await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
