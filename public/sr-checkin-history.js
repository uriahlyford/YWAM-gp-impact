/* One-time historical import from a separate app ("YWAM SR Weekly Check In",
   a Lovable project) — Siem Reap only. Every submission there is anonymous,
   with no link to a person, so this is team-wide history and can never be
   folded into anyone's individual health score. Frozen at import time
   (2026-09-03): Jan-Feb were tallied by hand before the digital form existed;
   Mar 17 - Jul 14 2026 are real weekly submissions; the source stopped being
   used after that, so "latest" here means Jul 14, not today. */

var SR_CHECKIN_QUESTIONS = [
  { id: 'w1', en: 'Bible & daily quiet time' },
  { id: 'w2', en: 'Has a best friend on base' },
  { id: 'w3', en: 'Looked at porn this week', lowerBetter: true },
  { id: 'w4', en: 'Exercised 15+ min, 3 days' },
  { id: 'w5', en: 'Currently in debt to the base', lowerBetter: true },
  { id: 'w6', en: 'Fully honest in this report' },
  { id: 'm1', en: 'Called family this month' },
  { id: 'm2', en: 'Often felt lonely this month', lowerBetter: true },
  { id: 'm3', en: 'Sent a ministry update this month' },
  { id: 'm4', en: 'Had 2+ one-on-ones this month' }
];

/* Team-wide percentages for Jan/Feb 2026, before the digital form existed. */
var SR_CHECKIN_MANUAL_MONTHS = [
  { year: 2026, month: 1, pct: { w1: 72, w2: 78, w3: 6, w4: 27, w5: 27, w6: 100, m1: 87, m2: 12, m3: 69, m4: 39 } },
  { year: 2026, month: 2, pct: { w1: 60, w2: 78, w3: 7, w4: 25, w5: 35, w6: 100, m1: 92, m2: 39, m3: 78, m4: 57 } }
];

/* One entry per real submission date; q[id] = { n: respondents, yes: count }.
   Monthly questions (m1-m4) only appear on the month-end week. */
