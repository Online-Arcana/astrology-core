import { signs } from "../zodiac/position.js";
export const compatibilityProfile = "western_compatibility/1.0.0";
const level = (score) => score >= 67 ? "high" : score >= 34 ? "medium" : "low";
const relation = (value) => value === "high" ? "compatible" : value === "medium" ? "neutral" : "incompatible";
export const rankCompatibility = (zodiac, domain, raw) => {
    if (raw.length !== 12 || new Set(raw.map((entry) => entry.sign)).size !== 12) {
        throw new Error(`${zodiac}.${domain} must contain every sign exactly once`);
    }
    const order = new Map(signs.map((sign, index) => [sign, index]));
    const ranked = [...raw]
        .map((entry) => ({ ...entry, score: Math.max(0, Math.min(100, entry.score)) }))
        .sort((a, b) => b.score - a.score || (order.get(a.sign) ?? 0) - (order.get(b.sign) ?? 0));
    const scoreMap = {};
    ranked.forEach((entry, index) => {
        const compatibilityLevel = level(entry.score);
        scoreMap[entry.sign] = {
            sign: entry.sign,
            score: entry.score,
            rank: index + 1,
            level: compatibilityLevel,
            relation: relation(compatibilityLevel),
            factors: entry.factors,
        };
    });
    return { domain, ranked: ranked.map((entry) => entry.sign), signs: scoreMap };
};
//# sourceMappingURL=rank.js.map