import { config } from "./config.js";
import { asciiArt } from './help.js';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const GOOGLE_API_KEY = config.GOOGLE_API_KEY;

export async function searchList(query) {
    console.log("🔍 Mencari daftar harga di Google Sheets...");

    const sheetId = SPREADSHEET_ID;
    const apiKey = GOOGLE_API_KEY;
    const range = "list!F2:H"; 

    // Ambil data dari Google Sheets
    const jsonValues = await fetchListData(sheetId, range, apiKey);

    if (!Array.isArray(jsonValues) || jsonValues.length === 0) {
        console.warn("⚠️ Tidak ada data yang ditemukan di Google Sheets.");
        return `❌ Data tidak tersedia.`;
    }

    const keywords = query.toLowerCase().split(" ").map(k => k.trim());
    const filteredData = jsonValues.filter(row =>
        keywords.every(keyword => row.some(cell => String(cell).toLowerCase().includes(keyword)))
    );

    if (filteredData.length === 0) return `Kata kunci: <code>${query}</code>\n\n${asciiArt}`;

    const formattedResults = filteredData.map(row => {
        return `<pre>🔹${row[0]} • ${row[1]} • ${row[2]}</pre>`;
    }).join("\n");

    let response = `<b>Kata Kunci:</b> <code>${query}</code>\n\n`;
    response += formattedResults;

    return response;
}

// Fungsi mengambil data dari Google Sheets
async function fetchListData(sheetId, range, apiKey) {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error("❌ Error mengambil daftar harga dari Google Sheets:", error);
        return [];
    }
}


