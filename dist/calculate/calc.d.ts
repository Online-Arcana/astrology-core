import type { BirthInput } from "../types/base.js";
import type { Calculation } from "../types/calc.js";
import { type CalcOptions, type CalcPorts } from "./types.js";
export { CalcError, calculationProfile } from "./types.js";
export type { CalcOptions, CalcPorts } from "./types.js";
export declare const calc: (input: BirthInput, options: CalcOptions, ports: CalcPorts) => Promise<Calculation>;
//# sourceMappingURL=calc.d.ts.map