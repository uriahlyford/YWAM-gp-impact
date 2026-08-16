# Khmer review — everything now ships in Khmer

**Status: translated, not yet reviewed.** Uriah asked for the backlog to be
translated rather than left in English, so it was — by Claude, not by a person.
Every string below is live in the app right now.

They live in `PENDING_KM` in `public/km.js`, kept deliberately separate from
`REVIEWED_KM` (the 266 strings Sreilea and Leakha have already checked). The app
merges the two with reviewed last, so a checked string always wins.

**What this document is for now:** reading, not filling in. The Khmer column shows
what is on screen today.

**Sreilea / Leakha — how to use it:**
- Anything that reads wrong, tell Uriah and it gets corrected.
- Anything that reads right, it moves from `PENDING_KM` up into `REVIEWED_KM`,
  which is how we track what has actually been read by a person.
- The notes under each table say where the string appears and how much room it has.
  Several are labels in buttons with about 9-10 characters of space; a few are
  promises the app makes about privacy, and those are worth checking first —
  they are in sections 0c-3b and 0g.
- **Section 0h is new and is the one that leaves the building.** Everything in it
  ends up in the report to the Ministry of Education, Youth and Sport.
  The four programme names are the ones in the signed agreements; if the
  agreements already carry official Khmer names, those replace the guesses here.

A machine translation that nobody has read is not the same thing as a checked one,
which is the whole reason for the split. Nothing here is settled until you say so.

## 0. The front door — check these first

This is the **first screen anyone sees** who is not signed in, so it is the most
valuable thing on this list to get right — it is the app's first impression.

| English | ខ្មែរ |
|---|---|
| GP Impact | GP Impact |
| Ministry numbers for YWAM GonPreah — Poipet and Siem Reap. | ចំនួនកិច្ចការបម្រើព្រះរបស់ YWAM កូនព្រះ — ប៉ោយប៉ែត និងសៀមរាប។ |
| I already have a profile | ខ្ញុំមានប្រវត្តិរូបរួចហើយ |
| View as guest | មើលជាភ្ញៀវ |
| Guests can see everything. Logging numbers needs an account. | ភ្ញៀវអាចមើលឃើញអ្វីៗទាំងអស់។ ការកត់ត្រាចំនួនត្រូវការគណនី។ |
| This part needs an account | ផ្នែកនេះត្រូវការគណនី |
| Numbers are logged against a person and a campus, so we can tell whose week they are. | ចំនួននីមួយៗត្រូវបានកត់ត្រាភ្ជាប់ជាមួយបុគ្គល និងសាខា ដើម្បីឱ្យដឹងថាជាសប្តាហ៍របស់នរណា។ |
| The health check-in is tied to you, so your week can build a streak and reach your mentor. | ការរាយការណ៍សុខភាពត្រូវបានភ្ជាប់ជាមួយអ្នក ដើម្បីឱ្យសប្តាហ៍របស់អ្នកបង្កើតបានជាលំដាប់ជាប់ៗគ្នា និងទៅដល់អ្នកណែនាំរបស់អ្នក។ |
| STAFF | បុគ្គលិក |

_"STAFF" is the label above the big number on the dashboard — a short heading,
not a sentence. "Create my profile" is already in list 1 below._

## 0b. Dashboard section headings and new KPIs

Headings and metrics on the leadership dashboard. Everything else on that page
already translates.

| English | ខ្មែរ |
|---|---|
| Leadership Development schools | សាលារៀនផ្នែកការអភិវឌ្ឍថ្នាក់ដឹកនាំ |
| Community schools | សាលារៀនសហគមន៍ |
| Outreach teams | ក្រុមចេញផ្សព្វផ្សាយ |
| Local church partnerships | ភាពជាដៃគូជាមួយក្រុមជំនុំមូលដ្ឋាន |
| Across every ministry | ទូទាំងគ្រប់កិច្ចការបម្រើ |
| Teams Hosted | ក្រុមដែលបានទទួលរៀបចំ |
| Local Churches Partnered | ក្រុមជំនុំមូលដ្ឋានដែលបានចាប់ដៃគូ |

_Note: "Teams Hosted" is also a KPI leaders type into the log form, so it needs
to read naturally as a column label as well as on a dashboard tile._

These same headings now appear on the **Base tab of the staff page** as well —
the first screen a staff member sees after logging in — so they went from
"leadership reads them" to "everyone reads them, every day". That moves them up
the priority list, alongside list 0.

## 0c. The Base tab

The staff page opens on the base's own figures. These are its labels.

| English | ខ្មែរ |
|---|---|
| Base | មូលដ្ឋាន |
| My week | សប្តាហ៍ខ្ញុំ |
| My health | សុខភាពរបស់ខ្ញុំ |
| WEEK | សប្តាហ៍ |
| yours | របស់អ្នក |
| Loading your base… | កំពុងផ្ទុកមូលដ្ឋានរបស់អ្នក… |
| See the full dashboard | មើលផ្ទាំងគ្រប់គ្រងពេញលេញ |
| week | សប្តាហ៍ |
| Tap any number to see which ministries and weeks it came from. | ចុចលើចំនួនណាមួយ ដើម្បីមើលថាវាមកពីកិច្ចការបម្រើ និងសប្តាហ៍ណាខ្លះ។ |
| Nothing logged for this yet. | មិនទាន់មានការកត់ត្រាសម្រាប់ចំណុចនេះនៅឡើយទេ។ |
| Close | បិទ |

