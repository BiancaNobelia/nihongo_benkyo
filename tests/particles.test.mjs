import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PARTICLE_ENTRIES as entries,PARTICLE_TOPICS as topics} from '../particle-data.js';
import {PARTICLE_EXAMPLES} from '../data/particle-source.mjs';
import {particlePool,createParticleQuiz,checkParticleAnswer,cleanParticleHistory,recordParticleShown,particlePromptMarkup,particleFeedbackMarkup,PARTICLE_HISTORY_KEY} from '../particle-core.js';
import {cleanProgress} from '../core.js';
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const find=id=>entries.find(q=>q.id===id);

test('particle bank includes all requested forms, with ten unique authored contexts per topic',()=>{
  assert.equal(entries.length,210);assert.equal(topics.length,21);
  assert.deepEqual(topics.filter(t=>t.kind==='basic').map(t=>t.label),['へ','に','で','の','は','も','が','を','と','から','か','しか','とか']);
  assert.deepEqual(topics.filter(t=>t.kind==='combined').map(t=>t.label),['への','での','では','には','へは','のは','のに','のでは']);
  assert.equal(new Set(entries.map(q=>q.id)).size,entries.length);
  assert.equal(new Set(entries.map(q=>q.example)).size,entries.length);
  for(const topic of topics){const pool=particlePool(entries,{topics:[topic.id]});assert.equal(pool.length,10);assert.equal(PARTICLE_EXAMPLES[topic.id].length,10);assert.ok(pool.every(q=>q.answer===topic.label));}
  for(const q of entries){assert.equal(q.before+q.answer+q.after,q.example);assert.ok(q.translation&&q.note);assert.ok(Array.isArray(q.furigana));}
});

test('each question has one blank, four different choices and no valid alternative presented as wrong',()=>{
  for(const q of entries){
    const quiz=createParticleQuiz([q],{topics:[q.topic],count:10},{},random(4));assert.equal(quiz.length,1);
    const options=quiz[0].options;assert.equal(options.length,4);assert.equal(new Set(options).size,4);
    assert.equal(options.filter(o=>checkParticleAnswer(q,o)).length,1,q.id);
    assert.ok(options.includes(q.answer));assert.ok(!checkParticleAnswer(q,null));assert.ok(!checkParticleAnswer(q,''));
    assert.equal((particlePromptMarkup(q,escape).match(/class="bunpou-blank"/g)||[]).length,1);
    assert.ok(!particlePromptMarkup(q,escape).includes('<ruby>'));
  }
});

test('destination and recipient ni/e variants are protected and important usage distinctions have explicit explanations',()=>{
  for(const q of entries.filter(q=>q.topic==='e')){assert.ok(checkParticleAnswer(q,'に'));assert.ok(!q.distractors.includes('に'));}
  for(const q of entries.filter(q=>q.topic==='ewa')){assert.ok(checkParticleAnswer(q,'には'));assert.ok(!q.distractors.includes('には'));}
  for(const id of ['particle-ni-05','particle-ni-06','particle-ni-07']){assert.ok(checkParticleAnswer(find(id),'へ'));assert.ok(!find(id).distractors.includes('へ'));}
  // A nominal modifier can also attach to the predicate in these sentences.
  // E.g. 父への手紙を出しました and 父へ手紙を出しました are both valid.
  for(const q of entries.filter(q=>q.topic==='eno'||q.topic==='deno'))assert.ok(!q.distractors.some(d=>['へ','に','で','の'].includes(d)),q.id);
  for(const id of ['particle-eno-05','particle-eno-06','particle-eno-10'])assert.ok(checkParticleAnswer(find(id),'へ'));
  for(const id of ['particle-deno-02','particle-deno-07','particle-deno-09','particle-deno-10'])assert.ok(checkParticleAnswer(find(id),'で'));
  assert.match(find('particle-ni-01').note,/keberadaan/);
  assert.match(find('particle-de-01').note,/tindakan/);
  assert.match(find('particle-dewa-06').note,/negatif predikat nomina/);
  assert.match(find('particle-noni-01').note,/kegunaan/);
  assert.match(find('particle-noni-06').note,/pertentangan/);
  for(const id of ['particle-noni-08','particle-noni-09','particle-nodewa-03','particle-nodewa-10'])assert.ok(find(id).before.endsWith('な'));
});

test('every kanji has correctly placed furigana, while feedback always includes meaning, function and answer',()=>{
  for(const q of entries){
    let previousEnd=0;
    for(const [offset,word,reading] of q.furigana){assert.ok(offset>=previousEnd);assert.equal(q.example.slice(offset,offset+word.length),word);assert.match(reading,/^[ぁ-ゖー]+$/u);previousEnd=offset+word.length;}
    for(let i=0;i<q.example.length;i++)if(/[\p{Script=Han}々]/u.test(q.example[i]))assert.ok(q.furigana.some(([offset,word])=>i>=offset&&i<offset+word.length),q.id);
    const html=particleFeedbackMarkup(q,escape);assert.ok(html.includes(escape(q.translation)));assert.ok(html.includes(escape(q.note)));assert.ok(html.includes(`<strong>${q.answer}</strong>`));
    assert.equal((html.match(/<ruby>/g)||[]).length,q.furigana.length);assert.ok(html.includes('FUNGSI PARTIKEL'));
  }
});

