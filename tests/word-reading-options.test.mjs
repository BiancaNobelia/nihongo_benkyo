import test from 'node:test';
import assert from 'node:assert/strict';
import {KANJI} from '../kanji-data.js';
import {READING_CHOICES} from '../reading-choice-data.js';
import {WORD_READING_EXCLUSIONS} from '../word-reading-exclusions.js';
import {readFileSync} from 'node:fs';
import {createQuiz} from '../core.js';
import {getQuizPool} from '../practice-banks.js';
import {wordReadingCandidates,wordReadingDistractors} from '../word-reading-options.js';
import {answerDetailsMarkup} from '../quiz-feedback.js';

const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const card=char=>KANJI.find(k=>k.char===char);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

test('the requested examples use their exact confusable choices even in a single-card pool',()=>{
  for(const [char,choices] of [
    ['午',['ごぜん','ごご','ごまえ','うままえ']],
    ['本',['ほん','ぽん','き','もく']],
    ['右',['みぎ','ひだり','ともだち','いし']],
  ]){
    const positions=new Set();
    for(let seed=1;seed<20;seed++){
      const [q]=createQuiz([card(char)],'reading',1,seeded(seed));
      assert.deepEqual(new Set(q.options),new Set(choices));
      assert.equal(q.prompt,card(char).example.word);
      positions.add(q.options.indexOf(q.answer));
    }
    assert.ok(positions.size>1,'Correct answer position must remain randomized');
  }
});

test('all 2378 examples have three distinct close distractors without another accepted answer',()=>{
  for(const k of KANJI.filter(k=>k.example)){
    const snapshot=JSON.stringify(k);
    const {accepted,groups,preferred}=wordReadingCandidates(k);
    const candidates=new Set([...Object.values(groups).flat().map(c=>c.value),...preferred]);
    for(let seed=1;seed<=8;seed++){
      const result=wordReadingDistractors(k,seeded(seed));
      assert.equal(result.distractors.length,3,k.example.word);
      assert.equal(new Set(result.distractors).size,3,k.example.word);
      for(const value of result.distractors){
        assert.match(value,/^[ぁ-ゖー]+$/u);
        assert.doesNotMatch(value,/(^|[^きぎしじちぢにひびぴみり])[ゃゅょ]/u,'Keep small kana attached to compatible sounds');
        assert.ok(!accepted.has(value),`${k.example.word}: valid reading ${value}`);
        assert.ok(candidates.has(value),'No unrelated random vocabulary');
      }
      for(const r of k.example.readings)assert.ok(accepted.has(r));
    }
    assert.equal(JSON.stringify(k),snapshot);
  }
});

test('compound traps can change two kanji and every replacement is a recorded on/kun reading',()=>{
  let mixed=0,visual=0;
  for(const k of KANJI.filter(k=>k.example)){
    const {groups}=wordReadingCandidates(k);
    if(groups.mixed.length)mixed++;
    if(groups.visual.length)visual++;
    for(const candidate of [...groups.single,...groups.mixed]){
      if(candidate.kind==='mixed')assert.equal(new Set(candidate.changes.map(c=>c.offset)).size,2);
      let reconstructed=k.example.reading;
      for(const c of [...candidate.changes].sort((a,b)=>b.offset-a.offset)){
        assert.ok(k.example.word.includes(c.char));
        assert.ok(card(c.char)[c.type].includes(c.sourceReading));
        assert.equal(reconstructed.slice(c.offset,c.offset+c.from.length),c.from);
        reconstructed=reconstructed.slice(0,c.offset)+c.to+reconstructed.slice(c.offset+c.from.length);
      }
      assert.equal(reconstructed,candidate.value);
    }
  }
  assert.ok(mixed>400);assert.ok(visual>200);
  const {groups}=wordReadingCandidates(card('午'));
  assert.ok(groups.mixed.some(c=>c.value==='うままえ'));
});

