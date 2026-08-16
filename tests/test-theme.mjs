/* Dark mode, and a contrast audit that walks every piece of text on every screen.

   The audit exists because of a real mistake: #4A463D was doing two jobs in the old
   palette — an outlined button border inside the black header, AND body text on
   paper. Tokenising it as a border colour made the scripture card near-black on
   near-black in dark mode. I caught that one by looking at a screenshot, which is
   not a method. This walks the DOM in both themes, works out each element's real
   background by climbing until it finds an opaque one, and fails on anything under
   WCAG AA. It would have caught it. */
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
  'Community Service|Outreach Teams|Volunteers Hosted': { '33': 480 },
  'Leadership Development|GPDTS|Students Enrolled': { '33': 24 },
  'Youth Education|YDC|Students Enrolled': { '33': 96 },
} };
const SURVEY = [
  { campus: 'poipet', week: 33, device: 't1', lonely: 3, clarity: 8, growth: 7, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0, langHours: 3, minHours: 9, sharedFaith: 1, sabbath: 1, days: 7 },
  { campus: 'poipet', week: 32, device: 't1', lonely: 5, clarity: 6, growth: 6, porn: 0, oneOnOne: 1, exercise: 0, quietTime: 1, debt: 0, langHours: 2, minHours: 7, sharedFaith: 0, sabbath: 1, days: 7 },
];
const OKRS = [{ id: 'o1', campus: 'poipet', quarter: 3, dept: 'Community Service', objective: 'Reach five new villages',
  krs: [{ text: 'Host 12 outreach teams', metricKey: 'Community Service|Outreach Teams|Teams Hosted', target: 12, manual: 0 },
        { text: 'Write the volunteer handbook', metricKey: '', target: 0, manual: 40 }] }];
const DATA = { leader: false, entries: ENTRIES, okrs: OKRS, survey: SURVEY, roster: ROSTER };
/* Enough programme records for the Programs screen to paint every element the
   contrast audit needs to see: a chip, a ring, the facts strip and a record row. */
const PROGRAMS = (function () {
  const y = new Date().getFullYear();
  return [
    { id: 'pr_a', kind: 'team', program: 'SVI', campus: 'poipet', year: y, quarter: 1,
      name: 'YWAM Maui', country: 'USA', from: y + '-02-03', to: y + '-02-17',
      male: 5, female: 7, servedMale: 40, servedFemale: 60, activities: 'Teaching English' },
    { id: 'pr_b', kind: 'goal', program: 'SVI', campus: 'poipet', year: y, quarter: 1, target: 250, unit: 'volunteers' },
    { id: 'pr_e', kind: 'issue', program: '', campus: 'poipet', year: y, quarter: 1,
      challenge: 'Fewer volunteer teams', solution: 'Asked two partner bases' },
  ];
})();
const GOALS = [{ week: 33, pct: 62, updated: '', items: [
  { text: 'Disciple two students through Romans', pct: 60, done: false, metricKey: '' },
  { text: 'Finish the volunteer handbook', pct: 25, done: false, metricKey: '' },
  { text: 'Visit five families in Poipet', pct: 100, done: true, metricKey: '' }] }];
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

/* ---------- the audit, run inside the page ---------- */
const AUDIT = `(function(){
  function parse(c){
    var m=/^rgba?\\(([^)]+)\\)$/.exec(c||'');
    if(!m) return null;
    var p=m[1].split(',').map(function(x){return parseFloat(x);});
    return { r:p[0], g:p[1], b:p[2], a:p.length>3?p[3]:1 };
  }
  function lum(c){
    var v=[c.r,c.g,c.b].map(function(x){ x/=255; return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4); });
    return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];
  }
  function over(fg,bg){   // flatten a translucent colour onto its background
    if(fg.a>=1) return fg;
    return { r:fg.r*fg.a+bg.r*(1-fg.a), g:fg.g*fg.a+bg.g*(1-fg.a), b:fg.b*fg.a+bg.b*(1-fg.a), a:1 };
  }
  function ratio(a,b){
    var l1=lum(a), l2=lum(b);
    return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
  }
  function bgOf(el){
    var node=el;
    while(node && node!==document.documentElement){
      var c=parse(getComputedStyle(node).backgroundColor);
      if(c && c.a>0.999) return c;
      node=node.parentElement;
    }
    var root=parse(getComputedStyle(document.documentElement).backgroundColor);
    return (root && root.a>0.999) ? root : { r:255,g:255,b:255,a:1 };
  }
  var out=[];
  document.querySelectorAll('*').forEach(function(el){
    // only elements holding their own visible text
    var own='';
    for(var i=0;i<el.childNodes.length;i++){
      if(el.childNodes[i].nodeType===3) own+=el.childNodes[i].textContent;
    }
    own=own.replace(/\\s+/g,' ').trim();
    if(!own) return;
    var cs=getComputedStyle(el);
    if(cs.visibility==='hidden'||cs.display==='none') return;
    if(parseFloat(cs.opacity)===0) return;
    var r=el.getBoundingClientRect();
    if(r.width<1||r.height<1) return;
    var fg=parse(cs.color); if(!fg) return;
    var bg=bgOf(el);
    // element opacity multiplies the text against its background
    var eo=1, n=el;
    while(n && n!==document.documentElement){ eo*=parseFloat(getComputedStyle(n).opacity)||1; n=n.parentElement; }
    var eff=over({r:fg.r,g:fg.g,b:fg.b,a:fg.a*eo}, bg);
    var size=parseFloat(cs.fontSize), weight=parseInt(cs.fontWeight,10)||400;
    var large=(size>=24)||(size>=18.66&&weight>=700);
    var need=large?3:4.5;
    var got=ratio(eff,bg);
    if(got < need - 0.05){
      out.push({ sel:el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className.trim()?'.'+el.className.trim().split(/\\s+/).join('.'):''),
                 text:own.slice(0,42), got:Math.round(got*100)/100, need:need, size:Math.round(size),
                 fg:cs.color, bg:'rgb('+Math.round(bg.r)+','+Math.round(bg.g)+','+Math.round(bg.b)+')' });
    }
  });
  return out;
})()`;

