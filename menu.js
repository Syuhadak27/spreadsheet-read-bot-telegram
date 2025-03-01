// menu.js

import { sendMessage } from './telegram.js';
import { config } from './config.js';
const token = config.TOKEN;
const OWNER_ID = 1980888203;

// Fungsi untuk mengirim pesan dengan tombol menu
async function sendMessageWithMenuButton(chatId, text, keyboard) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending message with button:', error);
    return null;
  }
}

export async function handleMenu(chatId, userId, env) {
  // Cek apakah user adalah owner
  if (userId !== OWNER_ID) {
    return;
  }

  // Buat keyboard markup untuk menu
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅Enable", callback_data: "chat_action_true" },
        { text: "❌Disable", callback_data: "chat_action_false" }
      ],
      [
        { text: "❌Close", callback_data: "close_menu" }
      ]
    ]
  };

  const menuText = "🛠 <b>CHAT ACTION SETTINGS</b>\n\n" +
                  "Status saat ini <code>" + (await getChatActionStatus(env) ? "✅Enabled" : "❌Disabled") + "</code>\n\n" +
                  "Memberikan efek <i>sedang mengetik...</i>";

  await sendMessageWithMenuButton(chatId, menuText, keyboard);
}

export async function handleCallback(callbackQuery, env) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  // Cek apakah user adalah owner
  if (userId !== OWNER_ID) {
    return;
  }

  let responseText = "";

  switch (data) {
    case 'chat_action_true':
      await env.DATABASE_CACHE.put('CHAT_ACTION', 'true');
      responseText = "✅ Chat Action has been <b>enabled</b>";
      break;
    case 'chat_action_false':
      await env.DATABASE_CACHE.put('CHAT_ACTION', 'false');
      responseText = "❌ Chat Action has been <b>disabled</b>";
      break;
    case 'check_status':
      const status = await getChatActionStatus(env);
      responseText = `Current Chat Action Status: <code>${status ? "✅Enabled" : "❌Disabled"}</code>`;
      break;
    case 'close_menu':
      //responseText = "Menu closed";
      break;
  }

  // Update menu message with new status
  if (data !== 'close_menu') {
    const updatedKeyboard = {
      inline_keyboard: [
        [
          { text: "✅Enable", callback_data: "chat_action_true" },
          { text: "❌Disable", callback_data: "chat_action_false" }
        ],
        [
          { text: "❌Close", callback_data: "close_menu" }
        ]
      ]
    };

    const updatedText = "🛠 <b>CHAT ACTION SETTINGS</b>\n\n" +
                       "Status saat ini: <code>" + (await getChatActionStatus(env) ? "✅Enabled" : "❌Disabled") + "</code>\n\n" +
                       "Mengaktifkan chat action seperti <i>mengetik.....</i>";

    await editMessageText(chatId, messageId, updatedText, updatedKeyboard);
  } else {
    await sendMessage(chatId, responseText);
    // Delete the menu message
    await deleteMessage(chatId, messageId);
  }
}

// Fungsi untuk mendapatkan status CHAT_ACTION
export async function getChatActionStatus(env) {
  const status = await env.DATABASE_CACHE.get('CHAT_ACTION');
  return status === 'true';
}

// Fungsi untuk edit message
async function editMessageText(chatId, messageId, text, keyboard) {
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error('Error editing message:', error);
    return null;
  }
}

// Fungsi untuk delete message
async function deleteMessage(chatId, messageId) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`;
  const payload = {
    chat_id: chatId,
    message_id: messageId
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting message:', error);
    return null;
  }
}