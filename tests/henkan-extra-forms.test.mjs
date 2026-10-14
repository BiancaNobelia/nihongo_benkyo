import test from 'node:test';
import assert from 'node:assert/strict';
import {HENKAN_VERBS as verbs} from '../henkan-data.js';
import {KANJI} from '../kanji-data.js';
import {cleanProgress} from '../core.js';
import {FORM_LABELS,FORM_MEANINGS,HENKAN_MODES,conjugateVerb,spellForm,acceptedAnswers,henkanOptions,formExplanation,henkanPool,createHenkanQuiz,cleanHenkanHistory} from '../henkan-core.js';
import {honorificFor} from '../henkan-honorific.js';
import {henkanDetailMarkup} from '../henkan-view.js';
const find=word=>{const v=verbs.find(v=>v.word===word);assert.ok(v,word);return v;};
const forms=['volitional','imperative','prohibitive','conditional','causative'];

test('new forms cover all nine godan endings and the three other verb groups',()=>{
  const examples=[
    ['買う','かおう','かえ','かうな','かえば','かわせる'],
    ['書く','かこう','かけ','かくな','かけば','かかせる'],
    ['泳ぐ','およごう','およげ','およぐな','およげば','およがせる'],
    ['話す','はなそう','はなせ','はなすな','はなせば','はなさせる'],
    ['待つ','まとう','まて','まつな','まてば','またせる'],
    ['死ぬ','しのう','しね','しぬな','しねば','しなせる'],
    ['遊ぶ','あそぼう','あそべ','あそぶな','あそべば','あそばせる'],
    ['読む','よもう','よめ','よむな','よめば','よませる'],
    ['帰る','かえろう','かえれ','かえるな','かえれば','かえらせる'],
    ['食べる','たべよう','たべろ','たべるな','たべれば','たべさせる'],
    ['起きる','おきよう','おきろ','おきるな','おきれば','おきさせる'],
    ['する','しよう','しろ','するな','すれば','させる'],
    ['勉強する','べんきょうしよう','べんきょうしろ','べんきょうするな','べんきょうすれば','べんきょうさせる'],
    ['来る','こよう','こい','くるな','くれば','こさせる'],
    ['持って来る','もってこよう','もってこい','もってくるな','もってくれば','もってこさせる'],
  ];
  for(const [word,...expected] of examples){const f=conjugateVerb(find(word));assert.deepEqual(forms.map(k=>f[k]),expected,word);}
});

test('imperative exceptions distinguish benefactive kureru from the homophone kureru (sunset)',()=>{
  for(const [word,expected] of [['くれる','くれ'],['教えてくれる','おしえてくれ'],['暮れる','くれろ'],['いらっしゃる','いらっしゃい'],['おっしゃる','おっしゃい'],['なさる','なさい'],['下さる','ください']])assert.equal(conjugateVerb(find(word)).imperative,expected,word);
  for(const [word,form,accepted] of [['食べる','imperative','たべよ'],['する','imperative','せよ'],['勉強する','imperative','べんきょうせよ'],['書く','causative','かかす'],['食べる','causative','たべさす']])assert.ok(acceptedAnswers(find(word),form).includes(accepted));
  assert.equal(conjugateVerb(find('愛する')).causative,'あいさせる');
  assert.equal(conjugateVerb(find('罰する')).conditional,'ばっすれば');
});

