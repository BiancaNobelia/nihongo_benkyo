import { JLPT_READINGS } from './jlpt-reading-data.js?v=20261015-jidoushi-tadoushi';
import { KANJI_WRITING } from './writing-data.js?v=20261015-jidoushi-tadoushi';
import { ENGLISH_KATAKANA } from './english-katakana-data.js?v=20261015-jidoushi-tadoushi';
import { SIMILAR_READING, SIMILAR_WRITING, mergePracticeBank } from './similar-quiz-core.js?v=20261015-jidoushi-tadoushi';
import { SPECIAL_READINGS } from './special-reading-data.js?v=20261015-jidoushi-tadoushi';
import { KANJI } from './kanji-data.js?v=20261015-jidoushi-tadoushi';
import { eligibleQuizCards } from './core.js?v=20261015-jidoushi-tadoushi';
import { assignKanjiLevels, kanjiWordLevel } from './quiz-settings.js?v=20261015-jidoushi-tadoushi';
import { READING_VOCABULARY } from './reading-vocabulary-data.js?v=20261015-jidoushi-tadoushi';
import { prepareReadingBank } from './reading-balance.js?v=20261015-jidoushi-tadoushi';
import { N5_PDF_READINGS, N5_CONTEXT_OVERRIDES } from './n5-reading-data.js?v=20261015-jidoushi-tadoushi';
import { N4_PDF_READINGS } from './n4-reading-data.js?v=20261015-jidoushi-tadoushi';

const originalReadings=prepareReadingBank(mergePracticeBank(READING_VOCABULARY,mergePracticeBank(mergePracticeBank(JLPT_READINGS,SIMILAR_READING),SPECIAL_READINGS)));
const scopedReadings=originalReadings.map(q=>{
  const context=q.level==='N5' && !q.contextKey && N5_CONTEXT_OVERRIDES[q.word];
  return context ? {...q,sentence:context[0],sentenceMeaning:context[1]} : q;
});

export const PRACTICE_BANKS = {
  // Existing contextual questions win over duplicate new vocabulary entries.
  'jlpt-reading':[...scopedReadings,...N5_PDF_READINGS,...N4_PDF_READINGS],
  'hiragana-kanji':assignKanjiLevels(mergePracticeBank(KANJI_WRITING,SIMILAR_WRITING)),
  'english-katakana':ENGLISH_KATAKANA,
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
