// Export the exact displayed vocabulary and existing reviewed sentence material.
import {writeFileSync,mkdirSync} from 'node:fs';
import {KANJI} from '../kanji-data.js';
import {kanjiExamples} from '../kanji-examples.js';
import {getQuizPool} from '../practice-banks.js';
import {JLPT_FURIGANA} from '../jlpt-furigana-data.js';
import {BUNPOU_ENTRIES} from '../bunpou-data.js';
import {KOTOBA_ENTRIES} from '../kotoba-data.js';
import {KOTOBA_N3_ENTRIES} from '../kotoba-n3-data.js';

const root=new URL('../.cache/',import.meta.url);
mkdirSync(root,{recursive:true});
const save=(name,data)=>writeFileSync(new URL(name,root),JSON.stringify(data,null,2));
save('sentence-example-words.json',[...new Map(KANJI.flatMap(kanjiExamples).map(e=>[`${e.word}|${e.reading}`,e])).values()]);
save('sentence-example-quiz.json',getQuizPool('jlpt-reading').map(q=>({...q,spans:JLPT_FURIGANA.get(JSON.stringify([q.sentence,q.word,q.reading]))})));
save('sentence-example-bunpou.json',BUNPOU_ENTRIES.map(q=>({text:q.example,translation:q.translation,furigana:q.furigana,id:q.id})));
save('sentence-example-types.json',[...KOTOBA_ENTRIES,...KOTOBA_N3_ENTRIES].map(q=>({word:q.spelling,reading:q.reading,type:q.type})));
save('sentence-example-cards.json',KANJI.map(k=>({char:k.char,level:k.level,keys:kanjiExamples(k).map(e=>`${e.word}|${e.reading}`)})));
