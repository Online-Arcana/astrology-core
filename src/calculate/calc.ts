import { calculateAstronomy } from "../astro/calculate.js";
import { loadAstronomia } from "../astro/astronomia.js";
import { loadLunarOrbit } from "../astro/lunarOrbit.js";
import { calculateLots } from "../astro/lots.js";
import { calculateSect } from "../astro/sect.js";
import { aspectProfile } from "../aspect/catalogue.js";
import { calculateCompatibility } from "../compat/calculate.js";
import { compatibilityProfile } from "../compat/rank.js";
import { dignityProfile } from "../dignity/catalogue.js";
import { calculateEclipses } from "../eclipse/calculate.js";
import { loadEclipses } from "../eclipse/astronomia.js";
import { loadCscCatalogue } from "../place/csc.js";
import { resolveBirthTime } from "../time/calculate.js";
import { loadTimeResolver } from "../time/vendor.js";
import type { BirthInput } from "../types/base.js";
import type { Calculation } from "../types/calc.js";
import { vendorRevisions } from "../vendor/revisions.js";
import { ayanamshaDegrees } from "../zodiac/ayanamsha.js";
import { angleState, calculated, fingerprint, houseState, selectedZodiac, timeState, warnings } from "./state.js";
import { planets, zodiacCalculation } from "./system.js";
import { CalcError, calculationProfile, type CalcOptions, type CalcPorts } from "./types.js";

export { CalcError, calculationProfile } from "./types.js";
export type { CalcOptions, CalcPorts } from "./types.js";

export const calc = async (input: BirthInput, options: CalcOptions, ports: CalcPorts): Promise<Calculation> => {
    const zodiac = selectedZodiac(options);
    const place = await ports.places.get(input.placeId);
    const time = resolveBirthTime(input, place.timeZone, ports.timeResolver, ports.astronomy);
    const timed = timeState(time, ports.astronomy);
    const astronomy = calculateAstronomy(time, ports.astronomy);
    if (planets.some((id) => astronomy.bodies[id].eclipticLongitudeDegrees.value === null)) {
      throw new CalcError(time.resolution.reason);
    }

    const angles = angleState(time, ports.astronomy, place.longitude, place.latitude);
    const sect = calculateSect(
      astronomy,
      angles.core,
      place.latitude,
      timed.status,
      timed.reason,
    );
    const lots = calculateLots(astronomy, angles.core, sect);
    const orbit = ports.lunarOrbit.sample(timed.julianEphemerisDay);
    const ayanamshaValue = zodiac === "sidereal"
      ? ayanamshaDegrees(timed.julianEphemerisDay, options.ayanamsha)
      : 0;
    const ayanamshaCalc = zodiac === "sidereal"
      ? calculated(ayanamshaValue, timed.status, timed.reason)
      : calculated(0, "exact", "none");
    const houses = houseState(
      zodiac,
      angles.core,
      ports.astronomy,
      time,
      place.latitude,
      ayanamshaValue,
      timed,
    );
    const eclipseValues = calculateEclipses({
      time,
      astronomy: ports.astronomy,
      lunarOrbit: ports.lunarOrbit,
      eclipses: ports.eclipses,
      zodiac,
      ayanamsha: zodiac === "sidereal" ? options.ayanamsha : null,
    });

    const system = zodiacCalculation(
      zodiac,
      options.ayanamsha,
      ayanamshaValue,
      ayanamshaCalc,
      astronomy,
      orbit,
      angles.core,
      angles.auxiliary,
      houses,
      sect,
      lots,
      timed,
      eclipseValues,
    );

    const compatibility = {
      method: "natal_to_sign_archetype" as const,
      profile: compatibilityProfile,
      ...calculateCompatibility(zodiac, system.points),
    };
    const warningValues = warnings(input, time, system);
    const settings = {
      primaryZodiac: zodiac,
      siderealAyanamsha: zodiac === "sidereal" ? options.ayanamsha : null,
      primaryHouseSystem: "placidus" as const,
      polarFallback: "porphyry" as const,
      houseSystems: ["placidus", "whole_sign", "equal", "porphyry"] as ["placidus", "whole_sign", "equal", "porphyry"],
    };
    const core = {
      schema: "astral-core/1.0.0" as const,
      birth: { date: input.date, time: input.time, timeAccuracy: input.timeAccuracy },
      place,
      time,
      settings,
      astronomy,
      system,
      compatibility,
      warnings: warningValues,
    };
    const calculationFingerprint = await fingerprint(core);
    return {
      ...core,
      provenance: {
        generatedAt: ports.now(),
        coreVersion: ports.version,
        astronomia: vendorRevisions.astronomia,
        places: vendorRevisions.places,
        time: {
          repository: vendorRevisions.time.repository,
          revision: vendorRevisions.time.revision,
          version: `${vendorRevisions.time.coreVersion}+${vendorRevisions.time.timezoneVersion}`,
          timeZoneDatabaseVersion: ports.timeResolver.info.dataVersion,
          calendar: "proleptic_gregorian",
          supportedRange: ports.timeResolver.info.supportedRange,
        },
        astrologyProfile: calculationProfile,
        aspectProfile,
        dignityProfile,
        compatibilityProfile,
        calculationFingerprint,
      },
    };
  
};

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
