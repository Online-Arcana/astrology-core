import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
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
  sourcemap: true,
  logLevel: "info",
});
