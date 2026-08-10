/*  GonPreah Impact — Apps Script backend (v4)
    Sheets: "Entries" · "OKRs" · "Health Survey"
    Leadership tier: metrics in SENSITIVE are stripped server-side unless the
    caller provides the leadership code (Script property LEADER_CODE, default GP2026).
*/

var SHEET_NAME = 'Entries';
var OKR_SHEET = 'OKRs';
var SURVEY_SHEET = 'Health Survey';
var SENSITIVE = ['Base Finances ($)', 'Base Cash Reserve ($)'];

function doGet(e) {
  var page = (e && e.parameter && e.parameter.p) ? String(e.parameter.p) : 'index';
  var file = page === 'teams' ? 'Teams' : (page === 'help' ? 'Help' : 'Index');
  return HtmlService.createHtmlOutputFromFile(file)
    .setTitle('YWAM GP')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // lets the icon shell embed the app
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

// Client uses this to build cross-page links inside the Apps Script sandbox.
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

function isLeader_(code) {
  var p = PropertiesService.getScriptProperties();
  var c = p.getProperty('LEADER_CODE');
  if (!c) { c = 'GP2026'; p.setProperty('LEADER_CODE', c); }
  return String(code || '') === c;
}

function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('GP Impact Data');
    props.setProperty('SHEET_ID', ss.getId());
  }
  return ss;
}

function sheetWithHeaders_(name, headers) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    var d = ss.getSheetByName('Sheet1');
    if (d) ss.deleteSheet(d);
  }
  return sh;
}

function getSheet_() {
  return sheetWithHeaders_(SHEET_NAME, ['Campus', 'Department', 'Ministry', 'Metric', 'Week', 'Value', 'Updated']);
}
function getOkrSheet_() {
  return sheetWithHeaders_(OKR_SHEET, ['Campus', 'Quarter', 'Department', 'ObjectiveID', 'Objective', 'KR', 'MetricKey', 'Target', 'ManualPct', 'Updated']);
}
function getSurveySheet_() {
  var sh = sheetWithHeaders_(SURVEY_SHEET, ['Campus', 'Week', 'DeviceID', 'Lonely', 'Clarity', 'Porn', 'OneOnOne', 'Exercise', 'QuietTime', 'Debt', 'LangHours', 'MinistryHours', 'SharedFaith', 'Sabbath', 'Growth', 'Updated']);
  var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  if (hdr.indexOf('LangHours') === -1) {
    sh.insertColumnsAfter(10, 2);
    sh.getRange(1, 11).setValue('LangHours');
    sh.getRange(1, 12).setValue('MinistryHours');
  }
  hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  if (hdr.indexOf('SharedFaith') === -1) {
    sh.insertColumnsAfter(12, 3);
    sh.getRange(1, 13).setValue('SharedFaith');
    sh.getRange(1, 14).setValue('Sabbath');
    sh.getRange(1, 15).setValue('Growth');
  }
  return sh;
}

function getData(code) {
  var leader = isLeader_(code);
  var sh = getSheet_();
  var entries = {};
  var last = sh.getLastRow();
  if (last >= 2) {
    var rows = sh.getRange(2, 1, last - 1, 6).getValues();
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var campus = String(r[0]);
      var dept = String(r[1]);
      if (dept === 'Base Director') dept = 'Base Leadership'; // rename migration
      var metric = String(r[3]);
      if (!leader && SENSITIVE.indexOf(metric) > -1) continue;
      var key = dept + '|' + r[2] + '|' + metric;
      var week = String(r[4]);
      var val = Number(r[5]);
      if (!campus || isNaN(val)) continue;
      if (!entries[campus]) entries[campus] = {};
      if (!entries[campus][key]) entries[campus][key] = {};
      entries[campus][key][week] = val;
    }
  }
  var osh = getOkrSheet_();
  var okrs = [], byId = {};
  var olast = osh.getLastRow();
  if (olast >= 2) {
    var orows = osh.getRange(2, 1, olast - 1, 9).getValues();
    for (var j = 0; j < orows.length; j++) {
      var o = orows[j];
      var id = String(o[3]);
      if (!id) continue;
      if (!byId[id]) {
        byId[id] = { id: id, campus: String(o[0]), quarter: Number(o[1]), dept: String(o[2]), objective: String(o[4]), krs: [] };
        okrs.push(byId[id]);
      }
      byId[id].krs.push({ text: String(o[5]), metricKey: String(o[6] || ''), target: Number(o[7]) || 0, manual: Number(o[8]) || 0 });
    }
  }
  var ssh = getSurveySheet_();
  var survey = [];
  var slast = ssh.getLastRow();
  if (slast >= 2) {
    var srows = ssh.getRange(2, 1, slast - 1, 15).getValues();
    var nn = function(v){ var n = Number(v); return (v === '' || v === null || isNaN(n)) ? null : n; };
    for (var k = 0; k < srows.length; k++) {
      var s = srows[k];
      survey.push({
        campus: String(s[0]), week: Number(s[1]), device: String(s[2]),
        lonely: Number(s[3]), clarity: Number(s[4]),
        porn: Number(s[5]), oneOnOne: Number(s[6]), exercise: Number(s[7]),
        quietTime: Number(s[8]), debt: Number(s[9]),
        langHours: Number(s[10]) || 0, minHours: Number(s[11]) || 0,
        sharedFaith: nn(s[12]), sabbath: nn(s[13]), growth: nn(s[14])
      });
    }
  }
  return JSON.stringify({ leader: leader, entries: entries, okrs: okrs, survey: survey });
}

