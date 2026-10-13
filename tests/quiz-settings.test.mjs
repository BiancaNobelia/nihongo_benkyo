import test from 'node:test';
import assert from 'node:assert/strict';
import { KANJI } from '../kanji-data.js';
import { LEVELS } from '../levels.js';
import { JLPT_READINGS } from '../jlpt-reading-data.js';
import { KATAKANA_WRITING } from '../writing-data.js';
import { PRACTICE_BANKS, getQuizPool } from '../practice-banks.js';
import { kanjiWordLevel, assignKanjiLevels, requestedQuizCount } from '../quiz-settings.js';
import { answerDetails, answerDetailsMarkup } from '../quiz-feedback.js';
import { createReadingQuiz } from '../jlpt-reading-core.js';
import { createWritingQuiz } from '../writing-core.js';
import { createQuiz, cleanProgress } from '../core.js';

const modes=['jlpt-reading','hiragana-kanji','hiragana-katakana','meaning','kanji','reading'];
const make=(mode,pool,count)=>mode==='jlpt-reading' ? createReadingQuiz(pool,count) : mode.startsWith('hiragana-') ? createWritingQuiz(pool,count) : createQuiz(pool,mode,count);
const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

test('question counts accept 10, 20, 50 and positive custom integers only',()=>{
  for(const n of [10,20,50])assert.equal(requestedQuizCount(String(n)),n);
  for(const n of ['1','37',' 80 ','100000'])assert.equal(requestedQuizCount('custom',n),Number(n));
  for(const n of ['',0,-1,'2.5','abc','1e2','Infinity','9007199254740992'])assert.equal(requestedQuizCount('custom',n),null,String(n));
  assert.equal(requestedQuizCount('5'),null);
});

test('compounds follow the hardest catalog kanji without changing source vocabulary levels',()=>{
  for(const [word,level] of [['六本','N5'],['六台','N4'],['六杯','N3'],['六枚','N2'],['韓国','N1'],['三百円','N5'],['1日','N5']])assert.equal(kanjiWordLevel(word),level,word);
  const before=JSON.stringify(JLPT_READINGS);
  const assigned=assignKanjiLevels(JLPT_READINGS);
  assert.equal(JSON.stringify(JLPT_READINGS),before);
  assert.ok(assigned.some((q,i)=>q.level!==JLPT_READINGS[i].level));
  assert.deepEqual(assigned.map(q=>q.vocabularyLevel),JLPT_READINGS.map(q=>q.level));
  assert.deepEqual(PRACTICE_BANKS['hiragana-katakana'],KATAKANA_WRITING);
});

test('all material is partitioned by level using target kanji, including catalog examples',()=>{
  const levelMap=new Map(KANJI.map(k=>[k.char,k.level]));
  for(const mode of modes){
    assert.equal(LEVELS.reduce((sum,l)=>sum+getQuizPool(mode,l).length,0),getQuizPool(mode).length,mode);
    for(const level of LEVELS){
      const pool=getQuizPool(mode,level);
      assert.ok(pool.length>0,`${mode} ${level}`);
      for(const q of pool){
        if(mode==='hiragana-katakana'){assert.equal(q.level,level);continue;}
        const word=q.word || q.answer || (mode==='reading' ? q.example.word : q.char);
        const ranks=[...word].filter(c=>/\p{Unified_Ideograph}/u.test(c)).map(c=>{
          // Some N1 catalog examples include rare characters outside the catalog.
          // They must not cause a question to leak into an easier level.
          if(!levelMap.has(c)){
            assert.equal(mode,'reading',`${word}: uncatalogued kanji in curated bank`);
            assert.equal(level,'N1',`${word}: uncatalogued kanji below N1`);
            return -1;
          }
          return LEVELS.indexOf(levelMap.get(c));
        });
        assert.equal(LEVELS[Math.max(...ranks)],level,`${mode}: ${word}`);
      }
    }
  }
  assert.ok(getQuizPool('jlpt-reading','N5').some(q=>q.id==='date:1'));
  assert.ok(getQuizPool('jlpt-reading','N4').some(q=>q.word==='六台'));
  assert.ok(!getQuizPool('jlpt-reading','N5').some(q=>q.word==='六台'));
});

test('50 and custom sessions cap at the available bank and keep distinct question identities',()=>{
  for(const mode of modes){
    const pool=getQuizPool(mode,'N5');
    for(const count of [10,20,50,37,100000]){
      const questions=make(mode,pool,count);
      assert.equal(questions.length,Math.min(count,pool.length),mode);
      const keys=questions.map(q=>q.id || (q.kanji ? q.kanji.char : `${q.prompt}:${q.sentence}`));
      assert.equal(new Set(keys).size,questions.length,mode);
      for(const q of questions){
        assert.equal(q.options.length,4);
        assert.equal(new Set(q.options).size,4);
        assert.equal(q.options.filter(a=>a===q.answer).length,1);
      }
    }
  }
  const history=[50,37,80].map(total=>({date:'2026-10-13',total,correct:total-1,mode:'jlpt-reading'}));
  assert.deepEqual(cleanProgress({history},KANJI).history,history);
});

test('every mode supplies an Indonesian meaning even without an explanation',()=>{
  for(const mode of modes){
    for(const question of make(mode,getQuizPool(mode,'N5'),1000)){
      const q={...question,explanation:''};
      const detail=answerDetails(q,mode);
      assert.ok(detail.word && detail.meaning,`${mode}: ${q.prompt}`);
      const html=answerDetailsMarkup(q,mode,escape);
      assert.ok(html.includes(escape(detail.meaning)));
      assert.ok(html.includes('answer-meaning'));
      if(q.sentence){
        assert.ok(detail.sentenceMeaning,`${mode}: missing sentence meaning`);
        assert.ok(!detail.sentence.includes('{target}'));
        assert.ok(detail.sentence.includes(detail.word));
        assert.ok(html.includes('Arti kalimat'));
        assert.ok(html.includes(escape(q.sentenceMeaning)));
      }
    }
  }
});

test('feedback reconstructs the correct word and full translation in either quiz direction',()=>{
  for(const mode of ['jlpt-reading','hiragana-kanji']){
    const pool=getQuizPool(mode).filter(q=>(q.word||q.answer)==='洗う');
    assert.equal(pool.length,1);
    const [q]=make(mode,pool,1);
    const detail=answerDetails(q,mode);
    assert.equal(detail.word,'洗う');
    assert.equal(detail.reading,'あらう');
    assert.ok(detail.sentence.includes('洗う'));
    assert.ok(detail.sentenceMeaning);
  }
  const html=answerDetailsMarkup({prompt:'<word>',answer:'かな',meaning:'<meaning>',sentence:'{target}<sentence>',sentenceMeaning:'<translation>',explanation:'<explanation>'},'jlpt-reading',escape);
  assert.ok(!html.includes('<word>') && !html.includes('<translation>'));
  assert.ok(html.includes('&lt;word&gt;') && html.includes('&lt;translation&gt;'));
});
