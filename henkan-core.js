import { shuffle } from './core.js?v=20261015-henkan';

export const HENKAN_LEVELS = ['N5','N4','N3'];
export const VERB_GROUPS = {godan:'Golongan I · Godan',ichidan:'Golongan II · Ichidan',suru:'Golongan III · する',kuru:'Golongan III · 来る'};
export const HENKAN_MODES = {
  futsu:{label:'Futsū-kei',ja:'普通形',description:'Empat bentuk biasa',forms:['jisho','nai','ta','nakatta']},
  jisho:{label:'Jisho-kei',ja:'辞書形',description:'Bentuk kamus',forms:['jisho']},
  te:{label:'Te-kei',ja:'て形',description:'Bentuk penghubung',forms:['te']},
  ta:{label:'Ta-kei',ja:'た形',description:'Lampau positif',forms:['ta']},
  nai:{label:'Nai-kei',ja:'ない形',description:'Negatif nonlampau',forms:['nai']},
  potential:{label:'Potensial',ja:'可能形',description:'Bisa / mampu',forms:['potential']},
  passive:{label:'Pasif',ja:'受身形',description:'Menerima tindakan',forms:['passive']},
};
export const FORM_LABELS = {jisho:'Jisho-kei · bentuk kamus',te:'Te-kei · bentuk て',ta:'Ta-kei · lampau positif',nai:'Nai-kei · negatif nonlampau',nakatta:'Futsū-kei · negatif lampau',potential:'Potensial · bentuk kemampuan',passive:'Pasif · bentuk menerima tindakan'};
export const FORM_MEANINGS = {jisho:'Bentuk biasa positif nonlampau: kebiasaan, keadaan sekarang, atau tindakan mendatang sesuai konteks.',te:'Bentuk penghubung. Maknanya ditentukan oleh pola lanjutannya, misalnya ～てください untuk permintaan.',ta:'Bentuk biasa lampau positif: tindakan atau keadaan yang sudah terjadi.',nai:'Bentuk biasa negatif nonlampau: tidak melakukan atau tidak berada dalam keadaan tersebut.',nakatta:'Bentuk biasa negatif lampau: tidak melakukan atau tidak berada dalam keadaan tersebut pada masa lalu.',potential:'Menyatakan kemampuan atau kemungkinan melakukan tindakan: bisa / dapat.',passive:'Menyatakan menerima tindakan atau terkena dampaknya. Pada verba intransitif, pasif dapat menyatakan dampak yang dialami seseorang.'};
const ROWS={う:['わ','い','え','って'],く:['か','き','け','いて'],ぐ:['が','ぎ','げ','いで'],す:['さ','し','せ','して'],つ:['た','ち','て','って'],ぬ:['な','に','ね','んで'],ぶ:['ば','び','べ','んで'],む:['ま','み','め','んで'],る:['ら','り','れ','って']};
const honorificMasu = r => ['くださる','いらっしゃる','おっしゃる','なさる','ござる'].some(s=>r.endsWith(s));

export function conjugateVerb(v) {
  const r=v.reading, stem=r.slice(0,-1), forms={jisho:r};
  if(v.group==='godan') {
    const row=ROWS[r.at(-1)];if(!row)throw new Error(`Invalid godan: ${r}`);
    const [a,i,e,te]=row;
    forms.masu=stem+(honorificMasu(r)?'い':i)+'ます';
    forms.nai=r==='ある'?'ない':stem+a+'ない';
    forms.te=stem+((r.endsWith('いく') || r.endsWith('ゆく')) && /行く$/.test(v.word)?'って':te);
    forms.potential=stem+e+'る';forms.passive=stem+a+'れる';
  } else if(v.group==='ichidan') {
    if(!r.endsWith('る'))throw new Error(`Invalid ichidan: ${r}`);
    Object.assign(forms,{masu:stem+'ます',nai:stem+'ない',te:stem+'て',potential:stem+'られる',passive:stem+'られる'});
  } else if(v.group==='suru') {
    if(!r.endsWith('する'))throw new Error(`Invalid suru: ${r}`);
    const s=r.slice(0,-2);
    Object.assign(forms,{masu:s+'します',nai:s+'しない',te:s+'して',potential:s+'できる',passive:s+'される'});
    if(v.special==='single-suru')forms.potential=s+'せる';
  } else if(v.group==='kuru') {
    if(!r.endsWith('くる'))throw new Error(`Invalid kuru: ${r}`);
    const s=r.slice(0,-2);
    Object.assign(forms,{masu:s+'きます',nai:s+'こない',te:s+'きて',potential:s+'こられる',passive:s+'こられる'});
  } else throw new Error(`Unknown verb group: ${v.group}`);
  if(v.naiOverride)forms.nai=v.naiOverride;
  Object.assign(forms,v.formOverrides||{});
  forms.ta=forms.te.slice(0,-1)+(forms.te.endsWith('で')?'だ':'た');
  forms.nakatta=forms.nai.slice(0,-1)+'かった';
  const politeStem=forms.masu.slice(0,-2);
  Object.assign(forms,{masen:politeStem+'ません',mashita:politeStem+'ました',masendeshita:politeStem+'ませんでした'});
  if(v.noPotential)delete forms.potential;
  if(v.noPassive)delete forms.passive;
  return forms;
}

