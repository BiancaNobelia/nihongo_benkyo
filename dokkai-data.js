// Adapted text: KCよむよむ, The Japan Foundation Japanese-Language Institute, Kansai.
// CC BY-NC 2.1 JP. Individual authors, original PDFs and changes are credited below.
// Questions, Indonesian translations, explanations and reading annotations: Nihongo Benkyo.
export const DOKKAI_SOURCE = {
  title:'KCよむよむ', publisher:'The Japan Foundation Japanese-Language Institute, Kansai',
  url:'https://www.jpf.go.jp/j/kansai/clip/yomyom/',
  license:'CC BY-NC 2.1 JP', licenseUrl:'https://creativecommons.org/licenses/by-nc/2.1/jp/',
  accessed:'2026-10-16',
  changes:'Teks diringkas dan disesuaikan untuk latihan. Furigana, soal, terjemahan, dan pembahasan Indonesia ditambahkan oleh Nihongo Benkyo. Gambar sumber tidak disalin.',
};
const passage = (id,level,title,titleId,file,author,originalLevel,paragraphs,translation,glossary,questions) => ({
  id,level,title,titleId,paragraphs,translation,glossary,
  source:{title,author,originalLevel,url:`https://www.jpf.go.jp/j/kansai/clip/images/page/yomyom/${file}.pdf`},
  questions:questions.map(([prompt,meaning,choices,explanation,evidence],i)=>({
    id:`${id}-q${i+1}`,prompt,meaning,
    options:choices.map(([text,translation],j)=>({id:String(j),text,translation})),
    answer:'0',explanation,evidence,
  })),
});

