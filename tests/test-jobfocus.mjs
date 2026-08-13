/* jobfocus.js is extracted from help.html, and both keep a copy: help.html so it
   needs no script to render, jobfocus.js so the OKRs tab can read it as data.
   Two copies drift, so assert they agree — and that every ministry in the
   taxonomy has a focus written for it. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC } from './env.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = PUBLIC + '/';
const help = fs.readFileSync(SRC + 'help.html', 'utf8');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(SRC + 'jobfocus.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(SRC + 'taxonomy.js', 'utf8'), ctx);

const strip = h => h.replace(/<[^>]+>/g, '');
const unesc = s => s.replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

const secs = [...help.matchAll(/<section class="ministry"[^>]*data-dept="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
const fails = [];
let compared = 0;

for (const [, dept, body] of secs) {
  const name = (body.match(/<div class="mHead">[\s\S]*?<span class="en">([\s\S]*?)<\/span>/) || [])[1];
  const focus = (body.match(/<div class="focus">[\s\S]*?<p>([\s\S]*?)<\/p>/) || [])[1];
  if (!name || !focus) { fails.push('help.html section missing name or focus: ' + dept); continue; }
  const n = unesc(strip(name)).trim();
  const f = unesc(strip(focus)).trim();
  const got = vm.runInContext(`jobFocus(${JSON.stringify(dept)}, ${JSON.stringify(n)})`, ctx);
  compared++;
  if (got === null) fails.push(`jobfocus.js has no entry for ${dept} | ${n}`);
  else if (got !== f) fails.push(`text differs for ${n}:\n    help.html: ${f}\n    jobfocus.js: ${got}`);
}
console.log('compared ' + compared + ' ministries against help.html');

// every ministry the taxonomy knows about should have a focus
const campuses = ['poipet', 'siemreap'];
const seen = new Set();
for (const c of campuses) {
  const deps = vm.runInContext(`getDepartments(${JSON.stringify(c)})`, ctx);
  for (const dept of Object.keys(deps)) {
    for (const min of Object.keys(deps[dept])) {
      const key = dept + '|' + min;
      if (seen.has(key)) continue;
      seen.add(key);
      const got = vm.runInContext(`jobFocus(${JSON.stringify(dept)}, ${JSON.stringify(min)})`, ctx);
      if (!got) fails.push('no job focus for ' + key);
    }
  }
}
console.log('checked ' + seen.size + ' taxonomy ministries have a focus');

console.log(fails.length ? '\nFAILURES:\n - ' + fails.join('\n - ') : '\njobfocus.js and help.html agree.');
process.exit(fails.length ? 1 : 0);
