// master.js

import { config } from './config.js';
import { getCachedData } from './cache.js';


export async function searchDatabase(query) {
  const sheetId = config.SPREADSHEET_ID;
  const apiKey = config.GOOGLE_API_KEY;
  const data = await getCachedData(sheetId, "DATABASE!A2:E", "main", apiKey);

  if (!data || data.length === 0) {
    return `Kata kunci: <code>${query}</code>\nTidak ada hasil yang ditemukan.`;
  }

  // Pencarian dengan kata kunci
  const keywords = query.toLowerCase().split(" ").map(k => k.trim());
  const results = data.filter(row =>
    keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
  );

  if (results.length === 0) return `Kata kunci: <code>${query}</code>\nTidak ada hasil yang ditemukan.`;

  const header = `📌 Kata Kunci: <code>${query}</code>`;
  const formattedResults = results.map(row =>
    `<blockquote>➤${row[0]} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} • ${row[4]}</blockquote>`
  ).join("\n");

  return `${header}\n\n${formattedResults}`;
}