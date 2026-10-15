import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HENKAN_ADJECTIVES as adjectives} from '../henkan-adjective-data.js';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {KOTOBA_N3_ENTRIES} from '../kotoba-n3-data.js';
import {ADJECTIVE_MODES,ADJECTIVE_HISTORY_KEY,conjugateAdjective,adjectiveAcceptedAnswers,adjectiveExplanation,adjectiveOptions,adjectivePool,createAdjectiveQuiz,cleanAdjectiveHistory} from '../henkan-adjective-core.js';
import {henkanDetailMarkup} from '../henkan-view.js';
import {HENKAN_HISTORY_KEY,recordHenkanShown} from '../henkan-core.js';
import {cleanProgress} from '../core.js';
const find=(word,reading)=>{const a=adjectives.find(a=>a.word===word&&(!reading||a.reading===reading));assert.ok(a,word);return a;};
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const forms=['negative','past','negativePast','te','adverb','noun'];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('adjective bank accounts for source rows, merges duplicates at their earliest level, and records contextual exclusions',()=>{
  const meta=JSON.parse(readFileSync(new URL('../data/henkan-adjective-source.json',import.meta.url)));
  const entries=[...KOTOBA_ENTRIES,...KOTOBA_N3_ENTRIES].filter(e=>e.type.includes('kata sifat'));
  const covered=adjectives.flatMap(a=>a.sources);
  assert.equal(meta.entryCount,adjectives.length);assert.equal(meta.sourceRows,entries.length);
  assert.equal(new Set(adjectives.map(a=>a.id)).size,adjectives.length);
  assert.equal(new Set(adjectives.map(a=>a.word+'|'+a.reading)).size,adjectives.length);
  assert.equal(new Set([...covered,...meta.excluded.map(e=>e.id)]).size,entries.length);
  assert.deepEqual(covered.sort(),meta.coveredSourceIds);
  for(const e of entries)assert.ok(covered.includes(e.id)||meta.excluded.some(x=>x.id===e.id&&x.reason));
  for(const [level,count] of Object.entries(meta.levels))assert.equal(adjectives.filter(a=>a.level===level).length,count);
  assert.equal(find('すてき').level,'N5');assert.equal(find('重要').level,'N4');assert.equal(find('良い').level,'N5');
  assert.ok(find('忙しい').sources.includes('minna-row-935'));
  for(const word of ['独身','同じ','かなり','違いない'])assert.ok(!adjectives.some(a=>a.word===word));
  assert.equal(find('自然').meaning,'alami / wajar');assert.equal(find('清潔').meaning,'bersih / higienis');
  assert.notEqual(find('辛い','からい').meaning,find('辛い','つらい').meaning);
});

test('i and na adjectives have correct tense, connecting, adverb and noun forms',()=>{
  for(const [word,expected] of [
    ['高い',['たかくない','たかかった','たかくなかった','たかくて','たかく','たかさ']],
    ['静か',['しずかじゃない','しずかだった','しずかじゃなかった','しずかで','しずかに','しずかさ']],
    ['良い',['よくない','よかった','よくなかった','よくて','よく','よさ']],
    ['きれい',['きれいじゃない','きれいだった','きれいじゃなかった','きれいで','きれいに',undefined]],
    ['嫌い',['きらいじゃない','きらいだった','きらいじゃなかった','きらいで','きらいに',undefined]],
    ['有名',['ゆうめいじゃない','ゆうめいだった','ゆうめいじゃなかった','ゆうめいで','ゆうめいに',undefined]],
  ])assert.deepEqual(forms.map(f=>conjugateAdjective(find(word))[f]),expected,word);
  assert.equal(conjugateAdjective(find('頭がいい')).negative,'あたまがよくない');
  assert.equal(conjugateAdjective(find('丁度いい')).past,'ちょうどよかった');
  assert.equal(conjugateAdjective(find('調子がいい')).te,'ちょうしがよくて');
  assert.equal(conjugateAdjective(find('良い'),true).negative,'良くない');
  assert.equal(conjugateAdjective(find('頭がいい'),true).past,'頭がよかった');
  assert.equal(conjugateAdjective(find('ハンサム'),true).past,'ハンサムだった');
  assert.match(adjectiveExplanation(find('きれい'),'negative'),/Meski berakhir.*い.*な/);
  assert.match(adjectiveExplanation(find('良い'),'past'),/Pengecualian いい → よ/);
});

test('noun mode only includes reviewed sa nouns and excludes phrases requiring particle changes',()=>{
  const pool=adjectivePool(adjectives,{level:'all',modes:['noun']});
  assert.equal(pool.length,adjectives.filter(a=>a.nounMeaning).length);
  assert.ok(pool.every(q=>q.answer.endsWith('さ')&&q.adjective.nounMeaning));
  for(const word of ['背が高い','頭がいい','調子が悪い','好き','可能','たまらない'])assert.equal(conjugateAdjective(find(word)).noun,undefined);
  assert.equal(find('高い').nounMeaning,'ketinggian / mahalnya harga');
  assert.equal(find('良い').nounMeaning,'kebaikan / keunggulan');
});

