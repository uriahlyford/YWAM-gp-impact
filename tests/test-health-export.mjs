/* Base health → Export as slides, in the browser: the button sits on the
   Health tab (both campuses) and on Base's health row; it opens a full-screen
   deck whose figures are the same pooled numbers the page prints, in big
   type; the deck moves by arrow, dot, key and tap; a slide saves as a PNG
   the size of a screen; and Escape closes it without touching the page
   underneath. Nothing about any one person is on a slide. */
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
const NOWWK = (() => { const y = new Date().getFullYear(), j = new Date(y, 0, 1);
  const m = new Date(y, 0, 1 - ((j.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((new Date() - m) / (7 * 86400000)) + 1)); })();

/* Four devices this week, three last week — enough that every percentage
   on the slides is a real fraction, not 0 or 100. */
const survey = (campus) => [NOWWK, NOWWK - 1].flatMap((w, wi) => [0, 1, 2, 3].slice(0, 4 - wi).map(i => ({
  campus, week: w, device: 'dev' + i, lonely: 2 + i, clarity: 6 + (i % 3), growth: 5 + i,
  porn: i === 3 ? 1 : 0, oneOnOne: i % 2, exercise: i < 3 ? 1 : 0, quietTime: 1, debt: i === 0 ? 1 : 0,
  langHours: 1 + i, minHours: 3, sharedFaith: i % 2, sabbath: 1
})));
const person = (campus) => ({ id: 'st1', name: 'Sokha Chan', username: 'sokha', campus, dept: 'Community Service', ministry: 'Cafe', role: 'Barista', photo: '', mentorId: '', isAdmin: false });
const mate = (campus) => ({ id: 'st2', name: 'Mealea Sok', username: 'mealea', campus, dept: 'Youth Education', ministry: 'YDC', role: 'Teacher', photo: '', mentorId: '' });

const browser = await chromium.launch({ executablePath: CHROMIUM });
const errors = [];
async function open(campus) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  const ME = person(campus), MATE = mate(campus);
  const base = { leader: false, entries: {}, okrs: [], survey: survey(campus), roster: [ME, MATE, { ...MATE, id: 'st3', username: 'x3' }, { ...MATE, id: 'st4', username: 'x4' }, { ...MATE, id: 'st5', username: 'x5' }], metricOverrides: [] };
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: ME, profile: {}, roster: base.roster, logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null,
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base };
    else if (b.fn === 'getData') out = base;
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' })));
  await page.goto('http://localhost:4488/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('nav.bottom [data-tab="health"]', { timeout: 15000 });
  await page.waitForTimeout(800);
  return { ctx, page };
}

