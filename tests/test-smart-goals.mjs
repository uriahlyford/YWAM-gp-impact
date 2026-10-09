/* Annual Goals (SMART) are a personal, year-and-category list — nothing here
   feeds any base or ministry figure, so the only rule that matters is that a
   staff member can only ever read or write their own goals. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('smart-goals');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js'); // and the portal's shipped forms // api.js imports it
fs.copyFileSync(REPO + '/netlify/functions/legal-docs-default.js', TMP + '/legal-docs-default.js');  // the legal forms teams sign
fs.copyFileSync(REPO + '/netlify/functions/legal-pdf.js', TMP + '/legal-pdf.js');  // and the signed-PDF builder
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ME = {
  id: 'st_me', name: 'Andrew', username: 'andrew', campus: 'siemreap', dept: 'Campus Leadership',
  ministry: 'Campus Director', role: 'Oversight', active: true, surveyToken: 'tok_me',
};
const OTHER = {
  id: 'st_other', name: 'Sokha', username: 'sokha', campus: 'siemreap', dept: 'Community Service',
  ministry: 'Outreach Teams', role: 'Coordinator', active: true, surveyToken: 'tok_other',
};

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
function seed(rows) {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [
    { ...ME, pinSalt: ME.id, pinHash: mkHash('1234', ME.id) },
    { ...OTHER, pinSalt: OTHER.id, pinHash: mkHash('1234', OTHER.id) },
  ];
  mem.smartGoals = rows || [];
}

/* ---------- 1. a goal round-trips ---------- */
seed();
let r = await call('saveSmartGoal', ['andrew', '1234',
  { year: 2026, category: 'Faith', title: 'Read the New Testament', meta: 'by Dec 2026', pct: 40 }]);
ok('saveSmartGoal accepts a new goal', r.body && r.body.ok === true, JSON.stringify(r.body));
let g = (r.body.smartGoals || [])[0];
ok('the goal keeps its title, category and percent', g && g.title === 'Read the New Testament' &&
  g.category === 'Faith' && g.pct === 40, JSON.stringify(g));
ok('a fresh goal gets an id', g && typeof g.id === 'string' && g.id.length > 0);

/* ---------- 2. editing in place doesn't create a duplicate ---------- */
r = await call('saveSmartGoal', ['andrew', '1234',
  { id: g.id, year: 2026, category: 'Faith', title: 'Read the whole New Testament', meta: 'by Dec 2026', pct: 65 }]);
ok('editing by id updates rather than duplicating', r.body && r.body.smartGoals.length === 1,
  'count=' + (r.body && r.body.smartGoals.length));
ok('the edit took', r.body.smartGoals[0].title === 'Read the whole New Testament' && r.body.smartGoals[0].pct === 65);

/* ---------- 3. bad input is refused, not silently coerced ---------- */
seed();
r = await call('saveSmartGoal', ['andrew', '1234', { year: 2026, category: 'Not A Real Category', title: 'x', pct: 10 }]);
ok('an unknown category is refused', r.body && r.body.ok === false && r.body.err === 'bad_category');
r = await call('saveSmartGoal', ['andrew', '1234', { year: 2026, category: 'Faith', title: '', pct: 10 }]);
ok('a blank title is refused', r.body && r.body.ok === false && r.body.err === 'bad_title');
r = await call('saveSmartGoal', ['andrew', '1234', { year: 1900, category: 'Faith', title: 'x', pct: 10 }]);
ok('a year outside the sane range is refused', r.body && r.body.ok === false && r.body.err === 'bad_year');
r = await call('saveSmartGoal', ['andrew', '1234', { year: 2026, category: 'Faith', title: 'x', pct: 250 }]);
ok('an out-of-range percent is clamped, not rejected',
  r.body && r.body.ok === true && r.body.smartGoals[0].pct === 100, JSON.stringify(r.body && r.body.smartGoals));

/* ---------- 4. each person only ever sees their own ---------- */
seed([
  { id: 'sg1', staffId: 'st_me', year: 2026, category: 'Faith', title: 'Mine', pct: 50 },
  { id: 'sg2', staffId: 'st_other', year: 2026, category: 'Faith', title: 'Theirs', pct: 20 },
]);
r = await call('getMySmartGoals', ['andrew', '1234']);
ok('getMySmartGoals returns only my rows',
  r.body && r.body.smartGoals.length === 1 && r.body.smartGoals[0].title === 'Mine',
  JSON.stringify(r.body && r.body.smartGoals));
r = await call('saveSmartGoal', ['andrew', '1234', { id: 'sg2', year: 2026, category: 'Faith', title: 'Hijacked', pct: 99 }]);
const hijacked = r.body && r.body.smartGoals.find(function (x) { return x.title === 'Hijacked'; });
ok('editing by someone else’s id creates your own row instead of hijacking theirs',
  r.body && r.body.ok === true && r.body.smartGoals.length === 2 && hijacked && hijacked.id !== 'sg2',
  JSON.stringify(r.body && r.body.smartGoals));
