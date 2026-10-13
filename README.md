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
- Kanji Mirip juga menyediakan 10 keluarga radikal/komponen dengan 824 kanji
  unik: air, perjalanan, kayu, tangan, hati, ucapan, benang, tumbuhan, orang,
  dan logam. Keluarga air berisi 130 kanji (123 dengan 氵), perjalanan 55.
  Contoh pembeda, pencarian (termasuk romaji contoh), filter level/bentuk,
  pagination, dan tautan dari detail tersedia di `#mirip`.
- Flashcard dengan penilaian mandiri dan pilihan koleksi.
- Kuis arti, kanji, atau bacaan kata; 5/10/20 soal dan timer opsional.
- Bacaan ala JLPT: 280 soal N5–N1 dengan pilihan hiragana
  yang mirip, arti Indonesia, dan penjelasan bunyi panjang, dakuten, serta kana kecil.
  Buka langsung melalui `#kuis/jlpt`. Ini latihan buatan, bukan soal resmi ujian.
- Bacaan khusus: 100 soal tambahan yang dikelompokkan sebagai latihan dasar
  N5 secara editorial. Ada 44 soal penghitung (本・台・枚・個・冊・匹・杯・人・つ),
  18 nominal ratusan/ribuan yen, 31 tanggal + 2 durasi hari, serta 5 soal bunyi
  kata seperti 中国. Pilih **Materi soal**, atau buka `#kuis/jlpt/bacaan-khusus`.
  Kedua bacaan `1日` dibedakan lewat konteks; variasi sah tidak dijadikan pengecoh.
- Hiragana → Kanji: 132 soal; Hiragana → Katakana: 50 soal (10 per level).
  Kalimat dengan target bergaris bawah, empat pilihan bentuk mirip,
  arti kalimat, dan penjelasan perbedaannya. Buka `#kuis/hiragana-kanji` atau
  `#kuis/hiragana-katakana`. Jumlah soal disesuaikan dengan materi dan level
  yang tersedia, tanpa mengulang kata dalam satu sesi.
- Materi Kanji Mirip: 82 kosakata yang bisa dilatih dua arah, mencakup seluruh
  48 kelompok perbandingan dan 10 keluarga radikal. Pilih materi di pengaturan
  kuis atau mulai dari halaman kelompok. Pembahasan menautkan kembali ke
  perbandingan bentuk. Contoh: `#kuis/hiragana-kanji/radikal-air`,
  `#kuis/jlpt/radikal-perjalanan`, atau `#kuis/jlpt/similar`.
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
Pengujian bacaan ala JLPT mencocokkan bank soal dengan snapshot sumber, memeriksa
kemiripan pengecoh, pengacakan, cakupan level, dan kompatibilitas riwayat lama.
Pengujian penulisan juga memeriksa kesesuaian hiragana–katakana, bentuk kanji,
okurigana, penempatan target kalimat, serta batas jumlah soal per level.
Pengujian Kanji Mirip memeriksa rujukan karakter, filter yang mempertahankan
pasangan beda level, jumlah goresan, dan pilihan latihan setiap kelompok.
Pengujian radikal memeriksa cakupan keluarga, bentuk yang tidak boleh tertukar,
pencarian, gabungan filter, dan pagination seluruh anggota.
Pengujian soal Kanji Mirip memeriksa 82 rujukan kosakata, kedua arah latihan,
pengecoh dan ejaan alternatif, konteks, cakupan 58 kelompok, penggabungan bank
tanpa duplikasi, serta kombinasi materi dan level.
Pengujian bacaan khusus memeriksa perubahan bunyi per penghitung, nominal yen,
seluruh tanggal 1–31, dua konteks `1日`, pilihan yang diminta pengguna, variasi
bacaan yang sah, serta pemisahan filter bacaan dari soal penulisan/Kanji Mirip.
Jalankan `python -m unittest discover -s tests -p "test_*.py"` untuk memastikan
build menolak data baru atau berubah yang belum ditinjau.

Font DM Sans dan Noto Serif JP dimuat dari Google Fonts dengan font sistem
sebagai cadangan. Semua fitur belajar menggunakan data lokal.
