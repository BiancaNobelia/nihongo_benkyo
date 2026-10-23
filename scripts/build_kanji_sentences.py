"""Build the static, fully covered sentence index. No network calls.

Run export_kanji_sentence_inputs.mjs and build_authored_kanji_sentences.py first.
The committed selected-source/translation files make rebuilding reproducible.
Offsets on disk use JavaScript UTF-16, including supplementary kanji such as 𠮟.
"""
from prepare_kanji_sentences import *

def utf16(text):return len(text.encode('utf-16-le'))//2

def main():
    words=load('.cache/sentence-example-words.json')
    cards=load('.cache/sentence-example-cards.json')
    selected=load('data/kanji-sentence-selected.json')
    authored=load('.cache/kanji-sentence-authored.json')
    translations=load('data/kanji-sentence-translations.json')
    editorial=load('data/kanji-sentence-editorial.json')
    result={}
    for e in words:
        key=e['word']+'|'+e['reading']
        record=dict(authored.get(key) or selected[key])
        text=record['text'];spans=record['furigana']
        assert valid_spans(text,spans),key
        start=target_at(text,spans,e['word'],e['reading'])
        assert start is not None,key
        translation=editorial.get(text) or record.get('translation') or translations[text]
        assert translation.strip() and translation!=text and not re.search('[ぁ-ゖァ-ヺ]',translation),(key,translation)
        assert not any(c in translation for c in ['{','}']) and not re.search(r'(?<!\d)%',translation),key
        output={k:record[k] for k in ['text','origin','reference']}
        output.update(furigana=[[utf16(text[:p]),w,r] for p,w,r in spans],translation=translation,targetStart=utf16(text[:start]),targetLength=utf16(e['word']))
        for k in ['adapted','sourceText']:
            if k in record:output[k]=record[k]
        result[key]=output
    assert all(c['keys'] and all(k in result for k in c['keys']) for c in cards)
    metadata={'kanji':len(cards),'wordReadings':len(result),'associations':sum(len(c['keys']) for c in cards),'origins':dict(Counter(v['origin'] for v in result.values()))}
    bundle={'version':1,'updated':'2026-10-23','coverage':metadata,'license':'CC BY-SA 4.0; Tatoeba sentences: CC BY 2.0 FR','entries':result}
    (ROOT/'data/kanji-sentences.json').write_text(json.dumps(bundle,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    save('data/kanji-sentence-coverage.json',metadata)
    print(metadata)
    print('Static bytes:',(ROOT/'data/kanji-sentences.json').stat().st_size)

if __name__=='__main__':main()
