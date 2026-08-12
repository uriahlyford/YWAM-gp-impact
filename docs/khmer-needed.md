# Khmer needed — My GP (staff) page

The dashboard has 266 reviewed Khmer strings and the staff page now shares that
same dictionary (`public/km.js`). Every KPI, ministry and department name already
translates. What is missing is the vocabulary of the personal page itself.

**Please do not machine-translate.** Per CLAUDE.md these need a native speaker
(Sreilea / Leakha). Anything left blank simply shows in English — safe, not broken.

**How to use this:** fill in the Khmer column and send it back — each row becomes
one line in `public/km.js`. Partial is fine: translate ten rows and those ten start
appearing in Khmer straight away, with the rest still in English.

## 0. The front door (9 needed) — translate these first

This is now the **first screen anyone sees** who is not signed in, so it is the
most valuable thing on this list to get right. Until it is translated, the very
first impression of the app is in English.

| English | ខ្មែរ |
|---|---|
| GP Impact |  |
| Ministry numbers for YWAM GonPreah — Poipet and Siem Reap. |  |
| I already have a profile |  |
| View as guest |  |
| Guests can see everything. Logging numbers needs an account. |  |
| This part needs an account |  |
| Numbers are logged against a person and a campus, so we can tell whose week they are. |  |
| The health check-in is tied to you, so your week can build a streak and reach your mentor. |  |
| STAFF |  |

_"STAFF" is the label above the big number on the dashboard — a short heading,
not a sentence. "Create my profile" is already in list 1 below._

## 0b. Dashboard section headings and new KPIs (7 needed)

Headings and metrics on the leadership dashboard. Everything else on that page
already translates.

| English | ខ្មែរ |
|---|---|
| Leadership Development schools |  |
| Community schools |  |
| Outreach teams |  |
| Local church partnerships |  |
| Across every ministry |  |
| Teams Hosted |  |
| Local Churches Partnered |  |

_Note: "Teams Hosted" is also a KPI leaders type into the log form, so it needs
to read naturally as a column label as well as on a dashboard tile._

These same headings now appear on the **Base tab of the staff page** as well —
the first screen a staff member sees after logging in — so they went from
"leadership reads them" to "everyone reads them, every day". That moves them up
the priority list, alongside list 0.

## 0c. The Base tab (11 needed)

The staff page opens on the base's own figures. These are its labels.

| English | ខ្មែរ |
|---|---|
| Base |  |
| My week |  |
| My health |  |
| WEEK |  |
| yours |  |
| Loading your base… |  |
| See the full dashboard |  |
| week |  |
| Tap any number to see which ministries and weeks it came from. |  |
| Nothing logged for this yet. |  |
| Close |  |

_Lowercase "week" is the one in the profile card at the top ("YWAM Poipet · week 33");
uppercase "WEEK" is the heading next to the campus name in the black card — the two
may well want different Khmer. "Nothing logged for this yet." and "Close" belong to
the tap-a-number breakdown sheet, which is now on this page too._

_"WEEK" is a short heading next to the campus name (YWAM SIEM REAP · WEEK 33),
not a sentence. "yours" is the small tag marking which department is the reader's
own in the salvations list — so it needs to work as a label, not a pronoun.
"Base" and "My week" are bottom-tab labels with about 9 characters of room._

## 0c-2. OKRs on Me, and on a teammate's page (13 needed)

Objectives live on **Me** (your own) and on a **teammate's page** in Team (theirs).
Both open with the job the objectives belong to, so the same block is written twice —
once addressed to you, once about them.

| English | ខ្មែរ |
|---|---|
| OKRs |  |
| Your focus |  |
| Their focus |  |
| No objectives set for your department this quarter. |  |
| No objectives set for their department this quarter. |  |
| Nothing logged yet |  |
| tracked by hand |  |
| Progress comes from what your ministry logs each week, not from ticking a box here. |  |

### The editor (5 needed)

Staff can now write their own department's objectives from Me. Every form label
the editor uses is already translated (Objective, Key result, Measure by, Target,
Cancel, Save changes, Add objective, Delete, Edit, Saved, Saving…) — these five
are the new ones.

| English | ខ្មែរ |
|---|---|
| What are we aiming at this quarter? |  |
| Give the objective a name first. |  |
| Add at least one key result. |  |
| Delete this objective? |  |
| That didn't save — try again. |  |

_The first is placeholder text inside the objective box. The next two are the
messages shown when someone taps Save with something missing. "Delete this
objective?" is a confirm dialog, so it has to read as a yes/no question. The last
appears when the server refuses a write._

_"OKRs" is already in km.js as an untranslated acronym — leave it as-is if that is
what the team says out loud. "Your focus" / "Their focus" is the label on the black
card naming the ministry; the focus paragraphs themselves live in `public/jobfocus.js`
and in the KPI guide, and are a much bigger translation job — worth doing, but
separately. "tracked by hand" marks a key result with no KPI behind it. The two
"No objectives set..." lines differ only in whose department it is, which Khmer may
well handle in one sentence — if so, use the same text twice._

## 0c-3b. The weekly check-in (15 needed)

The eleven weekly questions are back as a form, on the Health tab. The questions
themselves were already translated for the dashboard; these are the labels around
them, plus the mentor's view of a mentee's answers.

| English | ខ្មែរ |
|---|---|
| My check-in |  |
| Against last week |  |
| My weeks |  |
| From your weekly check-in |  |
| Worked out from the days you logged |  |
| Edit my answers |  |
| Hide the form |  |
| Clear this week |  |
| Clear this week's check-in? |  |
| Answer the 1-10 questions first. |  |
| weekly check-in |  |
| from daily logs |  |
| answer the week directly |  |
| Their weekly check-ins |  |
| No check-ins yet. |  |
| Base figures are totals only — no names. Your answers are shown by name to your mentor and to nobody else. |  |

_"weekly check-in" and "from daily logs" are small tags under a week, saying which
way that week was answered — lowercase on purpose. "Clear this week's check-in?" is
a confirm dialog, so it needs to read as a yes/no question. The last line is the
promise the page makes about who sees what; worth getting exactly right rather than
literal — the base total is nameless, and the reader's mentor is the one person who
sees their answers with their name on them._

## 0c-3. Health tab labels still needed (6)

What the Health tab needs beyond the weekly-check-in list above. The rest of its
labels — the eleven questions, the base-average rows, Staff Health Score, Checked in
this week — were already translated for the dashboard.

| English | ខ្មែរ |
|---|---|
| Health score out of 10 |  |
| this week |  |
| Loneliness (avg) |  |
| Growth (avg) |  |
| Language hours |  |
| Ministry hours |  |

_The short "(avg)" labels are the reader's own figures — averaged across the days
they logged when a week came from daily logs, or simply their answer when they filled
the week in. The base section keeps the longer dashboard wording, which is an average
across people._

## 0d. One sentence for the Base tab (1)

| English | ខ្មែរ |
|---|---|
| Every figure here is built from what each ministry logs each week — including yours. |  |

_This is the line under the base figures that tells a staff member their own
weekly numbers are part of what they are looking at. Worth getting right rather
than literal._

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
