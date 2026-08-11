import { modernCoRulers, traditionalRulers } from "../rules/rulership.js";
import { signs } from "../zodiac/position.js";
import { compatibilityDomains, compatibilityRules } from "./catalogue.js";
import { compatibilityProfile, rankCompatibility } from "./rank.js";
const signIndex = new Map(signs.map((sign, index) => [sign, index]));
const round = (value) => Math.round(value * 1_000_000) / 1_000_000;
export const signRelation = (a, b) => {
    const left = signIndex.get(a);
    const right = signIndex.get(b);
    if (left === undefined || right === undefined)
        throw new Error("Unknown zodiac sign");
    const raw = Math.abs(left - right);
    const step = Math.min(raw, 12 - raw);
    switch (step) {
        case 0: return "conjunction";
        case 1: return "semisextile";
        case 2: return "sextile";
        case 3: return "square";
        case 4: return "trine";
        case 5: return "quincunx";
        case 6: return "opposition";
        default: throw new Error(`Invalid sign distance ${step}`);
    }
};
const pointRef = (zodiac, point) => `#/astral-calculation/systems/${zodiac}/points/${point}/position`;
const relationFactor = (zodiac, domain, candidate, point, pointSign, weight, role) => {
    const relation = signRelation(candidate, pointSign);
    const value = compatibilityRules[domain].relationValues[relation];
    return {
        id: `${domain}.${candidate}.${role}.${point}`,
        ruleId: `${compatibilityProfile}#${domain}.${role}.${relation}`,
        weight,
        value,
        sourceRefs: [pointRef(zodiac, point)],
    };
};
const availableSign = (points, point) => points[point].position.value?.sign ?? null;
const completeFactors = (pending) => {
    const totalWeight = pending.reduce((sum, factor) => sum + factor.weight, 0);
    if (!(totalWeight > 0))
        throw new Error("Compatibility scoring has no available factors");
    const factors = pending.map((factor) => ({
        ...factor,
        contribution: round(factor.weight * factor.value / totalWeight * 100),
    }));
    return {
        score: round(pending.reduce((sum, factor) => sum + factor.weight * factor.value, 0) / totalWeight * 100),
        factors,
    };
};
const scoreSign = (zodiac, domain, candidate, points) => {
    const rule = compatibilityRules[domain];
    const pending = [];
    for (const { point, weight } of rule.points) {
        const pointSign = availableSign(points, point);
        if (pointSign === null)
            continue;
        pending.push(relationFactor(zodiac, domain, candidate, point, pointSign, weight, "point"));
    }
    const traditionalRuler = traditionalRulers[candidate];
    const traditionalSign = availableSign(points, traditionalRuler);
    if (traditionalSign !== null) {
        pending.push(relationFactor(zodiac, domain, candidate, traditionalRuler, traditionalSign, rule.traditionalRulerWeight, "traditional_ruler"));
    }
    const modernCoRuler = modernCoRulers[candidate];
    if (modernCoRuler !== undefined && rule.modernCoRulerWeight > 0) {
        const modernSign = availableSign(points, modernCoRuler);
        if (modernSign !== null) {
            pending.push(relationFactor(zodiac, domain, candidate, modernCoRuler, modernSign, rule.modernCoRulerWeight, "modern_co_ruler"));
        }
    }
    const completed = completeFactors(pending);
    return { sign: candidate, ...completed };
};
export const calculateCompatibilityDomain = (zodiac, domain, points) => rankCompatibility(zodiac, domain, signs.map((sign) => scoreSign(zodiac, domain, sign, points)));
export const calculateCompatibility = (zodiac, points) => {
    const domains = {};
    for (const domain of compatibilityDomains) {
        domains[domain] = calculateCompatibilityDomain(zodiac, domain, points);
    }
    return { zodiac, domains };
};
export const candidateRulers = (sign) => ({
    traditional: traditionalRulers[sign],
    modern: modernCoRulers[sign] ?? null,
});
//# sourceMappingURL=calculate.js.map