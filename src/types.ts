export type Sign =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";
export type PlanetId =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";
export type NodeId =
  | "north_node_true" | "south_node_true"
  | "north_node_mean" | "south_node_mean";
export type AngleId =
  | "ascendant" | "descendant" | "midheaven" | "imum_coeli"
  | "vertex" | "antivertex" | "east_point";
export type LotId = "part_of_fortune" | "part_of_spirit";
export type OtherPointId = "lilith_mean" | "lilith_true";
export type PointId = PlanetId | NodeId | AngleId | LotId | OtherPointId;
export type HouseSystem = "placidus" | "whole_sign" | "equal" | "porphyry";
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface WheelSignPosition { longitudeDegrees: number; }
export interface WheelCalculationValue<T> { value: T | null; }
export interface WheelPoint { position: WheelCalculationValue<WheelSignPosition>; }
export interface WheelHouse {
  number: HouseNumber;
  cusp: WheelCalculationValue<WheelSignPosition>;
  end: WheelCalculationValue<WheelSignPosition>;
}
export type WheelHouseMap = {
  "1": WheelHouse; "2": WheelHouse; "3": WheelHouse; "4": WheelHouse;
  "5": WheelHouse; "6": WheelHouse; "7": WheelHouse; "8": WheelHouse;
  "9": WheelHouse; "10": WheelHouse; "11": WheelHouse; "12": WheelHouse;
};
export interface WheelHouseChart {
  status: "calculated" | "fallback" | "unavailable";
  houses: WheelHouseMap;
}
export type AspectKind =
  | "conjunction" | "opposition" | "trine" | "square" | "sextile"
  | "quincunx" | "semisextile" | "semisquare" | "sesquiquadrate"
  | "quintile" | "biquintile";
export interface Aspect {
  id: string;
  a: PointId;
  b: PointId;
  kind: AspectKind;
  class: "major" | "minor";
  character: "flowing" | "challenging" | "contextual" | "adjusting" | "creative";
}
export interface ChartWheelCalculation {
  provenance: { calculationFingerprint: string; };
  settings: { primaryHouseSystem: HouseSystem; };
  system: {
    points: Record<PointId, WheelPoint>;
    houses: Record<HouseSystem, WheelHouseChart>;
    aspects: Aspect[];
  };
}
