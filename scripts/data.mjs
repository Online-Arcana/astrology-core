import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("vendor/places/packages/countries/dist/data");
const output = resolve("data/places");
const finalCode = (name) => name.split("-").at(-1) ?? "";

const manifest = async () => {
  const countries = {};
  const states = {};
  for (const item of await readdir(source, { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    const country = finalCode(item.name).toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) continue;
    countries[country] = item.name;
    states[country] = {};
    for (const region of await readdir(resolve(source, item.name), { withFileTypes: true })) {
      if (!region.isDirectory()) continue;
      const code = finalCode(region.name).toUpperCase();
      if (/^[A-Z0-9-]+$/.test(code)) states[country][code] = region.name;
    }
  }
  return { schema: "astral-browser-places/1.0.0", countries, states };
};

await rm(output, { recursive: true, force: true });
await mkdir(resolve("data"), { recursive: true });
await cp(source, resolve(output, "data"), { recursive: true });
await writeFile(resolve(output, "manifest.json"), `${JSON.stringify(await manifest())}\n`, "utf8");
