/*  Shared roll-up engine — the maths behind every number on the dashboard.

    Extracted from index.html so the staff page can show a person their own
    base's figures without a second copy of the arithmetic. One engine, two
    views: index.html renders it for leadership, teams.html renders it on the
    Base tab. If a roll-up rule changes it changes for both, which is the whole
    point of this file existing.

    Nothing in here stores or fetches anything. gpRollup() is handed the data
    already loaded by the page and returns the read-only questions you can ask
    of it:

      var R = gpRollup({ entries: data.entries, survey: data.survey,
                         roster: roster, week: currentWeek() });
      R.headlineFor(['siemreap'], 'Salvations');

    `week` is the last week to consider — it only bounds the trend comparisons.
    The two pages compute "this week" differently (index.html counts from the
    Monday of week 1, teams.html mirrors the API's ISO week), so the caller
    passes its own answer in rather than this file picking a winner.

    Depends on taxonomy.js for modeOf / getDepartments / BL_DEPT / PLATFORMS
    and the school ministry groups. Plain script, no modules, no build step —
    same contract as taxonomy.js and km.js.  */

/* ---------- pure helpers, no data needed ---------- */

/* Quarter index (0-3) for a week number. */
function qOf(w){ return Math.min(3, Math.floor((w-1)/13)); }

function fmt(v, metric){
  if(v===null||v===undefined) return '—';
  var money = metric && metric.indexOf('($)')>-1;
  if(metric && (metric.indexOf('(1-10)')>-1)) return v.toFixed(1);
  if(metric && metric.indexOf('(%)')>-1) return Math.round(v)+'%';
  var n = Math.round(v).toLocaleString();
  return money ? '$'+n : n;
}

/* Metrics where a fall is the good news, so the ▲/▼ badge flips colour. */
var LOWER_BETTER = {'Staff Debt ($)':1,'Weekly Expenses ($)':1,'Students Struggling':1};

function pctChange(prev,cur){
  if(prev===null||cur===null||prev===undefined||cur===undefined||isNaN(prev)||isNaN(cur)) return null;
  if(prev===0) return null;
  return Math.round((cur-prev)/Math.abs(prev)*100);
}
/* Share of the base that checked in, as a whole number. Capped at 100 because a
   week can hold more rows than there are current staff — somebody who has since
   left still has their older weeks in the blob — and "150%" reads as a bug rather
   than as the stale row it is. The raw counts are always shown next to it, so the
   discrepancy stays visible to anyone looking for it. */
function gpCheckinPct(n, total){
  if(!total || total <= 0) return null;
  return Math.min(100, Math.round((Number(n)||0) / total * 100));
}

function trendBadge(pct, higherBetter){
  if(pct===null||pct===undefined) return '';
  if(pct===0) return '<span class="trend flat">— 0%</span>';
  var up = pct>0, good = up ? higherBetter : !higherBetter;
  return '<span class="trend '+(good?'up':'down')+'">'+(up?'▲':'▼')+' '+Math.abs(pct)+'%</span>';
}

/* null + null stays null — "nothing logged yet" is different from zero, and the
   dashboard shows an em dash for it rather than a misleading 0. */
function addKnown(vals){
  var total=0, any=false;
  vals.forEach(function(v){ if(v!==null && v!==undefined && !isNaN(v)){ total+=v; any=true; } });
  return any ? total : null;
}

/* One metric's weeks collapsed to a single figure, per that metric's rule:
   sum for events, latest for headcounts, avg for 1-10 scores. */
function aggregate(entries, mode, quarter){
  if(!entries) return null;
  var pairs = [];
  for(var w in entries){
    var wk = Number(w), v = Number(entries[w]);
    if(isNaN(v)) continue;
    if(quarter !== undefined && quarter !== null && qOf(wk) !== quarter) continue;
    pairs.push([wk, v]);
  }
  if(!pairs.length) return null;
  pairs.sort(function(a,b){ return a[0]-b[0]; });
  if(mode==='avg'){ var s=0; pairs.forEach(function(p){s+=p[1];}); return s/pairs.length; }
  if(mode==='latest') return pairs[pairs.length-1][1];
  var tt=0; pairs.forEach(function(p){tt+=p[1];}); return tt;
}

/* Most recent recorded value STRICTLY BEFORE a given week. Used by the log
   form to carry a headcount forward so nobody retypes an unchanged number
   every week. */
function lastBefore(weeks, week){
  if(!weeks) return null;
  var best = null;
  for(var w in weeks){
    var wk = Number(w), v = Number(weeks[w]);
    if(isNaN(v) || wk >= Number(week)) continue;
    if(!best || wk > best.week) best = { week:wk, value:v };
  }
  return best;
}

/* Department names the roll-ups group by. Kept here rather than in taxonomy.js
   because they are about which figures add together, not about the taxonomy. */
var LD_DEPT = 'Leadership Development';
var CS_DEPT = 'Community Service';
var YE_DEPT = 'Youth Education';

