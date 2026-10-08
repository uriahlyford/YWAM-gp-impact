/* YWAM GP Portal, server side, against the real api.js — milestone 1.
   An applicant is an account with kind:'applicant' whose application is a
   candidate record in the CRM. What this holds: sign-up validation; an
   applicant is closed out of every staff handler and every roster; they
   see only their own application; portal access is a flag only an admin
   (or, for portalStaff, a portal admin) can set, never to an applicant;
   a stage move by staff shows up on the applicant's timeline; the CRM's
   own edits keep the portal's fields. All fixtures are fake people. */
import { REPO, tmpDir } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('portal');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const mem={};
export function getStore(){ return {
  get: async (k)=> (k in mem)?JSON.parse(JSON.stringify(mem[k])):null,
  setJSON: async (k,v)=>{ mem[k]=JSON.parse(JSON.stringify(v)); },
  delete: async (k)=>{ delete mem[k]; },
};}
export const __mem=mem;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json',
  JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
fs.copyFileSync(REPO + '/netlify/functions/api.js', TMP + '/api.js');
fs.copyFileSync(REPO + '/netlify/functions/team-seed.js', TMP + '/team-seed.js');
fs.copyFileSync(REPO + '/netlify/functions/portal-forms-default.js', TMP + '/portal-forms-default.js'); // and the portal's shipped forms // api.js imports it
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__mem;
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
mem.staff = [
  withPin({ id: 'st_admin', name: 'Uriah Lyford', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true, email: 'u@x.org' }),
  withPin({ id: 'st_padmin', name: 'Sina Sok', username: 'sina', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, portalAdmin: true, email: 's@x.org' }),
  withPin({ id: 'st_pstaff', name: 'Dara Pen', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, portalStaff: true, email: 'd@x.org' }),
  withPin({ id: 'st_plain', name: 'Bopha Kim', username: 'bopha', campus: 'siemreap', dept: 'Youth Education', ministry: 'YDC', active: true, email: 'b@x.org' }),
  withPin({ id: 'st_hr', name: 'Mealea Sok', username: 'mealea', campus: 'poipet', dept: 'Community Service', ministry: 'Cafe', active: true, hr: true, email: 'm@x.org' }),
  withPin({ id: 'st_teams', name: 'Rithy Team', username: 'rithy', campus: 'siemreap', dept: 'Community Service', ministry: 'Outreach Teams', active: true, portalStaff: true, email: 'r@x.org' }),
];
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return { status: res.status, body: await res.json().catch(() => null) };
}
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const APP = { username: 'anna.b', pin: '2468', name: 'Anna Example', email: 'anna@example.org', phone: '+46 70 000 0000', messenger: 'whatsapp', type: 'student', school: 'dts', country: 'Sweden', campus: 'siemreap' };

console.log('=== signing in with Google or an email and password (Oct 2026) ===');
{
  /* Google's tokeninfo stands in: whatever the test says the token means. */
  let INFO = null;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => ({ ok: !!INFO, json: async () => INFO });
  const EMAIL_APP = { name: 'Eve Example', email: 'Eve@Example.org', password: 'correct horse', phone: '+44 7700 900000', messenger: 'telegram', type: 'student', school: 'dts', country: 'United Kingdom', campus: 'siemreap' };
  let r = await call('portalRegister', [{ ...EMAIL_APP, password: 'short' }]);
  ok('a password under 8 characters is refused', r.body && r.body.err === 'bad_password', JSON.stringify(r.body));
  r = await call('portalRegister', [EMAIL_APP]);
  ok('sign-up with an email and password works, the username is the (lower-cased) email', r.body && r.body.ok && r.body.user === 'eve@example.org' && r.body.me.username === 'eve@example.org' && r.body.me.authKind === 'password' && r.body.token === '', JSON.stringify(r.body && r.body.me));
  const eve = mem.staff.find(x => x.username === 'eve@example.org');
  ok('the password is kept hashed (PBKDF2), no PIN, no plain text anywhere', eve && eve.secretHash && eve.secretSalt && !eve.pinHash && JSON.stringify(eve).indexOf('correct horse') === -1);
  r = await call('portalBoot', ['eve@example.org', 'correct horse']);
  ok('portalBoot signs in with the email and password', r.body && r.body.ok && r.body.role === 'applicant' && r.body.me.name === 'Eve Example');
  r = await call('portalBoot', ['Eve@Example.org', 'correct horse']);
  ok('… however the email is capitalised', r.body && r.body.ok);
  r = await call('portalBoot', ['eve@example.org', 'wrong horse']);
  ok('a wrong password is refused', r.body && r.body.ok === false && r.body.err === 'auth');
  r = await call('portalRegister', [{ ...EMAIL_APP, password: 'another one' }]);
  ok('the same email cannot sign up twice', r.body && r.body.err === 'email_taken');
  r = await call('portalSetPassword', ['eve@example.org', 'correct horse', 'new horse 2026']);
  ok('she can change her password', r.body && r.body.ok);
  r = await call('portalBoot', ['eve@example.org', 'new horse 2026']);
  ok('… and the new one signs in', r.body && r.body.ok);
  r = await call('portalBoot', ['eve@example.org', 'correct horse']);
  ok('… the old one no longer does', r.body && r.body.ok === false);
  /* an older username + PIN applicant switches over */
  r = await call('portalRegister', [{ username: 'old.pin', pin: '2468', name: 'Old Pin', email: 'old@example.org', phone: '+46 70 000 0001', messenger: 'whatsapp', type: 'student', school: 'dts', country: 'Sweden', campus: 'siemreap' }]);
  ok('a username + PIN account can still be made (portal admins do), and signs in with the PIN', r.body && r.body.ok && r.body.me.authKind === 'pin' && (await call('portalBoot', ['old.pin', '2468'])).body.ok);
  r = await call('portalSetPassword', ['old.pin', '2468', 'my new password']);
  ok('setting a password switches it over: the email becomes the username', r.body && r.body.ok && r.body.user === 'old@example.org', JSON.stringify(r.body));
  r = await call('portalBoot', ['old@example.org', 'my new password']);
  ok('… and they sign in with the email and password', r.body && r.body.ok && r.body.me.authKind === 'password' && r.body.me.username === 'old@example.org');
  r = await call('portalBoot', ['old.pin', '2468']);
  ok('… the username and PIN no longer work', r.body && r.body.ok === false);
  const oldRec = mem.staff.find(x => x.username === 'old@example.org');
  mem.staff = mem.staff.filter(x => x.id !== oldRec.id); mem.candidates = (mem.candidates || []).filter(c => c.staffId !== oldRec.id);
  r = await call('portalSetPassword', ['andrew-not-here', '1234', 'whatever 1234']);
  ok('a stranger cannot set a password', r.body && r.body.ok === false);
  r = await call('portalSetPassword', ['uriah', '1234', 'whatever 1234']);
  ok('nor can a staff member turn their PIN into a password here', r.body && r.body.ok === false && r.body.err === 'not_applicant');

  /* Google */
  r = await call('portalAuthConfig', []);
  ok('with no client id, Google is off', r.body && r.body.ok && r.body.google === '');
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('… and a Google token is refused', r.body && r.body.ok === false && r.body.err === 'google');
  process.env.GP_GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
  r = await call('portalAuthConfig', []);
  ok('with the client id set, the page is told Google is on', r.body && r.body.google === 'test-client.apps.googleusercontent.com');
  const soon = Math.floor(Date.now() / 1000) + 600;
  INFO = { aud: 'someone-else.apps.googleusercontent.com', iss: 'https://accounts.google.com', email: 'gus@example.org', email_verified: 'true', exp: soon, name: 'Gus Google', sub: '1001' };
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('a token issued for another app is refused', r.body && r.body.err === 'google');
  INFO = { aud: 'test-client.apps.googleusercontent.com', iss: 'https://accounts.google.com', email: 'gus@example.org', email_verified: 'false', exp: soon, name: 'Gus Google', sub: '1001' };
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('an unverified email is refused', r.body && r.body.err === 'google');
  INFO = { aud: 'test-client.apps.googleusercontent.com', iss: 'https://accounts.google.com', email: 'gus@example.org', email_verified: 'true', exp: soon - 1200, name: 'Gus Google', sub: '1001' };
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('an expired token is refused', r.body && r.body.err === 'google');
  INFO = { aud: 'test-client.apps.googleusercontent.com', iss: 'https://accounts.google.com', email: 'Gus@Example.org', email_verified: 'true', exp: soon, name: 'Gus Google', sub: '1001' };
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('a good token for an email with no account answers "new" with the name and email, so sign-up opens filled in', r.body && r.body.ok === false && r.body.err === 'new' && r.body.email === 'gus@example.org' && r.body.name === 'Gus Google', JSON.stringify(r.body));
  r = await call('portalRegister', [{ googleToken: 'h.p.s', phone: '+1 555 0100', messenger: 'whatsapp', type: 'volunteer', school: '', country: 'United States', campus: 'siemreap' }]);
  ok('sign-up with Google: the email and name are Google’s, there is no password, and a device token comes back', r.body && r.body.ok && r.body.user === 'gus@example.org' && r.body.me.name === 'Gus Google' && r.body.me.authKind === 'google' && /^[a-f0-9]{48}$/.test(r.body.token), JSON.stringify(r.body && { user: r.body.user, token: r.body.token, me: r.body.me }));
  const gusTok1 = r.body.token;
  const gus = mem.staff.find(x => x.username === 'gus@example.org');
  ok('the account holds the token hashed only, no PIN, no password', gus && gus.tokens.length === 1 && !gus.pinHash && !gus.secretHash && JSON.stringify(gus).indexOf(gusTok1) === -1 && gus.google.sub === '1001');
  r = await call('portalBoot', ['gus@example.org', gusTok1]);
  ok('the device token signs in like a PIN', r.body && r.body.ok && r.body.role === 'applicant');
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('signing in with Google again (another phone) mints another token and boots', r.body && r.body.ok && r.body.user === 'gus@example.org' && r.body.token && r.body.token !== gusTok1 && r.body.application);
  const gusTok2 = r.body.token;
  r = await call('portalBoot', ['gus@example.org', gusTok1]);
  ok('… the first phone still works', r.body && r.body.ok);
  r = await call('portalBoot', ['gus@example.org', gusTok2]);
  ok('… and so does the second', r.body && r.body.ok);
  r = await call('portalBoot', ['gus@example.org', 'a'.repeat(48)]);
  ok('a made-up token does not', r.body && r.body.ok === false);
  r = await call('portalBoot', ['gus@example.org', '']);
  ok('nor an empty one', r.body && r.body.ok === false);
  /* the page's own button hands over an ACCESS token (no dots): tokeninfo answers with expires_in and verified_email, the name comes from userinfo */
  globalThis.fetch = async (url) => /userinfo/.test(String(url)) ? { ok: true, json: async () => ({ name: 'Ava Access' }) } : { ok: /access_token=/.test(String(url)), json: async () => ({ aud: 'test-client.apps.googleusercontent.com', email: 'ava@example.org', verified_email: 'true', expires_in: 3400, sub: '555' }) };
  r = await call('portalLoginGoogle', ['ya29.accesstokenwithoutdots']);
  ok('an access token from the page’s own button is checked the same way, the name fetched from userinfo', r.body && r.body.err === 'new' && r.body.email === 'ava@example.org' && r.body.name === 'Ava Access', JSON.stringify(r.body));
  globalThis.fetch = async (url) => ({ ok: true, json: async () => ({ aud: 'test-client.apps.googleusercontent.com', email: 'ava@example.org', verified_email: 'true', expires_in: 0, sub: '555' }) });
  r = await call('portalLoginGoogle', ['ya29.expiredaccesstoken']);
  ok('an expired access token is refused', r.body && r.body.err === 'google');
  globalThis.fetch = async (url) => ({ ok: !!INFO, json: async () => INFO });
  INFO = { aud: 'test-client.apps.googleusercontent.com', iss: 'https://accounts.google.com', email: 'u@x.org', email_verified: 'true', exp: soon, name: 'Uriah', sub: '77' };
  r = await call('portalLoginGoogle', ['h.p.s']);
  ok('a staff member’s email is sent to the staff door, not signed in', r.body && r.body.ok === false && r.body.err === 'staff' && !mem.staff.find(x => x.username === 'uriah').tokens);
  r = await call('getMyBoot', ['gus@example.org', gusTok1]);
  ok('an applicant’s token opens nothing on the staff side', r.body && r.body.ok === false);
  /* Accounts (portal admin) */
  r = await call('portalListAccounts', ['sina', '1234']);
  const accs = (r.body && r.body.accounts) || [];
  ok('the accounts list says how each one signs in', accs.find(a => a.username === 'eve@example.org').authKind === 'password' && accs.find(a => a.username === 'gus@example.org').authKind === 'google');
  r = await call('portalUpdateAccount', ['sina', '1234', eve.id, { newPin: '1234' }]);
  ok('a PIN cannot be set on an email account', r.body && r.body.err === 'no_pin_account');
  r = await call('portalUpdateAccount', ['sina', '1234', eve.id, { username: 'eve.x' }]);
  ok('nor its username changed — it is the email', r.body && r.body.err === 'username_is_email');
  r = await call('portalUpdateAccount', ['sina', '1234', eve.id, { newPassword: 'reset by admin' }]);
  ok('a portal admin can set a new password', r.body && r.body.ok);
  r = await call('portalBoot', ['eve@example.org', 'reset by admin']);
  ok('… which signs in', r.body && r.body.ok);
  r = await call('portalUpdateAccount', ['sina', '1234', eve.id, { email: 'eve.new@example.org' }]);
  ok('changing the email changes the username with it', r.body && r.body.ok && r.body.account.username === 'eve.new@example.org');
  r = await call('portalBoot', ['eve.new@example.org', 'reset by admin']);
  ok('… and she signs in with the new email', r.body && r.body.ok);
  mem.staff = mem.staff.filter(x => x.id !== eve.id && x.id !== gus.id);
  mem.candidates = (mem.candidates || []).filter(c => c.staffId !== eve.id && c.staffId !== gus.id);
  delete process.env.GP_GOOGLE_CLIENT_ID;
  globalThis.fetch = realFetch;
}

