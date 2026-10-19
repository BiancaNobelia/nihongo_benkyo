// Shape matching is independent of stroke order and direction. Templates come
// from KanjiVG; the symmetric distance also penalizes missing/extra ink.
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

function shape(strokes) {
  const valid=strokes.filter(stroke=>Array.isArray(stroke)&&stroke.length).map(stroke=>stroke.filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)));
  const all=valid.flat();
  if(!all.length)return null;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const [x,y] of all){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  const width=maxX-minX,height=maxY-minY,extent=Math.max(width,height);
  if(extent<2)return null;
  const scale=(SIZE-5)/extent;
  const project=([x,y])=>[(x-(minX+maxX)/2)*scale+(SIZE-1)/2,(y-(minY+maxY)/2)*scale+(SIZE-1)/2];
  const ink=new Set();
  const mark=([x,y])=>ink.add(Math.max(0,Math.min(SIZE-1,Math.round(y)))*SIZE+Math.max(0,Math.min(SIZE-1,Math.round(x))));
  for(const stroke of valid){
    if(!stroke.length)continue;
    let previous=project(stroke[0]);mark(previous);
    for(const point of stroke.slice(1)){
      const next=project(point),steps=Math.max(1,Math.ceil(Math.hypot(next[0]-previous[0],next[1]-previous[1])*2));
      for(let n=1;n<=steps;n++)mark([previous[0]+(next[0]-previous[0])*n/steps,previous[1]+(next[1]-previous[1])*n/steps]);
      previous=next;
    }
  }
  const pixels=Uint16Array.from(ink),distance=new Float32Array(SIZE*SIZE).fill(100);
  for(const p of pixels)distance[p]=0;
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
  return {pixels,distance,count:valid.filter(s=>s.length).length,aspect:width/(width+height),
    strokes:valid.filter(s=>s.length).map(stroke=>sampleStroke(stroke.map(project)))};
}

export function prepareTemplates(rows) {
  return rows.map(row=>{const decoded=decodeTemplate(row);return {char:decoded.char,...shape(decoded.strokes)};});
}

export function recognize(strokes,templates,limit=20) {
  if(!Array.isArray(strokes)||strokes.length>64)return [];
  const input=shape(strokes);
  if(!input)return [];
  const results=templates.map(candidate=>{
    let forward=0,backward=0;
    for(const p of input.pixels)forward+=candidate.distance[p];
    for(const p of candidate.pixels)backward+=input.distance[p];
    const geometry=(forward/input.pixels.length+backward/candidate.pixels.length)/2;
    const countPenalty=.35*Math.abs(input.count-candidate.count);
    return {candidate,score:geometry+countPenalty+Math.abs(input.aspect-candidate.aspect)*1.5};
  });
  return results.sort((a,b)=>a.score-b.score).slice(0,80)
    .map(({candidate,score})=>({char:candidate.char,score:score*.7+strokeDistance(input.strokes,candidate.strokes)*.3}))
    .sort((a,b)=>a.score-b.score||a.char.codePointAt(0)-b.char.codePointAt(0)).slice(0,Math.max(0,Math.min(50,limit)));
}
