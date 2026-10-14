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

Tab Kanji Mirip juga memiliki **11 keluarga dengan 837 karakter unik** dari
katalog yang sama. `radical-members.js` mengambil label komponen utama dari
[KanjiVG r20260714](https://github.com/KanjiVG/kanjivg/releases/tag/r20260714),
© 2009–2026 Ulrich Apel dan kontributor, dengan
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
[Atribusi dan perubahan](data/licenses/KanjiVG-NOTICE.md) disertakan.
Lisensi 3.0 ini berlaku untuk ekstrak komponen; data kamus lain tetap mengikuti
lisensi yang dijelaskan sebelumnya. Tidak ada diagram atau path SVG yang disalin.

Ekstraksi memeriksa seluruh 2.383 kanji; seluruhnya ditemukan pada sumber.
Untuk sepuluh keluarga semula, hanya bentuk utuh dan komponen langsungnya
yang digunakan. Komponen bertanda parsial dan bagian yang lebih dalam tidak
dipakai agar 木 di dalam 禾 atau 亻 di dalam 彳 tidak
menjadi anggota yang menyesatkan. Komponen visual tidak harus sama dengan
radikal kamus: 酒 tetap termasuk 氵. Batas ini berarti daftar bukan pencarian
semua subkomponen tersembunyi, misalnya 氵 di dalam 落. Cakupan juga terbatas
pada katalog situs, bukan seluruh karakter Jepang.

Keluarga air memuat 130 kanji: 123 dengan 氵, 5 dengan 水, dan 2 dengan 氺.
Keluarga perjalanan memuat 55 kanji dengan ⻌ atau 辶. Keluarga lain: 木, 扌/手,
忄/心/⺗, 言, 糸, 艹, 亻 (ditambah bentuk dasar 人), dan 金. Satu kanji dapat
masuk beberapa keluarga, seperti 休 pada orang dan kayu.

Kelompok **Mengandung bentuk 門** (`bentuk-mon`) menambahkan pencarian bentuk
門 yang lengkap pada semua kedalaman komponen. Anggotanya adalah 17 karakter:
門・間・聞・開・問・関・閉・簡・閣・闘・閥・欄・潤・閲・蘭・闇・閑.
Ini mencakup seluruh kecocokan dalam katalog N5–N1 yang digunakan, termasuk
簡・潤・欄・蘭 yang mengandung 門 di dalam komponen lain. Karakter dengan bentuk
bingkai lain seperti 同 atau 周 tidak masuk. Arti, bacaan, dan level tetap
mengambil katalog yang sama. Cakupan ini tidak dibatasi oleh radikal kamus:
[聞 beradikal 耳](https://www.kanjipedia.jp/kanji/0006190200) tetap termasuk.
Nama [門 / もんがまえ](https://www.kanjipedia.jp/sakuin/bushu/detail/8/169)
mengikuti Kanjipedia. Pencarian lebih dalam ini hanya berlaku bagi kelompok 門;
batas keanggotaan sepuluh keluarga sebelumnya tetap sama.

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
bentuk mirip dan 11 keluarga radikal/komponen**. Ini bank pilihan, bukan soal untuk
setiap anggota keluarga atau seluruh kosakata JLPT. Pembagian kosakata:
N5 34, N4 15, N3 20, N2 8, N1 5 pada sumber kosakata. Metadata sumber ini tetap
disimpan. Mode membaca memakai level kosakata sumber; mode penulisan memakai
level kanji tersulit pada target.

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
menghubungkan metadata materi. Bank gabungan berisi
**180 soal kanji → hiragana** sebelum tambahan bacaan khusus di bawah, dan
**132 soal hiragana → kanji**. Dua kata yang
sudah ada pada bank membaca memakai versi baru yang memiliki konteks kalimat.
Bank katakana tetap berisi 50 soal. Jumlah soal menyesuaikan bank pada level
yang tersedia, dan tidak mengulang kata demi memenuhi kuota.

Jalankan `python scripts/build_similar_quiz.py` setelah cache dari
`scripts/import_catalog.py` tersedia. Generator memvalidasi rujukan, pilihan
jawaban, dan target, lalu menulis `similar-quiz-data.js` serta metadata sumber.
Jalankan `npm test` setelah mengubah materi atau pengelompokan.

### Penghitung, yen, tanggal, dan bunyi kata

`special-reading-data.js` memuat **100 soal tambahan**, seluruhnya hanya pada
mode kanji → hiragana. Bank lama berisi **280 soal** sebelum perluasan kosakata
di bawah; sekarang totalnya **464 soal**, sedangkan
penulisan kanji tetap 132 dan katakana 50. Rinciannya:

- 44 soal: 本, 台, 枚, 個, 冊, 匹, 杯, 人, dan つ.
- 18 soal: 100–900 yen dan 1.000–9.000 yen.
- 33 soal: setiap tanggal 1–31 serta durasi satu dan dua hari.
- 5 soal: 中国, 中国語, 韓国, 東京, dan 留学生.

Bacaan ditinjau terhadap [JOSHU, University of Texas at Austin](https://laits.utexas.edu/japanese/joshu/counters/counters_english.php),
[daftar kata Irodori 入門, Japan Foundation](https://www.irodori.jpf.go.jp/assets/data/wordlist_X.pdf),
dan [indeks kosakata Marugoto 入門, Japan Foundation](https://marugoto.jpf.go.jp/assets/docs/download/starter_c/MarugotoStarterCompetencesVocabularyIndex_CN.pdf).
Variasi seperti はっぽん／はちほん dan じゅっぽん／じっぽん diperiksa dengan
[tabel penghitung JYL](https://www.kodomo-kotoba.info/pdf/Goi_Reference_data09.pdf).
Rujukan beserta cakupannya dicatat di `data/special-reading-references.json`.
留学生 juga dicocokkan dengan JMdict ID 1552750 pada cache OpenJLPT terkunci.

Semua kalimat, terjemahan Indonesia, pembahasan, dan pengecoh disusun khusus;
tidak ada soal atau kalimat buku pelajaran yang disalin. Sumber dipakai untuk
memeriksa fakta bacaan. Materi dasar ini dikelompokkan secara editorial pada
N5, bukan penetapan resmi JLPT. Porsi hitungan dan tanggal dibatasi saat
pemilihan soal campuran agar tidak mendominasi latihan kosakata.

Pilihan yang diterima dicatat dalam `acceptedReadings` dan tidak boleh muncul
sebagai pengecoh. Untuk `1日`, dua konteks dipertahankan dengan `contextKey`:
tanggal (`ついたち`) dan durasi (`いちにち`). Kata yang sama tanpa perbedaan konteks
tetap digabung. Pilihan hanya memuat satu jawaban tepat untuk kalimatnya.
Penghitung tidak mengikuti satu aturan umum: misalnya 六本 menjadi ろっぽん,
sedangkan 六台 tetap ろくだい dan 六千円 tetap ろくせんえん.

`practice-banks.js` menjadi sumber bank gabungan untuk aplikasi dan pengujian.
Penghitung, yen, dan tanggal hanya masuk mode membaca. Metadata topik tetap
disimpan untuk hubungan materi; tidak ada pemilihan topik pada pengaturan kuis.
Jalankan `npm test` sesudah memperbarui materi.

### Level dan pengaturan kuis

`quiz-settings.js` menyelaraskan mode Hiragana → Kanji, kuis arti, dan contoh
kata katalog dengan level kanji situs. Untuk kata gabungan atau bentuk berokurigana, level mengikuti kanji tersulit
dalam **kata target**, bukan seluruh kalimat konteks atau pilihan pengecoh.
Perhitungan memakai karakter yang tercatat di katalog. Sebanyak 29 contoh N1
mengandung karakter tambahan di luar katalog; semuanya tetap berada di N1.
Contoh: 六本 N5, 六台 N4, 六杯 N3, 六枚 N2, 韓国 N1. Aturan yang sama berlaku
pada mode Contoh kata → Hiragana. **Kanji → Hiragana (bacaan ala JLPT)** memakai
level kosakata sumber, karena kata dasar seperti 勉強, 病院, dan 郵便局 tetap
dipelajari pada N5 meskipun kanji penyusunnya muncul di kelompok kanji lebih tinggi.
Hiragana → Katakana juga memakai level kosakata sumber.

`getQuizPool` mencampur semua materi pada level pilihan secara otomatis.
Bank kanji → hiragana berisi N5 189, N4 73, N3 75, N2 65, N1 62; hiragana →
kanji berisi N5 14, N4 28, N3 31, N2 28, N1 31. Tautan topik lama membuka
mode yang sesuai tanpa filter tersembunyi. Pilihan jumlah 10, 20, 50, atau
custom (bilangan bulat positif) dibatasi pada jumlah soal tersedia.

`quiz-feedback.js` menyediakan arti kata/kanji dan terjemahan kalimat yang sama
untuk jawaban benar, salah, waktu habis, dan ulasan hasil. Keberadaan pembahasan
tambahan tidak menentukan apakah arti ditampilkan.

### Keragaman kosakata dan pemilihan soal membaca

`data/reading-vocabulary-editorial.json` menambahkan 200 entri pilihan, 40 per
level: 8 kata benda, 12 kata kerja, 12 kata sifat, dan 8 kata keterangan. Bacaan,
level, dan kelas kata dicocokkan dengan snapshot OpenJLPT/JMdict yang sama.
Arti Indonesia disusun dan ditinjau secara editorial; kesalahan arti sumber
seperti 半分 = “half minute” tidak diteruskan. Satu kelas utama dipilih untuk
penyeimbangan latihan; sebuah kata dapat mempunyai fungsi lain dalam konteks.

`scripts/build_reading_vocabulary.py` memvalidasi kata/bacaan/level dan menulis
`reading-vocabulary-data.js`, `reading-metadata.js`, serta metadata atribusi di
`data/reading-vocabulary-source.json`. Tidak ada kalimat dari sumber yang
disalin. Pengecoh dibuat dengan perubahan satu kana, mempertahankan okurigana,
dan mengecualikan seluruh bacaan sah untuk ejaan tersebut dalam sumber terkunci.
Data adaptasi mengikuti CC BY-SA 4.0 dan atribusi EDRDG/OpenJLPT di atas.

Soal lama yang mempunyai konteks atau pilihan khusus dipertahankan ketika kata
yang sama digabung. Hasil akhir menambah 184 soal unik: total 464, terdiri dari
180 kata benda, 77 kata kerja, 70 kata sifat, 42 kata keterangan, dan 95 hitungan/
tanggal. Lima soal seperti 中国 dari bank bacaan khusus termasuk kata benda.

`reading-balance.js` mengembalikan level kosakata sumber untuk bank membaca.
Pemilihan berputar antar empat kelas kata, lalu mengacak urutan soal dan pilihan.
Hitungan/tanggal mendapat paling banyak 20% dari sesi normal (2/10, 4/20, 10/50).
Jika jumlah yang diminta melebihi kapasitas kosakata yang tersisa, soal hitungan/
tanggal tambahan boleh mengisi sisa sesi; soal tidak diulang untuk memenuhi kuota.
Subkelompok penghitung, yen, dan tanggal juga dipilih bergantian. Semua soal
tetap dapat muncul; dua konteks `1日` tetap merupakan soal yang berbeda.

Untuk memperbarui: edit data editorial, jalankan
`python scripts/build_reading_vocabulary.py`, lalu `npm test`.

### Pembahasan komponen pada jawaban kuis

`kanji-components-data.js` menyimpan 1.219 uraian bentuk dari KanjiVG r20260714,
dengan checksum yang sama seperti `data/radical-source.json`. Bangun ulang
dengan `python scripts/build_components.py` setelah cache KanjiVG tersedia.
Arti komponennya memakai katalog Indonesia yang sudah ditinjau, ditambah
glos editorial untuk radikal dan bentuk variannya dalam skrip tersebut.
Misalnya 氵 berasal dari 水 (air), sedangkan 月 yang dilabeli sebagai varian
肉 diberi arti daging/tubuh, bukan bulan. 阝 kiri dan kanan juga dibedakan.

Ekstraksi hanya menerima dua hingga empat komponen lengkap yang artinya
tersedia. Bagian parsial, bentuk yang belum dikenali, dan karakter dasar tidak
dipecah secara spekulatif. Kanji yang tidak mempunyai uraian tetap menampilkan
arti kanjinya. Uraian ini menjelaskan bentuk yang terlihat, bukan menyimpulkan
asal-usul atau menjumlahkan arti komponen menjadi arti kata.

Pembahasan mengambil kanji dari kata jawaban yang benar saja. Catatan pembanding
pilihan pengecoh tidak ditambahkan ke kuis kanji; materi perbandingan di tab
Kanji Mirip tetap tersedia. Arti kata, kalimat lengkap, terjemahan kalimat, dan
catatan bunyi tetap ditampilkan untuk jawaban benar, salah, kehabisan waktu,
maupun ulasan akhir.

Rujukan contoh 聞: [Kanjipedia](https://www.kanjipedia.jp/kanji/0006190200)
menjelaskan 耳 sebagai bagian makna dan 門 sebagai bagian bunyi. Glos 門
(gerbang) dan 耳 (telinga) membantu mengenali bentuk; bukan etimologi
"gerbang + telinga = mendengar". [Kanji123](https://kanji123.org/n5-kanji-test1)
ditinjau sebagai referensi format latihan dalam kalimat; soal atau kalimatnya
tidak disalin ke bank ini.

### Penjelasan seluruh anggota keluarga 門

`mon-components-data.js` melengkapi uraian manual untuk seluruh 17 anggota
keluarga 門. Uraian tampil langsung pada setiap kartu keluarga dan pada modal
detail kanji. Komponen gabungan yang relevan diuraikan lagi, misalnya 潤 →
氵 + 閏 → 門 + 王 dan 簡 → ⺮ + 間 → 門 + 日. Komponen dasar tetap ditampilkan
sebagai bentuk utuh; setiap goresan tidak diberi arti kata secara spekulatif.

Struktur visual dicocokkan dengan KanjiVG terkunci dan kamus. Glos Indonesia
memakai katalog yang sudah ditinjau serta catatan editorial. Rujukan rinci
tersimpan di `data/mon-components-references.json`. Bentuk Jepang modern
dibedakan dari bentuk lama: misalnya 関 dari 關, 闘 dari 鬪, serta isi 闌 pada
欄 dan 蘭. Bentuk 开 pada 開 dijelaskan sebagai perubahan 廾 (kedua tangan)
mengikuti Kanjipedia. Uraian bentuk bukan persamaan arti atau klaim etimologi.
Perubahan ini tidak mengubah bank soal, level kanji, atau anggota keluarga lain.

### English → Katakana

Mode aktif `english-katakana` menggantikan pilihan Hiragana → Katakana.
`english-katakana-data.js` memberi petunjuk Inggris untuk seluruh 50 kata
katakana lama, lalu menambahkan running, jogging, allergy, dan sandal
(shower sudah tersedia). Total 54 soal: N5 10, N4 11, N3 11, N2 12, N1 10.
Level 50 kata lama tetap; running N2 dan sandal N4 mengikuti snapshot
OpenJLPT yang sama. Jogging N3 dan allergy N2 merupakan pengelompokan
latihan editorial, bukan penetapan level resmi JLPT. Rinciannya ada pada
`data/english-katakana-source.json`; ejaan dan maknanya dicek di kamus.

Petunjuk Inggris menyatakan makna yang perlu dicari dalam kosakata Jepang,
bukan transliterasi harfiah atau klaim bahwa semua kata berasal dari Inggris.
Contohnya signature → サイン, power outlet → コンセント, dan allergy →
アレルギー (asal Jerman). Kalimat Jepang dan bacaan hiragana ditampilkan
sesudah menjawab agar tidak membocorkan ejaan. Umpan balik benar/salah,
waktu habis, dan ulasan akhir memakai padanan katakana, bacaan, arti Indonesia,
serta contoh kalimat yang sama. Jumlah soal, pilihan level, dan timer tetap ada.
Tautan lama `#kuis/hiragana-katakana` membuka mode baru; riwayat mode lama
tetap disimpan dengan namanya semula. Angka bank katakana 50 di bagian-bagian
sebelumnya mendokumentasikan bank dasar sebelum penggantian mode ini.

### Perluasan kosakata English → Katakana

Bank aktif kini berisi **161 soal**: N5 40, N4 49, N3 36, N2 15, N1 21.
Seluruh 99 kata permintaan tercakup: 14 sudah ada dan 85 ditambahkan.
Sebanyak 22 kata tambahan lain melengkapi makanan, teknologi, perjalanan,
dan olahraga, misalnya smartphone, keyboard, air conditioner, dan volleyball.
Kata yang sudah ada tidak digandakan. Riwayat dan ID 54 soal sebelumnya tetap.

`data/katakana-expansion-editorial.json` menyimpan ejaan, arti Indonesia,
pilihan salah, varian yang sah, dan konteks latihan. Pembentukan bank dilakukan
oleh `scripts/build_katakana_expansion.py`, menghasilkan
`katakana-expansion-data.js` dan `data/katakana-expansion-source.json`.
Manifest mencatat cakupan setiap kata permintaan, tingkat latihan, dan sumber.
Level kata yang ditemukan persis mengikuti OpenJLPT terkunci. Untuk kata yang
tidak ada, level merupakan pengelompokan latihan editorial N5/N4/N3; tingkat
A2/B1 Marugoto tidak dianggap setara langsung dengan level JLPT.

Ejaan dan makna dicocokkan dengan [indeks kosakata Marugoto A2/B1, Japan
Foundation](https://marugoto.jpf.go.jp/assets/docs/download/pre_intermediate/MarugotoPre-IntermediateVocabularyIndex_EN.pdf)
serta kamus. PDF disimpan hanya di cache; versi sumber dicatat dengan SHA-256
di manifest. Tidak ada kalimat contoh, urutan pelajaran, atau notasi aksen
Marugoto yang disalin. Kalimat dan penjelasan Indonesia dibuat untuk latihan ini.
Fakta kosakata dari OpenJLPT/JMdict tetap mengikuti atribusi dan CC BY-SA 4.0
yang dijelaskan di atas.

Petunjuk Inggris diperjelas jika ambigu: fan (supporter), Turkey (country),
play (sports), dan counter (service desk). “Convenient store” dibetulkan menjadi
“convenience store”. Bentuk alternatif sah tidak menjadi pengecoh, termasuk
コンピュータ, プレイ, dan バームクーヘン. Varian ejaan
[Baumkuchen diperiksa di Digital Daijisen](https://kotobank.jp/word/%E3%81%B0%E3%81%86%E3%82%80%E3%81%8F%E3%83%BC%E3%81%B8%E3%82%93-3164065).
[サインボード](https://kotobank.jp/word/%E3%81%95%E3%81%84%E3%82%93%E3%81%BC%E3%83%BC%E3%81%A9-1323324)
dan [condominium](https://kotobank.jp/ejword/condominium) juga diperiksa;
istilah Jepang yang sepadan dapat berbeda dari transliterasi Inggrisnya.

Untuk membangun ulang, sediakan cache OpenJLPT yang terkunci, unduh PDF pada
tautan di atas ke `.cache/marugoto-preintermediate-en.pdf`, lalu jalankan:

```sh
pdftotext -layout .cache/marugoto-preintermediate-en.pdf .cache/marugoto-preintermediate-en.txt
python scripts/build_katakana_expansion.py
npm test
```

### Kuis Kotoba Bab 1–50

Sumber adalah workbook pengguna `Minna_No_Nihongo_Latihan_Bab_1-50_Jenis_Kata.xlsx`,
sheet `Kotoba Bab 1-50`, sel A2:E1691. Seluruh **1.690 entri** dipertahankan,
termasuk bacaan, penulisan, arti Indonesia, bab, dan jenis kata: 904 entri
Bab 1–25 dan 786 entri Bab 26–50, dengan 12 kategori jenis kata.
Jumlah setiap bab direkonsiliasi dengan sheet `Ringkasan`.

Sheet `Panduan` menyebut sumber sebagai kompilasi latihan orisinal yang mengikuti
topik Minna no Nihongo I dan II, bukan transkripsi atau daftar resmi lengkap buku.
Website mempertahankan batas cakupan itu. Data ini berasal dari file pengguna,
bukan OpenJLPT/JMdict; atribusi dan lisensi sumber kanji di atas tidak otomatis
diterapkan pada workbook ini. Workbook asli tidak diubah atau diunggah.

`scripts/build_kotoba.py` membaca XLSX menggunakan pustaka standar Python.
Hasilnya `kotoba-data.js` dan manifest `data/kotoba-source.json`; manifest mencatat
nama file, SHA-256, rentang sel, jumlah bab, dan kategori. Setiap entri menyimpan
nomor baris sumber. Untuk membangun ulang:

```sh
python scripts/build_kotoba.py /path/to/Minna_No_Nihongo_Latihan_Bab_1-50_Jenis_Kata.xlsx
npm test
```

Kata dengan penulisan dan bacaan yang sama digabung saat membentuk sesi;
arti, jenis kata, nomor baris, dan babnya tetap dipertahankan. Seluruh bab
menghasilkan 1.571 kartu kosakata unik. Mode bacaan hanya menguji kata yang
memiliki kanji (1.316 kartu); kana tidak ditampilkan sebagai petunjuk jawaban.
Mode dengar Jepang mengecualikan lima pola berpenanda ～ yang bukan kata mandiri.
Jumlah yang tampil selalu mengikuti bab, jenis kata, dan mode yang dipilih.

Pilihan salah tetap berasal dari bab yang dipilih, mengutamakan jenis kata yang
sama. Penulisan sama, homofon, bacaan alternatif, dan arti Indonesia yang saling
tumpang tindih disaring agar tidak menjadi jawaban salah. Pencocokan arti bersifat
konservatif berdasarkan padanan dalam workbook; ini bukan pemeriksaan kamus
menyeluruh untuk semua kemungkinan makna. Pengguna dapat memilih 10/20/50 soal
atau jumlah custom; permintaan besar dibatasi ke jumlah kartu tanpa pengulangan.

Lima mode mencakup Jepang–Indonesia, Indonesia–Jepang, bacaan kana, suara Jepang
ke arti, dan suara Indonesia ke Jepang. Audio memakai Web Speech API dengan
[suara bahasa yang tersedia di perangkat](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices).
Mode suara hanya aktif jika suara bahasa tersebut ditemukan; suara bahasa lain
tidak dijadikan pengganti. Audio diputar setelah tombol ditekan. Timer dimulai
setelah pemutaran pertama selesai; navigasi menghentikan audio dan timer.
Arti dan bacaan muncul setelah jawaban benar, salah, atau waktu habis. Hasil sesi
lengkap tersimpan di browser bersama riwayat kuis lama, termasuk bab yang dipilih.

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
