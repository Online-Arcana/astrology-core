const daylightSaving = (rules, instant) => {
    if (!rules.isDaylightSavings)
        return null;
    try {
        return rules.isDaylightSavings(instant);
    }
    catch {
        return null;
    }
};
const candidate = (local, offset, rules, fold) => {
    const instant = local.toInstant(offset);
    return {
        fold,
        utcIso: instant.toString(),
        offsetSeconds: offset.totalSeconds(),
        daylightSaving: daylightSaving(rules, instant),
    };
};
export class JsJodaResolver {
    info;
    #port;
    constructor(port, info) {
        this.#port = port;
        this.info = { provider: "js-joda", ...info };
    }
    resolve(input) {
        const localIso = `${input.date}T${input.time}`;
        try {
            const local = this.#port.localDateTime(localIso);
            const rules = this.#port.rules(input.zone);
            const offsets = rules.validOffsets(local);
            if (offsets.length === 1)
                return { kind: "exact", localIso, candidate: candidate(local, offsets[0], rules, null) };
            if (offsets.length === 2) {
                const candidates = [
                    candidate(local, offsets[0], rules, 0),
                    candidate(local, offsets[1], rules, 1),
                ];
                if (input.fold !== undefined)
                    return { kind: "exact", localIso, candidate: candidates[input.fold] };
                return { kind: "ambiguous", localIso, candidates };
            }
            const transition = rules.transition(local);
            if (!transition)
                return { kind: "unsupported", localIso, reason: "No offset or transition supplied by provider" };
            return {
                kind: "nonexistent",
                localIso,
                beforeUtcIso: transition.dateTimeBefore().toInstant(transition.offsetBefore()).toString(),
                afterUtcIso: transition.dateTimeAfter().toInstant(transition.offsetAfter()).toString(),
            };
        }
        catch (error) {
            return { kind: "unsupported", localIso, reason: error instanceof Error ? error.message : "Unknown time resolver failure" };
        }
    }
}
//# sourceMappingURL=jsJoda.js.map