var APP_TITLE = "CSBP441 Attendance";
var SHEETS = {
  ROSTERS: "Rosters",
  SESSIONS: "Sessions",
  ATTENDANCE: "Attendance"
};
var HEADERS = {};
HEADERS[SHEETS.ROSTERS] = ["Class", "Student ID", "Username", "First Name", "Last Name", "Available", "Uploaded At"];
HEADERS[SHEETS.SESSIONS] = ["Session ID", "Class", "Label", "Started At", "Closes At", "Secret", "Status"];
HEADERS[SHEETS.ATTENDANCE] = ["Session ID", "Class", "Student ID", "Username", "Name", "Checked In At"];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Attendance")
    .addItem("Set up attendance system", "setupAttendanceSystem")
    .addItem("Replace instructor passphrase", "replaceInstructorPassphrase")
    .addToUi();
}

function setupAttendanceSystem() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Open this script from a Google Sheet before running setup.");
  var response = SpreadsheetApp.getUi().prompt(
    "Attendance setup",
    "Enter an instructor passphrase with at least 12 characters. Do not use your UAEU password.",
    SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== SpreadsheetApp.getUi().Button.OK) return;
  setPassphrase_(response.getResponseText());
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheet.getId());
  ensureSheets_(spreadsheet);
  SpreadsheetApp.getUi().alert("Attendance storage is ready. Deploy the script as a web app next.");
}

function replaceInstructorPassphrase() {
  var response = SpreadsheetApp.getUi().prompt(
    "Replace instructor passphrase",
    "Enter a new passphrase with at least 12 characters.",
    SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== SpreadsheetApp.getUi().Button.OK) return;
  setPassphrase_(response.getResponseText());
  SpreadsheetApp.getUi().alert("The instructor passphrase was replaced.");
}