_Lowercase "week" is the one in the profile card at the top ("YWAM Poipet · week 33");
uppercase "WEEK" is the heading next to the campus name in the black card — the two
may well want different Khmer. "Nothing logged for this yet." and "Close" belong to
the tap-a-number breakdown sheet, which is now on this page too._

_"WEEK" is a short heading next to the campus name (YWAM SIEM REAP · WEEK 33),
not a sentence. "yours" is the small tag marking which department is the reader's
own in the salvations list — so it needs to work as a label, not a pronoun.
"Base" and "My week" are bottom-tab labels with about 9 characters of room._

## 0c-2. OKRs on Me, and on a teammate's page

Objectives live on **Me** (your own) and on a **teammate's page** in Team (theirs).
Both open with the job the objectives belong to, so the same block is written twice —
once addressed to you, once about them.

| English | ខ្មែរ |
|---|---|
| OKRs | OKRs  _(already reviewed)_ |
| Your focus | ការផ្តោតសំខាន់របស់អ្នក |
| Their focus | ការផ្តោតសំខាន់របស់គាត់ |
| No objectives set for your department this quarter. | មិនទាន់មានគោលដៅសម្រាប់ផ្នែករបស់អ្នកក្នុងត្រីមាសនេះទេ។ |
| No objectives set for their department this quarter. | មិនទាន់មានគោលដៅសម្រាប់ផ្នែករបស់គាត់ក្នុងត្រីមាសនេះទេ។ |
| Nothing logged yet | មិនទាន់មានការកត់ត្រា |
| tracked by hand | តាមដានដោយផ្ទាល់ |
| Progress comes from what your ministry logs each week, not from ticking a box here. | វឌ្ឍនភាពកើតចេញពីអ្វីដែលកិច្ចការបម្រើរបស់អ្នកកត់ត្រាជារៀងរាល់សប្តាហ៍ មិនមែនពីការធីកប្រអប់នៅទីនេះទេ។ |

### The editor

Staff can now write their own department's objectives from Me. Every form label
the editor uses is already translated (Objective, Key result, Measure by, Target,
Cancel, Save changes, Add objective, Delete, Edit, Saved, Saving…) — these five
are the new ones.

| English | ខ្មែរ |
|---|---|
| What are we aiming at this quarter? | តើយើងកំពុងតម្រង់ទៅរកអ្វីក្នុងត្រីមាសនេះ? |
| Give the objective a name first. | សូមដាក់ឈ្មោះឱ្យគោលដៅជាមុនសិន។ |
| Add at least one key result. | សូមបន្ថែមលទ្ធផលគន្លឹះយ៉ាងហោចណាស់មួយ។ |
| Delete this objective? | លុបគោលដៅនេះមែនទេ? |
| That didn't save — try again. | រក្សាទុកមិនបានទេ — សូមព្យាយាមម្តងទៀត។ |

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

## 0c-3b. The weekly check-in

The eleven weekly questions are back as a form, on the Health tab. The questions
themselves were already translated for the dashboard; these are the labels around
them, plus the mentor's view of a mentee's answers.

| English | ខ្មែរ |
|---|---|
| My check-in | ការរាយការណ៍របស់ខ្ញុំ  _(already reviewed)_ |
| Against last week | ធៀបនឹងសប្តាហ៍មុន |
| My weeks | សប្តាហ៍ទាំងឡាយរបស់ខ្ញុំ |
| From your weekly check-in | ពីការរាយការណ៍ប្រចាំសប្តាហ៍របស់អ្នក |
| Worked out from the days you logged | គណនាចេញពីថ្ងៃដែលអ្នកបានកត់ត្រា |
| Edit my answers | កែសម្រួលចម្លើយរបស់ខ្ញុំ |
| Hide the form | លាក់សំណុំបែបបទ |
| Clear this week | សម្អាតសប្តាហ៍នេះ |
| Clear this week's check-in? | សម្អាតការរាយការណ៍សប្តាហ៍នេះមែនទេ? |
| Answer the 1-10 questions first. | សូមឆ្លើយសំណួរ ១-១០ ជាមុនសិន។ |
| weekly check-in | ការរាយការណ៍ប្រចាំសប្តាហ៍ |
| from daily logs | ពីការកត់ត្រាប្រចាំថ្ងៃ |
| answer the week directly | ឆ្លើយសម្រាប់សប្តាហ៍ដោយផ្ទាល់ |
| Their weekly check-ins | ការរាយការណ៍ប្រចាំសប្តាហ៍របស់គាត់ |
| No check-ins yet. | មិនទាន់មានការរាយការណ៍នៅឡើយទេ។ |
| Base figures are totals only — no names. Your answers are shown by name to your mentor and to nobody else. | ចំនួនរបស់មូលដ្ឋានគឺជាចំនួនសរុបតែប៉ុណ្ណោះ — គ្មានឈ្មោះទេ។ ចម្លើយរបស់អ្នកត្រូវបានបង្ហាញជាមួយឈ្មោះទៅកាន់អ្នកណែនាំរបស់អ្នកតែម្នាក់គត់ ហើយគ្មាននរណាផ្សេងទៀតឡើយ។ |

_"weekly check-in" and "from daily logs" are small tags under a week, saying which
way that week was answered — lowercase on purpose. "Clear this week's check-in?" is
a confirm dialog, so it needs to read as a yes/no question. The last line is the
promise the page makes about who sees what; worth getting exactly right rather than
literal — the base total is nameless, and the reader's mentor is the one person who
sees their answers with their name on them._

