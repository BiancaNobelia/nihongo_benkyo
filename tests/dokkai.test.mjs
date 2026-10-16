import test from 'node:test';
import assert from 'node:assert/strict';
import {DOKKAI_PASSAGES as passages,DOKKAI_SOURCE} from '../dokkai-data.js';
import {dokkaiPlain,dokkaiMarkup,dokkaiPool,createDokkaiSession,gradeDokkai,cleanDokkaiHistory,mergeDokkaiHistory,recordDokkaiShown} from '../dokkai-core.js';
import {cleanProgress} from '../core.js';
const questions=passages.flatMap(p=>p.questions);
const ids=groups=>groups.flatMap(g=>g.questions.map(q=>q.id));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

test('15 credited readings contain 60 unique questions across N5, N4, N3',()=>{
  assert.equal(passages.length,15);assert.equal(questions.length,60);
  assert.equal(new Set(passages.map(p=>p.id)).size,15);assert.equal(new Set(questions.map(q=>q.id)).size,60);
  for(const level of ['N5','N4','N3']){const pool=dokkaiPool(passages,level);assert.equal(pool.length,5);assert.equal(pool.flatMap(p=>p.questions).length,20);}
  assert.equal(dokkaiPool(passages,'N1').length,0);
  assert.equal(DOKKAI_SOURCE.license,'CC BY-NC 2.1 JP');
  for(const p of passages){assert.match(p.source.url,/^https:\/\/www\.jpf\.go\.jp\/j\/kansai\/clip\/images\/page\/yomyom\/.+\.pdf$/);assert.ok(p.source.author);assert.ok(['A1','A2','A2/B1'].includes(p.source.originalLevel));}
});

test('every paragraph has Indonesian meaning, complete reading annotations and supporting evidence',()=>{
  for(const p of passages){
    assert.equal(p.paragraphs.length,p.translation.length);
    assert.ok(p.glossary.length>=3);
    for(const [i,text] of p.paragraphs.entries()){
      assert.ok(p.translation[i].length>20);
      const plain=dokkaiPlain(text);assert.ok(plain.length>15);
      assert.doesNotMatch(plain,/[{}|]/);
      assert.doesNotMatch(text.replace(/\{[^{}|]+\|[^{}|]+\}/g,''),/\p{Script=Han}/u,`${p.id} paragraph ${i+1}`);
      for(const match of text.matchAll(/\{([^{}|]+)\|([^{}|]+)\}/g))assert.match(match[2],/^[ぁ-ゖー]+$/,`${p.id}: ${match[2]}`);
    }
    for(const q of p.questions){
      assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>dokkaiPlain(o.text))).size,4);
      assert.equal(q.options.filter(o=>o.id===q.answer).length,1);
      assert.ok(q.prompt&&q.meaning&&q.explanation.length>20);
      assert.ok(q.options.every(o=>o.text&&o.translation));
      assert.ok(Number.isInteger(q.evidence)&&q.evidence>=0&&q.evidence<p.paragraphs.length);
    }
  }
});

test('sessions honor level and custom count, cap to bank size, and group each passage only once',()=>{
  for(const level of ['N5','N4','N3','all'])for(const count of [1,10,20,50,100]){
    const groups=createDokkaiSession(passages,{level,count});
    assert.equal(ids(groups).length,Math.min(count,level==='all'?60:20));
    assert.equal(new Set(ids(groups)).size,ids(groups).length);
    assert.equal(new Set(groups.map(g=>g.passage.id)).size,groups.length);
    assert.ok(groups.every(g=>level==='all'||g.passage.level===level));
    for(const g of groups)for(const q of g.questions){assert.ok(g.passage.questions.some(original=>original.id===q.id));assert.equal(q.options.length,4);assert.ok(q.options.some(o=>o.id===q.answer));}
  }
  for(const count of [0,-1,1.5,NaN])assert.deepEqual(createDokkaiSession(passages,{count}),[]);
});

