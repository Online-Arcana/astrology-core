const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const pointIds = [
    "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
    "north_node_true", "south_node_true", "north_node_mean", "south_node_mean",
    "ascendant", "descendant", "midheaven", "imum_coeli", "vertex", "antivertex", "east_point",
    "part_of_fortune", "part_of_spirit", "lilith_mean", "lilith_true",
];
export const emptyWheelHouses = () => Object.fromEntries(houseNumbers.map((number) => [String(number), {
        number,
        cusp: { value: null },
        end: { value: null },
    }]));
export const emptyWheelHouseChart = () => ({
    status: "unavailable",
    houses: emptyWheelHouses(),
});
export const emptyWheelPoints = () => Object.fromEntries(pointIds.map((id) => [id, { position: { value: null } }]));
export const emptyWheelData = (fingerprint = "wheel-shell", primaryHouseSystem = "placidus") => ({
    fingerprint,
    primaryHouseSystem,
    points: emptyWheelPoints(),
    houses: {
        placidus: emptyWheelHouseChart(),
        whole_sign: emptyWheelHouseChart(),
        equal: emptyWheelHouseChart(),
        porphyry: emptyWheelHouseChart(),
    },
    aspects: [],
});
export const wheelData = (calculation) => ({
    fingerprint: calculation.provenance.calculationFingerprint,
    primaryHouseSystem: calculation.settings.primaryHouseSystem,
    points: calculation.system.points,
    houses: calculation.system.houses,
    aspects: calculation.system.aspects,
});
//# sourceMappingURL=data.js.map