"""Refresh the curated kanji readings from kanjiapi.dev (KANJIDIC2)."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import urllib.parse
import urllib.request

# Indonesian glosses and example words curated for this learning collection.
ROWS = """日|Matahari; hari|日本|にほん|Jepang
月|Bulan|月曜日|げつようび|Senin
火|Api|火山|かざん|Gunung berapi
水|Air|水曜日|すいようび|Rabu
木|Pohon; kayu|木曜日|もくようび|Kamis
金|Emas; uang|お金|おかね|Uang
土|Tanah|土曜日|どようび|Sabtu
山|Gunung|富士山|ふじさん|Gunung Fuji
川|Sungai|川|かわ|Sungai
田|Sawah|田んぼ|たんぼ|Sawah
人|Orang|日本人|にほんじん|Orang Jepang
口|Mulut|入口|いりぐち|Pintu masuk
目|Mata|目|め|Mata
耳|Telinga|耳|みみ|Telinga
手|Tangan|手紙|てがみ|Surat
足|Kaki; cukup|足|あし|Kaki
力|Tenaga|力|ちから|Tenaga
男|Laki-laki|男の子|おとこのこ|Anak laki-laki
女|Perempuan|女の子|おんなのこ|Anak perempuan
子|Anak|子ども|こども|Anak
学|Belajar|学生|がくせい|Pelajar
生|Hidup; lahir|先生|せんせい|Guru
先|Sebelum; lebih dahulu|先月|せんげつ|Bulan lalu
本|Buku; asal|本|ほん|Buku
大|Besar|大学|だいがく|Universitas
小|Kecil|小さい|ちいさい|Kecil
中|Tengah; dalam|中学校|ちゅうがっこう|SMP
上|Atas|上|うえ|Atas
下|Bawah|下|した|Bawah
左|Kiri|左|ひだり|Kiri
右|Kanan|右|みぎ|Kanan
一|Satu|一月|いちがつ|Januari
二|Dua|二月|にがつ|Februari
三|Tiga|三月|さんがつ|Maret
四|Empat|四月|しがつ|April
五|Lima|五月|ごがつ|Mei
六|Enam|六月|ろくがつ|Juni
七|Tujuh|七月|しちがつ|Juli
八|Delapan|八月|はちがつ|Agustus
九|Sembilan|九月|くがつ|September
十|Sepuluh|十月|じゅうがつ|Oktober
百|Seratus|百円|ひゃくえん|Seratus yen
千|Seribu|千円|せんえん|Seribu yen
万|Sepuluh ribu|一万円|いちまんえん|Sepuluh ribu yen
円|Yen; lingkaran|円|えん|Yen
年|Tahun|今年|ことし|Tahun ini
今|Sekarang|今|いま|Sekarang
時|Waktu; jam|時間|じかん|Waktu
分|Bagian; menit|十分|じゅっぷん|Sepuluh menit
半|Setengah|半年|はんとし|Setengah tahun
毎|Setiap|毎日|まいにち|Setiap hari
何|Apa|何|なに|Apa
行|Pergi|行く|いく|Pergi
来|Datang|来る|くる|Datang
帰|Pulang|帰る|かえる|Pulang
食|Makan|食べる|たべる|Makan
飲|Minum|飲む|のむ|Minum
見|Melihat|見る|みる|Melihat
聞|Mendengar|聞く|きく|Mendengar
読|Membaca|読む|よむ|Membaca
書|Menulis|書く|かく|Menulis
話|Berbicara; cerita|話す|はなす|Berbicara
語|Bahasa|日本語|にほんご|Bahasa Jepang
買|Membeli|買う|かう|Membeli
休|Istirahat|休む|やすむ|Beristirahat
会|Bertemu|会う|あう|Bertemu
国|Negara|外国|がいこく|Luar negeri
外|Luar|外|そと|Luar
天|Langit|天気|てんき|Cuaca
気|Semangat; suasana|元気|げんき|Sehat; bersemangat
雨|Hujan|雨|あめ|Hujan
電|Listrik|電車|でんしゃ|Kereta listrik
車|Kendaraan|車|くるま|Mobil
駅|Stasiun|駅|えき|Stasiun
白|Putih|白い|しろい|Putih
花|Bunga|花|はな|Bunga
空|Langit; kosong|空|そら|Langit
海|Laut|海|うみ|Laut
春|Musim semi|春|はる|Musim semi
夏|Musim panas|夏|なつ|Musim panas
秋|Musim gugur|秋|あき|Musim gugur
冬|Musim dingin|冬|ふゆ|Musim dingin
朝|Pagi|朝|あさ|Pagi
昼|Siang|昼|ひる|Siang
夜|Malam|夜|よる|Malam
心|Hati; pikiran|心|こころ|Hati
思|Berpikir|思う|おもう|Berpikir
知|Mengetahui|知る|しる|Mengetahui
新|Baru|新しい|あたらしい|Baru
古|Lama; tua|古い|ふるい|Lama; tua
好|Suka|好き|すき|Suka
旅|Perjalanan|旅行|りょこう|Wisata
勉|Usaha; tekun|勉強|べんきょう|Belajar
強|Kuat|強い|つよい|Kuat
持|Memegang; membawa|持つ|もつ|Membawa
待|Menunggu|待つ|まつ|Menunggu
使|Menggunakan|使う|つかう|Menggunakan
働|Bekerja|働く|はたらく|Bekerja
楽|Nyaman; menyenangkan|楽しい|たのしい|Menyenangkan
意|Maksud; pikiran|意味|いみ|Arti
味|Rasa|味|あじ|Rasa
夢|Mimpi|夢|ゆめ|Mimpi
愛|Cinta|愛|あい|Cinta
感|Perasaan|感謝|かんしゃ|Rasa terima kasih
想|Gagasan; memikirkan|感想|かんそう|Kesan
続|Berlanjut|続く|つづく|Berlanjut
選|Memilih|選ぶ|えらぶ|Memilih
達|Mencapai|友達|ともだち|Teman
深|Dalam|深い|ふかい|Dalam
真|Kebenaran; sejati|写真|しゃしん|Foto"""

def fetch(row):
    char, meaning, word, reading, translation = row.split('|')
    url = 'https://kanjiapi.dev/v1/kanji/' + urllib.parse.quote(char)
    request = urllib.request.Request(url, headers={'User-Agent': 'NihongoBenkyo/1.0 (educational kanji collection)'})
    with urllib.request.urlopen(request, timeout=30) as response:
        source = json.load(response)
    # The source currently omits a level for 分; include it in our beginner study group.
    level = source['jlpt'] or (5 if char == '分' else None)
    return dict(char=char, meaning=meaning, level=f'N{level}' if level else 'Lainnya',
                on=source['on_readings'], kun=source['kun_readings'], strokes=source['stroke_count'],
                example=dict(word=word, reading=reading, meaning=translation))

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=6) as pool:
        data = list(pool.map(fetch, ROWS.splitlines()))
    path = Path(__file__).resolve().parents[1] / 'kanji-data.js'
    path.write_text('// Readings and strokes: KANJIDIC2 via kanjiapi.dev. See DATA-SOURCES.md.\nexport const KANJI = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(f'Wrote {len(data)} kanji; levels: ' + ', '.join(sorted(set(k['level'] for k in data))))