async function page(scheme, forced) {
  const ctx = await browser.newContext(Object.assign({}, devices['iPhone 13'], { colorScheme: scheme }));
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', function (r) {
    const fn = (r.request().postDataJSON() || {}).fn;
    const body = fn === 'getMyBoot' ? BOOT
      : fn === 'getPrograms' ? { ok: true, year: new Date().getFullYear(), records: PROGRAMS }
      : DATA;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  /* addInitScript(fn, arg) — a .bind()ed function cannot be serialised into the page. */
  await p.addInitScript(function (t) {
    try {
      localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
      localStorage.setItem('gp-leadercode', 'x');
      sessionStorage.setItem('gp-skip-teams', '1');
      if (t) localStorage.setItem('gp-theme', t);
    } catch (e) { }
  }, forced || '');
  return { ctx, p };
}

/* ---------- 1. the switch works in all three states ---------- */
for (const c of [
  { scheme: 'light', forced: '', want: 'light', why: 'light phone, no choice' },
  { scheme: 'dark', forced: '', want: 'dark', why: 'dark phone, no choice' },
  { scheme: 'dark', forced: 'light', want: 'light', why: 'dark phone, reader picked light' },
  { scheme: 'light', forced: 'dark', want: 'dark', why: 'light phone, reader picked dark' },
]) {
  const { ctx, p } = await page(c.scheme, c.forced);
  await p.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await p.waitForSelector('.hero', { timeout: 15000 });
  const got = await p.evaluate(`(function(){
    var bg=getComputedStyle(document.body).backgroundColor;
    var m=/^rgb\\((\\d+)/.exec(bg);
    return { bg:bg, dark: m ? Number(m[1]) < 100 : false,
             attr: document.documentElement.getAttribute('data-theme') || '(none)' };
  })()`);
  ok('theme: ' + c.why + ' → ' + c.want,
    (c.want === 'dark') === got.dark, got.bg + ' attr=' + got.attr);
  await ctx.close();
}

