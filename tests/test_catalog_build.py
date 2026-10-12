"""Prevent dictionary updates from silently falling back to machine translation."""
from copy import deepcopy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from assemble_catalog import load, validate_review


class TranslationReviewGate(unittest.TestCase):
    def setUp(self):
        self.source = load('catalog-source.json')
        self.reviewed = load('reviewed-id.json')

    def test_current_review_is_valid(self):
        validate_review(self.source, self.reviewed)

    def test_unreviewed_new_card_is_rejected(self):
        source = deepcopy(self.source)
        source.append({'char': '龘'})
        with self.assertRaisesRegex(ValueError, 'coverage mismatch'):
            validate_review(source, self.reviewed)

    def test_missing_review_is_rejected(self):
        del self.reviewed['entries'][self.source[0]['char']]
        with self.assertRaisesRegex(ValueError, 'coverage mismatch'):
            validate_review(self.source, self.reviewed)

    def test_changed_dictionary_requires_another_review(self):
        self.reviewed['sourceSha256'] = 'outdated source'
        with self.assertRaisesRegex(ValueError, 'dictionary source changed'):
            validate_review(self.source, self.reviewed)


if __name__ == '__main__':
    unittest.main()
