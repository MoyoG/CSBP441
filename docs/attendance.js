(function () {
  "use strict";

  const state = {
    roster: [],
    attendance: new Map(),
    session: null,
    timer: null
  };
  const ROSTER_STORAGE_KEY = "csbp441-attendance-rosters-v1";

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

  $$(".attendance-tab").forEach(tab => tab.addEventListener("click", () => showPanel(tab.dataset.panel)));
  $("#return-instructor").addEventListener("click", () => showPanel("instructor-panel"));
  $("#demo-roster").addEventListener("click", loadDemoRoster);
  $("#roster-file").addEventListener("change", loadRosterFile);
  $("#class-select").addEventListener("change", selectSavedClass);
  $("#start-session").addEventListener("click", startSession);
  $("#close-session").addEventListener("click", () => closeSession("Session closed by instructor."));
  $("#checkin-form").addEventListener("submit", checkIn);
  $("#export-attendance").addEventListener("click", exportAttendance);
  $("#clear-demo").addEventListener("click", clearDemo);
  $("#copy-student-link").addEventListener("click", copyStudentLink);

  updatePhoneTime();
  setInterval(updatePhoneTime, 15000);
  refreshClassOptions();
  restoreLatestRoster();
  if (new URLSearchParams(location.search).get("view") === "student") {
    document.body.classList.add("student-only");
    showPanel("student-panel");
  }

  function showPanel(panelId) {
    $$(".attendance-tab").forEach(tab => {
      const selected = tab.dataset.panel === panelId;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    $$(".attendance-panel").forEach(panel => { panel.hidden = panel.id !== panelId; });
    if (panelId === "student-panel") $("#student-identity").focus();
  }

  function loadDemoRoster() {
    const students = Array.from({length: 8}, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return {
        studentId: `202600${number}`,
        username: `202600${number}`,
        firstName: "Student",
        lastName: number,
        available: "Yes"
      };
    });
    applyRoster(students, "Fictional roster loaded for this demonstration. It did not replace a saved class roster.", {persist: false});
  }

  async function loadRosterFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    $("#roster-status").textContent = `Reading ${file.name}...`;
    try {
      const buffer = await file.arrayBuffer();
      const text = decodeRoster(buffer);
      const delimiter = detectDelimiter(text);
      const records = parseDelimited(text, delimiter);
      const students = mapRoster(records);
      applyRoster(students, `${file.name} validated. The latest roster for this class is now saved in this browser.`, {persist: true});
    } catch (error) {
      applyRosterError(error.message || "The roster could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  function decodeRoster(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes);
    return new TextDecoder("utf-8").decode(bytes);
  }

  function detectDelimiter(text) {
    const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0];
    return (firstLine.match(/\t/g) || []).length >= (firstLine.match(/,/g) || []).length ? "\t" : ",";
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    const input = text.replace(/^\uFEFF/, "");
    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      if (char === '"') {
        if (quoted && input[index + 1] === '"') { field += '"'; index += 1; }
        else quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(field.trim()); field = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && input[index + 1] === "\n") index += 1;
        row.push(field.trim()); field = "";
        if (row.some(value => value !== "")) rows.push(row);
        row = [];
      } else {
        field += char;
      }
    }
    row.push(field.trim());
    if (row.some(value => value !== "")) rows.push(row);
    if (rows.length < 2) throw new Error("The file does not contain a header and student records.");
    const headers = rows[0].map(header => header.trim());
    return rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  }

  function mapRoster(records) {
    const headerNames = Object.keys(records[0] || {});
    const findHeader = choices => headerNames.find(header => choices.includes(header.trim().toLowerCase()));
    const columns = {
      studentId: findHeader(["student id", "studentid", "id"]),
      username: findHeader(["username", "user name", "uaeu username"]),
      firstName: findHeader(["first name", "firstname", "given name"]),
      lastName: findHeader(["last name", "lastname", "family name", "surname"]),
      available: findHeader(["availability", "available"])
    };
    if (!columns.studentId || !columns.username || !columns.firstName || !columns.lastName) {
      throw new Error("Required columns were not found. Include Student ID, Username, First Name, and Last Name.");
    }
    const students = records.map(record => ({
      studentId: String(record[columns.studentId] || "").trim(),
      username: String(record[columns.username] || "").trim(),
      firstName: String(record[columns.firstName] || "").trim(),
      lastName: String(record[columns.lastName] || "").trim(),
      available: columns.available ? String(record[columns.available] || "").trim() : "Yes"
    })).filter(student => Object.values(student).some(Boolean));

    const incomplete = students.filter(student => !student.studentId || !student.username || !student.firstName || !student.lastName);
    if (incomplete.length) throw new Error(`${incomplete.length} roster row(s) are missing an identity field.`);
    const ids = students.map(student => student.studentId.toLowerCase());
    const usernames = students.map(student => student.username.toLowerCase());
    if (new Set(ids).size !== ids.length) throw new Error("Duplicate Student ID values were found.");
    if (new Set(usernames).size !== usernames.length) throw new Error("Duplicate Username values were found.");
    if (!students.length) throw new Error("No student records were found.");
    return students;
  }

  function applyRoster(students, message, options = {}) {
    if (state.session) closeSession("Session closed because the roster changed.");
    state.roster = students;
    state.attendance.clear();
    $("#roster-chip").textContent = `${students.length} students`;
    $("#roster-chip").className = "status-chip is-ready";
    $("#roster-status").textContent = message;
    $("#validation-summary").hidden = false;
    $("#validation-summary").innerHTML = `<strong>Ready to use</strong><span>${students.length} complete records</span><span>${new Set(students.map(item => item.studentId)).size} unique IDs</span><span>${new Set(students.map(item => item.username.toLowerCase())).size} unique usernames</span>`;
    $("#roster-preview").hidden = false;
    $("#roster-body").innerHTML = students.map(student => `<tr><td>${escapeHTML(student.studentId)}</td><td>${escapeHTML(student.username)}</td><td>${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}</td><td>${escapeHTML(student.available || "Yes")}</td></tr>`).join("");
    $("#start-session").disabled = false;
    $("#export-attendance").disabled = false;
    if (options.persist) persistRoster(students);
    else if (options.selectedClass) refreshClassOptions(options.selectedClass);
    renderAttendance();
  }

  function readRosterStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ROSTER_STORAGE_KEY) || "{}");
      return {classes: parsed.classes && typeof parsed.classes === "object" ? parsed.classes : {}, selected: parsed.selected || ""};
    } catch {
      return {classes: {}, selected: ""};
    }
  }

  function writeRosterStore(store) {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch {
      $("#roster-status").textContent = "The roster is valid, but this browser blocked local storage. Keep this tab open or allow site storage.";
      return false;
    }
  }

  function persistRoster(students) {
    const className = $("#class-name").value.trim();
    if (!className) {
      $("#roster-status").textContent = "Enter a class or section name before uploading the roster.";
      return;
    }
    const store = readRosterStore();
    store.classes[className] = {students, uploadedAt: new Date().toISOString()};
    store.selected = className;
    if (writeRosterStore(store)) refreshClassOptions(className);
  }

  function refreshClassOptions(selected = "") {
    const store = readRosterStore();
    const classes = Object.entries(store.classes).sort((left, right) => String(right[1].uploadedAt).localeCompare(String(left[1].uploadedAt)));
    const current = selected || store.selected;
    $("#class-select").innerHTML = '<option value="">New class</option>' + classes.map(([name, record]) => `<option value="${escapeHTML(name)}" ${name === current ? "selected" : ""}>${escapeHTML(name)} (${record.students.length})</option>`).join("");
  }

  function restoreLatestRoster() {
    const store = readRosterStore();
    const className = store.selected && store.classes[store.selected]
      ? store.selected
      : Object.entries(store.classes).sort((left, right) => String(right[1].uploadedAt).localeCompare(String(left[1].uploadedAt)))[0]?.[0];
    if (className) loadSavedRoster(className);
  }

  function selectSavedClass() {
    const className = $("#class-select").value;
    if (!className) {
      clearWorkingRoster();
      $("#class-name").value = "";
      $("#class-name").focus();
      return;
    }
    loadSavedRoster(className);
  }

  function loadSavedRoster(className) {
    const store = readRosterStore();
    const saved = store.classes[className];
    if (!saved || !Array.isArray(saved.students)) return;
    store.selected = className;
    writeRosterStore(store);
    $("#class-name").value = className;
    const savedTime = saved.uploadedAt ? new Intl.DateTimeFormat([], {dateStyle: "medium", timeStyle: "short"}).format(new Date(saved.uploadedAt)) : "an earlier session";
    applyRoster(saved.students, `Loaded the latest saved roster for ${className}, uploaded ${savedTime}.`, {persist: false, selectedClass: className});
  }

  function applyRosterError(message) {
    $("#roster-status").textContent = message;
    $("#roster-chip").textContent = "Validation failed";
    $("#roster-chip").className = "status-chip is-error";
    $("#validation-summary").hidden = true;
    $("#roster-preview").hidden = true;
  }

  function startSession() {
    if (!state.roster.length) {
      $("#roster-status").textContent = "Load and validate a roster before opening attendance.";
      return;
    }
    const duration = Number($("#session-duration").value);
    const bytes = crypto.getRandomValues(new Uint32Array(2));
    state.attendance.clear();
    state.session = {
      secret: `${bytes[0]}-${bytes[1]}`,
      startedAt: Date.now(),
      closesAt: Date.now() + duration * 60000,
      label: $("#session-label").value.trim() || "Class attendance"
    };
    $("#live-session").hidden = false;
    $("#session-chip").textContent = "Open";
    $("#session-chip").className = "status-chip is-live";
    $("#start-session").textContent = "Restart session";
    $("#close-session").disabled = false;
    $("#student-session-name").textContent = state.session.label;
    $("#checkin-result").className = "checkin-result";
    $("#checkin-result").textContent = "";
    clearInterval(state.timer);
    renderStudentQR();
    tick();
    state.timer = setInterval(tick, 1000);
    renderAttendance();
  }

  function tick() {
    if (!state.session) return;
    const remaining = state.session.closesAt - Date.now();
    if (remaining <= 0) { closeSession("The attendance window ended."); return; }
    const totalSeconds = Math.ceil(remaining / 1000);
    $("#time-remaining").textContent = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
    $("#session-code").textContent = currentCode();
    $("#code-remaining").textContent = `${60 - (Math.floor(Date.now() / 1000) % 60)} s`;
    $("#checked-in-count").textContent = `${state.attendance.size} / ${state.roster.length}`;
  }

  function currentCode() {
    if (!state.session) return "";
    const interval = Math.floor(Date.now() / 60000);
    return String(hash(`${state.session.secret}:${interval}`) % 1000000).padStart(6, "0");
  }

  function studentPageURL() {
    const url = new URL("attendance.html", location.href);
    url.searchParams.set("view", "student");
    return url.href;
  }

  function renderStudentQR() {
    const host = $("#student-qr");
    host.innerHTML = "";
    if (typeof QRCode === "undefined") {
      host.innerHTML = '<span class="qr-fallback">QR unavailable</span>';
      return;
    }
    new QRCode(host, {
      text: studentPageURL(),
      width: 300,
      height: 300,
      colorDark: "#17202a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  async function copyStudentLink() {
    try {
      await navigator.clipboard.writeText(studentPageURL());
      $("#copy-student-link").textContent = "Link copied";
      setTimeout(() => { $("#copy-student-link").textContent = "Copy student link"; }, 1800);
    } catch {
      $("#copy-student-link").textContent = "Use the QR code";
    }
  }

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function closeSession(message) {
    clearInterval(state.timer);
    state.timer = null;
    state.session = null;
    $("#session-chip").textContent = "Closed";
    $("#session-chip").className = "status-chip";
    $("#close-session").disabled = true;
    $("#start-session").textContent = "Start session";
    $("#student-session-name").textContent = "Attendance is closed";
    if (message) {
      $("#checkin-result").className = "checkin-result is-error";
      $("#checkin-result").textContent = message;
    }
  }

  function checkIn(event) {
    event.preventDefault();
    const result = $("#checkin-result");
    const identity = $("#student-identity").value.trim().toLowerCase();
    const code = $("#student-code").value.trim();
    result.className = "checkin-result";

    if (!state.session || Date.now() >= state.session.closesAt) return checkinError("Attendance is not currently open.");
    const student = state.roster.find(item => item.studentId.toLowerCase() === identity || item.username.toLowerCase() === identity);
    if (!student) return checkinError("This verified account is not in the selected class roster.");
    if (student.available && student.available.toLowerCase() === "no") return checkinError("This student is not currently available in the roster.");
    if (code !== currentCode()) return checkinError("The classroom code is incorrect or has just expired.");
    if (state.attendance.has(student.studentId)) return checkinError("A check-in has already been recorded for this student.");

    state.attendance.set(student.studentId, { timestamp: new Date(), student });
    result.className = "checkin-result is-success";
    result.innerHTML = `<strong>Check-in accepted</strong><span>${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)} at ${escapeHTML(formatTime(new Date()))}</span>`;
    $("#student-code").value = "";
    renderAttendance();
    tick();
  }

  function checkinError(message) {
    const result = $("#checkin-result");
    result.className = "checkin-result is-error";
    result.textContent = message;
  }

  function renderAttendance() {
    const present = state.attendance.size;
    $("#metric-present").textContent = String(present);
    $("#metric-absent").textContent = String(Math.max(0, state.roster.length - present));
    $("#metric-roster").textContent = String(state.roster.length);
    $("#checked-in-count").textContent = `${present} / ${state.roster.length}`;
    if (!state.roster.length) {
      $("#attendance-body").innerHTML = '<tr><td colspan="4" class="empty-table">Load a roster to begin.</td></tr>';
      return;
    }
    $("#attendance-body").innerHTML = state.roster.map(student => {
      const record = state.attendance.get(student.studentId);
      return `<tr><td>${escapeHTML(student.firstName)} ${escapeHTML(student.lastName)}</td><td>${escapeHTML(student.studentId)}</td><td><span class="attendance-state ${record ? "is-present" : ""}">${record ? "Present" : "Not checked in"}</span></td><td>${record ? escapeHTML(formatTime(record.timestamp)) : "-"}</td></tr>`;
    }).join("");
  }

  function exportAttendance() {
    if (!state.roster.length) return;
    const quote = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [["Class", "Session", "Student ID", "Username", "First Name", "Last Name", "Status", "Check-in time"]];
    state.roster.forEach(student => {
      const record = state.attendance.get(student.studentId);
      rows.push([
        $("#class-name").value.trim(),
        $("#session-label").value.trim(),
        student.studentId,
        student.username,
        student.firstName,
        student.lastName,
        record ? "Present" : "Absent",
        record ? record.timestamp.toISOString() : ""
      ]);
    });
    const blob = new Blob(["\uFEFF" + rows.map(row => row.map(quote).join(",")).join("\r\n")], {type: "text/csv;charset=utf-8"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${safeFilename($("#class-name").value)}-${safeFilename($("#session-label").value)}-attendance.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function safeFilename(value) {
    return String(value || "class").trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "class";
  }

  function clearDemo() {
    closeSession();
    clearWorkingRoster();
    $("#roster-status").textContent = "The current view was cleared. Saved class rosters remain available in the Saved class menu.";
    $("#student-identity").value = "";
    $("#student-code").value = "";
    $("#checkin-result").textContent = "";
    renderAttendance();
  }

  function clearWorkingRoster() {
    state.roster = [];
    state.attendance.clear();
    $("#roster-chip").textContent = "No roster";
    $("#roster-chip").className = "status-chip";
    $("#validation-summary").hidden = true;
    $("#roster-preview").hidden = true;
    $("#live-session").hidden = true;
    $("#export-attendance").disabled = true;
    renderAttendance();
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat([], {hour: "2-digit", minute: "2-digit", second: "2-digit"}).format(date);
  }

  function updatePhoneTime() {
    $("#phone-time").textContent = new Intl.DateTimeFormat([], {hour: "2-digit", minute: "2-digit"}).format(new Date());
  }
})();
