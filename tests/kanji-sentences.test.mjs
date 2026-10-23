import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KANJI} from '../kanji-data.js';
import {kanjiExamples} from '../kanji-examples.js';
import {exampleSentenceMarkup,mountKanjiSentences} from '../kanji-sentence-view.js';

const data=JSON.parse(readFileSync(new URL('../data/kanji-sentences.json',import.meta.url)));
const hira=value=>value.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const expected=new Map(KANJI.flatMap(kanjiExamples).map(e=>[`${e.word}|${e.reading}`,e]));

test('all 2,383 kanji and every displayed word/reading have a translated sentence',()=>{
  assert.equal(KANJI.length,2383);
  assert.deepEqual(Object.keys(data.entries).sort(),[...expected.keys()].sort());
  assert.equal(expected.size,4829);
  let associations=0;
  for(const card of KANJI){
    const words=kanjiExamples(card);
    assert.ok(words.length,card.char);
    associations+=words.length;
    for(const word of words)assert.ok(data.entries[`${word.word}|${word.reading}`],card.char);
  }
  assert.equal(associations,data.coverage.associations);
  for(const [key,e] of Object.entries(data.entries)){
    assert.ok(e.translation.trim().length>=8,key);
    assert.notEqual(e.translation,e.text,key);
    assert.doesNotMatch(e.translation,/[ぁ-ゖァ-ヺ{}]|undefined|null|(?<!\d)%/,key);
    assert.match(e.text,/[。！？!?」』]$/,key);
    const word=expected.get(key);
    assert.equal(e.text.slice(e.targetStart,e.targetStart+e.targetLength),word.word,key);
    if(e.origin==='tatoeba')assert.ok(Number.isSafeInteger(e.reference)&&e.reference>0,key);
  }
});

test('every kanji in every sentence has aligned furigana, including supplementary characters',()=>{
  for(const [key,e] of Object.entries(data.entries)){
    let end=0;const covered=new Set();
    for(const [start,base,reading] of e.furigana){
      assert.ok(start>=end,key);
      assert.equal(e.text.slice(start,start+base.length),base,key);
      assert.match(reading,/^[ぁ-ゖー・]+$/,key);
      end=start+base.length;
      for(let i=start;i<end;i++)covered.add(i);
    }
    for(const m of e.text.matchAll(/[\p{Script=Han}々]/gu))assert.ok(covered.has(m.index),`${key}: ${m[0]}`);
    const stop=e.targetStart+e.targetLength;
    let position=e.targetStart,reading='';
    for(const [start,base,kana] of e.furigana){
      if(start+base.length<=position||start>=stop)continue;
      assert.ok(start>=e.targetStart&&start+base.length<=stop,key);
      reading+=e.text.slice(position,start)+kana;
      position=start+base.length;
    }
    reading+=e.text.slice(position,stop);
    assert.equal(hira(reading),hira(expected.get(key).reading),key);
  }
  assert.ok(data.entries['𠮟る|しかる']);
});

test('sentences distinguish homographs and document rare names instead of inventing ordinary words',()=>{
  assert.notEqual(data.entries['方々|かたがた'].text,data.entries['方々|ほうぼう'].text);
  assert.notEqual(data.entries['抱く|いだく'].text,data.entries['抱く|だく'].text);
  for(const char of ['赳','舜','彪','崚','晟'])assert.ok(kanjiExamples(KANJI.find(k=>k.char===char)).length);
  for(const char of ['彪','晟'])assert.match(kanjiExamples(KANJI.find(k=>k.char===char))[0].note,/名前|nama/i);
});

test('context words use kanji with readings, while homophones keep their contextual meaning',()=>{
  const cases=[
    ['学生|がくせい','あの 人は 大学の 学生 です。'],
    ['一杯|いっぱい','お茶を 一杯 飲みました。'],
    ['乾かす|かわかす','ドライヤーで、髪を乾かす。'],
    ['押える|おさえる','風で飛ばないように、紙を押える。'],
    ['奉る|たてまつる','神様に、供物を奉る。'],
    ['鼻水|はなみず','風邪を引いて、鼻水が出ます。'],
    ['冷ます|さます','熱いスープを、少し冷ます。'],
    ['縮みます|ちぢみます','熱いお湯で洗うと、服が縮みます。'],
    ['飲む|のむ','暑い 日は 水を たくさん 飲む。'],
    ['載る|のる','この記事は、明日の新聞に載る。'],
    ['艶|つや','この生地には、艶があります。'],
    ['土砂崩れ|どしゃくずれ','大雨で、土砂崩れが起きました。'],
    ['引き出し|ひきだし','それは引き出しに入れておきました。'],
    ['主宰|しゅさい','先生の主宰する勉強会に、参加します。'],
    ['生える|はえる','庭に草が生える。'],
    ['向かい|むかい','その店は通りの向かいにあります。'],
  ];
  for(const [key,text] of cases)assert.equal(data.entries[key].text,text,key);
  const student=data.entries['学生|がくせい'];
  for(const [base,reading] of [['人','ひと'],['大学','だいがく'],['学生','がくせい']]){
    assert.ok(student.furigana.some(([,w,r])=>w===base&&r===reading),base);
  }
});

