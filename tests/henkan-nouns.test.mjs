import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HENKAN_NOUNS as nouns} from '../henkan-noun-data.js';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {KOTOBA_N3_ENTRIES} from '../kotoba-n3-data.js';
import {NOUN_MODES,NOUN_HISTORY_KEY,conjugateNoun,nounAcceptedAnswers,nounOptions,nounPool,createNounQuiz,cleanNounHistory} from '../henkan-noun-core.js';
import {HENKAN_HISTORY_KEY,recordHenkanShown} from '../henkan-core.js';
import {ADJECTIVE_HISTORY_KEY} from '../henkan-adjective-core.js';
import {checkHenkanTypedAnswer} from '../henkan-answer.js';
import {henkanDetailMarkup} from '../henkan-view.js';
import {cleanProgress} from '../core.js';
const forms=['negative','past','negativePast','te'];
const find=word=>{const n=nouns.find(n=>n.word===word);assert.ok(n,word);return n;};
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('noun bank accounts for source rows, excludes expressions and merges duplicates at earliest levels',()=>{
  const rows=[...KOTOBA_ENTRIES,...KOTOBA_N3_ENTRIES].filter(e=>e.type.includes('kata benda'));
  const meta=JSON.parse(readFileSync(new URL('../data/henkan-noun-source.json',import.meta.url)));
  const covered=nouns.flatMap(n=>n.sources);
  assert.equal(meta.sourceRows,rows.length);assert.equal(meta.entryCount,nouns.length);
  assert.equal(new Set(nouns.map(n=>n.id)).size,nouns.length);
  assert.equal(new Set(nouns.map(n=>n.word+'|'+n.reading)).size,nouns.length);
  assert.deepEqual(covered.sort(),meta.coveredSourceIds);
  const accounted=[...covered,...meta.excluded.map(e=>e.id)];
  assert.equal(new Set(accounted).size,rows.length);
  for(const e of rows)assert.ok(accounted.includes(e.id));
  for(const word of ['から','まで','だけ','歩いて','一人で','お名前は？','どうか','はず','せい'])assert.ok(!nouns.some(n=>n.word===word),word);
  for(const n of nouns){
    assert.match(n.reading,/^[ぁ-ゖー]+$/u);assert.ok(n.meaning);assert.equal(n.group,'noun');
    const levels=n.sources.map(id=>{const e=rows.find(e=>e.id===id);return e.chapter?(e.chapter<=25?0:1):2;});
    assert.equal(n.level,['N5','N4','N3'][Math.min(...levels)]);
  }
  assert.equal(find('学生').level,'N5');assert.equal(find('教師').level,'N5');assert.equal(find('愛情').level,'N3');
});

test('nouns have exactly four predicate forms and keep stems ending in i unchanged',()=>{
  assert.deepEqual(Object.keys(NOUN_MODES),forms);
  assert.deepEqual(conjugateNoun(find('学生')),{negative:'がくせいじゃない',past:'がくせいだった',negativePast:'がくせいじゃなかった',te:'がくせいで'});
  assert.equal(conjugateNoun(find('時計'),true).negative,'時計じゃない');
  assert.equal(conjugateNoun(find('会社員'),true).past,'会社員だった');
  assert.equal(conjugateNoun(find('カメラ'),true).te,'カメラで');
  for(const n of nouns)assert.deepEqual(Object.keys(conjugateNoun(n)),forms);
  assert.deepEqual(nounPool(nouns,{modes:['adverb','noun','potential','passive']}),[]);
});

test('every noun form offers four unique choices with exactly one accepted answer',()=>{
  for(const n of nouns)for(const form of forms){
    const options=nounOptions(n,form,random(5)),accepted=nounAcceptedAnswers(n,form);
    assert.equal(options.length,4);assert.equal(new Set(options).size,4);
    assert.equal(options.filter(o=>accepted.includes(o)).length,1,`${n.word} ${form}`);
    for(const o of options)assert.match(o,/^[ぁ-ゖー]+$/u);
    const q={noun:n,form,answer:conjugateNoun(n)[form]};
    for(const o of options)assert.equal(checkHenkanTypedAnswer(q,o),o===q.answer);
  }
});

