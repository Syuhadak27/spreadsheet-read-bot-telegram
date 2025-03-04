# **Telegram Bot dengan Cloudflare Workers & KV Storage**  

Bot Telegram ini berjalan di **Cloudflare Workers**, menggunakan **KV Storage** (`DATABASE_CACHE`) untuk menyimpan cache, serta mendukung berbagai fitur pencarian data dan perintah otomatis.  
Bot ini hanya dapat digunakan secara **private** oleh pemiliknya.  

## **Fitur**  
- **Pencarian Stok**: Gunakan `.stok <query>` untuk mencari stok barang.  
- **Pencarian Daftar**: Gunakan `.list <query>` untuk mencari daftar tertentu.  
- **Pencarian Data**: Cukup kirimkan teks untuk mencari dalam database.  
- **Reset Cache**: `/reset` untuk memperbarui cache dari Google Sheets.  
- **Menu Interaktif**: `/menu` untuk menampilkan menu pilihan.  
- **Dukungan WhatsApp Button**: `/wa <nomor>` untuk membagikan nomor WhatsApp dalam tombol.  
- **Auto Hapus Pesan**: Pesan yang dikirim akan otomatis terhapus setelah beberapa detik.  
- **Logging**: Semua perintah dicatat di log channel.  
- **Hanya Untuk Pengguna Private**: Bot ini hanya bisa digunakan oleh pemiliknya.  

---

## **Cara Deploy di Cloudflare Workers**  

### **1. Buat Cloudflare Worker**  
1. Login ke **Cloudflare Dashboard**.  
2. Pergi ke **Workers & Pages** ’ **Create a Service** ’ **HTTP Router**.  
3. Pilih **Quick Edit** untuk menyalin dan menempelkan kode bot Anda.  

---

### **2. Setup KV Namespace**  
1. **Buka** Cloudflare Dashboard’ **Workers & Pages**.  
2. Pilih **KV** â†’ **Create Namespace**.  
3. Beri nama KV Storage: **`DATABASE_CACHE`**.  
4. **Hubungkan KV ke Worker**:  
   - Masuk ke **Workers & Pages** ’ Pilih Worker Anda.  
   - Klik **Variables** ’ **Add Binding**.  
   - Nama: `DATABASE_CACHE`  
   - Namespace: Pilih `DATABASE_CACHE`.  

---

### **3. Deploy Worker dengan Wrangler**  
1. **Install Wrangler CLI** (jika belum):  
   ```sh
   npm install -g wrangler
   ```  
2. **Login ke Cloudflare**:  
   ```sh
   wrangler login
   ```  
3. **Inisialisasi proyek**:  
   ```sh
   wrangler init bot-telegram-cloudflare
   ```  
4. **Edit `wrangler.jsonc`**, tambahkan:  
   ```toml
   name = "bot-telegram"
   main = "index.js"
   compatibility_date = "2024-03-04"

   [[kv_namespaces]]
   binding = "DATABASE_CACHE"
   id = "<KV_NAMESPACE_ID>"
   ```  
   Ganti `<KV_NAMESPACE_ID>` dengan ID dari `DATABASE_CACHE` yang telah Anda buat.  
5. **Deploy ke Cloudflare**:  
   ```sh
   wrangler deploy
   ```  

---

### **4. Set Webhook Bot Telegram**  
1. Ambil token bot dari **@BotFather**.  
2. Set webhook dengan perintah berikut (gantilah `TOKEN_BOT` dengan token bot Anda):  
   ```sh
   curl -F "url=https://bot-telegram.<username>.workers.dev/webhook" https://api.telegram.org/bot<TOKEN_BOT>/setWebhook
   ```  
3. **Hapus webhook** jika perlu:  
   ```sh
   curl -F "url=" https://api.telegram.org/bot<TOKEN_BOT>/setWebhook
   ```  
