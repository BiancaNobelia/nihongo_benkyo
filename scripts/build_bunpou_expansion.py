"""Expand curated lesson contexts; every content word references a Kotoba row."""
import json
import re
from collections import Counter, defaultdict
from itertools import permutations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
# Function words / constructions taught by the associated Bunpou pattern.
# Content vocabulary must carry a source-row reference instead of entering this list.
GRAMMAR = set('。 、 「 」 あとで いただけませんか おきます か かどうか かもしれません から が きます ください くださいませんか こと ことが し しか しまいました しまいます じゃありません すぎました そう それに ために だ だそう だと つもり で でした でしたか でしょう です ですか ですね と とおりに とき ところ な ながら なとき なのに なら なりません に の のが ので のに のは のを は はず ばかり へ ほうが まで みたい みます も ように より を んです んですが ！ ？'.split())

def authored_lines(name):
    return [line.split('|') for line in (DATA / name).read_text(encoding='utf-8').splitlines()
            if line.strip() and not line.startswith('#')]

def load_kotoba():
    # Import the existing pinned workbook data, without a second workbook snapshot.
    return {q['sourceRow']: q for line in (ROOT / 'kotoba-data.js').read_text(encoding='utf-8').splitlines()
            if line.strip().startswith('{"id":')
            for q in [json.loads(line.strip().rstrip(','))]}

def sentence_key(text):
    return re.sub(r'[。、！？「」\s]', '', text)

def build_expansion(patterns, parse_furigana):
    sources = load_kotoba()
    wordsets = defaultdict(list)
    for name, japanese, meaning in authored_lines('bunpou-wordsets.txt'):
        wordsets[name].append((japanese, meaning))
    assert all(len(values) == 5 for values in wordsets.values())
    bases = {q['id']: q for q in patterns}
    swaps = json.loads((DATA / 'bunpou-expansion-order.json').read_text(encoding='utf-8'))
    seen = {sentence_key(q['example']) for q in patterns}
    families, questions, counts = set(), [], Counter()
    for short_id, wordset, template, choices, translation, cue in authored_lines('bunpou-families.txt'):
        base = bases['bunpou-' + short_id]
        family = f'{short_id}-{wordset}'
        assert family not in families, family
        families.add(family)
        assert wordset in wordsets and '{x}' in template, family
        options = choices.split(' / ') if choices else [base['answer'], *base['distractors']]
        assert len(options) == 4 and len(set(options)) == 4, family
        for variant, (japanese, meaning) in enumerate(wordsets[wordset], 1):
            key = f'bunpou-extra-{family}-{variant}'
            raw_tokens = template.replace('{x}', japanese).split(' / ')
            tokens, annotations, vocabulary = [], [], []
            for raw in raw_tokens:
                match = re.fullmatch(r'(.+)~(\d+)', raw)
                if match:
                    annotated, row = match.group(1), int(match.group(2))
                    assert row in sources, f'{key}: unknown Kotoba row {row}'
                    source = sources[row]
                    assert source['chapter'] <= base['chapter'], f'{key}: {annotated} is from chapter {source["chapter"]}'
                    text, _ = parse_furigana(annotated, key)
                    vocabulary.append({'text': text, 'sourceId': source['id']})
                else:
                    assert raw in GRAMMAR, f'{key}: unreferenced word {raw}'
                    annotated, text = raw, raw
                annotations.append(annotated)
                tokens.append(text)
            example, furigana = parse_furigana(''.join(annotations), key)
            assert 3 <= len(tokens) <= 20, f'{key}: {len(tokens)} tiles'
            assert sentence_key(example) not in seen, f'{key}: duplicate example {example}'
            seen.add(sentence_key(example))
            answer, *distractors = options
            assert example.count(answer) == 1, f'{key}: target {answer} not unique in {example}'
            before, after = example.split(answer)
            assert answer not in before + after, f'{key}: answer leaked outside blank'
            accepted = {example}
            slot_text, _ = parse_furigana(re.sub(r'~\d+(?= / |$)', '', japanese).replace(' / ', ''), key)
            for chunks in swaps.get(family, []):
                chunks = [chunk.replace('{x}', slot_text) for chunk in chunks]
                window = ''.join(chunks)
                assert example.count(window) == 1, f'{key}: ambiguous order swap'
                accepted = {text.replace(window, ''.join(order)) for text in accepted for order in permutations(chunks)}
            indonesian = translation.replace('{x}', meaning).replace('{X}', meaning[0].upper() + meaning[1:])
            questions.append({
                **{k: base[k] for k in ['chapter', 'book', 'theme', 'pattern', 'meaning', 'structure', 'note']},
                'id': key, 'patternId': base['id'], 'familyId': family,
                'example': example, 'translation': indonesian,
                'before': before, 'after': after, 'answer': answer, 'distractors': distractors,
                'cue': cue or base['meaning'], 'furigana': furigana, 'vocabulary': vocabulary,
                'order': {'example': example, 'translation': indonesian, 'tokens': tokens, 'accepted': sorted(accepted)},
            })
            counts[base['chapter']] += 1
    assert counts == Counter({c: 20 for c in range(1, 51)}), counts
    assert set(swaps) <= families, 'Unknown family in ordering alternatives'
    return questions
