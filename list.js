import { config } from './config.js';
import { asciiArt } from './help.js';

const cacheList = {};
const cacheDuration = 12 * 60 * 60 * 1000; // 12 jam dalam milidetik
let timestampList = 0;

export async function searchList(query) {
  try {
    console.log("🔍 Mencari dalam cache atau mengambil dari Google Sheets...");

    const sheetId = config.SPREADSHEET_ID;
    const apiKey = config.GOOGLE_API_KEY;

    // Periksa apakah cache masih valid
    const now = Date.now();
    if (cacheList.data && now - timestampList < cacheDuration) {
      console.log("✅ Menggunakan data dari cache.");
    } else {
      console.log("🔄 Cache kedaluwarsa, mengambil data baru dari Google Sheets...");
      try {
        const data = await getDataFromSheets(sheetId, "list!F2:H", apiKey);
        if (!Array.isArray(data) || data.length === 0) {
          return `Kata kunci: <code>${query}</code>\nTidak ada hasil yang ditemukan.`;
        }
        cacheList.data = data;
        timestampList = now; // Perbarui timestamp cache
      } catch (fetchError) {
        console.error("❌ Gagal mengambil data dari Google Sheets:", fetchError);
        return `Error: Tidak dapat mengambil data. Silakan coba lagi nanti.`;
      }
    }

    // Pencarian dalam cache
    const keywords = query.toLowerCase().split(" ").map(k => k.trim());
    const results = cacheList.data.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (results.length === 0) {
      return `<u>Kata kunci: </u><code>${query}</code>\n${asciiArt}`;
    }

    const header = `📌 Kata Kunci: <code>${query}</code>`;
    const formattedResults = results.map(row =>
      `<blockquote>${row[0]} • ${row[1]} • ${row[2]} </blockquote>`
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

// Fungsi untuk mereset cache
export function resetListCache() {
  console.log("🔄 List Cache di-reset!");
  cacheList.data = null;
  timestampList = 0;
}