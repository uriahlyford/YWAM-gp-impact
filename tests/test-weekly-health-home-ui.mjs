/* My Home's health, the weekly check-in only: this week's score when answered,
   last week's with a button to answer this week until then, nothing from a week
   only rolled up from days; the same score up top; no "This week" totals, no
   days-logged count, no daily check-in; the Habit Tracker stays and a tap scores
   nothing. On the real backend. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('home-health-ui');
const OUT = tmpDir('home-health-ui-out');
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
  mk({ id: 'a1', name: 'Answered Now', username: 'anow', email: 'a@e.com' }),
  mk({ id: 'a2', name: 'Last Week Only', username: 'alast', email: 'b@e.com' }),
  mk({ id: 'a3', name: 'Daily Only', username: 'adaily', email: 'c@e.com' })
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




const NOW = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10), YR = Number(NOW.slice(0, 4));
const isoWeek = ds => { const d = new Date(ds + 'T00:00:00'), y = d.getFullYear(), j = new Date(y, 0, 1),
  m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7)); return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); };
const WK = isoWeek(NOW);
const ans = (tok, wk, o) => Object.assign({ campus: 'siemreap', week: wk, year: YR, device: tok, source: 'weekly', days: 7, lonely: 2, clarity: 8, growth: 8,
  porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0, sharedFaith: 1, sabbath: 1, langHours: 2, minHours: 8 }, o || {});
mem.survey = [
  ans('tok_a1', WK), ans('tok_a1', WK - 1, { clarity: 6 }),
  ans('tok_a2', WK - 1),
  Object.assign(ans('tok_a3', WK), { source: '' })            // an old row the daily roll-up wrote
];
mem.dailyLogs = [{ staffId: 'a3', date: NOW, week: WK, langHours: 3, minHours: 2, workout: true, quietTime: false, bible: true, habits: { bible: true } }];
const card = page => page.$eval('#sec-health', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const hero = page => page.$eval('[data-jump="sec-health"]', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');

{
  const { ctx, page } = await open('anow');
  const c = await card(page), hv = await hero(page);
  ok('answered this week: My Home shows this week’s weekly score', new RegExp('My health · week ' + WK).test(c) && /From your weekly check-in/.test(c) && /\d\.\d/.test(c), c);
  ok('… with the same score up top', (hv.match(/\d+\.\d/) || [])[0] === (c.match(/\d+\.\d/) || [])[0], hv);
  const main = await page.$eval('#main', e => e.innerText);
  ok('no “This week” totals from daily logging', !/Language hrs|Workout days|Quiet-time days/.test(main));
  ok('no days-logged count, and no daily check-in', !/days logged|log a day|Daily check-in/i.test(main) && !(await page.$('#moreToday, #saveDayBtn')));
  ok('the Habit Tracker is still there', !!(await page.$('[data-habit]')));
  await (await page.$('#sec-health')).scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
  await page.screenshot({ path: OUT + '/home-health.png' });
  await page.click('#toHealthTab'); await page.waitForTimeout(400);
  ok('Open Health goes to the Health tab', await page.evaluate(() => S.view === 'health'));
  await ctx.close();
}
{
  const { ctx, page } = await open('alast');
  const c = await card(page);
  ok('only last week answered: its score, and a button to answer this week', new RegExp('week ' + (WK - 1)).test(c) && /Fill out this week’s check-in/.test(c), c);
  await ctx.close();
}
{
  const { ctx, page } = await open('adaily');
  const c = await card(page), hv = await hero(page);
  ok('a week only rolled up from days shows no score — it asks for the weekly check-in', !/\d\.\d/.test(c) && /Your score comes from the weekly check-in/.test(c) && /Fill out this week’s check-in/.test(c), c);
  ok('… and the top shows no score either', /My Health —\/10/.test(hv), hv);
  const before = JSON.stringify(mem.survey);
  await page.click('[data-habit="quietTime"]'); await page.waitForTimeout(1200);
  ok('tapping a habit saves the day', mem.dailyLogs.some(l => l.staffId === 'a3' && l.habits && l.habits.quietTime), JSON.stringify(mem.dailyLogs.filter(l => l.staffId === 'a3')));
  ok('… and writes no health score', JSON.stringify(mem.survey) === before);
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
