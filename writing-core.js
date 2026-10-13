import { shuffle } from './core.js?v=20261014-mon-notes';

export function createWritingQuiz(pool, count, random = Math.random) {
  return shuffle(pool, random).slice(0, Math.max(0, Math.min(count, pool.length))).map(q => ({
    prompt:q.prompt, answer:q.answer, level:q.level, meaning:q.meaning,
    sentence:q.sentence, sentenceMeaning:q.sentenceMeaning, explanation:q.explanation,
    topicIds:q.topicIds, target:q.target,
    options:shuffle([q.answer, ...q.distractors], random),
  }));
}

export function sentenceParts(sentence) {
  return sentence.split('{target}');
}
