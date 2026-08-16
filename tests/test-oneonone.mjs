/* The one-on-one, in three answers — and asking for one.

   WHY THIS CHANGED. "Did I have a one-on-one this week?" said nothing about which
   side of it you were on. A one-on-one is a mentoring conversation, so people
   answered yes for giving one and yes for getting one, and both went in the same
   box. Worse, a "no" hid two completely different weeks: my mentor never made
   time, or I never asked. Only one of those is mine to fix.

   So: `oneOnOne` still means "it happened" — every row written before this reads
   exactly as it always did — `oneOnOneAsked` carries the middle answer, and
   `gaveOneOnOne` is the other side entirely.

   The asking is the part with teeth: one tap reaches your ONE approved mentor and
   stays on their Team tab until somebody clears it. This file checks it reaches
   that person and nobody else.

   Staff debt gained an amount. The amount reaches the person and their mentor;
   the base gets one pooled total and never the rows behind it, because an unusual
   figure is close to a name in a base this size. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('oneonone');
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

/* compositeOf, from the file the two pages actually load. */
const tax = {};
new Function('g', fs.readFileSync(path.join(PUBLIC, 'taxonomy.js'), 'utf8') +
  '\ng.composite=compositeOf; g.oo=oneOnOneScore;')(tax);

const MENTOR = { id: 'st_mentor', name: 'Sokha Chan', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_m' };
const MENTEE = { id: 'st_mentee', name: 'Dara Pen', username: 'dara', campus: 'poipet',
  dept: 'Youth Education', ministry: 'YDC', role: 'Teacher', active: true, surveyToken: 'tok_d',
  mentorId: 'st_mentor', mentorStatus: 'approved' };
const OTHER = { id: 'st_other', name: 'Nita Sok', username: 'nita', campus: 'poipet',
  dept: 'Youth Education', ministry: 'Sports', role: 'Coach', active: true, surveyToken: 'tok_n' };

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
  mem.staff = [MENTOR, MENTEE, OTHER].map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
  Object.assign(mem, extra || {});
}
const FULL = { lonely: 3, clarity: 8, growth: 7 };

/* ---------- 1. the three answers round-trip ---------- */
seed();
let r = await call('saveMyWeek', ['dara', '1234', 10, { ...FULL, oneOnOne: true, oneOnOneAsked: false }]);
let wk = (r.body.checkins || []).find(c => Number(c.week) === 10);
ok('"yes, we met" stores as the one-on-one having happened',
  wk && wk.oneOnOne === 1 && wk.oneOnOneAsked === 0, JSON.stringify(wk && { o: wk.oneOnOne, a: wk.oneOnOneAsked }));

r = await call('saveMyWeek', ['dara', '1234', 11, { ...FULL, oneOnOne: false, oneOnOneAsked: true }]);
wk = (r.body.checkins || []).find(c => Number(c.week) === 11);
ok('"I asked, not yet" is its own answer, not a no',
  wk && wk.oneOnOne === 0 && wk.oneOnOneAsked === 1, JSON.stringify(wk && { o: wk.oneOnOne, a: wk.oneOnOneAsked }));

r = await call('saveMyWeek', ['dara', '1234', 12, { ...FULL, oneOnOne: false, oneOnOneAsked: false }]);
wk = (r.body.checkins || []).find(c => Number(c.week) === 12);
ok('"I have not asked" stores as neither', wk && wk.oneOnOne === 0 && wk.oneOnOneAsked === 0);

/* ---------- 2. giving one is a different question ---------- */
r = await call('saveMyWeek', ['dara', '1234', 13, { ...FULL, oneOnOne: false, oneOnOneAsked: false, gaveOneOnOne: true }]);
wk = (r.body.checkins || []).find(c => Number(c.week) === 13);
ok('giving a one-on-one is recorded separately from getting one',
  wk && wk.gaveOneOnOne === 1 && wk.oneOnOne === 0,
  JSON.stringify(wk && { got: wk.oneOnOne, gave: wk.gaveOneOnOne }));

