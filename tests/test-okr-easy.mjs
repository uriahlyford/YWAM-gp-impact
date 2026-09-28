/* The OKR page, laid out the SugarOKR way: every objective on the page at
   once, its key results showing (under headings like Money / Time), one
   control per key result — a slider, a − / + count, or nothing for one fed by
   a ministry number — and a Paste box that turns OKRs already written down
   into objectives. Pinned to 12 Aug 2026 (week 33, Q3). Everything here is
   made up. */
import { PUBLIC, CHROMIUM, tmpDir } from './env.mjs';
import { testNow, pinClock } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';

const NOW = testNow('2026-08-12');
const OUT = tmpDir('out') + '/';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise(r => srv.listen(4438, r));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); } };

const ME = { id: 'st_me', name: 'Vanna Test', username: 'vanna', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', photo: '', mentorId: '' };
const BASE = { leader: false, entries: { siemreap: { 'Community Service|Cafe|Cups Sold': { 30: 120, 31: 80 } } }, okrs: [], survey: [], roster: [ME] };
const saves = [];
/* saveObjective the way the server answers it: the objective replaced by id,
   key-result fields kept as the server keeps them. */
function saveObjective(obj) {
  saves.push(obj);
  const at = BASE.okrs.findIndex(o => o.id === obj.id);
  BASE.okrs = BASE.okrs.filter(o => o.id !== obj.id);
  BASE.okrs.splice(at < 0 ? BASE.okrs.length : at, 0, { id: obj.id, campus: obj.campus, quarter: obj.quarter, dept: obj.dept, objective: obj.objective,
    krs: obj.krs.slice(0, 10).filter(k => k.text).map(k => ({ text: k.text, metricKey: k.metricKey || '', target: Number(k.target) || 0,
      manual: Number(k.manual) || 0, group: k.group || '', kind: k.kind === 'count' ? 'count' : '', current: Number(k.current) || 0 })) });
  return BASE;
}

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
await pinClock(p, NOW);
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('dialog', d => d.accept(d.type() === 'prompt' ? '7' : undefined));
await p.route('**fonts.g**', r => r.abort());
await p.route('**/.netlify/functions/api', r => { const q = JSON.parse(r.request().postData() || '{}'); let o = { ok: true };
  if (q.fn === 'getMyBoot') o = { ok: true, staff: ME, profile: {}, roster: [ME], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, reasons: { work: ['x'], personal: ['y'] }, hasMentor: false }, tripRequests: [], ministry: null, base: BASE };
  else if (q.fn === 'getData') o = BASE;
  else if (q.fn === 'saveObjective') o = saveObjective(q.args[0]);
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) }); });
await p.addInitScript(() => { localStorage.setItem('gp-staff', JSON.stringify({ user: 'vanna', pin: '1234' })); });
await p.goto('http://localhost:4438/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.evaluate(() => { S.view = 'ministry'; S.mmTab = 'okr'; render(); });
await p.waitForTimeout(300);

/* ---------- 1. paste ---------- */
ok('the OKR page offers New objective and Paste OKRs', !!(await p.$('#okrNewBtn')) && !!(await p.$('#okrPasteBtn')));
await p.click('#okrPasteBtn');
const PASTE = `Objective 1: Keep the base running well

Money
• Set up a monthly budget review
• Write a budget for each ministry

Time
• Serve lunch on time every day

Objective 2: Grow the next leaders
• Recruit 12 students for the spring school
- Train two new small-group leaders

Objective 3 - Build partnerships
1. Host three visiting teams`;
await p.fill('#okrPasteText', PASTE);
await p.click('#okrPastePreview');
await p.waitForTimeout(200);
const prev = await p.$eval('#okrPasteCard', e => e.innerText);
ok('the preview shows every objective', /Keep the base running well/.test(prev) && /Grow the next leaders/.test(prev) && /Build partnerships/.test(prev), prev);
ok('headings come through (Money, Time)', /MONEY/i.test(prev) && /TIME/i.test(prev));
ok('bullets, dashes and numbers all count as key results', /Train two new small-group leaders/.test(prev) && /Host three visiting teams/.test(prev));
ok('the save button says how many and which quarter', /Add 3 objectives to Q3/.test(await p.$eval('#okrPasteSave', e => e.textContent)));
await p.click('#okrPasteBack');
ok('Back returns to the text as it was', (await p.$eval('#okrPasteText', e => e.value)) === PASTE);
await p.click('#okrPastePreview');
await p.click('#okrPasteSave');
await p.waitForTimeout(800);
ok('saving sends one objective at a time, three in all', saves.length === 3, saves.length);
ok('each lands on my campus and department, this quarter', saves.every(s => s.campus === 'siemreap' && s.dept === 'Campus Leadership' && s.quarter === 3), JSON.stringify(saves.map(s => [s.campus, s.dept, s.quarter])));
ok('key results keep their heading', saves[0].krs.map(k => k.group).join(',') === 'Money,Money,Time', saves[0].krs.map(k => k.group).join(','));
ok('ids are distinct', new Set(saves.map(s => s.id)).size === 3);

/* ---------- 2. the page: everything at once ---------- */
const cards = await p.$$eval('.okrCard', e => e.length);
ok('all three objectives show at once, no pager', cards === 3 && !(await p.$('#okrNext')), cards);
ok('they are numbered', (await p.$$eval('.okrCard .okrNum', e => e.map(x => x.textContent).join(','))) === '1,2,3');
ok('key results show without a Show button', (await p.$$eval('.kr', e => e.length)) === 6 && !(await p.$('[data-kr-toggle]')));
ok('headings show over their key results', (await p.$$eval('.okrCard:first-child .krGroup', e => e.map(x => x.textContent).join(','))).replace(/\s/g, '') !== '' || (await p.$$eval('.krGroup', e => e.map(x => x.textContent).join(','))) === 'Money,Time');
ok('the quarter summary is on top', /Week 7 of 13/.test(await p.$eval('.okrSum', e => e.textContent)), await p.$eval('.okrSum', e => e.textContent).catch(() => 'none'));
await p.screenshot({ path: OUT + 'okr-new-page.png', fullPage: true }).catch(() => {});

/* ---------- 3. the slider ---------- */
const s0 = saves.length;
await p.$eval('[data-okr-manual]', el => { el.value = '60'; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); });
await p.waitForTimeout(500);
const sv = saves[saves.length - 1];
ok('sliding a key result saves it', saves.length === s0 + 1 && sv.krs[0].manual === 60, JSON.stringify(sv && sv.krs[0]));
ok('and keeps the other key results and their headings', sv.krs.length === 3 && sv.krs[2].group === 'Time');
ok('the objective moves with it', /20%/.test(await p.$eval('.okrCard .okrPct', e => e.textContent)), await p.$eval('.okrCard .okrPct', e => e.textContent));

