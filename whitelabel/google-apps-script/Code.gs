/**
 * Deploy this inside a Google Sheet (Extensions > Apps Script) that has a
 * "Customers" tab with 3 columns, one header row + one data row per customer:
 *
 *   A: Email            B: Kode Akses        C: Status
 *   budi@email.com       ABC123               active
 *   siti@email.com       XYZ789               inactive
 *
 * Add a row here manually whenever someone pays. Set Status to "inactive" to
 * revoke access without deleting the row (keeps their history).
 *
 * After pasting this file's contents into the Apps Script editor:
 *   Deploy > New deployment > type: Web app
 *     Execute as: Me
 *     Who has access: Anyone
 *   Copy the resulting /exec URL into src/config.js as `appsScriptUrl`.
 */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Customers');
  var data = sheet.getDataRange().getValues();
  var email = String((e.parameter.email || '')).trim().toLowerCase();
  var code = String((e.parameter.code || '')).trim();

  for (var i = 1; i < data.length; i++) {
    var rowEmail = String(data[i][0]).trim().toLowerCase();
    var rowCode = String(data[i][1]).trim();
    var status = String(data[i][2]).trim().toLowerCase();

    if (rowEmail === email && rowCode === code) {
      var active = status === 'active';
      return respond({ ok: active, reason: active ? null : 'inactive' });
    }
  }

  return respond({ ok: false, reason: 'not_found' });
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
