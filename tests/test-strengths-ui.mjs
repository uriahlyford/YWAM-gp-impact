/* The CliftonStrengths screens, driven for real on the real backend: adding a
   Top 5 in order with a note, the tenth-theme limit, a teammate's Gallup
   results on their profile beside their GP Strengths, each theme showing the
   GP strength it lines up with, both results compared on my GP results page, the Gallup credit, three
   Team-tab buttons fitting 320px, and theme names staying in English when the
   app is in Khmer. (The free GP Strengths test and the team map, which adds up
   GP Strengths, are in test-gpstrengths-ui.mjs.) */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('strengths-ui');
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
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com',
    strengths: { top: ['Empathy', 'Harmony', 'Includer', 'Responsibility', 'Positivity'], notes: { Empathy: 'I notice a hard day.' }, share: true },
    gstrengths: { answers: {}, scores: {}, top: ['comforter', 'peacemaker', 'welcomer', 'dependable', 'mentor'], share: true } }),
  /* ten recorded — only the first five may count on the map */
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com',
    strengths: { top: ['Achiever', 'Discipline', 'Restorative', 'Focus', 'Responsibility', 'Woo', 'Command', 'Belief', 'Arranger', 'Input'], notes: {}, share: true } }),
  mk({ id: 'st4', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com',
    strengths: { top: ['Analytical', 'Learner', 'Intellection', 'Context', 'Deliberative'], notes: {}, share: false } })
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

/* ---------- 1. adding a Top 5 ---------- */
{
  const { ctx, page } = await open('sreilea');
  ok('My Home offers the free test, and a way to add Gallup results', !!(await page.$('#gsStart')) &&
    /Have CliftonStrengths results from Gallup/.test(await page.$eval('#sEdit', e => e.innerText)));
  await page.click('#sEdit'); await page.waitForTimeout(250);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('the editor credits Gallup and links to the real assessment',
    /trademarks of Gallup/.test(txt) && !!(await page.$('a[href^="https://www.gallup.com/cliftonstrengths"]')));
  ok('Save is shut until a theme is added', await page.$eval('#sSave', b => b.disabled));
  for (const th of ['Developer', 'Learner', 'Achiever', 'Empathy', 'Futuristic']) { await page.click('[data-spick="' + th + '"]'); await page.waitForTimeout(40); }
  await page.click('[data-sup="1"]'); await page.waitForTimeout(80);
  await page.fill('[data-snote="Developer"]', 'I love watching new staff grow.');
  await page.click('[data-spick="Futuristic"]'); await page.waitForTimeout(80);     // tap again: out
  await page.click('[data-spick="Futuristic"]'); await page.waitForTimeout(80);     // and back in
  ok('a note survives the list re-drawing around it',
    (await page.$eval('[data-snote="Developer"]', e => e.value)) === 'I love watching new staff grow.');
  await page.click('#sSave'); await page.waitForTimeout(700);
  ok('the Top 5 is stored in the order chosen',
    JSON.stringify(mem.staff[0].strengths.top) === '["Learner","Developer","Achiever","Empathy","Futuristic"]', JSON.stringify(mem.staff[0].strengths.top));
  ok('with the note', mem.staff[0].strengths.notes.Developer === 'I love watching new staff grow.');
  const chips = await page.$$eval('#sEdit .sChip', c => c.map(x => x.innerText.replace(/\s+/g, ' ')));
  ok('My Home shows them, numbered', chips[0] === '1 Learner' && chips.length === 5, JSON.stringify(chips));

  /* the limit */
  await page.click('#sEdit'); await page.waitForTimeout(250);
  for (const th of ['Arranger', 'Belief', 'Consistency', 'Deliberative', 'Discipline']) { await page.click('[data-spick="' + th + '"]'); await page.waitForTimeout(30); }
  ok('an eleventh theme cannot be added', await page.$eval('[data-spick="Woo"]', b => b.disabled));
  await page.click('#sBack'); await page.waitForTimeout(200);
  ok('leaving without saving keeps the saved five', mem.staff[0].strengths.top.length === 5);
  await ctx.close();
}

/* ---------- 2. on a teammate's profile ---------- */
{
  const { ctx, page } = await open('sreilea');
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(400);
  await page.click('[data-teammode="str"]'); await page.waitForTimeout(400);
  await page.click('.sWhoBtn[data-person="st2"]'); await page.waitForTimeout(800);
  const prof = await page.$eval('#main', e => e.innerText);
  ok('a teammate\'s profile shows their Gallup themes and own words',
    /Mealea Sok/.test(prof) && /CliftonStrengths \(from Gallup\)/.test(prof) && /1\s*Empathy/.test(prof) && /I notice a hard day/.test(prof));
  ok('under their GP Strengths', prof.indexOf('Comforter') > -1 && prof.indexOf('Comforter') < prof.indexOf('Empathy'));
  ok('each Gallup theme shows the GP strength it lines up with', /Empathy\s*≈ GP: Comforter/.test(prof) && /Harmony\s*≈ GP: Peacemaker/.test(prof), (prof.match(/Empathy[^\n]*/) || [''])[0]);
  await ctx.close();
}

/* ---------- 2b. both results side by side ---------- */
{
  const { ctx, page } = await open('mealea');
  await page.click('#gsSeeMine'); await page.waitForTimeout(300);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('my GP results compare my Gallup Top 5 with the matching GP strengths',
    /Compared with your CliftonStrengths/.test(txt) && (await page.$$('.sCmpRow')).length === 5);
  ok('with where each match ranks for me in GP Strengths', /1\s*Empathy\s*≈\s*1\s*Comforter/.test(txt),
    (txt.match(/1\s*Empathy[^\n]*/) || [''])[0]);
  await ctx.close();
}

/* ---------- 3. a 320px phone ---------- */
{
  const { ctx, page } = await open('sreilea', { viewport: { width: 320, height: 640 } });
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(400);
  const fit = await page.evaluate(() => {
    const seg = document.querySelector('.teamModeSeg').getBoundingClientRect();
    const btns = [].map.call(document.querySelectorAll('.teamModeSeg .campusBtn'), b => b.getBoundingClientRect().top);
    return { right: Math.round(seg.right), vw: innerWidth, oneRow: btns.every(t => Math.abs(t - btns[0]) < 2),
      sideways: document.documentElement.scrollWidth > innerWidth };
  });
  ok('three Team-tab buttons fit one row at 320px', fit.oneRow && fit.right <= fit.vw && !fit.sideways, JSON.stringify(fit));
  await ctx.close();
}

/* ---------- 4. in Khmer ---------- */
{
  const { ctx, page } = await open('mealea', { km: true });
  const card = await page.$eval('#sEdit', e => e.innerText);
  ok('theme names stay in English, to match the Gallup report', /Empathy/.test(card) && /Harmony/.test(card), card.replace(/\s+/g, ' '));
  await page.click('#sEdit'); await page.waitForTimeout(250);
  const h2 = await page.$eval('#main h2', e => e.textContent);
  ok('while the app\'s own words are in Khmer', /[ក-៿]/.test(h2), h2);
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
