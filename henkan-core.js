import { shuffle } from './core.js?v=20261015-bunpou-furigana';
import { honorificFor, honorificInstruction, honorificExplanation } from './henkan-honorific.js?v=20261015-bunpou-furigana';

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
  volitional:{label:'Ikō-kei',ja:'意向形',description:'Niat / ajakan · ～よう',forms:['volitional']},
  imperative:{label:'Meirei-kei',ja:'命令形',description:'Perintah langsung',forms:['imperative']},
  prohibitive:{label:'Kinshi-kei',ja:'禁止形',description:'Larangan · ～な',forms:['prohibitive']},
  conditional:{label:'Jōken-kei',ja:'条件形',description:'Syarat · ～ば',forms:['conditional']},
  causative:{label:'Shieki-kei',ja:'使役形',description:'Menyuruh / membiarkan',forms:['causative']},
  honorific:{label:'Sonkei-kei',ja:'尊敬形',description:'Menghormati pelaku',forms:['honorific']},
};
export const FORM_LABELS = {jisho:'Jisho-kei · bentuk kamus',te:'Te-kei · bentuk て',ta:'Ta-kei · lampau positif',nai:'Nai-kei · negatif nonlampau',nakatta:'Futsū-kei · negatif lampau',potential:'Potensial · bentuk kemampuan',passive:'Pasif · bentuk menerima tindakan'};
export const FORM_MEANINGS = {jisho:'Bentuk biasa positif nonlampau: kebiasaan, keadaan sekarang, atau tindakan mendatang sesuai konteks.',te:'Bentuk penghubung. Maknanya ditentukan oleh pola lanjutannya, misalnya ～てください untuk permintaan.',ta:'Bentuk biasa lampau positif: tindakan atau keadaan yang sudah terjadi.',nai:'Bentuk biasa negatif nonlampau: tidak melakukan atau tidak berada dalam keadaan tersebut.',nakatta:'Bentuk biasa negatif lampau: tidak melakukan atau tidak berada dalam keadaan tersebut pada masa lalu.',potential:'Menyatakan kemampuan atau kemungkinan melakukan tindakan: bisa / dapat.',passive:'Menyatakan menerima tindakan atau terkena dampaknya. Pada verba intransitif, pasif dapat menyatakan dampak yang dialami seseorang.'};
const ROWS={う:['わ','い','え','って'],く:['か','き','け','いて'],ぐ:['が','ぎ','げ','いで'],す:['さ','し','せ','して'],つ:['た','ち','て','って'],ぬ:['な','に','ね','んで'],ぶ:['ば','び','べ','んで'],む:['ま','み','め','んで'],る:['ら','り','れ','って']};
const honorificMasu = r => ['くださる','いらっしゃる','おっしゃる','なさる','ござる'].some(s=>r.endsWith(s));
const O_ROW={う:'お',く:'こ',ぐ:'ご',す:'そ',つ:'と',ぬ:'の',ぶ:'ぼ',む:'も',る:'ろ'};
const specialImperative = r => ['くださる','いらっしゃる','おっしゃる','なさる'].some(s=>r.endsWith(s));
const isKureru = v => v.word.endsWith('くれる');
Object.assign(FORM_LABELS,{
  volitional:'Ikō-kei · niat / ajakan',imperative:'Meirei-kei · perintah langsung',
  prohibitive:'Kinshi-kei · larangan ～な',conditional:'Jōken-kei · syarat ～ば',
  causative:'Shieki-kei · menyuruh / membiarkan',honorific:'Sonkei-kei · bentuk hormat (kamus)',
});
Object.assign(FORM_MEANINGS,{
  volitional:'Menyatakan niat atau ajakan: akan / mari melakukan. Makna tepatnya mengikuti konteks.',
  imperative:'Perintah langsung yang kuat, misalnya “lakukan!”. Berbeda dari permintaan sopan ～てください.',
  prohibitive:'Larangan langsung: “jangan lakukan!”. Bentuk kamus + な memberi larangan yang kuat.',
  conditional:'Menyatakan syarat: jika / kalau. Latihan ini khusus bentuk ～ば, bukan ～たら.',
  causative:'Menyuruh, membuat, atau membiarkan orang lain melakukan tindakan. Pilihan makna bergantung pada konteks.',
  honorific:'Menghormati orang yang melakukan tindakan. Dalam soal ini, guru melakukan tindakan tersebut; makna dasar kata kerjanya tetap.',
});

