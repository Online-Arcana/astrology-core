import { loadVendor } from "../vendor/load.js";
import { vendorRevisions } from "../vendor/revisions.js";
const tau = 2 * Math.PI;
const auKilometres = 149_597_870.7;
const finiteDate = (utcIso) => {
    const date = new Date(utcIso);
    if (!Number.isFinite(date.getTime()))
        throw new Error("Invalid UTC instant");
    return date;
};
const geocentric = (planet, earth, jde, modules) => {
    const earthPosition = earth.position(jde);
    let x = 0;
    let y = 0;
    let z = 0;
    let distance = 0;
    const update = (lightDays = 0) => {
        const body = planet.position(jde - lightDays);
        const bodyCosLat = Math.cos(body.lat);
        const earthCosLat = Math.cos(earthPosition.lat);
        x = body.range * bodyCosLat * Math.cos(body.lon) - earthPosition.range * earthCosLat * Math.cos(earthPosition.lon);
        y = body.range * bodyCosLat * Math.sin(body.lon) - earthPosition.range * earthCosLat * Math.sin(earthPosition.lon);
        z = body.range * Math.sin(body.lat) - earthPosition.range * Math.sin(earthPosition.lat);
        distance = Math.hypot(x, y, z);
    };
    update();
    update(modules.base.lightTime(distance));
    let lon = Math.atan2(y, x);
    let lat = Math.atan2(z, Math.hypot(x, y));
    const [aberrationLon, aberrationLat] = modules.apparent.eclipticAberration(lon, lat, jde);
    const fk5 = modules.planetposition.toFK5(lon + aberrationLon, lat + aberrationLat, jde);
    lon = fk5.lon;
    lat = fk5.lat;
    const [nutationLon, nutationObliquity] = modules.nutation.nutation(jde);
    lon = modules.base.pmod(lon + nutationLon, tau);
    const obliquity = modules.nutation.meanObliquity(jde) + nutationObliquity;
    const equatorial = new modules.coord.Ecliptic(lon, lat).toEquatorial(obliquity);
    return {
        rightAscensionRadians: modules.base.pmod(equatorial.ra, tau),
        declinationRadians: equatorial.dec,
        eclipticLongitudeRadians: lon,
        eclipticLatitudeRadians: lat,
        distanceAu: distance,
    };
};
class VendorAstronomia {
    provider = vendorRevisions.astronomia;
    #modules;
    #earth;
    #planets;
    #pluto;
    constructor(modules, earth, planets) {
        this.#modules = modules;
        this.#earth = earth;
        this.#planets = planets;
        this.#pluto = {
            position: (jde) => {
                const value = modules.pluto.heliocentric(jde);
                const datePosition = modules.precess.eclipticPosition(new modules.coord.Ecliptic(value.lon, value.lat), 2000, modules.base.JDEToJulianYear(jde));
                return { lon: datePosition.lon, lat: datePosition.lat, range: value.range };
            },
        };
    }
    time(utcIso) {
        const calendar = new this.#modules.julian.CalendarGregorian(finiteDate(utcIso));
        const julianDay = calendar.toJD();
        const deltaTSeconds = this.#modules.deltat.deltaT(calendar.toYear());
        return {
            julianDay,
            deltaTSeconds,
            julianEphemerisDay: julianDay + deltaTSeconds / 86_400,
        };
    }
    geometry(julianDay, julianEphemerisDay) {
        const [, nutationObliquity] = this.#modules.nutation.nutation(julianEphemerisDay);
        return {
            apparentSiderealDegrees: this.#modules.sidereal.apparent(julianDay) / 240,
            trueObliquityRadians: this.#modules.nutation.meanObliquity(julianEphemerisDay) + nutationObliquity,
        };
    }
    sample(id, jde) {
        if (id === "sun") {
            const ecliptic = this.#modules.solar.apparentVSOP87(this.#earth, jde);
            const equatorial = this.#modules.solar.apparentEquatorialVSOP87(this.#earth, jde);
            return {
                rightAscensionRadians: this.#modules.base.pmod(equatorial.ra, tau),
                declinationRadians: equatorial.dec,
                eclipticLongitudeRadians: this.#modules.base.pmod(ecliptic.lon, tau),
                eclipticLatitudeRadians: ecliptic.lat,
                distanceAu: ecliptic.range,
            };
        }
        if (id === "moon") {
            const mean = this.#modules.moon.position(jde);
            const [nutationLon, nutationObliquity] = this.#modules.nutation.nutation(jde);
            const lon = this.#modules.base.pmod(mean.lon + nutationLon, tau);
            const obliquity = this.#modules.nutation.meanObliquity(jde) + nutationObliquity;
            const equatorial = new this.#modules.coord.Ecliptic(lon, mean.lat).toEquatorial(obliquity);
            return {
                rightAscensionRadians: this.#modules.base.pmod(equatorial.ra, tau),
                declinationRadians: equatorial.dec,
                eclipticLongitudeRadians: lon,
                eclipticLatitudeRadians: mean.lat,
                distanceAu: mean.range / auKilometres,
            };
        }
        return geocentric(id === "pluto" ? this.#pluto : this.#planets[id], this.#earth, jde, this.#modules);
    }
}
const moduleDefault = async (path) => (await loadVendor(path)).default;
export const loadAstronomia = async () => {
    const [base, apparent, planetpositionModule, nutation, sidereal, coord, precess, solar, moon, pluto, julian, deltat, earthData, mercuryData, venusData, marsData, jupiterData, saturnData, uranusData, neptuneData,] = await Promise.all([
        moduleDefault("astronomia/base"),
        moduleDefault("astronomia/apparent"),
        loadVendor("astronomia/planetposition"),
        moduleDefault("astronomia/nutation"),
        moduleDefault("astronomia/sidereal"),
        moduleDefault("astronomia/coord"),
        moduleDefault("astronomia/precess"),
        moduleDefault("astronomia/solar"),
        moduleDefault("astronomia/moonposition"),
        moduleDefault("astronomia/pluto"),
        moduleDefault("astronomia/julian"),
        moduleDefault("astronomia/deltat"),
        moduleDefault("astronomia/data/vsop87Bearth"),
        moduleDefault("astronomia/data/vsop87Bmercury"),
        moduleDefault("astronomia/data/vsop87Bvenus"),
        moduleDefault("astronomia/data/vsop87Bmars"),
        moduleDefault("astronomia/data/vsop87Bjupiter"),
        moduleDefault("astronomia/data/vsop87Bsaturn"),
        moduleDefault("astronomia/data/vsop87Buranus"),
        moduleDefault("astronomia/data/vsop87Bneptune"),
    ]);
    const planetposition = planetpositionModule.default;
    const earth = new planetposition.Planet(earthData);
    const planets = {
        mercury: new planetposition.Planet(mercuryData),
        venus: new planetposition.Planet(venusData),
        mars: new planetposition.Planet(marsData),
        jupiter: new planetposition.Planet(jupiterData),
        saturn: new planetposition.Planet(saturnData),
        uranus: new planetposition.Planet(uranusData),
        neptune: new planetposition.Planet(neptuneData),
    };
    return new VendorAstronomia({ base, apparent, planetposition, nutation, sidereal, coord, precess, solar, moon, pluto, julian, deltat }, earth, planets);
};
//# sourceMappingURL=astronomia.js.map