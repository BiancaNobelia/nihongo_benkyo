import {readFileSync, writeFileSync} from 'node:fs';
import {KOTOBA_COURSES} from '../kotoba-courses.js';
import {meaningKeys} from '../kotoba-core.js';
import {KANJI} from '../kanji-data.js';
import {kanjiExamples} from '../kanji-examples.js';
import {BUNPOU_ENTRIES} from '../bunpou-data.js';
import {HENKAN_VERBS} from '../henkan-data.js';
import {conjugateVerb, spellForm} from '../henkan-core.js';
import {PRACTICE_BANKS} from '../practice-banks.js';
import {JLPT_FURIGANA} from '../jlpt-furigana-data.js';

const path = name => new URL('../data/' + name, import.meta.url);
const dictionary = JSON.parse(readFileSync(path('kanji-sentences.json'))).entries;
const key = (word, reading) => word + '|' + reading;
const kana = text => text.normalize('NFKC').replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 96));
const han = /\p{Script=Han}/u;
const segmenter = new Intl.Segmenter('ja', {granularity: 'word'});
const indonesian = text => ' ' + text.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, ' ').trim() + ' ';
const glosses = new Map();
for (const card of KANJI) {
  for (const word of kanjiExamples(card)) {
    const id = key(word.word, word.reading);
    if (!glosses.has(id)) glosses.set(id, meaningKeys(word.meaning));
  }
}

const forms = new Map();
for (const verb of HENKAN_VERBS) {
  const readings = conjugateVerb(verb);
  const variants = Object.fromEntries(['jisho', 'masu', 'te', 'ta'].map(form =>
    [form, [spellForm(verb, readings[form], form), readings[form]]]));
  for (const form of [variants.jisho, variants.masu]) forms.set(key(...form), Object.values(variants));
}

const byReading = new Map();
for (const [id, record] of Object.entries(dictionary)) {
  const [word, reading] = id.split('|');
  const sound = kana(reading);
  if (!byReading.has(sound)) byReading.set(sound, []);
  byReading.get(sound).push({word, record, gloss:glosses.get(id) || []});
}

function entryForms(entry) {
  const word = entry.spelling || entry.reading;
  const formsForEntry = [[word, entry.reading], ...(forms.get(key(word, entry.reading)) || [])];
  if (entry.type === 'kata kerja' && word.endsWith('ます') && entry.reading.endsWith('ます')) {
    formsForEntry.push([word.replace(/ます$/, 'ました'), entry.reading.replace(/ます$/, 'ました')]);
  }
  return formsForEntry;
}

const corpus = new Map();
function add(record) {
  if (record.text && record.translation && record.furigana && !corpus.has(record.text)) {
    corpus.set(record.text, record);
  }
}
for (const record of Object.values(dictionary)) add(record);
for (const {example, translation, furigana, id} of BUNPOU_ENTRIES) {
  add({text:example, translation, furigana, origin:'local-bunpou', reference:id});
}
for (const {sentence, word, reading, sentenceMeaning, id} of PRACTICE_BANKS['jlpt-reading']) {
  if (!sentence || !sentence.includes('{target}')) continue;
  const spans = JLPT_FURIGANA.get(JSON.stringify([sentence, word, reading]));
  if (!spans) continue;
  const [before, after] = sentence.split('{target}');
  const offsets = [0, before.length, before.length + word.length];
  const furigana = spans.flatMap((part, i) => part.map(([start, written, spoken]) => [start + offsets[i], written, spoken]));
  add({text:before + word + after, translation:sentenceMeaning, furigana, origin:'local-jlpt', reference:id});
}

