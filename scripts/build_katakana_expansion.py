"""Build reviewed English-to-katakana additions; no source example sentences copied."""
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARUGOTO = 'https://marugoto.jpf.go.jp/assets/docs/download/pre_intermediate/MarugotoPre-IntermediateVocabularyIndex_EN.pdf'

# All contexts and Indonesian translations are original practice material.
# {meaning} uses the first, context-appropriate Indonesian sense only.
CONTEXTS = {
 'sport': ('{target} の しあいを みます。','Saya menonton pertandingan {meaning}.'),
 'draw': ('えほんの {target} を かきます。','Saya menggambar ilustrasi untuk buku cerita bergambar.'),
 'group': ('みっつの {target} に わかれます。','Kami membagi diri menjadi tiga kelompok.'),
 'website': ('この {target} で じょうほうを さがします。','Saya mencari informasi di situs web ini.'),
 'sports': ('どんな {target} が すきですか。','Olahraga apa yang kamu sukai?'),
 'team': ('わたしたちは おなじ {target} です。','Kami berada dalam tim yang sama.'),
 'teamwork': ('この しごとには {target} が たいせつです。','Kerja sama tim penting dalam pekerjaan ini.'),
 'buy': ('あたらしい {target} を かいました。','Saya membeli {meaning} baru.'),
 'shirt': ('きょうは {target} を きています。','Hari ini saya memakai kaus oblong.'),
 'slippers': ('へやの なかで {target} を はきます。','Saya memakai sandal dalam ruangan di kamar.'),
 'fan': ('わたしは あの かしゅの {target} です。','Saya penggemar penyanyi itu.'),
 'play': ('せんしゅの すばらしい {target} に はくしゅしました。','Saya bertepuk tangan atas permainan hebat atlet itu.'),
 'email': ('せんせいに {target} を おくります。','Saya mengirim email kepada guru.'),
 'rule': ('ゲームの {target} を まもってください。','Tolong patuhi aturan permainan.'),
 'place': ('わたしは この {target} に すんでいます。','Saya tinggal di apartemen ini.'),
 'event': ('しゅうまつの {target} に さんかします。','Saya mengikuti acara akhir pekan.'),
 'internet': ('{target} で でんしゃの じかんを しらべます。','Saya mencari jadwal kereta melalui internet.'),
 'cosplay': ('アニメの イベントで {target} を たのしみます。','Saya menikmati cosplay di acara anime.'),
 'shop': ('えきの ちかくに {target} が あります。','Ada {meaning} di dekat stasiun.'),
 'stress': ('やすみの ひは {target} を へらすために さんぽします。','Pada hari libur saya berjalan-jalan untuk mengurangi stres.'),
 'barbecue': ('やすみの ひに みんなで {target} を します。','Pada hari libur kami mengadakan barbeku bersama.'),
 'memo': ('わすれないように {target} を とります。','Saya membuat catatan agar tidak lupa.'),
 'internship': ('なつやすみに {target} に さんかします。','Saya mengikuti program magang saat libur musim panas.'),
 'destination': ('らいねん、{target} へ いきたいです。','Tahun depan saya ingin pergi ke {meaning}.'),
 'food': ('ひるごはんに {target} を たべました。','Saya makan {meaning} untuk makan siang.'),
 'jam': ('パンに {target} を ぬります。','Saya mengoleskan selai pada roti.'),
 'gym': ('しゅうに にかい {target} に かよいます。','Saya pergi ke pusat kebugaran dua kali seminggu.'),
 'fruit': ('この {target} は あまいです。','{meaning} ini manis.'),
 'spice': ('りょうりに {target} を くわえます。','Saya menambahkan rempah ke dalam masakan.'),
 'drink': ('つめたい {target} を ちゅうもんします。','Saya memesan {meaning} dingin.'),
 'software': ('しごとで この {target} を つかいます。','Saya menggunakan perangkat lunak ini untuk bekerja.'),
 'breakfast': ('あさごはんに {target} を たべます。','Saya makan {meaning} untuk sarapan.'),
 'dish': ('この みせで {target} を はじめて たべました。','Di tempat ini saya pertama kali mencoba {meaning}.'),
 'cake': ('おやつに {target} を たべます。','Saya makan {meaning} sebagai camilan.'),
 'engineer': ('あねは {target} として はたらいています。','Kakak perempuan saya bekerja sebagai insinyur.'),
 'party': ('たんじょうびの {target} に ともだちを よびます。','Saya mengundang teman ke pesta ulang tahun.'),
 'listen': ('この {target} で おんがくを ききます。','Saya mendengarkan musik dari CD ini.'),
 'blog': ('りょこうに ついて {target} を かいています。','Saya menulis blog tentang perjalanan.'),
 'recipe': ('{target} を みながら りょうりします。','Saya memasak sambil melihat resep.'),
 'character': ('この アニメの {target} が すきです。','Saya menyukai karakter dalam anime ini.'),
 'course': ('にほんごの {target} に もうしこみました。','Saya mendaftar kursus bahasa Jepang.'),
 'news': ('まいあさ {target} を みます。','Saya menonton berita setiap pagi.'),
 'questionnaire': ('この {target} に こたえてください。','Tolong isi kuesioner ini.'),
 'card': ('この {target} で はらえますか。','Apakah saya bisa membayar dengan kartu ini?'),
 'pair': ('ふたりで {target} に なって はなしてください。','Silakan berbicara berpasangan.'),
 'advice': ('せんせいに {target} を もらいました。','Saya menerima nasihat dari guru.'),
 'tobacco': ('ここでは {target} を すわないでください。','Tolong jangan merokok di sini.'),
 'happy': ('きょうは とても {target} な きぶんです。','Hari ini saya merasa sangat bahagia.'),
 'home': ('ここは わたしたちの {target} です。','Di sinilah rumah kami.'),
 'ranking': ('にんきの ほんの {target} を みます。','Saya melihat daftar peringkat buku populer.'),
 'announcement': ('えきの {target} を よく きいてください。','Dengarkan pengumuman di stasiun dengan baik.'),
 'elevator': ('{target} で ごかいへ あがります。','Saya naik lift ke lantai lima.'),
 'counter': ('うけつけの {target} で きいてください。','Silakan bertanya di konter penerima tamu.'),
 'gate': ('くうこうの {target} の まえで まちます。','Saya menunggu di depan gerbang bandara.'),
 'game': ('ともだちと {target} を します。','Saya bermain gim bersama teman.'),
 'comment': ('きじに {target} を かきました。','Saya menulis komentar pada artikel.'),
 'signboard': ('みせの {target} に なまえが かいてあります。','Nama toko tertulis pada papan namanya.'),
 'switch': ('でんきの {target} を おしてください。','Tolong tekan sakelar lampu.'),
 'staff': ('ホテルの {target} に たずねます。','Saya bertanya kepada petugas hotel.'),
 'center': ('この {target} では いろいろな かつどうが できます。','Di pusat kegiatan ini kita bisa melakukan beragam aktivitas.'),
 'checkin': ('{target} で パスポートを みせます。','Saya menunjukkan paspor di konter lapor masuk.'),
 'flight': ('あしたの {target} の じかんを かくにんします。','Saya memeriksa waktu penerbangan besok.'),
 'massage': ('つかれたので {target} を うけます。','Karena lelah, saya menjalani pijat.'),
 'system': ('らいげつから あたらしい {target} を つかいます。','Mulai bulan depan kami menggunakan sistem baru.'),
 'freelance': ('わたしは {target} で はたらいています。','Saya bekerja lepas.'),
 'dessert': ('しょくごに {target} を たべました。','Saya makan {meaning} setelah makan utama.'),
 'cheese': ('パンに {target} を のせます。','Saya menaruh keju di atas roti.'),
 'bus': ('えきまで {target} で いきます。','Saya pergi ke stasiun naik bus.'),
 'helmet': ('じてんしゃに のるときは {target} を かぶります。','Saya memakai helm saat bersepeda.'),
 'password': ('{target} を にゅうりょくしてください。','Silakan masukkan kata sandi.'),
 'battery': ('{target} を じゅうでんします。','Saya mengisi daya baterai.'),
 'calendar': ('{target} に よていを かきます。','Saya menulis rencana di kalender.'),
 'menu': ('{target} を みせてください。','Tolong perlihatkan menunya.'),
 'receipt': ('{target} を ください。','Tolong berikan struknya.'),
 'aircon': ('あついので {target} を つけます。','Karena panas, saya menyalakan AC.'),
}

