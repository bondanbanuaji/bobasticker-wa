# 📱 Panduan Jalankan Bot di HP (Termux) + Dashboard Vercel

Panduan ini menjelaskan cara menjadikan HP kamu sebagai server bot WhatsApp dan menghubungkannya ke Dashboard yang ada di Vercel.

---

## 🛠️ Langkah 1: Perbaiki Dashboard di Vercel
Agar tidak muncul error `500: INTERNAL_SERVER_ERROR`, kamu harus memastikan Vercel **hanya men-deploy folder dashboard**, bukan seluruh project.

1.  Buka **Vercel Dashboard** > Pilih Project kamu.
2.  Pergi ke **Settings** > **General**.
3.  Ubah **Root Directory** menjadi: `dashboard`.
4.  Pastikan **Framework Preset** dipilih **Vite**.
5.  Klik **Save** dan lakukan **Redeploy**.

---

## 🔑 Langkah 2: Setup Environment Variables (Vercel)
Masukkan variabel berikut di menu **Settings > Environment Variables** di Vercel Dashboard. Ini data yang harus kamu **Copy-Paste**:

| Key | Value (Ambil dari file .env kamu) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://fmprouitpiuqsuuvsdpw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Key Anon kamu) |
| `VITE_API_URL` | **URL Cloudflare Tunnel kamu** (Contoh: `https://random-name.trycloudflare.com`) |

---

## 📲 Langkah 3: Setup Termux di HP
1.  **Install Termux** (Disarankan download dari F-Droid).
2.  Buka Termux dan jalankan perintah ini satu per satu:
    ```bash
    pkg update && pkg upgrade
    pkg install nodejs git python build-essential
    ```
3.  **Clone Project & Install:**
    ```bash
    git clone https://github.com/username/bobasticker-wa.git
    cd bobasticker-wa
    npm install
    ```
4.  **Setup .env di Termux:**
    Ketik `nano .env` di Termux dan masukkan data ini:
    ```env
    DATABASE_URL="postgresql://postgres.fmprouitpiuqsuuvsdpw:008001Boba.@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    SUPABASE_URL="https://fmprouitpiuqsuuvsdpw.supabase.co"
    SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    FRONTEND_URL="https://bobasticker-wa.vercel.app"
    PORT=3000
    ```

---

## 🌐 Langkah 4: Menghubungkan HP ke Vercel (Tunneling)
1.  **Install Cloudflared di Termux:**
    ```bash
    pkg install cloudflared
    ```
2.  **Jalankan Tunnel:**
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
3.  **Salin URL:** Kamu akan mendapatkan URL `https://...trycloudflare.com`.
4.  **Update Vercel:** Masukkan URL tersebut ke variabel **`VITE_API_URL`** di Dashboard Vercel kamu, lalu **Redeploy**.

---

## 🚀 Langkah 5: Jalankan Bot!
1.  Buka tab baru di Termux (swipe dari kiri, klik New Session).
2.  Ketik: `npm start`.
3.  Buka website Vercel kamu, scan QR-nya, dan selesai!

---

### ⚠️ Tips Penting
- **Wake Lock**: Ketik `termux-wake-lock` agar bot tidak mati saat HP dikantongi.
- **Update URL**: Jika Termux/Cloudflare dimatikan, URL akan berubah. Kamu harus ganti `VITE_API_URL` di Vercel setiap kali URL Cloudflare berubah.
