/* Human Resources — staff contracts, attachments, archiving.

   Against the real api.js: only an admin or someone given `hr` may read or
   write anything here; a contract is a signed month plus years committed
   (renewals are further rows); an attachment is its own blob, never in the
   staff list, and goes when its contract goes; a name from the old CRM is
   offered as a pre-fill until a contract exists; archiving deactivates —
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
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js'); // api.js imports it
fs.copyFileSync(REPO + '/netlify/functions/hr-seed.js', TMP + '/hr-seed.js');
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
const andrew0 = r.body.staff.find(x => x.id === 'st_andrew');
ok('a person with no contract yet is offered the old CRM’s dates as a pre-fill', andrew0.contracts.length === 0 && andrew0.suggest && andrew0.suggest.start === '2021-10-01' && andrew0.suggest.end === '2026-10-01', JSON.stringify(andrew0.suggest));
ok('the match survives a different word order and punctuation ("Tout, Yi" ↔ "Yi Tout")', r.body.staff.find(x => x.id === 'st_yi').suggest && r.body.staff.find(x => x.id === 'st_yi').suggest.name === 'Tout, Yi');
ok('someone the CRM never had gets no suggestion', r.body.staff.find(x => x.id === 'st_dara').suggest === null);
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
ok('the pre-fill offer goes away once a contract exists', r.body.staff.suggest === null);
r = await call('hrSaveContract', ['sina', '1234', 'st_andrew', { id: c1.id, signed: '2021-10', years: 4.5, notes: 'first term, shortened' }]);
ok('saving with the same id edits it in place (years in quarter steps)', r.body.ok === true && r.body.staff.contracts.length === 1 && r.body.staff.contracts[0].years === 4.5 && r.body.staff.contracts[0].addedBy === 'st_hr');
r = await call('hrSaveContract', ['uriah', '1234', 'st_andrew', { signed: '2026-10', years: 3 }]);
ok('a renewal is a second row, and the list comes back oldest first', r.body.ok === true && r.body.staff.contracts.length === 2 && r.body.staff.contracts[1].signed === '2026-10', r.body.staff.contracts.map(c => c.signed).join(','));
const c2 = r.body.staff.contracts[1];

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

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
