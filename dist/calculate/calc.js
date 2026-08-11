import { calculateAstronomy } from "../astro/calculate.js";
import { loadAstronomia } from "../astro/astronomia.js";
import { lunarPhase } from "../astro/lunar.js";
import { loadLunarOrbit } from "../astro/lunarOrbit.js";
import { calculateLots } from "../astro/lots.js";
import { calculateSect } from "../astro/sect.js";
import { detectDeclinationAspects } from "../aspect/declination.js";
import { aspectProfile } from "../aspect/catalogue.js";
import { detectAspects } from "../aspect/detect.js";
import { calculateCompatibility } from "../compat/calculate.js";
import { compatibilityProfile } from "../compat/rank.js";
import { calculateDerived } from "../derived/calculate.js";
import { dignityProfile } from "../dignity/catalogue.js";
import { calculateEclipses } from "../eclipse/calculate.js";
import { loadEclipses } from "../eclipse/astronomia.js";
import { canonicalBytes } from "../hash/canonical.js";
import { digest } from "../hash/digest.js";
import { auxiliaryAngles, coreAngles } from "../house/angles.js";
import { calculateHouseCharts, unavailableHouseCharts } from "../house/chart.js";
import { detectPatterns } from "../pattern/detect.js";
import { loadCscCatalogue } from "../place/csc.js";
import { resolveBirthTime } from "../time/calculate.js";
import { loadTimeResolver } from "../time/vendor.js";
import {} from "../types/base.js";
import { vendorRevisions } from "../vendor/revisions.js";
import { ayanamshaDegrees } from "../zodiac/ayanamsha.js";
import { buildPoints } from "../zodiac/points.js";
export const calculationProfile = "western_natal/1.1.0";
const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const pointIds = [
    ...planets,
    "north_node_true", "south_node_true", "north_node_mean", "south_node_mean",
    "ascendant", "descendant", "midheaven", "imum_coeli", "vertex", "antivertex", "east_point",
    "part_of_fortune", "part_of_spirit", "lilith_mean", "lilith_true",
];
export class CalcError extends Error {
    reason;
    constructor(reason) {
        super(`Chart calculation is unavailable: ${reason}`);
        this.name = "CalcError";
        this.reason = reason;
    }
}
const ref = (value) => `#/${value}`;
const unavailable = (reason) => ({
    status: reason === "outside_supported_range" ? "unsupported" : "unavailable",
    value: null,
    reason,
});
const calculated = (value, status, reason) => ({ status, value, reason });
const selectedZodiac = (options) => options.zodiac;
const timeState = (time, astronomy) => {
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
const angleState = (time, astronomy, longitude, latitude) => {
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
const houseState = (zodiac, angles, astronomy, time, latitude, ayanamsha, state) => {
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
const speed = (id, astronomy, orbit) => {
    if (planets.includes(id))
        return astronomy.bodies[id].longitudeSpeedDegreesPerDay.value;
    switch (id) {
        case "north_node_true":
        case "south_node_true": return orbit.trueNode.speedDegreesPerDay;
        case "north_node_mean":
        case "south_node_mean": return orbit.meanNode.speedDegreesPerDay;
        case "lilith_mean": return orbit.meanApogee.speedDegreesPerDay;
        case "lilith_true": return orbit.trueApogee.speedDegreesPerDay;
        default: return null;
    }
};
const aspectPoints = (points, astronomy, orbit) => pointIds.flatMap((id) => {
    const position = points[id].position.value;
    return position
        ? [{ id, longitudeDegrees: position.longitudeDegrees, speedDegreesPerDay: speed(id, astronomy, orbit) }]
        : [];
});
const patternPoints = (points) => pointIds.flatMap((id) => {
    const position = points[id].position.value;
    return position ? [{ id, position }] : [];
});
const lunarPhaseUnavailable = (reason) => ({
    angleDegrees: unavailable(reason),
    phase: unavailable(reason),
    illumination: unavailable(reason),
    ageDays: unavailable(reason),
    waxing: unavailable(reason),
});
const calculateLunarPhase = (astronomy) => {
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
const zodiacCalculation = (zodiac, selectedAyanamsha, ayanamshaValue, ayanamshaCalc, astronomy, orbit, angles, auxiliary, houses, sect, lots, timed, eclipses) => {
    const built = buildPoints({
        astronomy,
        houses,
        angles,
        auxiliary,
        lunarOrbit: orbit,
        lots,
        sect,
        zodiac,
        ayanamshaDegrees: ayanamshaValue,
        timedStatus: timed.status,
        timedReason: timed.reason,
        unavailableReason: timed.reason,
    });
    const aspects = detectAspects(aspectPoints(built.points, astronomy, orbit));
    const declinationAspects = detectDeclinationAspects(planets.flatMap((id) => {
        const value = astronomy.bodies[id].declinationRadians.value;
        return value === null ? [] : [{ id, declinationRadians: value }];
    }));
    const patterns = detectPatterns(patternPoints(built.points), aspects);
    return {
        zodiac,
        ayanamsha: zodiac === "sidereal" ? selectedAyanamsha : null,
        ayanamshaDegrees: zodiac === "sidereal" ? ayanamshaCalc : calculated(0, "exact", "none"),
        points: built.points,
        houses: built.houses,
        aspects,
        declinationAspects,
        patterns,
        lunarPhase: calculateLunarPhase(astronomy),
        eclipses,
        derived: calculateDerived({ points: built.points, aspects, sect }),
    };
};
const warnings = (input, time, system) => {
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
const fingerprint = async (value) => `sha256:${await digest("SHA-256", canonicalBytes(value))}`;
export const calc = async (input, options, ports) => {
    const zodiac = selectedZodiac(options);
    const place = await ports.places.get(input.placeId);
    const time = resolveBirthTime(input, place.timeZone, ports.timeResolver, ports.astronomy);
    const timed = timeState(time, ports.astronomy);
    const astronomy = calculateAstronomy(time, ports.astronomy);
    if (planets.some((id) => astronomy.bodies[id].eclipticLongitudeDegrees.value === null)) {
        throw new CalcError(time.resolution.reason);
    }
    const angles = angleState(time, ports.astronomy, place.longitude, place.latitude);
    const sect = calculateSect(astronomy, angles.core, place.latitude, timed.status, timed.reason);
    const lots = calculateLots(astronomy, angles.core, sect);
    const orbit = ports.lunarOrbit.sample(timed.julianEphemerisDay);
    const ayanamshaValue = zodiac === "sidereal"
        ? ayanamshaDegrees(timed.julianEphemerisDay, options.ayanamsha)
        : 0;
    const ayanamshaCalc = zodiac === "sidereal"
        ? calculated(ayanamshaValue, timed.status, timed.reason)
        : calculated(0, "exact", "none");
    const houses = houseState(zodiac, angles.core, ports.astronomy, time, place.latitude, ayanamshaValue, timed);
    const eclipseValues = calculateEclipses({
        time,
        astronomy: ports.astronomy,
        lunarOrbit: ports.lunarOrbit,
        eclipses: ports.eclipses,
        zodiac,
        ayanamsha: zodiac === "sidereal" ? options.ayanamsha : null,
    });
    const system = zodiacCalculation(zodiac, options.ayanamsha, ayanamshaValue, ayanamshaCalc, astronomy, orbit, angles.core, angles.auxiliary, houses, sect, lots, timed, eclipseValues);
    const compatibility = {
        method: "natal_to_sign_archetype",
        profile: compatibilityProfile,
        ...calculateCompatibility(zodiac, system.points),
    };
    const warningValues = warnings(input, time, system);
    const settings = {
        primaryZodiac: zodiac,
        siderealAyanamsha: zodiac === "sidereal" ? options.ayanamsha : null,
        primaryHouseSystem: "placidus",
        polarFallback: "porphyry",
        houseSystems: ["placidus", "whole_sign", "equal", "porphyry"],
    };
    const core = {
        schema: "astral-core/1.0.0",
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
export const loadPorts = async (version = "0.20.0") => {
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
//# sourceMappingURL=calc.js.map