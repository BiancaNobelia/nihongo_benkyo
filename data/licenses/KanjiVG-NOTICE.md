# KanjiVG component data

KanjiVG © 2009–2026 Ulrich Apel and contributors.

Source: https://kanjivg.tagaini.net/

Pinned release: https://github.com/KanjiVG/kanjivg/releases/tag/r20260714

License: Creative Commons Attribution-ShareAlike 3.0 Unported
https://creativecommons.org/licenses/by-sa/3.0/
Legal code: https://creativecommons.org/licenses/by-sa/3.0/legalcode

`radical-members.js` is an adaptation of the component labels in the KanjiVG
XML release, extracted on 13 October 2026. It keeps only complete components
at the whole-character or immediate-child level, for characters in the site's
local catalog. Nested subcomponents and partial shapes are excluded. It does
not include vector paths, stroke drawings, or stroke numbers.

The extracted component data remains available under CC BY-SA 3.0.
`kanji-components-data.js` also adapts labels from the same pinned release,
using `scripts/build_components.py`. Unnamed groups are flattened; split
enclosing frames are recombined. Only decompositions of two to four complete,
named parts with known Indonesian glosses are kept. Partial or unknown parts,
unreviewed variant mappings and incomplete frames are omitted. The data
describes visible structure, not historical etymology. No vector paths are used.
Editorial explanations and Indonesian translations are added separately.
See `data/radical-source.json` for the source URL and SHA-256 checksum, and
`scripts/build_radicals.py` for the extraction procedure.
