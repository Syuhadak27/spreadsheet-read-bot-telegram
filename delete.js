import { config } from './config.js';

const token = config.TOKEN;

export async function deleteMessage(chatId, messageId, token) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`;
  const payload = { chat_id: chatId, message_id: messageId };

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
