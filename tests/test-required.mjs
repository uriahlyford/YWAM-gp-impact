/* Books read on your account, and the papers every staff member signs
   (netlify/functions/api.js — libSaveReads, reqDoc*, reqSign, reqStatusAll).

   Against the real api.js with a fake @netlify/blobs: Library ticks are saved
   on the staff record and only their COUNT reaches a teammate; a paper with
   nothing to read is not asked; only admins and HR manage the papers or see
   anyone else's status and signature; a signature needs the current version,
   a name and a drawn picture; a new version asks again (or not, if HR says
   so); the contract half comes from HR's own contract record; applicants are
   never asked; nothing new leaks through the roster. */
import { tmpDir } from './env.mjs';
import { REPO } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('required');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const stores={};
export function getStore(o){
  const name=(typeof o==='string') ? o : o.name;
  const mem=stores[name]||(stores[name]=new Map());
  return {
    get: async (k,opt)=>{ if(!mem.has(k)) return null; const v=mem.get(k); return (opt&&opt.type==='text') ? v : JSON.parse(v); },
    set: async (k,v)=>{ mem.set(k, String(v)); },
    setJSON: async (k,v)=>{ mem.set(k, JSON.stringify(v)); },
    delete: async (k)=>{ mem.delete(k); },
    list: ()=>({ [Symbol.asyncIterator]: async function*(){ yield { blobs: [...mem.keys()].map(key=>({key})), directories: [] }; } })
  };
}
export const __stores=stores;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json', JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__stores['gp-data'] || (blobs.getStore({ name: 'gp-data' }), blobs.__stores['gp-data']);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
await blobs.getStore({ name: 'gp-data' }).setJSON('staff', [
  withPin({ id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_hr', name: 'Hana', username: 'hana', campus: 'siemreap', dept: 'Operations', ministry: 'HR', active: true, hr: true }),
  withPin({ id: 'st_dara', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'st_emma', name: 'Emma', username: 'emma', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'st_app', name: 'Applicant', username: 'app@x.org', campus: 'siemreap', dept: 'Community Service', active: true, kind: 'applicant' })
]);
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return await res.json();
}
const staffRec = async (id) => (await blobs.getStore({ name: 'gp-data' }).get('staff', { type: 'json' })).find((r) => r.id === id);
const PDF = Buffer.from('%PDF-1.4 a policy').toString('base64');
const SIG = 'data:image/png;base64,' + 'A'.repeat(400);

console.log('=== books read ===');
let r = await call('libSaveReads', ['dara', '1234', { 'atomic-habits': '2026-10-01', 'grit': '2026-10-02', 'Bad Id!': '2026-10-03' }]);
ok('marking books read saves them on your account', r.ok && Object.keys(r.libRead).sort().join() === 'atomic-habits,grit', JSON.stringify(r.libRead));
r = await call('libSaveReads', ['dara', '1234', { grit: null, 'deep-work': '2026-10-04' }]);
ok('… unmarking takes one off; marking again keeps the first date', r.ok && Object.keys(r.libRead).sort().join() === 'atomic-habits,deep-work' && r.libRead['atomic-habits'] === '2026-10-01');
r = await call('libSaveReads', ['dara', '9999', { grit: '2026-10-02' }]);
ok('… and needs your PIN', !r.ok);
let boot = await call('getMyBoot', ['dara', '1234']);
ok('your boot brings your list back (for any phone)', boot.ok && Object.keys(boot.libRead).length === 2);
let prof = await call('staffProfile', ['emma', '1234', 'st_dara']);
ok('a teammate sees how many — the count only', prof.ok && prof.booksRead === 2 && !('libRead' in prof) && !JSON.stringify(prof).includes('atomic-habits'));
ok('nothing about reads or signatures in the roster', !JSON.stringify(boot.roster).match(/libRead|signed|atomic-habits/));

console.log('\n=== the papers ===');
boot = await call('getMyBoot', ['dara', '1234']);
ok('before any paper: only the Child Protection Agreement and the contract are asked, none done', boot.required && boot.required.total === 2 && boot.required.items.map((x) => x.kind).join() === 'legal,contract' && boot.required.done === 0 && !boot.required.finished);
r = await call('reqDocSave', ['dara', '1234', { title: 'Child Protection Policy' }]);
ok('staff cannot add a paper', !r.ok && r.err === 'not_authorized');
r = await call('reqDocSave', ['hana', '1234', { title: 'Child Protection Policy' }]);
const cpp = r.doc;
ok('HR can', r.ok && cpp.title === 'Child Protection Policy' && cpp.version === 1 && cpp.kind === 'none');
boot = await call('getMyBoot', ['dara', '1234']);
ok('a paper with nothing to read yet is not asked', boot.required.total === 2);
r = await call('reqDocUpload', ['hana', '1234', cpp.id, 'cpp.pdf', 'application/zip', PDF, false]);
ok('only a PDF or a picture is taken', !r.ok && r.err === 'bad_type');
r = await call('reqDocUpload', ['hana', '1234', cpp.id, 'cpp.pdf', 'application/pdf', PDF, true]);
ok('HR uploads the PDF — the first file is still version 1', r.ok && r.doc.kind === 'file' && r.doc.version === 1 && mem.has('reqfile:' + (JSON.parse(mem.get('reqDocs'))[0].fileId)));
r = await call('reqDocSave', ['uriah', '1234', { title: 'Staff Manual', url: 'https://drive.example.org/manual' }]);
const man = r.doc;
ok('an admin can add one as a link', r.ok && man.kind === 'link');
r = await call('reqDocSave', ['uriah', '1234', { title: 'Bad', url: 'javascript:alert(1)' }]);
ok('… a link must be http(s)', !r.ok && r.err === 'bad_link');
boot = await call('getMyBoot', ['dara', '1234']);
ok('now everyone is asked for both papers, the agreement and the contract', boot.required.total === 4 && boot.required.done === 0 && boot.reqDocs.length === 2);
r = await call('reqDocFile', ['dara', '1234', cpp.id]);
ok('any staff member can open the paper', r.ok && r.dataUrl.indexOf('data:application/pdf;base64,') === 0);

console.log('\n=== signing ===');
r = await call('reqSign', ['dara', '1234', cpp.id, 7, 'Dara Sok', SIG]);
ok('an old version is refused, with the current list', !r.ok && r.err === 'new_version' && r.docs.length === 2);
r = await call('reqSign', ['dara', '1234', cpp.id, 1, ' ', SIG]);
ok('a name is needed', !r.ok && r.err === 'no_name');
r = await call('reqSign', ['dara', '1234', cpp.id, 1, 'Dara Sok', 'data:image/png;base64,AA']);
ok('a drawn signature is needed', !r.ok && r.err === 'bad_signature');
r = await call('reqSign', ['dara', '1234', cpp.id, 1, 'Dara Sok', 'data:text/html;base64,' + 'A'.repeat(400)]);
ok('… a picture, nothing else', !r.ok && r.err === 'bad_signature');
r = await call('reqSign', ['dara', '1234', cpp.id, 1, 'Dara Sok', SIG]);
const item = r.required && r.required.items.find((x) => x.id === cpp.id);
ok('signed: done, with the time', r.ok && item.done && !!item.at && r.required.done === 1);
const rec = await staffRec('st_dara');
ok('the record keeps version, time and name — not the picture', rec.signed[cpp.id].v === 1 && rec.signed[cpp.id].name === 'Dara Sok' && !JSON.stringify(rec).includes('AAAA'));
ok('the picture is kept on its own', mem.has('reqsig:' + cpp.id + ':st_dara'));
r = await call('reqSign', ['app@x.org', '1234', cpp.id, 1, 'Applicant', SIG]);
ok('an applicant is not asked and cannot sign', !r.ok);
r = await call('reqSignature', ['dara', '1234', cpp.id, 'st_dara']);
ok('you can see your own signature', r.ok && r.sig === SIG && r.name === 'Dara Sok');
r = await call('reqSignature', ['emma', '1234', cpp.id, 'st_dara']);
ok('a teammate cannot', !r.ok && r.err === 'not_authorized');
r = await call('reqSignature', ['hana', '1234', cpp.id, 'st_dara']);
ok('HR can', r.ok && r.sig === SIG);

console.log('\n=== who sees whose status ===');
prof = await call('staffProfile', ['emma', '1234', 'st_dara']);
ok('a teammate sees no status', prof.ok && prof.required === null);
prof = await call('staffProfile', ['hana', '1234', 'st_dara']);
ok('HR sees it on the profile', prof.ok && prof.required && prof.required.done === 1 && prof.required.total === 4 && !prof.required.finished);
prof = await call('staffProfile', ['dara', '1234', 'st_dara']);
ok('and you see your own', prof.ok && prof.required && prof.required.done === 1);
r = await call('reqStatusAll', ['dara', '1234']);
ok('the everyone list is for admins and HR only', !r.ok && r.err === 'not_authorized');
r = await call('reqStatusAll', ['uriah', '1234']);
ok('… which lists every active staff member, never applicants', r.ok && r.people.length === 4 && !r.people.some((p) => p.id === 'st_app'));

console.log('\n=== the contract ===');
const ym = (d) => d.toISOString().slice(0, 7);
const now = new Date();
r = await call('hrSaveContract', ['hana', '1234', 'st_dara', { signed: ym(new Date(now.getFullYear() - 3, now.getMonth(), 1)), years: 1 }]);
boot = await call('getMyBoot', ['dara', '1234']);
let c = boot.required.items.find((x) => x.kind === 'contract');
ok('a contract that has run out does not count', r.ok && !c.done && c.state === 'expired');
await call('hrSaveContract', ['hana', '1234', 'st_dara', { signed: ym(new Date(now.getFullYear(), now.getMonth() - 1, 1)), years: 2 }]);
boot = await call('getMyBoot', ['dara', '1234']);
c = boot.required.items.find((x) => x.kind === 'contract');
ok('a current one does, with its end', c.done && c.state === 'current' && /^\d{4}-\d{2}-01$/.test(c.ends));
await call('reqSign', ['dara', '1234', man.id, 1, 'Dara Sok', SIG]);
boot = await call('getMyBoot', ['dara', '1234']);
ok('papers and contract, but not the Child Protection Agreement: not complete yet', !boot.required.finished && boot.required.done === 3);
{ const st = blobs.getStore({ name: 'gp-data' }), rows = await st.get('staff', { type: 'json' });
  rows.find((x) => x.id === 'st_dara').legal = { child: { at: '2026-10-01T00:00:00.000Z', name: 'Dara Sok' } }; await st.setJSON('staff', rows); }
boot = await call('getMyBoot', ['dara', '1234']);
ok('both papers, the agreement and the contract: the profile is complete', boot.required.finished && boot.required.done === 4);

console.log('\n=== a new version ===');
r = await call('reqDocUpload', ['hana', '1234', cpp.id, 'cpp-v2.pdf', 'application/pdf', PDF, false]);
boot = await call('getMyBoot', ['dara', '1234']);
ok('a corrected file without "sign again" keeps everyone signed', r.ok && r.doc.version === 1 && boot.required.finished);
const oldFile = JSON.parse(mem.get('reqDocs')).find((d) => d.id === cpp.id).fileId;
r = await call('reqDocUpload', ['hana', '1234', cpp.id, 'cpp-v3.pdf', 'application/pdf', PDF, true]);
boot = await call('getMyBoot', ['dara', '1234']);
const again = boot.required.items.find((x) => x.id === cpp.id);
ok('a new file with "sign again" asks everyone again', r.doc.version === 2 && !again.done && again.older && !boot.required.finished);
ok('… and the old file is gone', !mem.has('reqfile:' + oldFile));
await call('reqSign', ['dara', '1234', cpp.id, 2, 'Dara Sok', SIG]);
boot = await call('getMyBoot', ['dara', '1234']);
ok('signing the new version finishes it again', boot.required.finished);

console.log('\n=== removing a paper ===');
r = await call('reqDocDelete', ['dara', '1234', man.id]);
ok('staff cannot remove one', !r.ok && r.err === 'not_authorized');
r = await call('reqDocDelete', ['uriah', '1234', man.id]);
boot = await call('getMyBoot', ['emma', '1234']);
ok('an admin can, and nobody is asked for it any more', r.ok && r.docs.length === 1 && boot.required.total === 3);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
