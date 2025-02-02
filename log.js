import { config } from "./config.js";

const BOT_TOKEN = config.TOKEN;
const LOG_CHANNEL_ID = config.LOG_CHANNEL_ID; // ID channel log Telegram (gunakan format negatif, misal: -1001234567890)

export async function sendLog(username, query) {
  // Konversi waktu ke GMT+7
  const options = { timeZone: "Asia/Jakarta", hour12: false };
  const now = new Date();
  const [day, month, year] = now.toLocaleDateString("id-ID", options).split("/");
  const date = `${day}-${month}-${year}`;
  const time = now.toLocaleTimeString("id-ID", options);

console.log(`${date} ${time}`);
  const logMessage =// `<blockquote><b>📌 Log Pencarian</b>\n` +
                     `<blockquote><b>👤 User:</b> @${username}\n` +
                     `<b>📅 Tanggal:</b> ${date} ${time}\n` +
                     `<b>🔍 Pencarian:</b> <code>${query}</code></blockquote>`;

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