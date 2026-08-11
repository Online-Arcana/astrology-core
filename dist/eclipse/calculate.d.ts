import type { AstronomyPort, LunarOrbitPort } from "../astro/port.js";
import type { Calc, TimeData } from "../types/base.js";
import type { Ayanamsha, NatalEclipse, PrenatalEclipse, Zodiac } from "../types/astro.js";
import type { EclipsePort } from "./port.js";
export declare const eclipseProfile: "western_eclipses/1.1.0";
export interface EclipseCalculation {
    atBirth: Calc<NatalEclipse>;
    prenatalSolar: Calc<PrenatalEclipse>;
    prenatalLunar: Calc<PrenatalEclipse>;
}
export interface EclipseCalculationInput {
    time: TimeData;
    astronomy: AstronomyPort;
    lunarOrbit: LunarOrbitPort;
    eclipses: EclipsePort;
    zodiac: Zodiac;
    ayanamsha: Ayanamsha | null;
}
export declare const calculateEclipses: (input: EclipseCalculationInput) => EclipseCalculation;
//# sourceMappingURL=calculate.d.ts.map