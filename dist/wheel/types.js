export const wheelData = (calculation) => ({
    fingerprint: calculation.provenance.calculationFingerprint,
    primaryHouseSystem: calculation.settings.primaryHouseSystem,
    points: calculation.system.points,
    houses: calculation.system.houses,
    aspects: calculation.system.aspects,
});
//# sourceMappingURL=types.js.map