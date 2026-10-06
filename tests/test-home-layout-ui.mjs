/* My Home, reorganised (Oct 2026): the sections in order and said once; the
   summary card's three rings; Updates capped at three with See all; Weekly Goals
   as one card with no empty "last week"; Annual goals folded until opened;
   "You're mentoring" only for a mentor; the tiles; no quick-jump strip; 320px
   and Khmer. On the real backend. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('home-layout-ui');
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
  mk({ id: 'me', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com', mentorId: 'mt', mentorStatus: 'approved', sex: 'female',
       personality: { type: 'ENFJ', share: true, source: 'test', takenAt: '2026-09-01', season: 'ordinary' } }),
  mk({ id: 'mt', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', dept: 'Campus Leadership', ministry: 'Community Service' }),
  mk({ id: 'd2', name: 'Dara Pen', username: 'dara', email: 'd@e.com' })
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
mem.goals = [{ staffId: 'me', week: WK, year: YR, items: [{ text: 'Plan the cafe menu for October', pct: 60 }, { text: 'Call two church partners', pct: 100 }, { text: 'Finish the DTS outline', pct: 20 }], updated: '' }];
mem.dailyLogs = [{ staffId: 'me', date: NOW, week: WK, habits: { bible: true, quietTime: true } , bible: true, quietTime: true }];
mem.survey = [{ campus: 'siemreap', week: WK - 1, year: YR, device: 'tok_me', source: 'weekly', days: 7, lonely: 3, clarity: 8, growth: 7, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0, sharedFaith: 1, sabbath: 1, langHours: 3, minHours: 10 }];
mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: WK - 1, year: YR, value: 120 }];
mem.okrs = [{ campus: 'siemreap', dept: 'Community Service', quarter: Math.floor((Number(NOW.slice(5,7))-1)/3)+1, year: YR, id: 'o1', objective: 'Grow the cafe as a place to meet people', kr: 'Sell 2,000 cups', metricKey: 'Community Service|Cafe|Cups Sold', target: 2000, updated: '' }];
mem.smartGoals = [{ id: 'sg1', staffId: 'me', year: YR, category: 'Faith', text: 'Read the whole Bible this year', progress: 70 }];
mem.trips = [{ id: 't1', staffId: 'me', campus: 'siemreap', from: YR + '-12-20', to: YR + '-12-28', type: 'personal', status: 'approved', reason: 'Family', created: NOW }];
const OUT = tmpDir('home-layout-ui-out');
mem.smartGoals = [{ id: 'sg1', staffId: 'me', year: YR, category: 'Faith', title: 'Read the whole Bible', pct: 70 }, { id: 'sg2', staffId: 'me', year: YR, category: 'Health', title: 'Run 5k', pct: 30 }];
mem.broadcasts = [1, 2, 3, 4].map(i => ({ id: 'b' + i, campus: 'siemreap', text: 'Announcement ' + i, created: new Date(Date.now() - i * 60000).toISOString(), by: 'mt' }));
{
  const { ctx, page } = await open('sreilea');
  await page.waitForTimeout(800);
  const heads = await page.$$eval('#main h3', hs => hs.map(h => h.innerText.trim()));
  ok('the sections, in order', JSON.stringify(heads) === JSON.stringify(['🎯 Weekly Goals', '✅ Daily', '💚 Health', '📊 My Ministry', 'Annual Goals · SMART', 'Mentorship', '🧭 About me']), heads.join(' | '));
  const rings = await page.$$eval('.myHero .heroRing', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  ok('the summary card: three rings — goals, habits, health', rings.length === 3 && /1\/3 Weekly Goals/.test(rings[0]) && /2\/3/.test(rings[1]) && /9\.2/.test(rings[2]), rings.join(' | '));
  ok('… and no big streak number, mentor row or time-off row', !(await page.$('.myHero .heroNum, .myHero .heroSub')) && !/DAY STREAK|TIME OFF|Mentor/.test(await page.$eval('.myHero', e => e.innerText)));
  ok('no quick-jump strip, no "My week" heading', !(await page.$('.quickBar')) && !/My week \d/.test(await page.$eval('#main', e => e.innerText)));
  const upd = await page.$$eval('#main .card .row', rs => rs.map(r => r.innerText).filter(x => /Announcement|leave request/.test(x)));
  ok('Updates shows three, with See all', upd.length === 3 && !!(await page.$('#notifSeeAll')), upd.length + ' shown');
  await page.click('#notifSeeAll'); await page.waitForTimeout(300);
  ok('See all opens the bell', await page.evaluate(() => S.bellOpen === true));
  await page.evaluate(() => { S.bellOpen = false; renderNotifPanel(); });
  ok('Weekly Goals is one card, the week arrows in its head', !!(await page.$('.goalsWeekHead #goalsPrevWeek')) && !(await page.$('.weekNavRow')));
  ok('… with no "last week" when there were none', !(await page.$('.lastWeekLine')) && !/didn’t set goals last week/.test(await page.$eval('#main', e => e.innerText)));
  ok('an unlinked goal says "Link to a KPI" quietly', (await page.$$('.goalLink.unlinked')).length === 3);
  ok('Annual goals folded to one line', /2 goals · 50% on average/.test(await page.$eval('#smartToggle', e => e.innerText)) && !(await page.$('[data-smartcat]')));
  await page.click('#smartToggle'); await page.waitForTimeout(300);
  ok('… opens to the full editor, and closes again', !!(await page.$('[data-smartcat]')) && !!(await page.$('#smartToggle')));
  await page.click('#smartToggle'); await page.waitForTimeout(300);
  ok('“You’re mentoring” is not shown to someone who mentors nobody', !/YOU'RE MENTORING|You're not mentoring/i.test(await page.$eval('#sec-mentor + .card', e => e.innerText)));
  ok('My Ministry: Numbers and OKRs side by side', !!(await page.$('.homeTiles #goMinistryFromMe')) && !!(await page.$('.homeTiles #goOkrFromMe')));
  ok('About me: personality and strengths side by side', !!(await page.$('.homeTiles #pSeeMine')) && !!(await page.$('.homeTiles #gsStart')));
  ok('Leave (with days left) and Profile at the bottom', /29 days off left this year/.test(await page.$eval('#goLeaveFromMe', e => e.innerText)) && !!(await page.$('.homeTiles #goProfileFromMe')));
  await page.click('#goLeaveFromMe'); await page.waitForTimeout(400);
  ok('the tiles still go where they did', await page.evaluate(() => S.view === 'leave'));
  await ctx.close();
}
{
  mem.staff.find(x => x.id === 'mt').mentorId = 'd2';
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })); localStorage.setItem('gp-lang', 'km'); });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.waitForTimeout(800);
  ok('at 320px in Khmer nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  ok('… and the new headings are in Khmer', /អំពីខ្ញុំ/.test(await page.$eval('#main', e => e.innerText)));
  await page.screenshot({ path: OUT + '/home-km-320.png', fullPage: true });
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
