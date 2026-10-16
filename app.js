import {createTransitivityView} from './transitivity-view.js?v=20261015-jidoushi-tadoushi';
import {TRANSITIVITY_PAIRS,TRANSITIVITY_ENTRIES} from './transitivity-data.js?v=20261015-jidoushi-tadoushi';
import {PARTICLE_ENTRIES,PARTICLE_TOPICS} from './particle-data.js?v=20261015-jidoushi-tadoushi';
import { createBunpouView } from './bunpou-view.js?v=20261015-jidoushi-tadoushi';
import { createMateriView } from './materi-view.js?v=20261016-materi';
import { createDokkaiView } from './dokkai-view.js?v=20261016-dokkai';
import { KANJI } from './kanji-data.js?v=20261015-jidoushi-tadoushi';
import { LEVELS as levels, LEVEL_NAMES as levelNames } from './levels.js?v=20261015-jidoushi-tadoushi';
import { shuffle, filterKanji, createQuiz, cleanProgress, localDay } from './core.js?v=20261016-choice-feedback';
import { SIMILAR_GROUPS, SIMILAR_CATEGORIES } from './similar-data.js?v=20261015-jidoushi-tadoushi';
import { groupsForCharacter } from './similar-core.js?v=20261015-jidoushi-tadoushi';
import { createSimilarView } from './similar-view.js?v=20261015-jidoushi-tadoushi';
import { RADICAL_FAMILIES } from './radical-data.js?v=20261015-jidoushi-tadoushi';
import { familiesForCharacter } from './radical-core.js?v=20261015-jidoushi-tadoushi';
import { componentNoteMarkup } from './component-note-view.js?v=20261015-jidoushi-tadoushi';

import { createReadingQuiz } from './jlpt-reading-core.js?v=20261015-jidoushi-tadoushi';
import { READING_HISTORY_KEY, cleanReadingHistory, recordReadingShown, readingHistorySummary } from './reading-history.js?v=20261015-jidoushi-tadoushi';
import { readingOptions } from './reading-options.js?v=20261015-jidoushi-tadoushi';

import { createWritingQuiz } from './writing-core.js?v=20261015-jidoushi-tadoushi';
import { READING_MODE_NAMES, usesSentence, quizPromptMarkup } from './quiz-prompt.js?v=20261015-jidoushi-tadoushi';
import { questionTopicLinks } from './similar-quiz-view.js?v=20261015-jidoushi-tadoushi';

import { PRACTICE_BANKS as practiceBanks, getQuizPool } from './practice-banks.js?v=20261015-jidoushi-tadoushi';
import { requestedQuizCount } from './quiz-settings.js?v=20261015-jidoushi-tadoushi';
import { quizSetupPanel } from './quiz-setup-view.js?v=20261015-henkan-nouns';
import { answerDetailsMarkup } from './quiz-feedback.js?v=20261015-jidoushi-tadoushi';
import { kanjiReadingsMarkup, kanjiChoiceDetailsMarkup, choiceResultMarkup } from './quiz-choice-view.js?v=20261016-choice-feedback';
import { READING_CATEGORIES, readingComposition } from './reading-balance.js?v=20261015-jidoushi-tadoushi';
import { createKotobaView } from './kotoba-view.js?v=20261016-choice-feedback';
import { KOTOBA_MODES, chapterLabel } from './kotoba-core.js?v=20261016-choice-feedback';
import { createHenkanView } from './henkan-view.js?v=20261015-henkan-nouns';
import { createParticleView } from './particle-view.js?v=20261015-jidoushi-tadoushi';

