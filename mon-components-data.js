// Reviewed visual explanations for every member of the 門 family.
// Structure: KanjiVG r20260714 + dictionary checks for modern/old forms.
// See data/mon-components-references.json and DATA-SOURCES.md.
const part = (symbol, meaning, position, children = []) => ({symbol, meaning, position, children});
const gate = () => part('門', 'gerbang', 'bingkai luar');
const interval = position => part('間', 'antara; jarak; selang waktu', position, [
  gate(), part('日', 'matahari; hari', 'di dalam 門'),
]);
const railing = position => part('闌', 'pagar; pegangan pembatas — dipakai dalam bentuk sederhana', position, [
  gate(), part('東', 'bentuk sederhana dari 柬 (memilih); bentuknya seperti 東, kanji untuk timur', 'di dalam 門'),
]);

export const MON_COMPONENT_NOTES = {
  '門': {
    summary:'門 adalah bentuk dasar yang menggambarkan gerbang dengan dua daun pintu.',
    parts:[part('門', 'gerbang', 'bentuk utuh')],
    note:'Sisi kiri dan kanan membentuk dua daun gerbang. Bukaan berada di tengah bawah; tidak perlu memberi arti kata terpisah pada setiap garisnya.',
  },
  '間': {
    summary:'門 membingkai 日. Kenali kotak 日 beserta satu garis mendatar di dalamnya.',
    parts:[gate(), part('日', 'matahari; hari', 'di dalam 門')],
  },
  '聞': {
    summary:'門 membingkai 耳. Bagian telinga berada di tengah gerbang.',
    parts:[gate(), part('耳', 'telinga', 'di dalam 門')],
    note:'Dalam kamus, radikal utama 聞 adalah 耳. 門 berperan sebagai petunjuk bunyi dalam pembentukan kanjinya.',
  },
  '開': {
    summary:'門 membingkai bentuk 开: dua garis mendatar dengan dua goresan turun.',
    parts:[gate(), part('开', 'bentuk berubah dari 廾, yang menggambarkan kedua tangan', 'di dalam 門')],
    note:'Kanjipedia menjelaskan bentuk ini sebagai kedua tangan yang membuka gerbang. 开 di sini dipelajari sebagai komponen bentuk.',
  },
  '問': {
    summary:'門 membingkai 口. Kotak kecil di bagian dalam adalah komponen mulut.',
    parts:[gate(), part('口', 'mulut', 'di dalam 門')],
  },
  '関': {
    summary:'門 membingkai 关. Untuk mengenali bentuk modernnya, lihat dua goresan pendek di atas 天.',
    parts:[gate(), part('关', 'bagian dalam bentuk sederhana 関', 'di dalam 門', [
      part('丷', 'dua goresan pendek; penanda bentuk, bukan arti kata tersendiri', 'di atas'),
      part('天', 'langit', 'di bawah dua goresan pendek'),
    ])],
    note:'関 adalah bentuk sederhana dari 關. Pemisahan 丷 dan 天 membantu mengenali bentuk cetaknya; arti 関 tidak berasal dari penjumlahan arti bagian-bagian ini.',
  },
  '閉': {
    summary:'門 membingkai 才. Perhatikan garis mendatar, garis berkait, dan sapuan miring di bagian dalam.',
    parts:[gate(), part('才', 'bakat; kemampuan', 'di dalam 門')],
  },
  '簡': {
    summary:'Bentuk bambu berada di atas 間. Di dalam 間 masih ada 門 dan 日.',
    parts:[part('⺮', 'bambu; bentuk atas dari 竹', 'di atas'), interval('di bawah ⺮')],
  },
  '閣': {
    summary:'門 membingkai 各. Bagian 各 dapat dikenali dari 夂 di atas 口.',
    parts:[gate(), part('各', 'masing-masing', 'di dalam 門', [
      part('夂', 'komponen yang menggambarkan kaki mengarah ke bawah', 'di atas'),
      part('口', 'mulut', 'di bawah 夂'),
    ])],
  },
  '闘': {
    summary:'Di dalam bingkai 門, 豆 berada di kiri dan 寸 di kanan.',
    parts:[gate(), part('豆', 'kacang', 'di dalam, sebelah kiri'), part('寸', 'satuan ukuran sun; ukuran pendek', 'di dalam, sebelah kanan')],
    note:'Ini uraian bentuk 闘 yang dipakai sekarang. Bentuk lamanya adalah 鬪, sehingga gambaran gerbang, kacang, dan ukuran bukan cerita asal-usul makna pertarungan.',
  },
  '閥': {
    summary:'門 membingkai 伐. Di dalamnya terdapat bentuk orang di kiri dan senjata di kanan.',
    parts:[gate(), part('伐', 'menebang; menyerang', 'di dalam 門', [
      part('亻', 'orang; bentuk samping dari 人', 'di kiri'),
      part('戈', 'tombak bertangkai panjang', 'di kanan'),
    ])],
  },
  '欄': {
    summary:'木 berada di kiri, sedangkan bentuk sederhana 闌 berada di kanan. Di dalam 闌 terdapat bingkai 門.',
    parts:[part('木', 'pohon; kayu', 'di kiri'), railing('di kanan')],
    note:'Pada bentuk Jepang modern, isi bingkai disederhanakan seperti 東. Bentuk lama memakai 柬 (memilih). Makna 闌 berkaitan dengan pagar atau pembatas.',
  },
  '潤': {
    summary:'氵 berada di kiri dan 閏 di kanan. 閏 sendiri memiliki 王 di dalam 門.',
    parts:[part('氵', 'air; bentuk samping dari 水', 'di kiri'), part('閏', 'penambahan hari atau bulan untuk menyesuaikan kalender, seperti tahun kabisat', 'di kanan', [
      gate(), part('王', 'raja', 'di dalam 門'),
    ])],
  },
  '閲': {
    summary:'門 membingkai bentuk 兌. Kenali dua goresan di atas, kotak 口, lalu dua kaki di bawah.',
    parts:[gate(), part('兌', 'menukar; bergembira — bentuk komponen pada 閲', 'di dalam 門', [
      part('丷', 'dua goresan pendek; penanda bentuk', 'di atas'),
      part('口', 'mulut', 'di tengah'),
      part('儿', 'komponen berbentuk dua kaki orang', 'di bawah'),
    ])],
    note:'Bagian atas 兌 dapat tampak seperti 八 atau dua titik 丷 menurut bentuk tulisannya. Pada 閲 modern, amati bentuk dua titiknya.',
  },
  '蘭': {
    summary:'艹 berada di atas bentuk sederhana 闌. Bingkai 門 berada di bawah komponen tumbuhan.',
    parts:[part('艹', 'rumput; tumbuhan', 'di atas'), railing('di bawah 艹')],
    note:'Bentuk Jepang dalam koleksi ini memakai bagian dalam yang disederhanakan seperti 東. Pada bentuk lain, bagian itu ditulis 柬 (memilih).',
  },
  '闇': {
    summary:'門 membingkai 音. Bentuk 音 tersusun dari 立 di atas dan 日 di bawah.',
    parts:[gate(), part('音', 'suara; bunyi', 'di dalam 門', [
      part('立', 'berdiri', 'di atas'), part('日', 'matahari; hari', 'di bawah'),
    ])],
  },
  '閑': {
    summary:'門 membingkai 木. Perhatikan batang tegak dan dua cabang pohon di bagian dalam.',
    parts:[gate(), part('木', 'pohon; kayu', 'di dalam 門')],
  },
};
