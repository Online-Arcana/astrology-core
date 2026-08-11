import type { PlaceData } from "../types/base.js";
import type { CityChoice, CountryChoice, PlaceCatalogue, RegionChoice } from "./model.js";
export declare class WebPlaces implements PlaceCatalogue {
    #private;
    constructor(base: URL);
    continents(): Promise<string[]>;
    countries(continent?: string): Promise<CountryChoice[]>;
    regions(countryCode: string): Promise<RegionChoice[]>;
    cities(countryCode: string, regionCode: string | null, query: string): Promise<CityChoice[]>;
    get(id: string): Promise<PlaceData>;
}
export declare const webPlaces: (base: URL) => WebPlaces;
//# sourceMappingURL=web.d.ts.map