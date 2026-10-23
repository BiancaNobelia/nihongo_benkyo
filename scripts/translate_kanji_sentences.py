"""Cache Indonesian drafts for selected public Tatoeba sentences at build time.

Review/correct individual translations in kanji-sentence-editorial.json. Neither
private material nor browser user data is transmitted; runtime is fully local.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'data/kanji-sentence-translations.json'

def translate(phrases):
    text='\n'.join(f'{i+1:03d}. {p}' for i,p in enumerate(phrases))
    url='https://translate.googleapis.com/translate_a/single?'+urllib.parse.urlencode({'client':'gtx','sl':'ja','tl':'id','dt':'t','q':text})
    for attempt in range(4):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'NihongoBenkyo/2.0'})
            with urllib.request.urlopen(req,timeout=30) as response: result=json.load(response)
            translated=''.join(p[0] for p in result[0] if p[0])
            matches=list(re.finditer(r'(?m)^\s*(\d{3})[.．]\s*',translated))
            if len(matches)==len(phrases) and [int(m[1]) for m in matches]==list(range(1,len(phrases)+1)):
                return [re.sub(r'\s+',' ',translated[m.end():matches[i+1].start() if i+1<len(matches) else len(translated)]).strip() for i,m in enumerate(matches)]
            if len(phrases)==1: raise ValueError('Alignment failed: '+translated)
            mid=len(phrases)//2
            return translate(phrases[:mid])+translate(phrases[mid:])
        except Exception:
            if attempt==3:raise
            time.sleep(2*(attempt+1))

def main():
    selected=json.loads((ROOT/'data/kanji-sentence-selected.json').read_text(encoding='utf-8'))
    cached=json.loads(OUTPUT.read_text(encoding='utf-8')) if OUTPUT.exists() else {}
    todo=list(dict.fromkeys(e['text'] for e in selected.values() if e['origin']=='tatoeba' and e['text'] not in cached))
    batches=[]
    for text in todo:
        if not batches or len(batches[-1])>=12 or sum(len(s) for s in batches[-1])+len(text)>600:batches.append([])
        batches[-1].append(text)
    print('Pending:',len(todo),'sentences;',len(batches),'batches',flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures={pool.submit(translate,batch):batch for batch in batches}
        completed=0
        for future in as_completed(futures):
            batch=futures[future]; values=future.result()
            assert all(values)
            cached.update(zip(batch,values));completed+=len(batch)
            OUTPUT.write_text(json.dumps(cached,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
            print('Translated',completed,'/',len(todo),flush=True)

if __name__=='__main__':main()
