/* What one app open actually costs, and whether anything errors along the way. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=PUBLIC;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
let httpHits=[];
const srv=http.createServer((q,r)=>{let p=q.url.split('?')[0]; if(p==='/')p='/index.html';
  httpHits.push(p);
  const f=path.join(ROOT,p); if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'}); r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(4410,r));

const NOWWK=(()=>{const y=new Date().getFullYear(),j=new Date(y,0,1);
  const m=new Date(y,0,1-((j.getDay()+6)%7));
  return Math.max(1,Math.min(52,Math.floor((new Date()-m)/(7*86400000))+1)); })();
const ME={id:'st1',name:'Sokha Chan',username:'sokha',campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',role:'Coordinator',photo:'',mentorId:''};
const DATA={leader:false,entries:{poipet:{'Base Leadership|Campus Leadership|Total Staff':{1:12},
  'Community Service|Outreach Teams|Salvations':{[NOWWK]:4}}},okrs:[],
  survey:[{campus:'poipet',week:NOWWK,device:'d1',lonely:3,clarity:8,growth:7,porn:0,oneOnOne:1,exercise:1,quietTime:1,debt:0,langHours:2,minHours:5,sharedFaith:1,sabbath:1}]};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

async function audit(page_, label, seed){
  const p=await b.newPage({viewport:{width:400,height:900}});
  const errs=[], calls=[], renders=[];
  p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ const t=m.text();
    if(m.type()==='error' && !/fonts\.googleapis|ERR_CONNECTION|ERR_NAME/.test(t)) errs.push('console: '+t.slice(0,150));
    if(/^__render/.test(t)) renders.push(t); });
  await p.route('**/.netlify/functions/api',r=>{
    const q=JSON.parse(r.request().postData()||'{}');
    calls.push(q.fn);
    let o=DATA;
    if(q.fn==='getMyBoot')o={ok:true,staff:ME,profile:{},roster:[ME],logs:[],habits:null,
      mentees:[],mentorRequests:[],goals:[],checkins:[],
      trips:{ok:true,trips:[],totals:{},reasons:{work:['a'],personal:['b']},hasMentor:false},
      tripRequests:[],ministry:{ok:true,campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',entries:{},daily:{},pins:[]},
      base:DATA};
    else if(q.fn==='teamRoster')o=[ME];
    else if(q.fn==='staffLogin')o={ok:true,staff:ME,profile:{}};
    else if(q.fn==='getMyTrips')o={ok:true,trips:[],totals:{},reasons:{work:['a'],personal:['b']},hasMentor:false};
    else if(q.fn==='getTripRequests')o={ok:true,requests:[]};
    else if(q.fn==='getMyWeekly')o={ok:true,goals:[],checkins:[]};
    else if(q.fn==='getMyMinistry')o={ok:true,campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',entries:{},daily:{},pins:[]};
    else if(/^getMy/.test(q.fn))o={ok:true,logs:[],goals:[],checkins:[],mentees:[],requests:[]};
    r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});});
  // count renders by wrapping render() once it exists
  await p.addInitScript(()=>{
    let n=0;
    const iv=setInterval(()=>{
      if(typeof window.render==='function' && !window.__wrapped){
        window.__wrapped=true; const orig=window.render;
        window.render=function(){ console.log('__render '+(++n)); return orig.apply(this,arguments); };
        clearInterval(iv);
      }
    },5);
    setTimeout(()=>clearInterval(iv),4000);
  });
  if(seed) await p.addInitScript(seed);
  httpHits=[];
  const t0=Date.now();
  await p.goto('http://localhost:4410/'+page_,{waitUntil:'load'});
  await p.waitForTimeout(3000);
  const ms=Date.now()-t0;
  console.log(`\n--- ${label} ---`);
  console.log('  static files fetched : '+httpHits.length+'  ('+httpHits.join(' ')+')');
  console.log('  FUNCTION INVOCATIONS : '+calls.length+'  ['+calls.join(', ')+']');
  console.log('  render() calls       : '+renders.length);
  console.log('  wall clock to settle : '+ms+'ms');
  console.log('  errors               : '+(errs.length?'\n    '+errs.join('\n    '):'none'));
  await p.close();
  return {calls, errs, renders:renders.length};
}

await audit('index.html','dashboard, guest',()=>sessionStorage.setItem('gp-guest','1'));
const staff = await audit('teams.html','staff page, signed in',
  ()=>localStorage.setItem('gp-staff',JSON.stringify({user:'sokha',pin:'1234'})));
await audit('index.html','dashboard, signed in (skip-teams)',()=>{
  localStorage.setItem('gp-staff',JSON.stringify({user:'sokha',pin:'1234'}));
  sessionStorage.setItem('gp-skip-teams','1');});
await audit('help.html','KPI guide');

console.log('\n=== duplicate work on the staff page ===');
const counts={}; staff.calls.forEach(c=>counts[c]=(counts[c]||0)+1);
console.log('  verifyStaff_ runs (handlers taking user+pin): ' +
  staff.calls.filter(c=>/^(getMy|save|delete|staffProfile|changePin|updateProfile|uploadPhoto|respondTo|getTripRequests)/.test(c)).length);
console.log('  repeated: '+(Object.entries(counts).filter(([,n])=>n>1).map(([c,n])=>c+'×'+n).join(', ')||'none'));
await b.close(); srv.close();