r = await call('deleteSmartGoal', ['andrew', '1234', 'sg2']);
ok('deleting someone else’s id is a no-op, not an error',
  r.body && r.body.ok === true, JSON.stringify(r.body));
ok('and it did not remove their goal', (mem.smartGoals || []).some(function (x) { return x.id === 'sg2'; }));

/* ---------- 5. delete removes only that goal, only your own ---------- */
seed([
  { id: 'sgA', staffId: 'st_me', year: 2026, category: 'Health', title: 'Keep', pct: 10 },
  { id: 'sgB', staffId: 'st_me', year: 2026, category: 'Health', title: 'Remove', pct: 10 },
]);
r = await call('deleteSmartGoal', ['andrew', '1234', 'sgB']);
ok('delete removes the one goal', r.body && r.body.smartGoals.length === 1 && r.body.smartGoals[0].title === 'Keep',
  JSON.stringify(r.body && r.body.smartGoals));

/* ---------- 6. years and categories don't bleed into each other ---------- */
seed([
  { id: 'sg1', staffId: 'st_me', year: 2025, category: 'Faith', title: 'Last year', pct: 10 },
  { id: 'sg2', staffId: 'st_me', year: 2026, category: 'Faith', title: 'This year, faith', pct: 20 },
  { id: 'sg3', staffId: 'st_me', year: 2026, category: 'Health', title: 'This year, health', pct: 30 },
]);
r = await call('getMySmartGoals', ['andrew', '1234']);
const byYearCat = r.body.smartGoals.filter(function (x) { return x.year === 2026 && x.category === 'Faith'; });
ok('a goal only shows for its own year + category',
  byYearCat.length === 1 && byYearCat[0].title === 'This year, faith', JSON.stringify(r.body.smartGoals));

/* ---------- 7. a wrong PIN writes nothing ---------- */
seed();
r = await call('saveSmartGoal', ['andrew', '9999', { year: 2026, category: 'Faith', title: 'nope', pct: 0 }]);
ok('a wrong PIN is refused', r.body && r.body.ok === false && (mem.smartGoals || []).length === 0);

/* ---------- 8. SMART answers and the steps that lead up to the goal ---------- */
seed();
r = await call('saveSmartGoal', ['andrew', '1234', { year: 2026, category: 'Faith', title: 'Read the New Testament', pct: 10,
  smart: { s: 'Read all 27 books', m: 'One book every two weeks', a: 'Twenty minutes each morning', r: 'To know Jesus better', t: 'By 30 November', junk: 'x' },
  steps: [
    { kind: 'quarter', period: 1, title: 'Gospels', done: true },
    { kind: 'month', period: 4, title: 'Acts', done: false },
    { kind: 'week', period: 1, title: 'not a real kind' },
    { kind: 'quarter', period: 9, title: 'no ninth quarter' },
    { kind: 'month', period: 5, title: '' }
  ] }]);
g = r.body && r.body.smartGoals[0];
ok('the five SMART answers are kept, nothing else', g && g.smart.s === 'Read all 27 books' && g.smart.t === 'By 30 November' &&
  Object.keys(g.smart).sort().join() === 'a,m,r,s,t', JSON.stringify(g && g.smart));
ok('only well-formed steps are kept (a kind, a period in range, a title)', g && g.steps.length === 2 &&
  g.steps[0].title === 'Gospels' && g.steps[1].kind === 'month' && g.steps[1].period === 4, JSON.stringify(g && g.steps));
ok('each step gets an id', g && g.steps.every(function (x) { return typeof x.id === 'string' && x.id; }));
ok('with steps, progress is what is ticked off — not the typed percent', g && g.pct === 50 && g.pctManual === 10, 'pct=' + (g && g.pct));
const stepIds = g.steps.map(function (x) { return x.id; });
r = await call('saveSmartGoal', ['andrew', '1234', { id: g.id, year: 2026, category: 'Faith', title: g.title, pct: 10, smart: g.smart,
  steps: g.steps.map(function (x) { return Object.assign({}, x, { done: true }); }) }]);
g = r.body.smartGoals[0];
ok('ticking the steps keeps their ids and moves progress to 100', g.steps.map(function (x) { return x.id; }).join() === stepIds.join() && g.pct === 100);
r = await call('saveSmartGoal', ['andrew', '1234', { id: g.id, year: 2026, category: 'Faith', title: g.title, pct: 10, steps: [] }]);
ok('with no steps or tasks the typed percent is the progress again', r.body.smartGoals[0].pct === 10);
r = await call('saveSmartGoal', ['andrew', '1234', { year: 2026, category: 'Faith', title: 'Too many steps',
  steps: Array.from({ length: 40 }, function (_, i) { return { kind: 'month', period: (i % 12) + 1, title: 'step ' + i }; }) }]);