/* ---------- 3. the health score ----------
   Met is worth full marks, asked is worth half — because they did their part —
   and not asking is worth nothing. Mentoring somebody ELSE is not in the score at
   all: it is ministry, not a measure of your own health. */
{
  const base = { lonely: 3, clarity: 8, growth: 7, porn: 0, exercise: 1, quietTime: 1, debt: 0, sharedFaith: 1, sabbath: 1 };
  ok('the three answers score 10 / 5 / 0',
    tax.oo({ oneOnOne: 1 }) === 10 && tax.oo({ oneOnOne: 0, oneOnOneAsked: 1 }) === 5 &&
    tax.oo({ oneOnOne: 0, oneOnOneAsked: 0 }) === 0);
  const met = tax.composite({ ...base, oneOnOne: 1 });
  const asked = tax.composite({ ...base, oneOnOne: 0, oneOnOneAsked: 1 });
  const never = tax.composite({ ...base, oneOnOne: 0, oneOnOneAsked: 0 });
  ok('so asking sits between meeting and not asking', met > asked && asked > never,
    [met, asked, never].map(x => x.toFixed(2)).join(' > '));
  ok('giving a one-on-one does not move your own health score',
    tax.composite({ ...base, oneOnOne: 1, gaveOneOnOne: 1 }) === met);
  /* A row written before any of this only has `oneOnOne`, and must read exactly
     as it always did rather than losing or gaining marks. */
  ok('a row from before the change scores the same as it always did',
    tax.composite({ ...base, oneOnOne: 1 }) === met &&
    tax.composite({ ...base, oneOnOne: 0 }) === never);
}

/* ---------- 4. staff debt, and how much ---------- */
seed();
r = await call('saveMyWeek', ['dara', '1234', 20, { ...FULL, debt: true, debtAmount: 450 }]);
wk = (r.body.checkins || []).find(c => Number(c.week) === 20);
ok('an amount is stored with the debt', wk && wk.debt === 1 && wk.debtAmount === 450,
  JSON.stringify(wk && { d: wk.debt, a: wk.debtAmount }));
ok('and reaches the profile, so the amount is not only this week\'s',
  mem.staff.find(x => x.id === 'st_mentee').debtAmount === 450);

r = await call('saveMyWeek', ['dara', '1234', 21, { ...FULL, debt: false, debtAmount: 450 }]);
wk = (r.body.checkins || []).find(c => Number(c.week) === 21);
ok('answering "no debt" clears the amount rather than leaving last week\'s attached',
  wk && wk.debt === 0 && wk.debtAmount === 0, JSON.stringify(wk && { d: wk.debt, a: wk.debtAmount }));

r = await call('saveMyWeek', ['dara', '1234', 22, { ...FULL, debt: true, debtAmount: 99999999 }]);
wk = (r.body.checkins || []).find(c => Number(c.week) === 22);
ok('an absurd amount is refused rather than swamping the base total', wk && wk.debtAmount === 0,
  String(wk && wk.debtAmount));

/* ---------- 5. the amount is private; only the total is not ---------- */
seed();
await call('saveMyWeek', ['dara', '1234', 30, { ...FULL, debt: true, debtAmount: 450 }]);
await call('saveMyWeek', ['nita', '1234', 30, { ...FULL, debt: true, debtAmount: 200 }]);
await call('saveMyWeek', ['sokha', '1234', 30, { ...FULL, debt: false }]);
r = await call('getData', ['']);
{
  const rows = r.body.survey || [];
  ok('no survey row handed to the dashboard carries an amount',
    rows.length === 3 && rows.every(x => x.debtAmount === undefined),
    JSON.stringify(rows.map(x => x.debtAmount)));
  const dt = (r.body.debtTotals || {}).poipet;
  ok('the base gets one pooled total instead', dt && dt.total === 650 && dt.people === 2,
    JSON.stringify(dt));
}

/* Somebody who has answered ten weeks is one person, not ten. */
seed();
for (const w of [30, 31, 32, 33]) await call('saveMyWeek', ['dara', '1234', w, { ...FULL, debt: true, debtAmount: 450 }]);
r = await call('getData', ['']);
ok('four weeks of the same debt count once, not four times',
  r.body.debtTotals.poipet.total === 450 && r.body.debtTotals.poipet.people === 1,
  JSON.stringify(r.body.debtTotals.poipet));

/* And it is the LATEST week that counts — a debt paid off should stop showing. */
await call('saveMyWeek', ['dara', '1234', 34, { ...FULL, debt: false }]);
r = await call('getData', ['']);
ok('paying it off in a later week takes it out of the total',
  r.body.debtTotals.poipet.total === 0 && r.body.debtTotals.poipet.people === 0,
  JSON.stringify(r.body.debtTotals.poipet));

/* The mentor, who already sees these answers by name, does see the amount. */
seed();
await call('saveMyWeek', ['dara', '1234', 30, { ...FULL, debt: true, debtAmount: 450 }]);
r = await call('getMenteeLogs', ['sokha', '1234', 'st_mentee']);
ok('a mentor sees their mentee\'s own figure',
  (r.body.checkins || []).some(c => c.debtAmount === 450),
  JSON.stringify((r.body.checkins || []).map(c => c.debtAmount)));
