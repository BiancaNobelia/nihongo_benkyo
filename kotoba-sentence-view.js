import {exampleSentenceMarkup} from './kanji-sentence-view.js?v=20261024-credits';

const DATA_URL = new URL('./data/kotoba-sentences.json?v=20261126-kotoba-photo-22-25', import.meta.url);
let pending;

function loadKotobaSentences() {
  pending ??= fetch(DATA_URL, {signal:AbortSignal.timeout(20000)}).then(response => {
    if (!response.ok) throw new Error('Kotoba examples could not be loaded.');
    return response.json();
  }).then(data => {
    if (data.version !== 1 || !data.entries || !Array.isArray(data.records)) throw new Error('Invalid Kotoba examples.');
    return data;
  }).catch(error => {
    pending = undefined;
    throw error;
  });
  return pending;
}

export function findKotobaSentence(data, entryIds) {
  for (const id of entryIds) {
    if (Object.hasOwn(data.entries, id)) return data.records[data.entries[id]];
  }
  return undefined;
}

export async function showKotobaSentence(panel, question, escape, load = loadKotobaSentences) {
  panel.hidden = false;
  panel.textContent = 'Memuat contoh kalimat…';
  try {
    const sentence = findKotobaSentence(await load(), question.entryIds);
    if (!panel.isConnected) return;
    if (!sentence) {
      panel.textContent = 'Contoh kalimat belum tersedia untuk kosakata ini.';
      return;
    }
    const attribution = sentence.origin === 'tatoeba' && Number.isSafeInteger(sentence.reference)
      ? `<a class="example-sentence-source" href="https://tatoeba.org/en/sentences/show/${sentence.reference}" target="_blank" rel="noopener noreferrer">Tatoeba #${sentence.reference}</a> · <a class="example-sentence-source" href="https://creativecommons.org/licenses/by/2.0/fr/" target="_blank" rel="noopener noreferrer">CC BY 2.0 FR</a>${sentence.adapted ? ' · Diadaptasi' : ''}`
      : '<a class="example-sentence-source" href="#kredit/sentences">Sumber contoh</a>';
    panel.innerHTML = exampleSentenceMarkup(sentence, escape) + `<div class="kotoba-sentence-source">${attribution}</div>`;
  } catch {
    if (!panel.isConnected) return;
    panel.innerHTML = 'Contoh kalimat gagal dimuat. <button type="button" class="text-button">Coba lagi</button>';
    panel.querySelector('button').addEventListener('click', () => showKotobaSentence(panel, question, escape, load), {once:true});
  }
}
