import { normaliseDegrees } from "../zodiac/position.js";
export const lunationProfile = "eight_phase/1.0.0";
export const synodicMonthDays = 29.530588853;
const phases = [
    "new", "crescent", "first_quarter", "gibbous",
    "full", "disseminating", "last_quarter", "balsamic",
];
const exact = (value) => ({ status: "exact", value, reason: "none" });
export const lunarPhase = (sunLongitude, moonLongitude) => {
    const angle = normaliseDegrees(moonLongitude - sunLongitude);
    const sector = Math.floor(normaliseDegrees(angle + 22.5) / 45) % 8;
    const illumination = (1 - Math.cos((angle * Math.PI) / 180)) / 2;
    return {
        angleDegrees: exact(angle),
        phase: exact(phases[sector]),
        illumination: exact(illumination),
        ageDays: exact((angle / 360) * synodicMonthDays),
        waxing: exact(angle > 0 && angle < 180),
    };
};
//# sourceMappingURL=lunar.js.map