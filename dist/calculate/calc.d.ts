import type { AstronomyPort, LunarOrbitPort } from "../astro/port.js";
import type { EclipsePort } from "../eclipse/port.js";
import type { PlaceCatalogue } from "../place/model.js";
import type { TimeResolver } from "../time/model.js";
import { type BirthInput, type CalcReason } from "../types/base.js";
import type { Ayanamsha, Zodiac } from "../types/astro.js";
import type { Calculation } from "../types/calc.js";
export declare const calculationProfile: "western_natal/1.1.0";
export interface CalcOptions {
    zodiac: Zodiac;
    ayanamsha: Ayanamsha;
}
export interface CalcPorts {
    places: Pick<PlaceCatalogue, "get">;
    timeResolver: TimeResolver;
    astronomy: AstronomyPort;
    lunarOrbit: LunarOrbitPort;
    eclipses: EclipsePort;
    version: string;
    now(): string;
}
export declare class CalcError extends Error {
    readonly reason: CalcReason;
    constructor(reason: CalcReason);
}
export declare const calc: (input: BirthInput, options: CalcOptions, ports: CalcPorts) => Promise<Calculation>;
export declare const loadPorts: (version?: string) => Promise<CalcPorts>;
//# sourceMappingURL=calc.d.ts.map