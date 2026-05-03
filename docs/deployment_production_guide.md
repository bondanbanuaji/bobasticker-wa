# 🚀 Panduan Deployment BobaSticker 3.0 (Fly.io Dashboard)

Ikuti panduan ini untuk men-deploy bot kamu langsung melalui web dashboard Fly.io (Launch from GitHub).

---

## 📋 Langkah-langkah di Dashboard Fly.io

### 1. Persiapan Awal
- Pastikan kodingan terbaru sudah kamu **Push ke GitHub**.
- Pastikan file `fly.toml` di root project sudah memiliki `internal_port = 3000`.

### 2. Pilih Repository
- Login ke [Fly.io Dashboard](https://fly.io/dashboard).
- Pilih menu **"Launch an App from GitHub"**.
- Cari dan pilih repository: `bondanbanuaji/bobasticker-wa`.

### 3. Isi Konfigurasi (Sesuai Dashboard)
Isi kolom-kolomnya seperti berikut:

- **App name**: Masukkan nama unik (contoh: `boba-sticker-bot-99`). *Nama ini harus unik sedunia.*
- **Organization**: Pilih `Personal` atau organisasi kamu.
- **Branch**: Pilih `main`.
- **Region**: Pilih **`sin (Singapore)`** agar akses dari Indonesia cepat.
- **Internal port**: Ganti menjadi **`3000`**. (Wajib!)

### 4. Machine Sizes
- **CPU(s)**: `shared-cpu-1x`.
- **Memory**: `256MB` (Cukup untuk bot).

### 5. Environment Variables (Secrets)
Klik **"+ New environment variable"** dan masukkan semua ini:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | (Ambil dari Supabase kamu) |
| `DIRECT_URL` | (Ambil dari Supabase kamu) |
| `SUPABASE_URL` | (Ambil dari Supabase kamu) |
| `SUPABASE_ANON_KEY` | (Ambil dari Supabase kamu) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Ambil dari Supabase kamu) |
| `FRONTEND_URL` | (URL Vercel kamu nanti) |
| `PORT` | `3000` |

### 6. Database & Paths
- **Database**: **JANGAN DICENTANG** (Managed Postgres tidak perlu karena sudah pakai Supabase).
- **Working directory**: Biarkan kosong (default `./`).
- **Config path**: Biarkan kosong (default `fly.toml`).

---

## 🚀 Eksekusi
1. Klik tombol ungu **"Deploy"**.
2. Tunggu proses build selesai (sekitar 2-5 menit).
3. **PENTING: Cek Logs.** Setelah statusnya `Running`, cari menu **"Logs"** di sebelah kiri dashboard Fly.io.
4. **Scan QR:** Cari QR Code di logs, lalu scan pakai WhatsApp kamu.

---

## 🖥️ Deploy Dashboard ke Vercel
1. Buka Vercel, pilih repo yang sama.
2. Atur **Root Directory** ke folder `dashboard`.
3. Masukkan Environment Variables:
   - `VITE_API_URL`: `https://nama-app-flyio-kamu.fly.dev`
   - `VITE_SUPABASE_URL`: (Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (Supabase)
4. Klik **Deploy**.
