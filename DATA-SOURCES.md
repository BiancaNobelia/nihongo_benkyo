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
dan 110 kartu lama dipertahankan.

## Tinjauan bahasa Indonesia — 13 Oktober 2026

Seluruh **2.383 arti kanji dan 2.378 contoh kata** telah dibaca dan ditinjau
ulang secara editorial oleh AI. Draf awal berasal dari Google Translate dan
materi awal situs; hasil tinjauan lengkap kini menjadi sumber utama di
`data/reviewed-id.json`. Ini bukan pemeriksaan tersertifikasi oleh pengajar.

Pembetulan mencakup **1.203 kartu**, dengan **831 arti kanji** dan **837 arti
contoh kata** berubah. Satu kartu dapat memiliki kedua jenis perubahan.
Fokusnya adalah memilih makna sesuai kata Jepang dan bacaannya, memperjelas
kata kerja serta istilah khusus, memperbaiki ejaan, dan menyamakan arti kata
yang digunakan di beberapa kartu. Catatan sebelum/sesudah tersedia di
`data/translation-review.json`.

Contoh pembetulan: 時計 menjadi *jam*, 寝坊 menjadi *bangun kesiangan*, 心臓
menjadi *jantung*, dan 乾杯 menjadi *bersulang*. Contoh yang tidak cocok dengan
bacaannya atau kurang berguna diganti, antara lain 溝（みぞ）, 甲板（かんぱん）,
彦星（ひこぼし）, 楓（かえで）, dan 𠮟る（しかる）.

