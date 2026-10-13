import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIAL_READINGS, READING_TOPICS } from '../special-reading-data.js';
import { PRACTICE_BANKS } from '../practice-banks.js';
import { filterTopicQuestions, mergePracticeBank, practiceQuestionKey, topicsForMode, resolveQuizTopic } from '../similar-quiz-core.js';
import { createReadingQuiz } from '../jlpt-reading-core.js';
import { kanjiWordLevel } from '../quiz-settings.js';

const bank=PRACTICE_BANKS['jlpt-reading'];
const refs=JSON.parse(readFileSync(new URL('../data/special-reading-references.json',import.meta.url),'utf8'));
const byWord=word=>SPECIAL_READINGS.find(q=>q.word===word);

test('100 contextual reading exercises have complete source metadata and exactly one valid choice',()=>{
  assert.equal(SPECIAL_READINGS.length,100);
  assert.equal(new Set(SPECIAL_READINGS.map(q=>q.id)).size,100);
  assert.equal(new Set(SPECIAL_READINGS.map(practiceQuestionKey)).size,100);
  for(const q of SPECIAL_READINGS){
    assert.match(q.word,/\p{Script=Han}/u,q.id);
    assert.equal(q.level,kanjiWordLevel(q.word));
    assert.equal(q.levelBasis,'kanji-catalog');
    assert.ok(refs.references.some(r=>r.id===q.sourceId),q.id);
    assert.equal(q.sentence.split('{target}').length,2,q.id);
    assert.ok(q.meaning && q.sentenceMeaning && q.explanation.length>20,q.id);
    assert.equal(q.distractors.length,3,q.id);
    assert.equal(new Set([q.reading,...q.distractors]).size,4,q.id);
    assert.ok(q.acceptedReadings.includes(q.reading),q.id);
    for(const wrong of q.distractors)assert.ok(!q.acceptedReadings.includes(wrong),`${q.id}: accepted ${wrong}`);
    for(const option of [q.reading,...q.distractors])assert.match(option,/^[ぁ-ゖ]+$/u,q.id);
    assert.ok(q.topicIds.every(id=>READING_TOPICS.some(t=>t.id===id)),q.id);
  }
});

test('requested 六本 and 中国 examples retain all four specific options',()=>{
  for(const [word,answer,options] of [
    ['六本','ろっぽん',['ろくぼん','ろくぽん','ろっぼん','ろっぽん']],
    ['中国','ちゅうごく',['ちゅごく','ちゅうごく','ちゅうがこ','ちゆごく']],
  ]){
    const [q]=createReadingQuiz([byWord(word)],1);
    assert.equal(q.prompt,word);
    assert.equal(q.answer,answer);
    assert.deepEqual(q.options.toSorted(),options.toSorted());
  }
});

test('counter sound changes are scoped to the correct counter rather than applied to every six or eight',()=>{
  const expected={
    '一本':'いっぽん','三本':'さんぼん','六本':'ろっぽん','八本':'はっぽん','十本':'じゅっぽん',
    '一台':'いちだい','三台':'さんだい','六台':'ろくだい','八台':'はちだい','十台':'じゅうだい',
    '六枚':'ろくまい','八枚':'はちまい','六個':'ろっこ','八個':'はっこ',
    '一冊':'いっさつ','六冊':'ろくさつ','八冊':'はっさつ',
    '三匹':'さんびき','六匹':'ろっぴき','八匹':'はっぴき',
    '三杯':'さんばい','六杯':'ろっぱい','八杯':'はっぱい',
    '一人':'ひとり','二人':'ふたり','四人':'よにん','三つ':'みっつ','六つ':'むっつ',
  };
  for(const [word,reading] of Object.entries(expected))assert.equal(byWord(word)?.reading,reading,word);
  const alternatives={'十本':'じっぽん','八本':'はちほん','八匹':'はちひき','八杯':'はちはい','七人':'しちにん','17日':'じゅうななにち','27日':'にじゅうななにち'};
  for(const [word,reading] of Object.entries(alternatives)){
    assert.ok(byWord(word).acceptedReadings.includes(reading),word);
    assert.ok(!byWord(word).distractors.includes(reading),word);
  }
});

