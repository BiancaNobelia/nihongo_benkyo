"""Keep unknown shapes out of educational component explanations."""
from pathlib import Path
import sys
import unittest
import xml.etree.ElementTree as ET

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from build_components import decompose
from build_radicals import visible_components


def node(body):
    return ET.fromstring(f'<g xmlns:kvg="http://kanjivg.tagaini.net">{body}</g>')


class ConservativeComponents(unittest.TestCase):
    def test_gate_family_includes_whole_nested_gates_only(self):
        nested = node('<g kvg:element="間"><g kvg:element="門"/></g>')
        self.assertIn('門', visible_components(nested))
        for attributes in ['kvg:partial="true"', 'kvg:part="1"']:
            for body in [f'<g kvg:element="門" {attributes}/>',
                         f'<g kvg:element="間"><g kvg:element="門" {attributes}/></g>']:
                self.assertNotIn('門', visible_components(node(body)))
        other_family = node('<g kvg:element="禾"><g kvg:element="木"/></g>')
        self.assertNotIn('木', visible_components(other_family))

    def test_partial_and_unlabelled_strokes_are_not_complete_parts(self):
        for body in ['<g kvg:element="木"/><path/>',
                     '<g kvg:element="木"/><g kvg:element="玉" kvg:partial="true"/>']:
            self.assertEqual(decompose(node(body), {}), [])

    def test_unknown_parts_and_variants_are_not_guessed(self):
        for body in ['<g kvg:element="木"/><g kvg:element="𠂉"/>',
                     '<g kvg:element="木"/><g kvg:element="刀" kvg:original="力"/>']:
            self.assertEqual(decompose(node(body), {'刀': 'Pedang'}), [])

    def test_frame_parts_must_recombine_to_a_complete_frame(self):
        opening = '<g kvg:element="囗" kvg:position="kamae" kvg:part="1"/>'
        middle = '<g kvg:element="玉"/>'
        closing = '<g kvg:element="囗" kvg:position="kamae" kvg:part="2"/>'
        self.assertEqual(decompose(node(opening + middle), {}), [])
        parts = decompose(node(opening + middle + closing), {})
        self.assertEqual([p['symbol'] for p in parts], ['囗', '玉'])
        self.assertEqual(parts[1]['position'], 'di dalam')


if __name__ == '__main__':
    unittest.main()
