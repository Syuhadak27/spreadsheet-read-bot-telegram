const CACHE_EXPIRY = 43200; // 12 jam dalam detik
let cacheData = {
  main: { data: null, timestamp: 0, lastUpdated: null },
};

async function getCachedData(sheetId, range, cacheKey, apiKey) {
  const now = Math.floor(Date.now() / 1000);

  // Jika cache masih berlaku, gunakan data dari cache
  if (cacheData[cacheKey].data && now - cacheData[cacheKey].timestamp < CACHE_EXPIRY) {
    console.log(`✅ Menggunakan cache untuk ${cacheKey}`);
    return cacheData[cacheKey].data;
  }

  // Jika cache kosong atau kedaluwarsa, ambil dari Google Sheets
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data dari Google Sheets");
    const json = await res.json();
    
    if (!json.values) {
      console.log("⚠️ Data dari Google Sheets kosong");
      return [];
    }

    // Simpan data ke cache dengan timestamp terbaru
    cacheData[cacheKey] = {
      data: json.values,
      timestamp: now,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), // Simpan waktu dalam format lokal
    };

    console.log(`🔄 Cache diperbarui untuk ${cacheKey} pada ${cacheData[cacheKey].lastUpdated}`);
    return json.values;
  } catch (error) {
    console.error(`❌ Error saat mengambil data: ${error.message}`);
    return [];
  }
}



// Fungsi reset cache
export function resetCacheUtama() {
  cacheData = { main: { data: null, timestamp: 0, lastUpdated: null } };
  
  // Reset cache inout dari cache_inout.js
  import("./cache_inout.js").then(({ default: cacheInout }) => {
    cacheInout.data = null;
    cacheInout.timestamp = 0;
    cacheInout.lastUpdated = null;
    console.log("♻️ Cache Inout berhasil di-reset.");
  });

  console.log("♻️ Cache utama berhasil di-reset.");
}

export { cacheData };

// Fungsi untuk mendapatkan timestamp terakhir cache diperbarui
export function getLastCacheUpdate() {
  return cacheData.main.lastUpdated || "Belum ada cache";
}

export { getCachedData };