import type { PointId, Sign } from "./types.js";

export const wheelPointCollections = {
  planets: [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
  ],
  nodes: [
    "north_node_true", "south_node_true", "north_node_mean", "south_node_mean",
  ],
  angles: [
    "ascendant", "descendant", "midheaven", "imum_coeli",
    "vertex", "antivertex", "east_point",
  ],
  lots: ["part_of_fortune", "part_of_spirit"],
  lilith: ["lilith_mean", "lilith_true"],
} as const satisfies Readonly<Record<string, readonly PointId[]>>;

export type WheelPointCollection = keyof typeof wheelPointCollections;
export type WheelGlyphCollection = "zodiac" | WheelPointCollection;

/**
 * Controls which glyph-bearing chart elements are included in wheel layout.
 *
 * Precedence is deliberately most-specific first:
 * individual point/sign override -> collection override -> default -> visible.
 * This lets a caller disable a whole collection and selectively re-enable one
 * member without rebuilding the collection definition.
 */
export interface WheelGlyphVisibility {
  /** Base state for glyphs without a more specific override. Defaults to true. */
  default?: boolean;
  collections?: Readonly<Partial<Record<WheelGlyphCollection, boolean>>>;
  points?: Readonly<Partial<Record<PointId, boolean>>>;
  signs?: Readonly<Partial<Record<Sign, boolean>>>;
}

/** false hides every glyph; true/undefined preserves the complete default wheel. */
export type WheelGlyphs = boolean | WheelGlyphVisibility;

const collectionByPoint = new Map<PointId, WheelPointCollection>();
for (const [collection, pointIds] of Object.entries(wheelPointCollections) as Array<[WheelPointCollection, readonly PointId[]]>) {
  for (const pointId of pointIds) collectionByPoint.set(pointId, collection);
}

const baseVisibility = (glyphs: WheelGlyphs | undefined): boolean => {
  if (glyphs === false) return false;
  if (glyphs === true || glyphs === undefined) return true;
  return glyphs.default ?? true;
};

export const pointGlyphCollection = (pointId: PointId): WheelPointCollection | null =>
  collectionByPoint.get(pointId) ?? null;

export const pointGlyphVisible = (pointId: PointId, glyphs?: WheelGlyphs): boolean => {
  if (typeof glyphs === "boolean" || glyphs === undefined) return baseVisibility(glyphs);
  const individual = glyphs.points?.[pointId];
  if (individual !== undefined) return individual;
  const collection = pointGlyphCollection(pointId);
  const grouped = collection === null ? undefined : glyphs.collections?.[collection];
  return grouped ?? baseVisibility(glyphs);
};

export const signGlyphVisible = (sign: Sign, glyphs?: WheelGlyphs): boolean => {
  if (typeof glyphs === "boolean" || glyphs === undefined) return baseVisibility(glyphs);
  const individual = glyphs.signs?.[sign];
  if (individual !== undefined) return individual;
  return glyphs.collections?.zodiac ?? baseVisibility(glyphs);
};

export const pointGlyphPredicate = (glyphs?: WheelGlyphs): ((pointId: PointId) => boolean) =>
  (pointId) => pointGlyphVisible(pointId, glyphs);

const pointElement = (wheel: HTMLElement, pointId: PointId): SVGGElement | null =>
  wheel.querySelector<SVGGElement>(`.wheel-point[data-point="${pointId}"]`);

/**
 * Changes only the visibility and focusability of an already-rendered point.
 * Use renderWheel/renderSvg glyph options when hidden points should also be
 * removed from collision lanes, leaders, ticks and aspect endpoints.
 */
export function setChartWheelPointVisibility(
  wheel: HTMLElement,
  pointId: PointId,
  visible: boolean,
): void {
  const point = pointElement(wheel, pointId);
  if (point === null) return;

  point.style.display = visible ? "" : "none";
  point.setAttribute("aria-hidden", String(!visible));
  point.setAttribute("tabindex", visible ? "0" : "-1");
  if (!visible) {
    point.classList.remove("is-active", "wheel-tooltip-active", "wheel-tooltip-endpoint");
  }
}

export function setChartWheelPointsVisibility(
  wheel: HTMLElement,
  visibility: Readonly<Partial<Record<PointId, boolean>>>,
): void {
  for (const [rawPointId, visible] of Object.entries(visibility)) {
    if (visible === undefined) continue;
    setChartWheelPointVisibility(wheel, rawPointId as PointId, visible);
  }
}

/** Convenience helper for interactive post-render collection toggles. */
export function setChartWheelCollectionVisibility(
  wheel: HTMLElement,
  collection: WheelPointCollection,
  visible: boolean,
): void {
  for (const pointId of wheelPointCollections[collection]) {
    setChartWheelPointVisibility(wheel, pointId, visible);
  }
}
