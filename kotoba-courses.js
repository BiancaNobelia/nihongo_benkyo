import { KOTOBA_ENTRIES, KOTOBA_CHAPTERS } from './kotoba-data.js?v=20261015-bunpou-order';
import { KOTOBA_N3_ENTRIES } from './kotoba-n3-data.js?v=20261015-bunpou-order';

export const KOTOBA_COURSES = {
  minna: {id:'minna', label:'Minna no Nihongo I & II', short:'Minna no Nihongo', subtitle:'Bab 1–50', entries:KOTOBA_ENTRIES, chapters:KOTOBA_CHAPTERS},
  n3: {id:'n3', label:'JLPT N3', short:'JLPT N3', subtitle:'Kompilasi kosakata N3', entries:KOTOBA_N3_ENTRIES, chapters:[]},
};
export const KOTOBA_SOURCE_GROUPS = {all:'Semua kosakata', core:'Kosakata inti', extra:'Kosakata tambahan'};
export const kotobaCourse = id => Object.hasOwn(KOTOBA_COURSES,id) ? KOTOBA_COURSES[id] : KOTOBA_COURSES.minna;
