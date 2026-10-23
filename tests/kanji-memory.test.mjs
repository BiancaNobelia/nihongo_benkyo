import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KANJI} from '../kanji-data.js';
import {memoryFor,MEMORY_STORIES} from '../kanji-memory.js';
import {memoryMarkup,originMarkup,mountKanjiMemory,createOriginLoader,originCreditMarkup} from '../kanji-memory-view.js';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const origins=read('../data/kanji-origins.json').entries;
const sources=read('../data/kanji-origin-source.json').entries;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('every catalog kanji has a memory aid, real vocabulary hook, and a sourced origin',()=>{
  assert.equal(KANJI.length,2383);
  assert.deepEqual(Object.keys(origins).sort(),KANJI.map(k=>k.char).sort());
  assert.deepEqual(Object.keys(sources).sort(),Object.keys(origins).sort());
  for(const card of KANJI){
    const memory=memoryFor(card),entry=origins[card.char];
    assert.ok(memory.text.length>30,card.char);
    assert.ok(memory.example.word.includes(card.char),card.char);
    assert.ok(memory.example.reading && memory.example.meaning,card.char);
    if(card.level==='N5')assert.ok(MEMORY_STORIES[card.char],card.char);
    assert.ok(entry.text.length>20,card.char);
    assert.match(entry.url,/^https:\/\/(www\.kanjipedia\.jp\/kanji\/\d+|github\.com\/peterolson\/chinese-lexicon\/blob\/[0-9a-f]{40}\/etymology\/index\.js)$/);
    assert.doesNotMatch(entry.text,/GLYPH|MISSING|undefined|\[object Object\]|［図］/,card.char);
    const html=memoryMarkup(card,escape);
    assert.match(html,/bukan asal-usul historis/);
    assert.doesNotMatch(html,/<details[^>]*\sopen[\s>]/);
    assert.ok(originCreditMarkup(card,entry,escape).includes(entry.url));
  }
});

test('historical notes do not turn modern-shape mnemonics into etymology',()=>{
  assert.match(origins.聞.text,/耳.*makna.*門.*bunyi/);
  assert.match(origins.思.text,/囟/);
  assert.match(origins.強.text,/弘.*bunyi/);
  assert.match(origins.強.text,/dipinjam/);
  assert.match(origins.読.text,/讀.*𧶠/);
  assert.match(origins.机.text,/木.*几/);
  assert.doesNotMatch(origins.机.text,/機/);
  assert.match(origins.糸.text,/dipilin/);
  assert.match(origins.虫.text,/ular/);
  assert.match(origins.弁.text,/辨.*辯.*瓣/);
  assert.ok(origins.栃.uncertain);
  assert.match(origins.栃.text,/belum dapat dipastikan/);
});

test('the origin download is shared and failed or invalid responses can be retried',async()=>{
  let calls=0;
  const load=createOriginLoader(async()=>{calls++;return {ok:true,json:async()=>({version:1,entries:origins})};});
  const [first,second]=await Promise.all([load(),load()]);
  assert.equal(first,second);await load();assert.equal(calls,1);
  let attempts=0;
  const retry=createOriginLoader(async()=>({ok:true,json:async()=>++attempts===1?{version:99}:{version:1,entries:origins}}));
  await assert.rejects(retry(),/Invalid/);assert.equal(await retry(),origins);
});

function fixture(){
  const handlers=new Map(),body={innerHTML:''};
  const details={open:false,querySelector(){return body;},addEventListener(name,fn){handlers.set(name,fn);},removeEventListener(name){handlers.delete(name);}};
  return {handlers,body,details,root:{querySelector(){return details;}}};
}

test('history loads only when opened, retries, and never updates a disposed dialog',async()=>{
  const f=fixture(),card=KANJI.find(k=>k.char==='聞');let calls=0,resolve;
  const dispose=mountKanjiMemory(f.root,card,escape,{load(){calls++;return calls===1?Promise.reject(new Error('offline')):new Promise(r=>resolve=r);}});
  assert.equal(calls,0);f.details.open=true;f.handlers.get('toggle')();await flush();
  assert.equal(calls,1);assert.match(f.body.innerHTML,/Coba lagi/);
  f.handlers.get('click')({target:{closest:()=>true}});assert.equal(calls,2);
  dispose();f.body.innerHTML='next dialog';resolve(origins);await flush();
  assert.equal(f.body.innerHTML,'next dialog');assert.equal(f.handlers.size,0);
});

test('completed history is not reloaded and missing data produces a retry',async()=>{
  const f=fixture(),card=KANJI[0];let calls=0;
  const dispose=mountKanjiMemory(f.root,card,escape,{load:async()=>{calls++;return origins;}});
  f.details.open=true;f.handlers.get('toggle')();await flush();f.handlers.get('toggle')();await flush();
  assert.equal(calls,1);assert.match(f.body.innerHTML,/Chinese Lexicon|Kanjipedia/);dispose();
  const missing=fixture();mountKanjiMemory(missing.root,card,escape,{load:async()=>({})});
  missing.details.open=true;missing.handlers.get('toggle')();await flush();assert.match(missing.body.innerHTML,/Coba lagi/);
});

test('source text and vocabulary hooks are escaped instead of becoming markup',()=>{
  const html=originMarkup({source:'kanjipedia',text:'<img src=x onerror="alert(1)">',uncertain:false},escape);
  assert.doesNotMatch(html,/<img/);assert.match(html,/&lt;img/);
  const markup=memoryMarkup({...KANJI[0],meaning:'<script>bad()</script>'},escape);
  assert.doesNotMatch(markup,/<script>/);
});
