import type { Calc, CalcReason, CalcStatus } from "../types/base.js";
import type { HouseChart, HousePlacement, HouseSystem, Zodiac } from "../types/astro.js";
import type { CoreAngles } from "./angles.js";
type AvailableStatus = Extract<CalcStatus, "exact" | "approximate" | "bounded">;
export declare const unavailableHouseCharts: (reason: CalcReason) => Record<HouseSystem, HouseChart>;
export interface HouseInput {
    angles: CoreAngles;
    latitudeDegrees: number;
    obliquityRadians: number;
    zodiac: Zodiac;
    ayanamshaDegrees?: number;
    calculationStatus?: Extract<AvailableStatus, "exact" | "approximate">;
    calculationReason?: CalcReason;
}
export declare const calculateHouseCharts: (input: HouseInput) => Record<HouseSystem, HouseChart>;
export declare const housePlacement: (longitudeDegrees: number, chartValue: HouseChart) => Calc<HousePlacement>;
export {};
//# sourceMappingURL=chart.d.ts.map