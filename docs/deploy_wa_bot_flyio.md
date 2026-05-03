# 🧋 Deploy WhatsApp Bot ke Fly.io (GRATIS) × Vercel

> Panduan lengkap step-by-step untuk menjalankan **HANYA** server WhatsApp Bot 24/7
> menggunakan Fly.io Free Trial — tanpa bayar, tanpa laptop nyala.
>
> ⚠️ Panduan ini KHUSUS untuk WhatsApp Bot saja.
> Landing Page & Telegram Bot tetap di Vercel seperti biasa.

### Arsitektur BobaSticker:
```
  VERCEL (sudah jalan)                 FLY.IO (panduan ini)
  ┌───────────────────────┐            ┌─────────────────────────┐
  │  Landing Page (Next.js)│            │  WhatsApp Bot (Baileys) │
  │  Telegram Bot (Webhook)│    ───►    │  Docker Container + Vol │
  │  Gratis ✅              │            │  Free Trial Credit ✅   │
  └───────────────────────┘            └─────────────────────────┘
```

---

## 📋 Daftar Isi

1. [Kenapa Fly.io?](#1--kenapa-flyio)
2. [Daftar & Install flyctl](#2--daftar--install-flyctl)
3. [Siapkan File Konfigurasi](#3--siapkan-file-konfigurasi)
4. [Deploy Bot ke Fly.io](#4--deploy-bot-ke-flyio)
5. [Buat Volume untuk Sesi WA](#5--buat-volume-untuk-sesi-wa)
6. [Monitoring & Maintenance](#6--monitoring--maintenance)
7. [Troubleshooting](#7--troubleshooting)

---

## 1. 🏆 Kenapa Fly.io?

Fly.io adalah platform container cloud yang sangat cocok untuk bot karena:

- 🆓 **Free Trial Credit** — Dapat kredit gratis untuk memulai
- 🐳 **Docker-based** — Deploy pakai container, konsisten di mana saja
- 💾 **Persistent Volumes** — Data sesi WhatsApp tersimpan aman
- 🌏 **Server Singapore** — Dekat Indonesia, latensi rendah
- 🔄 **Auto-restart** — Kalau crash, otomatis nyala lagi
- 💳 **Pay As You Go** — Bayar sesuai pemakaian, sangat murah untuk bot kecil

### Estimasi Biaya Bot WhatsApp:

| Resource | Spesifikasi | Biaya/bulan |
|----------|-------------|-------------|
| Machine (shared-cpu-1x) | 1 CPU, 256 MB RAM | ~$1.94 (±Rp 30.000) |
| Volume | 1 GB (untuk sesi WA) | ~$0.15 (±Rp 2.300) |
| **Total** | | **±Rp 32.000/bulan** |

> 💡 Fly.io memberikan **Free Trial Credit** saat pertama daftar.
> Kredit ini bisa dipakai untuk menjalankan bot kamu selama beberapa bulan pertama **GRATIS**.

---

## 2. 📝 Daftar & Install flyctl

### 2.1 Daftar Akun Fly.io
1. Buka **[https://fly.io/app/sign-up](https://fly.io/app/sign-up)**
2. Daftar pakai **GitHub** (paling gampang) atau email
3. Ikuti langkah verifikasi
4. Masukkan data kartu kredit/debit (untuk verifikasi, **nggak langsung dicharge**)

> 💡 Bisa pakai **Jenius**, **Bank Jago**, atau kartu debit biasa.

### 2.2 Install flyctl (CLI Tool)
Buka **PowerShell** di laptop kamu, lalu jalankan:

```powershell
# Install flyctl via PowerShell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Atau download manual dari: [https://fly.io/docs/flyctl/install/](https://fly.io/docs/flyctl/install/)

### 2.3 Login ke Fly.io
```powershell
flyctl auth login
```
Browser akan terbuka. Login dengan akun yang sudah kamu buat.

### 2.4 Verifikasi
```powershell
flyctl auth whoami
# Harusnya muncul email/username kamu
```

---

## 3. 📦 Siapkan File Konfigurasi

Kita perlu membuat 2 file baru di dalam folder `whatsapp-bot/`:

### 3.1 Buat Dockerfile

Buat file baru `whatsapp-bot/Dockerfile`:

```dockerfile
FROM node:20-slim

# Install dependencies untuk Sharp (image processing)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files dulu (untuk cache layer Docker)
COPY package*.json ./
RUN npm install --production

# Copy semua source code
COPY . .

# Buat folder untuk auth state (akan di-mount ke volume)
RUN mkdir -p /data/auth_info_baileys

# Symlink auth ke volume
RUN ln -s /data/auth_info_baileys /app/auth_info_baileys

CMD ["node", "index.js"]
```

### 3.2 Buat fly.toml

Buat file baru `whatsapp-bot/fly.toml`:

```toml
app = "bobasticker-wa"
primary_region = "sin"  # Singapore — dekat Indonesia

[build]

[env]
  PREFIX = "."
  NODE_ENV = "production"

[mounts]
  source = "wa_auth_data"
  destination = "/data"

# Tidak perlu HTTP service karena ini bukan web server
# Bot WA cuma butuh koneksi keluar (outbound) ke WhatsApp
```

### 3.3 Buat .dockerignore

Buat file baru `whatsapp-bot/.dockerignore`:

```
node_modules
auth_info_baileys
.env
```

---

## 4. 🚀 Deploy Bot ke Fly.io

### 4.1 Buka Terminal di Folder whatsapp-bot

```powershell
cd D:\Project\bobasticker\whatsapp-bot
```

### 4.2 Buat App di Fly.io

```powershell
flyctl apps create bobasticker-wa
```

> Kalau nama `bobasticker-wa` sudah diambil orang, ganti dengan nama lain yang unik.
> Jangan lupa update nama app di `fly.toml` juga.

### 4.3 Buat Volume untuk Data Sesi

```powershell
flyctl volumes create wa_auth_data --region sin --size 1
```

Volume 1 GB ini akan menyimpan sesi WhatsApp kamu secara persisten.
Jadi kalau bot restart/redeploy, sesi tetap aman dan nggak perlu scan QR ulang.

### 4.4 Deploy!

```powershell
flyctl deploy
```

Tunggu proses build selesai (3-5 menit pertama kali).

### 4.5 Lihat Status

```powershell
flyctl status
```

### 4.6 Scan QR Code

Untuk pertama kali, kamu perlu melihat log untuk scan QR:

```powershell
flyctl logs
```

QR Code akan muncul di log. Scan dengan WhatsApp:
- Buka WhatsApp → ⋮ → **Perangkat Tertaut** → **Tautkan Perangkat**
- Scan QR yang muncul di log

> ⚠️ QR Code punya waktu expire. Kalau gagal, restart Machine:
> ```powershell
> flyctl machines restart
> ```
> Lalu buka `flyctl logs` lagi untuk QR baru.

---

## 5. 💾 Buat Volume untuk Sesi WA

Kita sudah membuat volume di langkah 4.3. Berikut cara memastikannya bekerja:

### 5.1 Cek Volume

```powershell
flyctl volumes list
```

Pastikan ada volume `wa_auth_data` di region `sin`.

### 5.2 Kenapa Volume Penting?

Tanpa volume, setiap kali bot di-restart atau di-redeploy:
- ❌ Sesi WhatsApp hilang
- ❌ Harus scan QR ulang
- ❌ Sangat merepotkan

Dengan volume:
- ✅ Sesi tersimpan di disk terpisah
- ✅ Survive restart & redeploy
- ✅ Cukup scan QR sekali saja

---

## 6. 📊 Monitoring & Maintenance

### 6.1 Lihat Log Real-time
```powershell
flyctl logs
```

### 6.2 Cek Status Machine
```powershell
flyctl status
```

### 6.3 Restart Bot
```powershell
flyctl machines restart
```

### 6.4 SSH ke Machine (Akses Terminal)
```powershell
flyctl ssh console
```

Ini seperti masuk ke terminal server langsung.

### 6.5 Update Kode (Redeploy)

Setelah mengubah kode di laptop:

```powershell
cd D:\Project\bobasticker\whatsapp-bot
flyctl deploy
```

> 💡 Sesi WhatsApp tetap aman karena tersimpan di Volume.
> Kamu TIDAK perlu scan QR lagi setelah redeploy.

### 6.6 Scale Machine (Kalau Butuh Lebih)
```powershell
# Lihat spek saat ini
flyctl scale show

# Upgrade RAM ke 512 MB (kalau 256 MB kurang)
flyctl scale memory 512
```

---

## 7. 🔧 Troubleshooting

### Bot crash / restart loop
```powershell
# Lihat log error
flyctl logs

# SSH ke dalam container untuk debug
flyctl ssh console

# Di dalam container:
cd /app
node index.js
# Lihat error-nya langsung
```

### Sesi WhatsApp expired / harus scan QR ulang
```powershell
# SSH ke container
flyctl ssh console

# Hapus sesi lama
rm -rf /data/auth_info_baileys/*

# Keluar dari SSH
exit

# Restart bot
flyctl machines restart

# Buka log untuk scan QR baru
flyctl logs
```

### Build error saat deploy
```powershell
# Pastikan Dockerfile benar
# Coba build lokal dulu (kalau punya Docker):
docker build -t bobasticker-test .

# Kalau nggak punya Docker, cek log deploy:
flyctl deploy --verbose
```

### Cek berapa kredit tersisa
```powershell
flyctl orgs show
```

Atau cek di dashboard: [https://fly.io/dashboard](https://fly.io/dashboard) → Billing

### Update kode dari GitHub ke Fly.io
```powershell
cd D:\Project\bobasticker

# Pull perubahan terbaru
git pull origin main

# Deploy ulang ke Fly.io (HANYA folder whatsapp-bot)
cd whatsapp-bot
flyctl deploy
```

> 💡 Kamu tidak perlu menjalankan apapun untuk Vercel.
> Vercel otomatis rebuild saat kamu push ke GitHub.

---

## 📊 Ringkasan Arsitektur Final

```
╔══════════════════════════════════════════════════════════════╗
║                     BOBASTICKER 3.0                          ║
╠══════════════════════════╦═══════════════════════════════════╣
║   VERCEL (Gratis)        ║    FLY.IO (Free Trial/Murah)     ║
║                          ║                                   ║
║   📄 Landing Page        ║    💬 WhatsApp Bot (Baileys)      ║
║      Next.js + 3D + TW   ║       Docker Container           ║
║                          ║       Persistent Volume           ║
║   🤖 Telegram Bot        ║       Auto-restart                ║
║      Webhook (HTTP)      ║                                   ║
║      Serverless          ║    ✅ HANYA INI YANG DI FLY.IO   ║
╠══════════════════════════╩═══════════════════════════════════╣
║   Total biaya: ± Rp 32.000/bulan (setelah free trial habis) ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ✅ Checklist Sebelum "Gassss"

- [ ] Akun Fly.io sudah terdaftar
- [ ] `flyctl` sudah terinstall dan login
- [ ] `Dockerfile` sudah dibuat di `whatsapp-bot/`
- [ ] `fly.toml` sudah dibuat di `whatsapp-bot/`
- [ ] `.dockerignore` sudah dibuat di `whatsapp-bot/`
- [ ] App dan Volume sudah di-create
- [ ] `flyctl deploy` berhasil
- [ ] QR Code sudah di-scan via `flyctl logs`
- [ ] Bot ONLINE dan merespons pesan
- [ ] Test kirim `.s` dengan gambar → stiker berhasil

---

## 📌 Perintah Flyctl yang Sering Dipakai

| Perintah | Fungsi |
|----------|--------|
| `flyctl logs` | Lihat log bot real-time |
| `flyctl status` | Cek status Machine |
| `flyctl machines restart` | Restart bot |
| `flyctl ssh console` | Masuk ke terminal server |
| `flyctl deploy` | Deploy ulang kode terbaru |
| `flyctl scale memory 512` | Upgrade RAM |
| `flyctl volumes list` | Cek volume storage |

---

**Estimasi Waktu Setup**: 15-20 menit
**Biaya**: Gratis selama Free Trial, lalu ± Rp 32.000/bulan

> *"Laptop boleh tidur, bot tetap kerja — dari mana saja."* — BobaSticker Team 🧋
