/* Choosing which habits you track, when the save does not get through.

   Reported from the base: "sometimes when I press a habit it selects another
   one." This is how. The picker writes the new list into S.habits and renders
   from it immediately, but the server only hears about it through
   saveMyHabits — and pushHabits() had no failure path at all. So a push that
   did not land left the page showing six habits the server has never heard of,
   and from there:

     · saveDaily's payload is cleaned against the CONFIG THE SERVER HOLDS
       (cleanHabitMap_), so a tap on one of the new habits is dropped in
       silence, and
     · saveDaily answers with that same old config, which the page then
       assigns over its own — so the grid changes under you and the tile that
       lights is not the one you touched.

   On a Cambodian mobile connection a dropped save is ordinary, which is why
   this reads as "sometimes". */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png' };
const srv = http.createServer(function (req, res) {
  const f = path.join(PUBLIC, req.url.split('?')[0]);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

const ME = { id: 'st1', name: 'Sokha Chan', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', photo: '',
  mentorId: '', staffType: 'ministry', country: 'Cambodia' };
const CONFIG = ['bible', 'quietTime', 'workout'];

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const browser = await chromium.launch({ executablePath: CHROMIUM });

/* The server keeps its own habit config and, like the real one, cleans every
   daily payload against it and answers with it. configSaves decides whether
   saveMyHabits is allowed to land. */
async function open(configSaveWorks) {
  let cfg = CONFIG.map(id => ({ id, mentorVisible: true }));
  let logs = [];
  const ctx = await browser.newContext(devices['iPhone 13']);
  const page = await ctx.newPage();
  await page.route('**fonts.g**', r => r.abort());
  await page.route('**/api', async function (r) {
    const b = r.request().postDataJSON() || {};
    const boot = {
      ok: true, staff: ME, profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
      roster: [ME], logs, habits: cfg, mentees: [], mentorRequests: [], goals: [], checkins: [],
      trips: { ok: true, trips: [], years: {} }, tripRequests: [],
      ministry: { ok: true, campus: ME.campus, dept: ME.dept, ministry: ME.ministry, entries: {}, daily: {}, pins: [] },
      base: { leader: false, entries: {}, okrs: [], survey: [], roster: [ME] },
    };
    if (b.fn === 'getMyBoot') { r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(boot) }); return; }
    if (b.fn === 'saveMyHabits') {
      if (!configSaveWorks) { r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' }); return; }
      cfg = (b.args[2] || []).map(h => ({ id: h.id, mentorVisible: !!h.mentorVisible }));
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, habits: cfg }) }); return;
    }
    if (b.fn === 'saveDaily') {
      /* cleanHabitMap_: only habits the server's config knows about survive */
      const sent = (b.args[3] || {}).habits || {};
      const kept = {};
      cfg.forEach(h => { if (sent[h.id] !== undefined) kept[h.id] = !!sent[h.id]; });
      const row = Object.assign({}, b.args[3], { date: b.args[2], habits: kept });
      logs = logs.filter(l => l.date !== row.date); logs.unshift(row);
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, logs, habits: cfg }) }); return;
    }
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, logs, habits: cfg }) });
  });
  await page.addInitScript(function () {
    try {
      localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
      sessionStorage.setItem('gp-skip-teams', '1');
    } catch (e) { }
  });
  await page.goto(BASE + '/teams.html', { waitUntil: 'commit' });
  await page.waitForSelector('nav.bottom button', { timeout: 20000 });
  await page.click('nav.bottom [data-tab="week"]');
  await page.waitForTimeout(1200);
  return { ctx, page, serverCfg: () => cfg.map(h => h.id) };
}

const tiles = page => page.$$eval('[data-habit]', els => els.map(e => e.getAttribute('data-habit')));
const litOnes = page => page.$$eval('[data-habit]', els =>
  els.filter(e => e.classList.contains('on')).map(e => e.getAttribute('data-habit')));

/* Add a habit through the picker and press Done. */
async function addGratitude(page) {
  await page.click('#editHabits');
  await page.waitForTimeout(400);
  await page.click('[data-hpick="gratitude"]');
  await page.waitForTimeout(300);
  await page.click('#saveHabits');
  await page.waitForTimeout(1400);
}

