/* ==================== nightly backup ====================
   Every night at 03:00 Phnom Penh time this copies everything in the app's
   store ('gp-data') into a second store, 'gp-backups', and keeps 30 days.
   Without it one bad write, a hand-edit in the Netlify UI or a bug that empties
   a list would lose that data for good — there was no other copy.

   Stored once, listed daily: each blob's bytes go in as obj/<sha256> the first
   time that exact content is seen, and each night writes one small list,
   day/YYYY-MM-DD, of every key and the hash it had that night. Thirty nights of
   a staff list that changed twice cost three copies, not thirty, and uploaded
   documents that never change are stored once. Pruning drops lists older than
   KEEP_DAYS, then any object no remaining list points to.

   'status' holds the last run's time, counts and any error — the only thing the
   app itself reads back (admins see "Last backup: …", and a bell warning when a
   night is missed). Nothing in the app can read or restore a backup: it holds
   PIN hashes and the anonymous health answers. Restoring is
   scripts/restore-backup.mjs, run by hand with a Netlify token.

   A scheduled function cannot be called by URL on the live site, so this has
   no way in from outside. Netlify's "Run now" on the function page runs it. */
import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

export const config = { schedule: '0 20 * * *' };   // 20:00 UTC = 03:00 in Phnom Penh

export const KEEP_DAYS = 30;
const PARALLEL = 8;

function pnpDay_(d) { return new Date(d.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10); }

/* Lists the whole store and filters here. list({ prefix: 'day/' }) answered
   nothing at all from @netlify/blobs' own server for keys with a slash, and a
   backup that believes it has no nights left deletes every object it holds —
   so the prefix is never trusted to the store. */
async function listAll_(store, prefix) {
  const out = [];
  for await (const page of store.list({ paginate: true })) {
    (page.blobs || []).forEach(function (b) { if (!prefix || b.key.indexOf(prefix) === 0) out.push(b.key); });
  }
  return out;
}

export { listAll_ };

async function inBatches_(items, fn) {
  for (let i = 0; i < items.length; i += PARALLEL) await Promise.all(items.slice(i, i + PARALLEL).map(fn));
}

export async function runBackup(opts) {
  const src = opts.src, dst = opts.dst, now = opts.now || new Date();
  const started = Date.now();
  const day = pnpDay_(now);
  const listKey = 'day/' + day + (opts.label ? '~' + opts.label : '');   // a by-hand snapshot sits beside that night's list
  const have = new Set((await listAll_(dst, 'obj/')).map(function (k) { return k.slice(4); }));
  const keys = (await listAll_(src)).sort();
  const manifest = {};
  let bytes = 0, added = 0;
  await inBatches_(keys, async function (key) {
    const buf = await src.get(key, { type: 'arrayBuffer' });
    if (buf == null) return;                      // deleted between list and get
    const data = Buffer.from(buf);
    const h = crypto.createHash('sha256').update(data).digest('hex');
    if (!have.has(h)) { await dst.set('obj/' + h, buf); have.add(h); added++; }
    manifest[key] = { h: h, n: data.length };
    bytes += data.length;
  });
  await dst.setJSON(listKey, { day: day, label: opts.label || '', at: now.toISOString(), keys: manifest });

  // keep the newest KEEP_DAYS lists, then only the objects they point to
  const days = (await listAll_(dst, 'day/')).sort();
  const drop = days.slice(0, Math.max(0, days.length - KEEP_DAYS));
  await inBatches_(drop, function (k) { return dst.delete(k); });
  const kept = days.slice(drop.length);
  const used = new Set();
  await inBatches_(kept, async function (k) {
    const m = k === listKey ? { keys: manifest } : await dst.get(k, { type: 'json' });
    Object.values((m && m.keys) || {}).forEach(function (e) { used.add(e.h); });
  });
  const orphans = Array.from(have).filter(function (h) { return !used.has(h); });
  await inBatches_(orphans, function (h) { return dst.delete('obj/' + h); });

  const status = {
    ok: true, at: now.toISOString(), day: day, items: Object.keys(manifest).length, bytes: bytes,
    newObjects: added, removedObjects: orphans.length, days: kept.length, ms: Date.now() - started
  };
  if (!opts.label) await dst.setJSON('status', status);   // "Last backup" means the nightly one
  return status;
}

/* Put keys back as they were in one backup list (scripts/restore-backup.mjs).
   Only keys that differ from now are touched; with apply, everything as it is
   now is snapshotted first (day/<today>~before-restore) so the restore can be
   undone. Keys missing from that night are refused, never deleted. */
function hashOf_(buf) { return buf == null ? null : crypto.createHash('sha256').update(Buffer.from(buf)).digest('hex'); }
export async function restoreFromBackup(opts) {
  const src = opts.src, dst = opts.dst;
  const m = await dst.get('day/' + opts.day, { type: 'json' });
  if (!m || !m.keys) return { ok: false, err: 'no_backup' };
  const want = opts.all ? Object.keys(m.keys).sort() : (opts.keys || []);
  const missing = want.filter(function (k) { return !m.keys[k]; });
  if (missing.length) return { ok: false, err: 'not_in_backup', missing: missing };
  const todo = [];
  for (const k of want) if (hashOf_(await src.get(k, { type: 'arrayBuffer' })) !== m.keys[k].h) todo.push(k);
  if (!opts.apply || !todo.length) return { ok: true, todo: todo, restored: [] };
  const snap = await runBackup({ src: src, dst: dst, now: opts.now, label: 'before-restore' });
  const restored = [], skipped = [];
  for (const k of todo) {
    const buf = await dst.get('obj/' + m.keys[k].h, { type: 'arrayBuffer' });
    if (buf == null) { skipped.push(k); continue; }
    await src.set(k, buf);
    restored.push(k);
  }
  return { ok: true, todo: todo, restored: restored, skipped: skipped, snapshot: 'day/' + snap.day + '~before-restore' };
}

export default async function () {
  const src = getStore({ name: 'gp-data', consistency: 'strong' });
  const dst = getStore({ name: 'gp-backups', consistency: 'strong' });
  try {
    const status = await runBackup({ src: src, dst: dst });
    return new Response(JSON.stringify(status), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    // keep the last good run's details, and say what went wrong and when
    let prev = null;
    try { prev = await dst.get('status', { type: 'json' }); } catch (e2) { /* nothing to keep */ }
    try { await dst.setJSON('status', Object.assign({}, prev || {}, { lastError: String((e && e.message) || e).slice(0, 300), errorAt: new Date().toISOString() })); } catch (e3) { /* the store itself is down */ }
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
