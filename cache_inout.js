const CACHE_EXPIRY = 43200; // 12 jam dalam detik
let cacheInout = { data: null, timestamp: 0, lastUpdated: null };

export async function getCachedInout(sheetId, range, apiKey) {
  const now = Math.floor(Date.now() / 1000);

  if (cacheInout.data && now - cacheInout.timestamp < CACHE_EXPIRY) {
    console.log(`✅ Menggunakan cache untuk inout`);
    return cacheInout.data;
  }

  return await fetchAndCacheInout(sheetId, range, apiKey);
}

async function fetchAndCacheInout(sheetId, range, apiKey) {
  const now = Math.floor(Date.now() / 1000);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data dari Google Sheets");
    const json = await res.json();

    if (!json.values) {
      console.log("⚠️ Data dari Google Sheets kosong");
      return [];
    }

    cacheInout = {
      data: json.values,
      timestamp: now,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };

    console.log(`🔄 Cache diperbarui untuk inout pada ${cacheInout.lastUpdated}`);
    return json.values;
  } catch (error) {
    console.error(`❌ Error saat mengambil data: ${error.message}`);
    return [];
  }
}

// Fungsi untuk mereset cache
export function resetCacheInout() {
  cacheInout = { data: null, timestamp: 0, lastUpdated: null };
  console.log("♻️ Cache untuk inout telah direset");
}

// Fungsi untuk mendapatkan timestamp terakhir cache diperbarui
export function getLastCacheUpdateInout() {
  return cacheInout.lastUpdated || "Belum ada cache";
}



import { resetCacheUtama, resetCache } from "./cache.js";

export function resetAllCache() {
  resetCacheInout();
  resetCache();
  resetCacheUtama();
  console.log("♻️ Semua cache telah direset");
}
