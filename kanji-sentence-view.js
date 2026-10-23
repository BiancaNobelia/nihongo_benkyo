const DATA_URL = new URL('./data/kanji-sentences.json?v=20261023-full-kanji',import.meta.url);
let pending;

export function loadKanjiSentences(fetcher=fetch) {
  pending ??= Promise.resolve().then(()=>fetcher(DATA_URL,{signal:AbortSignal.timeout(20000)})).then(response=>{
    if(!response.ok)throw new Error('Sentence data could not be loaded.');
    return response.json();
  }).then(data=>{
    if(data.version!==1 || !data.entries)throw new Error('Invalid sentence data.');
    return data.entries;
  }).catch(error=>{pending=undefined;throw error;});
  return pending;
}

export function exampleSentenceMarkup(record,escape) {
  const {text,furigana,translation,targetStart,targetLength}=record;
  const end=targetStart+targetLength;
  const highlight=(html,start,stop)=>start>=targetStart && stop<=end ? `<mark class="example-sentence-target">${html}</mark>` : html;
  const plain=(part,start)=>{
    let position=start;
    return [...part].map(char=>{
      const html=highlight(escape(char),position,position+char.length);
      position+=char.length;return html;
    }).join('');
  };
  let cursor=0,html='';
  for(const [start,word,reading] of furigana) {
    html+=plain(text.slice(cursor,start),cursor);
    html+=highlight(`<ruby>${escape(word)}<rp>（</rp><rt>${escape(reading)}</rt><rp>）</rp></ruby>`,start,start+word.length);
    cursor=start+word.length;
  }
  html+=plain(text.slice(cursor),cursor);
  return `<span class="example-sentence-label">CONTOH KALIMAT</span><p class="example-sentence-text" lang="ja">${html}</p><p class="example-sentence-translation">${escape(translation)}</p>`;
}

export function mountKanjiSentences(root,escape,{load=loadKanjiSentences}={}) {
  const section=root.querySelector('.kanji-examples');
  if(!section)return ()=>{};
  const status=section.querySelector('[data-example-sentences-status]');
  if(!status)return ()=>{};
  let active=true;
  async function render() {
    status.hidden=false;
    status.textContent='Menyiapkan contoh kalimat…';
    try {
      const records=await load();
      if(!active)return;
      const targets=[...section.querySelectorAll('[data-example-sentence-key]')];
      if(targets.some(el=>!records[el.dataset.exampleSentenceKey]))throw new Error('Missing sentence record.');
      for(const el of targets)el.innerHTML=exampleSentenceMarkup(records[el.dataset.exampleSentenceKey],escape);
      status.hidden=true;
    } catch {
      if(active)status.innerHTML='Contoh kalimat belum berhasil dimuat. <button type="button" class="text-button" data-retry-example-sentences>Coba lagi</button>';
    }
  }
  const retry=event=>{if(event.target.closest('[data-retry-example-sentences]'))render();};
  section.addEventListener('click',retry);
  render();
  return ()=>{active=false;section.removeEventListener('click',retry);};
}
