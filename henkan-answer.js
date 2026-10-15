import {acceptedAnswers,spellForm} from './henkan-core.js?v=20261015-jidoushi-tadoushi';
import {adjectiveAcceptedAnswers,conjugateAdjective} from './henkan-adjective-core.js?v=20261015-jidoushi-tadoushi';

export const HENKAN_ANSWER_MODES={choice:'Pilihan ganda',typing:'Ketik sendiri'};

// Preserve small kana, long vowels and dakuten: those change the answer.
export function normalizeHenkanAnswer(value) {
  return String(value??'').normalize('NFKC').replace(/\s+/gu,'')
    .replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).normalize('NFC');
}

export function henkanTypedAnswers(q) {
  let answers;
  if(q.adjective){
    const a=q.adjective,word=conjugateAdjective(a,true)[q.form];
    answers=[...adjectiveAcceptedAnswers(a,q.form),word];
    if(a.group==='na'&&['negative','negativePast'].includes(q.form))answers.push(word.replace(/じゃ(ない|なかった)$/,'では$1'));
  }else{
    // Sonkei questions request a specific pattern; another respectful pattern
    // must not be accepted just because it is valid in another context.
    const readings=q.form==='honorific'?[q.answer]:acceptedAnswers(q.verb,q.form);
    answers=readings.flatMap(reading=>[reading,spellForm(q.verb,reading,q.form)]);
  }
  return [...new Set(answers.filter(Boolean).map(normalizeHenkanAnswer))];
}

export function checkHenkanTypedAnswer(q,value) {
  const normalized=normalizeHenkanAnswer(value);
  return Boolean(normalized)&&henkanTypedAnswers(q).includes(normalized);
}
