import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENGLISH_KATAKANA } from '../english-katakana-data.js';
import { KATAKANA_WRITING } from '../writing-data.js';
import { PRACTICE_BANKS, getQuizPool } from '../practice-banks.js';
import { createWritingQuiz } from '../writing-core.js';
import { answerDetails, answerDetailsMarkup } from '../quiz-feedback.js';
import { cleanProgress } from '../core.js';
import { KANJI } from '../kanji-data.js';
import { quizSetupPanel } from '../quiz-setup-view.js';

const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const hiragana = s => s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));

test('English mode replaces the old selector and retains all 50 words with English cues',()=>{
  const setup=quizSetupPanel(()=>'');
  assert.ok(setup.includes('value="english-katakana"'));
  assert.ok(!setup.includes('hiragana-katakana'));
  assert.ok(!Object.hasOwn(PRACTICE_BANKS,'hiragana-katakana'));
  assert.equal(ENGLISH_KATAKANA.length,161);
  assert.equal(new Set(ENGLISH_KATAKANA.map(q=>q.prompt)).size,161);
  assert.equal(new Set(ENGLISH_KATAKANA.map(q=>q.id)).size,161);
  for(const old of KATAKANA_WRITING){
    const q=ENGLISH_KATAKANA.find(q=>q.answer===old.answer);
    assert.ok(q,old.answer);
    assert.equal(q.level,old.level);
    assert.equal(q.reading,old.prompt);
    assert.equal(q.sentence,old.sentence);
    assert.deepEqual(q.distractors,old.distractors);
  }
  for(const q of ENGLISH_KATAKANA){
    assert.match(q.prompt,/^[A-Za-z][A-Za-z /()-]*$/);
    assert.equal(q.reading,hiragana(q.answer));
    assert.equal(new Set([q.answer,...q.distractors]).size,4);
    for(const a of [q.answer,...q.distractors])assert.match(a,/^[ァ-ヶー]+$/);
    assert.ok(q.meaning && q.explanation && q.sentenceMeaning);
    assert.equal(q.sentence.split('{target}').length,2);
  }
});

test('requested vocabulary is present and new level assignments have explicit provenance',()=>{
  const expected={running:'ランニング',jogging:'ジョギング',allergy:'アレルギー',shower:'シャワー',sandal:'サンダル'};
  for(const [prompt,answer] of Object.entries(expected)){
    assert.equal(ENGLISH_KATAKANA.find(q=>q.prompt===prompt)?.answer,answer);
  }
  const source=JSON.parse(readFileSync(new URL('../data/english-katakana-source.json',import.meta.url),'utf8'));
  for(const word of source.additionalWords){
    assert.equal(ENGLISH_KATAKANA.find(q=>q.answer===word.word)?.level,word.level);
    assert.ok(word.levelBasis && (word.sourceId || word.reference));
  }
});

test('sessions and feedback keep English separate from Japanese readings and preserve score history',()=>{
  const before=JSON.stringify(ENGLISH_KATAKANA);
  for(const level of ['all','N5','N4','N3','N2','N1']){
    const pool=getQuizPool('english-katakana',level);
    const quiz=createWritingQuiz(pool,pool.length);
    assert.equal(quiz.length,pool.length);
    assert.equal(new Set(quiz.map(q=>q.prompt)).size,quiz.length);
    for(const q of quiz){
      const detail=answerDetails(q,'english-katakana');
      assert.equal(detail.word,q.answer);
      assert.equal(detail.english,q.prompt);
      assert.equal(detail.reading,hiragana(q.answer));
      assert.equal(detail.sentence,q.sentence.replace('{target}',q.answer));
      const html=answerDetailsMarkup(q,'english-katakana',escape);
      assert.ok(html.includes(`lang="en">${q.prompt}`));
      assert.ok(html.includes(escape(q.meaning)) && html.includes(escape(q.sentenceMeaning)));
    }
  }
  assert.equal(JSON.stringify(ENGLISH_KATAKANA),before);
  const history=['hiragana-katakana','english-katakana'].map(mode=>({mode,level:'N5',total:10,correct:7,date:'2026-10-14T07:00:00Z'}));
  assert.deepEqual(cleanProgress({history},KANJI).history,history);
});