function doGet(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  var parameters = e && e.parameter ? e.parameter : {};
  template.bootstrap = safeJson_({
    view: parameters.view === "student" ? "student" : "instructor",
    sessionId: cleanText_(parameters.session || "", 100),
    webAppUrl: ScriptApp.getService().getUrl() || ""
  });
  return template.evaluate()
    .setTitle(APP_TITLE)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function instructorBootstrap(passphrase) {
  verifyInstructor_(passphrase);
  return {
    classes: listClasses_(),
    activeSessions: listActiveSessions_(),
    webAppUrl: ScriptApp.getService().getUrl() || ""
  };
}

function saveRoster(passphrase, className, students) {
  verifyInstructor_(passphrase);
  className = cleanRequired_(className, "Class name", 80);
  if (!Array.isArray(students) || students.length < 1 || students.length > 300) {
    throw new Error("The roster must contain between 1 and 300 students.");
  }

  var normalized = [];
  var ids = {};
  var usernames = {};
  students.forEach(function (student, index) {
    var row = normalizeStudent_(student, index + 2);
    var idKey = row.studentId.toLowerCase();
    var usernameKey = row.username.toLowerCase();
    if (ids[idKey]) throw new Error("Duplicate Student ID: " + row.studentId);
    if (usernames[usernameKey]) throw new Error("Duplicate Username: " + row.username);
    ids[idKey] = true;
    usernames[usernameKey] = true;
    normalized.push(row);
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_(SHEETS.ROSTERS);
    var existing = dataRows_(sheet).filter(function (row) { return String(row[0]) !== className; });
    var uploadedAt = new Date();
    var replacement = normalized.map(function (student) {
      return [className, student.studentId, student.username, student.firstName, student.lastName, student.available, uploadedAt];
    });
    replaceDataRows_(sheet, existing.concat(replacement));
    return {ok: true, className: className, count: normalized.length, uploadedAt: uploadedAt.toISOString()};
  } finally {
    lock.releaseLock();
  }
}

function startSession(passphrase, className, label, durationMinutes) {
  verifyInstructor_(passphrase);
  className = cleanRequired_(className, "Class", 80);
  label = cleanRequired_(label, "Session label", 100);
  durationMinutes = Number(durationMinutes);
  if (!isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 180) {
    throw new Error("Session duration must be between 1 and 180 minutes.");
  }
  if (getRosterForClass_(className).length < 1) throw new Error("Upload a roster for this class first.");

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    closeOpenSessionsForClass_(className);
    var now = new Date();
    var closesAt = new Date(now.getTime() + durationMinutes * 60000);
    var sessionId = Utilities.getUuid();
    var secret = Utilities.getUuid() + Utilities.getUuid();
    getSheet_(SHEETS.SESSIONS).appendRow([sessionId, className, label, now, closesAt, secret, "OPEN"]);
    return buildInstructorSession_(sessionId);
  } finally {
    lock.releaseLock();
  }
}

function getInstructorSession(passphrase, sessionId) {
  verifyInstructor_(passphrase);
  return buildInstructorSession_(cleanRequired_(sessionId, "Session ID", 100));
}

function closeSession(passphrase, sessionId) {
  verifyInstructor_(passphrase);
  var session = findSession_(cleanRequired_(sessionId, "Session ID", 100));
  if (!session) throw new Error("Session not found.");
  getSheet_(SHEETS.SESSIONS).getRange(session.rowNumber, 7).setValue("CLOSED");
  return {ok: true};
}

function getStudentSession(sessionId) {
  var session = findSession_(cleanRequired_(sessionId, "Session ID", 100));
  if (!session) return {open: false, message: "This attendance session does not exist."};
  var open = isSessionOpen_(session);
  return {
    open: open,
    className: session.className,
    label: session.label,
    closesAt: session.closesAt.toISOString(),
    secondsRemaining: Math.max(0, Math.ceil((session.closesAt.getTime() - Date.now()) / 1000)),
    codeSecondsRemaining: 60 - (Math.floor(Date.now() / 1000) % 60),
    message: open ? "" : "This attendance session is closed."
  };
}

function studentCheckIn(sessionId, identity, submittedCode) {
  sessionId = cleanRequired_(sessionId, "Session ID", 100);
  identity = cleanRequired_(identity, "Student ID", 100).toLowerCase();
  submittedCode = cleanRequired_(submittedCode, "Classroom code", 6);
  if (!/^\d{6}$/.test(submittedCode)) throw new Error("Enter the six-digit classroom code.");

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var session = findSession_(sessionId);
    if (!session || !isSessionOpen_(session)) throw new Error("This attendance session is closed.");
    if (!validCurrentCode_(session.secret, submittedCode)) throw new Error("The classroom code is incorrect or has expired.");

    var roster = getRosterForClass_(session.className);
    var student = null;
    roster.some(function (item) {
      if (item.studentId.toLowerCase() === identity || item.username.toLowerCase() === identity) {
        student = item;
        return true;
      }
      return false;
    });
    if (!student) throw new Error("This ID is not in the roster for " + session.className + ".");
    if (String(student.available).toLowerCase() === "no") throw new Error("This student is not available in the current roster.");

    var attendance = getAttendanceForSession_(sessionId);
    var duplicate = attendance.some(function (record) { return record.studentId === student.studentId; });
    if (duplicate) throw new Error("Attendance has already been recorded for this student.");

    var checkedInAt = new Date();
    getSheet_(SHEETS.ATTENDANCE).appendRow([
      sessionId,
      session.className,
      student.studentId,
      student.username,
      student.firstName + " " + student.lastName,
      checkedInAt
    ]);
    return {ok: true, name: student.firstName + " " + student.lastName, checkedInAt: checkedInAt.toISOString()};
  } finally {
    lock.releaseLock();
  }
}

