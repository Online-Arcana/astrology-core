import { calculateLots } from "../astro/lots.js";
import { detectDeclinationAspects } from "../aspect/declination.js";
import { detectAspects } from "../aspect/detect.js";
import { calculateDerived } from "../derived/calculate.js";
import { calculateEclipses } from "../eclipse/calculate.js";
import { unavailableHouseCharts } from "../house/chart.js";
import { detectPatterns } from "../pattern/detect.js";
import { buildPoints } from "../zodiac/points.js";
import { calculateLunarPhase, calculated } from "./state.js";
export const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const pointIds = [
    ...planets,
    "north_node_true", "south_node_true", "north_node_mean", "south_node_mean",
    "ascendant", "descendant", "midheaven", "imum_coeli", "vertex", "antivertex", "east_point",
    "part_of_fortune", "part_of_spirit", "lilith_mean", "lilith_true",
];
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
export const zodiacCalculation = (zodiac, selectedAyanamsha, ayanamshaValue, ayanamshaCalc, astronomy, orbit, angles, auxiliary, houses, sect, lots, timed, eclipses) => {
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
//# sourceMappingURL=system.js.map