/* ---------- 4. the edit form: fewer boxes ---------- */
const id2 = saves[1].id;
await p.click('[data-okr-edit="' + id2 + '"]');
await p.waitForSelector('#okrForm');
ok('Edit opens the form in the objective’s place', (await p.$$eval('#main .okrCard', e => e.findIndex(x => x.id === 'okrForm'))) === 1);
ok('a target box shows only when the measure needs one', await p.$eval('#okrKrTarget0', e => e.hidden));
await p.selectOption('#okrKrMetric0', '__count');
ok('choosing Count shows the target box', !(await p.$eval('#okrKrTarget0', e => e.hidden)));
await p.fill('#okrKrTarget0', '12');
await p.selectOption('#okrKrMetric1', 'Community Service|Cafe|Cups Sold');
await p.fill('#okrKrTarget1', '400');
await p.click('#okrHeadAddBtn');
await p.fill('#okrKrList [data-okr-head]:last-child input', 'Later');
await p.click('#okrKrAddBtn');
const rows = await p.$$eval('#okrKrList [data-okr-kr]', e => e.map(x => x.getAttribute('data-okr-kr')));
await p.fill('#okrKrText' + rows[rows.length - 1], 'A key result under Later');
// remove the third (empty) row
await p.screenshot({ path: OUT + 'okr-form.png', fullPage: true }).catch(() => {});
await p.click('#okrKrList [data-okr-kr="2"] [data-okr-rm]');
ok('✕ removes a row', !(await p.$('#okrKrText2')));
await p.click('#okrSaveBtn');
await p.waitForTimeout(500);
const ev = saves[saves.length - 1];
ok('the form saves a count, a ministry number and a heading', ev.id === id2 && ev.krs[0].kind === 'count' && ev.krs[0].target === 12 &&
  ev.krs[1].metricKey === 'Community Service|Cafe|Cups Sold' && ev.krs[1].kind === '' && ev.krs[2].group === 'Later' && ev.krs[2].text === 'A key result under Later', JSON.stringify(ev.krs));

/* ---------- 5. counting ---------- */
const plus = '[data-okr-step="' + id2 + '|0|1"]';
await p.click(plus); await p.click(plus); await p.click(plus);
ok('+ counts up on the page straight away', (await p.$eval('[data-okr-count="' + id2 + '|0"]', e => e.textContent)) === '3');
await p.waitForTimeout(1300);
const cv = saves[saves.length - 1];
ok('three taps are one save', cv.krs[0].current === 3 && saves.length === 5 + 1, saves.length + ' ' + JSON.stringify(cv.krs[0]));
await p.click('[data-okr-count="' + id2 + '|0"]');   // prompt answers 7
await p.waitForTimeout(1300);
ok('tapping the number lets you type it', saves[saves.length - 1].krs[0].current === 7, JSON.stringify(saves[saves.length - 1].krs[0]));
const card2 = await p.$eval('[data-okr-edit="' + id2 + '"]', e => e.closest('.okrCard').innerText);
ok('the count reads 7 / 12', /7\s*\/\s*12/.test(card2), card2);
ok('the ministry number fills in from what was logged (200 / 400)', /200\s*\/\s*400/.test(card2), card2);
await p.screenshot({ path: OUT + 'okr-new-page2.png', fullPage: true }).catch(() => {});

/* ---------- 6. re-saving keeps progress ---------- */
await p.click('[data-okr-edit="' + id2 + '"]');
await p.waitForSelector('#okrForm');
await p.fill('#okrObjText', 'Grow the next leaders (renamed)');
await p.click('#okrSaveBtn');
await p.waitForTimeout(500);
ok('editing the objective keeps the count', saves[saves.length - 1].krs[0].current === 7, JSON.stringify(saves[saves.length - 1].krs[0]));

/* ---------- 7. the parser on its own ---------- */
const parsed = await p.evaluate(() => okrParsePaste_('Objective 1:\nA title on the next line\n• one\n\nGoal: No key results here\n\nObjective 3: Too many\n' + Array.from({ length: 12 }, (_, i) => '• kr ' + i).join('\n')));
ok('“Objective 1:” on its own line takes the title from the next line', parsed.objectives[0].objective === 'A title on the next line' && parsed.objectives[0].krs.length === 1, JSON.stringify(parsed.objectives[0]));
ok('an objective with no key results is flagged', parsed.notes.some(n => /Objective 2 has no key results/.test(n)), parsed.notes.join(' | '));
ok('more than ten key results is cut to ten, and says so', parsed.objectives[2].krs.length === 10 && parsed.notes.some(n => /only the first 10/.test(n)), parsed.notes.join(' | '));

ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