function buildInstructorSession_(sessionId) {
  var session = findSession_(sessionId);
  if (!session) throw new Error("Session not found.");
  var open = isSessionOpen_(session);
  if (!open && session.status === "OPEN") getSheet_(SHEETS.SESSIONS).getRange(session.rowNumber, 7).setValue("CLOSED");
  var roster = getRosterForClass_(session.className);
  var attendance = getAttendanceForSession_(sessionId);
  var present = {};
  attendance.forEach(function (record) { present[record.studentId] = record; });
  var rows = roster.map(function (student) {
    var record = present[student.studentId];
    return {
      studentId: student.studentId,
      username: student.username,
      name: student.firstName + " " + student.lastName,
      status: record ? "Present" : "Absent",
      checkedInAt: record ? record.checkedInAt.toISOString() : ""
    };
  });
  return {
    sessionId: session.sessionId,
    className: session.className,
    label: session.label,
    open: open,
    closesAt: session.closesAt.toISOString(),
    secondsRemaining: Math.max(0, Math.ceil((session.closesAt.getTime() - Date.now()) / 1000)),
    code: open ? currentCode_(session.secret, Date.now()) : "",
    codeSecondsRemaining: 60 - (Math.floor(Date.now() / 1000) % 60),
    presentCount: attendance.length,
    rosterCount: roster.length,
    rows: rows,
    studentUrl: (ScriptApp.getService().getUrl() || "") + "?view=student&session=" + encodeURIComponent(session.sessionId)
  };
}

function listClasses_() {
  var grouped = {};
  dataRows_(getSheet_(SHEETS.ROSTERS)).forEach(function (row) {
    var name = String(row[0] || "");
    if (!name) return;
    if (!grouped[name]) grouped[name] = {name: name, count: 0, uploadedAt: ""};
    grouped[name].count += 1;
    var uploaded = asDate_(row[6]);
    if (uploaded && (!grouped[name].uploadedAt || uploaded.toISOString() > grouped[name].uploadedAt)) {
      grouped[name].uploadedAt = uploaded.toISOString();
    }
  });
  return Object.keys(grouped).map(function (key) { return grouped[key]; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
}

function listActiveSessions_() {
  return dataRows_(getSheet_(SHEETS.SESSIONS)).map(sessionFromRow_).filter(isSessionOpen_).map(function (session) {
    return {sessionId: session.sessionId, className: session.className, label: session.label, closesAt: session.closesAt.toISOString()};
  });
}

function getRosterForClass_(className) {
  return dataRows_(getSheet_(SHEETS.ROSTERS)).filter(function (row) { return String(row[0]) === className; }).map(function (row) {
    return {
      studentId: String(row[1] || ""),
      username: String(row[2] || ""),
      firstName: String(row[3] || ""),
      lastName: String(row[4] || ""),
      available: String(row[5] || "Yes")
    };
  });
}

function getAttendanceForSession_(sessionId) {
  return dataRows_(getSheet_(SHEETS.ATTENDANCE)).filter(function (row) { return String(row[0]) === sessionId; }).map(function (row) {
    return {studentId: String(row[2] || ""), checkedInAt: asDate_(row[5]) || new Date(0)};
  });
}

function findSession_(sessionId) {
  var rows = dataRows_(getSheet_(SHEETS.SESSIONS));
  for (var index = rows.length - 1; index >= 0; index -= 1) {
    if (String(rows[index][0]) === sessionId) {
      var session = sessionFromRow_(rows[index]);
      session.rowNumber = index + 2;
      return session;
    }
  }
  return null;
}

function sessionFromRow_(row) {
  return {
    sessionId: String(row[0] || ""),
    className: String(row[1] || ""),
    label: String(row[2] || ""),
    startedAt: asDate_(row[3]) || new Date(0),
    closesAt: asDate_(row[4]) || new Date(0),
    secret: String(row[5] || ""),
    status: String(row[6] || "CLOSED")
  };
}

function closeOpenSessionsForClass_(className) {
  var sheet = getSheet_(SHEETS.SESSIONS);
  var rows = dataRows_(sheet);
  rows.forEach(function (row, index) {
    if (String(row[1]) === className && String(row[6]) === "OPEN") sheet.getRange(index + 2, 7).setValue("CLOSED");
  });
}

function isSessionOpen_(session) {
  return session.status === "OPEN" && session.closesAt.getTime() > Date.now();
}

function validCurrentCode_(secret, submittedCode) {
  var now = Date.now();
  if (submittedCode === currentCode_(secret, now)) return true;
  return now % 60000 < 10000 && submittedCode === currentCode_(secret, now - 60000);
}

function currentCode_(secret, timestamp) {
  var bucket = String(Math.floor(timestamp / 60000));
  var bytes = Utilities.computeHmacSha256Signature(bucket, secret);
  var value = (((bytes[0] & 255) << 24) | ((bytes[1] & 255) << 16) | ((bytes[2] & 255) << 8) | (bytes[3] & 255)) >>> 0;
  return String(value % 1000000).padStart(6, "0");
}

function normalizeStudent_(student, rowNumber) {
  var result = {
    studentId: cleanRequired_(student.studentId, "Student ID at row " + rowNumber, 100),
    username: cleanRequired_(student.username, "Username at row " + rowNumber, 100),
    firstName: cleanRequired_(student.firstName, "First Name at row " + rowNumber, 100),
    lastName: cleanRequired_(student.lastName, "Last Name at row " + rowNumber, 100),
    available: cleanText_(student.available || "Yes", 20)
  };
  return result;
}

function ensureSheets_(spreadsheet) {
  Object.keys(HEADERS).forEach(function (name) {
    ensureSheet_(spreadsheet, name);
  });
}

function getSheet_(name) {
  var spreadsheet = openSpreadsheet_();
  return ensureSheet_(spreadsheet, name);
}

function ensureSheet_(spreadsheet, name) {
  var sheet = spreadsheet.getSheetByName(name);
  if (sheet) return sheet;
  sheet = spreadsheet.insertSheet(name);
  var headers = HEADERS[name];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#173a5e").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  return sheet;
}

function openSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Run setupAttendanceSystem from the bound Google Sheet first.");
  return SpreadsheetApp.openById(id);
}

function dataRows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
}