test('topic selection, count validation and balanced rotation avoid repeated question IDs',()=>{
  assert.equal(particlePool(entries,{topics:topics.filter(t=>t.kind==='basic').map(t=>t.id)}).length,130);
  assert.equal(particlePool(entries,{topics:topics.filter(t=>t.kind==='combined').map(t=>t.id)}).length,80);
  assert.equal(particlePool(entries,{topics:['e','e','invalid']}).length,10);
  assert.deepEqual(particlePool(entries,{topics:null}),[]);
  assert.deepEqual(createParticleQuiz(entries,{topics:[]}),[]);
  for(const count of [0,-1,1.1,NaN,Infinity])assert.deepEqual(createParticleQuiz(entries,{count}),[]);
  for(const count of [1,10,20,50,130,210,99999]){
    const questions=createParticleQuiz(entries,{count},{},random(count));assert.equal(questions.length,Math.min(count,210));assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
    assert.equal(new Set(questions.slice(0,21).map(q=>q.topic)).size,Math.min(count,21));
  }
  const questions=createParticleQuiz(entries,{topics:['eno','deno'],count:50},{},random(2));assert.equal(questions.length,20);assert.ok(questions.every(q=>['eno','deno'].includes(q.topic)));
});

test('shown questions rotate across sessions without using another quiz history',()=>{
  const first=createParticleQuiz(entries,{count:50},{},random(3));const history=first.reduce((h,q)=>recordParticleShown(h,q.id),{});
  const second=createParticleQuiz(entries,{count:50},history,random(3));assert.ok(second.every(q=>!history[q.id]));
  const clean=cleanParticleHistory({...history,'verb-0001:te':1,bogus:2},entries);assert.deepEqual(clean,history);
  assert.deepEqual(cleanParticleHistory(null,entries),{});assert.deepEqual(cleanParticleHistory({[first[0].id]:-1},entries),{});
  assert.equal(PARTICLE_HISTORY_KEY,'nihongo-benkyo-particle-history-v1');
  const exhausted=entries.reduce((h,q)=>recordParticleShown(h,q.id),{});exhausted[first[0].id]=2;
  const next=createParticleQuiz(entries,{count:entries.length-1},exhausted,random(5));assert.ok(next.every(q=>q.id!==first[0].id));
});

test('new particles cover different functions and protect valid readings and constructions',()=>{
  const shika=particlePool(entries,{topics:['shika']});
  assert.equal(shika.length,10);
  for(const q of shika){assert.match(q.after,/(ありません|いません|ません|ませんでした)/);assert.match(q.translation,/hanya/i);assert.ok(q.distractors.includes('だけ'));}
  for(const id of ['particle-mo-05','particle-shika-05','particle-shika-07'])assert.ok(find(id).before.endsWith('に'));
  for(const id of ['particle-mo-06','particle-shika-06'])assert.ok(find(id).before.endsWith('で'));
  assert.match(find('particle-mo-07').translation,/seorang pun/);assert.match(find('particle-mo-08').translation,/apa pun/);
  assert.match(find('particle-mo-10').note,/terasa lama/);
  assert.match(find('particle-ga-03').note,/kata tanya/);assert.ok(!checkParticleAnswer(find('particle-ga-03'),'は'));
  assert.match(find('particle-ga-08').note,/dua penilaian/);assert.ok(!find('particle-ga-07').distractors.includes('を'));
  assert.ok(checkParticleAnswer(find('particle-wo-03'),'で'));assert.ok(checkParticleAnswer(find('particle-wo-08'),'から'));
  assert.match(find('particle-wo-09').note,/lintasan/);assert.ok(!find('particle-wo-10').distractors.includes('で'));
  assert.match(find('particle-to-05').note,/kutipan/);assert.match(find('particle-to-08').note,/otomatis/);
  assert.match(find('particle-kara-01').note,/rentang waktu/);assert.match(find('particle-kara-06').note,/alasan/);assert.match(find('particle-kara-09').note,/urutan/);
  assert.ok(!find('particle-kara-04').distractors.includes('の'));assert.ok(checkParticleAnswer(find('particle-kara-05'),'に'));
  assert.match(find('particle-ka-04').note,/alternatif/);assert.match(find('particle-ka-06').note,/belum ditentukan/);assert.match(find('particle-ka-09').note,/tidak langsung/);
  for(const q of particlePool(entries,{topics:['toka']})){assert.ok(!q.distractors.some(d=>['や','と'].includes(d)));assert.ok(q.after.includes('とか'));}
});

test('old question history survives expansion and the eighty new questions are served before repeats',()=>{
  const added=new Set(['mo','ga','wo','to','kara','ka','shika','toka']);
  const old=entries.filter(q=>!added.has(q.topic));assert.equal(old.length,130);
  const history=old.reduce((h,q)=>recordParticleShown(h,q.id),{});
  assert.deepEqual(cleanParticleHistory(history,entries),history);
  const next=createParticleQuiz(entries,{count:80},history,random(20));
  assert.equal(next.length,80);assert.equal(new Set(next.map(q=>q.id)).size,80);
  assert.ok(next.every(q=>added.has(q.topic)));assert.equal(new Set(next.map(q=>q.topic)).size,8);
});

test('particle scores survive cleanup and navigation links reach the dedicated view',()=>{
  const entry={date:'2026-10-15T00:00:00.000Z',correct:9,total:10,mode:'particle',topics:['e','deno']};
  assert.deepEqual(cleanProgress({history:[entry]},[]).history,[entry]);
  assert.deepEqual(cleanProgress({history:[{...entry,correct:11}]},[]).history,[]);
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(index.includes('href="#partikel" data-nav="partikel"'));assert.ok(app.includes("view === 'partikel'"));assert.ok(app.includes('particleView.dispose()'));
});