## 0c-3. Health tab labels

What the Health tab needs beyond the weekly-check-in list above. The rest of its
labels — the eleven questions, the base-average rows, Staff Health Score, Checked in
this week — were already translated for the dashboard.

| English | ខ្មែរ |
|---|---|
| Health score out of 10 | ពិន្ទុសុខភាពលើ ១០ |
| this week | សប្តាហ៍នេះ |
| Loneliness (avg) | ភាពឯកោ (ជាមធ្យម) |
| Growth (avg) | ការរីកចម្រើន (ជាមធ្យម) |
| Language hours | ម៉ោងសិក្សាភាសា |
| Ministry hours | ម៉ោងកិច្ចការបម្រើ |

_The short "(avg)" labels are the reader's own figures — averaged across the days
they logged when a week came from daily logs, or simply their answer when they filled
the week in. The base section keeps the longer dashboard wording, which is an average
across people._

## 0d. One sentence for the Base tab

| English | ខ្មែរ |
|---|---|
| Every figure here is built from what each ministry logs each week — including yours. | រាល់ចំនួននៅទីនេះកើតចេញពីអ្វីដែលកិច្ចការបម្រើនីមួយៗកត់ត្រាជារៀងរាល់សប្តាហ៍ — រួមទាំងរបស់អ្នកផងដែរ។ |

_This is the line under the base figures that tells a staff member their own
weekly numbers are part of what they are looking at. Worth getting right rather
than literal._

## 0e. Goal progress, now a percentage

Weekly goals moved from a tick to a 0-100% slider, because ministry work is rarely
finished-or-not. These are the words under each slider — they say in words what the
colour says, for anyone who cannot tell the amber from the green.

| English | ខ្មែរ |
|---|---|
| End of week — how far did you get? | ចុងសប្តាហ៍ — តើអ្នកទៅដល់កម្រិតណាហើយ? |
| Drag each one — few weeks are all or nothing. | អូសនីមួយៗ — សប្តាហ៍ភាគច្រើនមិនមែនបានទាំងស្រុង ឬគ្មានទាល់តែសោះនោះទេ។ |
| Progress | វឌ្ឍនភាព |
| Not started | មិនទាន់ចាប់ផ្តើម |
| Just started | ទើបចាប់ផ្តើម |
| Under way | កំពុងដំណើរការ |
| Halfway | បានពាក់កណ្តាល |
| Almost there | ជិតដល់ហើយ |
| Done | រួចរាល់ |

_These six state words are read far more often than they are long, and each sits
directly under a number, so short beats literal — "Halfway" is labelling 50%, not
explaining it. "Progress" is the screen-reader label on the slider itself
("Progress: disciple two students"), so it needs to work as a noun. "Done" is
already in list 1 as a button label; if one Khmer word suits both, reuse it._

## 0f. Appearance, sharing and streaks

New controls from the dark-mode round. "Auto / Light / Dark" is a three-way choice
in Profile & settings; the rest are short one-line messages.

| English | ខ្មែរ |
|---|---|
| Appearance | រូបរាង |
| Auto | ស្វ័យប្រវត្តិ |
| Light | ភ្លឺ |
| Dark | ងងឹត |
| Auto follows your phone. | ស្វ័យប្រវត្តិនឹងតាមទូរស័ព្ទរបស់អ្នក។ |
| Share my week | ចែករំលែកសប្តាហ៍របស់ខ្ញុំ |
| goals | គោលដៅ |
| a week! | មួយសប្តាហ៍ហើយ! |
| a month! | មួយខែហើយ! |
| Card opened — press and hold to save it. | កាតត្រូវបានបើក — សូមចុចឱ្យជាប់ដើម្បីរក្សាទុក។ |
| Allow pop-ups to save the card. | សូមអនុញ្ញាតឱ្យបង្អួចលេចឡើង ដើម្បីរក្សាទុកកាតនេះ។ |
| This browser cannot make the card. | កម្មវិធីរុករកនេះមិនអាចបង្កើតកាតបានទេ។ |

_"Auto / Light / Dark" sit in a three-button row with roughly 10 characters each, so
short wins. "a week!" and "a month!" are appended to a streak chip that already reads
"🔥 7-day streak" — they are the celebration, not the count, so an exclamation that
sounds natural in Khmer matters more than a literal translation. The last three are
what shows after tapping Share my week on browsers that cannot hand the image
straight to the share sheet._

## 0g. When a save is refused

Logging ministry numbers now needs an account and is locked to your own campus, so
there are three new messages for when a save cannot go through.

| English | ខ្មែរ |
|---|---|
| You can only log numbers for your own campus. | អ្នកអាចកត់ត្រាចំនួនសម្រាប់តែសាខារបស់អ្នកផ្ទាល់ប៉ុណ្ណោះ។ |
| Your profile has no campus yet — add one on your profile page. | ប្រវត្តិរូបរបស់អ្នកមិនទាន់មានសាខាទេ — សូមបន្ថែមនៅទំព័រប្រវត្តិរូបរបស់អ្នក។ |
| Sign in again to save numbers. | សូមចូលគណនីម្តងទៀត ដើម្បីរក្សាទុកចំនួន។ |

_These appear in the orange bar at the top of the dashboard. The first is the common
one and should read as a rule rather than a telling-off — logging for the wrong campus
was an easy accident before, which is why the lock exists._

## 0g-2. The one-on-one, and staff debt — check the wording here carefully