r = await call('getMenteeLogs', ['nita', '1234', 'st_mentee']);
ok('somebody who is not their mentor sees nothing at all',
  r.body && r.body.ok === false, JSON.stringify(r.body));

/* ---------- 6. asking for a one-on-one ---------- */
seed();
r = await call('askForOneOnOne', ['dara', '1234', 30]);
ok('asking works', r.body && r.body.ok === true, JSON.stringify(r.body));
r = await call('getOneOnOneAsks', ['sokha', '1234']);
ok('and lands on the mentor', r.body.asks.length === 1 && r.body.asks[0].fromName === 'Dara Pen',
  JSON.stringify(r.body.asks));
ok('with the week it was asked in', r.body.asks[0].week === 30);

r = await call('getOneOnOneAsks', ['nita', '1234']);
ok('and on nobody else', r.body.asks.length === 0);

/* Asking twice is still one ask. A fortnight of unanswered asks should read as
   one person still waiting, not a pile-up the mentor has to clear one by one. */
await call('askForOneOnOne', ['dara', '1234', 31]);
r = await call('getOneOnOneAsks', ['sokha', '1234']);
ok('asking again is the same ask, moved to this week',
  r.body.asks.length === 1 && r.body.asks[0].week === 31, JSON.stringify(r.body.asks));

/* Either side may clear it. */
const askId = r.body.asks[0].id;
r = await call('clearOneOnOneAsk', ['nita', '1234', askId]);
ok('a stranger cannot clear it', r.body && r.body.err === 'not_yours', JSON.stringify(r.body));
r = await call('clearOneOnOneAsk', ['sokha', '1234', askId]);
ok('the mentor can, and it goes off their tab', r.body.ok === true && r.body.asks.length === 0);

seed();
await call('askForOneOnOne', ['dara', '1234', 30]);
{
  const id = (await call('getOneOnOneAsks', ['sokha', '1234'])).body.asks[0].id;
  r = await call('clearOneOnOneAsk', ['dara', '1234', id]);
  ok('and so can the person who asked, if they no longer need to', r.body.ok === true);
}

/* Somebody with no approved mentor has nobody to ask, and is told so rather than
   having the ask vanish. */
seed();
r = await call('askForOneOnOne', ['nita', '1234', 30]);
ok('with no mentor the ask is refused, with a reason',
  r.body && r.body.ok === false && r.body.err === 'no_mentor', JSON.stringify(r.body));

/* A pending mentor is not an approved one. */
seed();
mem.staff.find(x => x.id === 'st_mentee').mentorStatus = 'pending';
r = await call('askForOneOnOne', ['dara', '1234', 30]);
ok('a mentor who has not accepted yet cannot be asked', r.body.err === 'no_mentor');

/* An ask does not outlive the mentoring relationship it belongs to. */
seed();
await call('askForOneOnOne', ['dara', '1234', 30]);
mem.staff.find(x => x.id === 'st_mentee').mentorId = '';
mem.staff.find(x => x.id === 'st_mentee').mentorStatus = '';
r = await call('getOneOnOneAsks', ['sokha', '1234']);
ok('and it disappears when the mentoring does', r.body.asks.length === 0, JSON.stringify(r.body.asks));

r = await call('askForOneOnOne', ['', '', 30]);
ok('an anonymous caller cannot ask on somebody\'s behalf', r.body && r.body.err === 'auth');
seed();   // the block above unpicked the mentoring; a week check needs a mentor first
r = await call('askForOneOnOne', ['dara', '1234', 99]);
ok('a week outside 1-52 is refused', r.body && r.body.err === 'bad_week', JSON.stringify(r.body));

/* ---------- 6b. one-on-ones held, and the two-a-month rhythm ----------
   The mentor logs the meeting at the end of it, which is the only moment anybody
   actually knows it happened. Two a month per person is what the base is aiming
   at, so the count is what the screens read. */
seed();
const THIS_MONTH = new Date().toISOString().slice(0, 10);
r = await call('logOneOnOne', ['sokha', '1234', 'st_mentee', THIS_MONTH]);
ok('a mentor can log a one-on-one', r.body && r.body.ok === true, JSON.stringify(r.body && r.body.err));
ok('and it counts toward two a month', r.body.count.held === 1 && r.body.count.target === 2,
  JSON.stringify(r.body.count));
