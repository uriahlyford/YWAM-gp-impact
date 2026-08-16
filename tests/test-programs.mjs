/* Programme records — the four Ministry of Education project agreements.

   Three things worth protecting here.

   The first is the two copies of the field list. api.js cannot import
   public/programs.js — the function bundle does not share the frontend's globals
   — so it carries its own allow-list, and a field added to the form but not to
   that list is silently dropped on save: the person types a country, presses
   save, and the country is gone. The last test in this file compares them.

   The second is the campus stamp. A row is stamped with its writer's campus and
   cannot be moved to another one by editing it, the same rule saveEntries has.

   The third is the year. Records are year-scoped like every other dated row, so
   the 2027 report does not open showing 2026's teams. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('programs');
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

const YEAR = new Date().getFullYear();
const ME = {
  id: 'st_me', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_me',
};
const SIEM = {
  id: 'st_sr', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_sr',
};
const NOBASE = {
  id: 'st_nb', name: 'Nita', username: 'nita', campus: '', dept: '', ministry: '',
  role: '', active: true, surveyToken: 'tok_nb',
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
function seed(records) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ME, SIEM, NOBASE].map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
  mem.programs = records || [];
}
const TEAM = {
  kind: 'team', program: 'SVI', year: YEAR, quarter: 1,
  name: 'YWAM Maui', country: 'USA', from: YEAR + '-02-03', to: YEAR + '-02-17',
  male: 5, female: 7, servedMale: 40, servedFemale: 60, activities: 'Teaching English, community outreach',
};

/* ---------- 1. a record round-trips with every field it was given ---------- */
seed();
let r = await call('saveProgramRecord', ['sokha', '1234', TEAM]);
ok('a team saves', r.body && r.body.ok === true, JSON.stringify((r.body && r.body.err) || ''));
let rec = r.body && r.body.records && r.body.records[0];
ok('every field the form sent came back',
  rec && rec.name === 'YWAM Maui' && rec.country === 'USA' && rec.from === YEAR + '-02-03' &&
  rec.male === 5 && rec.female === 7 && rec.servedFemale === 60 &&
  /Teaching English/.test(rec.activities || ''),
  rec ? JSON.stringify(rec) : 'no record');
ok('the row is stamped with the writer, not the browser', rec && rec.by === 'st_me' && rec.campus === 'poipet',
  rec ? rec.by + '/' + rec.campus : '');
ok('the row got an id', !!(rec && /^pr_/.test(rec.id)), rec && rec.id);

/* ---------- 2. editing updates in place, and cannot move campus ---------- */
const id = rec.id;
r = await call('saveProgramRecord', ['sokha', '1234', { ...TEAM, id, male: 6 }]);
ok('an edit replaces rather than duplicates', r.body.records.length === 1, 'rows=' + r.body.records.length);
ok('the edit took', r.body.records[0].male === 6, 'male=' + r.body.records[0].male);

r = await call('saveProgramRecord', ['dara', '1234', { ...TEAM, id, campus: 'siemreap' }]);
ok('another campus may edit the shared report', r.body && r.body.ok === true);
ok('but cannot drag the row to its own campus', r.body.records[0].campus === 'poipet',
  r.body.records[0].campus);

/* A brand-new row from Siem Reap is stamped Siem Reap — the rule is "your own
   campus on rows you create", not "poipet forever". */
r = await call('saveProgramRecord', ['dara', '1234', { ...TEAM, id: undefined, name: 'YWAM Perth' }]);
const perth = r.body.records.find(function (x) { return x.name === 'YWAM Perth'; });
ok('a new row carries its own writer\'s campus', perth && perth.campus === 'siemreap', perth && perth.campus);

/* ---------- 3. only signed-in staff, and only with a campus ---------- */
r = await call('getPrograms', ['sokha', 'wrong']);
ok('a wrong PIN reads nothing', r.body && r.body.ok === false && r.body.err === 'auth', JSON.stringify(r.body));
r = await call('getPrograms', ['', '']);
ok('an anonymous caller reads nothing', r.body && r.body.ok === false, JSON.stringify(r.body));
r = await call('saveProgramRecord', ['nita', '1234', TEAM]);
ok('somebody with no campus yet cannot write', r.body && r.body.ok === false && r.body.err === 'no_campus',
  JSON.stringify(r.body));

