# Astral Chart Wheel

Shared deterministic SVG chart-wheel rendering components for Online Arcana projects.

`astral-chart-wheel` owns the visual wheel renderer and the visual assets shared by `Online-Arcana/astrology` and `Online-Arcana/astral-identicons`. It does not calculate astronomical positions and it does not encode identity data.

## First extraction contract

The initial extraction is deliberately behaviour-preserving. The renderer is the existing `Online-Arcana/astrology` chart-wheel implementation with only its TypeScript input imports replaced by the structural `ChartWheelCalculation` contract in this package. Its geometry, DOM structure, classes, collision lanes, aspect rendering, glyph selection and browser behaviour are unchanged.

Shared assets are copied byte-for-byte from the source revisions recorded in `SOURCE_REVISIONS`:

- `assets/astrology-glyphs/`: the canonical astrology glyph pack previously owned by `Online-Arcana/astrology`, including zodiac, planet, angle, node and point SVGs.
- `assets/constellations/`: the twelve artistic constellation SVGs previously owned by `Online-Arcana/astral-identicons`.
- `assets/reed-solomon/star.svg`: the star SVG used by the identicon Reed-Solomon visual layer.
- `styles/chart-wheel.css`: the current chart-wheel stylesheet from `Online-Arcana/astrology`.

Consumers pin this repository as `vendor/astral-chart-wheel`. Existing application-facing paths may be mirrored into their build output so this extraction does not change URLs or rendering.
