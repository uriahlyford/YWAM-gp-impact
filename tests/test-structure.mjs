/* The Team page's Structure view — who is on which team each quarter.

   The server keeps one saved document per campus, year and quarter in the
   'structure' blob. Reading a quarter nobody has saved yet answers with the
   most recent saved quarter before it, marked 'copied', so a new quarter
   opens on the last one's structure; saving is admin-only and cleans what
   the client sends. The boot payload carries the current quarter so the
   page opens without a second round trip. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('structure');
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
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const ADMIN = { id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'poipet', dept: 'Campus Leadership',
  ministry: 'Campus Director', role: '', active: true, isAdmin: true };
const MEMBER = { id: 'st_member', name: 'Dara', username: 'dara', campus: 'poipet', dept: 'Community Service',
  ministry: 'Cafe', role: '', active: true };
mem.staff = [ADMIN, MEMBER].map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const NODES = [
  { id: 'gp', title: 'GP Team', kind: 'team', parent: '', leads: ['st_admin'], members: [] },
  { id: 'directors', title: 'Director Team', kind: 'team', parent: 'gp', leads: ['st_admin'], members: ['st_member'] },
  { id: 'min:Community Service|Cafe', title: 'Cafe', kind: 'ministry', parent: 'directors', leads: ['st_member'], members: ['st_member', 'st_admin'] },
];

console.log('=== nothing saved yet ===');
let r = await call('getStructure', ['dara', '1234', 'poipet', 2026, 3]);
ok('a signed-in member may read the structure', r.body.ok === true, JSON.stringify(r.body.ok));
ok('with nothing saved, the document is null and marked none', r.body.doc === null && r.body.source === 'none', JSON.stringify(r.body));
ok('the campus, year and quarter asked for are echoed back', r.body.campus === 'poipet' && r.body.year === 2026 && r.body.quarter === 3);
r = await call('getStructure', ['nobody', '0000', 'poipet', 2026, 3]);
ok('a bad login gets nothing', r.body.ok === false);

console.log('\n=== saving is admin-only and cleans the document ===');
r = await call('saveStructure', ['dara', '1234', { campus: 'poipet', year: 2026, quarter: 3, nodes: NODES }]);
ok('an ordinary member cannot save', r.body.ok === false, JSON.stringify(r.body));
ok('and nothing was written', !mem.structure);
r = await call('saveStructure', ['uriah', '1234', { campus: 'poipet', year: 2026, quarter: 3, nodes: NODES.concat([
  { id: 'gp', title: 'GP Team again', kind: 'team' },              // duplicate id — dropped
  { id: '', title: 'No id', kind: 'team' },                        // no id — dropped
  { id: 'junk', title: 'Odd kind', kind: 'galaxy', parent: 'gp', leads: 'st_admin', members: ['a', 'a', ''] },
  'not an object', null,
]) }]);
ok('an admin saves it', r.body.ok === true && r.body.source === 'saved', JSON.stringify(r.body.ok));
const saved = r.body.doc;
ok('the duplicate, the id-less node and the non-objects are dropped', saved.nodes.length === 4, saved.nodes.map(n => n.id).join(','));
const junk = saved.nodes.find(n => n.id === 'junk');
ok('an unknown kind falls back to team, a non-list leads becomes empty, members are deduped', junk.kind === 'team' && junk.leads.length === 0 && JSON.stringify(junk.members) === '["a"]', JSON.stringify(junk));
ok('who saved it and when is recorded', saved.updatedBy === 'st_admin' && /^\d{4}-/.test(saved.updated));
ok('the store holds exactly one row for that campus and quarter', mem.structure.length === 1 && mem.structure[0].campus === 'poipet' && mem.structure[0].quarter === 3);
r = await call('saveStructure', ['uriah', '1234', { campus: 'poipet', year: 2026, quarter: 9, nodes: NODES }]);
ok('a quarter outside 1–4 is refused', r.body.ok === false && r.body.err === 'bad_doc', JSON.stringify(r.body));
r = await call('saveStructure', ['uriah', '1234', 'nope']);
ok('a non-object document is refused', r.body.ok === false && r.body.err === 'bad_doc');

console.log('\n=== reading back, and copying forward ===');
r = await call('getStructure', ['dara', '1234', 'poipet', 2026, 3]);
ok('the saved quarter reads back as saved', r.body.source === 'saved' && r.body.doc.nodes.length === 4);
r = await call('getStructure', ['dara', '1234', 'poipet', 2026, 4]);
ok('the next quarter, unsaved, shows the previous one marked copied', r.body.source === 'copied' && r.body.doc.quarter === 3 && r.body.doc.nodes.length === 4, r.body.source);
ok('but answers with the quarter that was asked for', r.body.year === 2026 && r.body.quarter === 4);
r = await call('getStructure', ['dara', '1234', 'poipet', 2027, 1]);
ok('a new year copies forward from the last quarter of the old one', r.body.source === 'copied' && r.body.doc.year === 2026 && r.body.doc.quarter === 3);
r = await call('getStructure', ['dara', '1234', 'poipet', 2026, 2]);
ok('an earlier quarter never copies from a later one', r.body.source === 'none' && r.body.doc === null, r.body.source);
r = await call('getStructure', ['dara', '1234', 'siemreap', 2026, 4]);
ok('the other campus has its own structure and copies nothing from Poipet', r.body.source === 'none');

r = await call('saveStructure', ['uriah', '1234', { campus: 'poipet', year: 2026, quarter: 4, nodes: NODES.slice(0, 2) }]);
ok('saving the copied quarter makes it its own', r.body.ok === true && mem.structure.length === 2);
r = await call('getStructure', ['dara', '1234', 'poipet', 2026, 4]);
ok('and it now reads back as saved, with its own nodes', r.body.source === 'saved' && r.body.doc.nodes.length === 2);
r = await call('getStructure', ['dara', '1234', 'poipet', 2026, 3]);
ok('the earlier quarter is untouched', r.body.doc.nodes.length === 4);
r = await call('saveStructure', ['uriah', '1234', { campus: 'poipet', year: 2026, quarter: 4, nodes: NODES.slice(0, 1) }]);
ok('saving the same quarter again replaces it rather than adding a row', r.body.ok === true && mem.structure.length === 2 && mem.structure.find(x => x.quarter === 4).nodes.length === 1);

console.log('\n=== the boot payload ===');
r = await call('getMyBoot', ['dara', '1234']);
ok('boot carries a structure answer for the person’s campus', r.body.structure && r.body.structure.ok === true && r.body.structure.campus === 'poipet', JSON.stringify(r.body.structure && [r.body.structure.campus, r.body.structure.year, r.body.structure.quarter]));
ok('for the current year and a quarter in 1–4', r.body.structure.year === new Date().getUTCFullYear() && r.body.structure.quarter >= 1 && r.body.structure.quarter <= 4);
r = await call('getData', ['leadercode']);
ok('the dashboard payload does not carry the structure', !('structure' in r.body));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
