/* My Ministry's picker shows only the ministries you are part of: your main
   one plus the other ministries on your profile (staff here usually serve in
   more than one). An admin is the exception: every ministry on their campus,
   in a Department / Ministry dropdown. Checked server-side (canLogFor_
   refuses anything else — an admin only off their campus; updateProfile
   keeps the list clean) and in the browser: the picker, the admin's dropdowns,
   the banner, the profile's tick boxes, and that Save Week on another of
   your ministries names THAT ministry's own department, not your main one's
   (the dept-mixup regression this file started with). */
import { REPO, PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import crypto from 'node:crypto';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* ---------- part 1: server-side authorization ---------- */
const TMP = tmpDir('ministry-browse');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js'); // and the portal's shipped forms // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = {
  id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet',
  dept: 'Youth Education', ministry: 'Sports', isAdmin: true, active: true,
};
const STAFF = {
  id: 'st_staff', name: 'Dara', username: 'dara', campus: 'poipet',
  dept: 'Youth Education', ministry: 'Sports', active: true,
};
const MEMBER = {
  id: 'st_member', name: 'Sokha', username: 'sokha', campus: 'poipet',
  dept: 'Community Service', ministry: 'Outreach Teams', active: true,
};

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [ADMIN, STAFF, MEMBER].map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
  mem.entries = [];
  mem.kpiDaily = [];
}

seed();
let r = await call('getMinistryFor', ['uriah', '1234', 'Community Service', 'Outreach Teams']);
ok('an admin opens a ministry they are not part of', r.body && r.body.ok === true, JSON.stringify(r.body).slice(0, 120));
r = await call('saveMinistryFor', ['uriah', '1234', 'Community Service', 'Cafe', 34, [{ metric: 'Total in Bank Account ($)', value: 900 }]]);
ok('and can save its numbers', r.body && r.body.ok === true && (mem.entries || []).length === 1);
r = await call('getMinistryFor', ['dara', '1234', 'Community Service', 'Cafe']);
ok('a staff member is refused a ministry they are not part of', r.body && r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));
r = await call('saveMinistryFor', ['dara', '1234', 'Community Service', 'Cafe', 34, [{ metric: 'Total in Bank Account ($)', value: 1 }]]);
ok('and cannot save its numbers', r.body && r.body.ok === false && mem.entries[0].value === 900);
seed();

r = await call('updateProfile', ['dara', '1234', { ministries: ['Community Service|Cafe', 'Youth Education|Sports', 'Community Service|Cafe', 'nonsense', 'A|B|C'] }]);
ok('the profile keeps the other ministries — no repeats, not the main one, nothing malformed', r.body.ok === true && JSON.stringify(r.body.staff.ministries) === '["Community Service|Cafe"]', JSON.stringify(r.body.staff && r.body.staff.ministries));
r = await call('saveMinistryFor', ['dara', '1234', 'Community Service', 'Cafe', 34, [{ metric: 'Total in Bank Account ($)', value: 900 }]]);
ok('with Cafe on their profile they save its numbers',
  r.body && r.body.ok === true && r.body.entries['Total in Bank Account ($)']['34'] === 900, JSON.stringify(r.body));
r = await call('saveKpiDayFor', ['dara', '1234', 'Community Service', 'Cafe', '2026-08-20', [{ metric: 'Days Open', value: 1 }]]);
ok('daily figures too', r.body && r.body.ok === true);
r = await call('getMinistryFor', ['dara', '1234', 'Community Service', 'Outreach Teams']);
ok('but still not a ministry that isn’t on it', r.body && r.body.ok === false);
r = await call('updateProfile', ['dara', '1234', { dept: 'Community Service', ministry: 'Cafe' }]);
ok('making an other ministry the main one takes it off the other list', r.body.ok === true && r.body.staff.ministry === 'Cafe' && r.body.staff.ministries.length === 0, JSON.stringify(r.body.staff.ministries));
mem.staff = mem.staff.map(x => x.id === 'st_member' ? { ...x, leads: ['Youth Education|Sports'] } : x);
r = await call('getMinistryFor', ['sokha', '1234', 'Youth Education', 'Sports']);
ok('leading a ministry lets you enter its numbers', r.body && r.body.ok === true, JSON.stringify(r.body));
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_member', { ministries: ['Youth Education|YDC'] }]);
ok('an admin can set someone’s other ministries', r.body.ok === true && JSON.stringify(r.body.staff.ministries) === '["Youth Education|YDC"]', JSON.stringify(r.body));
r = await call('getMinistryFor', ['sokha', '1234', 'Youth Education', 'YDC']);
ok('and that person can then enter them', r.body && r.body.ok === true);

