import { shuffle } from './core.js?v=20261015-henkan';
import { READING_METADATA } from './reading-metadata.js?v=20261015-henkan';
import { readingQuestionKey } from './reading-history.js?v=20261015-henkan';
import { withReadingSentence } from './reading-sentences.js?v=20261015-henkan';

export const READING_CATEGORIES = {
  noun:'Kata benda', verb:'Kata kerja', adjective:'Kata sifat', adverb:'Kata keterangan', special:'Hitungan & tanggal',
};
const metadata=new Map(READING_METADATA.map(q=>[`${q.word}:${q.reading}`,q]));

export function prepareReadingBank(bank) {
  return bank.map(q=>{
    const source=metadata.get(`${q.word}:${q.reading}`);
    const special=q.topicIds?.includes('bacaan-khusus') && !q.topicIds.includes('bunyi-kata');
    return {...withReadingSentence(q),
      level:source?.level || q.level,
      levelBasis:source ? 'vocabulary-source' : q.levelBasis,
      readingCategory:special ? 'special' : source?.category || q.readingCategory || 'noun',
    };
  });
}

// Round-robin category selection avoids weighting a category by its bank size.
// Each pass changes order, and the final session is shuffled independently.
function takeBalanced(pool, count, category, random, usedWords=new Set()) {
  const buckets=new Map();
  for(const q of shuffle(pool,random)) {
    const key=category(q);
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(q);
  }
  const result=[];
  while(result.length<count) {
    const available=[...buckets.values()].filter(b=>b.length);
    const fresh=available.filter(b=>b.some(q=>!usedWords.has(`${q.word}:${q.reading}`)));
    const active=shuffle(fresh.length ? fresh : available,random);
    if(!active.length)break;
    for(const bucket of active) {
      if(result.length===count)break;
      const freshIndex=bucket.findIndex(q=>!usedWords.has(`${q.word}:${q.reading}`));
      const [question]=bucket.splice(freshIndex<0 ? bucket.length-1 : freshIndex,1);
      usedWords.add(`${question.word}:${question.reading}`);
      result.push(question);
    }
  }
  return result;
}

function selectBalanced(pool, count, random) {
  const size=Math.max(0,Math.min(Math.floor(count) || 0,pool.length));
  const lexical=pool.filter(q=>q.readingCategory!=='special');
  const special=pool.filter(q=>q.readingCategory==='special');
  // Normally at most 20% counting/date exercises. For a near-complete-bank
  // session, use remaining special exercises instead of repeating vocabulary.
  const specialCount=Math.min(special.length,Math.max(Math.floor(size/5),size-lexical.length));
  const usedWords=new Set();
  const selected=takeBalanced(lexical,size-specialCount,q=>q.readingCategory || 'noun',random,usedWords);
  selected.push(...takeBalanced(special,specialCount,q=>q.topicIds?.includes('penghitung-benda') ? 'counter' : q.topicIds?.includes('nominal-yen') ? 'yen' : 'date',random,usedWords));
  return shuffle(selected,random);
}

export function selectReadingQuestions(pool, count, random=Math.random, history={}) {
  const unique = [...new Map(pool.map(q => [readingQuestionKey(q), q])).values()];
  const size = Math.max(0, Math.min(Math.floor(count) || 0, unique.length));
  const tiers = new Map();
  for (const q of unique) {
    const saved = history[readingQuestionKey(q)];
    const seen = Number.isSafeInteger(saved) && saved > 0 ? saved : 0;
    if (!tiers.has(seen)) tiers.set(seen, []);
    tiers.get(seen).push(q);
  }
  const selected = [];
  for (const seen of [...tiers.keys()].sort((a,b) => a-b)) {
    if (selected.length === size) break;
    selected.push(...selectBalanced(tiers.get(seen), size-selected.length, random));
  }
  // Keep tiers in order: a session that crosses a round boundary must finish
  // the remaining unseen questions before displaying any repeated questions.
  return selected;
}

export function readingComposition(bank) {
  return Object.entries(READING_CATEGORIES).map(([key,label])=>({key,label,count:bank.filter(q=>(q.readingCategory || 'noun')===key).length}));
}
