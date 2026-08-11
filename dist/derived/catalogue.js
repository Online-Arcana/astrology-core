export const derivedProfile = "western_derived/1.0.0";
export const dominanceProfile = "planetary_dominance/1.0.0";
export const jonesProfile = "jones_patterns/1.0.0";
export const unaspectedProfile = "unaspected_planets/1.0.0";
export const primaryHouseSystem = "placidus";
export const signModalities = {
    aries: "cardinal",
    taurus: "fixed",
    gemini: "mutable",
    cancer: "cardinal",
    leo: "fixed",
    virgo: "mutable",
    libra: "cardinal",
    scorpio: "fixed",
    sagittarius: "mutable",
    capricorn: "cardinal",
    aquarius: "fixed",
    pisces: "mutable",
};
export const signPolarities = {
    aries: "active",
    taurus: "receptive",
    gemini: "active",
    cancer: "receptive",
    leo: "active",
    virgo: "receptive",
    libra: "active",
    scorpio: "receptive",
    sagittarius: "active",
    capricorn: "receptive",
    aquarius: "active",
    pisces: "receptive",
};
export const planetIds = [
    "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
];
export const balanceWeight = (id) => {
    if (id === "sun" || id === "moon" || id === "ascendant")
        return 2;
    if (id === "midheaven")
        return 1;
    return planetIds.includes(id) ? 1 : 0;
};
export const angularHouses = new Set([1, 4, 7, 10]);
export const succedentHouses = new Set([2, 5, 8, 11]);
export const cadentHouses = new Set([3, 6, 9, 12]);
export const dominanceWeights = {
    traditionalChartRuler: 4,
    modernChartRuler: 2,
    angularHouse: 3,
    succedentHouse: 1,
    majorAspect: 2,
    minorAspect: 0.75,
    sectLight: 2,
};
//# sourceMappingURL=catalogue.js.map