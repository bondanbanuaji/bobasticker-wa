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

  // Cek apakah direct video message
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
  
  // Kalau tidak ada video/gif sama sekali
  if (!isVideo) {
    await sock.sendMessage(
      jid,
      { text: "kirim atau quote video/gif dulu ya! 🎬" },
      { quoted: msg }
    );
    return;
  }

  // Cek durasi
  const duration = targetMessage.message.videoMessage.seconds;
  if (duration > 10) {
    await sock.sendMessage(
      jid,
      { text: "videonya kepanjangan brow, maksimal 10 detik aja ya! ⏳" },
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
    const buffer = await downloadMediaMessage(
      targetMessage,
      "buffer",
      {},
      {
        logger: { info: () => {}, error: () => {}, debug: () => {}, warn: () => {} },
        reuploadRequest: sock.updateMediaMessage
      }
    );

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
    await sock.sendMessage(
      jid,
      { text: "Waduh, gagal bikin stiker geraknya nih. Mungkin filenya kegedean atau formatnya gak cocok. 🥲" },
      { quoted: msg }
    );
  }
}

module.exports = gerakHandler;