test('yen amounts distinguish hundreds from thousands and always retain えん',()=>{
  const expected={
    '三百円':'さんびゃくえん','六百円':'ろっぴゃくえん','八百円':'はっぴゃくえん',
    '三千円':'さんぜんえん','六千円':'ろくせんえん','八千円':'はっせんえん',
  };
  for(const [word,reading] of Object.entries(expected))assert.equal(byWord(word)?.reading,reading,word);
  const pool=filterTopicQuestions(bank,'nominal-yen');
  assert.equal(pool.length,18);
  assert.ok(pool.every(q=>q.word.endsWith('円') && q.reading.endsWith('えん')));
});

test('all 31 calendar dates are present and 1日 keeps both disambiguated contexts',()=>{
  const expected=['ついたち','ふつか','みっか','よっか','いつか','むいか','なのか','ようか','ここのか','とおか','じゅういちにち','じゅうににち','じゅうさんにち','じゅうよっか','じゅうごにち','じゅうろくにち','じゅうしちにち','じゅうはちにち','じゅうくにち','はつか','にじゅういちにち','にじゅうににち','にじゅうさんにち','にじゅうよっか','にじゅうごにち','にじゅうろくにち','にじゅうしちにち','にじゅうはちにち','にじゅうくにち','さんじゅうにち','さんじゅういちにち'];
  for(let n=1;n<=31;n++)assert.equal(SPECIAL_READINGS.find(q=>q.id===`date:${n}`)?.reading,expected[n-1],`${n}日`);
  const firsts=bank.filter(q=>q.word==='1日');
  assert.equal(firsts.length,2);
  assert.equal(firsts.find(q=>q.contextKey==='calendar-date').reading,'ついたち');
  assert.equal(firsts.find(q=>q.contextKey==='duration').reading,'いちにち');
  assert.ok(firsts.find(q=>q.contextKey==='calendar-date').sentence.includes('こんげつ'));
  assert.ok(firsts.find(q=>q.contextKey==='duration').sentence.includes('しごと'));
  assert.equal(mergePracticeBank(firsts,firsts).length,2,'merging twice must not duplicate either context');
  const [duration]=createReadingQuiz(firsts.filter(q=>q.contextKey==='duration'),1);
  assert.equal(duration.contextKey,'duration');
  assert.equal(duration.answer,'いちにち');
  assert.equal(duration.sentence,firsts.find(q=>q.contextKey==='duration').sentence);
});

test('new topics are reading-only and do not leak into the 82 similar-kanji questions',()=>{
  assert.equal(bank.length,280);
  assert.equal(PRACTICE_BANKS['hiragana-kanji'].length,132);
  assert.equal(PRACTICE_BANKS['hiragana-katakana'].length,50);
  assert.equal(filterTopicQuestions(bank,'similar').length,82);
  for(const [id,count] of [['bacaan-khusus',100],['penghitung-benda',44],['nominal-yen',18],['tanggal-hari',33],['bunyi-kata',5]]){
    assert.equal(filterTopicQuestions(bank,id).length,count,id);
    for(const level of ['N5','N4','N3','N2','N1']){
      assert.deepEqual(filterTopicQuestions(bank,id,level),filterTopicQuestions(bank,id).filter(q=>q.level===level),`${id}: ${level}`);
    }
    assert.equal(resolveQuizTopic(id,'jlpt-reading'),id);
    assert.equal(resolveQuizTopic(id,'hiragana-kanji'),'all');
    assert.equal(filterTopicQuestions(PRACTICE_BANKS['hiragana-kanji'],id).length,0,id);
  }
  assert.equal(topicsForMode('hiragana-kanji').length,58);
  assert.equal(topicsForMode('jlpt-reading').length,72);
  assert.deepEqual(topicsForMode('hiragana-katakana'),[]);
  assert.equal(resolveQuizTopic('unknown-topic'),'all');
  assert.ok(bank.some(q=>q.word==='先週'));
});

test('sessions preserve explanations and both contexts, cap short topics, and do not mutate source data',()=>{
  const before=JSON.stringify(SPECIAL_READINGS);
  let seed=917;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(const topic of READING_TOPICS){
    const pool=filterTopicQuestions(bank,topic.id);
    const questions=createReadingQuiz(pool,20,random);
    assert.equal(questions.length,Math.min(20,pool.length));
    assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
    for(const q of questions){
      assert.equal(q.options.filter(o=>o===q.answer).length,1);
      assert.ok(q.sentence && q.sentenceMeaning && q.explanation);
      assert.ok(q.topicIds.includes(topic.id));
    }
  }
  assert.equal(JSON.stringify(SPECIAL_READINGS),before);
});