/* ---------- the engine ---------- */
function gpRollup(D){
  var ENTRIES = D.entries || {};
  var SURVEY  = D.survey  || [];
  var ROSTER  = D.roster  || null;
  var MAXW    = Number(D.week) || 52;

  function entriesOf(cid){ return ENTRIES[cid] || {}; }
  function entryWeeks(campus, dept, ministry, metric){
    return entriesOf(campus)[dept+'|'+ministry+'|'+metric];
  }

  /* ---------- weekly trend (vs the week before) ---------- */
  function lastTwo(valFn, maxW){
    maxW = maxW || MAXW;
    var arr=[];
    for(var w=1; w<=maxW; w++){ var v=valFn(w); if(v!==null && v!==undefined && !isNaN(v)) arr.push(v); }
    if(arr.length<2) return null;
    return [arr[arr.length-2], arr[arr.length-1]];
  }
  function trendB(valFn, higherBetter, maxW){
    var lt=lastTwo(valFn, maxW); if(!lt) return '';
    return trendBadge(pctChange(lt[0],lt[1]), higherBetter!==false);
  }
  function trendFor(valFn, metric, maxW){
    return trendB(valFn, (metric && LOWER_BETTER[metric]) ? false : true, maxW);
  }

  /* ---------- base-wide metric totals ----------
     Base Leadership is skipped: it reports the same metric names about the
     departments it oversees, so counting it would double every figure. */
  function metricWeekSum(ids, metric, w){
    var total=0, any=false;
    ids.forEach(function(cid){
      var entries = entriesOf(cid);
      for(var k in entries){ var parts=k.split('|'); if(parts[0]===BL_DEPT) continue;
        if(parts[2]===metric){ var v=entries[k][w]; if(v!==undefined && v!==null && !isNaN(Number(v))){ total+=Number(v); any=true; } } }
    });
    return any ? total : null;
  }
  function headlineFor(ids, metric, quarter){
    var total=0, any=false;
    ids.forEach(function(cid){
      var entries = entriesOf(cid);
      for(var k in entries){
        var parts = k.split('|');
        if(parts[0]===BL_DEPT) continue;
        if(parts[2]===metric){
          var v = aggregate(entries[k],'sum',quarter);
          if(v!==null){ total+=v; any=true; }
        }
      }
    });
    return any ? total : null;
  }

  /* Community Service Hours × Volunteers Mobilized, per week, summed */
  function volunteerHours(ids, quarter){
    var total=0, any=false;
    ids.forEach(function(cid){
      var entries = entriesOf(cid);
      for(var k in entries){
        var parts = k.split('|');
        if(parts[0]===BL_DEPT || parts[2]!=='Community Service Hours') continue;
        var hours = entries[k];
        var vols = entries[parts[0]+'|'+parts[1]+'|Volunteers Mobilized'] || {};
        for(var w in hours){
          if(quarter!==undefined && quarter!==null && qOf(Number(w))!==quarter) continue;
          var hv = Number(hours[w]); if(isNaN(hv)) continue;
          var vv = Number(vols[w]); if(isNaN(vv) || vv<=0) vv = 1;
          total += hv*vv; any=true;
        }
      }
    });
    return any ? total : null;
  }

  function salvByDept(ids){
    var out={ 'Community Service':null, 'Youth Education':null, 'Leadership Development':null, 'Skills Training':null };
    ids.forEach(function(cid){
      var entries = entriesOf(cid);
      for(var k in entries){
        var parts = k.split('|');
        if(parts[0]===BL_DEPT || out[parts[0]]===undefined) continue;
        if(parts[2]==='Salvations'){
          var v = aggregate(entries[k],'sum');
          if(v!==null) out[parts[0]] = (out[parts[0]]||0)+v;
        }
      }
    });
    return out;
  }

  /* A Base Leadership metric across that campus's departments. */
  function blAgg(campus, metric){
    var mode = modeOf(metric), vals=[];
    Object.keys(getDepartments(campus)[BL_DEPT]).forEach(function(min){
      var e = entriesOf(campus)[BL_DEPT+'|'+min+'|'+metric];
      var v = aggregate(e, mode);
      if(v!==null) vals.push(v);
    });
    if(!vals.length) return null;
    var tt=0; vals.forEach(function(v){tt+=v;});
    return mode==='avg' ? tt/vals.length : tt;
  }
  /* Base Leadership metric across several campuses — blAgg() is one campus only. */
  function blAggAll(ids, metric){
    return addKnown(ids.map(function(cid){ return blAgg(cid, metric); }));
  }

  /* Media roll-up across campuses */
  function mediaSummary(ids){
    var pages=0, followers=0, views=0, platCount=0, any=false;
    PLATFORMS.forEach(function(p){
      var pPages=0, pAny=false;
      ids.forEach(function(cid){
        var e = entriesOf(cid);
        var pg = aggregate(e['Youth Education|GP Media|'+p+' Pages'],'latest');
        var fl = aggregate(e['Youth Education|GP Media|'+p+' Followers'],'latest');
        var vw = aggregate(e['Youth Education|GP Media|'+p+' Views'],'sum');
        if(pg!==null){ pPages+=pg; pAny=true; }
        if(fl!==null){ followers+=fl; any=true; }
        if(vw!==null){ views+=vw; any=true; }
      });
      if(pAny && pPages>0){ platCount++; pages+=pPages; any=true; }
    });
    return any ? { platforms:platCount, pages:pages, followers:followers, views:views } : null;
  }

  /* ---------- headline roll-ups: schools, teams, churches ----------
     Nothing new is stored for these. They read the same weekly entries as every
     other figure on the page; the only new thing is which
     (department | ministry | metric) triples get added together. The ministry
     groups live in taxonomy.js so the log form and the dashboard stay in step.

     Each metric keeps its own aggregation rule, so headcounts ('Students
     Enrolled', 'Partner Churches Supported') take the latest week rather than
     summing the same people every week, while events ('Teams Hosted',
     'Students Graduated') accumulate across the year. */

  /* One metric added across a named set of ministries in one department. */
  function ministryRollup(ids, dept, ministries, metric, quarter){
    var mode = modeOf(metric), vals = [];
    ids.forEach(function(cid){
      ministries.forEach(function(min){
        vals.push(aggregate(entryWeeks(cid, dept, min, metric), mode, quarter));
      });
    });
    return addKnown(vals);
  }

  /* The same roll-up for a single week, which is what the ▲/▼ trend badges
     compare. Reads the raw week rather than aggregating, so a 'latest' metric
     gives that week's level and a 'sum' metric that week's events. */
  function ministryRollupWeek(ids, dept, ministries, metric, week){
    var vals = [];
    ids.forEach(function(cid){
      ministries.forEach(function(min){
        var weeks = entryWeeks(cid, dept, min, metric);
        var v = weeks ? Number(weeks[week]) : NaN;
        vals.push(isNaN(v) ? null : v);
      });
    });
    return addKnown(vals);
  }

  /* Has anything at all been logged for this ministry? Lets a school count as
     running without asking anyone to type a "1" every week. */
  function ministryLogged(campus, dept, ministry){
    var entries = entriesOf(campus), pre = dept+'|'+ministry+'|';
    for(var k in entries){
      if(k.indexOf(pre)!==0) continue;
      for(var w in entries[k]) if(!isNaN(Number(entries[k][w]))) return true;
    }
    return false;
  }

  /* How many schools a group of ministries is running. A ministry reporting its
     own 'Schools' figure contributes that number; otherwise a ministry with any
     data at all is the one school it is — YDC is one school, and nobody should
     have to log that separately. */
  function schoolCount(ids, dept, ministries){
    var n=0, any=false;
    ids.forEach(function(cid){
      ministries.forEach(function(min){
        var reported = aggregate(entryWeeks(cid, dept, min, 'Schools'), 'latest');
        if(reported!==null && reported>0){ n += reported; any=true; return; }
        if(ministryLogged(cid, dept, min)){ n += 1; any=true; }
      });
    });
    return any ? n : null;
  }

  function ldSchools(ids){ return schoolCount(ids, LD_DEPT, LD_SCHOOL_MINISTRIES); }
  function ldStudents(ids, quarter){ return ministryRollup(ids, LD_DEPT, LD_SCHOOL_MINISTRIES, 'Students Enrolled', quarter); }
  function ldGraduates(ids, quarter){ return ministryRollup(ids, LD_DEPT, LD_SCHOOL_MINISTRIES, 'Students Graduated', quarter); }

  function communitySchools(ids){
    return addKnown([ schoolCount(ids, CS_DEPT, CS_SCHOOL_MINISTRIES),
                      schoolCount(ids, YE_DEPT, YE_SCHOOL_MINISTRIES) ]);
  }
  function communityStudents(ids, quarter){
    return addKnown([ ministryRollup(ids, CS_DEPT, CS_SCHOOL_MINISTRIES, 'Students Enrolled', quarter),
                      ministryRollup(ids, YE_DEPT, YE_SCHOOL_MINISTRIES, 'Youth Enrolled', quarter) ]);
  }
  function communityDiscipled(ids){
    return addKnown([ ministryRollup(ids, CS_DEPT, CS_SCHOOL_MINISTRIES, 'Students in Discipleship'),
                      ministryRollup(ids, YE_DEPT, YE_SCHOOL_MINISTRIES, 'Students in Discipleship') ]);
  }

  function outreachRollup(ids, metric, quarter){
    return ministryRollup(ids, CS_DEPT, ['Outreach Teams'], metric, quarter);
  }

  /* Every local church we are in relationship with: the ones we support as
     partners plus the ones our people are actually leading. */
  function partnerChurches(ids){
    return addKnown([ ministryRollup(ids, LD_DEPT, ['Church Partnerships'], 'Partner Churches Supported'),
                      ministryRollup(ids, LD_DEPT, ['Church Partnerships'], 'Churches Being Led') ]);
  }

  /* ---------- staff ---------- */
  function rosterCount(ids){
    if(!ROSTER) return null;
    var n=0; ROSTER.forEach(function(r){ if(ids.indexOf(r.campus)>-1) n++; });
    return n;
  }
  /* Accounts first, because a person with an account is a person we can name.
     The logged 'Total Staff' figure is the fallback while the base is still
     signing up. */
  function totalStaff(ids){
    var rc = rosterCount(ids);
    if(rc!==null && rc>0) return rc;
    var t=0, any=false;
    ids.forEach(function(cid){ var v=blAgg(cid,'Total Staff'); if(v!==null){ t+=v; any=true; } });
    if(any) return t;
    return (rc!==null) ? rc : null;
  }
  function checkinRate(ids, week){
    var responses = surveyRows(ids, week).length;
    var t = totalStaff(ids);
    return { n:responses, total:(t!==null && t>0)?Math.round(t):null };
  }

  /* Who the staff of a campus are: what kind of staff, and where they are from.

     Counted from the roster, never from a logged number, because these questions
     are about named people — you cannot ask a weekly KPI cell how many countries
     it is. That has a consequence worth stating on screen rather than hiding:
     if the base has logged a 'Total Staff' larger than the number of accounts,
     the headline is that larger figure while this breakdown only describes the
     people who have profiles. `counted` and `missing` say so.

     'Khmer' is the home country (Cambodia) and 'international' is everyone else —
     that is the split the base actually talks in. Anyone who has not said yet is
     in neither: `noCountry` and `noType` are shown, not quietly folded into the
     larger group, because "we don't know" and "nobody" are different answers. */
  function staffBreakdown(ids){
    if(!ROSTER) return null;
    var people = ROSTER.filter(function(r){ return ids.indexOf(r.campus)>-1; });
    var out = {
      counted: people.length, missing: 0,
      types: { campus:0, yap:0, ministry:0 }, noType: 0,
      khmer: 0, international: 0, noCountry: 0,
      countries: 0, countryList: []
    };
    var seen = {};
    people.forEach(function(p){
      var ty = String(p.staffType||'');
      if(out.types[ty] === undefined) out.noType++; else out.types[ty]++;
      var c = String(p.country||'').trim();
      if(!c){ out.noCountry++; return; }
      if(c === HOME_COUNTRY) out.khmer++; else out.international++;
      if(!seen[c]){ seen[c] = 0; out.countryList.push(c); }
      seen[c]++;
    });
    out.countryList.sort(function(a,b){
      // Biggest group first, and the home country ahead of an equal-sized one.
      if(seen[b] !== seen[a]) return seen[b] - seen[a];
      if(a === HOME_COUNTRY) return -1;
      if(b === HOME_COUNTRY) return 1;
      return a < b ? -1 : 1;
    });
    out.countries = out.countryList.length;
    out.perCountry = seen;
    /* Deliberately the LOGGED headcount, not totalStaff(): totalStaff prefers the
       roster once anyone has an account, so comparing against it could only ever
       be zero. The question here is the other one — has the base logged more staff
       than have signed up? */
    var logged = null;
    ids.forEach(function(cid){
      var v = blAgg(cid,'Total Staff');
      if(v !== null) logged = (logged || 0) + v;
    });
    if(logged !== null && logged > people.length) out.missing = Math.round(logged) - people.length;
    return out;
  }

  /* ---------- survey ---------- */
  function surveyRows(ids, week){
    return SURVEY.filter(function(r){
      return ids.indexOf(r.campus)>-1 && (week===undefined || Number(r.week)===Number(week));
    });
  }
  function pct(rows, id){
    var v = rows.filter(function(r){ return r[id]!==null && r[id]!==undefined; });
    if(!v.length) return null;
    var y=0; v.forEach(function(r){ if(r[id]) y++; });
    return Math.round(y/v.length*100);
  }
  function avg(rows, id){
    var v = rows.filter(function(r){ return r[id]!==null && r[id]!==undefined; });
    if(!v.length) return null;
    var s=0; v.forEach(function(r){ s+=Number(r[id])||0; });
    return s/v.length;
  }
  function healthScore(ids, week){
    var rows = surveyRows(ids, week);
    if(!rows.length) return null;
    var s=0; rows.forEach(function(r){ s+=compositeOf(r); });
    return s/rows.length;
  }

  /* ---------- where a number came from ----------
     Every total on the dashboard is a sum over (department | ministry | metric)
     keys. drillRows walks the same entries and hands back the rows that fed one,
     so tapping a figure can show its parts week by week instead of asking
     somebody to trust it. */
  function drillRows(filterFn){
    var rows = [];
    Object.keys(ENTRIES).forEach(function(campus){
      var entries = ENTRIES[campus];
      Object.keys(entries).forEach(function(key){
        var parts = key.split('|');
        var dept = parts[0], ministry = parts[1], metric = parts[2];
        if(!filterFn(campus, dept, ministry, metric)) return;
        var weeks = entries[key];
        var total = aggregate(weeks, modeOf(metric));
        if(total===null) return;
        rows.push({ campus:campus, dept:dept, ministry:ministry, metric:metric, weeks:weeks, total:total });
      });
    });
    return rows;
  }

  /* ---------- OKR progress ----------
     A key result is either tied to a metric — in which case progress is the
     quarter's actual against the target — or tracked by hand. Shared so the
     dashboard and a staff member's Base tab agree on how far along something is. */
  function krProgress(o, kr){
    if(kr.metricKey){
      var parts = kr.metricKey.split('|');
      var actual = aggregate(entriesOf(o.campus)[kr.metricKey], modeOf(parts[2]), Number(o.quarter)-1);
      if(actual===null) return { pct:0, actual:null };
      var p = kr.target>0 ? Math.round(actual/kr.target*100) : 0;
      return { pct:Math.max(0,p), actual:actual };
    }
    return { pct:Math.max(0,Math.min(100,Number(kr.manual)||0)), actual:null };
  }
  function objProgress(o){
    var pcts = (o.krs||[]).map(function(kr){ return krProgress(o,kr).pct; });
    if(!pcts.length) return 0;
    var s=0; pcts.forEach(function(p){ s+=p; });
    return Math.round(s/pcts.length);
  }

  return {
    entryWeeks:entryWeeks, aggregate:aggregate,
    lastTwo:lastTwo, trendB:trendB, trendFor:trendFor,
    metricWeekSum:metricWeekSum, headlineFor:headlineFor,
    volunteerHours:volunteerHours, salvByDept:salvByDept,
    blAgg:blAgg, blAggAll:blAggAll, mediaSummary:mediaSummary,
    ministryRollup:ministryRollup, ministryRollupWeek:ministryRollupWeek,
    ministryLogged:ministryLogged, schoolCount:schoolCount,
    ldSchools:ldSchools, ldStudents:ldStudents, ldGraduates:ldGraduates,
    communitySchools:communitySchools, communityStudents:communityStudents,
    communityDiscipled:communityDiscipled,
    outreachRollup:outreachRollup, partnerChurches:partnerChurches,
    rosterCount:rosterCount, totalStaff:totalStaff, checkinRate:checkinRate,
    staffBreakdown:staffBreakdown,
    surveyRows:surveyRows, pct:pct, avg:avg, healthScore:healthScore,
    drillRows:drillRows, krProgress:krProgress, objProgress:objProgress
  };
}