function saveEntries(campus, updatesJson, code) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var updates = JSON.parse(updatesJson);
    var sh = getSheet_();
    var last = sh.getLastRow();
    var index = {};
    if (last >= 2) {
      var rows = sh.getRange(2, 1, last - 1, 5).getValues();
      for (var i = 0; i < rows.length; i++) index[rows[i].join('|')] = i + 2;
    }
    var now = new Date();
    var toDelete = [];
    for (var j = 0; j < updates.length; j++) {
      var u = updates[j];
      var k = [campus, u.dept, u.ministry, u.metric, u.week].join('|');
      var row = index[k];
      if (u.value === null || u.value === '' || u.value === undefined) {
        if (row) toDelete.push(row);
      } else if (row) {
        sh.getRange(row, 6, 1, 2).setValues([[Number(u.value), now]]);
      } else {
        sh.appendRow([campus, u.dept, u.ministry, u.metric, u.week, Number(u.value), now]);
      }
    }
    toDelete.sort(function (a, b) { return b - a; });
    for (var d = 0; d < toDelete.length; d++) sh.deleteRow(toDelete[d]);
    return getData(code);
  } finally {
    lock.releaseLock();
  }
}

function saveObjective(objJson, code) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var obj = JSON.parse(objJson);
    deleteRowsForId_(obj.id);
    var sh = getOkrSheet_();
    var now = new Date();
    for (var i = 0; i < obj.krs.length; i++) {
      var kr = obj.krs[i];
      if (!kr.text) continue;
      sh.appendRow([obj.campus, obj.quarter, obj.dept, obj.id, obj.objective, kr.text, kr.metricKey || '', kr.target || 0, kr.manual || 0, now]);
    }
    return getData(code);
  } finally {
    lock.releaseLock();
  }
}

function deleteObjective(id, code) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    deleteRowsForId_(id);
    return getData(code);
  } finally {
    lock.releaseLock();
  }
}

function deleteRowsForId_(id) {
  var sh = getOkrSheet_();
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, 4, last - 1, 1).getValues();
  var toDelete = [];
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) toDelete.push(i + 2);
  }
  toDelete.sort(function (a, b) { return b - a; });
  for (var d = 0; d < toDelete.length; d++) sh.deleteRow(toDelete[d]);
}

function saveSurvey(payloadJson, code) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = JSON.parse(payloadJson);
    var sh = getSurveySheet_();
    var last = sh.getLastRow();
    var rowNum = null;
    if (last >= 2) {
      var rows = sh.getRange(2, 1, last - 1, 3).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === p.campus && Number(rows[i][1]) === Number(p.week) && String(rows[i][2]) === p.device) {
          rowNum = i + 2; break;
        }
      }
    }
    var vals = [p.campus, Number(p.week), p.device, Number(p.lonely), Number(p.clarity),
      p.porn ? 1 : 0, p.oneOnOne ? 1 : 0, p.exercise ? 1 : 0, p.quietTime ? 1 : 0, p.debt ? 1 : 0,
      Number(p.langHours) || 0, Number(p.minHours) || 0,
      p.sharedFaith ? 1 : 0, p.sabbath ? 1 : 0, Number(p.growth) || 0, new Date()];
    if (rowNum) sh.getRange(rowNum, 1, 1, 16).setValues([vals]);
    else sh.appendRow(vals);
    return getData(code);
  } finally {
    lock.releaseLock();
  }
}