/* ---------- 4. junk is refused rather than stored ---------- */
r = await call('saveProgramRecord', ['sokha', '1234', { kind: 'nonsense', program: 'SVI' }]);
ok('an unknown kind is refused', r.body && r.body.err === 'bad_kind', JSON.stringify(r.body));
r = await call('saveProgramRecord', ['sokha', '1234', { ...TEAM, program: 'NOPE' }]);
ok('an unknown programme is refused', r.body && r.body.err === 'bad_program', JSON.stringify(r.body));
r = await call('saveProgramRecord', ['sokha', '1234', { ...TEAM, id: undefined, male: 'lots', female: -4 }]);
const junk = r.body.records[r.body.records.length - 1];
ok('a count that is not a number stores as 0, not NaN', junk.male === 0 && junk.female === 0,
  junk.male + '/' + junk.female);
r = await call('saveProgramRecord', ['sokha', '1234', null]);
ok('a null record is refused, not a 500', r.status === 200 && r.body && r.body.ok === false,
  r.status + ' ' + JSON.stringify(r.body));

/* A challenge belongs to the base, not to a programme, so it needs no programme
   id — and must not be forced to invent one. */
seed();
r = await call('saveProgramRecord', ['sokha', '1234',
  { kind: 'issue', year: YEAR, quarter: 3, challenge: 'Fewer volunteer teams', solution: 'Asked two partner bases' }]);
ok('a challenge saves without a programme', r.body && r.body.ok === true, JSON.stringify(r.body && r.body.err));
ok('and is stored with no programme', r.body.records[0].program === '', JSON.stringify(r.body.records[0]));

/* ---------- 4b. the quarter a record belongs to ----------
   Records are stamped with a quarter because it is the finest grain anybody
   reports on: a six-month report adds two of them together, while splitting a
   six-month row back into halves is impossible — nothing in it says when the
   class ran. */
seed();
r = await call('saveProgramRecord', ['sokha', '1234', { ...TEAM, quarter: 3 }]);
ok('a quarter round-trips', r.body.records[0].quarter === 3, 'q=' + r.body.records[0].quarter);
r = await call('saveProgramRecord', ['sokha', '1234', { ...TEAM, id: undefined, quarter: 9 }]);
ok('a quarter outside 1-4 falls back rather than storing nonsense',
  r.body.records[1].quarter === 1, 'q=' + r.body.records[1].quarter);
r = await call('saveProgramRecord', ['sokha', '1234', { ...TEAM, id: undefined, quarter: undefined }]);
ok('a record with no quarter is still a valid row', r.body.records[2].quarter === 1,
  'q=' + r.body.records[2].quarter);

/* Rows written while this was being built carry a semester and no quarter. Each
   maps to the earliest quarter it could have been, so nothing is ever reported
   as having happened earlier than it did. */
seed([
  { id: 'pr_s1', kind: 'team', program: 'SVI', campus: 'poipet', year: YEAR, semester: 1, name: 'First half', male: 1, female: 1 },
  { id: 'pr_s2', kind: 'team', program: 'SVI', campus: 'poipet', year: YEAR, semester: 2, name: 'Second half', male: 1, female: 1 },
]);
r = await call('getPrograms', ['sokha', '1234']);
{
  const byName = Object.fromEntries(r.body.records.map(function (x) { return [x.name, x]; }));
  ok('a legacy semester-1 row reads as Q1', byName['First half'].quarter === 1,
    'q=' + byName['First half'].quarter);
  ok('a legacy semester-2 row reads as Q3, the earliest it could have been',
    byName['Second half'].quarter === 3, 'q=' + byName['Second half'].quarter);
  ok('and the stale semester field is not handed back to the app',
    byName['First half'].semester === undefined, JSON.stringify(byName['First half']));
}

/* ---------- 5. years do not bleed into each other ---------- */
seed([
  { id: 'pr_old', kind: 'team', program: 'SVI', campus: 'poipet', year: YEAR - 1, quarter: 1,
    name: 'Last year team', male: 3, female: 3 },
  { id: 'pr_new', kind: 'team', program: 'SVI', campus: 'poipet', year: YEAR, quarter: 1,
    name: 'This year team', male: 4, female: 4 },
]);
r = await call('getPrograms', ['sokha', '1234']);
ok('reading with no year asked gives this year only',
  r.body.records.length === 1 && r.body.records[0].name === 'This year team',
  r.body.records.map(function (x) { return x.name; }).join(','));
r = await call('getPrograms', ['sokha', '1234', YEAR - 1]);
ok('and last year is still there when asked for',
  r.body.records.length === 1 && r.body.records[0].name === 'Last year team',
  r.body.records.map(function (x) { return x.name; }).join(','));

