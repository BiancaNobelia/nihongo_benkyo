import { JLPT_READINGS } from './jlpt-reading-data.js?v=20261013-quiz-settings';
import { KANJI_WRITING, KATAKANA_WRITING } from './writing-data.js?v=20261013-quiz-settings';
import { SIMILAR_READING, SIMILAR_WRITING, mergePracticeBank } from './similar-quiz-core.js?v=20261013-quiz-settings';
import { SPECIAL_READINGS } from './special-reading-data.js?v=20261013-quiz-settings';
import { KANJI } from './kanji-data.js?v=20261013-quiz-settings';
import { eligibleQuizCards } from './core.js?v=20261013-quiz-settings';
import { assignKanjiLevels, kanjiWordLevel } from './quiz-settings.js?v=20261013-quiz-settings';

export const PRACTICE_BANKS = {
  'jlpt-reading':assignKanjiLevels(mergePracticeBank(mergePracticeBank(JLPT_READINGS,SIMILAR_READING),SPECIAL_READINGS)),
  'hiragana-kanji':assignKanjiLevels(mergePracticeBank(KANJI_WRITING,SIMILAR_WRITING)),
  'hiragana-katakana':KATAKANA_WRITING,
};

// All material for a level participates, including counters and similar kanji.
// Old topic URLs no longer restrict this pool behind the settings screen.
export function getQuizPool(mode, level='all') {
  const bank=PRACTICE_BANKS[mode];
  if (bank) return bank.filter(q=>level==='all' || q.level===level);
  const cards=eligibleQuizCards(KANJI,mode);
  return mode==='reading'
    ? cards.map(k=>({...k,quizLevel:kanjiWordLevel(k.example.word,k.level)})).filter(k=>level==='all' || k.quizLevel===level)
    : cards.filter(k=>level==='all' || k.level===level);
}
