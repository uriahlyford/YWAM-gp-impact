/* Ministry tools: numbers as a by-product (api.js — leadWeek, leadLog…, leadReflect…,
   leadPartner…, basePlant…, cafe…, toolSync_).

   Campus Leadership's "My week": only Campus Leadership may use it; each thing
   logged counts toward that leader's own weekly numbers; one-on-ones and
   partner connections carry who; gospel hours add up; the Campus Director's
   ratings and base plants fill theirs; deleting the last record clears only
   what the tool wrote — a number someone typed stays.
   The Cafe: only the cafe team; opening counts a day open; a sale is priced
   from the menu on the server, not by the phone; cups are only items marked
   as a cup; conversations, salvations, expenses and profit follow; undo
   takes a sale back out; only the cafe's leader changes the menu; the rota
   is the team's. HangPopok as the till: the day's totals typed in count the
   same way. The Tuesday meeting is Campus Leadership's; the money ahead is
   the leadership code's alone, and fails closed. */
import { tmpDir } from './env.mjs';
import { REPO } from './env.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const TMP = tmpDir('ministry-tools');
fs.mkdirSync(TMP + '/node_modules/@netlify/blobs', { recursive: true });
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/index.js', `
const stores={};
export function getStore(o){
  const name=(typeof o==='string') ? o : o.name;
  const mem=stores[name]||(stores[name]=new Map());
  return {
    get: async (k,opt)=>{ if(!mem.has(k)) return null; const v=mem.get(k); return (opt&&opt.type==='text') ? v : JSON.parse(v); },
    set: async (k,v)=>{ mem.set(k, String(v)); },
    setJSON: async (k,v)=>{ mem.set(k, JSON.stringify(v)); },
    delete: async (k)=>{ mem.delete(k); },
    list: ()=>({ [Symbol.asyncIterator]: async function*(){ yield { blobs: [...mem.keys()].map(key=>({key})), directories: [] }; } })
  };
}
export const __stores=stores;
`);
fs.writeFileSync(TMP + '/node_modules/@netlify/blobs/package.json', JSON.stringify({ name: '@netlify/blobs', version: '0.0.0', type: 'module', main: 'index.js' }));
fs.writeFileSync(TMP + '/package.json', JSON.stringify({ type: 'module' }));
for (const f of fs.readdirSync(REPO + '/netlify/functions')) fs.copyFileSync(REPO + '/netlify/functions/' + f, TMP + '/' + f);
process.env.GP_LEADER_CODE = 'leadercode';
process.env.GP_ADMIN_CODE = 'admincode';
const blobs = await import(TMP + '/node_modules/@netlify/blobs/index.js');
const api = await import(TMP + '/api.js');
const mem = blobs.__stores['gp-data'] || (blobs.getStore({ name: 'gp-data' }), blobs.__stores['gp-data']);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name + (extra !== undefined ? '  → ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const mkHash = (pin, salt) => crypto.createHash('sha256').update(salt + ':' + String(pin), 'utf8').digest('hex');
const withPin = (s) => ({ ...s, pinSalt: s.id, pinHash: mkHash('1234', s.id) });
await blobs.getStore({ name: 'gp-data' }).setJSON('staff', [
  withPin({ id: 'st_cd', name: 'Uriah', username: 'cd', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true }),
  withPin({ id: 'st_dl', name: 'Sophea', username: 'dl', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Community Service', active: true }),
  withPin({ id: 'st_lead', name: 'Kanha', username: 'kanha', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true, leads: ['Community Service|Cafe'] }),
  withPin({ id: 'st_barista', name: 'Vanna', username: 'vanna', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'st_admin', name: 'Uriah', username: 'uriah', campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', active: true, isAdmin: true }),
  withPin({ id: 'st_hr', name: 'Hana', username: 'hana', campus: 'siemreap', dept: 'Operations', ministry: 'HR', active: true, hr: true }),
  withPin({ id: 'st_dara', name: 'Dara', username: 'dara', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'st_emma', name: 'Emma', username: 'emma', campus: 'siemreap', dept: 'Community Service', ministry: 'Cafe', active: true }),
  withPin({ id: 'st_app', name: 'Applicant', username: 'app@x.org', campus: 'siemreap', dept: 'Community Service', active: true, kind: 'applicant' })
]);
async function call(fn, args) {
  const res = await api.default({ method: 'POST', json: async () => ({ fn, args }), headers: new Map() }, {});
  return await res.json();
}
const entries = () => JSON.parse(mem.get('entries') || '[]');
const entry = (ministry, metric, wk) => entries().find((r) => r.ministry === ministry && r.metric === metric && Number(r.week) === wk);
const today = new Date().toISOString().slice(0, 10);
function isoWeek(dateStr) { const d = new Date(dateStr + 'T00:00:00'); const y = d.getFullYear(); const jan1 = new Date(y, 0, 1);
  const monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7)); return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1)); }
const WK = isoWeek(today);

console.log('=== Campus Leadership: My week ===');
let r = await call('leadWeek', ['dara', '1234', WK]);
ok('only Campus Leadership can use it', !r.ok && r.err === 'not_leadership');
r = await call('leadLogAdd', ['cd', '1234', { kind: 'oneonone', who: 'st_dara', note: 'Talked about the cafe', date: today }]);
ok('a one-on-one is logged with who', r.ok && r.log.length === 1 && r.log[0].who === 'st_dara' && r.log[0].week === WK);
ok('… and counts toward One-on-Ones Held for the week', entry('Campus Director', 'One-on-Ones Held', WK).value === 1 && entry('Campus Director', 'One-on-Ones Held', WK).by === 'tool:lead');
await call('leadLogAdd', ['cd', '1234', { kind: 'gospel', qty: 1.5, date: today }]);
await call('leadLogAdd', ['cd', '1234', { kind: 'gospel', qty: 2, date: today }]);
await call('leadLogAdd', ['cd', '1234', { kind: 'church', note: 'Siem Reap church', date: today }]);
ok('gospel hours add up', entry('Campus Director', 'Hours Sharing the Gospel', WK).value === 3.5);
ok('the rest of the week reads zero, not missing', entry('Campus Director', 'Meetings Led', WK).value === 0 && entry('Campus Director', 'Spoke at Churches', WK).value === 1);
r = await call('leadLogAdd', ['cd', '1234', { kind: 'gospel', qty: 40 }]);
ok('hours must be believable', !r.ok && r.err === 'bad_hours');
r = await call('leadLogAdd', ['cd', '1234', { kind: 'nonsense' }]);
ok('only the known kinds', !r.ok && r.err === 'bad_kind');
r = await call('leadPartnerSave', ['cd', '1234', { name: 'Grace Church', org: 'Siem Reap' }, WK]);
const pid = r.partners[0].id;
r = await call('leadLogAdd', ['cd', '1234', { kind: 'partner', who: pid, whoName: 'Grace Church', date: today }]);
ok('connecting with a partner counts, and marks when', entry('Campus Director', 'Partner Connections', WK).value === 1 && r.partners[0].last === today);
await call('leadLogAdd', ['dl', '1234', { kind: 'oneonone', who: 'st_dara', date: today }]);
ok('a department leader counts on their own row, not the Director’s', entry('Community Service', 'One-on-Ones Held', WK).value === 1 && entry('Campus Director', 'One-on-Ones Held', WK).value === 1);
r = await call('leadReflectSave', ['cd', '1234', WK, { vision: 8, comms: 6, partners: 7, note: 'Good week' }]);
ok('the Director’s ratings fill the three scores', entry('Campus Director', 'Base Vision (1-10)', WK).value === 8 && entry('Campus Director', 'Communications (1-10)', WK).value === 6);
r = await call('basePlantSave', ['cd', '1234', { name: 'YWAM Battambang', place: 'Battambang', stage: 'praying' }, WK]);
await call('basePlantSave', ['cd', '1234', { name: 'YWAM Kampot', stage: 'launched' }, WK]);
ok('base plants not yet launched count', entry('Campus Director', 'Base Plants in Planning', WK).value === 1 && r.plants.length === 1);
r = await call('basePlantSave', ['dl', '1234', { name: 'X' }, WK]);
ok('only the Director (or an admin) keeps the base plants', !r.ok && r.err === 'not_authorized');
r = await call('leadLogDelete', ['dl', '1234', (await call('leadWeek', ['cd', '1234', WK])).log[0].id]);
ok('nobody can delete someone else’s record', !r.ok && r.err === 'not_found');

// a typed number survives the tool clearing its own
const typed = entries(); typed.push({ campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Community Service', metric: 'Teachings Prepped', week: WK, year: new Date().getUTCFullYear(), value: 4, by: 'st_dl' });
mem.set('entries', JSON.stringify(typed));
const dlLog = (await call('leadWeek', ['dl', '1234', WK])).log;
await call('leadLogDelete', ['dl', '1234', dlLog[0].id]);
ok('deleting the last record clears what the tool wrote…', !entry('Community Service', 'One-on-Ones Held', WK));
ok('… but a number someone typed stays', entry('Community Service', 'Teachings Prepped', WK).value === 4);

console.log('\n=== the Cafe ===');
r = await call('cafeGet', ['cd', '1234', today]);
ok('the cafe tool is for the cafe team', !r.ok && r.err === 'not_authorized');
r = await call('cafeGet', ['vanna', '1234', today]);
ok('the team opens it with a starting menu and checklists', r.ok && r.settings.menu.length >= 4 && r.settings.open.length && !r.day.opened && r.canSetup === false);
const menu = r.settings.menu, cup = menu.find((m) => m.cup), food = menu.find((m) => !m.cup);
r = await call('cafeOpen', ['vanna', '1234', today, [0, 1, 2]]);
ok('opening ticks the list and counts the day open', r.ok && r.day.opened.done.length === 3 && entry('Cafe', 'Days Open', WK).value === 1);
r = await call('cafeSale', ['vanna', '1234', today, [{ id: cup.id, qty: 2, price: 0.01 }, { id: food.id, qty: 1 }]]);
const total = Math.round((cup.price * 2 + food.price) * 100) / 100;
ok('a sale is priced from the menu, not by the phone', r.ok && r.day.orders[0].total === total);
ok('… cups are only the items marked as a cup, and one order is one customer', entry('Cafe', 'Cups Sold', WK).value === 2 && entry('Cafe', 'Customers Served', WK).value === 1);
await call('cafeSale', ['vanna', '1234', today, [{ id: cup.id, qty: 1 }]]);
await call('cafeCount', ['vanna', '1234', today, 'gospel', 1]);
await call('cafeCount', ['vanna', '1234', today, 'gospel', 1]);
await call('cafeCount', ['vanna', '1234', today, 'salvations', 1]);
r = await call('cafeExpense', ['vanna', '1234', today, 3.5, 'milk']);
ok('conversations, salvations and expenses follow', entry('Cafe', 'Gospel Conversations', WK).value === 2 && entry('Cafe', 'Salvations', WK).value === 1 && entry('Cafe', 'Weekly Expenses ($)', WK).value === 3.5);
const takings = Math.round((total + cup.price) * 100) / 100;
ok('profit is takings less expenses', entry('Cafe', 'Weekly Profit ($)', WK).value === Math.round((takings - 3.5) * 100) / 100, entry('Cafe', 'Weekly Profit ($)', WK).value);
r = await call('cafeVoid', ['vanna', '1234', today, r.day.orders[1].id]);
ok('undo takes a sale back out', r.ok && r.day.orders.length === 1 && entry('Cafe', 'Cups Sold', WK).value === 2);
r = await call('cafeSale', ['vanna', '1234', today, [{ id: 'nope', qty: 1 }]]);
ok('an empty or unknown order is refused', !r.ok && r.err === 'empty');
r = await call('cafeClose', ['vanna', '1234', today, [0, 1], 52.25]);
ok('closing keeps the list and the cash', r.ok && r.day.closed.cash === 52.25);
r = await call('cafeSaveSettings', ['vanna', '1234', { menu: [{ name: 'Free coffee', price: 0 }] }, today]);
ok('only the cafe’s leader changes the menu', !r.ok && r.err === 'not_leader');
r = await call('cafeSaveSettings', ['kanha', '1234', { menu: menu.concat([{ name: 'Mango smoothie', emoji: '🥭', price: 2.75, cup: true }]) }, today]);
ok('the leader can', r.ok && r.settings.menu.some((m) => m.name === 'Mango smoothie') && r.canSetup);
const mon = (() => { const d = new Date(today + 'T00:00:00Z'); return new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86400000).toISOString().slice(0, 10); })();
r = await call('cafeSaveSettings', ['vanna', '1234', { roster: { week: mon, cells: { '0|0': ['st_barista', 'st_lead'], 'bad': ['x'] } } }, today]);
ok('anyone on the team fills in the rota', r.ok && r.settings.roster[mon]['0|0'].length === 2 && !r.settings.roster[mon].bad);
ok('the cafe days are their own blobs, so the settings stay small', mem.has('cafeDay:siemreap:' + today) && !JSON.stringify(JSON.parse(mem.get('cafe:siemreap'))).includes('orders'));
r = await call('getData', ['']);
ok('the Base dashboard sees the cafe numbers like any logged week', r && JSON.stringify(r.entries || {}).includes('Cups Sold'));

console.log('\n=== the Cafe with HangPopok as its till ===');
r = await call('cafeSaveSettings', ['vanna', '1234', { till: 'hangpopok' }, today]);
ok('only the cafe’s leader chooses the till', !r.ok && r.err === 'not_leader');
r = await call('cafeSaveSettings', ['kanha', '1234', { till: 'hangpopok' }, today]);
ok('the leader can choose HangPopok', r.ok && r.settings.till === 'hangpopok');
const cupsBefore = entry('Cafe', 'Cups Sold', WK).value, custBefore = entry('Cafe', 'Customers Served', WK).value, profitBefore = entry('Cafe', 'Weekly Profit ($)', WK).value;
r = await call('cafePos', ['vanna', '1234', today, { sales: 84.5, receipts: 31, cups: 40 }]);
ok('the day’s HangPopok totals are kept with who typed them', r.ok && r.day.pos.sales === 84.5 && r.day.pos.by === 'st_barista');
ok('… and count like sales made here: cups, customers, profit', entry('Cafe', 'Cups Sold', WK).value === cupsBefore + 40 && entry('Cafe', 'Customers Served', WK).value === custBefore + 31 &&
  entry('Cafe', 'Weekly Profit ($)', WK).value === Math.round((profitBefore + 84.5) * 100) / 100);
r = await call('cafePos', ['vanna', '1234', today, { sales: 'lots' }]);
ok('a total that isn’t a number is refused', !r.ok && r.err === 'bad_number');
r = await call('cafePos', ['dara', '1234', today, { sales: 90, receipts: 33, cups: 41 }]);
ok('typing them again replaces them, it doesn’t add twice', r.ok && entry('Cafe', 'Cups Sold', WK).value === cupsBefore + 41);
r = await call('cafePos', ['vanna', '1234', today, { sales: '', receipts: '', cups: '' }]);
ok('clearing them takes them back out', r.ok && r.day.pos === null && entry('Cafe', 'Cups Sold', WK).value === cupsBefore);
r = await call('cafePos', ['cd', '1234', today, { sales: 1 }]);
ok('someone off the cafe team can’t type them', !r.ok && r.err === 'not_authorized');

console.log('\n=== Campus Leadership: the Tuesday morning meeting ===');
const st = JSON.parse(mem.get('staff'));
st.push(withPin({ id: 'st_pp', name: 'Poipet Person', username: 'pp', campus: 'poipet', dept: 'Campus Leadership', ministry: 'Campus Director', active: true }));
mem.set('staff', JSON.stringify(st));
const tue = (() => { const d = new Date(); d.setUTCDate(d.getUTCDate() + ((2 - d.getUTCDay() + 7) % 7)); return d.toISOString().slice(0, 10); })();
const wed = new Date(new Date(tue + 'T12:00:00Z').getTime() + 86400000).toISOString().slice(0, 10);
r = await call('saveLeadTuesday', ['vanna', '1234', { date: tue, facilitator: { id: 'st_cd' } }]);
ok('only Campus Leadership plans Tuesdays', !r.ok && r.err === 'not_authorized');
r = await call('saveLeadTuesday', ['dl', '1234', { date: wed, facilitator: { id: 'st_cd' } }]);
ok('… and only on a Tuesday', !r.ok && r.err === 'bad_date');
r = await call('saveLeadTuesday', ['dl', '1234', { date: tue, facilitator: { id: 'st_barista' }, translator: { id: '', name: 'Pastor Sokha' }, topics: ['Outreach week', '', 'Prayer for the DTS'] }]);
const tr = r.ok && r.tues.find((x) => x.date === tue);
ok('a facilitator from the base, a guest translator by name, the topics', tr && tr.facilitator.id === 'st_barista' && tr.translator.name === 'Pastor Sokha' && tr.topics.length === 2);
r = await call('saveLeadTuesday', ['dl', '1234', { date: tue, facilitator: { id: 'st_pp' }, topics: ['x'] }]);
ok('someone from another campus isn’t taken as a person', r.ok && r.tues.find((x) => x.date === tue).facilitator === null);
r = await call('saveLeadCard', ['cd', '1234', { title: 'Budget for Q1', type: 'agenda' }]);
r = await call('getLeadBoard', ['cd', '1234']);
ok('the board’s other saves keep the Tuesdays, and the whole team sees them', r.ok && r.tues.some((x) => x.date === tue) && r.cards.some((c) => c.title === 'Budget for Q1'));
r = await call('saveLeadTuesday', ['dl', '1234', { date: tue, facilitator: null, translator: null, topics: [] }]);
ok('emptying a Tuesday takes it off', r.ok && !r.tues.some((x) => x.date === tue));

console.log('\n=== Campus Leadership: the money ahead (leadership code only) ===');
mem.set('entries', JSON.stringify(entries().concat([
  { campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', metric: 'Base Finances ($)', week: Math.max(1, WK - 2), year: new Date().getFullYear(), value: 12000, updated: '', by: 'x' },
  { campus: 'siemreap', dept: 'Campus Leadership', ministry: 'Campus Director', metric: 'Base Finances ($)', week: Math.max(1, WK - 1), year: new Date().getFullYear(), value: 11500, updated: '', by: 'x' }])));
r = await call('finProjGet', ['', 'siemreap']);
ok('no code, no finances', !r.ok && r.err === 'not_leader' && !JSON.stringify(r).includes('11500'));
r = await call('finProjGet', ['wrong', 'siemreap']);
ok('a wrong code, no finances', !r.ok && r.err === 'not_leader');
const realCode = process.env.GP_LEADER_CODE; process.env.GP_LEADER_CODE = '';
r = await call('finProjGet', ['', 'siemreap']);
ok('fails closed when no code is set on the server', !r.ok && r.err === 'not_leader');
process.env.GP_LEADER_CODE = realCode;
r = await call('finProjGet', ['leadercode', 'siemreap']);
ok('with the code: the latest Base Finances', r.ok && r.latest['Base Finances ($)'] && (WK < 3 || r.latest['Base Finances ($)'].value === 11500));
const m1 = today.slice(0, 7);
r = await call('finProjSave', ['leadercode', 'siemreap', { [m1]: { inc: 4000, exp: 5200.4 }, 'nope': { inc: 1 }, '2026-13': { inc: 1 } }]);
ok('a projection month by month; odd months are dropped', r.ok && r.months[m1].exp === 5200 && Object.keys(r.months).length === 1);
r = await call('finProjSave', ['wrong', 'siemreap', { [m1]: { inc: 1 } }]);
ok('a wrong code can’t change it', !r.ok && JSON.parse(mem.get('finProj:siemreap')).months[m1].inc === 4000);
r = await call('finProjGet', ['leadercode', 'mars']);
ok('only real campuses', !r.ok && r.err === 'bad_campus');
r = await call('getData', ['']);
ok('the public dashboard still never shows Base Finances', !JSON.stringify(r.entries || {}).includes('Base Finances'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
