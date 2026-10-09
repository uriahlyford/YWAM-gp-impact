/* National holidays are not leave — against the real api.js.

   The base is closed the working week (Mon–Fri) Khmer New Year (14 April)
   and Christmas (25 December) fall in, every year, and on Pchum Ben (dated,
   kept by an admin). Leave over them spends none of the 30 days: work days
   are always counted from a request's dates with the holidays out — never
   from the number stored when it was made — so requests already on file,
   last year's too, come out right. Changing the dated list recounts
   everyone; only an admin may. And the weekly schedules leave out staff on
   leave all week, and say which days someone is away for part of it. Every
   name here is made up. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('holidays');
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
fs.writeFileSync(TMP + '/team-seed.js', 'export default [];');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js');
fs.copyFileSync(REPO + '/netlify/functions/legal-docs-default.js', TMP + '/legal-docs-default.js');  // the legal forms teams sign
fs.copyFileSync(REPO + '/netlify/functions/legal-pdf.js', TMP + '/legal-pdf.js');  // and the signed-PDF builder
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const st = (o) => ({ role: '', active: true, campus: 'siemreap', staffType: 'campus', dept: 'Community Service', ministry: 'Cafe', ...o });
mem.staff = [
  st({ id: 'st_a', name: 'Ana Example', username: 'ana' }),
  st({ id: 'st_b', name: 'Ben Example', username: 'ben' }),
  st({ id: 'st_c', name: 'Cal Example', username: 'cal' }),
  st({ id: 'st_k', name: 'Kara Cook', username: 'kara', dept: 'Skills Training', ministry: 'Culinary' }),
  st({ id: 'st_ad', name: 'Adam Admin', username: 'adam', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true }),
].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return await res.json().catch(() => null);
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const trip = (id, staffId, from, to, o) => ({ id, staffId, campus: 'siemreap', from, to, type: 'personal', status: 'approved', reason: '', ...o });
// requests already on file, each stored with the count it was made with (holidays included)
mem.trips = [
  trip('t1', 'st_a', '2025-12-15', '2025-12-26', { workDays: 10 }),      // Christmas 2025 is a Thursday: Dec 22–26 off
  trip('t2', 'st_a', '2025-12-22', '2025-12-26', { workDays: 5 }),       // all of Christmas week
  trip('t3', 'st_a', '2026-04-13', '2026-04-24', { workDays: 10 }),      // Khmer New Year 2026: Apr 13–17
  trip('t4', 'st_a', '2026-10-12', '2026-10-16', { workDays: 5 }),       // Pchum Ben 2026: Oct 12–14
  trip('t5', 'st_a', '2026-10-12', '2026-10-16', { workDays: 5, type: 'outside' }),
  trip('t6', 'st_a', '2026-03-02', '2026-03-06', { workDays: 5, status: 'declined' }),
];
let r = await call('getMyTrips', ['ana', '1234']);
const wd = (id) => r.trips.find(x => x.id === id).workDays;
ok('Christmas week is not counted: a fortnight up to Dec 26 is 5 work days, not 10', wd('t1') === 5, wd('t1'));
ok('leave over the whole Christmas week spends nothing', wd('t2') === 0);
ok('Khmer New Year week is not counted', wd('t3') === 5);
ok('Pchum Ben (Oct 12–14 this year) is not counted', wd('t4') === 2);
ok('the year totals follow: 2025 personal 5, 2026 personal 7, outside 2, declined nothing', r.totals['2025'].personal === 5 && r.totals['2026'].personal === 7 && r.totals['2026'].outside === 2, JSON.stringify(r.totals));
const yNow = new Date().getUTCFullYear();
const hol = r.holidays.filter(h => h.from.slice(0, 4) === String(yNow));
ok('the leave page is sent this year’s holidays', hol.some(h => h.name === 'Khmer New Year') && hol.some(h => h.name === 'Christmas week'), JSON.stringify(hol));
ok('2026’s are the right weeks', r.holidays.some(h => h.name === 'Khmer New Year' && h.from === '2026-04-13' && h.to === '2026-04-17') && r.holidays.some(h => h.name === 'Christmas week' && h.from === '2026-12-21' && h.to === '2026-12-25') && r.holidays.some(h => h.name === 'Pchum Ben' && h.from === '2026-10-12' && h.to === '2026-10-14'));
{ const t7 = await call('saveTrip', ['cal', '1234', { from: '2027-12-20', to: '2027-12-24', type: 'personal' }]);
  ok('a Christmas on a Saturday takes the working week before it (2027: Dec 20–24)', t7.ok && t7.trips[0].workDays === 0, JSON.stringify(t7.trips && t7.trips[0])); }

r = await call('saveTrip', ['ben', '1234', { from: '2026-12-21', to: '2027-01-01', type: 'personal' }]);
ok('a new request over Christmas counts only the days the base is open', r.ok && r.trips[0].workDays === 5 && r.totals['2026'].personal === 5, JSON.stringify(r.trips[0]));

console.log('=== an admin keeps the dated holidays ===');
r = await call('adminListTrips', ['adam', '1234']);
ok('Admin → Leave carries the holidays and the dated list', r.ok && r.holidaysDated.some(h => h.from === '2026-10-12') && r.holidays.length > 0);
ok('… with everyone recounted', r.totals.st_a['2025'].personal === 5);
ok('only an admin may change them', (await call('adminSaveHolidays', ['ana', '1234', []])).ok === false && !mem.holidays);
r = await call('adminSaveHolidays', ['adam', '1234', [{ name: 'Pchum Ben', from: '2026-10-13', to: '2026-10-15' }, { name: '', from: '2026-01-01' }, { name: 'Backwards', from: '2026-05-08', to: '2026-05-06' }, { name: 'Too long', from: '2026-01-01', to: '2026-06-01' }]]);
ok('saved cleaned: blank names and spans over a month dropped, backwards dates turned round', r.ok && mem.holidays.length === 2 && mem.holidays.some(h => h.name === 'Backwards' && h.from === '2026-05-06'), JSON.stringify(mem.holidays));
r = await call('getMyTrips', ['ana', '1234']);
ok('moving Pchum Ben recounts at once: Oct 12–16 is now Mon and Fri', r.trips.find(x => x.id === 't4').workDays === 2 && r.holidays.some(h => h.from === '2026-10-13'));
await call('adminSaveHolidays', ['adam', '1234', []]);
r = await call('getMyTrips', ['ana', '1234']);
ok('with no dated holidays, Pchum Ben counts again — Christmas and Khmer New Year still don’t', r.trips.find(x => x.id === 't4').workDays === 5 && r.trips.find(x => x.id === 't2').workDays === 0);

console.log('=== the weekly schedules leave out staff on leave ===');
mem.trips = [
  trip('a1', 'st_a', '2026-11-02', '2026-11-06'),                                     // Ana away all of Mon–Fri
  trip('b1', 'st_b', '2026-11-03', '2026-11-04', { type: 'outside', status: 'pending' }), // Ben away Tue, Wed
  trip('c1', 'st_c', '2026-11-02', '2026-11-06', { status: 'declined' }),             // Cal's was declined
];
r = await call('getDuty', ['kara', '1234', 'kitchen', '2026-11-01']);
const names = r.people.flatMap(g => g.names);
ok('someone on leave the whole working week isn’t on offer', !names.includes('Ana Example'), names.join());
ok('someone away part of the week is, with the days they are gone', names.includes('Ben Example') && r.away['Ben Example'] === 'Tue, Wed', JSON.stringify(r.away));
ok('a declined request keeps nobody off', names.includes('Cal Example') && !r.away['Cal Example']);
r = await call('getDuty', ['kara', '1234', 'kitchen', '2026-11-08']);
ok('the week after, Ana is back', r.people.flatMap(g => g.names).includes('Ana Example') && !r.away['Ana Example']);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
