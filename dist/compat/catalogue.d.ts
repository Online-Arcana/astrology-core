import type { CompatibilityDomain, PointId } from "../types/astro.js";
export type SignRelation = "conjunction" | "semisextile" | "sextile" | "square" | "trine" | "quincunx" | "opposition";
export interface CompatibilityPointWeight {
    point: PointId;
    weight: number;
}
export interface CompatibilityDomainRule {
    points: readonly CompatibilityPointWeight[];
    traditionalRulerWeight: number;
    modernCoRulerWeight: number;
    relationValues: Readonly<Record<SignRelation, number>>;
}
export declare const compatibilityDomains: readonly ["overall", "romantic", "sexual", "emotional", "communication", "intellectual", "friendship", "business", "domestic", "long_term", "conflict_resolution", "spiritual"];
export declare const compatibilityRules: Readonly<Record<CompatibilityDomain, CompatibilityDomainRule>>;
//# sourceMappingURL=catalogue.d.ts.map