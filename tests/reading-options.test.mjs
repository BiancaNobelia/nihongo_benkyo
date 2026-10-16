import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KANJI} from '../kanji-data.js';
import {getQuizPool} from '../practice-banks.js';
import {READING_CHOICES} from '../reading-choice-data.js';
import {readingQuestionKey} from '../reading-history.js';
import {readingOptions} from '../reading-options.js';
import {createReadingQuiz} from '../jlpt-reading-core.js';
import {answerDetailsMarkup} from '../quiz-feedback.js';

const pool=getQuizPool('jlpt-reading');
const source=JSON.parse(readFileSync(new URL('../data/reading-choice-source.json',import.meta.url)));
const hiragana=s=>s.replace(/[ァ-ヶ]/gu,c=>String.fromCodePoint(c.codePointAt(0)-0x60));
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const escape=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;');

test('every distractor comes from a recorded kanji reading and excludes accepted word readings',()=>{
  assert.equal(READING_CHOICES.length,pool.length);
  assert.equal(source.words.length,pool.filter(q=>q.readingCategory!=='special').length);
  for(const q of pool){
    const data=READING_CHOICES.find(c=>c.key===readingQuestionKey(q));
    assert.ok(data);
    const accepted=new Set(data.accepted);
    const sourceWord=source.words.find(s=>s.word===q.word);
    if(q.readingCategory!=='special')for(const reading of sourceWord.readings)assert.ok(accepted.has(hiragana(reading)));
    for(const c of data.alternatives){
      assert.ok(q.word.includes(c.char));
      const k=KANJI.find(k=>k.char===c.char);
      assert.ok(k[c.type].includes(c.sourceReading),`${q.word}: invented ${c.sourceReading}`);
      assert.equal(c.to,hiragana(c.sourceReading.replaceAll('-','').split('.')[0]));
      assert.ok(!accepted.has(c.value),`${q.word}: valid ${c.value}`);
      assert.ok(q.reading.includes(c.from));
      assert.match(c.value,/^[ぁ-ゖ]+$/u);
    }
    for(let seed=1;seed<=20;seed++){
      const result=readingOptions(q,seeded(seed));
      assert.equal(result.options.length,4,q.word);
      assert.equal(new Set(result.options).size,4,q.word);
      assert.equal(result.options.filter(v=>accepted.has(v)).length,1,`${q.word}: ambiguous choices`);
      assert.ok(result.options.includes(q.reading));
      assert.equal(result.readingAlternatives.length,Math.min(2,data.alternatives.length));
      assert.ok(result.options.some(v=>data.phonetic.includes(v)),q.word);
    }
  }
});

test('all levels mix on/kun distractors and retain irregular counters and both date contexts',()=>{
  for(const level of ['N5','N4','N3','N2','N1']){
    const questions=createReadingQuiz(getQuizPool('jlpt-reading',level),500,seeded(7));
    assert.ok(questions.filter(q=>q.readingAlternatives.length).length>=40,level);
    assert.ok(questions.some(q=>q.readingAlternatives.some(c=>c.type==='on')),level);
    assert.ok(questions.some(q=>q.readingAlternatives.some(c=>c.type==='kun')),level);
  }
  const student=pool.find(q=>q.word==='学生');
  const variations=new Set();
  for(let seed=1;seed<40;seed++)readingOptions(student,seeded(seed)).options.forEach(o=>variations.add(o));
  assert.ok(!variations.has('がくしょう'));
  assert.ok(variations.has('がくなま'));
  for(const q of pool.filter(q=>q.readingCategory==='special'))assert.deepEqual(new Set(readingOptions(q).options),new Set([q.reading,...q.distractors]));
});

test('alternate accepted readings and exact kun forms never become wrong answers',()=>{
  const cases={'水':['すい'],'学生':['がくしょう','がくそう'],'行く':['ゆく'],'表す':['ひょうす'],'帰る':['おくる'],'景色':['けいしょく'],'境界':['けいかい','きょうがい'],'理由':['わけ'],'能力':['のうりき']};
  for(const [word,accepted] of Object.entries(cases)){
    const q=pool.find(q=>q.word===word);
    const data=READING_CHOICES.find(c=>c.key===readingQuestionKey(q));
    for(const reading of accepted){
      assert.ok(data.accepted.includes(reading),`${word}: ${reading}`);
      assert.ok(!data.alternatives.some(c=>c.value===reading));
      assert.ok(!data.phonetic.includes(reading));
    }
  }
  const week=READING_CHOICES.find(c=>c.key===readingQuestionKey(pool.find(q=>q.word==='先週')));
  assert.ok(!week.alternatives.some(c=>c.value==='ましゅう'));
});

test('JLPT answer feedback shows full on and kun readings only for the target word and preserves its meaning',()=>{
  const [q]=createReadingQuiz([pool.find(q=>q.word==='新聞')],1,seeded(1));
  const html=answerDetailsMarkup(q,'jlpt-reading',escape);
  assert.ok(!html.includes('Mengapa ada pilihan bacaan lain?'));
  assert.ok(!html.includes('Kenali kanji pada jawaban'));
  assert.ok(!html.includes('answer-explanation'));
  assert.ok(html.includes('Arti kata'));
  assert.ok(html.includes(q.meaning));
  const readings=html.match(/<div class="answer-kanji-readings">(.*?)<div class="answer-meaning">/s)[1];
  assert.equal((readings.match(/<dt>Onyomi<\/dt>/g)||[]).length,2);
  assert.equal((readings.match(/<dt>Kunyomi<\/dt>/g)||[]).length,2);
  for(const c of KANJI.filter(k=>q.prompt.includes(k.char))){
    for(const reading of [...c.on,...c.kun])assert.ok(readings.includes(escape(reading.replace('.', '（')+(reading.includes('.')?'）':''))));
  }
  assert.equal(answerDetailsMarkup({...q,readingAlternatives:[]},'jlpt-reading',escape),html);
  const unsafe={...q,readingAlternatives:[{char:'<script>',type:'on',sourceReading:'<x>',from:'<y>'}]};
  assert.ok(!answerDetailsMarkup(unsafe,'jlpt-reading',escape).includes('<script>'));
});
