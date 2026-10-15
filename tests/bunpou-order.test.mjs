import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BUNPOU_ENTRIES as entries} from '../bunpou-data.js';
import {BUNPOU_HISTORY_KEY,cleanBunpouHistory,recordBunpouShown,bunpouFeedbackMarkup} from '../bunpou-core.js';
import {BUNPOU_ORDER_HISTORY_KEY,createBunpouOrderQuiz,shuffleOrderTiles,checkOrderAnswer,orderAnswerText,moveOrderTile,orderHintMarkup,orderFeedbackEntry} from '../bunpou-order-core.js';
import {cleanProgress} from '../core.js';
import {KANJI} from '../kanji-data.js';
const get=id=>entries.find(q=>q.id===`bunpou-${id}`);
const indices=q=>q.order.tokens.map((_,i)=>i);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function assemble(q,text,remaining=indices(q)) {
  if(!remaining.length)return text===''?[]:null;
  for(const index of remaining){
    const token=q.order.tokens[index];
    if(!text.startsWith(token))continue;
    const tail=assemble(q,text.slice(token.length),remaining.filter(i=>i!==index));
    if(tail)return [index,...tail];
  }
  return null;
}

test('all 330 patterns have reviewed tiles matching the source or a documented adaptation',()=>{
  const metadata=JSON.parse(readFileSync(new URL('../data/bunpou-order-variants.json',import.meta.url),'utf8'));
  assert.equal(entries.filter(q=>q.order).length,330);
  assert.equal(new Set(entries.map(q=>q.chapter)).size,50);
  for(const q of entries){
    const o=q.order,override=metadata.overrides[q.id];
    assert.equal(o.example,override?.example??q.example,q.id);
    assert.equal(o.translation,override?.translation??q.translation,q.id);
    assert.equal(o.tokens.join(''),o.example,q.id);
    assert.ok(o.tokens.length>=3&&o.tokens.length<=20,q.id);
    assert.ok(o.accepted.includes(o.example),q.id);
    if(override)assert.ok(override.reason);
    assert.ok(checkOrderAnswer(q,indices(q)),q.id);
    for(const alternative of o.accepted){
      const selected=assemble(q,alternative);
      assert.ok(selected,`${q.id}: ${alternative}`);
      assert.ok(checkOrderAnswer(q,selected),`${q.id}: ${alternative}`);
    }
  }
});

test('equivalent particles are interchangeable while duplicated or missing physical tiles are rejected',()=>{
  const q=get('38-04'),canonical=indices(q),wo=canonical.filter(i=>q.order.tokens[i]==='を');
  assert.equal(wo.length,2);
  const equivalent=[...canonical];[equivalent[wo[0]],equivalent[wo[1]]]=[equivalent[wo[1]],equivalent[wo[0]]];
  assert.ok(checkOrderAnswer(q,equivalent));
  assert.equal(orderAnswerText(q,equivalent),q.example);
  assert.ok(!checkOrderAnswer(q,canonical.slice(1)));
  assert.ok(!checkOrderAnswer(q,[canonical[0],...canonical.slice(0,-1)]));
  assert.ok(!checkOrderAnswer(q,[...canonical.slice(0,-1),999]));
  assert.ok(!checkOrderAnswer(q,canonical.map(String)));
  assert.ok(!checkOrderAnswer(q,null));
});

test('reviewed word orders are accepted without swapping semantic roles or breaking clause attachment',()=>{
  const q=get('07-04');
  assert.ok(checkOrderAnswer(q,assemble(q,'プレゼントを妹にあげました。')));
  assert.ok(!checkOrderAnswer(q,assemble(q,'妹をプレゼントにあげました。')));
  const time=get('05-02');assert.ok(checkOrderAnswer(time,assemble(time,'大学へ電車で行きます。')));
  const noun=get('22-01');assert.ok(!checkOrderAnswer(noun,assemble(noun,'本は昨日買ったおもしろいです。')));
});

