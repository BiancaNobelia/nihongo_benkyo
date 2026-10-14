import test from 'node:test';
import assert from 'node:assert/strict';
import {getQuizPool} from '../practice-banks.js';
import {createReadingQuiz} from '../jlpt-reading-core.js';
import {readingQuestionKey, cleanReadingHistory, recordReadingShown, readingHistorySummary} from '../reading-history.js';

const randomWithSeed=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const pool=getQuizPool('jlpt-reading');

test('consecutive sessions exhaust each level before repeats, including reload and partial rounds',()=>{
  for(const level of ['N5','N4','N3','N2','N1','all']){
    const bank=getQuizPool('jlpt-reading',level), random=randomWithSeed(48);
    let history={};
    for(let session=0;session<20;session++){
      const count=[10,20,50,7][session%4];
      const questions=createReadingQuiz(bank,count,random,history);
      assert.equal(questions.length,Math.min(count,bank.length));
      assert.equal(new Set(questions.map(readingQuestionKey)).size,questions.length);
      for(const q of questions){
        const leastSeen=Math.min(...bank.map(p=>history[readingQuestionKey(p)] || 0));
        assert.equal(history[readingQuestionKey(q)] || 0,leastSeen,`${level}: early repeat of ${q.prompt}`);
        history=recordReadingShown(history,q);
      }
      history=cleanReadingHistory(JSON.parse(JSON.stringify(history)),bank);
    }
  }
});

test('cancelled sessions consume only displayed questions; switching levels shares history',()=>{
  const random=randomWithSeed(700), n5=getQuizPool('jlpt-reading','N5');
  let history={};
  const reserved=createReadingQuiz(n5,50,random,history);
  assert.deepEqual(history,{});
  for(const q of reserved.slice(0,3))history=recordReadingShown(history,q);
  const unseen=n5.filter(q=>!history[readingQuestionKey(q)]);
  const allNext=createReadingQuiz(pool,50,random,history);
  assert.ok(allNext.every(q=>!history[readingQuestionKey(q)]));
  assert.equal(readingHistorySummary(n5,history).unseen,n5.length-3);
  const next=createReadingQuiz(n5,unseen.length,random,history);
  assert.deepEqual(new Set(next.map(readingQuestionKey)),new Set(unseen.map(readingQuestionKey)));
  assert.ok(next.some(q=>reserved.slice(3).some(r=>readingQuestionKey(r)===readingQuestionKey(q))));
});

test('a round boundary finishes unseen questions first without duplication in a large session',()=>{
  const bank=getQuizPool('jlpt-reading','N4');
  let history=Object.fromEntries(bank.slice(2).map(q=>[readingQuestionKey(q),1]));
  const questions=createReadingQuiz(bank,bank.length+50,randomWithSeed(1),history);
  assert.equal(questions.length,bank.length);
  assert.deepEqual(new Set(questions.slice(0,2).map(readingQuestionKey)),new Set(bank.slice(0,2).map(readingQuestionKey)));
  for(const q of questions.slice(0,2))history=recordReadingShown(history,q);
  assert.deepEqual(readingHistorySummary(bank,history),{total:bank.length,unseen:0,round:2,remaining:bank.length});
});

test('history rejects corrupt values and obsolete keys and normalizes duplicate bank entries',()=>{
  const key=readingQuestionKey(pool[0]);
  for(const raw of [null,[],false,'bad'])assert.deepEqual(cleanReadingHistory(raw,pool),{});
  for(const value of [-1,0,1.5,NaN,Infinity,'3',Number.MAX_SAFE_INTEGER+1])assert.deepEqual(cleanReadingHistory({[key]:value},pool),{});
  assert.deepEqual(cleanReadingHistory({[key]:3,obsolete:200},pool),{[key]:3});
  const duplicate={...pool[0],id:'another-bank',word:` ${pool[0].word} `};
  assert.equal(createReadingQuiz([pool[0],duplicate],10).length,1);
  const dates=pool.filter(q=>q.word==='1日');
  assert.equal(new Set(dates.map(readingQuestionKey)).size,2);
  assert.equal(readingQuestionKey(dates[0]),readingQuestionKey({...dates[0],word:'１日'}));
  assert.deepEqual(readingHistorySummary([],{}),{total:0,unseen:0,round:1,remaining:0});
});
