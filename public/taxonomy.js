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
      'Outreach Teams': ['Gospel Presentations Given','People Heard the Gospel',
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
  'Students in Discipleship','Players Being Discipled'];

function modeOf(metric){
  if (metric.indexOf('(1-10)')>-1 || metric.indexOf('(%)')>-1) return 'avg';
  if (LATEST_SET.indexOf(metric)>-1) return 'latest';
  var parts = metric.split(' ');
  var last = parts[parts.length-1];
  if (last==='Pages' || last==='Followers') return 'latest';
  return 'sum';
}
