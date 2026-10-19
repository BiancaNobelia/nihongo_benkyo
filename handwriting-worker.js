import {prepareTemplates,recognize} from './handwriting-core.js?v=20261020-handwriting-accuracy';

let templates;
self.onmessage=({data})=>{
  if(data.type==='recognize' && templates){
    try {self.postMessage({type:'results',id:data.id,results:recognize(data.strokes,templates)});}
    catch {self.postMessage({type:'error',id:data.id});}
  }
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
} catch {
  self.postMessage({type:'error'});
}
