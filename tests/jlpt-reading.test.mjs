import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JLPT_READINGS } from '../jlpt-reading-data.js';
import { filterReadingQuestions, createReadingQuiz } from '../jlpt-reading-core.js';
import { cleanProgress } from '../core.js';
import { KANJI } from '../kanji-data.js';

const source = JSON.parse(readFileSync(new URL('../data/jlpt-reading-source.json', import.meta.url)));
const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
function distance(a, b) {
  let row = Array.from({length:b.length + 1}, (_,i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j-1]+1, row[j]+1, row[j-1]+(a[i-1] === b[j-1] ? 0 : 1));
    row = next;
  }
  return row[b.length];
}
let seed = 93813;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);

test('100 distinct vocabulary questions cover 20 words per level and match the pinned source', () => {
  assert.equal(JLPT_READINGS.length, 100);
  assert.equal(new Set(JLPT_READINGS.map(q => q.word)).size, 100);
  assert.equal(source.commit, '0d1d3410bec90bd4098a7c72de820543cb4f707c');
  assert.equal(source.words.length, JLPT_READINGS.length);
  for (const level of levels) assert.equal(filterReadingQuestions(JLPT_READINGS, level).length, 20);
  for (const q of JLPT_READINGS) {
    const original = source.words.find(s => s.word === q.word);
    assert.ok(original, q.word);
    assert.equal(q.reading, original.reading, q.word);
    assert.equal(q.level, original.level, q.word);
    assert.match(q.word, /\p{Script=Han}/u);
    assert.ok(q.meaning.length > 2 && q.explanation.length > 20, q.word);
  }
});

test('every question has three similar hiragana distractors, excluding accepted source readings', () => {
  for (const q of JLPT_READINGS) {
    const valid = source.words.find(s => s.word === q.word).readings;
    assert.equal(q.distractors.length, 3, q.word);
    assert.equal(new Set([q.reading, ...q.distractors]).size, 4, q.word);
    for (const reading of [q.reading, ...q.distractors]) assert.match(reading, /^[ぁ-ゖ]+$/u, q.word);
    for (const wrong of q.distractors) {
      assert.ok(!valid.includes(wrong), `${q.word}: valid reading ${wrong} offered as incorrect`);
      assert.ok(distance(q.reading, wrong) <= 2, `${q.word}: unrelated distractor ${wrong}`);
    }
  }
});

test('先週 mixes another real kanji reading with sound distractors, keeping one correct answer', () => {
  const q = JLPT_READINGS.find(q => q.word === '先週');
  const [question] = createReadingQuiz([q], 1, random);
  assert.equal(question.answer, 'せんしゅう');
  assert.equal(new Set(question.options).size,4);
  assert.ok(question.options.includes('さきしゅう'));
  assert.ok(question.options.includes('せんしゅ'));
  assert.equal(question.options.filter(a=>a==='せんしゅう').length,1);
  assert.equal(question.meaning, 'Minggu lalu');
});

test('sessions randomize question and option order, stay in level, and never repeat a word', () => {
  const before = JSON.stringify(JLPT_READINGS);
  const answerPositions = new Set();
  for (const level of ['all', ...levels]) {
    for (const count of [5, 10, 20]) {
      const pool = filterReadingQuestions(JLPT_READINGS, level);
      const questions = createReadingQuiz(pool, count, random);
      assert.equal(questions.length, count);
      assert.equal(new Set(questions.map(q => q.prompt)).size, count);
      for (const q of questions) {
        assert.ok(level === 'all' || q.level === level);
        assert.equal(q.options.length, 4);
        assert.equal(q.options.filter(o => o === q.answer).length, 1);
        answerPositions.add(q.options.indexOf(q.answer));
      }
    }
  }
  assert.equal(answerPositions.size, 4);
  assert.notDeepEqual(createReadingQuiz(JLPT_READINGS, 20, random), createReadingQuiz(JLPT_READINGS, 20, random));
  assert.equal(JSON.stringify(JLPT_READINGS), before);
  assert.equal(createReadingQuiz(JLPT_READINGS.slice(0, 2), 20).length, 2);
  assert.deepEqual(createReadingQuiz([], 20), []);
  assert.deepEqual(createReadingQuiz(JLPT_READINGS, 0), []);
});

test('saved JLPT scores survive progress cleaning alongside previous quiz modes', () => {
  const history = ['meaning', 'kanji', 'reading', 'jlpt-reading'].map(mode => ({mode, level:'N5', date:'2026-10-13T03:00:00Z', total:5, correct:3}));
  const progress = cleanProgress(JSON.parse(JSON.stringify({known:['学'], saved:['週'], history})), KANJI);
  assert.deepEqual(progress.history, history);
  assert.deepEqual(progress.known, ['学']);
  assert.deepEqual(progress.saved, ['週']);
});
