/* The report to the Ministry of Education, Youth and Sport.

   THE FIXTURE IS THE REAL REPORT. The records below are the ones behind the
   activity report actually filed for the 1st semester of 2026, and the assertions
   are that document's own sentences. If the generator drifts, it drifts away from
   a report a government ministry has already accepted — which is the only
   standard worth holding it to.

   The arithmetic is the part that must not be wrong. 24 volunteers against a
   target of 50 is 48%; 187 students against 400 is 46.75% and NOT 47%, because
   rounding it would be reporting a figure we did not achieve.

   gpBuildReport() is pure — records in, HTML out — so all of this runs in node
   with no browser and no network. */
import { PUBLIC } from './env.mjs';
import fs from 'node:fs';
import path from 'node:path';

const box = {};
new Function('g',
  fs.readFileSync(path.join(PUBLIC, 'programs.js'), 'utf8') +
  fs.readFileSync(path.join(PUBLIC, 'report.js'), 'utf8') +
  '\ng.build=gpBuildReport; g.doc=gpReportDocument; g.pct=gpRepPct; g.programs=GP_PROGRAMS;' +
  '\ng.periods=GP_PERIODS; g.period=gpPeriod; g.periodQuarter=gpPeriodQuarter;' +
  '\ng.toDate=gpPeriodToDate;'
)(box);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? '  → ' + extra : '')); }
}
/* Assertions read the visible text, not the markup — a heading that changes from
   <h3> to <h4> is not a regression, a number that changes is. */
const textOf = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const GOALS = [
  { kind: 'goal', program: 'SVI', year: 2026, target: 50, unit: 'volunteers' },
  { kind: 'goal', program: 'YLT', year: 2026, target: 35, unit: 'students' },
  { kind: 'goal', program: 'YDC', year: 2026, target: 400, unit: 'students' },
  { kind: 'goal', program: 'YAP', year: 2026, target: 25, unit: 'participants' },
];
/* The 1st semester of 2026, as two quarters — which is how it would be entered
   now. The teams arrived in January/February (Q1) and May (Q2); the classes ran
   across the half, so they are recorded per quarter. */
const S1 = [
  ...GOALS,
  { kind: 'team', program: 'SVI', year: 2026, quarter: 1, name: 'YWAM Maui', country: 'USA',
    from: '2026-01-27', to: '2026-02-21', male: 6, female: 6, servedMale: 454, servedFemale: 456,
    activities: 'learning Khmer language and culture, supporting English, arts, and sports education in remote villages' },
  { kind: 'team', program: 'SVI', year: 2026, quarter: 2, name: 'YWAM Cascades', country: 'USA',
    from: '2026-05-20', to: '2026-05-23', male: 9, female: 3, servedMale: 454, servedFemale: 456,
    activities: 'volunteering at local rehabilitation centers and prisons, aiding war refugees by distributing essential supplies and food' },
  { kind: 'class', program: 'YDC', year: 2026, quarter: 1, location: 'Poipet YDC', classes: 4, male: 27, female: 68 },
  { kind: 'class', program: 'YDC', year: 2026, quarter: 2, location: 'Poipet GP Community School', classes: 2, male: 44, female: 48 },
  { kind: 'class', program: 'YDC', year: 2026, quarter: 2, location: 'YDC Football', classes: 0, male: 0, female: 0,
    activities: 'We did not have any activities because of the conflict.' },
  { kind: 'group', program: 'YAP', year: 2026, quarter: 1, location: 'Saang District dormitory', male: 4, female: 8 },
  { kind: 'issue', program: '', year: 2026, quarter: 1,
    challenge: 'Unusual decrease in volunteer numbers due to the conflict between Thailand and Cambodia.',
    solution: 'Requests were sent to organizations around the world that had previously sent volunteers.' },
  { kind: 'issue', program: '', year: 2026, quarter: 2,
    challenge: 'Evacuation from Poipet: our team was evacuated to Siem Reap for 2 months.',
    solution: 'When we returned to Poipet, we worked with displaced people at Chan Si Temple.' },
];

