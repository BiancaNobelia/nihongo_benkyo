import { HENKAN_VERBS } from './henkan-data.js?v=20261015-bunpou';
import { HENKAN_LEVELS, HENKAN_MODES, FORM_LABELS, FORM_MEANINGS, VERB_GROUPS, conjugateVerb, spellForm, formExplanation, henkanPool, createHenkanQuiz, HENKAN_HISTORY_KEY, cleanHenkanHistory, recordHenkanShown } from './henkan-core.js?v=20261015-bunpou';
import { requestedQuizCount } from './quiz-settings.js?v=20261015-bunpou';
import { shuffle } from './core.js?v=20261015-bunpou';

export function henkanDetailMarkup(q,escape) {
  const v=q.verb, f=conjugateVerb(v);
  return `<div class="answer-details henkan-detail"><div class="answer-word"><span>${escape(FORM_LABELS[q.form])}</span><strong lang="ja">${escape(spellForm(v,q.answer,q.form))}<span class="answer-reading">（${escape(q.answer)}）</span></strong></div><div class="answer-meaning"><span>Arti dasar · ${escape(v.word)}（${escape(v.reading)}）</span><p>${escape(v.meaning)}</p></div><p>${escape(FORM_MEANINGS[q.form])}</p><p class="henkan-rule">${escape(formExplanation(v,q.form))}</p><details class="henkan-reference"><summary>Lihat perubahan bentuk kata ini</summary><dl>${Object.keys(FORM_LABELS).filter(k=>f[k]).map(k=>`<div><dt>${escape(FORM_LABELS[k].split(' · ')[0])}</dt><dd lang="ja">${escape(spellForm(v,f[k],k))}<small>${escape(f[k])}</small></dd></div>`).join('')}</dl>${v.noPotential||v.noPassive?'<p>Bentuk yang kurang cocok untuk latihan tanpa konteks tidak diujikan pada kata ini.</p>':''}</details></div>`;
}

