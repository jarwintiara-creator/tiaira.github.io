# TIAIRA FASHBEAUTY - Web Store Front-End

Website Toko Online Fashion & Beauty modern dan responsif tanpa framework, menggunakan HTML, CSS, JavaScript murni, dan terintegrasi dengan Firebase Authentication serta layanan pemesanan berbasis WhatsApp.

---

## 🚀 Cara Menjalankan Aplikasi

1. Buat folder baru di komputer Anda (misal: `tiaira-store`).
2. Buat empat file di dalam folder tersebut:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. Salin kode di atas ke masing-masing file yang sesuai.
4. Buka `index.html` menggunakan browser atau ekstensi Live Server di VS Code.

---

## 🔥 Langkah Setup Firebase Authentication

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
2. Tambahkan aplikasi Web (`</>`) di proyek Anda.
3. Masuk ke menu **Authentication** -> **Get Started** -> aktifkan penyedia **Email/Password**.
4. Salin `firebaseConfig` dari Project Settings dan tempelkan ke bagian atas file `script.js`.

---

## ⚠️ Batasan Sistem
- Transaksi dan pesanan dikelola secara manual via WhatsApp.
- Tidak ada database pesanan otomatis yang tersimpan di server.
