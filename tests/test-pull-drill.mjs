/* Pull-to-refresh, and which numbers open a breakdown.

   Both of these were reported as "the staff page doesn't do what the dashboard
   does", and both were the same underlying problem: two hand-written copies that
   drifted. The pull gesture drifted twice — first the coin had no mark in it, then
   the mark did not TURN as you pulled — so the implementation now lives once in
   rollup.js and this drives the real touch events against both pages to prove it.

   The drill half asserts the two pages expose the same figures, and that a tappable
   figure looks tappable: `cursor:pointer` alone is invisible on a phone, which is
   why "only some are clickable" read as broken rather than as a rule. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.GP_ROOT || PUBLIC;

const ROSTER = [{ id: 'a', name: 'Sokha Chan', username: 'sokha', campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', role: 'Coordinator', active: true, photo: '' }];
const E = { poipet: {
  'Community Service|Outreach Teams|Salvations': { '31': 40, '32': 52, '33': 64 },
  'Community Service|Outreach Teams|Teams Hosted': { '33': 12 },
  'Community Service|Outreach Teams|Volunteers Mobilized': { '33': 480 },
  'Community Service|Outreach Teams|Community Service Hours': { '33': 900 },
  'Community Service|GP Education|Students Enrolled': { '33': 120 },
  'Community Service|GP Education|Students in Discipleship': { '33': 40 },
  'Community Service|Ponlork School|Students Enrolled': { '33': 60 },
  'Youth Education|YDC|Youth Enrolled': { '33': 96 },
  'Youth Education|YDC|Students in Discipleship': { '33': 25 },
  'Leadership Development|GPDTS|Students Enrolled': { '33': 24 },
  'Leadership Development|Church Partnerships|Partner Churches Supported': { '33': 7 },
  'Leadership Development|Church Partnerships|Churches Being Led': { '33': 3 },
} };
const SURVEY = [{ campus: 'poipet', week: 33, device: 't1', lonely: 3, clarity: 8, growth: 7, porn: 0, oneOnOne: 1, exercise: 1, quietTime: 1, debt: 0, langHours: 3, minHours: 9, sharedFaith: 1, sabbath: 1, days: 7 }];
const DATA = { leader: false, year: 2026, entries: E, okrs: [], survey: SURVEY, roster: ROSTER };
const BOOT = {
  ok: true, staff: ROSTER[0], profile: { phone: '', joined: '', debt: false, mentorStatus: '' },
  roster: ROSTER, logs: [], habits: null, mentees: [], mentorRequests: [], goals: [], checkins: SURVEY,
  trips: { ok: true, trips: [], years: {} }, tripRequests: [],
  ministry: { ok: true, campus: 'poipet', dept: 'Community Service', ministry: 'Outreach Teams', entries: {}, daily: {}, pins: [] },
  base: { leader: false, entries: E, okrs: [], survey: SURVEY },
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

async function open(file, wait, slow) {
  const ctx = await browser.newContext(devices['iPhone 13']);
  const p = await ctx.newPage();
  await p.route('**fonts.g**', function (r) { r.abort(); });
  await p.route('**/api', async function (r) {
    if (slow) await new Promise(function (x) { setTimeout(x, 1500); });
    const fn = (r.request().postDataJSON() || {}).fn;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fn === 'getMyBoot' ? BOOT : DATA) });
  });
  await p.addInitScript(function () {
    try {
      localStorage.setItem('gp-staff', JSON.stringify({ user: 'sokha', pin: '1234' }));
      sessionStorage.setItem('gp-skip-teams', '1');
    } catch (e) { }
  });
  await p.goto(BASE + '/' + file, { waitUntil: 'commit' });
  await p.waitForSelector(wait, { timeout: 20000 }).catch(function () { });
  await p.waitForTimeout(700);
  return { ctx, p };
}

/* Drive the gesture the way a thumb does: a real touchstart, a run of touchmoves,
   then a release. Anything less does not exercise the drag rotation at all. */
