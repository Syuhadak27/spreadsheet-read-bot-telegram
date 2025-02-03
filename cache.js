const CACHE_EXPIRY = 43200; // 12 jam dalam detik
let cacheData = {
  main: { data: null, timestamp: 0, lastUpdated: null },
};

// Fungsi mengambil data dari cache atau Google Sheets
async function getCachedData(sheetId, range, cacheKey, apiKey) {
  const now = Math.floor(Date.now() / 1000);

  // Cek apakah cache masih berlaku
  if (cacheData[cacheKey]?.data && now - cacheData[cacheKey].timestamp < CACHE_EXPIRY) {
    console.log(`✅ Menggunakan cache untuk ${cacheKey}`);
    return cacheData[cacheKey].data;
  }

  // Jika cache kosong atau kadaluwarsa, ambil ulang dari Google Sheets
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data dari Google Sheets");
    const json = await res.json();

    if (!json.values) {
      console.log(`⚠️ Data dari Google Sheets kosong untuk ${cacheKey}`);
      return [];
    }

    // Simpan ke cache
    cacheData[cacheKey] = {
      data: json.values,
      timestamp: now,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };

    console.log(`🔄 Cache diperbarui untuk ${cacheKey} pada ${cacheData[cacheKey].lastUpdated}`);
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

export { getCachedData, getLastCacheUpdate };

// Fungsi reset cache
export function resetCache() {
  cacheData = { main: { data: null, timestamp: 0, lastUpdated: null } };
  console.log("♻️ Cache berhasil di-reset.");
}
export function resetCacheUtama() {
  cacheData.main = { data: null, timestamp: 0, lastUpdated: null };
  console.log("♻️ Cache utama berhasil di-reset.");
}
