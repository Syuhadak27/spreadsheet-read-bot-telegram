import { searchDatabase } from './master.js';
import { searchInout } from './inout.js';
import { resetAllCache } from './cache_inout.js';
import { config } from './config.js';
import { sendLog } from './log.js';
import { deleteMessage } from './delete.js';
import { isUserMember } from './fsub.js';
const resetCache = resetAllCache;
const token = config.TOKEN;
const webhookUrl = config.WEBHOOK_URL;
const channelId = config.CHANNEL_ID; 
const CHANNEL_USERNAME = config.CHANNEL_USERNAME;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/setWebhook') {
      return setWebhook(env);
    }

    if (pathname === '/webhook') {
      const update = await request.json();
      const chatId = update.message?.chat?.id;
      const text = update.message?.text;
      const messageId = update.message?.message_id;
      const userId = update.message?.from?.id; // ambil user id
      const username = update.message?.from?.username || update.message?.from?.first_name || "Unknown";

      if (!chatId || !text || !messageId || !userId) {
        return new Response('Invalid request', { status: 400 });
      }

      // Pengecekan keanggotaan channel
      const isMember = await isUserMember(userId, token, channelId);
      if (!isMember) {
        // Kirim pesan dengan tombol Join Channel
        await sendMessageWithJoinButton(chatId, '⚠️ Anda harus bergabung dengan channel terlebih dahulu untuk menggunakan bot ini. Silahkan bergabung dengan channel:', token);
        return new Response('User not member', { status: 200 });
      }

      // Handle /start command with Source Code button
      if (text.startsWith('/start')) {
        await sendMessageWithButton(chatId, '✅ Bot Aktif dan Siap Digunakan!\nBot berjalan di serverless Cloudflare.\nBot ini menggunakan cache selama 12jam agar lebih responsif 🥱🥱🥱', token);
        return new Response('Start command handled', { status: 200 });
      }

      // Handle /reset command to reset cache
      if (text === '/reset') {
        resetCache();
        await sendMessage(chatId, '♻️ Seluruh cache berhasil di-reset!', token);
        return new Response('Cache reset command handled', { status: 200 });
      }

      let responseText;
      if (text.startsWith('.')) {
        const query = text.substring(1).trim();
        responseText = query ? await searchInout(query) : "Tidak bisa tanpa kata kunci";
      } else {
        responseText = await searchDatabase(text);
      }

      if (!responseText) {
        responseText = `Kata kunci: ${text}\nTidak ada hasil yang ditemukan.`;
      }

      setTimeout(async () => {
        await deleteMessage(chatId, messageId, token);
      }, 10); // Menghapus pesan setelah 6 detik

      // Log user query
      await sendLog(username, text);

      let botMessage;
      if (responseText.length > 4000) {
        botMessage = await splitAndSend(chatId, responseText, token);
      } else {
        botMessage = await sendMessage(chatId, responseText, token);
      }

      return new Response('Request handled', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Function to send a message with Source Code button and Channel join button
async function sendMessageWithJoinButton(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "📢 Bergabung dengan Channel", url: `https://t.me/${CHANNEL_USERNAME}` }
        ]
      ]
    })
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.ok ? await response.json() : null;
}

// Function to send a message with Source Code button and Channel join button for members
async function sendMessageWithButton(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "📜 Source Code", url: "https://github.com/Syuhadak27/spreadsheet-read-bot-telegram/tree/cloudflare" }
        ],
        [
          { text: "👨‍💻 Owner", url: "https://t.me/AlfiSyuhadak" },
          { text: "📢 Channel", url: `https://t.me/${CHANNEL_USERNAME}` }
        ]
      ]
    })
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.ok ? await response.json() : null;
}

// Function to send a regular message
async function sendMessage(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.ok ? await response.json() : null;
}
