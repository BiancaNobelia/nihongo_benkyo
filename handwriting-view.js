import {createStrokeInput} from './handwriting-input.js?v=20261020-handwriting';

export function handwritingMarkup(icon,count) {
  return `<details class="handwriting-search" id="handwriting-search">
    <summary><span class="handwriting-icon">${icon('edit')}</span><span><strong>Cari dengan tulisan tangan</strong><small>Belum tahu bacaannya? Gambar kanjinya dengan mouse atau jari.</small></span><span class="handwriting-expand" aria-hidden="true">+</span></summary>
    <div class="handwriting-body">
      <div class="handwriting-drawing"><div class="handwriting-pad"><canvas width="512" height="512" id="handwriting-canvas" aria-label="Area menulis satu kanji dengan mouse, jari, atau stylus" aria-describedby="handwriting-help">Gunakan pencarian teks di bawah untuk mencari kanji, bacaan, atau arti.</canvas><span class="handwriting-placeholder" aria-hidden="true"><b lang="ja">書</b>Tulis satu kanji di sini</span></div>
        <div class="handwriting-tools"><span id="handwriting-count">0 goresan</span><button type="button" class="secondary" data-handwriting="undo" disabled aria-label="Hapus goresan terakhir">${icon('back')} Urungkan</button><button type="button" class="secondary" data-handwriting="clear" disabled>Bersihkan</button></div>
        <p id="handwriting-help">Gambar satu kanji sampai selesai. Urutan goresan boleh berbeda; goresan yang terputus tetap dicocokkan dari bentuknya.</p>
      </div>
      <div class="handwriting-results"><div class="handwriting-results-heading"><div><span class="section-kicker">TEMUKAN KARAKTERNYA</span><h3>Kandidat kanji</h3></div><span class="handwriting-local">${icon('lock')} Di perangkatmu</span></div><p class="handwriting-scope">Mencari di semua ${count.toLocaleString('id-ID')} kanji N5–N1. Klik kandidat untuk melihat arti dan bacaannya.</p>
        <p id="handwriting-status" role="status" aria-live="polite">Mulai menggambar untuk melihat kandidat.</p><div id="handwriting-candidates" class="handwriting-candidates" aria-label="Kandidat hasil tulisan tangan"></div>
        <button type="button" class="secondary handwriting-retry" data-handwriting="retry" hidden>Coba muat lagi</button>
        <p class="handwriting-tip">Belum menemukan yang cocok? Lengkapi bentuknya atau urungkan goresan yang kurang pas.</p>
        <small class="handwriting-source">Pola tulisan: <a href="https://github.com/asdfjkl/kanjicanvas" target="_blank" rel="noopener">Kanji Canvas</a> · Dominik Klein & kontributor · <a href="./data/licenses/KanjiCanvas-LICENSE.txt" target="_blank" rel="noopener">MIT</a><br>Bentuk goresan: <a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener">KanjiVG</a> · Ulrich Apel & kontributor · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a></small>
      </div>
    </div>
  </details>`;
}

