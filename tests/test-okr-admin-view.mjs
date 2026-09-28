/* The OKR page still opens on your own department's objectives, editable as
   before — but an admin also gets every OTHER department's OKRs below that,
   grouped by department and campus, collapsed by default (a whole org's
   worth of objectives open at once would bury the one thing this page is
   actually for). A non-admin never sees that section at all. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { testNow, pinClock, weekOf, quarterOf } from './clock.mjs';
const NOW = testNow();
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = PUBLIC;
const OUT = tmpDir('out') + '/';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
await new Promise(res => srv.listen(4414, res));

const Q = quarterOf(weekOf(NOW)) + 1;   // the app's quarter (13-week blocks), not the calendar month's
const OKRS = [
  { id: 'o1', campus: 'poipet', quarter: Q, dept: 'Community Service', objective: 'My own department’s objective', krs: [{ text: 'A key result', metricKey: '', target: 0, manual: 40 }] },
  { id: 'o2', campus: 'poipet', quarter: Q, dept: 'Youth Education', objective: 'A different department’s objective', krs: [{ text: 'Their key result', metricKey: '', target: 0, manual: 70 }] }
];
const BASE_DATA = { leader: false, entries: { poipet: {} }, okrs: OKRS, survey: [], roster: [] };

const ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '', mentorId: '', isAdmin: true };
const STAFF = { id: 'st_staff', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '', mentorId: '', isAdmin: false };

async function run(who, label) {
  const b = await chromium.launch({ executablePath: CHROMIUM });
  const p = await b.newPage({ viewport: { width: 400, height: 900 } });
  await pinClock(p, NOW);
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.route('**/.netlify/functions/api', r => {
    const q = JSON.parse(r.request().postData() || '{}');
    let o = { ok: true };
    if (q.fn === 'getMyBoot') o = {
      ok: true, staff: who, profile: { email: 'x@example.com' }, roster: [who], logs: [], habits: null,
      mentees: [], mentorRequests: [], goals: [], checkins: [],
      trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [], ministry: null,
      base: BASE_DATA
    };
    else if (q.fn === 'teamRoster') o = [who];
    else if (q.fn === 'staffLogin') o = { ok: true, staff: who, profile: {} };
    else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
  });
  await p.addInitScript((u) => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await p.goto('http://localhost:4414/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
  await p.waitForTimeout(700);
  await p.click('nav.bottom [data-tab="week"]');
  await p.waitForTimeout(600);
  await p.click('#goOkrFromMe');
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const text = document.querySelector('#main').innerText;
    return {
      ownObjective: text.includes('My own department’s objective'),
      sectionHeading: text.includes('Every department') || /OKR.*ដទៃ|OKR.*គ្រប់ផ្នែក/.test(text),
      otherVisibleUnopened: text.includes('A different department’s objective')
    };
  });
  console.log(label + ': ' + JSON.stringify(r));
  await b.close(); srv.close();
  return { ...r, errs };
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const staffResult = await run(STAFF, 'non-admin');
ok('a non-admin sees their own department’s objective', staffResult.ownObjective);
ok('a non-admin gets no cross-department section at all', !staffResult.sectionHeading);
ok('and never sees another department’s objective', !staffResult.otherVisibleUnopened);
ok('non-admin: no console/page errors', staffResult.errs.length === 0, staffResult.errs.slice(0, 3).join(' | '));

