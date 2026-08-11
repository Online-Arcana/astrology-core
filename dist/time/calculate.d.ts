import type { BirthInput, TimeData } from "../types/base.js";
import type { TimeResolver } from "./model.js";
export interface AstralTimePort {
    time(utcIso: string): {
        julianDay: number;
        julianEphemerisDay: number;
        deltaTSeconds: number;
    };
}
export declare const resolveBirthTime: (input: BirthInput, zone: string, resolver: TimeResolver, astronomy: AstralTimePort) => TimeData;
//# sourceMappingURL=calculate.d.ts.map