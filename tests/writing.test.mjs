import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KANJI_WRITING, KATAKANA_WRITING } from '../writing-data.js';
import { createWritingQuiz, sentenceParts } from '../writing-core.js';
import { filterReadingQuestions } from '../jlpt-reading-core.js';
import { cleanProgress } from '../core.js';
import { KANJI } from '../kanji-data.js';

const source = JSON.parse(readFileSync(new URL('../data/writing-source.json', import.meta.url)));
const banks = [KANJI_WRITING, KATAKANA_WRITING];
const hiragana = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0)-0x60));
const editDistance = (a,b) => {
  let row = Array.from({length:b.length+1}, (_,i) => i);
  for (let i=1; i<=a.length; i++) {
    const next=[i];
    for (let j=1; j<=b.length; j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));
    row=next;
  }
  return row[b.length];
};
let seed = 71283;
const random = () => ((seed = (Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('both writing banks contain 50 unique questions, 10 per level, grounded in vocabulary sources', () => {
  assert.equal(source.commit, '0d1d3410bec90bd4098a7c72de820543cb4f707c');
  assert.equal(source.words.length, 100);
  for (const bank of banks) {
    assert.equal(bank.length,50);
    assert.equal(new Set(bank.map(q=>q.id)).size,50);
    for (const level of ['N5','N4','N3','N2','N1']) assert.equal(filterReadingQuestions(bank,level).length,10);
    for (const q of bank) {
      const origin=source.words.find(s=>s.id===q.id);
      assert.ok(origin,q.id);
      assert.equal(q.sourceWord,origin.sourceWord);
      assert.equal(q.level,origin.level);
      const expected=q.sourceWord==='飲む' ? origin.reading.slice(0,-1)+'みました' : hiragana(origin.reading);
      assert.equal(q.prompt,expected,q.id);
      assert.equal(q.answer,q.sourceWord==='飲む'?'飲みました':origin.sourceWord,q.id);
      assert.ok(q.meaning && q.explanation.length>30 && q.sentenceMeaning.length>10,q.id);
    }
  }
});

test('writing questions underline exactly one target without leaking the answer in the sentence', () => {
  for (const q of banks.flat()) {
    assert.match(q.prompt,/^[ぁ-ゖー]+$/u,q.id);
    const parts=sentenceParts(q.sentence);
    assert.equal(parts.length,2,q.id);
    assert.ok(!q.sentence.includes(q.answer),q.id);
    assert.equal(parts.join(q.prompt),q.sentence.replace('{target}',q.prompt));
    assert.equal(new Set([q.answer,...q.distractors]).size,4,q.id);
    assert.equal(q.distractors.length,3,q.id);
    for (const wrong of q.distractors) assert.ok(editDistance(q.answer,wrong)<=2,`${q.id}: unrelated ${wrong}`);
  }
});

test('katakana options stay in katakana and only the answer matches the hiragana prompt', () => {
  for (const q of KATAKANA_WRITING) {
    for (const option of [q.answer,...q.distractors]) assert.match(option,/^[ァ-ヶー]+$/u,`${q.id}: ${option}`);
    assert.equal(hiragana(q.answer),q.prompt,q.id);
    for (const wrong of q.distractors) assert.notEqual(hiragana(wrong),q.prompt,q.id);
  }
});

test('kanji distractors preserve okurigana and avoid alternate forms used for the same word', () => {
  const rejectedVariants = {'衝撃':['衝擊','衝激'], '一斉':['一齊'], '学校':['學校']};
  for (const q of KANJI_WRITING) {
    const kana=s=>s.replace(/\p{Script=Han}/gu,'');
    for (const option of [q.answer,...q.distractors]) {
      assert.match(option,/\p{Script=Han}/u,q.id);
      assert.equal(kana(option),kana(q.answer),q.id);
    }
    for (const valid of rejectedVariants[q.answer]||[]) assert.ok(!q.distractors.includes(valid),`${q.id}: accepted spelling ${valid}`);
  }
});

test('the reference-style examples use similar glyphs and the correct inflected kanji', () => {
  const drink=KANJI_WRITING.find(q=>q.prompt==='のみました');
  assert.equal(drink.answer,'飲みました');
  assert.ok(drink.distractors.includes('飯みました'));
  const shower=KATAKANA_WRITING.find(q=>q.prompt==='しゃわー');
  assert.equal(shower.answer,'シャワー');
  assert.deepEqual(shower.distractors,['シャウー','ツャワー','ツャウー']);
  assert.equal(KANJI_WRITING.find(q=>q.prompt==='はんぶん').answer,'半分');
});

test('sessions shuffle choices without repeats and cap counts when only 10 words are available', () => {
  const before=JSON.stringify(banks);
  const positions=new Set();
  for (const bank of banks) {
    for (const level of ['all','N5','N4','N3','N2','N1']) {
      const pool=filterReadingQuestions(bank,level);
      for (const count of [5,10,20]) {
        const quiz=createWritingQuiz(pool,count,random);
        assert.equal(quiz.length,Math.min(pool.length,count));
        assert.equal(new Set(quiz.map(q=>q.prompt)).size,quiz.length);
        for (const q of quiz) {
          assert.ok(level==='all'||q.level===level);
          assert.equal(q.options.length,4);
          assert.equal(q.options.filter(a=>a===q.answer).length,1);
          assert.ok(q.sentenceMeaning && q.explanation);
          positions.add(q.options.indexOf(q.answer));
        }
      }
    }
  }
  assert.equal(positions.size,4);
  assert.equal(JSON.stringify(banks),before);
  assert.deepEqual(createWritingQuiz([],10),[]);
  assert.deepEqual(createWritingQuiz(KANJI_WRITING,0),[]);
});

test('both writing modes retain their scores with existing modes after reloading progress', () => {
  const history=['meaning','kanji','reading','jlpt-reading','hiragana-kanji','hiragana-katakana'].map(mode=>({mode,level:'N5',correct:4,total:5,date:'2026-10-13T08:00:00Z'}));
  assert.deepEqual(cleanProgress(JSON.parse(JSON.stringify({history})),KANJI).history,history);
});
