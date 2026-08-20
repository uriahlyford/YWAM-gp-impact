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
