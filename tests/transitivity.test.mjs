import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRANSITIVITY_PAIRS as pairs,TRANSITIVITY_ENTRIES as entries,TRANSITIVITY_REFERENCE_NOTE} from '../transitivity-data.js';
import {createTransitivityQuiz,transitivityPool,checkTransitivityAnswer,transitivityOptionMarkup,transitivityOptionText,transitivityFeedbackMarkup,cleanTransitivityHistory,recordTransitivityShown,TRANSITIVITY_HISTORY_KEY} from '../transitivity-core.js';
import {cleanProgress} from '../core.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('all 29 direct pairs from both images have balanced original Indonesian contexts',()=>{
  const expected=['きれる/きる','あく/あける','しまる/しめる','つく/つける','きえる/けす','とまる/とめる','はじまる/はじめる','うれる/うる','はいる/いれる','でる/だす','なくなる/なくす','あつまる/あつめる','なおる/なおす','かわる/かえる','おちる/おとす','とどく/とどける','ならぶ/ならべる','かたづく/かたづける','もどる/もどす','みつかる/みつける','つづく/つづける','あがる/あげる','さがる/さげる','おれる/おる','こわれる/こわす','よごれる/よごす','おきる/おこす','かかる/かける','やける/やく'];
  assert.deepEqual(pairs.map(p=>`${p.ji.reading}/${p.ta.reading}`),expected);assert.equal(entries.length,116);
  assert.equal(new Set(entries.map(q=>q.id)).size,116);assert.equal(new Set(entries.map(q=>q.translation)).size,116);
  for(const p of pairs){const qs=transitivityPool(entries,{pair:p.id});assert.equal(qs.length,4);assert.equal(qs.filter(q=>q.kind==='ji').length,2);assert.equal(qs.filter(q=>q.kind==='ta').length,2);}
  for(const q of entries){assert.ok(q.reason);assert.ok(!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(q.translation));}
  assert.match(TRANSITIVITY_REFERENCE_NOTE,/気をつける/);assert.match(TRANSITIVITY_REFERENCE_NOTE,/bukan pasangan langsung/);
});

test('both quiz modes always offer exactly the matching two choices without labels leaking in word mode',()=>{
  for(const mode of ['word','type'])for(const q of createTransitivityQuiz(entries,{mode,count:116},{},random(3))){
    assert.deepEqual([...q.options].sort(),['ji','ta']);assert.equal(q.options.filter(k=>checkTransitivityAnswer(q,k)).length,1);
    assert.ok(!checkTransitivityAnswer(q,null));assert.ok(!checkTransitivityAnswer(q,'invalid'));
    if(mode==='word'){const p=pairs.find(p=>p.id===q.pairId);for(const k of q.options){assert.equal(transitivityOptionText(q,k),p[k].masu);assert.ok(!/Jidōshi|Tadōshi|自動詞|他動詞/.test(transitivityOptionMarkup(q,k,escape)));}}
    else {assert.match(transitivityOptionText(q,'ji'),/Jidōshi/);assert.match(transitivityOptionText(q,'ta'),/Tadōshi/);}
  }
});

test('furigana covers every kanji and feedback explains both sides, the whole sentence and meaning',()=>{
  for(const q of entries){
    let end=0;for(const [offset,word,reading] of q.furigana){assert.ok(offset>=end);assert.equal(q.sentence.slice(offset,offset+word.length),word);assert.match(reading,/^[ぁ-ゖー]+$/u);end=offset+word.length;}
    for(let i=0;i<q.sentence.length;i++)if(/[\p{Script=Han}々]/u.test(q.sentence[i]))assert.ok(q.furigana.some(([offset,word])=>i>=offset&&i<offset+word.length),q.id);
    const html=transitivityFeedbackMarkup(q,escape),p=pairs.find(p=>p.id===q.pairId);
    for(const text of [q.translation,q.reason,p.note,p.ji.masu,p.ta.masu,p.ji.te,p.ta.te])assert.ok(html.includes(escape(text)),q.id);
    assert.equal((html.match(/<ruby>/g)||[]).length,q.furigana.length);
  }
});

