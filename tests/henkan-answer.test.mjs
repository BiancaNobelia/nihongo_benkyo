import test from 'node:test';
import assert from 'node:assert/strict';
import {HENKAN_VERBS} from '../henkan-data.js';
import {HENKAN_ADJECTIVES} from '../henkan-adjective-data.js';
import {HENKAN_MODES,henkanPool,spellForm,henkanOptions} from '../henkan-core.js';
import {adjectivePool,conjugateAdjective,adjectiveOptions} from '../henkan-adjective-core.js';
import {checkHenkanTypedAnswer,normalizeHenkanAnswer} from '../henkan-answer.js';
import {cleanProgress} from '../core.js';
const verbs=henkanPool(HENKAN_VERBS,{level:'all',modes:Object.keys(HENKAN_MODES)});
const adjectives=adjectivePool(HENKAN_ADJECTIVES,{level:'all'});
const vq=(word,form)=>{const q=verbs.find(q=>q.verb.word===word&&q.form===form);assert.ok(q,`${word} ${form}`);return q;};
const aq=(word,form)=>{const q=adjectives.find(q=>q.adjective.word===word&&q.form===form);assert.ok(q,`${word} ${form}`);return q;};

test('typed answers accept canonical kana and written forms throughout both banks',()=>{
  for(const q of [...verbs,...adjectives]){
    const word=q.adjective?conjugateAdjective(q.adjective,true)[q.form]:spellForm(q.verb,q.answer,q.form);
    assert.ok(checkHenkanTypedAnswer(q,q.answer),q.id);
    assert.ok(checkHenkanTypedAnswer(q,word),`${q.id}: ${word}`);
    assert.ok(!checkHenkanTypedAnswer(q,''));assert.ok(!checkHenkanTypedAnswer(q,null));
  }
});

test('typing normalizes Japanese width, script, composition and whitespace without losing sounds',()=>{
  assert.equal(normalizeHenkanAnswer('　ﾀﾍﾞﾃ  '),'たべて');
  assert.equal(normalizeHenkanAnswer('およいて\u3099'),'およいで');
  assert.ok(checkHenkanTypedAnswer(vq('食べる','te'),'  食べて　'));
  assert.ok(checkHenkanTypedAnswer(vq('食べる','te'),'タベテ'));
  for(const wrong of ['たべで','たへて','たべって','tabete','食べてです','食べて。'])assert.ok(!checkHenkanTypedAnswer(vq('食べる','te'),wrong),wrong);
  assert.ok(!checkHenkanTypedAnswer(vq('買う','volitional'),'かお'));
});

test('typing accepts supported verb variants while preserving the requested form',()=>{
  for(const answer of ['たべよ','食べよ'])assert.ok(checkHenkanTypedAnswer(vq('食べる','imperative'),answer));
  for(const answer of ['しろ','せよ'])assert.ok(checkHenkanTypedAnswer(vq('する','imperative'),answer));
  assert.ok(checkHenkanTypedAnswer(vq('食べる','potential'),'食べれる'));
  assert.ok(!checkHenkanTypedAnswer(vq('食べる','passive'),'食べれる'));
  assert.ok(checkHenkanTypedAnswer(vq('来る','nai'),'来ない'));
  assert.ok(!checkHenkanTypedAnswer(vq('来る','nai'),'きない'));
});

test('adjectives accept ja/dewa alternatives, written stems and ii exceptions',()=>{
  for(const answer of ['しずかじゃない','しずかではない','静かじゃない','静かではない'])assert.ok(checkHenkanTypedAnswer(aq('静か','negative'),answer),answer);
  assert.ok(checkHenkanTypedAnswer(aq('静か','negativePast'),'静かではなかった'));
  assert.ok(!checkHenkanTypedAnswer(aq('静か','negative'),'静かではありません'));
  assert.ok(checkHenkanTypedAnswer(aq('良い','past'),'良かった'));
  assert.ok(!checkHenkanTypedAnswer(aq('良い','past'),'いかった'));
  assert.ok(checkHenkanTypedAnswer(aq('ハンサム','past'),'ハンサムだった'));
  assert.ok(!checkHenkanTypedAnswer(aq('高い','noun'),'高く'));
});

test('sonkei typed answers follow the explicit pattern in the question',()=>{
  assert.ok(checkHenkanTypedAnswer(vq('食べる','honorific'),'召し上がる'));
  assert.ok(checkHenkanTypedAnswer(vq('読む','honorific'),'お読みになる'));
  assert.ok(!checkHenkanTypedAnswer(vq('読む','honorific'),'読まれる'));
  assert.ok(!checkHenkanTypedAnswer(vq('食べる','honorific'),'いただく'));
});

test('wrong multiple choice options are never accepted as typed answers',()=>{
  // Exercise all distractor rules through both generators, using a small
  // selection of regular, irregular, honorific and adjective exceptions.
  for(const q of [vq('行く','te'),vq('来る','nai'),vq('する','passive'),aq('高い','negative'),aq('静か','te')]){
    const options=q.adjective?adjectiveOptions(q.adjective,q.form):henkanOptions(q.verb,q.form);
    for(const option of options)assert.equal(checkHenkanTypedAnswer(q,option),option===q.answer,option);
  }
});

test('history preserves both new answer modes and older Henkan scores',()=>{
  const history=[undefined,'choice','typing'].map(answerMode=>({mode:'henkan',answerMode,wordType:'adjective',total:30,correct:20,date:'2026-10-15T10:00:00Z'}));
  assert.deepEqual(cleanProgress({history},[]).history,history);
});
