// Direction-aware shape matching. Pen lifts, stroke order and drawing direction
// do not change the ink features, so a broken or joined stroke remains searchable.
const SIZE=32, SQRT2=Math.SQRT2;

function sampleStroke(points,count=12) {
  const lengths=[0];
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  let j=1;
  return Array.from({length:count},(_,i)=>{
    if(points.length===1)return points[0];
    const position=lengths.at(-1)*i/(count-1);
    while(j<points.length-1&&lengths[j]<position)j++;
    const ratio=(position-lengths[j-1])/(lengths[j]-lengths[j-1]||1);
    return [0,1].map(axis=>points[j-1][axis]+ratio*(points[j][axis]-points[j-1][axis]));
  });
}

// Minimum-cost stroke assignment, with no reliance on drawing order. Reversing
// a stroke is allowed; unmatched strokes receive a soft cost rather than exclusion.
function strokeDistance(a,b) {
  const n=Math.max(a.length,b.length),cost=[];
  for(let i=0;i<n;i++){
    cost[i]=[];
    for(let j=0;j<n;j++){
      if(!a[i]||!b[j]){cost[i][j]=7;continue;}
      let forward=0,reverse=0;
      for(let k=0;k<12;k++){
        forward+=Math.hypot(a[i][k][0]-b[j][k][0],a[i][k][1]-b[j][k][1]);
        reverse+=Math.hypot(a[i][k][0]-b[j][11-k][0],a[i][k][1]-b[j][11-k][1]);
      }
      cost[i][j]=Math.min(forward,reverse)/12;
    }
  }
  const u=new Float64Array(n+1),v=new Float64Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);
  for(let i=1;i<=n;i++){
    p[0]=i;
    let column=0;
    const min=new Float64Array(n+1).fill(Infinity),used=new Uint8Array(n+1);
    do {
      used[column]=1;
      const row=p[column];let delta=Infinity,next=0;
      for(let j=1;j<=n;j++)if(!used[j]){
        const current=cost[row-1][j-1]-u[row]-v[j];
        if(current<min[j]){min[j]=current;way[j]=column;}
        if(min[j]<delta){delta=min[j];next=j;}
      }
      for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;
      column=next;
    }while(p[column]);
    do {const previous=way[column];p[column]=p[previous];column=previous;}while(column);
  }
  return -v[0]/n;
}

export function decodeTemplate(row) {
  return {char:row[0],strokes:row.slice(1).map(encoded=>{
    const bytes=atob(encoded),points=[];
    for(let i=0;i<bytes.length;i+=2)points.push([bytes.charCodeAt(i),bytes.charCodeAt(i+1)]);
    return points;
  })};
}

function shape(strokes,free=false) {
  const valid=strokes.filter(stroke=>Array.isArray(stroke)&&stroke.length).map(stroke=>stroke.filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)));
  const all=valid.flat();
  if(!all.length)return null;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const [x,y] of all){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  const width=maxX-minX,height=maxY-minY,extent=Math.max(width,height);
  const length=valid.reduce((total,s)=>total+s.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-s[i][0],p[1]-s[i][1]),0),0);
  if(extent<2||length<2)return null;
  // Relax aspect ratio for naturally narrow/wide handwriting, but keep essentially
  // horizontal/vertical characters thin (do not stretch a wobbly 一 into a square).
  const ratio=Math.min(width,height)/extent;
  const relaxed=!free||ratio<.15?ratio:Math.pow(ratio,.45);
  const sx=(SIZE-5)*(width<height?relaxed:1)/(width||1),sy=(SIZE-5)*(height<width?relaxed:1)/(height||1);
  const project=([x,y])=>[(x-(minX+maxX)/2)*sx+(SIZE-1)/2,(y-(minY+maxY)/2)*sy+(SIZE-1)/2];
  const ink=new Set();
  const oriented=new Set();
  const mark=([x,y],angle)=>{
    const p=Math.max(0,Math.min(SIZE-1,Math.round(y)))*SIZE+Math.max(0,Math.min(SIZE-1,Math.round(x)));
    ink.add(p);
    if(free&&angle!==undefined){
      const bin=Math.round(angle*4/Math.PI+4)%4;
      oriented.add(p*4+bin);
    }
  };
  for(const stroke of valid){
    if(!stroke.length)continue;
    let previous=project(stroke[0]);mark(previous);
    if(stroke.length===1)for(let bin=0;bin<4;bin++)mark(previous,bin*Math.PI/4);
    for(const point of stroke.slice(1)){
      const next=project(point),steps=Math.max(1,Math.ceil(Math.hypot(next[0]-previous[0],next[1]-previous[1])*2));
      const angle=Math.atan2(next[1]-previous[1],next[0]-previous[0]);
      if(Math.hypot(next[0]-previous[0],next[1]-previous[1])>.01)
        for(let n=0;n<=steps;n++)mark([previous[0]+(next[0]-previous[0])*n/steps,previous[1]+(next[1]-previous[1])*n/steps],angle);
      previous=next;
    }
  }
  const pixels=Uint16Array.from(ink),distance=distanceField(Array.from(pixels,p=>[p,0]));
  const directions=free?Array.from({length:4},(_,bin)=>distanceField(Array.from(oriented,code=>{
    const delta=Math.abs(bin-(code&3));return [code>>>2,Math.min(delta,4-delta)*2];
  }))):null;
  return {pixels,distance,directions,oriented:free?Uint16Array.from(oriented):null,count:valid.filter(s=>s.length).length,aspect:width/(width+height),
    strokes:free?null:valid.filter(s=>s.length).map(stroke=>sampleStroke(stroke.map(project)))};
}

