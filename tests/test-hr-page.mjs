/* The HR page in the browser.

   Drives the real page as an admin: the HR item in the menu with its
   renewals badge; the home page's tiles, the renewals-due list and the
   status chips; a person's page with their contracts, adding a renewal,
   attaching a file, and archiving; a staff member without HR never sees
   the menu item. */
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
const Y = new Date().getFullYear(), M = new Date().getMonth() + 1;
const ym = (y, m) => { while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } return y + '-' + ('0' + m).slice(-2); };
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], active: true, archived: null, contracts: [], joined: '', hr: false, staffType: 'ministry' };
const ADMIN = { ...base, id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'Director', isAdmin: true, staffType: 'campus' };
const DARA = { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe', role: 'Barista' };
let staff = [ADMIN,
  { ...base, id: 'st_1', name: 'Andrew Lee', username: 'andrew', dept: 'Community Service', ministry: 'Cafe', role: 'Base Leader', contracts: [{ id: 'c1', signed: ym(Y - 5, M + 1), years: 5, notes: 'first term', files: [{ id: 'f1', name: 'contract 2021.pdf', mime: 'application/pdf', size: 245000 }] }] },
  { ...base, id: 'st_2', name: 'Sreilea Chan', username: 'spicy', dept: 'Community Service', ministry: 'Cafe', contracts: [{ id: 'c2', signed: ym(Y - 3, M - 1), years: 2, files: [] }] },   // ran out about 13 months ago
  DARA,
  { ...base, id: 'st_4', name: 'Tinh Vong', username: 'tinh', dept: 'Youth Education', ministry: 'GP Media', joined: '2022', staffType: '' },
  { ...base, id: 'st_5', name: 'Sokna Non', username: 'sokna', dept: 'Community Service', ministry: 'Cafe', active: false, archived: { at: '2026-07-16', reason: 'Finished term', by: 'st_admin' } },
];

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
    const find = id => staff.find(x => x.id === id);
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: staff.filter(s => s.active), logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [], base: { leader: false, entries: {}, okrs: [], survey: [], metricOverrides: [] }, hrDue: who.isAdmin ? 2 : null };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'hrList') out = { ok: true, staff };
    else if (b.fn === 'hrSaveContract') { const p = find(b.args[2]); const c = b.args[3]; if (c.ywamSince !== undefined) p.ywamSince = c.ywamSince === '' ? null : c.ywamSince; const rec = { id: c.id || 'c_new', signed: c.signed, years: c.years, notes: c.notes, files: [] }; p.contracts = p.contracts.filter(x => x.id !== rec.id).concat([rec]).sort((a, b2) => a.signed < b2.signed ? -1 : 1); out = { ok: true, staff: p }; }
    else if (b.fn === 'hrUploadFile') { const p = find(b.args[2]); const c = p.contracts.find(x => x.id === b.args[3]); const meta = { id: 'f_new', name: b.args[4], mime: b.args[5], size: Math.floor(b.args[6].length * 3 / 4) }; c.files = c.files.concat([meta]); out = { ok: true, staff: p, file: meta }; }
    else if (b.fn === 'hrGetFile') out = { ok: true, id: b.args[2], name: 'contract 2021.pdf', mime: 'application/pdf', dataUrl: 'data:application/pdf;base64,JVBERi0xLjQ=' };
    else if (b.fn === 'hrArchive') { const p = find(b.args[2]); p.active = false; p.archived = { at: b.args[3].at, reason: b.args[3].reason, by: 'st_admin' }; out = { ok: true, staff: p }; }
    else if (b.fn === 'hrUnarchive') { const p = find(b.args[2]); p.active = true; p.archived = null; out = { ok: true, staff: p }; }
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4489/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(500);
  return { ctx, page, errors, sent };
}
const chipsOf = (page) => page.evaluate(() => [].map.call(document.querySelectorAll('#hrList [data-hrrow]'), r => r.querySelector('.rowName').textContent.trim() + '=' + r.querySelector('.hrChip').textContent.trim()));