const DRAG = `(function(){
  function tp(y){ return [new Touch({identifier:1,target:document.body,clientX:180,clientY:y,pageX:180,pageY:y,screenX:180,screenY:y})]; }
  function fire(type,y){
    var t=tp(y);
    document.body.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,
      touches:type==='touchend'?[]:t, targetTouches:type==='touchend'?[]:t, changedTouches:t}));
  }
  window.scrollTo(0,0);
  fire('touchstart',60);
  for(var y=70;y<=210;y+=20) fire('touchmove',y);
})()`;
const RELEASE = `(function(){
  var t=[new Touch({identifier:1,target:document.body,clientX:180,clientY:210,pageX:180,pageY:210,screenX:180,screenY:210})];
  document.body.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:t}));
})()`;

for (const [file, wait, label, refreshFn] of [
  ['index.html', '.hero', 'dashboard', 'getData'],
  ['teams.html', 'nav.bottom button', 'staff page', 'getMyBoot'],
]) {
  // slow API on purpose: with an instant answer the whole spin is over in under
  // 100ms and there is nothing left to observe.
  const { ctx, p } = await open(file, wait, true);

  const coin = await p.evaluate(`(function(){
    var i=document.getElementById('ptrLogo');
    return { there: !!i, src: !!(i && i.getAttribute('src')) };
  })()`);
  ok(label + ': the pull coin holds the mark', coin.there && coin.src, JSON.stringify(coin));

  await p.evaluate(DRAG);
  await p.waitForTimeout(160);
  const pulled = await p.evaluate(`(function(){
    var ptr=document.getElementById('ptr');
    var img=ptr.querySelector('img');
    var deg=null;
    var tr=img?img.style.transform:'';
    var m=/rotate\\(\\s*(-?[\\d.]+)deg/.exec(tr||'');
    if(m) deg=Math.abs(Number(m[1]));
    return { dragging: ptr.className.indexOf('dragging')>-1,
             moved: (ptr.style.transform||'').indexOf('translateY')>-1,
             opacity: ptr.style.opacity, deg: deg, raw: tr };
  })()`);
  ok(label + ': the coin comes down with the pull', pulled.dragging && pulled.moved,
    'class/transform ' + pulled.dragging + '/' + pulled.moved);
  /* The reported bug: the staff page slid the coin but never turned it. */
  ok(label + ': and TURNS as you pull', pulled.deg !== null && pulled.deg > 20,
    'rotation ' + (pulled.deg === null ? 'none — ' + JSON.stringify(pulled.raw) : pulled.deg + '°'));

  await p.evaluate(RELEASE);
  await p.waitForTimeout(120);
  const spun = await p.evaluate(`(function(){
    var ptr=document.getElementById('ptr');
    var img=ptr.querySelector('img');
    var cs=img?getComputedStyle(img):null;
    return { spinning: ptr.className.indexOf('spinning')>-1,
             anim: cs?cs.animationName:'', inline: img?img.style.transform:'x' };
  })()`);
  ok(label + ': releasing hands over to the spin', spun.spinning && /spin/.test(spun.anim),
    spun.anim || '(none)');
  /* An inline rotate left behind would fight the CSS animation and freeze it. */
  ok(label + ': and the drag rotation is cleared first', spun.inline === '', JSON.stringify(spun.inline));

  await p.waitForTimeout(1400);
  const done = await p.evaluate("document.getElementById('ptr').className");
  ok(label + ': the coin stops once the data is in', done.indexOf('spinning') === -1, JSON.stringify(done));
  await ctx.close();
}

