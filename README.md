# astral-core

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

`renderWheel(data)` renders the browser wheel.

`fromPublic(meta)` converts public wheel metadata into render data.

`renderPublicWheel(meta)` renders public wheel metadata.
