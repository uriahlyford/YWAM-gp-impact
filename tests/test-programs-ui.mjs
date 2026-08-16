/* The Programs tab — data capture for the Ministry report.

   What this protects, in order of how badly it hurts:

   - The form is built from programs.js. If it ever stops being, the SVI form and
     the YDC form drift into two hand-written copies and a field added to the
     agreement gets added to one of them.
   - What the form sends is what the server was asked to store: the country and
     the dates go in the body, not just the headcounts.
   - Records are fetched when the tab is opened, not at boot — a page open is one
     function invocation and Netlify bills those.
   - A guest gets the gate. getPrograms refuses an anonymous caller anyway, but
     the screen must say so rather than showing an empty report.
   - Records carry a quarter, and a period is the set of quarters it covers, so
     the Ministry's six-month filing needs nothing typed a second time.
   - Four tabs still fit a 320px phone.
*/
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';

const ROOT = PUBLIC;
const T = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.png':'image/png' };
const srv = http.createServer((q, r) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(4419, r));

const YEAR = new Date().getFullYear();
const ME = { id:'st1', name:'Sokha Chan', username:'sokha', campus:'poipet', dept:'Community Service',
  ministry:'Outreach Teams', role:'Coordinator', photo:'', mentorId:'' };
/* Weekly KPI entries — the app's own numbers, which are what the report must be
   built from. Week 3 is Q1, week 20 is Q2 (rollup counts 13 weeks to a quarter).
   Outreach Teams logged 12 volunteers across 1 team in Q1 and 18 across 2 teams
   in Q2; YDC's enrolment is a level, so it is `latest` within the period. */
const DATA = { leader:false, okrs:[], survey:[], entries:{ poipet:{
  'Community Service|Outreach Teams|Volunteers Mobilized': { 3:12, 20:18 },
  'Community Service|Outreach Teams|Teams Hosted':         { 3:1,  20:2 },
  'Community Service|Outreach Teams|People Served':        { 3:800, 20:1020 },
  'Youth Education|YDC|Youth Enrolled':                    { 3:95, 20:187 },
  'Leadership Development|DTS|Students Enrolled':          { 20:24 },
} } };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const b = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});

/* The fake store: one array of programme rows, and the handlers behave the way
   api.js does — save returns the whole list back, stamped. */
function makeStore(seed) {
  return { rows: (seed || []).slice(), calls: [] };
}

