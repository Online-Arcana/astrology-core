import type { HouseMap } from "../types/astro.js";
import { type CoreAngles } from "./angles.js";
export type CuspMap = HouseMap<number>;
export declare const equalCusps: (ascendant: number) => CuspMap;
export declare const wholeSignCusps: (ascendant: number) => CuspMap;
export declare const porphyryCusps: (angles: CoreAngles) => CuspMap;
export declare const placidusCusps: (angles: CoreAngles, latitudeDegrees: number, obliquityRadians: number) => CuspMap | null;
export declare const shiftCusps: (cusps: CuspMap, degrees: number) => CuspMap;
//# sourceMappingURL=cusps.d.ts.map