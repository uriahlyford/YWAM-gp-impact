/* Visit every screen on both pages and collect anything that errors. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=PUBLIC;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=q.url.split('?')[0]; if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'}); r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(4414,r));
const NOWWK=(()=>{const y=new Date().getFullYear(),j=new Date(y,0,1);
  const m=new Date(y,0,1-((j.getDay()+6)%7));
  return Math.max(1,Math.min(52,Math.floor((new Date()-m)/(7*86400000))+1)); })();
const Q=Math.min(4,Math.floor((new Date().getMonth())/3)+1);
const ME={id:'st1',name:'Sokha Chan',username:'sokha',campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',role:'Coordinator',photo:'',mentorId:''};
const MATE={id:'st2',name:'Mealea Sok',username:'mealea',campus:'poipet',dept:'Youth Education',ministry:'YDC',role:'Teacher',photo:'',mentorId:'st1'};
const DATA={leader:false,
  entries:{poipet:{'Base Leadership|Campus Leadership|Total Staff':{1:12},
    'Community Service|Outreach Teams|Salvations':{[NOWWK]:4,[NOWWK-1]:2},
    'Community Service|Outreach Teams|Teams Hosted':{[NOWWK]:1}}},
  okrs:[{id:'o1',campus:'poipet',quarter:Q,dept:'Community Service',objective:'Obj',
    krs:[{text:'kr',metricKey:'Community Service|Outreach Teams|Salvations',target:10,manual:0},
         {text:'by hand',metricKey:'',target:0,manual:40}]}],
  survey:[{campus:'poipet',week:NOWWK,device:'d1',lonely:3,clarity:8,growth:7,porn:0,oneOnOne:1,
    exercise:1,quietTime:1,debt:0,langHours:2,minHours:5,sharedFaith:1,sabbath:1,days:7}]};
const CHECKINS=[{week:NOWWK,days:7,source:'weekly',lonely:3,clarity:8,growth:7,porn:0,oneOnOne:1,
  exercise:1,quietTime:1,debt:0,langHours:2,minHours:5,sharedFaith:1,sabbath:1}];
const TRIPS={ok:true,trips:[{id:'t1',from:'2026-03-01',to:'2026-03-05',days:5,kind:'work',
  reason:'Outreach',where:'BB',note:'',status:'approved',decidedAt:''}],
  totals:{[String(new Date().getFullYear())]:{work:5,personal:0,trips:1}},
  reasons:{work:['Outreach','Other work'],personal:['Visiting family','Other personal']},hasMentor:true};

const b=await chromium.launch({executablePath: CHROMIUM});
const errs=[];
async function mk(seed){
  const p=await b.newPage({viewport:{width:400,height:900}});
  p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  p.on('console',m=>{const t=m.text();
    if(m.type()==='error'&&!/fonts\.googleapis|ERR_CONNECTION|ERR_NAME|favicon/.test(t)) errs.push('console: '+t.slice(0,160));});
  p.on('dialog',d=>d.accept('gp2033'));
  await p.route('**/.netlify/functions/api',r=>{const q=JSON.parse(r.request().postData()||'{}');
    let o=DATA;
    if(q.fn==='getMyBoot')o={ok:true,staff:ME,profile:{phone:'',joined:2022,debt:false,mentorStatus:''},
      roster:[ME,MATE],logs:[{date:'2026-08-12',week:NOWWK,langHours:1,minHours:2,workout:true,bible:true,
        quietTime:true,oneOnOne:false,sharedFaith:false,sabbath:false,habits:{bible:true,quietTime:true}}],
      habits:[{id:'bible',mentorVisible:true},{id:'quietTime',mentorVisible:false}],
      mentees:[MATE],mentorRequests:[],goals:[{week:NOWWK,items:[{text:'g1',done:true},{text:'g2',done:false}],pct:50}],
      checkins:CHECKINS,trips:TRIPS,tripRequests:[],
      ministry:{ok:true,campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',
        entries:{'Salvations':{[NOWWK]:4}},daily:{},pins:['Salvations','Teams Hosted']},
      base:DATA};
    else if(q.fn==='teamRoster')o=[ME,MATE];
    else if(q.fn==='staffLogin')o={ok:true,staff:ME,profile:{}};
    else if(q.fn==='staffProfile')o={ok:true,staff:MATE,goals:[],activity:{weeksTracked:3,daysLogged:12,lastLogged:'2026-08-11'},awayWork:{},isMe:false};
    else if(q.fn==='getMenteeLogs')o={ok:true,mentee:MATE,logs:[],sharedHabits:[{id:'bible',mentorVisible:true}],goals:[],checkins:CHECKINS,profile:{debt:false}};
    else if(q.fn==='getMyTrips')o=TRIPS;
    else if(q.fn==='getTripRequests')o={ok:true,requests:[]};
    else if(q.fn==='getMyWeekly')o={ok:true,goals:[],checkins:CHECKINS};
    else if(q.fn==='getMyMinistry')o={ok:true,campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',entries:{},daily:{},pins:[]};
    else if(/^getMy/.test(q.fn))o={ok:true,logs:[],goals:[],checkins:[],mentees:[],requests:[]};
    r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});});
  if(seed) await p.addInitScript(seed);
  return p;
}
async function visit(p,label,act){
  const before=errs.length;
  try { await act(p); } catch(e){ errs.push('STEP FAILED ['+label+']: '+String(e.message).slice(0,110)); }
  await p.waitForTimeout(500);
  console.log('  '+(errs.length>before?'ERR  ':'ok   ')+label);
}

