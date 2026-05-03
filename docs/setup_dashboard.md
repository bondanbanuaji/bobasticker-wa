# Panduan Setup Manual: BobaSticker Web Dashboard (Vercel + Supabase)

Arsitektur aplikasi kamu sekarang telah menggunakan standar keamanan tinggi dan dibagi menjadi dua bagian:
1. **Frontend (Vite + React)**: Berada di folder `dashboard/`, akan di-deploy ke **Vercel**.
2. **Backend (WhatsApp Bot + API)**: Berada di *root folder*, akan di-deploy ke **Fly.io** seperti biasa.

Berikut adalah langkah-langkah yang **wajib** kamu lakukan secara manual untuk menghubungkan semuanya.

---

## 1. Setup Database (Supabase)
Karena kita menggunakan keamanan berbasis JWT dan admin whitelist, kamu butuh database.
1. Buat akun dan project gratis di [Supabase](https://database.new).
2. Pergi ke **Project Settings -> Database** dan copy URI koneksi PostgreSQL kamu.
3. Di Supabase Dashboard, pergi ke menu **SQL Editor**, jalankan query ini untuk membuat user admin pertama:
   *(Karena ini sangat rahasia, pendaftaran dimatikan di UI. Kamu harus menambahkannya langsung ke sistem Auth)*

```sql
-- Ganti dengan email dan password kamu!
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES (
  gen_random_uuid(),
  'admin@emailkamu.com',
  crypt('passwordrahasia', gen_salt('bf')),
  now(),
  'authenticated'
);
```

4. Pergi ke menu **Table Editor**, atau jalankan ini di SQL Editor untuk mendaftarkan akun di atas ke tabel whitelist `Admin` kita:
```sql
-- Dapatkan ID user yang baru saja dibuat
SELECT id FROM auth.users WHERE email = 'admin@emailkamu.com';

-- Copy UUID dari query di atas, lalu masukkan ke tabel Admin:
INSERT INTO "Admin" (id, email, "createdAt")
VALUES ('uuid-yang-dicopy-tadi', 'admin@emailkamu.com', now());
```

---

## 2. Push Schema Prisma ke Database
Buka terminal kamu di folder utama `bobasticker-wa`, jalankan:
```bash
# Isi .env dulu dengan kredensial Supabase (DATABASE_URL dan DIRECT_URL)
npx prisma db push
```

---

## 3. Konfigurasi Environment Variables (Kunci Rahasia)

Kamu butuh variabel ini di **Dua Tempat**.

### A. Untuk Frontend di Vercel
Di Vercel Dashboard, saat deploy folder `dashboard/`, tambahkan Environment Variables berikut:
- `VITE_SUPABASE_URL` = URL Supabase kamu (contoh: `https://xyz.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` = Anon/Public Key Supabase kamu
- `VITE_API_URL` = URL Fly.io kamu (contoh: `https://bobasticker-wa.fly.dev`)

### B. Untuk Backend di Fly.io
Gunakan CLI Fly.io untuk menyimpan secrets (jangan ditaruh di `fly.toml` karena ini rahasia):
```bash
fly secrets set SUPABASE_URL="https://xyz.supabase.co"
fly secrets set FRONTEND_URL="https://dashboard-kamu.vercel.app" # URL Vercel kamu nanti
fly secrets set DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-sin.pooler.supabase.com:6543/postgres?pgbouncer=true"
fly secrets set DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```
*Catatan: Gunakan connection pooler (port 6543) untuk `DATABASE_URL` agar koneksi database tidak jebol.*

---

## 4. Deploy Frontend (Vercel)
1. Push repository kamu ke GitHub.
2. Login ke Vercel, pilih **Add New Project**.
3. Pilih repository Github kamu.
4. Di bagian **Framework Preset**, pastikan terpilih **Vite**.
5. Di bagian **Root Directory**, pilih folder `dashboard`.
6. Masukkan Environment Variables (dari langkah 3A).
7. Klik **Deploy**.

---

## 5. Deploy Backend (Fly.io)
Jalankan command ini di terminal pada folder root `bobasticker-wa`:
```bash
fly deploy
```

---

## Selesai! 🎉
Sekarang kamu bisa buka URL Vercel kamu, login dengan email & password yang kamu buat di langkah 1, lalu manajemen bot WhatsApp (scan QR, restart, putuskan koneksi) secara aman dari mana saja. Jika ada orang lain yang iseng membuka web dashboard-mu, mereka tidak akan bisa login atau melihat QR code bot kamu.
