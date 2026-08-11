import { signElements } from "../dignity/catalogue.js";
import { forwardArc } from "../house/angles.js";
import { modernRulers, traditionalRulers } from "../rules/rulership.js";
import { signs } from "../zodiac/position.js";
import { angularHouses, balanceWeight, cadentHouses, dominanceProfile, dominanceWeights, jonesProfile, planetIds, primaryHouseSystem, signModalities, signPolarities, succedentHouses, unaspectedProfile, } from "./catalogue.js";
const planetSet = new Set(planetIds);
const balancePoints = [...planetIds, "ascendant", "midheaven"];
const unavailable = (reason) => ({
    status: reason === "outside_supported_range" ? "unsupported" : "unavailable",
    value: null,
    reason,
});
const pointPosition = (points, id) => {
    const position = points[id].position.value;
    if (!position)
        throw new Error(`Derived chart requires an available ${id} position`);
    return position;
};
const planetPositions = (points) => {
    const result = {};
    for (const id of planetIds)
        result[id] = pointPosition(points, id);
    return result;
};
const dispositorMap = (positions, system) => {
    const rulers = system === "traditional" ? traditionalRulers : modernRulers;
    const result = {};
    for (const id of planetIds)
        result[id] = rulers[positions[id].sign];
    return result;
};
const finalDispositor = (map) => {
    const selfRuled = planetIds.filter((id) => map[id] === id);
    if (selfRuled.length !== 1)
        return null;
    const target = selfRuled[0];
    for (const start of planetIds) {
        const seen = new Set();
        let current = start;
        while (current !== target) {
            if (seen.has(current))
                return null;
            seen.add(current);
            current = map[current];
        }
    }
    return target;
};
const mutualReceptions = (traditional, modern) => {
    const result = [];
    const inspect = (map, system) => {
        for (let a = 0; a < planetIds.length; a += 1) {
            for (let b = a + 1; b < planetIds.length; b += 1) {
                const left = planetIds[a];
                const right = planetIds[b];
                if (map[left] === right && map[right] === left) {
                    result.push({
                        a: left,
                        b: right,
                        system,
                        ruleRefs: [`western_rulership/1.0.0#mutual-reception.${system}`],
                    });
                }
            }
        }
    };
    inspect(traditional, "traditional");
    inspect(modern, "modern");
    return result;
};
const chartRuler = (points, system) => {
    const ascendant = points.ascendant.position;
    if (!ascendant.value)
        return unavailable(ascendant.reason);
    const ruler = system === "traditional"
        ? traditionalRulers[ascendant.value.sign]
        : modernRulers[ascendant.value.sign];
    return { status: ascendant.status, value: ruler, reason: ascendant.reason };
};
const balances = (points, houseSystem) => {
    const result = {
        elements: { fire: 0, earth: 0, air: 0, water: 0 },
        modalities: { cardinal: 0, fixed: 0, mutable: 0 },
        polarities: { active: 0, receptive: 0 },
        hemispheres: { eastern: 0, western: 0, northern: 0, southern: 0 },
        houseModes: { angular: 0, succedent: 0, cadent: 0 },
    };
    for (const id of balancePoints) {
        const position = points[id].position.value;
        if (!position)
            continue;
        const weight = balanceWeight(id);
        result.elements[signElements[position.sign]] += weight;
        result.modalities[signModalities[position.sign]] += weight;
        result.polarities[signPolarities[position.sign]] += weight;
    }
    for (const id of planetIds) {
        const house = points[id].houses[houseSystem].value?.house;
        if (!house)
            continue;
        const weight = balanceWeight(id);
        if ([10, 11, 12, 1, 2, 3].includes(house))
            result.hemispheres.eastern += weight;
        else
            result.hemispheres.western += weight;
        if (house <= 6)
            result.hemispheres.northern += weight;
        else
            result.hemispheres.southern += weight;
        if (angularHouses.has(house))
            result.houseModes.angular += weight;
        else if (succedentHouses.has(house))
            result.houseModes.succedent += weight;
        else if (cadentHouses.has(house))
            result.houseModes.cadent += weight;
    }
    return result;
};
const aspectContribution = (aspect) => aspect.strength * (aspect.class === "major" ? dominanceWeights.majorAspect : dominanceWeights.minorAspect);
const dominantPlanets = (points, aspects, sect, traditionalChartRuler, modernChartRuler, houseSystem) => planetIds.map((planet) => {
    let score = 0;
    const factors = [];
    const dignity = points[planet].dignity.value;
    if (dignity && dignity.score !== 0) {
        const contribution = Math.abs(dignity.score);
        score += contribution;
        factors.push(`dignity:${dignity.score}:${contribution}`);
    }
    if (planet === traditionalChartRuler) {
        score += dominanceWeights.traditionalChartRuler;
        factors.push(`chart-ruler:traditional:${dominanceWeights.traditionalChartRuler}`);
    }
    if (planet === modernChartRuler) {
        score += dominanceWeights.modernChartRuler;
        factors.push(`chart-ruler:modern:${dominanceWeights.modernChartRuler}`);
    }
    const house = points[planet].houses[houseSystem].value?.house;
    if (house && angularHouses.has(house)) {
        score += dominanceWeights.angularHouse;
        factors.push(`house:angular:${dominanceWeights.angularHouse}`);
    }
    else if (house && succedentHouses.has(house)) {
        score += dominanceWeights.succedentHouse;
        factors.push(`house:succedent:${dominanceWeights.succedentHouse}`);
    }
    const related = aspects.filter((aspect) => aspect.a === planet || aspect.b === planet);
    for (const aspect of related) {
        const contribution = aspectContribution(aspect);
        score += contribution;
        factors.push(`aspect:${aspect.id}:${contribution}`);
    }
    const sectLight = sect.value === "day" ? "sun" : sect.value === "night" ? "moon" : null;
    if (planet === sectLight) {
        score += dominanceWeights.sectLight;
        factors.push(`sect-light:${dominanceWeights.sectLight}`);
    }
    return { planet, score, factors: [`${dominanceProfile}#planet`, ...factors] };
}).sort((a, b) => b.score - a.score || a.planet.localeCompare(b.planet));
const dominantSigns = (points, planetDominance, traditionalChartRuler) => {
    const scores = new Map(signs.map((sign) => [sign, { sign, score: 0, factors: [] }]));
    for (const id of balancePoints) {
        const position = points[id].position.value;
        if (!position)
            continue;
        const weight = balanceWeight(id);
        const entry = scores.get(position.sign);
        entry.score += weight;
        entry.factors.push(`point:${id}:${weight}`);
        if (planetSet.has(id)) {
            const dignity = points[id].dignity.value;
            if (dignity && dignity.score !== 0) {
                const contribution = Math.abs(dignity.score) * 0.25;
                entry.score += contribution;
                entry.factors.push(`dignity:${id}:${contribution}`);
            }
        }
    }
    if (traditionalChartRuler) {
        const rulerPosition = points[traditionalChartRuler].position.value;
        const rulerScore = planetDominance.find((entry) => entry.planet === traditionalChartRuler)?.score ?? 0;
        if (rulerPosition) {
            const contribution = 2 + rulerScore * 0.1;
            const entry = scores.get(rulerPosition.sign);
            entry.score += contribution;
            entry.factors.push(`chart-ruler:${traditionalChartRuler}:${contribution}`);
        }
    }
    return [...scores.values()]
        .map((entry) => ({ ...entry, factors: [`${dominanceProfile}#sign`, ...entry.factors] }))
        .sort((a, b) => b.score - a.score || a.sign.localeCompare(b.sign));
};
const circularGaps = (longitudes) => longitudes.map((value, index) => ({
    size: forwardArc(value, longitudes[(index + 1) % longitudes.length]),
    after: index,
}));
const clusterSpan = (longitudes) => {
    const largest = Math.max(...circularGaps(longitudes).map(({ size }) => size));
    return 360 - largest;
};
const bucket = (longitudes) => {
    if (clusterSpan(longitudes) <= 180)
        return false;
    for (let index = 0; index < longitudes.length; index += 1) {
        const handle = longitudes[index];
        const cluster = longitudes.filter((_, candidate) => candidate !== index);
        const gaps = circularGaps(cluster);
        const largest = gaps.reduce((best, value) => value.size > best.size ? value : best);
        const start = cluster[(largest.after + 1) % cluster.length];
        const end = cluster[largest.after];
        const span = forwardArc(start, end);
        if (span > 180)
            continue;
        const fromStart = forwardArc(start, handle);
        if (fromStart <= span)
            continue;
        if (forwardArc(end, handle) >= 20 && forwardArc(handle, start) >= 20)
            return true;
    }
    return false;
};
const seeSaw = (longitudes, gaps) => {
    const large = gaps.filter(({ size }) => size >= 60).sort((a, b) => b.size - a.size);
    if (large.length < 2)
        return false;
    const first = large[0];
    const second = large[1];
    const distance = (second.after - first.after + longitudes.length) % longitudes.length;
    const groupA = distance;
    const groupB = longitudes.length - distance;
    return groupA >= 2 && groupB >= 2;
};
const jonesPattern = (positions) => {
    const longitudes = planetIds.map((id) => positions[id].longitudeDegrees).sort((a, b) => a - b);
    const gaps = circularGaps(longitudes).sort((a, b) => b.size - a.size);
    const largest = gaps[0]?.size ?? 0;
    const second = gaps[1]?.size ?? 0;
    const span = 360 - largest;
    let value = null;
    if (span <= 120)
        value = "bundle";
    else if (bucket(longitudes))
        value = "bucket";
    else if (span <= 180)
        value = "bowl";
    else if (seeSaw(longitudes, gaps))
        value = "see_saw";
    else if (largest >= 60 && largest <= 150 && second < 60 && span >= 210 && span <= 300)
        value = "locomotive";
    else if (largest < 60)
        value = "splash";
    else if (gaps.filter(({ size }) => size >= 40).length >= 3)
        value = "splay";
    return value
        ? { status: "exact", value, reason: "none" }
        : unavailable("insufficient_data");
};
const pointCalc = (point) => point.position.value
    ? { status: point.position.status, value: point, reason: point.position.reason }
    : unavailable(point.position.reason);