function translateBatch(listJson) {
  var list = JSON.parse(listJson);
  var cache = CacheService.getScriptCache();
  var out = {};
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    var key = 'km:' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s));
    var hit = cache.get(key);
    if (hit) { out[s] = hit; continue; }
    try {
      var tr = LanguageApp.translate(s, 'en', 'km');
      out[s] = tr;
      cache.put(key, tr, 21600);
    } catch (e) {
      out[s] = s;
    }
  }
  return JSON.stringify(out);
}

/* ==================== TEAMS LAYER (v1) ====================
   Staff profiles + PIN login + daily self-logging + mentor view.

   Visibility rules (enforced server-side, not just in the UI):
   - teamRoster() exposes ONLY public directory fields — never a PIN, never a
     sensitive metric.
   - "Heart" fields (loneliness, porn, and the debt status) are returned by name
     ONLY to the person themselves and to the one mentor they have chosen.
   - Leadership dashboards should read these as anonymous aggregates only.
*/

var STAFF_SHEET = 'Staff';
var DAILY_SHEET = 'Daily Log';
var PHOTO_FOLDER = 'GP Staff Photos';
// Per-name-visible only to self + chosen mentor. (Debt lives on the profile.)
var DAILY_SENSITIVE = ['lonely', 'porn'];

function getStaffSheet_() {
  return sheetWithHeaders_(STAFF_SHEET,
    ['StaffID', 'Username', 'DisplayName', 'PinHash', 'PinSalt', 'Campus', 'Department', 'Role',
     'PhotoId', 'MentorID', 'Phone', 'JoinedYear', 'Debt', 'Active', 'Created', 'Updated']);
}
function getDailySheet_() {
  return sheetWithHeaders_(DAILY_SHEET,
    ['StaffID', 'Date', 'Week', 'LangHours', 'MinHours', 'Workout', 'Bible', 'QuietTime',
     'OneOnOne', 'SharedFaith', 'Sabbath', 'Clarity', 'Growth', 'Lonely', 'Porn', 'Updated']);
}

function normUser_(u) { return String(u || '').trim().toLowerCase(); }
function pinSalt_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 12); }
function hashPin_(pin, salt) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + String(pin), Utilities.Charset.UTF_8);
  return raw.map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}

function staffRows_() {
  var sh = getStaffSheet_();
  var last = sh.getLastRow();
  if (last < 2) return { sheet: sh, rows: [] };
  var rng = sh.getRange(2, 1, last - 1, 16).getValues();
  var rows = [];
  for (var i = 0; i < rng.length; i++) {
    var r = rng[i];
    rows.push({
      rowNum: i + 2, id: String(r[0]), username: String(r[1]), name: String(r[2]),
      pinHash: String(r[3]), pinSalt: String(r[4]), campus: String(r[5]), dept: String(r[6]),
      role: String(r[7]), photoId: String(r[8]), mentorId: String(r[9]), phone: String(r[10]),
      joined: String(r[11]), debt: (r[12] === true || r[12] === 1 || String(r[12]) === '1'),
      active: !(r[13] === false || r[13] === 0 || String(r[13]) === '0')
    });
  }
  return { sheet: sh, rows: rows };
}
function findStaff_(username) {
  var u = normUser_(username);
  var rows = staffRows_().rows;
  for (var i = 0; i < rows.length; i++) if (rows[i].username === u) return rows[i];
  return null;
}
function verifyStaff_(username, pin) {
  var s = findStaff_(username);
  if (!s) return null;
  if (hashPin_(pin, s.pinSalt) !== s.pinHash) return null;
  return s;
}
function photoUrl_(v) { if (!v) return ''; return (String(v).indexOf('data:') === 0) ? v : ('https://drive.google.com/thumbnail?id=' + v + '&sz=w400'); }
function publicStaff_(s) {
  return {
    id: s.id, name: s.name, username: s.username, campus: s.campus, dept: s.dept,
    role: s.role, photo: s.photoId ? photoUrl_(s.photoId) : '', mentorId: s.mentorId
  };
}

/* ---- public directory: no PII, no sensitive fields ---- */
function teamRoster() {
  var rows = staffRows_().rows.filter(function (s) { return s.active; }).map(publicStaff_);
  return JSON.stringify(rows);
}

