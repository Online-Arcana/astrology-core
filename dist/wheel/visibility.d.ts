import type { PointId, Sign } from "./types.js";
export declare const wheelPointCollections: {
    readonly planets: readonly ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
    readonly nodes: readonly ["north_node_true", "south_node_true", "north_node_mean", "south_node_mean"];
    readonly angles: readonly ["ascendant", "descendant", "midheaven", "imum_coeli", "vertex", "antivertex", "east_point"];
    readonly lots: readonly ["part_of_fortune", "part_of_spirit"];
    readonly lilith: readonly ["lilith_mean", "lilith_true"];
};
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
export declare const pointGlyphCollection: (pointId: PointId) => WheelPointCollection | null;
export declare const pointGlyphVisible: (pointId: PointId, glyphs?: WheelGlyphs) => boolean;
export declare const signGlyphVisible: (sign: Sign, glyphs?: WheelGlyphs) => boolean;
export declare const pointGlyphPredicate: (glyphs?: WheelGlyphs) => ((pointId: PointId) => boolean);
/**
 * Changes only the visibility and focusability of an already-rendered point.
 * Use renderWheel/renderSvg glyph options when hidden points should also be
 * removed from collision lanes, leaders, ticks and aspect endpoints.
 */
export declare function setChartWheelPointVisibility(wheel: HTMLElement, pointId: PointId, visible: boolean): void;
export declare function setChartWheelPointsVisibility(wheel: HTMLElement, visibility: Readonly<Partial<Record<PointId, boolean>>>): void;
/** Convenience helper for interactive post-render collection toggles. */
export declare function setChartWheelCollectionVisibility(wheel: HTMLElement, collection: WheelPointCollection, visible: boolean): void;
//# sourceMappingURL=visibility.d.ts.map