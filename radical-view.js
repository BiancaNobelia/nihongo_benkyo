import { RADICAL_FAMILIES } from './radical-data.js?v=20261015-bunpou-order';
import { filterRadicalFamilies, filterRadicalKanji, paginateRadicals } from './radical-core.js?v=20261015-bunpou-order';
import { similarityQuizCallout } from './similar-quiz-view.js?v=20261015-bunpou-order';
import { explainedKanjiCard } from './component-note-view.js?v=20261015-bunpou-order';

export function createRadicalView({root, kanji, levels, escape, icon}) {
  const byChar = new Map(kanji.map(k => [k.char,k]));
  let family = null;
  let filters = {query:'',level:'all',form:'all'};
  let page = 1;
  let overviewQuery = '';
  const badge = k => `<span class="similar-level ${k.level.toLowerCase()}">${k.level}</span>`;
  const levelRange = f => {const available=levels.filter(l=>f.members.some(c=>byChar.get(c).level===l));return `${available[0]}–${available.at(-1)}`;};
  const sources = `<p class="similar-footnote">Keluarga ini mengelompokkan bentuk komponen yang terlihat, termasuk bentuk dasarnya. Cakupan tiap kelompok dijelaskan pada halaman detailnya. Nama tema membantu mengingat; kesamaan komponen tidak selalu berarti kesamaan arti, bacaan, atau radikal kamus. Cakupan mengikuti koleksi situs N5–N1. Data komponen: <a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener">KanjiVG</a>, © Ulrich Apel, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>; diolah untuk pengelompokan.</p>`;

  function renderOverview(container) {
    family = null;
    container.innerHTML = `<div class="section-head"><div><h2>Satu bentuk, satu keluarga.</h2><p>Mulai dari komponen yang sama, lalu kenali bagian yang berbeda.</p></div></div><label class="search-wrap radical-overview-search">${icon('search')}<input type="search" id="radical-family-search" aria-label="Cari keluarga radikal" placeholder="Cari air, perjalanan, 洗, michi..." autocomplete="off" value="${escape(overviewQuery)}"></label><div id="radical-families"></div>${sources}`;
    root.querySelector('#radical-family-search').addEventListener('input', e => {overviewQuery=e.target.value;renderFamilyCards();});
    renderFamilyCards();
  }

  function renderFamilyCards() {
    const families = filterRadicalFamilies(RADICAL_FAMILIES,kanji,overviewQuery);
    root.querySelector('#radical-families').innerHTML = `<p class="similar-result-count" role="status">${families.length} keluarga radikal & komponen</p><div class="radical-family-grid">${families.map((f) => `<a class="radical-family-card ${f.id === 'radikal-air' ? 'radical-water' : f.id === 'radikal-perjalanan' ? 'radical-travel' : ''}" href="#mirip/${f.id}" aria-label="Buka keluarga ${escape(f.title)}"><div class="radical-card-heading"><span class="radical-symbol" lang="ja">${f.symbol}</span><div><span class="section-kicker">${escape(f.name)}</span><h3>${escape(f.title)}</h3></div><span class="radical-count">${f.members.length}<small>kanji</small></span></div><p>${escape(f.description)}</p><div class="radical-preview" lang="ja">${[...f.preview].map(char => `<span>${char}</span>`).join('')}</div><div class="radical-card-footer"><span>${levelRange(f)} · bacaan & arti</span><span>Jelajahi ${icon('arrow')}</span></div></a>`).join('')}</div>${!families.length ? `<div class="empty"><h3>Keluarga belum ditemukan.</h3><p>Coba nama komponen, kanji, arti, atau bacaan.</p><button class="secondary" data-radical-action="reset-overview">Tampilkan semua keluarga</button></div>` : ''}`;
  }

  function renderFamily(id) {
    family = RADICAL_FAMILIES.find(f => f.id === id);
    if (!family) return false;
    filters = {query:'',level:'all',form:'all'};page=1;
    document.title = `${family.title} — Kanji Mirip — Nihongo Benkyo`;
    root.innerHTML = `<a class="text-button similar-back" href="#mirip">${icon('back')} Semua keluarga</a><section class="radical-detail-hero"><span class="radical-detail-symbol" lang="ja">${family.symbol}</span><div><div class="section-kicker">${escape(family.name)} · ${family.members.length} KANJI</div><h1>${escape(family.title)}</h1><p>${escape(family.note)}</p></div></section><section class="radical-examples" aria-label="Contoh pembeda"><div class="section-head"><div><h2>Bagian sama. Ciri berbeda.</h2><p>Kenali dulu beberapa contoh yang sering ditemui.</p></div></div><div class="radical-example-grid" style="--example-count:${family.examples.length}">${family.examples.map(e => `<article class="radical-example-card"><div class="radical-example-top"><span lang="ja">${e.char}</span>${badge(byChar.get(e.char))}</div><ruby lang="ja">${escape(e.word)}<rt>${escape(e.reading)}</rt></ruby><p class="radical-example-meaning">${escape(e.meaning)}</p><p>${escape(e.cue)}</p><button class="text-button" data-detail="${e.char}" aria-label="Detail kanji ${e.char}">Bacaan & contoh ${icon('arrow-up')}</button></article>`).join('')}</div></section><aside class="similar-memory"><span class="similar-memory-icon">${icon('leaf')}</span><div><h2>Cara membedakannya</h2><p>${escape(family.tip)}</p></div></aside><section class="radical-catalog" aria-label="Daftar kanji keluarga"><div class="section-head"><div><h2>Jelajahi seluruh keluarga.</h2><p>${family.id === 'bentuk-mon' ? 'Semua anggota dilengkapi arti dan uraian komponen. Gunakan tombol Bacaan & contoh untuk membuka detail.' : 'Diurutkan dari N5 ke N1, lalu jumlah goresan. Pilih kartu untuk membuka detail.'}</p></div></div><div class="radical-filters"><label class="search-wrap">${icon('search')}<input type="search" id="radical-search" aria-label="Cari kanji dalam keluarga" placeholder="Cari kanji, arti, atau bacaan..." autocomplete="off"></label><div class="field"><label for="radical-level">Level kanji</label><select id="radical-level"><option value="all">Semua level</option>${levels.map(l=>`<option value="${l}">${l}</option>`).join('')}</select></div>${family.forms.length > 1 ? `<div class="field"><label for="radical-form">Bentuk komponen</label><select id="radical-form"><option value="all">Semua bentuk</option>${family.forms.map(form=>`<option value="${form}">${form}${form === '氵' ? ' · tiga goresan' : ''}</option>`).join('')}</select></div>` : ''}</div><div id="radical-results"></div></section>${sources}`;
    root.querySelector('.radical-catalog').insertAdjacentHTML('beforebegin',similarityQuizCallout(family.id));
    if (family.id === 'bentuk-mon') root.querySelector('.radical-catalog .section-head').insertAdjacentHTML('afterend','<p class="component-reading-guide">Baca komponen dari bagian luar ke bagian di dalamnya. Uraian ini membantu mengenali bentuk; arti kanji tidak selalu merupakan gabungan arti setiap komponennya.</p>');
    root.querySelector('#radical-search').addEventListener('input',e=>{filters.query=e.target.value;page=1;renderMembers();});
    root.querySelector('#radical-level').addEventListener('change',e=>{filters.level=e.target.value;page=1;renderMembers();});
    root.querySelector('#radical-form')?.addEventListener('change',e=>{filters.form=e.target.value;page=1;renderMembers();});
    renderMembers();return true;
  }

  function renderMembers() {
    const result=paginateRadicals(filterRadicalKanji(family,kanji,filters),page);
    page=result.page;
    root.querySelector('#radical-results').innerHTML = `<p class="similar-result-count" role="status">${result.total ? `Menampilkan ${result.start+1}–${result.start+result.items.length} dari ${result.total} kanji` : 'Tidak ada kanji yang cocok'}</p><div class="${family.id === 'bentuk-mon' ? 'radical-explained-grid' : 'radical-kanji-grid'}">${result.items.map(k=>family.id === 'bentuk-mon' ? explainedKanjiCard(k,escape,icon) : `<button class="radical-kanji-card" data-detail="${k.char}" aria-label="Pelajari ${k.char}, ${escape(k.meaning)}">${badge(k)}<span class="radical-kanji-glyph" lang="ja">${k.char}</span><strong>${escape(k.meaning)}</strong><span class="radical-kanji-reading" lang="ja">${escape(k.on.slice(0,2).join('・') || k.kun[0]?.replaceAll('.','') || '—')}</span><small>${k.strokes} goresan</small></button>`).join('')}</div>${!result.total ? `<div class="empty"><h3>Belum ada yang cocok.</h3><p>Coba kata lain atau tampilkan kembali semua kanji di keluarga ini.</p><button class="secondary" data-radical-action="reset">Hapus filter</button></div>` : ''}${result.pages > 1 ? `<div class="similar-pagination"><button class="secondary" data-radical-action="prev" ${page===1?'disabled':''}>${icon('back')} Sebelumnya</button><span>Halaman ${page} / ${result.pages}</span><button class="secondary" data-radical-action="next" ${page===result.pages?'disabled':''}>Berikutnya ${icon('arrow')}</button></div>` : ''}`;
  }

  root.addEventListener('click', e => {
    const button=e.target.closest('[data-radical-action]');if(!button || button.disabled)return;
    const action=button.dataset.radicalAction;
    if(action==='reset-overview'){overviewQuery='';root.querySelector('#radical-family-search').value='';renderFamilyCards();root.querySelector('#radical-family-search').focus();}
    if(!family)return;
    if(action==='reset'){filters={query:'',level:'all',form:'all'};page=1;root.querySelector('#radical-search').value='';root.querySelector('#radical-level').value='all';const form=root.querySelector('#radical-form');if(form)form.value='all';renderMembers();root.querySelector('#radical-search').focus();}
    if(action==='prev'||action==='next'){page+=action==='next'?1:-1;renderMembers();const button=root.querySelector(`[data-radical-action="${action}"]:not(:disabled)`);(button||root.querySelector('.similar-pagination button:not(:disabled)'))?.focus({preventScroll:true});root.querySelector('#radical-results').scrollIntoView({block:'start'});}
  });
  return {renderOverview,renderFamily};
}
