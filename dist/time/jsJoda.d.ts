import type { CivilInput, CivilResolution, TimeResolver, TimeZoneInfo } from "./model.js";
export interface JodaOffset {
    totalSeconds(): number;
}
export interface JodaInstant {
    toString(): string;
}
export interface JodaLocalDateTime {
    toString(): string;
    toInstant(offset: JodaOffset): JodaInstant;
}
export interface JodaTransition {
    dateTimeBefore(): JodaLocalDateTime;
    dateTimeAfter(): JodaLocalDateTime;
    offsetBefore(): JodaOffset;
    offsetAfter(): JodaOffset;
}
export interface JodaRules {
    validOffsets(local: JodaLocalDateTime): JodaOffset[];
    transition(local: JodaLocalDateTime): JodaTransition | null;
    isDaylightSavings?(instant: JodaInstant): boolean;
}
export interface JodaPort {
    localDateTime(iso: string): JodaLocalDateTime;
    rules(zone: string): JodaRules;
}
export declare class JsJodaResolver implements TimeResolver {
    #private;
    readonly info: TimeZoneInfo;
    constructor(port: JodaPort, info: Omit<TimeZoneInfo, "provider">);
    resolve(input: CivilInput): CivilResolution;
}
//# sourceMappingURL=jsJoda.d.ts.map