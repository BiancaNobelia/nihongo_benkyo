// Independent rough drawings, never used as recognition templates. The five
// variants cover proportions, interrupted strokes and uneven mouse movement.
// node scripts/benchmark_handwriting.mjs --compare d50ad37c8bfecd03cbc357f3e41f1007c6456323
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {prepareTemplates,recognize} from '../handwriting-core.js';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const rows=read('../data/handwriting-templates.json').templates;
const templates=prepareTemplates([...rows,...read('../data/handwriting-variants.json').templates]);
const drawings=read('../tests/fixtures/handwriting-drawings.json').drawings;
const baselineRef=process.argv[process.argv.indexOf('--compare')+1];
let baseline;
if(process.argv.includes('--compare')){
  if(!/^[a-f0-9]{7,40}$/.test(baselineRef))throw new Error('Pass a hexadecimal Git commit after --compare');
  const source=execFileSync('git',['show',`${baselineRef}:handwriting-core.js`],{encoding:'utf8'});
  const module=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  baseline={recognize:module.recognize,templates:module.prepareTemplates(rows)};
}
const total={samples:0,current:{top1:0,top5:0,top20:0},...(baseline?{baselineRef,baseline:{top1:0,top5:0,top20:0}}:{})};
const failures=[];
for(const [char,original] of Object.entries(drawings)){
  const inputs={normal:original,wide:original.map(s=>s.map(([x,y])=>[x*1.5,y])),
    narrow:original.map(s=>s.map(([x,y])=>[x*.65,y])),
    split:original.flatMap(s=>s.slice(1).map((p,i)=>[s[i],p])),
    uneven:original.map((s,n)=>s.map(([x,y],i)=>[x+Math.sin(i+n)*2,y+Math.cos(i-n)*3]))};
  for(const [kind,strokes] of Object.entries(inputs)){
    total.samples++;
    const current=recognize(strokes,templates).findIndex(r=>r.char===char)+1;
    if(current===0||current>5)failures.push({char,kind,rank:current||null});
    for(const [name,rank] of [['current',current],...(baseline?[['baseline',baseline.recognize(strokes,baseline.templates).findIndex(r=>r.char===char)+1]]:[])]){
      if(rank===1)total[name].top1++;
      if(rank>0&&rank<=5)total[name].top5++;
      if(rank>0&&rank<=20)total[name].top20++;
    }
  }
}
console.log(JSON.stringify({...total,remainingTop5Misses:failures},null,2));