/* The semester report — the document the Ministry actually receives — built from
   the two quarters above. Every assertion below is that filed report's own text. */
const html = box.build({ records: S1, year: 2026, period: 's1' });
const T = textOf(html);

/* ---------- 1. the headline figures, exactly as filed ---------- */
ok('SVI: 24 volunteers is 48% of a target of 50',
  /Received 24 participants in the 1st semester, representing 48% of the annual target \(Target: 50 participants for 2026\)/.test(T),
  (T.match(/Student Volunteer Internship \(SVI\):[^●]{0,160}/) || [''])[0]);
ok('YDC: 187 students is 46.75% of 400 — not 47%',
  /Received 187 students in the 1st semester, representing 46\.75% of the annual target/.test(T) && !/\b47% of the annual/.test(T),
  (T.match(/Youth Development Center \(YDC\):[^●]{0,140}/) || [''])[0]);
ok('YAP: 12 of 25 is 48%', /Received 12 students in the 1st semester, representing 48%/.test(T));
ok('YLT: a project that did not run reports 0, not nothing',
  /Received 0 students in the 1st semester, representing 0% of the annual target \(Target: 35 students for 2026\)/.test(T));

/* ---------- 2. the projects are numbered as the agreement numbers them ---------- */
ok('the four projects appear in agreement order, not app order',
  T.indexOf('3.1 Project 1: Student Volunteer Internship Project (SVI)') <
  T.indexOf('3.2 Project 2: Youth Leadership Training Project (YLT)') &&
  T.indexOf('3.2 Project 2: Youth Leadership Training Project (YLT)') <
  T.indexOf('3.3 Project 3: Youth Development Center Project (YDC)') &&
  T.indexOf('3.3 Project 3: Youth Development Center Project (YDC)') <
  T.indexOf('3.4 Project 4: Youth Assistance Project (YAP)'));

/* ---------- 3. SVI: teams, their split, and the people they served ---------- */
ok('the team total and its sex split match the filed report',
  /we hosted 2 volunteer teams with a total of 24 members \(9 female and 15 male\)/.test(T),
  (T.match(/we hosted[^:]{0,90}/) || [''])[0]);
ok('each team keeps its country and its dates',
  /YWAM Maui \(USA\): 12 members \(6 male, 6 female\) \| Jan 27, 2026 – Feb 21, 2026/.test(T) &&
  /YWAM Cascades \(USA\): 12 members \(9 male, 3 female\) \| May 20, 2026 – May 23, 2026/.test(T));
ok('the people served are counted separately from the team itself',
  /Together, these teams served 1,820 children and youth \(912 female and 908 male\)/.test(T),
  (T.match(/Together[^.]{0,80}/) || [''])[0]);
ok('a thousands separator, so 1820 does not read as a typo', /1,820/.test(T));
ok('what the teams did is folded into one sentence, without repeats',
  /learning Khmer language and culture/.test(T) && /aiding war refugees/.test(T) &&
  (T.match(/rehabilitation centers/g) || []).length === 1);

/* ---------- 4. YDC: a location per letter, including one that stopped ---------- */
ok('each location gets its own lettered paragraph',
  /a\. Poipet YDC We had 4 classes, with 95 students \(27 males, 68 females\)/.test(T) &&
  /b\. Poipet GP Community School We had 2 classes, with 92 students \(44 males, 48 females\)/.test(T));
ok('a location that ran nothing is still reported, with its reason',
  /c\. YDC Football/.test(T) && /did not have any activities because of the conflict/.test(T));

/* ---------- 5. the outputs table ---------- */
ok('the table has the five columns the Ministry asks for',
  /No\. Output \/ Activity Name Progress Description % Achievement Target Budget Spent \(USD\)/.test(T));
ok('every project has an Output row',
  [1, 2, 3, 4].every(n => T.indexOf('Output ' + n + ':') > -1));
ok('each record becomes a numbered Activity row under its output',
  /Activity 1\.1: YWAM Maui/.test(T) && /Activity 3\.2: Poipet GP Community School/.test(T) &&
  /Activity 4\.1: Saang District dormitory/.test(T));
