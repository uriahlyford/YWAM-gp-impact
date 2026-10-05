/* Restore from the nightly backup (netlify/functions/backup.js).

   Run from the repo root with a Netlify personal access token (User settings →
   Applications) and the site id — never commit either:

     NETLIFY_AUTH_TOKEN=… NETLIFY_SITE_ID=… node scripts/restore-backup.mjs list
     … node scripts/restore-backup.mjs show 2026-10-04
     … node scripts/restore-backup.mjs restore 2026-10-04 staff entries        (dry run)
     … node scripts/restore-backup.mjs restore 2026-10-04 staff entries --yes
     … node scripts/restore-backup.mjs restore 2026-10-04 --all --yes

   list     every night kept, newest first, and the last run's status
   show     the keys in one night's backup, their sizes, and which differ from now
   restore  puts those keys back as they were that night. Without --yes it only
            says what would change. With --yes it first snapshots everything as it
            is now (day/<today>~before-restore), so the restore can itself be undone.
            Keys that did not exist that night are left alone, never deleted. */
import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
import { restoreFromBackup, listAll_ } from '../netlify/functions/backup.js';

const siteID = process.env.NETLIFY_SITE_ID, token = process.env.NETLIFY_AUTH_TOKEN;
if (!siteID || !token) { console.error('Set NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN.'); process.exit(1); }
const src = getStore({ name: 'gp-data', siteID, token, consistency: 'strong' });
const dst = getStore({ name: 'gp-backups', siteID, token, consistency: 'strong' });

const [cmd, day, ...rest] = process.argv.slice(2);
const yes = rest.includes('--yes'), all = rest.includes('--all');
const keys = rest.filter((a) => !a.startsWith('--'));
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

if (cmd === 'list') {
  const days = (await listAll_(dst, 'day/')).map((k) => k.slice(4));
  days.sort().reverse().forEach((d) => console.log(d));
  console.log('\nstatus:', JSON.stringify(await dst.get('status', { type: 'json' })));
} else if (cmd === 'show' && day) {
  const m = await dst.get('day/' + day, { type: 'json' });
  if (!m) { console.error('No backup for ' + day + ' — try: list'); process.exit(1); }
  for (const [k, e] of Object.entries(m.keys).sort()) {
    const b = await src.get(k, { type: 'arrayBuffer' });
    const h = b == null ? null : crypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
    console.log((h === e.h ? '  same    ' : h == null ? '  gone    ' : '  changed ') + k + '  ' + kb(e.n));
  }
} else if (cmd === 'restore' && day && (all || keys.length)) {
  const r = await restoreFromBackup({ src, dst, day, keys, all, apply: yes });
  if (!r.ok) { console.error(r.err === 'no_backup' ? 'No backup for ' + day + ' — try: list' : 'Not in that backup: ' + r.missing.join(', ')); process.exit(1); }
  if (!r.todo.length) { console.log('Nothing to do — already as it was on ' + day + '.'); process.exit(0); }
  console.log((yes ? 'Restored' : 'Would restore') + ' from ' + day + ':\n  ' + (yes ? r.restored : r.todo).join('\n  '));
  if (!yes) console.log('\nAdd --yes to do it.');
  else {
    console.log('A snapshot of how things were just before: ' + r.snapshot + ' (restore from it to undo).');
    if (r.skipped.length) console.error('Missing data, skipped: ' + r.skipped.join(', '));
  }
} else {
  console.log('Usage: list | show <YYYY-MM-DD> | restore <YYYY-MM-DD> <key…|--all> [--yes]');
  process.exit(1);
}
