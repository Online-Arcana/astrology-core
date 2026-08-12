import type { WheelData } from "./types.js";
import { type WheelGlyphs } from "./visibility.js";
export interface SvgAssets {
    glyph(path: string): Promise<string>;
}
export interface SvgTheme {
    background: string;
    ink: string;
    muted: string;
    line: string;
    accent: string;
}
export interface SvgOptions {
    assets?: SvgAssets;
    theme?: Partial<SvgTheme>;
    aspects?: boolean;
    inner?: string;
    attrs?: Readonly<Record<string, string>>;
    /** Controls zodiac and chart-point glyphs before point layout is calculated. */
    glyphs?: WheelGlyphs;
    /** Orientation used when a caller deliberately renders an untimed/shell wheel. */
    orientationDegrees?: number;
    /** Set false when an untimed shell should stay visually empty in the centre. */
    untimedLabel?: boolean;
}
export declare const renderSvg: (data: WheelData, options?: SvgOptions) => Promise<string>;
//# sourceMappingURL=svg.d.ts.map