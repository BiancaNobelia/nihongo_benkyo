import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createQuiz} from '../core.js';
import {KANJI} from '../kanji-data.js';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {KOTOBA_N3_ENTRIES} from '../kotoba-n3-data.js';
import {createKotobaQuiz,KOTOBA_MODES,getKotobaPool} from '../kotoba-core.js';
import {kanjiReadingsMarkup,kanjiChoiceDetailsMarkup,kotobaChoiceDetailsMarkup,writingChoiceDetailsMarkup} from '../quiz-choice-view.js';
import {createWritingQuiz} from '../writing-core.js';
import {PRACTICE_BANKS} from '../practice-banks.js';
import {WRITING_CHOICE_KANJI} from '../writing-choice-kanji-data.js';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const seeded=()=>{let seed=127;return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);};

test('every shuffled kanji or meaning choice retains a matching source card at all levels',()=>{
  for(const mode of ['meaning','kanji'])for(const level of ['N5','N4','N3','N2','N1']){
    const pool=KANJI.filter(k=>k.level===level);
    for(const q of createQuiz(pool,mode,30,seeded())){
      assert.equal(q.optionDetails.length,q.options.length);
      q.optionDetails.forEach((card,i)=>{
        assert.ok(pool.includes(card));assert.equal(mode==='meaning'?card.meaning:card.char,q.options[i]);
        assert.ok(kanjiChoiceDetailsMarkup(card,escape,mode).includes(escape(mode==='meaning'?card.char:card.meaning)));
        if(q.options[i]===q.answer)assert.equal(card,q.kanji);
      });
    }
  }
});

test('identical Indonesian meanings never replace the question kanji with another kanji',()=>{
  const pool=[{char:'林',meaning:'Hutan'},{char:'森',meaning:'Hutan'},{char:'川',meaning:'Sungai'},{char:'山',meaning:'Gunung'},{char:'火',meaning:'Api'}];
  for(const q of createQuiz(pool,'meaning',pool.length,seeded()))assert.equal(q.optionDetails[q.options.indexOf(q.answer)].char,q.kanji.char);
});

test('all writing options retain their own meanings and readings without inventing readings for distractor words',()=>{
  const pool=PRACTICE_BANKS['hiragana-kanji'];
  for(const q of createWritingQuiz(pool,pool.length,seeded())){
    assert.equal(q.optionDetails.length,q.options.length);
    q.optionDetails.forEach((detail,i)=>{
      assert.equal(detail.word,q.options[i]);
      const markup=writingChoiceDetailsMarkup(detail,escape);
      if(detail.word===q.answer){
        assert.equal(detail.reading,q.prompt);
        assert.equal(detail.meaning,q.meaning);
        assert.ok(markup.includes(escape(q.meaning)));
      }else{
        const characters=[...new Set([...detail.word].filter(char=>/\p{Unified_Ideograph}/u.test(char)))];
        assert.deepEqual(detail.characters.map(card=>card.char),characters);
        assert.ok(!detail.reading && !detail.meaning,'No fabricated whole-word reading or meaning');
        for(const card of detail.characters){
          assert.ok(card.meaning && (card.on.length || card.kun.length));
          assert.ok(markup.includes(escape(card.meaning)));
        }
        if(detail.word!==characters[0])assert.ok(markup.includes('Bacaan & arti per kanji'));
      }
    });
  }
  const drink=createWritingQuiz(pool,pool.length,seeded()).find(q=>q.answer==='飲みました');
  const rice=drink.optionDetails.find(detail=>detail.word==='飯みました');
  assert.deepEqual(rice.characters.map(card=>card.char),['飯']);
  assert.notEqual(rice.characters[0].meaning,drink.meaning);
});

