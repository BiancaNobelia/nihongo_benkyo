import { SIMILAR_VOCABULARY } from './similar-quiz-data.js?v=20261013-similar-quiz';
import { SIMILAR_GROUPS } from './similar-data.js?v=20261013-similar-quiz';
import { RADICAL_FAMILIES } from './radical-data.js?v=20261013-similar-quiz';

export const QUIZ_TOPICS = [
  ...RADICAL_FAMILIES.map(f => ({id:f.id,kind:'family',label:`${f.symbol} · ${f.title}`,chars:f.members})),
  ...SIMILAR_GROUPS.map(g => ({id:g.id,kind:'comparison',label:g.members.map(m=>m.char).join('・'),chars:g.members.map(m=>m.char)})),
];
const topicIds = char => QUIZ_TOPICS.filter(t=>t.chars.includes(char)).map(t=>t.id);

export const SIMILAR_READING = SIMILAR_VOCABULARY.map(q => ({
  ...q, id:`similar-reading:${q.word}`, topicIds:topicIds(q.target),
  distractors:q.readingDistractors,
  explanation:`${q.readingExplanation} ${q.visualExplanation}`,
}));
export const SIMILAR_WRITING = SIMILAR_VOCABULARY.map(q => ({
  ...q, id:`similar-writing:${q.word}`, topicIds:topicIds(q.target),
  sourceWord:q.word, mode:'hiragana-kanji', prompt:q.reading, answer:q.word,
  distractors:q.writingDistractors,
  explanation:`${q.visualExplanation} ${q.readingExplanation}`,
}));

// Prefer the new contextual version of a shared word; never repeat the same
// vocabulary in a session just because it belongs to several groups.
export function mergePracticeBank(base, additions) {
  const words = new Map(base.map(q=>[q.word || q.answer,q]));
  for (const q of additions) words.set(q.word || q.answer,q);
  return [...words.values()];
}

export const supportsQuizTopics = mode => ['jlpt-reading','hiragana-kanji'].includes(mode);
export const resolveQuizTopic = id => id === 'similar' || QUIZ_TOPICS.some(t=>t.id === id) ? id : 'all';
export const quizTopicLabel = id => id === 'similar' ? 'Semua Kanji Mirip' : QUIZ_TOPICS.find(t=>t.id === id)?.label || 'Semua materi';

export function filterTopicQuestions(bank, topic = 'all', level = 'all') {
  return bank.filter(q=>(level === 'all' || q.level === level) &&
    (topic === 'all' || (topic === 'similar' ? q.topicIds?.length : q.topicIds?.includes(topic))));
}

export function quizTopicCount(id) {
  return filterTopicQuestions(SIMILAR_WRITING,id).length;
}
