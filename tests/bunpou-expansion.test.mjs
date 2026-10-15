import test from 'node:test';
import assert from 'node:assert/strict';
import {BUNPOU_ENTRIES as entries,BUNPOU_PATTERNS as patterns,BUNPOU_CHAPTERS as chapters} from '../bunpou-data.js';
import {KOTOBA_ENTRIES as kotoba} from '../kotoba-data.js';
import {createBunpouQuiz,cleanBunpouHistory} from '../bunpou-core.js';
import {createBunpouOrderQuiz} from '../bunpou-order-core.js';

const extra=entries.filter(q=>q.patternId);
const normalize=s=>s.replace(/[。、！？「」\s]/g,'');
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('each chapter gains 20 distinct exercises while all 330 original patterns stay available',()=>{
  assert.equal(extra.length,1000);assert.equal(entries.length,1330);assert.equal(patterns.length,330);
  const seen=new Set(patterns.map(q=>normalize(q.example)));
  for(const q of extra){
    assert.ok(!seen.has(normalize(q.example)),q.id);seen.add(normalize(q.example));
    const source=patterns.find(p=>p.id===q.patternId);
    assert.ok(source,q.id);assert.equal(q.chapter,source.chapter);
    for(const key of ['theme','pattern','meaning','structure','note'])assert.equal(q[key],source[key],q.id);
    assert.ok(q.translation&&q.cue&&Array.isArray(q.furigana),q.id);
    assert.ok(!Object.hasOwn(q,'sourceRow'),'Authored sentences must not pretend to be workbook rows');
  }
  for(const c of chapters){
    assert.equal(extra.filter(q=>q.chapter===c.number).length,20);
    assert.equal(c.count,entries.filter(q=>q.chapter===c.number).length);
    assert.equal(c.patternCount,patterns.filter(q=>q.chapter===c.number).length);
    assert.ok(c.count>=20);
    assert.ok(new Set(extra.filter(q=>q.chapter===c.number).map(q=>q.patternId)).size>=3);
  }
});

test('every new content-word reference is a real Kotoba entry from this chapter or earlier',()=>{
  const lookup=new Map(kotoba.map(v=>[v.id,v]));
  for(const q of extra){
    assert.ok(q.vocabulary.length>=2,q.id);
    for(const token of q.vocabulary){
      const source=lookup.get(token.sourceId);
      assert.ok(source,`${q.id}: ${token.sourceId}`);
      assert.ok(source.chapter<=q.chapter,`${q.id}: ${token.text} is chapter ${source.chapter}`);
      assert.ok(q.example.includes(token.text),`${q.id}: unused lexical reference`);
    }
  }
  assert.ok(extra.filter(q=>q.chapter===1).every(q=>q.vocabulary.every(t=>lookup.get(t.sourceId).chapter===1)));
});

test('all chapters support 20-question sessions in both modes with exact scope, variety and no repeats',()=>{
  for(let chapter=1;chapter<=50;chapter++)for(const create of [createBunpouQuiz,createBunpouOrderQuiz]){
    const questions=create(entries,{chapters:[chapter],count:20},{},random(chapter));
    assert.equal(questions.length,20);assert.equal(new Set(questions.map(q=>q.id)).size,20);
    assert.ok(questions.every(q=>q.chapter===chapter));
    assert.equal(new Set(questions.slice(0,4).map(q=>q.patternId||q.id)).size,4);
    const all=create(entries,{chapters:[chapter],count:9999},{},random(7));
    assert.equal(all.length,chapters[chapter-1].count);
  }
});

test('original exposure history survives expansion and unseen examples still precede seen ones',()=>{
  const history=Object.fromEntries(patterns.map(q=>[q.id,1]));
  assert.deepEqual(cleanBunpouHistory(history,entries),history);
  for(let chapter=1;chapter<=50;chapter++){
    const questions=createBunpouQuiz(entries,{chapters:[chapter],count:20},history,random(chapter));
    assert.ok(questions.every(q=>q.patternId&&!history[q.id]));
  }
});

test('new contexts retain selected meanings and explicitly distinguish giving, potential and hearsay',()=>{
  const family=id=>extra.filter(q=>q.familyId===id);
  assert.ok(family('07-04-gifts').every(q=>q.cue.includes('memberi')));
  assert.ok(family('07-05-gifts').every(q=>q.cue.includes('menerima')));
  assert.ok(family('17-01-places').every(q=>q.cue.includes('bukan tidak bisa')));
  for(const id of ['43-02-food','43-03-rooms'])assert.ok(family(id).every(q=>q.cue.includes('bukan kabar')));
  for(const id of ['47-01-food','47-01-rooms'])assert.ok(family(id).every(q=>q.cue.includes('kabar dari orang lain')));
  assert.ok(family('48-03-food').every(q=>q.pattern.includes('他動詞')));
  assert.ok(family('05-02-transport').every(q=>q.order.accepted.length===2));
  assert.ok(family('01-01-jobs').every(q=>!q.example.includes('博士')));
});
