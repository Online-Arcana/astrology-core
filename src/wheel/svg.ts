import type { PointId, Sign, WheelData } from "./types.js";
import { aspectSegment, anchors, forward, normalise, pointGlyphs, pointLayout, polar, sector, signGlyphs, signOrder, titleCase, wheelCentre, wheelRadii, wheelSize } from "./geometry.js";

export interface SvgAssets { glyph(path: string): Promise<string>; }
export interface SvgTheme { background: string; ink: string; muted: string; line: string; accent: string; }
export interface SvgOptions {
  assets?: SvgAssets;
  theme?: Partial<SvgTheme>;
  aspects?: boolean;
  inner?: string;
  attrs?: Readonly<Record<string, string>>;
}
const defaults: SvgTheme = { background: "#101019", ink: "#f7f3ff", muted: "#aaa1c0", line: "#6f6684", accent: "#d6c7ff" };
const esc = (value: string): string => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const assetPath = (id: PointId): { path: string; rotation?: number; modifier?: string } | null => {
  const base = "assets/astrology-glyphs/svg";
  if (["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"].includes(id)) return { path: `${base}/planets/${id}.svg` };
  switch (id) {
    case "ascendant": case "descendant": case "midheaven": case "imum_coeli": case "vertex": case "east_point": return { path: `${base}/angles/${id}.svg` };
    case "antivertex": return { path: `${base}/angles/vertex.svg`, rotation: 180 };
    case "north_node_true": return { path: `${base}/misc/true_node.svg`, modifier: "N" };
    case "south_node_true": return { path: `${base}/misc/true_node.svg`, modifier: "S" };
    case "north_node_mean": return { path: `${base}/misc/mean_node.svg`, modifier: "N" };
    case "south_node_mean": return { path: `${base}/misc/mean_node.svg`, modifier: "S" };
    case "part_of_fortune": return { path: `${base}/points/lot_of_fortune.svg` };
    case "part_of_spirit": return { path: `${base}/points/lot_of_spirit.svg` };
    case "lilith_mean": return { path: `${base}/points/black_moon_lilith.svg`, modifier: "M" };
    case "lilith_true": return { path: `${base}/points/black_moon_lilith.svg`, modifier: "T" };
    default: return null;
  }
};
const image = async (assets: SvgAssets | undefined, path: string, fallback: string, x: number, y: number, size: number, rotation = 0, modifier?: string): Promise<string> => {
  if (assets === undefined) return `<text x="${x.toFixed(3)}" y="${(y + size * .32).toFixed(3)}" text-anchor="middle" font-size="${size}">${esc(fallback)}</text>`;
  const raw = await assets.glyph(path);
  const href = `data:image/svg+xml,${encodeURIComponent(raw)}`;
  const transform = rotation === 0 ? "" : ` transform="rotate(${rotation} ${x.toFixed(3)} ${y.toFixed(3)})"`;
  const mark = modifier === undefined ? "" : `<text x="${(x + size * .42).toFixed(3)}" y="${(y - size * .28).toFixed(3)}" font-size="${Math.max(8,size*.32).toFixed(2)}">${esc(modifier)}</text>`;
  return `<image href="${href}" x="${(x-size/2).toFixed(3)}" y="${(y-size/2).toFixed(3)}" width="${size}" height="${size}"${transform}/>${mark}`;
};
const line = (longitude: number, from: number, to: number, asc: number, cls: string): string => {
  const a=polar(longitude,from,asc), b=polar(longitude,to,asc);
  return `<line x1="${a.x.toFixed(3)}" y1="${a.y.toFixed(3)}" x2="${b.x.toFixed(3)}" y2="${b.y.toFixed(3)}" class="${cls}"/>`;
};
export const renderSvg = async (data: WheelData, options: SvgOptions = {}): Promise<string> => {
  const theme={...defaults,...options.theme};
  const ascValue=data.points.ascendant.position.value; const asc=ascValue?.longitudeDegrees ?? 180; const timed=ascValue!==null;
  const attrs=Object.entries(options.attrs ?? {}).map(([k,v])=>` data-${esc(k)}="${esc(v)}"`).join("");
  const out:string[]=[];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wheelSize} ${wheelSize}"${attrs}>`);
  out.push(`<style>text{fill:${theme.ink};font-family:system-ui,sans-serif}.frame,.tick,.cusp,.leader{fill:none;stroke:${theme.line}}.frame{stroke-width:2}.zodiac{fill:none;stroke:${theme.line};stroke-width:1}.house{fill:none;stroke:${theme.muted};stroke-width:.7}.aspect{stroke:${theme.muted};stroke-width:1.2;opacity:.72}.point{fill:${theme.ink}}.leader{stroke-width:.7}.tick{stroke-width:.8}</style>`);
  out.push(`<rect width="800" height="800" fill="${theme.background}"/><circle class="frame" cx="${wheelCentre}" cy="${wheelCentre}" r="${wheelRadii.outer}"/>`);
  for (let i=0;i<signOrder.length;i+=1) { const sign=signOrder[i] as Sign; const start=i*30; out.push(`<path class="zodiac" d="${sector(start,start+30,wheelRadii.zodiacInner,wheelRadii.outer,asc)}"/>`); const p=polar(start+15,(wheelRadii.zodiacInner+wheelRadii.outer)/2,asc); out.push(await image(options.assets,`assets/astrology-glyphs/svg/zodiac/${sign}.svg`,signGlyphs[sign],p.x,p.y,31)); }
  for(let longitude=0;longitude<360;longitude+=5) out.push(line(longitude, longitude%30===0?wheelRadii.outer-14:wheelRadii.outer-7,wheelRadii.outer,asc,"tick"));
  const house=data.houses[data.primaryHouseSystem];
  if(timed&&house.status!=="unavailable") for(const h of Object.values(house.houses)){const c=h.cusp.value,e=h.end.value;if(c===null||e===null)continue;out.push(`<path class="house" d="${sector(c.longitudeDegrees,e.longitudeDegrees,wheelRadii.aspect,wheelRadii.zodiacInner,asc)}"/>`);out.push(line(c.longitudeDegrees,wheelRadii.aspect,wheelRadii.zodiacInner,asc,"cusp"));const middle=normalise(c.longitudeDegrees+forward(c.longitudeDegrees,e.longitudeDegrees)/2);const p=polar(middle,233,asc);out.push(`<text x="${p.x.toFixed(3)}" y="${(p.y+5).toFixed(3)}" text-anchor="middle" font-size="13">${h.number}</text>`);}
  const placed=pointLayout(data); const pointAnchors=anchors(data,asc);
  if(options.aspects!==false) for(const aspect of data.aspects){const a=pointAnchors.get(aspect.a),b=pointAnchors.get(aspect.b);if(a===undefined||b===undefined)continue;const s=aspectSegment(aspect,a,b);out.push(`<line class="aspect" data-aspect="${esc(aspect.id)}" x1="${s.start.x.toFixed(3)}" y1="${s.start.y.toFixed(3)}" x2="${s.end.x.toFixed(3)}" y2="${s.end.y.toFixed(3)}"/>`);}
  if(options.inner!==undefined) out.push(`<g class="wheel-inner">${options.inner}</g>`);
  for(const p of placed){const point=data.points[p.id],position=point.position.value,at=pointAnchors.get(p.id);if(position===null||at===undefined)continue;const radius=wheelRadii.pointBase-p.lane*24;out.push(line(p.longitude,wheelRadii.zodiacInner-3,radius+16,asc,"leader"));out.push(line(p.longitude,wheelRadii.zodiacInner-10,wheelRadii.zodiacInner+1,asc,"tick"));const asset=assetPath(p.id);out.push(`<g class="point" data-point="${p.id}" data-anchor-x="${at.x.toFixed(3)}" data-anchor-y="${at.y.toFixed(3)}">${asset===null?`<text x="${at.x.toFixed(3)}" y="${(at.y+8).toFixed(3)}" text-anchor="middle" font-size="20">${esc(pointGlyphs[p.id]??titleCase(p.id).slice(0,2))}</text>`:await image(options.assets,asset.path,pointGlyphs[p.id]??"•",at.x,at.y,29,asset.rotation??0,asset.modifier)}</g>`);}
  if(!timed) out.push(`<text x="400" y="400" text-anchor="middle">Birth time unknown · houses and angles are unavailable</text>`);
  out.push(`</svg>`); return out.join("");
};
