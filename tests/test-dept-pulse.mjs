/* The department pulse: what a department leader sees about their department
   with nothing typed, and the Finance office's monthly staff debt. Checked here:
   who sees it (the department's leader, the Campus Director, admins — not other
   leaders or ordinary staff); headcount and who is away (approved leave, names
   and dates, never reasons); health as two numbers only — no score under three
   answers, the dashboard's own maths, and nothing of a check-in (token, answer)
   ever leaving the server; 1-on-1s this month and numbers in; staff debt entered
   by Finance only, stored as it always was and shown with who entered it; and
   the Campus Director's quarterly scores saving to their own row. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('dept-pulse');
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
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', ministry: 'Ponlork School', mentorId: 'st1', mentorStatus: 'approved' }),
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com', ministry: 'GP Education' }),
  mk({ id: 'st4', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com', dept: 'Youth Education', ministry: 'Sports' }),
  mk({ id: 'cs', name: 'Chea Leader', username: 'chea', email: 'c@e.com', dept: 'Campus Leadership', ministry: 'Community Service' }),
  mk({ id: 'ye', name: 'Yorn Leader', username: 'yorn', email: 'y@e.com', dept: 'Campus Leadership', ministry: 'Youth Education' }),
  mk({ id: 'cd', name: 'Dir Ector', username: 'director', email: 'x@e.com', dept: 'Campus Leadership', ministry: 'Campus Director' }),
  mk({ id: 'fi', name: 'Fin Ance', username: 'finance', email: 'f@e.com', dept: 'Skills Training', ministry: 'Finances' }),
  mk({ id: 'st', name: 'Skills Lead', username: 'skills', email: 'k@e.com', dept: 'Campus Leadership', ministry: 'Skills Training' })
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
/* the week the server counts in: the base's own day (Cambodia, UTC+7) */
const isoWeek = ds => { const d = new Date(ds + 'T00:00:00'), y = d.getFullYear(), j = new Date(y, 0, 1),
  m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7)); return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); };
const WK = isoWeek(new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10));
const pulse = (u, dept) => call('getDeptPulse', [u, '1234', dept]);
const TODAY = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10), YR = Number(TODAY.slice(0, 4));
const row = (id, o) => Object.assign({ campus: 'siemreap', week: WK, year: YR, device: 'tok_' + id, lonely: 2, clarity: 8, porn: 0, oneOnOne: 1,
  exercise: 1, quietTime: 1, debt: 0, growth: 7, sharedFaith: 1, sabbath: 0 }, o || {});

/* ---------- 1. who sees it ---------- */
{
  ok('a department\'s leader sees its pulse', (await pulse('chea', 'Community Service')).ok === true);
  ok('another department\'s leader does not', (await pulse('yorn', 'Community Service')).ok === false);
  ok('the Campus Director sees every department', (await Promise.all(['Community Service', 'Youth Education', 'Leadership Development', 'Skills Training']
    .map(d => pulse('director', d)))).every(r => r.ok === true));
  ok('ordinary staff do not', (await pulse('sreilea', 'Community Service')).ok === false);
  ok('nor is Campus Leadership itself a department here', (await pulse('director', 'Campus Leadership')).ok === false);
}

