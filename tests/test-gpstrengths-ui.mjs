/* The free GP Strengths test, driven for real on the real backend: taking it
   a page of five pairs at a time, leaving half way and carrying on, the Top 5
   the server stores matching the answers, the results page (top 10 by group and all 34 for the
   owner, only the five for a teammate), sharing, the team map adding up GP
   Top 5s for people who share on this campus, a pair fitting a 320px phone,
   and the card following the language. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('gpstrengths-ui');
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
    gstrengths: { answers: {}, scores: {}, top: ['comforter', 'peacemaker', 'welcomer', 'dependable', 'mentor'], share: true } }),
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com',
    gstrengths: { answers: {}, scores: {}, top: ['hardworker', 'dependable', 'coordinator', 'solver', 'orderly'], share: true } }),
  mk({ id: 'st4', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com',
    gstrengths: { answers: {}, scores: {}, top: ['factfinder', 'curious', 'pathfinder', 'orderly', 'improver'], share: false } }),
  mk({ id: 'st5', name: 'Bopha Keo', username: 'bopha', email: 'b@e.com', campus: 'poipet',
    gstrengths: { answers: {}, scores: {}, top: ['voice', 'starter', 'pacesetter', 'takecharge', 'visionary'], share: true } })
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

const G = new Function(fs.readFileSync(PUBLIC + '/gpstrengths.js', 'utf8') + ';return {GP_GSPAIRS, gpGSScore};')();
/* choose, pair by pair, the side that is one of `likes` */
const LIKES = ['visionary', 'deepthinker', 'inventor', 'curious', 'starter'];
const pick = i => { const p = G.GP_GSPAIRS[i]; const L = LIKES.includes(p[0]), R = LIKES.includes(p[2]); return L && !R ? -2 : (R && !L ? 2 : 0); };

/* ---------- 1. taking the test ---------- */
{
  const { ctx, page } = await open('sreilea');
  ok('My Home offers the free test', /Find your top 5 strengths/.test(await page.$eval('#gsStart', e => e.innerText)));
  await page.click('#gsStart'); await page.waitForTimeout(250);
  let txt = await page.$eval('#main', e => e.innerText);
  ok('the start screen says it is GP\'s own', /GP’s own free questionnaire/.test(txt));
  ok('and the app never mentions CliftonStrengths or Gallup', !/Clifton|Gallup/i.test(txt) &&
    !/Clifton|Gallup/i.test(await page.evaluate(() => document.body.innerText)));
  await page.click('#gsBegin'); await page.waitForTimeout(250);
  ok('five pairs to a screen', (await page.$$('.gsPair')).length === 5);
  ok('each pair shows both statements', (await page.$$eval('.gsPair', p => [].map.call(p[0].querySelectorAll('.gsOpt'), x => x.innerText.length > 10))).join() === 'true,true');
  ok('Next is shut until the page is answered', await page.$eval('#gsNext', b => b.disabled));
  for (let i = 0; i < 12; i++) {
    if (i && i % 5 === 0) { await page.click('#gsNext'); await page.waitForTimeout(150); }
    await page.click('[data-gsans="' + i + '|' + pick(i) + '"]'); await page.waitForTimeout(30);
  }
  const lean = await page.$eval('[data-gsans="11|' + pick(11) + '"]', b => b.getAttribute('aria-checked'));
  ok('an answer shows as chosen', lean === 'true');

  /* coming back later: the draft is still there */
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(400);
  const p2 = page;
  await p2.click('#gsStart'); await p2.waitForTimeout(250);
  ok('coming back offers to carry on', /12 of 102 answered/.test(await p2.$eval('#gsBegin', e => e.innerText)));
  await p2.click('#gsBegin'); await p2.waitForTimeout(250);
  ok('and opens the first page with a gap in it', !!(await p2.$('[data-gsans="12|0"]')));
  for (let i = 12; i < G.GP_GSPAIRS.length; i++) {
    if (i % 5 === 0 && i !== 12 && i !== 10) { await p2.click('#gsNext'); await p2.waitForTimeout(150); }
    await p2.click('[data-gsans="' + i + '|' + pick(i) + '"]'); await p2.waitForTimeout(30);
  }
  ok('See my strengths opens once every pair is answered', !(await p2.$eval('#gsFinish', b => b.disabled)));
  await p2.click('#gsFinish'); await p2.waitForTimeout(800);
  const want = G.gpGSScore(Object.fromEntries(G.GP_GSPAIRS.map((p, i) => ['p' + i, pick(i)]))).top;
  ok('the Top 5 stored is what the answers make', JSON.stringify(mem.staff[0].gstrengths.top) === JSON.stringify(want),
    JSON.stringify(mem.staff[0].gstrengths.top));
  txt = await p2.$eval('#main', e => e.innerText);
  ok('the results lead with the Top 5', /Your top 5 strengths/.test(txt) && (await p2.$$('.gsCard')).length === 5);
  ok('each with what to watch for, and how the team can use it', (await p2.$$eval('.gsCard', c => c.every(x => /For the team:/.test(x.innerText)))));
  ok('all thirty-four are listed for the owner', (await p2.$$('.gsAllRow')).length === 34);
  ok('with where the top 10 fall across the four groups', /Your top 10, by group/.test(txt) &&
    (await p2.$$eval('.pBarTop b', b => b.reduce((a, x) => a + parseInt(x.innerText, 10), 0))) === 10);
  ok('and the list starts with the saved Top 5, in order',
    JSON.stringify((await p2.$$eval('.gsAllRow .sChip', c => c.slice(0, 5).map(x => x.innerText.trim())))) ===
    JSON.stringify(want.map(id => ({ visionary: 'Visionary', deepthinker: 'Deep Thinker', inventor: 'Inventor', curious: 'Curious', starter: 'Starter' })[id])));
  ok('the draft is cleared once saved', await p2.evaluate(() => !localStorage.getItem('gp_gstr_draft')));
  await p2.click('#gsShareOff'); await p2.waitForTimeout(600);
  ok('sharing can be turned off', mem.staff[0].gstrengths.share === false);
  await p2.click('#gsShareOn'); await p2.waitForTimeout(600);
  await p2.click('#gstrBack'); await p2.waitForTimeout(250);
  const chips = await p2.$$eval('#gsSeeMine .sChip', c => c.map(x => x.innerText.replace(/\s+/g, ' ')));
  ok('My Home shows the five, numbered', chips.length === 5 && /^1 /.test(chips[0]), JSON.stringify(chips));
  await ctx.close();
}

