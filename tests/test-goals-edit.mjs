/* Weekly Goals: "can you make it so when you input your weekly goals, you
   can go back and edit it." Before this, a goal's wording was fixed the
   moment it was typed — the only way to change it was to delete it (losing
   its progress % and KPI link) and add a new one from scratch. This adds an
   inline edit — a pencil button turns the goal's text into a text box, Save
   writes the new wording back with everything else on the goal untouched,
   Cancel discards it. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

const ME = { id: 'st1', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', photo: '', mentorId: '', staffType: 'campus', country: 'Cambodia' };
const NOWWK = (() => { const y = new Date().getFullYear(), j = new Date(y, 0, 1);
  const m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((new Date() - m) / (7 * 86400000)) + 1)); })();
let GOALS = [{ week: NOWWK, pct: 40, updated: '', items: [
  { text: 'Disciple two students', pct: 40, done: false, metricKey: '' },
] }];
let lastSaveGoalsPayload = null;

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4403, r));

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
page.on('pageerror', x => errors.push('PAGEERROR ' + x));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await page.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}');
  let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: [ME],
    logs: [], habits: null, mentees: [], mentorRequests: [], goals: GOALS, checkins: [],
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false },
    tripRequests: [], ministry: null, base: { entries: {}, okrs: [], survey: [] } };
  else if (b.fn === 'saveGoals') {
    lastSaveGoalsPayload = b.args[3];
    GOALS = GOALS.filter(g => Number(g.week) !== Number(b.args[2])).concat([
      { week: Number(b.args[2]), pct: 0, updated: '', items: b.args[3] }]);
    out = { ok: true, goals: GOALS };
  }
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
await page.goto('http://localhost:4403/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(1000);
await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(700);

console.log('=== WEEKLY GOALS: EDIT TEXT ===');
ok('goal text shows', await page.$eval('.wgText', el => el.textContent.trim()) === 'Disciple two students');
ok('no edit box yet', await page.evaluate(() => !document.getElementById('editGoalText')));

await page.click('[data-goaledit="0"]');
await page.waitForTimeout(400);
ok('edit box appears, prefilled', await page.$eval('#editGoalText', el => el.value) === 'Disciple two students');
ok('Mark Complete/Remove hidden while editing',
  await page.evaluate(() => !document.querySelector('[data-goalcomplete="0"]') && !document.querySelector('[data-goalremove="0"]')));
ok('Save/Cancel shown while editing',
  await page.evaluate(() => !!document.querySelector('[data-goaleditsave="0"]') && !!document.querySelector('[data-goaleditcancel="0"]')));

// cancel discards the change
await page.fill('#editGoalText', 'something I changed my mind about');
await page.click('[data-goaleditcancel="0"]');
await page.waitForTimeout(400);
ok('cancel leaves the original text on screen',
  await page.$eval('.wgText', el => el.textContent.trim()) === 'Disciple two students');
ok('cancel did not call saveGoals', lastSaveGoalsPayload === null);

// edit again, this time save
await page.click('[data-goaledit="0"]');
await page.waitForTimeout(400);
await page.fill('#editGoalText', 'Disciple three students now');
await page.click('[data-goaleditsave="0"]');
await page.waitForTimeout(700);

ok('save sent the new wording', lastSaveGoalsPayload && lastSaveGoalsPayload[0].text === 'Disciple three students now',
  lastSaveGoalsPayload && lastSaveGoalsPayload[0].text);
ok('save preserved the existing progress (not reset to 0)', lastSaveGoalsPayload && lastSaveGoalsPayload[0].pct === 40,
  lastSaveGoalsPayload && lastSaveGoalsPayload[0].pct);
ok('edit box closed after save', await page.evaluate(() => !document.getElementById('editGoalText')));
ok('new wording shows on screen', await page.$eval('.wgText', el => el.textContent.trim()) === 'Disciple three students now');
ok('progress % still shown correctly', await page.$eval('.wgPct', el => el.textContent.trim()).then(t => /40%/.test(t)));

console.log('\nERRORS: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail || errors.length ? 1 : 0);
