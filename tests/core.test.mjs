import test from 'node:test';
import assert from 'node:assert/strict';
import { KANJI } from '../kanji-data.js';
import { filterKanji, createQuiz, cleanProgress, localDay } from '../core.js';

test('all study cards contain complete, unique Japanese data', () => {
  assert.equal(KANJI.length, 110);
  assert.equal(new Set(KANJI.map(k => k.char)).size, KANJI.length);
  for (const k of KANJI) {
    assert.match(k.char, /^\p{Script=Han}$/u);
    assert.ok(['N5', 'N4', 'N3'].includes(k.level));
    assert.ok(Number.isInteger(k.strokes) && k.strokes > 0);
    assert.ok(k.on.length || k.kun.length);
    assert.ok(k.meaning && k.example.meaning && k.example.reading);
    assert.ok(k.example.word.includes(k.char));
  }
});
test('search combines level, meaning, Japanese reading, and saved filters', () => {
  assert.deepEqual(filterKanji(KANJI, {query:'  BELAJAR ', level:'N5'}).map(k => k.char), ['学']);
  assert.ok(filterKanji(KANJI, {query:'まなぶ'}).some(k => k.char === '学'));
  assert.ok(filterKanji(KANJI, {query:'がくせい'}).some(k => k.char === '学'));
  assert.deepEqual(filterKanji(KANJI, {collection:'saved',saved:['学']}).map(k => k.char), ['学']);
  assert.equal(filterKanji(KANJI, {collection:'new',known:KANJI.map(k => k.char)}).length, 0);
  assert.equal(filterKanji(KANJI, {query:'<script>'}).length, 0);
});
test('every quiz mode has four distinct answers with one correct answer and no repeated question', () => {
  for (const level of ['all','N5','N4','N3']) {
    const pool = filterKanji(KANJI, {level});
    for (const mode of ['meaning','kanji','reading']) {
      const questions = createQuiz(pool, mode, 20);
      assert.equal(questions.length, Math.min(pool.length, 20));
      assert.equal(new Set(questions.map(q => q.kanji.char)).size, questions.length);
      for (const q of questions) {
        assert.equal(q.options.length, 4);
        assert.equal(new Set(q.options).size, 4);
        assert.equal(q.options.filter(a => a === q.answer).length, 1);
      }
    }
  }
});
test('malformed and outdated saved progress cannot corrupt the app', () => {
  assert.deepEqual(cleanProgress(null, KANJI), {known:[],saved:[],days:[],history:[]});
  const result = cleanProgress({known:['学','学','invalid'], saved:{bad:true},days:[null,'2026-10-13','2026-10-13'],history:[{date:'invalid',total:10,correct:20}, {date:'2026-10-13',total:5,correct:3,mode:'meaning'}]}, KANJI);
  assert.deepEqual(result.known, ['学']);
  assert.deepEqual(result.saved, []);
  assert.deepEqual(result.days, ['2026-10-13']);
  assert.equal(result.history.length, 1);
});
test('learning days follow local dates rather than UTC boundaries', () => {
  assert.equal(localDay(new Date(2026, 9, 13, 0, 1)), '2026-10-13');
});
