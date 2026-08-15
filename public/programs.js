/*  The four project agreements with the Ministry of Education, Youth and Sport,
    and the shape of the records each one reports on.

    WHY THIS IS SEPARATE FROM THE WEEKLY KPIs. The dashboard's KPIs answer "how is
    this ministry doing this week" — one number, every week, per metric. The
    Ministry report answers something different: who came, from where, when, how
    many of them were men and how many women. A team of 12 from YWAM Maui that
    visited in February is one fact, not a weekly figure, and forcing it through
    the KPI system would mean re-typing it every week and still not capturing the
    country or the dates. So programme records live beside the KPIs, not inside
    them, and nothing here changes what anyone logs each week.

    Each record carries a `kind` that says which shape it is. One list, one read,
    one write — the alternative was five blobs that can disagree about a year.

    Shared by the dashboard (data entry + the report) and the API (validation), so
    a field added here is a field the server will accept.  */

/* Two descriptions per programme on purpose. `blurb` is for the person typing the
   figures in — it says what to put in this box, in the words the base uses.
   `desc` is the paragraph the Ministry reads, lifted from the report already
   filed so the generated one reads like its predecessor rather than like an app.

   Where the two disagree, both are right for their reader: the filed report
   describes YAP as housing, food and scholarships for underprivileged students,
   while Uriah describes it as the pathway into staff. The first is what the
   Ministry has seen; the second is what the person entering the numbers means by
   it. Change `desc` only when the agreement's own wording changes.

   `no` is the project's number in the agreement — the report numbers them
   1 SVI, 2 YLT, 3 YDC, 4 YAP, which is not the order the app shows them in.  */
var GP_PROGRAMS = [
  { id: 'SVI', no: 1, name: 'Student Volunteer Internship',
    reportName: 'Student Volunteer Internship Project (SVI)',
    unit: 'volunteers', countedAs: 'participants',
    kind: 'team',
    /* Which of the app's own ministries feed this programme, so the report can
       cross-check a hand-entered total against what was logged weekly. */
    ministries: ['Outreach Teams'],
    blurb: 'Outreach teams from other YWAM bases, churches and organisations — international teams and short-term volunteers.',
    desc: 'This project facilitates university students and other youth from around the world to conduct short-term volunteer work in Cambodia in partnership with existing local and international organizations, providing additional human resources for various organizational activities. Program locations include Phnom Penh Capital and various provinces. The project also promotes cross-cultural learning and connections for Cambodian people, which is vital in a globalized world.',
    conclusion: 'Through the Student Volunteer Internship (SVI) project, individuals will learn Khmer culture and language. These individuals help educate and develop the Cambodian nation, giving young people the experience they need to grow and become good citizens of Cambodia and the world.' },

  { id: 'YDC', no: 3, name: 'Youth Development Center',
    reportName: 'Youth Development Center Project (YDC)',
    unit: 'students', countedAs: 'students',
    kind: 'class',
    ministries: ['YDC', 'GP Education', 'Ponlork School', 'LTN', 'Sry Noi', 'Sports'],
    blurb: 'Educational and youth programmes: kids programmes, youth programmes, sports and preschool.',
    desc: 'The Youth Development Center serves as a platform for young people to gather and self-develop through formal and positive non-formal activities. Its goal is to foster personal character and skill development for youth in Cambodia. English classes are taught 5 days a week by foreign teachers and Khmer interns. Intercultural interaction strengthens students’ cross-cultural skills and builds confidence in communicating with foreigners in a globalized world. We provide English, music, computer, arts, and other classes tailored to teacher capabilities and student needs.',
    conclusion: 'Through the Youth Development Center (YDC) project, we will help provide general non-formal knowledge, as well as provide education in ethics and etiquette, and educate how to live to be good citizens in society.' },

  { id: 'YLT', no: 2, name: 'Youth Leadership Training',
    reportName: 'Youth Leadership Training Project (YLT)',
    unit: 'students', countedAs: 'students',
    kind: 'cohort',
    ministries: ['DTS', 'GPDTS', 'DBS', 'SMS', 'BCS', 'SOMD'],
    blurb: 'Leadership training schools — DTS, DBS and the other leadership schools.',
    desc: 'The Youth Leadership Training (YLT) program facilitates leadership training, character development, and ethics for Cambodian youth. It consists of 2 phases. The first phase is 12 weeks of training through lectures and classroom-based activities. Each week is spent learning about a specific topic, such as personal identity, building healthy relationships, forgiving others, and living a purposeful life that makes a positive impact on society. The second phase lasts for 2 months and serves as a practical application period. Students are divided into small groups and sent to various provinces across Cambodia as well as abroad to participate in programs hosted by different organizations, allowing them to apply what they learned in class.',
    conclusion: 'Through the Youth Leadership Training (YLT), we provide a positive learning environment for Cambodian youth where they can learn leadership, life skills, and gain the foundation for working with our organization or other NGOs.' },

  { id: 'YAP', no: 4, name: 'Youth Assistance Project',
    reportName: 'Youth Assistance Project (YAP)',
    unit: 'participants', countedAs: 'students',
    kind: 'group',
    ministries: [],
    blurb: 'The pathway for young people becoming staff: dorm residents, new staff in their first 2–4 years, and young leaders being supported through education and mentoring.',
    desc: 'The Youth Assistance Project (YAP) provides housing, food, and scholarships to underprivileged students so they can complete high school or university, alongside training in computers, English, arts, music, and sports.',
    conclusion: 'As for the Youth Assistance Program (YAP), we hope that the students who stay with us will receive a good education and be well-disciplined. The YAP leaders and staff have maintained good relationships with families and villagers. That is why families trust them and send their children to join our program. The project leaders and staff are truly committed to working with the youth and walking with them even after they graduate from high school. Graduates will also have the opportunity to participate in our youth leadership training program.' }
];