const paths = {
  speaker:'<path d="m11 4-5 4H3v8h3l5 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  book:'<path d="M12 5v16M3 4h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/>',
  cards:'<rect x="7" y="5" width="13" height="16" rx="2"/><path d="m4 17-2-13a2 2 0 0 1 2-2l11-1M11 10h5m-5 4h3"/>',
  compare:'<rect x="3" y="5" width="7" height="14" rx="1"/><rect x="14" y="5" width="7" height="14" rx="1"/><path d="M5 10h3m-3 4h3m8-4h3m-3 4h3"/>',
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM20 2v4m-2-2h4"/>',
  chart:'<path d="M4 3v17h17M8 15v-4m5 4V6m5 9V9"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
  'arrow-up':'<path d="M6 18 18 6M6 6h12v12"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
  leaf:'<path d="M20 3C5 1 2 8 5 14s15 6 15-11ZM4 21 15 9"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14zM3 22h18"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  repeat:'<path d="M20 7H7a4 4 0 0 0-4 4m14-7 3 3-3 3M4 17h13a4 4 0 0 0 4-4M7 14l-3 3 3 3"/>',
  shuffle:'<path d="M3 5h3l12 14h3M3 19h3l4-5m4-4 4-5h3m-3-3 3 3-3 3m0 8 3 3-3 3"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.book}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const root = document.querySelector('#view-root');
const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modal-content');
const KEY = 'nihongo-benkyo-progress-v1';
const viewNames = { beranda:'Beranda', materi:'List Materi', kanji:'Jelajahi Kanji', mirip:'Kanji Mirip', flashcard:'Flashcard', kuis:'Kuis Kanji', kotoba:'Kuis Kotoba', henkan:'Kuis Henkan', bunpou:'Kuis Bunpou', dokkai:'Kuis Dokkai', partikel:'Kuis Partikel', jidoushi:'Jidōshi–Tadōshi', progres:'Progres Saya' };
const modeNames = { meaning:'Kanji → Arti', kanji:'Arti → Kanji', ...READING_MODE_NAMES, 'hiragana-kanji':'Hiragana → Kanji', 'hiragana-katakana':'Hiragana → Katakana', 'english-katakana':'English → Katakana', ...Object.fromEntries(Object.entries(KOTOBA_MODES).map(([id,m])=>[`kotoba-${id}`,`Kotoba · ${m.label}`])) };
modeNames.bunpou='Bunpou · Lengkapi kalimat';
modeNames.dokkai='Dokkai · Pemahaman bacaan';
modeNames['bunpou-order']='Bunpou · Susun kalimat';
modeNames.henkan='Henkan · Perubahan kata kerja';
modeNames['transitivity-word']='Jidōshi–Tadōshi · Pilih kata kerja';
modeNames['transitivity-type']='Jidōshi–Tadōshi · Tentukan jenis';
modeNames.particle='Partikel · Lengkapi kalimat';
let storageAvailable = true;
let raw;
try { raw = JSON.parse(localStorage.getItem(KEY)); } catch { storageAvailable = false; }
let progress = cleanProgress(raw, KANJI);
let readingHistory = {};
try { readingHistory = cleanReadingHistory(JSON.parse(localStorage.getItem(READING_HISTORY_KEY)), practiceBanks['jlpt-reading']); } catch { /* Remember in memory if browser storage is unavailable. */ }
let view = '';
let filters = { level:'all', query:'', collection:'all' };
const PAGE_SIZE = 24;
let currentPage = 1;
let flash = { level:'N5', source:'all', deck:[], index:0, flipped:false, learned:0, reviewed:[] };
let quiz = null;
let quizPreferences = {level:'N5',mode:'jlpt-reading',count:10,countChoice:'10',customCount:'30',time:0};
let quizTimer;
let toastTimeout;
const similarView = createSimilarView({root, kanji:KANJI, groups:SIMILAR_GROUPS, categories:SIMILAR_CATEGORIES, levels, escape, icon, activity});
const materiView = createMateriView({root,escape,icon});
const dokkaiView = createDokkaiView({root,escape,icon,heading,activity,recordSession(entry){
  progress.history.push(entry);progress.history=progress.history.slice(-50);activity();
}});
const kotobaView = createKotobaView({root,escape,icon,heading,activity,recordSession(entry){
  progress.history.push(entry);progress.history=progress.history.slice(-50);activity();
}});
const bunpouView = createBunpouView({root,escape,icon,heading,activity,recordSession(entry){
  progress.history.push(entry);progress.history=progress.history.slice(-50);activity();
}});
const henkanView = createHenkanView({root,escape,icon,heading,activity,recordSession(entry){
  progress.history.push(entry);progress.history=progress.history.slice(-50);activity();
}});
const particleView = createParticleView({root,escape,icon,heading,activity,recordSession(entry){
  progress.history.push(entry);progress.history=progress.history.slice(-50);activity();
}});

const transitivityView = createTransitivityView({root,escape,icon,heading,activity,recordSession(entry){
  progress.history.push(entry);progress.history=progress.history.slice(-50);activity();
}});

function toast(text) {
  const el = document.querySelector('#toast');
  el.textContent = text; el.classList.add('show');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 3200);
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); storageAvailable = true; }
  catch { storageAvailable = false; toast('Penyimpanan browser tidak tersedia. Progres hanya berlaku selama sesi ini.'); }
}
function activity() { const day = localDay(); if (!progress.days.includes(day)) progress.days.push(day); save(); }
function rememberReadingQuestion(question) {
  readingHistory = recordReadingShown(readingHistory, question);
  try { localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(readingHistory)); }
  catch { toast('Riwayat soal hanya tersimpan selama halaman ini terbuka karena penyimpanan browser tidak tersedia.'); }
}
function markKnown(char, value) {
  progress.known = progress.known.filter(c => c !== char);
  if (value) progress.known.push(char);
  activity();
}
function toggleSaved(char) {
  const already = progress.saved.includes(char);
  progress.saved = already ? progress.saved.filter(c => c !== char) : [...progress.saved, char];
  save(); toast(already ? 'Kanji dihapus dari simpanan.' : 'Kanji ditambahkan ke simpanan.');
  if (view === 'kanji' || view === 'beranda') renderGrid();
  if (modal.open && modalContent.dataset.char === char) detail(char, false);
}
function stats() {
  const total = progress.history.reduce((s, h) => s + h.total, 0);
  const correct = progress.history.reduce((s, h) => s + h.correct, 0);
  return `<div class="stats-strip"><div class="stat"><span class="stat-icon">${icon('book')}</span><div><div class="stat-label">Kanji yang kamu kuasai</div><div class="stat-value">${progress.known.length}<small>/ ${KANJI.length} kanji</small></div></div></div><div class="stat"><span class="stat-icon">${icon('target')}</span><div><div class="stat-label">Akurasi latihan kuis</div><div class="stat-value">${total ? Math.round(correct / total * 100) + '%' : '—'}<small>${total ? 'jawaban benar' : 'mulai kuis pertamamu'}</small></div></div></div><div class="stat"><span class="stat-icon">${icon('leaf')}</span><div><div class="stat-label">Hari aktif belajar</div><div class="stat-value">${progress.days.length}<small>hari bertumbuh</small></div></div></div></div>`;
}
function heading(kicker, title, description) {
  return `<div class="view-heading"><div class="section-kicker">${kicker}</div><h1>${title}</h1><p>${description}</p></div>`;
}
function renderLibrary(home = false) {
  root.innerHTML = `${home ? `<section class="hero"><div class="hero-copy"><div class="eyebrow">${icon('leaf')} PERJALANAN KECIL, MAKNA BESAR</div><h1>Satu kanji,<br><em>selangkah lebih dekat.</em></h1><p class="hero-description">Kenali bentuknya, pahami maknanya, dan temukan serunya belajar bahasa Jepang. Mulai dari satu kanji hari ini.</p><div class="hero-buttons"><a class="primary" href="#flashcard">Mulai belajar ${icon('arrow')}</a><a class="text-button" href="#kanji">Jelajahi kanji ${icon('arrow-up')}</a></div></div><div class="hero-art" aria-hidden="true"><span class="orbit"></span><span class="sun-disc"></span><span class="art-stamp">日<br>本</span><div class="hero-card"><span class="hero-kanji" lang="ja">学</span><span class="hero-card-caption">MANABU · BELAJAR</span></div><span class="art-label" lang="ja">学ぶことは、楽しい。</span><div class="art-caption"><span>${icon('leaf')}</span><div>Pelan-pelan, jadi paham.<small>Setiap langkah itu berarti.</small></div></div></div></section>${stats()}` : heading('KOLEKSI KANJI', 'Kenali setiap karakter.', `${KANJI.length.toLocaleString('id-ID')} kanji dari N5 sampai N1 untuk perjalanan belajarmu. Klik kartu untuk mengenal arti, bacaan, dan contoh penggunaannya.`)}
    ${home ? '<div class="section-head"><div><div class="section-kicker">BELAJAR DENGAN CARA FAVORITMU</div><h2>Pilih latihanmu.</h2></div></div><section class="practice-hub" aria-label="Pilihan latihan">' : ''}
    ${home ? `<a class="kotoba-home-banner" href="#kotoba"><span lang="ja">言葉</span><div><strong>Kuis Kotoba Minna & JLPT N3</strong><small>Minna Bab 1–50 dan 2.276 kosakata N3 · Latih arti atau bacaan.</small></div>${icon('arrow')}</a>` : ''}
    ${home ? `<a class="kotoba-home-banner henkan-banner" href="#henkan"><span lang="ja">変換</span><div><strong>Kuis Henkan · Kata kerja, sifat & benda</strong><small>Kata kerja: 13 bentuk · Kata sifat: 6 bentuk · Kata benda: 4 bentuk · N5–N3.</small></div>${icon('arrow')}</a>` : ''}
    ${home ? `<a class="kotoba-home-banner bunpou-banner" href="#bunpou"><span lang="ja">文法</span><div><strong>Kuis Bunpou · Pahami pola kalimat</strong><small>330 pola Minna Bab 1–50 · Lengkapi atau susun kalimat dengan pola dan arti Indonesia.</small></div>${icon('arrow')}</a>` : ''}
    ${home ? `<a class="kotoba-home-banner dokkai-banner" href="#dokkai"><span lang="ja">読解</span><div><strong>Kuis Dokkai · Pahami isi bacaan</strong><small>15 bacaan · 60 soal N5–N3 · Sumber Japan Foundation, arti, dan pembahasan Indonesia.</small></div>${icon('arrow')}</a>` : ''}
    ${home ? `<a class="kotoba-home-banner particle-banner" href="#partikel"><span lang="ja">助詞</span><div><strong>Kuis Partikel · Pahami hubungan antarkata</strong><small>${PARTICLE_ENTRIES.length} kalimat · ${PARTICLE_TOPICS.length} topik partikel & gabungan · Arti dan penjelasan.</small></div>${icon('arrow')}</a>` : ''}
    ${home ? `<a class="kotoba-home-banner transitivity-banner" href="#jidoushi"><span lang="ja">自他</span><div><strong>Kuis Jidōshi–Tadōshi</strong><small>${TRANSITIVITY_PAIRS.length} pasangan · ${TRANSITIVITY_ENTRIES.length} soal Indonesia · Dua pilihan.</small></div>${icon('arrow')}</a>` : ''}
    <a class="similar-banner" href="#mirip"><span class="similar-banner-glyphs" lang="ja">未 末</span><span><strong>Serupa, tapi tidak sama.</strong><small>Bandingkan kanji mirip dan ingat ciri pembeda tiap bentuk.</small></span><span class="similar-banner-arrow">Kanji Mirip ${icon('arrow')}</span></a>
    ${home ? '</section>' : ''}
    ${home ? `<a class="materi-home-banner" href="#materi"><span>${icon('book')}</span><div><strong>List Materi · Minna no Nihongo I & II</strong><small>Baca 330 pola bunpou dan 1.690 entri kotoba, lengkap per bab 1–50.</small></div>${icon('arrow')}</a>` : ''}
    <section aria-label="Koleksi kanji"><div class="section-head"><div>${home ? '<div class="section-kicker">MULAI DARI RASA INGIN TAHU</div><h2>Kenali, pahami, ingat.</h2><p>Temukan kanji pertamamu. Atau, kenali yang baru.</p>' : '<h2>Jelajahi kanji</h2><p>Belajar sedikit demi sedikit, sesuai levelmu.</p>'}</div><select id="collection" class="collection-select" aria-label="Filter koleksi"><option value="all">Semua kanji</option><option value="saved">Tersimpan</option><option value="known">Sudah dikuasai</option><option value="new">Belum dikuasai</option></select></div>
    <div class="library-actions"><div class="level-tabs" aria-label="Filter level"><button class="level-tab ${filters.level === 'all' ? 'active' : ''}" data-level="all" aria-pressed="${filters.level === 'all'}">Semua level</button>${levels.map(l => `<button class="level-tab ${filters.level === l ? 'active' : ''}" data-level="${l}" aria-label="Level ${l}, ${KANJI.filter(k => k.level === l).length} kanji" aria-pressed="${filters.level === l}">${l}<small>${KANJI.filter(k => k.level === l).length}</small></button>`).join('')}</div><label class="search-wrap">${icon('search')}<input id="kanji-search" type="search" autocomplete="off" placeholder="Cari kanji, bacaan, atau arti..." aria-label="Cari kanji, bacaan, atau arti" value="${escape(filters.query)}"></label></div><div id="kanji-grid" class="kanji-grid"></div><div id="library-bottom" class="library-bottom"></div></section>
    ${home ? `<div class="learning-row"><a href="#flashcard" class="learning-card"><span class="learning-illustration">${icon('cards')}</span><div><h3>Kenalan lewat flashcard</h3><p>Balik kartunya. Latih ingatanmu.</p></div><span class="round-link">${icon('arrow')}</span></a><a href="#kuis" class="learning-card"><span class="learning-illustration">${icon('sparkles')}</span><div><h3>Siap uji pemahaman?</h3><p>Kuis singkat, langkah yang berarti.</p></div><span class="round-link">${icon('arrow')}</span></a></div>` : ''}`;
  document.querySelector('#collection').value = filters.collection;
  document.querySelector('#collection').addEventListener('change', e => { filters.collection = e.target.value; currentPage = 1; renderGrid(); });
  document.querySelector('#kanji-search').addEventListener('input', e => { filters.query = e.target.value; currentPage = 1; renderGrid(); });
  renderGrid();
}
function renderGrid() {
  const result = filterKanji(KANJI, { ...filters, ...progress });
  const pageSize = view === 'beranda' ? 12 : PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(result.length / pageSize));
  currentPage = Math.min(Math.max(1, currentPage), pageCount);
  const start = view === 'beranda' ? 0 : (currentPage - 1) * pageSize;
  document.querySelector('#kanji-grid').innerHTML = result.length ? result.slice(start, start + pageSize).map(k => `<article class="kanji-card"><button class="kanji-main" data-detail="${k.char}" aria-label="Pelajari ${k.char}, ${escape(k.meaning)}"><span class="kanji-level ${k.level.toLowerCase()}">${k.level}</span><span class="kanji-symbol" lang="ja">${k.char}</span><span class="kanji-meaning">${escape(k.meaning)}</span><span class="kanji-readings"><span class="kanji-reading"><small>Onyomi</small><span lang="ja">${escape(k.on.slice(0,3).join('・') || '—')}</span>${k.on.length>3?`<span class="kanji-more">+${k.on.length-3} bacaan di detail</span>`:''}</span><span class="kanji-reading"><small>Kunyomi</small><span lang="ja">${escape(k.kun.slice(0,3).join('・') || '—')}</span>${k.kun.length>3?`<span class="kanji-more">+${k.kun.length-3} bacaan di detail</span>`:''}</span></span>${progress.known.includes(k.char) ? `<span class="known-indicator" aria-label="Sudah dikuasai">${icon('check')}</span>` : ''}</button><button class="bookmark ${progress.saved.includes(k.char) ? 'saved' : ''}" data-save="${k.char}" aria-label="${progress.saved.includes(k.char) ? 'Hapus simpanan' : 'Simpan'} ${k.char}" aria-pressed="${progress.saved.includes(k.char)}">${icon('bookmark')}</button></article>`).join('') : `<div class="empty">${icon('search')}<h3>Belum ada kanji di sini.</h3><p>Coba kata lain atau ubah filter koleksimu.</p><button class="secondary" data-action="reset-filters">Lihat semua kanji</button></div>`;
  const paging = view === 'beranda'
    ? (result.length > pageSize ? `<a href="#kanji" class="text-button">Lihat semua kanji ${icon('arrow')}</a>` : '')
    : (pageCount > 1 ? `<div class="pagination"><button class="secondary" data-action="page-prev" ${currentPage === 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${icon('back')}</button><label>Halaman <select id="page-select" aria-label="Pilih halaman">${Array.from({length:pageCount}, (_,i) => `<option value="${i+1}" ${i+1 === currentPage ? 'selected' : ''}>${i+1}</option>`).join('')}</select> / ${pageCount}</label><button class="secondary" data-action="page-next" ${currentPage === pageCount ? 'disabled' : ''} aria-label="Halaman berikutnya">${icon('arrow')}</button></div>` : '');
  document.querySelector('#library-bottom').innerHTML = `<span role="status">Menampilkan ${result.length ? start+1 : 0}–${Math.min(start+pageSize, result.length)} dari ${result.length.toLocaleString('id-ID')} kanji</span>${paging}`;
  document.querySelector('#page-select')?.addEventListener('change', e => { currentPage = Number(e.target.value); renderGrid(); document.querySelector('#page-select')?.focus({preventScroll:true}); });
}
function openModal(html) { modalContent.innerHTML = html; modalContent.dataset.char = ''; if (!modal.open) modal.showModal(); }
function detail(char, record = true) {
  const k = KANJI.find(k => k.char === char); if (!k) return;
  const related = groupsForCharacter(SIMILAR_GROUPS, char);
  const families = familiesForCharacter(RADICAL_FAMILIES,char);
  if (record) activity();
  openModal(`<div class="detail-hero"><span class="detail-glyph" lang="ja">${k.char}</span><h2 id="modal-title">${escape(k.meaning)}</h2><div class="detail-meta">${k.level} · ${levelNames[k.level]} <span class="footer-separator">/</span> ${k.strokes} goresan</div>${k.meaningsEn ? `<p class="source-gloss" lang="en">${escape(k.meaningsEn.join('; '))}</p>` : ''}</div>
    <div class="reading-grid"><div><small>ONYOMI · BACAAN ON</small><p lang="ja">${escape(k.on.join('、') || '—')}</p></div><div><small>KUNYOMI · BACAAN KUN</small><p lang="ja">${escape(k.kun.join('、') || '—')}</p></div></div>
    <p class="reading-note">Titik memisahkan bacaan kanji dan akhiran hiragana (okurigana).</p>
    <div class="example-box"><span class="example-title">TEMUKAN DALAM KATA</span>${k.example ? `<ruby lang="ja">${escape(k.example.word)}<rt>${escape(k.example.reading)}</rt></ruby><p>${escape(k.example.meaning)}</p>${k.example.meaningEn ? `<small class="source-gloss" lang="en">${escape(k.example.meaningEn)}</small>` : ''}` : '<p>Contoh kosakata belum tersedia untuk karakter ini. Bacaan on dan kun tetap dapat dipelajari.</p>'}</div>
    ${componentNoteMarkup(k.char,escape)}
    ${related.length ? `<div class="similar-related"><h3>Jangan tertukar dengan...</h3>${related.map(group => `<a href="#mirip/${group.id}" class="similar-related-link"><span lang="ja">${group.members.map(m => m.char).join(' · ')}</span><span>Bandingkan ${icon('arrow')}</span></a>`).join('')}</div>` : ''}
    ${families.length ? `<div class="similar-related"><h3>Keluarga radikal & komponen</h3>${families.map(f => `<a href="#mirip/${f.id}" class="radical-related-link"><span lang="ja">${f.symbol}</span><span>${escape(f.title)}<small>${f.members.length} kanji dalam keluarga</small></span>${icon('arrow')}</a>`).join('')}</div>` : ''}
    <div class="modal-actions"><button class="secondary" data-save="${k.char}">${icon('bookmark')} ${progress.saved.includes(char) ? 'Tersimpan' : 'Simpan kanji'}</button><button class="primary" data-known="${k.char}">${icon('check')} ${progress.known.includes(char) ? 'Sudah dikuasai' : 'Tandai dikuasai'}</button></div>`);
  modalContent.dataset.char = char;
}
function levelOptions(selected = 'all', all = true) {
  return `${all ? '<option value="all">Semua level</option>' : ''}${levels.map(l => `<option value="${l}" ${l === selected ? 'selected' : ''}>${l} · ${levelNames[l]} (${KANJI.filter(k => k.level === l).length})</option>`).join('')}`;
}
function newDeck() {
  flash.deck = shuffle(filterKanji(KANJI, {level:flash.level, collection:flash.source, ...progress}));
  flash.index = 0; flash.flipped = false; flash.learned = 0; flash.reviewed = [];
}
function renderFlash() {
  if (!flash.deck.length && flash.index === 0) newDeck();
  root.innerHTML = heading('INGAT DENGAN CARA YANG RINGAN', 'Satu kartu, satu penemuan.', 'Lihat kanjinya, ingat artinya, lalu balik kartunya. Tidak perlu buru-buru.') + `<div class="study-panel"><div class="toolbar"><div class="field"><label for="flash-level">Level belajar</label><select id="flash-level">${levelOptions(flash.level)}</select></div><div class="field"><label for="flash-source">Koleksi</label><select id="flash-source"><option value="all">Semua kanji</option><option value="new">Belum dikuasai</option><option value="saved">Tersimpan</option></select></div></div><div id="flash-body"></div></div>`;
  document.querySelector('#flash-source').value = flash.source;
  document.querySelector('#flash-level').value = flash.level;
  for (const key of ['level', 'source']) document.querySelector(`#flash-${key}`).addEventListener('change', e => { flash[key] = e.target.value; newDeck(); renderFlashBody(); });
  renderFlashBody();
}
function renderFlashBody() {
  const body = document.querySelector('#flash-body');
  if (!flash.deck.length) { body.innerHTML = `<div class="empty">${icon('cards')}<h3>Koleksi ini masih kosong.</h3><p>Pilih koleksi lain atau simpan kanji dari halaman Jelajahi Kanji.</p><a class="secondary" href="#kanji">Jelajahi kanji ${icon('arrow')}</a></div>`; return; }
  if (flash.index >= flash.deck.length) { body.innerHTML = `<div class="results"><div class="result-circle">${flash.learned}<small>KANJI DIINGAT</small></div><h2>Satu sesi, banyak kemajuan.</h2><p>Kamu telah mengulang ${flash.deck.length} kartu. ${flash.deck.length - flash.learned} kartu masih perlu dilatih.</p><div class="result-buttons"><button class="secondary" data-action="flash-again">${icon('repeat')} Ulangi sesi</button><a class="primary" href="#kuis">Coba kuis ${icon('arrow')}</a></div></div>`; return; }
  const k = flash.deck[flash.index];
  body.innerHTML = `<div class="study-top"><span>Kartu <strong>${flash.index + 1}</strong> / ${flash.deck.length}</span><span>${flash.learned} diingat ${icon('check')}</span></div><div class="progress-track" role="progressbar" aria-label="Progres flashcard" aria-valuemin="0" aria-valuemax="${flash.deck.length}" aria-valuenow="${flash.index}"><span style="width:${flash.index / flash.deck.length * 100}%"></span></div><button class="flashcard" data-action="flip" aria-label="${flash.flipped ? 'Lihat sisi depan' : 'Balik kartu untuk melihat jawaban'}"><span class="kanji-level ${k.level.toLowerCase()}">${k.level}</span>${flash.flipped ? `<span class="flash-answer">${escape(k.meaning)}</span><span class="flash-readings"><small>ONYOMI</small><span lang="ja">${escape(k.on.join('・') || '—')}</span></span><span class="flash-readings"><small>KUNYOMI</small><span lang="ja">${escape(k.kun.join('・') || '—')}</span></span>${k.example ? `<span class="flash-example"><span lang="ja">${escape(k.example.word)} · ${escape(k.example.reading)}</span><small>${escape(k.example.meaning)}</small></span>` : `<span class="flash-hint">Contoh kosakata belum tersedia.</span>`}<span class="flash-hint">${icon('repeat')} Klik untuk melihat kanji</span>` : `<span class="flash-symbol" lang="ja">${k.char}</span><span class="flash-hint">${icon('repeat')} Klik kartu untuk melihat jawaban</span>`}</button><div class="flash-actions"><button class="secondary" data-action="flash-no" ${flash.flipped ? '' : 'disabled'}>${icon('repeat')} Masih belajar</button><button class="primary" data-action="flash-yes" ${flash.flipped ? '' : 'disabled'}>${icon('check')} Sudah ingat</button></div><div class="flash-controls"><button class="text-button" data-action="flash-back" ${flash.index === 0 ? 'disabled' : ''}>${icon('back')} Sebelumnya</button><span>Balik kartu dulu, lalu nilai ingatanmu.</span><button class="text-button" data-action="flash-again">${icon('shuffle')} Acak</button></div>`;
}
function answerFlash(known) {
  if (!flash.flipped || !flash.deck[flash.index]) return;
  markKnown(flash.deck[flash.index].char, known);
  flash.reviewed[flash.index] = known;
  flash.learned = flash.reviewed.filter(Boolean).length;
  flash.index++; flash.flipped = false; renderFlashBody();
  document.querySelector('.flashcard, .results button')?.focus({preventScroll:true});
}
function renderQuizSetup() {
  clearInterval(quizTimer); quiz=null;
  root.innerHTML=heading('SEDIKIT TANTANGAN, BANYAK KEMAJUAN','Baca, bedakan, lalu ingat.','Soal mengikuti level latihanmu secara otomatis. Setelah menjawab, pahami arti kata, kalimat, dan pembahasannya.')+quizSetupPanel(icon);
  document.querySelector('#quiz-mode').value=quizPreferences.mode;
  document.querySelector('#quiz-count').value=quizPreferences.countChoice;
  document.querySelector('#quiz-custom-count').value=quizPreferences.customCount;
  document.querySelector('#quiz-time').value=quizPreferences.time;
  updateQuizLevels(quizPreferences.level);
  document.querySelector('#quiz-mode').addEventListener('change',()=>{updateQuizLevels(document.querySelector('#quiz-level').value);quizNote();});
  for(const id of ['quiz-level','quiz-count','quiz-time'])document.getElementById(id).addEventListener('change',quizNote);
  document.querySelector('#quiz-custom-count').addEventListener('input',quizNote);
  quizNote();
  window.scrollTo({top:0,behavior:'instant'});
}
function quizIntro(mode, pool, level) {
  if(mode==='reading' && pool.length){
    const example=pool.find(k=>k.example.word==='午前')||pool[0];
    const sample=createQuiz([example],'reading',1,()=>0.5)[0];
    return `<div><span class="reading-label">LATIHAN PER KATA · ${level==='all' ? 'SEMUA LEVEL' : level}</span><h3>Satu kata,<br> satu bacaan.</h3><p>Bedakan pilihan dengan bunyi mirip, campuran onyomi–kunyomi, dan bacaan kanji yang bentuknya mirip. Setelah menjawab, pelajari bacaan dan arti kata dalam bahasa Indonesia.</p><div class="reading-tags"><span>Bunyi &amp; bentuk mirip</span><span>Campuran on / kun</span><span>Arti setelah menjawab</span></div></div><div class="reading-example"><span>CONTOH · PILIH BACAANNYA</span><strong lang="ja">${quizPromptMarkup(sample,mode,escape)}</strong><div class="reading-example-options" lang="ja">${sample.options.map(a=>`<span>${escape(a)}</span>`).join('')}</div></div>`;
  }
  if(!practiceBanks[mode] || !pool.length)return '';
  const isWriting=mode!=='jlpt-reading';
  const sample=mode==='jlpt-reading' ? pool.find(q=>q.id==='n5-pdf-1-1') || pool.find(q=>q.id==='n4-pdf-2-3') || pool.find(q=>q.word==='先週') || pool.find(q=>readingOptions(q,()=>0.5).readingAlternatives.length) || pool[0] : pool[0];
  const isEnglish=mode==='english-katakana';
  const title=mode==='hiragana-kanji' ? 'Teliti bentuknya.<br> Kenali kanjinya.' : isEnglish ? 'Dari kata Inggris,<br> kenali katakananya.' : 'Baca kalimatnya.<br> Kenali bacaannya.';
  const description=isEnglish ? 'Baca kata Inggris, lalu pilih kosakata katakana yang sesuai maknanya. Perhatikan bentuk huruf, tanda panjang, dan kana kecil. Arti dan contoh kalimat muncul setelah menjawab.' : isWriting ? 'Baca bagian bergaris bawah, lalu pilih penulisan yang tepat. Arti kata dan kalimat akan muncul setelah kamu menjawab.' : 'Kalimat boleh memuat beberapa kanji. Pilih bacaan hiragana hanya untuk bagian bergaris bawah. Setelah menjawab, pelajari arti kata, terjemahan kalimat, dan bacaan kanjinya.';
  const options=isWriting ? [sample.answer,...sample.distractors] : readingOptions(sample,()=>0.5).options;
  const example=mode==='jlpt-reading' ? `<p class="reading-example-sentence" lang="ja">${quizPromptMarkup(sample,mode,escape)}</p>` : `<strong lang="${isEnglish ? 'en' : 'ja'}" class="${isEnglish ? 'english-cue' : ''}">${escape(sample.prompt)}</strong>${sample.sentence && !isEnglish ? `<p class="quiz-example-context" lang="ja">${escape(sample.sentence.replace('{target}',sample.prompt))}</p>` : ''}`;
  return `<div><span class="reading-label">${pool.length} SOAL TERSEDIA · ${level==='all' ? 'SEMUA LEVEL' : level}</span><h3>${title}</h3><p>${description}</p><div class="reading-tags"><span>${mode==='jlpt-reading' ? 'Kalimat · kata bergaris bawah' : 'Materi otomatis'}</span><span>Arti kata & kalimat</span></div></div><div class="reading-example ${isWriting ? 'writing-example' : ''}"><span>CONTOH ${sample.level} · ${isWriting ? 'PILIH TULISANNYA' : 'PILIH BACAAN KATA BERGARIS BAWAH'}</span>${example}<div class="reading-example-options" lang="ja">${options.map(a=>`<span>${escape(a)}</span>`).join('')}</div></div>`;
}
function updateQuizLevels(selected) {
  const mode=document.querySelector('#quiz-mode').value;
  const all=getQuizPool(mode);
  document.querySelector('#quiz-level').innerHTML=`<option value="all">Semua level · ${all.length} soal</option>${levels.map(l=>{const count=getQuizPool(mode,l).length;return `<option value="${l}" ${count ? '' : 'disabled'}>${l} · ${count} soal</option>`;}).join('')}`;
  document.querySelector('#quiz-level').value=selected==='all' || (levels.includes(selected) && getQuizPool(mode,selected).length) ? selected : 'all';
}
function quizNote() {
  const level=document.querySelector('#quiz-level').value;
  const mode=document.querySelector('#quiz-mode').value;
  const countChoice=document.querySelector('#quiz-count').value;
  const customCount=document.querySelector('#quiz-custom-count').value;
  const count=requestedQuizCount(countChoice,customCount);
  const time=Number(document.querySelector('#quiz-time').value);
  const pool=getQuizPool(mode,level);
  quizPreferences={level,mode,count,countChoice,customCount,time};
  const invalid=count===null;
  document.querySelector('#quiz-custom-field').hidden=countChoice!=='custom';
  document.querySelector('#quiz-count-error').hidden=!invalid;
  document.querySelector('#quiz-custom-count').setAttribute('aria-invalid',String(invalid));
  const readingScope=level==='N5' ? 'N5 memakai kosakata dasar N5 / Minna no Nihongo I (bab 1–25).' : level==='N4' ? 'N4 memakai kosakata hingga N4 / Minna no Nihongo I–II (bab 1–50), termasuk materi dasar sebelumnya.' : 'Materi otomatis mengikuti level latihan; N5–N4 dilengkapi adaptasi soal PDF.';
  document.querySelector('#quiz-level-note').textContent=mode==='jlpt-reading' ? `Hanya bagian bergaris bawah yang ditanyakan. ${readingScope} Arti kata dan kalimat tampil setelah menjawab.` : mode==='reading' ? 'Soal berupa satu kata atau kanji, tanpa kalimat. Arti Indonesia muncul setelah menjawab. Level mengikuti kanji tersulit dalam kata di katalog.' : mode==='english-katakana' ? 'Level mengikuti sumber kosakata dan pengelompokan latihan tambahan. Pilih padanan katakana yang digunakan dalam bahasa Jepang; bunyinya bisa berbeda dari bahasa Inggris.' : 'Materi otomatis mengikuti level kanji di katalog. Untuk kata gabungan, levelnya mengikuti kanji tersulit dalam kata tersebut.';
  document.querySelector('#quiz-intro').hidden=!practiceBanks[mode] && mode!=='reading';
  document.querySelector('#quiz-intro').innerHTML=quizIntro(mode,pool,level);
  if(mode==='jlpt-reading'){
    const history=readingHistorySummary(pool,readingHistory);
    document.querySelector('#quiz-intro').insertAdjacentHTML('beforeend',`<div class="reading-composition" aria-label="Cakupan kosakata"><h4>Cakupan latihan ${level==='all' ? 'semua level' : level}</h4><div>${readingComposition(pool).filter(c=>c.count).map(c=>`<span>${c.label}<strong>${c.count} soal</strong></span>`).join('')}</div><p>Jenis kata diseimbangkan di antara soal yang belum tampil. Hitungan dan tanggal maksimal 20% selama kosakata pada putaran ini masih mencukupi.</p></div><div class="reading-rotation" role="status"><strong>${history.unseen ? `${history.unseen} dari ${history.total} soal belum pernah tampil` : `Putaran ${history.round} · ${history.remaining} soal tersisa`}</strong><p>Riwayat tampil tersimpan di browser ini sejak pembaruan ini. Soal baru diulang setelah seluruh soal pada level pilihan mendapat giliran. Soal yang belum sempat dibuka tidak dihitung.</p></div>`);
  }
  document.querySelector('#quiz-note').textContent=invalid ? 'Isi jumlah soal custom untuk memulai latihan.' : `${Math.min(count,pool.length)} soal acak dari ${pool.length} soal tersedia. ${count>pool.length ? `Permintaan ${count} soal disesuaikan dengan jumlah yang tersedia, tanpa mengulang soal.` : 'Arti ditampilkan setelah setiap jawaban.'}`;
  document.querySelector('[data-action="quiz-start"]').disabled=invalid || !pool.length;
}
function startQuiz() {
  quizNote();
  const {level,mode,count,time}=quizPreferences;
  if(count===null)return;
  const pool=getQuizPool(mode,level);
  const questions=mode==='jlpt-reading' ? createReadingQuiz(pool,count,Math.random,readingHistory) : practiceBanks[mode] ? createWritingQuiz(pool,count) : createQuiz(pool,mode,count);
  if(!questions.length){toast('Belum ada soal untuk pilihan ini. Coba level lain.');return;}
  quiz={level,mode,time,index:0,answers:[],questions,answered:false};
  activity();renderQuestion();
}

