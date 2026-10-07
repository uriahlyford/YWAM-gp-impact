/* The Goals & Tasks page (Oct 2026): Annual goals on My Home open into a page
   of their own. 🎯 Goals: year and category, "What is a SMART goal?" with the
   five answers explained, each goal written out as a SMART goal, its quarterly
   and monthly steps ticked off in place, progress following the steps and
   tasks. ✅ Tasks: a Google-Tasks-like list — add with Enter, tick off, a due
   date, linked to a goal, Overdue / Today / Upcoming / No date, Completed
   folded, Clear completed. On the real backend, in a phone-sized window. */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP = tmpDir('goals-page');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) {
  if (f.endsWith('.js')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
}
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const mk = o => Object.assign({ active: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Staff', staffType: 'campus', country: 'Cambodia', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
mem.staff = [
  mk({ id: 'me', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),
  mk({ id: 'mt', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', dept: 'Campus Leadership', ministry: 'Community Service' })
];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer(async (req, res) => {
  if (req.url.indexOf('/.netlify/functions/api') === 0) {
    let b = ''; for await (const c of req) b += c;
    const r = await api.default({ method: 'POST', json: async () => JSON.parse(b || '{}'), headers: new Map() }, {});
    const t = await r.text(); res.writeHead(r.status || 200, { 'Content-Type': 'application/json' }); res.end(t); return;
  }
  let u = req.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(PUBLIC, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const BASE = 'http://127.0.0.1:' + srv.address().port;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
async function open(user, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'Asia/Phnom_Penh' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  page.on('dialog', d => d.accept());
  await page.route('**fonts.g**', r => r.abort());
  await page.addInitScript(a => {
    localStorage.setItem('gp-staff', JSON.stringify({ user: a.u, pin: '1234' }));
    if (a.km) localStorage.setItem('gp-lang', 'km');
  }, { u: user, km: !!opts.km });
  await page.goto(BASE + '/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom button', { timeout: 15000 });
  await page.click('nav.bottom button[data-tab="week"]');
  await page.waitForTimeout(400);
  return { ctx, page };
}
const text = async (page, sel) => page.$eval(sel, e => e.innerText.replace(/\s+/g, ' ').trim());

// Phnom Penh is UTC+7; the page's "today" is the browser's local date.
const NOW = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10), YR = Number(NOW.slice(0, 4));
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
mem.smartGoals = [
  { id: 'sg1', staffId: 'me', year: YR, category: 'Faith', title: 'Read the whole New Testament', meta: 'by Dec', pct: 70,
    smart: { s: 'All 27 books', m: 'One book every two weeks', a: '', r: 'To know Jesus better', t: 'By 30 November' },
    steps: [{ id: 'st1', kind: 'quarter', period: 1, title: 'The four Gospels', done: true }, { id: 'st2', kind: 'month', period: 5, title: 'Acts', done: false },
            { id: 'st3', kind: 'quarter', period: 2, title: 'Acts to Romans', done: false }] },
  { id: 'sg2', staffId: 'me', year: YR, category: 'Health', title: 'Run a 10k', pct: 30 },
  { id: 'sg3', staffId: 'mt', year: YR, category: 'Faith', title: 'Not mine', pct: 10 }
];
mem.tasks = [
  { id: 'tk1', staffId: 'me', goalId: 'sg1', title: 'Read Acts 1–7', due: NOW, done: false, order: 1 },
  { id: 'tk2', staffId: 'me', goalId: 'sg1', title: 'Read Acts 8–14', due: addDays(NOW, 3), done: false, order: 2 },
  { id: 'tk3', staffId: 'me', goalId: 'sg1', title: 'Buy a reading plan', due: '', done: true, doneAt: NOW + 'T01:00:00Z', order: 3 },
  { id: 'tk4', staffId: 'me', goalId: '', title: 'Call the landlord', due: addDays(NOW, -2), done: false, order: 4 },
  { id: 'tk5', staffId: 'mt', goalId: '', title: 'Theirs', due: NOW, done: false, order: 1 }
];

/* ---------- 1. My Home → the page ---------- */
{
  const { ctx, page } = await open('sreilea');
  const card = await text(page, '#goGoalsFromMe');
  ok('My Home sums the year up on one card: goals, average (33 and 30), tasks due', new RegExp(YR + ' goals 2 goals · 32% on average · 2 tasks due').test(card), card);
  ok('… and there is no editor on My Home', !(await page.$('[data-smartcat]')) && !(await page.$('#smartToggle')));
  await page.click('#goGoalsFromMe'); await page.waitForTimeout(400);
  ok('tapping it opens the Goals & Tasks page', await page.evaluate(() => S.view === 'goals') && (await text(page, '#main h2')) === 'Goals & Tasks');
  const tabs = await page.$$eval('[data-gtab]', bs => bs.map(b => b.innerText.replace(/\s+/g, ' ').trim()));
  ok('two tabs, Tasks with its open count', tabs[0] === '🎯 Goals' && /^✅ Tasks 3$/.test(tabs[1]), tabs.join(' | '));
  ok('nav stays on My Home underneath', !!(await page.$('nav.bottom button[data-tab="week"]')));

  /* 🎯 Goals */
  ok('the year and the six categories, with counts', (await text(page, '.yearNum')) === String(YR) &&
    (await page.$$eval('[data-smartcat]', bs => bs.map(b => b.innerText))).join('|') === 'Faith · 1|Health · 1|Finance|Language|Skills|Fun');
  ok('"What is a SMART goal?" is folded to one line', /What is a SMART goal\? Specific · Measurable/.test(await text(page, '#smartHelpToggle')) && !(await page.$('.smartHelp')));
  await page.click('#smartHelpToggle'); await page.waitForTimeout(300);
  const help = await text(page, '.smartHelp');
  ok('… opens to the five answers explained, and how to break the year down',
    /S Specific — Say exactly what you will do/.test(help) && /M Measurable/.test(help) && /A Achievable/.test(help) && /R Relevant/.test(help) && /T Time-bound — By when\?/.test(help) &&
    /end of each quarter, and what gets done each month/.test(help), help.slice(0, 160));
  await page.click('#smartHelpToggle'); await page.waitForTimeout(200);
  ok('… and folds again', !(await page.$('.smartHelp')));

  const g1 = await text(page, '[data-goalcard="sg1"]');
  ok('a goal card: title, progress that follows its steps and tasks (2 of 6 → 33%)', /^Read the whole New Testament by Dec 33% · 1 of 3 steps · 1 of 3 tasks/.test(g1), g1.slice(0, 100));
  ok('… the SMART answers it has, by letter, and not the blank one', /S All 27 books M One book every two weeks R To know Jesus better T By 30 November/.test(g1) && !/\bA\b [A-Z]/.test(g1.replace('All 27', 'x')), g1);
  const steps = await page.$$eval('[data-goalcard="sg1"] .stepRow', rs => rs.map(r => (r.classList.contains('done') ? '✓' : '○') + r.querySelector('.stepPeriod').innerText + ' ' + r.querySelector('.stepTitle').innerText));
  ok('its steps: quarters first then months, ticked where done', steps.join(' | ') === '✓Q1 The four Gospels | ○Q2 Acts to Romans | ○May Acts', steps.join(' | '));
  ok('… and a line to its tasks', /3 tasks · 1 done/.test(await text(page, '[data-goalcard="sg1"] [data-goaltasks]')));
  ok('a goal with nothing written yet says so and keeps its typed percent', /Not written as a SMART goal yet/.test(await text(page, '.catChip[data-smartcat="Health"]')) === false &&
    (await page.click('[data-smartcat="Health"]'), await page.waitForTimeout(300), /Run a 10k 30%/.test(await text(page, '[data-goalcard="sg2"]')) && /Not written as a SMART goal yet/.test(await text(page, '[data-goalcard="sg2"]'))));
  ok('someone else’s goal is nowhere on my page', !/Not mine/.test(await text(page, '#main')));

  /* tick a step */
  await page.click('[data-smartcat="Faith"]'); await page.waitForTimeout(300);
  await page.click('[data-stepdone="sg1|st2"]'); await page.waitForTimeout(700);
  ok('ticking a step saves it and moves the goal (3 of 6 → 50%)', mem.smartGoals[0].steps[1].done === true && /50% · 2 of 3 steps/.test(await text(page, '[data-goalcard="sg1"]')), await text(page, '[data-goalcard="sg1"] .smartPct'));
  /* add a monthly step */
  await page.click('[data-stepnew="sg1"]'); await page.waitForTimeout(300);
  await page.selectOption('#stepKind', 'month'); await page.waitForTimeout(300);
  ok('the period list follows the kind — twelve months', (await page.$$eval('#stepPeriod option', os => os.length)) === 12);
  await page.selectOption('#stepPeriod', '9');
  await page.fill('#stepTitle', 'Paul’s letters'); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  ok('Enter adds the step, kept as September, and the box stays open for the next one',
    mem.smartGoals[0].steps.some(s => s.title === 'Paul’s letters' && s.kind === 'month' && s.period === 9) && !!(await page.$('#stepTitle')) && (await page.inputValue('#stepTitle')) === '',
    JSON.stringify(mem.smartGoals[0].steps.map(s => s.title)));
  await page.click('#stepCancelBtn'); await page.waitForTimeout(200);
  /* remove it */
  const newId = mem.smartGoals[0].steps.filter(s => s.title === 'Paul’s letters')[0].id;
  await page.click('[data-stepdel="sg1|' + newId + '"]'); await page.waitForTimeout(700);
  ok('× removes a step', !mem.smartGoals[0].steps.some(s => s.id === newId));

  /* edit: the five SMART boxes */
  await page.click('[data-smartedit="sg1"]'); await page.waitForTimeout(300);
  ok('Edit opens the form with the five SMART boxes, each with its letter and word, filled from the goal',
    (await page.$$eval('label.smartF', ls => ls.map(l => l.innerText.replace(/\s+/g, ' ').trim()))).join('|') === 'S Specific|M Measurable|A Achievable|R Relevant|T Time-bound' &&
    (await page.inputValue('#sg_s')) === 'All 27 books' && (await page.inputValue('#sg_a')) === '');
  ok('… no percent box — progress follows the steps and tasks', !(await page.$('#sg_pct')) && /Progress follows your steps and tasks: 50%/.test(await text(page, '.smartGoal')));
  await page.fill('#sg_a', 'Twenty minutes each morning');
  await page.click('#smartSaveBtn'); await page.waitForTimeout(700);
  ok('saving keeps the steps and adds the answer', mem.smartGoals[0].smart.a === 'Twenty minutes each morning' && mem.smartGoals[0].steps.length === 3 &&
    /A Twenty minutes each morning/.test(await text(page, '[data-goalcard="sg1"]')));
  /* a new goal has the percent box, empty */
  await page.click('#smartNewBtn'); await page.waitForTimeout(300);
  ok('a new goal: the percent box is there and empty, SMART boxes blank', !!(await page.$('#sg_pct')) && (await page.inputValue('#sg_pct')) === '' && (await page.inputValue('#sg_t')) === '');
  await page.fill('#sg_title', 'Memorise Romans 8'); await page.fill('#sg_t', 'By Easter');
  await page.click('#smartSaveBtn'); await page.waitForTimeout(700);
  ok('… saves under this year and category with its answer', mem.smartGoals.some(g => g.title === 'Memorise Romans 8' && g.year === YR && g.category === 'Faith' && g.smart.t === 'By Easter'));

  /* ✅ Tasks, from a goal */
  await page.click('[data-goalcard="sg1"] [data-goaltasks]'); await page.waitForTimeout(400);
  ok('the goal’s tasks line opens the Tasks tab filtered to that goal', await page.evaluate(() => S.goalsTab === 'tasks' && S.taskFilter === 'sg1') &&
    /Read the whole New Testament/.test(await text(page, '.tkGoalHead')) && !(await page.$('#taskNewGoal')));
  let rows = await page.$$eval('.tkRow .tkTitle', rs => rs.map(r => r.innerText));
  ok('… only that goal’s open tasks', rows.join('|') === 'Read Acts 1–7|Read Acts 8–14', rows.join('|'));
  await page.click('[data-taskfilter="all"]'); await page.waitForTimeout(300);
  const secs = await page.$$eval('.tkList .tkSecHead, .tkList .tkRow .tkTitle', es => es.map(e => e.classList.contains('tkSecHead') ? '[' + e.textContent.replace(/\s+/g, ' ').trim() + ']' : e.innerText));
  ok('All: Overdue / Today / Upcoming, in order, with counts', secs.join(' ') === '[Overdue 1] Call the landlord [Today 1] Read Acts 1–7 [Upcoming 1] Read Acts 8–14', secs.join(' '));
  ok('an overdue date is red and reads as a day', (await page.$$eval('.tkDue.late', es => es.length)) === 1 && /Today/.test(await text(page, '[data-taskrow="tk1"] .tkMeta')));
  ok('a task shows which goal it belongs to', /🎯 Read the whole New Testament/.test(await text(page, '[data-taskrow="tk1"] .tkMeta')));
  ok('someone else’s task is not here', !/Theirs/.test(await text(page, '#main')));
  ok('the filter chips: All, each goal, Other tasks', (await page.$$eval('[data-taskfilter]', bs => bs.map(b => b.getAttribute('data-taskfilter')))).join('|').replace(/sg[0-9a-z]+\|/g, 'G|') === 'all|G|G|G|other');
  ok('Completed is folded with its count', /Completed \(1\)/.test(await text(page, '#tasksDoneToggle')) && !(await page.$('[data-taskrow="tk3"]')));
  await page.click('#tasksDoneToggle'); await page.waitForTimeout(300);
  ok('… opens to the done ones, struck through, with Clear completed', !!(await page.$('.tkRow.done[data-taskrow="tk3"]')) && !!(await page.$('#tasksClearDone')));

  /* add with Enter */
  await page.fill('#taskNewDue', NOW); await page.selectOption('#taskNewGoal', 'sg2');
  await page.fill('#taskNewTitle', 'Pray for the team'); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  const added = mem.tasks.filter(x => x.title === 'Pray for the team')[0];
  ok('Enter in the box adds the task with its date and goal, and empties the box',
    added && added.due === NOW && added.goalId === 'sg2' && added.staffId === 'me' && (await page.inputValue('#taskNewTitle')) === '', JSON.stringify(added));
  const todaySec = await page.$$eval('.tkList .tkSecHead', es => es.map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(x => /^Today/.test(x))[0]);
  ok('… it lands under Today, and the goal counts it', todaySec === 'Today 2' && /Pray for the team/.test(await text(page, '.tkList')) &&
    await page.evaluate(() => S.smartGoals.filter(g => g.id === 'sg2')[0].tasksTotal === 1), todaySec);
  /* tick off */
  await page.click('[data-taskdone="tk1"]'); await page.waitForTimeout(700);
  ok('ticking a task moves it to Completed and the goal follows (4 of 6 → 67%)', mem.tasks.filter(x => x.id === 'tk1')[0].done === true &&
    await page.evaluate(() => S.smartGoals.filter(g => g.id === 'sg1')[0].pct === 67) && /Completed \(2\)/.test(await text(page, '#tasksDoneToggle')));
  await page.click('.tkRow.done [data-taskdone="tk1"]'); await page.waitForTimeout(700);
  ok('… and unticking brings it back', mem.tasks.filter(x => x.id === 'tk1')[0].done === false && !!(await page.$('.tkRow:not(.done)[data-taskrow="tk1"]')));
  /* edit */
  await page.click('[data-taskedit="tk4"]'); await page.waitForTimeout(300);
  ok('tapping a task opens it to edit: title, details, date, goal', (await page.inputValue('#tk_title')) === 'Call the landlord' && !!(await page.$('#tk_notes')) && !!(await page.$('#tk_due')) && !!(await page.$('#tk_goal')));
  await page.fill('#tk_notes', 'about the leak'); await page.fill('#tk_due', addDays(NOW, 1)); await page.selectOption('#tk_goal', 'sg2');
  await page.click('#tkSaveBtn'); await page.waitForTimeout(700);
  const t4 = mem.tasks.filter(x => x.id === 'tk4')[0];
  ok('… Save keeps the changes', t4.notes === 'about the leak' && t4.due === addDays(NOW, 1) && t4.goalId === 'sg2' && /Tomorrow · 🎯 Run a 10k · about the leak/.test(await text(page, '[data-taskrow="tk4"] .tkMeta')), await text(page, '[data-taskrow="tk4"]'));
  await page.click('[data-taskedit="tk4"]'); await page.waitForTimeout(300);
  await page.click('#tkDeleteBtn'); await page.waitForTimeout(700);
  ok('Delete removes it', !mem.tasks.some(x => x.id === 'tk4'));
  /* clear completed */
  if (!(await page.$('#tasksClearDone'))) { await page.click('#tasksDoneToggle'); await page.waitForTimeout(300); }
  await page.click('#tasksClearDone'); await page.waitForTimeout(700);
  ok('Clear completed removes only my finished tasks', !mem.tasks.some(x => x.staffId === 'me' && x.done) && mem.tasks.some(x => x.id === 'tk5') && !(await page.$('#tasksDoneToggle')));

  /* back */
  await page.click('#goalsBack'); await page.waitForTimeout(300);
  ok('← My Home goes back', await page.evaluate(() => S.view === 'week') && !!(await page.$('#goGoalsFromMe')));
  ok('fits a phone: no sideways scroll', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}

/* ---------- 2. in Khmer, and a mentor sees the mentee's goals with steps ---------- */
{
  const { ctx, page } = await open('sreilea', { km: true });
  await page.click('#goGoalsFromMe'); await page.waitForTimeout(400);
  const h2 = await text(page, '#main h2');
  ok('the page reads in Khmer', /[ក-៿]/.test(h2) && /[ក-៿]/.test(await text(page, '#smartHelpToggle')), h2);
  await page.click('[data-gtab="tasks"]'); await page.waitForTimeout(300);
  ok('… the tasks tab too', /[ក-៿]/.test(await text(page, '.tkList')) && !/Upcoming|Today/.test(await text(page, '.tkList')));
  await ctx.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
