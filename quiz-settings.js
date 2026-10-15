import { KANJI } from './kanji-data.js?v=20261015-bunpou-expanded';
import { LEVELS } from './levels.js?v=20261015-bunpou-expanded';

const kanjiLevels=new Map(KANJI.map(k=>[k.char,k.level]));

// A compound belongs to the level of its most advanced kanji. Source vocabulary
// levels stay in the source banks; practice uses the same catalog as the library.
export function kanjiWordLevel(word, fallback='N5') {
  const found=[...word].map(c=>kanjiLevels.get(c)).filter(Boolean);
  return found.length ? LEVELS[Math.max(...found.map(l=>LEVELS.indexOf(l)))] : fallback;
}

export function assignKanjiLevels(bank) {
  return bank.map(q=>({...q,vocabularyLevel:q.level,level:kanjiWordLevel(q.word || q.answer,q.level),levelBasis:'kanji-catalog'}));
}

export const QUIZ_COUNT_PRESETS=[10,20,50];

export function requestedQuizCount(choice, customValue) {
  if (choice!=='custom') return QUIZ_COUNT_PRESETS.includes(Number(choice)) ? Number(choice) : null;
  const text=String(customValue ?? '').trim();
  if (!/^\d+$/.test(text)) return null;
  const count=Number(text);
  return Number.isSafeInteger(count) && count>0 ? count : null;
}
