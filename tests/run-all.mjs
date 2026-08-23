/* Runs the whole suite and prints one line per file.

   Server tests import the real netlify/functions/api.js against a fake
   @netlify/blobs, so they are fast and need nothing installed. Browser tests need
   playwright and a Chromium; they are skipped with a message if it is missing,
   rather than failing the run for someone who only touched the API.

   Usage:  node tests/run-all.mjs           all of it
           node tests/run-all.mjs server    just the fast ones
*/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const SERVER = [
  'test-firstrun.mjs',   // empty / junk / ragged store, malformed requests
  'test-boot.mjs',       // getMyBoot: one call per page open
  'test-week-auth.mjs',  // weekly health: anonymity + mentor visibility
  'test-okr-auth.mjs',   // OKR writes stay inside your campus + department
  'test-year.mjs',       // weeks belong to a year; writing numbers needs a name
  'test-goals.mjs',      // weekly goals are percentages, and old ticked rows still read
  'test-smart-goals.mjs', // Annual Goals (SMART): year+category isolation, ownership
  'test-one-on-one.mjs', // 1-on-1 requests: mentor/mentee pairing, recipient-only response
  'test-ministry-oversight.mjs', // department overseers can log for ministries they oversee, nobody else can
  'test-rollups.mjs',    // the roll-up maths
  'test-jobfocus.mjs',   // jobfocus.js and help.html agree
  'test-stafftype.mjs',  // kind of staff + home country: stored, carried, counted
];

const BROWSER = [
  'test-pull-drill.mjs',    // the pull gesture on both pages, and which figures open
  'test-touch-scroll.mjs',  // a swipe over a slider or the chip strip scrolls the page, and answers nothing
  'test-habit-config.mjs',  // a habit list the server refused never stays on the grid
  'test-khmer.mjs',         // Khmer reaches the screen, and does not overflow when it does
  'test-theme.mjs',         // dark mode, and a WCAG contrast audit of every screen
  'test-splash.mjs',        // launch shows the splash, never the dashboard; one shared block
  'test-frontdoor.mjs',     // gate -> guest -> signed in -> staff page, end to end
  'test-chrome.mjs',        // no dashboard flash, boot coin never hollow, safe-area insets
  'test-storage.mjs',       // language survives a reload; storage blocked
  'test-degraded.mjs',      // a missing optional script must not kill a page
  'test-base.mjs',          // the Base tab and the health form
  'test-habit-taps.mjs',    // habit tiles stay responsive on a slow or dead connection
  'test-ministry-kpis.mjs', // the ministry's whole log form on My week: which card, and carry-forward
  'test-mentor-health.mjs', // a mentor sees a mentee by name
  'audit-load.mjs',         // one function invocation per page open
  'audit-paint.mjs',        // first paint even with the font CDN hanging
  'audit-allviews.mjs',     // every screen, no console errors
  'check-nav.mjs',          // the bottom tabs do not wrap at 320px
];

/* Pre-flight: no test may hardcode one machine's browser.
   Five files did exactly that — executablePath:'/opt/pw-browsers/chromium' — and
   passed for months here while crashing instantly anywhere else, including CI and
   anyone else's clone. The browser comes from env.mjs (CHROMIUM), which honours
   GP_CHROMIUM first. This is cheap and runs in both halves, because the only
   reason that bug survived is that nothing looked. */
{
  const bad = [];
  for (const f of fs.readdirSync(HERE)) {
    if (!f.endsWith('.mjs') || f === 'env.mjs' || f === 'run-all.mjs') continue;
    const src = fs.readFileSync(path.join(HERE, f), 'utf8');
    const m = src.match(/executablePath\s*:\s*['"][^'"]+['"]/);
    if (m) bad.push(f + '  ' + m[0]);
  }
  if (bad.length) {
    console.log('FAIL a test hardcodes a browser path instead of using CHROMIUM from env.mjs:');
    for (const b of bad) console.log('        ' + b);
    process.exit(1);
  }
}

const only = process.argv[2];
const files = only === 'server' ? SERVER : only === 'browser' ? BROWSER : SERVER.concat(BROWSER);

let haveBrowser = true;
try { await import('playwright'); } catch (e) { haveBrowser = false; }

const failed = [];
const skipped = [];
for (const f of files) {
  if (BROWSER.indexOf(f) > -1 && !haveBrowser) { skipped.push(f); continue; }
  const r = spawnSync(process.execPath, [path.join(HERE, f)], { encoding: 'utf8' });
  const out = String(r.stdout || '') + String(r.stderr || '');
  const lines = out.trim().split('\n').filter(function (l) { return l.trim(); });
  const last = lines.length ? lines[lines.length - 1].trim() : '(no output)';
  const bad = r.status !== 0 || /\bFAIL\b|\bERR\b|errors: [1-9]/.test(out);
  if (bad) failed.push(f);
  console.log((bad ? 'FAIL ' : 'ok   ') + f.padEnd(24) + last.slice(0, 90));
  if (bad) {
    for (const l of lines) if (/\bFAIL\b|\bERR\b/.test(l)) console.log('        ' + l.trim().slice(0, 140));
  }
}

if (skipped.length) {
  console.log('\nskipped (no playwright installed): ' + skipped.join(', '));
  console.log('  npm i -D playwright   # Chromium is found automatically, or set GP_CHROMIUM');
}
console.log('\n' + (files.length - failed.length - skipped.length) + ' passed, ' +
  failed.length + ' failed' + (skipped.length ? ', ' + skipped.length + ' skipped' : ''));
process.exit(failed.length ? 1 : 0);
