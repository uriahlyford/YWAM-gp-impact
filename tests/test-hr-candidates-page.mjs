/* HR → Candidates in the browser, and the HR reminders in the bell.

   Drives the real page as an admin: the bell carries "contracts due" and
   "follow-ups due" reminders that open HR; the Candidates tab shows tiles,
   follow-ups due first, type/stage chips and search; Add a candidate posts
   the record; a candidate's page moves stages, saves a next step, adds a
   note, and archives. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4488, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], active: true };
const ME = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true };
const SINA = { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service' };
let cands = [
  { id: 'cd1', campus: 'siemreap', name: 'Anna Berg', type: 'volunteer', stage: 'contacted', subtype: 'International', school: '', email: 'anna@x.org', phone: '+46 70 123', country: 'Sweden', source: 'DTS friend', assignedTo: 'st_sina', nextStep: 'Video call', nextDate: day(-2), expected: '2027-01', notes: 'Keen on the Cafe', staffId: '', log: [{ at: day(-9) + 'T10:00:00Z', by: 'st_admin', kind: 'note', text: 'First email' }], archived: null },
  { id: 'cd2', campus: 'siemreap', name: 'Ben Ito', type: 'staff', stage: 'applied', subtype: '', school: '', email: 'ben@x.org', phone: '', country: 'Japan', source: '', assignedTo: '', nextStep: 'Interview', nextDate: day(4), expected: '', notes: '', staffId: '', log: [], archived: null },
  { id: 'cd3', campus: 'siemreap', name: 'Chan Dara', type: 'student', stage: 'accepted', subtype: 'Khmer', school: 'DBS', email: '', phone: '', country: 'Cambodia', source: '', assignedTo: '', nextStep: '', nextDate: '', expected: '', notes: '', staffId: '', log: [], archived: null },
  { id: 'cd4', campus: 'siemreap', name: 'Lost One', type: 'volunteer', stage: 'new', email: '', phone: '', country: 'USA', log: [], archived: { at: day(-30), reason: 'No response', by: 'st_admin' } },
];
const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
const errors = [], sent = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
await ctx.route('**/.netlify/functions/api', r => {
  const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
  let out = { ok: true };
  if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: { email: 'u@x.org' }, roster: [ME, SINA], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
    trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: {}, okrs: [], survey: [], metricOverrides: [] }, hrDue: 1, hrFollowUps: 2 };
  else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
  else if (b.fn === 'hrList') out = { ok: true, staff: [] };
  else if (b.fn === 'hrCandidates') out = { ok: true, candidates: cands };
  else if (b.fn === 'hrSaveCandidate') { const c = b.args[2]; const prev = cands.find(x => x.id === c.id); const rec = { ...(prev || { log: [], archived: null, created: 'now' }), ...c, id: c.id || 'cd_new' }; if (prev && prev.stage !== rec.stage) rec.log = rec.log.concat([{ at: new Date().toISOString(), by: 'st_admin', kind: 'stage', text: rec.stage }]); if (prev) cands = cands.map(x => x.id === rec.id ? rec : x); else cands.push(rec); out = { ok: true, candidate: rec }; }
  else if (b.fn === 'hrCandidateNote') { const c = cands.find(x => x.id === b.args[2]); c.log = c.log.concat([{ at: new Date().toISOString(), by: 'st_admin', kind: 'note', text: b.args[3] }]); out = { ok: true, candidate: c }; }
  else if (b.fn === 'hrArchiveCandidate') { const c = cands.find(x => x.id === b.args[2]); c.archived = b.args[3] === null ? null : { at: day(0), reason: b.args[3].reason, by: 'st_admin' }; out = { ok: true, candidate: c }; }
  else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
});
await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await page.goto('http://localhost:4488/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(500);

console.log('=== the menu and the bell ===');
ok('the HR menu item counts contracts due and follow-ups due together', await page.evaluate(() => { S.menuOpen = true; renderMenu(); const l = document.querySelector('[data-menu-item="hr"] .drawerLabel').textContent; S.menuOpen = false; renderMenu(); return /· 3/.test(l); }));
await page.click('#bellBtn');
await page.waitForTimeout(300);
const bell = await page.evaluate(() => ({ text: document.querySelector('#notifRoot').innerText, gohr: document.querySelectorAll('#notifRoot [data-gohr]').length }));
ok('the bell reminds HR about contracts and follow-ups, each with an Open HR button', /1 staff contract is due for renewal/.test(bell.text) && /2 candidate follow-ups are due/.test(bell.text) && bell.gohr === 2, bell.text.replace(/\n/g, ' | '));
await page.click('#notifRoot [data-gohr]');
await page.waitForTimeout(700);
ok('Open HR lands on the HR page', await page.evaluate(() => S.view === 'hr' && /Human Resources/.test(document.querySelector('h2').textContent)));

console.log('\n=== the pipeline ===');
await page.click('[data-hrtab="cands"]');
await page.waitForTimeout(700);
ok('the Candidates tab loads the pipeline once', sent.filter(x => x.fn === 'hrCandidates').length === 1);
const tiles = await page.evaluate(() => [].map.call(document.querySelectorAll('.mmTile'), t => t.querySelector('.mmTileName').textContent.trim() + '=' + t.querySelector('.mmTileNum').textContent.trim()));
ok('tiles: in the pipeline, follow-ups due, accepted or arrived, archived', JSON.stringify(tiles) === JSON.stringify(['In the pipeline=3', 'Follow-ups due=2', 'Accepted or arrived=1', 'Archived=1']), tiles.join(' | '));
const due = await page.evaluate(() => [].map.call(document.querySelectorAll('#candDueList .rowName'), e => e.textContent.trim()));
ok('follow-ups due: the overdue one first, then the one due this week', JSON.stringify(due) === JSON.stringify(['Anna Berg', 'Ben Ito']), due.join(','));
const rows = () => page.evaluate(() => [].filter.call(document.querySelectorAll('#candList [data-candrow]'), r => r.style.display !== 'none').map(r => r.querySelector('.rowName').textContent.trim() + '=' + r.querySelector('.hrChip').textContent.trim()));
ok('the list carries each person’s stage as a chip; archived hidden', JSON.stringify(await rows()) === JSON.stringify(['Anna Berg=Contacted', 'Ben Ito=Applied', 'Chan Dara=Accepted']), (await rows()).join(' | '));
await page.click('[data-candtype="student"]');
await page.waitForTimeout(300);
ok('the type chips filter', JSON.stringify(await rows()) === JSON.stringify(['Chan Dara=Accepted']));
await page.click('[data-candtype=""]');
await page.waitForTimeout(300);
await page.click('[data-candstage="applied"]');
await page.waitForTimeout(300);
ok('so do the stage chips', JSON.stringify(await rows()) === JSON.stringify(['Ben Ito=Applied']));
await page.click('[data-candstage=""]');
await page.waitForTimeout(300);
await page.fill('#candSearch', 'sweden');
await page.waitForTimeout(200);
ok('search covers name, email and country', JSON.stringify(await rows()) === JSON.stringify(['Anna Berg=Contacted']));
await page.fill('#candSearch', '');
await page.click('#candShowArchived');
await page.waitForTimeout(300);
ok('Show archived brings them in, marked', (await rows()).includes('Lost One=Archived'));
ok('nothing scrolls sideways', !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)));