/* ================= the drill-down sheet =================
   "Where did this number come from?" — shared so a figure means the same thing,
   and opens the same way, on the leadership dashboard and on a staff member's
   Base tab. Tapping a total lists every ministry that fed it, each with its
   week-by-week values.

   This is the only part of rollup.js that touches the DOM. It needs t() and
   CAMPUSES from the page (both pages define them); everything else is here, and
   it creates its own mount point, so a page needs no extra markup. */
function gpDrillEsc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}
function gpDrillT(s){ return (typeof t === 'function') ? t(s) : s; }
function gpCampusShort(id){
  if(typeof CAMPUSES !== 'undefined'){
    for(var i=0;i<CAMPUSES.length;i++) if(CAMPUSES[i].id===id) return CAMPUSES[i].short;
  }
  return id;
}
function gpMinEmoji(name){
  return (typeof MIN_EMOJI !== 'undefined' && MIN_EMOJI[name]) ? MIN_EMOJI[name]+' ' : '';
}

/* Put these on any element to make it open its own breakdown. `ids` is the list
   of campuses the figure covers; dept/ministry narrow it the way the total was
   narrowed; quarter limits it to one quarter. */
function gpDrillAttrs(metric, ids, dept, ministry, quarter){
  return ' data-drill-metric="'+gpDrillEsc(metric)+'" data-drill-ids="'+gpDrillEsc(ids.join(','))+'"'+
    (dept ? ' data-drill-dept="'+gpDrillEsc(dept)+'"' : '')+
    (ministry ? ' data-drill-ministry="'+gpDrillEsc(ministry)+'"' : '')+
    (quarter!==undefined && quarter!==null ? ' data-drill-quarter="'+quarter+'"' : '');
}