/* ---------- Poipet: the plain pooled figures ---------- */
{
  const { ctx, page } = await open('poipet');
  await page.click('nav.bottom [data-tab="health"]');
  await page.waitForTimeout(500);
  const btn = await page.$('#main [data-healthexport="health"]');
  ok('Health tab has an Export as slides button under Base health', !!btn);
  ok('no deck until asked', !(await page.$('#hxRoot .hxOverlay')));
  await btn.click();
  await page.waitForSelector('#hxRoot .hxOverlay');
  const n = await page.$$eval('#hxRoot .hxFrame', f => f.length);
  ok('the deck has cover, who, scales, two habit slides and a closing slide', n === 6, n);
  ok('one slide shows at a time', (await page.$$eval('#hxRoot .hxFrame.on', f => f.length)) === 1);
  ok('the page underneath stops scrolling', await page.$eval('body', b => b.classList.contains('hxOn')));

  // Cover: this week's pooled score is what the page's own tile says.
  const pageScore = await page.$eval('#main .stat.gold .statNum', e => e.textContent.trim());
  const cover = await page.$eval('#hxRoot .hxFrame.on .hxCover', e => e.textContent);
  ok('cover carries the campus and Staff Health Score', /Poipet/.test(cover) && /Staff Health Score/.test(cover));
  ok('cover score matches the page tile', cover.replace(/\s/g, '').includes(pageScore.replace(/\s/g, '')), pageScore);
  ok('cover shows the change on last week', /[▲▼].*vs last week/.test(cover) || /0% vs last week/.test(cover), cover.match(/[▲▼]?\s*\d+% vs last week/)?.[0]);
  const coverPx = await page.$eval('#hxRoot .hxFrame.on .hxHero .hxNum', e => parseFloat(getComputedStyle(e).fontSize));
  ok('the score is big', coverPx >= 48, coverPx + 'px');
  ok('numbers are in the app’s display face', await page.$eval('#hxRoot .hxFrame.on .hxHero .hxNum', e => /Koulen/.test(getComputedStyle(e).fontFamily)));

  // Who checked in: 4 devices this week of 5 staff → 80%.
  await page.click('#hxNext');
  const who = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('slide 2 counts check-ins, people and the response rate', /4[\s\S]*check-ins logged/.test(who) && /4[\s\S]*of 5 staff answered/.test(who) && /80%[\s\S]*response rate/.test(who), who.replace(/\s+/g, ' ').slice(0, 120));
  ok('the counter moved', (await page.$eval('#hxRoot .hxCount', e => e.textContent)) === 'Slide 2 of 6');

  // Scales: the averages the page lists.
  await page.keyboard.press('ArrowRight');
  const scales = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  const pageLonely = await page.$$eval('#main .row', rows => { const r = rows.find(x => /Loneliness/.test(x.textContent)); return r ? r.querySelector('.rowVal').textContent.trim().split('/')[0] : ''; });
  ok('slide 3 has the four scale averages', /Loneliness/.test(scales) && /Clarity/.test(scales) && /Personal growth/.test(scales) && /Language study/.test(scales));
  ok('loneliness average matches the page', pageLonely && scales.includes(pageLonely + '/10'), pageLonely);

  // Habits: yes/no percentages, four then three.
  await page.click('[data-hxgo="3"]');
  const hab1 = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('slide 4 is the first four habits as percentages', /Shared their faith/.test(hab1) && /Exercised 3\+ days/.test(hab1) && /75%/.test(hab1), hab1.replace(/\s+/g, ' ').slice(0, 140));
  await page.click('#hxNext');
  const hab2 = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('slide 5 is quiet time, porn and debt', /Regular quiet time/.test(hab2) && /Looked at porn/.test(hab2) && /Have staff debt/.test(hab2) && /25%/.test(hab2));
  ok('a bad result is not painted as good', await page.$$eval('#hxRoot .hxFrame.on .hxItem', items => {
    const porn = items.find(i => /Looked at porn/.test(i.textContent));
    return porn && /var\(--(accent|good)\)/.test(porn.querySelector('.hxNum').getAttribute('style'));
  }), '25% said yes → 75% good → accent');
  ok('no name anywhere in the deck', !(await page.$eval('#hxRoot', e => /Sokha|Mealea|dev0/.test(e.textContent))));

  // Closing slide, then Save image.
  await page.click('#hxNext');
  ok('last slide is the privacy line', /Totals only — no names/.test(await page.$eval('#hxRoot .hxFrame.on', e => e.textContent)));
  ok('Next is disabled on the last slide', await page.$eval('#hxNext', b => b.disabled));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('#hxPng')]);
  ok('Save image downloads a PNG named for the campus, period and slide', /^gp-health-poipet-.*-6\.png$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  const file = await dl.path();
  const head = fs.readFileSync(file).slice(0, 8).toString('hex');
  ok('and the file really is a PNG', head === '89504e470d0a1a0a', head);
  const dims = await page.evaluate(() => new Promise(res => { hxCanvas_(S.hx.slides[0], c => res([c.width, c.height])); }));
  ok('slides render at 1600×900', dims[0] === 1600 && dims[1] === 900, dims.join('×'));
  // A drawn cover is not blank: the accent stripe plus a big number leave ink.
  const inked = await page.evaluate(() => new Promise(res => { hxCanvas_(S.hx.slides[0], c => {
    const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
    const bg = [d[c.width * 4 * 450 + 4 * 1500], d[c.width * 4 * 450 + 4 * 1500 + 1], d[c.width * 4 * 450 + 4 * 1500 + 2]];
    let diff = 0; for (let i = 0; i < d.length; i += 64) if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 60) diff++;
    res(diff);
  }); }));
  ok('the drawn cover has ink on it', inked > 500, inked + ' sampled pixels differ from the background');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('Escape closes the deck', !(await page.$('#hxRoot .hxOverlay')));
  ok('and the page scrolls again', !(await page.$eval('body', b => b.classList.contains('hxOn'))));
  ok('the Health tab is still underneath', !!(await page.$('#main [data-healthexport="health"]')));

  // Base tab's health row carries the same button.
  await page.click('nav.bottom [data-tab="base"]');
  await page.waitForTimeout(500);
  await page.evaluate(() => { S.baseAcc.health = true; render(); });
  await page.waitForTimeout(300);
  const bbtn = await page.$('#main [data-healthexport="base"]');
  ok('Base → Base Health row has the button too', !!bbtn);
  await bbtn.click();
  await page.waitForSelector('#hxRoot .hxOverlay');
  ok('it opens the same deck for this week', /Staff Health Score/.test(await page.$eval('#hxRoot .hxFrame.on', e => e.textContent)));
  await page.click('#hxClose');
  await ctx.close();
}

/* ---------- Siem Reap: the import-plus-live series ---------- */
{
  const { ctx, page } = await open('siemreap');
  await page.click('nav.bottom [data-tab="health"]');
  await page.waitForTimeout(500);
  const btn = await page.$('#main [data-healthexport="health"]');
  ok('Siem Reap’s Base health card has the button', !!btn);
  await page.selectOption('#srScopeSel', 'year');
  await page.waitForTimeout(300);
  const barPct = await page.$$eval('#main .srBarItem', items => { const b = items.find(i => /Took a sabbath/.test(i.textContent)); return b ? b.querySelector('.srBarPct').textContent.trim() : ''; });
  await page.click('#main [data-healthexport="health"]');
  await page.waitForSelector('#hxRoot .hxOverlay');
  const cover = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('the deck is for Siem Reap and the year', /Siem Reap/.test(cover) && new RegExp(String(new Date().getFullYear())).test(cover));
  await page.click('[data-hxgo="3"]');
  const hab = await page.$eval('#hxRoot .hxFrame.on', e => e.textContent);
  ok('a habit percentage is the same figure as the bar on the card', barPct && hab.includes(barPct), barPct);
  const monthly = await page.$$eval('#hxRoot .hxFrame', f => f.map(x => x.textContent).some(tx => /Monthly Check-In/.test(tx)));
  ok('the imported monthly questions get their own slide', monthly);
  await page.keyboard.press('Escape');
  await ctx.close();
}

ok('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
