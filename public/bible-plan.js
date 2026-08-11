/*  Daily Bible reading plan — The Bible Recap (chronological).

    The Bible Recap follows the Blue Letter Bible chronological plan: 365 days
    through the whole Bible in the order events most likely happened.

    ── HOW TO FILL THIS IN ───────────────────────────────────────────────────
    BIBLE_PLAN.days is a plain array of 365 strings, day 1 first:

      days: [
        'Genesis 1-3',
        'Genesis 4-7',
        ...
      ]

    Grab the printable plan from thebiblerecap.com/start (or the Bible App /
    Dwell versions of the same plan) and paste the readings in order. The app
    reads days[n-1] for "day n", so the array order IS the plan — nothing else
    needs changing.

    Until it's filled in, the Bible habit still works as a plain daily tick and
    the reading card simply says the plan isn't loaded yet. Nothing breaks.

    Deliberately left empty rather than guessed at: these readings are followed
    daily by real people, so they need to come from the actual published plan,
    not from anyone's recollection of it.  */

var BIBLE_PLAN = {
  name: 'The Bible Recap',
  subtitle: 'Chronological · 365 days',
  source: 'thebiblerecap.com',
  days: []
};

/* Reading for a given 1-based day, or '' when the plan isn't loaded. */
function bibleReadingFor(day){
  var d = Number(day);
  if(!BIBLE_PLAN.days.length || !d || d < 1 || d > BIBLE_PLAN.days.length) return '';
  return BIBLE_PLAN.days[d - 1];
}
function biblePlanLoaded(){ return BIBLE_PLAN.days.length > 0; }
function biblePlanLength(){ return BIBLE_PLAN.days.length || 365; }
