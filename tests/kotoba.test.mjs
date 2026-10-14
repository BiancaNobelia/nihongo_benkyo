import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KOTOBA_ENTRIES, KOTOBA_CHAPTERS} from '../kotoba-data.js';
import {ALL_CHAPTERS,KOTOBA_MODES,getKotobaPool,createKotobaQuiz,chapterLabel,meaningKeys,matchingVoice} from '../kotoba-core.js';
import {cleanProgress} from '../core.js';
import {KANJI} from '../kanji-data.js';

const manifest=JSON.parse(readFileSync(new URL('../data/kotoba-source.json',import.meta.url),'utf8'));
function seeded(seed=789) {return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}

test('every workbook row is preserved and all 50 chapter totals reconcile',()=>{
  assert.equal(KOTOBA_ENTRIES.length,1690);
  assert.equal(new Set(KOTOBA_ENTRIES.map(e=>e.id)).size,1690);
  assert.deepEqual(KOTOBA_ENTRIES.map(e=>e.sourceRow),Array.from({length:1690},(_,i)=>i+2));
  assert.equal(KOTOBA_ENTRIES.filter(e=>e.chapter<=25).length,904);
  assert.equal(KOTOBA_ENTRIES.filter(e=>e.chapter>25).length,786);
  assert.deepEqual(KOTOBA_CHAPTERS.map(c=>c.number),ALL_CHAPTERS);
  for(const c of KOTOBA_CHAPTERS)assert.equal(KOTOBA_ENTRIES.filter(e=>e.chapter===c.number).length,c.count);
  assert.equal(Object.keys(manifest.types).length,12);
  for(const [type,count] of Object.entries(manifest.types))assert.equal(KOTOBA_ENTRIES.filter(e=>e.type===type).length,count);
  for(const e of KOTOBA_ENTRIES)assert.ok(e.reading && e.meaning && e.type);
  assert.match(manifest.sha256,/^[0-9a-f]{64}$/);
});

test('chapter and word-type filters keep complete source membership while merging repeated words',()=>{
  const all=getKotobaPool(KOTOBA_ENTRIES);
  assert.equal(all.length,1571);
  assert.deepEqual(all.flatMap(q=>q.sourceRows).sort((a,b)=>a-b),KOTOBA_ENTRIES.map(e=>e.sourceRow));
  for(const chapter of ALL_CHAPTERS) {
    const pool=getKotobaPool(KOTOBA_ENTRIES,{chapters:[chapter]});
    assert.ok(pool.length);
    assert.ok(pool.every(q=>q.chapters.length===1 && q.chapters[0]===chapter));
    assert.equal(pool.reduce((n,q)=>n+q.sourceRows.length,0),KOTOBA_CHAPTERS[chapter-1].count);
  }
  for(const type of Object.keys(manifest.types))assert.ok(getKotobaPool(KOTOBA_ENTRIES,{type}).every(q=>q.types.length===1 && q.types[0]===type));
  assert.deepEqual(getKotobaPool(KOTOBA_ENTRIES,{chapters:[]}),[]);
  assert.deepEqual(getKotobaPool(KOTOBA_ENTRIES,{chapters:[1],type:'kata kerja'}),[]);
  assert.equal(chapterLabel([50,1,2,3,5,5]),'Bab 1–3, 5, 50');
});

test('all five modes can quiz their full pool with four unique choices and no repeat',()=>{
  for(const mode of Object.keys(KOTOBA_MODES)) {
    const settings={mode,count:5000};
    const pool=getKotobaPool(KOTOBA_ENTRIES,settings);
    const questions=createKotobaQuiz(KOTOBA_ENTRIES,settings,seeded());
    assert.equal(questions.length,pool.length,mode);
    assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
    for(const q of questions) {
      assert.equal(q.options.length,4);
      assert.equal(new Set(q.options).size,4);
      assert.equal(q.options.filter(a=>a===q.answer).length,1);
      assert.ok(q.reading && q.meaning);
      if(mode==='reading')assert.match(q.word,/\p{Script=Han}/u);
      if(mode==='audio-jp')assert.doesNotMatch(q.reading,/[～〜]/u);
    }
  }
});

