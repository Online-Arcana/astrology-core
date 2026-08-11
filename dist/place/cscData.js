import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../data/places/", import.meta.url));
const countryDirs = new Map();
const stateDirs = new Map();
const json = async (...parts) => JSON.parse(await readFile(join(root, ...parts), "utf8"));
const code = (name) => {
    const at = name.lastIndexOf("-");
    return at < 0 ? null : name.slice(at + 1).toUpperCase();
};
const dirs = async (parts) => {
    const values = new Map();
    for (const item of await readdir(join(root, ...parts), { withFileTypes: true })) {
        if (!item.isDirectory())
            continue;
        const key = code(item.name);
        if (key !== null)
            values.set(key, item.name);
    }
    return values;
};
const countryDir = async (countryCode) => {
    if (countryDirs.size === 0) {
        for (const [key, value] of await dirs([]))
            countryDirs.set(key, value);
    }
    return countryDirs.get(countryCode.toUpperCase()) ?? null;
};
const stateDir = async (countryCode, stateCode) => {
    const cc = countryCode.toUpperCase();
    const country = await countryDir(cc);
    if (country === null)
        return null;
    let values = stateDirs.get(cc);
    if (values === undefined) {
        values = await dirs([country]);
        stateDirs.set(cc, values);
    }
    return values.get(stateCode.toUpperCase()) ?? null;
};
const country = async (countryCode) => {
    const dir = await countryDir(countryCode);
    if (dir === null)
        return null;
    return { dir, meta: await json(dir, "meta.json") };
};
const getStates = async (countryCode) => {
    const value = await country(countryCode);
    return value === null ? [] : json(value.dir, "states.json");
};
const getCities = async (countryCode, stateCode) => {
    const country = await countryDir(countryCode);
    const state = await stateDir(countryCode, stateCode);
    return country === null || state === null ? [] : json(country, state, "cities.json");
};
export const cscData = {
    getCountries: () => json("countries.json"),
    async getCountryByCode(countryCode) {
        return (await country(countryCode))?.meta ?? null;
    },
    getStatesOfCountry: getStates,
    async getStateByCode(countryCode, stateCode) {
        const wanted = stateCode.toUpperCase();
        return (await getStates(countryCode)).find((value) => value.iso2.toUpperCase() === wanted) ?? null;
    },
    getCitiesOfState: getCities,
    async getAllCitiesOfCountry(countryCode) {
        const rows = [];
        for (const state of await getStates(countryCode))
            rows.push(...await getCities(countryCode, state.iso2));
        return rows;
    },
};
//# sourceMappingURL=cscData.js.map