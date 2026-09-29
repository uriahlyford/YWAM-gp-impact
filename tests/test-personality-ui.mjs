/* The personality screens, driven for real: the real page against the real
   api.js, taking the test the way a thumb would.

   Checks the parts that would be easy to break and hard to notice: a half-done
   test surviving a reload, Next staying shut until a page is answered, the
   seven circles fitting a 320px phone, a picked type showing no bars it never
   had, a teammate's page leaving out their season, the directory swapping
   initials for a character only for people who share — and Khmer reaching the
   questions without overflowing them. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('personality-ui');
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
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', sex: 'female',
    personality: { type: 'ESFJ', scores: { E: 71, S: 66, T: 30, J: 62 }, source: 'test', share: true, season: 'stretched' } }),
  mk({ id: 'st3', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com', sex: 'male',
    personality: { type: 'INTJ', scores: { E: 20, S: 35, T: 80, J: 77 }, source: 'test', share: false } }),
  mk({ id: 'st4', name: 'Dara Pen', username: 'dara', email: 'd@e.com', sex: 'male', photo: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    personality: { type: 'ISTP', scores: null, source: 'self', share: true } })
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
  const ctx = await browser.newContext({ ...devices['iPhone 13'], ...(opts.viewport ? { viewport: opts.viewport } : {}) });
  const page = await ctx.newPage();
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
const qs = await (async () => {
  const src = fs.readFileSync(PUBLIC + '/personality.js', 'utf8');
  return new Function(src + ';return GP_PQUESTIONS;')();
})();
/* how an ENFJ would answer, with a little variety in strength */
const val = (q, i) => ('ENFJ'.indexOf(q.key) > -1 ? 1 : -1) * [3, 2, 1, 2, 3][i % 5];

/* ---------- 1. taking the test ---------- */
{
  const { ctx, page } = await open('sreilea');
  ok('My Home offers the test to someone without a type', !!(await page.$('#pStart')));
  await page.click('#pStart'); await page.waitForTimeout(250);
  ok('the test will not start until a character is chosen', await page.$eval('#pBegin', b => b.disabled));
  await page.click('[data-psex="male"]'); await page.waitForTimeout(150);
  await page.click('#pBegin'); await page.waitForTimeout(250);
  ok('Next stays shut until the page is answered', await page.$eval('#pNext', b => b.disabled));

  /* answer the first twelve, then reload: the draft has to survive */
  for (let i = 0; i < 12; i++) {
    if (i === 5 || i === 10) { await page.click('#pNext'); await page.waitForTimeout(150); }
    await page.click('[data-pans="' + qs[i].id + '|' + val(qs[i], i) + '"]'); await page.waitForTimeout(40);
  }
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button');
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(300);
  await page.click('#pStart'); await page.waitForTimeout(200);
  const resume = await page.$eval('#pBegin', b => b.textContent);
  ok('a half-finished test is still there after a reload', /12/.test(resume), resume);
  await page.click('[data-psex="male"]'); await page.waitForTimeout(100);
  await page.click('#pBegin'); await page.waitForTimeout(250);
  const onQ = await page.$eval('.pStmt', e => e.id);
  ok('and carries on from the first unanswered page', onQ === 'pq_' + qs[10].id, onQ);

  for (let i = 12; i < qs.length; i++) {
    if (i % 5 === 0) { await page.click('#pNext'); await page.waitForTimeout(120); }
    await page.click('[data-pans="' + qs[i].id + '|' + val(qs[i], i) + '"]'); await page.waitForTimeout(30);
  }
  await page.click('#pFinish'); await page.waitForTimeout(700);
  const hero = await page.$eval('.pHero', e => e.innerText);
  ok('the result names the type', /ENFJ/.test(hero) && /The Encourager/.test(hero), hero.replace(/\s+/g, ' ').slice(0, 80));
  const bars = await page.$$eval('.pBar', b => b.length);
  ok('with four bars', bars === 4, String(bars));
  ok('and "for you, right now" tips for my own ministry', /Cafe/.test(await page.$eval('#main', e => e.innerText)) && (await page.$$('[data-pseason]')).length === 6);
  ok('the stored type matches the screen', mem.staff[0].personality.type === 'ENFJ' && mem.staff[0].sex === 'male');
  let draft = await page.evaluate(() => localStorage.getItem('gp-ptest'));
  ok('the draft is cleared once the result is saved', draft === null, String(draft));

  /* the season switch changes the tips */
  const before = await page.$$eval('.pList', l => l[2] ? l[2].innerText : '');
  await page.click('[data-pseason="outreach"]'); await page.waitForTimeout(500);
  const after = await page.$$eval('.pList', l => l[2] ? l[2].innerText : '');
  ok('choosing a season changes the advice', before !== after && /outreach/i.test(after), after.slice(0, 60));
  ok('and is saved', mem.staff[0].personality.season === 'outreach');
  await ctx.close();
}

