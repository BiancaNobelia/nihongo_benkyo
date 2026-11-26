import test from 'node:test';
import assert from 'node:assert/strict';
import {materialPool, materialPage, materialVerbGroup} from '../materi-core.js';
import {BUNPOU_PATTERNS} from '../bunpou-data.js';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {MATERIAL_KOTOBA_ENTRIES} from '../materi-kotoba-data.js';

test('material library includes the existing Minna references for every chapter', () => {
  assert.equal(materialPool(BUNPOU_PATTERNS).length, 330);
  assert.equal(materialPool(KOTOBA_ENTRIES).length, 1690);
  for (const entries of [BUNPOU_PATTERNS, KOTOBA_ENTRIES]) {
    for (let chapter = 1; chapter <= 50; chapter++) {
      const book = chapter <= 25 ? 1 : 2;
      const result = materialPool(entries, {book, chapter});
      assert.ok(result.length, `chapter ${chapter} has materials`);
      assert.ok(result.every(row => row.chapter === chapter));
    }
    const firstBook = materialPool(entries, {book: 1});
    const secondBook = materialPool(entries, {book: 2});
    assert.ok(firstBook.every(row => row.chapter <= 25));
    assert.ok(secondBook.every(row => row.chapter >= 26));
    assert.equal(firstBook.length + secondBook.length, entries.length);
  }
});

test('every Minna verb has a Henkan group and non-verbs have no group', () => {
  for (const entry of KOTOBA_ENTRIES) {
    const group = materialVerbGroup(entry);
    if (entry.type === 'kata kerja') {
      assert.match(group ?? '', /^Golongan (I|II|III) · /, entry.id);
    } else {
      assert.equal(group, undefined, entry.id);
    }
  }

  const examples = [
    ['帰ります', 'Golongan I · Godan'],
    ['食べます', 'Golongan II · Ichidan'],
    ['勉強します', 'Golongan III · する'],
    ['来ます', 'Golongan III · 来る'],
  ];
  for (const [spelling, group] of examples) {
    const entry = KOTOBA_ENTRIES.find(row => row.spelling === spelling);
    assert.equal(materialVerbGroup(entry), group, spelling);
  }
});

test('material search supports Japanese, Indonesian and kana variants within selected chapters', () => {
  const entries = [
    {chapter: 1, spelling: '学生', reading: 'がくせい', meaning: 'Mahasiswa', type: 'kata benda'},
    {chapter: 2, spelling: '学生', reading: 'がくせい', meaning: 'Mahasiswa', type: 'kata benda'},
    {chapter: 26, reading: 'コンピューター', meaning: 'komputer', type: 'kata benda'},
  ];
  assert.equal(materialPool(entries, {query: '学生'}).length, 2);
  assert.equal(materialPool(entries, {chapter: 1, query: '  MAHASISWA benda  '}).length, 1);
  assert.equal(materialPool(entries, {query: 'ガクセイ'}).length, 2);
  assert.equal(materialPool(entries, {query: 'ｺﾝﾋﾟｭｰﾀｰ'}).length, 1);
  assert.equal(materialPool(entries, {book: 1, query: 'komputer'}).length, 0);
  assert.equal(materialPool(entries, {query: 'tidak-ada'}).length, 0);
  assert.equal(materialPool(entries).length, 3, 'repeated words in distinct chapters remain available');
});

test('bunpou search includes the pattern, explanation, example and reading', () => {
  const sample = BUNPOU_PATTERNS[0];
  for (const query of [sample.pattern, sample.meaning, sample.structure, sample.example, sample.translation, sample.note, sample.furigana[0][2]]) {
    assert.ok(materialPool(BUNPOU_PATTERNS, {chapter: sample.chapter, query}).includes(sample), query);
  }
});

test('pagination covers all material entries once and clamps after filters change', () => {
  const all = [];
  const count = materialPage(KOTOBA_ENTRIES).pages;
  for (let page = 1; page <= count; page++) all.push(...materialPage(KOTOBA_ENTRIES, page).rows);
  assert.deepEqual(all, KOTOBA_ENTRIES);
  const chapter = materialPool(KOTOBA_ENTRIES, {chapter: 1});
  const last = materialPage(chapter, count);
  assert.equal(last.page, last.pages);
  assert.equal(last.to, chapter.length);
  assert.deepEqual(materialPage([], 12), {rows: [], page: 1, pages: 1, from: 0, to: 0});
});


test('Kotoba materials use only the photographed entries in chapters 26 and 27', () => {
  const entries = MATERIAL_KOTOBA_ENTRIES;
  const ids = new Set(entries.map(entry => entry.id));
  assert.equal(ids.size, entries.length);
  const outsidePhotos = entry => entry.chapter !== 26 && entry.chapter !== 27;
  assert.deepEqual(entries.filter(outsidePhotos), KOTOBA_ENTRIES.filter(outsidePhotos));
  assert.equal(materialPool(entries, {chapter: 26}).length, 48);
  assert.equal(materialPool(entries, {chapter: 27}).length, 50);
  const examples = [
    [26, '診ます', '見ます・診ます', 'Golongan II · Ichidan'],
    [26, '片づきます', '片づきます', 'Golongan I · Godan'],
    [26, '宇宙飛行士', '宇宙飛行士', undefined],
    [27, '開きます', '開きます', 'Golongan I · Godan'],
    [27, '付けます', '付けます', 'Golongan II · Ichidan'],
    [27, '主人公', '主人公', undefined],
  ];
  for (const [chapter, query, spelling, group] of examples) {
    const [entry] = materialPool(entries, {chapter, query});
    assert.equal(entry?.spelling, spelling, query);
    if (entry) assert.equal(materialVerbGroup(entry), group, query);
  }
  for (const [chapter, excluded] of [
    [26, ['NHK', 'エドヤストア', '土井隆雄', '見つけます', '書類', 'お忙しい']],
    [27, ['関西空港', '秋葉原', '伊豆', 'ドラえもん', '走れます', 'ピアノ', 'ようやく']],
  ]) {
    for (const query of excluded) assert.equal(materialPool(entries, {chapter, query}).length, 0);
  }
  for (const entry of entries.filter(entry => entry.type === 'kata kerja')) {
    assert.match(materialVerbGroup(entry) ?? '', /^Golongan (I|II|III) · /, entry.id);
  }
});
