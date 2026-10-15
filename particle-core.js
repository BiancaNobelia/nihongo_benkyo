import {shuffle} from './core.js?v=20261015-particles';
import {PARTICLE_TOPICS} from './particle-data.js?v=20261015-particles';
import {cleanBunpouHistory,recordBunpouShown,bunpouPromptMarkup,bunpouSentenceMarkup} from './bunpou-core.js?v=20261015-particles';

export const PARTICLE_HISTORY_KEY='nihongo-benkyo-particle-history-v1';
export const PARTICLE_TOPIC_IDS=PARTICLE_TOPICS.map(t=>t.id);
export const cleanParticleHistory=cleanBunpouHistory;
export const recordParticleShown=recordBunpouShown;
export const particlePromptMarkup=bunpouPromptMarkup;

export function particlePool(entries,{topics=PARTICLE_TOPIC_IDS}={}) {
  if(!Array.isArray(topics))return [];
  const selected=new Set(topics.filter(id=>PARTICLE_TOPIC_IDS.includes(id)));
  return entries.filter(q=>selected.has(q.topic));
}
export function createParticleQuiz(entries,settings={},history={},random=Math.random) {
  const count=settings.count??10;
  if(!Number.isSafeInteger(count)||count<1)return [];
  const tiers=new Map();
  for(const q of shuffle(particlePool(entries,settings),random)) {
    const exposure=history[q.id]||0;if(!tiers.has(exposure))tiers.set(exposure,new Map());
    const groups=tiers.get(exposure);if(!groups.has(q.topic))groups.set(q.topic,[]);groups.get(q.topic).push(q);
  }
  const ordered=[];
  for(const [,groups] of [...tiers].sort(([a],[b])=>a-b)) {
    let remaining=[...groups.values()];
    while(remaining.length){for(const group of remaining)ordered.push(group.shift());remaining=remaining.filter(group=>group.length);}
  }
  return ordered.slice(0,count).map(q=>({...q,options:shuffle([q.answer,...q.distractors],random)}));
}
export function checkParticleAnswer(q,answer) {
  return typeof answer==='string'&&(q.accepted||[q.answer]).includes(answer);
}
export function particleFeedbackMarkup(q,escape) {
  const topic=PARTICLE_TOPICS.find(t=>t.id===q.topic);
  return `<div class="answer-details bunpou-detail particle-detail"><div class="particle-answer"><span>JAWABAN</span><strong lang="ja">${escape(q.answer)}</strong><small>${escape(topic.reading)}</small></div><div class="bunpou-complete" lang="ja">${bunpouSentenceMarkup(q,escape)}</div><div class="answer-meaning"><span>Arti kalimat</span><p>${escape(q.translation)}</p></div><div class="bunpou-rule"><span>FUNGSI PARTIKEL</span><h3>${escape(topic.meaning)}</h3><p>${escape(q.note)}</p><dl><div><dt>Pola</dt><dd>${escape(topic.pattern)}</dd></div><div><dt>Ingat</dt><dd>${escape(topic.explanation)}</dd></div></dl></div></div>`;
}
