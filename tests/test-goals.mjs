/* Weekly goals are a percentage per goal, not a tick.

   The thing worth protecting here is the migration: rows written before this
   change store `done` and no `pct`, and they must keep reading as 100/0 rather
   than silently becoming 0. And the week's figure has to be the average of what
   moved, not a count of finished ones — three goals at 60% is a 60% week. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('goals');
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
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ME = {
  id: 'st_me', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_me',
};

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
function seed(goals) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [{ ...ME, pinSalt: ME.id, pinHash: mkHash('1234', ME.id) }];
  mem.goals = goals || [];
}
const wkOf = (b, w) => (b.goals || []).find(function (g) { return Number(g.week) === w; });

/* ---------- 1. a percentage round-trips ---------- */
seed();
let r = await call('saveGoals', ['sokha', '1234', 33, [
  { text: 'Disciple two students', pct: 60 },
  { text: 'Finish the curriculum', pct: 25 },
  { text: 'Visit five families', pct: 100 },
]]);
ok('saveGoals accepts percentages', r.body && r.body.ok === true, JSON.stringify(r.body && r.body.err || ''));
let w = wkOf(r.body, 33);
ok('each goal keeps its own percentage',
  w && w.items.map(function (i) { return i.pct; }).join(',') === '60,25,100',
  w ? w.items.map(function (i) { return i.pct; }).join(',') : 'no week');
ok('the week is the average, not a count of finished ones', w && w.pct === 62,
  'pct=' + (w && w.pct));   // (60+25+100)/3 = 61.67 -> 62
ok('done is derived from the percentage',
  w && w.items.map(function (i) { return i.done ? 'y' : 'n'; }).join('') === 'nny',
  w ? w.items.map(function (i) { return i.done ? 'y' : 'n'; }).join('') : '');

/* ---------- 2. the old tick shape still reads correctly ---------- */
/* This is the migration. A row written before the change has `done` and no `pct`;
   reading it as 0 would wipe every completed goal the team already recorded. */
seed([{
  staffId: 'st_me', week: 30, updated: '', items: [
    { text: 'Ticked goal', done: true, metricKey: '' },
    { text: 'Unticked goal', done: false, metricKey: '' },
  ],
}]);
r = await call('getMyWeekly', ['sokha', '1234']);
w = wkOf(r.body, 30);
ok('a legacy ticked goal reads as 100%', w && w.items[0].pct === 100, 'pct=' + (w && w.items[0].pct));
ok('a legacy unticked goal reads as 0%', w && w.items[1].pct === 0, 'pct=' + (w && w.items[1].pct));
ok('a legacy week averages to 50%', w && w.pct === 50, 'pct=' + (w && w.pct));

/* Saving over a legacy row must not lose the other goals' progress. */
r = await call('saveGoals', ['sokha', '1234', 30, [
  { text: 'Ticked goal', pct: 100 },
  { text: 'Unticked goal', pct: 40 },
]]);
w = wkOf(r.body, 30);
ok('editing a legacy week keeps both figures',
  w && w.items.map(function (i) { return i.pct; }).join(',') === '100,40',
  w ? w.items.map(function (i) { return i.pct; }).join(',') : '');

/* ---------- 3. bad input ---------- */
seed();
r = await call('saveGoals', ['sokha', '1234', 33, [
  { text: 'over',    pct: 250 },
  { text: 'under',   pct: -30 },
  { text: 'rubbish', pct: 'abc' },
]]);
w = wkOf(r.body, 33);
ok('an out-of-range or non-numeric percentage falls back to 0, not NaN',
  w && w.items.every(function (i) { return i.pct === 0; }),
  w ? JSON.stringify(w.items.map(function (i) { return i.pct; })) : '');
ok('and the week is 0, not NaN', w && w.pct === 0, 'pct=' + (w && w.pct));

r = await call('saveGoals', ['sokha', '1234', 33, [{ text: 'half', pct: 50.4 }]]);
w = wkOf(r.body, 33);
ok('a fractional percentage is rounded', w && w.items[0].pct === 50, 'pct=' + (w && w.items[0].pct));

/* ---------- 4. "no goals set" stays distinct from "set them, moved none" ---------- */
seed();
r = await call('saveGoals', ['sokha', '1234', 33, [{ text: '', pct: 0 }]]);
w = wkOf(r.body, 33);
ok('a week with nothing written is null, not 0%', w && w.pct === null, 'pct=' + JSON.stringify(w && w.pct));
r = await call('saveGoals', ['sokha', '1234', 33, [{ text: 'written but untouched', pct: 0 }]]);
w = wkOf(r.body, 33);
ok('a week written but not moved is 0%, not null', w && w.pct === 0, 'pct=' + JSON.stringify(w && w.pct));

/* ---------- 5. still only three goals, still your own ---------- */
seed();
r = await call('saveGoals', ['sokha', '1234', 33,
  [1, 2, 3, 4, 5].map(function (n) { return { text: 'goal ' + n, pct: 100 }; })]);
w = wkOf(r.body, 33);
ok('no more than three goals are stored', w && w.items.length === 3, 'items=' + (w && w.items.length));
r = await call('saveGoals', ['sokha', '9999', 33, [{ text: 'nope', pct: 100 }]]);
ok('a wrong PIN writes nothing', r.body && r.body.ok === false && (mem.goals || []).length === 1);

/* ---------- 6. a mentor sees the percentages ---------- */
seed([{ staffId: 'st_kid', week: 33, updated: '', items: [{ text: 'theirs', pct: 70, metricKey: '' }] }]);
mem.staff.push({
  id: 'st_kid', name: 'Kid', username: 'kid', campus: 'poipet', dept: 'Community Service',
  ministry: 'Cafe', active: true, mentorId: 'st_me', mentorStatus: 'approved',
  pinSalt: 'st_kid', pinHash: mkHash('1234', 'st_kid'),
});
r = await call('getMenteeLogs', ['sokha', '1234', 'st_kid']);
const mg = r.body && r.body.goals;
ok('a mentor sees a mentee goal percentage',
  Array.isArray(mg) && mg[0] && mg[0].items[0].pct === 70,
  JSON.stringify(mg && mg[0] && mg[0].items));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
