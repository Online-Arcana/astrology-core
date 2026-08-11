import type { Calculation } from "../types/calc.js";
import type { HouseSystem, PointId } from "../types/astro.js";
import type { WheelData, WheelHouseChart, WheelHouseMap, WheelPoint } from "./types.js";

const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const pointIds = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
  "north_node_true", "south_node_true", "north_node_mean", "south_node_mean",
  "ascendant", "descendant", "midheaven", "imum_coeli", "vertex", "antivertex", "east_point",
  "part_of_fortune", "part_of_spirit", "lilith_mean", "lilith_true",
] as const satisfies readonly PointId[];

export const emptyWheelHouses = (): WheelHouseMap => Object.fromEntries(
  houseNumbers.map((number) => [String(number), {
    number,
    cusp: { value: null },
    end: { value: null },
  }]),
) as WheelHouseMap;

export const emptyWheelHouseChart = (): WheelHouseChart => ({
  status: "unavailable",
  houses: emptyWheelHouses(),
});

export const emptyWheelPoints = (): Record<PointId, WheelPoint> => Object.fromEntries(
  pointIds.map((id) => [id, { position: { value: null } }]),
) as Record<PointId, WheelPoint>;

export const emptyWheelData = (
  fingerprint = "wheel-shell",
  primaryHouseSystem: HouseSystem = "placidus",
): WheelData => ({
  fingerprint,
  primaryHouseSystem,
  points: emptyWheelPoints(),
  houses: {
    placidus: emptyWheelHouseChart(),
    whole_sign: emptyWheelHouseChart(),
    equal: emptyWheelHouseChart(),
    porphyry: emptyWheelHouseChart(),
  },
  aspects: [],
});

export const wheelData = (calculation: Calculation): WheelData => ({
  fingerprint: calculation.provenance.calculationFingerprint,
  primaryHouseSystem: calculation.settings.primaryHouseSystem,
  points: calculation.system.points,
  houses: calculation.system.houses,
  aspects: calculation.system.aspects,
});
