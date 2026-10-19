import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {KANJI} from '../kanji-data.js';
import {createNeuralRecognizer,rankPredictions,rasterizeWriting} from '../handwriting-neural.js';
import {combineCandidates,createHybridRecognizer,createRecognitionQueue} from '../handwriting-engine.js';
import {handwritingVariations} from './fixtures/handwriting-variations.mjs';
import {createStrokeInput} from '../handwriting-input.js';

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const allowed=new Set(KANJI.map(k=>k.char));
const drawings={...read('./fixtures/handwriting-drawings.json').drawings,...read('./fixtures/handwriting-complex.json').drawings};
const asset=async(p,text)=>readFileSync(new URL('../'+p,import.meta.url),text?'utf8':undefined);

test('self-hosted model, labels, runtime and licenses match the pinned manifests',()=>{
  const manifest=read('../data/handwriting-neural-source.json');
  assert.equal(manifest.license,'MIT');assert.equal(manifest.labels,6507);
  for(const source of manifest.assets)for(const file of source.files){
    const bytes=readFileSync(new URL('../'+file.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);
  }
  const labels=Array.from(readFileSync(new URL('../data/handwriting/dakanji-v2-labels.txt',import.meta.url),'utf8').trim());
  assert.equal(labels.length,6507);
  const results=rankPredictions(new Float32Array(labels.length*2).fill(1),labels,allowed,7000);
  assert.deepEqual(new Set(results.map(r=>r.char)),allowed,'model plus four JIS variants cover the entire catalog');
});

test('quantized zero-probability labels never become arbitrary kanji candidates',()=>{
  const labels=['あ','強','剥','日'];
  assert.deepEqual(rankPredictions(new Float32Array(8),labels,allowed),[]);
  const results=rankPredictions(new Float32Array([1,.8,.1,0,1,.6,.2,0]),labels,allowed);
  assert.deepEqual(results.map(r=>r.char),['強','剝']);
  assert.throws(()=>rankPredictions(new Float32Array(1),labels,allowed));
  assert.throws(()=>rankPredictions(new Float32Array(8).fill(NaN),labels,allowed));
});

test('rasterization is independent of stroke order, direction, canvas size and pen lifts',()=>{
  const paths=drawings['強'],normal=rasterizeWriting(paths);
  for(const variant of [paths.toReversed().map(s=>s.toReversed()),paths.map(s=>s.map(([x,y])=>[x*2+35,y*2-20])),handwritingVariations(paths).split]){
    const pixels=rasterizeWriting(variant);
    assert.ok(normal.every((v,i)=>Math.abs(v-pixels[i])<.00001));
  }
  for(const invalid of [null,[],[[]],[[[1,1]]],[[[NaN,2],[2,Infinity]]],Array.from({length:129},()=>[[0,0],[50,50]])])assert.equal(rasterizeWriting(invalid),null);
  const line=rasterizeWriting([[[5,50],[90,50]]],{aspect:.5});
  const inkRows=new Set(Array.from(line,(v,i)=>v>0?Math.floor(i/64):-1).filter(v=>v!==-1));
  assert.ok(inkRows.size<=3,'a horizontal line must not become a square');
});

test('actual browser WASM model recognizes rough, complex, shaky and gapped evaluation drawings',async()=>{
  const model=await createNeuralRecognizer(allowed,{readAsset:asset,initTimeout:0});
  let top1=0,count=0;
  try{
    for(const [char,paths] of Object.entries(drawings))for(const [kind,strokes] of Object.entries(handwritingVariations(paths))){
      const results=await model.recognize(strokes),rank=results.findIndex(r=>r.char===char)+1;
      assert.ok(rank>0&&rank<=5,`${char} (${kind}) was rank ${rank}: ${results.slice(0,5).map(r=>r.char)}`);
      assert.ok(results.every(r=>allowed.has(r.char)&&r.score>0));
      if(rank===1)top1++;count++;
    }
    assert.equal(count,168);assert.ok(top1>=150,`${top1}/${count} top-one`);
    // More than 64 pen lifts can occur when a complex glyph is fragmented.
    const fragments=drawings['強'].flatMap(s=>s.slice(1).flatMap((b,i)=>Array.from({length:5},(_,j)=>[j/5,(j+1)/5].map(t=>s[i].map((v,k)=>v+(b[k]-v)*t)))));
    assert.ok(fragments.length>64&&fragments.length<=128);
    assert.equal((await model.recognize(fragments))[0].char,'強');
    assert.deepEqual(await model.recognize([]),[]);
  }finally{await model.dispose();}
});

test('model download errors are recoverable and surfaced to the caller',async()=>{
  await assert.rejects(createNeuralRecognizer(allowed,{readAsset:async()=>{throw new Error('offline');},initTimeout:0}),/offline/);
});

test('candidate fusion keeps model evidence, geometric alternatives and unique catalog characters',()=>{
  const neural=['強','弱','弓'].map(char=>({char,score:.3}));
  const geometry=['強','張','弱','引','弘','弓'].map(char=>({char,score:1}));
  assert.deepEqual(combineCandidates(neural,geometry).map(r=>r.char),['強','弱','弓','張','引','弘']);
  assert.deepEqual(combineCandidates([],geometry).map(r=>r.char),geometry.map(r=>r.char));
});

test('fallback works before model readiness and after inference or disposal failure',async()=>{
  const fallback=[{char:'強',score:0}];let errors=0,runs=0;
  const hybrid=createHybridRecognizer({geometric:()=>fallback,onUnavailable:()=>errors++});
  assert.deepEqual(await hybrid.recognize([]),fallback);
  hybrid.setModel({recognize:async()=>{runs++;throw new Error('unsupported');},dispose:async()=>{throw new Error('already disposed');}});
  assert.deepEqual(await hybrid.recognize([]),fallback);
  assert.deepEqual(await hybrid.recognize([]),fallback);
  assert.equal(errors,1);assert.equal(runs,1);
});

test('overlapping requests discard stale results and only process the newest pending drawing',async()=>{
  let finishFirst;const published=[],processed=[];
  const first=new Promise(resolve=>{finishFirst=resolve;});
  const queue=createRecognitionQueue({recognize:async strokes=>{processed.push(strokes);if(strokes==='old')await first;return strokes;},publish:m=>published.push(m),onError:()=>assert.fail('unexpected error')});
  queue.submit({id:1,strokes:'old'});queue.submit({id:2,strokes:'skipped'});queue.submit({id:3,strokes:'latest'});
  finishFirst();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(processed,['old','latest']);assert.deepEqual(published.map(m=>m.id),[3]);
  queue.refresh();await new Promise(resolve=>setImmediate(resolve));assert.equal(published.at(-1).id,3);
});

test('stroke input accepts 128 fragments and still supports undo and clear at the limit',()=>{
  const input=createStrokeInput(),rect={left:0,top:0,width:256,height:256};
  const event=x=>({pointerId:1,button:0,clientX:x,clientY:20,isPrimary:true});
  for(let i=0;i<128;i++){assert.equal(input.start(event(10),rect),true);input.end(event(20),rect);}
  assert.equal(input.start(event(10),rect),false);input.undo();assert.equal(input.start(event(10),rect),true);input.end(event(20),rect);
  input.clear();assert.equal(input.strokes.length,0);
});