export function mountHandwriting(root,kanji,escape) {
  const panel=root.querySelector('#handwriting-search');
  if(!panel)return ()=>{};
  const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d');
  const status=panel.querySelector('#handwriting-status'),candidates=panel.querySelector('#handwriting-candidates');
  const undo=panel.querySelector('[data-handwriting="undo"]'),clear=panel.querySelector('[data-handwriting="clear"]'),retry=panel.querySelector('[data-handwriting="retry"]');
  if(!ctx){status.textContent='Browser ini belum mendukung area gambar. Gunakan pencarian teks di bawah.';canvas.hidden=true;return ()=>{};}
  const cards=new Map(kanji.map(k=>[k.char,k])),events=new AbortController();
  let worker=null,ready=false,disposed=false,request=0,debounce,loadTimeout,failed=false;
  const input=createStrokeInput({onChange:changed,onPreview:draw});

  function draw(){
    const rect=canvas.getBoundingClientRect();
    if(!rect.width)return;
    const pixels=Math.max(1,Math.round(rect.width*Math.min(window.devicePixelRatio||1,3)));
    if(canvas.width!==pixels){canvas.width=pixels;canvas.height=pixels;}
    ctx.setTransform(pixels/256,0,0,pixels/256,0,0);ctx.clearRect(0,0,256,256);
    ctx.strokeStyle=getComputedStyle(panel).getPropertyValue('--ink');ctx.fillStyle=ctx.strokeStyle;
    ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
    for(const stroke of input.preview){
      ctx.beginPath();ctx.moveTo(...stroke[0]);
      if(stroke.length===1){ctx.arc(...stroke[0],1.5,0,Math.PI*2);ctx.fill();}
      else {for(const p of stroke.slice(1))ctx.lineTo(...p);ctx.stroke();}
    }
    panel.querySelector('.handwriting-placeholder').hidden=Boolean(input.preview.length);
  }
  function invalidate(){request++;clearTimeout(debounce);candidates.innerHTML='';}
  function changed(){
    invalidate();draw();
    const count=input.strokes.length;
    panel.querySelector('#handwriting-count').textContent=`${count} goresan`;
    undo.disabled=clear.disabled=!count;
    if(failed){status.textContent='Data pencarian belum bisa dimuat. Coba lagi, atau gunakan pencarian teks di bawah.';return;}
    if(!count){status.textContent=ready?'Mulai menggambar untuk melihat kandidat.':'Menyiapkan pencarian… Kamu sudah bisa menggambar.';return;}
    status.textContent=ready?'Mencari bentuk yang mendekati…':'Menyiapkan pencarian… Tulisanmu tetap tersimpan di kotak ini.';
    if(ready){const id=request;debounce=setTimeout(()=>{if(!disposed&&id===request)worker.postMessage({type:'recognize',id,strokes:input.strokes});},160);}
  }
  function fail(){
    if(disposed)return;
    clearTimeout(loadTimeout);invalidate();ready=false;failed=true;worker?.terminate();worker=null;
    status.textContent='Data pencarian belum bisa dimuat. Coba lagi, atau gunakan pencarian teks di bawah.';retry.hidden=false;
  }
  function startWorker(){
    if(worker||disposed)return;
    failed=false;retry.hidden=true;status.textContent='Menyiapkan pencarian… Kamu sudah bisa menggambar.';
    try {
      worker=new Worker(new URL('./handwriting-worker.js?v=20261020-handwriting-accuracy',import.meta.url),{type:'module'});
      loadTimeout=setTimeout(fail,30000);
      worker.onerror=fail;
      worker.onmessage=({data})=>{
        if(disposed)return;
        if(data.type==='ready'){clearTimeout(loadTimeout);ready=true;changed();return;}
        if(data.type==='error'){if(data.id===undefined||data.id===request)fail();return;}
        if(data.type!=='results'||data.id!==request||input.activeId!==undefined)return;
        const matches=data.results.map(match=>cards.get(match.char)).filter(Boolean);
        candidates.innerHTML=matches.map((card,i)=>`<button type="button" class="handwriting-candidate ${i===0?'handwriting-best':''}" data-detail="${escape(card.char)}" aria-label="Pelajari ${escape(card.char)}, ${escape(card.meaning)}"><span lang="ja">${escape(card.char)}</span><small>${escape(card.level)}</small></button>`).join('');
        status.textContent=matches.length?`${matches.length} kandidat terdekat · ${input.strokes.length} goresan`:'Buat goresan yang lebih jelas untuk melihat kandidat.';
      };
    }catch {fail();}
  }
  function listen(target,type,fn){target.addEventListener(type,fn,{signal:events.signal});}
  listen(panel,'toggle',()=>{if(panel.open){draw();startWorker();}else if(input.activeId!==undefined)input.cancel({pointerId:input.activeId});});
  listen(canvas,'pointerdown',event=>{
    if(input.start(event,canvas.getBoundingClientRect())){
      event.preventDefault();invalidate();status.textContent='Lanjutkan tulisanmu…';canvas.setPointerCapture(event.pointerId);
    }else if(input.strokes.length>=64)status.textContent='Kotak sudah penuh. Bersihkan untuk menulis kanji berikutnya.';
  });
  listen(canvas,'pointermove',event=>{if(input.move(event,canvas.getBoundingClientRect()))event.preventDefault();});
  listen(canvas,'pointerup',event=>{
    if(input.end(event,canvas.getBoundingClientRect())){
      event.preventDefault();if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
    }
  });
  listen(canvas,'pointercancel',event=>input.cancel(event));
  listen(canvas,'lostpointercapture',event=>input.cancel(event));
  listen(undo,'click',()=>input.undo());listen(clear,'click',()=>input.clear());listen(retry,'click',startWorker);
  const resize=new ResizeObserver(draw);resize.observe(canvas);
  const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  return ()=>{disposed=true;clearTimeout(debounce);clearTimeout(loadTimeout);events.abort();resize.disconnect();theme.disconnect();worker?.terminate();};
}
