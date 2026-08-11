import type { DeclinationAspect, PointId } from "../types/astro.js";
export declare const declinationAspectProfile: "declination_aspects/1.0.0";
export interface DeclinationPoint {
    id: PointId;
    declinationRadians: number;
}
export declare const declinationOrb: (a: PointId, b: PointId) => number;
export declare const detectDeclinationAspect: (a: DeclinationPoint, b: DeclinationPoint) => DeclinationAspect | null;
export declare const detectDeclinationAspects: (points: readonly DeclinationPoint[]) => DeclinationAspect[];
//# sourceMappingURL=declination.d.ts.map