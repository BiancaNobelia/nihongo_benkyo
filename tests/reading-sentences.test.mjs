import test from 'node:test';
import assert from 'node:assert/strict';
import {KANJI} from '../kanji-data.js';
import {getQuizPool} from '../practice-banks.js';
import {createReadingQuiz} from '../jlpt-reading-core.js';
import {createQuiz} from '../core.js';
import {READING_SENTENCES, withReadingSentence} from '../reading-sentences.js';
import {usesSentence, quizPromptMarkup} from '../quiz-prompt.js';
import {answerDetails, answerDetailsMarkup} from '../quiz-feedback.js';
import {readingQuestionKey, recordReadingShown} from '../reading-history.js';
import {N5_CONTEXT_OVERRIDES} from '../n5-reading-data.js';

const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('all 663 JLPT questions have one target in context and an Indonesian translation',()=>{
  const pool=getQuizPool('jlpt-reading');
  assert.equal(pool.length,663);
  assert.equal(READING_SENTENCES.size,282);
  for(const q of pool){
    assert.equal(q.sentence.split('{target}').length,2,q.word);
    assert.ok((q.sentence.match(/[。？！]/g)||[]).length>=1,`${q.word}: sentence punctuation`);
    assert.ok(q.sentence.replace('{target}','').trim().length>=5,q.word);
    assert.ok(q.sentenceMeaning.length>10,q.word);
  }
  for(const [word,context] of READING_SENTENCES){
    const q=pool.find(q=>q.word===word);
    assert.ok(q,`orphaned sentence: ${word}`);
    assert.equal(q.sentence,N5_CONTEXT_OVERRIDES[word]?.[0] || context.sentence);
    // No isolated target reading written as a separate word in the context.
    const tokens=context.sentence.replace('{target}',' ').split(/[\s、。？！]+/u);
    assert.ok(!tokens.includes(q.reading),`${word}: answer leaked into context`);
  }
});

test('every JLPT level renders one highlighted target, without exposing answers or translations',()=>{
  for(const level of ['N5','N4','N3','N2','N1']){
    const pool=getQuizPool('jlpt-reading',level);
    for(const q of createReadingQuiz(pool,pool.length,seeded(52))){
      assert.ok(usesSentence(q,'jlpt-reading'));
      const html=quizPromptMarkup(q,'jlpt-reading',escape);
      assert.equal(html.match(/class="writing-target"/g)?.length,1,q.prompt);
      assert.ok(html.includes(`<span class="writing-target">${q.prompt}</span>`));
      assert.ok(!html.includes('{target}'));
      assert.ok(!html.includes(q.meaning));
      assert.ok(!html.includes(q.sentenceMeaning));
      const feedback=answerDetailsMarkup(q,'jlpt-reading',escape);
      assert.ok(feedback.includes(escape(q.sentenceMeaning)));
      assert.ok(feedback.includes(escape(q.meaning)));
      assert.ok(feedback.includes(escape(q.sentence.replace('{target}',q.prompt))));
    }
  }
});

test('word mode keeps a single word and its meaning, even if source data carries a sentence',()=>{
  for(const level of ['N5','N4','N3','N2','N1']){
    const questions=createQuiz(getQuizPool('reading',level),'reading',20,seeded(12));
    for(const q of questions){
      assert.equal(q.prompt,q.kanji.example.word);
      assert.equal(q.meaning,q.kanji.example.meaning);
      const withContext={...q,sentence:'わたしは {target} を しっています。',sentenceMeaning:'Kalimat yang tidak boleh tampil di mode per kata.'};
      assert.equal(usesSentence(withContext,'reading'),false);
      assert.equal(quizPromptMarkup(withContext,'reading',escape),escape(q.prompt));
      const details=answerDetails(withContext,'reading');
      assert.equal(details.sentence,'');
      assert.equal(details.sentenceMeaning,'');
      const html=answerDetailsMarkup(withContext,'reading',escape);
      assert.ok(html.includes(escape(q.meaning)));
      assert.ok(html.includes(escape(q.answer)));
      assert.ok(!html.includes('Kalimat lengkap'));
      assert.ok(!html.includes('Arti kalimat'));
    }
  }
  assert.ok(KANJI.some(k=>k.example?.word.length===1),'Single-kanji words remain available');
});

test('new sentences preserve previous exposure identities and the two date contexts',()=>{
  const pool=getQuizPool('jlpt-reading');
  const school=pool.find(q=>q.word==='学校');
  const old={...school}; delete old.sentence; delete old.sentenceMeaning;
  assert.equal(readingQuestionKey(old),readingQuestionKey(school));
  const history=recordReadingShown({},old);
  assert.ok(createReadingQuiz(pool,50,seeded(1),history).every(q=>readingQuestionKey(q)!==readingQuestionKey(school)));
  const dates=createReadingQuiz(pool.filter(q=>q.word==='1日'),2,seeded(1));
  assert.equal(new Set(dates.map(q=>q.sentence)).size,2);
  assert.deepEqual(new Set(dates.map(q=>q.answer)),new Set(['ついたち','いちにち']));
});

test('context rendering escapes text and rejects malformed or missing JLPT sentences',()=>{
  const q={word:'<word>',sentence:'<before>{target}<after>',sentenceMeaning:'Translation'};
  assert.equal(quizPromptMarkup(q,'jlpt-reading',escape),'&lt;before&gt;<span class="writing-target">&lt;word&gt;</span>&lt;after&gt;');
  assert.throws(()=>quizPromptMarkup({...q,sentence:'{target}{target}'},'jlpt-reading',escape));
  assert.throws(()=>withReadingSentence({word:'missing'}),/Missing JLPT sentence/);
  const writing={prompt:'がっこう',sentence:'あした {target} に いきます。'};
  assert.ok(quizPromptMarkup(writing,'hiragana-kanji',escape).includes('>がっこう</span>'));
  assert.equal(quizPromptMarkup({prompt:'school',sentence:'{target}へいきます。'},'english-katakana',escape),'school');
});
