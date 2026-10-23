import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KANJI} from '../kanji-data.js';
import {KANJI_EXAMPLE_SUPPLEMENTS,KANJI_EXAMPLE_GLOSSES} from '../kanji-example-supplements.js';
import {buildKanjiExampleIndex,kanjiExamples} from '../kanji-examples.js';
import {kanjiExamplesMarkup} from '../kanji-examples-view.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card = char => KANJI.find(k => k.char === char);

test('every N5 and N4 kanji has at least three examples, with no lost original examples',()=>{
  let total=0;
  for(const k of KANJI) {
    const entries=kanjiExamples(k);
    total+=entries.length;
    assert.ok(entries.length>0,`${k.char} must not be left without an example`);
    if(['N5','N4'].includes(k.level)) assert.ok(entries.length>=3,k.char);
    if(k.example) assert.deepEqual(entries[0],{...k.example,meaning:KANJI_EXAMPLE_GLOSSES[`${k.example.word}|${k.example.reading}`] ?? k.example.meaning},k.char);
    assert.equal(new Set(entries.map(e=>`${e.word}|${e.reading}`)).size,entries.length,k.char);
    for(const e of entries) {
      assert.ok(e.word.includes(k.char),`${k.char}: ${e.word}`);
      assert.ok(e.meaning.trim());
      assert.match(e.reading,/^[ぁ-ゖァ-ヺー・]+$/);
    }
  }
  assert.ok(total>7700);
  assert.ok(kanjiExamples(card('学')).length>=30);
  assert.ok(kanjiExamples(card('水')).length>=10);
});

test('deduplication preserves distinct readings and the original Indonesian gloss',()=>{
  const cards=[{char:'日',level:'N5',example:{word:'日々',reading:'ひび',meaning:'Hari demi hari'}},{char:'々',level:'N5'}];
  const source=[{word:'日々',reading:'ひび',meaning:'Duplikat',rank:0},{word:'日',reading:'ひ',meaning:'Hari'},{word:'日',reading:'にち',meaning:'Hari (hitungan)'}];
  const before=JSON.stringify({cards,source});
  const index=buildKanjiExampleIndex(cards,source);
  assert.equal(index.get('日').length,3);
  assert.equal(index.get('々').length,1,'repeated target occurs only once per word');
  assert.equal(index.get('日').find(e=>e.word==='日々').meaning,'Hari demi hari');
  assert.equal(JSON.stringify({cards,source}),before,'source objects remain unchanged');
});

test('index rejects incomplete entries and never consumes distractors or unrelated words',()=>{
  const index=buildKanjiExampleIndex([{char:'水',level:'N5'}],[
    {word:'水',reading:'みず',meaning:'Air',distractors:['みす','まず']},
    {word:'水',reading:'',meaning:'Air'},
    {word:'水',reading:'mizu',meaning:'Air'},
    {word:'水',reading:'みず',meaning:''},
    {word:'水<',reading:'みず',meaning:'Invalid'},
    {word:'木',reading:'き',meaning:'Pohon'},
  ]);
  assert.deepEqual(index.get('水'),[{word:'水',reading:'みず',meaning:'Air'}]);
});

test('all additional spellings and readings are attested in the saved dictionary response',()=>{
  const source=JSON.parse(readFileSync(new URL('../data/kanji-example-supplement-source.json',import.meta.url)));
  assert.equal(source.entries.length,KANJI_EXAMPLE_SUPPLEMENTS.length);
  for(const e of KANJI_EXAMPLE_SUPPLEMENTS) {
    const evidence=source.entries.find(s=>s.word===e.word&&s.reading===e.reading);
    assert.ok(evidence?.entries.some(s=>s.variants.some(v=>v.written===e.word&&v.pronounced===e.reading)),e.word);
  }
});

test('view previews six examples, offers the remainder, and supports small and empty collections',()=>{
  const html=kanjiExamplesMarkup(card('学'),escape);
  const [preview,more]=html.split('<details');
  assert.equal((preview.match(/<li /g)||[]).length,6);
  assert.equal((more.match(/<li /g)||[]).length,kanjiExamples(card('学')).length-6);
  assert.match(html,/<strong>学<\/strong>/);
  assert.match(html,/<rt>がくせい<\/rt>/);
  assert.match(html,/Tampilkan lebih sedikit/);
  assert.doesNotMatch(kanjiExamplesMarkup(card('駅'),escape),/<details/);
  assert.match(kanjiExamplesMarkup({char:'㐂'},escape),/belum tersedia/);
  assert.match(kanjiExamplesMarkup(card('赳'),escape),/きゅうきゅう/);
});

test('example meanings are escaped before rendering',()=>{
  const html=kanjiExamplesMarkup({char:'㐂',example:{word:'㐂',reading:'よろこび',meaning:'<img src=x onerror=alert(1)>'}},escape);
  assert.doesNotMatch(html,/<img/);
  assert.match(html,/&lt;img/);
});

test('academic words use context-appropriate Indonesian meanings',()=>{
  const examples=kanjiExamples(card('学'));
  assert.equal(examples.find(e=>e.word==='学期').meaning,'Semester; masa belajar');
  assert.equal(examples.find(e=>e.word==='中学').meaning,'Sekolah menengah pertama (SMP)');
  assert.equal(examples.find(e=>e.word==='学問').meaning,'Ilmu pengetahuan; kajian akademis');
});
