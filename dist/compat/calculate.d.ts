import type { AstrologicalPoint, CompatibilityDomain, CompatibilityMatrix, PlanetId, PointMap, Sign, Zodiac } from "../types/astro.js";
import { type SignRelation } from "./catalogue.js";
export declare const signRelation: (a: Sign, b: Sign) => SignRelation;
export declare const calculateCompatibilityDomain: (zodiac: Zodiac, domain: CompatibilityDomain, points: PointMap<AstrologicalPoint>) => import("../types/astro.js").CompatibilityDomainScores;
export declare const calculateCompatibility: (zodiac: Zodiac, points: PointMap<AstrologicalPoint>) => CompatibilityMatrix;
export declare const candidateRulers: (sign: Sign) => {
    traditional: PlanetId;
    modern: PlanetId | null;
};
//# sourceMappingURL=calculate.d.ts.map