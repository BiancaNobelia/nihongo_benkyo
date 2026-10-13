"""Build conservative visual decompositions from the pinned KanjiVG archive.

Only complete, named parts with known meanings are used. Unknown or partial
shapes cause the entire decomposition to be omitted, not guessed. These are
visual parts, not claims about the historical origin of a character.
"""
import gzip
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://kanjivg.tagaini.net}'

# Forms whose meaning as a component needs an explicit gloss. In particular,
# 月 can represent flesh, and left/right 阝 have different source radicals.
FORMS = {
    '氵': ('水', 'air'), '氺': ('水', 'air'),
    '亻': ('人', 'orang'), '扌': ('手', 'tangan'),
    '忄': ('心', 'hati; perasaan'), '⺗': ('心', 'hati; perasaan'),
    '艹': ('艸', 'rumput; tumbuhan'), '⻌': ('辶', 'berjalan; bergerak'),
    '辶': ('辶', 'berjalan; bergerak'), '灬': ('火', 'api'),
    '刂': ('刀', 'pisau; pedang'), '⺨': ('犬', 'anjing'),
    '衤': ('衣', 'pakaian'), '礻': ('示', 'menunjukkan; berkaitan dengan ritual'),
    '⻖': ('阜', 'bukit'), '⻏': ('邑', 'permukiman'),
    '罒': ('网', 'jaring'), '飠': ('食', 'makan; makanan'),
    '⺤': ('爪', 'cakar'), '攵': ('攴', 'memukul'),
    '宀': ('宀', 'atap'), '冖': ('冖', 'penutup'),
    '囗': ('囗', 'pagar; batas yang mengelilingi'),
    '冫': ('冫', 'es'), '疒': ('疒', 'sakit'),
    '广': ('广', 'bangunan beratap'), '厂': ('厂', 'tebing'),
    '彳': ('彳', 'langkah'), '隹': ('隹', 'burung berekor pendek'),
    '禾': ('禾', 'tanaman biji-bijian'), '頁': ('頁', 'kepala'),
    '斤': ('斤', 'kapak'), '戈': ('戈', 'tombak bertangkai panjang'),
    '殳': ('殳', 'senjata tongkat'), '巾': ('巾', 'kain'),
    '欠': ('欠', 'menguap; kekurangan'), '也': ('也', 'juga'),
    '周': ('周', 'keliling'), '先': ('先', 'lebih dahulu; depan'),
    '門': ('門', 'gerbang'), '耳': ('耳', 'telinga'),
    '月': ('月', 'bulan'), '日': ('日', 'matahari; hari'),
    '木': ('木', 'pohon; kayu'), '心': ('心', 'hati; perasaan'),
    '言': ('言', 'kata; berkata'), '糸': ('糸', 'benang'),
    '口': ('口', 'mulut'), '首': ('首', 'leher; kepala'),
    '主': ('主', 'utama; tuan'), '毎': ('毎', 'setiap'),
    '永': ('永', 'abadi'), '青': ('青', 'biru; hijau'),
    '玉': ('玉', 'permata; bola'), '金': ('金', 'logam; emas'),
}

# Basic shapes are clearer as whole characters, not as arbitrary stroke pieces.
BASIC = set('一二三四五六七八九十百千上下左右大小中日月火水木金土人入出口目耳手足本末未天白牛馬鳥石雨山川田力刀女父母子文王玉生年正止立自糸車米言食衣身羽')
POSITIONS = {'left': 'di kiri', 'right': 'di kanan', 'top': 'di atas',
             'bottom': 'di bawah', 'kamae': 'sebagai bingkai luar',
             'tare': 'di atas hingga kiri', 'nyo': 'di kiri hingga bawah',
             'nyoc': 'di sisi dalam'}


def named_parts(node, inherited=''):
    parts = []
    for child in node:
        if child.tag != 'g':
            # Strokes outside a labelled component mean we cannot describe
            # the full structure using complete components.
            return None
        position = child.get(NS + 'position', inherited)
        if child.get(NS + 'element'):
            parts.append((child, position))
        else:
            nested = named_parts(child, position)
            if nested is None:
                return None
            parts.extend(nested)
    return parts


def decompose(node, meanings):
    parts = named_parts(node)
    if not parts:
        return []
    result, frames = [], {}
    has_frame = any(pos == 'kamae' for _, pos in parts)
    for part, position in parts:
        symbol = part.get(NS + 'element')
        if part.get(NS + 'partial') == 'true':
            return []
        # A surrounding frame may be split into its opening/closing strokes.
        # Recombine only matching frame parts; other split parts are omitted.
        piece = part.get(NS + 'part')
        if piece:
            if position != 'kamae':
                return []
            frames.setdefault(symbol, []).append(piece)
            if len(frames[symbol]) > 1:
                continue
        original = part.get(NS + 'original', symbol)
        if symbol == '月' and original == '肉':
            source, meaning = '肉', 'daging; tubuh'
        elif symbol in FORMS:
            source, meaning = FORMS[symbol]
        elif original != symbol:
            # No automatic inference for unfamiliar variant shapes.
            return []
        elif symbol in meanings:
            source, meaning = symbol, meanings[symbol]
        else:
            return []
        place = POSITIONS.get(position, '')
        if not place and has_frame:
            place = 'di dalam'
        result.append(dict(symbol=symbol, source=source, meaning=meaning, position=place))
    if any(sorted(pieces) != ['1', '2'] for pieces in frames.values()):
        return []
    if len(result) > 2:
        # Flattened groups do not preserve enough hierarchy for absolute
        # placement labels (e.g. a left part inside the right half).
        for component in result:
            component['position'] = ''
    return result if 2 <= len(result) <= 4 else []


def main():
    manifest = json.loads((ROOT / 'data/radical-source.json').read_text(encoding='utf-8'))
    raw = (ROOT / '.cache' / f"kanjivg-{manifest['version']}.xml.gz").read_bytes()
    if hashlib.sha256(raw).hexdigest() != manifest['sha256']:
        raise ValueError('KanjiVG archive does not match the pinned checksum')
    entries = {k.attrib['id']: k[0] for k in ET.fromstring(gzip.decompress(raw))}
    review = json.loads((ROOT / 'data/reviewed-id.json').read_text(encoding='utf-8'))['entries']
    meanings = {char: item['meaning'] for char, item in review.items()}
    output = {}
    for char in meanings:
        node = entries.get(f'kvg:kanji_{ord(char):05x}')
        if node is not None and char not in BASIC:
            parts = decompose(node, meanings)
            if parts:
                output[char] = parts
    (ROOT / 'kanji-components-data.js').write_text(
        '// Generated by scripts/build_components.py; do not edit by hand.\n'
        '// KanjiVG r20260714 © Ulrich Apel and contributors, CC BY-SA 3.0.\n'
        '// Indonesian glosses: reviewed catalog and editorial component notes.\n'
        '// See DATA-SOURCES.md and data/licenses/KanjiVG-NOTICE.md.\n'
        'export const KANJI_COMPONENTS = ' + json.dumps(output, ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8')
    print(f'{len(output)} conservative visual decompositions')


if __name__ == '__main__':
    main()
