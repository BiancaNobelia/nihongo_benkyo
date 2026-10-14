export const READING_MODE_NAMES = {
  'jlpt-reading':'JLPT · Bacaan dalam kalimat',
  reading:'Kata/Kanji → Hiragana',
};

export function usesSentence(question, mode) {
  return ['jlpt-reading','hiragana-kanji','hiragana-katakana'].includes(mode) && Boolean(question.sentence);
}

// Both the setup preview and actual question use this rendering contract.
// In word mode, a sentence attached to source data must never replace the word.
export function quizPromptMarkup(question, mode, escape) {
  const word=question.prompt ?? question.word;
  if(!usesSentence(question,mode))return escape(word);
  const parts=question.sentence.split('{target}');
  if(parts.length!==2)throw new Error('A quiz sentence must contain exactly one target.');
  return `${escape(parts[0])}<span class="writing-target">${escape(word)}</span>${escape(parts[1])}`;
}