test('single-chapter and rare-type sessions keep targets and distractors inside selected chapters',()=>{
  for(const chapter of ALL_CHAPTERS) {
    const pool=getKotobaPool(KOTOBA_ENTRIES,{chapters:[chapter]});
    for(const mode of ['jp-id','id-jp','reading']) {
      const allowed=new Set(pool.map(q=>mode==='jp-id' ? q.meaning : mode==='reading' ? q.reading : q.word));
      const settings={mode,chapters:[chapter],count:50};
      const questions=createKotobaQuiz(KOTOBA_ENTRIES,settings,seeded(chapter));
      assert.equal(questions.length,getKotobaPool(KOTOBA_ENTRIES,settings).length);
      assert.ok(questions.every(q=>q.chapters.every(n=>n===chapter) && q.options.every(a=>allowed.has(a))));
    }
  }
  const rare=createKotobaQuiz(KOTOBA_ENTRIES,{chapters:[1],type:'akhiran / pola',count:20},seeded());
  assert.equal(rare.length,4);
  assert.ok(rare.every(q=>q.types.includes('akhiran / pola')));
});

test('synonyms, homophones and alternate readings never compete as incorrect choices',()=>{
  const make=(n,reading,spelling,meaning)=>({id:String(n),sourceRow:n,chapter:1,reading,spelling,meaning,type:'kata benda'});
  const fixture=[make(1,'わたし','私','Saya / aku'),make(2,'わたくし','私','saya (formal)'),make(3,'ぼく','僕','aku'),
    make(4,'はし','橋','jembatan'),make(5,'はし','箸','sumpit'),
    make(6,'ねこ','猫','kucing'),make(7,'いぬ','犬','anjing'),make(8,'くるま','車','mobil'),make(9,'ほん','本','buku')];
  for(const mode of Object.keys(KOTOBA_MODES)) {
    const questions=createKotobaQuiz(fixture,{mode,count:20},seeded());
    const q=questions.find(q=>q.reading==='わたし');
    assert.ok(q);
    const wrong=q.options.filter(a=>a!==q.answer);
    for(const value of ['saya (formal)','aku','僕','ぼく','わたくし'])assert.ok(!wrong.includes(value),`${mode}: ${value}`);
    const bridge=questions.find(q=>q.word==='橋');
    assert.ok(!bridge.options.filter(a=>a!==bridge.answer).includes(mode==='jp-id'||mode==='audio-jp' ? 'sumpit' : '箸'));
  }
  assert.deepEqual(meaningKeys('Saya / aku (formal); diri saya'),['saya','aku','diri saya']);
});

test('counts cap to eligible words, invalid sessions stay empty and voices require the right language',()=>{
  for(const count of [1,10,20,50,101])assert.equal(createKotobaQuiz(KOTOBA_ENTRIES,{count},seeded()).length,count);
  for(const count of [0,-1,1.5,NaN])assert.deepEqual(createKotobaQuiz(KOTOBA_ENTRIES,{count}),[]);
  assert.deepEqual(createKotobaQuiz(KOTOBA_ENTRIES,{count:10,chapters:[]}),[]);
  const voices=[{name:'English',lang:'en-US'},{name:'Japanese',lang:'ja-JP'},{name:'Indonesian',lang:'id_ID'}];
  assert.equal(matchingVoice(voices,'ja').name,'Japanese');
  assert.equal(matchingVoice(voices,'id').name,'Indonesian');
  assert.equal(matchingVoice([voices[0]],'ja'),null);
});

test('Kotoba history survives reload alongside kanji history, with safe chapter metadata',()=>{
  const history=Object.keys(KOTOBA_MODES).map(mode=>({date:'2026-10-14',correct:20,total:50,mode:`kotoba-${mode}`,chapters:[1,25,50,0,51,'2',null,1]}));
  history.push({date:'2026-10-14',correct:10,total:10,mode:'english-katakana'});
  const cleaned=cleanProgress({history},KANJI);
  assert.equal(cleaned.history.length,6);
  assert.deepEqual(cleaned.history[0].chapters,[1,25,50]);
});
