async function helpHandler(sock, msg, prefix) {
  const helpText = `╔══════════════════════╗
     *🧋 BOBA STICKER BOT*
╚══════════════════════╝

_Ubah foto & video jadi stiker WA dalam hitungan detik!_
_Gratis, cepat, dan tanpa simpan data._

━━━━━━━━━━━━━━━━━━━━━━
  *📌 DAFTAR COMMAND*
━━━━━━━━━━━━━━━━━━━━━━

🖼️ *STIKER*
┃
┣ \`${prefix}s\` — Bikin stiker dari gambar
┃   _Kirim gambar + caption_ \`${prefix}s\`
┃   _atau reply gambar lalu ketik_ \`${prefix}s\`
┃
┣ \`${prefix}gerak\` — Bikin stiker gerak (GIF/Video)
┃   _Kirim video + caption_ \`${prefix}gerak\`
┃   _atau reply video lalu ketik_ \`${prefix}gerak\`
┃   _Durasi maksimal 10 detik ya!_
┃
┗ \`${prefix}sg\` — _Alias dari_ \`${prefix}gerak\`

🛠️ *UTILITAS*
┃
┣ \`${prefix}ping\` — Cek kecepatan respons bot
┃
┗ \`${prefix}help\` — Tampilkan menu ini

━━━━━━━━━━━━━━━━━━━━━━
  *📖 CARA PAKAI*
━━━━━━━━━━━━━━━━━━━━━━

*① Kirim gambar/video baru*
    Pilih media → caption \`${prefix}s\` atau \`${prefix}gerak\` → kirim

*② Reply media orang*
    Tap & hold media → Reply → \`${prefix}s\` atau \`${prefix}gerak\`

━━━━━━━━━━━━━━━━━━━━━━

> 💡 *Tips:* Bisa dipakai di DM maupun Grup!
> 🔒 Media tidak disimpan — diproses di memory, langsung dibuang.
> ⚡ Powered by _Sharp_ & _FFmpeg_ · _WebP 512×512_

╔══════════════════════╗
   _© 2026 BobaSticker_
╚══════════════════════╝`;


  await sock.sendMessage(
    msg.key.remoteJid,
    { text: helpText },
    { quoted: msg }
  );
}

module.exports = helpHandler;
