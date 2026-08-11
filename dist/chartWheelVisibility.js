const pointElement = (wheel, pointId) => wheel.querySelector(`.wheel-point[data-point="${pointId}"]`);
/**
 * Changes only the visibility and focusability of an already-rendered point.
 * The wheel's geometry, collision lanes, leaders, ticks and aspect lines are
 * deliberately left untouched so consumers can add glyph controls without
 * changing the existing deterministic layout.
 */
export function setChartWheelPointVisibility(wheel, pointId, visible) {
    const point = pointElement(wheel, pointId);
    if (point === null)
        return;
    point.style.display = visible ? "" : "none";
    point.setAttribute("aria-hidden", String(!visible));
    point.setAttribute("tabindex", visible ? "0" : "-1");
    if (!visible) {
        point.classList.remove("is-active", "wheel-tooltip-active", "wheel-tooltip-endpoint");
    }
}
export function setChartWheelPointsVisibility(wheel, visibility) {
    for (const [rawPointId, visible] of Object.entries(visibility)) {
        if (visible === undefined)
            continue;
        setChartWheelPointVisibility(wheel, rawPointId, visible);
    }
}
//# sourceMappingURL=chartWheelVisibility.js.map