export const calculateDerived = (input) => {
    const houseSystem = input.houseSystem ?? primaryHouseSystem;
    const positions = planetPositions(input.points);
    const traditionalDispositors = dispositorMap(positions, "traditional");
    const modernDispositors = dispositorMap(positions, "modern");
    const traditionalChartRuler = chartRuler(input.points, "traditional");
    const modernChartRuler = chartRuler(input.points, "modern");
    const dominantPlanetList = dominantPlanets(input.points, input.aspects, input.sect, traditionalChartRuler.value, modernChartRuler.value, houseSystem);
    const majorPlanetAspects = new Set();
    for (const aspect of input.aspects) {
        if (aspect.class !== "major" || !planetSet.has(aspect.a) || !planetSet.has(aspect.b))
            continue;
        majorPlanetAspects.add(aspect.a);
        majorPlanetAspects.add(aspect.b);
    }
    return {
        sect: input.sect,
        chartRuler: { traditional: traditionalChartRuler, modern: modernChartRuler },
        dispositors: {
            traditional: traditionalDispositors,
            modern: modernDispositors,
            finalTraditional: finalDispositor(traditionalDispositors),
            finalModern: finalDispositor(modernDispositors),
        },
        mutualReceptions: mutualReceptions(traditionalDispositors, modernDispositors),
        balances: balances(input.points, houseSystem),
        dominantPlanets: dominantPlanetList,
        dominantSigns: dominantSigns(input.points, dominantPlanetList, traditionalChartRuler.value),
        retrogradePlanets: planetIds.filter((id) => input.points[id].motion === "retrograde"),
        unaspectedPlanets: planetIds.filter((id) => !majorPlanetAspects.has(id)),
        jonesPattern: jonesPattern(positions),
        lots: {
            fortune: pointCalc(input.points.part_of_fortune),
            spirit: pointCalc(input.points.part_of_spirit),
        },
    };
};
export const derivedRuleRefs = {
    profile: "western_derived/1.0.0",
    dominance: dominanceProfile,
    jones: jonesProfile,
    unaspected: unaspectedProfile,
};
//# sourceMappingURL=calculate.js.map