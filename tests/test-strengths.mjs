/* CliftonStrengths, as recorded in this app: what is stored and who sees it.

   Recorded, not assessed — strengths.js explains why the app never gives the
   test or carries Gallup's descriptions. What is checked here is the part the
   app owns: a Top 5 (up to 10) of real theme names, in order, with a note in the
   person's own words per theme; the same visibility lines as personality types
   (nothing on the public roster, teammates only while shared); and the server's
   list of 34 staying the same as the page's. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('strengths');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) {
  if (f.endsWith('.js')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
}
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const S = new Function(fs.readFileSync(PUBLIC + '/strengths.js', 'utf8') + ';return {GP_STHEMES, GP_STHEME_LIST, GP_SDOMAINS, GP_SMAX};')();

const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const mk = o => Object.assign({ active: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Staff', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
mem.staff = [
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com',
    strengths: { top: ['Empathy', 'Harmony', 'Includer', 'Responsibility', 'Positivity'], notes: { Empathy: 'I notice a hard day.' }, share: true } }),
  mk({ id: 'st3', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com',
    strengths: { top: ['Analytical', 'Learner', 'Input', 'Context', 'Deliberative'], notes: {}, share: false } })
];
async function call(fn, args) {
  const r = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return r.json();
}
const me = () => mem.staff.find(s => s.id === 'st1');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}

/* ---------- 1. the list ---------- */
{
  ok('thirty-four themes, none twice', S.GP_STHEME_LIST.length === 34 && new Set(S.GP_STHEME_LIST).size === 34);
  ok('in four domains of 9, 8, 9 and 8',
    JSON.stringify(S.GP_SDOMAINS.map(d => S.GP_STHEMES[d.id].length)) === '[9,8,9,8]');
  const src = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
  const server = JSON.parse(src.match(/const STHEME_LIST = (\[[^\]]+\])/)[1].replace(/'/g, '"').replace(/\s+/g, ' '));
  ok('the server knows the same 34 as the page',
    JSON.stringify(server.slice().sort()) === JSON.stringify(S.GP_STHEME_LIST.slice().sort()));
  /* the reason this file exists at all is that the app records, never assesses */
  const page = fs.readFileSync(PUBLIC + '/strengths.js', 'utf8');
  ok('strengths.js carries names only — no descriptions, no questions',
    !/about:|description:|question|statement/i.test(page.replace(/\/\*[\s\S]*?\*\//g, '')));
}

/* ---------- 2. saving ---------- */
{
  const r = await call('saveMyStrengths', ['sreilea', '1234', {
    top: ['Learner', 'Developer', 'Achiever', 'Empathy', 'Futuristic'],
    notes: { Developer: 'I love watching new staff grow.', Woo: 'not one of mine', Nonsense: 'x' } }]);
  ok('a Top 5 saves in the order given', r.ok && JSON.stringify(me().strengths.top) === '["Learner","Developer","Achiever","Empathy","Futuristic"]',
    JSON.stringify(me().strengths && me().strengths.top));
  ok('with the note for a theme in the list', me().strengths.notes.Developer === 'I love watching new staff grow.');
  ok('and without notes for themes that are not', !('Woo' in me().strengths.notes) && !('Nonsense' in me().strengths.notes),
    JSON.stringify(me().strengths.notes));
  ok('sharing is on unless turned off', r.strengths.share === true);
  ok('my directory entry carries the names straight away', r.staff && JSON.stringify(r.staff.strengths) === JSON.stringify(me().strengths.top));

  const drop = await call('saveMyStrengths', ['sreilea', '1234', { top: ['Learner', 'Achiever', 'Empathy', 'Futuristic', 'Focus'] }]);
  ok('taking a theme out takes its note with it', drop.ok && !('Developer' in me().strengths.notes), JSON.stringify(me().strengths.notes));

  const ten = ['Achiever', 'Arranger', 'Belief', 'Consistency', 'Deliberative', 'Discipline', 'Focus', 'Responsibility', 'Restorative', 'Activator'];
  const r10 = await call('saveMyStrengths', ['sreilea', '1234', { top: ten }]);
  ok('a Top 10 is fine', r10.ok && me().strengths.top.length === 10);
}

/* ---------- 3. refusals ---------- */
{
  const before = JSON.stringify(me().strengths);
  const bad = [
    [{ top: ['Achiever', 'Wizardry'] }, 'bad_theme', 'a theme that does not exist'],
    [{ top: ['Achiever', 'Achiever'] }, 'duplicate', 'the same theme twice'],
    [{ top: [] }, 'bad_count', 'an empty list'],
    [{ top: S.GP_STHEME_LIST.slice(0, 11) }, 'bad_count', 'eleven themes'],
    [{ top: 'Achiever' }, 'bad_count', 'a string instead of a list'],
    [{ notes: 'hello' }, 'bad_notes', 'notes that are not a map']
  ];
  for (const [payload, err, what] of bad) {
    const r = await call('saveMyStrengths', ['sreilea', '1234', payload]);
    ok('refuses ' + what, r.ok === false && r.err === err, JSON.stringify(r));
  }
  ok('and nothing refused was stored', JSON.stringify(me().strengths) === before);
  const wrong = await call('saveMyStrengths', ['sreilea', '9999', { top: ['Woo'] }]);
  ok('a wrong PIN saves nothing', wrong.ok === false && JSON.stringify(me().strengths) === before);
}

/* ---------- 4. who sees what ---------- */
await call('saveMyStrengths', ['sreilea', '1234', { top: ['Learner', 'Developer', 'Achiever', 'Empathy', 'Futuristic'], notes: { Learner: 'Always reading.' } }]);
{
  const pub = JSON.stringify(await call('teamRoster', []));
  ok('the public roster carries no strengths — for anyone', !/strengths|Learner|Empathy|Analytical/.test(pub));
  const signed = await call('teamRoster', ['mealea', '1234']);
  const by = id => signed.find(x => x.id === id) || {};
  ok('signed-in staff see a shared Top 5, in order',
    JSON.stringify(by('st1').strengths) === '["Learner","Developer","Achiever","Empathy","Futuristic"]', JSON.stringify(by('st1').strengths));
  ok('the directory copy is names only — notes stay on the profile', !/Always reading/.test(JSON.stringify(signed)));
  ok('someone with sharing off shows none', !by('st3').strengths);

  const mealea = await call('staffProfile', ['sreilea', '1234', 'st2']);
  ok('a teammate\'s profile shows their themes and their own words',
    mealea.strengths && mealea.strengths.top[0] === 'Empathy' && mealea.strengths.notes.Empathy === 'I notice a hard day.');
  const vuthy = await call('staffProfile', ['sreilea', '1234', 'st3']);
  ok('and nothing for someone not sharing', vuthy.strengths === null && !/Analytical/.test(JSON.stringify(vuthy)));

  const boot = await call('getMyBoot', ['sreilea', '1234']);
  ok('my own boot carries my strengths and sharing choice',
    boot.profile.strengths && boot.profile.strengths.share === true && boot.profile.strengths.notes.Learner === 'Always reading.');
}

/* ---------- 5. off, and cleared ---------- */
{
  await call('saveMyStrengths', ['sreilea', '1234', { share: false }]);
  const signed = await call('teamRoster', ['mealea', '1234']);
  ok('turning sharing off takes them off the directory at once', !(signed.find(x => x.id === 'st1') || {}).strengths);
  const mine = await call('getMyBoot', ['sreilea', '1234']);
  ok('while I still see them myself', mine.profile.strengths && mine.profile.strengths.top.length === 5);
  await call('saveMyStrengths', ['sreilea', '1234', { clear: true }]);
  ok('clearing removes them entirely', !me().strengths);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
