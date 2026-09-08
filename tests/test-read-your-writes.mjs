/* A save must answer with what it saved.

   Almost every write handler answers by calling the matching read function —
   saveMyKpiDay ends with getMyMinistry, saveTrip with getMyTrips, saveDaily
   used to end with getMyLogs. Netlify Blobs has no compare-and-swap, and a read
   issued straight after a write can still be served the older version, so those
   answers could describe the data as it was BEFORE the write. The client
   believes the answer and paints the old value back.

   That is one root cause behind a family of reports that all sounded like
   different bugs: a habit tile unticking itself, a week total that stays where
   it was after you type today's figure, a headcount box snapping back to blank,
   a leave request that does not appear until you reload.

   The store here is deliberately hostile: every read is served a version 200ms
   behind the writes. A strongly-consistent store — which every other test in
   the suite uses — hides this class completely.

   readJSON/writeJSON now keep a per-request scope so a request reads its own
   writes. This file is what stops that being quietly removed, and what catches
   a NEW handler written in the old shape. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const LAG = 200;
const TMP = tmpDir('ryw');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
/* 'live' is what has been written; 'seen' is what a read may see yet. */
const live = {}, seen = {};
export function getStore(){ return {
  get: async (k)=> (k in seen) ? JSON.parse(JSON.stringify(seen[k])) : null,
  setJSON: async (k,v)=>{
    live[k] = JSON.parse(JSON.stringify(v));
    setTimeout(function(){ seen[k] = JSON.parse(JSON.stringify(live[k])); }, ${LAG});
  },
};}
export const __live = live;
export function __seed(k,v){ live[k]=v; seen[k]=JSON.parse(JSON.stringify(v)); }
export function __settle(){ for (const k of Object.keys(live)) seen[k] = JSON.parse(JSON.stringify(live[k])); }
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');

const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const ME = { id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com',
  campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', role: 'Cafe manager',
  active: true, isAdmin: true, surveyToken: 'tok1', staffType: 'ministry', country: 'Cambodia',
  habits: [{ id: 'bible', mentorVisible: true }, { id: 'quietTime', mentorVisible: true }] };
const MATE = { id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com',
  campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', role: 'Barista',
  active: true, surveyToken: 'tok2', mentorId: 'st1', mentorStatus: 'pending' };
blobs.__seed('staff', [ME, MATE].map(s => ({ ...s, pinSalt: s.id, pinHash: H('1234', s.id) })));

const call = async (fn, args) => {
  const r = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: r.status, body: await r.json().catch(() => null) };
};
const YEAR = new Date().getFullYear();
const WK = (() => { const d = new Date(), j = new Date(YEAR, 0, 1);
  const m = new Date(YEAR, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); })();
const TODAY = new Date().toLocaleDateString('en-CA');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* ---------- the daily habit tap ---------- */
{
  const r = await call('saveDaily', ['sreilea', '1234', TODAY,
    { langHours: 0, minHours: 0, bible: true, habits: { bible: true, quietTime: false } }]);
  const day = ((r.body && r.body.logs) || [])[0];
  ok('saveDaily answers with the tap it just stored',
    !!day && day.habits && day.habits.bible === true, JSON.stringify(day && day.habits));
}

/* ---------- today's KPI figure, rolled into the week ---------- */
{
  const r = await call('saveMyKpiDay', ['sreilea', '1234', TODAY,
    [{ metric: 'Cups Sold', value: 55, mode: 'sum' }]]);
  const wks = ((r.body && r.body.entries) || {})['Cups Sold'];
  ok('saveMyKpiDay answers with the new week total',
    !!wks && Number(wks[String(WK)]) === 55, JSON.stringify(wks || null));
}

/* ---------- the weekly headcount box ---------- */
{
  const r = await call('saveMyMinistry', ['sreilea', '1234', WK,
    [{ metric: 'Total in Bank Account ($)', value: 1450 }]]);
  const wks = ((r.body && r.body.entries) || {})['Total in Bank Account ($)'];
  ok('saveMyMinistry answers with the figure just typed',
    !!wks && Number(wks[String(WK)]) === 1450, JSON.stringify(wks || null));
}

/* ---------- which KPIs I log daily ---------- */
{
  const r = await call('saveMyKpiPins', ['sreilea', '1234', ['Cups Sold', 'Days Open']]);
  ok('saveMyKpiPins answers with the new pin list',
    JSON.stringify((r.body && r.body.pins) || []) === JSON.stringify(['Cups Sold', 'Days Open']),
    JSON.stringify(r.body && r.body.pins));
}

