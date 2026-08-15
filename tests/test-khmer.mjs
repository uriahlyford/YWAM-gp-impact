/* Khmer actually reaches the screen, and does not break the layout when it does.

   Two dictionaries: REVIEWED_KM (checked by native speakers) and PENDING_KM
   (translated by Claude, awaiting review). The split has to survive, so this
   asserts it structurally — merging them would quietly lose track of what still
   needs checking.

   The layout half matters because Khmer script is taller than Latin and its words
   do not break on spaces: a label that fits in English can overflow its button in
   Khmer. Every screen is walked in Khmer looking for text escaping its box. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.GP_ROOT || PUBLIC;

const ROSTER = [
  { id: 'a', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true, photo: '' },
  { id: 'b', name: 'Dara Pen', username: 'dara', campus: 'poipet', dept: 'Youth Education', ministry: 'YDC', role: 'Teacher', active: true, photo: '' },
];
const ENTRIES = { poipet: {
  'Community Service|Outreach Teams|Salvations': { '31': 40, '32': 52, '33': 64 },
  'Community Service|Outreach Teams|Teams Hosted': { '33': 12 },
  'Leadership Development|GPDTS|Students Enrolled': { '33': 24 },
  'Youth Education|YDC|Students Enrolled': { '33': 96 },
} };
const SURVEY = [
  { campus: 'poipet', week: 33, device: 't1', lonely: 3, clarity: 8, growth: 7, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0, langHours: 3, minHours: 9, sharedFaith: 1, sabbath: 1, days: 7 },
  { campus: 'poipet', week: 32, device: 't1', lonely: 5, clarity: 6, growth: 6, porn: 0, oneOnOne: 1, exercise: 0, quietTime: 1, debt: 0, langHours: 2, minHours: 7, sharedFaith: 0, sabbath: 1, days: 7 },
];
const OKRS = [{ id: 'o1', campus: 'poipet', quarter: 3, dept: 'Community Service', objective: 'Reach five new villages',
  krs: [{ text: 'Host 12 outreach teams', metricKey: 'Community Service|Outreach Teams|Teams Hosted', target: 12, manual: 0 }] }];
const DATA = { leader: false, entries: ENTRIES, okrs: OKRS, survey: SURVEY, roster: ROSTER };
const GOALS = [{ week: 33, pct: 62, updated: '', items: [
  { text: 'Disciple two students', pct: 60, done: false, metricKey: '' },
  { text: 'Finish the handbook', pct: 25, done: false, metricKey: '' }] }];
const BOOT = {
  ok: true, staff: ROSTER[0], profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: ROSTER,
  logs: [{ staffId: 'a', date: '2026-08-13', week: 33, langHours: 2, minHours: 6, workout: true, bible: true, quietTime: true, oneOnOne: false, sharedFaith: false, sabbath: false, clarity: 8, growth: 7, lonely: 3, porn: false, habits: { bible: true, quietTime: true, workout: true } }],
  habits: null, mentees: [], mentorRequests: [], goals: GOALS, checkins: SURVEY,
  trips: { ok: true, trips: [], years: {} }, tripRequests: [],
  ministry: { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, daily: {}, pins: ['Salvations'] },
  base: { leader: false, entries: ENTRIES, okrs: OKRS, survey: SURVEY },
};

const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png' };
const srv = http.createServer(function (req, res) {
  const f = path.join(ROOT, req.url.split('?')[0]);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/plain' });
  res.end(fs.readFileSync(f));
});
await new Promise(function (r) { srv.listen(0, r); });
const BASE = 'http://127.0.0.1:' + srv.address().port;
const browser = await chromium.launch({ executablePath: CHROMIUM });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
const KH = /[ក-៿]/;

/* ---------- 1. the dictionaries, as files ---------- */
{
  const src = fs.readFileSync(path.join(ROOT, 'km.js'), 'utf8');
  const sandbox = {};
  new Function('g', src + '\ng.R=REVIEWED_KM; g.P=PENDING_KM; g.B=BUILTIN_KM;')(sandbox);
  const R = sandbox.R, P = sandbox.P, B = sandbox.B;
  ok('the reviewed dictionary is still intact', Object.keys(R).length >= 266, Object.keys(R).length + ' entries');
  ok('the pending dictionary carries the new work', Object.keys(P).length > 100, Object.keys(P).length + ' entries');
  /* If these ever merge into one object, nobody can tell any more which strings a
     native speaker has actually read. */
  ok('the two are kept apart', R !== P && Object.keys(P).some(function (k) { return !(k in R); }));
  ok('merged, reviewed wins over pending',
    Object.keys(R).every(function (k) { return B[k] === R[k]; }));
  const blank = Object.keys(P).filter(function (k) { return !String(P[k]).trim(); });
  ok('no pending entry is blank', blank.length === 0, blank.slice(0, 3).join(', '));
  const notKhmer = Object.keys(P).filter(function (k) {
    return !KH.test(P[k]) && P[k] === k;      // untranslated, not a deliberate brand name
  });
  ok('every pending entry is either Khmer or a deliberate passthrough',
    notKhmer.length <= 1, notKhmer.join(', '));
  /* A template's placeholders have to survive translation or the number vanishes. */
  const bad = [];
  Object.keys(P).forEach(function (k) {
    const want = (k.match(/\{(\w+)\}/g) || []).sort().join(',');
    const got = (String(P[k]).match(/\{(\w+)\}/g) || []).sort().join(',');
    if (want !== got) bad.push(k + '  [' + want + '] -> [' + got + ']');
  });
  ok('every {placeholder} survives translation', bad.length === 0, bad.slice(0, 3).join(' | '));
}

