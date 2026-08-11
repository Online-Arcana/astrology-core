import { normalisePlace, parsePlaceId, placeId } from "./normalise.js";
const fold = (value) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en-GB");
const order = (items) => items.sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
const zone = (city, region, country) => {
    const values = [city.timezone, region?.timezone ?? null];
    if (country.timezones.length === 1)
        values.push(country.timezones[0]?.zoneName ?? null);
    return values.find((value) => typeof value === "string" && value.length > 0) ?? "";
};
export class WebPlaces {
    #base;
    #manifest;
    #countries;
    #countryMeta = new Map();
    #regions = new Map();
    #cities = new Map();
    constructor(base) {
        this.#base = new URL("./", base);
        this.#manifest = this.#json("manifest.json");
        this.#countries = this.#json("data/countries.json");
    }
    async #json(path) {
        const response = await fetch(new URL(path, this.#base), { cache: "force-cache", credentials: "omit" });
        if (!response.ok)
            throw new Error(`Place data ${path} failed with HTTP ${response.status}`);
        return response.json();
    }
    async #countryDir(code) {
        const selected = code.toUpperCase();
        const directory = (await this.#manifest).countries[selected];
        if (directory === undefined)
            throw new Error(`Unknown country ${selected}`);
        return directory;
    }
    async #meta(code) {
        const selected = code.toUpperCase();
        const cached = this.#countryMeta.get(selected);
        if (cached !== undefined)
            return cached;
        const loaded = this.#countryDir(selected).then((directory) => this.#json(`data/${directory}/meta.json`));
        this.#countryMeta.set(selected, loaded);
        return loaded;
    }
    async #regionValues(code) {
        const selected = code.toUpperCase();
        const cached = this.#regions.get(selected);
        if (cached !== undefined)
            return cached;
        const loaded = this.#countryDir(selected).then((directory) => this.#json(`data/${directory}/states.json`));
        this.#regions.set(selected, loaded);
        return loaded;
    }
    async #cityValues(countryCode, regionCode) {
        const country = countryCode.toUpperCase();
        const region = regionCode.toUpperCase();
        const key = `${country}:${region}`;
        const cached = this.#cities.get(key);
        if (cached !== undefined)
            return cached;
        const loaded = Promise.all([this.#manifest, this.#countryDir(country)]).then(([manifest, countryDirectory]) => {
            const regionDirectory = manifest.states[country]?.[region];
            if (regionDirectory === undefined)
                throw new Error(`Unknown region ${country}/${region}`);
            return this.#json(`data/${countryDirectory}/${regionDirectory}/cities.json`);
        });
        this.#cities.set(key, loaded);
        return loaded;
    }
    async continents() {
        return [...new Set((await this.#countries).map(({ region }) => region.trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "en-GB"));
    }
    async countries(continent) {
        const selected = continent === undefined ? null : fold(continent);
        return order((await this.#countries)
            .filter((country) => selected === null || fold(country.region) === selected)
            .map((country) => ({
            code: country.iso2.toUpperCase(),
            name: country.name,
            continent: country.region,
            subcontinent: country.subregion || null,
        })));
    }
    async regions(countryCode) {
        return order((await this.#regionValues(countryCode)).map((region) => ({
            code: region.iso2.toUpperCase(),
            name: region.name,
        })));
    }
    async cities(countryCode, regionCode, query) {
        const country = countryCode.toUpperCase();
        const [meta, regions] = await Promise.all([this.#meta(country), this.#regionValues(country)]);
        const selected = regionCode === null
            ? regions
            : regions.filter(({ iso2 }) => iso2.toUpperCase() === regionCode.toUpperCase());
        if (regionCode !== null && selected.length === 0)
            throw new Error(`Unknown region ${country}/${regionCode}`);
        const batches = await Promise.all(selected.map(async (region) => ({
            region,
            cities: await this.#cityValues(country, region.iso2),
        })));
        const needle = fold(query.trim());
        return order(batches.flatMap(({ region, cities }) => cities
            .filter((city) => needle.length === 0 || fold(city.name).includes(needle))
            .flatMap((city) => {
            const timeZone = zone(city, region, meta);
            if (timeZone.length === 0)
                return [];
            return [{
                    id: placeId(country, region.iso2, city.id),
                    name: city.name,
                    region: { code: region.iso2.toUpperCase(), name: region.name },
                    latitude: Number(city.latitude),
                    longitude: Number(city.longitude),
                    timeZone,
                }];
        })));
    }
    async get(id) {
        const parsed = parsePlaceId(id);
        const [country, regions] = await Promise.all([
            this.#meta(parsed.countryCode),
            this.#regionValues(parsed.countryCode),
        ]);
        const region = parsed.regionCode === null
            ? null
            : regions.find(({ iso2 }) => iso2.toUpperCase() === parsed.regionCode) ?? null;
        if (parsed.regionCode !== null && region === null) {
            throw new Error(`Unknown region ${parsed.countryCode}/${parsed.regionCode}`);
        }
        const candidates = region === null
            ? (await Promise.all(regions.map(({ iso2 }) => this.#cityValues(parsed.countryCode, iso2)))).flat()
            : await this.#cityValues(parsed.countryCode, region.iso2);
        const city = candidates.find(({ id: cityId }) => cityId === parsed.cityId);
        if (city === undefined)
            throw new Error(`Unknown city ${parsed.cityId}`);
        return normalisePlace(country, region, city);
    }
}
export const webPlaces = (base) => new WebPlaces(base);
//# sourceMappingURL=web.js.map