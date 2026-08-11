import type { Calc } from "../types/base.js";
import type { Aspect, AstrologicalPoint, DerivedChart, HouseSystem, PointMap } from "../types/astro.js";
export interface DerivedInput {
    points: PointMap<AstrologicalPoint>;
    aspects: readonly Aspect[];
    sect: Calc<"day" | "night">;
    houseSystem?: HouseSystem;
}
export declare const calculateDerived: (input: DerivedInput) => DerivedChart;
export declare const derivedRuleRefs: {
    readonly profile: "western_derived/1.0.0";
    readonly dominance: "planetary_dominance/1.0.0";
    readonly jones: "jones_patterns/1.0.0";
    readonly unaspected: "unaspected_planets/1.0.0";
};
//# sourceMappingURL=calculate.d.ts.map