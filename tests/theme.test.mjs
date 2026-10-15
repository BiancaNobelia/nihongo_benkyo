import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const script=readFileSync(new URL('../theme.js',import.meta.url),'utf8');
const key='nihongo-benkyo-theme-v1';
function mount({stored=null,dark=false,blocked=false}={}) {
  const storage=new Map(stored===null?[]:[[key,stored]]),events={},windowEvents={},root={dataset:{}},meta={};
  const buttons=['light','dark'].map(theme=>({dataset:{themeChoice:theme},attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this[k]=fn;}}));
  const system={matches:dark,addEventListener(k,fn){this[k]=fn;}};
  const document={documentElement:root,querySelector:()=>({setAttribute(k,v){meta[k]=v;}}),querySelectorAll:()=>buttons,addEventListener(k,fn){events[k]=fn;}};
  vm.runInNewContext(script,{document,window:{matchMedia:()=>system,addEventListener(k,fn){windowEvents[k]=fn;}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');storage.set(k,v);}}});
  return {root,meta,buttons,storage,system,events,windowEvents};
}

test('theme follows device preference before DOM readiness and tracks system changes until explicitly chosen',()=>{
  const page=mount({dark:true});
  assert.equal(page.root.dataset.theme,'dark');
  assert.equal(page.meta.content,'#101222');
  page.system.matches=false;page.system.change();
  assert.equal(page.root.dataset.theme,'light');
});

test('saved choice overrides device preference and survives reload',()=>{
  const page=mount({stored:'light',dark:true});page.events.DOMContentLoaded();
  assert.equal(page.root.dataset.theme,'light');
  page.buttons[1].click();
  assert.equal(page.root.dataset.theme,'dark');
  assert.equal(page.buttons[1].attributes['aria-pressed'],'true');
  assert.equal(page.buttons[0].attributes['aria-pressed'],'false');
  assert.equal(page.storage.get(key),'dark');
  page.system.matches=false;page.system.change();
  assert.equal(page.root.dataset.theme,'dark');
  assert.equal(mount({stored:page.storage.get(key)}).root.dataset.theme,'dark');
});

test('both theme buttons work when storage is blocked',()=>{
  const page=mount({blocked:true});page.events.DOMContentLoaded();
  assert.doesNotThrow(()=>page.buttons[1].click());
  assert.equal(page.root.dataset.theme,'dark');
  page.buttons[0].click();
  assert.equal(page.root.dataset.theme,'light');
});

test('invalid saved values fall back to the device and unrelated storage events have no effect',()=>{
  const page=mount({stored:'invalid',dark:true});page.events.DOMContentLoaded();
  assert.equal(page.root.dataset.theme,'dark');
  page.windowEvents.storage({key:'nihongo-benkyo-progress-v1',newValue:'light'});
  assert.equal(page.root.dataset.theme,'dark');
  page.windowEvents.storage({key,newValue:'light'});
  assert.equal(page.root.dataset.theme,'light');
  page.windowEvents.storage({key,newValue:null});
  assert.equal(page.root.dataset.theme,'dark');
});