console.log('=== a team’s photos: one per person, instead of a team photo with names ===');
{
  const base64Jpeg = Buffer.alloc(900, 7).toString('base64');   // the shape matters here, not the picture
  mem.candidates = (mem.candidates || []).filter(c => c.id !== 'cd_photo');
  mem.staff.push({ id: 'st_photo', username: 'photo.team', name: 'Pat Leader', email: 'pat@example.org', kind: 'applicant', campus: 'siemreap', active: true,
    applicant: { type: 'team', school: '', candidateId: 'cd_photo' }, pinSalt: 'st_photo', pinHash: mkHash('2468', 'st_photo') });
  mem.candidates.push({ id: 'cd_photo', campus: 'siemreap', name: 'Photo Church', type: 'team', stage: 'docs', staffId: 'st_photo', email: 'pat@example.org',
    portal: { createdAt: '2026-09-01', submittedAt: '2026-09-02', form: { answers: { teamName: 'Photo Church', leaderName: 'Pat Leader', coLeaders: [{ name: 'Cora Co' }] } }, docs: [], members: [], team: { call1: true } },
    log: [], archived: null });
  /* a list saved before members had ids (YWAM Montana's) still counts: ids are made on read */
  mem.candidates.find(c => c.id === 'cd_photo').portal.members = [{ name: 'Old One', sex: 'f' }, { name: 'Old Two', sex: 'm' }];
  let r = await call('portalTeamPhotos', ['photo.team', '2468']);
  ok('members listed before ids existed still appear, with a steady id each', r.body && r.body.ok && r.body.people.filter(p => p.role === 'member').map(p => p.name).join() === 'Old One,Old Two' && r.body.people.filter(p => p.role === 'member').every(p => /^mh[a-z0-9]+$/.test(p.key)));
  const oldKey = r.body.people.filter(p => p.role === 'member')[0].key;
  ok('… the same id on every read', (await call('portalStrengths', ['photo.team', '2468'])).body.people.filter(p => p.role === 'member')[0].key === oldKey);
  r = await call('portalSaveTeamMembers', ['photo.team', '2468', [{ name: 'Mia Member', sex: 'f' }, { name: 'Max Member', sex: 'm' }]]);
  const mem1 = r.body.application.members;
  ok('members get a small id each when saved', r.body && r.body.ok && mem1.length === 2 && mem1.every(m => /^m[a-z0-9]{6,24}$/.test(m.id)) && mem1[0].id !== mem1[1].id, JSON.stringify(mem1));
  r = await call('portalSaveTeamMembers', ['photo.team', '2468', [{ id: mem1[0].id, name: 'Mia Renamed', sex: 'f' }, { name: 'Max Member', sex: 'm' }]]);
  ok('an id given back is kept through a rename', r.body.application.members[0].id === mem1[0].id && r.body.application.members[0].name === 'Mia Renamed');
  const mid = r.body.application.members[0].id, mid2 = r.body.application.members[1].id;
  r = await call('portalTeamPhotos', ['photo.team', '2468']);
  ok('the people to photograph: the leader, the co-leaders from the form, then the members, none with a photo yet',
    r.body && r.body.ok && r.body.people.map(p => p.key + ':' + p.name + ':' + p.role).join('|') === 'leader:Pat Leader:leader|co|0:Cora Co:co|' + mid + ':Mia Renamed:member|' + mid2 + ':Max Member:member' && Object.keys(r.body.photos).length === 0 && r.body.tally.count === 0 && r.body.tally.total === 4, JSON.stringify(r.body && r.body.people));
  r = await call('portalSaveTeamPhoto', ['photo.team', '2468', 'nobody', base64Jpeg]);
  ok('a photo for someone not on the team is refused', r.body && r.body.err === 'bad_person');
  r = await call('portalSaveTeamPhoto', ['photo.team', '2468', 'leader', 'x'.repeat(200 * 1024)]);
  ok('a photo over the size limit is refused', r.body && r.body.err === 'too_large');
  r = await call('portalSaveTeamPhoto', ['photo.team', '2468', 'leader', 'not base64!!']);
  ok('junk is refused', r.body && r.body.err === 'bad_file');
  r = await call('portalSaveTeamPhoto', ['photo.team', '2468', 'leader', base64Jpeg]);
  ok('the leader’s photo saves, and the tally moves', r.body && r.body.ok && r.body.photos.leader && r.body.photos.leader.data === base64Jpeg && r.body.tally.count === 1 && r.body.application.photos.count === 1 && r.body.application.photos.total === 4, JSON.stringify(r.body && r.body.tally));
  ok('the photo lives in its own blob, not on the candidate', mem['tphotos:cd_photo'] && mem['tphotos:cd_photo'].photos.leader && JSON.stringify(mem.candidates.find(c => c.id === 'cd_photo')).indexOf(base64Jpeg) === -1);
  for (const k of ['co|0', mid]) await call('portalSaveTeamPhoto', ['photo.team', '2468', k, base64Jpeg]);
  r = await call('portalBoot', ['photo.team', '2468']);
  const photoStep = r.body.application.steps.find(st => st.id === 'photo');
  ok('with one person still without a photo, the team photo step is not done', photoStep && !photoStep.done && r.body.application.photos.count === 3);
  r = await call('portalSaveTeamPhoto', ['photo.team', '2468', mid2, base64Jpeg]);
  ok('with everyone photographed, the team photo document counts as in', r.body.application.steps.find(st => st.id === 'photo').done === true && r.body.tally.count === 4);
  r = await call('portalSaveTeamMembers', ['photo.team', '2468', [{ id: mid, name: 'Mia Renamed', sex: 'f' }, { id: mid2, name: 'Max Member', sex: 'm' }, { name: 'New Person', sex: '' }]]);
  ok('adding a member reopens it: one more face to take', r.body.application.photos.count === 4 && r.body.application.photos.total === 5 && r.body.application.steps.find(st => st.id === 'photo').done === false);
  r = await call('portalDeleteTeamPhoto', ['photo.team', '2468', 'co|0']);
  ok('a photo can be removed', r.body && r.body.ok && !r.body.photos['co|0'] && r.body.tally.count === 3);
  r = await call('portalTeamPhotos', ['dara', '1234', 'cd_photo']);
  ok('portal staff read the team’s photos on the record', r.body && r.body.ok && r.body.photos.leader && r.body.people.length === 5);
  r = await call('portalSaveTeamPhoto', ['dara', '1234', 'co|0', base64Jpeg, 'cd_photo']);
  ok('… and can take one for a person', r.body && r.body.ok && r.body.photos['co|0']);
  r = await call('portalTeamPhotos', ['bopha', '1234', 'cd_photo']);
  ok('a staff member without portal access gets nothing', r.body && r.body.ok === false);
  r = await call('portalTeamPhotos', ['anna@example.org', 'secret123']);
  ok('another applicant cannot read them', !(r.body && r.body.ok && r.body.photos && r.body.photos.leader));
  mem.staff = mem.staff.filter(x => x.id !== 'st_photo'); mem.candidates = mem.candidates.filter(c => c.id !== 'cd_photo'); delete mem['tphotos:cd_photo'];
}

