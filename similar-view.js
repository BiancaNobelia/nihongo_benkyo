import { filterSimilarGroups, createSimilarPractice } from './similar-core.js?v=20261015-henkan-forms';
import { RADICAL_FAMILIES } from './radical-data.js?v=20261015-henkan-forms';
import { createRadicalView } from './radical-view.js?v=20261015-henkan-forms';
import { similarityQuizCallout } from './similar-quiz-view.js?v=20261015-henkan-forms';

export function createSimilarView({root, kanji, groups, categories, levels, escape, icon, activity}) {
  const byChar = new Map(kanji.map(k => [k.char, k]));
  const uniqueCount = new Set(groups.flatMap(g => g.members.map(m => m.char))).size;
  const pageSize = 12;
  let filters = {query:'', category:'all', level:'all'};
  let page = 1;
  let selected = null;
  let practice = null;
  let section = 'families';
  const radicalView = createRadicalView({root,kanji,levels,escape,icon});
  const glyphs = group => group.members.map(m => m.char).join(' · ');
  const badge = k => `<span class="similar-level ${k.level.toLowerCase()}">${k.level}</span>`;

  function renderList() {
    selected = null; practice = null;
    root.innerHTML = `<section class="similar-hero"><div><div class="section-kicker">LIHAT DEKAT, INGAT LEBIH LEKAT</div><h1>Mirip bentuknya.<br><em>Kenali bedanya.</em></h1><p>Kadang hanya satu garis. Bandingkan kanji yang sering terlihat serupa, lalu temukan ciri kecil yang membuatnya berbeda.</p><div class="similar-stats"><span><strong>${groups.length}</strong> kelompok pilihan</span><span><strong>${uniqueCount}</strong> kanji untuk dibandingkan</span></div></div><div class="similar-hero-pair" aria-hidden="true"><div><span lang="ja">未</span><small>ATAS PENDEK</small></div><span class="similar-versus">≠</span><div><span lang="ja">末</span><small>ATAS PANJANG</small></div></div></section>
      <section class="similar-library" aria-label="Kelompok kanji mirip"><div class="section-head"><div><h2>Temukan pola yang membedakan.</h2><p>Pilih jenis kemiripan, lalu bandingkan satu kelompok.</p></div></div>
      <div class="similar-categories" role="group" aria-label="Jenis kemiripan">${[['all','Semua kemiripan'], ...Object.entries(categories)].map(([id,label]) => `<button class="similar-category ${filters.category === id ? 'active' : ''}" data-similar-category="${id}" aria-pressed="${filters.category === id}">${label}<span>${id === 'all' ? groups.length : groups.filter(g => g.category === id).length}</span></button>`).join('')}</div>
      <div class="similar-filters"><label class="search-wrap">${icon('search')}<input id="similar-search" type="search" autocomplete="off" aria-label="Cari kelompok kanji mirip" placeholder="Cari kanji, arti, atau bacaan..." value="${escape(filters.query)}"></label><div class="field"><label for="similar-level">Kelompok dengan kanji level</label><select id="similar-level"><option value="all">Semua level</option>${levels.map(level => `<option value="${level}" ${filters.level === level ? 'selected' : ''}>${level}</option>`).join('')}</select></div></div>
      <p class="similar-filter-note">Filter level memilih kelompok yang memuat level tersebut. Semua pasangannya tetap ditampilkan agar bisa dibandingkan.</p><div id="similar-results"></div></section>
      <p class="similar-footnote">Kelompok pilihan berdasarkan bentuk, bukan kesamaan arti atau bacaan. Tips adalah alat bantu ingatan, bukan penjelasan asal-usul kanji. Detail goresan bisa sedikit berbeda menurut jenis huruf.</p>`;
    root.querySelector('.similar-hero p').textContent = 'Kenali kanji melalui radikal yang sama, lalu bandingkan bentuk yang mudah tertukar. Mulai dari keluarga air dan perjalanan, hingga perbedaan satu garis.';
    root.querySelector('.similar-stats').insertAdjacentHTML('afterbegin', `<span><strong>${RADICAL_FAMILIES.length}</strong> keluarga radikal</span>`);
    root.querySelector('.similar-library').insertAdjacentHTML('beforebegin', `<div class="similar-section-tabs" role="group" aria-label="Cara menjelajahi kanji mirip"><button data-similar-section="families" aria-pressed="${section === 'families'}" class="${section === 'families' ? 'active' : ''}">Radikal & komponen <span>${RADICAL_FAMILIES.length}</span></button><button data-similar-section="pairs" aria-pressed="${section === 'pairs'}" class="${section === 'pairs' ? 'active' : ''}">Bentuk mirip <span>${groups.length}</span></button></div>`);
    if (section === 'families') {
      const familyCount = new Set(RADICAL_FAMILIES.flatMap(f => f.members)).size;
      root.querySelector('.similar-stats').innerHTML = `<span><strong>${RADICAL_FAMILIES.length}</strong> keluarga radikal</span><span><strong>${familyCount}</strong> kanji dalam keluarga</span><span><strong>${groups.length}</strong> perbandingan bentuk</span>`;
      root.querySelector('.similar-hero-pair').innerHTML = `<div><span lang="ja">水</span><small>BENTUK DASAR</small></div><span class="similar-versus">→</span><div><span lang="ja">氵</span><small>BENTUK SAMPING</small></div>`;
      root.querySelector('.similar-footnote').remove();
      radicalView.renderOverview(root.querySelector('.similar-library'));
      return;
    }
    root.querySelector('#similar-search').addEventListener('input', e => {filters.query = e.target.value; page = 1; renderResults();});
    root.querySelector('#similar-level').addEventListener('change', e => {filters.level = e.target.value; page = 1; renderResults();});
    renderResults();
  }

  function renderResults() {
    const result = filterSimilarGroups(groups, kanji, filters);
    const pages = Math.max(1, Math.ceil(result.length / pageSize));
    page = Math.min(page, pages);
    const start = (page - 1) * pageSize;
    root.querySelector('#similar-results').innerHTML = `<p class="similar-result-count" role="status">${result.length ? `Menampilkan ${start+1}–${Math.min(start+pageSize,result.length)} dari ${result.length} kelompok` : 'Tidak ada kelompok yang cocok'}</p>${result.length ? `<div class="similar-grid">${result.slice(start, start+pageSize).map(group => `<a class="similar-group-card" href="#mirip/${group.id}" aria-label="Bandingkan ${glyphs(group)}: ${escape(group.title)}"><div class="similar-card-top"><span class="similar-category-label">${categories[group.category]}</span><span>${group.members.length} kanji</span></div><h3>${escape(group.title)}</h3><div class="similar-glyph-row">${group.members.map(m => {const k = byChar.get(m.char);return `<div><span class="similar-glyph" lang="ja">${m.char}</span><span class="similar-word-meaning">${escape(k.meaning)}</span>${badge(k)}</div>`;}).join('')}</div><div class="similar-card-bottom"><span>${escape(group.focus)}</span><span class="similar-open">Bandingkan ${icon('arrow')}</span></div></a>`).join('')}</div>` : `<div class="empty">${icon('search')}<h3>Belum ada pasangan yang cocok.</h3><p>Coba kata lain atau tampilkan semua kelompok pilihan.</p><button class="secondary" data-similar-action="reset">Tampilkan semua kelompok</button></div>`}${pages > 1 ? `<div class="similar-pagination"><button class="secondary" data-similar-action="prev" ${page === 1 ? 'disabled' : ''}>${icon('back')} Sebelumnya</button><span>Halaman ${page} / ${pages}</span><button class="secondary" data-similar-action="next" ${page === pages ? 'disabled' : ''}>Berikutnya ${icon('arrow')}</button></div>` : ''}`;
  }

  function renderGroup() {
    practice = null;
    const group = selected;
    document.title = `${glyphs(group)} — Kanji Mirip — Nihongo Benkyo`;
    root.innerHTML = `<a class="text-button similar-back" href="#mirip">${icon('back')} Semua kelompok</a><div class="view-heading"><div class="section-kicker">${categories[group.category].toUpperCase()}</div><h1>${escape(group.title)}</h1><p>${escape(group.focus)}</p></div>
      <div class="similar-compare-grid" style="--compare-count:${group.members.length}">${group.members.map(m => {const k=byChar.get(m.char);return `<article class="similar-compare-card">${badge(k)}<div class="similar-writing-box"><span lang="ja">${m.char}</span></div><h2>${escape(k.meaning)}</h2><p class="similar-stroke-count">${k.strokes} goresan</p><div class="similar-cue"><span>YANG MEMBEDAKAN</span><p>${escape(m.cue)}</p></div><button class="text-button" data-detail="${m.char}" aria-label="Detail kanji ${m.char}">Bacaan & contoh ${icon('arrow-up')}</button></article>`;}).join('')}</div>
      <aside class="similar-memory"><span class="similar-memory-icon">${icon('leaf')}</span><div><h2>Cara mengingatnya</h2><p>${escape(group.tip)}</p></div></aside>
      <div class="similar-practice-callout"><div><h2>Sudah menemukan bedanya?</h2><p>Cocokkan petunjuk bentuk dengan kanjinya. ${group.members.length} soal singkat dari kelompok ini.</p></div><button class="primary" data-similar-action="practice">${icon('target')} Latih bedanya</button></div>
      <p class="similar-footnote">Amati bentuk, ucapkan artinya, lalu coba ingat tanpa melihat petunjuk. Tips visual dapat membantu ingatan; bentuk cetak bisa sedikit berbeda menurut jenis huruf.</p>`;
    root.querySelector('.similar-footnote').insertAdjacentHTML('beforebegin',similarityQuizCallout(group.id));
  }

  function renderPractice() {
    const q = practice.questions[practice.index];
    const total = practice.questions.length;
    if (!q) {
      root.innerHTML = `<div class="study-panel"><div class="results"><div class="section-kicker">LATIHAN MEMBEDAKAN SELESAI</div><div class="result-circle">${practice.correct}/${total}<small>JAWABAN BENAR</small></div><h1>${practice.correct === total ? 'Ciri kecilnya sudah kamu kenali.' : 'Lihat lagi, lalu coba sekali lagi.'}</h1><p>${escape(selected.tip)}</p><div class="result-buttons"><button class="primary" data-similar-action="practice">${icon('repeat')} Latihan lagi</button><button class="secondary" data-similar-action="compare">Bandingkan kembali</button></div><a class="text-button" href="#mirip">Pilih kelompok lain ${icon('arrow')}</a></div></div>`;
      return;
    }
    root.innerHTML = `<div class="study-panel"><button class="text-button similar-back" data-similar-action="compare">${icon('back')} Kembali membandingkan</button><div class="view-heading"><div class="section-kicker">LATIH MATA, KUATKAN INGATAN</div><h1>Temukan bentuk yang tepat.</h1><p>${escape(selected.title)}</p></div><div class="study-top"><span>Soal <strong>${practice.index+1}</strong> / ${total}</span><span>${practice.correct} benar</span></div><div class="progress-track" role="progressbar" aria-label="Progres latihan kanji mirip" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${practice.index}"><span style="width:${practice.index/total*100}%"></span></div><section class="similar-practice-panel" aria-label="Soal kanji mirip"><span class="section-kicker">KANJI MANA YANG SESUAI?</span><h2>${escape(q.prompt)}</h2><div class="similar-answer-options">${q.options.map(char => `<button class="similar-answer" data-similar-answer="${char}" lang="ja" aria-label="Pilih ${char}" ${practice.answered ? 'disabled' : ''}>${char}</button>`).join('')}</div><p id="similar-feedback" class="quiz-feedback" role="status">Perhatikan bentuknya, lalu pilih satu kanji.</p></section><div class="quiz-next"><span></span><button class="primary" data-similar-action="question-next" disabled>${practice.index === total-1 ? 'Lihat hasil' : 'Soal berikutnya'} ${icon('arrow')}</button></div></div>`;
  }

  root.addEventListener('click', e => {
    const target = e.target.closest('button');
    if (!target || target.disabled) return;
    if (target.dataset.similarSection) {section=target.dataset.similarSection;renderList();root.querySelector(`[data-similar-section="${section}"]`).focus({preventScroll:true});return;}
    if (target.dataset.similarCategory) {
      filters.category = target.dataset.similarCategory; page = 1;
      root.querySelectorAll('[data-similar-category]').forEach(b => {const active = b.dataset.similarCategory === filters.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      renderResults(); return;
    }
    if (target.dataset.similarAnswer && practice && !practice.answered) {
      practice.answered = true;
      const q = practice.questions[practice.index];
      const chosen = target.dataset.similarAnswer;
      const correct = chosen === q.answer;
      if (correct) practice.correct++;
      root.querySelector('.study-top > span:last-child').textContent = `${practice.correct} benar`;
      root.querySelectorAll('[data-similar-answer]').forEach(b => {b.disabled = true;b.classList.toggle('correct', b.dataset.similarAnswer === q.answer);b.classList.toggle('wrong', b.dataset.similarAnswer === chosen && !correct);});
      const feedback = root.querySelector('#similar-feedback');
      feedback.className = `quiz-feedback ${correct ? 'success' : 'error'}`;
      feedback.textContent = `${correct ? 'Tepat!' : 'Belum tepat.'} ${q.answer} berarti ${byChar.get(q.answer).meaning.toLocaleLowerCase('id')}. ${q.prompt}`;
      root.querySelector('[data-similar-action="question-next"]').disabled = false;
      return;
    }
    const action = target.dataset.similarAction;
    if (action === 'reset') {filters={query:'', category:'all', level:'all'};page=1;renderList();root.querySelector('#similar-search').focus();}
    if (action === 'next' || action === 'prev') {
      page += action === 'next' ? 1 : -1;renderResults();
      const sameButton = root.querySelector(`[data-similar-action="${action}"]:not(:disabled)`);
      (sameButton || root.querySelector('.similar-pagination button:not(:disabled)'))?.focus({preventScroll:true});
      root.querySelector('#similar-results').scrollIntoView({block:'start'});
    }
    if (action === 'practice' && selected) {practice={questions:createSimilarPractice(selected),index:0,correct:0,answered:false};activity();renderPractice();root.querySelector('h1').setAttribute('tabindex','-1');root.querySelector('h1').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
    if (action === 'compare' && selected) {renderGroup();window.scrollTo({top:0,behavior:'instant'});}
    if (action === 'question-next' && practice?.answered) {practice.index++;practice.answered=false;renderPractice();root.querySelector('.similar-answer, .result-buttons button')?.focus({preventScroll:true});}
  });

  return {
    render(id) {
      if (RADICAL_FAMILIES.some(f => f.id === id)) {section='families';selected=null;practice=null;radicalView.renderFamily(id);return;}
      selected = groups.find(g => g.id === id);
      if (selected) {section='pairs';renderGroup();}
      else if (id) root.innerHTML = `<div class="empty"><h1>Kelompok tidak ditemukan.</h1><p>Pilih kembali kelompok yang ingin dibandingkan.</p><a class="primary" href="#mirip">Lihat semua kelompok</a></div>`;
      else renderList();
    },
  };
}
