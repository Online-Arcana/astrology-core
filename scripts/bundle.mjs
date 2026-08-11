import { build } from "esbuild";

const aliases = {
  "@js-joda/core": "./vendor/time/packages/core/dist/js-joda.esm.js",
  "@js-joda/timezone": "./vendor/time/packages/timezone/dist/js-joda-timezone.esm.js",
};

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  mainFields: ["module", "main"],
  alias: aliases,
  sourcemap: true,
  logLevel: "info",
});

await build({
  entryPoints: ["src/wheel/index.ts"],
  outfile: "dist/wheel.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2023",
  mainFields: ["module", "main"],
  sourcemap: true,
  logLevel: "info",
});
