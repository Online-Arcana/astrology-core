export interface GeometrySample {
    apparentSiderealDegrees: number;
    trueObliquityRadians: number;
}
export interface CoreAngles {
    localSiderealDegrees: number;
    ascendant: number;
    descendant: number;
    midheaven: number;
    imumCoeli: number;
}
export interface AuxiliaryAngles {
    vertex: number;
    antivertex: number;
    eastPoint: number;
}
export declare const forwardArc: (from: number, to: number) => number;
export declare const signedArc: (value: number) => number;
export declare const eclipticEquatorial: (longitudeDegrees: number, obliquityRadians: number) => {
    rightAscensionDegrees: number;
    declinationDegrees: number;
};
export declare const coreAngles: (geometry: GeometrySample, longitudeDegrees: number, latitudeDegrees: number) => CoreAngles;
export declare const auxiliaryAngles: (core: CoreAngles, latitudeDegrees: number, obliquityRadians: number) => AuxiliaryAngles;
//# sourceMappingURL=angles.d.ts.map