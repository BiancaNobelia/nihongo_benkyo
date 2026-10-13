import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KANJI } from '../kanji-data.js';
import { RADICAL_FAMILIES as families } from '../radical-data.js';
import { RADICAL_MEMBERS as forms } from '../radical-members.js';
import { familiesForCharacter, filterRadicalFamilies, filterRadicalKanji, paginateRadicals } from '../radical-core.js';

const water = families.find(f=>f.id==='radikal-air');
const travel = families.find(f=>f.id==='radikal-perjalanan');
const gate = families.find(f=>f.id==='bentuk-mon');

test('radical families cover catalog characters and include every displayed example', () => {
  const catalog=new Set(KANJI.map(k=>k.char));
  assert.equal(families.length,11);
  assert.equal(new Set(families.map(f=>f.id)).size,11);
  assert.equal(new Set(families.flatMap(f=>f.members)).size,837);
  assert.equal(new Set(families.filter(f=>f!==gate).flatMap(f=>f.members)).size,824);
  for (const family of families) {
    assert.equal(new Set(family.members).size,family.members.length);
    for(const char of family.members) assert.ok(catalog.has(char),`${family.id}: ${char}`);
    for(const char of [...family.preview,...family.examples.map(e=>e.char)]) assert.ok(family.members.includes(char),`${family.id}: ${char}`);
    for(const example of family.examples) {
      assert.ok(example.word.includes(example.char));
      assert.match(example.reading,/^[ぁ-ゖー]+$/);
      assert.ok(example.cue && example.meaning && example.romaji);
    }
    assert.ok(new Set(filterRadicalKanji(family,KANJI).map(k=>k.level)).size >= 4);
  }
  const manifest=JSON.parse(readFileSync(new URL('../data/radical-source.json',import.meta.url),'utf8'));
  assert.equal(manifest.catalogCount,KANJI.length);
  assert.deepEqual(manifest.missing,[]);
  for(const [form,chars] of Object.entries(forms)) {
    assert.equal([...chars].length,manifest.counts[form]);
    assert.equal(new Set(chars).size,[...chars].length);
  }
});

test('gate family includes all catalog kanji containing complete 門, including nested forms', () => {
  const expected=[...'門間聞開問関閉簡閣闘閥欄潤閲蘭闇閑'];
  assert.deepEqual(new Set(gate.members),new Set(expected));
  assert.deepEqual(new Set(forms['門']),new Set(expected));
  for (const char of expected) {
    const [card]=filterRadicalKanji(gate,KANJI,{query:char});
    assert.equal(card.char,char);
    assert.ok(card.meaning && card.on.length);
    assert.ok(familiesForCharacter(families,char).includes(gate));
  }
  for (const char of '問聞簡潤欄蘭') assert.ok(gate.members.includes(char));
  for (const char of '問聞') assert.ok(gate.note.includes(char) || gate.tip.includes(char));
  for (const char of '同周用岡') assert.ok(!gate.members.includes(char));
  for (const query of ['門','gerbang','mon','mongamae','もん','簡','潤']) {
    assert.ok(filterRadicalFamilies(families,KANJI,query).includes(gate),query);
  }
  assert.deepEqual(filterRadicalKanji(gate,KANJI,{level:'N5'}).map(k=>k.char),['間','聞']);
  assert.equal(filterRadicalKanji(gate,KANJI,{form:'門'}).length,17);
  assert.equal(filterRadicalKanji(gate,KANJI,{query:'anggrek'})[0].char,'蘭');
});

