"""Extract ordered, unmodified N5/N4 SVG paths from the pinned KanjiVG archive.

KanjiVG © 2009–2026 Ulrich Apel and contributors, CC BY-SA 3.0.
Run build_radicals.py --download first if the source cache is absent.
"""
from pathlib import Path
import gzip
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def main():
    source = json.loads((ROOT / 'data/radical-source.json').read_text(encoding='utf-8'))
    archive = (ROOT / '.cache' / f"kanjivg-{source['version']}.xml.gz").read_bytes()
    assert hashlib.sha256(archive).hexdigest() == source['sha256'], 'KanjiVG checksum mismatch'
    entries = {e.get('id'): e for e in ET.fromstring(gzip.decompress(archive))}
    catalog = json.loads((ROOT / 'data/catalog-source.json').read_text(encoding='utf-8'))
    selected = [k for k in catalog if k['level'] in ('N5', 'N4')]
    characters = {}
    for card in selected:
        char = card['char']
        code = f'{ord(char):05x}'
        paths = list(entries[f'kvg:kanji_{code}'].iter('path'))
        assert len(paths) == card['strokes'], char
        assert [p.get('id') for p in paths] == [f'kvg:{code}-s{i+1}' for i in range(len(paths))], char
        values = [p.get('d') for p in paths]
        assert all(re.fullmatch(r'[MmCcSs0-9.,\s+\-]+', d) for d in values), char
        characters[char] = values
    output = dict(version=1, viewBox='0 0 109 109', license='CC-BY-SA-3.0', characters=characters)
    target = ROOT / 'data/stroke-order.json'
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8', newline='\n')
    manifest = dict(sourceUrl=source['url'], sourceSha256=source['sha256'], generated='2026-10-21',
                    count=len(characters), levels={level: sum(k['level'] == level for k in selected) for level in ('N5', 'N4')},
                    format='Unmodified SVG path d strings in KanjiVG stroke order; 109 × 109 viewBox',
                    license='CC-BY-SA-3.0', sha256=hashlib.sha256(target.read_bytes()).hexdigest())
    (ROOT / 'data/stroke-order-source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"{len(characters)} kanji; {target.stat().st_size:,} bytes; all stroke counts and order IDs verified.")


if __name__ == '__main__':
    main()
