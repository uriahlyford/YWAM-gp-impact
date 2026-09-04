/* What kind of staff someone is, and where they are from.

   The staff number on Base and on the dashboard is everyone at that campus. This
   covers the two ways it now breaks down underneath — campus / YAP / ministry, and
   Khmer / international / how many countries — end to end: stored by the API when
   a profile is created or edited, carried on the roster, counted by rollup.js.

   The one that would quietly rot is country normalisation. "How many countries are
   we" is only answerable if one country is one string, so khmer / Cambodian / KH
   have to fold together and "new zealand" must not count separately from
   "New Zealand". A test that only checked the happy path would pass while the
   country count slowly drifted upward. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const TMP = tmpDir('stafftype');
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
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* ---------- 1. set when a profile is created ---------- */
{
  mem.staff = [];
  const r = await call('staffRegister', [{
    username: 'sokha', pin: '1234', name: 'Sokha Chan', email: 'sokha@example.com', campus: 'poipet',
    dept: 'Community Service', ministry: 'Cafe', role: 'Barista',
    staffType: 'ministry', country: 'Cambodia'
  }]);
  ok('a new profile keeps its staff type', r.body && r.body.staff.staffType === 'ministry', r.body && r.body.staff.staffType);
  ok('a new profile keeps its country', r.body && r.body.staff.country === 'Cambodia', r.body && r.body.staff.country);

  /* Nobody should be forced to answer staff type/country at sign-up, and a
     profile made before the field existed has neither — both land as ''
     rather than as a wrong guess. Email is required either way. */
  const r2 = await call('staffRegister', [{ username: 'quiet', pin: '1111', name: 'Quiet', email: 'quiet@example.com', campus: 'poipet' }]);
  ok('leaving both blank is allowed', r2.body && r2.body.ok === true);
  ok('unanswered staff type is empty, not guessed', r2.body.staff.staffType === '', JSON.stringify(r2.body.staff.staffType));
  ok('unanswered country is empty, not guessed', r2.body.staff.country === '', JSON.stringify(r2.body.staff.country));

  const r3 = await call('staffRegister', [{ username: 'junk', pin: '2222', name: 'Junk', email: 'junk@example.com', campus: 'poipet', staffType: 'director' }]);
  ok('an unknown staff type is dropped, not stored', r3.body.staff.staffType === '', JSON.stringify(r3.body.staff.staffType));
}

/* ---------- 2. changed from the profile page ---------- */
{
  const r = await call('updateProfile', ['sokha', '1234', { staffType: 'campus', country: 'United Kingdom' }]);
  ok('profile can change the staff type', r.body && r.body.staff.staffType === 'campus', r.body && r.body.staff.staffType);
  ok('profile can change the country', r.body && r.body.staff.country === 'United Kingdom', r.body && r.body.staff.country);

  const r2 = await call('updateProfile', ['sokha', '1234', { role: 'Manager' }]);
  ok('saving other fields leaves them alone',
    r2.body.staff.staffType === 'campus' && r2.body.staff.country === 'United Kingdom');

  const r3 = await call('updateProfile', ['sokha', '9999', { staffType: 'yap' }]);
  ok('a wrong PIN cannot change them', r3.body && r3.body.ok === false);
  ok('and the stored values are untouched', mem.staff.find(s => s.username === 'sokha').staffType === 'campus');
}

/* ---------- 3. one country is one string ---------- */
{
  const cases = [
    ['khmer', 'Cambodia'], ['Khmer', 'Cambodia'], ['KH', 'Cambodia'], ['cambodian', 'Cambodia'],
    ['usa', 'United States'], ['U.S.A.', 'United States'], ['america', 'United States'],
    ['england', 'United Kingdom'], ['UK', 'United Kingdom'], ['Scotland', 'United Kingdom'],
    ['korea', 'South Korea'], ['NZ', 'New Zealand'], ['holland', 'Netherlands'],
    ['new zealand', 'New Zealand'], ['NEW ZEALAND', 'New Zealand'], ['  Japan  ', 'Japan'],
    ['papua  new   guinea', 'Papua New Guinea'],
    ['trinidad and tobago', 'Trinidad and Tobago'],   // a country not in the picker still lands
    ['', ''], ['   ', ''], ['x'.repeat(60), '']       // junk and overlong become "not said"
  ];
  let bad = [];
  for (const [given, want] of cases) {
    const r = await call('updateProfile', ['sokha', '1234', { country: given }]);
    const got = r.body && r.body.staff.country;
    if (got !== want) bad.push(JSON.stringify(given) + ' → ' + JSON.stringify(got) + ' (want ' + JSON.stringify(want) + ')');
  }
  ok('every spelling of a country folds to one name', bad.length === 0, bad.slice(0, 3).join(' | '));
}

/* ---------- 4. the roster carries them, and nothing private rides along ---------- */
{
  mem.staff = [{
    id: 'a', username: 'a', name: 'A', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe',
    role: 'Barista', active: true, staffType: 'ministry', country: 'Cambodia',
    pinSalt: 'sa', pinHash: mkHash('1234', 'sa'),
    surveyToken: 'tok_a', phone: '012345', debt: true, mentorId: ''
  }];
  const r = await call('teamRoster', []);
  const row = r.body[0];
  ok('the roster carries the staff type', row.staffType === 'ministry');
  ok('the roster carries the country', row.country === 'Cambodia');
  /* The roster is what every staff member can see about every other one, so the
     new fields must not have opened a door next to them. */
  ok('and still nothing private', !('surveyToken' in row) && !('pinHash' in row) &&
    !('phone' in row) && !('debt' in row), Object.keys(row).join(','));
}

