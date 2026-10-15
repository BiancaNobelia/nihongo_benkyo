import test from 'node:test';
import assert from 'node:assert/strict';
import {BUNPOU_ENTRIES as entries} from '../bunpou-data.js';
import {bunpouSentenceMarkup,bunpouPromptMarkup,bunpouFeedbackMarkup} from '../bunpou-core.js';
import {orderFeedbackEntry,orderHintMarkup} from '../bunpou-order-core.js';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base=html=>html.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,'');
const get=id=>entries.find(q=>q.id===`bunpou-${id}`);

test('all sentence kanji have nonoverlapping, context-pinned readings in both modes',()=>{
  for(const original of entries)for(const q of [original,orderFeedbackEntry(original)]){
    let cursor=0;
    for(const [offset,word,reading] of q.furigana){
      assert.ok(Number.isInteger(offset)&&offset>=cursor,q.id);
      assert.equal(q.example.slice(offset,offset+word.length),word,q.id);
      assert.match(word,/^[一-龯々]+$/);assert.match(reading,/^[ぁ-ゖー]+$/);
      assert.doesNotMatch(q.example.slice(cursor,offset),/[一-龯々]/,q.id);
      cursor=offset+word.length;
    }
    assert.doesNotMatch(q.example.slice(cursor),/[一-龯々]/,q.id);
    const html=bunpouSentenceMarkup(q,escape);
    assert.equal(base(html),escape(q.example),q.id);
    assert.equal((html.match(/<rt>/g)||[]).length,q.furigana.length,q.id);
    const highlighted=[...html.matchAll(/<strong>(.*?)<\/strong>/g)].map(m=>m[1]).join('');
    assert.equal(highlighted,escape(q.answer),q.id);
  }
});

test('readings are hidden in prompts and shown in shared answer/review feedback',()=>{
  for(const q of entries){
    assert.ok(!bunpouPromptMarkup(q,escape).includes('<ruby>'),q.id);
    assert.ok(!orderHintMarkup(q,escape).includes('<ruby>'),q.id);
    for(const f of [q,orderFeedbackEntry(q)]){
      const html=bunpouFeedbackMarkup(f,escape);
      assert.equal(html.includes('<ruby>'),f.furigana.length>0,q.id);
      assert.ok(html.includes(escape(f.translation)),q.id);
    }
  }
});

test('irregular words, conjugations, and compound readings follow sentence context',()=>{
  for(const [id,word,reading] of [
    ['01-06','二十歳','はたち'],['05-07','二十日','はつか'],
    ['02-06','何','なん'],['06-02','何','なに'],
    ['18-06','来','き'],['21-04','来','く'],['39-02','来','こ'],['47-03','来','こ'],
    ['07-06','出','だ'],['23-01','出','で'],
    ['10-01','上','うえ'],['49-05','上','あ'],
    ['32-02','遅','おそ'],['32-04','遅','おく'],
    ['04-06','九時','くじ'],['04-06','十二時','じゅうにじ'],
  ])assert.ok(get(id).furigana.some(([,w,r])=>w===word&&r===reading),`${id}: ${word} ${reading}`);
  const q=orderFeedbackEntry(get('33-01'));
  assert.equal(q.example,'すぐにここで止まれ！');
  assert.ok(bunpouSentenceMarkup(q,escape).includes('<ruby><strong>止</strong><rt>と</rt></ruby>'));
});

test('answer highlights can split a compound without splitting or inventing its reading',()=>{
  const q={example:'日本語です。',before:'日',answer:'本',after:'語です。',furigana:[[0,'日本語','にほんご']]};
  assert.equal(bunpouSentenceMarkup(q,escape),'<ruby>日<strong>本</strong>語<rt>にほんご</rt></ruby>です。');
  const unsafe={...q,furigana:[[0,'日本語','<img src=x>']]};
  assert.ok(!bunpouSentenceMarkup(unsafe,escape).includes('<img'));
  const changed={...q,before:'<script>',answer:'&',after:'</script>'};
  const html=bunpouSentenceMarkup(changed,escape);
  assert.ok(!html.includes('<ruby>'));assert.equal(base(html),escape(changed.before+changed.answer+changed.after));
});
