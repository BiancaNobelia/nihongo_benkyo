import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KANJI } from '../kanji-data.js';
import { LEVELS } from '../levels.js';
import { filterKanji, createQuiz, eligibleQuizCards, cleanProgress, localDay } from '../core.js';
const source = JSON.parse(readFileSync(new URL('../data/catalog-source.json', import.meta.url)));
const curated = JSON.parse(readFileSync(new URL('../data/curated.json', import.meta.url)));

test('all study cards contain complete, unique Japanese data', () => {
  assert.equal(KANJI.length, 2383);
  assert.equal(new Set(KANJI.map(k => k.char)).size, KANJI.length);
  for (const k of KANJI) {
    assert.match(k.char, /^\p{Script=Han}$/u);
    assert.ok(LEVELS.includes(k.level));
    assert.ok(Number.isInteger(k.strokes) && k.strokes > 0);
    assert.ok(k.on.length || k.kun.length);
    assert.ok(k.meaning && k.meaningsEn.length);
    if (k.example) {
      assert.ok(k.example.meaning && k.example.reading);
      assert.match(k.example.reading, /^[\p{Script=Hiragana}ー]+$/u);
      assert.ok(k.example.word.includes(k.char));
    }
  }
});
test('all five levels match every character in the pinned source and preserve existing cards', () => {
  const counts = {N5:84,N4:169,N3:387,N2:398,N1:1345};
  for (const level of LEVELS) {
    const actual = KANJI.filter(k => k.level === level);
    assert.equal(actual.length, counts[level]);
    assert.deepEqual(actual.map(k => k.char).sort(), source.filter(k => k.level === level).map(k => k.char).sort());
  }
  for (const char of Object.keys(curated)) assert.ok(KANJI.some(k => k.char === char));
  assert.equal(KANJI.filter(k => k.example).length, 2378);
});
test('search combines level, meaning, Japanese reading, and saved filters', () => {
  assert.deepEqual(filterKanji(KANJI, {query:'  BELAJAR ', level:'N5'}).map(k => k.char), ['学']);
  assert.ok(filterKanji(KANJI, {query:'まなぶ'}).some(k => k.char === '学'));
  assert.ok(filterKanji(KANJI, {query:'がくせい'}).some(k => k.char === '学'));
  assert.deepEqual(filterKanji(KANJI, {collection:'saved',saved:['学']}).map(k => k.char), ['学']);
  assert.equal(filterKanji(KANJI, {collection:'new',known:KANJI.map(k => k.char)}).length, 0);
  assert.equal(filterKanji(KANJI, {query:'<script>'}).length, 0);
  assert.ok(filterKanji(KANJI, {query:'depression',level:'N1'}).some(k => k.char === '鬱'));
  assert.equal(filterKanji(KANJI, {query:'\u{20b9f}',level:'N1'})[0].char, '\u{20b9f}');
});
test('every quiz mode has four distinct answers with one correct answer and no repeated question', () => {
  let seed = 12345;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (const level of ['all',...LEVELS]) {
    const pool = filterKanji(KANJI, {level});
    for (const mode of ['meaning','kanji','reading']) {
      const questions = createQuiz(pool, mode, 20, random);
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
test('reading quizzes skip missing examples and never offer another valid reading as a wrong answer', () => {
  const k = KANJI.find(k => k.char === '舜');
  assert.equal(eligibleQuizCards([k], 'reading').length, 0);
  assert.equal(eligibleQuizCards([k], 'meaning').length, 1);
  const fixture = [
    {char:'生',meaning:'Hidup',on:[],kun:[],example:{word:'生',reading:'せい',readings:['せい','しょう']}},
    {char:'小',meaning:'Kecil',on:[],kun:[],example:{word:'小',reading:'しょう'}},
    {char:'火',meaning:'Api',on:[],kun:[],example:{word:'火',reading:'ひ'}}
  ];
  const question = createQuiz(fixture,'reading',3,()=>0.5).find(q => q.kanji.char === '生');
  assert.ok(!question.options.includes('しょう'));
});
test('kanji quiz distractors exclude synonyms even when Indonesian labels differ', () => {
  const fixture = [
    {char:'林',meaning:'Rimba',meaningsEn:['forest']},
    {char:'森',meaning:'Hutan',meaningsEn:['forest']},
    {char:'山',meaning:'Gunung',meaningsEn:['mountain']}
  ];
  const question = createQuiz(fixture,'kanji',3,()=>0.5).find(q => q.kanji.char === '林');
  assert.ok(!question.options.includes('森'));
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