/* ---------- the three weekly goals ---------- */
{
  const r = await call('saveGoals', ['sreilea', '1234', WK, [{ text: 'Train Mealea', pct: 60 }]]);
  const g = (r.body && r.body.goals) || [];
  ok('saveGoals answers with the goal just written',
    g.length === 1 && g[0].items[0].text === 'Train Mealea', JSON.stringify(g.length));
}

/* ---------- the weekly health check-in ---------- */
{
  const r = await call('saveMyWeek', ['sreilea', '1234', WK, { lonely: 2, clarity: 8, growth: 7,
    porn: false, oneOnOne: true, exercise: true, quietTime: true, debt: false,
    sharedFaith: true, sabbath: true, langHours: 2 }]);
  const c = (r.body && r.body.checkins) || [];
  ok('saveMyWeek answers with the check-in it just recorded',
    c.some(x => Number(x.week) === WK), c.length + ' rows');
  const d = await call('deleteMyWeek', ['sreilea', '1234', WK]);
  ok('and deleteMyWeek answers without it again',
    !((d.body && d.body.checkins) || []).some(x => Number(x.week) === WK),
    ((d.body && d.body.checkins) || []).length + ' rows');
}

/* ---------- habits I choose to track ---------- */
{
  const list = [{ id: 'bible', mentorVisible: true }, { id: 'workout', mentorVisible: false }];
  const r = await call('saveMyHabits', ['sreilea', '1234', list]);
  const got = (r.body && r.body.habits) || [];
  ok('saveMyHabits answers with the list just chosen',
    got.length === 2 && got[1].id === 'workout', JSON.stringify(got.map(h => h.id)));
}

/* ---------- an annual SMART goal ---------- */
{
  const r = await call('saveSmartGoal', ['sreilea', '1234',
    { year: YEAR, category: 'Faith', title: 'Read the Bible through', meta: '1189 chapters', pct: 10 }]);
  const sg = (r.body && r.body.smartGoals) || [];
  ok('saveSmartGoal answers with the goal just added', sg.length === 1, sg.length + ' goals');
  if (sg.length) {
    const d = await call('deleteSmartGoal', ['sreilea', '1234', sg[0].id]);
    ok('and deleteSmartGoal answers without it', ((d.body && d.body.smartGoals) || []).length === 0);
  }
}

/* ---------- days away from campus ---------- */
{
  const r = await call('saveTrip', ['sreilea', '1234',
    { from: TODAY, to: TODAY, type: 'personal', reason: 'Family' }]);
  const t = (r.body && r.body.trips) || [];
  ok('saveTrip answers with the request just made', t.length === 1, t.length + ' trips');
  if (t.length) {
    const d = await call('deleteTrip', ['sreilea', '1234', t[0].id]);
    ok('and deleteTrip answers without it', ((d.body && d.body.trips) || []).length === 0);
  }
}

/* ---------- a mentor accepting a mentee ---------- */
{
  const r = await call('respondToMentorRequest', ['sreilea', '1234', 'st2', true]);
  ok('respondToMentorRequest answers with the request cleared',
    ((r.body && r.body.requests) || []).length === 0,
    ((r.body && r.body.requests) || []).length + ' still pending');
}

/* ---------- asking someone for a one-on-one ---------- */
/* Needs the approved pair the section above just created — and that approval
   was a DIFFERENT request, so the store has to have caught up before this one
   can see it. Reading your own writes is per-request on purpose; making one
   request see another's unsettled write is the bug, not the fix. */
{
  blobs.__settle();
  const r = await call('requestOneOnOne', ['sreilea', '1234', 'st2', 'Coffee this week?']);
  const l = (r.body && r.body.oneOnOnes) || [];
  ok('requestOneOnOne answers with the request just sent', l.length === 1, l.length + ' requests');
}

/* ---------- an admin message to everyone ---------- */
{
  const r = await call('sendBroadcast', ['sreilea', '1234', 'Staff meeting moved to Thursday']);
  const b = (r.body && r.body.broadcasts) || [];
  ok('sendBroadcast answers with the message just sent',
    b.length === 1 && /Thursday/.test(b[0].text), b.length + ' messages');
}

/* ---------- and none of it leaked between requests ---------- */
/* The per-request scope must not become a cache that outlives its request: a
   second reader has to see the store, not the writer's leftovers. */
{
  blobs.__settle();
  const r = await call('getMyBoot', ['sreilea', '1234']);
  const logs = (r.body && r.body.logs) || [];
  ok('a later request reads the store, not another request\'s scope',
    logs.length === 1 && logs[0].habits.bible === true, logs.length + ' logs');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
