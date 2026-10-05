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

## 6. Base tab — collapsible sections, and Base Health added there too

Every section on Base below the profile/hero now collapses, matching the
redesign mockup: a closed row shows one summary line instead of its full
figures, and "Tap to collapse" is what an open row's summary line says instead.
Base also gets its own copy of Base Health (the same wellbeing stats already
on the Health tab), with a row of period chips — This Week, Q1–Q4, Year (YTD)
— instead of a dropdown, so it fits the accordion's tap-to-browse feel. It's a
second, independent view of the same data; nothing was removed from the
Health tab.

The summary lines are whole sentences with the count baked in ({n}, {d}, {s},
{p}, {f}) rather than English fragments glued together, so a translator gets
one line to work with and can put the number wherever Khmer sentence order
wants it — the same reason `gpT()` exists elsewhere in this app.

| English | ខ្មែរ |
|---|---|
| Tap to collapse | ចុចដើម្បីបិទ |
| Base Health | សុខភាពរបស់មូលដ្ឋាន |
| This Week | សប្តាហ៍នេះ |
| Year (YTD) | ឆ្នាំ (រហូតដល់បច្ចុប្បន្ន) |
| Score {n}/10 · {pct}% checked in | ពិន្ទុ {n}/10 · {pct}% បានរាយការណ៍ |
| Score {n}/10 | ពិន្ទុ {n}/10 |
| {n} YTD across {d} departments | {n} រហូតដល់បច្ចុប្បន្ន នៅទូទាំង {d} នាយកដ្ឋាន |
| {s} schools running · {n} enrolled | សាលា {s} កំពុងដំណើរការ · សិស្ស {n} នាក់ចុះឈ្មោះ |
| {n} teams hosted · {m} people served | ក្រុម {n} ដែលបានទទួលរៀបចំ · មនុស្ស {m} នាក់ដែលបានបម្រើ |
| {n} churches partnered | ក្រុមជំនុំ {n} ដែលបានចាប់ដៃគូ |
| {p} platforms · {f} followers | វេទិកា {p} · អ្នកតាមដាន {f} នាក់ |
| Department leaders' own figures | ចំនួនផ្ទាល់ខ្លួនរបស់ប្រធាននាយកដ្ឋាន |
| Browse any department's own numbers | រកមើលចំនួនផ្ទាល់ខ្លួនរបស់នាយកដ្ឋានណាមួយ |

"Base Leadership" (the accordion row for the department-leader KPIs — Staff
Debt, One-on-Ones Held, etc. — previously titled "Base health" on this
screen, renamed here to not collide with the new Base Health row) reuses the
department name already translated elsewhere in the app, so it isn't
repeated in this table.

A few section titles are also re-cased or renamed to match the mockup exactly
— the Khmer doesn't change (Khmer has no letter case), so these reuse an
existing translation under the new, differently-cased or reworded English key:

| English (new key on Base) | Reuses the Khmer already at… |
|---|---|
| Salvations by Department | "Salvations by department" |
| Leadership Development Schools | "Leadership Development schools" |
| Community Schools | "Community schools" |
| Local Church Partnerships | "Local church partnerships" |

Two are real renames, not just re-casing, and got their own new translation:

| English | ខ្មែរ |
|---|---|
| Gospel Totals | សរុបដំណឹងល្អ |
| Department Explorer | ការរុករកតាមផ្នែក |

(Both replace a heading that still exists, unchanged, on the leadership
dashboard — "Across every ministry" and "Department dashboards" respectively
— which this redesign pass didn't touch.)

## 7. My Database — reordered, plus a new Mentorship card

My Database's sections now follow a fixed order (Weekly Goals, Habit
Tracker, OKRs, Mentorship, My Health, Leave, Account) instead of the old
day-dependent one. The one genuinely new piece is a Mentorship card: who you
mentor, and who mentors you — previously that only lived on the Team tab's
own Mentor screen; now there's a summary here too, with an arrow to open a
mentee's full page.

| English | ខ្មែរ |
|---|---|
| You're Mentoring | អ្នកកំពុងណែនាំ |
| Your Mentor | អ្នកណែនាំរបស់អ្នក |
| Open their database | បើកទិន្នន័យរបស់គាត់ |
| You're not mentoring anyone yet. | អ្នកមិនទាន់កំពុងណែនាំនរណាម្នាក់នៅឡើយទេ។ |
| No mentor set yet. | មិនទាន់បានកំណត់អ្នកណែនាំនៅឡើយទេ។ |

## 8. Weekly Goals — mockup layout (week nav, Last/This week cards, add/remove)

Weekly Goals was rebuilt to match the mockup: a week-navigation card (prev
arrow / week pill with a "Current Week" tag / next arrow), a read-only
"Last week" card, and a "This week" card where each goal has a slider, a
"Mark Complete" button, and a remove button, plus an input to add a new goal
(up to three, matching the existing three-goal limit).

| English | ខ្មែរ |
|---|---|
| Previous week | សប្តាហ៍មុន |
| Next week | សប្តាហ៍ក្រោយ |
| Current Week | សប្តាហ៍បច្ចុប្បន្ន |
| Week {wk} | សប្តាហ៍ {wk} |
| Review last week, plan this week. | ពិនិត្យសប្តាហ៍មុន ហើយរៀបចំផែនការសប្តាហ៍នេះ។ |
| Jump back to this week | ត្រឡប់ទៅសប្តាហ៍នេះវិញ |
| Last week | សប្តាហ៍មុន |
| You didn't set goals last week. | អ្នកមិនបានកំណត់គោលដៅសម្រាប់សប្តាហ៍មុនទេ។ |
| Mark Complete | សម្គាល់ថារួចរាល់ |
| Remove goal | ដកគោលដៅចេញ |
| No goals set for this week yet. Three is the whole point — pick the three that matter. | មិនទាន់មានគោលដៅសម្រាប់សប្តាហ៍នេះនៅឡើយទេ។ បីគឺជាចំណុចសំខាន់ — សូមជ្រើសរើសបីដែលសំខាន់បំផុត។ |
| Add a goal for this week… | បន្ថែមគោលដៅសម្រាប់សប្តាហ៍នេះ… |
| Add goal | បន្ថែមគោលដៅ |

The old "Edit goals" flow (three always-shown text fields, a metric picker,
Save/Cancel) is gone — goals are added and removed one at a time now,
matching the mockup, so `"Edit goals"` and `"Set this week's goals"` are no
longer used anywhere in the code but stay in the dictionary as harmless
leftovers.

## 9. Leave Request — full screen, matching the mockup

Leave Request is now its own screen (reached from a tappable entry card on
My Database, like Profile & Settings already was) instead of the old inline
"Away from campus" card. It adds a Personal Time Off allowance tracker
(30 work days/year, with Working Outside Siem Reap and Special Condition
tracked separately and uncapped), a request form with a leave-type picker,
reason/coverage text fields, and an acknowledgement checkbox, plus an
"Awaiting Your Approval" section for mentors and a "My Requests" history.

This replaces the old two-kind (work/personal) trip model server-side; a
trip logged before this shipped still reads correctly (its `kind` maps onto
the new `type`), it just displays as "Working Outside Siem Reap" for a
former "work" trip.

| English | ខ្មែរ |
|---|---|
| Baked into My GP — nothing to fill out on another site. | បង្កប់នៅក្នុង My GP រួចហើយ — មិនចាំបាច់បំពេញនៅគេហទំព័រផ្សេងទៀតទេ។ |
| Personal Time Off | ថ្ងៃឈប់សម្រាកផ្ទាល់ខ្លួន |
| UofN Cambodia allocates a maximum of 6 weeks (30 work days) off per year for vacation, furlough, support raising and home visits. | UofN កម្ពុជា បម្រុងទុកអតិបរមា ៦ សប្តាហ៍ (៣០ ថ្ងៃធ្វើការ) ក្នុងមួយឆ្នាំ សម្រាប់ការឈប់សម្រាក ការត្រឡប់ទៅផ្ទះ ការរៃអង្គាសមូលនិធិ និងការទស្សនាគ្រួសារ។ |
| / {cap} days used | / {cap} ថ្ងៃបានប្រើ |
| Working Outside Siem Reap | ធ្វើការនៅក្រៅសៀមរាប |
| Special Condition | លក្ខខណ្ឌពិសេស |
| Not capped, tracked separately | មិនកំណត់ដែនកំណត់ទេ តាមដានដោយឡែក |
| Counts against your 30-day allowance | រាប់ចូលក្នុងកម្រិតកំណត់ ៣០ ថ្ងៃរបស់អ្នក |
| Awaiting Your Approval | កំពុងរង់ចាំការអនុម័តរបស់អ្នក |
| Pending | កំពុងរង់ចាំ |
| Deny | បដិសេធ |
| {n} work days | {n} ថ្ងៃធ្វើការ |
| New Request | សំណើថ្មី |
| Leave Dates | កាលបរិច្ឆេទឈប់សម្រាក |
| work days requested (Mon–Fri) | ថ្ងៃធ្វើការដែលបានស្នើ (ច័ន្ទ–សុក្រ) |
| Leave Type | ប្រភេទការឈប់សម្រាក |
| This request would put you over your 30-day Personal Time Off allowance for the year. | សំណើនេះនឹងធ្វើឱ្យអ្នកលើសកម្រិតកំណត់ ៣០ ថ្ងៃនៃការឈប់សម្រាកផ្ទាល់ខ្លួនប្រចាំឆ្នាំ។ |
| Why are you requesting this leave? | ហេតុអ្វីបានជាអ្នកស្នើសុំការឈប់សម្រាកនេះ? |
| Ministry Coverage | អ្នកគ្របដណ្តប់កិច្ចការបម្រើ |
| Who will cover your ministries while you're away? | នរណានឹងគ្របដណ្តប់កិច្ចការបម្រើរបស់អ្នក ខណៈពេលអ្នកចាកឆ្ងាយ? |
| In-country leave needs at least 1 week notice · out-of-country leave needs at least 1 month notice. | ការឈប់សម្រាកក្នុងប្រទេសត្រូវការជូនដំណឹងយ៉ាងតិច ១ សប្តាហ៍ · ការឈប់សម្រាកក្រៅប្រទេសត្រូវការជូនដំណឹងយ៉ាងតិច ១ ខែ។ |
| I understand the 6-week (30-day) allowance for personal time off. | ខ្ញុំយល់ដឹងអំពីកម្រិតកំណត់ ៦ សប្តាហ៍ (៣០ ថ្ងៃ) សម្រាប់ការឈប់សម្រាកផ្ទាល់ខ្លួន។ |
| Send to {name} for Approval | ផ្ញើទៅ {name} ដើម្បីអនុម័ត |
| Save this request | រក្សាទុកសំណើនេះ |
| My Requests | សំណើរបស់ខ្ញុំ |
| Denied / Approved / Noted | បានបដិសេធ / បានអនុម័ត / បានកត់ត្រា |
| No requests yet. | មិនទាន់មានសំណើនៅឡើយទេ។ |
| Pick both dates / Pick a leave type | សូមជ្រើសរើសកាលបរិច្ឆេទទាំងពីរ / សូមជ្រើសរើសប្រភេទការឈប់សម្រាក |
| Please confirm you understand the allowance. | សូមបញ្ជាក់ថាអ្នកយល់ដឹងអំពីកម្រិតកំណត់នេះ។ |

## 10. Weekly Goals layout fixes + ministry KPIs collapsed

Two fixes to the Weekly Goals rebuild from section 8: the progress slider
was rendering at the browser's tiny default size (no `input[type=range]`
styling existed yet) instead of the mockup's full-width track, and the week
pill/card headers showed a bare week number instead of an actual date
range. Both now match the mockup: full-width sliders with a colored fill,
and "Week of Aug 17 – 23, 2026"-style labels computed from the week number.

The "log your ministry's numbers" cards (daily counts + weekly levels) are
now collapsed into an accordion too, matching the Base tab's pattern,
instead of always sitting open and pushing everything else down the page.

| English | ខ្មែរ |
|---|---|
| Week of {range}, {year} | សប្តាហ៍នៃ {range}, {year} |
| {n} to log today | {n} ត្រូវកត់ត្រាថ្ងៃនេះ |
| {n} for week {wk} | {n} សម្រាប់សប្តាហ៍ {wk} |

## 11. Ministry Tracker jump chip, red→yellow→green slider

Two more from the same round: the goal-progress slider now uses a real
red→yellow→green gauge (a continuous hue sweep) instead of the discrete
warm/amber/cobalt/green bands the rings use — those stayed as-is, only the
slider changed. And the quick-jump bar gained a "Ministry Tracker" chip,
since the collapsible KPI card now needs one to reach it without scrolling.

| English | ខ្មែរ |
|---|---|
| Ministry Tracker | កម្មវិធីតាមដានកិច្ចការបម្រើ |
| {n} for {range} | {n} សម្រាប់ {range} |

## 12. Annual Goals (SMART) — new feature

A personal, year-and-category goal list, matching the mockup: a year
picker, six fixed categories (Faith, Health, Finance, Language, Skills,
Fun), and add/edit/delete for each goal (title, an optional freeform detail
line, and a percent). Nothing here feeds any base or ministry figure.

| English | ខ្មែរ |
|---|---|
| Annual Goals | គោលដៅប្រចាំឆ្នាំ |
| Annual Goals · SMART | គោលដៅប្រចាំឆ្នាំ · SMART |
| Previous year / Next year | ឆ្នាំមុន / ឆ្នាំក្រោយ |
| Faith / Finance / Language / Skills / Fun | ជំនឿ / ហិរញ្ញវត្ថុ / ភាសា / ជំនាញ / កម្សាន្ត |
| No goals set for this category yet. | មិនទាន់មានគោលដៅសម្រាប់ប្រភេទនេះនៅឡើយទេ។ |
| New goal / Goal / Detail (optional) | គោលដៅថ្មី / គោលដៅ / សេចក្តីលម្អិត (ស្រេចចិត្ត) |
| What are you aiming for this year? | តើអ្នកកំពុងសំដៅទៅរកអ្វីក្នុងឆ្នាំនេះ? |
| e.g. Measurable · by Dec 2026 | ឧ. អាចវាស់វែងបាន · មុនខែធ្នូ ២០២៦ |
| Give the goal a title first. | សូមដាក់ចំណងជើងឱ្យគោលដៅជាមុនសិន។ |
| Delete this goal? | លុបគោលដៅនេះមែនទេ? |

## 13. Mentors see the whole database, not just shared habits

A mentor relationship is now full consent, not partial: the per-habit
"private / mentor sees" toggle is gone (it always showed all habits to the
mentor from here on, so a toggle that did nothing would just be confusing).
A mentee's ministry KPI numbers, Annual Goals, and Leave history are now
visible on their mentor's mentee-detail page too, read-only.

| English | ខ្មែរ |
|---|---|
| Pick up to {n}. | ជ្រើសរើសបានរហូតដល់ {n}។ |
| {name}'s habits | ទម្លាប់របស់ {name} |
| previous 7 days | ៧ ថ្ងៃមុន |
| first week of data | សប្តាហ៍ដំបូងនៃទិន្នន័យ |

## 14. Personal dashboard — at the top of My Database

