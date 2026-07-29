/**
 * Deploy kode ini di dalam Google Sheet (Extensions > Apps Script) yang punya
 * tab "Customers" dengan 3 kolom, satu baris header + satu baris data per pelanggan:
 *
 *   A: Email            B: Kode Akses        C: Status
 *   budi@email.com       ABC123               active
 *   siti@email.com       XYZ789               inactive
 *
 * Cara tercepat membuat tab ini: import `Customers-template.csv` (satu folder
 * dengan file ini) lewat File > Import di Google Sheets - header dan 2 baris
 * contoh di atas sudah otomatis terisi. Lihat README.md Langkah 2 untuk detail.
 * HAPUS 2 baris contoh itu sebelum sheet ini dipakai sungguhan, karena kode
 * akses "ABC123" ada di paket publik dan siapa pun bisa memakainya untuk login.
 *
 * Tambahkan baris baru secara manual setiap ada yang bayar. Ubah Status jadi
 * "inactive" untuk mencabut akses tanpa menghapus barisnya (riwayat tetap ada).
 *
 * Setelah paste isi file ini ke editor Apps Script:
 *   Deploy > New deployment > type: Web app
 *     Execute as: Me
 *     Who has access: Anyone
 *   Salin URL /exec yang muncul ke `appsScriptUrl` di src/config.js.
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
