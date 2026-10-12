"""Normalize the complete snapshot and select real dictionary examples."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from collections import Counter
import json
import re
import time
import urllib.parse
from import_catalog import CACHE, ROOT, download

def load(path):
    return json.loads(path.read_text(encoding='utf-8'))

def dump(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def main():
    override_path = ROOT / 'data' / 'curated.json'
    if not override_path.exists():
        text = (ROOT / 'kanji-data.js').read_text(encoding='utf-8')
        old = json.loads(text[text.index('['):text.rindex(';')])
        dump(override_path, {k['char']: {'meaning':k['meaning'], 'example':k['example']} for k in old})
    curated = load(override_path)
    entries = [k for n in range(5, 0, -1) for k in load(CACHE / f'data_json_kanji_n{n}.json')]
    vocab = [v for n in range(5, 0, -1) for v in load(CACHE / f'data_json_vocab_n{n}.json')]
    words = {}
    for v in vocab:
        words.setdefault(v['word'], []).append(v)
    catalog = []
    for k in entries:
        examples = [v for w in k.get('words', []) for v in words.get(w, []) if k['character'] in v['word'] and re.fullmatch(r'[ぁ-ゖー]+', v['reading'])]
        examples.sort(key=lambda v: (-int(v['level'][1]), len(v['word']), len(v['meanings'][0])))
        ex = examples[0] if examples else None
        item = dict(char=k['character'], level=k['level'], on=k['onyomi'], kun=k['kunyomi'], strokes=k['strokes'], meanings_en=k['meanings'], supplementary=k.get('supplementary', False))
        if ex:
            item['example'] = dict(word=ex['word'], reading=ex['reading'], meaning_en=ex['meanings'][0], readings=sorted({v['reading'] for v in words[ex['word']]}), source='OpenJLPT / JMdict')
        catalog.append(item)
    missing = [k for k in catalog if 'example' not in k and k['char'] not in curated]
    print(f'Catalog: {len(catalog)}; fetching examples for {len(missing)} kanji', flush=True)

    def find_example(k):
        cache = ROOT / '.cache' / 'words' / f'{ord(k["char"]):x}.json'
        if not cache.exists():
            for attempt in range(3):
                try:
                    raw = download('https://kanjiapi.dev/v1/words/' + urllib.parse.quote(k['char']))
                    cache.parent.mkdir(parents=True, exist_ok=True)
                    cache.write_bytes(raw)
                    break
                except Exception:
                    if attempt == 2: raise
                    time.sleep(2 ** attempt)
        candidates = []
        for entry in load(cache):
            for variant in entry.get('variants', []):
                word, reading = variant['written'], variant['pronounced']
                if k['char'] not in word or not re.fullmatch(r'[ぁ-ゖー]+', reading): continue
                senses = entry.get('meanings', [])
                if not senses or not senses[0].get('glosses'): continue
                gloss = senses[0]['glosses'][0]
                common = len(variant.get('priorities', []))
                score = (0 if common else 1, abs(len(word) - 2), len(gloss), word)
                readings = sorted({v['pronounced'] for v in entry['variants'] if v['written'] == word and re.fullmatch(r'[ぁ-ゖー]+', v['pronounced'])})
                candidates.append((score, dict(word=word, reading=reading, meaning_en=gloss, readings=readings, source='JMdict via kanjiapi.dev')))
        return k['char'], min(candidates, key=lambda p:p[0])[1] if candidates else None

    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(find_example, k): k for k in missing}
        for index, job in enumerate(as_completed(jobs), 1):
            char, example = job.result()
            if example: jobs[job]['example'] = example
            if index % 40 == 0 or index == len(missing):
                print(f'Examples {index}/{len(missing)}', flush=True)
    dump(ROOT / 'data' / 'catalog-source.json', catalog)
    print('Levels:', dict(Counter(k['level'] for k in catalog)), flush=True)
    print('No example:', [k['char'].encode('unicode_escape').decode() for k in catalog if 'example' not in k and k['char'] not in curated], flush=True)

if __name__ == '__main__':
    main()
