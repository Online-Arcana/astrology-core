import type { AstronomyPort, LunarOrbitPort } from "../astro/port.js";
import type { EclipsePort } from "../eclipse/port.js";
import type { PlaceCatalogue } from "../place/model.js";
import type { TimeResolver } from "../time/model.js";
import type { CalcReason, CalcStatus } from "../types/base.js";
import type { Ayanamsha, Zodiac } from "../types/astro.js";

export const calculationProfile = "western_natal/1.1.0" as const;
export type TimedStatus = Extract<CalcStatus, "exact" | "approximate" | "bounded">;

export interface CalcOptions {
  zodiac: Zodiac;
  ayanamsha: Ayanamsha;
}

export interface CalcPorts {
  places: Pick<PlaceCatalogue, "get">;
  timeResolver: TimeResolver;
  astronomy: AstronomyPort;
  lunarOrbit: LunarOrbitPort;
  eclipses: EclipsePort;
  version: string;
  now(): string;
}

export interface TimedState {
  julianEphemerisDay: number;
  status: TimedStatus;
  reason: CalcReason;
}

export class CalcError extends Error {
  readonly reason: CalcReason;

  constructor(reason: CalcReason) {
    super(`Chart calculation is unavailable: ${reason}`);
    this.name = "CalcError";
    this.reason = reason;
  }
}
