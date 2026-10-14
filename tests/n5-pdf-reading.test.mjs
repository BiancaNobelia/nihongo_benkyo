import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {N5_PDF_READINGS,N5_CONTEXT_OVERRIDES} from '../n5-reading-data.js';
import {getQuizPool} from '../practice-banks.js';
import {createReadingQuiz} from '../jlpt-reading-core.js';
import {readingQuestionKey,recordReadingShown} from '../reading-history.js';
import {quizPromptMarkup} from '../quiz-prompt.js';
import {answerDetails} from '../quiz-feedback.js';
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('all supplied PDF question numbers are represented by reviewed N5 adaptations',()=>{
  assert.equal(N5_PDF_READINGS.length,199);
  for(let file=1;file<=10;file++){
    const source=JSON.parse(readFileSync(new URL(`../data/n5-pdf-${String(file).padStart(2,'0')}.json`,import.meta.url)));
    const questions=N5_PDF_READINGS.filter(q=>q.source.file===`N5_${file}.pdf`);
    assert.equal(questions.length,file===10?19:20);
    questions.forEach((q,index)=>{
      assert.equal(q.source.question,index+1);
      assert.deepEqual([q.source.question,q.word,q.reading,q.meaning,q.sentence,q.sentenceMeaning,q.distractors,q.readingCategory],source[index]);
      assert.equal(q.level,'N5');
      assert.equal(q.levelBasis,'n5-minna-1-reviewed');
    });
  }
  assert.equal(getQuizPool('jlpt-reading','N5').length,388);
  assert.equal(new Set(getQuizPool('jlpt-reading').map(readingQuestionKey)).size,863);
  for(const level of ['N3','N2','N1'])assert.ok(getQuizPool('jlpt-reading',level).every(q=>!q.source));
});

test('multiple kanji remain visible while exactly the requested target is underlined',()=>{
  const sample=N5_PDF_READINGS.find(q=>q.id==='n5-pdf-1-1');
  const markup=quizPromptMarkup(sample,'jlpt-reading',String);
  assert.ok(markup.includes('先週の金曜日'));
  assert.ok(markup.includes('レポートを書きました'));
  assert.equal(markup.match(/class="writing-target"/g).length,1);
  assert.ok(markup.includes('>学校</span>'));
  for(const q of createReadingQuiz(N5_PDF_READINGS,199,seeded(2))){
    assert.equal(q.options.length,4,q.prompt);
    assert.equal(new Set(q.options).size,4,q.prompt);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.options.every(option=>/^[ぁ-ゖー]+$/u.test(option)));
    const details=answerDetails(q,'jlpt-reading');
    assert.equal(details.sentenceMeaning,q.sentenceMeaning);
    assert.equal(details.meaning,q.meaning);
  }
});

test('N5 scope revisions remove difficult context and adapt out-of-scope PDF targets',()=>{
  const pool=getQuizPool('jlpt-reading','N5');
  const harder=/首相|国民|書留|物価|市役所|特急|生け花|つなが|はこび|しゅと|てんきよほう|見え|みえます/;
  assert.ok(pool.every(q=>!harder.test(q.sentence)),pool.filter(q=>harder.test(q.sentence)).map(q=>q.word).join(','));
  assert.equal(N5_PDF_READINGS.find(q=>q.id==='n5-pdf-4-17').word,'学校');
  assert.equal(N5_PDF_READINGS.find(q=>q.id==='n5-pdf-7-16').word,'木');
  for(const [word,context] of Object.entries(N5_CONTEXT_OVERRIDES)){
    const q=pool.find(q=>q.word===word && !q.contextKey);
    assert.equal(q.sentence,context[0]);
    assert.equal(q.sentenceMeaning,context[1]);
  }
});

test('N5 sessions prefer distinct targets and preserve unique contexts across rounds',()=>{
  const pool=getQuizPool('jlpt-reading','N5');
  for(const count of [10,20,50])for(let seed=1;seed<=30;seed++){
    const quiz=createReadingQuiz(pool,count,seeded(seed));
    assert.equal(new Set(quiz.map(q=>`${q.prompt}:${q.answer}`)).size,count);
  }
  const schools=pool.filter(q=>q.word==='学校');
  assert.ok(schools.length>=4);
  const first=schools[1], history=recordReadingShown({},first);
  const next=createReadingQuiz(schools,schools.length-1,seeded(3),history);
  assert.ok(next.every(q=>readingQuestionKey(q)!==readingQuestionKey(first)));
  const full=createReadingQuiz(pool,999,seeded(5));
  assert.equal(full.length,388);
  assert.equal(new Set(full.map(readingQuestionKey)).size,388);
});

test('known PDF misprints have a correct unique reading and intact okurigana',()=>{
  const cases={'n5-pdf-4-11':'なんにん','n5-pdf-8-19':'てんき','n5-pdf-8-18':'ききました','n5-pdf-6-13':'まがる','n5-pdf-10-19':'よんで'};
  for(const [id,answer] of Object.entries(cases)){
    const source=N5_PDF_READINGS.find(q=>q.id===id);
    const [q]=createReadingQuiz([source],1,seeded(7));
    assert.equal(q.answer,answer);
    assert.equal(q.options.filter(x=>x===answer).length,1);
    assert.ok(!q.sentence.includes('聞きましたきました'));
    assert.ok(!q.sentence.includes('曲がるがる'));
  }
});
