"""Compile explicitly assigned original contexts; refuse to silently fill gaps."""
from prepare_kanji_sentences import *

# Unambiguous recurring context words. The rest intentionally stays in kana to
# keep the context approachable; the target always preserves its exact spelling.
CONTEXT_KANJI={
 'せんせい':'先生','ともだち':'友達','がっこう':'学校','だいがく':'大学',
 'にほんご':'日本語','インドネシア':'インドネシア','あした':'明日','らいねん':'来年',
 'らいげつ':'来月','らいしゅう':'来週','まいにち':'毎日','まいつき':'毎月',
 'しゅうまつ':'週末','なつやすみ':'夏休み','ひるごはん':'昼ご飯','かぞく':'家族',
 'こども':'子供','しごと':'仕事','しゃしん':'写真','しょるい':'書類','しりょう':'資料',
 'としょかん':'図書館','じてんしゃ':'自転車','でんしゃ':'電車','りょこう':'旅行',
 'せんしゅ':'選手','かいしゃ':'会社','しょうらい':'将来','じぶん':'自分',
 'じゅぎょう':'授業','しゅくだい':'宿題','べんきょう':'勉強','れんしゅう':'練習',
 'しつもん':'質問','やくそく':'約束','けんこう':'健康','かんきょう':'環境',
 'せいかつ':'生活','けんきゅう':'研究','ぎじゅつ':'技術','もんだい':'問題',
 'かいぎ':'会議','ちょうさ':'調査','せつめい':'説明','げんいん':'原因',
 'きかい':'機械','しんぶん':'新聞','しょうひん':'商品','しょくじ':'食事',
 'でんわ':'電話','でんき':'電気','びょういん':'病院','びょうき':'病気',
 'こうえん':'公園','かんじゃ':'患者','あかちゃん':'赤ちゃん','おとしより':'お年寄り',
 'せんたく':'洗濯','やさい':'野菜','やすみ':'休み','あたらしい':'新しい',
 'おおきな':'大きな','おおきく':'大きく','にちようび':'日曜日','ぎんこう':'銀行',
 'せいせき':'成績','きけん':'危険','あんぜん':'安全','どうぐ':'道具',
 'けいかく':'計画','こうじょう':'工場','くうき':'空気','きおん':'気温',
 'くるま':'車','まどぐち':'窓口','ひこうき':'飛行機','にゅういん':'入院',
 'きんちょう':'緊張','りかい':'理解','どりょく':'努力','もくひょう':'目標',
 'てんき':'天気','じかん':'時間','げんかん':'玄関','じむしょ':'事務所',
 'ものがたり':'物語','しょうせつ':'小説','しゅじんこう':'主人公','じっけん':'実験',
 'りゆう':'理由','せんしゅ':'選手','けいさつ':'警察','みぎ':'右',
}

def context_annotate(template):
    # Never process inside an explicitly annotated span.
    parts=re.split(r'(\{[^{}]+\})',template)
    pattern=re.compile('|'.join(re.escape(w) for w in sorted(CONTEXT_KANJI,key=len,reverse=True)))
    return ''.join(p if p.startswith('{') else pattern.sub(lambda m:'{'+CONTEXT_KANJI[m[0]]+'|'+m[0]+'}',p) for p in parts)

def main():
    words=load('.cache/sentence-example-words.json')
    byword=defaultdict(list)
    for e in words:byword[e['word']].append(e)
    records={}
    for path in sorted((ROOT/'data').glob('kanji-sentence-contexts*.tsv')):
        for line_no,line in enumerate(path.read_text(encoding='utf-8').splitlines(),1):
            if not line.strip() or line.startswith('#'):continue
            targets,template,translation=line.split('\t') if '\t' in line else line.split('|',2)
            template=context_annotate(re.sub(r'\{([^{}:]+):([^{}:]+)\}',r'{\1|\2}',template))
            for target in targets.split():
                word,_,reading=target.partition(':')
                for e in byword[word]:
                    if reading and e['reading']!=reading:continue
                    text,spans=parse_annotated(template.replace('@','{'+e['word']+'|'+hira(e['reading'])+'}'))
                    assert valid_spans(text,spans),(path.name,line_no,text,spans)
                    assert target_at(text,spans,e['word'],e['reading']) is not None,(word,text)
                    glosses={'三日':'tiga','四日':'empat','八日':'delapan','二階':'lantai dua','三階':'lantai tiga','七つ':'tujuh','九つ':'sembilan','十':'sepuluh','弐つ':'dua','半袖':'pendek','長袖':'panjang','辰':'naga','寅':'harimau','巳':'ular','丑':'sapi','卯':'kelinci','酉':'ayam','亥':'babi hutan'}
                    gloss=glosses.get(word,e['meaning'].split(';')[0].split(' / ')[0]).strip()
                    records[word+'|'+e['reading']]={'text':text,'furigana':spans,'translation':translation.replace('%',gloss.lower()),'origin':'original','reference':f'{path.name}:{line_no}'}
    save('.cache/kanji-sentence-authored.json',records)
    selected=load('data/kanji-sentence-selected.json')
    missing=[e for e in load('.cache/kanji-sentence-missing.json') if e['word']+'|'+e['reading'] not in records]
    save('.cache/kanji-sentence-unassigned.json',missing)
    print('Authored',len(records),'still missing',len(missing))
    print(' | '.join(e['word']+'='+e['meaning'].split(';')[0] for e in missing if e['word'].endswith(('ます','ません'))))

if __name__=='__main__':main()
