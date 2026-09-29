/* Personality types: what gets stored, and who can see it.

   The feature is friendly; the data is still personal. So most of this file is
   about the lines around it rather than the happy path:

     · the public, no-PIN teamRoster must not gain ANY of it — that endpoint is
       readable by anyone on the internet;
     · a teammate sees a type (and its avatar) only while its owner shares it;
     · the season someone says they are in ("a stretched season") is theirs
       alone, and must never appear in anyone else's view;
     · the server refuses a type and bars that contradict each other, so the
       letters and the percentages on screen can never disagree.

   Also that personality.js and api.js agree on the type and season lists, and
   that the questionnaire's scoring is balanced — agreeing with everything must
   not produce a type. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('personality');
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

/* personality.js, as the page loads it */
const P = new Function(fs.readFileSync(PUBLIC + '/personality.js', 'utf8') +
  ';return {GP_PQUESTIONS, GP_PTYPE_CODES, GP_PSEASONS, GP_PTYPES, gpPScore, gpPAvatar, gpPTipsFor, gpPJobOf};')();

const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const mk = o => Object.assign({ active: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Staff', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
function seed() {
  for (const k of Object.keys(mem)) delete mem[k];
  mem.staff = [
    mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),
    mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com', sex: 'female',
      personality: { type: 'ESFJ', scores: { E: 71, S: 66, T: 30, J: 62 }, source: 'test', share: true, season: 'stretched' } }),
    mk({ id: 'st3', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com', sex: 'male',
      personality: { type: 'INTJ', scores: { E: 20, S: 35, T: 80, J: 77 }, source: 'test', share: false, season: 'outreach' } })
  ];
}
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

/* ---------- 1. the questionnaire itself ---------- */
{
  const per = {};
  P.GP_PQUESTIONS.forEach(q => { per[q.key] = (per[q.key] || 0) + 1; });
  ok('forty statements, five keyed each way on every pair',
    P.GP_PQUESTIONS.length === 40 && 'EISNTFJP'.split('').every(k => per[k] === 5), JSON.stringify(per));
  ok('every statement has its own id', new Set(P.GP_PQUESTIONS.map(q => q.id)).size === 40);
  const all = {}; P.GP_PQUESTIONS.forEach(q => { all[q.id] = 3; });
  const r = P.gpPScore(all);
  ok('agreeing with everything lands dead centre, not on a type',
    r && Object.values(r.scores).every(v => v === 50), JSON.stringify(r));
  const infj = {}; P.GP_PQUESTIONS.forEach(q => { infj[q.id] = 'INFJ'.indexOf(q.key) > -1 ? 3 : -3; });
  ok('a clear INFJ scores as INFJ', P.gpPScore(infj).type === 'INFJ', JSON.stringify(P.gpPScore(infj)));
  delete infj.q17;
  ok('one unanswered statement gives no type at all', P.gpPScore(infj) === null);
  ok('all sixteen types are written up',
    P.GP_PTYPE_CODES.every(c => { const t = P.GP_PTYPES[c]; return t && t.name && t.about && t.strengths.length && t.watch.length && t.workWith.length; }));
  ok('all thirty-two avatars draw', P.GP_PTYPE_CODES.every(c => P.gpPAvatar(c, 'male', 64).indexOf('<svg') === 0 && P.gpPAvatar(c, 'female', 64).indexOf('<svg') === 0));
  ok('every type gets tips in every season',
    P.GP_PTYPE_CODES.every(c => P.GP_PSEASONS.every(s => P.gpPTipsFor(c, 'people', s.id).length >= 2)));
}

