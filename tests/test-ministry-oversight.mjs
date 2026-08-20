/* A department's "Base Leadership" ministry (e.g. dept:Base Leadership,
   ministry:Community Service) oversees every real ministry under that
   department — so that person can log on behalf of, say, Outreach Teams,
   the same way Outreach Teams' own staff can. Nobody else gets to log
   outside their own ministry. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('ministry-oversight');
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

const OVERSEER = {
  id: 'st_lead', name: 'Andrew', username: 'andrew', campus: 'poipet',
  dept: 'Base Leadership', ministry: 'Community Service', active: true,
};
const MEMBER = {
  id: 'st_member', name: 'Sokha', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', active: true,
};
const STRANGER = {
  id: 'st_stranger', name: 'Dara', username: 'dara', campus: 'poipet',
  dept: 'Youth Education', ministry: 'YDC', active: true,
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
function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [OVERSEER, MEMBER, STRANGER].map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
  mem.entries = [];
  mem.kpiDaily = [];
}

/* ---------- 1. the department overseer can log for a ministry they oversee ---------- */
seed();
let r = await call('saveKpiDayFor', ['andrew', '1234', 'Community Service', 'Outreach Teams', '2026-08-17',
  [{ metric: 'Salvations', mode: 'sum', value: 3 }]]);
ok('overseer can save a day for a ministry under their department',
  r.body && r.body.ok === true && r.body.entries.Salvations && r.body.entries.Salvations['34'] === 3,
  JSON.stringify(r.body));

r = await call('getMinistryFor', ['andrew', '1234', 'Community Service', 'Outreach Teams']);
ok('overseer can read that ministry’s data', r.body && r.body.ok === true && r.body.entries.Salvations['34'] === 3,
  JSON.stringify(r.body));

/* ---------- 2. the ministry's own member can also log for it via the same endpoint ---------- */
seed();
r = await call('saveKpiDayFor', ['sokha', '1234', 'Community Service', 'Outreach Teams', '2026-08-17',
  [{ metric: 'Salvations', mode: 'sum', value: 5 }]]);
ok('the ministry’s own member can save for their own ministry too',
  r.body && r.body.ok === true && r.body.entries.Salvations['34'] === 5, JSON.stringify(r.body));

/* ---------- 3. a stranger (not the overseer, not in that ministry) is refused ---------- */
seed();
r = await call('saveKpiDayFor', ['dara', '1234', 'Community Service', 'Outreach Teams', '2026-08-17',
  [{ metric: 'Salvations', mode: 'sum', value: 99 }]]);
ok('an unrelated staff member is refused', r.body && r.body.ok === false && r.body.err === 'not_authorized',
  JSON.stringify(r.body));
ok('and nothing was written', (mem.entries || []).length === 0 && (mem.kpiDaily || []).length === 0);

r = await call('getMinistryFor', ['dara', '1234', 'Community Service', 'Outreach Teams']);
ok('an unrelated staff member cannot read it either', r.body && r.body.ok === false && r.body.err === 'not_authorized');

/* ---------- 4. a ministry member cannot log for a DIFFERENT ministry, even in their own dept ---------- */
seed();
r = await call('saveKpiDayFor', ['sokha', '1234', 'Community Service', 'Cafe', '2026-08-17',
  [{ metric: 'Cups Sold', mode: 'sum', value: 40 }]]);
ok('a regular member cannot log for a sibling ministry', r.body && r.body.ok === false && r.body.err === 'not_authorized');

/* ---------- 5. week-level (levels/scores) saved by the overseer, via saveMinistryFor ---------- */
seed();
r = await call('saveMinistryFor', ['andrew', '1234', 'Community Service', 'Cafe', 34,
  [{ metric: 'Total in Bank Account ($)', value: 1500 }]]);
ok('overseer can save a week-level figure for a ministry they oversee',
  r.body && r.body.ok === true && r.body.entries['Total in Bank Account ($)']['34'] === 1500, JSON.stringify(r.body));

/* ---------- 6. a wrong PIN writes nothing ---------- */
seed();
r = await call('saveKpiDayFor', ['andrew', '9999', 'Community Service', 'Outreach Teams', '2026-08-17',
  [{ metric: 'Salvations', mode: 'sum', value: 3 }]]);
ok('a wrong PIN is refused', r.body && r.body.ok === false && (mem.kpiDaily || []).length === 0);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
