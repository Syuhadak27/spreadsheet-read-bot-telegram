import { config } from "./config.js";
import { asciiArt } from './help.js';


const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;

export async function searchInout(query, env) {
  console.log("🔍 Mencari data di KV...");
  const sheetId = SPREADSHEET_ID;
  const apiKey = GOOGLE_API_KEY;
  const range = "inout!A2:F";

  let jsonValues = await getCachedInout(env);

  // Jika tidak ada di KV, ambil dari Google Sheets
  if (!Array.isArray(jsonValues) || jsonValues.length === 0) {
    console.log("⚠️ Data tidak ditemukan di KV, mengambil dari Google Sheets...");
    jsonValues = await fetchInoutData(sheetId, range, apiKey);

    if (Array.isArray(jsonValues) && jsonValues.length > 0) {
      await saveToKVInout(jsonValues, env);
      console.log("✅ Data berhasil disimpan ke KV.");
    } else {
      console.warn("⚠️ Tidak ada data yang valid dari Google Sheets.");
      return `Error: Data tidak tersedia.`;
    }
  } else {
    console.log("✅ Data ditemukan di KV.");
  }

  const keywords = query.toLowerCase().split(" ").map(k => k.trim());
  const filteredData = jsonValues.filter(row =>
    keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
  );

  if (filteredData.length === 0) return `Kata kunci: <code>${query}</code>\n\n${asciiArt}`;

  let totalMasuk = 0;
  let totalKeluar = 0;
  let sumByName = {};

  const formattedResults = filteredData.map(row => {
    let formattedDate = row[0];

    let masuk = parseInt(row[3]?.replace(/\D/g, ""), 10) || 0;
    let keluar = parseInt(row[4]?.replace(/\D/g, ""), 10) || 0;
    let name = row[5]?.trim() || "Tanpa Nama";

    totalMasuk += masuk;
    totalKeluar += keluar;
    sumByName[name] = (sumByName[name] || 0) + keluar;

    return `<blockquote>${formattedDate} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} pcs • ${row[4]} pcs • ${name}</blockquote>`;
  }).join("\n");

  const totalTersisa = totalMasuk - totalKeluar;
  const sumByNameText = Object.entries(sumByName)
    .map(([name, total]) => `${name}: ${total} pcs`)
    .join(" • ");

  let response = `<b>Kata Kunci:</b> <code>${query}</code>\n`;
  response += `<pre>🟢 Masuk   -- ${totalMasuk} pcs\n🔴 Keluar  -- ${totalKeluar} pcs\n🟡 Tersisa -- ${totalTersisa} pcs</pre>`;
  
  if (sumByNameText) {
    response += `📊 Statistik Barang\n<pre>${sumByNameText}</pre>\n\n`;
  }

  response += formattedResults;

  // Tambahkan timestamp cache terakhir
  const lastUpdated = await getLastCacheUpdateInout(env);
  response += `\n\n🕒 Cache terakhir diperbarui: <code>${lastUpdated}</code>`;

  return response;
}

// Reset cache data
export async function resetInoutCache(env) {
  console.log("♻️ Mereset cache inout...");
  return await resetCacheInout(env);
}

// Ambil data dari Google Sheets
async function fetchInoutData(sheetId, range, apiKey) {
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


async function getCachedInout(env) {
  if (!env?.DATABASE_CACHE) {
    console.error("❌ KV Database tidak dikonfigurasi");
    return [];
  }

  try {
    const data = await env.DATABASE_CACHE.get("inout_cache", { type: "json" });
    return data || [];
  } catch (error) {
    console.error("❌ Gagal mengambil data dari KV:", error);
    return [];
  }
}

export async function saveToKVInout(data, env) {
  if (!env?.DATABASE_CACHE) {
    console.error("❌ KV Database tidak dikonfigurasi");
    return;
  }

  try {
    await env.DATABASE_CACHE.put("inout_cache", JSON.stringify(data), {
      expirationTtl: 43200 // 12 jam dalam detik
    });
    await env.DATABASE_CACHE.put("inout_last_update", Date.now().toString());
    console.log("✅ Data inout berhasil disimpan ke KV");
  } catch (error) {
    console.error("❌ Gagal menyimpan ke KV:", error);
  }
}

async function getLastCacheUpdateInout(env) {
  if (!env?.DATABASE_CACHE) return "Belum pernah diperbarui";

  try {
    const timestamp = await env.DATABASE_CACHE.get("inout_last_update");
    if (!timestamp) return "Belum pernah diperbarui";

    const date = new Date(parseInt(timestamp));
    return date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  } catch (error) {
    console.error("❌ Gagal mengambil timestamp cache:", error);
    return "Tidak diketahui";
  }
}

export async function resetCacheInout(env) {
  if (!env?.DATABASE_CACHE) {
    console.error("❌ KV Database tidak dikonfigurasi");
    return "Gagal: KV tidak dikonfigurasi.";
  }

  try {
    await env.DATABASE_CACHE.delete("inout_cache");
    await env.DATABASE_CACHE.delete("inout_last_update");
    console.log("✅ Cache inout berhasil dihapus.");
    return "✅ Cache inout berhasil direset.";
  } catch (error) {
    console.error("❌ Gagal menghapus cache:", error);
    return "Gagal menghapus cache.";
  }
}
