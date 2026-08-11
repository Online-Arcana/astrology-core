export const wheelSize = 800;
export const wheelCentre = wheelSize / 2;
export const wheelRadii = { outer: 372, zodiacInner: 316, pointBase: 286, houseOuter: 254, aspect: 210 };
export const signOrder = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
export const signGlyphs = {
    aries: "♈︎", taurus: "♉︎", gemini: "♊︎", cancer: "♋︎", leo: "♌︎", virgo: "♍︎",
    libra: "♎︎", scorpio: "♏︎", sagittarius: "♐︎", capricorn: "♑︎", aquarius: "♒︎", pisces: "♓︎",
};
export const pointGlyphs = {
    sun: "☉", moon: "☽", mercury: "☿", venus: "♀︎", mars: "♂︎", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
    north_node_true: "T", south_node_true: "T", north_node_mean: "M", south_node_mean: "M",
    ascendant: "As", descendant: "Ds", midheaven: "Mc", imum_coeli: "IC", vertex: "Vx", antivertex: "AV", east_point: "Ep",
    part_of_fortune: "⊗", part_of_spirit: "Φ", lilith_mean: "⚸", lilith_true: "⚸",
};
export const titleCase = (value) => value.replaceAll("_", " ").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-GB"));
export const normalise = (degrees) => ((degrees % 360) + 360) % 360;
export const forward = (start, end) => normalise(end - start);
const radians = (degrees) => degrees * Math.PI / 180;
const screenAngle = (longitude, ascendant) => Math.PI - radians(normalise(longitude - ascendant));
export const polar = (longitude, radius, ascendant) => {
    const angle = screenAngle(longitude, ascendant);
    return { x: wheelCentre + radius * Math.cos(angle), y: wheelCentre + radius * Math.sin(angle) };
};
export const sector = (start, end, inner, outer, ascendant) => {
    const distance = Math.max(0.01, forward(start, end));
    const steps = Math.max(3, Math.ceil(distance / 3));
    const outerPoints = [];
    const innerPoints = [];
    for (let index = 0; index <= steps; index += 1) {
        const longitude = normalise(start + distance * index / steps);
        outerPoints.push(polar(longitude, outer, ascendant));
        innerPoints.push(polar(longitude, inner, ascendant));
    }
    const first = outerPoints[0];
    if (first === undefined)
        return "";
    const commands = [`M ${first.x.toFixed(3)} ${first.y.toFixed(3)}`];
    for (const point of outerPoints.slice(1))
        commands.push(`L ${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
    for (const point of innerPoints.reverse())
        commands.push(`L ${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
    commands.push("Z");
    return commands.join(" ");
};
export const pointLayout = (data) => {
    const points = Object.entries(data.points).flatMap(([rawId, point]) => point.position.value === null ? [] : [{ id: rawId, longitude: point.position.value.longitudeDegrees }]).sort((left, right) => left.longitude - right.longitude || left.id.localeCompare(right.id));
    const last = [null, null, null, null, null];
    return points.map((point) => {
        let lane = 0;
        for (let candidate = 0; candidate < last.length; candidate += 1) {
            const previous = last[candidate];
            if (previous === undefined || previous === null || forward(previous, point.longitude) >= 6.5) {
                lane = candidate;
                break;
            }
            lane = Math.min(candidate + 1, last.length - 1);
        }
        last[lane] = point.longitude;
        return { ...point, lane };
    });
};
const shorten = (start, end, padding) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 0.001)
        return { start, end };
    const inset = Math.min(padding, Math.max(0, length / 2 - 2));
    const ux = dx / length;
    const uy = dy / length;
    return { start: { x: start.x + ux * inset, y: start.y + uy * inset }, end: { x: end.x - ux * inset, y: end.y - uy * inset } };
};
const extend = (start, end, amount) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 0.001)
        return { start, end };
    const ux = dx / length;
    const uy = dy / length;
    return { start: { x: start.x - ux * amount, y: start.y - uy * amount }, end: { x: end.x + ux * amount, y: end.y + uy * amount } };
};
export const aspectSegment = (aspect, start, end) => aspect.kind === "conjunction" ? extend(start, end, 18) : shorten(start, end, 15);
export const anchors = (data, ascendant) => new Map(pointLayout(data).map((point) => [point.id, polar(point.longitude, wheelRadii.pointBase - point.lane * 24, ascendant)]));
//# sourceMappingURL=geometry.js.map