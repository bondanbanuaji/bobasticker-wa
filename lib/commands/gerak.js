const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { processVideoToSticker } = require("../videoProcessor");

/**
 * Helper: jeda (delay) dalam milidetik
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function gerakHandler(sock, msg) {
  const jid = msg.key.remoteJid;
  const messageContent = msg.message;
  let isVideo = false;
  let targetMessage = msg;

  // Cek apakah direct video message atau GIF
  if (messageContent.videoMessage) {
    isVideo = true;
  }
  // Cek apakah quoted video message
  else if (
    messageContent.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
  ) {
    isVideo = true;
    targetMessage = {
      message: messageContent.extendedTextMessage.contextInfo.quotedMessage
    };
  }
  // Cek apakah document yang merupakan video/gif
  else if (messageContent.documentMessage && 
    (messageContent.documentMessage.mimetype.includes('video') || messageContent.documentMessage.mimetype.includes('gif'))) {
    isVideo = true;
  }
  // Cek apakah quoted document yang merupakan video/gif
  else if (messageContent.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage && 
    (messageContent.extendedTextMessage.contextInfo.quotedMessage.documentMessage.mimetype.includes('video') || 
     messageContent.extendedTextMessage.contextInfo.quotedMessage.documentMessage.mimetype.includes('gif'))) {
    isVideo = true;
    targetMessage = {
      message: messageContent.extendedTextMessage.contextInfo.quotedMessage
    };
  }
  
  // Kalau tidak ada video/gif sama sekali
  if (!isVideo) {
    await sock.sendMessage(
      jid,
      { text: "kirim atau quote video/gif dulu ya! 🎬\n\nBisa juga lewat caption video atau reply videonya." },
      { quoted: msg }
    );
    return;
  }

  // Cek durasi & size (dari videoMessage atau documentMessage)
  const mediaMsg = targetMessage.message.videoMessage || targetMessage.message.documentMessage;
  const duration = mediaMsg?.seconds || 0;
  const fileSize = mediaMsg?.fileLength || 0;

  // Jika ini videoMessage, cek durasi. DocumentMessage mungkin tidak ada 'seconds'
  if (targetMessage.message.videoMessage && duration > 10) {
    await sock.sendMessage(
      jid,
      { text: "videonya kepanjangan brow, maksimal 10 detik aja ya! ⏳" },
      { quoted: msg }
    );
    return;
  }

  // Limit 5MB (5 * 1024 * 1024)
  if (fileSize > 5242880) {
    await sock.sendMessage(
      jid,
      { text: "filenya kegedean brow, maksimal 5MB aja ya! 🛑" },
      { quoted: msg }
    );
    return;
  }

  try {
    // 1. React ⏳ ke pesan user
    await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

    // 2. Pesan teks pertama
    await sock.sendMessage(jid, { text: "sabar ya, lagi aing sulap jadi stiker gerak... 🪄" }, { quoted: msg });

    // 3. Download media
    let buffer;
    try {
      buffer = await downloadMediaMessage(
        targetMessage,
        "buffer",
        {},
        {
          logger: { info: () => {}, error: () => {}, debug: () => {}, warn: () => {} },
          reuploadRequest: sock.updateMediaMessage
        }
      );
    } catch (downloadError) {
      console.error("[gerakHandler] Download Error:", downloadError);
      return await sock.sendMessage(
        jid,
        { text: "⚠️ Gagal mendownload video. Koneksi internet di bot mungkin sedang tidak stabil atau videonya terlalu besar. Coba lagi ya! 📲" },
        { quoted: msg }
      );
    }

    // 4. Proses ke stiker WebP Gerak
    const stickerBuffer = await processVideoToSticker(buffer);

    // 5. Kirim stikernya
    const sentSticker = await sock.sendMessage(
      jid,
      { sticker: stickerBuffer },
      { quoted: msg }
    );

    // 6. React ✅ ke pesan stiker
    if (sentSticker?.key) {
      await sock.sendMessage(jid, { react: { text: "✅", key: sentSticker.key } });
    }

    // 7. Jeda 500ms lalu kirim pesan penutup
    await sleep(500);
    await sock.sendMessage(
      jid,
      { text: "stiker geraknya udah jadi! 🔥" },
      { quoted: msg }
    );

  } catch (error) {
    console.error("[gerakHandler] Error:", error);
    
    let errorMessage = "Waduh, gagal bikin stiker geraknya nih. Mungkin filenya kegedean atau formatnya gak cocok. 🥲";
    
    if (error.message.includes("FFmpeg tidak ditemukan")) {
      errorMessage = "❌ FFmpeg belum terinstal di sistem/Termux. Silakan instal dulu dengan perintah:\n\n*pkg install ffmpeg*";
    }

    await sock.sendMessage(
      jid,
      { text: errorMessage },
      { quoted: msg }
    );
  }
}

module.exports = gerakHandler;
