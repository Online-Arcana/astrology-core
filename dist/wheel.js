// src/wheel/data.ts
var houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var pointIds = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "north_node_true",
  "south_node_true",
  "north_node_mean",
  "south_node_mean",
  "ascendant",
  "descendant",
  "midheaven",
  "imum_coeli",
  "vertex",
  "antivertex",
  "east_point",
  "part_of_fortune",
  "part_of_spirit",
  "lilith_mean",
  "lilith_true"
];
var emptyWheelHouses = () => Object.fromEntries(
  houseNumbers.map((number) => [String(number), {
    number,
    cusp: { value: null },
    end: { value: null }
  }])
);
var emptyWheelHouseChart = () => ({
  status: "unavailable",
  houses: emptyWheelHouses()
});
var emptyWheelPoints = () => Object.fromEntries(
  pointIds.map((id) => [id, { position: { value: null } }])
);
var emptyWheelData = (fingerprint = "wheel-shell", primaryHouseSystem = "placidus") => ({
  fingerprint,
  primaryHouseSystem,
  points: emptyWheelPoints(),
  houses: {
    placidus: emptyWheelHouseChart(),
    whole_sign: emptyWheelHouseChart(),
    equal: emptyWheelHouseChart(),
    porphyry: emptyWheelHouseChart()
  },
  aspects: []
});
var wheelData = (calculation) => ({
  fingerprint: calculation.provenance.calculationFingerprint,
  primaryHouseSystem: calculation.settings.primaryHouseSystem,
  points: calculation.system.points,
  houses: calculation.system.houses,
  aspects: calculation.system.aspects
});

// src/wheel/geometry.ts
var wheelSize = 800;
var wheelCentre = wheelSize / 2;
var wheelRadii = { outer: 372, zodiacInner: 316, pointBase: 286, houseOuter: 254, aspect: 210 };
var signOrder = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
var signGlyphs = {
  aries: "\u2648\uFE0E",
  taurus: "\u2649\uFE0E",
  gemini: "\u264A\uFE0E",
  cancer: "\u264B\uFE0E",
  leo: "\u264C\uFE0E",
  virgo: "\u264D\uFE0E",
  libra: "\u264E\uFE0E",
  scorpio: "\u264F\uFE0E",
  sagittarius: "\u2650\uFE0E",
  capricorn: "\u2651\uFE0E",
  aquarius: "\u2652\uFE0E",
  pisces: "\u2653\uFE0E"
};
var pointGlyphs = {
  sun: "\u2609",
  moon: "\u263D",
  mercury: "\u263F",
  venus: "\u2640\uFE0E",
  mars: "\u2642\uFE0E",
  jupiter: "\u2643",
  saturn: "\u2644",
  uranus: "\u2645",
  neptune: "\u2646",
  pluto: "\u2647",
  north_node_true: "T",
  south_node_true: "T",
  north_node_mean: "M",
  south_node_mean: "M",
  ascendant: "As",
  descendant: "Ds",
  midheaven: "Mc",
  imum_coeli: "IC",
  vertex: "Vx",
  antivertex: "AV",
  east_point: "Ep",
  part_of_fortune: "\u2297",
  part_of_spirit: "\u03A6",
  lilith_mean: "\u26B8",
  lilith_true: "\u26B8"
};
var titleCase = (value) => value.replaceAll("_", " ").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-GB"));
var normalise = (degrees) => (degrees % 360 + 360) % 360;
var forward = (start, end) => normalise(end - start);
var radians = (degrees) => degrees * Math.PI / 180;
var screenAngle = (longitude, ascendant) => Math.PI - radians(normalise(longitude - ascendant));
var polar = (longitude, radius, ascendant) => {
  const angle = screenAngle(longitude, ascendant);
  return { x: wheelCentre + radius * Math.cos(angle), y: wheelCentre + radius * Math.sin(angle) };
};
var sector = (start, end, inner, outer, ascendant) => {
  const distance = Math.max(0.01, forward(start, end));
  const steps = Math.max(3, Math.ceil(distance / 3));
  const outerPoints = [];
  const innerPoints = [];
  for (let index = 0; index <= steps; index += 1) {
    const longitude = normalise(start + distance * index / steps);
    outerPoints.push(polar(longitude, outer, ascendant));
    innerPoints.push(polar(longitude, inner, ascendant));
  }
  const first = outerPoints[0];
  if (first === void 0) return "";
  const commands = [`M ${first.x.toFixed(3)} ${first.y.toFixed(3)}`];
  for (const point of outerPoints.slice(1)) commands.push(`L ${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
  for (const point of innerPoints.reverse()) commands.push(`L ${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
  commands.push("Z");
  return commands.join(" ");
};
var pointLayout = (data) => {
  const points = Object.entries(data.points).flatMap(([rawId, point]) => point.position.value === null ? [] : [{ id: rawId, longitude: point.position.value.longitudeDegrees }]).sort((left, right) => left.longitude - right.longitude || left.id.localeCompare(right.id));
  const last = [null, null, null, null, null];
  return points.map((point) => {
    let lane = 0;
    for (let candidate = 0; candidate < last.length; candidate += 1) {
      const previous = last[candidate];
      if (previous === void 0 || previous === null || forward(previous, point.longitude) >= 6.5) {
        lane = candidate;
        break;
      }
      lane = Math.min(candidate + 1, last.length - 1);
    }
    last[lane] = point.longitude;
    return { ...point, lane };
  });
};
var shorten = (start, end, padding) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-3) return { start, end };
  const inset = Math.min(padding, Math.max(0, length / 2 - 2));
  const ux = dx / length;
  const uy = dy / length;
  return { start: { x: start.x + ux * inset, y: start.y + uy * inset }, end: { x: end.x - ux * inset, y: end.y - uy * inset } };
};
var extend = (start, end, amount) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-3) return { start, end };
  const ux = dx / length;
  const uy = dy / length;
  return { start: { x: start.x - ux * amount, y: start.y - uy * amount }, end: { x: end.x + ux * amount, y: end.y + uy * amount } };
};
var aspectSegment = (aspect, start, end) => aspect.kind === "conjunction" ? extend(start, end, 18) : shorten(start, end, 15);
var anchors = (data, ascendant) => new Map(pointLayout(data).map((point) => [point.id, polar(point.longitude, wheelRadii.pointBase - point.lane * 24, ascendant)]));

