/* The Team page's Structure view — the Canva org chart in the app.

   Drives the real page. With nothing saved on the server, the chart is
   built from everyone's profile: the campus directors form the Director
   Team, anyone with a "GP …" role is on the GP Team, an overseer in the
   leadership department leads their department's node, and a ministry's
   admin-assigned leader wears the crown over its members. Quarter chips
   ask the server for that quarter; an admin can move people around, add a
   team and save the quarter. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4493, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [] };
const URIAH = { ...base, id: 'st_uriah', name: 'Uriah Lyford', username: 'uriah', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'GP Campus Director', isAdmin: true };
const NAOMI = { ...base, id: 'st_naomi', name: 'Naomi Lyford', username: 'naomi', dept: 'Campus Leadership', ministry: 'Campus Director', role: 'GP Co-Director' };
const SINA = { ...base, id: 'st_sina', name: 'Sina Sok', username: 'sina', dept: 'Campus Leadership', ministry: 'Community Service', role: 'Overseer' };
const SREILEA = { ...base, id: 'st_sreilea', name: 'Sreilea Chan', username: 'sreilea', dept: 'Community Service', ministry: 'Cafe', role: 'Cafe manager', leads: ['Community Service|Cafe'] };
const DARA = { ...base, id: 'st_dara', name: 'Dara Pen', username: 'dara', dept: 'Community Service', ministry: 'Cafe', role: 'Barista' };
const BOPHA = { ...base, id: 'st_bopha', name: 'Bopha Kim', username: 'bopha', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', role: 'Barista' };
const ROSTER = [URIAH, NAOMI, SINA, SREILEA, DARA, BOPHA];
const YEAR = new Date().getFullYear();
const Q1_DOC = { campus: 'siemreap', year: YEAR, quarter: 1, nodes: [
  { id: 'gp', title: 'Old GP Team', kind: 'team', parent: '', leads: ['st_uriah'], members: ['st_dara'] }] };

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: ROSTER, logs: [], habits: null, mentees: [], mentorRequests: [],
      goals: [], checkins: [], ministry: null, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [],
      base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'getStructure') {
      const [, , campus, year, quarter] = b.args;
      if (quarter === 1) out = { ok: true, campus, year, quarter, doc: Q1_DOC, source: 'saved' };
      else if (quarter === 2) out = { ok: true, campus, year, quarter, doc: Q1_DOC, source: 'copied' };
      else out = { ok: true, campus, year, quarter, doc: null, source: 'none' };
    }
    else if (b.fn === 'saveStructure') out = { ok: true, campus: b.args[2].campus, year: b.args[2].year, quarter: b.args[2].quarter, doc: b.args[2], source: 'saved' };
    else if (b.fn === 'staffProfile') out = { ok: true, staff: ROSTER.find(p => p.id === b.args[2]) || ROSTER[0], goals: [], activity: {}, awayWork: {}, isMe: false };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4493/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.click('nav.bottom [data-tab="team"]');
  await page.waitForTimeout(500);
  await page.click('[data-teammode="org"]');
  await page.waitForTimeout(700);
  return { ctx, page, errors, sent };
}
// the node whose title reads `title`, described
const nodeInfo = (title) => ({ title }) => {
  const el = [].find.call(document.querySelectorAll('.orgNode'), n => n.querySelector('.orgTitle').textContent.trim().replace(/^\S+\s(?=[A-Z])/, '') === title
    || n.querySelector('.orgTitle').textContent.trim() === title);
  if (!el) return null;
  const own = el.querySelector(':scope > .orgPeople');
  const chain = []; let p = el.parentElement;
  while (p) { if (p.classList && p.classList.contains('orgNode')) chain.push(p.querySelector('.orgTitle').textContent.trim()); p = p.parentElement; }
  return { kind: el.querySelector('.orgKind').textContent.trim(),
    people: own ? [].map.call(own.querySelectorAll('.orgPerson'), b => b.querySelector('span:last-child').textContent.trim()) : [],
    empty: !!el.querySelector(':scope > .orgEmpty'), chain };
};
const nodeOf = (page, title) => page.evaluate(nodeInfo(title), { title });

console.log('=== a member sees the chart built from profiles ===');
{
  const { ctx, page, errors, sent } = await open(DARA);
  const gs = sent.filter(x => x.fn === 'getStructure');
  ok('opening Structure asks the server for this campus, year and quarter', gs.length === 1 && gs[0].args[2] === 'siemreap' && gs[0].args[3] === YEAR && gs[0].args[4] >= 1 && gs[0].args[4] <= 4, JSON.stringify(gs[0] && gs[0].args.slice(2)));
  const s = await page.evaluate(() => ({
    heading: (document.querySelector('h3') || {}).textContent || '',
    note: [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '),
    edit: !!document.querySelector('#structEditBtn'), save: !!document.querySelector('#structSaveBtn'),
    chips: [].map.call(document.querySelectorAll('[data-structq]'), b => b.textContent + (b.classList.contains('on') ? '*' : '')),
    years: [].map.call(document.querySelectorAll('#structYearSel option'), o => o.value),
    nodes: document.querySelectorAll('.orgNode').length,
    bopha: document.body.innerText.includes('Bopha'),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  ok('the heading names the campus and the quarter', /SR structure · Q\d \d{4}|Siem Reap structure · Q\d \d{4}/.test(s.heading), s.heading);
  ok('and says the chart is built from profiles, nothing saved yet', /Built from everyone/.test(s.note), s.note);
  ok('four quarter chips, one lit, and three years to pick from', s.chips.length === 4 && s.chips.filter(c => /\*$/.test(c)).length === 1 && s.years.length === 3 && s.years[2] === String(YEAR), s.chips.join(' ') + ' / ' + s.years.join(' '));
  ok('a member sees no Edit or Save', !s.edit && !s.save);
  const dir = await nodeOf(page, 'Director Team');
  ok('the Director Team holds the two campus directors', dir && dir.people.length === 2 && dir.people.some(p => /Uriah/.test(p)) && dir.people.some(p => /Naomi/.test(p)), JSON.stringify(dir && dir.people));
  const gp = await nodeOf(page, 'GP Team');
  ok('the GP Team holds everyone whose role starts “GP”', gp && gp.people.length === 2 && gp.people.every(p => /Uriah|Naomi/.test(p)), JSON.stringify(gp && gp.people));
  const cl = await nodeOf(page, 'Campus Leadership Team');
  ok('the Campus Leadership Team holds the rest of the leadership department, under the directors', cl && cl.people.length === 1 && /Sina/.test(cl.people[0]) && cl.chain[0] === 'Director Team', JSON.stringify(cl));
  const cs = await nodeOf(page, 'Community Service');
  ok('a department node is led by its overseer, under Director of Serve & Educate', cs && cs.kind === 'Department' && cs.people.length === 1 && /👑 Sina/.test(cs.people[0]) && /Serve & Educate/.test(cs.chain[0]), JSON.stringify(cs));
  const cafe = await nodeOf(page, 'Cafe');
  ok('a ministry node crowns its leader and lists its members, under its department', cafe && cafe.kind === 'Ministry' && cafe.people[0] === '👑 Sreilea Chan' && cafe.people[1] === 'Dara Pen' && /Community Service/.test(cafe.chain[0]), JSON.stringify(cafe));
  ok('the other campus’s staff are not on this campus’s chart', !s.bopha);
  const hr = await nodeOf(page, 'Human Resources');
  ok('an empty team says so', hr && hr.empty, JSON.stringify(hr));
  ok('nothing scrolls sideways', !s.overflow);

  await page.click('.orgNode .orgPerson');
  await page.waitForTimeout(400);
  ok('tapping a person opens their page', await page.$('#personBack') !== null);
  await page.click('#personBack'); await page.waitForTimeout(400);
  ok('and Back returns to the Structure view', await page.$('[data-structq]') !== null);

  await page.click('[data-structq="1"]');
  await page.waitForTimeout(600);
  const q1 = sent.filter(x => x.fn === 'getStructure');
  const s1 = await page.evaluate(() => ({ note: [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '),
    titles: [].map.call(document.querySelectorAll('.orgTitle'), t => t.textContent.trim()) }));
  ok('a quarter chip asks the server for that quarter', q1.length === 2 && q1[1].args[4] === 1, JSON.stringify(q1[1] && q1[1].args.slice(2)));
  ok('a saved quarter shows what was saved, and says so', /Saved for this quarter/.test(s1.note) && s1.titles.length === 1 && s1.titles[0] === 'Old GP Team', JSON.stringify(s1));
  await page.click('[data-structq="2"]');
  await page.waitForTimeout(600);
  const s2 = await page.evaluate(() => (document.querySelectorAll('p.sub')[1] || document.querySelector('p.sub')).textContent);
  const note2 = await page.evaluate(() => [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '));
  ok('an unsaved quarter shows the previous one and says which', new RegExp('Showing Q1 ' + YEAR).test(note2), note2);
  await page.click('[data-structq="1"]');
  await page.waitForTimeout(300);
  ok('a quarter already fetched is not fetched again', sent.filter(x => x.fn === 'getStructure').length === 3);
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('\n=== the admin edits and saves the quarter ===');
{
  const { ctx, page, errors, sent } = await open(URIAH);
  const q = (sent.find(x => x.fn === 'getStructure') || { args: [] }).args[4];
  ok('the admin sees Edit and Save', await page.$('#structEditBtn') !== null && await page.$('#structSaveBtn') !== null);
  await page.click('#structEditBtn');
  await page.waitForTimeout(400);
  const e = await page.evaluate(() => ({ btn: document.querySelector('#structEditBtn').textContent, people: document.querySelectorAll('[data-structpeople]').length,
    add: !!document.querySelector('#structAddTitle'), reset: !!document.querySelector('#structResetBtn') }));
  ok('editing offers a People button on every node, an Add a team box and Rebuild', /Done editing/.test(e.btn) && e.people > 5 && e.add && e.reset, JSON.stringify(e));

  await page.click('[data-structpeople="min:Community Service|Cafe"]');
  await page.waitForTimeout(400);
  const pk = await page.evaluate(() => ({
    boxes: [].map.call(document.querySelectorAll('[data-structmember]'), c => c.getAttribute('data-structmember').split('|').pop() + (c.checked ? '*' : '')),
    crowns: [].map.call(document.querySelectorAll('[data-structlead]'), c => c.getAttribute('data-structlead').split('|').pop() + (c.classList.contains('on') ? '*' : '')),
    rename: document.querySelectorAll('[data-structrename]').length }));
  ok('a ministry’s picker offers only this campus’s people, with the current members ticked', pk.boxes.length === 5 && !pk.boxes.some(b => /bopha/.test(b)) && pk.boxes.includes('st_sreilea*') && pk.boxes.includes('st_dara*') && pk.boxes.includes('st_naomi'), pk.boxes.join(' '));
  ok('and the crown lit on its leader', pk.crowns.includes('st_sreilea*') && pk.crowns.includes('st_dara'), pk.crowns.join(' '));
  ok('a ministry cannot be renamed or removed (only teams can)', pk.rename === 0);

  await page.click('[data-structmember="min:Community Service|Cafe|st_naomi"]');
  await page.waitForTimeout(400);
  await page.click('[data-structlead="min:Community Service|Cafe|st_dara"]');
  await page.waitForTimeout(400);
  const cafe = await nodeOf(page, 'Cafe');
  ok('ticking Naomi puts her on Cafe; the crown makes Dara a leader too', cafe && cafe.people.includes('👑 Dara Pen') && cafe.people.includes('👑 Sreilea Chan') && cafe.people.includes('Naomi Lyford'), JSON.stringify(cafe && cafe.people));
  const note = await page.evaluate(() => [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '));
  ok('the page says the changes are unsaved', /Unsaved changes/.test(note), note);
  const dir = await nodeOf(page, 'Director Team');
  ok('other nodes are untouched — Naomi is still a director too', dir && dir.people.some(p => /Naomi/.test(p)));

  await page.click('[data-structpeople="gp"]');
  await page.waitForTimeout(400);
  const gpPool = await page.evaluate(() => document.querySelectorAll('[data-structmember^="gp|"]').length);
  ok('a team’s picker draws from both campuses', gpPool === 6, gpPool);

  await page.fill('#structAddTitle', 'Prayer Walk Team');
  await page.click('#structAddBtn');
  await page.waitForTimeout(400);
  const ev = await nodeOf(page, 'Prayer Walk Team');
  ok('Add a team puts a new top-level team on the chart, opened for people', ev && ev.kind === 'Team' && ev.chain.length === 0 && await page.$('[data-structmember^="team:"]') !== null, JSON.stringify(ev));

  await page.click('#structSaveBtn');
  await page.waitForTimeout(700);
  const sv = sent.find(x => x.fn === 'saveStructure');
  const doc = sv && sv.args[2];
  const savedCafe = doc && doc.nodes.find(n => n.id === 'min:Community Service|Cafe');
  ok('Save posts the whole document for this campus and quarter', !!doc && doc.campus === 'siemreap' && doc.year === YEAR && doc.quarter === q, doc && JSON.stringify([doc.campus, doc.year, doc.quarter]));
  ok('with the moves made on screen', savedCafe && savedCafe.leads.includes('st_dara') && savedCafe.leads.includes('st_sreilea') && savedCafe.members.includes('st_naomi') && !savedCafe.members.includes('st_dara'), JSON.stringify(savedCafe));
  ok('and the new team', doc && doc.nodes.some(n => n.title === 'Prayer Walk Team' && n.kind === 'team' && n.parent === ''));
  const after = await page.evaluate(() => ({ note: [].map.call(document.querySelectorAll('p.sub'), p => p.textContent).join(' | '),
    save: !!document.querySelector('#structSaveBtn'), edit: document.querySelector('#structEditBtn').textContent, toast: document.body.innerText }));
  ok('after saving the quarter reads as saved, editing closes and Save goes away', /Saved for this quarter/.test(after.note) && !after.save && /Edit structure/.test(after.edit), after.note);
  ok('and the confirmation names the quarter', new RegExp('Saved — Q' + q + ' ' + YEAR).test(after.toast));
  ok('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