function replaceDataRows_(sheet, rows) {
  var existingRows = Math.max(0, sheet.getLastRow() - 1);
  if (existingRows) sheet.getRange(2, 1, existingRows, sheet.getLastColumn()).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, HEADERS[sheet.getName()].length).setValues(rows);
}

function setPassphrase_(passphrase) {
  passphrase = String(passphrase || "");
  if (passphrase.length < 12) throw new Error("Use an instructor passphrase with at least 12 characters.");
  var salt = Utilities.getUuid() + Utilities.getUuid();
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty("ADMIN_SALT", salt);
  properties.setProperty("ADMIN_HASH", digestHex_(salt + passphrase));
}

function verifyInstructor_(passphrase) {
  var properties = PropertiesService.getScriptProperties();
  var expected = properties.getProperty("ADMIN_HASH");
  var salt = properties.getProperty("ADMIN_SALT");
  if (!expected || !salt) throw new Error("Run setupAttendanceSystem before using the web app.");
  var actual = digestHex_(salt + String(passphrase || ""));
  if (!constantTimeEqual_(expected, actual)) throw new Error("Incorrect instructor passphrase.");
}

function digestHex_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8).map(function (byte) {
    return (byte + 256).toString(16).slice(-2);
  }).join("");
}

function constantTimeEqual_(left, right) {
  if (left.length !== right.length) return false;
  var difference = 0;
  for (var index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function cleanRequired_(value, label, maximumLength) {
  var cleaned = cleanText_(value, maximumLength);
  if (!cleaned) throw new Error(label + " is required.");
  return cleaned;
}

function cleanText_(value, maximumLength) {
  return String(value == null ? "" : value).trim().slice(0, maximumLength);
}

function asDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  var parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function safeJson_(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
