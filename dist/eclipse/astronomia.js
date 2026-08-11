import { loadVendor } from "../vendor/load.js";
import { vendorRevisions } from "../vendor/revisions.js";
const solarHalfDurationDays = 3 / 24;
const finite = (value, name) => {
    if (value === undefined || !Number.isFinite(value))
        throw new Error(`Invalid eclipse ${name}`);
    return value;
};
const typeOf = (kind, raw, api) => {
    if (raw.type === api.TYPE.None)
        return null;
    if (kind === "solar") {
        if (raw.type === api.TYPE.Partial)
            return "partial";
        if (raw.type === api.TYPE.Annular)
            return "annular";
        if (raw.type === api.TYPE.AnnularTotal)
            return "hybrid";
        if (raw.type === api.TYPE.Total)
            return "total";
    }
    else {
        if (raw.type === api.TYPE.Penumbral)
            return "penumbral";
        if (raw.type === api.TYPE.Umbral)
            return "partial";
        if (raw.type === api.TYPE.Total)
            return "total";
    }
    throw new Error(`Unsupported ${kind} eclipse type ${raw.type}`);
};
class AstronomiaEclipses {
    provider = vendorRevisions.astronomia;
    #eclipse;
    #julian;
    constructor(eclipse, julian) {
        this.#eclipse = eclipse;
        this.#julian = julian;
    }
    sample(kind, decimalYear) {
        const raw = kind === "solar" ? this.#eclipse.solar(decimalYear) : this.#eclipse.lunar(decimalYear);
        const type = typeOf(kind, raw, this.#eclipse);
        if (type === null)
            return null;
        const activeHalfDurationDays = kind === "solar"
            ? solarHalfDurationDays
            : finite(raw.sdPenumbral, "penumbral semiduration");
        return {
            kind,
            type,
            julianEphemerisDay: finite(raw.jdeMax, "maximum JDE"),
            magnitude: raw.magnitude !== undefined && Number.isFinite(raw.magnitude) ? raw.magnitude : null,
            activeHalfDurationDays,
        };
    }
    decimalYear(julianEphemerisDay) {
        return new this.#julian.CalendarGregorian().fromJDE(julianEphemerisDay).toYear();
    }
    utcIso(julianEphemerisDay) {
        return new this.#julian.CalendarGregorian().fromJDE(julianEphemerisDay).toISOString();
    }
}
const moduleDefault = async (path) => (await loadVendor(path)).default;
export const loadEclipses = async () => {
    const [eclipse, julian] = await Promise.all([
        moduleDefault("astronomia/eclipse"),
        moduleDefault("astronomia/julian"),
    ]);
    return new AstronomiaEclipses(eclipse, julian);
};
//# sourceMappingURL=astronomia.js.map