import type { Calculation } from "../types/calc.js";
import type { AspectKind, HouseSystem, PointId } from "../types/astro.js";
export type { HouseSystem, PointId, Sign } from "../types/astro.js";
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export interface WheelPos { longitudeDegrees: number; }
export interface WheelValue<T> { value: T | null; }
export interface WheelPoint { position: WheelValue<WheelPos>; }
export interface WheelHouse { number: HouseNumber; cusp: WheelValue<WheelPos>; end: WheelValue<WheelPos>; }
export type WheelHouseMap = Record<`${HouseNumber}`, WheelHouse>;
export interface WheelHouseChart { status: "calculated" | "fallback" | "unavailable"; houses: WheelHouseMap; }
export interface WheelAspect {
  id: string; a: PointId; b: PointId; kind: AspectKind; class: "major" | "minor";
  character: "flowing" | "challenging" | "contextual" | "adjusting" | "creative";
}
export interface WheelData {
  fingerprint: string;
  primaryHouseSystem: HouseSystem;
  points: Record<PointId, WheelPoint>;
  houses: Record<HouseSystem, WheelHouseChart>;
  aspects: WheelAspect[];
}
export const wheelData = (calculation: Calculation): WheelData => ({
  fingerprint: calculation.provenance.calculationFingerprint,
  primaryHouseSystem: calculation.settings.primaryHouseSystem,
  points: calculation.system.points,
  houses: calculation.system.houses,
  aspects: calculation.system.aspects,
});