/* Attributes for a figure that is summed across a named set of ministries.
   `label` names the group in the sheet's title, since neither a department nor a
   single ministry does. */
function gpDrillGroupAttrs(metric, ids, ministries, label, quarter){
  var mets = Array.isArray(metric) ? metric : [metric];
  return ' data-drill-metric="'+gpDrillEsc(mets[0])+'"'+
         (mets.length>1 ? ' data-drill-metrics="'+gpDrillEsc(mets.join('|'))+'"' : '')+
         ' data-drill-ids="'+gpDrillEsc(ids.join(','))+'"'+
         (ministries && ministries.length ? ' data-drill-ministries="'+gpDrillEsc(ministries.join('|'))+'"' : '')+
         (label ? ' data-drill-label="'+gpDrillEsc(label)+'"' : '')+
         ' data-drill-quarter="'+(quarter===undefined||quarter===null?'':quarter)+'"'+
         ' role="button" tabindex="0" class="drillable"';
}

function gpDrillRoot(){
  var r = document.getElementById('ddRoot');
  if(!r){ r = document.createElement('div'); r.id = 'ddRoot'; document.body.appendChild(r); }
  return r;
}
function gpCloseDrill(){ var r = document.getElementById('ddRoot'); if(r) r.innerHTML = ''; }

