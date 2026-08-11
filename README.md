# Astral Chart Wheel

Shared deterministic SVG chart-wheel rendering components for Online Arcana projects.

`astral-chart-wheel` owns the visual wheel renderer and reusable visual identity pieces shared by `Online-Arcana/astrology` and `Online-Arcana/astral-identicons`. It does not calculate astronomical positions and it does not encode identity data.

## First extraction contract

The initial extraction is deliberately behaviour-preserving. The natal renderer is the existing `Online-Arcana/astrology` chart-wheel implementation with only its TypeScript input imports replaced by the structural `ChartWheelCalculation` contract in this package. Its geometry, DOM structure, classes, collision lanes, aspect rendering, glyph selection and browser behaviour are unchanged.

The package also owns the neutral 3×3 literal-sign placement function previously embedded in `astral-identicons`.

Shared assets are copied byte-for-byte from the source revisions recorded in `SOURCE_REVISIONS`:

- `assets/astrology-glyphs/`: the canonical astrology glyph pack previously owned by `Online-Arcana/astrology`, including zodiac, planet, angle, node and point SVGs.
- `assets/constellations/`: the twelve artistic constellation SVGs previously owned by `Online-Arcana/astral-identicons`.
- `assets/reed-solomon/star.svg`: the star SVG used by the identicon Reed-Solomon visual layer.
- `styles/chart-wheel.css`: the current chart-wheel stylesheet from `Online-Arcana/astrology`.

## Public `.astral` wheel reconstruction

`astral-packager` 0.7 / `ASTRPKG5` exposes a small public `astral-public-wheel/1.0.0` metadata object without decrypting the packaged chart. It contains exactly the deterministic geometry required by this renderer.

A consumer can therefore reconstruct a natal wheel without opening the encrypted payload:

```ts
import { readWheel } from "astral-packager";
import { renderPublicChartWheel } from "astral-chart-wheel";

const wheel = readWheel(bytes);
if (wheel !== null) host.replaceChildren(renderPublicChartWheel(wheel));
```

`chartWheelCalculationFromPublicMeta()` is also exported when a caller needs the renderer's structural input rather than a DOM element directly.

Consumers pin this repository as `vendor/astral-chart-wheel`. Existing application-facing asset paths may be mirrored into their build output so dependency extraction does not change URLs or rendering.

## Licence

MIT
