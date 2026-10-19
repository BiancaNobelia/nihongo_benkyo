// Evaluation drawings are never used as recognition templates. Compare the
// actual WASM model + fallback to a pinned older geometric recognizer.
// node scripts/benchmark_handwriting.mjs --compare c46aac3
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {prepareTemplates,recognize} from '../handwriting-core.js';
import {createNeuralRecognizer} from '../handwriting-neural.js';
import {combineCandidates} from '../handwriting-engine.js';
import {handwritingVariations} from '../tests/fixtures/handwriting-variations.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const rows=read('../data/handwriting-templates.json').templates;
const allRows=[...rows,...read('../data/handwriting-variants.json').templates];
const templates=prepareTemplates(allRows);
const drawings={...read('../tests/fixtures/handwriting-drawings.json').drawings,...read('../tests/fixtures/handwriting-complex.json').drawings};
const model=await createNeuralRecognizer(new Set(rows.map(r=>r[0])),{initTimeout:0,readAsset:async(path,text)=>readFileSync(new URL('../'+path,import.meta.url),text?'utf8':undefined)});
const baselineRef=process.argv[process.argv.indexOf('--compare')+1];
let baseline;
if(process.argv.includes('--compare')){
  if(!/^[a-f0-9]{7,40}$/.test(baselineRef))throw new Error('Pass a hexadecimal Git commit after --compare');
  const source=execFileSync('git',['show',`${baselineRef}:handwriting-core.js`],{encoding:'utf8'});
  const module=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const baselineRows=JSON.parse(execFileSync('git',['show',`${baselineRef}:data/handwriting-templates.json`],{encoding:'utf8'})).templates;
  // The previous improvement uses both datasets; do not handicap the baseline
  // by accidentally dropping its KanjiCanvas references.
  const paths=execFileSync('git',['ls-tree','--name-only',baselineRef,'data/handwriting-variants.json'],{encoding:'utf8'});
  if(paths.trim())baselineRows.push(...JSON.parse(execFileSync('git',['show',`${baselineRef}:data/handwriting-variants.json`],{encoding:'utf8'})).templates);
  baseline={recognize:module.recognize,templates:module.prepareTemplates(baselineRows)};
}
const counter=()=>({top1:0,top5:0,top20:0});
const total={samples:0,current:counter(),...(baseline?{baselineRef,baseline:counter()}:{})};
const failures=[],byVariant={};
try{
  for(const [char,original] of Object.entries(drawings))for(const [kind,strokes] of Object.entries(handwritingVariations(original))){
    total.samples++;
    byVariant[kind]??={samples:0,current:counter(),...(baseline?{baseline:counter()}:{})};byVariant[kind].samples++;
    const current=combineCandidates(await model.recognize(strokes),recognize(strokes,templates)).findIndex(r=>r.char===char)+1;
    if(current===0||current>5)failures.push({char,kind,rank:current||null});
    for(const [name,rank] of [['current',current],...(baseline?[['baseline',baseline.recognize(strokes,baseline.templates).findIndex(r=>r.char===char)+1]]:[])]){
      for(const n of [1,5,20])if(rank>0&&rank<=n){total[name]['top'+n]++;byVariant[kind][name]['top'+n]++;}
    }
  }
  console.log(JSON.stringify({...total,byVariant,remainingTop5Misses:failures},null,2));
}finally{await model.dispose();}
