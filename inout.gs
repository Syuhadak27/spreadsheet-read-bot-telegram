

function searchInoutWORK(query) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("inout");
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();

  // Memecah query menjadi array kata kunci berdasarkan tanda '*'
  var keywords = query.split(' ').map(keyword => keyword.trim().toLowerCase());

  // Menyaring data berdasarkan kata kunci
  var results = data.filter(row => {
    return keywords.every(keyword => {
      return row.some(cell => String(cell).toLowerCase().includes(keyword));
    });
  });

  if (results.length === 0) return null;

  return results.map(row => {
    // Pastikan tanggal diformat dengan benar (misalnya, jika row[0] adalah tanggal)
    var formattedDate = (row[0] instanceof Date) ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "dd-MM-yyyy") : row[0];
    return `<blockquote>${formattedDate} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]} • ${row[5]}</blockquote>`;
  }).join("\n");
}



function searchInout(query) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "inoutCache";
  var cachedData = cache.get(cacheKey);

  // Jika ada data dalam cache, gunakan itu
  var data;
  if (cachedData) {
    data = JSON.parse(cachedData);
  } else {
    // Jika tidak ada, baca data dari Google Sheets
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("inout");
    data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();

    // Simpan data ke cache selama 12 jam (43200 detik)
    cache.put(cacheKey, JSON.stringify(data), 43200);
  }

  // Memecah query menjadi array kata kunci berdasarkan tanda '*'
  var keywords = query.split(' ').map(keyword => keyword.trim().toLowerCase());

  // Menyaring data berdasarkan kata kunci
  var results = data.filter(row => {
    return keywords.every(keyword => {
      return row.some(cell => String(cell).toLowerCase().includes(keyword));
    });
  });

  if (results.length === 0) return null;

  return results.map(row => {
    // Pastikan tanggal diformat dengan benar (misalnya, jika row[0] adalah tanggal)
    var formattedDate = (row[0] instanceof Date) ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "dd-MM-yyyy") : row[0];
    return `<blockquote>${formattedDate} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]} • ${row[5]}</blockquote>`;
  }).join("\n");
}

