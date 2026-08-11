import type { CoreAngles } from "../house/angles.js";
import type { Calc } from "../types/base.js";
import type { AstronomyData } from "../types/astro.js";
export interface LotLongitudes {
    fortune: Calc<number>;
    spirit: Calc<number>;
}
export declare const calculateLots: (astronomy: AstronomyData, angles: CoreAngles | null, sect: Calc<"day" | "night">) => LotLongitudes;
//# sourceMappingURL=lots.d.ts.map