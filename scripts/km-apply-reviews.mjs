/* Move reviewed Khmer into the app: the Khmer review page's download → km.js.

     node scripts/km-apply-reviews.mjs km-reviews-2026-10-05.json            (dry run)
     node scripts/km-apply-reviews.mjs km-reviews-2026-10-05.json --write

   For every review in the file (an admin downloads it from the Khmer review
   page): the English key leaves PENDING_KM and goes into REVIEWED_KM with the
   reviewer's Khmer — as it was if they tapped Correct, their fix if they fixed
   it. A key that is no longer in PENDING_KM is reported and left alone (it was
   already applied, or the string is gone from the app). A fix that drops a
   {placeholder} is refused here too. Nothing else in km.js changes. Commit the
   result like any other change; docs/khmer-needed.md is not touched.

   This is the ONLY road from a pending string to REVIEWED_KM: a native speaker
   said so, on the page, by name. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const write = args.includes('--write');
const kmPath = (args.find((a) => a.startsWith('--km=')) || '').slice(5) ||
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'km.js');
if (!file) { console.log('Usage: node scripts/km-apply-reviews.mjs <reviews.json> [--write] [--km=path]'); process.exit(1); }

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!data || data.format !== 'gp-km-reviews' || !Array.isArray(data.reviews)) { console.error('Not a Khmer review download.'); process.exit(1); }

const lines = fs.readFileSync(kmPath, 'utf8').split('\n');
const at = (name) => lines.findIndex((l) => l.startsWith('var ' + name + ' = '));
const parse = (i) => { const l = lines[i]; return { pre: l.slice(0, l.indexOf('{')), semi: l.trimEnd().endsWith(';'), obj: JSON.parse(l.slice(l.indexOf('{')).trimEnd().replace(/;$/, '')) }; };
const pi = at('PENDING_KM'), ri = at('REVIEWED_KM');
if (pi < 0 || ri < 0) { console.error('Could not find PENDING_KM / REVIEWED_KM in ' + kmPath); process.exit(1); }
const P = parse(pi), R = parse(ri);
const ph = (s) => (String(s).match(/\{[a-zA-Z0-9_]+\}/g) || []).sort().join();

let moved = 0, fixed = 0;
const gone = [], bad = [];
for (const r of data.reviews) {
  if (!r || typeof r.key !== 'string' || typeof r.km !== 'string' || !r.km.trim()) { bad.push(String(r && r.key)); continue; }
  if (!(r.key in P.obj)) { gone.push(r.key); continue; }
  if (ph(r.key) !== ph(r.km)) { bad.push(r.key); continue; }
  delete P.obj[r.key];
  R.obj[r.key] = r.km.trim();
  moved++; if (r.verdict === 'fixed') fixed++;
}
console.log((write ? 'Moved ' : 'Would move ') + moved + ' to REVIEWED_KM (' + fixed + ' with the reviewer’s fix).');
if (gone.length) console.log(gone.length + ' not in PENDING_KM any more, left alone' + (gone.length <= 10 ? ': ' + gone.join(' | ') : '.'));
if (bad.length) console.log(bad.length + ' refused (empty, or a {placeholder} missing): ' + bad.slice(0, 10).join(' | '));
console.log('PENDING_KM ' + Object.keys(P.obj).length + ' · REVIEWED_KM ' + Object.keys(R.obj).length);
if (!write) { console.log('Add --write to change km.js.'); process.exit(0); }
const out = (x) => x.pre + JSON.stringify(x.obj) + (x.semi ? ';' : '');
lines[pi] = out(P); lines[ri] = out(R);
fs.writeFileSync(kmPath, lines.join('\n'));
console.log('Wrote ' + kmPath);
