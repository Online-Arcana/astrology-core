import type { PointId } from "./types.js";

const pointElement = (wheel: HTMLElement, pointId: PointId): SVGGElement | null =>
  wheel.querySelector<SVGGElement>(`.wheel-point[data-point="${pointId}"]`);

/**
 * Changes only the visibility and focusability of an already-rendered point.
 * The wheel's geometry, collision lanes, leaders, ticks and aspect lines are
 * deliberately left untouched so consumers can add glyph controls without
 * changing the existing deterministic layout.
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
