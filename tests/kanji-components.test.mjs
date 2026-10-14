import test from 'node:test';
import assert from 'node:assert/strict';
import { KANJI_COMPONENTS } from '../kanji-components-data.js';
import { explainWordKanji, componentDetailsMarkup } from '../kanji-components.js';
import { PRACTICE_BANKS } from '../practice-banks.js';
import { createReadingQuiz } from '../jlpt-reading-core.js';
import { createWritingQuiz } from '../writing-core.js';
import { answerDetailsMarkup } from '../quiz-feedback.js';

const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

test('聞 explains the gate and ear inside, without distractor kanji in either direction', () => {
  for (const mode of ['jlpt-reading','hiragana-kanji']) {
    const pool = PRACTICE_BANKS[mode].filter(q => (q.word || q.answer) === '聞く');
    assert.equal(pool.length, 1);
    const [q] = (mode === 'jlpt-reading' ? createReadingQuiz : createWritingQuiz)(pool, 1);
    const html = answerDetailsMarkup(q, mode, escape);
    for (const text of ['門', 'gerbang', '耳', 'telinga', 'di dalam', 'Arti kalimat']) assert.ok(html.includes(text), text);
    for (const char of ['間','問','閑']) assert.ok(!html.includes(char), char);
  }
});

test('decompositions keep variant meanings, frame pieces and repeated components accurate', () => {
  assert.deepEqual(KANJI_COMPONENTS.聞.map(c=>c.symbol), ['門','耳']);
  assert.equal(KANJI_COMPONENTS.洗[0].source, '水');
  assert.equal(KANJI_COMPONENTS.洗[0].meaning, 'air');
  assert.deepEqual(KANJI_COMPONENTS.国.map(c=>c.symbol), ['囗','玉']);
  assert.deepEqual(KANJI_COMPONENTS.林.map(c=>c.symbol), ['木','木']);
  assert.ok(KANJI_COMPONENTS.明.some(c=>c.symbol==='月' && c.meaning==='bulan'));
  assert.ok(KANJI_COMPONENTS.背.some(c=>c.symbol==='月' && c.source==='肉' && c.meaning==='daging; tubuh'));
  assert.ok(KANJI_COMPONENTS.院.some(c=>c.source==='阜' && c.meaning==='bukit'));
  assert.ok(KANJI_COMPONENTS.郊.some(c=>c.source==='邑' && c.meaning==='permukiman'));
});

test('only kanji in the correct word are explained, deduplicated and escaped', () => {
  assert.deepEqual(explainWordKanji('聞き取り').map(k=>k.char), ['聞','取']);
  assert.deepEqual(explainWordKanji('人人').map(k=>k.char), ['人']);
  assert.deepEqual(explainWordKanji('しゃわー'), []);
  assert.equal(componentDetailsMarkup('シャワー', escape), '');
  assert.equal(explainWordKanji('水')[0].components.length, 0);
  assert.equal(explainWordKanji('水')[0].meaning, 'Air');
  assert.ok(!componentDetailsMarkup('<script>聞</script>', escape).includes('<script>'));
  for (const components of Object.values(KANJI_COMPONENTS)) {
    assert.ok(components.length >= 2 && components.length <= 4);
    assert.ok(components.every(c=>c.symbol && c.source && c.meaning));
  }
});

test('all focused kanji-bank notes exclude unrelated comparison kanji; kana notes and special readings remain', () => {
  for (const mode of ['jlpt-reading','hiragana-kanji']) {
    for (const q of PRACTICE_BANKS[mode]) {
      const word = q.word || q.answer;
      const unrelated = [...q.explanation].filter(c=>/\p{Unified_Ideograph}/u.test(c) && !word.includes(c));
      assert.deepEqual(unrelated, [], `${word}: ${q.explanation}`);
    }
  }
  assert.match(PRACTICE_BANKS['jlpt-reading'].find(q=>q.word==='六本').explanation, /っ/);
  assert.ok(PRACTICE_BANKS['english-katakana'].every(q=>q.explanation));
});
