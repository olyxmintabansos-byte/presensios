# 💠 PresensiOS (HadirKu Enterprise)

> **Sistem Presensi & Absensi Karyawan/Siswa Digital Modern — Anti-AI Slop, Local-First, Zero Backend, dan 100% Client-Side.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Pure Vanilla JS](https://img.shields.io/badge/Vanilla-JS%20ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3 Modern](https://img.shields.io/badge/CSS3-Modern%20Dark%20Slate-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![WebRTC](https://img.shields.io/badge/WebRTC-Live%20Camera%20Biometric-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=githubpages&logoColor=white)](https://olyxmintabansos-byte.github.io/presensios/)

---

## 🌟 Demo Langsung
Kunjungi aplikasi live tanpa instalasi apa pun:  
👉 **[https://olyxmintabansos-byte.github.io/presensios/](https://olyxmintabansos-byte.github.io/presensios/)**

---

## 🎯 Mengapa PresensiOS?
Sebagian besar aplikasi absensi open-source di internet menggunakan teknologi lawas (PHP Native, XAMPP, Bootstrap 3/4) yang tidak bisa dijalankan langsung di browser modern tanpa konfigurasi server yang rumit. 

**PresensiOS** hadir dengan filosofi **Local-First & Client-Side SPA**:
* ⚡ **Tanpa Setup Server:** Cukup buka di browser HP atau laptop, langsung jalan 100%.
* 🛡️ **Verifikasi Biometrik Nyata:** Snapshot langsung dari kamera dengan burning watermark permanen (Nama, NIP, Tanggal, Jam WIB, Koordinat GPS, dan Checksum Validasi).
* 📍 **Smart Geofencing Radar:** Menggunakan rumus matematika **Haversine Formula** untuk menghitung jarak presisi ke titik koordinat kantor dengan animasi radar interaktif.
* 🟩 **Rumput Kehadiran (Attendance Heatmap):** Grid streak kehadiran karyawan bergaya GitHub Contribution Graph untuk memicu motivasi disiplin.
* 👥 **Dual Perspective Switcher:** Mode *Kiosk Absen* untuk karyawan dan *HR Command Center* untuk admin/manajemen.
* 📥 **Audit & Export 1-Klik:** Unduh rekap presensi dalam format `.csv` (Excel-ready) atau cetak lembar audit resmi.
* 🔊 **Sintesis Audio Web Audio API:** Efek suara autentik tanpa dependensi file MP3 eksternal.

---

## 🛠️ Fitur Unggulan

### 1. 📸 Live Biometric Camera & Watermark Burner
* Feed kamera langsung via WebRTC (`getUserMedia`).
* Bingkai oval wajah dengan efek animasi pemindaian laser (*laser scan line*).
* **Biometric Fallback Simulator:** Jika perangkat tidak memiliki webcam atau izin ditolak, sistem otomatis mengaktifkan simulator wireframe biometrik interaktif agar pengujian tetap berjalan mulus.
* Otomatis membakar metadata verifikasi ke dalam foto canvas (anti-pemalsuan).

### 2. 📍 Geofencing Radar Interaktif (Haversine Formula)
* Menghitung jarak pengguna terhadap titik koordinat pusat (default: *Menara Graha Jakarta*).
* Tombol simulasi cepat: `[ 📍 Simulasikan Di Kantor (0m) ]` dan `[ 🏖️ Simulasikan Luar Radius (750m) ]` untuk memudahkan demonstrasi fitur.

### 3. ⏱️ Deteksi Shift & Keterlambatan Otomatis
* Target jam masuk kerja: **08:00 WIB**.
* Masuk <= 08:00 ➔ **Tepat Waktu** (Badge Hijau Emerald).
* Masuk > 08:00 ➔ **Terlambat** (Badge Kuning Amber + hitungan menit denda keterlambatan).
* Form pengajuan Cuti, Sakit (Surat Dokter), Izin Mendesak, dan Dinas Lapangan.

### 4. 🛡️ HR Command Center
* 4 Kartu KPI: Tingkat Kehadiran (%), Total Hadir, Terlambat, dan Izin.
* Tabel log audit real-time dengan pencarian cepat Nama/NIP dan filter divisi.
* Modal Verifikasi Biometrik beresolusi penuh saat thumbnail foto diklik.
* Fitur **Export to CSV** dan **Cetak Rekap Laporan**.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/olyxmintabansos-byte/presensios.git
   cd presensios
   ```
2. **Buka langsung:**
   Cukup klik ganda file `index.html` pada browser favorit Anda (Google Chrome, Microsoft Edge, Safari, Firefox). Tidak memerlukan Node.js, PHP, atau MySQL!

---

## 🎨 Standar Desain Anti-AI Slop
* **Palet Warna:** Slate Modern (`#0B0F17`, `#111827`, `#1F2937`) dengan aksen Emerald (`#10B981`) dan Amber (`#F59E0B`).
* **Tipografi:** Bersih, tajam, dan mudah dibaca (`Inter, system-ui`).
* **Komponen:** Desain berfokus pada fungsi nyata tanpa elemen kosmetik palsu.

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Bebas digunakan untuk keperluan komersial, edukasi, maupun portofolio.
