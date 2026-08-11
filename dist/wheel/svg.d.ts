import type { WheelData } from "./types.js";
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
}
export declare const renderSvg: (data: WheelData, options?: SvgOptions) => Promise<string>;
//# sourceMappingURL=svg.d.ts.map