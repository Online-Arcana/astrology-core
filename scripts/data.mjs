import { cp, mkdir, rm } from "node:fs/promises";

await rm("data/places", { recursive: true, force: true });
await mkdir("data", { recursive: true });
await cp("vendor/places/packages/countries/dist/data", "data/places", { recursive: true });
