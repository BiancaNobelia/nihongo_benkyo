import { shuffle } from './core.js?v=20261015-jidoushi-tadoushi';
import { writingOptionDetails } from './writing-choice-details.js?v=20261016-writing-feedback';

export function createWritingQuiz(pool, count, random = Math.random) {
  return shuffle(pool, random).slice(0, Math.max(0, Math.min(count, pool.length))).map(q => {
    const options=shuffle([q.answer, ...q.distractors], random);
    return {
      prompt:q.prompt, answer:q.answer, level:q.level, meaning:q.meaning, reading:q.reading,
      sentence:q.sentence, sentenceMeaning:q.sentenceMeaning, explanation:q.explanation,
      topicIds:q.topicIds, target:q.target,
      options,
      ...(q.mode==='hiragana-kanji' ? {optionDetails:options.map(word=>writingOptionDetails(q,word))} : {}),
    };
  });
}

export function sentenceParts(sentence) {
  return sentence.split('{target}');
}
