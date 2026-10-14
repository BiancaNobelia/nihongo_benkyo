import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENGLISH_KATAKANA } from '../english-katakana-data.js';
import { KATAKANA_EXPANSION } from '../katakana-expansion-data.js';
import { createWritingQuiz } from '../writing-core.js';
import { getQuizPool } from '../practice-banks.js';

const manifest=JSON.parse(readFileSync(new URL('../data/katakana-expansion-source.json',import.meta.url),'utf8'));
const requested=JSON.parse(readFileSync(new URL('../data/katakana-expansion-editorial.json',import.meta.url),'utf8'));

test('all 99 requested words and all extra words are covered once without losing the original bank',()=>{
  assert.equal(requested.requested.length,99);
  assert.equal(manifest.coverage.filter(r=>r.kind==='requested' && r.status==='existing').length,14);
  assert.equal(manifest.coverage.filter(r=>r.kind==='requested' && r.status==='added').length,85);
  assert.equal(manifest.coverage.filter(r=>r.kind==='extra' && r.status==='added').length,22);
  assert.equal(KATAKANA_EXPANSION.length,107);
  assert.equal(ENGLISH_KATAKANA.length,161);
  for(const [cue,word] of [...requested.requested,...requested.extra]) {
    assert.equal(ENGLISH_KATAKANA.filter(q=>q.answer===word).length,1,`${cue}: ${word}`);
  }
  for(const q of KATAKANA_EXPANSION){
    const source=manifest.words.find(r=>r.word===q.answer);
    assert.equal(q.level,source.level);
    assert.equal(q.prompt,source.english);
    assert.ok(['pinned-vocabulary','editorial-practice-tier'].includes(source.levelBasis));
    if(source.levelBasis==='pinned-vocabulary')assert.ok(source.sourceId);
  }
});

test('distractors remain visually close and exclude accepted spellings including long-vowel variants',()=>{
  function distance(a,b) {
    let row=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const next=[i];
      for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));
      row=next;
    }
    return row[b.length];
  }
  for(const q of KATAKANA_EXPANSION){
    assert.equal(q.distractors.length,3);
    assert.equal(new Set([q.answer,...q.distractors]).size,4);
    for(const wrong of q.distractors){
      assert.match(wrong,/^[ァ-ヶー]+$/u);
      assert.ok(!q.acceptedSpellings.includes(wrong),`${q.answer}: accepted ${wrong}`);
      assert.ok(distance(q.answer,wrong)<=2,`${q.answer}: unrelated ${wrong}`);
    }
  }
  const aliases={'バウムクーヘン':'バームクーヘン','プレー':'プレイ','コンピューター':'コンピュータ','エレベーター':'エレベータ','パーティー':'パーティ','ソフトウェア':'ソフトウエア','プリンター':'プリンタ'};
  for(const [word,alias] of Object.entries(aliases))assert.ok(KATAKANA_EXPANSION.find(q=>q.answer===word).acceptedSpellings.includes(alias));
});

test('ambiguous English cues identify the intended sense and all levels support large sessions',()=>{
  const byPrompt=Object.fromEntries(ENGLISH_KATAKANA.map(q=>[q.prompt,q]));
  assert.equal(byPrompt['fan (supporter)'].answer,'ファン');
  assert.equal(byPrompt['Turkey (country)'].answer,'トルコ');
  assert.equal(byPrompt['convenience store'].answer,'コンビニ');
  assert.equal(byPrompt['CD'].answer,'シーディー');
  assert.equal(byPrompt['T-shirt'].answer,'ティーシャツ');
  assert.equal(byPrompt['condominium'].answer,'マンション');
  assert.ok(!byPrompt['convenient store']);
  for(const level of ['all','N5','N4','N3','N2','N1']){
    const pool=getQuizPool('english-katakana',level);
    for(const count of [10,20,50,161,200]){
      const quiz=createWritingQuiz(pool,count);
      assert.equal(quiz.length,Math.min(count,pool.length));
      assert.equal(new Set(quiz.map(q=>q.prompt)).size,quiz.length);
      assert.ok(quiz.every(q=>level==='all'||q.level===level));
    }
  }
});
