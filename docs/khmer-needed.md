# Khmer needed — My GP (staff) page

The dashboard has 266 reviewed Khmer strings and the staff page now shares that
same dictionary (`public/km.js`). Every KPI, ministry and department name already
translates. What is missing is the vocabulary of the personal page itself.

**Please do not machine-translate.** Per CLAUDE.md these need a native speaker
(Sreilea / Leakha). Anything left blank simply shows in English — safe, not broken.

**How to use this:** fill in the Khmer column and send it back — each row becomes
one line in `public/km.js`. Partial is fine: translate ten rows and those ten start
appearing in Khmer straight away, with the rest still in English.

## 0. Dashboard section headings and new KPIs (8 needed)

These are the new headings and metrics on the leadership dashboard. Everything
else on that page already translates. Highest priority of the three lists here —
these are the first thing a leader sees.

| English | ខ្មែរ |
|---|---|
| The base at a glance |  |
| Leadership Development schools |  |
| Community schools |  |
| Outreach teams |  |
| Local church partnerships |  |
| Across every ministry |  |
| Teams Hosted |  |
| Local Churches Partnered |  |

_Note: "Teams Hosted" is also a KPI leaders type into the log form, so it needs
to read naturally as a column label as well as on a dashboard tile._

## 1. Words and labels (53 needed)

Fill the right column:

| English | ខ្មែរ |
|---|---|
| Your team can see these on your profile. Anything personal belongs in the private check-in instead. |  |
| Home |  |
| Team |  |
| Me |  |
| Done |  |
| Save today |  |
| Save goals |  |
| Profile & settings |  |
| Log out |  |
| My progress |  |
| Streaks |  |
| This week |  |
| Recent days |  |
| Bible reading |  |
| Quiet time / prayer |  |
| Workout |  |
| Ate well |  |
| Slept well |  |
| Language study |  |
| Gratitude |  |
| One-on-one |  |
| Shared my faith |  |
| Sabbath / rest |  |
| moves |  |
| today |  |
| Choose my habits |  |
| Set this week’s goals |  |
| Edit goals |  |
| Show all |  |
| Welcome back |  |
| Username |  |
| PIN |  |
| Log in |  |
| Create my profile |  |
| Full name |  |
| Campus |  |
| Role / team |  |
| Phone |  |
| Save profile |  |
| Update PIN |  |
| Good morning |  |
| Good afternoon |  |
| Good evening |  |
| Hours, mood & private |  |
| Not logged yet |  |
| Language study today |  |
| Community ministry today |  |
| Pick the ones I log daily |  |
| Change which I log daily |  |
| My mentees |  |
| Mentor requests |  |
| Accept |  |
| Decline |  |

_Already translated, no action: Dashboard, Cancel, Department, Ministry_

## 2. Sentences with numbers in them (9)

These are currently built by joining fragments in code, so they cannot be
translated as-is — Khmer word order differs from English. They need restructuring
into whole templates first. Translate with the {placeholders} kept, and the code
will be reworked to match:

| English template | ខ្មែរ |
|---|---|
| My {n} goals · week {wk} |  |
| {done} of {total} done |  |
| {n} of 7 days logged |  |
| {n} days logged · {m} more for your score |  |
| Health score out of 10, from the {n} days you logged |  |
| Show all {total} ({hidden} hidden) |  |
| {n}-day streak |  |
| best {n} |  |
| Week {wk} · {n} staff |  |