/* ---- register / login ---- */
function staffRegister(payloadJson) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var p = JSON.parse(payloadJson);
    var u = normUser_(p.username);
    if (!/^[a-z0-9._-]{2,20}$/.test(u)) return JSON.stringify({ ok: false, err: 'bad_username' });
    if (!/^\d{4}$/.test(String(p.pin))) return JSON.stringify({ ok: false, err: 'bad_pin' });
    if (findStaff_(u)) return JSON.stringify({ ok: false, err: 'taken' });
    var sh = getStaffSheet_();
    var salt = pinSalt_();
    var id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    sh.appendRow([id, u, p.name || u, hashPin_(p.pin, salt), salt, p.campus || '', p.dept || '',
      p.role || '', '', p.mentorId || '', p.phone || '', p.joined || '', 0, 1, new Date(), new Date()]);
    return JSON.stringify({ ok: true, staff: publicStaff_({
      id: id, name: p.name || u, username: u, campus: p.campus || '', dept: p.dept || '',
      role: p.role || '', photoId: '', mentorId: p.mentorId || ''
    }), profile: { phone: p.phone || '', joined: p.joined || '', debt: false } });
  } finally { lock.releaseLock(); }
}

function staffLogin(username, pin) {
  var s = verifyStaff_(username, pin);
  if (!s) return JSON.stringify({ ok: false });
  return JSON.stringify({ ok: true, staff: publicStaff_(s), profile: { phone: s.phone, joined: s.joined, debt: s.debt } });
}

/* ---- profile ---- */
function updateProfile(username, pin, payloadJson) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var s = verifyStaff_(username, pin);
    if (!s) return JSON.stringify({ ok: false });
    var p = JSON.parse(payloadJson);
    var sh = getStaffSheet_();
    if (p.name !== undefined) sh.getRange(s.rowNum, 3).setValue(p.name);
    if (p.campus !== undefined) sh.getRange(s.rowNum, 6).setValue(p.campus);
    if (p.dept !== undefined) sh.getRange(s.rowNum, 7).setValue(p.dept);
    if (p.role !== undefined) sh.getRange(s.rowNum, 8).setValue(p.role);
    if (p.mentorId !== undefined) sh.getRange(s.rowNum, 10).setValue(p.mentorId);
    if (p.phone !== undefined) sh.getRange(s.rowNum, 11).setValue(p.phone);
    if (p.joined !== undefined) sh.getRange(s.rowNum, 12).setValue(p.joined);
    if (p.debt !== undefined) sh.getRange(s.rowNum, 13).setValue(p.debt ? 1 : 0);
    sh.getRange(s.rowNum, 16).setValue(new Date());
    var ns = findStaff_(username);
    return JSON.stringify({ ok: true, staff: publicStaff_(ns), profile: { phone: ns.phone, joined: ns.joined, debt: ns.debt } });
  } finally { lock.releaseLock(); }
}

// Optional: change the PIN (requires the current one).
function changePin(username, pin, newPin) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var s = verifyStaff_(username, pin);
    if (!s) return JSON.stringify({ ok: false });
    if (!/^\d{4}$/.test(String(newPin))) return JSON.stringify({ ok: false, err: 'bad_pin' });
    var salt = pinSalt_();
    var sh = getStaffSheet_();
    sh.getRange(s.rowNum, 4).setValue(hashPin_(newPin, salt));
    sh.getRange(s.rowNum, 5).setValue(salt);
    return JSON.stringify({ ok: true });
  } finally { lock.releaseLock(); }
}

// Photos are stored inline (data URI) in the Staff sheet — no Drive, no scopes,
// no public sharing. Kept small on the client so it stays under the cell limit.
function uploadPhoto(username, pin, base64, mime) {
  var s = verifyStaff_(username, pin);
  if (!s) return JSON.stringify({ ok: false });
  var dataUri = 'data:' + (mime || 'image/jpeg') + ';base64,' + base64;
  if (dataUri.length > 48000) return JSON.stringify({ ok: false, err: 'too_large' });
  getStaffSheet_().getRange(s.rowNum, 9).setValue(dataUri);
  return JSON.stringify({ ok: true, photo: dataUri });
}

