/* The nightly backup (netlify/functions/backup.js) and what admins see of it.

   Against the real backup.js and api.js, with a fake @netlify/blobs that keeps
   named stores apart and can list, read raw bytes and delete: every key is
   copied, bytes exactly; unchanged content is stored once however many nights
   point to it; thirty nights are kept and the data only older nights pointed to
   is removed; a by-hand snapshot leaves "Last backup" alone; a failed run keeps
   the last good run and says what went wrong; a restore is a dry run until told,
   snapshots first, touches only what differs and refuses keys the night lacked.
   The boot gives an admin the run's time and counts only, and nobody else
   anything. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('backup');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const stores={};
let broken=false;
export function __break(v){ broken=v; }
function bytes(v){ return Buffer.from(typeof v==='string' ? v : new Uint8Array(v)); }
export function getStore(o){
  const name=(typeof o==='string') ? o : o.name;
  const mem=stores[name]||(stores[name]=new Map());
  return {
    get: async (k,opt)=>{ if(!mem.has(k)) return null; const b=mem.get(k);
      if(opt && opt.type==='arrayBuffer') return b.buffer.slice(b.byteOffset, b.byteOffset+b.length);
      return JSON.parse(b.toString('utf8')); },
    set: async (k,v)=>{ if(broken && name==='gp-backups' && k.startsWith('obj/')) throw new Error('disk full'); mem.set(k, bytes(v)); },
    setJSON: async (k,v)=>{ mem.set(k, Buffer.from(JSON.stringify(v))); },
    delete: async (k)=>{ mem.delete(k); },
    list: (opt)=>{ const keys=(opt&&opt.prefix) ? [] : [...mem.keys()];   // as @netlify/blobs' server does for a slashed prefix
      return { [Symbol.asyncIterator]: async function*(){ yield { blobs: keys.map(key=>({key})), directories: [] }; } }; }
  };
}
export const __stores=stores;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const B = await import(TMP + '/backup.js');
const api = await import(TMP + '/api.js');
const src = blobs.getStore({ name: 'gp-data' }), dst = blobs.getStore({ name: 'gp-backups' });
const S = blobs.__stores;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
const keysOf = (prefix) => [...S['gp-backups'].keys()].filter((k) => k.startsWith(prefix)).sort();
const night = (d) => new Date(Date.parse(d + 'T20:00:00Z') - 24 * 3600 * 1000);   // 03:00 PNP on day d

await src.setJSON('staff', [
  withPin({ id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_dara', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
]);
await src.setJSON('entries', [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: 40, value: 12 }]);
const pdf = crypto.randomBytes(5000);
await src.set('pdoc:abc', pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.length));

console.log('=== the schedule ===');
ok('it runs at 20:00 UTC — 03:00 in Phnom Penh', B.config && B.config.schedule === '0 20 * * *', B.config && B.config.schedule);

console.log('\n=== the first night ===');
let st = await B.runBackup({ src, dst, now: night('2026-10-01') });
ok('every key is in the night’s list, dated by Phnom Penh’s day', st.ok && st.items === 3 && st.day === '2026-10-01', JSON.stringify(st));
const m1 = await dst.get('day/2026-10-01', { type: 'json' });
ok('the list names each key with its hash and size', m1 && Object.keys(m1.keys).sort().join() === 'entries,pdoc:abc,staff' && m1.keys['pdoc:abc'].n === 5000);
const back = Buffer.from(await dst.get('obj/' + m1.keys['pdoc:abc'].h, { type: 'arrayBuffer' }));
ok('an uploaded document comes back byte for byte', back.equals(pdf));
ok('three objects for three different contents', keysOf('obj/').length === 3);
ok('status says when, how many, how many nights', (await dst.get('status', { type: 'json' })).items === 3 && st.days === 1);

console.log('\n=== nights that change little ===');
st = await B.runBackup({ src, dst, now: night('2026-10-02') });
ok('nothing changed: no new object stored', st.newObjects === 0 && keysOf('obj/').length === 3);
await src.setJSON('entries', [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', metric: 'Cups Sold', week: 40, value: 15 }]);
st = await B.runBackup({ src, dst, now: night('2026-10-03') });
ok('one list changed: one new object, the rest shared', st.newObjects === 1 && keysOf('obj/').length === 4, st.newObjects);
st = await B.runBackup({ src, dst, now: night('2026-10-03') });
ok('running twice on one night replaces that night’s list', keysOf('day/').length === 3);

console.log('\n=== keeping thirty nights ===');
for (let i = 4; i <= 40; i++) {
  const d = new Date(Date.UTC(2026, 9, i)).toISOString().slice(0, 10);
  await src.setJSON('entries', [{ metric: 'Cups Sold', week: 40, value: 100 + i }]);   // a new version every night
  st = await B.runBackup({ src, dst, now: night(d) });
}
const days = keysOf('day/');
ok('only the newest thirty nights are kept', days.length === 30 && days[0] === 'day/2026-10-11' && days[29] === 'day/2026-11-09', days[0] + ' … ' + days[29]);
const used = new Set();
for (const k of days) Object.values((await dst.get(k, { type: 'json' })).keys).forEach((e) => used.add(e.h));
ok('every object still stored is used by a kept night, and every one used is there',
  keysOf('obj/').every((k) => used.has(k.slice(4))) && [...used].every((h) => S['gp-backups'].has('obj/' + h)), keysOf('obj/').length + ' objects');
ok('the document that never changed is still stored once', keysOf('obj/').filter((k) => k === 'obj/' + m1.keys['pdoc:abc'].h).length === 1);
ok('the October 1st version of entries is gone with its night', !S['gp-backups'].has('obj/' + m1.keys.entries.h));

console.log('\n=== a snapshot by hand ===');
const before = await dst.get('status', { type: 'json' });
await B.runBackup({ src, dst, now: new Date('2026-11-09T08:00:00Z'), label: 'before-restore' });
ok('it sits beside the night as its own list', S['gp-backups'].has('day/2026-11-09~before-restore'));
ok('“Last backup” still means the nightly run', JSON.stringify(await dst.get('status', { type: 'json' })) === JSON.stringify(before));

console.log('\n=== a failed night ===');
await src.setJSON('fresh', ['something new']);
blobs.__break(true);
const res = await B.default();
blobs.__break(false);
const st2 = await dst.get('status', { type: 'json' });
ok('the run answers 500', res.status === 500);
ok('status keeps the last good run and adds the error and when', st2.at === before.at && /disk full/.test(st2.lastError) && !!st2.errorAt, st2.lastError);
ok('… and a good run after it clears the error', !(await B.runBackup({ src, dst, now: night('2026-11-10') })).lastError &&
  !(await dst.get('status', { type: 'json' })).lastError);

console.log('\n=== restoring ===');
const goodStaff = (await dst.get('day/2026-11-10', { type: 'json' })).keys.staff;
await src.setJSON('staff', []);                     // the disaster: the staff list emptied
let r = await B.restoreFromBackup({ src, dst, day: '2026-11-10', keys: ['staff', 'pdoc:abc'] });
ok('without apply it only says what would change — the unchanged document is left out', r.ok && r.todo.join() === 'staff' && r.restored.length === 0);
ok('… and changes nothing', (await src.get('staff', { type: 'json' })).length === 0);
r = await B.restoreFromBackup({ src, dst, day: '2026-11-10', keys: ['staff'], apply: true, now: new Date('2026-11-10T09:00:00Z') });
ok('with apply the staff list is back', r.restored.join() === 'staff' && (await src.get('staff', { type: 'json' })).length === 2);
ok('… after a snapshot of the emptied list, so the restore can be undone', r.snapshot === 'day/2026-11-10~before-restore' &&
  (await dst.get('day/2026-11-10~before-restore', { type: 'json' })).keys.staff.h !== goodStaff.h);
r = await B.restoreFromBackup({ src, dst, day: '2026-11-10', keys: ['nope'] });
ok('a key that night did not have is refused', !r.ok && r.err === 'not_in_backup');
r = await B.restoreFromBackup({ src, dst, day: '1999-01-01', all: true });
ok('a night that is not there is refused', !r.ok && r.err === 'no_backup');
r = await B.restoreFromBackup({ src, dst, day: '2026-11-10', all: true, apply: true });
ok('restoring everything leaves a key that night lacked alone', S['gp-data'].has('fresh'));

console.log('\n=== what the app shows ===');
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let boot = (await call('getMyBoot', ['uriah', '1234'])).body;
ok('an admin’s boot has the last run: time, items, nights', boot.ok && boot.backup && boot.backup.at && boot.backup.items > 0 && boot.backup.days === 30, JSON.stringify(boot.backup));
ok('… and nothing else from the backup', Object.keys(boot.backup).sort().join() === 'at,days,errorAt,items,lastError' && !/"h":|obj\//.test(JSON.stringify(boot)));
boot = (await call('getMyBoot', ['dara', '1234'])).body;
ok('anyone else gets none', boot.ok && boot.backup === null);
S['gp-backups'].delete('status');
boot = (await call('getMyBoot', ['uriah', '1234'])).body;
ok('before the first run an admin is told none has run', boot.backup && boot.backup.none === true);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
