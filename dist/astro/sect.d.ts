import type { CoreAngles } from "../house/angles.js";
import type { Calc, CalcReason, CalcStatus } from "../types/base.js";
import type { AstronomyData } from "../types/astro.js";
type AvailableStatus = Extract<CalcStatus, "exact" | "approximate" | "bounded">;
export declare const calculateSect: (astronomy: AstronomyData, angles: CoreAngles | null, latitudeDegrees: number, angleStatus?: AvailableStatus, angleReason?: CalcReason) => Calc<"day" | "night">;
export {};
//# sourceMappingURL=sect.d.ts.map