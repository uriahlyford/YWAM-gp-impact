/* Does the Google Fonts @import block the first paint? The target users are on
   patchy connections, so a hanging font request is the realistic bad case. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=PUBLIC;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=q.url.split('?')[0]; if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'}); r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(4411,r));
const DATA={leader:false,entries:{poipet:{'Base Leadership|Campus Leadership|Total Staff':{1:12}}},okrs:[],survey:[]};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

async function run(label, fontMode){
  const p=await b.newPage({viewport:{width:400,height:900}});
  await p.route('**/.netlify/functions/api',r=>r.fulfill({status:200,contentType:'application/json',
    body:JSON.stringify(JSON.parse(r.request().postData()||'{}').fn==='teamRoster'?[]:DATA)}));
  await p.route('**fonts.googleapis.com**', async r=>{
    if(fontMode==='hang'){ await new Promise(res=>setTimeout(res,12000)); r.abort(); }
    else if(fontMode==='fast'){ r.fulfill({status:200,contentType:'text/css',body:'/* pretend */'}); }
    else r.abort();
  });
  await p.route('**fonts.gstatic.com**', r=>r.abort());
  await p.addInitScript(()=>sessionStorage.setItem('gp-guest','1'));
  const t0=Date.now();
  await p.goto('http://localhost:4411/index.html',{waitUntil:'commit'});
  // when does anything become visible?
  let firstPaint=null;
  for(let i=0;i<200;i++){
    const painted=await p.evaluate(()=>{
      const h=document.querySelector('header');
      if(!h) return false;
      const r=h.getBoundingClientRect();
      return r.height>0 && getComputedStyle(h).backgroundColor!=='rgba(0, 0, 0, 0)';
    }).catch(()=>false);
    if(painted){ firstPaint=Date.now()-t0; break; }
    await p.waitForTimeout(50);
  }
  let heroAt=null;
  for(let i=0;i<200;i++){
    if(await p.evaluate(()=>!!document.querySelector('.hero')).catch(()=>false)){ heroAt=Date.now()-t0; break; }
    await p.waitForTimeout(50);
  }
  const fcp=await p.evaluate(()=>{
    const e=performance.getEntriesByType('paint').find(x=>x.name==='first-contentful-paint');
    return e?Math.round(e.startTime):null;
  });
  console.log(`${label.padEnd(26)} header visible ${String(firstPaint).padStart(6)}ms   .hero ${String(heroAt).padStart(6)}ms   FCP ${fcp}ms`);
  await p.close();
}
console.log('font CDN reachable and instant:');
await run('  fonts fast','fast');
console.log('\nfont CDN unreachable (reset):');
await run('  fonts aborted','abort');
console.log('\nfont CDN hanging 12s (patchy network):');
await run('  fonts hang 12s','hang');
await b.close(); srv.close();
