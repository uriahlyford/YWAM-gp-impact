/* Reported as "can't scroll at all" — confirmed live in a real user's own
   Chrome DevTools: wheel events were firing with real deltas, nothing was
   calling preventDefault on them, and the page still would not move, until
   `overscroll-behavior` was set back from `none` to `auto` from the
   console, at which point it scrolled immediately. `none` is the most
   aggressive value for this property and the one with the most real-world
   Chromium bug reports of taking scrolling down with it; `contain` keeps
   the original intent (don't chain a scroll past this page to the
   browser's own pull-to-refresh/back-swipe gesture) without that history.
   This can't reproduce the underlying Chrome bug itself (a synthetic wheel
   sequence in a quick headless test never hit it either — that's part of
   why it took this long to find) — it just holds the actual fix in place:
   neither `html` nor `body`, on any of the three pages, may go back to
   `overscroll-behavior: none`. */
import fs from 'node:fs';
import { REPO } from './env.mjs';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

for (const file of ['public/teams.html', 'public/index.html', 'public/help.html']) {
  const src = fs.readFileSync(REPO + '/' + file, 'utf8');
  const styleBlocks = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const rules = [...styleBlocks.matchAll(/(html|body)\s*\{([^}]*)\}/g)]
    .filter(m => /overscroll-behavior/.test(m[2]));
  ok(file + ': html/body rules mentioning overscroll-behavior are present', rules.length > 0, rules.length);
  for (const [, selector, body] of rules) {
    const m = body.match(/overscroll-behavior\s*:\s*([a-z-]+)/);
    ok(file + ': ' + selector + '\'s overscroll-behavior is not "none"', !!m && m[1] !== 'none', m && m[1]);
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
