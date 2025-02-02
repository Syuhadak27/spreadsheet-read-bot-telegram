import { searchDatabase } from './master.js';
import { searchInout } from './inout.js';
import { config } from './config.js';
import { sendLog } from './log.js'; // Import fungsi log
import { deleteMessage } from './delete.js';

const token = config.TOKEN;

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
      const username = update.message?.from?.username || "Unknown"; // Ambil username

      if (!chatId || !text || !messageId) {
        return new Response('Invalid request', { status: 400 });
      }

      // Tangani command /start
      if (text.startsWith('/start')) {
        await sendMessage(chatId, '✅ Bot Aktif dan Siap Digunakan!\nGunakan dengan bijak', token);
        return new Response('Start command handled', { status: 200 });
      }

      // Cek apakah pesan diawali dengan titik (.) untuk pencarian di inout
      let responseText;
      if (text.startsWith('.')) {
        responseText = await searchInout(text.substring(1).trim()); // Hilangkan titik sebelum mencari
      } else {
        responseText = await searchDatabase(text);
      }

      // Jika tidak ada hasil
      if (!responseText) {
        responseText = `Kata kunci: <code>${text}</code>\nTidak ada hasil yang ditemukan.`;
      }

      // Kirim log pencarian ke channel Telegram
      await sendLog(username, text);

      // Jika pesan lebih dari 4000 karakter, gunakan splitAndSend
      let botMessage;
      if (responseText.length > 4000) {
        botMessage = await splitAndSend(chatId, responseText, token);
      } else {
        botMessage = await sendMessage(chatId, responseText, token);
      }

      // Jika DM (chat ID positif), kirim pesan sementara sebelum dihapus
      if (chatId > 0) {
        setTimeout(async () => {
          try {
            const tempMessage = await sendMessage(chatId, "⌛ Pesan akan dihapus dalam 6 detik...", token);
            await deleteMessage(chatId, tempMessage.message_id, 6, token);
          } catch (error) {
            console.error("🚨 Error menghapus pesan sementara:", error);
          }
        }, 6000);
      } else { // Jika di grup
        setTimeout(async () => {
          await deleteMessage(chatId, messageId, 6, token); // Hapus pesan user
          if (botMessage) {
            await deleteMessage(chatId, botMessage.message_id, 6, token); // Hapus pesan bot
          }
        }, 6000);
      }

      return new Response('Success', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Fungsi untuk menghapus pesan dengan delay tertentu


// Fungsi untuk mengirim pesan ke Telegram
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

// Fungsi untuk membagi pesan panjang
async function splitAndSend(chatId, text, token) {
  const maxLength = 4000;
  const messages = [];

  while (text.length > maxLength) {
    let splitAt = text.lastIndexOf('</blockquote>', maxLength);
    if (splitAt === -1) splitAt = text.lastIndexOf(' ', maxLength);
    if (splitAt === -1) splitAt = maxLength;

    const part = text.substring(0, splitAt + '</blockquote>'.length);
    messages.push(part);

    text = text.substring(splitAt + '</blockquote>'.length).trim();
  }

  if (text.length > 0) messages.push(text);

  let lastMessage = null;
  for (const msg of messages) {
    lastMessage = await sendMessage(chatId, msg, token);
  }

  return lastMessage; // Kembalikan pesan terakhir yang dikirim
}

// Fungsi untuk mengatur webhook
async function setWebhook(env) {
  const webhookUrl = `https://cari.henot20561.workers.dev/webhook`; // Ganti dengan URL worker Anda
  const url = `https://api.telegram.org/bot${token}/setWebhook`;
  const payload = { url: webhookUrl };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Gagal set webhook:', result);
      throw new Error(`Gagal set webhook: ${result.description || 'Kesalahan tidak diketahui'}`);
    }

    return new Response(JSON.stringify(result, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error setup webhook:', error.message);
    return new Response(`Webhook setup gagal: ${error.message}`, { status: 500 });
  }
}