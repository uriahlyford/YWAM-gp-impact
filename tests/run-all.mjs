/* Runs the whole suite and prints one line per file.

   Server tests import the real netlify/functions/api.js against a fake
   @netlify/blobs, so they are fast and need nothing installed. Browser tests need
   playwright and a Chromium; they are skipped with a message if it is missing,
   rather than failing the run for someone who only touched the API.

   Usage:  node tests/run-all.mjs           all of it
           node tests/run-all.mjs server    just the fast ones
*/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const SERVER = [
  'test-firstrun.mjs',   // empty / junk / ragged store, malformed requests
  'test-boot.mjs',       // getMyBoot: one call per page open
  'test-week-auth.mjs',  // weekly health: anonymity + mentor visibility
  'test-okr-auth.mjs',   // OKR writes stay inside your campus + department
  'test-year.mjs',       // weeks belong to a year; writing numbers needs a name
  'test-read-your-writes.mjs', // a save answers with what it saved, not a stale read
  'test-goals.mjs',      // weekly goals are percentages, and old ticked rows still read
  'test-smart-goals.mjs', // Annual Goals (SMART): year+category isolation, ownership
  'test-one-on-one.mjs', // 1-on-1 requests: mentor/mentee pairing, recipient-only response
  'test-admin.mjs',      // Campus Leadership sign-ups need approval; isAdmin gates account management
  'test-admin-race.mjs', // two admin writes to the same staff record at once don't let one silently undo the other
  'test-ministry-leader.mjs', // ministry leaders (admin-assigned) own the metric list; personal numbers; renaming a custom metric moves its history
  'test-leadership-rename.mjs', // Base Leadership → Campus Leadership (and its director row → Campus Director): old-name rows read back new, old-name accounts keep every right
  'test-team-trips.mjs', // Outreach Teams: one record per team (seeded from the Lovable hub), campus-bound add/edit/delete, teams become weekly rows in the week they leave and replace hand-logged ones
  'test-hospitality.mjs', // SR Hospitality: Hospitality ministry + admins only; buildings, rooms, beds; bookings cleaned, no bed in two bookings a night, maintenance beds out; upcoming Teams Database teams are bed requests until booked; bed board moves / swaps / placing / taking off
  'test-duty.mjs', // weekly schedules: Culinary makes the cooking schedule, Hospitality the morning chores (and admins); new weeks from the template then the week before; drafts hidden until published; names on offer (campus staff, other staff, teams here, guests, typed before); a team sees them in the portal once arrived
  'test-holidays.mjs', // national holidays aren't leave: Khmer New Year and Christmas week (Mon–Fri of their week, every year) and dated Pchum Ben, counted out of every request on file; admin keeps the dated list; schedules leave out staff on leave all week
  'test-lead-board.mjs', // the leadership meeting board: Campus Leadership + admins only, cards (agenda item / project, owner, due, OKR link) cleaned, Done stamped and cleared, campuses apart
  'test-structure.mjs', // quarterly org-structure snapshots: admin-only save built on the server from active staff, read exact / latest-earlier (copied) / none, per campus, replace on re-save
  'test-admin-leave.mjs', // Admin → Leave: only an admin reads everyone's requests (who, campus, dept, mentor, reason) and year totals; admin decides waiting/noted ones, not decided ones
  'test-staff-ids.mjs', // every staff record gets its own id on read: a missing one is minted, a duplicate re-minted for the later row, the repaired list written back once; repaired accounts work by their new id
  'test-hr.mjs', // Human Resources: only admin/hr may read or write; contracts (signed month + years, renewals as rows), attachments as their own blobs, old-CRM pre-fill, archive = deactivate, unarchive
  'test-hr-candidates.mjs', // HR → Candidates: the gate, a candidate is a name + type + stage, stage moves are logged, notes append, follow-ups due within a week count on boot, archive/unarchive
  'test-portal.mjs',     // YWAM GP Portal: applicant sign-up, applicants closed out of every staff handler and roster, own application only, portal access flags, timeline follows the CRM stage
  'test-ministry-oversight.mjs', // department overseers can log for ministries they oversee, nobody else can
  'test-ministry-metrics.mjs', // a ministry's own staff (or its overseer, or an admin) can edit what it tracks
  'test-rollups.mjs',    // the roll-up maths
  'test-jobfocus.mjs',   // jobfocus.js and help.html agree
  'test-stafftype.mjs',  // kind of staff + home country: stored, carried, counted
  'test-personality.mjs', // personality types: scoring, and who can see a type, an avatar or a season
  'test-strengths.mjs', // CliftonStrengths as recorded: validation, and who can see a Top 5
  'test-gpstrengths.mjs', // the free GP Strengths test: content, fair pairs, server scoring, who sees what
  'test-staff-email.mjs', // one profile per email; adminMergeStaff cleans up a real duplicate
  'test-overscroll-behavior.mjs', // none of the three pages' html/body may go back to overscroll-behavior:none (confirmed live: it disabled scrolling entirely on real desktop Chrome)
];