test('partial passages resume unseen questions before any previously shown question',()=>{
  let history={};const seen=new Set();
  for(const count of [3,7,10]){
    const groups=createDokkaiSession(passages,{level:'N5',count},history,()=>0.35);
    for(const g of groups){for(const q of g.questions){assert.ok(!seen.has(q.id));seen.add(q.id);}history=recordDokkaiShown(history,g.questions);}
  }
  assert.equal(seen.size,20);assert.equal(Object.keys(history).length,20);
  const groups=createDokkaiSession(passages,{level:'N5',count:20},history);
  assert.equal(new Set(ids(groups)).size,20);
});

test('global exposure priority cannot select a repeat while enough unseen questions remain',()=>{
  const history=Object.fromEntries(questions.slice(0,39).map(q=>[q.id,2]));
  const groups=createDokkaiSession(passages,{level:'all',count:20},history,()=>0.7);
  assert.ok(ids(groups).every(id=>!history[id]));
  const all=createDokkaiSession(passages,{level:'all',count:60},history);
  assert.equal(ids(all).length,60);
});

test('history counts only opened groups and ignores malformed stored data',()=>{
  const groups=createDokkaiSession(passages,{level:'N5',count:10},{},()=>0.2);
  const history=recordDokkaiShown({},groups[0].questions);
  assert.equal(Object.keys(history).length,groups[0].questions.length);
  const q=questions[0],other=questions[1];
  assert.deepEqual(cleanDokkaiHistory({[q.id]:2,[other.id]:-1,unknown:3},passages),{[q.id]:2});
  assert.deepEqual(cleanDokkaiHistory([],passages),{});
  assert.deepEqual(cleanDokkaiHistory(null,passages),{});
});

test('grading uses stable option identities after shuffling and counts missing answers as incorrect',()=>{
  const g=createDokkaiSession(passages,{level:'N5',count:4},{},()=>0)[0];
  const selected=Object.fromEntries(g.questions.map(q=>[q.id,q.answer]));
  assert.ok(gradeDokkai(g,selected).every(a=>a.correct));
  selected[g.questions[0].id]='invalid';
  const result=gradeDokkai(g,selected);assert.equal(result[0].chosen,null);assert.equal(result[0].correct,false);
  assert.equal(result.filter(a=>a.correct).length,g.questions.length-1);
  assert.ok(gradeDokkai(g,{}).every(a=>a.chosen===null&&!a.correct));
});

test('stale tabs preserve exposure history from other tabs before choosing new questions',()=>{
  const first=questions[0].id,second=questions[1].id;
  const merged=mergeDokkaiHistory({[first]:3},{[first]:1,[second]:2,unknown:1},passages);
  assert.deepEqual(merged,{[first]:3,[second]:2});
  const groups=createDokkaiSession(passages,{level:'N5',count:18},merged);
  assert.ok(ids(groups).every(id=>id!==first&&id!==second));
  assert.deepEqual(mergeDokkaiHistory(merged,null,passages),merged);
});

test('reading markup reveals furigana only on request and never interprets source HTML',()=>{
  const text='{図書館|としょかん}へ。<script>alert(1)</script>';
  assert.doesNotMatch(dokkaiMarkup(text,escape),/<ruby>|<rt>|<script>/);
  const shown=dokkaiMarkup(text,escape,true);
  assert.match(shown,/<ruby>図書館<rt>としょかん<\/rt><\/ruby>/);
  assert.match(shown,/&lt;script&gt;/);
});

test('completed Dokkai scores survive progress reload without changing other modes',()=>{
  const history=[{date:'2026-10-16T10:00:00.000Z',mode:'dokkai',level:'N3',total:20,correct:17},{date:'2026-10-16T09:00:00.000Z',mode:'henkan',total:5,correct:3}];
  assert.deepEqual(cleanProgress({history},[]).history,history);
});