**The one-on-one question changed shape, and the words are doing real work.**
"Did I have a one-on-one this week?" never said which side of it you were on —
giving one and getting one both got a yes. It is now two questions, and the one
you *receive* has three answers instead of two, because "no" was hiding two very
different weeks: my mentor never made time, or I never asked. Only the second is
mine to fix, and the wording has to make that land without sounding like a telling-off.

| English | ខ្មែរ | Note |
|---|---|---|
| Did I have my one-on-one this week? | តើខ្ញុំបានជួបមួយទល់មួយរបស់ខ្ញុំសប្តាហ៍នេះទេ? | **"my"** matters — it is the one you receive |
| Yes, we met | បាទ/ចាស យើងបានជួបគ្នា | Button — three across a phone, so short |
| I asked, not yet | ខ្ញុំបានស្នើសុំ ប៉ុន្តែមិនទាន់ | Button — "I did my part, it has not happened" |
| I have not asked | ខ្ញុំមិនទាន់បានស្នើសុំ | Button — should read as a fact, not a failing |
| Yours to arrange. If it has not happened, ask for it. | ជាតួនាទីរបស់អ្នកក្នុងការរៀបចំ។ បើវាមិនទាន់កើតឡើងទេ សូមស្នើសុំ។ | The line under the question. This is the whole point of the change — encouraging, not scolding |
| Did I give a one-on-one to someone this week? | តើខ្ញុំបានធ្វើមួយទល់មួយជាមួយនរណាម្នាក់សប្តាហ៍នេះទេ? | The other side: I mentored somebody |
| Got a one-on-one | បានទទួលមួយទល់មួយ | Daily habit tile — very little room |
| Got their one-on-one | បានទទួលមួយទល់មួយរបស់គាត់ | Base list |
| Got my one-on-one | បានទទួលមួយទល់មួយរបស់ខ្ញុំ | Base list, own view |
| Gave a one-on-one | បានធ្វើមួយទល់មួយឱ្យអ្នកដទៃ | |
| Their one-on-one | មួយទល់មួយរបស់គាត់ | Mentor's view of a mentee |
| One-on-ones got | មួយទល់មួយដែលបានទទួល | Stat tile |

### Asking for one

| English | ខ្មែរ | Note |
|---|---|---|
| Ask {name} for a one-on-one | ស្នើសុំ {name} សម្រាប់មួយទល់មួយ | Button — {name} is their mentor's first name, keep the placeholder |
| Asking… | កំពុងស្នើសុំ… | |
| Asked. It is on their Team tab now. | បានស្នើសុំ។ វាស្ថិតនៅលើផ្ទាំងក្រុមរបស់គាត់ហើយ។ | |
| Asked in week {wk}. Still waiting. | បានស្នើសុំក្នុងសប្តាហ៍ {wk}។ នៅតែរង់ចាំ។ | |
| Asked in week {wk} | បានស្នើសុំក្នុងសប្តាហ៍ {wk} | On the mentor's tab |
| You have no mentor yet — pick one on your profile, and this becomes one tap. | អ្នកមិនទាន់មានអ្នកណែនាំទេ — សូមជ្រើសរើសម្នាក់នៅលើប្រវត្តិរូបរបស់អ្នក រួចវានឹងក្លាយជាការចុចតែម្តង។ | |
| Asking for a one-on-one | ការស្នើសុំមួយទល់មួយ | Heading on the mentor's Team tab |
| They said in their check-in that their one-on-one has not happened, and asked. Clear it once you have met. | ពួកគេបាននិយាយក្នុងការរាយការណ៍របស់ខ្លួនថាមួយទល់មួយរបស់ពួកគេមិនទាន់កើតឡើងទេ ហើយបានស្នើសុំ។ សូមសម្អាតវានៅពេលអ្នកបានជួបគ្នារួច។ | |
| We met | យើងបានជួបគ្នា | Button the mentor presses |
| {n} waiting on you | {n} កំពុងរង់ចាំអ្នក | Keep {n} |

### Staff debt — how much

**These are money and they are private**, so they belong with the privacy promises
in section 0g. The app now asks the amount, not just yes/no. Please check that the
privacy sentence is unambiguous in Khmer — it is a promise the app is making.

| English | ខ្មែរ |
|---|---|
| How much? (US$) | ប៉ុន្មាន? (ដុល្លារអាមេរិក) |
| Pooled into one base total with no names on it. Your mentor sees your own figure; nobody else does. | ត្រូវបានបូកបញ្ចូលក្នុងសរុបមូលដ្ឋានតែមួយដោយគ្មានឈ្មោះ។ អ្នកណែនាំរបស់អ្នកឃើញតួលេខផ្ទាល់របស់អ្នក គ្មាននរណាផ្សេងឃើញទេ។ |
| Staff debt carried | បំណុលបុគ្គលិកដែលកំពុងទ្រាំទ្រ |
| {n} people, no names | {n} នាក់ គ្មានឈ្មោះ |

## 0h. Programs — the Ministry of Education report

**The most important section on this list to get right after the front door**, and
for a different reason: these words go into a document that leaves the building.
The four programme names are what the Ministry of Education, Youth and Sport calls
them in the signed agreements, so **if the agreements already have official Khmer
names, those are the right ones and these guesses should be replaced** — Uriah has
the paperwork.

