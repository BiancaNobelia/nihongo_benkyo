import {DOKKAI_PASSAGES, DOKKAI_SOURCE} from './dokkai-data.js?v=20261016-dokkai';
import {DOKKAI_HISTORY_KEY,dokkaiPlain,dokkaiMarkup,dokkaiPool,mergeDokkaiHistory,recordDokkaiShown,createDokkaiSession,gradeDokkai} from './dokkai-core.js?v=20261016-dokkai';
import {requestedQuizCount} from './quiz-settings.js?v=20261015-jidoushi-tadoushi';

export function createDokkaiView({root,escape,icon,heading,activity,recordSession}) {
  const preferences = {level:'N5',countChoice:'10',customCount:'20',time:0,furigana:false};
  let active=false, session=null, lastSession=null, timer=null, history={}, storageAvailable=true;
  function refreshHistory() {
    // Another tab may have shown new questions since this view was opened.
    try { history=mergeDokkaiHistory(history,JSON.parse(localStorage.getItem(DOKKAI_HISTORY_KEY)),DOKKAI_PASSAGES); } catch { storageAvailable=false; }
  }
  const find = selector => root.querySelector(selector);
  const stop = () => {clearInterval(timer);timer=null;};
  const top = () => window.scrollTo({top:0,behavior:'instant'});
  const total = () => session.groups.reduce((sum,g)=>sum+g.questions.length,0);
  const group = () => session.groups[session.index];
  const completed = () => session.answers.length;
  const sourceMarkup = p => `<details class="dokkai-source"><summary>Sumber bacaan & atribusi</summary><p>Diadaptasi dari <a href="${escape(p.source.url)}" target="_blank" rel="noopener">${escape(p.source.title)} ${icon('arrow-up')}</a> · KCよむよむ. Penulis: ${escape(p.source.author)}. © ${escape(DOKKAI_SOURCE.publisher)}.</p><p><a href="${DOKKAI_SOURCE.licenseUrl}" target="_blank" rel="noopener">${DOKKAI_SOURCE.license}</a> · Penggunaan nonkomersial. ${escape(DOKKAI_SOURCE.changes)}</p><p>Level sumber: ${p.source.originalLevel}. Level ${p.level} di sini adalah perkiraan latihan, bukan penetapan JLPT atau padanan resmi JF Standard. Informasi dalam bacaan mengikuti konteks cerita sumber.</p></details>`;

  function render() {
    stop();active=true;session=null;lastSession=null;
    root.innerHTML=`<div class="dokkai-view"><section class="dokkai-hero"><div><div class="section-kicker">読解 · MEMAHAMI BACAAN</div><h1>Baca ceritanya.<br><em>Temukan maknanya.</em></h1><p>Ikuti alur, temukan informasi penting, dan pahami maksud penulis. Bacaan Jepang dengan pembahasan Indonesia, untuk langkah belajarmu berikutnya.</p><div class="kotoba-metrics"><span><strong>${DOKKAI_PASSAGES.length}</strong> bacaan</span><span><strong>${DOKKAI_PASSAGES.reduce((s,p)=>s+p.questions.length,0)}</strong> soal pemahaman</span><span><strong>N5–N3</strong> latihan bertahap</span></div></div><div class="dokkai-hero-art" aria-hidden="true"><span lang="ja">読む</span><div></div><div></div><div></div><small>SATU BACAAN, BANYAK MAKNA.</small></div></section>
      <div class="dokkai-setup"><section class="kotoba-panel"><div class="kotoba-section-title"><span class="kotoba-step">01</span><div><h2>Pilih level bacaan</h2><p>Mulai dari teks yang terasa nyaman.</p></div></div><div class="dokkai-levels" role="group" aria-label="Level Dokkai">${[['N5','Dasar'],['N4','Berkembang'],['N3','Menengah'],['all','Campuran']].map(([level,label])=>`<button data-dokkai-level="${level}" aria-pressed="${preferences.level===level}"><strong>${level==='all'?'Semua':level}</strong><small>${label}</small></button>`).join('')}</div><p class="dokkai-note">Level merupakan perkiraan kesulitan latihan. Bacaan diringkas dan diadaptasi dari KCよむよむ, Japan Foundation; bukan soal ujian JLPT resmi.</p><div class="dokkai-how"><strong>Baca sekali, pahami utuh.</strong><p>Jawab semua pertanyaan pada satu bacaan, lalu periksa bersama. Setelah itu, arti lengkap, furigana, dan alasan setiap jawaban akan terbuka.</p></div><label class="dokkai-furigana-setting"><input id="dokkai-furigana" type="checkbox" ${preferences.furigana?'checked':''}> Tampilkan furigana sejak awal</label><p class="dokkai-note">Bantuan bacaan juga bisa dinyalakan saat latihan.</p></section>
      <section class="kotoba-panel"><div class="kotoba-section-title"><span class="kotoba-step">02</span><div><h2>Atur latihanmu</h2><p>Jumlah dihitung per pertanyaan.</p></div></div><h3 class="dokkai-setting-label">Jumlah soal</h3><div class="dokkai-pills" role="group" aria-label="Jumlah soal Dokkai">${['10','20','50','custom'].map(value=>`<button data-dokkai-count="${value}" aria-pressed="${preferences.countChoice===value}">${value==='custom'?'Kustom':value}</button>`).join('')}</div><div class="field dokkai-custom" id="dokkai-custom-field" hidden><label for="dokkai-custom">Jumlah soal kustom</label><input id="dokkai-custom" type="number" min="1" step="1" inputmode="numeric" value="${escape(preferences.customCount)}" aria-describedby="dokkai-count-error"><small id="dokkai-count-error" role="alert" hidden>Isi bilangan bulat minimal 1.</small></div><h3 class="dokkai-setting-label">Timer per bacaan</h3><div class="dokkai-pills" role="group" aria-label="Timer Dokkai">${[[0,'∞ Bebas'],[180,'3 menit'],[300,'5 menit']].map(([time,label])=>`<button data-dokkai-time="${time}" aria-pressed="${preferences.time===time}">${label}</button>`).join('')}</div><div id="dokkai-summary" class="kotoba-session-summary" role="status"></div><button class="primary kotoba-start" data-dokkai="start">Mulai kuis Dokkai ${icon('arrow')}</button><p class="dokkai-note">Pertanyaan yang sama tidak diulang dalam satu sesi. Yang belum pernah tampil didahulukan. Hasil tersimpan di Progres Saya.</p></section></div>
      <section class="dokkai-catalog"><div class="section-head"><div><div class="section-kicker">DARI CERITA SEHARI-HARI</div><h2>Bacaan dalam level pilihanmu</h2><p>Perpustakaan, keluarga, budaya, dan sudut pandang orang lain.</p></div></div><div id="dokkai-catalog-list"></div></section><p class="dokkai-source-note">Sumber: <a href="${DOKKAI_SOURCE.url}" target="_blank" rel="noopener">KCよむよむ · Japan Foundation</a> · <a href="${DOKKAI_SOURCE.licenseUrl}" target="_blank" rel="noopener">CC BY-NC 2.1 JP</a>. Teks diadaptasi; soal, terjemahan, dan pembahasan ditambahkan. <a href="./DATA-SOURCES.md" target="_blank" rel="noopener">Catatan sumber</a>.</p></div>`;
    update();
  }

  function update() {
    refreshHistory();
    const pool=dokkaiPool(DOKKAI_PASSAGES,preferences.level),questions=pool.flatMap(p=>p.questions);
    const count=requestedQuizCount(preferences.countChoice,preferences.customCount);
    for (const [attr,key] of [['level','level'],['count','countChoice'],['time','time']]) root.querySelectorAll(`[data-dokkai-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute(`data-dokkai-${attr}`)===String(preferences[key]))));
    find('#dokkai-custom-field').hidden=preferences.countChoice!=='custom';
    find('#dokkai-count-error').hidden=count!==null;find('#dokkai-custom').setAttribute('aria-invalid',String(count===null));
    find('#dokkai-summary').innerHTML=`<strong>${questions.length} soal · ${pool.length} bacaan tersedia</strong><span>${count===null?'Isi jumlah soal yang valid.':`${Math.min(count,questions.length)} soal akan dikerjakan · ${preferences.time?`${preferences.time/60} menit per bacaan`:'Tanpa timer'}`}</span><small>${questions.filter(q=>!history[q.id]).length} soal belum pernah tampil.${count>questions.length?' Jumlah soal disesuaikan dengan bank yang tersedia.':''}${!storageAvailable?' Penyimpanan browser tidak tersedia; riwayat hanya sementara.':''}</small>`;
    find('[data-dokkai="start"]').disabled=count===null||!questions.length;
    find('#dokkai-catalog-list').innerHTML=pool.map(p=>`<article><span class="dokkai-level">${p.level}</span><div><h3 lang="ja">${escape(p.title)}</h3><p>${escape(p.titleId)}</p><small>${p.questions.length} soal · ${dokkaiPlain(p.paragraphs.join('')).length} karakter</small></div><a href="${escape(p.source.url)}" target="_blank" rel="noopener" aria-label="Buka sumber asli ${escape(p.title)}">${icon('arrow-up')}</a></article>`).join('');
  }

  function start(groups=null) {
    stop();
    if (!groups) {update();if(find('[data-dokkai="start"]').disabled)return;groups=createDokkaiSession(DOKKAI_PASSAGES,{level:preferences.level,count:requestedQuizCount(preferences.countChoice,preferences.customCount)},history);}
    if(!groups.length)return;
    session={groups,index:0,answers:[],selected:{},answered:false,time:preferences.time,level:preferences.level,furigana:preferences.furigana};lastSession=null;
    activity();renderGroup();
  }

  function passageMarkup(p,furigana) {
    return p.paragraphs.map((text,i)=>`<p><span class="dokkai-paragraph-number" aria-label="Paragraf ${i+1}">${i+1}</span><span>${dokkaiMarkup(text,escape,furigana)}</span></p>`).join('');
  }
  function translationMarkup(p) {
    return `<div class="dokkai-translation"><h3>Arti bacaan</h3>${p.translation.map((text,i)=>`<p><span>${i+1}</span>${escape(text)}</p>`).join('')}<h3>Kosakata kunci</h3><dl>${p.glossary.map(([word,reading,meaning])=>`<div><dt lang="ja">${escape(word)} <small>${escape(reading)}</small></dt><dd>${escape(meaning)}</dd></div>`).join('')}</dl></div>`;
  }
  function renderGroup() {
    stop();session.answered=false;session.selected={};
    const g=group(),p=g.passage;
    refreshHistory();
    history=recordDokkaiShown(history,g.questions);
    try {localStorage.setItem(DOKKAI_HISTORY_KEY,JSON.stringify(history));} catch {storageAvailable=false;}
    root.innerHTML=`<div class="dokkai-session">${heading('KUIS DOKKAI','Pahami cerita, temukan jawabannya.',`${p.level} · Bacaan ${session.index+1} dari ${session.groups.length}`)}<div class="study-top"><span><strong>${completed()}</strong> / ${total()} soal diperiksa</span><span id="dokkai-timer" role="timer">${session.time?`${session.time/60}:00 per bacaan`:'Tanpa timer'}</span></div><div class="progress-track" role="progressbar" aria-label="Progres kuis Dokkai" aria-valuemin="0" aria-valuemax="${total()}" aria-valuenow="${completed()}"><span style="width:${completed()/total()*100}%"></span></div>
      <div class="dokkai-reading-layout"><section class="dokkai-reading"><div class="dokkai-reading-head"><span class="dokkai-level">${p.level} · 読解</span><button class="dokkai-furigana-button" data-dokkai="furigana" aria-pressed="${session.furigana}">Furigana ${session.furigana?'ON':'OFF'}</button></div><h2 lang="ja" tabindex="-1">${escape(p.title)}</h2><div id="dokkai-passage" class="dokkai-passage" lang="ja">${passageMarkup(p,session.furigana)}</div><div id="dokkai-translation" hidden></div>${sourceMarkup(p)}</section>
      <section class="dokkai-question-panel" aria-label="Pertanyaan bacaan"><div class="dokkai-question-intro"><strong>Temukan jawabannya di dalam teks.</strong><p>Pilih jawaban untuk ${g.questions.length} pertanyaan berikut, lalu periksa bersama.</p></div>${g.questions.map((q,i)=>`<article class="dokkai-question"><span class="section-kicker">SOAL ${completed()+i+1}</span><h3 lang="ja">${dokkaiMarkup(q.prompt,escape)}</h3><div class="dokkai-options" role="group" aria-label="Pilihan soal ${completed()+i+1}">${q.options.map((option,j)=>`<button class="quiz-option" data-dokkai-question="${q.id}" data-dokkai-option="${option.id}" aria-pressed="false"><span>${'ABCD'[j]}</span><span lang="ja">${dokkaiMarkup(option.text,escape)}</span></button>`).join('')}</div><div id="dokkai-feedback-${q.id}" class="dokkai-feedback" hidden></div></article>`).join('')}<div id="dokkai-submit-status" role="status" class="dokkai-submit-status">0 / ${g.questions.length} jawaban dipilih</div><button class="primary dokkai-submit" data-dokkai="submit" disabled>Periksa jawaban ${icon('check')}</button><button class="primary dokkai-submit" data-dokkai="next" hidden>${session.index===session.groups.length-1?'Lihat hasil':'Bacaan berikutnya'} ${icon('arrow')}</button></section></div>
      <button class="text-button dokkai-exit" data-dokkai="exit">Akhiri latihan</button><div id="dokkai-exit-confirm" hidden><div class="kotoba-exit-box"><p>Akhiri sesi ini? Skor sesi yang belum selesai tidak disimpan. Riwayat pertanyaan yang sudah tampil tetap diingat.</p><button class="secondary" data-dokkai="continue">Lanjutkan kuis</button><button class="primary" data-dokkai="setup">Akhiri sesi</button></div></div>${!storageAvailable?'<p class="dokkai-note">Riwayat hanya tersimpan sementara selama halaman ini terbuka.</p>':''}</div>`;
    top();find('.dokkai-reading h2').focus({preventScroll:true});
    if(session.time){session.deadline=Date.now()+session.time*1000;timer=setInterval(()=>{if(!session||session.answered)return;const left=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));find('#dokkai-timer').textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')} · bacaan ini`;if(!left)submit(true);},250);}
  }

  function feedbackMarkup(q,p,result) {
    const answer=q.options.find(option=>option.id===q.answer),chosen=q.options.find(option=>option.id===result.chosen);
    return `<p class="dokkai-answer-status ${result.correct?'success':'error'}">${icon(result.correct?'check':'close')} ${result.correct?'Benar':result.chosen===null?'Belum dijawab':'Belum tepat'}</p><p><strong>Arti pertanyaan:</strong> ${escape(q.meaning)}</p>${!result.correct?`<p>Jawabanmu: ${chosen?`${escape(dokkaiPlain(chosen.text))} — ${escape(chosen.translation)}`:'Tidak dijawab'}</p>`:''}<p><strong>Jawaban tepat:</strong> <span lang="ja">${dokkaiMarkup(answer.text,escape,true)}</span> — ${escape(answer.translation)}</p><p>${escape(q.explanation)}</p><blockquote><span>BUKTI · PARAGRAF ${q.evidence+1}</span><p lang="ja">${dokkaiMarkup(p.paragraphs[q.evidence],escape,true)}</p></blockquote>`;
  }

  function submit(timedOut=false) {
    if(!session||session.answered)return;
    if(session.time&&Date.now()>=session.deadline)timedOut=true;
    const g=group();
    if(!timedOut&&g.questions.some(q=>session.selected[q.id]===undefined))return;
    stop();session.answered=true;
    const results=gradeDokkai(g,session.selected);session.answers.push(...results);
    for(const q of g.questions){const result=results.find(a=>a.id===q.id);root.querySelectorAll(`[data-dokkai-question="${q.id}"]`).forEach(button=>{button.disabled=true;button.classList.toggle('correct',button.dataset.dokkaiOption===q.answer);button.classList.toggle('wrong',button.dataset.dokkaiOption===result.chosen&&!result.correct);});const feedback=find(`#dokkai-feedback-${q.id}`);feedback.innerHTML=feedbackMarkup(q,g.passage,result);feedback.hidden=false;}
    find('#dokkai-passage').innerHTML=passageMarkup(g.passage,true);
    const toggle=find('[data-dokkai="furigana"]');toggle.textContent='Furigana ON';toggle.setAttribute('aria-pressed','true');toggle.disabled=true;
    find('#dokkai-translation').innerHTML=translationMarkup(g.passage);find('#dokkai-translation').hidden=false;
    find('#dokkai-submit-status').textContent=`${timedOut?'Waktu habis. ':''}${results.filter(a=>a.correct).length} / ${g.questions.length} benar. Arti dan pembahasan sudah terbuka.`;
    find('[data-dokkai="submit"]').hidden=true;find('[data-dokkai="next"]').hidden=false;
    find('.study-top>span:first-child').innerHTML=`<strong>${completed()}</strong> / ${total()} soal diperiksa`;
    find('.progress-track').setAttribute('aria-valuenow',String(completed()));find('.progress-track>span').style.width=`${completed()/total()*100}%`;
    find('#dokkai-timer').textContent=timedOut?'Waktu bacaan habis':'Bacaan sudah diperiksa';activity();
    // Move to the first explanation so the new content is visible on narrow screens.
    const first=find(`#dokkai-feedback-${g.questions[0].id}`);first.setAttribute('tabindex','-1');first.focus({preventScroll:true});first.scrollIntoView({block:'start',behavior:'instant'});
  }

  function finish() {
    stop();const correct=session.answers.filter(a=>a.correct).length,count=total();
    recordSession({date:new Date().toISOString(),correct,total:count,mode:'dokkai',level:session.level});
    lastSession=session;session=null;
    root.innerHTML=`<div class="dokkai-session"><div class="results"><div class="section-kicker">LATIHAN DOKKAI SELESAI</div><div class="result-circle">${Math.round(correct/count*100)}%<small>JAWABAN BENAR</small></div><h1>Makin paham alur ceritanya.</h1><p>${correct} dari ${count} jawaban benar · ${lastSession.groups.length} bacaan</p><div class="result-buttons"><button class="primary" data-dokkai="setup">Latihan baru ${icon('arrow')}</button>${correct<count?'<button class="secondary" data-dokkai="retry">Ulangi yang salah</button>':''}<a class="text-button" href="#progres">Lihat progres ${icon('arrow')}</a></div></div><section class="dokkai-review"><h2>Tinjau bacaan dan jawabanmu</h2>${lastSession.groups.map(g=>`<details><summary><span>${g.passage.level}</span><strong lang="ja">${escape(g.passage.title)}</strong><small>${g.questions.filter(q=>lastSession.answers.find(a=>a.id===q.id)?.correct).length}/${g.questions.length} benar</small></summary><div class="dokkai-passage" lang="ja">${passageMarkup(g.passage,true)}</div>${translationMarkup(g.passage)}${g.questions.map(q=>`<article class="dokkai-review-question"><h3 lang="ja">${dokkaiMarkup(q.prompt,escape,true)}</h3>${feedbackMarkup(q,g.passage,lastSession.answers.find(a=>a.id===q.id))}</article>`).join('')}${sourceMarkup(g.passage)}</details>`).join('')}</section></div>`;top();
  }

  root.addEventListener('click',event=>{
    if(!active)return;const button=event.target.closest('button');if(!button||button.disabled)return;
    if(!session&&['dokkaiLevel','dokkaiCount','dokkaiTime'].some(key=>button.dataset[key]!==undefined)) {
      if(button.dataset.dokkaiLevel)preferences.level=button.dataset.dokkaiLevel;
      if(button.dataset.dokkaiCount)preferences.countChoice=button.dataset.dokkaiCount;
      if(button.dataset.dokkaiTime!==undefined)preferences.time=Number(button.dataset.dokkaiTime);
      update();return;
    }
    if(button.dataset.dokkaiQuestion&&session&&!session.answered){
      if(session.time&&Date.now()>=session.deadline){submit(true);return;}
      const id=button.dataset.dokkaiQuestion;session.selected[id]=button.dataset.dokkaiOption;
      root.querySelectorAll(`[data-dokkai-question="${id}"]`).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const selected=Object.keys(session.selected).length;find('#dokkai-submit-status').textContent=`${selected} / ${group().questions.length} jawaban dipilih`;
      find('[data-dokkai="submit"]').disabled=selected!==group().questions.length;return;
    }
    const action=button.dataset.dokkai;
    if(action==='start')start();
    if(action==='submit')submit();
    if(action==='furigana'&&session&&!session.answered){session.furigana=!session.furigana;find('#dokkai-passage').innerHTML=passageMarkup(group().passage,session.furigana);button.textContent=`Furigana ${session.furigana?'ON':'OFF'}`;button.setAttribute('aria-pressed',String(session.furigana));}
    if(action==='next'&&session?.answered){session.index++;if(session.index===session.groups.length)finish();else renderGroup();}
    if(action==='setup'){render();top();}
    if(action==='exit'&&session){find('#dokkai-exit-confirm').hidden=false;find('[data-dokkai="continue"]').focus();}
    if(action==='continue')find('#dokkai-exit-confirm').hidden=true;
    if(action==='retry'&&lastSession){const incorrect=new Set(lastSession.answers.filter(a=>!a.correct).map(a=>a.id));start(lastSession.groups.map(g=>({...g,questions:g.questions.filter(q=>incorrect.has(q.id))})).filter(g=>g.questions.length));}
  });
  root.addEventListener('input',event=>{if(active&&!session&&event.target.id==='dokkai-custom'){preferences.customCount=event.target.value;update();}});
  root.addEventListener('change',event=>{if(active&&!session&&event.target.id==='dokkai-furigana')preferences.furigana=event.target.checked;});
  return {render,dispose(){active=false;stop();session=null;lastSession=null;}};
}
