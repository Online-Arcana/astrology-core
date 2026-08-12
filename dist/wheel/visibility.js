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
};
const collectionByPoint = new Map();
for (const [collection, pointIds] of Object.entries(wheelPointCollections)) {
    for (const pointId of pointIds)
        collectionByPoint.set(pointId, collection);
}
const baseVisibility = (glyphs) => {
    if (glyphs === false)
        return false;
    if (glyphs === true || glyphs === undefined)
        return true;
    return glyphs.default ?? true;
};
export const pointGlyphCollection = (pointId) => collectionByPoint.get(pointId) ?? null;
export const pointGlyphVisible = (pointId, glyphs) => {
    if (typeof glyphs === "boolean" || glyphs === undefined)
        return baseVisibility(glyphs);
    const individual = glyphs.points?.[pointId];
    if (individual !== undefined)
        return individual;
    const collection = pointGlyphCollection(pointId);
    const grouped = collection === null ? undefined : glyphs.collections?.[collection];
    return grouped ?? baseVisibility(glyphs);
};
export const signGlyphVisible = (sign, glyphs) => {
    if (typeof glyphs === "boolean" || glyphs === undefined)
        return baseVisibility(glyphs);
    const individual = glyphs.signs?.[sign];
    if (individual !== undefined)
        return individual;
    return glyphs.collections?.zodiac ?? baseVisibility(glyphs);
};
export const pointGlyphPredicate = (glyphs) => (pointId) => pointGlyphVisible(pointId, glyphs);
const pointElement = (wheel, pointId) => wheel.querySelector(`.wheel-point[data-point="${pointId}"]`);
/**
 * Changes only the visibility and focusability of an already-rendered point.
 * Use renderWheel/renderSvg glyph options when hidden points should also be
 * removed from collision lanes, leaders, ticks and aspect endpoints.
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
/** Convenience helper for interactive post-render collection toggles. */
export function setChartWheelCollectionVisibility(wheel, collection, visible) {
    for (const pointId of wheelPointCollections[collection]) {
        setChartWheelPointVisibility(wheel, pointId, visible);
    }
}
//# sourceMappingURL=visibility.js.map