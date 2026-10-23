"""Apply reviewed sentence-specific orthography without guessing homophones.

The published site has no tokenizer dependency. Revisions are keyed by the exact
source sentence; grammatical auxiliaries and conventional kana stay in kana.
"""
from prepare_kanji_sentences import hira, parse_annotated, valid_spans


def sentence_reading(text, spans):
    parts, cursor = [], 0
    for start, word, reading in spans:
        parts.extend([text[cursor:start], reading])
        cursor = start + len(word)
    parts.append(text[cursor:])
    return hira(''.join(parts))


def revise_sentence(record, revisions, variant=None):
    source = record['text']
    if source not in revisions:
        return record
    if variant:
        assert variant['source'] == source, ('Stale reading variant', source)
    text, spans = parse_annotated(variant['annotation'] if variant else revisions[source])
    assert valid_spans(text, spans), ('Unannotated kanji', source)
    assert sentence_reading(text, spans) == sentence_reading(source, record['furigana']), ('Changed reading', source)
    revised = {**record, 'text': text, 'furigana': spans}
    if text != source and record['origin'] == 'tatoeba':
        revised.update(adapted=True, sourceText=record.get('sourceText', source))
    return revised