export const DOKKAI_PASSAGES = [
  passage('kc-library','N5','図書館','Di perpustakaan','003_toshokan','畠中朋子','A1',[
    'ここは{関西国際|かんさいこくさい}センターです。センターは{大阪|おおさか}にあります。センターの{中|なか}に{図書館|としょかん}があります。',
    '{図書館|としょかん}には{本|ほん}やざっしがたくさんあります。{本|ほん}をさがすとき、{図書館|としょかん}の{人|ひと}が{手伝|てつだ}います。{本|ほん}は{二週間|にしゅうかん}{借|か}りることができます。',
    '{図書館|としょかん}で{友|とも}だちと{勉強|べんきょう}します。{宿題|しゅくだい}もします。{勉強|べんきょう}は{難|むずか}しいですが、{楽|たの}しいです。',
  ],[
    'Ini adalah Kansai International Center. Pusat ini berada di Osaka. Di dalamnya ada perpustakaan.',
    'Di perpustakaan ada banyak buku dan majalah. Saat mencari buku, petugas perpustakaan membantu. Buku dapat dipinjam selama dua minggu.',
    'Kami belajar bersama teman di perpustakaan. Kami juga mengerjakan PR. Belajar memang sulit, tetapi menyenangkan.',
  ],[['図書館','としょかん','perpustakaan'],['借りる','かりる','meminjam'],['手伝う','てつだう','membantu']],[
    ['としょかんは、どこにありますか。','Di mana perpustakaannya?', [['センターの中','Di dalam pusat tersebut'],['えきの前','Di depan stasiun'],['学校のとなり','Di sebelah sekolah'],['ともだちの家','Di rumah teman']], 'Paragraf pertama menyebutkan bahwa perpustakaan berada di dalam pusat tersebut.',0],
    ['本を、どのくらいかりることができますか。','Berapa lama buku boleh dipinjam?', [['二週間','Dua minggu'],['二日','Dua hari'],['一週間','Satu minggu'],['一か月','Satu bulan']], '二週間 adalah dua minggu. Angka dua di sini diikuti satuan minggu, bukan hari.',1],
    ['本をさがすとき、だれがてつだいますか。','Siapa yang membantu saat mencari buku?', [['としょかんの人','Petugas perpustakaan'],['えきの人','Petugas stasiun'],['家族','Keluarga'],['先生だけ','Hanya guru']], 'Pelaku 手伝います disebut jelas sebagai 図書館の人.',1],
    ['としょかんで、何をしますか。','Apa yang dilakukan di perpustakaan?', [['べんきょうやしゅくだいをします','Belajar dan mengerjakan PR'],['ばんごはんを作ります','Memasak makan malam'],['スポーツをします','Berolahraga'],['えいがを作ります','Membuat film']], 'Paragraf terakhir menyebut belajar bersama teman dan mengerjakan PR.',2],
  ]),
  passage('kc-zoo','N5','天王寺動物園','Mengenal hewan di kebun binatang','004_tennoji','安達祥子','A1',[
    '{天王寺動物園|てんのうじどうぶつえん}には、いろいろな{動物|どうぶつ}がいます。{子|こ}どもも{大人|おとな}も{動物|どうぶつ}が{大好|だいす}きです。',
    'キーウィはニュージーランドの{鳥|とり}です。でも、{飛|と}ぶことができません。ホッキョクグマの{子|こ}どもは、{水|みず}の{中|なか}が{大好|だいす}きです。',
    '{動物園|どうぶつえん}の{外|そと}でピクニックができます。{休|やす}みに、{遊|あそ}びに{来|き}てください。',
  ],[
    'Di Kebun Binatang Tennoji ada berbagai hewan. Anak-anak maupun orang dewasa sangat menyukai hewan.',
    'Kiwi adalah burung dari Selandia Baru. Namun, burung ini tidak dapat terbang. Anak beruang kutub sangat suka berada di dalam air.',
    'Dalam bacaan ini, pengunjung dapat berpiknik di luar kebun binatang. Datanglah bermain pada hari libur.',
  ],[['動物園','どうぶつえん','kebun binatang'],['鳥','とり','burung'],['ホッキョクグマ','ホッキョクグマ','beruang kutub']],[
    ['キーウィは、どんなどうぶつですか。','Kiwi termasuk hewan apa?', [['鳥','Burung'],['魚','Ikan'],['ねこ','Kucing'],['くま','Beruang']], 'Teks menyebut キーウィは…鳥です. Kiwi di sini adalah hewan, bukan buah.',1],
    ['キーウィについて、正しいものはどれですか。','Pernyataan mana yang benar tentang kiwi?', [['とぶことができません','Tidak dapat terbang'],['水の中にすんでいます','Tinggal di dalam air'],['日本の魚です','Ikan dari Jepang'],['とてもよくとびます','Sangat pandai terbang']], 'でも menandai hal yang berbeda dari dugaan: burung ini tidak bisa terbang.',1],
    ['ホッキョクグマの子どもは、どこがすきですか。','Anak beruang kutub menyukai tempat yang mana?', [['水の中','Di dalam air'],['本の上','Di atas buku'],['えきの中','Di dalam stasiun'],['へやの外だけ','Hanya di luar kamar']], '水の中が大好き menyatakan tempat yang sangat disukai anak beruang kutub.',1],
    ['ピクニックは、どこでできますか。','Menurut bacaan, di mana pengunjung dapat berpiknik?', [['どうぶつえんの外','Di luar kebun binatang'],['どうぶつのへや','Di kandang hewan'],['でんしゃの中','Di dalam kereta'],['水の中','Di dalam air']], 'Perhatikan 外 yang berarti luar. Teks tidak menyatakan berpiknik di dalam kandang.',2],
  ]),
  passage('kc-day','N5','私の一日','Sehari bersama seorang guru','005_watashi','東健太郎','A1',[
    '{私|わたし}は{東|あずま}です。{日本語|にほんご}の{教師|きょうし}です。{家族|かぞく}は、{妻|つま}と{息子|むすこ}と{私|わたし}の{三人|さんにん}です。',
    '{毎朝|まいあさ}{四時半|よじはん}に{起|お}きます。{五時|ごじ}から{六時|ろくじ}までジョギングをします。それから、{家|いえ}でシャワーを{浴|あ}びます。',
    '{仕事|しごと}は{八時半|はちじはん}から{五時|ごじ}までです。{午後|ごご}{七時|しちじ}に{家|いえ}に{帰|かえ}ります。{息子|むすこ}と{遊|あそ}びます。{毎晩|まいばん}{十一時|じゅういちじ}ごろ{寝|ね}ます。',
  ],[
    'Saya Azuma, seorang guru bahasa Jepang. Keluarga saya terdiri dari tiga orang: istri, anak laki-laki, dan saya.',
    'Setiap pagi saya bangun pukul setengah lima. Saya joging dari pukul lima sampai enam. Setelah itu saya mandi dengan shower di rumah.',
    'Saya bekerja dari pukul setengah sembilan sampai lima. Saya pulang pukul tujuh malam, lalu bermain dengan anak saya. Setiap malam saya tidur sekitar pukul sebelas.',
  ],[['教師','きょうし','guru'],['妻','つま','istri sendiri'],['息子','むすこ','anak laki-laki']],[
    ['あずまさんの家族は、何人ですか。','Keluarga Azuma terdiri dari berapa orang?', [['三人','Tiga orang'],['二人','Dua orang'],['四人','Empat orang'],['五人','Lima orang']], 'Istri, anak laki-laki, dan Azuma berjumlah tiga orang.',0],
    ['何時におきますか。','Pukul berapa ia bangun?', [['四時半','Pukul 04.30'],['五時','Pukul 05.00'],['六時','Pukul 06.00'],['八時半','Pukul 08.30']], '四時半 adalah waktu bangun. 五時 adalah waktu mulai joging, bukan bangun.',1],
    ['どのくらいジョギングをしますか。','Berapa lama ia joging?', [['一時間','Satu jam'],['三十分','Tiga puluh menit'],['二時間','Dua jam'],['四時間','Empat jam']], 'Dari pukul lima sampai enam berlangsung satu jam.',1],
    ['家にかえってから、何をしますか。','Apa yang dilakukannya setelah pulang?', [['むすことあそびます','Bermain dengan anak laki-lakinya'],['学校に行きます','Pergi ke sekolah'],['五時から走ります','Berlari mulai pukul lima'],['すぐ会社に行きます','Langsung pergi ke kantor']], 'Setelah kalimat pulang pukul tujuh, bacaan menyebut bermain dengan anak.',2],
  ]),
  passage('kc-anh','N5','はじめまして、私はアインです','Berkenalan dengan Anh','024_hajimemashite','大西薫','A1',[
    'はじめまして。{私|わたし}はアインです。ベトナム{人|じん}です。{今|いま}、{日本|にほん}の{大学|だいがく}で{勉強|べんきょう}しています。',
    '{子|こ}どものとき、{初|はじ}めて{日本|にほん}のアニメを{見|み}ました。とてもおもしろかったです。{高校生|こうこうせい}のときから{日本語|にほんご}を{勉強|べんきょう}しています。',
    '{日本|にほん}の{生活|せいかつ}は{楽|たの}しいです。でも、{大学|だいがく}の{授業|じゅぎょう}は{少|すこ}し{大変|たいへん}です。{来週|らいしゅう}の{日曜日|にちようび}、{日本|にほん}の{友|とも}だちとコンサートに{行|い}きます。',
  ],[
    'Salam kenal. Saya Anh, orang Vietnam. Sekarang saya belajar di universitas di Jepang.',
    'Saat masih kecil, saya pertama kali menonton anime Jepang. Anime itu sangat menarik. Saya belajar bahasa Jepang sejak SMA.',
    'Kehidupan di Jepang menyenangkan. Namun, kuliah agak berat. Hari Minggu pekan depan saya akan pergi ke konser bersama teman Jepang.',
  ],[['高校生','こうこうせい','siswa SMA'],['生活','せいかつ','kehidupan sehari-hari'],['授業','じゅぎょう','pelajaran atau perkuliahan']],[
    ['アインさんは、どこの人ですか。','Anh berasal dari negara mana?', [['ベトナム','Vietnam'],['日本','Jepang'],['中国','Tiongkok'],['インドネシア','Indonesia']], 'Ia tinggal dan belajar di Jepang, tetapi memperkenalkan diri sebagai orang Vietnam.',0],
    ['いつから日本語をべんきょうしていますか。','Sejak kapan ia belajar bahasa Jepang?', [['高校生のときから','Sejak SMA'],['大学を出てから','Sejak lulus universitas'],['先週から','Sejak pekan lalu'],['来週から','Mulai pekan depan']], '高校生のときから menunjukkan titik awal belajar bahasa Jepang.',1],
    ['アインさんは、何が少したいへんだと言っていますか。','Apa yang menurut Anh agak berat?', [['大学のじゅぎょう','Perkuliahan'],['日本のアニメ','Anime Jepang'],['日曜日の休み','Libur hari Minggu'],['コンサートの歌','Lagu konser']], 'でも menghubungkan kehidupan yang menyenangkan dengan kuliah yang agak berat.',2],
    ['来週の日曜日、だれとコンサートに行きますか。','Dengan siapa ia pergi ke konser Minggu depan?', [['日本のともだち','Teman Jepang'],['高校の先生','Guru SMA'],['ベトナムの家族','Keluarga di Vietnam'],['一人で行きます','Pergi sendiri']], '日本の友だちと menyatakan orang yang menemaninya.',2],
  ]),
  passage('kc-interview','N5','アインさんインタビュー','Wawancara dengan Anh','025_anhsaninterview','大西薫','A1',[
    '「アインさん、{何|なん}の{勉強|べんきょう}をしていますか。」「けいざいの{勉強|べんきょう}をしています。{将来|しょうらい}、ベトナムで{日本|にほん}の{会社|かいしゃ}で{働|はたら}きたいです。」',
    '「{週末|しゅうまつ}は{何|なに}をしますか。」「{図書館|としょかん}で{勉強|べんきょう}します。でも、いつもではありません。{先週|せんしゅう}は{日本|にほん}の{友|とも}だちとコンサートに{行|い}きました。」',
    '「コンサートはどうでしたか。」「とても{楽|たの}しかったです。{私|わたし}はいずみくんが{大好|だいす}きです。{歌|うた}もダンスも{上手|じょうず}です。」',
  ],[
    '“Anh, apa yang kamu pelajari?” “Saya belajar ekonomi. Kelak saya ingin bekerja di perusahaan Jepang yang berada di Vietnam.”',
    '“Apa yang kamu lakukan pada akhir pekan?” “Saya belajar di perpustakaan, tetapi tidak selalu. Pekan lalu saya pergi ke konser bersama teman Jepang.”',
    '“Bagaimana konsernya?” “Sangat menyenangkan. Saya sangat menyukai Izumi. Ia pandai menyanyi dan menari.”',
  ],[['けいざい','けいざい','ekonomi'],['将来','しょうらい','masa depan'],['週末','しゅうまつ','akhir pekan']],[
    ['アインさんは、何をべんきょうしていますか。','Apa yang dipelajari Anh?', [['けいざい','Ekonomi'],['りょうり','Memasak'],['音楽だけ','Hanya musik'],['スポーツ','Olahraga']], 'Jawaban pertanyaan pertama dalam wawancara adalah けいざい.',0],
    ['しょうらい、どこではたらきたいですか。','Kelak, di mana ia ingin bekerja?', [['ベトナムにある日本の会社','Perusahaan Jepang di Vietnam'],['日本にある学校','Sekolah di Jepang'],['日本のコンサート会場','Tempat konser di Jepang'],['どこの会社でもいい','Perusahaan mana saja']], 'ベトナムで adalah lokasi, sedangkan 日本の会社 adalah perusahaan tempat bekerja.',0],
    ['先週のしゅうまつ、何をしましたか。','Apa yang dilakukannya pada akhir pekan lalu?', [['コンサートに行きました','Pergi ke konser'],['家にずっといました','Terus berada di rumah'],['会社ではたらきました','Bekerja di perusahaan'],['一人でべんきょうしました','Belajar sendirian']], 'いつもではありません membatasi kebiasaan belajar. Pekan lalu ia justru pergi ke konser.',1],
    ['コンサートは、どうでしたか。','Bagaimana kesannya tentang konser itu?', [['とても楽しかったです','Sangat menyenangkan'],['つまらなかったです','Membosankan'],['むずかしかったです','Sulit'],['よくわかりませんでした','Tidak terlalu mengerti']], '楽しかった adalah bentuk lampau dari 楽しい, yaitu menyenangkan.',2],
  ]),
  passage('kc-moon','N4','月見','Menikmati bulan musim gugur','002_tsukimi','畠中朋子','A2',[
    '{日本|にほん}では、{秋|あき}にきれいな{月|つき}を{見|み}て{楽|たの}しみます。これを「{月見|つきみ}」といいます。{月見|つきみ}では、{団子|だんご}を{食|た}べます。{団子|だんご}は{白|しろ}くて{丸|まる}いので、{月|つき}に{似|に}ています。',
    '{月|つき}の{中|なか}に、{何|なに}が{見|み}えますか。{日本|にほん}では、ウサギがもちを{作|つく}っていると{言|い}われています。でも、{国|くに}によって{見|み}えるものは{違|ちが}います。{本|ほん}を{読|よ}んでいる{女|おんな}の{人|ひと}がいるという{国|くに}もあります。',
    '{同|おな}じ{月|つき}でも、いろいろな{見方|みかた}があります。{皆|みな}さんも{秋|あき}の{月|つき}を{楽|たの}しんでください。',
  ],[
    'Di Jepang, orang menikmati bulan yang indah pada musim gugur. Kegiatan ini disebut tsukimi. Saat tsukimi, orang makan dango. Dango mirip bulan karena putih dan bulat.',
    'Apa yang tampak di bulan? Di Jepang, dikatakan bahwa ada kelinci yang sedang membuat mochi. Namun, gambaran yang dilihat berbeda menurut negara. Ada pula negara yang membayangkannya sebagai perempuan yang sedang membaca buku.',
    'Walaupun bulannya sama, cara melihatnya beragam. Nikmatilah juga bulan musim gugur.',
  ],[['月見','つきみ','tradisi menikmati bulan'],['団子','だんご','kue bulat dari tepung beras'],['見方','みかた','cara melihat atau memandang']],[
    ['月見は、いつ楽しむものですか。','Kapan orang menikmati tsukimi?', [['秋','Musim gugur'],['春だけ','Hanya musim semi'],['夏の朝だけ','Hanya pagi musim panas'],['冬だけ','Hanya musim dingin']], 'Paragraf pertama menempatkan kegiatan ini pada musim gugur.',0],
    ['団子が月に似ているのは、なぜですか。','Mengapa dango dikatakan mirip bulan?', [['白くて丸いから','Karena putih dan bulat'],['空にあるから','Karena berada di langit'],['うさぎが作るから','Karena dibuat kelinci'],['夜だけ食べるから','Karena hanya dimakan malam hari']], 'ので menunjukkan alasan: warna putih dan bentuk bulat.',0],
    ['日本では、月のうさぎは何をしていると言われていますか。','Dalam gambaran di Jepang, apa yang dilakukan kelinci di bulan?', [['もちを作っている','Membuat mochi'],['本を読んでいる','Membaca buku'],['団子を売っている','Menjual dango'],['山を歩いている','Berjalan di gunung']], 'Teks membedakan gambaran kelinci pembuat mochi dari perempuan pembaca buku di negara lain.',1],
    ['この文章からわかることは何ですか。','Apa yang dapat dipahami dari bacaan?', [['月の見方は国によって違う','Cara memandang gambaran di bulan berbeda menurut negara'],['どの国でも同じ動物が見える','Semua negara melihat hewan yang sama'],['日本では月を見てはいけない','Di Jepang tidak boleh melihat bulan'],['月見では本を作る','Orang membuat buku saat tsukimi']], '国によって…違います menegaskan keragaman cara menafsirkan gambaran pada bulan.',1],
  ]),
  passage('kc-seasons','N4','季節','Hal yang dinantikan setiap musim','006_kisetsu','野畑理佳','A2',[
    '{私|わたし}は{春|はる}を{待|ま}っています。{春|はる}は{公園|こうえん}に{行|い}って、{花|はな}を{見|み}ながらお{弁当|べんとう}を{食|た}べます。',
    '{夏|なつ}は{海|うみ}に{行|い}きます。{貝|かい}を{拾|ひろ}って、{波|なみ}の{音|おと}を{聞|き}きます。{疲|つか}れたら、{涼|すず}しい{部屋|へや}でスイカを{食|た}べます。',
    '{秋|あき}は{山|やま}で{栗|くり}を{拾|ひろ}います。{夜|よる}は{月|つき}を{見|み}ながら{栗|くり}ごはんを{食|た}べます。{冬|ふゆ}は{温泉|おんせん}に{行|い}きます。{暖|あたた}かいお{風呂|ふろ}に{入|はい}って、{星|ほし}を{見|み}ます。どの{季節|きせつ}にも{楽|たの}しみがあります。',
  ],[
    'Saya menantikan musim semi. Saat musim semi, saya pergi ke taman dan makan bekal sambil melihat bunga.',
    'Saat musim panas, saya pergi ke laut. Saya memungut kerang dan mendengarkan suara ombak. Jika lelah, saya makan semangka di kamar yang sejuk.',
    'Saat musim gugur, saya memungut kastanya di gunung. Malamnya saya makan nasi kastanya sambil melihat bulan. Saat musim dingin, saya pergi ke onsen, berendam dalam air hangat sambil melihat bintang. Setiap musim memiliki kesenangan tersendiri.',
  ],[['貝','かい','kerang'],['栗','くり','kastanya'],['温泉','おんせん','pemandian air panas alami']],[
    ['春は、どこでお弁当を食べますか。','Di mana penulis makan bekal pada musim semi?', [['公園','Taman'],['海の中','Di dalam laut'],['温泉','Onsen'],['駅','Stasiun']], 'Kegiatan melihat bunga dan makan bekal dilakukan setelah pergi ke taman.',0],
    ['夏に疲れたら、どうしますか。','Apa yang dilakukan jika lelah saat musim panas?', [['涼しい部屋でスイカを食べる','Makan semangka di kamar yang sejuk'],['山で栗を拾う','Memungut kastanya di gunung'],['熱いお風呂で走る','Berlari di pemandian panas'],['公園で雪を見る','Melihat salju di taman']], 'たら menyatakan kondisi. Sesudah lelah, kegiatannya pindah ke kamar sejuk.',1],
    ['月を見ながら、何を食べますか。','Apa yang dimakan sambil melihat bulan?', [['栗ごはん','Nasi kastanya'],['春のお弁当だけ','Hanya bekal musim semi'],['スイカだけ','Hanya semangka'],['貝だけ','Hanya kerang']], 'ながら menghubungkan dua kegiatan bersamaan: melihat bulan dan makan nasi kastanya.',2],
    ['筆者の気持ちに合うものはどれですか。','Pernyataan mana yang sesuai dengan perasaan penulis?', [['どの季節も楽しみたい','Ingin menikmati setiap musim'],['冬以外は嫌いだ','Tidak menyukai musim selain musim dingin'],['一年中部屋にいたい','Ingin terus berada di kamar sepanjang tahun'],['春には何もしたくない','Tidak ingin melakukan apa pun pada musim semi']], 'Kalimat penutup merangkum bahwa setiap musim mempunyai hal yang menyenangkan.',2],
  ]),
  passage('kc-exit','N4','非常口','Mengapa tanda pintu darurat memakai gambar','008_hijoguchi','戸田淑子・畠中朋子','A2',[
    '{非常口|ひじょうぐち}は、{火事|かじ}や{地震|じしん}などのときに{逃|に}げるための{出口|でぐち}です。{昔|むかし}、サインには「{非常口|ひじょうぐち}」という{文字|もじ}だけが{書|か}いてありました。',
    'しかし、{文字|もじ}だけでは、{子|こ}どもや{日本語|にほんご}がわからない{人|ひと}には{難|むずか}しいです。そこで、{絵|え}のサインが{作|つく}られました。',
    'この{本|ほん}によると、{今|いま}のサインは1982{年|ねん}に{決|き}まり、1987{年|ねん}には{国際的|こくさいてき}なサインになりました。{言葉|ことば}がわからなくても、{絵|え}を{見|み}れば{意味|いみ}がわかりやすくなります。',
  ],[
    'Pintu darurat adalah pintu keluar untuk menyelamatkan diri saat kebakaran, gempa, dan keadaan serupa. Dahulu tandanya hanya memuat tulisan “非常口”.',
    'Namun, tulisan saja sulit dipahami anak-anak dan orang yang tidak mengerti bahasa Jepang. Karena itu, dibuatlah tanda bergambar.',
    'Menurut buku sumber, desain tanda tersebut ditetapkan pada 1982 dan menjadi tanda internasional pada 1987. Meskipun bahasanya tidak dipahami, gambar membuat artinya lebih mudah dimengerti.',
  ],[['非常口','ひじょうぐち','pintu keluar darurat'],['文字','もじ','huruf atau tulisan'],['国際的','こくさいてき','internasional']],[
    ['非常口は、どんなときに使う出口ですか。','Pintu darurat digunakan dalam situasi seperti apa?', [['火事や地震などのとき','Saat kebakaran, gempa, dan keadaan serupa'],['昼ごはんを選ぶとき','Saat memilih makan siang'],['本を借りるとき','Saat meminjam buku'],['音楽を聞くときだけ','Hanya saat mendengarkan musik']], 'Untuk memahami pertanyaan, hubungkan 逃げるため dengan tujuan pintu tersebut.',0],
    ['昔のサインには、何が書いてありましたか。','Apa yang tertulis pada tanda dahulu?', [['「非常口」という文字だけ','Hanya tulisan 非常口'],['動物の絵だけ','Hanya gambar hewan'],['世界中の言葉','Semua bahasa di dunia'],['人の名前だけ','Hanya nama orang']], 'だけ membatasi isi tanda lama pada tulisan saja.',0],
    ['絵のサインを作ったのは、なぜですか。','Mengapa dibuat tanda bergambar?', [['文字を読めない人にもわかりやすくするため','Agar orang yang tidak dapat membaca tulisannya juga mudah memahami'],['出口を隠すため','Untuk menyembunyikan pintu keluar'],['日本語を難しくするため','Untuk membuat bahasa Jepang lebih sulit'],['建物を大きくするため','Untuk memperbesar bangunan']], 'そこで menghubungkan kesulitan memahami tulisan dengan solusi berupa gambar.',1],
    ['この本によると、国際的なサインになったのは何年ですか。','Menurut buku sumber, kapan tanda itu menjadi internasional?', [['1987年','Tahun 1987'],['1982年','Tahun 1982'],['1970年','Tahun 1970'],['2015年','Tahun 2015']], '1982 adalah tahun penetapan desain; 1987 adalah tahun menjadi tanda internasional.',2],
  ]),
  passage('kc-pumpkin','N4','かぼちゃ','Perjalanan nama kabocha','009_kabocha','戸田淑子・畠中朋子','A2',[
    'かぼちゃは、もともとアメリカ{大陸|たいりく}の{野菜|やさい}です。その{後|あと}、{世界|せかい}に{広|ひろ}がりました。',
    'この{本|ほん}では、ポルトガル{人|じん}がカンボジアから{日本|にほん}にかぼちゃを{持|も}ってきたと{説明|せつめい}しています。{当時|とうじ}の{日本人|にほんじん}は、カンボジアの{野菜|やさい}だと{思|おも}いました。それで、カンボジアという{国|くに}の{名前|なまえ}が「かぼちゃ」という{名前|なまえ}のもとになりました。',
    'かぼちゃは{夏|なつ}の{野菜|やさい}ですが、{長|なが}く{保存|ほぞん}できます。{冬|ふゆ}にも{食|た}べられるので、{便利|べんり}です。{料理|りょうり}には、みそ{汁|しる}や{天|てん}ぷらなどがあります。',
  ],[
    'Labu kabocha awalnya berasal dari benua Amerika. Kemudian labu ini menyebar ke dunia.',
    'Buku ini menjelaskan bahwa orang Portugis membawa kabocha dari Kamboja ke Jepang. Orang Jepang saat itu mengira labu tersebut merupakan sayuran Kamboja. Karena itu, nama negara Kamboja menjadi asal nama “kabocha”.',
    'Kabocha adalah sayuran musim panas, tetapi dapat disimpan lama. Karena dapat dimakan pada musim dingin juga, sayuran ini praktis. Olahannya antara lain sup miso dan tempura.',
  ],[['大陸','たいりく','benua'],['当時','とうじ','pada masa itu'],['保存','ほぞん','penyimpanan; mengawetkan']],[
    ['かぼちゃは、もともとどこの野菜ですか。','Dari mana asal kabocha?', [['アメリカ大陸','Benua Amerika'],['日本だけ','Hanya Jepang'],['北ヨーロッパ','Eropa Utara'],['大阪','Osaka']], 'Asal tanaman pada paragraf pertama berbeda dari tempat perantara dan asal namanya.',0],
    ['日本にかぼちゃを持ってきたのは、だれですか。','Menurut bacaan, siapa yang membawa kabocha ke Jepang?', [['ポルトガル人','Orang Portugis'],['日本の子ども','Anak-anak Jepang'],['アメリカの先生','Guru dari Amerika'],['大阪の学生','Mahasiswa Osaka']], 'ポルトガル人が adalah pelaku yang membawa tanaman dari Kamboja.',1],
    ['「かぼちゃ」という名前は、何からできましたか。','Nama kabocha berasal dari apa?', [['カンボジアという国の名前','Nama negara Kamboja'],['日本の町の名前','Nama kota di Jepang'],['料理を作る人の名前','Nama orang yang memasaknya'],['冬という季節の名前','Nama musim dingin']], 'Nama negara perantara menjadi asal sebutan, bukan asal botanis tanaman.',1],
    ['冬にも食べられるのは、なぜですか。','Mengapa kabocha juga dapat dimakan pada musim dingin?', [['長く保存できるから','Karena dapat disimpan lama'],['冬にしか育たないから','Karena hanya tumbuh pada musim dingin'],['夏には食べられないから','Karena tidak dapat dimakan pada musim panas'],['毎日外国から来るから','Karena datang dari luar negeri setiap hari']], 'が menunjukkan perbedaan antara musim panen dan lamanya penyimpanan.',2],
  ]),
  passage('kc-hermit','N4','ヤドカリにげた','Yadorin menghilang','011_yadokari','三浦睦月','A2',[
    'たかしくんは、ヤドリンという{名前|なまえ}のヤドカリを{飼|か}っています。ある{日|ひ}、ヤドリンがごはんを{食|た}べませんでした。{母|はは}に{聞|き}いてからチーズをあげると、{食|た}べました。{次|つぎ}の{日|ひ}はポップコーンも{食|た}べました。',
    'その{次|つぎ}の{日|ひ}、ヤドリンがいなくなりました。{家|いえ}のまわりを{探|さが}しましたが、いません。たかしくんは「{海|うみ}へ{行|い}ったのかもしれない」と{思|おも}いました。{家族|かぞく}は{車|くるま}で{探|さが}しに{行|い}きました。',
    '{浜辺|はまべ}には、ヤドカリがたくさんいました。その{中|なか}にヤドリンがいました。{新|あたら}しい{友|とも}だちと{遊|あそ}んでいたのです。{父|ちち}は「{友|とも}だちがほしかったんだね」と{言|い}いました。',
  ],[
    'Takashi memelihara kelomang bernama Yadorin. Suatu hari Yadorin tidak mau makan. Setelah meminta izin kepada ibunya, Takashi memberinya keju dan Yadorin memakannya. Keesokan harinya ia juga makan popcorn.',
    'Sehari setelah itu, Yadorin menghilang. Mereka mencarinya di sekitar rumah, tetapi tidak menemukannya. Takashi berpikir bahwa Yadorin mungkin pergi ke laut. Keluarganya pergi mencarinya dengan mobil.',
    'Di pantai ada banyak kelomang. Yadorin ada di antara mereka dan sedang bermain dengan teman-teman baru. Ayah berkata, “Rupanya ia ingin punya teman.”',
  ],[['ヤドカリ','ヤドカリ','kelomang'],['飼う','かう','memelihara hewan'],['浜辺','はまべ','tepi pantai']],[
    ['最初に食べたと書いてあるものは、何ですか。','Makanan apa yang pertama kali disebut dimakan Yadorin?', [['チーズ','Keju'],['ポップコーン','Popcorn'],['魚','Ikan'],['りんご','Apel']], 'Keju dimakan pada hari pertama cerita; popcorn baru pada hari berikutnya.',0],
    ['「海へ行ったのかもしれない」は、どんな意味ですか。','Apa maksud 海へ行ったのかもしれない?', [['海へ行った可能性がある','Mungkin ia pergi ke laut'],['絶対に海へ行っていない','Pasti ia tidak pergi ke laut'],['必ず家の中にいる','Pasti ia berada di dalam rumah'],['もう海で見つけた','Sudah menemukannya di laut']], 'かもしれない menunjukkan dugaan, bukan kepastian atau hasil penemuan.',1],
    ['ヤドリンは、どこで見つかりましたか。','Di mana Yadorin ditemukan?', [['浜辺','Tepi pantai'],['冷蔵庫','Lemari es'],['車の下','Di bawah mobil'],['学校','Sekolah']], 'Paragraf terakhir menyebut Yadorin berada di antara kelomang di pantai.',2],
    ['お父さんは、ヤドリンが何をほしかったと思いましたか。','Menurut ayah, apa yang diinginkan Yadorin?', [['友だち','Teman'],['新しい車','Mobil baru'],['冷蔵庫','Lemari es'],['学校の本','Buku sekolah']], 'Ini adalah kesimpulan ayah setelah melihat Yadorin bermain dengan kelomang lain.',2],
  ]),
  passage('kc-wishes','N3','あなたへの3つのおねがい','Tiga ajakan untuk menikmati hari','016_anata','田中哲哉','A2',[
    '{雨|あめ}の{日|ひ}には、{傘|かさ}をさして{外|そと}を{歩|ある}いてみてください。そして、{雨|あめ}の{音|おと}に{耳|みみ}を{向|む}けてください。ポツポツ、ピシャピシャ。{雨|あめ}は{命|いのち}を{育|はぐく}んでいます。その{音|おと}を{聞|き}くと、{地球|ちきゅう}の{音|おと}を{聞|き}いているように{感|かん}じられます。',
    '{晴|は}れた{日|ひ}には、{窓|まど}を{開|あ}けて{空|そら}を{見|み}てください。{風|かぜ}を{感|かん}じながら、{色|いろ}を{眺|なが}めてみましょう。{空|そら}は{青|あお}いとは{限|かぎ}りません。{白|しろ}やオレンジ、{黒|くろ}に{見|み}えることもあります。いつでも、だれの{上|うえ}にも、{広|ひろ}い{空|そら}があります。',
    '{曇|くも}りの{日|ひ}には、{好|す}きなカップで{温|あたた}かいお{茶|ちゃ}をゆっくり{飲|の}んでください。{体|からだ}だけでなく、{心|こころ}も{少|すこ}し{温|あたた}かくなるかもしれません。だれと{一緒|いっしょ}に{飲|の}みたいですか。その{人|ひと}を{思|おも}い{出|だ}しながら、{静|しず}かな{時間|じかん}を{過|す}ごしてください。',
  ],[
    'Saat hujan, cobalah berjalan di luar dengan payung. Dengarkan suara hujan: rintik-rintik, percikan air. Hujan menumbuhkan kehidupan. Mendengarkan suaranya terasa seperti mendengarkan suara bumi.',
    'Saat cerah, bukalah jendela dan lihatlah langit. Nikmati warnanya sambil merasakan angin. Langit tidak selalu biru; kadang terlihat putih, jingga, atau hitam. Langit yang luas selalu ada di atas setiap orang.',
    'Saat berawan, minumlah teh hangat perlahan dengan cangkir kesukaan. Bukan hanya tubuh, hati pun mungkin menjadi sedikit hangat. Dengan siapa kamu ingin minum teh? Nikmati waktu yang tenang sambil mengingat orang itu.',
  ],[['育む','はぐくむ','menumbuhkan; memelihara kehidupan'],['眺める','ながめる','memandangi'],['とは限らない','とはかぎらない','tidak selalu demikian']],[
    ['雨の日に、筆者が特にしてほしいことは何ですか。','Apa yang terutama diajak penulis untuk dilakukan saat hujan?', [['雨の音をよく聞くこと','Mendengarkan suara hujan dengan saksama'],['雨の量を毎日記録すること','Mencatat jumlah hujan setiap hari'],['傘を持たずに走ること','Berlari tanpa membawa payung'],['外の音を全部消すこと','Menghilangkan semua suara di luar']], 'Ajakan penulis berfokus pada perhatian terhadap bunyi, bukan pengukuran cuaca.',0],
    ['「空は青いとは限りません」とあるのは、なぜですか。','Mengapa disebut bahwa langit tidak selalu biru?', [['ほかの色に見えることもあるから','Karena langit juga dapat terlihat berwarna lain'],['青い空は存在しないから','Karena langit biru tidak ada'],['窓を開けると色が消えるから','Karena membuka jendela menghilangkan warna'],['晴れた日は空がないから','Karena tidak ada langit saat cerah']], 'とは限らない menolak anggapan bahwa sesuatu selalu demikian; bukan berarti tidak pernah biru.',1],
    ['最後の「その人」は、だれを指していますか。','Siapa yang dirujuk oleh その人 pada bagian akhir?', [['一緒にお茶を飲みたい人','Orang yang ingin diajak minum teh bersama'],['カップを売っている人','Orang yang menjual cangkir'],['天気を知らせる人','Orang yang mengumumkan cuaca'],['知らない通行人','Orang lewat yang tidak dikenal']], 'Rujukannya adalah orang dalam pertanyaan tepat sebelumnya: だれと一緒に飲みたいですか.',2],
    ['この文章全体で、筆者は何を勧めていますか。','Secara keseluruhan, apa yang dianjurkan penulis?', [['身近なものに目を向けて、ゆっくり過ごすこと','Memperhatikan hal di sekitar dan menikmati waktu dengan tenang'],['毎日予定をいっぱいにすること','Memenuhi jadwal setiap hari'],['晴れた日だけ外に出ること','Keluar hanya saat cerah'],['高価なカップを集めること','Mengoleksi cangkir mahal']], 'Ketiga ajakan sama-sama mengarahkan perhatian pada pengalaman sederhana: bunyi, langit, dan teh.',2],
  ]),
  passage('kc-concert','N3','コンサートに行こう！','Beragam cara menikmati konser','017_concert','湯本かほり','A2',[
    '{人気|にんき}アイドルグループのいずみは、コンサートが{始|はじ}まる{前|まえ}、{緊張|きんちょう}しています。{最初|さいしょ}の{元気|げんき}な{歌|うた}が{始|はじ}まると、{客|きゃく}は{飛|と}び{跳|は}ねます。しかし、{会場|かいじょう}で{写真|しゃしん}を{撮|と}ったり、ビデオを{撮|と}ったりしてはいけません。',
    '{次|つぎ}は、{恋人|こいびと}を{思|おも}う{悲|かな}しい{歌|うた}です。{体|からだ}を{横|よこ}に{動|うご}かしている{人|ひと}もいれば、{泣|な}いている{人|ひと}もいます。{同|おな}じ{歌|うた}を{聞|き}いていても、{客|きゃく}の{反応|はんのう}はさまざまです。',
    'いずみは、{座|すわ}ったまま{聞|き}いている{人|ひと}にも{気|き}づきます。「ぼくたちの{歌|うた}をよく{聞|き}きたいんですね」と{考|かんが}えます。{一方|いっぽう}で、グループと{同|おな}じ{服|ふく}を{着|き}て、{歌|うた}もダンスも{完璧|かんぺき}にまねする{人|ひと}もいます。いずみは、そんな{客|きゃく}もきっと{楽|たの}しいだろうと{思|おも}います。',
  ],[
    'Izumi, anggota grup idola populer, merasa tegang sebelum konser dimulai. Ketika lagu pertama yang ceria mulai dimainkan, penonton melompat-lompat. Namun, mengambil foto atau video di tempat konser dilarang.',
    'Berikutnya adalah lagu sedih tentang kerinduan kepada kekasih. Ada yang menggerakkan tubuh ke samping, ada pula yang menangis. Walaupun mendengarkan lagu yang sama, respons penonton beragam.',
    'Izumi juga memperhatikan orang yang tetap duduk mendengarkan. Ia berpikir bahwa orang itu ingin mendengarkan lagu mereka dengan saksama. Di sisi lain, ada yang berpakaian sama dengan grup itu serta menirukan lagu dan tarian dengan sempurna. Izumi merasa penonton seperti itu pun pasti menikmatinya.',
  ],[['緊張','きんちょう','ketegangan; gugup'],['反応','はんのう','reaksi'],['完璧','かんぺき','sempurna']],[
    ['会場で禁止されていることは何ですか。','Apa yang dilarang di tempat konser?', [['写真やビデオを撮ること','Mengambil foto atau video'],['歌を聞くこと','Mendengarkan lagu'],['座っていること','Tetap duduk'],['歌に合わせて体を動かすこと','Menggerakkan tubuh mengikuti lagu']], 'Larangan してはいけません hanya dikaitkan dengan pengambilan foto dan video.',0],
    ['悲しい歌のとき、客はどうしていますか。','Bagaimana respons penonton saat lagu sedih?', [['体を動かす人も、泣く人もいる','Ada yang menggerakkan tubuh dan ada yang menangis'],['全員が会場を出る','Semuanya keluar dari tempat konser'],['全員が同じ反応をする','Semuanya bereaksi sama'],['だれも聞いていない','Tidak seorang pun mendengarkan']], 'もいれば…もいます menunjukkan adanya beberapa macam respons.',1],
    ['いずみは、座って聞く人をどう見ていますか。','Bagaimana Izumi memandang penonton yang duduk mendengarkan?', [['歌をよく聞きたいのだろうと考えている','Menganggapnya ingin menyimak lagu dengan baik'],['必ず退屈していると決めつけている','Memastikan bahwa orang itu bosan'],['帰ってほしいと思っている','Ingin orang itu pulang'],['撮影していると疑っている','Mencurigainya merekam']], 'Duduk diam tidak disimpulkan sebagai bosan. Izumi justru mengaitkannya dengan keinginan menyimak.',2],
    ['文章の内容に合うものはどれですか。','Pernyataan mana yang sesuai dengan keseluruhan bacaan?', [['客はそれぞれの方法でコンサートを楽しんでいる','Penonton menikmati konser dengan cara masing-masing'],['楽しむためには全員が同じ服を着る必要がある','Semua orang harus memakai baju yang sama agar menikmati konser'],['静かな客は歌を嫌っている','Penonton yang tenang membenci lagu'],['踊れる人しか入れない','Hanya orang yang bisa menari boleh masuk']], 'Contoh duduk, menangis, bergerak, dan meniru tarian menunjukkan cara menikmati yang beragam.',2],
  ]),
  passage('kc-wedding','N3','結婚式','Pernikahan dan rasa terima kasih','026_kekkonshiki','香月裕介','A2',[
    '{私|わたし}たちは、{秋|あき}に{神社|じんじゃ}で{結婚式|けっこんしき}をしました。{神社|じんじゃ}でする{結婚式|けっこんしき}を「{神前式|しんぜんしき}」といいます。{新郎|しんろう}は{紋付|もんつき}はかま、{新婦|しんぷ}は{白|しろ}むくを{着|き}て、{神様|かみさま}に{結婚|けっこん}を{報告|ほうこく}しました。',
    '{式|しき}の{後|あと}には、{披露宴|ひろうえん}というパーティーを{開|ひら}きました。{新婦|しんぷ}は{白|しろ}むくからウエディングドレスに{着替|きが}えました。{式|しき}とパーティーでは、{服装|ふくそう}が{違|ちが}ったのです。',
    '{披露宴|ひろうえん}の{最後|さいご}に、{両親|りょうしん}に{花束|はなたば}を{渡|わた}しました。「ありがとう」という{気持|きも}ちを{伝|つた}えたかったからです。{両親|りょうしん}は{喜|よろこ}んで、{笑|わら}ったり{泣|な}いたりしていました。{家族|かぞく}や{友人|ゆうじん}がたくさん{集|あつ}まってくれたおかげで、{本当|ほんとう}に{幸|しあわ}せな{一日|いちにち}になりました。',
  ],[
    'Kami menikah pada musim gugur di kuil Shinto. Pernikahan di kuil Shinto disebut shinzenshiki. Pengantin pria memakai montsuki hakama dan pengantin wanita memakai shiromuku untuk melaporkan pernikahan kepada dewa.',
    'Setelah upacara, kami mengadakan pesta resepsi yang disebut hirōen. Pengantin wanita mengganti shiromuku dengan gaun pengantin. Jadi, pakaian pada upacara dan resepsi berbeda.',
    'Pada akhir resepsi, kami menyerahkan buket bunga kepada orang tua karena ingin menyampaikan rasa terima kasih. Orang tua kami gembira, tersenyum dan menangis. Berkat berkumpulnya banyak anggota keluarga dan teman, hari itu benar-benar membahagiakan.',
  ],[['神前式','しんぜんしき','upacara pernikahan Shinto'],['披露宴','ひろうえん','resepsi pernikahan'],['白むく','しろむく','busana pengantin tradisional serba putih']],[
    ['この二人は、どこで結婚式をしましたか。','Di mana pasangan ini melaksanakan upacara pernikahan?', [['神社','Kuil Shinto'],['大学の教室','Ruang kuliah'],['図書館','Perpustakaan'],['駅の前','Depan stasiun']], 'Lokasi upacara disebut pada kalimat pertama; resepsi adalah kegiatan setelahnya.',0],
    ['新婦の服装について、正しいものはどれですか。','Pernyataan mana yang benar mengenai pakaian pengantin wanita?', [['式では白むく、披露宴ではドレスだった','Shiromuku saat upacara, gaun saat resepsi'],['式でも披露宴でも紋付はかまだった','Montsuki hakama pada upacara maupun resepsi'],['ずっと同じ服だった','Terus memakai pakaian yang sama'],['披露宴で初めて白むくを着た','Baru memakai shiromuku saat resepsi']], 'から…に着替えました menunjukkan perubahan dari shiromuku ke gaun.',1],
    ['両親に花束を渡した理由は何ですか。','Mengapa pasangan itu memberikan bunga kepada orang tua?', [['感謝の気持ちを伝えたかったから','Untuk menyampaikan rasa terima kasih'],['両親を早く帰らせたかったから','Agar orang tua segera pulang'],['服を借りたかったから','Untuk meminjam pakaian'],['式を中止したかったから','Untuk membatalkan upacara']], 'からです menyatakan alasan yang eksplisit: ingin mengatakan terima kasih.',2],
    ['両親が泣いていたことについて、文章から何がわかりますか。','Apa yang dapat dipahami tentang tangisan orang tua?', [['喜びながら泣いていた','Mereka menangis sambil merasa bahagia'],['結婚に必ず反対していた','Mereka pasti menentang pernikahan'],['会場に入れず困っていた','Mereka kesulitan karena tidak boleh masuk'],['花束をなくして悲しんでいた','Mereka sedih karena kehilangan bunga']], '泣く tidak selalu berarti sedih. Konteksnya adalah 喜んで, yaitu gembira.',2],
  ]),
  passage('kc-job','N3','アインさんアルバイトをする？','Mencari pekerjaan paruh waktu','027_anhsanarbeitwosuru','大西薫','A2',[
    'アインさんは、{先週|せんしゅう}のコンサートでグッズをたくさん{買|か}ったため、お{金|かね}がなくなってしまいました。{友達|ともだち}は、{自分|じぶん}が{働|はたら}いているファミリーレストランで{一緒|いっしょ}にアルバイトをしないかと{誘|さそ}いました。かわいい{制服|せいふく}を{見|み}たアインさんは、すぐに{興味|きょうみ}を{持|も}ちました。',
    'レストランに{電話|でんわ}すると、{仕事|しごと}の{経験|けいけん}があるか{聞|き}かれました。アインさんにはレストランで{働|はたら}いた{経験|けいけん}はありません。{働|はたら}ける{曜日|ようび}を{聞|き}かれると、「{木曜日|もくようび}なら{大丈夫|だいじょうぶ}です」と{答|こた}えました。',
    'ところが、{週末|しゅうまつ}について{聞|き}かれると、「{絶対|ぜったい}に{無理|むり}です。{週末|しゅうまつ}は{好|す}きなグループのライブがよくあるので」と{答|こた}えました。{相手|あいて}は「それでは、けっこうです。お{電話|でんわ}ありがとうございました」と{言|い}い、{電話|でんわ}を{切|き}りました。アインさんは、{別|べつ}のアルバイトを{探|さが}すことになりました。',
  ],[
    'Anh kehabisan uang karena membeli banyak barang suvenir pada konser pekan lalu. Temannya mengajak bekerja paruh waktu bersama di restoran keluarga tempat ia bekerja. Setelah melihat seragam yang lucu, Anh langsung tertarik.',
    'Saat menelepon restoran, Anh ditanya apakah memiliki pengalaman kerja. Ia belum pernah bekerja di restoran. Ketika ditanya hari apa ia bisa bekerja, ia menjawab bahwa hari Kamis bisa.',
    'Namun, saat ditanya mengenai akhir pekan, ia menjawab bahwa itu sama sekali tidak mungkin karena grup favoritnya sering mengadakan konser pada akhir pekan. Pihak restoran berkata, “Kalau begitu, tidak usah. Terima kasih sudah menelepon,” lalu mengakhiri telepon. Anh akhirnya harus mencari pekerjaan paruh waktu lain.',
  ],[['制服','せいふく','seragam'],['経験','けいけん','pengalaman'],['けっこうです','けっこうです','tidak usah; cukup (penolakan dalam konteks ini)']],[
    ['アインさんにお金がない理由は何ですか。','Mengapa Anh kehabisan uang?', [['コンサートでグッズをたくさん買ったから','Karena membeli banyak suvenir konser'],['制服を全部買い取ったから','Karena membeli semua seragam'],['レストランを開いたから','Karena membuka restoran'],['電話代だけに使ったから','Karena hanya menghabiskannya untuk biaya telepon']], 'ため menyatakan sebab: pembelian banyak suvenir membuat uangnya habis.',0],
    ['アインさんが働けると言ったのは、いつですか。','Kapan Anh mengatakan bisa bekerja?', [['木曜日','Hari Kamis'],['週末だけ','Hanya akhir pekan'],['毎日','Setiap hari'],['日曜日だけ','Hanya hari Minggu']], 'なら pada 木曜日なら membatasi jawaban pada kondisi hari Kamis.',1],
    ['週末に働けないと答えたのは、なぜですか。','Mengapa ia menjawab tidak bisa bekerja pada akhir pekan?', [['好きなグループのライブによく行きたいから','Karena ingin menghadiri konser grup favorit yang sering berlangsung saat itu'],['いつも大学の試験があるから','Karena selalu ada ujian universitas'],['レストランが休みだから','Karena restorannya tutup'],['制服を借りられないから','Karena tidak dapat meminjam seragam']], 'Penolakannya berkaitan dengan konser grup favorit, bukan jadwal kuliah atau tutupnya restoran.',2],
    ['この場面の「それでは、けっこうです」は、何を表していますか。','Apa arti それでは、けっこうです dalam situasi ini?', [['今回は採用を進めないということ','Tidak melanjutkan penerimaan kerja kali ini'],['すぐに仕事を始めてほしいということ','Meminta Anh langsung mulai bekerja'],['給料を増やすということ','Akan menaikkan gaji'],['週末のライブを予約するということ','Akan memesan tiket konser akhir pekan']], 'Makna dilihat dari kelanjutannya: telepon diakhiri dan Anh harus mencari pekerjaan lain. Di sini けっこうです adalah penolakan.',2],
  ]),
  passage('kc-idol','N3','アイドルやめたい','Surat yang mengubah keputusan Saki','022_idolyametai','湯本かほり','A2/B1',[
    'アイドルグループのサキは、{仕事|しごと}をやめたいと{思|おも}っていました。ほかのメンバーほど{歌|うた}やダンスが{上手|じょうず}ではなく、{目立|めだ}たないと{感|かん}じていたからです。スタッフに{名前|なまえ}を{忘|わす}れられることもあり、{自信|じしん}をなくしていました。',
    'それに、アイドルは{私生活|しせいかつ}でも{気|き}をつけなければなりません。サキは{疲|つか}れてしまい、やめたら{農家|のうか}になろうか、それとも{大学|だいがく}に{行|い}こうかと{考|かんが}えていました。まだ、どちらにするか{決|き}めたわけではありませんでした。',
    '{元気|げんき}のないサキを{心配|しんぱい}したマネージャーが、ファンからの{手紙|てがみ}を{持|も}ってきました。サキは{最初|さいしょ}、また{目立|めだ}たないことを{指摘|してき}されるのだろうと{思|おも}いました。しかし、{手紙|てがみ}には、サキが{頑張|がんば}る{姿|すがた}にいつも{元気|げんき}をもらっている、{応援|おうえん}しているという{内容|ないよう}が{書|か}かれていました。',
    '{読|よ}み{終|お}えたサキは、{立|た}ち{上|あ}がりました。そして、「アイドルをやめない」と{決|き}めました。{自分|じぶん}の{頑張|がんば}りを{見|み}てくれている{人|ひと}がいたのです。',
  ],[
    'Saki, anggota grup idola, ingin berhenti bekerja. Ia merasa tidak sepandai anggota lain dalam menyanyi dan menari serta kurang menonjol. Staf kadang melupakan namanya, sehingga ia kehilangan kepercayaan diri.',
    'Selain itu, idola harus berhati-hati juga dalam kehidupan pribadi. Karena lelah, Saki memikirkan apakah akan menjadi petani atau masuk universitas jika berhenti. Ia belum benar-benar memutuskan salah satunya.',
    'Manajer yang mengkhawatirkan Saki membawakan surat penggemar. Awalnya, Saki mengira surat itu kembali akan menyoroti bahwa dirinya kurang menonjol. Namun, surat itu berisi pesan bahwa pengirim selalu mendapat semangat dari usaha Saki dan mendukungnya.',
    'Setelah selesai membaca, Saki berdiri. Ia memutuskan tidak berhenti menjadi idola. Ternyata ada orang yang memperhatikan usahanya.',
  ],[['目立つ','めだつ','menonjol; menarik perhatian'],['私生活','しせいかつ','kehidupan pribadi'],['応援','おうえん','dukungan; menyemangati']],[
    ['サキが自信をなくしていた理由として、正しいものはどれですか。','Alasan mana yang benar mengenai hilangnya kepercayaan diri Saki?', [['目立たず、名前を忘れられることもあったから','Karena merasa kurang menonjol dan namanya kadang dilupakan'],['ファンが多すぎたから','Karena penggemarnya terlalu banyak'],['大学を卒業できなかったから','Karena tidak bisa lulus universitas'],['農家の仕事に失敗したから','Karena gagal bekerja sebagai petani']], 'Masalah yang telah dialaminya adalah kurang menonjol dan dilupakan. Petani dan kuliah baru merupakan kemungkinan.',0],
    ['仕事をやめた後のことについて、サキはどう考えていましたか。','Apa yang dipikirkan Saki mengenai kehidupan setelah berhenti?', [['いくつか考えていたが、まだ決めていなかった','Memikirkan beberapa pilihan, tetapi belum memutuskan'],['必ず農家になると決めていた','Sudah pasti memutuskan menjadi petani'],['もう大学に通っていた','Sudah berkuliah'],['何も考えたことがなかった','Sama sekali belum pernah memikirkannya']], '決めたわけではありません menyangkal bahwa keputusan sudah diambil.',1],
    ['ファンの手紙は、サキの予想とどう違いましたか。','Bagaimana surat penggemar berbeda dari dugaan Saki?', [['批判ではなく、応援する内容だった','Isinya dukungan, bukan kritik'],['やめるように命令していた','Memerintahkannya untuk berhenti'],['仕事の予定しか書いていなかった','Hanya berisi jadwal kerja'],['知らない人の名前しかなかった','Hanya memuat nama orang yang tidak dikenal']], 'しかし membalik dugaan Saki. Penggemar justru memperoleh semangat dari usahanya.',2],
    ['最後にサキが仕事を続けようと思ったのは、なぜですか。','Mengapa akhirnya Saki ingin melanjutkan pekerjaannya?', [['自分の頑張りを見て応援してくれる人がいるとわかったから','Karena menyadari ada orang yang memperhatikan dan mendukung usahanya'],['すぐに一番有名になったから','Karena langsung menjadi yang paling terkenal'],['マネージャーにやめるなと命令されたから','Karena manajer memerintahkannya agar tidak berhenti'],['大学がなくなったから','Karena universitasnya tidak ada lagi']], 'Perubahan keputusan terjadi sesudah membaca dukungan penggemar, bukan karena popularitas mendadak atau perintah.',3],
  ]),
];
