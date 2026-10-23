import {createStrokePlayer} from './stroke-order-player.js?v=20261021-stroke-order';

export const hasStrokeOrder=card=>['N5','N4'].includes(card.level);

export function strokeOrderMarkup(card) {
  if(!hasStrokeOrder(card))return '';
  return `<section class="stroke-order" aria-label="Cara menulis kanji">
    <div class="stroke-order-heading"><h3>Urutan goresan</h3><span>${card.strokes} goresan · ${card.level}</span></div>
    <div class="stroke-order-body"><p role="status">Menyiapkan cara menulis…</p></div>
  </section>`;
}

let dataPromise;
export function loadStrokeOrders(fetcher=fetch) {
  return dataPromise??=(async()=>{
    const response=await fetcher(new URL('./data/stroke-order.json?v=20261021-stroke-order',import.meta.url),{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('Stroke order unavailable');
    const data=await response.json();
    if(data.version!==1||data.viewBox!=='0 0 109 109'||!data.characters)throw new Error('Invalid stroke order data');
    return data.characters;
  })().catch(error=>{dataPromise=undefined;throw error;});
}

export function mountStrokeOrder(root,card,escape,{load=loadStrokeOrders}={}) {
  const section=root.querySelector('.stroke-order');
  if(!section||!hasStrokeOrder(card))return ()=>{};
  const body=section.querySelector('.stroke-order-body');
  let disposed=false,player=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  async function initialize(){
    body.innerHTML='<p role="status">Menyiapkan cara menulis…</p>';
    try {
      const characters=await load();
      if(disposed)return;
      const paths=characters[card.char];
      if(!Array.isArray(paths)||paths.length!==card.strokes||!paths.every(d=>typeof d==='string'&&/^[MmCcSs0-9.,\s+\-]+$/.test(d)))throw new Error('Incomplete stroke order');
      body.innerHTML=`<div class="stroke-stage"><svg class="stroke-diagram" viewBox="0 0 109 109" role="img" aria-label="Urutan menulis ${escape(card.char)}">
        <path class="stroke-guide" d="M54.5 0V109M0 54.5H109"/>
        <g class="stroke-ghost">${paths.map(d=>`<path d="${escape(d)}"/>`).join('')}</g>
        <g class="stroke-ink">${paths.map(d=>`<path d="${escape(d)}" pathLength="1" hidden/>`).join('')}</g>
        <circle class="stroke-start" r="2" hidden/>
      </svg></div>
      <div class="stroke-instructions">
        <p class="stroke-status" role="status" aria-live="polite"></p>
        <p class="stroke-help">Ikuti goresan ungu dari titik awalnya. Pilih nomor untuk mengulang satu goresan.</p>
        <div class="stroke-controls"><button class="primary" data-stroke-action="play">Putar</button><button class="secondary" data-stroke-action="reset">Ulang dari awal</button></div>
        <div class="stroke-controls"><button class="secondary" data-stroke-action="previous">← Sebelumnya</button><button class="secondary" data-stroke-action="next">Berikutnya →</button></div>
        <div class="stroke-steps" role="group" aria-label="Pilih nomor goresan">${paths.map((_,i)=>`<button data-stroke-number="${i+1}" aria-label="Goresan ${i+1}">${i+1}</button>`).join('')}</div>
      </div>`;
      const ink=[...body.querySelectorAll('.stroke-ink path')],dot=body.querySelector('.stroke-start');
      const status=body.querySelector('.stroke-status'),play=body.querySelector('[data-stroke-action="play"]');
      const numbers=[...body.querySelectorAll('[data-stroke-number]')];
      function render({current,count,playing,animate}){
        ink.forEach((path,i)=>{
          path.toggleAttribute('hidden',i>=current);
          path.classList.toggle('is-current',i===current-1);
          path.getAnimations().forEach(animation=>animation.cancel());
        });
        const active=ink[current-1],start=active.getPointAtLength(0);
        dot.setAttribute('cx',start.x);dot.setAttribute('cy',start.y);dot.removeAttribute('hidden');
        if(animate&&!reducedMotion)active.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:800,easing:'linear'});
        status.textContent=`Goresan ${current} dari ${count}${!playing&&current===count?' · Selesai':''}`;
        play.textContent=playing?'Jeda':current===count?'Putar ulang':'Putar';
        body.querySelector('[data-stroke-action="previous"]').disabled=current===1;
        body.querySelector('[data-stroke-action="next"]').disabled=current===count;
        numbers.forEach((button,i)=>{if(i===current-1)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
      }
      player=createStrokePlayer(paths.length,{onChange:render});
      render({...player.snapshot(),animate:false});
    }catch {
      if(!disposed)body.innerHTML='<p role="status">Urutan goresan belum bisa dimuat. Coba lagi saat koneksi tersedia.</p><button class="secondary" data-stroke-action="retry">Coba lagi</button>';
    }
  }
  function click(event){
    const button=event.target.closest('button');
    if(!button||!section.contains(button))return;
    if(button.dataset.strokeAction==='retry'){initialize();return;}
    if(!player)return;
    if(button.dataset.strokeNumber){player.select(Number(button.dataset.strokeNumber));return;}
    const {current,playing}=player.snapshot();
    switch(button.dataset.strokeAction){
      case 'play':playing?player.pause():player.play();break;
      case 'previous':player.select(current-1);break;
      case 'next':player.select(current+1);break;
      case 'reset':player.reset();break;
    }
  }
  section.addEventListener('click',click);initialize();
  return ()=>{disposed=true;player?.dispose();section.removeEventListener('click',click);body.getAnimations({subtree:true}).forEach(animation=>animation.cancel());};
}
