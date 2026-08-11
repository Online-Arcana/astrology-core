import { isPlanet } from "../aspect/catalogue.js";
import { signElements } from "../dignity/catalogue.js";
import { signModalities } from "../derived/catalogue.js";
export const patternProfile = "western_patterns/1.0.0";
const pairKey = (a, b) => [a, b].sort().join("|");
const edgeSet = (aspects) => {
    const byPair = new Map();
    for (const aspect of aspects)
        byPair.set(pairKey(aspect.a, aspect.b), aspect);
    return { aspects: [...aspects], byPair };
};
const combinations = (values, size) => {
    const result = [];
    const visit = (start, chosen) => {
        if (chosen.length === size) {
            result.push([...chosen]);
            return;
        }
        for (let index = start; index <= values.length - (size - chosen.length); index += 1) {
            chosen.push(values[index]);
            visit(index + 1, chosen);
            chosen.pop();
        }
    };
    visit(0, []);
    return result;
};
const edge = (edges, a, b, kind) => {
    const aspect = edges.byPair.get(pairKey(a, b)) ?? null;
    return aspect && (kind === undefined || aspect.kind === kind) ? aspect : null;
};
const allPairs = (points) => combinations(points, 2)
    .map(([a, b]) => [a, b]);
const matching = (points, edges, kind) => allPairs(points).map(([a, b]) => edge(edges, a.id, b.id, kind)).filter((value) => value !== null);
const patternContext = (points) => {
    const elements = new Set(points.map(({ position }) => signElements[position.sign]));
    const modalities = new Set(points.map(({ position }) => signModalities[position.sign]));
    return {
        element: elements.size === 1 ? [...elements][0] : null,
        modality: modalities.size === 1 ? [...modalities][0] : null,
    };
};
const build = (kind, points, aspects, focalPoint) => {
    const ids = points.map(({ id }) => id).sort();
    const uniqueAspects = [...new Map(aspects.map((aspect) => [aspect.id, aspect])).values()]
        .sort((a, b) => a.id.localeCompare(b.id));
    return {
        id: `${kind}:${ids.join("+")}`,
        kind,
        points: ids,
        aspects: uniqueAspects.map(({ id }) => id),
        ...patternContext(points),
        focalPoint,
        strength: uniqueAspects.length === 0
            ? 0
            : uniqueAspects.reduce((sum, aspect) => sum + aspect.strength, 0) / uniqueAspects.length,
        ruleRefs: [`${patternProfile}#${kind}`],
    };
};
const exactCounts = (points, edges, counts) => {
    const aspects = allPairs(points)
        .map(([a, b]) => edge(edges, a.id, b.id))
        .filter((value) => value !== null);
    const total = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0);
    if (aspects.length !== total)
        return null;
    for (const [kind, count] of Object.entries(counts)) {
        if (aspects.filter((aspect) => aspect.kind === kind).length !== count)
            return null;
    }
    return aspects;
};
const stelliums = (points, edges) => {
    const cliques = [];
    for (let size = 3; size <= points.length; size += 1) {
        for (const group of combinations(points, size)) {
            if (matching(group, edges, "conjunction").length === size * (size - 1) / 2)
                cliques.push(group);
        }
    }
    const maximal = cliques.filter((group) => !cliques.some((other) => other.length > group.length && group.every(({ id }) => other.some((point) => point.id === id))));
    return maximal.map((group) => build("stellium", group, matching(group, edges, "conjunction"), null));
};
const tSquares = (points, edges) => {
    const result = [];
    for (const group of combinations(points, 3)) {
        for (const focal of group) {
            const bases = group.filter(({ id }) => id !== focal.id);
            const opposition = edge(edges, bases[0].id, bases[1].id, "opposition");
            const left = edge(edges, focal.id, bases[0].id, "square");
            const right = edge(edges, focal.id, bases[1].id, "square");
            if (opposition && left && right)
                result.push(build("t_square", group, [opposition, left, right], focal.id));
        }
    }
    return result;
};
const grandTrines = (points, edges) => combinations(points, 3)
    .map((group) => {
    const aspects = matching(group, edges, "trine");
    return aspects.length === 3 ? build("grand_trine", group, aspects, null) : null;
})
    .filter((value) => value !== null);
