import { normaliseDegrees } from "../zodiac/position.js";
import { eclipticEquatorial, forwardArc, signedArc } from "./angles.js";
const opposite = (value) => normaliseDegrees(value + 180);
const complete = (one, two, three, four, eleven, twelve) => ({
    "1": normaliseDegrees(one),
    "2": normaliseDegrees(two),
    "3": normaliseDegrees(three),
    "4": normaliseDegrees(four),
    "5": opposite(eleven),
    "6": opposite(twelve),
    "7": opposite(one),
    "8": opposite(two),
    "9": opposite(three),
    "10": opposite(four),
    "11": normaliseDegrees(eleven),
    "12": normaliseDegrees(twelve),
});
export const equalCusps = (ascendant) => {
    const values = {};
    for (let number = 1; number <= 12; number += 1) {
        values[String(number)] = normaliseDegrees(ascendant + (number - 1) * 30);
    }
    return values;
};
export const wholeSignCusps = (ascendant) => equalCusps(Math.floor(normaliseDegrees(ascendant) / 30) * 30);
export const porphyryCusps = (angles) => {
    const upper = forwardArc(angles.midheaven, angles.ascendant);
    if (upper <= 0 || upper >= 180)
        throw new Error("Angles do not define ordinary Porphyry quadrants");
    const lower = 180 - upper;
    return complete(angles.ascendant, angles.ascendant + lower / 3, angles.ascendant + lower * 2 / 3, angles.imumCoeli, angles.midheaven + upper / 3, angles.midheaven + upper * 2 / 3);
};
const residual = (longitude, input) => {
    const equatorial = eclipticEquatorial(longitude, input.obliquityRadians);
    const latitude = input.latitudeDegrees * Math.PI / 180;
    const declination = equatorial.declinationDegrees * Math.PI / 180;
    const cosine = -Math.tan(latitude) * Math.tan(declination);
    if (!Number.isFinite(cosine) || cosine < -1 || cosine > 1)
        return null;
    const semiDiurnal = Math.acos(cosine) * 180 / Math.PI;
    const fraction = input.part / 3;
    const target = input.arc === "diurnal"
        ? input.localSiderealDegrees + semiDiurnal * fraction
        : input.localSiderealDegrees + 180 - (180 - semiDiurnal) * fraction;
    return signedArc(equatorial.rightAscensionDegrees - target);
};
const solve = (input) => {
    const span = forwardArc(input.start, input.end);
    if (span <= 0 || span >= 180)
        return null;
    const steps = 720;
    let previousLongitude = input.start;
    let previous = residual(previousLongitude, input);
    let closestLongitude = input.start;
    let closest = previous === null ? Number.POSITIVE_INFINITY : Math.abs(previous);
    for (let step = 1; step <= steps; step += 1) {
        const longitude = input.start + span * step / steps;
        const value = residual(longitude, input);
        if (value === null)
            continue;
        if (Math.abs(value) < closest) {
            closest = Math.abs(value);
            closestLongitude = longitude;
        }
        if (previous !== null && previous * value <= 0 && Math.abs(previous - value) < 180) {
            let low = previousLongitude;
            let high = longitude;
            let lowValue = previous;
            for (let iteration = 0; iteration < 64; iteration += 1) {
                const middle = (low + high) / 2;
                const middleValue = residual(middle, input);
                if (middleValue === null)
                    return null;
                if (Math.abs(middleValue) < 1e-11)
                    return normaliseDegrees(middle);
                if (lowValue * middleValue <= 0) {
                    high = middle;
                }
                else {
                    low = middle;
                    lowValue = middleValue;
                }
            }
            return normaliseDegrees((low + high) / 2);
        }
        previousLongitude = longitude;
        previous = value;
    }
    return closest < 1e-7 ? normaliseDegrees(closestLongitude) : null;
};
export const placidusCusps = (angles, latitudeDegrees, obliquityRadians) => {
    const obliquityDegrees = Math.abs(obliquityRadians * 180 / Math.PI);
    if (Math.abs(latitudeDegrees) >= 90 - obliquityDegrees)
        return null;
    const common = {
        localSiderealDegrees: angles.localSiderealDegrees,
        latitudeDegrees,
        obliquityRadians,
    };
    const eleven = solve({ ...common, start: angles.midheaven, end: angles.ascendant, part: 1, arc: "diurnal" });
    const twelve = solve({ ...common, start: angles.midheaven, end: angles.ascendant, part: 2, arc: "diurnal" });
    const three = solve({ ...common, start: angles.ascendant, end: angles.imumCoeli, part: 1, arc: "nocturnal" });
    const two = solve({ ...common, start: angles.ascendant, end: angles.imumCoeli, part: 2, arc: "nocturnal" });
    if (two === null || three === null || eleven === null || twelve === null)
        return null;
    return complete(angles.ascendant, two, three, angles.imumCoeli, eleven, twelve);
};
export const shiftCusps = (cusps, degrees) => {
    const shifted = {};
    for (let number = 1; number <= 12; number += 1) {
        const key = String(number);
        shifted[key] = normaliseDegrees(cusps[key] - degrees);
    }
    return shifted;
};
//# sourceMappingURL=cusps.js.map