/* The parts of the report that are the same every time. Lifted from the report
   already filed, so the generated one is the same document with this period's
   numbers in it — not a new format the Ministry has to learn to read.

   `province` heads the document. Poipet is in Banteay Meanchey, and the filed
   report is headed for that province; a Siem Reap-only report would need its own,
   which is why this is data and not a string in the middle of the generator. */
var GP_REPORT_TEXT = {
  province: 'II. Banteay Meanchey Province',
  org: 'University of The Nations',
  intro: 'The University of The Nations organisation has been registered as a legal non-governmental organization (NGO) in Cambodia since June 2002. The University of The Nations in Cambodia is affiliated with the worldwide University of The Nations, a global movement working across many nations to empower young people to serve their communities, educate youth, and develop leaders for national societal growth.',
  mission: 'Serve the Community, Educate Youth, and Develop Leaders (Youth and Leadership).',
  agreementsLine: 'We hold 4 project agreements with the Ministry of Education, Youth and Sport:',
  conclusionOpen: 'Through the above four projects, our organization hopes that children and youth in the community will benefit from the non-formal education programs we have.',
  budgetNote: 'We do not need to do this budget yet, but be prepared to provide budget information regarding your specific ministries in the future.'
};

/* Report order, which is the agreement's own numbering rather than the order the
   app lists the programmes in. */
function gpProgramsInReportOrder(){
  return GP_PROGRAMS.slice().sort(function(a, b){ return (a.no || 99) - (b.no || 99); });
}

/* The fields each kind of record carries. `n` fields are counts, `s` are text,
   `d` are dates. The forms, the validation and the report all read this, so the
   three cannot drift — add a field once and it appears in all of them. */
