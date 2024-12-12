// Fungsi untuk membagi pesan panjang
function splitAndSend(chatId, text) {
  var maxLength = 4000; // Batas maksimum panjang pesan Telegram.
  var messages = [];
  
  while (text.length > maxLength) {
    // Cari batas aman untuk memotong pesan tanpa memotong tag HTML.
    var splitAt = text.lastIndexOf("</blockquote>", maxLength);
    if (splitAt === -1) splitAt = text.lastIndexOf(" ", maxLength);
    if (splitAt === -1) splitAt = maxLength; // Jika tidak ada spasi, paksa potong.

    // Ambil bagian pesan
    var part = text.substring(0, splitAt + "</blockquote>".length);
    messages.push(part);

    // Sisa teks
    text = text.substring(splitAt + "</blockquote>".length).trim();
  }

  // Tambahkan bagian terakhir
  if (text.length > 0) messages.push(text);

  // Kirim pesan satu per satu
  messages.forEach(function (msg) {
    sendMessage(chatId, msg, { parse_mode: "HTML" });
  });
}


function refreshCache() {
  var cache = CacheService.getScriptCache();
  cache.remove("databaseCache");
  cache.remove("inoutCache");
}