/* ---------- 2. the team map ---------- */
{
  const { ctx, page } = await open('sreilea');
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(400);
  await page.click('[data-teammode="str"]'); await page.waitForTimeout(400);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('the map counts the three here who share (me, Mealea, Dara)', /3 people have shared their Top 5/.test(txt), (txt.match(/\d+ people[^\n]*/) || [''])[0]);
  const row = name => page.evaluate(t => {
    const r = [].find.call(document.querySelectorAll('.sMapRow'), x => x.querySelector('.sChip').innerText.trim() === t);
    return r ? [].map.call(r.querySelectorAll('.sWhoBtn'), b => b.innerText) : null;
  }, name);
  ok('a strength two people share lists both', JSON.stringify(await row('Dependable')) === '["Mealea","Dara"]', JSON.stringify(await row('Dependable')));
  ok('someone not sharing is nowhere on it', (await row('Fact-Finder')) === null && !/Vuthy/.test(txt));
  ok('another campus is not on it', !/Bopha/.test(txt));
  ok('four groups, adding up to about 100%', (await page.$$('.pBarTop')).length === 4 &&
    Math.abs((await page.$$eval('.pBarTop b', b => b.reduce((a, x) => a + parseInt(x.innerText, 10), 0))) - 100) <= 2);
  await page.click('.sWhoBtn[data-person="st2"]'); await page.waitForTimeout(800);
  ok('a name opens that person, with their strengths', /Mealea Sok/.test(await page.$eval('#main', e => e.innerText)) && !!(await page.$('#gsSeePerson')));
  await page.click('#gsSeePerson'); await page.waitForTimeout(300);
  const other = await page.$eval('#main', e => e.innerText);
  ok('their strengths page shows their five, and how to work with them',
    /Mealea’s top 5 strengths/.test(other) && (await page.$$('.gsCard')).length === 5 && /Working together:/.test(other));
  ok('but not the full ranked list, or share buttons — those are theirs', (await page.$$('.gsAllRow')).length === 0 && !(await page.$('#gsShareOn')));
  await page.click('#gstrBack'); await page.waitForTimeout(400);
  ok('Back returns to their profile', /Mealea Sok/.test(await page.$eval('#main', e => e.innerText)));
  await ctx.close();
}

/* ---------- 3. a 320px phone ---------- */
{
  const { ctx, page } = await open('dara', { viewport: { width: 320, height: 640 } });
  await page.click('#gsSeeMine'); await page.waitForTimeout(250);
  await page.click('#gsRetake'); await page.waitForTimeout(200);
  await page.click('#gsBegin'); await page.waitForTimeout(250);
  const fit = await page.evaluate(() => {
    const s = document.querySelector('.gsScale').getBoundingClientRect();
    const o = [].map.call(document.querySelector('.gsPair').querySelectorAll('.gsOpt'), x => x.getBoundingClientRect());
    return { sideways: document.documentElement.scrollWidth > innerWidth, scale: s.right <= innerWidth, side: o.length === 2 && Math.abs(o[0].top - o[1].top) < 2 };
  });
  ok('a pair fits a 320px phone, both statements side by side', !fit.sideways && fit.scale && fit.side, JSON.stringify(fit));
  await ctx.close();
}

/* ---------- 4. in Khmer ---------- */
{
  const { ctx, page } = await open('mealea', { km: true });
  const h = await page.$eval('#sec-strengths', e => e.textContent);
  ok('the card heading follows the language', /[ក-៿]/.test(h), h);
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
