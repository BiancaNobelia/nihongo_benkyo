"""Build Indonesian origin notes from reviewed, pinned source facts.

No web scraping or machine translation is performed during this build.
The source manifest preserves the upstream revision / per-character reference.
Editorial paraphrases take precedence over component-role templates.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build():
    source = json.loads((ROOT / 'data/kanji-origin-source.json').read_text(encoding='utf8'))
    translations = json.loads((ROOT / 'data/kanji-origin-translations.json').read_text(encoding='utf8'))
    editorial = {}
    for line in (ROOT / 'data/kanji-origin-editorial.tsv').read_text(encoding='utf8').splitlines():
        if not line or line.startswith('#'):
            continue
        char, text = line.split('\t')
        if char in editorial:
            raise ValueError(f'Duplicate editorial entry: {char}')
        editorial[char] = text
    revision = source['pins']['peterolson/chinese-lexicon']['commit']
    entries = {}
    for char, item in source['entries'].items():
        if char in editorial:
            text = editorial[char]
        elif item['type'] == 'phonosemantic':
            semantic = ' dan '.join(item['semantic'])
            phonetic = ' dan '.join(item['phonetic'])
            text = f'{semantic} memberi petunjuk makna, sedangkan {phonetic} memberi petunjuk bunyi dalam pembentukan karakter ini.'
            if item.get('old'):
                text = f'Pada bentuk {item["old"]}, ' + text
        else:
            text = translations[char]
            if item.get('old'):
                text = f'Penjelasan bentuk {item["old"]}: ' + text
        if not text.strip() or any(token in text for token in ['GLYPH', '［図］', 'MISSING']):
            raise ValueError(f'Unreviewed placeholder: {char}')
        source_url = item.get('url') or f'https://github.com/peterolson/chinese-lexicon/blob/{revision}/etymology/index.js'
        entries[char] = {
            'text': text,
            'source': item['source'],
            'url': source_url,
            'sourceChar': item.get('sourceChar', char),
            'old': item.get('old'),
            'uncertain': item['type'] == 'uncertain' or 'belum pasti' in text or 'beberapa tafsiran' in text or 'beberapa penjelasan' in text or 'tidak jelas' in text or 'tidak pasti' in text,
        }
    if set(editorial) - set(entries) or set(translations) - set(entries):
        raise ValueError('Editorial notes do not belong to the source manifest')
    result = {'version': 1, 'date': source['reviewDate'], 'entries': entries}
    output = ROOT / 'data/kanji-origins.json'
    output.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf8')
    print(f'{len(entries)} origins; {len(editorial)} editorial notes; {len(translations)} translated descriptions; {output.stat().st_size:,} bytes')


if __name__ == '__main__':
    build()
