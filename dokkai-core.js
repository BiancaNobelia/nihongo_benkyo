import {shuffle} from './core.js?v=20261016-dokkai';

export const DOKKAI_HISTORY_KEY = 'nihongo-benkyo-dokkai-exposure-v1';
const annotated = /\{([^{}|]+)\|([^{}|]+)\}/g;
export const dokkaiPlain = text => String(text).replace(annotated, '$1');
export function dokkaiMarkup(text, escape, furigana = false) {
  let html = '', cursor = 0;
  for (const match of String(text).matchAll(annotated)) {
    html += escape(text.slice(cursor, match.index));
    html += furigana ? `<ruby>${escape(match[1])}<rt>${escape(match[2])}</rt></ruby>` : escape(match[1]);
    cursor = match.index + match[0].length;
  }
  return html + escape(text.slice(cursor));
}
export const dokkaiPool = (passages, level = 'all') => passages.filter(p => level === 'all' || p.level === level);
export function cleanDokkaiHistory(raw, passages) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(passages.flatMap(p => p.questions)
    .filter(q => Number.isSafeInteger(raw[q.id]) && raw[q.id] > 0)
    .map(q => [q.id, Math.min(raw[q.id], 1000000)]));
}
export function mergeDokkaiHistory(current, stored, passages) {
  const merged = cleanDokkaiHistory(current, passages);
  for (const [id, count] of Object.entries(cleanDokkaiHistory(stored, passages))) {
    merged[id] = Math.max(merged[id] || 0, count);
  }
  return merged;
}
export function recordDokkaiShown(history, questions) {
  return {...history, ...Object.fromEntries(questions.map(q => [q.id, Math.min((history[q.id] || 0) + 1, 1000000)]))};
}
export function createDokkaiSession(passages, {level = 'N5', count = 10} = {}, history = {}, random = Math.random) {
  if (!Number.isInteger(count) || count < 1) return [];
  const pool = shuffle(dokkaiPool(passages, level), random);
  const tiers = [...new Set(pool.flatMap(p => p.questions.map(q => history[q.id] || 0)))].sort((a,b) => a-b);
  const chosen = new Set();
  // Prioritize unseen questions globally, while keeping each passage together.
  for (const tier of tiers) for (const passage of pool) for (const q of passage.questions) {
    if (chosen.size < count && (history[q.id] || 0) === tier) chosen.add(q.id);
  }
  return pool.map(p => ({passage: p, questions: p.questions.filter(q => chosen.has(q.id))
    .map(q => ({...q, options: shuffle(q.options, random)}))})).filter(group => group.questions.length);
}
export function gradeDokkai(group, selected) {
  return group.questions.map(q => {
    const choice = selected[q.id];
    const chosen = q.options.some(option => option.id === choice) ? choice : null;
    return {id: q.id, chosen, correct: chosen === q.answer};
  });
}
