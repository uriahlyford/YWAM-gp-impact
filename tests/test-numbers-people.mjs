/* Numbers people: each ministry's main person and backup for its weekly
   numbers, due Friday. Checked here: who may set them (the ministry's leader,
   its department's overseer, an admin — not an ordinary member), what may be
   set (people on this campus, two different people, a backup only with a main;
   clearing goes back to the leaders), that Outreach Teams and Campus
   Leadership's own rows have none; that My Ministry's data carries the people,
   whether the viewer may change them, and who last entered each week; and that
   the boot carries what the reminders need — whose numbers are due and whether
   they are in, and a department overseer's done / not done list. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('numbers-people');
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
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),                       // on the Cafe
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', leads: ['Community Service|Cafe'] }),   // leads the Cafe
  mk({ id: 'st3', name: 'Dara Pen', username: 'dara', email: 'd@e.com', dept: 'Campus Leadership', ministry: 'Community Service' }), // overseer
  mk({ id: 'st4', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com', ministry: 'Intercession' }),
  mk({ id: 'st5', name: 'Bopha Keo', username: 'bopha', email: 'b@e.com', campus: 'poipet' }),
  mk({ id: 'st6', name: 'Admin One', username: 'admin', email: 'a@e.com', ministry: 'GP Education', isAdmin: true })
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
const set = (u, dept, min, p) => call('setNumbersPeople', [u, '1234', dept, min, p]);

/* ---------- 1. who may set them ---------- */
{
  let r = await set('sreilea', 'Community Service', 'Cafe', { main: 'st1' });
  ok('an ordinary member cannot choose the numbers people', r.ok === false && r.err === 'not_authorized', JSON.stringify(r));
  r = await set('mealea', 'Community Service', 'Cafe', { main: 'st1', backup: 'st4' });
  ok('the ministry\'s leader can', r.ok === true && r.numbers.main.name === 'Sreilea Chan' && r.numbers.backup.name === 'Vuthy Lim', JSON.stringify(r.numbers));
  r = await set('dara', 'Community Service', 'Intercession', { main: 'st4' });
  ok('so can the department\'s overseer, for any ministry in it', r.ok === true && r.numbers.main.id === 'st4');
  r = await set('admin', 'Community Service', 'GP Education', { main: 'st6' });
  ok('and an admin', r.ok === true);
  r = await set('dara', 'Youth Education', 'Sports', { main: 'st1' });
  ok('an overseer cannot for another department', r.ok === false && r.err === 'not_authorized');
}

/* ---------- 2. what may be set ---------- */
{
  let r = await set('mealea', 'Community Service', 'Cafe', { main: 'st5' });
  ok('not someone from the other campus', r.ok === false && r.err === 'bad_person');
  r = await set('mealea', 'Community Service', 'Cafe', { main: 'st1', backup: 'st1' });
  ok('not the same person twice', r.ok === false && r.err === 'same_person');
  r = await set('mealea', 'Community Service', 'Cafe', { main: '', backup: 'st4' });
  ok('not a backup without a main', r.ok === false && r.err === 'backup_needs_main');
  r = await set('admin', 'Community Service', 'Outreach Teams', { main: 'st1' });
  ok('Outreach Teams has none — left as it is', r.ok === false);
  r = await set('admin', 'Campus Leadership', 'Community Service', { main: 'st3' });
  ok('nor do Campus Leadership\'s own rows (no weekly numbers)', r.ok === false);
  ok('nothing refused was stored', mem.numbersPeople['siemreap|Community Service|Cafe'].main === 'st1' &&
    !mem.numbersPeople['siemreap|Community Service|Outreach Teams']);
}

