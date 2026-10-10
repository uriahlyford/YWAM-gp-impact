/* Books read on your account, and the papers every staff member signs — on the page, on the real backend: in the menu; the books load
   only when it opens; the home is swipeable rows (Start here, each shelf, See all)
   of tiles with drawn covers — one series look, nothing fetched, neighbours never
   the same pattern; a book page has every part; the reader goes one key idea per
   screen (Next, swipe, Close keeps your place, Continue reading, Done marks it
   read); Khmer at 320px; a failed load offers Try again. */
import vm from 'node:vm';
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('required-ui');
const OUT = tmpDir('required-ui-out');
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
  mk({ id: 'st1', name: 'Dara Sok', username: 'dara', email: 'd@e.com', libRead: { 'atomic-habits': '2026-10-01', 'grit': '2026-10-02' } }),
  mk({ id: 'st2', name: 'Emma Hill', username: 'emma', email: 'e@e.com' }),
  mk({ id: 'st3', name: 'Uriah Lyford', username: 'uriah', email: 'u@e.com', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true })
];
const PDF64 = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF').toString('base64');
mem.reqDocs = [
  { id: 'rd_cpp', title: 'Child Protection Policy', fileId: 'rf_cpp', fileName: 'cpp.pdf', mime: 'application/pdf', size: 900, version: 1, updated: '2026-10-01T00:00:00Z', order: 0 },
  { id: 'rd_man', title: 'Staff Manual', url: 'https://drive.example.org/manual', version: 1, updated: '2026-10-01T00:00:00Z', order: 1 }
];
mem['reqfile:rf_cpp'] = { id: 'rf_cpp', docId: 'rd_cpp', name: 'cpp.pdf', mime: 'application/pdf', data: PDF64 };
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
  const ctx = await browser.newContext(opts.small ? { viewport: { width: 320, height: 700 }, hasTouch: true, timezoneId: 'Asia/Phnom_Penh' } : { ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(a => {
    localStorage.setItem('gp-staff', JSON.stringify({ user: a.u, pin: '1234' }));
    if (a.km) localStorage.setItem('gp-lang', 'km');
    window.__opened = []; window.open = function (u) { window.__opened.push(String(u)); return null; };
  }, { u: user, km: !!opts.km });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]');
  await page.waitForTimeout(500);
  return { ctx, page };
}
const dara = () => mem.staff.find(s => s.id === 'st1');
async function draw(page, sel) {
  await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(100);
  const b = await page.$eval(sel, e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await page.mouse.move(b.x + 20, b.y + b.h * 0.6); await page.mouse.down();
  for (let i = 1; i <= 24; i++) await page.mouse.move(b.x + 20 + i * (b.w - 60) / 24, b.y + b.h * (0.6 + 0.25 * Math.sin(i / 2)));
  await page.mouse.up();
}

/* the papers are in My contract (☰ menu) */
async function goMyc(page) {
  await page.click('#menuBtn'); await page.waitForTimeout(350);
  await page.click('[data-menu-item="mycontract"]'); await page.waitForSelector('#reqCard', { timeout: 8000 });
}
{
  const { ctx, page } = await open('dara');
  ok('My Home has no "Finish your profile" card any more', !(await page.$('#reqCard')) && !/Finish your profile/.test(await page.$eval('#main', e => e.innerText)));
  await goMyc(page);
  ok('it is in My contract (☰): 0 of 4 done, with the two papers to read and sign', /Finish your profile/.test(await page.$eval('#reqCard', e => e.innerText)) && /0[^\d]+4/.test(await page.$eval('#reqCard', e => e.innerText)) && (await page.$$('#reqCard .reqRow')).length === 2 && /Child Protection Policy/.test(await page.$eval('#reqCard', e => e.innerText)) && /Staff Manual/.test(await page.$eval('#reqCard', e => e.innerText)));
  ok('… the Child Protection Agreement and the contract further down the same page', /Child Protection Agreement/.test(await page.$eval('#mycLegal', e => e.innerText)) && /No contract on file yet/.test(await page.$eval('#main', e => e.innerText)));
  await page.click('#mycBack'); await page.waitForSelector('#libHomeTile');
  ok('About me has the Library with the books read, from the account', /2 books read/.test(await page.$eval('#libHomeTile', e => e.innerText)));
  await page.screenshot({ path: OUT + '/home.png' });
  await page.click('#libHomeTile'); await page.waitForTimeout(900);
  ok('tapping it opens the Library', await page.evaluate(() => S.view === 'library') && /\b2\s*\/\s*\d+\s*read/.test(await page.$eval('.libProgress', e => e.innerText)));
  await page.click('.libRow [data-libbook="deep-work"]'); await page.waitForTimeout(300);
  await page.click('#libMarkRead'); await page.waitForTimeout(900);
  ok('marking a book read saves it on the account', !!dara().libRead['deep-work'] && Object.keys(dara().libRead).length === 3);
  await page.click('#libMarkRead'); await page.waitForTimeout(900);
  ok('… and unmarking takes it off again', !dara().libRead['deep-work']);

  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(300);
  if (!(await page.$('#reqCard'))) await goMyc(page);
  await page.click('#reqCard [data-reqopen="rd_cpp"]'); await page.waitForTimeout(300);
  ok('a paper opens on its own page, with signing locked until it is read', await page.evaluate(() => S.view === 'required') && await page.$eval('#reqAgree', e => e.disabled) && /Child Protection Policy/.test(await page.$eval('#main h2', e => e.innerText)));
  await page.click('#reqSignBtn'); await page.waitForTimeout(100);
  ok('… "Sign" says what is missing', /Open the document first/.test(await page.$eval('#reqSignHint', e => e.innerText)));
  const pop = ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null);
  await page.click('#reqRead'); await page.waitForTimeout(800);
  const opened = await pop; if (opened) await opened.close();
  ok('opening the PDF unlocks the rest', !(await page.$eval('#reqAgree', e => e.disabled)));
  await page.click('#reqSignBtn'); await page.waitForTimeout(100);
  ok('… the box must be ticked', /Tick the box/.test(await page.$eval('#reqSignHint', e => e.innerText)));
  await page.check('#reqAgree'); await page.fill('#reqName', 'Dara Sok');
  await page.click('#reqSignBtn'); await page.waitForTimeout(100);
  ok('… and a signature drawn', /Draw your signature/.test(await page.$eval('#reqSignHint', e => e.innerText)));
  await draw(page, '#reqSigPad'); await page.waitForTimeout(150);
  ok('drawing hides the "sign here" hint', await page.$eval('#reqSigHint', e => e.style.display === 'none'));
  await page.screenshot({ path: OUT + '/sign.png', fullPage: true });
  await page.click('#reqSignBtn'); await page.waitForTimeout(1200);
  ok('signed: the page says so, and the account has it', /You signed this on/.test(await page.$eval('#main', e => e.innerText)) && dara().signed && dara().signed.rd_cpp && dara().signed.rd_cpp.name === 'Dara Sok' && !!mem['reqsig:rd_cpp:st1']);
  await page.click('#reqMine'); await page.waitForTimeout(800);
  ok('… and you can see your own signature', !!(await page.$('#reqMineBox .sigShow img')));
  await page.click('#reqBack'); await page.waitForSelector('#reqCard');
  ok('back to My contract: 1 of 4 now, and the paper shows as signed', /1[^\d]+4/.test(await page.$eval('#reqCard', e => e.innerText)) && !!(await page.$('#reqCard .reqRow.done')));
  await page.click('#reqCard [data-reqopen="rd_man"]'); await page.waitForTimeout(300);
  await page.click('#reqRead'); await page.waitForTimeout(300);
  ok('a paper that is a link opens the link', (await page.evaluate(() => window.__opened)).indexOf('https://drive.example.org/manual') > -1);
  await page.check('#reqAgree'); await page.fill('#reqName', 'Dara Sok'); await draw(page, '#reqSigPad');
  await page.click('#reqSignBtn'); await page.waitForTimeout(1200);
  await page.click('#reqBack'); await page.waitForSelector('#reqCard');
  ok('both papers signed — the Child Protection Agreement and the contract are left', /2[^\d]+4/.test(await page.$eval('#reqCard', e => e.innerText)) && !!dara().signed.rd_man);
  await page.click('#menuBtn'); await page.waitForTimeout(250); await page.click('[data-menu-item="profile"]'); await page.waitForTimeout(400);
  ok('My profile: the books read, and "Profile unfinished"', /2 books read/.test(await page.$eval('#profBooks', e => e.innerText)) && /Profile unfinished/.test(await page.$eval('#main', e => e.innerText)));
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const { ctx, page } = await open('emma');
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(500);
  await page.click('[data-person="st1"]'); await page.waitForTimeout(800);
  const txt = await page.$eval('#main', e => e.innerText);
  ok('a teammate sees how many books Dara has read', /2 books read/.test(txt));
  ok('… but not whether her profile is finished', !/Profile unfinished|Profile complete/.test(txt));
  await page.click('#personBooks'); await page.waitForTimeout(700);
  ok('… and tapping the count opens the Library', await page.evaluate(() => S.view === 'library'));
  await ctx.close();
}
{
  const { ctx, page } = await open('uriah');
  await page.click('nav.bottom button[data-tab="team"]'); await page.waitForTimeout(500);
  await page.click('[data-person="st1"]'); await page.waitForTimeout(800);
  ok('an admin sees "Profile unfinished" on her profile', /Profile unfinished/.test(await page.$eval('#main', e => e.innerText)) && !!(await page.$('.reqAlert')));
  await page.click('.reqAlert [data-reqsigof^="rd_cpp|"]'); await page.waitForTimeout(800);
  ok('… and can open her signature', !!(await page.$('.reqSigBox .sigShow img')) && /Dara Sok/.test(await page.$eval('.reqSigBox', e => e.innerText)));
  await page.screenshot({ path: OUT + '/person-admin.png', fullPage: true });
  await page.click('#menuBtn'); await page.waitForTimeout(250); await page.click('[data-menu-item="hr"]'); await page.waitForTimeout(900);
  await page.click('[data-hrtab="docs"]'); await page.waitForTimeout(1200);
  let txt = await page.$eval('#main', e => e.innerText);
  ok('HR → Required lists the papers, with how many have signed', /Child Protection Policy/.test(txt) && /Staff Manual/.test(txt) && /1 of 3 signed/.test(txt));
  ok('… and who is unfinished — everyone, while no contracts are on file', /Unfinished \(3\)/.test(txt) && (await page.$$('[data-reqperson]')).length === 3);
  await page.fill('#reqNewTitle', 'Code of Conduct'); await page.click('#reqNewAdd'); await page.waitForTimeout(1200);
  txt = await page.$eval('#main', e => e.innerText);
  ok('adding a paper: it waits for its file', /Code of Conduct/.test(txt) && /No file yet/.test(txt));
  const id = mem.reqDocs.find(d => d.title === 'Code of Conduct').id;
  await page.setInputFiles('[data-requpload="' + id + '"]', { name: 'conduct.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 conduct') });
  await page.waitForTimeout(1500);
  ok('… uploading the PDF puts it on everyone’s list', !!mem.reqDocs.find(d => d.id === id).fileId && /conduct\.pdf/.test(await page.$eval('#main', e => e.innerText)));
  await page.click('[data-reqperson="st1"]'); await page.waitForTimeout(300);
  ok('opening a person shows their list', (await page.$$('.reqPersonRows .reqRow')).length === 5);
  await page.screenshot({ path: OUT + '/hr.png', fullPage: true });
  ok('nothing scrolls sideways', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
{
  const { ctx, page } = await open('emma', { small: true, km: true });
  await goMyc(page);
  ok('in Khmer at 320px the card is Khmer and fits', /បំពេញប្រវត្តិរូប/.test(await page.$eval('#reqCard', e => e.innerText)) && await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await page.click('#reqCard [data-reqopen="rd_cpp"]'); await page.waitForTimeout(300);
  ok('… and so does the page for a paper', await page.evaluate(() => document.documentElement.scrollWidth <= 321));
  await ctx.close();
}
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
