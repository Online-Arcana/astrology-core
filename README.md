# astrology-core

Deterministic astrology calculation and chart-wheel rendering.

## Structure

- `src/astro/` planetary and lunar astronomy
- `src/time/` civil-time and timezone resolution
- `src/place/` place catalogue
- `src/zodiac/` zodiac positions and ayanamsha
- `src/house/` angles and houses
- `src/aspect/` aspect detection
- `src/dignity/` dignity calculation
- `src/derived/` derived chart values
- `src/pattern/` chart patterns
- `src/compat/` deterministic compatibility
- `src/eclipse/` eclipse calculation
- `src/calculate/` complete deterministic calculation
- `src/random/` random complete-chart generator
- `src/wheel/` wheel data, public metadata and rendering
- `src/types/` public types
- `src/hash/` fingerprint primitives
- `vendor/astronomy/` Astronomia
- `vendor/time/` ts-joda
- `vendor/places/` countrystatecity

## API

`calc(input, options, ports)` returns a `Calculation`.

`loadPorts(version)` loads the vendored calculation adapters.

`randomChart(options)` returns a complete exact-time random `Calculation`.

`wheelData(calculation)` projects a calculation into render data.

`renderWheel(data, options?)` renders the browser wheel.

`renderSvg(data, options?)` renders the same wheel as standalone SVG.

`fromPublic(meta)` converts public wheel metadata into render data.

`renderPublicWheel(meta, options?)` renders public wheel metadata.

### Glyph visibility

Wheel glyphs are visible by default. Both browser and standalone SVG rendering accept the same `glyphs` option.

Collections are:

- `zodiac`: the twelve zodiac sign glyphs
- `planets`: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto
- `nodes`: true/mean north and south nodes
- `angles`: Ascendant, Descendant, Midheaven, Imum Coeli, Vertex, Antivertex and East Point
- `lots`: Part of Fortune and Part of Spirit
- `lilith`: mean and true Black Moon Lilith

Collection visibility can be overridden per point or per zodiac sign. Individual overrides take precedence over collection settings, and collection settings take precedence over `default`.

```ts
renderWheel(data, {
  glyphs: {
    collections: {
      nodes: false,
      lots: false,
      lilith: false,
    },
    points: {
      north_node_true: true,
    },
  },
});
```

For a strict allow-list, set `default: false` and enable only the collections or individual glyphs needed:

```ts
renderSvg(data, {
  glyphs: {
    default: false,
    collections: {
      zodiac: true,
      planets: true,
    },
  },
});
```

Hidden chart points are removed before collision-lane placement, so they do not leave empty lanes, leaders or ticks. Aspects whose endpoint is hidden are omitted as well. The existing `setChartWheelPointVisibility`, `setChartWheelPointsVisibility` and `setChartWheelCollectionVisibility` helpers remain available for post-render interactive toggles when preserving the original layout is desired.
