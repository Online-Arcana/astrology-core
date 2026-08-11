import type { LunarOrbitSample } from "../astro/port.js";
import type { LotLongitudes } from "../astro/lots.js";
import type { AuxiliaryAngles, CoreAngles } from "../house/angles.js";
import type { Calc, CalcReason, CalcStatus } from "../types/base.js";
import type { AstrologicalPoint, AstronomyData, HouseChart, HouseSystem, PointMap, Zodiac } from "../types/astro.js";
type AvailableStatus = Extract<CalcStatus, "exact" | "approximate" | "bounded">;
export interface PointBuildInput {
    astronomy: AstronomyData;
    houses: Record<HouseSystem, HouseChart>;
    angles: CoreAngles | null;
    auxiliary: AuxiliaryAngles | null;
    lunarOrbit: LunarOrbitSample | null;
    lots: LotLongitudes;
    sect: Calc<"day" | "night">;
    zodiac: Zodiac;
    ayanamshaDegrees: number;
    timedStatus?: AvailableStatus;
    timedReason?: CalcReason;
    unavailableReason?: CalcReason;
}
export interface PointBuildResult {
    points: PointMap<AstrologicalPoint>;
    houses: Record<HouseSystem, HouseChart>;
}
export declare const buildPoints: (input: PointBuildInput) => PointBuildResult;
export {};
//# sourceMappingURL=points.d.ts.map