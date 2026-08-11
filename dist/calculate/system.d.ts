import { calculateLots } from "../astro/lots.js";
import type { LunarOrbitSample } from "../astro/port.js";
import { calculateEclipses } from "../eclipse/calculate.js";
import type { AuxiliaryAngles, CoreAngles } from "../house/angles.js";
import { unavailableHouseCharts } from "../house/chart.js";
import type { Calc } from "../types/base.js";
import type { Ayanamsha, AstronomyData, Zodiac, ZodiacCalculation } from "../types/astro.js";
import type { TimedState } from "./types.js";
export declare const planets: readonly ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
export declare const zodiacCalculation: (zodiac: Zodiac, selectedAyanamsha: Ayanamsha, ayanamshaValue: number, ayanamshaCalc: Calc<number>, astronomy: AstronomyData, orbit: LunarOrbitSample, angles: CoreAngles | null, auxiliary: AuxiliaryAngles | null, houses: ReturnType<typeof unavailableHouseCharts>, sect: Calc<"day" | "night">, lots: ReturnType<typeof calculateLots>, timed: TimedState, eclipses: ReturnType<typeof calculateEclipses>) => ZodiacCalculation;
//# sourceMappingURL=system.d.ts.map