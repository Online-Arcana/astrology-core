import { renderAstralIdenticonV10 as renderBaseV10 } from "./identiconV10.js";
import { v9InnerClipRadius } from "./identiconV9Geometry.js";
const canvas = 800;
const centre = canvas / 2;
const pointBaseRadius = 286;
const overlayRadius = pointBaseRadius - 14;
const overlayScale = overlayRadius / v9InnerClipRadius;
const calibrationRadius = 389;
const calibrationLevels = [6, 1, 5, 2, 4, 3, 6, 3, 4, 2, 5, 1];
const baseSizes = [13, 15, 17, 19, 21, 23];
const fading = [0.44, 0.55, 0.66, 0.77, 0.88, 1];
function starPoints(x, y, size) {
    const outer = size / 2;
    const inner = outer * 0.34;
    const points = [];
    for (let index = 0; index < 16; index += 1) {
        const radius = index % 2 === 0 ? outer : inner;
        const angle = (-90 + index * 22.5) * Math.PI / 180;
        points.push(`${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`);
    }
    return points.join(" ");
}
function calibrationStarsLayer(colour) {
    const stars = calibrationLevels.map((rawLevel, index) => {
        const level = rawLevel - 1;
        const angleDegrees = index * 30;
        const angle = (angleDegrees - 90) * Math.PI / 180;
        const x = centre + Math.cos(angle) * calibrationRadius;
        const y = centre + Math.sin(angle) * calibrationRadius;
        const size = baseSizes[level] * overlayScale;
        const opacity = fading[level];
        const name = index === 0
            ? "north-star-reference"
            : index === 6
                ? "south-star-reference"
                : `calibration-star-reference-${index}`;
        const position = index === 0
            ? "north"
            : index === 6
                ? "south"
                : `${angleDegrees}-degrees`;
        return `<g id="${name}" data-recognition-role="circumference-size-fading-reference" data-reference-index="${index}" data-reference-position="${position}" data-reference-angle="${angleDegrees}" data-reference-level="${rawLevel}" data-reference-size="${size.toFixed(6)}" data-reference-fading="${opacity}" data-code-colour="parity-star-foreground" opacity="${opacity}">
      <polygon points="${starPoints(x, y, size)}" fill="${colour}" data-calibration-reference="true"/>
    </g>`;
    }).join("\n");
    return `<g id="calibration-stars-v10" data-recognition-role="twelve-fixed-star-references" data-size-calibration="true" data-fading-calibration="true" data-calibration-radius="${calibrationRadius}" data-calibration-pattern="${calibrationLevels.join(",")}">
    ${stars}
  </g>`;
}
export async function renderAstralIdenticonV10(request, assets) {
    const source = await renderBaseV10(request, assets);
    const calibration = calibrationStarsLayer(request.palette.layer1);
    return source.replace("</svg>", `  ${calibration}\n</svg>`);
}
//# sourceMappingURL=identiconV10Calibration.js.map