console.log('=== the portal as a tool: meet our team, team strengths, resources ===');
{
  mem.staff.push(
    { id: 'st_cs1', name: 'Chan Campus', username: 'chan', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Hospitality', role: 'Host', staffType: 'campus', active: true, photo: 'data:image/jpeg;base64,/9j/AAAA', pinSalt: 'st_cs1', pinHash: mkHash('1234', 'st_cs1') },
    { id: 'st_yap1', name: 'Yan Yap', username: 'yan', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', role: 'YAP', staffType: 'yap', active: true, pinSalt: 'st_yap1', pinHash: mkHash('1234', 'st_yap1') },
    { id: 'st_min1', name: 'Mina Ministry', username: 'mina', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', role: 'Barista', staffType: 'ministry', active: true, pinSalt: 'st_min1', pinHash: mkHash('1234', 'st_min1') },
    { id: 'st_pp1', name: 'Pat Poipet', username: 'ppat', campus: 'poipet', dept: 'Campus Leadership', ministry: 'Hospitality', role: 'Host', staffType: 'campus', active: true, pinSalt: 'st_pp1', pinHash: mkHash('1234', 'st_pp1') },
    { id: 'st_gone', name: 'Gone Away', username: 'gonex', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Hospitality', role: 'Host', staffType: 'campus', active: false, pinSalt: 'st_gone', pinHash: mkHash('1234', 'st_gone') },
    { id: 'st_tool', username: 'tool.team', name: 'Tia Leader', email: 'tia@example.org', kind: 'applicant', campus: 'siemreap', active: true, applicant: { type: 'team', school: '', candidateId: 'cd_tool' }, pinSalt: 'st_tool', pinHash: mkHash('2468', 'st_tool') },
    { id: 'st_solo', username: 'solo.app', name: 'Sol Solo', email: 'sol@example.org', kind: 'applicant', campus: 'siemreap', active: true, applicant: { type: 'volunteer', school: '', candidateId: 'cd_solo' }, pinSalt: 'st_solo', pinHash: mkHash('2468', 'st_solo') });
  mem.candidates = (mem.candidates || []).concat([
    { id: 'cd_tool', campus: 'siemreap', name: 'Tool Church', type: 'team', stage: 'docs', staffId: 'st_tool', email: 'tia@example.org', portal: { createdAt: '2026-09-01', submittedAt: '2026-09-02', form: { answers: { teamName: 'Tool Church', leaderName: 'Tia Leader', coLeaders: [] } }, docs: [], members: [{ id: 'mabc1234', name: 'Mo Member', sex: 'm' }] }, log: [], archived: null },
    { id: 'cd_solo', campus: 'siemreap', name: 'Sol Solo', type: 'volunteer', stage: 'new', staffId: 'st_solo', email: 'sol@example.org', portal: { createdAt: '2026-09-01', submittedAt: null, form: null, docs: [] }, log: [], archived: null }]);
  let r = await call('portalMeetTeam', ['tool.team', '2468']);
  ok('Meet our team: the campus staff and YAP of the applicant’s campus, as one list — no ministry staff, nobody inactive, nobody from Poipet, no applicants',
    r.body && r.body.ok && r.body.campus === 'siemreap' && r.body.staff.map(x => x.name).join('|') === 'Chan Campus|Yan Yap' && r.body.staff[0].hasPhoto === true && r.body.staff[1].hasPhoto === false, JSON.stringify(r.body && r.body.staff));
  ok('… only a name, role, ministry and department leave — no username, email or phone', r.body && Object.keys(r.body.staff[0]).sort().join() === 'dept,edited,hasPhoto,id,ministry,name,role');
  r = await call('portalStaffPhoto', ['tool.team', '2468', 'st_cs1']);
  ok('a staff photo comes one at a time', r.body && r.body.ok && r.body.photo === 'data:image/jpeg;base64,/9j/AAAA');
  r = await call('portalStaffPhoto', ['tool.team', '2468', 'st_min1']);
  ok('… not for ministry staff', r.body && r.body.ok === false);
  r = await call('portalStaffPhoto', ['tool.team', '2468', 'st_pp1']);
  ok('… nor another campus', r.body && r.body.ok === false);
  r = await call('portalMeetTeam', ['nobody', '0000']);
  ok('a stranger gets nothing', r.body && r.body.ok === false);

  r = await call('portalStrengths', ['tool.team', '2468']);
  ok('Team strengths: the same people as the photos, none with a type yet', r.body && r.body.ok && r.body.people.map(p => p.key).join() === 'leader,mabc1234' && Object.keys(r.body.results).length === 0, JSON.stringify(r.body && r.body.people));
  r = await call('portalSaveStrength', ['tool.team', '2468', 'leader', { type: 'XXXX' }]);
  ok('a made-up type is refused', r.body && r.body.err === 'bad_type');
  r = await call('portalSaveStrength', ['tool.team', '2468', 'stranger', { type: 'ENFJ' }]);
  ok('a type for someone not on the team is refused', r.body && r.body.err === 'bad_person');
  r = await call('portalSaveStrength', ['tool.team', '2468', 'leader', { type: 'enfj', scores: { E: 70, S: 40, T: 30, J: 65 }, source: 'test' }]);
  ok('the leader’s result saves, type upper-cased with its scores', r.body && r.body.ok && r.body.results.leader.type === 'ENFJ' && r.body.results.leader.scores.E === 70 && r.body.results.leader.source === 'test');
  r = await call('portalSaveStrength', ['tool.team', '2468', 'mabc1234', { type: 'ISTJ', source: 'picked', scores: { E: 1 } }]);
  ok('a member who knows their type: no scores kept when they are not all four', r.body && r.body.ok && r.body.results.mabc1234.type === 'ISTJ' && r.body.results.mabc1234.scores === null && r.body.results.mabc1234.source === 'picked');
  ok('the results live in their own blob', mem['tpers:cd_tool'] && mem['tpers:cd_tool'].people.leader.type === 'ENFJ');
  r = await call('portalStrengths', ['dara', '1234', 'cd_tool']);
  ok('portal staff read them on the record', r.body && r.body.ok && r.body.results.leader.type === 'ENFJ');
  r = await call('portalDeleteStrength', ['tool.team', '2468', 'mabc1234']);
  ok('a result can be removed to retake', r.body && r.body.ok && !r.body.results.mabc1234);
  r = await call('portalStrengths', ['solo.app', '2468']);
  ok('a lone applicant has just themselves ("me")', r.body && r.body.ok && r.body.people.length === 1 && r.body.people[0].key === 'me' && r.body.people[0].name === 'Sol Solo');
  r = await call('portalSaveStrength', ['solo.app', '2468', 'me', { type: 'INFP', source: 'test', scores: { E: 20, S: 30, T: 25, J: 40 } }]);
  ok('… and their result saves', r.body && r.body.ok && r.body.results.me.type === 'INFP');
  r = await call('portalStrengths', ['solo.app', '2468', 'cd_tool']);
  ok('one applicant cannot read another’s', !(r.body && r.body.ok && r.body.results && r.body.results.leader));

  r = await call('portalResources', ['solo.app', '2468']);
  ok('Resources: the shipped defaults until an admin edits — the leaders’ guide, the teams booklet, 117 / 118 / 119, the campus and the places list, the three apps',
    r.body && r.body.ok && r.body.isDefault === true && r.body.items.map(x => x.kind + ':' + x.title).join('|') === 'guide:Outreach Leader’s Guide|link:Guide for Short-Term Teams|phone:Police|phone:Fire|phone:Ambulance|link:Our campus — YWAM Siem Reap|link:Our favourite places in Siem Reap|app:Grab|app:PassApp|app:foodpanda' && r.body.items[2].value === '117' && /maps\.app\.goo\.gl/.test(r.body.items[5].value) && /google\.com\/maps/.test(r.body.items[6].value) && /grab\.com/.test(r.body.items[7].value), JSON.stringify(r.body && r.body.items.map(x => x.title)));
  r = await call('portalSaveResources', ['dara', '1234', [{ kind: 'link', title: 'x', value: 'y' }]]);
  ok('portal staff (not admin) cannot edit them', r.body && r.body.err === 'not_authorized');
  r = await call('portalSaveResources', ['sina', '1234', [
    { id: 'r_maps', kind: 'link', title: 'Our favourite places', note: 'Cafes and more', value: 'maps.app.goo.gl/abc' },
    { kind: 'phone', title: 'Tourist police', value: '+855 12 345 678 ext' },
    { kind: 'nonsense', title: 'A note', value: 'Drink bottled water.' },
    { kind: 'link', title: '   ', value: 'https://dropped.example' }]]);
  ok('a portal admin saves the list: links get https, phone numbers keep digits, an unknown kind becomes a link, a blank title is dropped',
    r.body && r.body.ok && r.body.isDefault === false && r.body.items.length === 3 && r.body.items[0].id === 'r_maps' && r.body.items[0].value === 'https://maps.app.goo.gl/abc' && r.body.items[1].value === '+855 12 345 678' && r.body.items[2].kind === 'link', JSON.stringify(r.body && r.body.items));
  r = await call('portalResources', ['tool.team', '2468']);
  ok('… and every applicant sees the saved list — the shipped items they left out stay out', r.body && r.body.items.length === 3 && r.body.items[1].title === 'Tourist police' && mem.portalResources.dropped.indexOf('r_grab') > -1);
  /* a list saved before the apps shipped: they join it on their own, and an empty address takes the shipped one */
  mem.portalResources = { items: [{ id: 'r_maps', kind: 'link', title: 'Our favourite places', note: '', value: '' }, { id: 'r_police', kind: 'phone', title: 'Police', value: '117' }], dropped: ['r_leaders', 'r_teams', 'r_fire', 'r_ambulance', 'r_campus'], updated: '2026-10-01T00:00:00Z' };
  r = await call('portalResources', ['tool.team', '2468']);
  ok('things shipped after an admin saved are added to their list; what they removed stays removed; an empty address takes the shipped one', r.body && r.body.items.map(x => x.id).join() === 'r_maps,r_police,r_grab,r_passapp,r_foodpanda' && /google\.com\/maps/.test(r.body.items[0].value), JSON.stringify(r.body && r.body.items.map(x => x.id)));
  r = await call('portalSaveResources', ['sina', '1234', [{ id: 'r_grab', kind: 'app', title: 'Grab', note: 'Tuk-tuks', value: 'grab.com/kh/download' }]]);
  ok('an app is a kind of its own, its link made https', r.body && r.body.ok && r.body.items[0].kind === 'app' && r.body.items[0].value === 'https://grab.com/kh/download');

  /* a portal admin fixes the cards from the portal */
  const jpg = 'x'.repeat(200);
  r = await call('portalMeetTeam', ['sina', '1234']);
  ok('a portal admin gets the same list, flagged editable; an applicant’s is not', r.body && r.body.ok && r.body.canEdit === true && r.body.staff.length === 2);
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { name: '  Chan Dara  ', role: 'Head host', photo: jpg }]);
  ok('… and fixes a campus staff card: name, role and photo, answered as the card plus the photo', r.body && r.body.ok && r.body.staff.name === 'Chan Dara' && r.body.staff.role === 'Head host' && r.body.staff.hasPhoto === true && r.body.photo === 'data:image/jpeg;base64,' + jpg, JSON.stringify(r.body));
  ok('… kept in the portal only: the GP app’s staff record is untouched', mem.staff.find(x => x.id === 'st_cs1').name === 'Chan Campus' && mem.staff.find(x => x.id === 'st_cs1').role === 'Host' && mem.staff.find(x => x.id === 'st_cs1').photo === 'data:image/jpeg;base64,/9j/AAAA' && mem.portalTeamCards && mem.portalTeamCards.cards.st_cs1.name === 'Chan Dara');
  r = await call('portalMeetTeam', ['tool.team', '2468']);
  ok('… and applicants see the portal’s version, flagged as edited', r.body && r.body.staff[0].name === 'Chan Dara' && r.body.staff[0].role === 'Head host' && r.body.staff[0].edited === true && r.body.staff[1].edited === false);
  r = await call('portalStaffPhoto', ['tool.team', '2468', 'st_cs1']);
  ok('… photo included', r.body && r.body.photo === 'data:image/jpeg;base64,' + jpg);
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { photo: '' }]);
  ok('an empty photo takes it off (in the portal), nothing else changes', r.body && r.body.ok && r.body.photo === '' && r.body.staff.hasPhoto === false && r.body.staff.name === 'Chan Dara' && mem.staff.find(x => x.id === 'st_cs1').photo === 'data:image/jpeg;base64,/9j/AAAA');
  r = await call('portalStaffPhoto', ['tool.team', '2468', 'st_cs1']);
  ok('… so applicants get no photo, not the GP app’s', r.body && r.body.ok && r.body.photo === '');
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { reset: true }]);
  ok('reset drops the portal’s changes and the card reads from the GP app again', r.body && r.body.ok && r.body.staff.name === 'Chan Campus' && r.body.staff.role === 'Host' && r.body.staff.hasPhoto === true && r.body.staff.edited === false && !mem.portalTeamCards.cards.st_cs1);
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { name: 'Chan Dara', role: 'Head host' }]);
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { name: '   ' }]);
  ok('a blank name is refused', r.body && r.body.ok === false && r.body.err === 'name_required');
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { photo: 'not base64!!' }]);
  ok('… so is a photo that is not base64', r.body && r.body.ok === false && r.body.err === 'bad_file');
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_cs1', { photo: 'A'.repeat(170 * 1024) }]);
  ok('… or too big', r.body && r.body.ok === false && r.body.err === 'too_large');
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_min1', { role: 'x' }]);
  ok('only the cards applicants see: not ministry staff', r.body && r.body.ok === false && r.body.err === 'not_found' && mem.staff.find(x => x.id === 'st_min1').role === 'Barista');
  r = await call('portalSaveStaffCard', ['sina', '1234', 'st_pp1', { role: 'x' }]);
  ok('… not another campus', r.body && r.body.ok === false && r.body.err === 'not_found');
  r = await call('portalSaveStaffCard', ['dara', '1234', 'st_cs1', { role: 'x' }]);
  ok('portal staff who are not admins cannot', r.body && r.body.ok === false && r.body.err === 'not_authorized');
  r = await call('portalSaveStaffCard', ['tool.team', '2468', 'st_cs1', { role: 'x' }]);
  ok('… nor an applicant', r.body && r.body.ok === false && r.body.err === 'not_authorized' && mem.portalTeamCards.cards.st_cs1.role === 'Head host');

  /* the preview carries the strengths so staff can see every tab */
  r = await call('portalViewAs', ['sina', '1234', { candidateId: 'cd_tool' }]);
  ok('View as applicant on a record carries the team’s strengths: the same people, their results', r.body && r.body.ok && r.body.strengths && r.body.strengths.people.map(p => p.key).join() === 'leader,mabc1234' && r.body.strengths.results.leader && r.body.strengths.results.leader.type === 'ENFJ', JSON.stringify(r.body && r.body.strengths));
  r = await call('portalViewAs', ['sina', '1234', { type: 'team', stage: 'docs' }]);
  ok('a sample team has two sample members, so the roster and strengths tabs have people on them', r.body && r.body.ok && r.body.application.members.length === 2 && r.body.strengths.people.map(p => p.name).join() === 'Sample Team,Sam Sample,Mia Sample' && Object.keys(r.body.strengths.results).length === 0, JSON.stringify(r.body && r.body.strengths));
  r = await call('portalViewAs', ['sina', '1234', { type: 'team', stage: 'new' }]);
  ok('… none before it has applied', r.body && r.body.ok && r.body.application.members.length === 0);
  delete mem.portalResources; delete mem.portalTeamCards; delete mem['tpers:cd_tool']; delete mem['tpers:cd_solo'];
  mem.staff = mem.staff.filter(x => ['st_cs1', 'st_yap1', 'st_min1', 'st_pp1', 'st_gone', 'st_tool', 'st_solo'].indexOf(x.id) === -1);
  mem.candidates = mem.candidates.filter(c => c.id !== 'cd_tool' && c.id !== 'cd_solo');
}

console.log('=== signing up ===');
let r = await call('portalRegister', [{ ...APP, username: 'A B' }]);
ok('username must be the same shape as a staff username', r.body.ok === false && r.body.err === 'bad_username');
r = await call('portalRegister', [{ ...APP, pin: '12' }]);
ok('PIN is four digits', r.body.ok === false && r.body.err === 'bad_pin');
r = await call('portalRegister', [{ ...APP, name: '  ' }]);
ok('a name is required', r.body.ok === false && r.body.err === 'name_required');
r = await call('portalRegister', [{ ...APP, email: 'nope' }]);
ok('a real email is required', r.body.ok === false && r.body.err === 'bad_email');
r = await call('portalRegister', [{ ...APP, phone: '12' }]);
ok('a phone number is required — staff reach out on it', r.body.ok === false && r.body.err === 'phone_required');
r = await call('portalRegister', [{ ...APP, messenger: 'signal' }]);
ok('WhatsApp or Telegram is required', r.body.ok === false && r.body.err === 'messenger_required');
r = await call('portalRegister', [{ ...APP, type: 'intern' }]);
ok('what you apply for must be a student, staff, volunteer or team', r.body.ok === false && r.body.err === 'type_required');
r = await call('portalRegister', [{ ...APP, school: 'mba' }]);
ok('a student names one of the four schools', r.body.ok === false && r.body.err === 'school_required');
r = await call('portalRegister', [{ ...APP, campus: 'phnompenh' }]);
ok('a campus is required — Poipet or Siem Reap', r.body.ok === false && r.body.err === 'campus_required');
r = await call('portalRegister', [{ ...APP, campus: 'poipet', school: 'bcs' }]);
ok('a school not run at that campus is refused (no BCS in Poipet)', r.body.ok === false && r.body.err === 'school_not_at_campus');
r = await call('portalRegister', [{ ...APP, username: 'uriah' }]);
ok('a username someone already has is refused', r.body.ok === false && r.body.err === 'taken');
r = await call('portalRegister', [{ ...APP, email: 'u@x.org' }]);
ok('so is an email someone already has', r.body.ok === false && r.body.err === 'email_taken');
r = await call('portalRegister', [APP]);
ok('a good sign-up answers with the applicant’s own dashboard', r.body.ok === true && r.body.role === 'applicant' && r.body.me.username === 'anna.b' && r.body.application.type === 'student' && r.body.application.school === 'dts');
ok('and with the application form, so "Fill out my application" works straight after sign-up', r.body.form && r.body.form.key === 'dts' && Array.isArray(r.body.form.sections));
ok('the application starts as a draft on the "fill out" step', r.body.application.status === 'draft' && r.body.application.steps.find(s => s.state === 'current').id === 'form');
ok('the account step is already done', r.body.application.steps[0].id === 'account' && r.body.application.steps[0].state === 'done');
const anna = mem.staff.find(s => s.username === 'anna.b');
ok('the account is kind:applicant, on Siem Reap, linked to its candidate', anna && anna.kind === 'applicant' && anna.campus === 'siemreap' && anna.applicant.candidateId && anna.applicant.type === 'student');
ok('the dashboard says which campus', r.body.application.campus === 'siemreap' && r.body.me.campus === 'siemreap');
const cand = mem.candidates.find(c => c.staffId === anna.id);
ok('the candidate record exists in the CRM, source portal, stage new, pointing back at the account', cand && cand.source === 'portal' && cand.stage === 'new' && cand.type === 'student' && cand.school === 'dts' && cand.messenger === 'whatsapp' && cand.id === anna.applicant.candidateId);
ok('no PIN or hash leaks in the sign-up answer', !JSON.stringify(r.body).includes(anna.pinHash) && !JSON.stringify(r.body).includes('2468'));
r = await call('portalRegister', [{ ...APP, username: 'tom.v', email: 'tom@example.org', type: 'volunteer', school: '', messenger: 'telegram', campus: 'poipet' }]);
ok('a volunteer signs up with no school, at Poipet', r.body.ok === true && r.body.application.type === 'volunteer' && r.body.application.school === '' && r.body.application.campus === 'poipet');
ok('and the account and candidate carry that campus', mem.staff.find(s => s.username === 'tom.v').campus === 'poipet' && mem.candidates.find(c => c.name === 'Anna Example').campus === 'siemreap' && mem.candidates.find(c => c.staffId === mem.staff.find(s => s.username === 'tom.v').id).campus === 'poipet');
r = await call('portalRegister', [{ ...APP, username: 'dbs.pp', email: 'dbs@example.org', school: 'dbs', campus: 'poipet' }]);
ok('Poipet runs DBS, so a DBS student may pick it', r.body.ok === true && r.body.application.school === 'dbs' && r.body.application.campus === 'poipet');
mem.staff = mem.staff.filter(s => s.username !== 'dbs.pp'); mem.candidates = mem.candidates.filter(c => c.name !== 'Anna Example' || c.school !== 'dbs');
const tom = mem.staff.find(s => s.username === 'tom.v');

