import { renderWheel } from "./render.js";
import { emptyWheelHouseChart, emptyWheelHouses, emptyWheelPoints } from "./data.js";
import type { AspectKind, HouseSystem, PointId } from "../types/astro.js";
import type { HouseNumber, WheelData, WheelHouseChart, WheelHouseMap, WheelPoint } from "./types.js";

export interface PublicWheelHouse { number: HouseNumber; cuspLongitudeDegrees: number | null; endLongitudeDegrees: number | null; }
export interface PublicWheelAspect {
  id: string; a: PointId; b: PointId; kind: AspectKind; class: "major" | "minor";
  character: "flowing" | "challenging" | "contextual" | "adjusting" | "creative";
}
export interface PublicWheelMeta {
  schema: "astral-public-wheel/1.0.0";
  calculationFingerprint: string;
  primaryHouseSystem: HouseSystem;
  points: Record<PointId, number | null>;
  houses: { status: "calculated" | "fallback" | "unavailable"; houses: Record<string, PublicWheelHouse> };
  aspects: PublicWheelAspect[];
}
const numbers = [1,2,3,4,5,6,7,8,9,10,11,12] as const;
const selectedHouses = (meta: PublicWheelMeta): WheelHouseMap => Object.fromEntries(numbers.map((number) => {
  const source = meta.houses.houses[String(number)];
  return [String(number), source === undefined ? { number, cusp: { value: null }, end: { value: null } } : {
    number,
    cusp: { value: source.cuspLongitudeDegrees === null ? null : { longitudeDegrees: source.cuspLongitudeDegrees } },
    end: { value: source.endLongitudeDegrees === null ? null : { longitudeDegrees: source.endLongitudeDegrees } },
  }];
})) as WheelHouseMap;
export const fromPublic = (meta: PublicWheelMeta): WheelData => {
  const points = emptyWheelPoints();
  for (const [id, longitudeDegrees] of Object.entries(meta.points)) {
    points[id as PointId] = {
      position: { value: longitudeDegrees === null ? null : { longitudeDegrees } },
    } satisfies WheelPoint;
  }
  const houses: Record<HouseSystem, WheelHouseChart> = {
    placidus: emptyWheelHouseChart(),
    whole_sign: emptyWheelHouseChart(),
    equal: emptyWheelHouseChart(),
    porphyry: emptyWheelHouseChart(),
  };
  houses[meta.primaryHouseSystem] = {
    status: meta.houses.status,
    houses: meta.houses.status === "unavailable" ? emptyWheelHouses() : selectedHouses(meta),
  };
  return {
    fingerprint: meta.calculationFingerprint,
    primaryHouseSystem: meta.primaryHouseSystem,
    points,
    houses,
    aspects: meta.aspects.map((aspect) => ({ ...aspect })),
  };
};
export const renderPublicWheel = (meta: PublicWheelMeta): HTMLElement => renderWheel(fromPublic(meta));
