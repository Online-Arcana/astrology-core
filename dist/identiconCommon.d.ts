import { type LiteralSignIdentity } from "./literalSignGrid.js";
import type { Sign } from "./types.js";
import type { AstralIdenticonAssetSource } from "./identiconTypes.js";
export interface ParsedSvg {
    viewBox: string;
    body: string;
}
export interface Point {
    readonly x: number;
    readonly y: number;
}
interface RingPlacement {
    key: string;
    sign: Sign;
    x: number;
    y: number;
    size: number;
    role: string;
    angle: number;
}
export declare const identiconCanvas = 1024;
export declare const identiconCentre: number;
export declare const identiconOuterRingRadius = 486;
export declare const identiconInnerRingRadius = 396;
export declare const identiconRingStroke = 8;
export declare const signLabel: (value: Sign) => string;
export declare function parseSvg(source: string): ParsedSvg;
export declare function scopeIds(source: string, prefix: string): string;
export declare function monochrome(source: string, value: string): string;
export declare function outlined(source: string, fill: string, stroke: string): string;
export declare function escapeXml(value: string): string;
export declare function nestedSvg(body: string, viewBox: string, x: number, y: number, width: number, height: number, attributes?: string): string;
export declare function placedSvg(body: string, viewBox: string, x: number, y: number, size: number, attributes?: string, rotation?: number): string;
export declare function ringPlacements(value: LiteralSignIdentity): readonly RingPlacement[];
export declare function signAssets(value: LiteralSignIdentity, assets: AstralIdenticonAssetSource): Promise<Map<Sign, ParsedSvg>>;
export declare function innerSigns(value: LiteralSignIdentity, signs: ReadonlyMap<Sign, ParsedSvg>, foreground: string, background: string): string;
export declare function ringSigns(value: LiteralSignIdentity, signs: ReadonlyMap<Sign, ParsedSvg>, foreground: string): string;
export {};
//# sourceMappingURL=identiconCommon.d.ts.map