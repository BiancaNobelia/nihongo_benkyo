import {BUNPOU_PATTERNS, BUNPOU_CHAPTERS} from './bunpou-data.js?v=20261015-jidoushi-tadoushi';
import {KOTOBA_ENTRIES, KOTOBA_CHAPTERS} from './kotoba-data.js?v=20261015-jidoushi-tadoushi';
import {bunpouSentenceMarkup} from './bunpou-core.js?v=20261015-jidoushi-tadoushi';
import {materialPool, materialPage} from './materi-core.js?v=20261016-materi';

export function createMateriView({root, escape, icon}) {
  const state = {kind: 'bunpou', book: 1, chapter: 1, query: '', page: 1};
  let active = false;
  const find = selector => root.querySelector(selector);
  const num = value => value.toLocaleString('id-ID');
  const entries = () => state.kind === 'bunpou' ? BUNPOU_PATTERNS : KOTOBA_ENTRIES;
  const chapters = () => state.kind === 'bunpou' ? BUNPOU_CHAPTERS : KOTOBA_CHAPTERS;
  const unit = () => state.kind === 'bunpou' ? 'pola' : 'kotoba';
  const bookName = () => state.book ? `Minna no Nihongo ${state.book === 1 ? 'I' : 'II'}` : 'Minna no Nihongo I & II';

  function render(kind) {
    if (['bunpou', 'kotoba'].includes(kind) && kind !== state.kind) {
      state.kind = kind; state.query = ''; state.page = 1;
    }
    active = true;
    root.innerHTML = `<div class="materi-view">
      <section class="materi-hero"><div><div class="section-kicker">RAK BELAJARMU · BAB 1–50</div><h1>Catatan kecil,<br><em>pemahaman besar.</em></h1><p>List materi Minna no Nihongo I & II. Temukan pola kalimat dan kosakata yang ingin kamu pelajari, satu bab setiap kali.</p><div class="materi-metrics"><span><strong>${num(BUNPOU_PATTERNS.length)}</strong> pola bunpou</span><span><strong>${num(KOTOBA_ENTRIES.length)}</strong> entri kotoba</span><span><strong>50</strong> bab</span></div></div><div class="materi-hero-mark" aria-hidden="true"><span lang="ja">学ぶ</span><small>BACA · PAHAMI · LATIH</small></div></section>
      <nav class="materi-tabs" aria-label="Jenis materi">
        <a href="#materi/bunpou" ${state.kind === 'bunpou' ? 'aria-current="page"' : ''}><span class="materi-tab-symbol" lang="ja">文法</span><span><strong>Bunpou</strong><small>Pola, rumus & contoh kalimat</small></span>${icon('arrow')}</a>
        <a href="#materi/kotoba" ${state.kind === 'kotoba' ? 'aria-current="page"' : ''}><span class="materi-tab-symbol" lang="ja">言葉</span><span><strong>Kotoba</strong><small>Kosakata, bacaan & arti</small></span>${icon('arrow')}</a>
      </nav>
      <div class="materi-layout"><aside class="materi-index" aria-label="Pilih buku dan bab"><h2>Mulai dari babmu</h2><p>Buku I: bab 1–25<br>Buku II: bab 26–50</p>
        <div class="materi-books" role="group" aria-label="Buku materi">${[[1,'Buku I'],[2,'Buku II'],[0,'Semua']].map(([book,label]) => `<button data-materi-book="${book}" aria-pressed="${state.book === book}">${label}</button>`).join('')}</div>
        <div id="materi-chapters"></div><a class="materi-quiz-link" href="#${state.kind}">${icon('sparkles')} Buka kuis ${state.kind} ${icon('arrow')}</a>
      </aside><section class="materi-content" aria-label="Daftar materi">
        <label class="materi-search-label" for="materi-search">Cari ${state.kind === 'bunpou' ? 'pola, contoh, atau arti' : 'kata, bacaan, atau arti'}</label>
        <div class="materi-search"><span>${icon('search')}</span><input id="materi-search" type="search" autocomplete="off" value="${escape(state.query)}" placeholder="${state.kind === 'bunpou' ? 'Misalnya: ために, larangan, identitas…' : 'Misalnya: 学生, がくせい, mahasiswa…'}" aria-describedby="materi-search-scope"></div>
        <div class="materi-search-scope"><p id="materi-search-scope"></p><button class="text-button" data-materi-action="search-all">Cari di semua bab</button></div>
        <div class="materi-results-heading"><div><div id="materi-book-label" class="section-kicker"></div><h2 id="materi-title" tabindex="-1"></h2><p id="materi-chapter-title"></p></div><span id="materi-count" role="status" aria-live="polite"></span></div>
        <div id="materi-results"></div>
        <div class="materi-pagination" aria-label="Halaman materi"><button class="secondary" data-materi-action="prev" aria-label="Halaman materi sebelumnya">${icon('back')} Sebelumnya</button><span id="materi-page" role="status"></span><button class="secondary" data-materi-action="next" aria-label="Halaman materi berikutnya">Berikutnya ${icon('arrow')}</button></div>
      </section></div><p class="materi-source">Materi mengikuti daftar belajar yang dipakai dalam kuis: 330 pola bunpou dan 1.690 entri kotoba bab 1–50. Kata yang diperkenalkan kembali di bab lain tetap dicantumkan. <a href="./DATA-SOURCES.md" target="_blank" rel="noopener">Sumber materi ${icon('arrow-up')}</a></p>
    </div>`;
    update();
  }

  function update() {
    root.querySelectorAll('[data-materi-book]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.materiBook) === state.book)));
    const visibleChapters = chapters().filter(chapter => !state.book || (chapter.number <= 25 ? 1 : 2) === state.book);
    find('#materi-chapters').innerHTML = `<button class="materi-all" data-materi-chapter="0" aria-pressed="${!state.chapter}">Semua bab${state.book ? ` · Buku ${state.book === 1 ? 'I' : 'II'}` : ''}</button><div class="materi-chapter-grid" role="group" aria-label="Bab materi">${visibleChapters.map(chapter => `<button data-materi-chapter="${chapter.number}" aria-pressed="${state.chapter === chapter.number}" aria-label="Bab ${chapter.number}: ${escape(chapter.title)}" title="${escape(chapter.title)}"><small>BAB</small><strong>${chapter.number}</strong></button>`).join('')}</div>`;
    const chapter = chapters().find(chapter => chapter.number === state.chapter);
    find('#materi-search-scope').textContent = `Pencarian dalam ${chapter ? `bab ${chapter.number}` : state.book ? `bab ${state.book === 1 ? '1–25' : '26–50'}` : 'bab 1–50'}.`;
    find('[data-materi-action="search-all"]').hidden = !state.book && !state.chapter;
    find('#materi-book-label').textContent = bookName();
    find('#materi-title').textContent = `${state.kind === 'bunpou' ? 'Bunpou' : 'Kotoba'} · ${chapter ? `Bab ${chapter.number}` : 'Semua bab'}`;
    find('#materi-chapter-title').textContent = chapter?.title || (state.book ? `Bab ${state.book === 1 ? '1–25' : '26–50'}` : 'Bab 1–50');
    renderResults();
  }

  function patternCard(entry, index) {
    return `<article class="materi-pattern"><header><span class="materi-badge">Bab ${entry.chapter} · Pola ${index}</span><h3 lang="ja">${escape(entry.pattern)}</h3><p>${escape(entry.meaning)}</p></header><div class="materi-formula"><span>RUMUS</span><p>${escape(entry.structure)}</p></div><div class="materi-example"><span>CONTOH KALIMAT</span><p class="materi-japanese" lang="ja">${bunpouSentenceMarkup(entry, escape)}</p><p class="materi-translation">${escape(entry.translation)}</p></div>${entry.note ? `<p class="materi-note">${icon('leaf')}<span>${escape(entry.note)}</span></p>` : ''}</article>`;
  }

  function wordCard(entry, index) {
    return `<article class="materi-word"><div class="materi-word-number">${index}</div><div class="materi-word-japanese"><h3 lang="ja">${escape(entry.spelling || entry.reading)}</h3><p lang="ja">${escape(entry.reading)}</p></div><div class="materi-word-meaning"><p>${escape(entry.meaning)}</p><div><span class="materi-word-type">${escape(entry.type)}</span><span class="materi-badge">Bab ${entry.chapter}</span></div></div></article>`;
  }

  function renderResults() {
    const filtered = materialPool(entries(), state);
    const page = materialPage(filtered, state.page, state.kind === 'bunpou' ? 10 : 20);
    state.page = page.page;
    find('#materi-count').textContent = `${num(filtered.length)} ${unit()}${state.query.trim() ? ' cocok' : ''}`;
    find('#materi-results').innerHTML = page.rows.length
      ? `<div class="materi-${state.kind === 'bunpou' ? 'patterns' : 'words'}">${page.rows.map((entry, index) => state.kind === 'bunpou' ? patternCard(entry, page.from + index) : wordCard(entry, page.from + index)).join('')}</div>`
      : `<div class="materi-empty">${icon('search')}<h3>Belum ada materi yang cocok.</h3><p>Coba kata lain atau perluas pencarian ke semua bab.</p><button class="secondary" data-materi-action="reset">Tampilkan semua materi</button></div>`;
    find('#materi-page').textContent = `${page.page} / ${page.pages} · ${page.from}–${page.to}`;
    find('[data-materi-action="prev"]').disabled = page.page === 1;
    find('[data-materi-action="next"]').disabled = page.page === page.pages;
    find('.materi-pagination').hidden = filtered.length === 0;
  }

  root.addEventListener('input', event => {
    if (!active || event.target.id !== 'materi-search') return;
    state.query = event.target.value; state.page = 1; renderResults();
  });
  root.addEventListener('click', event => {
    if (!active) return;
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-materi-book')) {
      state.book = Number(button.dataset.materiBook);
      state.chapter = state.book === 1 ? 1 : state.book === 2 ? 26 : 0;
      state.page = 1; update();
    } else if (button.hasAttribute('data-materi-chapter')) {
      state.chapter = Number(button.dataset.materiChapter); state.page = 1; update();
      find(`[data-materi-chapter="${state.chapter}"]`).focus({preventScroll: true});
    } else if (['search-all', 'reset'].includes(button.dataset.materiAction)) {
      state.book = 0; state.chapter = 0; state.page = 1;
      if (button.dataset.materiAction === 'reset') { state.query = ''; find('#materi-search').value = ''; }
      update(); find('#materi-search').focus({preventScroll: true});
    } else if (['prev', 'next'].includes(button.dataset.materiAction)) {
      state.page += button.dataset.materiAction === 'next' ? 1 : -1;
      renderResults(); find('#materi-title').focus({preventScroll: true});
      find('.materi-results-heading').scrollIntoView({behavior: 'instant', block: 'start'});
    }
  });

  return {render, dispose() { active = false; }};
}
