/* Weeks belong to a year, and writing numbers needs a name.

   Two fixes in one file because they touch the same handler. The year one is the
   dangerous change: every dated row used to carry a week number and nothing else,
   so week 33 of 2027 would land on top of week 33 of 2026 — summed metrics would
   double, `latest` metrics would be silently replaced, and last year's figures
   would be gone. Rows written BEFORE the change have no year at all, so the tests
   that matter most here are the ones about legacy rows still reading correctly. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('year');
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
process.env.GP_LEGACY_YEAR = '2024';     // so "inferred" is distinguishable from "now"
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const NOW = new Date().getUTCFullYear();
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ME = {
  id: 'st_me', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_me',
};
const OTHER = {
  id: 'st_sr', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Youth Education',
  ministry: 'YDC', active: true, surveyToken: 'tok_sr',
};
const NOCAMPUS = { id: 'st_nc', name: 'New', username: 'newbie', campus: '', dept: '', active: true };

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
function seed(extra) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ME, OTHER, NOCAMPUS].map(function (s) {
    return Object.assign({}, s, { pinSalt: s.id, pinHash: mkHash('1234', s.id) });
  });
  Object.assign(mem, extra || {});
}
const KEY = 'Community Service|Outreach Teams|Salvations';
const val = (b, campus, key, wk) => (((b && b.entries && b.entries[campus]) || {})[key] || {})[String(wk)];

/* ---------- 1. a legacy row still reads ---------- */
/* This is the one that would quietly destroy history if it were wrong: a row with
   no year must not vanish, and must not be attributed to the current year. */
seed({ entries: [
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 40 },
] });
let r = await call('getData', ['', 2024]);
ok('a row with no year falls back to GP_LEGACY_YEAR', val(r.body, 'poipet', KEY, 33) === 40,
  JSON.stringify(r.body && r.body.entries));
r = await call('getData', ['', NOW]);
ok('and it does NOT show up in the current year', val(r.body, 'poipet', KEY, 33) === undefined);

/* An `updated` stamp is better evidence than the fallback, so it wins. */
seed({ entries: [
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 55, updated: '2025-08-20T00:00:00.000Z' },
] });
r = await call('getData', ['', 2025]);
ok('a legacy row is dated by its own updated stamp', val(r.body, 'poipet', KEY, 33) === 55);
r = await call('getData', ['', 2024]);
ok('so the blanket fallback does not claim it', val(r.body, 'poipet', KEY, 33) === undefined);

/* ---------- 2. the same week in two years stays two numbers ---------- */
seed({ entries: [
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, year: 2026, value: 64 },
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, year: 2027, value: 9 },
] });
r = await call('getData', ['', 2026]);
ok('week 33 of 2026 reads its own figure', val(r.body, 'poipet', KEY, 33) === 64, String(val(r.body, 'poipet', KEY, 33)));
r = await call('getData', ['', 2027]);
ok('week 33 of 2027 reads its own figure', val(r.body, 'poipet', KEY, 33) === 9, String(val(r.body, 'poipet', KEY, 33)));
ok('getData says which year it answered for', r.body && r.body.year === 2027, String(r.body && r.body.year));

/* ---------- 3. writing stamps the year, and does not touch last year's ---------- */
seed({ entries: [
  { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, year: NOW - 1, value: 100 },
] });
r = await call('saveEntries', ['poipet',
  [{ dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 7 }],
  'leadercode']);
const rows = mem.entries || [];
ok('a new write is stamped with the current year',
  rows.some(function (x) { return x.year === NOW && x.value === 7; }),
  JSON.stringify(rows.map(function (x) { return x.year + ':' + x.value; })));
ok('and last year\'s row is untouched',
  rows.some(function (x) { return x.year === NOW - 1 && x.value === 100; }) && rows.length === 2,
  rows.length + ' rows');
ok('the write answers with this year, not last', val(r.body, 'poipet', KEY, 33) === 7, String(val(r.body, 'poipet', KEY, 33)));

/* ---------- 4. writing numbers needs a name ---------- */
seed();
r = await call('saveEntries', ['poipet',
  [{ dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 5 }], '']);
