/* The Library's books (public/library.js): every book has every field a page
   draws, on a shelf that exists; ids are unique; 5–7 insights and 3 things to
   try; a five-minute read stays roughly five minutes; an ISBN, when there is
   one, is a real ISBN-13 (the check digit holds), so a typo cannot quietly turn
   into the wrong cover; no direct quotations — the summaries are our own words. */
import { PUBLIC } from './env.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(PUBLIC + '/library.js', 'utf8') + ';this.L=GP_LIBRARY;', ctx);
const L = ctx.L, shelves = L.shelves.map((s) => s.id), books = L.books;
ok('there are shelves and books', shelves.length === 4 && books.length >= 20, shelves.join() + ' · ' + books.length + ' books');
ok('every shelf has a name, an emoji and two colours', L.shelves.every((s) => s.name && s.emoji && /^#[0-9A-F]{6}$/i.test(s.color) && /^#[0-9A-F]{6}$/i.test(s.ink)));
ok('ids are unique slugs', new Set(books.map((b) => b.id)).size === books.length && books.every((b) => /^[a-z0-9-]+$/.test(b.id)));
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const bad = books.filter((b) => !(str(b.title) && str(b.author) && str(b.vibe) && str(b.bigIdea) && str(b.forUs) && str(b.oneLine) &&
  shelves.includes(b.shelf) && Number(b.mins) > 0 && Array.isArray(b.insights) && Array.isArray(b.tryThis)));
ok('every book has every field, on a real shelf', bad.length === 0, bad.map((b) => b.id || b.title).join(', '));
ok('5–7 insights, each with an emoji, a title and a body', books.every((b) => b.insights.length >= 5 && b.insights.length <= 7 && b.insights.every((x) => str(x.emoji) && str(x.title) && str(x.body))),
  books.filter((b) => !(b.insights.length >= 5 && b.insights.length <= 7)).map((b) => b.id).join(', '));
ok('three things to try this week', books.every((b) => b.tryThis.length === 3 && b.tryThis.every(str)));
const words = (b) => [b.vibe, b.bigIdea, b.forUs, b.oneLine].concat(b.insights.map((x) => x.title + ' ' + x.body), b.tryThis).join(' ').split(/\s+/).length;
const long = books.filter((b) => words(b) < 300 || words(b) > 1100);
ok('each is a five-minute read (300–1100 words)', long.length === 0, long.map((b) => b.id + ':' + words(b)).join(', ') || ('' + Math.min(...books.map(words)) + '–' + Math.max(...books.map(words)) + ' words'));
const isbn13 = (s) => /^97[89]\d{10}$/.test(s) && (10 - [...s.slice(0, 12)].reduce((a, d, i) => a + Number(d) * (i % 2 ? 3 : 1), 0) % 10) % 10 === Number(s[12]);
const badIsbn = books.filter((b) => b.isbn && !isbn13(b.isbn));
ok('an ISBN, when given, is a valid ISBN-13', badIsbn.length === 0, badIsbn.map((b) => b.id + ':' + b.isbn).join(', '));
const texts = (b) => [b.vibe, b.bigIdea, b.forUs, b.oneLine].concat(b.insights.map((x) => x.title), b.insights.map((x) => x.body), b.tryThis);
const quoted = books.filter((b) => texts(b).some((x) => /[“"][^”"]{40,}[”"]/.test(x)));
ok('no long quotations — our own words', quoted.length === 0, quoted.map((b) => b.id).join(', '));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
