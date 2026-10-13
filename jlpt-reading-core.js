import { shuffle } from './core.js?v=20261013-similar-quiz';

export function filterReadingQuestions(bank, level = 'all') {
  return bank.filter(q => level === 'all' || q.level === level);
}

export function createReadingQuiz(pool, count, random = Math.random) {
  return shuffle(pool, random).slice(0, Math.max(0, Math.min(count, pool.length))).map(q => ({
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
