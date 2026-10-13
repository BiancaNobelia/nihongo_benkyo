import { JLPT_READINGS } from './jlpt-reading-data.js?v=20261013-counters';
import { KANJI_WRITING, KATAKANA_WRITING } from './writing-data.js?v=20261013-counters';
import { SIMILAR_READING, SIMILAR_WRITING, mergePracticeBank } from './similar-quiz-core.js?v=20261013-counters';
import { SPECIAL_READINGS } from './special-reading-data.js?v=20261013-counters';

export const PRACTICE_BANKS = {
  'jlpt-reading':mergePracticeBank(mergePracticeBank(JLPT_READINGS,SIMILAR_READING),SPECIAL_READINGS),
  'hiragana-kanji':mergePracticeBank(KANJI_WRITING,SIMILAR_WRITING),
  'hiragana-katakana':KATAKANA_WRITING,
};