const BROWSER = [
  'test-pull-drill.mjs',    // the pull gesture on both pages, and which figures open
  'test-touch-scroll.mjs',  // a swipe over a slider or the chip strip scrolls the page, and answers nothing
  'test-number-entry.mjs',  // typing into a number box replaces what is in it, and no box starts at a 0 nobody typed
  'test-wheel-scroll.mjs',  // a trackpad's wheel events still scroll the page past the quick-jump strip
  'test-habit-config.mjs',  // a habit list the server refused never stays on the grid
  'test-khmer.mjs',         // Khmer reaches the screen, and does not overflow when it does
  'test-theme.mjs',         // dark mode, and a WCAG contrast audit of every screen
  'test-splash.mjs',        // launch shows the splash, never the dashboard; one shared block
  'test-frontdoor.mjs',     // gate -> guest -> signed in -> staff page, end to end
  'test-chrome.mjs',        // no dashboard flash, boot coin never hollow, safe-area insets
  'test-storage.mjs',       // language survives a reload; storage blocked
  'test-degraded.mjs',      // a missing optional script must not kill a page
  'test-base.mjs',          // the Base tab and the health form
  'test-admin-edit.mjs',    // editing a staff record in Admin keeps what you typed across an unrelated re-render
  'test-goals-edit.mjs',    // a weekly goal's wording can be edited in place, without losing its progress or KPI link
  'test-offline-queue.mjs', // a bad connection queues Weekly Goals/health check-in saves instead of losing them, and replays them once back online
  'test-ministry-redesign.mjs', // My Ministry: Numbers/OKRs tabs, dashboard tiles, the logged-weeks strip, one button unfolds the form, personal numbers, leader-only editor
  'test-org-chart.mjs', // Team → Structure: the campus as levels — Campus Leadership, a connector, one box per department with its ministries — built from profiles, nothing to edit or fetch
  'test-outreach-teams.mjs', // Teams Database: month/quarter/year dashboard over finished teams, one form to add/edit/delete a team; My Ministry picker + banner, period toggle, personal numbers off the page
  'test-hospitality-page.mjs', // SR Hospitality page: menu + My Ministry door for Hospitality and admins only, tonight tiles, week/month/quarter bars, team requests fit / short, Book beds + Pick beds for me, bed clashes, rooms; the 14-day bed calendar; the bed board's tap-to-move, swap and drag; phone and desktop
  'test-duty-page.mjs', // weekly schedules page: My Home card with your duties, the menu, the table (scrolls in its card), Share as image (a PNG), Culinary's draft from last week + name picker + rows + Publish, Hospitality's chores place by place; phone and desktop
  'test-holidays-page.mjs', // national holidays on the leave page (listed, left out of a new request's count, with why) and in Admin → Leave (dated ones edited and saved)
  'test-lead-board-page.mjs', // Campus Leadership on My Ministry: no weekly numbers, OKRs as the dashboard, the Monday meeting board (standing items, focus areas, cards with OKR links, arrows / drag, editing the board); phone and desktop
  'test-admin-select.mjs', // Admin: home menu → Accounts (campus chips, search) → a row opens that person's page → Back keeps the search and the narrowed list
  'test-admin-mentors.mjs', // Admin → Mentors: one card per mentor with their people (Waiting when not yet accepted), everyone with no mentor, the home card's count, a person's header names their mentor
  'test-admin-leave-page.mjs', // Admin → Leave page: campus chips + year, tiles, waiting with Approve/Decline, away/coming up, days used vs cap, earlier folded, names open the person
  'test-health-export.mjs',  // Base health → Export as slides: the deck, its figures against the page, PNG, close
  'test-health-quarters.mjs', // Base health → Quarter by quarter: columns per quarter with ▲/▼, per-question minis, Siem Reap parity, the deck's By-quarter slides
  'test-portal-page.mjs',   // portal.html: front door + deep link, sign-up, the dashboard timeline, language toggle, desktop layout, the staff view and its gate
  'test-admin-portal-access.mjs', // Admin → Portal access: the card, campus chips, the two ticks call adminUpdateStaff
  'test-ministry-load-error.mjs', // My Ministry / Teams Database when the on-demand load crashes: the error card with the server's words and Try again, one request not a storm
  'test-hr-page.mjs', // the HR page: menu item + badge, home tiles and renewals due, status chips, a person's contracts, add a renewal, attach a file, old-CRM pre-fill, archive
  'test-hr-candidates-page.mjs', // the Candidates tab and the bell: reminders open HR, tiles + follow-ups due, type/stage chips + search, add, move stage, next step, note, archive
  'test-habit-taps.mjs',    // habit tiles stay responsive on a slow or dead connection
  'test-personality-ui.mjs', // the test, the type page and the directory avatars, driven for real
  'test-strengths-ui.mjs',  // adding a Gallup Top 5, matches to GP strengths, both compared, 320px, Khmer
  'test-gpstrengths-ui.mjs',  // taking the free test, results, the team strengths map, 320px
  'test-bottom-bar.mjs',  // the bottom bar steps aside for the phone keyboard, and comes back
  'test-habit-stale.mjs',   // a tap survives a store that reads older than its own writes
  'test-ministry-kpis.mjs', // the ministry's whole log form on My week: which card, and carry-forward
  'test-mentor-health.mjs', // a mentor sees a mentee by name
  'test-mentor-weeks.mjs',  // a mentor can look back at any week: picker, check-in, habits, goals, logs
  'test-okr-easy.mjs',      // OKRs the SugarOKR way: all on one page, a slider or count per key result, headings, Paste OKRs
  'test-notif-bell-actions.mjs', // an action button drawn in the bell drawer actually works, not just the inline card
  'test-okr-admin-view.mjs', // admin sees every department's OKRs, collapsed, read-only; non-admin sees none of it
  'test-ministry-browse.mjs', // My Ministry's "jump to any ministry" picker: admin authorization, and Save Week uses the browsed ministry's own dept
  'test-personal-metrics-cadence.mjs', // Campus Leadership personal figures move to the weekly card; Total Staff/Staff Debt get their own Department Headcount section
  'test-metric-cadence.mjs', // admin-only monthly/quarterly cadence per metric; the monthly/quarterly section writes to its own anchor week
  'test-metric-okr-feeds.mjs', // a metric's own row shows which OKR(s) it feeds, scoped to its own campus
  'test-pull-jitter.mjs', // a scroll-down swipe's initial settling jitter must not get mistaken for a pull-to-refresh and cancel native scrolling
  'audit-load.mjs',         // one function invocation per page open
  'audit-paint.mjs',        // first paint even with the font CDN hanging
  'audit-allviews.mjs',     // every screen, no console errors
  'check-nav.mjs',          // the bottom tabs do not wrap at 320px
];