export function spellForm(v, reading) {
  if(v.group==='kuru' && v.word.endsWith('来る'))return v.word.slice(0,-1)+reading.slice(v.reading.length-1);
  let common=0;while(common<v.reading.length && v.reading[common]===reading[common])common++;
  // Only replace the kana ending, never cut a kanji stem because its reading changed.
  const removed=v.reading.length-common;
  return removed<=v.word.length && !/\p{Script=Han}/u.test(v.word.slice(v.word.length-removed))
    ? v.word.slice(0,v.word.length-removed)+reading.slice(common) : reading;
}

export function acceptedAnswers(v, form) {
  const f=conjugateVerb(v), accepted=[f[form]];
  accepted.push(...(v.acceptedForms?.[form]||[]));
  if(form==='nai')accepted.push(...(v.acceptedNai||[]));
  if(form==='nakatta')accepted.push(...(v.acceptedNai||[]).map(s=>s.slice(0,-1)+'かった'));
  if(form==='potential' && ['ichidan','kuru'].includes(v.group) && f.potential)accepted.push(f.potential.replace(/られる$/,'れる'));
  if(form==='jisho' && v.word==='得る')accepted.push('うる');
  if(form==='jisho' && v.special==='single-suru')accepted.push(v.reading.slice(0,-1));
  return [...new Set(accepted.filter(Boolean))];
}

export function formExplanation(v,form) {
  const r=v.reading,s=r.slice(0,-1),f=conjugateVerb(v);
  let rule='';
  if(form==='jisho')rule='Bentuk kamus adalah bentuk dasar sebelum diubah menjadi bentuk sopan ～ます.';
  else if(form==='nakatta')rule=`Mulai dari ${f.nai}, lalu ganti akhiran ない menjadi なかった.`;
  else if(v.group==='kuru')rule=`来る dibaca くる, tetapi menjadi き dalam きます・きて・きた dan こ dalam こない・こられる. Bagian sebelum 来る tetap.`;
  else if(v.group==='suru') {
    rule=v.special==='single-suru' ? 'Kata ini adalah gabungan satu kanji dengan する dan memiliki perubahan khusus; gunakan bentuk pada contoh ini.' : `Akhiran する berubah menjadi ${{te:'して',ta:'した',nai:'しない',potential:'できる',passive:'される'}[form]}. Bagian sebelum する tetap.`;
  } else if(v.group==='ichidan')rule=`Hilangkan る dari ${r}, lalu tambahkan ${{te:'て',ta:'た',nai:'ない',potential:'られる',passive:'られる'}[form]}.`;
  else if(form==='nai')rule=r==='ある'?'Pengecualian: bentuk negatif ある adalah ない, bukan あらない.':`Ubah ${r.at(-1)} menjadi ${ROWS[r.at(-1)][0]}, lalu tambahkan ない${r.endsWith('う')?' (う berubah menjadi わ, bukan あ)':''}.`;
  else if(form==='te'||form==='ta')rule=v.formOverrides?.te?`Pengecualian ${v.word}: bentuk て adalah ${f.te} dan bentuk た adalah ${f.ta}.`:/行く$/.test(v.word)?'Pengecualian 行く: bentuk て adalah いって dan bentuk た adalah いった.':`Akhiran ${r.at(-1)} berubah menjadi ${f[form].slice(s.length)} dalam bentuk ${form==='te'?'て':'た'}.`;
  else rule=form==='potential'?`Ubah bunyi akhir ${r.at(-1)} ke baris e (${ROWS[r.at(-1)][2]}), lalu tambahkan る.`:`Ubah bunyi akhir ${r.at(-1)} ke baris a (${ROWS[r.at(-1)][0]}), lalu tambahkan れる.`;
  if(['potential','passive'].includes(form)&&['ichidan','kuru'].includes(v.group))rule+=' Bentuk potensial dan pasif sama-sama memakai られる; maknanya dibedakan oleh konteks.';
  return `${VERB_GROUPS[v.group]}. ${rule}`;
}

export function henkanPool(verbs,{level='N5',modes=['te']}={}) {
  if(!HENKAN_LEVELS.includes(level)&&level!=='all')return [];
  const forms=[...new Set(modes.flatMap(m=>HENKAN_MODES[m]?.forms||[]))];
  return verbs.filter(v=>level==='all'||v.level===level).flatMap(v=>{
    const conjugations=conjugateVerb(v);
    return forms.filter(form=>conjugations[form]).map(form=>({id:`${v.id}:${form}`,verb:v,form,answer:conjugations[form]}));
  });
}

