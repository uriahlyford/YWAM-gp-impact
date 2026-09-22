/* Base health → "Quarter by quarter": this year's quarters side by side.
   The Staff Health Score as a column per quarter with the rise or fall on
   the quarter before, and every question as its own small column chart
   with the same ▲/▼ — on the Health tab (both campuses) and as "By quarter"
   slides in the export deck, drawn from one model so both say the same. */
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
await new Promise(r => server.listen(4489, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const NOWWK = (() => { const y = new Date().getFullYear(), j = new Date(y, 0, 1);
  const m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((new Date() - m) / (7 * 86400000)) + 1)); })();
const qOf = w => Math.min(3, Math.floor((w - 1) / 13));
const CURQ = qOf(NOWWK);            // 0-3, the roll-up's own 13-week blocks
const Y = new Date().getFullYear();

/* Three people in Q1 (week 5), three in Q2 (week 18), four this week. If the
   run lands in Q1 or Q2 the earlier fixtures share a quarter with "now" —
   the expectations below are computed from the same rows, so the test still
   means what it says whenever it runs. */
const row = (w, i, s) => ({ campus: 'poipet', week: w, device: 'dev' + i, lonely: s.lonely, clarity: s.clarity, growth: s.growth,
  porn: s.porn, oneOnOne: s.oo, exercise: s.ex, quietTime: 1, debt: s.debt, langHours: s.lh, minHours: 3, sharedFaith: s.sf, sabbath: s.sab });
const SURVEY = [
  ...[0, 1, 2].map(i => row(5, i, { lonely: 4, clarity: 5, growth: 5, porn: i === 0 ? 1 : 0, oo: 0, ex: i < 1 ? 1 : 0, debt: 1, lh: 1, sf: 0, sab: i < 2 ? 1 : 0 })),
  ...[0, 1, 2].map(i => row(18, i, { lonely: 3, clarity: 6, growth: 6, porn: 0, oo: i < 2 ? 1 : 0, ex: i < 2 ? 1 : 0, debt: i === 0 ? 1 : 0, lh: 2, sf: i < 1 ? 1 : 0, sab: 1 })),
  ...[0, 1, 2, 3].map(i => row(NOWWK, i, { lonely: 2, clarity: 8, growth: 7, porn: 0, oo: 1, ex: i < 3 ? 1 : 0, debt: 0, lh: 3, sf: i < 2 ? 1 : 0, sab: 1 })),
];
/* The same composite the app uses (taxonomy.js compositeOf), for the expectations. */
const composite = r => { const p = [10 - r.lonely, r.clarity, r.porn ? 0 : 10, r.oneOnOne ? 10 : 0, r.exercise ? 10 : 0, r.quietTime ? 10 : 0, r.debt ? 0 : 10, r.growth, r.sharedFaith ? 10 : 0, r.sabbath ? 10 : 0]; return p.reduce((a, b) => a + b, 0) / p.length; };
const inQ = q => SURVEY.filter(r => qOf(r.week) === q);
const avgScore = q => { const rs = inQ(q); return rs.length ? rs.reduce((s, r) => s + composite(r), 0) / rs.length : null; };
const pct = (q, id) => { const rs = inQ(q); return rs.length ? Math.round(rs.filter(r => r[id]).length / rs.length * 100) : null; };
const pctChange = (a, b) => (a === null || b === null || a === 0) ? null : Math.round((b - a) / Math.abs(a) * 100);
const quartersWithData = [0, 1, 2, 3].filter(q => q <= CURQ && inQ(q).length);
const lastQ = quartersWithData[quartersWithData.length - 1], prevQ = quartersWithData[quartersWithData.length - 2];

const person = (campus) => ({ id: 'st1', name: 'Sokha Chan', username: 'sokha', campus, dept: 'Community Service', ministry: 'Cafe', role: 'Barista', photo: '', mentorId: '', isAdmin: false });
const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
async function open(campus) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  const ME = person(campus);
  const roster = [ME, ...['a', 'b', 'c', 'd'].map(u => ({ ...ME, id: 'st_' + u, username: u, name: 'Staff ' + u }))];
  const base = { leader: false, entries: {}, okrs: [], survey: SURVEY.map(r => ({ ...r, campus })), roster, metricOverrides: [] };
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster, logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null,
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base };
    else if (b.fn === 'getData') out = base;
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
  await page.goto('http://localhost:4489/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom [data-tab="health"]', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.click('nav.bottom [data-tab="health"]');
  await page.waitForTimeout(400);
  return { ctx, page };
}

