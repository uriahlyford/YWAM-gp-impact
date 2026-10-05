/* The nightly backup on the page: Admin home's "Last backup" line, the bell
   warning an admin (and nobody else) when a night is missed or the last run
   failed, "Open Admin" from the bell, the line before the first ever run, and
   Khmer. With the clock fixed, on the real backend. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('backup-ui');
const OUT = tmpDir('backup-ui-out');
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
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' })
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




/* The fake store has one namespace, so 'status' here is the backup store's. */
const AT = '2026-10-06T03:00:00Z';   // 10:00 in Phnom Penh
const status = (o) => { mem.status = Object.assign({ ok: true, items: 214, days: 30, bytes: 1, day: '' }, o); };
const bellText = async page => {
  await page.click('#bellBtn'); await page.waitForTimeout(250);
  const t = await page.$eval('#notifRoot', e => e.innerText);
  return t;
};
const toAdmin = async page => { await page.evaluate(() => { S.bellOpen = false; renderNotifPanel(); S.view = 'admin'; S.adminSub = 'home'; render(); }); await page.waitForTimeout(300); };
const line = page => page.$eval('#backupLine', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');

/* ---------- 1. last night's backup ran ---------- */
status({ at: '2026-10-05T20:00:00Z' });
{
  const { ctx, page } = await open('uriah', { at: AT });
  ok('the bell says nothing about the backup when it ran last night', !/backup/i.test(await bellText(page)));
  await toAdmin(page);
  const l = await line(page);
  ok('Admin home says when it last ran, how much, how many nights kept', /Last backup: Oct 6, 03:00 · 214 items · 30 nights kept/.test(l), l);
  await page.screenshot({ path: OUT + '/backup-ok.png' });
  await ctx.close();
}

/* ---------- 2. two nights missed ---------- */
status({ at: '2026-10-03T20:00:00Z' });
{
  const { ctx, page } = await open('uriah', { at: AT });
  const bell = await bellText(page);
  ok('the bell warns an admin', /The nightly backup has not run since Oct 4, 03:00\./.test(bell), bell.slice(0, 160));
  await page.click('#notifRoot [data-goadmin]'); await page.waitForTimeout(400);
  ok('“Open Admin” goes to Admin home', !!(await page.$('#backupLine')) && !(await page.$('#notifRoot .notifPanel, #notifRoot [data-goadmin]')));
  const l = await line(page);
  ok('which says so in red', /⚠️ The nightly backup has not run since Oct 4, 03:00/.test(l) && !!(await page.$('#backupLine .backupLate')), l);
  await page.screenshot({ path: OUT + '/backup-late.png' });
  await ctx.close();
}
{
  const { ctx, page } = await open('sreilea', { at: AT });
  ok('nobody else is told', !/backup/i.test(await bellText(page)));
  await ctx.close();
}

/* ---------- 3. last night failed ---------- */
status({ at: '2026-10-04T20:00:00Z', lastError: 'disk full', errorAt: '2026-10-05T20:00:05Z' });
{
  const { ctx, page } = await open('uriah', { at: AT });
  ok('a failed run warns even inside the day and a half', /The nightly backup has not run since Oct 5, 03:00/.test(await bellText(page)));
  await page.click('#notifRoot [data-goadmin]'); await page.waitForTimeout(400);
  ok('and Admin home shows the error', /Last error: disk full/.test(await line(page)), await line(page));
  await ctx.close();
}

/* ---------- 4. before the first run, and in Khmer ---------- */
delete mem.status;
{
  const { ctx, page } = await open('uriah', { at: AT });
  ok('before the first night: no warning', !/backup/i.test(await bellText(page)));
  await toAdmin(page);
  ok('Admin home says the first one runs tonight', /No backup has run yet — the first one runs tonight at 3:00\./.test(await line(page)), await line(page));
  await ctx.close();
}
status({ at: '2026-10-03T20:00:00Z' });
{
  const { ctx, page } = await open('uriah', { at: AT, km: true });
  await toAdmin(page);
  const l = await line(page);
  ok('in Khmer the line is in Khmer', /[ក-៿]/.test(l) && !/has not run/.test(l), l);
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
