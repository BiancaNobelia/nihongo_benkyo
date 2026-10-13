import test from 'node:test';
import assert from 'node:assert/strict';
import { KANJI } from '../kanji-data.js';
import { RADICAL_FAMILIES } from '../radical-data.js';
import { MON_COMPONENT_NOTES } from '../mon-components-data.js';
import { componentNoteMarkup, explainedKanjiCard } from '../component-note-view.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const flatten = parts => parts.flatMap(p => [p, ...flatten(p.children)]);
const family = RADICAL_FAMILIES.find(f => f.id === 'bentuk-mon');

test('every gate-family member has a visible explanation and meanings for all listed parts', () => {
  assert.deepEqual(new Set(Object.keys(MON_COMPONENT_NOTES)),new Set(family.members));
  for (const char of family.members) {
    const note = MON_COMPONENT_NOTES[char];
    assert.ok(note.summary && note.parts.length, char);
    const parts = flatten(note.parts);
    assert.ok(parts.some(p => p.symbol === '門'), char);
    const html = explainedKanjiCard(KANJI.find(k => k.char === char),escape,()=>'');
    assert.match(html, /^<article/);
    assert.ok(html.includes(`aria-label="Komponen ${char}"`));
    assert.ok(html.includes(`data-detail="${char}"`));
    for (const part of parts) {
      assert.ok(part.symbol && part.meaning && part.position, char);
      assert.ok(html.includes(escape(part.meaning)), `${char}: ${part.symbol}`);
      assert.ok(html.includes(escape(part.position)), `${char}: ${part.symbol}`);
    }
  }
});

test('complex gate kanji expose nested parts instead of stopping at an unexplained compound', () => {
  const expected = {潤:['氵','閏','門','王'],簡:['⺮','間','門','日'],閥:['門','伐','亻','戈'],閣:['門','各','夂','口'],閲:['門','兌','丷','口','儿'],闇:['門','音','立','日'],欄:['木','闌','門','東'],蘭:['艹','闌','門','東']};
  for (const [char, symbols] of Object.entries(expected)) {
    assert.deepEqual(flatten(MON_COMPONENT_NOTES[char].parts).map(p=>p.symbol),symbols,char);
  }
  assert.match(MON_COMPONENT_NOTES['開'].parts[1].meaning,/廾.*kedua tangan/);
  assert.match(MON_COMPONENT_NOTES['関'].note,/bentuk sederhana dari 關/);
  assert.match(MON_COMPONENT_NOTES['闘'].note,/Bentuk lamanya adalah 鬪/);
  assert.match(MON_COMPONENT_NOTES['聞'].note,/radikal utama 聞 adalah 耳/);
});

test('detail notes only render for reviewed kanji and escape dynamic card labels', () => {
  assert.equal(componentNoteMarkup('海',escape),'');
  assert.equal(componentNoteMarkup('<script>',escape),'');
  const entry = {...KANJI.find(k=>k.char==='潤'),meaning:'<img src=x onerror=alert(1)>'};
  const html = explainedKanjiCard(entry,escape,()=>'');
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.equal((html.match(/<button /g)||[]).length,1);
});
