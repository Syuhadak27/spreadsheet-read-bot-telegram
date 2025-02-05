import { searchDatabase } from './master.js';
import { searchInout } from './inout.js';
import { config } from './config.js';
import { sendLog } from './log.js';
import { deleteMessage } from './delete.js';
import { isUserMember } from './fsub.js';
import { searchStok } from './stok.js';
import { resetAllCache } from './reset.js';
import { helpText } from './help.js';

const token = config.TOKEN;
const webhookUrl = config.WEBHOOK_URL;
const channelId = config.CHANNEL_ID;
const CHANNEL_USERNAME = config.CHANNEL_USERNAME;

let globalEnv = null;

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
      const userId = update.message?.from?.id;
      const firstName = (update.message?.from?.first_name || "Unknown").replace(/@/g, "");
      const lastName = update.message?.from?.last_name ? update.message.from.last_name.replace(/@/g, "") : "";
      const username = update.message?.from?.username ? `(@${update.message.from.username})` : "N/A";
      const fullName = `${firstName} ${lastName}`.trim();
      const displayName = `${fullName} ${username}`.trim();

      if (!chatId || !text || !messageId || !userId) {
        return new Response('Invalid request', { status: 400 });
      }

      // Cek apakah user sudah join channel
      const isMember = await isUserMember(userId, token, channelId);
      if (!isMember) {
        await sendMessageWithJoinButton(chatId, '⚠️ Anda harus bergabung dengan channel terlebih dahulu untuk menggunakan bot ini.', token);
        return new Response('User not member', { status: 200 });
      }

      // Handle /start command
      if (text.startsWith('/start')) {
        await sendMessageWithButton(chatId, '✅ Bot Aktif dan Siap Digunakan!\n\nBot berjalan di serverless Cloudflare.', token);
        return new Response('Start command handled', { status: 200 });
      }

      // Handle /reset command
      if (text === '/reset') {
        await resetAllCache(env);
        await sendMessage(chatId, '♻️ Cache berhasil di-reset!', token);
        return new Response('Cache reset command handled', { status: 200 });
      }
      if (text === '/help') {
        console.log("Perintah /help diterima, mengirim response...");
        await sendMessage(chatId, helpText, token);
        return new Response('Help command handled', { status: 200 });
      }

      let responseText = "";
      if (text.startsWith('.stok')) {
        const query = text.substring(5).trim();
        responseText = query ? await searchStok(query) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else if (text.startsWith('.')) {
        const query = text.substring(1).trim();
        responseText = query ? await searchInout(query, env) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else {
        responseText = await searchDatabase(text, env);
      }

      if (!responseText) {
        responseText = `Kata kunci: ${text}\n\n${asciiArt}`;
      }

      setTimeout(() => deleteMessage(chatId, messageId, token), 4); // 6 detik

      await sendLog(displayName, text);

      if (responseText.length > 4000) {
        await splitAndSend(chatId, responseText, token);
      } else {
        await sendMessage(chatId, responseText, token);
      }

      return new Response('Request handled', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Fungsi mengirim pesan dengan tombol Join Channel
async function sendMessageWithJoinButton(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "📢 Bergabung dengan Channel", url: `https://t.me/${CHANNEL_USERNAME}` }]
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

// Fungsi mengirim pesan dengan tombol Source Code
async function sendMessageWithButton(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "📜 Source Code", url: "https://github.com/Syuhadak27/spreadsheet-read-bot-telegram/tree/cloudflare" }],
        [{ text: "👨‍💻 Owner", url: "https://t.me/AlfiSyuhadak" }, { text: "📢 Channel", url: `https://t.me/${CHANNEL_USERNAME}` }]
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

// Fungsi mengirim pesan biasa
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

// Fungsi membagi pesan jika terlalu panjang
async function splitAndSend(chatId, text, token) {
  const maxLength = 4000;
  const messages = [];

  while (text.length > maxLength) {
    let splitAt = text.lastIndexOf("</blockquote>", maxLength);
    if (splitAt === -1) splitAt = text.lastIndexOf(" ", maxLength);
    if (splitAt === -1) splitAt = maxLength;

    const part = text.substring(0, splitAt + "</blockquote>".length);
    messages.push(part);

    text = text.substring(splitAt + "</blockquote>".length).trim();
  }

  if (text.length > 0) messages.push(text);

  for (const msg of messages) {
    await sendMessage(chatId, msg, token);
  }
}

const asciiArt = `\n╔Data═▣ ❌ ▣═Tidak═╗
╚════▣ADA▣═════╝\n\n╔⏤⏤⏤╝👑╚⏤⏤⏤╗\n╚⏤⏤⏤╗🌺╔⏤⏤⏤╝`;
