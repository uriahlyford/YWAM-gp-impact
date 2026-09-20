/* My Ministry, redesigned: one page with two tabs (Numbers / OKRs), a
   dashboard of the ministry's own figures, a week strip that shows which
   weeks have nothing logged, one button that unfolds the whole metric form,
   the person's own four numbers, and an editor only a leader sees.

   Drives the real page. The ministry data is stubbed so the strip has
   something to say — three of the last eight weeks logged, five not. */
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
await new Promise(r => server.listen(4492, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const WK = (() => { const d = new Date(), y = d.getFullYear(), j = new Date(y, 0, 1), m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - m) / (7 * 86400000)) + 1)); })();

const LEADER = { id: 'st1', name: 'Sreilea Chan', username: 'sreilea', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Cafe manager', photo: '', mentorId: '', isAdmin: false, leads: ['Community Service|Cafe'] };
const MEMBER = { ...LEADER, id: 'st2', name: 'Dara Pen', username: 'dara', role: 'Barista', leads: [] };
const MINISTRY = { ok: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  entries: { 'Cups Sold': { [WK - 2]: 250, [WK - 1]: 270, [WK]: 286 }, 'Days Open': { [WK - 1]: 6 },
    'Total in Bank Account ($)': { [WK - 1]: 1450 }, 'Weekly Profit ($)': { [WK - 1]: 120, [WK]: 140 } },
  daily: {}, prev: {}, pins: [] };
const PERSONAL = { ok: true, entries: { 'One-on-Ones Held': { [WK - 1]: 2 } } };
const OVERRIDES = [{ campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', hidden: [], custom: ['Latte Art Score (1-10)'], cadence: {} }];

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [LEADER, MEMBER], logs: [], habits: null, mentees: [], mentorRequests: [],
      goals: [], checkins: [], ministry: MINISTRY, personal: PERSONAL,
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [],
      base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: OVERRIDES } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'saveMyPersonalWeek') out = { ok: true, entries: { 'One-on-Ones Held': { [WK]: 3 } } };
    else if (b.fn === 'renameCustomMetric') out = { ok: true, metricOverrides: [{ ...OVERRIDES[0], custom: ['Latte Art (1-10)'] }] };
    else if (b.fn === 'getMyMinistry') out = MINISTRY;
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4492/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(700);
  return { ctx, page, errors, sent };
}

