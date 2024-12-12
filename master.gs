function searchDatabase(query) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "databaseCache";
  var cachedData = cache.get(cacheKey);

  // Jika ada data dalam cache, gunakan itu
  var data;
  var cacheTimestamp;
  if (cachedData) {
    var parsedCache = JSON.parse(cachedData);
    data = parsedCache.data;
    cacheTimestamp = parsedCache.timestamp;
  } else {
    // Jika tidak ada, baca data dari Google Sheets
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DATABASE");
    data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();

    // Simpan data ke cache selama 12 jam (43200 detik)
    cacheTimestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    cache.put(cacheKey, JSON.stringify({ data: data, timestamp: cacheTimestamp }), 43200);
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

  // Menambahkan footer dengan waktu cache diambil
  var footer = `\n\n<i>Data diperbarui pada: ${cacheTimestamp}</i>`;

  return results.map(row => {
    return `<blockquote>${row[0]} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]}</blockquote>`;
  }).join("\n") + footer;
}


function searchDatabaseCACHE(query) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "databaseCache";
  var cachedData = cache.get(cacheKey);

  // Jika ada data dalam cache, gunakan itu
  var data;
  if (cachedData) {
    data = JSON.parse(cachedData);
  } else {
    // Jika tidak ada, baca data dari Google Sheets
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DATABASE");
    data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();

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
    return `<blockquote>${row[0]} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]}</blockquote>`;
  }).join("\n");
}



function searchDatabaseWORK(query) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DATABASE");
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();

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
    return `<blockquote>${row[0]} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]}</blockquote>`;
  }).join("\n");
}



// Fungsi untuk cek apakah user sudah join channel
function isUserJoined(chatId) {
  try {
    var url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=@${CHANNEL_USERNAME}&user_id=${chatId}`;
    var response = UrlFetchApp.fetch(url);
    var result = JSON.parse(response.getContentText());
    return result.result && 
           (result.result.status === "member" || 
            result.result.status === "administrator" || 
            result.result.status === "creator");
  } catch (e) {
    Logger.log("Error checking membership: " + e.message);
    return false; // Default ke "tidak join" jika API gagal
  }
}
