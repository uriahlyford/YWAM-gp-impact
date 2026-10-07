/* Habits with a schedule (Oct 2026): each habit is due every day, on weekdays
   or on the days you pick; you can add your own with a label and an emoji;
   the card asks only about what is due today and a streak counts the due
   days alone; ticking a tile pops confetti. Server rules first, then the page
   on the real backend in a phone-sized window. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('habit-schedule');
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
mem.staff = [mk({ id: 'me', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' })];

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}

/* ---------- 1. the server keeps a schedule and your own habits ---------- */
let r = await call('saveMyHabits', ['sreilea', '1234', [
  { id: 'bible', mentorVisible: true, days: [5, 1, 3, 3, 'x', 9] },
  { id: 'workout', mentorVisible: true, days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'quietTime', mentorVisible: false, days: 'daily' },
  { id: 'c_journal1', mentorVisible: true, label: 'Journal', icon: '📓', days: [2] },
  { id: 'c_noicon', mentorVisible: true, label: 'Call home' },
  { id: 'c_nolabel', mentorVisible: true },
  { id: 'c_BAD ID', mentorVisible: true, label: 'x' },
  { id: 'madeUp', mentorVisible: true }
]]);
const cfg = (r.body && r.body.habits) || [];
const by = id => cfg.filter(h => h.id === id)[0];
ok('days are kept sorted, deduped and in range', by('bible') && JSON.stringify(by('bible').days) === '[1,3,5]', JSON.stringify(by('bible')));
ok('all seven days means every day — no days stored', by('workout') && !('days' in by('workout')));
ok('junk for days means every day too', by('quietTime') && !('days' in by('quietTime')) && by('quietTime').mentorVisible === false);
ok('a habit of your own keeps its label, emoji and days', by('c_journal1') && by('c_journal1').label === 'Journal' && by('c_journal1').icon === '📓' && JSON.stringify(by('c_journal1').days) === '[2]');
ok('… with a star when no emoji was given', by('c_noicon') && by('c_noicon').icon === '⭐');
ok('one of your own needs a label; a bad id or an unknown library id is dropped', !by('c_nolabel') && !by('c_BAD ID') && !by('madeUp') && cfg.length === 5, cfg.map(h => h.id).join());
r = await call('saveMyHabits', ['sreilea', '1234', Array.from({ length: 12 }, (_, i) => ({ id: 'c_h' + i, label: 'H' + i }))]);
ok('eight habits at most', r.body && r.body.habits.length === 8);
await call('saveMyHabits', ['sreilea', '1234', [{ id: 'bible', mentorVisible: true }, { id: 'c_journal1', mentorVisible: true, label: 'Journal', icon: '📓', days: [2] }]]);
r = await call('saveDaily', ['sreilea', '1234', '2026-10-06', { habits: { bible: true, c_journal1: true, workout: true } }]);
const day = r.body && r.body.logs && r.body.logs.filter(l => l.date === '2026-10-06')[0];
ok('a tick on your own habit is kept; one on a habit you no longer track is not', day && day.habits.c_journal1 === true && day.habits.bible === true && day.habits.workout === undefined, JSON.stringify(day && day.habits));