| English | ខ្មែរ | Where it is |
|---|---|---|
| Programs | កម្មវិធី | The fourth tab on the dashboard — about 9 characters of room |
| Student Volunteer Internship | កម្មសិក្សាស្ម័គ្រចិត្តសិស្ស | Programme name (SVI), from the agreement |
| Youth Development Center | មជ្ឈមណ្ឌលអភិវឌ្ឍន៍យុវជន | Programme name (YDC), from the agreement |
| Youth Leadership Training | ការបណ្តុះបណ្តាលភាពជាអ្នកដឹកនាំយុវជន | Programme name (YLT), from the agreement |
| Youth Assistance Project | គម្រោងជំនួយយុវជន | Programme name (YAP), from the agreement |
| volunteers | អ្នកស្ម័គ្រចិត្ត | What SVI counts |
| students | សិស្ស | What YDC and YLT count |
| participants | អ្នកចូលរួម | What YAP counts |
| Outreach teams from other YWAM bases, churches and organisations — international teams and short-term volunteers. | ក្រុមផ្សព្វផ្សាយពីមូលដ្ឋាន YWAM ផ្សេងទៀត ព្រះវិហារ និងអង្គការនានា — ក្រុមអន្តរជាតិ និងអ្នកស្ម័គ្រចិត្តរយៈពេលខ្លី។ | What SVI covers |
| Educational and youth programmes: kids programmes, youth programmes, sports and preschool. | កម្មវិធីអប់រំ និងយុវជន៖ កម្មវិធីកុមារ កម្មវិធីយុវជន កីឡា និងមត្តេយ្យសិក្សា។ | What YDC covers |
| Leadership training schools — DTS, DBS and the other leadership schools. | សាលាបណ្តុះបណ្តាលភាពជាអ្នកដឹកនាំ — DTS, DBS និងសាលាភាពជាអ្នកដឹកនាំផ្សេងទៀត។ | What YLT covers |
| The pathway for young people becoming staff: dorm residents, new staff in their first 2–4 years, and young leaders being supported through education and mentoring. | ផ្លូវសម្រាប់យុវជនក្លាយជាបុគ្គលិក៖ អ្នកស្នាក់នៅអន្តេវាសិកដ្ឋាន បុគ្គលិកថ្មីក្នុងរយៈពេល ២–៤ ឆ្នាំដំបូង និងអ្នកដឹកនាំវ័យក្មេងដែលទទួលការគាំទ្រតាមរយៈការអប់រំ និងការណែនាំ។ | What YAP covers |
| Our four project agreements with the Ministry of Education, Youth and Sport. These records cover the whole base — both campuses — and are what the twice-yearly report is written from. | កិច្ចព្រមព្រៀងគម្រោងទាំងបួនរបស់យើងជាមួយក្រសួងអប់រំ យុវជន និងកីឡា។ កំណត់ត្រាទាំងនេះគ្របដណ្តប់មូលដ្ឋានទាំងមូល — សាខាទាំងពីរ — ហើយជាមូលដ្ឋានសម្រាប់សរសេររបាយការណ៍ពីរដងក្នុងមួយឆ្នាំ។ | Under the heading |
| Year | ឆ្នាំ | Picker label |
| Period | អំឡុងពេល | Picker label — records are entered by quarter, and the semester and year options add those quarters up |
| Quarter 1 | ត្រីមាសទី ១ | |
| Quarter 2 | ត្រីមាសទី ២ | |
| Quarter 3 | ត្រីមាសទី ៣ | |
| Quarter 4 | ត្រីមាសទី ៤ | |
| Semester 1 | ឆមាសទី ១ | Quarters 1 and 2 together |
| Semester 2 | ឆមាសទី ២ | Quarters 3 and 4 together |
| Whole year | ពេញមួយឆ្នាំ | |
| this quarter | ត្រីមាសនេះ | Goes inside "Nothing recorded yet for {when}." |
| this semester | ឆមាសនេះ | Same |
| this year | ឆ្នាំនេះ | Same |
| From your weekly numbers | ពីចំនួនប្រចាំសប្តាហ៍របស់អ្នក | Heading over the ministry rows — these figures come from what each ministry logs every week, not from anything typed on this screen |
| These come from what each ministry logs every week. The report reads them — nothing here is typed twice. | ទាំងនេះមកពីអ្វីដែលកិច្ចការបម្រើនីមួយៗកត់ត្រាជារៀងរាល់សប្តាហ៍។ របាយការណ៍អានវា — គ្មានអ្វីនៅទីនេះត្រូវវាយបញ្ចូលពីរដងទេ។ | |
| The middle column is this period. The box is that ministry’s estimate for the whole year — the four add up to the target in the report. | ជួរឈរកណ្តាលគឺអំឡុងពេលនេះ។ ប្រអប់នេះគឺជាការប៉ាន់ស្មានរបស់កិច្ចការបម្រើនោះសម្រាប់ពេញមួយឆ្នាំ — ទាំងបួនបូកគ្នាជាគោលដៅក្នុងរបាយការណ៍។ | |
| Annual estimate | ការប៉ាន់ស្មានប្រចាំឆ្នាំ | |
| Estimate for the year | ការប៉ាន់ស្មានសម្រាប់ឆ្នាំ | Form label |
| est. | ប៉ាន់ | Placeholder inside a very small box — about 5 characters |
| Save | រក្សាទុក | Button beside each ministry's estimate — short |
| No annual estimate entered for this year yet. | មិនទាន់មានការប៉ាន់ស្មានប្រចាំឆ្នាំសម្រាប់ឆ្នាំនេះទេ។ | |
| No weekly numbers behind this one | គ្មានចំណួនប្រចាំសប្តាហ៍នៅពីក្រោយកម្មវិធីនេះទេ | Heading, YAP only |
| No ministry logs a weekly figure for this programme, so its numbers are the ones typed below. | គ្មានកិច្ចការបម្រើណាកត់ត្រាចំនួនប្រចាំសប្តាហ៍សម្រាប់កម្មវិធីនេះទេ ដូច្នេះចំនួនរបស់វាគឺជាចំនួនដែលបានវាយបញ្ចូលខាងក្រោម។ | YAP only |
| Detail for the report | ព័ត៌មានលម្អិតសម្រាប់របាយការណ៍ | Heading |
| The parts a weekly number cannot hold — countries, dates, and how many were women. | ផ្នែកដែលចំនួនប្រចាំសប្តាហ៍មិនអាចផ្ទុកបាន — ប្រទេស កាលបរិច្ឆេទ និងចំនួនស្ត្រី។ | |
| Your ministries logged {logged} for this period; the detail below adds up to {typed}. The report will print {logged} — fill in the rest so the breakdown matches. | កិច្ចការបម្រើរបស់អ្នកបានកត់ត្រា {logged} សម្រាប់អំឡុងពេលនេះ ប៉ុន្តែព័ត៌មានលម្អិតខាងក្រោមបូកបានត្រឹម {typed}។ របាយការណ៍នឹងបោះពុម្ព {logged} — សូមបំពេញផ្នែកដែលនៅសល់ ដើម្បីឱ្យការបែងចែកត្រូវគ្នា។ | The orange banner. **Both {logged} must stay** — the same number appears twice on purpose |
| {n} of {t} so far this year | {n} ក្នុងចំណោម {t} គិតមកដល់ពេលនេះក្នុងឆ្នាំនេះ | Progress against the goal — keep both {n} and {t} |
| Nothing recorded yet for {when}. | មិនទាន់មានការកត់ត្រាសម្រាប់{when}ទេ។ | {when} is one of the three above — keep the placeholder |
| Pick a single quarter to add a record — a record belongs to the quarter it happened in. | ជ្រើសរើសត្រីមាសតែមួយដើម្បីបន្ថែមកំណត់ត្រា — កំណត់ត្រាមួយជាកម្មសិទ្ធិរបស់ត្រីមាសដែលវាបានកើតឡើង។ | Shown when a semester or the whole year is selected |
| New record | កំណត់ត្រាថ្មី | |
| Edit record | កែសម្រួលកំណត់ត្រា | |
| Add record | បន្ថែមកំណត់ត្រា | Button |
| + Add a team | + បន្ថែមក្រុម | Button, SVI |
| + Add a location | + បន្ថែមទីតាំង | Button, YDC and YAP |
| + Add a school | + បន្ថែមសាលា | Button, YLT |
| + Add a challenge | + បន្ថែមបញ្ហាប្រឈម | Button |
| optional | ស្រេចចិត្ត | Next to a field that may be left blank — very little room |
| Untitled | គ្មានចំណងជើង | A record saved with no name |
| From | មកពី | Before the list of countries teams came from |
| {m} men, {f} women | បុរស {m} នាក់, ស្ត្រី {f} នាក់ | Under every record — keep {m} and {f} |
| classes | ថ្នាក់ | In "6 classes · 48 men, 52 women" |
| Khmer | ខ្មែរ | In a cohort's breakdown |
| international | អន្តរជាតិ | In a cohort's breakdown |
| Please fill in | សូមបំពេញ | Followed by ": " and the name of the empty field |
| Sign in again to open Programs. | ចូលគណនីម្តងទៀតដើម្បីបើកកម្មវិធី។ | Error bar |
| Sign in again to save. | ចូលគណនីម្តងទៀតដើម្បីរក្សាទុក។ | Error bar |
| This screen could not load. Pull down to refresh. | អេក្រង់នេះមិនអាចផ្ទុកបានទេ។ ទាញចុះក្រោមដើម្បីធ្វើឱ្យស្រស់។ | |

