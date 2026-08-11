import { lunarPhase } from "../astro/lunar.js";
import type { AstronomyPort } from "../astro/port.js";
import { canonicalBytes } from "../hash/canonical.js";
import { digest } from "../hash/digest.js";
import { auxiliaryAngles, coreAngles, type AuxiliaryAngles, type CoreAngles } from "../house/angles.js";
import { calculateHouseCharts, unavailableHouseCharts } from "../house/chart.js";
import type { BirthInput, Calc, CalcReason, JsonRef, TimeData } from "../types/base.js";
import type { AstronomyData, LunarPhase, Zodiac, ZodiacCalculation } from "../types/astro.js";
import type { CalcWarning } from "../types/calc.js";
import { CalcError, type CalcOptions, type TimedState, type TimedStatus } from "./types.js";

const ref = (value: string): JsonRef => `#/${value}` as JsonRef;
const unavailable = <T>(reason: CalcReason): Calc<T> => ({
  status: reason === "outside_supported_range" ? "unsupported" : "unavailable",
  value: null,
  reason,
});
export const calculated = <T>(value: T, status: TimedStatus, reason: CalcReason): Calc<T> => ({ status, value, reason });

export const selectedZodiac = (options: CalcOptions): Zodiac => options.zodiac;

export const timeState = (time: TimeData, astronomy: AstronomyPort): TimedState => {
  if (time.julianEphemerisDay !== null) {
    return time.resolution.status === "approximate"
      ? { julianEphemerisDay: time.julianEphemerisDay, status: "approximate", reason: "birth_time_approximate" }
      : { julianEphemerisDay: time.julianEphemerisDay, status: "exact", reason: "none" };
  }
  const window = time.resolution.value;
  if (!window) throw new CalcError(time.resolution.reason);
  const start = astronomy.time(window.utcStartIso).julianEphemerisDay;
  const end = astronomy.time(window.utcEndIso).julianEphemerisDay;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new CalcError("insufficient_data");
  }
  return {
    julianEphemerisDay: (start + end) / 2,
    status: "bounded",
    reason: time.resolution.reason === "none" ? "insufficient_data" : time.resolution.reason,
  };
};

export const angleState = (
  time: TimeData,
  astronomy: AstronomyPort,
  longitude: number,
  latitude: number,
): { core: CoreAngles | null; auxiliary: AuxiliaryAngles | null } => {
  if (time.julianDay === null || time.julianEphemerisDay === null || time.utcIso === null) {
    return { core: null, auxiliary: null };
  }
  const geometry = astronomy.geometry(time.julianDay, time.julianEphemerisDay);
  const core = coreAngles(geometry, longitude, latitude);
  return {
    core,
    auxiliary: auxiliaryAngles(core, latitude, geometry.trueObliquityRadians),
  };
};

export const houseState = (
  zodiac: Zodiac,
  angles: CoreAngles | null,
  astronomy: AstronomyPort,
  time: TimeData,
  latitude: number,
  ayanamsha: number,
  state: TimedState,
) => {
  if (!angles || time.julianDay === null || time.julianEphemerisDay === null) {
    return unavailableHouseCharts(state.reason);
  }
  const geometry = astronomy.geometry(time.julianDay, time.julianEphemerisDay);
  const status = state.status === "approximate" ? "approximate" : "exact";
  return calculateHouseCharts({
    angles,
    latitudeDegrees: latitude,
    obliquityRadians: geometry.trueObliquityRadians,
    zodiac,
    ayanamshaDegrees: ayanamsha,
    calculationStatus: status,
    calculationReason: status === "approximate" ? state.reason : "none",
  });
};

const lunarPhaseUnavailable = (reason: CalcReason): LunarPhase => ({
  angleDegrees: unavailable(reason),
  phase: unavailable(reason),
  illumination: unavailable(reason),
  ageDays: unavailable(reason),
  waxing: unavailable(reason),
});

export const calculateLunarPhase = (astronomy: AstronomyData): LunarPhase => {
  const sun = astronomy.bodies.sun.eclipticLongitudeDegrees;
  const moon = astronomy.bodies.moon.eclipticLongitudeDegrees;
  if (sun.value === null || moon.value === null) {
    return lunarPhaseUnavailable(sun.reason !== "none" ? sun.reason : moon.reason);
  }
  const base = lunarPhase(sun.value, moon.value);
  const status: TimedStatus = sun.status === "bounded" || moon.status === "bounded"
    ? "bounded"
    : sun.status === "approximate" || moon.status === "approximate"
      ? "approximate"
      : "exact";
  const reason = sun.reason !== "none" ? sun.reason : moon.reason;
  return {
    angleDegrees: calculated(base.angleDegrees.value as number, status, reason),
    phase: calculated(base.phase.value as NonNullable<LunarPhase["phase"]["value"]>, status, reason),
    illumination: calculated(base.illumination.value as number, status, reason),
    ageDays: calculated(base.ageDays.value as number, status, reason),
    waxing: calculated(base.waxing.value as boolean, status, reason),
  };
};

export const warnings = (
  input: BirthInput,
  time: TimeData,
  system: ZodiacCalculation,
): CalcWarning[] => {
  const result: CalcWarning[] = [];
  if (input.timeAccuracy === "unknown") {
    result.push({
      code: "birth_time_unknown",
      message: "Birth time is unknown; planetary positions are bounded to the civil date and timed angles, houses, lots and eclipse timing remain unavailable.",
      sourceRefs: [ref("astral-calculation/time/resolution")],
    });
  } else if (input.timeAccuracy === "approximate") {
    result.push({
      code: "birth_time_approximate",
      message: "Birth time is approximate; timed angles, houses and dependent values are marked approximate.",
      sourceRefs: [ref("astral-calculation/time/resolution")],
    });
  }
  if (time.resolution.reason === "ambiguous_local_time") {
    result.push({
      code: "ambiguous_local_time",
      message: "The supplied local time occurs twice; planetary positions are bounded across both instants and timed angles and houses remain unavailable.",
      sourceRefs: [ref("astral-calculation/time/resolution")],
    });
  }
  if (system.houses.placidus.status === "fallback") {
    result.push({
      code: `polar_placidus_fallback_${system.zodiac}`,
      message: `${system.zodiac} Placidus houses failed at the supplied latitude; the explicitly labelled Porphyry fallback is retained.`,
      sourceRefs: [ref("astral-calculation/system/houses/placidus")],
    });
  }
  return result;
};

export const fingerprint = async (value: object): Promise<string> =>
  `sha256:${await digest("SHA-256", canonicalBytes(value))}`;