Kasus tersebut diperiksa terhadap JMdict melalui kanjiapi.dev. Makna terpilih
juga dibandingkan dengan [Kanjipedia](https://www.kanjipedia.jp/), termasuk
[鵬](https://www.kanjipedia.jp/kanji/0006413300),
[璧](https://www.kanjipedia.jp/kanji/0006235900),
[挫傷](https://www.kanjipedia.jp/kotoba/0002486900), dan
[溝](https://www.kanjipedia.jp/kanji/0002288700).
Rujukan dan cuplikan data JMdict disimpan di `data/review-references.json`.
Arti Inggris tersedia sebagai pembanding; arti Inggris yang salah memilih
makna turut diperbaiki pada kasus tersebut. Sumber asli tetap disimpan utuh
di `catalog-source.json`. Arti pada kartu diringkas untuk belajar dan tidak
mencakup seluruh kemungkinan makna dalam semua konteks.

Sebanyak **2.378** kanji memiliki contoh kata. Karakter **赳, 舜, 彪, 崚, 晟**
belum memiliki contoh dalam sumber yang digunakan. Kartu tetap tersedia,
menampilkan keterangan tersebut, dan dilewati dalam kuis bacaan kata.

## Reproduksi dan pembaruan

### Kelompok Kanji Mirip

`similar-data.js` berisi **48 kelompok pilihan dengan 117 karakter unik**
dari koleksi yang sama. Kelompok disusun secara editorial berdasarkan bentuk
visual: goresan tambahan, panjang/posisi garis, atau komponen yang berbeda.
Ini bukan daftar lengkap seluruh hubungan kemiripan dalam 2.383 kanji.
Arti, level, bacaan, dan jumlah goresan selalu mengambil data dari katalog
yang telah ditinjau, sehingga tidak ada salinan arti terpisah.

Petunjuk pembeda menjelaskan bentuk cetak yang ditampilkan; tips merupakan
alat bantu ingatan, bukan klaim asal-usul karakter. Variasi cetak dan tulisan
tangan tetap dimungkinkan. Acuan bentuk termasuk
[Kanjipedia: 未](https://www.kanjipedia.jp/kanji/0006595900) dan
[pedoman bentuk kanji Badan Urusan Kebudayaan Jepang](https://www.bunka.go.jp/seisaku/kokugo_nihongo/kokugo_shisaku/joyokanjihyo_sakuin/pdf/3-2.pdf),
yang juga menjelaskan bahwa panjang garis 土/士 sebagai komponen dapat bervariasi.
Tidak ada gambar atau dataset diagram goresan eksternal yang disalin.

### Keluarga radikal dan komponen

Tab Kanji Mirip juga memiliki **10 keluarga dengan 824 karakter unik** dari
katalog yang sama. `radical-members.js` mengambil label komponen utama dari
[KanjiVG r20260714](https://github.com/KanjiVG/kanjivg/releases/tag/r20260714),
© 2009–2026 Ulrich Apel dan kontributor, dengan
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
[Atribusi dan perubahan](data/licenses/KanjiVG-NOTICE.md) disertakan.
Lisensi 3.0 ini berlaku untuk ekstrak komponen; data kamus lain tetap mengikuti
lisensi yang dijelaskan sebelumnya. Tidak ada diagram atau path SVG yang disalin.

Ekstraksi memeriksa bentuk utuh dan komponen langsungnya pada seluruh 2.383
kanji; seluruhnya ditemukan pada sumber. Komponen bertanda parsial dan bagian
yang lebih dalam tidak dipakai agar 木 di dalam 禾 atau 亻 di dalam 彳 tidak
menjadi anggota yang menyesatkan. Komponen visual tidak harus sama dengan
radikal kamus: 酒 tetap termasuk 氵. Batas ini berarti daftar bukan pencarian
semua subkomponen tersembunyi, misalnya 氵 di dalam 落. Cakupan juga terbatas
pada katalog situs, bukan seluruh karakter Jepang.

Keluarga air memuat 130 kanji: 123 dengan 氵, 5 dengan 水, dan 2 dengan 氺.
Keluarga perjalanan memuat 55 kanji dengan ⻌ atau 辶. Keluarga lain: 木, 扌/手,
忄/心/⺗, 言, 糸, 艹, 亻 (ditambah bentuk dasar 人), dan 金. Satu kanji dapat
masuk beberapa keluarga, seperti 休 pada orang dan kayu.

`radical-data.js` memuat tema, contoh, dan petunjuk Indonesia yang disusun
secara editorial. Tema hanya alat bantu ingatan, bukan klaim bahwa setiap
anggota bermakna sama atau penjelasan etimologi. Arti dan bacaan daftar
menggunakan katalog Indonesia yang sudah ditinjau. Contoh utama 水, 洗う,
注意, 道, 毎週, dan 通る menjelaskan perbedaan bentuk dasar dan bentuk samping,
serta perluasan makna seperti 注 pada 注意 dan 週 untuk pekan.

`data/radical-source.json` mengunci URL rilis dan SHA-256 sumber. Untuk
mereproduksi ekstraksi: `python scripts/build_radicals.py --download`, lalu
`npm test`. Setelah cache tersedia, jalankan tanpa `--download` untuk bekerja
tanpa jaringan. Perubahan arsip dengan versi yang sama ditolak sampai sumber
ditinjau ulang. Semua data yang dipakai browser tersedia lokal.

### Kuis bacaan ala JLPT

`jlpt-reading-data.js` berisi 100 soal latihan buatan, masing-masing 20 kosakata
untuk N5, N4, N3, N2, dan N1. Bacaan serta level diambil dari berkas
`data/json/vocab/n5.json` sampai `n1.json` pada commit OpenJLPT yang dikunci di atas.
`data/jlpt-reading-source.json` menyimpan metadata sumber yang digunakan, termasuk
bacaan alternatif yang tercatat. Arti Indonesia, pilihan pengecoh, dan penjelasan
disusun secara editorial pada 13 Oktober 2026. Data adaptasi ini juga tersedia
dengan CC BY-SA 4.0 dan atribusi EDRDG/OpenJLPT sebagaimana di atas.

Setiap soal memiliki satu jawaban dan tiga pilihan hiragana yang sengaja mirip,
bukan tiga bacaan acak dari kata lain. Pemeriksaan otomatis memastikan pilihan
pengecoh berbeda dari bacaan yang diterima sumber, dan berjarak paling banyak dua
perubahan kana dari jawaban. Soal mencakup bunyi panjang, dakuten/handakuten,
kana kecil, serta pergantian bunyi dalam gabungan kanji. Arti dan penjelasan baru
ditampilkan setelah pengguna menjawab.

Bank ini merupakan pilihan latihan, **bukan seluruh kosakata JLPT maupun soal
ujian resmi**. Formatnya merujuk latihan membaca kanji pada
[bagian kosakata JLPT](https://www.jlpt.jp/e/guideline/testsections.html).
Tidak ada kalimat contoh Tatoeba atau soal resmi yang disalin.

### Kuis penulisan kanji dan katakana

`writing-data.js` menambahkan 50 soal Hiragana → Kanji dan 50 soal Hiragana →
Katakana, masing-masing 10 per level N5–N1. `data/writing-source.json` menyimpan
bacaan, kosakata, level, dan ID sumber dari snapshot OpenJLPT yang sama.
Level ini mengikuti daftar komunitas sumber dan tidak menyatakan tingkat
kesulitan setiap kalimat atau batas resmi materi JLPT.

Kalimat, terjemahan Indonesia, pengecoh, dan pembahasan ditulis khusus untuk
website ini. Format target bergaris bawah mengikuti contoh visual dari pengguna;
kalimat latihan tidak menyalin workbook. Untuk 飲む, soal memakai bentuk sopan
lampau 飲みました / のみました. Bentuk lain mengikuti ejaan sumber. Terjemahan
dirumuskan sesuai konteks, termasuk 半分 sebagai “setengah”, bukan arti Inggris
“half minute” yang keliru pada entri sumber tersebut.

Pilihan salah mengganti bagian kanji yang mirip atau membedakan katakana seperti
シ・ツ, ン・ソ, レ・ル, dakuten, dan huruf kecil. Pilihan kanji mempertahankan
okurigana; pilihan katakana hanya berisi katakana dan tanda panjang ー. Pemeriksaan
otomatis memastikan satu jawaban, empat pilihan unik, kedekatan ejaan, serta
kesesuaian bacaan dengan sumber. Varian ejaan yang benar dikecualikan dari pilihan pengecoh. Semua arti dan penjelasan ditampilkan setelah jawaban dikunci.

Materi ini merupakan latihan buatan, bukan soal resmi atau seluruh kosakata JLPT.
Atribusi dan CC BY-SA 4.0 untuk data adaptasi tetap berlaku sebagaimana di atas.

### Kuis dari kelompok Kanji Mirip

`data/similar-quiz-editorial.json` menambahkan **82 kosakata dalam dua arah**:
hiragana → kanji dan kanji → hiragana. Targetnya mencakup seluruh **48 kelompok
bentuk mirip dan 10 keluarga radikal**. Ini bank pilihan, bukan soal untuk
setiap anggota keluarga atau seluruh kosakata JLPT. Pembagian kosakata:
N5 34, N4 15, N3 20, N2 8, N1 5. Level kosakata dapat berbeda dari level kanji
tunggal pada halaman kelompok.

Kata, bacaan, dan level dicocokkan dengan snapshot OpenJLPT/JMdict yang sama;
metadata rujukannya ada di `data/similar-quiz-source.json`. Kalimat, arti
Indonesia, penjelasan, dan pilihan salah ditulis khusus untuk situs ini.
Tidak ada kalimat Tatoeba atau soal resmi yang disalin. Data adaptasi ini
mengikuti CC BY-SA 4.0 dan atribusi EDRDG/OpenJLPT di atas.

Setiap pengecoh kanji mengubah tepat satu karakter target dan mempertahankan
okurigana. Jika target termasuk kelompok perbandingan, setidaknya satu pilihan
salah memakai pasangannya yang sudah dikenal. Pengecoh hiragana berbeda satu
atau dua perubahan dari jawaban. Bacaan alternatif dan ejaan lain dalam sumber
dikecualikan dari jawaban salah. Kalimat disertakan pada kedua arah, antara lain
untuk membedakan 縁（ふち）, 辛い（からい）, serta 郊外 dari homofon 校外.
Penjelasan mencakup bunyi dan ciri visual; tautan kelompok baru muncul setelah
menjawab dan pada ulasan hasil.

`similar-quiz-core.js` menghubungkan target karakter ke kelompok lama dan
keluarga radikal, menggabungkan bank tanpa mengulang kosakata yang sama, serta
memfilter materi dan level. Bank gabungan yang tampil di aplikasi berisi
**180 soal kanji → hiragana** dan **132 soal hiragana → kanji**. Dua kata yang
sudah ada pada bank membaca memakai versi baru yang memiliki konteks kalimat.
Bank katakana tetap berisi 50 soal. Kelompok kecil menyesuaikan jumlah soal
dengan jumlah kata yang tersedia, dan tidak mengulang kata demi memenuhi kuota.

Jalankan `python scripts/build_similar_quiz.py` setelah cache dari
`scripts/import_catalog.py` tersedia. Generator memvalidasi rujukan, pilihan
jawaban, dan target, lalu menulis `similar-quiz-data.js` serta metadata sumber.
Jalankan `npm test` setelah mengubah materi atau pengelompokan.

### Membangun katalog

Website memakai snapshot lokal dan tidak memanggil layanan kamus atau
terjemahan ketika pengguna belajar.

Untuk membangun ulang hasil yang sama tanpa jaringan (Python 3):

```sh
python scripts/build_data.py
npm test
python -m unittest discover -s tests -p "test_*.py"
```

`data/source-lock.json` mengunci versi OpenJLPT; `catalog-source.json` menyimpan
data sumber yang digunakan. `reviewed-id.json` menyimpan seluruh hasil tinjauan
beserta hash sumber agar pembaruan kamus tidak melewati pemeriksaan arti.
`translations-id.json`, `translation-overrides.json`, dan `curated.json`
dipertahankan sebagai riwayat draf; ketiganya tidak menggantikan hasil tinjauan
arti saat build. Urutan 110 kartu awal tetap mengikuti `curated.json`.
`catalog-manifest.json` menyimpan jumlah, daftar karakter per level, dan
cakupan tinjauan.

Untuk mengambil ulang sumber: `python scripts/import_catalog.py`, kemudian
`python scripts/prepare_catalog.py`. `python scripts/translate_catalog.py`
mengisi draf terjemahan yang belum tersedia melalui layanan Google Translate.
Tinjau arti, bacaan, dan contoh yang baru atau berubah; perbarui
`reviewed-id.json` beserta tanggal dan hash SHA-256 `catalog-source.json`
(UTF-8 dengan akhir baris LF) hanya
setelah tinjauan selesai. Build menolak cakupan yang tidak lengkap, sumber
yang berubah tanpa tinjauan, atau terjemahan kata identik yang tidak konsisten.
Bangun ulang, lalu jalankan pengujian sebelum deployment.
Jika mengganti commit sumber, bersihkan cache `.cache/openjlpt` sebelumnya.
Tinjau versi sumber secara berkala, setidaknya bulanan selama data ini
didistribusikan, agar mengikuti pembaruan kamus EDRDG.
