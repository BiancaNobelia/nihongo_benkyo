import {VERB_GROUPS} from './henkan-core.js?v=20261015-jidoushi-tadoushi';
import {HENKAN_VERBS} from './henkan-data.js?v=20261015-jidoushi-tadoushi';

const minnaVerbGroups = new Map(HENKAN_VERBS.flatMap(verb =>
  verb.sources.filter(source => source.startsWith('minna-row-'))
    .map(source => [source, VERB_GROUPS[verb.group]])));

export function materialVerbGroup(entry) {
  return entry.type === 'kata kerja' ? (VERB_GROUPS[entry.verbGroup] ?? minnaVerbGroups.get(entry.id)) : undefined;
}

// Keep chapter-specific entries, including vocabulary revisited in later chapters.
export function materialSearchKey(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('id')
    .replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function materialPool(entries, {book = 0, chapter = 0, query = ''} = {}) {
  const terms = materialSearchKey(query).trim().split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    if (book && (entry.chapter <= 25 ? 1 : 2) !== book) return false;
    if (chapter && entry.chapter !== chapter) return false;
    const text = materialSearchKey([
      entry.spelling, entry.reading, entry.meaning, entry.type, entry.pattern,
      entry.structure, entry.theme, entry.example, entry.translation, entry.note,
      ...(entry.furigana || []).map(span => span[2]),
    ].filter(Boolean).join(' '));
    return terms.every(term => text.includes(term));
  });
}

export function materialPage(entries, page = 1, size = 20) {
  const pages = Math.max(1, Math.ceil(entries.length / size));
  const current = Math.max(1, Math.min(page, pages));
  const start = (current - 1) * size;
  return {rows: entries.slice(start, start + size), page: current, pages,
    from: entries.length ? start + 1 : 0, to: Math.min(start + size, entries.length)};
}
