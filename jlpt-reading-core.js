import { selectReadingQuestions } from './reading-balance.js?v=20261014-kotoba-n3';
import { readingOptions } from './reading-options.js?v=20261014-kotoba-n3';
import { withReadingSentence } from './reading-sentences.js?v=20261014-kotoba-n3';

export function filterReadingQuestions(bank, level = 'all') {
  return bank.filter(q => level === 'all' || q.level === level);
}

export function createReadingQuiz(pool, count, random = Math.random, history = {}) {
  return selectReadingQuestions(pool,count,random,history).map(withReadingSentence).map(q => ({
    id:q.id, contextKey:q.contextKey,
    readingCategory:q.readingCategory,
    prompt: q.word,
    answer: q.reading,
    level: q.level,
    meaning: q.meaning,
    explanation: q.explanation,
    sentence:q.sentence, sentenceMeaning:q.sentenceMeaning,
    topicIds:q.topicIds, target:q.target,
    ...readingOptions(q,random),
  }));
}
