/* The bell drawer used to show every notification as plain text, even ones
   that carry an action button on the inline "Updates" card (the email nudge,
   a leave request, a 1-on-1). Opening the bell only ever calls
   renderNotifPanel(), not a full render()/bind() pass, so a button drawn
   there needs its own click handler wired up in that same function — this
   checks the email nudge's "Add it" button actually works from the drawer,
   not just the inline card. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
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
await new Promise(res => srv.listen(4413, res));

const DARA = { id: 'st_dara', name: 'Dara Pich', username: 'dara', campus: 'poipet', dept: 'Base Leadership', ministry: 'Campus Leadership', role: 'Base director', photo: '', mentorId: '' };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  // No email on this profile, on purpose — that's what puts the nudge in the bell.
  if (q.fn === 'getMyBoot') o = {
    ok: true, staff: DARA, profile: {}, roster: [DARA], logs: [], habits: null,
    mentees: [], mentorRequests: [], goals: [], checkins: [],
    trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [], ministry: null,
    base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [] }
  };
  else if (q.fn === 'teamRoster') o = [DARA];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: DARA, profile: {} };
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'dara', pin: '1234' })));
await p.goto('http://localhost:4413/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);

const bellBtn = await p.$('#bellBtn');
ok('the bell is on the page', !!bellBtn);
await bellBtn.click();
await p.waitForTimeout(300);

const drawerText = await p.evaluate(() => (document.querySelector('#notifRoot .drawer') || {}).innerText || '');
ok('the email nudge is in the drawer', /email/i.test(drawerText), drawerText.slice(0, 200));
const addItBtn = await p.$('#notifRoot [data-goprofile]');
ok('the drawer renders an actual button for it, not just text', !!addItBtn);

if (addItBtn) {
  await addItBtn.click();
  await p.waitForTimeout(500);
  const view = await p.evaluate(() => S.view);
  ok('clicking it opens Profile', view === 'profile', view);
  const bellStillOpen = await p.evaluate(() => S.bellOpen);
  ok('and the drawer closes behind it', bellStillOpen === false);
}

ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
