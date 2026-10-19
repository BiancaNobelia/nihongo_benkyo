import test from 'node:test';
import assert from 'node:assert/strict';
import {KANJI} from '../kanji-data.js';
import {filterKanji} from '../core.js';
import {readingRomaji} from '../kanji-search.js';

const find=(query,filters={})=>filterKanji(KANJI,{query,...filters}).map(k=>k.char);

test('romaji finds onyomi, kunyomi with okurigana, and all example readings',()=>{
  for(const [query,char] of [['tsuyoi','強'],['mizu','水'],['gaku','学'],['manabu','学'],['gakusei','学'],['atarashii','新'],['azuma','東'],['getsuyoubi','月']]) {
    assert.ok(find(query).includes(char),`${query} must find ${char}`);
  }
  assert.equal(find('hon')[0],'本','exact reading precedes examples containing nihon');
  assert.deepEqual(find('  ＴＳＵＹＯＩ  '),find('tsuyoi'));
});

test('common alternate romanizations, digraphs, long vowels and doubled consonants work',()=>{
  for(const [a,b,char] of [['tsuyoi','tuyoi','強'],['atarashii','atarasii','新'],['cha','tya','茶'],['kyou','kyō','京'],['kyou','kyoo','京'],['chuugakkou','tyuugakkou','中'],['fujisan','huzisan','山']]) {
    assert.ok(find(a).includes(char));
    assert.ok(find(b).includes(char),`${b} must also find ${char}`);
  }
  assert.ok(find('kippu').includes('切'));
  const fixtures=[{char:'甲',on:[],kun:[],example:{reading:'まっちゃ'}},{char:'乙',on:['シンヨウ'],kun:[]},{char:'丙',on:['コー'],kun:[]}];
  assert.equal(filterKanji(fixtures,{query:'matcha'})[0]?.char,'甲');
  assert.equal(filterKanji(fixtures,{query:"shin'you"})[0]?.char,'乙');
  assert.equal(filterKanji(fixtures,{query:'kō'})[0]?.char,'丙');
});

test('romaji never bypasses level, saved, known or new filters',()=>{
  assert.ok(find('tsuyoi',{level:'N4'}).includes('強'));
  assert.equal(find('tsuyoi',{level:'N5'}).length,0);
  assert.deepEqual(find('mizu',{collection:'saved',saved:['水']}),['水']);
  assert.deepEqual(find('mizu',{collection:'known',known:['水']}),['水']);
  assert.ok(!find('mizu',{collection:'new',known:['水']}).includes('水'));
});

test('Japanese scripts and existing meaning searches still work',()=>{
  assert.deepEqual(find('  BELAJAR ',{level:'N5'}),['学']);
  assert.deepEqual(find('つよい'),find('ツヨイ'));
  assert.deepEqual(find('ｶﾞｸ'),find('がく'));
  assert.ok(find('まなぶ').includes('学'));
  assert.equal(find('水')[0],'水');
  assert.ok(find('depression',{level:'N1'}).includes('鬱'));
  assert.equal(find('<script>').length,0);
  assert.equal(find('xyzxyz').length,0);
  assert.ok(find('.').length<KANJI.length,'punctuation must not become an empty reading query');
  assert.deepEqual(filterKanji(KANJI,{query:' '}),KANJI);
});

test('all catalog readings can be romanized without changing their source records',()=>{
  const before=JSON.stringify(KANJI);
  for(const k of KANJI)for(const r of [...k.on,...k.kun,k.example?.reading,...(k.example?.readings||[])].filter(Boolean)){
    assert.match(readingRomaji(r),/^[a-z']+$/,`${k.char}: ${r}`);
  }
  find('kyo');find('mizu');
  assert.equal(JSON.stringify(KANJI),before);
});
