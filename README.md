# Nihongo Benkyo

Website belajar kanji berbahasa Indonesia dengan desain responsif, dibuat
menggunakan HTML, CSS, dan JavaScript tanpa dependensi aplikasi.

## Fitur

- Kuis Kanji → Arti menampilkan onyomi/kunyomi di bawah soal dan mengungkap
  kanji serta bacaan pada semua pilihan setelah menjawab. Kuis Kotoba juga
  menampilkan pasangan kata, bacaan, dan arti untuk seluruh pilihan pada
  kelima mode, termasuk saat waktu habis. Data pilihan tetap terhubung ke
  kata sumber setelah diacak; jawaban belum dibocorkan sebelum dijawab.
- Kuis Dokkai di `#dokkai`: 15 bacaan adaptasi KCよむよむ dan 60 soal
  pilihan ganda. Level latihan N5/N4/N3 masing-masing 20 soal (perkiraan
  editorial, bukan padanan resmi JF Standard atau soal resmi JLPT).
  Pilih 10/20/50/kustom, timer bebas/3/5 menit per bacaan, dan furigana.
  Semua pertanyaan dalam satu bacaan diperiksa bersama sebelum terjemahan
  dan bukti paragraf dibuka. Ada riwayat tampil, skor, ulasan, dan ulangi salah.
  Sumber, penulis, perubahan, dan lisensi CC BY-NC 2.1 JP ditautkan per bacaan.
  Validasi: `node --test tests/dokkai.test.mjs`.
- Tema Light/Dark tersedia di header setiap halaman. Kunjungan awal mengikuti
  tema perangkat; pilihan manual tersimpan dengan kunci `nihongo-benkyo-theme-v1`
  dan tidak mengubah progres belajar. `theme.js` diterapkan sebelum stylesheet
  dimuat untuk menghindari kilatan tema yang salah. Palet bersama ada di
  `theme.css`; komponen modul menggunakan token warna yang sama.
- Koleksi kanji menampilkan onyomi dan kunyomi dengan label terpisah, arti
  yang lebih besar, serta hingga tiga bacaan per jenis tanpa elipsis. Jumlah
  bacaan tambahan ditampilkan pada kartu; semua bacaan tersedia di detail.
  Detail kanji dan flashcard juga memakai ukuran bacaan yang lebih besar.
- Kuis Henkan: pilihan ganda atau ketik sendiri untuk kata kerja, kata sifat,
  dan kata benda. Kata benda menyediakan empat bentuk predikat: negatif,
  lampau, negatif lampau, dan penghubung で. Bank noun mengikuti kosakata
  Minna I–II dan N3; riwayat soalnya disimpan terpisah dari jenis kata lain.
  Jawaban ketik menerima hiragana/katakana dan ejaan kanji yang tersedia,
  termasuk varian yang didukung bank; sonkei mengikuti pola yang diminta.
  Jumlah 10/20/30/50/kustom dan timer bebas/15/30 detik dipilih lewat tombol.
  Mode jawaban ikut tersimpan dalam riwayat. Validasi:
  `node --test tests/henkan-answer.test.mjs tests/henkan-nouns.test.mjs`.
  Bangun ulang bank noun: `node scripts/build_henkan_nouns.mjs`.
- Kuis Jidōshi–Tadōshi di `#jidoushi`: 29 pasangan dari dua foto pengguna,
  116 soal kalimat Indonesia, dan tepat dua pilihan. Pilih kata kerja bentuk
  ます atau tentukan jenisnya. Sesudah menjawab, tampil kalimat Jepang dengan
  furigana, alasan, serta kedua kata dalam bentuk kamus, ます, dan て.
  Jumlah 10/20/50/custom, filter pasangan, timer, riwayat, ulasan, dan ulangi
  jawaban salah. Bangun ulang: `node scripts/build_transitivity.mjs`;
  validasi: `node --test tests/transitivity.test.mjs`.
