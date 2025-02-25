// Daftar emoji
export const emojis = ['👻', '🚀', '🌟', '✨', '🎯', '🎨', '🎭', '🎪', '🎡', '🎢', '🌈', '☀️', '⭐', '🌙', '💫', '🍀', '🌺', '🌸', '🎵', '🎶'];
export const emojiName = ['🦌', '🐈', '🦊', '🐒', '🐉', '🦗', '🐼', '🐬', '🦉', '🐂', '🦧'];

// Fungsi untuk mendapatkan emoji acak
export function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Fungsi untuk mendapatkan emoji nama acak
export function getRandomEmojiName() {
  return emojiName[Math.floor(Math.random() * emojiName.length)];
}

const stickers = [
  "CAACAgIAAxkBAAEN5oBnvkHfmOQc8O6jfp1jGVnS7CRbswACBhMAArYLQUijIGmVNO9nEDYE", //gif
  "CAACAgIAAxkBAAEN5oVnvkIk2OjTl1732c5Hp690-h08_QACuRUAAuwxSEhB4EnB1y3yWjYE", //gif
  "CAACAgIAAxkBAAEN5otnvkJCRJkx8C3Jc72QiVj7h1Yk4gAC8RIAAopkSEiSb7L4u_gVZTYE", //gif
  "CAACAgUAAxkBAAEN5qVnvkJ9U9iWXfFu8QyWxjEAAblF0xgAAtcKAAK4F4lXMXoVScoI9Rc2BA", //skill issue
  "CAACAgUAAxkBAAEN5qlnvkLVy1M41eeI0q2F5Wnd8ysD2QACqQcAAoHwuVe15jg81JjPUzYE", //gif
  "CAACAgUAAxkBAAEN5V1nvZ3PosimXxlLijHQPqZHuwccRwACjwIAAiR5shEtc_TZ_2WcNzYE", //cwe
  "CAACAgUAAxkBAAEN5V9nvZ38Kam0u097aBFgXGE2P-nHpQACpgIAAiR5shGgUMm4M74GkDYE", //cwe
  "CAACAgUAAxkBAAEN5q9nvkRYYI4U-qIQ5wwGlq2nl8MbnAACnQIAAiR5shFT-uXH_OfrATYE", //cwe
  "CAACAgUAAxkBAAEN5rFnvkR9h9aKqTyDaKSkk0Agu9rxOAACqQIAAiR5shFH0OGTjeBwfTYE", //cwe
  "CAACAgUAAxkBAAEN5VlnvZ3GnZ_bTSSo2jEaCD58ic1bfwACnAIAAiR5shGeO9MiU-MscDYE" //cwe
  // Tambahkan lebih banyak file_id stiker di sini
];

// Fungsi untuk memilih stiker secara acak
export function getRandomSticker() {
  return stickers[Math.floor(Math.random() * stickers.length)];
  
}