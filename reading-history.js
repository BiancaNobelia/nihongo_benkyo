// Counts use the displayed word and its explicit context, rather than a bank ID.
// This survives merging banks and keeps date/duration questions distinct.
export const READING_HISTORY_KEY = 'nihongo-benkyo-reading-exposure-v1';
export const readingQuestionKey = q => JSON.stringify([
  String(q.word || q.prompt || '').normalize('NFKC').trim(), q.contextKey || '',
]);

export function cleanReadingHistory(raw, pool) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries([...new Set(pool.map(readingQuestionKey))]
    .filter(key => Number.isSafeInteger(raw[key]) && raw[key] > 0)
    .map(key => [key, raw[key]]));
}

export function recordReadingShown(history, question) {
  const key = readingQuestionKey(question);
  const previous = history[key];
  return {...history, [key]: (Number.isSafeInteger(previous) && previous > 0 ? previous : 0) + 1};
}

export function readingHistorySummary(pool, history) {
  const counts = [...new Set(pool.map(readingQuestionKey))].map(key => history[key] || 0);
  const leastSeen = counts.length ? Math.min(...counts) : 0;
  return {total:counts.length, unseen:counts.filter(n => n === 0).length,
    round:leastSeen + 1, remaining:counts.filter(n => n === leastSeen).length};
}