test('bare kanji and irregular words do not turn legitimate readings into errors',()=>{
  for(const [word,answer,valid] of [
    ['本','ほん',['もと']],['右','みぎ',['う','ゆう']],
    ['学生','がくせい',['がくしょう','がくそう']],
    ['今日','きょう',['こんにち','こんじつ']],['行く','いく',['ゆく']],
  ]){
    const k={char:[...word][0],example:{word,reading:answer,readings:[answer,...valid]}};
    for(let seed=0;seed<12;seed++){
      const result=wordReadingDistractors(k,seeded(seed));
      assert.ok(result.distractors.every(d=>!valid.includes(d)),word);
      if(word==='今日')assert.equal(result.readingAlternatives.length,0,'Do not guess irregular segmentation');
    }
  }
});

test('additional accepted readings from the existing JMdict snapshot are excluded, including 先生',()=>{
  for(const k of KANJI.filter(k=>k.example)){
    const source=READING_CHOICES.filter(q=>JSON.parse(q.key)[0]===k.example.word);
    if(!source.length)continue;
    const {accepted,groups}=wordReadingCandidates(k);
    for(const q of source)for(const value of q.accepted)assert.ok(accepted.has(value),`${k.example.word}: ${value}`);
    assert.ok(Object.values(groups).flat().every(c=>!source.some(q=>q.accepted.includes(c.value))));
  }
  const teacher=KANJI.find(k=>k.example?.word==='先生');
  assert.deepEqual(teacher.example.readings,['せんせい']);
  const {accepted,groups}=wordReadingCandidates(teacher);
  for(const value of ['せんしょう','せんじょう','ぜんじょう']){
    assert.ok(accepted.has(value));
    assert.ok(!Object.values(groups).flat().some(c=>c.value===value));
  }
});

test('the full word snapshot excludes valid compound combinations and alternate month readings',()=>{
  const source=JSON.parse(readFileSync(new URL('../data/word-reading-exclusions.json',import.meta.url)));
  assert.equal(source.words.length,new Set(KANJI.filter(k=>k.example).map(k=>k.example.word)).size);
  assert.deepEqual(WORD_READING_EXCLUSIONS,Object.fromEntries(source.words.map(q=>[q.word,q.readings])));
  const cases={'入口':['いりくち'],'一月':['ひとつき','いちげつ'],'二月':['ふたつき'],
    '大勢':['たいせい','たいぜい'],'黄色':['おうしょく','こうしょく'],'鶏肉':['けいにく'],'消耗':['しょうこう']};
  for(const [word,valid] of Object.entries(cases)){
    const k=KANJI.find(k=>k.example?.word===word);
    const {accepted,groups}=wordReadingCandidates(k);
    for(const reading of valid){
      assert.ok(accepted.has(reading),`${word}: ${reading}`);
      assert.ok(!Object.values(groups).flat().some(c=>c.value===reading));
    }
  }
});

test('per-word sessions keep level scope and explain only kanji in the question after answering',()=>{
  for(const level of ['N5','N4','N3','N2','N1']){
    const questions=createQuiz(getQuizPool('reading',level),'reading',50,seeded(42));
    assert.equal(questions.length,50);
    assert.ok(questions.every(q=>q.level===level&&q.options.length===4));
  }
  const [q]=createQuiz([card('午')],'reading',1,seeded(8));
  const html=answerDetailsMarkup(q,'reading',escape);
  assert.ok(html.includes('Mengapa ada pilihan bacaan lain?'));
  assert.ok(html.includes(q.meaning));
  assert.ok(!html.includes('Kalimat lengkap'));
  assert.ok(q.readingAlternatives.every(c=>q.word.includes(c.char)));
  assert.equal((html.match(/前<\/span> juga/g)||[]).length,1,'Repeated component notes are deduplicated');
  assert.ok(!answerDetailsMarkup({...q,readingAlternatives:[{char:'<script>',type:'kun',sourceReading:'<x>',from:'<y>'}]},'reading',escape).includes('<script>'));
});
