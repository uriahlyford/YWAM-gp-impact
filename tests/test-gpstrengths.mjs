/* GP Strengths — the free strengths finder, GP's own: the content, the pairs,
   the scoring and who sees what.

   Checked here: thirty-four strengths in four groups of 9, 8, 9 and 8, six
   statements each, none of them sharing a name with a Gallup theme or a
   personality type; 102 pairs that are fair (every strength six times, three
   each side, always against another group and against every other group at
   least once, never the same pair twice, never in two pairs in a row); the server's copy of the ids and pairs matching the page's; the server
   working out the Top 5 itself from the answers; and the visibility lines —
   nothing on the public roster, the Top 5 (never the answers or scores) to
   signed-in teammates while shared, everything to the owner. */
import { REPO, PUBLIC, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('gpstrengths');
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
const G = new Function(fs.readFileSync(PUBLIC + '/gpstrengths.js', 'utf8') +
  ';return {GP_GSGROUPS, GP_GSTRENGTHS, GP_GS_IDS, GP_GSPAIRS, gpGSScore, gpGSById, gpGSGroup};')();
/* Gallup's 34 CliftonStrengths theme names — here only so the test can make
   sure none of GP's own strengths ever borrows one. The app never shows or
   uses them; GP Strengths is GP's own. */
const GALLUP_34 = ['Achiever', 'Arranger', 'Belief', 'Consistency', 'Deliberative', 'Discipline', 'Focus',
  'Responsibility', 'Restorative', 'Activator', 'Command', 'Communication', 'Competition', 'Maximizer',
  'Self-Assurance', 'Significance', 'Woo', 'Adaptability', 'Connectedness', 'Developer', 'Empathy', 'Harmony',
  'Includer', 'Individualization', 'Positivity', 'Relator', 'Analytical', 'Context', 'Futuristic', 'Ideation',
  'Input', 'Intellection', 'Learner', 'Strategic'];
const P = new Function(fs.readFileSync(PUBLIC + '/personality.js', 'utf8') + ';return {GP_PTYPES};')();

const H = (p, s) => crypto.createHash('sha256').update(s + ':' + String(p), 'utf8').digest('hex');
const mk = o => Object.assign({ active: true, campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe',
  role: 'Staff', surveyToken: 'tok_' + o.id }, o, { pinSalt: o.id, pinHash: H('1234', o.id) });
mem.staff = [
  mk({ id: 'st1', name: 'Sreilea Chan', username: 'sreilea', email: 's@e.com' }),
  mk({ id: 'st2', name: 'Mealea Sok', username: 'mealea', email: 'm@e.com' }),
  mk({ id: 'st3', name: 'Vuthy Lim', username: 'vuthy', email: 'v@e.com',
    gstrengths: { answers: {}, scores: {}, top: ['factfinder', 'orderly', 'curious', 'solver', 'dependable'], share: false } })
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
/* someone who leans, every time, towards the strengths in `likes` */
function answersFor(likes, strength) {
  const a = {};
  G.GP_GSPAIRS.forEach((p, i) => {
    const L = likes.indexOf(p[0]) > -1, R = likes.indexOf(p[2]) > -1;
    a['p' + i] = L && !R ? -strength : (R && !L ? strength : 0);
  });
  return a;
}

/* ---------- 1. the content ---------- */
{
  ok('thirty-four strengths, none twice', G.GP_GSTRENGTHS.length === 34 && new Set(G.GP_GS_IDS).size === 34);
  ok('in four groups of 9, 8, 9 and 8',
    JSON.stringify(G.GP_GSGROUPS.map(g => G.GP_GSTRENGTHS.filter(s => s.group === g.id).length)) === '[9,8,9,8]');
  ok('every strength has its words: tagline, about, two best, two watch, a give, six statements',
    G.GP_GSTRENGTHS.every(s => s.name && s.tagline && s.about && s.give && s.best.length === 2 && s.watch.length === 2 &&
      s.statements.length === 6 && s.statements.every(x => typeof x === 'string' && x.length > 10)));
  const all = G.GP_GSTRENGTHS.flatMap(s => s.statements);
  ok('204 statements, none twice', all.length === 204 && new Set(all).size === 204);
  const low = x => x.toLowerCase().replace(/[^a-z]/g, '');
  const gallup = GALLUP_34.map(low);
  ok('no strength shares a name with a CliftonStrengths theme',
    G.GP_GSTRENGTHS.every(s => gallup.indexOf(low(s.name)) === -1 && gallup.indexOf(low(s.id)) === -1),
    G.GP_GSTRENGTHS.filter(s => gallup.indexOf(low(s.name)) > -1).map(s => s.name).join(','));
  /* not just the exact names — no variant of one either (Achieving, Focused,
     Communicator…): a Gallup name's first five letters may not appear in a GP
     strength's name, nor a GP name's in a Gallup one */
  const stem = x => low(x).slice(0, 5);
  const clash = G.GP_GSTRENGTHS.filter(s => GALLUP_34.some(g => low(s.name).indexOf(stem(g)) > -1 || low(g).indexOf(stem(s.name)) > -1));
  ok('and no strength is a variant of a Gallup theme name', clash.length === 0, clash.map(s => s.name).join(','));
  ok('and none with a personality type',
    G.GP_GSTRENGTHS.every(s => Object.values(P.GP_PTYPES).every(ty => low(ty.name) !== low(s.name))));
  ok('and Gallup\'s four domain names are not the groups',
    G.GP_GSGROUPS.every(g => ['executing', 'influencing', 'relationshipbuilding', 'strategicthinking'].indexOf(low(g.name)) === -1));
  ok('every group has a colour, a tint and an ink', G.GP_GSGROUPS.every(g => /^#[0-9A-F]{6}$/i.test(g.color) && /^#[0-9A-F]{6}$/i.test(g.tint) && /^#[0-9A-F]{6}$/i.test(g.ink)));
}

/* ---------- 2. the pairs are fair ---------- */
{
  const pairs = G.GP_GSPAIRS;
  ok('102 pairs', pairs.length === 102);
  const n = {}, left = {}, right = {}, used = {};
  pairs.forEach(p => {
    n[p[0]] = (n[p[0]] || 0) + 1; n[p[2]] = (n[p[2]] || 0) + 1;
    left[p[0]] = (left[p[0]] || 0) + 1; right[p[2]] = (right[p[2]] || 0) + 1;
    used[p[0] + '|' + p[1]] = (used[p[0] + '|' + p[1]] || 0) + 1;
    used[p[2] + '|' + p[3]] = (used[p[2] + '|' + p[3]] || 0) + 1;
  });
  ok('every strength in exactly six pairs', G.GP_GS_IDS.every(id => n[id] === 6));
  ok('three times on the left, three on the right', G.GP_GS_IDS.every(id => left[id] === 3 && right[id] === 3));
  ok('each of the 204 statements used once', Object.keys(used).length === 204 && Object.values(used).every(v => v === 1));
  ok('always against a different group',
    pairs.every(p => G.gpGSById(p[0]).group !== G.gpGSById(p[2]).group));
  const key = p => [p[0], p[2]].sort().join('|');
  ok('never the same two strengths twice', new Set(pairs.map(key)).size === 102);
  const meet = {};
  pairs.forEach(p => { const a = G.gpGSById(p[0]), b = G.gpGSById(p[2]); meet[a.id + '>' + b.group] = 1; meet[b.id + '>' + a.group] = 1; });
  ok('every strength meets every other group at least once',
    G.GP_GSTRENGTHS.every(s => G.GP_GSGROUPS.every(g => g.id === s.group || meet[s.id + '>' + g.id])));
  ok('no strength in two pairs in a row', pairs.every((p, i) => i === 0 ||
    [p[0], p[2]].every(x => x !== pairs[i - 1][0] && x !== pairs[i - 1][2])));
}

/* ---------- 3. the server has the same list ---------- */
{
  const src = fs.readFileSync(REPO + '/netlify/functions/api.js', 'utf8');
  const ids = JSON.parse(src.match(/const GS_IDS = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
  const sp = JSON.parse(src.match(/const GS_PAIRS = (\[[\s\S]*?\]\s*\]);/)[1].replace(/'/g, '"'));
  ok('the server knows the same thirty-four, in the same order', JSON.stringify(ids) === JSON.stringify(G.GP_GS_IDS));
  ok('and the same 102 pairs, sides and all',
    JSON.stringify(sp) === JSON.stringify(G.GP_GSPAIRS.map(p => [p[0], p[2]])));
}

/* ---------- 4. scoring ---------- */
{
  const likes = ['comforter', 'mentor', 'welcomer', 'peacemaker', 'voice'];
  const r = G.gpGSScore(answersFor(likes, 2));
  ok('someone who always picks five strengths gets those five', r && r.top.slice().sort().join() === likes.slice().sort().join(),
    r && r.top.join(','));
  ok('scores stay between -12 and 12', Object.values(r.scores).every(v => v >= -12 && v <= 12));
  ok('every choice moves one strength up and one down by the same', Object.values(r.scores).reduce((a, b) => a + b, 0) === 0);
  const part = answersFor(likes, 2); delete part.p7;
  ok('a gap means no result yet', G.gpGSScore(part) === null);
  ok('and an answer off the scale too', G.gpGSScore(Object.assign({}, answersFor(likes, 1), { p3: 3 })) === null);
  /* strong wins break a tie before list order does */
  const a = {}; G.GP_GSPAIRS.forEach((p, i) => { a['p' + i] = 0; });
  const tie = G.gpGSScore(a);
  ok('all "both equally" ties break on list order', tie.top.join() === G.GP_GS_IDS.slice(0, 5).join());
}

/* ---------- 5. saving — the server works it out ---------- */
const likes = ['visionary', 'starter', 'inventor', 'optimist', 'curious'];
{
  const ans = answersFor(likes, 2);
  const want = G.gpGSScore(ans).top;
  const r = await call('saveMyGStrengths', ['sreilea', '1234', { answers: ans, top: ['hardworker', 'orderly'] }]);
  ok('a full set of answers saves', r.ok === true, JSON.stringify(r).slice(0, 120));
  ok('the Top 5 is the server\'s, the same the page works out', JSON.stringify(me().gstrengths.top) === JSON.stringify(want),
    JSON.stringify(me().gstrengths.top));
  ok('a Top 5 sent from the page is ignored', me().gstrengths.top.indexOf('hardworker') === -1);
  ok('scores and answers are kept for the owner', me().gstrengths.scores.visionary > 0 && me().gstrengths.answers.p0 !== undefined);
  ok('sharing is on unless turned off', r.gstrengths.share === true);
  ok('my directory entry carries the Top 5 straight away', JSON.stringify(r.staff.gstrengths) === JSON.stringify(want));

  const before = JSON.stringify(me().gstrengths);
  const part = Object.assign({}, ans); delete part.p101;
  const inc = await call('saveMyGStrengths', ['sreilea', '1234', { answers: part }]);
  ok('an unfinished test is refused', inc.ok === false && inc.err === 'incomplete');
  const bad = await call('saveMyGStrengths', ['sreilea', '1234', { answers: Object.assign({}, ans, { p0: 9 }) }]);
  ok('an answer off the scale is refused', bad.ok === false && bad.err === 'incomplete');
  const wrong = await call('saveMyGStrengths', ['sreilea', '9999', { answers: ans }]);
  ok('a wrong PIN saves nothing', wrong.ok === false);
  ok('and nothing refused was stored', JSON.stringify(me().gstrengths) === before);
  const none = await call('saveMyGStrengths', ['mealea', '1234', { share: false }]);
  ok('turning sharing off before taking it is refused', none.ok === false && none.err === 'no_result' && !mem.staff[1].gstrengths);
}

/* ---------- 6. who sees what ---------- */
{
  const pub = JSON.stringify(await call('teamRoster', []));
  ok('the public roster carries no strengths — for anyone', !/gstrengths|visionary|factfinder/.test(pub));
  const signed = await call('teamRoster', ['mealea', '1234']);
  const by = id => signed.find(x => x.id === id) || {};
  ok('signed-in staff see a shared Top 5, in order', JSON.stringify(by('st1').gstrengths) === JSON.stringify(me().gstrengths.top));
  ok('never the answers or scores', !/answers|scores|"p0"/.test(JSON.stringify(signed)));
  ok('someone with sharing off shows none', !by('st3').gstrengths);

  const prof = await call('staffProfile', ['mealea', '1234', 'st1']);
  ok('their profile page carries the Top 5', JSON.stringify(prof.gstrengths) === JSON.stringify(me().gstrengths.top));
  ok('and still not the answers or scores', !/"answers"|"scores"/.test(JSON.stringify(prof.gstrengths)));
  const vuthy = await call('staffProfile', ['mealea', '1234', 'st3']);
  ok('nothing for someone not sharing', vuthy.gstrengths === null && !/factfinder/.test(JSON.stringify(vuthy)));

  const boot = await call('getMyBoot', ['sreilea', '1234']);
  ok('my own boot carries everything', boot.profile.gstrengths && boot.profile.gstrengths.scores &&
    boot.profile.gstrengths.answers && boot.profile.gstrengths.share === true);
}

/* ---------- 7. off, retaken, cleared ---------- */
{
  await call('saveMyGStrengths', ['sreilea', '1234', { share: false }]);
  const signed = await call('teamRoster', ['mealea', '1234']);
  ok('turning sharing off takes the Top 5 off the directory at once', !(signed.find(x => x.id === 'st1') || {}).gstrengths);
  const mine = await call('getMyBoot', ['sreilea', '1234']);
  ok('while I still see it myself', mine.profile.gstrengths && mine.profile.gstrengths.top.length === 5);
  const again = await call('saveMyGStrengths', ['sreilea', '1234', { answers: answersFor(['coordinator', 'hardworker', 'dependable', 'improver', 'solver'], 2) }]);
  ok('a retake replaces the result', again.ok && me().gstrengths.top.indexOf('coordinator') > -1 && me().gstrengths.top.indexOf('visionary') === -1);
  ok('and keeps the sharing choice', me().gstrengths.share === false);
  await call('saveMyGStrengths', ['sreilea', '1234', { clear: true }]);
  ok('clearing removes it entirely', !me().gstrengths);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
