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
    const filteredData = json.values.filter(row =>
      keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (filteredData.length === 0) return null;

    let totalMasuk = 0;
    let totalKeluar = 0;
    let sumByName = {};

    // Proses hasil pencarian
    const formattedResults = filteredData.map(row => {
      let formattedDate = row[0];

      // Ekstrak angka dari kolom 4 (Masuk) dan kolom 5 (Keluar)
      let masuk = parseInt(row[3]?.replace(/\D/g, ""), 10) || 0;
      let keluar = parseInt(row[4]?.replace(/\D/g, ""), 10) || 0;
      let name = row[5]?.trim() || "Tanpa Nama"; // Kolom 6 (Nama)

      // Tambahkan ke total
      totalMasuk += masuk;
      totalKeluar += keluar;

      // SUMIF berdasarkan nama
      sumByName[name] = (sumByName[name] || 0) + keluar;

      //return `<blockquote>${formattedDate} • <code>${row[1]}</code> • ${row[2]} • ${masuk} pcs • ${keluar} pcs • ${name}</blockquote>`;
      return `<blockquote>${formattedDate} • <code>${row[1]}</code> • ${row[2]} • ${row[3]} pcs • ${row[4]} pcs • ${name}</blockquote>`;
    }).join("\n");

    // Hitung sisa stok
    const totalTersisa = totalMasuk - totalKeluar;

    // Buat format SUMIF berdasarkan nama
    const sumByNameText = Object.entries(sumByName)
      .map(([name, total]) => `${name}: ${total} pcs`)
      .join(" • ");

    // Buat header dengan total masuk, keluar, dan sisa
    let response = `<pre>Kata Kunci: <code>${query}</code></pre>\n`;
    response += `<pre>🟢 Masuk -- ${totalMasuk} pcs\n🔴 Keluar -- ${totalKeluar} pcs\n🟡 Tersisa -- ${totalTersisa} pcs</pre>`;
    
    if (sumByNameText) {
      response += `📊 Statistik Barang\n<blockquote>${sumByNameText}</blockquote>\n\n`;
    }

    return response + formattedResults;
  } catch (error) {
    console.error(error);
    return null;
  }
}