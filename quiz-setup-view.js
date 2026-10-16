import {PARTICLE_ENTRIES,PARTICLE_TOPICS} from './particle-data.js?v=20261015-jidoushi-tadoushi';
export function quizSetupPanel(icon) {
  return `<a class="kotoba-home-banner transitivity-banner" href="#jidoushi"><span lang="ja">自他</span><div><strong>Kuis Jidōshi–Tadōshi</strong><small>Kalimat Indonesia · Pilih kata kerja atau jenisnya · Dua pilihan jawaban.</small></div>${icon('arrow')}</a><a class="kotoba-home-banner particle-banner" href="#partikel"><span lang="ja">助詞</span><div><strong>Kuis Partikel · Pahami hubungan antarkata</strong><small>${PARTICLE_ENTRIES.length} kalimat · ${PARTICLE_TOPICS.length} topik partikel & gabungan · Arti dan penjelasan.</small></div>${icon('arrow')}</a><a class="kotoba-home-banner bunpou-banner" href="#bunpou"><span lang="ja">文法</span><div><strong>Kuis Bunpou · Tata bahasa Minna</strong><small>330 pola · Bab 1–50 · Lengkapi atau susun kalimat.</small></div>${icon('arrow')}</a><a class="kotoba-home-banner henkan-banner" href="#henkan"><span lang="ja">変換</span><div><strong>Kuis Henkan · Kata kerja, sifat & benda</strong><small>Kata kerja: 13 bentuk · Kata sifat: 6 bentuk · Kata benda: 4 bentuk · N5–N3.</small></div>${icon('arrow')}</a><div class="setup-panel">
    <div class="setup-title"><span class="stat-icon">${icon('sparkles')}</span><div><h2>Racik sesi belajarmu</h2><p>Pilih level, lalu atur jumlah soal dan ritme belajarmu.</p></div></div>
    <div class="setup-grid">
      <div class="field"><label for="quiz-mode">Yang ingin dilatih</label><select id="quiz-mode">
        <option value="jlpt-reading">Kanji → Hiragana (JLPT)</option>
        <option value="reading">Kanji → Hiragana (Per kata)</option>
        <option value="hiragana-kanji">Hiragana → Kanji</option>
        <option value="english-katakana">English → Katakana</option>
        <option value="meaning">Kanji → Arti Indonesia</option>
        <option value="kanji">Arti Indonesia → Kanji</option>
      </select></div>
      <div class="field"><label for="quiz-level">Level latihan</label><select id="quiz-level" aria-describedby="quiz-level-note"></select></div>
      <div class="field"><label for="quiz-count">Jumlah soal</label><select id="quiz-count">
        <option value="10">10 soal</option><option value="20">20 soal</option><option value="50">50 soal</option><option value="custom">Custom · Isi sendiri</option>
      </select><div class="quiz-custom-count" id="quiz-custom-field" hidden>
        <label for="quiz-custom-count">Jumlah soal custom</label><input type="number" id="quiz-custom-count" min="1" step="1" inputmode="numeric" placeholder="Misalnya 30" aria-describedby="quiz-count-error quiz-note">
        <small id="quiz-count-error" role="alert" hidden>Masukkan jumlah soal berupa bilangan bulat, minimal 1.</small>
      </div></div>
      <div class="field"><label for="quiz-time">Waktu per soal</label><select id="quiz-time"><option value="0">Santai, tanpa timer</option><option value="15">15 detik</option><option value="30">30 detik</option></select></div>
    </div>
    <p class="quiz-level-note" id="quiz-level-note"></p>
    <section class="reading-intro" id="quiz-intro" aria-label="Tentang mode latihan"></section>
    <p class="setup-note" id="quiz-note" role="status"></p>
    <button class="primary" data-action="quiz-start">Mulai kuis ${icon('arrow')}</button>
    <p class="reading-disclaimer">Latihan buatan, bukan soal resmi JLPT. Level mengikuti sumber belajar komunitas dan pengelompokan latihan.</p>
  </div>`;
}