await call('logOneOnOne', ['sokha', '1234', 'st_mentee', THIS_MONTH]);
r = await call('getMenteeLogs', ['sokha', '1234', 'st_mentee']);
ok('the mentee page reads the same count', r.body.oneOnOnes.held === 2, JSON.stringify(r.body.oneOnOnes));
ok('and can undo the last one', (r.body.oneOnOneLog || []).length === 2, JSON.stringify(r.body.oneOnOneLog));

/* Last month's meetings are last month's — the rhythm is monthly or it is not a
   rhythm. */
seed();
await call('logOneOnOne', ['sokha', '1234', 'st_mentee', '2020-01-15']);
r = await call('getMenteeLogs', ['sokha', '1234', 'st_mentee']);
ok('a meeting in another month does not count toward this one',
  r.body.oneOnOnes.held === 0, JSON.stringify(r.body.oneOnOnes));
ok('but it is still in the log', (r.body.oneOnOneLog || []).length === 1);

/* The mentor's list carries each person's count, so who has been missed is
   visible without opening every mentee. */
seed();
await call('logOneOnOne', ['sokha', '1234', 'st_mentee', THIS_MONTH]);
r = await call('getMyMentees', ['sokha', '1234']);
ok('the mentee list carries the count', r.body.mentees[0].oneOnOnes.held === 1,
  JSON.stringify(r.body.mentees[0].oneOnOnes));

/* Logging one clears the person's open ask — they asked and have now had it. */
seed();
await call('askForOneOnOne', ['dara', '1234', 30]);
await call('logOneOnOne', ['sokha', '1234', 'st_mentee', THIS_MONTH]);
r = await call('getOneOnOneAsks', ['sokha', '1234']);
ok('logging the meeting clears the ask that led to it', r.body.asks.length === 0,
  JSON.stringify(r.body.asks));

/* Only their mentor, and only theirs. */
r = await call('logOneOnOne', ['nita', '1234', 'st_mentee', THIS_MONTH]);
ok('somebody who is not their mentor cannot log one for them',
  r.body && r.body.err === 'not_your_mentee', JSON.stringify(r.body));
r = await call('logOneOnOne', ['', '', 'st_mentee', THIS_MONTH]);
ok('and an anonymous caller cannot either', r.body && r.body.err === 'auth');

/* Undo, because a button pressed by accident at the end of a long day should not
   need a developer. */
seed();
await call('logOneOnOne', ['sokha', '1234', 'st_mentee', THIS_MONTH]);
{
  const id = (await call('getMenteeLogs', ['sokha', '1234', 'st_mentee'])).body.oneOnOneLog[0].id;
  r = await call('undoOneOnOne', ['nita', '1234', id]);
  ok('only the mentor who logged it can undo it', r.body && r.body.err === 'not_yours', JSON.stringify(r.body));
  r = await call('undoOneOnOne', ['sokha', '1234', id]);
  ok('and undoing takes it back off the count', r.body.ok === true && r.body.count.held === 0,
    JSON.stringify(r.body.count));
}
r = await call('undoOneOnOne', ['sokha', '1234', 'oh_nothing']);
ok('undoing something that is not there says so', r.body && r.body.err === 'not_found');

/* A junk blob must not take the mentee page down. */
seed();
mem.oneOnOnes = { not: 'an array' };
r = await call('getMenteeLogs', ['sokha', '1234', 'st_mentee']);
ok('a junk one-on-ones blob reads as zero rather than 500',
  r.status === 200 && r.body.ok === true && r.body.oneOnOnes.held === 0,
  r.status + ' ' + JSON.stringify(r.body.oneOnOnes));

/* ---------- 7. the boot carries it, still in one invocation ---------- */
seed();
await call('askForOneOnOne', ['dara', '1234', 30]);
r = await call('getMyBoot', ['sokha', '1234']);
ok('the mentor\'s boot carries the asks waiting for them',
  (r.body.oneOnOneAsks || []).length === 1, JSON.stringify(r.body.oneOnOneAsks));
r = await call('getMyBoot', ['dara', '1234']);
ok('and the asker\'s boot says their own ask is still open',
  r.body.myOneOnOneAsk && r.body.myOneOnOneAsk.week === 30, JSON.stringify(r.body.myOneOnOneAsk));
ok('and their profile carries their debt figure',
  r.body.profile && r.body.profile.debtAmount === 0, JSON.stringify(r.body.profile));

/* ---------- 8. a junk blob does not take the tab down ---------- */
seed();
mem.oneOnOneAsks = { not: 'an array' };
r = await call('getOneOnOneAsks', ['sokha', '1234']);
ok('a junk asks blob reads as empty rather than 500',
  r.status === 200 && r.body.ok === true && r.body.asks.length === 0, r.status + ' ' + JSON.stringify(r.body));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
