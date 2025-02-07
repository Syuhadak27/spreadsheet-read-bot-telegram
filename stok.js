import { config } from './config.js';
import { asciiArt } from './help.js';

const cacheStok = {};
const cacheDuration = 12 * 60 * 60 * 1000; // 12 jam dalam milidetik
let timestampStok = 0;

export async function searchStok(query) {
  try {
    console.log("🔍 Mencari dalam cache atau mengambil dari Google Sheets...");

    const sheetId = config.SPREADSHEET_ID;
    const apiKey = config.GOOGLE_API_KEY;

    // Periksa apakah cache masih valid
    const now = Date.now();
    if (cacheStok.data && now - timestampStok < cacheDuration) {
      console.log("✅ Menggunakan data dari cache.");
    } else {
      console.log("🔄 Cache kedaluwarsa, mengambil data baru dari Google Sheets...");
      try {
        const data = await getDataFromSheets(sheetId, "stok!B2:E", apiKey);
        if (!Array.isArray(data) || data.length === 0) {
          return `Kata kunci: <code>${query}</code>\nTidak ada hasil yang ditemukan.`;
        }
        cacheStok.data = data;
        timestampStok = now; // Perbarui timestamp cache
      } catch (fetchError) {
        console.error("❌ Gagal mengambil data dari Google Sheets:", fetchError);
        return `Error: Tidak dapat mengambil data. Silakan coba lagi nanti.`;
      }
    }

    // Pencarian dalam cache
    const keywords = query.toLowerCase().split(" ").map(k => k.trim());
    const results = cacheStok.data.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (results.length === 0) {
      return `<u>Kata kunci: </u><code>${query}</code>\n${asciiArt}`;
    }

    const header = `📌 Kata Kunci: <code>${query}</code>`;
    const formattedResults = results.map(row =>
      `<blockquote>${row[0]} • ${row[1]} • ${row[2]} • ${row[3]}</blockquote>`
    ).join("\n");

    return `${header}\n\n${formattedResults}`;
  } catch (error) {
    console.error("❌ Error dalam pencarian:", error);
    return `Error: Terjadi kesalahan dalam pencarian. Silakan coba lagi nanti.`;
  }
}

// Fungsi untuk mengambil data dari Google Sheets
async function getDataFromSheets(sheetId, range, apiKey) {
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

// Fungsi untuk mereset cache stok
export function resetCacheStok() {
  console.log("🔄 Cache stok di-reset!");
  cacheStok.data = null;
  timestampStok = 0;
}