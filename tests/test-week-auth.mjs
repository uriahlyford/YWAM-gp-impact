/* The weekly check-in: one row per person per week, anonymous in the base
   average, visible by name to the ONE approved mentor and nobody else.
   Tested against the real api.js with an in-memory blob store. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('weekauth');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem = {};
export function getStore(){ return {
  get: async (k) => (k in mem ? JSON.parse(JSON.stringify(mem[k])) : null),
  setJSON: async (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); },
}; }
export const __mem = mem;
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

const SOKHA  = { id: 'st_sokha', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', active: true, photo: '', mentorId: 'st_dara', mentorStatus: 'approved', debt: false };
const DARA   = { id: 'st_dara', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', role: '', active: true, photo: '', mentorId: '', mentorStatus: '', debt: false };
const NOSY   = { id: 'st_nosy', name: 'Nosy', username: 'nosy', campus: 'poipet', dept: 'Youth Education', ministry: 'YDC', role: '', active: true, photo: '', mentorId: '', mentorStatus: '', debt: false };
const PEND   = { id: 'st_pend', name: 'Pending', username: 'pend', campus: 'poipet', dept: 'Youth Education', ministry: 'YDC', role: '', active: true, photo: '', mentorId: 'st_dara', mentorStatus: 'pending', debt: false };

function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [SOKHA, DARA, NOSY, PEND].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));
  mem.survey = []; mem.dailyLogs = []; mem.entries = []; mem.okrs = [];
}
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return JSON.parse(await res.text());
}
const fails = [];
const check = (n, c, d) => { console.log((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : '  ← ' + d)); if (!c) fails.push(n); };

const ANSWERS = { lonely: 3, clarity: 8, growth: 7, porn: false, oneOnOne: true,
  exercise: true, quietTime: true, debt: false, sharedFaith: true, sabbath: true,
  langHours: 2, minHours: 6 };

seed();

// 1. a staff member writes their own week
let r = await call('saveMyWeek', ['sokha', '1234', 30, ANSWERS]);
check('weekly check-in saves', r.ok && r.checkins.length === 1, JSON.stringify(r).slice(0, 120));
check('stored as hand-entered', mem.survey[0].source === 'weekly', mem.survey[0] && mem.survey[0].source);
check('answers round-trip', r.checkins[0].clarity === 8 && r.checkins[0].lonely === 3, JSON.stringify(r.checkins[0]));

// 2. the row carries a token, never a name — this is what makes the base average anonymous
const row = mem.survey[0];
check('no name on the survey row',
  !('name' in row) && !('staffId' in row) && !('username' in row) && !!row.device,
  Object.keys(row).join(','));
check('token is not the person’s id or username',
  row.device !== 'st_sokha' && row.device !== 'sokha', row.device);

// 3. re-saving the same week updates it rather than adding a second row
r = await call('saveMyWeek', ['sokha', '1234', 30, { ...ANSWERS, clarity: 5 }]);
check('re-saving updates in place', mem.survey.length === 1 && mem.survey[0].clarity === 5,
  mem.survey.length + ' rows, clarity ' + mem.survey[0].clarity);

// 4. a different week is a different row
await call('saveMyWeek', ['sokha', '1234', 31, ANSWERS]);
check('a second week adds a row', mem.survey.length === 2, mem.survey.length);

// 5. wrong PIN writes nothing
const before = mem.survey.length;
r = await call('saveMyWeek', ['sokha', '9999', 32, ANSWERS]);
check('wrong PIN writes nothing', !r.ok && mem.survey.length === before, mem.survey.length);

// 6. an incomplete week is refused (a composite built on gaps is worse than none)
r = await call('saveMyWeek', ['sokha', '1234', 33, { ...ANSWERS, clarity: undefined }]);
check('incomplete week refused', !r.ok && r.err === 'incomplete', JSON.stringify(r).slice(0, 80));

// 7. the daily roll-up must NOT overwrite a hand-entered week
mem.dailyLogs = [1,2,3,4,5].map(d => ({ staffId: 'st_sokha', date: '2026-07-2' + d, week: 30,
  langHours: 0, minHours: 0, workout: false, bible: false, quietTime: false, oneOnOne: false,
  sharedFaith: false, sabbath: false, clarity: 1, growth: 1, lonely: 9, porn: false, habits: {} }));
await call('saveDaily', ['sokha', '1234', '2026-07-26', { clarity: 1, growth: 1, lonely: 9 }]);
const w30 = mem.survey.filter(x => Number(x.week) === 30)[0];
check('daily sync leaves a hand-entered week alone',
  w30 && w30.source === 'weekly' && w30.clarity === 5, w30 && (w30.source + '/' + w30.clarity));

// 8. still one row for that week — no double count
check('one row per person per week',
  mem.survey.filter(x => Number(x.week) === 30 && x.device === row.device).length === 1,
  mem.survey.filter(x => Number(x.week) === 30).length);

// 9. the approved mentor sees the answers, by name
r = await call('getMenteeLogs', ['dara', '1234', 'st_sokha']);
check('approved mentor sees the check-ins', r.ok && r.checkins && r.checkins.length >= 2,
  JSON.stringify(r).slice(0, 140));
check('mentor sees them attached to the person', r.ok && r.mentee && r.mentee.name === 'Sokha',
  r.mentee && r.mentee.name);
check('mentor sees the private answers', r.ok && r.checkins[0].lonely !== undefined,
  JSON.stringify(r.checkins[0] || {}).slice(0, 90));

// 10. somebody who is not the mentor sees nothing
r = await call('getMenteeLogs', ['nosy', '1234', 'st_sokha']);
check('a non-mentor is refused', !r.ok && r.err === 'not_your_mentee', JSON.stringify(r).slice(0, 80));

// 11. a PENDING mentor request does not open the view yet
await call('saveMyWeek', ['pend', '1234', 30, ANSWERS]);
r = await call('getMenteeLogs', ['dara', '1234', 'st_pend']);
check('pending mentor request is refused', !r.ok, JSON.stringify(r).slice(0, 80));

// 12. staffProfile (any teammate) must NOT leak health answers
r = await call('staffProfile', ['nosy', '1234', 'st_sokha']);
const leaked = JSON.stringify(r).match(/lonely|clarity|growth|porn/);
check('a teammate’s page leaks no health answers', r.ok && !leaked, leaked && leaked[0]);

// 13. the base read (getData) carries no names either
r = await call('getData', ['']);
const anyName = (r.survey || []).some(x => 'name' in x || 'staffId' in x || 'username' in x);
check('getData survey rows are nameless', !anyName && r.survey.length > 0,
  JSON.stringify((r.survey || [])[0] || {}).slice(0, 110));

// 14. clearing my own week removes it
r = await call('deleteMyWeek', ['sokha', '1234', 31]);
check('clearing a week removes it', r.ok && !mem.survey.some(x => Number(x.week) === 31 && x.device === row.device),
  mem.survey.map(x => x.week).join(','));

// 15. I cannot clear somebody else's week
const pendRow = mem.survey.filter(x => Number(x.week) === 30 && x.device !== row.device)[0];
await call('deleteMyWeek', ['sokha', '1234', 30]);
check('clearing only touches my own token', !!mem.survey.find(x => x.device === pendRow.device),
  'the other person’s row went too');

console.log(fails.length ? '\n' + fails.length + ' FAILED:\n - ' + fails.join('\n - ')
                         : '\nall 15 weekly-health checks passed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fails.length ? 1 : 0);
