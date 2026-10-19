const KANA_ROWS = [
  ['あいうえお','a i u e o'], ['かきくけこ','ka ki ku ke ko'],
  ['がぎぐげご','ga gi gu ge go'], ['さしすせそ','sa shi su se so'],
  ['ざじずぜぞ','za ji zu ze zo'], ['たちつてと','ta chi tsu te to'],
  ['だぢづでど','da ji zu de do'], ['なにぬねの','na ni nu ne no'],
  ['はひふへほ','ha hi fu he ho'], ['ばびぶべぼ','ba bi bu be bo'],
  ['ぱぴぷぺぽ','pa pi pu pe po'], ['まみむめも','ma mi mu me mo'],
  ['やゆよ','ya yu yo'], ['らりるれろ','ra ri ru re ro'],
  ['わゐゑをん','wa wi we wo n'], ['ぁぃぅぇぉゔ','a i u e o vu'],
];
const syllables = new Map(KANA_ROWS.flatMap(([kana,latin]) => [...kana].map((k,i) => [k,latin.split(' ')[i]])));
for (const [kana,stem] of Object.entries({き:'ky',ぎ:'gy',し:'sh',じ:'j',ち:'ch',ぢ:'j',に:'ny',ひ:'hy',び:'by',ぴ:'py',み:'my',り:'ry'})) {
  for (const [small,vowel] of [['ゃ','a'],['ゅ','u'],['ょ','o']]) syllables.set(kana+small,stem+vowel);
}

const normalizeText = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('id');
const kanaKey = value => normalizeText(value).replace(/[ァ-ヶ]/g,c => String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/[.\-\s]/gu,'');

// Only index readings, never romanize a meaning or change the displayed data.
export function readingRomaji(value) {
  const kana=kanaKey(value); let result='',geminate=false;
  for (let i=0;i<kana.length;i++) {
    if(kana[i]==='っ'){geminate=true;continue;}
    if(kana[i]==='ー'){
      const vowel=result.match(/[aiueo][^aiueo]*$/)?.[0][0];
      if(!vowel)return '';
      result+=vowel;continue;
    }
    const pair=syllables.get(kana.slice(i,i+2)),syllable=pair||syllables.get(kana[i]);
    if(!syllable)return '';
    if(geminate){result+=/^[bcdfghjklmpqrstvwxyz]/.test(syllable)?syllable[0]:'';geminate=false;}
    result+=syllable;
    if(kana[i]==='ん' && /^[あいうえおやゆよ]/.test(kana[i+1]||''))result+="'";
    if(pair)i++;
  }
  return result;
}

// Accept common Hepburn/Kunrei keyboard spellings and long-vowel notation.
// This is deliberately a search alias, not a spelling checker for quizzes.
function romajiKey(value) {
  const long={ā:'aa',ī:'ii',ū:'uu',ē:'ei',ō:'ou',â:'aa',î:'ii',û:'uu',ê:'ei',ô:'ou'};
  let key=normalizeText(value).replace(/[āīūēōâîûêô]/g,c=>long[c]).replace(/[\s.'’ʼ\-]/gu,'');
  if(!/^[a-z]+$/.test(key))return '';
  return key.replace(/(?:sy|shy)([auo])/g,'sh$1').replace(/(?:ty|cy|chy)([auo])/g,'ch$1')
    .replace(/(?:zy|jy|dy)([auo])/g,'j$1').replace(/si/g,'shi').replace(/ti/g,'chi')
    .replace(/tu/g,'tsu').replace(/hu/g,'fu').replace(/zi|di/g,'ji').replace(/du/g,'zu')
    .replace(/tch/g,'cch').replace(/oo/g,'ou').replace(/ee/g,'ei');
}

// Catalog objects are immutable. Build their search keys once, then reuse them
// on each keystroke instead of retransliterating 2,383 cards.
const index=new WeakMap();
function searchable(card) {
  if(index.has(card))return index.get(card);
  const readings=[...(card.on||[]),...(card.kun||[]),card.example?.reading,...(card.example?.readings||[])].filter(Boolean);
  const fields=[card.char,card.meaning,...(card.meaningsEn||[]),...readings,card.example?.word,card.example?.meaning].filter(Boolean).map(normalizeText);
  const entry={fields,kana:readings.map(kanaKey),romaji:readings.map(readingRomaji).map(romajiKey).filter(Boolean)};
  index.set(card,entry);return entry;
}

export function createKanjiSearch(query) {
  const text=normalizeText(query).trim(),kana=kanaKey(text),romaji=romajiKey(text);
  return card => {
    if(!text)return 1;
    const entry=searchable(card);
    if(normalizeText(card.char)===text)return 6;
    if(entry.kana.includes(kana) || (romaji && entry.romaji.includes(romaji)))return 5;
    if(entry.fields.includes(text))return 4;
    if((kana && entry.kana.some(r=>r.includes(kana))) || (romaji && entry.romaji.some(r=>r.includes(romaji))))return 2;
    return entry.fields.some(field=>field.includes(text))?1:0;
  };
}