/* ---------- 2. staff and who is away ---------- */
{
  const mon = new Date(TODAY + 'T00:00:00Z'); mon.setUTCDate(mon.getUTCDate() - ((mon.getUTCDay() + 6) % 7));
  const d = n => { const x = new Date(mon); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  mem.trips = [
    { id: 't1', staffId: 'st1', campus: 'siemreap', from: d(1), to: d(3), status: 'approved', reason: 'family wedding' },
    { id: 't2', staffId: 'st3', campus: 'siemreap', from: d(2), to: d(2), status: 'pending', reason: 'x' },
    { id: 't3', staffId: 'st4', campus: 'siemreap', from: d(1), to: d(2), status: 'approved', reason: 'y' },
    { id: 't4', staffId: 'st2', campus: 'siemreap', from: d(14), to: d(15), status: 'approved', reason: 'z' }
  ];
  const p = await pulse('chea', 'Community Service');
  ok('counts the department\'s staff (not its leader\'s own department)', p.staff === 3, String(p.staff));
  ok('lists who is away this week — approved leave only, this department only', p.away.length === 1 && p.away[0].name === 'Sreilea Chan', JSON.stringify(p.away));
  ok('names and dates, never the reason', !/wedding|reason/.test(JSON.stringify(p.away)));
}

/* ---------- 3. health: two numbers, never a row ---------- */
{
  mem.survey = [row('st1'), row('st2', { lonely: 8, porn: 1 })];
  let p = await pulse('chea', 'Community Service');
  const h = p.health[0];
  ok('two answered: the count, but no score — too few to show', h.answered === 2 && h.total === 3 && h.score === undefined, JSON.stringify(h));
  mem.survey.push(row('st3', { clarity: 4 }));
  mem.survey.push(row('st4'));                      // another department — never counted here
  p = await pulse('chea', 'Community Service');
  const T = new Function(fs.readFileSync(PUBLIC + '/taxonomy.js', 'utf8') + ';return compositeOf;')();
  const want = Math.round(([row('st1'), row('st2', { lonely: 8, porn: 1 }), row('st3', { clarity: 4 })].reduce((a, r) => a + T(r), 0) / 3) * 10) / 10;
  ok('three answered: the department\'s average score, the same maths as the dashboard', p.health[0].answered === 3 && p.health[0].score === want, p.health[0].score + ' vs ' + want);
  const raw = JSON.stringify(p);
  ok('and nothing else of the check-ins leaves the server — no tokens, no answers, no names', !/tok_|lonely|porn|clarity|device/.test(raw));
  const api = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
  const fn = new Function(api.match(/function compositeOf_\(r\) \{[\s\S]*?\n\}/)[0] + ';return compositeOf_;')();
  const samples = [row('a'), row('b', { growth: null, sharedFaith: null, sabbath: null }), row('c', { familyCall: 1, lonelyMonth: 1, ministryUpdate: 0, twoOneOnOnes: 1 })];
  ok('the server\'s health score matches taxonomy.js exactly', samples.every(r => Math.abs(fn(r) - T(r)) < 1e-9));
}

/* ---------- 4. 1-on-1s and numbers ---------- */
{
  const now = new Date().toISOString();
  mem.oneOnOnes = [
    { id: 'o1', fromId: 'st2', toId: 'st1', status: 'accepted', created: now, decidedAt: now },
    { id: 'o2', fromId: 'st2', toId: 'st1', status: 'pending', created: now, decidedAt: '' },
    { id: 'o3', fromId: 'st4', toId: 'ye', status: 'accepted', created: now, decidedAt: now }
  ];
  mem.entries = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: WK, year: YR, value: 9, updated: now }];
  const p = await pulse('chea', 'Community Service');
  ok('1-on-1s this month: accepted ones in the department only', p.oneOnOnes === 1, String(p.oneOnOnes));
  ok('which ministries have their numbers in', JSON.stringify(p.numbers.logged[WK]) === '["Cafe"]');
}

/* ---------- 5. staff debt, from the Finance office ---------- */
{
  ok('Finance can see the staff debt list', (await call('getStaffDebt', ['finance', '1234'])).ok === true);
  ok('ordinary staff cannot', (await call('getStaffDebt', ['sreilea', '1234'])).ok === false);
  ok('nor can Skills Training\'s overseer, who is not in Finance', (await call('saveStaffDebt', ['skills', '1234', { 'Community Service': 5 }])).ok === false);
  ok('a negative amount is refused', (await call('saveStaffDebt', ['finance', '1234', { 'Community Service': -5 }])).ok === false);
  const r = await call('saveStaffDebt', ['finance', '1234', { 'Community Service': 1200, 'Youth Education': 300 }]);
  ok('Finance enters it for each department', r.ok && r.debt['Community Service'].value === 1200 && r.debt['Youth Education'].value === 300 && r.debt['Skills Training'] === null);
  ok('stored where it always was — Staff Debt ($) on the department\'s Campus Leadership row',
    mem.entries.some(e => e.dept === 'Campus Leadership' && e.ministry === 'Community Service' && e.metric === 'Staff Debt ($)' && e.value === 1200 && e.by === 'fi'));
  const p = await pulse('chea', 'Community Service');
  ok('and the department leader sees it, with who entered it', p.staffDebt && p.staffDebt.value === 1200 && p.staffDebt.by === 'Fin Ance');
}

/* ---------- 6. the Campus Director's quarter ---------- */
{
  await call('saveMyMinistry', ['director', '1234', 40, [{ metric: 'Base Vision (1-10)', value: 7 }, { metric: 'Base Plants in Planning', value: 1 }]]);
  const d = await call('getMyMinistry', ['director', '1234']);
  ok('the Campus Director\'s quarterly scores save to their own row', d.entries['Base Vision (1-10)']['40'] === 7 && d.entries['Base Plants in Planning']['40'] === 1);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
