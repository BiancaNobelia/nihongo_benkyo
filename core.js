import { wordReadingDistractors } from './word-reading-options.js?v=20261015-word-reading';

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
    const wordChoices=mode==='reading' ? wordReadingDistractors(k,random) : null;
    const accepted = new Set(mode === 'reading' ? [answer, ...(k.example.readings || [])] : [answer]);
    const candidates = wordChoices ? [] : eligible.filter(other => other.char !== k.char
      && ![...meaningSets.get(k.char)].some(sense => meaningSets.get(other.char).has(sense)));
    const distractors = wordChoices?.distractors || shuffle([...new Set(candidates.map(getAnswer))].filter(a => !accepted.has(a)),random).slice(0,3);
    return { kanji:k, level:k.quizLevel || k.level,
      word:mode==='reading' ? k.example.word : k.char,
      meaning:mode==='reading' ? k.example.meaning : k.meaning,
      reading:mode==='reading' ? k.example.reading : '',
      prompt: mode === 'kanji' ? k.meaning : mode === 'reading' ? k.example.word : k.char,
      ...(wordChoices ? {readingAlternatives:wordChoices.readingAlternatives,wordDistractors:wordChoices.wordDistractors} : {}),
      answer, options: shuffle([answer, ...distractors], random) };
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
  const historyModes=['bunpou-order','bunpou','henkan','meaning','kanji','reading','jlpt-reading','hiragana-kanji','hiragana-katakana','english-katakana','kotoba-jp-id','kotoba-id-jp','kotoba-reading','kotoba-audio-jp','kotoba-audio-id'];
  const history = Array.isArray(safe.history) ? safe.history.filter(h => h && Number.isInteger(h.total) && h.total > 0 && h.total <= (h.mode==='henkan' ? 20000 : data.length) && Number.isInteger(h.correct) && h.correct >= 0 && h.correct <= h.total && typeof h.date === 'string' && !Number.isNaN(Date.parse(h.date)) && historyModes.includes(h.mode)).slice(-50).map(h=>h.mode.startsWith('kotoba-') ? {...h,course:h.course==='n3' ? 'n3' : 'minna',sourceGroup:['core','extra'].includes(h.sourceGroup) ? h.sourceGroup : 'all',chapters:h.course==='n3' ? [] : Array.isArray(h.chapters) ? [...new Set(h.chapters.filter(n=>Number.isInteger(n) && n>=1 && n<=50))] : []} : ['bunpou','bunpou-order'].includes(h.mode) ? {...h,chapters:Array.isArray(h.chapters)?[...new Set(h.chapters.filter(n=>Number.isInteger(n)&&n>=1&&n<=50))]:[]} : h) : [];
  return { known: list(safe.known), saved: list(safe.saved), days, history };
}
