/* Base tab: profile on top, the whole dashboard under it, every figure tappable.
   Also re-checks the dashboard's own drill-down, since it now shares the sheet. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = PUBLIC;
const OUT = tmpDir('out') + '/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

const P = 'poipet', S = 'siemreap';
const e = { [P]: {}, [S]: {} };
const put = (c, d, m, k, w) => { e[c][d + '|' + m + '|' + k] = w; };
// two ministries feeding one total, so a breakdown has more than one row
put(P, 'Community Service', 'Outreach Teams', 'Salvations', { 3: 4, 7: 9, 20: 6 });
put(P, 'Community Service', 'Outreach Teams', 'Teams Hosted', { 3: 1, 7: 1, 20: 1 });
put(P, 'Community Service', 'Outreach Teams', 'Volunteers Mobilized', { 3: 9, 7: 14 });
put(P, 'Community Service', 'Outreach Teams', 'Community Service Hours', { 3: 18, 7: 24 });
put(P, 'Community Service', 'Outreach Teams', 'People Served', { 3: 210, 7: 340 });
put(P, 'Community Service', 'Outreach Teams', 'Baptisms', { 7: 3 });
put(P, 'Community Service', 'Outreach Teams', 'People Connected to Local Church', { 7: 5, 30: 4, 32: 3 });  // wk 30/32 sit in the current quarter, so a Q3 objective has something to measure
put(P, 'Community Service', 'Outreach Teams', 'People Heard the Gospel', { 3: 180, 7: 300 });
put(P, 'Community Service', 'Outreach Teams', 'Healings', { 7: 2 });
put(P, 'Youth Education', 'YDC', 'Salvations', { 5: 2, 12: 3 });
put(P, 'Youth Education', 'YDC', 'Youth Enrolled', { 1: 40, 12: 48 });
put(P, 'Youth Education', 'YDC', 'Students in Discipleship', { 12: 12 });
put(P, 'Youth Education', 'GP Media', 'Facebook Pages', { 2: 3 });
put(P, 'Youth Education', 'GP Media', 'Facebook Followers', { 2: 5400 });
put(P, 'Youth Education', 'GP Media', 'Facebook Views', { 1: 12000, 2: 21000 });
put(P, 'Community Service', 'GP Education', 'Schools', { 1: 2 });
put(P, 'Community Service', 'GP Education', 'Students Enrolled', { 1: 80, 12: 90 });
put(P, 'Community Service', 'GP Education', 'Students Supported Financially', { 12: 14 });
put(P, 'Leadership Development', 'DTS', 'Students Enrolled', { 1: 20, 12: 22 });
put(P, 'Leadership Development', 'DTS', 'Students Graduated', { 12: 21 });
put(P, 'Leadership Development', 'DTS', 'Potential Staff', { 12: 6 });
put(P, 'Leadership Development', 'DBS', 'Students Enrolled', { 12: 10 });
put(P, 'Leadership Development', 'Church Partnerships', 'Partner Churches Supported', { 1: 4, 12: 5 });
put(P, 'Leadership Development', 'Church Partnerships', 'Churches Being Led', { 12: 3 });
put(P, 'Leadership Development', 'Church Partnerships', 'Combined Congregation Attendance', { 12: 340 });
put(P, 'Base Leadership', 'Campus Leadership', 'Total Staff', { 1: 12 });
put(P, 'Base Leadership', 'Campus Leadership', 'Spoke at Churches', { 1: 2, 2: 1 });
put(P, 'Base Leadership', 'Campus Leadership', 'One-on-Ones Held', { 2: 6 });
put(P, 'Base Leadership', 'Campus Leadership', 'Base Vision (1-10)', { 2: 8 });
put(P, 'Base Leadership', 'Community Service', 'Staff Debt ($)', { 2: 900 });

/* My own weekly health, as syncWeekSurvey_ would have derived it from my logs. */
const NOWWK = (() => { const y=new Date().getFullYear(), j=new Date(y,0,1);
  const m=new Date(y,0,1-((j.getDay()+6)%7));
  return Math.max(1,Math.min(52,Math.floor((new Date()-m)/(7*86400000))+1)); })();
