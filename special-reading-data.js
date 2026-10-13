// Original exercises, checked against JF Irodori / Marugoto and UT Austin JOSHU.
// Foundational counting/calendar readings use an editorial N5 practice band.
// References and accepted-variant policy: DATA-SOURCES.md.
export const READING_TOPICS = [
  ['bacaan-khusus','Semua hitungan, tanggal & bunyi kata'],
  ['penghitung-benda','Semua penghitung benda & orang'],
  ['hitung-hon','本 · Batang & botol'],
  ['hitung-dai','台 · Kendaraan & mesin'],
  ['hitung-mai','枚 · Lembaran'],
  ['hitung-ko','個 · Benda satuan'],
  ['hitung-satsu','冊 · Buku'],
  ['hitung-hiki','匹 · Hewan kecil'],
  ['hitung-hai','杯 · Gelas & cangkir'],
  ['hitung-nin','人 · Orang'],
  ['hitung-tsu','つ · Hitungan umum'],
  ['nominal-yen','円 · Ratusan & ribuan yen'],
  ['tanggal-hari','日 · Tanggal & durasi hari'],
  ['bunyi-kata','中国・東京 · Bunyi panjang & kana kecil'],
].map(([id,label])=>({id,label,kind:'reading'}));

const numerals = ['','一','二','三','四','五','六','七','八','九','十'];
const counters = [
  {id:'hon',suffix:'本',unit:'batang pensil',sentence:'えんぴつを {target} かいました。',translation:n=>`Saya membeli ${n} batang pensil.`,note:'本 menghitung benda panjang seperti pensil dan botol.',rows:[
    [1,'いっぽん',['いちぽん','いっぼん','いちぼん'],'いち + ほん menjadi いっぽん: っ kecil diikuti ぽ.'],
    [2,'にほん',['にぼん','にぽん','にっぽん'],'Setelah に, 本 tetap dibaca ほん.'],
    [3,'さんぼん',['さんほん','さんぽん','さんぼう'],'Setelah さん, ほん berubah menjadi ぼん dengan dakuten.'],
    [4,'よんほん',['よんぼん','よんぽん','よほん'],'Empat batang dibaca よんほん; pertahankan ん dan ほ.'],
    [5,'ごほん',['ごぼん','ごぽん','こほん'],'Lima batang dibaca ごほん; dakuten hanya pada ご.'],
    [6,'ろっぽん',['ろくぼん','ろくぽん','ろっぼん'],'ろく + ほん menjadi ろっぽん. Ada っ kecil dan ぽ dengan handakuten.'],
    [7,'ななほん',['ななぼん','ななぽん','なほん'],'Gunakan ななほん. Bacaan しちほん juga digunakan; keduanya tidak dijadikan pilihan yang saling menjebak.',['しちほん']],
    [8,'はっぽん',['はっぼん','はちぼん','はっぽう'],'Baca はっぽん: はっ diikuti ぽん. Bentuk はちほん juga digunakan.',['はちほん']],
    [9,'きゅうほん',['きゅほん','きゅうぼん','きゅうぽん'],'きゅう tetap panjang dan 本 dibaca ほん.'],
    [10,'じゅっぽん',['じゅっぼん','じゅうぽん','じゅっぽう'],'Baca じゅっぽん. じっぽん juga benar; bentuk itu tidak dipakai sebagai pilihan salah.',['じっぽん']],
  ]},
  {id:'dai',suffix:'台',unit:'unit mobil',sentence:'くるまが {target} とまっています。',translation:n=>`Ada ${n} mobil yang terparkir.`,note:'台 menghitung kendaraan dan mesin. Baca だい.',rows:[
    [1,'いちだい',['いっだい','いちたい','いちでい'],'Satu unit dibaca いちだい, tanpa っ kecil.'],
    [3,'さんだい',['さんたい','さんでい','さだい'],'Tiga unit dibaca さんだい. だ memakai dakuten.'],
    [4,'よんだい',['よだい','よんたい','よんでい'],'Empat unit memakai よん, kemudian だい.'],
    [6,'ろくだい',['ろっだい','ろくたい','ろくだえ'],'ろく tetap utuh sebelum だい; tidak menjadi ろっ.'],
    [8,'はちだい',['はっだい','はちたい','はちでい'],'はち tetap utuh sebelum だい.'],
    [10,'じゅうだい',['じゅだい','じゅっだい','じゅうたい'],'じゅう tetap panjang, tanpa っ kecil.'],
  ]},
  {id:'mai',suffix:'枚',unit:'lembar kertas',sentence:'かみを {target} つかいます。',translation:n=>`Saya menggunakan ${n} lembar kertas.`,note:'枚 menghitung benda tipis dan datar, seperti kertas.',rows:[
    [1,'いちまい',['いっまい','いちまえ','いちばい'],'Baca いち + まい; tidak ada perubahan menjadi っ.'],
    [3,'さんまい',['さんばい','さんまえ','さまい'],'Baca さん + まい. Akhiran まい tetap memakai ま.'],
    [6,'ろくまい',['ろっまい','ろくばい','ろくまえ'],'ろく tetap utuh sebelum まい.'],
    [8,'はちまい',['はっまい','はちばい','はちまえ'],'はち tetap utuh sebelum まい.'],
  ]},
  {id:'ko',suffix:'個',unit:'buah apel',sentence:'りんごを {target} かいました。',translation:n=>`Saya membeli ${n} buah apel.`,note:'個 menghitung benda satuan, misalnya buah apel.',rows:[
    [1,'いっこ',['いちこ','いっご','いちご'],'いち + こ menjadi いっこ dengan っ kecil.'],
    [3,'さんこ',['さんご','さっこ','さんこう'],'Setelah さん, 個 tetap こ, tanpa dakuten atau bunyi panjang.'],
    [6,'ろっこ',['ろくこ','ろっご','ろくご'],'ろく + こ menjadi ろっこ.'],
    [8,'はっこ',['はちご','はっご','はっこう'],'Gunakan はっこ dengan っ kecil. Bentuk はちこ juga digunakan.',['はちこ']],
  ]},
  {id:'satsu',suffix:'冊',unit:'buku',sentence:'ほんを {target} かりました。',translation:n=>`Saya meminjam ${n} buku.`,note:'冊 menghitung buku dan benda berjilid.',rows:[
    [1,'いっさつ',['いちさつ','いっざつ','いっさっ'],'いち + さつ menjadi いっさつ. Akhir つ tetap berukuran biasa.'],
    [3,'さんさつ',['さんざつ','さんさっ','さっさつ'],'Baca さんさつ, tanpa dakuten pada さ.'],
    [6,'ろくさつ',['ろっさつ','ろくざつ','ろくさっ'],'Enam buku dibaca ろくさつ; ろく tidak disingkat menjadi ろっ.'],
    [8,'はっさつ',['はっざつ','はちざつ','はっさっ'],'Gunakan はっさつ. Bentuk はちさつ juga digunakan; keduanya bukan pasangan benar–salah.',['はちさつ']],
  ]},
  {id:'hiki',suffix:'匹',unit:'ekor kucing',sentence:'ねこが {target} います。',translation:n=>`Ada ${n} ekor kucing.`,note:'匹 menghitung hewan kecil seperti kucing dan ikan.',rows:[
    [1,'いっぴき',['いちぴき','いっびき','いちびき'],'いち + ひき menjadi いっぴき: っ lalu ぴ.'],
    [3,'さんびき',['さんぴき','さんびぎ','さっぴき'],'Baca さんびき, dengan dakuten pada び.'],
    [4,'よんひき',['よんびき','よんぴき','よひき'],'Empat ekor dibaca よんひき. ひ tetap tanpa tanda.'],
    [6,'ろっぴき',['ろくぴき','ろっびき','ろくびき'],'ろく + ひき menjadi ろっぴき dengan っ dan ぴ.'],
    [8,'はっぴき',['はっびき','はちびき','はっぴぎ'],'Gunakan はっぴき. Bentuk はちひき juga digunakan.',['はちひき']],
  ]},
  {id:'hai',suffix:'杯',unit:'cangkir teh',sentence:'おちゃを {target} のみました。',translation:n=>`Saya minum ${n} cangkir teh.`,note:'杯 menghitung isi cangkir, gelas, atau mangkuk.',rows:[
    [1,'いっぱい',['いちぱい','いっばい','いちばい'],'いち + はい menjadi いっぱい, dengan っ dan ぱ.'],
    [3,'さんばい',['さんはい','さんぱい','さんばえ'],'Setelah さん, はい berubah menjadi ばい.'],
    [4,'よんはい',['よんばい','よんぱい','よはい'],'Empat cangkir dibaca よんはい, dengan は tanpa tanda.'],
    [6,'ろっぱい',['ろくぱい','ろっばい','ろくばい'],'ろく + はい menjadi ろっぱい.'],
    [8,'はっぱい',['はっばい','はちばい','はっぱえ'],'Gunakan はっぱい. Bentuk はちはい juga digunakan.',['はちはい']],
  ]},
  {id:'nin',suffix:'人',unit:'orang',sentence:'きょうしつに がくせいが {target} います。',translation:n=>`Ada ${n} siswa di kelas.`,note:'人 menghitung orang; satu, dua, dan empat memiliki bacaan khusus.',rows:[
    [1,'ひとり',['いちにん','ひどり','ひとにん'],'Untuk satu orang dalam kalimat ini, 一人 dibaca ひとり.'],
    [2,'ふたり',['ににん','ふだり','ふたにん'],'Untuk dua orang, 二人 dibaca ふたり.'],
    [4,'よにん',['よんにん','しにん','よにい'],'Empat orang dibaca よにん, tanpa ん setelah よ.'],
    [7,'ななにん',['なにん','ななり','ななにい'],'七人 dapat dibaca ななにん atau しちにん. Pilihan di sini hanya memuat ななにん.',['しちにん']],
  ]},
  {id:'tsu',suffix:'つ',unit:'buah jeruk',sentence:'みかんを {target} ください。',translation:n=>`Tolong beri saya ${n} buah jeruk.`,note:'つ adalah hitungan umum dengan bentuk asli Jepang.',rows:[
    [3,'みっつ',['みつ','さんつ','みっづ'],'三つ dibaca みっつ. っ pertama kecil, つ terakhir berukuran biasa.'],
    [6,'むっつ',['むつ','ろくつ','むっづ'],'六つ dibaca むっつ, bukan ろくつ.'],
  ]},
];

