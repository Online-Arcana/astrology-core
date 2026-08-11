import { renderWheel } from "./render.js";
import { emptyWheelHouseChart, emptyWheelHouses, emptyWheelPoints } from "./data.js";
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const selectedHouses = (meta) => Object.fromEntries(numbers.map((number) => {
    const source = meta.houses.houses[String(number)];
    return [String(number), source === undefined ? { number, cusp: { value: null }, end: { value: null } } : {
            number,
            cusp: { value: source.cuspLongitudeDegrees === null ? null : { longitudeDegrees: source.cuspLongitudeDegrees } },
            end: { value: source.endLongitudeDegrees === null ? null : { longitudeDegrees: source.endLongitudeDegrees } },
        }];
}));
export const fromPublic = (meta) => {
    const points = emptyWheelPoints();
    for (const [id, longitudeDegrees] of Object.entries(meta.points)) {
        points[id] = {
            position: { value: longitudeDegrees === null ? null : { longitudeDegrees } },
        };
    }
    const houses = {
        placidus: emptyWheelHouseChart(),
        whole_sign: emptyWheelHouseChart(),
        equal: emptyWheelHouseChart(),
        porphyry: emptyWheelHouseChart(),
    };
    houses[meta.primaryHouseSystem] = {
        status: meta.houses.status,
        houses: meta.houses.status === "unavailable" ? emptyWheelHouses() : selectedHouses(meta),
    };
    return {
        fingerprint: meta.calculationFingerprint,
        primaryHouseSystem: meta.primaryHouseSystem,
        points,
        houses,
        aspects: meta.aspects.map((aspect) => ({ ...aspect })),
    };
};
export const renderPublicWheel = (meta) => renderWheel(fromPublic(meta));
//# sourceMappingURL=public.js.map