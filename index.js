import { searchDatabase } from './master.js';
import { searchInout } from './inout.js';
import { config } from './config.js';
import { sendLog } from './log.js';
import { deleteMessage } from './delete.js';
import { isUserMember } from './fsub.js';
import { searchStok } from './stok.js';
import { resetAllCache } from './reset.js';
import { helpText } from './help.js';
import { searchList } from './list.js';
import { setWebhook, unsetWebhook } from './webhook.js';
import { sendMessage, sendMessageWithButton, sendMessageWithJoinButton, splitAndSend } from './telegram.js';

const token = config.TOKEN;
const channelId = config.CHANNEL_ID;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/setWebhook') {
      return setWebhook(env);
    }
    if (pathname === '/unsetWebhook') {
      return unsetWebhook(env);
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
        await sendMessageWithJoinButton(chatId, '⚠️ Anda harus bergabung dengan channel terlebih dahulu untuk menggunakan bot ini.');
        return new Response('User not member', { status: 200 });
      }

      // Handle /start command
      if (text.startsWith('/start')) {
        await sendMessageWithButton(chatId, '✅ Bot Aktif dan Siap Digunakan!\n\nBot berjalan di serverless Cloudflare.');
        return new Response('Start command handled', { status: 200 });
      }

      // Handle /reset command
      if (text === '/reset') {
        await resetAllCache(env);
        await sendMessage(chatId, '♻️ Cache berhasil di-reset!');
        return new Response('Cache reset command handled', { status: 200 });
      }
      if (text === '/help') {
        await sendMessage(chatId, helpText);
        return new Response('Help command handled', { status: 200 });
      }

      let responseText = "";
      if (text.startsWith('.stok')) {
        const query = text.substring(5).trim();
        responseText = query ? await searchStok(query) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else if (text.startsWith('.list')) {
        const query = text.substring(5).trim();
        responseText = query ? await searchList(query) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else if (text.startsWith('.')) {
        const query = text.substring(1).trim();
        responseText = query ? await searchInout(query, env) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else {
        responseText = await searchDatabase(text, env);
      }

      if (!responseText) {
        responseText = `Kata kunci: ${text}\n\n${asciiArt}`;
      }

      setTimeout(() => deleteMessage(chatId, messageId, token), 4); // 4 detik

      await sendLog(displayName, text);

      if (responseText.length > 4000) {
        await splitAndSend(chatId, responseText);
      } else {
        await sendMessage(chatId, responseText);
      }

      return new Response('Request handled', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  }
};