import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {creditsMarkup,sentenceCreditsMarkup,createCreditsView} from '../credits-view.js';
import {DOKKAI_PASSAGES} from '../dokkai-data.js';
import {KANJI} from '../kanji-data.js';
import {kanjiExamples} from '../kanji-examples.js';

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const records=JSON.parse(readFileSync(new URL('../data/kanji-sentences.json',import.meta.url))).entries;
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('central credits retain the source, author and license for every dokkai passage',()=>{
  const html=creditsMarkup(escape);
  for(const p of DOKKAI_PASSAGES){
    assert.ok(html.includes(escape(p.source.url)),p.id);
    assert.ok(html.includes(escape(p.source.author)),p.id);
  }
  for(const text of ['CC BY-NC 2.1 JP','Ulrich Apel','James William Breen','Dominik Klein','Dariyooo','CC BY-SA 3.0','CC BY 2.0 FR'])assert.ok(html.includes(text),text);
  const selected=creditsMarkup(escape,DOKKAI_PASSAGES.at(-1).id);
  assert.ok(selected.indexOf(DOKKAI_PASSAGES.at(-1).source.url)<selected.indexOf(DOKKAI_PASSAGES[0].source.url));
});

test('every kanji keeps links to the original example sentences on its credits page',()=>{
  for(const card of KANJI){
    const html=sentenceCreditsMarkup(card,records,escape);
    for(const e of kanjiExamples(card)){
      const r=records[e.word+'|'+e.reading];
      if(r.origin==='tatoeba')assert.ok(html.includes(`https://tatoeba.org/en/sentences/show/${r.reference}`),e.word);
      if(r.adapted&&r.sourceText)assert.ok(html.includes(escape(r.sourceText)),e.word);
    }
  }
});

test('sentence sources escape supplied text and reject missing records',()=>{
  const card=KANJI.find(k=>k.char==='学');
  const changed=Object.fromEntries(kanjiExamples(card).map(e=>[e.word+'|'+e.reading,{...records[e.word+'|'+e.reading],text:'<script>bad()</script>',adapted:true,sourceText:'<img onerror="bad()">'}]));
  const html=sentenceCreditsMarkup(card,changed,escape);
  assert.doesNotMatch(html,/<script>|<img/);
  assert.match(html,/&lt;script&gt;/);
  assert.throws(()=>sentenceCreditsMarkup(card,{},escape),/Missing sentence credit/);
});

test('context sources decode kanji links, retry loading, and ignore completion after leaving',async()=>{
  let retry,resolvePending,loads=0;
  const panel={innerHTML:'',className:'',querySelector(){return {addEventListener(event,handler){retry=handler;}};}};
  const root={innerHTML:'',querySelector(){return panel;}};
  const view=createCreditsView({root,escape,kanji:KANJI,load(){loads++;return loads===1?Promise.reject(new Error('offline')):Promise.resolve(records);}});
  view.render('kanji-%E5%AD%A6');await flush();
  assert.match(panel.innerHTML,/Coba lagi/);
  await retry();assert.match(panel.innerHTML,/Sumber contoh kalimat/);
  const pending=createCreditsView({root,escape,kanji:KANJI,load:()=>new Promise(resolve=>resolvePending=resolve)});
  pending.render('kanji-学');pending.dispose();
  panel.innerHTML='new page';resolvePending(records);await flush();
  assert.equal(panel.innerHTML,'new page');
  assert.doesNotThrow(()=>pending.render('%broken'));
});
