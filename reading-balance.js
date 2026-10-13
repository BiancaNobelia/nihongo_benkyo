import { shuffle } from './core.js?v=20261013-components';
import { READING_METADATA } from './reading-metadata.js?v=20261013-components';

export const READING_CATEGORIES = {
  noun:'Kata benda', verb:'Kata kerja', adjective:'Kata sifat', adverb:'Kata keterangan', special:'Hitungan & tanggal',
};
const metadata=new Map(READING_METADATA.map(q=>[`${q.word}:${q.reading}`,q]));

export function prepareReadingBank(bank) {
  return bank.map(q=>{
    const source=metadata.get(`${q.word}:${q.reading}`);
    const special=q.topicIds?.includes('bacaan-khusus') && !q.topicIds.includes('bunyi-kata');
    return {...q,
      level:source?.level || q.level,
      levelBasis:source ? 'vocabulary-source' : q.levelBasis,
      readingCategory:special ? 'special' : source?.category || q.readingCategory || 'noun',
    };
  });
}

// Round-robin category selection avoids weighting a category by its bank size.
// Each pass changes order, and the final session is shuffled independently.
function takeBalanced(pool, count, category, random) {
  const buckets=new Map();
  for(const q of shuffle(pool,random)) {
    const key=category(q);
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(q);
  }
  const result=[];
  while(result.length<count) {
    const active=shuffle([...buckets.values()].filter(b=>b.length),random);
    if(!active.length)break;
    for(const bucket of active) {
      if(result.length===count)break;
      result.push(bucket.pop());
    }
  }
  return result;
}

export function selectReadingQuestions(pool, count, random=Math.random) {
  const size=Math.max(0,Math.min(Math.floor(count) || 0,pool.length));
  const lexical=pool.filter(q=>q.readingCategory!=='special');
  const special=pool.filter(q=>q.readingCategory==='special');
  // Normally at most 20% counting/date exercises. For a near-complete-bank
  // session, use remaining special exercises instead of repeating vocabulary.
  const specialCount=Math.min(special.length,Math.max(Math.floor(size/5),size-lexical.length));
  const selected=takeBalanced(lexical,size-specialCount,q=>q.readingCategory || 'noun',random);
  selected.push(...takeBalanced(special,specialCount,q=>q.topicIds?.includes('penghitung-benda') ? 'counter' : q.topicIds?.includes('nominal-yen') ? 'yen' : 'date',random));
  return shuffle(selected,random);
}

export function readingComposition(bank) {
  return Object.entries(READING_CATEGORIES).map(([key,label])=>({key,label,count:bank.filter(q=>(q.readingCategory || 'noun')===key).length}));
}