- Kuis Partikel di `#partikel`: 210 kalimat dalam 21 topik, mencakup
  へ・に・で・の・は・も・が・を・と・から・か・しか・とか serta
  への・での・では・には・へは・のは・のに・のでは.
  Pilih topik, 10/20/50 soal atau custom, dan timer opsional. Setelah menjawab,
  tampil arti Indonesia, furigana, pola, serta alasan pemilihan partikel.
  Soal yang belum tampil didahulukan, dengan skor dan ulasan jawaban.
  Bangun ulang: `node scripts/build_particles.mjs`;
  validasi: `node --test tests/particles.test.mjs`.
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
- Kanji → Hiragana · JLPT (kalimat): seluruh 863 soal N5–N1 menampilkan konteks
  kalimat dengan satu target bergaris bawah dan empat pilihan hiragana.
  Setelah menjawab, tampil bacaan, arti kata, dan terjemahan kalimat.
  Bank dasar 464 soal dilengkapi 199 adaptasi PDF N5 dan 200 adaptasi PDF N4 pengguna.
  N5 memakai kosakata dasar N5 / Minna no Nihongo I (bab 1–25); 12 konteks lama
  disederhanakan. N4 memakai kosakata hingga N4 / Minna no Nihongo I–II
  (bab 1–50), termasuk kosakata dasar N5 dalam latihan N4. Salah ketik dan
  pilihan yang tertukar pada PDF dibetulkan; soal menulis diadaptasi ke membaca.
  Kalimat boleh berisi beberapa kanji, hanya target digarisbawahi.
  Pada 536 soal, pilihan juga memakai onyomi/kunyomi lain dari kanji yang sama.
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
  menambah 184 soal unik setelah duplikasi digabung. Setelah adaptasi PDF: N5 388, N4 273, N3 75,
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

### Kuis Henkan

Menu `#henkan` melatih perubahan 1.201 kata kerja: N5 (178), N4 (363),
dan N3 (660), dari kotoba Minna I–II, kompilasi N3, serta contoh dan soal
kanji yang sudah tersedia. Pilih satu atau beberapa bentuk: futsū-kei,
jisho-kei, te-kei, ta-kei, nai-kei, potensial, pasif, ikō-kei (niat/ajakan),
meirei-kei (perintah), kinshi-kei (larangan), jōken-kei (syarat ～ば),
shieki-kei (kausatif), dan sonkei-kei (hormat). Total 13 pilihan latihan.

Futsū-kei mencakup empat pasangan bentuk sopan → biasa, termasuk negatif
lampau. Pilihan yang tumpang tindih digabung. Level memilih kosakata, bukan
membatasi bentuk tata bahasa. Verba yang sudah terkonjugasi dinormalisasi
ke bentuk dasar; potensial/pasif yang kurang cocok tanpa konteks tidak diujikan.
Sonkei memakai tindakan manusia yang ditinjau dalam `henkan-honorific.js`,
dengan konteks membicarakan tindakan guru kepada teman. Soal menyebutkan
pola hormat yang diminta: bentuk khusus, お＋batang ます＋になる,
～する → ～なさる, atau ～（ら）れる. Kata yang sudah hormat/rendah hati
dan perubahan keadaan benda tidak otomatis diberi awalan kehormatan.
Varian benar seperti 食べよ/食べろ, せよ/しろ, bentuk kausatif singkat,
serta alternatif sonkei tidak dijadikan pengecoh.

Jumlah soal 10, 20, 50, atau custom, dengan timer opsional. Arti, golongan,
pola perubahan dan tabel bentuk tersedia setelah menjawab. Soal yang belum
tampil diprioritaskan melalui riwayat lokal, dengan variasi kata kerja dan
bentuk. Skor, ulasan jawaban, dan latihan ulang jawaban salah tersedia.

Bangun ulang data terkurasi tanpa jaringan:
`node scripts/build_henkan.mjs`. Validasi: `node --test tests/henkan*.test.mjs`.

https://BiancaNobelia.github.io/nihongo_benkyo/

## Kuis Bunpou

Menu `#bunpou` memuat 1.330 soal melengkapi kalimat dari seluruh 330 pola dalam
kompilasi Excel Minna no Nihongo bab 1–50. Pilih bab satu per satu, rentang,
Buku I, atau Buku II; jumlah soal 10, 20, 50, atau custom, dengan timer opsional.
Setiap soal memiliki empat pilihan dan petunjuk maksud kalimat. Setelah menjawab,
arti kalimat, pola, rumus, dan catatan selalu ditampilkan. Ringkasan pola juga
bisa dicari sebelum latihan melalui bagian “Jelajahi pola”.

