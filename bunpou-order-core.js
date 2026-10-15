import {shuffle} from './core.js?v=20261015-bunpou-expanded';
import {createBunpouQuiz} from './bunpou-core.js?v=20261015-bunpou-expanded';

export const BUNPOU_ORDER_HISTORY_KEY='nihongo-benkyo-bunpou-order-history-v1';

export function orderAnswerText(q,selected) {
  return selected.map(i=>q.order.tokens[i]??'').join('');
}

export function checkOrderAnswer(q,selected) {
  const size=q.order.tokens.length;
  if(!Array.isArray(selected)||selected.length!==size||new Set(selected).size!==size||selected.some(i=>!Number.isInteger(i)||i<0||i>=size))return false;
  return q.order.accepted.includes(orderAnswerText(q,selected));
}

export function shuffleOrderTiles(q,random=Math.random) {
  const indices=q.order.tokens.map((_,i)=>i);
  for(let attempt=0;attempt<8;attempt++) {
    const mixed=shuffle(indices,random);
    if(!checkOrderAnswer(q,mixed))return mixed;
  }
  // A fixed/random stub must still not show an already correct sentence.
  for(let i=1;i<indices.length;i++) {
    const mixed=[...indices];[mixed[0],mixed[i]]=[mixed[i],mixed[0]];
    if(!checkOrderAnswer(q,mixed))return mixed;
  }
  throw new Error(`No scrambled arrangement for ${q.id}`);
}

export function createBunpouOrderQuiz(entries,settings={},history={},random=Math.random) {
  return createBunpouQuiz(entries.filter(q=>q.order),settings,history,random).map(q=>({...q,tiles:shuffleOrderTiles(q,random)}));
}

export function moveOrderTile(q,selected,index,remove=false) {
  if(!Number.isInteger(index)||index<0||index>=q.order.tokens.length)return [...selected];
  if(remove)return selected.filter(i=>i!==index);
  return selected.includes(index)?[...selected]:[...selected,index];
}

export function orderHintMarkup(q,escape) {
  return `<div class="bunpou-order-hint"><div class="bunpou-order-translation"><span>ARTI BAHASA INDONESIA</span><p>${escape(q.order.translation)}</p></div><div class="bunpou-order-pattern"><span>POLA · BAB ${q.chapter}</span><strong lang="ja">${escape(q.pattern)}</strong><p>${escape(q.structure)}</p></div></div>`;
}

export function orderFeedbackEntry(q) {
  return {...q,before:'',answer:q.order.example,after:'',example:q.order.example,
    furigana:q.order.furigana??q.furigana,translation:q.order.translation};
}
