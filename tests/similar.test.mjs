import test from 'node:test';
import assert from 'node:assert/strict';
import { KANJI } from '../kanji-data.js';
import { SIMILAR_GROUPS as groups, SIMILAR_CATEGORIES as categories } from '../similar-data.js';
import { filterSimilarGroups, groupsForCharacter, createSimilarPractice } from '../similar-core.js';

test('visual comparison groups only reference reviewed catalog characters', () => {
  assert.equal(groups.length, 48);
  assert.equal(new Set(groups.map(g => g.id)).size, groups.length);
  const chars = new Set(KANJI.map(k => k.char));
  const grouped = new Set();
  for (const group of groups) {
    assert.match(group.id, /^[a-z0-9-]+$/);
    assert.ok(categories[group.category]);
    assert.ok(group.title && group.focus && group.tip);
    assert.ok(group.members.length >= 2 && group.members.length <= 4);
    assert.equal(new Set(group.members.map(m => m.char)).size, group.members.length);
    assert.equal(new Set(group.members.map(m => m.cue)).size, group.members.length);
    for (const member of group.members) {
      assert.ok(chars.has(member.char), `${group.id}: missing ${member.char}`);
      assert.ok(member.cue && !member.cue.includes(member.char), 'A practice cue must not contain its answer');
      grouped.add(member.char);
    }
  }
  assert.equal(grouped.size, 117);
  for (const level of ['N5','N4','N3','N2','N1']) assert.ok(KANJI.some(k => k.level === level && grouped.has(k.char)));
});

test('level filters retain other-level partners for meaningful comparison', () => {
  const group = groups.find(g => g.id === 'tsuchi-samurai');
  assert.equal(KANJI.find(k => k.char === '土').level, 'N5');
  assert.equal(KANJI.find(k => k.char === '士').level, 'N1');
  const found = filterSimilarGroups(groups, KANJI, {level:'N5', query:'土'});
  assert.ok(found.includes(group));
  assert.deepEqual(group.members.map(m => m.char), ['土','士']);
  assert.ok(filterSimilarGroups([group], KANJI, {level:'N1'}).includes(group));
  assert.equal(filterSimilarGroups([group], KANJI, {level:'N4'}).length, 0);
});

test('similarity search combines category, Japanese text, Indonesian meanings and readings', () => {
  assert.deepEqual(filterSimilarGroups(groups, KANJI, {query:'  未 ',category:'position'}).map(g => g.id), ['mi-sue']);
  assert.ok(filterSimilarGroups(groups, KANJI, {query:'  TANAH '}).some(g => g.id === 'tsuchi-samurai'));
  assert.ok(filterSimilarGroups(groups, KANJI, {query:'まつ'}).some(g => g.members.some(m => m.char === '待')));
  assert.ok(filterSimilarGroups(groups, KANJI, {category:'stroke'}).every(g => g.category === 'stroke'));
  assert.equal(filterSimilarGroups(groups, KANJI, {query:'<script>'}).length, 0);
});

test('related comparisons include every group for a character without unrelated groups', () => {
  assert.deepEqual(groupsForCharacter(groups, '緑').map(g => g.id), ['midori-roku','midori-en']);
  assert.deepEqual(groupsForCharacter(groups, 'A'), []);
});

test('practice tests every member once and only offers partners from the selected group', () => {
  for (const group of groups) {
    const before = JSON.stringify(group);
    for (const random of [() => 0, () => 0.99]) {
      const questions = createSimilarPractice(group, random);
      assert.deepEqual(questions.map(q => q.answer).sort(), group.members.map(m => m.char).sort());
      for (const q of questions) {
        assert.deepEqual(q.options.toSorted(), group.members.map(m => m.char).sort());
        assert.equal(q.options.filter(c => c === q.answer).length, 1);
        assert.equal(q.prompt, group.members.find(m => m.char === q.answer).cue);
      }
    }
    assert.equal(JSON.stringify(group), before, 'Practice must not reorder the comparison');
  }
});

test('stroke differences used in learning tips agree with dictionary stroke counts', () => {
  const strokes = char => KANJI.find(k => k.char === char).strokes;
  for (const [a,b] of [['木','本'],['王','玉'],['日','目'],['白','百'],['休','体'],['辛','幸']]) {
    assert.equal(strokes(b)-strokes(a), 1, `${a}/${b}`);
  }
  for (const [a,b] of [['未','末'],['土','士'],['牛','午'],['天','夫'],['千','干']]) {
    assert.equal(strokes(a), strokes(b), `${a}/${b}`);
  }
});