Soal tidak berulang dalam satu sesi, dan soal yang belum tampil diprioritaskan
pada sesi berikutnya menggunakan riwayat browser. Hasil tersimpan di Progres
Saya, disertai ulasan dan latihan ulang jawaban salah. Jumlah soal dibatasi
oleh bank dalam bab yang dipilih.

Bangun ulang secara offline dengan `python scripts/build_bunpou.py`.
Untuk mengimpor workbook yang diberikan pengguna, tambahkan
`--workbook "path/Bunpou_Minna_no_Nihongo_Bab_1-50.xlsx"` (memerlukan openpyxl).
Snapshot sumber, koreksi, dan pilihan jawaban ada di `data/bunpou-*`.
Validasi: `node --test tests/bunpou.test.mjs`.

### Susun Kalimat

Di menu Bunpou, pilih **Susun kalimat**, atau buka `#bunpou/susun`.
Seluruh 330 pola memiliki latihan menyusun potongan kata/frasa yang diacak.
Arti Indonesia, pola, rumus, dan bab tampil sebelum menjawab. Ketuk potongan
untuk menambahkannya; ketuk di area susunan untuk mengembalikan potongan,
atau gunakan Reset. Cek jawaban aktif setelah semua potongan digunakan.

Identitas potongan tetap berbeda meskipun teksnya sama (misalnya dua `を`),
tetapi penilaian membandingkan teks sehingga keduanya boleh tertukar.
Alternatif susunan yang sudah ditinjau turut diterima. Bank tidak memakai
pemeriksa tata bahasa bebas; alternatif ditambahkan per contoh, dengan
mempertahankan peran partikel dan makna kalimat. Pengacakan tidak menampilkan
susunan yang sudah benar sejak awal.

Timer, jumlah soal, ulasan, dan latihan ulang mengikuti pengaturan Bunpou.
Riwayat kemunculan soal dipisahkan dari mode Lengkapi Kalimat; hasil tetap
tercatat di Progres Saya dengan label **Bunpou · Susun kalimat**.
Validasi: `node --test tests/bunpou*.test.mjs`.

### Tambahan soal per bab

Setiap bab memiliki 20 soal tambahan, sehingga tersedia 25–32 soal per bab
untuk kedua mode. Semua 330 contoh sumber dan ID riwayat lama dipertahankan.
Katalog pola tetap berisi 330 pola; jumlah soal ditampilkan terpisah.
Soal baru memakai kosakata dari bab yang dipilih atau bab sebelumnya dalam
workbook Kotoba pengguna, dengan perubahan verba sesuai pola Bunpou.

`data/bunpou-wordsets.txt` menyimpan kosakata, bacaan, arti, dan rujukan baris
Kotoba. `data/bunpou-families.txt` menyimpan konteks latihan dan pilihan jawaban.
`scripts/build_bunpou_expansion.py` memeriksa batas bab, kelengkapan furigana,
kalimat unik, dan target jawaban saat build. Alternatif susunan frasa yang
ditinjau disimpan dalam `data/bunpou-expansion-order.json`.
Soal dibuat saat build, sehingga latihan tetap bekerja tanpa layanan tambahan.
Pengacakan meratakan giliran pola dalam kelompok soal dengan jumlah kemunculan
yang sama, dan tetap mendahulukan soal yang belum pernah tampil.

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

### Pilihan bacaan per kata

Mode **Kata/Kanji → Hiragana · Per kata** memakai pengecoh ejaan dekat,
campuran onyomi–kunyomi pada satu atau dua kanji, serta bacaan dari kelompok
bentuk mirip. Tiga contoh editorial: 午前 → ごご／ごまえ／うままえ,
本 → ぽん／き／もく, dan 右 → ひだり／ともだち／いし.
`word-reading-options.js` menyusun pilihan dari katalog yang sudah ada,
mengecualikan bacaan sah dari snapshot kamus untuk seluruh 2.249 ejaan unik,
dan tidak menebak pemisahan
bacaan tidak beraturan. Arti dan penjelasan bacaan komponen soal muncul setelah
menjawab. Mode JLPT dalam kalimat tetap memakai bank pengecohnya sendiri.
Validasi: `node --test tests/word-reading-options.test.mjs`.
