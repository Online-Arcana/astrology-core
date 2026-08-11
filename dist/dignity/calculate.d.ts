import type { Calc } from "../types/base.js";
import type { DignityState, PlanetId, SignPosition } from "../types/astro.js";
export declare const boundRuler: (position: SignPosition) => PlanetId;
export declare const faceRuler: (position: SignPosition) => PlanetId;
export declare const calculateDignity: (planet: PlanetId, position: Calc<SignPosition>, sect: Calc<"day" | "night">) => Calc<DignityState>;
//# sourceMappingURL=calculate.d.ts.map