export const calculateSect = (astronomy, angles, latitudeDegrees, angleStatus = "exact", angleReason = "none") => {
    const sun = astronomy.bodies.sun;
    if (!angles || sun.rightAscensionRadians.value === null || sun.declinationRadians.value === null) {
        return {
            status: "unavailable",
            value: null,
            reason: sun.rightAscensionRadians.reason === "none" ? "insufficient_data" : sun.rightAscensionRadians.reason,
        };
    }
    const latitude = latitudeDegrees * Math.PI / 180;
    const hourAngle = angles.localSiderealDegrees * Math.PI / 180 - sun.rightAscensionRadians.value;
    const altitudeSine = Math.sin(latitude) * Math.sin(sun.declinationRadians.value)
        + Math.cos(latitude) * Math.cos(sun.declinationRadians.value) * Math.cos(hourAngle);
    const status = sun.rightAscensionRadians.status === "bounded" || angleStatus === "bounded"
        ? "bounded"
        : sun.rightAscensionRadians.status === "approximate" || angleStatus === "approximate"
            ? "approximate"
            : "exact";
    const reason = angleReason !== "none" ? angleReason : sun.rightAscensionRadians.reason;
    return {
        status,
        value: altitudeSine >= 0 ? "day" : "night",
        reason,
    };
};
//# sourceMappingURL=sect.js.map