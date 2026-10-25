import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

// OpenNext copies local .env files into its Worker output. Only public site
// settings belong in this bundle; runtime secrets must use Cloudflare bindings.
const filename = path.resolve(".open-next/cloudflare/next-env.mjs");
const environments = await import(pathToFileURL(filename).href);
const output = ["production", "development", "test"].map((mode) => {
  const publicValues = Object.fromEntries(
    Object.entries(environments[mode]).filter(([key]) => key.startsWith("NEXT_PUBLIC_")),
  );
  publicValues.NEXT_PUBLIC_DEPLOYMENT_STAGE = "preview";
  delete publicValues.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return `export const ${mode} = ${JSON.stringify(publicValues)};`;
});
await writeFile(filename, `${output.join("\n")}\n`);
console.log("Cloudflare preview bundle contains only public environment settings.");
