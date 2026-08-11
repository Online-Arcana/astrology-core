import type { PointId } from "./types.js";
/**
 * Changes only the visibility and focusability of an already-rendered point.
 * The wheel's geometry, collision lanes, leaders, ticks and aspect lines are
 * deliberately left untouched so consumers can add glyph controls without
 * changing the existing deterministic layout.
 */
export declare function setChartWheelPointVisibility(wheel: HTMLElement, pointId: PointId, visible: boolean): void;
export declare function setChartWheelPointsVisibility(wheel: HTMLElement, visibility: Readonly<Partial<Record<PointId, boolean>>>): void;
//# sourceMappingURL=chartWheelVisibility.d.ts.map