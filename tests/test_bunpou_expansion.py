import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]

def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / f'{name}.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

builder = load('build_bunpou_expansion')
grammar = load('build_bunpou')

class BunpouExpansionValidation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.patterns = [q for line in (ROOT / 'bunpou-data.js').read_text(encoding='utf-8').splitlines()
                        if line.strip().startswith('{')
                        for q in [json.loads(line.strip().rstrip(','))] if not q.get('patternId')]

    def test_future_vocabulary_is_rejected(self):
        words = builder.load_kotoba()
        words[2] = {**words[2], 'chapter': 2}
        with patch.object(builder, 'load_kotoba', return_value=words):
            with self.assertRaisesRegex(AssertionError, 'chapter 2'):
                builder.build_expansion(self.patterns, grammar.parse_furigana)

    def altered_file(self, filename, before, after, error):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            for name in ['bunpou-wordsets.txt', 'bunpou-families.txt', 'bunpou-expansion-order.json']:
                text = (ROOT / 'data' / name).read_text(encoding='utf-8')
                if name == filename:
                    self.assertIn(before, text)
                    text = text.replace(before, after, 1)
                (target / name).write_text(text, encoding='utf-8')
            with patch.object(builder, 'DATA', target):
                with self.assertRaisesRegex(AssertionError, error):
                    builder.build_expansion(self.patterns, grammar.parse_furigana)

    def test_untagged_content_words_are_rejected(self):
        self.altered_file('bunpou-families.txt', '私[わたし]~2 / は', 'ロボット / は', 'unreferenced word')

    def test_missing_readings_are_rejected(self):
        self.altered_file('bunpou-wordsets.txt', '教師[きょうし]~12', '教師~12', 'incomplete furigana')

    def test_duplicate_examples_are_rejected(self):
        self.altered_file('bunpou-wordsets.txt', '学生[がくせい]~13|pelajar', '教師[きょうし]~12|guru', 'duplicate example')

    def test_unknown_vocabulary_references_are_rejected(self):
        self.altered_file('bunpou-wordsets.txt', '教師[きょうし]~12', '教師[きょうし]~99999', 'unknown Kotoba row')

if __name__ == '__main__':
    unittest.main()
