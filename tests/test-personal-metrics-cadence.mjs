/* A Base Leadership overseer's own numbers (BL_COMMON: one-on-ones held,
   partner connections, churches spoken at...) used to be typed as a daily
   count, summed into the week by the server — same as a real ministry's
   Cups Sold. That's wrong for a personal figure: nobody wants a "how many
   one-on-ones today" box, they want to log the week once, like the health
   check-in. So these move to the weekly card instead of the daily one, with
   no daily entry at all.

   Total Staff and Staff Debt stay level metrics (unchanged aggregation —
   they still feed rollup.js's blAgg() base-wide headcount), but move OUT of
   the personal weekly card into their own "Department Headcount" section:
   they're about the department, not the overseer's own week. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';

const ROOT = PUBLIC;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, res) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise(res => srv.listen(4418, res));

const ME = { id: 'st_lead', name: 'Andrew', username: 'andrew', campus: 'poipet',
  dept: 'Base Leadership', ministry: 'Community Service', role: '', photo: '', mentorId: '', isAdmin: false };
const WK = (function () {
  const d = new Date(), y = d.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1));
})();
const MINISTRY = {
  ok: true, campus: ME.campus, dept: ME.dept, ministry: ME.ministry,
  entries: { 'Total Staff': { [WK - 1]: 9 } },
  prev: {}, daily: {}, pins: [],
};
const BOOT = {
  ok: true, staff: ME, profile: { email: 'x@example.com' }, roster: [ME], logs: [], habits: null,
  mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: MINISTRY,
  trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [],
  base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [], roster: [] }
};

const sent = [];
const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  sent.push(q);
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = BOOT;
  else if (q.fn === 'teamRoster') o = [ME];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: ME, profile: {} };
  else if (q.fn === 'saveMyMinistry') o = MINISTRY;
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript((u) => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), ME.username);
await p.goto('http://localhost:4418/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.click('nav.bottom [data-tab="week"]');
await p.waitForTimeout(600);
await p.click('#goMinistryFromMe');
await p.waitForTimeout(700);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

// Funds Raised ($) is still a plain daily count (never asked to change), so the
// Today box can still exist — what matters is BL_COMMON is gone from it.
const dayAcc = await p.$('[data-acc="kpiDay"]');
if (dayAcc) { await dayAcc.click(); await p.waitForTimeout(300); }
const dayMetrics = await p.$$eval('[data-kpi]', els => els.map(e => e.getAttribute('data-kpi'))).catch(() => []);
ok('One-on-Ones Held is not in the daily "Today" box', !dayMetrics.includes('One-on-Ones Held'), dayMetrics.join(', '));
ok('Total Staff is not in the daily "Today" box', !dayMetrics.includes('Total Staff'));
ok('Funds Raised ($) is still a daily figure, unchanged', dayMetrics.includes('Funds Raised ($)'), dayMetrics.join(', '));

await p.click('[data-acc="kpiWeek"]');
await p.waitForTimeout(300);
const weekMetrics = await p.$$eval('#kpiWeekCard [data-kpiweek]', els => els.map(e => e.getAttribute('data-kpiweek')));
ok('One-on-Ones Held is in the weekly card', weekMetrics.includes('One-on-Ones Held'), weekMetrics.join(', '));
ok('Partner Connections is in the weekly card', weekMetrics.includes('Partner Connections'));
ok('Total Staff is NOT in the weekly card', !weekMetrics.includes('Total Staff'));
ok('Staff Debt is NOT in the weekly card', !weekMetrics.includes('Staff Debt ($)'));

const oneOnOneSub = await p.evaluate(() => {
  const row = [...document.querySelectorAll('#kpiWeekCard .row')].find(r => r.textContent.includes('One-on-Ones Held'));
  return row ? row.querySelector('.rowSub').textContent.trim() : null;
});
ok('it reads as a week total, not a carried-forward level', /week total/i.test(oneOnOneSub || ''), oneOnOneSub);

const hc = await p.$('[data-acc="kpiHeadcount"]');
ok('there is a separate Department Headcount section', !!hc);
if (hc) {
  await hc.click();
  await p.waitForTimeout(300);
  const hcMetrics = await p.$$eval('#kpiHeadcountCard [data-kpiweek]', els => els.map(e => e.getAttribute('data-kpiweek')));
  ok('Total Staff is in the headcount section', hcMetrics.includes('Total Staff'), hcMetrics.join(', '));
  ok('Staff Debt is in the headcount section', hcMetrics.includes('Staff Debt ($)'));
  const carried = await p.evaluate(() => {
    const inp = document.querySelector('#kpiHeadcountCard [data-kpiweek="Total Staff"]');
    return inp ? { value: inp.value, carried: inp.hasAttribute('data-carried') } : null;
  });
  ok('last week’s Total Staff carries forward as before', carried && carried.value === '9' && carried.carried === true,
    JSON.stringify(carried));
}

// Saving from either section's button writes every pending weekly figure.
await p.fill('[data-kpiweek="One-on-Ones Held"]', '4');
await p.click('#saveKpiWeekBtn');
await p.waitForTimeout(500);
const saved = sent.filter(q => q.fn === 'saveMyMinistry');
ok('Save Week posted the personal weekly figure', saved.length > 0 &&
  saved[saved.length - 1].args[3].some(u => u.metric === 'One-on-Ones Held' && u.value === 4),
  JSON.stringify(saved[saved.length - 1] || null));

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