function gpOpenDrill(title, rows){
  rows = rows.slice().sort(function(a,b){ return b.total-a.total; });
  var h = '<div class="ddOverlay" id="ddOverlay"><div class="ddModal" role="dialog" aria-modal="true">'+
    '<div class="ddHead"><h3>'+gpDrillEsc(title)+'</h3>'+
    '<button class="ddClose" id="ddClose" aria-label="'+gpDrillEsc(gpDrillT('Close'))+'">✕</button></div>';
  if(!rows.length){
    h += '<p class="ddSub">'+gpDrillEsc(gpDrillT('Nothing logged for this yet.'))+'</p>';
  } else {
    rows.forEach(function(r){
      var weeks = Object.keys(r.weeks).map(Number).sort(function(a,b){ return a-b; });
      h += '<div class="ddRow"><div class="ddRowHead"><span>'+
        gpDrillEsc(gpDrillT(gpCampusShort(r.campus)))+' · '+gpMinEmoji(r.dept)+gpDrillEsc(gpDrillT(r.dept))+
        ' · '+gpDrillEsc(gpDrillT(r.ministry))+'</span>'+
        '<span class="ddRowVal">'+fmt(r.total, r.metric)+'</span></div>'+
        '<div class="ddWeeks">'+weeks.map(function(w){
          return 'W'+w+': '+fmt(r.weeks[w], r.metric);
        }).join(' · ')+'</div></div>';
    });
  }
  h += '</div></div>';
  gpDrillRoot().innerHTML = h;
  document.getElementById('ddClose').onclick = gpCloseDrill;
  document.getElementById('ddOverlay').onclick = function(e){ if(e.target.id==='ddOverlay') gpCloseDrill(); };
}

/* A plain list in the same sheet the drill-down uses. The drill sheet's rows are
   metric-shaped (campus · department · ministry, then the weeks behind it), which
   is the wrong shape for "which countries are we". Rather than bend that into
   something it isn't, this is the same overlay with label / value rows. */
function gpOpenList(title, rows, note){
  var h = '<div class="ddOverlay" id="ddOverlay"><div class="ddModal" role="dialog" aria-modal="true">'+
    '<div class="ddHead"><h3>'+gpDrillEsc(title)+'</h3>'+
    '<button class="ddClose" id="ddClose" aria-label="'+gpDrillEsc(gpDrillT('Close'))+'">✕</button></div>';
  if(note) h += '<p class="ddSub">'+gpDrillEsc(note)+'</p>';
  if(!rows.length){
    h += '<p class="ddSub">'+gpDrillEsc(gpDrillT('Nothing logged for this yet.'))+'</p>';
  } else {
    rows.forEach(function(r){
      h += '<div class="ddRow"><div class="ddRowHead"><span>'+gpDrillEsc(r.label)+'</span>'+
        '<span class="ddRowVal">'+gpDrillEsc(String(r.value))+'</span></div>'+
        (r.sub ? '<div class="ddWeeks">'+gpDrillEsc(r.sub)+'</div>' : '')+'</div>';
    });
  }
  h += '</div></div>';
  gpDrillRoot().innerHTML = h;
  document.getElementById('ddClose').onclick = gpCloseDrill;
  document.getElementById('ddOverlay').onclick = function(e){ if(e.target.id==='ddOverlay') gpCloseDrill(); };
}

