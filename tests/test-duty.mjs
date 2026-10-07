/* Weekly schedules — the cooking schedule (Culinary) and the morning chores
   (Hospitality), against the real api.js.

   Who makes them (the ministry that owns each — members, leaders, its
   overseer — and admins; nobody else); a week is a Sunday; a new week starts
   from the template (rows, no names) and after that from the latest week
   before it, names and all; a saved week is cleaned to its kind's shape;
   drafts stay hidden from everyone else until published; names typed in by
   hand come back as suggestions; the names on offer: campus staff, other
   staff, every member of a team whose dates cover the week, guests booked
   in SR Hospitality; My Home's call carries this week and next; a team sees
   the schedules in the portal only once it has arrived, and keeps its
   member list there. Every name here is made up. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('duty');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.writeFileSync(TMP + '/team-seed.js', 'export default [];');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js');
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');

const st = (o) => ({ role: '', active: true, campus: 'siemreap', staffType: 'campus', ...o });
const PEOPLE = [
  st({ id: 'st_k', name: 'Kara Cook', username: 'kara', dept: 'Skills Training', ministry: 'Culinary' }),
  st({ id: 'st_h', name: 'Hana Host', username: 'hana', dept: 'Skills Training', ministry: 'Hospitality' }),
  st({ id: 'st_a', name: 'Adam Admin', username: 'adam', dept: 'Campus Leadership', ministry: 'Campus Director', isAdmin: true }),
  st({ id: 'st_c', name: 'Cafe Kim', username: 'kim', dept: 'Community Service', ministry: 'Cafe', staffType: 'ministry' }),
  st({ id: 'st_s1', name: 'Sam One', username: 'sam1', dept: 'Community Service', ministry: 'Cafe' }),
  st({ id: 'st_s2', name: 'Sam Two', username: 'sam2', dept: 'Community Service', ministry: 'Cafe', staffType: 'yap' }),
  st({ id: 'st_off', name: 'Gone Away', username: 'gone', dept: 'Community Service', ministry: 'Cafe', active: false }),
  st({ id: 'st_pp', name: 'Poipet Pat', username: 'pat', campus: 'poipet', dept: 'Skills Training', ministry: 'Culinary' }),
  st({ id: 'st_app', name: 'Team Leader', username: 'lead', dept: '', ministry: '', kind: 'applicant', applicant: { type: 'team', school: '', candidateId: 'cd_t' } }),
];
mem.staff = PEOPLE.map(s => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) }));

async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return await res.json().catch(() => null);
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
// Sundays, the way the app keys weeks (Cambodia time)
const sunday = (n) => { const d = new Date(Date.now() + 7 * 3600000); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - d.getUTCDay() + 7 * n); return d.toISOString().slice(0, 10); };
const W0 = sunday(0), W1 = sunday(1), W2 = sunday(2);
const K = ['kara', '1234'];
function addD(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

console.log('=== who makes them ===');
let r = await call('getDuty', [...K, 'kitchen', W0]);
ok('the Culinary team opens the cooking schedule to edit', r.ok && r.canEdit === true && r.isNew === true && r.sched.layout === 'grid', JSON.stringify(r).slice(0, 120));
ok('a new week starts from the template: its rows, and no names', r.sched.rows.length === 7 && r.sched.rows[0].label === 'Breakfast 7:30' && Object.keys(r.sched.cells).length === 0 && r.sched.days.join() === 'sun,mon,tue,wed,thu,fri');
ok('Pray – Announcements is one cell for the week, and Sunday has no breakfast', r.sched.rows.find(x => x.id === 'pr').span === true && r.sched.rows[0].off.includes('sun'));
ok('Culinary can’t edit the morning chores', (await call('getDuty', [...K, 'chores', W0])).canEdit === false);
r = await call('getDuty', ['hana', '1234', 'chores', W0]);
ok('Hospitality opens the morning chores: sections of places, no names', r.ok && r.canEdit && r.sched.layout === 'list' && r.sched.sections.length === 2 && r.sched.sections[1].title === 'Family house' && r.sched.sections.every(s => s.rows.every(x => x.people.length === 0)));
ok('an admin can edit both', (await call('getDuty', ['adam', '1234', 'kitchen', W0])).canEdit && (await call('getDuty', ['adam', '1234', 'chores', W0])).canEdit);
r = await call('getDuty', ['kim', '1234', 'kitchen', W0]);
ok('anyone else only reads, and an unpublished week is nothing', r.ok && r.canEdit === false && r.sched === null && !r.people);
ok('saving needs the ministry', (await call('saveDuty', ['kim', '1234', 'kitchen', W0, {}, 'publish'])).err === 'not_authorized');
ok('a week is a Sunday', (await call('getDuty', [...K, 'kitchen', addD(W0, 1)])).err === 'bad_week');
ok('an unknown kind is refused', (await call('getDuty', [...K, 'laundry', W0])).err === 'bad_kind');
ok('a wrong PIN gets nothing', (await call('getDuty', ['kara', '0000', 'kitchen', W0])).ok === false);

console.log('=== names on offer ===');
mem.teamTrips = [
  { id: 'ta_cd_t', candidateId: 'cd_t', campus: 'siemreap', name: 'Example Church', from: W0, to: addD(W0, 10), size: 4, status: 'active', metrics: {} },
  { id: 'tt_later', campus: 'siemreap', name: 'Later Team', from: addD(W0, 30), to: addD(W0, 40), status: 'active', metrics: {} },
];
mem.candidates = [{ id: 'cd_t', type: 'team', campus: 'siemreap', name: 'Team Leader', stage: 'docs', staffId: 'st_app',
  portal: { submittedAt: '2026-01-01', form: { answers: { teamName: 'Example Church', leaderName: 'Lee Leader', coLeaders: [{ name: 'Co Leader' }] } }, docs: [], members: [{ name: 'Member One', sex: 'f' }] } }];
mem['hosp:siemreap'] = { buildings: [], rooms: [], bookings: [
  { id: 'k1', category: 'speaker', name: 'Pastor Example', from: addD(W0, 2), to: addD(W0, 4), count: 1, bedIds: [] },
  { id: 'k2', category: 'guest', name: 'Long Gone', from: addD(W0, -20), to: addD(W0, -10), count: 1, bedIds: [] },
  { id: 'k3', category: 'team', name: 'Example Church', from: W0, to: addD(W0, 10), count: 4, bedIds: [] },
  { id: 'k4', category: 'student', name: 'DTS Example', from: addD(W0, -30), to: addD(W0, 60), count: 3, bedIds: ['b1', 'b2', 'b3'], bedNames: { b1: 'Stu One', b2: 'Stu Two' } },
  { id: 'k9', category: 'student', name: 'School Two', from: addD(W0, -3), to: addD(W0, 30), count: 2, bedIds: [], people: [{ name: 'Pia Listed', sex: 'f' }, { name: 'Stu One', sex: 'm' }] },
  { id: 'k5', category: 'student', name: 'Solo Student', from: addD(W0, -5), to: '', permanent: true, count: 1, bedIds: [] },
  { id: 'k6', category: 'staff', name: 'Kara Staff-Bed', from: addD(W0, -100), to: '', permanent: true, count: 1, bedIds: ['b9'] },
  { id: 'k7', category: 'team', name: 'Walk-in Team', from: W0, to: addD(W0, 5), count: 2, bedIds: ['b4', 'b5'], bedNames: { b4: 'Wally One', b5: 'Wanda Two' } },
  { id: 'k8', category: 'team', name: 'Example Church', from: W0, to: addD(W0, 10), count: 2, tripId: 'ta_cd_t', bedIds: ['b6'], bedNames: { b6: 'Extra Person' } },
] };
r = await call('getDuty', [...K, 'kitchen', W0]);
const g = Object.fromEntries(r.people.map(x => [x.id, x]));
ok('campus staff and YAP come first, as one group, by full name', r.people[0].id === 'campus' && r.people[0].label === 'Campus staff & YAP' && g.campus.names.includes('Kara Cook') && g.campus.names.includes('Sam One') && g.campus.names.includes('Sam Two') && !g.campus.names.includes('Gone Away'), g.campus.names.join());
ok('ministry staff in their own group; nobody from another campus, no applicants', g.staff && g.staff.names.join() === 'Cafe Kim' && !JSON.stringify(r.people).includes('Poipet') && !g.campus.names.includes('Team Leader'));
ok('a team here that week brings its leader, co-leaders and members', g.team_ta_cd_t && g.team_ta_cd_t.label === 'Example Church' && g.team_ta_cd_t.names.slice(0, 3).join() === 'Lee Leader,Co Leader,Member One', JSON.stringify(g.team_ta_cd_t));
ok('a team that comes later does not', !g.team_tt_later);
ok('guests booked that week are on offer; ones who left, and team bookings, are not', g.guests && g.guests.names.join() === 'Pastor Example');
ok('students booked into SR Hospitality are on offer by the names in their beds or on the booking’s list (not the school’s booking name, no one twice), or the student’s own booking', g.students && g.students.label === 'Students' && g.students.names.join() === 'Stu One,Stu Two,Pia Listed,Solo Student', JSON.stringify(g.students));
ok('a staff bed adds nobody — staff come from the staff list', !JSON.stringify(r.people).includes('Staff-Bed'));
ok('names Hospitality typed in for a team join that team; a team with no portal list gets a group of its own', g.team_ta_cd_t.names.join() === 'Lee Leader,Co Leader,Member One,Extra Person' && g['hteam_k7'] && g['hteam_k7'].label === 'Walk-in Team' && g['hteam_k7'].names.join() === 'Wally One,Wanda Two', JSON.stringify([g.team_ta_cd_t, g.hteam_k7]));

console.log('=== making a week ===');
const sched = r.sched;
sched.cells['bf|mon'] = ['Kara', 'Sam O.', 'Kara', '  '];
sched.cells['pr|all'] = ['Hana'];
sched.cells['bf|sun'] = ['Nobody'];           // Sunday breakfast is off
sched.cells['ghost|mon'] = ['Nobody'];        // no such row
sched.cells['di|tue'] = ['Visiting Cook'];    // typed in by hand
r = await call('saveDuty', [...K, 'kitchen', W0, sched, 'save']);
ok('saved as a draft, cleaned: repeats and blanks dropped, off days and unknown rows ignored', r.ok && r.sched.published === false && r.sched.cells['bf|mon'].join() === 'Kara,Sam O.' && !r.sched.cells['bf|sun'] && !r.sched.cells['ghost|mon'] && r.sched.cells['pr|all'].join() === 'Hana', JSON.stringify(r.sched.cells));
ok('a name typed in by hand is offered again', r.people.find(x => x.id === 'extras') && r.people.find(x => x.id === 'extras').names.includes('Visiting Cook'));
ok('a draft is not seen by anyone else', (await call('getDuty', ['kim', '1234', 'kitchen', W0])).sched === null && (await call('getMySchedules', ['kim', '1234', W0])).now.kitchen === null);
r = await call('saveDuty', [...K, 'kitchen', W0, r.sched, 'publish']);
ok('published', r.ok && r.sched.published === true && !!r.sched.publishedAt);
const pubAt = r.sched.publishedAt;
r = await call('getMySchedules', ['kim', '1234', W0]);
ok('everyone on the campus sees this week’s on My Home', r.ok && r.now.kitchen && r.now.kitchen.cells['bf|mon'].join() === 'Kara,Sam O.' && r.now.chores === null && r.canEdit.kitchen === false && r.nextWeek === W1);
ok('… and the ministry is told it may edit it', (await call('getMySchedules', [...K, W0])).canEdit.kitchen === true);
ok('Poipet sees none of Siem Reap’s', (await call('getMySchedules', ['pat', '1234', W0])).now.kitchen === null);
r = await call('getDuty', [...K, 'kitchen', W0]);
r.sched.cells['bf|tue'] = ['Kara'];
r = await call('saveDuty', [...K, 'kitchen', W0, r.sched, 'save']);
ok('a later save keeps it published, and when it first went out', r.sched.published === true && r.sched.publishedAt === pubAt && r.sched.cells['bf|tue'].join() === 'Kara');
r = await call('getDuty', [...K, 'kitchen', W1]);
ok('next week starts as a copy of this one, names and all, as a draft', r.isNew && r.from === W0 && r.sched.published === false && r.sched.cells['bf|mon'].join() === 'Kara,Sam O.');
r.sched.rows.push({ label: 'Snack 3:00', km: '', time: '', off: [] });
r.sched.rows[0].label = '';                         // a row without a name goes
r = await call('saveDuty', [...K, 'kitchen', W1, r.sched, 'publish']);
ok('its rows can change: one added, one with no name dropped', r.ok && r.sched.rows.length === 7 && r.sched.rows.some(x => x.label === 'Snack 3:00') && r.sched.rows.every(x => x.id));
ok('… without touching last week’s', (await call('getDuty', [...K, 'kitchen', W0])).sched.rows[0].label === 'Breakfast 7:30');
r = await call('getMySchedules', ['kim', '1234', W0]);
ok('My Home also carries next week, once it is out', r.next.kitchen && r.next.kitchen.week === W1);
r = await call('saveDuty', [...K, 'kitchen', W1, (await call('getDuty', [...K, 'kitchen', W1])).sched, 'unpublish']);
ok('it can be taken down again', r.sched.published === false && (await call('getMySchedules', ['kim', '1234', W0])).next.kitchen === null);

console.log('=== the morning chores ===');
r = await call('getDuty', ['hana', '1234', 'chores', W0]);
r.sched.sections[0].rows[0].people = ['Hana', 'Pastor Example'];
r.sched.sections[0].rows.push({ place: 'New place', duty: 'Something new', people: ['Kara'] });
r.sched.sections[0].rows.push({ place: '', duty: 'no place', people: [] });
r = await call('saveDuty', ['hana', '1234', 'chores', W0, r.sched, 'publish']);
const base = r.sched.sections[0];
ok('people are kept per place, a place can be added, one without a name goes', r.ok && base.rows[0].people.join() === 'Hana,Pastor Example' && base.rows.some(x => x.place === 'New place' && x.id) && !base.rows.some(x => x.duty === 'no place'));
ok('a week of chores is published for everyone', (await call('getMySchedules', ['kim', '1234', W0])).now.chores.sections[0].rows[0].people.includes('Hana'));

console.log('=== the team in the portal ===');
r = await call('portalSaveTeamMembers', ['lead', '1234', [{ name: '  Member  One ', sex: 'f' }, { name: '' }, 'Plain Name', { name: 'x'.repeat(200), sex: 'zz' }]]);
ok('the leader keeps the team’s member list: names cleaned, blanks dropped', r.ok && r.application.members.length === 3 && r.application.members[0].name === 'Member One' && r.application.members[1].name === 'Plain Name' && r.application.members[2].name.length === 80 && r.application.members[2].sex === '', JSON.stringify(r.application && r.application.members));
ok('before the team has arrived, the portal shows no schedules', !r.schedules);
mem.candidates[0].stage = 'arrived';
r = await call('portalBoot', ['lead', '1234']);
ok('once arrived, it shows this week’s published schedules', r.schedules && r.schedules.week === W0 && r.schedules.kitchen && r.schedules.kitchen.cells['bf|mon'] && r.schedules.chores);
ok('only portal team accounts keep a member list', (await call('portalSaveTeamMembers', ['kim', '1234', []])).ok === false);
r = await call('getDuty', [...K, 'kitchen', W0]);
ok('the new member list is on offer to the kitchen', r.people.find(x => x.id === 'team_ta_cd_t').names.includes('Plain Name'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
