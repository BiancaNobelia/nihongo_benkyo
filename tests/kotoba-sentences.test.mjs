import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KOTOBA_COURSES} from '../kotoba-courses.js';
import {getKotobaPool} from '../kotoba-core.js';
import {findKotobaSentence, showKotobaSentence} from '../kotoba-sentence-view.js';

const data = JSON.parse(readFileSync(new URL('../data/kotoba-sentences.json', import.meta.url)));
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

test('Kotoba example records link to real entries and highlight text within the sentence', () => {
  const entries = Object.values(KOTOBA_COURSES).flatMap(course => course.entries);
  const ids = new Set(entries.map(entry => entry.id));
  assert.ok(Object.keys(data.entries).every(id => ids.has(id)));
  for (const entry of entries.filter(e => e.chapter <= 18 || e.chapter >= 49)) {
    assert.ok(findKotobaSentence(data, [entry.id]), entry.id);
  }
  for (const record of data.records) {
    assert.ok(record.text && record.translation);
    assert.ok(record.targetStart >= 0 && record.targetLength > 0);
    assert.ok(record.targetStart + record.targetLength <= record.text.length);
    for (const [offset, written] of record.furigana) {
      assert.equal(record.text.slice(offset, offset + written.length), written);
    }
    if (record.origin === 'tatoeba') assert.ok(Number.isSafeInteger(record.reference));
  }
});

test('examples follow the selected chapter and course rather than a shared spelling alone', () => {
  const minna = KOTOBA_COURSES.minna.entries;
  for (const [chapter, expected] of [[30, /lukisan/i], [38, /mengunci/i], [49, /duduk/i]]) {
    const question = getKotobaPool(minna,{chapters:[chapter]}).find(q => q.word === '掛けます');
    assert.match(findKotobaSentence(data,question.entryIds).translation, expected);
  }
  for (const [chapter, word, expected] of [
    [4, '～から', /mulai pukul/],
    [5, 'そうですね。', /Ya, betul/],
    [8, 'そうですね。', /bagaimana ya/],
    [9, '～から', /karena/],
    [5, '～年', /pada tahun 2027/],
    [7, '教えます', /mengajar bahasa Jepang/],
    [11, '～年', /selama dua tahun/],
    [11, 'かかります', /perlu sepuluh menit/],
    [3, 'どちら', /di sebelah mana/],
    [12, 'どちら', /musim panas atau musim dingin/],
    [12, 'いい', /Saya pilih kopi/],
    [14, '教えます', /alamat baru/],
    [14, '出ます', /keluar dari kedai kopi/],
    [15, '作ります', /membuat kari/],
    [15, '造ります', /membuat kapal/],
    [16, '入ります', /masuk universitas/],
    [16, '出ます', /lulus dari universitas/],
    [16, '飲みます', /minum bir/],
    [17, '入ります', /mandi berendam/],
    [17, '飲みます', /minum obat/],
    [17, '～までに', /paling lambat hari Jumat/],
    [18, 'できます', /bisa bermain piano/],
  ]) {
    const entry = minna.find(e => e.chapter === chapter && e.spelling === word);
    assert.match(findKotobaSentence(data, [entry.id]).translation, expected);
  }
  const presenceEntries = minna.filter(e => e.chapter === 11 && e.spelling === 'います');
  assert.deepEqual(presenceEntries.map(e => findKotobaSentence(data, [e.id]).translation), [
    'Saya mempunyai dua anak.',
    'Kakak laki-laki saya sekarang berada di Jepang.',
  ]);
  const incomingCall = minna.find(e => e.chapter === 35 && e.spelling === 'かかります');
  assert.doesNotMatch(findKotobaSentence(data, [incomingCall.id])?.translation ?? '', /sepuluh menit/);
  const question = getKotobaPool(KOTOBA_COURSES.n3.entries).find(q => q.word === '愛');
  assert.ok(findKotobaSentence(data,question.entryIds));
  assert.equal(findKotobaSentence(data,['toString']), undefined);
});

test('answer panel renders highlighted Japanese, translation, and source with escaping', async () => {
  const sample = {...data.records.find(record => record.origin === 'tatoeba'), translation:'<b>Terjemahan</b>'};
  const panel = {isConnected:true, hidden:true};
  await showKotobaSentence(panel, {entryIds:['prompt']}, escape, async () => ({entries:{prompt:0}, records:[sample]}));
  assert.equal(panel.hidden,false);
  assert.match(panel.innerHTML, /<ruby>/);
  assert.match(panel.innerHTML, /<mark /);
  assert.match(panel.innerHTML, /&lt;b&gt;Terjemahan&lt;\/b&gt;/);
  assert.match(panel.innerHTML, new RegExp('tatoeba.org/en/sentences/show/' + sample.reference));

  await showKotobaSentence(panel, {entryIds:['missing']}, escape, async () => data);
  assert.match(panel.textContent, /belum tersedia/);
});

test('a stale example response never updates a question that has been left', async () => {
  const panel = {isConnected:true, hidden:true};
  const update = showKotobaSentence(panel, {entryIds:Object.keys(data.entries).slice(0,1)}, escape, async () => data);
  panel.isConnected = false;
  await update;
  assert.equal(panel.innerHTML,undefined);
});