const counterQuestions = counters.flatMap(c=>c.rows.map(([n,reading,distractors,note,alternatives=[]])=>({
  id:`counter:${c.id}:${n}`,word:`${numerals[n]}${c.suffix}`,reading,distractors,
  meaning:`${n} ${c.unit}`,sentence:c.sentence,sentenceMeaning:c.translation(n),
  explanation:`${c.note} ${note}`,acceptedReadings:[reading,...alternatives],
  topicIds:['bacaan-khusus','penghitung-benda',`hitung-${c.id}`],sourceId:'joshu-counters',
})));

// 円 is always えん here. The change happens in 百 / 千 and the number before it.
const moneyRows = [
  ['百円',100,'ひゃくえん',['びゃくえん','ぴゃくえん','ひやくえん'],'百 dibaca ひゃく dengan ゃ kecil.'],
  ['二百円',200,'にひゃくえん',['にびゃくえん','にぴゃくえん','にひやくえん'],'二百 tetap にひゃく, tanpa dakuten atau handakuten.'],
  ['三百円',300,'さんびゃくえん',['さんひゃくえん','さんぴゃくえん','さんびやくえん'],'三百 dibaca さんびゃく. ひゃく berubah menjadi びゃく.'],
  ['四百円',400,'よんひゃくえん',['よんびゃくえん','よんぴゃくえん','よひゃくえん'],'四百 memakai よんひゃく; pertahankan ん.'],
  ['五百円',500,'ごひゃくえん',['ごびゃくえん','ごぴゃくえん','こひゃくえん'],'五百 tetap ごひゃく. Dakuten ada pada ご saja.'],
  ['六百円',600,'ろっぴゃくえん',['ろくひゃくえん','ろくぴゃくえん','ろっびゃくえん'],'六百 dibaca ろっぴゃく: ろっ lalu ぴゃく.'],
  ['七百円',700,'ななひゃくえん',['ななびゃくえん','ななぴゃくえん','なひゃくえん'],'Baca ななひゃく, tanpa perubahan pada ひゃく.'],
  ['八百円',800,'はっぴゃくえん',['はちひゃくえん','はちぴゃくえん','はっびゃくえん'],'八百 dibaca はっぴゃく dengan っ dan ぴゃ.'],
  ['九百円',900,'きゅうひゃくえん',['きゅひゃくえん','きゅうびゃくえん','きゅうぴゃくえん'],'きゅう panjang, lalu ひゃく.'],
  ['千円',1000,'せんえん',['ぜんえん','せえん','せんいん'],'Untuk seribu yen dalam soal ini, baca せん + えん.',['いっせんえん']],
  ['二千円',2000,'にせんえん',['にぜんえん','にっせんえん','にせいえん'],'二千 dibaca にせん; せ tidak memakai dakuten.'],
  ['三千円',3000,'さんぜんえん',['さんせんえん','さんじぇんえん','さっせんえん'],'三千 dibaca さんぜん. せん berubah menjadi ぜん.'],
  ['四千円',4000,'よんせんえん',['よんぜんえん','よっせんえん','よせんえん'],'四千 dibaca よんせん. せ tidak memakai dakuten.'],
  ['五千円',5000,'ごせんえん',['ごぜんえん','ごっせんえん','こせんえん'],'五千 dibaca ごせん. Dakuten hanya pada ご.'],
  ['六千円',6000,'ろくせんえん',['ろっせんえん','ろくぜんえん','ろっぜんえん'],'六千 dibaca ろくせん. Pertahankan く dan gunakan せ tanpa dakuten.'],
  ['七千円',7000,'ななせんえん',['ななぜんえん','なっせんえん','なせんえん'],'Baca ななせん. Tidak ada perubahan menjadi ぜん.'],
  ['八千円',8000,'はっせんえん',['はちせんえん','はっぜんえん','はちぜんえん'],'八千 dibaca はっせん. はち berubah menjadi はっ; せ tetap tanpa dakuten.'],
  ['九千円',9000,'きゅうせんえん',['きゅせんえん','きゅうぜんえん','きゅっせんえん'],'きゅう tetap panjang, diikuti せん.'],
];
const moneyQuestions=moneyRows.map(([word,n,reading,distractors,note,alternatives=[]])=>({
  id:`yen:${n}`,word,reading,distractors,meaning:`${n.toLocaleString('id-ID')} yen`,
  sentence:'この しょうひんは {target} です。',sentenceMeaning:`Harga barang ini ${n.toLocaleString('id-ID')} yen.`,
  explanation:`${note} 円 dibaca えん, bukan いん.`,acceptedReadings:[reading,...alternatives],
  topicIds:['bacaan-khusus','nominal-yen'],sourceId:'irodori-starter',
}));

