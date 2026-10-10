# My Ministry tools — the plan

Each My Ministry page becomes a tool the ministry actually uses day to day. The weekly
numbers are a by-product: they fill themselves in from what the team does in the tool,
and anyone can still type a number by hand (the tool never overwrites a typed number
with an empty week).

## Built

| Ministry | Tool | Numbers it fills |
|---|---|---|
| Hospitality | The Hospitality page | its weekly numbers |
| Outreach Teams | Teams Database | (unchanged) |
| Campus Leadership | **My week**: quick log, partners, base plants, Director's reflection. **Overview**: clear leaders, numbers in, next Tuesday, the money ahead (leadership code), each department's pulse. **Board**: OKRs, the Monday board, the **Tuesday** meeting (facilitator, translator, topics), notes | One-on-Ones Held, Partner Connections, Spoke at Churches / YWAM Bases, Hours Sharing the Gospel, Teachings Prepped, Meetings Led, Department Meetings Held, Base Vision / Communications / Partner Relationships (1-10), Base Plants in Planning |
| Community Service → Cafe | **Cafe tool** (basic): Today (open/close checklists, cash), Till (in the app, or the day's HangPopok totals), Rota, Week, Set up | Days Open, Cups Sold, Customers Served, Gospel Conversations, Salvations, Weekly Expenses ($), Weekly Profit ($) |

## Next: Community Schools and YDC (planned, not built)

One "class" tool shared by GP Education → Schools (Ponlork, LTN, Sry Noi …) and Youth
Education → YDC, with the parts each one needs switched on.

1. **Students.** Enrol a student (name, photo, age/grade, guardian and phone, class,
   start date, fee or sponsored). Each student has a profile: attendance, scores, notes,
   payments. Archive rather than delete when they leave.
2. **Classes and teachers.** Classes with their teacher(s) and days. A teacher sees only
   their classes.
3. **Attendance.** Open today's class → everyone listed → tap who is absent (present is
   the default) → Save. Works offline and sends later. A day with attendance taken is a
   "day with classes".
4. **Tests and progress.** Add a test (class, date, out of) → type each score → the pass
   mark marks passing. Each student's profile shows a line of their scores over time and
   their attendance %; a "needs help" list for low attendance or falling scores.
5. **Payments.** Monthly fee per student (or "sponsored"); mark paid with amount and date;
   an "unpaid this month" list for the school leader; receipts later.
6. **Care and discipleship.** Ticks per student: in discipleship, food & housing,
   financially supported, brought to a local church.

Numbers it would fill:

| Schools | YDC |
|---|---|
| Students Enrolled (active students) | Youth Enrolled |
| Days with Classes (days attendance was taken) | Tests Held (tests added this week) |
| Students in Discipleship | Passing Rate (%) (scores ≥ pass mark ÷ scores) |
| Students Supported Financially | Students Brought to Local Church |
| Students Given Food & Housing | Parties Thrown / Competitions Held (an "event" log) |
| Ministry Staff (teachers on the classes) | |

Privacy: student records are children's data, so they are visible only to that school's
staff, its leader and admins. Nothing reaches the public dashboard except the totals
above, and photos are optional.

## Cafe — later

- The cafe uses **HangPopok** (Cambodian cloud POS). It has no public API that we could
  find, so for now the day's totals are typed in at closing. If HangPopok can export its
  daily sales report (Excel/CSV), the app could read that file instead — or HangPopok's
  developer may offer an API. Either would make the numbers fully automatic.
- Stock: milk, beans, cups — a low-stock list from the closing checklist.
- Khmer menu names alongside English.
