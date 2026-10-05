/* Team → Personalities, on the real backend: the whole campus by default with
   how many have shared a type; the four groups counted; each pair with the
   team's lean (or "evenly mixed"); who has which type, most common first;
   someone who turned sharing off is neither counted nor named; no season;
   the fine print; narrowing to a ministry or a department; the other campus;
   a name opens the person; Khmer at 320px. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('team-personality-ui');
const OUT = tmpDir('team-personality-ui-out');
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
const pt = (type, share) => ({ type: type, scores: null, source: 'pick', takenAt: '2026-09-01', share: share !== false, season: 'stretched' });
mem.staff = [
  mk({ id: 'p1', name: 'Anna Ek', username: 'anna', email: 'a@e.com', sex: 'female', personality: pt('ENFJ') }),
  mk({ id: 'p2', name: 'Bopha Ek', username: 'bopha', email: 'b@e.com', sex: 'female', personality: pt('ENFJ') }),
  mk({ id: 'p3', name: 'Chan Ek', username: 'chan', email: 'c@e.com', sex: 'male', personality: pt('INTJ'), ministry: 'Intercession' }),
  mk({ id: 'p4', name: 'Dara Ek', username: 'dara', email: 'd@e.com', sex: 'male', personality: pt('ISFJ'), dept: 'Skills Training', ministry: 'Culinary' }),
  mk({ id: 'p5', name: 'Hidden Person', username: 'hid', email: 'h@e.com', sex: 'male', personality: pt('ESTP', false) }),
  mk({ id: 'p6', name: 'No Type', username: 'notype', email: 'n@e.com' }),
  mk({ id: 'p7', name: 'Poipet Pers', username: 'poi', email: 'p@e.com', campus: 'poipet', personality: pt('INFP') })
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




const toPers = async page => {
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(500);
  await page.click('[data-teammode="pers"]'); await page.waitForTimeout(400);
};
const main = page => page.$eval('#main', e => e.innerText);
const pair = (page, i) => page.$$eval('.tpPair', (ps, i) => ps[i].innerText.replace(/\s+/g, ' ').trim(), i);
{
  const { ctx, page } = await open('anna');
  await toPers(page);
  let m = await main(page);
  ok('Team has a Personalities view, for the whole campus by default', /4 of 6 people have shared their type/.test(m), (m.match(/\d+ of \d+ people[^\n]*/) || [''])[0]);
  const groups = await page.$$eval('.pBar:not(.tpPair) .pBarTop', bs => bs.map(b => b.innerText.replace(/\s+/g, ' ').trim()));
  ok('the four groups, counted', groups.join(' | ') === 'Minds 1 · 25% | Hearts 2 · 50% | Anchors 1 · 25% | Movers 0 · 0%', groups.join(' | '));
  ok('Extraverted / Introverted evenly mixed', /Extraverted 2 .* 2 Introverted/.test(await pair(page, 0)) && /Evenly mixed/.test(await pair(page, 0)), await pair(page, 0));
  ok('mostly Intuitive', /Mostly Intuitive/.test(await pair(page, 1)));
  ok('mostly Feeling', /Mostly Feeling/.test(await pair(page, 2)));
  ok('mostly Judging', /Mostly Judging/.test(await pair(page, 3)));
  const rows = await page.$$eval('.tpTypeRow', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  ok('who has which type, most common first', /^ENFJ .* Anna Bopha 2$/.test(rows[0]) && rows.length === 3, rows.join(' | '));
  ok('someone who turned sharing off is not counted or named', !/Hidden/.test(m) && /Not on this team yet:.*ESTP/.test(m));
  ok('nothing about anyone’s season', !/stretched/i.test(m) && await page.evaluate(() => !JSON.stringify(S.roster).includes('season')));
  ok('the fine print is there', /not the official MBTI® assessment/.test(m));
  ok('the four view buttons fit: nothing is cut off and nothing scrolls sideways', await page.evaluate(() => {
    const bs = [...document.querySelectorAll('[data-teammode]')];
    return bs.length === 4 && bs.every(b => b.scrollWidth <= b.clientWidth + 1) && document.documentElement.scrollWidth <= window.innerWidth + 1;
  }));
  await page.screenshot({ path: OUT + '/team-pers.png', fullPage: true });

  await page.selectOption('#teamPScope', 'min:Community Service|Cafe'); await page.waitForTimeout(300);
  m = await main(page);
  ok('narrowed to one ministry', /2 of 4 people have shared their type/.test(m) && /Hearts 2 · 100%/.test(m.replace(/\s+/g, ' ')), (m.match(/\d+ of \d+ people[^\n]*/) || [''])[0]);
  await page.selectOption('#teamPScope', 'dept:Skills Training'); await page.waitForTimeout(300);
  ok('… or one department', /1 of 1 people have shared their type/.test(await main(page)));
  await page.click('[data-teamcampus="poipet"]'); await page.waitForTimeout(300);
  m = await main(page);
  ok('the other campus counts its own people, from the whole campus again', /1 of 1 people/.test(m) && /INFP/.test(m) && !/Anna/.test(m));
  await page.click('[data-teamcampus="siemreap"]'); await page.waitForTimeout(300);
  await page.click('.tpTypeRow [data-person="p3"]'); await page.waitForTimeout(900);
  ok('tapping a name opens their profile', await page.evaluate(() => !!S.person && JSON.stringify(S.person).includes('Chan Ek')));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 }, timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'anna', pin: '1234' })); localStorage.setItem('gp-lang', 'km'); });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await toPers(page);
  const m = await main(page);
  ok('in Khmer at 320px: the leans read in Khmer and nothing scrolls sideways', /ភាគច្រើន/.test(m) && await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await page.screenshot({ path: OUT + '/team-pers-km-320.png' });
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
