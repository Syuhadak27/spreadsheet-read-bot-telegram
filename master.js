import { config } from './config.js';


// Fungsi untuk menyimpan ke KV
async function saveToKV(data, env) {
  if (!env?.DATABASE_CACHE) {
    console.error("❌ KV Database tidak terkonfigurasi");
    return;
  }

  try {
    const cacheKey = "search_results";
    const timestampKey = "last_update"; // Simpan timestamp update

    await env.DATABASE_CACHE.put(cacheKey, JSON.stringify(data), {
      expirationTtl: 43200 // 12 jam dalam detik
    });

    // Simpan timestamp saat data diperbarui
    await env.DATABASE_CACHE.put(timestampKey, Date.now().toString(), {
      expirationTtl: 43200
    });

    console.log("✅ Data pencarian berhasil disimpan ke KV");
  } catch (error) {
    console.error("❌ Gagal menyimpan ke KV:", error);
  }
}

// Fungsi untuk membaca dari KV
async function getFromKV(env) {
  if (!env?.DATABASE_CACHE) {
    return null;
  }

  try {
    const cacheKey = "search_results";
    const data = await env.DATABASE_CACHE.get(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Gagal membaca dari KV:", error);
    return null;
  }
}

export async function searchDatabase(query, env) {
  try {
    console.log("🔍 Mencari di KV...");
    let data = await getFromKV(env);

    // Jika tidak ada di KV, ambil dari Google Sheets
    if (!Array.isArray(data) || data.length === 0) {
      console.log("⚠️ Data tidak ditemukan di KV, mengambil dari Google Sheets...");
      const sheetId = config.SPREADSHEET_ID;
      const apiKey = config.GOOGLE_API_KEY;

      try {
        data = await getCachedData(sheetId, "DATABASE!A2:E", "main", apiKey);

        // Simpan ke KV jika berhasil mengambil data
        if (Array.isArray(data) && data.length > 0) {
          await saveToKV(data, env);
          console.log("✅ Data berhasil disimpan ke KV.");
        } else {
          console.warn("⚠️ Tidak ada data yang valid dari Google Sheets.");
        }
      } catch (fetchError) {
        console.error("❌ Gagal mengambil data dari Google Sheets:", fetchError);
        return `Error: Tidak dapat mengambil data. Silakan coba lagi nanti.`;
      }
    } else {
      console.log("✅ Data ditemukan di KV.");
    }

    if (!Array.isArray(data) || data.length === 0) {
      return `Kata kunci: <code>${query}</code>\nTidak ada hasil yang ditemukan.`;
    }

    const asciiArt = `\n╔════▣⚫▣════╗\n╚════▣⚫▣════╝\n\n╔⏤⏤⏤╝👑╚⏤⏤⏤╗\n╚⏤⏤⏤╗🌺╔⏤⏤⏤╝`;
    const keywords = query.toLowerCase().split(" ").map(k => k.trim());
    
    // Pencarian dalam data
    const results = data.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (results.length === 0) {
      return `<pre><s>Kata kunci: <code>${query}</code></s></pre>\n${asciiArt}`;
    }

    const header = `📌 Kata Kunci: <code>${query}</code>`;
    const formattedResults = results.map(row =>
      `<blockquote>➤${row[0]} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]}</blockquote>`
    ).join("\n");

    const lastCacheUpdate = await getLastCacheUpdate(env);  // Mengambil timestamp dari KV
    const footer = `\n\n🕒 Cache terakhir diperbarui: <code>${lastCacheUpdate}</code>`;  // Pastikan ini menggunakan lastCacheUpdate, bukan LastCacheUpdate

    return `${header}\n\n${formattedResults}${footer}`;
  } catch (error) {
    console.error("❌ Error dalam pencarian:", error);
    return `Error: Terjadi kesalahan dalam pencarian. Silakan coba lagi nanti.`;
  }
}


async function getLastCacheUpdate(env) {
  if (!env?.DATABASE_CACHE) {
    return "Belum pernah diperbarui";
  }

  try {
    const timestamp = await env.DATABASE_CACHE.get("last_update");
    if (!timestamp) return "Belum pernah diperbarui";

    const date = new Date(parseInt(timestamp));
    return date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  } catch (error) {
    console.error("❌ Gagal mengambil timestamp cache:", error);
    return "Tidak diketahui";
  }
}

export async function resetCacheUtama(env) {
  if (!env?.DATABASE_CACHE) {
    console.error("❌ KV Database tidak terkonfigurasi");
    return "Gagal: KV tidak tersedia.";
  }

  try {
    // Hapus cache pencarian dan timestamp
    await env.DATABASE_CACHE.delete("search_results");
    await env.DATABASE_CACHE.delete("last_update");

    console.log("✅ Cache berhasil direset.");
    return "Cache berhasil direset.";
  } catch (error) {
    console.error("❌ Gagal mereset cache:", error);
    return "Gagal mereset cache.";
  }
}


async function getCachedData(sheetId, range, cacheKey, apiKey) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error("❌ Error mengambil data dari Google Sheets:", error);
    return [];
  }
}