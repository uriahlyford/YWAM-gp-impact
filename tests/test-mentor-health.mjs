/* A mentor sees their mentee's weekly check-ins by name; the base average does not. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, tmpDir, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=PUBLIC;
const OUT=tmpDir('out') + '/';
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=q.url.split('?')[0]; if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'}); r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(4405,r));

const NOWWK=(()=>{const y=new Date().getFullYear(),j=new Date(y,0,1);
  const m=new Date(y,0,1-((j.getDay()+6)%7));
  return Math.max(1,Math.min(52,Math.floor((new Date()-m)/(7*86400000))+1)); })();
const DARA={id:'st_dara',name:'Dara Pich',username:'dara',campus:'poipet',dept:'Base Leadership',ministry:'Campus Leadership',role:'Base director',photo:'',mentorId:''};
const SOKHA={id:'st_sokha',name:'Sokha Chan',username:'sokha',campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',role:'Outreach coordinator',photo:'',mentorId:'st_dara'};
const MENTEE_CHECKINS=[NOWWK,NOWWK-1].map((w,i)=>({week:w,days:7,source:'weekly',
  lonely:i?6:3, clarity:i?5:8, growth:i?5:7, porn:0, oneOnOne:1, exercise:i?0:1,
  quietTime:1, debt:i?1:0, langHours:i?1:3, minHours:i?4:7, sharedFaith:i?0:1, sabbath:1}));
const DATA={leader:false,entries:{poipet:{}},okrs:[],survey:[]};

const b=await chromium.launch({executablePath: CHROMIUM});
const p=await b.newPage({viewport:{width:400,height:900},deviceScaleFactor:2});
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_CONN/.test(m.text()))errs.push('console: '+m.text());});
await p.route('**/.netlify/functions/api',r=>{const q=JSON.parse(r.request().postData()||'{}');
  let o=DATA;
  if(q.fn==='getMyBoot')o={ok:true,staff:DARA,profile:{},roster:[DARA,SOKHA],logs:[],habits:null,
    mentees:[SOKHA],mentorRequests:[],goals:[],checkins:[],
    trips:{ok:true,trips:[],totals:{},reasons:{work:['x'],personal:['y']},hasMentor:false},
    tripRequests:[],ministry:null,base:DATA};
  else   if(q.fn==='teamRoster')o=[DARA,SOKHA];
  else if(q.fn==='staffLogin')o={ok:true,staff:DARA,profile:{}};
  else if(q.fn==='getMyMentees')o={ok:true,mentees:[SOKHA]};
  else if(q.fn==='getMenteeLogs')o={ok:true,mentee:SOKHA,logs:[],habits:[],goals:[],
    checkins:MENTEE_CHECKINS,profile:{debt:false},ministry:null,trips:{trips:[],totals:{},ptoCap:30},smartGoals:[]};
  else if(q.fn==='getMyTrips')o={ok:true,trips:[],totals:{},reasons:{work:['x'],personal:['y']},hasMentor:false};
  else if(q.fn==='getTripRequests')o={ok:true,requests:[]};
  else if(/^getMy/.test(q.fn))o={ok:true,logs:[],goals:[],checkins:[],mentees:[],requests:[]};
  r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});});
await p.addInitScript(()=>localStorage.setItem('gp-staff',JSON.stringify({user:'dara',pin:'1234'})));
await p.goto('http://localhost:4405/teams.html'); await p.waitForSelector('nav.bottom button',{timeout:15000});
await p.waitForTimeout(1000);

await p.click('nav.bottom [data-tab="team"]'); await p.waitForTimeout(1200);
const entry = await p.evaluate(()=>{
  const b=[...document.querySelectorAll('#main [data-mentee], #main button, #main [data-person]')]
    .find(x=>/mentee|Sokha/i.test(x.textContent));
  if(b){ b.click(); return b.textContent.trim().slice(0,50); }
  return null;
});
console.log('mentor entry: '+entry);
await p.waitForTimeout(1600);
// if that landed on the mentor list, open the mentee
await p.evaluate(()=>{ const c=document.querySelector('#main [data-mentee]'); if(c) c.click(); });
await p.waitForTimeout(1600);

console.log('on mentee page: '+await p.evaluate(()=>!!document.querySelector('#menteeBack')));
console.log('mentee name:    '+await p.$eval('.pcard .pname', e=>e.textContent.trim()).catch(()=>'(none)'));
console.log('sections:       '+(await p.$$eval('#main h3', e=>e.map(x=>x.textContent.trim()))).join(' / '));
console.log('their score:    '+await p.$eval('#main .pctBig', e=>e.textContent.trim()).catch(()=>'(none)'));
console.log('health rows:    '+await p.evaluate(()=>{
  const h=[...document.querySelectorAll('#main h3')].find(x=>/weekly check-ins/i.test(x.textContent));
  return h ? h.nextElementSibling.querySelectorAll('.row').length : 0;
}));
console.log('private answers visible: '+await p.evaluate(()=>
  /Looked at porn|Loneliness/i.test(document.body.innerText)));
console.log('trend badges:   '+await p.$$eval('#main .trend', e=>e.length));
console.log('week history:   '+await p.evaluate(()=>{
  const h=[...document.querySelectorAll('#main h3')].find(x=>/weekly check-ins/i.test(x.textContent));
  const cards=[]; let n=h&&h.nextElementSibling;
  while(n){ if(n.classList&&n.classList.contains('card')) cards.push(n.querySelectorAll('.row').length); n=n.nextElementSibling; if(n&&n.tagName==='H3')break; }
  return cards.join('+');
}));
await p.screenshot({path:OUT+'mentor-health.png', fullPage:true});
console.log('errors: '+(errs.length?errs.join('\n'):'none'));
await b.close(); srv.close();
