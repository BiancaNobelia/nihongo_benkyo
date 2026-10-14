import { KATAKANA_WRITING } from './writing-data.js?v=20261014-english-katakana';

// English meaning cues, not a claim that every loanword came from English.
// Existing readings, levels, contexts and spelling distractors are retained.
const ENGLISH_CUES = {
  'シャワー':'shower', 'コーヒー':'coffee', 'テレビ':'television', 'タクシー':'taxi',
  'シャツ':'shirt', 'レストラン':'restaurant', 'ホテル':'hotel', 'カメラ':'camera',
  'ノート':'notebook', 'ベッド':'bed', 'ガソリン':'gasoline', 'スーツケース':'suitcase',
  'パソコン':'personal computer', 'アルバイト':'part-time job', 'エスカレーター':'escalator',
  'スクリーン':'screen', 'ステーキ':'steak', 'プレゼント':'present (gift)', 'タイプ':'type',
  'ステレオ':'stereo', 'サービス':'service', 'チャンス':'chance', 'スピーチ':'speech',
  'パスポート':'passport', 'エネルギー':'energy', 'プラス':'plus', 'ジュース':'juice',
  'サイン':'signature', 'メンバー':'member', 'スタイル':'style', 'アンテナ':'antenna',
  'インタビュー':'interview', 'コレクション':'collection', 'コンクリート':'concrete',
  'サンプル':'sample', 'リズム':'rhythm', 'レンズ':'lens', 'サークル':'club (activity group)',
  'コンセント':'power outlet', 'スケジュール':'schedule', 'メッセージ':'message',
  'コミュニケーション':'communication', 'レクリエーション':'recreation',
  'レギュラー':'regular team member', 'デッサン':'sketch', 'オリエンテーション':'orientation',
  'ニュアンス':'nuance', 'ジャンル':'genre', 'シナリオ':'scenario', 'ショック':'shock',
};

const ADDITIONAL_WORDS = [
  {
    prompt:'running', answer:'ランニング', reading:'らんにんぐ', level:'N2',
    meaning:'Lari; olahraga lari',
    sentence:'あさ、こうえんで {target} を します。',
    sentenceMeaning:'Pagi hari saya berlari di taman.',
    distractors:['ランニソグ','ランニングー','ランニンク'],
    explanation:'Running ditulis ランニング. Ada dua ン, sedangkan グ memakai dakuten. Bunyi terakhir tidak dipanjangkan dengan ー.',
  },
  {
    prompt:'jogging', answer:'ジョギング', reading:'じょぎんぐ', level:'N3',
    meaning:'Joging; lari santai',
    sentence:'ゆうがた、かわの そばで {target} を します。',
    sentenceMeaning:'Sore hari saya joging di tepi sungai.',
    distractors:['ジヨギング','ジョキンゲ','ジョギソグ'],
    explanation:'Jogging ditulis ジョギング. ジョ memakai ョ kecil; ギ dan グ memakai dakuten. Huruf sebelum グ adalah ン, bukan ソ.',
  },
  {
    prompt:'allergy', answer:'アレルギー', reading:'あれるぎー', level:'N2',
    meaning:'Alergi',
    sentence:'わたしは たまごの {target} が あります。',
    sentenceMeaning:'Saya alergi terhadap telur.',
    distractors:['アレルキー','アレレギー','アレルギ'],
    explanation:'Allergy dalam bahasa Jepang adalah アレルギー. Gunakan ル, ギ dengan dakuten, dan ー di akhir. Kata ini diserap dari bahasa Jerman, sehingga ejaannya tidak mengikuti bunyi bahasa Inggris secara langsung.',
  },
  {
    prompt:'sandal', answer:'サンダル', reading:'さんだる', level:'N4',
    meaning:'Sandal',
    sentence:'なつは {target} を はきます。',
    sentenceMeaning:'Pada musim panas saya memakai sandal.',
    distractors:['サソダル','サンタル','サンダレ'],
    explanation:'Sandal ditulis サンダル. Gunakan ン, bukan ソ; ダ memakai dakuten. Huruf terakhir ル memiliki dua goresan, berbeda dari レ.',
  },
];

export const ENGLISH_KATAKANA = [
  ...KATAKANA_WRITING.map(q => ({...q, reading:q.prompt, prompt:ENGLISH_CUES[q.answer]})),
  ...ADDITIONAL_WORDS.map(q => ({...q, sourceWord:q.answer})),
].map(q => ({...q, id:`english-katakana:${q.answer}`, mode:'english-katakana'}));