export function createHenkanView({root,escape,icon,heading,activity,recordSession}) {
  const preferences={level:'N5',modes:Object.keys(HENKAN_MODES),countChoice:'10',customCount:'30',time:0};
  let active=false,session=null,lastSession=null,reviewPage=0,wordPage=0,timer=null,history={},storageAvailable=true;
  try{history=cleanHenkanHistory(JSON.parse(localStorage.getItem(HENKAN_HISTORY_KEY)),HENKAN_VERBS);}catch{storageAvailable=false;}
  const find=s=>root.querySelector(s);
  const stop=()=>{clearInterval(timer);timer=null;};
  const focusTop=()=>{window.scrollTo({top:0,behavior:'instant'});};
  const selectedWords=()=>HENKAN_VERBS.filter(v=>preferences.level==='all'||v.level===preferences.level);
  const num=n=>n.toLocaleString('id-ID');

  function render() {
    stop();active=true;session=null;lastSession=null;wordPage=0;
    root.innerHTML=`<div class="henkan-view"><section class="henkan-hero"><div><div class="section-kicker">HENKAN · PERUBAHAN KATA KERJA</div><h1>Satu kata kerja.<br><em>Banyak cara bercerita.</em></h1><p>Dari <span lang="ja">食べます</span> ke <span lang="ja">食べて</span>. Kenali pola perubahan, pahami golongannya, lalu latih sampai terbiasa.</p><div class="henkan-metrics"><span><strong>${num(HENKAN_VERBS.length)}</strong> kata kerja</span><span><strong>${Object.keys(HENKAN_MODES).length}</strong> pilihan latihan</span><span><strong>N5–N3</strong> level kosakata</span></div></div><div class="henkan-art" aria-label="Contoh perubahan: 書きます menjadi 書いて"><span>BENTUK SOPAN</span><strong lang="ja">書きます</strong><div>${icon('arrow')}</div><strong lang="ja">書いて</strong><span>TE-KEI · MENULIS</span></div></section>
      <div class="henkan-layout"><section class="henkan-panel"><div class="kotoba-section-title"><span class="kotoba-step">01</span><div><h2>Pilih bentuk yang ingin dilatih</h2><p>Bisa satu bentuk atau campuran beberapa bentuk.</p></div></div><div class="henkan-mode-actions"><button class="text-button" data-henkan="all">Pilih semua</button><button class="text-button" data-henkan="clear">Kosongkan</button></div><div class="henkan-modes" aria-label="Bentuk perubahan">${Object.entries(HENKAN_MODES).map(([id,m])=>`<button data-henkan-mode="${id}" aria-pressed="false"><span lang="ja">${m.ja}</span><strong>${m.label}</strong><small>${m.description}</small><span class="henkan-mode-check" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div><div class="henkan-futsu-note"><strong>Futsū-kei itu satu keluarga bentuk.</strong><p>Latih pasangan <span lang="ja">食べます → 食べる</span> (bentuk kamus), <span lang="ja">食べません → 食べない</span>, <span lang="ja">食べました → 食べた</span>, dan <span lang="ja">食べませんでした → 食べなかった</span>. Soal menyebutkan bentuk yang diminta. Materi yang tumpang tindih digabung.</p><p><strong>Latihan lanjutan:</strong> jōken-kei khusus pola ～ば. Sonkei memakai konteks tindakan guru, dengan bentuk hormat khusus, お～になる, ～なさる, atau ～（ら）れる. Pola yang diminta disebutkan di soal.</p></div></section>
      <section class="henkan-panel henkan-settings"><div class="kotoba-section-title"><span class="kotoba-step">02</span><div><h2>Atur sesi belajarmu</h2><p>Sedikit demi sedikit, semakin lancar.</p></div></div><div class="field"><label for="henkan-level">Level kosakata</label><select id="henkan-level">${HENKAN_LEVELS.map(l=>`<option value="${l}">${l} · ${num(HENKAN_VERBS.filter(v=>v.level===l).length)} kata kerja</option>`).join('')}<option value="all">Campuran N5–N3</option></select><small>Level memilih kosakata. Semua bentuk tetap bisa dilatih, termasuk enam bentuk lanjutan. Sonkei memakai pilihan kata yang sesuai untuk tindakan seseorang.</small></div><div class="henkan-fields"><div class="field"><label for="henkan-count">Jumlah soal</label><select id="henkan-count"><option value="10">10 soal</option><option value="20">20 soal</option><option value="50">50 soal</option><option value="custom">Custom · Isi sendiri</option></select></div><div class="field"><label for="henkan-time">Waktu per soal</label><select id="henkan-time"><option value="0">Tanpa timer</option><option value="15">15 detik</option><option value="30">30 detik</option></select></div></div><div class="field" id="henkan-custom-field" hidden><label for="henkan-custom">Jumlah soal custom</label><input id="henkan-custom" type="number" min="1" step="1" inputmode="numeric" aria-describedby="henkan-count-error"><small id="henkan-count-error" role="alert" hidden>Isi bilangan bulat minimal 1.</small></div><div class="henkan-summary" id="henkan-summary" role="status"></div><button class="primary henkan-start" data-henkan="start">Mulai kuis henkan ${icon('arrow')}</button><p class="henkan-small">Arti dan pola perubahan muncul setelah menjawab, baik benar maupun salah. Hasil tersimpan di Progres Saya.</p></section></div>
      <details class="henkan-glossary henkan-panel"><summary>Jelajahi kata kerja dalam level ini</summary><label for="henkan-search">Cari kata, bacaan, atau arti</label><input id="henkan-search" type="search" placeholder="Misalnya: makan, 食べる, たべる"><div id="henkan-word-list"></div><div class="henkan-pagination"><button class="secondary" data-henkan="words-prev">Sebelumnya</button><span id="henkan-word-page"></span><button class="secondary" data-henkan="words-next">Berikutnya</button></div></details><p class="henkan-source-note">Kosakata dari Minna I–II, kompilasi N3, dan bank latihan yang sudah tersedia. Pembagian level mengikuti sumber belajar; bentuk yang sudah berubah dinormalisasi ke kata kerja asal. Latihan memakai bentuk baku. <a href="./DATA-SOURCES.md" target="_blank" rel="noopener">Sumber materi ${icon('arrow-up')}</a></p></div>`;
    find('#henkan-level').value=preferences.level;find('#henkan-count').value=preferences.countChoice;find('#henkan-custom').value=preferences.customCount;find('#henkan-time').value=String(preferences.time);
    update();
  }

  function update() {
    Object.assign(preferences,{level:find('#henkan-level').value,countChoice:find('#henkan-count').value,customCount:find('#henkan-custom').value,time:Number(find('#henkan-time').value)});
    root.querySelectorAll('[data-henkan-mode]').forEach(b=>b.setAttribute('aria-pressed',String(preferences.modes.includes(b.dataset.henkanMode))));
    const count=requestedQuizCount(preferences.countChoice,preferences.customCount),pool=henkanPool(HENKAN_VERBS,preferences);
    find('#henkan-custom-field').hidden=preferences.countChoice!=='custom';find('#henkan-count-error').hidden=count!==null;find('#henkan-custom').setAttribute('aria-invalid',String(count===null));
    const unseen=pool.filter(q=>!history[q.id]).length;
    find('#henkan-summary').innerHTML=`<strong>${num(pool.length)} soal tersedia</strong><span>${!preferences.modes.length?'Pilih minimal satu bentuk untuk mulai.':count===null?'Isi jumlah soal yang valid.':`${num(Math.min(count,pool.length))} soal · ${preferences.modes.length} pilihan bentuk`}</span><small>${!pool.length?'Belum ada soal dalam pilihan ini.':unseen?`${num(unseen)} soal belum pernah tampil.`:'Semua soal pernah tampil; giliran berikutnya diprioritaskan merata.'} Kata kerja divariasikan dan soal yang sama tidak berulang dalam satu sesi.${count>pool.length?' Jumlah disesuaikan dengan bank yang tersedia.':''}${!storageAvailable?' Riwayat hanya tersedia selama halaman ini terbuka.':''}</small>`;
    find('[data-henkan="start"]').disabled=count===null||!pool.length;
    renderWords();
  }
  function renderWords() {
    const search=find('#henkan-search').value.trim().toLocaleLowerCase('id');
    const words=selectedWords().filter(v=>[v.word,v.reading,v.meaning].join(' ').toLocaleLowerCase('id').includes(search)),pages=Math.max(1,Math.ceil(words.length/24));
    wordPage=Math.max(0,Math.min(wordPage,pages-1));
    find('#henkan-word-list').innerHTML=`<p class="henkan-small">${num(words.length)} kata kerja</p><div class="kotoba-word-list">${words.slice(wordPage*24,wordPage*24+24).map(v=>`<div><span lang="ja"><strong>${escape(v.word)}</strong><small>${escape(v.reading)}</small></span><span>${escape(v.meaning)}<small>${v.level} · ${VERB_GROUPS[v.group]}</small></span></div>`).join('')||'<p>Tidak ada kata yang cocok.</p>'}</div>`;
    find('#henkan-word-page').textContent=`${wordPage+1} / ${pages}`;find('[data-henkan="words-prev"]').disabled=wordPage===0;find('[data-henkan="words-next"]').disabled=wordPage===pages-1;
  }
  function start(questions=null) {
    stop();
    if(!questions){update();if(find('[data-henkan="start"]').disabled)return;questions=createHenkanQuiz(HENKAN_VERBS,{...preferences,count:requestedQuizCount(preferences.countChoice,preferences.customCount)},history);}
    if(!questions.length)return;
    session={questions,index:0,answers:[],answered:false,level:preferences.level,modes:[...preferences.modes],time:preferences.time};lastSession=null;activity();renderQuestion();
  }
  function renderQuestion() {
    stop();session.answered=false;
    const q=session.questions[session.index];history=recordHenkanShown(history,q.id);
    try{localStorage.setItem(HENKAN_HISTORY_KEY,JSON.stringify(history));}catch{storageAvailable=false;}
    root.innerHTML=`<div class="study-panel henkan-session">${heading('KUIS HENKAN',q.isFutsu?'Latih bentuk biasa.':'Ubah bentuk, pahami polanya.',`${q.verb.level} · ${FORM_LABELS[q.form]}`)}<div class="study-top"><span>Soal <strong>${session.index+1}</strong> / ${session.questions.length}</span><span id="henkan-timer" role="timer">${session.time?`${session.time} dtk`:'Tanpa timer'}</span></div><div class="progress-track" role="progressbar" aria-label="Progres kuis henkan" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index}"><span style="width:${session.index/session.questions.length*100}%"></span></div><div class="quiz-question henkan-question"><span class="henkan-target">${q.isFutsu?'FUTSŪ-KEI · ':''}${escape(FORM_LABELS[q.form])}</span><p class="quiz-caption">${escape(q.instruction)}</p><div class="henkan-prompt" lang="ja" tabindex="-1">${escape(q.promptWord)}</div><p class="henkan-prompt-reading" lang="ja">${escape(q.prompt)}</p><div class="quiz-options henkan-options">${q.options.map((a,i)=>`<button class="quiz-option" data-henkan-answer="${i}"><span>${'ABCD'[i]}</span><span lang="ja">${escape(a)}</span></button>`).join('')}</div><div id="henkan-feedback" class="quiz-feedback" role="status">Pilih satu jawaban yang paling tepat.</div></div><div class="quiz-next"><button class="text-button" data-henkan="exit">Akhiri latihan</button><button class="primary" data-henkan="next" disabled>${session.index===session.questions.length-1?'Lihat hasil':'Soal berikutnya'} ${icon('arrow')}</button></div><div id="henkan-exit-confirm" hidden><div class="kotoba-exit-box"><p>Akhiri sesi ini? Skor yang belum selesai tidak disimpan. Soal yang sudah tampil tetap diingat.</p><button class="secondary" data-henkan="continue">Lanjutkan kuis</button><button class="primary" data-henkan="setup">Akhiri sesi</button></div></div>${!storageAvailable?'<p class="henkan-small">Penyimpanan browser tidak tersedia. Riwayat sementara hanya berlaku selama halaman ini terbuka.</p>':''}</div>`;
    focusTop();find('.henkan-prompt').focus({preventScroll:true});
    if(session.time){session.deadline=Date.now()+session.time*1000;timer=setInterval(()=>{if(!session||session.answered)return;const remaining=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));find('#henkan-timer').textContent=`${remaining} dtk`;if(!remaining)answer(null);},250);}
  }
  function answer(index) {
    if(!session||session.answered)return;
    if(index!==null&&session.time&&Date.now()>=session.deadline)index=null;
    stop();session.answered=true;const q=session.questions[session.index],chosen=index===null?null:q.options[index],correct=chosen===q.answer;
    session.answers.push({chosen,correct});
    root.querySelectorAll('[data-henkan-answer]').forEach(b=>{b.disabled=true;const a=q.options[Number(b.dataset.henkanAnswer)];b.classList.toggle('correct',a===q.answer);b.classList.toggle('wrong',a===chosen&&!correct);});
    const feedback=find('#henkan-feedback');feedback.className=`quiz-feedback ${correct?'success':'error'}`;feedback.innerHTML=`<p class="answer-status">${correct?'Tepat!':chosen===null?'Waktunya habis. Mari pelajari bentuknya.':'Belum tepat. Mari lihat perubahannya.'}</p>${henkanDetailMarkup(q,escape)}`;find('[data-henkan="next"]').disabled=false;activity();
  }
  function finish() {
    stop();const correct=session.answers.filter(a=>a.correct).length,total=session.questions.length;
    recordSession({date:new Date().toISOString(),correct,total,mode:'henkan',level:session.level,forms:session.modes});lastSession=session;session=null;reviewPage=0;
    root.innerHTML=`<div class="study-panel henkan-session"><div class="results"><div class="section-kicker">LATIHAN HENKAN SELESAI</div><div class="result-circle">${Math.round(correct/total*100)}%<small>JAWABAN BENAR</small></div><h1>Selangkah lebih lancar.</h1><p>${correct} dari ${total} jawaban benar · ${lastSession.level==='all'?'Campuran N5–N3':lastSession.level}</p><div class="result-buttons"><button class="primary" data-henkan="setup">Latihan baru ${icon('arrow')}</button>${correct<total?'<button class="secondary" data-henkan="retry">Ulangi yang salah</button>':''}<a class="text-button" href="#progres">Lihat progres ${icon('arrow')}</a></div></div><section class="henkan-review"><h2>Tinjau perubahan bentuknya</h2><div id="henkan-review-list"></div><div class="henkan-pagination"><button class="secondary" data-henkan="review-prev">Sebelumnya</button><span id="henkan-review-page"></span><button class="secondary" data-henkan="review-next">Berikutnya</button></div></section></div>`;renderReview();focusTop();
  }
  function renderReview() {
    const pages=Math.ceil(lastSession.questions.length/10);reviewPage=Math.max(0,Math.min(reviewPage,pages-1));
    find('#henkan-review-list').innerHTML=lastSession.questions.slice(reviewPage*10,reviewPage*10+10).map((q,i)=>{const a=lastSession.answers[reviewPage*10+i];return `<article class="kotoba-review-item ${a.correct?'':'incorrect'}"><div class="kotoba-review-status">${icon(a.correct?'check':'close')} Soal ${reviewPage*10+i+1} · ${a.correct?'Benar':'Belum tepat'}</div><p><span lang="ja">${escape(q.promptWord)}</span> → ${escape(FORM_LABELS[q.form])}</p>${!a.correct?`<p>Jawabanmu: <strong>${escape(a.chosen||'Tidak dijawab')}</strong></p>`:''}${henkanDetailMarkup(q,escape)}</article>`;}).join('');
    find('#henkan-review-page').textContent=`${reviewPage+1} / ${pages}`;find('[data-henkan="review-prev"]').disabled=reviewPage===0;find('[data-henkan="review-next"]').disabled=reviewPage===pages-1;
  }
  root.addEventListener('click',e=>{
    if(!active)return;const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.henkanMode){const m=b.dataset.henkanMode;preferences.modes=preferences.modes.includes(m)?preferences.modes.filter(x=>x!==m):[...preferences.modes,m];update();return;}
    if(b.dataset.henkanAnswer!==undefined){answer(Number(b.dataset.henkanAnswer));return;}
    const a=b.dataset.henkan;
    if(a==='all'||a==='clear'){preferences.modes=a==='all'?Object.keys(HENKAN_MODES):[];update();}
    if(a==='start')start();
    if(a==='next'&&session?.answered){session.index++;if(session.index===session.questions.length)finish();else renderQuestion();}
    if(a==='setup'){render();focusTop();}
    if(a==='exit'&&session){find('#henkan-exit-confirm').hidden=false;find('[data-henkan="continue"]').focus();}
    if(a==='continue')find('#henkan-exit-confirm').hidden=true;
    if(a==='retry'&&lastSession)start(shuffle(lastSession.questions.filter((q,i)=>!lastSession.answers[i].correct)).map(q=>({...q,options:shuffle(q.options)})));
    if(a==='review-prev'||a==='review-next'){reviewPage+=a==='review-next'?1:-1;renderReview();find('.henkan-review').scrollIntoView({block:'start'});}
    if(a==='words-prev'||a==='words-next'){wordPage+=a==='words-next'?1:-1;renderWords();find('.henkan-glossary').scrollIntoView({block:'start'});}
  });
  root.addEventListener('change',e=>{if(active&&!session&&['henkan-level','henkan-count','henkan-time'].includes(e.target.id)){wordPage=0;update();}});
  root.addEventListener('input',e=>{if(!active||session)return;if(e.target.id==='henkan-custom')update();if(e.target.id==='henkan-search'){wordPage=0;renderWords();}});
  return {render,dispose(){active=false;stop();session=null;lastSession=null;}};
}
