"""Build the deployed catalog offline from locked sources and translations."""
from collections import Counter
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]

def load(name):
    return json.loads((ROOT / 'data' / name).read_text(encoding='utf-8'))

def validate_review(source, reviewed):
    expected = {k['char'] for k in source}
    actual = set(reviewed['entries'])
    if expected != actual:
        raise ValueError(f'Indonesian review coverage mismatch: {len(expected - actual)} missing, {len(actual - expected)} unexpected. Review the catalog before building.')
    # Normalize Windows/Unix line endings so a clean checkout builds identically.
    source_hash = hashlib.sha256((ROOT / 'data/catalog-source.json').read_text(encoding='utf-8').encode('utf-8')).hexdigest()
    if reviewed['sourceSha256'] != source_hash:
        raise ValueError('The dictionary source changed. Review Indonesian meanings and examples against the new source before building.')

def main():
    source, reviewed, curated = load('catalog-source.json'), load('reviewed-id.json'), load('curated.json')
    validate_review(source, reviewed)
    data = []
    for k in source:
        entry = reviewed['entries'][k['char']]
        item = dict(char=k['char'], meaning=entry['meaning'], level=k['level'], on=k['on'], kun=k['kun'], strokes=k['strokes'], meaningsEn=entry.get('meaningsEn', k['meanings_en']), example=entry['example'])
        if k['supplementary']: item['supplementary'] = True
        data.append(item)
    # Keep the original learning-friendly order in the homepage; extend afterwards.
    original_order = {char: i for i, char in enumerate(curated)}
    data.sort(key=lambda k: (0, original_order[k['char']]) if k['char'] in original_order else (1, -int(k['level'][1])))
    assert len(data) == len({k['char'] for k in data}) == len(source)
    assert set(curated).issubset(k['char'] for k in data), 'Existing cards must not disappear'
    counts = dict(Counter(k['level'] for k in data))
    example_translations = {}
    for k in data:
        assert k['meaning'] and k['strokes'] and (k['on'] or k['kun'])
        if k['example']:
            ex = k['example']
            assert k['char'] in ex['word'] and ex['reading'] and ex['meaning']
            assert ex['reading'] in ex['readings']
            key = (ex['word'], ex['reading'])
            assert example_translations.setdefault(key, ex['meaning']) == ex['meaning'], f'Inconsistent translation: {key}'
    # One record per line keeps the catalog readable while avoiding large whitespace overhead.
    output = '// Data: OpenJLPT, KANJIDIC2 and JMdict (CC BY-SA 4.0). See DATA-SOURCES.md.\nexport const KANJI = [\n'
    output += ',\n'.join('  ' + json.dumps(k, ensure_ascii=False, separators=(',', ':')) for k in data)
    (ROOT / 'kanji-data.js').write_text(output + '\n];\n', encoding='utf-8')
    manifest = dict(source=load('source-lock.json'), total=len(data), counts=counts,
                    examples=sum(bool(k['example']) for k in data),
                    translationReview=dict(date=reviewed['reviewDate'], kanji=len(reviewed['entries']), examples=sum(bool(k['example']) for k in data)),
                    characters={level: ''.join(k['char'] for k in source if k['level'] == level) for level in ('N5','N4','N3','N2','N1')})
    (ROOT / 'data/catalog-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Built', len(data), 'kanji:', counts, 'examples:', manifest['examples'])

if __name__ == '__main__':
    main()
