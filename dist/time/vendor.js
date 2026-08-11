import { LocalDateTime, ZoneId } from "@js-joda/core";
import "@js-joda/timezone";
import { JsJodaResolver } from "./jsJoda.js";
import { vendorRevisions } from "../vendor/revisions.js";
class RangeResolver {
    info;
    #inner;
    constructor(inner) {
        this.#inner = inner;
        this.info = inner.info;
    }
    resolve(input) {
        const year = Number(input.date.slice(0, 4));
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
            return {
                kind: "unsupported",
                localIso: `${input.date}T${input.time}`,
                reason: `Date is outside supported range ${this.info.supportedRange}`,
            };
        }
        return this.#inner.resolve(input);
    }
}
export const loadTimeResolver = async () => {
    const port = {
        localDateTime: (iso) => LocalDateTime.parse(iso),
        rules: (zone) => ZoneId.of(zone).rules(),
    };
    return new RangeResolver(new JsJodaResolver(port, {
        providerVersion: vendorRevisions.time.timezoneVersion,
        dataVersion: vendorRevisions.time.timeZoneDatabaseVersion,
        supportedRange: vendorRevisions.time.supportedRange,
        calendar: "proleptic_gregorian",
    }));
};
//# sourceMappingURL=vendor.js.map