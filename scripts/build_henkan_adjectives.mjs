import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {KOTOBA_N3_ENTRIES} from '../kotoba-n3-data.js';

// The workbook's part-of-speech tags include nouns, adverbs and fixed phrases.
// Keep these out of a context-free adjective conversion exercise.
const exclusions = {
  独身:'Nomina/～の; bukan kata sifat な biasa.',
  同じ:'Bentuk khusus: 同じく dan 同じに bergantung konteks; tidak mengikuti semua pola な.',
  あいにく:'Pemakaian utama sebagai adverb/ungkapan; memerlukan konteks.',
  かなり:'Pemakaian utama sebagai adverb derajat; bukan latihan perubahan biasa.',
  いけない:'Ungkapan larangan/penilaian yang perlu konteks, juga dapat tertukar dengan potensial negatif 行けない.',
  直:'Bacaan じき pada sumber berarti segera; adverb waktu.',
  大:'Entri だい bersifat nominal/prefiks; bukan kata sifat mandiri untuk latihan ini.',
  偶:'Entri たま menyatakan frekuensi; perlu konteks.',
  違いない:'Ungkapan kepastian ～に違いない, bukan kata sifat mandiri.',
  直接:'Pemakaian utama sebagai adverb atau ～の; konteks diperlukan.',
  罪:'Sumber memakai arti nomina; pemakaian な bersifat kiasan dan perlu konteks.',
  疑問:'Sumber memakai arti nomina keraguan/pertanyaan; perlu konteks predikat.',
  共通:'Umumnya 共通の atau 共通する; tidak diperlakukan sebagai な biasa.',
  主要:'Lazim sebagai pewatas 主要な; latihan predikat mandiri memerlukan konteks.',
  相当:'Banyak fungsi dan makna (adverb/nomina/する); perlu konteks.',
  損:'Sumber memakai arti nomina kerugian; perlu konteks.',
  突然:'Pemakaian utama adverb waktu; perlu konteks.',
  非常:'Makna nomina darurat dan adverb 非常に berbeda; perlu konteks.',
  不可:'Nomina penilaian/larangan; tidak diajarkan sebagai な biasa.',
  不足:'Umumnya nomina/する; tidak diajarkan sebagai な biasa.',
  不平:'Sumber memakai arti nomina keluhan; bukan kata sifat mandiri untuk latihan ini.',
};