/* ---------- 2. the two lists agree ---------- */
{
  const src = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
  const codes = JSON.parse(src.match(/const PTYPE_CODES = (\[[^\]]+\])/)[1].replace(/'/g, '"').replace(/\s+/g, ' '));
  const seasons = JSON.parse(src.match(/const PSEASON_IDS = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
  ok('the server knows the same sixteen types as the page',
    JSON.stringify(codes.slice().sort()) === JSON.stringify(P.GP_PTYPE_CODES.slice().sort()));
  ok('and the same seasons',
    JSON.stringify(seasons) === JSON.stringify(P.GP_PSEASONS.map(s => s.id)));
}

/* ---------- 3. saving a result ---------- */
seed();
{
  const ans = {}; P.GP_PQUESTIONS.forEach(q => { ans[q.id] = 'ENFP'.indexOf(q.key) > -1 ? 2 : -1; });
  const res = P.gpPScore(ans);
  const r = await call('saveMyPersonality', ['sreilea', '1234', { type: res.type, scores: res.scores, source: 'test', sex: 'female' }]);
  ok('the page\'s own scoring is accepted as it stands', r.ok && r.personality && r.personality.type === res.type, JSON.stringify(r.personality));
  ok('the type, bars and sex are stored', me().personality.type === res.type &&
    JSON.stringify(me().personality.scores) === JSON.stringify(res.scores) && me().sex === 'female');
  ok('sharing is on unless someone turns it off', r.personality.share === true);
  ok('the answer carries my avatar for my directory card', r.staff && r.staff.avatar && r.staff.avatar.type === res.type);
}

/* ---------- 4. what the server refuses ---------- */
{
  const bad = [
    [{ type: 'ABCD', source: 'self' }, 'bad_type', 'a type that does not exist'],
    [{ type: 'INFJ', source: 'test' }, 'bad_scores', 'a test result with no bars'],
    [{ type: 'INFJ', source: 'test', scores: { E: 80, S: 20, T: 20, J: 80 } }, 'bad_scores', 'bars that say E on a type that says I'],
    [{ type: 'INFJ', source: 'test', scores: { E: 20, S: 20, T: 20, J: 180 } }, 'bad_scores', 'a bar over 100%'],
    [{ type: 'INFJ', source: 'test', scores: { E: 20, S: 20, T: 20 } }, 'bad_scores', 'a missing bar'],
    [{ season: 'party' }, 'bad_season', 'a season that does not exist']
  ];
  const before = JSON.stringify(me().personality);
  for (const [payload, err, what] of bad) {
    const r = await call('saveMyPersonality', ['sreilea', '1234', payload]);
    ok('refuses ' + what, r.ok === false && r.err === err, JSON.stringify(r));
  }
  ok('and nothing it refused was stored', JSON.stringify(me().personality) === before);
  const wrong = await call('saveMyPersonality', ['sreilea', '9999', { type: 'INFJ', source: 'self' }]);
  ok('a wrong PIN saves nothing', wrong.ok === false && JSON.stringify(me().personality) === before);
}

/* ---------- 5. picking a type you already know ---------- */
{
  const r = await call('saveMyPersonality', ['sreilea', '1234', { type: 'ISFJ', source: 'self' }]);
  ok('a picked type stores without bars', r.ok && me().personality.type === 'ISFJ' && me().personality.scores === null && me().personality.source === 'self');
  const s = await call('saveMyPersonality', ['sreilea', '1234', { season: 'school' }]);
  ok('a season can be set on its own and keeps the type', s.ok && me().personality.type === 'ISFJ' && me().personality.season === 'school');
}

/* ---------- 6. who sees what ---------- */
{
  const pub = await call('teamRoster', []);
  const leak = JSON.stringify(pub);
  ok('the public roster carries no types, avatars or sex — for anyone',
    !/"avatar"|"personality"|"sex"|"season"|ISFJ|ESFJ|INTJ/.test(leak), leak.slice(0, 120));

  const signed = await call('teamRoster', ['mealea', '1234']);
  const by = id => signed.find(x => x.id === id) || {};
  ok('signed-in staff see a shared type and its avatar',
    by('st1').avatar && by('st1').avatar.type === 'ISFJ' && by('st2').avatar.type === 'ESFJ' && by('st2').avatar.sex === 'female',
    JSON.stringify([by('st1').avatar, by('st2').avatar]));
  ok('but not the type of someone who switched sharing off', !by('st3').avatar, JSON.stringify(by('st3')));
  ok('and never anyone\'s season', !/season|stretched|outreach|school/.test(JSON.stringify(signed)));

  const boot = await call('getMyBoot', ['sreilea', '1234']);
  ok('the boot roster matches the signed-in roster',
    (boot.roster.find(x => x.id === 'st2') || {}).avatar && !(boot.roster.find(x => x.id === 'st3') || {}).avatar);
  ok('my own boot carries my season and sharing choice',
    boot.profile.personality && boot.profile.personality.season === 'school' && boot.profile.personality.share === true);
  ok('and nobody else\'s season rides along in it',
    !/stretched/.test(JSON.stringify(boot)) && !/"outreach"/.test(JSON.stringify(boot.roster)));

  const mealea = await call('staffProfile', ['sreilea', '1234', 'st2']);
  ok('a teammate\'s profile shows their shared type and bars',
    mealea.personality && mealea.personality.type === 'ESFJ' && mealea.personality.scores.E === 71, JSON.stringify(mealea.personality));
  ok('without their season', !/season|stretched/.test(JSON.stringify(mealea)));
  const vuthy = await call('staffProfile', ['sreilea', '1234', 'st3']);
  ok('a teammate who does not share shows no type at all',
    vuthy.personality === null && !/INTJ|avatar/.test(JSON.stringify(vuthy)), JSON.stringify(vuthy.personality));
}

/* ---------- 7. switching sharing off, and clearing ---------- */
{
  await call('saveMyPersonality', ['sreilea', '1234', { share: false }]);
  const signed = await call('teamRoster', ['mealea', '1234']);
  ok('turning sharing off takes my type off the directory at once',
    !(signed.find(x => x.id === 'st1') || {}).avatar);
  const mine = await call('getMyBoot', ['sreilea', '1234']);
  ok('while I still see it myself', mine.profile.personality && mine.profile.personality.type === 'ISFJ');
  await call('saveMyPersonality', ['sreilea', '1234', { clear: true }]);
  ok('clearing removes the type entirely', !me().personality);
  const orphan = await call('saveMyPersonality', ['sreilea', '1234', { season: 'outreach' }]);
  ok('a season with no type to attach to stores nothing', orphan.ok && !me().personality);
}

/* ---------- 8. the profile field ---------- */
{
  let r = await call('updateProfile', ['sreilea', '1234', { sex: 'male' }]);
  ok('the profile form saves male or female', r.ok && me().sex === 'male' && r.profile.sex === 'male');
  r = await call('updateProfile', ['sreilea', '1234', { sex: 'attack helicopter' }]);
  ok('and anything else is stored as blank', r.ok && me().sex === '');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
