import { normaliseDegrees } from "../zodiac/position.js";
const unavailable = (reason) => ({ status: "unavailable", value: null, reason });
const available = (value, status, reason) => ({
    status,
    value: normaliseDegrees(value),
    reason,
});
const combinedStatus = (...values) => {
    const status = values.some((value) => value.status === "bounded")
        ? "bounded"
        : values.some((value) => value.status === "approximate")
            ? "approximate"
            : "exact";
    const reason = values.find((value) => value.reason !== "none")?.reason ?? "none";
    return { status, reason };
};
export const calculateLots = (astronomy, angles, sect) => {
    const sun = astronomy.bodies.sun.eclipticLongitudeDegrees;
    const moon = astronomy.bodies.moon.eclipticLongitudeDegrees;
    if (!angles || sect.value === null || sun.value === null || moon.value === null) {
        const reason = sect.reason !== "none"
            ? sect.reason
            : sun.reason !== "none"
                ? sun.reason
                : moon.reason !== "none"
                    ? moon.reason
                    : "insufficient_data";
        return { fortune: unavailable(reason), spirit: unavailable(reason) };
    }
    const fortune = sect.value === "day"
        ? angles.ascendant + moon.value - sun.value
        : angles.ascendant + sun.value - moon.value;
    const spirit = sect.value === "day"
        ? angles.ascendant + sun.value - moon.value
        : angles.ascendant + moon.value - sun.value;
    const state = combinedStatus(sun, moon, sect);
    return {
        fortune: available(fortune, state.status, state.reason),
        spirit: available(spirit, state.status, state.reason),
    };
};
//# sourceMappingURL=lots.js.map