const grandCrosses = (points, edges) => combinations(points, 4)
    .map((group) => {
    const aspects = exactCounts(group, edges, { opposition: 2, square: 4 });
    return aspects ? build("grand_cross", group, aspects, null) : null;
})
    .filter((value) => value !== null);
const yods = (points, edges) => {
    const result = [];
    for (const group of combinations(points, 3)) {
        for (const focal of group) {
            const bases = group.filter(({ id }) => id !== focal.id);
            const base = edge(edges, bases[0].id, bases[1].id, "sextile");
            const left = edge(edges, focal.id, bases[0].id, "quincunx");
            const right = edge(edges, focal.id, bases[1].id, "quincunx");
            if (base && left && right)
                result.push(build("yod", group, [base, left, right], focal.id));
        }
    }
    return result;
};
const kites = (points, edges) => {
    const result = [];
    for (const group of combinations(points, 4)) {
        for (const focal of group) {
            const triangle = group.filter(({ id }) => id !== focal.id);
            const trines = matching(triangle, edges, "trine");
            if (trines.length !== 3)
                continue;
            const oppositionTarget = triangle.find(({ id }) => edge(edges, focal.id, id, "opposition") !== null);
            if (!oppositionTarget)
                continue;
            const others = triangle.filter(({ id }) => id !== oppositionTarget.id);
            const opposition = edge(edges, focal.id, oppositionTarget.id, "opposition");
            const sextiles = others.map(({ id }) => edge(edges, focal.id, id, "sextile"));
            if (opposition && sextiles.every((value) => value !== null)) {
                result.push(build("kite", group, [...trines, opposition, ...sextiles], focal.id));
            }
        }
    }
    return result;
};
const mysticRectangles = (points, edges) => combinations(points, 4)
    .map((group) => {
    const aspects = exactCounts(group, edges, { opposition: 2, trine: 2, sextile: 2 });
    return aspects ? build("mystic_rectangle", group, aspects, null) : null;
})
    .filter((value) => value !== null);
const grandSextiles = (points, edges) => combinations(points, 6)
    .map((group) => {
    const aspects = exactCounts(group, edges, { sextile: 6, trine: 6, opposition: 3 });
    return aspects ? build("grand_sextile", group, aspects, null) : null;
})
    .filter((value) => value !== null);
const thorHammers = (points, edges) => {
    const result = [];
    for (const group of combinations(points, 3)) {
        for (const focal of group) {
            const bases = group.filter(({ id }) => id !== focal.id);
            const base = edge(edges, bases[0].id, bases[1].id, "square");
            const left = edge(edges, focal.id, bases[0].id, "sesquiquadrate");
            const right = edge(edges, focal.id, bases[1].id, "sesquiquadrate");
            if (base && left && right)
                result.push(build("thor_hammer", group, [base, left, right], focal.id));
        }
    }
    return result;
};
export const detectPatterns = (inputPoints, aspects) => {
    const points = inputPoints.filter(({ id }) => isPlanet(id));
    const edges = edgeSet(aspects.filter(({ a, b }) => isPlanet(a) && isPlanet(b)));
    const patterns = [
        ...stelliums(points, edges),
        ...tSquares(points, edges),
        ...grandTrines(points, edges),
        ...grandCrosses(points, edges),
        ...yods(points, edges),
        ...kites(points, edges),
        ...mysticRectangles(points, edges),
        ...grandSextiles(points, edges),
        ...thorHammers(points, edges),
    ];
    return [...new Map(patterns.map((pattern) => [pattern.id, pattern])).values()]
        .sort((a, b) => b.strength - a.strength || a.id.localeCompare(b.id));
};
//# sourceMappingURL=detect.js.map