A small at-a-glance card now sits above everything else on My Database: a
greeting by first name, and four stats (streak, this week's goals done,
today's habits done, PTO days left). By default it matches the app's own
light/dark theme like any other card. A gear icon in the top-right hides a
customize panel — a free color wheel (any color, not a fixed palette) and
a background photo — for the one card that's actually yours. The moment
either is set, the text switches to a fixed light-on-dark pair so it stays
readable no matter what color or photo someone picks.

| English | ខ្មែរ |
|---|---|
| Welcome, {name}, to your database | សូមស្វាគមន៍ {name} មកកាន់ទិន្នន័យរបស់អ្នក |
| Customize dashboard | កែសម្រួលផ្ទាំងគ្រប់គ្រង |
| day streak / goals done / habits today / PTO days left | ថ្ងៃជាប់គ្នា / គោលដៅបានបញ្ចប់ / ទម្លាប់ថ្ងៃនេះ / ថ្ងៃឈប់សម្រាកនៅសល់ |
| Accent color / Background image | ពណ៌សំខាន់ / រូបភាពផ្ទៃខាងក្រោយ |
| Change image / Add image / Choose color | ប្តូររូបភាព / បន្ថែមរូបភាព / ជ្រើសរើសពណ៌ |
| Match app theme | តាមម៉ូតកម្មវិធី |
| Uploading image… / Dashboard updated | កំពុងផ្ទុករូបភាព… / បានធ្វើបច្ចុប្បន្នភាពផ្ទាំងគ្រប់គ្រង |
| That image type isn't supported | ប្រភេទរូបភាពនេះមិនគាំទ្រទេ |
| Image too large — try a smaller one | រូបភាពធំពេក — សូមសាកល្បងរូបតូចជាងនេះ |
| Upload failed | ការផ្ទុកឡើងបរាជ័យ |

## 15. 1-on-1 requests, and an Updates feed on the personal dashboard

Either side of an approved mentor/mentee relationship can now ask the other
for a 1-on-1 — a ☕ button next to their row in the Mentorship card, on both
"You're Mentoring" and "Your Mentor". The other person accepts or declines
from a small list in the same card. Separately, the personal dashboard now
carries an Updates card: leave decisions on your own requests, a mentee's
leave request waiting on you, and 1-on-1 activity — computed from state
already on the page, not a separately stored notification log.

| English | ខ្មែរ |
|---|---|
| Request a 1-on-1 | ស្នើសុំការជួបគ្នាមួយទល់មួយ |
| 1-on-1 Requests | សំណើសុំជួបគ្នាមួយទល់មួយ |
| {name} would like a 1-on-1 | {name} ចង់ជួបគ្នាមួយទល់មួយជាមួយអ្នក |
| Request sent | បានផ្ញើសំណើ |
| Updates | ព័ត៌មានថ្មី |
| Your {range} leave request was approved | សំណើសុំចាកឆ្ងាយរបស់អ្នកសម្រាប់ {range} ត្រូវបានអនុម័ត |
| Your {range} leave request was declined | សំណើសុំចាកឆ្ងាយរបស់អ្នកសម្រាប់ {range} ត្រូវបានបដិសេធ |
| {name} requested leave {range} | {name} បានស្នើសុំចាកឆ្ងាយ {range} |
| {name} requested a 1-on-1 | {name} បានស្នើសុំជួបគ្នាមួយទល់មួយ |
| {name} accepted your 1-on-1 request | {name} បានទទួលយកសំណើជួបគ្នារបស់អ្នក |
| {name} declined your 1-on-1 request | {name} បានបដិសេធសំណើជួបគ្នារបស់អ្នក |

## 16. Dashboard customize button restyled, quick-jump bar now scrolls

The dashboard's customize trigger is now an icon-over-label button matching
`nav.bottom button`'s shape (was a switch, then a gear-only icon button)
and each of the four stat tiles now carries an emoji matching its section
elsewhere in My Database (🔥 streak, 🎯 goals, ✅ habits, 🌴 leave). The
quick-jump chip row scrolls horizontally in one line instead of wrapping
onto several.

| English | ខ្មែរ |
|---|---|
| Customize | កែសម្រួល |

## 17. Habit Tracker: reordered, and "Hours, mood & private" renamed

"Choose my habits" now sits above the daily-entry disclosure instead of
below it. That disclosure is renamed "Daily check-in" (was "Hours, mood &
private") with a new line explaining what it actually does: once
MIN_WEEK_DAYS (3) days are logged in a week, the server rolls them into
that week's Health check-in automatically — filling in the Health tab's
form by hand always overrides that roll-up. This was already true; it just
wasn't visible anywhere in the UI.

| English | ខ្មែរ |
|---|---|
| Daily check-in | ការរាយការណ៍ប្រចាំថ្ងៃ |
| Log {n}+ days this week and it fills in your weekly Health check-in — submit that form any time to override it by hand. | កត់ត្រា {n}+ ថ្ងៃក្នុងសប្តាហ៍នេះ វានឹងបំពេញការរាយការណ៍សុខភាពប្រចាំសប្តាហ៍របស់អ្នកដោយស្វ័យប្រវត្តិ — អ្នកអាចដាក់ស្នើទម្រង់នោះដោយផ្ទាល់ ដើម្បីជំនួសវានៅពេលណាក៏បាន។ |

## 18. Weekly Health's 1-10 questions are now sliders

Matching the mockup: the loneliness/clarity/growth questions on the Health
tab's weekly check-in form are sliders with low/high captions and a live
readout, instead of a row of ten number buttons. Hour fields now show a
"hours" unit. A slider shows a default midpoint before you touch it, but
that default doesn't count as answered — submitting still asks you to
actually drag each one first, same as before.

| English | ខ្មែរ |
|---|---|
| hours | ម៉ោង |
| 1 · Very connected / 10 · Very lonely | 1 · ភ្ជាប់ចិត្តជាមួយគេ / 10 · ឯកោខ្លាំង |
| 1 · Unclear / 10 · Very clear | 1 · មិនច្បាស់ / 10 · ច្បាស់ណាស់ |
| 1 · Stagnant / 10 · Thriving | 1 · ឈប់នឹង / 10 · រីកចម្រើនល្អ |

## 19. Ministry Tracker: week navigation, so a missed week can be backfilled

The Ministry Tracker now has the same week picker as Weekly Goals (prev/
next arrows, "Jump back to this week"). "This week" (headcounts and
scores) already keyed off the week number, so navigating back now lets you
fill in a week you missed. "Today" (daily running totals like Salvations)
doesn't have a "today" in a past week, so backfilling a past week lands
the number on that week's last day instead, and the card's heading and
copy say so explicitly.

| English | ខ្មែរ |
|---|---|
| {n} to log for {range} | {n} ត្រូវកត់ត្រាសម្រាប់ {range} |
| Backfilling week {wk} — this lands on {date}. | កំពុងបំពេញត្រឡប់ក្រោយសម្រាប់សប្តាហ៍ {wk} — វានឹងចូលទៅក្នុងកាលបរិច្ឆេទ {date}។ |

## 20. My Database reordering, Updates inbox actions, and "My Ministry" as its own page

Habit Tracker now sits above Weekly Goals (was below it). The hamburger
menu's "Leave Request" item now opens the Leave Request page directly
instead of scrolling My Database to its entry card. The dashboard's
Updates card is now a small inbox: a mentee's leave request and an
incoming 1-on-1 request get inline Approve/Deny or Accept/Decline right
there, using the same handlers the full Leave Request page and Mentorship
card already call — nothing new on the backend. The Ministry Tracker is
no longer an inline accordion in My Database; it's its own full page
("My Ministry"), reached the same way Leave Request is — a tappable card
in My Database — showing the actual ministry name and confirming these
numbers already feed the GP Dashboard for both campuses (they always
did; this just makes it visible). Logging permission is unchanged: anyone
whose profile carries that ministry can log for it, same as before.

| English | ខ្មែរ |
|---|---|
| My Ministry | កិច្ចការបម្រើរបស់ខ្ញុំ |
| {ministry} — these numbers feed the GP Dashboard for both campuses. | {ministry} — ចំនួនទាំងនេះបញ្ចូលទៅក្នុងផ្ទាំងគ្រប់គ្រង GP សម្រាប់ទាំងពីរសាខា។ |

## 21. My Ministry: department overseers now see the ministries under them

"My Ministry" moved after OKRs (was before) and was added to the
hamburger menu. Bigger change: a department's "Base Leadership" role
(dept: Base Leadership, ministry: e.g. Community Service — the person
overseeing that whole department, not one front-line ministry in it) only
ever showed their own leadership-activity figures (one-on-ones held,
meetings led). It never showed the actual ministries they oversee
(Outreach Teams, Cafe, GP Education, Intercession, for Community
Service) — those were only reachable via the Base tab's Department
Explorer, several taps away and not defaulted to their own department.
"My Ministry" now adds a "Ministries You Oversee" section listing every
ministry under the department they lead, every metric each one tracks,
current figure and trend — read-only, the same ledger Department Explorer
already showed, just surfaced where a department leader actually looks.
Extracted the per-ministry rendering into one shared function
(`deptMinistriesHtml_`) so Department Explorer and My Ministry can't drift
apart on how a ministry's numbers are shown.

| English | ខ្មែរ |
|---|---|
| Ministries You Oversee · {dept} | កិច្ចការបម្រើដែលអ្នកគ្រប់គ្រង · {dept} |

## 22. Ministries You Oversee becomes loggable, by week; Individual vs Ministry labels; Mentorship gets its own heading; Health week picker matches Weekly Goals

The read-only "Ministries You Oversee" section from #21 can now be logged
into directly, the same day/week split and week-by-week navigation as a
person's own Ministry Tracker — a department overseer no longer has to
go through the Base tab to put in a number for a ministry they lead.
Each ministry gets its own card with its own week pointer and draft, so
logging Cafe's week 30 doesn't disturb what Outreach Teams' card is
showing. Saves go through new authorized endpoints
(`saveKpiDayFor`/`saveMinistryFor`/`getMinistryFor`) that let an overseer
write any ministry under the department they lead, in addition to their
own — the same rule the server already enforces, now reachable from the
UI. Added a plain-language label above each block on My Ministry: an
overseer's own figures are marked "Individual" (personal to them, not a
department rollup), and a regular ministry member's own ministry section
is marked "Ministry" (logged by anyone on the team). The "Ministries You
Oversee" section itself now says these numbers are normally logged by the
teams in them, with the overseer's own logging as a backup path.

Two smaller fixes: "Mentorship" (You're Mentoring / Your Mentor) sat right
under the "Annual Goals" card with no heading of its own, reading as if it
were still part of Annual Goals — it now gets its own section title. And
the Health tab's week picker was a plain dropdown; it now uses the same
arrow/pill week-navigation layout as Weekly Goals and My Ministry, so
switching or backfilling a week's health check-in looks and works the
same way everywhere in the app.

| English | ខ្មែរ |
|---|---|
| No KPIs are defined for {ministry} yet. | មិនទាន់មានការកំណត់សូចនាករសម្រាប់ {ministry} នៅឡើយទេ។ |
| Individual | បុគ្គល |
| Your own numbers as {dept} — logged by you, separate from the ministries you oversee below. | ចំនួនផ្ទាល់ខ្លួនរបស់អ្នកជា {dept} — កត់ត្រាដោយអ្នកផ្ទាល់ ដាច់ដោយឡែកពីកិច្ចការបម្រើដែលអ្នកគ្រប់គ្រងខាងក្រោម។ |
| {ministry}'s numbers — anyone on the team can log them, and they feed the GP Dashboard for both campuses. | ចំនួនរបស់ {ministry} — នរណាម្នាក់ក្នុងក្រុមអាចកត់ត្រាបាន ហើយវានឹងបញ្ចូលទៅផ្ទាំងគ្រប់គ្រង GP សម្រាប់ទាំងពីរសាខា។ |
| Ministry numbers — normally logged by the teams in them. You can log for any of these too, as their overseer. | ចំនួនកិច្ចការបម្រើ — ជាធម្មតាកត់ត្រាដោយក្រុមនៅក្នុងនោះ។ អ្នកក៏អាចកត់ត្រាសម្រាប់ណាមួយក្នុងចំណោមនេះបានដែរ ក្នុងនាមជាអ្នកគ្រប់គ្រងរបស់ពួកគេ។ |
| Saved — week {wk} updated | បានរក្សាទុក — សប្តាហ៍ {wk} ត្រូវបានធ្វើបច្ចុប្បន្នភាព |
| Saved — week total updated | បានរក្សាទុក — សរុបប្រចាំសប្តាហ៍ត្រូវបានធ្វើបច្ចុប្បន្នភាព |

## 23. Habit Tracker's two titles swapped; Streaks and Recent days collapse behind Load more

The section heading over the whole daily block used to say "Habit
Tracker", with the card underneath it titled "Today" — easy to misread
as "today's habit tracker" when actually the card itself IS the habit
tracker and the section is broader than just habits (it also holds the
Daily check-in disclosure). Swapped the two: the section heading is now
"Daily", and the card with the habit grid is titled "Habit Tracker". The
quick-jump chip that scrolls here was relabeled to match. Streaks and
Recent days — a look-back, not something to load on every visit — now
sit behind a "Load more" button under the Daily check-in, the same way
KPI counts already hide behind "show all".

| English | ខ្មែរ |
|---|---|
| Daily | ប្រចាំថ្ងៃ |
| Load more | មើលបន្ថែម |
| Show less | បង្ហាញតិចជាង |

## 24. My Ministry moved under Weekly Goals; OKRs page through multiple objectives (own dept + department you oversee); Ministries You Oversee log weekly only; OKR percent clamped at 100

My Ministry now sits directly under Weekly Goals instead of after OKRs —
both are "what am I aiming at," one personal, one for the ministry.

The OKR section on My Database (and on a teammate's page) used to show
only one department's objectives — for a "Base Leadership" department
overseer that meant their OWN leadership objectives, never the real
department they lead (e.g. Community Service). It now shows both: the
person's own department, plus, if they oversee one, that department's
objectives too. Edit/delete still only appear on the person's own
department's card — the server refuses a write against a department
someone merely oversees, the same boundary that protects every other
department's OKRs. When there's more than one objective to show (own
department, overseen department, or simply more than one objective in
the same department), they page one at a time with a "‹ 1 of 3 ›"
control instead of stacking every card at once.

"Ministries You Oversee" cards (added in #21/#22) no longer have a daily
"Today" log — only "This week." Day-by-day logging stays where it
belongs, on the ministry's own My Ministry page; an overseer typing here
is filling in a week nobody on the team logged day by day, not
duplicating that team's own daily habit.

Separately: a key result's percentage could read something like "7668%
complete" when its target was set far below what the ministry actually
logs — the progress bar/ring already capped its own width at 100%, so it
looked done while the number next to it did not. `krProgress` in
rollup.js now clamps the percentage itself at 100, the same ceiling
everything else in the app already uses.

| English | ខ្មែរ |
|---|---|
| Previous | មុន |
| Next | បន្ទាប់ |
| {n} of {total} | {n} នៃ {total} |
| Logged weekly only — day by day belongs to the ministry's own team on their My Ministry page. The ones that rarely change are already filled in from last time. | កត់ត្រាតែប្រចាំសប្តាហ៍ប៉ុណ្ណោះ — ការកត់ត្រាថ្ងៃនិមួយៗជាកម្មសិទ្ធិរបស់ក្រុមផ្ទាល់នៃកិច្ចការបម្រើនៅលើទំព័រ My Ministry របស់ពួកគេ។ អ្វីដែលកម្រផ្លាស់ប្តូរត្រូវបានបំពេញស្រាប់ពីលើកមុន។ |

## 25. A key result whose target is already passed now says so

#24 clamped the key-result percentage at 100 so nothing prints "7668%
complete" any more. On its own, though, the clamp hides the problem: a
target set below what the ministry already logs now shows a full bar
reading 100% for the whole quarter, which looks like an objective that
was met rather than a target that was typed wrong.

So `krProgress()` also returns the uncapped percentage, and two places
use it. Under the key result — on the GP Dashboard and on My Database —
a line in amber says how far past the target the ministry already is.
And in the OKR editor, the moment a target is typed under a metric, a
line under the box says what that metric has already logged this
quarter, so it can be got right where it is set instead of read wrong
for three months. Both lines come from one helper in `rollup.js`
(`gpKrWarnHtml` / `gpKrTargetNote`) so the two pages cannot word the
same wrong target two different ways.

Both strings carry numbers, so the placeholders have to survive
translation: `{n}` is a percentage, `{a}` and `{b}` are a metric's own
figures (already formatted).

| English | ខ្មែរ |
|---|---|
| Target looks too low — already at {n}% of it. | គោលដៅនេះទំនងជាទាបពេក — សម្រេចបាន {n}% នៃវារួចហើយ។ |
| Already {a} this quarter — a target of {b} is passed before you start. | ត្រីមាសនេះមាន {a} រួចហើយ — គោលដៅ {b} ត្រូវបានឆ្លងផុតមុនពេលចាប់ផ្តើម។ |

## 0h. When a habit tap cannot be saved

| English | ខ្មែរ |
|---|---|
| Not saved — check your connection and tap again. | មិនបានរក្សាទុកទេ — សូមពិនិត្យការតភ្ជាប់ រួចចុចម្តងទៀត។ |

_Shown when a habit tile was tapped but the save failed, at the moment the tile
goes back to how it was. It has to be believable in one glance on a bad
connection: the tap did not stick, try it again._

## 27. When a habit-picker change does not save

The habit picker used to keep a list the server had refused, which is what made
a later tap land on a tile that was about to vanish. It now puts the last
acknowledged list back and says so, so there is one new sentence.

| English | ខ្មែរ |
|---|---|
| Your habits didn’t save — check your connection and pick them again. | ទម្លាប់របស់អ្នកមិនបានរក្សាទុកទេ — សូមពិនិត្យការតភ្ជាប់ ហើយជ្រើសរើសម្តងទៀត។ |

## 28. Admin: approve Base Leadership sign-ups, manage accounts

A new screen, visible only to whoever holds `isAdmin` (only ever granted to a
Base Leadership account). Lets an admin approve a pending Base Leadership
sign-up, deactivate or reactivate any account, reset a PIN, and fix a wrong
campus/department/ministry/role for someone else.

Admin access is gated by its own secret (`GP_ADMIN_CODE`), separate from the
leader code the dashboard already uses — Uriah asked for the two kept apart,
since the dashboard is due for its own rework later. A Base Leadership
account spends the admin code on itself once (Profile & settings → Admin
access) or an existing admin spends it on someone else (this screen).

| English | ខ្មែរ |
|---|---|
| Admin | អ្នកគ្រប់គ្រង |
| Approve new leadership accounts, and manage everyone’s. | អនុម័តគណនីថ្នាក់ដឹកនាំថ្មី និងគ្រប់គ្រងគណនីរបស់អ្នកគ្រប់គ្នា។ |
| Waiting for approval | កំពុងរង់ចាំការអនុម័ត |
| All accounts | គណនីទាំងអស់ |
| Pending approval | រង់ចាំការអនុម័ត |
| Active | សកម្ម |
| you | អ្នក |
| Deactivate | បិទដំណើរការ |
| Activate | បើកដំណើរការ |
| Reset PIN | កំណត់លេខសម្ងាត់ឡើងវិញ |
| Save | រក្សាទុក |
| Fix campus / department / role | កែសម្រួល សាខា / ផ្នែក / តួនាទី |
| Revoke admin | ដកសិទ្ធិអ្នកគ្រប់គ្រង |
| Make admin | ផ្តល់សិទ្ធិអ្នកគ្រប់គ្រង |
| Admin access | សិទ្ធិអ្នកគ្រប់គ្រង |
| You have admin access — find it in the menu. | អ្នកមានសិទ្ធិជាអ្នកគ្រប់គ្រង — សូមរកមើលនៅក្នុងម៉ឺនុយ។ |
| Admin code | លេខកូដអ្នកគ្រប់គ្រង |
| Enter the admin code to unlock the Admin screen for this account. | បញ្ចូលលេខកូដអ្នកគ្រប់គ្រង ដើម្បីបើកទំព័រអ្នកគ្រប់គ្រងសម្រាប់គណនីនេះ។ |
| Unlock | ដោះសោ |

## 29. My Database's top card now matches Base's hero

Uriah wants staff spending more time on My Database, so its top card is now
literally Base's own hero (same look) with personal figures in place of the
base's — streak instead of staff count, Weekly Goals/Habits Today as ring
rows instead of check-in rate/health score, PTO days left instead of
salvations YTD. Each ring/sub row is a button that jumps straight to that
section further down the same page.

| English | ខ្មែរ |
|---|---|
| Welcome, {name} | សូមស្វាគមន៍ {name} |
| DAY STREAK | ថ្ងៃជាប់គ្នា |
| Habits Today | ទម្លាប់ថ្ងៃនេះ |
| PTO DAYS LEFT | ថ្ងៃឈប់សម្រាកនៅសល់ |

## 30. Admin: full profile fields, manual mentor assignment, grouped by campus

The Admin screen's edit form now covers everything account management was
missing — name, staff type, home country alongside campus/department/
ministry/role — and adds a manual mentor override: an admin can assign (or
clear) anyone's mentor directly and mark it approved immediately, instead of
waiting on the normal accept-in-Team flow. The "All accounts" list is now
grouped under YWAM Poipet / YWAM Siem Reap headings instead of one flat list.

| English | ខ្មែរ |
|---|---|
| Mentor | អ្នកណែនាំ |
| — none — | — គ្មាន — |
| Approved (skip the accept step) | បានយល់ព្រម (រំលងជំហានទទួលយក) |
| Save mentor | រក្សាទុកអ្នកណែនាំ |
| No accounts yet. | មិនទាន់មានគណនីនៅឡើយទេ។ |
| Other | ផ្សេងទៀត |

## 31. A notification bell, next to the hamburger menu

My Database's "🔔 Updates" card (leave decisions, incoming 1-on-1 requests)
now also has a header shortcut — a bell in the top-right corner that opens
the same list in a panel, so it's visible from any tab, not just My Database.
"Clear all" on either the bell or the card hides everything up to that
moment (a device-local cutoff, nothing server-side); anything still pending
keeps its own home on Leave Request, Mentorship or Team either way.

| English | ខ្មែរ |
|---|---|
| Notifications | ការជូនដំណឹង |
| Notifications ({n}) | ការជូនដំណឹង ({n}) |
| Clear all | សម្អាតទាំងអស់ |
| Nothing new. | មិនមានអ្វីថ្មីទេ។ |

## 32. My Database's hero: the greeting moved in, health and mentor added

The name-and-face greeting (name, ministry, department) used to open Base;
Base is ministry stats, not a personal page, so it now opens My Database's
hero card instead, next to the customize gear. The hero also gained two more
rows: My Health (this week's health-check score out of 10, same maths as the
Health tab) and Mentor (who it's set to, or "Not set" if it isn't) — both
buttons that jump straight to that section, like Weekly Goals and Habits
Today already do.

| English | ខ្មែរ |
|---|---|
| My Health | សុខភាពរបស់ខ្ញុំ |
| MENTOR | អ្នកណែនាំ |
| Not set | មិនទាន់កំណត់ |

## 33. Base: Siem Reap's historical weekly check-in (one-time import)

A separate app ("YWAM SR Weekly Check In") had its own weekly Yes/No
check-in, Siem Reap only, since January 2026. It stopped being used in
July, and every submission in it is anonymous — there's no way to tell
whose answer is whose, so this can only ever be a team-wide history, never
folded into anyone's personal health score. Imported once as a frozen
snapshot and shown on Base (Siem Reap staff only) as each question's
percentage then vs. now.

| English | ខ្មែរ |
|---|---|
| Siem Reap · Weekly Check-In History | សៀមរាប · ប្រវត្តិការឆែកអង់ប្រចាំសប្តាហ៍ |
| Imported from a separate check-in tool, Jan–Jul 2026 (it stopped being used after that). Team-wide and anonymous — not linked to any individual profile. | នាំចូលពីឧបករណ៍ឆែកអង់ផ្សេងមួយ ខែមករា–កក្កដា ២០២៦ (វាឈប់ប្រើប្រាស់បន្ទាប់ពីនោះ)។ ជាទិន្នន័យរួមក្រុម និងអនាមិក — មិនភ្ជាប់ជាមួយប្រវត្តិរូបនរណាម្នាក់ទេ។ |
| Bible & daily quiet time | ព្រះគម្ពីរ និងពេលស្ងប់ស្ងាត់ប្រចាំថ្ងៃ |
| Has a best friend on base | មានមិត្តភក្តិល្អបំផុតនៅមូលដ្ឋាន |
| Looked at porn this week | បានមើលរូបភាពអាសអាភាសសប្តាហ៍នេះ |
| Exercised 15+ min, 3 days | បានហាត់ប្រាណ ១៥នាទី+ ចំនួន ៣ថ្ងៃ |
| Currently in debt to the base | កំពុងជំពាក់បំណុលមូលដ្ឋាន |
| Fully honest in this report | ស្មោះត្រង់ទាំងស្រុងក្នុងរបាយការណ៍នេះ |
| Called family this month | បានទូរស័ព្ទទៅគ្រួសារខែនេះ |
| Often felt lonely this month | មានអារម្មណ៍ឯកកោញឹកញាប់ខែនេះ |
| Sent a ministry update this month | បានផ្ញើដំណឹងកិច្ចការបម្រើខែនេះ |
| Had 2+ one-on-ones this month | បានជួបគ្នាមួយទល់មួយ ២ដង+ ខែនេះ |

## 34. My Database's hero: filled in further, priority stats promoted

Mentor moved out of the small PTO-style row into a full ring row, matching
Weekly Goals/Habits/Health — Uriah asked those four to be the page's
priority. Two more figures were added alongside them: a habit's best-ever
streak under Habits Today, and a vs.-last-week trend arrow next to My
Health. The card now has a visible border of its own, and the customize
gear shrank to an icon-only button so it reads as a minor control, not a
competing headline.

| English | ខ្មែរ |
|---|---|
| best {n}d streak | កំពូល {n} ថ្ងៃជាប់គ្នា |

## 35. My Database: the day-streak chip under the hero is gone

The hero already leads with the day streak — repeating it as its own chip
right underneath, with its own celebration animation, was just noise.
Removed; the 7/30-day celebration now marks the hero's own number instead.
No new strings — this is a removal, not an addition.

## 36. Siem Reap check-in history: moved to Health, now a real chart

Moved off Base (it's health data, not a ministry stat) onto the Health tab,
Siem Reap staff only, right under the campus's own Base Health figures. A
quarter picker (same Q1-Q4 control Base Health already uses) replaces the
old flat "started here, ended here" list: for the selected quarter, a line
chart of the overall trend (each question's own good direction, so a
climbing line always means things got better) and a bar chart of that
quarter's raw percentage per question — both animate in on render. Each bar
is also a button: tapping a question opens its own trend line right under
it (one at a time), so comparing two questions is two taps, not ten charts
at once.

| English | ខ្មែរ |
|---|---|
| Not enough data points this quarter for a trend line. | មិនមានទិន្នន័យគ្រប់គ្រាន់សម្រាប់បន្ទាត់និន្នាការត្រីមាសនេះទេ។ |
| No data for this quarter. | គ្មានទិន្នន័យសម្រាប់ត្រីមាសនេះទេ។ |
| Trend, {a} to {b} | និន្នាការ ពី {a} ដល់ {b} |
| Overall trend (higher is better) | និន្នាការទាំងមូល (ខ្ពស់ជាងគឺល្អជាង) |
| This quarter, by question | ត្រីមាសនេះ តាមសំណួរនីមួយៗ |
| Tap a question to see its own trend. | ចុចលើសំណួរណាមួយ ដើម្បីមើលនិន្នាការផ្ទាល់របស់វា។ |

## 37. Weekly check-in: reworded to match history, monthly add-on, seamless chart

Three questions (exercise, quiet time, staff debt) reworded to match the
Siem Reap history's own wording exactly — same question going forward, so
an answer continues that historical line on the Health chart rather than
starting a new, disconnected one. A new "Monthly Check-In" section appears
only on the week that closes out a month (call family, felt lonely this
month, sent a ministry update, 2+ one-on-ones) — the same add-on the Siem
Reap tool used. Two questions with no ongoing equivalent (best friend on
base, honesty in the report) were dropped from the history chart — nothing
tracks them anymore, so there's nothing to continue. The chart itself now
appends live Siem Reap answers onto the same line the import stopped at,
instead of stopping in July forever.

| English | ខ្មែរ |
|---|---|
| Did I exercise at least 15 minutes, 3 days this week? | តើខ្ញុំបានហាត់ប្រាណយ៉ាងហោចណាស់ ១៥នាទី ចំនួន ៣ថ្ងៃទេក្នុងសប្តាហ៍នេះ? |
| Did I read the Bible and have daily quiet time every day this week? | តើខ្ញុំបានអានព្រះគម្ពីរ និងមានពេលស្ងប់ស្ងាត់ជារៀងរាល់ថ្ងៃទេក្នុងសប្តាហ៍នេះ? |
| Do I currently have debt toward the base? | តើខ្ញុំកំពុងជំពាក់បំណុលមូលដ្ឋានដែរឬទេ? |
| Monthly Check-In | ការឆែកអង់ប្រចាំខែ |
| Did I call my family at least once this month? | តើខ្ញុំបានទូរស័ព្ទទៅគ្រួសារយ៉ាងហោចណាស់ម្តងទេក្នុងខែនេះ? |
| Did I often feel lonely this month? | តើខ្ញុំមានអារម្មណ៍ឯកកោញឹកញាប់ទេក្នុងខែនេះ? |
| Did I send a ministry update to my supporters this month? | តើខ្ញុំបានផ្ញើដំណឹងកិច្ចការបម្រើទៅអ្នកគាំទ្រទេក្នុងខែនេះ? |
| Did I have at least 2 one-on-ones this month? | តើខ្ញុំបានជួបគ្នាមួយទល់មួយយ៉ាងហោចណាស់ ២ដងទេក្នុងខែនេះ? |
| Starts with a Jan–Jul 2026 import from a separate check-in tool, then continues from the weekly check-in below. Team-wide and anonymous — not linked to any individual profile. | ចាប់ផ្តើមដោយការនាំចូលពីខែមករា–កក្កដា ២០២៦ ពីឧបករណ៍ឆែកអង់ផ្សេងមួយ បន្ទាប់មកបន្តពីការឆែកអង់ប្រចាំសប្តាហ៍ខាងក្រោម។ ជាទិន្នន័យរួមក្រុម និងអនាមិក — មិនភ្ជាប់ជាមួយប្រវត្តិរូបនរណាម្នាក់ទេ។ |

## 38. Health tab: Siem Reap's Base Health merges with the check-in chart

Siem Reap used to see two sections back to back — the check-in history
chart, then Base Health's own list of averages and percentages right under
it. Too much to look at for one screen, so they're one now: the chart
became Base Health for this campus, expanded to cover every yes/no
question Base Health used to list (one-on-ones, shared faith, sabbath —
these never had an import, so their line is live-only, same mechanism,
just nothing before it). The 1-10 scales and hour totals (clarity, growth,
loneliness, language/ministry hours) have no percentage to plot and are
left out. Poipet has no import to merge with, so its Base Health stays the
plain list, unchanged.

| English | ខ្មែរ |
|---|---|
| Had a one-on-one this week | បានជួបគ្នាមួយទល់មួយសប្តាហ៍នេះ |
| Shared their faith this week | បានចែករំលែកជំនឿសប្តាហ៍នេះ |
| Took a sabbath this week | បានឈប់សម្រាកសប្ប័ទសប្តាហ៍នេះ |

## 39. Two reminders for a missed weekly check-in

Friday through the end of the week, if that week's check-in is still
unanswered, the notification bell and My Database's Updates card get a new
item ("Your weekly health check-in is due") with a button straight to
Health. Separately, Health itself now nudges about *last* week specifically,
from the moment it ends, until it's answered — a small banner above this
week's form, since the week-nav above it doesn't say anything is missing on
its own.

| English | ខ្មែរ |
|---|---|
| Your weekly health check-in is due | ការឆែកអង់សុខភាពប្រចាំសប្តាហ៍របស់អ្នកដល់ពេលហើយ |
| Answer it | ឆ្លើយឥឡូវនេះ |
| You haven’t answered week {n} yet. | អ្នកមិនទាន់បានឆ្លើយសប្តាហ៍ {n} នៅឡើយទេ។ |
| Fill it in | បំពេញវា |

## 40. Admin: delete an account

For a duplicate sign-up or a test account — not the normal way someone
leaves, which is still Deactivate (keeps their history, just blocks
login). This is permanent: an admin can't delete their own account, and
anyone who had the deleted person set as their mentor has that cleared
rather than left pointing at a ghost. What they logged stays part of the
base's history; only the account goes.

| English | ខ្មែរ |
|---|---|
| Delete account | លុបគណនី |
| Permanent — for a duplicate or test account, not someone leaving. Their logged history stays; only the account goes. | អចិន្ត្រៃយ៍ — សម្រាប់គណនីស្ទួន ឬគណនីសាកល្បង មិនមែនសម្រាប់អ្នកកំពុងចាកចេញទេ។ ប្រវត្តិដែលបានកត់ត្រានៅតែមាន មានតែគណនីទេដែលបាត់។ |
| Permanently delete {name}’s account? This can’t be undone. | លុបគណនីរបស់ {name} ជាអចិន្ត្រៃយ៍មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ |
| Account deleted | គណនីត្រូវបានលុប |
| Could not delete that account | មិនអាចលុបគណនីនោះបានទេ |

## 41. When a headcount has never been logged before

A headcount ("Students Enrolled", "Total Staff") is now carried forward across a
year boundary, not just within one year — so the only time the box is genuinely
empty is when nobody has ever logged that number. It says so instead of showing
nothing.

| English | ខ្មែរ |
|---|---|
| nothing logged before this week | គ្មានការកត់ត្រាមុនសប្តាហ៍នេះទេ |

_Sits in the small grey line under the metric's name, where "carried from week
50" normally sits. Lower-case on purpose: it is the tail of a sentence, not its
own heading._

## 42. Email, one profile per person, and merging a duplicate

Creating a profile now asks for an email, and a second sign-up with the
same one is refused — that's the new duplicate check, in place of name
(two people can share a name; nobody shares an inbox). Anyone whose
account predates this gets nudged from the notification bell until they
add one, and can from Profile. Admin also gets a "Merge duplicate
accounts" tool: pick which of two profiles to keep, and everything the
other logged that doesn't already overlap moves onto it before the
duplicate is deleted.

| English | ខ្មែរ |
|---|---|
| Add your email to your profile | បន្ថែមអុីមែលរបស់អ្នកទៅកាន់ប្រវត្តិរូបរបស់អ្នក |
| Add it | បន្ថែមវា |
| Merge duplicate accounts | បញ្ចូលគណនីស្ទួនចូលគ្នា |
| For one person who accidentally made two profiles. Pick which to keep — its history, plus whatever the other logged that doesn’t already overlap, moves onto it. The other account is then deleted. | សម្រាប់មនុស្សម្នាក់ដែលបានបង្កើតប្រវត្តិរូបពីរដោយចៃដន្យ។ ជ្រើសរើសមួយដើម្បីរក្សាទុក — ប្រវត្តិរបស់វា បូកនឹងអ្វីដែលមួយទៀតបានកត់ត្រា ដែលមិនទាន់ត្រួតគ្នា នឹងផ្លាស់ទីមកកាន់វា។ គណនីមួយទៀតនឹងត្រូវបានលុបបន្ទាប់មក។ |
| Keep | រក្សាទុក |
| Delete (merge from) | លុប (បញ្ចូលចេញពី) |
| Merge accounts | បញ្ចូលគណនីចូលគ្នា |
| Pick two different accounts. | សូមជ្រើសរើសគណនីពីរផ្សេងគ្នា។ |
| Merge {merge} into {keep}? {merge}’s history moves onto {keep} where it doesn’t already overlap, then {merge}’s account is permanently deleted. This can’t be undone. | បញ្ចូល {merge} ចូលទៅ {keep} មែនទេ? ប្រវត្តិរបស់ {merge} នឹងផ្លាស់ទីទៅ {keep} កន្លែងដែលមិនទាន់ត្រួតគ្នា បន្ទាប់មកគណនីរបស់ {merge} នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ |
| Accounts merged | គណនីត្រូវបានបញ្ចូលចូលគ្នា |
| Could not merge those accounts | មិនអាចបញ្ចូលគណនីទាំងនោះចូលគ្នាបានទេ |

## 43. Weekly Goals→KPI link, a Health label, and a Month view

A Weekly Goal can now be pointed at a live KPI number instead of a manual
percentage — the same picker the OKR key results already use, dropped into
each goal row. Health's "Against last week" section now says plainly that
it's a personal, private view (Base Health further down is the shared,
anonymous one). Base Health also gets a Month scope alongside Week/
Quarter/Year.

| English | ខ្មែរ |
|---|---|
| Not linked to a KPI | មិនបានភ្ជាប់ទៅនឹង KPI ទេ |
| Your personal health check-in — nobody else sees this breakdown. | ការរាយការណ៍សុខភាពផ្ទាល់ខ្លួនរបស់អ្នក — គ្មាននរណាម្នាក់ផ្សេងទៀតឃើញការបំបែកនេះឡើយ។ |
| Month | ខែ |

## 44. Weekly check-in: a clear confirmation on submit

Submitting used to just show the generic toast "Saved" for two seconds,
easy to miss since the form also closes and the base average refreshes at
the same moment. Health now also shows a banner naming the week, once,
right where the check-in card sits.

| English | ខ្មែរ |
|---|---|
| Week {wk}’s check-in is saved. | ការឆែកអង់សប្តាហ៍ {wk} របស់អ្នកត្រូវបានរក្សាទុករួចហើយ។ |

## 45. OKRs get their own page; admin can broadcast to everyone

OKRs used to be an inline accordion on My Database, same shape as My
Ministry before it got its own page — now it does too: a tappable card
that opens a full screen for your department's objectives. Separately,
an admin can now write a message and send it straight to everyone's
notification bell — no accept or decline, just an FYI.

| English | ខ្មែរ |
|---|---|
| Send an announcement | ផ្ញើសេចក្តីប្រកាស |
| Goes straight to everyone’s notification bell. | ទៅដល់ប្រអប់ជូនដំណឹងរបស់អ្នកគ្រប់គ្នាភ្លាមៗ។ |
| What do you want everyone to know? | តើអ្នកចង់ឱ្យអ្នកគ្រប់គ្នាដឹងអ្វី? |
| Send to everyone | ផ្ញើទៅអ្នកគ្រប់គ្នា |
| Sending… | កំពុងផ្ញើ… |
| Sent to everyone | បានផ្ញើទៅអ្នកគ្រប់គ្នា |
| Write something first. | សូមសរសេរអ្វីមួយសិន។ |
| Announcement | សេចក្តីប្រកាស |

## 46. Not every ministry tracks the same things

My Ministry now has an "Edit what we track" panel — turn off a baseline
metric that doesn't apply, or add one of your own (a count, a score out
of 10, or a percentage). Admin gets the same editor for any ministry,
from a new "Ministry KPIs" picker on the Admin page. Numbers typed
against a custom metric go through the exact same pipeline as any other
— they show up on the GP Dashboard the moment they're saved.

| English | ខ្មែរ |
|---|---|
| Edit what we track | កែសម្រួលអ្វីដែលយើងតាមដាន |
| Turn metrics on or off, or add your own | បើក ឬបិទសូចនាករ ឬបន្ថែមផ្ទាល់ខ្លួនរបស់អ្នក |
| Turn off what this ministry doesn’t track, or add something new below. | បិទអ្វីដែលកិច្ចការបម្រើនេះមិនបានតាមដាន ឬបន្ថែមអ្វីថ្មីខាងក្រោម។ |
| Hide | លាក់ |
| custom | ផ្ទាល់ខ្លួន |
| Hidden | បានលាក់ |
| Show | បង្ហាញ |
| Add a metric | បន្ថែមសូចនាករ |
| What do you want to track? | តើអ្នកចង់តាមដានអ្វី? |
| Type | ប្រភេទ |
| Count (adds up) | រាប់ (បូកសរុប) |
| Score out of 10 | ពិន្ទុពី 10 |
| Percentage | ភាគរយ |
| Add | បន្ថែម |
| Give it a name first. | សូមដាក់ឈ្មោះឱ្យវាសិន។ |
| Already tracking that. | កំពុងតាមដានវារួចហើយ។ |
| Ministry KPIs | សូចនាករកិច្ចការបម្រើ |
| Pick a ministry to edit what it tracks. | ជ្រើសរើសកិច្ចការបម្រើមួយ ដើម្បីកែសម្រួលអ្វីដែលវាតាមដាន។ |
| No ministries under this department. | គ្មានកិច្ចការបម្រើនៅក្រោមផ្នែកនេះទេ។ |

## 47. Admin sees every department's OKRs from the OKR page

Below your own department's objectives (still the only ones you can edit
here), an admin now gets every other department's OKRs too — grouped by
department and campus, collapsed by default so the page still opens on
what it's actually for: your own.

| English | ខ្មែរ |
|---|---|
| Every department’s OKRs | OKR របស់គ្រប់ផ្នែកទាំងអស់ |
| No objectives set anywhere yet this quarter. | គ្មានគោលដៅត្រូវបានកំណត់នៅកន្លែងណាមួយសម្រាប់ត្រីមាសនេះនៅឡើយទេ។ |
| 1 objective | គោលដៅ 1 |
| {n} objectives | គោលដៅ {n} |

## 48. My Ministry: a picker to jump to any ministry on the campus

Below your own numbers (and, if you oversee a department, the ministries
under it), everyone gets a "YWAM {campus} Ministries" department/ministry
picker. An admin can pick anything on the campus; everyone else's picker
resolves to just the one ministry they already work in — there for
consistency, but nothing else to pick. Picking a ministry already shown
elsewhere on the page (your own, or one you oversee) points back up rather
than showing it twice.

| English | ខ្មែរ |
|---|---|
| YWAM {campus} Ministries | កិច្ចការបម្រើ YWAM {campus} |
| Jump to any ministry’s numbers. | រំលងទៅមើលចំនួនរបស់កិច្ចការបម្រើណាមួយ។ |
| That’s your own ministry — see above. | នេះជាកិច្ចការបម្រើផ្ទាល់ខ្លួនរបស់អ្នក — សូមមើលខាងលើ។ |
| You oversee this — see “Ministries You Oversee” above. | អ្នកទទួលបន្ទុកមើលការខុសត្រូវលើវា — សូមមើល “កិច្ចការបម្រើដែលអ្នកមើលការខុសត្រូវ” ខាងលើ។ |

## 49. Personal Base Leadership figures move to weekly; headcount gets its own section

A department overseer's personal figures (one-on-ones, partner connections,
churches spoken at, and the rest of the BL_COMMON list) are now entered once
for the week, like the health check-in, instead of daily — there's no more
"Today" box for them. Total Staff and Staff Debt, which feed the base's
combined headcount, move into their own "Department Headcount" section
below, since they're about the department rather than the person.

| English | ខ្មែរ |
|---|---|
| One number per week — headcounts and scores carry forward until changed; the rest is logged fresh each week. | លេខមួយក្នុងមួយសប្តាហ៍ — ចំនួនបុគ្គលិក និងពិន្ទុនឹងបន្តពីលើកមុនរហូតដល់មានការផ្លាស់ប្តូរ ចំណែកឯផ្សេងទៀតត្រូវបញ្ចូលថ្មីរាល់សប្តាហ៍។ |
| Department Headcount | ចំនួនបុគ្គលិកប្រចាំផ្នែក |
| Feeds the base’s total headcount — carries forward from last time until changed. | ចំណែកចូលទៅក្នុងចំនួនបុគ្គលិកសរុបរបស់មូលដ្ឋាន — បន្តពីលើកមុនរហូតដល់មានការផ្លាស់ប្តូរ។ |

## 50. Monthly and quarterly cadence for a count metric

An admin can set any count metric (from "Edit what we track") to Monthly or
Quarterly instead of the default Weekly. A monthly/quarterly metric drops out
of the daily "Today" list entirely and gets its own "This month"/"This
quarter" section: one number for the whole period, entered whenever, not
built up from daily or weekly entries.

| English | ខ្មែរ |
|---|---|
| Weekly | រៀងរាល់សប្តាហ៍ |
| Monthly | រៀងរាល់ខែ |
| Quarterly | រៀងរាល់ត្រីមាស |
| This month | ខែនេះ |
| This quarter | ត្រីមាសនេះ |
| Save Month | រក្សាទុកទិន្នន័យប្រចាំខែ |
| Save Quarter | រក្សាទុកទិន្នន័យប្រចាំត្រីមាស |
| logged | បានកត់ត្រា |
| nothing logged yet | មិនទាន់មានការកត់ត្រានៅឡើយទេ |
| {n} for {month} | {n} សម្រាប់ {month} |
| {n} for Q{q} | {n} សម្រាប់ត្រីមាសទី {q} |
| Logged once for {month}, not built up from weekly entries. | កត់ត្រាតែម្តងសម្រាប់ {month} មិនមែនបូកបញ្ចូលពីការកត់ត្រាប្រចាំសប្តាហ៍ទេ។ |
| Logged once for Q{q}, not built up from weekly entries. | កត់ត្រាតែម្តងសម្រាប់ត្រីមាសទី {q} មិនមែនបូកបញ្ចូលពីការកត់ត្រាប្រចាំសប្តាហ៍ទេ។ |

## 51. A metric's row shows which OKR(s) it feeds

An OKR's key result can already link to a live KPI number (kr.metricKey);
this is the reverse — on the metric's own input row on My Ministry, a small
note now shows which objective(s), if any, that number feeds into.

| English | ខ្មែរ |
|---|---|
| feeds “{objective}” | ចូលរួមចំណែកដល់ “{objective}” |
| feeds {n} objectives | ចូលរួមចំណែកដល់គោលដៅចំនួន {n} |

## 52. Personality types (a new section of the app)

Every staff member can take a 40-statement questionnaire and get a four-letter
personality type, with a character drawn for their type and whether they are male
or female. The questions, type names, descriptions and tips were all written for
this app — none of it is copied from 16Personalities or the official MBTI® test —
and every word below was translated by Claude and has NOT been checked.

**Please read the questions first.** A personality question that means something
slightly different in Khmer gives people the wrong type, so the 40 statements
matter more than anything else on this list. The "Strongly agree … strongly
disagree" words and "Agree / Disagree" under the circles come next.

_"Extraverted / Introverted" are translated as ចេញក្រៅ / ក្នុងខ្លួន, and "Judging /
Perceiving" as មានផែនការ / បត់បែន (planned / flexible) — plainer than the textbook
terms. If a better standard Khmer term is in common use, prefer it._

### The 40 statements

| English | ខ្មែរ |
|---|---|
| I get energy from being around lots of people. | ខ្ញុំមានកម្លាំងពេលនៅជាមួយមនុស្សច្រើន។ |
| I trust what I have seen and done more than new ideas. | ខ្ញុំទុកចិត្តអ្វីដែលខ្ញុំបានឃើញ និងបានធ្វើ ច្រើនជាងគំនិតថ្មីៗ។ |
| When I decide, logic matters more to me than feelings. | ពេលខ្ញុំសម្រេចចិត្ត ហេតុផលសំខាន់សម្រាប់ខ្ញុំជាងអារម្មណ៍។ |
| I like to plan my week in advance. | ខ្ញុំចូលចិត្តរៀបផែនការសប្តាហ៍របស់ខ្ញុំជាមុន។ |
| After a busy day with people, I need quiet time alone to recharge. | ក្រោយថ្ងៃរវល់ជាមួយមនុស្ស ខ្ញុំត្រូវការពេលស្ងាត់ម្នាក់ឯងដើម្បីមានកម្លាំងឡើងវិញ។ |
| I often imagine how things could be in the future. | ខ្ញុំច្រើនស្រមៃថាអ្វីៗអាចនឹងទៅជាយ៉ាងណានៅថ្ងៃអនាគត។ |
| I think about how a decision will affect people's feelings. | ខ្ញុំគិតថាការសម្រេចចិត្តមួយនឹងប៉ះពាល់ដល់អារម្មណ៍មនុស្សយ៉ាងណា។ |
| I prefer to keep my options open rather than decide early. | ខ្ញុំចូលចិត្តទុកជម្រើសឱ្យនៅបើក ជាជាងសម្រេចចិត្តឆាប់ពេក។ |
| I usually think best by talking things through out loud. | ជាធម្មតាខ្ញុំគិតបានល្អបំផុត ដោយនិយាយរឿងនោះចេញមកឮៗ។ |
| I like clear, practical instructions. | ខ្ញុំចូលចិត្តការណែនាំច្បាស់លាស់ និងជាក់ស្តែង។ |
| I can give honest criticism even when it is uncomfortable. | ខ្ញុំអាចរិះគន់ដោយស្មោះត្រង់ សូម្បីតែពេលវាមិនស្រួល។ |
| I feel uneasy when plans change at the last minute. | ខ្ញុំមិនស្រួលចិត្តពេលផែនការផ្លាស់ប្តូរនៅនាទីចុងក្រោយ។ |
| I prefer to think carefully before I speak in a group. | ខ្ញុំចូលចិត្តគិតឱ្យបានល្អិតល្អន់ មុនពេលនិយាយក្នុងក្រុម។ |
| I enjoy talking about ideas and possibilities, even if they are not practical yet. | ខ្ញុំចូលចិត្តនិយាយពីគំនិត និងលទ្ធភាព ទោះបីវាមិនទាន់ជាក់ស្តែងក៏ដោយ។ |
| Keeping peace in the team is very important to me. | ការរក្សាសន្តិភាពក្នុងក្រុម គឺសំខាន់ណាស់សម្រាប់ខ្ញុំ។ |
| I often do my best work close to a deadline. | ខ្ញុំច្រើនធ្វើការបានល្អបំផុត ពេលជិតដល់ពេលកំណត់។ |
| I enjoy meeting new people and starting conversations. | ខ្ញុំចូលចិត្តជួបមនុស្សថ្មី និងចាប់ផ្តើមការសន្ទនា។ |
| I notice details that other people miss. | ខ្ញុំកត់សម្គាល់ព័ត៌មានលម្អិតដែលអ្នកដទៃមើលរំលង។ |
| Being fair and consistent matters more to me than making exceptions. | ភាពយុត្តិធម៌ និងស្មើៗគ្នា សំខាន់សម្រាប់ខ្ញុំជាងការធ្វើករណីលើកលែង។ |
| I like to finish one task before starting another. | ខ្ញុំចូលចិត្តបញ្ចប់ការងារមួយ មុនចាប់ផ្តើមការងារមួយទៀត។ |
| I would rather have a few deep friendships than many casual ones. | ខ្ញុំចូលចិត្តមានមិត្តភាពជ្រៅៗតិចតួច ជាជាងមិត្តធម្មតាច្រើន។ |
| I see patterns and connections that others don't see. | ខ្ញុំមើលឃើញលំនាំ និងទំនាក់ទំនងដែលអ្នកដទៃមើលមិនឃើញ។ |
| I easily feel what other people are feeling. | ខ្ញុំងាយដឹងពីអារម្មណ៍របស់អ្នកដទៃ។ |
| I am comfortable not knowing exactly what will happen tomorrow. | ខ្ញុំស្រួលចិត្ត ទោះមិនដឹងច្បាស់ថាថ្ងៃស្អែកនឹងមានអ្វីកើតឡើង។ |
| At a gathering, I talk with many different people. | នៅក្នុងការជួបជុំ ខ្ញុំនិយាយជាមួយមនុស្សផ្សេងៗគ្នាច្រើន។ |
| I would rather improve something that works than try something untested. | ខ្ញុំចូលចិត្តកែលម្អអ្វីដែលដំណើរការស្រាប់ ជាជាងសាកល្បងអ្វីដែលមិនទាន់បានសាក។ |
| I enjoy a good debate to find the best answer. | ខ្ញុំចូលចិត្តការជជែកដេញដោលល្អៗ ដើម្បីរកចម្លើយល្អបំផុត។ |
| My room or workspace is usually tidy and organized. | បន្ទប់ ឬកន្លែងធ្វើការរបស់ខ្ញុំ ជាធម្មតាស្អាត និងមានរបៀប។ |
| I often enjoy working on my own more than in a group. | ខ្ញុំច្រើនចូលចិត្តធ្វើការម្នាក់ឯង ជាងធ្វើក្នុងក្រុម។ |
| I get bored doing the same task the same way every time. | ខ្ញុំធុញទ្រាន់ពេលធ្វើការងារដដែល តាមរបៀបដដែលរាល់ដង។ |
| I find it hard to say no when someone asks me for help. | ខ្ញុំពិបាកបដិសេធ ពេលមាននរណាម្នាក់សុំឱ្យខ្ញុំជួយ។ |
| I enjoy being spontaneous. | ខ្ញុំចូលចិត្តធ្វើអ្វីៗដោយមិនបានគ្រោងទុក។ |
| Being alone for a long time leaves me restless. | ការនៅម្នាក់ឯងយូរ ធ្វើឱ្យខ្ញុំមិនស្ងប់។ |
| I remember facts and specific experiences well. | ខ្ញុំចាំការពិត និងបទពិសោធន៍ជាក់លាក់បានល្អ។ |
| In a conflict, I focus on the facts more than on people's emotions. | ពេលមានជម្លោះ ខ្ញុំផ្តោតលើការពិត ច្រើនជាងអារម្មណ៍របស់មនុស្ស។ |
| I like making lists and ticking things off. | ខ្ញុំចូលចិត្តធ្វើបញ្ជី ហើយគូសចេញនូវអ្វីដែលបានធ្វើរួច។ |
| People sometimes have to ask me what I am thinking. | ពេលខ្លះ មនុស្សត្រូវសួរខ្ញុំថាខ្ញុំកំពុងគិតអ្វី។ |
| I often read between the lines to find the deeper meaning. | ខ្ញុំច្រើនអានរវាងបន្ទាត់ ដើម្បីរកអត្ថន័យដែលជ្រៅជាង។ |
| I make decisions based on my values and what feels right. | ខ្ញុំសម្រេចចិត្តផ្អែកលើតម្លៃរបស់ខ្ញុំ និងអ្វីដែលមានអារម្មណ៍ថាត្រឹមត្រូវ។ |
| Rules and routines can feel limiting to me. | ច្បាប់ និងទម្លាប់ដដែលៗ អាចធ្វើឱ្យខ្ញុំមានអារម្មណ៍ថាត្រូវបានកំណត់ព្រំដែន។ |

### Screens, buttons and labels

| English | ខ្មែរ |
|---|---|
| Personality | បុគ្គលិកលក្ខណៈ |
| Discover your personality type | ស្វែងរកប្រភេទបុគ្គលិកលក្ខណៈរបស់អ្នក |
| 40 quick statements · about 5 minutes | សេចក្តីថ្លែងខ្លីៗ ៤០ · ប្រហែល ៥ នាទី |
| How to work well with {name} | របៀបធ្វើការល្អជាមួយ {name} |
| Personality types could not load. Pull down to refresh. | មិនអាចផ្ទុកប្រភេទបុគ្គលិកលក្ខណៈបានទេ។ ទាញចុះក្រោមដើម្បីផ្ទុកឡើងវិញ។ |
| Personality type | ប្រភេទបុគ្គលិកលក្ខណៈ |
| Forty short statements. Answer how you really are — not how you wish you were, or how your job needs you to be. | សេចក្តីថ្លែងខ្លីៗសែសិប។ ឆ្លើយតាមអ្វីដែលអ្នកពិតជាជា — មិនមែនអ្វីដែលអ្នកចង់ក្លាយជា ឬអ្វីដែលការងារត្រូវការឱ្យអ្នកជានោះទេ។ |
| There are no right answers, and no type is better than another. | គ្មានចម្លើយត្រូវទេ ហើយគ្មានប្រភេទណាល្អជាងប្រភេទណាទេ។ |
| Your character | តួអង្គរបស់អ្នក |
| Female | ស្រី |
| Male | ប្រុស |
| Carry on — {n} of 40 answered | បន្ត — បានឆ្លើយ {n} ក្នុងចំណោម ៤០ |
| Start | ចាប់ផ្តើម |
| Choose one to start. | ជ្រើសរើសមួយដើម្បីចាប់ផ្តើម។ |
| I already know my type | ខ្ញុំដឹងប្រភេទរបស់ខ្ញុំរួចហើយ |
| Choose your type | ជ្រើសរើសប្រភេទរបស់អ្នក |
| Already taken a test like this before? Pick the four letters you got. | ធ្លាប់ធ្វើតេស្តបែបនេះពីមុនមែនទេ? ជ្រើសរើសអក្សរបួនដែលអ្នកទទួលបាន។ |
| For your character — choose one first. | សម្រាប់តួអង្គរបស់អ្នក — ជ្រើសរើសមួយជាមុនសិន។ |
| Agree | យល់ស្រប |
| Disagree | មិនយល់ស្រប |
| See my type | មើលប្រភេទរបស់ខ្ញុំ |
| Strongly disagree | មិនយល់ស្របខ្លាំង |
| Slightly disagree | មិនយល់ស្របបន្តិច |
| Neutral | អព្យាក្រឹត |
| Slightly agree | យល់ស្របបន្តិច |
| Strongly agree | យល់ស្របខ្លាំង |
| Uses the same four letters as Myers–Briggs®. This is GP’s own short questionnaire, not the official MBTI® assessment. | ប្រើអក្សរបួនដូចគ្នានឹង Myers–Briggs®។ នេះជាកម្រងសំណួរខ្លីរបស់ GP ផ្ទាល់ មិនមែនការវាយតម្លៃ MBTI® ផ្លូវការទេ។ |
| A type describes what comes naturally to you — not what you are able to do. | ប្រភេទមួយពិពណ៌នាអ្វីដែលកើតឡើងដោយធម្មជាតិចំពោះអ្នក — មិនមែនអ្វីដែលអ្នកអាចធ្វើបាននោះទេ។ |
| No type chosen yet. | មិនទាន់បានជ្រើសរើសប្រភេទនៅឡើយ។ |
| {name}’s type | ប្រភេទរបស់ {name} |
| Strengths | ចំណុចខ្លាំង |
| Watch out for | ត្រូវប្រយ័ត្ន |
| For you, right now | សម្រាប់អ្នក នៅពេលនេះ |
| What season are you in? | តើអ្នកកំពុងនៅក្នុងរដូវកាលណា? |
| only you see this | មានតែអ្នកទេដែលឃើញ |
| How others can work well with you | របៀបដែលអ្នកដទៃអាចធ្វើការល្អជាមួយអ្នក |
| Working with {name} | ការធ្វើការជាមួយ {name} |
| Show my type to the team | បង្ហាញប្រភេទរបស់ខ្ញុំដល់ក្រុម |
| Your season always stays private. | រដូវកាលរបស់អ្នកតែងតែរក្សាជាឯកជន។ |
| Retake the test | ធ្វើតេស្តម្តងទៀត |
| Choose a different type | ជ្រើសរើសប្រភេទផ្សេង |
| Could not save — check your connection and try again. | មិនអាចរក្សាទុកបានទេ — សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត។ |
| Answer every statement first. | សូមឆ្លើយសេចក្តីថ្លែងទាំងអស់ជាមុនសិន។ |
| Male or female | ប្រុស ឬស្រី |
| Used for your personality character. | ប្រើសម្រាប់តួអង្គបុគ្គលិកលក្ខណៈរបស់អ្នក។ |

### The sixteen type names, the four groups and the four pairs

_A type name is translated as one phrase ("The Guide" → អ្នកណែនាំ) — Khmer has no "the"._

| English | ខ្មែរ |
|---|---|
| The Strategist | អ្នកយុទ្ធសាស្ត្រ |
| The Thinker | អ្នកគិតពិចារណា |
| The Director | អ្នកដឹកនាំ |
| The Innovator | អ្នកច្នៃប្រឌិត |
| The Guide | អ្នកណែនាំ |
| The Dreamer | អ្នកស្រមៃ |
| The Encourager | អ្នកលើកទឹកចិត្ត |
| The Spark | អ្នកបំផុសចិត្ត |
| The Steward | អ្នកមើលខុសត្រូវ |
| The Carer | អ្នកមើលថែ |
| The Organizer | អ្នករៀបចំ |
| The Host | ម្ចាស់ផ្ទះ |
| The Fixer | អ្នកជួសជុល |
| The Artist | សិល្បករ |
| The Trailblazer | អ្នកត្រួសត្រាយ |
| The Energizer | អ្នកផ្តល់ថាមពល |
| The students need you. So does your own soul — keep your own time with God. | សិស្សត្រូវការអ្នក។ ព្រលឹងរបស់អ្នកក៏ដូច្នោះដែរ — រក្សាពេលផ្ទាល់ខ្លួនរបស់អ្នកជាមួយព្រះ។ |
| Minds | ក្រុមគំនិត |
| Hearts | ក្រុមចិត្ត |
| Anchors | ក្រុមយុថ្កា |
| Movers | ក្រុមសកម្ម |
| Energy | ថាមពល |
| Extraverted | ចេញក្រៅ |
| Introverted | ក្នុងខ្លួន |
| Information | ព័ត៌មាន |
| Sensing | ជាក់ស្តែង |
| Intuitive | វិចារណញាណ |
| Decisions | ការសម្រេចចិត្ត |
| Thinking | ហេតុផល |
| Feeling | អារម្មណ៍ |
| Structure | របៀបរស់នៅ |
| Judging | មានផែនការ |
| Perceiving | បត់បែន |

### Descriptions, strengths, watch-outs and tips

| English | ខ្មែរ |
|---|---|
| Big-picture thinkers who love ideas, systems and getting things right. | អ្នកគិតរូបភាពធំ ដែលស្រឡាញ់គំនិត ប្រព័ន្ធ និងការធ្វើអ្វីៗឱ្យបានត្រឹមត្រូវ។ |
| People-first idealists who see potential and care about meaning. | អ្នកដែលយកមនុស្សជាធំ មើលឃើញសក្តានុពល និងយកចិត្តទុកដាក់ចំពោះអត្ថន័យ។ |
| Steady, faithful people who hold a team together with care and order. | មនុស្សនឹងនរ និងស្មោះត្រង់ ដែលរក្សាក្រុមឱ្យនៅជាមួយគ្នា ដោយការយកចិត្តទុកដាក់ និងសណ្តាប់ធ្នាប់។ |
| Practical, present people who jump in and make things happen. | មនុស្សជាក់ស្តែង រស់នៅក្នុងពេលបច្ចុប្បន្ន ដែលចូលធ្វើភ្លាម ហើយធ្វើឱ្យកិច្ចការកើតឡើង។ |
| Sees the long road and plans the route. | មើលឃើញផ្លូវវែងឆ្ងាយ ហើយរៀបផែនការផ្លូវដើរ។ |
| Strategists think in years, not days. They see where things are heading, notice what will not work long before anyone else does, and quietly build a plan to get somewhere better. They are independent, driven and hard to rattle, and they would much rather do a few things excellently than many things halfway. | អ្នកយុទ្ធសាស្ត្រគិតជាឆ្នាំ មិនមែនជាថ្ងៃទេ។ ពួកគេមើលឃើញថាអ្វីៗកំពុងឆ្ពោះទៅណា ដឹងមុនគេថាអ្វីនឹងមិនដំណើរការ ហើយស្ងាត់ៗរៀបផែនការដើម្បីទៅដល់កន្លែងដែលល្អជាង។ ពួកគេឯករាជ្យ មានការតាំងចិត្ត និងមិនងាយរំខាន ហើយពួកគេចូលចិត្តធ្វើរឿងតិចតួចឱ្យបានល្អឥតខ្ចោះ ជាជាងធ្វើរឿងច្រើនពាក់កណ្តាលទី។ |
| Sees the big picture and plans ahead | មើលឃើញរូបភាពធំ ហើយរៀបផែនការជាមុន |
| Honest and clear about what needs to change | ស្មោះត្រង់ និងច្បាស់លាស់អំពីអ្វីដែលត្រូវផ្លាស់ប្តូរ |
| Keeps high standards and follows through | រក្សាស្តង់ដារខ្ពស់ ហើយធ្វើរហូតដល់ចប់ |
| Can seem cold or critical when focused | អាចមើលទៅត្រជាក់ ឬរិះគន់ នៅពេលកំពុងផ្តោតអារម្មណ៍ |
| May forget to explain the plan to everyone else | អាចភ្លេចពន្យល់ផែនការដល់អ្នកដទៃ |
| Can get impatient with people who move slowly | អាចអន្ទះសារជាមួយមនុស្សដែលធ្វើអ្វីយឺត |
| Give them the goal and the room to work out the route. | ប្រាប់ពួកគេពីគោលដៅ ហើយទុកឱកាសឱ្យពួកគេរកផ្លូវដោយខ្លួនឯង។ |
| Bring them a problem early — they would rather plan than rescue. | ប្រាប់ពួកគេពីបញ្ហាឱ្យបានឆាប់ — ពួកគេចូលចិត្តរៀបផែនការ ជាជាងដោះស្រាយពេលយឺតពេក។ |
| Asks why until the answer holds together. | សួរថាហេតុអ្វី រហូតដល់ចម្លើយសមហេតុផល។ |
| Thinkers want to understand how things really work. They question assumptions, spot the flaw in an argument, and love a problem nobody has solved yet. Quiet and curious, they often have their best ideas alone, and they are happiest when they have time to think something all the way through. | អ្នកគិតពិចារណាចង់យល់ថាអ្វីៗដំណើរការយ៉ាងដូចម្តេចពិតប្រាកដ។ ពួកគេសួរសំណួរលើការសន្មត់ រកឃើញកំហុសក្នុងអំណះអំណាង ហើយស្រឡាញ់បញ្ហាដែលគ្មាននរណាដោះស្រាយបាន។ ស្ងាត់ និងចង់ដឹងចង់ឃើញ ពួកគេច្រើនតែមានគំនិតល្អបំផុតពេលនៅម្នាក់ឯង ហើយសប្បាយចិត្តបំផុតពេលមានពេលគិតរឿងមួយឱ្យដល់ទីបញ្ចប់។ |
| Solves hard problems in fresh ways | ដោះស្រាយបញ្ហាពិបាកតាមរបៀបថ្មី |
| Fair-minded and open to any good idea | យុត្តិធម៌ និងបើកចិត្តទទួលគំនិតល្អណាមួយ |
| Calm and objective under pressure | ស្ងប់ស្ងាត់ និងមិនលម្អៀង នៅពេលមានសម្ពាធ |
| Can get lost in ideas and lose track of deadlines | អាចវង្វេងក្នុងគំនិត ហើយភ្លេចពេលកំណត់ |
| May leave feelings unspoken or unnoticed | អាចមិននិយាយ ឬមិនកត់សម្គាល់អារម្មណ៍ |
| Can find routine tasks draining | អាចហត់នឿយជាមួយការងារដដែលៗ |
| Ask for their thinking, not just their agreement. | សួររកគំនិតរបស់ពួកគេ មិនមែនគ្រាន់តែការយល់ព្រមទេ។ |
| Help them turn a good idea into a next step with a date on it. | ជួយពួកគេប្តូរគំនិតល្អ ទៅជាជំហានបន្ទាប់ដែលមានកាលបរិច្ឆេទ។ |
| Turns a vision into a plan and a plan into action. | ប្តូរចក្ខុវិស័យទៅជាផែនការ ហើយផែនការទៅជាសកម្មភាព។ |
| Directors are natural leaders who see what could be done and organize people to do it. They are decisive, confident and energized by a challenge. They make hard calls, set clear goals and push the team forward, and they are at their best when there is something big to build. | អ្នកដឹកនាំជាអ្នកដឹកនាំពីធម្មជាតិ ដែលមើលឃើញអ្វីដែលអាចធ្វើបាន ហើយរៀបចំមនុស្សឱ្យធ្វើវា។ ពួកគេសម្រេចចិត្តបានរហ័ស មានទំនុកចិត្ត ហើយមានកម្លាំងពេលជួបបញ្ហាប្រឈម។ ពួកគេសម្រេចរឿងពិបាក កំណត់គោលដៅច្បាស់ ហើយជំរុញក្រុមទៅមុខ ហើយពួកគេល្អបំផុតពេលមានអ្វីធំៗត្រូវកសាង។ |
| Decisive and clear in a crisis | សម្រេចចិត្តបាន និងច្បាស់លាស់ក្នុងគ្រាលំបាក |
| Organizes people and resources well | រៀបចំមនុស្ស និងធនធានបានល្អ |
| Brings energy and ambition to a team | នាំថាមពល និងមហិច្ឆតាមកក្រុម |
| Can push too hard and leave people behind | អាចជំរុញខ្លាំងពេក ហើយទុកមនុស្សនៅពីក្រោយ |
| May decide before everyone has been heard | អាចសម្រេចចិត្ត មុនពេលស្តាប់គ្រប់គ្នា |
| Can come across as blunt or demanding | អាចមើលទៅនិយាយត្រង់ពេក ឬទាមទារច្រើន |
| Be direct — they respect people who speak plainly. | និយាយត្រង់ៗ — ពួកគេគោរពមនុស្សដែលនិយាយច្បាស់។ |
| Tell them how the team is feeling; they may not have noticed. | ប្រាប់ពួកគេថាក្រុមមានអារម្មណ៍យ៉ាងណា ព្រោះពួកគេប្រហែលមិនបានកត់សម្គាល់។ |
| Finds a new way through every old problem. | រកផ្លូវថ្មីឆ្លងកាត់បញ្ហាចាស់ៗ។ |
| Innovators love new ideas and the debate that sharpens them. Quick-witted and curious, they see possibilities everywhere and enjoy questioning the way things have always been done. They bring energy to a brainstorm and are brilliant at finding a way around a problem that has everyone else stuck. | អ្នកច្នៃប្រឌិតស្រឡាញ់គំនិតថ្មី និងការជជែកដែលធ្វើឱ្យគំនិតកាន់តែមុត។ ឆ្លាតរហ័ស និងចង់ដឹងចង់ឃើញ ពួកគេមើលឃើញលទ្ធភាពគ្រប់ទីកន្លែង ហើយចូលចិត្តសួររបៀបដែលគេធ្លាប់ធ្វើ។ ពួកគេនាំថាមពលមកការបញ្ចេញគំនិត ហើយពូកែរកផ្លូវជុំវិញបញ្ហាដែលធ្វើឱ្យអ្នកដទៃជាប់គាំង។ |
| Creative and quick at finding solutions | មានការច្នៃប្រឌិត និងរហ័សក្នុងការរកដំណោះស្រាយ |
| Brings energy and humour to the team | នាំថាមពល និងភាពកំប្លែងមកក្រុម |
| Adapts easily when things change | សម្របខ្លួនបានងាយពេលអ្វីៗផ្លាស់ប្តូរ |
| Starts many things and finishes fewer | ចាប់ផ្តើមរឿងច្រើន តែបញ្ចប់បានតិច |
| Can argue for fun and upset people without meaning to | អាចជជែកដេញដោលលេង ហើយធ្វើឱ្យគេខកចិត្តដោយមិនចេតនា |
| May find details and routine boring | អាចធុញទ្រាន់នឹងព័ត៌មានលម្អិត និងការងារដដែលៗ |
| Give them a real problem to crack, not just a task list. | ឱ្យពួកគេនូវបញ្ហាពិតប្រាកដដើម្បីដោះស្រាយ មិនមែនគ្រាន់តែបញ្ជីការងារទេ។ |
| Pair them with someone who loves to finish things. | ដាក់ពួកគេជាមួយអ្នកដែលចូលចិត្តបញ្ចប់ការងារ។ |
| Quietly sees who people could become. | ស្ងាត់ៗមើលឃើញថាមនុស្សអាចក្លាយជាអ្វី។ |
| Guides combine deep care for people with a clear sense of purpose. They notice what others are feeling, often before it is said, and they have a gift for helping people grow. Quiet but determined, they are driven by values and meaning, and they want their work to make a real difference in people's lives. | អ្នកណែនាំរួមបញ្ចូលការយកចិត្តទុកដាក់យ៉ាងជ្រៅចំពោះមនុស្ស ជាមួយនឹងគោលបំណងច្បាស់លាស់។ ពួកគេដឹងពីអារម្មណ៍អ្នកដទៃ ជារឿយៗមុនពេលគេនិយាយ ហើយមានអំណោយទានក្នុងការជួយមនុស្សឱ្យលូតលាស់។ ស្ងាត់ តែមានការតាំងចិត្ត ពួកគេត្រូវបានជំរុញដោយតម្លៃ និងអត្ថន័យ ហើយចង់ឱ្យការងាររបស់ពួកគេធ្វើឱ្យជីវិតមនុស្សប្រែប្រួលពិតប្រាកដ។ |
| Deep insight into people | យល់ពីមនុស្សយ៉ាងជ្រៅ |
| Committed to what is right and meaningful | ប្តេជ្ញាចំពោះអ្វីដែលត្រឹមត្រូវ និងមានអត្ថន័យ |
| Encourages others to grow | លើកទឹកចិត្តអ្នកដទៃឱ្យលូតលាស់ |
| Takes on other people's burdens and burns out | យកបន្ទុករបស់អ្នកដទៃមកលីខ្លួនឯង រហូតអស់កម្លាំង |
| Can be too hard on themselves | អាចតឹងរ៉ឹងពេកចំពោះខ្លួនឯង |
| May hold back concerns to keep the peace | អាចលាក់ការព្រួយបារម្ភ ដើម្បីរក្សាសន្តិភាព |
| Give them time to think before asking for an answer. | ឱ្យពួកគេមានពេលគិត មុននឹងសួររកចម្លើយ។ |
| Check in on how they are doing — they rarely say when they are tired. | សួរសុខទុក្ខពួកគេ — ពួកគេកម្រនិយាយពេលហត់នឿយណាស់។ |
| Lives by deep values and hopes for a better world. | រស់នៅតាមតម្លៃជ្រៅ ហើយសង្ឃឹមលើពិភពលោកដែលល្អជាង។ |
| Dreamers are gentle, sincere people with a strong inner sense of right and wrong. They care deeply about people and about living with integrity. Creative and imaginative, they see the good in others and hope for a better world, and they give their whole heart to work that matters to them. | អ្នកស្រមៃជាមនុស្សទន់ភ្លន់ និងស្មោះស្ម័គ្រ ដែលមានការយល់ដឹងខាងក្នុងយ៉ាងមាំអំពីត្រូវនិងខុស។ ពួកគេយកចិត្តទុកដាក់យ៉ាងជ្រៅចំពោះមនុស្ស និងការរស់នៅដោយសុចរិត។ មានការច្នៃប្រឌិត និងការស្រមៃ ពួកគេមើលឃើញភាពល្អក្នុងអ្នកដទៃ សង្ឃឹមលើពិភពលោកដែលល្អជាង ហើយថ្វាយចិត្តទាំងស្រុងចំពោះការងារដែលសំខាន់សម្រាប់ពួកគេ។ |
| Compassionate and genuinely kind | មានចិត្តអាណិតអាសូរ និងចិត្តល្អពិតប្រាកដ |
| Creative and full of imagination | មានការច្នៃប្រឌិត និងពោរពេញដោយការស្រមៃ |
| Loyal to people and to their values | ស្មោះត្រង់ចំពោះមនុស្ស និងតម្លៃរបស់ខ្លួន |
| Takes criticism very personally | យកការរិះគន់មកគិតជារឿងផ្ទាល់ខ្លួនខ្លាំង |
| Can struggle with practical details and deadlines | អាចពិបាកជាមួយព័ត៌មានលម្អិតជាក់ស្តែង និងពេលកំណត់ |
| May withdraw instead of addressing conflict | អាចដកខ្លួនចេញ ជំនួសឱ្យការដោះស្រាយជម្លោះ |
| Show them why the work matters, not just what to do. | បង្ហាញពួកគេថាហេតុអ្វីការងារនេះសំខាន់ មិនមែនត្រឹមតែត្រូវធ្វើអ្វីទេ។ |
| Give feedback gently and in private. | ផ្តល់មតិយោបល់ដោយទន់ភ្លន់ និងដោយឡែក។ |
| Draws people together and calls out their best. | ប្រមូលមនុស្សឱ្យនៅជាមួយគ្នា ហើយទាញយកចំណុចល្អបំផុតរបស់ពួកគេ។ |
| Encouragers are warm, inspiring people who bring out the best in those around them. They notice what each person needs, speak life into them, and naturally gather people around a shared purpose. They are at home leading, teaching and mentoring, and a team feels more united when they are in it. | អ្នកលើកទឹកចិត្តជាមនុស្សកក់ក្តៅ និងបំផុសគំនិត ដែលទាញយកចំណុចល្អបំផុតរបស់អ្នកនៅជុំវិញ។ ពួកគេដឹងថាម្នាក់ៗត្រូវការអ្វី និយាយពាក្យផ្តល់ជីវិតដល់ពួកគេ ហើយប្រមូលមនុស្សជុំវិញគោលបំណងរួមដោយធម្មជាតិ។ ពួកគេស្ទាត់ក្នុងការដឹកនាំ បង្រៀន និងជាអ្នកណែនាំ ហើយក្រុមមានការរួបរួមជាងមុនពេលមានពួកគេ។ |
| Builds unity and team spirit | កសាងការរួបរួម និងស្មារតីក្រុម |
| Speaks encouragement and vision | និយាយពាក្យលើកទឹកចិត្ត និងចក្ខុវិស័យ |
| Reads people and situations well | យល់ពីមនុស្ស និងស្ថានភាពបានល្អ |
| Can overcommit to helping everyone | អាចសន្យាជួយគ្រប់គ្នាច្រើនពេក |
| Takes it hard when people are unhappy with them | ពិបាកចិត្តខ្លាំង ពេលមាននរណាម្នាក់មិនពេញចិត្តនឹងខ្លួន |
| May neglect their own needs | អាចធ្វេសប្រហែសតម្រូវការរបស់ខ្លួនឯង |
| Thank them — encouragement fuels them too. | អរគុណពួកគេ — ការលើកទឹកចិត្តក៏ផ្តល់កម្លាំងដល់ពួកគេដែរ។ |
| Help them say no to the extra thing. | ជួយពួកគេឱ្យហ៊ានបដិសេធរឿងបន្ថែម។ |
| Brings joy, ideas and possibility into the room. | នាំសេចក្តីអំណរ គំនិត និងលទ្ធភាពចូលមកក្នុងបន្ទប់។ |
| Sparks are enthusiastic, creative people who light up a room. They love people, new ideas and new experiences, and they see possibility everywhere. They connect easily with almost anyone and bring warmth and hope to a team, especially when something new is starting. | អ្នកបំផុសចិត្តជាមនុស្សមានភាពរីករាយ និងការច្នៃប្រឌិត ដែលធ្វើឱ្យបន្ទប់ភ្លឺស្វាង។ ពួកគេស្រឡាញ់មនុស្ស គំនិតថ្មី និងបទពិសោធន៍ថ្មី ហើយមើលឃើញលទ្ធភាពគ្រប់ទីកន្លែង។ ពួកគេភ្ជាប់ទំនាក់ទំនងបានងាយជាមួយស្ទើរតែគ្រប់គ្នា ហើយនាំភាពកក់ក្តៅ និងក្តីសង្ឃឹមមកក្រុម ជាពិសេសពេលមានអ្វីថ្មីកំពុងចាប់ផ្តើម។ |
| Enthusiastic and full of ideas | មានភាពរីករាយ និងពោរពេញដោយគំនិត |
| Connects easily with all kinds of people | ភ្ជាប់ទំនាក់ទំនងបានងាយជាមួយមនុស្សគ្រប់ប្រភេទ |
| Brings hope and energy to a team | នាំក្តីសង្ឃឹម និងថាមពលមកក្រុម |
| Gets distracted by the next exciting thing | ងាយរំខានដោយរឿងគួរឱ្យរំភើបបន្ទាប់ |
| Can find routine and follow-through hard | អាចពិបាកជាមួយការងារដដែលៗ និងការធ្វើរហូតដល់ចប់ |
| May overpromise and feel overwhelmed | អាចសន្យាច្រើនពេក ហើយមានអារម្មណ៍ថាធ្ងន់ពេក |
| Let them start things and bring others in. | ឱ្យពួកគេចាប់ផ្តើមរឿងថ្មី ហើយនាំអ្នកដទៃចូលរួម។ |
| Agree on one or two things they will finish this week. | ព្រមព្រៀងគ្នាលើរឿងមួយ ឬពីរដែលពួកគេនឹងបញ្ចប់នៅសប្តាហ៍នេះ។ |
| Faithful with the details, dependable to the end. | ស្មោះត្រង់ក្នុងរឿងលម្អិត និងអាចទុកចិត្តបានរហូតដល់ចប់។ |
| Stewards are responsible, careful people who do what they say they will do. They respect order, keep good records and make sure things are done properly. Practical and loyal, they are the ones a team relies on to keep the basics running well — quietly, faithfully and without needing to be thanked. | អ្នកមើលខុសត្រូវជាមនុស្សមានទំនួលខុសត្រូវ និងប្រុងប្រយ័ត្ន ដែលធ្វើអ្វីដែលខ្លួនបាននិយាយ។ ពួកគេគោរពសណ្តាប់ធ្នាប់ រក្សាកំណត់ត្រាបានល្អ ហើយធ្វើឱ្យប្រាកដថាអ្វីៗត្រូវបានធ្វើត្រឹមត្រូវ។ ជាក់ស្តែង និងស្មោះត្រង់ ពួកគេជាអ្នកដែលក្រុមពឹងផ្អែក ដើម្បីឱ្យរឿងមូលដ្ឋានដំណើរការបានល្អ — ដោយស្ងាត់ៗ ដោយស្មោះត្រង់ និងមិនត្រូវការឱ្យគេអរគុណ។ |
| Reliable and faithful with responsibility | អាចទុកចិត្តបាន និងស្មោះត្រង់ចំពោះទំនួលខុសត្រូវ |
| Careful with details, money and records | ប្រុងប្រយ័ត្នចំពោះព័ត៌មានលម្អិត លុយ និងកំណត់ត្រា |
| Calm, steady and practical | ស្ងប់ស្ងាត់ នឹងនរ និងជាក់ស្តែង |
| Can resist change even when it is needed | អាចទប់ទល់នឹងការផ្លាស់ប្តូរ សូម្បីតែពេលចាំបាច់ |
| May seem rigid about rules and process | អាចមើលទៅតឹងរ៉ឹងចំពោះច្បាប់ និងដំណើរការ |
| Can keep stress inside until it builds up | អាចទុកភាពតានតឹងនៅក្នុងខ្លួន រហូតដល់វាកើនឡើង |
| Explain changes early and give reasons. | ពន្យល់ពីការផ្លាស់ប្តូរឱ្យបានឆាប់ ហើយប្រាប់ពីមូលហេតុ។ |
| Tell them clearly what is expected and by when. | ប្រាប់ពួកគេឱ្យច្បាស់ថាគេរំពឹងអ្វី និងត្រូវរួចនៅពេលណា។ |
| Serves quietly and remembers what matters to people. | បម្រើដោយស្ងាត់ៗ ហើយចងចាំអ្វីដែលសំខាន់ចំពោះមនុស្ស។ |
| Carers are warm, humble people who love to look after others. They remember the small details — someone's birthday, how they like their coffee, what they were worried about last week. Faithful and hardworking, they serve without fuss, and people feel safe and cared for around them. | អ្នកមើលថែជាមនុស្សកក់ក្តៅ និងរាបសា ដែលចូលចិត្តមើលថែអ្នកដទៃ។ ពួកគេចងចាំរឿងតូចៗ — ថ្ងៃកំណើតរបស់នរណាម្នាក់ របៀបដែលគេចូលចិត្តកាហ្វេ អ្វីដែលគេព្រួយបារម្ភកាលពីសប្តាហ៍មុន។ ស្មោះត្រង់ និងឧស្សាហ៍ ពួកគេបម្រើដោយមិនត្អូញត្អែរ ហើយមនុស្សមានអារម្មណ៍សុវត្ថិភាព និងត្រូវបានយកចិត្តទុកដាក់នៅជុំវិញពួកគេ។ |
| Kind, patient and attentive | ចិត្តល្អ អត់ធ្មត់ និងយកចិត្តទុកដាក់ |
| Faithful and hardworking | ស្មោះត្រង់ និងឧស្សាហ៍ |
| Remembers what matters to people | ចងចាំអ្វីដែលសំខាន់ចំពោះមនុស្ស |
| Finds it hard to say no | ពិបាកនឹងបដិសេធ |
| May not speak up about their own needs | អាចមិននិយាយពីតម្រូវការរបស់ខ្លួនឯង |
| Can feel unappreciated and quietly tired | អាចមានអារម្មណ៍ថាគេមិនឱ្យតម្លៃ ហើយហត់នឿយដោយស្ងាត់ៗ |
| Notice and thank them for the unseen work. | កត់សម្គាល់ ហើយអរគុណពួកគេចំពោះការងារដែលគេមិនបានឃើញ។ |
| Ask directly what they need — they will not always say. | សួរត្រង់ៗថាពួកគេត្រូវការអ្វី — ពួកគេមិនតែងតែប្រាប់ទេ។ |
| Brings order, clear roles and follow-through. | នាំសណ្តាប់ធ្នាប់ តួនាទីច្បាស់លាស់ និងការធ្វើរហូតដល់ចប់។ |
| Organizers are practical, decisive people who like things done well and on time. They set clear expectations, create structure and make sure everyone knows their part. Honest and hardworking, they get projects finished and keep a team moving when things could easily fall apart. | អ្នករៀបចំជាមនុស្សជាក់ស្តែង និងសម្រេចចិត្តបានរហ័ស ដែលចូលចិត្តឱ្យអ្វីៗធ្វើបានល្អ និងទាន់ពេល។ ពួកគេកំណត់ការរំពឹងទុកឱ្យច្បាស់ បង្កើតរចនាសម្ព័ន្ធ ហើយធ្វើឱ្យប្រាកដថាគ្រប់គ្នាដឹងពីតួនាទីរបស់ខ្លួន។ ស្មោះត្រង់ និងឧស្សាហ៍ ពួកគេធ្វើឱ្យគម្រោងបានបញ្ចប់ ហើយរក្សាក្រុមឱ្យដើរទៅមុខ ពេលអ្វីៗអាចបែកបាក់បានយ៉ាងងាយ។ |
| Organizes people and tasks well | រៀបចំមនុស្ស និងការងារបានល្អ |
| Clear, honest and dependable | ច្បាស់លាស់ ស្មោះត្រង់ និងអាចទុកចិត្តបាន |
| Gets things finished on time | ធ្វើការងារឱ្យរួចទាន់ពេល |
| Can be controlling or impatient | អាចចូលចិត្តគ្រប់គ្រងពេក ឬអន្ទះសារ |
| May miss how others are feeling | អាចមិនកត់សម្គាល់ពីអារម្មណ៍អ្នកដទៃ |
| Can find it hard to adapt when plans change | អាចពិបាកសម្របខ្លួនពេលផែនការផ្លាស់ប្តូរ |
| Be clear, prepared and on time. | ឱ្យច្បាស់លាស់ ត្រៀមខ្លួនរួចរាល់ និងទាន់ពេល។ |
| Share the reasons behind a change, not just the change. | ប្រាប់ពីមូលហេតុនៃការផ្លាស់ប្តូរ មិនមែនត្រឹមតែការផ្លាស់ប្តូរទេ។ |
| Makes everyone feel welcome and looked after. | ធ្វើឱ្យគ្រប់គ្នាមានអារម្មណ៍ថាត្រូវបានស្វាគមន៍ និងមើលថែ។ |
| Hosts are caring, sociable people who make a place feel like home. They notice who is left out, bring people together and make sure everyone has what they need. Loyal and practical, they love serving others and help a community stay warm, connected and well organized. | ម្ចាស់ផ្ទះជាមនុស្សយកចិត្តទុកដាក់ និងរួសរាយរាក់ទាក់ ដែលធ្វើឱ្យកន្លែងមួយមានអារម្មណ៍ដូចផ្ទះ។ ពួកគេកត់សម្គាល់អ្នកដែលត្រូវគេទុកចោល នាំមនុស្សមកជាមួយគ្នា ហើយធ្វើឱ្យប្រាកដថាគ្រប់គ្នាមានអ្វីដែលខ្លួនត្រូវការ។ ស្មោះត្រង់ និងជាក់ស្តែង ពួកគេស្រឡាញ់ការបម្រើអ្នកដទៃ ហើយជួយសហគមន៍ឱ្យនៅតែកក់ក្តៅ ភ្ជាប់ទំនាក់ទំនង និងរៀបចំបានល្អ។ |
| Welcoming and hospitable | ស្វាគមន៍ និងទទួលភ្ញៀវដោយរាក់ទាក់ |
| Practical in caring for people | ជាក់ស្តែងក្នុងការមើលថែមនុស្ស |
| Builds harmony and belonging | កសាងភាពសុខដុម និងអារម្មណ៍ជាផ្នែកមួយ |
| Worries a lot about what others think | ព្រួយបារម្ភច្រើនពីអ្វីដែលអ្នកដទៃគិត |
| May avoid hard conversations | អាចជៀសវាងការសន្ទនាពិបាកៗ |
| Can take on too much to keep everyone happy | អាចទទួលយកច្រើនពេក ដើម្បីឱ្យគ្រប់គ្នាសប្បាយចិត្ត |
| Show appreciation — it means a lot to them. | បង្ហាញការដឹងគុណ — វាមានន័យច្រើនសម្រាប់ពួកគេ។ |
| Include them in plans that affect people. | ឱ្យពួកគេចូលរួមក្នុងផែនការដែលប៉ះពាល់ដល់មនុស្ស។ |
| Calm, hands-on and good in a crisis. | ស្ងប់ស្ងាត់ ធ្វើដោយដៃផ្ទាល់ និងពូកែក្នុងគ្រាលំបាក។ |
| Fixers are practical, independent people who like to understand how things work and make them work better. Calm under pressure, they stay steady when others panic and are often the first to find a practical solution. They learn by doing and prefer action to long discussion. | អ្នកជួសជុលជាមនុស្សជាក់ស្តែង និងឯករាជ្យ ដែលចូលចិត្តយល់ថាអ្វីៗដំណើរការយ៉ាងណា ហើយធ្វើឱ្យវាដំណើរការល្អជាងមុន។ ស្ងប់ស្ងាត់ពេលមានសម្ពាធ ពួកគេនៅតែនឹងនរពេលអ្នកដទៃភ័យស្លន់ស្លោ ហើយជារឿយៗជាអ្នកដំបូងដែលរកឃើញដំណោះស្រាយជាក់ស្តែង។ ពួកគេរៀនតាមរយៈការធ្វើ ហើយចូលចិត្តសកម្មភាពជាងការពិភាក្សាយូរ។ |
| Calm and capable in a crisis | ស្ងប់ស្ងាត់ និងមានសមត្ថភាពក្នុងគ្រាលំបាក |
| Practical and good with their hands | ជាក់ស្តែង និងពូកែធ្វើការដោយដៃ |
| Independent and adaptable | ឯករាជ្យ និងសម្របខ្លួនបាន |
| Can seem distant or hard to read | អាចមើលទៅឆ្ងាយ ឬពិបាកយល់ពីចិត្ត |
| May dislike long meetings and heavy planning | អាចមិនចូលចិត្តការប្រជុំយូរ និងការរៀបផែនការច្រើន |
| Can take risks without telling others | អាចប្រថុយប្រថាន ដោយមិនប្រាប់អ្នកដទៃ |
| Give them a real problem and let them get on with it. | ឱ្យពួកគេនូវបញ្ហាពិតប្រាកដ ហើយទុកឱ្យពួកគេដោះស្រាយ។ |
| Keep meetings short and practical. | ធ្វើការប្រជុំឱ្យខ្លី និងជាក់ស្តែង។ |
| Gentle, present, and quietly creative. | ទន់ភ្លន់ រស់នៅក្នុងពេលបច្ចុប្បន្ន និងច្នៃប្រឌិតដោយស្ងាត់ៗ។ |
| Artists are gentle, sensitive people who notice beauty and live in the present moment. They express themselves through what they make and do more than through words. Warm and accepting, they care deeply about people, and they bring kindness and creativity to a team without needing the spotlight. | សិល្បករជាមនុស្សទន់ភ្លន់ និងរសើប ដែលកត់សម្គាល់ភាពស្រស់ស្អាត ហើយរស់នៅក្នុងពេលបច្ចុប្បន្ន។ ពួកគេបង្ហាញខ្លួនតាមរយៈអ្វីដែលពួកគេបង្កើត និងធ្វើ ច្រើនជាងតាមពាក្យសម្តី។ កក់ក្តៅ និងទទួលយកអ្នកដទៃ ពួកគេយកចិត្តទុកដាក់យ៉ាងជ្រៅចំពោះមនុស្ស ហើយនាំចិត្តល្អ និងការច្នៃប្រឌិតមកក្រុម ដោយមិនត្រូវការការយកចិត្តទុកដាក់ពីគេ។ |
| Kind and accepting of others | ចិត្តល្អ និងទទួលយកអ្នកដទៃ |
| Creative and practical | ច្នៃប្រឌិត និងជាក់ស្តែង |
| Flexible and easy to work with | បត់បែន និងងាយធ្វើការជាមួយ |
| Can avoid conflict until it is too late | អាចជៀសវាងជម្លោះ រហូតដល់យឺតពេល |
| May struggle with long-term planning | អាចពិបាកជាមួយការរៀបផែនការរយៈពេលវែង |
| Can feel hurt but not say so | អាចឈឺចាប់ក្នុងចិត្ត តែមិននិយាយ |
| Give them freedom in how they do the work. | ឱ្យពួកគេមានសេរីភាពក្នុងរបៀបធ្វើការងារ។ |
| Ask for their opinion — they may not offer it. | សួររកមតិរបស់ពួកគេ — ពួកគេប្រហែលមិននិយាយឡើងដោយខ្លួនឯង។ |
| Jumps in, takes risks and gets things moving. | ចូលធ្វើភ្លាម ហ៊ានប្រថុយ ហើយធ្វើឱ្យអ្វីៗចាប់ផ្តើមដើរ។ |
| Trailblazers are bold, energetic people who love action. They think fast, read a situation quickly and are happy to try something new while others are still discussing it. Practical and confident, they bring momentum to a team and are at their best in the middle of things. | អ្នកត្រួសត្រាយជាមនុស្សក្លាហាន និងពោរពេញថាមពល ដែលស្រឡាញ់សកម្មភាព។ ពួកគេគិតលឿន យល់ពីស្ថានភាពបានរហ័ស ហើយរីករាយសាកល្បងអ្វីថ្មី ខណៈពេលអ្នកដទៃនៅតែពិភាក្សា។ ជាក់ស្តែង និងមានទំនុកចិត្ត ពួកគេនាំសន្ទុះមកក្រុម ហើយល្អបំផុតពេលនៅកណ្តាលសកម្មភាព។ |
| Quick to act and solve problems | រហ័សក្នុងការធ្វើ និងដោះស្រាយបញ្ហា |
| Confident and persuasive | មានទំនុកចិត្ត និងពូកែបញ្ចុះបញ្ចូល |
| Adapts easily to change | សម្របខ្លួនបានងាយនឹងការផ្លាស់ប្តូរ |
| Can act before thinking it through | អាចធ្វើមុនពេលគិតឱ្យបានល្អិតល្អន់ |
| May get bored with routine and details | អាចធុញទ្រាន់នឹងការងារដដែលៗ និងព័ត៌មានលម្អិត |
| Can be blunt without meaning harm | អាចនិយាយត្រង់ពេក ដោយគ្មានចេតនាធ្វើឱ្យឈឺចាប់ |
| Give them something to do, not just something to discuss. | ឱ្យពួកគេមានអ្វីត្រូវធ្វើ មិនមែនគ្រាន់តែអ្វីត្រូវពិភាក្សាទេ។ |
| Talk through the risks together before they launch. | ពិភាក្សាពីហានិភ័យជាមួយគ្នា មុនពេលពួកគេចាប់ផ្តើម។ |
| Lights up the room and lives in the moment. | ធ្វើឱ្យបន្ទប់ភ្លឺស្វាង ហើយរស់នៅក្នុងពេលបច្ចុប្បន្ន។ |
| Energizers are fun, warm and spontaneous. They love people, enjoy life and have a gift for making others feel welcome and happy. They are practical helpers who notice what someone needs right now, and a team is more joyful and more connected when they are around. | អ្នកផ្តល់ថាមពលជាមនុស្សសប្បាយ កក់ក្តៅ និងធ្វើអ្វីដោយស្វ័យប្រវត្តិ។ ពួកគេស្រឡាញ់មនុស្ស រីករាយនឹងជីវិត ហើយមានអំណោយទានធ្វើឱ្យអ្នកដទៃមានអារម្មណ៍ថាត្រូវបានស្វាគមន៍ និងសប្បាយចិត្ត។ ពួកគេជាអ្នកជួយជាក់ស្តែង ដែលកត់សម្គាល់ថានរណាម្នាក់ត្រូវការអ្វីនៅពេលនេះ ហើយក្រុមកាន់តែរីករាយ និងស្និទ្ធស្នាលពេលមានពួកគេ។ |
| Brings joy and energy to a team | នាំសេចក្តីអំណរ និងថាមពលមកក្រុម |
| Warm, generous and practical | កក់ក្តៅ ចិត្តទូលាយ និងជាក់ស្តែង |
| Great with people and new situations | ពូកែជាមួយមនុស្ស និងស្ថានភាពថ្មីៗ |
| Can avoid planning ahead | អាចជៀសវាងការរៀបផែនការជាមុន |
| May find serious or slow tasks hard | អាចពិបាកជាមួយការងារធ្ងន់ធ្ងរ ឬយឺត |
| Can struggle with long-term commitments | អាចពិបាកជាមួយការប្តេជ្ញារយៈពេលវែង |
| Let them bring energy to events and welcoming. | ឱ្យពួកគេនាំថាមពលមកកម្មវិធី និងការស្វាគមន៍ភ្ញៀវ។ |
| Help them plan the next step before the excitement fades. | ជួយពួកគេរៀបផែនការជំហានបន្ទាប់ មុនពេលភាពរំភើបរលាយបាត់។ |
| front-line work with people all day | ធ្វើការផ្ទាល់ជាមួយមនុស្សពេញមួយថ្ងៃ |
| teaching and discipling in a school | បង្រៀន និងបង្ហាត់សិស្សក្នុងសាលា |
| leading people and the base | ដឹកនាំមនុស្ស និងមូលដ្ឋាន |
| money, systems and details | លុយ ប្រព័ន្ធ និងព័ត៌មានលម្អិត |
| practical, hands-on service | ការបម្រើជាក់ស្តែងដោយដៃផ្ទាល់ |
| creative work — media and worship | ការងារច្នៃប្រឌិត — ប្រព័ន្ធផ្សព្វផ្សាយ និងការថ្វាយបង្គំ |
| prayer and intercession | ការអធិស្ឋាន និងការទូលអង្វរ |
| Ordinary rhythm | ចង្វាក់ធម្មតា |
| Normal weeks on base. | សប្តាហ៍ធម្មតានៅមូលដ្ឋាន។ |
| A school is running | សាលាកំពុងដំណើរការ |
| Lecture phase — teaching and pastoral care are heavy. | ដំណាក់កាលបង្រៀន — ការបង្រៀន និងការថែរក្សាខាងព្រលឹងវិញ្ញាណមានច្រើន។ |
| Outreach | បេសកកម្មចេញក្រៅ |
| Travel, change and living as a team. | ការធ្វើដំណើរ ការផ្លាស់ប្តូរ និងការរស់នៅជាក្រុម។ |
| Between seasons | ចន្លោះរដូវកាល |
| Debriefing, planning and changing roles. | ការពិភាក្សាក្រោយបេសកកម្ម ការរៀបផែនការ និងការប្តូរតួនាទី។ |
| Holidays & hosting | ថ្ងៃបុណ្យ និងការទទួលភ្ញៀវ |
| Khmer New Year, Pchum Ben, Christmas, visitors. | ចូលឆ្នាំខ្មែរ ភ្ជុំបិណ្ឌ បុណ្យណូអែល ភ្ញៀវមកលេង។ |
| A stretched season | រដូវកាលតានតឹង |
| Tired, under pressure, or carrying something heavy. | ហត់នឿយ មានសម្ពាធ ឬកំពុងលីបន្ទុកធ្ងន់។ |
| Your work is people all day. Plan real quiet time to recharge — it is not selfish, it is how you keep giving. | ការងាររបស់អ្នកគឺជាមួយមនុស្សពេញមួយថ្ងៃ។ រៀបចំពេលស្ងាត់ពិតប្រាកដ ដើម្បីមានកម្លាំងឡើងវិញ — វាមិនមែនអាត្មានិយមទេ វាជារបៀបដែលអ្នកអាចបន្តផ្តល់ឱ្យ។ |
| You are made for this kind of work. Just make sure the quieter people get heard too. | អ្នកកើតមកសម្រាប់ការងារប្រភេទនេះ។ គ្រាន់តែធ្វើឱ្យប្រាកដថា មនុស្សស្ងាត់ៗក៏ត្រូវបានស្តាប់ដែរ។ |
| People here need warmth before solutions. Ask how someone is before you fix the problem. | មនុស្សនៅទីនេះត្រូវការភាពកក់ក្តៅ មុនដំណោះស្រាយ។ សួរសុខទុក្ខគេ មុនពេលអ្នកដោះស្រាយបញ្ហា។ |
| You will feel people's struggles deeply. Share the weight with your team and your mentor. | អ្នកនឹងមានអារម្មណ៍យ៉ាងជ្រៅចំពោះការលំបាករបស់មនុស្ស។ ចែករំលែកបន្ទុកជាមួយក្រុម និងអ្នកណែនាំរបស់អ្នក។ |
| People rarely run on schedule. Plan, but leave space for the conversation that could not wait. | មនុស្សកម្រដើរតាមកាលវិភាគណាស់។ រៀបផែនការ តែទុកចន្លោះសម្រាប់ការសន្ទនាដែលមិនអាចរង់ចាំបាន។ |
| Your flexibility is a gift here. Write down what you promised so nobody falls through the cracks. | ភាពបត់បែនរបស់អ្នកជាអំណោយទាននៅទីនេះ។ សរសេរអ្វីដែលអ្នកបានសន្យា ដើម្បីកុំឱ្យនរណាម្នាក់ត្រូវបានភ្លេច។ |
| Teaching uses up your energy fast. Protect your preparation time and your recovery time. | ការបង្រៀនប្រើកម្លាំងអ្នកយ៉ាងលឿន។ ការពារពេលរៀបចំ និងពេលសម្រាករបស់អ្នក។ |
| Leave space in class for others to think and answer — silence can be where learning happens. | ទុកចន្លោះក្នុងថ្នាក់ឱ្យអ្នកដទៃគិត និងឆ្លើយ — ភាពស្ងៀមស្ងាត់អាចជាពេលដែលការរៀនកើតឡើង។ |
| Your big ideas inspire students. Add examples and practical steps so everyone can follow. | គំនិតធំៗរបស់អ្នកបំផុសសិស្ស។ បន្ថែមឧទាហរណ៍ និងជំហានជាក់ស្តែង ដើម្បីឱ្យគ្រប់គ្នាអាចតាមបាន។ |
| Your clear, practical teaching helps people. Remember to share the why, not only the how. | ការបង្រៀនច្បាស់លាស់ និងជាក់ស្តែងរបស់អ្នកជួយមនុស្ស។ កុំភ្លេចប្រាប់ពីហេតុអ្វី មិនមែនត្រឹមតែរបៀបធ្វើទេ។ |
| Correct gently. Students need to feel safe with you before they can hear hard feedback. | កែតម្រូវដោយទន់ភ្លន់។ សិស្សត្រូវមានអារម្មណ៍សុវត្ថិភាពជាមួយអ្នក មុនពេលពួកគេអាចស្តាប់មតិយោបល់ពិបាកៗ។ |
| You will care about every student. You cannot carry all of them — trust God and the team. | អ្នកនឹងយកចិត្តទុកដាក់ចំពោះសិស្សគ្រប់រូប។ អ្នកមិនអាចលីពួកគេទាំងអស់បានទេ — ទុកចិត្តលើព្រះ និងក្រុម។ |
| People may not know what you are thinking. Say your thoughts and your appreciation out loud. | មនុស្សប្រហែលមិនដឹងថាអ្នកកំពុងគិតអ្វីទេ។ និយាយគំនិត និងការដឹងគុណរបស់អ្នកចេញមកឱ្យឮ។ |
| Before you decide, ask the quiet people in the room what they think. | មុនពេលអ្នកសម្រេចចិត្ត សួរមនុស្សស្ងាត់ៗក្នុងបន្ទប់ថាពួកគេគិតយ៉ាងណា។ |
| Keep sharing the vision, and pair it with a clear next step for this week. | បន្តចែករំលែកចក្ខុវិស័យ ហើយភ្ជាប់វាជាមួយជំហានបន្ទាប់ច្បាស់លាស់សម្រាប់សប្តាហ៍នេះ។ |
| Your steadiness helps the base. Make room for people who see new possibilities. | ភាពនឹងនររបស់អ្នកជួយមូលដ្ឋាន។ ទុកកន្លែងសម្រាប់មនុស្សដែលមើលឃើញលទ្ធភាពថ្មីៗ។ |
| Your clear decisions help. Explain them with care — people remember how they were treated. | ការសម្រេចចិត្តច្បាស់លាស់របស់អ្នកមានប្រយោជន៍។ ពន្យល់វាដោយយកចិត្តទុកដាក់ — មនុស្សចងចាំពីរបៀបដែលពួកគេត្រូវបានប្រព្រឹត្ត។ |
| You will want everyone happy. Some decisions are still right when they are hard. | អ្នកនឹងចង់ឱ្យគ្រប់គ្នាសប្បាយចិត្ត។ ការសម្រេចចិត្តខ្លះនៅតែត្រឹមត្រូវ ទោះបីវាពិបាកក៏ដោយ។ |
| Your plans give people security. Hold them loosely when God or the situation changes them. | ផែនការរបស់អ្នកផ្តល់សុវត្ថិភាពដល់មនុស្ស។ កាន់វាដោយបន្ធូរ ពេលព្រះ ឬស្ថានភាពផ្លាស់ប្តូរវា។ |
| Your flexibility keeps the base agile. Make sure decisions are written down and followed up. | ភាពបត់បែនរបស់អ្នកធ្វើឱ្យមូលដ្ឋានរហ័សរហួន។ ធ្វើឱ្យប្រាកដថាការសម្រេចចិត្តត្រូវបានសរសេរទុក និងតាមដាន។ |
| Details can feel draining for you. Build simple checklists so the important things are never missed. | ព័ត៌មានលម្អិតអាចធ្វើឱ្យអ្នកហត់នឿយ។ បង្កើតបញ្ជីត្រួតពិនិត្យសាមញ្ញ ដើម្បីកុំឱ្យភ្លេចរឿងសំខាន់ៗ។ |
| You are good with detail. Step back sometimes to explain the bigger picture to others. | អ្នកពូកែខាងព័ត៌មានលម្អិត។ ពេលខ្លះ ដើរថយក្រោយបន្តិច ដើម្បីពន្យល់រូបភាពធំដល់អ្នកដទៃ។ |
| Your accuracy protects the base. Soften how you point out other people's mistakes. | ភាពត្រឹមត្រូវរបស់អ្នកការពារមូលដ្ឋាន។ ធ្វើឱ្យទន់ភ្លន់ពេលអ្នកចង្អុលបង្ហាញកំហុសរបស់អ្នកដទៃ។ |
| Saying no about money can feel hard. Remember that clear rules protect people too. | ការបដិសេធរឿងលុយអាចពិបាក។ ចងចាំថាច្បាប់ច្បាស់លាស់ក៏ការពារមនុស្សដែរ។ |
| Set a regular time each week for records and receipts, so they never pile up. | កំណត់ពេលទៀងទាត់ជារៀងរាល់សប្តាហ៍សម្រាប់កំណត់ត្រា និងវិក្កយបត្រ ដើម្បីកុំឱ្យវាគរច្រើន។ |
| You may prefer to work quietly. Let people know what you did, so they can thank you and help. | អ្នកប្រហែលចូលចិត្តធ្វើការដោយស្ងាត់ៗ។ ប្រាប់មនុស្សពីអ្វីដែលអ្នកបានធ្វើ ដើម្បីឱ្យពួកគេអាចអរគុណ និងជួយអ្នក។ |
| Practical work can feel repetitive. Look for small ways to improve how it is done. | ការងារជាក់ស្តែងអាចមានអារម្មណ៍ដដែលៗ។ រកវិធីតូចៗដើម្បីកែលម្អរបៀបធ្វើ។ |
| Your service is love in action. Ask for help before you are exhausted. | ការបម្រើរបស់អ្នកគឺជាសេចក្តីស្រឡាញ់ក្នុងសកម្មភាព។ សុំជំនួយមុនពេលអ្នកអស់កម្លាំង។ |
| Unexpected jobs will come up. Leave a little room in your day for them. | ការងារដែលមិនបានរំពឹងទុកនឹងកើតឡើង។ ទុកចន្លោះបន្តិចក្នុងថ្ងៃរបស់អ្នកសម្រាប់វា។ |
| You are great at handling what comes up. Keep a short list so the regular jobs still get done. | អ្នកពូកែដោះស្រាយអ្វីដែលកើតឡើងភ្លាមៗ។ រក្សាបញ្ជីខ្លីមួយ ដើម្បីឱ្យការងារប្រចាំនៅតែបានធ្វើ។ |
| Creative work does not always fit a schedule. Plan the deadline, not every step on the way to it. | ការងារច្នៃប្រឌិតមិនតែងតែសមនឹងកាលវិភាគទេ។ រៀបផែនការពេលកំណត់ មិនមែនគ្រប់ជំហានទៅដល់វាទេ។ |
| Ideas flow easily for you. Agree on deadlines early so the work gets finished and shared. | គំនិតហូរមកងាយសម្រាប់អ្នក។ ព្រមព្រៀងលើពេលកំណត់ឱ្យបានឆាប់ ដើម្បីឱ្យការងាររួចរាល់ និងបានចែករំលែក។ |
| Your eye for detail makes the work excellent. Share drafts early instead of waiting for perfect. | ភ្នែកមើលព័ត៌មានលម្អិតរបស់អ្នកធ្វើឱ្យការងារល្អឥតខ្ចោះ។ ចែករំលែកសេចក្តីព្រាងឱ្យបានឆាប់ ជាជាងរង់ចាំឱ្យល្អឥតខ្ចោះ។ |
| Feedback on your work can feel personal. It is about the work, not about you. | មតិយោបល់លើការងាររបស់អ្នកអាចមានអារម្មណ៍ដូចជារឿងផ្ទាល់ខ្លួន។ វាគឺអំពីការងារ មិនមែនអំពីអ្នកទេ។ |
| Remember the people the work is for — let it move hearts as well as minds. | ចងចាំមនុស្សដែលការងារនេះធ្វើសម្រាប់ — ឱ្យវាប៉ះពាល់ចិត្ត ក៏ដូចជាគំនិតផងដែរ។ |
| You may pray best out loud and with others. Find a prayer partner as well as quiet time. | អ្នកប្រហែលអធិស្ឋានបានល្អបំផុតដោយឮៗ និងជាមួយអ្នកដទៃ។ រកដៃគូអធិស្ឋាន ក៏ដូចជាពេលស្ងាត់ផងដែរ។ |
| Long quiet prayer suits you. Share what you are sensing — the team needs to hear it. | ការអធិស្ឋានស្ងាត់ៗយូរសមនឹងអ្នក។ ចែករំលែកអ្វីដែលអ្នកកំពុងយល់ឃើញ — ក្រុមត្រូវការស្តាប់វា។ |
| You may sense big themes in prayer. Test them with others and keep them grounded. | អ្នកប្រហែលយល់ឃើញប្រធានបទធំៗក្នុងការអធិស្ឋាន។ ពិនិត្យវាជាមួយអ្នកដទៃ ហើយរក្សាវាឱ្យជាក់ស្តែង។ |
| You will carry people's pain in prayer. Remember to give it to God and not hold it yourself. | អ្នកនឹងលីការឈឺចាប់របស់មនុស្សក្នុងការអធិស្ឋាន។ កុំភ្លេចប្រគល់វាទៅព្រះ ហើយកុំកាន់វាដោយខ្លួនឯង។ |
| A prayer rhythm helps you. Leave room for the Spirit to change the plan. | ចង្វាក់អធិស្ឋានជួយអ្នក។ ទុកកន្លែងឱ្យព្រះវិញ្ញាណផ្លាស់ប្តូរផែនការ។ |
| A good week to build habits that will carry you through busier seasons. | សប្តាហ៍ល្អសម្រាប់កសាងទម្លាប់ ដែលនឹងជួយអ្នកឆ្លងកាត់រដូវកាលរវល់ជាងនេះ។ |
| Use the calm to plan ahead — the next busy season will be easier for it. | ប្រើពេលស្ងប់នេះដើម្បីរៀបផែនការជាមុន — រដូវកាលរវល់បន្ទាប់នឹងស្រួលជាងមុន។ |
| Try one new idea while you have the space for it. | សាកល្បងគំនិតថ្មីមួយ ខណៈពេលអ្នកមានពេលសម្រាប់វា។ |
| Students will want your time constantly. Plan an hour a day that is yours. | សិស្សនឹងចង់បានពេលរបស់អ្នកជានិច្ច។ រៀបចំមួយម៉ោងក្នុងមួយថ្ងៃដែលជារបស់អ្នក។ |
| You may love this season. Watch that you still rest on your day off. | អ្នកប្រហែលស្រឡាញ់រដូវកាលនេះ។ ប្រយ័ត្នឱ្យនៅតែសម្រាកនៅថ្ងៃឈប់សម្រាករបស់អ្នក។ |
| Pastoral needs will be heavy. You are not everyone's counselor — refer people on when you need to. | តម្រូវការខាងព្រលឹងវិញ្ញាណនឹងមានច្រើន។ អ្នកមិនមែនជាអ្នកប្រឹក្សារបស់គ្រប់គ្នាទេ — បញ្ជូនមនុស្សទៅអ្នកផ្សេង ពេលចាំបាច់។ |
| Students can be fragile in this season. Lead with encouragement, then correction. | សិស្សអាចងាយរងរបួសចិត្តក្នុងរដូវកាលនេះ។ ចាប់ផ្តើមដោយការលើកទឹកចិត្ត បន្ទាប់មកការកែតម្រូវ។ |
| Outreach tests everyone. Grace for your team — and for yourself. | បេសកកម្មចេញក្រៅសាកល្បងគ្រប់គ្នា។ មានព្រះគុណចំពោះក្រុមរបស់អ្នក — និងចំពោះខ្លួនអ្នកផង។ |
| There is little time alone on outreach. Protect twenty quiet minutes a day. | មានពេលនៅម្នាក់ឯងតិចណាស់ក្នុងបេសកកម្ម។ ការពារពេលស្ងាត់ម្ភៃនាទីក្នុងមួយថ្ងៃ។ |
| You will bring energy to the team. Notice who needs a quieter day. | អ្នកនឹងនាំថាមពលមកក្រុម។ កត់សម្គាល់អ្នកណាដែលត្រូវការថ្ងៃស្ងាត់ជាងនេះ។ |
| Plans change daily on outreach. Decide the one or two things that must happen, and hold the rest loosely. | ផែនការផ្លាស់ប្តូររាល់ថ្ងៃក្នុងបេសកកម្ម។ សម្រេចរឿងមួយ ឬពីរដែលត្រូវតែកើតឡើង ហើយកាន់រឿងផ្សេងទៀតដោយបន្ធូរ។ |
| You will adapt well. Help the planners on the team by confirming details early. | អ្នកនឹងសម្របខ្លួនបានល្អ។ ជួយអ្នករៀបផែនការក្នុងក្រុម ដោយបញ្ជាក់ព័ត៌មានលម្អិតឱ្យបានឆាប់។ |
| Unfamiliar places can wear you down. Keep a few small routines that feel like home. | កន្លែងមិនធ្លាប់ស្គាល់អាចធ្វើឱ្យអ្នកអស់កម្លាំង។ រក្សាទម្លាប់តូចៗខ្លះ ដែលមានអារម្មណ៍ដូចនៅផ្ទះ។ |
| Your ideas can inspire the team. Make sure everyone understands the plan for today. | គំនិតរបស់អ្នកអាចបំផុសក្រុម។ ធ្វើឱ្យប្រាកដថាគ្រប់គ្នាយល់ពីផែនការសម្រាប់ថ្ងៃនេះ។ |
| Endings and beginnings are both hard. Take time to reflect and to grieve what is finishing. | ការបញ្ចប់ និងការចាប់ផ្តើមសុទ្ធតែពិបាក។ ចំណាយពេលពិចារណា និងកាន់ទុក្ខចំពោះអ្វីដែលកំពុងបញ្ចប់។ |
| Not having a clear plan yet may unsettle you. Write down what you do know. | ការមិនទាន់មានផែនការច្បាស់ អាចធ្វើឱ្យអ្នកមិនស្ងប់។ សរសេរអ្វីដែលអ្នកដឹងច្បាស់។ |
| You may enjoy the open space. Set a few deadlines so the next season actually starts. | អ្នកប្រហែលរីករាយនឹងពេលទំនេរ។ កំណត់ពេលកំណត់ខ្លះ ដើម្បីឱ្យរដូវកាលបន្ទាប់ពិតជាចាប់ផ្តើម។ |
| Change can feel unsettling. Hold on to what is staying the same. | ការផ្លាស់ប្តូរអាចធ្វើឱ្យមិនស្ងប់។ កាន់ខ្ជាប់នូវអ្វីដែលនៅតែដដែល។ |
| You may already be dreaming about what is next. Finish this season well first. | អ្នកប្រហែលកំពុងស្រមៃពីអ្វីបន្ទាប់ហើយ។ បញ្ចប់រដូវកាលនេះឱ្យបានល្អជាមុនសិន។ |
| Rest is part of the rhythm God gave us. Enjoy it without guilt. | ការសម្រាកជាផ្នែកមួយនៃចង្វាក់ដែលព្រះប្រទានមកយើង។ រីករាយនឹងវាដោយគ្មានអារម្មណ៍ខុស។ |
| Holidays can mean more people, not fewer. Plan quiet time within the celebrations. | ថ្ងៃបុណ្យអាចមានន័យថាមានមនុស្សច្រើនជាងមុន មិនមែនតិចជាងទេ។ រៀបចំពេលស្ងាត់ក្នុងចំណោមការប្រារព្ធ។ |
| Enjoy the gatherings. Rest still counts, even when you love being with people. | រីករាយនឹងការជួបជុំ។ ការសម្រាកនៅតែសំខាន់ ទោះបីអ្នកស្រឡាញ់ការនៅជាមួយមនុស្សក៏ដោយ។ |
| Family time can bring up feelings. Be kind to yourself. | ពេលវេលាជាមួយគ្រួសារអាចធ្វើឱ្យមានអារម្មណ៍ផ្សេងៗកើតឡើង។ មានចិត្តល្អចំពោះខ្លួនឯង។ |
| Holidays rarely go to plan. Choose what matters most and let the rest go. | ថ្ងៃបុណ្យកម្រដើរតាមផែនការណាស់។ ជ្រើសរើសអ្វីដែលសំខាន់បំផុត ហើយទុករឿងផ្សេងទៀតចោល។ |
| Tell your mentor how you are really doing. This season will not last forever. | ប្រាប់អ្នកណែនាំរបស់អ្នកពីស្ថានភាពពិតរបស់អ្នក។ រដូវកាលនេះនឹងមិនស្ថិតស្ថេររហូតទេ។ |
| Under stress you may pull away. Let at least one person in. | ពេលតានតឹង អ្នកប្រហែលដកខ្លួនចេញ។ ឱ្យមនុស្សយ៉ាងហោចណាស់ម្នាក់ចូលមកជិតអ្នក។ |
| Under stress you may keep busy so you do not have to stop. Make space to stop. | ពេលតានតឹង អ្នកប្រហែលធ្វើខ្លួនឱ្យរវល់ ដើម្បីកុំឱ្យត្រូវឈប់។ ទុកពេលដើម្បីឈប់។ |
| Under stress you may fix small details instead of the real problem. Name the real problem. | ពេលតានតឹង អ្នកប្រហែលជួសជុលរឿងតូចៗ ជំនួសឱ្យបញ្ហាពិត។ និយាយឈ្មោះបញ្ហាពិតឱ្យច្បាស់។ |
| Under stress you may imagine the worst. Write down what is actually true. | ពេលតានតឹង អ្នកប្រហែលស្រមៃរឿងអាក្រក់បំផុត។ សរសេរអ្វីដែលពិតប្រាកដ។ |
| Under stress you may become harsh or critical. Be gentle with people, and with yourself. | ពេលតានតឹង អ្នកប្រហែលក្លាយជាឃោរឃៅ ឬរិះគន់។ ទន់ភ្លន់ជាមួយមនុស្ស និងជាមួយខ្លួនឯង។ |
| Under stress you may take everything personally. Not every problem is yours to carry. | ពេលតានតឹង អ្នកប្រហែលយកអ្វីៗទាំងអស់មកគិតជារឿងផ្ទាល់ខ្លួន។ មិនមែនគ្រប់បញ្ហាសុទ្ធតែជាបន្ទុករបស់អ្នកទេ។ |
| Under stress you may try to control more. Let go of one thing this week. | ពេលតានតឹង អ្នកប្រហែលព្យាយាមគ្រប់គ្រងច្រើនជាងមុន។ ទុកចោលរឿងមួយនៅសប្តាហ៍នេះ។ |
| Under stress you may avoid decisions. Make one small decision today. | ពេលតានតឹង អ្នកប្រហែលជៀសវាងការសម្រេចចិត្ត។ ធ្វើការសម្រេចចិត្តតូចមួយនៅថ្ងៃនេះ។ |

## 53. GP Strengths (the free strengths test)

GP's own strengths finder: 102 pairs of statements ("Which is more like you?"),
then a Top 5 of 34 strengths in four groups (Doing, Leading, Relating,
Thinking), with what each means for work. Every word is GP's own,
so all of it is translated. The statements matter
most — each pair is two good things, and the Khmer should keep them equally
attractive, so neither side sounds better. Strength names should read as a
kind of person ("អ្នក…").

### Screens

| English | Khmer (pending) |
|---|---|
| Strengths could not load. Pull down to refresh. | មិនអាចផ្ទុកចំណុចខ្លាំងបានទេ។ ទាញចុះក្រោមដើម្បីផ្ទុកឡើងវិញ។ |
| My Home | ផ្ទះរបស់ខ្ញុំ |
| Move up | ផ្លាស់ឡើងលើ |
| Move down | ផ្លាស់ចុះក្រោម |
| Remove | ដកចេញ |
| Nobody here has found their strengths yet. Take the free test from My Home. | មិនទាន់មាននរណាម្នាក់នៅទីនេះរកឃើញចំណុចខ្លាំងរបស់ខ្លួនទេ។ ធ្វើតេស្តឥតគិតថ្លៃពីទំព័រដើមរបស់ខ្ញុំ។ |
| {n} people have shared their Top 5 | មនុស្ស {n} នាក់បានចែករំលែក Top 5 របស់ខ្លួន |
| Share of the team’s Top 5 strengths in each group. | ចំណែកនៃចំណុចខ្លាំង Top 5 របស់ក្រុម ក្នុងក្រុមនីមួយៗ។ |
| Not in anyone’s Top 5 yet: | មិនទាន់មានក្នុង Top 5 របស់នរណាម្នាក់ទេ៖ |
| Could not save — check your connection and try again. | មិនអាចរក្សាទុកបានទេ — សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត។ |
| A strength is what comes naturally to you — everyone can grow in all {n}. | ចំណុចខ្លាំង គឺជាអ្វីដែលកើតឡើងដោយធម្មជាតិចំពោះអ្នក — មនុស្សគ្រប់គ្នាអាចលូតលាស់បានក្នុងទាំង {n}។ |
| Strengths | ចំណុចខ្លាំង |
| Find your top 5 strengths | ស្វែងរកចំណុចខ្លាំង Top 5 របស់អ្នក |
| {n} quick choices · free · about 15 minutes | ជម្រើសរហ័ស {n} · ឥតគិតថ្លៃ · ប្រហែល ១៥ នាទី |
| Tap to see what your strengths mean for your work. | ចុចដើម្បីមើលថាចំណុចខ្លាំងរបស់អ្នកមានន័យយ៉ាងណាសម្រាប់ការងាររបស់អ្នក។ |
| How to make the most of {name}’s strengths | របៀបប្រើចំណុចខ្លាំងរបស់ {name} ឱ្យបានល្អបំផុត |
| GP Strengths | ចំណុចខ្លាំង GP |
| {n} pairs of statements. For each pair, choose which one is more like you — even when both are. | ឃ្លាចំនួន {n} គូ។ សម្រាប់គូនីមួយៗ សូមជ្រើសរើសមួយណាដែលដូចអ្នកជាង — ទោះបីជាទាំងពីរដូចអ្នកក៏ដោយ។ |
| Go with your first answer. Think about what you enjoy and what comes easily, not what your job needs. | ជ្រើសចម្លើយដំបូងរបស់អ្នក។ គិតពីអ្វីដែលអ្នកចូលចិត្ត និងអ្វីដែលងាយស្រួលសម្រាប់អ្នក មិនមែនអ្វីដែលការងាររបស់អ្នកត្រូវការនោះទេ។ |
| At the end you get your top 5 of {n} strengths, and what they mean for your work. | នៅចុងបញ្ចប់ អ្នកនឹងទទួលបានចំណុចខ្លាំង Top 5 ក្នុងចំណោម {n} និងអត្ថន័យរបស់វាសម្រាប់ការងាររបស់អ្នក។ |
| Carry on — {n} of {total} answered | បន្ត — បានឆ្លើយ {n} ក្នុងចំណោម {total} |
| Start | ចាប់ផ្តើម |
| {n} of {total} | {n} នៃ {total} |
| Which is more like you? | មួយណាដូចអ្នកជាង? |
| More like me | ដូចខ្ញុំជាង |
| Back | ត្រឡប់ |
| See my strengths | មើលចំណុចខ្លាំងរបស់ខ្ញុំ |
| Next | បន្ទាប់ |
| No strengths yet. | មិនទាន់មានចំណុចខ្លាំងនៅឡើយទេ។ |
| Your top 5 strengths | ចំណុចខ្លាំង Top 5 របស់អ្នក |
| {name}’s top 5 strengths | ចំណុចខ្លាំង Top 5 របស់ {name} |
| Mostly {group}: {blurb} | ភាគច្រើនជា {group}៖ {blurb} |
| For the team: | សម្រាប់ក្រុម៖ |
| Working together: | ធ្វើការជាមួយគ្នា៖ |
| Your top 10, by group | Top 10 របស់អ្នក តាមក្រុម |
| Most people lead from one or two groups. No group is better than another. | មនុស្សភាគច្រើនមានចំណុចខ្លាំងនៅក្នុងក្រុមមួយ ឬពីរ។ គ្មានក្រុមណាល្អជាងក្រុមណាទេ។ |
| All {n} | ទាំង {n} |
| The ones lower down are not weaknesses — just what comes less naturally. | អ្វីដែលនៅខាងក្រោម មិនមែនជាចំណុចខ្សោយទេ — គ្រាន់តែជាអ្វីដែលមិនសូវកើតឡើងដោយធម្មជាតិប៉ុណ្ណោះ។ |
| Show my top 5 to the team | បង្ហាញ Top 5 របស់ខ្ញុំដល់ក្រុម |
| Your answers and the full list always stay private. | ចម្លើយរបស់អ្នក និងបញ្ជីពេញលេញ តែងតែនៅជាឯកជន។ |
| Retake the test | ធ្វើតេស្តម្តងទៀត |
| Answer every pair first. | សូមឆ្លើយគ្រប់គូជាមុនសិន។ |

| GP Strengths is GP’s own free questionnaire. | GP Strengths គឺជាកម្រងសំណួរឥតគិតថ្លៃរបស់ GP ផ្ទាល់។ |

### Groups, strengths, descriptions and the 204 statements

| English | Khmer (pending) |
|---|---|
| Doing | ការធ្វើ |
| People who get it done — plans, follow-through and results. | អ្នកដែលធ្វើឱ្យការងារសម្រេច — ផែនការ ការធ្វើរហូតដល់ចប់ និងលទ្ធផល។ |
| Leading | ការដឹកនាំ |
| People who move others — starting, speaking, deciding, rallying. | អ្នកដែលជំរុញអ្នកដទៃ — ការចាប់ផ្តើម ការនិយាយ ការសម្រេចចិត្ត ការប្រមូលផ្តុំ។ |
| Relating | ទំនាក់ទំនង |
| People who hold people together — care, trust, welcome and peace. | អ្នកដែលរក្សាមនុស្សឱ្យនៅជាមួយគ្នា — ការយកចិត្តទុកដាក់ ការទុកចិត្ត ការស្វាគមន៍ និងសន្តិភាព។ |
| Thinking | ហេតុផល |
| People who see further — curiosity, questions, vision and the way ahead. | អ្នកដែលមើលឃើញឆ្ងាយ — ការចង់ដឹង សំណួរ ចក្ខុវិស័យ និងផ្លូវទៅមុខ។ |
| Hard Worker | អ្នកឧស្សាហ៍ព្យាយាម |
| Works hard and loves getting things done. | ធ្វើការយ៉ាងឧស្សាហ៍ ហើយស្រឡាញ់ការធ្វើឱ្យការងារសម្រេច។ |
| Hard workers have a steady drive to get things done. Every day starts at zero and they feel good when they have been busy and productive. They keep going after the excitement has worn off, and they are often the reason a project actually closes. | អ្នកឧស្សាហ៍ព្យាយាម មានកម្លាំងជំរុញជាប់លាប់ដើម្បីធ្វើឱ្យការងារសម្រេច។ ថ្ងៃនីមួយៗចាប់ផ្តើមពីសូន្យ ហើយពួកគេពេញចិត្តនៅពេលពួកគេបានរវល់ និងធ្វើការបានច្រើន។ ពួកគេបន្តធ្វើ ទោះបីភាពរំភើបបានបាត់ទៅហើយក៏ដោយ ហើយជាញឹកញាប់ ពួកគេជាមូលហេតុដែលគម្រោងមួយបានបិទបញ្ចប់ពិតប្រាកដ។ |
| Brings projects to a real finish | នាំគម្រោងទៅដល់ការបញ្ចប់ពិតប្រាកដ |
| Keeps going when others lose steam | បន្តធ្វើ នៅពេលអ្នកដទៃអស់កម្លាំង |
| Can push on when rest is needed | អាចបន្តធ្វើ នៅពេលដែលត្រូវការសម្រាក |
| May feel restless on a day with nothing to tick off | អាចមានអារម្មណ៍មិនស្ងប់ នៅថ្ងៃដែលគ្មានអ្វីត្រូវបញ្ចប់ |
| Give them a clear finish line, and tell them when they have crossed it. | ផ្តល់ឱ្យពួកគេនូវគោលដៅបញ្ចប់ច្បាស់លាស់ ហើយប្រាប់ពួកគេនៅពេលពួកគេបានសម្រេចវា។ |
| I feel satisfied when I finish a task completely. | ខ្ញុំពេញចិត្ត នៅពេលខ្ញុំបញ្ចប់ការងារមួយទាំងស្រុង។ |
| I keep working on something until it is really done. | ខ្ញុំបន្តធ្វើការលើអ្វីមួយ រហូតដល់វាចប់ពិតប្រាកដ។ |
| An unfinished job bothers me until I complete it. | ការងារដែលមិនទាន់ចប់ រំខានខ្ញុំ រហូតដល់ខ្ញុំបញ្ចប់វា។ |
| I like to see real results at the end of the day. | ខ្ញុំចូលចិត្តឃើញលទ្ធផលពិតប្រាកដ នៅចុងថ្ងៃ។ |
| I make a list and feel good when I tick everything off. | ខ្ញុំសរសេរបញ្ជី ហើយពេញចិត្តនៅពេលខ្ញុំគូសធីកបានគ្រប់យ៉ាង។ |
| I work hard even when nobody is checking on me. | ខ្ញុំធ្វើការយ៉ាងសកម្ម ទោះបីជាគ្មាននរណាពិនិត្យមើលខ្ញុំក៏ដោយ។ |
| Coordinator | អ្នកសម្របសម្រួល |
| Fits the people and pieces together. | ភ្ជាប់មនុស្ស និងផ្នែកនានាឱ្យចូលគ្នា។ |
| Coordinators can juggle many things at once and still see how they fit. When plans change, they rearrange people, tasks and resources quickly, and a busy day runs more smoothly because they are in it. | អ្នកសម្របសម្រួល អាចធ្វើរឿងច្រើនក្នុងពេលតែមួយ ហើយនៅតែឃើញពីរបៀបដែលវាភ្ជាប់គ្នា។ នៅពេលផែនការផ្លាស់ប្តូរ ពួកគេរៀបចំមនុស្ស ការងារ និងធនធានឡើងវិញយ៉ាងរហ័ស ហើយថ្ងៃដែលរវល់ដំណើរការរលូនជាង ដោយសារពួកគេនៅទីនោះ។ |
| Keeps many moving parts working together | ធ្វើឱ្យផ្នែកជាច្រើនដំណើរការជាមួយគ្នា |
| Adjusts quickly when plans change | កែតម្រូវយ៉ាងរហ័ស នៅពេលផែនការផ្លាស់ប្តូរ |
| Can keep changing things others want settled | អាចបន្តផ្លាស់ប្តូររឿងដែលអ្នកដទៃចង់ឱ្យនៅនឹង |
| May take on the organizing of everything | អាចទទួលយកការរៀបចំគ្រប់យ៉ាងដោយខ្លួនឯង |
| Give them the busy event or the messy week to arrange. | ឱ្យពួកគេរៀបចំកម្មវិធីរវល់ ឬសប្តាហ៍ដែលច្របូកច្របល់។ |
| I can keep track of many tasks at the same time. | ខ្ញុំអាចតាមដានការងារច្រើនក្នុងពេលតែមួយ។ |
| When plans change, I quickly work out a new arrangement. | នៅពេលផែនការផ្លាស់ប្តូរ ខ្ញុំរកឃើញការរៀបចំថ្មីយ៉ាងរហ័ស។ |
| I like working out who should do which job. | ខ្ញុំចូលចិត្តគិតថានរណាគួរធ្វើការងារណា។ |
| I enjoy putting people and things in the right place so the work flows. | ខ្ញុំចូលចិត្តដាក់មនុស្ស និងរបស់របរនៅកន្លែងត្រឹមត្រូវ ដើម្បីឱ្យការងាររលូន។ |
| A busy day with lots going on gives me energy. | ថ្ងៃដែលរវល់ និងមានរឿងច្រើន ផ្តល់ថាមពលដល់ខ្ញុំ។ |
| I find a way to make things work with what we have. | ខ្ញុំរកវិធីធ្វើឱ្យការងារដំណើរការ ជាមួយអ្វីដែលយើងមាន។ |
| Values-Driven | អ្នកកាន់តម្លៃ |
| Lives from deep values and a clear calling. | រស់នៅតាមតម្លៃជ្រាលជ្រៅ និងការត្រាស់ហៅច្បាស់លាស់។ |
| Values-driven people have a few core values that do not move. Their work has to mean something, and they give themselves fully to what they believe God has called them to. Their conviction steadies a team when things are hard. | អ្នកកាន់តម្លៃ មានតម្លៃស្នូលមួយចំនួនដែលមិនរង្គើ។ ការងាររបស់ពួកគេត្រូវតែមានអត្ថន័យ ហើយពួកគេថ្វាយខ្លួនទាំងស្រុងចំពោះអ្វីដែលពួកគេជឿថាព្រះបានត្រាស់ហៅពួកគេឱ្យធ្វើ។ ជំនឿមុតមាំរបស់ពួកគេ ធ្វើឱ្យក្រុមនៅនឹងនរ នៅពេលមានការលំបាក។ |
| Steady, faithful and committed | នឹងនរ ស្មោះត្រង់ និងប្តេជ្ញាចិត្ត |
| Reminds the team why the work matters | រំលឹកក្រុមពីមូលហេតុដែលការងារសំខាន់ |
| Can struggle with work that seems to have no purpose | អាចពិបាកជាមួយការងារដែលហាក់ដូចជាគ្មានគោលបំណង |
| May find it hard to bend on things that are not core | អាចពិបាកបត់បែនលើរឿងដែលមិនមែនជាស្នូល |
| Connect their tasks to the mission, and let them hold the team to its values. | ភ្ជាប់ការងាររបស់ពួកគេទៅនឹងបេសកកម្ម ហើយឱ្យពួកគេជួយក្រុមរក្សាតម្លៃរបស់ខ្លួន។ |
| My values guide the choices I make every day. | តម្លៃរបស់ខ្ញុំណែនាំជម្រើសដែលខ្ញុំធ្វើរាល់ថ្ងៃ។ |
| I need my work to have a clear purpose. | ខ្ញុំត្រូវការឱ្យការងាររបស់ខ្ញុំមានគោលបំណងច្បាស់លាស់។ |
| I would rather earn less and do work that matters. | ខ្ញុំសុខចិត្តរកបានតិច ហើយធ្វើការងារដែលមានតម្លៃ។ |
| I stay committed to what I believe, even when it costs me. | ខ្ញុំនៅតែប្តេជ្ញាចំពោះអ្វីដែលខ្ញុំជឿ ទោះបីវាធ្វើឱ្យខ្ញុំខាតបង់ក៏ដោយ។ |
| I feel called to the work I do. | ខ្ញុំមានអារម្មណ៍ថាត្រូវបានត្រាស់ហៅឱ្យធ្វើការងារដែលខ្ញុំធ្វើ។ |
| People know what I stand for. | មនុស្សដឹងថាខ្ញុំឈរលើអ្វី។ |
| Fair-Minded | អ្នកយុត្តិធម៌ |
| Treats everyone the same way. | ប្រព្រឹត្តចំពោះមនុស្សគ្រប់គ្នាដូចៗគ្នា។ |
| Fair-minded people notice when someone is treated differently and want the same rules for everyone. They build clear, steady ways of working, and people trust them because they do not play favourites. | អ្នកយុត្តិធម៌ កត់សម្គាល់នៅពេលនរណាម្នាក់ត្រូវបានប្រព្រឹត្តខុសពីគេ ហើយចង់ឱ្យមានច្បាប់ដូចគ្នាសម្រាប់មនុស្សគ្រប់គ្នា។ ពួកគេបង្កើតរបៀបធ្វើការច្បាស់លាស់ និងទៀងទាត់ ហើយមនុស្សទុកចិត្តពួកគេ ព្រោះពួកគេមិនរើសមុខ។ |
| Makes sure everyone is treated fairly | ធ្វើឱ្យប្រាកដថាមនុស្សគ្រប់គ្នាត្រូវបានប្រព្រឹត្តដោយយុត្តិធម៌ |
| Builds clear, steady ways of working | បង្កើតរបៀបធ្វើការច្បាស់លាស់ និងទៀងទាត់ |
| Can hold to a rule when a person needs an exception | អាចកាន់ច្បាប់តឹង នៅពេលមនុស្សម្នាក់ត្រូវការការលើកលែង |
| May be slow to accept a change in how things are done | អាចយឺតក្នុងការទទួលយកការផ្លាស់ប្តូររបៀបធ្វើការ |
| Ask them to help set fair rules and systems for the team. | សុំឱ្យពួកគេជួយកំណត់ច្បាប់ និងប្រព័ន្ធដែលយុត្តិធម៌សម្រាប់ក្រុម។ |
| I believe the same rules should apply to everyone. | ខ្ញុំជឿថាច្បាប់ដូចគ្នាគួរតែអនុវត្តចំពោះមនុស្សគ្រប់គ្នា។ |
| It bothers me when someone gets special treatment. | ខ្ញុំមិនស្រួលចិត្ត នៅពេលនរណាម្នាក់ទទួលបានការអនុគ្រោះពិសេស។ |
| I like clear, steady ways of doing things. | ខ្ញុំចូលចិត្តរបៀបធ្វើអ្វីៗដែលច្បាស់លាស់ និងទៀងទាត់។ |
| I treat everyone the same, whoever they are. | ខ្ញុំប្រព្រឹត្តចំពោះមនុស្សគ្រប់គ្នាដូចគ្នា មិនថាពួកគេជានរណាទេ។ |
| I speak up when something is not fair. | ខ្ញុំនិយាយឡើង នៅពេលមានអ្វីមួយមិនយុត្តិធម៌។ |
| I like to know what is expected, and I expect the same of others. | ខ្ញុំចូលចិត្តដឹងពីអ្វីដែលគេរំពឹងពីខ្ញុំ ហើយខ្ញុំរំពឹងដូចគ្នាពីអ្នកដទៃ។ |
| Careful | អ្នកប្រុងប្រយ័ត្ន |
| Thinks it through before acting. | គិតឱ្យល្អិតល្អន់ មុនពេលធ្វើ។ |
| Careful people see the risks others miss. They take time before a big decision, choose their words and their commitments with thought, and protect a team from rushing into trouble. | អ្នកប្រុងប្រយ័ត្ន មើលឃើញហានិភ័យដែលអ្នកដទៃមើលរំលង។ ពួកគេចំណាយពេល មុនពេលធ្វើការសម្រេចចិត្តធំ ជ្រើសរើសពាក្យសម្តី និងការសន្យារបស់ពួកគេដោយការគិត ហើយការពារក្រុមពីការប្រញាប់ប្រញាល់ចូលទៅក្នុងបញ្ហា។ |
| Spots risks early | រកឃើញហានិភ័យតាំងពីដំបូង |
| Makes wise, well-thought-out decisions | ធ្វើការសម្រេចចិត្តដោយប្រាជ្ញា និងគិតបានល្អ |
| Can seem slow or hesitant to others | អាចមើលទៅយឺត ឬស្ទាក់ស្ទើរចំពោះអ្នកដទៃ |
| May hold back from trying something new | អាចស្ទាក់ស្ទើរមិនសាកល្បងអ្វីថ្មី |
| Ask them what could go wrong before a big decision. | សួរពួកគេថាអ្វីអាចខុស មុនពេលធ្វើការសម្រេចចិត្តធំ។ |
| I think carefully before I make a big decision. | ខ្ញុំគិតយ៉ាងប្រុងប្រយ័ត្ន មុនពេលធ្វើការសម្រេចចិត្តធំ។ |
| I notice the risks in a plan before others do. | ខ្ញុំកត់សម្គាល់ហានិភ័យក្នុងផែនការ មុនអ្នកដទៃ។ |
| I choose my words carefully. | ខ្ញុំជ្រើសរើសពាក្យសម្តីរបស់ខ្ញុំដោយប្រុងប្រយ័ត្ន។ |
| I would rather be safe than sorry. | ខ្ញុំចូលចិត្តប្រុងប្រយ័ត្ន ជាជាងស្តាយក្រោយ។ |
| I take my time before I trust someone with something important. | ខ្ញុំចំណាយពេល មុនពេលខ្ញុំទុកចិត្តនរណាម្នាក់លើរឿងសំខាន់។ |
| I do not like to rush into things. | ខ្ញុំមិនចូលចិត្តប្រញាប់ប្រញាល់ធ្វើអ្វីទេ។ |
| Orderly | អ្នកមានសណ្តាប់ធ្នាប់ |
| Brings order and routine to the work. | នាំសណ្តាប់ធ្នាប់ និងទម្លាប់មកក្នុងការងារ។ |
| Orderly people bring structure: a clear plan, a steady routine and things in their place. They turn a messy goal into ordered steps, and a team feels calmer when someone orderly has mapped the way. | អ្នកមានសណ្តាប់ធ្នាប់ នាំមកនូវរចនាសម្ព័ន្ធ៖ ផែនការច្បាស់លាស់ ទម្លាប់ទៀងទាត់ និងរបស់របរនៅកន្លែងរបស់វា។ ពួកគេប្តូរគោលដៅដែលច្របូកច្របល់ ឱ្យទៅជាជំហានតាមលំដាប់ ហើយក្រុមមានអារម្មណ៍ស្ងប់ជាង នៅពេលអ្នកមានសណ្តាប់ធ្នាប់បានគូសផ្លូវរួច។ |
| Makes a clear plan out of a messy goal | ធ្វើផែនការច្បាស់លាស់ ពីគោលដៅដែលច្របូកច្របល់ |
| Thinks ahead to what will be needed | គិតទុកជាមុនពីអ្វីដែលនឹងត្រូវការ |
| Can be thrown when the plan changes | អាចភាន់ច្រឡំ នៅពេលផែនការផ្លាស់ប្តូរ |
| May over-plan something that could just be tried | អាចរៀបផែនការហួសហេតុ លើអ្វីដែលគ្រាន់តែសាកល្បងក៏បាន |
| Involve them early, before the plan is fixed. | ឱ្យពួកគេចូលរួមតាំងពីដំបូង មុនពេលផែនការត្រូវបានកំណត់។ |
| I like to plan the steps before I start. | ខ្ញុំចូលចិត្តរៀបផែនការជំហាននានា មុនពេលចាប់ផ្តើម។ |
| I think ahead about what we will need. | ខ្ញុំគិតទុកជាមុនពីអ្វីដែលយើងនឹងត្រូវការ។ |
| I enjoy putting tasks in the right order. | ខ្ញុំចូលចិត្តរៀបការងារតាមលំដាប់ត្រឹមត្រូវ។ |
| I make a plan for my week before it begins. | ខ្ញុំធ្វើផែនការសម្រាប់សប្តាហ៍របស់ខ្ញុំ មុនពេលវាចាប់ផ្តើម។ |
| I like having a daily routine. | ខ្ញុំចូលចិត្តមានទម្លាប់ប្រចាំថ្ងៃ។ |
| I keep my things and my schedule in order. | ខ្ញុំរក្សារបស់របរ និងកាលវិភាគរបស់ខ្ញុំឱ្យមានសណ្តាប់ធ្នាប់។ |
| Goal-Setter | អ្នកកំណត់គោលដៅ |
| Knows where they are going and stays on track. | ដឹងថាខ្លួនកំពុងទៅណា ហើយនៅលើផ្លូវត្រូវ។ |
| Goal-setters choose a clear target and keep moving towards it. They know what matters most today, say no to distractions, and help a team stop drifting and get where it said it would go. | អ្នកកំណត់គោលដៅ ជ្រើសរើសគោលដៅច្បាស់លាស់មួយ ហើយបន្តឆ្ពោះទៅរកវា។ ពួកគេដឹងពីអ្វីដែលសំខាន់បំផុតនៅថ្ងៃនេះ និយាយថាទេចំពោះការរំខាន ហើយជួយក្រុមឱ្យឈប់វង្វេង ហើយទៅដល់កន្លែងដែលខ្លួនបាននិយាយថានឹងទៅ។ |
| Keeps the team on track | ធ្វើឱ្យក្រុមនៅលើផ្លូវត្រូវ |
| Knows what matters most right now | ដឹងពីអ្វីដែលសំខាន់បំផុតនៅពេលនេះ |
| Can seem impatient with side conversations | អាចមើលទៅមិនអត់ធ្មត់ជាមួយការនិយាយក្រៅប្រធានបទ |
| May push past people to reach the goal | អាចរំលងមនុស្ស ដើម្បីទៅដល់គោលដៅ |
| Give them a clear goal, and let them help the team set priorities. | ផ្តល់ឱ្យពួកគេនូវគោលដៅច្បាស់លាស់ ហើយឱ្យពួកគេជួយក្រុមកំណត់អាទិភាព។ |
| I set clear goals for myself. | ខ្ញុំកំណត់គោលដៅច្បាស់លាស់សម្រាប់ខ្លួនឯង។ |
| I know what is most important for me to do today. | ខ្ញុំដឹងពីអ្វីដែលសំខាន់បំផុតសម្រាប់ខ្ញុំត្រូវធ្វើនៅថ្ងៃនេះ។ |
| I get frustrated when a meeting drifts off topic. | ខ្ញុំធុញថប់ នៅពេលការប្រជុំវង្វេងចេញពីប្រធានបទ។ |
| I say no to things that pull me away from my main goal. | ខ្ញុំនិយាយថាទេ ចំពោះអ្វីដែលទាញខ្ញុំចេញពីគោលដៅចម្បង។ |
| I check my progress towards my goals often. | ខ្ញុំពិនិត្យវឌ្ឍនភាពឆ្ពោះទៅគោលដៅរបស់ខ្ញុំជាញឹកញាប់។ |
| I keep going in one direction until I get there. | ខ្ញុំបន្តទៅមុខក្នុងទិសដៅតែមួយ រហូតដល់ខ្ញុំទៅដល់។ |
| Dependable | អ្នកគួរឱ្យទុកចិត្ត |
| Does what they said they would. | ធ្វើអ្វីដែលខ្លួនបាននិយាយថានឹងធ្វើ។ |
| Dependable people keep their word. When they say yes, it happens — on time and done properly. Others trust them with important things, because nothing falls through their hands. | អ្នកគួរឱ្យទុកចិត្ត រក្សាពាក្យសន្យា។ នៅពេលពួកគេនិយាយថាបាទ/ចាស វាកើតឡើង — ទាន់ពេល និងធ្វើបានត្រឹមត្រូវ។ អ្នកដទៃទុកចិត្តពួកគេលើរឿងសំខាន់ៗ ព្រោះគ្មានអ្វីធ្លាក់ចេញពីដៃពួកគេទេ។ |
| Keeps promises, big and small | រក្សាពាក្យសន្យា ទាំងធំទាំងតូច |
| Can be trusted with important things | អាចទុកចិត្តបានលើរឿងសំខាន់ៗ |
| Finds it hard to say no | ពិបាកនឹងបដិសេធ |
| Can carry too much without saying so | អាចទទួលបន្ទុកច្រើនពេក ដោយមិននិយាយប្រាប់ |
| Trust them with responsibility — and check they are not carrying too much. | ទុកចិត្តពួកគេនូវការទទួលខុសត្រូវ — ហើយពិនិត្យមើលថាពួកគេមិនទទួលបន្ទុកច្រើនពេក។ |
| When I say I will do something, I do it. | នៅពេលខ្ញុំនិយាយថានឹងធ្វើអ្វីមួយ ខ្ញុំធ្វើវា។ |
| People trust me with important responsibilities. | មនុស្សទុកចិត្តខ្ញុំលើការទទួលខុសត្រូវសំខាន់ៗ។ |
| I am usually on time and prepared. | ជាធម្មតា ខ្ញុំមកទាន់ពេល ហើយត្រៀមខ្លួនរួចរាល់។ |
| I keep my promises, even the small ones. | ខ្ញុំរក្សាពាក្យសន្យារបស់ខ្ញុំ ទោះបីជារឿងតូចៗក៏ដោយ។ |
| I feel responsible for what I have agreed to do. | ខ្ញុំមានអារម្មណ៍ទទួលខុសត្រូវចំពោះអ្វីដែលខ្ញុំបានយល់ព្រមធ្វើ។ |
| If I make a mistake, I make it right. | បើខ្ញុំធ្វើខុស ខ្ញុំកែវាឱ្យត្រូវវិញ។ |
| Problem-Solver | អ្នកដោះស្រាយបញ្ហា |
| Finds what is broken and makes it work. | រកឃើញអ្វីដែលខូច ហើយធ្វើឱ្យវាដំណើរការ។ |
| Problem-solvers are drawn to what is not working. They stay calm, find the real cause and fix it, and they feel most useful when something has gone wrong and needs sorting out. | អ្នកដោះស្រាយបញ្ហា ត្រូវបានទាក់ទាញទៅរកអ្វីដែលមិនដំណើរការ។ ពួកគេនៅស្ងប់ រកឃើញមូលហេតុពិត ហើយជួសជុលវា ហើយពួកគេមានអារម្មណ៍ថាមានប្រយោជន៍បំផុត នៅពេលមានអ្វីមួយខុស ហើយត្រូវការដោះស្រាយ។ |
| Stays calm and practical when things break | នៅស្ងប់ និងជាក់ស្តែង នៅពេលអ្វីៗខូច |
| Finds the real cause, not just the symptom | រកឃើញមូលហេតុពិត មិនមែនត្រឹមតែរោគសញ្ញា |
| Can see only problems and miss what is going well | អាចឃើញតែបញ្ហា ហើយមើលរំលងអ្វីដែលកំពុងដំណើរការល្អ |
| May fix things for someone who needed to be listened to | អាចជួសជុលរឿងឱ្យនរណាម្នាក់ ដែលគ្រាន់តែត្រូវការឱ្យគេស្តាប់ |
| Bring them the hard problem, not just the easy task. | នាំបញ្ហាពិបាកមកឱ្យពួកគេ មិនមែនត្រឹមតែការងារងាយៗ។ |
| I like finding out why something is not working. | ខ្ញុំចូលចិត្តស្វែងរកមូលហេតុដែលអ្វីមួយមិនដំណើរការ។ |
| I stay calm when something goes wrong. | ខ្ញុំនៅស្ងប់ នៅពេលមានអ្វីមួយខុស។ |
| I enjoy fixing problems other people have given up on. | ខ្ញុំចូលចិត្តដោះស្រាយបញ្ហា ដែលអ្នកដទៃបានបោះបង់ចោល។ |
| When there is a problem, I look for the real cause. | នៅពេលមានបញ្ហា ខ្ញុំស្វែងរកមូលហេតុពិត។ |
| I enjoy repairing what is broken — a machine, a plan or a relationship. | ខ្ញុំចូលចិត្តជួសជុលអ្វីដែលខូច — ម៉ាស៊ីន ផែនការ ឬទំនាក់ទំនង។ |
| I like to be the one people call when something breaks. | ខ្ញុំចូលចិត្តជាអ្នកដែលមនុស្សហៅ នៅពេលមានអ្វីមួយខូច។ |
| Starter | អ្នកចាប់ផ្តើម |
| Gets things moving. | ធ្វើឱ្យអ្វីៗចាប់ផ្តើមដំណើរការ។ |
| Starters would rather begin than keep discussing. They turn talk into action, get the first step taken, and give a team the push it needs to stop waiting and start. | អ្នកចាប់ផ្តើម ចូលចិត្តចាប់ផ្តើមធ្វើ ជាជាងបន្តពិភាក្សា។ ពួកគេប្តូរការនិយាយទៅជាសកម្មភាព ធ្វើឱ្យជំហានដំបូងកើតឡើង ហើយផ្តល់ឱ្យក្រុមនូវការជំរុញដែលវាត្រូវការ ដើម្បីឈប់រង់ចាំ ហើយចាប់ផ្តើម។ |
| Turns talk into action | ប្តូរការនិយាយទៅជាសកម្មភាព |
| Gives a stuck team momentum | ផ្តល់សន្ទុះដល់ក្រុមដែលជាប់គាំង |
| Can start before the plan is ready | អាចចាប់ផ្តើម មុនពេលផែនការរួចរាល់ |
| May lose interest once the start is over | អាចបាត់ចំណាប់អារម្មណ៍ នៅពេលការចាប់ផ្តើមបានកន្លងផុត |
| Let them launch things — and pair them with someone who finishes well. | ឱ្យពួកគេចាប់ផ្តើមគម្រោង — ហើយផ្គូផ្គងពួកគេជាមួយអ្នកដែលចេះបញ្ចប់ការងារបានល្អ។ |
| I would rather start doing something than keep talking about it. | ខ្ញុំចូលចិត្តចាប់ផ្តើមធ្វើអ្វីមួយ ជាជាងបន្តនិយាយពីវា។ |
| I get things moving when a group is stuck. | ខ្ញុំធ្វើឱ្យអ្វីៗចាប់ផ្តើម នៅពេលក្រុមជាប់គាំង។ |
| I like being the first to try something new. | ខ្ញុំចូលចិត្តជាអ្នកដំបូងដែលសាកល្បងអ្វីថ្មី។ |
| I get impatient when we wait too long to begin. | ខ្ញុំអន្ទះអន្ទែង នៅពេលយើងរង់ចាំយូរពេកមុននឹងចាប់ផ្តើម។ |
| Once a decision is made, I want to act on it now. | នៅពេលការសម្រេចចិត្តត្រូវបានធ្វើរួច ខ្ញុំចង់ធ្វើសកម្មភាពភ្លាម។ |
| I learn by starting, then adjusting as I go. | ខ្ញុំរៀនដោយចាប់ផ្តើមធ្វើ រួចកែតម្រូវតាមផ្លូវ។ |
| Take-Charge | អ្នកទទួលបន្ទុកដឹកនាំ |
| Steps up and leads when a call is needed. | ឈានមុខ ហើយដឹកនាំ នៅពេលត្រូវការការសម្រេចចិត្ត។ |
| Take-charge people are comfortable leading and making decisions, even hard ones, even without every answer. When a team is stuck, they step forward, weigh the options quickly and choose, so everyone can move. | អ្នកទទួលបន្ទុកដឹកនាំ មានភាពស្រួលក្នុងការដឹកនាំ និងការសម្រេចចិត្ត ទោះបីជាការសម្រេចចិត្តពិបាក ហើយទោះបីជាមិនមានចម្លើយគ្រប់យ៉ាងក៏ដោយ។ នៅពេលក្រុមជាប់គាំង ពួកគេឈានមុខ ថ្លឹងថ្លែងជម្រើសយ៉ាងរហ័ស ហើយជ្រើសរើស ដើម្បីឱ្យមនុស្សគ្រប់គ្នាអាចបន្តទៅមុខ។ |
| Makes hard calls under pressure | សម្រេចចិត្តលើរឿងពិបាក ក្រោមសម្ពាធ |
| Helps a stuck team choose | ជួយក្រុមដែលជាប់គាំងឱ្យជ្រើសរើស |
| Can decide before others feel heard | អាចសម្រេចចិត្ត មុនពេលអ្នកដទៃមានអារម្មណ៍ថាគេបានស្តាប់ |
| May come across as forceful | អាចមើលទៅដូចជាខ្លាំងពេក |
| Give them the decision — and ask them to explain it with care. | ឱ្យពួកគេធ្វើការសម្រេចចិត្ត — ហើយសុំឱ្យពួកគេពន្យល់វាដោយយកចិត្តទុកដាក់។ |
| I am comfortable making hard decisions. | ខ្ញុំមានភាពស្រួលក្នុងការសម្រេចចិត្តលើរឿងពិបាក។ |
| When a group cannot decide, I help them choose. | នៅពេលក្រុមមិនអាចសម្រេចចិត្តបាន ខ្ញុំជួយពួកគេជ្រើសរើស។ |
| I can make a decision without having every answer. | ខ្ញុំអាចសម្រេចចិត្ត ដោយមិនចាំបាច់មានចម្លើយគ្រប់យ៉ាង។ |
| People look to me to make the call. | មនុស្សរំពឹងឱ្យខ្ញុំធ្វើការសម្រេចចិត្ត។ |
| I am not afraid to take charge. | ខ្ញុំមិនខ្លាចទទួលបន្ទុកដឹកនាំទេ។ |
| I tell people what I really think, even when it is hard to hear. | ខ្ញុំប្រាប់មនុស្សពីអ្វីដែលខ្ញុំគិតពិតប្រាកដ ទោះបីជាវាពិបាកស្តាប់ក៏ដោយ។ |
| Voice | សំឡេង |
| Says what needs saying, clearly. | និយាយអ្វីដែលត្រូវនិយាយ យ៉ាងច្បាស់។ |
| Voices put things into words. They explain clearly, speak up when something needs to be said, and help a room understand what is going on. People often remember what a Voice said. | អ្នកជាសំឡេង ដាក់អ្វីៗជាពាក្យសម្តី។ ពួកគេពន្យល់យ៉ាងច្បាស់ និយាយឡើង នៅពេលមានអ្វីត្រូវនិយាយ ហើយជួយឱ្យមនុស្សក្នុងបន្ទប់យល់ពីអ្វីដែលកំពុងកើតឡើង។ មនុស្សជាញឹកញាប់ចងចាំអ្វីដែលអ្នកជាសំឡេងបាននិយាយ។ |
| Explains things clearly | ពន្យល់អ្វីៗយ៉ាងច្បាស់ |
| Speaks up when others stay quiet | និយាយឡើង នៅពេលអ្នកដទៃនៅស្ងៀម |
| Can talk before listening | អាចនិយាយមុនពេលស្តាប់ |
| May fill a silence someone else needed | អាចបំពេញភាពស្ងៀមស្ងាត់ ដែលនរណាម្នាក់ផ្សេងទៀតត្រូវការ |
| Give them the message to carry — and time to listen first. | ឱ្យពួកគេនាំសារ — ហើយឱ្យពេលពួកគេស្តាប់ជាមុនសិន។ |
| I can explain things clearly so people understand. | ខ្ញុំអាចពន្យល់អ្វីៗឱ្យច្បាស់ ដើម្បីឱ្យមនុស្សយល់។ |
| I speak up when something needs to be said. | ខ្ញុំនិយាយឡើង នៅពេលមានអ្វីមួយត្រូវនិយាយ។ |
| I enjoy speaking in front of a group. | ខ្ញុំចូលចិត្តនិយាយនៅមុខក្រុម។ |
| People often remember what I said. | មនុស្សជាញឹកញាប់ចងចាំអ្វីដែលខ្ញុំបាននិយាយ។ |
| I enjoy telling people about our work. | ខ្ញុំចូលចិត្តប្រាប់មនុស្សអំពីការងាររបស់យើង។ |
| I like putting ideas into words people will remember. | ខ្ញុំចូលចិត្តដាក់គំនិតជាពាក្យសម្តីដែលមនុស្សនឹងចងចាំ។ |
| Pace-Setter | អ្នកកំណត់ល្បឿន |
| Measures up and aims to be the best. | វាស់វែងខ្លួនឯង ហើយប្រាថ្នាធ្វើឱ្យល្អបំផុត។ |
| Pace-setters notice how they measure up and want to do better than before, and often better than others. They love a clear score and a challenge, and their drive lifts the standard for everyone around them. | អ្នកកំណត់ល្បឿន កត់សម្គាល់ពីរបៀបដែលពួកគេប្រៀបធៀប ហើយចង់ធ្វើបានល្អជាងមុន ហើយជាញឹកញាប់ល្អជាងអ្នកដទៃ។ ពួកគេស្រឡាញ់ពិន្ទុច្បាស់លាស់ និងការប្រកួតប្រជែង ហើយកម្លាំងជំរុញរបស់ពួកគេ លើកកម្ពស់ស្តង់ដារសម្រាប់មនុស្សគ្រប់គ្នាជុំវិញពួកគេ។ |
| Raises the standard for the team | លើកកម្ពស់ស្តង់ដារសម្រាប់ក្រុម |
| Thrives on a challenge | រីកចម្រើនដោយការប្រកួតប្រជែង |
| Can take a loss too personally | អាចយកការចាញ់មកគិតជារឿងផ្ទាល់ខ្លួនពេក |
| May turn teamwork into a contest | អាចប្តូរការធ្វើការជាក្រុមទៅជាការប្រកួត |
| Give them a clear measure and a worthy challenge — and let them celebrate the team’s wins. | ផ្តល់ឱ្យពួកគេនូវរង្វាស់ច្បាស់លាស់ និងការប្រកួតប្រជែងដែលមានតម្លៃ — ហើយឱ្យពួកគេអបអរជ័យជម្នះរបស់ក្រុម។ |
| I like to know how my work compares with others. | ខ្ញុំចូលចិត្តដឹងថាការងាររបស់ខ្ញុំប្រៀបធៀបនឹងអ្នកដទៃយ៉ាងដូចម្តេច។ |
| I want to be the best at what I do. | ខ្ញុំចង់ពូកែបំផុតក្នុងអ្វីដែលខ្ញុំធ្វើ។ |
| I enjoy a challenge with a clear score. | ខ្ញុំចូលចិត្តការប្រកួតប្រជែងដែលមានពិន្ទុច្បាស់លាស់។ |
| I work harder when there is something to win. | ខ្ញុំធ្វើការខ្លាំងជាង នៅពេលមានអ្វីមួយត្រូវឈ្នះ។ |
| I keep track of my results. | ខ្ញុំតាមដានលទ្ធផលរបស់ខ្ញុំ។ |
| I do not like to lose. | ខ្ញុំមិនចូលចិត្តចាញ់ទេ។ |
| Improver | អ្នកកែលម្អ |
| Makes good things better. | ធ្វើឱ្យរបស់ល្អកាន់តែល្អ។ |
| Improvers notice how something could work better, and they cannot leave it alone. They polish, refine and raise the standard, and they help a team move from good enough to excellent. | អ្នកកែលម្អ កត់សម្គាល់ពីរបៀបដែលអ្វីមួយអាចដំណើរការល្អជាងនេះ ហើយពួកគេមិនអាចទុកវាចោលបានទេ។ ពួកគេខាត់ កែលម្អ និងលើកកម្ពស់ស្តង់ដារ ហើយពួកគេជួយក្រុមឱ្យផ្លាស់ពី "ល្អគ្រប់គ្រាន់" ទៅ "ល្អឥតខ្ចោះ"។ |
| Raises the quality of what the team does | លើកកម្ពស់គុណភាពនៃអ្វីដែលក្រុមធ្វើ |
| Sees small changes that make a big difference | ឃើញការផ្លាស់ប្តូរតូចៗដែលធ្វើឱ្យមានភាពខុសគ្នាធំ |
| Can struggle to call something finished | អាចពិបាកនិយាយថាអ្វីមួយបានចប់ហើយ |
| May seem critical of other people's work | អាចមើលទៅដូចជារិះគន់ការងាររបស់អ្នកដទៃ |
| Ask them to make one thing excellent. | សុំឱ្យពួកគេធ្វើឱ្យរបស់មួយល្អឥតខ្ចោះ។ |
| I notice how things could be done better. | ខ្ញុំកត់សម្គាល់ពីរបៀបដែលអ្វីៗអាចធ្វើបានល្អជាងនេះ។ |
| I like to take something good and make it excellent. | ខ្ញុំចូលចិត្តយករបស់ល្អមួយ ហើយធ្វើឱ្យវាល្អឥតខ្ចោះ។ |
| I care a lot about quality. | ខ្ញុំយកចិត្តទុកដាក់ខ្លាំងលើគុណភាព។ |
| I enjoy polishing work until it is just right. | ខ្ញុំចូលចិត្តខាត់ការងារ រហូតដល់វាត្រឹមត្រូវល្អ។ |
| I would rather grow what I am good at than fix what I am weak at. | ខ្ញុំចូលចិត្តពង្រីកអ្វីដែលខ្ញុំពូកែ ជាជាងជួសជុលអ្វីដែលខ្ញុំខ្សោយ។ |
| Average is not good enough for me. | កម្រិតមធ្យម មិនគ្រប់គ្រាន់សម្រាប់ខ្ញុំទេ។ |
| Confident | អ្នកមានទំនុកចិត្ត |
| Steady and sure of their direction. | នឹងនរ និងប្រាកដពីទិសដៅរបស់ខ្លួន។ |
| Confident people trust their own judgment. They can step into the unknown, make up their mind without needing others to agree, and stay steady under pressure — which helps others feel steady too. | អ្នកមានទំនុកចិត្ត ទុកចិត្តលើការវិនិច្ឆ័យរបស់ខ្លួន។ ពួកគេអាចឈានចូលទៅក្នុងអ្វីដែលមិនស្គាល់ សម្រេចចិត្តដោយមិនចាំបាច់ឱ្យអ្នកដទៃយល់ព្រម ហើយនៅនឹងនរក្រោមសម្ពាធ — ដែលជួយឱ្យអ្នកដទៃមានអារម្មណ៍នឹងនរដែរ។ |
| Steady under pressure | នឹងនរក្រោមសម្ពាធ |
| Willing to step into the unknown | ហ៊ានឈានចូលទៅក្នុងអ្វីដែលមិនស្គាល់ |
| Can seem not to need others' input | អាចមើលទៅដូចជាមិនត្រូវការយោបល់ពីអ្នកដទៃ |
| May find it hard to admit being unsure | អាចពិបាកទទួលស្គាល់ថាមិនប្រាកដ |
| Let them go first into the new and uncertain — and ask them to invite others’ views. | ឱ្យពួកគេទៅមុនគេក្នុងអ្វីដែលថ្មី និងមិនប្រាកដ — ហើយសុំឱ្យពួកគេអញ្ជើញយោបល់ពីអ្នកដទៃ។ |
| I trust my own judgment. | ខ្ញុំទុកចិត្តលើការវិនិច្ឆ័យរបស់ខ្ញុំ។ |
| I stay calm and sure of myself under pressure. | ខ្ញុំនៅស្ងប់ និងប្រាកដក្នុងខ្លួនឯងក្រោមសម្ពាធ។ |
| I am willing to try something no one has done before. | ខ្ញុំហ៊ានសាកល្បងអ្វីដែលគ្មាននរណាធ្លាប់ធ្វើ។ |
| I do not need others to agree with me before I act. | ខ្ញុំមិនចាំបាច់ឱ្យអ្នកដទៃយល់ស្របជាមួយខ្ញុំ មុនពេលខ្ញុំធ្វើទេ។ |
| I know what I am good at. | ខ្ញុំដឹងថាខ្ញុំពូកែអ្វី។ |
| I feel sure God can use me, even in hard places. | ខ្ញុំប្រាកដថាព្រះអាចប្រើខ្ញុំ ទោះនៅកន្លែងពិបាកក៏ដោយ។ |
| Difference-Maker | អ្នកបង្កើតភាពខុសគ្នា |
| Wants their life to count. | ចង់ឱ្យជីវិតរបស់ខ្លួនមានតម្លៃ។ |
| Difference-makers want to do work that matters and that people will remember. They aim high, take on big responsibility, and are willing to be seen, because they want their life to make a real mark for good. | អ្នកបង្កើតភាពខុសគ្នា ចង់ធ្វើការងារដែលសំខាន់ ហើយដែលមនុស្សនឹងចងចាំ។ ពួកគេប្រាថ្នាខ្ពស់ ទទួលយកការទទួលខុសត្រូវធំ ហើយហ៊ានឱ្យគេឃើញ ព្រោះពួកគេចង់ឱ្យជីវិតរបស់ពួកគេបន្សល់ទុកស្នាមល្អពិតប្រាកដ។ |
| Takes on big, important work | ទទួលយកការងារធំ និងសំខាន់ |
| Brings courage and ambition | នាំមកនូវភាពក្លាហាន និងមហិច្ឆតា |
| Can depend too much on praise | អាចពឹងលើការសរសើរច្រើនពេក |
| May feel low when their work goes unnoticed | អាចមានអារម្មណ៍ធ្លាក់ចុះ នៅពេលការងាររបស់ពួកគេមិនត្រូវបានគេកត់សម្គាល់ |
| Give them something big that matters — and thank them for it by name. | ផ្តល់ឱ្យពួកគេនូវអ្វីធំដែលសំខាន់ — ហើយអរគុណពួកគេដោយហៅឈ្មោះ។ |
| I want my life to make a real difference. | ខ្ញុំចង់ឱ្យជីវិតរបស់ខ្ញុំបង្កើតភាពខុសគ្នាពិតប្រាកដ។ |
| I want to be known for doing important work. | ខ្ញុំចង់ត្រូវបានគេស្គាល់ថាធ្វើការងារសំខាន់។ |
| I aim high in what I try to do. | ខ្ញុំប្រាថ្នាខ្ពស់ក្នុងអ្វីដែលខ្ញុំព្យាយាមធ្វើ។ |
| I like to be trusted with big responsibility. | ខ្ញុំចូលចិត្តត្រូវបានគេទុកចិត្តលើការទទួលខុសត្រូវធំ។ |
| It matters to me that my work is noticed. | វាសំខាន់សម្រាប់ខ្ញុំ ដែលការងាររបស់ខ្ញុំត្រូវបានគេកត់សម្គាល់។ |
| I want to leave something that lasts. | ខ្ញុំចង់បន្សល់ទុកអ្វីមួយដែលស្ថិតស្ថេរ។ |
| Friend-Maker | អ្នករកមិត្ត |
| Turns strangers into friends. | ប្តូរមនុស្សចម្លែកឱ្យក្លាយជាមិត្ត។ |
| Friend-makers love meeting new people. They break the ice, remember names, and win people over quickly, and doors open for a team because a Friend-Maker walked through them first. | អ្នករកមិត្ត ស្រឡាញ់ការជួបមនុស្សថ្មី។ ពួកគេបំបែកភាពស្ងៀមស្ងាត់ ចងចាំឈ្មោះ ហើយទាក់ទាញចិត្តមនុស្សបានយ៉ាងរហ័ស ហើយទ្វារបើកចំហសម្រាប់ក្រុម ព្រោះអ្នករកមិត្តបានដើរចូលមុនគេ។ |
| Builds new connections quickly | បង្កើតទំនាក់ទំនងថ្មីៗយ៉ាងរហ័ស |
| Makes visitors and partners feel at ease | ធ្វើឱ្យភ្ញៀវ និងដៃគូមានអារម្មណ៍ស្រួល |
| Can have many friends but few deep ones | អាចមានមិត្តច្រើន តែមិត្តជិតស្និទ្ធតិច |
| May lose energy with no new people around | អាចអស់កម្លាំង នៅពេលគ្មានមនុស្សថ្មីនៅជុំវិញ |
| Send them to meet new people — visitors, churches, partners. | ផ្ញើពួកគេទៅជួបមនុស្សថ្មី — ភ្ញៀវ ព្រះវិហារ ដៃគូ។ |
| I enjoy meeting new people. | ខ្ញុំចូលចិត្តជួបមនុស្សថ្មី។ |
| I can start a conversation with a stranger easily. | ខ្ញុំអាចចាប់ផ្តើមការសន្ទនាជាមួយមនុស្សចម្លែកបានយ៉ាងងាយ។ |
| I remember people’s names. | ខ្ញុំចងចាំឈ្មោះមនុស្ស។ |
| I like to win people over. | ខ្ញុំចូលចិត្តទាក់ទាញចិត្តមនុស្ស។ |
| I feel at home at a big event full of people. | ខ្ញុំមានអារម្មណ៍ដូចនៅផ្ទះ នៅក្នុងកម្មវិធីធំដែលមានមនុស្សច្រើន។ |
| I know people in many different places. | ខ្ញុំស្គាល់មនុស្សនៅកន្លែងផ្សេងៗជាច្រើន។ |
| Flexible | អ្នកបត់បែន |
| Goes with the flow. | ដើរតាមលំហូរ។ |
| Flexible people live in the present and adjust easily. When the day changes — and in ministry it often does — they take it in their stride, stay calm and help others keep going. | អ្នកបត់បែន រស់នៅក្នុងពេលបច្ចុប្បន្ន ហើយកែតម្រូវខ្លួនបានយ៉ាងងាយ។ នៅពេលថ្ងៃមួយផ្លាស់ប្តូរ — ហើយក្នុងការងារបម្រើ វាតែងតែផ្លាស់ប្តូរ — ពួកគេទទួលយកវាដោយស្ងប់ស្ងាត់ ហើយជួយអ្នកដទៃឱ្យបន្តទៅមុខ។ |
| Calm when plans change | ស្ងប់ស្ងាត់ នៅពេលផែនការផ្លាស់ប្តូរ |
| Responds well to what each moment needs | ឆ្លើយតបបានល្អចំពោះអ្វីដែលពេលនីមួយៗត្រូវការ |
| Can find long-term planning dull | អាចយល់ថាការរៀបផែនការរយៈពេលវែងគួរឱ្យធុញ |
| May let others’ plans fill their whole day | អាចឱ្យផែនការរបស់អ្នកដទៃពេញថ្ងៃទាំងមូលរបស់ពួកគេ |
| Put them where the day is unpredictable. | ដាក់ពួកគេនៅកន្លែងដែលថ្ងៃមិនអាចទាយទុកបាន។ |
| I am comfortable when plans change at the last minute. | ខ្ញុំមានភាពស្រួល នៅពេលផែនការផ្លាស់ប្តូរនៅនាទីចុងក្រោយ។ |
| I take each day as it comes. | ខ្ញុំទទួលយកថ្ងៃនីមួយៗតាមដែលវាមក។ |
| I stay calm when things are unpredictable. | ខ្ញុំនៅស្ងប់ នៅពេលអ្វីៗមិនអាចទាយទុកបាន។ |
| I can change what I am doing quickly when something else is needed. | ខ្ញុំអាចប្តូរអ្វីដែលខ្ញុំកំពុងធ្វើបានយ៉ាងរហ័ស នៅពេលត្រូវការអ្វីផ្សេង។ |
| I do not mind interruptions. | ខ្ញុំមិនខ្វល់នឹងការរំខានទេ។ |
| I enjoy days when I do not know what will happen. | ខ្ញុំចូលចិត្តថ្ងៃដែលខ្ញុំមិនដឹងថានឹងមានអ្វីកើតឡើង។ |
| Weaver | អ្នកតភ្ជាប់ |
| Sees how everything is connected. | ឃើញពីរបៀបដែលអ្វីៗទាំងអស់ភ្ជាប់គ្នា។ |
| Weavers believe things happen for a reason and that people are joined in ways we cannot always see. They notice God’s hand across different lives and events, and they help a team feel part of something bigger than itself. | អ្នកតភ្ជាប់ ជឿថាអ្វីៗកើតឡើងដោយមានហេតុផល ហើយមនុស្សត្រូវបានភ្ជាប់គ្នាតាមរបៀបដែលយើងមិនតែងតែមើលឃើញ។ ពួកគេកត់សម្គាល់ព្រះហស្តរបស់ព្រះ ក្នុងជីវិត និងព្រឹត្តិការណ៍ផ្សេងៗ ហើយជួយក្រុមឱ្យមានអារម្មណ៍ថាជាផ្នែកមួយនៃអ្វីដែលធំជាងខ្លួន។ |
| Helps people see they belong to something bigger | ជួយមនុស្សឱ្យឃើញថាពួកគេជាផ្នែកមួយនៃអ្វីដែលធំជាង |
| Brings hope and faith in hard times | នាំក្តីសង្ឃឹម និងជំនឿក្នុងពេលលំបាក |
| Can be hard to pin down to practical details | អាចពិបាកផ្តោតលើព័ត៌មានលម្អិតជាក់ស្តែង |
| May accept things that should be challenged | អាចទទួលយករឿងដែលគួរតែជំទាស់ |
| Ask them to help the team see God’s bigger story in the work. | សុំឱ្យពួកគេជួយក្រុមឱ្យឃើញរឿងរ៉ាវដ៏ធំរបស់ព្រះក្នុងការងារ។ |
| I believe things happen for a reason. | ខ្ញុំជឿថាអ្វីៗកើតឡើងដោយមានហេតុផល។ |
| I see how different people and events are connected. | ខ្ញុំឃើញពីរបៀបដែលមនុស្ស និងព្រឹត្តិការណ៍ផ្សេងៗភ្ជាប់គ្នា។ |
| I often notice God at work in ordinary moments. | ខ្ញុំតែងតែកត់សម្គាល់ឃើញព្រះកំពុងធ្វើការក្នុងពេលវេលាធម្មតា។ |
| I feel connected to people I have never met. | ខ្ញុំមានអារម្មណ៍ភ្ជាប់ជាមួយមនុស្សដែលខ្ញុំមិនធ្លាប់ជួប។ |
| I believe we all need each other. | ខ្ញុំជឿថាយើងទាំងអស់គ្នាត្រូវការគ្នាទៅវិញទៅមក។ |
| I see small things as part of a bigger story. | ខ្ញុំមើលឃើញរឿងតូចៗជាផ្នែកមួយនៃរឿងរ៉ាវដ៏ធំ។ |
| Mentor | អ្នកណែនាំ |
| Helps people grow, step by step. | ជួយមនុស្សឱ្យលូតលាស់ មួយជំហានម្តងៗ។ |
| Mentors see potential in people and love helping it grow. They notice small progress, give patient guidance, and find deep joy in watching someone become more than they were. | អ្នកណែនាំ ឃើញសក្តានុពលក្នុងមនុស្ស ហើយស្រឡាញ់ការជួយឱ្យវាលូតលាស់។ ពួកគេកត់សម្គាល់វឌ្ឍនភាពតូចៗ ផ្តល់ការណែនាំដោយអត់ធ្មត់ ហើយរកឃើញអំណរដ៏ជ្រាលជ្រៅ ក្នុងការមើលនរណាម្នាក់ក្លាយជាច្រើនជាងអ្វីដែលពួកគេធ្លាប់ជា។ |
| Sees and grows potential in people | ឃើញ ហើយបណ្តុះសក្តានុពលក្នុងមនុស្ស |
| Patient with slow progress | អត់ធ្មត់ជាមួយវឌ្ឍនភាពយឺត |
| Can keep investing in someone who is not ready | អាចបន្តវិនិយោគលើនរណាម្នាក់ដែលមិនទាន់រួចរាល់ |
| May neglect their own growth | អាចមិនយកចិត្តទុកដាក់លើការលូតលាស់ផ្ទាល់ខ្លួន |
| Give them someone to walk with. | ឱ្យពួកគេមាននរណាម្នាក់ដើម្បីដើរជាមួយ។ |
| I enjoy helping someone grow over time. | ខ្ញុំចូលចិត្តជួយនរណាម្នាក់ឱ្យលូតលាស់តាមពេលវេលា។ |
| I notice small progress in people. | ខ្ញុំកត់សម្គាល់វឌ្ឍនភាពតូចៗក្នុងមនុស្ស។ |
| I am patient when someone learns slowly. | ខ្ញុំអត់ធ្មត់ នៅពេលនរណាម្នាក់រៀនយឺត។ |
| It gives me joy to see someone become more capable. | វាផ្តល់អំណរដល់ខ្ញុំ ក្នុងការឃើញនរណាម្នាក់កាន់តែមានសមត្ថភាព។ |
| I encourage people to try things they think they cannot do. | ខ្ញុំលើកទឹកចិត្តមនុស្សឱ្យសាកល្បងអ្វីដែលពួកគេគិតថាធ្វើមិនបាន។ |
| I love to see people discover what they are good at. | ខ្ញុំស្រឡាញ់ការឃើញមនុស្សរកឃើញអ្វីដែលពួកគេពូកែ។ |
| Comforter | អ្នកលួងលោម |
| Feels what others are feeling. | មានអារម្មណ៍ពីអ្វីដែលអ្នកដទៃកំពុងមានអារម្មណ៍។ |
| Comforters sense other people’s feelings almost as their own. They know when someone is hurting, find the right words or simply stay close, and people feel understood with them. | អ្នកលួងលោម ដឹងពីអារម្មណ៍របស់អ្នកដទៃស្ទើរតែដូចជាអារម្មណ៍របស់ខ្លួនឯង។ ពួកគេដឹងនៅពេលនរណាម្នាក់កំពុងឈឺចាប់ រកពាក្យត្រឹមត្រូវ ឬគ្រាន់តែនៅក្បែរ ហើយមនុស្សមានអារម្មណ៍ថាត្រូវបានយល់ចិត្ត នៅពេលនៅជាមួយពួកគេ។ |
| Senses how people really feel | ដឹងពីអារម្មណ៍ពិតរបស់មនុស្ស |
| Brings comfort in hard times | នាំការលួងលោមក្នុងពេលលំបាក |
| Can carry other people’s pain as their own | អាចទទួលយកការឈឺចាប់របស់អ្នកដទៃដូចជារបស់ខ្លួន |
| May find hard decisions painful because of how others will feel | អាចយល់ថាការសម្រេចចិត្តពិបាកគឺឈឺចាប់ ដោយសារអារម្មណ៍របស់អ្នកដទៃ |
| Send them to the person who is hurting — and make sure they are cared for too. | ផ្ញើពួកគេទៅកាន់មនុស្សដែលកំពុងឈឺចាប់ — ហើយធ្វើឱ្យប្រាកដថាពួកគេក៏ត្រូវបានគេយកចិត្តទុកដាក់ដែរ។ |
| I can feel what other people are feeling. | ខ្ញុំអាចមានអារម្មណ៍ពីអ្វីដែលអ្នកដទៃកំពុងមានអារម្មណ៍។ |
| I often know someone is hurting before they say it. | ខ្ញុំតែងតែដឹងថានរណាម្នាក់កំពុងឈឺចាប់ មុនពេលពួកគេនិយាយ។ |
| I laugh or cry easily with others. | ខ្ញុំងាយនឹងសើច ឬយំជាមួយអ្នកដទៃ។ |
| People come to me when they are sad. | មនុស្សមករកខ្ញុំ នៅពេលពួកគេកើតទុក្ខ។ |
| I find the right words to comfort someone. | ខ្ញុំរកពាក្យត្រឹមត្រូវដើម្បីលួងលោមនរណាម្នាក់។ |
| I understand why people feel the way they do. | ខ្ញុំយល់ពីមូលហេតុដែលមនុស្សមានអារម្មណ៍បែបនោះ។ |
| Peacemaker | អ្នកផ្សះផ្សា |
| Brings people back together. | នាំមនុស្សឱ្យត្រឡប់មករួមគ្នាវិញ។ |
| Peacemakers notice tension early and work to heal it. They look for common ground, calm hard conversations, and help people who disagree keep working and living together. | អ្នកផ្សះផ្សា កត់សម្គាល់ភាពតានតឹងតាំងពីដំបូង ហើយខិតខំព្យាបាលវា។ ពួកគេស្វែងរកចំណុចរួម ធ្វើឱ្យការសន្ទនាពិបាកៗស្ងប់ ហើយជួយមនុស្សដែលមិនយល់ស្របគ្នា ឱ្យបន្តធ្វើការ និងរស់នៅជាមួយគ្នា។ |
| Calms tension and finds common ground | ធ្វើឱ្យភាពតានតឹងស្ងប់ ហើយរកចំណុចរួម |
| Helps people repair relationships | ជួយមនុស្សជួសជុលទំនាក់ទំនង |
| Can avoid a conflict that needs facing | អាចជៀសវាងជម្លោះដែលត្រូវតែប្រឈមមុខ |
| May keep the peace at their own cost | អាចរក្សាសន្តិភាព ដោយខាតបង់ខ្លួនឯង |
| Include them in hard conversations — and let them say hard things too. | ឱ្យពួកគេចូលរួមក្នុងការសន្ទនាពិបាកៗ — ហើយឱ្យពួកគេនិយាយរឿងពិបាកៗផងដែរ។ |
| I notice tension between people quickly. | ខ្ញុំកត់សម្គាល់ភាពតានតឹងរវាងមនុស្សយ៉ាងរហ័ស។ |
| I help people who disagree understand each other. | ខ្ញុំជួយមនុស្សដែលមិនយល់ស្របគ្នា ឱ្យយល់ពីគ្នាទៅវិញទៅមក។ |
| I work to restore relationships after a conflict. | ខ្ញុំខិតខំស្តារទំនាក់ទំនងឡើងវិញ បន្ទាប់ពីមានជម្លោះ។ |
| I look for what people agree on. | ខ្ញុំស្វែងរកអ្វីដែលមនុស្សយល់ស្របគ្នា។ |
| I do not like arguments. | ខ្ញុំមិនចូលចិត្តការឈ្លោះប្រកែកគ្នាទេ។ |
| I help a group find a way forward everyone can accept. | ខ្ញុំជួយក្រុមរកផ្លូវទៅមុខ ដែលមនុស្សគ្រប់គ្នាអាចទទួលយកបាន។ |
| Welcomer | អ្នកស្វាគមន៍ |
| Makes sure nobody is left out. | ធ្វើឱ្យប្រាកដថាគ្មាននរណាម្នាក់ត្រូវបានទុកចោល។ |
| Welcomers notice who is on the edge and bring them in. New people, shy people, visitors — a Welcomer makes each one feel they belong, and a community is warmer because of them. | អ្នកស្វាគមន៍ កត់សម្គាល់អ្នកដែលនៅខាងក្រៅ ហើយនាំពួកគេចូលមក។ មនុស្សថ្មី មនុស្សខ្មាស់អៀន ភ្ញៀវ — អ្នកស្វាគមន៍ធ្វើឱ្យម្នាក់ៗមានអារម្មណ៍ថាពួកគេជាផ្នែកមួយ ហើយសហគមន៍កក់ក្តៅជាងមុន ដោយសារពួកគេ។ |
| Notices and includes the person on the edge | កត់សម្គាល់ ហើយនាំអ្នកដែលនៅខាងក្រៅចូលមក |
| Makes newcomers feel at home | ធ្វើឱ្យអ្នកមកថ្មីមានអារម្មណ៍ដូចនៅផ្ទះ |
| Can spread themselves too thin | អាចបែងចែកខ្លួនឯងស្តើងពេក |
| May feel hurt when others do not include people | អាចឈឺចិត្ត នៅពេលអ្នកដទៃមិនរាប់បញ្ចូលមនុស្ស |
| Put them where new people arrive. | ដាក់ពួកគេនៅកន្លែងដែលមនុស្សថ្មីមកដល់។ |
| I notice when someone is left out. | ខ្ញុំកត់សម្គាល់ នៅពេលនរណាម្នាក់ត្រូវបានទុកចោល។ |
| I enjoy making new people feel welcome. | ខ្ញុំចូលចិត្តធ្វើឱ្យមនុស្សថ្មីមានអារម្មណ៍ថាត្រូវបានស្វាគមន៍។ |
| I invite others to join in. | ខ្ញុំអញ្ជើញអ្នកដទៃឱ្យចូលរួម។ |
| I want everyone in a group to feel they belong. | ខ្ញុំចង់ឱ្យមនុស្សគ្រប់គ្នាក្នុងក្រុម មានអារម្មណ៍ថាពួកគេជាផ្នែកមួយ។ |
| I include people who are different from me. | ខ្ញុំរាប់បញ្ចូលមនុស្សដែលខុសពីខ្ញុំ។ |
| There is always room for one more with me. | ជាមួយខ្ញុំ តែងតែមានកន្លែងសម្រាប់ម្នាក់ទៀត។ |
| Noticer | អ្នកសង្កេត |
| Sees what is special in each person. | ឃើញអ្វីដែលពិសេសក្នុងមនុស្សម្នាក់ៗ។ |
| Noticers see each person as different. They pick up what makes someone tick — what they love, how they learn, what they need — and they help a team put the right person in the right place. | អ្នកសង្កេត មើលឃើញមនុស្សម្នាក់ៗថាខុសៗគ្នា។ ពួកគេដឹងពីអ្វីដែលជំរុញនរណាម្នាក់ — អ្វីដែលពួកគេស្រឡាញ់ របៀបដែលពួកគេរៀន អ្វីដែលពួកគេត្រូវការ — ហើយពួកគេជួយក្រុមដាក់មនុស្សត្រឹមត្រូវនៅកន្លែងត្រឹមត្រូវ។ |
| Sees each person’s gifts and needs | ឃើញអំណោយទាន និងតម្រូវការរបស់មនុស្សម្នាក់ៗ |
| Helps the right person find the right role | ជួយមនុស្សត្រឹមត្រូវរកតួនាទីត្រឹមត្រូវ |
| Can find it hard when people are treated as one group | អាចពិបាកចិត្ត នៅពេលមនុស្សត្រូវបានចាត់ទុកជាក្រុមតែមួយ |
| May spend a long time on one person’s needs | អាចចំណាយពេលយូរលើតម្រូវការរបស់មនុស្សម្នាក់ |
| Ask them who would be best for a job, and how to encourage each person. | សួរពួកគេថានរណាល្អបំផុតសម្រាប់ការងារមួយ ហើយរបៀបលើកទឹកចិត្តមនុស្សម្នាក់ៗ។ |
| I notice what makes each person different. | ខ្ញុំកត់សម្គាល់អ្វីដែលធ្វើឱ្យមនុស្សម្នាក់ៗខុសគ្នា។ |
| I know what encourages each of my friends. | ខ្ញុំដឹងពីអ្វីដែលលើកទឹកចិត្តមិត្តភក្តិម្នាក់ៗរបស់ខ្ញុំ។ |
| I can tell which job would suit which person. | ខ្ញុំអាចដឹងថាការងារណាសមនឹងមនុស្សណា។ |
| I do not like it when everyone is treated as the same. | ខ្ញុំមិនចូលចិត្ត នៅពេលមនុស្សគ្រប់គ្នាត្រូវបានចាត់ទុកដូចគ្នា។ |
| I pay attention to how each person learns best. | ខ្ញុំយកចិត្តទុកដាក់ពីរបៀបដែលមនុស្សម្នាក់ៗរៀនបានល្អបំផុត។ |
| I remember what matters to each person. | ខ្ញុំចងចាំអ្វីដែលសំខាន់ចំពោះមនុស្សម្នាក់ៗ។ |
| Optimist | អ្នកសុទិដ្ឋិនិយម |
| Brings joy and lifts the mood. | នាំអំណរ និងលើកស្ទួយអារម្មណ៍។ |
| Optimists carry an enthusiasm people can feel. They laugh easily, celebrate small wins, and see the good in hard days, and a team finds new energy when an Optimist is with them. | អ្នកសុទិដ្ឋិនិយម មានភាពរីករាយដែលមនុស្សអាចមានអារម្មណ៍បាន។ ពួកគេងាយសើច អបអរជ័យជម្នះតូចៗ ហើយឃើញរឿងល្អក្នុងថ្ងៃលំបាក ហើយក្រុមរកឃើញថាមពលថ្មី នៅពេលអ្នកសុទិដ្ឋិនិយមនៅជាមួយ។ |
| Brings energy and hope | នាំថាមពល និងក្តីសង្ឃឹម |
| Celebrates people and small wins | អបអរមនុស្ស និងជ័យជម្នះតូចៗ |
| Can seem to skip over real pain | អាចមើលទៅដូចជារំលងការឈឺចាប់ពិតប្រាកដ |
| May find heavy, serious moments hard | អាចពិបាកជាមួយពេលវេលាធ្ងន់ធ្ងរ |
| Let them lead the celebrations — and give them room to be sad too. | ឱ្យពួកគេដឹកនាំការអបអរ — ហើយផ្តល់កន្លែងឱ្យពួកគេកើតទុក្ខផងដែរ។ |
| I make people laugh. | ខ្ញុំធ្វើឱ្យមនុស្សសើច។ |
| I find something good even on a hard day. | ខ្ញុំរកឃើញរឿងល្អ ទោះបីជាថ្ងៃលំបាកក៏ដោយ។ |
| I love to celebrate other people. | ខ្ញុំស្រឡាញ់ការអបអរអ្នកដទៃ។ |
| My energy lifts a group. | ថាមពលរបស់ខ្ញុំលើកទឹកចិត្តក្រុម។ |
| I help people have fun together. | ខ្ញុំជួយមនុស្សឱ្យសប្បាយជាមួយគ្នា។ |
| I am quick to praise people. | ខ្ញុំឆាប់សរសើរមនុស្ស។ |
| Loyal Friend | មិត្តស្មោះត្រង់ |
| Goes deep with a few people. | ស្និទ្ធស្នាលយ៉ាងជ្រៅជាមួយមនុស្សមួយចំនួន។ |
| Loyal friends would rather have a few close friendships than many easy ones. They give time, trust and honesty to the people close to them, and they stay — through hard seasons and over many years. | មិត្តស្មោះត្រង់ ចូលចិត្តមានមិត្តភាពជិតស្និទ្ធពីរបីនាក់ ជាជាងមិត្តភាពងាយៗច្រើន។ ពួកគេផ្តល់ពេលវេលា ការទុកចិត្ត និងភាពស្មោះត្រង់ដល់មនុស្សជិតស្និទ្ធ ហើយពួកគេនៅជាប់ — ឆ្លងកាត់រដូវលំបាក និងអស់រយៈពេលជាច្រើនឆ្នាំ។ |
| Builds deep, lasting trust | បង្កើតការទុកចិត្តជ្រៅ និងយូរអង្វែង |
| Stays faithful through hard seasons | នៅស្មោះត្រង់ ឆ្លងកាត់រដូវលំបាក |
| Can seem slow to let new people in | អាចមើលទៅយឺតក្នុងការទទួលមនុស្សថ្មី |
| May be deeply hurt when trust is broken | អាចឈឺចាប់ខ្លាំង នៅពេលការទុកចិត្តត្រូវបានបំបែក |
| Give them time to build trust — and a small team to belong to. | ផ្តល់ពេលឱ្យពួកគេបង្កើតការទុកចិត្ត — និងក្រុមតូចមួយដើម្បីជាផ្នែកមួយ។ |
| I would rather have a few close friends than many friends. | ខ្ញុំចូលចិត្តមានមិត្តជិតស្និទ្ធពីរបីនាក់ ជាជាងមិត្តច្រើន។ |
| I stay friends with people for many years. | ខ្ញុំនៅជាមិត្តជាមួយមនុស្សអស់រយៈពេលជាច្រើនឆ្នាំ។ |
| I am honest with the people close to me. | ខ្ញុំស្មោះត្រង់ជាមួយមនុស្សដែលជិតស្និទ្ធនឹងខ្ញុំ។ |
| I trust people slowly, but deeply. | ខ្ញុំទុកចិត្តមនុស្សយឺតៗ ប៉ុន្តែយ៉ាងជ្រៅ។ |
| I enjoy working with people I know well. | ខ្ញុំចូលចិត្តធ្វើការជាមួយមនុស្សដែលខ្ញុំស្គាល់ច្បាស់។ |
| My friends know they can count on me. | មិត្តភក្តិរបស់ខ្ញុំដឹងថាពួកគេអាចពឹងលើខ្ញុំបាន។ |
| Fact-Finder | អ្នកស្វែងរកការពិត |
| Wants the facts before trusting an idea. | ចង់បានការពិត មុនពេលទុកចិត្តលើគំនិតមួយ។ |
| Fact-finders test an idea before it is trusted. They look for the evidence and the gap in the plan, ask "how do we know?", and they save a team from mistakes that were easy to miss. | អ្នកស្វែងរកការពិត សាកល្បងគំនិតមួយ មុនពេលវាត្រូវបានទុកចិត្ត។ ពួកគេស្វែងរកភស្តុតាង និងចន្លោះក្នុងផែនការ សួរថា "តើយើងដឹងយ៉ាងដូចម្តេច?" ហើយពួកគេជួយក្រុមឱ្យរួចពីកំហុសដែលងាយនឹងមើលរំលង។ |
| Spots the weak point in a plan | រកឃើញចំណុចខ្សោយក្នុងផែនការ |
| Helps a team think more clearly | ជួយក្រុមឱ្យគិតកាន់តែច្បាស់ |
| Can sound negative when they mean to help | អាចស្តាប់ទៅអវិជ្ជមាន ទោះបីពួកគេចង់ជួយក៏ដោយ |
| May slow a decision down | អាចធ្វើឱ្យការសម្រេចចិត្តយឺត |
| Ask for their questions early, while changes are still easy. | សុំសំណួររបស់ពួកគេតាំងពីដំបូង ខណៈពេលដែលការផ្លាស់ប្តូរនៅងាយស្រួល។ |
| I like to test an idea before I accept it. | ខ្ញុំចូលចិត្តសាកល្បងគំនិតមួយ មុនពេលខ្ញុំទទួលយកវា។ |
| I notice weak points in a plan. | ខ្ញុំកត់សម្គាល់ចំណុចខ្សោយក្នុងផែនការ។ |
| I often ask, "How do we know this is true?" | ខ្ញុំតែងតែសួរថា "តើយើងដឹងយ៉ាងដូចម្តេចថារឿងនេះពិត?" |
| I want to see the facts before I believe something. | ខ្ញុំចង់ឃើញការពិត មុនពេលខ្ញុំជឿអ្វីមួយ។ |
| I like finding patterns in numbers and information. | ខ្ញុំចូលចិត្តស្វែងរកលំនាំក្នុងលេខ និងព័ត៌មាន។ |
| I ask for the reason behind a decision. | ខ្ញុំសួររកហេតុផលនៅពីក្រោយការសម្រេចចិត្ត។ |
| Historian | អ្នកប្រវត្តិសាស្ត្រ |
| Learns from what came before. | រៀនពីអ្វីដែលបានកើតឡើងពីមុន។ |
| Historians look back to understand the present. They want to know how something started and what has happened before, and they help a team learn from its history instead of repeating it. | អ្នកប្រវត្តិសាស្ត្រ ក្រឡេកមើលក្រោយ ដើម្បីយល់ពីបច្ចុប្បន្ន។ ពួកគេចង់ដឹងថាអ្វីមួយបានចាប់ផ្តើមយ៉ាងដូចម្តេច និងអ្វីដែលបានកើតឡើងពីមុន ហើយពួកគេជួយក្រុមឱ្យរៀនពីប្រវត្តិរបស់ខ្លួន ជាជាងធ្វើម្តងទៀត។ |
| Brings the lessons of the past | នាំមកនូវមេរៀនពីអតីតកាល |
| Helps new people understand how things came to be | ជួយមនុស្សថ្មីឱ្យយល់ពីរបៀបដែលអ្វីៗបានកើតឡើង |
| Can hold on to the way things used to be | អាចប្រកាន់ខ្ជាប់នឹងរបៀបដែលអ្វីៗធ្លាប់ជា |
| May be slow to trust a new idea with no history | អាចយឺតក្នុងការទុកចិត្តគំនិតថ្មីដែលគ្មានប្រវត្តិ |
| Ask them to tell new staff how the ministry began. | សុំឱ្យពួកគេប្រាប់បុគ្គលិកថ្មីពីរបៀបដែលក្រសួងបម្រើបានចាប់ផ្តើម។ |
| I like to know how something started. | ខ្ញុំចូលចិត្តដឹងថាអ្វីមួយបានចាប់ផ្តើមយ៉ាងដូចម្តេច។ |
| I learn a lot from looking at what has happened before. | ខ្ញុំរៀនបានច្រើន ពីការមើលអ្វីដែលបានកើតឡើងពីមុន។ |
| I enjoy history and people’s life stories. | ខ្ញុំចូលចិត្តប្រវត្តិសាស្ត្រ និងរឿងរ៉ាវជីវិតរបស់មនុស្ស។ |
| Before I decide, I ask what we did last time. | មុនពេលខ្ញុំសម្រេចចិត្ត ខ្ញុំសួរថាយើងបានធ្វើអ្វីលើកមុន។ |
| I remember what happened in the past, and why. | ខ្ញុំចងចាំអ្វីដែលបានកើតឡើងពីមុន និងមូលហេតុ។ |
| I understand people better when I know where they come from. | ខ្ញុំយល់ពីមនុស្សបានច្បាស់ជាង នៅពេលខ្ញុំដឹងថាពួកគេមកពីណា។ |
| Visionary | អ្នកមានចក្ខុវិស័យ |
| Imagines what could be. | ស្រមៃពីអ្វីដែលអាចកើតឡើង។ |
| Visionaries see a future that does not exist yet and help others see it too. They dream about what God could do, paint a picture people want to join, and give a team hope and direction. | អ្នកមានចក្ខុវិស័យ មើលឃើញអនាគតដែលមិនទាន់មាន ហើយជួយអ្នកដទៃឱ្យមើលឃើញវាដែរ។ ពួកគេស្រមៃពីអ្វីដែលព្រះអាចធ្វើ គូររូបភាពដែលមនុស្សចង់ចូលរួម ហើយផ្តល់ឱ្យក្រុមនូវក្តីសង្ឃឹម និងទិសដៅ។ |
| Paints a hopeful picture of the future | គូររូបភាពអនាគតដែលពោរពេញដោយក្តីសង្ឃឹម |
| Gives a team direction | ផ្តល់ទិសដៅដល់ក្រុម |
| Can overlook what it takes to get there | អាចមើលរំលងអ្វីដែលត្រូវការដើម្បីទៅដល់ទីនោះ |
| May be frustrated by slow progress | អាចខកចិត្តនឹងវឌ្ឍនភាពយឺត |
| Let them share the dream — then plan the first step together. | ឱ្យពួកគេចែករំលែកក្តីស្រមៃ — បន្ទាប់មករៀបផែនការជំហានដំបូងជាមួយគ្នា។ |
| I often imagine what the future could look like. | ខ្ញុំតែងតែស្រមៃពីអនាគតដែលអាចមានរូបរាង។ |
| I can describe a dream in a way that excites others. | ខ្ញុំអាចរៀបរាប់ពីក្តីស្រមៃ តាមរបៀបដែលធ្វើឱ្យអ្នកដទៃរំភើប។ |
| I believe things can be much better than they are now. | ខ្ញុំជឿថាអ្វីៗអាចល្អប្រសើរជាងពេលនេះច្រើន។ |
| I think a lot about what God could do through our work. | ខ្ញុំគិតច្រើនពីអ្វីដែលព្រះអាចធ្វើតាមរយៈការងាររបស់យើង។ |
| I like to picture where we could be in five years. | ខ្ញុំចូលចិត្តស្រមៃថាយើងអាចនៅទីណាក្នុងរយៈពេលប្រាំឆ្នាំទៀត។ |
| Big dreams give me energy. | ក្តីស្រមៃធំៗ ផ្តល់ថាមពលដល់ខ្ញុំ។ |
| Inventor | អ្នកច្នៃប្រឌិត |
| Comes up with fresh ideas. | បង្កើតគំនិតថ្មីៗ។ |
| Inventors come up with new ideas easily. They see a different way to do almost anything, connect ideas nobody else put together, and bring creativity to problems that seemed fixed. | អ្នកច្នៃប្រឌិត បង្កើតគំនិតថ្មីៗបានយ៉ាងងាយ។ ពួកគេឃើញវិធីផ្សេងដើម្បីធ្វើស្ទើរតែគ្រប់យ៉ាង ភ្ជាប់គំនិតដែលគ្មាននរណាម្នាក់បានភ្ជាប់ ហើយនាំភាពច្នៃប្រឌិតមកកាន់បញ្ហាដែលហាក់ដូចជាមិនអាចផ្លាស់ប្តូរបាន។ |
| Full of fresh, creative ideas | ពោរពេញដោយគំនិតថ្មី និងច្នៃប្រឌិត |
| Finds new ways around old problems | រកឃើញវិធីថ្មីដើម្បីដោះស្រាយបញ្ហាចាស់ៗ |
| Can have more ideas than the team can use | អាចមានគំនិតច្រើនជាងអ្វីដែលក្រុមអាចប្រើបាន |
| May lose interest once an idea is chosen | អាចបាត់ចំណាប់អារម្មណ៍ នៅពេលគំនិតមួយត្រូវបានជ្រើសរើសរួច |
| Invite them to brainstorm — then let others help choose. | អញ្ជើញពួកគេឱ្យបញ្ចេញគំនិត — បន្ទាប់មកឱ្យអ្នកដទៃជួយជ្រើសរើស។ |
| New ideas come to me easily. | គំនិតថ្មីៗមកដល់ខ្ញុំយ៉ាងងាយ។ |
| I often think of a different way to do things. | ខ្ញុំតែងតែគិតពីវិធីផ្សេងដើម្បីធ្វើអ្វីៗ។ |
| I enjoy brainstorming. | ខ្ញុំចូលចិត្តការបញ្ចេញគំនិត។ |
| I connect ideas that others do not put together. | ខ្ញុំភ្ជាប់គំនិតដែលអ្នកដទៃមិនបានភ្ជាប់។ |
| I enjoy thinking up new names, designs or plans. | ខ្ញុំចូលចិត្តគិតបង្កើតឈ្មោះ ការរចនា ឬផែនការថ្មីៗ។ |
| I get bored doing things the same way every time. | ខ្ញុំធុញ នៅពេលធ្វើអ្វីៗតាមរបៀបដដែលរាល់ដង។ |
| Collector | អ្នកប្រមូល |
| Gathers what might be useful. | ប្រមូលអ្វីដែលអាចមានប្រយោជន៍។ |
| Collectors love to gather — information, ideas, stories, resources and contacts. They keep what they find, and when the team needs something, the Collector often already has it. | អ្នកប្រមូល ស្រឡាញ់ការប្រមូល — ព័ត៌មាន គំនិត រឿងរ៉ាវ ធនធាន និងទំនាក់ទំនង។ ពួកគេរក្សាទុកអ្វីដែលពួកគេរកឃើញ ហើយនៅពេលក្រុមត្រូវការអ្វីមួយ អ្នកប្រមូលជាញឹកញាប់មានវារួចហើយ។ |
| Finds and keeps useful information and resources | រកឃើញ និងរក្សាទុកព័ត៌មាន និងធនធានដែលមានប្រយោជន៍ |
| Often has what the team needs | ជាញឹកញាប់មានអ្វីដែលក្រុមត្រូវការ |
| Can gather more than they use | អាចប្រមូលច្រើនជាងអ្វីដែលពួកគេប្រើ |
| May find it hard to let things go | អាចពិបាកបោះបង់ចោលរបស់របរ |
| Ask them to find things out — and to keep the team’s resources in order. | សុំឱ្យពួកគេស្វែងរកព័ត៌មាន — និងរក្សាធនធានរបស់ក្រុមឱ្យមានសណ្តាប់ធ្នាប់។ |
| I collect useful information, ideas or things. | ខ្ញុំប្រមូលព័ត៌មាន គំនិត ឬរបស់របរដែលមានប្រយោជន៍។ |
| I save notes and links in case they are useful later. | ខ្ញុំរក្សាទុកកំណត់ត្រា និងតំណភ្ជាប់ ក្រែងលោមានប្រយោជន៍នៅពេលក្រោយ។ |
| I like to have resources ready before someone needs them. | ខ្ញុំចូលចិត្តត្រៀមធនធានរួចរាល់ មុនពេលនរណាម្នាក់ត្រូវការវា។ |
| I enjoy researching a question. | ខ្ញុំចូលចិត្តស្រាវជ្រាវសំណួរមួយ។ |
| People ask me where to find things. | មនុស្សសួរខ្ញុំថាត្រូវរករបស់នៅឯណា។ |
| I keep things that might be useful one day. | ខ្ញុំរក្សាទុករបស់ដែលអាចមានប្រយោជន៍នៅថ្ងៃណាមួយ។ |
| Deep Thinker | អ្នកគិតជ្រៅ |
| Loves time to think. | ស្រឡាញ់ពេលវេលាសម្រាប់គិត។ |
| Deep thinkers enjoy the work of thinking itself. They need quiet time to reflect, ask big questions, and turn ideas over until they are clear, and they bring depth and wisdom to a team’s conversations. | អ្នកគិតជ្រៅ ចូលចិត្តការគិតដោយខ្លួនវាផ្ទាល់។ ពួកគេត្រូវការពេលស្ងាត់ដើម្បីពិចារណា សួរសំណួរធំៗ ហើយគិតពីគំនិតម្តងហើយម្តងទៀត រហូតដល់វាច្បាស់ ហើយពួកគេនាំមកនូវភាពជ្រាលជ្រៅ និងប្រាជ្ញាក្នុងការសន្ទនារបស់ក្រុម។ |
| Brings depth and wisdom | នាំមកនូវភាពជ្រាលជ្រៅ និងប្រាជ្ញា |
| Thinks hard questions through clearly | គិតពីសំណួរពិបាកៗបានយ៉ាងច្បាស់ |
| Can seem distant while thinking | អាចមើលទៅដូចជានៅឆ្ងាយ ពេលកំពុងគិត |
| May need time before sharing an opinion | អាចត្រូវការពេល មុនពេលចែករំលែកយោបល់ |
| Give them the question in advance, and time alone to think. | ផ្តល់សំណួរឱ្យពួកគេជាមុន និងពេលវេលានៅម្នាក់ឯងដើម្បីគិត។ |
| I enjoy time alone to think. | ខ្ញុំចូលចិត្តពេលវេលានៅម្នាក់ឯងដើម្បីគិត។ |
| I like big questions about life and faith. | ខ្ញុំចូលចិត្តសំណួរធំៗអំពីជីវិត និងជំនឿ។ |
| I think things over for a long time. | ខ្ញុំគិតពីអ្វីៗអស់រយៈពេលយូរ។ |
| I enjoy deep conversations more than small talk. | ខ្ញុំចូលចិត្តការសន្ទនាជ្រាលជ្រៅ ជាងការនិយាយលេងតិចតួច។ |
| I need time to think before I answer a hard question. | ខ្ញុំត្រូវការពេលគិត មុនពេលឆ្លើយសំណួរពិបាក។ |
| Writing or journaling helps me think. | ការសរសេរ ឬកត់ត្រាប្រចាំថ្ងៃ ជួយខ្ញុំឱ្យគិត។ |
| Curious | អ្នកចង់ដឹង |
| Always wants to know more. | តែងតែចង់ដឹងបន្ថែម។ |
| Curious people love to learn. They ask questions, read, try things out and collect ideas, and they bring fresh knowledge into a team that keeps everyone growing. | អ្នកចង់ដឹង ស្រឡាញ់ការរៀន។ ពួកគេសួរសំណួរ អាន សាកល្បងអ្វីៗ និងប្រមូលគំនិត ហើយពួកគេនាំចំណេះដឹងថ្មីៗចូលក្នុងក្រុម ដែលធ្វើឱ្យមនុស្សគ្រប់គ្នាបន្តលូតលាស់។ |
| Learns quickly and loves new knowledge | រៀនបានលឿន ហើយស្រឡាញ់ចំណេះដឹងថ្មី |
| Brings fresh ideas and information | នាំមកនូវគំនិត និងព័ត៌មានថ្មីៗ |
| Can learn things without using them | អាចរៀនអ្វីៗ ដោយមិនយកវាទៅប្រើ |
| May get pulled away by the next interesting thing | អាចត្រូវបានទាញចេញដោយរឿងគួរឱ្យចាប់អារម្មណ៍បន្ទាប់ |
| Give them something new to learn about — and ask them to teach it back. | ផ្តល់ឱ្យពួកគេនូវអ្វីថ្មីដើម្បីរៀន — ហើយសុំឱ្យពួកគេបង្រៀនវាត្រឡប់មកវិញ។ |
| I love learning new things. | ខ្ញុំស្រឡាញ់ការរៀនអ្វីថ្មីៗ។ |
| I ask a lot of questions. | ខ្ញុំសួរសំណួរច្រើន។ |
| I read or look things up just because I want to know. | ខ្ញុំអាន ឬស្វែងរកព័ត៌មាន ដោយគ្រាន់តែចង់ដឹង។ |
| I enjoy learning a new skill. | ខ្ញុំចូលចិត្តរៀនជំនាញថ្មី។ |
| I enjoy taking a class or a training. | ខ្ញុំចូលចិត្តចូលរៀនថ្នាក់ ឬវគ្គបណ្តុះបណ្តាល។ |
| I like to learn from people who know more than me. | ខ្ញុំចូលចិត្តរៀនពីមនុស្សដែលចេះច្រើនជាងខ្ញុំ។ |
| Pathfinder | អ្នករកផ្លូវ |
| Finds the best way forward. | រកឃើញផ្លូវល្អបំផុតទៅមុខ។ |
| Pathfinders see many possible routes and quickly pick the best one. When a team is stuck, they see the options, think through where each leads, and find a way through that others missed. | អ្នករកផ្លូវ មើលឃើញផ្លូវជាច្រើនដែលអាចទៅបាន ហើយជ្រើសរើសផ្លូវល្អបំផុតយ៉ាងរហ័ស។ នៅពេលក្រុមជាប់គាំង ពួកគេឃើញជម្រើសនានា គិតពីកន្លែងដែលជម្រើសនីមួយៗនាំទៅ ហើយរកឃើញផ្លូវឆ្លងកាត់ដែលអ្នកដទៃមើលរំលង។ |
| Sees options others miss | ឃើញជម្រើសដែលអ្នកដទៃមើលរំលង |
| Finds a way through when the team is stuck | រកឃើញផ្លូវឆ្លងកាត់ នៅពេលក្រុមជាប់គាំង |
| Can move on before others see the path | អាចបន្តទៅមុខ មុនពេលអ្នកដទៃឃើញផ្លូវ |
| May seem to skip steps when explaining | អាចមើលទៅដូចជារំលងជំហាន ពេលពន្យល់ |
| Bring them in when the team cannot see a way forward. | ហៅពួកគេចូលមក នៅពេលក្រុមមើលមិនឃើញផ្លូវទៅមុខ។ |
| I can quickly see different ways to reach a goal. | ខ្ញុំអាចឃើញវិធីផ្សេងៗដើម្បីទៅដល់គោលដៅបានយ៉ាងរហ័ស។ |
| When one way is blocked, I find another. | នៅពេលផ្លូវមួយត្រូវបានបិទ ខ្ញុំរកឃើញផ្លូវមួយទៀត។ |
| I think about where each choice will lead. | ខ្ញុំគិតពីកន្លែងដែលជម្រើសនីមួយៗនឹងនាំទៅ។ |
| I can see the best path when others are confused. | ខ្ញុំអាចឃើញផ្លូវល្អបំផុត នៅពេលអ្នកដទៃភាន់ច្រឡំ។ |
| I like to think a few steps ahead. | ខ្ញុំចូលចិត្តគិតទុកជាមុនពីរបីជំហាន។ |
| I quickly spot the options in a situation. | ខ្ញុំឆាប់រកឃើញជម្រើសនានាក្នុងស្ថានភាពមួយ។ |

## 54. Numbers people — who enters a ministry's weekly numbers, due Friday

Each ministry now has a main person and a backup for its weekly numbers, due by
Friday. These are the labels on My Ministry, the Friday "due today" and
Saturday "overdue" reminders, and the department leader's done / not done list.
"Numbers" here means the ministry's weekly KPI figures, not phone numbers.

| English | Khmer (pending) |
|---|---|
| Enter them | បញ្ចូលវា |
| {ministry} numbers for week {wk} are overdue | លេខរបស់ {ministry} សម្រាប់សប្តាហ៍ទី {wk} ហួសកំណត់ហើយ |
| {ministry} numbers for week {wk} are due today | លេខរបស់ {ministry} សម្រាប់សប្តាហ៍ទី {wk} ត្រូវបញ្ចូលនៅថ្ងៃនេះ |
| See them | មើលវា |
| {dept} week {wk}: {n} of {total} ministries have their numbers in. | {dept} សប្តាហ៍ទី {wk}៖ ក្រសួងបម្រើ {n} ក្នុងចំណោម {total} បានបញ្ចូលលេខរួចហើយ។ |
| Not yet: {list} | មិនទាន់៖ {list} |
| {dept} week {wk}: still missing {list} | {dept} សប្តាហ៍ទី {wk}៖ នៅខ្វះ {list} |
| Numbers are in · {n} of {total} entered | លេខបានបញ្ចូលរួច · បានបញ្ចូល {n} ក្នុងចំណោម {total} |
| Due today · {n} of {total} entered | ត្រូវបញ្ចូលថ្ងៃនេះ · បានបញ្ចូល {n} ក្នុងចំណោម {total} |
| Overdue — was due Friday, {date} · {n} of {total} entered | ហួសកំណត់ — ត្រូវបញ្ចូលនៅថ្ងៃសុក្រ {date} · បានបញ្ចូល {n} ក្នុងចំណោម {total} |
| Due Friday, {date} · {n} of {total} entered | ត្រូវបញ្ចូលនៅថ្ងៃសុក្រ {date} · បានបញ្ចូល {n} ក្នុងចំណោម {total} |
| Week {wk} numbers | លេខសប្តាហ៍ទី {wk} |
| Numbers: {name} | អ្នកបញ្ចូលលេខ៖ {name} |
| Numbers: {name} (ministry leader) | អ្នកបញ្ចូលលេខ៖ {name} (អ្នកដឹកនាំក្រសួងបម្រើ) |
| Nobody is responsible for these numbers yet | មិនទាន់មាននរណាម្នាក់ទទួលខុសត្រូវលើលេខទាំងនេះទេ |
| Backup: {name} | អ្នកជំនួស៖ {name} |
| Change | ប្តូរ |
| Choose | ជ្រើសរើស |
| Main person | អ្នកទទួលខុសត្រូវចម្បង |
| Nobody — the ministry leader | គ្មាន — អ្នកដឹកនាំក្រសួងបម្រើ |
| Backup | អ្នកជំនួស |
| No backup | គ្មានអ្នកជំនួស |
| They get a reminder on Friday if the week’s numbers aren’t in, and again on Saturday. Anyone on the ministry can still enter them. | ពួកគេនឹងទទួលបានការរំលឹកនៅថ្ងៃសុក្រ ប្រសិនបើលេខប្រចាំសប្តាហ៍មិនទាន់បានបញ្ចូល ហើយម្តងទៀតនៅថ្ងៃសៅរ៍។ អ្នកណាម្នាក់ក្នុងក្រសួងបម្រើនៅតែអាចបញ្ចូលបាន។ |
| nobody set | មិនទាន់កំណត់ |
| {dept} numbers | លេខរបស់ {dept} |
| {n} of {total} in | បានបញ្ចូល {n} ក្នុងចំណោម {total} |
| overdue | ហួសកំណត់ |
| due today | ត្រូវបញ្ចូលថ្ងៃនេះ |
| due Friday, {date} | ត្រូវបញ្ចូលនៅថ្ងៃសុក្រ {date} |
| Pick two different people | សូមជ្រើសរើសមនុស្សពីរនាក់ផ្សេងគ្នា |
| Choose a main person first | សូមជ្រើសរើសអ្នកទទួលខុសត្រូវចម្បងជាមុនសិន |

## 55. Campus Leadership — the department pulse, the Director's quarter, staff debt

A department leader's page now opens with six figures about their department
(numbers in, staff and who is away, health, 1-on-1s, OKRs, staff debt); the
Campus Director enters three scores once a quarter; Finance enters staff debt
monthly. "Health" is a department average — the note under it promises nobody's
answers are shown, so please make sure the Khmer says exactly that.

| English | Khmer (pending) |
|---|---|
| {dept} this week | {dept} សប្តាហ៍នេះ |
| Couldn’t load this — pull down to try again. | មិនអាចផ្ទុកបានទេ — ទាញចុះក្រោមដើម្បីសាកល្បងម្តងទៀត។ |
| Numbers in | លេខបានបញ្ចូល |
| all in | បញ្ចូលរួចទាំងអស់ |
| {n} away this week | {n} នាក់អវត្តមានសប្តាហ៍នេះ |
| nobody away this week | គ្មាននរណាអវត្តមានសប្តាហ៍នេះទេ |
| {n} of {total} answered · week {wk} | បានឆ្លើយ {n} ក្នុងចំណោម {total} · សប្តាហ៍ទី {wk} |
| {n} answered — too few to show | បានឆ្លើយ {n} — តិចពេកដើម្បីបង្ហាញ |
| 1-on-1s | ការជួបម្នាក់ទល់ម្នាក់ |
| {n} objectives · Q{q} | គោលបំណង {n} · ត្រីមាសទី {q} |
| none this quarter | គ្មាននៅត្រីមាសនេះទេ |
| Staff debt | បំណុលបុគ្គលិក |
| not entered yet | មិនទាន់បញ្ចូលនៅឡើយ |
| Away: | អវត្តមាន៖ |
| Health is the department’s average check-in score, never anyone’s answers — hidden when fewer than {n} answered. | សុខភាព គឺជាពិន្ទុជាមធ្យមនៃការឆែកសុខភាពរបស់ផ្នែក មិនមែនជាចម្លើយរបស់នរណាម្នាក់ទេ — លាក់ទុកនៅពេលមានអ្នកឆ្លើយតិចជាង {n} នាក់។ |
| Which ministries are in | ក្រសួងបម្រើណាខ្លះបានបញ្ចូលរួច |
| Q{q} check-in | ការពិនិត្យត្រីមាសទី {q} |
| Once a quarter: how the base is doing, in your own honest view. | ម្តងក្នុងមួយត្រីមាស៖ មូលដ្ឋានកំពុងដំណើរការយ៉ាងដូចម្តេច តាមទស្សនៈស្មោះត្រង់របស់អ្នក។ |
| Save Q{q} | រក្សាទុកត្រីមាសទី {q} |
| Once a month, from the Finance office. Department leaders see it on their page. | ម្តងក្នុងមួយខែ ពីការិយាល័យហិរញ្ញវត្ថុ។ អ្នកដឹកនាំផ្នែកមើលឃើញវានៅលើទំព័ររបស់ពួកគេ។ |
| Save staff debt | រក្សាទុកបំណុលបុគ្គលិក |
| {metric} goes from {min} to {max} — check the number you typed. | {metric} គឺពី {min} ដល់ {max} — សូមពិនិត្យលេខដែលអ្នកបានវាយ។ |
| from Finance, {date} | ពីហិរញ្ញវត្ថុ {date} |
| last entered {date} | បញ្ចូលចុងក្រោយ {date} |

## 56. What each KPI means (the ⓘ beside every box)

Staff can now tap ⓘ beside any metric they log to read one line on what to
count. These are the KPI guide's own English lines (help.html), so the Khmer
should say exactly the same thing — what to count, and for how long ("this
week", "right now — latest count"). Short is better: it sits under the metric
name on a phone.

| English | Khmer (pending) |
|---|---|
| What to count | អ្វីដែលត្រូវរាប់ |
| {metric} goes from {min} to {max} — check the number you typed. | {metric} គឺពី {min} ដល់ {max} — សូមពិនិត្យលេខដែលអ្នកបានវាយ។ |
| Days the café was open this week. | ចំនួនថ្ងៃដែលហាងកាហ្វេបានបើកនៅសប្តាហ៍នេះ។ |
| Drinks sold this week. | ភេសជ្ជៈដែលបានលក់នៅសប្តាហ៍នេះ។ |
| Customers served this week. | អតិថិជនដែលបានបម្រើនៅសប្តាហ៍នេះ។ |
| Meaningful faith conversations you had with customers. | ការសន្ទនាអំពីជំនឿដែលមានអត្ថន័យ ដែលអ្នកបានធ្វើជាមួយអតិថិជន។ |
| People who prayed to receive Jesus for the first time this week. | មនុស្សដែលបានអធិស្ឋានទទួលព្រះយេស៊ូវជាលើកដំបូងនៅសប្តាហ៍នេះ។ |
| Income minus expenses this week, in dollars. | ចំណូលដកចំណាយនៅសប្តាហ៍នេះ គិតជាដុល្លារ។ |
| Total money spent running the café this week. | ប្រាក់សរុបដែលបានចំណាយលើការដំណើរការហាងកាហ្វេនៅសប្តាហ៍នេះ។ |
| Current balance — enter the latest number, not a weekly total. | សមតុល្យបច្ចុប្បន្ន — បញ្ចូលលេខចុងក្រោយ មិនមែនសរុបប្រចាំសប្តាហ៍ទេ។ |
| Number of schools you're currently running. | ចំនួនសាលាដែលអ្នកកំពុងដំណើរការ។ |
| Staff serving in this ministry right now. | បុគ្គលិកដែលកំពុងបម្រើក្នុងក្រសួងបម្រើនេះពេលនេះ។ |
| Students currently enrolled — enter the latest count. | សិស្សដែលកំពុងចុះឈ្មោះរៀន — បញ្ចូលចំនួនចុងក្រោយ។ |
| Students whose fees/costs you help cover. | សិស្សដែលអ្នកជួយបង់ថ្លៃសិក្សា/ថ្លៃចំណាយ។ |
| Students you provide food and/or housing for. | សិស្សដែលអ្នកផ្តល់អាហារ និង/ឬកន្លែងស្នាក់នៅ។ |
| Students actively being discipled, not just attending. | សិស្សដែលកំពុងត្រូវបានបង្ហាត់បង្រៀនជាសិស្សព្រះគ្រីស្ទយ៉ាងសកម្ម មិនមែនគ្រាន់តែចូលរៀនទេ។ |
| People baptised this week. | មនុស្សដែលបានទទួលបុណ្យជ្រមុជទឹកនៅសប្តាហ៍នេះ។ |
| Total hours of prayer covered this week. | ម៉ោងអធិស្ឋានសរុបដែលបានបំពេញនៅសប្តាហ៍នេះ។ |
| Prayer meetings you held this week. | ការប្រជុំអធិស្ឋានដែលអ្នកបានធ្វើនៅសប្តាហ៍នេះ។ |
| How many ministries you specifically prayed over. | ចំនួនក្រសួងបម្រើដែលអ្នកបានអធិស្ឋានឱ្យជាពិសេស។ |
| Answered-prayer stories reported this week. | រឿងចម្លើយនៃការអធិស្ឋាន ដែលបានរាយការណ៍នៅសប្តាហ៍នេះ។ |
| Your own honest 1–10 sense of how the week went. | ការវាយតម្លៃដោយស្មោះត្រង់របស់អ្នក ១–១០ អំពីរបៀបដែលសប្តាហ៍នេះបានកន្លងទៅ។ |
| Training sessions or league fixtures you ran. | វគ្គហ្វឹកហាត់ ឬការប្រកួតលីគដែលអ្នកបានដំណើរការ។ |
| Games played this week. | ការប្រកួតដែលបានលេងនៅសប្តាហ៍នេះ។ |
| Games won this week. | ការប្រកួតដែលបានឈ្នះនៅសប្តាហ៍នេះ។ |
| Young people who took part this week. | យុវជនដែលបានចូលរួមនៅសប្តាហ៍នេះ។ |
| Active coaches right now — latest count. | គ្រូបង្វឹកសកម្មពេលនេះ — ចំនួនចុងក្រោយ។ |
| People you're developing into coaches. | មនុស្សដែលអ្នកកំពុងអភិវឌ្ឍឱ្យក្លាយជាគ្រូបង្វឹក។ |
| Players you're intentionally discipling. | អ្នកលេងដែលអ្នកកំពុងបង្ហាត់បង្រៀនជាសិស្សព្រះគ្រីស្ទដោយចេតនា។ |
| Number of Instagram pages/accounts you run — latest count. | ចំនួនទំព័រ/គណនី Instagram ដែលអ្នកគ្រប់គ្រង — ចំនួនចុងក្រោយ។ |
| Total Instagram followers — latest count. | អ្នកតាមដាន Instagram សរុប — ចំនួនចុងក្រោយ។ |
| Total Instagram views this week. | ការមើលសរុបនៅលើ Instagram នៅសប្តាហ៍នេះ។ |
| Posts published on Instagram this week. | ការបង្ហោះនៅលើ Instagram នៅសប្តាហ៍នេះ។ |
| Comments you replied to on Instagram. | មតិយោបល់ដែលអ្នកបានឆ្លើយតបនៅលើ Instagram។ |
| Messages you replied to on Instagram. | សារដែលអ្នកបានឆ្លើយតបនៅលើ Instagram។ |
| Potential students who came in via Instagram. | សិស្សដែលមានសក្តានុពល ដែលបានមកតាមរយៈ Instagram។ |
| Number of Facebook pages/accounts you run — latest count. | ចំនួនទំព័រ/គណនី Facebook ដែលអ្នកគ្រប់គ្រង — ចំនួនចុងក្រោយ។ |
| Total Facebook followers — latest count. | អ្នកតាមដាន Facebook សរុប — ចំនួនចុងក្រោយ។ |
| Total Facebook views this week. | ការមើលសរុបនៅលើ Facebook នៅសប្តាហ៍នេះ។ |
| Posts published on Facebook this week. | ការបង្ហោះនៅលើ Facebook នៅសប្តាហ៍នេះ។ |
| Comments you replied to on Facebook. | មតិយោបល់ដែលអ្នកបានឆ្លើយតបនៅលើ Facebook។ |
| Messages you replied to on Facebook. | សារដែលអ្នកបានឆ្លើយតបនៅលើ Facebook។ |
| Potential students who came in via Facebook. | សិស្សដែលមានសក្តានុពល ដែលបានមកតាមរយៈ Facebook។ |
| Number of YouTube pages/accounts you run — latest count. | ចំនួនទំព័រ/គណនី YouTube ដែលអ្នកគ្រប់គ្រង — ចំនួនចុងក្រោយ។ |
| Total YouTube followers — latest count. | អ្នកតាមដាន YouTube សរុប — ចំនួនចុងក្រោយ។ |
| Total YouTube views this week. | ការមើលសរុបនៅលើ YouTube នៅសប្តាហ៍នេះ។ |
| Posts published on YouTube this week. | ការបង្ហោះនៅលើ YouTube នៅសប្តាហ៍នេះ។ |
| Comments you replied to on YouTube. | មតិយោបល់ដែលអ្នកបានឆ្លើយតបនៅលើ YouTube។ |
| Messages you replied to on YouTube. | សារដែលអ្នកបានឆ្លើយតបនៅលើ YouTube។ |
| Potential students who came in via YouTube. | សិស្សដែលមានសក្តានុពល ដែលបានមកតាមរយៈ YouTube។ |
| Number of TikTok pages/accounts you run — latest count. | ចំនួនទំព័រ/គណនី TikTok ដែលអ្នកគ្រប់គ្រង — ចំនួនចុងក្រោយ។ |
| Total TikTok followers — latest count. | អ្នកតាមដាន TikTok សរុប — ចំនួនចុងក្រោយ។ |
| Total TikTok views this week. | ការមើលសរុបនៅលើ TikTok នៅសប្តាហ៍នេះ។ |
| Posts published on TikTok this week. | ការបង្ហោះនៅលើ TikTok នៅសប្តាហ៍នេះ។ |
| Comments you replied to on TikTok. | មតិយោបល់ដែលអ្នកបានឆ្លើយតបនៅលើ TikTok។ |
| Messages you replied to on TikTok. | សារដែលអ្នកបានឆ្លើយតបនៅលើ TikTok។ |
| Potential students who came in via TikTok. | សិស្សដែលមានសក្តានុពល ដែលបានមកតាមរយៈ TikTok។ |
| Days you ran classes this week. | ចំនួនថ្ងៃដែលអ្នកបានបង្រៀននៅសប្តាហ៍នេះ។ |
| Youth currently enrolled — latest count. | យុវជនដែលកំពុងចុះឈ្មោះរៀន — ចំនួនចុងក្រោយ។ |
| Tests or assessments given this week. | ការប្រឡង ឬការវាយតម្លៃដែលបានធ្វើនៅសប្តាហ៍នេះ។ |
| Percent of students who passed — enter 0–100. | ភាគរយនៃសិស្សដែលបានជាប់ — បញ្ចូល ០–១០០។ |
| Celebrations or events held this week. | ការអបអរ ឬកម្មវិធីដែលបានធ្វើនៅសប្តាហ៍នេះ។ |
| Competitions run this week. | ការប្រកួតប្រជែងដែលបានដំណើរការនៅសប្តាហ៍នេះ។ |
| Students you brought along to a local church. | សិស្សដែលអ្នកបាននាំទៅក្រុមជំនុំមូលដ្ឋាន។ |
| Worship nights you hosted this week. | រាត្រីថ្វាយបង្គំដែលអ្នកបានរៀបចំនៅសប្តាហ៍នេះ។ |
| Total people at your worship gatherings. | ចំនួនមនុស្សសរុបនៅក្នុងការជួបជុំថ្វាយបង្គំរបស់អ្នក។ |
| Musicians you're currently training. | តន្ត្រីករដែលអ្នកកំពុងបង្ហាត់បង្រៀន។ |
| Total practice hours this week. | ម៉ោងហាត់សមសរុបនៅសប្តាហ៍នេះ។ |
| New songs written this week. | បទចម្រៀងថ្មីដែលបានសរសេរនៅសប្តាហ៍នេះ។ |
| Songs recorded this week. | បទចម្រៀងដែលបានថតនៅសប្តាហ៍នេះ។ |
| Songs posted to social media this week. | បទចម្រៀងដែលបានបង្ហោះលើបណ្តាញសង្គមនៅសប្តាហ៍នេះ។ |
| Students who graduated this week/period. | សិស្សដែលបានបញ្ចប់ការសិក្សានៅសប្តាហ៍/រយៈពេលនេះ។ |
| Average student feedback on teaching, 1–10. | មតិយោបល់ជាមធ្យមរបស់សិស្សលើការបង្រៀន ១–១០។ |
| Students you're concerned about and watching closely. | សិស្សដែលអ្នកព្រួយបារម្ភ ហើយកំពុងតាមដានយ៉ាងដិតដល់។ |
| Students who could become future staff. | សិស្សដែលអាចក្លាយជាបុគ្គលិកនៅពេលអនាគត។ |
| Distinct places your outreach reached. | ទីកន្លែងផ្សេងៗគ្នាដែលការចេញផ្សព្វផ្សាយរបស់អ្នកបានទៅដល់។ |
| Total people who heard a gospel message this week. | ចំនួនមនុស្សសរុបដែលបានឮសារដំណឹងល្អនៅសប្តាហ៍នេះ។ |
| Testimonies of physical or emotional healing you saw or heard reported. | ទីបន្ទាល់នៃការប្រោសឱ្យជាផ្លូវកាយ ឬផ្លូវចិត្ត ដែលអ្នកបានឃើញ ឬបានឮរាយការណ៍។ |
| For the next school intake: intl students contacted. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ សិស្សអន្តរជាតិដែលបានទាក់ទង។ |
| For the next school intake: local students contacted. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ សិស្សក្នុងស្រុកដែលបានទាក់ទង។ |
| For the next school intake: intl students applied. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ សិស្សអន្តរជាតិដែលបានដាក់ពាក្យ។ |
| For the next school intake: local students applied. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ សិស្សក្នុងស្រុកដែលបានដាក់ពាក្យ។ |
| For the next school intake: intl students enrolled. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ សិស្សអន្តរជាតិដែលបានចុះឈ្មោះ។ |
| For the next school intake: local students enrolled. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ សិស្សក្នុងស្រុកដែលបានចុះឈ្មោះ។ |
| For the next school intake: teachers confirmed. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ គ្រូដែលបានបញ្ជាក់។ |
| For the next school intake: staff confirmed. | សម្រាប់ការចូលរៀនសាលាបន្ទាប់៖ បុគ្គលិកដែលបានបញ្ជាក់។ |
| New social pages/channels launched. | ទំព័រ/ឆានែលសង្គមថ្មីដែលបានបើកដំណើរការ។ |
| New followers gained this week across pages. | អ្នកតាមដានថ្មីដែលទទួលបាននៅសប្តាហ៍នេះ គ្រប់ទំព័រ។ |
| Views on your top-performing video — latest number. | ការមើលលើវីដេអូដែលល្អបំផុតរបស់អ្នក — លេខចុងក្រោយ។ |
| Total filming hours this week. | ម៉ោងថតសរុបនៅសប្តាហ៍នេះ។ |
| Pieces of content published this week. | មាតិកាដែលបានបង្ហោះនៅសប្តាហ៍នេះ។ |
| One-to-one counseling sessions completed. | វគ្គប្រឹក្សាយោបល់ម្នាក់ទល់ម្នាក់ដែលបានបញ្ចប់។ |
| Your read of students' average English level, 1–10. | ការវាយតម្លៃរបស់អ្នកលើកម្រិតភាសាអង់គ្លេសជាមធ្យមរបស់សិស្ស ១–១០។ |
| Your read of students' average Khmer level, 1–10. | ការវាយតម្លៃរបស់អ្នកលើកម្រិតភាសាខ្មែរជាមធ្យមរបស់សិស្ស ១–១០។ |
| Outreach/evangelism events held this week. | កម្មវិធីចេញផ្សព្វផ្សាយ/ប្រកាសដំណឹងល្អដែលបានធ្វើនៅសប្តាហ៍នេះ។ |
| Faith conversations you started this week. | ការសន្ទនាអំពីជំនឿដែលអ្នកបានចាប់ផ្តើមនៅសប្តាហ៍នេះ។ |
| People who heard the gospel through your work. | មនុស្សដែលបានឮដំណឹងល្អតាមរយៈការងាររបស់អ្នក។ |
| People you helped plug into a local church (not just a one-time visit). | មនុស្សដែលអ្នកបានជួយឱ្យចូលរួមក្នុងក្រុមជំនុំមូលដ្ឋាន (មិនមែនគ្រាន់តែទៅលេងម្តងទេ)។ |
| Partner churches you actively supported. | ក្រុមជំនុំដៃគូដែលអ្នកបានគាំទ្រយ៉ាងសកម្ម។ |
| Churches you are currently leading. | ក្រុមជំនុំដែលអ្នកកំពុងដឹកនាំ។ |
| Total attendance across the churches you lead. | ចំនួនអ្នកចូលរួមសរុបនៅគ្រប់ក្រុមជំនុំដែលអ្នកដឹកនាំ។ |
| New churches started this week/period. | ក្រុមជំនុំថ្មីដែលបានចាប់ផ្តើមនៅសប្តាហ៍/រយៈពេលនេះ។ |
| Hours of training you delivered this week. | ម៉ោងបណ្តុះបណ្តាលដែលអ្នកបានផ្តល់នៅសប្តាហ៍នេះ។ |
| People currently in your training track. | មនុស្សដែលកំពុងស្ថិតក្នុងកម្មវិធីបណ្តុះបណ្តាលរបស់អ្នក។ |
| Reports you submitted on time this week. | របាយការណ៍ដែលអ្នកបានដាក់ជូនទាន់ពេលនៅសប្តាហ៍នេះ។ |
| How clear and healthy the finance system feels, 1–10. | ប្រព័ន្ធហិរញ្ញវត្ថុមានភាពច្បាស់លាស់ និងល្អប៉ុណ្ណា ១–១០។ |
| Total funds brought together/reconciled — latest number. | មូលនិធិសរុបដែលបានប្រមូលផ្តុំ/ផ្ទៀងផ្ទាត់ — លេខចុងក្រោយ។ |
| Cash reserve on hand — latest number. | ប្រាក់បម្រុងដែលមាននៅក្នុងដៃ — លេខចុងក្រោយ។ |
| Guest beds prepared this week. | គ្រែភ្ញៀវដែលបានរៀបចំនៅសប្តាហ៍នេះ។ |
| Guests you welcomed and settled in. | ភ្ញៀវដែលអ្នកបានស្វាគមន៍ និងជួយឱ្យតាំងលំនៅ។ |
| Welcome gifts handed out. | កាដូស្វាគមន៍ដែលបានចែក។ |
| How welcoming the base felt this week, 1–10. | មូលដ្ឋានមានអារម្មណ៍ស្វាគមន៍ប៉ុណ្ណានៅសប្តាហ៍នេះ ១–១០។ |
| Hospitality improvement projects underway. | គម្រោងកែលម្អបដិសណ្ឋារកិច្ចដែលកំពុងដំណើរការ។ |
| Technical projects finished this week. | គម្រោងបច្ចេកទេសដែលបានបញ្ចប់នៅសប្តាហ៍នេះ។ |
| Technical projects currently underway. | គម្រោងបច្ចេកទេសដែលកំពុងដំណើរការ។ |
| Overall condition/upkeep of the base, 1–10. | ស្ថានភាព/ការថែទាំទូទៅរបស់មូលដ្ឋាន ១–១០។ |
| People you cooked for this week. | មនុស្សដែលអ្នកបានចម្អិនឱ្យនៅសប្តាហ៍នេះ។ |
| Breakfasts served this week. | អាហារពេលព្រឹកដែលបានបម្រើនៅសប្តាហ៍នេះ។ |
| Lunches served this week. | អាហារថ្ងៃត្រង់ដែលបានបម្រើនៅសប្តាហ៍នេះ។ |
| Dinners served this week. | អាហារពេលល្ងាចដែលបានបម្រើនៅសប្តាហ៍នេះ។ |
| New dishes you introduced this week. | មុខម្ហូបថ្មីដែលអ្នកបានណែនាំនៅសប្តាហ៍នេះ។ |
| How the food tasted, 1–10. | រសជាតិអាហារ ១–១០។ |
| How reliably meals were on time, 1–10. | អាហាររួចរាល់ទាន់ពេលបានទៀងទាត់ប៉ុណ្ណា ១–១០។ |
| How well food stayed on budget, 1–10. | អាហារនៅក្នុងថវិកាបានល្អប៉ុណ្ណា ១–១០។ |
| One-to-one discipleship/support meetings you held with your leaders. | ការជួបបង្ហាត់បង្រៀន/គាំទ្រម្នាក់ទល់ម្នាក់ ដែលអ្នកបានធ្វើជាមួយអ្នកដឹកនាំរបស់អ្នក។ |
| Meaningful connections made with partners/supporters. | ទំនាក់ទំនងដែលមានអត្ថន័យ ដែលបានបង្កើតជាមួយដៃគូ/អ្នកគាំទ្រ។ |
| Times you preached or shared at a church. | ចំនួនដងដែលអ្នកបានអធិប្បាយ ឬចែកចាយនៅក្រុមជំនុំ។ |
| Times you spoke at a YWAM base. | ចំនួនដងដែលអ្នកបាននិយាយនៅមូលដ្ឋាន YWAM។ |
| Your own hours spent sharing the gospel this week. | ម៉ោងផ្ទាល់ខ្លួនរបស់អ្នកក្នុងការចែកចាយដំណឹងល្អនៅសប្តាហ៍នេះ។ |
| Department meetings you led this week. | ការប្រជុំផ្នែកដែលអ្នកបានដឹកនាំនៅសប្តាហ៍នេះ។ |
| Teachings/lessons you prepared this week. | ការបង្រៀន/មេរៀនដែលអ្នកបានរៀបចំនៅសប្តាហ៍នេះ។ |
| Meetings you led this week. | ការប្រជុំដែលអ្នកបានដឹកនាំនៅសប្តាហ៍នេះ។ |
| Staff under your care right now — latest count. | បុគ្គលិកក្រោមការថែទាំរបស់អ្នកពេលនេះ — ចំនួនចុងក្រោយ។ |
| Total outstanding support/debt your staff are carrying. | ការគាំទ្រ/បំណុលសរុបដែលបុគ្គលិករបស់អ្នកកំពុងជំពាក់។ |
| Money raised this week toward your department. | ប្រាក់ដែលបានរៃអង្គាសនៅសប្តាហ៍នេះសម្រាប់ផ្នែករបស់អ្នក។ |
| How clear and alive the base vision feels, 1–10. | ចក្ខុវិស័យមូលដ្ឋានមានភាពច្បាស់លាស់ និងរស់រវើកប៉ុណ្ណា ១–១០។ |
| How well communication is flowing, 1–10. | ការប្រាស្រ័យទាក់ទងកំពុងដំណើរការល្អប៉ុណ្ណា ១–១០។ |
| Health of your partner relationships, 1–10. | សុខភាពនៃទំនាក់ទំនងជាមួយដៃគូរបស់អ្នក ១–១០។ |
| New bases you're planning/preparing to plant. | មូលដ្ឋានថ្មីដែលអ្នកកំពុងគ្រោង/ត្រៀមដើម្បីបង្កើត។ |
| Overall base finances — latest number. | ហិរញ្ញវត្ថុមូលដ្ឋានទាំងមូល — លេខចុងក្រោយ។ |
