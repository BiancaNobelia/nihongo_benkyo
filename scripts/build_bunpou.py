"""Import the user workbook once, then rebuild the quiz offline from pinned rows."""
import argparse
import hashlib
import json
import re
from collections import Counter
from itertools import permutations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
KEYS = ['chapter', 'theme', 'pattern', 'meaning', 'structure', 'example', 'translation', 'note', 'status', 'source']
SHEETS = ['Bunpou Bab 1-25', 'Bunpou Bab 26-50']

def write_json(name, value):
    (DATA / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def read_json(name):
    return json.loads((DATA / name).read_text(encoding='utf-8'))

def build_furigana(entries):
    expected = {q['id']: q['example'] for q in entries}
    expected.update({q['id'] + '.order': q['order']['example'] for q in entries
                     if q['order']['example'] != q['example']})
    authored = {}
    for line in (DATA / 'bunpou-furigana.txt').read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        key, annotated = line.split('|')
        assert key not in authored and key in expected, f'Unexpected furigana ID: {key}'
        plain, spans, cursor = '', [], 0
        for match in re.finditer(r'([一-龯々]+)\[([ぁ-ゖー]+)\]', annotated):
            gap = annotated[cursor:match.start()]
            assert not re.search(r'[一-龯々\[\]]', gap), f'{key}: kanji without furigana'
            plain += gap
            surface, reading = match.groups()
            spans.append([len(plain), surface, reading])
            plain += surface
            cursor = match.end()
        tail = annotated[cursor:]
        assert not re.search(r'[一-龯々\[\]]', tail), f'{key}: incomplete furigana'
        plain += tail
        assert plain == expected[key], f'{key}: furigana differs from example'
        authored[key] = spans
    assert set(authored) == set(expected), f'Furigana coverage mismatch: {set(expected) ^ set(authored)}'
    return authored

def can_assemble(text, tokens):
    if not tokens:
        return text == ''
    for token in set(tokens):
        if text.startswith(token):
            remaining = tokens.copy()
            remaining.remove(token)
            if can_assemble(text[len(token):], remaining):
                return True
    return False

def build_order(rows):
    variants = read_json('bunpou-order-variants.json')
    authored = {}
    for line in (DATA / 'bunpou-order.txt').read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        key, chunks = line.split('|')
        assert key not in authored, f'Duplicate order exercise {key}'
        authored[key] = chunks.split(' / ')
    ids = {r['id'] for r in rows}
    assert set(authored) == ids, f'Order coverage mismatch: {set(authored) ^ ids}'
    for section in variants.values():
        assert set(section) <= ids
    output = {}
    for row in rows:
        key = row['id']
        override = variants['overrides'].get(key, {})
        if override:
            assert override.get('reason')
        example = override.get('example', row['example'])
        tokens = authored[key]
        assert 3 <= len(tokens) <= 20 and all(tokens), key
        assert ''.join(tokens) == example, f'{key}: order tokens differ from source'
        accepted = {example}
        for chunks in variants['swaps'].get(key, []):
            original = ''.join(chunks)
            assert example.count(original) == 1, f'{key}: ambiguous swap window'
            accepted = {text.replace(original, ''.join(order)) for text in accepted for order in permutations(chunks)}
        accepted.update(variants['alternatives'].get(key, []))
        assert all(can_assemble(text, tokens) for text in accepted), f'{key}: alternative cannot be assembled'
        output[key] = {'tokens': tokens, 'accepted': sorted(accepted), 'example': example,
                       'translation': override.get('translation', row['translation'])}
    return output

def import_workbook(path):
    import openpyxl
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows, counts = [], Counter()
    for sheet in SHEETS:
        for row_number, cells in enumerate(workbook[sheet].values, 1):
            if row_number == 1 or not cells[0]:
                continue
            row = dict(zip(KEYS, cells))
            chapter = int(row['chapter'])
            assert 1 <= chapter <= 50
            counts[chapter] += 1
            row.update(id=f'bunpou-{chapter:02d}-{counts[chapter]:02d}', sheet=sheet, sourceRow=row_number)
            rows.append(row)
    assert set(counts) == set(range(1, 51))
    write_json('bunpou-source.json', rows)
    write_json('bunpou-manifest.json', {
        'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'sheets': SHEETS, 'entryCount': len(rows), 'chapterCounts': dict(sorted(counts.items())),
        'policy': 'All grammar rows preserved; workbook progress is not imported. Exercises and corrections are authored separately.',
    })

def build():
    rows = read_json('bunpou-source.json')
    overrides = read_json('bunpou-overrides.json')
    authored = {}
    for line_number, line in enumerate((DATA / 'bunpou-cloze.txt').read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip() or line.startswith('#'):
            continue
        parts = line.split('|')
        assert len(parts) in (5, 6), f'Line {line_number}: wrong column count'
        key, target, *rest = parts
        assert key not in authored, f'Duplicate source {key}'
        authored[key] = (target, rest[:3], rest[3] if len(rest) == 4 else None)
    assert set(authored) == {r['id'] for r in rows}, f'Missing/extra exercises: {set(authored) ^ {r["id"] for r in rows}}'
    assert set(overrides) <= set(authored)
    entries = []
    for original in rows:
        row = {**original, **overrides.get(original['id'], {})}
        target, distractors, cue = authored[row['id']]
        assert row['example'].count(target) == 1, f'{row["id"]}: target not unique: {target}'
        assert len(set([target, *distractors])) == 4, row['id']
        before, after = row['example'].split(target)
        # Do not expose the same target elsewhere in the sentence after masking.
        assert target not in before + after, row['id']
        assert all(row[k] for k in ['pattern', 'meaning', 'structure', 'translation', 'note'])
        entries.append({k: row[k] for k in ['id', 'chapter', 'theme', 'pattern', 'meaning', 'structure', 'example', 'translation', 'note', 'sheet', 'sourceRow']} | {
            'before': before, 'after': after, 'answer': target, 'distractors': distractors,
            'cue': cue or row['meaning'], 'book': 1 if row['chapter'] <= 25 else 2,
        })
    order = build_order(entries)
    for entry in entries:
        entry['order'] = order[entry['id']]
    furigana = build_furigana(entries)
    for entry in entries:
        entry['furigana'] = furigana[entry['id']]
        if entry['order']['example'] != entry['example']:
            entry['order']['furigana'] = furigana[entry['id'] + '.order']
    chapters = [{'number': c, 'title': next(r['theme'] for r in rows if r['chapter'] == c), 'count': sum(r['chapter'] == c for r in rows)} for c in range(1, 51)]
    output = '// Generated by scripts/build_bunpou.py; sources: DATA-SOURCES.md.\n'
    output += 'export const BUNPOU_CHAPTERS = ' + json.dumps(chapters, ensure_ascii=False, separators=(',', ':')) + ';\n'
    output += 'export const BUNPOU_ENTRIES = [\n' + ',\n'.join('  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in entries) + '\n];\n'
    (ROOT / 'bunpou-data.js').write_text(output, encoding='utf-8')
    print(f'{len(entries)} exercises, {len(chapters)} chapters; all source rows covered.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--workbook', type=Path)
    args = parser.parse_args()
    if args.workbook:
        import_workbook(args.workbook)
    build()
