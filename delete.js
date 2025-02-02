// Fungsi untuk menghapus pesan dengan jeda tertentu
export async function deleteMessage(chatId, messageId, delaySeconds, token) {
  try {
    // Tunggu sesuai delay yang diberikan
    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));

    // URL API Telegram untuk menghapus pesan
    const url = `https://api.telegram.org/bot${token}/deleteMessage`;
    const payload = {
      chat_id: chatId,
      message_id: messageId
    };

    // Kirim permintaan DELETE ke Telegram API
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gagal menghapus pesan: ${result.description || 'Kesalahan tidak diketahui'}`);
    }

  } catch (error) {
    console.error("Error di deleteMessage:", error.message);
  }
}