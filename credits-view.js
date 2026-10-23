import {DOKKAI_PASSAGES,DOKKAI_SOURCE} from './dokkai-data.js?v=20261016-dokkai';
import {kanjiExamples} from './kanji-examples.js?v=20261023-sentences';
import {loadKanjiSentences} from './kanji-sentence-view.js?v=20261024-credits';

const notes='https://github.com/BiancaNobelia/nihongo_benkyo/blob/main/DATA-SOURCES.md';
const external=(url,label)=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const section=(id,title,hint,body,open)=>`<details class="credits-section" data-credit-section="${id}" ${open?'open':''}><summary><span><strong>${title}</strong><small>${hint}</small></span><span class="credits-toggle" aria-hidden="true">+</span></summary><div class="credits-body">${body}</div></details>`;

export function creditsMarkup(escape,context='') {
  const passage=DOKKAI_PASSAGES.find(p=>p.id===context);
  const dictionary=`<p>Bacaan, arti sumber, dan jumlah goresan berasal dari ${external('https://www.edrdg.org/wiki/index.php/KANJIDIC_Project','KANJIDIC2')}; kosakata berasal dari ${external('https://www.edrdg.org/jmdict/j_jmdict.html','JMdict')}. Hak cipta James William Breen dan Electronic Dictionary Research and Development Group (EDRDG).</p><p>Data dihimpun melalui ${external('https://github.com/evanclan/OpenJLPT','OpenJLPT dan kontributor')}, ${external('https://kanjiapi.dev/','kanjiapi.dev')}, serta daftar ${external('https://www.tanos.co.uk/jlpt/','Jonathan Waller')}. Level adalah panduan komunitas, bukan daftar resmi JLPT.</p><p>Arti Indonesia, pilihan contoh, pengelompokan, dan penjelasan disunting untuk Nihongo Benkyo. Data adaptasi: ${external('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0')}. ${external('https://www.edrdg.org/edrdg/licence.html','Ketentuan EDRDG')} · ${external('./data/licenses/OpenJLPT-NOTICE.md','NOTICE OpenJLPT')}.</p>`;
  const examples=`<p>Contoh kalimat berasal dari ${external('https://tatoeba.org/','Tatoeba dan para kontributornya')}, bank JLPT/bunpou situs ini, dan contoh asli yang ditulis atau disunting oleh AI.</p><p>Kalimat Tatoeba: ${external('https://creativecommons.org/licenses/by/2.0/fr/','CC BY 2.0 FR')}. Anotasi, adaptasi ejaan, dan terjemahan Indonesia ditambahkan; kompilasi serta adaptasinya mengikuti CC BY-SA 4.0. Draf terjemahan Tatoeba dibantu Google Translate lalu disunting. Materi belum seluruhnya ditinjau oleh pengajar bahasa Jepang.</p><p>Tautan kredit pada detail kanji membuka sumber masing-masing kalimat, termasuk teks asal jika diadaptasi. ${external(`${notes}#contoh-kalimat-untuk-setiap-kosakata--23-oktober-2026`,'Catatan contoh kalimat')}.</p>`;
  const strokes=`<p>Diagram urutan goresan, bentuk komponen, dan geometri pencarian tulisan tangan menggunakan ${external('https://kanjivg.tagaini.net/','KanjiVG r20260714')}, © 2009–2026 Ulrich Apel dan kontributor.</p><p>Lisensi: ${external('https://creativecommons.org/licenses/by-sa/3.0/','CC BY-SA 3.0')}. Diagram diberi animasi, grid, warna, dan penanda awal; komponen diolah menjadi kelompok beserta penjelasan Indonesia. Geometri goresan disampel ulang untuk pencarian.</p><p>${external('./data/licenses/KanjiVG-NOTICE.md','Atribusi dan catatan perubahan KanjiVG')}.</p>`;
  const handwriting=`<ul><li>${external('https://github.com/dariyooo/DaKanji-Single-Kanji-Recognition','DaKanji v2')} — pengenalan karakter berbasis machine learning dari Dariyooo (DaAppLab); © CaptainDario. ${external('./data/licenses/DaKanji-LICENSE.txt','Lisensi MIT')}.</li><li>${external('https://github.com/asdfjkl/kanjicanvas','Kanji Canvas')} — © 2019 Dominik Klein dan kontributor. Pola tulisan dinormalisasi dan disampel ulang. ${external('./data/licenses/KanjiCanvas-LICENSE.txt','Lisensi MIT dan backlink')}.</li><li>${external('https://onnxruntime.ai/','ONNX Runtime Web')} — Microsoft dan kontributor; runtime pengenalan berlisensi MIT. ${external('./vendor/onnxruntime/LICENSE','Lisensi')} · ${external('./vendor/onnxruntime/ThirdPartyNotices.txt','Pemberitahuan pihak ketiga')}.</li><li>Geometri tambahan memakai KanjiVG; atribusinya ada di bagian “Goresan & komponen”.</li></ul>`;
  const materials=`<p>Kotoba dan bunpou Minna no Nihongo I & II (Bab 1–50), serta kotoba N3, diolah dari workbook yang diberikan pemilik situs. Bank latihan juga merujuk PDF kanji123 yang diberikan pengguna dan sumber kosakata yang dicatat di bawah.</p><p>Entri tambahan menggunakan OpenJLPT/JMdict, ${external('https://github.com/jamsinclair/open-anki-jlpt-decks','Open Anki JLPT Decks')} oleh Jamie Sinclair dan kontributor (${external('./data/licenses/OpenAnki-MIT.txt','MIT')}), serta ${external('https://github.com/stephenmk/yomitan-jlpt-vocab','Yomitan JLPT Vocab')} oleh stephenmk dan kontributor (CC BY-SA 4.0), yang bersumber dari daftar Jonathan Waller/Tanos (CC BY) dan JMdict.</p><p>Soal, penjelasan, terjemahan, dan anotasi belajar ditambahkan atau disunting untuk Nihongo Benkyo. ${external(notes,'Rincian asal setiap bank materi dan perubahannya')}.</p>`;
  const ordered=passage?[passage,...DOKKAI_PASSAGES.filter(p=>p!==passage)]:DOKKAI_PASSAGES;
  const dokkai=`<p>Diadaptasi dari ${external(DOKKAI_SOURCE.url,DOKKAI_SOURCE.title)}. © ${escape(DOKKAI_SOURCE.publisher)}.</p><p>${external(DOKKAI_SOURCE.licenseUrl,DOKKAI_SOURCE.license)} · penggunaan nonkomersial. ${escape(DOKKAI_SOURCE.changes)}</p><p>Level N5–N3 di situs ini merupakan perkiraan latihan, bukan padanan resmi JF Standard. Informasi mengikuti konteks cerita sumber. Situs ini bukan produk resmi Japan Foundation.</p><ul class="credits-reading-list">${ordered.map(p=>`<li${p===passage?' class="credits-current"':''}>${external(escape(p.source.url),`<span lang="ja">${escape(p.source.title)}</span> · ${escape(p.titleId)}`)}<span>Penulis: ${escape(p.source.author)} · level sumber ${escape(p.source.originalLevel)}</span></li>`).join('')}</ul>`;
  return `<div class="credits-page"><div class="view-heading"><div class="section-kicker">DI BALIK MATERI BELAJAR</div><h1>Kredit &amp; Sumber</h1><p>Terima kasih kepada pembuat kamus, penulis, dan komunitas yang mendukung perjalanan belajar ini.</p></div><div data-sentence-credits></div><div class="credits-sections">${section('dictionary','Kamus & kosakata','KANJIDIC2, JMdict, OpenJLPT',dictionary,context==='dictionary')}${section('sentences','Contoh kalimat','Tatoeba, bank latihan, dan contoh asli',examples,context==='sentences')}${section('strokes','Goresan & komponen','KanjiVG · diagram, bentuk, dan radikal',strokes,context==='strokes')}${section('handwriting','Pencarian tulisan tangan','DaKanji, Kanji Canvas, ONNX Runtime',handwriting,context==='handwriting')}${section('materials','Kotoba, bunpou & latihan','Workbook Minna, N3, dan bank soal',materials,context==='materials')}${section('dokkai','Bacaan dokkai','KCよむよむ · Japan Foundation',dokkai,context==='dokkai'||!!passage)}</div><p class="credits-notes">${external(notes,'Catatan sumber & lisensi lengkap')}<span> · </span>${external('./data/licenses/CC-BY-SA-4.0.txt','Teks CC BY-SA 4.0')}</p><a class="text-button" href="#kanji">← Kembali ke Jelajahi Kanji</a></div>`;
}

