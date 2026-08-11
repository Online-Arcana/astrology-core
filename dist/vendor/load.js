export const loadVendor = async (specifier) => {
    switch (specifier) {
        case "@js-joda/core": return import("@js-joda/core");
        case "@js-joda/timezone": return import("@js-joda/timezone");
        case "astronomia/base": return import("astronomia/base");
        case "astronomia/apparent": return import("astronomia/apparent");
        case "astronomia/planetposition": return import("astronomia/planetposition");
        case "astronomia/nutation": return import("astronomia/nutation");
        case "astronomia/sidereal": return import("astronomia/sidereal");
        case "astronomia/coord": return import("astronomia/coord");
        case "astronomia/precess": return import("astronomia/precess");
        case "astronomia/solar": return import("astronomia/solar");
        case "astronomia/moonposition": return import("astronomia/moonposition");
        case "astronomia/pluto": return import("astronomia/pluto");
        case "astronomia/julian": return import("astronomia/julian");
        case "astronomia/deltat": return import("astronomia/deltat");
        case "astronomia/eclipse": return import("astronomia/eclipse");
        case "astronomia/data/vsop87Bearth": return import("astronomia/data/vsop87Bearth");
        case "astronomia/data/vsop87Bmercury": return import("astronomia/data/vsop87Bmercury");
        case "astronomia/data/vsop87Bvenus": return import("astronomia/data/vsop87Bvenus");
        case "astronomia/data/vsop87Bmars": return import("astronomia/data/vsop87Bmars");
        case "astronomia/data/vsop87Bjupiter": return import("astronomia/data/vsop87Bjupiter");
        case "astronomia/data/vsop87Bsaturn": return import("astronomia/data/vsop87Bsaturn");
        case "astronomia/data/vsop87Buranus": return import("astronomia/data/vsop87Buranus");
        case "astronomia/data/vsop87Bneptune": return import("astronomia/data/vsop87Bneptune");
        default: throw new Error(`Unknown astral-core vendor ${specifier}`);
    }
};
//# sourceMappingURL=load.js.map