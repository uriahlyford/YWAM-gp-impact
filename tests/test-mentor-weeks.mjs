/* A mentor can look back at any week of the person they walk with, not only
   the latest: a week picker on the mentee page, and the check-in, habits,
   goals and daily logs all follow it. Pinned to 12 Aug 2026 (week 33) so the
   fixture weeks mean the same thing on any day. Everyone is made up. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock, weekOf } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';

const NOW = testNow('2026-08-12'), WK = weekOf(NOW);   // 33
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise(r => srv.listen(4437, r));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); } };

const DARA = { id: 'st_dara', name: 'Dara Pich', username: 'dara', campus: 'poipet', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', photo: '', mentorId: '' };
const SOKHA = { id: 'st_sokha', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: '', photo: '', mentorId: 'st_dara' };
const ck = (week, lonely) => ({ week, days: 5, source: 'weekly', lonely, clarity: 7, growth: 6, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0, langHours: 2, minHours: 5, sharedFaith: 0, sabbath: 1 });
const CHECKINS = [ck(WK, 3), ck(WK - 1, 6), ck(WK - 3, 8)];   // no check-in two weeks ago
const day = (d) => { const x = new Date(NOW); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
// daily logs: this week (Mon–Wed of week 33), last week, and three weeks back
const LOGS = [0, -1, -2].map(d => ({ date: day(d), week: WK, lonely: 3, habits: { quietTime: true } }))
  .concat([-7, -8, -9, -10].map(d => ({ date: day(d), week: WK - 1, lonely: 6, habits: { quietTime: d > -9 } })))
  .concat([{ date: day(-21), week: WK - 3, lonely: 8, habits: {} }]);
const GOALS = [{ week: WK, pct: 50, items: [{ text: 'Call my family', pct: 50 }] }, { week: WK - 1, pct: 100, items: [{ text: 'Plan the outreach', pct: 100 }] }];

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
await pinClock(p, NOW);
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.route('**/.netlify/functions/api', r => { const q = JSON.parse(r.request().postData() || '{}'); let o = { ok: true };
  if (q.fn === 'getMyBoot') o = { ok: true, staff: DARA, profile: {}, roster: [DARA, SOKHA], logs: [], habits: null, mentees: [SOKHA], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, reasons: { work: ['x'], personal: ['y'] }, hasMentor: false }, tripRequests: [], ministry: null, base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [] } };
  else if (q.fn === 'getMenteeLogs') o = { ok: true, mentee: SOKHA, logs: LOGS, habits: [{ id: 'quietTime' }], goals: GOALS, checkins: CHECKINS, profile: { debt: false }, ministry: null, trips: { trips: [], totals: {}, ptoCap: 30 }, smartGoals: [] };
  else if (q.fn === 'getMyMentees') o = { ok: true, mentees: [SOKHA] };
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  else if (q.fn === 'getData') o = { leader: false, entries: {}, okrs: [], survey: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) }); });
await p.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'dara', pin: '1234' })));
await p.goto('http://localhost:4437/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.evaluate(() => { S.view = 'mentor'; render(); });
await p.waitForTimeout(300);
await p.evaluate(() => { const c = document.querySelector('#main [data-mentee]'); if (c) c.click(); });
await p.waitForSelector('#mWeekNav', { timeout: 5000 });

const view = () => p.evaluate(() => ({
  pill: document.querySelector('#mWeekPill').textContent.trim(),
  prev: document.querySelector('#mWeekPrev').disabled, next: document.querySelector('#mWeekNext').disabled,
  latestBtn: !!document.querySelector('#mWeekLatest'),
  text: document.querySelector('#main').innerText,
  on: (document.querySelector('.mWeekRow.on') || {}).getAttribute ? document.querySelector('.mWeekRow.on').getAttribute('data-mweek') : null
}));
let v = await view();
ok('the mentee page opens on their newest check-in week, with a week picker', v.pill.startsWith('Week ' + WK) && /this week/.test(v.pill) && v.next && !v.prev && !v.latestBtn, v.pill);
ok('that week’s check-in, habits, goals and daily logs', /Loneliness \(avg\)\s*3\/10/.test(v.text) && new RegExp('habits · Week ' + WK).test(v.text) && /Call my family/.test(v.text) && !/Plan the outreach/.test(v.text) && new RegExp('Daily logs · Week ' + WK).test(v.text), v.text.slice(0, 400));
ok('habits count that week’s days, against the week before', /1\/7|3\/7/.test(v.text) && new RegExp('week ' + (WK - 1) + ': 2').test(v.text));
await p.click('#mWeekPrev');
await p.waitForTimeout(200);
v = await view();
ok('‹ goes back a week: the check-in, goals and logs are that week’s', v.pill === 'Week ' + (WK - 1) && /Loneliness \(avg\)\s*6\/10/.test(v.text) && /Plan the outreach/.test(v.text) && !/Call my family/.test(v.text) && v.latestBtn && !v.next, v.pill);
ok('the week in the list is marked', v.on === String(WK - 1), v.on);
await p.click('#mWeekPrev');
await p.waitForTimeout(200);
v = await view();
ok('a week with no check-in says so, rather than showing another week', new RegExp('No check-in for week ' + (WK - 2)).test(v.text) && new RegExp('No goals written for week ' + (WK - 2)).test(v.text) && new RegExp('No daily logs for week ' + (WK - 2)).test(v.text));
await p.click('[data-mweek="' + (WK - 3) + '"]');
await p.waitForTimeout(300);
v = await view();
ok('tapping a week in the list jumps to it', v.pill === 'Week ' + (WK - 3) && /Loneliness \(avg\)\s*8\/10/.test(v.text) && v.prev, v.pill);
await p.click('#mWeekLatest');
await p.waitForTimeout(200);
v = await view();
ok('Back to the latest check-in returns to the newest week', v.pill.startsWith('Week ' + WK));
await p.click('#menteeBack');
await p.waitForTimeout(200);
await p.evaluate(() => { S.menteeWeek = 5; const c = document.querySelector('#main [data-mentee]'); if (c) c.click(); });
await p.waitForSelector('#mWeekNav');
ok('opening a mentee again starts on their newest week', (await view()).pill.startsWith('Week ' + WK));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