let CHECKIN_STORE;
const MY_CHECKINS = [NOWWK, NOWWK-1, NOWWK-2].map((w,i) => ({
  week: w, days: 5-i, lonely: 2+i, clarity: 8-i, growth: 7, porn: 0,
  oneOnOne: 1, exercise: i===0?1:0, quietTime: 1, debt: 0,
  langHours: 2+i, minHours: 6-i, sharedFaith: 1, sabbath: 1
}));
CHECKIN_STORE = MY_CHECKINS.map(c => ({ ...c, source: 'daily' }));
const MATE = { id: 'st2', name: 'Mealea Sok', username: 'mealea', campus: P, dept: 'Youth Education', ministry: 'YDC', role: 'YDC teacher', photo: '', mentorId: '', staffType: 'ministry', country: 'Cambodia' };
const ME = { id: 'st1', name: 'Sokha Chan', username: 'sokha', campus: P, dept: 'Community Service', ministry: 'Outreach Teams', role: 'Outreach coordinator', photo: '', mentorId: '', staffType: 'campus', country: 'United States' };
const Q = Math.min(4, Math.floor((new Date().getMonth()) / 3) + 1);
const OKRS = [{
  id: 'o1', campus: P, quarter: Q,
  dept: 'Community Service', objective: 'Every outreach team leaves a village with a church contact',
  krs: [
    { text: 'Connected to a local church', metricKey: 'Community Service|Outreach Teams|People Connected to Local Church', target: 10, manual: 0 },
    { text: 'Debrief every team within a week', metricKey: '', target: 0, manual: 60 }
  ]
}, {
  id: 'o2', campus: P, quarter: Q,
  dept: 'Youth Education', objective: 'YDC students know they are known',
  krs: [{ text: 'Students in discipleship', metricKey: 'Youth Education|YDC|Students in Discipleship', target: 30, manual: 0 }]
}];
let OKR_STORE = OKRS.map(o => ({ ...o, krs: o.krs.map(k => ({ ...k })) }));
const DATA = {
  /* getData carries the roster in production — the dashboard's staff figures are
     counted from it, so leaving it out here would test a page that cannot count. */
  leader: false, entries: e, roster: [ME, MATE], get okrs() { return OKR_STORE; },
  survey: [NOWWK, NOWWK-1].flatMap(w => [0,1,2].map(i => ({
    campus: P, week: w, device: 'dev'+i, lonely: 2+i, clarity: 7+i%3, growth: 6+i,
    porn: 0, oneOnOne: i?1:0, exercise: i%2, quietTime: 1, debt: i===0?1:0,
    langHours: 1+i, minHours: 3+i, sharedFaith: i%2, sabbath: 1
  })))
};

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4401, r));

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
async function newPage(seed) {
  const page = await browser.newPage({ viewport: { width: 400, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', x => errors.push('PAGEERROR ' + x));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}');
    let out = DATA;
    if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: [ME, MATE],
      logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: CHECKIN_STORE,
      trips: { ok: true, trips: [], totals: {}, reasons: { work: ['Ministry trip'], personal: ['Family'] }, hasMentor: false },
      tripRequests: [], ministry: null, base: { ...DATA, okrs: OKR_STORE } };
    else     if (b.fn === 'teamRoster') out = [ME, MATE];
    else if (b.fn === 'staffProfile') out = { ok: true, staff: MATE, goals: [],
      activity: { weeksTracked: 4, daysLogged: 18, lastLogged: '2026-08-10' }, awayWork: {}, isMe: false };
    // a working store, so the editor's writes really come back
    else if (b.fn === 'saveObjective') {
      const o = b.args[0];
      OKR_STORE = OKR_STORE.filter(x => x.id !== o.id).concat([{ ...o, krs: o.krs.map(k => ({ ...k })) }]);
      out = { ...DATA, okrs: OKR_STORE };
    } else if (b.fn === 'deleteObjective') {
      OKR_STORE = OKR_STORE.filter(x => x.id !== b.args[0]);
      out = { ...DATA, okrs: OKR_STORE };
    }
    else if (b.fn === 'staffLogin') out = { ok: true, staff: ME, profile: {} };
    else if (b.fn === 'getMyTrips') out = { ok: true, trips: [], totals: {}, reasons: { work: ['Ministry trip'], personal: ['Family'] }, hasMentor: false };
    else if (b.fn === 'getMyWeekly') out = { ok: true, goals: [], checkins: CHECKIN_STORE };
    else if (b.fn === 'saveMyWeek') {
      const wk = b.args[2], p2 = b.args[3];
      CHECKIN_STORE = CHECKIN_STORE.filter(c => Number(c.week) !== Number(wk))
        .concat([{ week: Number(wk), days: 7, source: 'weekly',
          lonely: p2.lonely, clarity: p2.clarity, growth: p2.growth,
          porn: p2.porn ? 1 : 0, oneOnOne: p2.oneOnOne ? 1 : 0, exercise: p2.exercise ? 1 : 0,
          quietTime: p2.quietTime ? 1 : 0, debt: p2.debt ? 1 : 0,
          sharedFaith: p2.sharedFaith ? 1 : 0, sabbath: p2.sabbath ? 1 : 0,
          langHours: p2.langHours, minHours: p2.minHours }])
        .sort((x, y) => y.week - x.week);
      out = { ok: true, goals: [], checkins: CHECKIN_STORE };
    } else if (b.fn === 'deleteMyWeek') {
      CHECKIN_STORE = CHECKIN_STORE.filter(c => Number(c.week) !== Number(b.args[2]));
      out = { ok: true, goals: [], checkins: CHECKIN_STORE };
    }
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  if (seed) await page.addInitScript(seed);
  return page;
}

/* ---------- the staff page's Base tab ---------- */
const page = await newPage(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
await page.goto('http://localhost:4401/teams.html', { waitUntil: 'load' });
await page.waitForSelector('.hero', { timeout: 15000 });
await page.waitForTimeout(1200);

// Base's sections collapse into an accordion now (the redesign mockup);
// force every row open so the rest of this file — which predates the
// accordion and expects everything on screen at once — still sees it all.
await page.evaluate(() => { Object.keys(S.baseAcc).forEach(k => { S.baseAcc[k] = true; }); render(); });
await page.waitForTimeout(500);

console.log('=== BASE TAB ===');
// 1. profile card is first, above the hero
const order = await page.evaluate(() => {
  const me = document.querySelector('.baseMe');
  const hero = document.querySelector('.hero');
  if (!me || !hero) return 'missing: ' + (!me ? 'profile card' : 'hero');
  return (me.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'profile above hero' : 'WRONG ORDER';
});
console.log('order:            ' + order);
console.log('profile shows:    ' + await page.$eval('.baseMe', el => el.innerText.replace(/\n+/g, ' | ')));
console.log('avatar present:   ' + await page.evaluate(() => !!document.querySelector('.baseMe .avatar')));

// 2. every dashboard section present — Base's headings are accordion titles
// now, not <h3>s (all forced open above, so every one of them is present)
const sections = await page.$$eval('#main .accTitle', els => els.map(e => e.textContent.trim()));
console.log('sections (' + sections.length + '):\n  ' + sections.join('\n  '));

// 3. compare against the dashboard's own section list
const dash = await newPage(() => { sessionStorage.setItem('gp-guest', '1'); });
await dash.goto('http://localhost:4401/index.html', { waitUntil: 'load' });
await dash.waitForSelector('.hero', { timeout: 15000 });
await dash.waitForTimeout(1000);
const dashSections = await dash.$$eval('#main h3', els => els.map(e => e.textContent.trim()));
console.log('\n=== DASHBOARD sections (' + dashSections.length + ') ===\n  ' + dashSections.join('\n  '));
/* Case-insensitive: the Base accordion (ported from the redesign mockup) title-
   cases several of these ("Community schools" -> "Community Schools") where the
   dashboard, untouched, still has its original casing. That's cosmetic, not
   drift, so it must not trip this check — genuine wording differences still do. */
const strip = s => s.replace(/^[^\w]*/, '').replace(/Q\d /, '').toLowerCase();
/* OKRs are deliberately NOT on Base — they live on Me (your own) and on a
   teammate's page (theirs), because an objective belongs to a person's job, not
   to the base summary.

   The other three are real renames, not drift: "Base health" is on Base too,
   just as "Base Leadership" — the accordion added a second, unrelated "Base
   Health" row (everyone's own wellbeing check-in, not the department leaders'
   KPIs), so the old name was freed up to avoid two rows reading the same on
   screen. "Across every ministry" and "Department dashboards" are the same
   sections as "Gospel Totals" and "Department Explorer", renamed to match the
   mockup's own wording for those two. Everything else must match, so real
   drift still fails. */
const EXPECTED_OFF_BASE = ['OKRs', 'Base health', 'Across every ministry', 'Department dashboards'];
/* Both sides go through strip() — it lowercases, so comparing raw names against
   it excluded nothing and every allowed section counted as drift. */
const allowed = EXPECTED_OFF_BASE.map(strip);
const missing = dashSections.map(strip)
  .filter(d => !sections.map(strip).includes(d))
  .filter(d => !allowed.includes(d));
console.log('\non the dashboard but NOT on Base (unexpected): ' + (missing.length ? missing.join(', ') : '(none)'));
if (missing.length) { console.log('  ^ that is drift, not a decision'); process.exitCode = 1; }

// 4. tile counts
console.log('\nBase tiles:      ' + await page.$$eval('#main .stat', e => e.length));
console.log('Dashboard tiles: ' + await dash.$$eval('#main .stat', e => e.length));
console.log('Base drillable:  ' + await page.$$eval('#main [data-drill-metric]', e => e.length));
console.log('Base quarter rows: ' + await page.$$eval('#main .qRow', e => e.length));

// 4b. the staff number breaks down by kind of staff and by where people are from
const mix = await page.evaluate(() => {
  const q = document.querySelector('.hero .staffMix');
  const line = document.querySelector('.hero [data-staffmix]');
  return { chips: q ? q.innerText.replace(/\n+/g, ' · ') : '(none)',
           line: line ? line.innerText.trim() : '(none)' };
});
console.log('\nstaff by kind:   ' + mix.chips);
console.log('staff by origin: ' + mix.line);
const dashMix = await dash.evaluate(() => {
  const line = document.querySelector('.hero [data-staffmix]');
  return line ? line.innerText.trim() : '(none)';
});
console.log('same on dashboard: ' + dashMix);
/* One base, one description of it — the two pages share gpStaffMixHtml, and this
   is what catches them being handed different rosters. */
if (mix.line !== dashMix) { console.log('  ^ the two pages describe the base differently'); process.exitCode = 1; }
if (mix.chips === '(none)' || mix.line === '(none)') { console.log('  ^ the staff split did not render'); process.exitCode = 1; }

// tapping that line lists the countries
await page.click('.hero [data-staffmix]');
await page.waitForSelector('.ddModal', { timeout: 6000 });
const countries = await page.$$eval('.ddRow', els => els.map(x => x.textContent.trim().replace(/\s+/g, ' ')));
console.log('countries:       ' + countries.join(' | '));
if (countries.length !== 2) { console.log('  ^ expected one row per country'); process.exitCode = 1; }
await page.click('#ddClose');
await page.waitForTimeout(300);

// 5. tapping a figure opens the breakdown
await page.click('#main .stat[data-drill-metric="Salvations"]');
await page.waitForSelector('.ddModal', { timeout: 6000 });
await page.waitForTimeout(400);
console.log('\ndrill title: ' + await page.$eval('.ddHead h3', e => e.textContent));
console.log('drill rows:  ' + (await page.$$eval('.ddRow', e => e.map(x => x.textContent.trim().replace(/\s+/g, ' ')))).join('\n             '));
await page.screenshot({ path: OUT + 'base-drill.png' });
await page.click('#ddClose');
await page.waitForTimeout(300);
console.log('closes:      ' + await page.evaluate(() => !document.querySelector('.ddModal')));

// 6. a base-wide figure must pool ministries, not just one
await page.click('#main .heroSubRow');
await page.waitForSelector('.ddModal', { timeout: 6000 });
await page.waitForTimeout(300);
const heroRows = await page.$$eval('.ddRow .ddRowHead span:first-child', e => e.map(x => x.textContent.trim()));
console.log('hero salvations pooled from: ' + heroRows.join(' + '));
await page.click('#ddClose');

// 7. a quarter chip drills into that quarter only
await page.click('#main .qRow span.drillable');
await page.waitForSelector('.ddModal', { timeout: 6000 });
await page.waitForTimeout(300);
console.log('quarter chip title: ' + await page.$eval('.ddHead h3', e => e.textContent));
await page.click('#ddClose');

// 8. dashboard drill still works off the shared sheet
await dash.click('#main .stat[data-drill-metric] , #main .heroSubRow');
await dash.waitForSelector('.ddModal', { timeout: 6000 });
await dash.waitForTimeout(300);
console.log('\ndashboard drill still opens: ' + await dash.$eval('.ddHead h3', e => e.textContent));

// 9. OKR block + full-page screenshot
console.log('OKR block on Base: ' + await page.evaluate(() => document.body.innerText.includes('OKRs')));
await page.screenshot({ path: OUT + 'base-full.png', fullPage: true });

// 10. the department explorer switches and its rows drill
const before = await page.$eval('#baseDeptSel', el => el.value);
await page.selectOption('#baseDeptSel', 'Youth Education');
await page.waitForTimeout(1000);
console.log('\ndept picker: ' + before + ' -> ' + await page.$eval('#baseDeptSel', el => el.value));
console.log('ministries shown: ' + (await page.$$eval('#main .card .row[style*="border-bottom:2px"] .rowName', e => e.map(x => x.textContent.trim()))).join(', '));
const ydcRow = await page.$('#main .row.drillable[data-drill-ministry="YDC"][data-drill-metric="Youth Enrolled"]');
console.log('a ministry row is drillable: ' + !!ydcRow);
if (ydcRow) {
  await ydcRow.click();
  await page.waitForSelector('.ddModal', { timeout: 6000 });
  await page.waitForTimeout(300);
  console.log('  -> ' + await page.$eval('.ddHead h3', e => e.textContent) + ' | ' + await page.$eval('.ddWeeks', e => e.textContent.trim()));
  await page.click('#ddClose');
}

// 10a. OKRs: off Base, on My Database (mine only), and on a teammate's page
console.log('\n=== OKRs ===');
console.log('OKR heading on Base:  ' + await page.evaluate(() =>
  Array.from(document.querySelectorAll('#main h3')).some(h => /OKR/.test(h.textContent))));
const tabs = await page.$$eval('nav.bottom button', b => b.map(x => x.textContent.trim()));
console.log('tabs (no OKR tab):    ' + tabs.join(' | '));

await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(1100);
console.log('\n-- My Database --');
console.log('OKR heading:   ' + await page.$$eval('#main h3', e => e.map(x => x.textContent.trim()).filter(x => /OKR/.test(x)).join(', ')));
console.log('focus card:    ' + await page.$eval('.focusCard', e => e.innerText.replace(/\n+/g, ' | ').slice(0, 120)));
console.log('my objectives: ' + await page.$$eval('.okrCard', e => e.length));
console.log('key results:   ' + (await page.$$eval('.kr', e => e.map(x => x.innerText.replace(/\n+/g, ' | ')))).join('  //  '));
console.log('other depts shown (should be 0): ' + await page.evaluate(() =>
  Array.from(document.querySelectorAll('.okrObj')).filter(o => /YDC students/.test(o.textContent)).length));
console.log('no fold-away button: ' + await page.evaluate(() => !document.querySelector('#okrOtherBtn')));
await page.screenshot({ path: OUT + 'me-okr.png', fullPage: true });

console.log('\n-- a teammate in Team --');
await page.click('nav.bottom [data-tab="team"]');
await page.waitForTimeout(1100);
const card = await page.$('#main [data-person]');
console.log('directory has people: ' + !!card);
if (card) {
  await card.click();
  await page.waitForTimeout(1200);
  console.log('their name:      ' + await page.$eval('.pcard .pname', e => e.textContent.trim()));
  console.log('OKR heading:     ' + await page.$$eval('#main h3', e => e.map(x => x.textContent.trim()).filter(x => /OKR/.test(x)).join(', ')));
  console.log('focus label:     ' + await page.$eval('.focusCard .fLabel', e => e.textContent.trim()).catch(() => '(no focus card)'));
  console.log('their objectives: ' + await page.$$eval('.okrCard', e => e.length));
  console.log('goals heading:   ' + await page.$$eval('#main h3', e => e.map(x => x.textContent.trim()).filter(x => /goals/i.test(x)).join(', ')));
  // their objective must be their department's, not the reader's
  console.log('their objective: ' + await page.$eval('.okrObj', e => e.textContent.trim()));
  console.log('their dept line: ' + await page.$eval('.okrDept', e => e.textContent.trim()));
  console.log('mine leaked in:  ' + await page.evaluate(() =>
    Array.from(document.querySelectorAll('.okrObj')).some(o => /outreach team leaves/i.test(o.textContent))));
  await page.screenshot({ path: OUT + 'person-okr.png', fullPage: true });
}

// 10c. the editor: create, edit, hand-tracked %, delete
// More than one objective in the same quarter now pages one card at a time
// (#okrPrev/#okrNext) instead of stacking every card at once, so this walks
// to whichever objective it needs by title rather than assuming position.
async function okrPageTo(re) {
  for (let i = 0; i < 6; i++) {
    const cur = await page.$eval('.okrObj', e => e.textContent.trim()).catch(() => '');
    if (re.test(cur)) return true;
    const next = await page.$('#okrNext');
    if (!next || await next.evaluate(b => b.disabled)) return false;
    await next.click();
    await page.waitForTimeout(400);
  }
  return false;
}
console.log('\n=== OKR EDITOR (on My Database) ===');
await page.click('nav.bottom [data-tab="week"]');
await page.waitForTimeout(1000);
console.log('starting objectives: ' + await page.$$eval('.okrCard', e => e.length));
console.log('edit + delete shown: ' + await page.evaluate(() =>
  !!document.querySelector('[data-okr-edit]') && !!document.querySelector('[data-okr-del]')));
console.log('hand-tracked % input: ' + await page.evaluate(() => !!document.querySelector('[data-okr-manual]')));

// create
await page.click('#okrNewBtn'); await page.waitForTimeout(600);
await page.fill('#okrObjText', 'Plant a church in every village we reach');
await page.fill('#okrKrText0', 'Villages with a new church');
await page.selectOption('#okrKrMetric0', 'Community Service|Outreach Teams|People Connected to Local Church');
/* 5 is under what Outreach Teams has already logged for this metric this
   quarter, so the editor has to say so before the objective is ever saved —
   this is the one moment the target can be got right. */
await page.fill('#okrKrTarget0', '5');
await page.waitForTimeout(300);
const tgtNote = await page.$eval('#okrKrWarn0', e => e.textContent.trim()).catch(() => '');
console.log('editor warns on a too-low target: ' + (tgtNote || '(nothing said)'));
if (!/a target of 5 is passed/.test(tgtNote)) {
  console.log('  ^ a target already passed was accepted in silence'); process.exitCode = 1;
}
await page.fill('#okrKrText1', 'Debrief within a week');
await page.click('#okrSaveBtn'); await page.waitForTimeout(1800);
console.log('pager present after 2nd objective: ' + await page.evaluate(() => !!document.querySelector('#okrNext')));
console.log('paged to the new one: ' + await okrPageTo(/Plant a church/));
console.log('new one shows figure/target: ' + await page.evaluate(() => {
  const c = Array.from(document.querySelectorAll('.okrCard')).find(x => /Plant a church/.test(x.textContent));
  if (!c) return 'card missing';
  const m = c.textContent.match(/(\d+)\s*\/\s*5/);
  return m ? m[0] : 'no figure/target found';
}));

// edit — currently paged to the new objective, so its own edit button is the only one shown
await page.click('[data-okr-edit]'); await page.waitForTimeout(700);
console.log('form prefilled: ' + await page.$eval('#okrObjText', e => e.value));
await page.fill('#okrObjText', 'Plant a church in every village (revised)');
await page.click('#okrSaveBtn'); await page.waitForTimeout(1800);
console.log('paged to the edited one: ' + await okrPageTo(/revised/));
console.log('after edit: ' + await page.$eval('.okrObj', e => e.textContent.trim()));

// hand-tracked percentage saves on change — key results are collapsed by
// default now, so open the card's key results first
await page.click('[data-kr-toggle]');
await page.waitForTimeout(500);

/* Same target, now saved: the row reads 100% because the percentage is capped,
   so the row itself has to say the target is the thing that is wrong. */
const krWarn = await page.evaluate(() => {
  const c = Array.from(document.querySelectorAll('.okrCard')).find(x => /revised/.test(x.textContent));
  const w = c && c.querySelector('.krWarn');
  return w ? w.textContent.trim() : '';
});
console.log('row says the target was passed: ' + (krWarn || '(nothing said)'));
const krPct = Number((krWarn.match(/(\d+)%/) || [])[1]);
if (!(krPct > 100)) {
  console.log('  ^ a full bar with nothing saying why reads as an objective met'); process.exitCode = 1;
}
const manKey = await page.$eval('[data-okr-manual]', e => e.getAttribute('data-okr-manual'));
console.log('editing manual kr: ' + manKey);
await page.fill('[data-okr-manual="' + manKey + '"]', '80');
await page.dispatchEvent('[data-okr-manual="' + manKey + '"]', 'change');
await page.waitForTimeout(1800);
console.log('manual % persisted: ' + await page.$eval('[data-okr-manual="' + manKey + '"]', e => e.value));
console.log('its bar reflects it: ' + await page.evaluate(k => {
  const inp = document.querySelector('[data-okr-manual=\"' + k + '\"]');
  const kr = inp && inp.closest('.kr');
  return kr ? kr.querySelector('.barFill').style.width : 'not found';
}, manKey));

// delete — still paged to the revised objective from the edit step above
page.on('dialog', d => d.accept());
// .weekPill is reused by Weekly Goals/My Ministry too, so read the one that
// actually sits next to the OKR pager's own #okrNext button.
const beforeDel = await page.evaluate(() => {
  const next = document.querySelector('#okrNext');
  const pill = next && next.previousElementSibling;
  const m = pill && pill.textContent.match(/of (\d+)/);
  return m ? Number(m[1]) : 1;
});
await page.click('[data-okr-del]'); await page.waitForTimeout(1800);
console.log('objectives ' + beforeDel + ' -> ' + await page.$$eval('.okrCard', e => e.length) + ' after delete (pager gone: ' +
  await page.evaluate(() => !document.querySelector('#okrNext')) + ')');
await page.screenshot({ path: OUT + 'okr-editor.png', fullPage: true });

// a teammate's page must stay read-only
await page.click('nav.bottom [data-tab="team"]'); await page.waitForTimeout(1100);
const c2 = await page.$('#main [data-person]');
if (c2) {
  await c2.click(); await page.waitForTimeout(1300);
  console.log('teammate page editable: ' + await page.evaluate(() =>
    !!document.querySelector('[data-okr-edit], [data-okr-del], [data-okr-manual], #okrNewBtn')));
}

// 10d. Health: the weekly form, history with trends, anonymous base average
console.log('\n=== HEALTH TAB ===');
await page.click('nav.bottom [data-tab="health"]');
await page.waitForTimeout(1200);
console.log('sections: ' + (await page.$$eval('#main h3', e => e.map(x => x.textContent.trim()))).join(' / '));
console.log('week nav present: ' + await page.evaluate(() => !!document.querySelector('#healthPrevWeek')));

// an unanswered week opens the form — same arrow/pill week nav as Weekly Goals,
// jumped straight there by state rather than clicking Prev N times.
await page.evaluate((wk) => { S.healthWeek = wk; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, NOWWK - 5);
await page.waitForTimeout(900);
console.log('\nunanswered week -> form open: ' + await page.evaluate(() => !!document.querySelector('#weekForm')));
console.log('  1-10 questions: ' + await page.$$eval('#weekForm [data-wslide]', e => e.length));
console.log('  yes/no questions: ' + await page.$$eval('#weekForm .seg', e => e.length));
console.log('  hour boxes: ' + await page.$$eval('#weekForm [data-wnum]', e => e.length));

// submitting with the scales unanswered is refused — sliders show a default
// position but don't count as answered until dragged
await page.click('#weekSubmit'); await page.waitForTimeout(700);
console.log('  incomplete refused: ' + await page.evaluate(() => !!document.querySelector('#weekForm')));

// fill it in and submit
for (const [q, v] of [['lonely', 2], ['clarity', 9], ['growth', 8]]) {
  await page.$eval(`[data-wslide="${q}"]`, (el, val) => {
    el.value = val; el.dispatchEvent(new Event('input', { bubbles: true }));
  }, v);
  await page.waitForTimeout(250);
}
await page.fill('[data-wnum="langHours"]', '3');
await page.dispatchEvent('[data-wnum="langHours"]', 'change');
await page.fill('[data-wnum="minHours"]', '7');
await page.dispatchEvent('[data-wnum="minHours"]', 'change');
for (const q of ['oneOnOne', 'exercise', 'quietTime', 'sharedFaith', 'sabbath']) {
  await page.click(`[data-wyn="${q}|1"]`); await page.waitForTimeout(200);
}
for (const q of ['porn', 'debt']) { await page.click(`[data-wyn="${q}|0"]`); await page.waitForTimeout(200); }
await page.click('#weekSubmit'); await page.waitForTimeout(2200);
console.log('\nafter submit, score: ' + await page.$eval('#main .pctBig', e => e.textContent.trim()));
console.log('  marked hand-entered: ' + await page.evaluate(() =>
  /weekly check-in/i.test(document.querySelector('#main .card').innerText)));
console.log('  "Against last week" rows: ' + await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('#main h3')).find(x => /Against last week/.test(x.textContent));
  return h ? h.nextElementSibling.querySelectorAll('.row').length : 0;
}));
console.log('  trend badges present: ' + await page.$$eval('#main .trend', e => e.length));
console.log('  My weeks rows: ' + await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('#main h3')).find(x => /My weeks/.test(x.textContent));
  return h ? h.nextElementSibling.querySelectorAll('.row').length : 0;
}));
console.log('  base aggregate rows: ' + await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('#main h3')).find(x => /Base health/.test(x.textContent));
  return h ? h.nextElementSibling.nextElementSibling.querySelectorAll('.row').length : 0;
}));
console.log('  anonymity stated: ' + await page.evaluate(() =>
  Array.from(document.querySelectorAll('#main .hint')).some(x => /no names/i.test(x.textContent))));