test('count limits, pair filtering, category balance and varied pairs work without duplicate questions',()=>{
  for(const count of [0,-1,NaN,1.5,Infinity])assert.deepEqual(createTransitivityQuiz(entries,{count}),[]);
  assert.deepEqual(createTransitivityQuiz(entries,{mode:'invalid'}),[]);assert.deepEqual(createTransitivityQuiz(entries,{pair:'invalid'}),[]);
  for(const count of [1,10,20,29,50,116,99999])for(let seed=1;seed<=12;seed++){
    const qs=createTransitivityQuiz(entries,{count},{},random(seed));assert.equal(qs.length,Math.min(count,116));assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);
    assert.equal(new Set(qs.slice(0,29).map(q=>q.pairId)).size,Math.min(count,29));
    assert.ok(Math.abs(qs.filter(q=>q.kind==='ji').length-qs.filter(q=>q.kind==='ta').length)<=1);
  }
  const single=createTransitivityQuiz(entries,{pair:'open',count:50},{},random(1));assert.equal(single.length,4);assert.ok(single.every(q=>q.pairId==='open'));
});

test('shown question history rotates across sessions and survives reload cleaning independently',()=>{
  const first=createTransitivityQuiz(entries,{count:50},{},random(5)),history=first.reduce((h,q)=>recordTransitivityShown(h,q.id),{});
  assert.deepEqual(cleanTransitivityHistory({...history,'particle-mo-01':5,bogus:9},entries),history);
  const second=createTransitivityQuiz(entries,{count:50,mode:'type'},history,random(5));assert.ok(second.every(q=>!history[q.id]));
  assert.deepEqual(cleanTransitivityHistory(null,entries),{});assert.equal(TRANSITIVITY_HISTORY_KEY,'nihongo-benkyo-transitivity-history-v1');
  const used=entries.reduce((h,q)=>recordTransitivityShown(h,q.id),{});used[first[0].id]=2;
  assert.ok(createTransitivityQuiz(entries,{count:115},used,random(7)).every(q=>q.id!==first[0].id));
});

test('teaching notes distinguish intention, passive, potential and を marking departure',()=>{
  const byId=id=>pairs.find(p=>p.id===id),q=id=>entries.find(q=>q.id===id);
  assert.match(byId('enter').note,/sengaja/);assert.match(byId('lose').note,/tidak disengaja/);assert.match(byId('drop').note,/tidak sengaja/);
  assert.match(byId('sell').note,/bukan potensial/);assert.match(byId('bake').note,/bukan potensial/);assert.match(byId('cut').note,/bukan bentuk potensial/);
  assert.equal(q('transitivity-exit-ji-2').kind,'ji');assert.match(q('transitivity-exit-ji-2').sentence,/部屋を出/);
  assert.match(byId('find').note,/bukan bentuk pasif/);assert.match(byId('repair').note,/治す・治る/);
  assert.equal(byId('cut').ta.te,'きって');assert.equal(byId('enter').ji.te,'はいって');assert.equal(byId('bake').ta.te,'やいて');
});

test('both modes keep scores and the dedicated route is registered without entering kanji quiz modes',()=>{
  const history=['transitivity-word','transitivity-type'].map(mode=>({mode,date:'2026-10-15T09:00:00Z',correct:50,total:116}));
  assert.deepEqual(cleanProgress({history},[]).history,history);
  assert.deepEqual(cleanProgress({history:[{...history[0],correct:117}]},[]).history,[]);
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),index=readFileSync(new URL('../index.html',import.meta.url),'utf8'),view=readFileSync(new URL('../transitivity-view.js',import.meta.url),'utf8');
  assert.ok(app.includes("view === 'jidoushi'"));assert.ok(app.includes('transitivityView.dispose()'));assert.ok(index.includes('data-nav="jidoushi"'));
  assert.ok(view.includes('${escape(q.translation)}</h2>'));assert.ok(view.includes('transitivityOptionMarkup(q,kind,escape)'));
});