// Meanings here describe the adjective use, rather than noun glosses in the source.
const meanings = {
  暇:'senggang / memiliki waktu luang',自然:'alami / wajar',必要:'perlu / diperlukan',不満:'tidak puas',
  残念:'disayangkan / mengecewakan',無理:'mustahil / terlalu berat',怖い:'menakutkan / merasa takut',
  明らか:'jelas / nyata',温かい:'hangat (benda atau perasaan)',新た:'baru',意外:'tak terduga / mengejutkan',
  異常:'tidak normal',偉大:'agung / luar biasa',永遠:'abadi',永久:'kekal / permanen',
  幼い:'masih kecil / belum dewasa',恐ろしい:'mengerikan / menakutkan',穏やか:'tenang / lembut',温暖:'hangat (iklim)',
  快適:'nyaman',確実:'pasti / dapat diandalkan',賢い:'cerdas / bijaksana',硬い:'keras / kaku',
  かわいそう:'patut dikasihani',かわいらしい:'manis / menggemaskan',完全:'sempurna / lengkap',貴重:'berharga',
  きつい:'ketat / berat / keras',気の毒:'patut dikasihani / disayangkan',奇妙:'aneh / ganjil',逆:'berlawanan / terbalik',
  急激:'drastis / mendadak',急速:'pesat / cepat',器用:'terampil / cekatan',強力:'kuat',巨大:'sangat besar',
  臭い:'berbau tidak sedap',クラシック:'klasik',苦しい:'susah / menyakitkan / sesak',詳しい:'terperinci / paham dengan baik',
  けち:'pelit / kikir',健康:'sehat',濃い:'pekat / kental / kuat (warna atau rasa)',幸運:'beruntung',高価:'mahal',
  豪華:'mewah',高速:'berkecepatan tinggi',幸福:'bahagia',困難:'sulit',最高:'terbaik / tertinggi',最低:'terburuk / terendah',
  幸い:'menguntungkan / membawa keberuntungan',様々:'bermacam-macam / beragam',幸せ:'bahagia',親しい:'akrab / dekat',
  重大:'serius / sangat penting',順調:'lancar',正直:'jujur / terus terang',上等:'bermutu tinggi / bagus',
  真剣:'serius / sungguh-sungguh',深刻:'serius / gawat',新鮮:'segar',慎重:'hati-hati',鋭い:'tajam',
  清潔:'bersih / higienis',正式:'resmi',贅沢:'mewah / berlebihan',積極的:'aktif / proaktif',粗末:'sederhana / kurang bermutu',
  退屈:'bosan / membosankan',平ら:'datar / rata',たまらない:'tak tertahankan',単純:'sederhana / tidak rumit',
  '辛い|つらい':'berat / menyakitkan secara fisik atau batin',適切:'tepat / sesuai',適度:'secukupnya / tidak berlebihan',
  同一:'sama / identik',同様:'serupa / sama',得意:'mahir / merasa percaya diri dalam suatu bidang',独特:'khas / unik',
  苦手:'kurang mahir / tidak nyaman menghadapi sesuatu',莫大:'amat besar (jumlah)',激しい:'hebat / intens / dahsyat',
  等しい:'setara / sama',秘密:'rahasia',平等:'setara / adil',不幸:'tidak bahagia / malang',無事:'selamat / tanpa masalah',
  不思議:'aneh / mengherankan',不自由:'terbatas / tidak leluasa',不正:'tidak jujur / tidak sah',不利:'tidak menguntungkan',
  平和:'damai',豊富:'melimpah',貧しい:'miskin / serba kekurangan',真っ赤:'merah menyala',満足:'puas / memadai',
  見事:'mengagumkan / sangat bagus',密:'rapat / padat',妙:'aneh',夢中:'sangat asyik / tenggelam dalam suatu kegiatan',
  明確:'jelas / tegas',迷惑:'mengganggu / merepotkan',面倒:'merepotkan / menyusahkan',厄介:'merepotkan / sulit ditangani',
  有効:'efektif / berlaku sah',優秀:'unggul / berprestasi',有能:'cakap / kompeten',有利:'menguntungkan',愉快:'menyenangkan',
  豊か:'kaya / makmur / melimpah',容易:'mudah',余分:'berlebih / tambahan',楽:'nyaman / mudah',利口:'pintar / cerdik',
  冷静:'tenang / berkepala dingin',わがまま:'egois / semaunya sendiri',僅か:'sedikit',
};

// Reviewed ～さ nouns only. Other nominal patterns (e.g. 悲しみ) are not tested.
const nouns = {
  大きい:'ukuran / besarnya',小さい:'kecilnya / ukuran kecil',新しい:'kebaruan',古い:'usia / lamanya',良い:'kebaikan / keunggulan',
  悪い:'keburukan',暑い:'panasnya cuaca',寒い:'dinginnya cuaca',冷たい:'dinginnya / sikap dingin',難しい:'kesulitan',易しい:'kemudahan',
  高い:'ketinggian / mahalnya harga',安い:'murahnya harga',低い:'kerendahan / rendahnya',面白い:'daya tarik / kelucuan',美味しい:'kelezatan',
  忙しい:'kesibukan',楽しい:'kesenangan',白い:'putihnya',黒い:'hitamnya',赤い:'merahnya',青い:'birunya',
  近い:'kedekatan',遠い:'jauhnya jarak',速い:'kecepatan',遅い:'kelambatan',多い:'banyaknya jumlah',少ない:'sedikitnya jumlah',
  暖かい:'kehangatan',涼しい:'kesejukan',甘い:'rasa manis',重い:'berat / bobot',軽い:'keringanan',寂しい:'rasa sepi',
  広い:'luas / keluasan',狭い:'kesempitan',若い:'kemudaan',長い:'panjang',短い:'pendeknya',明るい:'kecerahan / keceriaan',暗い:'kegelapan',
  強い:'kekuatan',弱い:'kelemahan',眠い:'rasa kantuk',厳しい:'ketegasan / kerasnya',嬉しい:'rasa senang',悲しい:'kesedihan',
  怖い:'rasa takut / seramnya',悔しい:'rasa kesal / penyesalan',有り難い:'rasa syukur / berharganya',珍しい:'kelangkaan',
  温かい:'kehangatan',幼い:'kemudaan / sifat kekanak-kanakan',恐ろしい:'kengerian',賢い:'kecerdasan',硬い:'kekerasan / kekakuan',
  かわいらしい:'kelucuan / kemanisan',きつい:'ketatnya / beratnya',苦しい:'kesusahan / penderitaan',詳しい:'keterperincian',濃い:'kepekatan / kekentalan',
  親しい:'keakraban',鋭い:'ketajaman',激しい:'intensitas / dahsyatnya',貧しい:'kemiskinan',
  静か:'ketenangan',にぎやか:'keramaian',親切:'kebaikan hati',便利:'kepraktisan',不便:'ketidakpraktisan',上手:'kemahiran',下手:'kekurangmahiran',
  簡単:'kemudahan / kesederhanaan',大切:'pentingnya / berharganya',大変:'beratnya kesulitan',自然:'kealamian / kewajaran',
  真面目:'kesungguhan / kerajinan',熱心:'ketekunan / antusiasme',自由:'kebebasan',正確:'ketepatan',複雑:'kerumitan',丁寧:'kesopanan / ketelitian',
  微妙:'kehalusan / kerumitan nuansa',窮屈:'kesempitan / ketidaknyamanan',明らか:'kejelasan',偉大:'keagungan',穏やか:'ketenangan / kelembutan',
  快適:'kenyamanan',確実:'kepastian / keandalan',貴重:'berharganya',奇妙:'keanehan',器用:'keterampilan / kecekatan',豪華:'kemewahan',
  正直:'kejujuran',真剣:'kesungguhan',深刻:'keseriusan / parahnya',新鮮:'kesegaran',慎重:'kehati-hatian',清潔:'kebersihan',
  単純:'kesederhanaan',独特:'kekhasan',不思議:'keanehan / keajaiban',明確:'kejelasan',豊か:'kekayaan / kelimpahan',冷静:'ketenangan',
};