await page.screenshot({ path: OUT + 'health-weekly.png', fullPage: true });

// editing an answered week reopens with the answers in place
await page.click('#weekEdit'); await page.waitForTimeout(800);
console.log('\nedit reopens prefilled: ' + await page.evaluate(() => {
  const sl = document.querySelector('[data-wslide="clarity"]');
  return !!sl && Number(sl.value) === 9;
}));

// a week WITH a previous week shows progress/regress per question
await page.evaluate((wk) => { S.healthWeek = wk; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, NOWWK);
await page.waitForTimeout(1000);
console.log('\nweek ' + NOWWK + ' (has a prior week):');
console.log('  trend badges: ' + await page.$$eval('#main .trend', e => e.length));
console.log('  sample: ' + await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('#main h3')).find(x => /Against last week/.test(x.textContent));
  if (!h) return 'no section';
  return Array.from(h.nextElementSibling.querySelectorAll('.row')).slice(0, 3)
    .map(r => r.textContent.trim().replace(/\s+/g, ' ')).join('  |  ');
}));
console.log('  up vs down badges: ' + await page.$$eval('#main .trend', e => {
  const u = e.filter(x => x.classList.contains('up')).length;
  const d = e.filter(x => x.classList.contains('down')).length;
  const f = e.filter(x => x.classList.contains('flat')).length;
  return u + ' up, ' + d + ' down, ' + f + ' flat';
}));