test('sonkei handles lexical replacements and three reviewed patterns without altering the base meaning',()=>{
  for(const [word,reading,spelling] of [
    ['行く','いらっしゃる','いらっしゃる'],['来る','いらっしゃる','いらっしゃる'],['いる','いらっしゃる','いらっしゃる'],
    ['言う','おっしゃる','おっしゃる'],['する','なさる','なさる'],['くれる','くださる','下さる'],
    ['見る','ごらんになる','ご覧になる'],['食べる','めしあがる','召し上がる'],['飲む','めしあがる','召し上がる'],
    ['寝る','おやすみになる','お休みになる'],['着る','おめしになる','お召しになる'],
    ['読む','およみになる','お読みになる'],['教える','おおしえになる','お教えになる'],['買う','おかいになる','お買いになる'],
    ['勉強する','べんきょうなさる','勉強なさる'],['働く','はたらかれる','働かれる'],
  ]){
    const v=find(word);assert.equal(conjugateVerb(v).honorific,reading,word);
    assert.equal(spellForm(v,reading,'honorific'),spelling,word);
    const html=henkanDetailMarkup({verb:v,form:'honorific',answer:reading},String);
    assert.ok(html.includes(v.meaning));assert.ok(html.includes(spelling));assert.ok(html.includes('gurumu'));
  }
  for(const word of ['ある','要る','降る','壊れる','見える','できる','いらっしゃる','伺う','ご覧になる','お手伝いする'])assert.equal(conjugateVerb(find(word)).honorific,undefined,word);
});

test('valid honorific alternatives never appear as wrong answers and each question supplies actor and pattern',()=>{
  for(const [word,alternatives] of [['読む',['よまれる']],['来る',['こられる','おいでになる']],['食べる',['たべられる','おたべになる']],['勉強する',['べんきょうされる','ごべんきょうになる']]]){
    const v=find(word);for(const alt of alternatives)assert.ok(acceptedAnswers(v,'honorific').includes(alt),alt);
  }
  for(const level of ['N5','N4','N3']){
    const pool=henkanPool(verbs,{level,modes:['honorific']});assert.ok(pool.length>=20,level);
    const q=createHenkanQuiz(verbs,{level,modes:['honorific'],count:20});assert.equal(q.length,20);
    for(const item of q){assert.ok(item.instruction.includes('gurumu'));assert.ok(item.instruction.includes('bentuk kamus'));}
    for(const {verb:v,form,answer} of pool)for(let i=0;i<5;i++){
      const options=henkanOptions(v,form);const alternatives=acceptedAnswers(v,form).filter(x=>x!==answer);
      assert.ok(options.every(o=>!alternatives.includes(o)));assert.equal(options.length,4);
      assert.ok(honorificFor(v,conjugateVerb(v)).pattern);
    }
  }
});

test('every offered form has a defined explanation and feedback; kuru spellings keep the right ending',()=>{
  for(const v of verbs)for(const form of Object.keys(FORM_LABELS)){
    const answer=conjugateVerb(v)[form];if(!answer)continue;
    assert.ok(FORM_MEANINGS[form]);assert.ok(!formExplanation(v,form).includes('undefined'),`${v.word} ${form}`);
  }
  for(const form of [...forms,'honorific']){
    const v=find('食べる'),answer=conjugateVerb(v)[form],html=henkanDetailMarkup({verb:v,form,answer},String);
    assert.ok(html.includes(FORM_LABELS[form]));assert.ok(html.includes(v.meaning));assert.ok(html.includes(answer));
  }
  for(const [form,expected] of [['volitional','来よう'],['imperative','来い'],['prohibitive','来るな'],['conditional','来れば'],['causative','来させる']]){
    const v=find('来る');assert.equal(spellForm(v,conjugateVerb(v)[form],form),expected);
  }
});

test('existing exposure history is retained, new forms rotate first, and large session scores survive reload',()=>{
  const modes=Object.keys(HENKAN_MODES),pool=henkanPool(verbs,{level:'all',modes});
  assert.ok(pool.length>10000&&pool.length<20000);
  const v=find('食べる'),history={[v.id+':te']:5,[v.id+':ta']:1,bad:12};
  assert.deepEqual(cleanHenkanHistory(history,verbs),{[v.id+':te']:5,[v.id+':ta']:1});
  const q=createHenkanQuiz([v],{level:'all',modes:['te','ta','volitional'],count:1},history);
  assert.equal(q[0].form,'volitional');
  const entry={date:'2026-10-15',mode:'henkan',level:'all',total:pool.length,correct:pool.length-1,forms:modes};
  assert.equal(cleanProgress({history:[entry]},KANJI).history.length,1);
  assert.equal(cleanProgress({history:[{...entry,correct:pool.length+1}]},KANJI).history.length,0);
});
