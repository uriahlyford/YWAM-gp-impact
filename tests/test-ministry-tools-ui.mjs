/* Ministry tools on the page: Campus Leadership's "My week" and the Cafe's
   Today / Till / Rota / Week / Set up, each filling its numbers by itself. */
import vm from 'node:vm';
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('mtools-ui');
const OUT = tmpDir('mtools-ui-out');
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
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const mk = o => Object.assign({ active: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Staff', staffType: 'campus', country: 'Cambodia', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
mem.staff = [
  mk({ id: 'st1', name: 'Uriah Lyford', username: 'cd', email: 'u@e.com', dept: 'Campus Leadership', ministry: 'Campus Director' }),
  mk({ id: 'st2', name: 'Dara Sok', username: 'dara', email: 'd@e.com' }),
  mk({ id: 'st3', name: 'Vanna Chea', username: 'vanna', email: 'v@e.com', dept: 'Community Service', ministry: 'Cafe' }),
  mk({ id: 'st4', name: 'Kanha Lim', username: 'kanha', email: 'k@e.com', dept: 'Community Service', ministry: 'Cafe', leads: ['Community Service|Cafe'] })
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
  const ctx = await browser.newContext(opts.small ? { viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' } : { ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  page.on('dialog', d => d.accept());
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(a => { localStorage.setItem('gp-staff', JSON.stringify({ user: a.u, pin: '1234' })); if (a.km) localStorage.setItem('gp-lang', 'km');
    if (a.lw) localStorage.setItem('gp-lw-tab', a.lw); if (a.code) localStorage.setItem('gp-leadercode', a.code); }, { u: user, km: !!opts.km, lw: opts.lw || '', code: opts.code || '' });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => { S.view = 'ministry'; render(); window.scrollTo(0, 0); });
  await page.waitForTimeout(900);
  return { ctx, page };
}
const ent = (min, metric) => (mem.entries || []).find(r => r.ministry === min && r.metric === metric);
const txt = p => p.$eval('#main', e => e.innerText);

{
  const { ctx, page } = await open('cd');
  ok('a leader’s My Ministry opens on "My week"', !!(await page.$('[data-lwtab="week"].on')) && (await page.$$('.lwKind')).length === 8 && (await page.$$('.lwTotal')).length === 8);
  await page.click('[data-lwkind="oneonone"]'); await page.waitForTimeout(200);
  await page.selectOption('#lwWho', 'st2'); await page.fill('#lwNote', 'Cafe and family'); await page.click('#lwSave'); await page.waitForTimeout(1200);
  ok('logging a one-on-one shows it this week, with who', /One-on-one · Dara Sok/.test(await txt(page)));
  ok('… and fills One-on-Ones Held for the week', ent('Campus Director', 'One-on-Ones Held') && ent('Campus Director', 'One-on-Ones Held').value === 1);
  await page.click('[data-lwkind="gospel"]'); await page.waitForTimeout(200);
  await page.fill('#lwQty', '2.5'); await page.click('#lwSave'); await page.waitForTimeout(1200);
  ok('gospel hours count as hours', /2\.5h/.test(await page.$eval('.lwTotals', e => e.innerText)) && ent('Campus Director', 'Hours Sharing the Gospel').value === 2.5);
  await page.fill('#lwPName', 'Grace Church'); await page.fill('#lwPOrg', 'Siem Reap'); await page.click('#lwPAdd'); await page.waitForTimeout(1200);
  await page.click('[data-lwconnect]'); await page.waitForTimeout(1200);
  ok('a partner, and "Connected" logs a partner connection', /Partner connection · Grace Church/.test(await txt(page)) && ent('Campus Director', 'Partner Connections').value === 1);
  await page.click('[data-lwrate="vision|8"]'); await page.click('[data-lwrate="comms|7"]'); await page.click('[data-lwrate="partners|9"]');
  await page.click('#lwRateSave'); await page.waitForTimeout(1200);
  ok('the Director’s reflection fills the three scores', ent('Campus Director', 'Base Vision (1-10)').value === 8 && ent('Campus Director', 'Partner Relationships (1-10)').value === 9);
  await page.fill('#lwBName', 'YWAM Battambang'); await page.fill('#lwBPlace', 'Battambang'); await page.click('#lwBAdd'); await page.waitForTimeout(1200);
  ok('a base plant on the list counts as in planning', /YWAM Battambang/.test(await txt(page)) && ent('Campus Director', 'Base Plants in Planning').value === 1);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
  await page.screenshot({ path: OUT + '/lw.png', fullPage: true });
  await page.click('[data-lwdel]'); await page.waitForTimeout(1200);
  ok('× takes a record back out, and the numbers follow', ent('Campus Director', 'One-on-Ones Held').value === 0);
  await page.click('[data-lwtab="board"]'); await page.waitForTimeout(600);
  ok('the leadership board is a tab away', await page.evaluate(() => S.lwTab === 'board') && !(await page.$('.lwKinds')));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const { ctx, page } = await open('vanna');
  ok('the cafe’s My Ministry opens on the cafe tool, Today', !!(await page.$('[data-cafeview="tool"].on')) && !!(await page.$('#cafeOpenBtn')) && (await page.$$('.cafeTick')).length >= 4);
  ok('… and a barista gets no Set up tab', !(await page.$('[data-cafetab="setup"]')));
  const ticks = await page.$$('[data-cafetick^="open|"]'); await ticks[0].check(); await ticks[1].check();
  await page.screenshot({ path: OUT + '/cafe-open.png' });
  await page.click('#cafeOpenBtn'); await page.waitForTimeout(1200);
  ok('"We’re open" opens the day and counts it', /Open since/.test(await txt(page)) && ent('Cafe', 'Days Open').value === 1);
  await page.click('#cafeGoTill'); await page.waitForTimeout(400);
  const tap = async n => { await page.locator('.cafeMenu [data-cafeadd]').nth(n).click(); await page.waitForTimeout(120); };
  await tap(0); await tap(0); await tap(2); await page.waitForTimeout(200);
  ok('tapping the menu builds the order with a total', (await page.$$('.cafeOrderLines .cafeLine')).length === 2 && /\$\d/.test(await page.$eval('.cafeTotal', e => e.innerText)));
  await page.screenshot({ path: OUT + '/cafe-till.png', fullPage: true });
  await page.click('#cafeCharge'); await page.waitForTimeout(1200);
  ok('Charge sells it: cups and a customer counted', ent('Cafe', 'Cups Sold').value === 3 && ent('Cafe', 'Customers Served').value === 1 && /1 ·|· 1/.test(await page.$eval('#main', e => e.innerText).then(t => t.match(/Today’s orders[^\n]*/)[0])));
  await page.click('[data-cafecount="gospel|1"]'); await page.waitForTimeout(1000);
  await page.click('[data-cafecount="salvations|1"]'); await page.waitForTimeout(1000);
  ok('the conversation and salvation counters fill their numbers', ent('Cafe', 'Gospel Conversations').value === 1 && ent('Cafe', 'Salvations').value === 1);
  await page.fill('#cafeExpAmt', '4'); await page.fill('#cafeExpNote', 'ice'); await page.click('#cafeExpAdd'); await page.waitForTimeout(1200);
  ok('an expense goes into the week’s expenses', ent('Cafe', 'Weekly Expenses ($)').value === 4);
  await page.click('[data-cafetab="week"]'); await page.waitForTimeout(400);
  ok('Week shows the numbers the tool fills in', /Cups sold\s*3/i.test(await txt(page)) && (await page.$$('.cafeBar')).length === 7);
  await page.screenshot({ path: OUT + '/cafe-week.png', fullPage: true });
  await page.click('[data-cafetab="rota"]'); await page.waitForTimeout(400);
  await page.click('[data-cafecell="0|0"]'); await page.waitForTimeout(300);
  await page.click('[data-cafewho="st3"]'); await page.waitForTimeout(1200);
  ok('the rota: tap a shift, pick who', /Vanna/.test(await page.$eval('[data-cafecell="0|0"]', e => e.innerText)));
  await page.screenshot({ path: OUT + '/cafe-rota.png' });
  await page.click('[data-cafetab="today"]'); await page.waitForTimeout(300);
  const ct = await page.$$('[data-cafetick^="close|"]'); await ct[0].check();
  await page.fill('#cafeCash', '25.5'); await page.click('#cafeCloseBtn'); await page.waitForTimeout(1200);
  ok('closing for the day keeps the cash', /Closed at .* cash \$25\.50/.test(await txt(page)));
  await page.click('[data-cafeview="numbers"]'); await page.waitForTimeout(600);
  ok('"The numbers" is the usual page, saying the tool fills it', /fill themselves in/.test(await txt(page)));
  ok('… and the phone remembers that choice for next time', await page.evaluate(() => localStorage.getItem('gp-cafe-view')) === 'numbers');
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const { ctx, page } = await open('kanha');
  await page.click('[data-cafetab="setup"]'); await page.waitForTimeout(300);
  ok('the cafe’s leader has Set up: the menu and checklists', (await page.$$('.cafeMenuRow')).length >= 4 && !!(await page.$('#cafeSetOpen')));
  await page.click('#cafeMenuAdd'); await page.waitForTimeout(200);
  const rows = await page.$$('.cafeMenuRow'); const last = rows[rows.length - 1];
  await (await last.$('[data-cafemenu$="|name"]')).fill('Mango smoothie'); await (await last.$('[data-cafemenu$="|price"]')).fill('2.75');
  await page.click('#cafeSetSave'); await page.waitForTimeout(1200);
  await page.click('[data-cafetab="till"]'); await page.waitForTimeout(300);
  ok('a new menu item is on the till', /Mango smoothie/.test(await txt(page)));
  await ctx.close();
}
{
  const { ctx, page } = await open('vanna', { small: true, km: true });
  ok('in Khmer at 320px the cafe tool fits', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await page.click('[data-cafetab="till"]'); await page.waitForTimeout(300);
  ok('… and so does the till', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await ctx.close();
}
{
  const { ctx, page } = await open('kanha');
  await page.click('[data-cafetab="setup"]'); await page.waitForTimeout(300);
  await page.click('[data-cafetill="hangpopok"]'); await page.waitForTimeout(1200);
  await page.click('[data-cafetab="till"]'); await page.waitForTimeout(300);
  ok('with HangPopok as the till, the Till tab asks for the day’s totals instead of the menu', !!(await page.$('#cafePosSales')) && !(await page.$('.cafeMenu')));
  const before = ent('Cafe', 'Cups Sold').value;
  await page.fill('#cafePosSales', '84.50'); await page.fill('#cafePosReceipts', '31'); await page.fill('#cafePosCups', '40');
  await page.click('#cafePosSave'); await page.waitForTimeout(1200);
  ok('… and they fill the week like sales made in the app', ent('Cafe', 'Cups Sold').value === before + 40 && /Saved at/.test(await txt(page)));
  await page.screenshot({ path: OUT + '/cafe-hangpopok.png', fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await open('cd', { lw: 'base' });
  ok('a Director’s Overview: the departments’ pulse and who leads what', !!(await page.$('#leadBase')) && (await page.$$('.pulseCard')).length >= 3 && /Clear leaders/.test(await txt(page)));
  ok('… with the ministries that have no leader yet', (await page.$$('.lbDeptLine')).length >= 3 && /\b1 \/ \d+/.test(await page.$eval('.lbBig', e => e.innerText)));
  ok('… and the money behind the leadership code', !!(await page.$('#lmUnlock')) && !(await page.$('.lmTable')));
  await page.click('#lbGoTues'); await page.waitForTimeout(800);
  ok('"Plan the Tuesdays" opens the next eight on the board', (await page.$$('.leadTue')).length === 8 && await page.evaluate(() => S.lwTab === 'board' && S.leadTab === 'tues'));
  await page.click('.leadTue [data-ltopen]'); await page.waitForTimeout(300);
  await page.selectOption('[data-ltwho="facilitator"]', 'st2'); await page.waitForTimeout(200);
  await page.selectOption('[data-ltwho="translator"]', '__other'); await page.waitForTimeout(200);
  await page.fill('[data-ltname="translator"]', 'Pastor Sokha');
  await page.fill('#ltTopic', 'Outreach week'); await page.press('#ltTopic', 'Enter'); await page.waitForTimeout(200);
  await page.fill('#ltTopic', 'Prayer for the DTS');
  await page.click('#ltSave'); await page.waitForTimeout(1200);
  const first = await page.$eval('.leadTue', e => e.innerText);
  ok('a facilitator, a guest translator and the topics, saved', /Dara Sok/.test(first) && /Pastor Sokha/.test(first) && /Outreach week/.test(first) && /Prayer for the DTS/.test(first), first.replace(/\n/g, ' | '));
  ok('… on the board for the whole leadership team', (mem['leadBoard:siemreap'].tues || []).length === 1);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: OUT + '/lead-tues.png', fullPage: true });
  await page.click('[data-lwtab="base"]'); await page.waitForTimeout(600);
  ok('the Overview shows who is facilitating and translating', /Facilitating\s*Dara Sok/.test(await txt(page)) && /Translating\s*Pastor Sokha/.test(await txt(page)));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  mem.entries = (mem.entries || []).concat([{ campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', metric: 'Base Finances ($)', week: 1, year: new Date().getFullYear(), value: 5000, updated: '', by: 'x' }]);
  const { ctx, page } = await open('cd', { lw: 'base', code: 'leadercode' });
  ok('with the code: Base Finances and six months ahead', /\$5,000/.test(await page.$eval('#leadMoney', e => e.innerText)) && (await page.$$('.lmRow')).length === 7);
  const ins = await page.$$('[data-lmm$="|exp"]');
  await ins[0].fill('3000'); await ins[1].fill('3000');
  ok('typing what goes out moves the balance and warns when it runs short', /runs short/.test(await page.$eval('.lmSum', e => e.innerText)) && await page.$eval('.lmSum', e => e.classList.contains('bad')));
  await page.click('#lmSave'); await page.waitForTimeout(1200);
  ok('saved for the leadership code holders', !!mem['finProj:siemreap'] && Object.values(mem['finProj:siemreap'].months).some(m => m.exp === 3000));
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: OUT + '/lead-overview.png', fullPage: true });
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const { ctx, page } = await open('cd', { lw: 'base', code: 'nope' });
  ok('a wrong code shows nothing and says so', /didn’t work/.test(await page.$eval('#leadMoney', e => e.innerText)) && !(await page.$('.lmTable')));
  await ctx.close();
}
{
  const { ctx, page } = await open('cd', { lw: 'base', code: 'leadercode', small: true, km: true });
  ok('in Khmer at 320px the Overview fits', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await page.click('[data-lwtab="board"]'); await page.waitForTimeout(500);
  await page.click('[data-leadtab="tues"]'); await page.waitForTimeout(500);
  await page.click('.leadTue [data-ltopen]'); await page.waitForTimeout(300);
  ok('… and so do the Tuesdays', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
