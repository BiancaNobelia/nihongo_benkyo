// Deliberate distortions of evaluation drawings, never recognition templates.
export function handwritingVariations(original){
  const interpolate=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  return {
    normal:original,
    wide:original.map(s=>s.map(([x,y])=>[x*1.5,y])),
    narrow:original.map(s=>s.map(([x,y])=>[x*.65,y])),
    split:original.flatMap(s=>s.slice(1).map((p,i)=>[s[i],p])),
    uneven:original.map((s,n)=>s.map(([x,y],i)=>[x+Math.sin(i+n)*2,y+Math.cos(i-n)*3])),
    // Actual missing ink, not just pen lifts at the same location: remove 16%
    // from the middle of every segment, keeping the endpoints unchanged.
    gaps:original.flatMap(s=>s.length===1?[s]:s.slice(1).flatMap((b,i)=>[[s[i],interpolate(s[i],b,.42)],[interpolate(s[i],b,.58),b]])),
    // Dense, uneven mouse samples with small hand tremors along every segment.
    shaky:original.map((s,n)=>s.length===1?s:s.slice(1).flatMap((b,i)=>Array.from({length:7},(_,j)=>{
      const [x,y]=interpolate(s[i],b,j/6);
      return [x+Math.sin(j*2+n+i)*1.8,y+Math.cos(j*2+n-i)*1.8];
    })))
  };
}
