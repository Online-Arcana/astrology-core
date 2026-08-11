import { loadAstronomia } from "./astro/astronomia.js";
import { loadLunarOrbit } from "./astro/lunarOrbit.js";
import { loadEclipses } from "./eclipse/astronomia.js";
import { webPlaces } from "./place/web.js";
import { loadTimeResolver } from "./time/vendor.js";
import type { CalcPorts } from "./calculate/types.js";

export * from "./types/index.js";
export * from "./calculate/calc.js";
export * from "./place/model.js";
export * from "./place/web.js";

export const webPorts = async (places: URL, version = "0.20.0"): Promise<CalcPorts> => {
  const [timeResolver, astronomy, lunarOrbit, eclipses] = await Promise.all([
    loadTimeResolver(),
    loadAstronomia(),
    loadLunarOrbit(),
    loadEclipses(),
  ]);
  return {
    places: webPlaces(places),
    timeResolver,
    astronomy,
    lunarOrbit,
    eclipses,
    version,
    now: () => new Date().toISOString(),
  };
};
