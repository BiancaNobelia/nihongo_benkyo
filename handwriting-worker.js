import {prepareTemplates,recognize} from './handwriting-core.js?v=20261020-handwriting-neural';
import {createHybridRecognizer,createRecognitionQueue} from './handwriting-engine.js?v=20261020-handwriting-neural';

let templates;
const hybrid=createHybridRecognizer({geometric:strokes=>recognize(strokes,templates),onUnavailable:()=>self.postMessage({type:'model',state:'unavailable'})});
const queue=createRecognitionQueue({
  recognize:strokes=>hybrid.recognize(strokes),
  publish:message=>self.postMessage(message),
  onError:id=>self.postMessage({type:'error',id})
});
self.onmessage=({data})=>{
  if(data.type==='recognize'&&templates)queue.submit(data);
};

try {
  const datasets=await Promise.all(['handwriting-templates','handwriting-variants'].map(async name=>{
    const response=await fetch(new URL(`./data/${name}.json?v=20261020-handwriting-accuracy`,import.meta.url));
    if(!response.ok)throw new Error('Template download failed');
    const data=await response.json();
    if(data.version!==1 || !Array.isArray(data.templates) || !data.templates.length)throw new Error('Invalid templates');
    return data.templates;
  }));
  templates=prepareTemplates(datasets.flat());
  self.postMessage({type:'ready',count:new Set(templates.map(t=>t.char)).size});
  // The first search stays usable while the larger optional engine downloads.
  // Loading or inference failure must never disable the geometric fallback.
  self.postMessage({type:'model',state:'loading'});
  try{
    const {createNeuralRecognizer}=await import('./handwriting-neural.js?v=20261020-handwriting-cache');
    let downloading=false;
    const model=await createNeuralRecognizer(new Set(templates.map(t=>t.char)),{onDownload:()=>{
      if(!downloading){downloading=true;self.postMessage({type:'model',state:'downloading'});}
    }});
    hybrid.setModel(model);
    self.postMessage({type:'model',state:'ready',cacheStatus:model.cacheStatus});
    queue.refresh();
  }catch(error){self.postMessage({type:'model',state:'unavailable',reason:String(error.message||error)});}
} catch {
  self.postMessage({type:'error'});
}
