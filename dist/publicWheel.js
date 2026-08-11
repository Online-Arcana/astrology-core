import { renderChartWheel } from "./chartWheel.js";
const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const emptyHouseMap = () => Object.fromEntries(houseNumbers.map((number) => [String(number), {
        number,
        cusp: { value: null },
        end: { value: null },
    }]));
const selectedHouseMap = (meta) => Object.fromEntries(houseNumbers.map((number) => {
    const source = meta.houses.houses[String(number)];
    if (source === undefined) {
        return [String(number), {
                number,
                cusp: { value: null },
                end: { value: null },
            }];
    }
    return [String(number), {
            number,
            cusp: {
                value: source.cuspLongitudeDegrees === null
                    ? null
                    : { longitudeDegrees: source.cuspLongitudeDegrees },
            },
            end: {
                value: source.endLongitudeDegrees === null
                    ? null
                    : { longitudeDegrees: source.endLongitudeDegrees },
            },
        }];
}));
export function chartWheelCalculationFromPublicMeta(meta) {
    const points = Object.fromEntries(Object.entries(meta.points).map(([id, longitudeDegrees]) => [id, {
            position: {
                value: longitudeDegrees === null ? null : { longitudeDegrees },
            },
        }]));
    const unavailable = () => ({
        status: "unavailable",
        houses: emptyHouseMap(),
    });
    const houses = {
        placidus: unavailable(),
        whole_sign: unavailable(),
        equal: unavailable(),
        porphyry: unavailable(),
    };
    houses[meta.primaryHouseSystem] = {
        status: meta.houses.status,
        houses: selectedHouseMap(meta),
    };
    return {
        provenance: {
            calculationFingerprint: meta.calculationFingerprint,
        },
        settings: {
            primaryHouseSystem: meta.primaryHouseSystem,
        },
        system: {
            points,
            houses,
            aspects: meta.aspects.map((aspect) => ({ ...aspect })),
        },
    };
}
export function renderPublicChartWheel(meta) {
    return renderChartWheel(chartWheelCalculationFromPublicMeta(meta));
}
//# sourceMappingURL=publicWheel.js.map