// src/wheel/svg.ts
var defaults = { background: "#101019", ink: "#f7f3ff", muted: "#aaa1c0", line: "#6f6684", accent: "#d6c7ff" };
var esc = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
var assetPath = (id) => {
  const base = "assets/astrology-glyphs/svg";
  if (["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(id)) return { path: `${base}/planets/${id}.svg` };
  switch (id) {
    case "ascendant":
    case "descendant":
    case "midheaven":
    case "imum_coeli":
    case "vertex":
    case "east_point":
      return { path: `${base}/angles/${id}.svg` };
    case "antivertex":
      return { path: `${base}/angles/vertex.svg`, rotation: 180 };
    case "north_node_true":
      return { path: `${base}/misc/true_node.svg`, modifier: "N" };
    case "south_node_true":
      return { path: `${base}/misc/true_node.svg`, modifier: "S" };
    case "north_node_mean":
      return { path: `${base}/misc/mean_node.svg`, modifier: "N" };
    case "south_node_mean":
      return { path: `${base}/misc/mean_node.svg`, modifier: "S" };
    case "part_of_fortune":
      return { path: `${base}/points/lot_of_fortune.svg` };
    case "part_of_spirit":
      return { path: `${base}/points/lot_of_spirit.svg` };
    case "lilith_mean":
      return { path: `${base}/points/black_moon_lilith.svg`, modifier: "M" };
    case "lilith_true":
      return { path: `${base}/points/black_moon_lilith.svg`, modifier: "T" };
    default:
      return null;
  }
};
var image = async (assets, path, fallback, x, y, size, rotation = 0, modifier) => {
  if (assets === void 0) return `<text x="${x.toFixed(3)}" y="${(y + size * 0.32).toFixed(3)}" text-anchor="middle" font-size="${size}">${esc(fallback)}</text>`;
  const raw = await assets.glyph(path);
  const href = `data:image/svg+xml,${encodeURIComponent(raw)}`;
  const transform = rotation === 0 ? "" : ` transform="rotate(${rotation} ${x.toFixed(3)} ${y.toFixed(3)})"`;
  const mark = modifier === void 0 ? "" : `<text x="${(x + size * 0.42).toFixed(3)}" y="${(y - size * 0.28).toFixed(3)}" font-size="${Math.max(8, size * 0.32).toFixed(2)}">${esc(modifier)}</text>`;
  return `<image href="${href}" x="${(x - size / 2).toFixed(3)}" y="${(y - size / 2).toFixed(3)}" width="${size}" height="${size}"${transform}/>${mark}`;
};
var line = (longitude, from, to, asc, cls) => {
  const a = polar(longitude, from, asc), b = polar(longitude, to, asc);
  return `<line x1="${a.x.toFixed(3)}" y1="${a.y.toFixed(3)}" x2="${b.x.toFixed(3)}" y2="${b.y.toFixed(3)}" class="${cls}"/>`;
};
var renderSvg = async (data, options = {}) => {
  const theme = { ...defaults, ...options.theme };
  const ascValue = data.points.ascendant.position.value;
  const timed = ascValue !== null;
  const asc = options.orientationDegrees ?? ascValue?.longitudeDegrees ?? 180;
  const attrs = Object.entries(options.attrs ?? {}).map(([k, v]) => ` data-${esc(k)}="${esc(v)}"`).join("");
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wheelSize} ${wheelSize}"${attrs}>`);
  out.push(`<style>text{fill:${theme.ink};font-family:system-ui,sans-serif}.frame,.tick,.cusp,.leader{fill:none;stroke:${theme.line}}.frame{stroke-width:2}.zodiac{fill:none;stroke:${theme.line};stroke-width:1}.house{fill:none;stroke:${theme.muted};stroke-width:.7}.aspect{stroke:${theme.muted};stroke-width:1.2;opacity:.72}.point{fill:${theme.ink}}.leader{stroke-width:.7}.tick{stroke-width:.8}</style>`);
  out.push(`<rect width="800" height="800" fill="${theme.background}"/><circle class="frame" cx="${wheelCentre}" cy="${wheelCentre}" r="${wheelRadii.outer}"/>`);
  for (let i = 0; i < signOrder.length; i += 1) {
    const sign = signOrder[i];
    const start = i * 30;
    out.push(`<path class="zodiac" d="${sector(start, start + 30, wheelRadii.zodiacInner, wheelRadii.outer, asc)}"/>`);
    const p = polar(start + 15, (wheelRadii.zodiacInner + wheelRadii.outer) / 2, asc);
    out.push(await image(options.assets, `assets/astrology-glyphs/svg/zodiac/${sign}.svg`, signGlyphs[sign], p.x, p.y, 31));
  }
  for (let longitude = 0; longitude < 360; longitude += 5) out.push(line(longitude, longitude % 30 === 0 ? wheelRadii.outer - 14 : wheelRadii.outer - 7, wheelRadii.outer, asc, "tick"));
  const house = data.houses[data.primaryHouseSystem];
  if (timed && house.status !== "unavailable") for (const h of Object.values(house.houses)) {
    const c = h.cusp.value, e = h.end.value;
    if (c === null || e === null) continue;
    out.push(`<path class="house" d="${sector(c.longitudeDegrees, e.longitudeDegrees, wheelRadii.aspect, wheelRadii.zodiacInner, asc)}"/>`);
    out.push(line(c.longitudeDegrees, wheelRadii.aspect, wheelRadii.zodiacInner, asc, "cusp"));
    const middle = normalise(c.longitudeDegrees + forward(c.longitudeDegrees, e.longitudeDegrees) / 2);
    const p = polar(middle, 233, asc);
    out.push(`<text x="${p.x.toFixed(3)}" y="${(p.y + 5).toFixed(3)}" text-anchor="middle" font-size="13">${h.number}</text>`);
  }
  const placed = pointLayout(data);
  const pointAnchors = anchors(data, asc);
  if (options.aspects !== false) for (const aspect of data.aspects) {
    const a = pointAnchors.get(aspect.a), b = pointAnchors.get(aspect.b);
    if (a === void 0 || b === void 0) continue;
    const s = aspectSegment(aspect, a, b);
    out.push(`<line class="aspect" data-aspect="${esc(aspect.id)}" x1="${s.start.x.toFixed(3)}" y1="${s.start.y.toFixed(3)}" x2="${s.end.x.toFixed(3)}" y2="${s.end.y.toFixed(3)}"/>`);
  }
  if (options.inner !== void 0) out.push(`<g class="wheel-inner">${options.inner}</g>`);
  for (const p of placed) {
    const point = data.points[p.id], position = point.position.value, at = pointAnchors.get(p.id);
    if (position === null || at === void 0) continue;
    const radius = wheelRadii.pointBase - p.lane * 24;
    out.push(line(p.longitude, wheelRadii.zodiacInner - 3, radius + 16, asc, "leader"));
    out.push(line(p.longitude, wheelRadii.zodiacInner - 10, wheelRadii.zodiacInner + 1, asc, "tick"));
    const asset = assetPath(p.id);
    out.push(`<g class="point" data-point="${p.id}" data-anchor-x="${at.x.toFixed(3)}" data-anchor-y="${at.y.toFixed(3)}">${asset === null ? `<text x="${at.x.toFixed(3)}" y="${(at.y + 8).toFixed(3)}" text-anchor="middle" font-size="20">${esc(pointGlyphs[p.id] ?? titleCase(p.id).slice(0, 2))}</text>` : await image(options.assets, asset.path, pointGlyphs[p.id] ?? "\u2022", at.x, at.y, 29, asset.rotation ?? 0, asset.modifier)}</g>`);
  }
  if (!timed && options.untimedLabel !== false) out.push(`<text x="400" y="400" text-anchor="middle">Birth time unknown \xB7 houses and angles are unavailable</text>`);
  out.push(`</svg>`);
  return out.join("");
};

// src/wheel/render.ts
var svgNamespace = "http://www.w3.org/2000/svg";
var wheelInstance = 0;
var svg = (name) => document.createElementNS(svgNamespace, name);
var addGlyphColourFilter = (root) => {
  const id = `wheelGlyphColour${++wheelInstance}`;
  const definitions = svg("defs");
  const filter = svg("filter");
  filter.id = id;
  filter.setAttribute("x", "-10%");
  filter.setAttribute("y", "-10%");
  filter.setAttribute("width", "120%");
  filter.setAttribute("height", "120%");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  const matrix = svg("feColorMatrix");
  matrix.setAttribute("type", "matrix");
  matrix.setAttribute("values", [
    "0 0 0 0 0.968627451",
    "0 0 0 0 0.952941176",
    "0 0 0 0 1",
    "0 0 0 1 0"
  ].join(" "));
  filter.append(matrix);
  definitions.append(filter);
  root.append(definitions);
  return id;
};
var line2 = (parent, longitude, fromRadius, toRadius, ascendant, className) => {
  const from = polar(longitude, fromRadius, ascendant);
  const to = polar(longitude, toRadius, ascendant);
  const element = svg("line");
  element.setAttribute("x1", String(from.x));
  element.setAttribute("y1", String(from.y));
  element.setAttribute("x2", String(to.x));
  element.setAttribute("y2", String(to.y));
  element.setAttribute("class", className);
  parent.append(element);
  return element;
};
var glyphAsset = (id) => {
  const base = "./assets/astrology-glyphs/svg";
  if (["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(id)) {
    return { path: `${base}/planets/${id}.svg` };
  }
  switch (id) {
    case "ascendant":
    case "descendant":
    case "midheaven":
    case "imum_coeli":
    case "vertex":
    case "east_point":
      return { path: `${base}/angles/${id}.svg` };
    case "antivertex":
      return { path: `${base}/angles/vertex.svg`, rotation: 180 };
    case "north_node_true":
      return { path: `${base}/misc/true_node.svg`, modifier: "N" };
    case "south_node_true":
      return { path: `${base}/misc/true_node.svg`, modifier: "S" };
    case "north_node_mean":
      return { path: `${base}/misc/mean_node.svg`, modifier: "N" };
    case "south_node_mean":
      return { path: `${base}/misc/mean_node.svg`, modifier: "S" };
    case "part_of_fortune":
      return { path: `${base}/points/lot_of_fortune.svg` };
    case "part_of_spirit":
      return { path: `${base}/points/lot_of_spirit.svg` };
    case "lilith_mean":
      return { path: `${base}/points/black_moon_lilith.svg`, modifier: "M" };
    case "lilith_true":
      return { path: `${base}/points/black_moon_lilith.svg`, modifier: "T" };
    default:
      return null;
  }
};
var signAsset = (sign) => `./assets/astrology-glyphs/svg/zodiac/${sign}.svg`;
var addAssetGlyph = (parent, path, fallback, x, y, glyphSize, glyphFilterId, rotation = 0, modifier) => {
  const fallbackText = svg("text");
  fallbackText.textContent = fallback;
  fallbackText.setAttribute("x", String(x));
  fallbackText.setAttribute("y", String(y + glyphSize * 0.32));
  fallbackText.setAttribute("text-anchor", "middle");
  fallbackText.setAttribute("class", "wheel-glyph-fallback");
  fallbackText.setAttribute("font-size", String(glyphSize));
  parent.append(fallbackText);
  const image2 = svg("image");
  image2.setAttribute("href", path);
  image2.setAttribute("x", String(x - glyphSize / 2));
  image2.setAttribute("y", String(y - glyphSize / 2));
  image2.setAttribute("width", String(glyphSize));
  image2.setAttribute("height", String(glyphSize));
  image2.setAttribute("class", "wheel-glyph-image");
  image2.setAttribute("filter", `url(#${glyphFilterId})`);
  if (rotation !== 0) image2.setAttribute("transform", `rotate(${rotation} ${x} ${y})`);
  image2.addEventListener("load", () => {
    fallbackText.style.display = "none";
  }, { once: true });
  image2.addEventListener("error", () => {
    image2.remove();
  }, { once: true });
  parent.append(image2);
  if (modifier !== void 0) {
    const marker = svg("text");
    marker.textContent = modifier;
    marker.setAttribute("x", String(x + glyphSize * 0.42));
    marker.setAttribute("y", String(y - glyphSize * 0.28));
    marker.setAttribute("class", "wheel-glyph-modifier");
    marker.setAttribute("font-size", String(Math.max(8, glyphSize * 0.32)));
    parent.append(marker);
  }
};
var setSegment = (element, segment) => {
  element.setAttribute("x1", segment.start.x.toFixed(3));
  element.setAttribute("y1", segment.start.y.toFixed(3));
  element.setAttribute("x2", segment.end.x.toFixed(3));
  element.setAttribute("y2", segment.end.y.toFixed(3));
};
var renderWheel = (calculation) => {
  const container = document.createElement("section");
  container.className = "chart-wheel";
  container.dataset["fingerprint"] = calculation.fingerprint;
  const graphic = document.createElement("div");
  graphic.className = "chart-wheel-graphic";
  const root = svg("svg");
  root.setAttribute("viewBox", `0 0 ${wheelSize} ${wheelSize}`);
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", "Interactive deterministic natal chart wheel");
  const glyphFilterId = addGlyphColourFilter(root);
  graphic.append(root);
  container.append(graphic);
  const ascendantPosition = calculation.points.ascendant.position.value;
  const ascendant = ascendantPosition?.longitudeDegrees ?? 180;
  const timed = ascendantPosition !== null;
  const frame = svg("circle");
  frame.setAttribute("cx", String(wheelCentre));
  frame.setAttribute("cy", String(wheelCentre));
  frame.setAttribute("r", String(wheelRadii.outer));
  frame.setAttribute("class", "wheel-frame");
  root.append(frame);
  const zodiacGroup = svg("g");
  zodiacGroup.setAttribute("class", "wheel-zodiac");
  root.append(zodiacGroup);
  for (let index = 0; index < signOrder.length; index += 1) {
    const sign = signOrder[index];
    if (sign === void 0) continue;
    const start = index * 30;
    const end = start + 30;
    const sector2 = svg("path");
    sector2.setAttribute("d", sector(start, end, wheelRadii.zodiacInner, wheelRadii.outer, ascendant));
    sector2.setAttribute("class", `wheel-sign wheel-sign-${sign}`);
    sector2.setAttribute("tabindex", "0");
    sector2.dataset["sign"] = sign;
    zodiacGroup.append(sector2);
    const glyphPoint = polar(normalise(start + 15), (wheelRadii.zodiacInner + wheelRadii.outer) / 2, ascendant);
    const glyphGroup = svg("g");
    glyphGroup.setAttribute("class", "wheel-sign-glyph");
    addAssetGlyph(glyphGroup, signAsset(sign), signGlyphs[sign], glyphPoint.x, glyphPoint.y, 31, glyphFilterId);
    zodiacGroup.append(glyphGroup);
  }
  for (let longitude = 0; longitude < 360; longitude += 5) {
    line2(
      root,
      longitude,
      longitude % 30 === 0 ? wheelRadii.outer - 14 : wheelRadii.outer - 7,
      wheelRadii.outer,
      ascendant,
      longitude % 30 === 0 ? "wheel-degree-tick major" : "wheel-degree-tick"
    );
  }
  const houseChart = calculation.houses[calculation.primaryHouseSystem];
  if (timed && houseChart.status !== "unavailable") {
    const houseGroup = svg("g");
    houseGroup.setAttribute("class", "wheel-houses");
    root.append(houseGroup);
    for (const house of Object.values(houseChart.houses)) {
      const cusp = house.cusp.value;
      const end = house.end.value;
      if (cusp === null || end === null) continue;
      const sector2 = svg("path");
      sector2.setAttribute("d", sector(cusp.longitudeDegrees, end.longitudeDegrees, wheelRadii.aspect, wheelRadii.zodiacInner, ascendant));
      sector2.setAttribute("class", "wheel-house-sector");
      sector2.setAttribute("tabindex", "0");
      sector2.dataset["house"] = String(house.number);
      houseGroup.append(sector2);
      line2(
        houseGroup,
        cusp.longitudeDegrees,
        wheelRadii.aspect,
        wheelRadii.zodiacInner,
        ascendant,
        [1, 4, 7, 10].includes(house.number) ? "wheel-house-cusp angular" : "wheel-house-cusp"
      );
      const middle = normalise(cusp.longitudeDegrees + forward(cusp.longitudeDegrees, end.longitudeDegrees) / 2);
      const labelPoint = polar(middle, 233, ascendant);
      const label = svg("text");
      label.textContent = String(house.number);
      label.setAttribute("x", String(labelPoint.x));
      label.setAttribute("y", String(labelPoint.y + 5));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "wheel-house-number");
      houseGroup.append(label);
    }
  }
  const placedPoints = pointLayout(calculation);
  const pointAnchors = /* @__PURE__ */ new Map();
  for (const placed of placedPoints) {
    const radius = wheelRadii.pointBase - placed.lane * 24;
    pointAnchors.set(placed.id, polar(placed.longitude, radius, ascendant));
  }
  const aspects = svg("g");
  aspects.setAttribute("class", "wheel-aspects");
  root.append(aspects);
  for (const aspect of calculation.aspects) {
    const startAnchor = pointAnchors.get(aspect.a);
    const endAnchor = pointAnchors.get(aspect.b);
    if (startAnchor === void 0 || endAnchor === void 0) continue;
    const segment = aspectSegment(aspect, startAnchor, endAnchor);
    const visible = svg("line");
    setSegment(visible, segment);
    visible.setAttribute("class", `wheel-aspect wheel-aspect-${aspect.character} ${aspect.class}${aspect.kind === "conjunction" ? " wheel-aspect-conjunction-marker" : ""}`);
    visible.dataset["aspect"] = aspect.id;
    visible.dataset["aspectKind"] = aspect.kind;
    visible.dataset["endpointA"] = aspect.a;
    visible.dataset["endpointB"] = aspect.b;
    aspects.append(visible);
    const hit = svg("line");
    setSegment(hit, segment);
    hit.setAttribute("class", "wheel-aspect-hit");
    hit.setAttribute("tabindex", "0");
    hit.dataset["aspect"] = aspect.id;
    hit.dataset["aspectKind"] = aspect.kind;
    hit.dataset["endpointA"] = aspect.a;
    hit.dataset["endpointB"] = aspect.b;
    aspects.append(hit);
  }
  const pointGroup = svg("g");
  pointGroup.setAttribute("class", "wheel-points");
  root.append(pointGroup);
  for (const placed of placedPoints) {
    const point = calculation.points[placed.id];
    const position = point.position.value;
    const location = pointAnchors.get(placed.id);
    if (position === null || location === void 0) continue;
    const radius = wheelRadii.pointBase - placed.lane * 24;
    line2(pointGroup, placed.longitude, wheelRadii.zodiacInner - 3, radius + 16, ascendant, "wheel-point-leader");
    line2(pointGroup, placed.longitude, wheelRadii.zodiacInner - 10, wheelRadii.zodiacInner + 1, ascendant, "wheel-point-tick");
    const group = svg("g");
    group.setAttribute("class", "wheel-point");
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.dataset["point"] = placed.id;
    group.dataset["anchorX"] = location.x.toFixed(3);
    group.dataset["anchorY"] = location.y.toFixed(3);
    const asset = glyphAsset(placed.id);
    if (asset === null) {
      const fallback = svg("text");
      fallback.textContent = pointGlyphs[placed.id] ?? titleCase(placed.id).slice(0, 2);
      fallback.setAttribute("x", String(location.x));
      fallback.setAttribute("y", String(location.y + 8));
      fallback.setAttribute("text-anchor", "middle");
      fallback.setAttribute("class", "wheel-point-text");
      group.append(fallback);
    } else {
      addAssetGlyph(group, asset.path, pointGlyphs[placed.id] ?? "\u2022", location.x, location.y, 29, glyphFilterId, asset.rotation ?? 0, asset.modifier);
    }
    pointGroup.append(group);
  }
  if (!timed) {
    const notice = svg("text");
    notice.textContent = "Birth time unknown \xB7 houses and angles are unavailable";
    notice.setAttribute("x", String(wheelCentre));
    notice.setAttribute("y", String(wheelCentre));
    notice.setAttribute("text-anchor", "middle");
    notice.setAttribute("class", "wheel-untimed-note");
    root.append(notice);
  }
  return container;
};

// src/wheel/glyphs.ts
var glyphBase = "./assets/astrology-glyphs/svg/misc";
var pointGlyphBase = "./assets/astrology-glyphs/svg/points";
var svgNamespace2 = "http://www.w3.org/2000/svg";
var canonicalNodeGlyphs = {
  north_node_true: { path: `${glyphBase}/true_node.svg`, modifier: "N", fallback: "TN" },
  south_node_true: { path: `${glyphBase}/true_node.svg`, modifier: "S", fallback: "TS" },
  north_node_mean: { path: `${glyphBase}/mean_node.svg`, modifier: "N", fallback: "MN" },
  south_node_mean: { path: `${glyphBase}/mean_node.svg`, modifier: "S", fallback: "MS" }
};
var applyNodeGlyph = (pointId, glyph, wheel) => {
  const point = wheel.querySelector(`.wheel-point[data-point="${pointId}"]`);
  if (point === null) return;
  const fallback = point.querySelector(".wheel-glyph-fallback, .wheel-point-text");
  if (fallback !== null) fallback.textContent = glyph.fallback;
  const image2 = point.querySelector("image.wheel-glyph-image");
  if (image2 === null) return;
  image2.setAttribute("href", glyph.path);
  image2.removeAttribute("transform");
  point.querySelector(".wheel-glyph-modifier")?.remove();
  const x = Number(image2.getAttribute("x") ?? 0);
  const y = Number(image2.getAttribute("y") ?? 0);
  const width = Number(image2.getAttribute("width") ?? 29);
  const height = Number(image2.getAttribute("height") ?? 29);
  const centreX = x + width / 2;
  const centreY = y + height / 2;
  const marker = document.createElementNS(svgNamespace2, "text");
  marker.textContent = glyph.modifier;
  marker.setAttribute("x", String(centreX + width * 0.42));
  marker.setAttribute("y", String(centreY - height * 0.28));
  marker.setAttribute("class", "wheel-glyph-modifier wheel-node-direction");
  marker.setAttribute("font-size", String(Math.max(8, width * 0.32)));
  point.append(marker);
};
var applySpiritGlyph = (wheel) => {
  const point = wheel.querySelector('.wheel-point[data-point="part_of_spirit"]');
  if (point === null) return;
  const fallback = point.querySelector(".wheel-point-text");
  if (fallback === null) return;
  fallback.textContent = "\u03A6";
  const existing = point.querySelector("image.wheel-glyph-image");
  if (existing !== null) {
    existing.setAttribute("href", `${pointGlyphBase}/lot_of_spirit.svg`);
    return;
  }
  const x = Number(fallback.getAttribute("x") ?? 0);
  const y = Number(fallback.getAttribute("y") ?? 0) - 8;
  const glyphSize = 29;
  const image2 = document.createElementNS(svgNamespace2, "image");
  image2.setAttribute("href", `${pointGlyphBase}/lot_of_spirit.svg`);
  image2.setAttribute("x", String(x - glyphSize / 2));
  image2.setAttribute("y", String(y - glyphSize / 2));
  image2.setAttribute("width", String(glyphSize));
  image2.setAttribute("height", String(glyphSize));
  image2.setAttribute("class", "wheel-glyph-image");
  image2.addEventListener("load", () => {
    fallback.style.display = "none";
  }, { once: true });
  image2.addEventListener("error", () => {
    image2.remove();
  }, { once: true });
  point.append(image2);
};
var applyCanonicalWheelGlyphs = (wheel) => {
  for (const [pointId, glyph] of Object.entries(canonicalNodeGlyphs)) {
    applyNodeGlyph(pointId, glyph, wheel);
  }
  applySpiritGlyph(wheel);
};

// src/wheel/visibility.ts
var pointElement = (wheel, pointId) => wheel.querySelector(`.wheel-point[data-point="${pointId}"]`);
function setChartWheelPointVisibility(wheel, pointId, visible) {
  const point = pointElement(wheel, pointId);
  if (point === null) return;
  point.style.display = visible ? "" : "none";
  point.setAttribute("aria-hidden", String(!visible));
  point.setAttribute("tabindex", visible ? "0" : "-1");
  if (!visible) {
    point.classList.remove("is-active", "wheel-tooltip-active", "wheel-tooltip-endpoint");
  }
}
function setChartWheelPointsVisibility(wheel, visibility) {
  for (const [rawPointId, visible] of Object.entries(visibility)) {
    if (visible === void 0) continue;
    setChartWheelPointVisibility(wheel, rawPointId, visible);
  }
}

// src/wheel/public.ts
var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var selectedHouses = (meta) => Object.fromEntries(numbers.map((number) => {
  const source = meta.houses.houses[String(number)];
  return [String(number), source === void 0 ? { number, cusp: { value: null }, end: { value: null } } : {
    number,
    cusp: { value: source.cuspLongitudeDegrees === null ? null : { longitudeDegrees: source.cuspLongitudeDegrees } },
    end: { value: source.endLongitudeDegrees === null ? null : { longitudeDegrees: source.endLongitudeDegrees } }
  }];
}));
var fromPublic = (meta) => {
  const points = emptyWheelPoints();
  for (const [id, longitudeDegrees] of Object.entries(meta.points)) {
    points[id] = {
      position: { value: longitudeDegrees === null ? null : { longitudeDegrees } }
    };
  }
  const houses = {
    placidus: emptyWheelHouseChart(),
    whole_sign: emptyWheelHouseChart(),
    equal: emptyWheelHouseChart(),
    porphyry: emptyWheelHouseChart()
  };
  houses[meta.primaryHouseSystem] = {
    status: meta.houses.status,
    houses: meta.houses.status === "unavailable" ? emptyWheelHouses() : selectedHouses(meta)
  };
  return {
    fingerprint: meta.calculationFingerprint,
    primaryHouseSystem: meta.primaryHouseSystem,
    points,
    houses,
    aspects: meta.aspects.map((aspect) => ({ ...aspect }))
  };
};
var renderPublicWheel = (meta) => renderWheel(fromPublic(meta));
export {
  anchors,
  applyCanonicalWheelGlyphs,
  aspectSegment,
  emptyWheelData,
  emptyWheelHouseChart,
  emptyWheelHouses,
  emptyWheelPoints,
  forward,
  fromPublic,
  normalise,
  pointGlyphs,
  pointLayout,
  polar,
  renderPublicWheel,
  renderSvg,
  renderWheel,
  sector,
  setChartWheelPointVisibility,
  setChartWheelPointsVisibility,
  signGlyphs,
  signOrder,
  titleCase,
  wheelCentre,
  wheelData,
  wheelRadii,
  wheelSize
};
//# sourceMappingURL=wheel.js.map
