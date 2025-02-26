import { searchDatabase, getLastCacheUpdate } from './master.js';
import { searchInout } from './inout.js';
import { config } from './config.js';
import { sendLog } from './log.js';
import { deleteMessage } from './delete.js';
import { isUserMember } from './fsub.js';
import { searchStok } from './stok.js';
import { resetAllCache } from './reset.js';
import { helpText, asciiArt, startMsg } from './help.js';
import { searchList } from './list.js';
import { setWebhook, unsetWebhook } from './webhook.js';
import { sendMessage, sendMessageWithButton, sendMessageWithJoinButton, splitAndSend, sendWaButton, editMessageText, sendChatAction, sendSticker } from './telegram.js';

const token = config.TOKEN;
const channelId = config.CHANNEL_ID;
const CHAT_ACTION = false; // Bisa diubah ke false jika ingin menonaktifkan efek mengetik

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

      if (!chatId || !messageId || !userId) {
        return new Response('Invalid request', { status: 400 });
      }

      // Tangani pesan media
      if (update.message?.sticker || update.message?.photo || update.message?.video || update.message?.document || update.message?.audio || update.message?.voice) {
        await sendMessage(chatId, "⚠️ Bot hanya dapat memproses perintah berbentuk teks.");
        return new Response('Media message received, but not supported', { status: 200 });
      }

      // Cek apakah user sudah join channel
      const isMember = await isUserMember(userId, token, channelId);
      if (!isMember) {
        await sendMessageWithJoinButton(chatId, '⚠️ Anda harus bergabung dengan channel terlebih dahulu untuk menggunakan bot ini.');
        return new Response('User not member', { status: 200 });
      }

      // Handle /start command
      if (text.startsWith('/start')) {
        await sendMessageWithButton(chatId, `Heeyyy ${fullName} ${username}${startMsg}`);
        return new Response('Start command handled', { status: 200 });
      }

      // Handle /reset command
      if (text === '/reset') {
        const initialMessage = await sendMessage(chatId, '⚙️<i>Mereset cache.....</i>');
        const messageId = initialMessage.result.message_id;
        await resetAllCache(env);
        const CacheLatest = await getLastCacheUpdate(env);
        await editMessageText(chatId, messageId, `♻️ Cache berhasil di-reset dan database berhasil di update ke versi <i>v${CacheLatest}</i>\nBy ${fullName} ${username}`);
        return new Response('Cache reset command handled', { status: 200 });
      }

      if (text === '/help') {
        await sendChatAction(chatId, 'typing');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Tunggu 3 detik
        await sendMessage(chatId, helpText);
        return new Response('Help command handled', { status: 200 });
      }
      
      let responseText = "";
      if (CHAT_ACTION) {
        await sendChatAction(chatId, 'typing');
      }
        
      if (text.startsWith('.stok') || text.startsWith('/stok')) {
        const query = text.substring(5).trim();
        responseText = query ? await searchStok(query) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else if (text.startsWith('.list') || text.startsWith('/list')) {
        const query = text.substring(5).trim();
        responseText = query ? await searchList(query) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else if (text.startsWith('/wa')) {
        let query = text.substring(3).trim();
        if (!query) {
          responseText = "⚠️ Harap masukkan nomor setelah /wa, contoh: /wa 0821234567890 atau /wa +6281234567890";
        } else {
          if (query.startsWith('0')) {
            query = query.replace(/^0+/, '62');
          } else if (query.startsWith('+')) {
            query = query.replace(/^\+/, '');
          }
          await sendWaButton(chatId, query);
          return new Response('WA button sent', { status: 200 });
        }
      } else if (text.startsWith('.')) {
        const query = text.substring(1).trim();
        responseText = query ? await searchInout(query, env, { chatId, token }) : "⚠️ Tidak bisa tanpa kata kunci.";
      } else {
        responseText = await searchDatabase(text, env, { fullName, username, chatId, token });
      }      

      if (responseText.length > 4096) {
        await splitAndSend(chatId, responseText);
      } else {
        await sendMessage(chatId, responseText);
      }
      
      setTimeout(() => deleteMessage(chatId, messageId, token), 3);
      await sendLog(displayName, text);

      return new Response('Request handled', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  }
};