test('water and movement match visible components, including 酒 regardless of dictionary radical', () => {
  assert.equal(water.members.length,130);
  assert.equal(travel.members.length,55);
  for(const c of '水洗注海泳河酒') assert.ok(water.members.includes(c),c);
  for(const c of '道週通近遠運送遜遡') assert.ok(travel.members.includes(c),c);
  const three=filterRadicalKanji(water,KANJI,{form:'氵'}).map(k=>k.char);
  assert.equal(three.length,123);
  assert.ok(three.includes('洗')&&three.includes('注')&&three.includes('酒'));
  for(const c of '水氷泉求泰') assert.ok(!three.includes(c),c);
  assert.ok(filterRadicalKanji(water,KANJI,{form:'水'}).some(k=>k.char==='水'));
  assert.equal(filterRadicalKanji(water,KANJI,{form:'扌'}).length,0);
  // Similar-looking components do not create accidental membership.
  assert.ok(!water.members.includes('冶')); // two dots, 冫
  assert.ok(!travel.members.includes('起')); // 走, not 辶
  assert.ok(!families.find(f=>f.id==='radikal-orang').members.includes('待')); // 彳, not 亻
  assert.ok(!families.find(f=>f.id==='radikal-kayu').members.includes('稲')); // 禾, not 木
});

test('families can be found through the requested romaji, kana, words and Indonesian themes', () => {
  for(const query of ['  MIZU  ','arau','chui','chuui','ちゅうい','注意','洗う','sanzui','cairan']) {
    assert.ok(filterRadicalFamilies(families,KANJI,query).includes(water),query);
  }
  for(const query of ['michi','shuu','みち','しゅう','道','perjalanan','shinnyou']) {
    assert.ok(filterRadicalFamilies(families,KANJI,query).includes(travel),query);
  }
  assert.deepEqual(filterRadicalFamilies(families,KANJI,'<script>'),[]);
});

test('member search composes reading, level and shape filters without returning partners from other levels', () => {
  assert.deepEqual(filterRadicalKanji(water,KANJI,{query:'chui',form:'氵'}).map(k=>k.char),['注']);
  assert.deepEqual(filterRadicalKanji(water,KANJI,{query:'  ARAU '}).map(k=>k.char),['洗']);
  assert.deepEqual(filterRadicalKanji(travel,KANJI,{query:'shuu'}).map(k=>k.char),['週']);
  const n4=filterRadicalKanji(water,KANJI,{level:'N4',form:'氵'});
  assert.ok(n4.length>0);
  assert.ok(n4.every(k=>k.level==='N4'&&forms['氵'].includes(k.char)));
  assert.deepEqual(filterRadicalKanji(water,KANJI,{level:'N5',form:'氵'}),[]);
  assert.deepEqual(filterRadicalKanji(water,KANJI,{level:'N5'}).map(k=>k.char),['水']);
  assert.deepEqual(filterRadicalKanji(water,KANJI,{query:'<script>'}),[]);
});

test('pagination reaches every family member once and clamps pages after filtering', () => {
  for(const f of families) {
    const result=filterRadicalKanji(f,KANJI);
    const pages=paginateRadicals(result,1).pages;
    const visited=[];
    for(let p=1;p<=pages;p++)visited.push(...paginateRadicals(result,p).items.map(k=>k.char));
    assert.equal(new Set(visited).size,f.members.length);
    assert.deepEqual(visited,result.map(k=>k.char));
    assert.deepEqual(result.map(k=>Number(k.level.slice(1))),result.map(k=>Number(k.level.slice(1))).toSorted((a,b)=>b-a));
  }
  assert.equal(paginateRadicals(filterRadicalKanji(water,KANJI,{query:'chui'}),6).page,1);
  assert.deepEqual(paginateRadicals([],9),{items:[],page:1,pages:1,start:0,total:0});
});

test('detail links can expose multiple families without unrelated memberships', () => {
  assert.deepEqual(familiesForCharacter(families,'洗').map(f=>f.id),['radikal-air']);
  assert.deepEqual(familiesForCharacter(families,'週').map(f=>f.id),['radikal-perjalanan']);
  assert.deepEqual(new Set(familiesForCharacter(families,'休').map(f=>f.id)),new Set(['radikal-orang','radikal-kayu']));
  assert.deepEqual(familiesForCharacter(families,'A'),[]);
});
