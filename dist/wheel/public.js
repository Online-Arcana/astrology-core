import { renderWheel } from "./render.js";
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const emptyHouses = () => Object.fromEntries(numbers.map((number) => [String(number), { number, cusp: { value: null }, end: { value: null } }]));
const selectedHouses = (meta) => Object.fromEntries(numbers.map((number) => {
    const source = meta.houses.houses[String(number)];
    return [String(number), source === undefined ? { number, cusp: { value: null }, end: { value: null } } : {
            number,
            cusp: { value: source.cuspLongitudeDegrees === null ? null : { longitudeDegrees: source.cuspLongitudeDegrees } },
            end: { value: source.endLongitudeDegrees === null ? null : { longitudeDegrees: source.endLongitudeDegrees } },
        }];
}));
export const fromPublic = (meta) => {
    const points = Object.fromEntries(Object.entries(meta.points).map(([id, longitudeDegrees]) => [id, {
            position: { value: longitudeDegrees === null ? null : { longitudeDegrees } },
        }]));
    const unavailable = () => ({ status: "unavailable", houses: emptyHouses() });
    const houses = { placidus: unavailable(), whole_sign: unavailable(), equal: unavailable(), porphyry: unavailable() };
    houses[meta.primaryHouseSystem] = { status: meta.houses.status, houses: selectedHouses(meta) };
    return { fingerprint: meta.calculationFingerprint, primaryHouseSystem: meta.primaryHouseSystem, points, houses, aspects: meta.aspects.map((aspect) => ({ ...aspect })) };
};
export const renderPublicWheel = (meta) => renderWheel(fromPublic(meta));
//# sourceMappingURL=public.js.map