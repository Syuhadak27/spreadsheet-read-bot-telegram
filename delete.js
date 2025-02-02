export async function deleteMessage(chatId, messageId, token) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`;

  const payload = {
    chat_id: chatId,
    message_id: messageId
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Gagal menghapus pesan:', result);
      return false;
    }

    console.log(`✅ Pesan ${messageId} dihapus dari chat ${chatId}`);
    return true;
  } catch (error) {
    console.error('Error menghapus pesan:', error.message);
    return false;
  }
}