# These are practice tiers only, used when the pinned vocabulary lacks the word.
# They are not an A2/B1-to-JLPT conversion. Exact source levels take precedence.
BEGINNER = set('チケット ティーシャツ メール インターネット スーパー コンビニ オーストラリア カップラーメン ハンバーガー ピザ ラーメン シーディー カフェ トルコ バナナ エアコン チョコレート サッカー'.split())
INTERMEDIATE = set('クリケット コスプレ インターンシップ スターフルーツ ドルマ バウムクーヘン フィッシュアンドチップス ソフトウェア キャラクター ランキング チェックインカウンター サインボード フリーランス'.split())

def read_json(name):
    return json.loads((ROOT/name).read_text(encoding='utf-8'))

def hiragana(text):
    return ''.join(chr(ord(c)-0x60) if 'ァ'<=c<='ヶ' else c for c in text)

def spelling_note(word):
    notes=[]
    small='・'.join(dict.fromkeys(c for c in word if c in 'ァィゥェォャュョッ'))
    if small: notes.append(f'{small} ditulis kecil.')
    if 'ー' in word: notes.append('Tanda ー memanjangkan bunyi tepat sebelumnya.')
    voiced='・'.join(dict.fromkeys(c for c in word if c in 'ガギグゲゴザジズゼゾダヂヅデドバビブベボ'))
    if voiced: notes.append(f'{voiced} memakai dakuten (dua titik).')
    if any(c in word for c in 'パピプペポ'): notes.append('Perhatikan tanda lingkaran kecil pada kana baris パ.')
    if any(c in word for c in 'シツンソ'): notes.append('Perhatikan arah goresan pada シ・ツ dan ン・ソ.')
    return f'Penulisan yang dipakai: {word}. '+(' '.join(notes) or f'Ingat urutan katakananya: {"・".join(word)}.')