var GP_RECORD_FIELDS = {
  /* SVI — one row per visiting team */
  team: [
    { k: 'name',        t: 's', label: 'Team name',        hint: 'e.g. YWAM Maui' },
    { k: 'country',     t: 's', label: 'Country of origin', hint: 'e.g. USA' },
    { k: 'from',        t: 'd', label: 'Arrived' },
    { k: 'to',          t: 'd', label: 'Left' },
    { k: 'male',        t: 'n', label: 'Men on the team' },
    { k: 'female',      t: 'n', label: 'Women on the team' },
    { k: 'servedMale',  t: 'n', label: 'Boys/men served',   optional: true },
    { k: 'servedFemale',t: 'n', label: 'Girls/women served', optional: true },
    { k: 'activities',  t: 'x', label: 'What they did',     hint: 'Teaching, community outreach, refugee relief…' }
  ],
  /* YDC — one row per location */
  class: [
    { k: 'location',    t: 's', label: 'Location',          hint: 'e.g. Poipet YDC' },
    { k: 'classes',     t: 'n', label: 'Classes running' },
    { k: 'male',        t: 'n', label: 'Male students' },
    { k: 'female',      t: 'n', label: 'Female students' },
    { k: 'activities',  t: 'x', label: 'Notes',             optional: true }
  ],
  /* YLT — one row per cohort/school */
  cohort: [
    { k: 'name',        t: 's', label: 'School / cohort',   hint: 'e.g. GPDTS Sept 2026' },
    { k: 'male',        t: 'n', label: 'Male students' },
    { k: 'female',      t: 'n', label: 'Female students' },
    { k: 'intl',        t: 'n', label: 'International students' },
    { k: 'khmer',       t: 'n', label: 'Khmer students' },
    { k: 'staffMale',   t: 'n', label: 'Male staff' },
    { k: 'staffFemale', t: 'n', label: 'Female staff' },
    { k: 'staffIntl',   t: 'n', label: 'International staff' },
    { k: 'staffKhmer',  t: 'n', label: 'Khmer staff' },
    { k: 'outreach',    t: 'x', label: 'Outreach locations', hint: 'One per line' },
    { k: 'activities',  t: 'x', label: 'Notes',             optional: true }
  ],
  /* YAP — one row per dorm/location */
  group: [
    { k: 'location',    t: 's', label: 'Location',          hint: 'e.g. Saang District dormitory' },
    { k: 'male',        t: 'n', label: 'Male participants' },
    { k: 'female',      t: 'n', label: 'Female participants' },
    { k: 'sponsors',    t: 'x', label: 'Support for sponsor families', optional: true },
    { k: 'activities',  t: 'x', label: 'Notes',             optional: true }
  ],
  /* Written once a semester, and not tied to a single programme — the report asks
     for the challenges the whole base faced and what was done about each. */
  issue: [
    { k: 'challenge',   t: 'x', label: 'Challenge' },
    { k: 'solution',    t: 'x', label: 'What we did about it' }
  ],
  /* One per programme per year: the number the agreement commits us to. Stored
     rather than hardcoded because it is renegotiated — the 2026 agreement is not
     the 2027 one, and last year's report must still show last year's target. */
  goal: [
    { k: 'target',      t: 'n', label: 'Target for the year' },
    { k: 'unit',        t: 's', label: 'Counted in',          optional: true }
  ]
};

function gpProgram(id){
  for (var i = 0; i < GP_PROGRAMS.length; i++) if (GP_PROGRAMS[i].id === id) return GP_PROGRAMS[i];
  return null;
}
/* The fields one programme's records carry — the same lookup the form does, for a
   caller that has a programme id rather than a kind. */
function gpProgramFields(id){
  var p = gpProgram(id);
  return (p && GP_RECORD_FIELDS[p.kind]) || [];
}
/* Headcount for a record, whichever shape it is: men + women. Kept in one place
   because the report totals it, the goal percentage divides by it, and a second
   definition would eventually disagree with the first. */
function gpRecordPeople(rec){
  return (Number(rec && rec.male) || 0) + (Number(rec && rec.female) || 0);
}

/* Everything the report says about one programme, from the rows entered for it.
   The data-entry screen shows this back to whoever is typing so a wrong figure is
   caught while they are still looking at it, and the report generator will read
   the same function — one definition of "how many volunteers came this year".

   `rows` is the whole year's list; this picks out its own. */
function gpProgramSummary(id, rows){
  var p = gpProgram(id);
  var out = { id:id, unit:(p&&p.unit)||'people', rows:0, people:0, male:0, female:0,
              classes:0, locations:0, countries:[], staff:0, khmer:0, intl:0, served:0 };
  if(!p) return out;
  var seen = {}, cSeen = {};
  (rows||[]).forEach(function(r){
    if(r.kind!==p.kind || r.program!==id) return;
    out.rows++;
    out.people += gpRecordPeople(r);
    out.male += Number(r.male)||0;
    out.female += Number(r.female)||0;
    out.classes += Number(r.classes)||0;
    out.khmer += Number(r.khmer)||0;
    out.intl += Number(r.intl)||0;
    out.staff += (Number(r.staffMale)||0) + (Number(r.staffFemale)||0);
    out.served += (Number(r.servedMale)||0) + (Number(r.servedFemale)||0);
    var loc = r.location || '';
    if(loc && !seen[loc]){ seen[loc]=1; out.locations++; }
    var c = (r.country||'').trim();
    if(c && !cSeen[c.toLowerCase()]){ cSeen[c.toLowerCase()]=1; out.countries.push(c); }
  });
  return out;
}

/* The year's target for one programme, or null when nobody has set one yet —
   which is different from a target of zero and has to stay different, or an
   unset programme reads as 0% instead of "no goal yet". */
function gpProgramGoal(id, rows){
  var found = null;
  (rows||[]).forEach(function(r){
    if(r.kind==='goal' && r.program===id) found = r;
  });
  return found ? (Number(found.target)||0) : null;
}
