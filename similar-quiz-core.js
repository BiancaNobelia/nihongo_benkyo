import { SIMILAR_VOCABULARY } from './similar-quiz-data.js?v=20261014-english-katakana';
import { SIMILAR_GROUPS } from './similar-data.js?v=20261014-english-katakana';
import { RADICAL_FAMILIES } from './radical-data.js?v=20261014-english-katakana';
import { READING_TOPICS } from './special-reading-data.js?v=20261014-english-katakana';

export const QUIZ_TOPICS = [
  ...RADICAL_FAMILIES.map(f => ({id:f.id,kind:'family',label:`${f.symbol} · ${f.title}`,chars:f.members})),
  ...SIMILAR_GROUPS.map(g => ({id:g.id,kind:'comparison',label:g.members.map(m=>m.char).join('・'),chars:g.members.map(m=>m.char)})),
];
const topicIds = char => QUIZ_TOPICS.filter(t=>t.chars.includes(char)).map(t=>t.id);

export const SIMILAR_READING = SIMILAR_VOCABULARY.map(q => ({
  ...q, id:`similar-reading:${q.word}`, topicIds:topicIds(q.target),
  distractors:q.readingDistractors,
  explanation:q.readingExplanation,
}));
export const SIMILAR_WRITING = SIMILAR_VOCABULARY.map(q => ({
  ...q, id:`similar-writing:${q.word}`, topicIds:topicIds(q.target),
  sourceWord:q.word, mode:'hiragana-kanji', prompt:q.reading, answer:q.word,
  distractors:q.writingDistractors,
  explanation:q.readingExplanation,
}));

// A word shared by banks is replaced by its newer version. Explicit contexts
// remain distinct: 1日 as a calendar date and as a duration teach different readings.
export const practiceQuestionKey = q => `${q.word || q.answer}${q.contextKey ? `:${q.contextKey}` : ''}`;
export function mergePracticeBank(base, additions) {
  const words = new Map(base.map(q=>[practiceQuestionKey(q),q]));
  for (const q of additions) words.set(practiceQuestionKey(q),q);
  return [...words.values()];
}

export const supportsQuizTopics = mode => ['jlpt-reading','hiragana-kanji'].includes(mode);
export const topicsForMode = mode => mode === 'jlpt-reading' ? [...READING_TOPICS,...QUIZ_TOPICS] : mode === 'hiragana-kanji' ? QUIZ_TOPICS : [];
export const resolveQuizTopic = (id,mode='jlpt-reading') => supportsQuizTopics(mode) && (id === 'similar' || topicsForMode(mode).some(t=>t.id === id)) ? id : 'all';
export const quizTopicLabel = id => id === 'similar' ? 'Semua Kanji Mirip' : [...READING_TOPICS,...QUIZ_TOPICS].find(t=>t.id === id)?.label || 'Semua materi';
const similarTopicIds=new Set(QUIZ_TOPICS.map(t=>t.id));

export function filterTopicQuestions(bank, topic = 'all', level = 'all') {
  return bank.filter(q=>(level === 'all' || q.level === level) &&
    (topic === 'all' || (topic === 'similar' ? q.topicIds?.some(id=>similarTopicIds.has(id)) : q.topicIds?.includes(topic))));
}

export function quizTopicCount(id) {
  return filterTopicQuestions(SIMILAR_WRITING,id).length;
}