def build():
    editorial=read_json('data/katakana-expansion-editorial.json')
    vocab=[v for n in range(5,0,-1) for v in read_json(f'.cache/openjlpt/data_json_vocab_n{n}.json')]
    by_word={v['word']:v for v in vocab}
    pdf_path=ROOT/'.cache/marugoto-preintermediate-en.pdf'
    pdf_text=(ROOT/'.cache/marugoto-preintermediate-en.txt').read_text(encoding='utf-8')
    flat_pdf=re.sub(r'\s+','',pdf_text)
    base=read_json('data/writing-source.json')['words']
    existing={q['sourceWord'] for q in base if q['id'].startswith('hiragana-katakana:')}
    existing.update(q['word'] for q in read_json('data/english-katakana-source.json')['additionalWords'])
    questions=[]
    metadata=[]
    requested=[]
    seen=set(existing)
    for section in ['requested','extra']:
        for row in editorial[section]:
            prompt,word=row[:2]
            requested.append(dict(request=prompt,answer=word,kind=section,status='existing' if word in seen else 'added'))
            if len(row)==2:
                if word not in existing: raise ValueError(f'Missing existing word: {word}')
                continue
            if word in seen: raise ValueError(f'Duplicate word: {word}')
            seen.add(word)
            meaning,context,wrong=row[2:5]
            extra_note=row[5] if len(row)>5 else ''
            variants=set(row[6] if len(row)>6 else [])|{word}
            # Only spelling-equivalent aliases can supply a source level.
            source=by_word.get(word) or by_word.get({'タバコ':'たばこ'}.get(word))
            if source and source.get('jmdict_id'):
                variants.update(v['word'] for v in vocab if v.get('jmdict_id')==source['jmdict_id'])
            level=source['level'] if source else 'N5' if word in BEGINNER else 'N3' if word in INTERMEDIATE else 'N4'
            if len(wrong)!=3 or len(set(wrong+[word]))!=4 or variants.intersection(wrong):
                raise ValueError(f'Ambiguous/duplicate options: {word}')
            if not all(re.fullmatch('[ァ-ヶー]+',s) for s in [word,*wrong]):
                raise ValueError(f'Non-katakana option: {word}')
            if not re.fullmatch('[A-Za-z][A-Za-z /()-]*',prompt):
                raise ValueError(f'Invalid English cue: {prompt}')
            sentence,translation=CONTEXTS[context]
            primary_meaning=meaning.split(';')[0]
            if context!='destination': primary_meaning=primary_meaning.lower()
            translation=translation.replace('{meaning}',primary_meaning)
            translation=translation[0].upper()+translation[1:]
            note=spelling_note(word)+(f' {extra_note}' if extra_note else '')
            questions.append(dict(id=f'english-katakana:{word}',mode='english-katakana',sourceWord=word,prompt=prompt,
                answer=word,reading=hiragana(word),level=level,meaning=meaning,sentence=sentence,
                sentenceMeaning=translation,distractors=wrong,explanation=note,acceptedSpellings=sorted(variants)))
            ref=dict(word=word,english=prompt,level=level,levelBasis='pinned-vocabulary' if source else 'editorial-practice-tier',acceptedSpellings=sorted(variants))
            if source: ref.update(sourceId=source['id'],jmdictId=source.get('jmdict_id'),sourceWord=source['word'])
            if word in flat_pdf: ref['spellingReference']=MARUGOTO
            metadata.append(ref)
    lock=read_json('data/source-lock.json')
    manifest=dict(source=lock['repository'],commit=lock['commit'],reviewDate='2026-10-14',
        note='Vocabulary facts checked against pinned OpenJLPT and Marugoto; no source sentences, accent notation or lesson sequence copied. Practice tiers for absent words are editorial, not official JLPT levels.',
        marugoto=dict(url=MARUGOTO,sha256=hashlib.sha256(pdf_path.read_bytes()).hexdigest()),
        previousWordCount=len(existing),addedWordCount=len(questions),totalWordCount=len(existing)+len(questions),
        addedByLevel=dict(Counter(q['level'] for q in questions)),coverage=requested,words=metadata)
    (ROOT/'katakana-expansion-data.js').write_text('// Generated by scripts/build_katakana_expansion.py; see DATA-SOURCES.md.\nexport const KATAKANA_EXPANSION = '+json.dumps(questions,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    (ROOT/'data/katakana-expansion-source.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(questions)} added, {manifest["totalWordCount"]} total; additions by level: {manifest["addedByLevel"]}')
    print(f'Requested: {len(editorial["requested"])}; already present: {sum(c["kind"]=="requested" and c["status"]=="existing" for c in requested)}')

if __name__=='__main__': build()
