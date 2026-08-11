import type { PlanetId, Sign } from "../types/astro.js";
export declare const dignityProfile: "traditional_dignity/1.0.0";
export declare const boundsProfile: "egyptian_bounds/1.0.0";
export declare const facesProfile: "chaldean_faces/1.0.0";
export declare const triplicityProfile: "dorothean_triplicity/1.0.0";
export type Element = "fire" | "earth" | "air" | "water";
export interface TriplicityRule {
    day: PlanetId;
    night: PlanetId;
    participating: PlanetId;
}
export interface BoundSegment {
    ruler: PlanetId;
    start: number;
    end: number;
}
export declare const signElements: Readonly<Record<Sign, Element>>;
export declare const triplicityRules: Readonly<Record<Element, TriplicityRule>>;
export declare const exaltationRulers: Readonly<Partial<Record<Sign, PlanetId>>>;
export declare const detrimentSigns: Readonly<Partial<Record<PlanetId, readonly Sign[]>>>;
export declare const fallSigns: Readonly<Partial<Record<PlanetId, readonly Sign[]>>>;
export declare const egyptianBounds: Readonly<Record<Sign, readonly BoundSegment[]>>;
export declare const chaldeanFaceSequence: readonly ["mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter"];
//# sourceMappingURL=catalogue.d.ts.map