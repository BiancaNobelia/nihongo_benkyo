import { RADICAL_MEMBERS } from './radical-members.js?v=20261015-particles-expanded';

const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('id').trim();
const cardText = card => [card.char,card.meaning,...card.on,...card.kun.map(r => r.replaceAll('.','')),card.example?.word,card.example?.reading].join(' ');
const exampleText = example => [example.char,example.word,example.reading,example.romaji,example.meaning].join(' ');

export function familiesForCharacter(families, char) {
  return families.filter(family => family.members.includes(char));
}

export function filterRadicalFamilies(families, kanji, query = '') {
  const search = normalize(query);
  const byChar = new Map(kanji.map(k => [k.char,k]));
  return families.filter(family => normalize([
    family.title,family.name,...family.forms,family.note,
    ...family.examples.map(exampleText),
    ...family.members.map(char => byChar.get(char)).filter(Boolean).map(cardText),
  ].join(' ')).includes(search));
}

export function filterRadicalKanji(family, kanji, {query = '', level = 'all', form = 'all'} = {}) {
  const members = new Set(family.members);
  const formMembers = form === 'all' ? members : new Set(family.forms.includes(form) ? [...RADICAL_MEMBERS[form]] : []);
  const search = normalize(query);
  return kanji.filter(k => members.has(k.char) && formMembers.has(k.char) &&
    (level === 'all' || k.level === level) &&
    normalize(`${cardText(k)} ${family.examples.filter(e => e.char === k.char).map(exampleText).join(' ')}`).includes(search))
    .sort((a,b) => Number(b.level.slice(1)) - Number(a.level.slice(1)) || a.strokes - b.strokes || a.char.codePointAt(0) - b.char.codePointAt(0));
}

export function paginateRadicals(items, page, pageSize = 24) {
  const pages = Math.max(1,Math.ceil(items.length / pageSize));
  const current = Math.max(1,Math.min(page,pages));
  const start = (current - 1) * pageSize;
  return {items:items.slice(start,start + pageSize),page:current,pages,start,total:items.length};
}
