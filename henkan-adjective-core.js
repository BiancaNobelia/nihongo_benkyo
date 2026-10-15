import {shuffle} from './core.js?v=20261015-henkan-adjectives';

export const ADJECTIVE_GROUPS={i:'Kata sifat い',na:'Kata sifat な'};
export const ADJECTIVE_MODES={
  negative:{label:'Negatif',ja:'～くない / ～じゃない',description:'Bentuk biasa · nonlampau'},
  past:{label:'Lampau',ja:'～かった / ～だった',description:'Bentuk biasa · positif'},
  negativePast:{label:'Negatif lampau',ja:'～くなかった / ～じゃなかった',description:'Bentuk biasa · masa lalu'},
  te:{label:'Te-kei',ja:'～くて / ～で',description:'Menghubungkan sifat / keadaan'},
  adverb:{label:'Keterangan / adverb',ja:'～く / ～に',description:'Kata sifat → keterangan'},
  noun:{label:'Nomina / kata benda',ja:'～さ',description:'Kata sifat → nomina sifat / derajat'},
};
export const ADJECTIVE_FORM_MEANINGS={
  negative:'Menyatakan bahwa sifat atau keadaan tersebut tidak berlaku sekarang atau secara umum.',
  past:'Menyatakan sifat atau keadaan pada masa lalu.',
  negativePast:'Menyatakan bahwa sifat atau keadaan tersebut tidak berlaku pada masa lalu.',
  te:'Menghubungkan sifat atau keadaan dengan bagian kalimat berikutnya; dapat menyatakan “dan” atau sebab sesuai konteks.',
  adverb:'Bentuk keterangan untuk menerangkan tindakan atau perubahan, misalnya 静かに話す (berbicara dengan tenang) dan 高くなる (menjadi tinggi/mahal).',
  noun:'Akhiran ～さ mengubah sifat menjadi nomina yang menyatakan sifat, derajat, atau ukurannya. Latihan ini khusus pola ～さ.',
};

