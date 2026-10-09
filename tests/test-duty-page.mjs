/* Weekly schedules in the browser — the staff app, on a phone and a desktop.

   Against a small stand-in for getMySchedules / getDuty / saveDuty: My Home
   carries this week's schedules with "Your duties"; the menu opens them; a
   published week reads as a table (the grid scrolls inside its card, never
   the page) and goes out as a picture; someone outside the ministry has no
   Edit; the Culinary team gets a door on My Ministry, a draft started from
   last week, a name picker grouped by who is here (search, tap, type a new
   name), rows to change, and Publish; Hospitality fills its morning chores
   place by place. Every name is made up. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const NOW = testNow('2026-10-06');           // a Tuesday; the week began Sunday 4 October
const W0 = '2026-10-04', W1 = '2026-10-11', WP = '2026-09-27';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4498, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [], ministries: [], staffType: 'campus' };
const KARA = { ...base, id: 'st_k', name: 'Kara Cook', username: 'kara', dept: 'Skills Training', ministry: 'Culinary', role: '' };
const HANA = { ...base, id: 'st_h', name: 'Hana Host', username: 'hana', dept: 'Skills Training', ministry: 'Hospitality', role: '' };
const KIM = { ...base, id: 'st_c', name: 'Kim Cafe', username: 'kim', dept: 'Community Service', ministry: 'Cafe', role: '' };
const KITCHEN = () => ({ layout: 'grid', title: 'Cooking schedule', km: 'កាលវិភាគធ្វើម្ហូបប្រចាំសប្តាហ៍', notes: '', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
  rows: [{ id: 'bf', label: 'Breakfast 7:30', km: 'អាហារ-ព្រឹក', time: 'Cooking 6:00', off: ['sun'], span: false },
         { id: 'pr', label: 'Pray – Announcements', km: '', time: '', off: ['sun'], span: true },
         { id: 'di', label: 'Dinner 6:30', km: '', time: 'Cooking 5:00', off: [], span: false }],
  cells: { 'bf|mon': ['Kim', 'Kara'], 'pr|all': ['Hana'], 'di|tue': ['Kim'], 'di|wed': ['Uriah Lyford'] } });
const CHORES = () => ({ layout: 'list', title: 'Morning chores (8–8:30 AM)', km: '', notes: '',
  sections: [{ id: 'base', title: 'Base', km: '', rows: [{ id: 'c1', place: 'Stairs 1–4', km: '', duty: 'Sweep and mop stairs 1–4.', people: [] }, { id: 'c2', place: 'Rooftop', km: '', duty: 'Sweep and mop the rooftop.', people: ['Kim'] }] },
             { id: 'house', title: 'Family house', km: '', rows: [{ id: 'h1', place: 'Plants', km: '', duty: 'Water the plants.', people: [] }] }] });
const PEOPLE = [{ id: 'campus', label: 'Campus staff', names: ['Hana', 'Kara', 'Kim'] }, { id: 'team_t1', label: 'Example Church', names: ['Lee Leader', 'Member One'] },
  { id: 'guests', label: 'Staying with us', names: ['Pastor Example'] }];

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 900 }, acceptDownloads: true });
  await pinClock(ctx, NOW);
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  const store = { ['kitchen|' + W0]: { ...KITCHEN(), published: true, publishedAt: '2026-10-04T01:00:00Z' }, ['chores|' + W0]: opts.chores || null };
  const edits = { kitchen: who === KARA, chores: who === HANA };
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    const pub = (k, w) => { const s = store[k + '|' + w]; return s && s.published ? { ...s, kind: k, week: w } : null; };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [KARA, HANA, KIM], logs: [], habits: null, mentees: [], mentorRequests: [],
      goals: [], checkins: [], ministry: { ok: true, campus: 'siemreap', dept: who.dept, ministry: who.ministry, entries: {}, daily: {}, prev: {}, pins: [] }, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [],
      base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'getMySchedules') out = { ok: true, week: b.args[2], now: { kitchen: pub('kitchen', b.args[2]), chores: pub('chores', b.args[2]) }, next: { kitchen: null, chores: null }, nextWeek: W1, canEdit: edits };
    else if (b.fn === 'getDuty') {
      const [k, w] = b.args.slice(2);
      if (!edits[k]) out = { ok: true, kind: k, week: w, canEdit: false, sched: pub(k, w) };
      else {
        let s = store[k + '|' + w], isNew = false, from = '';
        if (!s) { isNew = true; s = { ...(k === 'kitchen' ? KITCHEN() : CHORES()), published: false }; from = k === 'kitchen' ? W0 : ''; if (k === 'chores') s.sections.forEach(x => x.rows.forEach(r => r.people = [])); }
        out = { ok: true, kind: k, week: w, canEdit: true, isNew, from, sched: { ...JSON.parse(JSON.stringify(s)), kind: k, week: w }, people: PEOPLE, away: { Kim: 'Tue, Wed' } };
      }
    }
    else if (b.fn === 'saveDuty') {
      const [k, w, s, action] = b.args.slice(2);
      const prev = store[k + '|' + w];
      store[k + '|' + w] = { ...s, published: action === 'publish' ? true : action === 'unpublish' ? false : !!(prev && prev.published) };
      out = { ok: true, kind: k, week: w, canEdit: true, isNew: false, sched: { ...store[k + '|' + w], kind: k, week: w }, people: PEOPLE };
    }
    else if (b.fn === 'getMinistryFor') out = { ok: true, campus: 'siemreap', dept: b.args[2], ministry: b.args[3], entries: {}, daily: {}, prev: {}, pins: [] };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4498/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(600);
  return { ctx, page, errors, sent, store };
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

console.log('=== everyone: My Home, the menu, reading, the picture ===');
{
  const { ctx, page, errors, sent } = await open(KIM);
  await page.waitForSelector('#schedHome [data-schedopen]');
  const home = await page.$eval('#schedHome', e => e.textContent);
  ok('My Home’s dashboard card has this week’s schedules: cooking out, chores dimmed until it is', !!(await page.$('.hero #schedHome')) && !(await page.$eval('#schedHome [data-schedopen="kitchen"]', b => b.classList.contains('notOut'))) && await page.$eval('#schedHome [data-schedopen="chores"]', b => b.classList.contains('notOut')), home);
  ok('it asked for the week that began on Sunday', sent.find(b => b.fn === 'getMySchedules').args[2] === W0);
  ok('and names my cooking duties', /Cooking: Mon · Breakfast 7:30, Tue · Dinner 6:30/.test(home), home);
  ok('My Home has no daily check-in for now, and no “Log today” banner', !(await page.$('#moreToday')) && !(await page.$('#jumpToday')) && !/Daily check-in/.test(await page.$eval('#main', e => e.textContent)));
  ok('no separate schedules card below it', (await page.$$('#schedHome')).length === 1 && !(await page.$('.card #schedHome')));
  await page.click('[data-schedopen="kitchen"]'); await page.waitForTimeout(400);
  ok('the schedule opens on the week of 4 October', /Oct 4 – Oct 10/.test(await page.$eval('#schedWeek', e => e.textContent)));
  const grid = await page.evaluate(() => ({
    heads: [].map.call(document.querySelectorAll('.dutyGrid thead th'), th => th.textContent),
    me: [].map.call(document.querySelectorAll('.dutyName.me'), x => x.textContent),
    span: (document.querySelector('.dutyGrid tbody tr:nth-child(2) td[colspan]') || {}).colSpan,
    off: document.querySelectorAll('.dutyGrid td.off').length,
  }));
  ok('a table, Sunday to Friday', grid.heads.join() === 'Time,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday', grid.heads.join());
  ok('my name stands out', grid.me.join() === 'Kim,Kim');
  ok('Pray – Announcements spans the week; Sunday’s off boxes are shaded', grid.span === 5 && grid.off === 2, JSON.stringify(grid));
  const full = await page.evaluate(() => { const n = [].filter.call(document.querySelectorAll('.dutyName'), x => x.textContent === 'Uriah Lyford')[0]; return n ? { h: n.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(n).lineHeight) } : null; });
  ok('a full name stays on one line — “Uriah Lyford”, not Uriah over Lyford', full && full.h < full.lh * 1.5, JSON.stringify(full));
  ok('the table scrolls inside its card, not the page', !(await overflow(page)));
  ok('someone outside Culinary has no Edit', !(await page.$('#schedEditBtn')));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.click('#schedShare')]);
  ok('Share as image makes a picture (a download where the phone can’t share)', dl && /cooking-schedule-2026-10-04\.png/.test(dl.suggestedFilename()), dl && dl.suggestedFilename());
  if (dl) { const p = await dl.path(); const buf = fs.readFileSync(p); ok('… a real PNG', buf.slice(1, 4).toString() === 'PNG' && buf.length > 5000, buf.length); }
  await page.click('[data-schedkind="chores"]'); await page.waitForTimeout(300);
  ok('the morning chores not out yet say so', /isn’t out yet/.test(await page.$eval('#main', e => e.textContent)));
  await page.click('#schedPrev'); await page.waitForTimeout(300);
  ok('‹ goes back a week, and This week comes back', sent.filter(b => b.fn === 'getDuty').pop().args[3] === WP && !!(await page.$('#schedThis')));
  await page.click('#schedBack'); await page.waitForTimeout(300);
  await page.click('#menuBtn'); await page.waitForTimeout(150);
  ok('the menu has Weekly schedules', !!(await page.$('[data-menu-item="sched"]')));
  await page.click('[data-menu-item="sched"]'); await page.waitForTimeout(300);
  ok('… and it opens them', !!(await page.$('.dutyGrid')));
  ok('no errors (reader)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== Culinary makes next week ===');
{
  const { ctx, page, errors, sent, store } = await open(KARA);
  await page.click('#goMinistryFromMe'); await page.waitForTimeout(500);
  ok('My Ministry (Culinary) has the way in', !!(await page.$('#goSchedEdit')));
  await page.click('#goSchedEdit'); await page.waitForTimeout(400);
  ok('it opens this week, editable, already published', /Published/.test(await page.$eval('#schedState', e => e.textContent)) && !!(await page.$('[data-dcell="bf|mon"]')));
  await page.click('#schedNext'); await page.waitForTimeout(400);
  ok('next week is a draft started from this one', /Draft/.test(await page.$eval('#schedState', e => e.textContent)) && /copy of the week of Oct 4/.test(await page.$eval('#schedState', e => e.textContent)) && /Kim/.test(await page.$eval('[data-dcell="bf|mon"]', e => e.textContent)));
  await page.click('[data-dcell="bf|tue"]'); await page.waitForTimeout(250);
  ok('tapping a box opens the picker, titled with the row and day', /Breakfast 7:30 · Tuesday/.test(await page.$eval('#schedSheet', e => e.textContent)));
  const groups = await page.$$eval('.schedGroupLabel', g => g.map(x => x.textContent));
  ok('names are grouped by who is here', groups.join() === 'Campus staff,Example Church,Staying with us', groups.join());
  const counted = await page.$$eval('[data-dpick]', bs => bs.map(b => b.getAttribute('data-dpick') + ':' + b.getAttribute('data-dcount') + (b.querySelector('.schedN.zero') ? 'z' : '')));
  ok('every name carries how many slots it has this week — 0 for nobody yet — and the fewest come first', counted.join() === 'Hana:1,Kara:1,Kim:2,Lee Leader:0z,Member One:0z,Pastor Example:0z', counted.join());
  ok('the cooking picker hides nobody — people cook many times a week', !(await page.$('#schedAssigned')) && (await page.$$eval('[data-dpick]', bs => bs.length)) === 6);
  ok('someone on leave part of the week says which days', /away Tue, Wed/.test(await page.$eval('[data-dpick="Kim"]', b => b.textContent)));
  await page.click('[data-dpick="Member One"]'); await page.waitForTimeout(150);
  await page.fill('#schedQ', 'kar');
  ok('typing narrows the names', await page.$eval('[data-dpick="Kara"]', b => b.style.display !== 'none') && await page.$eval('[data-dpick="Hana"]', b => b.style.display === 'none'));
  await page.click('[data-dpick="Kara"]'); await page.waitForTimeout(150);
  await page.fill('#schedQ', 'Visiting Cook'); await page.click('#schedAddName'); await page.waitForTimeout(150);
  ok('picked and typed names are in the box', (await page.$$eval('#schedCur [data-dunpick]', b => b.map(x => x.getAttribute('data-dunpick')))).join() === 'Member One,Kara,Visiting Cook');
  await page.click('[data-dunpick="Kara"]'); await page.waitForTimeout(150);
  await page.click('#schedPickDone'); await page.waitForTimeout(150);
  ok('the box shows them, and the page says there are unsaved changes', /Member One/.test(await page.$eval('[data-dcell="bf|tue"]', e => e.textContent)) && /not saved/.test(await page.$eval('#schedState', e => e.textContent)));
  ok('no sideways scroll while editing', !(await overflow(page)));
  await page.click('#schedRowsBtn'); await page.waitForTimeout(200);
  await page.click('#schedRowAdd'); await page.waitForTimeout(150);
  const last = (await page.$$('[data-srow][data-sf="label"]')).length - 1;
  await page.fill('[data-srow="' + last + '"][data-sf="label"]', 'Snack 3:00');
  await page.click('[data-sday="sat"]'); await page.waitForTimeout(150);
  await page.click('#schedRowsBtn'); await page.waitForTimeout(200);
  ok('a new row and Saturday show in the table', /Snack 3:00/.test(await page.$eval('.dutyGrid', e => e.textContent)) && /Saturday/.test(await page.$eval('.dutyGrid thead', e => e.textContent)));
  await page.click('#schedPub'); await page.waitForTimeout(400);
  const sv = sent.filter(b => b.fn === 'saveDuty').pop();
  ok('Publish sends the week with its names and rows', sv && sv.args[2] === 'kitchen' && sv.args[3] === W1 && sv.args[5] === 'publish' && sv.args[4].cells['bf|tue'].join() === 'Member One,Visiting Cook' && sv.args[4].rows.some(r => r.label === 'Snack 3:00') && sv.args[4].days.join() === 'sun,mon,tue,wed,thu,fri,sat', JSON.stringify(sv && sv.args.slice(2, 4)));
  ok('and it reads Published', /Published/.test(await page.$eval('#schedState', e => e.textContent)) && store['kitchen|' + W1].published === true);
  ok('no errors (Culinary)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== Hospitality fills the morning chores ===');
{
  const { ctx, page, errors, sent } = await open(HANA);
  await page.click('#goMinistryFromMe'); await page.waitForTimeout(500);
  await page.click('#goSchedEdit'); await page.waitForTimeout(400);
  ok('Hospitality’s way in opens the morning chores', /Morning chores/.test(await page.$eval('.campusBtn.on', e => e.textContent)) && !!(await page.$('[data-dcell="base|c1"]')));
  await page.click('[data-dcell="base|c1"]'); await page.waitForTimeout(200);
  ok('the chores: a fresh week offers everyone, each at 0, and says how far along it is', !!(await page.$('[data-dpick="Kim"][data-dcount="0"]')) && /0 of 6 have a chore/.test(await page.$eval('#schedAssigned', e => e.textContent)), await page.$eval('#schedAssigned', e => e.textContent));
  await page.click('[data-dpick="Pastor Example"]'); await page.click('[data-dpick="Hana"]'); await page.waitForTimeout(100);
  ok('the ones just picked stay in view, ticked, and the count moves', !!(await page.$('[data-dpick="Hana"].on')) && /2 of 6 have a chore/.test(await page.$eval('#schedAssigned', e => e.textContent)));
  await page.click('#schedPickDone'); await page.waitForTimeout(150);
  await page.click('[data-dcell="base|c2"]'); await page.waitForTimeout(200);
  ok('in the next box, the two who have a chore step out — one responsibility each until everyone has one', !(await page.$('[data-dpick="Hana"]')) && !(await page.$('[data-dpick="Pastor Example"]')) && !!(await page.$('[data-dpick="Kim"]')));
  await page.click('#schedShowAll'); await page.waitForTimeout(150);
  ok('Show everyone brings them back, with their count', !!(await page.$('[data-dpick="Hana"][data-dcount="1"]')));
  await page.click('#schedShowAll'); await page.waitForTimeout(150);
  ok('… and hides them again', !(await page.$('[data-dpick="Hana"]')));
  await page.click('#schedPickDone'); await page.waitForTimeout(150);
  await page.click('#schedRowsBtn'); await page.waitForTimeout(150);
  await page.click('[data-splaceadd="1"]'); await page.waitForTimeout(150);
  await page.fill('[data-splace="1|1"][data-sf="place"]', 'Bathroom downstairs');
  await page.click('#schedRowsBtn'); await page.waitForTimeout(150);
  await page.click('#schedSave'); await page.waitForTimeout(400);
  const sv = sent.filter(b => b.fn === 'saveDuty').pop();
  ok('a place gets its people, a place is added, saved as a draft', sv && sv.args[2] === 'chores' && sv.args[5] === 'save' && sv.args[4].sections[0].rows[0].people.join() === 'Pastor Example,Hana' && sv.args[4].sections[1].rows[1].place === 'Bathroom downstairs', JSON.stringify(sv && sv.args[4].sections));
  ok('no sideways scroll on the chores', !(await overflow(page)));
  ok('no errors (Hospitality)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== desktop ===');
{
  const { ctx, page, errors } = await open(KIM, { viewport: { width: 1280, height: 900 } });
  await page.waitForSelector('#schedHome [data-schedopen]');
  await page.click('[data-schedopen="kitchen"]'); await page.waitForTimeout(400);
  ok('desktop: the table fits without a sideways page scroll', !!(await page.$('.dutyGrid')) && !(await overflow(page)));
  ok('no errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== the morning chores at a glance ===');
{
  const ch = CHORES(); ch.sections[0].rows[0].people = ['Kara']; ch.sections[0].rows[1].people = ['Kim', 'Hana'];
  const { ctx, page, errors } = await open(KIM, { chores: { ...ch, published: true } });
  const home = await page.$eval('#schedHome', e => e.textContent);
  ok('My Home names my chore', /Your chore: Rooftop/.test(home), home);
  await page.click('#schedMineChore'); await page.waitForTimeout(700);
  const mine = await page.$eval('#schedMine', e => e.textContent.replace(/\s+/g, ' '));
  ok('at the top: my chore, what to do, and who I am with', /Your chore this week/.test(mine) && /Rooftop/.test(mine) && /Sweep and mop the rooftop/.test(mine) && /With Hana/.test(mine), mine);
  const rows = await page.$$eval('.dutyItem', r => r.map(x => x.querySelector('.dutyPlace').textContent + ' = ' + x.querySelector('.dutyWho').textContent));
  ok('the list is one line a chore with the names beside it — no “what to do” in the way', rows.join(' | ') === 'Stairs 1–4 = Kara | Rooftop = KimHana | Plants = ' && (await page.$$('.dutyWhat')).length === 0 && await page.$eval('.dutyList', e => e.classList.contains('compact')), rows.join(' | '));
  await page.click('#schedDetails'); await page.waitForTimeout(200);
  ok('“Show what to do” brings the descriptions back', (await page.$$('.dutyWhat')).length === 3);
  await page.click('#schedDetails'); await page.click('[data-schedonly="1"]'); await page.waitForTimeout(200);
  ok('“Mine” shows just my chore', (await page.$$eval('.dutyItem .dutyPlace', p => p.map(x => x.textContent))).join() === 'Rooftop');
  await page.click('[data-schedonly="0"]'); await page.waitForTimeout(200);
  ok('“Everyone” shows them all again', (await page.$$('.dutyItem')).length === 3);
  ok('no sideways scroll; no errors', !(await overflow(page)) && errors.length === 0, errors.join(' | '));
  await ctx.close();
}
{
  const ch = CHORES(); ch.sections[0].rows[1].people = ['Kara'];
  const { ctx, page } = await open(KIM, { chores: { ...ch, published: true } });
  await page.click('[data-schedopen="chores"]'); await page.waitForTimeout(700);
  ok('someone with no chore sees no “your chore” and no Mine switch', !(await page.$('#schedMine')) && !(await page.$('[data-schedonly]')));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
