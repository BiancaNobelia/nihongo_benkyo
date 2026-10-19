// Logical coordinates survive resizing/DPR changes. Only one active pointer
// contributes ink; a second finger and right mouse buttons are ignored.
export function createStrokeInput({onChange=()=>{},onPreview=()=>{}}={}) {
  let strokes=[],active=null;
  function point(event,rect) {
    return [Math.max(0,Math.min(256,(event.clientX-rect.left)*256/rect.width)),
      Math.max(0,Math.min(256,(event.clientY-rect.top)*256/rect.height))];
  }
  function start(event,rect) {
    if(active || event.isPrimary===false || event.button>0 || !rect.width || !rect.height || strokes.length>=128)return false;
    active={id:event.pointerId,points:[point(event,rect)]};onPreview();return true;
  }
  function move(event,rect) {
    if(!active || active.id!==event.pointerId)return false;
    const next=point(event,rect),last=active.points.at(-1);
    if(Math.hypot(next[0]-last[0],next[1]-last[1])>=.4){
      // Keep drawing responsive even during a very long pointer drag.
      if(active.points.length>=2048)active.points=active.points.filter((_,i)=>i%2===0);
      active.points.push(next);onPreview();
    }
    return true;
  }
  function end(event,rect) {
    if(!active || active.id!==event.pointerId)return false;
    move(event,rect);strokes.push(active.points);active=null;onChange();return true;
  }
  function cancel(event) {
    if(!active || active.id!==event.pointerId)return false;
    active=null;onPreview();onChange();return true;
  }
  function undo(){active=null;strokes.pop();onChange();}
  function clear(){active=null;strokes=[];onChange();}
  return {start,move,end,cancel,undo,clear,get strokes(){return strokes;},get preview(){return active?[...strokes,active.points]:strokes;},get activeId(){return active?.id;}};
}