seed();
r = await call('getMinistryFor', ['sokha', '1234', 'Youth Education', 'Sports']);
ok('a non-admin is still refused outside their own ministry', r.body && r.body.ok === false && r.body.err === 'not_authorized');

console.log('');
fs.rmSync(TMP, { recursive: true, force: true });

/* ---------- part 2: the picker in the browser ---------- */
const ROOT = PUBLIC;
const OUT = tmpDir('out') + '/';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, res) => {
  let p = q.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise(res => srv.listen(4416, res));

// a staff member (not an admin) who serves in Sports and Cafe; the admin gets their own block below
const BOOT_ADMIN = { id: 'st_staff', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Youth Education', ministry: 'Sports', role: '', photo: '', mentorId: '', isAdmin: false,
  ministries: ['Community Service|Cafe'] };
let bootAs = BOOT_ADMIN;
const profileSaves = [];
const CAFE_DATA = { ok: true, entries: { 'Days Open': { '34': 5 } }, prev: {}, daily: {} };
const savedCalls = [];

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN|ERR_CERT/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = {
    ok: true, staff: bootAs, profile: { email: 'x@example.com' }, roster: [bootAs], logs: [], habits: null,
    mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null,
    trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [],
    base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [], roster: [] }
  };
  else if (q.fn === 'teamRoster') o = [BOOT_ADMIN];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: BOOT_ADMIN, profile: {} };
  else if (q.fn === 'getMinistryFor') o = CAFE_DATA;
  else if (q.fn === 'saveMinistryFor') { savedCalls.push(q.args); o = CAFE_DATA; }
  else if (q.fn === 'updateProfile') { profileSaves.push(q.args[2]); o = { ok: true, staff: { ...bootAs, isAdmin: undefined, ministries: q.args[2].ministries }, profile: {} }; }
  else if (/^getMy/.test(q.fn)) o = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
});
await p.addInitScript((u) => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), BOOT_ADMIN.username);
await p.goto('http://localhost:4416/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.click('nav.bottom [data-tab="week"]');
await p.waitForTimeout(600);
await p.click('#goMinistryFromMe');
await p.waitForTimeout(700);

const chips = await p.$$eval('[data-mmpick]', b => b.map(x => x.getAttribute('data-mmpick')));
ok('the picker holds only my ministries: the main one and Cafe', JSON.stringify(chips) === '["Youth Education|Sports","Community Service|Cafe"]', JSON.stringify(chips));
ok('it opens on the main one, and says so', /Your main ministry/.test(await p.$eval('#mmBanner', e => e.textContent)));

await p.click('[data-mmpick="Community Service|Cafe"]');
await p.waitForTimeout(600);
ok('another of my ministries says it is one of mine', /One of your ministries/.test(await p.$eval('#mmBanner', e => e.textContent)));
// the browsed ministry gets the same status card as your own: its strip, and one button that unfolds its weekly rows
const browsedStrip = await p.$('#mmWeekCard .wkStrip');
ok('the browsed ministry has a week strip too', !!browsedStrip);
/* the boxes open on their own for a week with nothing in yet; tap only if they are folded */
if (!/Hide the metric form/.test(await p.$eval('#kpiInputBtn[data-ovinput="Cafe"]', b => b.textContent))) await p.click('#kpiInputBtn[data-ovinput="Cafe"]');
await p.waitForTimeout(400);

const showsCafe = await p.evaluate(() => document.querySelector('#main').innerText.includes('Days Open'));
ok('picking a different ministry loads and shows its numbers', showsCafe);

const input = await p.$('[data-ovweek="Cafe"][data-ovmetric="Days Open"]');
ok('the browsed ministry’s figures are editable, not read-only', !!input);
if (input) {
  await input.fill('9');
  await p.click('[data-ovsaveweek="Cafe"]');
  await p.waitForTimeout(500);
}
ok('saving posted exactly one saveMinistryFor call', savedCalls.length === 1, JSON.stringify(savedCalls));
if (savedCalls.length) {
  ok('and it named the browsed ministry’s OWN department, not my main one’s (dept-mixup regression)',
    savedCalls[0][2] === 'Community Service' && savedCalls[0][3] === 'Cafe', JSON.stringify(savedCalls[0]));
}

// the profile: main ministry, then tick boxes for the others
await p.evaluate(() => { S.view = 'profile'; render(); });
await p.waitForTimeout(300);
ok('the profile asks for a main ministry and the other ministries', /Main ministry/.test(await p.$eval('#main', e => e.textContent)) && !!(await p.$('#p_ministries')));
ok('Cafe is ticked, and the main ministry is not offered again', await p.$eval('[data-pmin="Community Service|Cafe"]', c => c.checked) && !(await p.$('[data-pmin="Youth Education|Sports"]')));
await p.check('[data-pmin="Community Service|Outreach Teams"]');
await p.click('#saveProfBtn');
await p.waitForTimeout(600);
ok('saving sends the ticked ministries', profileSaves.length === 1 && JSON.stringify(profileSaves[0].ministries.sort()) === '["Community Service|Cafe","Community Service|Outreach Teams"]', JSON.stringify(profileSaves));
await p.evaluate(() => { S.view = 'ministry'; S.mmBrowseDept = null; S.mmBrowseMinistry = null; render(); });
await p.waitForTimeout(300);
ok('the new ministry shows in My Ministry straight away', (await p.$$eval('[data-mmpick]', b => b.map(x => x.getAttribute('data-mmpick')))).includes('Community Service|Outreach Teams'));
ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

// an admin: every ministry on the campus, as Department / Ministry dropdowns
bootAs = { ...BOOT_ADMIN, id: 'st_admin', name: 'Uriah', username: 'uriah', isAdmin: true, ministries: [] };
await p.evaluate(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await p.addInitScript(() => localStorage.setItem('gp-staff', JSON.stringify({ user: 'uriah', pin: '1234' })));
await p.goto('http://localhost:4416/teams.html'); await p.waitForSelector('nav.bottom button', { timeout: 15000 });
await p.waitForTimeout(700);
await p.click('nav.bottom [data-tab="week"]'); await p.waitForTimeout(500);
await p.click('#goMinistryFromMe'); await p.waitForTimeout(600);
const adm = await p.evaluate(() => ({
  chips: document.querySelectorAll('[data-mmpick]').length,
  depts: [].map.call(document.querySelectorAll('#mmBrowseDeptSel option'), o => o.value),
  want: Object.keys(getDepartments('poipet')).filter(d => d !== 'Campus Leadership'),
  dept: (document.querySelector('#mmBrowseDeptSel') || {}).value, min: (document.querySelector('#mmBrowseMinSel') || {}).value,
}));
ok('an admin gets dropdowns, not chips', adm.chips === 0 && adm.depts.length > 0, JSON.stringify(adm.depts));
ok('… with every department on the campus', adm.want.every(d => adm.depts.includes(d)), JSON.stringify(adm.want.filter(d => !adm.depts.includes(d))));
ok('… opening on their own ministry', adm.dept === 'Youth Education' && adm.min === 'Sports', adm.dept + '|' + adm.min);
await p.selectOption('#mmBrowseDeptSel', 'Community Service'); await p.waitForTimeout(300);
const mins = await p.$$eval('#mmBrowseMinSel option', os => os.map(o => o.value));
ok('picking a department lists all its ministries', mins.includes('Cafe') && mins.includes('Outreach Teams'), JSON.stringify(mins));
await p.selectOption('#mmBrowseMinSel', 'Cafe'); await p.waitForTimeout(600);
ok('the banner says an admin can enter it', /As an admin you can see and enter/.test(await p.$eval('#mmBanner', e => e.textContent)));
ok('and its numbers load', await p.evaluate(() => document.querySelector('#main').innerText.includes('Days Open') || !!document.querySelector('#mmWeekCard')));
await p.evaluate(() => { S.view = 'profile'; render(); }); await p.waitForTimeout(300);
await p.click('#saveProfBtn'); await p.waitForTimeout(600);
ok('saving the profile keeps the Admin menu (the admin flag is not lost with the public card)', await p.evaluate(() => S.me.isAdmin === true));
ok('no console/page errors (admin)', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
