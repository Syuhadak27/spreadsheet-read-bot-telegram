// Daftar emoji
export const emojis = ['👻', '🚀', '🌟', '✨', '🎯', '🎨', '🎭', '🎪', '🎡', '🎢', '🌈', '☀️', '⭐', '🌙', '💫', '🍀', '🌺', '🌸', '🎵', '🎶'];
export const emojiName = ['🦌', '🐈', '🦊', '🐒', '🐉', '🦗', '🦤', '🐼', '🐬', '🦉', '🐂', '🦧'];

// Fungsi untuk mendapatkan emoji acak
export function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Fungsi untuk mendapatkan emoji nama acak
export function getRandomEmojiName() {
  return emojiName[Math.floor(Math.random() * emojiName.length)];
}