export function sentenceCreditsMarkup(card,records,escape) {
  const origins={'original':'Contoh asli Nihongo Benkyo','local-jlpt':'Bank latihan JLPT Nihongo Benkyo','local-bunpou':'Bank bunpou Nihongo Benkyo'};
  return `<h2>Sumber contoh kalimat · <span lang="ja">${escape(card.char)}</span></h2><ul class="credits-sentence-list">${kanjiExamples(card).map(e=>{
    const r=records[e.word+'|'+e.reading];
    if(!r)throw new Error('Missing sentence credit');
    const source=r.origin==='tatoeba'&&Number.isSafeInteger(r.reference)?`${external(`https://tatoeba.org/en/sentences/show/${r.reference}`,`Tatoeba #${r.reference} · kontributor & teks sumber`)} · CC BY 2.0 FR`:escape(origins[r.origin]||'Nihongo Benkyo');
    return `<li><strong lang="ja">${escape(e.word)}（${escape(e.reading)}）</strong><p lang="ja">${escape(r.text)}</p><small>${source}${r.adapted?' · Diadaptasi':''}</small>${r.adapted&&r.sourceText?`<details><summary>Teks sebelum adaptasi</summary><p lang="ja">${escape(r.sourceText)}</p></details>`:''}</li>`;
  }).join('')}</ul>`;
}

export function createCreditsView({root,escape,kanji,load=loadKanjiSentences}) {
  let generation=0;
  function render(context='') {
    const current=++generation;
    try {context=decodeURIComponent(context);} catch {context='';}
    root.innerHTML=creditsMarkup(escape,context);
    const card=kanji.find(k=>context===`kanji-${k.char}`);
    if(!card)return;
    const panel=root.querySelector('[data-sentence-credits]');
    panel.className='credits-context';
    async function showSources() {
      panel.innerHTML='<p role="status">Memuat sumber contoh kalimat…</p>';
      try {
        const records=await load();
        if(current===generation)panel.innerHTML=sentenceCreditsMarkup(card,records,escape);
      } catch {
        if(current!==generation)return;
        panel.innerHTML='<p role="status">Sumber kalimat belum berhasil dimuat.</p><button class="secondary" type="button">Coba lagi</button>';
        panel.querySelector('button').addEventListener('click',showSources,{once:true});
      }
    }
    showSources();
  }
  return {render,dispose(){generation++;}};
}
