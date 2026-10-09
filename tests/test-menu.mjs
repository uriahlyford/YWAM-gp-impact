/* The hamburger menu, by who you are — in sections, nothing you can't open.

   Everyone: My Ministry, Leave Request; Operations → Weekly schedules.
   Hospitality (members, leaders) also SR Hospitality. Applications → the
   YWAM GP Portal for admins, portal staff and the Outreach Teams leader.
   Admin → HR (admins, or anyone given hr) and Admin (admins). The Weekly
   Check-in (the Health tab is its home) and the GP Dashboard (hidden for now)
   are gone. Every name is made up. */
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
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], ministries: [], staffType: 'campus', role: '' };
const WHO = {
  staff: { ...base, id: 's1', name: 'Staff Example', username: 'staff', dept: 'Community Service', ministry: 'Cafe' },
  hosp: { ...base, id: 's2', name: 'Host Example', username: 'host', dept: 'Skills Training', ministry: 'Hospitality', hospitality: true },
  hospLeader: { ...base, id: 's3', name: 'Lead Host', username: 'leadhost', dept: 'Community Service', ministry: 'Cafe', leads: ['Skills Training|Hospitality'], hospitality: true },
  teamsLeader: { ...base, id: 's4', name: 'Teams Lead', username: 'teamslead', dept: 'Community Service', ministry: 'Outreach Teams', leads: ['Community Service|Outreach Teams'], portal: true },
  cafeLeader: { ...base, id: 's5', name: 'Cafe Lead', username: 'cafelead', dept: 'Community Service', ministry: 'Cafe', leads: ['Community Service|Cafe'] },
  hr: { ...base, id: 's6', name: 'HR Example', username: 'hrx', dept: 'Community Service', ministry: 'Cafe', hr: true },
  admin: { ...base, id: 's7', name: 'Admin Example', username: 'admx', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true, hospitality: true, portal: true },
};
const browser = await chromium.launch({ executablePath: CHROMIUM });
async function menuOf(who) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}');
    let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [who], logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [],
      ministry: null, personal: { ok: true, entries: {} }, trips: { ok: true, trips: [], totals: {} }, tripRequests: [], base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'getMySchedules') out = { ok: true, now: {}, next: {}, canEdit: {} };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4489/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(300);
  await page.click('#menuBtn'); await page.waitForTimeout(200);
  const out = await page.evaluate(() => [].map.call(document.querySelectorAll('.drawer .drawerSection, .drawer [data-menu-item]'), el => el.classList.contains('drawerSection') ? '# ' + el.textContent : el.getAttribute('data-menu-item')).join(' '));
  await ctx.close();
  return { out, errors };
}
const EXPECT = {
  staff: 'leave library profile # Operations sched',
  hosp: 'leave library profile # Operations sched hosp',
  hospLeader: 'leave library profile # Operations sched hosp',
  teamsLeader: 'leave library profile # Operations sched # Applications portal',
  cafeLeader: 'leave library profile # Operations sched',
  hr: 'leave library profile # Operations sched # Admin hr',
  admin: 'leave library profile # Operations sched hosp # Applications portal # Admin hr admin',
};
for (const k of Object.keys(EXPECT)) {
  const { out, errors } = await menuOf(WHO[k]);
  ok(k + ': ' + EXPECT[k], out === EXPECT[k] && errors.length === 0, out + (errors.length ? ' | ' + errors.join(' | ') : ''));
}
await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
