const unavailable = (reason) => ({
    localIso: null,
    utcIso: null,
    utcOffsetSeconds: null,
    daylightSaving: null,
    julianDay: null,
    julianEphemerisDay: null,
    deltaTSeconds: null,
    resolution: { status: reason === "outside_supported_range" ? "unsupported" : "unavailable", value: null, reason },
});
const inputTime = (input) => {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(input.date))
        throw new Error("Birth date must use YYYY-MM-DD");
    if (input.timeAccuracy === "unknown") {
        if (input.time !== null)
            throw new Error("Unknown birth time must be null");
        return null;
    }
    if (input.time === null)
        throw new Error("Known birth time must use HH:mm or HH:mm:ss");
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/u.exec(input.time);
    if (match === null)
        throw new Error("Known birth time must use HH:mm or HH:mm:ss");
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] ?? "00");
    if (hour > 23 || minute > 59 || second > 59)
        throw new Error("Birth time is invalid");
    return `${match[1]}:${match[2]}:${String(second).padStart(2, "0")}`;
};
const window = (localIso, utcIso, fold) => ({
    fold,
    localStartIso: localIso,
    localEndIso: localIso,
    utcStartIso: utcIso,
    utcEndIso: utcIso,
});
const leap = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
const monthDays = (year, month) => [31, leap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
const nextDate = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
    if (!match)
        throw new Error("Birth date must use YYYY-MM-DD");
    let year = Number(match[1]);
    let month = Number(match[2]);
    let day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > monthDays(year, month))
        throw new Error("Birth date is invalid");
    day += 1;
    if (day > monthDays(year, month)) {
        day = 1;
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};
const boundary = (resolution, edge) => {
    if (resolution.kind === "exact")
        return resolution.candidate;
    if (resolution.kind !== "ambiguous")
        return null;
    const ordered = [...resolution.candidates].sort((a, b) => a.utcIso.localeCompare(b.utcIso));
    return edge === "start" ? ordered[0] ?? null : ordered.at(-1) ?? null;
};
const boundaryFailure = (resolution) => {
    if (resolution.kind === "unsupported")
        return "outside_supported_range";
    if (resolution.kind === "nonexistent")
        return "nonexistent_local_time";
    return null;
};
const unknownWindow = (input, zone, resolver) => {
    const endDate = nextDate(input.date);
    const startLocal = `${input.date}T00:00:00`;
    const endLocal = `${endDate}T00:00:00`;
    const startResolution = resolver.resolve({ date: input.date, time: "00:00:00", zone });
    const endResolution = resolver.resolve({ date: endDate, time: "00:00:00", zone });
    const failure = boundaryFailure(startResolution) ?? boundaryFailure(endResolution);
    if (failure)
        return unavailable(failure);
    const start = boundary(startResolution, "start");
    const end = boundary(endResolution, "end");
    if (!start || !end || start.utcIso >= end.utcIso)
        return unavailable("insufficient_data");
    return {
        localIso: null,
        utcIso: null,
        utcOffsetSeconds: null,
        daylightSaving: null,
        julianDay: null,
        julianEphemerisDay: null,
        deltaTSeconds: null,
        resolution: {
            status: "bounded",
            reason: "birth_time_unknown",
            value: {
                fold: null,
                localStartIso: startLocal,
                localEndIso: endLocal,
                utcStartIso: start.utcIso,
                utcEndIso: end.utcIso,
            },
        },
    };
};
export const resolveBirthTime = (input, zone, resolver, astronomy) => {
    const time = inputTime(input);
    if (time === null)
        return unknownWindow(input, zone, resolver);
    const resolved = resolver.resolve({ date: input.date, time, zone });
    if (resolved.kind === "unsupported")
        return unavailable("outside_supported_range");
    if (resolved.kind === "nonexistent")
        return unavailable("nonexistent_local_time");
    if (resolved.kind === "ambiguous") {
        const ordered = [...resolved.candidates].sort((a, b) => a.utcIso.localeCompare(b.utcIso));
        const first = ordered[0];
        const last = ordered[1];
        if (!first || !last)
            return unavailable("ambiguous_local_time");
        return {
            localIso: resolved.localIso,
            utcIso: null,
            utcOffsetSeconds: null,
            daylightSaving: null,
            julianDay: null,
            julianEphemerisDay: null,
            deltaTSeconds: null,
            resolution: {
                status: "bounded",
                reason: "ambiguous_local_time",
                value: {
                    fold: null,
                    localStartIso: resolved.localIso,
                    localEndIso: resolved.localIso,
                    utcStartIso: first.utcIso,
                    utcEndIso: last.utcIso,
                },
            },
        };
    }
    const values = astronomy.time(resolved.candidate.utcIso);
    const approximate = input.timeAccuracy === "approximate";
    return {
        localIso: resolved.localIso,
        utcIso: resolved.candidate.utcIso,
        utcOffsetSeconds: resolved.candidate.offsetSeconds,
        daylightSaving: resolved.candidate.daylightSaving,
        julianDay: values.julianDay,
        julianEphemerisDay: values.julianEphemerisDay,
        deltaTSeconds: values.deltaTSeconds,
        resolution: {
            status: approximate ? "approximate" : "exact",
            reason: approximate ? "birth_time_approximate" : "none",
            value: window(resolved.localIso, resolved.candidate.utcIso, resolved.candidate.fold),
        },
    };
};
//# sourceMappingURL=calculate.js.map