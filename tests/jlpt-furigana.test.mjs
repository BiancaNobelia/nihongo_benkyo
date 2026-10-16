import test from 'node:test';
import assert from 'node:assert/strict';
import {getQuizPool} from '../practice-banks.js';
import {quizPromptMarkup} from '../quiz-prompt.js';
import {JLPT_FURIGANA} from '../jlpt-furigana-data.js';

const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const pool=getQuizPool('jlpt-reading');
const key=q=>JSON.stringify([q.sentence,q.word,q.reading]);
const markup=q=>quizPromptMarkup(q,'jlpt-reading',escape,true);

test('all JLPT sentences reveal complete, aligned furigana only after answering',()=>{
  assert.equal(JLPT_FURIGANA.size,pool.length);
  for(const q of pool){
    const [before,after]=q.sentence.split('{target}');
    const parts=[before,q.word,after];
    const annotations=JLPT_FURIGANA.get(key(q));
    assert.ok(annotations,q.word);
    annotations.forEach((spans,i)=>{
      let cursor=0;
      for(const [start,word,reading] of spans){
        assert.ok(start>=cursor,q.word);
        assert.equal(parts[i].slice(start,start+word.length),word);
        assert.match(reading,/^[ぁ-ゖー]+$/u);
        assert.doesNotMatch(parts[i].slice(cursor,start),/\p{Script=Han}/u);
        cursor=start+word.length;
      }
      assert.doesNotMatch(parts[i].slice(cursor),/\p{Script=Han}/u);
    });
    const initial=quizPromptMarkup(q,'jlpt-reading',escape);
    assert.doesNotMatch(initial,/<ruby|<rt/);
    const revealed=markup(q);
    assert.match(revealed,/<ruby>/);
    assert.equal(revealed.match(/class="writing-target"/g)?.length,1);
    assert.equal(revealed.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,''),escape(before+q.word+after));
    // The question shape produced by createReadingQuiz uses prompt/answer.
    assert.equal(quizPromptMarkup({prompt:q.word,answer:q.reading,sentence:q.sentence},'jlpt-reading',escape,true),revealed);
    assert.equal(quizPromptMarkup(q,'jlpt-reading',escape),initial,'Next render hides readings again');
  }
});

test('furigana distinguishes context readings, okurigana, dates and counters',()=>{
  const html=pool.map(markup).join('\n');
  for(const fragment of [
    '<ruby>降<rt>お</rt></ruby>り','<ruby>降<rt>ふ</rt></ruby>って',
    '<ruby>足<rt>あし</rt></ruby>が','<ruby>足<rt>た</rt></ruby>り',
    '<ruby>下<rt>お</rt></ruby>り','<ruby>少<rt>すく</rt></ruby>な',
    '<ruby>来<rt>く</rt></ruby>る','<ruby>来<rt>き</rt></ruby>ま',
    '<ruby>来<rt>こ</rt></ruby>ない','<ruby>6日<rt>むいか</rt></ruby>',
    '<ruby>1日<rt>ついたち</rt></ruby>','<ruby>1日<rt>いちにち</rt></ruby>',
    '<ruby>六本<rt>ろっぽん</rt></ruby>','<ruby>9時<rt>くじ</rt></ruby>',
  ])assert.ok(html.includes(fragment),fragment);
});

test('new or modified sentences fail closed and other quiz modes do not reveal JLPT ruby',()=>{
  const q=pool[0];
  assert.doesNotMatch(markup({...q,sentence:q.sentence+'別の文。'}),/<ruby>/);
  assert.doesNotMatch(markup({...q,reading:'べつのよみ'}),/<ruby>/);
  for(const mode of ['reading','hiragana-kanji','english-katakana']){
    assert.doesNotMatch(quizPromptMarkup(q,mode,escape,true),/<ruby>/);
  }
  assert.doesNotMatch(markup({word:'<img>',reading:'<script>',sentence:'<b>{target}</b>'}),/<img|<script|<b>/);
});
