import { componentDetailsMarkup } from './kanji-components.js?v=20261015-jidoushi-tadoushi';
import { KANJI } from './kanji-data.js?v=20261015-jidoushi-tadoushi';
import { kanjiReadingsMarkup } from './quiz-choice-view.js?v=20261016-jlpt-furigana';

const kanjiByCharacter=new Map(KANJI.map(k=>[k.char,k]));

function wordReadingsMarkup(word, escape) {
  const cards=[...new Set([...word])].map(char=>kanjiByCharacter.get(char)).filter(Boolean);
  if(!cards.length)return '';
  return `<div class="answer-kanji-readings">${cards.map(card=>`<div class="answer-kanji-reading">${cards.length>1 ? `<b lang="ja">${escape(card.char)}</b>` : ''}${kanjiReadingsMarkup(card,escape)}</div>`).join('')}</div>`;
}

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
  const compact=['meaning','kanji','jlpt-reading','reading'].includes(mode);
  return `<div class="answer-details"><div class="answer-word"><span>Jawaban benar</span><strong lang="ja">${escape(detail.word)}${detail.reading ? ` <span class="answer-reading">（${escape(detail.reading)}）</span>` : ''}</strong>${mode==='jlpt-reading' ? wordReadingsMarkup(detail.word,escape) : ''}</div>${detail.english ? `<div class="answer-english"><span>Kata Inggris</span><p lang="en">${escape(detail.english)}</p></div>` : ''}${detail.meaning ? `<div class="answer-meaning"><span>${detail.meaningLabel}</span><p>${escape(detail.meaning)}</p></div>` : ''}${detail.sentence && mode!=='jlpt-reading' ? `<div class="answer-sentence"><span>Kalimat lengkap</span><p lang="ja">${escape(detail.sentence)}</p></div>` : ''}${detail.sentenceMeaning ? `<div class="answer-translation"><span>Arti kalimat</span><p>${escape(detail.sentenceMeaning)}</p></div>` : ''}${compact ? '' : componentDetailsMarkup(detail.word,escape)}${detail.explanation && !compact ? `<p class="answer-explanation">${escape(detail.explanation)}</p>` : ''}</div>`;
}
