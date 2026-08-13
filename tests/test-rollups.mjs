/* The roll-up maths, exercised directly against rollup.js.

   This used to scrape the functions out of index.html by name; they now live in
   rollup.js, so it loads the real engine instead. Same assertions, better aim —
   and it covers drillRows and the OKR progress the drill-down and Base tab rely on. */
/* Paths and the browser binary come from tests/env.mjs so this runs from a clone
   rather than from one machine's scratch directory. */
import { PUBLIC } from './env.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = PUBLIC + '/';
const ctx = { console };
vm.createContext(ctx);
// a couple of DOM stubs, so the file's drill-down section can be defined (not called)
vm.runInContext('var document = { getElementById: function(){ return null; }, createElement: function(){ return {}; }, body: { appendChild: function(){} } };', ctx);
vm.runInContext(fs.readFileSync(SRC + 'taxonomy.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(SRC + 'rollup.js', 'utf8'), ctx);

const P = 'poipet', S = 'siemreap';
const e = { [P]: {}, [S]: {} };
const put = (c, dept, min, metric, weeks) => { e[c][dept + '|' + min + '|' + metric] = weeks; };

put(P, 'Leadership Development', 'DTS', 'Students Enrolled', { 1: 20, 2: 22, 3: 22 });
put(P, 'Leadership Development', 'DTS', 'Students Graduated', { 3: 21 });
put(P, 'Leadership Development', 'DBS', 'Students Enrolled', { 1: 10, 2: 10 });
put(P, 'Leadership Development', 'DBS', 'Students Graduated', { 2: 9 });
put(P, 'Community Service', 'GP Education', 'Schools', { 1: 2 });
put(P, 'Community Service', 'GP Education', 'Students Enrolled', { 1: 80, 2: 85 });
put(P, 'Youth Education', 'YDC', 'Youth Enrolled', { 1: 40, 2: 44 });
put(P, 'Community Service', 'Outreach Teams', 'Teams Hosted', { 1: 1, 2: 2, 20: 1 });
put(P, 'Community Service', 'Outreach Teams', 'Volunteers Mobilized', { 1: 8, 2: 15 });
put(P, 'Community Service', 'Outreach Teams', 'Community Service Hours', { 1: 6, 2: 10 });
put(P, 'Community Service', 'Outreach Teams', 'Salvations', { 1: 3, 2: 5 });
put(P, 'Youth Education', 'YDC', 'Salvations', { 2: 4 });
put(P, 'Leadership Development', 'Church Partnerships', 'Partner Churches Supported', { 1: 4, 2: 4, 3: 5 });
put(P, 'Leadership Development', 'Church Partnerships', 'Churches Being Led', { 1: 2, 3: 3 });
put(P, 'Leadership Development', 'Church Partnerships', 'Combined Congregation Attendance', { 1: 300, 3: 340 });
put(P, 'Base Leadership', 'Campus Leadership', 'Spoke at Churches', { 1: 2, 2: 1 });
put(P, 'Base Leadership', 'Campus Leadership', 'Total Staff', { 1: 12 });
put(S, 'Youth Education', 'YDC', 'Youth Enrolled', { 1: 60 });
put(S, 'Community Service', 'LTN', 'Students Enrolled', { 1: 30, 2: 33 });
put(S, 'Leadership Development', 'GPDTS', 'Students Enrolled', { 1: 15 });
put(S, 'Base Leadership', 'Campus Leadership', 'Total Staff', { 1: 9 });

ctx.__D = { entries: e, survey: [], roster: null, week: 52 };
vm.runInContext('var R = gpRollup(__D);', ctx);
const c = expr => vm.runInContext(expr, ctx);

const both = "['poipet','siemreap']", poipet = "['poipet']", sr = "['siemreap']";

const checks = [
  ['ldStudents both campuses', `R.ldStudents(${both})`, 47],
  ['ldStudents poipet only', `R.ldStudents(${poipet})`, 32],
  ['ldGraduates poipet (sum)', `R.ldGraduates(${poipet})`, 30],
  ['ldSchools both (DTS,DBS,GPDTS)', `R.ldSchools(${both})`, 3],
  ['communitySchools poipet', `R.communitySchools(${poipet})`, 3],
  ['communitySchools siemreap', `R.communitySchools(${sr})`, 2],
  ['communitySchools both', `R.communitySchools(${both})`, 5],
  ['communityStudents poipet', `R.communityStudents(${poipet})`, 129],
  ['communityStudents both', `R.communityStudents(${both})`, 222],
  ['Teams Hosted YTD', `R.outreachRollup(${poipet},'Teams Hosted')`, 4],
  ['Teams Hosted Q1', `R.outreachRollup(${poipet},'Teams Hosted',0)`, 3],
  ['Teams Hosted Q2', `R.outreachRollup(${poipet},'Teams Hosted',1)`, 1],
  ['Volunteers Mobilized (sum)', `R.outreachRollup(${poipet},'Volunteers Mobilized')`, 23],
  ['partnerChurches', `R.partnerChurches(${poipet})`, 8],
  ['congregation attendance is latest, not summed',
    `R.ministryRollup(${poipet},'Leadership Development',['Church Partnerships'],'Combined Congregation Attendance')`, 340],
  ['blAggAll Spoke at Churches', `R.blAggAll(${poipet},'Spoke at Churches')`, 3],
  ['totalStaff both', `R.totalStaff(${both})`, 21],
  ['volunteerHours', `R.volunteerHours(${poipet})`, 198],
  ['unlogged metric is null', `R.outreachRollup(${sr},'Teams Hosted')`, null],
  ['ldGraduates siemreap is null', `R.ldGraduates(${sr})`, null],
  ['weekly rollup w2', `R.ministryRollupWeek(${poipet},'Community Service',['Outreach Teams'],'Teams Hosted',2)`, 2],

  // --- the drill-down reads the same entries the totals do ---
  ['salvations pooled base-wide', `R.headlineFor(${poipet},'Salvations')`, 12],
  ['drillRows finds both ministries behind it',
    `R.drillRows(function(c,d,m,k){ return c==='poipet' && k==='Salvations' && d!=='Base Leadership'; }).length`, 2],
  ['drill row totals sum to the headline',
    `R.drillRows(function(c,d,m,k){ return c==='poipet' && k==='Salvations' && d!=='Base Leadership'; })
       .reduce(function(a,r){ return a+r.total; },0)`, 12],
  ['drill scoped to one ministry gives one row',
    `R.drillRows(function(c,d,m,k){ return c==='poipet' && k==='Salvations' && m==='Outreach Teams'; }).length`, 1],
  ['drill row keeps its weeks',
    `Object.keys(R.drillRows(function(c,d,m,k){ return k==='Teams Hosted'; })[0].weeks).length`, 3],
  ['drill respects each metric’s aggregation (latest, not sum)',
    `R.drillRows(function(c,d,m,k){ return k==='Partner Churches Supported'; })[0].total`, 5],

  // --- OKR progress ---
  ['OKR metric-backed progress',
    `R.krProgress({campus:'poipet',quarter:1},{metricKey:'Community Service|Outreach Teams|Teams Hosted',target:6}).pct`, 50],
  ['OKR manual progress', `R.krProgress({campus:'poipet',quarter:1},{manual:70}).pct`, 70],
  ['OKR objective averages its key results',
    `R.objProgress({campus:'poipet',quarter:1,krs:[{manual:100},{manual:40}]})`, 70],
];

let bad = 0;
for (const [name, expr, want] of checks) {
  let got;
  try { got = c(expr); } catch (err) { got = 'THREW: ' + err.message; }
  const ok = got === want;
  if (!ok) bad++;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + '  → ' + got + (ok ? '' : '  (want ' + want + ')'));
}
console.log(bad ? '\n' + bad + ' FAILED' : '\nall ' + checks.length + ' checks passed');
process.exit(bad ? 1 : 0);
