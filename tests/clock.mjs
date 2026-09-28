/* One "now" for a test and the page it drives.

   Tests that build fixtures from today's date must compute them from the same
   moment the page sees, and in the app's own terms. The dashboards count
   quarters as 13-week blocks of the week number (rollup.js qOf), so on
   28 September — week 40 — "this quarter" is Q4 even though the month
   says Q3. Fixtures built from the month broke there.

   testNow()          the moment the test runs "at": GP_TEST_NOW (YYYY-MM-DD) if
                      set, else the real now. testNow('2026-08-12') pins a test
                      whose fixtures describe one fixed scenario.
   pinClock(p, now)   makes the page's Date read that moment. Time keeps moving
                      from there (shifted, not frozen), so timers, debounces and
                      "saved 2 seconds ago" behave normally. p is a Page or a
                      BrowserContext; call it before the first goto.
   weekOf / quarterOf the app's week number (isoWeekOf in teams.html) and its
                      0-based 13-week quarter (qOf in rollup.js).

   Check a date-sensitive test at the edges with, for example:
     GP_TEST_NOW=2026-09-28 node tests/test-outreach-teams.mjs   (first week of Q4)
     GP_TEST_NOW=2026-09-21 node tests/test-outreach-teams.mjs   (last week of Q3)  */
export function testNow(fixed) {
  const iso = fixed || process.env.GP_TEST_NOW;
  if (!iso) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('GP_TEST_NOW must be YYYY-MM-DD, got ' + iso);
  return new Date(iso + 'T10:00:00');
}
export async function pinClock(p, now) {
  await p.addInitScript((target) => {
    const Real = Date, offset = target - Real.now();
    function Shifted(...a) {
      if (!new.target) return new Real(Real.now() + offset).toString();
      return a.length ? new Real(...a) : new Real(Real.now() + offset);
    }
    Shifted.prototype = Real.prototype;
    Object.setPrototypeOf(Shifted, Real);
    Shifted.now = () => Real.now() + offset;
    Shifted.parse = Real.parse; Shifted.UTC = Real.UTC;
    window.Date = Shifted;
  }, now.getTime());
}
export function weekOf(d) {
  const y = d.getFullYear(), jan1 = new Date(y, 0, 1), monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1));
}
export function quarterOf(week) { return Math.min(3, Math.floor((week - 1) / 13)); }
