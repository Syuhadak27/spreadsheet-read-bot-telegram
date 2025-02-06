import { config } from './config.js';

const token = config.TOKEN;
const webhookUrl = config.WEBHOOK_URL;

export async function setWebhook() {
  const url = `https://api.telegram.org/bot${token}/setWebhook`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });

  if (response.ok) {
    console.log('✅ Webhook berhasil disetel.');
    return new Response('Webhook berhasil disetel', { status: 200 });
  } else {
    const errorData = await response.json();
    console.error('❌ Gagal menyetel webhook:', errorData);
    return new Response('Gagal menyetel webhook', { status: 500 });
  }
}

export async function unsetWebhook() {
  const url = `https://api.telegram.org/bot${token}/deleteWebhook`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    console.log('✅ Webhook berhasil dihapus.');
    return new Response('Webhook berhasil dihapus', { status: 200 });
  } else {
    const errorData = await response.json();
    console.error('❌ Gagal menghapus webhook:', errorData);
    return new Response('Gagal menghapus webhook', { status: 500 });
  }
}