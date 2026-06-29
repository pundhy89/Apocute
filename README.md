<div align="center">
  <img width="1200" height="475" alt="ApoCute Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  
  # ApoCute Workspace (Apotek-app)
  ### Sistem Manajemen Apotek & Transaksi Keuangan Modern
  
  [![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](#)
</div>

---

**ApoCute** adalah aplikasi web manajemen apotek modern berbasis **React, Vite, Tailwind CSS, dan TypeScript** yang dirancang khusus untuk mempermudah operasional apotek, mulai dari Point of Sales (POS) Kasir, manajemen stok obat (inventori), database pelanggan/pasien, jadwal dokter jaga, hingga laporan keuangan kasir dan WhatsApp API Integration.

---

## 🚀 Cara Menghubungkan & Push ke GitHub

Karena keterbatasan lingkungan sandbox, push git secara langsung dari terminal agen tidak diizinkan. Anda dapat melakukan sinkronisasi ke repository GitHub Anda (**https://github.com/pundhy89/Apotek-app**) melalui fitur ekspor bawaan di **Google AI Studio**:

1. Klik tombol **Settings** (ikon gerigi) di pojok kanan atas layar Google AI Studio.
2. Pilih opsi **Export to GitHub** atau **Download ZIP**.
3. Jika menggunakan *Export to GitHub*, sambungkan akun GitHub Anda dan pilih repository target `pundhy89/Apotek-app`.
4. Jika mengunduh ZIP, ekstrak file tersebut di komputer lokal Anda, buka terminal di folder tersebut, lalu jalankan perintah berikut:
   ```bash
   git init
   git remote add origin https://github.com/pundhy89/Apotek-app.git
   git branch -M main
   git add .
   git commit -m "Initial commit ApoCute Apotek App"
   git push -u origin main
   ```

---

## 📦 Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- **Node.js** (Versi 18 ke atas)

### Langkah-Langkah
1. Clone repository Anda:
   ```bash
   git clone https://github.com/pundhy89/Apotek-app.git
   cd Apotek-app
   ```
2. Instal seluruh dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan (development mode):
   ```bash
   npm run dev
   ```
4. Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 📱 Panduan Membangun APK Android (Build APK)

Anda dapat mengubah aplikasi web React/Vite ini menjadi aplikasi Android Native (APK) menggunakan **Capacitor** oleh Ionic. Berikut langkah lengkapnya agar orang lain dapat mengunduh dan memasangnya di HP Android:

### Langkah 1: Instalasi Capacitor di Project
Jalankan perintah berikut di folder project Anda untuk menambahkan pustaka Capacitor:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Langkah 2: Inisialisasi Project Capacitor
Inisialisasi konfigurasi Capacitor dengan nama aplikasi dan package ID Anda:
```bash
npx cap init ApoCute com.apocute.app --web-dir=dist
```
*(Pastikan `--web-dir` diarahkan ke `dist` karena Vite mengompilasi build-nya ke folder `dist`).*

### Langkah 3: Tambahkan Platform Android
Tambahkan folder Android ke dalam project Anda:
```bash
npx cap add android
```

### Langkah 4: Kompilasi Web App & Sinkronisasi ke Android
Setiap kali Anda mengubah kode React, lakukan build web dan sinkronisasikan asetnya ke folder Android:
```bash
# Kompilasi aplikasi web React ke folder dist/
npm run build

# Sinkronkan file dari dist/ ke dalam aset Android
npx cap sync
```

### Langkah 5: Membangun File APK Menggunakan Android Studio
1. Buka folder Android di dalam project Anda menggunakan **Android Studio**:
   ```bash
   npx cap open android
   ```
2. Tunggu proses *Gradle Sync* selesai di Android Studio.
3. Untuk membuat APK yang siap diunduh orang lain:
   - Pilih menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Android Studio akan memproses kompilasi dan menampilkan notifikasi pop-up di pojok kanan bawah jika berhasil.
   - Klik tautan **locate** pada notifikasi tersebut untuk menemukan file `app-debug.apk` atau `app-release.apk`.
4. Ganti nama file tersebut menjadi `ApoCute-Apotek-v3.apk`.

### Langkah 6: Membagikan APK untuk Diunduh Orang Lain
Untuk mempermudah orang lain mengunduh dan mencoba aplikasi di HP Android mereka:
1. Unggah file `ApoCute-Apotek-v3.apk` ke bagian **Releases** di repository GitHub Anda:
   - Masuk ke `https://github.com/pundhy89/Apotek-app`
   - Di sisi kanan halaman, klik **Create a new release**.
   - Isi versi tag (misal: `v3.1.0`), tulis deskripsi singkat, lalu seret (*drag and drop*) file APK Anda ke kolom lampiran (*Attach binaries...*).
   - Klik **Publish release**.
2. Orang lain kini dapat mengunduh APK langsung dari tab **Releases** di GitHub Anda dan memasangnya di HP Android!

---

## 🛠️ Fitur Utama Aplikasi
- **Dashboard Utama**: Berisi grafik visual omset, peringatan stok obat kritis, dan tips harian.
- **Point of Sales (POS) Kasir**: Proses transaksi obat cepat dengan pencarian pintar, filter kasir tanpa bocor laba, serta integrasi cetak struk via bluetooth thermal.
- **Alur Keuangan Kas**: Pencatatan pemasukan dan pengeluaran operasional apotek dengan klasifikasi kategori multi-tingkat.
- **Stok Inventori**: Database lengkap untuk melacak obat, stok minimum, unit penjualan, dan obat kedaluwarsa.
- **Loyalty Pelanggan**: Sistem koin loyalty pasien apotek untuk meningkatkan kunjungan ulang.
- **Jadwal Dokter & WA API**: Kelola dokter jaga aktif dan integrasikan dengan sistem pengiriman struk PDF digital via WhatsApp Gateway.
