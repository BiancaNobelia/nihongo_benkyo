# Nihongo Benkyo

Website belajar kanji berbahasa Indonesia dengan desain responsif, dibuat
menggunakan HTML, CSS, dan JavaScript tanpa dependensi aplikasi.

## Fitur

- Kuis Kotoba JLPT N3: seluruh 2.276 entri workbook pengguna di `#kotoba/n3`,
  terpisah dari Minna no Nihongo. Filter jenis kata, 1.659 entri inti atau
  617 tambahan, pencarian, lima mode latihan, jumlah custom, dan riwayat skor.
  Arti Indonesia mengikuti terjemahan otomatis sumber dengan koreksi terbatas;
  arti Inggris rujukan bisa dibuka setelah menjawab.
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
- Kuis arti, kanji, atau bacaan kata; 10/20/50 soal atau jumlah custom, dan timer
  opsional. Jumlah dibatasi soal yang tersedia tanpa mengulang soal.
- Materi bercampur otomatis sesuai level latihan, tanpa pilihan materi tambahan.
  Kanji → Hiragana dan katakana mengikuti level kosakata sumber. Penulisan kanji
  dan contoh kata katalog mengikuti kanji tersulit. Arti kata/kanji dan terjemahan kalimat selalu
  muncul setelah jawaban benar, salah, atau waktu habis, serta pada ulasan hasil.
- Kanji → Hiragana · JLPT (kalimat): seluruh 663 soal N5–N1 menampilkan konteks
  kalimat dengan satu target bergaris bawah dan empat pilihan hiragana.
  Setelah menjawab, tampil bacaan, arti kata, dan terjemahan kalimat. Sebanyak
  Bank dasar 464 soal kini dilengkapi 199 adaptasi dari sepuluh PDF N5 pengguna.
  N5 memakai kosakata dasar N5 / Minna no Nihongo I (bab 1–25); 12 konteks lama
  disederhanakan. Kalimat boleh berisi beberapa kanji, hanya target digarisbawahi.
  Pada 398 soal, pilihan juga memakai onyomi/kunyomi lain dari kanji yang sama.
  Bacaan kata alternatif yang sah disaring menggunakan JMdict/KANJIDIC2;
  pembahasan menjelaskan bacaan kanji yang digunakan pada kata soal.
  Riwayat soal yang sudah tampil disimpan di browser: soal yang paling jarang
  tampil didahulukan, termasuk setelah reload atau berpindah level. Sesi baru
  menghabiskan soal yang belum mendapat giliran sebelum mengulang. Sesi yang
  dibatalkan hanya mencatat soal yang benar-benar sudah dibuka. Riwayat ini
  dimulai sejak pembaruan, karena skor lama tidak menyimpan identitas soal.
  Buka langsung melalui `#kuis/jlpt`. Ini latihan buatan, bukan soal resmi ujian.
- Kata/Kanji → Hiragana · Per kata: contoh kosakata katalog tampil tanpa
  kalimat, disertai bacaan dan arti Indonesia setelah menjawab. Mode ini tetap
  memakai contoh kata dari 2.378 kartu katalog dan level kanji penyusunnya.
  Buka melalui `#kuis/reading`. Kedua mode mempertahankan ID riwayat lama.
- Ragam kosakata: kata benda, kata kerja, kata sifat, dan kata keterangan tersedia
  di setiap level. Seluruh soal lama tetap ada; 200 entri baru yang ditinjau
  menambah 184 soal unik setelah duplikasi digabung. Setelah adaptasi PDF: N5 388, N4 73, N3 75,
  N2 65, N1 62. Komposisi bank dan jenis soal ditampilkan di kuis.
- Sesi membaca memilih kelas kata secara seimbang di antara soal yang sama
  jarangnya tampil. Hitungan/tanggal maksimal 20% selama kosakata pada putaran
  tersebut cukup; sesi yang mendekati seluruh bank dapat
  menggunakan sisanya tanpa pengulangan. Contoh 10 soal N5: masing-masing
  2 kata benda, kata kerja, kata sifat, kata keterangan, serta hitungan/tanggal.
  Kata target berbeda diprioritaskan sebelum mengambil variasi konteks kata
  yang sama; riwayat tiap soal tetap dihormati.
- Bacaan khusus: 100 soal tambahan dalam kelompok latihan dasar N5 editorial.
  Ada 44 soal penghitung (本・台・枚・個・冊・匹・杯・人・つ),
  18 nominal ratusan/ribuan yen, 31 tanggal + 2 durasi hari, serta 5 soal bunyi
  kata seperti 中国. Semua masuk otomatis di `#kuis/jlpt`.
  Kedua bacaan `1日` dibedakan lewat konteks; variasi sah tidak dijadikan pengecoh.
- Hiragana → Kanji: 132 soal; Hiragana → Katakana: 50 soal (10 per level).
  Kalimat dengan target bergaris bawah, empat pilihan bentuk mirip,
  arti kalimat, dan penjelasan perbedaannya. Buka `#kuis/hiragana-kanji` atau
  `#kuis/hiragana-katakana`. Jumlah soal disesuaikan dengan materi dan level
  yang tersedia, tanpa mengulang kata dalam satu sesi.
- Materi Kanji Mirip: 82 kosakata yang bisa dilatih dua arah, mencakup seluruh
  48 kelompok perbandingan dan 10 keluarga radikal. Soal masuk otomatis sesuai
  level. Pembahasan menautkan kembali ke perbandingan bentuk. Tautan lama yang
  menyertakan materi tetap membuka mode kuis, tetapi tidak membatasi bank soal.
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
Pengujian pengaturan kuis memeriksa jumlah custom, batas bank, level kanji pada
kata gabungan, dan arti/terjemahan di seluruh mode meskipun tanpa pembahasan.
Pengujian keragaman membaca mencocokkan 200 entri baru dengan metadata kamus,
memastikan semua soal lama tetap ada pada level kosakata sumber, serta menguji
1.800 sesi acak (10/20/50 soal di lima level dan gabungannya) agar keempat kelas
kata terwakili dan hitungan/tanggal tidak mendominasi.
Jalankan `python -m unittest discover -s tests -p "test_*.py"` untuk memastikan
build menolak data baru atau berubah yang belum ditinjau.

Font DM Sans dan Noto Serif JP dimuat dari Google Fonts dengan font sistem
sebagai cadangan. Semua fitur belajar menggunakan data lokal.
