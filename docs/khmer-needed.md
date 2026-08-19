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

## 0c-0. Who the staff are — kind of staff, and where from

The staff number on Base and on the dashboard now breaks down two ways: what kind
of staff someone is, and where they are from. Both are asked when a profile is
created and changed from Profile & settings.

| English | ខ្មែរ |
|---|---|
| What kind of staff are you? | តើអ្នកជាបុគ្គលិកប្រភេទណា? |
| Campus staff | បុគ្គលិកសាខា |
| Ministry staff | បុគ្គលិកកិច្ចការបម្រើ |
| The base counts campus staff, YAP and ministry staff separately. | មូលដ្ឋានរាប់បុគ្គលិកសាខា YAP និងបុគ្គលិកកិច្ចការបម្រើដោយឡែកពីគ្នា។ |
| Home country | ប្រទេសកំណើត |
| Country | ប្រទេស |
| — choose — | — ជ្រើសរើស — |
| Other… | ផ្សេងទៀត… |
| Counted as how many Khmer, how many international, and how many countries. | រាប់ជាចំនួនខ្មែរ ចំនួនបរទេស និងចំនួនប្រទេស។ |
| Where we are from | យើងមកពីណាខ្លះ |
| Khmer | ខ្មែរ |
| international | បរទេស |
| Nobody has said where they are from yet. | មិនទាន់មាននរណាម្នាក់បានប្រាប់ថាមកពីណានៅឡើយទេ។ |
| Say what kind of staff you are and where you are from — it is what these numbers count. | សូមប្រាប់ថាអ្នកជាបុគ្គលិកប្រភេទណា និងមកពីប្រទេសណា — នេះជាអ្វីដែលចំនួនទាំងនេះរាប់។ |
| Add it to my profile | បញ្ចូលទៅក្នុងប្រវត្តិរូបរបស់ខ្ញុំ |

_Three things worth your eye here. **"YAP" is deliberately not in the dictionary** —
it is the programme's own name, so it stays as it is; tell Uriah if it should be
written in Khmer instead. **"Campus" and "Ministry" already have Khmer** (សាខា,
កិច្ចការបម្រើព្រះ) and are reused as the short chip labels next to the staff number —
worth checking they still read right as a count of people rather than of places.
**Country names are not translated at all**: the picker is a list of forty
Latin-script names, and a list half in Khmer would read worse than one that is
plainly not translated. If the team wants them in Khmer that is its own job._

## 0c-0c. The ministry numbers on My week

My week now carries every KPI the dashboard's log form asks of your ministry, in
two cards: what happened today (things you count) and what is true of the whole
week (headcounts and 1-10 scores, filled in from last week already).

| English | ខ្មែរ |
|---|---|
| Headcounts and scores for the week. The ones that rarely change are already filled in from last time — only change what changed. | ចំនួនមនុស្ស និងពិន្ទុសម្រាប់សប្តាហ៍នេះ។ អ្វីដែលកម្រផ្លាស់ប្តូរត្រូវបានបំពេញស្រាប់ពីលើកមុន — សូមកែតែអ្វីដែលបានផ្លាស់ប្តូរប៉ុណ្ណោះ។ |
| last week | សប្តាហ៍មុន |

_Everything else in those two cards reuses Khmer you have already checked: "week
total", "now", "avg", "carried from week", "Save today" and "Save Week" all come
from the dashboard's own log form, which is the point — it is the same form, on
the person's own page._

_"last week" appears in every row that has an earlier week to compare with —
"week total $140 · last week $120 ▲ 17%" — on My week and on the dashboard's log
form. When the previous figure is older than last week the row names the week
instead ("week 31"), so this phrase is only used when it is literally true._

## 0c-0b. The same, with numbers in them

| English template | ខ្មែរ |
|---|---|
| {n} Khmer | ខ្មែរ {n} នាក់ |
| {n} international | បរទេស {n} នាក់ |
| {n} countries | {n} ប្រទេស |
| {n} not said yet | {n} មិនទាន់បានប្រាប់ |
| {n} more staff have no profile yet | បុគ្គលិក {n} នាក់ទៀតមិនទាន់មានប្រវត្តិរូប |
| {n} still to say where they are from | {n} នាក់មិនទាន់បានប្រាប់ថាមកពីណា |

_The first three sit on one line under the big staff number — "5 Khmer · 4
international · 3 countries" — and that line is a button that opens the full list
of countries. The last two are the honest small print: the first when the base has
logged more staff than there are profiles, the second inside the country list._

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

## 3. My Database — the merged My week + Me tab

My week and Me are now one tab, "My Database," with a quick-jump chip bar at
the top so you can still get straight to one section instead of scrolling past
everything above it. These seven strings are the new tab label and six of the
chips — the "OKRs" chip reuses the term already reviewed in section 0c-2
above rather than adding a new entry. Each chip is a button with limited
width, so keep translations short — these are the shortest labels in the app
after the tab bar itself.

| English | ខ្មែរ |
|---|---|
| My Database | ទិន្នន័យរបស់ខ្ញុំ |
| Weekly Goals | គោលដៅប្រចាំសប្តាហ៍ |
| Habit Tracker | ការតាមដានទម្លាប់ |
| My Health | សុខភាពរបស់ខ្ញុំ |
| Leave | ការចាកឆ្ងាយ |
| Mentorship | ការណែនាំ |
| Account | គណនី |

## 4. Add-to-Home-Screen nudge

A small dismissible bar that appears under the header the first time someone
opens the app in a regular browser tab (not yet running as an installed,
full-screen app). It shows one of these two messages depending on the device,
plus a button and a dismiss "✕". "Install" is the button label — keep it
short, it's a pill button next to the message text.

| English | ខ្មែរ |
|---|---|
| Install | ដំឡើង |
| Dismiss | បិទ |
| Add this to your Home Screen: tap Share, then "Add to Home Screen". | បន្ថែមកម្មវិធីនេះទៅអេក្រង់ដើម៖ ចុច ចែករំលែក រួចជ្រើសរើស "បន្ថែមទៅអេក្រង់ដើម"។ |
| Install this app for the full-screen experience. | ដំឡើងកម្មវិធីនេះ ដើម្បីទទួលបទពិសោធន៍ពេញអេក្រង់។ |

## 5. Base health — quarter and year breakdown

The Base health card on the Health tab used to show only "this week" and a
running year-to-date figure. It now has a "View" picker — Week / Quarter /
Year — so someone can see the same stats grouped by quarter or by whole year
instead of just one week at a time. "View" labels the picker itself (a short
dropdown label, like "Quarter" already on the OKR screen). "Check-ins logged"
replaces the week-only "Checked in this week" stat once the view is a quarter
or a year, since "how many people checked in" only means something for one
specific week.

| English | ខ្មែរ |
|---|---|
| View | ទិដ្ឋភាព |
| Year | ឆ្នាំ |
| Check-ins logged | ការរាយការណ៍ដែលបានកត់ត្រា |
