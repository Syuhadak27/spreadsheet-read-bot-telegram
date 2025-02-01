import { config } from './config.js';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;

export async function searchInout(query) {
  const sheetId = SPREADSHEET_ID;
  const apiKey = GOOGLE_API_KEY;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/inout!A2:F?key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data dari Google Sheets");

    const json = await res.json();
    if (!json.values) return null;

    const keywords = query.toLowerCase().split(" ").map(k => k.trim());
    const results = json.values.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (results.length === 0) return null;

    return results.map(row => {
      let formattedDate = row[0];
      return `<blockquote>${formattedDate} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]} • ${row[5]}</blockquote>`;
    }).join("\n");
  } catch (error) {
    console.error(error);
    return null;
  }
}
