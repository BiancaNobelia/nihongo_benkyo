import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {KANJI} from '../kanji-data.js';
import {decodeTemplate,prepareTemplates,recognize} from '../handwriting-core.js';
import {createStrokeInput} from '../handwriting-input.js';

const raw=readFileSync(new URL('../data/handwriting-templates.json',import.meta.url));
const data=JSON.parse(raw),templates=prepareTemplates(data.templates);
// Independently drawn simplified shapes; not copied from the source templates.
const drawings={
  一:[[[15,50],[85,50]]],
  十:[[[15,45],[85,45]],[[50,15],[50,85]]],
  木:[[[15,40],[85,40]],[[50,12],[50,88]],[[48,42],[32,65],[12,80]],[[51,43],[67,67],[89,81]]],
  人:[[[55,15],[48,44],[32,69],[15,85]],[[50,40],[65,65],[85,85]]],
  口:[[[22,20],[22,82]],[[23,21],[80,21],[80,82]],[[22,81],[80,81]]],
  日:[[[25,15],[25,85]],[[25,15],[76,15],[76,85]],[[26,50],[75,50]],[[25,84],[75,84]]],
  水:[[[50,10],[50,86],[43,82]],[[14,42],[37,41],[30,60],[13,77]],[[81,27],[63,45]],[[55,44],[69,64],[88,79]]],
  大:[[[15,40],[85,40]],[[50,10],[48,45],[35,70],[15,88]],[[51,45],[68,72],[88,88]]],
  山:[[[50,12],[50,85]],[[15,40],[15,85],[85,85]],[[85,40],[85,85]]],
  田:[[[15,15],[15,85]],[[15,15],[85,15],[85,85]],[[15,50],[85,50]],[[50,15],[50,85]],[[15,85],[85,85]]],
};

test('pinned handwriting geometry covers every catalog kanji, with no missing or duplicate records',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../data/handwriting-source.json',import.meta.url)));
  const source=JSON.parse(readFileSync(new URL('../data/radical-source.json',import.meta.url)));
  assert.equal(createHash('sha256').update(raw).digest('hex'),manifest.sha256);
  assert.equal(manifest.sourceSha256,source.sha256);
  assert.equal(data.license,'CC-BY-SA-3.0');
  assert.equal(manifest.count,KANJI.length);
  assert.deepEqual(new Set(data.templates.map(row=>row[0])),new Set(KANJI.map(k=>k.char)));
  assert.equal(data.templates.length,KANJI.length);
  for(const row of data.templates){
    const decoded=decodeTemplate(row);
    assert.ok(decoded.strokes.length>0&&decoded.strokes.length<=64);
    for(const stroke of decoded.strokes){assert.equal(stroke.length,12);assert.ok(stroke.flat().every(n=>Number.isInteger(n)&&n>=0&&n<=255));}
  }
});

test('hand-drawn shapes find their intended kanji among the first five candidates',()=>{
  for(const [char,strokes] of Object.entries(drawings)){
    const result=recognize(strokes,templates);
    assert.ok(result.slice(0,5).some(r=>r.char===char),`${char}: ${result.map(r=>r.char).join('')}`);
    assert.equal(result.length,20);
    assert.equal(new Set(result.map(r=>r.char)).size,20);
  }
});

test('candidate ranking survives translation, scaling, stroke reordering and reversed drawing direction',()=>{
  for(const strokes of Object.values(drawings)){
    const initial=recognize(strokes,templates).slice(0,5).map(r=>r.char);
    const transformed=strokes.toReversed().map(s=>s.toReversed().map(([x,y])=>[x*2+45,y*2+20]));
    assert.deepEqual(recognize(transformed,templates).slice(0,5).map(r=>r.char),initial);
  }
});

test('geometry from every level still matches after small independent handwriting distortion',()=>{
  for(const level of ['N5','N4','N3','N2','N1']){
    const cards=KANJI.filter(k=>k.level===level);
    for(let i=0;i<cards.length;i+=Math.ceil(cards.length/8)){
      const char=cards[i].char;
      const original=decodeTemplate(data.templates.find(row=>row[0]===char));
      const distorted=original.strokes.map((s,n)=>s.map(([x,y],j)=>[x*.9+y*.04+Math.sin(j+n)*2+17,y*1.05+Math.cos(j-n)*2+8]));
      assert.ok(recognize(distorted,templates).slice(0,5).some(r=>r.char===char),char);
    }
  }
});

test('a split stroke remains searchable, and empty or accidental taps do not produce arbitrary matches',()=>{
  const split=[[[22,20],[22,82]],[[23,21],[80,21]],[[80,21],[80,82]],[[22,81],[80,81]]];
  assert.ok(recognize(split,templates).some(r=>r.char==='口'));
  for(const invalid of [[],[[]],[[[5,5]]],[[[NaN,4],[Infinity,8]]],null])assert.deepEqual(recognize(invalid,templates),[]);
});

const rect={left:10,top:20,width:256,height:256};
const event=(x,y,extra={})=>({clientX:x+10,clientY:y+20,pointerId:1,isPrimary:true,button:0,pointerType:'mouse',...extra});
test('mouse, touch and stylus share capture coordinates; a second finger and non-primary buttons cannot add ink',()=>{
  for(const pointerType of ['mouse','touch','pen']){
    let commits=0;const input=createStrokeInput({onChange:()=>commits++});
    assert.equal(input.start(event(10,20,{pointerType}),rect),true);
    assert.equal(input.start(event(15,25,{pointerId:2,isPrimary:false,pointerType:'touch'}),rect),false);
    assert.equal(input.move(event(20,30,{pointerId:2}),rect),false);
    input.move(event(20,40,{pointerType}),rect);input.end(event(30,60,{pointerType}),rect);
    assert.deepEqual(input.strokes,[[[10,20],[20,40],[30,60]]]);assert.equal(commits,1);
    assert.equal(input.activeId,undefined);
    assert.equal(input.start(event(10,20,{button:2}),rect),false);
  }
});

test('undo, clear, pointer cancellation and resized bounds never connect separate strokes or leave partial ink',()=>{
  const input=createStrokeInput();
  input.start(event(0,0),rect);input.end(event(256,256),rect);
  input.start(event(5,5),rect);input.move(event(6,9),rect);input.cancel(event(6,9));
  assert.equal(input.strokes.length,1);assert.equal(input.preview.length,1);
  input.start(event(50,50),{...rect,width:128,height:128});input.end(event(100,100),{...rect,width:128,height:128});
  assert.deepEqual(input.strokes[1],[[100,100],[200,200]]);
  input.undo();assert.equal(input.strokes.length,1);
  input.clear();assert.deepEqual(input.strokes,[]);assert.equal(input.activeId,undefined);
  assert.equal(input.end(event(50,50),rect),false);
});
