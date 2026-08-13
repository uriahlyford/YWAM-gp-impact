/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC, tmpDir } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=PUBLIC;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=q.url.split('?')[0]; if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'}); r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(4402,r));
const ME={id:'st1',name:'Sokha Chan',username:'sokha',campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',role:'Outreach coordinator',photo:'',mentorId:''};
const DATA={leader:false,entries:{poipet:{}},okrs:[],survey:[]};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const w of [320,360,390,430]){
  const p=await b.newPage({viewport:{width:w,height:800}});
  await p.route('**/.netlify/functions/api',r=>{const q=JSON.parse(r.request().postData()||'{}');
    let o=DATA;
    if(q.fn==='getMyBoot')o={ok:true,staff:ME,profile:{},roster:[ME],logs:[],habits:null,mentees:[],mentorRequests:[],goals:[],checkins:[],trips:{ok:true,trips:[],totals:{},reasons:{work:['a'],personal:['b']},hasMentor:false},tripRequests:[],ministry:null,base:DATA};
    else if(q.fn==='teamRoster')o=[ME]; else if(q.fn==='staffLogin')o={ok:true,staff:ME,profile:{}};
    else if(/^getMy/.test(q.fn))o={ok:true,logs:[],goals:[],checkins:[],mentees:[],requests:[]};
    r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});});
  await p.addInitScript(()=>localStorage.setItem('gp-staff',JSON.stringify({user:'sokha',pin:'1234'})));
  await p.goto('http://localhost:4402/teams.html'); await p.waitForSelector('nav.bottom button',{timeout:12000});
  await p.waitForTimeout(600);
  const info=await p.$$eval('nav.bottom button',bs=>bs.map(x=>({t:x.textContent.trim(),h:Math.round(x.getBoundingClientRect().height),w:Math.round(x.getBoundingClientRect().width)})));
  const hs=[...new Set(info.map(i=>i.h))];
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
  console.log(`${w}px: heights ${hs.join('/')} ${hs.length===1?'(no wrap)':'<-- WRAPPING'}  widths ${info.map(i=>i.w).join(',')}  h-overflow:${overflow}`);
  if(w===360) await p.screenshot({path:tmpDir('out') + '/nav-360.png'});
  await p.close();
}
await b.close(); srv.close();
