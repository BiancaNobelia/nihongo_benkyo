# Nihongo Benkyo

Website belajar kanji berbahasa Indonesia dengan desain responsif, dibuat
menggunakan HTML, CSS, dan JavaScript tanpa dependensi aplikasi.

## Fitur

- 2.383 kanji N5–N1 dengan arti Indonesia, bacaan on/kun, dan jumlah goresan.
- N5: 84 · N4: 169 · N3: 387 · N2: 398 · N1: 1.345.
- 2.378 kanji memiliki contoh kata; 5 karakter langka menampilkan keterangan
  belum ada contoh dan tidak masuk kuis bacaan kata.
- Pencarian kanji/arti/bacaan, filter level, simpanan, dan status penguasaan.
- Flashcard dengan penilaian mandiri dan pilihan koleksi.
- Kuis arti, kanji, atau bacaan kata; 5/10/20 soal dan timer opsional.
- Hasil kuis, progres penguasaan, dan hari belajar di `localStorage`.

Progres hanya tersedia di browser/perangkat yang sama, tanpa akun atau server.
Koleksi mencakup seluruh snapshot OpenJLPT yang dikunci di repositori, dengan
level komunitas dan kanji tambahan. JLPT tidak menerbitkan daftar kanji resmi.
Arti Indonesia tambahan memakai terjemahan otomatis dengan koreksi terpilih;
arti sumber Inggris tersedia pada detail. Atribusi, batasan, dan prosedur
pembaruan tersedia di [DATA-SOURCES.md](DATA-SOURCES.md).

## Website

https://BiancaNobelia.github.io/nihongo_benkyo/

## Deployment

GitHub Pages menggunakan branch `main` dan folder `/` (root).
Perubahan yang di-push ke `main` akan diterbitkan otomatis.

## Preview lokal

Jalankan `python -m http.server 4173`, lalu buka `http://localhost:4173`.
JavaScript memakai ES modules, sehingga halaman perlu disajikan lewat HTTP.

## Pemeriksaan

Jalankan `npm test` (Node.js 20+) untuk memeriksa kelengkapan data, pencarian,
pilihan kuis, validasi progres, dan tanggal belajar lokal.

Font DM Sans dan Noto Serif JP dimuat dari Google Fonts dengan font sistem
sebagai cadangan. Semua fitur belajar menggunakan data lokal.
