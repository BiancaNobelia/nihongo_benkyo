# Sumber dan cakupan koleksi

Koleksi mencakup **seluruh 2.383 kanji** pada snapshot
[OpenJLPT](https://github.com/evanclan/OpenJLPT/tree/0d1d3410bec90bd4098a7c72de820543cb4f707c)
commit `0d1d3410bec90bd4098a7c72de820543cb4f707c`, diambil 13 Oktober 2026.

| Kelompok belajar | Jumlah |
| --- | ---: |
| N5 | 84 |
| N4 | 169 |
| N3 | 387 |
| N2 | 398 |
| N1 | 1.345 |
| Total unik | 2.383 |

Level mengikuti daftar komunitas [Jonathan Waller](https://www.tanos.co.uk/jlpt/)
dan 172 kanji joyo tambahan dari OpenJLPT. Label ini merupakan panduan belajar,
**bukan silabus resmi atau jaminan cakupan ujian**.
[JLPT tidak menerbitkan daftar kanji resmi](https://www.jlpt.jp/e/faq/).
Pengelompokan lama situs diperbarui mengikuti sumber lima level ini;
progres yang tersimpan tetap dipertahankan berdasarkan karakter.

## Asal data dan atribusi

- Bacaan, arti sumber Inggris, dan jumlah goresan:
  [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project), melalui OpenJLPT.
- Contoh kata dan bacaan: daftar Jonathan Waller dan
  [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) melalui OpenJLPT;
  contoh tambahan diambil dari JMdict melalui [kanjiapi.dev](https://kanjiapi.dev/)
  pada 13 Oktober 2026.
- Hak cipta KANJIDIC2/JMdict: James William Breen dan Electronic Dictionary
  Research and Development Group (EDRDG), digunakan sesuai
  [ketentuan lisensi EDRDG](https://www.edrdg.org/edrdg/licence.html).
- OpenJLPT dan kontributornya: penyusunan data serta perbaikan sumber.
  [NOTICE asli](data/licenses/OpenJLPT-NOTICE.md) disertakan utuh.
  Situs ini tidak memakai kalimat Tatoeba, diagram KanjiVG, atau materi tata
  bahasa yang turut disebut dalam NOTICE tersebut.

Data adaptasi (`kanji-data.js` dan berkas data turunannya) didistribusikan
dengan [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
[Teks lisensi](data/licenses/CC-BY-SA-4.0.txt) disertakan.

Perubahan dari sumber: struktur disederhanakan, satu contoh kata kamus dipilih
per kanji, tambahan contoh dari kanjiapi.dev, arti Indonesia ditambahkan,
dan 110 kartu lama dipertahankan. Arti Indonesia baru menggunakan terjemahan
otomatis Google Translate yang disimpan saat penyusunan data, dengan koreksi
manual terpilih di `data/translation-overrides.json`. Arti Inggris asli tampil
pada detail sebagai pembanding. Terjemahan belum seluruhnya ditinjau oleh
pengajar; konteks dan nuansa tetap perlu dirujuk pada kamus.

Sebanyak **2.378** kanji memiliki contoh kata. Karakter **赳, 舜, 彪, 崚, 晟**
belum memiliki contoh dalam sumber yang digunakan. Kartu tetap tersedia,
menampilkan keterangan tersebut, dan dilewati dalam kuis bacaan kata.

## Reproduksi dan pembaruan

Website memakai snapshot lokal dan tidak memanggil layanan kamus atau
terjemahan ketika pengguna belajar.

Untuk membangun ulang hasil yang sama tanpa jaringan (Python 3):

```sh
python scripts/build_data.py
npm test
```

`data/source-lock.json` mengunci versi OpenJLPT; `catalog-source.json` menyimpan
data sumber yang digunakan, `translations-id.json` menyimpan terjemahan,
`curated.json` mempertahankan materi awal, dan `catalog-manifest.json`
menyimpan jumlah serta daftar karakter per level untuk audit kelengkapan.

Untuk mengambil ulang sumber: `python scripts/import_catalog.py`, kemudian
`python scripts/prepare_catalog.py`. `python scripts/translate_catalog.py`
mengisi terjemahan yang belum tersedia melalui layanan Google Translate.
Periksa hasil, perbarui koreksi manual, bangun ulang, lalu jalankan pengujian.
Jika mengganti commit sumber, bersihkan cache `.cache/openjlpt` sebelumnya.
Tinjau versi sumber secara berkala, setidaknya bulanan selama data ini
didistribusikan, agar mengikuti pembaruan kamus EDRDG.
