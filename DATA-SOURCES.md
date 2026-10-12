# Sumber data kanji

Koleksi ini memuat 110 kanji pilihan. Data bacaan onyomi/kunyomi dan jumlah
goresan diambil pada 13 Oktober 2026 dari [kanjiapi.dev](https://kanjiapi.dev/),
yang menyajikan data [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project).

Hak cipta data KANJIDIC2: James William Breen dan Electronic Dictionary
Research and Development Group (EDRDG).

Data adaptasi `kanji-data.js` didistribusikan dengan
[Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Lihat [pernyataan lisensi sumber](https://www.edrdg.org/edrdg/licence.html).

Perubahan: memilih subset kanji, menyederhanakan struktur data, menambahkan
arti berbahasa Indonesia dan contoh kata. Pembagian level mengikuti nilai
`jlpt` API; kanji 分, yang tidak memiliki nilai level di respons sumber,
dimasukkan ke kelompok belajar dasar N5 secara editorial.

Label N5, N4, N3 hanya panduan belajar. Koleksi ini bukan daftar lengkap
atau daftar resmi JLPT. [JLPT tidak menerbitkan daftar kanji resmi](https://www.jlpt.jp/e/faq/).

Pembaruan materi: jalankan `python scripts/build_data.py`, periksa perubahan,
kemudian jalankan `npm test` sebelum diterbitkan kembali. Periksa sumber
sekurang-kurangnya setiap bulan selama koleksi ini dipelihara. Website
menggunakan snapshot lokal sehingga tidak memerlukan akses API saat belajar.
