import { KANJI } from './kanji-data.js?v=20261015-jidoushi-tadoushi';
import { WRITING_CHOICE_KANJI } from './writing-choice-kanji-data.js?v=20261016-writing-feedback';

const byCharacter=new Map([...KANJI,...WRITING_CHOICE_KANJI].map(card=>[card.char,card]));

// Wrong spellings can be invented combinations. Explain their characters;
// never concatenate on/kun readings or pretend they have a whole-word meaning.
export function writingOptionDetails(question, word) {
  if(word===question.answer)return {word,reading:question.reading || question.prompt,meaning:question.meaning};
  const characters=[...new Set([...word].filter(char=>/\p{Unified_Ideograph}/u.test(char)))];
  return {word,characters:characters.map(char=>byCharacter.get(char)).filter(Boolean)};
}
