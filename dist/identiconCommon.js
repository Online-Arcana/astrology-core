import { literalSignGridPlacements } from "./literalSignGrid.js";
export const identiconCanvas = 1024;
export const identiconCentre = identiconCanvas / 2;
export const identiconOuterRingRadius = 486;
export const identiconInnerRingRadius = 396;
export const identiconRingStroke = 8;
const ringGlyphRadius = (identiconOuterRingRadius + identiconInnerRingRadius) / 2;
export const signLabel = (value) => value[0].toUpperCase() + value.slice(1);
function attribute(source, name) {
    const expression = new RegExp(`\\b${name}=["']([^"']+)["']`, "i");
    return expression.exec(source)?.[1];
}
export function parseSvg(source) {
    const root = /<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i.exec(source.trim());
    if (!root)
        throw new Error("Asset is not a valid SVG");
    const attributes = root[1];
    const viewBox = attribute(attributes, "viewBox");
    if (!viewBox)
        throw new Error("Asset SVG is missing a viewBox");
    const body = root[2].replace(/<title\b[\s\S]*?<\/title>/gi, "").replace(/<desc\b[\s\S]*?<\/desc>/gi, "");
    return { viewBox, body };
}
export function scopeIds(source, prefix) {
    const ids = new Map();
    for (const match of source.matchAll(/\bid=["']([^"']+)["']/gi))
        ids.set(match[1], `${prefix}-${match[1]}`);
    return source
        .replace(/\bid=(["'])([^"']+)\1/gi, (_match, quote, id) => `id=${quote}${ids.get(id) ?? id}${quote}`)
        .replace(/url\(#([^)]+)\)/g, (_match, id) => `url(#${ids.get(id) ?? id})`)
        .replace(/(["'])#([^"']+)\1/g, (_match, quote, id) => {
        const scoped = ids.get(id);
        return scoped ? `${quote}#${scoped}${quote}` : `${quote}#${id}${quote}`;
    });
}
function paint(source, name, value) {
    const expression = new RegExp(`\\b${name}=(["'])(?!none\\1)(?!transparent\\1)(?!url\\()[^"']+\\1`, "gi");
    return source.replace(expression, `${name}="${value}"`);
}
export function monochrome(source, value) {
    let result = source;
    result = paint(result, "fill", value);
    result = paint(result, "stroke", value);
    result = paint(result, "stop-color", value);
    return result.replace(/\bcolor=(["'])[^"']+\1/gi, `color="${value}"`);
}
export function outlined(source, fill, stroke) {
    let result = monochrome(source, fill);
    result = result.replace(/<path\b([^>]*)>/gi, (_match, raw) => {
        const selfClosing = /\/\s*$/.test(raw);
        let attributes = raw.replace(/\/\s*$/, "").replace(/\sstroke=(["'])[^"']*\1/gi, "").replace(/\sstroke-width=(["'])[^"']*\1/gi, "").replace(/\spaint-order=(["'])[^"']*\1/gi, "").replace(/\svector-effect=(["'])[^"']*\1/gi, "");
        attributes += ` stroke="${stroke}" stroke-width="4" paint-order="stroke fill" vector-effect="non-scaling-stroke"`;
        return `<path${attributes}${selfClosing ? "/>" : ">"}`;
    });
    return result;
}
export function escapeXml(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
export function nestedSvg(body, viewBox, x, y, width, height, attributes = "") {
    return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" ${attributes}>${body}</svg>`;
}
export function placedSvg(body, viewBox, x, y, size, attributes = "", rotation = 0) {
    const value = nestedSvg(body, viewBox, x - size / 2, y - size / 2, size, size, attributes);
    return rotation === 0 ? value : `<g transform="rotate(${rotation} ${x} ${y})">${value}</g>`;
}
function ringPoint(angle, radius = ringGlyphRadius) {
    const radians = (angle * Math.PI) / 180;
    return { x: identiconCentre + Math.sin(radians) * radius, y: identiconCentre - Math.cos(radians) * radius };
}
function ringItem(key, sign, angle, size, role) {
    const { x, y } = ringPoint(angle);
    return { key, sign, x, y, size, role, angle };
}
export function ringPlacements(value) {
    return [
        ringItem("solar-top", value.solar, 0, 88, "Sun"), ringItem("midheaven-ring", value.midheaven, 30, 58, "Midheaven"),
        ringItem("moon-north-east", value.lunar, 60, 72, "Moon"), ringItem("solar-right", value.solar, 90, 88, "Sun"),
        ringItem("moon-south-east", value.lunar, 120, 72, "Moon"), ringItem("descendant-ring", value.descendant, 150, 58, "Descendant"),
        ringItem("solar-bottom", value.solar, 180, 88, "Sun"), ringItem("imum-coeli-ring", value.imumCoeli, 210, 58, "Imum Coeli"),
        ringItem("moon-south-west", value.lunar, 240, 72, "Moon"), ringItem("solar-left", value.solar, 270, 88, "Sun"),
        ringItem("moon-north-west", value.lunar, 300, 72, "Moon"), ringItem("ascendant-ring", value.ascendant, 330, 58, "Ascendant")
    ];
}
export async function signAssets(value, assets) {
    const required = new Set([...literalSignGridPlacements(value, { centre: identiconCentre, offset: 230 }).map((p) => p.sign), ...ringPlacements(value).map((p) => p.sign)]);
    const result = new Map();
    await Promise.all([...required].map(async (sign) => { result.set(sign, parseSvg(await assets.sigil(sign))); }));
    return result;
}
export function innerSigns(value, signs, foreground, background) {
    return literalSignGridPlacements(value, { centre: identiconCentre, offset: 230 }).map((placement) => {
        const asset = signs.get(placement.sign);
        if (!asset)
            throw new Error(`Missing sigil asset for ${placement.sign}`);
        const body = outlined(scopeIds(asset.body, `sigil-${placement.key}-${placement.sign}`), foreground, background);
        return placedSvg(body, asset.viewBox, placement.x, placement.y, placement.size, `data-role="${escapeXml(placement.role)}" data-sign="${placement.sign}" data-orientation="upright"`);
    }).join("\n");
}
export function ringSigns(value, signs, foreground) {
    return ringPlacements(value).map((placement) => {
        const asset = signs.get(placement.sign);
        if (!asset)
            throw new Error(`Missing ring sigil asset for ${placement.sign}`);
        const body = monochrome(scopeIds(asset.body, `ring-${placement.key}-${placement.sign}`), foreground);
        return placedSvg(body, asset.viewBox, placement.x, placement.y, placement.size, `data-role="${escapeXml(placement.role)}" data-sign="${placement.sign}"`, placement.angle);
    }).join("\n");
}
