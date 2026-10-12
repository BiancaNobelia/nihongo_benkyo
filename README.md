# Nihongo Benkyo

Website belajar kanji berbahasa Indonesia dengan desain responsif, dibuat
menggunakan HTML, CSS, dan JavaScript tanpa dependensi aplikasi.

## Fitur

- 2.383 kanji N5–N1 dengan arti Indonesia, bacaan on/kun, dan jumlah goresan.
- N5: 84 · N4: 169 · N3: 387 · N2: 398 · N1: 1.345.
- 2.378 kanji memiliki contoh kata; 5 karakter langka menampilkan keterangan
  belum ada contoh dan tidak masuk kuis bacaan kata.
- Pencarian kanji/arti/bacaan, filter level, simpanan, dan status penguasaan.
- Kanji Mirip: 48 kelompok pilihan berisi 117 kanji, dengan filter kemiripan,
  pencarian, perbandingan berdampingan, ciri pembeda, dan tips mengingat.
- Latihan bentuk per kelompok dan tautan pasangan mirip dari detail kanji.
- Flashcard dengan penilaian mandiri dan pilihan koleksi.
- Kuis arti, kanji, atau bacaan kata; 5/10/20 soal dan timer opsional.
- Hasil kuis, progres penguasaan, dan hari belajar di `localStorage`.

Progres hanya tersedia di browser/perangkat yang sama, tanpa akun atau server.
Koleksi mencakup seluruh snapshot OpenJLPT yang dikunci di repositori, dengan
level komunitas dan kanji tambahan. JLPT tidak menerbitkan daftar kanji resmi.
Seluruh arti Indonesia dan contoh kata telah ditinjau ulang secara editorial
oleh AI pada 13 Oktober 2026, dengan pembetulan pada 1.203 kartu. Hasil tinjauan
disimpan di `data/reviewed-id.json`; build menolak sumber baru yang belum ditinjau.
Arti Inggris tersedia pada detail. Atribusi, batasan, dan prosedur
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
pilihan kuis, validasi progres, tanggal belajar lokal, dan regresi terjemahan.
Pengujian Kanji Mirip memeriksa rujukan karakter, filter yang mempertahankan
pasangan beda level, jumlah goresan, dan pilihan latihan setiap kelompok.
Jalankan `python -m unittest discover -s tests -p "test_*.py"` untuk memastikan
build menolak data baru atau berubah yang belum ditinjau.

Font DM Sans dan Noto Serif JP dimuat dari Google Fonts dengan font sistem
sebagai cadangan. Semua fitur belajar menggunakan data lokal.
