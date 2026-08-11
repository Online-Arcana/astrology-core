import { modernRulers, traditionalRulers } from "../rules/rulership.js";
import { normaliseDegrees, signPosition, signs } from "../zodiac/position.js";
import { forwardArc } from "./angles.js";
import { equalCusps, placidusCusps, porphyryCusps, shiftCusps, wholeSignCusps, } from "./cusps.js";
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const calculated = (value, status, reason) => ({ status, value, reason });
const unavailable = (reason) => ({ status: reason === "outside_supported_range" ? "unsupported" : "unavailable", value: null, reason });
const key = (number) => String(number);
const intercepted = (cusp, end) => {
    const span = forwardArc(cusp, end);
    const result = [];
    signs.forEach((sign, index) => {
        const start = index * 30;
        const fromCusp = forwardArc(cusp, start);
        if (fromCusp > 1e-9 && fromCusp + 30 < span - 1e-9)
            result.push(sign);
    });
    return result;
};
const house = (number, cusp, end, status, reason) => {
    const position = signPosition(cusp);
    return {
        number,
        cusp: calculated(position, status, reason),
        end: calculated(signPosition(end), status, reason),
        rulerTraditional: calculated(traditionalRulers[position.sign], status, reason),
        rulerModern: calculated(modernRulers[position.sign], status, reason),
        occupants: [],
        interceptedSigns: intercepted(cusp, end),
    };
};
const chart = (system, cusps, status = "calculated", fallbackFrom = null, reason = "none", calculationStatus = "exact", calculationReason = "none") => {
    const houses = {};
    numbers.forEach((number, index) => {
        const next = numbers[(index + 1) % 12];
        houses[key(number)] = house(number, cusps[key(number)], cusps[key(next)], calculationStatus, calculationReason);
    });
    return { system, status, fallbackFrom, reason, houses };
};
const unavailableChart = (system, reason) => {
    const houses = {};
    numbers.forEach((number) => {
        houses[key(number)] = {
            number,
            cusp: unavailable(reason),
            end: unavailable(reason),
            rulerTraditional: unavailable(reason),
            rulerModern: unavailable(reason),
            occupants: [],
            interceptedSigns: [],
        };
    });
    return { system, status: "unavailable", fallbackFrom: null, reason, houses };
};
export const unavailableHouseCharts = (reason) => ({
    placidus: unavailableChart("placidus", reason),
    whole_sign: unavailableChart("whole_sign", reason),
    equal: unavailableChart("equal", reason),
    porphyry: unavailableChart("porphyry", reason),
});
export const calculateHouseCharts = (input) => {
    const shift = input.zodiac === "sidereal" ? input.ayanamshaDegrees ?? 0 : 0;
    if (!Number.isFinite(shift) || shift < 0 || shift >= 360)
        throw new Error("Ayanamsha must be between 0 and 360 degrees");
    const calculationStatus = input.calculationStatus ?? "exact";
    const calculationReason = input.calculationReason ?? "none";
    const porphyryTropical = porphyryCusps(input.angles);
    const equalTropical = equalCusps(input.angles.ascendant);
    const placidusTropical = placidusCusps(input.angles, input.latitudeDegrees, input.obliquityRadians);
    const porphyry = shiftCusps(porphyryTropical, shift);
    const equal = shiftCusps(equalTropical, shift);
    const siderealAscendant = normaliseDegrees(input.angles.ascendant - shift);
    const wholeSign = wholeSignCusps(siderealAscendant);
    const placidus = placidusTropical === null ? null : shiftCusps(placidusTropical, shift);
    return {
        placidus: placidus
            ? chart("placidus", placidus, "calculated", null, "none", calculationStatus, calculationReason)
            : chart("porphyry", porphyry, "fallback", "placidus", "polar_house_failure", calculationStatus, calculationReason),
        whole_sign: chart("whole_sign", wholeSign, "calculated", null, "none", calculationStatus, calculationReason),
        equal: chart("equal", equal, "calculated", null, "none", calculationStatus, calculationReason),
        porphyry: chart("porphyry", porphyry, "calculated", null, "none", calculationStatus, calculationReason),
    };
};
export const housePlacement = (longitudeDegrees, chartValue) => {
    if (chartValue.status === "unavailable")
        return unavailable(chartValue.reason);
    const longitude = normaliseDegrees(longitudeDegrees);
    for (const number of numbers) {
        const current = chartValue.houses[key(number)];
        if (!current.cusp.value || !current.end.value)
            continue;
        const cusp = current.cusp.value.longitudeDegrees;
        const span = forwardArc(cusp, current.end.value.longitudeDegrees);
        const distance = forwardArc(cusp, longitude);
        if (distance < span || Math.abs(distance - span) < 1e-10 && number === 12) {
            return calculated({
                house: number,
                distanceFromCuspDegrees: distance,
                intercepted: current.interceptedSigns.includes(signPosition(longitude).sign),
            }, current.cusp.status, current.cusp.reason);
        }
    }
    return unavailable("insufficient_data");
};
//# sourceMappingURL=chart.js.map