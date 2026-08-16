/*  The report to the Ministry of Education, Youth and Sport.

    This builds the document that used to be typed by hand — the same document,
    section for section, from the records entered on the Programs tab. It is
    modelled directly on the report already filed for the 1st semester of 2026, so
    the Ministry receives the format it has been receiving, with this period's
    numbers in it, rather than a new one it has to learn to read.

    WHERE THE NUMBERS COME FROM. The headline counts — how many volunteers, how
    many students — are the app's own weekly numbers, read from the KPI entries the
    ministries log and handed in as `actuals`. They are NOT typed on the Programs
    tab: the weekly numbers are the record of what happened, and this document is
    written from them. What the Programs tab holds is only what a weekly figure
    cannot say — which country a team came from, how many of a class were girls,
    what each location is called.

    So when `actuals` gives a figure it wins, and the typed detail supplies the
    breakdown underneath it. A programme with no KPI behind it (YAP) falls back to
    the typed rows, which is a stated exception rather than the rule.

    ANY PERIOD, FROM ONE SET OF RECORDS. Records are stamped with a quarter,
    because a quarter is the finest grain anybody reports on. A quarterly report is
    one quarter; the Ministry's own six-month filing is two of them added together;
    a year is four. Nothing is entered twice, and the six-month document still
    reads the way it always has. Doing it the other way round — storing semesters
    — would make quarters impossible: nothing in a six-month row says when the
    class actually ran.

    WHY A PURE FUNCTION. `gpBuildReport()` takes records and returns an HTML
    string. It touches no DOM, no globals of its own and no network, which is what
    lets a test assert the arithmetic of every section without a browser — and the
    arithmetic is the part that must not be wrong, because this document goes to a
    government ministry with our name on it.

    WHY IT IS ENGLISH, ALWAYS. The app translates itself; this does not. The filed
    report is in English, and the alternative would be putting machine-translated
    Khmer that no person has read into a government submission. If a Khmer version
    is wanted, it is a translation job for a person, not a toggle.

    HOW IT REACHES GOOGLE DOCS. There is no Google account behind this app and
    adding one would mean an OAuth flow for every leader. Instead the document is
    put on the clipboard as rich HTML: paste into a blank Google Doc and the
    headings, bullets and tables arrive intact, ready to edit. Downloading it as a
    .doc and dragging that into Drive works too, and so does printing to PDF. The
    generated document is a draft — the prose around the numbers is boilerplate
    from last time, and somebody should read it before it is sent.  */