ok('the people SVI served are their own activity row, as filed',
  /Activity 1\.3: Program Participants/.test(T));
ok('the budget column is present and empty rather than absent',
  /Budget Spent \(USD\)/.test(T) && /do not need to do this budget yet/.test(T));

/* ---------- 6. challenges and solutions pair up by number ---------- */
const chIdx = T.indexOf('b) Challenges:'), soIdx = T.indexOf('c) Solutions:');
ok('challenges come before solutions and both are present', chIdx > -1 && soIdx > chIdx);
ok('every challenge written is in the document',
  /Unusual decrease in volunteer numbers/.test(T) && /Evacuation from Poipet/.test(T));
ok('and so is every solution',
  /Requests were sent to organizations/.test(T) && /Chan Si Temple/.test(T));

/* A challenge with no solution yet must still appear — dropping it would hide the
   thing the section exists to surface. */
{
  const one = box.build({ records: [...GOALS, { kind: 'issue', program: '', year: 2026, quarter: 1,
    challenge: 'Fewer teachers than last year', solution: '' }], year: 2026, period: 'q1' });
  ok('a challenge with no solution written is still reported', /Fewer teachers than last year/.test(textOf(one)));
}

/* ---------- 7. a later period counts the year, not just itself ----------
   This is the one that would embarrass us. An annual target measured against one
   period's figure makes every report after the first read as a collapse: 13 more
   students in the autumn would show as 52% of the year on their own, when the
   year has actually reached its target. */
{
  const S2 = [...S1,
    { kind: 'group', program: 'YAP', year: 2026, quarter: 3, location: 'Saang District dormitory', male: 5, female: 8 }];
  const t2 = textOf(box.build({ records: S2, year: 2026, period: 's2' }));
  ok('the second semester reports its own half',
    /Received 13 students in the 2nd semester/.test(t2), (t2.match(/YAP\):[^●]{0,150}/) || [''])[0]);
  ok('and the year to date against the annual target',
    /totaling 25 students for the year, representing 100% of the annual target/.test(t2),
    (t2.match(/YAP\):[^●]{0,180}/) || [''])[0]);
  ok('the achievement line is dated to the end of the period',
    /By the end of December, 25 students/.test(t2));
  ok('and section 3 shows only the half being reported',
    !/YWAM Maui/.test(t2), 'first-half teams leaked into the second-half report');
}

/* ---------- 7b. quarters and semesters, from the same records ----------
   The whole reason records are stamped with a quarter. Uriah works in quarters;
   the Ministry's filing is six months. Neither is retyped. */
{
  const q1 = textOf(box.build({ records: S1, year: 2026, period: 'q1' }));
  const q2 = textOf(box.build({ records: S1, year: 2026, period: 'q2' }));

  ok('a quarterly report names itself a quarter',
    /Activity report — 1st Quarter 2026/.test(q1) && !/Semester/.test(q1.slice(0, 200)));
  ok('and says it covers three months, not six',
    /During the 3-month period of the 1st Quarter 2026/.test(q1),
    (q1.match(/During[^,]{0,60}/) || [''])[0]);
  ok('its outputs table is headed quarterly',
    /4\. Progress of Quarterly Activities Implementation/.test(q1));

  ok('Q1 shows only the team that came in Q1',
    /YWAM Maui/.test(q1) && !/YWAM Cascades/.test(q1));
  ok('Q2 shows only the team that came in Q2',
    /YWAM Cascades/.test(q2) && !/YWAM Maui/.test(q2));

  /* The load-bearing one: the six-month document is the two quarters added up,
     and reads exactly like the report that was filed. */
  ok('the semester report is its two quarters added together',
    /we hosted 2 volunteer teams with a total of 24 members/.test(T) &&
    /we hosted 1 volunteer team with a total of 12 members/.test(q1) &&
    /we hosted 1 volunteer team with a total of 12 members/.test(q2));
  ok('and still calls itself a semester covering six months',
    /Activity report — 1st Semester 2026/.test(T) &&
    /During the 6-month period of the 1st Semester 2026/.test(T) &&
    /4\. Progress of Semester Activities Implementation/.test(T));

  /* Year-to-date is the year in every one of them, so a Q1 report and a Q2 report
     do not each claim 24% while the half claims 48%. */
  ok('every period measures the annual target on the whole year',
    /representing 48% of the annual target/.test(q1) &&
    /representing 48% of the annual target/.test(q2) &&
    /representing 48% of the annual target/.test(T));
  ok('but each reports its own three months',
    /Received 12 participants in the 1st quarter/.test(q1) &&
    /Received 12 participants in the 2nd quarter/.test(q2));
  ok('a quarter dates its achievement to that quarter\'s end',
    /By the end of March,/.test(q1) && /By the end of June,/.test(q2));

  /* Challenges are written per quarter and gathered by the semester report. */
  ok('a quarter shows the challenges written in it',
    /Unusual decrease in volunteer numbers/.test(q1) && !/Evacuation from Poipet/.test(q1));
  ok('and the semester gathers both quarters\' challenges',
    /Unusual decrease in volunteer numbers/.test(T) && /Evacuation from Poipet/.test(T));
}

