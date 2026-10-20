// A bounded player: only one timer, never loops automatically, and can be
// disposed when its dialog closes or another character replaces it.
export function createStrokePlayer(count,{onChange,schedule=setTimeout,cancel=clearTimeout,stepMs=1100}={}) {
  if(!Number.isInteger(count)||count<1)throw new Error('Invalid stroke count');
  let current=1,playing=false,timer=null,disposed=false;
  const snapshot=()=>({current,count,playing});
  const emit=animate=>{if(!disposed)onChange({...snapshot(),animate});};
  function clear(){if(timer!==null)cancel(timer);timer=null;}
  function tick(){
    timer=null;
    if(disposed||!playing)return;
    if(current===count){playing=false;emit(false);return;}
    current++;emit(true);timer=schedule(tick,stepMs);
  }
  return {
    snapshot,
    select(n){
      if(disposed||!Number.isFinite(n))return;
      clear();playing=false;current=Math.max(1,Math.min(count,Math.trunc(n)));emit(true);
    },
    play(){
      if(disposed||playing)return;
      if(current===count)current=1;
      playing=true;emit(true);timer=schedule(tick,stepMs);
    },
    pause(){if(disposed)return;clear();playing=false;emit(false);},
    reset(){if(disposed)return;clear();playing=false;current=1;emit(false);},
    dispose(){disposed=true;playing=false;clear();},
  };
}
