import { JLPT_FURIGANA } from './jlpt-furigana-data.js?v=20261016-jlpt-furigana';

export const READING_MODE_NAMES = {
  'jlpt-reading':'Kanji → Hiragana (JLPT)',
  reading:'Kanji → Hiragana (Per kata)',
};

export function usesSentence(question, mode) {
  return ['jlpt-reading','hiragana-kanji','hiragana-katakana'].includes(mode) && Boolean(question.sentence);
}

// Both the setup preview and actual question use this rendering contract.
// In word mode, a sentence attached to source data must never replace the word.
export function quizPromptMarkup(question, mode, escape, answered = false) {
  const word=question.prompt ?? question.word;
  if(!usesSentence(question,mode))return escape(word);
  const parts=question.sentence.split('{target}');
  if(parts.length!==2)throw new Error('A quiz sentence must contain exactly one target.');
  if(answered && mode==='jlpt-reading'){
    const spans=JLPT_FURIGANA.get(JSON.stringify([question.sentence,word,question.reading || question.answer]));
    if(spans)return `${rubyMarkup(parts[0],spans[0],escape)}<span class="writing-target">${rubyMarkup(word,spans[1],escape)}</span>${rubyMarkup(parts[1],spans[2],escape)}`;
  }
  return `${escape(parts[0])}<span class="writing-target">${escape(word)}</span>${escape(parts[1])}`;
}
function rubyMarkup(text,spans,escape) {
  let cursor=0,html='';
  for(const [start,word,reading] of spans){
    if(start<cursor || text.slice(start,start+word.length)!==word)return escape(text);
    html+=escape(text.slice(cursor,start))+`<ruby>${escape(word)}<rt>${escape(reading)}</rt></ruby>`;
    cursor=start+word.length;
  }
  return html+escape(text.slice(cursor));
}
