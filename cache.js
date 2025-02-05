import { config } from "./config.js";

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;
const sheetId = SPREADSHEET_ID;
const apiKey = GOOGLE_API_KEY;

const CACHE_EXPIRY = 43200; // 12 jam dalam detik
const CACHE_KEY = "main"; // Key utama untuk cache di env.DATABASE_CACHE

// Fungsi memuat cache dari KV Database
async function loadCache(env) {
  try {
    const savedCache = await env.DATABASE_CACHE.get("cache_key", { type: "json" });
    if (savedCache) {
      console.log("✅ Cache berhasil dimuat dari KV Database.");
      return savedCache;
    }
  } catch (error) {
    console.error("❌ Gagal memuat cache dari KV:", error);
  }
  return { data: null, timestamp: 0, lastUpdated: null };
}

// Fungsi menyimpan cache ke KV Database
async function saveCache(cacheData, env) {
  console.log("Debug env:", {
    hasEnv: !!env,
    hasDatabase: !!env?.DATABASE_CACHE,
    databaseKeys: env ? Object.keys(env) : []
  });
  const cacheKey = "main";
  
  // Tambahkan validasi env dan DATABASE_CACHE
  if (!env || !env.DATABASE_CACHE) {
    console.error("❌ KV Database tidak terkonfigurasi");
    return;
  }

  const cacheValue = JSON.stringify(cacheData);

  // Periksa ukuran data
  if (new TextEncoder().encode(cacheValue).length > 25 * 1024 * 1024) {
    console.error("❌ Data terlalu besar untuk disimpan ke KV Database.");
    return;
  }

  try {
    await env.DATABASE_CACHE.put(cacheKey, cacheValue, { expirationTtl: 43200 });
    console.log("✅ Cache berhasil disimpan ke KV Database.");
  } catch (error) {
    console.error("❌ Gagal menyimpan cache ke KV:", error);

    if (error.message.includes("timeout")) {
      console.error("⏳ Timeout saat mencoba menyimpan data ke KV.");
    } else if (error.message.includes("permission")) {
      console.error("🔒 Izin tidak cukup untuk menyimpan data ke KV.");
    } else {
      console.error("🚨 Error tidak diketahui:", error);
    }
  }
}

// Panggil `loadCache()` saat aplikasi pertama kali dijalankan
let cacheData = await loadCache();

// Fungsi mengambil data dari cache atau Google Sheets
async function getCachedData() {
  const now = Math.floor(Date.now() / 1000);

  // Cek apakah cache masih berlaku
  if (cacheData?.data && now - cacheData.timestamp < CACHE_EXPIRY) {
    console.log(`✅ Menggunakan cache dari KV Database.`);
    return cacheData.data;
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
    cacheData = {
      data: json.values,
      timestamp: now,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };

    await saveCache(cacheData); // Simpan ke KV Database
    console.log(`🔄 Cache diperbarui pada ${cacheData.lastUpdated}`);
    return json.values;
  } catch (error) {
    console.error(`❌ Error saat mengambil data: ${error.message}`);
    return [];
  }
}

// Fungsi untuk mendapatkan timestamp terakhir cache diperbarui
function getLastCacheUpdate() {
  return cacheData?.lastUpdated || "Belum ada cache";
}

// Fungsi reset cache utama
export async function resetCache(env) {
  await env.DATABASE_CACHE.delete("cache_key");
  console.log("♻️ Cache berhasil di-reset.");
}

export { getCachedData, getLastCacheUpdate, saveCache, loadCache };