test('typed noun answers accept kana, kanji and formal alternatives without treating nouns as adjectives',()=>{
  for(const n of nouns)for(const form of forms){
    const q={noun:n,form,answer:conjugateNoun(n)[form]};
    for(const answer of [...nounAcceptedAnswers(n,form),...nounAcceptedAnswers(n,form,true)])assert.ok(checkHenkanTypedAnswer(q,answer),answer);
    assert.ok(!checkHenkanTypedAnswer(q,''));assert.ok(!checkHenkanTypedAnswer(q,null));
  }
  const q=form=>({noun:find('学生'),form,answer:conjugateNoun(find('学生'))[form]});
  for(const answer of ['学生くない','がくせくない','学生ではありません','学生さ'])assert.ok(!checkHenkanTypedAnswer(q('negative'),answer));
  for(const answer of ['学生くて','学生に','学生であって'])assert.ok(!checkHenkanTypedAnswer(q('te'),answer));
  assert.ok(checkHenkanTypedAnswer(q('negative'),'ガクセイデハナイ'));
});

test('noun sessions honor filters, balance forms, rotate words and cap counts',()=>{
  for(const level of ['N5','N4','N3']){
    const pool=nounPool(nouns,{level});assert.ok(pool.length);assert.ok(pool.every(q=>q.noun.level===level));
    for(const count of [10,20,30,50]){
      const quiz=createNounQuiz(nouns,{level,count},{},random(count));
      assert.equal(quiz.length,count);assert.equal(new Set(quiz.map(q=>q.id)).size,count);assert.equal(new Set(quiz.map(q=>q.noun.id)).size,count);
      const counts=forms.map(f=>quiz.filter(q=>q.form===f).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);
      assert.ok(quiz.every(q=>q.prompt.endsWith('です')&&q.instruction&&q.options.length===4));
    }
  }
  const small=[find('学生'),find('教師')],all=createNounQuiz(small,{level:'all',count:99999},{},random(1));
  assert.equal(all.length,8);assert.equal(new Set(all.map(q=>q.id)).size,8);
  for(const count of [0,-1,NaN,1.5,Infinity])assert.deepEqual(createNounQuiz(nouns,{count}),[]);
  assert.deepEqual(createNounQuiz(nouns,{level:'N2'}),[]);assert.deepEqual(createNounQuiz(nouns,{modes:[]}),[]);
});

test('noun history is isolated and keeps unseen questions ahead across both answer modes',()=>{
  assert.notEqual(NOUN_HISTORY_KEY,HENKAN_HISTORY_KEY);assert.notEqual(NOUN_HISTORY_KEY,ADJECTIVE_HISTORY_KEY);
  const settings={level:'N5',modes:['te'],count:50},first=createNounQuiz(nouns,settings,{},random(4));
  const history=first.reduce((h,q)=>recordHenkanShown(h,q.id),{});
  assert.ok(createNounQuiz(nouns,{...settings,answerMode:'typing'},history,random(4)).every(q=>!history[q.id]));
  assert.deepEqual(cleanNounHistory({...history,'verb-0001:te':2,'bad':3},nouns),history);
  assert.deepEqual(cleanNounHistory(null,nouns),{});
});

test('noun feedback supplies meanings and only four forms; progress preserves noun category',()=>{
  for(const q of createNounQuiz([find('学生')],{level:'all',count:10},{},random(2))){
    const html=henkanDetailMarkup(q,escape);
    assert.ok(html.includes(q.noun.meaning));assert.ok(html.includes(q.answer));assert.ok(html.includes('Kata benda (名詞)'));
    assert.equal((html.match(/<dt>/g)||[]).length,4);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('～さ'));
  }
  const entries=['choice','typing'].map(answerMode=>({mode:'henkan',wordType:'noun',answerMode,forms,level:'N3',total:50,correct:40,date:'2026-10-15T10:00:00Z'}));
  assert.deepEqual(cleanProgress({history:entries},[]).history,entries);
});
