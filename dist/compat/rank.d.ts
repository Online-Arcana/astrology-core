import type { CompatibilityDomain, CompatibilityDomainScores, ScoreFactor, Sign } from "../types/astro.js";
export declare const compatibilityProfile: "western_compatibility/1.0.0";
export interface RawCompatibility {
    sign: Sign;
    score: number;
    factors: ScoreFactor[];
}
export declare const rankCompatibility: (zodiac: "tropical" | "sidereal", domain: CompatibilityDomain, raw: readonly RawCompatibility[]) => CompatibilityDomainScores;
//# sourceMappingURL=rank.d.ts.map