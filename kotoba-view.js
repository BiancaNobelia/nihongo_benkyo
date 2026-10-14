import { KOTOBA_COURSES, KOTOBA_SOURCE_GROUPS, kotobaCourse } from './kotoba-courses.js?v=20261014-kotoba-n3';
import { ALL_CHAPTERS, KOTOBA_MODES, getKotobaPool, createKotobaQuiz, chapterLabel, matchingVoice } from './kotoba-core.js?v=20261014-kotoba-n3';
import { requestedQuizCount } from './quiz-settings.js?v=20261014-kotoba-n3';
import { shuffle } from './core.js?v=20261014-kotoba-n3';

export function createKotobaView({root,escape,icon,heading,activity,recordSession}) {
  let course=kotobaCourse('minna');
  const preferences={course:'minna',chapters:[...ALL_CHAPTERS],sourceGroup:'all',type:'all',mode:'jp-id',countChoice:'10',customCount:'30',time:0};
  const courseSelections=new Map();
  const speech=window.speechSynthesis;
  const canSpeak=Boolean(speech && window.SpeechSynthesisUtterance);
  let active=false, session=null, timer=null, speechToken=0, reviewPage=0, lastSession=null;
  const find=selector=>root.querySelector(selector);
  const countText=n=>n.toLocaleString('id-ID');
  const voice=language=>canSpeak ? matchingVoice(speech.getVoices(),language) : null;
  const selectedPool=()=>getKotobaPool(course.entries,preferences);
  const scopeLabel=(value=preferences)=>value.course==='n3' ? `JLPT N3 · ${KOTOBA_SOURCE_GROUPS[value.sourceGroup] || KOTOBA_SOURCE_GROUPS.all}` : chapterLabel(value.chapters);
  const wordScope=q=>q.levels.includes('N3') ? `JLPT N3 · ${q.sourceGroups.map(g=>KOTOBA_SOURCE_GROUPS[g]).join(', ')}` : chapterLabel(q.chapters);
  const stopSpeech=()=>{speechToken++; if(canSpeak) speech.cancel();};
  const stop=()=>{clearInterval(timer);timer=null;stopSpeech();};

  function render(courseId=preferences.course) {
    const next=kotobaCourse(courseId);
    if(next.id!==course.id) {
      courseSelections.set(course.id,{chapters:preferences.chapters,type:preferences.type,sourceGroup:preferences.sourceGroup});
      Object.assign(preferences,{course:next.id,chapters:next.id==='minna' ? [...ALL_CHAPTERS] : null,type:'all',sourceGroup:'all'},courseSelections.get(next.id));
      course=next;
    }
    const isN3=course.id==='n3';
    const types=[...new Set(course.entries.map(e=>e.type))];
    stop(); active=true;session=null;lastSession=null;
    root.innerHTML=`<div class="kotoba-view">
      <nav class="kotoba-courses" aria-label="Materi kuis kotoba">${Object.values(KOTOBA_COURSES).map(c=>`<a href="#kotoba/${c.id}" ${c.id===course.id ? 'aria-current="page"' : ''}><strong>${c.short}</strong><span>${c.subtitle} · ${countText(c.entries.length)} entri</span></a>`).join('')}</nav>
      <section class="kotoba-hero"><div><div class="section-kicker">KOTOBA · ${course.label.toUpperCase()}</div><h1>${isN3 ? 'Selangkah lebih jauh.<br><em>Kuasai kosakata N3.</em>' : 'Tambah kata.<br><em>Tambah percaya diri.</em>'}</h1><p>${isN3 ? 'Latih kosakata N3 dari kompilasi belajarmu. Kenali arti, baca kanjinya, dan uji ingatanmu dalam lima mode latihan.' : 'Latih arti, bacaan, dan ingatanmu. Pilih bab yang sedang kamu pelajari, lalu mulai dari beberapa kata.'}</p><div class="kotoba-metrics"><span><strong>${countText(course.entries.length)}</strong> entri latihan</span><span><strong>${isN3 ? 'N3' : course.chapters.length}</strong> ${isN3 ? 'level latihan' : 'bab'}</span><span><strong>${types.length}</strong> kategori kata</span></div></div><div class="kotoba-hero-art" aria-hidden="true"><span>ことば</span><strong lang="ja">${isN3 ? '知識' : '言葉'}</strong><small>${isN3 ? 'KOTOBA JLPT N3' : 'SATU KATA, SATU LANGKAH'}</small></div></section>
      <div class="kotoba-layout"><section class="kotoba-panel kotoba-chapters"><div class="kotoba-section-title"><span class="kotoba-step">01</span><div><h2>${isN3 ? 'Pilih kosakata N3' : 'Pilih bab belajarmu'}</h2><p>${isN3 ? 'Latih semua kata atau fokus pada bagian tertentu.' : 'Bisa satu bab, beberapa bab, atau seluruh buku.'}</p></div></div>
        ${isN3 ? `<div class="field kotoba-source-field"><label for="kotoba-source-group">Cakupan kosakata</label><select id="kotoba-source-group">${Object.entries(KOTOBA_SOURCE_GROUPS).map(([id,label])=>`<option value="${id}">${label} · ${countText(course.entries.filter(e=>id==='all' || e.sourceGroup===id).length)} entri</option>`).join('')}</select><small>Inti berasal dari OpenJLPT/JMdict. Tambahan mengikuti daftar pelengkap dalam kompilasi.</small></div><div class="kotoba-selection"><span id="kotoba-selection" role="status"></span></div>` : `
        <div class="kotoba-ranges" aria-label="Pilihan rentang bab">${[['1-50','Semua bab'],['1-25','Buku I · 1–25'],['26-50','Buku II · 26–50'],['1-10','1–10'],['11-20','11–20'],['21-25','21–25'],['26-35','26–35'],['36-45','36–45'],['46-50','46–50']].map(([range,label])=>`<button data-kotoba-range="${range}" aria-pressed="false">${label}</button>`).join('')}</div>
        <div class="kotoba-chapter-grid" aria-label="Bab latihan">${course.chapters.map(c=>`<button data-kotoba-chapter="${c.number}" aria-pressed="false" aria-label="Bab ${c.number}, ${c.count} kosakata" title="${escape(c.title)}"><small>BAB</small><strong>${c.number}</strong><span>${c.count} kata</span></button>`).join('')}</div>
        <div class="kotoba-selection"><span id="kotoba-selection" role="status"></span><button class="text-button" data-kotoba="clear-chapters">Kosongkan</button></div>`}
        <div class="field"><label for="kotoba-type">Jenis kata</label><select id="kotoba-type"><option value="all">Semua jenis kata</option>${types.map(t=>`<option value="${escape(t)}">${escape(t[0].toUpperCase()+t.slice(1))}</option>`).join('')}</select></div>
        <details class="kotoba-glossary"><summary>Lihat kosakata dalam pilihan ini</summary><label for="kotoba-search">Cari kata, bacaan, atau arti</label><input id="kotoba-search" type="search" placeholder="Misalnya: belajar, 学生, がくせい"><div id="kotoba-word-list"></div></details>
      </section><section class="kotoba-panel kotoba-settings"><div class="kotoba-section-title"><span class="kotoba-step">02</span><div><h2>Atur latihanmu</h2><p>Pilih cara yang ingin kamu latih.</p></div></div>
        <div class="kotoba-modes" aria-label="Mode latihan kotoba">${Object.entries(KOTOBA_MODES).map(([id,m])=>`<button data-kotoba-mode="${id}" aria-pressed="false"><strong>${m.short}</strong><span>${m.label}</span></button>`).join('')}</div>
        <p class="kotoba-audio-note" id="kotoba-audio-note"></p>
        <div class="kotoba-fields"><div class="field"><label for="kotoba-count">Jumlah soal</label><select id="kotoba-count"><option value="10">10 soal</option><option value="20">20 soal</option><option value="50">50 soal</option><option value="custom">Custom · Isi sendiri</option></select></div><div class="field"><label for="kotoba-time">Waktu per soal</label><select id="kotoba-time"><option value="0">Santai, tanpa timer</option><option value="15">15 detik</option><option value="30">30 detik</option></select></div></div>
        <div class="field kotoba-custom" id="kotoba-custom-field" hidden><label for="kotoba-custom">Jumlah soal custom</label><input id="kotoba-custom" type="number" min="1" step="1" inputmode="numeric" aria-describedby="kotoba-count-error"><small id="kotoba-count-error" role="alert" hidden>Isi bilangan bulat minimal 1.</small></div>
        <div class="kotoba-session-summary" id="kotoba-session-summary" role="status"></div>
        <button class="primary kotoba-start" data-kotoba="start">Mulai kuis kotoba ${icon('arrow')}</button><p class="kotoba-small">Arti dan bacaan ditampilkan setelah setiap jawaban. Hasil sesi tersimpan di Progres Saya pada browser ini.</p>
      </section></div><p class="kotoba-source-note">${isN3 ? 'Materi mengikuti kompilasi N3 dari OpenJLPT, Open Anki, dan Waller. Arti Indonesia berasal dari terjemahan otomatis dengan sejumlah koreksi; arti Inggris rujukan tersedia setelah menjawab. Pengelompokan level mengikuti sumber komunitas.' : 'Materi mengikuti seluruh kompilasi latihan Bab 1–50 yang diberikan, bukan daftar resmi lengkap Minna no Nihongo.'} <a href="./DATA-SOURCES.md" target="_blank" rel="noopener">Tentang sumber materi ${icon('arrow-up')}</a></p></div>`;
    if(isN3) find('#kotoba-source-group').value=preferences.sourceGroup;
    find('#kotoba-type').value=preferences.type;
    find('#kotoba-count').value=preferences.countChoice;
    find('#kotoba-custom').value=preferences.customCount;
    find('#kotoba-time').value=String(preferences.time);
    updateSetup();
  }

  function updateVoices() {
    if(!active || session || !find('#kotoba-audio-note')) return;
    for(const [id,m] of Object.entries(KOTOBA_MODES)) {
      const button=find(`[data-kotoba-mode="${id}"]`);
      button.disabled=Boolean(m.audio && !voice(m.audio));
      button.title=button.disabled ? `Suara ${m.audio==='ja' ? 'Jepang' : 'Indonesia'} belum tersedia di perangkat ini.` : '';
    }
    const missing=[!voice('ja') && 'Jepang',!voice('id') && 'Indonesia'].filter(Boolean);
    find('#kotoba-audio-note').textContent=missing.length ? `Mode dengar ${missing.join(' dan ')} belum tersedia di perangkat ini. Tiga mode teks tetap bisa digunakan.` : 'Mode dengar memakai suara perangkat. Tekan tombol dengarkan saat soal muncul; timer dimulai setelah audio pertama selesai.';
  }

  function updateSetup() {
    preferences.type=find('#kotoba-type').value;
    preferences.countChoice=find('#kotoba-count').value;
    preferences.customCount=find('#kotoba-custom').value;
    preferences.time=Number(find('#kotoba-time').value);
    preferences.sourceGroup=find('#kotoba-source-group')?.value || 'all';
    const selected=new Set(preferences.chapters);
    root.querySelectorAll('[data-kotoba-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(selected.has(Number(b.dataset.kotobaChapter)))));
    root.querySelectorAll('[data-kotoba-range]').forEach(b=>{
      const [start,end]=b.dataset.kotobaRange.split('-').map(Number);
      b.setAttribute('aria-pressed',String(selected.size===end-start+1 && ALL_CHAPTERS.slice(start-1,end).every(n=>selected.has(n))));
    });
    root.querySelectorAll('[data-kotoba-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kotobaMode===preferences.mode)));
    find('#kotoba-selection').textContent=course.id==='n3' ? scopeLabel() : selected.size ? `${selected.size} bab dipilih · ${chapterLabel(preferences.chapters)}` : 'Pilih minimal satu bab untuk memulai.';
    const pool=selectedPool();
    const count=requestedQuizCount(preferences.countChoice,preferences.customCount);
    const rawCount=course.entries.filter(e=>(course.id==='n3' || selected.has(e.chapter)) && (preferences.type==='all' || e.type===preferences.type) && (preferences.sourceGroup==='all' || e.sourceGroup===preferences.sourceGroup)).length;
    find('#kotoba-custom-field').hidden=preferences.countChoice!=='custom';
    find('#kotoba-count-error').hidden=count!==null;
    find('#kotoba-custom').setAttribute('aria-invalid',String(count===null));
    find('#kotoba-session-summary').innerHTML=`<strong>${countText(pool.length)} kosakata tersedia</strong><span>${count===null ? 'Isi jumlah soal yang valid.' : !pool.length ? 'Tidak ada kosakata untuk pilihan ini. Coba cakupan atau jenis kata lain.' : `${Math.min(count,pool.length)} soal acak · ${preferences.time ? `${preferences.time} detik per soal` : 'Tanpa timer'}`}</span><small>${preferences.mode==='reading' ? 'Mode bacaan hanya memakai kata dengan penulisan kanji.' : rawCount>pool.length ? 'Kata yang sama antarbab digabung agar tidak berulang dalam satu sesi.' : 'Kosakata soal mengikuti materi dan jenis kata pilihanmu.'}${count>pool.length && pool.length ? ' Jumlah soal disesuaikan dengan kosakata yang tersedia.' : ''}</small>`;
    updateVoices();
    const mode=KOTOBA_MODES[preferences.mode];
    find('[data-kotoba="start"]').disabled=count===null || !pool.length || Boolean(mode.audio && !voice(mode.audio));
    updateWordList();
  }

  function updateWordList() {
    const search=find('#kotoba-search').value.trim().toLocaleLowerCase('id');
    const pool=selectedPool().filter(q=>[q.word,q.reading,q.meaning].join(' ').toLocaleLowerCase('id').includes(search));
    find('#kotoba-word-list').innerHTML=`<p class="kotoba-small">${countText(pool.length)} kosakata${pool.length>60 ? ' · Menampilkan 60 pertama; ketik untuk mencari kata lainnya.' : ''}</p><div class="kotoba-word-list">${pool.slice(0,60).map(q=>`<div><span lang="ja"><strong>${escape(q.word)}</strong>${q.word!==q.reading ? `<small>${escape(q.reading)}</small>` : ''}</span><span>${escape(q.meaning)}<small>${wordScope(q)} · ${escape(q.types.join(', '))}</small></span></div>`).join('') || '<p>Tidak ada kata yang cocok.</p>'}</div>`;
  }

  function start(questions=null) {
    stop();
    if(!questions) {
      updateSetup();
      if(find('[data-kotoba="start"]').disabled) return;
      const count=requestedQuizCount(preferences.countChoice,preferences.customCount);
      questions=createKotobaQuiz(course.entries,{...preferences,count});
    }
    if(!questions.length) return;
    session={mode:preferences.mode,questions,index:0,answers:[],answered:false,time:preferences.time,
      course:course.id,sourceGroup:preferences.sourceGroup,chapters:[...(preferences.chapters || [])],type:preferences.type,deadline:null};
    lastSession=null; activity(); renderQuestion();
  }

  function startTimer() {
    if(!session || session.answered || session.deadline || !session.time) return;
    session.deadline=Date.now()+session.time*1000;
    timer=setInterval(()=>{
      if(!session || session.answered) return;
      const remaining=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));
      const label=find('#kotoba-timer'); if(label) label.textContent=`${remaining} dtk`;
      if(!remaining) answer(null);
    },250);
  }

  function renderQuestion() {
    stop();session.answered=false;session.deadline=null;session.audioReady=false;
    const q=session.questions[session.index], mode=KOTOBA_MODES[session.mode];
    root.innerHTML=`<div class="study-panel kotoba-session">${heading('KUIS KOTOBA',mode.label,`${scopeLabel(session)} · ${escape(session.type==='all' ? 'Semua jenis kata' : session.type)}`)}
      <div class="study-top"><span>Soal <strong>${session.index+1}</strong> / ${session.questions.length}</span><span id="kotoba-timer" role="timer">${session.time ? mode.audio ? 'Timer setelah audio' : `${session.time} dtk` : 'Tanpa timer'}</span></div><div class="progress-track" role="progressbar" aria-label="Progres kuis kotoba" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index}"><span style="width:${session.index/session.questions.length*100}%"></span></div>
      <div class="quiz-question kotoba-question"><div class="kotoba-question-tags"><span>${wordScope(q)}</span><span>${escape(q.types.join(' · '))}</span></div><p class="quiz-caption">${mode.caption}</p>
        <div class="kotoba-prompt ${session.mode==='id-jp' ? 'kotoba-meaning-prompt' : ''}" tabindex="-1" ${mode.audio ? '' : `lang="${session.mode==='id-jp' ? 'id' : 'ja'}"`}>${mode.audio ? `<button class="kotoba-listen" data-kotoba="listen">${icon('speaker')}<span>Dengarkan soal</span></button><p id="kotoba-speech-status" class="kotoba-small" role="status">Tekan untuk memutar suara.</p>` : escape(q.prompt)}</div>
        ${session.mode==='jp-id' && q.word!==q.reading ? `<p class="kotoba-prompt-reading" lang="ja">${escape(q.reading)}</p>` : ''}
        <div class="quiz-options kotoba-options ${mode.answerLanguage==='id' ? 'kotoba-meaning-options' : ''}">${q.options.map((a,i)=>`<button class="quiz-option" data-kotoba-answer="${i}" ${mode.audio ? 'disabled' : ''}><span>${'ABCD'[i]}</span><span lang="${mode.answerLanguage}">${escape(a)}</span></button>`).join('')}</div>
        <div class="quiz-feedback" id="kotoba-feedback" role="status">${mode.audio ? 'Dengarkan soal untuk membuka pilihan jawaban.' : 'Pilih satu jawaban yang paling tepat.'}</div>
      </div><div class="quiz-next"><button class="text-button" data-kotoba="exit">Akhiri latihan</button><button class="primary" data-kotoba="next" disabled>${session.index===session.questions.length-1 ? 'Lihat hasil' : 'Soal berikutnya'} ${icon('arrow')}</button></div><div id="kotoba-exit-confirm" hidden></div></div>`;
    window.scrollTo({top:0,behavior:'instant'});find('.kotoba-prompt').focus({preventScroll:true});
    if(!mode.audio) startTimer();
  }

  function speak(text,language,questionAudio=false) {
    const selectedVoice=voice(language);
    const status=find('#kotoba-speech-status');
    if(!selectedVoice) { if(status)status.textContent='Suara bahasa ini belum tersedia. Akhiri latihan untuk memilih mode teks.'; return; }
    stopSpeech(); const token=speechToken;
    const currentSession=session, currentIndex=session?.index;
    const current=()=>active && token===speechToken && session===currentSession && session?.index===currentIndex;
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.voice=selectedVoice;utterance.lang=selectedVoice.lang;utterance.rate=language==='ja' ? .85 : .95;
    utterance.onstart=()=>{
      if(!current()) return;
      if(status) status.textContent='Sedang memutar suara…';
      if(questionAudio && session && !session.answered) {
        session.audioReady=true;
        root.querySelectorAll('[data-kotoba-answer]').forEach(b=>b.disabled=false);
      }
    };
    utterance.onend=()=>{
      if(!current()) return;
      if(status) status.textContent='Kamu bisa mendengarkan lagi.';
      if(questionAudio) startTimer();
    };
    utterance.onerror=()=>{
      if(!current()) return;
      if(status)status.textContent='Audio gagal diputar. Coba dengarkan lagi atau akhiri latihan untuk memilih mode teks.';
      if(questionAudio && session?.audioReady) startTimer();
    };
    try { speech.speak(utterance); } catch { utterance.onerror(); }
  }

  function detail(q) {
    return `<div class="answer-details"><div class="answer-word"><span>Kosakata & bacaan</span><strong lang="ja">${escape(q.word)}${q.word!==q.reading ? `<span class="answer-reading">（${escape(q.reading)}）</span>` : ''}</strong></div><div class="answer-meaning"><span>Arti Indonesia</span><p>${escape(q.meaning)}</p></div>${q.meaningsEn.length ? `<details class="kotoba-reference"><summary>Arti Inggris rujukan</summary><p lang="en">${escape(q.meaningsEn.join("; "))}</p></details>` : ''}<p class="kotoba-detail-meta">${wordScope(q)} · ${escape(q.types.join(' · '))}</p></div>`;
  }

  function answer(index) {
    if(!session || session.answered) return;
    if(KOTOBA_MODES[session.mode].audio && !session.audioReady) return;
    if(index!==null && session.deadline && Date.now()>=session.deadline) index=null;
    const q=session.questions[session.index], chosen=index===null ? null : q.options[index];
    session.answered=true;stop();session.answers.push({chosen,correct:chosen===q.answer});
    root.querySelectorAll('[data-kotoba-answer]').forEach(b=>{
      b.disabled=true;const value=q.options[Number(b.dataset.kotobaAnswer)];
      b.classList.toggle('correct',value===q.answer);b.classList.toggle('wrong',value===chosen && value!==q.answer);
    });
    const feedback=find('#kotoba-feedback');
    feedback.className=`quiz-feedback ${chosen===q.answer ? 'success' : 'error'}`;
    feedback.innerHTML=`<p class="answer-status">${chosen===q.answer ? 'Tepat! Kamu sudah mengenali kata ini.' : chosen===null ? 'Waktunya habis. Yuk, pahami jawabannya.' : 'Belum tepat. Yuk, ingat lagi kata ini.'}</p><p>Jawaban benar: <strong lang="${KOTOBA_MODES[session.mode].answerLanguage}">${escape(q.answer)}</strong></p>${detail(q)}${voice('ja') ? `<button class="text-button" data-kotoba="pronounce">${icon('speaker')} Dengarkan pelafalan</button>` : ''}`;
    find('[data-kotoba="next"]').disabled=false;
    feedback.scrollIntoView({block:'nearest',behavior:'smooth'});
  }

  function finish() {
    stop(); const correct=session.answers.filter(a=>a.correct).length;
    const total=session.questions.length;
    recordSession({date:new Date().toISOString(),correct,total,mode:`kotoba-${session.mode}`,course:session.course,sourceGroup:session.sourceGroup,chapters:session.chapters,type:session.type});
    lastSession=session;session=null;reviewPage=0;
    root.innerHTML=`<div class="study-panel kotoba-results"><div class="results"><div class="section-kicker">LATIHAN KOTOBA SELESAI</div><div class="result-circle">${Math.round(correct/total*100)}%<small>JAWABAN BENAR</small></div><h1>${correct===total ? 'Semua kata berhasil kamu kenali!' : 'Sedikit demi sedikit, makin ingat.'}</h1><p>${correct} dari ${total} jawaban benar · ${scopeLabel(lastSession)}</p><div class="result-buttons"><button class="primary" data-kotoba="setup">Latihan baru ${icon('arrow')}</button>${correct<total ? '<button class="secondary" data-kotoba="retry-wrong">Ulangi yang salah</button>' : ''}<a href="#progres" class="text-button">Lihat progres ${icon('arrow')}</a></div></div><section class="kotoba-review"><h2>Tinjau jawabanmu</h2><div id="kotoba-review-list"></div><div class="kotoba-review-pagination"><button class="secondary" data-kotoba="review-prev">Sebelumnya</button><span id="kotoba-review-page"></span><button class="secondary" data-kotoba="review-next">Berikutnya</button></div></section></div>`;
    renderReview();window.scrollTo({top:0,behavior:'instant'});
  }

  function renderReview() {
    const total=lastSession.questions.length, pages=Math.ceil(total/10);
    find('#kotoba-review-list').innerHTML=lastSession.questions.slice(reviewPage*10,reviewPage*10+10).map((q,i)=>{
      const a=lastSession.answers[reviewPage*10+i];
      return `<article class="kotoba-review-item ${a.correct ? '' : 'incorrect'}"><div class="kotoba-review-status">${icon(a.correct ? 'check' : 'close')}<span>Soal ${reviewPage*10+i+1} · ${a.correct ? 'Benar' : a.chosen===null ? 'Waktu habis' : 'Belum tepat'}</span></div>${a.correct ? '' : `<p>Jawabanmu: <strong>${escape(a.chosen || 'Tidak dijawab')}</strong></p>`}${detail(q)}</article>`;
    }).join('');
    find('#kotoba-review-page').textContent=`${reviewPage+1} / ${pages}`;
    find('[data-kotoba="review-prev"]').disabled=reviewPage===0;
    find('[data-kotoba="review-next"]').disabled=reviewPage===pages-1;
  }

  root.addEventListener('click',e=>{
    if(!active) return;
    const b=e.target.closest('button');if(!b || b.disabled)return;
    if(b.dataset.kotobaChapter) {
      const chapter=Number(b.dataset.kotobaChapter);
      preferences.chapters=preferences.chapters.includes(chapter) ? preferences.chapters.filter(n=>n!==chapter) : [...preferences.chapters,chapter];
      updateSetup(); return;
    }
    if(b.dataset.kotobaRange) {
      const [start,end]=b.dataset.kotobaRange.split('-').map(Number);
      preferences.chapters=ALL_CHAPTERS.slice(start-1,end);updateSetup();return;
    }
    if(b.dataset.kotobaMode) {preferences.mode=b.dataset.kotobaMode;updateSetup();return;}
    if(b.dataset.kotobaAnswer!==undefined) {answer(Number(b.dataset.kotobaAnswer));return;}
    const action=b.dataset.kotoba;
    if(action==='clear-chapters') {preferences.chapters=[];updateSetup();}
    if(action==='start') start();
    if(action==='listen' && session) speak(session.questions[session.index].audioText,KOTOBA_MODES[session.mode].audio,true);
    if(action==='pronounce' && session?.answered) speak(session.questions[session.index].reading,'ja');
    if(action==='next' && session?.answered) {session.index++;if(session.index===session.questions.length)finish();else renderQuestion();}
    if(action==='exit') {
      find('#kotoba-exit-confirm').hidden=false;
      find('#kotoba-exit-confirm').innerHTML='<div class="kotoba-exit-box"><p>Akhiri sesi ini? Hasil yang belum selesai tidak disimpan.</p><button class="secondary" data-kotoba="continue">Lanjutkan</button><button class="primary" data-kotoba="setup">Akhiri sesi</button></div>';
      find('[data-kotoba="continue"]').focus();
    }
    if(action==='continue') find('#kotoba-exit-confirm').hidden=true;
    if(action==='setup') {render();window.scrollTo({top:0,behavior:'instant'});}
    if(action==='retry-wrong' && lastSession) {
      const questions=shuffle(lastSession.questions.filter((q,i)=>!lastSession.answers[i].correct)).map(q=>({...q,options:shuffle(q.options)}));
      start(questions);
    }
    if(action==='review-prev' || action==='review-next') {reviewPage+=action==='review-next' ? 1 : -1;renderReview();find('.kotoba-review').scrollIntoView({block:'start'});}
  });
  root.addEventListener('change',e=>{
    if(active && !session && ['kotoba-type','kotoba-count','kotoba-time','kotoba-source-group'].includes(e.target.id)) updateSetup();
  });
  root.addEventListener('input',e=>{
    if(!active || session)return;
    if(e.target.id==='kotoba-custom')updateSetup();
    if(e.target.id==='kotoba-search')updateWordList();
  });
  if(canSpeak) speech.addEventListener('voiceschanged',()=>{if(active && !session && find('#kotoba-audio-note'))updateSetup();});
  return {render,dispose(){active=false;stop();session=null;lastSession=null;}};
}
