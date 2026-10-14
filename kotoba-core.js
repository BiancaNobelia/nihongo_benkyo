import { shuffle } from './core.js?v=20261014-sentence-modes';

export const KOTOBA_MODES = {
  'jp-id': { label:'Jepang → Indonesia', short:'JP → ID', caption:'Pilih arti kosakata berikut.', answerLanguage:'id' },
  'id-jp': { label:'Indonesia → Jepang', short:'ID → JP', caption:'Pilih kosakata Jepang yang sesuai.', answerLanguage:'ja' },
  reading: { label:'Bacaan kana', short:'漢 → あ', caption:'Pilih bacaan kata berikut.', answerLanguage:'ja' },
  'audio-jp': { label:'Suara Jepang → Arti', short:'Dengar JP', caption:'Dengarkan kosakata Jepang, lalu pilih artinya.', answerLanguage:'id', audio:'ja' },
  'audio-id': { label:'Suara Indonesia → Jepang', short:'Dengar ID', caption:'Dengarkan artinya, lalu pilih kosakata Jepang.', answerLanguage:'ja', audio:'id' },
};

export const ALL_CHAPTERS = Array.from({length:50},(_,i)=>i+1);
export const normalize = value => value.normalize('NFKC').toLocaleLowerCase('id').replace(/[\s。、？！?!.,]/gu,'').trim();
const kanaKey = value => normalize(value).replace(/[ァ-ヶ]/gu,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const unique = values => [...new Map(values.map(s=>[normalize(s),s])).values()];

// Conservative sense matching: parentheses supply context, not a different
// meaning. Shared senses must never appear as competing answers.
export function meaningKeys(value) {
  return [...new Set(value.normalize('NFKC').toLocaleLowerCase('id')
    .replace(/\([^)]*\)/g,'').split(/\s*[/;]\s*|\s+atau\s+/)
    .map(s=>s.replace(/[.!?…]/g,'').replace(/\s+/g,' ').trim()).filter(Boolean))];
}
const intersects = (a,b) => a.some(value=>b.includes(value));

export function getKotobaPool(entries, { chapters=ALL_CHAPTERS, type='all', mode='jp-id' }={}) {
  const selected = new Set(chapters);
  const grouped = new Map();
  for (const e of entries) {
    if (!selected.has(e.chapter) || (type!=='all' && type!==e.type)) continue;
    const word=e.spelling || e.reading;
    if (mode==='reading' && !/\p{Script=Han}/u.test(word)) continue;
    // A suffix placeholder cannot be pronounced as an independent word.
    if (mode==='audio-jp' && /[～〜]/u.test(e.reading)) continue;
    const key=`${normalize(word)}|${kanaKey(e.reading)}`;
    if (!grouped.has(key)) grouped.set(key,{id:key,word,reading:e.reading,meanings:[],chapters:[],types:[],sourceRows:[]});
    const q=grouped.get(key);
    q.meanings.push(e.meaning); q.chapters.push(e.chapter); q.types.push(e.type); q.sourceRows.push(e.sourceRow);
  }
  return [...grouped.values()].map(q=>({...q,
    meanings:unique(q.meanings), meaning:unique(q.meanings).join('; '),
    chapters:[...new Set(q.chapters)].sort((a,b)=>a-b), types:[...new Set(q.types)],
    senses:[...new Set(q.meanings.flatMap(meaningKeys))], wordKey:normalize(q.word), readingKey:kanaKey(q.reading),
  }));
}

export function chapterLabel(chapters) {
  const sorted=[...new Set(chapters)].sort((a,b)=>a-b);
  if (!sorted.length) return 'Belum memilih bab';
  const ranges=[];
  for(let i=0;i<sorted.length;i++) {
    const start=sorted[i]; let end=start;
    while(sorted[i+1]===end+1) end=sorted[++i];
    ranges.push(start===end ? String(start) : `${start}–${end}`);
  }
  return `Bab ${ranges.join(', ')}`;
}

export function createKotobaQuiz(entries, settings, random=Math.random) {
  const { mode='jp-id', count=10 }=settings;
  if (!Object.hasOwn(KOTOBA_MODES,mode) || !Number.isSafeInteger(count) || count<1) return [];
  const targets=shuffle(getKotobaPool(entries,settings),random);
  // Distractors may use other word types, but always stay in the selected chapters.
  const candidates=getKotobaPool(entries,{chapters:settings.chapters});
  const complete=getKotobaPool(entries);
  const isMeaning=mode==='jp-id' || mode==='audio-jp';
  const isReading=mode==='reading';
  const answerOf=q=>isMeaning ? q.meaning : isReading ? q.reading : q.word;
  const questions=[];
  for(const q of targets) {
    const equivalents=complete.filter(other=>other.wordKey===q.wordKey || other.readingKey===q.readingKey || intersects(q.senses,other.senses));
    const validWords=new Set(equivalents.map(other=>other.wordKey));
    const validReadings=new Set(equivalents.map(other=>other.readingKey));
    const validSenses=[...new Set(equivalents.flatMap(other=>other.senses))];
    const safe=candidates.filter(other=>!validWords.has(other.wordKey) && !validReadings.has(other.readingKey)
      && !intersects(validSenses,other.senses));
    const sameType=shuffle(safe.filter(other=>intersects(q.types,other.types)),random);
    const others=shuffle(safe.filter(other=>!intersects(q.types,other.types)),random);
    const answer=answerOf(q);
    const distractors=[], used=new Set([normalize(answer)]);
    for(const candidate of [...sameType,...others]) {
      const value=answerOf(candidate), key=normalize(value);
      if(used.has(key)) continue;
      used.add(key);distractors.push(value);
      if(distractors.length===3) break;
    }
    if(distractors.length<3) continue;
    questions.push({...q,mode,answer,options:shuffle([answer,...distractors],random),
      prompt:isMeaning || isReading ? q.word : q.meaning,
      audioText:mode==='audio-jp' ? q.reading : q.meaning,
    });
    if(questions.length>=count) break;
  }
  return questions;
}

export function matchingVoice(voices, language) {
  return voices.find(v=>v.lang.toLowerCase().replace('_','-').split('-')[0]===language) || null;
}
