"""Select existing sentences by exact word AND reading; no substring guesswork.

Run export_kanji_sentence_inputs.mjs first. OpenJLPT files use source-lock.json.
Only selected source sentences are saved; runtime never contacts their providers.
"""
import json
import re
from pathlib import Path
from collections import defaultdict, Counter

ROOT = Path(__file__).resolve().parents[1]
HAN = re.compile(r'[\u3400-\u9fff\U00020000-\U0003134f々]')

def load(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))

def save(path, data):
    (ROOT / path).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def hira(text):
    return ''.join(chr(ord(c)-96) if 'ァ' <= c <= 'ヶ' else c for c in text)

def parse_annotated(text):
    plain, spans, cursor = '', [], 0
    for m in re.finditer(r'\{([^{}|]+)\|([^{}|]+)\}', text):
        plain += text[cursor:m.start()]
        spans.append([len(plain), m[1], hira(m[2])])
        plain += m[1]
        cursor = m.end()
    plain += text[cursor:]
    return plain, spans

def valid_spans(text, spans):
    covered, end = set(), 0
    for start, base, reading in spans:
        if start < end or text[start:start+len(base)] != base or not re.fullmatch(r'[ぁ-ゖー・]+', reading):
            return False
        end = start+len(base)
        covered.update(range(start,end))
    return all(m.start() in covered for m in HAN.finditer(text))

def target_at(text, spans, word, reading):
    for m in re.finditer(re.escape(word),text):
        start,end = m.start(),m.end()
        reading_parts, cursor = [], start
        for pos,base,kana in spans:
            stop=pos+len(base)
            if stop<=start or pos>=end: continue
            if pos<start or stop>end: break
            reading_parts.extend([text[cursor:pos],kana]);cursor=stop
        else:
            reading_parts.append(text[cursor:end])
            if hira(''.join(reading_parts)) == hira(reading):
                return start
    return None

def main():
    words=load('.cache/sentence-example-words.json')
    bank=[v for p in (ROOT/'.cache/openjlpt').glob('*vocab*.json') for v in json.loads(p.read_text(encoding='utf-8'))]
    lexical=defaultdict(list)
    for e in bank: lexical[(e['word'],e['reading'])].append(e)
    corpus={}
    for v in bank:
        for s in v.get('examples',[]):
            text,spans=parse_annotated(s.get('furigana',s['ja']))
            if text==s['ja'] and valid_spans(text,spans):
                corpus[s['tatoeba_id']]={'text':text,'furigana':spans,'translationEn':s['en'],'origin':'tatoeba','reference':s['tatoeba_id']}
    corpus_index=defaultdict(list)
    for s in corpus.values():
        for char in set(HAN.findall(s['text'])):corpus_index[char].append(s)
    types={(e['word'],e['reading']):e['type'] for e in load('.cache/sentence-example-types.json')}
    quiz=defaultdict(list)
    for q in load('.cache/sentence-example-quiz.json'):
        if not q.get('spans'):continue
        before,after=q['sentence'].split('{target}')
        text=before+q['word']+after
        spans=q['spans'][0]+[[p+len(before),w,r] for p,w,r in q['spans'][1]]+[[p+len(before)+len(q['word']),w,r] for p,w,r in q['spans'][2]]
        if valid_spans(text,spans):
            quiz[(q['word'],q['reading'])].append({'text':text,'furigana':spans,'translation':q['sentenceMeaning'],'origin':'local-jlpt','reference':q.get('id',q['word']+'|'+q['reading'])})
    bunpou=[q for q in load('.cache/sentence-example-bunpou.json') if valid_spans(q['text'],q.get('furigana') or [])]
    selected, missing = {}, []
    for e in words:
        key=e['word']+'|'+e['reading']
        options=quiz.get((e['word'],e['reading']),[])
        if not options:
            options=[{**q,'origin':'local-bunpou','reference':q['id']} for q in bunpou if target_at(q['text'],q['furigana'],e['word'],e['reading']) is not None]
        if not options:
            for v in lexical.get((e['word'],e['reading']),[]):
                for s in v.get('examples',[]):
                    text,spans=parse_annotated(s.get('furigana',s['ja']))
                    if text!=s['ja'] or not valid_spans(text,spans):continue
                    if target_at(text,spans,e['word'],e['reading']) is None:continue
                    options.append({'text':text,'furigana':spans,'translationEn':s['en'],'origin':'tatoeba','reference':s['tatoeba_id']})
        if not options:
            first=HAN.search(e['word'])
            if first:
                options=[s for s in corpus_index[first[0]] if e['word'] in s['text'] and target_at(s['text'],s['furigana'],e['word'],e['reading']) is not None]
        if options:
            selected[key]=min(options,key=lambda s:len(s['text']))
        else:
            pos=list(dict.fromkeys(p for v in lexical.get((e['word'],e['reading']),[]) for p in v.get('pos',[])))
            missing.append({**e,'pos':pos,'type':types.get((e['word'],e['reading']),'')})
    save('data/kanji-sentence-selected.json',selected)
    save('.cache/kanji-sentence-missing.json',missing)
    print('Selected',len(selected),dict(Counter(s['origin'] for s in selected.values())),'to author',len(missing))

if __name__=='__main__':main()
