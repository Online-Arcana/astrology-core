import type { Sign } from "./types.js";
export interface LiteralSignIdentity {
    solar: Sign;
    lunar: Sign;
    ascendant: Sign;
    midheaven: Sign;
    descendant: Sign;
    imumCoeli: Sign;
}
export interface LiteralSignGridPlacement {
    key: string;
    sign: Sign;
    x: number;
    y: number;
    size: number;
    role: string;
}
export interface LiteralSignGridGeometry {
    centre: number;
    offset: number;
}
export declare const defaultLiteralSignGridGeometry: LiteralSignGridGeometry;
export declare function literalSignGridPlacements(value: LiteralSignIdentity, geometry?: LiteralSignGridGeometry): readonly LiteralSignGridPlacement[];
//# sourceMappingURL=literalSignGrid.d.ts.map