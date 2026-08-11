import type { Aspect, AspectPattern, PointId, SignPosition } from "../types/astro.js";
export declare const patternProfile: "western_patterns/1.0.0";
export interface PatternPoint {
    id: PointId;
    position: SignPosition;
}
export declare const detectPatterns: (inputPoints: readonly PatternPoint[], aspects: readonly Aspect[]) => AspectPattern[];
//# sourceMappingURL=detect.d.ts.map