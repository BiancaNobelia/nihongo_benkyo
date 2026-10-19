// Keep the neural model's strongest candidates; reserve places for the geometric
// matcher so an unusual form can still be found. Scores have different units.
export function combineCandidates(neural,geometric,limit=20){
  const order=[...neural.slice(0,8),...geometric.slice(0,4),...neural.slice(8),...geometric];
  const seen=new Set();
  return order.filter(r=>{if(seen.has(r.char))return false;seen.add(r.char);return true;}).slice(0,limit).map((r,i)=>({char:r.char,score:i}));
}

export function createHybridRecognizer({geometric,onUnavailable}){
  let model=null;
  return {
    setModel(value){model=value;},
    async recognize(strokes){
      const fallback=geometric(strokes);
      if(!model)return fallback;
      try{return combineCandidates(await model.recognize(strokes),fallback);}
      catch{
        const broken=model;model=null;
        try{await broken.dispose();}catch{/* The fallback remains usable. */}
        onUnavailable();return fallback;
      }
    }
  };
}

// A model inference yields to new messages. Keep only the newest drawing and
// never let an older inference overwrite its results or build a long queue.
export function createRecognitionQueue({recognize,publish,onError}){
  let latest=null,pending=null,running=false;
  async function drain(){
    if(running)return;
    running=true;
    try{
      while(pending){
        const task=pending;pending=null;
        try{const results=await recognize(task.strokes);if(task===latest)publish({type:'results',id:task.id,results});}
        catch{if(task===latest)onError(task.id);}
      }
    }finally{running=false;}
  }
  return {submit(task){latest=task;pending=task;void drain();},refresh(){if(latest){pending=latest;void drain();}}};
}