/* ---------- 7b-2. a report says what it said ----------
   "Year to date" means the year up to the END OF THE PERIOD BEING REPORTED, not
   whatever is in the data now. Regenerating the Q1 report in October must still
   print the numbers it printed in April — a report that quietly restates itself
   every time you open it cannot be reconciled against the copy that was filed. */
{
  const q1 = textOf(box.build({ records: S1, year: 2026, period: 'q1' }));
  ok('a Q1 report does not count the team that came in Q2',
    /Received 12 participants in the 1st quarter/.test(q1) && !/totaling 24/.test(q1),
    (q1.match(/Received 12 participants[^.]{0,90}/) || [''])[0]);
  ok('so its percentage is Q1 against the annual target, not the whole year',
    /representing 24% of the annual target/.test(q1),
    (q1.match(/representing[^.]{0,40}/) || [''])[0]);
  ok('its achievement line counts only up to the end of that quarter',
    /By the end of March, 12 participants/.test(q1),
    (q1.match(/By the end of[^.]{0,50}/) || [''])[0]);

  /* Q2's report DOES include Q1, because by then it had happened. */
  const q2 = textOf(box.build({ records: S1, year: 2026, period: 'q2' }));
  ok('a Q2 report carries Q1 forward into the year to date',
    /Received 12 participants in the 2nd quarter, totaling 24 participants for the year/.test(q2),
    (q2.match(/Received 12 participants in the 2nd[^.]{0,90}/) || [''])[0]);
  ok('and reaches the same 48% the semester report shows',
    /representing 48% of the annual target/.test(q2));

  /* A record entered late, against a quarter already reported, does change that
     quarter's report — that is a correction, and it is the behaviour you want. */
  const late = textOf(box.build({
    records: [...S1, { kind: 'group', program: 'YAP', year: 2026, quarter: 1,
      location: 'Second dormitory', male: 2, female: 1 }], year: 2026, period: 'q1' }));
  ok('a record added late against Q1 does show up in the Q1 report',
    /Received 15 students in the 1st quarter/.test(late),
    (late.match(/YAP\):[^●]{0,90}/) || [''])[0]);
}

/* ---------- 7c. the period table itself ---------- */
{
  ok('four quarters, two semesters and a year are offered', box.periods.length === 7,
    box.periods.map(x => x.id).join(','));
  ok('the semesters are exactly the quarters they contain',
    box.period('s1').quarters.join(',') === '1,2' && box.period('s2').quarters.join(',') === '3,4');
  ok('the year is all four', box.period('year').quarters.join(',') === '1,2,3,4');
  ok('only a single quarter can take a new record — anything wider would be a guess',
    box.periodQuarter('q3') === 3 && box.periodQuarter('s1') === null && box.periodQuarter('year') === null);
  ok('an unknown period falls back to the whole year rather than showing nothing',
    box.period('nonsense').id === 'year');
  ok('year-to-date runs from January to the end of the period, whatever the period',
    box.toDate('q1').join(',') === '1' && box.toDate('q3').join(',') === '1,2,3' &&
    box.toDate('s1').join(',') === '1,2' && box.toDate('s2').join(',') === '1,2,3,4',
    box.toDate('q3').join(','));
}