/* ---------- 2. picking a type you already know ---------- */
{
  const { ctx, page } = await open('sreilea');
  await page.click('#pSeeMine'); await page.waitForTimeout(250);
  await page.click('#pChoose'); await page.waitForTimeout(250);
  ok('the picker shows all sixteen', (await page.$$('[data-ppick]')).length === 16);
  await page.click('[data-ppick="INFP"]'); await page.waitForTimeout(600);
  ok('a picked type has no bars it never measured', (await page.$$('.pBar')).length === 0);
  ok('and is stored as picked', mem.staff[0].personality.type === 'INFP' && mem.staff[0].personality.source === 'self');
  await ctx.close();
}

/* ---------- 3. a teammate ---------- */
{
  const { ctx, page } = await open('sreilea');
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(500);
  const cards = await page.evaluate(() => {
    const o = {};
    document.querySelectorAll('.dircard[data-person]').forEach(c => {
      o[c.getAttribute('data-person')] = { svg: !!c.querySelector('.avatar svg'), img: !!c.querySelector('img.avatar'),
        chip: (c.querySelector('.ptChip') || {}).textContent || '' };
    });
    return o;
  });
  ok('a sharer with no photo shows their character', cards.st2 && cards.st2.svg && cards.st2.chip === 'ESFJ', JSON.stringify(cards.st2));
  ok('someone who does not share keeps their initials, and no chip', cards.st3 && !cards.st3.svg && !cards.st3.chip, JSON.stringify(cards.st3));
  ok('a photo always wins over the drawing', cards.st4 && cards.st4.img && !cards.st4.svg && cards.st4.chip === 'ISTP', JSON.stringify(cards.st4));

  await page.click('[data-person="st2"]'); await page.waitForTimeout(700);
  await page.click('#pSeePerson'); await page.waitForTimeout(350);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('a teammate\'s type page is about them', /Mealea’s type/.test(txt) && /Working with Mealea/.test(txt));
  ok('and leaves out their season entirely', !(await page.$('[data-pseason]')) && !/stretched|For you, right now/i.test(txt));
  ok('with no controls over someone else\'s type', !(await page.$('#pRetake')) && !(await page.$('#pShareOff')));
  await page.click('#ptypeBack'); await page.waitForTimeout(300);
  ok('Back returns to their profile', !!(await page.$('#pSeePerson')));
  await page.click('[data-person="st3"]').catch(() => {});
  await ctx.close();
}

/* ---------- 4. a 320px phone ---------- */
{
  const { ctx, page } = await open('mealea', { viewport: { width: 320, height: 640 } });
  await page.click('#pSeeMine'); await page.waitForTimeout(200);
  await page.click('#pRetake'); await page.waitForTimeout(200);
  await page.click('[data-psex="female"]'); await page.waitForTimeout(100);
  await page.click('#pBegin'); await page.waitForTimeout(250);
  const fit = await page.evaluate(() => {
    const s = document.querySelector('.pScale').getBoundingClientRect();
    return { right: Math.round(s.right), vw: innerWidth, sideways: document.documentElement.scrollWidth > innerWidth };
  });
  ok('seven circles fit a 320px phone without sideways scroll', fit.right <= fit.vw && !fit.sideways, JSON.stringify(fit));
  await ctx.close();
}

/* ---------- 5. in Khmer ---------- */
{
  const { ctx, page } = await open('vuthy', { km: true });
  await page.click('#pSeeMine'); await page.waitForTimeout(250);
  const hero = await page.$eval('.pHero', e => e.innerText);
  ok('a type\'s name reaches the screen in Khmer', /អ្នកយុទ្ធសាស្ត្រ/.test(hero), hero.replace(/\s+/g, ' ').slice(0, 60));
  await page.click('#pRetake'); await page.waitForTimeout(200);
  await page.click('[data-psex="male"]'); await page.waitForTimeout(100);
  await page.click('#pBegin'); await page.waitForTimeout(300);
  const q = await page.$eval('.pText', e => e.textContent);
  ok('and so do the questions', /[ក-៿]/.test(q) && !/[A-Za-z]{4}/.test(q), q);
  const over = await page.evaluate(() => [].some.call(document.querySelectorAll('.pText, .pScaleEnds span'),
    e => e.scrollWidth > e.clientWidth + 1) || document.documentElement.scrollWidth > innerWidth);
  ok('with nothing overflowing', !over);
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
