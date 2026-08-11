import type { PlaceData } from "../types/base.js";
import type { CscCity, CscCountryMeta, CscRegion } from "./model.js";
export declare const placeId: (countryCode: string, regionCode: string | null, cityId: number) => string;
export interface ParsedPlaceId {
    countryCode: string;
    regionCode: string | null;
    cityId: number;
}
export declare const parsePlaceId: (id: string) => ParsedPlaceId;
export declare const normalisePlace: (country: CscCountryMeta, region: CscRegion | null, city: CscCity) => PlaceData;
//# sourceMappingURL=normalise.d.ts.map