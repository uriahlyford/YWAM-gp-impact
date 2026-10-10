/* Numbers people, driven for real on the real backend: the week's numbers card
   first on My Ministry (whose job, when due, how far along, boxes open when the
   week is empty); Friday's "due today" for the main person, on My Home and in
   the bell, gone once entered; Saturday's "overdue" for whoever is responsible;
   the leader choosing the main person and backup; and the department leader's
   done / not done list in the bell and on their page, a tap away from each
   ministry. The clock is fixed to the week's Tuesday, Friday or Saturday. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('numbers-people-ui');
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
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),                                  // on the Cafe
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', leads: ['Community Service|Cafe'] }),   // leads it
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com', dept: 'Campus Leadership', ministry: 'Community Service' }),
  mk({ id: 'st4', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com', ministry: 'Ponlork School' })
];
mem.numbersPeople = {
  'siemreap|Community Service|Cafe': { main: 'st1', backup: 'st4' },
  'siemreap|Community Service|Ponlork School': { main: 'st4', backup: '' }
};
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
    localStorage.setItem('gp-cafe-view', 'numbers'); localStorage.setItem('gp-lw-tab', 'board');
    localStorage.setItem('gp-staff', JSON.stringify({ user: a.u, pin: '1234' }));
    if (a.km) localStorage.setItem('gp-lang', 'km');
  }, { u: user, km: !!opts.km });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]');
  await page.waitForTimeout(400);
  return { ctx, page };
}


/* the server's week (the base's own day), and that week's Tuesday, Friday and Saturday */
const isoWeek = ds => { const d = new Date(ds + 'T00:00:00'), y = d.getFullYear(), j = new Date(y, 0, 1),
  m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7)); return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); };
const NOW = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10), WK = isoWeek(NOW), Y = Number(NOW.slice(0, 4));
const mon = (() => { const j = new Date(Date.UTC(Y, 0, 1)); return new Date(Date.UTC(Y, 0, 1 - ((j.getUTCDay() + 6) % 7) + (WK - 1) * 7)); })();
const dayOf = n => { const d = new Date(mon); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const AT = n => new Date(dayOf(n) + 'T10:00:00+07:00');
const TUE = AT(1), FRI = AT(4), SAT = AT(5);
/* last week: the Cafe's numbers are in, Ponlork School's are not */
if (WK > 1) mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: WK - 1, year: Y, value: 10, updated: '' }];
const bellText = async page => {
  await page.click('#bellBtn'); await page.waitForTimeout(250);
  const t = await page.$eval('#notifRoot', e => e.innerText);
  await page.click('#notifCloseBtn').catch(() => {}); await page.waitForTimeout(150);
  return t;
};
const toMinistry = async page => { await page.click('#goMinistryFromMe'); await page.waitForTimeout(700); };

/* ---------- 1. the numbers come first, and say whose they are ---------- */
{
  const { ctx, page } = await open('sreilea', { at: TUE });
  await toMinistry(page);
  const order = await page.evaluate(() => {
    const all = [].slice.call(document.querySelectorAll('#mmWeekCard, .mmTile'));
    return all.length ? all[0].id : '(none)';
  });
  ok('the week\'s numbers card is the first thing under the ministry, above the charts', order === 'mmWeekCard', order);
  const head = await page.$eval('.numHead', e => e.innerText.replace(/\s+/g, ' '));
  ok('it says whose job they are', /Numbers: Sreilea Chan · Backup: Vuthy Lim/.test(head), head);
  ok('when they are due', /Due Friday/.test(head), head);
  ok('and how far along the week is', /0 of 8 entered/.test(head), head);
  ok('a week with nothing in opens its boxes straight away', !!(await page.$('#kpiDayCard')));
  ok('an ordinary member cannot change who is responsible', !(await page.$('[data-numedit]')));
  ok('Tuesday: no reminder yet', !/numbers for week/.test(await bellText(page)));
  await ctx.close();
}

