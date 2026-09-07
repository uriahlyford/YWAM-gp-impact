/* Reported as "can't scroll at all" — confirmed live in a real user's own
   Chrome DevTools: wheel events were firing with real deltas, nothing was
   calling preventDefault on them, and the page still would not move, until
   `overscroll-behavior` was set back from `none` to `auto` from the
   console, at which point it scrolled immediately. The first fix tried
   `contain` (same "don't chain a scroll past this page" intent, without
   `none`'s worse reputation) — a second live check on the same real
   machine showed `contain` trips the exact same bug: wheel events firing,
   defaultPrevented false throughout, and window never once emitting a
   `scroll` event. So the actual fix is `auto`, i.e. no overscroll-behavior
   declared on html/body at all.
   This can't reproduce the underlying Chrome bug itself (a synthetic wheel
   sequence in a quick headless test never hit it either — that's part of
   why it took this long to find) — it just holds the actual fix in place:
   neither `html` nor `body`, on any of the three pages, may declare
   `overscroll-behavior` at all, at any value. */
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
  const rules = [...styleBlocks.matchAll(/(html|body)\s*\{([^}]*)\}/g)];
  ok(file + ': has html/body rules to check', rules.length > 0, rules.length);
  for (const [, selector, body] of rules) {
    ok(file + ': ' + selector + ' does not declare overscroll-behavior at all', !/overscroll-behavior/.test(body));
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
