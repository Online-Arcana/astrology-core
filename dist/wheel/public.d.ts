import type { AspectKind, HouseSystem, PointId } from "../types/astro.js";
import type { HouseNumber, WheelData } from "./types.js";
export interface PublicWheelHouse {
    number: HouseNumber;
    cuspLongitudeDegrees: number | null;
    endLongitudeDegrees: number | null;
}
export interface PublicWheelAspect {
    id: string;
    a: PointId;
    b: PointId;
    kind: AspectKind;
    class: "major" | "minor";
    character: "flowing" | "challenging" | "contextual" | "adjusting" | "creative";
}
export interface PublicWheelMeta {
    schema: "astral-public-wheel/1.0.0";
    calculationFingerprint: string;
    primaryHouseSystem: HouseSystem;
    points: Record<PointId, number | null>;
    houses: {
        status: "calculated" | "fallback" | "unavailable";
        houses: Record<string, PublicWheelHouse>;
    };
    aspects: PublicWheelAspect[];
}
export declare const fromPublic: (meta: PublicWheelMeta) => WheelData;
export declare const renderPublicWheel: (meta: PublicWheelMeta) => HTMLElement;
//# sourceMappingURL=public.d.ts.map