import { KANJI } from './kanji-data.js?v=20261015-n4-pdf';
import { KANJI_COMPONENTS } from './kanji-components-data.js?v=20261015-n4-pdf';

const meanings = new Map(KANJI.map(k => [k.char, k.meaning]));

// Use the correct word, never the chosen answer, distractors or full sentence.
// Basic characters retain their meaning without inventing a decomposition.
export function explainWordKanji(word = '') {
  return [...new Set([...word].filter(char => /\p{Unified_Ideograph}/u.test(char)))]
    .filter(char => meanings.has(char))
    .map(char => ({char, meaning: meanings.get(char), components: KANJI_COMPONENTS[char] || []}));
}

export function componentDetailsMarkup(word, escape) {
  const entries = explainWordKanji(word);
  if (!entries.length) return '';
  return `<div class="answer-components"><span>Kenali kanji pada jawaban</span><ul>${entries.map(entry =>
    `<li><div class="component-heading"><strong lang="ja">${escape(entry.char)}</strong><span>${escape(entry.meaning)}</span></div>${entry.components.length ? `<p>${escape(entry.char)} memiliki ${entry.components.map(c => `${escape(c.symbol)} (${c.source !== c.symbol ? `bentuk ${escape(c.source)}, ` : ''}${escape(c.meaning)})${c.position ? ` ${escape(c.position)}` : ''}`).join(' dan ')}.</p>` : ''}</li>`
  ).join('')}</ul>${entries.some(e => e.components.length) ? '<p class="component-tip">Kenali bentuknya untuk membantu mengingat. Komponen dapat menjadi petunjuk makna atau bunyi.</p>' : ''}</div>`;
}
