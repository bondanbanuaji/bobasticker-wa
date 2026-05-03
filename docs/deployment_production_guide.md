# 🚀 Panduan Deployment BobaSticker 3.0 (Fly.io x Vercel)

Ini adalah metode **PRO** dan paling direkomendasikan untuk menjalankan bot 24 jam dengan penyimpanan permanen (Volume).

---

## 📋 Daftar Isi
1. [Struktur Deployment](#1-struktur-deployment)
2. [Langkah 1: Deploy WhatsApp Bot ke Fly.io](#2-langkah-1-deploy-whatsapp-bot-ke-flyio)
3. [Langkah 2: Deploy Dashboard ke Vercel](#3-langkah-2-deploy-dashboard-ke-vercel)
4. [Sinkronisasi & Testing](#4-sinkronisasi--testing)

---

## 1. Struktur Deployment
- **Fly.io (Backend)**: Menjalankan bot WhatsApp, database Prisma, dan Socket.io. Mendukung **Volume** agar session WA tidak hilang.
- **Vercel (Frontend)**: Menjalankan Dashboard UI yang cantik dan cepat.
- **Supabase (Database)**: Menyimpan log aktivitas, konfigurasi, dan data admin.

---

## 2. Langkah 1: Deploy WhatsApp Bot ke Fly.io

Kamu bisa deploy langsung lewat **Dashboard Web Fly.io** (seperti di screenshot kamu) atau lewat **Terminal**.

### A. Persiapan GitHub
- Pastikan kodingan kamu sudah di-push ke GitHub repository: `bondanbanuaji/bobasticker-wa`.

### B. Konfigurasi di Fly.io Dashboard
1.  Pilih repository **`bobasticker-wa`**.
2.  **App Name:** Beri nama unik (contoh: `bobasticker-bot`).
3.  **Region:** Pilih **Singapore (sin)**.
4.  **Environment Variables (Secrets):** 
    Sangat penting! Masukkan ini di tab Secrets:
    - `DATABASE_URL`: (Dari Supabase)
    - `SUPABASE_URL`: (Dari Supabase)
    - `SUPABASE_ANON_KEY`: (Dari Supabase)
5.  **Volume (Sangat Penting):**
    Karena kamu pakai dashboard web, pastikan kamu menambahkan volume bernama `wa_auth_data` sebesar `1GB` dan di-mount ke `/data`.

### C. Melalui Terminal (Jika Dashboard Web Bingung)
```powershell
# 1. Inisialisasi
fly launch --name bobasticker-bot --region sin --no-deploy

# 2. Buat Storage agar tidak perlu scan QR berkali-kali
fly volumes create wa_auth_data --region sin --size 1

# 3. Masukkan Secrets
fly secrets set DATABASE_URL="..." SUPABASE_URL="..." SUPABASE_ANON_KEY="..."

# 4. Deploy
fly deploy
```

---

## 3. Langkah 2: Deploy Dashboard ke Vercel

1.  Buka [Vercel](https://vercel.com) dan import repo yang sama.
2.  **Edit Project Settings:**
    - **Root Directory:** Pilih folder `dashboard`.
    - **Framework Preset:** Pilih `Vite`.
3.  **Environment Variables di Vercel:**
    - `VITE_API_URL`: Isi dengan URL Fly.io kamu (contoh: `https://bobasticker-bot.fly.dev`).
    - `VITE_SUPABASE_URL`: URL Supabase.
    - `VITE_SUPABASE_ANON_KEY`: Anon Key Supabase.
4.  Klik **Deploy**.

---

## 4. Sinkronisasi & Testing

1.  **Generate Prisma:** Dockerfile kamu sudah otomatis menjalankan `npx prisma generate`, jadi database harusnya langsung jalan.
2.  **Scan QR:**
    Buka terminal dan ketik:
    ```powershell
    fly logs
    ```
    Scan QR yang muncul menggunakan WhatsApp di HP kamu.
3.  **Cek Dashboard:**
    Buka URL Vercel kamu, login, dan pastikan status bot sudah `Connected`.

---

> [!NOTE]
> **Biaya:** Metode ini gratis selama pemakaian di bawah kuota free tier Fly.io (256MB RAM). Fly.io tetap butuh kartu kredit/debit untuk verifikasi akun, tapi tidak akan menagih selama pemakaian normal.