/* ---- who the staff are ----
   The headline staff number is everyone at the campus. This is the same people
   split two ways: what kind of staff they are, and where they are from. Both
   pages render it from one function so the base cannot be described differently
   on the dashboard and on someone's phone.

   Everything here is a count of people with profiles. When the base has logged a
   bigger 'Total Staff' than the number of accounts, that gap is printed rather
   than smoothed over — otherwise the split silently describes a smaller base than
   the number above it. */
function gpStaffMixHtml(bd){
  if(!bd || !bd.counted) return '';
  var chips = [];
  ['campus','yap','ministry'].forEach(function(id){
    if(!bd.types[id]) return;
    var label = (typeof staffTypeShort === 'function') ? staffTypeShort(id) : id;
    chips.push('<span>'+gpDrillEsc(gpDrillT(label))+' <b>'+bd.types[id]+'</b></span>');
  });
  if(bd.noType) chips.push('<span>'+gpDrillEsc(gpT('{n} not said yet',{n:bd.noType}))+'</span>');

  var h = chips.length ? '<div class="heroQ staffMix">'+chips.join('')+'</div>' : '';

  var bits = [];
  if(bd.khmer) bits.push(gpT('{n} Khmer',{n:bd.khmer}));
  if(bd.international) bits.push(gpT('{n} international',{n:bd.international}));
  if(bd.countries) bits.push(gpT('{n} countries',{n:bd.countries}));
  if(bits.length){
    h += '<div class="heroTrend staffMixRow"><button class="mixBtn" data-staffmix="1">'+
      gpDrillEsc(bits.join(' · '))+' ›</button></div>';
  } else if(bd.noCountry){
    h += '<div class="heroTrend staffMixRow">'+gpDrillEsc(gpDrillT('Nobody has said where they are from yet.'))+'</div>';
  }
  if(bd.missing){
    h += '<div class="heroTrend staffMixRow dim">'+
      gpDrillEsc(gpT('{n} more staff have no profile yet',{n:bd.missing}))+'</div>';
  }
  return h;
}

/* Open the country list behind that line. Call after each render with the same
   breakdown that was rendered. */
function gpBindStaffMix(bd){
  document.querySelectorAll('[data-staffmix]').forEach(function(el){
    el.onclick = function(){
      if(!bd) return;
      var rows = bd.countryList.map(function(c){
        /* Country names are not translated: the picker they come from is a list of
           Latin-script names, and half a list in Khmer would read worse than none.
           If the team wants them in Khmer that is its own piece of work. */
        return { label: c, value: bd.perCountry[c],
          sub: (c === HOME_COUNTRY) ? gpDrillT('Khmer') : gpDrillT('international') };
      });
      var note = bd.noCountry ? gpT('{n} still to say where they are from',{n:bd.noCountry}) : '';
      gpOpenList(gpDrillT('Where we are from'), rows, note);
    };
  });
}

/* Wire every element carrying gpDrillAttrs(). Call it after each render, with
   the rollup instance whose numbers are on screen. */
function gpBindDrill(R){
  if(!R || !R.drillRows) return;
  document.querySelectorAll('[data-drill-metric]').forEach(function(el){
    el.onclick = function(){
      var metric   = el.getAttribute('data-drill-metric');
      var ids      = el.getAttribute('data-drill-ids').split(',');
      var dept     = el.getAttribute('data-drill-dept');
      var ministry = el.getAttribute('data-drill-ministry');
      /* A group of ministries, for a figure summed across several of them — the
         community-school student count spans two departments, so neither a dept
         nor a single ministry describes it. Without this those tiles had to be
         left un-tappable, which is why some numbers opened and some did not. */
      var minsAttr = el.getAttribute('data-drill-ministries');
      var mins     = minsAttr ? minsAttr.split('|') : null;
      /* Some tiles add two metrics together — community students is Students
         Enrolled plus Youth Enrolled — so the sheet has to gather both. */
      var metsAttr = el.getAttribute('data-drill-metrics');
      var mets     = metsAttr ? metsAttr.split('|') : null;
      var qAttr    = el.getAttribute('data-drill-quarter');
      var quarter  = (qAttr===null || qAttr==='') ? null : Number(qAttr);

      var rows = R.drillRows(function(campus, d, min, met){
        if(ids.indexOf(campus)===-1) return false;
        if(mets ? mets.indexOf(met)===-1 : met!==metric) return false;
        if(dept && d!==dept) return false;
        if(ministry && min!==ministry) return false;
        if(mins && mins.indexOf(min)===-1) return false;
        // Matches how the totals are computed: base-wide figures skip Base
        // Leadership, which reports the same metric names about its own work.
        if(!dept && typeof BL_DEPT !== 'undefined' && d===BL_DEPT) return false;
        return true;
      });
      if(quarter!==null){
        rows = rows.map(function(r){
          var w = {};
          Object.keys(r.weeks).forEach(function(wk){ if(qOf(Number(wk))===quarter) w[wk]=r.weeks[wk]; });
          var total = aggregate(w, modeOf(r.metric));
          return total===null ? null : { campus:r.campus, dept:r.dept, ministry:r.ministry, metric:r.metric, weeks:w, total:total };
        }).filter(Boolean);
      }
      var groupName = el.getAttribute('data-drill-label');
      var title = gpDrillT(metric) +
        (groupName ? ' · '+gpDrillT(groupName) : (dept ? ' · '+gpDrillT(ministry||dept) : '')) +
        (quarter!==null ? ' · Q'+(quarter+1) : '');
      gpOpenDrill(title, rows);
    };
  });
}

