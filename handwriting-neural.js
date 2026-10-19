import * as ort from './vendor/onnxruntime/ort.wasm.min.js';

const SIDE=64;
// The model uses white ink on black. Rasterize the paths rather than the visible
// canvas, so theme, device pixel ratio, pen speed and pen lifts cannot change it.
export function rasterizeWriting(strokes,{aspect=1,width=1.7}={}) {
  if(!Array.isArray(strokes)||strokes.length>128)return null;
  const paths=strokes.filter(Array.isArray).map(s=>s.filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))).filter(s=>s.length);
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,length=0;
  for(const s of paths)for(let i=0;i<s.length;i++){
    const [x,y]=s[i];minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
    if(i)length+=Math.hypot(x-s[i-1][0],y-s[i-1][1]);
  }
  const w=maxX-minX,h=maxY-minY,extent=Math.max(w,h);
  if(!Number.isFinite(extent)||extent<2||length<2)return null;
  // Preserve almost-horizontal/vertical characters such as 一 and 丨.
  const power=Math.min(w,h)/extent<.15?1:aspect;
  const targetW=54*Math.pow(w/extent,power),targetH=54*Math.pow(h/extent,power);
  const sx=targetW/(w||1),sy=targetH/(h||1),pixels=new Float32Array(SIDE*SIDE),radius=width/2;
  const project=([x,y])=>[(x-minX)*sx+(SIDE-targetW)/2,(y-minY)*sy+(SIDE-targetH)/2];
  function segment(a,b){
    const dx=b[0]-a[0],dy=b[1]-a[1],square=dx*dx+dy*dy;
    const x0=Math.max(0,Math.floor(Math.min(a[0],b[0])-radius-1)),x1=Math.min(SIDE-1,Math.ceil(Math.max(a[0],b[0])+radius+1));
    const y0=Math.max(0,Math.floor(Math.min(a[1],b[1])-radius-1)),y1=Math.min(SIDE-1,Math.ceil(Math.max(a[1],b[1])+radius+1));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const t=square?Math.max(0,Math.min(1,((x+.5-a[0])*dx+(y+.5-a[1])*dy)/square)):0;
      const distance=Math.hypot(x+.5-a[0]-t*dx,y+.5-a[1]-t*dy);
      pixels[y*SIDE+x]=Math.max(pixels[y*SIDE+x],Math.max(0,Math.min(1,radius+.5-distance)));
    }
  }
  for(const path of paths){
    const points=path.map(project);
    if(points.length===1)segment(points[0],points[0]);
    for(let i=1;i<points.length;i++)segment(points[i-1],points[i]);
  }
  return pixels;
}

// These JIS glyph variants are the same characters used by the catalog.
const CATALOG_VARIANTS={'剥':'剝','填':'塡','頬':'頰','叱':'𠮟'};
export function rankPredictions(probabilities,labels,allowed,limit=30){
  if(probabilities.length!==labels.length*2)throw new Error('Invalid model output');
  const best=new Map();
  for(let i=0;i<labels.length;i++){
    const original=labels[i],char=allowed.has(original)?original:CATALOG_VARIANTS[original];
    if(!allowed.has(char))continue;
    const score=(probabilities[i]+probabilities[i+labels.length])/2;
    if(!Number.isFinite(score))throw new Error('Invalid prediction');
    // Quantized softmax can round most classes to zero. They provide no
    // evidence: let the geometric matcher fill those slots instead of showing
    // unrelated characters merely because their Unicode values sort first.
    if(score>0)best.set(char,Math.max(best.get(char)||0,score));
  }
  return [...best].map(([char,score])=>({char,score})).sort((a,b)=>b.score-a.score||a.char.codePointAt(0)-b.char.codePointAt(0)).slice(0,limit);
}

export async function createNeuralRecognizer(allowed,{readAsset,initTimeout=60000}={}){
  const read=readAsset||async function(path,text=false){
    const response=await fetch(new URL(path,import.meta.url),{signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error('Recognition asset unavailable');
    return text?response.text():new Uint8Array(await response.arrayBuffer());
  };
  ort.env.wasm.numThreads=1; // GitHub Pages does not require cross-origin isolation.
  ort.env.wasm.proxy=false; // Already inside our own worker.
  ort.env.wasm.initTimeout=initTimeout;
  // Keep upstream bytes but serve ES modules with .js: some static servers on
  // Windows incorrectly serve .mjs as text/plain, which browsers refuse to load.
  ort.env.wasm.wasmPaths={mjs:new URL('./vendor/onnxruntime/ort-wasm-simd-threaded.js',import.meta.url).href,
    wasm:new URL('./vendor/onnxruntime/ort-wasm-simd-threaded.wasm',import.meta.url).href};
  const [model,text]=await Promise.all([read('./data/handwriting/dakanji-v2.onnx'),read('./data/handwriting/dakanji-v2-labels.txt',true)]);
  const labels=Array.from(text.trim());
  if(labels.length!==6507||new Set(labels).size!==labels.length)throw new Error('Invalid recognition labels');
  const session=await ort.InferenceSession.create(model,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  return {
    async recognize(strokes){
      const normal=rasterizeWriting(strokes);
      if(!normal)return [];
      // Average the original proportions and a slightly wider/thicker rendering.
      // The second view tolerates cramped components and tiny gaps without
      // inventing connections between separate strokes in the user's drawing.
      const relaxed=rasterizeWriting(strokes,{aspect:.5,width:2.1});
      const values=new Float32Array(SIDE*SIDE*2);values.set(normal);values.set(relaxed,SIDE*SIDE);
      const tensor=new ort.Tensor('float32',values,[2,1,SIDE,SIDE]);
      let outputs;
      try{outputs=await session.run({image:tensor});return rankPredictions(outputs.probs.data,labels,allowed);}
      finally{tensor.dispose();if(outputs)for(const output of Object.values(outputs))output.dispose();}
    },
    dispose:()=>session.release()
  };
}
