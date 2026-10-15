import {shuffle} from './core.js?v=20261015-bunpou-expanded';

export const BUNPOU_HISTORY_KEY='nihongo-benkyo-bunpou-history-v1';
export const BUNPOU_ALL_CHAPTERS=Array.from({length:50},(_,i)=>i+1);
export function bunpouPool(entries,{chapters=BUNPOU_ALL_CHAPTERS}={}) {
  if(!Array.isArray(chapters))return [];
  const selected=new Set(chapters.filter(n=>Number.isInteger(n)&&n>=1&&n<=50));
  return entries.filter(q=>selected.has(q.chapter));
}
export function createBunpouQuiz(entries,settings={},history={},random=Math.random) {
  const count=settings.count??10;
  if(!Number.isSafeInteger(count)||count<1)return [];
  const tiers=new Map();
  for(const q of shuffle(bunpouPool(entries,settings),random)){
    const exposure=history[q.id]||0;
    if(!tiers.has(exposure))tiers.set(exposure,new Map());
    const groups=tiers.get(exposure),pattern=q.patternId||q.id;
    if(!groups.has(pattern))groups.set(pattern,[]);
    groups.get(pattern).push(q);
  }
  // Rotate patterns within each exposure tier so vocabulary variants do not bunch together.
  // Previously unseen questions still come before any question already displayed.
  const pool=[];
  for(const [,groups] of [...tiers].sort(([a],[b])=>a-b)){
    let remaining=[...groups.values()];
    while(remaining.length){
      for(const group of remaining)pool.push(group.shift());
      remaining=remaining.filter(group=>group.length);
    }
  }
  return pool.slice(0,count).map(q=>({...q,options:shuffle([q.answer,...q.distractors],random)}));
}
export function cleanBunpouHistory(raw,entries) {
  const ids=new Set(entries.map(q=>q.id));
  return Object.fromEntries(Object.entries(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}).filter(([id,n])=>ids.has(id)&&Number.isSafeInteger(n)&&n>0));
}
export function recordBunpouShown(history,id) {
  return {...history,[id]:Math.min((history[id]||0)+1,Number.MAX_SAFE_INTEGER)};
}
export function bunpouPromptMarkup(q,escape) {
  return `<span lang="ja">${escape(q.before)}<span class="bunpou-blank" aria-label="Bagian yang harus dilengkapi">（　？　）</span>${escape(q.after)}</span>`;
}
export function bunpouSentenceMarkup(q,escape) {
  const sentence=q.before+q.answer+q.after,start=q.before.length,end=start+q.answer.length;
  // Highlight the answer independently of word boundaries, keeping a compound's reading intact.
  const highlight=(text,offset)=>{
    const a=Math.max(0,start-offset),b=Math.min(text.length,end-offset);
    if(a>=b)return escape(text);
    return escape(text.slice(0,a))+`<strong>${escape(text.slice(a,b))}</strong>`+escape(text.slice(b));
  };
  const spans=q.example===sentence&&Array.isArray(q.furigana)?q.furigana:[];
  let html='',cursor=0;
  for(const [offset,word,reading] of spans){
    if(offset<cursor||sentence.slice(offset,offset+word.length)!==word)continue;
    html+=highlight(sentence.slice(cursor,offset),cursor);
    html+=`<ruby>${highlight(word,offset)}<rt>${escape(reading)}</rt></ruby>`;
    cursor=offset+word.length;
  }
  return html+highlight(sentence.slice(cursor),cursor);
}
export function bunpouFeedbackMarkup(q,escape) {
  return `<div class="answer-details bunpou-detail"><div class="bunpou-complete" lang="ja">${bunpouSentenceMarkup(q,escape)}</div><div class="answer-meaning"><span>Arti kalimat</span><p>${escape(q.translation)}</p></div><div class="bunpou-rule"><span>POLA · BAB ${q.chapter}</span><h3 lang="ja">${escape(q.pattern)}</h3><p>${escape(q.meaning)}</p><dl><div><dt>Rumus</dt><dd>${escape(q.structure)}</dd></div><div><dt>Catatan</dt><dd>${escape(q.note)}</dd></div></dl></div></div>`;
}
