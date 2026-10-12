import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { KANJI } from '../kanji-data.js';
import { filterKanji, createQuiz } from '../core.js';

test('ambiguous English words retain the correct Japanese vocabulary meaning', () => {
  const expected = {
    '時計':'Jam', '権利':'Hak', '寝坊':'Bangun kesiangan', '乾杯':'Bersulang',
    '心臓':'Jantung', '小説':'Novel', '弁償':'Ganti rugi', '抹茶':'Matcha; bubuk teh hijau',
    '左舷':'Sisi kiri kapal', '民俗':'Adat istiadat rakyat', '挫傷':'Memar akibat benturan',
  };
  for (const [word, meaning] of Object.entries(expected)) {
    const cards = KANJI.filter(k => k.example?.word === word);
    assert.ok(cards.length, `Missing example: ${word}`);
    for (const k of cards) assert.equal(k.example.meaning, meaning, `${k.char}: ${word}`);
  }
});

test('corrected examples match the selected Japanese spelling and reading', () => {
  const expected = {
    '陸':['陸','りく','Daratan'],
    '帯':['帯','おび','Obi; ikat pinggang kimono'],
    '溝':['溝','みぞ','Selokan; parit'],
    '甲':['甲板','かんぱん','Geladak kapal'],
    '彦':['彦星','ひこぼし','Altair (nama bintang)'],
    '楓':['楓','かえで','Pohon maple'],
    '𠮟':['𠮟る','しかる','Memarahi'],
    '搾':['搾る','しぼる','Memeras'],
  };
  for (const [char, values] of Object.entries(expected)) {
    const ex = KANJI.find(k => k.char === char).example;
    assert.deepEqual([ex.word, ex.reading, ex.meaning], values);
    assert.ok(ex.readings.includes(ex.reading));
  }
});

test('every shared word and reading has a consistent Indonesian translation', () => {
  const translations = new Map();
  for (const {example: ex} of KANJI) {
    if (!ex) continue;
    const key = `${ex.word}/${ex.reading}`;
    if (translations.has(key)) assert.equal(ex.meaning, translations.get(key), key);
    translations.set(key, ex.meaning);
    assert.ok(!ex.meaning.startsWith('Untuk '), `${key}: literal English infinitive`);
  }
});

test('the published catalog uses the complete review for the pinned dictionary snapshot', () => {
  const reviewed = JSON.parse(readFileSync(new URL('../data/reviewed-id.json', import.meta.url)));
  const source = readFileSync(new URL('../data/catalog-source.json', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  assert.equal(createHash('sha256').update(source).digest('hex'), reviewed.sourceSha256);
  assert.deepEqual(Object.keys(reviewed.entries).sort(), KANJI.map(k => k.char).sort());
  for (const k of KANJI) {
    assert.equal(k.meaning, reviewed.entries[k.char].meaning, k.char);
    assert.deepEqual(k.example, reviewed.entries[k.char].example, k.char);
  }
});

test('search and quiz answers use corrected Indonesian text', () => {
  assert.ok(filterKanji(KANJI, {query:'bangun kesiangan'}).some(k => k.example?.word === '寝坊'));
  assert.ok(filterKanji(KANJI, {query:'jantung'}).some(k => k.char === '臓'));
  const pool = ['計','臓','溝','寝'].map(char => KANJI.find(k => k.char === char));
  const questions = createQuiz(pool, 'meaning', pool.length, () => 0.5);
  assert.equal(questions.length, pool.length);
  for (const q of questions) assert.equal(q.answer, q.kanji.meaning);
});
