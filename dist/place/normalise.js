const code = (value) => value.trim().toUpperCase();
const coordinate = (value, name, min, max) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
        throw new Error(`${name} is outside its valid range`);
    }
    return parsed;
};
const zone = (city, region, country) => {
    const candidates = [city.timezone, region?.timezone ?? null];
    if (country.timezones.length === 1)
        candidates.push(country.timezones[0]?.zoneName ?? null);
    const selected = candidates.find((value) => typeof value === "string" && value.length > 0);
    if (!selected || !/^[A-Za-z_+.-]+(?:\/[A-Za-z0-9_+.-]+)+$/u.test(selected)) {
        throw new Error(`City ${city.id} has no usable IANA time zone`);
    }
    return selected;
};
export const placeId = (countryCode, regionCode, cityId) => `csc:${code(countryCode)}:${regionCode ? code(regionCode) : "-"}:${cityId}`;
export const parsePlaceId = (id) => {
    const match = /^csc:([A-Z]{2}):([A-Z0-9-]+|-):(\d+)$/u.exec(id);
    if (!match)
        throw new Error("Invalid place ID");
    const cityId = Number(match[3]);
    if (!Number.isSafeInteger(cityId) || cityId < 1)
        throw new Error("Invalid city ID");
    return {
        countryCode: match[1],
        regionCode: match[2] === "-" ? null : match[2],
        cityId,
    };
};
export const normalisePlace = (country, region, city) => {
    const countryCode = code(country.iso2);
    if (code(city.country_code) !== countryCode)
        throw new Error("City country does not match selected country");
    if (region) {
        if (code(region.country_code) !== countryCode)
            throw new Error("Region country does not match selected country");
        if (code(city.state_code) !== code(region.iso2))
            throw new Error("City region does not match selected region");
    }
    return {
        id: placeId(countryCode, region?.iso2 ?? null, city.id),
        continent: country.region.trim() || "Unknown",
        subcontinent: country.subregion.trim() || null,
        country: { code: countryCode, name: country.name },
        region: region ? { code: code(region.iso2), name: region.name } : null,
        city: { name: city.name },
        latitude: coordinate(city.latitude, "Latitude", -90, 90),
        longitude: coordinate(city.longitude, "Longitude", -180, 180),
        elevationMetres: null,
        timeZone: zone(city, region, country),
    };
};
//# sourceMappingURL=normalise.js.map