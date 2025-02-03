import { config } from "./config.js";
import { getCachedInout, getLastCacheUpdateInout } from "./cache_inout.js";

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;

export async function searchInout(query) {
  const sheetId = SPREADSHEET_ID;
  const apiKey = GOOGLE_API_KEY;
  const range = "inout!A2:F";
  
  // Ambil data dari cache_inout.js
  const jsonValues = await getCachedInout(sheetId, range, apiKey);
  if (!jsonValues) return null;

  const keywords = query.toLowerCase().split(" ").map(k => k.trim());
  const filteredData = jsonValues.filter(row =>
    keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
  );

  if (filteredData.length === 0) return null;

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
    response += `📊 Statistik Barang\n<blockquote>${sumByNameText}</blockquote>\n\n`;
  }

  response += formattedResults;

  // Ambil waktu terakhir cache diperbarui dan letakkan di paling bawah
  const lastUpdated = getLastCacheUpdateInout();
  response += `\n\n🕒 Cache terakhir diperbarui: <code> ${lastUpdated}</code>`;

  return response;
}