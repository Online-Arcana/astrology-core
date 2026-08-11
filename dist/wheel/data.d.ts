import type { Calculation } from "../types/calc.js";
import type { HouseSystem, PointId } from "../types/astro.js";
import type { WheelData, WheelHouseChart, WheelHouseMap, WheelPoint } from "./types.js";
export declare const emptyWheelHouses: () => WheelHouseMap;
export declare const emptyWheelHouseChart: () => WheelHouseChart;
export declare const emptyWheelPoints: () => Record<PointId, WheelPoint>;
export declare const emptyWheelData: (fingerprint?: string, primaryHouseSystem?: HouseSystem) => WheelData;
export declare const wheelData: (calculation: Calculation) => WheelData;
//# sourceMappingURL=data.d.ts.map