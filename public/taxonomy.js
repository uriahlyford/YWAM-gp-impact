/*  Shared KPI taxonomy — campuses, departments, ministries, metric lists,
    and how each metric aggregates (sum / latest / avg).

    Loaded by BOTH index.html (leadership dashboard) and teams.html (staff
    home), so a staff member sees exactly the metrics their ministry is
    measured on. Keep it dependency-free plain script — no modules, no build
    step; it just defines globals the two pages already expect.

    The metric name strings are the join keys for stored entries. Renaming one
    here orphans every number logged under the old name, so treat them as data,
    not copy.  */
var CAMPUSES = [
  { id:'poipet', name:'YWAM Poipet', short:'Poipet' },
  { id:'siemreap', name:'YWAM Siem Reap', short:'Siem Reap' }
];

var BL_DEPT = 'Base Leadership';
var SENSITIVE = ['Base Finances ($)','Base Cash Reserve ($)'];
var PLATFORMS = ['Instagram','Facebook','YouTube','TikTok'];

function mediaMetrics(){
  var out = [];
  PLATFORMS.forEach(function(p){
    out.push(p+' Pages', p+' Followers', p+' Views', p+' Pieces Published',
      p+' Comments Replied', p+' Messages Replied', p+' Student Leads');
  });
  out.push('Salvations');
  return out;
}

var CS_SCHOOL_METRICS = ['Schools','Ministry Staff','Students Enrolled',
  'Students Supported Financially','Students Given Food & Housing','Students in Discipleship',
  'Salvations','Baptisms'];

var NEXT_SCHOOL = [
  'Intl Students Contacted (Next School)','Local Students Contacted (Next School)',
  'Intl Students Applied (Next School)','Local Students Applied (Next School)',
  'Intl Students Enrolled (Next School)','Local Students Enrolled (Next School)',
  'Teachers Confirmed (Next School)','Staff Confirmed (Next School)'];
var DTS_METRICS = ['Students Enrolled','Students Graduated',
  'Teacher Feedback Score (1-10)','Students Struggling','Potential Staff',
  'Outreach Locations Reached','People Heard the Gospel','Healings',
  'Salvations','Baptisms'].concat(NEXT_SCHOOL);

var BL_COMMON = ['One-on-Ones Held','Partner Connections','Spoke at Churches','Spoke at YWAM Bases',
  'Hours Sharing the Gospel','Department Meetings Held','Teachings Prepped','Meetings Led'];
var BL_DEPT_EXTRA = ['Total Staff','Staff Debt ($)','Funds Raised ($)'];

function getDepartments(campusId){
  var d = {
    'Community Service': {
      'Outreach Teams': ['Teams Hosted','Gospel Presentations Given','People Heard the Gospel',
        'People Served','Volunteers Mobilized','Community Service Hours','Healings',
        'Kids Classes Run','Total Kids','Salvations','Baptisms','People Connected to Local Church'],
      'Cafe': ['Days Open','Cups Sold','Customers Served','Gospel Conversations','Salvations',
        'Weekly Profit ($)','Weekly Expenses ($)','Total in Bank Account ($)'],
      'GP Education': CS_SCHOOL_METRICS.slice(),
      'Intercession': ['Prayer Hours Covered','Prayer Meetings Held','Ministries Covered in Prayer',
        'Answered-Prayer Testimonies','Director Weekly Score (1-10)']
    },
    'Youth Education': {
      'Sports': ['Sessions / Leagues Run','Games Played','Games Won','Youth Participating',
        'Current Coaches','Coaches in Training','Salvations','Players Being Discipled'],
      'GP Media': mediaMetrics(),
      'YDC': ['Days with Classes','Youth Enrolled','Tests Held','Passing Rate (%)',
        'Parties Thrown','Competitions Held','Salvations','Baptisms',
        'Students in Discipleship','Students Brought to Local Church'],
      'Worship': ['Worship Nights Hosted','Attendance at Gatherings','Musicians in Training',
        'Hours Spent Practicing','Songs Written','Songs Recorded','Songs Uploaded to Social Media','Salvations']
    },
    'Leadership Development': {},
    'Skills Training': {
      'Finances': ['Training Hours Delivered','Trainees in Track','Reports Submitted',
        'Financial System Clarity (1-10)','Finances Consolidated ($)','Base Cash Reserve ($)'],
      'Hospitality': ['Training Hours Delivered','Trainees in Track','Beds Made','Guests Welcomed',
        'Welcome Gifts Given','Base Hospitality Feel (1-10)','Improvement Projects in Progress'],
      'Technical': ['Training Hours Delivered','Trainees in Track','Projects Completed',
        'Projects in Process','Base Upkeep Score (1-10)'],
      'Culinary': ['Training Hours Delivered','Trainees in Track','People Cooked For',
        'Breakfasts Served','Lunches Served','Dinners Served','New Meals Tried',
        'Food Taste (1-10)','Food On Time (1-10)','Food On Budget (1-10)']
    },
    'Base Leadership': {
      'Community Service': BL_COMMON.concat(BL_DEPT_EXTRA),
      'Youth Education': BL_COMMON.concat(BL_DEPT_EXTRA),
      'Leadership Development': BL_COMMON.concat(BL_DEPT_EXTRA),
      'Skills Training': BL_COMMON.concat(BL_DEPT_EXTRA),
      'Campus Leadership': BL_COMMON.concat(['Base Vision (1-10)','Communications (1-10)',
        'Partner Relationships (1-10)','Base Plants in Planning','Base Finances ($)'])
    }
  };
  var LD = d['Leadership Development'];
  if (campusId === 'siemreap') {
    LD['GPDTS'] = DTS_METRICS.slice();
    LD['DBS'] = DTS_METRICS.slice();
    LD['SMS'] = ['Students Enrolled','Students Graduated',
      'New Pages Started','Follower Growth','Highest Viewed Video Views',
      'Hours Spent Filming','Content Pieces Posted','Salvations'];
    LD['BCS'] = DTS_METRICS.concat(['Counseling Sessions Completed']);
    LD['SOMD'] = DTS_METRICS.concat(['Avg English Proficiency (1-10)','Avg Khmer Proficiency (1-10)']);
  } else {
    LD['DTS'] = DTS_METRICS.slice();
    LD['DBS'] = DTS_METRICS.slice();
    LD['SMS'] = ['Students Enrolled','Students Graduated',
      'New Pages Started','Follower Growth','Highest Viewed Video Views',
      'Hours Spent Filming','Content Pieces Posted','Salvations'];
    LD['BCS'] = DTS_METRICS.concat(['Counseling Sessions Completed']);
    LD['SOMD'] = DTS_METRICS.concat(['Avg English Proficiency (1-10)','Avg Khmer Proficiency (1-10)']);
  }
  LD['Evangelism'] = ['Evangelistic Events Held','Gospel Conversations Initiated',
    'People Reached with Gospel','Salvations','Baptisms','People Connected to Local Church'];
  LD['Church Partnerships'] = ['Partner Churches Supported','Churches Being Led',
    'Combined Congregation Attendance','Salvations','Baptisms','New Churches Planted'];
  if (campusId === 'siemreap') {
    d['Community Service']['Ponlork School'] = CS_SCHOOL_METRICS.slice();
    d['Community Service']['LTN'] = CS_SCHOOL_METRICS.slice();
    d['Community Service']['Sry Noi'] = CS_SCHOOL_METRICS.slice();
  }
  return d;
}

