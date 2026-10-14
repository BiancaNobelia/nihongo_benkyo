import { shuffle } from './core.js?v=20261014-katakana-expanded';
import { selectReadingQuestions } from './reading-balance.js?v=20261014-katakana-expanded';

export function filterReadingQuestions(bank, level = 'all') {
  return bank.filter(q => level === 'all' || q.level === level);
}

export function createReadingQuiz(pool, count, random = Math.random) {
  return selectReadingQuestions(pool,count,random).map(q => ({
    id:q.id, contextKey:q.contextKey,
    readingCategory:q.readingCategory,
    prompt: q.word,
    answer: q.reading,
    level: q.level,
    meaning: q.meaning,
    explanation: q.explanation,
    sentence:q.sentence, sentenceMeaning:q.sentenceMeaning,
    topicIds:q.topicIds, target:q.target,
    options: shuffle([q.reading, ...q.distractors], random),
  }));
}