/* ---------- 2. Friday: due today, and gone once entered ---------- */
{
  const { ctx, page } = await open('sreilea', { at: FRI });
  let bell = await bellText(page);
  ok('Friday: the main person is told the Cafe numbers are due today', new RegExp('Cafe numbers for week ' + WK + ' are due today').test(bell), bell.slice(0, 200));
  const home = await page.$eval('#main', e => e.innerText);
  ok('My Home itself is quiet — the bell (with its red dot) is where reminders live now', !/Cafe numbers for week \d+ are due today/.test(home) && !!(await page.$('#bellBtn .notifDot')));
  await page.click('#bellBtn'); await page.waitForTimeout(250);
  await page.click('#notifRoot [data-gonumbers="Community Service|Cafe"]'); await page.waitForTimeout(700);
  ok('"Enter them" opens the Cafe\'s boxes', !!(await page.$('[data-kpi="Cups Sold"]')));
  await page.fill('[data-kpi="Cups Sold"]', '40');
  await page.click('#saveKpiBtn'); await page.waitForTimeout(700);
  const head = await page.$eval('.numHead', e => e.innerText.replace(/\s+/g, ' '));
  ok('entered: the card says the numbers are in, and who entered them', /Numbers are in/.test(head) && /Last entered by Sreilea Chan/.test(head), head);
  bell = await bellText(page);
  ok('and the reminder is gone', !/Cafe numbers for week/.test(bell), bell.slice(0, 200));
  await ctx.close();
}

/* ---------- 3. Saturday: overdue, for the backup too ---------- */
{
  const { ctx, page } = await open('vuthy', { at: SAT });
  const bell = await bellText(page);
  ok('Saturday: Ponlork School is overdue for its main person', new RegExp('Ponlork School numbers for week ' + WK + ' are overdue').test(bell), bell.slice(0, 300));
  ok('the Cafe (already in) is not, though he is its backup', !/Cafe numbers for week/.test(bell));
  if (WK > 1) ok('last week\'s missing numbers keep reminding until they are in', new RegExp('Ponlork School numbers for week ' + (WK - 1) + ' are overdue').test(bell));
  await ctx.close();
}

/* ---------- 4. the leader chooses ---------- */
{
  const { ctx, page } = await open('mealea', { at: TUE });
  await toMinistry(page);
  await page.click('[data-numedit]'); await page.waitForTimeout(250);
  await page.selectOption('#numMain', 'st4');
  await page.selectOption('#numBackup', 'st1');
  await page.click('[data-numsave]'); await page.waitForTimeout(900);
  const rec = mem.numbersPeople['siemreap|Community Service|Cafe'];
  ok('the leader can change the numbers people', rec.main === 'st4' && rec.backup === 'st1', JSON.stringify(rec));
  ok('and the card follows', /Numbers: Vuthy Lim · Backup: Sreilea Chan/.test(await page.$eval('.numHead', e => e.innerText.replace(/\s+/g, ' '))));
  await page.click('[data-numedit]'); await page.waitForTimeout(250);
  await page.selectOption('#numMain', 'st1'); await page.selectOption('#numBackup', 'st1');
  await page.click('[data-numsave]'); await page.waitForTimeout(400);
  ok('the same person twice is refused before saving', mem.numbersPeople['siemreap|Community Service|Cafe'].main === 'st4');
  await page.click('[data-numcancel]'); await page.waitForTimeout(200);
  await ctx.close();
}

/* ---------- 5. the department leader ---------- */
{
  const { ctx, page } = await open('dara', { at: SAT });
  const bell = await bellText(page);
  ok('the department leader is told how many are in', new RegExp('Community Service week ' + WK + ': 1 of 4 ministries have their numbers in').test(bell), bell.slice(0, 300));
  ok('and which are not, with whose they are', /Not yet: .*Ponlork School \(Vuthy Lim\)/.test(bell) && !/Not yet:[^\n]*Cafe/.test(bell), bell.slice(0, 400));
  await page.click('#bellBtn'); await page.waitForTimeout(250);
  await page.click('#notifRoot [data-gonumdept="Community Service"]'); await page.waitForTimeout(700);
  const card = await page.$eval('.numDeptCard', e => e.innerText);
  ok('"See them" opens the department\'s done / not done list', /✅ Cafe/.test(card) && /⚠️ Ponlork School/.test(card) && /Vuthy Lim/.test(card), card.slice(0, 300));
  ok('Outreach Teams is listed with Community Service too — from the Teams Database, not in the weekly count', /Outreach Teams/.test(card) && /from the Teams Database/.test(card) && !/Intercession|GP Education/.test(card), card.slice(0, 400));
  await page.click('[data-numgo="Community Service|Ponlork School"]'); await page.waitForTimeout(900);
  ok('tapping a ministry opens it', /Ponlork School/.test(await page.$eval('#mmBanner', e => e.innerText)));
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