/* ---- small helpers, kept local so this file stands alone ---- */
function gpRepEsc(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function gpRepNum(n){
  /* Thousands separators, because "1,820 children" is how the filed report reads
     and an unseparated 1820 in a government document looks like a typo. */
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
/* A percentage of a target, to two decimals only when it needs them — the filed
   report says both "48%" and "46.75%", and rounding 46.75 to 47 would be
   reporting a different number than the one we achieved. */
function gpRepPct(got, target){
  if(!target || target <= 0) return null;
  var p = (Number(got) || 0) / target * 100;
  var r = Math.round(p * 100) / 100;
  return (r === Math.round(r)) ? String(Math.round(r)) : String(r);
}
function gpRepDate(s){
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
  if(!m) return '';
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return MON[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1];
}
function gpRepRange(a, b){
  var f = gpRepDate(a), t = gpRepDate(b);
  if(f && t) return f + ' – ' + t;
  return f || t || '';
}
function gpRepOrdinal(n){
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
}
/* "1st Quarter 2026", "1st Semester 2026", or "2026" for the whole year. */
function gpRepPeriod(year, period){
  var P = gpPeriod(period);
  if(P.kind === 'year') return String(year);
  return gpRepOrdinal(P.n) + (P.kind === 'quarter' ? ' Quarter ' : ' Semester ') + year;
}
/* "in the 1st quarter" — the phrase that goes inside a sentence. */
function gpRepIn(period){
  var P = gpPeriod(period);
  if(P.kind === 'year') return 'during the year';
  return 'in the ' + gpRepOrdinal(P.n) + ' ' + P.kind;
}
/* "the 3-month period of the 1st Quarter 2026" */
function gpRepSpan(year, period){
  var P = gpPeriod(period);
  if(P.kind === 'year') return String(year);
  return 'the ' + (P.kind === 'quarter' ? '3' : '6') + '-month period of the ' + gpRepPeriod(year, period);
}

/* Rows for one period — that is, rows in any of the quarters the period covers.
   A semester is two quarters and a year is four, which is how one set of records
   answers a quarterly report and the Ministry's six-month one alike.

   Pass `toDate` for the year so far *as at the end of this period*, which is what
   an annual-target percentage is measured on. Not the same as the whole year:
   regenerating the Q1 report in October must still say what it said in April. */
function gpReportRows(records, kind, program, period, toDate){
  var qs = toDate ? gpPeriodToDate(period) : gpPeriod(period).quarters;
  return (records || []).filter(function(r){
    if(r.kind !== kind) return false;
    if(program !== null && program !== undefined && r.program !== program) return false;
    /* `estimate` rows are the year's target and belong to no quarter. */
    if(r.kind !== 'estimate' && qs.indexOf(Number(r.quarter) || 1) === -1) return false;
    return true;
  });
}

/* ---- section 2.1(a): one line per programme ----
   "Received 24 students in the 1st semester, totaling 24 participants,
    representing 48% of the annual target (Target: 50 participants for 2026)."
   The target is always the YEAR's, whichever half is being reported — that is
   what "annual target" means, and it is the number in the agreement. */
function gpReportHeadline(p, records, year, period, A){
  var periodRows = gpReportRows(records, p.kind, p.id, period);
  var yearRows = gpReportRows(records, p.kind, p.id, period, true);
  var got = gpReportPeople(p, periodRows, A && A.period);
  var yearGot = gpReportPeople(p, yearRows, A && A.toDate);
  var target = gpProgramGoal(p.id, records);
  /* Progress against an annual target is measured on the year, not on the half —
     otherwise every report after the first would restart at zero and read as a
     collapse. */
  var pct = gpRepPct(yearGot, target);
  var s = 'Received ' + gpRepNum(got) + ' ' + p.countedAs + ' ' + gpRepIn(period);
  /* In the first period of a year the part and the whole are the same number, and
     saying it twice reads like a mistake. It stops being the same the moment there
     is a second one, which is exactly when the reader needs both. */
  if(yearGot !== got) s += ', totaling ' + gpRepNum(yearGot) + ' ' + p.countedAs + ' for the year';
  if(pct === null) return s + '. No annual target has been recorded for ' + year + '.';
  return s + ', representing ' + pct + '% of the annual target (Target: ' +
    gpRepNum(target) + ' ' + p.countedAs + ' for ' + year + ').';
}

/* The headcount for a programme over some span: the app's own weekly figure when
   there is one, and the typed rows only when there is not. One place, so the
   summary line, the project body and the outputs table cannot disagree about
   which of the two they used. */
function gpReportPeople(p, rows, actual){
  if(actual && actual.hasSources && actual.people !== null && actual.people !== undefined) return actual.people;
  return gpProgramSummary(p.id, rows).people;
}

/* ---- section 3.x: the body of one project ---- */
function gpReportProject(p, records, year, period, A){
  var rows = gpReportRows(records, p.kind, p.id, period);
  var yearRows = gpReportRows(records, p.kind, p.id, period, true);
  var sum = gpProgramSummary(p.id, rows);
  var periodPeople = gpReportPeople(p, rows, A && A.period);
  var yearPeople = gpReportPeople(p, yearRows, A && A.toDate);
  var target = gpProgramGoal(p.id, records);
  var pct = gpRepPct(yearPeople, target);
  var h = '<h3>3.' + p.no + ' Project ' + p.no + ': ' + gpRepEsc(p.reportName) + '</h3>';
  h += '<p>' + gpRepEsc(p.desc) + '</p>';

  if(!rows.length){
    h += '<p>No activity was recorded for this project ' + gpRepIn(period) + '.</p>';
  } else if(p.kind === 'team'){
    /* "we hosted 2 volunteer teams with a total of 24 members (9 female and 15 male)" */
    var teams = (A && A.period && A.period.teams !== null && A.period.teams !== undefined)
      ? A.period.teams : sum.rows;
    h += '<p>' + (gpPeriod(period).kind === 'year' ? 'This year we' : 'In this ' + gpRepIn(period).replace(/^in the /, '') + ', we') +
      ' hosted ' + gpRepNum(teams) + ' volunteer team' + (Number(teams) === 1 ? '' : 's') +
      ' with a total of ' + gpRepNum(periodPeople) + ' members (' +
      gpRepNum(sum.female) + ' female and ' + gpRepNum(sum.male) + ' male):</p><ul>';
    rows.forEach(function(r){
      var when = gpRepRange(r.from, r.to);
      h += '<li><strong>' + gpRepEsc(r.name || 'Team') + '</strong>' +
        (r.country ? ' (' + gpRepEsc(r.country) + ')' : '') + ': ' +
        gpRepNum((Number(r.male) || 0) + (Number(r.female) || 0)) + ' members (' +
        gpRepNum(r.male) + ' male, ' + gpRepNum(r.female) + ' female)' +
        (when ? ' | ' + gpRepEsc(when) : '') + '</li>';
    });
    h += '</ul>';
    var acts = rows.map(function(r){ return String(r.activities || '').trim(); })
      .filter(Boolean);
    if(acts.length) h += '<p>These teams engaged in numerous activities, including ' +
      gpRepEsc(gpReportJoinActivities(acts)) + '.</p>';
    var served = (A && A.period && A.period.served !== null && A.period.served !== undefined)
      ? A.period.served : sum.served;
    if(served) h += '<p>Together, these teams served ' + gpRepNum(served) +
      ' children and youth (' + gpRepNum(rows.reduce(function(a, r){ return a + (Number(r.servedFemale) || 0); }, 0)) +
      ' female and ' + gpRepNum(rows.reduce(function(a, r){ return a + (Number(r.servedMale) || 0); }, 0)) +
      ' male).</p>';
  } else if(p.kind === 'class'){
    /* One lettered heading per location, the way "a. Poipet YDC" reads in the
       filed report. A location with no classes still gets its paragraph — the
       filed report says so explicitly for the football team, and a project that
       stopped is a fact the Ministry is being told, not one to leave out. */
    rows.forEach(function(r, i){
      h += '<p><strong>' + gpReportLetter(i) + '. ' + gpRepEsc(r.location || 'Location') + '</strong><br>' +
        'We had ' + gpRepNum(r.classes) + ' class' + (Number(r.classes) === 1 ? '' : 'es') +
        ', with ' + gpRepNum((Number(r.male) || 0) + (Number(r.female) || 0)) + ' students (' +
        gpRepNum(r.male) + ' males, ' + gpRepNum(r.female) + ' females).' +
        (r.activities ? '<br>' + gpRepEsc(r.activities) : '') + '</p>';
    });
  } else if(p.kind === 'cohort'){
    rows.forEach(function(r, i){
      var st = (Number(r.male) || 0) + (Number(r.female) || 0);
      h += '<p><strong>' + gpReportLetter(i) + '. ' + gpRepEsc(r.name || 'School') + '</strong><br>' +
        'We enrolled ' + gpRepNum(st) + ' students (' + gpRepNum(r.male) + ' male, ' +
        gpRepNum(r.female) + ' female; ' + gpRepNum(r.khmer) + ' Cambodian and ' +
        gpRepNum(r.intl) + ' international), with ' +
        gpRepNum((Number(r.staffMale) || 0) + (Number(r.staffFemale) || 0)) + ' staff (' +
        gpRepNum(r.staffMale) + ' male, ' + gpRepNum(r.staffFemale) + ' female).' +
        (r.outreach ? '<br>Outreach locations: ' + gpRepEsc(String(r.outreach).split('\n').join(', ')) : '') +
        (r.activities ? '<br>' + gpRepEsc(r.activities) : '') + '</p>';
    });
  } else {
    rows.forEach(function(r, i){
      var n = (Number(r.male) || 0) + (Number(r.female) || 0);
      h += '<p><strong>' + gpReportLetter(i) + '. ' + gpRepEsc(r.location || 'Location') + '</strong><br>' +
        'We have ' + gpRepNum(n) + ' full-time ' + p.id + ' students (' +
        gpRepNum(r.male) + ' males, ' + gpRepNum(r.female) + ' females).' +
        (r.sponsors ? '<br>Support for sponsor families: ' + gpRepEsc(r.sponsors) : '') +
        (r.activities ? '<br>' + gpRepEsc(r.activities) : '') + '</p>';
    });
  }

  h += '<p><strong>' + gpRepEsc(p.id) + ' Project Achievement Summary:</strong></p><ul>';
  h += '<li><strong>Planned Target:</strong> ' + (target === null
    ? 'No annual target has been recorded for ' + year + '.'
    : 'Plan to host ' + gpRepNum(target) + ' ' + p.countedAs + ' in ' + year + '.') + '</li>';
  h += '<li><strong>Actual Achievement:</strong> ' + gpReportAsOf(period) + ' ' +
    gpRepNum(yearPeople) + ' ' + p.countedAs +
    (pct === null ? '' : ', achieving ' + pct + '% of the annual plan') + '.</li>';
  h += '</ul>';
  return h;
}

function gpReportLetter(i){ return 'abcdefghijklmnopqrstuvwxyz'.charAt(i % 26); }

/* "By the end of June," — the filed report dates its achievement figures, which
   matters because the figure is a year-to-date one and the reader needs to know
   how much of the year it covers. */
function gpReportAsOf(period){
  return 'By the end of ' + gpPeriod(period).endsIn + ',';
}

/* Several teams each describe what they did. Joined into one sentence rather than
   repeated as a list, which is how the filed report reads. Duplicates are dropped
   — two teams that both "taught English" should not say it twice. */
function gpReportJoinActivities(list){
  var seen = {}, out = [];
  list.forEach(function(block){
    String(block).split(/[\n,;]+/).forEach(function(part){
      var s = part.trim().replace(/\.$/, '');
      if(!s) return;
      var k = s.toLowerCase();
      if(seen[k]) return;
      seen[k] = 1; out.push(s);
    });
  });
  if(out.length < 2) return out.join('');
  return out.slice(0, -1).join(', ') + ' and ' + out[out.length - 1];
}

/* ---- section 4: the outputs table ----
   One numbered Output per project, then one Activity row per record beneath it.
   The Budget column is present and empty on purpose: the filed report carries it
   with a note saying it is not needed yet, and dropping the column would mean
   rebuilding the table the first time it is. */
function gpReportTable(records, year, period, actuals){
  var h = '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%">' +
    '<thead><tr>' +
    ['No.','Output / Activity Name','Progress Description','% Achievement Target','Budget Spent (USD)']
      .map(function(c){ return '<th align="left">' + c + '</th>'; }).join('') +
    '</tr></thead><tbody>';

  gpProgramsInReportOrder().forEach(function(p){
    var rows = gpReportRows(records, p.kind, p.id, period);
    var yearRows = gpReportRows(records, p.kind, p.id, period, true);
    var A = gpReportActualsFor(actuals, p.id);
    var target = gpProgramGoal(p.id, records);
    var pct = gpRepPct(gpReportPeople(p, yearRows, A.toDate), target);
    var sum = gpProgramSummary(p.id, rows);

    h += '<tr><td>' + p.no + '</td><td><strong>Output ' + p.no + ': ' + gpRepEsc(p.reportName) + '</strong></td>' +
      '<td>' + gpRepEsc(gpReportOutputLine(p, sum, gpReportPeople(p, rows, A.period), A.period)) + '</td>' +
      '<td>' + (pct === null ? '—' : pct + '%') + '</td><td>$</td></tr>';

    rows.forEach(function(r, i){
      h += '<tr><td>' + p.no + '.' + (i + 1) + '</td>' +
        '<td>Activity ' + p.no + '.' + (i + 1) + ': ' + gpRepEsc(gpReportRowName(p, r)) + '</td>' +
        '<td>' + gpRepEsc(gpReportRowLine(p, r)) + '</td><td>—</td><td>—</td></tr>';
    });
    /* SVI reports the people served as its own activity row, the way the filed
       report splits "International Volunteers" from "Program Participants". */
    var served = (A.period && A.period.served !== null && A.period.served !== undefined)
      ? A.period.served : sum.served;
    if(p.kind === 'team' && served){
      h += '<tr><td>' + p.no + '.' + (rows.length + 1) + '</td>' +
        '<td>Activity ' + p.no + '.' + (rows.length + 1) + ': Program Participants</td>' +
        '<td>Teams worked with and served ' + gpRepNum(served) + ' children and youth.</td>' +
        '<td>—</td><td>—</td></tr>';
    }
  });
  return h + '</tbody></table>';
}

function gpReportOutputLine(p, sum, people, actual){
  var teams = (actual && actual.teams !== null && actual.teams !== undefined) ? actual.teams : sum.rows;
  if(p.kind === 'team') return 'Hosted ' + teams + ' international volunteer team' +
    (Number(teams) === 1 ? '' : 's') + ' totaling ' + people + ' members (' +
    sum.female + ' female, ' + sum.male + ' male).';
  if(p.kind === 'class') return sum.classes + ' classes across ' + sum.locations +
    ' location' + (sum.locations === 1 ? '' : 's') + ', with ' + people + ' students (' +
    sum.male + ' boys, ' + sum.female + ' girls).';
  if(p.kind === 'cohort') return people + ' students (' + sum.khmer + ' Cambodian and ' +
    sum.intl + ' international) across ' + sum.rows + ' course' + (sum.rows === 1 ? '' : 's') + '.';
  return people + ' students supported (' + sum.male + ' male, ' + sum.female + ' female) across ' +
    sum.locations + ' location' + (sum.locations === 1 ? '' : 's') + '.';
}

/* The two figures a section needs from the app's own numbers: the period being
   reported, and the year up to the end of it. Absent `actuals` — a caller that
   has no roll-up to hand, which is every test of the prose — both come back
   empty and the typed rows are used, so the generator still works standalone. */
function gpReportActualsFor(actuals, id){
  var A = actuals || {};
  return { period: (A.period || {})[id] || null, toDate: (A.toDate || {})[id] || null };
}
function gpReportRowName(p, r){
  if(p.kind === 'team') return r.name || 'International volunteers';
  if(p.kind === 'cohort') return r.name || 'Course';
  return r.location || 'Location';
}
function gpReportRowLine(p, r){
  var m = Number(r.male) || 0, f = Number(r.female) || 0;
  if(p.kind === 'team') return (m + f) + ' members (' + m + ' male, ' + f + ' female)' +
    (r.country ? ' from ' + r.country : '') + (gpRepRange(r.from, r.to) ? ', ' + gpRepRange(r.from, r.to) : '') + '.';
  if(p.kind === 'class') return (Number(r.classes) || 0) + ' classes and a total of ' +
    (m + f) + ' students (' + m + ' boys, ' + f + ' girls).';
  if(p.kind === 'cohort') return (m + f) + ' students (' + (Number(r.khmer) || 0) + ' Cambodian and ' +
    (Number(r.intl) || 0) + ' international).';
  return (m + f) + ' students hosted (' + m + ' male, ' + f + ' female).';
}

/* ---- the whole document ---- */
function gpBuildReport(o){
  o = o || {};
  var records = o.records || [];
  var year = Number(o.year) || new Date().getFullYear();
  var period = gpPeriod(o.period).id;
  /* { period: {SVI:{...}}, toDate: {SVI:{...}} } — what the ministries logged for
     the period being reported, and for the year up to the end of it. Built by the
     page from the roll-up; see gpProgramActuals() in programs.js. */
  var actuals = o.actuals || null;
  var T = GP_REPORT_TEXT;
  var order = gpProgramsInReportOrder();

  var h = '<h1>' + gpRepEsc(T.province) + '</h1>';
  h += '<p><em>Activity report — ' + gpRepEsc(gpRepPeriod(year, period)) + '</em></p>';

  h += '<h2>1. Introduction</h2>';
  h += '<p>' + gpRepEsc(T.intro) + '</p>';
  h += '<p><strong>Mission:</strong> ' + gpRepEsc(T.mission) + '</p>';
  h += '<p>' + gpRepEsc(T.agreementsLine) + '</p><ol>';
  order.forEach(function(p){ h += '<li>' + gpRepEsc(p.reportName) + '</li>'; });
  h += '</ol>';

  h += '<h2>2. Project Implementation Progress</h2>';
  h += '<h3>2.1 Summary of Project Achievements</h3>';
  h += '<p><strong>a) Overall Achievements:</strong></p>';
  h += '<p>During ' + gpRepEsc(gpRepSpan(year, period)) +
    ', the projects achieved the following results:</p><ul>';
  order.forEach(function(p){
    h += '<li><strong>' + gpRepEsc(p.name) + ' (' + gpRepEsc(p.id) + '):</strong> ' +
      gpRepEsc(gpReportHeadline(p, records, year, period, gpReportActualsFor(actuals, p.id))) + '</li>';
  });
  h += '</ul>';

  /* Challenges and solutions are paired by position: the first solution answers
     the first challenge, the way the filed report numbers them. A challenge with
     no solution written yet still appears — leaving it out would hide it. */
  var issues = gpReportRows(records, 'issue', null, period);
  h += '<p><strong>b) Challenges:</strong></p>';
  if(!issues.length) h += '<p>No challenges were recorded for this period.</p>';
  else {
    h += '<ol>';
    issues.forEach(function(r){ h += '<li>' + gpRepEsc(r.challenge || '') + '</li>'; });
    h += '</ol>';
  }
  h += '<p><strong>c) Solutions:</strong></p>';
  if(!issues.length) h += '<p>—</p>';
  else {
    h += '<ol>';
    issues.forEach(function(r){ h += '<li>' + gpRepEsc(r.solution || '—') + '</li>'; });
    h += '</ol>';
  }

  h += '<h2>3. Implementation Activities of Projects / Programs</h2>';
  order.forEach(function(p){ h += gpReportProject(p, records, year, period, gpReportActualsFor(actuals, p.id)); });

  h += '<h2>4. Progress of ' + (gpPeriod(period).kind === 'year' ? 'Annual' :
    gpPeriod(period).kind === 'quarter' ? 'Quarterly' : 'Semester') +
    ' Activities Implementation (Outputs Table)</h2>';
  h += '<p><em>* ' + gpRepEsc(T.budgetNote) + '</em></p>';
  h += gpReportTable(records, year, period, actuals);

  h += '<h2>5. Conclusion</h2>';
  h += '<p>' + gpRepEsc(T.conclusionOpen) + '</p>';
  order.forEach(function(p){ h += '<p>' + gpRepEsc(p.conclusion) + '</p>'; });

  return h;
}

/* The same document as a standalone file, for the .doc download and for print.
   Word and Google Docs both read this; the meta tag is what makes Word treat the
   file as a document rather than a web page. */
function gpReportDocument(bodyHtml, title){
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>' + gpRepEsc(title || 'Activity Report') + '</title><style>' +
    'body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.5;color:#000;max-width:7in;margin:0 auto;padding:0.5in}' +
    'h1{font-size:16pt}h2{font-size:13pt;margin-top:22px}h3{font-size:11.5pt;margin-top:18px}' +
    'table{font-size:10pt}th{background:#eee}td,th{vertical-align:top}' +
    '</style></head><body>' + bodyHtml + '</body></html>';
}
