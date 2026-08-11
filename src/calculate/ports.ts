import { loadAstronomia } from "../astro/astronomia.js";
import { loadLunarOrbit } from "../astro/lunarOrbit.js";
import { loadEclipses } from "../eclipse/astronomia.js";
import { loadCscCatalogue } from "../place/csc.js";
import { loadTimeResolver } from "../time/vendor.js";
import type { CalcPorts } from "./types.js";

export const loadPorts = async (version = "0.20.0"): Promise<CalcPorts> => {
  const [places, timeResolver, astronomy, lunarOrbit, eclipses] = await Promise.all([
    loadCscCatalogue(),
    loadTimeResolver(),
    loadAstronomia(),
    loadLunarOrbit(),
    loadEclipses(),
  ]);
  return {
    places,
    timeResolver,
    astronomy,
    lunarOrbit,
    eclipses,
    version,
    now: () => new Date().toISOString(),
  };
};
