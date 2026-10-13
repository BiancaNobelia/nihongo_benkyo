import { QUIZ_TOPICS, quizTopicCount } from './similar-quiz-core.js?v=20261013-similar-quiz';

export function similarityQuizCallout(id) {
  const count=quizTopicCount(id);
  if (!count) return '';
  return `<aside class="similar-practice-callout similar-vocab-callout"><div><h2>Uji bentuknya dalam kata.</h2><p>${count} kosakata pilihan dari kelompok ini. Latih dua arah dengan kalimat, pilihan mirip, dan pembahasan. Level mengikuti kosakata.</p></div><div class="similar-quiz-directions"><a class="primary" href="#kuis/hiragana-kanji/${id}">Hiragana → Kanji</a><a class="secondary" href="#kuis/jlpt/${id}">Kanji → Hiragana</a></div></aside>`;
}

export function questionTopicLinks(question, escape) {
  const topics=QUIZ_TOPICS.filter(t=>question.topicIds?.includes(t.id));
  if (!topics.length) return '';
  return `<div class="quiz-topic-links"><span>Lihat lagi perbedaan bentuknya:</span>${topics.map(t=>`<a href="#mirip/${t.id}">${escape(t.label)}</a>`).join('')}</div>`;
}
