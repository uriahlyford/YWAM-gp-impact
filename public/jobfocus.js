/*  What each ministry is actually for — the "job description" half of the app.

    One entry per ministry: which department it sits under, and the focus
    paragraph that says what this job is measured by. Extracted verbatim from the
    KPI guide (help.html), which is where the wording was written and reviewed.

    Used by the staff page's OKRs tab to lead with the reader's own job before
    showing the objectives their department is working on — an objective means
    little without the job it belongs to.

    Base Leadership's "ministries" are named after the departments they oversee
    ('Community Service' as a ministry is the department leader's row, not the
    department), which is why lookups take the department too.

    help.html still carries these paragraphs inline, so it needs no script to
    render. A test asserts the two copies agree — if you edit one, edit both, and
    the test will tell you if you forget.  */
var JOB_FOCUS = {
  "Outreach Teams": { dept: "Community Service",
    focus: "You lead teams into the community to share the gospel, serve real needs, and connect new believers to a local church. Your week is measured by how many people heard the good news, were served, and took a step toward Jesus." },
  "Cafe": { dept: "Community Service",
    focus: "You run the café as both a business and a mission field — keep it financially healthy while turning everyday customer moments into gospel conversations." },
  "GP Education": { dept: "Community Service",
    focus: "You lead a school that educates children and disciples them — watch enrollment, the students you support with food, housing and finances, and those growing in faith." },
  "Ponlork School": { dept: "Community Service",
    focus: "You lead this school that educates children and disciples them — watch enrollment, the students you support, and those growing in faith." },
  "LTN": { dept: "Community Service",
    focus: "You lead this school that educates children and disciples them — watch enrollment, the students you support, and those growing in faith." },
  "Sry Noi": { dept: "Community Service",
    focus: "You lead this school that educates children and disciples them — watch enrollment, the students you support, and those growing in faith." },
  "Intercession": { dept: "Community Service",
    focus: "You hold the spiritual foundation of the base in prayer — covering ministries in prayer hours and meetings, and celebrating answered-prayer testimonies." },
  "Sports": { dept: "Youth Education",
    focus: "You use sport to reach and disciple young people — grow participation, raise up coaches, and walk players toward Jesus." },
  "GP Media": { dept: "Youth Education",
    focus: "You are the online voice of GonPreah — grow the platforms, publish content, reply to everyone who engages, and turn followers into students and disciples." },
  "YDC": { dept: "Youth Education",
    focus: "You run classes and events that develop youth academically and spiritually, and bring them into the life of a local church." },
  "Worship": { dept: "Youth Education",
    focus: "You build a worship culture and raise musicians — host worship nights, train players, and write and record original songs that go out to the world." },
  "DTS": { dept: "Leadership Development",
    focus: "You disciple students through the training school — from enrollment to graduation, through outreach, into their calling, and some into staff." },
  "GPDTS": { dept: "Leadership Development",
    focus: "You disciple students through the training school — from enrollment to graduation, through outreach, into their calling, and some into staff." },
  "DBS": { dept: "Leadership Development",
    focus: "You lead students deep into the Word, disciple them through outreach, and help them take their next step." },
  "SMS": { dept: "Leadership Development",
    focus: "You train students to make media that carries the gospel — growing their pages, filming and content skills, and their reach." },
  "BCS": { dept: "Leadership Development",
    focus: "You disciple students while adding pastoral care, including counseling, as they grow and prepare for what's next." },
  "SOMD": { dept: "Leadership Development",
    focus: "You disciple students with a focus on language and cross-cultural readiness — tracking English and Khmer growth alongside spiritual formation." },
  "Evangelism": { dept: "Leadership Development",
    focus: "You lead the front line of sharing the gospel — events, conversations, and people reached — and connect them onward to a church." },
  "Church Partnerships": { dept: "Leadership Development",
    focus: "You strengthen and plant churches — support partner churches, lead congregations, and start new ones." },
  "Finances": { dept: "Skills Training",
    focus: "You steward the base's money and train others in it — deliver training, keep reports and clarity high, and consolidate finances." },
  "Hospitality": { dept: "Skills Training",
    focus: "You make guests and staff feel cared for, and train others to do the same — beds ready, guests welcomed, the base feeling like home." },
  "Technical": { dept: "Skills Training",
    focus: "You keep the base running and improving — complete and progress projects, maintain the facility, and train others in the trade." },
  "Culinary": { dept: "Skills Training",
    focus: "You feed the base well and train cooks — serve meals on time and on budget, and keep the food good." },
  "Community Service": { dept: "Base Leadership",
    focus: "You disciple and support the leaders under Community Service — meet them one-on-one, connect partners, teach, and carry responsibility for staff care and funding." },
  "Youth Education": { dept: "Base Leadership",
    focus: "You disciple and support the leaders under Youth Education — meet them one-on-one, connect partners, teach, and carry responsibility for staff care and funding." },
  "Leadership Development": { dept: "Base Leadership",
    focus: "You disciple and support the leaders under Leadership Development — meet them one-on-one, connect partners, teach, and carry responsibility for staff care and funding." },
  "Skills Training": { dept: "Base Leadership",
    focus: "You disciple and support the leaders under Skills Training — meet them one-on-one, connect partners, teach, and carry responsibility for staff care and funding." },
  "Campus Leadership": { dept: "Base Leadership",
    focus: "You carry the vision and health of the whole campus — communication, partner relationships, finances, and planting the next base." }
};

/* The focus for a ministry, or null when there is nothing written for it.
   `dept` is optional and only used to disambiguate the Base Leadership rows. */
function jobFocus(dept, ministry){
  var e = JOB_FOCUS[ministry];
  if(!e) return null;
  if(dept && e.dept !== dept) return null;
  return e.focus;
}
