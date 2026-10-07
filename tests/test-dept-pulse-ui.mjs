/* The department pulse on the page, on the real backend: a department leader's
   page leading with six figures and nothing to type (numbers in, staff and who
   is away, the department's health score, 1-on-1s, OKRs, staff debt) above
   the ministries' list; Finance entering staff debt on its own page and the
   leader seeing it; the Campus Director seeing every department and entering
   the quarter's own scores (a 70 caught, a 7 saved for the quarter); ordinary
   staff seeing none of it. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('dept-pulse-ui');
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
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', ministry: 'Ponlork School' }),
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com', ministry: 'GP Education' }),
  mk({ id: 'cs', name: 'Chea Leader', username: 'chea', email: 'c@e.com', dept: 'Campus Leadership', ministry: 'Community Service' }),
  mk({ id: 'cd', name: 'Dir Ector', username: 'director', email: 'x@e.com', dept: 'Campus Leadership', ministry: 'Campus Director' }),
  mk({ id: 'fi', name: 'Fin Ance', username: 'finance', email: 'f@e.com', dept: 'Skills Training', ministry: 'Finances' })
];const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
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
const row = (id, o) => Object.assign({ campus: 'siemreap', week: WK, year: YR, device: 'tok_' + id, lonely: 2, clarity: 8, porn: 0, oneOnOne: 1,
  exercise: 1, quietTime: 1, debt: 0 }, o || {});
mem.survey = [row('st1'), row('st2'), row('st3', { clarity: 6 })];
mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: WK, year: YR, value: 9, updated: '' }];
const mon = new Date(NOW + 'T00:00:00Z'); mon.setUTCDate(mon.getUTCDate() - ((mon.getUTCDay() + 6) % 7));
const dd = n => { const x = new Date(mon); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
mem.trips = [{ id: 't1', staffId: 'st1', campus: 'siemreap', from: dd(1), to: dd(2), status: 'approved', reason: 'family' }];
const toMinistry = async page => { await page.click('#goMinistryFromMe'); await page.waitForTimeout(1200); };
const tiles = page => page.$$eval('.pulseCard .pulseTile', ts => ts.map(t => t.innerText.replace(/\s+/g, ' ').trim()));

/* ---------- 1. the department leader's card ---------- */
{
  const { ctx, page } = await open('chea');
  await toMinistry(page);
  const t = await tiles(page);
  ok('a department leader\'s page leads with the department, six figures, nothing to type', t.length === 6 && !(await page.$('.pulseCard input')), JSON.stringify(t));
  ok('numbers in on time', /Numbers in 1 \/ 4/.test(t[0]), t[0]);
  ok('staff, and who is away', /Staff 3 1 away this week/.test(t[1]) && /Away: Sreilea/.test(await page.$eval('.pulseCard', e => e.innerText)), t[1]);
  ok('the department\'s health score, from three check-ins', /Health \d\.\d 3 of 3 answered/.test(t[2]), t[2]);
  ok('staff debt not entered yet', /Staff debt — not entered yet/.test(t[5]), t[5]);
  ok('with the ministries\' list under it', /✅ Cafe/.test(await page.$eval('.pulseCard', e => e.innerText)));
  await ctx.close();
}

/* ---------- 2. Finance enters the staff debt ---------- */
{
  const { ctx, page } = await open('finance');
  await toMinistry(page);
  ok('Finance has a staff-debt card on its page', !!(await page.$('[data-debt="Community Service"]')));
  await page.fill('[data-debt="Community Service"]', '1200');
  await page.click('#debtSave'); await page.waitForTimeout(800);
  ok('and saving stores it for the department', mem.entries.some(e => e.dept === 'Campus Leadership' && e.ministry === 'Community Service' && e.metric === 'Staff Debt ($)' && e.value === 1200));
  ok('the card says when it was entered', /last entered/.test(await page.$eval('[data-debt="Community Service"]', e => e.closest('.row').innerText)));
  await ctx.close();
}
{
  const { ctx, page } = await open('chea');
  await toMinistry(page);
  const t = await tiles(page);
  ok('the department leader then sees it, from Finance', /Staff debt \$1,200 from Finance/.test(t[5]), t[5]);
  await ctx.close();
}

/* ---------- 3. the Campus Director ---------- */
{
  const { ctx, page } = await open('director');
  await toMinistry(page);
  ok('the Campus Director sees every department', (await page.$$('.pulseCard')).length === 4);
  ok('each with its ministries folded away', (await page.$$('.pulseCard details.pulseMore')).length >= 3);
  ok('and the quarter\'s own check-in', !!(await page.$('#dirQSave')));
  await page.fill('[data-dirq="Base Vision (1-10)"]', '70');
  await page.click('#dirQSave'); await page.waitForTimeout(300);
  ok('a 70 for a 1–10 score is caught', /goes from 1 to 10/.test(await page.$eval('#msg', e => e.textContent)) &&
    !mem.entries.some(e => e.metric === 'Base Vision (1-10)'));
  await page.fill('[data-dirq="Base Vision (1-10)"]', '7');
  await page.fill('[data-dirq="Base Plants in Planning"]', '1');
  await page.click('#dirQSave'); await page.waitForTimeout(800);
  const qa = await page.evaluate(() => quarterAnchorWeek_());
  ok('a 7 saves, once for the quarter', mem.entries.some(e => e.ministry === 'Campus Director' && e.metric === 'Base Vision (1-10)' && e.value === 7 && Number(e.week) === qa));
  await ctx.close();
}

/* ---------- 4. ordinary staff ---------- */
{
  const { ctx, page } = await open('sreilea');
  await toMinistry(page);
  ok('ordinary staff see no department card and no staff-debt card', !(await page.$('.pulseCard')) && !(await page.$('[data-debt]')));
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