// Scan only complete word boundaries. For kanji the source annotations must
// cover each kanji and confirm the reading of this exact occurrence.
const byWord = new Map();
const allEntries = Object.values(KOTOBA_COURSES).flatMap(course => course.entries);
for (const entry of allEntries) {
  for (const [form] of entryForms(entry)) byWord.set(form, []);
}
const maxLength = Math.max(...[...byWord.keys()].map(word => word.length));
for (const record of corpus.values()) {
  const boundaries = [...segmenter.segment(record.text)].map(({index}) => index);
  boundaries.push(record.text.length);
  const targetGloss = indonesian(record.translation);
  const readings = new Map(record.furigana.map(span => [span[0], span]));
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    let endIndex = i + 1;
    for (let end = boundaries[endIndex]; end !== undefined && end - start <= maxLength; end = boundaries[++endIndex]) {
      const written = record.text.slice(start, end);
      if (!byWord.has(written)) continue;
      let spoken = '';
      for (let i = start; i < end;) {
        const span = readings.get(i);
        if (span && i + span[1].length <= end) {
          spoken += span[2];
          i += span[1].length;
        } else if (han.test(record.text[i])) {
          spoken = null;
          break;
        } else {
          spoken += record.text[i++];
        }
      }
      if (spoken) byWord.get(written).push({record, start, end, reading:kana(spoken), targetGloss});
    }
  }
}

const curated = new Map();
const authored = readFileSync(path('kotoba-sentences-editorial.tsv'), 'utf8');
for (const line of authored.trim().split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const [word, reading, marked, translation, sense = ''] = line.split('\t');
  const start = marked.indexOf('【');
  const end = marked.indexOf('】');
  if (!word || !reading || start < 0 || end <= start + 1 || !translation
      || marked.lastIndexOf('【') !== start || marked.lastIndexOf('】') !== end) throw new Error(line);
  const text = marked.replace('【', '').replace('】', '');
  const id = key(word, reading);
  const records = curated.get(id) || [];
  records.push({sense, record:{text, translation, furigana:[], origin:'original', targetStart:start, targetLength:end - start - 1}});
  curated.set(id, records);
}

function match(entry) {
  const word = entry.spelling || entry.reading;
  const id = key(word, entry.reading);
  const senses = meaningKeys(entry.meaning);
  const manual = curated.get(id)?.find(({sense}) => !sense || entry.meaning.toLowerCase().includes(sense));
  if (manual) return manual.record;

  const direct = dictionary[id];
  const agrees = translation => senses.some(sense => translation.includes(indonesian(sense)));
  if (direct && agrees(indonesian(direct.translation))) return direct;
  const variants = entryForms(entry);
  for (const [written, reading] of variants) {
    const candidate = byWord.get(written)?.find(value => value.reading === kana(reading) && agrees(value.targetGloss));
    if (candidate) {
      const {record,start,end} = candidate;
      return {...record, targetStart:start, targetLength:end-start};
    }
  }

  // The sentence bank's vocabulary gloss also covers cases where the
  // Indonesian sentence uses a different inflection or a paraphrase.
  if (direct && glosses.get(id)?.some(sense => senses.includes(sense))) return direct;
  for (const [written, reading] of variants) {
    const variant = key(written, reading);
    if (dictionary[variant] && glosses.get(variant)?.some(sense => senses.includes(sense))) return dictionary[variant];
  }
  // A kana spelling can correspond to several kanji words. Require both
  // the dictionary gloss and the translation to agree before using one.
  for (const [written, reading] of variants) {
    const alternative = byReading.get(kana(reading))?.find(candidate =>
      (!han.test(written) || !han.test(candidate.word))
      && candidate.gloss.some(sense => senses.includes(sense))
      && agrees(indonesian(candidate.record.translation)));
    if (alternative) return alternative.record;
  }
  return undefined;
}

const entries = {};
const records = [];
const recordIds = new Map();
for (const course of Object.values(KOTOBA_COURSES)) {
  let found = 0;
  for (const entry of course.entries) {
    const record = match(entry);
    if (!record) continue;
    const identity = JSON.stringify(record);
    if (!recordIds.has(identity)) {
      recordIds.set(identity, records.length);
      records.push(record);
    }
    entries[entry.id] = recordIds.get(identity);
    found++;
  }
  console.log(course.id + ': ' + found + '/' + course.entries.length);
}
const output = {version:1, entries, records};
writeFileSync(path('kotoba-sentences.json'), JSON.stringify(output) + '\n');