// Numeric notation matches everyday calendars. All 31 dates have explicit context.
const dateRows = [
  [1,'ついたち',['いちにち','ついだち','いっにち'],'Tanggal satu dibaca ついたち. いちにち dipakai untuk durasi satu hari.'],
  [2,'ふつか',['ににち','ふっか','ぶつか'],'Tanggal dua memiliki bacaan khusus ふつか.'],
  [3,'みっか',['さんにち','みか','みつか'],'Tanggal tiga dibaca みっか dengan っ kecil.'],
  [4,'よっか',['よんにち','よか','よつか'],'Tanggal empat dibaca よっか dengan っ kecil.'],
  [5,'いつか',['ごにち','いっか','いつが'],'Tanggal lima dibaca いつか; つ berukuran biasa.'],
  [6,'むいか',['ろくにち','むっか','むいが'],'Tanggal enam dibaca むいか, dengan い di tengah.'],
  [7,'なのか',['しちにち','ななか','なのが'],'Tanggal tujuh dibaca なのか.'],
  [8,'ようか',['はちにち','よっか','よか'],'Tanggal delapan dibaca ようか. よっか adalah tanggal empat.'],
  [9,'ここのか',['きゅうにち','ここか','ここのが'],'Tanggal sembilan dibaca ここのか.'],
  [10,'とおか',['じゅうにち','とうか','とっか'],'Tanggal sepuluh dibaca とおか; bunyi panjang ditulis おお.'],
  [11,'じゅういちにち',['じゅいちにち','じゅういっにち','じゅういちび']],
  [12,'じゅうににち',['じゅににち','じゅうにっち','じゅうにび']],
  [13,'じゅうさんにち',['じゅさんにち','じゅうざんにち','じゅうさんび']],
  [14,'じゅうよっか',['じゅうよんにち','じゅうよか','じゅうよつか'],'Tanggal empat belas memakai よっか: じゅうよっか.'],
  [15,'じゅうごにち',['じゅごにち','じゅうこにち','じゅうごび']],
  [16,'じゅうろくにち',['じゅろくにち','じゅうろっにち','じゅうろくび']],
  [17,'じゅうしちにち',['じゅしちにち','じゅうしっにち','じゅうしちび'],'Baca じゅうしちにち. じゅうななにち juga digunakan; tidak dimasukkan sebagai pilihan salah.',['じゅうななにち']],
  [18,'じゅうはちにち',['じゅはちにち','じゅうはっにち','じゅうはちび']],
  [19,'じゅうくにち',['じゅくにち','じゅうぐにち','じゅうくび'],'Bacaan kalender yang dilatih adalah じゅうくにち.',['じゅうきゅうにち']],
  [20,'はつか',['にじゅうにち','はっか','はつが'],'Tanggal dua puluh dibaca はつか. つ berukuran biasa.'],
  [21,'にじゅういちにち',['にじゅいちにち','にじゅういっにち','にじゅういちび']],
  [22,'にじゅうににち',['にじゅににち','にじゅうにっち','にじゅうにび']],
  [23,'にじゅうさんにち',['にじゅさんにち','にじゅうざんにち','にじゅうさんび']],
  [24,'にじゅうよっか',['にじゅうよんにち','にじゅうよか','にじゅうよつか'],'Tanggal dua puluh empat juga memakai よっか: にじゅうよっか.'],
  [25,'にじゅうごにち',['にじゅごにち','にじゅうこにち','にじゅうごび']],
  [26,'にじゅうろくにち',['にじゅろくにち','にじゅうろっにち','にじゅうろくび']],
  [27,'にじゅうしちにち',['にじゅしちにち','にじゅうしっにち','にじゅうしちび'],'Baca にじゅうしちにち. にじゅうななにち juga digunakan.',['にじゅうななにち']],
  [28,'にじゅうはちにち',['にじゅはちにち','にじゅうはっにち','にじゅうはちび']],
  [29,'にじゅうくにち',['にじゅくにち','にじゅうぐにち','にじゅうくび'],'Bacaan kalender yang dilatih adalah にじゅうくにち.',['にじゅうきゅうにち']],
  [30,'さんじゅうにち',['さんじゅにち','さんじゅうび','さんじゅうにっち']],
  [31,'さんじゅういちにち',['さんじゅいちにち','さんじゅういっにち','さんじゅういちび']],
];
const dateQuestions=dateRows.map(([n,reading,distractors,note,alternatives=[]])=>({
  id:`date:${n}`,word:`${n}日`,reading,distractors,meaning:`Tanggal ${n}`,
  ...(n===1 ? {contextKey:'calendar-date'} : {}),
  sentence:'こんげつの {target} に テストが あります。',sentenceMeaning:`Ada ujian pada tanggal ${n} bulan ini.`,
  explanation:note || `Tanggal ${n} dibaca ${reading}. Pertahankan じゅう yang panjang; 日 di bagian akhir dibaca にち.`,
  acceptedReadings:[reading,...alternatives],topicIds:['bacaan-khusus','tanggal-hari'],sourceId:'irodori-starter',
}));
const durationQuestions=[
  {id:'duration:1',contextKey:'duration',word:'1日',reading:'いちにち',distractors:['ついたち','いっにち','いちにっ'],meaning:'Satu hari',
    sentence:'この しごとは {target} で おわります。',sentenceMeaning:'Pekerjaan ini selesai dalam satu hari.',
    explanation:'Kalimat ini menyebut lama pekerjaan, jadi 1日 dibaca いちにち. ついたち adalah bacaan tanggal satu.'},
  {id:'duration:2',word:'2日間',reading:'ふつかかん',distractors:['ににちかん','ふっかかん','ふつがかん'],meaning:'Selama dua hari',
    sentence:'{target}、ホテルに とまります。',sentenceMeaning:'Saya menginap di hotel selama dua hari.',
    explanation:'2日 dalam durasi ini dibaca ふつか. Tambahkan 間（かん）untuk durasi: ふつかかん.'},
].map(q=>({...q,acceptedReadings:[q.reading],topicIds:['bacaan-khusus','tanggal-hari'],sourceId:'irodori-starter'}));

