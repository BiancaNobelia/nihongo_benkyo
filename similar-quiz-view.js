import { QUIZ_TOPICS, quizTopicCount } from './similar-quiz-core.js?v=20261014-english-katakana';

export function similarityQuizCallout(id) {
  const count=quizTopicCount(id);
  if (!count) return '';
  return `<aside class="similar-practice-callout similar-vocab-callout"><div><h2>Uji bentuknya dalam kata.</h2><p>${count} kosakata dari kelompok ini tersedia di bank latihan. Pilih level kanji; soal akan bercampur otomatis dengan materi lain pada level yang sama.</p></div><div class="similar-quiz-directions"><a class="primary" href="#kuis/hiragana-kanji">Hiragana → Kanji</a><a class="secondary" href="#kuis/jlpt">Kanji → Hiragana</a></div></aside>`;
}

export function questionTopicLinks(question, escape) {
  const topics=QUIZ_TOPICS.filter(t=>question.topicIds?.includes(t.id));
  if (!topics.length) return '';
  return `<div class="quiz-topic-links"><span>Lihat lagi perbedaan bentuknya:</span>${topics.map(t=>`<a href="#mirip/${t.id}">${escape(t.label)}</a>`).join('')}</div>`;
}
