import { build } from "esbuild";

const aliases = {
  "@js-joda/core": "./vendor/time/packages/core/dist/js-joda.esm.js",
  "@js-joda/timezone": "./vendor/time/packages/timezone/dist/js-joda-timezone.esm.js",
};

const shared = {
  bundle: true,
  format: "esm",
  mainFields: ["module", "main"],
  sourcemap: true,
  logLevel: "info",
};

await build({
  ...shared,
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  platform: "node",
  target: "node22",
  alias: aliases,
});

await build({
  ...shared,
  entryPoints: ["src/web.ts"],
  outfile: "dist/web.js",
  platform: "browser",
  target: "es2023",
  alias: aliases,
});

await build({
  ...shared,
  entryPoints: ["src/wheel/index.ts"],
  outfile: "dist/wheel.js",
  platform: "browser",
  target: "es2023",
});
