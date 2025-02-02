import { config } from './config.js';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;

export async function searchDatabase(query) {
  const sheetId = SPREADSHEET_ID;
  const apiKey = GOOGLE_API_KEY;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/DATABASE!A2:E?key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch data from Sheets");
    const json = await res.json();
    if (!json.values) return `Kata kunci: ${query}\nTidak ada hasil yang ditemukan.`;

    const keywords = query.toLowerCase().split(" ").map(k => k.trim());
    const results = json.values.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (results.length === 0) return `Kata kunci: ${query}\nTidak ada hasil yang ditemukan.`;

    const header = `CPU : 🟢🔴🟠🟡🔵 • • Kata Kunci : <code>${query}</code>`;
    const formattedResults = results.map(row =>
      `<blockquote>➤${row[0]} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]}</blockquote>`
    ).join("\n");

    return `${header}\n\n${formattedResults}`;
  } catch (error) {
    console.error(error);
    return `Kata kunci: ${query}\nTerjadi kesalahan saat mencari data.`;
  }
}