console.log('=== the menu ===');
{
  const { ctx, page, errors } = await open(DARA);
  await page.click('#menuBtn');
  await page.waitForTimeout(300);
  ok('a staff member without HR sees no HR item in the menu', await page.$('[data-menu-item="hr"]') === null);
  await ctx.close();
}
{
  const { ctx, page, errors, sent } = await open(ADMIN);
  await page.click('#menuBtn');
  await page.waitForTimeout(300);
  const label = await page.evaluate(() => (document.querySelector('[data-menu-item="hr"] .drawerLabel') || {}).textContent || '');
  ok('an admin sees HR in the menu, with the renewals-due count from boot', /HR/.test(label) && /2/.test(label), label);
  await page.click('[data-menu-item="hr"]');
  await page.waitForTimeout(800);

  console.log('\n=== the HR home ===');
  ok('opening it loads the staff list once', sent.filter(x => x.fn === 'hrList').length === 1);
  const tiles = await page.evaluate(() => [].map.call(document.querySelectorAll('.mmTile'), t => t.querySelector('.mmTileName').textContent.trim() + '=' + t.querySelector('.mmTileNum').textContent.trim()));
  ok('tiles: active staff, contracts on file, renewals due, archived', JSON.stringify(tiles) === JSON.stringify(['Active staff=5', 'Contracts on file=2 / 5', 'Renewals due=2', 'Archived=1']), tiles.join(' | '));
  const due = await page.evaluate(() => [].map.call(document.querySelectorAll('#hrDueList [data-hrrow]'), r => r.querySelector('.rowName').textContent.trim()));
  ok('renewals due lists the expired one first, then the one running out', JSON.stringify(due) === JSON.stringify(['Sreilea Chan', 'Andrew Lee']), due.join(','));
  const chips = await chipsOf(page);
  ok('every row carries a short status chip', chips.includes('Andrew Lee=Renew soon') && chips.includes('Sreilea Chan=Expired') && chips.includes('Dara Pen=No contract') && chips.includes('Tinh Vong=No contract'), chips.join(' | '));
  ok('archived people are hidden until asked for', !chips.some(c => /Sokna/.test(c)));
  const groups = await page.evaluate(() => [].map.call(document.querySelectorAll('#hrList [data-hrgroup]'), g => g.getAttribute('data-hrgroup') + ':' + g.querySelector('.mentorLabel').textContent.trim() + ':' + [].map.call(g.querySelectorAll('.rowName'), r => r.textContent.trim()).join('/')));
  ok('the list is in the same two groups as Admin → Accounts, then whoever is not sorted yet', JSON.stringify(groups) === JSON.stringify(['ministry:Siem Reap ministries · 3:Andrew Lee/Dara Pen/Sreilea Chan', 'campus:YAP and Campus staff · 1:Uriah Lyford', 'unset:Kind of staff not set yet · 1:Tinh Vong']), JSON.stringify(groups));
  await page.click('#hrShowArchived');
  await page.waitForTimeout(300);
  ok('Show archived brings them in, marked', (await chipsOf(page)).includes('Sokna Non=Archived'));
  await page.fill('#hrSearch', 'andrew');
  await page.waitForTimeout(200);
  ok('a search hides the groups with no match', JSON.stringify(await page.evaluate(() => [].map.call(document.querySelectorAll('#hrList [data-hrgroup]'), g => g.style.display === 'none' ? 'hidden' : 'shown'))) === JSON.stringify(['shown', 'hidden', 'hidden']));
  await page.waitForTimeout(200);
  const visible = await page.evaluate(() => [].filter.call(document.querySelectorAll('#hrList [data-hrrow]'), r => r.style.display !== 'none').length);
  ok('the search narrows the list without a request', visible === 1 && sent.filter(x => x.fn === 'hrList').length === 1);
  ok('nothing scrolls sideways', !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)));

  console.log('\n=== a person ===');
  await page.click('[data-hrperson="st_1"]');
  await page.waitForTimeout(400);
  const person = await page.evaluate(() => ({
    name: document.querySelector('.adminPersonHead .pname').textContent.trim(),
    serving: [].map.call(document.querySelectorAll('.pmeta'), e => e.textContent).join(' | '),
    banner: document.querySelector('.hrBanner').textContent.trim(), bannerClass: document.querySelector('.hrBanner').className,
    contracts: document.querySelectorAll('[data-hrcontract]').length, files: document.querySelectorAll('.hrFile').length,
    addLabel: document.querySelector('#hrAddContract').textContent.trim(),
    archiveBtn: !!document.querySelector('#hrArchive'), search: !!document.querySelector('#hrSearch'),
  }));
  ok('their page: name, how long they have served, since when', person.name === 'Andrew Lee' && /Serving in YWAM Siem Reap 4 yr 11 mo/.test(person.serving) && /since/.test(person.serving), person.serving);
  ok('the banner says the contract is coming up for renewal', /due/.test(person.bannerClass) && /Renew in \d+ days/.test(person.banner) && /5 years/.test(person.banner), person.banner);
  ok('their contract is listed with its attached paper', person.contracts === 1 && person.files === 1);
  ok('the add button offers a renewal, and the archive box is there; the list is not', /renewal/.test(person.addLabel) && person.archiveBtn && !person.search);
  await page.click('[data-hrfileopen="f1"]');
  await page.waitForTimeout(400);
  ok('Open fetches the file by id', sent.some(x => x.fn === 'hrGetFile' && x.args[2] === 'f1'));

  // add a renewal
  await page.click('#hrAddContract');
  await page.waitForTimeout(300);
  await page.click('#hrContractSave');
  await page.waitForTimeout(200);
  ok('saving with nothing filled in is stopped on the page', !sent.some(x => x.fn === 'hrSaveContract'));
  await page.fill('#hr_signed', ym(Y, M + 1));
  await page.fill('#hr_years', '2');
  await page.fill('#hr_notes', 'second term');
  ok('the form names the campus for the contract years and asks separately for the year they joined YWAM', /Years serving in YWAM Siem Reap/.test(await page.$eval('#hrContractForm', e => e.textContent)) && !!(await page.$('#hr_ywamsince')));
  await page.fill('#hr_ywamsince', '2003');
  await page.click('#hrContractSave');
  await page.waitForTimeout(600);
  const sv = sent.find(x => x.fn === 'hrSaveContract');
  ok('Save posts the month signed, the years and the note for this person', sv && sv.args[2] === 'st_1' && sv.args[3].signed === ym(Y, M + 1) && sv.args[3].years === 2 && sv.args[3].notes === 'second term' && sv.args[3].ywamSince === 2003, sv && JSON.stringify(sv.args[3]));
  const after = await page.evaluate(() => ({ contracts: document.querySelectorAll('[data-hrcontract]').length, banner: document.querySelector('.hrBanner').className, form: !!document.querySelector('#hrContractForm') }));
  ok('the renewal shows as a second contract and the banner turns green', after.contracts === 2 && /active/.test(after.banner) && !after.form, JSON.stringify(after));
  ok('the person header now says how long they have been in YWAM, apart from this base', /In YWAM since 2003/.test(await page.$eval('#hrYwamSince', e => e.textContent)) && /Serving in YWAM Siem Reap/.test(await page.$eval('.adminPersonHead', e => e.textContent)));

  // attach a file to the new contract
  const input = await page.$('[data-hrattach="c_new"]');
  await input.setInputFiles({ name: 'renewal.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 renewal') });
  await page.waitForTimeout(700);
  const up = sent.find(x => x.fn === 'hrUploadFile');
  ok('picking a file uploads it against that contract as base64', up && up.args[2] === 'st_1' && up.args[3] === 'c_new' && up.args[4] === 'renewal.pdf' && up.args[5] === 'application/pdf' && Buffer.from(up.args[6], 'base64').toString() === '%PDF-1.4 renewal', up && JSON.stringify(up.args.slice(2, 6)));
  ok('and it appears under the contract', (await page.evaluate(() => document.querySelectorAll('.hrFile').length)) === 2);

  await page.click('#hrBack');
  await page.waitForTimeout(400);
  ok('Back keeps the search in the box', (await page.evaluate(() => document.querySelector('#hrSearch').value)) === 'andrew');
  await page.fill('#hrSearch', '');
  await page.waitForTimeout(200);
  await page.click('[data-hrperson="st_4"]');
  await page.waitForTimeout(300);
  await page.click('#hrAddContract');
  await page.waitForTimeout(300);
  ok('a person with no contract gets an empty form — nothing pre-filled from anywhere', await page.evaluate(() => document.querySelector('#hr_signed').value === '' && !document.querySelector('.hrSuggest')));

  console.log('\n=== archiving ===');
  await page.click('#hrContractCancel');
  await page.waitForTimeout(200);
  await page.fill('#hr_reason', 'Moved home');
  page.once('dialog', d => d.accept());
  await page.click('#hrArchive');
  await page.waitForTimeout(600);
  const ar = sent.find(x => x.fn === 'hrArchive');
  ok('Archive asks, then posts the date and the reason', ar && ar.args[2] === 'st_4' && /^\d{4}-\d{2}-\d{2}$/.test(ar.args[3].at) && ar.args[3].reason === 'Moved home', ar && JSON.stringify(ar.args[3]));
  const arch = await page.evaluate(() => ({ banner: document.querySelector('.hrBanner').className, un: !!document.querySelector('#hrUnarchive'), box: !!document.querySelector('#hrArchive'), text: document.body.innerText }));
  ok('the page now shows them archived with the reason, and offers to bring them back', /archived/.test(arch.banner) && arch.un && !arch.box && /Moved home/.test(arch.text));
  await page.click('#hrBack');
  await page.waitForTimeout(400);
  const tiles2 = await page.evaluate(() => [].map.call(document.querySelectorAll('.mmTile'), t => t.querySelector('.mmTileNum').textContent.trim()));
  ok('the home tiles follow: one fewer active, one more archived', tiles2[0] === '4' && tiles2[3] === '2', tiles2.join(','));
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
