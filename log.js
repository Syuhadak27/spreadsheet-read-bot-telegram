import { config } from "./config.js";
const BOT_TOKEN = config.TOKEN;
const LOG_CHANNEL_ID = config.LOG_CHANNEL_ID; // ID channel log Telegram

// Fungsi untuk mendapatkan informasi bot
async function getBotInfo() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.ok) {
    return {
      username: data.result.username, // Username bot (tanpa @)
      displayName: data.result.first_name // Nama tampilan bot
    };
  } else {
    console.error("Gagal mengambil info bot:", data);
    return { username: "Unknown", displayName: "Unknown" };
  }
}

export async function sendLog(username, query) {
  // Konversi waktu ke GMT+7
  const options = { timeZone: "Asia/Jakarta", hour12: false };
  const now = new Date();
  const [day, month, year] = now.toLocaleDateString("id-ID", options).split("/");
  const date = `${day}-${month}-${year}`;
  const time = now.toLocaleTimeString("id-ID", options);

  // Ambil info bot
  const botInfo = await getBotInfo();

  console.log(`${date} ${time}`);
  const logMessage = `<b>📌 Log Pencarian</b>\n` +
                     `<blockquote><b>👤 User:</b> @${username}\n` +
                     `<b>📅 Tanggal:</b> ${date} ${time}\n` +
                     `<b>🔍 Kata Kunci:</b> <code>${query}</code></blockquote>\n\n` +
                     `<i>🤖  ${botInfo.displayName}</i> (@${botInfo.username})\n` // Menampilkan username dan display name bot;

  await sendMessage(LOG_CHANNEL_ID, logMessage);
}

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  };

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}