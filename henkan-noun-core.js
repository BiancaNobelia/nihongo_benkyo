import {shuffle} from './core.js?v=20261015-jidoushi-tadoushi';

export const NOUN_MODES={
  negative:{label:'Negatif',ja:'～じゃない / ～ではない',description:'Bukan · nonlampau'},
  past:{label:'Lampau',ja:'～だった',description:'Bentuk biasa · positif lampau'},
  negativePast:{label:'Negatif lampau',ja:'～じゃなかった / ～ではなかった',description:'Bukan · pada masa lalu'},
  te:{label:'Penghubung で',ja:'～で',description:'Menghubungkan predikat noun'},
};
export const NOUN_FORM_MEANINGS={
  negative:'Menyangkal identitas, jenis, atau status: bukan N. Latihan memakai bentuk biasa, tanpa です／ありません.',
  past:'Menyatakan identitas, jenis, atau status pada masa lalu: pada saat itu adalah N. Tidak selalu berarti keadaan itu sudah tidak berlaku sekarang.',
  negativePast:'Menyangkal identitas, jenis, atau status pada masa lalu: pada saat itu bukan N.',
  te:'Menghubungkan predikat kata benda dengan lanjutan kalimat. Misalnya 学生で、二十歳です = seorang pelajar dan berusia 20 tahun. で di sini adalah penghubung predikat, berbeda dari partikel lokasi atau alat.',
};
export function conjugateNoun(n,spelling=false){
  const stem=spelling?n.word:n.reading;
  return {negative:stem+'じゃない',past:stem+'だった',negativePast:stem+'じゃなかった',te:stem+'で'};
}
export function nounAcceptedAnswers(n,form,spelling=false){
  const stem=spelling?n.word:n.reading,answer=conjugateNoun(n,spelling)[form];
  if(!answer)return [];
  return [answer,...({negative:[stem+'ではない',stem+'でない'],past:[stem+'であった'],negativePast:[stem+'ではなかった',stem+'でなかった']}[form]||[])];
}
export function nounExplanation(n,form){
  const ending={negative:'じゃない',past:'だった',negativePast:'じゃなかった',te:'で'}[form];
  let text=`Kata benda (名詞). Pertahankan ${n.reading} secara utuh, lalu ganti です dengan ${ending}.`;
  if(form==='negative')text+=` ${n.reading}ではない juga benar; でない dapat digunakan dalam ragam tulisan.`;
  if(form==='negativePast')text+=` ${n.reading}ではなかった juga benar; でなかった dapat digunakan dalam ragam tulisan.`;
  if(form==='past')text+=` ${n.reading}であった juga benar dalam ragam tulisan.`;
  if(form==='te')text+=' Jangan memakai くて atau menambahkan な. Bentuk ～で ini memerlukan lanjutan kalimat.';
  return text;
}
export function nounOptions(n,form,random=Math.random){
  const f=conjugateNoun(n),answer=f[form];if(!answer)return [];
  const r=n.reading,accepted=new Set(nounAcceptedAnswers(n,form));
  const mistakes={negative:[r+'くない',r+'ない',r+'なじゃない'],past:[r+'かった',r+'た',r+'でした'],negativePast:[r+'くなかった',r+'じゃないだった',r+'なかった'],te:[r+'て',r+'くて',r+'に']}[form];
  const wrong=shuffle([...new Set([...mistakes,...Object.values(f)])].filter(s=>!accepted.has(s)),random);
  return shuffle([answer,...wrong.slice(0,3)],random);
}
export function nounPool(nouns,{level='N5',modes=Object.keys(NOUN_MODES)}={}){
  if(!['N5','N4','N3','all'].includes(level))return [];
  const forms=[...new Set(modes)].filter(m=>Object.hasOwn(NOUN_MODES,m));
  return nouns.filter(n=>level==='all'||n.level===level).flatMap(n=>{
    const f=conjugateNoun(n);
    return forms.map(form=>({id:`${n.id}:${form}`,noun:n,form,answer:f[form]}));
  });
}
export function createNounQuiz(nouns,settings={},history={},random=Math.random){
  const {count=10}=settings;if(!Number.isSafeInteger(count)||count<1)return [];
  const pool=shuffle(nounPool(nouns,settings),random).sort((a,b)=>(history[a.id]||0)-(history[b.id]||0));
  const questions=[],usedWords=new Set(),formCounts={};
  while(pool.length&&questions.length<count){
    const tier=history[pool[0].id]||0;
    let candidates=pool.filter(q=>(history[q.id]||0)===tier);
    if(candidates.some(q=>!usedWords.has(q.noun.id)))candidates=candidates.filter(q=>!usedWords.has(q.noun.id));
    candidates.sort((a,b)=>(formCounts[a.form]||0)-(formCounts[b.form]||0));
    const q=candidates[0];pool.splice(pool.indexOf(q),1);usedWords.add(q.noun.id);formCounts[q.form]=(formCounts[q.form]||0)+1;
    questions.push({...q,prompt:q.noun.reading+'です',promptWord:q.noun.word+'です',instruction:q.form==='te'?'Ubah predikat kata benda berikut menjadi penghubung dengan akhiran ～で.':'Ubah predikat kata benda berikut ke bentuk biasa yang diminta (tanpa です／ありません).',options:nounOptions(q.noun,q.form,random)});
  }
  return questions;
}
export const NOUN_HISTORY_KEY='nihongo-benkyo-henkan-noun-history-v1';
export function cleanNounHistory(raw,nouns){
  const valid=new Set(nounPool(nouns,{level:'all'}).map(q=>q.id));
  return Object.fromEntries(Object.entries(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}).filter(([id,n])=>valid.has(id)&&Number.isSafeInteger(n)&&n>0));
}
