/*  CliftonStrengths — a place to RECORD results people got from Gallup.

    This file is deliberately small, and what is not in it matters more than
    what is.

    CliftonStrengths® (formerly StrengthsFinder), the 34 theme names and the four
    domains are Gallup's trademarks and creation, and the assessment and its
    theme descriptions are Gallup's copyrighted material. Unlike the personality
    types in personality.js — built on Jung's public-domain preference pairs —
    there is no public idea underneath CliftonStrengths to build our own version
    on. So this app:

      · does NOT give the assessment, or anything that works like it;
      · does NOT carry Gallup's descriptions of the themes;
      · DOES let someone record the Top 5 (up to 10) they already got from Gallup,
        by name, and say in their own words how each one shows up in them;
      · always credits Gallup and links to where the real thing is taken.

    Using the theme names to record and display a person's own results is naming
    Gallup's product to describe it — the same way someone writes "My top 5:
    Learner, Achiever…" on a CV. Keep it to that. Do not add descriptions, a
    questionnaire, or "which theme are you?" logic here, however helpful it looks.

    GP's own free test (gpstrengths.js) has 34 strengths shaped to cover the
    same ground, one each, in the same order. GP_SGP_MATCH says which GP
    strength sits closest to each Gallup theme, so someone with both results can
    compare them. It points only at GP's words — it adds nothing of Gallup's.

    Theme names stay in English in every language: they are product names, and
    they have to match the report a person is holding. Only the app's own words
    around them go through t(). */

/* Coloured like the GP group each domain lines up with (gpstrengths.js), so
   the two results read as one picture — not in Gallup's own domain colours. */
var GP_SDOMAINS = [
  { id: 'executing',    name: 'Executing',             color: '#2D6CB0', tint: '#E3EDF8', ink: '#1D4C82', gp: 'doing' },
  { id: 'influencing',  name: 'Influencing',           color: '#B5475A', tint: '#F8E4E8', ink: '#8A2B3C', gp: 'leading' },
  { id: 'relationship', name: 'Relationship Building', color: '#C9800F', tint: '#FBF0DC', ink: '#7A4A04', gp: 'relating' },
  { id: 'strategic',    name: 'Strategic Thinking',    color: '#7B4FA0', tint: '#EFE6F6', ink: '#5B3482', gp: 'thinking' }
];

/* The 34 themes, grouped by domain as Gallup groups them — the grouping is how
   the team map adds people up, so it has to match the reports people have. */
var GP_STHEMES = {
  executing:    ['Achiever', 'Arranger', 'Belief', 'Consistency', 'Deliberative', 'Discipline', 'Focus', 'Responsibility', 'Restorative'],
  influencing:  ['Activator', 'Command', 'Communication', 'Competition', 'Maximizer', 'Self-Assurance', 'Significance', 'Woo'],
  relationship: ['Adaptability', 'Connectedness', 'Developer', 'Empathy', 'Harmony', 'Includer', 'Individualization', 'Positivity', 'Relator'],
  strategic:    ['Analytical', 'Context', 'Futuristic', 'Ideation', 'Input', 'Intellection', 'Learner', 'Strategic']
};
var GP_STHEME_LIST = [].concat(GP_STHEMES.executing, GP_STHEMES.influencing, GP_STHEMES.relationship, GP_STHEMES.strategic);

var GP_SMAX = 10;      // Gallup's report gives a Top 5; some people also have their Top 10
var GP_SNOTE_MAX = 300;
var GP_SGALLUP_URL = 'https://www.gallup.com/cliftonstrengths/';

/* Gallup theme → the GP strength that covers the same ground (gpstrengths.js ids) */
var GP_SGP_MATCH = {
  'Achiever': 'hardworker', 'Arranger': 'coordinator', 'Belief': 'valuesdriven',
  'Consistency': 'fairminded', 'Deliberative': 'careful', 'Discipline': 'orderly',
  'Focus': 'goalsetter', 'Responsibility': 'dependable', 'Restorative': 'solver',
  'Activator': 'starter', 'Command': 'takecharge', 'Communication': 'voice',
  'Competition': 'pacesetter', 'Maximizer': 'improver', 'Self-Assurance': 'confident',
  'Significance': 'differencemaker', 'Woo': 'friendmaker', 'Adaptability': 'flexible',
  'Connectedness': 'weaver', 'Developer': 'mentor', 'Empathy': 'comforter',
  'Harmony': 'peacemaker', 'Includer': 'welcomer', 'Individualization': 'noticer',
  'Positivity': 'optimist', 'Relator': 'loyalfriend', 'Analytical': 'factfinder',
  'Context': 'historian', 'Futuristic': 'visionary', 'Ideation': 'inventor',
  'Input': 'collector', 'Intellection': 'deepthinker', 'Learner': 'curious',
  'Strategic': 'pathfinder'
};

function gpSDomainOf(theme) {
  for (var i = 0; i < GP_SDOMAINS.length; i++) {
    if (GP_STHEMES[GP_SDOMAINS[i].id].indexOf(theme) > -1) return GP_SDOMAINS[i];
  }
  return null;
}
function gpSIsTheme(theme) { return GP_STHEME_LIST.indexOf(theme) > -1; }
