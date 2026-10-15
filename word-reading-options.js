import { KANJI } from './kanji-data.js?v=20261015-jidoushi-tadoushi';
import { SIMILAR_GROUPS } from './similar-data.js?v=20261015-jidoushi-tadoushi';
import { READING_CHOICES } from './reading-choice-data.js?v=20261015-jidoushi-tadoushi';
import { WORD_READING_EXCLUSIONS } from './word-reading-exclusions.js?v=20261015-jidoushi-tadoushi';

const hiragana=s=>s.replace(/[ァ-ヶ]/gu,c=>String.fromCodePoint(c.codePointAt(0)-0x60));
const kanji=new Map(KANJI.map(k=>[k.char,k]));
const readings=new Map(KANJI.map(k=>[k.char,['on','kun'].flatMap(type=>k[type].map(sourceReading=>({
  type,sourceReading,stem:hiragana(sourceReading.replace(/-/g,'').split('.')[0]),
}))).filter(r=>/^[ぁ-ゖ]+$/u.test(r.stem))]));
const wordReadings=new Map();
for(const k of KANJI)if(k.example){
  const e=k.example;
  if(!wordReadings.has(e.word))wordReadings.set(e.word,new Set());
  for(const r of [e.reading,...(e.readings||[])])wordReadings.get(e.word).add(hiragana(r));
}
// The JLPT dictionary snapshot contains additional uncommon but valid readings
// (e.g. 先生・せんしょう) beyond the selected catalog example. Exclude them too.
for(const q of READING_CHOICES){
  const [word]=JSON.parse(q.key);
  if(!wordReadings.has(word))wordReadings.set(word,new Set());
  for(const reading of q.accepted)wordReadings.get(word).add(hiragana(reading));
}
for(const [word,values] of Object.entries(WORD_READING_EXCLUSIONS)){
  if(!wordReadings.has(word))wordReadings.set(word,new Set());
  for(const reading of values)wordReadings.get(word).add(hiragana(reading));
}
const lookalikes=new Map();
for(const group of SIMILAR_GROUPS)for(const {char} of group.members){
  if(!lookalikes.has(char))lookalikes.set(char,new Set());
  for(const other of group.members)if(other.char!==char)lookalikes.get(char).add(other.char);
}

// These intentionally mix the three kinds of confusion requested by learners.
// Keys include the answer so a different legitimate reading stays unambiguous.
const authored={
  '午前:ごぜん':['ごご','ごまえ','うままえ'],
  '本:ほん':['ぽん','き','もく'],
  '右:みぎ':['ひだり','ともだち','いし'],
};

// Only use a unique dictionary segmentation. Irregular readings such as 今日
// fall back to spelling/visual distractors instead of inventing kanji boundaries.
function segment(word,answer){
  const chars=[...word],found=[];
  function visit(index,offset,parts){
    if(found.length>1)return;
    if(index===chars.length){if(offset===answer.length)found.push(parts);return;}
    const char=chars[index],stems=readings.has(char) ? [...new Set(readings.get(char).map(r=>r.stem))] : [hiragana(char)];
    for(const stem of stems)if(answer.startsWith(stem,offset))visit(index+1,offset+stem.length,[...parts,{char,stem,offset,index}]);
  }
  visit(0,0,[]);
  return found.length===1 ? found[0] : [];
}

function applicable(r,part,word){
  const ending=r.sourceReading.split('.')[1];
  // Keep okurigana attached to its own reading, not a different verb stem.
  return (!ending || [...word].slice(part.index+1).join('').startsWith(ending))
    && r.stem.length<=Math.max(4,part.stem.length+1);
}

