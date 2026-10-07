/* Admin → Loose ends on the page, on the real backend: on the admin's own
   campus with a count; ministries with nobody set (or someone no longer active);
   ministries with no numbers for three weeks; people not seen in 30 days (not
   yesterday's, not inactive ones, not another campus's); no department or
   ministry; no mentor; objectives nobody edited in 30 days (not ones a
   ministry's numbers feed); tapping a person or a ministry goes there; the other
   campus; before 30 days of counting it says when; opening the app marks the
   day seen. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('loose-ui');
const OUT = tmpDir('loose-ui-out');
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
  mk({ id: 'ad', name: 'Uriah Admin', username: 'uriah', email: 'u@e.com', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true, mentorId: 'dr' }),
  mk({ id: 'dr', name: 'Dara Pen', username: 'dara', email: 'd@e.com', mentorId: 'ad', leads: ['Community Service|Ponlork School'] }),
  mk({ id: 'ml', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', ministry: '', mentorId: 'ad' }),
  mk({ id: 'od', name: 'Old Timer', username: 'old', email: 'o@e.com', mentorId: 'ad' }),
  mk({ id: 'gh', name: 'Gone Ghost', username: 'ghost', email: 'g@e.com', active: false }),
  mk({ id: 'pp', name: 'Poipet Person', username: 'poipet', email: 'p@e.com', campus: 'poipet' })
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




const day = n => new Date(Date.now() + 7 * 3600 * 1000 - n * 864e5).toISOString().slice(0, 10);
const TODAY = day(0), YR = Number(TODAY.slice(0, 4));
const isoWeek = ds => { const d = new Date(ds + 'T00:00:00'), y = d.getFullYear(), j = new Date(y, 0, 1),
  m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7)); return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); };
const WK = isoWeek(TODAY), Q = Math.floor((Number(TODAY.slice(5, 7)) - 1) / 3) + 1;
mem.lastSeen = { started: day(60), seen: { dr: day(1), od: day(40) } };
mem.numbersPeople = { 'siemreap|Community Service|Cafe': { main: 'dr', backup: '' }, 'siemreap|Community Service|Ponlork School': { main: 'gh', backup: '' } };
mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: WK, year: YR, value: 9, updated: '' }];
mem.okrs = [
  { campus: 'siemreap', dept: 'Community Service', quarter: Q, year: YR, id: 'o1', objective: 'Open a second cafe', kr: 'a', metricKey: '', target: 1, updated: day(45) + 'T00:00:00Z' },
  { campus: 'siemreap', dept: 'Community Service', quarter: Q, year: YR, id: 'o2', objective: 'Pray every day', kr: 'b', metricKey: 'Community Service|Ponlork School|Hours', target: 10, updated: day(45) + 'T00:00:00Z' },
  { campus: 'siemreap', dept: 'Community Service', quarter: Q, year: YR, id: 'o3', objective: 'Fresh this week', kr: 'c', metricKey: '', target: 1, updated: day(2) + 'T00:00:00Z' }
];
const toLoose = async page => {
  await page.evaluate(() => { S.view = 'admin'; S.adminSub = 'home'; render(); }); await page.waitForTimeout(800);
  await page.click('[data-adminsub="loose"]'); await page.waitForTimeout(1200);
};
const section = (page, emoji) => page.$$eval('.looseCard', (cs, e) => { cs.forEach(c => c.querySelectorAll('details').forEach(d => { d.open = true; })); const c = cs.find(x => x.querySelector('.goalCardTitle').textContent.startsWith(e)); return c ? c.innerText : ''; }, emoji);

{
  const { ctx, page } = await open('uriah');
  await page.evaluate(() => { S.view = 'admin'; S.adminSub = 'home'; render(); }); await page.waitForTimeout(600);
  ok('Admin home has Loose ends', !!(await page.$('[data-adminsub="loose"]')));
  await toLoose(page);
  const sum = await page.$eval('#main', e => e.innerText);
  ok('it opens on the admin’s own campus with a count', /\d+ loose ends at .*Siem Reap/.test(sum), sum.split('\n').find(l => /loose ends|Nothing loose/.test(l)));

  const s1 = await section(page, '👤');
  ok('a ministry with nobody set is listed', /Spiritual|GP Education|Hospitality|nobody set/.test(s1) && !/Cafe/.test(s1.split('\n').slice(2).join('\n')));
  ok('… one whose set person is no longer active says so', /Ponlork School[\s\S]*Gone Ghost is set to enter these but is no longer active/.test(s1));
  const s2 = await section(page, '📉');
  ok('ministries with no numbers for three weeks are listed, not the one with numbers this week', /Ponlork School/.test(s2) && !/^Cafe/m.test(s2), s2.slice(0, 160));
  const s3 = await section(page, '💤');
  ok('not opened in 30 days: the one last seen 40 days ago, and the one never seen', /Old Timer · last opened/.test(s3) && /Mealea Sok · not since/.test(s3));
  ok('… not the one seen yesterday, the inactive one, or another campus', !/Dara Pen/.test(s3) && !/Gone Ghost/.test(s3) && !/Poipet Person/.test(s3));
  const s4 = await section(page, '🧭');
  ok('no department or ministry', /Mealea Sok · no ministry/.test(s4));
  const s5 = await section(page, '🤝');
  ok('no mentor is empty when everyone has one', /Nothing here/.test(s5), s5.slice(0, 80));
  const s6 = await section(page, '🎯');
  ok('an objective nobody touched in 30 days is listed', /Open a second cafe/.test(s6) && /last edited/.test(s6));
  ok('… not one fed by a ministry’s numbers, nor a fresh one', !/Pray every day/.test(s6) && !/Fresh this week/.test(s6));
  await page.evaluate(() => { S.adminLoose = S.adminLoose; render(); }); await page.waitForTimeout(200);
  const folded = await page.$$eval('.looseCard', cs => cs.map(c => ({ shown: [...c.children].filter(x => x.classList.contains('looseRow')).length, more: !!c.querySelector('details.looseMore') })));
  ok('a long list shows five and folds the rest', folded.some(f => f.shown === 5 && f.more) && folded.every(f => f.shown <= 5), JSON.stringify(folded));
  await page.screenshot({ path: OUT + '/loose.png', fullPage: true });

  await page.click('.looseCard [data-adminperson="od"]'); await page.waitForTimeout(500);
  ok('tapping a person opens them in Admin', await page.evaluate(() => S.adminSub === 'person' && S.adminPersonId === 'od'));
  await toLoose(page);
  await page.click('.looseCard [data-gonumbers="Community Service|Ponlork School"]'); await page.waitForTimeout(800);
  ok('tapping a ministry opens it on My Ministry', await page.evaluate(() => S.view === 'ministry' && S.mmBrowseMinistry === 'Ponlork School'));

  await toLoose(page);
  await page.click('[data-admincampustab="poipet"]'); await page.waitForTimeout(400);
  const pp = await section(page, '💤');
  ok('the other campus has its own list', /Poipet Person/.test(pp) && !/Old Timer/.test(pp));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  mem.lastSeen = { started: day(5), seen: {} };
  const { ctx, page } = await open('uriah');
  await toLoose(page);
  const s3 = await section(page, '💤');
  ok('before 30 days of counting, it says when the list fills in, and lists nobody', /Counting since .* this fills in from/.test(s3) && !/Old Timer/.test(s3) && !/Nothing here/.test(s3), s3.slice(0, 200));
  await ctx.close();
}
{
  const { ctx, page } = await open('dara');
  ok('opening the app marks the day seen, once', mem.lastSeen.seen.dr === TODAY);
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
