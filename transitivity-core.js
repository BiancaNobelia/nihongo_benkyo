import {shuffle} from './core.js?v=20261015-jidoushi-tadoushi';
import {TRANSITIVITY_PAIRS} from './transitivity-data.js?v=20261015-jidoushi-tadoushi';
import {cleanBunpouHistory,recordBunpouShown} from './bunpou-core.js?v=20261015-jidoushi-tadoushi';

export const TRANSITIVITY_HISTORY_KEY='nihongo-benkyo-transitivity-history-v1';
export const TRANSITIVITY_KINDS={ji:'Jidōshi · 自動詞',ta:'Tadōshi · 他動詞'};
export const TRANSITIVITY_MODES={word:'Pilih kata kerja',type:'Tentukan Jidōshi / Tadōshi'};
export const cleanTransitivityHistory=cleanBunpouHistory;
export const recordTransitivityShown=recordBunpouShown;
const pairs=new Map(TRANSITIVITY_PAIRS.map(p=>[p.id,p]));
export function transitivityPool(entries,{pair='all'}={}) {
  return pair==='all'?entries:entries.filter(q=>q.pairId===pair);
}
export function createTransitivityQuiz(entries,settings={},history={},random=Math.random) {
  const count=settings.count??10,mode=settings.mode??'word';
  if(!Number.isSafeInteger(count)||count<1||!Object.hasOwn(TRANSITIVITY_MODES,mode))return [];
  const tiers=new Map();
  for(const q of shuffle(transitivityPool(entries,settings),random)){
    const exposure=history[q.id]||0;
    if(!tiers.has(exposure))tiers.set(exposure,new Map());
    const group=tiers.get(exposure);if(!group.has(q.pairId))group.set(q.pairId,[]);group.get(q.pairId).push(q);
  }
  const ordered=[],used={ji:0,ta:0};let tie=random()<.5?'ji':'ta';
  for(const [,groups] of [...tiers].sort(([a],[b])=>a-b)){
    let remaining=[...groups.values()];
    while(remaining.length){
      for(const group of remaining){
        const desired=used.ji===used.ta?tie:used.ji<used.ta?'ji':'ta';
        const at=group.findIndex(q=>q.kind===desired),[q]=group.splice(at<0?0:at,1);
        ordered.push(q);used[q.kind]++;tie=q.kind==='ji'?'ta':'ji';
      }
      remaining=remaining.filter(g=>g.length);
    }
  }
  return ordered.slice(0,count).map(q=>({...q,mode,options:shuffle(['ji','ta'],random)}));
}
export function checkTransitivityAnswer(q,answer){return (answer==='ji'||answer==='ta')&&answer===q.kind;}
export function transitivityOptionText(q,kind){return q.mode==='type'?TRANSITIVITY_KINDS[kind]:pairs.get(q.pairId)?.[kind]?.masu||'';}
export function transitivityOptionMarkup(q,kind,escape){
  if(q.mode==='type'){const [name,japanese]=TRANSITIVITY_KINDS[kind].split(' · ');return `<span>${escape(name)}<small lang="ja">${escape(japanese)}</small></span>`;}
  const v=pairs.get(q.pairId)[kind];
  return `<span lang="ja">${escape(v.masu)}${v.masu===v.masuReading?'':`<small>${escape(v.masuReading)}</small>`}</span>`;
}
export function transitivitySentenceMarkup(q,escape){
  let html='',cursor=0;
  for(const [offset,word,reading] of q.furigana){html+=escape(q.sentence.slice(cursor,offset))+`<ruby>${escape(word)}<rt>${escape(reading)}</rt></ruby>`;cursor=offset+word.length;}
  return html+escape(q.sentence.slice(cursor));
}
export function transitivityPairMarkup(p,escape){
  return `<div class="transitivity-comparison">${['ji','ta'].map(k=>{const v=p[k];return `<article><span class="transitivity-tag ${k}">${escape(TRANSITIVITY_KINDS[k])}</span><strong lang="ja">${escape(v.masu)}</strong><small lang="ja">${escape(v.masuReading)}</small><p>${escape(v.meaning)}</p><dl><div><dt>Kamus</dt><dd lang="ja">${escape(v.word)} <small>${escape(v.reading)}</small></dd></div><div><dt>Te-kei</dt><dd lang="ja">${escape(v.te)}</dd></div></dl></article>`;}).join('')}</div>`;
}
export function transitivityFeedbackMarkup(q,escape){
  const p=pairs.get(q.pairId),v=p[q.kind];
  return `<div class="answer-details transitivity-detail"><div class="transitivity-answer"><span class="transitivity-tag ${q.kind}">${escape(TRANSITIVITY_KINDS[q.kind])}</span><strong lang="ja">${escape(v.masu)}</strong></div><p class="transitivity-reason">${escape(q.reason)}</p><div class="bunpou-complete" lang="ja">${transitivitySentenceMarkup(q,escape)}</div><div class="answer-meaning"><span>Arti kalimat</span><p>${escape(q.translation)}</p></div>${transitivityPairMarkup(p,escape)}<p class="transitivity-note">${escape(p.note)}</p></div>`;
}
