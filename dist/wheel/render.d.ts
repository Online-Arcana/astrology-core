import type { WheelData } from "./types.js";
import { type WheelGlyphs } from "./visibility.js";
export interface WheelRenderOptions {
    glyphs?: WheelGlyphs;
}
export declare const renderWheel: (calculation: WheelData, options?: WheelRenderOptions) => HTMLElement;
//# sourceMappingURL=render.d.ts.map