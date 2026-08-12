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
    surveyRows:surveyRows, pct:pct, avg:avg, healthScore:healthScore
  };
}
