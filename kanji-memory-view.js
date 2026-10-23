import {memoryFor} from './kanji-memory.js?v=20261024-memory';

const DATA_URL = new URL('./data/kanji-origins.json?v=20261024-memory',import.meta.url);

// Shared by detail dialogs and credits. Failed downloads can be retried.
export function createOriginLoader(fetcher) {
  let pending;
  return () => pending ??= Promise.resolve().then(()=>fetcher(DATA_URL,{signal:AbortSignal.timeout(20000)}))
    .then(response=>{if(!response.ok)throw new Error('Origins unavailable');return response.json();})
    .then(data=>{if(data.version!==1 || !data.entries || typeof data.entries!=='object')throw new Error('Invalid origins');return data.entries;})
    .catch(error=>{pending=undefined;throw error;});
}
export const loadKanjiOrigins=createOriginLoader((...args)=>fetch(...args));

export function memoryMarkup(card,escape) {
  const memory=memoryFor(card);
  const e=memory.example;
  return `<section class="kanji-memory" aria-label="Cara mengingat ${escape(card.char)}">
    <header><span class="memory-icon" aria-hidden="true">✦</span><div><h3>Cara mudah mengingat</h3><span class="memory-method">${escape(memory.method)}</span></div></header>
    <p class="memory-story">${escape(memory.text)}</p>
    ${e?`<div class="memory-word"><span>Pengait kata</span><strong lang="ja">${escape(e.word)} <small>(${escape(e.reading)})</small></strong><span>${escape(e.meaning)}</span></div>`:''}
    <p class="memory-note">Trik belajar untuk bentuk sekarang, bukan asal-usul historis.</p>
    <details class="kanji-origin" data-kanji-origin><summary><span>Asal-usul kanji <span lang="ja">${escape(card.char)}</span></span><span class="origin-toggle" aria-hidden="true">+</span></summary><div class="origin-body" data-origin-body><p role="status">Memuat penjelasan asal-usul…</p></div></details>
  </section>`;
}

export function originMarkup(entry,escape) {
  const name=entry.source==='kanjipedia'?'Kanjipedia · penjelasan kamus':'Chinese Lexicon · penjelasan bentuk';
  return `<span class="origin-label">${escape(name)}${entry.uncertain?' · belum pasti':''}</span><p>${escape(entry.text)}</p><p class="origin-note">Asal bentuk ditelusuri dari aksara lama. Petunjuk bunyi tidak selalu sama dengan bacaan Jepang sekarang; tafsir sejarah dapat berbeda antarrujukan.</p>`;
}

export function mountKanjiMemory(root,card,escape,{load=loadKanjiOrigins}={}) {
  const details=root.querySelector('[data-kanji-origin]');
  if(!details)return ()=>{};
  const body=details.querySelector('[data-origin-body]');
  let active=true,ready=false,loading=false;
  async function render() {
    if(ready||loading)return;
    loading=true;
    body.innerHTML='<p role="status">Memuat penjelasan asal-usul…</p>';
    try {
      const records=await load();
      if(!active)return;
      if(!records[card.char]?.text)throw new Error('Missing origin');
      body.innerHTML=originMarkup(records[card.char],escape);
      ready=true;
    } catch {
      if(active)body.innerHTML='<p role="status">Asal-usul belum berhasil dimuat.</p><button class="text-button" type="button" data-origin-retry>Coba lagi</button>';
    } finally {loading=false;}
  }
  const toggle=()=>{if(details.open)render();};
  const retry=event=>{if(event.target.closest('[data-origin-retry]'))render();};
  details.addEventListener('toggle',toggle);
  details.addEventListener('click',retry);
  if(details.open)render();
  return ()=>{active=false;details.removeEventListener('toggle',toggle);details.removeEventListener('click',retry);};
}

export function originCreditMarkup(card,entry,escape) {
  const name=entry.source==='kanjipedia'?'Kanjipedia · 角川新字源 改訂新版 (KADOKAWA)':'Peter Olson · Chinese Lexicon (revisi sumber tersimpan)';
  return `<h2>Sumber asal-usul · <span lang="ja">${escape(card.char)}</span></h2><p><a href="${escape(entry.url)}" target="_blank" rel="noopener noreferrer">${escape(name)}</a>${entry.sourceChar!==card.char?` · rujukan bentuk <span lang="ja">${escape(entry.sourceChar)}</span>`:''}</p><p>Ringkasan Indonesia disunting untuk Nihongo Benkyo. Cerita pengingat merupakan alat belajar, bukan kutipan sumber sejarah.</p>`;
}
