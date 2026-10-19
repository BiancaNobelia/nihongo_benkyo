import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createHandwritingAssetReader} from '../handwriting-cache.js';
import {HANDWRITING_ASSETS} from '../handwriting-assets.js';

const baseUrl='https://example.test/nihongo_benkyo/handwriting-cache.js';
const asset=(path,content)=>({path,sha256:createHash('sha256').update(content).digest('hex')});
const contents={'./model.onnx':'model-v1','./labels.txt':'強弱','./runtime.wasm':'wasm-v1'};
const assets=Object.fromEntries(Object.entries(contents).map(([path,content])=>[path,asset(path,content)]));
function storage(){
  const stores=new Map();
  return {stores,async open(name){
    if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);
    return {async match(key){return entries.get(key)?.clone();},async put(key,response){entries.set(key,response.clone());},
      async delete(key){return entries.delete(typeof key==='string'?key:key.url);},async keys(){return [...entries.keys()].map(url=>({url}));}};
  }};
}
function network(values=contents){
  const calls=[];
  return {calls,fetchAsset:async url=>{
    calls.push(url);const path='./'+new URL(url).pathname.split('/').at(-1);
    return new Response(values[path],{headers:{'Content-Type':'application/octet-stream'}});
  }};
}
const loadAll=reader=>Promise.all(Object.keys(assets).map(path=>reader.read(path,path.endsWith('.txt'))));

test('cache versions match the actual model, labels and 14 MB runtime in the source manifest',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../data/handwriting-neural-source.json',import.meta.url)));
  const files=manifest.assets.flatMap(source=>source.files);
  assert.deepEqual(Object.keys(HANDWRITING_ASSETS),['model','labels','wasm']);
  for(const entry of Object.values(HANDWRITING_ASSETS))assert.equal(entry.sha256,files.find(f=>'./'+f.path===entry.path).sha256);
});

test('a new reader reuses all three persisted assets with zero fetches, even when network is unavailable',async()=>{
  const cacheStorage=storage(),net=network();
  const first=createHandwritingAssetReader({baseUrl,assets,cacheStorage,...net});
  const result=await loadAll(first);
  assert.equal(result[1],'強弱');assert.equal(net.calls.length,3);assert.equal(first.status(),'saved');
  let requests=0;
  const reopened=createHandwritingAssetReader({baseUrl,assets,cacheStorage,fetchAsset:async()=>{requests++;throw new Error('offline');}});
  assert.deepEqual(await loadAll(reopened),result);
  assert.equal(requests,0);assert.equal(reopened.status(),'cached');
});

test('only changed assets download on a version update; old versions are removed after success',async()=>{
  const cacheStorage=storage(),net=network();
  await loadAll(createHandwritingAssetReader({baseUrl,assets,cacheStorage,...net}));
  const cache=await cacheStorage.open('nihongo-benkyo-handwriting:/nihongo_benkyo/:v1');
  await cache.put('https://example.test/unrelated',{clone:()=>new Response('keep')});
  const updated={...contents,'./model.onnx':'model-v2'},versions={...assets,'./model.onnx':asset('./model.onnx','model-v2')};
  const nextNet=network(updated),next=createHandwritingAssetReader({baseUrl,assets:versions,cacheStorage,...nextNet});
  await loadAll(next);assert.equal(nextNet.calls.length,1);assert.match(nextNet.calls[0],/model\.onnx\?sha256=/);
  const keys=(await cache.keys()).map(r=>r.url);
  assert.equal(keys.filter(url=>url.includes('model.onnx')).length,1);
  assert.ok(keys.includes('https://example.test/unrelated'));
  assert.equal(new TextDecoder().decode(await next.read('./model.onnx')),'model-v2');
});

test('failed updates do not evict the previous working version',async()=>{
  const cacheStorage=storage(),net=network();
  await loadAll(createHandwritingAssetReader({baseUrl,assets,cacheStorage,...net}));
  const next=createHandwritingAssetReader({baseUrl,assets:{...assets,'./model.onnx':asset('./model.onnx','new')},cacheStorage,fetchAsset:async()=>new Response('offline',{status:503})});
  await assert.rejects(next.read('./model.onnx'),/unavailable/);
  const old=createHandwritingAssetReader({baseUrl,assets,cacheStorage,fetchAsset:async()=>assert.fail('old version was evicted')});
  await loadAll(old);assert.equal(old.status(),'cached');
});

test('corrupted cached bytes are replaced; incomplete network responses are never cached',async()=>{
  const cacheStorage=storage(),net=network(),reader=createHandwritingAssetReader({baseUrl,assets,cacheStorage,...net});
  await loadAll(reader);
  const cache=await cacheStorage.open('nihongo-benkyo-handwriting:/nihongo_benkyo/:v1');
  const key=(await cache.keys()).find(r=>r.url.includes('model.onnx')).url;
  await cache.put(key,new Response('truncated'));
  const repaired=createHandwritingAssetReader({baseUrl,assets,cacheStorage,...net});await loadAll(repaired);assert.equal(net.calls.length,4);
  const fresh=storage(),bad=createHandwritingAssetReader({baseUrl,assets,cacheStorage:fresh,fetchAsset:async()=>new Response('incomplete')});
  await assert.rejects(bad.read('./model.onnx'),/checksum/);
  assert.equal([...fresh.stores.values()][0].size,0);
});

test('unavailable or full storage still allows recognition, without claiming the model was saved',async()=>{
  for(const cacheStorage of [null,{open:async()=>{throw new Error('denied');}},{open:async()=>({match:async()=>undefined,put:async()=>{throw new Error('quota');}})}]){
    const net=network(),reader=createHandwritingAssetReader({baseUrl,assets,cacheStorage,...net});
    await loadAll(reader);assert.equal(net.calls.length,3);assert.equal(reader.status(),'unavailable');
  }
});

test('concurrent requests for one asset share the download and cache write',async()=>{
  const net=network(),reader=createHandwritingAssetReader({baseUrl,assets,cacheStorage:storage(),...net});
  await Promise.all([reader.read('./model.onnx'),reader.read('./model.onnx')]);
  assert.equal(net.calls.length,1);
  await assert.rejects(reader.read('../other-site/private'),/Unknown/);
  assert.equal(net.calls.length,1);
});

test('cache cleanup is scoped to this project and never removes another project cache',async()=>{
  const cacheStorage=storage(),other=await cacheStorage.open('another-project');
  await other.put('https://example.test/other/model.onnx',new Response('keep'));
  const reader=createHandwritingAssetReader({baseUrl,assets,cacheStorage,...network()});await loadAll(reader);
  assert.equal((await other.match('https://example.test/other/model.onnx')).status,200);
});
