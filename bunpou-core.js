import {shuffle} from './core.js?v=20261015-bunpou-order';

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
  const pool=shuffle(bunpouPool(entries,settings),random).sort((a,b)=>(history[a.id]||0)-(history[b.id]||0));
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
export function bunpouFeedbackMarkup(q,escape) {
  return `<div class="answer-details bunpou-detail"><div class="bunpou-complete" lang="ja">${escape(q.before)}<strong>${escape(q.answer)}</strong>${escape(q.after)}</div><div class="answer-meaning"><span>Arti kalimat</span><p>${escape(q.translation)}</p></div><div class="bunpou-rule"><span>POLA · BAB ${q.chapter}</span><h3 lang="ja">${escape(q.pattern)}</h3><p>${escape(q.meaning)}</p><dl><div><dt>Rumus</dt><dd>${escape(q.structure)}</dd></div><div><dt>Catatan</dt><dd>${escape(q.note)}</dd></div></dl></div></div>`;
}
