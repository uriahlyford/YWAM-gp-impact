/* The Library read aloud: 🎧 on a book page and in the reader. A stand-in for the
   phone's voice (speechSynthesis) records what is read: the screen's own words in
   order, the paragraph being read lit up, the page turned by itself at the end of a
   step and stopped at the final summary; ⏸ stops; the speed is kept; leaving the
   reader stops the voice; a Khmer book with no Khmer voice says so; with a Khmer
   voice it reads Khmer. */
import vm from 'node:vm';
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('library-audio-ui');
const OUT = tmpDir('library-audio-ui-out');
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
mem.staff = [ mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }) ];
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
/* The phone's voice, stood in for: every utterance is recorded and "spoken" in 30ms. */
const FAKE = (opts) => {
  window.__spoken = []; window.__cancels = 0;
  const voices = [{ name: 'Samantha', lang: 'en-US', localService: true }].concat(opts.km ? [{ name: 'Khmer', lang: 'km-KH', localService: true }] : []);
  let q = [], busy = false, timer = null;
  const run = () => { if (busy || !q.length) return; busy = true; const u = q.shift(); window.__spoken.push({ text: u.text, lang: u.lang, rate: u.rate, voice: u.voice && u.voice.name });
    timer = setTimeout(() => { busy = false; u.onend && u.onend({}); run(); }, 30); };
  window.SpeechSynthesisUtterance = function (text) { this.text = text; this.lang = ''; this.rate = 1; this.voice = null; };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => voices, speak: (u) => { q.push(u); run(); }, cancel: () => { window.__cancels++; q = []; if (timer) clearTimeout(timer); busy = false; },
    get speaking() { return busy; }, get pending() { return q.length > 0; }, addEventListener() {} } });
};
async function open(user, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(FAKE, { km: !!opts.kmVoice });
  await page.addInitScript(a => { localStorage.setItem('gp-staff', JSON.stringify({ user: a.u, pin: '1234' })); if (a.lib) localStorage.setItem('gp-lib-lang', a.lib); }, { u: user, lib: opts.lib || '' });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom [data-tab="library"]'); await page.waitForTimeout(900);
  return { ctx, page };
}
const C = {}; vm.createContext(C); vm.runInContext(fs.readFileSync(PUBLIC + '/library.js', 'utf8') + ';this.L=GP_LIBRARY;', C);
const B = C.L.books.find(b => b.id === 'start-with-why'), N = B.insights.length;
const spoken = p => p.evaluate(() => window.__spoken.map(x => x.text).join(' '));
const step = p => p.evaluate(() => S.libStep);
{
  const { ctx, page } = await open('sreilea');
  await page.click('[data-libbook="start-with-why"]'); await page.waitForTimeout(500);
  ok('a book page has 🎧 Listen next to Start reading', !!(await page.$('#libListenStart')));
  await page.click('#libListenStart'); await page.waitForTimeout(250);
  ok('Listen opens the reader at the intro and starts reading it', await step(page) === 0 && /Intro/i.test(await spoken(page)) && (await spoken(page)).includes(B.vibe.slice(0, 20)));
  ok('… the paragraph being read is lit up', !!(await page.$('.libReaderBody .libSpeaking')));
  ok('… with ⏸ and the speed in the reader’s top bar', /⏸/.test(await page.$eval('#libListen', e => e.textContent)) && /1×/.test(await page.$eval('#libRate', e => e.textContent)));
  await page.waitForFunction(() => S.libStep === 1, null, { timeout: 15000 });
  ok('at the end of a step it turns the page by itself', true);
  await page.waitForTimeout(400);
  ok('… and reads key idea 1, its title first', (await spoken(page)).includes(B.insights[0].title) && /Key idea 1 of/i.test(await spoken(page)));
  ok('long paragraphs go in sentence-sized pieces', await page.evaluate(() => window.__spoken.every(x => x.text.length <= 400)));
  await page.click('#libRate'); await page.waitForTimeout(150);
  ok('the speed button steps up, and is kept on the phone', /1\.25×/.test(await page.$eval('#libRate', e => e.textContent)) && await page.evaluate(() => localStorage.getItem('gp-lib-rate')) === '1.25' &&
    await page.evaluate(() => window.__spoken[window.__spoken.length - 1].rate) === 1.25);
  await page.click('#libListen'); await page.waitForTimeout(200);
  const n = await page.evaluate(() => window.__spoken.length);
  await page.waitForTimeout(400);
  ok('⏸ stops the voice', await page.evaluate(() => window.__spoken.length) === n && !(await page.$('.libSpeaking')) && /🎧/.test(await page.$eval('#libListen', e => e.textContent)));
  await page.click('#libNext'); await page.waitForTimeout(300);
  ok('… and stays quiet while you read on by hand', await page.evaluate(() => window.__spoken.length) === n);
  await page.click('#libListen'); await page.waitForTimeout(200);
  await page.click('#libNext'); await page.waitForTimeout(300);
  ok('Next while listening reads the new step', await step(page) === 3 && (await spoken(page)).includes(B.insights[2].title));
  await page.evaluate(n => libGo_(n), N + 1); await page.waitForTimeout(200);
  await page.waitForFunction(() => !LIBA.on, null, { timeout: 15000 });
  ok('the final summary is read, then it stops there', await step(page) === N + 1 && (await spoken(page)).includes(B.oneLine.slice(0, 20)) && !!(await page.$('#libFinish')));
  await page.click('#libListen'); await page.waitForTimeout(150);
  const c0 = await page.evaluate(() => window.__cancels);
  await page.click('#libClose'); await page.waitForTimeout(300);
  ok('closing the reader stops the voice', await page.evaluate(() => !LIBA.on) && await page.evaluate(() => window.__cancels) > c0);
  await page.screenshot({ path: OUT + '/book-listen.png' });
  await ctx.close();
}
{
  const { ctx, page } = await open('sreilea', { lib: 'km' });
  await page.click('[data-libbook="start-with-why"]'); await page.waitForTimeout(1500);
  await page.click('#libListenStart'); await page.waitForTimeout(400);
  ok('a Khmer book on a phone with no Khmer voice says so, and reads nothing in English', await page.evaluate(() => window.__spoken.length) === 0 && /Khmer voice/.test(await page.$eval('#msg', e => e.textContent)));
  await ctx.close();
}
{
  const { ctx, page } = await open('sreilea', { lib: 'km', kmVoice: true });
  await page.click('[data-libbook="start-with-why"]'); await page.waitForTimeout(1500);
  await page.click('#libListenStart'); await page.waitForTimeout(400);
  const s0 = await page.evaluate(() => window.__spoken[1] || {});
  ok('with a Khmer voice it reads the Khmer, in Khmer', s0.lang === 'km-KH' && s0.voice === 'Khmer' && /[ក-៿]/.test(s0.text || ''), JSON.stringify(s0).slice(0, 120));
  await page.screenshot({ path: OUT + '/reader-listen-km.png' });
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
