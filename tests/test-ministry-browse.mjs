/* My Ministry's "YWAM {campus} Ministries" picker — jump to any department
   and ministry without needing to oversee it. An admin can reach anything on
   their own campus; everyone else's picker resolves to just the ministry
   they already work in. Two things matter beyond the picker rendering at
   all: an admin is actually authorized server-side to read/save a ministry
   outside their own chain (canLogFor_), and the Save Week button on a
   browsed ministry reports the RIGHT department — oversightKpiCardHtml_ is
   shared with the "Ministries You Oversee" loop, which used to assume
   myOversightDept_() for every Save Week click; a browsed ministry in some
   other department needs its own dept remembered (S.ovDeptOf), not the
   overseer's. */
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
process.env.GP_LEADER_CODE = 'leadercode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = {
  id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet',
  dept: 'Youth Education', ministry: 'Sports', isAdmin: true, active: true,
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
  mem.staff = [ADMIN, MEMBER].map(function (s) {
    return { ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) };
  });
  mem.entries = [];
  mem.kpiDaily = [];
}

seed();
let r = await call('getMinistryFor', ['uriah', '1234', 'Community Service', 'Outreach Teams']);
ok('an admin can read a ministry outside their own department', r.body && r.body.ok === true, JSON.stringify(r.body));

r = await call('saveMinistryFor', ['uriah', '1234', 'Community Service', 'Cafe', 34,
  [{ metric: 'Total in Bank Account ($)', value: 900 }]]);
ok('an admin can save a week-level figure for a ministry they neither work in nor oversee',
  r.body && r.body.ok === true && r.body.entries['Total in Bank Account ($)']['34'] === 900, JSON.stringify(r.body));

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

const BOOT_ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Youth Education', ministry: 'Sports', role: '', photo: '', mentorId: '', isAdmin: true };
const CAFE_DATA = { ok: true, entries: { 'Days Open': { '34': 5 } }, prev: {}, daily: {} };
const savedCalls = [];

const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_CONN/.test(m.text())) errs.push('console: ' + m.text()); });
await p.route('**/.netlify/functions/api', r => {
  const q = JSON.parse(r.request().postData() || '{}');
  let o = { ok: true };
  if (q.fn === 'getMyBoot') o = {
    ok: true, staff: BOOT_ADMIN, profile: { email: 'x@example.com' }, roster: [BOOT_ADMIN], logs: [], habits: null,
    mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null,
    trips: { ok: true, trips: [], totals: {}, ptoCap: 30 }, tripRequests: [], oneOnOnes: [],
    base: { leader: false, entries: { poipet: {} }, okrs: [], survey: [], roster: [] }
  };
  else if (q.fn === 'teamRoster') o = [BOOT_ADMIN];
  else if (q.fn === 'staffLogin') o = { ok: true, staff: BOOT_ADMIN, profile: {} };
  else if (q.fn === 'getMinistryFor') o = CAFE_DATA;
  else if (q.fn === 'saveMinistryFor') { savedCalls.push(q.args); o = CAFE_DATA; }
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

const hasPicker = await p.evaluate(() => document.querySelector('#main').innerText.includes('YWAM'));
ok('the picker shows on My Ministry', hasPicker);

const deptOptions = await p.$$eval('#mmBrowseDeptSel option', os => os.map(o => o.value));
ok('an admin sees more than one department in the picker', deptOptions.length > 1, deptOptions.join(', '));

await p.selectOption('#mmBrowseDeptSel', 'Community Service');
await p.waitForTimeout(400);
await p.selectOption('#mmBrowseMinSel', 'Cafe').catch(() => {});
await p.waitForTimeout(600);
await p.click('[data-acc="Cafe|week"][data-accbucket="ovAcc"]').catch(() => {});
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
  ok('and it named the browsed ministry’s OWN department, not the admin’s (dept-mixup regression)',
    savedCalls[0][2] === 'Community Service' && savedCalls[0][3] === 'Cafe', JSON.stringify(savedCalls[0]));
}
ok('no console/page errors', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
