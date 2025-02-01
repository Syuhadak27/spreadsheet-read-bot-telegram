// Fungsi untuk menghapus pesan di Telegram
export async function deleteMessage(chatId, messageId, token) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`;
  const payload = {
    chat_id: chatId,
    message_id: messageId,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('Error deleting message:', result);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
  }
}