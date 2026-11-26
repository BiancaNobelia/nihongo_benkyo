import { KOTOBA_CHAPTERS } from './kotoba-data.js?v=20261015-jidoushi-tadoushi';
import { MATERIAL_KOTOBA_ENTRIES } from './materi-kotoba-data.js?v=20261126-kotoba-photo-16-18';
import { KOTOBA_N3_ENTRIES } from './kotoba-n3-data.js?v=20261015-jidoushi-tadoushi';

const minnaChapterCounts = new Map();
for (const {chapter} of MATERIAL_KOTOBA_ENTRIES) {
  minnaChapterCounts.set(chapter, (minnaChapterCounts.get(chapter) ?? 0) + 1);
}
const minnaChapters = KOTOBA_CHAPTERS.map(chapter => ({
  ...chapter, count: minnaChapterCounts.get(chapter.number) ?? 0,
}));

export const KOTOBA_COURSES = {
  minna: {id:'minna', label:'Minna no Nihongo I & II', short:'Minna no Nihongo', subtitle:'Bab 1–50', entries:MATERIAL_KOTOBA_ENTRIES, chapters:minnaChapters},
  n3: {id:'n3', label:'JLPT N3', short:'JLPT N3', subtitle:'Kompilasi kosakata N3', entries:KOTOBA_N3_ENTRIES, chapters:[]},
};
export const KOTOBA_SOURCE_GROUPS = {all:'Semua kosakata', core:'Kosakata inti', extra:'Kosakata tambahan'};
export const kotobaCourse = id => Object.hasOwn(KOTOBA_COURSES,id) ? KOTOBA_COURSES[id] : KOTOBA_COURSES.minna;
