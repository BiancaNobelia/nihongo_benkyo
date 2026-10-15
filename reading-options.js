import { shuffle } from './core.js?v=20261015-particles-expanded';
import { READING_CHOICES } from './reading-choice-data.js?v=20261015-particles-expanded';
import { readingQuestionKey } from './reading-history.js?v=20261015-particles-expanded';

const choicesByQuestion=new Map(READING_CHOICES.map(q=>[q.key,q]));

export function readingOptions(question, random=Math.random) {
  const source=choicesByQuestion.get(readingQuestionKey(question));
  const accepted=new Set([question.reading,...(source?.accepted || question.acceptedReadings || [])]);
  const alternatives=shuffle(source?.alternatives || [],random).filter(c=>!accepted.has(c.value));
  const selected=[];
  // Prefer two different kanji; if only one kanji has other readings, it may
  // contribute two. Keep one authored sound/spelling distractor in the mix.
  for(const candidate of alternatives){
    if(selected.length===2)break;
    if(!selected.some(c=>c.char===candidate.char))selected.push(candidate);
  }
  for(const candidate of alternatives){
    if(selected.length===2)break;
    if(!selected.some(c=>c.value===candidate.value))selected.push(candidate);
  }
  const wrong=selected.map(c=>c.value);
  for(const value of source?.phonetic || question.distractors){
    if(wrong.length===3)break;
    if(!accepted.has(value) && !wrong.includes(value))wrong.push(value);
  }
  return {options:shuffle([question.reading,...wrong],random),readingAlternatives:selected};
}

export function readingAlternativesMarkup(question, escape) {
  if(!question.readingAlternatives?.length)return '';
  const notes=question.readingAlternatives.map(c=>{
    const original=c.sourceReading.replace(/[.-]/g,'')+(c.type==='on' ? `（${c.to}）` : '');
    return `<li><span lang="ja">${escape(c.char)}</span> juga memiliki ${c.type==='on' ? 'onyomi' : 'kunyomi'} <span lang="ja">${escape(original)}</span>. Pada kata ini, bagian tersebut dibaca <span lang="ja">${escape(c.from)}</span>.</li>`;
  });
  return `<div class="answer-other-readings"><span>Mengapa ada pilihan bacaan lain?</span><ul>${[...new Set(notes)].join('')}</ul><p>Bacaan kanji berubah sesuai kata. Menggabungkan bacaan lain belum tentu menghasilkan bacaan kata yang benar.</p></div>`;
}