test('orthography revisions preserve alternate target readings and adapted-source credits',()=>{
  for(const [word,readings] of [
    ['日本',['にほん','にっぽん']],['明後日',['あさって','みょうごにち']],
    ['下す',['おろす','くだす']],['梅雨',['つゆ','ばいう']],
    ['工場',['こうじょう','こうば']],['文字',['もじ','もんじ']],
    ['注ぐ',['そそぐ','つぐ']],['得る',['うる','える']],
    ['球',['きゅう','たま']],['管',['くだ','かん']],
    ['故郷',['ふるさと','こきょう']],['碑',['いしぶみ','ひ']],
  ]){
    for(const reading of readings){
      const e=data.entries[`${word}|${reading}`];
      assert.ok(e.furigana.some(([,w,r])=>w===word&&r===reading),`${word}|${reading}`);
    }
  }
  const adapted=Object.values(data.entries).filter(e=>e.origin==='tatoeba'&&e.adapted);
  assert.ok(adapted.length>100);
  for(const e of adapted){
    assert.ok(e.sourceText?.length);
    assert.ok(Number.isSafeInteger(e.reference)&&e.reference>0);
  }
});

test('sentence view escapes content, renders ruby and highlights only the target',()=>{
  const e={text:'𠮟る、母。',furigana:[[0,'𠮟る','しかる'],[4,'母','はは']],translation:'<script>x</script>',targetStart:0,targetLength:3,origin:'tatoeba',reference:42};
  const html=exampleSentenceMarkup(e,escape);
  assert.match(html,/<mark[^>]*><ruby>𠮟る/);
  assert.match(html,/<rt>はは<\/rt>/);
  assert.doesNotMatch(html,/<script>|<mark[^>]*><ruby>母/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/example-sentence-source|Tatoeba|diadaptasi/);
});

function fixture(key='水|みず'){
  const status={hidden:false,textContent:'',innerHTML:''};
  const row={dataset:{exampleSentenceKey:key},innerHTML:''};
  const listeners=new Map();
  const section={querySelector:()=>status,querySelectorAll:()=>[row],addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};
  return {root:{querySelector:()=>section},status,row,listeners};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('modal loading supports retry, missing data, disposal, and reopening',async()=>{
  const f=fixture();let calls=0;
  const dispose=mountKanjiSentences(f.root,escape,{load:async()=>{if(++calls===1)throw Error('offline');return data.entries;}});
  await tick();assert.match(f.status.innerHTML,/Coba lagi/);assert.equal(f.row.innerHTML,'');
  f.listeners.get('click')({target:{closest:()=>true}});
  await tick();assert.equal(f.status.hidden,true);assert.match(f.row.innerHTML,/CONTOH KALIMAT/);
  dispose();assert.equal(f.listeners.size,0);
  const old=fixture();let resolve;
  const close=mountKanjiSentences(old.root,escape,{load:()=>new Promise(r=>resolve=r)});
  close();resolve(data.entries);await tick();assert.equal(old.row.innerHTML,'');
  const missing=fixture('missing');mountKanjiSentences(missing.root,escape,{load:async()=>data.entries});
  await tick();assert.match(missing.status.innerHTML,/Coba lagi/);
});

test('one shared download is reused; failed downloads can be retried',async()=>{
  const {loadKanjiSentences}=await import('../kanji-sentence-view.js?test-cache');let calls=0;
  const fetcher=async()=>{calls++;if(calls===1)throw Error('offline');return{ok:true,json:async()=>data};};
  await assert.rejects(loadKanjiSentences(fetcher));
  const [first,second]=await Promise.all([loadKanjiSentences(fetcher),loadKanjiSentences(fetcher)]);
  assert.equal(first,second);assert.equal(calls,2);
  assert.equal(await loadKanjiSentences(fetcher),first);assert.equal(calls,2);
});