console.log('\n=== adding one ===');
await page.click('#candAdd');
await page.waitForTimeout(300);
await page.click('#candSave');
await page.waitForTimeout(200);
ok('saving with no name is stopped on the page', !sent.some(x => x.fn === 'hrSaveCandidate'));
await page.fill('[data-cf="name"]', ' Mia Novak ');
await page.selectOption('[data-cf="type"]', 'staff');
await page.fill('[data-cf="email"]', 'mia@x.org');
await page.fill('[data-cf="country"]', 'Slovenia');
await page.selectOption('[data-cf="assignedTo"]', 'st_sina');
await page.fill('[data-cf="nextStep"]', 'Send the application');
await page.fill('[data-cf="nextDate"]', day(3));
await page.click('#candSave');
await page.waitForTimeout(600);
const sv = sent.find(x => x.fn === 'hrSaveCandidate');
ok('Add posts the record', sv && sv.args[2].name === ' Mia Novak ' && sv.args[2].type === 'staff' && sv.args[2].assignedTo === 'st_sina' && sv.args[2].nextDate === day(3), sv && JSON.stringify(sv.args[2]));
ok('and lands on the new person’s page', await page.evaluate(() => S.hrSub === 'cand' && /Mia Novak/.test(document.querySelector('.adminPersonHead .pname').textContent)));