ok('an unauthenticated write is refused', r.body && r.body.ok === false && r.body.err === 'auth', JSON.stringify(r.body));
ok('and nothing was stored', (mem.entries || []).length === 0, String((mem.entries || []).length));

r = await call('saveEntries', ['poipet',
  [{ dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 5 }],
  '', 'sokha', '1234']);
ok('a staff login may write its own campus', r.body && r.body.entries && val(r.body, 'poipet', KEY, 33) === 5);

r = await call('saveEntries', ['siemreap',
  [{ dept: 'Youth Education', ministry: 'YDC', metric: 'Salvations', week: 33, value: 99 }],
  '', 'sokha', '1234']);
ok('but not another campus', r.body && r.body.ok === false && r.body.err === 'wrong_campus', JSON.stringify(r.body && r.body.err));
ok('and that write stored nothing',
  !(mem.entries || []).some(function (x) { return x.campus === 'siemreap'; }));

r = await call('saveEntries', ['siemreap',
  [{ dept: 'Youth Education', ministry: 'YDC', metric: 'Salvations', week: 33, value: 12 }],
  'leadercode']);
ok('the leadership code still writes any campus', val(r.body, 'siemreap', 'Youth Education|YDC|Salvations', 33) === 12);

r = await call('saveEntries', ['poipet',
  [{ dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 1 }],
  '', 'sokha', '9999']);
ok('a wrong PIN is refused', r.body && r.body.ok === false && r.body.err === 'auth');

r = await call('saveEntries', ['poipet',
  [{ dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 1 }],
  '', 'newbie', '1234']);
ok('a staff record with no campus is refused, not guessed at',
  r.body && r.body.ok === false && r.body.err === 'no_campus', JSON.stringify(r.body && r.body.err));

/* ---------- 5. health and goals are year-scoped too ---------- */
seed({
  survey: [
    { campus: 'poipet', week: 33, year: NOW - 1, device: 'tok_me', source: 'weekly', lonely: 9, clarity: 2, growth: 2, days: 7 },
  ],
  goals: [
    { staffId: 'st_me', week: 33, year: NOW - 1, items: [{ text: 'last year', pct: 100 }] },
  ],
});
r = await call('saveMyWeek', ['sokha', '1234', 33, { lonely: 2, clarity: 9, growth: 8 }]);
ok('this year\'s check-in does not overwrite last year\'s',
  (mem.survey || []).length === 2, (mem.survey || []).map(function (x) { return x.year; }).join(','));
ok('and my weeks show only this year',
  r.body && r.body.checkins && r.body.checkins.length === 1 && r.body.checkins[0].lonely === 2,
  JSON.stringify((r.body && r.body.checkins || []).map(function (c) { return c.week + '/' + c.lonely; })));

r = await call('saveGoals', ['sokha', '1234', 33, [{ text: 'this year', pct: 40 }]]);
ok('this year\'s goals do not overwrite last year\'s', (mem.goals || []).length === 2,
  (mem.goals || []).map(function (x) { return x.year; }).join(','));
ok('and my goals show only this year',
  r.body && r.body.goals && r.body.goals.length === 1 && r.body.goals[0].items[0].text === 'this year',
  JSON.stringify((r.body && r.body.goals || []).map(function (g) { return g.week + ':' + g.items[0].text; })));

/* A base average must not mix a year's answers with another's. */
seed({ survey: [
  { campus: 'poipet', week: 33, year: NOW, device: 'a', source: 'weekly', lonely: 2, clarity: 9, growth: 9, days: 7 },
  { campus: 'poipet', week: 33, year: NOW - 1, device: 'b', source: 'weekly', lonely: 9, clarity: 1, growth: 1, days: 7 },
] });
r = await call('getData', ['']);
ok('the base health average only sees this year',
  r.body && r.body.survey.length === 1 && r.body.survey[0].clarity === 9,
  JSON.stringify((r.body && r.body.survey || []).map(function (x) { return x.clarity; })));

/* ---------- 6. a bad year argument is not a crash ---------- */
for (const bad of ['abc', -5, 99999, null, {}]) {
  r = await call('getData', ['', bad]);
  ok('getData with year=' + JSON.stringify(bad) + ' falls back to this year',
    r.status === 200 && r.body && r.body.year === NOW, String(r.body && r.body.year));
}

