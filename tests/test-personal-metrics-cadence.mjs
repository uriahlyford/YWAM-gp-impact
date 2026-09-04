/* A Base Leadership overseer's own page is entirely weekly — no daily
   "Today" list at all, and no separate "Department Headcount" section
   either: everything (BL_COMMON personal figures, Total Staff/Staff Debt,
   Funds Raised) lands in the one "This week" box, merged with the
   week-picker into a single card. That's a deliberate simplification from
   an earlier design (daily Today for Funds Raised, a separate headcount
   section) that turned out to read as two confusing boxes instead of one.
   Every other ministry (Cups Sold, Days Open…) keeps its normal
   daily/weekly split — this collapse is Base Leadership-only. */
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

ok('there is no daily "Today" box at all for a Base Leadership overseer', !(await p.$('[data-acc="kpiDay"]')));
ok('there is no separate Department Headcount section either', !(await p.$('[data-acc="kpiHeadcount"]')));

// The week-picker and the metrics accordion are one box now, not two.
const boxes = await p.evaluate(() => {
  const acc = document.querySelector('[data-acc="kpiWeek"]');
  const card = acc ? acc.closest('.accCard') : null;
  return {
    weekNavInsideAccCard: !!(card && card.querySelector('.weekNavBlock')),
    noSeparateCardAbove: !document.querySelector('.card + .accCard'),
  };
});
ok('the week picker lives inside the same box as the metrics accordion', boxes.weekNavInsideAccCard, JSON.stringify(boxes));
ok('there is no separate week-nav card sitting above the accordion', boxes.noSeparateCardAbove, JSON.stringify(boxes));

await p.click('[data-acc="kpiWeek"]');
await p.waitForTimeout(300);
const weekMetrics = await p.$$eval('#kpiWeekCard [data-kpiweek]', els => els.map(e => e.getAttribute('data-kpiweek')));
ok('One-on-Ones Held is in the one weekly card', weekMetrics.includes('One-on-Ones Held'), weekMetrics.join(', '));
ok('Partner Connections is in the weekly card', weekMetrics.includes('Partner Connections'));
ok('Total Staff is in the SAME weekly card now (no separate headcount box)', weekMetrics.includes('Total Staff'), weekMetrics.join(', '));
ok('Staff Debt is in the same weekly card too', weekMetrics.includes('Staff Debt ($)'));
ok('Funds Raised ($) also moved in — no daily figures left for this ministry', weekMetrics.includes('Funds Raised ($)'), weekMetrics.join(', '));

const oneOnOneSub = await p.evaluate(() => {
  const row = [...document.querySelectorAll('#kpiWeekCard .row')].find(r => r.textContent.includes('One-on-Ones Held'));
  return row ? row.querySelector('.rowSub').textContent.trim() : null;
});
ok('One-on-Ones Held still reads as a week total, not a carried-forward level', /week total/i.test(oneOnOneSub || ''), oneOnOneSub);

const carried = await p.evaluate(() => {
  const inp = document.querySelector('#kpiWeekCard [data-kpiweek="Total Staff"]');
  return inp ? { value: inp.value, carried: inp.hasAttribute('data-carried') } : null;
});
ok('Total Staff still carries forward from last week as before', carried && carried.value === '9' && carried.carried === true,
  JSON.stringify(carried));

// One Save Week button now, and it writes everything together.
const saveBtns = await p.$$eval('.saveKpiWeekBtn', els => els.length);
ok('there is exactly one Save Week button', saveBtns === 1, saveBtns);

await p.fill('[data-kpiweek="One-on-Ones Held"]', '4');
await p.click('#saveKpiWeekBtn');
await p.waitForTimeout(500);
const saved = sent.filter(q => q.fn === 'saveMyMinistry');
ok('Save Week posted the personal weekly figure', saved.length > 0 &&
  saved[saved.length - 1].args[3].some(u => u.metric === 'One-on-Ones Held' && u.value === 4),
  JSON.stringify(saved[saved.length - 1] || null));
ok('and it posted Total Staff too, in the same call (one box, one save)', saved.length > 0 &&
  saved[saved.length - 1].args[3].some(u => u.metric === 'Total Staff'),
  JSON.stringify(saved[saved.length - 1] || null));

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