console.log('\n=== one candidate ===');
await page.click('#hrBack');
await page.waitForTimeout(400);
await page.fill('#candSearch', '');
await page.waitForTimeout(200);
await page.click('[data-candperson="cd1"]');
await page.waitForTimeout(400);
const person = await page.evaluate(() => ({ name: document.querySelector('.adminPersonHead .pname').textContent.trim(), meta: [].map.call(document.querySelectorAll('.pmeta'), e => e.textContent).join(' | '),
  on: document.querySelector('.candStep.on').textContent.trim(), done: document.querySelectorAll('.candStep.done').length, overdue: /overdue/.test(document.body.innerText), log: document.querySelectorAll('.candLog').length }));
ok('the page: who they are, who walks with them, the stage row with the current one lit', person.name === 'Anna Berg' && /Walking with Sina Sok/.test(person.meta) && person.on === 'Contacted' && person.done === 1, JSON.stringify(person));
ok('the overdue next step is called out, the log shows the note', person.overdue && person.log === 1);
await page.click('[data-candmove="applied"]');
await page.waitForTimeout(600);
const mv = sent.filter(x => x.fn === 'hrSaveCandidate').pop();
ok('tapping a stage posts the whole record with the new stage', mv && mv.args[2].id === 'cd1' && mv.args[2].stage === 'applied' && mv.args[2].email === 'anna@x.org', mv && JSON.stringify([mv.args[2].id, mv.args[2].stage]));
ok('and the move shows in the log', await page.evaluate(() => document.querySelector('.candStep.on').textContent.trim() === 'Applied' && /Moved to Applied/.test(document.body.innerText)));
await page.fill('#cand_next', 'Interview with Sina');
await page.fill('#cand_nextdate', day(6));
await page.click('#candNextSave');
await page.waitForTimeout(600);
const nx = sent.filter(x => x.fn === 'hrSaveCandidate').pop();
ok('Save next step posts what and by when', nx && nx.args[2].nextStep === 'Interview with Sina' && nx.args[2].nextDate === day(6));
await page.fill('#candNote', 'Great call today');
await page.click('#candNoteAdd');
await page.waitForTimeout(600);
ok('a note appends to the log', sent.some(x => x.fn === 'hrCandidateNote' && x.args[3] === 'Great call today') && await page.evaluate(() => /Great call today/.test(document.body.innerText)));
await page.selectOption('#cand_why', 'Withdrew');
await page.fill('#cand_whynote', 'family reasons');
page.once('dialog', d => d.accept());
await page.click('#candArchive');
await page.waitForTimeout(600);
const ar = sent.find(x => x.fn === 'hrArchiveCandidate');
ok('Archive asks, then posts the reason', ar && ar.args[2] === 'cd1' && ar.args[3].reason === 'Withdrew — family reasons', ar && JSON.stringify(ar.args[3]));
const arch = await page.evaluate(() => ({ banner: !!document.querySelector('.hrBanner.archived'), un: !!document.querySelector('#candUnarchive'), steps: document.querySelectorAll('.candStep:disabled').length }));
ok('the page shows them archived, the stage row is frozen, Bring back is offered', arch.banner && arch.un && arch.steps === 7, JSON.stringify(arch));
await page.click('#candUnarchive');
await page.waitForTimeout(600);
ok('Bring back posts an unarchive', sent.some(x => x.fn === 'hrArchiveCandidate' && x.args[3] === null) && !(await page.$('.hrBanner.archived')));
ok('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
