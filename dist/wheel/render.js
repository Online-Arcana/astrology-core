import { aspectSegment, forward as forwardDistance, normalise, pointGlyphs as pointFallback, pointLayout, polar, sector as sectorPath, signGlyphs, signOrder, titleCase, wheelCentre as centre, wheelRadii as radii, wheelSize as size } from "./geometry.js";
const svgNamespace = "http://www.w3.org/2000/svg";
let wheelInstance = 0;
const svg = (name) => document.createElementNS(svgNamespace, name);
const addGlyphColourFilter = (root) => {
    const id = `wheelGlyphColour${++wheelInstance}`;
    const definitions = svg("defs");
    const filter = svg("filter");
    filter.id = id;
    filter.setAttribute("x", "-10%");
    filter.setAttribute("y", "-10%");
    filter.setAttribute("width", "120%");
    filter.setAttribute("height", "120%");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    const matrix = svg("feColorMatrix");
    matrix.setAttribute("type", "matrix");
    matrix.setAttribute("values", [
        "0 0 0 0 0.968627451",
        "0 0 0 0 0.952941176",
        "0 0 0 0 1",
        "0 0 0 1 0",
    ].join(" "));
    filter.append(matrix);
    definitions.append(filter);
    root.append(definitions);
    return id;
};
const line = (parent, longitude, fromRadius, toRadius, ascendant, className) => {
    const from = polar(longitude, fromRadius, ascendant);
    const to = polar(longitude, toRadius, ascendant);
    const element = svg("line");
    element.setAttribute("x1", String(from.x));
    element.setAttribute("y1", String(from.y));
    element.setAttribute("x2", String(to.x));
    element.setAttribute("y2", String(to.y));
    element.setAttribute("class", className);
    parent.append(element);
    return element;
};
const glyphAsset = (id) => {
    const base = "./assets/astrology-glyphs/svg";
    if (["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(id)) {
        return { path: `${base}/planets/${id}.svg` };
    }
    switch (id) {
        case "ascendant":
        case "descendant":
        case "midheaven":
        case "imum_coeli":
        case "vertex":
        case "east_point": return { path: `${base}/angles/${id}.svg` };
        case "antivertex": return { path: `${base}/angles/vertex.svg`, rotation: 180 };
        case "north_node_true": return { path: `${base}/misc/true_node.svg`, modifier: "N" };
        case "south_node_true": return { path: `${base}/misc/true_node.svg`, modifier: "S" };
        case "north_node_mean": return { path: `${base}/misc/mean_node.svg`, modifier: "N" };
        case "south_node_mean": return { path: `${base}/misc/mean_node.svg`, modifier: "S" };
        case "part_of_fortune": return { path: `${base}/points/lot_of_fortune.svg` };
        case "part_of_spirit": return { path: `${base}/points/lot_of_spirit.svg` };
        case "lilith_mean": return { path: `${base}/points/black_moon_lilith.svg`, modifier: "M" };
        case "lilith_true": return { path: `${base}/points/black_moon_lilith.svg`, modifier: "T" };
        default: return null;
    }
};
const signAsset = (sign) => `./assets/astrology-glyphs/svg/zodiac/${sign}.svg`;
const addAssetGlyph = (parent, path, fallback, x, y, glyphSize, glyphFilterId, rotation = 0, modifier) => {
    const fallbackText = svg("text");
    fallbackText.textContent = fallback;
    fallbackText.setAttribute("x", String(x));
    fallbackText.setAttribute("y", String(y + glyphSize * 0.32));
    fallbackText.setAttribute("text-anchor", "middle");
    fallbackText.setAttribute("class", "wheel-glyph-fallback");
    fallbackText.setAttribute("font-size", String(glyphSize));
    parent.append(fallbackText);
    const image = svg("image");
    image.setAttribute("href", path);
    image.setAttribute("x", String(x - glyphSize / 2));
    image.setAttribute("y", String(y - glyphSize / 2));
    image.setAttribute("width", String(glyphSize));
    image.setAttribute("height", String(glyphSize));
    image.setAttribute("class", "wheel-glyph-image");
    image.setAttribute("filter", `url(#${glyphFilterId})`);
    if (rotation !== 0)
        image.setAttribute("transform", `rotate(${rotation} ${x} ${y})`);
    image.addEventListener("load", () => { fallbackText.style.display = "none"; }, { once: true });
    image.addEventListener("error", () => { image.remove(); }, { once: true });
    parent.append(image);
    if (modifier !== undefined) {
        const marker = svg("text");
        marker.textContent = modifier;
        marker.setAttribute("x", String(x + glyphSize * 0.42));
        marker.setAttribute("y", String(y - glyphSize * 0.28));
        marker.setAttribute("class", "wheel-glyph-modifier");
        marker.setAttribute("font-size", String(Math.max(8, glyphSize * 0.32)));
        parent.append(marker);
    }
};
const setSegment = (element, segment) => {
    element.setAttribute("x1", segment.start.x.toFixed(3));
    element.setAttribute("y1", segment.start.y.toFixed(3));
    element.setAttribute("x2", segment.end.x.toFixed(3));
    element.setAttribute("y2", segment.end.y.toFixed(3));
};
export const renderWheel = (calculation) => {
    const container = document.createElement("section");
    container.className = "chart-wheel";
    container.dataset["fingerprint"] = calculation.fingerprint;
    const graphic = document.createElement("div");
    graphic.className = "chart-wheel-graphic";
    const root = svg("svg");
    root.setAttribute("viewBox", `0 0 ${size} ${size}`);
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Interactive deterministic natal chart wheel");
    const glyphFilterId = addGlyphColourFilter(root);
    graphic.append(root);
    container.append(graphic);
    const ascendantPosition = calculation.points.ascendant.position.value;
    const ascendant = ascendantPosition?.longitudeDegrees ?? 180;
    const timed = ascendantPosition !== null;
    const frame = svg("circle");
    frame.setAttribute("cx", String(centre));
    frame.setAttribute("cy", String(centre));
    frame.setAttribute("r", String(radii.outer));
    frame.setAttribute("class", "wheel-frame");
    root.append(frame);
    const zodiacGroup = svg("g");
    zodiacGroup.setAttribute("class", "wheel-zodiac");
    root.append(zodiacGroup);
    for (let index = 0; index < signOrder.length; index += 1) {
        const sign = signOrder[index];
        if (sign === undefined)
            continue;
        const start = index * 30;
        const end = start + 30;
        const sector = svg("path");
        sector.setAttribute("d", sectorPath(start, end, radii.zodiacInner, radii.outer, ascendant));
        sector.setAttribute("class", `wheel-sign wheel-sign-${sign}`);
        sector.setAttribute("tabindex", "0");
        sector.dataset["sign"] = sign;
        zodiacGroup.append(sector);
        const glyphPoint = polar(normalise(start + 15), (radii.zodiacInner + radii.outer) / 2, ascendant);
        const glyphGroup = svg("g");
        glyphGroup.setAttribute("class", "wheel-sign-glyph");
        addAssetGlyph(glyphGroup, signAsset(sign), signGlyphs[sign], glyphPoint.x, glyphPoint.y, 31, glyphFilterId);
        zodiacGroup.append(glyphGroup);
    }
    for (let longitude = 0; longitude < 360; longitude += 5) {
        line(root, longitude, longitude % 30 === 0 ? radii.outer - 14 : radii.outer - 7, radii.outer, ascendant, longitude % 30 === 0 ? "wheel-degree-tick major" : "wheel-degree-tick");
    }
    const houseChart = calculation.houses[calculation.primaryHouseSystem];
    if (timed && houseChart.status !== "unavailable") {
        const houseGroup = svg("g");
        houseGroup.setAttribute("class", "wheel-houses");
        root.append(houseGroup);
        for (const house of Object.values(houseChart.houses)) {
            const cusp = house.cusp.value;
            const end = house.end.value;
            if (cusp === null || end === null)
                continue;
            const sector = svg("path");
            sector.setAttribute("d", sectorPath(cusp.longitudeDegrees, end.longitudeDegrees, radii.aspect, radii.zodiacInner, ascendant));
            sector.setAttribute("class", "wheel-house-sector");
            sector.setAttribute("tabindex", "0");
            sector.dataset["house"] = String(house.number);
            houseGroup.append(sector);
            line(houseGroup, cusp.longitudeDegrees, radii.aspect, radii.zodiacInner, ascendant, [1, 4, 7, 10].includes(house.number) ? "wheel-house-cusp angular" : "wheel-house-cusp");
            const middle = normalise(cusp.longitudeDegrees + forwardDistance(cusp.longitudeDegrees, end.longitudeDegrees) / 2);
            const labelPoint = polar(middle, 233, ascendant);
            const label = svg("text");
            label.textContent = String(house.number);
            label.setAttribute("x", String(labelPoint.x));
            label.setAttribute("y", String(labelPoint.y + 5));
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("class", "wheel-house-number");
            houseGroup.append(label);
        }
    }
    const placedPoints = pointLayout(calculation);
    const pointAnchors = new Map();
    for (const placed of placedPoints) {
        const radius = radii.pointBase - placed.lane * 24;
        pointAnchors.set(placed.id, polar(placed.longitude, radius, ascendant));
    }
    const aspects = svg("g");
    aspects.setAttribute("class", "wheel-aspects");
    root.append(aspects);
    for (const aspect of calculation.aspects) {
        const startAnchor = pointAnchors.get(aspect.a);
        const endAnchor = pointAnchors.get(aspect.b);
        if (startAnchor === undefined || endAnchor === undefined)
            continue;
        const segment = aspectSegment(aspect, startAnchor, endAnchor);
        const visible = svg("line");
        setSegment(visible, segment);
        visible.setAttribute("class", `wheel-aspect wheel-aspect-${aspect.character} ${aspect.class}${aspect.kind === "conjunction" ? " wheel-aspect-conjunction-marker" : ""}`);
        visible.dataset["aspect"] = aspect.id;
        visible.dataset["aspectKind"] = aspect.kind;
        visible.dataset["endpointA"] = aspect.a;
        visible.dataset["endpointB"] = aspect.b;
        aspects.append(visible);
        const hit = svg("line");
        setSegment(hit, segment);
        hit.setAttribute("class", "wheel-aspect-hit");
        hit.setAttribute("tabindex", "0");
        hit.dataset["aspect"] = aspect.id;
        hit.dataset["aspectKind"] = aspect.kind;
        hit.dataset["endpointA"] = aspect.a;
        hit.dataset["endpointB"] = aspect.b;
        aspects.append(hit);
    }
    const pointGroup = svg("g");
    pointGroup.setAttribute("class", "wheel-points");
    root.append(pointGroup);
    for (const placed of placedPoints) {
        const point = calculation.points[placed.id];
        const position = point.position.value;
        const location = pointAnchors.get(placed.id);
        if (position === null || location === undefined)
            continue;
        const radius = radii.pointBase - placed.lane * 24;
        line(pointGroup, placed.longitude, radii.zodiacInner - 3, radius + 16, ascendant, "wheel-point-leader");
        line(pointGroup, placed.longitude, radii.zodiacInner - 10, radii.zodiacInner + 1, ascendant, "wheel-point-tick");
        const group = svg("g");
        group.setAttribute("class", "wheel-point");
        group.setAttribute("tabindex", "0");
        group.setAttribute("role", "button");
        group.dataset["point"] = placed.id;
        group.dataset["anchorX"] = location.x.toFixed(3);
        group.dataset["anchorY"] = location.y.toFixed(3);
        const asset = glyphAsset(placed.id);
        if (asset === null) {
            const fallback = svg("text");
            fallback.textContent = pointFallback[placed.id] ?? titleCase(placed.id).slice(0, 2);
            fallback.setAttribute("x", String(location.x));
            fallback.setAttribute("y", String(location.y + 8));
            fallback.setAttribute("text-anchor", "middle");
            fallback.setAttribute("class", "wheel-point-text");
            group.append(fallback);
        }
        else {
            addAssetGlyph(group, asset.path, pointFallback[placed.id] ?? "•", location.x, location.y, 29, glyphFilterId, asset.rotation ?? 0, asset.modifier);
        }
        pointGroup.append(group);
    }
    if (!timed) {
        const notice = svg("text");
        notice.textContent = "Birth time unknown · houses and angles are unavailable";
        notice.setAttribute("x", String(centre));
        notice.setAttribute("y", String(centre));
        notice.setAttribute("text-anchor", "middle");
        notice.setAttribute("class", "wheel-untimed-note");
        root.append(notice);
    }
    return container;
};
//# sourceMappingURL=render.js.map