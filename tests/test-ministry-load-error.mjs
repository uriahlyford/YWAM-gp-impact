/* My Ministry when another ministry's numbers fail to load.

   The picked ministry's numbers are fetched on demand (getMinistryFor). If
   that request crashes (a 500) or times out, the page used to keep "Loading…"
   for ever — the loading flag stayed set and nothing retried. Now the card
   says it couldn't load, shows the server's own error text, and offers Try
   again; a good answer on the retry brings the numbers in. The Teams
   Database page gets the same treatment for getTeamTrips. */
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
await new Promise(r => server.listen(4496, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], active: true };
const ADMIN = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true };
const SOK = { ...base, id: 'st_sok', name: 'Sok Chan', username: 'sok', dept: 'Community Service', ministry: 'Outreach Teams', role: '' };

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who, failFn) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], sent = [];
  let failing = true;
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION|500/.test(m.text())) errors.push('console: ' + m.text()); });
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b.fn);
    if (b.fn === failFn && failing) { r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: "Cannot read properties of undefined (reading 'week')" }) }); return; }
    let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [ADMIN, SOK], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] }, teamTrips: null };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'getMinistryFor') out = { ok: true, campus: 'siemreap', dept: b.args[2], ministry: b.args[3], entries: { 'Cups Sold': { 1: 12 } }, daily: {}, prev: {}, pins: [] };
    else if (b.fn === 'getTeamTrips') out = { ok: true, campus: 'siemreap', trips: [], canEdit: true };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4496/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.click('#goMinistryFromMe');
  await page.waitForTimeout(800);
  return { ctx, page, errors, sent, recover: () => { failing = false; } };
}

console.log('=== another ministry’s numbers crash on the server ===');
{
  const { ctx, page, errors, sent, recover } = await open(ADMIN, 'getMinistryFor');
  const s = await page.evaluate(() => ({ loading: document.body.innerText.includes('Loading…'), retry: !!document.querySelector('#ovRetry'),
    text: (document.querySelector('#ovRetry') ? document.querySelector('#ovRetry').closest('.card').innerText : ''), toast: document.body.innerText }));
  ok('the page does not sit on “Loading…”', !s.loading, s.loading);
  ok('it says the numbers could not load and shows the server’s own words', s.retry && /Couldn’t load/.test(s.text) && /reading 'week'/.test(s.text), s.text.replace(/\n/g, ' | '));
  ok('one request was made, not a storm', sent.filter(f => f === 'getMinistryFor').length === 1, sent.filter(f => f === 'getMinistryFor').length);
  recover();
  await page.click('#ovRetry');
  await page.waitForTimeout(700);
  const s2 = await page.evaluate(() => ({ retry: !!document.querySelector('#ovRetry'), tiles: document.querySelectorAll('.mmTile').length, strip: !!document.querySelector('.wkStrip'), btn: !!document.querySelector('#kpiInputBtn') }));
  ok('Try again asks once more', sent.filter(f => f === 'getMinistryFor').length === 2);
  ok('and a good answer brings the dashboard, the week strip and the input button', !s2.retry && s2.tiles > 0 && s2.strip && s2.btn, JSON.stringify(s2));
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('\n=== the Teams Database when the teams crash on the server ===');
{
  const { ctx, page, errors, sent, recover } = await open(SOK, 'getTeamTrips');
  await page.click('#goTeamsDb');
  await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({ loading: document.body.innerText.includes('Loading…'), retry: !!document.querySelector('#teamRetry'), text: document.body.innerText }));
  ok('the Teams Database does not sit on “Loading…” either', !s.loading && s.retry && /Couldn’t load the teams/.test(s.text) && /reading 'week'/.test(s.text));
  recover();
  await page.click('#teamRetry');
  await page.waitForTimeout(700);
  ok('Try again brings the teams page in', await page.$('#teamAddBtn') !== null && await page.$('#teamRetry') === null);
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