/* Pre-flight: no test may hardcode one machine's browser.
   Five files did exactly that — executablePath:'/opt/pw-browsers/chromium' — and
   passed for months here while crashing instantly anywhere else, including CI and
   anyone else's clone. The browser comes from env.mjs (CHROMIUM), which honours
   GP_CHROMIUM first. This is cheap and runs in both halves, because the only
   reason that bug survived is that nothing looked. */
{
  const bad = [];
  for (const f of fs.readdirSync(HERE)) {
    if (!f.endsWith('.mjs') || f === 'env.mjs' || f === 'run-all.mjs') continue;
    const src = fs.readFileSync(path.join(HERE, f), 'utf8');
    const m = src.match(/executablePath\s*:\s*['"][^'"]+['"]/);
    if (m) bad.push(f + '  ' + m[0]);
  }
  if (bad.length) {
    console.log('FAIL a test hardcodes a browser path instead of using CHROMIUM from env.mjs:');
    for (const b of bad) console.log('        ' + b);
    process.exit(1);
  }
}

const only = process.argv[2];
const files = only === 'server' ? SERVER : only === 'browser' ? BROWSER : SERVER.concat(BROWSER);

let haveBrowser = true;
try { await import('playwright'); } catch (e) { haveBrowser = false; }

const failed = [];
const skipped = [];
for (const f of files) {
  if (BROWSER.indexOf(f) > -1 && !haveBrowser) { skipped.push(f); continue; }
  const r = spawnSync(process.execPath, [path.join(HERE, f)], { encoding: 'utf8' });
  const out = String(r.stdout || '') + String(r.stderr || '');
  const lines = out.trim().split('\n').filter(function (l) { return l.trim(); });
  const last = lines.length ? lines[lines.length - 1].trim() : '(no output)';
  const bad = r.status !== 0 || /\bFAIL\b|\bERR\b|errors: [1-9]/.test(out);
  if (bad) failed.push(f);
  console.log((bad ? 'FAIL ' : 'ok   ') + f.padEnd(24) + last.slice(0, 90));
  if (bad) {
    for (const l of lines) if (/\bFAIL\b|\bERR\b/.test(l)) console.log('        ' + l.trim().slice(0, 140));
  }
}

if (skipped.length) {
  console.log('\nskipped (no playwright installed): ' + skipped.join(', '));
  console.log('  npm i -D playwright   # Chromium is found automatically, or set GP_CHROMIUM');
}
console.log('\n' + (files.length - failed.length - skipped.length) + ' passed, ' +
  failed.length + ' failed' + (skipped.length ? ', ' + skipped.length + ' skipped' : ''));
process.exit(failed.length ? 1 : 0);
