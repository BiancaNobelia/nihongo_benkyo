import {HANDWRITING_ASSETS} from './handwriting-assets.js?v=20261020-handwriting-cache';

const sha256=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');

// Cache Storage survives closing the tab/browser, unlike an in-memory model.
// Cache only these assets; no service worker intercepts the rest of the site.
export function createHandwritingAssetReader({baseUrl=import.meta.url,assets=HANDWRITING_ASSETS,cacheStorage,
  fetchAsset=(url,options)=>fetch(url,options),onDownload=()=>{}}={}){
  const root=new URL('.',baseUrl),name=`nihongo-benkyo-handwriting:${root.pathname}:v1`;
  const definitions=new Map(Object.values(assets).map(asset=>[new URL(asset.path,root).href,asset]));
  const pending=new Map(),sources=new Map();let cachePromise;
  function openCache(){
    return cachePromise??=(async()=>{
      try{return await (cacheStorage===undefined?globalThis.caches:cacheStorage)?.open(name)||null;}
      catch{return null;} // Private mode, denied storage or unavailable API.
    })();
  }
  async function load(path){
    const url=new URL(path,root),asset=definitions.get(url.href);
    if(!asset)throw new Error('Unknown handwriting asset');
    const key=new URL(url);key.searchParams.set('sha256',asset.sha256);
    const cache=await openCache();
    if(cache){
      try{
        const response=await cache.match(key.href);
        if(response?.ok){
          const bytes=new Uint8Array(await response.arrayBuffer());
          if(await sha256(bytes)===asset.sha256){sources.set(path,'cached');return bytes;}
          await cache.delete(key.href); // Recover a truncated/corrupt entry.
        }
      }catch{/* A cache read failure must not prevent a network fallback. */}
    }
    onDownload();
    const response=await fetchAsset(key.href,{signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error('Recognition asset unavailable');
    const bytes=new Uint8Array(await response.arrayBuffer());
    if(await sha256(bytes)!==asset.sha256)throw new Error('Recognition asset checksum mismatch');
    let stored=false;
    if(cache){
      try{
        await cache.put(key.href,new Response(bytes,{headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream'}}));
        stored=true;
        // Remove only obsolete revisions of THIS asset, after the replacement
        // is safely stored. Leave other pages, app caches and progress alone.
        for(const old of await cache.keys()){
          const oldUrl=new URL(old.url);
          if(oldUrl.origin===url.origin&&oldUrl.pathname===url.pathname&&oldUrl.href!==key.href)await cache.delete(old);
        }
      }catch{/* Quota/cleanup failure must not discard the downloaded model. */}
    }
    sources.set(path,stored?'saved':'temporary');
    return bytes;
  }
  return {
    async read(path,text=false){
      if(!pending.has(path))pending.set(path,load(path).catch(error=>{pending.delete(path);throw error;}));
      const bytes=await pending.get(path);
      return text?new TextDecoder().decode(bytes):bytes;
    },
    status(){
      const values=[...sources.values()];
      if(values.length!==definitions.size||values.includes('temporary'))return 'unavailable';
      return values.every(value=>value==='cached')?'cached':'saved';
    }
  };
}
