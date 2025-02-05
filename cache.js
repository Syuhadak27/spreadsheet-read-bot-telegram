import { config } from './config.js';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;
const sheetId = SPREADSHEET_ID;
const apiKey = GOOGLE_API_KEY;




const CACHE_EXPIRY = 43200; // 12 jam dalam detik
let cacheData = {
  main: { data: null, timestamp: 0, lastUpdated: null },
};

// Fungsi mengambil data dari cache atau Google Sheets
async function getCachedData() {
  const now = Math.floor(Date.now() / 1000);
  const cacheKey = "main"; // Gunakan cache utama

  // Cek apakah cache masih berlaku
  if (cacheData[cacheKey]?.data && now - cacheData[cacheKey].timestamp < CACHE_EXPIRY) {
    console.log(`✅ Menggunakan cache utama`);
    return cacheData[cacheKey].data;
  }

  // Jika cache kosong atau kadaluwarsa, ambil ulang dari Google Sheets
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/DATABASE!A2:E?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data dari Google Sheets");
    const json = await res.json();

    if (!json.values) {
      console.log(`⚠️ Data dari Google Sheets kosong`);
      return [];
    }

    // Simpan ke cache utama
    cacheData[cacheKey] = {
      data: json.values,
      timestamp: now,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };

    console.log(`🔄 Cache diperbarui pada ${cacheData[cacheKey].lastUpdated}`);
    return json.values;
  } catch (error) {
    console.error(`❌ Error saat mengambil data: ${error.message}`);
    return [];
  }
}

// Fungsi untuk mendapatkan timestamp terakhir cache diperbarui
function getLastCacheUpdate() {
  return cacheData.main.lastUpdated || "Belum ada cache";
}

// Fungsi reset cache utama
export function resetCache() {
  cacheData = { main: { data: null, timestamp: 0, lastUpdated: null } };
  console.log("♻️ Cache berhasil di-reset.");
}

export { getCachedData, getLastCacheUpdate };