# Redesigning GP Impact around four things

Uriah's brief, in his words: build the app around

1. **the 3 weekly goals**
2. **the health survey**
3. **the team page with mentees and all that**
4. **the KPIs they need to track to get regular updates information for
   government and donor reports**

This document is the plan for that. It is a proposal, not a description of what
is currently on the site — where it says "moves", nothing has moved yet.

## What is wrong today

The staff app has four tabs: **Base · My Database · Team · Health**. Three of
them are one thing each. The second is a junk drawer holding fourteen:

> hero · notifications · quick-jump bar · phase banner · Weekly Goals · Habit
> Tracker · My Ministry · OKRs · Annual Goals · Mentorship · week summary · week
> stats · Leave · Profile & settings

The quick-jump bar is the tell. It exists so a person can skip nine sections to
reach the tenth — which is a tab bar, drawn a second time, halfway down a
screen. When a screen needs navigation of its own, it is already several
screens.

So the four pillars are not new work so much as an admission of what the app is
already trying to be. Three of the four are in there; two of them are buried on
a shared scroll, and the fourth barely exists.

## The proposal: five tabs, four of them a pillar

| Tab | Pillar | What it is |
|---|---|---|
| **Base** | — | The campus at a glance. Where login lands, unchanged. |
| **My Week** | 1 · the 3 goals | The three goals first, then today's habits, then the longer horizons. |
| **Health** | 2 · the survey | The weekly check-in, its history, and every health tally. |
| **Team** | 3 · mentees | The directory, plus your mentor, your mentees, and one-on-ones. |
| **Reports** | 4 · government + donors | Your ministry's numbers, and the documents built out of them. |

Base stays a tab because Uriah deliberately made it the landing screen: the
first thing after login is your own campus's numbers. Nothing about the four
pillars argues with that — they are about what a person *does* in the app, and
Base is about what the base *is*.

Five tabs at 320px is the one real risk in this table. `tests/check-nav.mjs`
exists for exactly that and has to stay green in Khmer, where "របាយការណ៍"
(report) is the longest label in the app.

## Where every section goes

| Today | Proposed home |
|---|---|
| Base tab | **Base** — unchanged |
| Weekly Goals | **My Week** — the first thing on the screen |
| Habit Tracker | **My Week** — under the goals, where the day's work is |
| OKRs, Annual Goals | **My Week** — a "longer than a week" block, collapsed |
| Leave Request | **My Week** — bottom card, unchanged |
| Weekly check-in + history | **Health** — unchanged |
| week summary, week stats | **Health** — every figure in them is a health tally, and the code already says so in a comment |
| Team directory | **Team** — unchanged |
| Mentorship card, mentor screen, 1-on-1 requests | **Team** — mentees are people, and this is the people tab |
| My Ministry (KPI logging) | **Reports** |
| Ministries you oversee | **Reports** |
| Profile & settings | the header gear (already there) |
| notification bell | the header bell (already there) |
| quick-jump bar | **deleted** — nothing left to jump past |

Nothing in that table is a behaviour change. It is the same code, called from a
different screen, which is what makes it a safe first commit: `audit-allviews`
and `check-nav` can prove it.

## Pillar 4 is the one that needs building

Pillars 1–3 mostly need moving. Pillar 4 needs a feature, because right now the
app **collects** report numbers and has no way to **produce** a report. Somebody
still reads figures off a phone and retypes them into a document.

Three parts, in order of what blocks what:

1. **Each ministry's own KPI list.** Not every ministry tracks the same things,
   so the list has to be editable per ministry rather than fixed in
   `taxonomy.js`. This is open as PR #21 and everything else waits on it.
2. **Who still owes numbers.** A quarterly report is impossible if three
   ministries have blank weeks and nobody knows which three until the deadline.
   A completeness view — period, ministry, missing weeks — is what makes the rest
   usable, and it is small.
3. **The documents themselves.** Pick a period, get the government filing and a
   donor update, generated from the records.

**Part 3 is already written.** The branch `claude/charming-goldberg-msv289`
carries a full Ministry report — `public/report.js`, `public/programs.js`, a
period model where every row stores a quarter and a semester is just two of them
added up, and 1,253 lines of tests (`test-report.mjs`, `test-programs.mjs`,
`test-programs-ui.mjs`). It was parked, and `main` has moved
twenty-three commits past it. It needs bringing up to date, not writing.

Its design decisions are worth keeping, and are the sort that are expensive to
rediscover:

- Quarters are stored, semesters are derived. Storing six-month rows would make
  quarters unreachable forever, because nothing in a six-month row says which
  half of it something happened in.
- A record can only be added while a single quarter is selected — saving from a
  semester view would mean guessing when it happened, and a guess there is a
  wrong number in a government filing.
- "Year to date" means the year up to the **end of the period being reported**,
  not whatever is in the data today. Otherwise regenerating the Q1 report in
  October restates it with figures from quarters that had not happened when it
  was written. A report has to keep saying what it said.

## Sequence

| Phase | What | Risk |
|---|---|---|
| 0 | Carry-forward across the year boundary (done) | small, shipped |
| 1 | Land the four open PRs (#18–#21) — they all touch `teams.html` | none, just order |
| 2 | The nav shell: five tabs, sections relocated, no behaviour change | low; `check-nav` + `audit-allviews` prove it |
| 3 | My Week: goals promoted, habits under them, horizons collapsed | low |
| 4 | Bring the report branch up to `main` and land it as the Reports tab | high — it is 5,000 lines against a moved base |
| 5 | Who-still-owes-numbers, and the donor format | medium |

Phase 2 is deliberately after phase 1. Moving sections around `teams.html` while
four pull requests are open in the same file would conflict with every one of
them, and resolving four conflicts in a 5,000-line file is how strings and
sections get silently dropped — it has happened once on this repo already.

## What this does not change

- **The privacy model.** Loneliness, porn and debt stay visible only to the
  person and their one approved mentor; leadership sees aggregates. Moving
  Mentorship onto the Team tab moves a card, not a permission.
- **Derive, don't re-enter.** Weekly health still comes from the daily logs;
  the weekly KPI figure still comes from the days when days exist.
- **One request per page open.** `getMyBoot` already returns everything the
  staff page needs, and `audit-load.mjs` asserts it. A fifth tab must not become
  a fifth round trip.