ok('steps are capped at 24', r.body.ok && r.body.smartGoals.filter(function (x) { return x.title === 'Too many steps'; })[0].steps.length === 24);
ok('a goal saved without SMART answers still reads with the five keys, empty',
  JSON.stringify(r.body.smartGoals.filter(function (x) { return x.title === 'Too many steps'; })[0].smart) === JSON.stringify({ s: '', m: '', a: '', r: '', t: '' }));

/* ---------- 9. tasks: your own list, each one on a goal or not ---------- */
seed([{ id: 'sgMine', staffId: 'st_me', year: 2026, category: 'Health', title: 'Run a 10k', pct: 0 },
      { id: 'sgTheirs', staffId: 'st_other', year: 2026, category: 'Health', title: 'Theirs', pct: 0 }]);
r = await call('saveTask', ['andrew', '1234', { title: 'Buy running shoes', due: '2026-10-10', goalId: 'sgMine', notes: 'size 42' }]);
ok('saveTask adds a task and answers with tasks and goals', r.body && r.body.ok && r.body.tasks.length === 1 && Array.isArray(r.body.smartGoals), JSON.stringify(r.body));
let tk = r.body.tasks[0];
ok('the task keeps its title, date, note and goal', tk.title === 'Buy running shoes' && tk.due === '2026-10-10' && tk.notes === 'size 42' && tk.goalId === 'sgMine' && tk.done === false);
ok('the goal now counts it', r.body.smartGoals[0].tasksTotal === 1 && r.body.smartGoals[0].tasksDone === 0 && r.body.smartGoals[0].pct === 0);
r = await call('saveTask', ['andrew', '1234', Object.assign({}, tk, { done: true })]);
tk = r.body.tasks[0];
ok('ticking it off records when, and the goal moves to 100%', tk.done === true && /^\d{4}-/.test(tk.doneAt) && r.body.smartGoals[0].pct === 100 && r.body.smartGoals[0].tasksDone === 1);
r = await call('saveTask', ['andrew', '1234', { title: 'Run twice this week', goalId: 'sgTheirs' }]);
ok('a task cannot hang off someone else’s goal — it saves with no goal', r.body.ok && r.body.tasks.filter(function (x) { return x.title === 'Run twice this week'; })[0].goalId === '');
r = await call('saveTask', ['andrew', '1234', { title: 'x', due: 'next tuesday' }]);
ok('a bad date is refused', r.body && r.body.ok === false && r.body.err === 'bad_due');
r = await call('saveTask', ['andrew', '1234', { title: '' }]);
ok('a blank task is refused', r.body && r.body.ok === false && r.body.err === 'bad_title');
r = await call('getMyTasks', ['sokha', '1234']);
ok('someone else sees none of my tasks', r.body && r.body.ok && r.body.tasks.length === 0);
r = await call('saveTask', ['sokha', '1234', { id: tk.id, title: 'Hijacked', done: false }]);
ok('editing by my id from another account makes their own row, mine is untouched',
  r.body.ok && r.body.tasks.length === 1 && r.body.tasks[0].id !== tk.id && mem.tasks.filter(function (x) { return x.id === tk.id; })[0].title === 'Buy running shoes');
r = await call('deleteTask', ['sokha', '1234', tk.id]);
ok('deleting my task from another account is a no-op', r.body.ok && mem.tasks.some(function (x) { return x.id === tk.id; }));
r = await call('deleteSmartGoal', ['andrew', '1234', 'sgMine']);
ok('deleting a goal leaves its tasks, now under no goal', mem.tasks.filter(function (x) { return x.id === tk.id; })[0].goalId === '');
r = await call('clearDoneTasks', ['andrew', '1234']);
ok('clearDoneTasks removes only my finished tasks', r.body.ok && r.body.tasks.length === 1 && r.body.tasks[0].title === 'Run twice this week' &&
  mem.tasks.some(function (x) { return x.staffId === 'st_other'; }));
r = await call('deleteTask', ['andrew', '1234', r.body.tasks[0].id]);
ok('deleteTask removes my task', r.body.ok && r.body.tasks.length === 0);
r = await call('saveTask', ['andrew', '9999', { title: 'nope' }]);
ok('a wrong PIN writes no task', r.body && r.body.ok === false && !mem.tasks.some(function (x) { return x.title === 'nope'; }));

/* ---------- 10. boot carries the tasks along ---------- */
seed();
mem.tasks = [{ id: 'tk1', staffId: 'st_me', title: 'Mine', done: false, order: 1 }, { id: 'tk2', staffId: 'st_other', title: 'Theirs', done: false, order: 1 }];
r = await call('getMyBoot', ['andrew', '1234']);
ok('getMyBoot has my tasks and only mine', r.body && r.body.ok && r.body.tasks.length === 1 && r.body.tasks[0].title === 'Mine', JSON.stringify(r.body && r.body.tasks));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
