/* Campus Leadership on My Ministry, in the browser — phone and desktop.

   No weekly numbers: the section opens on its OKRs as the dashboard
   (progress, objectives, key results, how many meeting cards each has done),
   and the Monday meeting board — standing agenda items, columns, focus
   areas, cards with an owner, due date and the OKR they serve, moved with
   arrows (or dragged on a computer), added and edited, and the board itself
   edited: columns renamed and added, focus areas, standing items. Every name
   is made up. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const NOW = testNow('2026-10-07');   // week 41: Q4
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4490, r));
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], ministries: [], staffType: 'campus', role: '' };
const DEE = { ...base, id: 'st_d', name: 'Dee Director', username: 'dee', dept: 'Campus Leadership', ministry: 'Campus Director' };
const OLI = { ...base, id: 'st_o', name: 'Oli Overseer', username: 'oli', dept: 'Campus Leadership', ministry: 'Community Service' };
const OKRS = [
  { id: 'o1', campus: 'siemreap', quarter: 4, dept: 'Campus Leadership', objective: 'Healthy finances', krs: [{ text: 'Budget approved', metricKey: '', target: 0, manual: 50, group: '', kind: '', current: 0 }, { text: 'Donors met', metricKey: '', target: 10, manual: 0, group: '', kind: 'count', current: 5 }] },
  { id: 'o2', campus: 'siemreap', quarter: 4, dept: 'Campus Leadership', objective: 'Construction started', krs: [{ text: 'Permit', metricKey: '', target: 0, manual: 0, group: '', kind: '', current: 0 }] },
  { id: 'o3', campus: 'siemreap', quarter: 4, dept: 'Community Service', objective: 'Not leadership', krs: [] },
];
const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who, viewport) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 390, height: 900 } });
  await pinClock(ctx, NOW);
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  const board = { cols: [{ id: 'agenda', title: 'Agenda', done: false }, { id: 'doing', title: 'In progress', done: false }, { id: 'done', title: 'Done', done: true }],
    areas: [{ id: 'finances', title: 'Siem Reap finances' }, { id: 'ministries', title: 'Siem Reap ministries' }, { id: 'construction', title: 'Construction' }],
    standing: [{ id: 'updates', title: 'Department and ministry updates' }, { id: 'events', title: 'Events coming up' }],
    cards: [
      { id: 'c1', title: 'Budget draft', type: 'project', col: 'doing', area: 'finances', owner: 'st_o', due: '2026-10-01', okrId: 'o1', notes: '',
        tasks: [{ id: 't1', text: 'Get last year’s numbers', done: true, owner: '', due: '' }, { id: 't2', text: 'Meet the treasurer', done: false, owner: 'st_d', due: '2026-10-09' }] },
      { id: 'c2', title: 'Donor list', type: 'project', col: 'done', area: 'finances', owner: 'st_d', due: '', okrId: 'o1', notes: '', doneAt: '2026-10-05T01:00:00Z' },
      { id: 'c3', title: 'Christmas outreach', type: 'agenda', col: 'agenda', area: 'ministries', owner: '', due: '', okrId: '', notes: '' },
    ], notes: [{ date: '2026-09-28', text: 'Older notes', updated: '2026-09-28T03:00:00Z', updatedBy: 'st_o' }] };
  let n = 0;
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    const bo = () => ({ ok: true, campus: 'siemreap', ...JSON.parse(JSON.stringify(board)) });
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [DEE, OLI], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
      ministry: { ok: true, campus: 'siemreap', dept: who.dept, ministry: who.ministry, entries: {}, daily: {}, prev: {}, pins: [] }, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {} }, tripRequests: [], base: { leader: false, entries: { siemreap: {} }, okrs: OKRS, survey: [], metricOverrides: [] } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: OKRS, survey: [] };
    else if (b.fn === 'getLeadBoard') out = bo();
    else if (b.fn === 'saveLeadCard') { const c = { ...b.args[2] }; if (!c.id) c.id = 'new' + (++n); const i = board.cards.findIndex(x => x.id === c.id); if (i > -1) board.cards[i] = c; else board.cards.push(c); out = { ...bo(), saved: c }; }
    else if (b.fn === 'saveLeadTask') { const c = board.cards.find(x => x.id === b.args[2]); c.tasks = c.tasks || []; const tk = { ...b.args[3] }; if (!tk.id) { tk.id = 'nt' + (++n); c.tasks.push(tk); } else c.tasks[c.tasks.findIndex(x => x.id === tk.id)] = tk; out = { ...bo(), saved: tk, card: c.id }; }
    else if (b.fn === 'deleteLeadTask') { const c = board.cards.find(x => x.id === b.args[2]); c.tasks = c.tasks.filter(x => x.id !== b.args[3]); out = bo(); }
    else if (b.fn === 'saveLeadNote') { const nt = b.args[2], prev = board.notes.find(x => x.date === nt.date);
      if (prev && prev.updated !== nt.since && prev.updatedBy !== who.id) out = { ...bo(), ok: false, err: 'changed', latest: prev };
      else { const rec = { date: nt.date, text: nt.text, updated: '2026-10-07T0' + (++n % 10) + ':00:00Z', updatedBy: who.id }; board.notes = board.notes.filter(x => x.date !== nt.date).concat([rec]); out = { ...bo(), saved: rec }; } }
    else if (b.fn === 'deleteLeadCard') { board.cards = board.cards.filter(x => x.id !== b.args[2]); out = bo(); }
    else if (b.fn === 'saveLeadSettings') { const st = b.args[2]; board.cols = st.cols.map((c, i) => ({ ...c, id: c.id || 'col' + i })); board.areas = st.areas.map((a, i) => ({ ...a, id: a.id || 'ar' + i })); board.standing = st.standing.filter(x => x.title).map((a, i) => ({ ...a, id: a.id || 'st' + i })); out = bo(); }
    else if (b.fn === 'getMinistryFor') out = { ok: true, entries: {}, daily: {}, prev: {}, pins: [] };
    else if (b.fn === 'getMySchedules') out = { ok: true, now: {}, next: {}, canEdit: {} };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4490/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.click('#dashToMinistry'); await page.waitForTimeout(700);
  return { ctx, page, errors, sent, board };
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

console.log('=== the OKRs are the dashboard ===');
const { ctx, page, errors, sent, board } = await open(DEE);
ok('My Ministry opens on Campus Leadership', /Campus Leadership/.test(await page.$eval('#mmBanner', e => e.textContent)) && !!(await page.$('#leadOkrs')));
ok('no weekly numbers: no week strip, no number boxes', !(await page.$('#mmWeekCard')) && !(await page.$('#kpiInputBtn')) && !(await page.$('.wkStrip')));
const tiles = await page.$$eval('.leadTiles .mmTileNum', t => t.map(x => x.textContent));
ok('the tiles: quarter progress, objectives, key results on pace, open cards', tiles[0] === '25%' && tiles[1] === '2' && tiles[3] === '2', tiles.join());
ok('only Campus Leadership’s objectives, with their progress', (await page.$$('[data-leadobj]')).length === 2 && /50%/.test(await page.$eval('[data-leadobj="o1"]', e => e.textContent)));
ok('an objective says how many of its meeting cards are done', /1 of 2 meeting cards done/.test(await page.$eval('[data-leadobj="o1"]', e => e.textContent)));
await page.click('#leadGoOkr'); await page.waitForTimeout(300);
ok('“Update progress” goes to the OKRs tab', await page.$eval('[data-mmtab="okr"]', b => b.classList.contains('on')));
await page.click('[data-mmtab="ministry"]'); await page.waitForTimeout(300);

console.log('=== the Monday meeting board ===');
await page.click('[data-leadtab="board"]'); await page.waitForTimeout(300);
ok('the standing agenda items for every Monday', /Department and ministry updates/.test(await page.$eval('#leadStanding', e => e.textContent)) && /Events coming up/.test(await page.$eval('#leadStanding', e => e.textContent)));
ok('the next meeting is Monday Oct 12', /Next meeting: Monday Oct 12/.test(await page.$eval('.leadHead', e => e.textContent)));
const cols = await page.$$eval('[data-leadcol]', c => c.map(x => x.getAttribute('data-leadcol') + ':' + x.querySelectorAll('[data-leadcard]').length));
ok('three columns with their cards', cols.join() === 'agenda:1,doing:1,done:1', cols.join());
const tabs = await page.$$eval('[data-leadcoltab]', b => b.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
ok('on a phone: tabs for the columns with their counts, one column showing — no sideways scrolling', tabs.length === 3 && /Agenda 1/.test(tabs[0]) && (await page.$$eval('[data-leadcol]', c => c.filter(x => getComputedStyle(x).display !== 'none').length)) === 1, tabs.join(' | '));
await page.click('[data-leadcoltab="doing"]'); await page.waitForTimeout(200);
ok('a tab shows its column', await page.$eval('[data-leadcol="doing"]', c => getComputedStyle(c).display !== 'none') && await page.$eval('[data-leadcol="agenda"]', c => getComputedStyle(c).display === 'none'));
ok('a card shows its focus area, owner, late due date and its OKR’s progress', await page.$eval('[data-leadcard="c1"]', e => /Siem Reap finances/.test(e.textContent) && /Oli Overseer/.test(e.textContent) && !!e.querySelector('.leadDue.late') && /Healthy finances · 50%/.test(e.textContent)));
const rows = await page.$$eval('.leadFilterRow', r => r.map(x => x.querySelector('.leadFilterLabel').textContent + ': ' + [].map.call(x.querySelectorAll('.hospChip'), c => c.textContent.replace(/^[^A-Za-z]+/, '')).join(' / ')));
ok('one labelled filter row — what to show; no focus-area row', rows.length === 1 && rows[0] === 'Show: All / Agenda items / Projects / Mine' && !(await page.$('[data-leadarea]')), rows.join(' || '));
ok('Edit the board sits with Add a card, not among the filters', !!(await page.$('.leadHead #leadEditBoard')) && !(await page.$('.leadFilters #leadEditBoard')));
await page.click('[data-leadfilter="project"]'); await page.waitForTimeout(150);
ok('Projects shows only projects', (await page.$$eval('[data-leadcard]', c => c.map(x => x.getAttribute('data-leadcard')).sort().join())) === 'c1,c2');
await page.click('[data-leadfilter="mine"]'); await page.waitForTimeout(150);
ok('Mine: cards I own, and cards where I have an open task', (await page.$$eval('[data-leadcard]', c => c.map(x => x.getAttribute('data-leadcard')).sort().join())) === 'c1,c2');
await page.click('[data-leadfilter="all"]'); await page.waitForTimeout(150);

console.log('=== tasks inside a card ===');
ok('a card says how many of its tasks are done, with a bar', /1 of 2 tasks/.test(await page.$eval('[data-leadcard="c1"] [data-ltoggle]', e => e.textContent)) && !!(await page.$('[data-leadcard="c1"] .leadBar.sm')));
ok('a card with none offers to add tasks', /^＋ Tasks/.test((await page.$eval('[data-leadcard="c3"] [data-ltoggle]', e => e.textContent)).trim()));
await page.click('[data-leadcard="c1"] [data-ltoggle]'); await page.waitForTimeout(200);
const trows = await page.$$eval('[data-leadcard="c1"] .leadTask', r => r.map(x => (x.classList.contains('done') ? '[x] ' : '[ ] ') + x.textContent.replace(/\s+/g, ' ').trim()));
ok('opened, it lists the tasks — done ones struck through, with owner and due date', trows.length === 2 && /^\[x\] Get last year’s numbers/.test(trows[0]) && /^\[ \] Meet the treasurer ?👤 Dee · 📅 Oct 9/.test(trows[1]), trows.join(' | '));
await page.click('[data-ltick="c1|t2"]'); await page.waitForTimeout(300);
let tsv = sent.filter(b => b.fn === 'saveLeadTask').pop();
ok('ticking a task saves just that task', tsv && tsv.args[2] === 'c1' && tsv.args[3].id === 't2' && tsv.args[3].done === true && /2 of 2 tasks/.test(await page.$eval('[data-leadcard="c1"] [data-ltoggle]', e => e.textContent)));
await page.fill('[data-ltnew="c1"]', 'Send the budget to the board'); await page.press('[data-ltnew="c1"]', 'Enter'); await page.waitForTimeout(300);
tsv = sent.filter(b => b.fn === 'saveLeadTask').pop();
ok('a task can be added right on the card (Enter)', tsv.args[2] === 'c1' && tsv.args[3].text === 'Send the budget to the board' && !tsv.args[3].id && (await page.$$('[data-leadcard="c1"] .leadTask')).length === 3);
await page.click('[data-leadedit="c1"]'); await page.waitForTimeout(200);
ok('the edit form lists the tasks with owner and due date', (await page.$$('#leadFormTasks .leadTask')).length === 3 && !!(await page.$('#leadFormTasks [data-ltowner="c1|t1"]')));
await page.selectOption('[data-ltowner="c1|t1"]', 'st_o'); await page.waitForTimeout(300);
tsv = sent.filter(b => b.fn === 'saveLeadTask').pop();
ok('giving a task an owner saves it at once', tsv.args[3].id === 't1' && tsv.args[3].owner === 'st_o');
await page.click('[data-ltdel="c1|t1"]'); await page.waitForTimeout(300);
const tdl = sent.filter(b => b.fn === 'deleteLeadTask').pop();
ok('a task can be taken away', tdl && tdl.args[2] === 'c1' && tdl.args[3] === 't1' && (await page.$$('#leadFormTasks .leadTask')).length === 2);
await page.click('#leadCancel'); await page.waitForTimeout(150);
await page.click('[data-leadcoltab="agenda"]'); await page.waitForTimeout(150);
await page.click('#leadNew'); await page.waitForTimeout(200);
ok('a new card starts as an agenda item', await page.$eval('[data-lftype].on', b => b.getAttribute('data-lftype')) === 'agenda');
await page.click('[data-lftype="project"]'); await page.waitForTimeout(100);
await page.fill('[data-ltnew=""]', 'Get two quotes'); await page.click('[data-ltadd=""]'); await page.waitForTimeout(150);
await page.fill('[data-ltnew=""]', 'Check the permit'); await page.press('[data-ltnew=""]', 'Enter'); await page.waitForTimeout(150);
ok('a new card can be given tasks before it is added', (await page.$$('#leadFormTasks .leadTask')).length === 2 && sent.filter(b => b.fn === 'saveLeadTask').length === 3);
await page.selectOption('[data-lf="area"]', 'construction');
await page.fill('[data-lf="title"]', 'Roof quote');
await page.selectOption('[data-lf="owner"]', 'st_d');
await page.selectOption('[data-lf="okrId"]', 'o2');
await page.click('#leadSave'); await page.waitForTimeout(300);
let sv = sent.filter(b => b.fn === 'saveLeadCard').pop();
ok('the card is saved with its focus area, owner, OKR and tasks', sv && sv.args[2].title === 'Roof quote' && sv.args[2].area === 'construction' && sv.args[2].owner === 'st_d' && sv.args[2].okrId === 'o2' && sv.args[2].col === 'agenda' && sv.args[2].tasks.map(x => x.text).join() === 'Get two quotes,Check the permit', JSON.stringify(sv && sv.args[2]));
await page.click('[data-leadmove="c3|doing"]'); await page.waitForTimeout(300);
sv = sent.filter(b => b.fn === 'saveLeadCard').pop();
ok('the arrow moves a card to the next column, and says so', sv.args[2].id === 'c3' && sv.args[2].col === 'doing' && /Moved to In progress/.test(await page.$eval('#msg', e => e.textContent)));
await page.click('[data-leadcoltab="doing"]'); await page.waitForTimeout(200);
await page.click('[data-leadedit="c3"]'); await page.waitForTimeout(200);
await page.fill('[data-lf="notes"]', 'Ask the churches'); await page.click('#leadSave'); await page.waitForTimeout(300);
ok('tapping a card edits it', sent.filter(b => b.fn === 'saveLeadCard').pop().args[2].notes === 'Ask the churches');
ok('no sideways page scroll on a phone (the columns scroll in their own row)', !(await overflow(page)));

console.log('=== meeting notes ===');
await page.click('[data-leadtab="notes"]'); await page.waitForTimeout(300);
ok('a Meeting notes tab opens on this week’s Monday', /Monday Oct 5/.test(await page.$eval('.leadNoteDate', e => e.textContent)) && /This week’s meeting/.test(await page.$eval('.leadNoteDate', e => e.textContent)));
ok('earlier weeks with notes are a tap away', !!(await page.$('[data-lndate="2026-09-28"]')));
const okrLine = await page.$eval('#leadNoteOkr summary', e => e.textContent.replace(/\s+/g, ' ').trim());
ok('the OKRs sit in one quiet line above the notes, closed', /^🎯 Q4 OKRs · 25% · 2 of 3 key results on pace/.test(okrLine) && !(await page.$eval('#leadNoteOkr', d => d.open)) && !(await page.isVisible('.leadNoteOkrRow')), okrLine);
await page.click('#leadNoteOkr summary'); await page.waitForTimeout(150);
const okrRows = await page.$$eval('.leadNoteOkrRow', r => r.map(x => x.textContent.trim()));
ok('tapped, each Leadership objective with its progress (not other departments’)', okrRows.length === 2 && /^Healthy finances.*50%$/.test(okrRows[0]) && /^Construction started/.test(okrRows[1]), okrRows.join(' | '));
await page.click('#leadNoteStart'); await page.waitForTimeout(200);
const started = await page.$eval('#leadNoteText', e => e.value);
ok('“Start from the agenda” lays out the standing items and the agenda items waiting (not projects)', started === 'Department and ministry updates\n- \nEvents coming up\n- ', JSON.stringify(started));
await page.fill('#leadNoteText', 'Department and ministry updates\n- Cafe needs a new fridge\n- Plan the staff retreat\nEvents coming up\n- Meet the treasurer');
await page.waitForTimeout(500);
const lines = await page.$$eval('.leadLine', l => l.map(x => x.querySelector('.leadLineText').textContent + (x.querySelector('.leadLineDone') ? ' ✓' : '')));
ok('each line can go on the board — standing headings are skipped, and a line already a task says so', lines.join(' | ') === 'Cafe needs a new fridge | Plan the staff retreat | Meet the treasurer ✓', lines.join(' | '));
await page.click('[data-lnmake="agenda|0"]'); await page.waitForTimeout(400);
const nsv = sent.filter(b => b.fn === 'saveLeadNote').pop(); sv = sent.filter(b => b.fn === 'saveLeadCard').pop();
ok('turning a line into an agenda item saves the notes first, then adds the card from this meeting', nsv && nsv.args[2].date === '2026-10-05' && /Cafe needs a new fridge/.test(nsv.args[2].text) && sv.args[2].title === 'Cafe needs a new fridge' && sv.args[2].type === 'agenda' && sv.args[2].meeting === '2026-10-05' && sv.args[2].fromNotes === true);
ok('… and the line shows it is on the board', /On the board — /.test(await page.$eval('[data-lnline="0"]', e => e.textContent)));
await page.click('[data-lntask="1"]'); await page.waitForTimeout(200);
await page.selectOption('#leadLnCard', 'c3'); await page.click('[data-lntaskgo="1"]'); await page.waitForTimeout(400);
let tsv2 = sent.filter(b => b.fn === 'saveLeadTask').pop();
ok('a line can become a task on a card, tied to this meeting', tsv2.args[2] === 'c3' && tsv2.args[3].text === 'Plan the staff retreat' && tsv2.args[3].meeting === '2026-10-05' && /Task on “Christmas outreach”/.test(await page.$eval('[data-lnline="1"]', e => e.textContent)));
ok('“From this meeting” lists what came out of it', /Cafe needs a new fridge/.test(await page.$eval('#leadNotes', e => e.textContent)) && /Plan the staff retreat — Christmas outreach/.test(await page.$eval('#leadNotes', e => e.textContent)));
await page.click('[data-lnweek="-7"]'); await page.waitForTimeout(200);
ok('‹ goes back a week to its notes', /Monday Sep 28/.test(await page.$eval('.leadNoteDate', e => e.textContent)) && await page.$eval('#leadNoteText', e => e.value) === 'Older notes');
board.notes.find(x => x.date === '2026-09-28').updatedBy = 'st_o';
board.notes.find(x => x.date === '2026-09-28').text = 'Oli changed this'; board.notes.find(x => x.date === '2026-09-28').updated = '2026-10-07T09:59:00Z';
await page.fill('#leadNoteText', 'My edit'); await page.click('#leadNoteSave'); await page.waitForTimeout(400);
ok('if someone else saved those notes meanwhile, both versions are kept in the box to check', /Oli changed this[\s\S]*your notes[\s\S]*My edit/.test(await page.$eval('#leadNoteText', e => e.value)) && /saved these notes too/.test(await page.$eval('#msg', e => e.textContent)));
await page.click('#leadNoteSave'); await page.waitForTimeout(400);
ok('… then it saves', board.notes.find(x => x.date === '2026-09-28').updatedBy === 'st_d');
ok('no sideways page scroll on the notes', !(await overflow(page)));
await page.click('[data-leadtab="board"]'); await page.waitForTimeout(300);

console.log('=== editing the board ===');
await page.click('#leadEditBoard'); await page.waitForTimeout(200);
await page.fill('[data-lset="cols|0"]', 'This Monday');
await page.click('[data-lsetadd="cols"]'); await page.waitForTimeout(150);
await page.fill('[data-lset="cols|3"]', 'Parked');
await page.click('[data-lsetadd="areas"]'); await page.waitForTimeout(150);
await page.fill('[data-lset="areas|3"]', '2027 planning');
await page.click('[data-lsetadd="standing"]'); await page.waitForTimeout(150);
await page.fill('[data-lset="standing|2"]', 'Prayer');
await page.click('#leadSetSave'); await page.waitForTimeout(300);
const st = sent.filter(b => b.fn === 'saveLeadSettings').pop();
ok('renamed and added columns, a new focus area and a standing item are saved', st && st.args[2].cols.map(c => c.title).join() === 'This Monday,In progress,Done,Parked' && st.args[2].cols[2].done && st.args[2].areas.some(a => a.title === '2027 planning') && st.args[2].standing.some(a => a.title === 'Prayer'), JSON.stringify(st && st.args[2].cols));
ok('the board shows them', (await page.$$('[data-leadcol]')).length === 4 && /This Monday/.test(await page.$eval('[data-leadcoltab="agenda"]', e => e.textContent)) && /Prayer/.test(await page.$eval('#leadStanding', e => e.textContent)));
ok('no errors (phone)', errors.length === 0, errors.join(' | '));
await ctx.close();

console.log('=== desktop ===');
{
  const { ctx, page, errors } = await open(OLI, { width: 1280, height: 900 });
  ok('an overseer also opens on Campus Leadership', !!(await page.$('#leadOkrs')));
  await page.click('[data-leadtab="board"]'); await page.waitForTimeout(300);
  ok('desktop: the column tabs aren’t shown', await page.$eval('.leadColTabs', e => getComputedStyle(e).display === 'none'));
  ok('desktop: wide, the columns side by side', await page.$eval('main', m => m.classList.contains('wide')) && await page.$eval('.leadCols', g => getComputedStyle(g).gridTemplateColumns.split(' ').length === 3) && !(await overflow(page)));
  await page.dragAndDrop('[data-leadcard="c3"]', '[data-leadcol="done"]'); await page.waitForTimeout(300);
  ok('desktop: a card can be dragged to another column', /Christmas outreach/.test(await page.$eval('[data-leadcol="done"]', e => e.textContent)));
  await page.click('[data-leadtab="notes"]'); await page.waitForTimeout(300);
  ok('desktop: notes and “Put it on the board” side by side', await page.$eval('.leadNoteGrid', g => getComputedStyle(g).gridTemplateColumns.split(' ').length === 2) && !(await overflow(page)));
  ok('no errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