console.log('\n=== an applicant is not staff ===');
r = await call('getMyBoot', ['anna.b', '2468']);
ok('the staff app’s boot refuses an applicant', r.body.ok === false, JSON.stringify(r.body).slice(0, 60));
r = await call('staffLogin', ['anna.b', '2468']);
ok('the staff login says "applicant" so the page can point at the portal', r.body.ok === false && r.body.err === 'applicant');
r = await call('saveDaily', ['anna.b', '2468', '2026-09-01', { habits: {} }]);
ok('an applicant cannot log a day', r.body.ok === false);
r = await call('saveGoals', ['anna.b', '2468', 30, [{ text: 'x', pct: 0 }]]);
ok('nor write goals', r.body.ok === false);
r = await call('hrCandidates', ['anna.b', '2468']);
ok('nor read the CRM', r.body.ok === false);
r = await call('hrSaveCandidate', ['anna.b', '2468', { id: cand.id, name: 'Anna', type: 'student', stage: 'accepted' }]);
ok('nor move their own stage', r.body.ok === false && mem.candidates.find(c => c.id === cand.id).stage === 'new');
r = await call('adminListStaff', ['anna.b', '2468']);
ok('nor reach admin', r.body.ok === false);
r = await call('staffProfile', ['uriah', '1234', anna.id]);
ok('a staff member cannot open an applicant as a teammate', r.body.ok === false);
r = await call('teamRoster', []);
ok('the roster leaves applicants out', r.body.every(p => p.username !== 'anna.b' && p.username !== 'tom.v') && r.body.length === 6);
r = await call('getMyBoot', ['uriah', '1234']);
ok('boot’s roster and base roster leave them out too', r.body.roster.every(p => p.username !== 'anna.b') && r.body.roster.length === 6);
r = await call('getMyBoot', ['dara', '1234']);
ok('boot tells the staff app who has portal access, for the menu item', r.body.staff.portalStaff === true && r.body.staff.portalAdmin === false);
r = await call('adminListStaff', ['uriah', '1234']);
ok('Admin’s account list is staff only', r.body.staff.every(p => p.username !== 'anna.b') && r.body.staff.length === 6);
r = await call('hrList', ['mealea', '1234']);
ok('and so is HR’s', r.body.ok === true && r.body.staff.every(p => p.username !== 'anna.b'));

