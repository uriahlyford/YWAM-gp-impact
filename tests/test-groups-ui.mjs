/* Admin → Arrivals & departures, on the real backend: the invite link carries the
   campus, department and ministry; opening it shows the sign-up form with those
   chosen and a line saying so, and signing up makes the person's own account
   there with their own PIN; a link naming no real campus is the plain form.
   Archiving several: search by ministry or role, Select all shown, a confirm
   step, the reason recorded, the rest untouched, and they drop off the list. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('groups-ui');
const OUT = tmpDir('groups-ui-out');
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
  mk({ id: 'ad', name: 'Uriah Admin', username: 'uriah', email: 'u@e.com', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true }),
  mk({ id: 'd1', name: 'Anna DTS', username: 'anna', email: 'a@e.com', dept: 'Leadership Development', ministry: 'GPDTS', role: 'DTS student' }),
  mk({ id: 'd2', name: 'Ben DTS', username: 'ben', email: 'b@e.com', dept: 'Leadership Development', ministry: 'GPDTS', role: 'DTS student' }),
  mk({ id: 'cf', name: 'Cora Cafe', username: 'cora', email: 'c@e.com' })
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




const toGroups = async page => {
  await page.evaluate(() => { S.view = 'admin'; S.adminSub = 'home'; render(); }); await page.waitForTimeout(800);
  await page.click('[data-adminsub="groups"]'); await page.waitForTimeout(500);
};
let link = '';
{
  const { ctx, page } = await open('uriah');
  await toGroups(page);
  ok('Admin has Arrivals & departures', !!(await page.$('#grpLink')));
  await page.selectOption('#grpCampus', 'siemreap'); await page.waitForTimeout(150);
  await page.selectOption('#grpDept', 'Leadership Development'); await page.waitForTimeout(150);
  await page.selectOption('#grpMin', 'GPDTS'); await page.waitForTimeout(150);
  link = await page.$eval('#grpLink', e => e.value);
  ok('the link carries where they are joining', /teams\.html\?reg=1&campus=siemreap&dept=Leadership%20Development&ministry=GPDTS$/.test(link), link);
  await page.screenshot({ path: OUT + '/groups-invite.png' });

  // archive several
  await page.fill('#grpSearch', 'dts'); await page.waitForTimeout(300);
  const names = await page.$$eval('#grpList .grpRow b', bs => bs.map(b => b.textContent));
  ok('search finds them by ministry or role', names.join() === 'Anna DTS,Ben DTS', names.join());
  ok('the admin is never in the list', !(await page.$('[data-grppick="ad"]')));
  await page.click('#grpAll'); await page.waitForTimeout(200);
  ok('Select all shown ticks both', (await page.$$('[data-grppick]:checked')).length === 2);
  await page.fill('#grpReason', 'DTS finished');
  await page.click('#grpArchive'); await page.waitForTimeout(200);
  ok('archiving asks first', /Archive 2 people\? They will not be able to log in\./.test(await page.$eval('#main', e => e.innerText)) && mem.staff.find(x => x.id === 'd1').active);
  await page.screenshot({ path: OUT + '/groups-confirm.png' });
  await page.click('#grpYes'); await page.waitForTimeout(1200);
  const d1 = mem.staff.find(x => x.id === 'd1'), d2 = mem.staff.find(x => x.id === 'd2');
  ok('Yes archives both, with the reason', !d1.active && !d2.active && d1.archived.reason === 'DTS finished' && d1.archived.by === 'ad');
  ok('… and leaves the rest', mem.staff.find(x => x.id === 'cf').active);
  await page.fill('#grpSearch', ''); await page.waitForTimeout(300);
  const left = await page.$$eval('#grpList .grpRow b', bs => bs.map(b => b.textContent));
  ok('they drop off the list', left.join() === 'Cora Cafe', left.join());
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route('**fonts.g**', r => r.abort());
  await page.goto(link.replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: 'load' });
  await page.waitForSelector('#r_name', { timeout: 15000 }); await page.waitForTimeout(400);
  const ban = await page.$eval('#inviteBanner', e => e.innerText).catch(() => '');
  ok('the link opens the sign-up form saying where they are joining', /You’re joining GPDTS · Leadership Development · .*Siem Reap/.test(ban), ban);
  ok('… with campus, department and ministry already chosen', (await page.$eval('#r_campus', e => e.value)) === 'siemreap' &&
    (await page.$eval('#r_dept', e => e.value)) === 'Leadership Development' && (await page.$eval('#r_ministry', e => e.value)) === 'GPDTS');
  await page.screenshot({ path: OUT + '/groups-signup.png' });
  await page.fill('#r_name', 'Dana New'); await page.fill('#r_email', 'dana@e.com');
  await page.fill('#r_user', 'dana'); await page.fill('#r_pin', '4321');
  await page.click('#regBtn'); await page.waitForTimeout(1500);
  const dana = mem.staff.find(x => x.username === 'dana');
  ok('signing up makes their own account in that ministry, with their own PIN', dana && dana.campus === 'siemreap' && dana.dept === 'Leadership Development' && dana.ministry === 'GPDTS' && dana.active && !!dana.pinHash);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.route('**fonts.g**', r => r.abort());
  await page.goto(BASE + '/teams.html?reg=1&campus=nowhere&dept=Fake', { waitUntil: 'load' });
  await page.waitForSelector('#r_name', { timeout: 15000 });
  ok('a link with a campus that does not exist is just the plain form', !(await page.$('#inviteBanner')));
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