test('all adjective questions offer four unique kana choices with exactly one valid answer',()=>{
  for(const a of adjectives)for(const form of Object.keys(conjugateAdjective(a)))for(const seed of [1,13,42]){
    const options=adjectiveOptions(a,form,random(seed));
    assert.equal(options.length,4,`${a.word} ${form}`);assert.equal(new Set(options).size,4);
    assert.equal(options.filter(o=>adjectiveAcceptedAnswers(a,form).includes(o)).length,1);
    for(const option of options)assert.match(option,/^[ぁ-ゖー]+$/u);
    assert.ok(options.includes(conjugateAdjective(a)[form]));
  }
  assert.deepEqual(adjectiveAcceptedAnswers(find('静か'),'negative'),['しずかじゃない','しずかではない']);
  assert.deepEqual(adjectiveAcceptedAnswers(find('静か'),'negativePast'),['しずかじゃなかった','しずかではなかった']);
});

test('level, group, forms and question count filters work with no repeated questions',()=>{
  for(const level of ['N5','N4','N3'])for(const group of ['i','na','all']){
    const pool=adjectivePool(adjectives,{level,group});assert.ok(pool.length);
    assert.ok(pool.every(q=>q.adjective.level===level&&(group==='all'||q.adjective.group===group)));
    for(const count of [1,10,20,50,99999]){
      const questions=createAdjectiveQuiz(adjectives,{level,group,count},{},random(20));
      assert.equal(questions.length,Math.min(count,pool.length));
      assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
      const wordCount=new Set(pool.map(q=>q.adjective.id)).size;
      assert.equal(new Set(questions.slice(0,wordCount).map(q=>q.adjective.id)).size,Math.min(wordCount,questions.length));
    }
  }
  assert.deepEqual(createAdjectiveQuiz(adjectives,{level:'N2'}),[]);
  assert.deepEqual(createAdjectiveQuiz(adjectives,{group:'godan'}),[]);
  assert.deepEqual(createAdjectiveQuiz(adjectives,{modes:[]}),[]);
  for(const count of [NaN,0,-1,1.5,Infinity])assert.deepEqual(createAdjectiveQuiz(adjectives,{count}),[]);
  const questions=createAdjectiveQuiz(adjectives,{count:10},{},random(1));
  assert.equal(new Set(questions.map(q=>q.form)).size,Object.keys(ADJECTIVE_MODES).length);
  assert.ok(questions.every(q=>q.instruction&&q.prompt&&q.promptWord));
  assert.match(questions.find(q=>q.form==='negative').instruction,/tanpa です/);
  assert.match(questions.find(q=>q.form==='noun').instruction,/～さ/);
});

test('adjective exposure history is isolated from verbs, favors unseen exercises and rejects stale keys',()=>{
  assert.notEqual(ADJECTIVE_HISTORY_KEY,HENKAN_HISTORY_KEY);
  const settings={level:'N5',modes:['te'],count:20};
  const first=createAdjectiveQuiz(adjectives,settings,{},random(10));
  const history=first.reduce((h,q)=>recordHenkanShown(h,q.id),{});
  const second=createAdjectiveQuiz(adjectives,settings,history,random(10));
  assert.ok(second.every(q=>!history[q.id]));
  assert.deepEqual(cleanAdjectiveHistory({...history,bad:10,'verb-0001:te':4},adjectives),history);
  assert.deepEqual(cleanAdjectiveHistory(null,adjectives),{});
  assert.deepEqual(cleanAdjectiveHistory({[first[0].id]:-1},adjectives),{});
});

test('feedback includes meanings, exception rules and all supported forms; progress retains adjective type',()=>{
  for(const word of ['高い','静か','良い','きれい']){
    const questions=createAdjectiveQuiz([find(word)],{level:'all',count:10},{},random(1));
    for(const q of questions){
      const html=henkanDetailMarkup(q,escape);
      assert.ok(html.includes(q.adjective.meaning));assert.ok(html.includes(q.answer));
      assert.ok(html.includes('Lihat perubahan bentuk kata ini'));
      if(q.form==='noun')assert.ok(html.includes(q.adjective.nounMeaning));
    }
  }
  const entry={date:'2026-10-15T00:00:00.000Z',correct:2,total:10,mode:'henkan',wordType:'adjective',adjectiveGroup:'na',level:'N5',forms:['te']};
  assert.deepEqual(cleanProgress({history:[entry]},[]).history,[entry]);
});
