import type { Ayanamsha, AstronomyData, CompatibilityMatrix, Zodiac, ZodiacCalculation } from "./astro.js";
import type { BirthData, JsonRef, PlaceData, TimeData } from "./base.js";
export interface CalcSettings {
    primaryZodiac: Zodiac;
    siderealAyanamsha: Ayanamsha | null;
    primaryHouseSystem: "placidus";
    polarFallback: "porphyry";
    houseSystems: ["placidus", "whole_sign", "equal", "porphyry"];
}
export interface CalcProvenance {
    generatedAt: string;
    coreVersion: string;
    astronomia: {
        repository: string;
        revision: string;
        version: string;
    };
    places: {
        repository: string;
        revision: string;
        version: string;
    };
    time: {
        repository: string;
        revision: string;
        version: string;
        timeZoneDatabaseVersion: string;
        calendar: "proleptic_gregorian";
        supportedRange: string;
    };
    astrologyProfile: string;
    aspectProfile: string;
    dignityProfile: string;
    compatibilityProfile: string;
    calculationFingerprint: string;
}
export interface CalcWarning {
    code: string;
    message: string;
    sourceRefs: JsonRef[];
}
export interface Calculation {
    schema: "astral-core/1.0.0";
    birth: BirthData;
    place: PlaceData;
    time: TimeData;
    settings: CalcSettings;
    astronomy: AstronomyData;
    system: ZodiacCalculation;
    compatibility: CompatibilityMatrix & {
        method: "natal_to_sign_archetype";
        profile: "western_compatibility/1.0.0";
    };
    provenance: CalcProvenance;
    warnings: CalcWarning[];
}
//# sourceMappingURL=calc.d.ts.map