// 10b. Khmer toggle over the new markup
// a week WITH a previous week shows progress/regress per question
await page.evaluate((wk) => { S.healthWeek = wk; S.weekDraft = null; S.weekDraftFor = null; S.weekForm = null; render(); }, NOWWK);
await page.waitForTimeout(1000);
console.log('\nweek ' + NOWWK + ' (has a prior week):');
console.log('  trend badges: ' + await page.$$eval('#main .trend', e => e.length));
console.log('  sample: ' + await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('#main h3')).find(x => /Against last week/.test(x.textContent));
  if (!h) return 'no section';
  return Array.from(h.nextElementSibling.querySelectorAll('.row')).slice(0, 3)
    .map(r => r.textContent.trim().replace(/\s+/g, ' ')).join('  |  ');
}));
console.log('  up vs down badges: ' + await page.$$eval('#main .trend', e => {
  const u = e.filter(x => x.classList.contains('up')).length;
  const d = e.filter(x => x.classList.contains('down')).length;
  const f = e.filter(x => x.classList.contains('flat')).length;
  return u + ' up, ' + d + ' down, ' + f + ' flat';
}));

// 10b. Khmer toggle over the new markup
await page.click('#langBtn');
await page.waitForTimeout(900);
console.log('Khmer toggle ok:   ' + await page.evaluate(() => /[ក-៿]/.test(document.body.innerText)));

console.log('\nERRORS: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
await browser.close();
server.close();
/* process.exitCode is how the drift checks above fail — a bare
   process.exit(errors.length ? 1 : 0) threw their verdict away, so every one of
   them could only ever print. */
process.exit(errors.length || process.exitCode ? 1 : 0);