console.log('\n=== who may open the portal ===');
r = await call('portalBoot', ['anna.b', '9999']);
ok('a wrong PIN is "auth"', r.body.ok === false && r.body.err === 'auth');
r = await call('portalBoot', ['anna.b', '2468']);
ok('an applicant sees their own application, nothing else', r.body.ok === true && r.body.role === 'applicant' && r.body.application.id === cand.id && !r.body.applicants);
ok('and none of the other applicant’s details', !JSON.stringify(r.body).includes('tom@example.org') && !JSON.stringify(r.body).includes('Tom'));
r = await call('portalBoot', ['bopha', '1234']);
ok('an ordinary staff member is told they have no access and shown nothing', r.body.ok === false && r.body.err === 'not_authorized' && !r.body.applicants);
r = await call('portalBoot', ['mealea', '1234']);
ok('HR access alone is not portal access', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalBoot', ['dara', '1234']);
ok('portal staff sees every applicant', r.body.ok === true && r.body.role === 'portal-staff' && r.body.applicants.length === 2);
ok('with each one’s contact and messenger for the one-tap chat', r.body.applicants.every(a => a.phone && a.messenger && a.hasAccount));
ok('and the list of portal staff to assign as owner', r.body.staff.map(x => x.username).sort().join(',') === 'dara,rithy,sina,uriah');
ok('an ordinary portal staff member’s scope is everything', r.body.scope === null);
ok('and which campus runs which school', JSON.stringify(r.body.campuses) === JSON.stringify({ poipet: ['dts', 'dbs'], siemreap: ['dts', 'dbs', 'bcs', 'sms'] }));
ok('no PIN material in the staff view either', !JSON.stringify(r.body).includes('pinHash') && !JSON.stringify(r.body).includes(anna.pinHash));
r = await call('portalBoot', ['sina', '1234']);
ok('a portal admin is "portal-admin"', r.body.ok === true && r.body.role === 'portal-admin');
r = await call('portalBoot', ['uriah', '1234']);
ok('an app admin is a portal admin without any flag', r.body.ok === true && r.body.role === 'portal-admin');

console.log('\n=== Outreach Teams sees teams only ===');
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Grace Church Team', type: 'team', stage: 'new', campus: 'siemreap' }]);
const teamCand = r.body.candidate;
ok('a team application exists (added by a portal admin)', r.body.ok === true && teamCand.type === 'team');
r = await call('portalBoot', ['rithy', '1234']);
ok('someone on Outreach Teams opens the portal on team applications only', r.body.ok === true && r.body.applicants.length === 1 && r.body.applicants[0].type === 'team' && JSON.stringify(r.body.scope) === '["team"]');
ok('and none of the students or volunteers reach them', !JSON.stringify(r.body).includes('anna@example.org') && !JSON.stringify(r.body).includes('tom@example.org'));
r = await call('hrSaveCandidate', ['rithy', '1234', { ...cand, stage: 'contacted' }]);
ok('they cannot move a student’s stage', r.body.ok === false && r.body.err === 'not_authorized' && mem.candidates.find(c => c.id === cand.id).stage === 'new');
r = await call('hrCandidateNote', ['rithy', '1234', cand.id, 'peeking']);
ok('nor note on one', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrArchiveCandidate', ['rithy', '1234', cand.id, { reason: 'x' }]);
ok('nor close one', r.body.ok === false && r.body.err === 'not_authorized' && !mem.candidates.find(c => c.id === cand.id).archived);
r = await call('hrSaveCandidate', ['rithy', '1234', { name: 'Sneaky Student', type: 'student', school: 'dts', stage: 'new', campus: 'siemreap' }]);
ok('nor add an application of a kind they cannot see', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrSaveCandidate', ['rithy', '1234', { ...teamCand, stage: 'contacted', nextStep: 'Send the hosting info' }]);
ok('but they work team applications freely — a team’s “contacted” is its 1st call', r.body.ok === true && r.body.candidate.stage === 'call1', r.body.candidate && r.body.candidate.stage);
r = await call('hrSaveCandidate', ['rithy', '1234', { ...teamCand, stage: 'docs' }]);
ok('a team takes its own stages', r.body.ok === true && r.body.candidate.stage === 'docs');
r = await call('hrSaveCandidate', ['rithy', '1234', { ...teamCand, stage: 'interview' }]);
ok('an older stage maps across (interview → 1st call)', r.body.ok === true && r.body.candidate.stage === 'call1');
r = await call('hrCandidateNote', ['rithy', '1234', teamCand.id, 'Team of 12, coming in March']);
ok('notes on a team too', r.body.ok === true);
r = await call('portalBoot', ['dara', '1234']);
ok('everyone else with access still sees teams alongside the rest', r.body.applicants.some(a => a.type === 'team') && r.body.applicants.some(a => a.type === 'student'));
r = await call('hrCandidates', ['mealea', '1234']);
ok('HR keeps its full reach', r.body.ok === true && r.body.candidates.some(c => c.type === 'team') && r.body.candidates.some(c => c.type === 'student'));

console.log('\n=== the Outreach Teams leader gets team applications without a tick ===');
mem.staff = mem.staff.concat([withPin({ id: 'st_otlead', name: 'Sokun Lead', username: 'sokun', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, leads: ['Community Service|Outreach Teams'], email: 'sk@x.org' })]);
r = await call('portalBoot', ['sokun', '1234']);
ok('leading Outreach Teams opens the portal, no Portal access tick needed', r.body.ok === true && r.body.role === 'portal-staff', JSON.stringify(r.body && [r.body.ok, r.body.err, r.body.role]));
ok('on team applications only', r.body.ok === true && JSON.stringify(r.body.scope) === '["team"]' && r.body.applicants.length && r.body.applicants.every(a => a.type === 'team'), JSON.stringify([r.body.scope, (r.body.applicants||[]).map(a => a.type)]));
ok('no student or volunteer reaches them', !JSON.stringify(r.body).includes('anna@example.org') && !JSON.stringify(r.body).includes('tom@example.org'));
r = await call('hrSaveCandidate', ['sokun', '1234', { ...cand, stage: 'contacted' }]);
ok('they cannot move a student’s stage', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('hrSaveCandidate', ['sokun', '1234', { ...teamCand, nextStep: 'Call the team leader' }]);
ok('they work team applications', r.body.ok === true && r.body.candidate.nextStep === 'Call the team leader', JSON.stringify(r.body));
r = await call('portalBoot', ['sina', '1234']);
ok('and they are in the portal’s own staff list, to own a team', r.body.staff.some(x => x.username === 'sokun'));
mem.staff = mem.staff.map(x => x.id === 'st_otlead' ? { ...x, leads: ['Youth Education|YDC'] } : x);
r = await call('portalBoot', ['sokun', '1234']);
ok('leading a different ministry gives no portal access', r.body.ok === false && r.body.err === 'not_authorized', JSON.stringify(r.body));
mem.staff = mem.staff.map(x => x.id === 'st_otlead' ? { ...x, leads: ['Community Service|Outreach Teams'], active: false } : x);
r = await call('portalBoot', ['sokun', '1234']);
ok('nor does leading it once the account is deactivated', r.body.ok === false);
mem.staff = mem.staff.map(x => x.id === 'st_otlead' ? { ...x, active: true, portalStaff: true } : x);
r = await call('portalBoot', ['sokun', '1234']);
ok('ticked Portal staff as well, they see every kind', r.body.ok === true && r.body.scope == null && r.body.applicants.some(a => a.type === 'student'), JSON.stringify(r.body.scope));
mem.staff = mem.staff.filter(x => x.id !== 'st_otlead');
mem.candidates = mem.candidates.filter(c => c.id !== teamCand.id);

console.log('\n=== granting access ===');
r = await call('portalSetAccess', ['bopha', '1234', 'st_plain', { portalStaff: true }]);
ok('an ordinary member cannot grant themselves access', r.body.ok === false && r.body.err === 'not_authorized' && !mem.staff.find(s => s.id === 'st_plain').portalStaff);
r = await call('portalSetAccess', ['dara', '1234', 'st_plain', { portalStaff: true }]);
ok('portal staff cannot grant access', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalSetAccess', ['sina', '1234', 'st_plain', { portalStaff: true }]);
ok('a portal admin grants portal-staff', r.body.ok === true && r.body.staff.portalStaff === true && mem.staff.find(s => s.id === 'st_plain').portalStaff === true);
r = await call('portalBoot', ['bopha', '1234']);
ok('and the person can open the portal at once', r.body.ok === true && r.body.role === 'portal-staff');
r = await call('portalSetAccess', ['sina', '1234', 'st_plain', { portalAdmin: true }]);
ok('a portal admin cannot make a portal admin', r.body.ok === false && r.body.err === 'not_authorized' && !mem.staff.find(s => s.id === 'st_plain').portalAdmin);
r = await call('portalSetAccess', ['uriah', '1234', 'st_plain', { portalAdmin: true }]);
ok('an app admin can', r.body.ok === true && r.body.staff.portalAdmin === true);
r = await call('portalSetAccess', ['uriah', '1234', anna.id, { portalStaff: true }]);
ok('never to an applicant account', r.body.ok === false && r.body.err === 'is_applicant' && !mem.staff.find(s => s.id === anna.id).portalStaff);
r = await call('portalSetAccess', ['sina', '1234', 'st_plain', { portalStaff: false }]);
ok('revoking works the same way', r.body.ok === true && r.body.staff.portalStaff === false);
r = await call('portalSetAccess', ['uriah', '1234', 'st_plain', { portalAdmin: false }]);
r = await call('portalBoot', ['bopha', '1234']);
ok('and closes the door again', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('adminUpdateStaff', ['uriah', '1234', 'st_plain', { portalStaff: true }]);
ok('Admin’s edit form sets the flag too', r.body.ok === true && r.body.staff.portalStaff === true && r.body.staff.kind === 'staff');
r = await call('adminUpdateStaff', ['uriah', '1234', anna.id, { portalStaff: true }]);
ok('but not on an applicant', r.body.ok === false && r.body.err === 'is_applicant');
r = await call('portalAccessList', ['sina', '1234']);
ok('Who has access: a portal admin lists every active staff member (no applicants) with the two flags and nothing private; not a GP app admin, so cannot grant admin',
  r.body.ok === true && r.body.canGrantAdmin === false && r.body.staff.length === mem.staff.filter(x => x.active !== false && !x.archived && x.kind !== 'applicant').length && r.body.staff.some(x => x.id === 'st_pstaff' && x.portalStaff === true && x.portalAdmin === false) && Object.keys(r.body.staff[0]).sort().join() === 'campus,dept,id,isAdmin,leadsTeams,ministry,name,portalAdmin,portalStaff', JSON.stringify(r.body.staff && r.body.staff[0]));
r = await call('portalAccessList', ['uriah', '1234']);
ok('… a GP app admin can', r.body.ok === true && r.body.canGrantAdmin === true && r.body.staff.some(x => x.isAdmin === true));
r = await call('portalAccessList', ['dara', '1234']);
ok('… portal staff cannot see it', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalSetAccess', ['uriah', '1234', 'nobody', { portalStaff: true }]);
ok('an unknown id is not found', r.body.ok === false && r.body.err === 'not_found');

console.log('\n=== the CRM and the timeline ===');
r = await call('hrSaveCandidate', ['dara', '1234', { ...cand, stage: 'applied' }]);
ok('portal staff moves a stage through the CRM handler', r.body.ok === true && r.body.candidate.stage === 'applied');
ok('the portal fields survive a CRM edit', r.body.candidate.messenger === 'whatsapp' && r.body.candidate.staffId === anna.id && r.body.candidate.portal && r.body.candidate.portal.createdAt);
r = await call('portalBoot', ['anna.b', '2468']);
ok('the applicant now sees "pending", with the leader reference as the current step — it goes in next to the application', r.body.application.status === 'pending' && r.body.application.steps.find(s => s.state === 'current').id === 'reference');
ok('the steps run application, reference, received, then we get in touch', r.body.application.steps.map(s => s.id).slice(0, 5).join(',') === 'account,form,reference,received,contact' && r.body.application.steps.filter(s => s.state === 'done').map(s => s.id).join(',') === 'account,form', r.body.application.steps.map(s => s.id + ':' + s.state).join(' '));
ok('the documents step no longer carries the reference', !r.body.application.steps.find(s => s.id === 'docs').items);
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'contacted', assignedTo: 'st_pstaff', nextStep: 'Call on WhatsApp' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('contacted → in review (the reference counts as in from here), documents current', r.body.application.status === 'in_review' && r.body.application.steps.find(s => s.state === 'current').id === 'docs');
ok('the applicant is not shown the staff’s internal next step or owner', !JSON.stringify(r.body).includes('Call on WhatsApp') && !JSON.stringify(r.body).includes('st_pstaff'));
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'interview' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('interview: documents step reads done, interview current', r.body.application.status === 'interview' && r.body.application.steps.find(s => s.id === 'docs').state === 'done' && r.body.application.steps.find(s => s.state === 'current').id === 'interview');
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'practical' }]);
ok('the new practical stage is accepted by the CRM', r.body.ok === true && r.body.candidate.stage === 'practical');
r = await call('portalBoot', ['anna.b', '2468']);
ok('accepted is done and getting ready is current', r.body.application.steps.find(s => s.id === 'accepted').state === 'done' && r.body.application.steps.find(s => s.state === 'current').id === 'practical');
r = await call('hrSaveCandidate', ['sina', '1234', { ...cand, stage: 'arrived' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('arrived: every step done', r.body.application.status === 'arrived' && r.body.application.steps.every(s => s.state === 'done'));
r = await call('hrCandidateNote', ['dara', '1234', cand.id, 'Spoke on WhatsApp, very keen']);
ok('portal staff adds a note', r.body.ok === true && r.body.candidate.log.some(l => l.kind === 'note'));
r = await call('hrSaveCandidate', ['dara', '1234', { name: 'Walk-in Lead', type: 'team', stage: 'new' }]);
ok('a team is a candidate type now', r.body.ok === true && r.body.candidate.type === 'team');
r = await call('hrArchiveCandidate', ['dara', '1234', cand.id, { reason: 'Test close' }]);
r = await call('portalBoot', ['anna.b', '2468']);
ok('an archived application reads closed to the applicant', r.body.application.status === 'closed' && r.body.application.archived);
r = await call('hrArchiveCandidate', ['dara', '1234', cand.id, null]);

console.log('\n=== the forms ===');
r = await call('portalBoot', ['dara', '1234']);
ok('the staff side gets every form, shipped defaults to start', r.body.forms && Object.keys(r.body.forms).sort().join(',') === 'bcs,dbs,dts,reference,sms,staff,team,volunteer' && r.body.forms.dts.isDefault === true && r.body.forms.team.sections.some(s => s.id === 'hospitality'));
ok('the team form opens with the team name, where it is from, then its leader and co-leaders', (() => { const ids = r.body.forms.team.sections[0].questions.map(q => q.id); return ids.slice(0, 5).join(',') === 'teamName,location,leaderName,leaderEmail,coLeaders' && r.body.forms.team.sections[0].questions[1].required; })(), r.body.forms.team.sections[0].questions.map(q => q.id).join(','));
ok('the team form asks males, females, couples/families, and one trip question (Siem Reap plus other places) that says who handles the visa', (() => { const f = r.body.forms.team; const qs = f.sections.flatMap(s => s.questions); const ids = qs.map(q => q.id); const it = qs.find(q => q.id === 'itinerary'); return ['males', 'females', 'couples', 'itinerary'].every(k => ids.includes(k)) && !ids.includes('arrivalKh') && it.type === 'stays' && it.required && /responsible for handling your visa/.test(it.help.en); })());
r = await call('portalRegister', [{ ...APP, username: 'fanny.f', email: 'fanny@example.org', country: 'Finland' }]);
const fanny = mem.staff.find(s => s.username === 'fanny.f'), fannyCand = mem.candidates.find(c => c.staffId === fanny.id);
r = await call('portalBoot', ['fanny.f', '2468']);
ok('an applicant gets only their own form, with its questions in Khmer and English', r.body.form && r.body.form.key === 'dts' && r.body.form.sections[0].questions[0].label.en && r.body.form.sections[0].questions[0].label.km);
ok('Fanny (Finland) is international: needs a reference and the visa guide', r.body.application.audience === 'international' && r.body.application.refNeeded === true && r.body.application.needsVisa === true && r.body.application.steps.some(s => s.id === 'reference'));
const dtsForm = r.body.form;
r = await call('portalSaveForm', ['dara', '1234', 'dts', dtsForm]);
ok('portal staff cannot edit a form', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalSaveForm', ['sina', '1234', 'mba', dtsForm]);
ok('an unknown form key is refused', r.body.ok === false && r.body.err === 'bad_key');
r = await call('portalSaveForm', ['sina', '1234', 'dts', { sections: 'nope' }]);
ok('a malformed form is refused', r.body.ok === false && r.body.err === 'bad_form');
const edited = JSON.parse(JSON.stringify(dtsForm));
edited.sections[0].questions[0].label.en = 'Your date of birth';
edited.sections.push({ id: 'extra', title: { en: 'One more thing', km: 'មួយទៀត' }, help: { en: '', km: '' }, questions: [{ id: 'shoe', type: 'choice', label: { en: 'Shoe size', km: 'ទំហំស្បែកជើង' }, required: true, audience: 'international', options: [{ en: 'Small', km: 'តូច' }, { en: 'Large', km: 'ធំ' }] }, { type: 'bogus', label: { en: 'Odd type becomes short', km: '' }, audience: 'martian' }, { id: 'nolabel', type: 'short', label: { en: '', km: '' } }] });
r = await call('portalSaveForm', ['sina', '1234', 'dts', edited]);
ok('a portal admin edits a form — relabel, add a section and questions', r.body.ok === true && r.body.form.sections[0].questions[0].label.en === 'Your date of birth' && r.body.form.sections.some(s => s.id === 'extra'));
const extra = r.body.form.sections.find(s => s.id === 'extra');
ok('the server cleans what it stores: unknown type → short, unknown audience → all, a question with no label is dropped', extra.questions.length === 2 && extra.questions[1].type === 'short' && extra.questions[1].audience === 'all' && extra.questions[0].options.length === 2);
ok('the stored form is no longer the default', r.body.forms.dts.isDefault === undefined && r.body.forms.dbs.isDefault === true);
r = await call('portalBoot', ['fanny.f', '2468']);
ok('the applicant sees the edited form at once', r.body.form.sections[0].questions[0].label.en === 'Your date of birth' && r.body.form.sections.some(s => s.id === 'extra'));

console.log('\n=== filling it in ===');
r = await call('portalSaveDraft', ['dara', '1234', { dob: '1999-01-01' }]);
ok('staff cannot save an applicant draft', r.body.ok === false);
r = await call('portalSaveDraft', ['fanny.f', '2468', { dob: '1999-01-01', gender: 'Female', nothing: 'x', testimony: 'A'.repeat(5000) }]);
ok('the applicant saves a draft — unknown ids dropped, long answers cut', r.body.ok === true && r.body.answers.dob === '1999-01-01' && r.body.answers.nothing === undefined && r.body.answers.testimony.length === 4000);
r = await call('portalBoot', ['fanny.f', '2468']);
ok('the draft comes back on boot, status still draft', r.body.application.answers.dob === '1999-01-01' && r.body.application.status === 'draft' && r.body.application.draftAt);
r = await call('portalSubmit', ['fanny.f', '2468']);
ok('submit with required answers missing is refused and says which', r.body.ok === false && r.body.err === 'missing' && r.body.missing.includes('testimony') === false && r.body.missing.includes('church') && r.body.missing.includes('shoe') && r.body.missing.includes('leaderContact'));
ok('a Khmer-only question is not demanded of an international applicant', !r.body.missing.includes('english') && r.body.missing.includes('leaderContact'));
const full = {};
dtsForm.sections.forEach(s => s.questions.forEach(qq => { if (qq.audience !== 'khmer') full[qq.id] = qq.type === 'multi' ? ['x'] : (qq.options && qq.options.length ? qq.options[0].en : (qq.type === 'date' ? '2000-01-01' : 'answer')); }));
full.shoe = 'Small';
r = await call('portalSubmit', ['fanny.f', '2468', full]);
ok('a complete submission goes through and moves the record to applied; the reference is what is left', r.body.ok === true && r.body.application.status === 'pending' && r.body.application.stage === 'applied' && r.body.application.submittedAt && r.body.application.steps.find(s => s.state === 'current').id === 'reference');
ok('the answers are on the record and the stage move is logged', mem.candidates.find(c => c.id === fannyCand.id).portal.form.answers.shoe === 'Small' && mem.candidates.find(c => c.id === fannyCand.id).log.some(l => l.kind === 'stage' && l.text === 'applied'));
r = await call('portalSaveDraft', ['fanny.f', '2468', { dob: '1980-01-01' }]);
ok('after submitting, the applicant cannot change answers', r.body.ok === false && r.body.err === 'submitted');
r = await call('portalSubmit', ['fanny.f', '2468', full]);
ok('nor submit twice', r.body.ok === false && r.body.err === 'submitted');
r = await call('portalBoot', ['dara', '1234']);
ok('staff see the answers on the record', r.body.applicants.find(a => a.id === fannyCand.id).portal.form.answers.church === 'answer');
r = await call('portalStaffSaveAnswers', ['dara', '1234', fannyCand.id, Object.assign({}, full, { church: 'Corrected Church' })]);
ok('staff correct an answer, and it is logged', r.body.ok === true && r.body.candidate.portal.form.answers.church === 'Corrected Church' && r.body.candidate.log.some(l => /Edited the application answers/.test(l.text)));
r = await call('portalStaffSaveAnswers', ['rithy', '1234', fannyCand.id, full]);
ok('but not outside their scope', r.body.ok === false && r.body.err === 'not_authorized');

console.log('\n=== the applicant updates their own answers after submitting ===');
r = await call('portalUpdateAnswers', ['fanny.f', '2468', Object.assign({}, full, { church: 'Updated Church' })]);
ok('an applicant corrects a submitted answer and gets their dashboard back', r.body.ok === true && r.body.role === 'applicant' && r.body.application.answers.church === 'Updated Church');
const fannyNow = mem.candidates.find(c => c.id === fannyCand.id);
ok('the record holds the new answers, an updatedAt and a log line; the stage did not move', fannyNow.portal.form.answers.church === 'Updated Church' && !!fannyNow.portal.form.updatedAt && fannyNow.log.some(l => /Updated their application answers/.test(l.text)) && fannyNow.stage === 'applied');
r = await call('portalUpdateAnswers', ['fanny.f', '2468', { church: 'x' }]);
ok('required answers still apply', r.body.ok === false && r.body.err === 'missing' && r.body.missing.length > 0);
r = await call('portalUpdateAnswers', ['dara', '1234', full]);
ok('staff cannot use the applicant handler', r.body.ok === false);
r = await call('portalUpdateAnswers', ['tom.v', '2468', full]);
ok('an applicant who has not submitted is told so', r.body.ok === false && r.body.err === 'not_submitted');

console.log('\n=== view as applicant (staff side) ===');
r = await call('portalViewAs', ['dara', '1234', { candidateId: fannyCand.id }]);
ok('portal staff see one applicant’s own dashboard, built like their boot: me, application, form', r.body.ok === true && r.body.preview === 'record' && r.body.role === 'applicant' && r.body.me.username === 'fanny.f' && r.body.application.id === fannyCand.id && r.body.application.status === 'pending' && r.body.form.key === 'dts' && Array.isArray(r.body.application.steps));
ok('and no PIN material comes with it', !JSON.stringify(r.body).includes('pinHash') && !JSON.stringify(r.body).includes('pinSalt'));
r = await call('portalViewAs', ['rithy', '1234', { candidateId: fannyCand.id }]);
ok('scope applies — Outreach Teams cannot view a student', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalViewAs', ['anna.b', '2468', { candidateId: fannyCand.id }]);
ok('an applicant cannot use it', r.body.ok === false);
r = await call('portalViewAs', ['dara', '1234', { candidateId: 'nope' }]);
ok('an unknown record is not found', r.body.ok === false && r.body.err === 'not_found');
r = await call('portalViewAs', ['dara', '1234', { type: 'student', school: 'dts', audience: 'khmer', stage: 'new' }]);
ok('a sample Khmer DTS student at "new": draft, no reference, no visa, the DTS form', r.body.ok === true && r.body.preview === 'sample' && r.body.application.audience === 'khmer' && r.body.application.refNeeded === false && r.body.application.needsVisa === false && r.body.application.status === 'draft' && r.body.form.key === 'dts' && r.body.application.steps.find(s => s.state === 'current').id === 'form');
r = await call('portalViewAs', ['dara', '1234', { type: 'team', stage: 'docs' }]);
ok('a sample team awaiting documents: submitted, visa guide, no reference, the team form', r.body.ok === true && r.body.application.type === 'team' && r.body.application.submittedAt && r.body.application.needsVisa === true && r.body.application.refNeeded === false && r.body.form.key === 'team' && r.body.application.status === 'docs', JSON.stringify(r.body.application && r.body.application.status));
r = await call('portalViewAs', ['dara', '1234', { type: 'student', school: 'dts', audience: 'international', stage: 'practical' }]);
ok('a sample international student at "getting ready": reference received, visa ticks set', r.body.ok === true && r.body.application.reference.status === 'received' && r.body.application.visa.flightsConfirmed === true && r.body.application.steps.find(s => s.id === 'reference').state === 'done');
r = await call('portalViewAs', ['dara', '1234', { type: 'student', school: 'bcs', campus: 'poipet' }]);
ok('a school not at that campus is refused', r.body.ok === false && r.body.err === 'school_not_at_campus');
ok('nothing was written', !mem.candidates.some(c => c.id === 'preview'));

console.log('\n=== the leader reference: link, form, submit ===');
r = await call('portalReferenceLink', ['fanny.f', '2468']);
ok('an international applicant makes a reference link', r.body.ok === true && /^[a-f0-9]{24,}$/.test(r.body.token) && r.body.reference.status === 'pending' && new Date(r.body.expiresAt) - Date.now() > 13 * 86400000);
const refToken1 = r.body.token;
ok('the record keeps only a hash of the token', !JSON.stringify(mem.candidates.find(c => c.id === fannyCand.id).portal.references).includes(refToken1));
r = await call('portalReferenceForm', [refToken1]);
ok('the leader opens the form by token, no account: applicant name, what for, the reference form — nothing else', r.body.ok === true && r.body.applicantName === fannyCand.name && r.body.applyingFor === 'DTS' && r.body.form.key === 'reference' && !JSON.stringify(r.body).includes('fanny@example.org') && !JSON.stringify(r.body).includes('+46'));
r = await call('portalReferenceForm', ['deadbeefdeadbeefdeadbeefdeadbeef']);
ok('an unknown token is invalid', r.body.ok === false && r.body.err === 'invalid');
r = await call('portalReferenceForm', ['<script>']);
ok('as is a malformed one', r.body.ok === false && r.body.err === 'invalid');
r = await call('portalReferenceLink', ['fanny.f', '2468']);
const refToken2 = r.body.token;
r = await call('portalReferenceForm', [refToken1]);
ok('making a new link revokes the old one', r.body.ok === false && r.body.err === 'expired' && refToken2 !== refToken1);
r = await call('portalReferenceSubmit', [refToken2, { leaderName: 'Pastor Example' }]);
ok('a reference with required answers missing is refused and says which', r.body.ok === false && r.body.err === 'missing' && r.body.missing.includes('leaderEmail') && r.body.missing.includes('recommend') && !r.body.missing.includes('rIntegrity'));
const refForm = (await call('portalReferenceForm', [refToken2])).body.form, refFull = {};
refForm.sections.forEach(sec => sec.questions.forEach(q => { if (q.required) refFull[q.id] = q.type === 'email' ? 'pastor@example.org' : q.options.length ? q.options[0].en : 'A thoughtful answer'; }));
refFull.rIntegrity = '5 — Excellent'; refFull.leaderName = 'Pastor Example';
r = await call('portalReferenceSubmit', [refToken2, refFull]);
ok('a complete reference is accepted', r.body.ok === true && r.body.applicantName === fannyCand.name);
const fannyRef = mem.candidates.find(c => c.id === fannyCand.id);
ok('the record marks the reference done, keeps the answers and the leader, and logs it', fannyRef.portal.referenceDone === true && fannyRef.portal.references.find(x => x.usedAt).answers.rIntegrity === '5 — Excellent' && fannyRef.portal.references.find(x => x.usedAt).leaderName === 'Pastor Example' && fannyRef.log.some(l => /Leader reference received from Pastor Example/.test(l.text)));
{ const st = (await call('portalBoot', ['fanny.f', '2468'])).body.application.steps, by = Object.fromEntries(st.map(x => [x.id, x.state]));
  ok('with the reference in, its step is done; received waits for the application too', by.reference === 'done' && (by.received === 'done') === !!fannyRef.portal.submittedAt, JSON.stringify(by)); }
{ const before = fannyRef.portal.submittedAt;
  if (!before) { const st = (await call('portalBoot', ['fanny.f', '2468'])).body.application.steps;
    ok('… the application is now the one thing left before we get in touch', st.find(x => x.state === 'current').id === 'form'); } }
r = await call('portalReferenceSubmit', [refToken2, refFull]);
ok('the link is single-use', r.body.ok === false && r.body.err === 'used');
r = await call('portalReferenceForm', [refToken2]);
ok('and says so when opened again', r.body.ok === false && r.body.err === 'used');
r = await call('portalBoot', ['fanny.f', '2468']);
ok('the applicant sees "received" with the leader’s name and the reference item ticked', r.body.application.reference.status === 'received' && r.body.application.reference.leaderName === 'Pastor Example' && r.body.application.steps.find(s => s.id === 'reference').state === 'done');
ok('the applicant is not shown what the leader wrote', !JSON.stringify(r.body.application).includes('A thoughtful answer'));
r = await call('portalReferenceLink', ['fanny.f', '2468']);
ok('no new link once a reference is in', r.body.ok === false && r.body.err === 'received');
r = await call('portalBoot', ['dara', '1234']);
ok('staff see the reference and can read it on the record', r.body.applicants.find(a => a.id === fannyCand.id).reference.status === 'received' && r.body.applicants.find(a => a.id === fannyCand.id).reference.answers.recommend === 'Highly recommend');
const tomCand = mem.candidates.find(c => c.staffId === tom.id);
r = await call('portalReferenceLink', ['rithy', '1234', tomCand.id]);
ok('Outreach Teams staff cannot make a link for a volunteer', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalReferenceLink', ['dara', '1234', tomCand.id]);
ok('portal staff make a link from the record', r.body.ok === true && /^[a-f0-9]{24,}$/.test(r.body.token));
const tomToken = r.body.token;
mem.candidates.find(c => c.id === tomCand.id).portal.references[0].expiresAt = new Date(Date.now() - 1000).toISOString();
r = await call('portalReferenceForm', [tomToken]);
ok('a link past its date has expired', r.body.ok === false && r.body.err === 'expired');
r = await call('portalReferenceSubmit', [tomToken, {}]);
ok('and cannot be submitted', r.body.ok === false && r.body.err === 'expired');
r = await call('portalBoot', ['tom.v', '2468']);
ok('the applicant sees the link as expired', r.body.application.reference.status === 'expired');

console.log('\n=== Khmer students, teams, visas ===');
r = await call('portalRegister', [{ ...APP, username: 'srey.k', email: 'srey@example.org', country: 'Cambodia', campus: 'siemreap', school: 'dts' }]);
ok('a Khmer student needs no leader reference — no reference step', r.body.ok === true && r.body.application.audience === 'khmer' && r.body.application.refNeeded === false && r.body.application.needsVisa === false && !r.body.application.steps.some(s => s.id === 'reference'));
r = await call('portalBoot', ['srey.k', '2468']);
const srey = mem.staff.find(s => s.username === 'srey.k');
r = await call('portalReferenceLink', ['srey.k', '2468']);
ok('a Khmer student is told no reference is needed', r.body.ok === false && r.body.err === 'not_needed');
r = await call('portalSubmit', ['srey.k', '2468', {}]);
ok('a Khmer student is asked the Khmer-only question and not the international one', r.body.missing.includes('english') && !r.body.missing.includes('leaderContact'));
r = await call('portalRegister', [{ ...APP, username: 'team.au', email: 'team@example.org', type: 'team', school: '', country: 'Australia', campus: 'siemreap', teamName: '  Grace Church Team  ' }]);
ok('a team names its sending church at sign-up, and the form starts with it filled in', r.body.ok === true && r.body.application.answers.teamName === 'Grace Church Team', JSON.stringify(r.body.application && r.body.application.answers));
ok('a team needs no leader reference but does need the visa guide', r.body.ok === true && r.body.application.refNeeded === false && r.body.application.needsVisa === true && r.body.application.formKey === 'team');
const teamAcct = mem.staff.find(s => s.username === 'team.au'), teamRec = mem.candidates.find(c => c.staffId === teamAcct.id);
ok('so staff see the team’s name from the first day (it is the draft’s teamName, which the staff list shows)', teamRec.portal.draft && teamRec.portal.draft.teamName === 'Grace Church Team' && (await call('portalBoot', ['sina', '1234'])).body.applicants.find(c => c.id === teamRec.id).portal.draft.teamName === 'Grace Church Team');
{ const m = await call('portalRegister', [{ ...APP, username: 'stud.x', email: 'studx@example.org', teamName: 'Not A Team' }]);
  const c = mem.candidates.find(x => x.staffId === (mem.staff.find(s => s.username === 'stud.x') || {}).id);
  ok('a student’s sign-up ignores a team name', m.body.ok === true && c && !c.portal.draft, JSON.stringify(c && c.portal));
  await call('portalDeleteApplicant', ['sina', '1234', c.id]); }

console.log('\n=== team co-leaders: add as many ===');
{ const tq = (await call('portalBoot', ['sina', '1234'])).body.forms.team.sections.flatMap(s => s.questions).find(q => q.id === 'coLeaders');
  ok('the team form has an optional co-leaders list', tq && tq.type === 'people' && !tq.required && /co-leader/i.test(tq.addLabel.en)); }
r = await call('portalSaveDraft', ['team.au', '2468', { coLeaders: [{ name: '  Sam Co  ', email: 'sam@example.org', phone: '+61 1' }, { name: '', email: 'blank@example.org' }, { name: 'Jo Co' }, 'junk', { name: 'x'.repeat(300) }] }]);
ok('co-leaders are cleaned: names trimmed and cut, rows without a name dropped, as many as given', r.body.ok === true && JSON.stringify(r.body.answers.coLeaders.map(p => [p.name.length > 100 ? 'long' : p.name, p.email, p.phone])) === JSON.stringify([['Sam Co', 'sam@example.org', '+61 1'], ['Jo Co', '', ''], ['long', '', '']]), JSON.stringify(r.body.answers.coLeaders));

console.log('\n=== team trip: Siem Reap and other places ===');
const teamFull = { teamName: 'Grace Church Team', location: 'Sydney, Australia', org: 'Grace Church', leaderName: 'Pat Leader', leaderEmail: 'pat@example.org', size: '14', focus: 'Kids programmes', males: '6', females: '8', couples: '2', flightsBooked: 'Yes' };
r = await call('portalSaveDraft', ['team.au', '2468', { ...teamFull, itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-20', to: '2027-01-10' }, { place: '', from: '', to: '' }, { place: 'Phnom Penh', from: '2027-01-20', to: '2027-01-23' }, { place: 'x'.repeat(200), from: 'soon', to: '2027-02-01' }, 'junk'] }]);
ok('a trip is cleaned: reversed dates swapped, empty rows dropped, bad dates blanked, long names cut', r.body.ok === true && JSON.stringify(r.body.answers.itinerary.map(x => [x.place.length > 60 ? 'long' : x.place, x.from, x.to])) === JSON.stringify([['YWAM Siem Reap', '2027-01-10', '2027-01-20'], ['Phnom Penh', '2027-01-20', '2027-01-23'], ['long', '', '2027-02-01']]) && r.body.answers.itinerary[2].place.length === 80 && r.body.answers.itinerary[0].base === true, JSON.stringify(r.body.answers.itinerary));
r = await call('portalSubmit', ['team.au', '2468', { ...teamFull, itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-10', to: '' }] }]);
ok('Siem Reap needs both dates before the application goes in', r.body.ok === false && r.body.err === 'missing' && r.body.missing.includes('itinerary'));
r = await call('portalSubmit', ['team.au', '2468', { ...teamFull, itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-10', to: '2027-01-20' }, { place: 'Battambang', from: '2027-01-20', to: '' }] }]);
ok('and an added place needs its name and both dates too', r.body.ok === false && r.body.missing.includes('itinerary'));
r = await call('portalUploadDoc', ['team.au', '2468', 'evisa', 'e.pdf', 'application/pdf', 'JVBERi0x']);
ok('documents open only once the application is in', r.body.ok === false && r.body.err === 'not_submitted');
r = await call('portalSubmit', ['team.au', '2468', { ...teamFull, flightsBooked: undefined, itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-10', to: '2027-01-20' }] }]);
ok('the team form asks whether flights are booked yet (required)', r.body.ok === false && r.body.missing.includes('flightsBooked'));
r = await call('portalUploadDoc', ['team.au', '2468', 'flights', 'itinerary.pdf', 'application/pdf', 'JVBERi0xLjcK']);
ok('but the flight itinerary the form asks for can be attached while filling it in', r.body.ok === true && r.body.doc.kind === 'flights');
const earlyFlight = r.body.doc;
r = await call('portalSubmit', ['team.au', '2468', { ...teamFull, itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-10', to: '2027-01-20' }, { place: 'Phnom Penh', from: '2027-01-20', to: '2027-01-23' }] }]);
ok('Siem Reap only, or with other places, goes in', r.body.ok === true && r.body.application.submittedAt && r.body.application.answers.itinerary.length === 2);
ok('the team is told what to send: passport copies, a team photo and flights first, then the letter of invitation from us and their e-visas — the itinerary attached in the form is already there', JSON.stringify(r.body.application.docKinds) === JSON.stringify([{ id: 'passports', required: true }, { id: 'photo', required: true }, { id: 'flights', required: true }, { id: 'invitation', required: false, from: 'us' }, { id: 'evisa', required: false }]) && r.body.application.docs.length === 1 && r.body.application.docs[0].id === earlyFlight.id);
r = await call('portalDeleteDoc', ['team.au', '2468', earlyFlight.id]);
r = await call('portalSubmit', ['srey.k', '2468', {}]);

console.log('\n=== team documents ===');
{ const tf = JSON.parse(JSON.stringify((await call('portalBoot', ['sina', '1234'])).body.forms.team)); delete tf.isDefault;
  r = await call('portalSaveForm', ['sina', '1234', 'team', tf]);
  ok('a form saved in the editor keeps the question’s attach box', r.body.ok === true && r.body.forms.team.sections.flatMap(s => s.questions).find(q => q.id === 'flightsBooked').attach === 'flights');
  r = await call('portalResetForm', ['sina', '1234', 'team']); }
r = await call('portalUploadDoc', ['team.au', '2468', 'visa-selfie', 'p.pdf', 'application/pdf', 'JVBERi0x']);
ok('an unknown kind is refused', r.body.ok === false && r.body.err === 'bad_kind');
r = await call('portalUploadDoc', ['team.au', '2468', 'passports', 'p.exe', 'application/x-msdownload', 'TVqQ']);
ok('only PDFs and pictures', r.body.ok === false && r.body.err === 'bad_type');
r = await call('portalUploadDoc', ['team.au', '2468', 'passports', 'big.pdf', 'application/pdf', 'A'.repeat(6 * 1024 * 1024)]);
ok('and nothing over about 4 MB', r.body.ok === false && r.body.err === 'too_large');
r = await call('portalUploadDoc', ['team.au', '2468', 'passports', 'passports.pdf', 'application/pdf', 'JVBERi0xLjQK']);
const pdoc = r.body.doc;
ok('a team uploads its passport copies; the record lists the file, the blob holds it', r.body.ok === true && pdoc.kind === 'passports' && pdoc.name === 'passports.pdf' && mem.candidates.find(c => c.id === teamRec.id).portal.docs.length === 1 && !JSON.stringify(mem.candidates.find(c => c.id === teamRec.id).portal.docs).includes('JVBERi0xLjQK') && !!mem['pdoc:' + pdoc.id]);
ok('uploading them ticks the team’s Passport copies step by itself', r.body.application.steps.find(s => s.id === 'passports').done === true);
r = await call('portalUploadDoc', ['team.au', '2468', 'photo', 'team.jpg', 'image/jpeg', '/9j/4AAQ']);
ok('and the team photo its own', r.body.ok === true && r.body.application.steps.find(s => s.id === 'photo').done === true);
r = await call('portalGetDoc', ['team.au', '2468', pdoc.id]);
ok('the team opens its own file', r.body.ok === true && r.body.dataUrl === 'data:application/pdf;base64,JVBERi0xLjQK');
r = await call('portalGetDoc', ['anna.b', '2468', pdoc.id]);
ok('another applicant cannot', r.body.ok === false && r.body.err === 'not_found');
r = await call('portalGetDoc', ['rithy', '1234', pdoc.id]);
ok('Outreach Teams staff open a team’s file', r.body.ok === true && /^data:application\/pdf/.test(r.body.dataUrl));
{ const bopha = mem.staff.find(s => s.id === 'st_plain'); bopha.portalStaff = false; bopha.portalAdmin = false; bopha.hr = false; }  // no portal access, no HR
r = await call('portalGetDoc', ['bopha', '1234', pdoc.id]);
ok('staff without portal access cannot', r.body.ok === false);
r = await call('portalUploadDoc', ['rithy', '1234', 'flights', 'flights.pdf', 'application/pdf', 'JVBERi0xLjUK', teamRec.id]);
ok('staff upload a file the team emailed them, onto that record', r.body.ok === true && r.body.doc.kind === 'flights' && r.body.doc.by === 'st_teams');
const fdoc = r.body.doc;
r = await call('portalDeleteDoc', ['anna.b', '2468', fdoc.id]);
ok('another applicant cannot remove it', r.body.ok === false);
r = await call('portalDeleteDoc', ['team.au', '2468', fdoc.id]);
ok('the team removes a file; the blob goes too', r.body.ok === true && r.body.docs.length === 2 && !mem['pdoc:' + fdoc.id]);
r = await call('portalBoot', ['dara', '1234']);
ok('staff see the list on the record, with no file contents', r.body.applicants.find(a => a.id === teamRec.id).portal.docs.length === 2 && !JSON.stringify(r.body).includes('JVBERi0xLjQK'));
r = await call('portalSetVisaFlags', ['dara', '1234', teamRec.id, { flightsConfirmed: true }]);
ok('staff tick "flights confirmed" on a team', r.body.ok === true && r.body.candidate.portal.visa.flightsConfirmed === true && !r.body.candidate.portal.visa.invitationSent);
r = await call('portalSetVisaFlags', ['rithy', '1234', teamRec.id, { invitationSent: true }]);
ok('Outreach Teams staff tick "letter of invitation sent" on a team', r.body.ok === true && r.body.candidate.portal.visa.invitationSent === true);
r = await call('portalSetVisaFlags', ['rithy', '1234', cand.id, { invitationSent: true }]);
ok('but not on a student', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalBoot', ['team.au', '2468']);
ok('the team sees both flags on their dashboard', r.body.application.visa.flightsConfirmed === true && r.body.application.visa.invitationSent === true);

console.log('\n=== a team’s journey ===');
await call('portalSetVisaFlags', ['dara', '1234', teamRec.id, { flightsConfirmed: false, invitationSent: false }]);
for (const d of mem.candidates.find(c => c.id === teamRec.id).portal.docs.filter(d => d.kind === 'flights' || d.kind === 'photo')) await call('portalDeleteDoc', ['dara', '1234', d.id]);
mem.candidates = mem.candidates.map(c => c.id === teamRec.id ? { ...c, stage: 'applied' } : c);
r = await call('portalBoot', ['team.au', '2468']);
const stepIds = (b) => b.application.steps.map(st => st.id).join(',');
ok('a team from abroad: apply, 1st call, passports, photo, flights, letter of invitation, e-visa, 2nd call, getting ready, arrival', stepIds(r.body) === 'account,form,call1,passports,photo,flights,invitation,evisa,call2,practical,arrived', stepIds(r.body));
ok('no reference, no interview, no generic documents step', !r.body.application.steps.some(st => ['docs', 'reference', 'interview', 'accepted'].includes(st.id)));
ok('the documents and the visa part are grouped', r.body.application.steps.filter(st => st.group === 'docs').map(st => st.id).join(',') === 'passports,photo,flights' && r.body.application.steps.filter(st => st.group === 'visa').map(st => st.id).join(',') === 'invitation,evisa');
ok('the 1st call is the step they are on', r.body.application.steps.find(st => st.state === 'current').id === 'call1');
r = await call('portalTeamStep', ['team.au', '2468', teamRec.id, 'call1', true]);
ok('the team cannot tick its own steps', r.body.ok === false);
r = await call('portalTeamStep', ['rithy', '1234', cand.id, 'call1', true]);
ok('nor can a step be ticked on a student', r.body.ok === false);
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'passports', true]);
ok('a step that ticks itself cannot be ticked by hand', r.body.ok === false && r.body.err === 'bad_step');
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'call1', true]);
ok('staff tick the 1st call; the team moves to Awaiting documents', r.body.ok === true && r.body.candidate.stage === 'docs' && !!r.body.candidate.portal.team.call1, r.body.candidate && r.body.candidate.stage);
ok('and it is on the log', r.body.candidate.log.slice(-2).map(l => l.kind + ':' + l.text).join('|') === 'note:✓ 1st call|stage:docs', JSON.stringify(r.body.candidate.log.slice(-2)));
ok('with passports in, the team photo is next', r.body.candidate.steps.find(st => st.state === 'current').id === 'photo');
r = await call('portalUploadDoc', ['team.au', '2468', 'photo', 'team.jpg', 'image/jpeg', '/9j/4AAQ']);
r = await call('portalUploadDoc', ['team.au', '2468', 'flights', 'flights.pdf', 'application/pdf', 'JVBERi0xLjUK']);
ok('with the photo and flights in, the visa part is next: our letter of invitation', r.body.ok === true && r.body.application.steps.find(st => st.state === 'current').id === 'invitation' && r.body.application.stage === 'docs');
r = await call('portalUploadDoc', ['team.au', '2468', 'invitation', 'loi.pdf', 'application/pdf', 'JVBERi0xLjIK']);
ok('the team cannot upload the letter of invitation — it comes from us', r.body.ok === false && r.body.err === 'from_us');
r = await call('portalUploadDoc', ['rithy', '1234', 'invitation', 'Invitation letter.pdf', 'application/pdf', 'JVBERi0xLjIK', teamRec.id]);
const loi = r.body.doc;
ok('staff upload it with the supporting documents, and it ticks itself', r.body.ok === true && loi.kind === 'invitation' && r.body.application.steps.find(st => st.id === 'invitation').done === true);
r = await call('portalGetDoc', ['team.au', '2468', loi.id]);
ok('the team opens it to download', r.body.ok === true && /^data:application\/pdf/.test(r.body.dataUrl));
r = await call('portalDeleteDoc', ['team.au', '2468', loi.id]);
ok('but cannot remove it', r.body.ok === false && r.body.err === 'from_us');
r = await call('portalUploadDoc', ['team.au', '2468', 'evisa', 'evisas.pdf', 'application/pdf', 'JVBERi0xLjYK']);
ok('the approved e-visas in, the team moves on to its 2nd call by itself', r.body.ok === true && r.body.application.stage === 'call2' && r.body.application.steps.find(st => st.state === 'current').id === 'call2', r.body.application && r.body.application.stage);
ok('logged as a stage move', mem.candidates.find(c => c.id === teamRec.id).log.slice(-1)[0].text === 'call2');
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'call2', true]);
ok('staff tick the 2nd call (cultural orientation); the team is Getting ready', r.body.ok === true && r.body.candidate.stage === 'practical' && r.body.candidate.steps.find(st => st.state === 'current').id === 'practical');
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'call1', false]);
ok('unticking the 1st call later does not move the stage back', r.body.ok === true && r.body.candidate.stage === 'practical');
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'arrived', true]);
ok('Arrived: every step is done', r.body.ok === true && r.body.candidate.stage === 'arrived' && r.body.candidate.steps.every(st => st.done));
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'arrived', false]);
ok('unticking Arrived steps back to Getting ready', r.body.ok === true && r.body.candidate.stage === 'practical');
r = await call('portalBoot', ['sina', '1234']);
ok('the staff side gets the team stages', JSON.stringify(r.body.teamStages) === '["new","applied","call1","docs","call2","practical","arrived"]');
r = await call('portalViewAs', ['sina', '1234', { type: 'team', audience: 'khmer', stage: 'docs' }]);
ok('a team from Cambodia has no letter or e-visa steps', r.body.ok === true && stepIds(r.body) === 'account,form,call1,passports,photo,flights,call2,practical,arrived', stepIds(r.body));

console.log('\n=== a team application is a team in the Teams Database ===');
const linked = () => (mem.teamTrips || []).filter(t => t.candidateId === teamRec.id);
ok('the submitted application made one linked team', linked().length === 1 && linked()[0].id === 'ta_' + teamRec.id, JSON.stringify(mem.teamTrips));
{ const t = linked()[0];
  ok('named by its sending church, with where it is from, its Siem Reap dates and head counts', t.name === 'Grace Church Team' && t.org === 'Grace Church Team' && t.country === 'Sydney, Australia' && t.from === '2027-01-10' && t.to === '2027-01-20' && t.size === 14 && t.males === 6 && t.females === 8 && t.couples === 2 && t.campus === 'siemreap' && t.status === 'active', JSON.stringify(t)); }
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('Outreach Teams sees it in the Teams Database', r.body.ok === true && r.body.trips.some(t => t.candidateId === teamRec.id));
r = await call('portalUpdateAnswers', ['team.au', '2468', { ...teamFull, size: '16', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-12', to: '2027-01-22' }] }]);
ok('the team changing its answers updates it', r.body.ok === true && linked().length === 1 && linked()[0].size === 16 && linked()[0].from === '2027-01-12', JSON.stringify(linked()));
r = await call('portalBoot', ['team.au', '2468']);
ok('the team’s dashboard knows its team and the Outreach Teams metric overrides', r.body.application.trip && r.body.application.trip.id === 'ta_' + teamRec.id && Array.isArray(r.body.metricOverrides));
r = await call('portalSaveTeamNumbers', ['team.au', '2468', { 'People Served': 120 }, {}]);
ok('the team can’t enter numbers before it has arrived', r.body.ok === false && r.body.err === 'not_arrived' && !(linked()[0].metrics || {})['People Served'], JSON.stringify(r.body).slice(0, 100));
const stageBefore = mem.candidates.find(c => c.id === teamRec.id).stage;
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'arrived', true]);
r = await call('portalSaveTeamNumbers', ['team.au', '2468', { 'People Served': 120, 'Salvations': 4, 'Teams Hosted': 9 }, { male: 40, female: 55 }]);
ok('once arrived, the team enters its numbers on the portal', r.body.ok === true && linked()[0].metrics['People Served'] === 120 && linked()[0].metrics['Salvations'] === 4 && linked()[0].reached.male === 40 && r.body.application.trip.metrics['People Served'] === 120);
ok('Teams Hosted is counted by the app, never typed', linked()[0].metrics['Teams Hosted'] === undefined);
r = await call('portalTeamStep', ['rithy', '1234', teamRec.id, 'arrived', false]);
mem.candidates.find(c => c.id === teamRec.id).stage = stageBefore;
r = await call('portalSaveTeamNumbers', ['anna.b', '2468', { 'People Served': 1 }, {}]);
ok('a student has no team numbers', r.body.ok === false);
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
{ const t = r.body.trips.find(x => x.candidateId === teamRec.id);
  r = await call('saveTeamTrip', ['rithy', '1234', { ...t, metrics: { ...t.metrics, 'People Served': 130 }, staff: 'Rithy' }]); }
ok('staff edit the numbers in the Teams Database, and it stays linked', r.body.ok === true && linked().length === 1 && linked()[0].metrics['People Served'] === 130 && linked()[0].staff === 'Rithy');
r = await call('portalUpdateAnswers', ['team.au', '2468', { ...teamFull, size: '16', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-12', to: '2027-01-22' }] }]);
ok('a later answer change keeps the numbers and what staff added', linked()[0].metrics['People Served'] === 130 && linked()[0].staff === 'Rithy');
r = await call('hrArchiveCandidate', ['rithy', '1234', teamRec.id, { reason: 'Postponed' }]);
ok('closing the application cancels the team', linked()[0].status === 'cancelled');
r = await call('hrArchiveCandidate', ['rithy', '1234', teamRec.id, null]);
ok('reopening it brings it back', linked()[0].status === 'active');
r = await call('deleteTeamTrip', ['rithy', '1234', 'ta_' + teamRec.id]);
r = await call('portalUpdateAnswers', ['team.au', '2468', { ...teamFull, size: '15', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-01-12', to: '2027-01-22' }] }]);
ok('a team deleted in the Teams Database stays deleted', !(mem.teamTrips || []).some(t => t.candidateId === teamRec.id && !t.deleted));

// applications that came in before the link — they appear the next time the Teams Database is opened
{ var old = (id, extra) => ({ id, campus: 'siemreap', name: 'Leader ' + id, type: 'team', stage: 'applied', country: 'United States', log: [], archived: null, ...extra });
  mem.candidates = mem.candidates.concat([
    old('cd_old1', { portal: { submittedAt: '2026-09-20T10:00:00Z', form: { answers: { teamName: 'Example Cascades Team', location: 'Oregon, USA', size: '10', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-02-01', to: '2027-02-14', base: true }] } } } }),
    old('cd_old2', { portal: { submittedAt: '2026-06-01T10:00:00Z', form: { answers: { teamName: 'Older Form Team', arrival: '2027-03-10', departure: '2027-03-01' } } } }),
    old('cd_draft', { stage: 'new', portal: { draft: { teamName: 'Draft Team', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-04-01', to: '2027-04-05', base: true }] } } }),
    old('cd_closed', { archived: { at: '2026-09-01' }, portal: { submittedAt: '2026-08-01T10:00:00Z', form: { answers: { teamName: 'Closed Team', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-05-01', to: '2027-05-05', base: true }] } } } })
  ]); }
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('an application submitted before the link shows up when the Teams Database opens', r.body.ok === true && r.body.trips.some(t => t.candidateId === 'cd_old1' && t.name === 'Example Cascades Team' && t.from === '2027-02-01' && t.size === 10), JSON.stringify(r.body.trips.map(t => t.name)));
ok('one from the older form takes its earliest and latest dates', r.body.trips.some(t => t.candidateId === 'cd_old2' && t.from === '2027-03-01' && t.to === '2027-03-10'));
ok('a draft with Siem Reap dates goes in too, pending at New', r.body.trips.some(t => t.candidateId === 'cd_draft' && t.pending && t.portalStage === 'new' && t.from === '2027-04-01'));
ok('not a closed application', !r.body.trips.some(t => t.candidateId === 'cd_closed'));
mem.candidates = mem.candidates.concat([old('cd_nodates', { stage: 'applied', portal: { submittedAt: '2026-09-25T10:00:00Z', form: { answers: { teamName: 'No Dates Team' } } } })]);
r = await call('portalStaffSyncTeam', ['rithy', '1234', 'cd_nodates']);
ok('a team with no dates yet goes in too, waiting for them', r.body.ok === true && r.body.candidate.teamTrip && r.body.candidate.teamTrip.from === '' && (mem.teamTrips || []).some(t => t.candidateId === 'cd_nodates' && t.from === ''));
mem.candidates = mem.candidates.map(c => c.id === 'cd_nodates' ? { ...c, portal: { ...c.portal, form: { answers: { teamName: 'No Dates Team', itinerary: [{ place: 'YWAM Siem Reap', from: '2027-06-01', to: '2027-06-09', base: true }] } } } } : c);
r = await call('portalStaffSyncTeam', ['rithy', '1234', 'cd_nodates']);
ok('and gets its dates when the application has them', r.body.ok === true && r.body.candidate.teamTrip.from === '2027-06-01' && (mem.teamTrips || []).some(t => t.candidateId === 'cd_nodates'));
r = await call('portalStaffSyncTeam', ['rithy', '1234', teamRec.id]);
ok('a team deleted in the Teams Database is not put back by it', r.body.ok === false && r.body.err === 'deleted');
r = await call('portalStaffSyncTeam', ['rithy', '1234', cand.id]);
ok('nor is a student', r.body.ok === false);
mem.candidates = mem.candidates.filter(c => c.id !== 'cd_nodates');
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('and the team deleted there stays deleted', !r.body.trips.some(t => t.candidateId === teamRec.id));
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('opening it again adds nothing twice', (mem.teamTrips || []).filter(t => t.candidateId === 'cd_old1').length === 1);
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Walk-in Church Team', type: 'team', stage: 'new', campus: 'siemreap' }]);
const walkIn = r.body.candidate;
ok('a team added on the staff side goes into the Teams Database straight away, no dates yet', r.body.ok === true && (mem.teamTrips || []).some(t => t.candidateId === walkIn.id && t.name === 'Walk-in Church Team' && t.from === ''));
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('it is listed as pending', r.body.trips.some(t => t.candidateId === walkIn.id && t.pending === true));
mem.candidates = mem.candidates.filter(c => c.id !== walkIn.id);
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
{ const t = r.body.trips.find(x => x.candidateId === 'cd_old1');
  ok('a team still going through the portal is pending, with its stage', t && t.pending === true && t.portalStage === 'applied', JSON.stringify(t && [t.pending, t.portalStage])); }
r = await call('portalSetVisaFlags', ['rithy', '1234', 'cd_old1', { flightsConfirmed: true }]);
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('it stops being pending once its flights are confirmed', !r.body.trips.find(x => x.candidateId === 'cd_old1').pending);
r = await call('portalSetVisaFlags', ['rithy', '1234', 'cd_old1', { flightsConfirmed: false }]);
r = await call('portalStaffSaveTeamNumbers', ['rithy', '1234', 'cd_old1', { 'People Served': 77 }, { male: 3, female: 4 }]);
ok('staff enter a team’s numbers from the portal record', r.body.ok === true && r.body.candidate.teamTrip.metrics['People Served'] === 77 && (mem.teamTrips || []).find(t => t.candidateId === 'cd_old1').metrics['People Served'] === 77);
r = await call('portalStaffSaveTeamNumbers', ['rithy', '1234', cand.id, { 'People Served': 1 }, {}]);
ok('not on a student', r.body.ok === false);
r = await call('portalBoot', ['sina', '1234']);
ok('the staff side gets each team’s numbers and the metric overrides', r.body.applicants.find(a => a.id === 'cd_old1').teamTrip.metrics['People Served'] === 77 && Array.isArray(r.body.metricOverrides));
mem.candidates = mem.candidates.map(c => c.id === 'cd_old1' ? { ...c, portal: { ...c.portal, form: { answers: { ...c.portal.form.answers, itinerary: [{ place: 'YWAM Siem Reap', from: '2026-01-05', to: '2026-01-10', base: true }] } } } } : c);
mem.teamTrips = mem.teamTrips.map(t => t.candidateId === 'cd_old1' ? { ...t, from: '2026-01-05', to: '2026-01-10' } : t);
const hostedWk2 = async () => { const d = (await call('getData', [''])).body; return ((d.entries.siemreap || {})['Community Service|Outreach Teams|People Served'] || {})['2'] || 0; };
const whilePending = await hostedWk2();
mem.candidates = mem.candidates.map(c => c.id === 'cd_old1' ? { ...c, portal: { ...c.portal, visa: { flightsConfirmed: true } } } : c);
const onceArrived = await hostedWk2();
ok('a pending team’s numbers stay off the dashboards, and count once its flights are confirmed', onceArrived - whilePending === 77, whilePending + ' → ' + onceArrived);
r = await call('getTeamTrips', ['rithy', '1234', 'siemreap']);
ok('with flights confirmed it is no longer pending', !r.body.trips.find(x => x.candidateId === 'cd_old1').pending);
mem.candidates = mem.candidates.filter(c => !['cd_old1', 'cd_old2', 'cd_draft', 'cd_closed'].includes(c.id));
r = await call('portalRegister', [{ ...APP, username: 'nocountry', email: 'nc@example.org', country: '' }]);
ok('country is required at sign-up — it decides Khmer or international', r.body.ok === false && r.body.err === 'country_required');
r = await call('portalResetForm', ['dara', '1234', 'dts']);
ok('portal staff cannot reset a form', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalResetForm', ['sina', '1234', 'dts']);
ok('a portal admin resets a form to the shipped default', r.body.ok === true && r.body.forms.dts.isDefault === true && !r.body.forms.dts.sections.some(s => s.id === 'extra'));
mem.staff = mem.staff.filter(s => s.username !== 'srey.k' && s.username !== 'team.au' && s.username !== 'fanny.f'); mem.candidates = mem.candidates.filter(c => c.staffId !== srey.id && c.staffId !== teamAcct.id && c.id !== fannyCand.id);

console.log('\n=== deleting an applicant ===');
r = await call('portalRegister', [{ ...APP, username: 'dup.e', email: 'dup@example.org' }]);
const dup = mem.staff.find(s => s.username === 'dup.e'), dupCand = mem.candidates.find(c => c.staffId === dup.id);
r = await call('portalDeleteApplicant', ['dara', '1234', dupCand.id]);
ok('portal staff cannot delete an applicant', r.body.ok === false && r.body.err === 'not_authorized' && mem.staff.some(s => s.id === dup.id));
r = await call('portalDeleteApplicant', ['anna.b', '2468', dupCand.id]);
ok('nor can an applicant', r.body.ok === false && mem.staff.some(s => s.id === dup.id));
r = await call('portalDeleteApplicant', ['sina', '1234', 'nope']);
ok('an unknown record is not found', r.body.ok === false && r.body.err === 'not_found');
r = await call('portalDeleteApplicant', ['sina', '1234', dupCand.id]);
ok('a portal admin deletes the application and the account behind it', r.body.ok === true && r.body.deleted === dupCand.id && r.body.accountRemoved === true && !mem.candidates.some(c => c.id === dupCand.id) && !mem.staff.some(s => s.id === dup.id));
ok('and gets the refreshed list back', r.body.role === 'portal-admin' && Array.isArray(r.body.applicants) && !r.body.applicants.some(x => x.id === dupCand.id));
r = await call('portalBoot', ['dup.e', '2468']);
ok('the deleted applicant can no longer sign in', r.body.ok === false && r.body.err === 'auth');
r = await call('hrSaveCandidate', ['sina', '1234', { name: 'Arrived Person', type: 'staff', stage: 'arrived', staffId: 'st_plain', campus: 'siemreap' }]);
const arrivedCand = r.body.candidate;
r = await call('portalDeleteApplicant', ['uriah', '1234', arrivedCand.id]);
ok('a record pointing at a real staff account loses only the record — the staff account stays', r.body.ok === true && r.body.accountRemoved === false && mem.staff.some(s => s.id === 'st_plain') && !mem.candidates.some(c => c.id === arrivedCand.id));

console.log('\n=== Accounts: portal admins see, add, edit every applicant account ===');
r = await call('portalListAccounts', ['dara', '1234']);
ok('portal staff do not get the accounts list', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalListAccounts', ['anna.b', '2468']);
ok('nor does an applicant', r.body.ok === false);
r = await call('portalListAccounts', ['sina', '1234']);
ok('a portal admin lists every applicant account with its application', r.body.ok === true && r.body.accounts.some(a => a.username === 'anna.b' && a.type === 'student' && a.stage === 'arrived' && a.candidateId === cand.id) && r.body.accounts.every(a => a.username !== 'uriah' && a.username !== 'dara'));
ok('and no PIN material leaks', !JSON.stringify(r.body).includes('pinHash') && !JSON.stringify(r.body).includes('pinSalt'));
r = await call('portalListAccounts', ['uriah', '1234']);
ok('an app admin lists them too', r.body.ok === true && r.body.accounts.length > 0);
r = await call('portalCreateApplicant', ['dara', '1234', { ...APP, username: 'made.x', email: 'made@example.org', country: 'Norway' }]);
ok('portal staff cannot add an account', r.body.ok === false && r.body.err === 'not_authorized' && !mem.staff.some(s => s.username === 'made.x'));
r = await call('portalCreateApplicant', ['sina', '1234', { ...APP, username: 'made.x', email: 'made@example.org', country: 'Norway' }]);
const made = mem.staff.find(s => s.username === 'made.x');
ok('a portal admin adds an applicant account and its record, noting who made it', r.body.ok === true && r.body.account.username === 'made.x' && !!made && mem.candidates.some(c => c.staffId === made.id && c.createdBy === 'st_padmin'));
r = await call('portalBoot', ['made.x', '2468']);
ok('the new applicant can sign in with the PIN the admin set', r.body.ok === true && r.body.role === 'applicant');
r = await call('portalCreateApplicant', ['sina', '1234', { ...APP, username: 'made.x', email: 'other@example.org' }]);
ok('the same checks apply as at sign-up (taken username)', r.body.ok === false && r.body.err === 'taken');
r = await call('portalUpdateAccount', ['dara', '1234', made.id, { name: 'Nope' }]);
ok('portal staff cannot edit an account', r.body.ok === false && r.body.err === 'not_authorized');
r = await call('portalUpdateAccount', ['sina', '1234', made.id, { name: 'Made Person', email: 'made2@example.org', phone: '+47 123 456', messenger: 'telegram', country: 'Sweden', username: 'made.y' }]);
ok('a portal admin edits name, contact, country and username', r.body.ok === true && r.body.account.name === 'Made Person' && r.body.account.username === 'made.y' && r.body.account.country === 'Sweden');
const madeCand = mem.candidates.find(c => c.staffId === made.id);
ok('and the CRM record follows', madeCand.name === 'Made Person' && madeCand.email === 'made2@example.org' && madeCand.messenger === 'telegram' && madeCand.country === 'Sweden');
r = await call('portalUpdateAccount', ['sina', '1234', made.id, { username: 'anna.b' }]);
ok('a username already taken is refused', r.body.ok === false && r.body.err === 'taken');
r = await call('portalUpdateAccount', ['sina', '1234', made.id, { email: 'anna@example.org' }]);
ok('as is an email already on another account', r.body.ok === false && r.body.err === 'email_taken');
r = await call('portalUpdateAccount', ['sina', '1234', made.id, { newPin: '12' }]);
ok('a new PIN must be 4 digits', r.body.ok === false && r.body.err === 'bad_pin');
r = await call('portalUpdateAccount', ['sina', '1234', made.id, { newPin: '9999' }]);
ok('a portal admin resets the PIN', r.body.ok === true);
r = await call('portalBoot', ['made.y', '9999']);
ok('the applicant signs in with the new username and PIN', r.body.ok === true && r.body.role === 'applicant' && r.body.me.name === 'Made Person');
r = await call('portalBoot', ['made.y', '2468']);
ok('and not with the old PIN', r.body.ok === false);
r = await call('portalUpdateAccount', ['sina', '1234', 'st_pstaff', { name: 'Hack' }]);
ok('a staff account cannot be edited through the portal', r.body.ok === false && r.body.err === 'not_applicant' && mem.staff.find(s => s.id === 'st_pstaff').name === 'Dara Pen');
r = await call('portalUpdateAccount', ['sina', '1234', 'nope', { name: 'X' }]);
ok('an unknown account is not found', r.body.ok === false && r.body.err === 'not_found');

console.log('\n=== the applicant’s own contact details ===');
r = await call('portalUpdateContact', ['anna.b', '2468', { phone: '+855 12 345 678', messenger: 'telegram' }]);
ok('an applicant changes their phone and messenger', r.body.ok === true && r.body.me.phone === '+855 12 345 678' && r.body.me.messenger === 'telegram');
ok('and the CRM record follows', mem.candidates.find(c => c.id === cand.id).messenger === 'telegram');
r = await call('portalUpdateContact', ['anna.b', '2468', { phone: '', messenger: 'telegram' }]);
ok('but cannot blank the phone', r.body.ok === false && r.body.err === 'phone_required');
r = await call('portalUpdateContact', ['dara', '1234', { phone: '+1 555', messenger: 'whatsapp' }]);
ok('staff cannot use the applicant’s handler', r.body.ok === false);
r = await call('portalBoot', ['tom.v', '2468']);
ok('the second applicant still sees only their own', r.body.ok === true && r.body.application.type === 'volunteer' && !JSON.stringify(r.body).includes('anna'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
