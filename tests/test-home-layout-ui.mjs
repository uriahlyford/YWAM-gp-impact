/* My Home, reorganised (Oct 2026): the sections in order; the large summary card
   (with Health check-in and My Ministry, so neither has a section below) and its
   photo option; Updates capped at three with See all; Weekly Goals with a small
   Last week / This week switch under it and no Share my week; Annual goals folded
   until opened; "You're mentoring" only for a mentor; the tiles; no quick-jump
   strip; 320px and Khmer. On the real backend. */
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
mem.goals.push({ staffId: 'me', week: WK - 1, year: YR, items: [{ text: 'Visit three families', pct: 40 }], updated: '' });
{
  const { ctx, page } = await open('sreilea');
  await page.waitForTimeout(800);
  const heads = await page.$$eval('#main h3', hs => hs.map(h => h.innerText.trim()));
  ok('the sections, in order — no Health or My Ministry below the summary card', JSON.stringify(heads) === JSON.stringify(['🎯 Weekly Goals', '✅ Daily', 'Annual Goals · SMART', 'Mentorship', '🧭 About me']), heads.join(' | '));
  const card = await page.$eval('.myHero', e => e.innerText.replace(/\s+/g, ' '));
  ok('the large summary card: goals and their list, Health check-in, My Ministry, streak, habits, health, mentor, time off',
    /Weekly Goals 1\/3/.test(card) && /Plan the cafe menu/.test(card) && /Health check-in/.test(card) && /My Ministry/.test(card) &&
    /DAY STREAK/.test(card) && /Habits Today/.test(card) && /My Health 9\.2\/10/.test(card) && /Mentor Mealea Sok/.test(card) && /TIME OFF DAYS LEFT 29/.test(card), card.slice(0, 220));
  ok('… with the photo and colour option behind the gear', !!(await page.$('#dashCustomizeBtn')));
  ok('no quick-jump strip, no "My week" heading', !(await page.$('.quickBar')) && !/My week \d/.test(await page.$eval('#main', e => e.innerText)));
  const upd = await page.$$eval('#main .card .row', rs => rs.map(r => r.innerText).filter(x => /Announcement|leave request/.test(x)));
  ok('no Updates card on My Home — the bell has them, with its red dot', upd.length === 0 && !(await page.$('#notifSeeAll')) && !!(await page.$('#bellBtn .notifDot')));
  await page.click('#bellBtn'); await page.waitForTimeout(300);
  const bell = await page.$$eval('#notifRoot .row', rs => rs.map(r => r.innerText).filter(x => /Announcement|leave request/.test(x)));
  ok('the bell lists them all', bell.length >= 3 && await page.evaluate(() => S.bellOpen === true), bell.length + ' in the bell');
  await page.evaluate(() => { S.bellOpen = false; renderNotifPanel(); });
  ok('Weekly Goals: no arrows on top, no Share my week', !(await page.$('#goalsPrevWeek, #goalsNextWeek, .weekNavRow, #shareWeek')));
  ok('… a small Last week / This week switch under the goals', (await page.$$eval('.goalsWeekSwitch [data-goalswk]', bs => bs.map(b => b.innerText + (b.classList.contains('on') ? '*' : '')))).join() === 'Last week,This week*');
  await page.click('[data-goalswk="last"]'); await page.waitForTimeout(300);
  let gc = await page.$eval('#sec-goals + .card', e => e.innerText.replace(/\s+/g, ' '));
  ok('Last week shows last week’s goals to mark how they went', /^Last week/.test(gc) && /Visit three families/.test(gc) && /How did last week go/.test(gc) && !(await page.$('#newGoalText')), gc.slice(0, 120));
  await page.click('[data-goalswk="this"]'); await page.waitForTimeout(300);
  gc = await page.$eval('#sec-goals + .card', e => e.innerText.replace(/\s+/g, ' '));
  ok('… and This week brings this week back', /^This week/.test(gc) && /Plan the cafe menu/.test(gc));
  ok('an unlinked goal says "Link to a KPI" quietly', (await page.$$('.goalLink.unlinked')).length === 3);
  ok('Annual goals folded to one line', /2 goals · 50% on average/.test(await page.$eval('#smartToggle', e => e.innerText)) && !(await page.$('[data-smartcat]')));
  await page.click('#smartToggle'); await page.waitForTimeout(300);
  ok('… opens to the full editor, and closes again', !!(await page.$('[data-smartcat]')) && !!(await page.$('#smartToggle')));
  await page.click('#smartToggle'); await page.waitForTimeout(300);
  ok('“You’re mentoring” is not shown to someone who mentors nobody', !/YOU'RE MENTORING|You're not mentoring/i.test(await page.$eval('#sec-mentor + .card', e => e.innerText)));
  ok('About me: personality and strengths side by side', !!(await page.$('.homeTiles #pSeeMine')) && !!(await page.$('.homeTiles #gsStart')));
  ok('no Leave / Profile tiles at the bottom — they are in the menu', !(await page.$('.homeTiles #goLeaveFromMe')) && !(await page.$('#goProfileFromMe')));
  await page.click('#menuBtn'); await page.waitForTimeout(300);
  ok('the menu has Leave Request and Profile & settings', !!(await page.$('[data-menu-item="leave"]')) && !!(await page.$('[data-menu-item="profile"]')));
  await page.click('[data-menu-item="profile"]'); await page.waitForTimeout(400);
  ok('Profile & settings in the menu opens the profile page', await page.evaluate(() => S.view === 'profile' && !S.menuOpen));
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(300);
  await page.click('#menuBtn'); await page.waitForTimeout(300);
  await page.click('[data-menu-item="leave"]'); await page.waitForTimeout(400);
  ok('Leave Request in the menu opens the leave page', await page.evaluate(() => S.view === 'leave' && !S.menuOpen));
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(300);
  await page.click('#goMinistryFromMe'); await page.waitForTimeout(400);
  ok('the summary card’s My Ministry opens My Ministry', await page.evaluate(() => S.view === 'ministry'));
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(300);
  await page.click('#goLeaveFromMe'); await page.waitForTimeout(400);
  ok('the summary card’s time-off row opens the Leave Request page', await page.evaluate(() => S.view === 'leave'));
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
