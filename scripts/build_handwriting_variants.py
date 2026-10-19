"""Pin and compact the independently drawn Kanji Canvas reference patterns.

The original patterns are by Dominik Klein / Kanji Canvas, MIT (with backlink).
This extracts JSON as data only; it never evaluates the upstream JavaScript.
"""
import hashlib
import json
from pathlib import Path
import re
import urllib.request

from build_handwriting import resample

ROOT = Path(__file__).resolve().parents[1]
REVISION = 'a9214105f156def3b96930e5fcf10b7652b7a1f7'
URL = f'https://raw.githubusercontent.com/asdfjkl/kanjicanvas/{REVISION}/docs/resources/javascript/ref-patterns.js'


def main():
    cache = ROOT / '.cache/kanjicanvas/ref-patterns.js'
    cache.parent.mkdir(parents=True, exist_ok=True)
    if not cache.exists():
        cache.write_bytes(urllib.request.urlopen(URL).read())
    raw = cache.read_bytes()
    checksum = hashlib.sha256(raw).hexdigest()
    manifest_path = ROOT / 'data/handwriting-variants-source.json'
    if manifest_path.exists():
        assert checksum == json.loads(manifest_path.read_text())['sourceSha256'], 'Source checksum mismatch'
    source = raw.decode('utf-8').split('KanjiCanvas.refPatterns =', 1)[1].strip().rstrip(';')
    patterns = json.loads(re.sub(r',\s*]', ']', source))
    catalog = {card['char'] for card in json.loads((ROOT / 'data/catalog-source.json').read_text(encoding='utf-8'))}
    rows = []
    for char, count, strokes in patterns:
        if char not in catalog:
            continue
        assert count == len(strokes)
        points = [p for s in strokes for p in s]
        low = [min(p[k] for p in points) for k in (0, 1)]
        high = [max(p[k] for p in points) for k in (0, 1)]
        extent = max(high[k] - low[k] for k in (0, 1))
        # resample expects the KanjiVG 109-unit coordinate space; preserve aspect.
        rows.append([char, *[resample([[(p[k] - low[k]) * 109 / extent for k in (0, 1)] for p in s]) for s in strokes]])
    target = ROOT / 'data/handwriting-variants.json'
    data = dict(version=1, source=f'Kanji Canvas {REVISION}', license='MIT', templates=rows)
    target.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    manifest = dict(sourceUrl=URL, revision=REVISION, sourceSha256=checksum,
                    count=len(rows), generated='2026-10-20', license='MIT',
                    format='[character, ...base64 strokes]; 12 interleaved uint8 x/y points per stroke; bounding-box normalized preserving aspect',
                    sha256=hashlib.sha256(target.read_bytes()).hexdigest())
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'{len(rows)} additional reference patterns, {target.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