var SR_CHECKIN_WEEKS = [
  { date: '2026-03-17', q: { w1: { n: 9, yes: 7 }, w2: { n: 9, yes: 7 }, w3: { n: 9, yes: 1 }, w4: { n: 9, yes: 4 }, w5: { n: 9, yes: 3 }, w6: { n: 9, yes: 9 } } },
  { date: '2026-03-24', q: { w1: { n: 22, yes: 16 }, w2: { n: 22, yes: 20 }, w3: { n: 22, yes: 4 }, w4: { n: 22, yes: 11 }, w5: { n: 22, yes: 10 }, w6: { n: 22, yes: 21 } } },
  { date: '2026-03-31', q: { w1: { n: 23, yes: 16 }, w2: { n: 23, yes: 21 }, w3: { n: 23, yes: 2 }, w4: { n: 23, yes: 8 }, w5: { n: 23, yes: 10 }, w6: { n: 23, yes: 22 }, m1: { n: 23, yes: 19 }, m2: { n: 23, yes: 6 }, m3: { n: 23, yes: 19 }, m4: { n: 23, yes: 15 } } },
  { date: '2026-04-07', q: { w1: { n: 16, yes: 10 }, w2: { n: 16, yes: 15 }, w3: { n: 16, yes: 2 }, w4: { n: 16, yes: 6 }, w5: { n: 16, yes: 7 }, w6: { n: 16, yes: 15 } } },
  { date: '2026-04-21', q: { w1: { n: 15, yes: 10 }, w2: { n: 15, yes: 12 }, w3: { n: 15, yes: 3 }, w4: { n: 15, yes: 4 }, w5: { n: 15, yes: 3 }, w6: { n: 15, yes: 14 } } },
  { date: '2026-04-28', q: { w1: { n: 14, yes: 7 }, w2: { n: 14, yes: 11 }, w3: { n: 14, yes: 0 }, w4: { n: 14, yes: 5 }, w5: { n: 14, yes: 4 }, w6: { n: 14, yes: 13 }, m1: { n: 14, yes: 13 }, m2: { n: 14, yes: 2 }, m3: { n: 14, yes: 7 }, m4: { n: 14, yes: 9 } } },
  { date: '2026-05-04', q: { w1: { n: 1, yes: 1 }, w2: { n: 1, yes: 0 }, w3: { n: 1, yes: 0 }, w4: { n: 1, yes: 0 }, w5: { n: 1, yes: 0 }, w6: { n: 1, yes: 1 } } },
  { date: '2026-05-05', q: { w1: { n: 15, yes: 7 }, w2: { n: 14, yes: 11 }, w3: { n: 15, yes: 3 }, w4: { n: 15, yes: 6 }, w5: { n: 15, yes: 6 }, w6: { n: 14, yes: 14 } } },
  { date: '2026-05-12', q: { w1: { n: 14, yes: 8 }, w2: { n: 14, yes: 11 }, w3: { n: 14, yes: 3 }, w4: { n: 14, yes: 5 }, w5: { n: 14, yes: 6 }, w6: { n: 14, yes: 12 } } },
  { date: '2026-05-19', q: { w1: { n: 13, yes: 10 }, w2: { n: 13, yes: 10 }, w3: { n: 13, yes: 2 }, w4: { n: 13, yes: 7 }, w5: { n: 13, yes: 3 }, w6: { n: 13, yes: 12 } } },
  { date: '2026-05-26', q: { w1: { n: 17, yes: 15 }, w2: { n: 17, yes: 15 }, w3: { n: 17, yes: 2 }, w4: { n: 17, yes: 10 }, w5: { n: 17, yes: 6 }, w6: { n: 17, yes: 16 }, m1: { n: 17, yes: 13 }, m2: { n: 17, yes: 3 }, m3: { n: 17, yes: 12 }, m4: { n: 17, yes: 3 } } },
  { date: '2026-06-02', q: { w1: { n: 8, yes: 7 }, w2: { n: 8, yes: 6 }, w3: { n: 8, yes: 0 }, w4: { n: 8, yes: 5 }, w5: { n: 8, yes: 4 }, w6: { n: 8, yes: 7 } } },
  { date: '2026-06-09', q: { w1: { n: 17, yes: 13 }, w2: { n: 17, yes: 13 }, w3: { n: 17, yes: 1 }, w4: { n: 17, yes: 7 }, w5: { n: 17, yes: 8 }, w6: { n: 17, yes: 16 } } },
  { date: '2026-06-15', q: { w1: { n: 1, yes: 1 }, w2: { n: 1, yes: 0 }, w3: { n: 1, yes: 0 }, w4: { n: 1, yes: 0 }, w5: { n: 1, yes: 0 }, w6: { n: 1, yes: 1 } } },
  { date: '2026-06-16', q: { w1: { n: 24, yes: 19 }, w2: { n: 24, yes: 17 }, w3: { n: 24, yes: 2 }, w4: { n: 24, yes: 15 }, w5: { n: 24, yes: 7 }, w6: { n: 24, yes: 22 } } },
  { date: '2026-06-23', q: { w1: { n: 23, yes: 17 }, w2: { n: 23, yes: 20 }, w3: { n: 23, yes: 3 }, w4: { n: 23, yes: 13 }, w5: { n: 23, yes: 2 }, w6: { n: 23, yes: 21 } } },
  { date: '2026-06-30', q: { w1: { n: 25, yes: 18 }, w2: { n: 25, yes: 22 }, w3: { n: 25, yes: 2 }, w4: { n: 25, yes: 12 }, w5: { n: 25, yes: 7 }, w6: { n: 25, yes: 24 }, m1: { n: 25, yes: 24 }, m2: { n: 25, yes: 3 }, m3: { n: 25, yes: 17 }, m4: { n: 25, yes: 9 } } },
  { date: '2026-07-07', q: { w1: { n: 19, yes: 15 }, w2: { n: 19, yes: 18 }, w3: { n: 19, yes: 2 }, w4: { n: 19, yes: 10 }, w5: { n: 19, yes: 6 }, w6: { n: 19, yes: 18 } } },
  { date: '2026-07-14', q: { w1: { n: 10, yes: 8 }, w2: { n: 10, yes: 9 }, w3: { n: 10, yes: 1 }, w4: { n: 10, yes: 4 }, w5: { n: 10, yes: 4 }, w6: { n: 10, yes: 10 } } }
];
