/* A count metric like Cups Sold is easier to read monthly or quarterly
   than every week — an admin can set that per metric from "Edit what we
   track" (metricEditorHtml_'s new cadence picker). Setting cadence is
   admin-only even for someone who can otherwise edit that ministry's
   metrics (canEditMetrics_ already lets a ministry's own overseer hide/add
   metrics); a monthly/quarterly metric drops out of the daily "Today" list
   and gets its own "This month"/"This quarter" section instead, one number
   for the whole period, written to that period's own anchor week so a
   second save within the same month overwrites rather than double-counting
   on any sum roll-up. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import crypto from 'node:crypto';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* ---------- part 1: server-side authorization ---------- */
const TMP = tmpDir('metric-cadence');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js'); // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet',
  dept: 'Community Service', ministry: 'Cafe', isAdmin: true, active: true };
const STAFF = { id: 'st_staff', name: 'Dara', username: 'dara', campus: 'poipet',
  dept: 'Community Service', ministry: 'Cafe', active: true };
const LEADER = { id: 'st_leader', name: 'Sokha', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Cafe', active: true, leads: ['Community Service|Cafe'] };

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ADMIN, STAFF, LEADER].map(function (s) { return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }; });
}

seed();
let r = await call('saveMetricOverrides', ['dara', '1234', 'poipet', 'Community Service', 'Cafe', [], [], { 'Cups Sold': 'month' }]);
ok('a non-admin cannot set cadence, even for their own ministry', r.body && r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));

r = await call('saveMetricOverrides', ['uriah', '1234', 'poipet', 'Community Service', 'Cafe', [], [], { 'Cups Sold': 'month' }]);
ok('an admin can set cadence', r.body && r.body.ok === true &&
  r.body.metricOverrides.find(o => o.ministry === 'Cafe').cadence['Cups Sold'] === 'month',
  JSON.stringify(r.body));

/* Changing the list is a leader's right now, not every member's — see
   canEditMetrics_. Sokha leads Cafe; Dara just works there. */
r = await call('saveMetricOverrides', ['dara', '1234', 'poipet', 'Community Service', 'Cafe', ['Healings'], []]);
ok('an ordinary member cannot hide/add metrics either', r.body && r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));
r = await call('saveMetricOverrides', ['sokha', '1234', 'poipet', 'Community Service', 'Cafe', ['Healings'], []]);
ok('the ministry’s leader can hide/add metrics without touching cadence',
  r.body && r.body.ok === true && r.body.metricOverrides.find(o => o.ministry === 'Cafe').hidden.includes('Healings') &&
  r.body.metricOverrides.find(o => o.ministry === 'Cafe').cadence['Cups Sold'] === 'month',
  JSON.stringify(r.body));
r = await call('saveMetricOverrides', ['sokha', '1234', 'poipet', 'Community Service', 'Cafe', ['Healings'], [], { 'Cups Sold': 'quarter' }]);
ok('and the leader can move a count to quarterly too', r.body && r.body.ok === true &&
  r.body.metricOverrides.find(o => o.ministry === 'Cafe').cadence['Cups Sold'] === 'quarter', JSON.stringify(r.body));

r = await call('saveMetricOverrides', ['uriah', '1234', 'poipet', 'Community Service', 'Cafe', [], [], { 'Cups Sold': 'bogus' }]);
ok('an unknown cadence value is dropped, not stored', r.body && r.body.ok === true &&
  !('Cups Sold' in r.body.metricOverrides.find(o => o.ministry === 'Cafe').cadence),
  JSON.stringify(r.body));

console.log('');
fs.rmSync(TMP, { recursive: true, force: true });

/* ---------- part 2: the picker and the monthly section in the browser ---------- */
const ROOT = PUBLIC;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, res) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise(res => srv.listen(4419, res));

function isoWeekOf(d) {
  const y = d.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1));
}
const now = new Date();
const MONTH_WK = isoWeekOf(new Date(now.getFullYear(), now.getMonth(), 1));

const BOOT_ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', role: '', photo: '', mentorId: '', isAdmin: true };
let overrides = [{ campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', hidden: [], custom: [], cadence: { 'Cups Sold': 'month' } }];
const MINISTRY = { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', entries: {}, prev: {}, daily: {}, pins: [] };
const savedMinistry = [];

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = {
    ok: true, staff: BOOT_ADMIN, profile: { email: 'x@example.com' }, roster: [BOOT_ADMIN], logs: [], habits: null,
    mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: MINISTRY,
    trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [],
    base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [], roster: [], metricOverrides: overrides }
  };
  else if (q.fn === 'teamRoster') o = [BOOT_ADMIN];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: BOOT_ADMIN, profile: {} };
  else if (q.fn === 'saveMetricOverrides') {
    const [, , campus, dept, ministry, hidden, custom, cadence] = q.args;
    const rec = overrides.find(x => x.campus === campus && x.dept === dept && x.ministry === ministry);
    const nextCadence = cadence != null ? cadence : (rec ? rec.cadence : {});
    overrides = [{ campus, dept, ministry, hidden, custom, cadence: nextCadence }];
    o = { ok: true, metricOverrides: overrides };
  }
  else if (q.fn === 'saveMyMinistry') { savedMinistry.push(q.args); o = MINISTRY; }
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript((u) => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), BOOT_ADMIN.username);
await p.goto('http://localhost:4419/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.click('nav.bottom [data-tab="week"]');
await p.waitForTimeout(600);
await p.click('#goMinistryFromMe');
await p.waitForTimeout(700);
// the metric form is folded behind one button now; it opens every section at once
await p.click('#kpiInputBtn');
await p.waitForTimeout(400);

const dayAcc = await p.$('[data-acc="kpiDay"]');
const dayMetrics = await p.$$eval('[data-kpi]', els => els.map(e => e.getAttribute('data-kpi'))).catch(() => []);
ok('Cups Sold (cadence: month) is not in the daily Today list', !dayMetrics.includes('Cups Sold'), dayMetrics.join(', '));

const monthAcc = await p.$('[data-acc="kpiMonth"]');
ok('there is a "This month" section', !!monthAcc);
const monthMetrics = await p.$$eval('[data-kpimonth]', els => els.map(e => e.getAttribute('data-kpimonth'))).catch(() => []);
ok('Cups Sold is in the monthly section', monthMetrics.includes('Cups Sold'), monthMetrics.join(', '));

await p.click('[data-acc="kpiMetrics"]');
await p.waitForTimeout(300);
const cadenceSel = await p.$('[data-metriccadence="Cups Sold"]');
ok('the metric editor shows a cadence picker for an admin', !!cadenceSel);
if (cadenceSel) {
  const val = await cadenceSel.inputValue();
  ok('it defaults to the metric’s stored cadence (month)', val === 'month', val);
}

// Enter a value and save — should post to the month's own anchor week.
await p.fill('[data-kpimonth="Cups Sold"]', '6');
await p.click('#saveKpiMonthBtn');
await p.waitForTimeout(500);
ok('Save Month posted exactly one saveMyMinistry call', savedMinistry.length === 1, JSON.stringify(savedMinistry));
if (savedMinistry.length) {
  const [, , wk, updates] = savedMinistry[0];
  ok('it wrote to the month’s own anchor week, not whatever week was last viewed',
    wk === MONTH_WK, 'wrote week ' + wk + ', expected ' + MONTH_WK);
  ok('and the right metric/value', updates.some(u => u.metric === 'Cups Sold' && u.value === 6), JSON.stringify(updates));
}

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
