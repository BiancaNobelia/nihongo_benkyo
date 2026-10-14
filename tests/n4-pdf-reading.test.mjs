import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {N4_PDF_READINGS} from '../n4-reading-data.js';
import {getQuizPool} from '../practice-banks.js';
import {createReadingQuiz} from '../jlpt-reading-core.js';
import {readingQuestionKey,recordReadingShown} from '../reading-history.js';
import {quizPromptMarkup} from '../quiz-prompt.js';
import {answerDetails} from '../quiz-feedback.js';
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('all 200 PDF exercises join N4 while every other level retains its questions',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../data/n4-pdf-source.json',import.meta.url)));
  assert.equal(manifest.total,200);
  assert.equal(N4_PDF_READINGS.length,200);
  for(let file=1;file<=10;file++){
    const rows=JSON.parse(readFileSync(new URL(`../data/n4-pdf-${String(file).padStart(2,'0')}.json`,import.meta.url)));
    const questions=N4_PDF_READINGS.filter(q=>q.source.file===`N4_${file}.pdf`);
    const ref=manifest.files.find(f=>f.file===`N4_${file}.pdf`);
    assert.equal(questions.length,20);
    assert.equal(ref.pages,5);
    assert.match(ref.sha256,/^[a-f0-9]{64}$/);
    questions.forEach((q,index)=>{
      assert.equal(q.source.question,index+1);
      assert.deepEqual([q.source.question,q.word,q.reading,q.meaning,q.sentence,q.sentenceMeaning,q.distractors,q.readingCategory],rows[index]);
      assert.equal(q.level,'N4');
      assert.equal(q.levelBasis,'n4-minna-2-reviewed');
    });
    assert.deepEqual(ref.questionNumbers,questions.map(q=>q.source.question));
  }
  for(const [level,count] of Object.entries({N5:388,N4:273,N3:75,N2:65,N1:62})){
    const pool=getQuizPool('jlpt-reading',level);
    assert.equal(pool.length,count);
    if(level!=='N4')assert.ok(pool.every(q=>!q.id?.startsWith('n4-pdf-')));
  }
  assert.equal(new Set(getQuizPool('jlpt-reading').map(readingQuestionKey)).size,863);
});

test('N4 questions underline one target among surrounding kanji and retain both meanings',()=>{
  const sample=N4_PDF_READINGS.find(q=>q.id==='n4-pdf-2-3');
  const markup=quizPromptMarkup(sample,'jlpt-reading',String);
  assert.ok(markup.includes('6時半に集まって'));
  assert.ok(markup.includes('>出発</span>'));
  assert.ok(markup.includes('湖に着きました'));
  for(const q of createReadingQuiz(N4_PDF_READINGS,200,seeded(2))){
    assert.equal(quizPromptMarkup(q,'jlpt-reading',String).match(/class="writing-target"/g).length,1,q.id);
    assert.equal(new Set(q.options).size,4,q.id);
    assert.ok(q.options.every(option=>/^[ぁ-ゖー]+$/u.test(option)),q.id);
    assert.ok(q.options.includes(q.answer));
    const details=answerDetails(q,'jlpt-reading');
    assert.equal(details.meaning,q.meaning);
    assert.equal(details.sentenceMeaning,q.sentenceMeaning);
    assert.ok(q.sentenceMeaning.length>20);
  }
});

test('misprinted targets and swapped PDF answer sets are corrected in context',()=>{
  const cases={
    '2-4':['着きました','つきました'],'2-5':['会社','かいしゃ'],
    '2-18':['電車','でんしゃ'],'2-19':['止まり','とまり'],
    '3-2':['水曜日','すいようび'],'3-3':['作文','さくぶん'],'3-4':['出して','だして'],
    '3-14':['青','あお'],'3-18':['白','しろ'],'4-2':['月','つき'],
    '4-3':['明るくて','あかるくて'],'5-5':['習う','ならう'],
    '5-16':['社会','しゃかい'],'7-9':['動き方','うごきかた'],
  };
  for(const [suffix,[word,reading]] of Object.entries(cases)){
    const [q]=createReadingQuiz([N4_PDF_READINGS.find(q=>q.id===`n4-pdf-${suffix}`)],1,seeded(1));
    assert.equal(q.prompt,word);
    assert.equal(q.answer,reading);
    assert.equal(q.options.filter(option=>option===reading).length,1);
  }
  assert.ok(N4_PDF_READINGS.every(q=>!/死んだ野|午前中中|年前中|いまかった|特別なな|着いた言う/.test(q.sentence)));
  assert.equal(N4_PDF_READINGS.find(q=>q.id==='n4-pdf-2-11').word,'試合');
  assert.equal(N4_PDF_READINGS.find(q=>q.id==='n4-pdf-9-19').word,'起きて');
});

test('N4 sessions prefer different words, preserve contexts, and exhaust unseen PDFs first',()=>{
  const pool=getQuizPool('jlpt-reading','N4');
  for(const count of [10,20,50])for(let seed=1;seed<=30;seed++){
    const quiz=createReadingQuiz(pool,count,seeded(seed));
    assert.equal(new Set(quiz.map(q=>`${q.prompt}:${q.answer}`)).size,count);
  }
  let history=Object.fromEntries(pool.filter(q=>!q.source).map(q=>[readingQuestionKey(q),1]));
  const fresh=createReadingQuiz(pool,200,seeded(3),history);
  assert.ok(fresh.every(q=>q.id.startsWith('n4-pdf-')));
  assert.equal(new Set(fresh.map(readingQuestionKey)).size,200);
  history=recordReadingShown(history,fresh[0]);
  const next=createReadingQuiz(pool,199,seeded(5),history);
  assert.ok(next.every(q=>readingQuestionKey(q)!==readingQuestionKey(fresh[0])));
  const full=createReadingQuiz(pool,999,seeded(7));
  assert.equal(full.length,273);
  assert.equal(new Set(full.map(readingQuestionKey)).size,273);
});