console.log('=== the leader’s page ===');
{
  const { ctx, page, errors, sent } = await open(LEADER);
  await page.click('#goMinistryFromMe');
  await page.waitForTimeout(600);
  const s = await page.evaluate(() => ({
    tabs: [].map.call(document.querySelectorAll('[data-mmtab]'), b => b.getAttribute('data-mmtab')),
    tiles: document.querySelectorAll('.mmTile').length,
    dots: document.querySelectorAll('.wkDot').length, onDots: document.querySelectorAll('.wkDot.on').length,
    status: (document.querySelector('.mmStatus') || {}).textContent || '',
    btn: (document.querySelector('#kpiInputBtn') || {}).textContent || '',
    formShowing: !!document.querySelector('#kpiDayCard'),
    ledBy: document.body.innerText.includes('Led by'),
    editor: !!document.querySelector('[data-acc="kpiMetrics"]'),
    personal: document.querySelectorAll('[data-personal]').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  ok('two tabs: Numbers and OKRs', JSON.stringify(s.tabs) === '["ministry","okr"]', s.tiles);
  ok('the dashboard shows the ministry’s own metrics as tiles', s.tiles === 6, s.tiles);
  /* This week is in the current quarter by definition, so a count logged
     this week must show a real quarter total — "—" here meant the quarter
     was being passed to aggregate() 1-based when qOf() is 0-based. */
  const cups = await page.evaluate(() => {
    const tile = [].find.call(document.querySelectorAll('.mmTile'), el => /Cups Sold/.test(el.textContent));
    return tile ? tile.querySelector('.mmTileNum').textContent.trim() : '(no tile)';
  });
  ok('a count logged this week shows a real quarter total, not —', /^\d/.test(cups) && Number(cups.replace(/,/g, '')) >= 286, cups);
  ok('the strip covers the last eight weeks', s.dots === 8, s.dots);
  ok('and marks exactly the weeks that have numbers in', s.onDots === 3, s.onDots);
  ok('this week reads as logged', /is logged/.test(s.status), s.status);
  ok('the form is folded away until asked for', !s.formShowing && /Edit this week/.test(s.btn), s.btn);
  ok('the leader is named', s.ledBy);
  ok('the leader sees “Edit what we track”', s.editor);
  ok('the personal numbers are off the page for now — the ministry is the focus', s.personal === 0, s.personal);
  ok('nothing scrolls sideways', !s.overflow);

  // an unlogged week reads as such, and the button changes with it
  await page.click('[data-kpigoto="' + (WK - 4) + '"]');
  await page.waitForTimeout(400);
  const s2 = await page.evaluate(() => ({ status: document.querySelector('.mmStatus').textContent, btn: document.querySelector('#kpiInputBtn').textContent }));
  ok('tapping a hollow week says nothing is logged for it', /Nothing logged/.test(s2.status), s2.status);
  ok('and offers to input it rather than edit it', /Input this week/.test(s2.btn), s2.btn);

  await page.click('#kpiInputBtn');
  await page.waitForTimeout(400);
  const s3 = await page.evaluate(() => ({ day: !!document.querySelector('#kpiDayCard'), week: !!document.querySelector('#kpiWeekCard'),
    dup: (function () { const ids = [].map.call(document.querySelectorAll('[id]'), e => e.id); return ids.filter((x, i) => ids.indexOf(x) !== i); })() }));
  ok('one tap unfolds both the daily and the weekly sections', s3.day && s3.week, JSON.stringify(s3));
  ok('no duplicate element ids (the week picker moved, it was not copied)', s3.dup.length === 0, s3.dup.join(','));

  ok('the banner names the ministry whose numbers these are', await page.evaluate(() => /Cafe/.test((document.querySelector('#mmBanner') || {}).textContent || '') && /entering its numbers/.test(document.querySelector('#mmBanner').textContent)));

  await page.click('[data-acc="kpiMetrics"]');
  await page.waitForTimeout(400);
  const ed = await page.evaluate(() => ({ cadence: document.querySelectorAll('[data-metriccadence]').length, rename: document.querySelectorAll('[data-metricrename]').length }));
  ok('every count offers weekly / monthly / quarterly to the leader', ed.cadence > 0, ed.cadence);
  ok('only the custom metric offers Rename', ed.rename === 1, ed.rename);
  await page.click('[data-metricrename]');
  await page.waitForTimeout(300);
  await page.fill('#metricRenameInput', 'Latte Art (1-10)');
  await page.click('[data-metricrenamesave]');
  await page.waitForTimeout(500);
  const rn = sent.find(x => x.fn === 'renameCustomMetric');
  ok('Rename posts old and new names for this ministry', !!rn && rn.args[5] === 'Latte Art Score (1-10)' && rn.args[6] === 'Latte Art (1-10)', rn && JSON.stringify(rn.args.slice(2)));

  await page.click('[data-mmtab="okr"]');
  await page.waitForTimeout(500);
  const okr = await page.evaluate(() => ({ newBtn: !!document.querySelector('#okrNewBtn'), form: !!document.querySelector('#kpiDayCard'), h3: document.querySelector('#main h3').textContent }));
  ok('the OKR tab shows the OKR editor entry', okr.newBtn && /OKR/.test(okr.h3), okr.h3);
  ok('and none of the numbers form', !okr.form);
  ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

console.log('\n=== an ordinary member ===');
{
  const { ctx, page, errors } = await open(MEMBER);
  await page.click('#goMinistryFromMe');
  await page.waitForTimeout(600);
  const s = await page.evaluate(() => ({ editor: !!document.querySelector('[data-acc="kpiMetrics"]'), btn: !!document.querySelector('#kpiInputBtn'), personal: document.querySelectorAll('[data-personal]').length }));
  ok('a member gets no “Edit what we track” at all', !s.editor);
  ok('but can still open the form and log', s.btn);
  ok('and sees no personal numbers either', s.personal === 0);
  // the OKR entry card on My Home lands on the OKR tab of the same page
  await page.click('#ministryBack');
  await page.waitForTimeout(400);
  await page.click('#goOkrFromMe');
  await page.waitForTimeout(500);
  ok('the OKRs card on My Home opens My Ministry on its OKR tab', await page.evaluate(() => S.view === 'ministry' && S.mmTab === 'okr' && !!document.querySelector('[data-mmtab="okr"].on')));
  ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