/* ---------- 2. the page ---------- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer(async (req, res) => {
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let b = ''; for await (const c of req) b += c;
    const rr = await api.default({ method: 'POST', json: async () => JSON.parse(b || '{}'), headers: new Map() }, {});
    const t = await rr.text(); res.writeHead(rr.status || 200, { 'Content-Type': 'application/json' }); res.end(t); return;
  }
  let u = req.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(PUBLIC, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;
const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
const text = async (page, sel) => page.$eval(sel, e => e.innerText.replace(/\s+/g, ' ').trim());

// Phnom Penh is UTC+7; the page's "today" is the browser's local date.
const NOW = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const DOW = new Date(NOW + 'T00:00:00Z').getUTCDay(), OTHER = (DOW + 3) % 7;
mem.staff[0].habits = [
  { id: 'bible', mentorVisible: true },
  { id: 'workout', mentorVisible: true, days: [DOW] },
  { id: 'language', mentorVisible: true, days: [OTHER] }
];
mem.dailyLogs = [
  { staffId: 'me', date: addDays(NOW, -7), week: 1, habits: { workout: true, bible: true } },
  { staffId: 'me', date: addDays(NOW, -14), week: 1, habits: { workout: true } },
  { staffId: 'me', date: addDays(NOW, -1), week: 1, habits: { bible: true } }
];
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sreilea', pin: '1234' })));
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]'); await page.waitForTimeout(600);

  const tiles = await page.$$eval('[data-habit]', es => es.map(e => e.getAttribute('data-habit')));
  ok('the card shows only what is due today — the daily one and today’s', tiles.join() === 'bible,workout', tiles.join());
  ok('… and says how many more sit on other days', /1 more on other days/.test(await text(page, '#habitShowRest')));
  await page.click('#habitShowRest'); await page.waitForTimeout(200);
  ok('… which open with their schedule', /Language study/.test(await text(page, '.habitRestList')) && /Every (Sun|Mon|Tue|Wed|Thu|Fri|Sat)/.test(await text(page, '.habitRestList')), await text(page, '.habitRestList'));
  ok('the summary card counts today’s habits only', /Habits Today 0\/2/.test(await text(page, '.myHero')));
  ok('a weekly habit’s streak counts its own days — two weeks running', /🔥 2/.test(await text(page, '[data-habit="workout"]')), await text(page, '[data-habit="workout"]'));
  ok('the daily one’s streak is as before — yesterday, then the gap', /🔥 1/.test(await text(page, '[data-habit="bible"]')), await text(page, '[data-habit="bible"]'));
  ok('the section is headed Habits', (await page.$$eval('#main h3', hs => hs.map(h => h.innerText.trim()))).indexOf('✅ Habits') > -1);

  /* confetti */
  await page.click('[data-habit="workout"]');
  await page.waitForTimeout(80);
  const bits = await page.$$eval('.confettiBit', es => es.length);
  ok('ticking a habit pops confetti out of the tile', bits === 16 && await page.$eval('[data-habit="workout"]', e => e.classList.contains('on')), bits + ' bits');
  await page.waitForTimeout(1200);
  ok('… which cleans itself up', (await page.$$eval('.confettiBit', es => es.length)) === 0);
  await page.click('[data-habit="workout"]'); await page.waitForTimeout(80);
  ok('unticking pops none', (await page.$$eval('.confettiBit', es => es.length)) === 0);
  await page.waitForTimeout(700);

  /* the picker */
  await page.click('#editHabits'); await page.waitForTimeout(300);
  ok('Choose my habits: each chosen habit shows when it is due', /Every day/.test(await text(page, '.habitPick.on:has([data-hpick="bible"]) .hpSched')) &&
    /Every (Sun|Mon|Tue|Wed|Thu|Fri|Sat)/.test(await text(page, '.habitPick.on:has([data-hpick="workout"]) .hpSched')));
  ok('… with Every day / Weekdays / Pick days under it', (await page.$$eval('[data-hpdays^="bible|"]', bs => bs.map(b => b.innerText))).join() === 'Every day,Weekdays,Pick days');
  await page.click('[data-hpdays="bible|weekdays"]'); await page.waitForTimeout(200);
  ok('Weekdays sets Monday to Friday', /Weekdays/.test(await text(page, '.habitPick.on:has([data-hpick="bible"]) .hpSched')) && await page.evaluate(() => JSON.stringify(myHabits()[0].days) === '[1,2,3,4,5]'));
  ok('Pick days shows the seven days with the chosen ones lit', (await page.$$eval('[data-hpday^="workout|"]', bs => bs.length)) === 7 &&
    (await page.$$eval('[data-hpday^="workout|"].on', bs => bs.length)) === 1);
  await page.click('[data-hpday="workout|' + OTHER + '"]'); await page.waitForTimeout(200);
  ok('tapping a day adds it', await page.evaluate(d => myHabits()[1].days.length === 2 && myHabits()[1].days.indexOf(d) > -1, OTHER));
  await page.click('[data-hpday="workout|' + OTHER + '"]'); await page.waitForTimeout(200);
  await page.click('[data-hpday="workout|' + DOW + '"]'); await page.waitForTimeout(200);
  ok('… but the last day stays', await page.evaluate(d => myHabits()[1].days.length === 1 && myHabits()[1].days[0] === d, DOW));
  /* one of your own */
  await page.fill('#habitNewIcon', '📓'); await page.fill('#habitNewLabel', 'Journal'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  ok('Add your own puts it under Your own, every day', /your own/i.test(await text(page, '#main')) && /📓 Journal/.test(await text(page, '#main')) &&
    await page.evaluate(() => myHabits().some(h => /^c_/.test(h.id) && h.label === 'Journal' && h.icon === '📓' && !h.days)));
  await page.click('#saveHabits'); await page.waitForTimeout(800);
  const saved = mem.staff[0].habits;
  ok('Done saves the schedules and the new habit to the server', JSON.stringify(saved.filter(h => h.id === 'bible')[0].days) === '[1,2,3,4,5]' &&
    saved.some(h => h.label === 'Journal' && h.icon === '📓'), JSON.stringify(saved));
  ok('… and the new habit is on the card, due today', (await page.$$eval('[data-habit]', es => es.map(e => e.getAttribute('data-habit')))).some(id => /^c_/.test(id)) &&
    /📓 Journal/.test(await text(page, '.habitGrid')));

  /* the hero's time-off row and the goals head */
  const hero = await text(page, '.myHero');
  ok('the summary card says Personal days off left, with a Request time off button', /PERSONAL DAYS OFF LEFT 30/.test(hero) && /Request time off/.test(await text(page, '#goLeaveFromMe')));
  await page.click('#goLeaveFromMe'); await page.waitForTimeout(300);
  ok('… which opens the Leave page', await page.evaluate(() => S.view === 'leave'));
  await page.click('#leaveBack'); await page.waitForTimeout(300);
  const goalsHead = await text(page, '#sec-goals + .card .goalCardHead');
  ok('Weekly Goals is headed by the week you are in, dates beside it', /^Week \d+ /.test(goalsHead), goalsHead);
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
