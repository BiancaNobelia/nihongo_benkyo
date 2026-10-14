import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KOTOBA_N3_ENTRIES as entries} from '../kotoba-n3-data.js';
import {KOTOBA_COURSES, kotobaCourse} from '../kotoba-courses.js';
import {KOTOBA_MODES,getKotobaPool,createKotobaQuiz} from '../kotoba-core.js';
import {cleanProgress} from '../core.js';
import {KANJI} from '../kanji-data.js';

const manifest=JSON.parse(readFileSync(new URL('../data/kotoba-n3-source.json',import.meta.url),'utf8'));
const seeded=(seed=42)=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('N3 retains every workbook row, reading, word type and source group',()=>{
  assert.equal(entries.length,2276);
  assert.equal(manifest.entryCount,entries.length);
  assert.deepEqual(entries.map(e=>e.sourceRow),Array.from({length:2276},(_,i)=>i+2));
  assert.equal(new Set(entries.map(e=>e.id)).size,2276);
  assert.equal(getKotobaPool(entries).length,2276);
  for(const [type,count] of Object.entries(manifest.types)) assert.equal(entries.filter(e=>e.type===type).length,count);
  assert.deepEqual(manifest.sourceGroups,{core:1659,extra:617});
  for(const e of entries) {
    assert.equal(e.level,'N3');
    assert.ok(e.meaning && e.meaningEn && e.reading && e.source);
    assert.ok(!Object.hasOwn(e,'chapter') && !Object.hasOwn(e,'memorization'));
  }
  assert.equal(entries.find(e=>e.spelling==='燃える').meaning,'Terbakar; menyala');
  assert.equal(entries.find(e=>e.spelling==='交際').meaning,'Pergaulan; hubungan sosial; berpacaran');
});

test('N3 is separate from Minna and filters use only matching N3 source/type entries',()=>{
  assert.deepEqual(kotobaCourse('n3').entries,entries);
  assert.equal(kotobaCourse('invalid'),KOTOBA_COURSES.minna);
  assert.equal(kotobaCourse('__proto__'),KOTOBA_COURSES.minna);
  assert.equal(kotobaCourse('constructor'),KOTOBA_COURSES.minna);
  assert.equal(KOTOBA_COURSES.minna.entries.length,1690);
  assert.equal(KOTOBA_COURSES.n3.chapters.length,0);
  for(const group of ['all','core','extra']) {
    for(const type of ['all',...Object.keys(manifest.types)]) {
      const expected=entries.filter(e=>(group==='all'||e.sourceGroup===group) && (type==='all'||type===e.type));
      const pool=getKotobaPool(entries,{sourceGroup:group,type});
      assert.equal(pool.length,expected.length);
      assert.ok(pool.every(q=>q.chapters.length===0 && q.levels[0]==='N3'));
    }
  }
  assert.deepEqual(getKotobaPool(entries,{sourceGroup:'invalid'}),[]);
});

test('all N3 modes can cover the full eligible pool with four distinct safe choices and no repeat',()=>{
  for(const mode of Object.keys(KOTOBA_MODES)) {
    const settings={mode,count:5000};
    const pool=getKotobaPool(entries,settings);
    const questions=createKotobaQuiz(entries,settings,seeded());
    assert.equal(questions.length,pool.length,mode);
    assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
    for(const q of questions) {
      assert.equal(q.options.length,4);
      assert.equal(new Set(q.options).size,4);
      assert.equal(q.options.filter(a=>a===q.answer).length,1);
      assert.ok(q.meaning && q.reading && q.levels.includes('N3'));
      if(mode==='reading')assert.match(q.word,/\p{Script=Han}/u);
    }
  }
});

test('N3 core/additional filters keep distractors in scope and rare word types still work',()=>{
  for(const group of ['core','extra']) {
    const pool=getKotobaPool(entries,{sourceGroup:group});
    for(const mode of ['jp-id','id-jp','reading']) {
      const allowed=new Set(pool.map(q=>mode==='jp-id' ? q.meaning : mode==='reading' ? q.reading : q.word));
      const quiz=createKotobaQuiz(entries,{sourceGroup:group,mode,count:50},seeded());
      assert.equal(quiz.length,50);
      assert.ok(quiz.every(q=>q.sourceGroups.every(g=>g===group) && q.options.every(a=>allowed.has(a))));
    }
  }
  const rare=createKotobaQuiz(entries,{type:'kata sifat-i (perkiraan)',count:20},seeded());
  assert.equal(rare.length,1);
  assert.equal(rare[0].options.length,4);
  for(const count of [1,10,20,50,103])assert.equal(createKotobaQuiz(entries,{count},seeded()).length,count);
});

test('English glosses and comma-separated synonyms also exclude ambiguous distractors',()=>{
  const make=(id,word,reading,meaning,meaningEn)=>({id,spelling:word,reading,meaning,meaningEn,type:'kata benda'});
  const fixture=[make(1,'猫','ねこ','kucing','cat'),make(2,'ネコ','ネコ','kucing peliharaan','cat'),
    make(3,'家猫','いえねこ','kucing domestik, kucing','domestic cat'),make(4,'犬','いぬ','anjing','dog'),
    make(5,'鳥','とり','burung','bird'),make(6,'魚','さかな','ikan','fish')];
  for(const mode of ['jp-id','id-jp','reading','audio-id','audio-jp']) {
    const q=createKotobaQuiz(fixture,{mode,count:20},seeded()).find(q=>q.word==='猫');
    assert.ok(q);
    for(const wrong of ['ネコ','家猫','いえねこ','kucing peliharaan','kucing domestik, kucing'])assert.ok(!q.options.includes(wrong),`${mode}: ${wrong}`);
  }
});

test('N3 scores survive reload, preserve course identity, and retain older Minna scores',()=>{
  const entry={date:'2026-10-14',total:2276,correct:1000,mode:'kotoba-jp-id',course:'n3',sourceGroup:'extra',chapters:[1]};
  const old={date:'2026-10-14',total:20,correct:10,mode:'kotoba-reading',chapters:[1,2]};
  const history=cleanProgress({history:[entry,old,{...old,course:'bad',sourceGroup:'bad'}]},KANJI).history;
  assert.equal(history.length,3);
  assert.equal(history[0].course,'n3');
  assert.equal(history[0].sourceGroup,'extra');
  assert.deepEqual(history[0].chapters,[]);
  assert.equal(history[1].course,'minna');
  assert.deepEqual(history[1].chapters,[1,2]);
  assert.equal(history[2].course,'minna');
  assert.equal(history[2].sourceGroup,'all');
});