/* ==================== shared UI atoms ====================
   Small pieces both pages need, kept here for the same reason the roll-up maths is
   here: one definition, one behaviour, no drift. The CSS they rely on lives in the
   theme block (also shared), so a ring looks the same wherever it appears. */

/* ---- progress rings ----
   A percentage as a filled ring. conic-gradient, so it is one element with no SVG
   and no library. The colour walks warm -> amber -> cobalt -> green as the number
   climbs, and gpPctWord says the same thing in words for anyone who cannot pick
   those colours apart. Both return tokens rather than hex, which is what makes
   them follow the theme. */
function gpPctColor(p){
  if(p>=100) return 'var(--good)';
  if(p>=75)  return 'var(--accent)';
  if(p>=25)  return 'var(--amberDeep)';
  if(p>0)    return 'var(--warm)';
  return 'var(--faint)';
}
function gpPctWord(p){
  var T = (typeof t === 'function') ? t : function(s){ return s; };
  if(p>=100) return T('Done');
  if(p>=75)  return T('Almost there');
  if(p>=50)  return T('Halfway');
  if(p>=25)  return T('Under way');
  if(p>0)    return T('Just started');
  return T('Not started');
}
/* One string drives both the ring's sweep and a slider track's fill. */
function gpRingVars(p){ return '--p:'+p+';--p1:'+p+'%;--gc:'+gpPctColor(p)+';'; }
function gpRingHtml(p, size, label){
  var cls = 'gRing' + (size ? ' ' + size : '');
  return '<div class="'+cls+'" style="'+gpRingVars(p)+'" role="img" aria-label="'+
    (label ? gpDrillEsc(label)+': ' : '')+p+'%"><span>'+p+'</span></div>';
}

/* ---- a tap you can feel ----
   Android and desktop Chrome buzz; iOS Safari ignores vibrate() entirely, so this
   is a bonus on the platforms that allow it and silently nothing on the ones that
   do not. Never rely on it to convey anything. */
function gpTap(ms){
  try {
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(navigator.vibrate) navigator.vibrate(ms || 8);
  } catch(e){}
}

/* ---- numbers that count up ----
   This is the dashboard's own animateCounts(), moved here so the staff page gets it
   too — it was already written and working on one page only. Reads data-count for
   the target and data-prefix / data-suffix / data-dec for how to print it, so the
   markup carries the truth and an interrupted animation still ends up correct.
   Skipped entirely when the reader has asked for less motion: a number sliding up
   is decoration, and the final value is the information. */
