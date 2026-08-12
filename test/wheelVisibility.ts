import { emptyWheelData } from "../src/wheel/data.js";
import { houseRomanNumeral, pointLayout } from "../src/wheel/geometry.js";
import { renderSvg } from "../src/wheel/svg.js";
import {
  pointGlyphCollection,
  pointGlyphVisible,
  signGlyphVisible,
  wheelPointCollections,
} from "../src/wheel/visibility.js";
import type { PointId } from "../src/wheel/types.js";

const equal = <T>(actual: T, expected: T, message: string): void => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
};
const ok = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

let passed = 0;
const test = async (name: string, run: () => void | Promise<void>): Promise<void> => {
  await run();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
};

await test("point collections cover the complete canonical point model exactly once", () => {
  const entries = Object.entries(wheelPointCollections).flatMap(([collection, points]) =>
    points.map((point) => [collection, point] as const));
  const ids = entries.map(([, point]) => point);
  equal(ids.length, 25, "collection member count");
  equal(new Set(ids).size, 25, "unique collection member count");
  equal(pointGlyphCollection("sun"), "planets", "Sun collection");
  equal(pointGlyphCollection("north_node_true"), "nodes", "true node collection");
  equal(pointGlyphCollection("ascendant"), "angles", "Ascendant collection");
  equal(pointGlyphCollection("part_of_spirit"), "lots", "Spirit collection");
  equal(pointGlyphCollection("lilith_true"), "lilith", "Lilith collection");
});

await test("individual visibility overrides collection visibility", () => {
  const glyphs = {
    collections: { nodes: false },
    points: { north_node_true: true },
  } as const;
  equal(pointGlyphVisible("north_node_true", glyphs), true, "specific node override");
  equal(pointGlyphVisible("south_node_true", glyphs), false, "other node remains hidden");
  equal(pointGlyphVisible("sun", glyphs), true, "unconfigured planet remains visible");
});

await test("default false supports clean collection allow-lists", () => {
  const glyphs = {
    default: false,
    collections: { zodiac: true, planets: true },
  } as const;
  equal(pointGlyphVisible("sun", glyphs), true, "planet allow-list");
  equal(pointGlyphVisible("north_node_true", glyphs), false, "node excluded from allow-list");
  equal(pointGlyphVisible("ascendant", glyphs), false, "angle excluded from allow-list");
  equal(signGlyphVisible("capricorn", glyphs), true, "zodiac allow-list");
});

await test("individual zodiac sign overrides the zodiac collection", () => {
  const glyphs = {
    collections: { zodiac: false },
    signs: { capricorn: true },
  } as const;
  equal(signGlyphVisible("capricorn", glyphs), true, "specific sign override");
  equal(signGlyphVisible("aquarius", glyphs), false, "other sign hidden");
});

await test("house labels use Roman numerals", () => {
  const expected = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  for (let index = 0; index < expected.length; index += 1) {
    equal(houseRomanNumeral(index + 1), expected[index], `house ${index + 1}`);
  }
});

await test("hidden points are removed before collision-lane assignment", () => {
  const wheel = emptyWheelData("visibility-lanes");
  wheel.points.sun.position.value = { longitudeDegrees: 10 };
  wheel.points.north_node_true.position.value = { longitudeDegrees: 11 };
  wheel.points.moon.position.value = { longitudeDegrees: 12 };
  const all = pointLayout(wheel);
  const filtered = pointLayout(wheel, (id) => id !== "north_node_true");
  equal(all.find(({ id }) => id === "moon")?.lane, 2, "Moon lane with node present");
  equal(filtered.find(({ id }) => id === "moon")?.lane, 1, "Moon lane after node removal");
});

await test("static SVG can render only zodiac and planetary glyph collections", async () => {
  const wheel = emptyWheelData("visibility-svg");
  const values: Partial<Record<PointId, number>> = {
    sun: 10,
    moon: 70,
    north_node_true: 130,
    ascendant: 190,
    part_of_fortune: 250,
    lilith_true: 310,
  };
  for (const [rawId, longitudeDegrees] of Object.entries(values)) {
    wheel.points[rawId as PointId].position.value = { longitudeDegrees: longitudeDegrees! };
  }
  const svg = await renderSvg(wheel, {
    aspects: false,
    orientationDegrees: 190,
    untimedLabel: false,
    glyphs: {
      default: false,
      collections: { zodiac: true, planets: true },
    },
  });
  ok(svg.includes('data-point="sun"'), "Sun should render");
  ok(svg.includes('data-point="moon"'), "Moon should render");
  ok(!svg.includes('data-point="north_node_true"'), "node should not render");
  ok(!svg.includes('data-point="ascendant"'), "angle should not render");
  ok(!svg.includes('data-point="part_of_fortune"'), "lot should not render");
  ok(!svg.includes('data-point="lilith_true"'), "Lilith should not render");
  equal((svg.match(/class="zodiac-glyph"/gu) ?? []).length, 12, "zodiac glyph count");
});

console.log(`1..${passed}`);
