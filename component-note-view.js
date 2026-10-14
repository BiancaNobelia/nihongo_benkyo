import { MON_COMPONENT_NOTES } from './mon-components-data.js?v=20261015-henkan-forms';

export const componentNoteFor = char => MON_COMPONENT_NOTES[char] || null;

export function componentNoteMarkup(char, escape) {
  const note = componentNoteFor(char);
  if (!note) return '';
  const partsMarkup = parts => `<ul class="shape-parts">${parts.map(part =>
    `<li><div class="shape-part"><span class="shape-part-symbol" lang="ja">${escape(part.symbol)}</span><div><strong>${escape(part.meaning)}</strong><small>${escape(part.position)}</small></div></div>${part.children.length ? partsMarkup(part.children) : ''}</li>`
  ).join('')}</ul>`;
  return `<section class="shape-explanation" aria-label="Komponen ${escape(char)}"><h4>Komponen & artinya</h4><p>${escape(note.summary)}</p>${partsMarkup(note.parts)}${note.note ? `<p class="shape-note">${escape(note.note)}</p>` : ''}</section>`;
}

export function explainedKanjiCard(k, escape, icon) {
  return `<article class="radical-explained-card"><header><span class="radical-kanji-glyph" lang="ja">${escape(k.char)}</span><div><span class="similar-level ${k.level.toLowerCase()}">${escape(k.level)}</span><h3>${escape(k.meaning)}</h3><span class="radical-kanji-reading" lang="ja">${escape(k.on.slice(0,2).join('・') || k.kun[0]?.replaceAll('.','') || '—')}</span><small>${k.strokes} goresan</small></div></header>${componentNoteMarkup(k.char,escape)}<button class="text-button" data-detail="${escape(k.char)}" aria-label="Pelajari ${escape(k.char)}, ${escape(k.meaning)}">Bacaan & contoh ${icon('arrow-up')}</button></article>`;
}
