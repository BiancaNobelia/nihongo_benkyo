import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BUNPOU_ENTRIES as entries,BUNPOU_PATTERNS as patterns,BUNPOU_CHAPTERS as chapters} from '../bunpou-data.js';
import {BUNPOU_ALL_CHAPTERS,bunpouPool,createBunpouQuiz,cleanBunpouHistory,recordBunpouShown,bunpouPromptMarkup,bunpouFeedbackMarkup} from '../bunpou-core.js';
import {cleanProgress} from '../core.js';
import {KANJI} from '../kanji-data.js';
const read=name=>JSON.parse(readFileSync(new URL(`../data/${name}`,import.meta.url),'utf8'));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('bunpou retains all 330 source rows and reconciles every chapter, example, rule and source location',()=>{
  const rows=read('bunpou-source.json'),manifest=read('bunpou-manifest.json'),overrides=read('bunpou-overrides.json');
  assert.equal(patterns.length,330);assert.equal(patterns.length,manifest.entryCount);assert.equal(new Set(entries.map(q=>q.id)).size,entries.length);
  assert.deepEqual(chapters.map(c=>c.number),BUNPOU_ALL_CHAPTERS);
  for(const row of rows){
    const q=entries.find(q=>q.id===row.id);assert.ok(q,row.id);const expected={...row,...overrides[row.id]};
    for(const key of ['chapter','theme','pattern','meaning','structure','example','translation','note','sheet','sourceRow'])assert.equal(q[key],expected[key],`${row.id} ${key}`);
    assert.equal(q.before+q.answer+q.after,q.example);assert.ok(q.cue);assert.equal(q.book,q.chapter<=25?1:2);
    assert.ok(!Object.hasOwn(q,'status'),'Workbook memorization status must not become user progress');
  }
  for(const c of chapters){assert.equal(patterns.filter(q=>q.chapter===c.number).length,manifest.chapterCounts[c.number]);assert.equal(c.patternCount,manifest.chapterCounts[c.number]);}
  for(const o of Object.values(overrides))assert.ok(o.reason);
});

test('every cloze has one blank and four unique choices, without repeating the answer outside the blank',()=>{
  for(const q of entries){
    assert.equal(new Set([q.answer,...q.distractors]).size,4,q.id);
    assert.equal(q.distractors.length,3,q.id);assert.ok(!(q.before+q.after).includes(q.answer),q.id);
    const html=bunpouPromptMarkup(q,escape);assert.equal((html.match(/class="bunpou-blank"/g)||[]).length,1);
    assert.ok(!html.includes(q.translation));assert.ok(!html.includes(q.structure));
    const quiz=createBunpouQuiz([q],{count:10,chapters:[q.chapter]}, {},random(4));
    assert.equal(quiz.length,1);assert.equal(quiz[0].options.length,4);assert.equal(quiz[0].options.filter(x=>x===q.answer).length,1);
  }
});

test('chapter/book filters compose precisely and custom sessions cap without duplicate questions',()=>{
  const original=JSON.stringify(entries);
  for(const selected of [[1],[25],[26],[50],[1,26,50],BUNPOU_ALL_CHAPTERS.slice(0,25),BUNPOU_ALL_CHAPTERS.slice(25),BUNPOU_ALL_CHAPTERS]){
    const expected=entries.filter(q=>selected.includes(q.chapter));
    assert.deepEqual(bunpouPool(entries,{chapters:selected}),expected);
    for(const count of [10,20,50,9999]){
      const q=createBunpouQuiz(entries,{chapters:selected,count},{},random(123));
      assert.equal(q.length,Math.min(count,expected.length));assert.equal(new Set(q.map(x=>x.id)).size,q.length);assert.ok(q.every(x=>selected.includes(x.chapter)));
    }
  }
  assert.equal(JSON.stringify(entries),original);
  for(const count of [0,-1,NaN,Infinity,1.5,'10'])assert.deepEqual(createBunpouQuiz(entries,{count}),[]);
  assert.deepEqual(createBunpouQuiz(entries,{chapters:[]}),[]);assert.deepEqual(bunpouPool(entries,{chapters:null}),[]);
  assert.equal(bunpouPool(entries,{chapters:[1,1,-1,51,'2']}).length,26);
});

test('rotation prioritizes unseen questions, keeps old history, and records only displayed items',()=>{
  const settings={chapters:[1,2,3,4,5],count:10};
  const first=createBunpouQuiz(entries,settings,{},random(4));let history={};
  for(const q of first.slice(0,3))history=recordBunpouShown(history,q.id);
  const next=createBunpouQuiz(entries,settings,history,random(4));assert.ok(next.every(q=>!history[q.id]));
  assert.equal(Object.keys(history).length,3);
  const full=createBunpouQuiz(entries,{...settings,count:9999},history,random(2));
  assert.ok(full.slice(0,-3).every(q=>!history[q.id]));assert.ok(full.slice(-3).every(q=>history[q.id]));
  assert.deepEqual(cleanBunpouHistory({...history,bad:1,[entries[50].id]:-1,[entries[51].id]:Infinity},entries),history);
  assert.deepEqual(cleanBunpouHistory(null,entries),{});
  assert.deepEqual(cleanBunpouHistory([],entries),{});
});

test('feedback contains full meaning and grammatical explanation for every source row and escapes content',()=>{
  for(const q of entries){
    const html=bunpouFeedbackMarkup(q,escape);
    const base=html.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,'');
    assert.ok(base.includes(escape(q.example)),q.id);
    for(const key of ['translation','pattern','meaning','structure','note'])assert.ok(html.includes(escape(q[key])),`${q.id} ${key}`);
    assert.ok(html.includes(`BAB ${q.chapter}`));
  }
  const q={...entries[0],before:'<script>',after:'"<&',answer:'<img>',pattern:'<svg>',note:'<script>alert(1)</script>'};
  const html=bunpouPromptMarkup(q,escape)+bunpouFeedbackMarkup(q,escape);
  assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img>'));assert.ok(!html.includes('<svg>'));
});

test('source corrections and semantic cues distinguish accepted alternatives and keigo actor direction',()=>{
  const get=id=>entries.find(q=>q.id===`bunpou-${id}`);
  assert.equal(get('11-08').answer,'どのくらい');assert.ok(!get('11-08').distractors.includes('どれくらい'));
  assert.equal(get('23-03').answer,'行かないとき');
  assert.ok(get('45-05').pattern.includes('な形容詞な'));assert.equal(get('50-02').pattern,'ご＋N（tindakan）＋します');
  for(const id of ['43-01','43-02','43-03'])assert.ok(get(id).cue.includes('bukan'));
  assert.ok(get('49-04').cue.includes('dosen'));assert.ok(get('50-04').cue.includes('saya sendiri'));
  assert.ok(!get('49-05').distractors.includes('食べられます'));
  assert.ok(!get('35-01').distractors.includes('あらば'));
  assert.ok(!get('06-01').distractors.includes('は'));
});

test('bunpou scores retain valid chapter selections after reload without affecting older quiz modes',()=>{
  const entry={date:'2026-10-15',mode:'bunpou',total:330,correct:320,chapters:[1,1,50,-1,'2',51]};
  const old={date:'2026-10-14',mode:'henkan',total:20,correct:15};
  const cleaned=cleanProgress({history:[old,entry]},KANJI).history;
  assert.equal(cleaned.length,2);assert.deepEqual(cleaned[0],old);assert.deepEqual(cleaned[1].chapters,[1,50]);
  assert.equal(cleanProgress({history:[{...entry,correct:331}]},KANJI).history.length,0);
});