export function conjugateVerb(v) {
  const r=v.reading, stem=r.slice(0,-1), forms={jisho:r};
  if(v.group==='godan') {
    const row=ROWS[r.at(-1)];if(!row)throw new Error(`Invalid godan: ${r}`);
    const [a,i,e,te]=row;
    forms.masu=stem+(honorificMasu(r)?'い':i)+'ます';
    forms.nai=r==='ある'?'ない':stem+a+'ない';
    forms.te=stem+((r.endsWith('いく') || r.endsWith('ゆく')) && /行く$/.test(v.word)?'って':te);
    forms.potential=stem+e+'る';forms.passive=stem+a+'れる';
    Object.assign(forms,{volitional:stem+O_ROW[r.at(-1)]+'う',imperative:stem+(specialImperative(r)?'い':e),conditional:stem+e+'ば',causative:stem+a+'せる'});
  } else if(v.group==='ichidan') {
    if(!r.endsWith('る'))throw new Error(`Invalid ichidan: ${r}`);
    Object.assign(forms,{masu:stem+'ます',nai:stem+'ない',te:stem+'て',potential:stem+'られる',passive:stem+'られる'});
    Object.assign(forms,{volitional:stem+'よう',imperative:stem+(isKureru(v)?'':'ろ'),conditional:stem+'れば',causative:stem+'させる'});
  } else if(v.group==='suru') {
    if(!r.endsWith('する'))throw new Error(`Invalid suru: ${r}`);
    const s=r.slice(0,-2);
    Object.assign(forms,{masu:s+'します',nai:s+'しない',te:s+'して',potential:s+'できる',passive:s+'される'});
    Object.assign(forms,{volitional:s+'しよう',imperative:s+'しろ',conditional:s+'すれば',causative:s+'させる'});
    if(v.special==='single-suru')forms.potential=s+'せる';
  } else if(v.group==='kuru') {
    if(!r.endsWith('くる'))throw new Error(`Invalid kuru: ${r}`);
    const s=r.slice(0,-2);
    Object.assign(forms,{masu:s+'きます',nai:s+'こない',te:s+'きて',potential:s+'こられる',passive:s+'こられる'});
    Object.assign(forms,{volitional:s+'こよう',imperative:s+'こい',conditional:s+'くれば',causative:s+'こさせる'});
  } else throw new Error(`Unknown verb group: ${v.group}`);
  forms.prohibitive=r+'な';
  if(v.naiOverride)forms.nai=v.naiOverride;
  Object.assign(forms,v.formOverrides||{});
  forms.ta=forms.te.slice(0,-1)+(forms.te.endsWith('で')?'だ':'た');
  forms.nakatta=forms.nai.slice(0,-1)+'かった';
  const politeStem=forms.masu.slice(0,-2);
  Object.assign(forms,{masen:politeStem+'ません',mashita:politeStem+'ました',masendeshita:politeStem+'ませんでした'});
  if(v.noPotential)delete forms.potential;
  if(v.noPassive)delete forms.passive;
  // Respectful language depends on the actor and lexical meaning, not just the ending.
  const respectful=honorificFor(v,forms);
  if(respectful)forms.honorific=respectful.reading;
  return forms;
}

export function spellForm(v, reading, form) {
  if(form==='honorific') {
    const info=honorificFor(v,conjugateVerb(v));
    if(info?.word && info.reading===reading)return info.word;
  }
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
  if(form==='imperative') {
    if(v.group==='ichidan')accepted.push(v.reading.slice(0,-1)+'よ');
    if(v.group==='suru')accepted.push(v.reading.slice(0,-2)+'せよ');
    if(specialImperative(v.reading))accepted.push(v.reading.slice(0,-1)+'れ');
  }
  if(form==='causative' && f.causative)accepted.push(f.causative.replace(/せる$/,'す'));
  if(form==='honorific')accepted.push(...(honorificFor(v,f)?.alternatives||[]));
  return [...new Set(accepted.filter(Boolean))];
}