export function wordReadingCandidates(card){
  const {word,reading:answer,readings:valid=[]}=card.example;
  const accepted=new Set([answer,...valid,...(wordReadings.get(word)||[])].map(hiragana));
  const chars=[...word].filter(c=>kanji.has(c));
  if(chars.length===1){
    const [prefix,suffix]=word.split(chars[0]);
    for(const r of readings.get(chars[0])){
      if(!prefix&&!suffix)accepted.add(r.stem);
      if(r.type==='kun'&&r.sourceReading.split('.')[1]===suffix)accepted.add(prefix+r.stem+suffix);
    }
  }
  const groups={single:[],mixed:[],visual:[],sound:[]};
  const add=(group,value,changes=[])=>{
    if(!/^[ぁ-ゖー]+$/u.test(value)||/^[っゃゅょー]/u.test(value)
      ||/(^|[^きぎしじちぢにひびぴみり])[ゃゅょ]/u.test(value)
      ||accepted.has(value)||groups[group].some(c=>c.value===value))return;
    groups[group].push({value,kind:group,changes});
  };
  const parts=segment(word,answer);
  const alternatives=parts.map(part=>(readings.get(part.char)||[])
    .filter(r=>r.stem!==part.stem&&applicable(r,part,word))
    .map(r=>({char:part.char,from:part.stem,to:r.stem,type:r.type,sourceReading:r.sourceReading,offset:part.offset})));
  const replace=changes=>{
    let text=answer;
    for(const c of [...changes].sort((a,b)=>b.offset-a.offset))text=text.slice(0,c.offset)+c.to+text.slice(c.offset+c.from.length);
    return text;
  };
  for(const choices of alternatives)for(const c of choices)add('single',replace([c]),[c]);
  for(let i=0;i<alternatives.length;i++)for(let j=i+1;j<alternatives.length;j++){
    for(const a of alternatives[i])for(const b of alternatives[j]){
      if(groups.mixed.length>=48)break;
      add('mixed',replace([a,b]),[a,b]);
    }
  }
  for(const part of parts)for(const other of lookalikes.get(part.char)||[]){
    for(const r of readings.get(other)||[])if(applicable(r,part,word)){
      add('visual',answer.slice(0,part.offset)+r.stem+answer.slice(part.offset+part.stem.length));
    }
  }
  const suffix=word.match(/[ぁ-ゖ]+$/u)?.[0]||'';
  const stem=suffix&&answer.endsWith(suffix)?answer.slice(0,-suffix.length):answer;
  const ending=answer.slice(stem.length);
  // First pool: voicing, small kana and vowel length. Second pool: nearby kana
  // in the same row. Never pull unrelated words from the current quiz pool.
  for(const [pass,rows] of [
    ['かが','きぎ','くぐ','けげ','こご','さざ','しじ','すず','せぜ','そぞ','ただ','ちぢ','つづ','てで','とど','はばぱ','ひびぴ','ふぶぷ','へべぺ','ほぼぽ','ゃや','ゅゆ','ょよ','っつ'],
    ['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの','はひふへほ','まみむめも','やゆよ','らりるれろ','わを'],
  ].entries()){
    for(let i=0;i<stem.length;i++)for(const row of rows)if(row.includes(stem[i])){
      for(const kana of row)add('sound',stem.slice(0,i)+kana+stem.slice(i+1)+ending);
    }
    if(pass===0)for(let i=1;i<stem.length;i++){
      // Shorten an existing long vowel / doubled consonant; do not insert a
      // small tsu before arbitrary sounds (such as the r in あたらしい).
      if((stem[i]==='う'&&'うくぐすずつづぬふぶぷむゆゅるおこごそぞとどのほぼぽもよょろ'.includes(stem[i-1]))
        ||(stem[i]==='い'&&'いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ'.includes(stem[i-1]))
        ||stem[i]==='ー'||stem[i]==='っ')add('sound',stem.slice(0,i)+stem.slice(i+1)+ending);
    }
  }
  if(groups.sound.length<3)for(const kana of ['う','い','ん','あ'])add('sound',stem+kana+ending);
  return {accepted,groups,preferred:authored[`${word}:${answer}`]||[]};
}

export function wordReadingDistractors(card,random=Math.random){
  const {accepted,groups,preferred}=wordReadingCandidates(card);
  const selected=[];
  const add=c=>{if(c&&!accepted.has(c.value)&&!selected.some(s=>s.value===c.value)&&selected.length<3)selected.push(c);};
  const pick=list=>{
    const available=list.filter(c=>!selected.some(s=>s.value===c.value));
    add(available[Math.floor(random()*available.length)]);
  };
  const all=Object.values(groups).flat();
  for(const value of preferred)add(all.find(c=>c.value===value)||{value,kind:'authored',changes:[]});
  pick(groups.single);
  pick(groups.mixed.length?groups.mixed:groups.visual);
  pick(groups.visual.length?groups.visual:groups.sound.slice(0,8));
  while(selected.length<3){
    const before=selected.length;
    pick(groups.sound.slice(0,12));
    if(before===selected.length)break;
  }
  return {distractors:selected.map(c=>c.value),readingAlternatives:selected.flatMap(c=>c.changes),wordDistractors:selected};
}
