import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {KANJI} from '../kanji-data.js';
import {createStrokePlayer} from '../stroke-order-player.js';
import {strokeOrderMarkup,loadStrokeOrders} from '../stroke-order-view.js';

const raw=readFileSync(new URL('../data/stroke-order.json',import.meta.url));
const data=JSON.parse(raw);

test('all and only N5/N4 characters have complete, pinned SVG stroke paths',()=>{
  const source=JSON.parse(readFileSync(new URL('../data/stroke-order-source.json',import.meta.url)));
  const pinned=JSON.parse(readFileSync(new URL('../data/radical-source.json',import.meta.url)));
  const selected=KANJI.filter(k=>['N5','N4'].includes(k.level));
  assert.equal(source.sourceSha256,pinned.sha256);
  assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256);
  assert.deepEqual(source.levels,{N5:84,N4:169});
  assert.equal(source.count,253);
  assert.equal(data.license,'CC-BY-SA-3.0');
  assert.equal(data.viewBox,'0 0 109 109');
  assert.deepEqual(Object.keys(data.characters).sort(),selected.map(k=>k.char).sort());
  for(const k of selected){
    const paths=data.characters[k.char];
    assert.equal(paths.length,k.strokes,k.char);
    for(const d of paths){
      assert.match(d,/^[Mm]\s*[-+\d.]+[ ,]+\s*[-+\d.]+/);
      assert.match(d,/^[MmCcSs0-9.,\s+\-]+$/);
    }
    assert.match(strokeOrderMarkup(k),/Urutan goresan/);
  }
  for(const k of KANJI.filter(k=>!selected.includes(k)))assert.equal(strokeOrderMarkup(k),'');
});

function setup(count=4){
  const pending=new Map(),changes=[];let id=0;
  const player=createStrokePlayer(count,{onChange:s=>changes.push(s),
    schedule:callback=>{pending.set(++id,callback);return id;},cancel:key=>pending.delete(key)});
  const tick=()=>{const [key,callback]=pending.entries().next().value;pending.delete(key);callback();};
  return {player,pending,changes,tick};
}

test('playback advances in order once, finishes, and can replay from stroke one',()=>{
  const {player,pending,changes,tick}=setup(3);
  player.play();player.play();assert.equal(pending.size,1);
  tick();tick();tick();
  assert.deepEqual(changes.map(s=>[s.current,s.playing]),[[1,true],[2,true],[3,true],[3,false]]);
  assert.equal(pending.size,0);
  player.play();assert.equal(player.snapshot().current,1);
  player.dispose();
});

test('pause, manual stepping, bounds and reset cancel automatic advancement',()=>{
  const {player,pending,tick}=setup();
  player.play();tick();player.pause();
  assert.deepEqual(player.snapshot(),{current:2,count:4,playing:false});
  assert.equal(pending.size,0);
  player.play();player.select(3);
  assert.equal(pending.size,0);assert.equal(player.snapshot().current,3);
  player.select(999);assert.equal(player.snapshot().current,4);
  player.select(-1);assert.equal(player.snapshot().current,1);
  player.select(NaN);assert.equal(player.snapshot().current,1);
  player.play();player.reset();assert.equal(pending.size,0);
  assert.deepEqual(player.snapshot(),{current:1,count:4,playing:false});
});

test('closing or replacing a dialog prevents stale timers and callbacks',()=>{
  const {player,pending,changes}=setup();
  player.play();const stale=[...pending.values()][0];
  player.dispose();stale();player.play();player.select(3);player.reset();
  assert.equal(pending.size,0);assert.equal(changes.length,1);
});

test('a one-stroke character completes without exceeding its stroke count',()=>{
  const {player,tick,pending}=setup(1);
  player.play();tick();
  assert.deepEqual(player.snapshot(),{current:1,count:1,playing:false});
  assert.equal(pending.size,0);
  assert.throws(()=>createStrokePlayer(0),/Invalid/);
});

test('lazy data loading retries after failure and reuses the successful download',async()=>{
  let requests=0;
  await assert.rejects(loadStrokeOrders(async()=>{requests++;return new Response('',{status:503});}),/unavailable/);
  const fetcher=async()=>{requests++;return new Response(raw);};
  const [one,two]=await Promise.all([loadStrokeOrders(fetcher),loadStrokeOrders(fetcher)]);
  assert.equal(one,two);assert.equal(requests,2);
  assert.equal(await loadStrokeOrders(()=>assert.fail('download repeated')),one);
});
