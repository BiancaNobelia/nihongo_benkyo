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


test('Kotoba materials use only the photographed entries in chapters 26 through 42', () => {
  const entries = MATERIAL_KOTOBA_ENTRIES;
  const ids = new Set(entries.map(entry => entry.id));
  assert.equal(ids.size, entries.length);
  const outsidePhotos = entry => entry.chapter < 26 || entry.chapter > 42;
  assert.deepEqual(entries.filter(outsidePhotos), KOTOBA_ENTRIES.filter(outsidePhotos));
  for (const [chapter, count] of [
    [26, 48], [27, 50], [28, 49], [29, 45], [30, 54], [31, 42], [32, 57], [33, 54],
    [34, 52], [35, 44], [36, 47], [37, 48], [38, 44], [39, 43],
    [40, 62], [41, 54], [42, 51],
  ]) {
    assert.equal(materialPool(entries, {chapter}).length, count);
  }
  const examples = [
    [26, '診ます', '見ます・診ます', 'Golongan II · Ichidan'],
    [26, '片づきます', '片づきます', 'Golongan I · Godan'],
    [26, '宇宙飛行士', '宇宙飛行士', undefined],
    [27, '開きます', '開きます', 'Golongan I · Godan'],
    [27, '付けます', '付けます', 'Golongan II · Ichidan'],
    [27, '主人公', '主人公', undefined],
    [28, 'おしゃべりします', 'おしゃべりします', 'Golongan III · する'],
    [28, '歌手', '歌手', undefined],
    [29, 'あきます', '開きます', 'Golongan I · Godan'],
    [29, 'ポケットが付きます', '付きます', 'Golongan I · Godan'],
    [29, '電気がつきます', 'つきます', 'Golongan I · Godan'],
    [29, '倒れます', '倒れます', 'Golongan II · Ichidan'],
    [30, 'そのままにします', 'そのままにします', 'Golongan III · する'],
    [30, '目が覚めます', '目が覚めます', 'Golongan II · Ichidan'],
    [30, '丸い', '丸い', undefined],
    [31, '出席します', '出席します', 'Golongan III · する'],
    [31, '閉じます', '閉じます', 'Golongan II · Ichidan'],
    [31, '気がつきます', '気がつきます', 'Golongan I · Godan'],
    [32, '故障が直ります', '治ります・直ります', 'Golongan I · Godan'],
    [32, '無理をします', '無理をします', 'Golongan III · する'],
    [32, '星占い', '星占い', undefined],
    [33, '非常口', '非常口', undefined],
    [33, '電報を打ちます', '打ちます', 'Golongan I · Godan'],
    [33, '利用します', '利用します', 'Golongan III · する'],
    [34, '歯を磨きます', '磨きます', 'Golongan I · Godan'],
    [34, '火にかけます', '火にかけます', 'Golongan II · Ichidan'],
    [34, '親子どんぶり', '親子どんぶり', undefined],
    [35, '交わります', '交わります', 'Golongan I · Godan'],
    [35, '仲よくします', '仲よくします', 'Golongan III · する'],
    [35, '旅行社', '旅行社', undefined],
    [36, '試合に出ます', '出ます', 'Golongan II · Ichidan'],
    [36, 'チャレンジします', 'チャレンジします', 'Golongan III · する'],
    [36, 'まいねん', '毎年', undefined],
    [37, 'けんちくか', '建築家', undefined],
    [37, '埋め立てます', '埋め立てます', 'Golongan II · Ichidan'],
    [37, '彫ります', '彫ります', 'Golongan I · Godan'],
    [38, '電源を入れます', '入れます', 'Golongan II · Ichidan'],
    [38, '似ています', '似ています', 'Golongan II · Ichidan'],
    [38, '世話をします', '世話をします', 'Golongan III · する'],
    [39, 'ビルが倒れます', '倒れます', 'Golongan II · Ichidan'],
    [39, '伺います', '伺います', 'Golongan I · Godan'],
    [39, '西洋化します', '西洋化します', 'Golongan III · する'],
    [40, '量ります', '測ります・量ります', 'Golongan I · Godan'],
    [40, '手に入れます', '手に入れます', 'Golongan II · Ichidan'],
    [40, '～ぽん', '～本', undefined],
    [41, 'くださいます', 'くださいます', 'Golongan I · Godan'],
    [41, '親切にします', '親切にします', 'Golongan III · する'],
    [41, '中身', '中身', undefined],
    [42, '沸かします', '沸かします', 'Golongan I · Godan'],
    [42, '混ぜます', '混ぜます', 'Golongan II · Ichidan'],
    [42, '計算します', '計算します', 'Golongan III · する'],
    [42, 'カップラーメン', 'カップラーメン', undefined],
  ];
  for (const [chapter, query, spelling, group] of examples) {
    const [entry] = materialPool(entries, {chapter, query});
    assert.equal(entry?.spelling, spelling, query);
    if (entry) assert.equal(materialVerbGroup(entry), group, query);
  }
  for (const [chapter, excluded] of [
    [26, ['NHK', 'エドヤストア', '土井隆雄', '見つけます', '書類', 'お忙しい']],
    [27, ['関西空港', '秋葉原', '伊豆', 'ドラえもん', '走れます', 'ピアノ', 'ようやく']],
    [28, ['育てます']],
    [29, ['四ツ谷', '三宮', '濡れます']],
    [30, ['ブロードウェイ', '組み立てます']],
    [31, ['ピカソ', '上野公園', '決めます']],
    [32, ['オリンピック', '治します']],
    [33, ['叫びます', '禁止します']],
    [34, ['混ぜます', '茹でます']],
    [35, ['箱根', '日光', '白馬', 'アフリカ', '草津', '志賀高原', '比べます']],
    [36, ['ショパン', 'ライト兄弟', '努めます']],
    [37, ['ドミニカ', '源氏物語', '紫式部', '東照宮', '眠り猫', '殴ります']],
    [38, ['原爆ドーム', '測定します']],
    [39, ['感動します', '悩みます']],
    [40, ['ゴッホ', '雪祭り', 'のぞみ', '検査します']],
    [41, ['差し上げます', '受け取ります']],
    [42, ['ベートーベン', 'エリーゼのために', 'ポーランド', '国連', 'ゆでます', '役立ちます']],
  ]) {
    for (const query of excluded) assert.equal(materialPool(entries, {chapter, query}).length, 0);
  }
  for (const entry of entries.filter(entry => entry.type === 'kata kerja')) {
    assert.match(materialVerbGroup(entry) ?? '', /^Golongan (I|II|III) · /, entry.id);
  }
});