/* ---------- Poipet: the page ---------- */
{
  const { ctx, page } = await open('poipet');
  const opts = await page.$$eval('#healthScopeSel option', o => o.map(x => x.value));
  ok('the View picker offers Quarter by quarter', opts.includes('quarters'), opts.join(','));
  await page.selectOption('#healthScopeSel', 'quarters');
  await page.waitForTimeout(400);
  ok('the week/quarter tiles give way to the quarter view', !(await page.$('#main .stat.gold')) && !!(await page.$('#main .hqCols.big')));

  const cols = await page.$$eval('#main .hqCols.big .hqBar', b => b.length);
  ok('one column per quarter that has check-ins', cols === quartersWithData.length, cols + ' of ' + (CURQ + 1) + ' quarters drawn');
  ok('only quarters up to the current one are on the axis', (await page.$$eval('#main .hqCols.big .hqQ', q => q.length)) === CURQ + 1);
  const caps = await page.$$eval('#main .hqCols.big .hqVal:not(.muted)', v => v.map(x => x.textContent));
  ok('every column carries its score on the cap', caps.join(',') === quartersWithData.map(q => avgScore(q).toFixed(1)).join(','), caps.join(','));
  ok('the latest quarter is the emphasised column', await page.$$eval('#main .hqCols.big .hqBar', b => b.filter(x => x.classList.contains('on')).length === 1 && b[b.length - 1].classList.contains('on')));
  ok('columns stay thin — a mark, not a slab', await page.$eval('#main .hqCols.big .hqBar', b => b.getBoundingClientRect().width <= 30), 'px');

  const hero = await page.$eval('#main .hqCols.big', c => c.closest('.card').textContent);
  ok('the hero is the latest quarter’s score', hero.includes(avgScore(lastQ).toFixed(1)) && new RegExp('Q' + (lastQ + 1) + ' so far').test(hero));
  if (prevQ !== undefined) {
    const d = pctChange(avgScore(prevQ), avgScore(lastQ));
    ok('with the change on the quarter before', new RegExp((d > 0 ? '▲' : d < 0 ? '▼' : '—') + ' ' + Math.abs(d) + '%[\\s\\S]*vs Q' + (prevQ + 1)).test(hero), (d > 0 ? '▲ ' : '▼ ') + Math.abs(d) + '% vs Q' + (prevQ + 1));
    const deltas = await page.$$eval('#main .hqCols.big .hqDelta', d => d.map(x => x.textContent));
    ok('and a ▲/▼ under every quarter after the first', deltas.length === quartersWithData.length - 1, deltas.join(' '));
    ok('a rise in the score is painted good', await page.$$eval('#main .hqCols.big .hqDelta', d => d.every(x => (x.textContent.startsWith('▲') ? x.classList.contains('good') : !x.classList.contains('good')))));
  } else {
    ok('a single quarter says the change is still to come', /two quarters/.test(hero));
  }

  const minis = await page.$$eval('#main .hqMini', m => m.map(x => ({ name: x.querySelector('.rowName').textContent, val: x.querySelector('.rowVal').textContent, bars: x.querySelectorAll('.hqBar').length })));
  ok('every question has its own small chart — four scales, seven habits', minis.length === 11, minis.map(m => m.name).join(' | '));
  const sf = minis.find(m => /Shared their faith/.test(m.name));
  ok('a habit mini shows the latest quarter’s percentage', sf && sf.val.includes(pct(lastQ, 'sharedFaith') + '%'), sf && sf.val);
  if (prevQ !== undefined) {
    const d = pctChange(pct(prevQ, 'sharedFaith'), pct(lastQ, 'sharedFaith'));
    ok('with its own change on the quarter before', d === null ? !/[▲▼]/.test(sf.val) : sf.val.includes(Math.abs(d) + '%'), sf.val);
    const debt = minis.find(m => /staff debt/.test(m.name));
    const dd = pctChange(pct(prevQ, 'debt'), pct(lastQ, 'debt'));
    ok('a drop in debt reads as good', dd === null || dd >= 0 || await page.$$eval('#main .hqMini', m => { const x = m.find(y => /staff debt/.test(y.textContent)); return x && x.querySelector('.trend.up'); }), debt && debt.val);
  }
  ok('columns carry a hover title with quarter and value', await page.$eval('#main .hqCols.big .hqBar title', t => /^Q\d: \d/.test(t.textContent)));
  ok('no person is named on the page', !(await page.$eval('#main', e => /Sokha|Staff a|dev0/.test(e.textContent))));

  // The export from this view carries the quarter slides.
  await page.click('#main [data-healthexport="health"]');
  await page.waitForSelector('#hxRoot .hxOverlay');
  const kinds = await page.evaluate(() => S.hx.slides.map(s => s.kind));
  ok('the deck gains a score-by-quarter slide and three small-multiple slides', kinds.filter(k => k === 'qchart').length === 1 && kinds.filter(k => k === 'qmulti').length === 3, kinds.join(','));
  ok('exported from Quarter by quarter, the cover is the year', /\b\d{4}\b/.test(await page.$eval('#hxRoot .hxCover .hxWhen', e => e.textContent)));
  const qi = kinds.indexOf('qchart');
  await page.click('[data-hxgo="' + qi + '"]');
  const qs = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('the slide titles the score by quarter and repeats the caps', /Staff Health Score by quarter/.test(qs) && quartersWithData.every(q => qs.includes(avgScore(q).toFixed(1))));
  ok('its columns are the same SVG as the page', (await page.$$eval('#hxRoot .hxFrame.on .hqBar', b => b.length)) === quartersWithData.length);
  await page.click('[data-hxgo="' + (qi + 2) + '"]');
  const hm = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('a habits-by-quarter slide carries four questions with their latest value', /Shared their faith/.test(hm) && /Exercised 3\+ days/.test(hm) && (await page.$$eval('#hxRoot .hxFrame.on .hqCols', c => c.length)) === 4);
  const inked = await page.evaluate(k => new Promise(res => { hxCanvas_(S.hx.slides[k], c => {
    const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
    const bg = [d[c.width * 4 * 450 + 4 * 1500], d[c.width * 4 * 450 + 4 * 1500 + 1], d[c.width * 4 * 450 + 4 * 1500 + 2]];
    let diff = 0; for (let i = 0; i < d.length; i += 64) if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 60) diff++;
    res(diff);
  }); }), qi);
  ok('the score-by-quarter slide draws columns on the PNG too', inked > 800, inked + ' sampled pixels differ from the background');
  await page.keyboard.press('Escape');
  await ctx.close();
}