export function formExplanation(v,form) {
  const r=v.reading,s=r.slice(0,-1),f=conjugateVerb(v);
  let rule='';
  if(form==='jisho')rule='Bentuk kamus adalah bentuk dasar sebelum diubah menjadi bentuk sopan ～ます.';
  else if(form==='nakatta')rule=`Mulai dari ${f.nai}, lalu ganti akhiran ない menjadi なかった.`;
  else if(form==='honorific')rule=honorificExplanation(v,honorificFor(v,f));
  else if(form==='prohibitive')rule=`Tambahkan な langsung ke bentuk kamus ${r}: ${f.prohibitive}. Jangan menghapus る atau memakai batang ます.`;
  else if(form==='imperative' && specialImperative(r))rule=`Pengecualian kata hormat ini: ${r} menjadi ${f.imperative}. Akhirannya memakai い.`;
  else if(form==='imperative' && v.group==='ichidan' && isKureru(v))rule=`Pengecualian くれる: bentuk perintahnya くれ. Jadi ${r} → ${f.imperative}.`;
  else if(v.group==='kuru')rule=`Akhiran 来る berubah menjadi ${{te:'きて',ta:'きた',nai:'こない',potential:'こられる',passive:'こられる',volitional:'こよう',imperative:'こい',conditional:'くれば',causative:'こさせる'}[form]}. Bagian sebelum 来る tetap; perhatikan perubahan bunyi く・き・こ.`;
  else if(v.group==='suru') {
    rule=v.special==='single-suru' && ['nai','potential','passive'].includes(form) ? 'Kata ini adalah gabungan satu kanji dengan する dan memiliki perubahan khusus; gunakan bentuk pada contoh ini.' : `Akhiran する berubah menjadi ${{te:'して',ta:'した',nai:'しない',potential:'できる',passive:'される',volitional:'しよう',imperative:'しろ',conditional:'すれば',causative:'させる'}[form]}. Bagian sebelum する tetap.`;
  } else if(v.group==='ichidan')rule=`Hilangkan る dari ${r}, lalu tambahkan ${{te:'て',ta:'た',nai:'ない',potential:'られる',passive:'られる',volitional:'よう',imperative:'ろ',conditional:'れば',causative:'させる'}[form]}.`;
  else if(form==='nai')rule=r==='ある'?'Pengecualian: bentuk negatif ある adalah ない, bukan あらない.':`Ubah ${r.at(-1)} menjadi ${ROWS[r.at(-1)][0]}, lalu tambahkan ない${r.endsWith('う')?' (う berubah menjadi わ, bukan あ)':''}.`;
  else if(form==='te'||form==='ta')rule=v.formOverrides?.te?`Pengecualian ${v.word}: bentuk て adalah ${f.te} dan bentuk た adalah ${f.ta}.`:/行く$/.test(v.word)?'Pengecualian 行く: bentuk て adalah いって dan bentuk た adalah いった.':`Akhiran ${r.at(-1)} berubah menjadi ${f[form].slice(s.length)} dalam bentuk ${form==='te'?'て':'た'}.`;
  else if(form==='volitional')rule=`Ubah bunyi akhir ${r.at(-1)} ke baris o (${O_ROW[r.at(-1)]}), lalu tambahkan う.`;
  else if(form==='imperative')rule=`Ubah bunyi akhir ${r.at(-1)} ke baris e (${ROWS[r.at(-1)][2]}). Tidak ada tambahan る.`;
  else if(form==='conditional')rule=`Ubah bunyi akhir ${r.at(-1)} ke baris e (${ROWS[r.at(-1)][2]}), lalu tambahkan ば.`;
  else rule=form==='potential'?`Ubah bunyi akhir ${r.at(-1)} ke baris e (${ROWS[r.at(-1)][2]}), lalu tambahkan る.`:`Ubah bunyi akhir ${r.at(-1)} ke baris a (${ROWS[r.at(-1)][0]}), lalu tambahkan ${form==='causative'?'せる':'れる'}.`;
  if(['potential','passive'].includes(form)&&['ichidan','kuru'].includes(v.group))rule+=' Bentuk potensial dan pasif sama-sama memakai られる; maknanya dibedakan oleh konteks.';
  if(form==='imperative' && (v.group==='suru'||v.group==='ichidan'&&!isKureru(v)))rule+=v.group==='suru'?' Bentuk ～せよ juga benar, terutama dalam tulisan.':' Bentuk ～よ juga benar, terutama dalam tulisan.';
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
    volitional:[stem+'よう',stem+'ろう',stem+'そう',stem+'おう'],
    imperative:[stem+'ろ',stem+'れ',stem+'よ',r+'ろ'],
    prohibitive:[f.masu.slice(0,-2)+'な',f.nai+'な',r+'の',f.te+'な'],
    conditional:[r+'ば',stem+'れば',stem+'えば',f.nai+'ば'],
    causative:[stem+'せる',stem+'させる',stem+'らせる',r+'させる'],
    honorific:[f.masu.slice(0,-2)+'いたす',f.masu.slice(0,-2)+'になる',f.masu.slice(0,-2)+'なさる'],
  };
  if(v.group==='suru') {
    const s=r.slice(0,-2);
    Object.assign(errors,{te:[s+'すって',s+'すて',s+'しで'],ta:[s+'すった',s+'すた',s+'しだ'],nai:[s+'すない',s+'さない',s+'せない'],jisho:[s+'しる',s+'す',s+'すう'],potential:[s+'される',s+'しれる',s+'しられる'],passive:[s+'させる',s+'しられる',s+'すられる'],nakatta:[s+'すなかった',s+'さなかった',s+'しないかった']});
  } else if(v.group==='kuru') {
    const s=r.slice(0,-2);
    Object.assign(errors,{te:[s+'くて',s+'こて',s+'きって'],ta:[s+'くた',s+'こた',s+'きった'],nai:[s+'くない',s+'きない',s+'くらない'],jisho:[s+'きる',s+'こる',s+'くう'],potential:[s+'くられる',s+'きられる',s+'くれる'],passive:[s+'くられる',s+'きられる',s+'くれる'],nakatta:[s+'くなかった',s+'きなかった',s+'こないかった']});
  }
  if(v.group==='suru'||v.group==='kuru') {
    const s=r.slice(0,-2),suru=v.group==='suru';
    Object.assign(errors,suru?{
      volitional:[s+'すよう',s+'しょう',s+'しろう'],imperative:[s+'すろ',s+'しれ',s+'するろ'],
      conditional:[s+'しれば',s+'せれば',s+'するば'],causative:[s+'しさせる',s+'すさせる',s+'される'],
    }:{
      volitional:[s+'くよう',s+'きよう',s+'ころう'],imperative:[s+'くろ',s+'きろ',s+'くれ'],
      conditional:[s+'これば',s+'きれば',s+'くるば'],causative:[s+'くさせる',s+'きさせる',s+'こらせる'],
    });
  }
  if(form==='honorific') {
    // Plain, potential, passive, and other conjugations can themselves be respectful
    // for lexical honorifics. Only reviewed base verbs enter this mode, and valid
    // respectful alternatives (especially the passive-shaped form) are excluded.
    const humble={行く:'まいる',来る:'まいる',言う:'もうす',する:'いたす',食べる:'いただく',飲む:'いただく',見る:'はいけんする'}[v.word];
    errors.honorific=[humble,r,f.masu,f.te].filter(Boolean);
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
    const instruction=q.form==='honorific'?honorificInstruction(honorificFor(q.verb,f)):'Ubah kata kerja berikut ke bentuk yang diminta.';
    questions.push({...q,prompt:f[promptKey],promptWord:spellForm(q.verb,f[promptKey]),instruction,isFutsu,options:henkanOptions(q.verb,q.form,random)});
  }
  return questions;
}

export const HENKAN_HISTORY_KEY='nihongo-benkyo-henkan-history-v1';
export function cleanHenkanHistory(raw,verbs) {
  const valid=new Set(henkanPool(verbs,{level:'all',modes:Object.keys(HENKAN_MODES)}).map(q=>q.id));
  return Object.fromEntries(Object.entries(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}).filter(([id,n])=>valid.has(id)&&Number.isSafeInteger(n)&&n>0));
}
export function recordHenkanShown(history,id) {return {...history,[id]:Math.min((history[id]||0)+1,Number.MAX_SAFE_INTEGER)};}
