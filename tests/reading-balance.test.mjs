import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JLPT_READINGS } from '../jlpt-reading-data.js';
import { SIMILAR_READING, practiceQuestionKey } from '../similar-quiz-core.js';
import { SPECIAL_READINGS } from '../special-reading-data.js';
import { READING_VOCABULARY } from '../reading-vocabulary-data.js';
import { READING_METADATA } from '../reading-metadata.js';
import { getQuizPool } from '../practice-banks.js';
import { selectReadingQuestions, readingComposition } from '../reading-balance.js';
import { createReadingQuiz } from '../jlpt-reading-core.js';

const levels=['N5','N4','N3','N2','N1'];
const categories=['noun','verb','adjective','adverb'];
const source=JSON.parse(readFileSync(new URL('../data/reading-vocabulary-source.json',import.meta.url)));
const randomWithSeed=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const editDistance=(a,b)=>{
  let row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const next=[i];
    for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));
    row=next;
  }
  return row[b.length];
};

test('200 reviewed vocabulary entries retain source readings, levels, and grammatical categories',()=>{
  assert.equal(READING_VOCABULARY.length,200);
  assert.equal(source.commit,'0d1d3410bec90bd4098a7c72de820543cb4f707c');
  assert.equal(new Set(READING_VOCABULARY.map(q=>q.word)).size,200);
  assert.equal(new Set(READING_METADATA.map(q=>`${q.word}:${q.reading}`)).size,READING_METADATA.length);
  for(const level of levels)assert.equal(READING_VOCABULARY.filter(q=>q.level===level).length,40);
  for(const q of READING_VOCABULARY){
    const ref=source.words.find(s=>s.word===q.word && s.reading===q.reading);
    assert.ok(ref,q.word);
    assert.equal(q.level,ref.level,q.word);
    const prefix={noun:'n',verb:'v',adjective:'adj',adverb:'adv'}[q.readingCategory];
    assert.ok(ref.pos.some(p=>p.startsWith(prefix) || (prefix==='adv' && p==='n-adv')),`${q.word}: ${ref.pos}`);
    assert.ok(q.meaning && q.explanation && q.levelBasis==='vocabulary-source');
    assert.equal(new Set([q.reading,...q.distractors]).size,4,q.word);
    const suffix=q.word.match(/[ぁ-ゖ]+$/u)?.[0];
    for(const wrong of q.distractors){
      assert.match(wrong,/^[ぁ-ゖ]+$/u);
      assert.ok(!ref.readings.includes(wrong),`${q.word}: accepted ${wrong}`);
      assert.equal(editDistance(q.reading,wrong),1,`${q.word}: distant ${wrong}`);
      if(suffix && q.reading.endsWith(suffix))assert.ok(wrong.endsWith(suffix),`${q.word}: altered okurigana`);
    }
  }
});

test('all previous questions remain and ordinary vocabulary returns to its source level',()=>{
  const pool=getQuizPool('jlpt-reading');
  assert.equal(pool.length,464);
  for(const q of [...JLPT_READINGS,...SIMILAR_READING,...SPECIAL_READINGS]){
    const current=pool.find(p=>practiceQuestionKey(p)===practiceQuestionKey(q));
    assert.ok(current,`missing old question: ${q.word}`);
    assert.equal(current.level,q.level,q.word);
    if(q.sentence){assert.equal(current.sentence,q.sentence);assert.equal(current.sentenceMeaning,q.sentenceMeaning);}
  }
  for(const word of ['先週','勉強','病院','郵便局','図書館','誕生日','授業'])assert.ok(getQuizPool('jlpt-reading','N5').some(q=>q.word===word),word);
  for(const level of levels){
    const counts=readingComposition(getQuizPool('jlpt-reading',level));
    for(const category of categories)assert.ok(counts.find(c=>c.key===category).count>=8,`${level}: missing ${category}`);
  }
});

test('10, 20 and 50 question sessions include all four word classes without count/date domination',()=>{
  for(const level of [...levels,'all']){
    const pool=getQuizPool('jlpt-reading',level);
    for(const count of [10,20,50]){
      for(let seed=1;seed<=100;seed++){
        const questions=selectReadingQuestions(pool,count,randomWithSeed(seed));
        assert.equal(questions.length,count);
        assert.equal(new Set(questions.map(practiceQuestionKey)).size,count);
        for(const category of categories)assert.ok(questions.some(q=>q.readingCategory===category),`${level} ${count}: ${category}`);
        assert.ok(questions.filter(q=>q.readingCategory==='special').length<=Math.floor(count/5));
        assert.ok(questions.every(q=>level==='all' || q.level===level));
      }
    }
  }
  const n5=readingComposition(selectReadingQuestions(getQuizPool('jlpt-reading','N5'),10,randomWithSeed(21)));
  assert.deepEqual(n5.map(c=>c.count),[2,2,2,2,2]);
});

test('full-bank/custom sessions preserve all questions, both 1日 contexts, and no mutation',()=>{
  const pool=getQuizPool('jlpt-reading');
  const before=JSON.stringify(pool);
  for(const count of [0,1,3,7,37,121,100000]){
    const session=selectReadingQuestions(pool,count,randomWithSeed(count));
    assert.equal(session.length,Math.min(count,pool.length));
    assert.equal(new Set(session.map(practiceQuestionKey)).size,session.length);
  }
  const full=createReadingQuiz(pool,pool.length,randomWithSeed(55));
  assert.equal(full.filter(q=>q.prompt==='1日').length,2);
  assert.ok(full.every(q=>q.readingCategory && q.meaning && q.options.length===4));
  assert.equal(JSON.stringify(pool),before);
  assert.deepEqual(selectReadingQuestions([],50),[]);
  assert.notDeepEqual(selectReadingQuestions(pool,20,randomWithSeed(1)),selectReadingQuestions(pool,20,randomWithSeed(2)));
  const onlyCounts=pool.filter(q=>q.readingCategory==='special');
  assert.equal(selectReadingQuestions(onlyCounts,20).length,20);
});