function stem(a,spelling=false) {
  if(a.group==='na')return spelling?a.word:a.reading;
  if(!spelling)return a.stemReading||a.reading.slice(0,-1);
  // 良い retains its kanji. Kana-only いい inside a phrase uses よ instead.
  return a.stemReading&&a.word.endsWith('いい')?a.word.slice(0,-2)+'よ':a.word.slice(0,-1);
}
export function conjugateAdjective(a,spelling=false) {
  if(!ADJECTIVE_GROUPS[a.group])throw new Error(`Unknown adjective group: ${a.group}`);
  const s=stem(a,spelling),isI=a.group==='i';
  const f={negative:s+(isI?'くない':'じゃない'),past:s+(isI?'かった':'だった'),negativePast:s+(isI?'くなかった':'じゃなかった'),te:s+(isI?'くて':'で'),adverb:s+(isI?'く':'に')};
  if(a.nounMeaning)f.noun=s+'さ';
  return f;
}
export function adjectiveAcceptedAnswers(a,form) {
  const f=conjugateAdjective(a),answer=f[form];if(!answer)return [];
  return [answer,...(a.group==='na'&&form==='negative'?[a.reading+'ではない']:[]),...(a.group==='na'&&form==='negativePast'?[a.reading+'ではなかった']:[])];
}
export function adjectiveExplanation(a,form) {
  const isI=a.group==='i',s=stem(a);
  const suffixes=isI?{negative:'くない',past:'かった',negativePast:'くなかった',te:'くて',adverb:'く',noun:'さ'}:{negative:'じゃない',past:'だった',negativePast:'じゃなかった',te:'で',adverb:'に',noun:'さ'};
  let rule=isI?`Akhiran い dilepas: ${a.reading} → ${s}。 Tambahkan ${suffixes[form]}.`:`Pertahankan bentuk dasar ${a.reading}, lalu tambahkan ${suffixes[form]}; jangan menambahkan な.`;
  if(a.stemReading)rule=`Pengecualian いい → よ: ${a.reading} memakai dasar ${s}, lalu tambahkan ${suffixes[form]}.`;
  if(!isI&&a.reading.endsWith('い'))rule+=' Meski berakhir dengan bunyi い, kata ini termasuk kata sifat な.';
  if(!isI&&['negative','negativePast'].includes(form))rule+=` ${a.reading+(form==='negative'?'ではない':'ではなかった')} juga benar, dengan nuansa lebih formal.`;
  return `${ADJECTIVE_GROUPS[a.group]}. ${rule}`;
}
export function adjectiveOptions(a,form,random=Math.random) {
  const f=conjugateAdjective(a),answer=f[form];if(!answer)return [];
  const r=a.reading,s=stem(a),cut=r.slice(0,-1),isI=a.group==='i';
  const errors={
    negative:isI?[r+'くない',r+'じゃない',s+'ない']:[r+'くない',cut+'くない',r+'なじゃない'],
    past:isI?[r+'かった',r+'だった',s+'た']:[r+'かった',cut+'かった',r+'なだった'],
    negativePast:isI?[r+'くなかった',f.negative+'かった',r+'じゃなかった']:[r+'くなかった',cut+'くなかった',r+'じゃないだった'],
    te:isI?[r+'て',s+'て',r+'で']:[r+'くて',cut+'くて',r+'なで'],
    adverb:isI?[r+'く',r+'に',s+'に']:[r+'く',cut+'く',r+'なに'],
    noun:isI?[r+'さ',s+'くさ',r+'なさ']:[r+'なさ',r+'くさ',r+'にさ'],
  };
  if(a.stemReading)errors[form].unshift(r.slice(0,-1)+({negative:'くない',past:'かった',negativePast:'くなかった',te:'くて',adverb:'く',noun:'さ'}[form]));
  const accepted=new Set(adjectiveAcceptedAnswers(a,form));
  const mistakes=shuffle([...new Set(errors[form])].filter(x=>!accepted.has(x)),random);
  const others=shuffle([...new Set(Object.values(f))].filter(x=>!accepted.has(x)),random);
  return shuffle([answer,...[...new Set([...mistakes.slice(0,2),...others,...mistakes.slice(2)])].slice(0,3)],random);
}
export function adjectivePool(adjectives,{level='N5',group='all',modes=Object.keys(ADJECTIVE_MODES)}={}) {
  if(!['N5','N4','N3','all'].includes(level)||!['all','i','na'].includes(group))return [];
  const forms=[...new Set(modes)].filter(m=>Object.hasOwn(ADJECTIVE_MODES,m));
  return adjectives.filter(a=>(level==='all'||a.level===level)&&(group==='all'||a.group===group)).flatMap(a=>{
    const f=conjugateAdjective(a);
    return forms.filter(form=>f[form]).map(form=>({id:`${a.id}:${form}`,adjective:a,form,answer:f[form]}));
  });
}
export function createAdjectiveQuiz(adjectives,settings={},history={},random=Math.random) {
  const {count=10}=settings;if(!Number.isSafeInteger(count)||count<1)return [];
  const pool=shuffle(adjectivePool(adjectives,settings),random).sort((a,b)=>(history[a.id]||0)-(history[b.id]||0));
  const questions=[],usedWords=new Set(),formCounts={};
  while(pool.length&&questions.length<count) {
    const tier=history[pool[0].id]||0;
    let candidates=pool.filter(q=>(history[q.id]||0)===tier);
    if(candidates.some(q=>!usedWords.has(q.adjective.id)))candidates=candidates.filter(q=>!usedWords.has(q.adjective.id));
    candidates.sort((a,b)=>(formCounts[a.form]||0)-(formCounts[b.form]||0));
    const q=candidates[0];pool.splice(pool.indexOf(q),1);usedWords.add(q.adjective.id);formCounts[q.form]=(formCounts[q.form]||0)+1;
    const instruction=['negative','past','negativePast'].includes(q.form)?'Ubah kata sifat berikut ke bentuk biasa yang diminta (tanpa です).':q.form==='noun'?'Ubah kata sifat berikut menjadi nomina dengan akhiran ～さ.':q.form==='adverb'?'Ubah kata sifat berikut ke bentuk keterangan (～く / ～に).':'Ubah kata sifat berikut ke bentuk penghubung (～くて / ～で).';
    questions.push({...q,prompt:q.adjective.reading+'です',promptWord:q.adjective.word+'です',instruction,options:adjectiveOptions(q.adjective,q.form,random)});
  }
  return questions;
}
export const ADJECTIVE_HISTORY_KEY='nihongo-benkyo-henkan-adjective-history-v1';
export function cleanAdjectiveHistory(raw,adjectives) {
  const valid=new Set(adjectivePool(adjectives,{level:'all'}).map(q=>q.id));
  return Object.fromEntries(Object.entries(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}).filter(([id,n])=>valid.has(id)&&Number.isSafeInteger(n)&&n>0));
}
