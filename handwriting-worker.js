import {prepareTemplates,recognize} from './handwriting-core.js?v=20261020-handwriting';

let templates;
self.onmessage=({data})=>{
  if(data.type==='recognize' && templates){
    try {self.postMessage({type:'results',id:data.id,results:recognize(data.strokes,templates)});}
    catch {self.postMessage({type:'error',id:data.id});}
  }
};

try {
  const response=await fetch(new URL('./data/handwriting-templates.json?v=20261020-handwriting',import.meta.url));
  if(!response.ok)throw new Error('Template download failed');
  const data=await response.json();
  if(data.version!==1 || !Array.isArray(data.templates) || !data.templates.length)throw new Error('Invalid templates');
  templates=prepareTemplates(data.templates);
  self.postMessage({type:'ready',count:templates.length});
} catch {
  self.postMessage({type:'error'});
}
