import type { AstronomyPort } from "../astro/port.js";
import { type AuxiliaryAngles, type CoreAngles } from "../house/angles.js";
import type { BirthInput, Calc, CalcReason, TimeData } from "../types/base.js";
import type { AstronomyData, LunarPhase, Zodiac, ZodiacCalculation } from "../types/astro.js";
import type { CalcWarning } from "../types/calc.js";
import { type CalcOptions, type TimedState, type TimedStatus } from "./types.js";
export declare const calculated: <T>(value: T, status: TimedStatus, reason: CalcReason) => Calc<T>;
export declare const selectedZodiac: (options: CalcOptions) => Zodiac;
export declare const timeState: (time: TimeData, astronomy: AstronomyPort) => TimedState;
export declare const angleState: (time: TimeData, astronomy: AstronomyPort, longitude: number, latitude: number) => {
    core: CoreAngles | null;
    auxiliary: AuxiliaryAngles | null;
};
export declare const houseState: (zodiac: Zodiac, angles: CoreAngles | null, astronomy: AstronomyPort, time: TimeData, latitude: number, ayanamsha: number, state: TimedState) => Record<import("../types/astro.js").HouseSystem, import("../types/astro.js").HouseChart>;
export declare const calculateLunarPhase: (astronomy: AstronomyData) => LunarPhase;
export declare const warnings: (input: BirthInput, time: TimeData, system: ZodiacCalculation) => CalcWarning[];
export declare const fingerprint: (value: object) => Promise<string>;
//# sourceMappingURL=state.d.ts.map