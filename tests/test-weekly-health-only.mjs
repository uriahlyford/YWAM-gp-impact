/* The health score comes from the weekly check-in only (Oct 2026). Against the
   real api.js: saving a day — habits, or the old hours and mood fields — writes
   the day and no survey row, however many days are logged; a row the old roll-up
   wrote is left exactly as it was; the weekly check-in still writes its row and
   replaces an old rolled-up one for that week; the day's answer carries no week. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('weekly-health-only');
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
for (const f of fs.readdirSync(REPO + '/netlify/functions')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
mem.staff = [{ id: 'st1', name: 'Sokha', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', active: true, surveyToken: 'tok1', pinSalt: 'st1', pinHash: mkHash('1234', 'st1') }];
const Y = new Date().getUTCFullYear();
mem.survey = [{ campus: 'poipet', week: 20, year: Y, device: 'tok1', clarity: 6, lonely: 3, days: 4 }];   // written by the old roll-up
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const before = JSON.stringify(mem.survey);
let r;
for (const d of ['13', '14', '15', '16', '17']) {
  r = await call('saveDaily', ['sokha', '1234', Y + '-07-' + d, { workout: true, quietTime: true, clarity: 8, growth: 7, lonely: 2, langHours: 2, habits: { workout: true } }]);
}
ok('saving days still works and keeps the habits', r.body.ok && mem.dailyLogs.length === 5 && mem.dailyLogs[4].workout === true);
ok('five logged days write no health row', JSON.stringify(mem.survey) === before, mem.survey.length + ' rows');
ok('… and the day’s answer carries no week', r.body.week === null);
ok('a row the old roll-up wrote is left as it was', mem.survey.length === 1 && mem.survey[0].clarity === 6 && mem.survey[0].week === 20);
r = await call('saveMyWeek', ['sokha', '1234', 20, { lonely: 2, clarity: 9, growth: 8, exercise: 1, quietTime: 1, oneOnOne: 1, sharedFaith: 1, sabbath: 1, debt: 0, porn: 0, langHours: 3, minHours: 10 }]);
const w20 = mem.survey.filter((x) => x.week === 20 && x.device === 'tok1');
ok('the weekly check-in still scores a week, replacing the old rolled-up row', r.body.ok && w20.length === 1 && w20[0].source === 'weekly' && w20[0].clarity === 9, JSON.stringify(w20[0]));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