/* ---------- the two pages offer the same breakdowns ---------- */
const seen = {};
for (const [file, wait, label] of [
  ['index.html', '.hero', 'dashboard'],
  ['teams.html', 'nav.bottom button', 'Base'],
]) {
  const { ctx, p } = await open(file, wait, false);
  if (file === 'teams.html') {
    // Base's sections collapse into an accordion now; open every row so its
    // figures are on screen to compare against the dashboard's, same as before.
    await p.evaluate(() => { Object.keys(S.baseAcc).forEach(k => { S.baseAcc[k] = true; }); render(); });
    await p.waitForTimeout(500);
  }
  const r = await p.evaluate(`(function(){
    var out={ drillable:[], closed:[] };
    document.querySelectorAll('[data-drill-metric]').forEach(function(el){
      var lab=el.querySelector('.statLabel, .rowName');
      var txt=(lab?lab.textContent:el.textContent);
      /* Normalise before comparing: the two pages differ in spacing, trend badges
         and the "yours" tag, none of which say which FIGURE this is. */
      txt=txt.replace(/\\s+/g,'').replace(/yours/g,'').replace(/[0-9,.%]+/g,'').replace(/[▲▼—]/g,'');
      out.drillable.push(txt.slice(0,30));
    });
    document.querySelectorAll('.stat').forEach(function(el){
      if(el.closest('[data-drill-metric]')) return;
      var lab=el.querySelector('.statLabel');
      if(lab) out.closed.push(lab.textContent.replace(/\\s+/g,' ').trim().slice(0,34));
    });
    // does a tappable figure LOOK tappable?
    var d=document.querySelector('.stat[data-drill-metric] .statNum');
    var cs=d?getComputedStyle(d):null;
    out.underlined = !!(cs && cs.textDecorationLine.indexOf('underline')>-1);
    var tile=document.querySelector('.stat[data-drill-metric]');
    out.marker = tile ? getComputedStyle(tile,'::after').content : '';
    return out;
  })()`);
  seen[label] = r;
  ok(label + ': tappable figures are visibly tappable', r.underlined, 'underline=' + r.underlined);
  ok(label + ': and tiles carry a marker', /▸/.test(r.marker), JSON.stringify(r.marker));
  await ctx.close();
}
{
  const a = seen.dashboard, b = seen.Base;
  ok('both pages open the same number of figures',
    a.drillable.length === b.drillable.length,
    a.drillable.length + ' vs ' + b.drillable.length);
  const onlyDash = a.drillable.filter(function (x) { return b.drillable.indexOf(x) === -1; });
  const onlyBase = b.drillable.filter(function (x) { return a.drillable.indexOf(x) === -1; });
  ok('and the same figures', onlyDash.length === 0 && onlyBase.length === 0,
    'dashboard only: ' + onlyDash.join(', ') + ' | Base only: ' + onlyBase.join(', '));
  /* The three group tiles that used to be closed for want of a filter. */
  for (const want of ['Students Enrolled', 'Students in Discipleship', 'Local Churches Partnered']) {
    // the collected labels are normalised (spaces stripped), so compare like with like
    const key = want.replace(/\s+/g, '');
    ok('"' + want + '" opens a breakdown on both',
      a.drillable.some(function (x) { return x.indexOf(key) > -1; }) &&
      b.drillable.some(function (x) { return x.indexOf(key) > -1; }),
      'dashboard ' + a.drillable.filter(function (x) { return x.indexOf(key) > -1; }).length +
      ', Base ' + b.drillable.filter(function (x) { return x.indexOf(key) > -1; }).length);
  }
  /* And the ones left closed on purpose stay closed — a sheet under either would
     total something other than the number above it. */
  for (const shut of ['Schools', 'Total Volunteer Hours']) {
    ok('"' + shut + '" stays closed, on purpose',
      a.closed.some(function (x) { return x.indexOf(shut) > -1; }),
      a.closed.join(' / ').slice(0, 70));
  }
}

/* ---------- a group breakdown actually adds up ---------- */
{
  const { ctx, p } = await open('index.html', '.hero', false);
  const r = await p.evaluate(`(function(){
    var tile=[].slice.call(document.querySelectorAll('.stat[data-drill-metric]')).filter(function(el){
      var l=el.querySelector('.statLabel');
      return l && l.textContent.indexOf('Students Enrolled')>-1 && el.getAttribute('data-drill-ministries');
    })[0];
    if(!tile) return { found:false };
    var shown=Number((tile.querySelector('.statNum').textContent||'').replace(/[^0-9.-]/g,''));
    tile.click();
    var rows=[].slice.call(document.querySelectorAll('#ddRoot .ddRow'));
    var nums=rows.map(function(r){
      var v=r.querySelector('.ddRowVal');
      return v?Number((v.textContent||'').replace(/[^0-9.-]/g,'')):null;
    }).filter(function(n){ return n!==null && !isNaN(n); });
    return { found:true, shown:shown, rows:nums.length, sum:nums.reduce(function(a,b){return a+b;},0) };
  })()`);
  ok('the community-students sheet opens', r.found && r.rows > 0, JSON.stringify(r));
  /* The whole reason some tiles stay closed: if a sheet opens, its rows must total
     the headline, or the breakdown is lying. 120+60+96 = 276. */
  ok('and its rows total the number on the tile', r.found && r.sum === r.shown,
    'rows ' + r.rows + ' summing ' + r.sum + ' vs tile ' + r.shown);
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
