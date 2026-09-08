/* "I want the app to have an offline mode... whatever edits or changes...
   when your phone does connect to the internet, it'll make the changes."

   Scoped to the two things asked for by name: the weekly health check-in
   and Weekly Goals (every action there — add, remove, mark complete, drag
   the slider, link a KPI, edit the wording — shares one save path, so
   queueing it once covers all of them). Every other save in the app still
   just fails on a bad connection, same as before.

   Uses Playwright's real offline emulation (context.setOffline), not a
   mocked failure — navigator.onLine and the network layer both actually
   go dark, the same as the "no bars" scenario being described. */
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
let GOALS = [{ week: NOWWK, pct: 0, updated: '', items: [{ text: 'Disciple two students', pct: 0, done: false, metricKey: '' }] }];
let CHECKINS = [];
let saveGoalsCalls = 0, saveMyWeekCalls = 0;

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4404, r));

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 400, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', x => errors.push('PAGEERROR ' + x));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CONNECTION|ERR_INTERNET_DISCONNECTED/.test(m.text())) errors.push('console: ' + m.text()); });
// context-scoped (not page-scoped), so it still applies to the second page
// opened later to simulate the app being closed and reopened
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}');
  let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: [ME],
    logs: [], habits: null, mentees: [], mentorRequests: [], goals: GOALS, checkins: CHECKINS,
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false },
    tripRequests: [], ministry: null, base: { entries: {}, okrs: [], survey: [] } };
  else if (b.fn === 'saveGoals') {
    saveGoalsCalls++;
    const [, , wk, items] = b.args;
    GOALS = GOALS.filter(g => Number(g.week) !== Number(wk)).concat([{ week: Number(wk), pct: 50, updated: '', items }]);
    out = { ok: true, goals: GOALS };
  }
  else if (b.fn === 'saveMyWeek') {
    saveMyWeekCalls++;
    const [, , wk, payload] = b.args;
    CHECKINS = CHECKINS.filter(c => Number(c.week) !== Number(wk))
      .concat([{ week: Number(wk), source: 'weekly', ...payload }]);
    out = { ok: true, checkins: CHECKINS };
  }
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
await page.goto('http://localhost:4404/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(1000);
await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(700);

console.log('=== OFFLINE: WEEKLY GOALS ===');
await ctx.setOffline(true);
await page.click('[data-goalcomplete="0"]');
await page.waitForTimeout(600);

ok('marking complete while offline updates the screen anyway', await page.$eval('.wgPct', el => el.textContent.trim()).then(t => /100%/.test(t)));
ok('the save did NOT reach the (offline) server', saveGoalsCalls === 0);
const queueAfterGoals = await page.evaluate(() => JSON.parse(localStorage.getItem('gp-offline-queue') || '[]'));
ok('the write is queued in localStorage', queueAfterGoals.length === 1 && queueAfterGoals[0].fn === 'saveGoals', JSON.stringify(queueAfterGoals));
ok('a banner says it is saved locally, not lost', await page.evaluate(() => document.body.innerText.includes('back online')));

console.log('\n=== OFFLINE: WEEKLY HEALTH CHECK-IN ===');
await page.click('nav.bottom [data-tab="health"]');
await page.waitForTimeout(500);
await page.evaluate((wk) => { S.healthWeek = wk; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = wk; render(); }, NOWWK);
await page.waitForTimeout(500);
for (const [q, v] of [['lonely', 2], ['clarity', 9], ['growth', 8]]) {
  await page.$eval(`[data-wslide="${q}"]`, (el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
}
await page.fill('[data-wnum="langHours"]', '3');
await page.dispatchEvent('[data-wnum="langHours"]', 'change');
for (const q of ['oneOnOne', 'exercise', 'quietTime', 'sharedFaith', 'sabbath']) await page.click(`[data-wyn="${q}|1"]`);
for (const q of ['porn', 'debt']) await page.click(`[data-wyn="${q}|0"]`);
await page.click('#weekSubmit');
await page.waitForTimeout(700);

ok('the health form closed even though offline', await page.evaluate(() => !document.getElementById('weekForm')));
ok('the check-in save did NOT reach the (offline) server', saveMyWeekCalls === 0);
const queueAfterBoth = await page.evaluate(() => JSON.parse(localStorage.getItem('gp-offline-queue') || '[]'));
ok('both writes are queued now (goals + check-in)', queueAfterBoth.length === 2, JSON.stringify(queueAfterBoth.map(x => x.fn)));

/* Reloading while still offline can't be tested here — with no service
   worker (out of scope: "just don't lose edits", not a cached app shell),
   the browser can't fetch the page at all with the network truly down,
   same as any normal site. What's actually being relied on for someone who
   closes the app while offline and reopens it once they're back on signal
   is applyBoot's own reapply-then-flush, so that's what this exercises —
   a genuinely NEW page (closing the old one first, still offline), so
   there's no live 'online' listener on a dying document racing an
   in-flight request against the navigation that's about to abort it. That
   race is real but is a browser-navigation quirk, not what "reopening the
   app" means. */
console.log('\n=== BACK ONLINE, APP REOPENED ===');
const page2 = await ctx.newPage();
page2.on('pageerror', x => errors.push('PAGEERROR ' + x));
page2.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CONNECTION|ERR_INTERNET_DISCONNECTED/.test(m.text())) errors.push('console: ' + m.text()); });
await page.close();
await ctx.setOffline(false);
await page2.goto('http://localhost:4404/teams.html', { waitUntil: 'load' });
await page2.waitForSelector('.hero', { timeout: 15000 });
await page2.waitForTimeout(1500);
await page2.click('nav.bottom [data-tab="week"]');
await page2.waitForTimeout(700);

ok('both queued writes actually reached the server on reopen', saveGoalsCalls === 1 && saveMyWeekCalls === 1,
  'saveGoals=' + saveGoalsCalls + ' saveMyWeek=' + saveMyWeekCalls);
ok('the queue is empty again', await page2.evaluate(() => JSON.parse(localStorage.getItem('gp-offline-queue') || '[]').length) === 0);
ok('the "saved locally" banner is gone', !(await page2.evaluate(() => document.body.innerText.includes('back online'))));
ok('the goal still reads 100% (now confirmed by the real server, not just the local copy)',
  await page2.$eval('.wgPct', el => el.textContent.trim()).then(t => /100%/.test(t)));

console.log('\nERRORS: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail || errors.length ? 1 : 0);