console.log('DASHBOARD (leader unlocked)');
let p=await mk(()=>{
  // signed in AND leader: the log form needs an account, the OKR editor needs the code
  localStorage.setItem('gp-staff',JSON.stringify({user:'sokha',pin:'1234'}));
  localStorage.setItem('gp-staff-card',JSON.stringify({name:'Sokha Chan',photo:'',ministry:'Outreach Teams',campus:'poipet'}));
  sessionStorage.setItem('gp-skip-teams','1');
  localStorage.setItem('gp-leadercode','gp2033');});
await p.goto('http://localhost:4414/index.html'); await p.waitForSelector('.hero',{timeout:15000}); await p.waitForTimeout(800);
await visit(p,'dashboard',async p=>{});
await visit(p,'all campuses',async p=>{await p.click('[data-all]');await p.waitForTimeout(700);});
await visit(p,'back to one campus',async p=>{await p.click('[data-campus="siemreap"]');await p.waitForTimeout(600);});
await visit(p,'OKRs view',async p=>{await p.click('[data-view="okr"]');await p.waitForTimeout(700);});
await visit(p,'OKR quarter switch',async p=>{const s=await p.$('#okrQSel'); if(s) await p.selectOption('#okrQSel','1');await p.waitForTimeout(600);});
await visit(p,'Log Numbers',async p=>{await p.click('[data-view="log"]');await p.waitForTimeout(800);});
await visit(p,'log: switch dept',async p=>{await p.selectOption('#deptSel','Youth Education');await p.waitForTimeout(700);});
await visit(p,'log: switch ministry',async p=>{await p.selectOption('#minSel','GP Media');await p.waitForTimeout(700);});
await visit(p,'log: Base Leadership',async p=>{await p.selectOption('#deptSel','Base Leadership');await p.waitForTimeout(700);});
await visit(p,'log: switch week',async p=>{await p.selectOption('#weekSel','5');await p.waitForTimeout(700);});
await visit(p,'drill-down open/close',async p=>{await p.click('[data-view="dashboard"]');await p.waitForTimeout(700);
  await p.click('#main .heroSubRow');await p.waitForTimeout(500);await p.click('#ddClose');});
await visit(p,'Khmer toggle',async p=>{await p.click('#langBtn');await p.waitForTimeout(800);await p.click('#langBtn');});
await p.close();

console.log('\nSTAFF PAGE (all tabs)');
p=await mk(()=>localStorage.setItem('gp-staff',JSON.stringify({user:'sokha',pin:'1234'})));
await p.goto('http://localhost:4414/teams.html'); await p.waitForSelector('nav.bottom button',{timeout:15000}); await p.waitForTimeout(900);
for(const [tab,label] of [['base','Base'],['week','My Database'],['team','Team'],['health','Health']]){
  await visit(p,'tab: '+label,async p=>{await p.click(`nav.bottom [data-tab="${tab}"]`);await p.waitForTimeout(900);});
}
await visit(p,'Base: dept explorer',async p=>{await p.click('nav.bottom [data-tab="base"]');await p.waitForTimeout(700);
  await p.selectOption('#baseDeptSel','Skills Training');await p.waitForTimeout(700);});
await visit(p,'Base: drill a tile',async p=>{await p.click('#main .heroSubRow');await p.waitForTimeout(500);await p.click('#ddClose');});
await visit(p,'My week: expand today',async p=>{await p.click('nav.bottom [data-tab="week"]');await p.waitForTimeout(700);
  const t=await p.$('#todayToggle'); if(t) await t.click(); await p.waitForTimeout(600);});
await visit(p,'My week: expand week',async p=>{const t=await p.$('#weekToggle'); if(t) await t.click(); await p.waitForTimeout(600);});
await visit(p,'Team: open a person',async p=>{await p.click('nav.bottom [data-tab="team"]');await p.waitForTimeout(800);
  const c=await p.$('#main [data-person]'); if(c){await c.click();await p.waitForTimeout(900);}});
await visit(p,'Team: mentor view',async p=>{await p.click('nav.bottom [data-tab="team"]');await p.waitForTimeout(800);
  const c=await p.$('#main [data-mentee], #main button'); if(c){await c.click();await p.waitForTimeout(900);
    const m=await p.$('#main [data-mentee]'); if(m){await m.click();await p.waitForTimeout(900);}}});
await visit(p,'My Database: away card',async p=>{await p.click('nav.bottom [data-tab="week"]');await p.waitForTimeout(800);});
await visit(p,'My Database: profile & settings',async p=>{const b2=await p.$('#goProfileFromMe'); if(b2){await b2.click();await p.waitForTimeout(900);}});
await visit(p,'Health: week switch',async p=>{await p.click('nav.bottom [data-tab="health"]');await p.waitForTimeout(800);
  await p.selectOption('#healthWeekSel',String(NOWWK-1));await p.waitForTimeout(800);});
await visit(p,'Khmer across all tabs',async p=>{await p.click('#langBtn');await p.waitForTimeout(700);
  for(const tb of ['base','week','team','health']){await p.click(`nav.bottom [data-tab="${tb}"]`);await p.waitForTimeout(650);}
  await p.click('#langBtn');});
await p.close();

console.log('\nKPI GUIDE');
p=await mk(); await p.goto('http://localhost:4414/help.html'); await p.waitForTimeout(1200);
await visit(p,'guide loads',async p=>{});
await visit(p,'guide: search',async p=>{await p.fill('#search','cafe');await p.waitForTimeout(700);});
await visit(p,'guide: Khmer toggle',async p=>{const b3=await p.$('#langBtn'); if(b3){await b3.click();await p.waitForTimeout(700);}});
await p.close();

console.log('\n'+(errs.length? errs.length+' PROBLEM(S):\n - '+errs.join('\n - ') : 'No errors across any screen.'));
await b.close(); srv.close();
process.exit(errs.length?1:0);