function renderQuestion() {
  clearInterval(quizTimer);
  const q = quiz.questions[quiz.index]; quiz.answered = false;
  if (quiz.mode==='jlpt-reading') rememberReadingQuestion(q);
  const isEnglish = quiz.mode==='english-katakana';
  const isWriting = ['hiragana-kanji','english-katakana'].includes(quiz.mode);
  const hasSentence = usesSentence(q,quiz.mode);
  const questionTitle = practiceBanks[quiz.mode] || quiz.mode==='reading' ? modeNames[quiz.mode] : 'Kuis Kanji';
  const caption = isEnglish ? 'Pilih penulisan katakana yang sesuai dengan kata Inggris berikut.' : isWriting ? `Pilih penulisan ${quiz.mode === 'hiragana-kanji' ? 'kanji' : 'katakana'} untuk bagian bergaris bawah.` : hasSentence ? 'Baca kalimatnya, lalu pilih bacaan kata yang digarisbawahi.' : quiz.mode === 'meaning' ? 'Apa arti kanji ini?' : quiz.mode === 'kanji' ? 'Kanji mana yang sesuai dengan arti ini?' : 'Pilih bacaan hiragana untuk kata ini. Artinya muncul setelah menjawab.';
  const prompt = quizPromptMarkup(q,quiz.mode,escape);
  const category=quiz.mode==='jlpt-reading' ? `<span class="reading-category">${escape(READING_CATEGORIES[q.readingCategory] || 'Kosakata')} · ${q.level}</span>` : '';
  root.innerHTML = `<div class="study-panel">${heading('WAKTUNYA MELATIH INGATAN', questionTitle, `${modeNames[quiz.mode]} · ${quiz.level === 'all' ? 'Semua level' : quiz.level}`)}<div class="study-top"><span>Soal <strong>${quiz.index + 1}</strong> / ${quiz.questions.length}</span>${quiz.time ? `<span class="timer">${icon('clock')}<span id="timer-value" role="timer">${quiz.time} dtk</span></span>` : '<span>Pelan-pelan juga boleh.</span>'}</div><div class="progress-track" role="progressbar" aria-label="Progres kuis" aria-valuemin="0" aria-valuemax="${quiz.questions.length}" aria-valuenow="${quiz.index}"><span style="width:${quiz.index / quiz.questions.length * 100}%"></span></div><div class="quiz-question ${quiz.mode==='meaning' ? 'kanji-meaning-question' : ''} ${practiceBanks[quiz.mode] || quiz.mode==='reading' ? 'reading-question' : ''} ${hasSentence ? `writing-question ${quiz.mode}` : ''}">${category}<span class="quiz-caption">${caption}</span><div tabindex="-1" class="quiz-prompt ${quiz.mode === 'kanji' ? 'meaning-prompt' : ''} ${isEnglish ? 'english-cue' : ''} ${hasSentence ? 'sentence-prompt' : ''}" ${isEnglish ? 'lang="en"' : quiz.mode !== 'kanji' ? 'lang="ja"' : ''}>${prompt}</div><div class="quiz-options ${(practiceBanks[quiz.mode] || quiz.mode==='reading') && q.options.some(a => a.length > (isEnglish ? 5 : 6)) ? 'long-readings' : ''}">${q.options.map((answer,i) => `<button class="quiz-option ${quiz.mode==='meaning' ? 'reveal-option' : ''}" data-answer="${i}"><span>${'ABCD'[i]}</span>${quiz.mode==='meaning' ? `<span class="quiz-choice-content"><span class="quiz-choice-label" lang="id">${escape(answer)}</span></span>` : `<span lang="ja">${escape(answer)}</span>`}</button>`).join('')}</div><div id="quiz-feedback" class="quiz-feedback" role="status">Pilih satu jawaban yang paling tepat.</div></div><div class="quiz-next"><button class="text-button" data-action="quiz-exit">Akhiri latihan</button><button class="primary" data-action="quiz-next" disabled>${quiz.index === quiz.questions.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'} ${icon('arrow')}</button></div></div>`;
  window.scrollTo({top:0, behavior:'instant'});
  document.querySelector('.quiz-prompt').focus({preventScroll:true});
  if (quiz.time) {
    quiz.deadline = Date.now() + quiz.time * 1000;
    quizTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((quiz.deadline - Date.now()) / 1000));
      const el = document.querySelector('#timer-value'); if (el) el.textContent = `${remaining} dtk`;
      if (remaining === 0) answerQuiz(null);
    }, 250);
  }
}
function answerQuiz(index) {
  if (!quiz || quiz.answered) return;
  if (index !== null && quiz.time && Date.now() >= quiz.deadline) index = null;
  quiz.answered = true; clearInterval(quizTimer);
  const q = quiz.questions[quiz.index]; const chosen = index === null ? null : q.options[index];
  quiz.answers.push({ chosen, correct:chosen === q.answer });
  if (quiz.mode==='meaning') document.querySelector('.quiz-prompt').insertAdjacentHTML('afterend',kanjiReadingsMarkup(q.kanji,escape));
  document.querySelectorAll('[data-answer]').forEach(b => {
    b.disabled = true;
    const answer = q.options[Number(b.dataset.answer)];
    if (answer === q.answer) b.classList.add('correct');
    else if (answer === chosen) b.classList.add('wrong');
    if (quiz.mode==='meaning') {
      b.querySelector('.quiz-choice-content').insertAdjacentHTML('beforeend',kanjiChoiceDetailsMarkup(q.optionDetails[Number(b.dataset.answer)],escape)+choiceResultMarkup(answer===q.answer,answer===chosen));
    }
  });
  const feedback = document.querySelector('#quiz-feedback');
  feedback.className = `quiz-feedback ${chosen === q.answer ? 'success' : 'error'}`;
  const message=chosen===q.answer ? 'Tepat! Satu langkah lebih paham.' : chosen===null ? 'Waktunya habis. Yuk, pahami jawabannya.' : 'Belum tepat, tidak apa-apa. Yuk, pahami jawabannya.';
  feedback.innerHTML=`<p class="answer-status">${escape(message)}</p>${quiz.mode==='meaning' ? '' : answerDetailsMarkup(q,quiz.mode,escape)}`;
  feedback.insertAdjacentHTML('afterend',questionTopicLinks(q,escape));
  document.querySelector('[data-action="quiz-next"]').disabled = false;
  if(quiz.mode!=='meaning')feedback.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function finishQuiz() {
  clearInterval(quizTimer);
  const correct=quiz.answers.filter(a=>a.correct).length;
  const total=quiz.questions.length;
  progress.history.push({date:new Date().toISOString(),correct,total,mode:quiz.mode,level:quiz.level});
  progress.history=progress.history.slice(-50);activity();
  const review=quiz.questions.map((q,i)=>`<div class="review-item ${quiz.answers[i].correct ? '' : 'incorrect'}"><span class="review-char" lang="ja">${escape(q.kanji?.char || q.level)}</span><div><small>${quiz.answers[i].correct ? 'Jawabanmu benar' : `Jawabanmu: ${escape(quiz.answers[i].chosen || 'Waktu habis')}`}</small>${answerDetailsMarkup(q,quiz.mode,escape)}${questionTopicLinks(q,escape)}</div>${icon(quiz.answers[i].correct ? 'check' : 'close')}</div>`).join('');
  root.innerHTML=`<div class="study-panel"><div class="results"><div class="section-kicker">SATU SESI SELESAI</div><div class="result-circle">${Math.round(correct/total*100)}%<small>JAWABAN BENAR</small></div><h1>${correct===total ? 'Luar biasa, semuanya tepat!' : 'Setiap latihan membuatmu lebih dekat.'}</h1><p>${correct} dari ${total} jawaban benar. Tinjau arti dan pembahasan di bawah untuk menguatkan ingatanmu.</p><div class="result-buttons"><button class="primary" data-action="quiz-again">${icon('repeat')} Latihan lagi</button><a href="#progres" class="secondary">Lihat progres ${icon('arrow')}</a></div><div class="review-list"><h3 style="margin-top:24px;font-size:16px">Lihat kembali jawabanmu</h3>${review}</div></div></div>`;
  quiz=null;
  window.scrollTo({top:0,behavior:'instant'});
}

function renderProgress() {
  root.innerHTML = heading('PERJALANANMU, LANGKAH DEMI LANGKAH', 'Lihat seberapa jauh kamu melangkah.', 'Tidak harus sempurna. Kembali belajar hari ini saja sudah sebuah kemajuan.') + stats() + `<div class="progress-layout"><section class="panel"><h2>Kanji yang kamu kuasai</h2>${levels.map(l => {
    const total = KANJI.filter(k => k.level === l).length;
    const known = KANJI.filter(k => k.level === l && progress.known.includes(k.char)).length;
    return `<div class="level-progress"><div><span>${l} · ${levelNames[l]}</span><small>${known} / ${total} kanji</small></div><div class="progress-track" role="progressbar" aria-label="Kanji ${l} dikuasai" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${known}"><span style="width:${known / total * 100}%"></span></div></div>`;
  }).join('')}<a class="text-button" href="#flashcard">Lanjutkan dengan flashcard ${icon('arrow')}</a></section><section class="panel"><h2>Catatan latihan kuis</h2>${progress.history.length ? [...progress.history].reverse().slice(0,5).map(h => `<div class="history-item"><div>${h.mode==='henkan'&&h.wordType==='noun'?'Henkan · Predikat kata benda':h.mode==='henkan'&&h.wordType==='adjective'?'Henkan · Perubahan kata sifat':modeNames[h.mode]}<small>${new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(new Date(h.date))} · ${h.total} soal${h.mode==='henkan'?` · ${h.answerMode==='typing'?'Ketik sendiri':'Pilihan ganda'}`:''}${h.mode.startsWith('kotoba-') && h.course==='n3' ? ' · JLPT N3' : (h.mode.startsWith('kotoba-') || ['bunpou','bunpou-order'].includes(h.mode)) && h.chapters?.length ? ` · ${chapterLabel(h.chapters)}` : ''}</small></div><span class="history-score">${h.correct}/${h.total} benar</span></div>`).join('') : `<div class="empty"><h3>Halaman baru untuk ceritamu.</h3><p>Hasil kuis pertamamu akan muncul di sini.</p><a class="text-button" href="#kuis">Mulai kuis ${icon('arrow')}</a></div>`}</section></div><div class="daily"><span lang="ja">歩</span><div><h3>Belajar hari ini, tumbuh setiap hari.</h3><p>${progress.days.includes(localDay()) ? 'Kamu sudah belajar hari ini. Pertahankan langkah kecilmu!' : 'Satu kanji baru hari ini bisa jadi awal kebiasaan baik.'}</p></div><a class="secondary" href="#flashcard">Lanjut belajar ${icon('arrow')}</a></div><p class="storage-note">${icon('lock')}${storageAvailable ? 'Progres tersimpan di browser dan perangkat ini. Menghapus data browser akan menghapus progres.' : 'Penyimpanan browser tidak tersedia. Progres hanya tersimpan selama sesi ini.'}</p>`;
}
function route() {
  const [next, groupId] = location.hash.slice(1).split('/');
  view = viewNames[next] ? next : 'beranda';
  modal.close();
  kotobaView.dispose();
  henkanView.dispose();
  bunpouView.dispose();
  materiView.dispose();
  dokkaiView.dispose();
  particleView.dispose();
  transitivityView.dispose();
  clearInterval(quizTimer); quiz = null;
  document.querySelectorAll('[data-nav]').forEach(a => { a.classList.toggle('active', a.dataset.nav === view); a.toggleAttribute('aria-current', a.dataset.nav === view); if (a.dataset.nav === view) a.setAttribute('aria-current','page'); });
  document.querySelector('#breadcrumb-current').textContent = viewNames[view];
  document.title = `${viewNames[view]} — Nihongo Benkyo`;
  if (view === 'beranda' || view === 'kanji') renderLibrary(view === 'beranda');
  else if (view === 'materi') materiView.render(groupId);
  else if (view === 'dokkai') dokkaiView.render();
  else if (view === 'mirip') similarView.render(groupId);
  else if (view === 'flashcard') renderFlash();
  else if (view === 'kotoba') kotobaView.render(groupId || undefined);
  else if (view === 'henkan') henkanView.render();
  else if (view === 'partikel') particleView.render();
  else if (view === 'jidoushi') transitivityView.render();
  else if (view === 'bunpou') bunpouView.render(groupId==='susun'?'order':undefined);
  else if (view === 'kuis') {
    if (groupId === 'jlpt') quizPreferences.mode = 'jlpt-reading';
    else if (groupId === 'hiragana-katakana') quizPreferences.mode = 'english-katakana';
    else if (Object.hasOwn(modeNames, groupId) && !groupId.startsWith('kotoba-') && !['henkan','particle','transitivity-word','transitivity-type','dokkai'].includes(groupId) && !groupId.startsWith('bunpou')) quizPreferences.mode=groupId;
    renderQuizSetup();
  }
  else renderProgress();
  window.scrollTo({top:0, behavior:'instant'});
}
document.addEventListener('click', e => {
  // A related link may target the comparison already open behind the dialog.
  const sameComparison = e.target.closest('a[href^="#mirip/"]');
  if (sameComparison && sameComparison.getAttribute('href') === location.hash) {
    e.preventDefault(); route(); return;
  }
  if (e.target.closest('.skip-link')) {
    e.preventDefault(); document.querySelector('#main').focus();
    document.querySelector('#main').scrollIntoView(); return;
  }
  const target = e.target.closest('button'); if (!target || target.disabled) return;
  if (target.dataset.detail) return detail(target.dataset.detail);
  if (target.dataset.save) return toggleSaved(target.dataset.save);
  if (target.dataset.known) {
    const char = target.dataset.known; markKnown(char, !progress.known.includes(char)); detail(char, false);
    if (view === 'beranda' || view === 'kanji') renderLibrary(view === 'beranda');
    return;
  }
  if (target.dataset.level) {
    filters.level = target.dataset.level; currentPage = 1;
    document.querySelectorAll('[data-level]').forEach(b => { b.classList.toggle('active', b.dataset.level === filters.level); b.setAttribute('aria-pressed', b.dataset.level === filters.level); });
    renderGrid(); return;
  }
  if (target.dataset.answer !== undefined) return answerQuiz(Number(target.dataset.answer));
  const action = target.dataset.action;
  if (action === 'close') modal.close();
  if (action === 'page-next' || action === 'page-prev') {
    currentPage += action === 'page-next' ? 1 : -1; renderGrid();
    document.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});
    document.querySelector('#kanji-grid').scrollIntoView({block:'start'});
  }
  if (action === 'reset-filters') { filters = {level:'all',query:'',collection:'all'}; currentPage = 1; renderLibrary(view === 'beranda'); }
  if (action === 'flip') { flash.flipped = !flash.flipped; activity(); renderFlashBody(); document.querySelector('.flashcard')?.focus({preventScroll:true}); }
  if (action === 'flash-yes') answerFlash(true);
  if (action === 'flash-no') answerFlash(false);
  if (action === 'flash-again') { newDeck(); renderFlashBody(); }
  if (action === 'flash-back' && flash.index > 0) { flash.index--; flash.flipped = false; renderFlashBody(); }
  if (action === 'quiz-start') startQuiz();
  if (action === 'quiz-next' && quiz?.answered) { quiz.index++; if (quiz.index >= quiz.questions.length) finishQuiz(); else renderQuestion(); }
  if (action === 'quiz-again') renderQuizSetup();
  if (action === 'quiz-exit') openModal(`<div class="prose"><h2 id="modal-title">Akhiri latihan ini?</h2><p>Skor sesi yang belum selesai tidak akan masuk ke riwayat kuis. ${quiz?.mode==='jlpt-reading' ? 'Soal yang sudah tampil tetap diingat untuk sesi berikutnya.' : 'Kamu bisa memulai sesi baru kapan saja.'}</p><div class="modal-actions"><button class="secondary" data-action="close">Lanjutkan kuis</button><button class="primary" data-action="quiz-confirm-exit">Akhiri latihan</button></div></div>`);
  if (action === 'quiz-confirm-exit') { modal.close(); renderQuizSetup(); }
  if (action === 'guide') openModal(`<div class="prose"><div class="section-kicker">BELAJAR DENGAN RITMEMU</div><h2 id="modal-title">Mulai dari satu kanji.</h2><ol><li><strong>Kenali.</strong> Buka Jelajahi Kanji, mulai dari level N5. Klik kartu untuk melihat arti, bacaan, dan contoh kata.</li><li><strong>Bedakan.</strong> Buka Kanji Mirip untuk membandingkan bentuk, melihat ciri pembeda, dan berlatih memilih kanji dari petunjuk visual.</li><li><strong>Ingat.</strong> Gunakan flashcard. Balik kartunya, lalu pilih “Sudah ingat” atau “Masih belajar”.</li><li><strong>Latih.</strong> Uji pemahaman lewat kuis arti atau bacaan kata. Mode Bacaan ala JLPT melatihmu membedakan pilihan hiragana yang mirip. Gunakan Hiragana → Kanji dan English → Katakana untuk melatih penulisan dengan pilihan bentuk yang mirip. Buka Kuis Kotoba untuk melatih kosakata Minna no Nihongo per bab dan jenis kata. Tinjau jawabanmu di akhir sesi.</li><li><strong>Ulangi.</strong> Simpan kanji yang ingin dipelajari lagi. Lihat perkembanganmu di Progres Saya.</li></ol><p>Onyomi adalah bacaan yang berasal dari bahasa Tionghoa. Kunyomi adalah bacaan asli Jepang. Bacaan yang digunakan bergantung pada kata, jadi selalu pelajari contoh penggunaannya.</p><button class="primary" data-action="close">Siap belajar ${icon('arrow')}</button></div>`);
  if (action === 'sources') openModal(`<div class="prose"><div class="section-kicker">MATERI YANG KITA PELAJARI</div><h2 id="modal-title">Tentang koleksi kanji</h2><p>Koleksi mencakup seluruh ${KANJI.length.toLocaleString('id-ID')} kanji dalam snapshot OpenJLPT yang digunakan, dari N5 sampai N1. Pembagian level mengikuti daftar komunitas Jonathan Waller dan tambahan joyo dari OpenJLPT, bukan daftar resmi JLPT. Seluruh arti Indonesia dan contoh kata ditinjau ulang secara editorial oleh AI pada 13 Oktober 2026 agar lebih jelas dan sesuai konteks. Arti pada kartu diringkas untuk belajar; arti Inggris tersedia sebagai pembanding. Rincian tinjauan dan rujukan kamus tersedia dalam catatan data.</p><p>Bacaan dan jumlah goresan bersumber dari <a href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project" target="_blank" rel="noopener">KANJIDIC2</a>, hak cipta James William Breen dan Electronic Dictionary Research and Development Group, melalui <a href="https://github.com/evanclan/OpenJLPT" target="_blank" rel="noopener">OpenJLPT</a>. Contoh kata berasal dari JMdict dan daftar Jonathan Waller melalui OpenJLPT serta <a href="https://kanjiapi.dev/" target="_blank" rel="noopener">kanjiapi.dev</a>.</p><p>Data adaptasi dalam koleksi ini tersedia dengan <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. Lihat <a href="https://www.edrdg.org/edrdg/licence.html" target="_blank" rel="noopener">ketentuan sumber</a> dan <a href="./DATA-SOURCES.md" target="_blank" rel="noopener">catatan data</a>.</p><p>Keluarga radikal dan pembahasan bentuk kanji pada kuis menggunakan label komponen dari <a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener">KanjiVG</a> oleh Ulrich Apel dan kontributor. Ekstrak komponen ini memakai <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>. Pengelompokan dan penjelasan Indonesia ditambahkan untuk membantu belajar.</p><p>Materi tersedia langsung di website. Progres dan simpanan disimpan di browser ini, tanpa akun.</p></div>`);
});
modal.addEventListener('click', e => { if (e.target === modal) { const box = modal.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) modal.close(); } });
window.addEventListener('hashchange', route);
window.addEventListener('storage', e => { if (e.key === KEY) { try { progress = cleanProgress(JSON.parse(e.newValue), KANJI); if (view === 'progres') renderProgress(); else if (view === 'beranda' || view === 'kanji') renderLibrary(view === 'beranda'); } catch { /* Keep the current valid session. */ } } });
window.addEventListener('storage', e => {
  if (e.key!==READING_HISTORY_KEY && e.key!==null) return;
  try { readingHistory=cleanReadingHistory(JSON.parse(e.newValue),practiceBanks['jlpt-reading']); }
  catch { return; }
  if(view==='kuis' && !quiz)quizNote();
});
route();
