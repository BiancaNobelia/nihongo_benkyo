import {BUNPOU_ORDER_HISTORY_KEY,createBunpouOrderQuiz,shuffleOrderTiles,moveOrderTile,orderAnswerText,checkOrderAnswer,orderHintMarkup,orderFeedbackEntry} from './bunpou-order-core.js?v=20261015-henkan-adjectives';
import {BUNPOU_ENTRIES,BUNPOU_PATTERNS,BUNPOU_CHAPTERS} from './bunpou-data.js?v=20261015-henkan-adjectives';
import {BUNPOU_HISTORY_KEY,BUNPOU_ALL_CHAPTERS,bunpouPool,createBunpouQuiz,cleanBunpouHistory,recordBunpouShown,bunpouPromptMarkup,bunpouFeedbackMarkup} from './bunpou-core.js?v=20261015-henkan-adjectives';
import {chapterLabel} from './kotoba-core.js?v=20261015-henkan-adjectives';
import {requestedQuizCount} from './quiz-settings.js?v=20261015-henkan-adjectives';
import {shuffle} from './core.js?v=20261015-henkan-adjectives';

export function createBunpouView({root,escape,icon,heading,activity,recordSession}) {
  const preferences={mode:'cloze',chapters:[...BUNPOU_ALL_CHAPTERS],countChoice:'10',customCount:'30',time:0};
  let active=false,session=null,lastSession=null,timer=null,histories={cloze:{},order:{}},storageAvailable=true,reviewPage=0,patternPage=0;
  const historyKeys={cloze:BUNPOU_HISTORY_KEY,order:BUNPOU_ORDER_HISTORY_KEY};
  for(const mode of ['cloze','order']){try{histories[mode]=cleanBunpouHistory(JSON.parse(localStorage.getItem(historyKeys[mode])),BUNPOU_ENTRIES);}catch{storageAvailable=false;}}
  const find=s=>root.querySelector(s);
  const stop=()=>{clearInterval(timer);timer=null;};
  const top=()=>window.scrollTo({top:0,behavior:'instant'});
  const rangeChapters=range=>{const [a,b]=range.split('-').map(Number);return BUNPOU_ALL_CHAPTERS.filter(n=>n>=a&&n<=b);};
  const num=n=>n.toLocaleString('id-ID');

  function render(mode) {
    if(['cloze','order'].includes(mode))preferences.mode=mode;
    stop();active=true;session=null;lastSession=null;patternPage=0;
    root.innerHTML=`<div class="bunpou-view"><section class="bunpou-hero"><div><div class="section-kicker">BUNPOU · MINNA NO NIHONGO I & II</div><h1>Dari kata,<br><em>menjadi cerita.</em></h1><p>Pahami hubungan antar kata. Lengkapi atau susun kalimat, kenali polanya, lalu pelajari alasan di balik jawabanmu.</p><div class="kotoba-metrics"><span><strong>${num(BUNPOU_ENTRIES.length)}</strong> soal · 2 mode</span><span><strong>50</strong> bab belajar</span><span><strong>2</strong> buku Minna</span></div></div><div class="bunpou-hero-art" aria-hidden="true"><span>文法 · BUNPOU</span><p lang="ja">日本語<span>を</span>勉強します。</p><small>SATU POLA, BANYAK KEMUNGKINAN.</small></div></section>
      <div class="kotoba-layout"><section class="kotoba-panel"><div class="kotoba-section-title"><span class="kotoba-step">01</span><div><h2>Pilih bab belajarmu</h2><p>Satu bab, beberapa bab, atau seluruh buku.</p></div></div><div class="kotoba-ranges" aria-label="Rentang bab bunpou">${[['1-50','Semua bab'],['1-25','Buku I · Bab 1–25'],['26-50','Buku II · Bab 26–50'],['1-10','1–10'],['11-20','11–20'],['21-25','21–25'],['26-35','26–35'],['36-45','36–45'],['46-50','46–50']].map(([range,label])=>`<button data-bunpou-range="${range}" aria-pressed="false">${label}</button>`).join('')}</div><div class="kotoba-chapter-grid" aria-label="Bab latihan bunpou">${BUNPOU_CHAPTERS.map(c=>`<button data-bunpou-chapter="${c.number}" aria-pressed="false" aria-label="Bab ${c.number}, ${c.count} soal" title="${escape(c.title)}"><small>BAB</small><strong>${c.number}</strong><span>${c.count} soal</span></button>`).join('')}</div><div class="kotoba-selection"><span id="bunpou-selection" role="status"></span><button class="text-button" data-bunpou="clear">Kosongkan</button></div><p class="bunpou-note">Buku I mencakup bab 1–25, Buku II bab 26–50. 20 soal tambahan per bab memakai kotoba dari bab tersebut atau bab sebelumnya. Soal sumber tetap tersedia.</p></section>
      <section class="kotoba-panel bunpou-settings"><div class="kotoba-section-title"><span class="kotoba-step">02</span><div><h2>Atur latihanmu</h2><p>Mulai dari satu pola yang ingin dipahami.</p></div></div><div class="bunpou-modes" aria-label="Mode latihan bunpou"><button data-bunpou-mode="cloze" aria-pressed="false"><span lang="ja">（？）</span><strong>Lengkapi kalimat</strong><small>Pilih bagian yang tepat dari empat jawaban.</small></button><button data-bunpou-mode="order" aria-pressed="false"><span lang="ja">文 → 文</span><strong>Susun kalimat</strong><small>Rangkai kata acak dengan petunjuk pola dan arti Indonesia.</small></button></div><div class="kotoba-fields"><div class="field"><label for="bunpou-count">Jumlah soal</label><select id="bunpou-count"><option value="10">10 soal</option><option value="20">20 soal</option><option value="50">50 soal</option><option value="custom">Custom · Isi sendiri</option></select></div><div class="field"><label for="bunpou-time">Waktu per soal</label><select id="bunpou-time"><option value="0">Tanpa timer</option><option value="15">15 detik</option><option value="30">30 detik</option></select></div></div><div class="field kotoba-custom" id="bunpou-custom-field" hidden><label for="bunpou-custom">Jumlah soal custom</label><input id="bunpou-custom" type="number" min="1" step="1" inputmode="numeric" aria-describedby="bunpou-count-error"><small id="bunpou-count-error" role="alert" hidden>Isi bilangan bulat minimal 1.</small></div><div class="kotoba-session-summary" id="bunpou-summary" role="status"></div><button class="primary kotoba-start" data-bunpou="start">Mulai kuis bunpou ${icon('arrow')}</button><p class="kotoba-small">Benar atau salah, selalu ada arti kalimat, rumus, dan catatan. Hasil latihan tersimpan di Progres Saya.</p></section></div>
      <details class="kotoba-panel bunpou-glossary"><summary>Jelajahi pola dalam bab pilihanmu</summary><label for="bunpou-search">Cari pola, tema, atau arti</label><input id="bunpou-search" type="search" placeholder="Misalnya: ために, larangan, bentuk hormat"><div id="bunpou-patterns"></div><div class="henkan-pagination"><button class="secondary" data-bunpou="patterns-prev">Sebelumnya</button><span id="bunpou-pattern-page"></span><button class="secondary" data-bunpou="patterns-next">Berikutnya</button></div></details><p class="kotoba-source-note">${num(BUNPOU_ENTRIES.length)} soal dari ${num(BUNPOU_PATTERNS.length)} pola Minna no Nihongo bab 1–50, termasuk 1.000 soal tambahan dengan kosakata dari daftar Kotoba. Setiap soal dapat dikerjakan dalam mode Lengkapi atau Susun Kalimat. <a href="./DATA-SOURCES.md" target="_blank" rel="noopener">Sumber materi ${icon('arrow-up')}</a></p></div>`;
    find('#bunpou-count').value=preferences.countChoice;find('#bunpou-custom').value=preferences.customCount;find('#bunpou-time').value=String(preferences.time);update();
  }
  function update() {
    Object.assign(preferences,{countChoice:find('#bunpou-count').value,customCount:find('#bunpou-custom').value,time:Number(find('#bunpou-time').value)});
    root.querySelectorAll('[data-bunpou-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bunpouMode===preferences.mode)));
    root.querySelectorAll('[data-bunpou-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(preferences.chapters.includes(Number(b.dataset.bunpouChapter)))));
    root.querySelectorAll('[data-bunpou-range]').forEach(b=>{const values=rangeChapters(b.dataset.bunpouRange);b.setAttribute('aria-pressed',String(values.length===preferences.chapters.length&&values.every(n=>preferences.chapters.includes(n))));});
    find('#bunpou-selection').textContent=chapterLabel(preferences.chapters);
    const count=requestedQuizCount(preferences.countChoice,preferences.customCount),pool=bunpouPool(BUNPOU_ENTRIES,preferences),unseen=pool.filter(q=>!histories[preferences.mode][q.id]).length;
    find('#bunpou-custom-field').hidden=preferences.countChoice!=='custom';find('#bunpou-count-error').hidden=count!==null;find('#bunpou-custom').setAttribute('aria-invalid',String(count===null));
    find('#bunpou-summary').innerHTML=`<strong>${num(pool.length)} soal tersedia</strong><span>${!pool.length?'Pilih minimal satu bab untuk mulai.':count===null?'Isi jumlah soal yang valid.':`${num(Math.min(count,pool.length))} soal · ${preferences.chapters.length} bab dipilih · ${preferences.mode==='order'?'Susun kalimat':'Lengkapi kalimat'}`}</span><small>${unseen?`${num(unseen)} soal belum pernah tampil.`:pool.length?'Semua soal pernah tampil; giliran berikutnya diprioritaskan merata.':''} Soal yang sama tidak diulang dalam satu sesi.${count>pool.length&&pool.length?' Jumlah soal disesuaikan dengan bank yang tersedia.':''}${!storageAvailable?' Riwayat hanya tersimpan sementara selama halaman ini terbuka.':''}</small>`;
    find('[data-bunpou="start"]').disabled=count===null||!pool.length;renderPatterns();
  }
  function renderPatterns() {
    const search=find('#bunpou-search').value.trim().toLocaleLowerCase('id');
    const rows=bunpouPool(BUNPOU_PATTERNS,preferences).filter(q=>[q.pattern,q.meaning,q.theme,q.structure].join(' ').toLocaleLowerCase('id').includes(search));
    const pages=Math.max(1,Math.ceil(rows.length/10));patternPage=Math.max(0,Math.min(patternPage,pages-1));
    find('#bunpou-patterns').innerHTML=`<p class="bunpou-note">${num(rows.length)} pola</p>${rows.slice(patternPage*10,patternPage*10+10).map(q=>`<details class="bunpou-pattern"><summary><span>Bab ${q.chapter}</span><strong lang="ja">${escape(q.pattern)}</strong><small>${escape(q.meaning)}</small></summary>${bunpouFeedbackMarkup(q,escape)}</details>`).join('')||'<p>Tidak ada pola yang cocok.</p>'}`;
    find('#bunpou-pattern-page').textContent=`${patternPage+1} / ${pages}`;find('[data-bunpou="patterns-prev"]').disabled=patternPage===0;find('[data-bunpou="patterns-next"]').disabled=patternPage===pages-1;
  }
  function start(questions=null) {
    stop();if(!questions){update();if(find('[data-bunpou="start"]').disabled)return;questions=(preferences.mode==='order'?createBunpouOrderQuiz:createBunpouQuiz)(BUNPOU_ENTRIES,{...preferences,count:requestedQuizCount(preferences.countChoice,preferences.customCount)},histories[preferences.mode]);}
    if(!questions.length)return;
    session={mode:preferences.mode,questions,index:0,selected:[],answers:[],answered:false,chapters:[...preferences.chapters],time:preferences.time};lastSession=null;activity();renderQuestion();
  }
  function renderQuestion() {
    stop();session.answered=false;session.selected=[];const q=session.questions[session.index];histories[session.mode]=recordBunpouShown(histories[session.mode],q.id);
    try{localStorage.setItem(historyKeys[session.mode],JSON.stringify(histories[session.mode]));}catch{storageAvailable=false;}
    root.innerHTML=`<div class="study-panel bunpou-session">${heading(session.mode==='order'?'BUNPOU · SUSUN KALIMAT':'KUIS BUNPOU',session.mode==='order'?'Susun kata, temukan makna.':'Lengkapi kalimatnya.',`Bab ${q.chapter} · ${escape(q.theme)}`)}<div class="study-top"><span>Soal <strong>${session.index+1}</strong> / ${session.questions.length}</span><span id="bunpou-timer" role="timer">${session.time?`${session.time} dtk`:'Tanpa timer'}</span></div><div class="progress-track" role="progressbar" aria-label="Progres kuis bunpou" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index}"><span style="width:${session.index/session.questions.length*100}%"></span></div><div class="quiz-question bunpou-question">${session.mode==='order'?orderQuestionMarkup(q):`<p class="bunpou-intent"><span>MAKSUD KALIMAT</span>${escape(q.cue)}</p><div class="bunpou-sentence" tabindex="-1">${bunpouPromptMarkup(q,escape)}</div><p class="quiz-caption">Pilih bagian yang tepat untuk mengisi tanda tanya.</p><div class="quiz-options bunpou-options">${q.options.map((a,i)=>`<button class="quiz-option" data-bunpou-answer="${i}"><span>${'ABCD'[i]}</span><span lang="ja">${escape(a)}</span></button>`).join('')}</div>`}<div id="bunpou-feedback" class="quiz-feedback" role="status">${session.mode==='order'?'Susun semua potongan, lalu cek jawabanmu.':'Pilih satu jawaban yang paling tepat.'}</div></div><div class="quiz-next"><button class="text-button" data-bunpou="exit">Akhiri latihan</button><button class="primary" data-bunpou="next" disabled>${session.index===session.questions.length-1?'Lihat hasil':'Soal berikutnya'} ${icon('arrow')}</button></div><div id="bunpou-exit-confirm" hidden><div class="kotoba-exit-box"><p>Akhiri sesi ini? Skor yang belum selesai tidak disimpan. Soal yang sudah tampil tetap diingat.</p><button class="secondary" data-bunpou="continue">Lanjutkan kuis</button><button class="primary" data-bunpou="setup">Akhiri sesi</button></div></div>${!storageAvailable?'<p class="bunpou-note">Penyimpanan browser tidak tersedia. Riwayat sementara hanya berlaku selama halaman ini terbuka.</p>':''}</div>`;
    top();if(session.mode==='order'){renderOrderTiles();find('.bunpou-order-hint').focus({preventScroll:true});}else find('.bunpou-sentence').focus({preventScroll:true});
    if(session.time){session.deadline=Date.now()+session.time*1000;timer=setInterval(()=>{if(!session||session.answered)return;const remaining=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));find('#bunpou-timer').textContent=`${remaining} dtk`;if(!remaining){if(session.mode==='order')submitOrder(true);else answer(null);}},250);}
  }
  function orderQuestionMarkup(q) {
    return `${orderHintMarkup(q,escape).replace('class="bunpou-order-hint"','class="bunpou-order-hint" tabindex="-1"')}<p class="bunpou-order-instruction">Ketuk potongan untuk menyusun kalimat. Ketuk lagi di susunanmu untuk mengembalikannya.</p><div class="bunpou-order-label"><strong>Susunanmu</strong><span id="bunpou-tile-count" role="status"></span></div><div id="bunpou-arranged" class="bunpou-arranged" role="group" aria-label="Susunanmu"></div><p class="bunpou-order-label"><strong>Potongan tersedia</strong></p><div id="bunpou-tiles" class="bunpou-tiles" role="group" aria-label="Potongan tersedia"></div><div class="bunpou-order-actions"><button class="secondary" data-bunpou="order-reset">Reset susunan</button><button class="primary" data-bunpou="order-check" disabled>Cek jawaban ${icon('check')}</button></div>`;
  }
  function renderOrderTiles(focus=false) {
    const q=session.questions[session.index],selected=session.selected;
    find('#bunpou-arranged').innerHTML=selected.map((i,n)=>`<button class="bunpou-tile selected" data-order-remove="${i}" lang="ja" aria-label="Hapus ${escape(q.order.tokens[i])}, posisi ${n+1}" ${session.answered?'disabled':''}>${escape(q.order.tokens[i])}</button>`).join('')||'<span class="bunpou-order-empty">Pilih potongan di bawah untuk mulai menyusun…</span>';
    find('#bunpou-tiles').innerHTML=q.tiles.map((i,n)=>`<button class="bunpou-tile" data-order-pick="${i}" lang="ja" aria-label="Tambah ${escape(q.order.tokens[i])}, potongan ${n+1}" ${session.answered||selected.includes(i)?'disabled':''}>${escape(q.order.tokens[i])}</button>`).join('');
    find('#bunpou-tile-count').textContent=`${selected.length} / ${q.order.tokens.length} potongan`;
    find('[data-bunpou="order-check"]').disabled=session.answered||selected.length!==q.order.tokens.length;
    find('[data-bunpou="order-reset"]').disabled=session.answered||!selected.length;
    if(focus)(find('[data-order-pick]:not(:disabled)')||find('[data-bunpou="order-check"]')).focus({preventScroll:true});
  }
  function editOrder(index,remove=false) {
    if(!session||session.mode!=='order'||session.answered)return;
    if(session.time&&Date.now()>=session.deadline){submitOrder(true);return;}
    const q=session.questions[session.index];session.selected=moveOrderTile(q,session.selected,index,remove);renderOrderTiles(true);
  }
  function submitOrder(timedOut=false) {
    if(!session||session.mode!=='order'||session.answered)return;
    if(session.time&&Date.now()>=session.deadline)timedOut=true;
    const q=session.questions[session.index];
    if(!timedOut&&session.selected.length!==q.order.tokens.length)return;
    stop();session.answered=true;
    const chosen=orderAnswerText(q,session.selected),correct=!timedOut&&checkOrderAnswer(q,session.selected);
    session.answers.push({chosen,correct,timedOut});renderOrderTiles();
    const feedback=find('#bunpou-feedback');feedback.className=`quiz-feedback ${correct?'success':'error'}`;
    feedback.innerHTML=`<p class="answer-status">${timedOut?'Waktunya habis. Mari pelajari susunannya.':correct?'Tepat! Susunanmu sesuai pola dan arti.':'Susunan belum sesuai pola dan arti. Bandingkan dengan contoh berikut.'}</p><p class="bunpou-order-example-label">Contoh susunan</p>${bunpouFeedbackMarkup(orderFeedbackEntry(q),escape)}`;
    find('[data-bunpou="next"]').disabled=false;activity();
  }
  function answer(index) {
    if(!session||session.answered||session.mode!=='cloze')return;
    if(index!==null&&session.time&&Date.now()>=session.deadline)index=null;
    stop();session.answered=true;const q=session.questions[session.index],chosen=index===null?null:q.options[index],correct=chosen===q.answer;session.answers.push({chosen,correct});
    root.querySelectorAll('[data-bunpou-answer]').forEach(b=>{b.disabled=true;const a=q.options[Number(b.dataset.bunpouAnswer)];b.classList.toggle('correct',a===q.answer);b.classList.toggle('wrong',a===chosen&&!correct);});
    const feedback=find('#bunpou-feedback');feedback.className=`quiz-feedback ${correct?'success':'error'}`;feedback.innerHTML=`<p class="answer-status">${correct?'Tepat! Polanya sudah pas.':chosen===null?'Waktunya habis. Mari pelajari polanya.':'Belum tepat. Mari pahami polanya.'}</p>${bunpouFeedbackMarkup(q,escape)}`;
    find('[data-bunpou="next"]').disabled=false;activity();
  }
  function finish() {
    stop();const correct=session.answers.filter(a=>a.correct).length,total=session.questions.length;
    recordSession({date:new Date().toISOString(),correct,total,mode:session.mode==='order'?'bunpou-order':'bunpou',chapters:session.chapters});lastSession=session;session=null;reviewPage=0;
    root.innerHTML=`<div class="study-panel bunpou-session"><div class="results"><div class="section-kicker">LATIHAN BUNPOU SELESAI</div><div class="result-circle">${Math.round(correct/total*100)}%<small>JAWABAN BENAR</small></div><h1>Semakin paham, semakin lancar.</h1><p>${correct} dari ${total} jawaban benar · ${lastSession.mode==='order'?'Susun kalimat':'Lengkapi kalimat'} · ${escape(chapterLabel(lastSession.chapters))}</p><div class="result-buttons"><button class="primary" data-bunpou="setup">Latihan baru ${icon('arrow')}</button>${correct<total?'<button class="secondary" data-bunpou="retry">Ulangi yang salah</button>':''}<a href="#progres" class="text-button">Lihat progres ${icon('arrow')}</a></div></div><section class="bunpou-review"><h2>Tinjau pola dan jawabanmu</h2><div id="bunpou-review-list"></div><div class="henkan-pagination"><button class="secondary" data-bunpou="review-prev">Sebelumnya</button><span id="bunpou-review-page"></span><button class="secondary" data-bunpou="review-next">Berikutnya</button></div></section></div>`;renderReview();top();
  }
  function renderReview() {
    const pages=Math.ceil(lastSession.questions.length/10);reviewPage=Math.max(0,Math.min(reviewPage,pages-1));
    find('#bunpou-review-list').innerHTML=lastSession.questions.slice(reviewPage*10,reviewPage*10+10).map((q,i)=>{const a=lastSession.answers[reviewPage*10+i];return `<article class="kotoba-review-item ${a.correct?'':'incorrect'}"><div class="kotoba-review-status">${icon(a.correct?'check':'close')} Soal ${reviewPage*10+i+1} · Bab ${q.chapter} · ${a.correct?'Benar':'Belum tepat'}</div><p>${escape(q.cue)}</p>${(!a.correct||lastSession.mode==='order')?`<p>Jawabanmu: <strong lang="ja">${escape(a.chosen||'Tidak dijawab')}</strong></p>`:''}${bunpouFeedbackMarkup(lastSession.mode==='order'?orderFeedbackEntry(q):q,escape)}</article>`;}).join('');
    find('#bunpou-review-page').textContent=`${reviewPage+1} / ${pages}`;find('[data-bunpou="review-prev"]').disabled=reviewPage===0;find('[data-bunpou="review-next"]').disabled=reviewPage===pages-1;
  }
  root.addEventListener('click',e=>{
    if(!active)return;const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.bunpouMode){preferences.mode=b.dataset.bunpouMode;update();return;}
    if(b.dataset.orderPick!==undefined){editOrder(Number(b.dataset.orderPick));return;}
    if(b.dataset.orderRemove!==undefined){editOrder(Number(b.dataset.orderRemove),true);return;}
    if(b.dataset.bunpouChapter){const n=Number(b.dataset.bunpouChapter);preferences.chapters=preferences.chapters.includes(n)?preferences.chapters.filter(c=>c!==n):[...preferences.chapters,n];patternPage=0;update();return;}
    if(b.dataset.bunpouRange){preferences.chapters=rangeChapters(b.dataset.bunpouRange);patternPage=0;update();return;}
    if(b.dataset.bunpouAnswer!==undefined){answer(Number(b.dataset.bunpouAnswer));return;}
    const action=b.dataset.bunpou;
    if(action==='clear'){preferences.chapters=[];patternPage=0;update();}
    if(action==='start')start();
    if(action==='order-check')submitOrder();
    if(action==='order-reset'&&session?.mode==='order'&&!session.answered){if(session.time&&Date.now()>=session.deadline)submitOrder(true);else{session.selected=[];renderOrderTiles(true);}}
    if(action==='next'&&session?.answered){session.index++;if(session.index===session.questions.length)finish();else renderQuestion();}
    if(action==='setup'){render();top();}
    if(action==='exit'&&session){find('#bunpou-exit-confirm').hidden=false;find('[data-bunpou="continue"]').focus();}
    if(action==='continue')find('#bunpou-exit-confirm').hidden=true;
    if(action==='retry'&&lastSession){preferences.mode=lastSession.mode;start(shuffle(lastSession.questions.filter((q,i)=>!lastSession.answers[i].correct)).map(q=>({...q,options:shuffle(q.options),...(lastSession.mode==='order'?{tiles:shuffleOrderTiles(q)}:{})})));}
    if(action==='review-prev'||action==='review-next'){reviewPage+=action==='review-next'?1:-1;renderReview();find('.bunpou-review').scrollIntoView({block:'start'});}
    if(action==='patterns-prev'||action==='patterns-next'){patternPage+=action==='patterns-next'?1:-1;renderPatterns();find('.bunpou-glossary').scrollIntoView({block:'start'});}
  });
  root.addEventListener('change',e=>{if(active&&!session&&['bunpou-count','bunpou-time'].includes(e.target.id))update();});
  root.addEventListener('input',e=>{if(!active||session)return;if(e.target.id==='bunpou-custom')update();if(e.target.id==='bunpou-search'){patternPage=0;renderPatterns();}});
  return {render,dispose(){active=false;stop();session=null;lastSession=null;}};
}