const srv2 = http.createServer((q, r) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
await new Promise(res => srv2.listen(4415, res));
const b2 = await chromium.launch({ executablePath: CHROMIUM });
const p2 = await b2.newPage({ viewport: { width: 400, height: 900 } });
await pinClock(p2, NOW);
const errs2 = [], saves2 = []; p2.on('pageerror', e => errs2.push(String(e)));
await p2.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = {
    ok: true, staff: ADMIN, profile: { email: 'x@example.com' }, roster: [ADMIN], logs: [], habits: null,
    mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [], ministry: null,
    base: BASE_DATA
  };
  else if (q.fn === 'teamRoster') o = [ADMIN];
  else if (q.fn === 'saveObjective') { saves2.push(q.args[0]); const ob = q.args[0]; BASE_DATA.okrs = BASE_DATA.okrs.filter(x => x.id !== ob.id).concat([ob]); o = BASE_DATA; }
  else if (q.fn === 'staffLogin') o = { ok: true, staff: ADMIN, profile: {} };
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p2.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await p2.goto('http://localhost:4415/teams.html'); await p2.waitForSelector('nav.bottom button', { timeout: 15000 });
await p2.waitForTimeout(700);
await p2.click('nav.bottom [data-tab="week"]');
await p2.waitForTimeout(600);
await p2.click('#goOkrFromMe');
await p2.waitForTimeout(700);

const beforeOpen = await p2.evaluate(() => document.querySelector('#main').innerText);
ok('admin sees the cross-department section', /Every department|OKR.*គ្រប់ផ្នែក/.test(beforeOpen));
ok('but the other department’s objective is collapsed, not shown yet', !beforeOpen.includes('A different department’s objective'));

const otherGroupBtn = await p2.$('[data-acc="poipet|Youth Education"]');
ok('the other department’s group row is on the page', !!otherGroupBtn);
if (otherGroupBtn) {
  await otherGroupBtn.click();
  await p2.waitForTimeout(400);
  const afterOpen = await p2.evaluate(() => document.querySelector('#main').innerText);
  ok('opening it reveals the other department’s objective', afterOpen.includes('A different department’s objective'));
  const editBtn = await p2.evaluate(() => {
    const cards = [...document.querySelectorAll('.okrCard')];
    const card = cards.find(c => c.textContent.includes('A different department’s objective'));
    return card ? !!card.querySelector('[data-okr-edit], [data-okr-del]') : null;
  });
  ok('an admin can edit and delete another department’s objective there', editBtn === true, editBtn);
  await p2.click('[data-okradmin] [data-okr-edit="o2"]');
  await p2.waitForSelector('#okrForm');
  ok('Edit opens the form for that objective, labelled with its department and campus', /Edit objective/.test(await p2.$eval('#okrForm', e => e.textContent)) && /Youth Education/.test(await p2.$eval('#okrForm', e => e.textContent)) && (await p2.$eval('#okrObjText', i => i.value)) === 'A different department’s objective');
  await p2.fill('#okrObjText', 'Edited by the admin');
  await p2.click('#okrSaveBtn');
  await p2.waitForTimeout(500);
  const sv = saves2.pop();
  ok('Save keeps that objective’s own campus and department, not the admin’s', sv && sv.id === 'o2' && sv.campus === 'poipet' && sv.dept === 'Youth Education' && sv.objective === 'Edited by the admin', JSON.stringify(sv));
  ok('there is a New objective with a campus and department picker', !!(await p2.$('#okrAdmCampus')) && !!(await p2.$('#okrAdmDept')) && !!(await p2.$('#okrAdmNewBtn')));
  await p2.selectOption('#okrAdmCampus', 'siemreap');
  await p2.waitForTimeout(200);
  await p2.selectOption('#okrAdmDept', 'Leadership Development');
  await p2.click('#okrAdmNewBtn');
  await p2.waitForSelector('#okrForm');
  await p2.fill('#okrObjText', 'A new objective for Siem Reap');
  await p2.fill('#okrKrText0', 'One key result');
  await p2.click('#okrSaveBtn');
  await p2.waitForTimeout(500);
  const nv = saves2.pop();
  ok('and it saves for the campus and department picked', nv && nv.campus === 'siemreap' && nv.dept === 'Leadership Development' && nv.objective === 'A new objective for Siem Reap' && /^o\d+$/.test(nv.id), JSON.stringify(nv));

  // More than three key results: "+ Add a key result" adds a row without losing what was typed.
  await p2.click('#okrAdmNewBtn');
  await p2.waitForSelector('#okrForm');
  const rowCount = () => p2.$$eval('#okrForm [data-okr-kr]', r => r.length);
  ok('the form starts with three key-result rows', (await rowCount()) === 3, await rowCount());
  await p2.fill('#okrObjText', 'Lots of key results');
  await p2.fill('#okrKrText0', 'First');
  await p2.click('#okrKrAddBtn');
  await p2.click('#okrKrAddBtn');
  ok('each tap on Add a key result adds a row', (await rowCount()) === 5, await rowCount());
  ok('typing already in the form stays put', (await p2.$eval('#okrObjText', i => i.value)) === 'Lots of key results' && (await p2.$eval('#okrKrText0', i => i.value)) === 'First');
  ok('the new row is numbered and has its own KPI picker', /Key result 5/.test(await p2.$eval('#okrKrText4', e => e.placeholder)) && !!(await p2.$('#okrKrMetric4')));
  await p2.fill('#okrKrText4', 'Fifth');
  await p2.click('#okrSaveBtn');
  await p2.waitForTimeout(500);
  const mv = saves2.pop();
  ok('saving sends every filled row, including the added ones', mv && mv.krs.length === 2 && mv.krs[1].text === 'Fifth', JSON.stringify(mv && mv.krs));
  await p2.click('#okrAdmNewBtn');
  await p2.waitForSelector('#okrForm');
  for (let i = 0; i < 10; i++) { if (await p2.isVisible('#okrKrAddBtn')) await p2.click('#okrKrAddBtn'); }
  ok('it stops at ten, the most the server keeps', (await rowCount()) === 10 && !(await p2.isVisible('#okrKrAddBtn')), await rowCount());
  await p2.click('#okrCancelBtn');
}
ok('admin: no console/page errors', errs2.length === 0, errs2.slice(0, 3).join(' | '));
await b2.close(); srv2.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
