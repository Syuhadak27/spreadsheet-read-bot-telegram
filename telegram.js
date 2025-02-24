import { config } from './config.js';

const token = config.TOKEN;
const CHANNEL_USERNAME = config.CHANNEL_USERNAME;

// Fungsi mengirim pesan dengan tombol Join Channel
export async function sendMessageWithJoinButton(chatId, text) {
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
export async function sendMessageWithButton(chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "📜 Source Code", url: "https://github.com/Syuhadak27/spreadsheet-read-bot-telegram" }],
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
export async function sendMessage(chatId, text) {
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
export async function splitAndSend(chatId, text) {
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
    await sendMessage(chatId, msg);
  }
}

export async function sendWaButton(chatId, phoneNumber) {
    if (!phoneNumber) return;

    const waLink = `https://wa.me/${phoneNumber}`;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
        chat_id: chatId,
        text: `Klik tombol di bawah untuk membuka WhatsApp dengan nomor <b>${phoneNumber}</b>:`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[{ text: "📞 Buka WhatsApp", url: waLink }]]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (error) {
        console.error("Error mengirim tombol:", error);
        return null;
    }
}

export async function editMessageText(chatId, messageId, text) {
  const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  
  return await response.json();
}

