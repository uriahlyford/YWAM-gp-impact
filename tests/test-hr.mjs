/* Human Resources — staff contracts, attachments, archiving.

   Against the real api.js: only an admin or someone given `hr` may read or
   write anything here; a contract is a signed month plus years committed
   (renewals are further rows); an attachment is its own blob, never in the
   staff list, and goes when its contract goes; archiving deactivates —
   the roster, sign-in and the admin's Approvals all read it right — and
   unarchiving brings the person back. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('hr');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
  delete: async (k)=>{ delete mem[k]; },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js'); // and the portal's shipped forms // api.js imports it
fs.copyFileSync(REPO + '/netlify/functions/legal-docs-default.js', TMP + '/legal-docs-default.js');  // the legal forms teams sign
fs.copyFileSync(REPO + '/netlify/functions/legal-pdf.js', TMP + '/legal-pdf.js');  // and the signed-PDF builder
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });

mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_hr', name: 'Sina Sok', username: 'sina', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Community Service', active: true }),
  withPin({ id: 'st_andrew', name: 'Andrew Lee', username: 'andrew', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, joined: '2021' }),
  withPin({ id: 'st_yi', name: 'Yi Tout', username: 'yi', campus: 'siemreap', dept: 'Skills Training', ministry: 'Technical', active: true }),
  withPin({ id: 'st_dara', name: 'Dara Pen', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
];

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

console.log('=== who may open HR ===');
let r = await call('hrList', ['dara', '1234']);
ok('an ordinary staff member cannot read HR', r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));
r = await call('hrList', ['sina', '1234']);
ok('nor an overseer without the HR flag', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('adminUpdateStaff', ['sina', '1234', 'st_hr', { hr: true }]);
ok('a non-admin cannot give themselves HR', r.body.ok === false);
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_hr', { hr: true }]);
ok('an admin gives someone HR access', r.body.ok === true && r.body.staff.hr === true, JSON.stringify(r.body.staff && r.body.staff.hr));
r = await call('getMyBoot', ['sina', '1234']);
ok('and their boot carries the flag (the menu item hangs on it)', r.body.staff.hr === true);
r = await call('getMyBoot', ['dara', '1234']);
ok('everyone else’s says no', r.body.staff.hr === false);
r = await call('hrList', ['sina', '1234']);
ok('HR reads the whole staff list', r.body.ok === true && r.body.staff.length === 5);
ok('the list never carries a PIN hash', !JSON.stringify(r.body).includes('pinHash'));

console.log('\n=== contracts ===');
r = await call('hrSaveContract', ['dara', '1234', 'st_andrew', { signed: '2021-10', years: 5 }]);
ok('an ordinary member cannot add a contract', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { signed: 'October 2021', years: 5 }]);
ok('a contract needs a real signed month', r.body.ok === false && r.body.err === 'bad_contract');
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { signed: '2021-10', years: 0 }]);
ok('and a real number of years', r.body.ok === false && r.body.err === 'bad_contract');
r = await call('hrSaveContract', ['sina', '1234', 'st_nobody', { signed: '2021-10', years: 5 }]);
ok('an unknown person is refused', r.body.ok === false && r.body.err === 'not_found');
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { signed: '2021-10', years: 5, notes: '  first term ' }]);
ok('HR adds a contract: month signed, years committed, a note', r.body.ok === true && r.body.staff.contracts.length === 1 && r.body.staff.contracts[0].signed === '2021-10' && r.body.staff.contracts[0].years === 5 && r.body.staff.contracts[0].notes === 'first term', JSON.stringify(r.body.staff.contracts));
const c1 = r.body.staff.contracts[0];
ok('it records who added it and when', c1.addedBy === 'st_hr' && /^\d{4}-/.test(c1.added));
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5, notes: 'first term, shortened' }]);
ok('saving with the same id edits it in place (years in quarter steps)', r.body.ok === true && r.body.staff.contracts.length === 1 && r.body.staff.contracts[0].years === 4.5 && r.body.staff.contracts[0].addedBy === 'st_hr');
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5, notes: 'first term, shortened', ywamSince: 2003 }]);
ok('the contract form also records the year they joined YWAM anywhere — on the person, not the contract', r.body.ok === true && r.body.staff.ywamSince === 2003 && r.body.staff.contracts[0].ywamSince === undefined && mem.staff.find(s => s.id === 'st_andrew').ywamSince === 2003);
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5, ywamSince: 1850 }]);
ok('an impossible year is refused', r.body.ok === false && r.body.err === 'bad_ywam_since' && mem.staff.find(s => s.id === 'st_andrew').ywamSince === 2003);
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5 }]);
ok('leaving it out keeps the year', r.body.ok === true && r.body.staff.ywamSince === 2003);
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5, ywamSince: '' }]);
ok('an empty value clears it', r.body.ok === true && r.body.staff.ywamSince === null);
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5, ywamSince: 2003 }]);
r = await call('hrSaveContract', ['uriah', '1234', 'st_andrew', { signed: '2026-10', years: 3 }]);
ok('a renewal is a second row, and the list comes back oldest first', r.body.ok === true && r.body.staff.contracts.length === 2 && r.body.staff.contracts[1].signed === '2026-10', r.body.staff.contracts.map(c => c.signed).join(','));
const c2 = r.body.staff.contracts[1];

console.log('\n=== start dates, apart from the contracts ===');
ok('a renewal leaves the YWAM year alone', r.body.staff.ywamSince === 2003);
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { ywamSince: 2003, baseSince: '2019-06' }]);
ok('the YWAM year and the month they started at this base are saved on the person', r.body.ok === true && r.body.staff.ywamSince === 2003 && r.body.staff.baseSince === '2019-06' && mem.staff.find(s => s.id === 'st_andrew').baseSince === '2019-06');
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { signed: '2028-10', years: 2 }]);
ok('adding another contract changes neither', r.body.ok === true && r.body.staff.ywamSince === 2003 && r.body.staff.baseSince === '2019-06');
await call('hrDeleteContract', ['sina', '1234', 'st_andrew', r.body.staff.contracts.find(c => c.signed === '2028-10').id]);
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { baseSince: '2001-01' }]);
ok('starting here before joining YWAM is refused', r.body.ok === false && r.body.err === 'base_before_ywam' && mem.staff.find(s => s.id === 'st_andrew').baseSince === '2019-06');
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { baseSince: '2999-01' }]);
ok('a month in the future is refused', r.body.ok === false && r.body.err === 'bad_base_since');
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { baseSince: 'June 2019' }]);
ok('… and so is a month it can’t read', r.body.ok === false && r.body.err === 'bad_base_since');
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { ywamSince: 1850 }]);
ok('an impossible YWAM year is refused', r.body.ok === false && r.body.err === 'bad_ywam_since');
r = await call('hrSaveStart', ['dara', '1234', 'st_andrew', { baseSince: '2020-01' }]);
ok('an ordinary member cannot set them', r.body.ok === false && r.body.err === 'not_authorized' && mem.staff.find(s => s.id === 'st_andrew').baseSince === '2019-06');
r = await call('hrSaveStart', ['sina', '1234', 'st_nobody', { baseSince: '2020-01' }]);
ok('nor for someone who isn’t there', r.body.ok === false && r.body.err === 'not_found');
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { baseSince: '' }]);
ok('clearing the base month keeps the YWAM year', r.body.ok === true && r.body.staff.baseSince === '' && r.body.staff.ywamSince === 2003);
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { starts: { poipet: '2015-02', siemreap: '2024-01' } }]);
ok('a start month for each campus — Poipet and Siem Reap', r.body.ok === true && r.body.staff.starts.poipet === '2015-02' && r.body.staff.starts.siemreap === '2024-01' && r.body.staff.baseSince === '2024-01');
r = await call('hrSaveStart', ['sina', '1234', 'st_andrew', { starts: { poipet: '' } }]);
ok('one can be cleared without touching the other', r.body.ok === true && !r.body.staff.starts.poipet && r.body.staff.starts.siemreap === '2024-01');
ok('a campus we don’t have is refused', (await call('hrSaveStart', ['sina', '1234', 'st_andrew', { starts: { phnompenh: '2020-01' } }])).body.err === 'bad_campus');
ok('a campus start before the YWAM year is refused', (await call('hrSaveStart', ['sina', '1234', 'st_andrew', { starts: { poipet: '1999-01' } }])).body.err === 'base_before_ywam');
ok('… and so is a YWAM year after a campus start', (await call('hrSaveStart', ['sina', '1234', 'st_andrew', { ywamSince: 2025 }])).body.err === 'base_before_ywam');
ok('an ordinary member cannot set a campus start', (await call('hrSaveStart', ['dara', '1234', 'st_andrew', { starts: { poipet: '2015-02' } }])).body.err === 'not_authorized');
await call('hrSaveStart', ['sina', '1234', 'st_andrew', { starts: { siemreap: '' } }]);
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { signed: '2020-01', years: 5, campus: 'poipet' }]);
const pp = r.body.staff.contracts.find(c => c.signed === '2020-01');
ok('a contract keeps the campus it was signed with', r.body.ok === true && pp.campus === 'poipet');
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: pp.id, signed: '2020-01', years: 5, campus: 'phnompenh' }]);
ok('an unknown campus is left empty (reads as their own)', r.body.staff.contracts.find(c => c.id === pp.id).campus === '');
await call('hrDeleteContract', ['sina', '1234', 'st_andrew', pp.id]);

console.log('\n=== attachments ===');
const pdf = Buffer.from('%PDF-1.4 the signed paper').toString('base64');
r = await call('hrUploadFile', ['dara', '1234', 'st_andrew', c1.id, 'contract.pdf', 'application/pdf', pdf]);
ok('an ordinary member cannot attach a file', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrUploadFile', ['sina', '1234', 'st_andrew', c1.id, 'virus.exe', 'application/x-msdownload', pdf]);
ok('only PDFs and photos are accepted', r.body.ok === false && r.body.err === 'bad_type');
r = await call('hrUploadFile', ['sina', '1234', 'st_andrew', c1.id, 'huge.pdf', 'application/pdf', 'A'.repeat(6 * 1024 * 1024)]);
ok('a file over ~4 MB is refused', r.body.ok === false && r.body.err === 'too_large');
r = await call('hrUploadFile', ['sina', '1234', 'st_andrew', 'ct_missing', 'contract.pdf', 'application/pdf', pdf]);
ok('a file for a contract that isn’t there writes nothing', r.body.ok === false && r.body.err === 'not_found' && !Object.keys(mem).some(k => k.startsWith('hrfile:')));
r = await call('hrUploadFile', ['sina', '1234', 'st_andrew', c1.id, 'contract 2021.pdf', 'application/pdf', pdf]);
ok('HR attaches the signed paper', r.body.ok === true && r.body.file && r.body.file.name === 'contract 2021.pdf', JSON.stringify(r.body.file));
const f1 = r.body.file;
ok('the staff record holds only the file’s name, type and size — not the bytes', r.body.staff.contracts[0].files.length === 1 && !JSON.stringify(mem.staff).includes(pdf));
ok('the bytes are their own blob', !!mem['hrfile:' + f1.id] && mem['hrfile:' + f1.id].data === pdf);
r = await call('hrGetFile', ['dara', '1234', f1.id]);
ok('an ordinary member cannot open it', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrGetFile', ['uriah', '1234', f1.id]);
ok('HR opens it as a data URL', r.body.ok === true && r.body.dataUrl === 'data:application/pdf;base64,' + pdf && r.body.name === 'contract 2021.pdf');
r = await call('hrUploadFile', ['sina', '1234', 'st_andrew', c1.id, 'photo.jpg', 'image/jpeg', 'aGVsbG8=']);
const f2 = r.body.file;
r = await call('hrDeleteFile', ['sina', '1234', 'st_andrew', c1.id, f2.id]);
ok('deleting a file removes it from the contract and drops its blob', r.body.ok === true && r.body.staff.contracts[0].files.length === 1 && !mem['hrfile:' + f2.id]);
r = await call('hrDeleteContract', ['sina', '1234', 'st_andrew', c1.id]);
ok('deleting a contract takes its files with it', r.body.ok === true && r.body.staff.contracts.length === 1 && r.body.staff.contracts[0].id === c2.id && !mem['hrfile:' + f1.id]);

console.log('\n=== archiving someone who leaves ===');
r = await call('hrArchive', ['dara', '1234', 'st_yi', { at: '2026-09-01', reason: 'Moved home' }]);
ok('an ordinary member cannot archive', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrArchive', ['sina', '1234', 'st_hr', { at: '2026-09-01', reason: 'oops' }]);
ok('nobody archives themselves', r.body.ok === false && r.body.err === 'self_archive');
r = await call('getMyBoot', ['uriah', '1234']);
const before = r.body.roster.length;
r = await call('hrArchive', ['sina', '1234', 'st_yi', { at: '2026-09-01', reason: 'Moved home' }]);
ok('HR archives someone with the date they left and why', r.body.ok === true && r.body.staff.active === false && r.body.staff.archived.at === '2026-09-01' && r.body.staff.archived.reason === 'Moved home' && r.body.staff.archived.by === 'st_hr', JSON.stringify(r.body.staff.archived));
r = await call('getMyBoot', ['uriah', '1234']);
ok('the roster — and so the staff count — drops by one', r.body.roster.length === before - 1 && !r.body.roster.some(p => p.id === 'st_yi'));
r = await call('getMyBoot', ['yi', '1234']);
ok('an archived person can no longer sign in', r.body.ok === false);
r = await call('adminListStaff', ['uriah', '1234']);
const yi = r.body.staff.find(x => x.id === 'st_yi');
ok('the admin list shows them inactive AND archived — not a sign-up waiting for approval', yi.active === false && yi.archived && yi.archived.at === '2026-09-01');
r = await call('hrUnarchive', ['sina', '1234', 'st_yi']);
ok('unarchiving brings them back', r.body.ok === true && r.body.staff.active === true && r.body.staff.archived === null);
r = await call('getMyBoot', ['yi', '1234']);
ok('and they can sign in again', r.body.ok === true);
r = await call('hrUnarchive', ['sina', '1234', 'st_dara']);
ok('unarchiving someone who was never archived is refused', r.body.ok === false && r.body.err === 'not_archived');

console.log('=== staff sign the legal documents and their contract in the app ===');
{
  const SIG = '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAUADwDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAYFBAf/xAAsEAABAwIEBAUFAQAAAAAAAAABAAQFAgMGERMhFDFRcSMyQWGhEiJigZGx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APTkWTOz1qG0bZZu3bhxnpWW1o1GrLLPM8hzCycsYTXmqbwLWr0HjXyP8HwQgo38iyjbOs/dWW9vrcrAz7dVPHGfFE1QcLISVmnz36aNOjL8TV5j7bLpYYNiGt7iXdFyRd+t97Xqn+Hb4VCAKQAAABsAEGDG4vhn93h6nFTN0Ni3d06VYPTfYnsVvLjkomOlbOlIs7Lin0+unMjseY/SwDhWQi/uwzNXm9A5NHXjWewz3p+Sgq0UoMTykWRRiSDvW6BtxbLxbR9yOdI7qrBzAPVAREQEREBERAREQf/Z';
  const req = (b) => (b.required || b.staff && b.staff.required || { items: [] }).items;
  r = await call('myContract', ['andrew', '1234']);
  ok('My contract: their own profile, the five legal documents, and their list', r.body.ok && r.body.me.id === 'st_andrew' && r.body.legalDocs.map(d => d.id).join() === 'photo,accident,liability,acceptance,child' && !!r.body.required);
  let cpi = req(r.body).find(x => x.id === 'legal:child');
  ok('… the Child Protection Agreement is on everyone’s list, not signed yet', cpi && cpi.kind === 'legal' && cpi.done === false);
  r = await call('myContract', ['andrew', '0000']);
  ok('… only with the right PIN', r.body.ok === false);
  r = await call('staffSignOpen', ['andrew', '1234']);
  ok('staff open their documents with their own sign-in: the five, for them alone', r.body.ok && r.body.staff === true && r.body.docs.map(d => d.id).join() === 'photo,accident,liability,acceptance,child' && r.body.people.length === 1 && r.body.people[0].name === 'Andrew Lee');
  r = await call('staffSignOpen', ['andrew', '0000']);
  ok('… only with the right PIN', r.body.ok === false);
  r = await call('staffSignSubmit', ['andrew', '1234', 'me', 'photo', { name: 'Andrew Lee', checks: { beyond: true }, sig: SIG }]);
  ok('the same rules as applicants: every box ticked', r.body.ok === false && r.body.err === 'unticked');
  r = await call('staffSignSubmit', ['andrew', '1234', 'me', 'photo', { name: 'Andrew Lee', checks: { beyond: true, noPay: true, read: true }, sig: SIG }]);
  ok('the Photo Release signs, once', r.body.ok && r.body.done.photo === true);
  r = await call('staffSignSubmit', ['andrew', '1234', 'me', 'child', { name: 'Andrew Lee', checks: Object.fromEntries(['readA', 'readB', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'readD', 'readE', 'readF'].map(k => [k, true])), choices: { disclose: 'none' }, fields: { role: 'Cafe', dates: '2026' }, sig: SIG }]);
  ok('the Child Protection Agreement signs', r.body.ok && r.body.done.child === true, JSON.stringify(r.body));
  r = await call('myContract', ['andrew', '1234']);
  cpi = req(r.body).find(x => x.id === 'legal:child');
  ok('… and is ticked off on their list, with the date', cpi.done === true && !!cpi.at && r.body.me.legal.child && r.body.me.legal.photo);
  r = await call('hrList', ['sina', '1234']);
  let me = r.body.staff.find(x => x.id === 'st_andrew');
  ok('HR sees it on their profile, with the list of documents', me.legal.photo && me.legal.photo.name === 'Andrew Lee' && r.body.legalDocs.length === 5);
  r = await call('hrLegalPdf', ['sina', '1234', 'st_andrew', 'photo']);
  ok('… and opens it as a PDF', r.body.ok && /^data:application\/pdf;base64,JVBER/.test(r.body.dataUrl));
  r = await call('hrLegalPdf', ['andrew', '1234', '', 'photo']);
  ok('staff can open their own', r.body.ok);
  r = await call('hrLegalPdf', ['dara', '1234', 'st_andrew', 'photo']);
  ok('… not someone else’s', r.body.ok === false && r.body.err === 'not_authorized');

  /* documents they signed as an applicant in the portal count too */
  mem.candidates = [
    { id: 'c_dara', type: 'individual', name: 'Dara Pen', email: 'dara@example.org', portal: { signed: { me: { liability: { at: '2026-03-01T00:00:00.000Z', name: 'Dara Pen' } } } } },
    { id: 'c_team', type: 'team', name: 'Fake Team', email: 'dara@example.org', portal: { signed: { me: { photo: { at: '2026-03-01T00:00:00.000Z', name: 'Dara Pen' } } } } },
  ];
  mem['tsign:c_dara:me'] = { docs: {} };
  r = await call('adminUpdateStaff', ['uriah', '1234', 'st_dara', { email: 'dara@example.org' }]);
  r = await call('myContract', ['dara', '1234']);
  ok('a form they signed in the portal (same email) shows in My contract as signed there', r.body.ok && r.body.me.legal.liability && r.body.me.legal.liability.from === 'portal' && r.body.me.legal.liability.candId === 'c_dara', JSON.stringify(r.body.me && r.body.me.legal));
  ok('… a team’s signatures do not count for a staff member', !r.body.me.legal.photo);
  r = await call('staffSignOpen', ['dara', '1234']);
  ok('… and is not asked again', r.body.people[0].done.liability === true && !r.body.people[0].done.photo);

  /* their own start dates */
  r = await call('mySaveStart', ['andrew', '1234', { ywamSince: 2015, starts: { poipet: '2019-02' } }]);
  ok('staff set when they joined YWAM and their time in Poipet themselves', r.body.ok && r.body.staff.ywamSince === 2015, JSON.stringify(r.body));
  r = await call('mySaveStart', ['andrew', '1234', { ywamSince: 1800 }]);
  ok('… checked like HR’s', r.body.ok === false);
  r = await call('mySaveStart', ['andrew', '0000', { ywamSince: 2016 }]);
  ok('… only with the right PIN', r.body.ok === false);

  /* the Volunteer Staff Contract — signed with a base leader there */
  r = await call('hrSendContract', ['dara', '1234', 'st_andrew', { from: '2026-11', years: 2 }]);
  ok('only HR sends a contract to sign', r.body.ok === false);
  r = await call('hrSendContract', ['sina', '1234', 'st_andrew', { from: '2026-11', years: 2 }]);
  const ct = r.body.ok && r.body.staff.contracts.find(c => c.digital);
  ok('HR sends one: its month and length, waiting for them', r.body.ok && ct && ct.signed === '2026-11' && ct.years === 2 && ct.digital.status === 'awaiting_staff');
  r = await call('hrSendContract', ['sina', '1234', 'st_andrew', { from: '2026-12', years: 1 }]);
  ok('… one at a time', r.body.ok === false && r.body.err === 'already_sent');
  r = await call('myContract', ['andrew', '1234']);
  let cti = req(r.body).find(x => x.kind === 'contract');
  ok('it shows on their list as a new one to sign', cti.toSign === true, JSON.stringify(cti));
  ok('… and until it is signed it does not count: their current one still ends when it did', cti.ends === '2029-10-01');
  r = await call('staffSignOpen', ['andrew', '1234']);
  const cdoc = r.body.docs[0];
  ok('it comes first, with its period, and needs a leader', cdoc.id === 'contract:' + ct.id && cdoc.title === 'Volunteer Staff Contract' && /2 years · From 11\/2026 to 11\/2028/.test(cdoc.period) && cdoc.sign.leader === true, cdoc && cdoc.period);
  const cbody = { name: 'Andrew Lee', checks: { agree: true }, fields: { focus1: 'Cafe', future: 'lead a ministry' }, sig: SIG };
  r = await call('staffSignSubmit', ['andrew', '1234', 'me', cdoc.id, cbody]);
  ok('it will not sign without a base leader there', r.body.ok === false && r.body.err === 'leader_required');
  r = await call('staffSignSubmit', ['andrew', '1234', 'me', cdoc.id, { ...cbody, leaderName: 'Sina Sok', leaderSig: 'not a jpeg' }]);
  ok('… and their real signature', r.body.ok === false && r.body.err === 'leader_required');
  r = await call('staffSignSubmit', ['andrew', '1234', 'me', cdoc.id, { ...cbody, leaderName: 'Sina Sok', leaderSig: SIG }]);
  ok('they sign it together, on the same screen', r.body.ok);
  r = await call('hrList', ['sina', '1234']);
  me = r.body.staff.find(x => x.id === 'st_andrew');
  const dg = me.contracts.find(c => c.id === ct.id).digital;
  ok('… and it is signed straight away, with both names', dg.status === 'signed' && dg.staffName === 'Andrew Lee' && dg.leaderName === 'Sina Sok');
  r = await call('hrContractPdf', ['sina', '1234', 'st_andrew', ct.id]);
  const pdf = r.body.ok ? Buffer.from(r.body.dataUrl.split(',')[1], 'base64').toString('latin1') : '';
  ok('the signed contract is a PDF with the letterhead, both signatures and the commitment', r.body.ok && (pdf.match(/\/Subtype \/Image/g) || []).length === 3 && pdf.includes('Cafe') && pdf.includes('Sina Sok') && pdf.includes('Signature of UofN Leader'));
  r = await call('hrContractPdf', ['andrew', '1234', '', ct.id]);
  ok('they open their own signed contract', r.body.ok);
  r = await call('hrContractPdf', ['dara', '1234', '', ct.id]);
  ok('… nobody else can, even by its id', r.body.ok === false);
  r = await call('myContract', ['andrew', '1234']);
  cti = req(r.body).find(x => x.kind === 'contract');
  ok('nothing about the contract is left to sign', cti.done === true && cti.state === 'current' && !cti.toSign, JSON.stringify(cti));
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
