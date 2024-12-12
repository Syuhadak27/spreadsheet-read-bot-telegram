// log.gs
function logErrorToSheet(errorMessage, context) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("log");
  if (!sheet) {
    // Jika sheet "LOG" tidak ada, buat sheet baru
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("log");
    // Tambahkan header ke sheet "LOG"
    sheet.appendRow(["Timestamp", "Error Message", "Context"]);
  }
  // Dapatkan waktu saat ini
  var timestamp = new Date();
  // Tambahkan baris baru dengan data log
  sheet.appendRow([timestamp, errorMessage, context || ""]);
}


function sendLog(logMessage) {
  sendMessage(CHANNEL_ID, logMessage, { parse_mode: "HTML" });
}
