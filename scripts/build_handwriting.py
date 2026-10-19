"""Sample the pinned KanjiVG stroke paths for local handwriting recognition.

Adapted geometry: © 2009–2026 Ulrich Apel and contributors, CC BY-SA 3.0.
Uses the archive/checksum already pinned by build_radicals.py; no dependencies.
"""
from pathlib import Path
import base64
import gzip
import hashlib
import json
import math
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def sample_path(path):
    tokens = re.findall(r'[MmCcSs]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', path)
    if re.search(r'[A-BD-LN-RT-Za-bd-ln-rt-z]', path):
        raise ValueError(f'Unsupported SVG command: {path}')
    i, command, current, control, points = 0, '', (0, 0), None, []
    while i < len(tokens):
        if tokens[i].isalpha():
            command = tokens[i]
            i += 1
        count = {'m': 2, 'c': 6, 's': 4}[command.lower()]
        values = [float(n) for n in tokens[i:i + count]]
        i += count
        coords = list(zip(values[::2], values[1::2]))
        if command.islower():
            coords = [(x + current[0], y + current[1]) for x, y in coords]
        if command.lower() == 'm':
            if points:
                raise ValueError('Unexpected second subpath within a stroke')
            current = coords[0]
            points.append(current)
            control = None
            continue
        if command.lower() == 's':
            first = tuple(2 * current[j] - control[j] for j in range(2)) if control else current
            coords.insert(0, first)
        a, b, end = coords
        for step in range(1, 25):
            t = step / 24
            u = 1 - t
            points.append(tuple(u**3 * current[j] + 3 * u*u*t*a[j] + 3 * u*t*t*b[j] + t**3*end[j] for j in range(2)))
        current, control = end, b
    return points


def resample(points, count=12):
    lengths = [0]
    for a, b in zip(points, points[1:]):
        lengths.append(lengths[-1] + math.dist(a, b))
    result, j = [], 1
    for i in range(count):
        distance = lengths[-1] * i / (count - 1)
        while j < len(points) - 1 and lengths[j] < distance:
            j += 1
        fraction = (distance - lengths[j-1]) / (lengths[j] - lengths[j-1] or 1)
        result.extend(max(0, min(255, round((points[j-1][k] + fraction * (points[j][k] - points[j-1][k])) * 255 / 109))) for k in range(2))
    return base64.b64encode(bytes(result)).decode('ascii')


def main():
    source = json.loads((ROOT / 'data/radical-source.json').read_text(encoding='utf-8'))
    archive = (ROOT / '.cache' / f"kanjivg-{source['version']}.xml.gz").read_bytes()
    if hashlib.sha256(archive).hexdigest() != source['sha256']:
        raise ValueError('KanjiVG checksum mismatch')
    entries = {entry.get('id'): entry for entry in ET.fromstring(gzip.decompress(archive))}
    catalog = json.loads((ROOT / 'data/catalog-source.json').read_text(encoding='utf-8'))
    templates = []
    for card in catalog:
        char = card['char']
        entry = entries[f'kvg:kanji_{ord(char):05x}']
        strokes = [resample(sample_path(p.get('d'))) for p in entry.iter('path')]
        assert strokes, char
        templates.append([char, *strokes])
    output = {'version': 1, 'source': f"KanjiVG r{source['version']}", 'license': 'CC-BY-SA-3.0', 'templates': templates}
    target = ROOT / 'data/handwriting-templates.json'
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    manifest = dict(sourceUrl=source['url'], sourceSha256=source['sha256'],
                    generated='2026-10-20', count=len(templates),
                    format='[character, ...base64 strokes]; each stroke has 12 interleaved uint8 x/y points in 0..255',
                    license='CC-BY-SA-3.0', sha256=hashlib.sha256(target.read_bytes()).hexdigest())
    (ROOT / 'data/handwriting-source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(templates)} templates, {target.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
