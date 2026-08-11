import { lunarPhase } from "../astro/lunar.js";
import { canonicalBytes } from "../hash/canonical.js";
import { digest } from "../hash/digest.js";
import { auxiliaryAngles, coreAngles } from "../house/angles.js";
import { calculateHouseCharts, unavailableHouseCharts } from "../house/chart.js";
import { CalcError } from "./types.js";
const ref = (value) => `#/${value}`;
const unavailable = (reason) => ({
    status: reason === "outside_supported_range" ? "unsupported" : "unavailable",
    value: null,
    reason,
});
export const calculated = (value, status, reason) => ({ status, value, reason });
export const selectedZodiac = (options) => options.zodiac;
export const timeState = (time, astronomy) => {
    if (time.julianEphemerisDay !== null) {
        return time.resolution.status === "approximate"
            ? { julianEphemerisDay: time.julianEphemerisDay, status: "approximate", reason: "birth_time_approximate" }
            : { julianEphemerisDay: time.julianEphemerisDay, status: "exact", reason: "none" };
    }
    const window = time.resolution.value;
    if (!window)
        throw new CalcError(time.resolution.reason);
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
export const angleState = (time, astronomy, longitude, latitude) => {
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
export const houseState = (zodiac, angles, astronomy, time, latitude, ayanamsha, state) => {
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
const lunarPhaseUnavailable = (reason) => ({
    angleDegrees: unavailable(reason),
    phase: unavailable(reason),
    illumination: unavailable(reason),
    ageDays: unavailable(reason),
    waxing: unavailable(reason),
});
export const calculateLunarPhase = (astronomy) => {
    const sun = astronomy.bodies.sun.eclipticLongitudeDegrees;
    const moon = astronomy.bodies.moon.eclipticLongitudeDegrees;
    if (sun.value === null || moon.value === null) {
        return lunarPhaseUnavailable(sun.reason !== "none" ? sun.reason : moon.reason);
    }
    const base = lunarPhase(sun.value, moon.value);
    const status = sun.status === "bounded" || moon.status === "bounded"
        ? "bounded"
        : sun.status === "approximate" || moon.status === "approximate"
            ? "approximate"
            : "exact";
    const reason = sun.reason !== "none" ? sun.reason : moon.reason;
    return {
        angleDegrees: calculated(base.angleDegrees.value, status, reason),
        phase: calculated(base.phase.value, status, reason),
        illumination: calculated(base.illumination.value, status, reason),
        ageDays: calculated(base.ageDays.value, status, reason),
        waxing: calculated(base.waxing.value, status, reason),
    };
};
export const warnings = (input, time, system) => {
    const result = [];
    if (input.timeAccuracy === "unknown") {
        result.push({
            code: "birth_time_unknown",
            message: "Birth time is unknown; planetary positions are bounded to the civil date and timed angles, houses, lots and eclipse timing remain unavailable.",
            sourceRefs: [ref("astral-calculation/time/resolution")],
        });
    }
    else if (input.timeAccuracy === "approximate") {
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
export const fingerprint = async (value) => `sha256:${await digest("SHA-256", canonicalBytes(value))}`;
//# sourceMappingURL=state.js.map