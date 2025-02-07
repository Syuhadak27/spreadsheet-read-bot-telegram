import { config } from './config.js';
import { asciiArt } from './help.js';

export async function searchStok(query) {
  try {
    console.log("🔍 Mengambil data dari Google Sheets...");

    const sheetId = config.SPREADSHEET_ID;
    const apiKey = config.GOOGLE_API_KEY;

    // Ambil data dari Google Sheets
    let data;
    try {
      data = await getDataFromSheets(sheetId, "stok!b2:e", apiKey);
    } catch (fetchError) {
      console.error("❌ Gagal mengambil data dari Google Sheets:", fetchError);
      return `Error: Tidak dapat mengambil data. Silakan coba lagi nanti.`;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return `Kata kunci: <code>${query}</code>\nTidak ada hasil yang ditemukan.`;
    }

    const keywords = query.toLowerCase().split(" ").map(k => k.trim());

    // Pencarian dalam data
    const results = data.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (results.length === 0) {
      return `<u>Kata kunci: </u><code> ${query}</code>\n${asciiArt}`;
    }

    const header = `📌 Kata Kunci: <code>${query}</code>`;
    const formattedResults = results.map(row =>
      `<blockquote>${row[0]} • ${row[1]} • ${row[2]} • ${row[3]} </blockquote>`
    ).join("\n");

    return `${header}\n\n${formattedResults}`;
  } catch (error) {
    console.error("❌ Error dalam pencarian:", error);
    return `Error: Terjadi kesalahan dalam pencarian. Silakan coba lagi nanti.`;
  }
}

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