/* The Khmer review page: only a reviewer (or an admin) has it in the menu; it
   shows how far along the review is and one waiting line at a time, its English
   and the Khmer the app shows now; Correct saves it with the reviewer's name and
   moves on, without changing what the app shows; Skip moves on; search finds a
   line; a fix that drops a {placeholder} is stopped; Undo; Khmer at 320px; an
   admin ticks "Khmer reviewer" on a person and downloads the reviews as the file
   scripts/km-apply-reviews.mjs reads. On the real backend. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('km-review-ui');
const OUT = tmpDir('km-review-ui-out');
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
  mk({ id: 'ad', name: 'Uriah Admin', username: 'uriah', email: 'u@e.com', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true }),
  mk({ id: 'sl', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com', kmReviewer: true }),
  mk({ id: 'dr', name: 'Dara Pen', username: 'dara', email: 'd@e.com' })
];
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




const menuItems = async page => { await page.click('#menuBtn'); await page.waitForTimeout(250);
  const ids = await page.$$eval('[data-menu-item]', bs => bs.map(b => b.getAttribute('data-menu-item'))); return ids; };
const openReview = async page => { await page.click('[data-menu-item="kmreview"]'); await page.waitForTimeout(900); };
const cardKey = page => page.$eval('#kmrCard', e => e.getAttribute('data-kmrkey')).catch(() => null);
const pendingKeys = page => page.evaluate(() => Object.keys(PENDING_KM).filter(k => !(k in REVIEWED_KM)));

/* ---------- 1. who sees it ---------- */
{
  const { ctx, page } = await open('dara');
  ok('someone who is not a reviewer has no Khmer review in the menu', !(await menuItems(page)).includes('kmreview'));
  await ctx.close();
}

/* ---------- 2. a reviewer goes through lines ---------- */
{
  const { ctx, page } = await open('sreilea');
  ok('a reviewer has Khmer review in the menu', (await menuItems(page)).includes('kmreview'));
  await openReview(page);
  const all = await pendingKeys(page);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('it says how far along the review is', new RegExp('0 of ' + all.length.toLocaleString('en-US') + ' lines reviewed').test(txt), txt.split('\n').find(l => /lines reviewed/.test(l)));
  const k1 = await cardKey(page);
  ok('the first waiting line: its English and the Khmer the app shows now', k1 === all[0] &&
    (await page.$eval('.kmrEn', e => e.textContent)) === k1 && (await page.$eval('.kmrKm', e => e.textContent)) === (await page.evaluate(k => PENDING_KM[k], k1)));
  await page.screenshot({ path: OUT + '/kmr-line.png' });
  await page.click('#kmrOk'); await page.waitForTimeout(600);
  ok('Correct saves it as it is, with her name', (mem.kmReviews || []).some(r => r.key === k1 && r.verdict === 'ok' && r.byName === 'Sreilea Chan'));
  const k2 = await cardKey(page);
  ok('… and moves on to the next line', k2 && k2 !== k1);
  ok('… and the count goes up', /1 of [\d,]+ lines reviewed/.test(await page.$eval('#main', e => e.innerText)));
  ok('the app’s Khmer is unchanged — reviews wait to be added', await page.evaluate(k => !(k in REVIEWED_KM), k1));

  await page.click('#kmrSkip'); await page.waitForTimeout(200);
  const k3 = await cardKey(page);
  ok('Skip moves on without saving', k3 !== k2 && !(mem.kmReviews || []).some(r => r.key === k2));

  // a line with a placeholder, found by search
  const ph = all.find(k => /^\{n\} waiting$/.test(k)) || all.find(k => /\{[a-z]+\}/.test(k));
  await page.fill('#kmrSearch', ph); await page.waitForTimeout(300);
  ok('search finds a line by its English', (await cardKey(page)) === ph, ph);
  await page.click('#kmrFixBtn'); await page.waitForTimeout(200);
  ok('Fix it opens the Khmer to edit, and lists what must stay', !!(await page.$('#kmrFixText')) && /Keep these exactly as they are: \{/.test(await page.$eval('#kmrCard', e => e.innerText)));
  await page.fill('#kmrFixText', 'ខ្មែរ ដោយគ្មានលេខ');
  await page.click('#kmrSaveFix'); await page.waitForTimeout(300);
  ok('a fix that drops a placeholder is stopped on the page', !(mem.kmReviews || []).some(r => r.key === ph) && /Keep these exactly/.test(await page.$eval('#kmrCard', e => e.innerText)));
  const fixed = (await page.evaluate(k => PENDING_KM[k], ph)).replace(/^/, 'ពិនិត្យ ');
  await page.fill('#kmrFixText', fixed);
  await page.screenshot({ path: OUT + '/kmr-fix.png' });
  await page.click('#kmrSaveFix'); await page.waitForTimeout(600);
  ok('a good fix saves in her words', (mem.kmReviews || []).some(r => r.key === ph && r.verdict === 'fixed' && r.km === fixed));
  await page.fill('#kmrSearch', ''); await page.waitForTimeout(200);

  ok('recent reviews are listed with Undo', (await page.$$('[data-kmrundo]')).length === 2);
  await page.click('[data-kmrundo="' + k1.replace(/"/g, '\\"') + '"]'); await page.waitForTimeout(600);
  ok('Undo takes a review back, and the line is waiting again', !(mem.kmReviews || []).some(r => r.key === k1) && (await cardKey(page)) === k1);
  ok('a reviewer has no download', !(await page.$('#kmrDownload')));
  const sw = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  ok('nothing scrolls sideways', sw);
  await ctx.close();
}

/* ---------- 3. in Khmer, at 320px ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })); localStorage.setItem('gp-lang', 'km'); });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('#menuBtn'); await page.waitForTimeout(250);
  await openReview(page);
  const t = await page.$eval('#main h2', e => e.textContent);
  ok('the page is in Khmer when the app is', /ពិនិត្យភាសាខ្មែរ/.test(t), t);
  ok('… and fits a 320px phone', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await page.screenshot({ path: OUT + '/kmr-km-320.png' });
  await ctx.close();
}

/* ---------- 4. the admin: the checkbox, and the download ---------- */
{
  const { ctx, page } = await open('uriah');
  await page.evaluate(() => { S.view = 'admin'; S.adminSub = 'person'; S.adminPersonId = 'dr'; render(); });
  await page.waitForTimeout(1200);
  await page.click('[data-adminedit="dr"]'); await page.waitForTimeout(300);
  ok('Admin → a person has a Khmer reviewer checkbox', !!(await page.$('#adm_kmreviewer')));
  await page.check('#adm_kmreviewer');
  await page.click('[data-adminsave="dr"]'); await page.waitForTimeout(800);
  ok('ticking it makes them a reviewer', mem.staff.find(x => x.id === 'dr').kmReviewer === true);
  await page.click('#menuBtn'); await page.waitForTimeout(250);
  await openReview(page);
  ok('an admin can download the reviews', !!(await page.$('#kmrDownload')));
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#kmrDownload')]);
  const f = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok('… as the file km-apply-reviews.mjs reads', f.format === 'gp-km-reviews' && Array.isArray(f.reviews) && f.reviews.length === 1 && /^km-reviews-/.test(dl.suggestedFilename()), dl.suggestedFilename());
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
