import type { PlaceData } from "../types/base.js";
import type { CityChoice, CountryChoice, CscApi, PlaceCatalogue, RegionChoice } from "./model.js";
export declare class CscCatalogue implements PlaceCatalogue {
    #private;
    constructor(api: CscApi);
    continents(): Promise<string[]>;
    countries(continent?: string): Promise<CountryChoice[]>;
    regions(countryCode: string): Promise<RegionChoice[]>;
    cities(countryCode: string, regionCode: string | null, query: string): Promise<CityChoice[]>;
    get(id: string): Promise<PlaceData>;
}
export declare const loadCscCatalogue: () => Promise<CscCatalogue>;
//# sourceMappingURL=csc.d.ts.map