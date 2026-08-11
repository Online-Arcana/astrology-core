import { normaliseDegrees } from "../zodiac/position.js";
const ids = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const radToDeg = 180 / Math.PI;
const calculated = (status, value, reason) => ({ status, value, reason });
const unavailable = (reason) => ({ status: "unavailable", value: null, reason });
const unavailableBody = (id, reason) => ({
    id,
    rightAscensionRadians: unavailable(reason),
    declinationRadians: unavailable(reason),
    eclipticLongitudeDegrees: unavailable(reason),
    eclipticLatitudeDegrees: unavailable(reason),
    distanceAu: unavailable(reason),
    longitudeSpeedDegreesPerDay: unavailable(reason),
    motion: "unknown",
});
const signedDelta = (after, before) => {
    let value = normaliseDegrees(after - before);
    if (value > 180)
        value -= 360;
    return value;
};
const finite = (sample) => {
    for (const value of Object.values(sample)) {
        if (!Number.isFinite(value))
            throw new Error("Astronomia returned a non-finite body value");
    }
    if (sample.distanceAu <= 0)
        throw new Error("Astronomia returned a non-positive distance");
};
const speedAt = (id, jde, port) => {
    const before = port.sample(id, jde - 0.5);
    const after = port.sample(id, jde + 0.5);
    finite(before);
    finite(after);
    return signedDelta(after.eclipticLongitudeRadians * radToDeg, before.eclipticLongitudeRadians * radToDeg);
};
const motionFromSpeed = (speed) => Math.abs(speed) <= 0.005 ? "stationary" : speed > 0 ? "direct" : "retrograde";
const body = (id, jde, port, status, reason, interval = null) => {
    const current = port.sample(id, jde);
    finite(current);
    const speed = speedAt(id, jde, port);
    let motion = motionFromSpeed(speed);
    if (interval) {
        const startMotion = motionFromSpeed(speedAt(id, interval[0], port));
        const endMotion = motionFromSpeed(speedAt(id, interval[1], port));
        if (startMotion !== endMotion)
            motion = "unknown";
        else
            motion = startMotion;
    }
    return {
        id,
        rightAscensionRadians: calculated(status, current.rightAscensionRadians, reason),
        declinationRadians: calculated(status, current.declinationRadians, reason),
        eclipticLongitudeDegrees: calculated(status, normaliseDegrees(current.eclipticLongitudeRadians * radToDeg), reason),
        eclipticLatitudeDegrees: calculated(status, current.eclipticLatitudeRadians * radToDeg, reason),
        distanceAu: calculated(status, current.distanceAu, reason),
        longitudeSpeedDegreesPerDay: calculated(status, speed, reason),
        motion,
    };
};
const boundedInterval = (time, port) => {
    const value = time.resolution.value;
    if (!value)
        return null;
    const start = port.time(value.utcStartIso).julianEphemerisDay;
    const end = port.time(value.utcEndIso).julianEphemerisDay;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start)
        throw new Error("Invalid bounded Julian interval");
    return [start, end];
};
export const calculateAstronomy = (time, port) => {
    const bodies = {};
    if (time.julianEphemerisDay !== null) {
        const status = time.resolution.status === "approximate" ? "approximate" : "exact";
        const reason = status === "approximate" ? "birth_time_approximate" : "none";
        for (const id of ids)
            bodies[id] = body(id, time.julianEphemerisDay, port, status, reason);
    }
    else {
        const interval = boundedInterval(time, port);
        if (interval) {
            const midpoint = (interval[0] + interval[1]) / 2;
            const reason = time.resolution.reason === "none" ? "insufficient_data" : time.resolution.reason;
            for (const id of ids)
                bodies[id] = body(id, midpoint, port, "bounded", reason, interval);
        }
        else {
            const reason = time.resolution.reason === "none" ? "insufficient_data" : time.resolution.reason;
            for (const id of ids)
                bodies[id] = unavailableBody(id, reason);
        }
    }
    return {
        frame: { centre: "geocentric", coordinates: "apparent", epoch: "date" },
        bodies,
    };
};
//# sourceMappingURL=calculate.js.map