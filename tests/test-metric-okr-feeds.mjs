/* An OKR's key result already links FROM the objective TO a live KPI
   (kr.metricKey, read by krProgress() in rollup.js). This is the reverse
   question, asked from the metric's own row on My Ministry: does typing
   this number move anything? metricOkrNote_() answers it by scanning
   S.base.okrs for a key result whose metricKey matches dept|ministry|metric,
   scoped to the metric's own campus. */
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
await new Promise(res => srv.listen(4420, res));

const ME = { id: 'st1', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '', mentorId: '', isAdmin: false };
const OKRS = [
  // Two objectives on the same metric, so the "feeds N objectives" plural path is exercised too.
  { id: 'o1', campus: 'poipet', quarter: 1, dept: 'Community Service', objective: 'Grow our outreach footprint',
    krs: [{ text: 'Host more teams', metricKey: 'Community Service|Outreach Teams|Teams Hosted', target: 10, manual: 0 }] },
  { id: 'o2', campus: 'poipet', quarter: 1, dept: 'Community Service', objective: 'Deepen local partnerships',
    krs: [{ text: 'Teams as a proxy for reach', metricKey: 'Community Service|Outreach Teams|Teams Hosted', target: 5, manual: 0 }] },
  // Different campus, same dept/ministry/metric — must NOT count.
  { id: 'o3', campus: 'siemreap', quarter: 1, dept: 'Community Service', objective: 'Siem Reap outreach growth',
    krs: [{ text: 'Their own teams KR', metricKey: 'Community Service|Outreach Teams|Teams Hosted', target: 5, manual: 0 }] }
];
const MINISTRY = { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, prev: {}, daily: {}, pins: [] };
const BOOT = {
  ok: true, staff: ME, profile: { email: 'x@example.com' }, roster: [ME], logs: [], habits: null,
  mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: MINISTRY,
  trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [],
  base: { leader: false, entries: { poipet: {} }, okrs: OKRS, survey: [], roster: [] }
};

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = BOOT;
  else if (q.fn === 'teamRoster') o = [ME];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: ME, profile: {} };
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript((u) => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), ME.username);
await p.goto('http://localhost:4420/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.click('nav.bottom [data-tab="week"]');
await p.waitForTimeout(600);
await p.click('#goMinistryFromMe');
await p.waitForTimeout(700);
await p.click('[data-acc="kpiDay"]');
await p.waitForTimeout(300);
await p.click('#kpiShowAll').catch(() => {});
await p.waitForTimeout(300);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const rows = await p.evaluate(() => {
  const out = {};
  document.querySelectorAll('#kpiDayCard .row').forEach(r => {
    const name = r.querySelector('.rowName').textContent.trim();
    out[name] = r.querySelector('.rowSub').textContent.trim();
  });
  return out;
});

ok('Teams Hosted shows it feeds 2 objectives (same-campus KRs only)',
  /feeds/.test(rows['Teams Hosted'] || '') && /2/.test(rows['Teams Hosted'] || ''), rows['Teams Hosted']);
ok('an unlinked metric (Salvations) shows no "feeds" note',
  rows['Salvations'] !== undefined && !/feeds/.test(rows['Salvations']), rows['Salvations']);

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