async function mk(store, opts) {
  opts = opts || {};
  const p = await b.newPage({ viewport:{ width: opts.width || 400, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { const tx = m.text();
    if (m.type() === 'error' && !/fonts\.googleapis|ERR_CONNECTION|ERR_NAME|favicon/.test(tx)) errs.push('console: ' + tx.slice(0, 160)); });
  p.on('dialog', d => d.accept());
  await p.route('**/.netlify/functions/api', r => {
    const q = JSON.parse(r.request().postData() || '{}');
    store.calls.push(q);
    let o = DATA;
    if (q.fn === 'getPrograms') {
      const yr = Number(q.args[2]) || YEAR;
      o = { ok:true, year:yr, records: store.rows.filter(x => Number(x.year) === yr) };
    } else if (q.fn === 'saveProgramRecord') {
      const rec = Object.assign({}, q.args[2]);
      rec.id = rec.id || ('pr_' + store.rows.length + '_' + Date.now());
      rec.campus = 'poipet'; rec.by = 'st1';
      const i = store.rows.findIndex(x => x.id === rec.id);
      if (i > -1) store.rows[i] = rec; else store.rows.push(rec);
      o = { ok:true, year:Number(rec.year) || YEAR, records: store.rows.filter(x => Number(x.year) === (Number(rec.year) || YEAR)) };
    } else if (q.fn === 'deleteProgramRecord') {
      store.rows = store.rows.filter(x => x.id !== q.args[2]);
      o = { ok:true, year:YEAR, records: store.rows.filter(x => Number(x.year) === YEAR) };
    } else if (q.fn === 'getMyBoot') {
      o = { ok:true, staff:ME, profile:{}, roster:[ME], logs:[], habits:null, mentees:[], mentorRequests:[],
        goals:[], checkins:[], trips:null, tripRequests:[], ministry:null, base:DATA };
    } else if (/^getMy/.test(q.fn)) o = { ok:true, logs:[], goals:[], checkins:[], mentees:[], requests:[] };
    r.fulfill({ status:200, contentType:'application/json', body: JSON.stringify(o) });
  });
  await p.addInitScript(signedIn => {
    sessionStorage.setItem('gp-skip-teams', '1');
    if (signedIn) {
      localStorage.setItem('gp-staff', JSON.stringify({ user:'sokha', pin:'1234' }));
      localStorage.setItem('gp-staff-card', JSON.stringify({ name:'Sokha Chan', campus:'poipet' }));
    } else {
      sessionStorage.setItem('gp-guest', '1');
    }
  }, opts.guest ? false : true);
  await p.goto('http://localhost:4419/index.html');
  await p.waitForSelector('#nav button', { timeout: 15000 });
  await p.waitForTimeout(500);
  p.__errs = errs;
  return p;
}

/* ---------- 1. the tab, and the load that only happens when you open it ---------- */
let store = makeStore();
let p = await mk(store);
const tabs = await p.$$eval('#nav button', bs => bs.map(x => x.getAttribute('data-view')));
ok('the Programs tab is in the nav', tabs.indexOf('programs') > -1, tabs.join(','));

const beforeOpen = store.calls.filter(c => c.fn === 'getPrograms').length;
ok('opening the page does not fetch programme records', beforeOpen === 0, 'calls=' + beforeOpen);

await p.click('[data-view="programs"]');
await p.waitForSelector('.progChips', { timeout: 8000 });
await p.waitForTimeout(600);
const afterOpen = store.calls.filter(c => c.fn === 'getPrograms');
ok('opening the tab fetches once', afterOpen.length === 1, 'calls=' + afterOpen.length);
ok('and asks for the year on screen', Number(afterOpen[0].args[2]) === YEAR, String(afterOpen[0].args[2]));
ok('signed in as the person doing it', afterOpen[0].args[0] === 'sokha', String(afterOpen[0].args[0]));

const chips = await p.$$eval('.pchip', bs => bs.map(x => x.getAttribute('data-prog')));
ok('all four agreements plus the challenges section are offered',
  chips.join(',') === 'SVI,YDC,YLT,YAP,ISSUES', chips.join(','));

/* ---------- 2. the form is built from programs.js ---------- */
await p.click('#openRecBtn');
await p.waitForSelector('#recForm', { timeout: 5000 });
const sviFields = await p.$$eval('#recForm [data-f]', els => els.map(e => e.getAttribute('data-f')));
const wantSvi = await p.evaluate(() => GP_RECORD_FIELDS.team.map(f => f.k));
ok('the SVI form has exactly the fields programs.js declares',
  sviFields.join(',') === wantSvi.join(','), sviFields.join(','));
const dateBoxes = await p.$$eval('#recForm input[type=date]', els => els.length);
ok('the dates are real date pickers, not free text', dateBoxes === 2, 'date inputs=' + dateBoxes);

/* ---------- 3. what the form sends is what the report needs ---------- */
await p.fill('#pf_name', 'YWAM Maui');
await p.fill('#pf_country', 'USA');
await p.fill('#pf_from', YEAR + '-02-03');
await p.fill('#pf_to', YEAR + '-02-17');
await p.fill('#pf_male', '5');
await p.fill('#pf_female', '7');
await p.fill('#pf_activities', 'Teaching English');
await p.click('#saveRecBtn');
await p.waitForTimeout(700);

const saved = store.calls.filter(c => c.fn === 'saveProgramRecord').pop();
const body = saved && saved.args[2];
ok('the country and the dates were sent, not just the headcount',
  body && body.country === 'USA' && body.from === YEAR + '-02-03' && body.to === YEAR + '-02-17',
  body ? JSON.stringify({ c:body.country, f:body.from, t:body.to }) : 'nothing sent');
ok('counts are sent as numbers', body && body.male === 5 && body.female === 7,
  body ? typeof body.male + ' ' + body.male + '/' + body.female : '');
ok('the record knows its programme, year and quarter',
  body && body.program === 'SVI' && body.year === YEAR && body.quarter >= 1 && body.quarter <= 4,
  body ? body.program + ' ' + body.year + ' Q' + body.quarter : '');

const listed = await p.$$eval('.recRow .recName', els => els.map(e => e.textContent.trim()));
ok('the team is now on the list', listed.some(x => /YWAM Maui/.test(x)), listed.join(' | '));
const meta = await p.$eval('.recRow .recMeta', e => e.textContent);
ok('and reads back the way the report says it', /USA/.test(meta) && /5 men/.test(meta) && /7 women/.test(meta), meta);

/* The facts strip is the check on your own typing — a wrong figure should be
   visible before the report is written, not after. */
const facts = await p.$$eval('.progFact', els => els.map(e => e.querySelector('span').textContent.trim() + '=' + e.querySelector('b').textContent.trim()));
ok('the facts strip counts the team', facts.indexOf('Teams=1') > -1, facts.join(' '));
ok('and its twelve volunteers', facts.indexOf('Volunteers=12') > -1, facts.join(' '));
ok('split by sex, which is what the Ministry asks for',
  facts.indexOf('Men=5') > -1 && facts.indexOf('Women=7') > -1, facts.join(' '));
ok('and counts the countries it came from', facts.indexOf('Countries=1') > -1, facts.join(' '));

/* ---------- 4. the annual estimate, and the percentage against it ----------
   The estimate belongs to the ministry that has to reach it, so it is saved
   against that ministry rather than against the programme as a whole. */
const SVI_MIN = 'Community Service|Outreach Teams';
await p.fill('.estIn[data-est="' + SVI_MIN + '"]', '250');
await p.click('[data-estsave="' + SVI_MIN + '"]');
await p.waitForTimeout(700);
const goalCall = store.calls.filter(c => c.fn === 'saveProgramRecord' && c.args[2].kind === 'estimate').pop();
ok('an annual estimate saves as its own record, owned by a ministry',
  goalCall && goalCall.args[2].target === 250 && goalCall.args[2].program === 'SVI' &&
  goalCall.args[2].ministry === 'Outreach Teams',
  goalCall ? JSON.stringify(goalCall.args[2]) : 'not sent');
const ringPct = await p.$eval('.okrCard .ring', e => e.textContent.trim()).catch(() => '');
/* 30 volunteers logged for the year to date (12 in Q1 + 18 in Q2) against an
   estimate of 250 — the ring reads the weekly numbers, not the typed rows. */
ok('the ring measures what was logged against the estimate', ringPct === '12%', 'ring=' + ringPct);

/* ---------- 5. a different agreement is a different form ---------- */
await p.click('[data-prog="YDC"]');
await p.waitForTimeout(400);
await p.click('#openRecBtn');
await p.waitForSelector('#recForm', { timeout: 5000 });
const ydcFields = await p.$$eval('#recForm [data-f]', els => els.map(e => e.getAttribute('data-f')));
const wantYdc = await p.evaluate(() => GP_RECORD_FIELDS.class.map(f => f.k));
ok('YDC asks for locations and classes, not countries and dates',
  ydcFields.join(',') === wantYdc.join(',') && ydcFields.indexOf('country') === -1, ydcFields.join(','));

await p.click('[data-prog="YLT"]');
await p.waitForTimeout(400);
await p.click('#openRecBtn');
await p.waitForSelector('#recForm', { timeout: 5000 });
const yltFields = await p.$$eval('#recForm [data-f]', els => els.map(e => e.getAttribute('data-f')));
ok('YLT asks for the Khmer/international and staff breakdown',
  ['khmer','intl','staffMale','staffFemale','staffIntl','staffKhmer','outreach'].every(k => yltFields.indexOf(k) > -1),
  yltFields.join(','));

/* ---------- 6. challenges belong to the base, not to a programme ---------- */
await p.click('[data-prog="ISSUES"]');
await p.waitForTimeout(400);
await p.click('#openRecBtn');
await p.waitForSelector('#recForm', { timeout: 5000 });
await p.fill('#pf_challenge', 'Fewer volunteer teams than last year');
await p.fill('#pf_solution', 'Asked two partner bases to send in October');
await p.click('#saveRecBtn');
await p.waitForTimeout(700);
const issue = store.calls.filter(c => c.fn === 'saveProgramRecord' && c.args[2].kind === 'issue').pop();
ok('a challenge saves with no programme attached',
  issue && issue.args[2].program === '' && /Fewer volunteer/.test(issue.args[2].challenge),
  issue ? JSON.stringify(issue.args[2]) : 'not sent');
const issueText = await p.$eval('#main', e => e.textContent);
ok('the screen says what not to write about', /every organisation needs more staff/i.test(issueText),
  /needs more staff/i.test(issueText) ? 'present' : 'MISSING');

/* ---------- 7. a required field is not silently dropped ---------- */
await p.click('#openRecBtn');
await p.waitForSelector('#recForm', { timeout: 5000 });
const sendsBefore = store.calls.filter(c => c.fn === 'saveProgramRecord').length;
await p.click('#saveRecBtn');
await p.waitForTimeout(500);
const sendsAfter = store.calls.filter(c => c.fn === 'saveProgramRecord').length;
ok('an empty form does not post', sendsAfter === sendsBefore, sendsBefore + ' -> ' + sendsAfter);
const errShown = await p.$eval('#errorBar', e => !e.classList.contains('hidden') && e.textContent).catch(() => false);
ok('and says which field is missing', !!errShown && /challenge/i.test(String(errShown)), String(errShown));

ok('no console errors anywhere on the Programs tab', p.__errs.length === 0, p.__errs.join(' | ') || 'clean');
await p.close();

/* ---------- 8. the period filter, and the year switch ----------
   Records carry a quarter; a period is the set of quarters it covers. The row in
   Q1 and the row in Q3 must show under their own quarters, under the semester
   that contains each, and together under the year — from one set of records. */
store = makeStore([
  { id:'pr_s1', kind:'class', program:'YDC', campus:'poipet', year:YEAR, quarter:1,
    location:'Poipet YDC', classes:4, male:30, female:35, activities:'' },
  { id:'pr_s2', kind:'class', program:'YDC', campus:'poipet', year:YEAR, quarter:3,
    location:'Siem Reap YDC', classes:2, male:11, female:9, activities:'' },
  { id:'pr_old', kind:'class', program:'YDC', campus:'poipet', year:YEAR - 1, quarter:1,
    location:'Last year', classes:9, male:1, female:1, activities:'' },
]);
p = await mk(store);
await p.click('[data-view="programs"]');
await p.waitForSelector('.progChips', { timeout: 8000 });
await p.click('[data-prog="YDC"]');
await p.waitForTimeout(400);
const showing = async () => p.$$eval('.recRow .recName', els => els.map(e => e.textContent.trim()));
await p.selectOption('#progPeriodSel', 'q1');
await p.waitForTimeout(400);
let names = await showing();
ok('Q1 shows only the Q1 record', names.length === 1 && /Poipet YDC/.test(names[0]), names.join(' | '));
await p.selectOption('#progPeriodSel', 'q2');
await p.waitForTimeout(400);
ok('Q2 shows nothing, because nothing happened in it', (await showing()).length === 0);
await p.selectOption('#progPeriodSel', 'q3');
await p.waitForTimeout(400);
names = await showing();
ok('Q3 shows only the Q3 record', names.length === 1 && /Siem Reap YDC/.test(names[0]), names.join(' | '));

/* The point of storing quarters: a six-month report needs nothing retyped. */
await p.selectOption('#progPeriodSel', 's1');
await p.waitForTimeout(400);
names = await showing();
ok('Semester 1 gathers Q1 and Q2', names.length === 1 && /Poipet YDC/.test(names[0]), names.join(' | '));
await p.selectOption('#progPeriodSel', 's2');
await p.waitForTimeout(400);
names = await showing();
ok('Semester 2 gathers Q3 and Q4', names.length === 1 && /Siem Reap YDC/.test(names[0]), names.join(' | '));
await p.selectOption('#progPeriodSel', 'year');
await p.waitForTimeout(400);
names = await showing();
ok('"whole year" shows every quarter', names.length === 2, names.join(' | '));

/* A record belongs to one quarter, so anything wider cannot take a new one —
   otherwise saving would have to guess when it happened. */
await p.selectOption('#progPeriodSel', 's1');
await p.waitForTimeout(400);
ok('a semester will not take a new record',
  !(await p.$('#openRecBtn')) && /Pick a single quarter/.test(await p.$eval('#main', e => e.textContent)));
await p.selectOption('#progPeriodSel', 'q2');
await p.waitForTimeout(400);
ok('and a single quarter will', !!(await p.$('#openRecBtn')));
await p.selectOption('#progPeriodSel', 'year');
await p.waitForTimeout(400);

/* Nothing from last year leaks in, and asking for last year fetches it. */
ok('last year is not on screen', !names.some(n => /Last year/.test(n)), names.join(' | '));
await p.selectOption('#progYearSel', String(YEAR - 1));
await p.waitForTimeout(700);
const yearCalls = store.calls.filter(c => c.fn === 'getPrograms').map(c => Number(c.args[2]));
ok('changing the year refetches for that year', yearCalls.indexOf(YEAR - 1) > -1, yearCalls.join(','));
names = await p.$$eval('.recRow .recName', els => els.map(e => e.textContent.trim()));
ok('and last year\'s rows are what shows', names.length === 1 && /Last year/.test(names[0]), names.join(' | '));

/* ---------- 8b. editing from a wider view keeps the row's own quarter ----------
   The picker says "Whole year"; the row says Q3. Taking the quarter from the
   picker on save moved the row into Q1 — and "Whole year" is exactly the view you
   use to check the year's total, so the corruption arrived with the
   proofreading. */
await p.selectOption('#progYearSel', String(YEAR));   // back from last year
await p.waitForTimeout(700);
await p.selectOption('#progPeriodSel', 'year');
await p.waitForTimeout(400);
const editBtns = await p.$$('[data-prec]');
let edited = null;
for (const btn of editBtns) {
  const id = await btn.getAttribute('data-prec');
  if (id !== 'pr_s2') continue;                 // the Q3 row
  await btn.click();
  await p.waitForSelector('#recForm', { timeout: 5000 });
  await p.click('#saveRecBtn');
  await p.waitForTimeout(700);
  edited = store.calls.filter(c => c.fn === 'saveProgramRecord').pop();
}
ok('editing a row from the whole-year view keeps its own quarter',
  edited && edited.args[2].id === 'pr_s2' && edited.args[2].quarter === 3,
  edited ? 'quarter=' + edited.args[2].quarter : 'no edit sent');

/* ---------- 9. delete ---------- */
await p.selectOption('#progYearSel', String(YEAR));
await p.waitForTimeout(700);
await p.selectOption('#progPeriodSel', 'q1');
await p.waitForTimeout(400);
const delBtn = await p.$('[data-pdel]');
if (delBtn) { await delBtn.click(); await p.waitForTimeout(700); }
names = await p.$$eval('.recRow .recName', els => els.map(e => e.textContent.trim()));
ok('deleting a row takes it off the list', names.length === 0, names.join(' | '));
await p.close();

/* ---------- 9a. the app's numbers, not the report's ----------
   THE DIRECTION OF TRUTH. What the ministries log weekly is the record of what
   happened; the Programs tab holds only what a weekly figure cannot say. So the
   screen shows each ministry its own logged figure, never asks anyone to retype
   it, and warns when the typed breakdown does not add up to it. */
store = makeStore([
  { id:'pr_e1', kind:'estimate', program:'SVI', campus:'poipet', year:YEAR, quarter:1,
    dept:'Community Service', ministry:'Outreach Teams', target:50, unit:'volunteers' },
  /* Only ONE of the two Q1 teams has been written up: 12 logged, 5 typed. */
  { id:'pr_t1', kind:'team', program:'SVI', campus:'poipet', year:YEAR, quarter:1, name:'YWAM Maui',
    country:'USA', from:YEAR+'-01-27', to:YEAR+'-02-21', male:2, female:3,
    servedMale:400, servedFemale:400, activities:'Teaching English' },
]);
p = await mk(store);
await p.click('[data-view="programs"]');
await p.waitForSelector('.progChips', { timeout: 8000 });
await p.selectOption('#progPeriodSel', 'q1');
await p.waitForTimeout(500);

const minRow = await p.$eval('.minRow', e => ({
  name: e.querySelector('.minName').textContent.replace(/\s+/g, ' ').trim(),
  metric: e.querySelector('.minMetric').textContent.trim(),
  got: e.querySelector('.minGot').textContent.trim(),
}));
ok('each ministry sees its own weekly figure on the Programs tab',
  /Outreach Teams/.test(minRow.name) && minRow.metric === 'Volunteers Mobilized' && minRow.got === '12',
  JSON.stringify(minRow));
/* Keyed by metric as well as ministry. Keying on the ministry alone added this
   ministry's volunteers to its teams to its people-served and showed 813. */
ok('and that figure is one metric, not several added together', minRow.got === '12', minRow.got);
ok('and the screen says where that number came from',
  /From your weekly numbers/i.test(await p.$eval('#main', e => e.textContent)));
ok('nothing on the screen asks for the count to be retyped',
  !(await p.$('#progTarget')), 'a total-count box is still on the screen');

/* The typed detail adds up to 5; the ministry logged 12. The report will print
   12, so the person entering detail needs to know the breakdown is short. */
const warn = await p.$('.mismatch');
ok('a breakdown that does not add up to the logged figure is flagged', !!warn);
if (warn) {
  const wt = await warn.evaluate(e => e.textContent.replace(/\s+/g, ' '));
  ok('and the warning names both numbers, and says which one wins',
    /12/.test(wt) && /5/.test(wt) && /report will print 12/.test(wt), wt);
}

/* The ring measures the ministries' logged figure against their own estimate. */
const ringPct1 = await p.$eval('.okrCard .ring', e => e.textContent.trim()).catch(() => '');
ok('the progress ring counts what was logged, not what was typed',
  ringPct1 === '24%', 'ring=' + ringPct1);   // 12 logged / 50 estimate

/* Each ministry owns its own annual estimate. */
await p.fill('.estIn[data-est="Community Service|Outreach Teams"]', '60');
await p.click('[data-estsave="Community Service|Outreach Teams"]');
await p.waitForTimeout(700);
const estCall = store.calls.filter(c => c.fn === 'saveProgramRecord' && c.args[2].kind === 'estimate').pop();
ok('an annual estimate saves against the ministry that owns it',
  estCall && estCall.args[2].dept === 'Community Service' &&
  estCall.args[2].ministry === 'Outreach Teams' && estCall.args[2].target === 60,
  estCall ? JSON.stringify(estCall.args[2]) : 'not sent');

/* YAP has no ministry logging anything, and the screen has to say so rather than
   showing a dash and letting somebody assume it is broken. */
await p.click('[data-prog="YAP"]');
await p.waitForTimeout(400);
const yapText = await p.$eval('#main', e => e.textContent);
ok('a programme with no weekly numbers behind it says so',
  /No weekly numbers behind this one/i.test(yapText) && /No ministry logs a weekly figure/i.test(yapText));
ok('and still offers it one annual estimate', !!(await p.$('[data-estsave="|"]')));
await p.close();

/* ---------- 9b. the generated report ----------
   The document itself is checked in test-report.mjs against the real filed
   report. What matters here is that the button hands it the records on screen,
   that it opens over the app and comes back off, and that the three ways out
   exist — a document nobody can get into Google Docs is not a report. */
store = makeStore([
  { id:'pr_g', kind:'estimate', program:'SVI', campus:'poipet', year:YEAR, quarter:1,
    dept:'Community Service', ministry:'Outreach Teams', target:50, unit:'volunteers' },
  { id:'pr_t', kind:'team', program:'SVI', campus:'poipet', year:YEAR, quarter:1, name:'YWAM Maui',
    country:'USA', from:YEAR+'-01-27', to:YEAR+'-02-21', male:6, female:6,
    servedMale:454, servedFemale:456, activities:'Teaching English in remote villages' },
  { id:'pr_i', kind:'issue', program:'', campus:'poipet', year:YEAR, quarter:1,
    challenge:'Fewer volunteer teams than last year', solution:'Asked two partner bases' },
]);
p = await mk(store);
await p.click('[data-view="programs"]');
await p.waitForSelector('.progChips', { timeout: 8000 });
await p.selectOption('#progPeriodSel', 'q1');
await p.waitForTimeout(400);
await p.click('#genReportBtn');
await p.waitForSelector('.repSheet', { timeout: 5000 });
await p.waitForTimeout(400);

const rep = await p.$eval('#repDoc', e => e.textContent.replace(/\s+/g, ' '));
ok('the report names the quarter it was generated for',
  /Activity report — 1st Quarter/.test(rep), (rep.match(/Activity report[^1]{0,4}[^ ]* \w+/) || [''])[0]);
ok('the report is built from the records on screen, not from a fixture',
  /YWAM Maui \(USA\): 12 members/.test(rep), (rep.match(/YWAM[^|]{0,50}/) || [''])[0]);
ok('the headline count is the ministry\'s weekly figure, not the typed detail',
  /Received 12 participants in the 1st quarter/.test(rep),
  (rep.match(/Received \d+ participants[^.]{0,60}/) || [''])[0]);
ok('and it is measured against the estimate that ministry entered',
  /representing 24% of the annual target \(Target: 50 participants/.test(rep),
  (rep.match(/representing[^.]{0,70}/) || [''])[0]);
ok('while the typed detail still supplies the country and the dates',
  /YWAM Maui \(USA\)/.test(rep) && /Jan 27/.test(rep));
ok('the challenges written in the app reach the report',
  /Fewer volunteer teams than last year/.test(rep) && /Asked two partner bases/.test(rep));
ok('all five sections are there',
  ['1. Introduction', '2. Project Implementation Progress', '3. Implementation Activities',
   '4. Progress of Quarterly Activities', '5. Conclusion'].every(s => rep.indexOf(s) > -1));
ok('the outputs table rendered as a table, not as text',
  (await p.$$eval('#repDoc table th', els => els.length)) === 5,
  String(await p.$$eval('#repDoc table th', els => els.map(e => e.textContent))));

/* Paper, in both themes — a reviewer is looking at what will be sent, not at the
   app's dark mode. */
const paper = await p.$eval('#repDoc', e => getComputedStyle(e).backgroundColor);
ok('the document is white paper regardless of the app theme',
  /rgb\(255,\s*255,\s*255\)/.test(paper), paper);

ok('there are three ways to get it out of the app',
  !!(await p.$('#repCopy')) && !!(await p.$('#repDownload')) && !!(await p.$('#repPrint')));
ok('the sheet says it is a draft and says it is English on purpose',
  /draft, in English/i.test(await p.$eval('.repNote', e => e.textContent)));

/* Escape closes it — the same key that closes the drill-down. */
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
ok('Escape closes the report', !(await p.$('.repSheet')));
ok('and gives the page its scrolling back',
  (await p.evaluate(() => document.body.style.overflow)) === '');

await p.click('#genReportBtn');
await p.waitForSelector('.repSheet', { timeout: 5000 });
await p.click('#repClose');
await p.waitForTimeout(300);
ok('and so does the close button', !(await p.$('.repSheet')));

/* The sheet is modal on purpose: the document covers the screen, so nothing
   behind it can be tapped by accident while somebody is reading a report they are
   about to send to a ministry. */
await p.click('#genReportBtn');
await p.waitForSelector('.repSheet', { timeout: 5000 });
const navBlocked = await p.evaluate(() => {
  const tab = document.querySelector('[data-view="dashboard"]');
  const r = tab.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !tab.contains(hit);
});
ok('the sheet is modal — the tabs behind it cannot be tapped', navBlocked);

/* And should it ever be shown some other way, a render on another view takes it
   down rather than leaving it hanging over the dashboard. */
await p.evaluate(() => { state.view = 'dashboard'; render(); });
await p.waitForTimeout(300);
ok('a render on another view closes the report', !(await p.$('.repSheet')));
ok('and the page scrolls again afterwards',
  (await p.evaluate(() => document.body.style.overflow)) === '');
await p.click('[data-view="programs"]');
await p.waitForTimeout(400);

ok('no console errors from generating a report', p.__errs.length === 0, p.__errs.join(' | ') || 'clean');
await p.close();

/* ---------- 10. a guest gets the gate, not an empty report ---------- */
store = makeStore();
p = await mk(store, { guest:true });
await p.click('[data-view="programs"]');
await p.waitForTimeout(600);
const gate = await p.$('.gate');
ok('a guest sees the account gate', !!gate);
ok('and no request was made on their behalf',
  store.calls.filter(c => c.fn === 'getPrograms').length === 0,
  String(store.calls.filter(c => c.fn === 'getPrograms').length));
const lock = await p.$('[data-view="programs"] .navLock');
ok('the tab shows a padlock rather than vanishing', !!lock);
await p.close();

/* ---------- 11. four tabs still fit the smallest phone ---------- */
for (const w of [320, 360, 390]) {
  const q = await mk(makeStore(), { width: w });
  const info = await q.$$eval('#nav button', bs => bs.map(x => ({
    h: Math.round(x.getBoundingClientRect().height), w: Math.round(x.getBoundingClientRect().width),
  })));
  const heights = [...new Set(info.map(i => i.h))];
  const overflow = await q.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok('nav does not wrap or overflow at ' + w + 'px', heights.length === 1 && !overflow,
    'heights ' + heights.join('/') + ' widths ' + info.map(i => i.w).join(',') + ' overflow ' + overflow);
  await q.close();
}

await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
