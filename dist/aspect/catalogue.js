export const aspectProfile = "western_aspects/1.0.0";
export const aspectRules = [
    { kind: "conjunction", angle: 0, orb: 8, class: "major", character: "contextual" },
    { kind: "opposition", angle: 180, orb: 8, class: "major", character: "challenging" },
    { kind: "trine", angle: 120, orb: 7, class: "major", character: "flowing" },
    { kind: "square", angle: 90, orb: 7, class: "major", character: "challenging" },
    { kind: "sextile", angle: 60, orb: 5, class: "major", character: "flowing" },
    { kind: "quincunx", angle: 150, orb: 3, class: "minor", character: "adjusting" },
    { kind: "semisextile", angle: 30, orb: 2, class: "minor", character: "contextual" },
    { kind: "semisquare", angle: 45, orb: 2, class: "minor", character: "challenging" },
    { kind: "sesquiquadrate", angle: 135, orb: 2, class: "minor", character: "challenging" },
    { kind: "quintile", angle: 72, orb: 2, class: "minor", character: "creative" },
    { kind: "biquintile", angle: 144, orb: 2, class: "minor", character: "creative" },
];
const luminaries = new Set(["sun", "moon"]);
const angles = new Set(["ascendant", "descendant", "midheaven", "imum_coeli"]);
export const allowedOrb = (rule, a, b) => {
    if (rule.class === "minor")
        return rule.orb;
    const luminaryBonus = luminaries.has(a) || luminaries.has(b) ? 2 : 0;
    const angleBonus = angles.has(a) || angles.has(b) ? 1 : 0;
    return rule.orb + luminaryBonus + angleBonus;
};
export const isPlanet = (point) => ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(point);
//# sourceMappingURL=catalogue.js.map