const toHiragana=s=>s.normalize('NFKC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const entries=[...KOTOBA_ENTRIES,...KOTOBA_N3_ENTRIES].filter(e=>e.type.includes('kata sifat'));
const byKey=new Map(),excluded=[],normalized=[];
for(const e of entries) {
  let word=e.spelling||e.reading,reading=toHiragana(e.reading);
  if(exclusions[word]){excluded.push({id:e.id,word,reason:exclusions[word]});continue;}
  if(word==='お忙しい'){word='忙しい';reading='いそがしい';normalized.push({id:e.id,reason:'Bentuk sopan お忙しい digabung ke 忙しい.'});}
  if(word==='よい'){word='良い';reading='いい';normalized.push({id:e.id,reason:'よい adalah varian dari いい; digabung ke 良い.'});}
  const key=word+'|'+reading;
  if(byKey.has(key)){byKey.get(key).sources.push(e.id);continue;}
  const group=e.type.includes('sifat-na')?'na':'i';
  const a={id:`adj-${e.id}`,word,reading,group,meaning:meanings[key]||meanings[word]||e.meaning,level:e.chapter?(e.chapter<=25?'N5':'N4'):'N3',sources:[e.id]};
  if(['いい','あたまがいい','ちょうしがいい','ちょうどいい'].includes(reading))a.stemReading=reading.slice(0,-2)+'よ';
  if(nouns[word])a.nounMeaning=nouns[word];
  if(word==='辛い')a.nounMeaning=reading==='からい'?'辛さ: rasa pedas':'辛さ: penderitaan / beratnya keadaan';
  assert.match(reading,/^[ぁ-ゖー]+$/u,word);
  if(group==='i')assert.ok(reading.endsWith('い')&&word.endsWith('い'),word);
  byKey.set(key,a);
}
const adjectives=[...byKey.values()];
const meta={entryCount:adjectives.length,sourceRows:entries.length,levels:Object.fromEntries(['N5','N4','N3'].map(l=>[l,adjectives.filter(a=>a.level===l).length])),nounCount:adjectives.filter(a=>a.nounMeaning).length,coveredSourceIds:adjectives.flatMap(a=>a.sources).sort(),excluded,normalized};
writeFileSync(new URL('../henkan-adjective-data.js',import.meta.url),'// Generated by scripts/build_henkan_adjectives.mjs. Attribution: DATA-SOURCES.md.\nexport const HENKAN_ADJECTIVES = [\n'+adjectives.map(a=>'  '+JSON.stringify(a)).join(',\n')+'\n];\n');
writeFileSync(new URL('../data/henkan-adjective-source.json',import.meta.url),JSON.stringify(meta,null,2)+'\n');
console.log(`${adjectives.length} adjectives, ${meta.nounCount} reviewed ～さ nouns; levels ${JSON.stringify(meta.levels)}; ${excluded.length} contextual entries excluded.`);
