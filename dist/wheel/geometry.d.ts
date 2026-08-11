import type { PointId, Sign, WheelAspect, WheelData } from "./types.js";
export declare const wheelSize = 800;
export declare const wheelCentre: number;
export declare const wheelRadii: {
    readonly outer: 372;
    readonly zodiacInner: 316;
    readonly pointBase: 286;
    readonly houseOuter: 254;
    readonly aspect: 210;
};
export declare const signOrder: readonly ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
export declare const signGlyphs: Readonly<Record<Sign, string>>;
export declare const pointGlyphs: Readonly<Partial<Record<PointId, string>>>;
export declare const titleCase: (value: string) => string;
export declare const normalise: (degrees: number) => number;
export declare const forward: (start: number, end: number) => number;
export interface Anchor {
    x: number;
    y: number;
}
export declare const polar: (longitude: number, radius: number, ascendant: number) => Anchor;
export declare const sector: (start: number, end: number, inner: number, outer: number, ascendant: number) => string;
export interface PlacedPoint {
    id: PointId;
    longitude: number;
    lane: number;
}
export declare const pointLayout: (data: WheelData) => PlacedPoint[];
export declare const aspectSegment: (aspect: WheelAspect, start: Anchor, end: Anchor) => {
    start: Anchor;
    end: Anchor;
};
export declare const anchors: (data: WheelData, ascendant: number) => Map<PointId, Anchor>;
//# sourceMappingURL=geometry.d.ts.map