var LATEST_SET = ['Total Staff','Staff Debt ($)','Base Finances ($)','Total in Bank Account ($)',
  'Base Cash Reserve ($)','Finances Consolidated ($)',
  'Schools','Ministry Staff','Students Enrolled','Students Supported Financially',
  'Students Given Food & Housing','Current Coaches','Coaches in Training','Musicians in Training',
  'Students Struggling','Potential Staff','Total Kids','Churches Being Led',
  'Improvement Projects in Progress','Projects in Process','Base Plants in Planning',
  'Youth Enrolled','Highest Viewed Video Views','Trainees in Track',
  // Ongoing headcounts, not weekly events — summing them double-counted the
  // same people every week they were re-entered.
  'Students in Discipleship','Players Being Discipled',
  // Same reason: a partner church stays a partner church week to week, and a
  // congregation's size is a level, not something you accumulate.
  'Partner Churches Supported','Combined Congregation Attendance'];

/*  Which ministries are "schools", for the dashboard roll-ups.

    Leadership Development = the YWAM training schools (a student goes through
    one of these). Community schools are split across two departments: the
    GP Education / Ponlork / LTN / Sry Noi side counts 'Students Enrolled',
    while YDC counts 'Youth Enrolled' — one school either way.

    Poipet therefore runs two community schools (GP Education + YDC); Siem Reap
    runs five (GP Education, Ponlork, LTN, Sry Noi + YDC). A ministry that
    reports its own 'Schools' number contributes that instead of 1, so a
    multi-site ministry is counted honestly. */
var LD_SCHOOL_MINISTRIES = ['GPDTS','DTS','DBS','SMS','BCS','SOMD'];
var CS_SCHOOL_MINISTRIES = ['GP Education','Ponlork School','LTN','Sry Noi'];
var YE_SCHOOL_MINISTRIES = ['YDC'];

function modeOf(metric){
  if (metric.indexOf('(1-10)')>-1 || metric.indexOf('(%)')>-1) return 'avg';
  if (LATEST_SET.indexOf(metric)>-1) return 'latest';
  var parts = metric.split(' ');
  var last = parts[parts.length-1];
  if (last==='Pages' || last==='Followers') return 'latest';
  return 'sum';
}

/* Weekly health composite for one survey row. Shared so the staff page can
   show a person their own weekly score using exactly the maths the base
   dashboard uses — loneliness inverted, porn/debt count as zero. */
