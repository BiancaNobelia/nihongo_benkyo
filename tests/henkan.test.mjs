import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HENKAN_VERBS as verbs} from '../henkan-data.js';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {KOTOBA_N3_ENTRIES} from '../kotoba-n3-data.js';
import {KANJI} from '../kanji-data.js';
import {cleanProgress} from '../core.js';
import {HENKAN_MODES,FORM_LABELS,conjugateVerb,spellForm,henkanPool,createHenkanQuiz,henkanOptions,acceptedAnswers,cleanHenkanHistory,recordHenkanShown} from '../henkan-core.js';
import {henkanDetailMarkup} from '../henkan-view.js';
const find=(word,reading)=>{const v=verbs.find(v=>v.word===word&&(!reading||v.reading===reading));assert.ok(v,word);return v;};
const random=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('henkan covers every existing verb entry, with documented normalization and unique lexical records',()=>{
  const source=JSON.parse(readFileSync(new URL('../data/henkan-source.json',import.meta.url)));
  const authored=JSON.parse(readFileSync(new URL('../data/henkan-verbs.json',import.meta.url)));
  assert.deepEqual(verbs,authored);
  assert.equal(verbs.length,source.entryCount);
  assert.equal(new Set(verbs.map(v=>`${v.word}|${v.reading}`)).size,verbs.length);
  const covered=new Set(verbs.flatMap(v=>v.sources));
  for(const e of [...KOTOBA_ENTRIES,...KOTOBA_N3_ENTRIES].filter(e=>e.type.includes('kerja')))assert.ok(covered.has(e.id)||source.excluded.some(x=>x.id===e.id&&x.reason),`${e.id} ${e.spelling}`);
  assert.deepEqual([...covered].sort(),source.coveredSourceIds);
  for(const [level,count] of Object.entries(source.levels))assert.equal(verbs.filter(v=>v.level===level).length,count);
  assert.equal(find('点ける').group,'ichidan');
  assert.equal(find('する').group,'suru');
  assert.ok(!verbs.some(v=>['働かせる','食べさせる','走れる','知っている'].includes(v.word)));
});
test('all godan ending classes use the correct te, ta, nai, potential and passive rows',()=>{
  const expected=[
    ['買う','かって','かった','かわない','かえる','かわれる'],
    ['書く','かいて','かいた','かかない','かける','かかれる'],
    ['泳ぐ','およいで','およいだ','およがない','およげる','およがれる'],
    ['話す','はなして','はなした','はなさない','はなせる','はなされる'],
    ['待つ','まって','まった','またない','まてる','またれる'],
    ['遊ぶ','あそんで','あそんだ','あそばない','あそべる','あそばれる'],
    ['読む','よんで','よんだ','よまない','よめる','よまれる'],
    ['帰る','かえって','かえった','かえらない','かえれる','かえられる'],
  ];
  for(const [word,...forms] of expected){const f=conjugateVerb(find(word));assert.deepEqual(['te','ta','nai','potential','passive'].map(k=>f[k]),forms,word);}
  const death=conjugateVerb(find('死ぬ'));assert.equal(death.te,'しんで');assert.equal(death.nai,'しなない');assert.equal(death.potential,undefined);
});
test('ichidan, irregular and compound verbs preserve stems and handle exceptions',()=>{
  for(const [word,forms] of [
    ['食べる',['たべます','たべて','たべた','たべない','たべられる','たべられる']],
    ['起きる',['おきます','おきて','おきた','おきない','おきられる','おきられる']],
    ['する',['します','して','した','しない','できる','される']],
    ['勉強する',['べんきょうします','べんきょうして','べんきょうした','べんきょうしない','べんきょうできる','べんきょうされる']],
    ['来る',['きます','きて','きた','こない','こられる','こられる']],
    ['持って来る',['もってきます','もってきて','もってきた','もってこない','もってこられる','もってこられる']],
  ]){const v=find(word),f=conjugateVerb(v);assert.deepEqual(['masu','te','ta','nai','potential','passive'].map(k=>f[k]),forms,word);}
  assert.equal(conjugateVerb(find('行く')).te,'いって');
  assert.equal(conjugateVerb(find('連れて行く')).ta,'つれていった');
  assert.equal(conjugateVerb(find('問う')).te,'とうて');
  assert.equal(conjugateVerb(find('問う')).ta,'とうた');
  assert.equal(conjugateVerb(find('ある')).nai,'ない');
  assert.equal(conjugateVerb(find('ある')).nakatta,'なかった');
  assert.equal(conjugateVerb(find('愛する')).nai,'あいさない');
  assert.equal(conjugateVerb(find('愛する')).potential,'あいせる');
  assert.equal(conjugateVerb(find('罰する')).passive,'ばっせられる');
  assert.equal(conjugateVerb(find('いらっしゃる')).masu,'いらっしゃいます');
  assert.equal(conjugateVerb(find('下さる')).masu,'くださいます');
  assert.equal(conjugateVerb(find('励ます')).masu,'はげまします');
  assert.equal(spellForm(find('来る'),'こない'),'来ない');
  assert.equal(spellForm(find('持って来る'),'もってこられる'),'持って来られる');
  assert.equal(spellForm(find('書く'),'かいて'),'書いて');
});
test('every offered form has four distinct options and never uses another valid variant as a distractor',()=>{
  for(const v of verbs)for(const form of Object.keys(conjugateVerb(v)).filter(k=>!['masu','masen','mashita','masendeshita'].includes(k))){
    const options=henkanOptions(v,form,random(42));assert.equal(options.length,4,`${v.word} ${form}`);assert.equal(new Set(options).size,4);
    const answer=conjugateVerb(v)[form];assert.equal(options.filter(o=>acceptedAnswers(v,form).includes(o)).length,1);
    assert.ok(options.includes(answer));for(const o of options)assert.match(o,/^[ぁ-ゖー]+$/u);
  }
  for(const word of ['ある','できる','聞こえる','見える','要る'])assert.equal(conjugateVerb(find(word)).potential,undefined,word);
  assert.ok(henkanOptions(find('勉強する'),'passive',random(1)).every(o=>!o.includes('すされる')&&!o.includes('すわれる')));
});
test('level and form filters are exact; futsu overlaps are deduplicated and retain all four tenses',()=>{
  for(const level of ['N5','N4','N3']){
    const pool=henkanPool(verbs,{level,modes:Object.keys(HENKAN_MODES)});
    assert.ok(pool.length);assert.ok(pool.every(q=>q.verb.level===level));assert.equal(new Set(pool.map(q=>q.id)).size,pool.length);
  }
  const questions=createHenkanQuiz([find('食べる')],{level:'all',modes:['futsu','jisho','nai','ta'],count:50},{},random(4));
  assert.equal(questions.length,4);
  assert.deepEqual(new Set(questions.map(q=>`${q.prompt} → ${q.answer}`)),new Set(['たべます → たべる','たべません → たべない','たべました → たべた','たべませんでした → たべなかった']));
  assert.deepEqual(createHenkanQuiz(verbs,{level:'N2',count:10}),[]);
  assert.deepEqual(createHenkanQuiz(verbs,{modes:[],count:10}),[]);
  assert.deepEqual(createHenkanQuiz(verbs,{count:NaN}),[]);
});
test('sessions vary verbs and forms, cap custom counts and prioritize exercises not shown before',()=>{
  for(const level of ['N5','N4','N3'])for(const count of [10,20,50]){
    const q=createHenkanQuiz(verbs,{level,count,modes:Object.keys(HENKAN_MODES)},{},random(count));
    assert.equal(q.length,count);assert.equal(new Set(q.map(q=>q.verb.id)).size,count);assert.equal(new Set(q.map(q=>q.id)).size,count);
    assert.equal(new Set(q.map(q=>q.form)).size,Math.min(count,Object.keys(FORM_LABELS).length));
  }
  const settings={level:'N5',modes:['te'],count:50};const first=createHenkanQuiz(verbs,settings,{},random(1));
  const history=first.reduce((h,q)=>recordHenkanShown(h,q.id),{});const second=createHenkanQuiz(verbs,settings,history,random(1));
  assert.ok(second.every(q=>!history[q.id]));
  const all=createHenkanQuiz(verbs,{level:'N5',modes:['te'],count:99999},{},random(2));
  assert.equal(all.length,verbs.filter(v=>v.level==='N5').length);assert.equal(new Set(all.map(q=>q.id)).size,all.length);
  assert.deepEqual(cleanHenkanHistory({...history,bad:10,[first[0].id]:-1},verbs),Object.fromEntries(Object.entries(history).filter(([id])=>id!==first[0].id)));
});
test('answer feedback always includes the meaning, requested conjugation and explanation; history survives reload',()=>{
  for(const form of ['jisho','te','ta','nai','nakatta','potential','passive']){
    const v=find('食べる'),answer=conjugateVerb(v)[form];const html=henkanDetailMarkup({verb:v,form,answer},escape);
    assert.ok(html.includes(escape(v.meaning)));assert.ok(html.includes(answer));assert.ok(html.includes('Golongan II'));assert.ok(html.includes('Lihat perubahan bentuk'));
  }
  const history=[{date:'2026-10-15',mode:'henkan',level:'N3',total:3000,correct:2000,forms:['futsu','te']}];
  assert.equal(cleanProgress({history},KANJI).history.length,1);
  assert.equal(cleanProgress({history:[{...history[0],correct:3001}]},KANJI).history.length,0);
});