/* ---------- 2. the contrast audit, every screen, both themes ---------- */
const SCREENS = [
  { file: 'index.html', wait: '.hero', name: 'dashboard', steps: [] },
  { file: 'index.html', wait: '.hero', name: 'log form', steps: ['[data-view="log"]'] },
  { file: 'index.html', wait: '.hero', name: 'OKRs', steps: ['[data-view="okr"]'] },
  { file: 'index.html', wait: '.hero', name: 'Programs', steps: ['[data-view="programs"]'] },
  { file: 'index.html', wait: '.hero', name: 'Programs form',
    steps: ['[data-view="programs"]', '#openRecBtn'] },
  /* The report sheet paints its own paper over the app, so it needs auditing in
     both themes like any other screen — a white document with the app's dark-mode
     text colour inherited into it would be unreadable. */
  { file: 'index.html', wait: '.hero', name: 'Programs report',
    steps: ['[data-view="programs"]', '#genReportBtn'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Base', steps: [] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'My week', steps: ['nav.bottom button:nth-child(2)'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Team', steps: ['nav.bottom button:nth-child(3)'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Me', steps: ['nav.bottom button:nth-child(4)'] },
  { file: 'teams.html', wait: 'nav.bottom button', name: 'Health', steps: ['nav.bottom button:nth-child(5)'] },
  { file: 'help.html', wait: 'body', name: 'KPI guide', steps: [] },
];
for (const scheme of ['light', 'dark']) {
  for (const sc of SCREENS) {
    const { ctx, p } = await page(scheme, '');
    await p.goto(BASE + '/' + sc.file, { waitUntil: 'commit' });
    await p.waitForSelector(sc.wait, { timeout: 15000 }).catch(function () { });
    await p.waitForTimeout(600);
    for (const s of sc.steps) { await p.click(s).catch(function () { }); await p.waitForTimeout(500); }
    const bad = await p.evaluate(AUDIT);
    ok(scheme + ' · ' + sc.name + ': every label meets AA',
      bad.length === 0,
      bad.length ? bad.slice(0, 4).map(function (b) {
        return b.got + ':1 (needs ' + b.need + ') ' + b.sel + ' "' + b.text + '" ' + b.fg + ' on ' + b.bg;
      }).join('  |  ') : '');
    await ctx.close();
  }
}

/* ---------- 2b. the reader can actually reach the override ----------
   The tokens read gp-theme, but nothing set it until the Appearance control existed
   — a switch with no handle. This drives it the way a person would. */
{
  for (const pick of ['dark', 'light', '']) {
    const { ctx, p } = await page('light', '');
    await p.goto(BASE + '/teams.html', { waitUntil: 'commit' });
    await p.waitForSelector('nav.bottom button', { timeout: 15000 });
    await p.click('nav.bottom button:nth-child(4)');          // Me
    await p.waitForTimeout(400);
    await p.click('#goProfileFromMe').catch(function () { });
    await p.waitForSelector('[data-theme-set]', { timeout: 8000 }).catch(function () { });
    const have = await p.$$eval('[data-theme-set]', function (b) { return b.length; }).catch(function () { return 0; });
    if (!have) { ok('Appearance control is reachable from Me', false, 'no buttons found'); await ctx.close(); break; }
    await p.click('[data-theme-set="' + pick + '"]');
    await p.waitForTimeout(400);
    const st = await p.evaluate(`(function(){
      var bg=getComputedStyle(document.body).backgroundColor;
      // no regex literal here: this string passes through several quoting layers
      var first=Number(String(bg).replace(/[^0-9,]/g,'').split(',')[0]);
      return { dark: isFinite(first) ? first < 100 : false,
               attr: document.documentElement.getAttribute('data-theme')||'',
               saved: (function(){ try { return localStorage.getItem('gp-theme')||''; } catch(e){ return '?'; } })(),
               on: (document.querySelector('[data-theme-set].on')||{}).getAttribute ? document.querySelector('[data-theme-set].on').getAttribute('data-theme-set') : null };
    })()`);
    const want = pick === 'dark';
    ok('Appearance → ' + (pick || 'auto') + ' takes effect and is remembered',
      st.attr === pick && st.saved === pick && (pick === '' ? true : st.dark === want) && st.on === pick,
      'attr=' + JSON.stringify(st.attr) + ' saved=' + JSON.stringify(st.saved) + ' dark=' + st.dark + ' selected=' + JSON.stringify(st.on));
    await ctx.close();
  }
}

/* ---------- 3. the block has not drifted between the three pages ---------- */
{
  const grab = function (f) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const m = src.match(/\/\* ==================== THEME TOKENS ====================[\s\S]*?--ease:linear; \} \}/);
    return m ? m[0] : null;
  };
  const a = grab('index.html'), b = grab('teams.html'), c = grab('help.html');
  ok('all three pages carry the theme block', !!a && !!b && !!c);
  ok('and the three copies are byte-identical', a === b && b === c,
    a === b && b === c ? '' : [a, b, c].map(function (x) { return (x || '').length; }).join(' / '));
}

/* ---------- 4. the theme is applied before anything paints ---------- */
{
  for (const f of ['index.html', 'teams.html', 'help.html']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const boot = src.indexOf("localStorage.getItem('gp-theme')");
    const style = src.search(/^<style>\n\*\s*\{\s*box-sizing/m);
    ok(f + ': the theme is read before the stylesheet', boot > -1 && boot < style,
      'boot@' + boot + ' style@' + style);
    /* A <style> mentioned inside an HTML comment once swallowed this whole block,
       which silently disabled every token. Cheap to check, so check. */
    const before = src.slice(0, src.indexOf('THEME TOKENS'));
    ok(f + ': the block is not buried in a comment',
      before.split('<!--').length - 1 === before.split('-->').length - 1);
  }
}

/* ---------- 5. no raw palette hex left in a themed property ---------- */
{
  for (const f of ['index.html', 'teams.html', 'help.html']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    /* #000 is exempt: it appears in mask gradients and rgba() shadows, where it is
       a stencil or an opacity rather than a colour anybody sees. */
    // (?<![-\w]) so the token DEFINITIONS themselves (--border:#E4DDD0) are not matches.
    const hits = (src.match(/(?<![-\w])(?:background|background-color|color|border[a-z-]*|outline|fill|stroke)\s*:\s*[^;}"'>]*#(?!000\b|000000\b)[0-9a-fA-F]{3,8}/g) || [])
      .filter(function (h) { return h.indexOf('data:image') === -1; });
    ok(f + ': no un-themed colour left in a themed property', hits.length === 0,
      hits.slice(0, 3).join(' | '));
  }
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