/* ---------- 7. the legacy year does not need an environment variable ----------
   It used to fall back to the CURRENT year, so an unstamped row silently became a
   row of whatever year you were reading in — on 1 January, last year's whole
   history would have reappeared as this year's figures. The only thing preventing
   that was somebody remembering to set GP_LEGACY_YEAR in the Netlify dashboard,
   once, or else finding out twelve months later.

   Two assertions, because the behavioural one alone cannot see the bug today:
   the pinned year and the current year happen to be the same in 2026, and the
   difference only shows up on a New Year's Day nobody is running tests on. So the
   second one reads the source and checks the fallback is a constant. */
{
  delete process.env.GP_LEGACY_YEAR;
  const src = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');

  const pinned = /const LEGACY_YEAR = (\d{4})/.exec(src);
  ok('the legacy year is pinned to a constant in the source', !!pinned, pinned && pinned[1]);

  const fn = /function legacyYear_\(\)[\s\S]*?\n}/.exec(src);
  ok('and its fallback is that constant, not "whatever year it is now"',
    !!fn && /LEGACY_YEAR/.test(fn[0]) && !/currentYear_\(\)/.test(fn[0]),
    fn ? fn[0].replace(/\s+/g, ' ') : 'not found');

  /* And it still behaves: an unstamped row reads as the pinned year with nothing
     configured at all. */
  seed({ entries: [
    { campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', metric: 'Salvations', week: 33, value: 40 },
  ] });
  const got = await call('getData', ['', Number(pinned[1])]);
  ok('and an unstamped row lands in that year with no env var set',
    val(got.body, 'poipet', KEY, 33) === 40, JSON.stringify(got.body && got.body.year));

  /* The override is still there for a base that carried data in from an older
     spreadsheet — it is just no longer load-bearing. */
  process.env.GP_LEGACY_YEAR = '2024';
  const older = await call('getData', ['', 2024]);
  ok('GP_LEGACY_YEAR still overrides when somebody sets it',
    val(older.body, 'poipet', KEY, 33) === 40);
  delete process.env.GP_LEGACY_YEAR;
}

/* ---------- 8. a 53-week year has 53 weeks ----------
   Week 1 starts on the Monday on or before 1 January, so most years hold 52 of
   those weeks and some hold 53 — 2023 and 2028 do. Every week bound in the app
   was 52, so the last days of a long year were filed as week 52 and landed on top
   of a week that had already happened: a headcount replaced, a running total
   added to twice. Silent, and every five or six years.

   Read the helpers out of the source rather than reimplementing the arithmetic
   here — a test that computes the answer its own way proves only that two bits of
   maths agree, not that the app's bound is right. */
{
  const src = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
  const box = {};
  new Function('g',
    src.match(/function mondayOfWeek1_[\s\S]*?\n}/)[0] +
    src.match(/function weeksInYear_[\s\S]*?\n}/)[0] +
    '\ng.weeks=weeksInYear_;')(box);

  ok('2023 and 2028 are 53-week years', box.weeks(2023) === 53 && box.weeks(2028) === 53,
    '2023=' + box.weeks(2023) + ' 2028=' + box.weeks(2028));
  ok('and an ordinary year still has 52', box.weeks(2026) === 52 && box.weeks(2027) === 52,
    '2026=' + box.weeks(2026) + ' 2027=' + box.weeks(2027));

  /* The bound the app checks against must follow the year, not a constant. */
  const bounds = [...src.matchAll(/finiteNum_\((?:week|u\.week), 1, ([^)]+)\)/g)].map(m => m[1].trim());
  ok('no week argument is still bounded by a hardcoded 52',
    bounds.length > 0 && bounds.every(b => /maxWeek_/.test(b)), bounds.join(' | '));

  /* And the two pages agree with the server about how long a year is. */
  for (const f of ['index.html', 'teams.html']) {
    const page = fs.readFileSync(REPO + '/public/' + f, 'utf8');
    ok(f + ' does not clamp the week at 52 either',
      !/Math\.min\(52,/.test(page), (page.match(/Math\.min\(52,[^)]*\)/) || ['none'])[0]);
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
