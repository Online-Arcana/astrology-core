import { loadVendor } from "../vendor/load.js";
import { normalisePlace, parsePlaceId, placeId } from "./normalise.js";
const fold = (value) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en-GB");
const order = (items) => items.sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
const cityZone = (city, region, country) => {
    if (city.timezone)
        return city.timezone;
    if (region?.timezone)
        return region.timezone;
    if (country.timezones.length === 1 && country.timezones[0])
        return country.timezones[0].zoneName;
    return "";
};
export class CscCatalogue {
    #api;
    constructor(api) {
        this.#api = api;
    }
    async continents() {
        return [...new Set((await this.#api.getCountries()).map((country) => country.region.trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "en-GB"));
    }
    async countries(continent) {
        const selected = continent ? fold(continent) : null;
        return order((await this.#api.getCountries())
            .filter((country) => selected === null || fold(country.region) === selected)
            .map((country) => ({
            code: country.iso2.toUpperCase(),
            name: country.name,
            continent: country.region,
            subcontinent: country.subregion || null,
        })));
    }
    async regions(countryCode) {
        return order((await this.#api.getStatesOfCountry(countryCode.toUpperCase()))
            .map((region) => ({ code: region.iso2.toUpperCase(), name: region.name })));
    }
    async cities(countryCode, regionCode, query) {
        const cc = countryCode.toUpperCase();
        const country = await this.#api.getCountryByCode(cc);
        if (!country)
            throw new Error(`Unknown country ${cc}`);
        const region = regionCode ? await this.#api.getStateByCode(cc, regionCode.toUpperCase()) : null;
        if (regionCode && !region)
            throw new Error(`Unknown region ${cc}/${regionCode}`);
        const cities = region
            ? await this.#api.getCitiesOfState(cc, region.iso2)
            : await this.#api.getAllCitiesOfCountry(cc);
        const needle = fold(query.trim());
        return order(cities
            .filter((city) => needle.length === 0 || fold(city.name).includes(needle))
            .map((city) => ({
            id: placeId(cc, region?.iso2 ?? (city.state_code || null), city.id),
            name: city.name,
            region: region
                ? { code: region.iso2.toUpperCase(), name: region.name }
                : city.state_code
                    ? { code: city.state_code.toUpperCase(), name: city.state_code.toUpperCase() }
                    : null,
            latitude: Number(city.latitude),
            longitude: Number(city.longitude),
            timeZone: cityZone(city, region, country),
        })));
    }
    async get(id) {
        const parsed = parsePlaceId(id);
        const country = await this.#api.getCountryByCode(parsed.countryCode);
        if (!country)
            throw new Error(`Unknown country ${parsed.countryCode}`);
        const region = parsed.regionCode
            ? await this.#api.getStateByCode(parsed.countryCode, parsed.regionCode)
            : null;
        if (parsed.regionCode && !region)
            throw new Error(`Unknown region ${parsed.countryCode}/${parsed.regionCode}`);
        const cities = region
            ? await this.#api.getCitiesOfState(parsed.countryCode, parsed.regionCode)
            : await this.#api.getAllCitiesOfCountry(parsed.countryCode);
        const city = cities.find((candidate) => candidate.id === parsed.cityId);
        if (!city)
            throw new Error(`Unknown city ${parsed.cityId}`);
        return normalisePlace(country, region, city);
    }
}
export const loadCscCatalogue = async () => {
    const api = await loadVendor("@countrystatecity/countries");
    return new CscCatalogue(api);
};
//# sourceMappingURL=csc.js.map