function compositeOf(r){
  var parts = [ 10-(Number(r.lonely)||0), Number(r.clarity)||0,
    r.porn?0:10, r.oneOnOne?10:0, r.exercise?10:0, r.quietTime?10:0, r.debt?0:10 ];
  if(r.growth!==null && r.growth!==undefined) parts.push(Number(r.growth)||0);
  if(r.sharedFaith!==null && r.sharedFaith!==undefined) parts.push(r.sharedFaith?10:0);
  if(r.sabbath!==null && r.sabbath!==undefined) parts.push(r.sabbath?10:0);
  // The month-end add-on (familyCall/lonelyMonth/ministryUpdate/twoOneOnOnes) —
  // same "count it only if it was actually asked" treatment as growth/sabbath
  // above, since these only exist on the one week a month that asks them.
  if(r.familyCall!==null && r.familyCall!==undefined) parts.push(r.familyCall?10:0);
  if(r.lonelyMonth!==null && r.lonelyMonth!==undefined) parts.push(r.lonelyMonth?0:10);
  if(r.ministryUpdate!==null && r.ministryUpdate!==undefined) parts.push(r.ministryUpdate?10:0);
  if(r.twoOneOnOnes!==null && r.twoOneOnOnes!==undefined) parts.push(r.twoOneOnOnes?10:0);
  var s=0; parts.forEach(function(p){s+=p;});
  return s/parts.length;
}

/* Emoji per department and ministry. Shared so the staff directory badges
   match the dashboard exactly. */
var MIN_EMOJI = {
  'Outreach Teams':'\ud83d\ude4c', 'Cafe':'\u2615', 'GP Education':'\ud83d\udcda',
  'Intercession':'\ud83d\ude4f', 'Ponlork School':'\ud83c\udf31', 'LTN':'\ud83d\udcda', 'Sry Noi':'\ud83d\udcda',
  'Sports':'\u26bd', 'GP Media':'\ud83c\udfac', 'YDC':'\ud83c\udf1f', 'Worship':'\ud83c\udfb5',
  'GPDTS':'\ud83d\udd25', 'DTS':'\ud83d\udd25', 'DBS':'\ud83d\udcd6', 'SMS':'\ud83d\udcf1',
  'BCS':'\ud83d\udcac', 'SOMD':'\ud83c\udf93', 'Evangelism':'\ud83d\udce2', 'Church Partnerships':'\u26ea',
  'Finances':'\ud83d\udcb0', 'Hospitality':'\ud83c\udf3a', 'Technical':'\ud83d\udd27', 'Culinary':'\ud83c\udf72',
  'Community Service':'\ud83e\udd1d', 'Youth Education':'\ud83c\udf1f', 'Leadership Development':'\ud83c\udf31',
  'Skills Training':'\ud83d\udee0\ufe0f', 'Base Leadership':'\u2726', 'Campus Leadership':'\u2726'
};

/*  What kind of staff a person is, and where they are from.

    Both are set when someone creates their profile and changed from Profile &
    settings afterwards. They are the only two facts the base counts people by,
    so they are stored as ids, not as typed text — "Ministry"/"ministry"/"Min."
    would be three different kinds of staff, and "Khmer"/"Cambodia"/"KH" three
    different countries, which is exactly how a headcount stops being a headcount.

    The API keeps its own copy of the three ids (it must validate what it stores
    and cannot import this file) — change one, change both. Country is validated
    differently: the API normalises whatever arrives rather than rejecting it, so
    a nationality missing from this list still lands as a usable country.  */
var STAFF_TYPES = [
  { id:'campus',   label:'Campus staff',   short:'Campus',   hint:'You serve the base itself — leadership, hospitality, finances, upkeep.' },
  { id:'yap',      label:'YAP',            short:'YAP',      hint:'You are in the Youth Apprenticeship Programme.' },
  { id:'ministry', label:'Ministry staff', short:'Ministry', hint:'You work in one of the ministries — cafe, schools, outreach, media, sports.' }
];
function staffTypeLabel(id){
  for(var i=0;i<STAFF_TYPES.length;i++) if(STAFF_TYPES[i].id===id) return STAFF_TYPES[i].label;
  return '';
}
function staffTypeShort(id){
  for(var i=0;i<STAFF_TYPES.length;i++) if(STAFF_TYPES[i].id===id) return STAFF_TYPES[i].short;
  return '';
}

/* The home country, for "how many Khmer, how many international, how many
   countries". Cambodia leads because most of the base is Khmer; the rest are
   alphabetical. Not a complete list of the world — it is the countries a YWAM
   base in Cambodia actually sends and receives people from, plus room for
   anything else through "Other". Adding a name here is safe; renaming one
   orphans the people already stored under the old spelling. */
var HOME_COUNTRY = 'Cambodia';
var COUNTRIES = ['Cambodia',
  'Australia','Austria','Brazil','Canada','China','Denmark','Fiji','Finland','France','Germany',
  'Hong Kong','India','Indonesia','Ireland','Japan','Kenya','Laos','Malaysia','Mexico','Myanmar',
  'Nepal','Netherlands','New Zealand','Nigeria','Norway','Papua New Guinea','Philippines','Singapore',
  'South Africa','South Korea','Spain','Sweden','Switzerland','Taiwan','Thailand','Uganda',
  'United Kingdom','United States','Vietnam'];