/* ---- daily log ---- */
function isoWeek_(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var y = d.getFullYear();
  var jan1 = new Date(y, 0, 1);
  var monW1 = new Date(y, 0, 1 - ((jan1.getDay() + 6) % 7));
  return Math.max(1, Math.min(52, Math.floor((d - monW1) / (7 * 86400000)) + 1));
}
function saveDaily(username, pin, dateStr, payloadJson) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var s = verifyStaff_(username, pin);
    if (!s) return JSON.stringify({ ok: false });
    var p = JSON.parse(payloadJson);
    var sh = getDailySheet_();
    var last = sh.getLastRow();
    var rowNum = null;
    if (last >= 2) {
      var keys = sh.getRange(2, 1, last - 1, 2).getValues();
      for (var i = 0; i < keys.length; i++) {
        if (String(keys[i][0]) === s.id && String(keys[i][1]) === dateStr) { rowNum = i + 2; break; }
      }
    }
    var b = function (v) { return v ? 1 : 0; };
    var n = function (v) { var x = Number(v); return isNaN(x) ? '' : x; };
    var vals = [s.id, dateStr, isoWeek_(dateStr), n(p.langHours), n(p.minHours),
      b(p.workout), b(p.bible), b(p.quietTime), b(p.oneOnOne), b(p.sharedFaith), b(p.sabbath),
      n(p.clarity), n(p.growth), n(p.lonely), b(p.porn), new Date()];
    if (rowNum) sh.getRange(rowNum, 1, 1, 16).setValues([vals]);
    else sh.appendRow(vals);
    return getMyLogs(username, pin);
  } finally { lock.releaseLock(); }
}
function logsFor_(staffId) {
  var sh = getDailySheet_();
  var last = sh.getLastRow();
  var out = [];
  if (last < 2) return out;
  var rng = sh.getRange(2, 1, last - 1, 16).getValues();
  var nn = function (v) { var x = Number(v); return (v === '' || v === null || isNaN(x)) ? null : x; };
  for (var i = 0; i < rng.length; i++) {
    var r = rng[i];
    if (String(r[0]) !== staffId) continue;
    out.push({
      date: String(r[1]), week: Number(r[2]),
      langHours: Number(r[3]) || 0, minHours: Number(r[4]) || 0,
      workout: !!r[5], bible: !!r[6], quietTime: !!r[7], oneOnOne: !!r[8],
      sharedFaith: !!r[9], sabbath: !!r[10],
      clarity: nn(r[11]), growth: nn(r[12]), lonely: nn(r[13]), porn: !!r[14]
    });
  }
  out.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  return out;
}
function getMyLogs(username, pin) {
  var s = verifyStaff_(username, pin);
  if (!s) return JSON.stringify({ ok: false });
  return JSON.stringify({ ok: true, logs: logsFor_(s.id), profile: { debt: s.debt } });
}

/* ---- mentor view (sensitive fields flow only to the chosen mentor) ---- */
function getMyMentees(username, pin) {
  var s = verifyStaff_(username, pin);
  if (!s) return JSON.stringify({ ok: false });
  var mine = staffRows_().rows
    .filter(function (x) { return x.active && x.mentorId === s.id; })
    .map(publicStaff_);
  return JSON.stringify({ ok: true, mentees: mine });
}
function getMenteeLogs(username, pin, menteeId) {
  var s = verifyStaff_(username, pin);
  if (!s) return JSON.stringify({ ok: false });
  var rows = staffRows_().rows, m = null;
  for (var i = 0; i < rows.length; i++) if (rows[i].id === menteeId) m = rows[i];
  if (!m || m.mentorId !== s.id) return JSON.stringify({ ok: false, err: 'not_your_mentee' });
  return JSON.stringify({ ok: true, mentee: publicStaff_(m), logs: logsFor_(m.id), profile: { debt: m.debt } });
}

/* ---- bridge for later: weekly health composite derived from daily logs ----
   Lets the Index dashboard eventually source its health score from real daily
   logs instead of the anonymous weekly survey. Returns aggregates only. */
function weeklyHealthFromLogs(campusId, week) {
  var roster = staffRows_().rows.filter(function (s) { return s.active && s.campus === campusId; });
  var byId = {}; roster.forEach(function (s) { byId[s.id] = s; });
  var sh = getDailySheet_();
  var last = sh.getLastRow();
  if (last < 2) return JSON.stringify({ n: 0 });
  var rng = sh.getRange(2, 1, last - 1, 16).getValues();
  var per = {};
  for (var i = 0; i < rng.length; i++) {
    var r = rng[i];
    if (Number(r[2]) !== Number(week) || !byId[String(r[0])]) continue;
    var id = String(r[0]);
    (per[id] = per[id] || []).push(r);
  }
  var ids = Object.keys(per);
  return JSON.stringify({ n: ids.length, week: week, campus: campusId });
}
