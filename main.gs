var SPREADSHEET_ID = ""; // Ganti dengan ID Spreadsheet
var CHANNEL_ID = "-100xxxxx"; // Ganti dengan ID Channel log
var BOT_TOKEN = ""; // Ganti dengan Token Bot
var CHANNEL_USERNAME = ""; // Ganti dengan username channel tanpa @
var url = ""; // Ganti dengan URL Apps Script Anda

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Cek jika pesan kosong
    if (!data.message) return;

    var message = data.message.text || "";
    var chatId = data.message.chat.id;
    var messageId = data.message.message_id;
    var firstName = data.message.from.first_name || "Pengguna";

    // Cek apakah user sudah join channel
    if (!isUserJoined(chatId)) {
      var joinMessage = "Silakan join ke channel berikut untuk menggunakan bot:";
      sendMessage(chatId, joinMessage, {
        reply_markup: JSON.stringify({
          inline_keyboard: [[{ text: "Join Channel", url: "https://t.me/" + CHANNEL_USERNAME }]]
        })
      });
      deleteMessage(chatId, messageId, 5);
      return;
    }

    // Jika command /start
    if (message === "/start") {
      sendMessage(chatId, "Bot aktif", {});
      deleteMessage(chatId, messageId, 3);
      return;
    }

    // Jika command /refresh
    if (message === "/refresh") {
      var cache = CacheService.getScriptCache();
      cache.remove("databaseCache");
      cache.remove("inoutCache");
      sendMessage(chatId, "Cache berhasil direset.", { reply_to_message_id: messageId });
      return;
    }

    // Cek apakah pesan dimulai dengan titik untuk pencarian
    if (message.startsWith(".")) {
      var query = message.replace(".", "").trim(); // Menghapus titik dan trim spasi

      if (!query) {
        // Jika tidak ada kata kunci, kirim pesan "Tidak bisa tanpa kata kunci"
        sendMessage(chatId, "Tidak bisa tanpa kata kunci", { reply_to_message_id: messageId });
        deleteMessage(chatId, messageId, 5);
        return;
      }

      // Lakukan pencarian data berdasarkan query
      var result = searchInout(query);

      // Jika tidak ditemukan
      if (!result) {
        sendMessage(chatId, "Data tidak ditemukan", { reply_to_message_id: messageId });
        deleteMessage(chatId, messageId, 5);
        return;
      }

      // Kirim hasil pencarian
      splitAndSend(chatId, result);

      // Kirim log
      sendLog(`User: ${firstName}\nQuery: ${message}`);
      deleteMessage(chatId, messageId, 3);
      return;
    }

    // Lakukan pencarian data dengan fungsi lain (misalnya searchDatabase)
    var result = searchDatabase(message);

    // Jika tidak ditemukan
    if (!result) {
      sendMessage(chatId, "Data tidak ada", {});
      deleteMessage(chatId, messageId, 5);
      return;
    }

    // Kirim hasil
    splitAndSend(chatId, result);

    // Kirim log
    sendLog(`User: ${firstName}\nQuery: ${message}`);
    deleteMessage(chatId, messageId, 3);

  } catch (error) {
    // Log error ke sheet LOG
    logErrorToSheet(error.message, "doPost Function");
  }
}




// Code.gs
function doPostFIX(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Cek jika pesan kosong
    if (!data.message) return;

    var message = data.message.text || "";
    var chatId = data.message.chat.id;
    var messageId = data.message.message_id;
    var firstName = data.message.from.first_name || "Pengguna";

    // Cek apakah user sudah join channel
    if (!isUserJoined(chatId)) {
      var joinMessage = "Silakan join ke channel berikut untuk menggunakan bot:";
      sendMessage(chatId, joinMessage, {
        reply_markup: JSON.stringify({
          inline_keyboard: [[{ text: "Join Channel", url: "https://t.me/" + CHANNEL_USERNAME }]]
        })
      });
      deleteMessage(chatId, messageId, 5);
      return;
    }

    // Jika command /start
    if (message === "/start") {
      sendMessage(chatId, "Bot aktif", {});
      deleteMessage(chatId, messageId, 3);
      return;
    }

    // Lakukan pencarian data
    var result = searchDatabase(message);

    // Jika tidak ditemukan
    if (!result) {
      sendMessage(chatId, "Data tidak ada", {});
      deleteMessage(chatId, messageId, 5);
      return;
    }

    // Kirim hasil
    splitAndSend(chatId, result);

    // Kirim log
    sendLog(`User: ${firstName}\nQuery: ${message}`);
    deleteMessage(chatId, messageId, 3);

  } catch (error) {
    // Log error ke sheet LOG
    logErrorToSheet(error.message, "doPost Function");
  }
}

function sendMessage(chatId, text, options) {
  try {
    var url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    var payload = {
      chat_id: chatId,
      text: text,
      ...options
    };
    var response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
    return response.getContentText();
  } catch (error) {
    // Log error jika pengiriman pesan gagal
    logErrorToSheet(error.message, "sendMessage Function");
  }
}

function deleteMessage(chatId, messageId, delaySeconds) {
  try {
    Utilities.sleep(delaySeconds * 1000);
    var url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`;
    var payload = {
      chat_id: chatId,
      message_id: messageId
    };
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
  } catch (error) {
    // Log error jika penghapusan pesan gagal
    logErrorToSheet(error.message, "deleteMessage Function");
  }
}


// Fungsi untuk setup webhook
function setWebhook() {
  //var url = "URL_APPS_SCRIPT"; // Ganti dengan URL Apps Script Anda
  var webhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`;
  var response = UrlFetchApp.fetch(webhookUrl);
  Logger.log(response.getContentText());
}

