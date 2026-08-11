import { renderChartWheel } from "./chartWheel.js";
import type {
  AspectKind,
  ChartWheelCalculation,
  HouseNumber,
  HouseSystem,
  PointId,
  WheelHouseChart,
  WheelHouseMap,
  WheelPoint,
} from "./types.js";

export interface PublicWheelHouse {
  number: HouseNumber;
  cuspLongitudeDegrees: number | null;
  endLongitudeDegrees: number | null;
}

export interface PublicWheelAspect {
  id: string;
  a: PointId;
  b: PointId;
  kind: AspectKind;
  class: "major" | "minor";
  character: "flowing" | "challenging" | "contextual" | "adjusting" | "creative";
}

export interface PublicWheelMeta {
  schema: "astral-public-wheel/1.0.0";
  calculationFingerprint: string;
  primaryHouseSystem: HouseSystem;
  points: Record<PointId, number | null>;
  houses: {
    status: "calculated" | "fallback" | "unavailable";
    houses: Record<string, PublicWheelHouse>;
  };
  aspects: PublicWheelAspect[];
}

const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const emptyHouseMap = (): WheelHouseMap => Object.fromEntries(
  houseNumbers.map((number) => [String(number), {
    number,
    cusp: { value: null },
    end: { value: null },
  }]),
) as WheelHouseMap;

const selectedHouseMap = (meta: PublicWheelMeta): WheelHouseMap => Object.fromEntries(
  houseNumbers.map((number) => {
    const source = meta.houses.houses[String(number)];
    if (source === undefined) {
      return [String(number), {
        number,
        cusp: { value: null },
        end: { value: null },
      }];
    }
    return [String(number), {
      number,
      cusp: {
        value: source.cuspLongitudeDegrees === null
          ? null
          : { longitudeDegrees: source.cuspLongitudeDegrees },
      },
      end: {
        value: source.endLongitudeDegrees === null
          ? null
          : { longitudeDegrees: source.endLongitudeDegrees },
      },
    }];
  }),
) as WheelHouseMap;

export function chartWheelCalculationFromPublicMeta(
  meta: PublicWheelMeta,
): ChartWheelCalculation {
  const points = Object.fromEntries(
    Object.entries(meta.points).map(([id, longitudeDegrees]) => [id, {
      position: {
        value: longitudeDegrees === null ? null : { longitudeDegrees },
      },
    } satisfies WheelPoint]),
  ) as Record<PointId, WheelPoint>;

  const unavailable = (): WheelHouseChart => ({
    status: "unavailable",
    houses: emptyHouseMap(),
  });
  const houses: Record<HouseSystem, WheelHouseChart> = {
    placidus: unavailable(),
    whole_sign: unavailable(),
    equal: unavailable(),
    porphyry: unavailable(),
  };
  houses[meta.primaryHouseSystem] = {
    status: meta.houses.status,
    houses: selectedHouseMap(meta),
  };

  return {
    provenance: {
      calculationFingerprint: meta.calculationFingerprint,
    },
    settings: {
      primaryHouseSystem: meta.primaryHouseSystem,
    },
    system: {
      points,
      houses,
      aspects: meta.aspects.map((aspect) => ({ ...aspect })),
    },
  };
}

export function renderPublicChartWheel(meta: PublicWheelMeta): HTMLElement {
  return renderChartWheel(chartWheelCalculationFromPublicMeta(meta));
}
