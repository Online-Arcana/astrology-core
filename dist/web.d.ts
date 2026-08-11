import type { CalcPorts } from "./calculate/types.js";
export * from "./types/index.js";
export * from "./calculate/calc.js";
export { compatibilityDomains } from "./compat/catalogue.js";
export * from "./place/model.js";
export * from "./place/web.js";
export { signs } from "./zodiac/position.js";
export declare const webPorts: (places: URL, version?: string) => Promise<CalcPorts>;
//# sourceMappingURL=web.d.ts.map