/* ---------- 5. the counting, in rollup.js ---------- */
{
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext('var document = { getElementById: function(){ return null; }, createElement: function(){ return {}; }, body: { appendChild: function(){} } };', ctx);
  vm.runInContext(fs.readFileSync(PUBLIC + '/taxonomy.js', 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(PUBLIC + '/rollup.js', 'utf8'), ctx);

  const roster = [
    { id: '1', campus: 'poipet', staffType: 'campus', country: 'Cambodia' },
    { id: '2', campus: 'poipet', staffType: 'campus', country: 'Cambodia' },
    { id: '3', campus: 'poipet', staffType: 'yap', country: 'Cambodia' },
    { id: '4', campus: 'poipet', staffType: 'ministry', country: 'United States' },
    { id: '5', campus: 'poipet', staffType: 'ministry', country: 'South Korea' },
    { id: '6', campus: 'poipet', staffType: '', country: '' },              // said neither
    { id: '7', campus: 'poipet', staffType: 'ministry', country: '' },      // said one
    { id: '8', campus: 'siemreap', staffType: 'ministry', country: 'Australia' },
  ];
  ctx.__D = { entries: { poipet: { 'Base Leadership|Campus Leadership|Total Staff': { 1: 11 } } },
    survey: [], roster: roster, week: 52 };
  vm.runInContext('var R = gpRollup(__D); var B = R.staffBreakdown(["poipet"]);', ctx);
  const g = expr => vm.runInContext(expr, ctx);

  ok('counts the people at that campus only', g('B.counted') === 7, g('B.counted'));
  ok('campus staff', g('B.types.campus') === 2, g('B.types.campus'));
  ok('YAP', g('B.types.yap') === 1, g('B.types.yap'));
  ok('ministry staff', g('B.types.ministry') === 3, g('B.types.ministry'));
  ok('nobody is guessed into a type', g('B.noType') === 1, g('B.noType'));
  ok('every person is in exactly one bucket',
    g('B.types.campus + B.types.yap + B.types.ministry + B.noType') === g('B.counted'));

  ok('Khmer', g('B.khmer') === 3, g('B.khmer'));
  ok('international', g('B.international') === 2, g('B.international'));
  ok('countries counted once each', g('B.countries') === 3, g('B.countries') + ' ' + g('JSON.stringify(B.countryList)'));
  ok('the home country leads the list', g('B.countryList[0]') === 'Cambodia', g('B.countryList[0]'));
  ok('people who have not said are not folded into either side',
    g('B.noCountry') === 2 && g('B.khmer + B.international + B.noCountry') === g('B.counted'),
    'noCountry=' + g('B.noCountry'));
  ok('the country list adds up to the people who answered',
    g('B.countryList.reduce(function(a,c){ return a+B.perCountry[c]; },0)') === g('B.khmer + B.international'));

  /* The headline is everyone here; the breakdown only knows the people with
     profiles. When the base has logged a bigger number, say so rather than let
     the split quietly describe a smaller base. */
  ok('the gap to the logged headcount is reported', g('B.missing') === 4, g('B.missing'));

  vm.runInContext('var B2 = gpRollup({entries:{},survey:[],roster:[],week:52}).staffBreakdown(["poipet"]);', ctx);
  ok('an empty base renders nothing rather than zeros', g('gpStaffMixHtml(B2)') === '');
  vm.runInContext('var B3 = gpRollup({entries:{},survey:[],roster:null,week:52}).staffBreakdown(["poipet"]);', ctx);
  ok('no roster at all is null, not a fake zero', g('B3') === null);

  /* What actually reaches the screen. */
  const html = g('gpStaffMixHtml(B)');
  ok('the mix renders the three kinds of staff',
    /Campus/.test(html) && /YAP/.test(html) && /Ministry/.test(html));
  ok('the nationality line is a button that opens the country list',
    /data-staffmix/.test(html) && /3 Khmer/.test(html) && /2 international/.test(html) && /3 countries/.test(html));
  ok('no {placeholder} survives into the markup', html.indexOf('{') === -1);
}

/* ---------- 6. every new string can be translated ---------- */
{
  const g = {};
  new Function('g', fs.readFileSync(PUBLIC + '/km.js', 'utf8') + '\ng.R=REVIEWED_KM; g.P=PENDING_KM; g.B=BUILTIN_KM;')(g);
  const need = ['What kind of staff are you?', 'Home country', 'Campus staff', 'Ministry staff',
    'Where we are from', 'Khmer', 'international', '{n} Khmer', '{n} international', '{n} countries'];
  const missing = need.filter(k => !(k in g.B));
  ok('the new labels have Khmer', missing.length === 0, missing.join(' | '));
  /* Unreviewed Khmer must never land in the reviewed dictionary — that is what
     keeps track of which strings a native speaker has actually read. */
  const leaked = need.filter(k => k in g.R);
  ok('and none of it was slipped into the reviewed dictionary', leaked.length === 0, leaked.join(' | '));
  ok('YAP is deliberately left untranslated', !('YAP' in g.B));
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
