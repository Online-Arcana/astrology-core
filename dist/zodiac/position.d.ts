import type { SignPosition } from "../types/astro.js";
export declare const signs: readonly ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
export declare const normaliseDegrees: (degrees: number) => number;
export declare const angularDistance: (a: number, b: number) => number;
export declare const signPosition: (longitudeDegrees: number) => SignPosition;
export declare const siderealPosition: (tropicalLongitude: number, ayanamshaDegrees: number) => SignPosition;
//# sourceMappingURL=position.d.ts.map