/* ---------- 1. the happy path still works ---------- */
console.log('\n=== THE PICKER, WHEN THE SAVE LANDS ===');
{
  const { ctx, page, serverCfg } = await open(true);
  ok('starts on the three configured habits', (await tiles(page)).join(',') === CONFIG.join(','), (await tiles(page)).join(','));
  await addGratitude(page);
  ok('the new habit is on the grid', (await tiles(page)).indexOf('gratitude') > -1, (await tiles(page)).join(','));
  ok('…and the server has it too', serverCfg().indexOf('gratitude') > -1, serverCfg().join(','));
  await page.click('[data-habit="gratitude"]');
  await page.waitForTimeout(1400);
  ok('tapping it lights it and nothing else', (await litOnes(page)).join(',') === 'gratitude', (await litOnes(page)).join(',') || '(none)');
  await ctx.close();
}

/* ---------- 2. the save does not land ---------- */
console.log('\n=== THE PICKER, WHEN THE SAVE DOES NOT ===');
{
  const { ctx, page, serverCfg } = await open(false);
  await addGratitude(page);
  const after = await tiles(page);
  ok('the page does not keep a habit list the server refused',
    after.indexOf('gratitude') === -1, after.join(','));
  ok('…and it still matches what the server holds',
    after.join(',') === serverCfg().join(','), after.join(',') + '  vs server ' + serverCfg().join(','));

  /* The symptom itself. Whatever the grid is showing, press its last tile: the
     tap lights it locally, then the daily save answers with the server's own
     config — and if the page is holding a list the server refused, that answer
     takes the tile away from under the finger. The next press lands on whatever
     slid into its place, which is what "it selects another one" is. */
  const before = await tiles(page);
  const target = before[before.length - 1];
  await page.click('[data-habit="' + target + '"]');
  await page.waitForTimeout(1500);
  const after2 = await tiles(page);
  ok('the tile you pressed is still there afterwards', after2.indexOf(target) > -1,
    'pressed ' + target + ', grid now ' + after2.join(','));
  ok('…and it is the one that is lit', (await litOnes(page)).join(',') === target,
    'lit ' + ((await litOnes(page)).join(',') || '(none)'));
  ok('…and the grid did not change under you', after2.join(',') === before.join(','),
    before.join(',') + ' -> ' + after2.join(','));
  await ctx.close();
}

/* ---------- 3. the two default lists, which are hand-written twice ---------- */
/* A brand-new account has no stored config, so BOTH sides fall back to a default
   — myHabits() in teams.html and DEFAULT_HABITS in api.js. If those two ever
   disagree, every new account's grid draws a habit the server will clean away,
   which is the bug above with nobody having touched the picker at all. Same for
   the cap: the picker refuses a seventh, and so must the server. */
console.log('\n=== THE TWO COPIES OF THE DEFAULT ===');
{
  const page = fs.readFileSync(path.join(PUBLIC, 'teams.html'), 'utf8');
  const api = fs.readFileSync(path.join(PUBLIC, '..', 'netlify', 'functions', 'api.js'), 'utf8');
  const ids = src => (src.match(/id: *'([a-zA-Z]+)'|id:'([a-zA-Z]+)'/g) || []);
  const pageDefault = (page.match(/function myHabits\(\)[\s\S]*?\n}/) || [''])[0];
  const apiDefault = (api.match(/const DEFAULT_HABITS = \[[\s\S]*?\];/) || [''])[0];
  const pull = t => (t.match(/id: *'([a-zA-Z]+)'/g) || []).map(m => m.replace(/id: *'|'/g, ''));
  const a = pull(pageDefault), b = pull(apiDefault);
  ok('the default habit list is the same on both sides', a.length > 0 && a.join(',') === b.join(','),
    'teams.html ' + (a.join(',') || '(none found)') + '  |  api.js ' + (b.join(',') || '(none found)'));
  const pageMax = (page.match(/var MAX_HABITS *= *(\d+)/) || [])[1];
  const apiMax = (api.match(/const MAX_HABITS *= *(\d+)/) || [])[1];
  ok('and so is the cap on how many you may pick', pageMax && pageMax === apiMax,
    'teams.html ' + pageMax + '  |  api.js ' + apiMax);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
srv.close();
process.exit(fail ? 1 : 0);
