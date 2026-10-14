import { componentDetailsMarkup } from './kanji-components.js?v=20261014-kotoba-n3';
import { readingAlternativesMarkup } from './reading-options.js?v=20261014-kotoba-n3';

// This block is shared by correct answers, incorrect answers, timeouts and review.
// Meaning must never depend on whether an optional editorial explanation exists.
export function answerDetails(question, mode) {
  const isWriting=['hiragana-kanji','hiragana-katakana','english-katakana'].includes(mode);
  const word=question.word || (isWriting ? question.answer : mode==='kanji' ? question.answer : question.prompt);
  return {
    word,
    english:mode==='english-katakana' ? question.prompt : '',
    reading:question.reading || ((mode==='jlpt-reading' || mode==='reading') ? question.answer : isWriting && mode!=='english-katakana' ? question.prompt : ''),
    meaning:question.meaning || (mode==='reading' ? question.kanji?.example?.meaning : question.kanji?.meaning) || '',
    sentence:mode!=='reading' && question.sentence ? question.sentence.replace('{target}',word) : '',
    sentenceMeaning:mode==='reading' ? '' : question.sentenceMeaning || '',
    explanation:question.explanation || '',
    meaningLabel:mode==='meaning' || mode==='kanji' ? 'Arti kanji' : 'Arti kata',
  };
}

export function answerDetailsMarkup(question, mode, escape) {
  const detail=answerDetails(question,mode);
  return `<div class="answer-details"><div class="answer-word"><span>Jawaban benar</span><strong lang="ja">${escape(detail.word)}${detail.reading ? ` <span class="answer-reading">（${escape(detail.reading)}）</span>` : ''}</strong></div>${detail.english ? `<div class="answer-english"><span>Kata Inggris</span><p lang="en">${escape(detail.english)}</p></div>` : ''}${detail.meaning ? `<div class="answer-meaning"><span>${detail.meaningLabel}</span><p>${escape(detail.meaning)}</p></div>` : ''}${detail.sentence ? `<div class="answer-sentence"><span>Kalimat lengkap</span><p lang="ja">${escape(detail.sentence)}</p></div>` : ''}${detail.sentenceMeaning ? `<div class="answer-translation"><span>Arti kalimat</span><p>${escape(detail.sentenceMeaning)}</p></div>` : ''}${componentDetailsMarkup(detail.word,escape)}${detail.explanation ? `<p class="answer-explanation">${escape(detail.explanation)}</p>` : ''}${mode==='jlpt-reading' ? readingAlternativesMarkup(question,escape) : ''}</div>`;
}
