import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIMILAR_VOCABULARY } from '../similar-quiz-data.js';
import { SIMILAR_READING, SIMILAR_WRITING, QUIZ_TOPICS, mergePracticeBank, filterTopicQuestions, quizTopicCount, supportsQuizTopics, resolveQuizTopic } from '../similar-quiz-core.js';
import { SIMILAR_GROUPS } from '../similar-data.js';
import { RADICAL_FAMILIES } from '../radical-data.js';
import { JLPT_READINGS } from '../jlpt-reading-data.js';
import { KANJI_WRITING } from '../writing-data.js';
import { KANJI } from '../kanji-data.js';
import { createReadingQuiz } from '../jlpt-reading-core.js';
import { createWritingQuiz, sentenceParts } from '../writing-core.js';

const source=JSON.parse(readFileSync(new URL('../data/similar-quiz-source.json',import.meta.url),'utf8'));
const readings=mergePracticeBank(JLPT_READINGS,SIMILAR_READING);
const writings=mergePracticeBank(KANJI_WRITING,SIMILAR_WRITING);
const distance=(a,b)=>{let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));row=next;}return row[b.length];};

test('82 contextual words use pinned dictionary readings and levels, with real target characters',()=>{
  assert.equal(SIMILAR_VOCABULARY.length,82);
  assert.equal(new Set(SIMILAR_VOCABULARY.map(q=>q.word)).size,82);
  assert.equal(source.words.length,82);
  assert.equal(source.commit,'0d1d3410bec90bd4098a7c72de820543cb4f707c');
  for (const q of SIMILAR_VOCABULARY) {
    const original=source.words.find(s=>s.word===q.word);
    assert.ok(original,q.word);
    assert.equal(q.reading,original.reading,q.word);
    assert.equal(q.level,original.level,q.word);
    assert.equal([...q.target].length,1,q.word);
    assert.ok(KANJI.some(k=>k.char===q.target),q.word);
    assert.equal(q.word.split(q.target).length,2,q.word);
    assert.equal(sentenceParts(q.sentence).length,2,q.word);
    assert.ok(!q.sentence.includes(q.word),q.word);
    assert.ok(q.meaning && q.sentenceMeaning && q.visualExplanation && q.readingExplanation,q.word);
  }
  assert.deepEqual(new Set(SIMILAR_VOCABULARY.map(q=>q.level)),new Set(['N5','N4','N3','N2','N1']));
});

test('distractors are close, preserve okurigana and never offer accepted readings or spellings as wrong',()=>{
  for(const q of SIMILAR_VOCABULARY) {
    const original=source.words.find(s=>s.word===q.word);
    assert.equal(new Set([q.word,...q.writingDistractors]).size,4,q.word);
    assert.equal(new Set([q.reading,...q.readingDistractors]).size,4,q.word);
    for(const wrong of q.writingDistractors) {
      assert.ok(!original.spellings.includes(wrong),`${q.word}: accepted ${wrong}`);
      assert.equal(distance(q.word,wrong),1,`${q.word}: only change the target`);
      const i=q.word.indexOf(q.target);
      assert.equal(wrong.slice(0,i)+wrong.slice(i+1),q.word.slice(0,i)+q.word.slice(i+1),q.word);
      assert.match(wrong[i],/\p{Script=Han}/u,q.word);
    }
    for(const reading of [q.reading,...q.readingDistractors])assert.match(reading,/^[ぁ-ゖ]+$/u,q.word);
    for(const wrong of q.readingDistractors) {
      assert.ok(!original.readings.includes(wrong),`${q.word}: accepted ${wrong}`);
      assert.ok(distance(q.reading,wrong)<=2,q.word);
    }
    const partners=SIMILAR_GROUPS.filter(g=>g.members.some(m=>m.char===q.target)).flatMap(g=>g.members.map(m=>m.char)).filter(c=>c!==q.target);
    if(partners.length)assert.ok(q.writingDistractors.some(w=>partners.some(c=>w.includes(c))),`${q.word}: must use a known visual partner`);
  }
});

