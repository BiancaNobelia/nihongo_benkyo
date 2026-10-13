import { componentDetailsMarkup } from './kanji-components.js?v=20261014-mon-notes';

// This block is shared by correct answers, incorrect answers, timeouts and review.
// Meaning must never depend on whether an optional editorial explanation exists.
export function answerDetails(question, mode) {
  const isWriting=mode==='hiragana-kanji' || mode==='hiragana-katakana';
  const word=question.word || (isWriting ? question.answer : mode==='kanji' ? question.answer : question.prompt);
  return {
    word,
    reading:question.reading || ((mode==='jlpt-reading' || mode==='reading') ? question.answer : isWriting ? question.prompt : ''),
    meaning:question.meaning || (mode==='reading' ? question.kanji?.example?.meaning : question.kanji?.meaning) || '',
    sentence:question.sentence ? question.sentence.replace('{target}',word) : '',
    sentenceMeaning:question.sentenceMeaning || '',
    explanation:question.explanation || '',
    meaningLabel:mode==='meaning' || mode==='kanji' ? 'Arti kanji' : 'Arti kata',
  };
}

export function answerDetailsMarkup(question, mode, escape) {
  const detail=answerDetails(question,mode);
  return `<div class="answer-details"><div class="answer-word"><span>Jawaban benar</span><strong lang="ja">${escape(detail.word)}${detail.reading ? ` <span class="answer-reading">（${escape(detail.reading)}）</span>` : ''}</strong></div>${detail.meaning ? `<div class="answer-meaning"><span>${detail.meaningLabel}</span><p>${escape(detail.meaning)}</p></div>` : ''}${detail.sentence ? `<div class="answer-sentence"><span>Kalimat lengkap</span><p lang="ja">${escape(detail.sentence)}</p></div>` : ''}${detail.sentenceMeaning ? `<div class="answer-translation"><span>Arti kalimat</span><p>${escape(detail.sentenceMeaning)}</p></div>` : ''}${componentDetailsMarkup(detail.word,escape)}${detail.explanation ? `<p class="answer-explanation">${escape(detail.explanation)}</p>` : ''}</div>`;
}