### 0h-1b. Generating the report

The report itself is **not translated and should not be** — the document filed with
the Ministry is in English, and putting machine-translated Khmer that nobody has
read into a government submission is not a risk worth taking. These are only the
buttons around it.

| English | ខ្មែរ |
|---|---|
| Generate the Ministry report | បង្កើតរបាយការណ៍ជូនក្រសួង |
| Writes the report for the period above from your weekly numbers, with the detail entered here filling in the parts a weekly figure cannot hold. It opens as a draft — read it before it is sent. | សរសេររបាយការណ៍សម្រាប់អំឡុងពេលខាងលើពីចំនួនប្រចាំសប្តាហ៍របស់អ្នក ដោយព័ត៌មានលម្អិតដែលបញ្ចូលនៅទីនេះបំពេញផ្នែកដែលចំនួនប្រចាំសប្តាហ៍មិនអាចផ្ទុកបាន។ វាបើកជាសេចក្តីព្រាង — សូមអានវាមុនពេលផ្ញើ។ |
| Ministry report | របាយការណ៍ជូនក្រសួង |
| Copy for Google Docs | ចម្លងសម្រាប់ Google Docs |
| Download | ទាញយក |
| Print | បោះពុម្ព |
| A draft, in English — this document goes to the Ministry, so it is not machine-translated. The prose around the numbers is carried over from the last report; read it and edit it in the Doc before sending. | សេចក្តីព្រាង ជាភាសាអង់គ្លេស — ឯកសារនេះផ្ញើទៅក្រសួង ដូច្នេះវាមិនត្រូវបានបកប្រែដោយម៉ាស៊ីនទេ។ អត្ថបទជុំវិញតួលេខត្រូវបានយកមកពីរបាយការណ៍លើកមុន សូមអាន និងកែសម្រួលវានៅក្នុង Doc មុនពេលផ្ញើ។ |
| Copied — paste into a Doc | បានចម្លង — សូមបិទភ្ជាប់ក្នុង Doc |
| Copied as plain text | បានចម្លងជាអត្ថបទធម្មតា |
| Use Download instead | សូមប្រើ ទាញយក ជំនួសវិញ |