test('both directions cover all 48 comparison groups and 10 radical families with exact target membership',()=>{
  assert.equal(QUIZ_TOPICS.length,SIMILAR_GROUPS.length+RADICAL_FAMILIES.length);
  for(const topic of QUIZ_TOPICS) {
    assert.ok(quizTopicCount(topic.id)>0,topic.id);
    const write=filterTopicQuestions(writings,topic.id);
    const read=filterTopicQuestions(readings,topic.id);
    assert.deepEqual(write.map(q=>q.word).sort(),read.map(q=>q.word).sort(),topic.id);
    assert.ok(write.every(q=>topic.chars.includes(q.target)),topic.id);
  }
  assert.equal(filterTopicQuestions(writings,'radikal-air').length,9);
  assert.equal(filterTopicQuestions(readings,'radikal-perjalanan').length,8);
  for(const q of SIMILAR_READING)assert.deepEqual(q.topicIds,QUIZ_TOPICS.filter(t=>t.chars.includes(q.target)).map(t=>t.id));
});

test('existing banks merge without duplicates and retain old-only vocabulary',()=>{
  assert.equal(readings.length,180);
  assert.equal(writings.length,132);
  assert.equal(new Set(readings.map(q=>q.word)).size,readings.length);
  assert.equal(new Set(writings.map(q=>q.answer)).size,writings.length);
  assert.equal(readings.find(q=>q.word==='先週').reading,'せんしゅう');
  assert.equal(writings.find(q=>q.answer==='飲みました').prompt,'のみました');
  assert.ok(readings.find(q=>q.word==='練習').topicIds.includes('neru-ren'));
  for(const mode of ['jlpt-reading','hiragana-kanji'])assert.ok(supportsQuizTopics(mode));
  for(const mode of ['hiragana-katakana','meaning','reading'])assert.ok(!supportsQuizTopics(mode));
});

test('topic and level filters compose, and links safely reject unknown topic ids',()=>{
  const filtered=filterTopicQuestions(readings,'radikal-air','N5');
  assert.deepEqual(new Set(filtered.map(q=>q.word)),new Set(['洗う','泳ぐ','海','池']));
  assert.ok(filtered.every(q=>q.level==='N5'));
  assert.equal(filterTopicQuestions(readings,'similar').length,82);
  assert.equal(filterTopicQuestions(writings,'similar').length,82);
  assert.deepEqual(filterTopicQuestions(readings,'missing'),[]);
  assert.deepEqual(filterTopicQuestions(readings,'ki-shi','N5'),[]);
  assert.equal(resolveQuizTopic('ki-shi'),'ki-shi');
  assert.equal(resolveQuizTopic('similar'),'similar');
  for(const id of [undefined,'<script>','unknown'])assert.equal(resolveQuizTopic(id),'all');
});

test('two-way sessions preserve context and group links, shuffle choices, and cap small groups',()=>{
  let seed=546;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const positions=new Set();
  for(const [bank,create] of [[readings,createReadingQuiz],[writings,createWritingQuiz]]) {
    const before=JSON.stringify(bank);
    for(const topic of ['similar','radikal-air','radikal-perjalanan','ki-shi']) {
      const pool=filterTopicQuestions(bank,topic);
      const quiz=create(pool,20,random);
      assert.equal(quiz.length,Math.min(20,pool.length));
      assert.equal(new Set(quiz.map(q=>q.prompt)).size,quiz.length);
      for(const q of quiz) {
        assert.ok(q.sentence && q.sentenceMeaning && q.explanation);
        assert.ok(q.topicIds?.length && q.target);
        assert.equal(q.options.length,4);
        assert.equal(q.options.filter(a=>a===q.answer).length,1);
        positions.add(q.options.indexOf(q.answer));
      }
    }
    assert.equal(JSON.stringify(bank),before);
  }
  assert.equal(positions.size,4);
});

test('ambiguous words retain sentence context and do not include alternate readings as distractors',()=>{
  for(const [word,reading,excluded] of [['縁','ふち','えん'],['辛い','からい','つらい'],['玉','たま','ぎょく'],['入る','はいる','いる']]) {
    const q=SIMILAR_READING.find(q=>q.word===word);
    assert.equal(q.reading,reading);
    assert.ok(!q.distractors.includes(excluded));
    assert.ok(q.sentence);
  }
  const outskirts=SIMILAR_WRITING.find(q=>q.answer==='郊外');
  assert.ok(outskirts.distractors.includes('校外'));
  assert.match(outskirts.sentence,/とし/);
  assert.match(outskirts.explanation,/luar sekolah/);
});