/* ---------- Siem Reap: the same view, its own series ---------- */
{
  const { ctx, page } = await open('siemreap');
  const opts = await page.$$eval('#srScopeSel option', o => o.map(x => x.value));
  ok('Siem Reap’s picker offers Quarter by quarter too', opts.includes('quarters'), opts.join(','));
  await page.selectOption('#srScopeSel', 'quarters');
  await page.waitForTimeout(400);
  ok('the trend line and bars give way to the quarter view', !(await page.$('#main .srBars')) && !!(await page.$('#main .hqCols.big')));
  // Its habit figures come from the import-plus-live series: the quarter
  // picker's own bar for the last quarter is the mini's latest value.
  await page.selectOption('#srScopeSel', 'quarter');
  await page.waitForTimeout(200);
  await page.selectOption('#srQSel', String(lastQ + 1));
  await page.waitForTimeout(300);
  const barPct = await page.$$eval('#main .srBarItem', items => { const b = items.find(i => /Took a sabbath/.test(i.textContent)); return b ? b.querySelector('.srBarPct').textContent.trim() : ''; });
  await page.selectOption('#srScopeSel', 'quarters');
  await page.waitForTimeout(400);
  const sab = await page.$$eval('#main .hqMini', m => { const x = m.find(y => /Took a sabbath/.test(y.textContent)); return x ? x.querySelector('.rowVal').textContent : ''; });
  ok('a Siem Reap habit’s latest quarter matches the card’s own bar', barPct && sab.startsWith(barPct), barPct + ' vs ' + sab);
  ok('imported quarters with no live rows still draw a column', (await page.$$eval('#main .hqMini', m => { const x = m.find(y => /Took a sabbath/.test(y.textContent)); return x.querySelectorAll('.hqBar').length; })) >= quartersWithData.length);
  await ctx.close();
}

ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
