# 🧋 Deploy WhatsApp Bot ke Rumah Web VPS × Vercel

> Panduan lengkap step-by-step untuk menjalankan **HANYA** server WhatsApp Bot 24/7
> menggunakan VPS dari Rumah Web Indonesia.
>
> ⚠️ Panduan ini KHUSUS untuk WhatsApp Bot saja.
> Landing Page & Telegram Bot tetap di Vercel seperti biasa.

### Arsitektur BobaSticker:
```
  VERCEL (sudah jalan)                 RUMAH WEB VPS (panduan ini)
  ┌───────────────────────┐            ┌─────────────────────────┐
  │  Landing Page (Next.js)│            │  WhatsApp Bot (Baileys) │
  │  Telegram Bot (Webhook)│    ───►    │  node index.js + PM2    │
  │  Gratis ✅              │            │  Rp 50.000/bulan 🇮🇩    │
  └───────────────────────┘            └─────────────────────────┘
```

---

## 📋 Daftar Isi

1. [Kenapa Rumah Web?](#1--kenapa-rumah-web)
2. [Pilih & Beli Paket VPS](#2--pilih--beli-paket-vps)
3. [Koneksi ke Server via SSH](#3--koneksi-ke-server-via-ssh)
4. [Install Node.js & Dependensi](#4--install-nodejs--dependensi)
5. [Upload & Jalankan Bot](#5--upload--jalankan-bot)
6. [Jalankan Bot 24/7 dengan PM2](#6--jalankan-bot-247-dengan-pm2)
7. [Transfer Sesi WhatsApp](#7--transfer-sesi-whatsapp)
8. [Troubleshooting](#8--troubleshooting)

---

## 1. 🏆 Kenapa Rumah Web?

Rumah Web adalah provider hosting lokal Indonesia yang sudah berpengalaman dan terpercaya.

**Keunggulan untuk bot WhatsApp:**
- 🇮🇩 **Server di Indonesia** — Latensi rendah, koneksi ke WhatsApp lebih stabil
- 💬 **Support Bahasa Indonesia** — Livechat, telepon, email dalam bahasa Indonesia
- 💰 **Murah** — Mulai dari Rp 50.000/bulan (secangkir kopi!)
- ⚡ **SSD Storage** — Performa baca/tulis tinggi
- 🛡️ **DDoS Protection** — Perlindungan dari serangan
- 🔧 **Aktivasi Instan** — VPS aktif dalam 5-10 menit setelah bayar

### Paket VPS yang Direkomendasikan:

| Paket | vCPU | RAM | Storage | Traffic | Harga/bulan |
|-------|------|-----|---------|---------|-------------|
| **XS (Cukup!)** | 1 Core | 512 MB | 10 GB | Unlimited | **Rp 50.000** |
| S (Lebih Aman) | 1 Core | 1 GB | 20 GB | Unlimited | Rp 60.000 |
| M (Recommended) | 1 Core | 2 GB | 40 GB | Unlimited | Rp 120.000 |

> 💡 **Rekomendasi**: Paket **XS (Rp 50.000)** sudah **CUKUP** untuk menjalankan bot WhatsApp.
> Bot kita ringan banget — cuma butuh Node.js + Sharp.
> Upgrade ke paket S atau M kalau nanti user-nya sudah banyak banget.

---

## 2. 📝 Pilih & Beli Paket VPS

### 2.1 Buka Halaman VPS Rumah Web
1. Buka **[https://www.rumahweb.com/vps-murah/](https://www.rumahweb.com/vps-murah/)**
2. Scroll ke bagian daftar harga VPS

### 2.2 Pilih Paket
1. Pilih tab **"Linux"** (JANGAN pilih Windows)
2. Pilih paket yang kamu mau (rekomendasi: **XS** atau **S**)
3. Klik **"Beli Sekarang"**

### 2.3 Konfigurasi VPS
Pada halaman order, isi:
- **Lokasi / Zone**: Pilih **Zone A (TechnoVillage, Bogor)** — lebih murah
- **OS**: Pilih **Ubuntu 22.04** (atau versi terbaru yang tersedia)
- **Control Panel**: Pilih **Tanpa Control Panel** (kita nggak butuh cPanel)
- **Periode**: Pilih sesuai budget (bulanan, 3 bulan, dst.)

### 2.4 Checkout & Bayar
1. Buat akun Rumah Web (jika belum punya)
2. Pilih metode pembayaran:
   - **Transfer Bank** (BCA, BNI, BRI, Mandiri)
   - **E-Wallet** (OVO, GoPay, dll)
   - **QRIS**
3. Bayar sesuai instruksi
4. VPS akan **aktif otomatis dalam 5-10 menit** setelah pembayaran dikonfirmasi

### 2.5 Catat Informasi VPS
Setelah VPS aktif, kamu akan menerima email dari Rumah Web berisi:
- **IP Address**: `xxx.xxx.xxx.xxx`
- **Username**: `root`
- **Password**: `passwordkamu123`
- **Port SSH**: `22`

> ⚠️ **SIMPAN EMAIL INI BAIK-BAIK!** Ini kunci masuk ke server kamu.

---

## 3. 🔗 Koneksi ke Server via SSH

### Dari Windows (PowerShell / Terminal):

```powershell
ssh root@ALAMAT_IP_KAMU
```

Ganti `ALAMAT_IP_KAMU` dengan IP dari email Rumah Web.

Ketik `yes` saat ditanya "Are you sure you want to continue connecting?"
Lalu masukkan **password** dari email.

### Dari Windows (Pakai PuTTY - Alternatif):
1. Download PuTTY: [putty.org](https://putty.org)
2. Buka **PuTTY**:
   - Host Name: `root@ALAMAT_IP_KAMU`
   - Port: `22`
3. Klik **Open**
4. Masukkan password dari email

### Pertama Kali Masuk - Ganti Password:
```bash
# WAJIB! Ganti password default demi keamanan
passwd
# Masukkan password baru 2x
```

Kalau berhasil, kamu akan melihat:
```
root@vpsXXXX:~#
```

🎉 **Selamat, kamu sudah masuk ke server Rumah Web!**

---

## 4. 📦 Install Node.js & Dependensi

Jalankan perintah-perintah ini satu per satu di terminal server:

### 4.1 Update Sistem
```bash
apt update && apt upgrade -y
```

### 4.2 Install Node.js 20 (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 4.3 Verifikasi Instalasi
```bash
node -v
# Harusnya muncul: v20.x.x

npm -v
# Harusnya muncul: 10.x.x
```

### 4.4 Install Build Tools (untuk Sharp image processing)
```bash
apt install -y build-essential python3
```

### 4.5 Install PM2 (Process Manager - biar bot jalan 24/7)
```bash
npm install -g pm2
```

### 4.6 Install Git
```bash
apt install -y git
```

---

## 5. 🚀 Upload & Jalankan Bot

> ⚠️ Di server Rumah Web, kamu **HANYA perlu folder `whatsapp-bot/`**.
> Landing page dan Telegram bot tetap dihandle Vercel, tidak perlu diinstall di sini.

### 5.1 Clone Repository (Hanya Ambil yang Diperlukan)
```bash
cd ~
git clone https://github.com/USERNAME_KAMU/bobasticker.git
cd bobasticker/whatsapp-bot
```

Ganti `USERNAME_KAMU` dengan username GitHub kamu.

> 💡 Walaupun kita clone seluruh repo, yang kita jalankan **hanya folder `whatsapp-bot/`**.
> Folder lain (app/, lib/, public/) adalah milik Vercel dan tidak perlu disentuh di server ini.

### 5.2 Install Dependencies
```bash
npm install
```

### 5.3 Buat File Environment
```bash
nano .env
```

Isi dengan:
```env
PREFIX=.
```

Simpan dengan: `Ctrl + X` → `Y` → `Enter`

### 5.4 Test Run (Coba Dulu)
```bash
node index.js
```

- QR Code akan muncul di terminal
- **Scan QR Code** dengan WhatsApp di HP kamu:
  - Buka WhatsApp → Titik tiga (⋮) → **Perangkat Tertaut** → **Tautkan Perangkat**
  - Scan QR yang muncul di terminal
- Setelah muncul "WhatsApp Bot ONLINE! 🚀", bot sudah jalan!
- Tekan `Ctrl + C` untuk stop (kita akan jalankan pakai PM2 sebentar lagi)

---

## 6. 🔄 Jalankan Bot 24/7 dengan PM2

PM2 adalah process manager yang akan:
- Menjaga bot tetap jalan 24/7
- Auto-restart kalau crash
- Auto-start kalau server reboot

### 6.1 Jalankan Bot dengan PM2
```bash
cd ~/bobasticker/whatsapp-bot
pm2 start index.js --name "bobasticker-wa"
```

### 6.2 Lihat Status Bot
```bash
pm2 status
```

Akan muncul tabel seperti ini:
```
┌─────┬──────────────────┬─────────────┬──────┬───────┐
│ id  │ name             │ mode        │ ↺    │ status│
├─────┼──────────────────┼─────────────┼──────┼───────┤
│ 0   │ bobasticker-wa   │ fork        │ 0    │ online│
└─────┴──────────────────┴─────────────┴──────┴───────┘
```

### 6.3 Lihat Log Bot (Real-time)
```bash
pm2 logs bobasticker-wa
```

Tekan `Ctrl + C` untuk keluar dari log (bot tetap jalan).

### 6.4 Auto-Start Saat Server Reboot
```bash
pm2 startup
# Ikuti instruksi yang muncul (copy-paste perintah yang diberikan)

pm2 save
```

> 🎉 **SELESAI!** Bot kamu sekarang akan jalan 24/7 di Rumah Web.
> Bahkan kalau server reboot, bot akan otomatis nyala lagi.

### 6.5 Perintah PM2 yang Berguna
```bash
# Restart bot
pm2 restart bobasticker-wa

# Stop bot
pm2 stop bobasticker-wa

# Hapus bot dari PM2
pm2 delete bobasticker-wa

# Monitor CPU & RAM
pm2 monit
```

---

## 7. 📱 Transfer Sesi WhatsApp

### Opsi A: Scan QR Baru di Server (PALING MUDAH)
Cara paling simpel adalah langsung scan QR baru di server.
Cukup jalankan `node index.js` dan scan dari HP.

### Opsi B: Transfer Sesi dari Laptop ke Server
Jika kamu sudah punya sesi aktif di laptop dan ingin memindahkannya:

**Di Laptop (PowerShell):**
```powershell
# Compress folder auth
cd D:\Project\bobasticker\whatsapp-bot
tar -czf auth_backup.tar.gz auth_info_baileys/

# Upload ke server Rumah Web
scp auth_backup.tar.gz root@ALAMAT_IP_KAMU:~/bobasticker/whatsapp-bot/
```

**Di Server Rumah Web:**
```bash
cd ~/bobasticker/whatsapp-bot

# Extract auth backup
tar -xzf auth_backup.tar.gz

# Restart bot
pm2 restart bobasticker-wa
```

> ⚠️ **PERINGATAN**: Satu sesi WhatsApp hanya bisa aktif di satu tempat.
> Kalau kamu transfer sesi ke server, sesi di laptop otomatis ter-disconnect.

---

## 8. 🔧 Troubleshooting

### Bot crash terus / restart loop
```bash
# Cek log error
pm2 logs bobasticker-wa --lines 50

# Kemungkinan solusi:
# 1. Node modules rusak
cd ~/bobasticker/whatsapp-bot
rm -rf node_modules
npm install

# 2. Sesi WhatsApp expired
rm -rf auth_info_baileys
pm2 restart bobasticker-wa
# Lalu scan QR baru
```

### Tidak bisa SSH ke server
```bash
# Pastikan IP dan password benar (cek email dari Rumah Web)
# Jika lupa password, hubungi support Rumah Web:
# Email: teknis@rumahweb.com
# Telepon: 0274-882257
```

### Sharp error saat install
```bash
# Rebuild Sharp
cd ~/bobasticker/whatsapp-bot
npm rebuild sharp
```

### Bot online tapi tidak merespons
```bash
# Cek apakah proses berjalan
pm2 status

# Lihat log real-time sambil kirim pesan test
pm2 logs bobasticker-wa

# Restart total
pm2 restart bobasticker-wa
```

### Update kode dari GitHub
```bash
cd ~/bobasticker
git pull origin main

# HANYA install ulang di folder whatsapp-bot
cd whatsapp-bot
npm install

pm2 restart bobasticker-wa
```

> 💡 Kamu tidak perlu menjalankan `npm install` di root folder.
> Folder root (Next.js) hanya untuk Vercel. Server ini hanya mengurus WhatsApp Bot.

### Butuh Bantuan Rumah Web?
- **Livechat**: [rumahweb.com/livechat](https://www.rumahweb.com/livechat/)
- **Email Teknis**: teknis@rumahweb.com
- **Telepon**: 0274-882257
- **WhatsApp Sales**: [Chat Langsung](https://rumahweb.com/goto/wa-sales.php)

---

## 📊 Ringkasan Arsitektur Final

```
╔══════════════════════════════════════════════════════════════╗
║                     BOBASTICKER 3.0                          ║
╠══════════════════════════╦═══════════════════════════════════╣
║   VERCEL (Gratis)        ║    RUMAH WEB VPS (Rp 50rb/bln)   ║
║                          ║                                   ║
║   📄 Landing Page        ║    💬 WhatsApp Bot (Baileys)      ║
║      Next.js + 3D + TW   ║       WebSocket (koneksi 24/7)   ║
║                          ║       PM2 Auto-restart            ║
║   🤖 Telegram Bot        ║                                   ║
║      Webhook (HTTP)      ║    ✅ HANYA INI YANG DI RUMAHWEB ║
║      Serverless          ║                                   ║
╠══════════════════════════╩═══════════════════════════════════╣
║   Total biaya: ± Rp 50.000/bulan (secangkir kopi ☕)        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ✅ Checklist Sebelum "Gassss"

- [ ] VPS Rumah Web sudah dibeli & aktif
- [ ] Sudah terima email berisi IP + password
- [ ] Sudah bisa SSH ke server
- [ ] Password default sudah diganti
- [ ] Node.js terinstall di server
- [ ] Repository sudah di-clone
- [ ] npm install berhasil (termasuk Sharp)
- [ ] File .env sudah dibuat
- [ ] QR Code sudah di-scan, bot ONLINE
- [ ] PM2 sudah running dan auto-startup
- [ ] Test kirim `.s` dengan gambar → stiker berhasil

---

**Estimasi Waktu Setup**: 20-30 menit (pertama kali)
**Biaya Total**: Rp 50.000/bulan (paket XS)

> *"Laptop boleh tidur, bot tetap kerja — semurah secangkir kopi."* — BobaSticker Team 🧋
