// Editorial visual comparisons. Meanings, readings, levels and stroke counts
// are resolved from the reviewed KANJI catalog, never duplicated here.
export const SIMILAR_CATEGORIES = {
  stroke: 'Goresan tambahan',
  position: 'Panjang & posisi',
  component: 'Komponen berbeda',
};

export const SIMILAR_GROUPS = [
  {id:'mi-sue', category:'position', title:'Garis mana yang lebih panjang?', focus:'Dua garis mendatar pada bagian atas.', tip:'未: bagian atas belum memanjang. 末: garis paling atas memanjang. Gunakan ini sebagai pengingat bentuk.', members:[
    {char:'未', cue:'Garis mendatar atas lebih pendek daripada garis di bawahnya.'},
    {char:'末', cue:'Garis mendatar paling atas lebih panjang daripada garis di bawahnya.'},
  ]},
  {id:'tsuchi-samurai', category:'position', title:'Atas panjang atau bawah panjang?', focus:'Panjang kedua garis mendatar.', tip:'土 berarti tanah: bayangkan dasar yang lebar. 士 memiliki garis atas yang lebih lebar.', members:[
    {char:'土', cue:'Garis mendatar bawah lebih panjang daripada garis atas.'},
    {char:'士', cue:'Garis mendatar atas lebih panjang daripada garis bawah.'},
  ]},
  {id:'hi-me', category:'stroke', title:'Satu atau dua garis di dalam?', focus:'Jumlah garis mendatar di dalam kotak.', tip:'日 memiliki satu garis di dalam; 目 memiliki dua. Hitung bagian dalam, bukan garis bingkainya.', members:[
    {char:'日', cue:'Ada satu garis mendatar di dalam kotak.'},
    {char:'目', cue:'Ada dua garis mendatar di dalam kotak.'},
  ]},
  {id:'dai-tai-inu', category:'stroke', title:'Cari titik kecilnya.', focus:'Ada tidaknya titik dan letak titik tersebut.', tip:'Mulai dari 大. Titik di bawah menjadi 太; titik di kanan atas menjadi 犬.', members:[
    {char:'大', cue:'Tidak memiliki titik tambahan di antara atau di samping kedua kaki.'},
    {char:'太', cue:'Memiliki titik kecil di bawah, di antara kedua kaki.'},
    {char:'犬', cue:'Memiliki titik kecil di kanan atas.'},
  ]},
  {id:'ki-hon', category:'stroke', title:'Pohon dengan satu tanda tambahan.', focus:'Garis pendek di bagian bawah batang.', tip:'本 memiliki garis pendek di dekat pangkal. Jadikan pangkal pohon sebagai pengingat arti “asal”.', members:[
    {char:'木', cue:'Bagian bawah batang tidak dipotong garis mendatar pendek.'},
    {char:'本', cue:'Ada garis mendatar pendek yang memotong bagian bawah batang.'},
  ]},
  {id:'ou-tama', category:'stroke', title:'Titik yang mudah terlewat.', focus:'Sudut kanan bawah.', tip:'王 memiliki tiga garis mendatar. 玉 menambahkan satu titik di kanan bawah.', members:[
    {char:'王', cue:'Tiga garis mendatar dihubungkan garis tegak, tanpa titik tambahan.'},
    {char:'玉', cue:'Di samping tiga garis mendatar ada satu titik di kanan bawah.'},
  ]},
  {id:'hito-iru', category:'position', title:'Dua sapuan, arah pertemuan berbeda.', focus:'Pertemuan dua sapuan di bagian atas.', tip:'Perhatikan puncaknya: pada 人 sapuan kiri memanjang ke atas; pada 入 sapuan kanan berawal dengan arah miring dari kiri atas.', members:[
    {char:'人', cue:'Sapuan kiri turun dari puncak; sapuan kanan bercabang dari bagian atasnya.'},
    {char:'入', cue:'Sapuan kanan dimulai dengan bagian miring dari kiri atas, lalu turun ke kanan.'},
  ]},
  {id:'katana-chikara', category:'position', title:'Apakah sapuannya menembus ke atas?', focus:'Ujung sapuan miring di atas garis mendatar.', tip:'力 memiliki sapuan miring yang menonjol di atas. Pada 刀, sapuan miring berawal di bawah garis atas.', members:[
    {char:'刀', cue:'Sapuan miring berawal di bawah garis mendatar atas.'},
    {char:'力', cue:'Sapuan miring menembus dan menonjol di atas garis mendatar.'},
  ]},
  {id:'ushi-uma', category:'position', title:'Periksa ujung garis tegak.', focus:'Apakah garis tegak melewati garis atas?', tip:'牛 memiliki garis tegak yang menonjol di atas. Pada 午, garis tegak berhenti di garis mendatar atas.', members:[
    {char:'牛', cue:'Garis tegak tengah menonjol melewati garis mendatar atas.'},
    {char:'午', cue:'Garis tegak tengah tidak menonjol melewati garis mendatar atas.'},
  ]},
  {id:'ten-otto', category:'position', title:'Puncaknya rata atau menonjol?', focus:'Garis tegak di tengah bagian atas.', tip:'天 memiliki batas atas yang rata. Pada 夫, bagian tengah menembus garis paling atas.', members:[
    {char:'天', cue:'Tidak ada garis tegak yang menonjol di atas garis mendatar paling atas.'},
    {char:'夫', cue:'Garis tegak menonjol di atas garis mendatar paling atas.'},
  ]},
  {id:'sen-kan', category:'position', title:'Miring pendek atau mendatar?', focus:'Goresan paling atas.', tip:'千 diawali sapuan pendek yang miring. 干 memiliki garis mendatar di atas.', members:[
    {char:'千', cue:'Goresan paling atas pendek dan miring.'},
    {char:'干', cue:'Goresan paling atas berupa garis mendatar.'},
  ]},
  {id:'shiro-hyaku', category:'stroke', title:'Satu garis di atas bentuk putih.', focus:'Garis mendatar tambahan paling atas.', tip:'百 mempunyai garis mendatar tambahan di atas bentuk 白.', members:[
    {char:'白', cue:'Bagian paling atas berupa sapuan pendek tanpa garis mendatar tambahan di atasnya.'},
    {char:'百', cue:'Memiliki garis mendatar paling atas, di atas sapuan pendek dan kotak.'},
  ]},
  {id:'tori-naku', category:'component', title:'Burung dengan tambahan mulut.', focus:'Ada tidaknya kotak kecil di sebelah kiri.', tip:'鳥 berdiri sendiri. 鳴 menambahkan 口 di kiri: mulut membantu mengingat bunyi atau kicauan.', members:[
    {char:'鳥', cue:'Bentuk burung berdiri sendiri, tanpa kotak tambahan di kiri.'},
    {char:'鳴', cue:'Ada kotak kecil 口 di sebelah kiri bentuk burung.'},
  ]},
  {id:'migi-ishi', category:'position', title:'Sapuan kiri melewati garis atas?', focus:'Ujung atas sapuan miring di sebelah kiri kotak.', tip:'Pada 右, sapuan miring menonjol di atas garis mendatar. Pada 石, sapuan itu berawal dari garis mendatar.', members:[
    {char:'右', cue:'Sapuan miring kiri menonjol melewati garis mendatar atas.'},
    {char:'石', cue:'Sapuan miring kiri berawal pada garis mendatar atas, tanpa tonjolan di atasnya.'},
  ]},
  {id:'miru-kai', category:'position', title:'Dua kaki dengan bentuk berbeda.', focus:'Bentuk kedua kaki di bawah kotak.', tip:'見 memiliki kaki kanan yang melengkung dan berkait. 貝 berakhir dengan dua sapuan pendek yang terpisah.', members:[
    {char:'見', cue:'Kaki kanan memanjang, melengkung ke kanan, lalu berkait.'},
    {char:'貝', cue:'Bagian bawah berupa dua sapuan pendek, tanpa kaki kanan berkait.'},
  ]},
  {id:'ta-yu-kou-shin', category:'position', title:'Garis tegaknya keluar ke mana?', focus:'Ujung garis tegak di atas dan di bawah kotak.', tip:'田: tetap di dalam. 由: ke atas. 甲: ke bawah. 申: ke atas dan ke bawah.', members:[
    {char:'田', cue:'Garis tegak berada di dalam kotak, tidak menonjol ke atas atau ke bawah.'},
    {char:'由', cue:'Garis tegak menonjol ke atas kotak saja.'},
    {char:'甲', cue:'Garis tegak menonjol ke bawah kotak saja.'},
    {char:'申', cue:'Garis tegak menonjol ke atas dan ke bawah kotak.'},
  ]},
  {id:'ki-shi', category:'position', title:'Terbuka atau tertutup?', focus:'Seberapa tinggi sisi kiri mencapai bagian atas.', tip:'己 terbuka di kiri atas. 巳 menutup bagian atasnya.', members:[
    {char:'己', cue:'Sisi kiri bagian bawah berhenti di bawah garis tengah sehingga terbuka lebar.'},
    {char:'巳', cue:'Sisi kiri mencapai garis atas sehingga bagian atasnya tertutup.'},
  ]},
  {id:'kyuu-tai', category:'stroke', title:'Di kanan orang: pohon atau asal?', focus:'Garis pendek di pangkal komponen kanan.', tip:'休 memakai 木 di kanan. 体 memakai 本: cari garis pendek tambahannya.', members:[
    {char:'休', cue:'Di sebelah kanan 亻 tidak ada garis pendek yang memotong pangkal batang.'},
    {char:'体', cue:'Di sebelah kanan 亻 ada garis pendek yang memotong pangkal batang.'},
  ]},
  {id:'matsu-motsu-toki-uta', category:'component', title:'Bentuk kanan sama, sisi kiri berbeda.', focus:'Komponen kiri: 彳, 扌, 日, atau 言.', tip:'Semuanya memuat 寺. Biasakan melihat sisi kiri sebelum menebak arti.', members:[
    {char:'待', cue:'Komponen kiri adalah 彳, terdiri dari dua sapuan pendek dan garis tegak.'},
    {char:'持', cue:'Komponen kiri adalah 扌, bentuk tangan dengan garis mendatar dan kait.'},
    {char:'時', cue:'Komponen kiri adalah 日, kotak dengan satu garis di dalam.'},
    {char:'詩', cue:'Komponen kiri adalah 言, beberapa garis mendatar di atas kotak kecil.'},
  ]},
  {id:'ao-family', category:'component', title:'Keluarga bentuk 青.', focus:'Komponen kiri: matahari, air, hati, atau ujaran.', tip:'晴 memakai 日; 清 memakai 氵; 情 memakai 忄; 請 memakai 言. Bagian kanan sama-sama 青.', members:[
    {char:'晴', cue:'Di kiri terdapat 日, kotak matahari dengan satu garis di dalam.'},
    {char:'清', cue:'Di kiri terdapat 氵, tiga goresan air yang terpisah.'},
    {char:'情', cue:'Di kiri terdapat 忄, garis tegak panjang dengan dua goresan pendek di sisinya.'},
    {char:'請', cue:'Di kiri terdapat 言, komponen ujaran dengan kotak kecil di bawah.'},
  ]},
  {id:'nushi-family', category:'component', title:'Satu bentuk 主, empat pasangan.', focus:'Komponen kiri: orang, air, pohon, atau kuda.', tip:'Jangan berhenti di 主. Bedakan 亻 pada 住, 氵 pada 注, 木 pada 柱, dan 馬 pada 駐.', members:[
    {char:'住', cue:'Bagian kiri berupa 亻, komponen orang dengan dua goresan.'},
    {char:'注', cue:'Bagian kiri berupa 氵, tiga goresan air.'},
    {char:'柱', cue:'Bagian kiri berupa 木, komponen pohon.'},
    {char:'駐', cue:'Bagian kiri berupa 馬, komponen kuda dengan empat titik di bawah.'},
  ]},
  {id:'kawa-nani-ni', category:'component', title:'Komponen 可 dengan tiga bingkai.', focus:'Tanda di kiri atau di atas 可.', tip:'河: air di kiri. 何: orang di kiri. 荷: bentuk 何 ditambah rumput di atas.', members:[
    {char:'河', cue:'Di kiri 可 terdapat tiga goresan air, 氵.'},
    {char:'何', cue:'Di kiri 可 terdapat komponen orang, 亻, tanpa rumput di atas.'},
    {char:'荷', cue:'Memiliki komponen rumput 艹 di atas dan komponen orang di kiri bawah.'},
  ]},
  {id:'mon-family', category:'component', title:'Apa yang ada di dalam gerbang?', focus:'Isi di dalam 門.', tip:'聞 menyimpan 耳, 間 menyimpan 日, dan 問 menyimpan 口.', members:[
    {char:'聞', cue:'Di dalam gerbang terdapat 耳, komponen telinga dengan beberapa garis.'},
    {char:'間', cue:'Di dalam gerbang terdapat 日, kotak dengan satu garis mendatar di dalam.'},
    {char:'問', cue:'Di dalam gerbang terdapat 口, kotak kosong.'},
  ]},
  {id:'hiraku-tojiru-hima', category:'component', title:'Gerbang yang isinya berubah.', focus:'Bentuk di bagian dalam 門.', tip:'開 memiliki bentuk dua kaki dengan garis mendatar. 閉 memiliki 才. 閑 memiliki 木.', members:[
    {char:'開', cue:'Di dalam gerbang ada dua garis mendatar dan dua kaki di bawahnya.'},
    {char:'閉', cue:'Di dalam gerbang ada 才, garis berkait dan sapuan miring.'},
    {char:'閑', cue:'Di dalam gerbang ada 木, bentuk pohon.'},
  ]},
  {id:'han-family', category:'component', title:'Komponen 反 dan tiga tetangganya.', focus:'Bagian tambahan di kiri atau di sekelilingnya.', tip:'坂 memakai 土, 板 memakai 木, dan 返 memakai 辶. Bentuk 反 membantu menemukan kesamaannya.', members:[
    {char:'反', cue:'Bentuk berdiri sendiri, tanpa komponen tambahan di kiri atau bawah.'},
    {char:'坂', cue:'Ada komponen 土 di kiri.'},
    {char:'板', cue:'Ada komponen 木 di kiri.'},
    {char:'返', cue:'Ada komponen 辶 yang membentang di kiri dan bawah.'},
  ]},
  {id:'mai-family', category:'component', title:'Empat kanji dengan bentuk 毎.', focus:'Komponen di sebelah kiri.', tip:'海 berkaitan dengan air, 梅 dengan pohon. Untuk 悔 dan 侮, bedakan 忄 dari 亻.', members:[
    {char:'海', cue:'Komponen kiri adalah 氵, tiga goresan air.'},
    {char:'梅', cue:'Komponen kiri adalah 木, bentuk pohon.'},
    {char:'悔', cue:'Komponen kiri adalah 忄, bentuk hati dengan garis tegak panjang.'},
    {char:'侮', cue:'Komponen kiri adalah 亻, bentuk orang dengan dua goresan.'},
  ]},
  {id:'midori-roku', category:'component', title:'Benang atau logam di kiri?', focus:'Komponen kiri; bentuk kanan hampir sama.', tip:'緑 memakai 糸 untuk benang. 録 memakai 金 untuk logam.', members:[
    {char:'緑', cue:'Sisi kiri berupa 糸, komponen benang.'},
    {char:'録', cue:'Sisi kiri berupa 金, komponen logam.'},
  ]},
  {id:'midori-en', category:'component', title:'Benang sama, bagian kanan berbeda.', focus:'Bagian bawah komponen kanan.', tip:'緑 berakhir dengan bentuk seperti 水 di kanan bawah. 縁 memiliki sapuan miring berlapis seperti bagian bawah 豕.', members:[
    {char:'緑', cue:'Kanan bawah menyerupai 水, dengan garis tengah dan sapuan ke kedua sisi.'},
    {char:'縁', cue:'Kanan bawah memiliki sapuan miring berlapis seperti pada 豕.'},
  ]},
  {id:'neru-ren', category:'component', title:'Melatih benang atau menempa logam?', focus:'Komponen di sebelah kiri.', tip:'練 memakai 糸. 錬 memakai 金. Keduanya memiliki 東 di kanan dalam bentuk cetak ini.', members:[
    {char:'練', cue:'Di kiri 東 terdapat komponen benang, 糸.'},
    {char:'錬', cue:'Di kiri 東 terdapat komponen logam, 金.'},
  ]},
  {id:'shoku-shiki-ori', category:'component', title:'Bagian kanan rapat, cari petunjuk di kiri.', focus:'糸, 言, atau 耳 di sisi kiri.', tip:'織: benang. 識: ujaran. 職: telinga. Cocokkan komponen kiri sebelum membaca keseluruhannya.', members:[
    {char:'織', cue:'Bagian kiri berupa 糸, komponen benang.'},
    {char:'識', cue:'Bagian kiri berupa 言, komponen ujaran.'},
    {char:'職', cue:'Bagian kiri berupa 耳, komponen telinga.'},
  ]},
  {id:'ken-family', category:'component', title:'Tiga bentuk kanan yang sama.', focus:'木, 阝, atau 馬 di sisi kiri.', tip:'検 memakai pohon, 険 memakai komponen bukit di kiri, dan 験 memakai kuda.', members:[
    {char:'検', cue:'Komponen kiri adalah 木, bentuk pohon.'},
    {char:'険', cue:'Komponen kiri adalah 阝, bentuk bukit di sisi kiri.'},
    {char:'験', cue:'Komponen kiri adalah 馬, bentuk kuda dengan empat titik di bawah.'},
  ]},
  {id:'kaku-family', category:'component', title:'Bentuk 各 berpindah pasangan.', focus:'Benang di kiri, pohon di kiri, atau rumput di atas.', tip:'絡 dan 格 berbeda pada komponen kiri. 落 memiliki rumput di atas serta air di kiri bawah.', members:[
    {char:'絡', cue:'Di kiri 各 terdapat 糸, komponen benang.'},
    {char:'格', cue:'Di kiri 各 terdapat 木, komponen pohon.'},
    {char:'落', cue:'Ada 艹 di atas dan 氵 di kiri bawah.'},
  ]},
  {id:'hajime-osameru', category:'component', title:'台 ditemani perempuan atau air.', focus:'Bentuk di sebelah kiri 台.', tip:'始 memakai 女; 治 memakai 氵. Perhatikan sisi kiri, bukan kotak di kanan bawah.', members:[
    {char:'始', cue:'Di kiri 台 terdapat 女, komponen perempuan.'},
    {char:'治', cue:'Di kiri 台 terdapat 氵, tiga goresan air.'},
  ]},
  {id:'musubu-tsumeru', category:'component', title:'吉 dengan benang atau ujaran.', focus:'Komponen kiri.', tip:'結 memakai 糸 dan 詰 memakai 言. Keduanya memiliki 吉 di kanan.', members:[
    {char:'結', cue:'Di kiri 吉 terdapat 糸, komponen benang.'},
    {char:'詰', cue:'Di kiri 吉 terdapat 言, komponen ujaran.'},
  ]},
  {id:'kou-family', category:'component', title:'交: lihat sisi tambahan.', focus:'Posisi dan jenis komponen di samping 交.', tip:'校 memiliki 木 di kiri. 郊 memiliki 阝 di kanan. 効 memiliki 力 di kanan.', members:[
    {char:'校', cue:'Ada 木 di sebelah kiri bentuk 交.'},
    {char:'郊', cue:'Ada 阝 di sebelah kanan bentuk 交.'},
    {char:'効', cue:'Ada 力 di sebelah kanan bentuk 交.'},
  ]},
  {id:'setsu-tou-yaku', category:'component', title:'Bentuk 殳 dengan tiga sisi kiri.', focus:'Komponen ujaran, tangan, atau langkah.', tip:'設 memakai 言, 投 memakai 扌, dan 役 memakai 彳. Bentuk kanan sama-sama 殳.', members:[
    {char:'設', cue:'Komponen kiri adalah 言, beberapa garis mendatar di atas kotak kecil.'},
    {char:'投', cue:'Komponen kiri adalah 扌, bentuk tangan dengan kait.'},
    {char:'役', cue:'Komponen kiri adalah 彳, dua sapuan pendek dan garis tegak.'},
  ]},
  {id:'chou-kou', category:'stroke', title:'丁 atau 工 di sebelah kepala?', focus:'Garis mendatar bawah pada komponen kiri.', tip:'頂 memakai 丁 di kiri. 項 memakai 工, dengan satu garis mendatar tambahan di bawah.', members:[
    {char:'頂', cue:'Komponen kiri memiliki garis atas dan batang berkait, tanpa garis mendatar bawah.'},
    {char:'項', cue:'Komponen kiri memiliki garis mendatar atas dan bawah yang dihubungkan garis tegak.'},
  ]},
  {id:'cho-bi', category:'component', title:'Perbedaan kecil di tengah kanji rapat.', focus:'Bentuk tengah di bawah 山.', tip:'徴 memiliki 王 di tengah bawah. 微 memiliki bentuk kaki 儿 di bagian tengah bawah.', members:[
    {char:'徴', cue:'Di bagian tengah bawah terdapat bentuk 王 dengan tiga garis mendatar.'},
    {char:'微', cue:'Di bagian tengah bawah terdapat dua kaki seperti 儿.'},
  ]},
  {id:'tetsu-tetsu', category:'component', title:'Langkah atau tangan di sebelah kiri?', focus:'彳 dibandingkan dengan 扌.', tip:'徹 memakai 彳. 撤 memakai 扌. Jangan hanya melihat bagian kanan yang sama.', members:[
    {char:'徹', cue:'Sisi kiri memiliki 彳, dua sapuan pendek dan satu garis tegak.'},
    {char:'撤', cue:'Sisi kiri memiliki 扌, garis mendatar, batang berkait, dan sapuan naik.'},
  ]},
  {id:'suteru-hirou', category:'component', title:'Atap sama, isi bawahnya berbeda.', focus:'舎 atau 合 di sisi kanan tangan.', tip:'捨 memiliki bentuk 舎 dengan 十 di tengah. 拾 memiliki 合, tanpa 十 tersebut.', members:[
    {char:'捨', cue:'Di bawah atap kanan terdapat 十 sebelum kotak paling bawah.'},
    {char:'拾', cue:'Di bawah atap kanan terdapat garis mendatar dan kotak, tanpa 十.'},
  ]},
  {id:'teki-family', category:'component', title:'Bentuk 啇 dengan tangan, air, atau sapuan.', focus:'Komponen tambahan di samping bentuk utama.', tip:'摘 memakai 扌 di kiri, 滴 memakai 氵 di kiri, dan 敵 memakai 攵 di kanan.', members:[
    {char:'摘', cue:'Di kiri bentuk utama terdapat 扌, komponen tangan.'},
    {char:'滴', cue:'Di kiri bentuk utama terdapat 氵, tiga goresan air.'},
    {char:'敵', cue:'Di kanan bentuk utama terdapat 攵, termasuk sapuan panjang ke kanan bawah.'},
  ]},
  {id:'kabe-tama', category:'component', title:'Dinding atau batu giok: lihat dasarnya.', focus:'Komponen paling bawah.', tip:'壁 berdiri di atas 土. 璧 memiliki 玉 di bawah, lengkap dengan titik kecilnya.', members:[
    {char:'壁', cue:'Bagian paling bawah adalah 土, dua garis mendatar dan satu garis tegak.'},
    {char:'璧', cue:'Bagian paling bawah adalah 玉, tiga garis mendatar dan satu titik.'},
  ]},
  {id:'ka-tai', category:'component', title:'貝 sama, penutupnya berbeda.', focus:'化 atau 代 di atas 貝.', tip:'貨 memiliki 化 di atas. 貸 memiliki 代 di atas. Lihat kait dan titik pada bagian atas kanan.', members:[
    {char:'貨', cue:'Di atas 貝 terdapat 化, dengan bentuk 匕 di kanan atas.'},
    {char:'貸', cue:'Di atas 貝 terdapat 代, dengan bentuk 弋 dan titik di kanan atas.'},
  ]},
  {id:'on-omou', category:'stroke', title:'Hati yang dinaungi dua kotak berbeda.', focus:'Isi kotak di atas 心.', tip:'思 memiliki 田 di atas. 恩 memiliki 因: cari bentuk 大 di dalam kotak.', members:[
    {char:'思', cue:'Kotak di atas 心 berisi garis tegak dan mendatar yang membentuk empat ruang.'},
    {char:'恩', cue:'Kotak di atas 心 berisi bentuk 大 dengan dua sapuan kaki.'},
  ]},
  {id:'kou-shin', category:'stroke', title:'Satu garis yang mengubah rasa.', focus:'Garis mendatar di bagian atas.', tip:'幸 mempunyai satu garis mendatar lebih banyak daripada 辛. Bandingkan bagian atasnya perlahan.', members:[
    {char:'辛', cue:'Bagian atas dimulai dengan titik dan garis mendatar; tidak ada tambahan garis seperti 土.'},
    {char:'幸', cue:'Bagian atas menyerupai 土, dengan garis tegak yang memotong dua garis mendatar.'},
  ]},
  {id:'ji-tera', category:'component', title:'Atap rumah atau tanah di atas?', focus:'Bentuk di bagian atas dan bawah.', tip:'字 memiliki 宀 di atas 子. 寺 memiliki 土 di atas 寸. Bentuk tengahnya juga perlu diperhatikan.', members:[
    {char:'字', cue:'Bagian atas berupa atap 宀; di bawahnya terdapat 子.'},
    {char:'寺', cue:'Bagian atas berupa 土; di bawahnya terdapat 寸 dengan titik di kiri.'},
  ]},
  {id:'ki-ki', category:'component', title:'Diri sendiri dengan dua sisi berbeda.', focus:'Komponen kiri di samping 己.', tip:'記 memiliki 言 di kiri. 紀 memiliki 糸. Bagian kanan keduanya adalah 己.', members:[
    {char:'記', cue:'Di kiri 己 terdapat 言, komponen ujaran.'},
    {char:'紀', cue:'Di kiri 己 terdapat 糸, komponen benang.'},
  ]},
  {id:'chi-ike', category:'component', title:'也 ditemani tanah atau air.', focus:'土 dibandingkan dengan 氵 di kiri.', tip:'地 memiliki 土 di kiri. 池 memiliki 氵. Bentuk kanan keduanya adalah 也.', members:[
    {char:'地', cue:'Di kiri 也 terdapat 土, garis tegak dengan dua garis mendatar.'},
    {char:'池', cue:'Di kiri 也 terdapat 氵, tiga goresan air yang terpisah.'},
  ]},
];
