## clone repo
```bash
git clone https://github.com/Syuhadak27/spreadsheet-read-bot-telegram.git
```

Rename <code>config-sampel.js</code>    ke <code>config.js</code>

## Requirements

••• <code>TOKEN</code> : token bot dari BotFather

••• <code>LOG_CHANNEL_ID</code> : channel utk log penggunaan bot, di awali dg <code>-100xxxxxx</code>

••• <code>GOOGLE_API_KEY</code> : dari google cloud console, aktifkan library <code>Google Sheet API</code> - <code>create credentials </code> - pilih <code>Api KEY</code>

••• <code>WEBHOOK_URL</code> : url hasil deploy

••• <code>CHANNEL_USERNAME</code> : username channel tanpa @

••• <code>SPREADSHEET_ID</code> :  id spreadsheet

••• didalam spreadsheet wajib ada sheet <code>database</code> , <code>inout</code> , <code>list</code> , <code>stok</code>

••• Untuk mendaftarkan bot ke webhook gunakan endpoint via web browser dengan cara mengunjungi link dari cloudflare seperti ini <code>https://nama.subdomainDariCloudWorker.workers.dev/setWebhook</code>

## configurasi KV DATABASE

Buat KV di dasbord cloudflare
Masuk ke dasbord - Storage & Database -- KV -- create database dg nama <code>DATABASE_CACHE</code> lalu copy id nya dan tempelkan disini

Lalu edit dit file <code>wrangler.json</code> yg ada di <code>folder root proyek</code> dan tambahkan ini di bawah nya.

```bash 
"kv_namespaces": [
    {
      "binding": "DATABASE_CACHE",
      "id": "ID KV DATABASE"
    }
  ]
}
```

## UI 

chatAction yg di didikung <i>index.js line 80+</i>

<code>typing</code>: Bot sedang mengetik.

<code>upload_photo</code>: Bot sedang mengunggah foto.

<code>upload_video</code>: Bot sedang mengunggah video.

<code>upload_document</code>: Bot sedang mengunggah dokumen.

<code>find_location</code>: Bot sedang mencari lokasi.

<code>record_video</code>: Bot sedang merekam video.

<code>upload_video_note</code>: Bot sedang mengunggah video note.