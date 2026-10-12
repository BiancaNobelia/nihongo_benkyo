"""Build the deployed catalog offline from locked sources and translations."""
from collections import Counter
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def load(name):
    return json.loads((ROOT / 'data' / name).read_text(encoding='utf-8'))

def main():
    source, translations, curated = load('catalog-source.json'), load('translations-id.json'), load('curated.json')
    overrides = load('translation-overrides.json') if (ROOT / 'data/translation-overrides.json').exists() else {}
    data = []
    for k in source:
        own = curated.get(k['char'], {})
        correction = overrides.get(k['char'], {})
        meaning = correction.get('meaning') or own.get('meaning') or translations['; '.join(k['meanings_en'][:3])].split(';')[0].strip()
        example = own.get('example') or k.get('example')
        if example:
            if 'meaning_en' in example:
                example = dict(word=example['word'], reading=example['reading'], meaning=correction.get('exampleMeaning') or translations[example['meaning_en']], meaningEn=example['meaning_en'], readings=example['readings'])
            else:
                example = dict(example)
                example['readings'] = [example['reading']]
            if correction.get('example'): example = correction['example']
        item = dict(char=k['char'], meaning=meaning, level=k['level'], on=k['on'], kun=k['kun'], strokes=k['strokes'], meaningsEn=k['meanings_en'], example=example)
        if k['supplementary']: item['supplementary'] = True
        data.append(item)
    # Keep the original learning-friendly order in the homepage; extend afterwards.
    original_order = {char: i for i, char in enumerate(curated)}
    data.sort(key=lambda k: (0, original_order[k['char']]) if k['char'] in original_order else (1, -int(k['level'][1])))
    assert len(data) == len({k['char'] for k in data}) == len(source)
    assert set(curated).issubset(k['char'] for k in data), 'Existing cards must not disappear'
    counts = dict(Counter(k['level'] for k in data))
    for k in data:
        assert k['meaning'] and k['strokes'] and (k['on'] or k['kun'])
        if k['example']:
            assert k['char'] in k['example']['word'] and k['example']['reading'] and k['example']['meaning']
    # One record per line keeps the catalog readable while avoiding large whitespace overhead.
    output = '// Data: OpenJLPT, KANJIDIC2 and JMdict (CC BY-SA 4.0). See DATA-SOURCES.md.\nexport const KANJI = [\n'
    output += ',\n'.join('  ' + json.dumps(k, ensure_ascii=False, separators=(',', ':')) for k in data)
    (ROOT / 'kanji-data.js').write_text(output + '\n];\n', encoding='utf-8')
    manifest = dict(source=load('source-lock.json'), total=len(data), counts=counts,
                    examples=sum(bool(k['example']) for k in data),
                    characters={level: ''.join(k['char'] for k in source if k['level'] == level) for level in ('N5','N4','N3','N2','N1')})
    (ROOT / 'data/catalog-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Built', len(data), 'kanji:', counts, 'examples:', manifest['examples'])

if __name__ == '__main__':
    main()
