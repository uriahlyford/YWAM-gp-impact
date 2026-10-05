/* KPI quick wins: the description beside every metric, and numbers that
   cannot be. Checked here: kpiguide.js says exactly what the KPI guide
   (help.html) says, and every metric staff log has a line; the page and the
   server agree that a score is 1–10 and a percentage 0–100 and that counts and
   money have no edges; the server refuses an out-of-range score or
   percentage on the weekly and daily paths (saying which) without blocking
   the good numbers beside it or overwriting a good one already there; a day's
   count can still be negative to undo a mistake; and Outreach Teams is left
   exactly as it was. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('kpi-guide');
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
  role: 'Staff', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
mem.staff = [
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com', dept: 'Skills Training', ministry: 'Culinary' }),
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', dept: 'Youth Education', ministry: 'YDC' }),
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com', dept: 'Community Service', ministry: 'Outreach Teams' })
];
async function call(fn, args) {
  const r = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return r.json();
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const K = new Function(fs.readFileSync(PUBLIC + '/kpiguide.js', 'utf8') + ';return {KPI_GLOSS, kpiGloss};')();
const T = new Function(fs.readFileSync(PUBLIC + '/taxonomy.js', 'utf8') + ';return {getBaselineDepartments, kpiRange};')();
const entry = (min, metric) => (mem.entries || []).find(r => r.ministry === min && r.metric === metric);

/* ---------- 1. the descriptions ---------- */
{
  const html = fs.readFileSync(PUBLIC + '/help.html', 'utf8');
  const un = x => x.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/<[^>]+>/g, '');
  const guide = {};
  for (const m of html.matchAll(/<div class="kpi"><div class="kpiName">(.*?)<\/div><div class="kpiGloss">(.*?)<\/div><\/div>/g)) {
    const en = un(m[1].match(/<span class="en">(.*?)<\/span>/)[1]);
    if (!(en in guide)) guide[en] = un(m[2]);
  }
  const keys = Object.keys(K.KPI_GLOSS);
  ok('kpiguide.js carries every line in the KPI guide', Object.keys(guide).length > 100 && Object.keys(guide).every(k => K.KPI_GLOSS[k] === guide[k]),
    Object.keys(guide).filter(k => K.KPI_GLOSS[k] !== guide[k]).slice(0, 3).join(' | '));
  ok('and nothing the guide does not', keys.every(k => k in guide), keys.filter(k => !(k in guide)).join(','));
  const all = new Set();
  for (const c of ['poipet', 'siemreap']) {
    const d = T.getBaselineDepartments(c);
    for (const dep in d) for (const min in d[dep]) if (min !== 'Outreach Teams') d[dep][min].forEach(m => all.add(m));
  }
  const missing = [...all].filter(m => !K.kpiGloss(m));
  ok('every metric staff log has a description', missing.length === 0, missing.join(', '));
  ok('a metric with none gets an empty line, not an error', K.kpiGloss('Made-up Metric') === '');
}

/* ---------- 2. the edges, the same on both sides ---------- */
{
  const apiSrc = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
  const fn = new Function(apiSrc.match(/function kpiRange_\(metric\) \{[\s\S]*?\n\}/)[0] + ';return kpiRange_;')();
  const names = ['Food Taste (1-10)', 'Passing Rate (%)', 'Cups Sold', 'Weekly Profit ($)', 'Students Enrolled', 'My Own (1-10)'];
  ok('the server and the page agree on every edge', names.every(n => JSON.stringify(fn(n)) === JSON.stringify(T.kpiRange(n))));
  ok('a score is 1–10 and a percentage 0–100', JSON.stringify(T.kpiRange('Food Taste (1-10)')) === '{"min":1,"max":10}' &&
    JSON.stringify(T.kpiRange('Passing Rate (%)')) === '{"min":0,"max":100}');
  ok('counts and money have no edges', T.kpiRange('Cups Sold') === null && T.kpiRange('Weekly Profit ($)') === null);
}

/* ---------- 3. the server refuses what is out of range ---------- */
{
  const r = await call('saveMyMinistry', ['sreilea', '1234', 10, [
    { metric: 'Food Taste (1-10)', value: 70 }, { metric: 'Food On Time (1-10)', value: 8 }, { metric: 'People Cooked For', value: 40 }]]);
  ok('a 70 for a 1–10 score is refused', !entry('Culinary', 'Food Taste (1-10)'));
  ok('and the reply says which', r.ok !== false && JSON.stringify(r.rejected) === '["Food Taste (1-10)"]', JSON.stringify(r.rejected));
  ok('while the good numbers beside it still save', (entry('Culinary', 'Food On Time (1-10)') || {}).value === 8 && (entry('Culinary', 'People Cooked For') || {}).value === 40);
  await call('saveMyMinistry', ['sreilea', '1234', 10, [{ metric: 'Food Taste (1-10)', value: 0 }]]);
  ok('so is a 0', !entry('Culinary', 'Food Taste (1-10)'));
  await call('saveMyMinistry', ['sreilea', '1234', 10, [{ metric: 'Food Taste (1-10)', value: 10 }]]);
  ok('a 10 is fine', (entry('Culinary', 'Food Taste (1-10)') || {}).value === 10);
  await call('saveMyMinistry', ['mealea', '1234', 10, [{ metric: 'Passing Rate (%)', value: 140 }]]);
  ok('a 140% pass rate is refused', !entry('YDC', 'Passing Rate (%)'));
  await call('saveMyMinistry', ['mealea', '1234', 10, [{ metric: 'Passing Rate (%)', value: 85 }]]);
  ok('85% is fine', (entry('YDC', 'Passing Rate (%)') || {}).value === 85);
  await call('saveMyMinistry', ['sreilea', '1234', 10, [{ metric: 'Food On Time (1-10)', value: 55 }]]);
  ok('a bad number never overwrites a good one already there', (entry('Culinary', 'Food On Time (1-10)') || {}).value === 8);

  /* counts keep working exactly as before — a day can still be negative to undo a mistake */
  await call('saveMyKpiDay', ['sreilea', '1234', '2026-03-03', [{ metric: 'People Cooked For', mode: 'sum', value: -2 }]]);
  ok('a count can still be negative for the day (undoing yesterday)', (mem.kpiDaily || []).some(r => r.metric === 'People Cooked For' && r.value === -2));
  await call('saveMyKpiDay', ['sreilea', '1234', '2026-03-03', [{ metric: 'Food Taste (1-10)', mode: 'avg', value: 12 }]]);
  ok('the daily path refuses an out-of-range score too', !(mem.kpiDaily || []).some(r => r.metric === 'Food Taste (1-10)'));
}

/* ---------- 4. Outreach Teams is left as it is ---------- */
{
  await call('saveMyMinistry', ['dara', '1234', 10, [{ metric: 'Custom Score (1-10)', value: 70 }]]);
  ok('Outreach Teams saves exactly as it did before', (entry('Outreach Teams', 'Custom Score (1-10)') || {}).value === 70);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
