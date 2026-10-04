/* The bottom bar and the on-screen keyboard. iOS does not shrink the page for
   the keyboard, so a fixed bottom bar floated over the middle of the screen
   while someone typed and scrolled, and could be left stuck there afterwards
   (reported: "the bottom bar is getting stuck on the page, randomly blocking
   the middle of the page"). On touch screens the bar now steps aside while the
   keyboard is really up — a field that brings one up has focus AND the visible
   area has shrunk — and comes back after;
   body clips sideways overflow with `clip` so it is not a scroll container.
   Checked here: which fields hide it, moving between fields, the keyboard
   closing with the field still focused (Android back), a field removed by a
   re-render, turning the phone, the bar still working, and computers left alone. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('bottom-bar');
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
mem.staff = [mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' })];
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
  const ctx = await browser.newContext(opts.desktop ? { viewport: { width: 1200, height: 800 } } : { ...devices['iPhone 13'], ...(opts.viewport ? { viewport: opts.viewport } : {}) });
  const page = await ctx.newPage();
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

const navShown = page => page.$eval('nav.bottom', n => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 0);
/* fields of every kind, outside #main so a re-render cannot take them away */
const addFields = page => page.evaluate(() => {
  const box = document.createElement('div'); box.id = 'kbTest';
  box.innerHTML = '<input id="kA" type="number"><input id="kB" type="text"><textarea id="kC"></textarea>' +
    '<select id="kD"><option>a</option></select><input id="kE" type="checkbox"><button id="kF">x</button>';
  document.body.appendChild(box);
});

/* A keyboard coming up is the visible area shrinking (iPhone 13: 390×664). */
const KB = 300;
const keyboardUp = page => page.setViewportSize({ width: 390, height: 664 - KB });
const keyboardDown = page => page.setViewportSize({ width: 390, height: 664 });
const wait = page => page.waitForTimeout(150);

/* ---------- 1. on a phone ---------- */
{
  const { ctx, page } = await open('sreilea');
  ok('the page clips sideways overflow with clip, not a body scroll container',
    await page.evaluate(() => getComputedStyle(document.body).overflowX) === 'clip');
  await addFields(page);
  ok('the bar is there to start with', await navShown(page));
  await page.focus('#kA'); await wait(page);
  ok('a focused box with no keyboard on screen (a hardware keyboard) leaves the bar', await navShown(page));
  await keyboardUp(page); await wait(page);
  ok('the keyboard comes up for a number box: the bar steps aside', !(await navShown(page)));
  await page.focus('#kB'); await wait(page);
  ok('moving to the next box keeps it hidden, with no flash in between', !(await navShown(page)));
  await page.focus('#kC'); await wait(page);
  ok('a text area counts too', !(await navShown(page)));
  await page.focus('#kD'); await wait(page);
  ok('so does a dropdown (its picker covers the bottom too)', !(await navShown(page)));
  await keyboardDown(page); await wait(page);
  ok('the keyboard closes while the box keeps focus (Android back): the bar comes back', await navShown(page));
  await page.focus('#kB'); await keyboardUp(page); await wait(page);
  ok('and steps aside again when the keyboard reopens', !(await navShown(page)));
  await page.evaluate(() => document.activeElement.blur()); await wait(page);
  ok('done typing: the bar comes back straight away', await navShown(page));
  await keyboardDown(page); await wait(page);
  ok('and stays once the keyboard has gone', await navShown(page));
  await page.focus('#kE'); await keyboardUp(page); await wait(page);
  ok('a tick box brings no keyboard, so the bar stays', await navShown(page));
  await page.focus('#kF'); await wait(page);
  ok('nor does a button', await navShown(page));
  await keyboardDown(page); await wait(page);

  /* the field disappears under a re-render while the keyboard is up */
  await page.focus('#kB'); await keyboardUp(page); await wait(page);
  ok('(hidden while typing)', !(await navShown(page)));
  await page.evaluate(() => document.getElementById('kbTest').remove());
  await keyboardDown(page); await wait(page);
  ok('a focused field taken away by a re-render does not leave the bar hidden', await navShown(page));

  /* turned sideways: what counts as "full height" starts again */
  await page.setViewportSize({ width: 664, height: 390 }); await wait(page);
  ok('turned sideways, the bar is there', await navShown(page));
  await addFields(page); await page.focus('#kA'); await page.setViewportSize({ width: 664, height: 390 - 200 }); await wait(page);
  ok('and still steps aside for the keyboard', !(await navShown(page)));
  await page.evaluate(() => document.activeElement.blur()); await page.setViewportSize({ width: 390, height: 664 }); await wait(page);

  /* the bar still works as a bar */
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(400);
  ok('and still switches tabs', await page.$eval('nav.bottom button[data-tab="team"]', b => b.classList.contains('on')));
  await ctx.close();
}

/* ---------- 2. on a computer, nothing changes ---------- */
{
  const { ctx, page } = await open('sreilea', { desktop: true });
  await addFields(page);
  await page.focus('#kA'); await page.setViewportSize({ width: 1200, height: 500 }); await page.waitForTimeout(150);
  ok('with a mouse and a real keyboard, typing leaves the bar alone', await navShown(page));
  await ctx.close();
}

ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
