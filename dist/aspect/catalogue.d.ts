import type { AspectKind, PlanetId, PointId } from "../types/astro.js";
export interface AspectRule {
    kind: AspectKind;
    angle: number;
    orb: number;
    class: "major" | "minor";
    character: "flowing" | "challenging" | "contextual" | "adjusting" | "creative";
}
export declare const aspectProfile: "western_aspects/1.0.0";
export declare const aspectRules: readonly AspectRule[];
export declare const allowedOrb: (rule: AspectRule, a: PointId, b: PointId) => number;
export declare const isPlanet: (point: PointId) => point is PlanetId;
//# sourceMappingURL=catalogue.d.ts.map