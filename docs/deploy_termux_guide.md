# 📱 Panduan Jalankan Bot di HP (Termux) + Dashboard Vercel

Panduan ini menjelaskan cara menjadikan HP kamu sebagai server bot WhatsApp dan menghubungkannya ke Dashboard yang ada di Vercel.

---

## 🛠️ Langkah 1: Perbaiki Dashboard di Vercel
Agar tidak muncul error `500: INTERNAL_SERVER_ERROR`, kamu harus memastikan Vercel **hanya men-deploy folder dashboard**, bukan seluruh project.

1.  Buka **Vercel Dashboard** > Pilih Project kamu.
2.  Pergi ke **Settings** > **General**.
3.  Ubah **Root Directory** menjadi: `dashboard`.
4.  Klik **Save** dan lakukan **Redeploy**.
5.  *Sekarang web kamu tidak akan error 500 lagi, tapi statusnya akan "Offline" karena belum terhubung ke HP.*

---

## 📲 Langkah 2: Setup Termux di HP
1.  **Install Termux** (Disarankan download dari F-Droid).
2.  Buka Termux dan jalankan perintah ini satu per satu:
    ```bash
    pkg update && pkg upgrade
    pkg install nodejs git python build-essential
    ```
3.  **Clone Project:**
    ```bash
    git clone https://github.com/username/bobasticker-wa.git
    cd bobasticker-wa
    npm install
    ```
4.  **Setup .env:**
    Buat file `.env` di Termux dan isi dengan data Supabase kamu (sama seperti di laptop).

---

## 🌐 Langkah 3: Menghubungkan HP ke Internet (Tunneling)
Karena HP kamu tidak punya IP Publik, kita butuh **Cloudflare Tunnel** agar Vercel bisa "melihat" bot di HP kamu.

1.  **Install Cloudflared di Termux:**
    ```bash
    pkg install cloudflared
    ```
2.  **Jalankan Tunnel:**
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
3.  **Salin URL:**
    Kamu akan mendapatkan URL seperti `https://random-name.trycloudflare.com`. **Simpan URL ini!**

---

## 🔗 Langkah 4: Sinkronisasi ke Vercel
1.  Buka **Vercel Dashboard** > **Settings** > **Environment Variables**.
2.  Ubah/Tambah variabel **`VITE_API_URL`**.
3.  Isi nilainya dengan URL Cloudflare tadi (contoh: `https://random-name.trycloudflare.com`).
4.  **Redeploy** Dashboard di Vercel.

---

## 🚀 Langkah 5: Jalankan Bot!
1.  Di Termux, jalankan bot:
    ```bash
    npm start
    ```
2.  Buka URL Vercel kamu di browser.
3.  Status harusnya sudah **Connecting/QR Code**.
4.  Scan QR-nya, dan selesai! HP kamu sekarang adalah servernya.

---

### ⚠️ Tips Penting
- **Matikan Optimasi Baterai**: Pastikan Termux tidak dimatikan oleh sistem Android (Cek pengaturan baterai > Termux > Jangan batasi).
- **Wake Lock**: Ketik `termux-wake-lock` di Termux agar CPU tetap nyala meskipun layar HP mati.
- **Update URL**: Jika kamu mematikan Cloudflared dan menyalakannya lagi, URL-nya akan berubah. Kamu harus update `VITE_API_URL` di Vercel setiap kali URL berubah (kecuali kamu punya domain sendiri).
