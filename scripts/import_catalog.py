"""Download pinned OpenJLPT kanji and vocabulary snapshots for the data build."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'openjlpt'
HEADERS = {'User-Agent': 'NihongoBenkyo/2.0 (educational kanji collection)'}

def download(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60) as response:
        return response.read()

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    lock_path = ROOT / 'data' / 'source-lock.json'
    if lock_path.exists():
        lock = json.loads(lock_path.read_text(encoding='utf-8'))
        commit = lock['commit']
    else:
        commit = json.loads(download('https://api.github.com/repos/evanclan/OpenJLPT/commits/main'))['sha']
        lock_path.parent.mkdir(exist_ok=True)
        lock_path.write_text(json.dumps({'repository':'https://github.com/evanclan/OpenJLPT', 'commit':commit, 'retrieved':'2026-10-13'}, indent=2) + '\n', encoding='utf-8')
    paths = [f'data/json/{kind}/n{level}.json' for kind in ('kanji','vocab') for level in range(5,0,-1)] + ['NOTICE.md','LICENSE']
    def fetch(path):
        target = CACHE / path.replace('/', '_')
        if not target.exists():
            target.write_bytes(download(f'https://raw.githubusercontent.com/evanclan/OpenJLPT/{commit}/{path}'))
        return path, target.stat().st_size
    with ThreadPoolExecutor(max_workers=4) as pool:
        for path, size in pool.map(fetch, paths):
            print(path, size, flush=True)
    for level in range(5,0,-1):
        data = json.loads((CACHE / f'data_json_kanji_n{level}.json').read_text(encoding='utf-8'))
        print(f'N{level}: type={type(data).__name__}, count={len(data)}', flush=True)
        print(json.dumps(data[0], ensure_ascii=True), flush=True)

if __name__ == '__main__':
    main()