function gpAnimateCounts(root){
  var scope = root || document;
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  scope.querySelectorAll('[data-count]').forEach(function(el){
    var target = Number(el.getAttribute('data-count'));
    if(isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = el.getAttribute('data-dec') === '1';
    var show = function(v){
      el.textContent = prefix + (dec ? v.toFixed(1) : Math.round(v).toLocaleString()) + suffix;
    };
    if(reduce){ show(target); return; }
    var start = performance.now(), dur = 700;
    function tick(now){
      var p = Math.min(1, (now - start) / dur);
      show(target * (1 - Math.pow(1 - p, 3)));
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ---- a week worth sharing ----
   Draws "WEEK n · x%" as a square card on a canvas and hands it to the OS share
   sheet. Canvas rather than an <img> so there is nothing to host and nothing to
   fetch, and the figures are whatever the caller passes in.

   Sharing a FILE is not universally supported: iOS Safari 15+ and Android Chrome
   take it, older browsers reject it, and some accept navigator.share for text but
   not for files — which is why canShare({files}) is checked rather than assumed.
   The fallback opens the PNG in a new tab so it can be long-pressed and saved,
   because a download attribute is ignored on iOS. Returns what actually happened
   so the caller can say so. */
function gpShareCardDraw(o){
  var S = 1080, c = document.createElement('canvas');
  c.width = S; c.height = S;
  var g = c.getContext('2d');
  if(!g) return null;

  g.fillStyle = '#17150F'; g.fillRect(0, 0, S, S);   // the brand black, not the theme
  // a cobalt glow behind the figure, so the card is not a flat rectangle
  var glow = g.createRadialGradient(S/2, S*0.46, 40, S/2, S*0.46, S*0.52);
  glow.addColorStop(0, 'rgba(31,68,255,0.42)');
  glow.addColorStop(1, 'rgba(31,68,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, S, S);

  var pct = Math.max(0, Math.min(100, Math.round(Number(o && o.pct) || 0)));
  // the ring, drawn the same way the DOM one reads: track, then sweep
  var cx = S/2, cy = S*0.46, r = 250, w = 34;
  g.lineWidth = w; g.lineCap = 'round';
  g.strokeStyle = 'rgba(250,246,240,0.16)';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.stroke();
  if(pct > 0){
    g.strokeStyle = pct >= 100 ? '#3FBF74' : pct >= 75 ? '#6C86FF' : pct >= 25 ? '#FFB323' : '#FF9E6B';
    g.beginPath();
    g.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*(pct/100));
    g.stroke();
  }

  g.textAlign = 'center'; g.fillStyle = '#FAF6F0';
  g.font = '700 190px system-ui, sans-serif';
  g.fillText(pct + '%', cx, cy + 66);
  g.font = '600 46px system-ui, sans-serif';
  g.fillStyle = '#FFB323';
  g.fillText(String(o && o.label || '').toUpperCase(), cx, cy - r + 4);
  if(o && o.sub){
    g.font = '400 40px system-ui, sans-serif';
    g.fillStyle = 'rgba(250,246,240,0.72)';
    g.fillText(String(o.sub), cx, cy + r + 92);
  }
  g.font = '600 34px system-ui, sans-serif';
  g.fillStyle = 'rgba(250,246,240,0.5)';
  g.fillText('YWAM GonPreah · GP Impact', cx, S - 66);
  return c;
}

function gpShareCard(o){
  var c = gpShareCardDraw(o);
  if(!c) return Promise.resolve('unsupported');
  return new Promise(function(resolve){
    if(!c.toBlob){ resolve('unsupported'); return; }
    c.toBlob(function(blob){
      if(!blob){ resolve('unsupported'); return; }
      var name = (o && o.file || 'gp-week') + '.png';
      var file = null;
      try { file = new File([blob], name, { type: 'image/png' }); } catch(e){}
      if(file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share){
        navigator.share({ files: [file], title: (o && o.label) || 'GP Impact' })
          .then(function(){ resolve('shared'); })
          .catch(function(){ resolve('cancelled'); });   // a dismissed sheet is not a failure
        return;
      }
      // No file sharing: open it so it can be saved by hand. A download attribute
      // does nothing on iOS, so do not pretend otherwise.
      var url = URL.createObjectURL(blob);
      var w = window.open(url, '_blank');
      setTimeout(function(){ URL.revokeObjectURL(url); }, 60000);
      resolve(w ? 'opened' : 'blocked');
    }, 'image/png');
  });
}

/* ---- sentences with numbers in them ----
   Khmer word order is not English word order, so a sentence built by gluing
   fragments around a number — 'wl.length + " of 7 days logged"' — cannot be
   translated at all: there is no string for a translator to be given. gpT() takes
   a whole sentence as the key, with {placeholders}, so the translator gets one
   line and can move the number wherever Khmer wants it.

     gpT('{n} of 7 days logged', {n: 4})

   Falls back to the English key exactly as t() does, so a missing translation
   still reads correctly with its numbers in place. */
function gpT(template, vars){
  var s = (typeof t === 'function') ? t(template) : template;
  return String(s).replace(/\{(\w+)\}/g, function (whole, name) {
    return (vars && Object.prototype.hasOwnProperty.call(vars, name)) ? String(vars[name]) : whole;
  });
}

/* ---- pull to refresh ----
   Both pages had their own copy of this, and the copies drifted twice: first the
   staff page's coin had no logo in it, and then — the part that was actually
   reported — its coin did not TURN as you pulled. The dashboard rotated the mark
   with the drag, so it felt attached to your finger; the staff page only slid it
   down and started spinning after release, which reads as broken.

   One implementation now, and the page supplies only what differs: what to
   refresh. onRefresh must return a promise, or the coin never stops.  */
function gpPullToRefresh(onRefresh, opts){
  var ptr = document.getElementById('ptr');
  if(!ptr || !('ontouchstart' in window)) return;
  opts = opts || {};

  var THRESHOLD = 68;    // pull needed to arm a refresh
  var MAX = 108;         // furthest the coin travels
  var RESIST = 0.55;     // <1 so the pull feels weighted
  var startY = null, pull = 0, armed = false, busy = false;

  function coin(){ return ptr.querySelector('img'); }
  function setPull(px){
    pull = px;
    ptr.style.transform = 'translateY('+(Math.min(px, MAX) - 60)+'px)';
    ptr.style.opacity = Math.min(1, px / THRESHOLD);
    // The mark turns with the drag — this is what makes it feel held rather than dragged.
    var c = coin();
    if(c) c.style.transform = 'rotate('+Math.round(px * 3)+'deg)';
  }
  function reset(){
    ptr.classList.remove('dragging');
    ptr.style.transform = ''; ptr.style.opacity = '';
    var c = coin();
    if(c) c.style.transform = '';
    startY = null; pull = 0; armed = false;
  }

  document.addEventListener('touchstart', function(e){
    if(busy || e.touches.length !== 1 || window.scrollY > 0) return;
    if(document.getElementById('ddOverlay')) return;     // the drill sheet is open
    // Don't hijack the gesture while someone is typing or picking something.
    var a = document.activeElement;
    if(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
    if(opts.blocked && opts.blocked()) return;
    startY = e.touches[0].clientY;
    ptr.classList.add('dragging');
  }, { passive:true });

  document.addEventListener('touchmove', function(e){
    if(startY === null || busy) return;
    var dy = e.touches[0].clientY - startY;
    if(dy <= 0 || window.scrollY > 0){ if(pull) reset(); return; }
    e.preventDefault();          // take over from the native rubber-band
    setPull(dy * RESIST);
    if(!armed && pull >= THRESHOLD){ armed = true; gpTap(12); }
    else if(armed && pull < THRESHOLD){ armed = false; }
  }, { passive:false });

  document.addEventListener('touchend', function(){
    if(startY === null || busy) return;
    if(pull < THRESHOLD){ reset(); return; }
    busy = true; startY = null;
    ptr.classList.remove('dragging');
    ptr.classList.add('spinning');
    ptr.style.transform = 'translateY(14px)';
    ptr.style.opacity = '1';
    // Hand the spin over to the CSS animation, which needs no inline rotation.
    var c = coin();
    if(c) c.style.transform = '';
    gpTap([8, 40, 12]);
    Promise.resolve(onRefresh()).then(done, done);
    function done(){
      ptr.classList.remove('spinning');
      busy = false; reset();
    }
  }, { passive:true });

  document.addEventListener('touchcancel', function(){ if(!busy) reset(); }, { passive:true });
}
