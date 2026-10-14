// Curated human actions, not an automatic honorific prefix for every verb.
// Grammar references and selection policy: DATA-SOURCES.md (Kuis Henkan).
const special = {
  '行く': ['いらっしゃる','いらっしゃる',['おいでになる','おこしになる']],
  '来る': ['いらっしゃる','いらっしゃる',['おいでになる','おこしになる','みえる']],
  'いる': ['いらっしゃる','いらっしゃる',['おいでになる']],
  '言う': ['おっしゃる','おっしゃる',[]],
  'する': ['なさる','なさる',[]],
  '食べる': ['めしあがる','召し上がる',['おたべになる','おめしあがりになる']],
  '飲む': ['めしあがる','召し上がる',['おのみになる','おめしあがりになる']],
  '見る': ['ごらんになる','ご覧になる',[]],
  'くれる': ['くださる','下さる',[]],
  '寝る': ['おやすみになる','お休みになる',[]],
  '着る': ['おめしになる','お召しになる',[]],
};
const oStem = new Set(`読む 書く 聞く 話す 待つ 持つ 帰る 休む 使う 選ぶ 買う 売る 送る 取る 呼ぶ 会う 教える 見せる 始める 続ける 考える 調べる 決める 答える 伝える 知らせる 確かめる 受け取る 渡す 探す 頼む 申し込む 出かける 乗る 降りる 急ぐ 支払う 払う 返す 借りる 貸す 座る 立つ 入る 着替える 楽しむ 過ごす 認める 述べる 求める 尋ねる 訪ねる 望む 断る 引き受ける 選び出す 持ち帰る`.split(' '));
const suruNasaru = new Set(`勉強する 研究する 食事する 旅行する 散歩する 料理する 買い物する 注文する 予約する 見学する 運転する 掃除する 洗濯する 練習する 紹介する 案内する 説明する 準備する 相談する 連絡する 確認する 検討する 利用する 使用する 申請する 提出する 参加する 卒業する 入学する 留学する 就職する 帰国する 出張する 残業する 結婚する 引っ越しする 質問する 返事する 返答する 回答する 報告する 発表する 講演する 演説する 出席する 欠席する 記入する 記録する 整理する 保存する 印刷する 購入する 交換する 運動する 読書する 復習する 予習する 学習する 受験する 挑戦する 体験する 依頼する 指導する 教育する 交渉する 判断する 選択する 決定する 計画する 予定する 希望する 約束する 協力する 応援する 反対する 賛成する 同意する 署名する 訪問する 滞在する 帰宅する 帰省する 休憩する 休息する 出勤する 通勤する 通学する 退職する 転職する 転勤する 登山する 入院する 退院する 出発する 到着する 議論する 提案する 投票する 寄付する 注目する 集中する 感謝する 尊重する 設計する 開発する 創造する 想像する 表現する 翻訳する 通訳する 調査する 実験する 分析する 診察する 治療する 予防する 管理する 担当する 招待する 記憶する 理解する 努力する 達成する 改善する 公開する 発行する 評価する 観察する 測定する 審査する 採点する 手続きする`.split(' '));
const passiveRespect = new Set(`働く 起きる 泳ぐ 遊ぶ 歩く 走る 歌う 弾く 踊る 登る 泊まる 習う 学ぶ 育てる 作る 切る 洗う 開ける 閉める 点ける 消す 捨てる 覚える 忘れる 手伝う 笑う 謝る 褒める 叱る 助ける 誘う 励ます 運ぶ 飾る 植える 並べる 組み立てる 比べる 試す 鍛える 守る 焼く 混ぜる 量る 注ぐ 温める 冷やす 訳す 雇う 譲る 許す 頑張る 語る 描く 眺める 肯く うなずく 微笑む 握る 結ぶ 包む 畳む 炊く 拭く 磨く 縫う 配る 預かる 預ける 迎える 直す 治す 入れる 出す 置く 押す 引く 回す 渡る 集める 勤める 戻る`.split(' '));

export function honorificFor(v, forms) {
  const entry=special[v.word];
  if(entry) return {reading:entry[0],word:entry[1],pattern:'special',alternatives:[...entry[2],forms.passive].filter(Boolean)};
  if(oStem.has(v.word) && ['godan','ichidan'].includes(v.group)) {
    const stem=forms.masu.slice(0,-2);
    const ending=v.group==='ichidan'?'':{う:'い',く:'き',ぐ:'ぎ',す:'し',つ:'ち',ぬ:'に',ぶ:'び',む:'み',る:'り'}[v.reading.at(-1)];
    return {reading:`お${stem}になる`,word:`お${v.word.slice(0,-1)}${ending}になる`,pattern:'o-stem',alternatives:[forms.passive,`お${stem}なさる`].filter(Boolean)};
  }
  if(suruNasaru.has(v.word) && v.group==='suru') {
    const stem=v.reading.slice(0,-2);
    return {reading:stem+'なさる',word:v.word.slice(0,-2)+'なさる',pattern:'suru',alternatives:[forms.passive,`ご${stem}になる`,`ご${stem}なさる`,`お${stem}になる`,`お${stem}なさる`].filter(Boolean)};
  }
  if(passiveRespect.has(v.word) && forms.passive) return {reading:forms.passive,pattern:'rareru',alternatives:[]};
  return null;
}

export function honorificInstruction(info) {
  const pattern={special:'bentuk hormat khusus', 'o-stem':'pola お＋batang ます＋になる',suru:'pola ～する → ～なさる',rareru:'pola hormat ～（ら）れる'}[info?.pattern];
  return `Kamu menceritakan tindakan gurumu kepada teman. Pilih ${pattern} untuk kata berikut, dalam bentuk kamus.`;
}

export function honorificExplanation(v,info) {
  const rule={special:`${v.word} memakai bentuk hormat khusus ${info?.word}（${info?.reading}）.`,
    'o-stem':'Ambil batang bentuk ます, lalu gunakan pola お＋batang ます＋になる.',
    suru:'Ganti する dengan なさる; bagian sebelum する tetap.',
    rareru:'Bentuk ～（ら）れる juga dapat menyatakan penghormatan. Dalam konteks ini guru adalah pelaku tindakan, sehingga maknanya hormat, bukan menerima tindakan (pasif).'}[info?.pattern];
  return `${rule} Sonkei menghormati pelaku tindakan; untuk soal ini, pelakunya adalah gurumu. Bentuk ～ます saja menyatakan kesopanan kepada pendengar.`;
}
