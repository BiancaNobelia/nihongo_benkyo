import {KANJI} from './kanji-data.js?v=20261015-jidoushi-tadoushi';
import {KOTOBA_ENTRIES} from './kotoba-data.js?v=20261015-jidoushi-tadoushi';
import {KOTOBA_N3_ENTRIES} from './kotoba-n3-data.js?v=20261015-jidoushi-tadoushi';
import {PRACTICE_BANKS} from './practice-banks.js?v=20261015-jidoushi-tadoushi';
import {KANJI_EXAMPLE_SUPPLEMENTS,KANJI_EXAMPLE_GLOSSES} from './kanji-example-supplements.js?v=20261023-examples';

const levelRank = {N5:0, N4:1, N3:2, N2:3, N1:4};
const keyOf = e => `${e.word}\0${e.reading}`;
const isVocabulary = e => e && typeof e.word === 'string' && typeof e.reading === 'string'
  && typeof e.meaning === 'string' && e.meaning.trim()
  && /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々ヶ・0-9]+$/u.test(e.word)
  && /^[ぁ-ゖァ-ヺー・]+$/.test(e.reading);

// Only use real vocabulary/correct answers, never generated quiz distractors.
export function buildKanjiExampleIndex(cards, vocabulary) {
  const levels = new Map(cards.map(k => [k.char, levelRank[k.level] ?? 4]));
  const unique = new Map();
  for (const e of [...cards.flatMap(k => k.example ? [k.example] : []), ...vocabulary]) {
    if (!isVocabulary(e)) continue;
    const rank = e.rank ?? Math.max(0, ...[...e.word].map(char => levels.get(char) ?? 0));
    const key = keyOf(e);
    if (unique.has(key)) {
      unique.get(key).rank = Math.min(unique.get(key).rank, rank);
    } else {
      unique.set(key, {word:e.word, reading:e.reading, meaning:e.meaning, rank});
    }
  }
  const index = new Map(cards.map(k => [k.char, []]));
  const sorted = [...unique.values()].sort((a,b) => a.rank-b.rank || a.word.length-b.word.length);
  for (const {rank, ...entry} of sorted) {
    for (const char of new Set(entry.word)) index.get(char)?.push(entry);
  }
  return index;
}

let index;
export function kanjiExamples(card) {
  index ??= buildKanjiExampleIndex(KANJI, [
    ...PRACTICE_BANKS['jlpt-reading'].map(e => ({...e, rank:levelRank[e.level] ?? 4})),
    ...KOTOBA_ENTRIES.map(e => ({word:e.spelling, reading:e.reading, meaning:e.meaning, rank:e.chapter<=25 ? 0 : 1})),
    ...KOTOBA_N3_ENTRIES.map(e => ({word:e.spelling, reading:e.reading, meaning:e.meaning, rank:2})),
    ...KANJI_EXAMPLE_SUPPLEMENTS,
  ]);
  const entries = index.get(card.char) || [];
  // Keep the familiar example at the top, while preserving distinct readings.
  const ordered = isVocabulary(card.example) && card.example.word.includes(card.char)
    ? [card.example, ...entries.filter(e => keyOf(e) !== keyOf(card.example))]
    : entries;
  return ordered.map(e => ({...e,meaning:KANJI_EXAMPLE_GLOSSES[`${e.word}|${e.reading}`] ?? e.meaning}));
}
