// Each choice keeps the source record selected by the quiz generator. Never
// infer its Japanese word from a translated label: several words can share it.
const readingText = values => (values || []).map(value=>value.replace('.', '（')+(value.includes('.')?'）':'')).join('・') || '—';

export function kanjiReadingsMarkup(kanji, escape) {
  return `<dl class="quiz-kanji-readings"><div class="quiz-reading-on"><dt>Onyomi</dt><dd lang="ja">${escape(readingText(kanji.on))}</dd></div><div class="quiz-reading-kun"><dt>Kunyomi</dt><dd lang="ja">${escape(readingText(kanji.kun))}</dd></div></dl>`;
}

export function kanjiChoiceDetailsMarkup(kanji, escape, mode = 'meaning') {
  const readings=[...new Set([kanji.on?.[0],kanji.kun?.[0]].filter(Boolean))];
  return `<span class="quiz-choice-detail">${mode==='kanji' ? `<small class="quiz-choice-meaning" lang="id">${escape(kanji.meaning)}</small>` : `<strong class="quiz-choice-word quiz-choice-kanji" lang="ja">${escape(kanji.char)}</strong>`}<small class="quiz-choice-reading" lang="ja" title="Contoh bacaan on dan kun">${escape(readingText(readings))}</small></span>`;
}

export function kotobaChoiceDetailsMarkup(entry, mode, escape) {
  const meaningChoice=['jp-id','audio-jp'].includes(mode);
  const showWord=meaningChoice || (mode==='reading' && entry.word!==entry.reading);
  const showReading=mode!=='reading' && entry.word!==entry.reading;
  return `<span class="quiz-choice-detail">${showWord?`<strong class="quiz-choice-word" lang="ja">${escape(entry.word)}</strong>`:''}${showReading?`<small class="quiz-choice-reading" lang="ja">${escape(entry.reading)}</small>`:''}${!meaningChoice?`<small class="quiz-choice-meaning" lang="id">${escape(entry.meaning)}</small>`:''}</span>`;
}

export function writingChoiceDetailsMarkup(detail, escape) {
  if(detail.reading)return `<span class="quiz-choice-detail"><small class="quiz-choice-reading" lang="ja">${escape(detail.reading)}</small><small class="quiz-choice-meaning" lang="id">${escape(detail.meaning)}</small></span>`;
  const single=detail.characters.length===1 && detail.word===detail.characters[0].char;
  return `<span class="quiz-choice-detail">${single ? '' : '<small class="quiz-character-note">Arti per kanji</small>'}${detail.characters.map(card=>`<span class="quiz-choice-character"><small class="quiz-choice-meaning" lang="id">${single ? '' : `<b lang="ja">${escape(card.char)}</b> · `}${escape(card.meaning)}</small></span>`).join('')}</span>`;
}

export function choiceResultMarkup(correct, chosen) {
  return correct ? '<small class="quiz-choice-result">✓ Jawaban benar</small>' : chosen ? '<small class="quiz-choice-result">× Pilihanmu</small>' : '';
}
