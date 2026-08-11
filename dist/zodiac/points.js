import { calculateDignity } from "../dignity/calculate.js";
import { housePlacement } from "../house/chart.js";
import { normaliseDegrees, signPosition } from "./position.js";
const houseSystems = ["placidus", "whole_sign", "equal", "porphyry"];
const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const pointIds = [
    ...planets,
    "north_node_true", "south_node_true", "north_node_mean", "south_node_mean",
    "ascendant", "descendant", "midheaven", "imum_coeli", "vertex", "antivertex", "east_point",
    "part_of_fortune", "part_of_spirit", "lilith_mean", "lilith_true",
];
const unavailable = (reason) => ({
    status: reason === "outside_supported_range" ? "unsupported" : "unavailable",
    value: null,
    reason,
});
const available = (value, status, reason) => ({ status, value, reason });
const shiftPosition = (longitude, shift) => longitude.value === null
    ? { status: longitude.status, value: null, reason: longitude.reason }
    : { status: longitude.status, value: signPosition(longitude.value - shift), reason: longitude.reason };
const motion = (sample) => Math.abs(sample.speedDegreesPerDay) <= 0.005 ? "stationary" : sample.speedDegreesPerDay > 0 ? "direct" : "retrograde";
const blankDignity = () => unavailable("provider_not_available");
const placements = (position, houses) => {
    const result = {};
    for (const system of houseSystems) {
        result[system] = position.value === null
            ? unavailable(position.reason)
            : housePlacement(position.value.longitudeDegrees, houses[system]);
    }
    return result;
};
const point = (id, kind, position, pointMotion, houses, dignity = blankDignity()) => ({
    id,
    kind,
    position,
    houses: placements(position, houses),
    motion: pointMotion,
    dignity,
});
const orbitLongitude = (sample, offset, reason, status) => sample
    ? available(normaliseDegrees(sample.longitudeDegrees + offset), status, reason)
    : unavailable(reason);
const angleLongitude = (value, reason, status) => value === null ? unavailable(reason) : available(value, status, reason);
const lotLongitude = (value) => value;
const cloneHouses = (source) => {
    const output = {};
    for (const system of houseSystems) {
        const chart = source[system];
        const houses = {};
        for (let number = 1; number <= 12; number += 1) {
            const key = String(number);
            houses[key] = { ...chart.houses[key], occupants: [] };
        }
        output[system] = { ...chart, houses };
    }
    return output;
};
const populate = (houses, points) => {
    const output = cloneHouses(houses);
    for (const id of pointIds) {
        const value = points[id];
        for (const system of houseSystems) {
            const placement = value.houses[system].value;
            if (placement)
                output[system].houses[String(placement.house)].occupants.push(id);
        }
    }
    return output;
};
export const buildPoints = (input) => {
    const reason = input.unavailableReason ?? "insufficient_data";
    const timedStatus = input.timedStatus ?? "exact";
    const timedReason = input.timedReason ?? "none";
    const shift = input.zodiac === "sidereal" ? input.ayanamshaDegrees : 0;
    const points = {};
    for (const id of planets) {
        const body = input.astronomy.bodies[id];
        const kind = id === "sun" || id === "moon" ? "luminary" : "planet";
        const position = shiftPosition(body.eclipticLongitudeDegrees, shift);
        points[id] = point(id, kind, position, body.motion, input.houses, calculateDignity(id, position, input.sect));
    }
    const orbit = input.lunarOrbit;
    const orbitPoints = [
        ["north_node_true", orbit?.trueNode ?? null, 0],
        ["south_node_true", orbit?.trueNode ?? null, 180],
        ["north_node_mean", orbit?.meanNode ?? null, 0],
        ["south_node_mean", orbit?.meanNode ?? null, 180],
    ];
    for (const [id, sample, offset] of orbitPoints) {
        points[id] = point(id, "node", shiftPosition(orbitLongitude(sample, offset, sample ? timedReason : reason, timedStatus), shift), sample ? motion(sample) : "unknown", input.houses);
    }
    const angleValues = [
        ["ascendant", input.angles?.ascendant ?? null],
        ["descendant", input.angles?.descendant ?? null],
        ["midheaven", input.angles?.midheaven ?? null],
        ["imum_coeli", input.angles?.imumCoeli ?? null],
        ["vertex", input.auxiliary?.vertex ?? null],
        ["antivertex", input.auxiliary?.antivertex ?? null],
        ["east_point", input.auxiliary?.eastPoint ?? null],
    ];
    for (const [id, value] of angleValues) {
        points[id] = point(id, "angle", shiftPosition(angleLongitude(value, value === null ? reason : timedReason, timedStatus), shift), "not_applicable", input.houses);
    }
    points.part_of_fortune = point("part_of_fortune", "lot", shiftPosition(lotLongitude(input.lots.fortune), shift), "not_applicable", input.houses);
    points.part_of_spirit = point("part_of_spirit", "lot", shiftPosition(lotLongitude(input.lots.spirit), shift), "not_applicable", input.houses);
    const lilith = [
        ["lilith_mean", orbit?.meanApogee ?? null],
        ["lilith_true", orbit?.trueApogee ?? null],
    ];
    for (const [id, sample] of lilith) {
        points[id] = point(id, "lilith", shiftPosition(orbitLongitude(sample, 0, sample ? timedReason : reason, timedStatus), shift), sample ? motion(sample) : "unknown", input.houses);
    }
    return { points, houses: populate(input.houses, points) };
};
//# sourceMappingURL=points.js.map