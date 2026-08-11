import { calc, loadPorts } from "../calculate/calc.js";
import { loadCscCatalogue } from "../place/csc.js";
const index = (length, rng) => Math.floor(rng() * length);
const pick = (values, rng) => values[index(values.length, rng)] ?? null;
const pad = (value) => String(value).padStart(2, "0");
const date = (rng) => {
    const first = Date.UTC(1950, 0, 1);
    const last = Date.UTC(2049, 11, 31);
    const day = 86_400_000;
    return new Date(first + index(Math.floor((last - first) / day) + 1, rng) * day).toISOString().slice(0, 10);
};
const time = (rng) => `${pad(index(24, rng))}:${pad(index(60, rng))}`;
const place = async (catalogue, rng) => {
    const countries = await catalogue.countries();
    if (countries.length === 0)
        throw new Error("The place catalogue contains no countries");
    for (let attempt = 0; attempt < 18; attempt += 1) {
        const country = pick(countries, rng);
        if (country === null)
            continue;
        const regions = await catalogue.regions(country.code);
        const region = pick(regions, rng);
        const cities = await catalogue.cities(country.code, region?.code ?? null, "");
        const usable = cities.filter((city) => city.timeZone.length > 0 && Number.isFinite(city.latitude) && Number.isFinite(city.longitude));
        const city = pick(usable, rng);
        if (city !== null)
            return city.id;
    }
    throw new Error("Could not find a random city with usable timezone data");
};
export const randomChart = async (options, rng = Math.random) => {
    const [ports, catalogue] = await Promise.all([loadPorts(), loadCscCatalogue()]);
    const placeId = await place(catalogue, rng);
    let last = null;
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const birth = { date: date(rng), time: time(rng), timeAccuracy: "exact", placeId };
        try {
            const result = await calc(birth, options, ports);
            if (result.system.points.ascendant.position.value !== null && result.system.points.midheaven.position.value !== null)
                return result;
            last = new Error("Random time did not produce complete timed chart geometry");
        }
        catch (cause) {
            last = cause;
        }
    }
    throw last instanceof Error ? last : new Error("Could not produce a complete random exact-time chart");
};
//# sourceMappingURL=chart.js.map