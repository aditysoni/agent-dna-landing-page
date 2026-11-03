// Google Apps Script behind the site's forms (demo.js, vuln.js), in the "AgentDNA" sheet. One script per sheet, so it
// also keeps the older email sign-up handler (Registrations tab). Setup steps are in README.md next to this file.
//
// - The site sends JSON with a `form` field → a row in the tab named after the form: demo, contact, health-check or
//   vulnerability.
// - Anything else (form-encoded email/ts/source) → a row in Registrations, as before.

const COLUMNS = {
  demo: ['firstName', 'lastName', 'email', 'company', 'companySize', 'role', 'message'],
  contact: ['firstName', 'lastName', 'email', 'company', 'topic', 'message'],
  'health-check': ['firstName', 'lastName', 'email', 'company', 'companySize', 'agentCount', 'message'],
  vulnerability: ['ref', 'product', 'kind', 'severity', 'url', 'title', 'description', 'steps', 'impact', 'name', 'email', 'agree'],
};

function doPost(e) {
  // Run in the editor, doPost gets no request; use testForm below instead
  if (!e || !e.postData) throw new Error('doPost only runs from a web request. To test, run testForm.');
  let data = null;
  try { data = JSON.parse(e.postData.contents); } catch (err) { /* not JSON: a registration */ }
  if (data && COLUMNS[data.form]) saveForm(data);
  else saveRegistration(e);
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveForm(data) {
  const cols = COLUMNS[data.form];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(data.form) || book.insertSheet(data.form);
    if (sheet.getLastRow() === 0) sheet.appendRow(['submittedAt', ...cols]);
    sheet.appendRow([new Date(), ...cols.map((c) => clean(data[c]))]);
  } finally {
    lock.releaseLock();
  }
}

// the original sign-up handler, unchanged
function saveRegistration(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registrations');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email', 'Source']);
  }

  var email = (e.parameter.email || '').trim();
  var ts = e.parameter.ts || new Date().toISOString();
  var source = e.parameter.source || '';

  if (email) {
    sheet.appendRow([ts, email, source]);
  }
}

// Run this from the editor (pick testForm in the function list, then Run): adds a test row to the contact tab
function testForm() {
  doPost({ postData: { contents: JSON.stringify({
    form: 'contact', firstName: 'Test', lastName: 'Row', email: 'test@agentdna.io', topic: 'Test', message: 'Delete me',
  }) }, parameter: {} });
}

// a leading = + - @ would make Sheets run the value as a formula
function clean(v) {
  v = String(v || '').slice(0, 5000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
