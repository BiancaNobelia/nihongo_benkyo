"""Prepare cached Indonesian glosses; no translation request runs in the browser.

Only public dictionary glosses are sent to Google Translate. Review translations
in data/translations-id.json and use data/curated.json for editorial corrections.
"""
from pathlib import Path
import json
import re
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'data' / 'translations-id.json'

def translate_batch(phrases):
    text = '\n'.join(f'{i+1:03d}. {p}' for i, p in enumerate(phrases))
    url = 'https://translate.googleapis.com/translate_a/single?' + urllib.parse.urlencode({'client':'gtx','sl':'en','tl':'id','dt':'t','q':text})
    req = urllib.request.Request(url, headers={'User-Agent':'NihongoBenkyo/2.0'})
    with urllib.request.urlopen(req, timeout=45) as response:
        result = json.load(response)
    translated = ''.join(part[0] for part in result[0] if part[0])
    matches = list(re.finditer(r'(?m)^\s*(\d{3})[.．]\s*', translated))
    if len(matches) != len(phrases):
        if len(phrases) == 1: raise ValueError('Translation alignment failed')
        mid = len(phrases) // 2
        return translate_batch(phrases[:mid]) + translate_batch(phrases[mid:])
    rows = []
    for i, match in enumerate(matches):
        if int(match.group(1)) != i + 1: raise ValueError('Translation numbering changed')
        end = matches[i+1].start() if i+1 < len(matches) else len(translated)
        value = re.sub(r'\s+', ' ', translated[match.end():end]).strip()
        if not value: raise ValueError('Empty translation')
        rows.append(value[0].upper() + value[1:])
    return rows

def main():
    catalog = json.loads((ROOT / 'data' / 'catalog-source.json').read_text(encoding='utf-8'))
    curated = json.loads((ROOT / 'data' / 'curated.json').read_text(encoding='utf-8'))
    phrases = []
    for k in catalog:
        own = curated.get(k['char'], {})
        if not own.get('meaning'): phrases.append('; '.join(k['meanings_en'][:3]))
        if not own.get('example') and k.get('example'): phrases.append(k['example']['meaning_en'])
    phrases = list(dict.fromkeys(phrases))
    translations = json.loads(OUTPUT.read_text(encoding='utf-8')) if OUTPUT.exists() else {}
    missing = [p for p in phrases if p not in translations]
    print(f'{len(phrases)} phrases; {len(missing)} pending', flush=True)
    while missing:
        batch, length = [], 0
        for phrase in missing[:30]:
            if batch and length + len(phrase) > 1800: break
            batch.append(phrase); length += len(phrase) + 7
        for attempt in range(3):
            try:
                rows = translate_batch(batch)
                break
            except Exception:
                if attempt == 2: raise
                time.sleep(3 * (attempt + 1))
        translations.update(zip(batch, rows))
        OUTPUT.write_text(json.dumps(translations, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        missing = missing[len(batch):]
        print(f'Translated {len(phrases)-len(missing)}/{len(phrases)}', flush=True)
        time.sleep(.3)

if __name__ == '__main__':
    main()