/* ---------- 1b. every string the code asks for has a translation ----------
   The dictionary being full is not the same as the code being translated: a
   t('...') with no entry silently renders English, and nobody notices until a
   Khmer speaker is looking at it. This walks the source instead of the doc, so a
   string added tomorrow shows up here rather than in a list somebody forgot. */
{
  const unesc = function (x) {
    return x.replace(/\\u([0-9a-fA-F]{4})/g, function (w, h) { return String.fromCharCode(parseInt(h, 16)); })
      .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  };
  const src = fs.readFileSync(path.join(ROOT, 'km.js'), 'utf8');
  const sandbox = {};
  new Function('g', src + '\ng.B=BUILTIN_KM;')(sandbox);
  const have = sandbox.B;
  const missing = [];
  for (const f of ['index.html', 'teams.html', 'rollup.js']) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
    /* Every literal inside a t(...) call, not just one starting it — the first
       version of this missed t(cond ? 'a' : 'b') entirely and reported clean while
       two labels were still English on screen. */
    const re = /\b(?:t|gpT)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
    let m;
    while ((m = re.exec(code))) {
      const inner = m[1];
      const lits = inner.match(/'((?:[^'\\]|\\.)*)'/g) || [];
      for (const raw of lits) {
        const lit = unesc(raw.slice(1, -1));
        // Skip separators and punctuation — t('|') is a join, not a sentence.
        if (!/[A-Za-z]/.test(lit)) continue;
        if (!(lit in have) && missing.indexOf(lit) === -1) missing.push(lit);
      }
    }
  }
  ok('every t() string in the code has a translation', missing.length === 0,
    missing.length + ' missing: ' + missing.slice(0, 4).join(' | '));
}

/* ---------- 2. it reaches the screen ---------- */
async function open(file, wait, km) {
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function (r) {
    const fn = (r.request().postDataJSON() || {}).fn;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fn === 'getMyBoot' ? BOOT : DATA) });
  });
  await p.addInitScript(function (lang) {
    try {
      localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
      localStorage.setItem('gp-leadercode', 'x');
      sessionStorage.setItem('gp-skip-teams', '1');
      if (lang) localStorage.setItem('gp-lang', lang);
    } catch (e) { }
  }, km ? 'km' : '');
  await p.goto(BASE + '/' + file, { waitUntil: 'commit' });
  await p.waitForSelector(wait, { timeout: 15000 }).catch(function () { });
  await p.waitForTimeout(600);
  return { ctx, p };
}

const SCREENS = [
  { file: 'index.html', wait: '.hero', name: 'dashboard', steps: [] },
  { file: 'index.html', wait: '.hero', name: 'log form', steps: ['[data-view="log"]'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Base', steps: [] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'My week', steps: ['nav.bottom button:nth-child(2)'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Team', steps: ['nav.bottom button:nth-child(3)'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Me', steps: ['nav.bottom button:nth-child(4)'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Health', steps: ['nav.bottom button:nth-child(5)'] },
];

for (const sc of SCREENS) {
  const { ctx, p } = await open(sc.file, sc.wait, true);
  for (const s of sc.steps) { await p.click(s).catch(function () { }); await p.waitForTimeout(500); }
  const r = await p.evaluate(`(function(){
    var main=document.getElementById('main');
    var txt=main?main.textContent:'';
    var kh=(txt.match(/[\\u1780-\\u17FF]/g)||[]).length;
    var letters=(txt.match(/[A-Za-z]/g)||[]).length;
    // Anything whose text spills out of its own box. Khmer runs longer and taller
    // than Latin, so a label that fitted in English can overflow here.
    var spill=[];
    document.querySelectorAll('button, .chip, .rowName, h3, .pmeta, label, nav.bottom button').forEach(function(el){
      var cs=getComputedStyle(el);
      if(cs.overflow==='auto'||cs.overflow==='scroll') return;
      if(el.scrollWidth > el.clientWidth + 2 && cs.overflowX!=='visible') {
        spill.push((el.className||el.tagName)+' "'+el.textContent.trim().slice(0,24)+'" '+el.scrollWidth+'>'+el.clientWidth);
      }
    });
    return { kh:kh, letters:letters, spill:spill,
             wide: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok('km · ' + sc.name + ': the page is actually in Khmer', r.kh > 40, r.kh + ' Khmer chars, ' + r.letters + ' Latin');
  ok('km · ' + sc.name + ': no label overflows its box', r.spill.length === 0, r.spill.slice(0, 3).join(' | '));
  ok('km · ' + sc.name + ': the page does not scroll sideways', !r.wide);
  await ctx.close();
}

/* ---------- 3. a sentence with a number in it keeps its number ---------- */
{
  const { ctx, p } = await open('teams.html', 'nav.bottom button', true);
  await p.click('nav.bottom button:nth-child(2)');
  await p.waitForTimeout(700);
  const r = await p.evaluate(`(function(){
    var txt=document.getElementById('main').textContent;
    return { hasBrace: txt.indexOf('{')>-1,
             goalsHead: (function(){
               var h=[].slice.call(document.querySelectorAll('h3')).filter(function(x){return /[\\u1780-\\u17FF]/.test(x.textContent);});
               return h.length ? h[h.length-1].textContent.trim() : '';
             })() };
  })()`);
  /* An unsubstituted {n} on screen means gpT was handed the wrong variable name. */
  ok('no raw {placeholder} is left on screen', r.hasBrace === false);
  ok('a numbered heading rendered in Khmer', KH.test(r.goalsHead), JSON.stringify(r.goalsHead));
  await ctx.close();
}

/* ---------- 4. English is untouched ---------- */
{
  const { ctx, p } = await open('teams.html', 'nav.bottom button', false);
  const txt = await p.evaluate("document.getElementById('main').textContent");
  ok('English still renders with no Khmer leaking in', !KH.test(txt));
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
