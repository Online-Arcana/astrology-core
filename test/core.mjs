import assert from "node:assert/strict";
import {
  calc,
  loadPorts,
  randomChart,
  renderSvg,
  wheelData,
} from "../dist/index.js";

const rng = (() => {
  let state = 0x51a7c0de;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
})();

const options = { zodiac: "tropical", ayanamsha: "lahiri" };
const chart = await randomChart(options, rng);

assert.equal(chart.schema, "astral-core/1.0.0");
assert.equal(chart.system.zodiac, "tropical");
assert.notEqual(chart.system.points.ascendant.position.value, null);
assert.notEqual(chart.system.points.midheaven.position.value, null);
assert.ok(chart.system.aspects.length > 0);

const ports = await loadPorts("0.1.0-test");
const repeated = await calc({
  date: chart.birth.date,
  time: chart.birth.time,
  timeAccuracy: chart.birth.timeAccuracy,
  placeId: chart.place.id,
}, options, ports);
assert.equal(
  repeated.provenance.calculationFingerprint,
  chart.provenance.calculationFingerprint,
  "the same deterministic input must keep the same calculation fingerprint",
);

const data = wheelData(chart);
const inner = '<g id="test-inner"><circle cx="400" cy="400" r="10"/></g>';
const identiconShell = await renderSvg(data, { aspects: false, inner });
assert.equal((identiconShell.match(/<path class="zodiac"/gu) ?? []).length, 12);
assert.ok(identiconShell.includes('data-point="sun"'));
assert.ok(identiconShell.includes('id="test-inner"'));
assert.ok(!identiconShell.includes('<line class="aspect"'));

const normalWheel = await renderSvg(data);
assert.ok(normalWheel.includes('<line class="aspect"'));
assert.ok(!normalWheel.includes('id="test-inner"'));

console.log("astral-core regression tests passed");