const wordQuestions=[
  {word:'中国',reading:'ちゅうごく',distractors:['ちゅごく','ちゅうがこ','ちゆごく'],meaning:'Tiongkok',
    sentence:'ペキンは {target} の しゅとです。',sentenceMeaning:'Beijing adalah ibu kota Tiongkok.',
    explanation:'Baca ちゅう + ごく. ゅ harus kecil, ちゅう panjang, dan 国 di sini dibaca ごく.'},
  {word:'中国語',reading:'ちゅうごくご',distractors:['ちゅごくご','ちゅうごくこ','ちゆうごくご'],meaning:'Bahasa Mandarin',
    sentence:'まいにち {target} を べんきょうします。',sentenceMeaning:'Saya belajar bahasa Mandarin setiap hari.',
    explanation:'Baca ちゅうごく + ご. Pertahankan bunyi panjang ちゅう; 語 dibaca ご dengan dakuten.'},
  {word:'韓国',reading:'かんこく',distractors:['かんごく','がんこく','かんこっ'],meaning:'Korea Selatan',
    sentence:'ソウルは {target} の しゅとです。',sentenceMeaning:'Seoul adalah ibu kota Korea Selatan.',
    explanation:'韓国 dibaca かんこく. 国 memakai こく tanpa dakuten.'},
  {word:'東京',reading:'とうきょう',distractors:['ときょう','とうきょ','とうぎょう'],meaning:'Tokyo',
    sentence:'しんかんせんで {target} へ いきます。',sentenceMeaning:'Saya pergi ke Tokyo dengan shinkansen.',
    explanation:'Baca とう + きょう. Kedua bagian panjang; ょ kecil dan き tanpa dakuten.'},
  {word:'留学生',reading:'りゅうがくせい',distractors:['りゅがくせい','りゅうかくせい','りゆうがくせい'],meaning:'Pelajar atau mahasiswa asing',
    sentence:'あの ひとは {target} です。',sentenceMeaning:'Orang itu adalah mahasiswa asing.',
    explanation:'Baca りゅう + がく + せい. りゅう memakai ゅ kecil dan bunyi panjang; が memakai dakuten.'},
].map(q=>({...q,id:`sound:${q.word}`,acceptedReadings:[q.reading],topicIds:['bacaan-khusus','bunyi-kata'],sourceId:'marugoto-vocabulary'}));

export const SPECIAL_READINGS=[...counterQuestions,...moneyQuestions,...dateQuestions,...durationQuestions,...wordQuestions]
  .map(q=>({...q,level:'N5',levelBasis:'editorial-foundation'}));
