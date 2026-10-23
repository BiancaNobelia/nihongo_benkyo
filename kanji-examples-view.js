import {kanjiExamples} from './kanji-examples.js?v=20261023-sentences';

const PREVIEW_COUNT = 6;

export function kanjiExamplesMarkup(card, escape) {
  const entries = kanjiExamples(card);
  const row = e => `<li class="kanji-example-row"><ruby lang="ja">${[...e.word].map(char => char === card.char ? `<strong>${escape(char)}</strong>` : escape(char)).join('')}<rp>（</rp><rt>${escape(e.reading)}</rt><rp>）</rp></ruby><p>${escape(e.meaning)}</p>${e.note?`<p class="kanji-example-note">${escape(e.note)}</p>`:''}<div class="kanji-example-sentence" data-example-sentence-key="${escape(e.word+'|'+e.reading)}"></div></li>`;
  return `<section class="example-box kanji-examples" aria-label="Temukan dalam kata">
    <div class="kanji-examples-heading"><h3 class="example-title">TEMUKAN DALAM KATA</h3><span class="kanji-examples-count">${entries.length} contoh</span></div>
    ${entries.length ? `<p class="kanji-examples-hint">Pelajari bacaan, arti, dan penggunaan ${escape(card.char)} dalam kalimat.</p><p class="example-sentences-status" data-example-sentences-status role="status">Menyiapkan contoh kalimat…</p>
      <ul class="kanji-examples-list">${entries.slice(0,PREVIEW_COUNT).map(row).join('')}</ul>
      ${entries.length>PREVIEW_COUNT ? `<details class="kanji-examples-more"><summary><span class="examples-expand">Lihat ${entries.length-PREVIEW_COUNT} contoh lainnya</span><span class="examples-collapse">Tampilkan lebih sedikit</span></summary><ul class="kanji-examples-list">${entries.slice(PREVIEW_COUNT).map(row).join('')}</ul></details>` : ''}`
      : '<p>Contoh kosakata belum tersedia untuk karakter ini. Bacaan on dan kun tetap dapat dipelajari.</p>'}
  </section>`;
}