/* ---------- 8. a whole-year report ---------- */
{
  const ty = textOf(box.build({ records: S1, year: 2026, period: 'year' }));
  ok('a whole-year report says the year, not a semester or a quarter',
    /Activity report — 2026/.test(ty) && !/1st Semester/.test(ty) && !/1st Quarter/.test(ty));
  ok('and still carries every record', /YWAM Maui/.test(ty) && /Poipet GP Community School/.test(ty));
}

/* ---------- 9. no goal set is different from a goal of zero ---------- */
{
  const none = textOf(box.build({ records: S1.filter(r => r.kind !== 'goal'), year: 2026, period: 's1' }));
  ok('with no target recorded the report says so rather than printing 0%',
    /No annual target has been recorded for 2026/.test(none) && !/representing 0% of the annual target/.test(none));
}
ok('a target of zero yields no percentage rather than a division by zero',
  box.pct(5, 0) === null && box.pct(5, null) === null);

/* ---------- 10. an empty period produces a document, not a crash ---------- */
{
  const empty = box.build({ records: [], year: 2027, period: 'q1' });
  ok('an empty period still produces all five sections',
    ['1. Introduction', '2. Project Implementation Progress',
     '3. Implementation Activities', '4. Progress of Quarterly Activities',
     '5. Conclusion'].every(s => textOf(empty).indexOf(s) > -1));
  ok('and says nothing was recorded rather than inventing zeroes as achievements',
    /No challenges were recorded for this period/.test(textOf(empty)));
}

/* ---------- 11. text from a record cannot break out into markup ----------
   Every field here is typed by a person and lands in a document that gets sent
   on. A team called "<script>" must arrive as those characters. */
{
  const evil = box.build({ records: [
    { kind: 'goal', program: 'SVI', year: 2026, target: 10 },
    { kind: 'team', program: 'SVI', year: 2026, quarter: 1, name: '<script>alert(1)</script>',
      country: 'A & B', from: '', to: '', male: 1, female: 1, activities: '<b>bold</b>' }], year: 2026, period: 'q1' });
  ok('a name containing markup is escaped, not embedded',
    evil.indexOf('<script>alert(1)</script>') === -1 && evil.indexOf('&lt;script&gt;') > -1);
  /* Escaped once, not twice: the document must carry `A &amp; B`, which a reader
     sees as "A & B". Double-escaping would put a literal "&amp;" on the page. */
  ok('an ampersand in a country name survives as one ampersand',
    evil.indexOf('A &amp; B') > -1 && evil.indexOf('&amp;amp;') === -1);
  ok('markup typed into the activities box does not become markup',
    evil.indexOf('<b>bold</b>') === -1 && evil.indexOf('&lt;b&gt;bold') > -1);
}

/* ---------- 12. the downloadable document ---------- */
{
  const d = box.doc('<h1>x</h1>', 'Activity Report 2026');
  ok('the download is a complete HTML document Word and Docs can open',
    /^<!DOCTYPE html>/.test(d) && /<meta charset="utf-8">/.test(d) && /<\/html>$/.test(d.trim()));
  ok('it carries its own styling, so it does not arrive as unformatted text',
    /font-family/.test(d) && /<h1>x<\/h1>/.test(d));
  ok('the title is escaped too', box.doc('', '<x>').indexOf('<title>&lt;x&gt;</title>') > -1);
}

/* ---------- 13. every programme in programs.js can be reported on ----------
   A fifth agreement added without report prose would silently produce a section
   headed "undefined". */
box.programs.forEach(p => {
  ok('"' + p.id + '" has everything the report needs',
    !!(p.no && p.reportName && p.desc && p.conclusion && p.countedAs),
    [p.no, p.reportName, p.countedAs].join(' | '));
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
