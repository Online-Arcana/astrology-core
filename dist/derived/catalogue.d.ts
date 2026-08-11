import type { HouseSystem, PointId, Sign } from "../types/astro.js";
export declare const derivedProfile: "western_derived/1.0.0";
export declare const dominanceProfile: "planetary_dominance/1.0.0";
export declare const jonesProfile: "jones_patterns/1.0.0";
export declare const unaspectedProfile: "unaspected_planets/1.0.0";
export declare const primaryHouseSystem: HouseSystem;
export type Modality = "cardinal" | "fixed" | "mutable";
export type Polarity = "active" | "receptive";
export declare const signModalities: Readonly<Record<Sign, Modality>>;
export declare const signPolarities: Readonly<Record<Sign, Polarity>>;
export declare const planetIds: readonly ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
export declare const balanceWeight: (id: PointId) => number;
export declare const angularHouses: Set<number>;
export declare const succedentHouses: Set<number>;
export declare const cadentHouses: Set<number>;
export declare const dominanceWeights: {
    readonly traditionalChartRuler: 4;
    readonly modernChartRuler: 2;
    readonly angularHouse: 3;
    readonly succedentHouse: 1;
    readonly majorAspect: 2;
    readonly minorAspect: 0.75;
    readonly sectLight: 2;
};
//# sourceMappingURL=catalogue.d.ts.map