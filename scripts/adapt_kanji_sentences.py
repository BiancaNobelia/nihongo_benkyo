"""Reuse attested spelling variants and sentence-final polite verb forms.

No tense changes or replacements inside subordinate clauses. Save the unchanged
source sentence for attribution and translation review.
"""
from prepare_kanji_sentences import *

def main():
    selected=load('data/kanji-sentence-selected.json')
    missing=load('.cache/kanji-sentence-missing.json')
    bank=[v for p in (ROOT/'.cache/openjlpt').glob('*vocab*.json') for v in json.loads(p.read_text(encoding='utf-8'))]
    variants=defaultdict(list)
    for v in bank:
        variants[v['reading']].append(v)
        pos=v.get('pos',[]);w,r=v['word'],v['reading']
        if any(p.startswith('v') for p in pos):
            if 'v1' in pos and w.endswith('る'):w,r=w[:-1]+'ます',r[:-1]+'ます'
            elif any(p.startswith('v5') for p in pos) and r[-1] in 'うくぐすつぬぶむる':
                tail=dict(zip('うくぐすつぬぶむる','いきぎしちにびみり'))[r[-1]]+'ます'
                w,r=w[:-1]+tail,r[:-1]+tail
            elif w.endswith('する'):w,r=w[:-2]+'します',r[:-2]+'します'
            else:continue
            variants[r].append({**v,'polite':True,'adaptedWord':w})
    remaining=[];added=0
    for e in missing:
        options=[]
        for v in variants[e['reading']]:
            sourceword=v['word'];polite=v.get('polite',False)
            # Alternate spelling must still contain the same kanji, avoiding homophones.
            if polite and v['adaptedWord']!=e['word']:continue
            if not polite and (set(HAN.findall(sourceword))!=set(HAN.findall(e['word'])) or sourceword==e['word']):continue
            for s in v.get('examples',[]):
                text,spans=parse_annotated(s.get('furigana',s['ja']))
                if text!=s['ja'] or not valid_spans(text,spans):continue
                start=target_at(text,spans,sourceword,v['reading'])
                if start is None:continue
                end=start+len(sourceword)
                if polite and text[end:] not in ['。','！','？','!','?']:continue
                if any(p<start<p+len(w) or p<end<p+len(w) for p,w,r in spans):continue
                delta=len(e['word'])-len(sourceword)
                newtext=text[:start]+e['word']+text[end:]
                newspan=[[p,w,r] for p,w,r in spans if p+len(w)<=start]+[[start,e['word'],e['reading']]]+[[p+delta,w,r] for p,w,r in spans if p>=end]
                if not valid_spans(newtext,newspan):continue
                options.append({'text':newtext,'furigana':newspan,'sourceText':text,'translationEn':s['en'],'origin':'tatoeba','adapted':True,'reference':s['tatoeba_id']})
        if options:
            selected[e['word']+'|'+e['reading']]=min(options,key=lambda x:len(x['text']));added+=1
        else:remaining.append(e)
    save('data/kanji-sentence-selected.json',selected)
    save('.cache/kanji-sentence-missing.json',remaining)
    print('Adapted',added,'remaining',len(remaining))

if __name__=='__main__':main()
