export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function filterKanji(data, { query = '', level = 'all', collection = 'all', known = [], saved = [] } = {}) {
  const search = query.trim().toLocaleLowerCase('id');
  return data.filter(k => (level === 'all' || k.level === level)
    && (collection !== 'saved' || saved.includes(k.char))
    && (collection !== 'known' || known.includes(k.char))
    && (collection !== 'new' || !known.includes(k.char))
    && (!search || [k.char, k.meaning, ...(k.meaningsEn || []), ...k.on, ...k.kun, ...k.kun.map(r => r.replaceAll('.', '')), k.example?.word, k.example?.reading, k.example?.meaning].join(' ').toLocaleLowerCase('id').includes(search)));
}
export function eligibleQuizCards(pool, mode) {
  return pool.filter(k => mode !== 'reading' || (k.example?.word && k.example?.reading));
}
function meanings(k) {
  return new Set([...(k.meaningsEn || []), ...k.meaning.split(';')]
    .map(s => s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/^to /, '').trim()).filter(Boolean));
}
export function createQuiz(pool, mode, count, random = Math.random) {
  const eligible = eligibleQuizCards(pool, mode);
  const getAnswer = k => mode === 'meaning' ? k.meaning : mode === 'kanji' ? k.char : k.example.reading;
  const meaningSets = new Map(eligible.map(k => [k.char, meanings(k)]));
  return shuffle(eligible, random).slice(0, Math.min(count, eligible.length)).map(k => {
    const answer = getAnswer(k);
    const accepted = new Set(mode === 'reading' ? [answer, ...(k.example.readings || [])] : [answer]);
    const candidates = eligible.filter(other => other.char !== k.char && (mode === 'reading'
      ? !accepted.has(getAnswer(other))
      : ![...meaningSets.get(k.char)].some(sense => meaningSets.get(other.char).has(sense))));
    const distractors = [...new Set(candidates.map(getAnswer))].filter(a => !accepted.has(a));
    return { kanji: k, prompt: mode === 'kanji' ? k.meaning : mode === 'reading' ? k.example.word : k.char,
      answer, options: shuffle([answer, ...shuffle(distractors, random).slice(0, 3)], random) };
  });
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function cleanProgress(raw, data) {
  const chars = new Set(data.map(k => k.char));
  const safe = raw && typeof raw === 'object' ? raw : {};
  const list = value => Array.isArray(value) ? [...new Set(value.filter(c => chars.has(c)))] : [];
  const days = Array.isArray(safe.days) ? [...new Set(safe.days.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-366) : [];
  const history = Array.isArray(safe.history) ? safe.history.filter(h => h && Number.isInteger(h.total) && h.total > 0 && h.total <= data.length && Number.isInteger(h.correct) && h.correct >= 0 && h.correct <= h.total && typeof h.date === 'string' && !Number.isNaN(Date.parse(h.date)) && ['meaning', 'kanji', 'reading'].includes(h.mode)).slice(-50) : [];
  return { known: list(safe.known), saved: list(safe.saved), days, history };
}
