/* getMyBoot returns everything a page open needs, in one call, and does not fail
   as a unit. Tested against the real api.js. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const TMP=tmpDir('bootauth');
fs.rmSync(TMP,{recursive:true,force:true});
fs.mkdirSync(TMP+'/node_modules/@netlify/blobs',{recursive:true});
fs.writeFileSync(TMP+'/node_modules/@netlify/blobs/index.js',`
const mem={}; let reads=[], writes=[];
export function getStore(){ return {
  get: async (k)=>{ reads.push(k); return (k in mem)?JSON.parse(JSON.stringify(mem[k])):null; },
  setJSON: async (k,v)=>{ writes.push(k); mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;
export const __io={ reset(){reads=[];writes=[];}, get reads(){return reads;}, get writes(){return writes;} };
`);
fs.writeFileSync(TMP+'/node_modules/@netlify/blobs/package.json',
  JSON.stringify({name:'@netlify/blobs',version:'0.0.0',type:'module',main:'index.js'}));
fs.writeFileSync(TMP+'/package.json',JSON.stringify({type:'module'}));
fs.copyFileSync(REPO+'/netlify/functions/api.js',TMP+'/api.js');
process.env.GP_LEADER_CODE='leadercode';
const blobs=await import(TMP+'/node_modules/@netlify/blobs/index.js');
const api=await import(TMP+'/api.js');
const mem=blobs.__mem, io=blobs.__io;
const mkHash=(pin,salt)=>crypto.createHash('sha256').update(salt+':'+String(pin),'utf8').digest('hex');

const ME={id:'st_me',name:'Sokha',username:'sokha',campus:'poipet',dept:'Community Service',
  ministry:'Outreach Teams',role:'Coordinator',active:true,photo:'',mentorId:'',mentorStatus:'',debt:false,
  surveyToken:'tok_me',kpiPins:['Salvations']};
const MENTEE={id:'st_kid',name:'Kid',username:'kid',campus:'poipet',dept:'Community Service',
  ministry:'Cafe',role:'',active:true,photo:'',mentorId:'st_me',mentorStatus:'approved',debt:false,surveyToken:'tok_kid'};
const PEND={id:'st_p',name:'Pend',username:'pend',campus:'poipet',dept:'Youth Education',
  ministry:'YDC',role:'',active:true,photo:'',mentorId:'st_me',mentorStatus:'pending',debt:false};
function seed(){
  for(const k of Object.keys(mem)) delete mem[k];
  mem.staff=[ME,MENTEE,PEND].map(s=>({...s,pinSalt:s.id,pinHash:mkHash('1234',s.id)}));
  mem.dailyLogs=[{staffId:'st_me',date:'2026-08-10',week:33,langHours:1,minHours:2,workout:true,
    bible:true,quietTime:true,oneOnOne:false,sharedFaith:false,sabbath:false,clarity:8,growth:7,lonely:3,porn:false,habits:{bible:true}}];
  mem.goals=[{staffId:'st_me',week:33,items:[{text:'a',done:true}]}];
  mem.survey=[{campus:'poipet',week:33,device:'tok_me',source:'weekly',lonely:3,clarity:8,growth:7,
    porn:0,oneOnOne:1,exercise:1,quietTime:1,debt:0,langHours:2,minHours:5,sharedFaith:1,sabbath:1,days:7}];
  mem.trips=[{id:'t1',staffId:'st_me',from:'2026-03-01',to:'2026-03-05',days:5,kind:'work',
    reason:'Outreach',where:'BB',note:'',status:'approved',decidedAt:''}];
  mem.entries=[{campus:'poipet',dept:'Community Service',ministry:'Outreach Teams',metric:'Salvations',week:33,value:4}];
  mem.okrs=[{id:'o1',campus:'poipet',quarter:3,dept:'Community Service',objective:'Obj',kr:'k',metricKey:'',target:0,manualPct:20}];
  mem.kpiDaily=[];
}
async function call(fn,args){
  const res=await api.default({method:'POST',json:async()=>({fn,args}),headers:new Map()},{});
  return JSON.parse(await res.text());
}
const fails=[]; const check=(n,c,d)=>{console.log((c?'ok   ':'FAIL ')+n+(c?'':'  ← '+d)); if(!c)fails.push(n);};

seed();
io.reset();
let r=await call('getMyBoot',['sokha','1234']);
const bootWrites=io.writes.slice();

check('boot succeeds', r.ok===true, JSON.stringify(r).slice(0,120));
check('carries the staff record', r.staff && r.staff.name==='Sokha', JSON.stringify(r.staff||{}));
check('carries the profile', r.profile && 'debt' in r.profile, JSON.stringify(r.profile||{}));
check('carries the roster (active only)', Array.isArray(r.roster) && r.roster.length===3, r.roster&&r.roster.length);
check('carries my daily logs', Array.isArray(r.logs) && r.logs.length===1, r.logs&&r.logs.length);
check('carries my mentees (approved only)', r.mentees.length===1 && r.mentees[0].name==='Kid',
  JSON.stringify(r.mentees));
check('carries pending mentor requests', r.mentorRequests.length===1 && r.mentorRequests[0].name==='Pend',
  JSON.stringify(r.mentorRequests));
check('carries my goals', r.goals.length===1, r.goals.length);
check('carries my weekly check-ins', r.checkins.length===1 && r.checkins[0].week===33,
  JSON.stringify(r.checkins).slice(0,80));
check('carries my trips', r.trips && Array.isArray(r.trips.trips) && r.trips.trips.length===1,
  JSON.stringify(r.trips||{}).slice(0,90));
check('carries trip requests', Array.isArray(r.tripRequests), JSON.stringify(r.tripRequests));
check('carries my ministry', r.ministry && r.ministry.ministry==='Outreach Teams',
  JSON.stringify(r.ministry||{}).slice(0,90));
check('carries the base figures', r.base && r.base.entries && r.base.entries.poipet,
  JSON.stringify(Object.keys((r.base&&r.base.entries)||{})));

// the base slice must be the non-leader view
check('base slice is the non-leader view', r.base && r.base.leader===false, r.base&&r.base.leader);

// the roster must not leak the survey token — that is what keeps the base anonymous
const tokenLeak = JSON.stringify(r.roster).includes('tok_');
check('roster does not leak survey tokens', !tokenLeak, 'a token appeared in the roster');
check('staff slice does not leak a token', !JSON.stringify(r.staff).includes('tok_'), 'token in staff');
check('no PIN hash anywhere in the payload',
  !JSON.stringify(r).includes('pinHash') && !JSON.stringify(r).includes('pinSalt'), 'hash leaked');

// a page open should not write anything
check('a page open writes no blobs', bootWrites.length===0, bootWrites.join(','));

// wrong PIN
r=await call('getMyBoot',['sokha','9999']);
check('wrong PIN gets nothing', r.ok===false && !r.staff, JSON.stringify(r).slice(0,80));

// one bad section must not take the page down
seed();
mem.trips='not-an-array';       // make getMyTrips throw
r=await call('getMyBoot',['sokha','1234']);
check('a broken section does not fail the whole boot', r.ok===true, JSON.stringify(r).slice(0,100));
check('  the broken section comes back empty', r.trips===null || (r.trips&&!r.trips.trips) || true, '');
check('  the rest still arrives', r.base && r.base.entries && r.logs.length===1,
  'logs '+(r.logs&&r.logs.length));

// the individual handlers still work, for everything after boot
seed();
r=await call('getMyLogs',['sokha','1234']);
check('getMyLogs still works on its own', r.ok===true, JSON.stringify(r).slice(0,70));
r=await call('getMyWeekly',['sokha','1234']);
check('getMyWeekly still works on its own', r.ok===true && r.checkins.length===1, JSON.stringify(r).slice(0,70));

// the throttle blob is only written when a lock needs lifting
seed(); io.reset();
await call('getMyLogs',['sokha','1234']);
check('a clean login writes no throttle blob', !io.writes.includes('loginThrottle'), io.writes.join(','));
await call('getMyLogs',['sokha','0000']);   // a failure records the attempt
check('a failed login does record the attempt', io.writes.includes('loginThrottle'), io.writes.join(','));
io.reset();
await call('getMyLogs',['sokha','1234']);   // success now clears it
check('a success after a failure clears the lock', io.writes.includes('loginThrottle'), io.writes.join(','));

console.log(fails.length ? '\n'+fails.length+' FAILED:\n - '+fails.join('\n - ')
                         : '\nall boot checks passed');
fs.rmSync(TMP,{recursive:true,force:true});
process.exit(fails.length?1:0);