export function henkanOptions(v,form,random=Math.random) {
  const f=conjugateVerb(v),answer=f[form],r=v.reading,stem=r.slice(0,-1);
  if(!answer)return [];
  const accepted=new Set(acceptedAnswers(v,form));
  const errors={
    te:[stem+'て',stem+'って',stem+'いて',stem+'んで',f.masu.slice(0,-2)+'て'],
    ta:[stem+'た',stem+'った',stem+'いた',stem+'んだ',f.masu.slice(0,-2)+'た'],
    nai:[stem+'ない',stem+'らない',stem+'あない',f.masu.slice(0,-2)+'ない'],
    potential:[stem+'れる',stem+'られる',stem+'える',r+'できる'],
    passive:[stem+'れる',stem+'られる',stem+'われる',stem+'される'],
    jisho:[f.masu.slice(0,-2)+'る',stem+'る',stem+'う',stem+'す'],
    nakatta:[f.nai+'かった',stem+'なかった',f.ta+'ない'],
  };
  if(v.group==='suru') {
    const s=r.slice(0,-2);
    Object.assign(errors,{te:[s+'すって',s+'すて',s+'しで'],ta:[s+'すった',s+'すた',s+'しだ'],nai:[s+'すない',s+'さない',s+'せない'],jisho:[s+'しる',s+'す',s+'すう'],potential:[s+'される',s+'しれる',s+'しられる'],passive:[s+'させる',s+'しられる',s+'すられる'],nakatta:[s+'すなかった',s+'さなかった',s+'しないかった']});
  } else if(v.group==='kuru') {
    const s=r.slice(0,-2);
    Object.assign(errors,{te:[s+'くて',s+'こて',s+'きって'],ta:[s+'くた',s+'こた',s+'きった'],nai:[s+'くない',s+'きない',s+'くらない'],jisho:[s+'きる',s+'こる',s+'くう'],potential:[s+'くられる',s+'きられる',s+'くれる'],passive:[s+'くられる',s+'きられる',s+'くれる'],nakatta:[s+'くなかった',s+'きなかった',s+'こないかった']});
  }
  // Include other real conjugations as well as common group/end-sound errors.
  // Accepted variants (including colloquial ra-nuki) are never marked wrong.
  const mistakes=shuffle([...new Set(errors[form]||[])].filter(s=>s&&!accepted.has(s)),random);
  const otherForms=shuffle([...new Set(Object.values(f))].filter(s=>s&&!accepted.has(s)),random);
  const unique=[...new Set([...mistakes.slice(0,2),...otherForms,...mistakes.slice(2)])];
  return shuffle([answer,...unique.slice(0,3)],random);
}

export function createHenkanQuiz(verbs,settings={},history={},random=Math.random) {
  const {count=10,modes=['te']}=settings;
  if(!Number.isSafeInteger(count)||count<1)return [];
  const pool=shuffle(henkanPool(verbs,settings),random).sort((a,b)=>(history[a.id]||0)-(history[b.id]||0));
  // Rotate unseen exercises first. Within that tier spread words and form types.
  const questions=[],usedWords=new Set(),formCounts={};
  while(pool.length&&questions.length<count) {
    const tier=history[pool[0].id]||0;
    let candidates=pool.filter(q=>(history[q.id]||0)===tier);
    if(candidates.some(q=>!usedWords.has(q.verb.id)))candidates=candidates.filter(q=>!usedWords.has(q.verb.id));
    candidates.sort((a,b)=>(formCounts[a.form]||0)-(formCounts[b.form]||0));
    const q=candidates[0];pool.splice(pool.indexOf(q),1);usedWords.add(q.verb.id);formCounts[q.form]=(formCounts[q.form]||0)+1;
    const f=conjugateVerb(q.verb);
    const isFutsu=modes.includes('futsu')&&['jisho','nai','ta','nakatta'].includes(q.form);
    const promptKey=isFutsu?({jisho:'masu',nai:'masen',ta:'mashita',nakatta:'masendeshita'}[q.form]):'masu';
    questions.push({...q,prompt:f[promptKey],promptWord:spellForm(q.verb,f[promptKey]),isFutsu,options:henkanOptions(q.verb,q.form,random)});
  }
  return questions;
}

export const HENKAN_HISTORY_KEY='nihongo-benkyo-henkan-history-v1';
export function cleanHenkanHistory(raw,verbs) {
  const valid=new Set(henkanPool(verbs,{level:'all',modes:Object.keys(HENKAN_MODES)}).map(q=>q.id));
  return Object.fromEntries(Object.entries(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}).filter(([id,n])=>valid.has(id)&&Number.isSafeInteger(n)&&n>0));
}
export function recordHenkanShown(history,id) {return {...history,[id]:Math.min((history[id]||0)+1,Number.MAX_SAFE_INTEGER)};}
