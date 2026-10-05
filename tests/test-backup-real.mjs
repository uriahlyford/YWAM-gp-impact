/* The nightly backup against the real @netlify/blobs, through its own local
   server — not the fake the server tests use. The fake once agreed with a
   wrong assumption: list({ prefix: 'day/' }) answers nothing from the real
   server for keys with a slash, and the backup, believing it had no nights,
   deleted every object it had just stored. So this runs the real library end to
   end: a backup of a few hundred keys and a document, a second night that stores
   nothing new, a restore that brings the bytes back exactly.

   In the browser half of the suite only because that is where `npm install`
   runs and the real package is there; it needs no browser. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

let real;
try {
  real = {
    server: await import(REPO + '/node_modules/@netlify/blobs/dist/server.js'),
    main: await import(REPO + '/node_modules/@netlify/blobs/dist/main.js'),
  };
} catch (e) {
  console.log('FAIL @netlify/blobs is not installed — run npm install');
  process.exit(1);
}
const { runBackup, restoreFromBackup } = await import(REPO + '/netlify/functions/backup.js');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

const dir = tmpDir('backup-real');
const server = new real.server.BlobsServer({ directory: dir, port: 0, token: 'tok' });
const { port } = await server.start();
const opt = (name) => ({ name, siteID: 'site', token: 'tok', apiURL: 'http://localhost:' + port });
const src = real.main.getStore(opt('gp-data')), dst = real.main.getStore(opt('gp-backups'));
try {
  await src.setJSON('staff', [{ id: 'a', name: 'Dara' }]);
  const doc = crypto.randomBytes(4000);
  await src.set('pdoc:x', doc.buffer.slice(doc.byteOffset, doc.byteOffset + doc.length));
  for (let i = 0; i < 200; i++) await src.setJSON('k' + i, { i });

  let st = await runBackup({ src, dst, now: new Date('2026-10-04T20:00:00Z') });
  ok('the first night copies every key and keeps what it stored', st.items === 202 && st.newObjects === 202 && st.removedObjects === 0 && st.days === 1, JSON.stringify(st));
  st = await runBackup({ src, dst, now: new Date('2026-10-05T20:00:00Z') });
  ok('the second night finds the first and stores nothing new', st.days === 2 && st.newObjects === 0 && st.removedObjects === 0, st.days + ' nights');
  ok('status is there', (await dst.get('status', { type: 'json' })).day === '2026-10-06');

  await src.setJSON('staff', []);
  await src.delete('pdoc:x');
  const r = await restoreFromBackup({ src, dst, day: '2026-10-06', keys: ['staff', 'pdoc:x'], apply: true });
  ok('a restore brings both back', r.ok && r.restored.sort().join() === 'pdoc:x,staff', JSON.stringify(r.restored));
  ok('… the list as it was', JSON.stringify(await src.get('staff', { type: 'json' })) === '[{"id":"a","name":"Dara"}]');
  ok('… the document byte for byte', Buffer.from(await src.get('pdoc:x', { type: 'arrayBuffer' })).equals(doc));
} finally {
  await server.stop();
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
