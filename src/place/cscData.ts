import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CscApi, CscCity, CscCountry, CscCountryMeta, CscRegion } from "./model.js";

const root = fileURLToPath(new URL("../data/places/", import.meta.url));
const countryDirs = new Map<string, string>();
const stateDirs = new Map<string, Map<string, string>>();

const json = async <T>(...parts: string[]): Promise<T> =>
  JSON.parse(await readFile(join(root, ...parts), "utf8")) as T;

const code = (name: string): string | null => {
  const at = name.lastIndexOf("-");
  return at < 0 ? null : name.slice(at + 1).toUpperCase();
};

const dirs = async (parts: readonly string[]): Promise<Map<string, string>> => {
  const values = new Map<string, string>();
  for (const item of await readdir(join(root, ...parts), { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    const key = code(item.name);
    if (key !== null) values.set(key, item.name);
  }
  return values;
};

const countryDir = async (countryCode: string): Promise<string | null> => {
  if (countryDirs.size === 0) {
    for (const [key, value] of await dirs([])) countryDirs.set(key, value);
  }
  return countryDirs.get(countryCode.toUpperCase()) ?? null;
};

const stateDir = async (countryCode: string, stateCode: string): Promise<string | null> => {
  const cc = countryCode.toUpperCase();
  const country = await countryDir(cc);
  if (country === null) return null;
  let values = stateDirs.get(cc);
  if (values === undefined) {
    values = await dirs([country]);
    stateDirs.set(cc, values);
  }
  return values.get(stateCode.toUpperCase()) ?? null;
};

const country = async (countryCode: string): Promise<{ dir: string; meta: CscCountryMeta } | null> => {
  const dir = await countryDir(countryCode);
  if (dir === null) return null;
  return { dir, meta: await json<CscCountryMeta>(dir, "meta.json") };
};

const getStates = async (countryCode: string): Promise<CscRegion[]> => {
  const value = await country(countryCode);
  return value === null ? [] : json<CscRegion[]>(value.dir, "states.json");
};

const getCities = async (countryCode: string, stateCode: string): Promise<CscCity[]> => {
  const country = await countryDir(countryCode);
  const state = await stateDir(countryCode, stateCode);
  return country === null || state === null ? [] : json<CscCity[]>(country, state, "cities.json");
};

export const cscData: CscApi = {
  getCountries: () => json<CscCountry[]>("countries.json"),

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
    const rows: CscCity[] = [];
    for (const state of await getStates(countryCode)) rows.push(...await getCities(countryCode, state.iso2));
    return rows;
  },
};