/* ---------- 3. what My Ministry sees ---------- */
{
  let d = await call('getMyMinistry', ['sreilea', '1234']);
  ok('My Ministry carries the numbers people', d.numbers && d.numbers.main.name === 'Sreilea Chan' && d.numbers.backup.name === 'Vuthy Lim');
  ok('and an ordinary member may not change them', d.numbers.canSet === false);
  d = await call('getMinistryFor', ['mealea', '1234', 'Community Service', 'Cafe']);
  ok('the leader may', d.numbers && d.numbers.canSet === true);
  d = await call('getMinistryFor', ['dara', '1234', 'Community Service', 'Cafe']);
  ok('and so may the overseer', d.numbers && d.numbers.canSet === true);
  await set('mealea', 'Community Service', 'Cafe', { main: '' });
  d = await call('getMyMinistry', ['sreilea', '1234']);
  ok('cleared, it falls back to the ministry\'s leaders', d.numbers.main === null && d.numbers.defaulted === true &&
    d.numbers.leaders.map(p => p.name).join() === 'Mealea Sok', JSON.stringify(d.numbers));
  await set('mealea', 'Community Service', 'Cafe', { main: 'st1', backup: 'st4' });

  await call('saveMyMinistry', ['sreilea', '1234', WK, [{ metric: 'Weekly Profit ($)', value: 120 }]]);
  d = await call('getMyMinistry', ['sreilea', '1234']);
  ok('a saved week says who entered it', d.numbers.lastBy[String(WK)] && d.numbers.lastBy[String(WK)].name === 'Sreilea Chan', JSON.stringify(d.numbers.lastBy));
  const day = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  await call('saveKpiDayFor', ['mealea', '1234', 'Community Service', 'Cafe', day, [{ metric: 'Cups Sold', mode: 'sum', value: 30 }]]);
  d = await call('getMyMinistry', ['sreilea', '1234']);
  ok('a day\'s numbers count too, and the latest person wins', d.numbers.lastBy[String(WK)].name === 'Mealea Sok', JSON.stringify(d.numbers.lastBy));
  ok('Outreach Teams\' page carries nothing new', !(await call('getMinistryFor', ['admin', '1234', 'Community Service', 'Outreach Teams'])).numbers);
}

/* ---------- 4. what the reminders need ---------- */
{
  let b = await call('getMyBoot', ['vuthy', '1234']);
  const cafe = b.numbers.duty.find(x => x.ministry === 'Cafe'), inter = b.numbers.duty.find(x => x.ministry === 'Intercession');
  ok('the backup is responsible for the Cafe', cafe && cafe.role === 'backup');
  ok('and the main for Intercession', inter && inter.role === 'main');
  ok('the Cafe is in this week', cafe.logged[WK] === true, JSON.stringify(cafe.logged));
  ok('Intercession is not', inter.logged[WK] === false);
  b = await call('getMyBoot', ['sreilea', '1234']);
  ok('the main person has the Cafe too', b.numbers.duty.some(x => x.ministry === 'Cafe' && x.role === 'main'));
  b = await call('getMyBoot', ['mealea', '1234']);
  ok('a leader is not nagged once someone is set', !b.numbers.duty.some(x => x.ministry === 'Cafe'));
  await set('mealea', 'Community Service', 'Cafe', { main: '' });
  b = await call('getMyBoot', ['mealea', '1234']);
  ok('but is, by default, when nobody is', b.numbers.duty.some(x => x.ministry === 'Cafe' && x.role === 'leader'));
  await set('mealea', 'Community Service', 'Cafe', { main: 'st1', backup: 'st4' });

  b = await call('getMyBoot', ['dara', '1234']);
  const D = b.numbers.dept;
  ok('the overseer gets the department\'s list', D && D.dept === 'Community Service');
  ok('with which ministries are in this week', D.logged[WK].indexOf('Cafe') > -1 && D.logged[WK].indexOf('Intercession') === -1, JSON.stringify(D.logged));
  ok('and who is responsible for each', D.people.Cafe.main.name === 'Sreilea Chan' && D.people.Intercession.main.name === 'Vuthy Lim');
  ok('and the leaders, for ministries nobody is set on', D.leaders.Cafe.map(p => p.name).join() === 'Mealea Sok');
  b = await call('getMyBoot', ['sreilea', '1234']);
  ok('an ordinary member gets no department list', b.numbers.dept === null);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