function distanceField(seeds){
  const distance=new Float32Array(SIZE*SIZE).fill(100);
  for(const [p,d] of seeds)distance[p]=Math.min(distance[p],d);
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const p=y*SIZE+x;
    if(x)distance[p]=Math.min(distance[p],distance[p-1]+1);
    if(y)distance[p]=Math.min(distance[p],distance[p-SIZE]+1);
    if(x&&y)distance[p]=Math.min(distance[p],distance[p-SIZE-1]+SQRT2);
    if(y&&x<SIZE-1)distance[p]=Math.min(distance[p],distance[p-SIZE+1]+SQRT2);
  }
  for(let y=SIZE-1;y>=0;y--)for(let x=SIZE-1;x>=0;x--){
    const p=y*SIZE+x;
    if(x<SIZE-1)distance[p]=Math.min(distance[p],distance[p+1]+1);
    if(y<SIZE-1)distance[p]=Math.min(distance[p],distance[p+SIZE]+1);
    if(x<SIZE-1&&y<SIZE-1)distance[p]=Math.min(distance[p],distance[p+SIZE+1]+SQRT2);
    if(x&&y<SIZE-1)distance[p]=Math.min(distance[p],distance[p+SIZE-1]+SQRT2);
  }
  return distance;
}

export function prepareTemplates(rows) {
  return rows.map(row=>{const decoded=decodeTemplate(row);return {char:decoded.char,...shape(decoded.strokes),free:shape(decoded.strokes,true)};});
}

export function recognize(strokes,templates,limit=20) {
  if(!Array.isArray(strokes)||strokes.length>64)return [];
  const input=shape(strokes),free=shape(strokes,true);
  if(!input)return [];
  const strokeResults=templates.map(candidate=>{
    let forward=0,backward=0;
    for(const p of input.pixels)forward+=candidate.distance[p];
    for(const p of candidate.pixels)backward+=input.distance[p];
    const geometry=(forward/input.pixels.length+backward/candidate.pixels.length)/2;
    return {candidate,score:geometry+.35*Math.abs(input.count-candidate.count)+Math.abs(input.aspect-candidate.aspect)*1.5};
  }).sort((a,b)=>a.score-b.score).slice(0,160)
    .map(({candidate,score})=>({char:candidate.char,score:score*.7+strokeDistance(input.strokes,candidate.strokes)*.3}));
  const freeResults=templates.map(({char,free:candidate})=>{
    let forward=0,backward=0;
    for(const p of free.pixels)forward+=candidate.distance[p];
    for(const p of candidate.pixels)backward+=free.distance[p];
    const geometry=(forward/free.pixels.length+backward/candidate.pixels.length)/2;
    let directionsForward=0,directionsBackward=0;
    for(const code of free.oriented)directionsForward+=candidate.directions[code&3][code>>>2];
    for(const code of candidate.oriented)directionsBackward+=free.directions[code&3][code>>>2];
    const directional=(directionsForward/free.oriented.length+directionsBackward/candidate.oriented.length)/2;
    return {char,count:candidate.count,score:geometry*.35+directional*.65};
  });
  // Each model has different score units. Balanced rank fusion preserves the best
  // evidence from both instead of letting a wrong pen-lift count eliminate a kanji.
  // Deduplicate variants before fusion so a character with two templates does not
  // consume two places or receive an unfair vote advantage.
  const best=results=>{
    const sorted=results.sort((a,b)=>a.score-b.score||a.char.codePointAt(0)-b.char.codePointAt(0)),seen=new Set();
    return sorted.filter(r=>{if(seen.has(r.char))return false;seen.add(r.char);return true;});
  };
  const strokeRank=best(strokeResults),shapeRank=best(freeResults),results=[],seen=new Set();
  // A large count difference in the best shape match is evidence of split/joined
  // pen strokes. In that case give shape evidence the first slot, not the model
  // whose stroke-count penalty would reject the user's drawing.
  const preferShape=shapeRank.length>0&&Math.abs(input.count-shapeRank[0].count)>2;
  const max=Math.max(0,Math.min(50,limit));
  for(let i=0;results.length<max&&(i<strokeRank.length||i<shapeRank.length);i++){
    for(const candidate of preferShape?[shapeRank[i],strokeRank[i]]:[strokeRank[i],shapeRank[i]]){
      if(candidate&&!seen.has(candidate.char)&&results.length<max){
        seen.add(candidate.char);results.push({char:candidate.char,score:results.length});
      }
    }
  }
  return results;
}