test('choosing, removing, and reselecting tiles preserves identity, order, and repeated particles',()=>{
  const q=get('38-04');let chosen=[];
  for(const index of indices(q))chosen=moveOrderTile(q,chosen,index);
  assert.ok(checkOrderAnswer(q,chosen));const prior=[...chosen];
  assert.deepEqual(moveOrderTile(q,chosen,0),chosen);assert.deepEqual(moveOrderTile(q,chosen,-1),chosen);
  chosen=moveOrderTile(q,chosen,1,true);assert.equal(chosen.length,q.order.tokens.length-1);
  assert.ok(!chosen.includes(1));assert.deepEqual(prior,indices(q),'input must not mutate');
  chosen=moveOrderTile(q,chosen,1);assert.equal(chosen.at(-1),1);assert.equal(new Set(chosen).size,q.order.tokens.length);
});

test('shuffling never loses tiles or presents a correct answer, including fixed random generators',()=>{
  for(const q of entries){
    for(const random of [seeded(1),seeded(99),()=>0,()=>0.999999]){
      const mixed=shuffleOrderTiles(q,random);
      assert.deepEqual([...mixed].sort((a,b)=>a-b),indices(q),q.id);
      assert.ok(!checkOrderAnswer(q,mixed),q.id);
    }
  }
});

test('order sessions obey selected chapters and counts with no repeats and independent exposure history',()=>{
  assert.notEqual(BUNPOU_ORDER_HISTORY_KEY,BUNPOU_HISTORY_KEY);
  const settings={chapters:[1,2,50],count:20},snapshot=JSON.stringify(entries);
  const session=createBunpouOrderQuiz(entries,settings,{},seeded(2));
  assert.equal(session.length,20);assert.equal(new Set(session.map(q=>q.id)).size,20);
  assert.ok(session.every(q=>settings.chapters.includes(q.chapter)));
  const history=recordBunpouShown({},session[0].id);
  const next=createBunpouOrderQuiz(entries,{...settings,count:10},history,seeded(2));
  assert.ok(next.every(q=>q.id!==session[0].id));
  assert.deepEqual(cleanBunpouHistory(history,entries),history);
  assert.equal(createBunpouOrderQuiz(entries,{chapters:[1],count:50}).length,6);
  assert.deepEqual(createBunpouOrderQuiz(entries,{chapters:[],count:10}),[]);
  assert.deepEqual(createBunpouOrderQuiz(entries,{count:0}),[]);
  assert.equal(JSON.stringify(entries),snapshot);
});

test('order hints reveal the requested Indonesian meaning and pattern but not the assembled example',()=>{
  for(const q of entries){
    const hint=orderHintMarkup(q,escape);
    assert.ok(hint.includes(escape(q.order.translation)),q.id);assert.ok(hint.includes(escape(q.pattern)),q.id);
    assert.ok(hint.includes(escape(q.structure)),q.id);assert.ok(!hint.includes(escape(q.order.example)),q.id);
    const feedback=bunpouFeedbackMarkup(orderFeedbackEntry(q),escape);
    const base=feedback.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,'');
    assert.ok(base.includes(escape(q.order.example)),q.id);assert.ok(feedback.includes(escape(q.order.translation)),q.id);
  }
  const q=get('33-01');assert.equal(orderFeedbackEntry(q).answer,'すぐにここで止まれ！');
  const malicious={...q,pattern:'<img>',order:{...q.order,translation:'<script>alert(1)</script>'}};
  assert.ok(!orderHintMarkup(malicious,escape).includes('<script>'));assert.ok(!orderHintMarkup(malicious,escape).includes('<img>'));
});

test('scores preserve both bunpou modes and their chapter selection when reloaded',()=>{
  const make=mode=>({date:'2026-10-15',mode,total:20,correct:15,chapters:[1,2,2,50,51,-1]});
  const cleaned=cleanProgress({history:[make('bunpou'),make('bunpou-order')]},KANJI).history;
  assert.equal(cleaned.length,2);assert.deepEqual(cleaned.map(h=>h.mode),['bunpou','bunpou-order']);
  for(const row of cleaned)assert.deepEqual(row.chapters,[1,2,50]);
});