test('additional writing distractor kanji retain readings from the recorded KANJIDIC2 source',()=>{
  const source=JSON.parse(readFileSync(new URL('../data/writing-choice-kanji-source.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
  assert.equal(source.entries.length,23);
  assert.equal(WRITING_CHOICE_KANJI.length,source.entries.length);
  for(const card of WRITING_CHOICE_KANJI){
    const original=source.entries.find(entry=>entry.kanji===card.char);
    assert.ok(original && card.meaning);
    assert.deepEqual(card.on,original.on_readings);
    assert.deepEqual(card.kun,original.kun_readings);
  }
});

test('all kotoba modes preserve the exact word and reading for every shuffled option in both courses',()=>{
  for(const entries of [KOTOBA_ENTRIES,KOTOBA_N3_ENTRIES])for(const mode of Object.keys(KOTOBA_MODES)){
    const questions=createKotobaQuiz(entries,{mode,count:20},seeded());
    assert.equal(questions.length,20);
    const answerOf=e=>['jp-id','audio-jp'].includes(mode)?e.meaning:mode==='reading'?e.reading:e.word;
    for(const q of questions){
      assert.equal(q.optionDetails.length,4);
      q.optionDetails.forEach((entry,i)=>{
        assert.equal(answerOf(entry),q.options[i]);
        assert.ok(entry.word&&entry.reading&&entry.meaning);
        if(q.options[i]===q.answer)assert.equal(entry.id,q.id);
        const combined=escape(q.options[i])+kotobaChoiceDetailsMarkup(entry,mode,escape);
        for(const value of [entry.word,entry.reading,entry.meaning])assert.ok(combined.includes(escape(value)));
      });
    }
  }
});

test('kotoba explanations use only selected chapters even when labels have multiple source words',()=>{
  const entries=[
    {chapter:1,reading:'はし',spelling:'橋',meaning:'jembatan'},
    {chapter:1,reading:'はし',spelling:'箸',meaning:'sumpit'},
    {chapter:1,reading:'いぬ',spelling:'犬',meaning:'anjing'},
    {chapter:1,reading:'ねこ',spelling:'猫',meaning:'kucing'},
    {chapter:1,reading:'とり',spelling:'鳥',meaning:'burung'},
    {chapter:2,reading:'わんこ',spelling:'わんこ',meaning:'anjing'},
  ].map((e,i)=>({...e,id:String(i),sourceRow:i+1,type:'kata benda'}));
  const allowed=new Set(getKotobaPool(entries,{chapters:[1]}).map(e=>e.id));
  for(const mode of Object.keys(KOTOBA_MODES))for(const q of createKotobaQuiz(entries,{chapters:[1],mode,count:10},seeded())){
    for(const entry of q.optionDetails){assert.ok(allowed.has(entry.id));assert.deepEqual(entry.chapters,[1]);}
    assert.equal(q.optionDetails[q.options.indexOf(q.answer)].id,q.id);
  }
});

test('reading hints handle missing readings and make okurigana readable without leaking meanings',()=>{
  const card={char:'聞',on:['ブン','モン'],kun:['き.く','き.こえる'],meaning:'Mendengar'};
  const hint=kanjiReadingsMarkup(card,escape);
  assert.match(hint,/Onyomi/);assert.match(hint,/Kunyomi/);assert.match(hint,/き（く）/);assert.doesNotMatch(hint,/Mendengar/);
  assert.match(kanjiReadingsMarkup({on:[],kun:[]},escape),/—/);
  assert.match(kanjiChoiceDetailsMarkup({char:'本',on:['ホン'],kun:[]},escape),/ホン/);
});

test('choice details escape source text in every display direction',()=>{
  const raw='<img src=x onerror=alert(1)>';
  for(const html of [kanjiReadingsMarkup({on:[raw],kun:[raw]},escape),kanjiChoiceDetailsMarkup({char:raw,on:[raw]},escape),writingChoiceDetailsMarkup({word:raw,reading:'<kana>',meaning:'<arti>'},escape),writingChoiceDetailsMarkup({word:raw,characters:[{char:raw,meaning:'<arti>',on:['<kana>'],kun:[]}]},escape),...Object.keys(KOTOBA_MODES).map(mode=>kotobaChoiceDetailsMarkup({word:raw,reading:'<kana>',meaning:'<arti>'},mode,escape))]){
    assert.doesNotMatch(html,/<img|<kana>|<arti>/);assert.match(html,/&lt;/);
  }
});
