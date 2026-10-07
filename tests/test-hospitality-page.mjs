/* SR Hospitality in the browser, on a phone and a desktop.

   Drives the real teams.html against a small stand-in for the three
   hospitality calls: who gets the menu item and the My Ministry button (the
   Hospitality ministry and admins, not another ministry); the dashboard's
   tiles for tonight and its week / month / quarter bars with the busy and
   quiet seasons; team requests from the Teams Database with whether they fit
   ("Fits" / "Short by"), pending ones marked; "Book beds" opens a booking
   filled in from the team, "Pick beds for me" puts men in the men's room
   and women in the women's, and the saved booking marks the request booked;
   a bed someone else has those nights can't be picked; rooms and buildings
   are added from the Rooms tab. Nothing scrolls sideways. Made-up people. */
import { PUBLIC, CHROMIUM } from './env.mjs';
import { testNow, pinClock } from './clock.mjs';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const NOW = testNow('2026-10-12');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(PUBLIC, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(4497, r));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const base = { campus: 'siemreap', photo: '', mentorId: '', isAdmin: false, leads: [] };
const HANA = { ...base, id: 'st_h', name: 'Hana Example', username: 'hana', dept: 'Skills Training', ministry: 'Hospitality', role: 'Host', hospitality: true };
const ADMIN = { ...base, id: 'st_a', name: 'Adam Example', username: 'adam', dept: 'Campus Leadership', ministry: 'Campus Director', role: '', isAdmin: true, hospitality: true };
const KIM = { ...base, id: 'st_k', name: 'Kim Example', username: 'kim', dept: 'Community Service', ministry: 'Cafe', role: '', hospitality: false };
const day = (n) => { const d = new Date(NOW); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const beds = (p, n, out) => Array.from({ length: n }, (_, i) => ({ id: p + i, label: String.fromCharCode(65 + i), out: out === i }));
const FIXTURE = () => ({
  buildings: [{ id: 'b1', name: 'Main House' }],
  rooms: [
    { id: 'r1', buildingId: 'b1', name: '101', style: 'male', notes: '', beds: beds('m', 4) },
    { id: 'r2', buildingId: 'b1', name: '102', style: 'female', notes: '', beds: beds('f', 4, 3) },   // bed D out of use
  ],
  bookings: [
    { id: 'k1', category: 'speaker', name: 'Pastor Example', from: day(-1), to: day(3), males: 1, females: 0, count: 1, family: false, bedIds: ['m0'], notes: '', tripId: '', permanent: false },
  ],
  trips: [
    { tripId: 'tt1', name: 'Example Church', country: 'Nowhere', from: day(1), to: day(6), size: 4, males: 2, females: 2, pending: true, portalStage: 'docs', candidateId: 'cd1', people: [{ name: 'Lee Leader', sex: '' }, { name: 'Max Member', sex: 'm' }, { name: 'Fay Member', sex: 'f' }, { name: 'Gia Member', sex: 'f' }] },
    { tripId: 'tt2', name: 'Huge Example Base', country: '', from: day(20), to: day(30), size: 30, males: 15, females: 15, pending: false, portalStage: '', candidateId: '' },
  ],
});

const browser = await chromium.launch({ executablePath: CHROMIUM });
async function open(who, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 900 } });
  await pinClock(ctx, NOW);
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_CERT|ERR_CONNECTION/.test(m.text())) errors.push('console: ' + m.text()); });
  const H = FIXTURE(); let n = 0;
  if (opts.extra) H.bookings.push(...opts.extra);
  const hospOut = () => ({ ok: true, campus: 'siemreap', buildings: H.buildings, rooms: H.rooms, bookings: H.bookings,
    requests: H.trips.map(q => ({ ...q, bookingId: (H.bookings.find(k => k.tripId === q.tripId) || {}).id || '' })) });
  await ctx.route('**/.netlify/functions/api', r => {
    const b = JSON.parse(r.request().postData() || '{}'); sent.push(b);
    let out = { ok: true };
    if (b.fn === 'getMyBoot') out = { ok: true, staff: who, profile: {}, roster: [HANA, ADMIN, KIM], logs: [], habits: null, mentees: [], mentorRequests: [],
      goals: [], checkins: [], ministry: { ok: true, campus: 'siemreap', dept: who.dept, ministry: who.ministry, entries: {}, daily: {}, prev: {}, pins: [] }, personal: { ok: true, entries: {} },
      trips: { ok: true, trips: [], totals: {}, reasons: { work: [], personal: [] }, hasMentor: false }, tripRequests: [],
      base: { leader: false, entries: { siemreap: {} }, okrs: [], survey: [], metricOverrides: [] } };
    else if (b.fn === 'getData') out = { entries: {}, okrs: [], survey: [] };
    else if (b.fn === 'getHospitality') out = who.hospitality ? hospOut() : { ok: false, err: 'not_authorized' };
    else if (b.fn === 'hospSave') {
      const kind = b.args[2], rec = { ...b.args[3] };
      const list = kind === 'building' ? H.buildings : kind === 'room' ? H.rooms : H.bookings;
      if (!rec.id) rec.id = kind[0] + 'new' + (++n);
      if (kind === 'room') rec.beds = rec.beds.map((x, i) => ({ ...x, id: x.id || rec.id + '_' + i }));
      const i = list.findIndex(x => x.id === rec.id); if (i > -1) list[i] = rec; else list.push(rec);
      out = { ...hospOut(), saved: rec };
    }
    else if (b.fn === 'hospStaffBeds') {
      const map = b.args[2];
      Object.keys(map).forEach(id => {
        const i = H.bookings.findIndex(k => k.category === 'staff' && k.permanent && k.bedIds.length === 1 && k.bedIds[0] === id);
        if (i > -1 && H.bookings[i].name !== map[id]) H.bookings.splice(i, 1);
        if (map[id] && !H.bookings.some(k => k.category === 'staff' && k.permanent && k.bedIds[0] === id)) H.bookings.push({ id: 'ks' + (++n), category: 'staff', name: map[id], from: day(0), to: '', permanent: true, males: 0, females: 0, count: 1, family: false, bedIds: [id], bedNames: {}, notes: '', tripId: '' });
      });
      out = hospOut();
    }
    else if (b.fn === 'hospMoveBed') {
      const [id, from, to] = b.args.slice(2), A = H.bookings.find(k => k.id === id);
      const B = to && H.bookings.find(k => k.id !== id && k.bedIds.includes(to) && k.from < A.to && A.from < k.to);
      if (B) B.bedIds = B.bedIds.map(x => x === to ? from : x);
      A.bedIds = from ? A.bedIds.map(x => x === from ? to : x).filter(Boolean) : A.bedIds.concat([to]);
      out = hospOut();
    }
    else if (b.fn === 'hospImport') out = { ...hospOut(), imported: { buildings: 1, rooms: 3, beds: 9, people: 5, skipped: [{ name: 'Taken Example', room: '102', with: 'Someone' }] } };
    else if (b.fn === 'hospDelete') { const kind = b.args[2]; const key = kind + 's'; H[key] = H[key].filter(x => x.id !== b.args[3]); out = hospOut(); }
    else if (b.fn === 'getMinistryFor') out = { ok: true, campus: 'siemreap', dept: b.args[2], ministry: b.args[3], entries: {}, daily: {}, prev: {}, pins: [] };
    else if (/^getMy/.test(b.fn)) out = { ok: true, logs: [], goals: [], checkins: [], mentees: [], requests: [] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(u => localStorage.setItem('gp-staff', JSON.stringify({ user: u, pin: '1234' })), who.username);
  await page.goto('http://localhost:4497/teams.html', { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 15000 });
  await page.waitForTimeout(400);
  return { ctx, page, errors, sent, H };
}
const menuItems = async (page) => { await page.click('#menuBtn'); await page.waitForTimeout(200);
  const ids = await page.$$eval('[data-menu-item]', bs => bs.map(b => b.getAttribute('data-menu-item'))); await page.click('#menuCloseBtn'); await page.waitForTimeout(150); return ids; };
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
const tile = (page, id) => page.$eval('[data-hosptile="' + id + '"] .mmTileNum', e => e.textContent.trim());

console.log('=== who gets in ===');
{
  const { ctx, page } = await open(KIM);
  ok('another ministry has no SR Hospitality in the menu', !(await menuItems(page)).includes('hosp'));
  await page.click('#goMinistryFromMe'); await page.waitForTimeout(400);
  ok('… nor a button on My Ministry', !(await page.$('#goHosp')));
  await ctx.close();
}
{
  const { ctx, page, errors } = await open(ADMIN);
  ok('an admin has SR Hospitality in the menu', (await menuItems(page)).includes('hosp'));
  await page.click('#menuBtn'); await page.waitForTimeout(150);
  await page.click('[data-menu-item="hosp"]'); await page.waitForTimeout(500);
  ok('… and it opens the page', !!(await page.$('#hospPage .hospTabs')));
  ok('no errors (admin)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== a Hospitality member, on a phone ===');
const { ctx, page, errors, sent, H } = await open(HANA);
ok('the menu has SR Hospitality', (await menuItems(page)).includes('hosp'));
await page.click('#goMinistryFromMe'); await page.waitForTimeout(400);
ok('My Ministry has the button', !!(await page.$('#goHosp')));
await page.click('#goHosp'); await page.waitForTimeout(500);
ok('it loads the book once', sent.filter(b => b.fn === 'getHospitality').length === 1);
ok('the overview has a New booking button for quick access', !!(await page.$('[data-hosptab="dash"].on')) && !!(await page.$('#hospNewBtn')));
ok('tonight: one here, of seven beds in use (one is out)', await tile(page, 'tonight') === '1' && await tile(page, 'free') === '6', [await tile(page, 'tonight'), await tile(page, 'free')].join());
ok('two team requests waiting', await tile(page, 'requests') === '2');
ok('the Requests tab carries the count', /2/.test(await page.$eval('[data-hosptab="req"]', b => b.textContent)));
let rows = await page.$$eval('[data-hospbucket]', rs => rs.length);
ok('months: twelve bars for the year', rows === 12, rows);
await page.click('[data-hospperiod="week"]'); await page.waitForTimeout(200);
rows = await page.$$eval('[data-hospbucket]', rs => rs.map(r => ({ pct: +r.dataset.pct, req: +r.dataset.req, now: r.classList.contains('now') })));
ok('weeks: twelve, this one first and marked', rows.length === 12 && rows[0].now, JSON.stringify(rows.slice(0, 2)));
ok('this week shows the speaker and the requested team on top', rows[0].pct > 0 && rows[0].req > 0, JSON.stringify(rows[0]));
await page.click('[data-hospperiod="quarter"]'); await page.waitForTimeout(200);
ok('quarters: four', (await page.$$('[data-hospbucket]')).length === 4);
ok('the busiest and quietest season are named', /Busiest: Q4/.test(await page.$eval('#hospSeason', e => e.textContent)), await page.$eval('#hospSeason', e => e.textContent));
ok('no sideways scroll on the dashboard', !(await overflow(page)));

await page.click('[data-hosptab="req"]'); await page.waitForTimeout(200);
const fits = await page.$$eval('[data-hospreq]', cs => cs.map(c => ({ id: c.dataset.hospreq, fit: (c.querySelector('[data-fit]') || {}).dataset?.fit, pending: !!c.querySelector('[data-pending]') })));
ok('the small team fits and is pending; the big one is short', fits[0].id === 'tt1' && fits[0].fit === 'yes' && fits[0].pending && fits[1].fit === 'no' && !fits[1].pending, JSON.stringify(fits));
ok('the short one says by how much', /Short by 23 beds/.test(await page.$eval('[data-hospreq="tt2"]', c => c.textContent)), await page.$eval('[data-hospreq="tt2"] [data-fit]', c => c.textContent));
await page.click('[data-hospbookreq="tt1"]'); await page.waitForTimeout(300);
const form = await page.evaluate(() => ({ name: document.querySelector('[data-hf="name"]').value, from: document.querySelector('[data-hf="from"]').value,
  to: document.querySelector('[data-hf="to"]').value, males: document.querySelector('[data-hf="males"]').value, cat: document.querySelector('[data-hfcat]:checked').dataset.hfcat }));
ok('Book beds fills the booking from the team', form.name === 'Example Church' && form.from === day(1) && form.to === day(6) && form.males === '2' && form.cat === 'team', JSON.stringify(form));
ok('the speaker’s bed is taken those nights', await page.$eval('[data-hbed="m0"]', b => b.disabled && b.classList.contains('taken')));
ok('the bed out of use can’t be picked', await page.$eval('[data-hbed="f3"]', b => b.disabled && b.classList.contains('out')));
await page.click('#hospAutoBtn'); await page.waitForTimeout(200);
const picked = await page.$$eval('.hospBed.sel', bs => bs.map(b => b.dataset.hbed));
ok('Pick beds for me: two men in 101, two women in 102', picked.length === 4 && picked.filter(id => id[0] === 'm').length === 2 && picked.filter(id => id[0] === 'f').length === 2 && !picked.includes('m0'), picked.join());
ok('no gender warning', !(await page.$('#hospWarn')));
ok('with all four beds picked, the other free beds grey out so nobody over-books', !!(await page.$('#hospBedsFull')) &&
  await page.$eval('[data-hbed="m3"]', b => b.disabled && b.classList.contains('full')) && await page.$eval('[data-hbed="f2"]', b => b.disabled && b.classList.contains('full')));
await page.click('[data-hbed="' + picked.filter(id => id[0] === 'f')[0] + '"]'); await page.waitForTimeout(100);
ok('… take one woman’s bed off and the women’s beds open again, the men’s stay grey (2 of 2 men picked)', /Men’s beds 2 of 2 · Women’s beds 1 of 2/.test(await page.$eval('#hospBedsQuota', e => e.textContent)) &&
  await page.$eval('[data-hbed="f2"]', b => !b.disabled && b.classList.contains('free')) && await page.$eval('[data-hbed="m3"]', b => b.disabled && b.classList.contains('full')), await page.$eval('#hospBedsQuota', e => e.textContent));
await page.click('[data-hbed="' + picked.filter(id => id[0] === 'f')[0] + '"]'); await page.waitForTimeout(100);
const kinds = await page.$$eval('.hospKind', k => k.map(x => x.textContent.trim().replace(/^\S+ /, '') + (x.querySelector('input').checked ? '*' : '')));
ok('beside the name, tick-boxes: Staff, Student, Team (ticked), Guest / speaker', kinds.join(' | ') === 'Staff | Student | Team* | Guest / speaker', kinds.join(' | '));
ok('Who sleeps where: a box for each picked bed, with the team’s names from the portal to choose from', (await page.$$('[data-hbname]')).length === 4 && (await page.$$eval('#hospPeopleList option', o => o.map(x => x.value))).join() === 'Lee Leader,Max Member,Fay Member,Gia Member' && /Not in a bed yet: Lee Leader, Max Member, Fay Member, Gia Member/.test(await page.$eval('#hospNamesLeft', e => e.textContent)));
await page.fill('[data-hbname="' + picked[0] + '"]', 'Max Member'); await page.dispatchEvent('[data-hbname="' + picked[0] + '"]', 'change'); await page.waitForTimeout(150);
ok('a name typed in a bed is taken off the waiting list', /Not in a bed yet: Lee Leader, Fay Member, Gia Member$/.test(await page.$eval('#hospNamesLeft', e => e.textContent.trim())));
await page.click('#hospNamesAuto'); await page.waitForTimeout(150);
ok('Fill the beds in order puts everyone else in a bed', !(await page.$('#hospNamesLeft')) && (await page.$$eval('[data-hbname]', i => i.filter(x => x.value).length)) === 4);
const placed = await page.$$eval('[data-hbname]', i => Object.fromEntries(i.map(x => [x.dataset.hbname, x.value])));
ok('… women in the women’s room', ['Fay Member', 'Gia Member'].every(n => Object.keys(placed).filter(id => id[0] === 'f').map(id => placed[id]).includes(n)), JSON.stringify(placed));
ok('no sideways scroll on the booking form', !(await overflow(page)));
await page.click('#hospSaveBtn'); await page.waitForTimeout(400);
const save = sent.filter(b => b.fn === 'hospSave').pop();
ok('it saves a team booking linked to the request', save && save.args[2] === 'booking' && save.args[3].tripId === 'tt1' && save.args[3].bedIds.length === 4 && save.args[3].count === 4, JSON.stringify(save && save.args[3]));
ok('… with who sleeps in each bed', Object.keys(save.args[3].bedNames).length === 4 && save.args[3].bedNames[picked[0]] === 'Max Member' && Object.values(save.args[3].bedNames).sort().join() === 'Fay Member,Gia Member,Lee Leader,Max Member', JSON.stringify(save.args[3].bedNames));
await page.click('[data-hosptab="cal"]'); await page.waitForTimeout(200);
await page.click('[data-hospcalmode="board"]'); await page.waitForTimeout(200);
await page.fill('#hospBoardDay', day(2)); await page.dispatchEvent('#hospBoardDay', 'change'); await page.waitForTimeout(250);
ok('on the bed board each of them shows as “Name (Team)”', /Max Member \(Example Church\)/.test(await page.$eval('[data-hboard="' + picked[0] + '"]', e => e.textContent)), await page.$eval('[data-hboard="' + picked[0] + '"]', e => e.textContent));
await page.click('[data-hospcalmode="cal"]').catch(() => {}); await page.click('[data-hosptab="req"]'); await page.waitForTimeout(200);
ok('the request now says booked', !!(await page.$('[data-hospreq="tt1"] [data-booked]')));
ok('one request left waiting', /1/.test(await page.$eval('[data-hosptab="req"]', b => b.textContent)));

console.log('=== a new booking by hand ===');
await page.click('[data-hosptab="book"]'); await page.waitForTimeout(200);
ok('the bookings list shows here-and-coming', (await page.$$('[data-hospedit]')).length === 2);
await page.click('#hospNewBtn'); await page.waitForTimeout(200);
await page.click('[data-hfcat="staff"]'); await page.waitForTimeout(100);
ok('ticking Staff makes it a staff booking (and offers Permanent)', await page.$eval('[data-hfcat="staff"]', i => i.checked) && !(await page.$eval('[data-hfcat="guest"]', i => i.checked)) && !!(await page.$('[data-hfchk="permanent"]')));
await page.click('[data-hfcat="guest"]'); await page.waitForTimeout(100);
ok('ticking another moves the tick — one at a time', await page.$eval('[data-hfcat="guest"]', i => i.checked) && !(await page.$eval('[data-hfcat="staff"]', i => i.checked)));
await page.fill('[data-hf="name"]', 'Guest Example');
await page.fill('[data-hf="from"]', day(2)); await page.dispatchEvent('[data-hf="from"]', 'change'); await page.waitForTimeout(100);
await page.fill('[data-hf="to"]', day(4)); await page.dispatchEvent('[data-hf="to"]', 'change'); await page.waitForTimeout(100);
await page.fill('[data-hf="females"]', '1'); await page.dispatchEvent('[data-hf="females"]', 'change'); await page.waitForTimeout(150);
ok('the team’s beds are taken those nights now', await page.$eval('[data-hbed="f0"]', b => b.disabled));
await page.click('[data-hbed="m3"]'); await page.waitForTimeout(100);
ok('a woman in the men’s room gets a warning', !!(await page.$('#hospWarn')));
await page.click('[data-hbed="m3"]'); await page.click('[data-hbed="f2"]'); await page.waitForTimeout(100);
ok('… which goes when she’s moved', !(await page.$('#hospWarn')));
ok('with only Women filled in, nothing greys by gender — just the total: her one bed is picked, the rest grey', !(await page.$('#hospBedsQuota')) && !!(await page.$('#hospBedsFull')) &&
  await page.$eval('[data-hbed="m3"]', b => b.disabled && b.classList.contains('full')));
await page.fill('[data-hf="males"]', '1'); await page.dispatchEvent('[data-hf="males"]', 'change'); await page.waitForTimeout(150);
ok('Men 1 and Women 1: her bed fills the women’s quota and the men’s room opens up', /Men’s beds 0 of 1 · Women’s beds 1 of 1/.test(await page.$eval('#hospBedsQuota', e => e.textContent)) &&
  await page.$eval('[data-hbed="m3"]', b => !b.disabled && b.classList.contains('free')), await page.$eval('#hospBedsQuota', e => e.textContent));
await page.fill('[data-hf="males"]', ''); await page.dispatchEvent('[data-hf="males"]', 'change'); await page.waitForTimeout(150);
await page.click('#hospSaveBtn'); await page.waitForTimeout(300);
const g = sent.filter(b => b.fn === 'hospSave').pop().args[3];
ok('the guest is saved with her bed', g.category === 'guest' && g.name === 'Guest Example' && g.bedIds.join() === 'f2' && g.count === 1, JSON.stringify(g));
await page.click('[data-hospcat="speaker"]'); await page.waitForTimeout(150);
ok('the category filter narrows the list', (await page.$$eval('[data-hospedit]', bs => bs.map(b => b.textContent))).every(t => /Pastor Example/.test(t)));

console.log('=== rooms ===');
await page.click('[data-hosptab="rooms"]'); await page.waitForTimeout(200);
ok('the building and its rooms are listed', /Main House/.test(await page.$eval('[data-hospbld="b1"]', e => e.textContent)) && (await page.$$('[data-hosproom]')).length === 2);
await page.click('#hospAddBld'); await page.fill('#hospBldName', 'Guest House'); await page.click('#hospBldSave'); await page.waitForTimeout(300);
ok('a building is added', H.buildings.some(b => b.name === 'Guest House'));
const nb = H.buildings.find(b => b.name === 'Guest House').id;
await page.click('[data-hospaddroom="' + nb + '"]'); await page.waitForTimeout(200);
await page.fill('[data-hrf="name"]', '201'); await page.selectOption('[data-hrf="style"]', 'couple');
await page.click('#hospAddBed'); await page.waitForTimeout(100);
ok('a new room starts with two beds and Add a bed adds C', (await page.$$('[data-hrbed]')).length === 3 && await page.$eval('[data-hrbed="2"]', i => i.value) === 'C');
await page.click('[data-hrdel="2"]'); await page.waitForTimeout(100);
await page.click('#hospRoomSave'); await page.waitForTimeout(300);
const room = sent.filter(b => b.fn === 'hospSave').pop().args;
ok('the room is saved with its building, style and beds', room[2] === 'room' && room[3].buildingId === nb && room[3].style === 'couple' && room[3].beds.map(b => b.label).join() === 'A,B', JSON.stringify(room[3]));
ok('the new building can’t be deleted now it has a room', !(await page.$('[data-hospbldel="' + nb + '"]')));
ok('no sideways scroll on Rooms', !(await overflow(page)));
ok('no errors (phone)', errors.length === 0, errors.join(' | '));
await ctx.close();

console.log('=== the calendar ===');
const UNPLACED = { id: 'k2', category: 'volunteer', name: 'Volunteer Example', from: day(0), to: day(2), males: 3, females: 0, count: 3, family: false, bedIds: ['m2'], notes: '', tripId: '', permanent: false };
{
  const { ctx, page, errors, sent } = await open(HANA, { extra: [UNPLACED] });
  await page.click('#menuBtn'); await page.waitForTimeout(150);
  await page.click('[data-menu-item="hosp"]'); await page.waitForTimeout(500);
  await page.click('[data-hosptab="cal"]'); await page.waitForTimeout(200);
  const cal = await page.evaluate(() => ({
    days: [].map.call(document.querySelectorAll('[data-hospday]'), d => d.dataset.hospday),
    today: (document.querySelector('.hospCalDay.today') || {}).dataset?.hospday,
    pastor: (document.querySelector('[data-calbar="k1"]') || {}).style?.gridColumn,
    cont: document.querySelector('[data-calbar="k1"]')?.classList.contains('cont'),
    bars: document.querySelectorAll('[data-calbar="k2"]').length,
    waitText: [].map.call(document.querySelectorAll('[data-calbar="k2"]'), b => b.textContent),
    pct: (document.querySelector('.hospCalDay.today') || {}).dataset?.pct,
  }));
  ok('fourteen days from this Monday, today marked', cal.days.length === 14 && cal.days[0] === day(0) && cal.today === day(0), JSON.stringify(cal.days.slice(0, 2)));
  ok('the speaker is a bar on his bed from before the window to the morning he leaves', cal.pastor === '2 / 5' && cal.cont, cal.pastor);
  ok('a booking with beds still to pick also sits in “No bed yet”', cal.bars === 2 && cal.waitText.some(x => /×2/.test(x)), JSON.stringify(cal.waitText));
  ok('each day says how full it is', cal.pct === String(Math.round(4 / 7 * 100)), cal.pct);
  ok('the calendar scrolls inside its card, not the page', !(await overflow(page)));
  await page.click('#hospCalNext'); await page.waitForTimeout(150);
  ok('› moves a week on', await page.$eval('[data-hospday]', d => d.dataset.hospday) === day(7) && !!(await page.$('#hospCalToday')));
  await page.click('#hospCalToday'); await page.waitForTimeout(150);
  await page.click('[data-calbar="k1"]'); await page.waitForTimeout(200);
  ok('tapping a bar opens the booking', await page.$eval('[data-hf="name"]', i => i.value) === 'Pastor Example');
  await page.click('#hospCancelBtn'); await page.waitForTimeout(150);
  ok('… and Cancel comes back to the calendar', !!(await page.$('#hospCal')));

  console.log('=== the bed board ===');
  await page.click('[data-hospcalmode="board"]'); await page.waitForTimeout(200);
  const occ = () => page.$$eval('[data-hboard]', bs => Object.fromEntries(bs.map(b => [b.dataset.hboard, b.dataset.hmove || ''])));
  let o = await occ();
  ok('tonight: who is in which bed', o.m0 === 'k1' && o.m2 === 'k2' && o.m1 === '', JSON.stringify(o));
  ok('people still without a bed wait at the top', /Volunteer Example ×2/.test(await page.$eval('.hospWait', e => e.textContent)));
  await page.click('[data-hboard="m0"]'); await page.waitForTimeout(150);
  ok('tapping a person picks them up', !!(await page.$('#hospMoveBar')) && await page.$eval('[data-hboard="m0"]', b => b.classList.contains('moving')));
  await page.click('[data-hboard="m1"]'); await page.waitForTimeout(300);
  let mv = sent.filter(b => b.fn === 'hospMoveBed').pop();
  ok('… and tapping an empty bed moves them there', mv && mv.args.slice(2).join() === 'k1,m0,m1' && (await occ()).m1 === 'k1', JSON.stringify(mv && mv.args));
  await page.click('[data-hboard="m1"]'); await page.waitForTimeout(150);
  await page.click('[data-hboard="m2"]'); await page.waitForTimeout(300);
  o = await occ();
  ok('tapping someone else’s bed swaps the two', o.m2 === 'k1' && o.m1 === 'k2', JSON.stringify(o));
  await page.click('.hospWho[data-hmove="k2"]'); await page.waitForTimeout(150);
  await page.click('[data-hboard="f0"]'); await page.waitForTimeout(300);
  mv = sent.filter(b => b.fn === 'hospMoveBed').pop();
  ok('someone waiting is put in a bed the same way', mv.args.slice(2).join() === 'k2,,f0' && (await occ()).f0 === 'k2');
  await page.click('[data-hboard="m2"]'); await page.waitForTimeout(150);
  await page.click('#hospMoveOff'); await page.waitForTimeout(300);
  mv = sent.filter(b => b.fn === 'hospMoveBed').pop();
  ok('Take off this bed frees it', mv.args.slice(2).join() === 'k1,m2,' && (await occ()).m2 === '');
  await page.click('[data-hboard="f0"]'); await page.waitForTimeout(150);
  await page.click('#hospMoveCancel'); await page.waitForTimeout(150);
  ok('Cancel puts them down without a move', !(await page.$('#hospMoveBar')) && sent.filter(b => b.fn === 'hospMoveBed').length === 4);
  await page.click('#hospBoardNext'); await page.waitForTimeout(200);
  ok('› shows the next night', await page.$eval('#hospBoardDay', i => i.value) === day(1) && !!(await page.$('#hospBoardToday')));
  ok('no sideways scroll on the bed board', !(await overflow(page)));
  ok('no errors (calendar + board)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== uploading the rooms sheet ===');
{
  // the base's sheet, in its own layout (made-up names): a dorm block, a family room with its total, Peace House units
  const SHEET = [
    'First floor,,,,,,,,Family,,,,Floor,Peace House,,Parent,Kid,People',
    'Boys Room 102(students),,,Girl Room 205,,,Example house 201,,Couple - R402,,,,Floor 0,Unit 1,,,,',
    '6 Bunk,,,Bunk 6,,,Parent,2,Parent,,,,Floor 1,Unit 2,Example family,2,1,3',
    'Student Example,A,,,A,,kid,1,Kid,,,,,,,,,',
    'Staff Example (Staff),B,,,B,,Total:,3,Total:,0,,,,,,,,',
    ',C,,,C,,,,,,,,,,,,,',
  ].join('\n');
  const { ctx, page, errors, sent } = await open(HANA);
  await page.click('#menuBtn'); await page.waitForTimeout(150);
  await page.click('[data-menu-item="hosp"]'); await page.waitForTimeout(500);
  await page.click('[data-hosptab="rooms"]'); await page.waitForTimeout(200);
  ok('Rooms has the sheet upload, with no template to fill in', /Upload your rooms sheet/.test(await page.$eval('#hospImportCard', e => e.textContent)) && !(await page.$('#hospCsvTemplate')));
  await page.setInputFiles('#hospCsvFile', { name: 'rooms.csv', mimeType: 'text/csv', buffer: Buffer.from(SHEET) });
  await page.waitForTimeout(300);
  ok('it reads the sheet as it is and says what it found', /2 buildings, 6 rooms, 12 beds, 4 people/.test(await page.$eval('#hospImportPreview', e => e.textContent)), await page.$eval('#hospImportCard', e => e.textContent));
  await page.click('#hospImportGo'); await page.waitForTimeout(400);
  const rows = (sent.filter(b => b.fn === 'hospImport').pop() || { args: [] }).args[2] || [];
  const at = (room, bed) => rows.find(r => r.room === room && r.bed === bed) || {};
  ok('a dorm’s names go to their bed letters, (staff) makes staff, others students', at('102', 'A').name === 'Student Example' && at('102', 'A').category === 'student' && at('102', 'B').name === 'Staff Example' && at('102', 'B').category === 'staff' && at('102', 'A').style === 'male' && at('102', 'A').building === 'Old Base', JSON.stringify(rows.slice(0, 3)));
  ok('an empty bed comes along empty', at('102', 'C').name === '' && at('205', 'A').style === 'female');
  ok('a family room fills as many beds as its total, as one family', ['A', 'B', 'C'].every(l => at('201', l).name === 'Example house' && at('201', l).style === 'family') && !at('201', 'D').room);
  ok('an empty couple room adds no one', rows.filter(r => r.room === '402').every(r => !r.name) && rows.find(r => r.room === '402').style === 'couple');
  ok('Peace House units: the family and how many', ['A', 'B', 'C'].every(l => at('Unit 2', l).name === 'Example family' && at('Unit 2', l).building === 'Peace House') && rows.some(r => r.room === 'Unit 1' && !r.name));
  ok('it says what was added and who was left out', /Added 1 buildings, 3 rooms, 9 beds and 5 people/.test(await page.$eval('#hospImportDone', e => e.textContent)) && /Taken Example/.test(await page.$eval('#hospImportCard', e => e.textContent)));
  ok('no errors (upload)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== desktop ===');
{
  const { ctx, page, errors, sent } = await open(HANA, { viewport: { width: 1280, height: 900 } });
  await page.click('#menuBtn'); await page.waitForTimeout(150);
  await page.click('[data-menu-item="hosp"]'); await page.waitForTimeout(500);
  ok('desktop: dashboard renders without sideways scroll', !!(await page.$('#hospChart')) && !(await overflow(page)));
  ok('desktop: SR Hospitality takes the width, not the phone column', await page.$eval('main', m => m.classList.contains('wide') && m.getBoundingClientRect().width > 1000), await page.$eval('main', m => m.getBoundingClientRect().width));
  ok('desktop: the tiles sit four across', await page.$eval('.mmGrid', g => getComputedStyle(g).gridTemplateColumns.split(' ').length === 4));
  await page.click('[data-hosptab="book"]'); await page.waitForTimeout(150);
  ok('desktop: bookings sit in columns', await page.$eval('#hospList', g => getComputedStyle(g).display === 'grid' && getComputedStyle(g).gridTemplateColumns.split(' ').length >= 2));
  await page.click('[data-hosptab="dash"]'); await page.waitForTimeout(150);
  await page.click('[data-hosptab="req"]'); await page.waitForTimeout(150);
  await page.click('[data-hospbookreq="tt1"]'); await page.waitForTimeout(200);
  ok('desktop: the bed picker fits', !(await overflow(page)) && (await page.$$('[data-hbed]')).length === 8);
  await page.click('#hospCancelBtn'); await page.waitForTimeout(150);
  await page.click('[data-hosptab="cal"]'); await page.waitForTimeout(150);
  ok('desktop: the calendar fits the page', !(await overflow(page)) && await page.$eval('.hospCalScroll', e => e.scrollWidth <= e.clientWidth + 1));
  await page.click('[data-hospcalmode="board"]'); await page.waitForTimeout(150);
  await page.dragAndDrop('[data-hboard="m0"]', '[data-hboard="m3"]'); await page.waitForTimeout(300);
  ok('desktop: dragging a person to an empty bed moves them', sent.filter(b => b.fn === 'hospMoveBed').pop()?.args.slice(2).join() === 'k1,m0,m3');
  await page.click('#hospBack'); await page.waitForTimeout(300);
  ok('desktop: the rest of the app keeps its column', await page.$eval('main', m => !m.classList.contains('wide')));
  ok('no errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== a school: its students, in their beds ===');
{
  const { ctx, page, errors, sent } = await open(HANA);
  await page.click('#goMinistryFromMe'); await page.waitForTimeout(300);
  await page.click('#goHosp'); await page.waitForTimeout(500);
  await page.click('[data-hosptab="book"]'); await page.click('#hospNewBtn'); await page.waitForTimeout(200);
  ok('a guest booking has no people list', !(await page.$('#hospPeople')));
  await page.click('[data-hfcat="student"]'); await page.waitForTimeout(150);
  ok('ticking Student opens a people list for a school', !!(await page.$('#hospPeople')) && /Students in this booking/.test(await page.$eval('#hospFormCard', e => e.textContent)));
  await page.fill('[data-hf="name"]', 'DTS Example');
  await page.fill('[data-hf="from"]', day(-3)); await page.dispatchEvent('[data-hf="from"]', 'change'); await page.waitForTimeout(100);
  await page.fill('[data-hf="to"]', day(80)); await page.dispatchEvent('[data-hf="to"]', 'change'); await page.waitForTimeout(150);
  await page.click('#hospPersonAdd'); await page.waitForTimeout(100);
  await page.fill('[data-hpname="0"]', 'Sam Student'); await page.click('[data-hpsex="0|m"]'); await page.waitForTimeout(100);
  await page.click('#hospPasteOpen'); await page.waitForTimeout(100);
  await page.fill('#hospPasteText', '1. Tia Student (f)\n- Uma Student f\nVic Student, M\n\nSam Student');
  await page.click('#hospPasteAdd'); await page.waitForTimeout(150);
  const ppl = await page.$$eval('.hospPerson', r => r.map(x => x.querySelector('input').value + ':' + ((x.querySelector('.hospSex .on') || {}).textContent || '')));
  ok('students are added one by one or pasted as a list — numbers, dashes and (f)/M marks read, repeats dropped', ppl.join() === 'Sam Student:M,Tia Student:F,Uma Student:F,Vic Student:M', ppl.join());
  ok('the men / women / beds follow the list', await page.$eval('[data-hf="males"]', i => i.value) === '2' && await page.$eval('[data-hf="females"]', i => i.value) === '2' && await page.$eval('[data-hf="count"]', i => i.value) === '4');
  await page.click('#hospAutoBtn'); await page.waitForTimeout(200);
  const names = await page.$$eval('[data-hbname]', i => Object.fromEntries(i.map(x => [x.dataset.hbname, x.value])));
  ok('Pick beds for me picks four beds and puts the students in them — men in the men’s room, women in the women’s', Object.keys(names).length === 4 && Object.keys(names).filter(id => id[0] === 'm').map(id => names[id]).sort().join() === 'Sam Student,Vic Student' && Object.keys(names).filter(id => id[0] === 'f').map(id => names[id]).sort().join() === 'Tia Student,Uma Student', JSON.stringify(names));
  await page.click('[data-hpdel="3"]'); await page.waitForTimeout(150);
  ok('taking a student off the list takes them out of their bed', !(await page.$$eval('[data-hbname]', i => i.map(x => x.value))).includes('Vic Student') && await page.$eval('[data-hf="males"]', i => i.value) === '1');
  await page.click('#hospSaveBtn'); await page.waitForTimeout(300);
  const sv = sent.filter(b => b.fn === 'hospSave').pop().args[3];
  ok('the school is saved with its students and who is in which bed', sv.category === 'student' && sv.name === 'DTS Example' && sv.people.map(p => p.name + ':' + p.sex).join() === 'Sam Student:m,Tia Student:f,Uma Student:f' && Object.values(sv.bedNames).sort().join() === 'Sam Student,Tia Student,Uma Student', JSON.stringify(sv));
  ok('the booking says how many are named', /3 named/.test(await page.$eval('#hospList', e => e.textContent)));
  // a team: the names from its portal in one tap
  await page.click('[data-hosptab="req"]'); await page.waitForTimeout(200);
  await page.click('[data-hospbookreq="tt1"]'); await page.waitForTimeout(250);
  ok('a team gets the same list, with its portal names a tap away', /The 4 names from their portal/.test(await page.$eval('#hospFromPortal', e => e.textContent)));
  await page.click('#hospFromPortal'); await page.waitForTimeout(150);
  ok('… which adds them, with man / woman where the portal says', (await page.$$eval('.hospPerson', r => r.map(x => x.querySelector('input').value + ':' + ((x.querySelector('.hospSex .on') || {}).textContent || '')))).join() === 'Lee Leader:,Max Member:M,Fay Member:F,Gia Member:F' && !(await page.$('#hospFromPortal')));
  ok('no sideways scroll; no errors', !(await overflow(page)) && errors.length === 0, errors.join(' | '));
  await ctx.close();
}

console.log('=== staff beds ===');
{
  const { ctx, page, errors, sent, H } = await open(HANA, { extra: [{ id: 'kst', category: 'staff', name: 'Kim Example', from: day(-100), to: '', permanent: true, males: 0, females: 0, count: 1, family: false, bedIds: ['m3'], notes: '', tripId: '' }] });
  await page.click('#goMinistryFromMe'); await page.waitForTimeout(300);
  await page.click('#goHosp'); await page.waitForTimeout(500);
  await page.click('[data-hosptab="staff"]'); await page.waitForTimeout(300);
  ok('a Staff beds tab: every bed with a name box; staff already living here are filled in', (await page.$$('[data-hstaff]')).length >= 5 && await page.$eval('[data-hstaff="m3"]', i => i.value) === 'Kim Example');
  ok('a bed someone else has shows who, and can’t be typed in', /Pastor Example/.test(await page.$eval('[data-staffheld="m0"]', e => e.textContent)) && !(await page.$('[data-hstaff="m0"]')));
  ok('the names to pick from are the campus staff', (await page.$$eval('#hospStaffList option', o => o.map(x => x.value))).includes('Hana Example'));
  ok('nothing to save yet', await page.$eval('#hospStaffSave', b => b.disabled));
  await page.fill('[data-hstaff="f0"]', 'Hana Example');
  await page.fill('[data-hstaff="m3"]', '');
  ok('typing a name lets you save', !(await page.$eval('#hospStaffSave', b => b.disabled)));
  await page.click('#hospStaffSave'); await page.waitForTimeout(400);
  const sv = sent.filter(b => b.fn === 'hospStaffBeds').pop();
  ok('Save sends who is in every bed it shows (and the one emptied)', sv && sv.args[2].f0 === 'Hana Example' && sv.args[2].m3 === '' && !('m0' in sv.args[2]), JSON.stringify(sv && sv.args[2]));
  ok('… and the beds show it', await page.$eval('[data-hstaff="f0"]', i => i.value) === 'Hana Example' && await page.$eval('[data-hstaff="m3"]', i => i.value) === '' && await page.$eval('#hospStaffSave', b => b.disabled));
  await page.click('[data-hosptab="cal"]'); await page.waitForTimeout(200);
  await page.click('[data-hospcalmode="board"]'); await page.waitForTimeout(250);
  ok('the staff bed is taken on the bed board', /Hana Example/.test(await page.$eval('[data-hboard="f0"]', e => e.textContent)));
  await page.click('[data-hosptab="book"]'); await page.click('#hospNewBtn'); await page.waitForTimeout(200);
  await page.fill('[data-hf="name"]', 'Guest'); await page.fill('[data-hf="from"]', day(40)); await page.dispatchEvent('[data-hf="from"]', 'change'); await page.waitForTimeout(100);
  await page.fill('[data-hf="to"]', day(42)); await page.dispatchEvent('[data-hf="to"]', 'change'); await page.waitForTimeout(200);
  ok('… and in the bed picker, even months ahead', await page.$eval('[data-hbed="f0"]', b => b.disabled && b.classList.contains('taken')));
  ok('no sideways scroll; no errors', !(await overflow(page)) && errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