/* ---------- 6. delete ---------- */
r = await call('deleteProgramRecord', ['sokha', '1234', 'pr_new']);
ok('a delete removes the row', r.body && r.body.ok === true && r.body.records.length === 0,
  JSON.stringify(r.body && r.body.records));
ok('last year is untouched by it', (mem.programs || []).length === 1 && mem.programs[0].id === 'pr_old',
  JSON.stringify((mem.programs || []).map(function (x) { return x.id; })));
r = await call('deleteProgramRecord', ['sokha', '1234', 'pr_nothing']);
ok('deleting something that is not there says so', r.body && r.body.err === 'not_found', JSON.stringify(r.body));
r = await call('deleteProgramRecord', ['nobody', 'x', 'pr_old']);
ok('a stranger cannot delete', r.body && r.body.err === 'auth' && (mem.programs || []).length === 1);

/* ---------- 7. a junk blob does not take the screen down ---------- */
seed();
mem.programs = { not: 'an array' };
r = await call('getPrograms', ['sokha', '1234']);
ok('a junk programs blob reads as empty rather than 500',
  r.status === 200 && r.body && r.body.ok === true && r.body.records.length === 0,
  r.status + ' ' + JSON.stringify(r.body));

/* ---------- 8. the two field lists agree ----------
   The one that actually bites: public/programs.js drives the form, api.js decides
   what is stored. They are hand-kept copies. */
const fe = fs.readFileSync(REPO + '/public/programs.js', 'utf8');
const be = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');

/* Read the frontend's real object rather than regexing it, so a reordering or a
   reformat does not fail the test for the wrong reason. */
const feFields = await (async () => {
  const mod = TMP + '/programs.mjs';
  fs.writeFileSync(mod, fe + '\nexport { GP_RECORD_FIELDS, GP_PROGRAMS };\n');
  return import(mod);
})();

const beBlock = /const RECORD_FIELDS = \{([\s\S]*?)\n\};/.exec(be);
ok('api.js still has a RECORD_FIELDS list to compare against', !!beBlock);
const beFields = {};
if (beBlock) {
  const re = /(\w+):\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(beBlock[1]))) {
    beFields[m[1]] = m[2].split(',').map(function (s) { return s.trim().replace(/^'|'$/g, ''); })
      .filter(Boolean);
  }
}
const feKinds = Object.keys(feFields.GP_RECORD_FIELDS).sort().join(',');
const beKinds = Object.keys(beFields).sort().join(',');
ok('both files know the same record kinds', feKinds === beKinds, feKinds + '  vs  ' + beKinds);
Object.keys(feFields.GP_RECORD_FIELDS).forEach(function (kind) {
  const a = feFields.GP_RECORD_FIELDS[kind].map(function (f) { return f.k; }).sort().join(',');
  const b = (beFields[kind] || []).slice().sort().join(',');
  ok('the "' + kind + '" fields match in both files', a === b, a + '  vs  ' + b);
});

/* Every programme id the form offers has to be one the server will accept. */
const idsBlock = /const PROGRAM_IDS = \[([^\]]*)\]/.exec(be);
const beIds = idsBlock ? idsBlock[1].split(',').map(function (s) { return s.trim().replace(/'/g, ''); }).filter(Boolean) : [];
const feIds = feFields.GP_PROGRAMS.map(function (p) { return p.id; });
ok('both files know the same four programmes', feIds.slice().sort().join(',') === beIds.slice().sort().join(','),
  feIds.join(',') + '  vs  ' + beIds.join(','));

/* Every numeric field must be in NUMERIC_FIELDS, or it is stored as a string and
   the report's arithmetic quietly concatenates instead of adding. */
const numBlock = /const NUMERIC_FIELDS = \[([\s\S]*?)\]/.exec(be);
const beNums = numBlock ? numBlock[1].split(',').map(function (s) { return s.trim().replace(/'/g, ''); }).filter(Boolean) : [];
const missing = [];
Object.keys(feFields.GP_RECORD_FIELDS).forEach(function (kind) {
  feFields.GP_RECORD_FIELDS[kind].forEach(function (f) {
    if (f.t === 'n' && beNums.indexOf(f.k) === -1) missing.push(kind + '.' + f.k);
  });
});
ok('every count field is on the server\'s numeric list', missing.length === 0, missing.join(', ') || 'none missing');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
