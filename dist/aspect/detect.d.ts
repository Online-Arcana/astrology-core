import type { Aspect, PointId } from "../types/astro.js";
export interface AspectPoint {
    id: PointId;
    longitudeDegrees: number;
    speedDegreesPerDay: number | null;
}
export declare const detectAspect: (a: AspectPoint, b: AspectPoint) => Aspect | null;
export declare const detectAspects: (points: readonly AspectPoint[]) => Aspect[];
//# sourceMappingURL=detect.d.ts.map