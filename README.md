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



## <i>requirement deploy dengan Cloudflare CLI via termux</i>
Karena cloudflare cli tidak support dengan perangkat android, kita gunakan ubuntu di termux, 

#install update repository termux dan install ubuntu
```bash
pkg update && pkg upgrade
pkg install proot-distro curl wget -y
proot-distro install ubuntu
```
#login ke ubuntu
```bash
proot-distro login ubuntu
```
Agar lebih mudah login di lain waktu kita buat file baru bernama <code>linux.sh</code> dengan cara
```bash
nano linux.sh
```
lalu masukkan text ini
```bash 
proot-distro login ubuntu
```
lalu utk menyimpan dan kuar tekan
<code>CTRL+x</code> lalu tekan <code>y</code> lalu tekan <code>enter</code>
lalu berikan ijin 
```bash
chmod 600 ./linux.sh
```

dan utk login cukup 
```bash
./linux.sh
```


##Menginstal cloudflare dan perlengkapannya

```bash
pkg update && pkg upgrade
pkg install nodejs-lts
pkg install git
npm install -g wrangler
wrangler login
```