_The last three are what the Copy button says back to you after you press it, so
they replace a button label and have that much room — about 20 characters._

### 0h-2. The challenges section

Uriah's instruction for this section is the point of it, so the wording matters:
_"Don't write about lack of staff because every organization needs more staff.
Write about current challenges you are facing."_ The second sentence below is
that instruction, on screen, and it should read as guidance rather than a scolding.

| English | ខ្មែរ |
|---|---|
| Challenges | បញ្ហាប្រឈមនានា |
| Challenges and solutions | បញ្ហាប្រឈម និងដំណោះស្រាយ |
| What we are actually up against this quarter, and what we did about it — lower volunteer numbers, conflict, fewer teachers, students who stop coming. | អ្វីដែលយើងកំពុងជួបប្រទះពិតប្រាកដក្នុងត្រីមាសនេះ និងអ្វីដែលយើងបានធ្វើចំពោះវា — ចំនួនអ្នកស្ម័គ្រចិត្តតិច ជម្លោះ គ្រូបង្រៀនតិច សិស្សឈប់មករៀន។ |
| Not "we need more staff" — every organisation needs more staff, and it tells the reader nothing. | មិនមែន «យើងត្រូវការបុគ្គលិកបន្ថែម» ទេ — គ្រប់អង្គការសុទ្ធតែត្រូវការបុគ្គលិកបន្ថែម ហើយវាមិនប្រាប់អ្វីដល់អ្នកអានឡើយ។ |
| Nothing written yet for {when}. | មិនទាន់មានការសរសេរសម្រាប់{when}ទេ។ |
| Challenge | បញ្ហាប្រឈម |
| What we did about it | អ្វីដែលយើងបានធ្វើចំពោះវា |

### 0h-3. The record forms

These are the field labels on the four data-entry forms, and the grey example text
inside each box. **They are what a ministry leader reads while typing the figures
the Ministry sees**, so an ambiguous label here becomes a wrong number in the
report. Labels sit two to a line on a phone — about 14–16 characters before they
wrap.

| English | ខ្មែរ | Which form |
|---|---|---|
| Team name | ឈ្មោះក្រុម | SVI |
| e.g. YWAM Maui | ឧ. YWAM Maui | SVI, example text |
| Country of origin | ប្រទេសដើម | SVI |
| e.g. USA | ឧ. សហរដ្ឋអាមេរិក | SVI, example text |
| Arrived | មកដល់ | SVI, a date |
| Left | ចាកចេញ | SVI, a date |
| Men on the team | បុរសក្នុងក្រុម | SVI |
| Women on the team | ស្ត្រីក្នុងក្រុម | SVI |
| Boys/men served | ក្មេងប្រុស/បុរសដែលបានបម្រើ | SVI — people the team served, not the team itself |
| Girls/women served | ក្មេងស្រី/ស្ត្រីដែលបានបម្រើ | SVI |
| What they did | អ្វីដែលពួកគេបានធ្វើ | SVI |
| Teaching, community outreach, refugee relief… | ការបង្រៀន ការផ្សព្វផ្សាយសហគមន៍ ជំនួយជនភៀសខ្លួន… | SVI, example text |
| Location | ទីតាំង | YDC and YAP |
| e.g. Poipet YDC | ឧ. YDC ប៉ោយប៉ែត | YDC, example text |
| Classes running | ថ្នាក់ដែលកំពុងបើក | YDC |
| Male students | សិស្សប្រុស | YDC |
| Female students | សិស្សស្រី | YDC |
| Notes | កំណត់ចំណាំ | all forms |
| School / cohort | សាលា / ជំនាន់ | YLT |
| e.g. GPDTS Sept 2026 | ឧ. GPDTS ខែកញ្ញា ២០២៦ | YLT, example text |
| International students | សិស្សអន្តរជាតិ | YLT |
| Khmer students | សិស្សខ្មែរ | YLT |
| Male staff | បុគ្គលិកប្រុស | YLT |
| Female staff | បុគ្គលិកស្រី | YLT |
| International staff | បុគ្គលិកអន្តរជាតិ | YLT |
| Khmer staff | បុគ្គលិកខ្មែរ | YLT |
| Outreach locations | ទីតាំងផ្សព្វផ្សាយ | YLT |
| One per line | មួយក្នុងមួយជួរ | YLT, example text |
| e.g. Saang District dormitory | ឧ. អន្តេវាសិកដ្ឋានស្រុកសាង | YAP, example text |
| Male participants | អ្នកចូលរួមប្រុស | YAP |
| Female participants | អ្នកចូលរួមស្រី | YAP |
| Support for sponsor families | ការគាំទ្រសម្រាប់គ្រួសារឧបត្ថម្ភ | YAP |
| Estimate for the year | ការប៉ាន់ស្មានសម្រាប់ឆ្នាំ | The annual-estimate form |
| Counted in | រាប់ជា | The unit the estimate is counted in |

## 1. Words and labels

Fill the right column:

| English | ខ្មែរ |
|---|---|
| Your team can see these on your profile. Anything personal belongs in the private check-in instead. | ក្រុមរបស់អ្នកអាចមើលឃើញទាំងនេះនៅលើប្រវត្តិរូបរបស់អ្នក។ រឿងផ្ទាល់ខ្លួនគួរដាក់ក្នុងការរាយការណ៍ឯកជនវិញ។ |
| Home | ទំព័រដើម |
| Team | ក្រុម |
| Me | ខ្ញុំ |
| Done | រួចរាល់ |
| Save today | រក្សាទុកថ្ងៃនេះ |
| Save goals | រក្សាទុកគោលដៅ |
| Profile & settings | ប្រវត្តិរូប និងការកំណត់ |
| Log out | ចាកចេញ |
| My progress | វឌ្ឍនភាពរបស់ខ្ញុំ |
| Streaks | លំដាប់ជាប់ៗគ្នា |
| This week | សប្តាហ៍នេះ |
| Recent days | ថ្ងៃថ្មីៗ |
| Bible reading | ការអានព្រះគម្ពីរ |
| Quiet time / prayer | ពេលស្ងប់ស្ងាត់ / ការអធិស្ឋាន |
| Workout | ការហាត់ប្រាណ |
| Ate well | បរិភោគបានល្អ |
| Slept well | គេងបានល្អ |
| Language study | ការសិក្សាភាសា |
| Gratitude | ការដឹងគុណ |
| One-on-one | ការជួបជជែកផ្ទាល់ខ្លួន |
| Shared my faith | បានចែកចាយជំនឿរបស់ខ្ញុំ |
| Sabbath / rest | សប្ប័ទ / ការសម្រាក |
| moves | ជំរុញ |
| today | ថ្ងៃនេះ |
| Choose my habits | ជ្រើសរើសទម្លាប់របស់ខ្ញុំ |
| Set this week’s goals | កំណត់គោលដៅសម្រាប់សប្តាហ៍នេះ |
| Edit goals | កែសម្រួលគោលដៅ |
| Show all | បង្ហាញទាំងអស់ |
| Welcome back | សូមស្វាគមន៍ការត្រឡប់មកវិញ |
| Username | ឈ្មោះអ្នកប្រើ |
| PIN | លេខសម្ងាត់ (PIN) |
| Log in | ចូលគណនី |
| Create my profile | បង្កើតប្រវត្តិរូបរបស់ខ្ញុំ |
| Full name | ឈ្មោះពេញ |
| Campus | សាខា |
| Role / team | តួនាទី / ក្រុម |
| Phone | លេខទូរស័ព្ទ |
| Save profile | រក្សាទុកប្រវត្តិរូប |
| Update PIN | ធ្វើបច្ចុប្បន្នភាពលេខសម្ងាត់ |
| Good morning | អរុណសួស្តី |
| Good afternoon | ទិវាសួស្តី |
| Good evening | សាយណ្ហសួស្តី |
| Hours, mood & private | ម៉ោង អារម្មណ៍ និងរឿងឯកជន |
| Not logged yet | មិនទាន់បានកត់ត្រា |
| Language study today | ការសិក្សាភាសាថ្ងៃនេះ |
| Community ministry today | កិច្ចការបម្រើក្នុងសហគមន៍ថ្ងៃនេះ |
| Pick the ones I log daily | ជ្រើសរើសអ្វីដែលខ្ញុំកត់ត្រាជារៀងរាល់ថ្ងៃ |
| Change which I log daily | ប្តូរអ្វីដែលខ្ញុំកត់ត្រាជារៀងរាល់ថ្ងៃ |
| My mentees | អ្នកដែលខ្ញុំណែនាំ |
| Mentor requests | សំណើសុំអ្នកណែនាំ |
| Accept | ទទួលយក |
| Decline | បដិសេធ |

_Already translated, no action: Dashboard, Cancel, Department, Ministry_

## 2. Sentences with numbers in them

These used to be built by gluing fragments around a number, which meant there was
no sentence to hand a translator at all. The code now uses `gpT('...', {n: 4})`, so
each one is a whole sentence with {placeholders} that can move wherever Khmer wants
them. **Keep the {placeholders} exactly as they are** — a test fails if one is
dropped, because the number would vanish from the screen.

| English template | ខ្មែរ |
|---|---|
| My {n} goals · week {wk} | គោលដៅ {n} របស់ខ្ញុំ · សប្តាហ៍ {wk} |
| {done} of {total} done | រួចរាល់ {done} ក្នុងចំណោម {total} |
| {n} of 7 days logged | បានកត់ត្រា {n} ថ្ងៃ ក្នុងចំណោម ៧ ថ្ងៃ |
| {n} days logged · {m} more for your score | បានកត់ត្រា {n} ថ្ងៃ · ត្រូវការ {m} ថ្ងៃទៀត ដើម្បីបានពិន្ទុ |
| Health score out of 10, from the {n} days you logged | ពិន្ទុសុខភាពលើ ១០ គិតពី {n} ថ្ងៃដែលអ្នកបានកត់ត្រា |
| Show all {total} ({hidden} hidden) | បង្ហាញទាំង {total} ({hidden} ត្រូវបានលាក់) |
| {n}-day streak | ជាប់គ្នា {n} ថ្ងៃ |
| best {n} days | ល្អបំផុត {n} ថ្ងៃ |
| Week {wk} · {n} staff | សប្តាហ៍ {wk} · បុគ្គលិក {n} នាក់ |
